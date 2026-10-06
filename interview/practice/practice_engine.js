/* Practice engine: static checks for coding scenarios. Shared by the portal (browser) and validate.js (node). */
(function (root) {
  // Remove comments (and, for Apex/JS, string contents are kept). HTML comments removed too.
  function stripComments(code, name) {
    if (name && /\.html$/i.test(name)) return code.replace(/<!--[\s\S]*?(-->|$)/g, ' ');
    let out = '', i = 0, n = code.length, q = null;
    while (i < n) {
      const c = code[i], d = code[i + 1];
      if (q) { out += c; if (c === '\\') { out += d || ''; i += 2; continue; } if (c === q) q = null; i++; continue; }
      if (c === "'" || c === '"' || c === '`') { q = c; out += c; i++; continue; }
      if (c === '/' && d === '/') { while (i < n && code[i] !== '\n') i++; continue; }
      if (c === '/' && d === '*') { i += 2; while (i < n && !(code[i] === '*' && code[i + 1] === '/')) i++; i += 2; out += ' '; continue; }
      if (c === '<' && code.startsWith('<!--', i)) { const e = code.indexOf('-->', i + 4); i = e < 0 ? n : e + 3; out += ' '; continue; }
      out += c; i++;
    }
    return out;
  }
  const toRe = r => (Object.prototype.toString.call(r) === '[object RegExp]' ? r : new RegExp(r, 'i'));
  // files: string (single file) or {name: code}. scenario.checks/forbid items: {re, msg, file?}
  function codeFor(files, file) {
    if (typeof files === 'string') return files;
    if (file) return files[file] || '';
    return Object.values(files).join('\n\n');
  }
  function runChecks(scenario, files) {
    const res = [];
    const cleaned = typeof files === 'string' ? stripComments(files) : Object.fromEntries(Object.entries(files).map(([k, v]) => [k, stripComments(v || '', k)]));
    for (const c of scenario.checks || []) res.push({ ok: toRe(c.re).test(codeFor(cleaned, c.file)), msg: c.msg, kind: 'need' });
    for (const c of scenario.forbid || []) res.push({ ok: !toRe(c.re).test(codeFor(cleaned, c.file)), msg: c.msg, kind: 'avoid' });
    return { passed: res.every(r => r.ok), results: res };
  }
  const api = { stripComments, runChecks };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PracticeEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
