/* Главная страница */
(function () {
/* Декоративная плата в шапке: слой F.Cu (зелёный), B.Cu (синий), шелкография,
   бегущие по дорожкам «сигналы» и мигающий светодиод. Только SVG + CSS. */
function heroArt() {
  var pins = '', i;
  for (i = 0; i < 8; i++) {
    pins += '<rect x="188" y="' + (108 + i * 12) + '" width="12" height="7" rx="1"/><rect x="300" y="' + (108 + i * 12) + '" width="12" height="7" rx="1"/>' +
      '<rect x="' + (208 + i * 12) + '" y="88" width="7" height="12" rx="1"/><rect x="' + (208 + i * 12) + '" y="200" width="7" height="12" rx="1"/>';
  }
  var fcu = [
    'M190 112H150L130 92H44', 'M190 136H130L116 122H44', 'M190 160H130L122 152H44', 'M190 184H44', 'M190 196H150L132 214H44',
    'M310 112H340L352 100H372', 'M310 136H344L356 148H372', 'M310 172H352L380 200V232',
    'M396 240H420L436 256', 'M211 88V70L195 54H176', 'M235 88V64L251 48H330', 'M211 212V246L231 266H316',
    'M259 212V236H300L316 252H380', 'M444 290V300H24'
  ];
  var bcu = ['M330 48H410L430 68V208', 'M316 266V290H120L100 270V230', 'M100 230L118 212'];
  var pulse = [0, 3, 5, 7, 10, 11, 13];
  function paths(list, cls) { return list.map(function (d) { return '<path class="' + cls + '" d="' + d + '"/>'; }).join(''); }
  return '<svg class="hero-art" viewBox="0 0 480 320" aria-hidden="true" focusable="false">' +
    '<defs><radialGradient id="haLed"><stop offset="0" stop-color="#ff6b5a"/><stop offset="1" stop-color="#ff6b5a" stop-opacity="0"/></radialGradient>' +
    '<pattern id="haGrid" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#3ccf95" opacity=".18"/></pattern></defs>' +
    '<rect x="10" y="10" width="460" height="300" rx="16" fill="#0b2a1f" fill-opacity=".55" stroke="#d0d200" stroke-width="2.5"/>' +
    '<rect x="10" y="10" width="460" height="300" rx="16" fill="url(#haGrid)"/>' +
    '<g class="ha-bcu">' + paths(bcu, '') + '</g>' +
    '<g class="ha-cu">' + paths(fcu, '') + '</g>' +
    '<g class="ha-pulse">' + pulse.map(function (k, j) { return '<path d="' + fcu[k] + '" style="animation-delay:' + (j * 0.55).toFixed(2) + 's"/>'; }).join('') + '</g>' +
    '<g class="ha-pad">' +
      '<rect x="200" y="100" width="100" height="100" rx="6" fill="#111"/>' + pins +
      [92, 122, 152, 184, 214].map(function (y, j) { return j ? '<circle cx="36" cy="' + y + '" r="8"/>' : '<rect x="28" y="' + (y - 8) + '" width="16" height="16" rx="2"/>'; }).join('') +
      '<rect x="366" y="92" width="14" height="16" rx="2"/><rect x="366" y="140" width="14" height="16" rx="2"/>' +
      '<rect x="372" y="232" width="16" height="16" rx="2"/><rect x="396" y="232" width="16" height="16" rx="2"/>' +
      '<rect x="160" y="46" width="16" height="16" rx="2"/><rect x="136" y="46" width="16" height="16" rx="2"/>' +
      '<rect x="436" y="250" width="16" height="12" rx="2"/><rect x="436" y="282" width="16" height="12" rx="2"/>' +
      '<circle cx="330" cy="48" r="6"/><circle cx="316" cy="266" r="6"/><circle cx="100" cy="230" r="6"/><circle cx="118" cy="212" r="6"/><circle cx="430" cy="208" r="6"/><circle cx="380" cy="252" r="6"/>' +
    '</g>' +
    '<g class="ha-hole"><circle cx="330" cy="48" r="2.5"/><circle cx="316" cy="266" r="2.5"/><circle cx="100" cy="230" r="2.5"/><circle cx="118" cy="212" r="2.5"/><circle cx="430" cy="208" r="2.5"/><circle cx="380" cy="252" r="2.5"/>' +
      [92, 122, 152, 184, 214].map(function (y) { return '<circle cx="36" cy="' + y + '" r="3.5"/>'; }).join('') + '</g>' +
    '<g class="ha-silk">' +
      '<rect x="22" y="78" width="28" height="150" rx="3"/><rect x="360" y="86" width="26" height="76" rx="12"/><rect x="368" y="228" width="48" height="24" rx="3"/>' +
      '<rect x="130" y="40" width="52" height="28" rx="3"/><circle cx="208" cy="108" r="3" class="fill"/>' +
      '<text x="30" y="72">J1</text><text x="362" y="80">Y1</text><text x="384" y="270">R1</text><text x="146" y="34">C1</text><text x="426" y="244">D1</text><text x="236" y="226">U1</text>' +
      '<text x="250" y="148" class="chip" text-anchor="middle">KM-328</text><text x="250" y="164" class="chip small" text-anchor="middle">KiCad Pro</text>' +
    '</g>' +
    '<circle class="ha-glow" cx="444" cy="272" r="22" fill="url(#haLed)"/><rect class="ha-led" x="438" y="264" width="12" height="16" rx="2"/>' +
  '</svg>';
}

/* ---------- информационные блоки ---------- */
function statsBlock() {
  var d = KM.data, n = function (x) { return (x || []).length; };
  var course = [
    ['📘', d.lessons.length, 'уроков'], ['🛠️', n(d.projects), 'практических проектов'], ['🧩', d.components.list().length, 'компонентов в библиотеке'],
    ['📐', n(d.templates), 'схем-шаблонов'], ['🎬', n(d.demos), 'видео-демо']
  ];
  var community = [['👩‍💻', 'users', 'учатся на курсе'], ['✅', 'lessons', 'уроков пройдено участниками'], ['🔧', 'projects', 'проектов собрано'], ['⚡', 'xp', 'опыта заработано']];
  return '<h2 class="mt">Курс в цифрах</h2><div class="stat-strip">' +
    course.map(function (c) { return '<div class="stat"><span class="ico" aria-hidden="true">' + c[0] + '</span><b>' + c[1].toLocaleString('ru-RU') + '</b><span>' + c[2] + '</span></div>'; }).join('') +
    '</div><div class="stat-strip mt-s">' +
    community.map(function (c) { return '<div class="stat community"><span class="ico" aria-hidden="true">' + c[0] + '</span><b data-total="' + c[1] + '">—</b><span>' + c[2] + '</span></div>'; }).join('') +
  '</div><p class="tiny" id="statNote">Статистика сообщества обновляется, когда сайт подключён к серверу.</p>';
}

function weekNumber(d) {
  var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
}
function projectOfWeek() {
  var P = KM.data.projects || [];
  if (!P.length) return '';
  var now = new Date(), p = P[(now.getFullYear() * 53 + weekNumber(now)) % P.length];
  var st = KM.store.state.projects[p.id];
  return '<section class="card pow"><div class="row between"><h2 class="mb0">⭐ Проект недели</h2><span class="tag copper">неделя ' + weekNumber(now) + '</span></div>' +
    '<div class="pow-body"><div class="pow-ico" aria-hidden="true">' + (p.icon || '🛠️') + '</div><div style="min-width:0"><h3>' + KM.esc(p.title) + '</h3>' +
    '<p class="small muted">' + KM.esc(p.goal || p.short || '') + '</p>' +
    '<div class="row"><span class="tag">уровень ' + p.level + '</span><span class="tag accent">+' + p.xp + ' XP</span>' + (st && st.checked ? '<span class="tag ok">✅ выполнен</span>' : '') + '</div></div></div>' +
    (p.req ? '<ul class="small pow-req">' + p.req.slice(0, 4).map(function (r) { return '<li>' + KM.esc(r) + '</li>'; }).join('') + '</ul>' : '') +
    '<div class="row"><a class="btn primary" href="#/project/' + p.id + '">🛠️ Открыть проект</a><a class="btn ghost" href="#/projects">Все проекты</a></div></section>';
}

function topDevs() {
  return '<section class="card"><div class="row between"><h2 class="mb0">🏆 Топ разработчиков</h2><a class="small" href="#/community?tab=leaders">Вся таблица →</a></div>' +
    '<div id="topDevs" class="mt-s"><div class="tiny">Загрузка…</div></div></section>';
}

function kitsBlock() {
  var H = KM.data.home, C = KM.data.components;
  return '<div class="row between mt"><h2 class="mb0">🧰 Наборы для начинающих</h2><a class="small" href="#/settings">' + KM.region().flag + ' цены в ' + KM.region().cur + ' · сменить</a></div>' +
    '<div class="grid cols-3 kits">' + H.kits.map(function (k) {
      var lo = 0, hi = 0, pcs = 0;
      var rows = k.items.map(function (it) {
        var c = C.get(it[0]);
        if (!c) return '';
        lo += c.price[0] * it[1]; hi += c.price[1] * it[1]; pcs += it[1];
        return '<li><a href="#/component/' + encodeURIComponent(c.id) + '">' + KM.esc(c.name) + '</a><span>×' + it[1] + '</span></li>';
      }).join('');
      return '<article class="card kit"><div class="kit-head"><span class="kit-ico" aria-hidden="true">' + k.ico + '</span><div style="min-width:0"><h3>' + KM.esc(k.title) + '</h3><div class="tiny">' + KM.esc(k.level) + '</div></div></div>' +
        '<p class="small muted">' + KM.esc(k.desc) + '</p><details><summary>Состав: ' + k.items.length + ' позиций, ' + pcs + ' шт.</summary><ul class="kit-list">' + rows + '</ul></details>' +
        '<div class="kit-price"><span class="tiny">Ориентировочно</span><b>≈ ' + KM.priceRange([lo, hi]) + '</b></div></article>';
    }).join('') + '</div><p class="tiny">Паяльник, мультиметр и макетная плата в наборы не входят. Нажмите на деталь, чтобы открыть её карточку со ссылками на магазины вашего региона.</p>';
}

function newsBlock() {
  return '<section class="card"><h2>📰 Новое в курсе</h2><ul class="news">' + KM.data.home.news.map(function (n) {
    return '<li><span class="news-ico" aria-hidden="true">' + n.ico + '</span><div style="min-width:0"><div class="row between"><b>' + KM.esc(n.t) + '</b><time class="tiny" datetime="' + n.d + '">' + new Date(n.d + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + '</time></div>' +
      '<p class="small muted mb0">' + KM.esc(n.s) + (n.r ? ' <a href="#' + n.r + '">Открыть →</a>' : '') + '</p></div></li>';
  }).join('') + '</ul></section>';
}

function faqBlock() {
  return '<section class="card"><h2>❓ Частые вопросы</h2><div class="faq">' + KM.data.home.faq.map(function (f) {
    return '<details><summary>' + KM.esc(f[0]) + '</summary><p class="small">' + KM.esc(f[1]) + '</p></details>';
  }).join('') + '</div></section>';
}

KM.views.home = {
  render: function () {
    var s = KM.store.state, L = KM.data.lessons;
    var done = L.filter(function (l) { return s.lessons[l.id] && s.lessons[l.id].done; }).length;
    var next = L.find(function (l) { return !(s.lessons[l.id] && s.lessons[l.id].done) && KM.game.isUnlocked(l); });
    var lv = KM.game.level(), xpNow = s.xp - KM.game.xpForLevel(lv), xpNeed = KM.game.xpForLevel(lv + 1) - KM.game.xpForLevel(lv);
    var projDone = Object.keys(s.projects).filter(function (k) { return s.projects[k].checked; }).length;
    var tips = [
      'Нажмите [[/]] в любом месте сайта, чтобы перейти к поиску.',
      'В KiCad [[Home]] показывает весь лист, а [[`]] на плате подсвечивает цепь под курсором.',
      'Запускайте ERC и DRC часто, а не только перед заказом плат.',
      'Резистор для светодиода: R = (Uпит − Uсветодиода) / I. Калькулятор — в Справочнике.',
      'Развязывающий конденсатор 100 нФ ставьте вплотную к выводу питания микросхемы.',
      'Прогресс хранится в браузере. Сделайте резервную копию в разделе «Прогресс» или подключите синхронизацию.'
    ];
    var tip = tips[new Date().getDate() % tips.length];
    var sections = [
      ['#/lessons', '📘', 'Интерактивные уроки', L.length + ' пошаговых уроков с иллюстрациями, советами, ошибками и тестами'],
      ['#/demos', '🎬', 'Видео-демо', KM.data.demos.length + ' анимированных демонстраций с регулировкой скорости'],
      ['#/projects', '🛠️', 'Практические задания', (KM.data.projects || []).length + ' проектов с заготовками и автопроверкой netlist'],
      ['#/components', '🧩', 'Библиотека компонентов', KM.data.components.list().length + ' компонентов: характеристики, даташиты, где купить'],
      ['#/templates', '📐', 'Схемы-шаблоны', (KM.data.templates || []).length + ' готовых проектов KiCad, проверенных ERC'],
      ['#/sim', '🔬', 'Симулятор схем', 'Соберите цепь в браузере и посмотрите токи и напряжения'],
      ['#/reference', '📚', 'Справочник', 'Горячие клавиши, номиналы, калькуляторы и глоссарий'],
      ['#/history', '🏛️', 'История технологий', 'Как появились печатные платы, KiCad и стандарты'],
      ['#/advanced', '⚡', 'Продвинутые темы', 'ВЧ, ЭМС, DFM, Python, Arduino, Raspberry Pi, IoT'],
      ['#/community', '💬', 'Сообщество и AI', 'Чат, AI-ассистент на Claude, галерея проектов'],
      ['#/profile', '🏆', 'Прогресс и достижения', 'Уровни, медали, серия дней, сертификат'],
      ['#/settings', '⚙️', 'Настройки', 'Тема, язык, доступность, напоминания, синхронизация']
    ];
    var art = heroArt();
    return '<div class="page">' +
      '<section class="hero"><div class="hero-text">' +
        '<div class="eyebrow" style="color:#8fe3c0">Курс KiCad 8–10 · бесплатно · офлайн</div>' +
        '<h1>KiCad Мастер Pro</h1>' +
        '<p>От первого светодиода до платы, готовой к заказу на заводе. Уроки, практика с автопроверкой, симулятор, библиотека компонентов и настоящие проекты KiCad.</p>' +
        '<div class="row" style="margin-top:18px">' +
          (next ? '<a class="btn primary" href="#/lesson/' + next.id + '">' + (done ? '▶ Продолжить: урок ' + next.n : '🚀 Начать с урока 1') + '</a>' : '<a class="btn primary" href="#/certificate">🎓 Получить сертификат</a>') +
          '<a class="btn" href="#/projects">🛠️ К практике</a>' +
          '<button class="btn" id="installBtn" hidden>📱 Установить приложение</button>' +
        '</div>' +
      '</div>' + art + '</section>' +
      '<div class="kpis">' +
        '<div class="kpi"><div class="v">' + done + '<span class="small muted">/' + L.length + '</span></div><div class="l">уроков пройдено</div><div class="progress" style="margin-top:8px"><span style="width:' + (done / L.length * 100) + '%"></span></div></div>' +
        '<div class="kpi"><div class="v">' + lv + '</div><div class="l">уровень · ' + KM.esc(KM.game.title(lv)) + '</div><div class="progress" style="margin-top:8px"><span style="width:' + Math.min(100, xpNow / xpNeed * 100) + '%"></span></div></div>' +
        '<div class="kpi"><div class="v">🔥 ' + KM.game.streak() + '</div><div class="l">дней подряд (рекорд ' + KM.game.bestStreak() + ')</div></div>' +
        '<div class="kpi"><div class="v">' + projDone + '<span class="small muted">/' + (KM.data.projects || []).length + '</span></div><div class="l">проектов собрано</div></div>' +
        '<div class="kpi"><div class="v">' + Object.keys(s.achievements).length + '</div><div class="l">достижений из ' + KM.data.achievements.length + '</div></div>' +
      '</div>' +
      '<div class="callout tip"><span class="ico">💡</span><div><strong>Совет дня</strong>' + KM.md(tip) + '</div></div>' +
      statsBlock() +
      (KM.t('content.lang') ? '<div class="callout warn"><span class="ico">🌍</span><div>' + KM.esc(KM.t('content.lang')) + '</div></div>' : '') +
      '<h2 class="mt">Разделы курса</h2>' +
      '<div class="grid cols-3">' + sections.map(function (x) {
        return '<a class="card section-card" href="' + x[0] + '"><div class="ico" aria-hidden="true">' + x[1] + '</div><h3>' + x[2] + '</h3><p>' + x[3] + '</p></a>';
      }).join('') + '</div>' +
      '<div class="grid cols-2 mt">' + projectOfWeek() + topDevs() + '</div>' +
      kitsBlock() +
      '<h2 class="mt">Как устроен курс</h2>' +
      '<div class="grid cols-4">' +
        '<div class="card flat"><h3>1. Учитесь</h3><p class="muted small">Урок: шаги с аннотированными иллюстрациями интерфейса, советы и типичные ошибки.</p></div>' +
        '<div class="card flat"><h3>2. Проверяйте</h3><p class="muted small">Тест из 5 вопросов после каждого урока даёт опыт и медали.</p></div>' +
        '<div class="card flat"><h3>3. Практикуйтесь</h3><p class="muted small">Скачайте заготовку, соберите схему в KiCad, загрузите netlist — сайт проверит соединения.</p></div>' +
        '<div class="card flat"><h3>4. Растите</h3><p class="muted small">Уровни открывают бонусные уроки, серия дней держит в тонусе.</p></div>' +
      '</div>' +
      '<div class="grid cols-2 mt">' + newsBlock() + faqBlock() + '</div></div>';
  },
  mount: function (root) {
    var b = KM.$('#installBtn', root);
    function upd() { b.hidden = !KM.canInstall(); }
    upd(); KM.on('installable', upd);
    b.onclick = function () { KM.install(); b.hidden = true; };
    this.loadCommunity(root);
  },
  // Топ-5 и статистика сообщества — с сервера; без него показываем только свою строку
  loadCommunity: function (root) {
    var box = KM.$('#topDevs', root), s = KM.store.state;
    function row(r, i, me) {
      return '<div class="lb-row' + (me ? ' me' : '') + '"><span class="pos">' + (i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1) + '</span><div style="min-width:0"><b class="ellipsis">' + KM.esc((r.avatar || '🙂') + ' ' + r.name) + '</b><div class="tiny">ур. ' + r.level + ' · 📘 ' + r.lessons + ' · 🛠️ ' + r.projects + '</div></div><b>' + r.xp + ' XP</b></div>';
    }
    var me = { name: (KM.api.user && KM.api.user.name) || s.name || 'Вы', avatar: KM.api.user && KM.api.user.avatar, xp: s.xp, level: KM.game.level(),
      lessons: Object.keys(s.lessons).filter(function (k) { return s.lessons[k].done; }).length, projects: Object.keys(s.projects).filter(function (k) { return s.projects[k].checked; }).length };
    function offline() {
      if (!box.isConnected) return;
      box.innerHTML = row(me, 0, true) + '<p class="tiny mb0 mt-s">Таблица лидеров появится, когда сайт подключён к серверу. Войдите в <a href="#/community?tab=leaders">Сообществе</a>, чтобы попасть в рейтинг.</p>';
    }
    if (!KM.api.online) {
      offline();
      // сервер мог ответить уже после отрисовки главной
      var self = this, h = function (a) { KM.off('api', h); if (a.online && box.isConnected) self.loadCommunity(root); };
      KM.on('api', h);
      return;
    }
    KM.api.leaderboard().then(function (j) {
      if (!box.isConnected) return;
      box.innerHTML = j.rows.length ? j.rows.slice(0, 5).map(function (r, i) { return row(r, i, KM.api.user && r.id === KM.api.user.id); }).join('') :
        row(me, 0, true) + '<p class="tiny mb0 mt-s">Рейтинг пока пуст — станьте первым! Войдите в <a href="#/community?tab=leaders">Сообществе</a>, и ваш опыт попадёт в таблицу.</p>';
      var t = j.totals;
      if (t) {
        KM.$$('[data-total]', root).forEach(function (el) { el.textContent = (t[el.dataset.total] || 0).toLocaleString('ru-RU'); });
        var note = KM.$('#statNote', root); if (note) note.textContent = 'Статистика сообщества — по данным таблицы лидеров.';
      }
    }).catch(offline);
  }
};
})();
