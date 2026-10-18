'use strict';
// QUARANTINE Z — the service worker (v6.81, served from the site's root; pwa.js registers it).
// The game's page always comes from the network first, so a new version is there at once (players on different versions cannot
// play together); a copy is kept for a start without a network (the title, the range and the solo modes open; multiplayer and the
// account need the network). Nothing else is touched: the account server, PeerJS, the sounds, the manifest, the icons and the other
// pages (/admin, /privacy, /terms) go as they would without a worker — where the browser has static routes, without even waking it.
const CACHE='qz-page-1';
self.addEventListener('install',e=>{
  try{if(e.addRoutes)Promise.resolve(e.addRoutes({condition:{not:{requestMode:'navigate'}},source:'network'})).catch(()=>{})}catch(err){}
  e.waitUntil(caches.open(CACHE).then(c=>c.add('/')).catch(()=>{}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);await self.clients.claim()})()));
self.addEventListener('fetch',e=>{const q=e.request;if(q.mode!=='navigate'||q.method!=='GET')return;const u=new URL(q.url);
  // (the page only — '/' and '/index.html', which under cleanUrls answers with a redirect for the browser to follow)
  if(u.origin!==self.location.origin||u.pathname!=='/'&&u.pathname!=='/index.html')return;
  e.respondWith((async()=>{const c=await caches.open(CACHE);
    try{const r=await fetch(q);
      // (the copy is written only when the page changed: the server's ETag)
      if(r.ok&&r.type==='basic'&&!r.redirected){const old=await c.match('/'),et=r.headers.get('etag');if(!old||!et||old.headers.get('etag')!==et)await c.put('/',r.clone())}
      return r}
    catch(err){const hit=await c.match('/');if(hit)return hit;throw err}})())});
