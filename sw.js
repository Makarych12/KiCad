/* Service worker KiCad Мастер Pro (сгенерирован tools/make_sw.py — правьте tools/sw.template.js).
   Ядро сайта кэшируется при установке; остальное — при первом обращении
   или по кнопке «Скачать все материалы для офлайна» в Настройках. */
var VERSION = '3394508143b7';
var CACHE = 'km-' + VERSION;
var CORE = [
 "./",
 "index.html",
 "manifest.webmanifest",
 "css/style.css",
 "data/achievements.js",
 "data/components.js",
 "data/demos.js",
 "data/figures.js",
 "data/history.js",
 "data/home.js",
 "data/i18n.js",
 "data/kicad-gen.js",
 "data/lessons-2.js",
 "data/lessons-3.js",
 "data/lessons-adv.js",
 "data/lessons.js",
 "data/reference.js",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/icon.svg",
 "icons/maskable-192.png",
 "icons/maskable-512.png",
 "icons/maskable.svg",
 "js/api.js",
 "js/app.js",
 "js/assistant.js",
 "js/core.js",
 "js/sim.js",
 "js/ui.js",
 "js/views/community.js",
 "js/views/components.js",
 "js/views/demos.js",
 "js/views/gerber.js",
 "js/views/history.js",
 "js/views/home.js",
 "js/views/lessons.js",
 "js/views/models.js",
 "js/views/profile.js",
 "js/views/projects.js",
 "js/views/reference.js",
 "js/views/routing.js",
 "js/views/settings.js",
 "js/views/sim.js",
 "js/views/templates.js"
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
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
