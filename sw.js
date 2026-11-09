const CACHE_NAME="barcode-check-v14-offline";
const BASE=new URL(self.registration.scope);
const local=(p)=>new URL(p,BASE).href;
const ASSETS=[
 ["https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js",local("html5-qrcode.min.js")],
 ["https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js",local("tesseract.min.js")],
 ["https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js",local("worker.min.js")],
 ["https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0/tesseract-core-simd-lstm.wasm.js",local("tesseract-core-simd-lstm.wasm.js")],
 ["https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0/tesseract-core-simd-lstm.wasm",local("tesseract-core-simd-lstm.wasm")],
 ["https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0/tesseract-core-lstm.wasm.js",local("tesseract-core-lstm.wasm.js")],
 ["https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0/tesseract-core-lstm.wasm",local("tesseract-core-lstm.wasm")],
 ["https://cdn.jsdelivr.net/gh/tesseract-ocr/tessdata_fast@4.0.0/eng.traineddata.gz",local("eng.traineddata.gz")]
];
self.addEventListener("install",e=>e.waitUntil((async()=>{
 const c=await caches.open(CACHE_NAME);
 for(const p of ["./","index.html","manifest.webmanifest","sw.js"]){try{const r=await fetch(local(p),{cache:"reload"});if(r.ok)await c.put(local(p),r)}catch(_){}}
 const results=await Promise.all(ASSETS.map(async([src,dst])=>{try{const r=await fetch(src,{mode:"cors",cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);await c.put(dst,r);return true}catch(err){console.warn("offline asset failed",src,err);return false}}));
 await self.skipWaiting();
 })()));
self.addEventListener("activate",e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith("barcode-check-")&&k!==CACHE_NAME)await caches.delete(k);await self.clients.claim()})()));
self.addEventListener("fetch",e=>{const q=e.request,u=new URL(q.url);if(u.origin!==self.location.origin||q.method!=="GET")return;e.respondWith((async()=>{const c=await caches.open(CACHE_NAME);const hit=await c.match(q,{ignoreSearch:true});if(hit)return hit;try{const r=await fetch(q);if(r.ok)await c.put(q,r.clone());return r}catch(_){return new Response("オフライン用ファイルが未保存です。オンラインでアプリを開き直してください。",{status:503})}})())});
