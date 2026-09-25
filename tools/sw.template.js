/* Service worker KiCad Мастер Pro (сгенерирован tools/make_sw.py — правьте tools/sw.template.js).
   Ядро сайта кэшируется при установке; остальное — при первом обращении
   или по кнопке «Скачать все материалы для офлайна» в Настройках. */
var VERSION = '__VERSION__';
var CACHE = 'km-' + VERSION;
var CORE = __CORE__;

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { // cache: 'reload' — мимо HTTP-кэша браузера, иначе в новый кэш могут попасть старые файлы
    return c.addAll(CORE.map(function (u) { return new Request(u, { cache: 'reload' }); })); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('km-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.indexOf('/api/') === 0) return;
  // HTML — сначала сеть (свежая версия), при офлайне — кэш
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(function (r) {
      var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put('./', copy); }); return r;
    }).catch(function () { return caches.match('./'); }));
    return;
  }
  // остальное — кэш, затем сеть с сохранением
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    return hit || fetch(req).then(function (r) {
      if (r.ok && r.type === 'basic') { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return r;
    });
  }));
});

// Полное скачивание для офлайна
self.addEventListener('message', function (e) {
  if (!e.data || e.data.type !== 'cache-all') return;
  var port = e.ports[0];
  e.waitUntil(fetch('assets.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (a) {
    return caches.open(CACHE).then(function (c) {
      var n = 0, list = a.files.slice();
      function next() {
        var batch = list.splice(0, 8);
        if (!batch.length) { port.postMessage({ done: true, count: n }); return; }
        return Promise.all(batch.map(function (f) {
          return c.match(f).then(function (hit) { return hit || c.add(f).catch(function () { /* пропускаем */ }); }).then(function () { n++; });
        })).then(function () { port.postMessage({ count: n }); return next(); });
      }
      return next();
    });
  }).catch(function (err) { port.postMessage({ done: true, count: 0, error: String(err) }); }));
});
