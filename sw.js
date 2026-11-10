const CACHE_NAME="barcode-check-v16";
const BASE=new URL(self.registration.scope);
const APP_URL=new URL("./",BASE).href,INDEX_URL=new URL("index.html",BASE).href,MANIFEST_URL=new URL("manifest.webmanifest",BASE).href;
const QR_URL=new URL("html5-qrcode.min.js",BASE).href,OCR_URL=new URL("tesseract.min.js",BASE).href;
const ASSETS=[
 ["https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js",QR_URL],
 ["https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js",OCR_URL]
];
self.addEventListener("install",e=>e.waitUntil((async()=>{const c=await caches.open(CACHE_NAME);
 for(const u of [APP_URL,INDEX_URL,MANIFEST_URL])try{const r=await fetch(u,{cache:"reload"});if(r.ok)await c.put(u,r)}catch(_){}
 for(const [src,dst] of ASSETS)try{const r=await fetch(src,{mode:"cors",cache:"no-store"});if(r.ok)await c.put(dst,r)}catch(_){}
 await self.skipWaiting()})()));
self.addEventListener("activate",e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith("barcode-check-")&&k!==CACHE_NAME)await caches.delete(k);await self.clients.claim()})()));
self.addEventListener("fetch",e=>{const q=e.request,u=new URL(q.url);if(u.origin!==self.location.origin||q.method!=="GET")return;e.respondWith((async()=>{const c=await caches.open(CACHE_NAME);
 if(q.mode==="navigate"){const p=await c.match(INDEX_URL)||await c.match(APP_URL);if(p)return p;try{return await fetch(q)}catch(_){return new Response("アプリ本体が未保存です。オンラインで一度開いてください。",{status:503})}}
 const hit=await c.match(q,{ignoreSearch:true});if(hit)return hit;try{const r=await fetch(q);if(r.ok)await c.put(q,r.clone());return r}catch(_){return new Response("オフラインです。オンラインで再読み込みしてください。",{status:503})}})())});
