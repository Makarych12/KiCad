/* =========================================================
   Клиент онлайн-функций. Если сайт открыт через server/server.mjs
   (или в настройках указан адрес сервера), включаются чат, лидеры,
   синхронизация, галерея, рассылка и AI через сервер.
   Без сервера всё работает локально; AI-ассистент можно
   подключить своим API-ключом Anthropic прямо в браузере.
   ========================================================= */
KM.api = (function () {
  var TOKEN_KEY = 'km.token', USER_KEY = 'km.user';
  var api = { online: false, ai: false, model: null, user: null };
  try { api.user = JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch (e) { /* нет доступа к хранилищу */ }

  function base() {
    var s = KM.store.state.settings.serverUrl;
    if (s) return s.replace(/\/$/, '');
    return /^https?:/.test(location.protocol) ? '' : null;
  }
  function token() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
  function req(method, path, body, timeout) {
    var b = base();
    if (b === null) return Promise.reject(new Error('Сервер не подключён'));
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, timeout || 15000);
    var h = { 'Content-Type': 'application/json' };
    if (token()) h.Authorization = 'Bearer ' + token();
    return fetch(b + path, { method: method, headers: h, body: body ? JSON.stringify(body) : undefined, signal: ctrl.signal })
      .then(function (r) {
        clearTimeout(t);
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status));
          return j;
        });
      });
  }
  api.req = req;

  api.detect = function () {
    if (base() === null) { api.online = false; KM.emit('api', api); return Promise.resolve(false); }
    return req('GET', '/api/health', null, 3000).then(function (j) {
      api.online = !!j.ok; api.ai = !!j.ai; api.model = j.model;
      KM.emit('api', api); return api.online;
    }).catch(function () { api.online = false; KM.emit('api', api); return false; });
  };

  api.register = function (name) {
    return req('POST', '/api/register', { name: name }).then(function (j) {
      try { localStorage.setItem(TOKEN_KEY, j.token); localStorage.setItem(USER_KEY, JSON.stringify(j.user)); } catch (e) { /* ignore */ }
      api.user = j.user; KM.emit('api', api); return j.user;
    });
  };
  api.logout = function () {
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch (e) { /* ignore */ }
    api.user = null; KM.emit('api', api);
  };

  // Публичная статистика для таблицы лидеров
  api.pushStats = KM.debounce(function () {
    if (!api.online || !api.user) return;
    var s = KM.store.state;
    req('POST', '/api/progress', {
      xp: s.xp, level: KM.game.level(), streak: KM.game.streak(),
      lessons: Object.keys(s.lessons).filter(function (k) { return s.lessons[k].done; }).length,
      projects: Object.keys(s.projects).filter(function (k) { return s.projects[k].checked; }).length,
      achievements: Object.keys(s.achievements).length
    }).catch(function () { /* офлайн — не страшно */ });
  }, 4000);
  api.leaderboard = function () { return req('GET', '/api/leaderboard'); };

  api.syncPush = function () { return req('PUT', '/api/sync', { state: KM.store.shareable() }); };
  api.syncPull = function () {
    return req('GET', '/api/sync').then(function (j) {
      if (j.state) KM.store.import({ state: j.state }, true);
      return j;
    });
  };

  api.chatList = function (since) { return req('GET', '/api/chat?since=' + (since || 0)); };
  api.chatSend = function (text) { return req('POST', '/api/chat', { text: text }); };
  api.chatStream = function (onMsg) {
    var b = base();
    if (b === null || !window.EventSource) return null;
    var es = new EventSource(b + '/api/chat/stream');
    es.onmessage = function (e) { try { onMsg(JSON.parse(e.data)); } catch (err) { /* ignore */ } };
    return es;
  };

  api.gallery = function () { return req('GET', '/api/gallery'); };
  api.galleryUpload = function (data) { return req('POST', '/api/gallery', data, 60000); };
  api.rate = function (id, stars) { return req('POST', '/api/gallery/' + id + '/rate', { stars: stars }); };
  api.newsletter = function (email) { return req('POST', '/api/newsletter', { email: email }); };

  /* ---------- AI-ассистент ---------- */
  var SYSTEM = 'Ты — дружелюбный преподаватель курса «KiCad Мастер Pro» по проектированию печатных плат в KiCad (версии 8–10) и основам электроники. ' +
    'Отвечай по-русски, понятно для начинающего, но технически точно. Давай конкретные шаги с названиями пунктов меню KiCad и горячими клавишами. ' +
    'Для расчётов показывай формулу и подставляй числа. Если не уверен в детали версии KiCad — так и скажи. Не выдумывай номера деталей и ссылки. ' +
    'Предупреждай об опасности при работе с сетевым напряжением.';
  api.aiAvailable = function () { return (api.online && api.ai) || !!KM.store.state.settings.aiKey; };

  // onText(chunk), onDone(), onError(msg). Возвращает функцию отмены.
  api.ask = function (messages, context, onText, onDone, onError) {
    if (api.online && api.ai) return askServer(messages, context, onText, onDone, onError);
    if (KM.store.state.settings.aiKey) return askDirect(messages, context, onText, onDone, onError);
    onError('AI-ассистент не подключён. Запустите сервер курса с ключом API или укажите свой ключ в Настройках.');
    return function () {};
  };

  function askServer(messages, context, onText, onDone, onError) {
    var ctrl = new AbortController();
    var h = { 'Content-Type': 'application/json' };
    if (token()) h.Authorization = 'Bearer ' + token();
    fetch(base() + '/api/ai', { method: 'POST', headers: h, body: JSON.stringify({ messages: messages, context: context }), signal: ctrl.signal })
      .then(function (r) {
        if (!r.ok) return r.json().then(function (j) { throw new Error(j.error || 'HTTP ' + r.status); });
        var reader = r.body.getReader(), dec = new TextDecoder(), buf = '';
        function pump() {
          return reader.read().then(function (x) {
            if (x.done) { onDone(); return; }
            buf += dec.decode(x.value, { stream: true });
            var parts = buf.split('\n\n'); buf = parts.pop();
            parts.forEach(function (p) {
              if (p.indexOf('data: ') !== 0) return;
              var j; try { j = JSON.parse(p.slice(6)); } catch (e) { return; }
              if (j.text) onText(j.text);
              if (j.error) onError(j.error);
            });
            return pump();
          });
        }
        return pump();
      })
      .catch(function (e) { if (e.name !== 'AbortError') onError(e.message); });
    return function () { ctrl.abort(); };
  }

  // Прямой вызов из браузера официальным SDK (ключ пользователя хранится только в этом браузере)
  var sdkPromise = null;
  function loadSdk() {
    if (!sdkPromise) sdkPromise = import('https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk/+esm').then(function (m) { return m.default || m.Anthropic; });
    return sdkPromise;
  }
  function askDirect(messages, context, onText, onDone, onError) {
    var stopped = false, stream = null;
    loadSdk().then(function (Anthropic) {
      var client = new Anthropic({ apiKey: KM.store.state.settings.aiKey, dangerouslyAllowBrowser: true });
      stream = client.beta.messages.stream({
        model: 'claude-opus-5',
        max_tokens: 16000,
        system: SYSTEM + (context ? '\n\nКонтекст: пользователь сейчас на странице курса: ' + context : ''),
        messages: messages,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default'
      });
      stream.on('text', function (t) { if (!stopped) onText(t); });
      return stream.finalMessage();
    }).then(function (final) {
      if (stopped) return;
      if (final.stop_reason === 'refusal') onError('Ассистент не может ответить на этот вопрос. Попробуйте переформулировать.');
      onDone();
    }).catch(function (e) {
      if (stopped) return;
      onError(e && e.status === 401 ? 'Неверный API-ключ.' : 'Ошибка AI: ' + ((e && e.message) || 'не удалось загрузить SDK (нужен интернет)'));
    });
    return function () { stopped = true; if (stream) stream.abort(); };
  }

  return api;
})();
