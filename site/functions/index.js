/**
 * Tri-Cloud Lab backend (Firebase Cloud Functions v2, Node 22).
 *
 *  ai            POST /api/ai — streams Claude answers to the signed-in owner only
 *  dailyUpdates  07:46 Europe/London — researches Salesforce news with web search, writes /updates
 *  weeklyReport  Sundays 17:55 Europe/London — summarises the week into data/users/<uid>/weekly-<date>
 *
 * Secrets/params: ANTHROPIC_API_KEY (secret), ALLOWED_EMAIL (functions/.env).
 */
const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret, defineString } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY');
const ALLOWED_EMAIL = defineString('ALLOWED_EMAIL');
const REGION = 'europe-west2';

const MODELS = { quick: 'claude-haiku-4-5-20251001', default: 'claude-sonnet-5-5', complex: 'claude-opus-5-5' };
const DAILY_AI_LIMIT = 300;          // protects your API spend
const MAX_INPUT_CHARS = 250000;
const WEB_SEARCH_TOOL = { type: 'web_search_20260318', name: 'web_search', max_uses: 8 };

const londonDate = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(d);

/* ---------------- helpers ---------------- */
async function verifyOwner(req) {
  const m = (req.get('Authorization') || '').match(/^Bearer (.+)$/);
  if (!m) return null;
  try {
    const t = await admin.auth().verifyIdToken(m[1]);
    const allowed = ALLOWED_EMAIL.value().trim().toLowerCase();
    if (t.email && t.email.toLowerCase() === allowed && t.email_verified) return t;
  } catch (e) { logger.warn('token verification failed', e.message); }
  return null;
}

async function countUsage(uid) {
  const ref = db.doc(`usage/${uid}_${londonDate()}`);
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const n = (snap.exists ? snap.data().n : 0) + 1;
    tx.set(ref, { n, at: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return n;
  });
}

/** Accepts a prompt string or [{role, content}] turns; returns valid alternating messages. */
function toMessages(input) {
  const turns = typeof input === 'string' ? [{ role: 'user', content: input }]
    : Array.isArray(input) ? input.filter(t => t && (t.role === 'user' || t.role === 'assistant') && String(t.content || '').trim()) : [];
  const merged = [];
  for (const t of turns) {
    const content = String(t.content);
    if (merged.length && merged[merged.length - 1].role === t.role) merged[merged.length - 1].content += '\n\n' + content;
    else merged.push({ role: t.role, content });
  }
  while (merged.length && merged[0].role !== 'user') merged.shift();
  while (merged.length && merged[merged.length - 1].role !== 'user') merged.pop();
  return merged;
}

async function callClaude(body, apiKey) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`Anthropic API ${r.status}: ${(await r.text()).slice(0, 500)}`);
  return r;
}

/** Runs a (possibly tool-using) conversation to completion and returns the final text. */
async function runToCompletion(body, apiKey) {
  const messages = [...body.messages];
  let text = '';
  for (let i = 0; i < 6; i++) {
    const r = await callClaude({ ...body, messages }, apiKey);
    const msg = await r.json();
    text = (msg.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    if (msg.stop_reason !== 'pause_turn') return text;
    messages.push({ role: 'assistant', content: msg.content }); // let the server tool continue
  }
  return text;
}

function parseJson(text) {
  const tryParse = s => { try { return JSON.parse(s); } catch (e) { return undefined; } };
  let v = tryParse(text.trim());
  if (v === undefined) { const m = text.match(/```(?:json)?\s*([\s\S]*?)```/); if (m) v = tryParse(m[1]); }
  if (v === undefined) { const a = text.indexOf('{'), b = text.lastIndexOf('}'); if (a >= 0 && b > a) v = tryParse(text.slice(a, b + 1)); }
  return v;
}

const SYSTEM = 'You are the AI assistant inside a private Salesforce learning and interview-preparation portal. Follow the instructions in the user turn. Use British English. Never invent Salesforce features, limits or dates; say when you are unsure.';

/* ---------------- /api/ai ---------------- */
exports.ai = onRequest({ region: REGION, secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 300, memory: '256MiB', maxInstances: 3 }, async (req, res) => {
  if (req.method !== 'POST') { res.status(405).send('Method not allowed'); return; }
  const user = await verifyOwner(req);
  if (!user) { res.status(403).send('Not authorised'); return; }
  if ((await countUsage(user.uid)) > DAILY_AI_LIMIT) { res.status(429).send('Daily AI limit reached'); return; }

  const { input, modelTier } = req.body || {};
  const messages = toMessages(input);
  if (!messages.length) { res.status(400).send('Empty input'); return; }
  if (JSON.stringify(messages).length > MAX_INPUT_CHARS) { res.status(413).send('Input too large'); return; }

  let upstream;
  try {
    upstream = await callClaude({ model: MODELS[modelTier] || MODELS.default, max_tokens: 8000, system: SYSTEM, messages, stream: true }, ANTHROPIC_API_KEY.value());
  } catch (e) { logger.error(e); res.status(502).send('AI service error'); return; }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  const reader = upstream.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        let evt; try { evt = JSON.parse(line.slice(5)); } catch (e) { continue; }
        if (evt.type === 'content_block_delta' && evt.delta && evt.delta.type === 'text_delta') res.write(evt.delta.text);
        else if (evt.type === 'error') res.write('\u0000ERR:' + ((evt.error && evt.error.message) || 'stream error'));
      }
    }
  } catch (e) { logger.error(e); res.write('\u0000ERR:stream interrupted'); }
  res.end();
});

/* ---------------- daily Salesforce updates ---------------- */
exports.dailyUpdates = onSchedule({ schedule: '46 7 * * *', timeZone: 'Europe/London', region: REGION, secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 540, memory: '512MiB' }, async () => {
  const today = londonDate();
  const existing = (await db.collection('updates').select().get()).docs.map(d => d.id);
  const prompt = `Today is ${today}. You are preparing Salesforce updates for a developer studying Data 360 (formerly Data Cloud), Revenue Cloud (Revenue Lifecycle Management / Revenue Management), Agentforce and the core platform (Apex, triggers, async Apex, SOQL, LWC, integration, Flow, platform events, security, Sales Cloud, Service Cloud, Salesforce CPQ) for interviews.

Search the web for what Salesforce released, announced, documented or changed in roughly the last 48 hours (widen to 7 days if little happened): release notes, Trailhead release highlights, the Salesforce Developers blog, the Salesforce newsroom, Agentforce/Data 360/Revenue Cloud docs, Salesforce Ben, Apex Hours and other reputable sources. Prefer official sources. Never invent features, dates or statuses. Skip marketing fluff.

Choose 3–8 relevant NEW items plus exactly one "Dev topic of the day" (cloud "topic") — a concept worth understanding, preferably tied to something recent. Write in your own words (no copied sentences), British English.

Do not reuse these existing ids: ${existing.slice(-300).join(', ') || '(none)'}

Reply with only JSON: {"items":[{"id":"YYYY-MM-DD-short-slug","date":"YYYY-MM-DD (date of the release/announcement)","cloud":"dc|rc|af|dev|platform|topic","status":"GA|Beta|Pilot|Developer preview|Announced|Release update|Docs","title":"under 90 chars","summary":"2-4 sentences","dev":"1-3 sentences on why it matters for a developer","src":["Source title","https://..."],"body":"topic item only: 200-350 word mini-lesson, paragraphs separated by blank lines, ending with a paragraph starting 'Interview answer:'"}]}`;
  const text = await runToCompletion({ model: MODELS.default, max_tokens: 12000, system: SYSTEM, tools: [WEB_SEARCH_TOOL], messages: [{ role: 'user', content: prompt }] }, ANTHROPIC_API_KEY.value());
  const parsed = parseJson(text);
  const items = (parsed && Array.isArray(parsed.items) ? parsed.items : [])
    .filter(u => u && /^[A-Za-z0-9-]{6,120}$/.test(String(u.id)) && u.title && !existing.includes(u.id))
    .slice(0, 9);
  const batch = db.batch();
  for (const u of items) {
    batch.set(db.doc(`updates/${u.id}`), {
      id: String(u.id), date: String(u.date || today).slice(0, 10), cloud: String(u.cloud || 'platform').slice(0, 20),
      status: String(u.status || '').slice(0, 40), title: String(u.title).slice(0, 200), summary: String(u.summary || '').slice(0, 1500),
      dev: String(u.dev || '').slice(0, 1500), body: u.body ? String(u.body).slice(0, 6000) : '',
      src: Array.isArray(u.src) && u.src.length === 2 && /^https?:\/\//.test(u.src[1]) ? [String(u.src[0]).slice(0, 200), String(u.src[1]).slice(0, 500)] : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  if (items.length) await batch.commit();
  logger.info(`dailyUpdates wrote ${items.length} items`);
});

/* ---------------- weekly report ---------------- */
function weekStats(p, c) {
  const days = [...Array(7)].map((_, i) => londonDate(new Date(Date.now() - i * 86400000)));
  const secs = days.reduce((s, d) => s + ((p.log || {})[d] || 0), 0);
  const isWeekend = d => [0, 6].includes(new Date(d + 'T12:00:00Z').getUTCDay());
  const st = p.settings || {};
  const target = days.reduce((s, d) => s + (isWeekend(d) ? (st.weekendH || 4.5) : (st.weekdayH || 2.5)) * 3600, 0);
  let streak = 0; let i = ((p.log || {})[days[0]] || 0) >= 900 ? 0 : 1;
  for (; ; i++) { const d = londonDate(new Date(Date.now() - i * 86400000)); if (((p.log || {})[d] || 0) >= 900) streak++; else break; if (i > 400) break; }
  const cards = days.reduce((a, d) => { const x = (p.cardDay || {})[d] || {}; a.rev += x.rev || 0; a.again += x.again || 0; return a; }, { rev: 0, again: 0 });
  const mocks = (c.mocks || []).filter(m => days.includes(m.date)).map(m => ({ date: m.date, overall: m.overall, gaps: m.gaps }));
  const weak = Object.entries(p.areaScore || {}).filter(([, v]) => v.n >= 3).sort((a, b) => a[1].fc - b[1].fc).slice(0, 3).map(([k, v]) => `${k}: ${Math.round(v.fc * 100)}%`);
  const in14 = londonDate(new Date(Date.now() + 14 * 86400000));
  const interviews = (c.jobs || []).filter(j => j.nextAt && j.nextAt.slice(0, 10) >= days[0] && j.nextAt.slice(0, 10) <= in14).map(j => `${j.company} (${j.stage}) on ${j.nextAt.slice(0, 10)}`);
  const exams = (p.certs || []).filter(x => x.date && x.status !== 'Passed').map(x => `${x.name} on ${x.date}`);
  const start = st.startDate ? new Date(st.startDate + 'T00:00:00Z') : null;
  const planDay = start ? Math.max(1, Math.round((Date.now() - start) / 86400000) + 1) : null;
  return { hours: +(secs / 3600).toFixed(1), targetHours: +(target / 3600).toFixed(1), streak, cards, mocks, drills: days.filter(d => (p.drill || {})[d]).length,
    lessonsDone: Object.values(p.lessons || {}).filter(Boolean).length, planDay, weakAreas: weak, interviews, exams, stories: (c.stars || []).length };
}

exports.weeklyReport = onSchedule({ schedule: '55 17 * * 0', timeZone: 'Europe/London', region: REGION, secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 300 }, async () => {
  const user = await admin.auth().getUserByEmail(ALLOWED_EMAIL.value().trim());
  const base = `data/users/${user.uid}`;
  const [ps, cs] = await Promise.all([db.doc(`${base}/progress`).get(), db.doc(`${base}/content`).get()]);
  const parse = s => { try { return JSON.parse((s.exists && s.data().json) || '{}'); } catch (e) { return {}; } };
  const stats = weekStats(parse(ps), parse(cs));
  const prompt = `Write a weekly study report (150–250 words, plain text, short lines, British English, encouraging but honest) for someone preparing for Salesforce developer/architect interviews. Sections: a headline; This week (numbers); Weak spots; Coming up; Next week's focus (3 concrete actions using the portal sections Today, Flashcards, Mock Interview, Interview Prep, Career). If there was no study, say so kindly and suggest one small first step. Use only these facts:\n${JSON.stringify(stats, null, 2)}`;
  const text = await runToCompletion({ model: MODELS.default, max_tokens: 1500, system: SYSTEM, messages: [{ role: 'user', content: prompt }] }, ANTHROPIC_API_KEY.value());
  const date = londonDate();
  await db.doc(`${base}/weekly-${date}`).set({ date, text, stats });
  logger.info('weeklyReport written', date);
});
