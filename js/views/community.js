/* Сообщество: AI-ассистент, чат, галерея, лидеры, рассылка */
(function () {
  var tab = 'ai', aiHistory = [], es = null, stopAi = null;

  // безопасная разметка ответов: экранирование + ```код```, **жирный**, `код`, списки
  function mdChat(s) {
    var parts = String(s).split(/```/);
    return parts.map(function (p, i) {
      if (i % 2) return '<pre><code>' + KM.esc(p.replace(/^\w*\n/, '')) + '</code></pre>';
      return KM.esc(p).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>')
        .split(/\n{2,}/).map(function (para) {
          if (/^\s*[-*] /m.test(para)) return '<ul>' + para.split('\n').filter(Boolean).map(function (l) { return '<li>' + l.replace(/^\s*[-*] /, '') + '</li>'; }).join('') + '</ul>';
          if (/^\s*\d+[.)] /m.test(para)) return '<ol>' + para.split('\n').filter(Boolean).map(function (l) { return '<li>' + l.replace(/^\s*\d+[.)] /, '') + '</li>'; }).join('') + '</ol>';
          return para.trim() ? '<p>' + para.replace(/\n/g, '<br>') + '</p>' : '';
        }).join('');
    }).join('');
  }
  function serverHint() {
    return '<div class="callout tip"><span class="ico">🌐</span><div><strong>Онлайн-функции недоступны</strong>Чат, общая галерея, таблица лидеров и рассылка работают на развёрнутом сайте (Vercel) или при локальном запуске <code>npm run dev</code>. ' +
      (location.protocol === 'file:' ? 'Сейчас сайт открыт как файл — откройте его через адрес http(s).' : 'Сейчас API не отвечает — проверьте подключение к интернету.') + ' Уроки, практика и симулятор работают и без них.</div></div>';
  }
  function loginBox() {
    if (KM.api.user) return '<div class="row small muted" style="margin-bottom:10px">Вы вошли как <b>' + KM.esc(KM.api.user.avatar + ' ' + KM.api.user.name) + '</b> <button class="btn sm ghost" id="logout">Выйти</button></div>';
    return '<form class="row" id="loginForm" style="margin-bottom:12px"><input type="text" id="nick" placeholder="Ваш ник (от 2 символов)" maxlength="32" style="max-width:260px" required><button class="btn primary">Войти в сообщество</button><span class="tiny">Регистрация — только ник; токен сохранится в этом браузере.</span></form>';
  }

  var TABS = [['ai', '🤖 AI-ассистент'], ['chat', '💬 Чат'], ['gallery', '📸 Проекты участников'], ['leaders', '🏆 Таблица лидеров'], ['news', '📧 Рассылка']];

  KM.views.community = {
    render: function (p, q) {
      if (q.tab) tab = q.tab;
      return '<div class="page"><div class="page-head"><div class="eyebrow">Раздел 10</div><h1>Сообщество и помощь</h1><p>Задайте вопрос AI-ассистенту, пообщайтесь с другими учениками, покажите свой проект.</p></div>' +
        '<div class="tabs" role="tablist">' + TABS.map(function (t) { return '<button role="tab" data-tab="' + t[0] + '" aria-selected="' + (tab === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div><div id="comBody"></div></div>';
    },
    mount: function (root, p, q) {
      var body = KM.$('#comBody', root);
      function show(t) {
        tab = t;
        if (es) { es.close(); es = null; }
        ({ ai: ai, chat: chat, gallery: gallery, leaders: leaders, news: news })[t](body, q);
        var lf = KM.$('#loginForm', body);
        if (lf) lf.onsubmit = function (e) {
          e.preventDefault();
          KM.api.register(KM.$('#nick', body).value).then(function () { KM.api.pushStats(); show(t); }).catch(function (err) { KM.ui.toast('Не получилось', err.message, '⚠️'); });
        };
        var lo = KM.$('#logout', body); if (lo) lo.onclick = function () { KM.api.logout(); show(t); };
      }
      KM.ui.tabs(root, show);
      show(tab);
    },
    unmount: function () { if (es) { es.close(); es = null; } if (stopAi) stopAi(); }
  };

  /* ---------- AI ---------- */
  function ai(body, q) {
    var ctx = q.ctx || '';
    var avail = KM.api.aiAvailable();
    var sugg = ['Как выбрать резистор для светодиода от 5 В?', 'Чем отличаются клавиши M и G в редакторе схем?', 'Почему ERC пишет «Вход питания не запитан»?', 'Какую ширину дорожки взять для 2 А?', 'Как подключить USB-C только для питания?'];
    body.innerHTML = (avail ? '' : '<div class="callout warn"><span class="ico">🔑</span><div><strong>Ассистент не подключён</strong>Вариант 1 — владелец сайта задаёт <code>OPENROUTER_API_KEY</code> или <code>ANTHROPIC_API_KEY</code> в настройках проекта Vercel. Вариант 2 — укажите свой ключ OpenRouter или Anthropic в <a href="#/settings">Настройках</a>: запросы пойдут напрямую из браузера.</div></div>') +
      '<div class="chat"><div class="chat-log" id="aiLog" aria-live="polite">' +
        (aiHistory.length ? '' : '<div class="msg bot"><div class="who">🤖 Ассистент (Claude)</div>Привет! Я помогу с KiCad и электроникой: объясню шаг урока, найду ошибку в схеме, посчитаю номиналы.' + (ctx ? ' Вижу, вы пришли со страницы: <b>' + KM.esc(ctx) + '</b>.' : '') + '</div>') +
      '</div><form class="chat-form" id="aiForm"><textarea id="aiIn" rows="1" placeholder="Спросите что-нибудь о KiCad…" aria-label="Вопрос ассистенту"' + (avail ? '' : ' disabled') + '></textarea><button class="btn primary" id="aiSend"' + (avail ? '' : ' disabled') + '>Отправить</button><button class="btn" type="button" id="aiStop" hidden>■ Стоп</button></form></div>' +
      '<div class="chips" style="margin-top:10px">' + sugg.map(function (s) { return '<button class="chip" data-sugg>' + KM.esc(s) + '</button>'; }).join('') + '<button class="chip" id="aiClear">🧹 Новый диалог</button></div>' +
      '<p class="tiny" style="margin-top:8px">Ответы генерирует модель Claude и могут содержать неточности — сверяйтесь с документацией KiCad и даташитами.' + (KM.api.online && KM.api.ai ? ' Модель: ' + KM.esc(KM.api.model) + '.' : '') + '</p>';
    var log = KM.$('#aiLog', body), inp = KM.$('#aiIn', body), form = KM.$('#aiForm', body);
    function add(role, text) {
      var d = document.createElement('div'); d.className = 'msg ' + (role === 'user' ? 'me' : 'bot');
      d.innerHTML = '<div class="who">' + (role === 'user' ? 'Вы' : '🤖 Ассистент') + '</div><div class="body">' + (role === 'user' ? KM.esc(text).replace(/\n/g, '<br>') : mdChat(text)) + '</div>';
      log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
    }
    aiHistory.forEach(function (m) { add(m.role, m.content); });
    function send(text) {
      text = text.trim(); if (!text || !avail) return;
      aiHistory.push({ role: 'user', content: text }); add('user', text);
      KM.store.state.aiQuestions++; KM.game.activity();
      var bubble = add('assistant', '…'), acc = '', ended = false;
      KM.$('#aiSend', body).disabled = true; KM.$('#aiStop', body).hidden = false;
      function fin() { KM.$('#aiSend', body).disabled = false; KM.$('#aiStop', body).hidden = true; stopAi = null; }
      stopAi = KM.api.ask(aiHistory.slice(-20), ctx, function (chunk) {
        acc += chunk; KM.$('.body', bubble).innerHTML = mdChat(acc); log.scrollTop = log.scrollHeight;
      }, function () {
        if (ended) return; ended = true;
        if (acc) aiHistory.push({ role: 'assistant', content: acc }); else aiHistory.pop();
        fin();
      }, function (err) {
        if (ended) return; ended = true;
        KM.$('.body', bubble).innerHTML = (acc ? mdChat(acc) : '') + '<div class="callout danger"><span class="ico">⚠️</span><div>' + KM.esc(err) + '</div></div>';
        if (acc) aiHistory.push({ role: 'assistant', content: acc }); else aiHistory.pop();
        fin();
      });
    }
    form.onsubmit = function (e) { e.preventDefault(); var t = inp.value; inp.value = ''; send(t); };
    inp.onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.onsubmit(e); } };
    KM.$('#aiStop', body).onclick = function () { if (stopAi) stopAi(); KM.$('#aiSend', body).disabled = false; this.hidden = true; };
    KM.$$('[data-sugg]', body).forEach(function (b) { b.onclick = function () { send(b.textContent); }; });
    KM.$('#aiClear', body).onclick = function () { aiHistory = []; ai(body, q); };
    if (avail) inp.focus();
  }

  /* ---------- чат ---------- */
  function chat(body) {
    if (!KM.api.online) { body.innerHTML = serverHint(); return; }
    body.innerHTML = loginBox() + '<div class="chat"><div class="chat-log" id="chatLog" aria-live="polite"><div class="tiny">Загрузка…</div></div>' +
      '<form class="chat-form" id="chatForm"><textarea id="chatIn" rows="1" maxlength="2000" placeholder="' + (KM.api.user ? 'Сообщение…' : 'Войдите, чтобы писать') + '"' + (KM.api.user ? '' : ' disabled') + ' aria-label="Сообщение"></textarea><button class="btn primary"' + (KM.api.user ? '' : ' disabled') + '>Отправить</button></form></div>' +
      '<p class="tiny" style="margin-top:8px">Будьте вежливы. Не публикуйте личные данные.</p>';
    var log = KM.$('#chatLog', body), seen = {};
    function add(m) {
      if (seen[m.id]) return; seen[m.id] = 1;
      var mine = KM.api.user && m.user && m.user.id === KM.api.user.id;
      var d = document.createElement('div'); d.className = 'msg ' + (mine ? 'me' : '');
      d.innerHTML = '<div class="who">' + KM.esc((m.user ? m.user.avatar + ' ' + m.user.name : '?')) + ' · ' + new Date(m.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '</div>' + KM.esc(m.text).replace(/\n/g, '<br>');
      log.appendChild(d); log.scrollTop = log.scrollHeight;
    }
    KM.api.chatList(0).then(function (j) { log.innerHTML = j.messages.length ? '' : '<div class="tiny">Сообщений пока нет — начните разговор!</div>'; j.messages.forEach(add); });
    es = KM.api.chatStream(function (m) { if (log.querySelector('.tiny')) log.innerHTML = ''; add(m); });
    var form = KM.$('#chatForm', body), inp = KM.$('#chatIn', body);
    form.onsubmit = function (e) { e.preventDefault(); var t = inp.value.trim(); if (!t) return; inp.value = ''; KM.api.chatSend(t).then(function (j) { add(j.message); }).catch(function (err) { KM.ui.toast('Не отправлено', err.message, '⚠️'); }); };
    inp.onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.onsubmit(e); } };
  }

  /* ---------- галерея ---------- */
  function fileToB64(f) {
    return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res({ name: f.name, data: String(fr.result).split(',')[1] }); }; fr.onerror = rej; fr.readAsDataURL(f); });
  }
  function stars(id, value, can) {
    var s = '<span class="stars" data-rate="' + id + '">';
    for (var i = 1; i <= 5; i++) s += '<button' + (i <= Math.round(value) ? ' class="on"' : '') + ' data-star="' + i + '" aria-label="' + i + ' из 5"' + (can ? '' : ' disabled') + '>★</button>';
    return s + '</span>';
  }
  function gallery(body) {
    var intro = '<p class="muted">Покажите свою плату: загрузите архив проекта KiCad или netlist и картинку (скриншот схемы, 3D-вид, фото собранного устройства). Другие участники смогут скачать проект и поставить оценку.</p>';
    if (!KM.api.online) {
      body.innerHTML = intro + serverHint() + '<h2 class="mt">Пока сервера нет — примеры проектов курса</h2><div class="grid cols-3">' + (KM.data.templates || []).slice(0, 6).map(function (t) {
        return '<a class="card" href="#/template/' + t.id + '"><div class="thumb-sch"><img src="' + t.svg + '" alt="" loading="lazy"></div><h3>' + KM.esc(t.title) + '</h3><p class="small muted">' + KM.esc(t.desc) + '</p></a>';
      }).join('') + '</div>';
      return;
    }
    body.innerHTML = intro + loginBox() +
      (KM.api.user ? '<details class="card flat" style="margin-bottom:16px"><summary style="cursor:pointer;font-weight:650">➕ Загрузить проект</summary><form id="upForm" class="stack" style="margin-top:12px">' +
        '<div class="field"><label for="upT">Название</label><input type="text" id="upT" maxlength="80" required></div>' +
        '<div class="field"><label for="upD">Описание</label><textarea id="upD" maxlength="1500" placeholder="Что делает плата, на каком МК, что было сложным…"></textarea></div>' +
        '<div class="field"><label for="upF">Проект (.zip, .kicad_sch, .kicad_pcb, .net; до 700 КБ)</label><input type="file" id="upF" accept=".zip,.kicad_sch,.kicad_pcb,.kicad_pro,.net"></div>' +
        '<div class="field"><label for="upI">Картинка (.png, .jpg, .webp; до 700 КБ)</label><input type="file" id="upI" accept="image/png,image/jpeg,image/webp"></div>' +
        '<button class="btn primary">Опубликовать</button></form></details>' : '') +
      '<div class="grid cols-3" id="gal"><div class="tiny">Загрузка…</div></div>';
    function load() {
      KM.api.gallery().then(function (j) {
        var box = KM.$('#gal', body);
        box.innerHTML = j.items.length ? j.items.map(function (g) {
          return '<div class="card">' + (g.image ? '<img src="' + KM.esc(g.image.url) + '" alt="" style="width:100%;border-radius:8px;aspect-ratio:16/10;object-fit:cover;margin-bottom:10px" loading="lazy">' : '') +
            '<h3>' + KM.esc(g.title) + '</h3><div class="tiny">' + KM.esc(g.user.avatar + ' ' + g.user.name) + ' · ' + new Date(g.t).toLocaleDateString() + '</div><p class="small">' + KM.esc(g.desc) + '</p>' +
            '<div class="row between">' + stars(g.id, g.rating, !!KM.api.user) + '<span class="tiny">' + (g.votes ? g.rating + ' (' + g.votes + ')' : 'нет оценок') + '</span></div>' +
            (g.file ? '<a class="btn sm" style="margin-top:8px" href="' + KM.esc(g.file.url) + '" download>⬇️ ' + KM.esc(g.file.name) + '</a>' : '') + '</div>';
        }).join('') : '<div class="empty"><div class="big">📭</div>Пока никто не поделился проектом. Будьте первым!</div>';
        KM.$$('[data-rate]', box).forEach(function (s) {
          KM.$$('[data-star]', s).forEach(function (b) { b.onclick = function () { KM.api.rate(s.dataset.rate, +b.dataset.star).then(load).catch(function (e) { KM.ui.toast('Ошибка', e.message, '⚠️'); }); }; });
        });
      }).catch(function (e) { KM.$('#gal', body).innerHTML = '<div class="callout danger"><span class="ico">⚠️</span><div>' + KM.esc(e.message) + '</div></div>'; });
    }
    var f = KM.$('#upForm', body);
    if (f) f.onsubmit = function (e) {
      e.preventDefault();
      var file = KM.$('#upF', body).files[0], img = KM.$('#upI', body).files[0];
      if ((file && file.size > 700 * 1024) || (img && img.size > 700 * 1024)) { KM.ui.toast('Слишком большой файл', 'До 700 КБ на файл', '⚠️'); return; }
      Promise.all([file ? fileToB64(file) : null, img ? fileToB64(img) : null]).then(function (r) {
        return KM.api.galleryUpload({ title: KM.$('#upT', body).value, desc: KM.$('#upD', body).value, file: r[0], image: r[1] });
      }).then(function () { KM.ui.toast('Проект опубликован', '', '📸'); KM.game.addXP(30, 'Проект в галерее'); gallery(body); })
        .catch(function (err) { KM.ui.toast('Не удалось', err.message, '⚠️'); });
    };
    load();
  }

  /* ---------- лидеры ---------- */
  function leaders(body) {
    var s = KM.store.state;
    var me = { name: (KM.api.user && KM.api.user.name) || s.name || 'Вы', avatar: (KM.api.user && KM.api.user.avatar) || '🙂', xp: s.xp, level: KM.game.level(), streak: KM.game.streak(),
      lessons: Object.keys(s.lessons).filter(function (k) { return s.lessons[k].done; }).length, projects: Object.keys(s.projects).filter(function (k) { return s.projects[k].checked; }).length };
    function row(r, i, isMe) {
      return '<div class="lb-row' + (isMe ? ' me' : '') + '"><span class="pos">' + (i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1) + '</span><div><b>' + KM.esc(r.avatar + ' ' + r.name) + '</b><div class="tiny">ур. ' + r.level + ' · 📘 ' + r.lessons + ' · 🛠️ ' + r.projects + ' · 🔥 ' + r.streak + '</div></div><b>' + r.xp + ' XP</b></div>';
    }
    if (!KM.api.online) { body.innerHTML = '<p class="muted">Без сервера таблица содержит только вас.</p><div class="card">' + row(me, 0, true) + '</div>' + serverHint(); return; }
    body.innerHTML = loginBox() + '<div class="card" id="lb"><div class="tiny">Загрузка…</div></div><p class="tiny">В таблицу попадают только ник и статистика (опыт, уровень, уроки, проекты, серия), когда вы вошли.</p>';
    KM.api.leaderboard().then(function (j) {
      KM.$('#lb', body).innerHTML = j.rows.length ? j.rows.map(function (r, i) { return row(r, i, KM.api.user && r.id === KM.api.user.id); }).join('') : '<div class="empty">Пока пусто. Войдите, чтобы попасть в таблицу.</div>';
    }).catch(function (e) { KM.$('#lb', body).textContent = e.message; });
  }

  /* ---------- рассылка ---------- */
  function news(body) {
    body.innerHTML = '<div class="card" style="max-width:560px"><h3>📧 Новости курса</h3><p class="muted small">Новые уроки, проекты и заметки о KiCad — не чаще раза в месяц. Отписаться можно в любой момент.</p>' +
      (KM.api.online ? '<form class="row" id="nlForm"><input type="email" id="nlE" placeholder="email@example.com" required style="flex:1;min-width:200px"><button class="btn primary">Подписаться</button></form>' : serverHint()) + '</div>' +
      '<div class="card flat mt" style="max-width:560px"><h3>🔔 Напоминания о занятиях</h3><p class="small muted">Уведомление в браузере, если сегодня вы ещё не занимались. Настраивается в <a href="#/settings">Настройках</a>.</p></div>';
    var f = KM.$('#nlForm', body);
    if (f) f.onsubmit = function (e) { e.preventDefault(); KM.api.newsletter(KM.$('#nlE', body).value).then(function () { f.innerHTML = '<p class="mb0">✅ Вы подписаны!</p>'; }).catch(function (err) { KM.ui.toast('Ошибка', err.message, '⚠️'); }); };
  }
})();
