/* Service worker Phi Board Games: luôn lấy bản mới từ mạng, mất mạng thì dùng bản đã lưu */
const C='pbg-v6';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{ const r=e.request; if(r.method!=='GET'||new URL(r.url).origin!==location.origin) return;
  const fresh=(r.mode==='navigate'||/\.(html|js|css|json)(\?|$)/.test(new URL(r.url).pathname)); 
  e.respondWith((fresh?fetch(r.url,{cache:'no-cache',credentials:'same-origin'}):fetch(r)).then(res=>{ if(res&&res.ok){ const cp=res.clone(); caches.open(C).then(c=>c.put(r,cp)); } return res; }).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html')))); });
