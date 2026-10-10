// Flegrea Demo: abre rápido y funciona aunque se vaya el internet
const C='flegrea-v2';
self.addEventListener('install',e=>{ self.skipWaiting(); e.waitUntil(caches.open(C).then(c=>c.addAll(['/','/manifest.webmanifest','/icons/icon-192.png','/icons/icon-512.png']).catch(()=>{}))); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{ const r=e.request, u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/')||u.pathname.startsWith('/admin')) return;
  const key=r.mode==='navigate'?u.pathname:r;
  e.respondWith(fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(C).then(c=>c.put(key,cp)); } return res; }).catch(()=>caches.match(key).then(m=>m||caches.match('/')))); });
