const C='oma-pt-v18',F=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','firebase-config.js','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  const save=res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp))}return res};
  // sivu ja asetukset haetaan ensin verkosta, jotta uusi versio tulee käyttöön heti; ilman verkkoa käytetään tallennettua
  const u=new URL(e.request.url).pathname;
  if(e.request.mode==='navigate'||u.endsWith('/')||u.endsWith('.html')||u.endsWith('firebase-config.js')){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(save).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));return;
  }
  e.respondWith(caches.match(e.request).then(r=>{const n=fetch(e.request).then(save).catch(()=>r);return r||n}));
});
