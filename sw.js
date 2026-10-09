// Flegrea Demo: abre rápido y funciona aunque se vaya el internet
const C='flegrea-v1';
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(C).then(c=>c.addAll(['/','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png']).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{ const r=e.request; if(r.method!=='GET'||new URL(r.url).origin!==location.origin) return;
  e.respondWith(fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(C).then(c=>c.put(r.mode==='navigate'?'/':r,cp)); } return res; }).catch(()=>caches.match(r.mode==='navigate'?'/':r).then(m=>m||caches.match('/')))); });
