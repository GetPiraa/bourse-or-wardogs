// RAW (points [jour epoch, prix]) et CFG (config + résultats du modèle) sont injectés par build.js ; les textes viennent de content.js.
const LI=document.documentElement.lang==='en'?1:0, LANG=LI?'en':'fr', L=(fr,en)=>LI?en:fr, LOC=LI?'en-GB':'fr-FR', PS=LI?'%':' %';
const DAY=864e5, D=RAW.map(([d,p])=>({t:d*DAY,p}));
const U=a=>Date.UTC(a[0],a[1]-1,a[2]);
const N=D.length, WIPE=U(CFG.wipe), WL=CFG.wipeLabel[LANG];
const EV={};CFG.events.forEach(e=>EV[U(e)]=[e[3],e[4+LI]]);EV[WIPE]=[CFG.wipeShort,'Wipe '+WL];
const WD=LI?['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']:['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const num=n=>LI?Math.round(n).toLocaleString('en-US'):Math.round(n).toLocaleString('fr-FR').replace(/[  ]/g,' ');
const dec=(v,d=1)=>LI?v.toFixed(d):v.toFixed(d).replace('.',',');
const fmt=n=>'$'+num(n);
const short=n=>n>=1e6?'$'+dec(n/1e6,2)+'M':'$'+Math.round(n/1e3)+'k';
const dfmt=(t,o)=>new Date(t).toLocaleDateString(LOC,Object.assign({timeZone:'UTC'},o));
const pct=(a,b)=>(a/b-1)*100;
const sgn=v=>(v>0?'+':v<0?'−':'')+dec(Math.abs(v))+PS;
const pc=v=>Math.round(v*100)+PS;
const chg=v=>{const c=v>0?'up':v<0?'down':'flat',s=v>0?'▲ ':v<0?'▼ ':'■ ';return `<span class="${c}">${s}${sgn(v)}</span>`};
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const last=D[N-1], FLOOR=Math.min(...D.map(x=>x.p));
const dow=t=>new Date(t).getUTCDay();
// Le dernier point peut être le prix de demain, publié avant minuit UTC par les données du jeu
const TODAY=Math.floor(Date.now()/DAY)*DAY, AHEAD=last.t>TODAY;

// Textes fixes, en-têtes de tableaux, langue
document.querySelectorAll('[data-t]').forEach(e=>e.innerHTML=STR[e.dataset.t][LI]);
document.querySelectorAll('[data-th]').forEach(e=>e.innerHTML='<tr>'+TH[e.dataset.th][LI].map(h=>h[0]==='>'?`<th class="r">${h.slice(1)}</th>`:`<th>${h}</th>`).join('')+'</tr>');
document.title=L("Bourse de l'or WARDOGS",'WARDOGS Gold Exchange');
[['lfr','fr'],['len','en']].forEach(([id,l])=>{$(id).setAttribute('aria-pressed',l===LANG);$(id).addEventListener('click',()=>{if(l===LANG)return;try{localStorage.setItem('lang',l)}catch(e){}history.replaceState(null,'',location.pathname+location.search);location.reload()})});
$('repo').href=CFG.repoUrl;

// Sections repliables : fermées par défaut, l'état est mémorisé dans le navigateur
(function(){
  const secs=[...document.querySelectorAll('details.sec')];
  let open=[];try{open=JSON.parse(localStorage.getItem('open')||'[]')}catch(e){}
  const save=()=>{try{localStorage.setItem('open',JSON.stringify(secs.filter(d=>d.open).map(d=>d.dataset.k)))}catch(e){}};
  secs.forEach(d=>{d.open=open.includes(d.dataset.k);d.addEventListener('toggle',save)});
  $('openAll').addEventListener('click',()=>secs.forEach(d=>d.open=true));
  $('closeAll').addEventListener('click',()=>secs.forEach(d=>d.open=false));
})();

// Variations par jour de semaine, hors sauts de lancement (> ×2)
const wdR=WD.map(()=>[]);
for(let i=1;i<N;i++){const r=D[i].p/D[i-1].p;if(r<=2)wdR[dow(D[i].t)].push(r)}
const q=(a,f)=>{const s=[...a].sort((x,y)=>x-y),k=(s.length-1)*f,l=Math.floor(k);return s[l]+(s[Math.min(l+1,s.length-1)]-s[l])*(k-l)};

// Estimations : calculées par model.js à chaque mise à jour (4000 trajectoires simulées).
// f.q = quantiles 2,5 / 5 / 10 / 20 / 30 / 40 / 50 / 60 / 70 / 80 / 90 / 95 / 97,5 %
const F=(CFG.fc||[]).map(f=>({...f,p:f.q[6],lo:f.q[0],hi:f.q[12],q10:f.q[2],q90:f.q[10]}));
const P=i=>i<N?D[i]:F[i-N];

const longDate={day:'numeric',month:'long',year:'numeric'};
$('asof').textContent=L('Audit de marché · WARDOGS · ','Market audit · WARDOGS · ')+(AHEAD?L('prix connu jusqu’au ','price known up to '):L('arrêté au ','as of '))+dfmt(last.t,longDate);
$('asof2').textContent=L('Dernière donnée reçue le ','Last data received ')+new Date(CFG.updatedAt).toLocaleString(LOC,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});

// KPIs
(function(){
  const mn=D.reduce((a,b)=>b.p<a.p?b:a), mx=D.reduce((a,b)=>b.p>a.p?b:a), wipe=Math.round((WIPE-TODAY)/DAY), dm={day:'numeric',month:'long'};
  const k=[[AHEAD?L('Prix de demain · déjà publié',"Tomorrow's price · already published"):L('Dernier prix','Latest price'),fmt(last.p),dfmt(last.t,dm)+' · '+chg(pct(last.p,D[N-2].p))+L(' vs veille',' vs previous day'),AHEAD],
    [AHEAD?L('Estimation du jour suivant','Estimate for the day after'):L('Estimation demain',"Tomorrow's estimate"),'≈ '+fmt(F[0].p),short(F[0].q10)+' – '+short(F[0].q90)+' · '+pc(F[0].pIn)+L(' à ±10 %',' within ±10%')],
    [L('Sur 7 jours','Over 7 days'),chg(pct(last.p,D[N-8].p)),L('depuis ','from ')+fmt(D[N-8].p)],
    [L('Plus bas','Lowest'),fmt(mn.p),dfmt(mn.t,dm)],
    [L('Plus haut','Highest'),fmt(mx.p),dfmt(mx.t,dm)],
    ['Wipe '+WL,wipe>0?L('J−','D−')+wipe:L('Passé','Past'),dfmt(WIPE,{weekday:'long',day:'numeric',month:'long'})]];
  $('kpis').innerHTML=k.map(x=>`<div class="kpi${x[3]?' hot':''}"><span class="l">${x[0]}</span><span class="v num">${x[1]}</span><span class="d num">${x[2]}</span></div>`).join('');
})();

// Graphique
const RANGES=[[L('1 sem.','1 wk'),7],[L('4 sem.','4 wks'),28]].concat(N>84?[[L('12 sem.','12 wks'),84]]:[],[[L('Tout','All'),N]]);
let range=RANGES.length-1, hover=null, pin=null, G={};
const chart=$('chart'), tip=$('tip');
$('ranges').innerHTML=RANGES.map((r,i)=>`<button type="button" data-i="${i}" aria-pressed="${i===range}">${r[0]}</button>`).join('');
$('ranges').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;range=+b.dataset.i;hover=null;[...$('ranges').children].forEach((c,i)=>c.setAttribute('aria-pressed',i===range));draw()});
$('legend').innerHTML=`<span><i class="sw"></i>${STR.lg_actual[LI]}</span><span><i class="sw f"></i>${STR.lg_est[LI]}</span><span><i class="grad"></i>${STR.lg_grad[LI]}</span>`+Object.values(EV).map(e=>`<span><b>${e[0]}</b> ${e[1]}</span>`).join('');
function nice(v){const p=Math.pow(10,Math.floor(Math.log10(v))),m=v/p;return (m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*p}
function draw(){
  const W=chart.clientWidth,H=chart.clientHeight,small=W<520,m={l:4,r:small?46:58,t:22,b:26};
  if(W<120||H<120)return; // pas encore mis en page (onglet masqué) : l'observateur de taille relancera le dessin
  const n=Math.min(N,RANGES[range][1]), i0=N-n, pts=D.slice(i0).concat(F), nT=pts.length;
  const lo=Math.min(...pts.map(x=>x.lo||x.p)), hi=Math.max(...pts.map(x=>x.hi||x.p));
  const st=nice((hi-lo||hi)/4), y0=Math.floor(lo/st)*st, y1=Math.max(Math.ceil(hi/st)*st,y0+st);
  const X=i=>m.l+(i/(nT-1))*(W-m.l-m.r), Y=p=>m.t+(1-(p-y0)/(y1-y0))*(H-m.t-m.b);
  G={W,H,m,n,nT,i0,X,Y};
  const T=`font-size="${small?11:12}" font-family="var(--body)"`;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${L("Prix du lingot d'or par jour, avec estimations",'Gold bar price per day, with estimates')}"><defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--gold)" stop-opacity=".28"/><stop offset="1" stop-color="var(--gold)" stop-opacity="0"/></linearGradient></defs>`;
  for(let v=y0;v<=y1+1;v+=st){const y=Y(v);s+=`<line x1="${m.l}" x2="${W-m.r}" y1="${y}" y2="${y}" stroke="var(--grid)" stroke-width="1"/><text x="${W-m.r+8}" y="${y+4}" fill="var(--muted)" ${T}>${short(v)}</text>`}
  const nt=Math.max(2,Math.min(6,Math.floor((W-m.l-m.r)/(small?90:110))));
  for(let k=0;k<nt;k++){const i=Math.round(k*(nT-1)/(nt-1)),a=k===0?'start':k===nt-1?'end':'middle';s+=`<text x="${X(i)}" y="${H-6}" text-anchor="${a}" fill="var(--muted)" ${T}>${dfmt(pts[i].t,nT>200?{month:'short',year:'2-digit'}:{day:'numeric',month:'short'})}</text>`}
  // Zone des estimations : fond légèrement distinct à droite du dernier prix
  if(F.length)s+=`<rect x="${X(n-1)}" y="${m.t}" width="${X(nT-1)-X(n-1)}" height="${H-m.t-m.b}" fill="var(--fc)" fill-opacity=".035"/>`;
  pts.forEach((p,i)=>{const e=EV[p.t];if(!e)return;const x=X(i);s+=`<line x1="${x}" x2="${x}" y1="${m.t}" y2="${H-m.b}" stroke="var(--muted)" stroke-width="1" stroke-dasharray="3 4"/>`;if(nT<=130&&!(small&&nT>45))s+=`<text x="${x}" y="13" text-anchor="middle" fill="var(--ink2)" font-size="12" font-weight="600" font-family="var(--display)">${e[0]}</text>`});
  const xy=(i,v)=>X(i).toFixed(1)+' '+Y(v).toFixed(1);
  const path=D.slice(i0).map((p,i)=>(i?'L':'M')+xy(i,p.p)).join('');
  s+=`<path d="${path}L${X(n-1)} ${H-m.b}L${X(0)} ${H-m.b}Z" fill="url(#ar)" stroke="none"/>`;
  if(F.length){
    // Éventail de probabilité : six bandes empilées, du presque blanc (bords, peu probable) au bleu plein (centre, probable)
    const a=`M${xy(n-1,last.p)}`;
    [[0,12],[1,11],[2,10],[3,9],[4,8],[5,7]].forEach(([l,h],b)=>{
      s+=`<path d="${a}${F.map((f,k)=>'L'+xy(n+k,f.q[h])).join('')}${F.map((f,k)=>'L'+xy(n+k,f.q[l])).reverse().join('')}Z" fill="color-mix(in srgb, var(--fc) ${18+b*16}%, white)" fill-opacity="${(.08+b*.07).toFixed(2)}" stroke="none"/>`});
    // Ligne d'estimation : trait plein bleu, sans contour
    const fp=`${a}${F.map((f,k)=>'L'+xy(n+k,f.p)).join('')}`;
    s+=`<path d="${fp}" fill="none" stroke="var(--fcl)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  s+=`<path d="${path}" fill="none" stroke="var(--gold)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  s+=`<circle cx="${X(n-1)}" cy="${Y(last.p)}" r="4.5" fill="var(--gold)" stroke="var(--panel)" stroke-width="2"/>`;
  s+=`<g id="pinm" visibility="hidden"><line id="pl" y1="${m.t}" y2="${H-m.b}" stroke="var(--gold)" stroke-opacity=".55" stroke-width="1"/><circle id="pd" r="7" fill="none" stroke="var(--gold)" stroke-width="2"/></g>`;
  s+=`<g id="cross" visibility="hidden"><line id="cl" y1="${m.t}" y2="${H-m.b}" stroke="var(--ink2)" stroke-width="1" stroke-dasharray="4 4"/><circle id="cd" r="5" fill="var(--ink)" stroke="var(--panel)" stroke-width="2"/></g></svg>`;
  chart.querySelector('svg')?.remove(); chart.insertAdjacentHTML('afterbegin',s);
  mark();
}
// Le survol pilote la lecture (point mobile, bandeau) ; un clic épingle un jour pour le simulateur, sans bloquer le survol
function sel(){return hover!=null?hover:pin!=null?pin:N-1}
function calcSel(){return pin!=null?pin:hover!=null?hover:N-1}
const range80=d=>L(`8 chances sur 10 entre ${fmt(d.q10)} et ${fmt(d.q90)}`,`8 chances in 10 between ${fmt(d.q10)} and ${fmt(d.q90)}`);
function mark(){
  if(!G.X)return calc();
  const gi=sel(), d=P(gi), prev=P(gi-1), isF=gi>=N, est=L(' · estimation',' · estimate'), vs=L(' vs veille',' vs previous day');
  $('rDate').textContent=dfmt(d.t,{weekday:'long',day:'numeric',month:'long',year:'numeric'})+(isF?est:'')+(gi===pin?L(' · épinglé',' · pinned'):'');
  $('rPrice').textContent=(isF?'≈ ':'')+fmt(d.p);
  $('rPrice').classList.toggle('est',isF);
  const tag=(EV[d.t]?`<span class="tag">${EV[d.t][1]}</span>`:'')+(gi===N-1&&AHEAD?`<span class="tag">${L('Publié à l’avance, en vigueur à minuit UTC','Published in advance, effective at midnight UTC')}</span>`:'');
  $('rChg').innerHTML=isF?`<span>${range80(d)}</span><span>${pc(d.pIn)}${L(' de chances d’être à ±10 %',' odds of being within ±10%')}</span><span>${chg(pct(d.p,last.p))}${L(' vs dernier prix',' vs latest price')}</span>${tag}`
    :(prev?`<span>${chg(pct(d.p,prev.p))}${vs}</span>`:'')+(gi!==N-1?`<span>${L('Dernier prix : ','Latest price: ')}${chg(pct(last.p,d.p))}${L(' par rapport à ce jour',' compared with that day')}</span>`:'')+tag;
  const cross=chart.querySelector('#cross'), li=gi-G.i0, show=hover!=null&&li>=0;
  if(cross){cross.setAttribute('visibility',show?'visible':'hidden');
    if(show){const x=G.X(li),y=G.Y(d.p),cl=chart.querySelector('#cl'),cd=chart.querySelector('#cd');cl.setAttribute('x1',x);cl.setAttribute('x2',x);cd.setAttribute('cx',x);cd.setAttribute('cy',y);
      tip.hidden=false;
      tip.innerHTML=`<span class="t">${dfmt(d.t,{weekday:'short',day:'numeric',month:'short'})}${isF?est:''}</span><b class="num">${isF?'≈ ':''}${fmt(d.p)}</b>`+(isF?`${short(d.q10)} – ${short(d.q90)} ${L('(8 chances sur 10)','(8 chances in 10)')}<br>±10${PS} : ${pc(d.pIn)}`:prev?chg(pct(d.p,prev.p))+vs:'');
      const tw=tip.offsetWidth,th=tip.offsetHeight;let tx=x+12;if(tx+tw>G.W-4)tx=x-12-tw;tip.style.left=Math.max(4,tx)+'px';tip.style.top=Math.max(4,Math.min(G.H-th-30,y-th-10))+'px';
    }else tip.hidden=true}
  // Repère fixe du jour épinglé
  const pm=chart.querySelector('#pinm'), pli=pin!=null?pin-G.i0:-1;
  if(pm){pm.setAttribute('visibility',pli>=0?'visible':'hidden');
    if(pli>=0){const px=G.X(pli),py=G.Y(P(pin).p),pl=chart.querySelector('#pl'),pd=chart.querySelector('#pd');pl.setAttribute('x1',px);pl.setAttribute('x2',px);pd.setAttribute('cx',px);pd.setAttribute('cy',py)}}
  calc();
}
// Position rapportée à la largeur affichée : reste juste quand la page est agrandie (zoom des grands écrans)
function idxAt(e){const r=chart.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*G.W,f=(x-G.m.l)/(G.W-G.m.l-G.m.r);return G.i0+Math.max(0,Math.min(G.nT-1,Math.round(f*(G.nT-1))))}
chart.addEventListener('pointermove',e=>{hover=idxAt(e);mark()});
chart.addEventListener('pointerleave',()=>{hover=null;mark()});
chart.addEventListener('click',e=>{const i=idxAt(e);pin=pin===i?null:i;mark()});
if(window.ResizeObserver)new ResizeObserver(()=>draw()).observe(chart);else addEventListener('resize',draw);

// Simulateur
function calc(){
  const cash=parseInt($('cash').value.replace(/\D/g,''))||0, gi=calcSel(), d=P(gi), dm={day:'numeric',month:'long'};
  const b=p=>Math.floor(cash/p), txt=n=>num(n)+(LI?(n===1?' bar':' bars'):(n>1?' lingots':' lingot')), per=L(' le lingot',' per bar');
  $('cSelL').textContent=(gi===N-1?L('Au dernier prix','At the latest price'):(gi>=N?L('Estimation du ','Estimate for '):L('Au ','On '))+dfmt(d.t,dm))+(pin!=null?L(' · épinglé',' · pinned'):'');
  $('unpin').hidden=pin==null;
  $('cSel').textContent=txt(b(d.p)); $('cSelD').textContent=L('à ','at ')+(gi>=N?'≈ ':'')+fmt(d.p)+per;
  $('cLowL').textContent=L('Au plancher (','At the floor (')+num(FLOOR)+')';
  $('cLow').textContent=txt(b(FLOOR));
  $('cHigh').textContent=txt(b(last.p*3)); $('cHighD').textContent=L('à ','at ')+fmt(last.p*3)+per;
}
$('cash').value=num(5e6);
$('unpin').textContent=L('✕ Libérer ce jour','✕ Release this day');
$('unpin').addEventListener('click',()=>{pin=null;mark()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&pin!=null){pin=null;mark()}});
$('cash').addEventListener('input',e=>{const v=e.target.value.replace(/\D/g,'');e.target.value=v?num(+v):'';calc()});

// Jours de la semaine
(function(){
  const avg=a=>a.length?(Math.exp(a.reduce((s,r)=>s+Math.log(r),0)/a.length)-1)*100:0, mxa=Math.max(...wdR.map(a=>Math.abs(avg(a))))||1;
  $('wdBody').innerHTML=[1,2,3,4,5,6,0].map(i=>{const a=wdR[i],v=avg(a);return `<tr><td class="k">${WD[i]}</td><td class="r num">${a.filter(r=>r>1).length}</td><td class="r num">${a.filter(r=>r===1).length}</td><td class="r num">${a.filter(r=>r<1).length}</td><td class="num"><span class="meter" style="width:${Math.round(Math.abs(v)/mxa*90)}px"></span>${chg(v)}</td></tr>`}).join('');
})();

// Estimations, journal, apprentissage
(function(){
  const cls=(v,hi,mid)=>v>=hi?'hi':v>=mid?'mid':'lo', sp=(c,t)=>`<span class="${c}">${t}</span>`;
  $('fcBody').innerHTML=F.map(f=>{const flat=Math.max(0,1-f.pUp-f.pDown),big=Math.max(f.pUp,f.pDown,flat);
    const lab=f.kind==='flat'?sp('flat',L('■ Identique à samedi','■ Same as Saturday')):f.kind==='jump'?sp('up',L('▲ Saut de lancement','▲ Launch jump')):big<.6?sp('flat',L('◆ Indécis','◆ Undecided')):f.pUp>f.pDown?sp('up',L('▲ Hausse','▲ Up')):sp('down',L('▼ Baisse','▼ Down'));
    return `<tr${f.t===WIPE?' class="ev"':''}><td class="k">${dfmt(f.t,{weekday:'short',day:'numeric',month:'short'})}${f.t===WIPE?' · '+WL:''}</td><td>${lab}</td><td class="r num">≈ ${fmt(f.p)}</td><td class="r num">${short(f.q10)} – ${short(f.q90)}</td><td class="r num">${short(f.lo)} – ${short(f.hi)}</td><td><span class="pill ${cls(big,.75,.6)}">${pc(big)}</span></td><td><span class="pill ${cls(f.pIn,.5,.3)}">${pc(f.pIn)}</span></td><td class="p">${f.why[LANG]}</td></tr>`}).join('');
  const m=CFG.model.metrics,p=CFG.model.par,sc=x=>dec(x.scale,2).replace(/[.,]?0+$/,'');
  const par=x=>L(`jour de semaine ×${x.wWd}, phase après saut ×${x.wPh}, mémoire ${x.hl?x.hl+' jours':'complète'}, fourchette ×${sc(x)}`,`weekday ×${x.wWd}, phase after jump ×${x.wPh}, memory ${x.hl?x.hl+' days':'full'}, range ×${sc(x)}`);
  $('bt').textContent=L(`« Chance du sens » : part des 4000 trajectoires simulées qui vont dans le sens annoncé. « Chance à ±10 % » : part qui finit à moins de 10 % de l'estimation. Rejoué sur ${m.n} jours passés avec les seules données de la veille, le modèle a donné le bon sens ${pc(m.dir)} du temps, un prix à ±10 % ${pc(m.within10)} du temps, et le prix réel est tombé dans la fourchette 80 % ${pc(m.cover80)} du temps. Plus l'horizon est loin, plus l'incertitude se cumule.`,
    `"Direction odds": share of the 4,000 simulated paths that go the announced way. "Odds within ±10%": share that end within 10% of the estimate. Replayed over ${m.n} past days using only the previous day's data, the model got the direction right ${pc(m.dir)} of the time, the price within ±10% ${pc(m.within10)} of the time, and the actual price fell inside the 80% range ${pc(m.cover80)} of the time. The further the horizon, the more uncertainty builds up.`);
  $('jrBody').innerHTML=(CFG.journal||[]).map(j=>`<tr><td class="k num">${dfmt(j.t,{weekday:'short',day:'2-digit',month:'2-digit'})}</td><td class="r num">${j.pred?'≈ '+fmt(j.pred):'—'}</td><td class="r num">${j.pred?short(j.lo)+' – '+short(j.hi):'—'}</td><td class="r num">${fmt(j.actual)}</td><td class="r num">${j.pred?sgn((j.pred/j.actual-1)*100):'—'}</td><td>${j.pred?(j.dirOk?sp('up',L('✓ Bon sens','✓ Right')):sp('down',L('✗ Mauvais sens','✗ Wrong'))):'—'}</td><td class="p">${esc(j.lect[LANG])}${j.live?' '+sp('tag',L('Prédit en direct','Predicted live')):''}</td></tr>`).join('');
  $('mhBody').innerHTML=(CFG.hist||[]).map(h=>`<tr><td class="k num">${dfmt(h.t,{day:'2-digit',month:'2-digit',year:'numeric'})}</td><td class="r num">${h.n}</td><td class="r num">${pc(h.dir)}</td><td class="r num">${pc(h.within10)}</td><td class="r num">${pc(h.cover80)}</td><td class="p">${par(h.par)}</td></tr>`).join('');
  $('mdl').textContent=L('Réglage actuel : ','Current setting: ')+par(p)+'.';
})();

// Règles conditionnelles : pour chaque règle, ce qui s'est passé quand la condition était vraie, et si elle s'applique au prochain prix
(function(){
  const ctx=i=>{ // i = indice du jour à prévoir (N = prochain prix inconnu)
    const t=i<N?D[i].t:last.t+DAY, wd=dow(t), r1=D[i-1].p/D[i-2].p, w=D.slice(Math.max(0,i-8),i-1).map(x=>x.p);
    let since=i; // le premier jour de la série est lui-même un lancement
    for(let j=i-1;j>=1;j--)if(D[j].p/D[j-1].p>2){since=i-j;break}
    return{wd,r1,since,week:wd>=1&&wd<=5,low7:w.length>0&&D[i-1].p<=Math.min(...w)};
  };
  const R=[[L('Dimanche','Sunday'),c=>c.wd===0],[L('Vendredi','Friday'),c=>c.wd===5],[L('Mardi','Tuesday'),c=>c.wd===2],[L('Mercredi','Wednesday'),c=>c.wd===3],
    [L('Lendemain d’un saut (prix plus que doublé)','Day after a jump (price more than doubled)'),c=>c.r1>2],
    [L('Jour de semaine après une hausse','Weekday after a rise'),c=>c.week&&c.r1>1&&c.r1<=2],
    [L('4 à 7 jours après un saut','4 to 7 days after a jump'),c=>c.since>=4&&c.since<=7],
    [L('1 à 3 jours après un saut','1 to 3 days after a jump'),c=>c.since>=1&&c.since<=3],
    [L('Jour de semaine après un plus-bas de 7 jours','Weekday after a 7-day low'),c=>c.week&&c.low7],
    [L('Samedi après un plus-bas de 7 jours','Saturday after a 7-day low'),c=>c.wd===6&&c.low7]];
  const tom=ctx(N);
  const out=R.map(([name,f])=>{let n=0,up=0,dn=0;const rs=[];
    for(let i=2;i<N;i++){const r=D[i].p/D[i-1].p;if(r>2||!f(ctx(i)))continue;n++;rs.push(r);r>1?up++:r<1&&dn++}
    const fl=n-up-dn,best=Math.max(up,dn,fl);
    return{name,n,best,res:best===fl?`<span class="flat">${L('■ Stable','■ Flat')}</span>`:best===dn?`<span class="down">${L('▼ Baisse','▼ Down')}</span>`:`<span class="up">${L('▲ Hausse','▲ Up')}</span>`,med:n?q(rs,.5):1,on:f(tom)}})
    .filter(o=>o.n>=4).sort((a,b)=>b.on-a.on||b.best/b.n-a.best/a.n||b.n-a.n);
  $('ruleBody').innerHTML=out.map(o=>{const s=o.best/o.n;return `<tr${o.on?' class="ev"':''}><td class="k">${o.name}</td><td>${o.res}</td><td class="r num">${o.best}${L(' sur ',' of ')}${o.n}</td><td class="r num">${sgn((o.med-1)*100)}</td><td><span class="pill ${s>=.85?'hi':s>=.7?'mid':'lo'}">${pc(s)}</span></td><td>${o.on?`<span class="tag">${L('● Active pour le prochain prix','● Active for the next price')}</span>`:'<span class="flat">—</span>'}</td></tr>`}).join('');
})();

// Tableaux de textes (content.js)
const row3=(r,kc)=>`<tr><td class="${kc}">${r[0][LI]}</td><td class="p">${r[1][LI]}</td>`;
$('findBody').innerHTML=FINDINGS.map(r=>row3(r,'kw')+`<td><span class="pill ${r[2]}">${r[3][LI]}</span></td></tr>`).join('');
$('srcBody').innerHTML=DATASRC.map(r=>row3(r,'kw')+`<td><span class="pill ${r[2]}">${r[3][LI]}</span></td></tr>`).join('');
$('cmpBody').innerHTML=COMPARE.map(r=>row3(r,'kw')+`<td class="p">${r[2][LI]}</td></tr>`).join('');
$('recos').innerHTML=RECOS.map(r=>`<li><b>${r[0][LI]}</b> ${r[1][LI]}</li>`).join('');
$('links').innerHTML=LINKS.map(l=>`<a href="${l[1]}" rel="noopener">${l[0]}</a>`).join('');

// Annonces officielles Steam
$('newsBody').innerHTML=(CFG.news||[]).map(n=>`<tr><td class="k num">${dfmt(n[0],{day:'2-digit',month:'2-digit',year:'numeric'})}</td><td>${WD[dow(n[0])]}</td><td class="p">${esc(n[1])}</td></tr>`).join('')||`<tr><td colspan="3" class="p">${L('Annonces indisponibles lors de cette mise à jour.','Announcements unavailable at this update.')}</td></tr>`;

// Relevé quotidien
(function(){
  let h='';
  for(let i=N-1;i>=0;i--){const d=D[i],e=EV[d.t];h+=`<tr${e?' class="ev"':''}><td class="k num">${dfmt(d.t,{day:'2-digit',month:'2-digit',year:'numeric'})}</td><td>${WD[dow(d.t)]}</td><td class="r num">${fmt(d.p)}</td><td class="r num">${i?chg(pct(d.p,D[i-1].p)):'—'}</td><td>${e?`<span class="tag">${e[1]}</span>`:''}</td></tr>`}
  $('dayBody').innerHTML=h;
})();
draw();
