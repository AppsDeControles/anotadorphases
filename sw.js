// Anotador de Juegos: guarda la app en el celular para que abra al instante,
// incluso sin señal. Primero responde con la copia guardada y en segundo plano
// descarga la versión nueva, que se usa la siguiente vez que se abre.
var CACHE = 'anotador-v3';
var FB = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-';
var FONT = 'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800&family=Figtree:wght@400;500;600;700&display=swap';
var PRECACHE = [
  './', './index.html', './manifest.json', './icon-192.png', './icon-512.png',
  FB + 'app-compat.js', FB + 'auth-compat.js', FB + 'database-compat.js', FONT
];
// Solo se guardan la app, sus librerías y las letras. Los datos de Firebase siempre van a la red.
var HOSTS = ['www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(PRECACHE.map(function (u) {
      return c.add(new Request(u, { mode: u.indexOf('http') === 0 ? 'no-cors' : 'same-origin' })).catch(function () {});
    }));
  }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var url = new URL(r.url);
  var own = url.origin === location.origin;
  if (!own && HOSTS.indexOf(url.hostname) < 0) return;
  // Las páginas con ?v=... (modo vista) usan la misma copia de index.html.
  var key = r.mode === 'navigate' ? './index.html' : r;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(key, { ignoreSearch: r.mode === 'navigate' }).then(function (hit) {
      var net = fetch(r).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) c.put(key, res.clone());
        return res;
      }).catch(function () { return hit; });
      if (hit) { e.waitUntil(net); return hit; }
      return net;
    });
  }));
});
