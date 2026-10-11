// Offline support: pages and data are network-first (always fresh when online),
// heavy static files are cache-first.
const CACHE = "travel-v3";
const SHELL = [
  "./", "index.html", "edit.html",
  "assets/common.js", "assets/earth.jpg", "assets/night-sky.png",
  "assets/earth-topology.png", "assets/earth-water.png", "assets/clouds-alpha.jpg",
  "data/countries.geojson", "data/places.js",
  "https://unpkg.com/three@0.160.0/build/three.min.js",
  "https://unpkg.com/globe.gl@2.32.0/dist/globe.gl.min.js",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // never cache API calls (GitHub, map search, Drive)
  if (url.origin !== location.origin && !url.href.startsWith("https://unpkg.com/") && !url.href.startsWith("https://fonts.")) return;

  const staticFile = /\.(jpg|png|geojson|woff2?)$/.test(url.pathname) || url.origin !== location.origin;
  if (staticFile) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => put(req, res))));
  } else {
    // ignore the ?v= cache-buster so the offline copy of the data files is found
    const key = /(places\.js|media\.json)$/.test(url.pathname) ? new Request(url.origin + url.pathname) : req;
    e.respondWith(fetch(req).then(res => put(key, res)).catch(() => caches.match(key)));
  }
});

function put(key, res) {
  if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
  return res;
}
