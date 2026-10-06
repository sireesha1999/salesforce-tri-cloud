#!/usr/bin/env node
/* Validates practice scenario files. Usage: node validate.js file1.js [file2.js ...]
   Each file must contain:  PRACTICE.push( {...}, {...}, ... );  */
const fs = require('fs'), vm = require('vm'), path = require('path');
const { runChecks } = require('./practice_engine.js');
const TRACKS = ['apex', 'triggers', 'lwc'];
const LEVELS = ['Easy', 'Medium', 'Hard'];
let errors = 0; const all = []; const ids = new Set();
const err = (id, m) => { errors++; console.log(`✗ ${id}: ${m}`); };
for (const f of process.argv.slice(2)) {
  const ctx = { PRACTICE: [] }; vm.createContext(ctx);
  try { vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: path.basename(f) }); }
  catch (e) { err(f, 'file does not run: ' + e.message); continue; }
  console.log(`${f}: ${ctx.PRACTICE.length} scenarios`);
  all.push(...ctx.PRACTICE);
}
for (const s of all) {
  const id = s && s.id || '(no id)';
  if (!/^(AP|TR|LW)\d{3}$/.test(id)) err(id, 'id must look like AP001 / TR001 / LW001');
  if (ids.has(id)) err(id, 'duplicate id'); ids.add(id);
  if (!TRACKS.includes(s.track)) err(id, 'track must be apex|triggers|lwc');
  if (!LEVELS.includes(s.level)) err(id, 'level must be Easy|Medium|Hard');
  for (const k of ['topic', 'title', 'task', 'ai']) if (typeof s[k] !== 'string' || s[k].trim().length < 3) err(id, `missing ${k}`);
  if (s.task && s.task.length < 80) err(id, 'task too short — state inputs, outputs, signature and rules');
  if (!Array.isArray(s.hints) || s.hints.length < 1) err(id, 'needs at least 1 hint');
  const multi = typeof s.starter === 'object';
  if (multi !== (typeof s.solution === 'object')) err(id, 'starter and solution must both be strings or both be {file: code} objects');
  if (multi && JSON.stringify(Object.keys(s.starter).sort()) !== JSON.stringify(Object.keys(s.solution).sort())) err(id, 'starter and solution must have the same file names');
  if (!s.solution || !s.starter) { err(id, 'missing starter/solution'); continue; }
  const checks = [...(s.checks || []), ...(s.forbid || [])];
  if ((s.checks || []).length < 2) err(id, 'needs at least 2 checks');
  for (const c of checks) {
    if (Object.prototype.toString.call(c.re) !== '[object RegExp]') err(id, 'check.re must be a RegExp');
    if (!c.msg) err(id, 'check needs msg');
    if (c.file && multi && !(c.file in s.solution)) err(id, `check.file ${c.file} not in files`);
  }
  try {
    const sol = runChecks(s, s.solution);
    sol.results.filter(r => !r.ok).forEach(r => err(id, `reference solution fails: ${r.kind} "${r.msg}"`));
    const st = runChecks(s, s.starter);
    if (st.passed) err(id, 'starter code already passes every check — checks are too weak');
  } catch (e) { err(id, 'check error: ' + e.message); }
}
const by = {}; all.forEach(s => { by[s.track] = (by[s.track] || 0) + 1; });
console.log(`\nTotal ${all.length} scenarios`, by, errors ? `— ${errors} problem(s)` : '— all valid');
process.exit(errors ? 1 : 0);
