/**
 * Tri-Cloud Lab backend (Firebase Cloud Functions v2, Node 22) — powered by the Google Gemini API (free tier).
 *
 *  ai            POST /api/ai — streams Gemini answers to the signed-in owner only
 *  dailyUpdates  07:46 Europe/London — reads Salesforce RSS feeds, Gemini summarises new posts into /updates
 *  weeklyReport  Sundays 17:55 Europe/London — summarises the week into data/users/<uid>/weekly-<date>
 *
 * Secrets/params: GEMINI_API_KEY (secret), ALLOWED_EMAIL (functions/.env),
 * optional GEMINI_MODEL / GEMINI_MODEL_QUICK in functions/.env to change models.
 */
const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret, defineString } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const ALLOWED_EMAIL = defineString('ALLOWED_EMAIL');
const GEMINI_MODEL = defineString('GEMINI_MODEL', { default: 'gemini-3.8-flash' });
const GEMINI_MODEL_QUICK = defineString('GEMINI_MODEL_QUICK', { default: 'gemini-3.5-flash-lite' });
const REGION = 'europe-west2';
const API = 'https://generativelanguage.googleapis.com/v1beta/models/';

const DAILY_AI_LIMIT = 300;          // stays well inside free-tier limits
const MAX_INPUT_CHARS = 250000;

// Public RSS feeds used for the daily Salesforce updates (no paid search needed).
const FEEDS = [
  ['Salesforce Developers Blog', 'https://developer.salesforce.com/blogs/feed'],
  ['Salesforce Ben', 'https://www.salesforceben.com/feed/'],
  ['Salesforce Admins Blog', 'https://admin.salesforce.com/feed'],
  ['Apex Hours', 'https://www.apexhours.com/feed/'],
  ['Salesforce Newsroom', 'https://www.salesforce.com/news/feed/']
];

const londonDate = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(d);
const modelFor = tier => (tier === 'quick' ? GEMINI_MODEL_QUICK.value() : GEMINI_MODEL.value());

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

/** Prompt string or [{role:'user'|'assistant', content}] → Gemini `contents` (roles user/model, alternating). */
function toContents(input) {
  const turns = typeof input === 'string' ? [{ role: 'user', content: input }]
    : Array.isArray(input) ? input.filter(t => t && (t.role === 'user' || t.role === 'assistant') && String(t.content || '').trim()) : [];
  const merged = [];
  for (const t of turns) {
    const role = t.role === 'assistant' ? 'model' : 'user';
    const text = String(t.content);
    if (merged.length && merged[merged.length - 1].role === role) merged[merged.length - 1].parts[0].text += '\n\n' + text;
    else merged.push({ role, parts: [{ text }] });
  }
  while (merged.length && merged[0].role !== 'user') merged.shift();
  while (merged.length && merged[merged.length - 1].role !== 'user') merged.pop();
  return merged;
}

const SYSTEM = 'You are the AI assistant inside a private Salesforce learning and interview-preparation portal. Follow the instructions in the user turn. Use British English. Never invent Salesforce features, limits or dates; say when you are unsure.';

function geminiBody(contents, { maxOutputTokens = 8192, json = false } = {}) {
  const generationConfig = { maxOutputTokens };
  if (json) generationConfig.responseMimeType = 'application/json';
  return { systemInstruction: { parts: [{ text: SYSTEM }] }, contents, generationConfig };
}

async function gemini(model, body, apiKey, stream) {
  const url = API + encodeURIComponent(model) + (stream ? ':streamGenerateContent?alt=sse' : ':generateContent');
  const r = await fetch(url, { method: 'POST', headers: { 'x-goog-api-key': apiKey, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { const err = new Error(`Gemini API ${r.status}: ${(await r.text()).slice(0, 500)}`); err.status = r.status; throw err; }
  return r;
}

const textOf = obj => ((((obj || {}).candidates || [])[0] || {}).content || {}).parts?.filter(p => !p.thought).map(p => p.text || '').join('') || '';

async function generateText(prompt, apiKey, opts = {}) {
  const r = await gemini(opts.model || GEMINI_MODEL.value(), geminiBody([{ role: 'user', parts: [{ text: prompt }] }], opts), apiKey, false);
  return textOf(await r.json());
}

function parseJson(text) {
  const tryParse = s => { try { return JSON.parse(s); } catch (e) { return undefined; } };
  let v = tryParse(text.trim());
  if (v === undefined) { const m = text.match(/```(?:json)?\s*([\s\S]*?)```/); if (m) v = tryParse(m[1]); }
  if (v === undefined) { const a = text.indexOf('{'), b = text.lastIndexOf('}'); if (a >= 0 && b > a) v = tryParse(text.slice(a, b + 1)); }
  return v;
}

/* ---------------- /api/ai ---------------- */
exports.ai = onRequest({ region: REGION, secrets: [GEMINI_API_KEY], timeoutSeconds: 300, memory: '256MiB', maxInstances: 3 }, async (req, res) => {
  if (req.method !== 'POST') { res.status(405).send('Method not allowed'); return; }
  const user = await verifyOwner(req);
  if (!user) { res.status(403).send('Not authorised'); return; }
  if ((await countUsage(user.uid)) > DAILY_AI_LIMIT) { res.status(429).send('Daily AI limit reached'); return; }

  const { input, modelTier } = req.body || {};
  const contents = toContents(input);
  if (!contents.length) { res.status(400).send('Empty input'); return; }
  if (JSON.stringify(contents).length > MAX_INPUT_CHARS) { res.status(413).send('Input too large'); return; }

  let upstream;
  try { upstream = await gemini(modelFor(modelTier), geminiBody(contents), GEMINI_API_KEY.value(), true); }
  catch (e) { logger.error(e.message); res.status(e.status === 429 ? 429 : 502).send(e.status === 429 ? 'Free-tier limit reached — try again shortly' : 'AI service error'); return; }

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
        if (evt.error) { res.write('\u0000ERR:' + (evt.error.message || 'stream error')); continue; }
        const t = textOf(evt); if (t) res.write(t);
      }
    }
  } catch (e) { logger.error(e); res.write('\u0000ERR:stream interrupted'); }
  res.end();
});

/* ---------------- daily Salesforce updates (RSS + Gemini) ---------------- */
const decodeEntities = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'");
const stripTags = s => decodeEntities(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
function parseFeed(xml, source) {
  const items = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/g) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/g) || [];
  for (const b of blocks.slice(0, 15)) {
    const get = tag => { const m = b.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)); return m ? m[1] : ''; };
    const link = stripTags(get('link')) || ((b.match(/<link[^>]*href="([^"]+)"/) || [])[1] || '');
    const date = new Date(stripTags(get('pubDate') || get('updated') || get('published')));
    items.push({ source, title: stripTags(get('title')), link, date: isNaN(date) ? null : date, text: stripTags(get('description') || get('summary') || get('content:encoded')).slice(0, 700) });
  }
  return items;
}
async function recentPosts(days) {
  const since = Date.now() - days * 86400000;
  const all = [];
  for (const [name, url] of FEEDS) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'TriCloudLab/1.0 (personal study portal)' } });
      if (!r.ok) { logger.warn(`feed ${name} ${r.status}`); continue; }
      all.push(...parseFeed(await r.text(), name).filter(p => p.title && /^https?:\/\//.test(p.link) && p.date && p.date.getTime() >= since));
    } catch (e) { logger.warn(`feed ${name} failed: ${e.message}`); }
  }
  const seen = new Set();
  return all.sort((a, b) => b.date - a.date).filter(p => !seen.has(p.link) && seen.add(p.link)).slice(0, 40);
}

exports.dailyUpdates = onSchedule({ schedule: '46 7 * * *', timeZone: 'Europe/London', region: REGION, secrets: [GEMINI_API_KEY], timeoutSeconds: 300, memory: '512MiB' }, async () => {
  const today = londonDate();
  const existingSnap = await db.collection('updates').select('src').get();
  const existingIds = existingSnap.docs.map(d => d.id);
  const seenLinks = new Set(existingSnap.docs.map(d => ((d.get('src') || [])[1]) || '').filter(Boolean));
  let posts = (await recentPosts(2)).filter(p => !seenLinks.has(p.link));
  if (posts.length < 3) posts = (await recentPosts(7)).filter(p => !seenLinks.has(p.link));

  const list = posts.map((p, i) => `[${i}] ${p.source} | ${londonDate(p.date)} | ${p.title}\n${p.link}\n${p.text}`).join('\n\n');
  const prompt = `Today is ${today}. You are preparing Salesforce updates for a developer studying Data 360 (formerly Data Cloud), Revenue Cloud (Revenue Lifecycle Management / Revenue Management), Agentforce and the core platform (Apex, triggers, async Apex, SOQL, LWC, integration, Flow, platform events, security, Sales Cloud, Service Cloud, Salesforce CPQ) for interviews.

From the RECENT POSTS below, choose up to 6 that matter most to such a developer (releases, new features, docs, best practice; skip career opinion and marketing). Use ONLY facts stated in each post; do not add features, dates or statuses that are not there. Write in your own words (no copied sentences), British English. Use each post's exact link as the source.

Also write exactly one "Dev topic of the day" (cloud "topic"): a core concept worth understanding for interviews, rotating across Data 360, Revenue Cloud, Agentforce, Apex/LWC/Flow, integration/security, Sales/Service Cloud and CPQ. Avoid topics already covered (existing ids: ${existingIds.filter(id => id.includes('topic')).slice(-30).join(', ') || 'none'}). It needs no source link.

Reply with only JSON: {"items":[{"id":"${today}-short-slug","date":"YYYY-MM-DD (post date; today for the topic)","cloud":"dc|rc|af|dev|platform|topic","status":"GA|Beta|Pilot|Developer preview|Announced|Release update|Docs|Blog","title":"under 90 chars","summary":"2-4 sentences","dev":"1-3 sentences on why it matters for a developer","post":index number of the post used (omit for topic),"body":"topic item only: 200-350 word mini-lesson, paragraphs separated by blank lines, ending with a paragraph starting 'Interview answer:'"}]}

RECENT POSTS:
${list || '(no new posts found — return only the topic item)'}`;

  const text = await generateText(prompt, GEMINI_API_KEY.value(), { json: true, maxOutputTokens: 8192 });
  const parsed = parseJson(text);
  const items = (parsed && Array.isArray(parsed.items) ? parsed.items : [])
    .filter(u => u && /^[A-Za-z0-9-]{6,120}$/.test(String(u.id)) && u.title && !existingIds.includes(u.id))
    .slice(0, 7);
  const batch = db.batch();
  for (const u of items) {
    const post = Number.isInteger(u.post) ? posts[u.post] : null;
    batch.set(db.doc(`updates/${u.id}`), {
      id: String(u.id), date: String(u.date || today).slice(0, 10), cloud: String(u.cloud || 'platform').slice(0, 20),
      status: String(u.status || '').slice(0, 40), title: String(u.title).slice(0, 200), summary: String(u.summary || '').slice(0, 1500),
      dev: String(u.dev || '').slice(0, 1500), body: u.body ? String(u.body).slice(0, 6000) : '',
      src: post ? [`${post.source} – ${post.title}`.slice(0, 200), post.link.slice(0, 500)] : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  if (items.length) await batch.commit();
  logger.info(`dailyUpdates: ${posts.length} posts considered, ${items.length} items written`);
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

exports.weeklyReport = onSchedule({ schedule: '55 17 * * 0', timeZone: 'Europe/London', region: REGION, secrets: [GEMINI_API_KEY], timeoutSeconds: 300 }, async () => {
  const user = await admin.auth().getUserByEmail(ALLOWED_EMAIL.value().trim());
  const base = `data/users/${user.uid}`;
  const [ps, cs] = await Promise.all([db.doc(`${base}/progress`).get(), db.doc(`${base}/content`).get()]);
  const parse = s => { try { return JSON.parse((s.exists && s.data().json) || '{}'); } catch (e) { return {}; } };
  const stats = weekStats(parse(ps), parse(cs));
  const prompt = `Write a weekly study report (150–250 words, plain text, short lines, British English, encouraging but honest) for someone preparing for Salesforce developer/architect interviews. Sections: a headline; This week (numbers); Weak spots; Coming up; Next week's focus (3 concrete actions using the portal sections Today, Flashcards, Mock Interview, Interview Prep, Career). If there was no study, say so kindly and suggest one small first step. Use only these facts:\n${JSON.stringify(stats, null, 2)}`;
  const text = await generateText(prompt, GEMINI_API_KEY.value(), { maxOutputTokens: 2048 });
  const date = londonDate();
  await db.doc(`${base}/weekly-${date}`).set({ date, text, stats });
  logger.info('weeklyReport written', date);
});
