/* Настройки: внешний вид, доступность, язык, напоминания, сервер, AI, офлайн */
KM.views.settings = {
  render: function () {
    var s = KM.store.state.settings;
    function radio(name, val, label) { return '<label class="chip" style="display:inline-flex;gap:6px;align-items:center"><input type="radio" name="' + name + '" value="' + val + '"' + (String(s[name]) === String(val) ? ' checked' : '') + '> ' + label + '</label>'; }
    var accents = [['green', '#0f7b5a', 'Зелёный'], ['copper', '#b8672e', 'Медь'], ['blue', '#1d5fb8', 'Синий'], ['violet', '#6b46c1', 'Фиолетовый'], ['red', '#c0392b', 'Красный']];
    return '<div class="page narrow"><div class="page-head"><h1>Настройки</h1></div>' +
      '<section class="card stack"><h2>🎨 Внешний вид</h2>' +
        '<div class="field"><span class="label">Тема</span><div class="chips">' + radio('theme', 'auto', '🖥️ Как в системе') + radio('theme', 'light', '☀️ Светлая') + radio('theme', 'dark', '🌙 Тёмная') + '</div></div>' +
        '<div class="field"><span class="label">Акцентный цвет</span><div class="chips">' + accents.map(function (a) { return '<label class="chip" style="display:inline-flex;gap:6px;align-items:center"><input type="radio" name="accent" value="' + a[0] + '"' + (s.accent === a[0] ? ' checked' : '') + '><span style="width:14px;height:14px;border-radius:50%;background:' + a[1] + ';display:inline-block"></span>' + a[2] + '</label>'; }).join('') + '</div></div>' +
      '</section>' +
      '<section class="card stack mt"><h2>♿ Доступность</h2>' +
        '<div class="field"><label for="fs">Размер текста: <b id="fsv">' + Math.round(s.fontScale * 100) + '%</b></label><input type="range" id="fs" min="0.85" max="1.4" step="0.05" value="' + s.fontScale + '"></div>' +
        '<label class="row"><input type="checkbox" id="rm"' + (s.reduceMotion ? ' checked' : '') + '> Уменьшить анимацию</label>' +
        '<label class="row"><input type="checkbox" id="hc"' + (s.contrast ? ' checked' : '') + '> Высокий контраст текста</label>' +
        '<p class="tiny mb0">Сайт поддерживает клавиатурную навигацию (Tab, стрелки во вкладках и тестах, <kbd>/</kbd> — поиск), экранные дикторы и масштабирование браузера.</p>' +
      '</section>' +
      '<section class="card stack mt"><h2>🌍 Язык интерфейса</h2><select id="lang" style="max-width:260px">' + KM.data.languages.map(function (l) { return '<option value="' + l[0] + '"' + (s.lang === l[0] ? ' selected' : '') + '>' + l[1] + '</option>'; }).join('') + '</select>' +
        '<p class="tiny mb0">Переводится навигация и служебные надписи; учебные материалы — на русском. Для перевода контента можно воспользоваться встроенным переводчиком браузера (Chrome, Edge, Яндекс Браузер).</p></section>' +
      '<section class="card stack mt"><h2>🔔 Напоминания</h2><label class="row"><input type="checkbox" id="rem"' + (s.reminders ? ' checked' : '') + '> Напоминать о занятиях, если сегодня я ещё не занимался(ась)</label>' +
        '<label class="row small">после <select id="remH" style="width:auto">' + [8, 10, 12, 15, 17, 18, 19, 20, 21, 22].map(function (h) { return '<option' + (s.reminderHour === h ? ' selected' : '') + '>' + h + '</option>'; }).join('') + '</select> часов</label>' +
        '<p class="tiny mb0">Уведомления показываются браузером, пока сайт открыт во вкладке или установлен как приложение.</p></section>' +
      '<section class="card stack mt"><h2>📱 Приложение и офлайн</h2><p class="small mb0">Сайт — прогрессивное веб-приложение (PWA): его можно установить на телефон или компьютер и заниматься без интернета.</p>' +
        '<div class="row"><button class="btn primary" id="inst"' + (KM.canInstall() ? '' : ' hidden') + '>📲 Установить приложение</button><button class="btn" id="offline">⬇️ Скачать все материалы для офлайна</button></div><div class="small" id="offStat"></div>' +
        '<p class="tiny mb0">Если кнопки установки нет: на iPhone — «Поделиться → На экран «Домой»», в Chrome — значок установки в адресной строке. Офлайн-режим работает, когда сайт открыт по http(s), а не как файл.</p></section>' +
      '<section class="card stack mt"><h2>🖥️ Сервер курса</h2><p class="small mb0">Для чата, лидеров, галереи и синхронизации. Если сайт открыт с сервера, адрес указывать не нужно.</p>' +
        '<div class="row"><input type="text" id="srv" placeholder="http://localhost:8080" value="' + KM.esc(s.serverUrl || '') + '" style="max-width:320px"><button class="btn" id="srvCheck">Проверить</button></div><div class="small" id="srvStat">' + (KM.api.online ? '🟢 Подключено' + (KM.api.ai ? ', AI: ' + KM.esc(KM.api.model) : '') : '⚪ Не подключено') + '</div></section>' +
      '<section class="card stack mt"><h2>🤖 AI-ассистент (свой ключ)</h2><p class="small mb0">Без сервера ассистент может работать напрямую из браузера с вашим API-ключом Anthropic (console.anthropic.com). Ключ хранится только в этом браузере и отправляется только на api.anthropic.com. Используйте ключ с лимитом расходов и не вводите его на чужих устройствах.</p>' +
        '<div class="row"><input type="password" id="aikey" placeholder="sk-ant-…" value="' + KM.esc(s.aiKey || '') + '" style="max-width:360px" autocomplete="off"><button class="btn" id="aisave">Сохранить</button><button class="btn ghost" id="aidel">Удалить</button></div></section>' +
      '</div>';
  },
  mount: function (root) {
    var s = KM.store.state.settings;
    function save() { KM.store.touch(); KM.applySettings(); }
    KM.$$('input[name="theme"],input[name="accent"]', root).forEach(function (r) { r.onchange = function () { s[r.name] = r.value; save(); }; });
    KM.$('#fs', root).oninput = function () { s.fontScale = parseFloat(this.value); KM.$('#fsv', root).textContent = Math.round(s.fontScale * 100) + '%'; save(); };
    KM.$('#rm', root).onchange = function () { s.reduceMotion = this.checked; save(); };
    KM.$('#hc', root).onchange = function () { s.contrast = this.checked; save(); };
    KM.$('#lang', root).onchange = function () { s.lang = this.value; save(); KM.ui.renderNav(); };
    KM.$('#rem', root).onchange = function () {
      var cb = this;
      if (cb.checked && 'Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission().then(function (p) { s.reminders = p === 'granted'; cb.checked = s.reminders; save(); if (!s.reminders) KM.ui.toast('Уведомления запрещены', 'Разрешите их в настройках браузера', '🔕'); });
      } else { s.reminders = cb.checked; save(); }
    };
    KM.$('#remH', root).onchange = function () { s.reminderHour = +this.value; save(); };
    KM.$('#inst', root).onclick = function () { KM.install(); this.hidden = true; };
    KM.$('#offline', root).onclick = function () {
      var st = KM.$('#offStat', root);
      if (!navigator.serviceWorker || !navigator.serviceWorker.controller) { st.textContent = 'Офлайн-кэш доступен, когда сайт открыт по http(s). Сейчас он недоступен.'; return; }
      st.textContent = 'Скачиваю…';
      var ch = new MessageChannel();
      ch.port1.onmessage = function (e) { st.textContent = e.data.done ? '✅ Сохранено файлов: ' + e.data.count + '. Курс доступен без интернета.' : 'Скачано ' + e.data.count + '…'; };
      navigator.serviceWorker.controller.postMessage({ type: 'cache-all' }, [ch.port2]);
    };
    KM.$('#srvCheck', root).onclick = function () {
      s.serverUrl = KM.$('#srv', root).value.trim(); save();
      KM.$('#srvStat', root).textContent = 'Проверяю…';
      KM.api.detect().then(function (ok) { KM.$('#srvStat', root).textContent = ok ? '🟢 Подключено' + (KM.api.ai ? ', AI: ' + KM.api.model : ', AI на сервере не настроен') : '🔴 Сервер не отвечает'; });
    };
    KM.$('#aisave', root).onclick = function () { s.aiKey = KM.$('#aikey', root).value.trim(); save(); KM.ui.toast('Ключ сохранён', 'Только в этом браузере', '🔑'); };
    KM.$('#aidel', root).onclick = function () { delete s.aiKey; KM.$('#aikey', root).value = ''; save(); };
  }
};
