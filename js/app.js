/* =========================================================
   Запуск приложения: маршруты, тема, меню, PWA, напоминания.
   ========================================================= */
(function () {
  var V = KM.views;
  var R = KM.router;
  R.add('/', V.home);
  R.add('/lessons', V.lessons);
  R.add('/advanced', V.advanced);
  R.add('/lesson/:id', V.lesson);
  R.add('/demos', V.demos);
  R.add('/demo/:id', V.demo);
  R.add('/projects', V.projects);
  R.add('/project/:id', V.project);
  R.add('/components', V.components);
  R.add('/component/:id', V.component);
  R.add('/templates', V.templates);
  R.add('/template/:id', V.template);
  R.add('/sim', V.sim);
  R.add('/gerber', V.gerber);
  R.add('/routing', V.routing);
  R.add('/history', V.history);
  R.add('/history/:id', V.article);
  R.add('/reference', V.reference);
  R.add('/community', V.community);
  R.add('/profile', V.profile);
  R.add('/certificate', V.certificate);
  R.add('/print', V.print);
  R.add('/settings', V.settings);
  R.add('/models', V.models);

  var current = null;
  function render() {
    var main = KM.$('#main');
    if (current && current.view.unmount) { try { current.view.unmount(); } catch (e) { console.error(e); } }
    var m = R.resolve();
    if (!m) {
      main.innerHTML = '<div class="page narrow empty"><div class="big">🧭</div><h1>Страница не найдена</h1><p><a href="#/">На главную</a></p></div>';
      current = null;
    } else {
      current = m;
      try {
        main.innerHTML = m.view.render(m.params, m.query);
        if (m.view.mount) m.view.mount(main, m.params, m.query);
        KM.ui.bindCommon(main);
      } catch (e) {
        console.error(e);
        main.innerHTML = '<div class="page narrow"><div class="callout danger"><span class="ico">⚠️</span><div><strong>Ошибка отображения</strong><code>' + KM.esc(e.message) + '</code></div></div></div>';
      }
    }
    var h1 = KM.$('h1', main);
    var ht = h1 ? h1.textContent.trim() : '';
    document.title = (ht && ht !== 'KiCad Мастер Pro' ? ht + ' — ' : '') + 'KiCad Мастер Pro';
    KM.ui.renderNav();
    closeMenu();
    if (!R.query().keep) window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  /* тема */
  KM.applySettings = function () {
    var s = KM.store.state.settings, root = document.documentElement;
    root.dataset.theme = s.theme || 'auto';
    if (s.accent && s.accent !== 'green') root.dataset.accent = s.accent; else delete root.dataset.accent;
    root.style.setProperty('--font-scale', s.fontScale || 1);
    if (s.reduceMotion) root.dataset.motion = 'reduce'; else delete root.dataset.motion;
    if (s.contrast) root.dataset.contrast = 'high'; else delete root.dataset.contrast;
    root.lang = s.lang || 'ru';
    var dark = s.theme === 'dark' || (s.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#0c1311' : '#f4f6f3';
  };
  KM.$('#themeToggle').onclick = function () {
    var s = KM.store.state.settings;
    var dark = s.theme === 'dark' || (s.theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    s.theme = dark ? 'light' : 'dark';
    KM.store.touch(); KM.applySettings();
  };

  /* меню на мобильных */
  function closeMenu() {
    KM.$('#sidebar').classList.remove('open'); KM.$('#scrim').hidden = true;
    KM.$('#menuToggle').setAttribute('aria-expanded', 'false');
  }
  KM.$('#menuToggle').onclick = function () {
    var open = !KM.$('#sidebar').classList.contains('open');
    KM.$('#sidebar').classList.toggle('open', open); KM.$('#scrim').hidden = !open;
    this.setAttribute('aria-expanded', String(open));
  };
  KM.$('#scrim').onclick = closeMenu;
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* события */
  KM.on('change', function () { KM.ui.renderStats(); KM.api.pushStats(); });
  KM.on('api', function () { KM.ui.renderNav(); });

  /* PWA */
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
    // После деплоя старый service worker успевает отдать прежние JS/CSS.
    // Когда новый берёт управление — один раз перезагружаем страницу, чтобы сразу показать свежую версию.
    var hadController = !!navigator.serviceWorker.controller, reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!hadController || reloaded) return;
      reloaded = true; location.reload();
    });
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (reg) { reg.update(); }).catch(function (e) { console.warn('SW:', e); });
  }
  var deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredPrompt = e; KM.emit('installable'); });
  KM.install = function () {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt(); deferredPrompt = null; return true;
  };
  KM.canInstall = function () { return !!deferredPrompt; };

  /* напоминания: если включены, раз в день после заданного часа показываем уведомление при открытом приложении */
  function reminderTick() {
    var s = KM.store.state;
    if (!s.settings.reminders || !('Notification' in window) || Notification.permission !== 'granted') return;
    var now = new Date();
    if (now.getHours() < (s.settings.reminderHour || 19) || s.days[KM.today()]) return;
    if (s.lastReminder === KM.today()) return;
    s.lastReminder = KM.today(); KM.store.touch();
    var next = KM.data.lessons.find(function (l) { return !(s.lessons[l.id] && s.lessons[l.id].done) && KM.game.isUnlocked(l); });
    try {
      var n = new Notification('KiCad Мастер Pro', { body: 'Не прерывайте серию 🔥 ' + KM.game.streak() + '! ' + (next ? 'Следующий урок: ' + next.title : ''), icon: 'icons/icon-192.png', tag: 'km-reminder' });
      n.onclick = function () { window.focus(); if (next) location.hash = '#/lesson/' + next.id; };
    } catch (e) { /* некоторые браузеры требуют уведомлений только через SW */ }
  }

  /* старт */
  KM.applySettings();
  KM.ui.initSearch();
  KM.assistant.build();
  KM.ui.renderStats();
  window.addEventListener('hashchange', render);
  render();
  KM.api.detect().then(function (online) {
    if (online && KM.api.user) KM.api.pushStats();
  });
  setInterval(reminderTick, 60000); setTimeout(reminderTick, 5000);
  KM.game.check();
})();
