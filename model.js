'use strict';
// Moteur de prévision du lingot WARDOGS.
// Idée : le prix est une courbe posée par le studio, on apprend donc ses habitudes.
// Chaque variation passée est un « exemple », pondéré selon sa ressemblance avec le jour à prévoir
// (même jour de semaine, même phase après un saut, ancienneté). Les poids sont réglés automatiquement
// en rejouant le passé (tune), puis 4000 trajectoires sont simulées sur l'horizon demandé (simulate).
const DAY = 864e5, dow = t => new Date(t).getUTCDay();
const QS = [.025, .05, .1, .2, .3, .4, .5, .6, .7, .8, .9, .95, .975];
const phaseOf = s => s <= 3 ? 0 : s <= 7 ? 1 : 2; // 1-3 j, 4-7 j, 8 j et plus après un saut

// P : [{t, price}] à partir de la veille de la première ouverture
function prep(P) {
  const S = [], J = [], since = [99];
  for (let i = 1; i < P.length; i++) {
    const r = P[i].price / P[i - 1].price;
    if (r > 2) { J.push({ r, idx: i }); since.push(0); }
    else { since.push(since[i - 1] + 1); S.push({ r, lr: Math.log(r), wd: dow(P[i].t), ph: phaseOf(since[i]), idx: i }); }
  }
  return { S, J, since };
}

// Distribution pondérée des variations (log) pour un jour de profil f, avec les seuls exemples d'indice < upto
function dist(S, f, par, upto, nowIdx) {
  const a = [];
  let sun = 0, sunFlat = 0;
  for (const s of S) {
    if (s.idx >= upto) break;
    if (s.wd === 0) { sun++; if (s.r === 1) sunFlat++; }
    const w = (s.wd === f.wd ? par.wWd : 1) * (s.ph === f.ph ? par.wPh : 1) * (par.hl ? Math.pow(.5, (nowIdx - s.idx) / par.hl) : 1);
    a.push([s.lr, w]);
  }
  if (f.wd === 0 && sun >= 3 && sun === sunFlat) return { det: true, n: sun };
  if (a.length < 5) return null;
  a.sort((x, y) => x[0] - y[0]);
  const tot = a.reduce((s, x) => s + x[1], 0);
  let c = 0;
  const xs = a.map(x => x[0]), cw = a.map(x => (c += x[1] / tot));
  const d = { xs, cw, n: a.length };
  if (par.scale && par.scale !== 1) { const m = wq(d, .5); d.xs = xs.map(x => m + par.scale * (x - m)); }
  return d;
}
function wq(d, q) { if (d.det) return 0; for (let i = 0; i < d.xs.length; i++) if (d.cw[i] >= q) return d.xs[i]; return d.xs[d.xs.length - 1]; }
function probs(d) { // part de hausse / baisse / stable
  if (d.det) return { up: 0, down: 0, flat: 1 };
  let up = 0, down = 0, prev = 0;
  for (let i = 0; i < d.xs.length; i++) { const w = d.cw[i] - prev; prev = d.cw[i]; if (d.xs[i] > 0) up += w; else if (d.xs[i] < 0) down += w; }
  return { up, down, flat: Math.max(0, 1 - up - down) };
}

// Rejoue le passé jour par jour avec les seules données disponibles la veille
function replay(P, par, start = 15) {
  const { S } = prep(P), out = [];
  for (const s of S) {
    if (s.idx < start) continue;
    const d = dist(S, s, par, s.idx, s.idx);
    if (!d) continue;
    const p = probs(d), dirPred = p.flat >= p.up && p.flat >= p.down ? 0 : p.up > p.down ? 1 : -1;
    out.push({ idx: s.idx, lr: s.lr, det: !!d.det, med: wq(d, .5), q10: wq(d, .1), q25: wq(d, .25), q75: wq(d, .75), q90: wq(d, .9), p, dirPred, d });
  }
  return out;
}
function score(rep) {
  let loss = 0, cover = 0, dir = 0, in10 = 0;
  for (const x of rep) {
    for (const q of [.1, .25, .5, .75, .9]) { const e = x.lr - wq(x.d, q); loss += e >= 0 ? q * e : (q - 1) * e; }
    if (x.lr >= x.q10 && x.lr <= x.q90) cover++;
    if (Math.sign(x.lr) === x.dirPred) dir++;
    if (Math.abs(Math.exp(x.med - x.lr) - 1) <= .10) in10++;
  }
  const n = rep.length || 1;
  return { n: rep.length, loss: loss / n / 5, cover80: cover / n, dir: dir / n, within10: in10 / n };
}

// Auto-réglage : choisit les poids qui auraient le mieux prévu le passé, puis l'élargissement qui rend la fourchette 80 % honnête
function tune(P) {
  let best = null;
  for (const wWd of [1, 2, 4, 8]) for (const wPh of [1, 2, 4]) for (const hl of [0, 40, 20]) {
    const par = { wWd, wPh, hl, scale: 1 }, m = score(replay(P, par));
    if (m.n >= 8 && (!best || m.loss < best.m.loss - 1e-9)) best = { par, m };
  }
  if (!best) return { par: { wWd: 2, wPh: 2, hl: 0, scale: 1 }, metrics: { n: 0 }, rep: [] };
  let pick = null;
  for (const scale of [1, 1.25, 1.5, 2]) {
    const par = { ...best.par, scale }, rep = replay(P, par), m = score(rep), gap = Math.abs(m.cover80 - .8);
    if (!pick || gap < pick.gap - 1e-9) pick = { par, m, rep, gap };
  }
  return { par: pick.par, metrics: pick.m, rep: pick.rep };
}

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// Simule nPaths trajectoires sur H jours. opt : { wipe (ms ou null), pJump }
function simulate(P, par, opt, H = 15, nPaths = 4000) {
  const { S, J, since } = prep(P), last = P[P.length - 1], floor = Math.min(...P.slice(1).map(p => p.price));
  const rnd = rng(Math.floor(last.t / DAY) * 7919 + P.length), cache = {};
  const get = (wd, ph) => cache[wd + '-' + ph] || (cache[wd + '-' + ph] = dist(S, { wd, ph }, par, Infinity, P.length) || { det: true });
  const draw = d => { if (d.det) return 0; const u = rnd(); let lo = 0, hi = d.cw.length - 1; while (lo < hi) { const m = lo + hi >> 1; d.cw[m] >= u ? hi = m : lo = m + 1; } return d.xs[lo]; };
  let floor0 = 0; for (let i = P.length - 1; i > 0 && P[i].price <= floor; i--) floor0++;
  const cols = Array.from({ length: H }, () => new Float64Array(nPaths)), up = new Array(H).fill(0), down = new Array(H).fill(0);
  for (let p = 0; p < nPaths; p++) {
    let price = last.price, s = since[since.length - 1], atFloor = floor0;
    for (let k = 0; k < H; k++) {
      const t = last.t + (k + 1) * DAY, prev = price;
      let r;
      if (opt.wipe === t && J.length && rnd() < opt.pJump) { r = J[Math.floor(rnd() * J.length)].r; s = 0; }       // lancement : saut probable
      else if (atFloor >= 2 && J.length && rnd() < .5) { r = J[Math.floor(rnd() * J.length)].r; s = 0; }            // rebond du plancher (vu une fois)
      else { s++; r = Math.exp(draw(get(dow(t), phaseOf(s)))); }
      price = Math.max(floor, price * r);
      atFloor = price <= floor ? atFloor + 1 : 0;
      cols[k][p] = price;
      if (price > prev) up[k]++; else if (price < prev) down[k]++;
    }
  }
  return cols.map((c, k) => {
    const a = Array.from(c).sort((x, y) => x - y), q = {};
    for (const x of QS) q[x] = a[Math.min(nPaths - 1, Math.floor(x * nPaths))];
    const med = q[.5];
    let inside = 0, above = 0;
    for (const v of a) { if (Math.abs(v / med - 1) <= .10) inside++; if (v > last.price) above++; }
    return { t: last.t + (k + 1) * DAY, q, med, pUp: up[k] / nPaths, pDown: down[k] / nPaths, pIn: inside / nPaths, pAbove: above / nPaths };
  });
}

module.exports = { prep, tune, simulate, replay, score, wq, dow, phaseOf, QS, DAY };
