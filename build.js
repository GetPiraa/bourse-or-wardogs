// Usage : node build.js [sortie.html] [--offline]
// Télécharge l'historique du lingot WARDOGS (trackers publics) et les annonces officielles Steam, règle le modèle,
// simule 15 jours, tient le journal des prédictions et assemble la page (index.html par défaut).
// Sources publiques uniquement : aucun appel aux serveurs du jeu.
// Le résultat est déterministe : sans nouvelle donnée, aucun fichier ne change (donc aucun commit inutile).
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const M = require('./model.js');
const here = __dirname, args = process.argv.slice(2), out = args.find(a => !a.startsWith('--')) || path.join(here, 'index.html');
const offline = args.includes('--offline');
const D_ = n => path.join(here, 'data', n), readJson = (f, d) => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d;
const save = (n, v) => { const s = JSON.stringify(v); if (!fs.existsSync(D_(n)) || fs.readFileSync(D_(n), 'utf8') !== s) fs.writeFileSync(D_(n), s); };
const cfg = readJson(path.join(here, 'config.json'));
const DAY = 864e5, now = Date.now(), iso = t => new Date(t).toISOString().slice(0, 10), U = a => Date.UTC(a[0], a[1] - 1, a[2]);
const old = readJson(D_('gold.json'), { points: [] }).points, seen = readJson(D_('firstSeen.json'), {}), state = readJson(D_('state.json'), {});
let news = readJson(D_('news.json'), []);
const revisions = readJson(D_('revisions.json'), []);
const oldNews = JSON.stringify(news);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36';
const get = url => JSON.parse(execFileSync('curl', ['-sS', '--fail', '--max-time', '30', '-A', UA, url], { encoding: 'utf8' }));

let points = old;
const report = { sources: {}, ecartsEntreSources: [], reecritures: [], nouveaux: [] };
if (!offline) {
  // 1. Prix : fusion des sources. Elles donnent aussi une valeur pour le jour en cours et le lendemain, provisoire.
  const merged = new Map(old.map(p => [p.t, p.price])), oldMap = new Map(merged);
  for (const [name, url] of Object.entries(cfg.apis)) {
    try {
      const pts = get(url).points;
      if (!Array.isArray(pts) || pts.some(p => !(p.t > 0 && p.price > 0))) throw new Error('format inattendu');
      report.sources[name] = `${pts.length} jours, jusqu'au ${iso(pts[pts.length - 1].t)}`;
      for (const p of pts) {
        if (oldMap.has(p.t) && oldMap.get(p.t) !== p.price) report.reecritures.push(`${iso(p.t)} : ${oldMap.get(p.t)} → ${p.price} (${name})`);
        else if (!oldMap.has(p.t) && merged.has(p.t) && merged.get(p.t) !== p.price) report.ecartsEntreSources.push(`${iso(p.t)} : ${merged.get(p.t)} vs ${p.price} (${name})`);
        merged.set(p.t, p.price);
      }
    } catch (e) { report.sources[name] = 'ÉCHEC : ' + String(e.message).split('\n')[0]; }
  }
  if (Object.values(report.sources).every(s => s.startsWith('ÉCHEC'))) { console.error('Aucune source de prix joignable : rien reconstruit. ' + JSON.stringify(report.sources)); process.exit(old.length ? 0 : 1); }
  points = [...merged].sort((a, b) => a[0] - b[0]).map(([t, price]) => ({ t, price }));
  // Toute valeur qui change entre deux relevés pour un même jour est notée : c'est ce qui montre qu'une valeur était provisoire.
  for (const p of points) if (oldMap.has(p.t) && oldMap.get(p.t) !== p.price) revisions.push({ t: p.t, from: oldMap.get(p.t), to: p.price, at: now });
  const lastOld = old.length ? old[old.length - 1].t : Infinity;
  for (const p of points) if (p.t > lastOld) {
    seen[p.t] = now;
    const lead = (p.t - now) / 36e5;
    report.nouveaux.push(`${iso(p.t)} : ${p.price}` + (lead > 0 ? ` (vu ${lead.toFixed(1)} h AVANT son entrée en vigueur)` : ` (vu ${(-lead).toFixed(1)} h après)`));
  }
  // 2. Annonces officielles (API publique Steam)
  try {
    news = get(`https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${cfg.steamAppId}&count=200&maxlength=1&format=json`).appnews.newsitems
      .filter(n => n.feedlabel === 'Community Announcements').map(n => [n.date * 1000, String(n.title).slice(0, 140)]);
  } catch (e) { report.sources.steamNews = 'ÉCHEC : ' + String(e.message).split('\n')[0]; }
}
if (!points.length) { console.error('Aucune donnée.'); process.exit(1); }
const changed = JSON.stringify(points) !== JSON.stringify(old) || JSON.stringify(news) !== oldNews || !state.updatedAt;
if (changed) state.updatedAt = now;
save('gold.json', { points }); save('firstSeen.json', seen); save('news.json', news); save('revisions.json', revisions); save('state.json', state);

// 3. Modèle : auto-réglage sur le passé, puis simulation
const t0 = U(cfg.liveStart), wipe = U(cfg.wipe);
// Un prix n'est tenu pour confirmé qu'à partir de 12h UTC le jour même. Avant, les trackers affichent une valeur provisoire
// (9, 11 et 12 octobre 2026 : la valeur vue la veille ou pendant la nuit a été remplacée dans la matinée).
const H = (cfg.confirmHourUTC ?? 12) * 36e5, conf = points.filter(p => now >= p.t + H), prov = points.filter(p => now < p.t + H), last = conf[conf.length - 1];
const mp = conf.filter(p => p.t >= t0 - DAY);            // période avec joueurs + la veille (pour mesurer le premier saut)
const tuned = M.tune(mp), { S, since } = M.prep(mp);
const WD = { fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };
const PH = { fr: ['1 à 3 jours après un saut', '4 à 7 jours après un saut', 'plus d’une semaine après un saut'], en: ['1–3 days after a jump', '4–7 days after a jump', 'more than a week after a jump'] };
const cap = s => s[0].toUpperCase() + s.slice(1);
let s = since[since.length - 1], jumped = false;
const fc = M.simulate(mp, tuned.par, { wipe: wipe > last.t ? wipe : null, pJump: .8 }, 15).map(f => {
  const wd = M.dow(f.t), a = S.filter(x => x.wd === wd);
  let why, kind = '';
  if (f.t === wipe) {
    kind = 'jump'; s = 0; jumped = true;
    why = { fr: 'Jour de lancement : les 3 lancements précédents ont multiplié le prix par 2,8 à 3,5. Le modèle donne 8 chances sur 10 à un saut ; sinon le prix suit sa tendance.', en: 'Launch day: the 3 previous launches multiplied the price by 2.8 to 3.5. The model gives a jump 8 chances in 10; otherwise the price follows its trend.' };
  } else {
    s++;
    if (wd === 0 && a.length >= 3 && a.every(x => x.r === 1)) { kind = 'flat'; why = { fr: `${a.length} dimanches sur ${a.length} identiques au samedi.`, en: `${a.length} Sundays out of ${a.length} identical to Saturday.` }; }
    else {
      const up = a.filter(x => x.r > 1).length, dn = a.filter(x => x.r < 1).length, ph = M.phaseOf(s);
      why = {
        fr: `${cap(WD.fr[wd])}s : ${up} hausse${up > 1 ? 's' : ''}, ${dn} baisse${dn > 1 ? 's' : ''} sur ${a.length}. Phase : ${PH.fr[ph]}${jumped ? ' (si le saut du lancement a lieu)' : ''}.`,
        en: `${WD.en[wd]}s: ${up} up, ${dn} down out of ${a.length}. Phase: ${PH.en[ph]}${jumped ? ' (if the launch jump happens)' : ''}.`
      };
    }
  }
  return { t: f.t, q: M.QS.map(x => Math.round(f.q[x])), pUp: +f.pUp.toFixed(3), pDown: +f.pDown.toFixed(3), pIn: +f.pIn.toFixed(3), pAbove: +f.pAbove.toFixed(3), why, kind };
});

// 4. Journal : ce que le modèle annonçait la veille (rejoué, ou enregistré en direct) face au prix réel, avec une lecture du mouvement
const preds = readJson(D_('predictions.json'), {});
if (fc.length && !preds[fc[0].t]) preds[fc[0].t] = { madeAt: now, base: last.t, med: fc[0].q[6], q10: fc[0].q[2], q90: fc[0].q[10], pUp: fc[0].pUp, pDown: fc[0].pDown };
save('predictions.json', preds);
const repMap = new Map(tuned.rep.map(x => [x.idx, x])), evMap = new Map(cfg.events.map(e => [U(e), { fr: e[4], en: e[5] }]));
const near = t => news.find(n => n[0] >= t - DAY && n[0] < t + DAY);
const pf = v => (v >= 0 ? '+' : '−') + Math.abs(v * 100).toFixed(1).replace('.', ',') + ' %', pe = v => (v >= 0 ? '+' : '−') + Math.abs(v * 100).toFixed(1) + '%';
const journal = [];
for (let i = mp.length - 1; i >= 1 && journal.length < 21; i--) {
  const t = mp[i].t, prev = mp[i - 1].price, actual = mp[i].price, r = actual / prev, x = repMap.get(i), live = preds[t], ev = evMap.get(t), n = near(t), wd = M.dow(t);
  const nf = n ? ` Annonce officielle proche : « ${n[1].trim()} ».` : '', ne = n ? ` Nearby official announcement: "${n[1].trim()}".` : '';
  const row = { t, actual };
  let lect;
  if (r > 2) lect = ev ? { fr: `Saut ×${r.toFixed(2).replace('.', ',')} : ${ev.fr}.`, en: `Jump ×${r.toFixed(2)}: ${ev.en}.` }
    : { fr: `Saut ×${r.toFixed(2).replace('.', ',')} sans lancement ce jour-là (rebond après le plancher).${nf}`, en: `Jump ×${r.toFixed(2)} with no launch that day (rebound off the floor).${ne}` };
  else if (x) {
    Object.assign(row, { pred: Math.round(prev * Math.exp(x.med)), lo: Math.round(prev * Math.exp(x.q10)), hi: Math.round(prev * Math.exp(x.q90)), dirOk: Math.sign(x.lr) === x.dirPred });
    const hi = x.lr > x.med;
    if (x.det) lect = r === 1 ? { fr: 'Dimanche figé, comme prévu.', en: 'Sunday frozen, as expected.' } : { fr: 'Surprise : le dimanche a bougé.' + nf, en: 'Surprise: Sunday moved.' + ne, surprise: true };
    else if (x.lr >= x.q25 && x.lr <= x.q75) lect = { fr: `Conforme aux habitudes (${WD.fr[wd]}, ${pf(r - 1)}).`, en: `In line with habits (${WD.en[wd]}, ${pe(r - 1)}).` };
    else if (x.lr >= x.q10 && x.lr <= x.q90) lect = { fr: `Dans la fourchette, mais plus ${hi ? 'haut' : 'bas'} que d'habitude (${pf(r - 1)}).`, en: `Within the range, but ${hi ? 'higher' : 'lower'} than usual (${pe(r - 1)}).` };
    else lect = {
      fr: `Surprise à la ${hi ? 'hausse' : 'baisse'} : ${pf(r - 1)} alors que 8 cas sur 10 tombaient entre ${pf(Math.exp(x.q10) - 1)} et ${pf(Math.exp(x.q90) - 1)}.${nf}`,
      en: `${hi ? 'Upside' : 'Downside'} surprise: ${pe(r - 1)} while 8 cases in 10 fell between ${pe(Math.exp(x.q10) - 1)} and ${pe(Math.exp(x.q90) - 1)}.${ne}`, surprise: true
    };
  } else lect = { fr: 'Pas assez d’historique pour juger.', en: 'Not enough history to judge.' };
  if (live && r <= 2) Object.assign(row, { pred: live.med, lo: live.q10, hi: live.q90, dirOk: Math.sign(actual - prev) === (live.pUp > live.pDown ? 1 : live.pDown > live.pUp ? -1 : 0), live: true });
  row.lect = lect; journal.push(row);
}

// 5. Suivi de l'apprentissage : une ligne par nouveau jour de données
const hist = readJson(D_('modelHistory.json'), []);
if (!hist.length || hist[hist.length - 1].t !== last.t) hist.push({ t: last.t, par: tuned.par, ...tuned.metrics });
save('modelHistory.json', hist);

// 6. Page
const data = conf.filter(p => p.t >= t0).map(p => [p.t / DAY, p.price]);
const inject = { ...cfg, updatedAt: state.updatedAt, seen: Object.entries(seen).map(([t, s]) => [+t, s]).slice(-10), news: news.slice(0, 10), prov: prov.map(p => [p.t, p.price]), revisions: revisions.slice(-15).reverse(), fc, model: { par: tuned.par, metrics: tuned.metrics }, journal, hist: hist.slice(-8).reverse() };
delete inject.apis;
const src = n => fs.readFileSync(path.join(here, 'src', n), 'utf8');
const html = src('template.html').replace('/*APP*/', () => 'const RAW=' + JSON.stringify(data) + ';\nconst CFG=' + JSON.stringify(inject).replace(/</g, '\\u003c') + ';\n' + src('content.js') + '\n' + src('app.js'));
if (!fs.existsSync(out) || fs.readFileSync(out, 'utf8') !== html) fs.writeFileSync(out, html);

// 7. Résumé
const pc = v => Math.round(v * 100) + ' %';
console.log(JSON.stringify({
  nouvellesDonnees: changed,
  maintenantUTC: new Date(now).toISOString(),
  ...report,
  dernierPrixConfirme: `${iso(last.t)} : ${last.price}`,
  valeursProvisoires: prov.map(p => `${iso(p.t)} : ${p.price}`),
  derniers: conf.slice(-4).map(p => `${iso(p.t)} ${WD.fr[new Date(p.t).getUTCDay()].slice(0, 3)} ${p.price}`),
  prochaineEstimation: `${iso(fc[0].t)} : ≈ ${fc[0].q[6]} (80 % entre ${fc[0].q[2]} et ${fc[0].q[10]}), hausse ${pc(fc[0].pUp)}, baisse ${pc(fc[0].pDown)}`,
  modele: { ...tuned.par, joursRejoues: tuned.metrics.n, bonSens: pc(tuned.metrics.dir), prixA10pct: pc(tuned.metrics.within10), reelDansFourchette80: pc(tuned.metrics.cover80) },
  surprisesRecentes: journal.slice(0, 3).filter(j => j.lect.surprise).map(j => iso(j.t) + ' ' + j.lect.fr),
  annonces: news.slice(0, 3).map(n => iso(n[0]) + ' ' + n[1])
}, null, 1));
