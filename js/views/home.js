/* Главная страница */
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
    var art = '<svg class="hero-art" viewBox="0 0 400 260" aria-hidden="true"><g fill="none" stroke="#3ccf95" stroke-width="3" stroke-linejoin="round">' +
      '<rect x="20" y="20" width="360" height="220" rx="14" stroke="#d0d200"/><path d="M60 80h80l30 30h90"/><path d="M60 140h40l40-40h40"/><path d="M60 200h150l30-30h60"/><path d="M300 60v90"/></g>' +
      '<g fill="#c2a031"><circle cx="60" cy="80" r="9"/><circle cx="60" cy="140" r="9"/><circle cx="60" cy="200" r="9"/><rect x="250" y="100" width="40" height="20" rx="3"/><rect x="290" y="160" width="40" height="20" rx="3"/><circle cx="300" cy="60" r="8"/></g></svg>';
    return '<div class="page">' +
      '<section class="hero">' + art +
        '<div class="eyebrow" style="color:#8fe3c0">Курс KiCad 8–10 · бесплатно · офлайн</div>' +
        '<h1>KiCad Мастер Pro</h1>' +
        '<p>От первого светодиода до платы, готовой к заказу на заводе. Уроки, практика с автопроверкой, симулятор, библиотека компонентов и настоящие проекты KiCad.</p>' +
        '<div class="row" style="margin-top:18px">' +
          (next ? '<a class="btn primary" href="#/lesson/' + next.id + '">' + (done ? '▶ Продолжить: урок ' + next.n : '🚀 Начать с урока 1') + '</a>' : '<a class="btn primary" href="#/certificate">🎓 Получить сертификат</a>') +
          '<a class="btn" href="#/projects">🛠️ К практике</a>' +
          '<button class="btn" id="installBtn" hidden>📱 Установить приложение</button>' +
        '</div>' +
      '</section>' +
      '<div class="kpis">' +
        '<div class="kpi"><div class="v">' + done + '<span class="small muted">/' + L.length + '</span></div><div class="l">уроков пройдено</div><div class="progress" style="margin-top:8px"><span style="width:' + (done / L.length * 100) + '%"></span></div></div>' +
        '<div class="kpi"><div class="v">' + lv + '</div><div class="l">уровень · ' + KM.esc(KM.game.title(lv)) + '</div><div class="progress" style="margin-top:8px"><span style="width:' + Math.min(100, xpNow / xpNeed * 100) + '%"></span></div></div>' +
        '<div class="kpi"><div class="v">🔥 ' + KM.game.streak() + '</div><div class="l">дней подряд (рекорд ' + KM.game.bestStreak() + ')</div></div>' +
        '<div class="kpi"><div class="v">' + projDone + '<span class="small muted">/' + (KM.data.projects || []).length + '</span></div><div class="l">проектов собрано</div></div>' +
        '<div class="kpi"><div class="v">' + Object.keys(s.achievements).length + '</div><div class="l">достижений из ' + KM.data.achievements.length + '</div></div>' +
      '</div>' +
      '<div class="callout tip"><span class="ico">💡</span><div><strong>Совет дня</strong>' + KM.md(tip) + '</div></div>' +
      (KM.t('content.lang') ? '<div class="callout warn"><span class="ico">🌍</span><div>' + KM.esc(KM.t('content.lang')) + '</div></div>' : '') +
      '<h2 class="mt">Разделы курса</h2>' +
      '<div class="grid cols-3">' + sections.map(function (x) {
        return '<a class="card section-card" href="' + x[0] + '"><div class="ico" aria-hidden="true">' + x[1] + '</div><h3>' + x[2] + '</h3><p>' + x[3] + '</p></a>';
      }).join('') + '</div>' +
      '<h2 class="mt">Как устроен курс</h2>' +
      '<div class="grid cols-4">' +
        '<div class="card flat"><h3>1. Учитесь</h3><p class="muted small">Урок: шаги с аннотированными иллюстрациями интерфейса, советы и типичные ошибки.</p></div>' +
        '<div class="card flat"><h3>2. Проверяйте</h3><p class="muted small">Тест из 5 вопросов после каждого урока даёт опыт и медали.</p></div>' +
        '<div class="card flat"><h3>3. Практикуйтесь</h3><p class="muted small">Скачайте заготовку, соберите схему в KiCad, загрузите netlist — сайт проверит соединения.</p></div>' +
        '<div class="card flat"><h3>4. Растите</h3><p class="muted small">Уровни открывают бонусные уроки, серия дней держит в тонусе.</p></div>' +
      '</div></div>';
  },
  mount: function (root) {
    var b = KM.$('#installBtn', root);
    function upd() { b.hidden = !KM.canInstall(); }
    upd(); KM.on('installable', upd);
    b.onclick = function () { KM.install(); b.hidden = true; };
  }
};
