const CACHE = "barcode-check-v5";
const CORE = ["./", "./index.html", "./manifest.webmanifest"];
const LIBRARY_URLS = [
  "https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js",
  "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js",
  "https://raw.githubusercontent.com/mebjas/html5-qrcode/v2.3.8/minified/html5-qrcode.min.js"
];
const LOCAL_LIBRARY = new URL("./html5-qrcode.min.js", self.registration.scope).href;

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    for (const url of LIBRARY_URLS) {
      try {
        const response = await fetch(url, { mode: "cors", cache: "no-store" });
        if (response.ok) {
          await cache.put(LOCAL_LIBRARY, response);
          break;
        }
      } catch (error) {}
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith("barcode-check-") && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const u = new URL(event.request.url);
  if (u.origin !== self.location.origin || event.request.method !== "GET") return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    } catch (error) {
      return new Response("オフラインです。オンラインで再読み込みしてください。", { status: 503 });
    }
  })());
});
