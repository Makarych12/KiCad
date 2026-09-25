/* =========================================================
   Ядро: пространство имён, утилиты, хранилище, геймификация,
   маршрутизатор, события.
   ========================================================= */
window.KM = window.KM || {};
KM.data = KM.data || {};
KM.views = KM.views || {};

/* ---------- утилиты ---------- */
KM.esc = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
};
// Мини-разметка для текстов уроков: **жирный**, `код`, [[клавиша]], переносы строк
KM.md = function (s) {
  if (!s) return '';
  var out = KM.esc(s)
    .replace(/\[\[([^\]]+)\]\]/g, function (_, k) {
      return k.split('+').map(function (p) { return '<kbd>' + p.trim() + '</kbd>'; }).join('+');
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\{\{(\w[\w-]*)\|([^}]+)\}\}/g, '<a href="#/$1">$2</a>');
  return out.split(/\n{2,}/).map(function (p) {
    if (/^## /.test(p)) return '<h2>' + p.slice(3) + '</h2>';
    if (/^### /.test(p)) return '<h3>' + p.slice(4) + '</h3>';
    if (/^- /m.test(p)) {
      return '<ul>' + p.split('\n').map(function (li) { return '<li>' + li.replace(/^- /, '') + '</li>'; }).join('') + '</ul>';
    }
    if (/^\d+\. /m.test(p)) {
      return '<ol>' + p.split('\n').map(function (li) { return '<li>' + li.replace(/^\d+\. /, '') + '</li>'; }).join('') + '</ol>';
    }
    return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
  }).join('');
};
KM.$ = function (sel, root) { return (root || document).querySelector(sel); };
KM.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
KM.uid = function () { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); };
KM.today = function (d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};
KM.plural = function (n, one, few, many) {
  var m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
};
// Форматирование с приставками СИ: 4700 → "4.7 к"
KM.si = function (v, unit, digits) {
  if (!isFinite(v)) return '—';
  if (v === 0) return '0 ' + (unit || '');
  var p = [[1e9, 'Г'], [1e6, 'М'], [1e3, 'к'], [1, ''], [1e-3, 'м'], [1e-6, 'мк'], [1e-9, 'н'], [1e-12, 'п']];
  var a = Math.abs(v);
  for (var i = 0; i < p.length; i++) {
    if (a >= p[i][0] * 0.9995) {
      var n = v / p[i][0];
      var s = n.toPrecision(digits || 3);
      if (s.indexOf('e') < 0 && s.indexOf('.') >= 0) s = s.replace(/\.?0+$/, '');
      return s + ' ' + p[i][1] + (unit || '');
    }
  }
  return v.toExponential(2) + ' ' + (unit || '');
};
// Разбор значения с приставкой: "4k7", "4.7к", "10u", "100n", "2.2М"
KM.parseSI = function (str) {
  if (typeof str === 'number') return str;
  var s = String(str).trim().replace(',', '.').replace(/\s+/g, '').replace(/(Ом|ohm|Ω|Ф|F|Гн|H|В|V|А|A|Гц|Hz)$/i, '');
  var mult = { p: 1e-12, 'п': 1e-12, n: 1e-9, 'н': 1e-9, u: 1e-6, 'µ': 1e-6, 'μ': 1e-6, 'мк': 1e-6, m: 1e-3, 'м': 1e-3,
    k: 1e3, K: 1e3, 'к': 1e3, M: 1e6, 'М': 1e6, G: 1e9, 'Г': 1e9, R: 1, r: 1 };
  var m = s.match(/^(\d*\.?\d*)(мк|[pnuµμmkKMGRrпнмкМГ])?(\d*)$/);
  if (!m || (m[1] === '' && m[3] === '')) return NaN;
  var num = parseFloat((m[1] || '0') + (m[3] ? '.' + m[3] : ''));
  if (m[1].indexOf('.') >= 0 && m[3]) return NaN;
  return num * (m[2] ? mult[m[2]] : 1);
};
KM.debounce = function (fn, ms) {
  var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms); };
};
KM.download = function (name, content, type) {
  var blob = content instanceof Blob ? content : new Blob([content], { type: type || 'text/plain;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
};

/* ---------- события ---------- */
(function () {
  var handlers = {};
  KM.on = function (ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); };
  KM.off = function (ev, fn) { handlers[ev] = (handlers[ev] || []).filter(function (f) { return f !== fn; }); };
  KM.emit = function (ev, data) { (handlers[ev] || []).slice().forEach(function (f) { try { f(data); } catch (e) { console.error(e); } }); };
})();

/* ---------- хранилище ---------- */
KM.store = (function () {
  var KEY = 'km.v1';
  var defaults = function () {
    return {
      v: 1,
      created: Date.now(),
      name: '',
      xp: 0,
      xpLog: [],            // [{t, xp, why}]
      lessons: {},          // id → {done: ts, steps: {i: true}}
      quizzes: {},          // id → {best, last, attempts, perfect}
      projects: {},         // id → {checked: ts, score, attempts, medal}
      demos: {},            // id → watched ts
      days: {},             // 'YYYY-MM-DD' → число действий
      achievements: {},     // id → ts
      bookmarks: [],        // [{route, title, t}]
      notes: {},            // route → текст
      calcUses: {},
      simRuns: 0,
      simSaved: [],
      viewed: {},           // компоненты/шаблоны/статьи
      downloads: 0,
      aiQuestions: 0,
      settings: { theme: 'auto', accent: 'green', lang: 'ru', fontScale: 1, reduceMotion: false, contrast: false, reminders: false, reminderHour: 19 }
    };
  };
  var state;
  function load(obj) {
    if (obj !== undefined) state = obj;
    else { try { state = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { state = null; } }
    var d = defaults();
    if (!state || typeof state !== 'object') state = d;
    Object.keys(d).forEach(function (k) { if (state[k] === undefined) state[k] = d[k]; });
    Object.keys(d.settings).forEach(function (k) { if (state.settings[k] === undefined) state.settings[k] = d.settings[k]; });
    return state;
  }
  var saveSoon = KM.debounce(function () { save(); }, 150);
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('Не удалось сохранить прогресс', e); }
    KM.emit('saved', state);
  }
  load();
  return {
    get state() { return state; },
    save: save,
    touch: function () { saveSoon(); KM.emit('change', state); },
    reset: function () { load(defaults()); save(); KM.emit('change', state); },
    // копия прогресса без секретов (API-ключ остаётся только в этом браузере)
    shareable: function () { var c = JSON.parse(JSON.stringify(state)); delete c.settings.aiKey; delete c.settings.serverUrl; return c; },
    export: function () { return JSON.stringify({ app: 'kicad-master-pro', exported: new Date().toISOString(), state: KM.store.shareable() }, null, 2); },
    import: function (json, merge) {
      var obj = typeof json === 'string' ? JSON.parse(json) : json;
      var incoming = obj.state || obj;
      if (!incoming || typeof incoming.xp !== 'number') throw new Error('Файл не похож на экспорт прогресса KiCad Мастер Pro');
      var keep = { aiKey: state.settings.aiKey, serverUrl: state.settings.serverUrl };
      load(merge ? KM.store.merge(state, incoming) : incoming);
      if (keep.aiKey) state.settings.aiKey = keep.aiKey;
      if (keep.serverUrl) state.settings.serverUrl = keep.serverUrl;
      save(); KM.emit('change', state);
    },
    // Слияние двух состояний (для синхронизации): берём максимум/объединение
    merge: function (a, b) {
      var r = JSON.parse(JSON.stringify(a));
      ['lessons', 'quizzes', 'projects', 'demos', 'achievements', 'viewed', 'notes', 'calcUses'].forEach(function (k) {
        Object.keys(b[k] || {}).forEach(function (id) {
          var x = r[k][id], y = b[k][id];
          if (x === undefined) r[k][id] = y;
          else if (k === 'quizzes' && y && x) r[k][id] = { best: Math.max(x.best || 0, y.best || 0), last: y.last, attempts: (x.attempts || 0) + (y.attempts || 0), perfect: x.perfect || y.perfect };
          else if (k === 'notes' && typeof y === 'string' && y.length > String(x).length) r[k][id] = y;
        });
      });
      Object.keys(b.days || {}).forEach(function (d) { r.days[d] = Math.max(r.days[d] || 0, b.days[d]); });
      var seen = {}; r.bookmarks = (a.bookmarks || []).concat(b.bookmarks || []).filter(function (x) { if (seen[x.route]) return false; seen[x.route] = 1; return true; });
      r.xp = Math.max(a.xp || 0, b.xp || 0);
      r.xpLog = (a.xpLog || []).concat(b.xpLog || []).sort(function (x, y) { return x.t - y.t; }).slice(-500);
      r.simRuns = Math.max(a.simRuns || 0, b.simRuns || 0);
      r.name = a.name || b.name;
      return r;
    }
  };
})();

/* ---------- геймификация ---------- */
KM.game = (function () {
  function st() { return KM.store.state; }
  function levelFor(xp) { return Math.floor(Math.sqrt(xp / 50)) + 1; }
  function xpForLevel(l) { return 50 * (l - 1) * (l - 1); }
  var titles = ['Новичок', 'Паяльщик', 'Схемотехник', 'Трассировщик', 'Разводчик', 'Конструктор', 'Инженер', 'Ведущий инженер', 'Архитектор плат', 'Гуру KiCad', 'Легенда PCB'];

  function markDay() {
    var s = st(), d = KM.today();
    s.days[d] = (s.days[d] || 0) + 1;
  }
  function streak() {
    var s = st(), n = 0, d = new Date();
    if (!s.days[KM.today(d)]) d.setDate(d.getDate() - 1); // сегодня ещё не занимались — считаем от вчера
    while (s.days[KM.today(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function bestStreak() {
    var days = Object.keys(st().days).sort(), best = 0, cur = 0, prev = null;
    days.forEach(function (k) {
      var t = new Date(k + 'T12:00:00');
      if (prev && Math.round((t - prev) / 864e5) === 1) cur++; else cur = 1;
      best = Math.max(best, cur); prev = t;
    });
    return best;
  }
  function addXP(n, why) {
    var s = st(), before = levelFor(s.xp);
    s.xp += n;
    s.xpLog.push({ t: Date.now(), xp: n, why: why });
    if (s.xpLog.length > 500) s.xpLog.shift();
    markDay();
    KM.store.touch();
    KM.ui && KM.ui.toast('+' + n + ' XP', why, '⚡');
    var after = levelFor(s.xp);
    if (after > before) {
      var unlocked = (KM.data.lessons || []).filter(function (l) { return l.unlockLevel && l.unlockLevel > before && l.unlockLevel <= after; });
      KM.ui && KM.ui.toast('Новый уровень: ' + after, titles[Math.min(after - 1, titles.length - 1)] +
        (unlocked.length ? ' · открыт бонусный урок «' + unlocked[0].title + '»' : ''), '🎉', 'achievement');
      KM.emit('levelup', after);
    }
    checkAchievements();
  }
  function checkAchievements() {
    var s = st();
    (KM.data.achievements || []).forEach(function (a) {
      if (s.achievements[a.id]) return;
      var ok = false;
      try { ok = a.test(s, api); } catch (e) { ok = false; }
      if (ok) {
        s.achievements[a.id] = Date.now();
        KM.store.touch();
        KM.ui && KM.ui.toast('Достижение: ' + a.title, a.desc, a.icon, 'achievement');
        KM.emit('achievement', a);
      }
    });
  }
  var api = {
    levelFor: levelFor, xpForLevel: xpForLevel, streak: streak, bestStreak: bestStreak,
    title: function (l) { return titles[Math.min(l - 1, titles.length - 1)]; },
    level: function () { return levelFor(st().xp); },
    addXP: addXP,
    check: checkAchievements,
    activity: function () { markDay(); KM.store.touch(); checkAchievements(); },
    completeLesson: function (lesson) {
      var s = st(), rec = s.lessons[lesson.id] || (s.lessons[lesson.id] = { steps: {} });
      if (rec.done) return false;
      rec.done = Date.now();
      addXP(lesson.xp || (40 + 10 * (lesson.level || 1)), 'Урок пройден: ' + lesson.title);
      return true;
    },
    quizResult: function (lesson, correct, total) {
      var s = st(), q = s.quizzes[lesson.id] || (s.quizzes[lesson.id] = { best: 0, attempts: 0 });
      var first = q.attempts === 0;
      q.attempts++; q.last = correct;
      var gain = 0;
      if (correct > q.best) { gain = (correct - q.best) * 10; q.best = correct; }
      if (correct === total && !q.perfect) { q.perfect = first ? 'first' : true; gain += first ? 40 : 25; }
      if (gain) addXP(gain, 'Тест: ' + lesson.title + ' (' + correct + '/' + total + ')');
      else { markDay(); KM.store.touch(); checkAchievements(); }
    },
    projectResult: function (project, score) {
      var s = st(), p = s.projects[project.id] || (s.projects[project.id] = { attempts: 0, score: 0 });
      p.attempts++;
      if (score > p.score) {
        var prev = p.score; p.score = score;
        if (score === 100) {
          p.checked = Date.now();
          p.medal = p.attempts === 1 ? 'gold' : p.attempts <= 3 ? 'silver' : 'bronze';
          addXP(project.xp || 150, 'Проект собран: ' + project.title);
        } else addXP(Math.round((score - prev) / 2), 'Прогресс проекта: ' + project.title);
      } else { markDay(); KM.store.touch(); checkAchievements(); }
    },
    isUnlocked: function (lesson) { return !lesson.unlockLevel || levelFor(st().xp) >= lesson.unlockLevel; }
  };
  return api;
})();

/* ---------- маршрутизатор ---------- */
KM.router = (function () {
  var routes = [];
  function add(pattern, view) {
    var keys = [];
    var re = new RegExp('^' + pattern.replace(/:(\w+)/g, function (_, k) { keys.push(k); return '([^/]+)'; }) + '/?$');
    routes.push({ re: re, keys: keys, view: view, pattern: pattern });
  }
  function current() { return (location.hash || '#/').slice(1).split('?')[0] || '/'; }
  function query() {
    var q = (location.hash.split('?')[1] || ''), o = {};
    q.split('&').forEach(function (p) { if (p) { var kv = p.split('='); o[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || ''); } });
    return o;
  }
  function resolve() {
    var path = current();
    for (var i = 0; i < routes.length; i++) {
      var m = path.match(routes[i].re);
      if (m) {
        var params = {};
        routes[i].keys.forEach(function (k, j) { params[k] = decodeURIComponent(m[j + 1]); });
        return { view: routes[i].view, params: params, query: query(), path: path, pattern: routes[i].pattern };
      }
    }
    return null;
  }
  return { add: add, resolve: resolve, current: current, query: query, go: function (p) { location.hash = '#' + p; } };
})();

/* ---------- i18n интерфейса ---------- */
KM.t = function (key, fallback) {
  var lang = KM.store.state.settings.lang || 'ru';
  var dict = (KM.data.i18n || {})[lang] || {};
  if (key in dict) return dict[key];
  var ru = (KM.data.i18n || {}).ru || {};
  return key in ru ? ru[key] : (fallback || key);
};
