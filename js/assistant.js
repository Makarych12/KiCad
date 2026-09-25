/* =========================================================
   AI-ассистент на любой странице: плавающая кнопка и панель чата.
   История общая с вкладкой «AI-ассистент» в Сообществе.
   ========================================================= */
KM.assistant = (function () {
  var history = [];
  var stop = null, box = null, fab = null;

  // безопасная разметка ответа: экранирование + ```код```, **жирный**, `код`, списки
  function md(s) {
    return String(s).split(/```/).map(function (p, i) {
      if (i % 2) return '<pre><code>' + KM.esc(p.replace(/^\w*\n/, '')) + '</code></pre>';
      return KM.esc(p).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>')
        .split(/\n{2,}/).map(function (para) {
          if (/^\s*[-*] /m.test(para)) return '<ul>' + para.split('\n').filter(Boolean).map(function (l) { return '<li>' + l.replace(/^\s*[-*] /, '') + '</li>'; }).join('') + '</ul>';
          if (/^\s*\d+[.)] /m.test(para)) return '<ol>' + para.split('\n').filter(Boolean).map(function (l) { return '<li>' + l.replace(/^\s*\d+[.)] /, '') + '</li>'; }).join('') + '</ol>';
          if (/^#{1,4} /.test(para)) return '<p><b>' + para.replace(/^#{1,4} /, '') + '</b></p>';
          return para.trim() ? '<p>' + para.replace(/\n/g, '<br>') + '</p>' : '';
        }).join('');
    }).join('');
  }

  function modelName() {
    var id = KM.store.state.settings.aiModel;
    return id ? id.split('/').pop() : (KM.api.model ? String(KM.api.model).split('/').pop() : 'модель сайта');
  }

  // Отправка вопроса. ui: {add(role,text) → bubble, set(bubble, html), busy(bool)}
  function ask(text, context, ui) {
    text = text.trim();
    if (!text) return;
    if (!KM.api.aiAvailable()) { ui.add('assistant', '').innerHTML = unavailable(); return; }
    history.push({ role: 'user', content: text }); ui.add('user', text);
    KM.store.state.aiQuestions++; KM.game.activity();
    var bubble = ui.add('assistant', '…'), acc = '', ended = false;
    ui.busy(true);
    function fin() { ui.busy(false); stop = null; }
    stop = KM.api.ask(history.slice(-20), context, function (chunk) {
      acc += chunk; ui.set(bubble, md(acc));
    }, function () {
      if (ended) return; ended = true;
      if (acc) history.push({ role: 'assistant', content: acc }); else history.pop();
      fin();
    }, function (err) {
      if (ended) return; ended = true;
      ui.set(bubble, (acc ? md(acc) : '') + '<div class="callout danger"><span class="ico">⚠️</span><div>' + KM.esc(err) + '</div></div>');
      if (acc) history.push({ role: 'assistant', content: acc }); else history.pop();
      fin();
    });
  }
  function cancel() { if (stop) stop(); stop = null; }

  function unavailable() {
    return '<div class="callout warn"><span class="ico">🔑</span><div><strong>Ассистент не подключён</strong>Владелец сайта может задать <code>OPENROUTER_API_KEY</code> в Vercel, или вы можете указать свой ключ OpenRouter/Anthropic в <a href="#/settings">Настройках</a>.</div></div>';
  }

  /* ---------- плавающая панель ---------- */
  function build() {
    fab = document.createElement('button');
    fab.className = 'ai-fab no-print'; fab.id = 'aiFab';
    fab.setAttribute('aria-label', 'Открыть AI-ассистента'); fab.setAttribute('aria-controls', 'aiPanel'); fab.setAttribute('aria-expanded', 'false');
    fab.innerHTML = '<span aria-hidden="true">🤖</span><span class="ai-fab-label">Спросить AI</span>';
    box = document.createElement('section');
    box.className = 'ai-panel no-print'; box.id = 'aiPanel'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'AI-ассистент');
    box.innerHTML = '<header class="ai-head"><div><b>🤖 AI-ассистент</b><a class="tiny" href="#/models" id="aiModel" title="Выбрать модель"></a></div>' +
      '<div class="row" style="gap:4px"><button class="icon-btn" id="aiNew" title="Новый диалог" aria-label="Новый диалог"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>' +
      '<button class="icon-btn" id="aiClose" aria-label="Закрыть"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div></header>' +
      '<div class="chat-log" id="aiPLog" aria-live="polite"></div>' +
      '<div class="chips ai-sugg" id="aiSugg"></div>' +
      '<form class="chat-form" id="aiPForm"><textarea id="aiPIn" rows="1" placeholder="Вопрос по KiCad или этой странице…" aria-label="Вопрос ассистенту"></textarea>' +
      '<button class="btn primary" id="aiPSend" aria-label="Отправить">➤</button><button class="btn" type="button" id="aiPStop" hidden aria-label="Остановить">■</button></form>';
    document.body.appendChild(box); document.body.appendChild(fab);
    var log = KM.$('#aiPLog', box), inp = KM.$('#aiPIn', box);
    var ui = {
      add: function (role, text) {
        var d = document.createElement('div'); d.className = 'msg ' + (role === 'user' ? 'me' : 'bot');
        d.innerHTML = (role === 'user' ? '' : '<div class="who">🤖 Ассистент</div>') + '<div class="body">' + (role === 'user' ? KM.esc(text).replace(/\n/g, '<br>') : md(text)) + '</div>';
        log.appendChild(d); log.scrollTop = log.scrollHeight; return KM.$('.body', d) || d;
      },
      set: function (b, html) { b.innerHTML = html; log.scrollTop = log.scrollHeight; },
      busy: function (on) { KM.$('#aiPSend', box).disabled = on; KM.$('#aiPStop', box).hidden = !on; }
    };
    function redraw() {
      log.innerHTML = '';
      if (!history.length) {
        ui.add('assistant', 'Привет! Спросите про KiCad, электронику или текущую страницу — я вижу, где вы находитесь.');
        if (!KM.api.aiAvailable()) ui.add('assistant', '').innerHTML = unavailable();
      }
      history.forEach(function (m) { ui.add(m.role, m.content); });
      KM.$('#aiModel', box).textContent = 'Модель: ' + modelName() + ' · сменить';
      var page = KM.$('main h1'), sugg = ['Объясни эту страницу проще', 'Какие типичные ошибки здесь?', 'Резистор для светодиода от 5 В?'];
      if (page && /урок|символ|трасс|плат|схем/i.test(page.textContent)) sugg[0] = 'Как сделать это в KiCad по шагам?';
      KM.$('#aiSugg', box).innerHTML = history.length ? '' : sugg.map(function (s) { return '<button class="chip" type="button">' + KM.esc(s) + '</button>'; }).join('');
      KM.$$('#aiSugg .chip', box).forEach(function (c) { c.onclick = function () { KM.$('#aiSugg', box).innerHTML = ''; send(c.textContent); }; });
    }
    function context() { var h = KM.$('main h1'); return (h ? h.textContent.trim() : document.title) + ' (' + location.hash + ')'; }
    function send(t) { ask(t, context(), ui); }
    function open() { redraw(); box.hidden = false; fab.setAttribute('aria-expanded', 'true'); fab.classList.add('hidden'); setTimeout(function () { inp.focus(); }, 50); }
    function close() { box.hidden = true; fab.setAttribute('aria-expanded', 'false'); fab.classList.remove('hidden'); fab.focus(); }
    fab.onclick = open;
    KM.$('#aiClose', box).onclick = close;
    KM.$('#aiNew', box).onclick = function () { cancel(); history.length = 0; redraw(); };
    KM.$('#aiPStop', box).onclick = function () { cancel(); ui.busy(false); };
    KM.$('#aiPForm', box).onsubmit = function (e) { e.preventDefault(); var t = inp.value; inp.value = ''; KM.$('#aiSugg', box).innerHTML = ''; send(t); };
    inp.onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); KM.$('#aiPForm', box).requestSubmit(); } };
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('[data-open-ai]'); if (a) { e.preventDefault(); open(); } });
    // на странице Сообщество → AI своя большая версия чата
    function syncVisibility() { var onAiTab = /^#\/community/.test(location.hash) && (/tab=ai/.test(location.hash) || !/tab=/.test(location.hash)); fab.style.display = onAiTab ? 'none' : ''; if (onAiTab && !box.hidden) close(); }
    window.addEventListener('hashchange', function () { syncVisibility(); if (!box.hidden) KM.$('#aiModel', box).textContent = 'Модель: ' + modelName() + ' · сменить'; });
    syncVisibility();
  }

  return { history: history, md: md, ask: ask, cancel: cancel, build: build, unavailable: unavailable };
})();
