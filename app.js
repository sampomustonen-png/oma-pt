// Oma PT: sovelluslogiikka. Tiedot tallentuvat laitteen selaimeen (localStorage).
'use strict';

// ---------- apufunktiot ----------
const $=s=>document.querySelector(s),K='omapt1',TK='omapt-tmr';
const td=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
const dt=d=>new Date(d+'T00:00:00Z');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fm=n=>String(Math.round(n*100)/100).replace('.',',');
const nu=v=>parseFloat(String(v).replace(',','.'))||0;
const r25=x=>Math.round(x/2.5)*2.5;
const fd=d=>(+d.slice(8))+'.'+(+d.slice(5,7))+'.';
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const hsh=s=>{let h=5381;for(let i=0;i<s.length;i++)h=((h*33)^s.charCodeAt(i))>>>0;return h.toString(36)};
const byD=(a,b)=>a.d<b.d?-1:a.d>b.d?1:0;
const mm=x=>{const s=Math.round(x*60);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};

// ---------- tila ----------
let S=null;try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
const base=()=>({block:1,start:td(),w:{},f:{},hist:[],runs:[],del:[],run0:5,draft:null,msg:null});
S=Object.assign(base(),S||{});
let UI={},tab='w',CM=td().slice(0,7),CL=null,TT=0;

// vanhojen tallennusten päivitys uuteen muotoon
const AL=n=>ALIAS[n]||n,rk=o=>{if(!o)return o;const r={};for(const k in o)r[AL(k)]=o[k];return r};
// treeneille ja juoksuille pysyvät tunnisteet ja nykyiset liikenimet (myös pilvestä tuleville tiedoille)
function norm(o){for(const k of ['hist','runs','del'])if(!Array.isArray(o[k]))o[k]=[];
  o.hist.forEach(h=>{h.x=rk(h.x||{});if(h.nt)h.nt=rk(h.nt);if(!h.id)h.id='h'+hsh(h.d+h.day+JSON.stringify(h.x))});
  o.runs.forEach(r=>{if(!r.id)r.id='r'+hsh(r.d+'|'+r.km+'|'+r.min+'|'+r.rpe)});return o}
function migrate(){
  delete S.last;delete S.bga;norm(S);
  S.w=rk(S.w||{});S.f=rk(S.f||{});
  const rp=p=>{if(p)for(const k in p)p[k][1].forEach(e=>{e[0]=e[0].split('|').map(AL).join('|')})};
  rp(S.prog);(S.lib||[]).forEach(l=>rp(l.prog));
  const d=S.draft;
  if(d&&!d.ex&&d.x){
    S.draft={day:d.day,c:d.d||td(),note:'',ex:d.x.map((s,i)=>({s,sw:d.sw&&d.sw[i]?1:0,sk:d.sk&&d.sk[i]?1:0,nt:''}))};
    if(d.x.some(r=>r.some(s=>s.d))){S.draft.t0=Date.now();S.draft.td0=td()}
  }
  S.hist.sort(byD);S.runs.sort(byD);
}
migrate();
let P=S.prog||DEF;

function sv(push=true){if(push)S.ts=Date.now();try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}if(push&&window.onSv)window.onSv()}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(TT);TT=setTimeout(()=>t.classList.remove('on'),2800)}

// ---------- liikkeet ----------
const nm=e=>{const a=e[0].split('|'),v=(S.block-1)%2;return[a[v]||a[0],a[1-v]||a[0]]};
const ev=(e,i)=>S.draft&&S.draft.ex&&S.draft.ex[i]&&S.draft.ex[i].sw?[e[0].split('|').reverse().join('|'),...e.slice(1)]:e;
const LB=n=>LIB.find(y=>y.n==n);
const wt=n=>(LB(n)||{}).w||'';
const sq=(n,a)=>{const x=LB(n),z=LB(a);return!x||!z||(x.q==z.q&&x.w==z.w)};
const fk=(n,k)=>{const w=wt(n);return w=='l'?(nu(k)?'+'+fm(nu(k))+' kg':'oma paino'):w=='v'?'avustus '+fm(nu(k))+' kg':fm(nu(k))+' kg'};
const lo=n=>{for(let i=S.hist.length;i--;)if(S.hist[i].x[n])return{d:S.hist[i].d,s:S.hist[i].x[n],nt:S.hist[i].nt&&S.hist[i].nt[n]};return null};
// ehdotettu paino: oma tulos, sitten historia, sitten saman välineen variaatio
const gw=e=>{const[n,a]=nm(e);if(S.w[n])return S.w[n];const l=lo(n);if(l)return{kg:l.s[l.s.length-1].k,r:e[2]};const o=S.w[a];return o&&sq(n,a)?{kg:r25(o.kg*.9),r:e[2]}:null};
const gd=n=>{const g=(G[n]||'Oma liike|Valitse paino, jolla jää 1–3 toistoa varaan|Tee liike hallitusti koko liikeradalla|Laske paino hitaammin kuin nostat').split('|');return`<p><b>Lihakset:</b> ${esc(g[0])}</p><ol>${g.slice(1).map(x=>`<li>${esc(x)}</li>`).join('')}</ol><a href="https://www.youtube.com/results?search_query=${encodeURIComponent(n+' exercise form')}" target="_blank" rel="noopener">Katso esimerkkivideo</a>`};
const estMin=k=>Math.round(10+P[k][1].reduce((a,e)=>a+e[1]*(40+e[5]),0)/60);
const nx=()=>{const ks=Object.keys(P),l=S.hist.length&&S.hist[S.hist.length-1].day;return l&&ks.includes(l)?ks[(ks.indexOf(l)+1)%ks.length]:ks[0]};

// ---------- jakson viikot: vain viikot, joilla on treenattu, kuluttavat jaksoa ----------
const wi=d=>Math.floor((dt(d)-dt(S.start))/6048e5);
function aw(){const s=new Set();for(const h of S.hist)if(h.d>=S.start)s.add(wi(h.d));for(const r of S.runs)if(r.d>=S.start)s.add(wi(r.d));return s}
function ewk(d){const i=wi(d);let n=0;for(const x of aw())if(x<i)n++;return n+1}
const wk=()=>ewk(td());
const gapDays=()=>{const l=S.hist.length&&S.hist[S.hist.length-1].d;return l?Math.round((dt(td())-dt(l))/864e5):0};

// ---------- treenipohja ----------
function mkEx(e,dl,brk){const g=gw(e),n=dl?Math.max(2,e[1]-1):e[1],[nn]=nm(e);let kg=g?g.kg:'';if(kg!==''&&(dl||brk)&&wt(nn)!='v')kg=r25(kg*.9);
  return{s:Array.from({length:n},()=>({k:kg,r:g?g.r:'',d:0})),sw:0,sk:0,nt:'',tk:kg,tr:g?g.r:'',tt:g&&g.t||''}}
function mk(day){const dl=wk()==6,brk=gapDays()>14;return{day,c:td(),note:'',brk,ex:P[day][1].map(e=>mkEx(e,dl,brk))}}
function ensureEx(d){const L=P[d.day][1],dl=wk()==6;while(d.ex.length<L.length)d.ex.push(mkEx(L[d.ex.length],dl,d.brk));if(d.ex.length>L.length)d.ex.length=L.length}
const touch=()=>{const d=S.draft;if(d&&!d.t0){d.t0=Date.now();d.td0=td()}};

// ---------- ohjelman luonti alkutiedoista ----------
let WN=new Set();
const OB={q:'',sp:'n',rd:'1',ag:0,exp:'a',days:'3',eq:'s',goal:'b',foc:[],lim:[],w:'',h:'',r:fm(S.run0)};
function pk(g,k,o,used){const ok=x=>x.g==g&&(o.eq=='s'||x.q=='b')&&!x.f.split('').some(c=>o.lim.includes(c));let c=LIB.filter(ok);if(!c.length)c=LIB.filter(x=>x.g==g);const p=c.filter(x=>x.k==k).concat(c.filter(x=>x.k!=k)).sort((x,y)=>WN.has(y.n)-WN.has(x.n)),u=p.filter(x=>!used.has(x.n)),l=u.length>1?u:p,b=l[1]||l[0];used.add(l[0].n);used.add(b.n);return[l[0],b]}
function gen(o){const kw={penkki:'Bench press',kyykky:'Back squat',maastaveto:'Conventional deadlift',pystypunnerrus:'Overhead press',soutu:'Barbell row',ylätalja:'Wide-grip lat pulldown',leuka:'Pull-up',leuat:'Pull-up',leuan:'Pull-up',lonkannosto:'Barbell hip thrust',hip:'Barbell hip thrust',jalkaprässi:'Leg press',hauiksen:'Barbell curl',ojentajan:'Triceps pushdown'},mg={rinta:'r',selkä:'s',pakar:'g',olka:'o',hauis:'k',ojentaj:'k',pohje:'j',vatsa:'v',reis:'j',jalka:'j'},tx=(o.q||'').toLowerCase();
  WN=new Set();LIB.forEach(x=>{if(tx.includes(x.n.toLowerCase()))WN.add(x.n)});for(const k in kw)if(tx.includes(k))WN.add(kw[k]);
  const fc=new Set(o.foc);for(const k in mg)if(tx.includes(k))fc.add(mg[k]);if(o.sp=='r'){fc.add('g');fc.add('v')}if(o.sp=='m'){fc.add('v');fc.add('s')}o={...o,foc:[...fc]};
  const used=new Set(),t=o.days==4?[TM.u[0],TM.l[0],TM.u[1],TM.l[1]]:TM.f.slice(0,o.days),r={};
  t.forEach((d,i)=>{r['ABCD'[i]]=['Päivä '+'ABCD'[i]+': '+(o.days==4?(i%2?'alakroppa':'yläkroppa'):'kokovartalo'),d.split(' ').map(s=>{const g=s.slice(0,2),k=s[2];let n=+s[3];if(o.exp=='a')n--;if(k=='a'&&(o.foc.includes(FK[g])||(g=='jt'&&o.foc.includes('g'))))n=Math.min(5,n+1);const[a,b]=pk(g,k,o,used);if(WN.has(a.n))n=Math.min(5,n+1);let lo=a.lo,hi=a.hi,rs=a.rs;if(o.goal=='v'){[lo,hi]=k=='m'?[3,6]:[6,10];if(k=='m')rs=180}else if(o.goal=='m')[lo,hi]=k=='m'?[6,10]:[10,15];return[a.n+'|'+b.n,n,lo,hi,a.st,rs]})]});
  return r}

// ---------- uusi jakso: sarjamäärän säätö tulosten mukaan, kesto enintään noin 90 min ----------
function adj(){const ch=[],g={},sm=S.hist.filter(h=>h.d>=S.start),b=S.block+1,gr=n=>{const x=LB(n);return x?x.g:null};let hv=0;
  const sets=k=>P[k][1].reduce((a,e)=>a+e[1],0);
  for(const k in P)P[k][1].forEach(e=>{const x=gr(nm(e)[0]);if(x)g[x]=(g[x]||0)+e[1]});
  for(const k in P)P[k][1].forEach(e=>{const n=nm(e)[0],x=gr(n),L=LB(n),t=sm.filter(h=>h.x[n]).map(h=>Math.max(...h.x[n].map(s=>s.k))),up=t.length>1&&t[t.length-1]>t[0];
    if(x&&t.length>1&&e[1]<5&&g[x]<(up?16:10)&&estMin(k)+(40+e[5])/60<=85&&sets(k)<28){e[1]++;g[x]++;ch.push(n+': +1 sarja')}
    if(L&&L.k=='m'&&(!S.prof||S.prof.goal=='b')){hv=1;if(b%2){e[2]=L.lo;e[3]=L.hi;e[5]=L.rs}else{e[2]=Math.max(3,L.lo-2);e[3]=Math.max(L.lo+1,L.hi-3);e[5]=Math.max(L.rs,180)}}});
  for(const k in P){let cut=0;while(estMin(k)>88){const L=P[k][1],acc=L.filter(e=>(LB(nm(e)[0])||{}).k!='m'&&e[1]>2).sort((a,c)=>c[1]-a[1])[0]||L.filter(e=>e[1]>3).sort((a,c)=>c[1]-a[1])[0];if(!acc)break;acc[1]--;cut=1}
    if(cut)ch.push(`Päivä ${k}: sarjoja vähennettiin, jotta treeni pysyy noin 90 minuutissa.`)}
  if(hv)ch.push(b%2?'Raskaiden liikkeiden toistoalue palasi lihaskasvuvoittoiseksi.':'Raskaissa liikkeissä siirryttiin painavampaan toistoalueeseen voiman rakentamiseksi.');
  S.prog=P;return ch.slice(0,10)}

// ---------- ennätykset ja historia ----------
const e1=s=>s.k*(1+s.r/30);
const sc=(n,s)=>{const w=wt(n);return w=='v'?-s.k*1000+s.r:w=='l'?s.k*1000+s.r:e1(s)};
function pb(n,ss){const prev=S.hist.filter(h=>h.x[n]).flatMap(h=>h.x[n]);if(!prev.length)return false;const p=Math.max(...prev.map(s=>sc(n,s)));return Math.max(...ss.map(s=>sc(n,s)))>p&&(wt(n)||p>0)}

function lch(pts,u,f=fm){if(!pts.length)return'<p class="m">Ei vielä tietoja.</p>';
  const W=320,H=130,l=42,r=12,t=10,b=22,ys=pts.map(p=>p.y);let mx=Math.max(...ys),mi=Math.min(...ys);if(mx==mi){mx+=1;mi=Math.max(0,mi-1)}
  const t0=+dt(pts[0].x),t1=+dt(pts[pts.length-1].x),X=p=>t1>t0?l+(+dt(p.x)-t0)/(t1-t0)*(W-l-r):l+(W-l-r)/2,Y=y=>t+(mx-y)/(mx-mi)*(H-t-b);
  return`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(u)}"><line class="gl" x1="${l}" x2="${W-r}" y1="${Y(mx)}" y2="${Y(mx)}"/><line class="gl" x1="${l}" x2="${W-r}" y1="${Y(mi)}" y2="${Y(mi)}"/><text x="${l-6}" y="${Y(mx)+4}" text-anchor="end">${f(mx)}</text><text x="${l-6}" y="${Y(mi)+4}" text-anchor="end">${f(mi)}</text><polyline points="${pts.map(p=>X(p).toFixed(1)+','+Y(p.y).toFixed(1)).join(' ')}"/>${pts.map(p=>`<circle cx="${X(p).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3.5"/>`).join('')}<text x="${l}" y="${H-5}">${fd(pts[0].x)}</text>${pts.length>1?`<text x="${W-r}" y="${H-5}" text-anchor="end">${fd(pts[pts.length-1].x)}</text>`:''}</svg><div class="m">${esc(u)}</div>`}

function hx(n){const L=S.hist.filter(h=>h.x[n]).map(h=>({d:h.d,s:h.x[n]}));if(!L.length)return'<p class="m">Ei vielä kirjattuja tuloksia.</p>';
  const w=wt(n);let b=null;L.forEach(l=>l.s.forEach(s=>{if(!b||sc(n,s)>sc(n,b))b={...s,d:l.d}}));
  const noW=w=='l'&&L.every(l=>l.s.every(s=>!s.k));
  const pts=L.map(l=>({x:l.d,y:noW?Math.max(...l.s.map(s=>s.r)):w=='v'?Math.min(...l.s.map(s=>s.k)):Math.max(...l.s.map(s=>s.k))}));
  const u=noW?'Eniten toistoja treeniä kohti':w=='v'?'Pienin avustus treeniä kohti (kg), pienempi on parempi':w=='l'?'Suurin lisäpaino treeniä kohti (kg)':'Korkein paino treeniä kohti (kg)';
  return`<p><b>Paras sarja:</b> ${fk(n,b.k)} × ${b.r} (${fd(b.d)})</p>${lch(pts,u)}<ul>${L.slice(-6).reverse().map(l=>`<li>${fd(l.d)}: ${l.s.map(s=>fk(n,s.k)+' × '+s.r).join(', ')}</li>`).join('')}</ul>`}

function fb(){const m={};S.hist.filter(h=>h.d>=S.start).forEach(h=>{for(const n in h.x)(m[n]=m[n]||[]).push(Math.max(...h.x[n].map(s=>s.k)))});const u=[],f=[];for(const n in m){const a=m[n];if(a.length<2)continue;const d=a[a.length-1]-a[0];d>0?u.push(n+' +'+fm(d)+' kg'):f.push(n)}
  return(u.length?'<p><b>Kehittyneet liikkeet</b></p><ul>'+u.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+(f.length?'<p><b>Paino ei noussut</b></p><p class="m">'+esc(f.join(', '))+'. Tarkista näissä tekniikka, palautuminen ja että sarjat tuntuvat riittävän raskailta.</p>':'')}

// ---------- ajastin ja äänimerkki ----------
let T={e:0,d:0,l:'Tauko'},AC=null,OS=null;
try{const t=JSON.parse(localStorage.getItem(TK));if(t&&t.e>Date.now()-10000)Object.assign(T,t,{d:t.e<=Date.now()?1:0})}catch(e){}
const tsave=()=>{try{localStorage.setItem(TK,JSON.stringify({e:T.e,l:T.l}))}catch(e){}};
try{if(navigator.audioSession)navigator.audioSession.type='ambient'}catch(e){}
function ac(){if(S.snd===0)return;try{if(navigator.audioSession)navigator.audioSession.type='ambient';AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume()}catch(e){}}
function cx(){if(OS){OS.forEach(o=>{try{o.stop(0)}catch(e){}});OS=null}}
// äänimerkki ajastetaan valmiiksi, jotta se soi täsmälleen nollassa ja sekoittuu musiikkiin
function sch(dt){try{if(!AC||S.snd===0)return;clearTimeout(T.sp);T.sp=setTimeout(()=>{if(AC&&(!T.e||Date.now()>T.e))AC.suspend()},(dt+1.5)*1e3);const t0=AC.currentTime+dt;
  OS=[[0,880],[.35,880],[.7,1175]].map(([o,f])=>{const s=AC.createOscillator(),g=AC.createGain();s.frequency.value=f;g.gain.setValueAtTime(0,t0+o);g.gain.linearRampToValueAtTime(.35,t0+o+.02);g.gain.linearRampToValueAtTime(0,t0+o+.25);s.connect(g);g.connect(AC.destination);s.start(t0+o);s.stop(t0+o+.3);return s})}catch(e){}}
function ar(){try{cx();if(!T.e){try{AC&&AC.suspend()}catch(e){}return}ac();sch(Math.max(0,(T.e-Date.now())/1e3))}catch(e){}}
function ts(s,l){T.e=s?Date.now()+s*1e3:0;T.d=0;T.l=l||'Tauko';tsave();ar();tk()}
function tk(){const now=Date.now(),l=T.e?Math.max(0,Math.ceil((T.e-now)/1e3)):0,done=!!T.e&&!l;
  if(done&&!T.d)T.d=1;
  if(done&&now-T.e>10000){T.e=0;T.d=0;tsave()}
  $('#tm').textContent=Math.floor(l/60)+':'+String(l%60).padStart(2,'0');
  $('#tl').textContent=T.e?(done?'Tauko ohi':T.l):'Tauko';
  $('#tx').hidden=!T.e;
  $('#bar').classList.toggle('done',!!T.e&&!l);
  const w=$('#wd'),d=S.draft;if(w)w.textContent=d&&d.t0&&d.td0==td()?'Treeni käynnissä '+Math.max(1,Math.round((now-d.t0)/6e4))+' min':''}
// iOS pysäyttää äänen taustalla; ääni ajastetaan uudelleen, kun sovellus palaa näkyviin
document.addEventListener('visibilitychange',()=>{if(document.visibilityState!='visible'){cx();try{AC&&AC.suspend()}catch(e){}return}
  cx();if(T.e&&T.e-Date.now()>300&&S.snd!==0&&AC){try{AC.resume()}catch(e){}sch((T.e-Date.now())/1e3)}tk()});
setInterval(tk,250);

// ---------- juoksu ----------
const r5=x=>Math.max(2,Math.min(10,Math.round(x*2)/2));
const ra=r=>r.rpe<=6?r.km+Math.min(1,r.km*.1):r.rpe<=8?r.km:r.km*.9;
function rb(){const R=S.runs.slice(-3);if(!R.length)return null;const l=R[R.length-1];return l.rpe>=9?ra(l):Math.max(...R.map(ra))}
const rdN=()=>S.prof&&S.prof.rd!=null?+S.prof.rd:1;
function rp(){const w=Math.min(wk(),6),need=Math.max(1,rdN()),b=rb(),o=[0,.5,1,1.5,2,0].map(x=>Math.min(10,Math.min(S.run0+(S.block-1)*1.5,8)+x)),act=[];
  for(let i=1;i<=6;i++)act.push(S.runs.filter(r=>r.d>=S.start&&ewk(r.d)==i));
  const done=act[w-1].length>=need,p=[],st=[];
  for(let i=1;i<w;i++){const m=act[i-1];p.push(m.length?Math.max(...m.map(r=>r.km)):o[i-1]);st.push(m.length?'d':'m')}
  if(done){p.push(Math.max(...act[w-1].map(r=>r.km)));st.push('d')}
  const first=done?w+1:w;let t=b==null?o[Math.min(first,6)-1]:b;
  for(let i=first;i<=6;i++){if(i==6){p.push(r5((i==first?t:p[4])*.75));st.push(i==first?'p':'');break}if(i>first)t=t+Math.min(1,t*.1);p.push(r5(t));st.push(i==first?'p':'')}
  return{p,st,w,done,next:first<=6?p[first-1]:null,nw:first}}
function rv(){const R=S.runs.filter(r=>r.min>0&&r.km>=2).slice(-5);if(!R.length)return null;const f={10:1,9:.97,8:.94,7:.91};
  const p10=Math.min(...R.map(r=>r.min/r.km*(f[r.rpe]||.88)*Math.pow(10/r.km,.06)));return{e1:p10*1.2,e2:p10*1.3,q:p10*1.06,t10:p10*10}}
const pace=(k,m)=>mm(m/k)+' /km';

// ---------- näkymä: alkukysely ja profiili ----------
function vo(ed){const q=(k,t,o,m)=>`<h3 style="margin:14px 0 6px">${t}</h3><div class="cs wrap">${o.map(([v,l])=>{const on=m?OB[k].includes(v):OB[k]==v;return`<button class="ch${on?' on':''}" data-a="ob" data-k="${k}" data-v="${v}" data-m="${m?1:''}">${l}</button>`}).join('')}</div>`;
  return`<div class="card">${ed?'<h2>Muokkaa profiilia</h2><p class="m">Muutokset kokemukseen, treenipäiviin, välineisiin, tavoitteeseen, painopisteisiin, lajiin tai rajoitteisiin luovat ohjelman uudelleen. Juoksupäivien, painon ja pituuden muutos ei muuta saliohjelmaa.</p>':'<h2>Tervetuloa</h2><p class="m">Vastaa muutamaan kysymykseen, niin sovellus muodostaa sinulle ohjelman. Voit muuttaa vastauksia myöhemmin Asetukset-välilehdellä.</p>'}`
  +q('exp','Kokemus salitreenistä',[['a','Aloittelija'],['b','Jonkin verran'],['c','Kokenut']])+q('days','Treenipäiviä viikossa',[['2','2'],['3','3'],['4','4']])+q('eq','Missä treenaat',[['s','Kuntosalilla'],['h','Kotona käsipainoilla']])+q('goal','Tavoite',[['m','Lihaskasvu'],['v','Voima'],['b','Molemmat']])+q('foc','Painopisteet (valinnainen)',[['j','Jalat'],['s','Selkä'],['r','Rinta'],['o','Olkapäät'],['k','Kädet'],['g','Pakarat'],['v','Vatsa']],1)+q('sp','Tue lajia',[['n','Ei'],['r','Juoksu'],['m','Muu laji']])+q('rd','Juoksupäiviä viikossa',[['0','0'],['1','1'],['2','2'],['3','3']])
  +`<h3 style="margin:14px 0 6px">Haluan kehittää (vapaa teksti)</h3><input id="oq" placeholder="esim. penkkipunnerrus, pakarat" value="${esc(OB.q)}"><p class="m">Sovellus tunnistaa tuttuja liikkeitä ja lihasryhmiä ja painottaa ne ohjelmassa.</p>`
  +q('lim','Rajoitteet tai vammat (valinnainen)',[['a','Alaselkä'],['p','Polvet'],['o','Olkapäät']],1)
  +(S.ag?'':`<label class="m" style="display:flex;gap:10px;align-items:flex-start;margin-top:14px"><input type="checkbox" id="oa" style="width:26px;height:26px;flex:none"${OB.ag?' checked':''}><span>Ymmärrän, että treenaan omalla vastuullani. Sovellus antaa yleisiä harjoitteluohjeita, ei lääketieteellistä neuvontaa, eikä se korvaa lääkärin tai valmentajan ohjausta. Keskeytän treenin kivun tai huonovointisuuden vuoksi. Sovelluksen tekijä ei vastaa treenaamisesta aiheutuvista vahingoista siinä laajuudessa kuin laki sallii.</span></label>`)
  +`<p class="m" style="margin-top:8px">Ohjelma ei korvaa lääkärin tai fysioterapeutin arviota.</p><div class="row" style="grid-template-columns:1fr 1fr 1fr"><label class="m">Paino (kg)<input id="ow" inputmode="decimal" value="${esc(OB.w)}"></label><label class="m">Pituus (cm)<input id="oh" inputmode="numeric" value="${esc(OB.h)}"></label><label class="m">Juoksu (km)<input id="or" inputmode="decimal" value="${esc(OB.r)}"></label></div>`
  +(ed?`<button class="btn" data-a="ogo">Tallenna profiili</button><button class="btn g" data-a="pcan">Peruuta</button>`:`<button class="btn" data-a="ogo">Luo ohjelma</button><button class="btn g" data-a="oskip">Käytä oletusohjelmaa</button>`)+`</div>`}
const rdOB=()=>{if($('#ow')){OB.w=$('#ow').value;OB.h=$('#oh').value;OB.r=$('#or').value;OB.q=$('#oq').value}if($('#oa'))OB.ag=$('#oa').checked};
const ld=()=>Object.assign(OB,{q:'',sp:'n',rd:'1',exp:'a',days:'3',eq:'s',goal:'b',foc:[],lim:[],w:'',h:''},S.prof?JSON.parse(JSON.stringify(S.prof)):{},{days:String(S.prof?S.prof.days:3),rd:String(rdN()),r:fm(S.run0)});
const pf=()=>S.prof?`${{a:'Aloittelija',b:'Jonkin verran kokemusta',c:'Kokenut'}[S.prof.exp]}, ${S.prof.days} salitreeniä ja ${rdN()} ${rdN()==1?'juoksu':'juoksua'} viikossa, ${S.prof.eq=='s'?'kuntosali':'koti'}, tavoite: ${{m:'lihaskasvu',v:'voima',b:'lihaskasvu ja voima'}[S.prof.goal]}${S.prof.w?', '+esc(S.prof.w)+' kg':''}${S.prof.h?', '+esc(S.prof.h)+' cm':''}.`:'Käytössä on oletusohjelma. Luo oma ohjelma alkutiedoillasi.';

// ---------- näkymä: treeni ----------
function tgt(n,X){return X.tk!==''&&X.tk!=null?`<div class="m">Tavoite tänään: <b>${fk(n,X.tk)} × ${esc(X.tr)}</b>${X.tt?'. Ohje: '+esc(X.tt):''}</div>`:''}
const BAR=['Back squat','Front squat','Bench press','Romanian deadlift','Conventional deadlift','Overhead press','Barbell row','Barbell hip thrust','Barbell curl'];
function wup(X,n){const k=nu(X.tk);if(k<30)return'';const a=BAR.includes(n)?[[20,10]]:[[0,0]];for(const[p,r]of[[.5,8],[.7,5],[.85,3]]){const v=r25(k*p);if(v>a[a.length-1][0]&&v<k)a.push([v,r])}return`<div class="m wu">Lämmittelysarjat: ${a.filter(([v])=>v>0).map(([v,r])=>fm(v)+' kg × '+r).join(', ')}</div>`}
function ro(n,i){const C=LB(n),ok=y=>y.n!=n;
  const og=(g,l)=>{const L=LIB.filter(y=>y.g==g&&ok(y)).sort((a,b)=>(a.k=='m'?0:1)-(b.k=='m'?0:1));return L.length?`<optgroup label="${esc(l)}">${L.map(y=>`<option>${esc(y.n)}</option>`).join('')}</optgroup>`:''};
  const o=(C?og(C.g,'Sama lihasryhmä: '+GN[C.g]):'')+Object.keys(GN).filter(g=>!C||g!=C.g).map(g=>og(g,GN[g])).join('');
  return`<div><p><b>Vaihda tilalle</b></p><p class="m">${C?'Saman lihasryhmän liikkeet ovat listan alussa. Voit valita myös toisen lihasryhmän liikkeen.':'Valitse liike kirjastosta.'}</p><select>${o}</select><button class="btn" data-a="rpo" data-x="${i}">Vaihda ohjelmaan</button><p class="m">Uusi liike jää ohjelmaan myös seuraaville kerroille. Jos haluat vaihtaa vain tänään, valitse Variaatio tänään.</p></div>`}
function card(e0,i,wi0){const d=S.draft,X=d.ex[i],e=ev(e0,i),[n,a]=nm(e),w=wt(n),l=lo(n),op=k=>UI[k+i]?'':' hidden';
  if(X.sk)return`<div class="card sk"><h3>${esc(n)}</h3><span class="m">Ohitettu</span><button class="ch" data-a="sk" data-x="${i}">Palauta</button></div>`;
  let info;
  if(l)info=`<div class="lv"><b>Viimeksi ${fd(l.d)}</b>${l.nt?`<div class="m">Muistiinpano: ${esc(l.nt)}</div>`:''}${tgt(n,X)}</div>`;
  else if(lo(a)&&sq(n,a))info=`<div class="lv"><b>Ensimmäinen kerta</b><div class="m">Aloituspaino on arvioitu tuloksistasi liikkeessä ${esc(a)} (noin 10 % kevyempi).</div>${tgt(n,X)}</div>`;
  else info=`<p class="m">${({l:'Kirjaa lisäpainoksi 0, jos teet liikkeen omalla painolla.',v:'Kirjaa koneen avustus kiloina. Valitse avustus, jolla jää 1–3 toistoa varaan.'})[w]||'Valitse kevyt aloituspaino, jolla jää 2–3 toistoa varaan.'}</p>${tgt(n,X)}`;
  const prev=l?l.s:[];
  return`<div class="card ex"><div class="eh"><h3>${esc(n)}</h3><span class="eb"><button class="ch${UI['gd'+i]?' on':''}" data-a="tg" data-k="gd" data-x="${i}">Ohje</button><button class="ch${UI['mn'+i]?' on':''}" data-a="tg" data-k="mn" data-x="${i}" aria-label="Lisätoiminnot">⋯</button></span></div>
<div class="m">${X.s.length} × ${e[2]}–${e[3]} toistoa, tauko ${fm(e[5]/60)} min</div>
<div class="gd"${op('gd')}>${gd(n)}</div>
<div class="mn"${op('mn')}><button class="ch" data-a="as" data-x="${i}">+ Sarja</button><button class="ch" data-a="rm" data-x="${i}">− Sarja</button><button class="ch" data-a="tg" data-k="rp" data-x="${i}">Vaihda liike</button><button class="ch" data-a="sw" data-x="${i}">Variaatio tänään</button><button class="ch" data-a="tg" data-k="nt" data-x="${i}">Muistiinpano</button><button class="ch" data-a="sk" data-x="${i}">Ohita</button><button class="ch" data-a="tg" data-k="hs" data-x="${i}">Historia</button></div>
<div class="rpx"${op('rp')}>${UI['rp'+i]?ro(n,i):''}</div>
<div class="hs"${op('hs')}>${UI['hs'+i]?hx(n):''}</div>
<div class="ntx"${X.nt||UI['nt'+i]?'':' hidden'}><textarea rows="2" data-nt="${i}" placeholder="Muistiinpano tähän liikkeeseen">${esc(X.nt)}</textarea></div>
${info}${i===wi0?wup(X,n):''}
<div class="row hd"><span>Sarja</span><span>${({l:'Lisäpaino (kg)',v:'Avustus (kg)'})[w]||'Paino (kg)'}</span><span>Toistot</span><span></span></div>
${X.s.map((s,j)=>`<div class="row"><b>${j+1}${prev[j]?`<small>${fm(prev[j].k)}×${prev[j].r}</small>`:''}</b><input inputmode="decimal" data-x="${i}" data-s="${j}" data-f="k" value="${esc(s.k)}" aria-label="Sarja ${j+1}, paino"><input inputmode="numeric" data-x="${i}" data-s="${j}" data-f="r" value="${esc(s.r)}" aria-label="Sarja ${j+1}, toistot"><button class="ck${s.d?' on':''}" data-a="ck" data-x="${i}" data-s="${j}" aria-label="Sarja ${j+1} tehty" aria-pressed="${s.d?'true':'false'}">✓</button></div>`).join('')}</div>`}

function vw(){
  if(!S.prof&&!S.hist.length&&!S.skip)return vo(false);
  const w=wk(),dl=w==6,ks=Object.keys(P);let h='';
  if(S.msg)h+=`<div class="card">${S.msg}<button class="btn" data-a="cm">Selvä</button></div>`;
  if(w>6){const n=S.hist.filter(x=>x.d>=S.start).length,r=S.runs.filter(x=>x.d>=S.start).length;
    return h+`<div class="card"><h2>Jakso ${S.block} on valmis</h2><p>Teit jakson aikana ${n} salitreeniä ja ${r} juoksua. Seuraava jakso käyttää tuloksiasi lähtökohtana: osa liikkeistä vaihtuu variaatioihin ja juoksumatka kasvaa.</p>${fb()}<button class="btn" data-a="nb">Aloita jakso ${S.block+1}</button></div>`}
  if(!S.hist.length&&!S.hi)h+=`<div class="card"><h3>Näin aloitat</h3><ul><li>Kirjaa jokaisesta sarjasta paino ja toistot ja merkitse sarja tehdyksi ✓-napilla. ✓ käynnistää tauon ajastimen.</li><li>Kun muutat ensimmäisen sarjan painoa, seuraavat sarjat päivittyvät samaan.</li><li>Ensimmäisellä kerralla valitse kevyt paino. Sovellus ehdottaa painot jatkossa.</li><li>⋯-valikosta voit lisätä sarjan, vaihtaa liikkeen, kirjoittaa muistiinpanon, ohittaa liikkeen tai katsoa sen historian.</li></ul><button class="btn" data-a="hi">Selvä</button></div>`;
  if(!S.draft||!S.draft.ex||!ks.includes(S.draft.day)||(!S.draft.t0&&S.draft.c!==td())){S.draft=mk(nx());UI={};sv(false)}
  const d=S.draft;ensureEx(d);
  const L=P[d.day][1];let wi0=-1;L.forEach((e0,i)=>{const n=nm(ev(e0,i))[0],x=LB(n);if(wi0<0&&x&&x.k=='m'&&x.q=='s'&&!x.w&&!d.ex[i].sk)wi0=i});
  h+=`<div class="card top"><div class="m">Jakso ${S.block}, viikko ${w}/6${dl?', kevennysviikko':''}</div><div class="cs">${ks.map(x=>`<button class="ch${x==d.day?' on':''}" data-a="day" data-d="${x}">Päivä ${x}</button>`).join('')}</div>
<h2>${esc(P[d.day][0])}</h2><p class="m">${dl?'Kevennysviikko: sarjoja on vähemmän ja painot ovat noin 10 % kevyempiä.':'Kuorma kasvaa, kun saavutat toistotavoitteen. Jätä jokaiseen sarjaan 1–3 toistoa varaan.'} Arvioitu kesto ${estMin(d.day)} min.</p><div id="wd" class="m"></div>
${d.brk?'<p class="note">Edellisestä treenistä on yli 2 viikkoa. Ehdotetut painot on kevennetty noin 10 %.</p>':''}${d.t0&&d.td0&&d.td0!==td()?`<p class="note">Keskeneräinen treeni on aloitettu ${fd(d.td0)}. Tallenna se tai tyhjennä se sivun lopusta.</p>`:''}
<details><summary>Lämmittely</summary><ul><li>Kevyt kardio 5 min (soutulaite, crosstrainer tai reipas kävely).</li><li>Liikkuvuus 3 min: lonkat, olkapäät, rintaranka.</li><li>Ensimmäiseen raskaaseen liikkeeseen 2–3 lämmittelysarjaa. Sovellus laskee painot liikkeen korttiin.</li></ul></details></div>`;
  if(!L.length)h+='<p class="m">Tässä päivässä ei ole vielä liikkeitä. Lisää ne Ohjelma-välilehdellä.</p>';
  L.forEach((e0,i)=>h+=card(e0,i,wi0));
  if(L.length)h+=`<div class="card"><label class="fl" style="margin-top:0">Muistiinpano treenistä (valinnainen)<textarea id="wn" rows="2" placeholder="esim. jaksaminen, uni tai kivut">${esc(d.note)}</textarea></label><label class="fl">Treenin päivä<input type="date" id="fdte" value="${d.td0||td()}" max="${td()}"></label><button class="btn" data-a="fin">Tallenna treeni</button></div><button class="lnk dg" data-a="drop">Tyhjennä treeni</button>`;
  return h}

function prog(n,e,ss){const k=ss[ss.length-1].k,m=Math.min(...ss.map(s=>s.r)),wv=wt(n)=='v',pw=wv?'avustuksessa':'painossa';let nk=k,nr=e[2],t;
  if(ss.length>=e[1]&&m>=e[3]){nk=wv?Math.max(0,k-Math.abs(e[4])):k+e[4];S.f[n]=0;t=wv?(nk?'vähennä avustusta: '+fm(nk)+' kg':'kokeile ilman avustusta (Pull-up)'):wt(n)=='l'?'lisää lisäpainoa: +'+fm(nk)+' kg':'nosta painoa: '+fm(nk)+' kg'}
  else if(m<e[2]){S.f[n]=(S.f[n]||0)+1;if(S.f[n]>=2){S.f[n]=0;if(wv){nk=r25(k*1.1+2.5);t='lisää avustusta: '+fm(nk)+' kg'}else if(wt(n)=='l'&&!k){t='jatka omalla painolla. Jos toistot eivät nouse, tee välillä Assisted pull-up tai Negative pull-up'}else{nk=r25(k*.9);t='kevennä painoa: '+fm(nk)+' kg'}}else t='pysy '+pw+' '+fm(k)+' kg ja hae vähintään '+e[2]+' toistoa'}
  else{S.f[n]=0;nr=Math.min(e[3],m+1);t='pysy '+pw+' '+fm(k)+' kg, tavoite '+nr+' toistoa'}
  S.w[n]={kg:nk,r:nr,t};return t}

function fin(){const d=S.draft,dl=wk()==6,L=P[d.day][1];let un=0;
  L.forEach((e0,i)=>{const X=d.ex[i];if(X&&!X.sk)X.s.forEach(s=>{if(!s.d&&s.e&&nu(s.r)>0)un++})});
  const inc=un?confirm(`${un} ${un==1?'sarja on':'sarjaa on'} kirjattu, mutta ${un==1?'sitä':'niitä'} ei ole merkitty tehdyksi ✓. Tallennetaanko ${un==1?'sekin':'nekin'}?`):false;
  const date=($('#fdte')&&$('#fdte').value)||d.td0||td(),lg={id:uid(),d:date,day:d.day,x:{}},o=[],pr=[],nt={};
  L.forEach((e0,i)=>{const X=d.ex[i];if(!X||X.sk)return;const e=ev(e0,i),[n]=nm(e);if(X.nt&&X.nt.trim())nt[n]=X.nt.trim();
    const ss=X.s.filter(s=>(s.d||(inc&&s.e))&&nu(s.r)>0).map(s=>({k:nu(s.k),r:nu(s.r)}));if(!ss.length)return;
    lg.x[n]=ss;if(pb(n,ss))pr.push(n);if(dl)return;o.push(`<li><b>${esc(n)}</b>: ${esc(prog(n,e,ss))}</li>`)});
  if(!Object.keys(lg.x).length){toast('Ei tallennettavaa. Merkitse vähintään yksi sarja tehdyksi ✓.');return}
  if(Object.keys(nt).length)lg.nt=nt;if(d.note&&d.note.trim())lg.note=d.note.trim();
  if(d.t0&&d.td0==date)lg.dur=Math.min(240,Math.max(1,Math.round((Date.now()-d.t0)/6e4)));
  S.hist.push(lg);S.hist.sort(byD);S.draft=null;UI={};
  S.msg='<h3>Treeni tallennettu</h3>'+(lg.dur?`<p class="m">Kesto ${lg.dur} min.</p>`:'')+(pr.length?'<p>🏆 Uusi ennätys: <b>'+esc(pr.join(', '))+'</b></p>':'')+(dl?'<p class="m">Kevennysviikolla painoja ei muuteta.</p>':'<p class="m">Seuraavalla kerralla:</p><ul>'+o.join('')+'</ul>');
  sv();R();scrollTo(0,0)}

// ---------- näkymä: juoksu ----------
function vr(){if(S.prof&&rdN()===0)return'<div class="card"><h2>Juoksu</h2><p class="m">Juoksu ei kuulu nykyiseen ohjelmaasi. Voit lisätä juoksupäiviä Asetukset-välilehden profiilista.</p></div>';
  const Q=rp(),v=rv(),cur=Q.next,nw=Q.nw,qk=nw<6&&(nw>=4||(cur||0)>=10),ed=UI.re&&S.runs.find(x=>x.id==UI.re);let h='<div class="card">';
  if(Q.done)h+=`<h2>Viikon juoksu tehty ✓</h2><p class="m">Viikko ${Q.w}/6: ${fm(Q.p[Q.w-1])} km.</p>`+(cur!=null?`<div class="m">Seuraava juoksu ensi viikolla</div><div class="big">${fm(cur)} km</div>`:'<p>Jakson juoksut on tehty. Seuraava jakso alkaa, kun aloitat sen Treeni-välilehdeltä.</p>');
  else h+=`<h2>Seuraava juoksu</h2><div class="m">Viikko ${Q.w}/6</div><div class="big">${fm(cur)} km</div>`;
  if(cur!=null)h+=`<p class="m">${nw==6?'Kevennysviikko: rauhallinen, lyhyempi lenkki.':'Rauhallinen vauhti, jolla pystyt vielä puhumaan.'}${qk?' Juokse viimeiset 2 km reippaammin.':''}${cur>=10?' Olet saavuttanut 10 km. Jatkossa tavoite on parantaa vauhtia.':''}</p>`;
  h+=v?`<div class="lv"><b>Tavoitevauhti</b><div class="m">Rauhallinen ${mm(v.e1)}–${mm(v.e2)} /km${qk?`, reipas osuus ${mm(v.q)} /km`:''}</div><div class="m">Arvioitu 10 km kunto: noin ${Math.round(v.t10)} min. Arvio perustuu viimeisiin juoksuihisi ja tarkentuu, kun kirjaat lisää.</div></div>`:'<p class="m">Kirjaa juoksu ajan kanssa, niin sovellus ehdottaa tavoitevauhdin.</p>';
  h+=`<div class="wk">${Q.st.map(s=>`<i class="${s}"></i>`).join('')}</div><div class="m">Jakson matkat (km): ${Q.p.map((x,i)=>Q.st[i]=='d'?fm(x)+' ✓':Q.st[i]=='m'?'–':fm(x)).join(', ')}</div>${rdN()>1?`<p class="m">Viikossa on ${rdN()} juoksua: tee yllä oleva matka pisimmällä lenkillä ja muut noin 60 % pituudesta.</p>`:''}</div>`;
  h+=`<div class="card" id="rf"><h3>${ed?'Muokkaa juoksua':'Kirjaa juoksu'}</h3><div class="row" style="grid-template-columns:1fr 1fr"><label class="m">Matka (km)<input id="rk" inputmode="decimal" value="${ed?fm(ed.km):cur!=null?fm(cur):''}"></label><label class="m">Aika (min)<input id="rm" inputmode="decimal" value="${ed?fm(ed.min):''}"></label></div>
<label class="fl">Rasittavuus (1 = hyvin kevyt, 10 = maksimi)<select id="rr">${[1,2,3,4,5,6,7,8,9,10].map(x=>`<option${x==(ed?ed.rpe:6)?' selected':''}>${x}</option>`).join('')}</select></label>
<label class="fl">Päivä<input type="date" id="rdte" value="${ed?ed.d:td()}" max="${td()}"></label>
<button class="btn" data-a="run">${ed?'Tallenna muutokset':'Tallenna juoksu'}</button>${ed?'<button class="btn g" data-a="rcan">Peruuta</button>':''}
<p class="m">Seuraava matka lasketaan kolmen viimeisen juoksun matkasta ja rasittavuudesta. Rasittavuus 1–6: matka kasvaa enintään 10 %. 7–8: matka pysyy. 9–10: matka lyhenee noin 10 %. Matka on enintään 10 km, minkä jälkeen kehitys tulee vauhdista.</p></div>`;
  if(!S.runs.length)h+=`<div class="card"><h3>Lähtötaso</h3><label class="fl">Nykyinen helppo lenkkisi (km). Käytetään, kunnes olet kirjannut ensimmäisen juoksun.<input data-r0="1" inputmode="decimal" value="${fm(S.run0)}"></label></div>`;
  else h+=`<div class="card"><h3>Edelliset juoksut</h3>${S.runs.slice(-10).reverse().map(r=>`<div class="rl"><span>${fd(r.d)}: ${fm(r.km)} km, ${fm(r.min)} min, ${pace(r.km,r.min)}, rasitus ${r.rpe}/10</span><button class="ch" data-a="re" data-id="${esc(r.id)}">Muokkaa</button><button class="ch" data-a="rd" data-id="${esc(r.id)}">Poista</button></div>`).join('')}</div>`;
  return h}

// ---------- näkymä: edistyminen ----------
function vc(){const[y,m]=CM.split('-').map(Number),f=(new Date(y,m-1,1).getDay()+6)%7,n=new Date(y,m,0).getDate(),g={},r={};
  S.hist.forEach(h=>{if(h.d.startsWith(CM)){const d=+h.d.slice(8);g[d]=(g[d]||'')+h.day}});S.runs.forEach(x=>{if(x.d.startsWith(CM))r[+x.d.slice(8)]=x.km});
  let c='';for(let i=0;i<f;i++)c+='<i></i>';for(let d=1;d<=n;d++)c+=`<b class="cd${g[d]?' g':''}${r[d]?' r':''}${CM+'-'+String(d).padStart(2,'0')==td()?' t':''}">${d}<small>${esc(g[d]||(r[d]?fm(r[d])+' km':''))}</small></b>`;
  return`<div class="card"><h3>Kalenteri</h3><div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0"><button class="ch" data-a="cn" data-v="-1" aria-label="Edellinen kuukausi">‹</button><b>${['tammikuu','helmikuu','maaliskuu','huhtikuu','toukokuu','kesäkuu','heinäkuu','elokuu','syyskuu','lokakuu','marraskuu','joulukuu'][m-1]} ${y}</b><button class="ch" data-a="cn" data-v="1" aria-label="Seuraava kuukausi">›</button></div><div class="cal">${['Ma','Ti','Ke','To','Pe','La','Su'].map(x=>`<span class="m">${x}</span>`).join('')}${c}</div><p class="m">Tässä kuussa ${Object.keys(g).length} salipäivää ja ${Object.keys(r).length} juoksupäivää.</p><span class="lg">Sali</span><span class="lg o">Juoksu</span></div>`}
function wbars(){const now=dt(td()),mon=+now-((now.getUTCDay()+6)%7)*864e5,W=[];
  for(let i=11;i>=0;i--){const s=new Date(mon-i*6048e5).toISOString().slice(0,10),e=new Date(mon-(i-1)*6048e5).toISOString().slice(0,10);W.push({s,g:S.hist.filter(h=>h.d>=s&&h.d<e).length,r:S.runs.filter(h=>h.d>=s&&h.d<e).length})}
  const mx=Math.max(3,...W.map(w=>Math.max(w.g,w.r))),Wd=320,H=120,l=22,b=22,t=8,cw=(Wd-l-4)/12,Y=v=>t+(1-v/mx)*(H-t-b),bw=cw/2-2;
  return`<svg class="chart" viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Treenit viikossa"><line class="gl" x1="${l}" x2="${Wd}" y1="${Y(0)}" y2="${Y(0)}"/><line class="gl" x1="${l}" x2="${Wd}" y1="${Y(mx)}" y2="${Y(mx)}"/><text x="${l-5}" y="${Y(mx)+4}" text-anchor="end">${mx}</text><text x="${l-5}" y="${Y(0)+4}" text-anchor="end">0</text>${W.map((w,i)=>{const x=l+2+i*cw;return(w.g?`<rect class="ba" x="${x.toFixed(1)}" y="${Y(w.g).toFixed(1)}" width="${bw.toFixed(1)}" height="${(Y(0)-Y(w.g)).toFixed(1)}" rx="2"/>`:'')+(w.r?`<rect class="bo" x="${(x+bw+1).toFixed(1)}" y="${Y(w.r).toFixed(1)}" width="${bw.toFixed(1)}" height="${(Y(0)-Y(w.r)).toFixed(1)}" rx="2"/>`:'')}).join('')}<text x="${l+2}" y="${H-5}">${fd(W[0].s)}</text><text x="${Wd}" y="${H-5}" text-anchor="end">${fd(W[11].s)}</text></svg><span class="lg">Salitreenit</span><span class="lg o">Juoksut</span><p class="m">Viikot alkavat maanantaista. Viimeiset 12 viikkoa.</p>`}
function vg(){const ns=[...new Set(S.hist.flatMap(h=>Object.keys(h.x)))].sort(),sel=UI.gs&&ns.includes(UI.gs)?UI.gs:'';
  let h=vc()+`<div class="card"><h3>Treenit viikossa</h3>${wbars()}</div>`;
  h+=`<div class="card"><h3>Liikkeen kehitys</h3>${ns.length?`<select id="gs"><option value="">Valitse liike</option>${ns.map(n=>`<option${n==sel?' selected':''}>${esc(n)}</option>`).join('')}</select><div id="gx" style="margin-top:8px">${sel?hx(sel):'<p class="m">Valitse liike nähdäksesi kehityksen.</p>'}</div>`:'<p class="m">Kaaviot ilmestyvät, kun olet tallentanut treenejä.</p>'}</div>`;
  h+=`<div class="card"><h3>Juoksut</h3>${lch(S.runs.map(r=>({x:r.d,y:r.km})),'Matka (km)')}${S.runs.some(r=>r.min>0)?lch(S.runs.filter(r=>r.min>0&&r.km>0).map(r=>({x:r.d,y:r.min/r.km})),'Vauhti (min/km), pienempi on nopeampi',mm):''}</div>`;
  h+=`<div class="card"><h3>Treenihistoria</h3>${S.hist.length?S.hist.slice(-30).reverse().map(x=>{let n=0;for(const k in x.x)n+=x.x[k].length;return`<details class="hi"><summary>${fd(x.d)}: päivä ${esc(x.day)}, ${n} sarjaa${x.dur?', '+x.dur+' min':''}</summary>${Object.keys(x.x).map(k=>`<p class="m"><b>${esc(k)}</b>: ${x.x[k].map(s=>fk(k,s.k)+' × '+s.r).join(', ')}${x.nt&&x.nt[k]?`<br>Muistiinpano: ${esc(x.nt[k])}`:''}</p>`).join('')}${x.note?`<p class="m">Treenin muistiinpano: ${esc(x.note)}</p>`:''}<button class="ch" data-a="dh" data-id="${esc(x.id)}">Poista treeni</button></details>`}).join(''):'<p class="m">Ei vielä tallennettuja treenejä.</p>'}</div>`;
  return h}

// ---------- näkymä: ohjelma ----------
function vp(){const w=wk();let h=`<div class="card"><h2>Jakso ${S.block}</h2><p>Yksi jakso kestää <b>6 treeniviikkoa</b>: viikot 1–5 kuorma kasvaa ja viikko 6 on kevennysviikko, jolloin sarjoja on vähemmän ja painot kevyempiä. Viikko, jolla et treenaa, ei kuluta jaksoa. Jakson jälkeen sovellus luo uuden jakson: osa liikkeistä vaihtuu variaatioihin, aloituspainot lasketaan tuloksistasi ja juoksumatka kasvaa.</p>
<div class="wk">${[1,2,3,4,5,6].map(i=>`<i class="${i<w?'d':i==w?'p':''}"></i>`).join('')}</div><p class="m">Viikko ${Math.min(w,6)}/6${w>6?' (jakso valmis)':''}. Jakso alkoi ${fd(S.start)}</p><button class="btn g" data-a="nbq">Aloita uusi jakso nyt</button></div>
<div class="card"><h3>Viikkorytmi</h3><ul><li>Ma: sali (seuraava päivä vuorossa)</li><li>Ke: sali</li><li>Pe: sali (valinnainen kolmas kerta)</li><li>La tai su: juoksu</li></ul><p class="m">Jos ehdit vain kaksi salikertaa, sovellus jatkaa päivien kiertoa, joten kaikki liikkeet tulevat vuorollaan. Juokse mieluiten eri päivänä kuin jalkatreeni.</p></div>
<div class="card"><h3>Tämän jakson liikkeet</h3><p class="m">Muuta järjestystä nuolilla. Vaihda liike treenin aikana liikkeen ⋯-valikosta.</p>${Object.keys(P).map(k=>{const L=P[k][1];return`<p class="dh">${esc(P[k][0])}<span class="m" style="font-weight:400">, arvioitu kesto ${estMin(k)} min</span></p>${L.length?L.map((e,i)=>`<div class="pl"><span>${esc(nm(e)[0])}<small class="m">${e[1]} × ${e[2]}–${e[3]}</small></span><button class="ib" data-a="mu" data-k="${k}" data-x="${i}" aria-label="Siirrä ylös"${i?'':' disabled'}>↑</button><button class="ib" data-a="md" data-k="${k}" data-x="${i}" aria-label="Siirrä alas"${i<L.length-1?'':' disabled'}>↓</button><button class="ib" data-a="rx" data-k="${k}" data-x="${i}" aria-label="Poista liike">✕</button></div>`).join(''):'<p class="m">Ei liikkeitä.</p>'}`}).join('')}</div>
<div class="card"><h3>Lisää liike ohjelmaan</h3><p class="m">Valitse liike kirjastosta tai kirjoita oma liike.</p><input id="an" list="lib" placeholder="Liikkeen nimi" autocomplete="off" maxlength="60"><select id="ad" style="margin-top:8px">${Object.keys(P).map(k=>`<option value="${k}">${esc(P[k][0])}</option>`).join('')}</select><button class="btn" data-a="ad">Lisää</button><datalist id="lib">${LIB.map(x=>`<option value="${esc(x.n)}">`).join('')}</datalist></div>
<details class="card"><summary>Liikekirjasto (${LIB.length} liikettä)</summary>${Object.keys(GN).map(g=>`<p class="dh">${GN[g]}</p><p class="m">${LIB.filter(x=>x.g==g).map(x=>esc(x.n)).join(', ')}</p>`).join('')}</details>
<div class="card"><h3>Ohjelmakirjasto</h3><input id="ln" placeholder="Ohjelman nimi" maxlength="40"><button class="btn" data-a="ls">Tallenna nykyinen ohjelma</button>${(S.lib||[]).map((l,i)=>`<div class="rl"><b>${esc(l.n)}</b><button class="ch" data-a="lu" data-x="${i}">Käytä</button><button class="ch" data-a="lx" data-x="${i}">Poista</button></div>`).join('')}</div>
<div class="card"><h3>Rakenna oma ohjelma</h3><p class="m">Luo tyhjä ohjelma ja lisää liikkeet itse Lisää liike -kortista. Tallenna nykyinen ohjelma ensin kirjastoon, sillä uusi ohjelma korvaa sen. Valitse treenipäivien määrä:</p><div class="cs wrap" style="margin-top:8px">${[2,3,4,5,6].map(n=>`<button class="ch" data-a="eb" data-n="${n}">${n} päivää</button>`).join('')}</div></div>
<details class="card"><summary>Vinkit</summary><ul>
<li><b>Uni:</b> 7–9 tuntia yössä. Lihas kasvaa levossa, ei salilla.</li>
<li><b>Proteiini:</b> noin 1,6–2,2 g painokiloa kohti päivässä. Lihaskasvuun tarvitaan myös riittävästi ruokaa, pieni energiaylijäämä auttaa.</li>
<li><b>Askeleet:</b> 7 000–10 000 askelta päivässä tukee palautumista ja kuntoa.</li>
<li><b>Tekniikka ensin:</b> lisää painoa vasta, kun liike sujuu hallitusti. Jos jokin sattuu (muu kuin lihasväsymys), keskeytä liike.</li>
<li><b>Kevennysviikko:</b> älä ohita sitä. Se estää ylikuormituksen ja parantaa seuraavan jakson tuloksia.</li>
<li><b>Tauko treenistä:</b> jakso jatkuu siitä, mihin jäit. Jos tauko venyy yli kahteen viikkoon, sovellus keventää ehdotettuja painoja noin 10 %.</li>
<li><b>Mittaa kehitystä:</b> ota kuva ja kehonpaino samoissa olosuhteissa 4 viikon välein. Paino ei ole ainoa mittari.</li>
<li><b>Juoksukengät:</b> vaihda 600–800 km välein. Lisää viikkomatkaa korkeintaan 10 % kerrallaan.</li>
<li><b>Terveys:</b> jos sinulla on sairaus tai vamma, keskustele ensin lääkärin tai fysioterapeutin kanssa.</li></ul></details>`;
  return h}

// ---------- näkymä: asetukset ----------
function vs(){let h=UI.pe?vo(true):`<div class="card"><h2>Profiili</h2><p class="m">${pf()}</p><button class="btn g" data-a="pe">Muokkaa profiilia</button></div>`;
  h+=`<div class="card"><h3>Tauon äänimerkki</h3><div class="cs" style="margin-top:8px">${[[1,'Päällä'],[0,'Pois']].map(([v,l])=>`<button class="ch${(S.snd===0?0:1)==v?' on':''}" data-a="snd" data-v="${v}">${l}</button>`).join('')}</div><p class="m">${S.snd===0?'Tauon loppu näkyy ajastinpalkin sinisenä värinä. Sovellus ei käytä ääntä lainkaan, joten musiikki ja äänikirjat soivat varmasti normaalisti.':'Merkkiääni soi tauon lopussa sekoittuen musiikkiin. Ääni ei kuulu äänettömällä tilalla tai lukitulla näytöllä. Jos musiikki tai äänikirja silti katkeaa, valitse Pois.'}</p></div>`;
  h+=`<div class="card"><h3>Teema</h3><div class="cs" style="margin-top:8px">${[['a','Automaattinen'],['l','Vaalea'],['d','Tumma']].map(([v,l])=>`<button class="ch${(S.theme||'a')==v?' on':''}" data-a="th" data-v="${v}">${l}</button>`).join('')}</div><p class="m">Automaattinen seuraa puhelimen asetusta.</p></div>`;
  h+=`<div class="card"><h3>Pilvitallennus</h3>${!CL?'<p class="m">Pilvitallennus ei ole käytössä tässä versiossa. Se vaatii GitHub-version ja omat Firebase-asetukset.</p>':CL.st=='in'?`<p class="m">Kirjautuneena: ${esc(CL.email)}. Tiedot tallentuvat pilveen automaattisesti, ja eri laitteiden treenit yhdistetään.</p><button class="btn g" data-a="co">Kirjaudu ulos</button>`:'<p class="m">Kirjaudu, jos haluat tallentaa tulokset pilveen.</p><button class="btn" data-a="ci">Kirjaudu Googlella</button>'}</div>`;
  h+=`<div class="card"><h3>Varmuuskopio</h3><p class="m">Tiedot tallentuvat tämän laitteen selaimeen. Tallenna varmuuskopio esimerkiksi Tiedostoihin ja palauta se tarvittaessa. Palautus korvaa nykyiset tiedot.</p><button class="btn" data-a="sh">Jaa varmuuskopio tiedostona</button><label class="btn g">Palauta tiedostosta<input id="bf" type="file" accept=".json,application/json" hidden></label><details style="margin-top:10px"><summary class="m">Varmuuskopio tekstinä</summary><textarea id="bk" rows="3" placeholder="Liitä varmuuskopio tähän" style="margin-top:8px"></textarea><button class="btn g" data-a="cp">Kopioi varmuuskopio tekstinä</button><button class="btn g" data-a="rs">Palauta liitetystä tekstistä</button></details></div>`;
  h+=`<div class="card"><h3>Vie tulokset</h3><p class="m">Kaikki sarjat ja juoksut taulukkona (CSV), jonka voi avata esimerkiksi Numbersissa tai Excelissä.</p><button class="btn g" data-a="csv">Vie taulukkona</button></div><p class="m ver">Oma PT, versio ${VERSION}</p>`;
  return h}

// ---------- tiedostot ----------
async function saveFile(name,type,text){const f=new File([text],name,{type});try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return}}catch(e){if(e&&e.name=='AbortError')return}
  const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
function csvText(){const q=v=>{v=String(v??'');return/[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};const rows=[['Päivä','Tyyppi','Treenipäivä','Liike','Sarja','Paino (kg)','Toistot','Matka (km)','Aika (min)','Rasitus','Muistiinpano']];
  for(const h of S.hist)for(const n in h.x)h.x[n].forEach((s,i)=>rows.push([h.d,'Sali',h.day,n,i+1,fm(s.k),s.r,'','','',i==0?(h.nt&&h.nt[n])||'':'']));
  for(const r of S.runs)rows.push([r.d,'Juoksu','','','','','',fm(r.km),fm(r.min),r.rpe,'']);
  return'﻿'+rows.map(r=>r.map(q).join(';')).join('\n')}
function restore(txt){let o;try{o=JSON.parse(txt)}catch(e){toast('Varmuuskopio ei kelpaa. Tarkista, että tiedosto tai teksti on kokonainen.');return}
  if(!o||typeof o!='object'||!(Array.isArray(o.hist)||typeof o.block=='number')){toast('Varmuuskopio ei kelpaa: siitä puuttuvat treenitiedot.');return}
  const n=(o.hist||[]).length,r=(o.runs||[]).length;
  if(!confirm(`Palautetaanko varmuuskopio (${n} treeniä ja ${r} juoksua)? Nykyiset tiedot tällä laitteella korvataan.`))return;
  try{localStorage.setItem(K+'-ennen-palautusta',JSON.stringify(S))}catch(e){}
  S=Object.assign(base(),o);migrate();P=S.prog||DEF;UI={};sv();R();toast(`Varmuuskopio palautettu: ${n} treeniä ja ${r} juoksua.`)}

// ---------- synkronoinnin yhdistäminen: treenit ja juoksut yhdistetään tunnisteiden mukaan ----------
function mergeState(a,b){norm(a);norm(b);const del=new Set([...(a.del||[]),...(b.del||[])]),nw=(b.ts||0)>(a.ts||0)?b:a,ol=nw===a?b:a,m=Object.assign({},ol,nw);
  const un=(x,y)=>{const mp=new Map();for(const e of[...(x||[]),...(y||[])])if(e&&e.id&&!del.has(e.id)&&!mp.has(e.id))mp.set(e.id,e);return[...mp.values()].sort(byD)};
  m.hist=un(nw.hist,ol.hist);m.runs=un(nw.runs,ol.runs);m.del=[...del].slice(-500);m.draft=a.draft;return m}
window.APP={get:()=>S,merge:mergeState,set:m=>{S=Object.assign(base(),m);migrate();P=S.prog||DEF;sv(false);R()},cloud:c=>{CL=c;if(tab=='s')R()}};

// ---------- piirto ----------
const ap=()=>{const r=document.documentElement;if(S.theme=='l')r.dataset.theme='light';else if(S.theme=='d')r.dataset.theme='dark';else r.removeAttribute('data-theme')};
function R(){P=S.prog||DEF;ap();$('#v').innerHTML={w:vw,r:vr,g:vg,p:vp,s:vs}[tab]();document.querySelectorAll('nav button').forEach(b=>{const on=b.dataset.t==tab;b.classList.toggle('on',on);b.setAttribute('aria-current',on?'page':'false')});tk()}

// ---------- ohjelman muokkaus ----------
function moveEx(k,i,j){const L=P[k][1];if(j<0||j>=L.length)return;[L[i],L[j]]=[L[j],L[i]];S.prog=P;const d=S.draft;if(d&&d.day==k&&d.ex&&d.ex[i]&&d.ex[j])[d.ex[i],d.ex[j]]=[d.ex[j],d.ex[i]];UI={};sv();R()}
const delId=id=>{if(id&&!S.del.includes(id))S.del.push(id)};

// ---------- syötteet ----------
document.addEventListener('focusin',e=>{if(e.target.matches('input:not([type=checkbox]):not([type=file]),textarea,select'))document.body.classList.add('kb')});
document.addEventListener('focusout',()=>setTimeout(()=>{if(!document.activeElement||!document.activeElement.matches('input,textarea,select'))document.body.classList.remove('kb')},50));
document.addEventListener('input',e=>{const t=e.target,d=S.draft;
  if(t.dataset.f&&d&&d.ex){const i=+t.dataset.x,j=+t.dataset.s,f=t.dataset.f,X=d.ex[i],s=X.s[j],old=String(s[f]);s[f]=t.value;s.e=1;touch();
    // painon tai toistojen muutos päivittyy seuraaviin sarjoihin, joita et ole vielä kirjannut
    for(let q=j+1;q<X.s.length;q++){const z=X.s[q];if(z.d||z.e)continue;if(String(z[f])===old||z[f]===''){z[f]=t.value;const inp=document.querySelector(`input[data-x="${i}"][data-s="${q}"][data-f="${f}"]`);if(inp)inp.value=t.value}}
    sv(false);return}
  if(t.dataset.nt!=null&&d){d.ex[+t.dataset.nt].nt=t.value;touch();sv(false);return}
  if(t.id=='wn'&&d){d.note=t.value;sv(false)}});
document.addEventListener('change',e=>{const t=e.target;
  if(t.id=='gs'){UI.gs=t.value;$('#gx').innerHTML=t.value?hx(t.value):'<p class="m">Valitse liike nähdäksesi kehityksen.</p>'}
  if(t.id=='bf'&&t.files[0]){t.files[0].text().then(restore);t.value=''}
  if(t.dataset.r0){S.run0=Math.min(10,nu(t.value)||5);sv();R()}});

document.addEventListener('click',e=>{const nb=e.target.closest('nav button');if(nb){tab=nb.dataset.t;UI.pe=0;UI.re=0;R();scrollTo(0,0);return}
  const t=e.target.closest('[data-a]');if(!t)return;const a=t.dataset.a,x=+t.dataset.x,s=+t.dataset.s,d=S.draft;
  switch(a){
  case'ck':{const X=d.ex[x],o=X.s[s];if(!o.d&&!(nu(o.r)>0)){toast('Kirjaa ensin toistot.');const inp=document.querySelector(`input[data-x="${x}"][data-s="${s}"][data-f="r"]`);if(inp)inp.focus();return}
    o.d=o.d?0:1;touch();t.classList.toggle('on',!!o.d);t.setAttribute('aria-pressed',o.d?'true':'false');if(o.d){const ee=ev(P[d.day][1][x],x);ts(ee[5],nm(ee)[0])}sv(false);break}
  case'tm':ts(+t.dataset.s);break;
  case'add':if(!T.e||T.e<Date.now()){T.e=Date.now();T.l='Tauko'}T.e+=3e4;T.d=0;tsave();ar();tk();break;
  case'day':{const v=t.dataset.d;if(v===d.day)return;if(d.t0&&!confirm(`Vaihdetaanko päivään ${v}? Tämän treenin kirjaukset poistuvat.`))return;S.draft=mk(v);UI={};sv(false);R();break}
  case'tg':{const k=t.dataset.k+x;UI[k]=!UI[k];R();break}
  case'as':{const X=d.ex[x],l=X.s[X.s.length-1]||{k:X.tk,r:X.tr};X.s.push({k:l.k,r:l.r,d:0});touch();sv(false);R();break}
  case'rm':{const X=d.ex[x];if(X.s.length>1){const l=X.s[X.s.length-1];if(l.d&&!confirm('Viimeinen sarja on merkitty tehdyksi. Poistetaanko se?'))return;X.s.pop()}sv(false);R();break}
  case'rpo':{const k=d.day,e0=P[k][1][x],sel=t.closest('.rpx').querySelector('select').value,Ln=LB(sel);if(!Ln)return;const[cn,pn]=nm(ev(e0,x)),C=LB(cn),Pn=LIB.find(y=>y.n==pn&&y.g==Ln.g&&y.n!=sel),al=LIB.filter(y=>y.g==Ln.g&&y.n!=sel&&y.n!=cn),alt=Pn||al.find(y=>y.k==Ln.k&&(Ln.q!='b'||y.q=='b'))||al[0]||Ln,v=(S.block-1)%2,pr=[];pr[v]=sel;pr[1-v]=alt.n;const sm=C&&C.g==Ln.g&&C.k==Ln.k;
    P[k][1][x]=[pr.join('|'),e0[1],sm?e0[2]:Ln.lo,sm?e0[3]:Ln.hi,Ln.st,sm?e0[5]:Ln.rs];S.prog=P;const nt=d.ex[x].nt;d.ex[x]=mkEx(P[k][1][x],wk()==6,d.brk);d.ex[x].nt=nt;UI['rp'+x]=0;UI['mn'+x]=0;sv();R();toast(`${sel} vaihdettu ohjelmaan.`);break}
  case'sw':{const X=d.ex[x],sw=X.sw?0:1;X.sw=sw;const nX=mkEx(ev(P[d.day][1][x],x),wk()==6,d.brk);nX.sw=sw;nX.nt=X.nt;d.ex[x]=nX;sv(false);R();break}
  case'sk':d.ex[x].sk=d.ex[x].sk?0:1;UI['mn'+x]=0;sv(false);R();break;
  case'dh':{const i=S.hist.findIndex(h=>h.id==t.dataset.id);if(i<0||!confirm(`Poistetaanko treeni ${fd(S.hist[i].d)}?`))return;delId(S.hist[i].id);S.hist.splice(i,1);sv();R();toast('Treeni poistettu.');break}
  case'sh':saveFile('oma-pt-varmuuskopio-'+td()+'.json','application/json',JSON.stringify(S));break;
  case'csv':saveFile('oma-pt-tulokset-'+td()+'.csv','text/csv',csvText());break;
  case'hi':S.hi=1;sv();R();break;
  case'ob':{rdOB();const k=t.dataset.k,v=t.dataset.v;if(t.dataset.m){const j=OB[k].indexOf(v);j<0?OB[k].push(v):OB[k].splice(j,1)}else OB[k]=v;R();break}
  case'pe':ld();UI.pe=1;R();scrollTo(0,0);break;
  case'pcan':UI.pe=0;R();break;
  case'ogo':{rdOB();if(!S.ag&&!OB.ag){const l=$('#oa').closest('label');l.style.outline='2px solid var(--a)';l.scrollIntoView({block:'center'});toast('Hyväksy ensin ehdot.');return}
    const o={exp:OB.exp,days:+OB.days,eq:OB.eq,goal:OB.goal,foc:[...OB.foc],lim:[...OB.lim],w:nu(OB.w)||'',h:nu(OB.h)||'',q:OB.q.slice(0,200),sp:OB.sp,rd:OB.rd};
    const first=!S.prof,ga=k=>[...(k||[])].sort().join(),gym=first||['exp','days','eq','goal','sp','q'].some(k=>String(S.prof[k]??'')!==String(o[k]??''))||ga(S.prof.foc)!==ga(o.foc)||ga(S.prof.lim)!==ga(o.lim);
    if(gym&&(S.hist.length||S.prog)&&!confirm('Saliohjelma luodaan uudelleen näiden tietojen perusteella ja uusi 6 viikon jakso alkaa. Omat liikemuutoksesi poistuvat, mutta tulokset ja painot säilyvät. Voit tallentaa nykyisen ohjelman ensin Ohjelma-välilehden ohjelmakirjastoon. Jatketaanko?'))return;
    if(!S.ag)S.ag=td();S.run0=Math.min(10,nu(OB.r)||S.run0);S.prof=o;UI.pe=0;
    if(gym){S.prog=P=gen(o);S.draft=null;S.start=td();tab='w';S.msg='<h3>Ohjelma luotu</h3><p class="m">Uusi 6 viikon jakso alkoi. Painot säilyvät liikkeen nimen mukaan.</p>'}else toast('Profiili tallennettu. Saliohjelma ei muuttunut.');
    sv();R();scrollTo(0,0);break}
  case'oskip':S.skip=1;sv();R();break;
  case'ad':{const n=$('#an').value.replace(/\|/g,'/').trim().slice(0,60),k=$('#ad').value;if(!n){toast('Kirjoita liikkeen nimi.');return}const l=LIB.find(y=>y.n.toLowerCase()==n.toLowerCase());const e=l?[l.n+'|'+l.n,3,l.lo,l.hi,l.st,l.rs]:[n+'|'+n,3,8,12,2.5,90];P[k][1].push(e);S.prog=P;if(d&&d.day==k&&d.ex)d.ex.push(mkEx(e,wk()==6,d.brk));sv();R();toast(`${l?l.n:n} lisätty päivään ${k}.`);break}
  case'mu':moveEx(t.dataset.k,x,x-1);break;
  case'md':moveEx(t.dataset.k,x,x+1);break;
  case'rx':{const k=t.dataset.k,n=nm(P[k][1][x])[0];if(!confirm(`Poistetaanko ${n} päivästä ${k}?`))return;P[k][1].splice(x,1);S.prog=P;if(d&&d.day==k&&d.ex)d.ex.splice(x,1);UI={};sv();R();break}
  case'ls':{S.lib=S.lib||[];const n=$('#ln').value.trim().slice(0,40)||'Ohjelma '+(S.lib.length+1);S.lib.push({n,prog:JSON.parse(JSON.stringify(P)),prof:S.prof||null});sv();R();toast(`Ohjelma ${n} tallennettu.`);break}
  case'lu':{const l=S.lib[x];if(!confirm(`Otetaanko ohjelma ${l.n} käyttöön? Nykyinen ohjelma korvataan ja uusi 6 viikon jakso alkaa.`))return;S.prog=P=JSON.parse(JSON.stringify(l.prog));if(l.prof)S.prof=JSON.parse(JSON.stringify(l.prof));S.draft=null;S.start=td();S.msg='<h3>Ohjelma otettu käyttöön</h3><p class="m">'+esc(l.n)+'. Uusi 6 viikon jakso alkoi.</p>';tab='w';sv();R();scrollTo(0,0);break}
  case'lx':if(!confirm(`Poistetaanko ohjelma ${S.lib[x].n} kirjastosta?`))return;S.lib.splice(x,1);sv();R();break;
  case'eb':{const n=+t.dataset.n;if(!confirm(`Luodaanko tyhjä ${n} päivän ohjelma? Nykyinen ohjelma korvataan.`))return;const r={};for(let i=0;i<n;i++)r['ABCDEF'[i]]=['Päivä '+'ABCDEF'[i],[]];S.prog=P=r;S.draft=null;S.start=td();sv();R();scrollTo(0,0);break}
  case'cn':{const dd=new Date(+CM.slice(0,4),+CM.slice(5)-1+(+t.dataset.v),1);CM=dd.getFullYear()+'-'+String(dd.getMonth()+1).padStart(2,'0');R();break}
  case'ci':window.cloudIn&&window.cloudIn();break;
  case'co':window.cloudOut&&window.cloudOut();break;
  case'snd':S.snd=+t.dataset.v;if(!S.snd){cx();try{AC&&AC.close()}catch(e){}AC=null}sv();R();break;
  case'th':S.theme=t.dataset.v;sv();R();break;
  case'fin':fin();break;
  case'drop':if(!confirm('Tyhjennetäänkö tämän treenin kirjaukset? Tätä ei voi perua.'))return;S.draft=null;UI={};sv(false);R();scrollTo(0,0);break;
  case'cm':S.msg=null;sv(false);R();break;
  case'nbq':if(!confirm('Aloitetaanko uusi jakso nyt? Nykyinen jakso päättyy, ja sarjamäärät ja toistoalueet päivitetään tulostesi mukaan.'))return;// jatkuu
  case'nb':{const ch=adj();S.block++;S.start=td();S.draft=null;UI={};S.msg='<h3>Uusi jakso alkoi</h3><p class="m">Osa liikkeistä vaihtui variaatioihin ja aloituspainot laskettiin edellisistä tuloksistasi.</p>'+(ch.length?'<p class="m">Tulostesi perusteella tehdyt muutokset:</p><ul>'+ch.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'');tab='w';sv();R();scrollTo(0,0);break}
  case'run':{const km=nu($('#rk').value),min=nu($('#rm').value),dd=$('#rdte').value||td(),rpe=+$('#rr').value;if(!(km>0&&min>0)){toast('Kirjaa matka ja aika.');(km>0?$('#rm'):$('#rk')).focus();return}
    if(km>42.2&&!confirm(`Tallennetaanko ${fm(km)} km? Tarkista, ettei matkassa ole kirjoitusvirhettä.`))return;
    const ed=UI.re&&S.runs.find(r=>r.id==UI.re);if(ed){Object.assign(ed,{d:dd,km,min,rpe});UI.re=0;toast('Juoksu päivitetty.')}else{S.runs.push({id:uid(),d:dd,km,min,rpe});toast('Juoksu tallennettu.')}
    S.runs.sort(byD);sv();R();scrollTo(0,0);break}
  case're':UI.re=t.dataset.id;R();$('#rf').scrollIntoView({block:'start'});break;
  case'rcan':UI.re=0;R();break;
  case'rd':{const i=S.runs.findIndex(r=>r.id==t.dataset.id);if(i<0||!confirm(`Poistetaanko juoksu ${fd(S.runs[i].d)} (${fm(S.runs[i].km)} km)?`))return;delId(S.runs[i].id);S.runs.splice(i,1);if(UI.re==t.dataset.id)UI.re=0;sv();R();toast('Juoksu poistettu.');break}
  case'cp':{const j=JSON.stringify(S);$('#bk').value=j;try{navigator.clipboard.writeText(j).then(()=>toast('Varmuuskopio kopioitu.'))}catch(e){}$('#bk').select();break}
  case'rs':restore($('#bk').value);break;
  }
});

R();
// näyttö pysyy päällä treenin aikana
let WL=null;async function wl(){try{if('wakeLock' in navigator&&document.visibilityState=='visible'&&!WL){WL=await navigator.wakeLock.request('screen');WL.addEventListener('release',()=>{WL=null})}}catch(e){}}
document.addEventListener('visibilitychange',wl);document.addEventListener('click',wl);wl();
// offline-tuki
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
