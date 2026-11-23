// Anotador de Juegos: permite instalar la app y abrirla sin conexión.
var CACHE = 'anotador-v2';
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(['./', './index.html', './manifest.json', './icon-192.png']);
  }));
});
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  // Primero la red (para recibir versiones nuevas); si no hay conexión, la copia guardada.
  e.respondWith(fetch(r).then(function (res) {
    var copy = res.clone();
    caches.open(CACHE).then(function (c) { c.put(r, copy); });
    return res;
  }).catch(function () {
    return caches.match(r, { ignoreSearch: true }).then(function (m) { return m || caches.match('./index.html'); });
  }));
});
