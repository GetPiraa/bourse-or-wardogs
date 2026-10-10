// Test de fumée : exécute le script de la page dans les deux langues avec un faux DOM et vérifie que tout se remplit.
// usage : node test/smoke.js [index.html]
const fs = require('fs'), path = require('path');
const h = fs.readFileSync(process.argv[2] || path.join(__dirname, '..', 'index.html'), 'utf8');
const parts = h.split('<script>\nconst RAW'), js = parts.length > 1 ? 'const RAW' + parts[1].split('</script>')[0] : null;
if (!js) { console.error('Script de page introuvable'); process.exit(1); }
const ids = [...h.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
let fail = 0;
for (const lang of ['fr', 'en']) {
  const els = {};
  const mk = id => ({ id, innerHTML: '', textContent: '', value: '5000000', dataset: {}, children: [], style: {}, hidden: true, clientWidth: 900, clientHeight: 400, offsetWidth: 100, offsetHeight: 50,
    addEventListener() {}, setAttribute() {}, classList: { toggle() {} }, remove() {}, querySelector(s) { return s === 'svg' ? null : mk(s); }, insertAdjacentHTML(p, s) { this.svg = s; }, getBoundingClientRect() { return { left: 0, width: 900 }; } });
  const tEls = [...h.matchAll(/data-t="([^"]+)"/g)].map(m => Object.assign(mk('t:' + m[1]), { dataset: { t: m[1] } }));
  const thEls = [...h.matchAll(/data-th="([^"]+)"/g)].map(m => Object.assign(mk('th:' + m[1]), { dataset: { th: m[1] } }));
  global.document = { documentElement: { lang }, title: '', getElementById: id => els[id] || (els[id] = mk(id)), querySelectorAll: s => s === '[data-t]' ? tEls : s === '[data-th]' ? thEls : [] };
  global.addEventListener = () => {}; global.window = {}; global.localStorage = { setItem() {}, getItem() { return null; } }; global.location = { pathname: '/', search: '', reload() {} }; global.history = { replaceState() {} };
  try {
    new Function(js + ';hover=N+3;mark();hover=0;mark();range=0;draw();hover=null;mark();')();
  } catch (e) { console.error(lang, 'ERREUR', e.stack.split('\n').slice(0, 3).join(' | ')); fail++; continue; }
  const strip = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const bad = [];
  for (const id of Object.keys(els)) if (!ids.includes(id)) bad.push('id absent du gabarit : ' + id);
  for (const id of ['kpis', 'fcBody', 'jrBody', 'mhBody', 'ruleBody', 'wdBody', 'findBody', 'srcBody', 'cmpBody', 'recos', 'links', 'newsBody', 'dayBody', 'legend', 'ranges']) if (!els[id] || !els[id].innerHTML) bad.push('vide : ' + id);
  const all = Object.values(els).map(e => e.innerHTML + e.textContent + (e.svg || '')).join(' ') + tEls.concat(thEls).map(e => e.innerHTML).join(' ');
  if (/undefined|NaN|\[object/.test(all)) bad.push('undefined/NaN dans le rendu : ' + (all.match(/.{40}(undefined|NaN|\[object).{40}/) || [''])[0]);
  if (tEls.some(e => !e.innerHTML)) bad.push('texte data-t vide');
  console.log(`[${lang}] ${bad.length ? 'ÉCHEC : ' + bad.join(' ; ') : 'OK'}`);
  console.log('   ', strip(els.asof.textContent), '|', strip(els.kpis.innerHTML).slice(0, 150));
  console.log('   ', strip(els.fcBody.innerHTML.split('</tr>')[0]));
  console.log('   ', strip(els.jrBody.innerHTML.split('</tr>')[1] || ''));
  fail += bad.length;
}
process.exit(fail ? 1 : 0);
