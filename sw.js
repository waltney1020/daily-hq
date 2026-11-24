// Offline support: app files come from the network when possible and fall back to the cache.
// Polymarket requests are never cached.
const CACHE = "dailyhq-v19";
// Water reminder taps: the "Log" action logs water in an open window, or opens the app and logs it there.
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const ml = (e.notification.data && e.notification.data.step) || 500;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    const c = list[0];
    if (c) { if (e.action === "log") c.postMessage({ water: ml }); return c.focus(); }
    return self.clients.openWindow(e.action === "log" ? `./?water=${ml}#today` : "./#today");
  }));
});
const FILES = ["./", "index.html", "app.css?v=19", "art.js?v=19", "app.js?v=19", "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.hostname.endsWith("polymarket.com")) return;
  const sameOrigin = url.origin === location.origin;
  const isFont = url.hostname.endsWith("googleapis.com") || url.hostname.endsWith("gstatic.com");
  if (!sameOrigin && !isFont) return;
  e.respondWith(
    fetch(e.request, sameOrigin ? { cache: "no-cache" } : undefined).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
