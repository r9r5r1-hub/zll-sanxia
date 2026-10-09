/* 讓 App 可以加到主畫面、離線時也能打開上次的畫面。資料一律走網路。 */
const CACHE = "hotpot-v8";
const SHELL = ["./", "./index.html", "./config.js", "./manifest.json", "./kiosk.html", "./manifest-kiosk.json", "./icon-192.png", "./icon-512.png", "./icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  /* 先抓最新版，沒網路才用快取，這樣更新後員工打開就是新版 */
  e.respondWith(fetch(req).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
  }).catch(() => caches.match(req).then(r => r || caches.match(/kiosk/.test(req.url) ? "./kiosk.html" : "./index.html"))));
});
