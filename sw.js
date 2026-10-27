// App do GDNF: guarda o site no telemóvel para abrir sem rede.
// A página vem primeiro da rede (para ver logo as versões novas); o resto vem da cache e atualiza-se em segundo plano.
const CACHE = "gdnf-v3";
const BASE = ["./", "index.html", "manifest.webmanifest", "img/logo-gdnf.png", "img/icon-180.png", "img/icon-192.png", "img/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => {
      const copia = r.clone();
      caches.open(CACHE).then(c => c.put("index.html", copia));
      return r;
    }).catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(guardado => {
    const rede = fetch(req).then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      return r;
    }).catch(() => guardado);
    return guardado || rede;
  }));
});
