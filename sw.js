const CACHE_NAME = "barcode-check-v6";
const BASE = new URL(self.registration.scope);
const APP_URL = new URL("./", BASE).href;
const INDEX_URL = new URL("index.html", BASE).href;
const MANIFEST_URL = new URL("manifest.webmanifest", BASE).href;
const LIBRARY_URL = new URL("html5-qrcode.min.js", BASE).href;
const CDN_URLS = [
  "https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js",
  "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Save the app shell using absolute URLs within this GitHub Pages project.
    for (const url of [APP_URL, INDEX_URL, MANIFEST_URL]) {
      try {
        const response = await fetch(url, { cache: "reload" });
        if (response.ok) await cache.put(url, response);
      } catch (e) {}
    }
    // Cache the barcode decoder locally for offline use.
    for (const url of CDN_URLS) {
      try {
        const response = await fetch(url, { mode: "cors", cache: "no-store" });
        if (response.ok) {
          await cache.put(LIBRARY_URL, response);
          break;
        }
      } catch (e) {}
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith("barcode-check-") && key !== CACHE_NAME) {
        await caches.delete(key);
      }
    }
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || request.method !== "GET") return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Always serve cached index for offline page navigation, including reloads
    // and navigation URLs carrying query strings.
    if (request.mode === "navigate") {
      const cachedPage = await cache.match(INDEX_URL) || await cache.match(APP_URL);
      if (cachedPage) return cachedPage;
      try {
        const live = await fetch(request);
        if (live.ok) await cache.put(INDEX_URL, live.clone());
        return live;
      } catch (e) {
        return new Response("アプリ本体がまだ保存されていません。オンラインで一度開き直してください。", {
          status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      }
    }

    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;

    try {
      const live = await fetch(request);
      if (live.ok) await cache.put(request, live.clone());
      return live;
    } catch (e) {
      return new Response("オフラインです。オンラインで再読み込みしてください。", {
        status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  })());
});
