/* =========================================================
   Общие элементы интерфейса: навигация, тосты, модальные окна,
   поиск, иллюстрации с аннотациями, квиз, заметки, закладки.
   ========================================================= */
KM.ui = {};

KM.ui.nav = [
  { group: 'nav.learn' },
  { href: '/', ico: '🏠', key: 'nav.home' },
  { href: '/lessons', ico: '📘', key: 'nav.lessons', badge: function () { var d = KM.data.lessons.filter(function (l) { return KM.store.state.lessons[l.id] && KM.store.state.lessons[l.id].done; }).length; return d + '/' + KM.data.lessons.length; } },
  { href: '/demos', ico: '🎬', key: 'nav.demos' },
  { href: '/projects', ico: '🛠️', key: 'nav.projects' },
  { href: '/advanced', ico: '⚡', key: 'nav.advanced' },
  { group: 'nav.tools' },
  { href: '/gerber', ico: '👁️', key: 'nav.gerber' },
  { href: '/routing', ico: '🕹️', key: 'nav.routing' },
  { href: '/sim', ico: '🔬', key: 'nav.sim' },
  { href: '/components', ico: '🧩', key: 'nav.components' },
  { href: '/templates', ico: '📐', key: 'nav.templates' },
  { href: '/reference', ico: '📚', key: 'nav.reference' },
  { href: '/history', ico: '🏛️', key: 'nav.history' },
  { href: '/models', ico: '🧠', key: 'nav.models' },
  { group: 'nav.me' },
  { href: '/community', ico: '💬', key: 'nav.community' },
  { href: '/profile', ico: '🏆', key: 'nav.profile' },
  { href: '/settings', ico: '⚙️', key: 'nav.settings' }
];

KM.ui.renderNav = function () {
  var path = KM.router.current();
  var html = KM.ui.nav.map(function (n) {
    if (n.group) return '<li class="nav-group">' + KM.esc(KM.t(n.group)) + '</li>';
    var active = n.href === '/' ? path === '/' : (path === n.href || path.indexOf(n.href + '/') === 0 ||
      (n.href === '/lessons' && path.indexOf('/lesson/') === 0) ||
      (n.href === '/demos' && path.indexOf('/demo/') === 0) ||
      (n.href === '/projects' && path.indexOf('/project/') === 0) ||
      (n.href === '/components' && path.indexOf('/component/') === 0) ||
      (n.href === '/templates' && path.indexOf('/template/') === 0));
    return '<li><a href="#' + n.href + '"' + (active ? ' aria-current="page"' : '') + '><span class="nav-ico" aria-hidden="true">' + n.ico + '</span>' +
      KM.esc(KM.t(n.key)) + (n.badge ? '<span class="nav-badge">' + n.badge() + '</span>' : '') + '</a></li>';
  }).join('');
  KM.$('#navList').innerHTML = html;
  var online = KM.api && KM.api.online;
  KM.$('#sidebarFoot').innerHTML = '<div>' + (online ? '🟢 ' + KM.esc(KM.t('status.online')) : '⚪ ' + KM.esc(KM.t('status.offline'))) + '</div>' +
    '<div>KiCad Мастер Pro · v1.0</div>';
};

KM.ui.renderStats = function () {
  var s = KM.store.state, lv = KM.game.level(), st = KM.game.streak();
  KM.$('#topStats').innerHTML =
    '<a class="stat-pill fire" href="#/profile" title="Дней подряд">🔥 ' + st + '</a>' +
    '<a class="stat-pill xp" href="#/profile" title="Опыт">⚡ ' + s.xp + ' XP</a>' +
    '<a class="stat-pill" href="#/profile" title="Уровень">🎖️ ' + lv + '</a>';
};

/* ---------- тосты ---------- */
KM.ui.toast = function (title, text, icon, kind) {
  var box = KM.$('#toasts');
  if (!box) return;
  var el = document.createElement('div');
  el.className = 'toast ' + (kind || '');
  el.innerHTML = '<span class="ico" aria-hidden="true">' + (icon || 'ℹ️') + '</span><div><b>' + KM.esc(title) + '</b>' + (text ? '<span class="small muted">' + KM.esc(text) + '</span>' : '') + '</div>';
  box.appendChild(el);
  while (box.children.length > 4) box.firstChild.remove();
  setTimeout(function () { el.style.opacity = '0'; el.style.transition = 'opacity .4s'; }, kind === 'achievement' ? 5200 : 3000);
  setTimeout(function () { el.remove(); }, kind === 'achievement' ? 5700 : 3500);
};

/* ---------- модальное окно ---------- */
KM.ui.modal = function (title, bodyHtml, onMount) {
  var d = KM.$('#modal');
  d.innerHTML = '<div class="modal-head"><h2>' + KM.esc(title) + '</h2><button class="icon-btn" data-close aria-label="Закрыть"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="modal-body">' + bodyHtml + '</div>';
  d.querySelector('[data-close]').onclick = function () { d.close(); };
  d.onclick = function (e) { if (e.target === d) d.close(); };
  if (!d.open) d.showModal();
  if (onMount) onMount(d.querySelector('.modal-body'), d);
  return d;
};

/* ---------- иллюстрации KiCad с аннотациями ---------- */
// fig: {scene, opts, annot:[{x,y,n,label,to:[x,y],box:[x,y,w,h]}], caption, img}
KM.ui.annotSvg = function (annot) {
  if (!annot || !annot.length) return '';
  var s = '<defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#ff3b30"/></marker></defs>';
  annot.forEach(function (a, i) {
    var n = a.n || i + 1;
    if (a.box) s += '<rect x="' + a.box[0] + '" y="' + a.box[1] + '" width="' + a.box[2] + '" height="' + a.box[3] + '" rx="6" fill="rgba(255,59,48,.08)" stroke="#ff3b30" stroke-width="3" stroke-dasharray="8 5"/>';
    if (a.to) s += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + a.to[0] + '" y2="' + a.to[1] + '" stroke="#ff3b30" stroke-width="3.5" marker-end="url(#arr)"/>';
    s += '<g class="annot-marker"><circle cx="' + a.x + '" cy="' + a.y + '" r="15" fill="#ff3b30" stroke="#fff" stroke-width="3"/><text x="' + a.x + '" y="' + (a.y + 5) + '" text-anchor="middle" fill="#fff" font-size="15" font-weight="800">' + n + '</text></g>';
    if (a.label) {
      var w = Math.min(340, 14 + a.label.length * 8.1), lx = a.x + (a.lx || 22), ly = a.y + (a.ly || -14);
      if (lx + w > 955) lx = a.x - 22 - w;
      s += '<g><rect x="' + lx + '" y="' + ly + '" width="' + w + '" height="28" rx="6" fill="#1d1d1f" opacity=".9"/><text x="' + (lx + 8) + '" y="' + (ly + 19) + '" fill="#fff" font-size="14" font-family="system-ui,sans-serif" font-weight="600">' + KM.esc(a.label) + '</text></g>';
    }
  });
  return s;
};
KM.ui.figure = function (fig) {
  if (!fig) return '';
  var scene = KM.data.scenes && KM.data.scenes[fig.scene];
  var screen = KM.data.screens && KM.data.screens[fig.id || ''];
  var inner;
  if (fig.img || screen) {
    inner = '<img src="' + KM.esc(fig.img || screen) + '" alt="' + KM.esc(fig.caption || '') + '" loading="lazy">' +
      '<svg class="annot-layer" viewBox="0 0 960 600" preserveAspectRatio="none">' + KM.ui.annotSvg(fig.annot) + '</svg>';
  } else if (scene) {
    inner = '<svg viewBox="0 0 960 600" role="img" aria-label="' + KM.esc(fig.caption || fig.scene) + '" font-family="system-ui,sans-serif">' + scene(fig.opts || {}) + KM.ui.annotSvg(fig.annot) + '</svg>';
  } else return '';
  var legend = (fig.annot || []).filter(function (a) { return a.note; }).map(function (a, i) {
    return '<li><b>' + (a.n || i + 1) + '.</b> ' + KM.md(a.note).replace(/^<p>|<\/p>$/g, '') + '</li>';
  }).join('');
  return '<figure class="kfig"><div class="frame"><button class="zoom-btn no-print" data-zoom aria-label="Увеличить иллюстрацию">⤢ Увеличить</button>' + inner + '</div>' +
    (fig.caption ? '<figcaption>' + (fig.img || screen ? '📸 ' : '🖼️ Схематичная иллюстрация интерфейса KiCad · ') + KM.esc(fig.caption) + '</figcaption>' : '') +
    (legend ? '<ol class="small" style="list-style:none;padding:0;margin:8px 0 0">' + legend + '</ol>' : '') + '</figure>';
};
KM.ui.bindZoom = function (root) {
  KM.$$('[data-zoom]', root).forEach(function (b) {
    b.onclick = function () {
      var frame = b.parentNode.cloneNode(true);
      frame.querySelector('[data-zoom]').remove();
      var d = KM.ui.modal('Иллюстрация', '');
      d.style.width = 'min(1400px, calc(100vw - 24px))';
      d.querySelector('.modal-body').appendChild(frame);
      d.addEventListener('close', function r() { d.style.width = ''; d.removeEventListener('close', r); });
    };
  });
};

/* ---------- квиз ---------- */
KM.ui.quiz = function (root, lesson, onDone) {
  var qs = lesson.quiz || [];
  var i = 0, correct = 0, answered = false;
  // перемешиваем варианты, запоминая правильный
  var shuffled = qs.map(function (q) {
    var opts = q.a.map(function (t, k) { return { t: t, ok: k === q.c }; });
    for (var k = opts.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var tmp = opts[k]; opts[k] = opts[j]; opts[j] = tmp; }
    return { q: q.q, opts: opts, e: q.e };
  });
  function render() {
    if (i >= shuffled.length) {
      var pct = Math.round(correct / shuffled.length * 100);
      var best = (KM.store.state.quizzes[lesson.id] || {}).best || 0;
      KM.game.quizResult(lesson, correct, shuffled.length);
      root.innerHTML = '<div class="quiz-score"><div class="big">' + correct + ' / ' + shuffled.length + '</div>' +
        '<p class="muted">' + (pct === 100 ? '🏅 Идеально! Все ответы верные.' : pct >= 70 ? '👍 Хороший результат.' : '📖 Стоит перечитать урок и попробовать ещё раз.') +
        (best ? ' Лучший результат ранее: ' + best + '.' : '') + '</p>' +
        '<div class="row" style="justify-content:center"><button class="btn" data-retry>Пройти ещё раз</button>' + (onDone ? '<button class="btn primary" data-next>Дальше →</button>' : '') + '</div></div>';
      root.querySelector('[data-retry]').onclick = function () { KM.ui.quiz(root, lesson, onDone); };
      var nx = root.querySelector('[data-next]'); if (nx) nx.onclick = onDone;
      return;
    }
    var q = shuffled[i]; answered = false;
    root.innerHTML = '<div class="row between small muted" style="margin-bottom:10px"><span>Вопрос ' + (i + 1) + ' из ' + shuffled.length + '</span><span>Верно: ' + correct + '</span></div>' +
      '<div class="progress" style="margin-bottom:18px"><span style="width:' + (i / shuffled.length * 100) + '%"></span></div>' +
      '<div class="quiz-q" id="qq">' + KM.md(q.q).replace(/^<p>|<\/p>$/g, '') + '</div>' +
      '<div class="quiz-opts" role="group" aria-labelledby="qq">' + q.opts.map(function (o, k) {
        return '<button class="quiz-opt" data-k="' + k + '"><span class="letter">' + 'АБВГДЕ'[k] + '</span><span>' + KM.md(o.t).replace(/^<p>|<\/p>$/g, '') + '</span></button>';
      }).join('') + '</div><div class="quiz-expl" aria-live="polite"></div>' +
      '<div class="quiz-foot"><span class="tiny">Клавиши 1–' + q.opts.length + ' — выбор ответа, Enter — дальше</span><button class="btn primary" data-go disabled>Далее</button></div>';
    KM.$$('.quiz-opt', root).forEach(function (b) { b.onclick = function () { pick(+b.dataset.k); }; });
    root.querySelector('[data-go]').onclick = function () { i++; render(); };
  }
  function pick(k) {
    if (answered) return;
    answered = true;
    var q = shuffled[i];
    var ok = q.opts[k].ok;
    if (ok) correct++;
    KM.$$('.quiz-opt', root).forEach(function (b, j) {
      b.disabled = true;
      if (q.opts[j].ok) b.classList.add('correct');
      else if (j === k) b.classList.add('wrong');
    });
    root.querySelector('.quiz-expl').innerHTML = '<div class="callout ' + (ok ? 'ok' : 'danger') + '"><span class="ico">' + (ok ? '✅' : '❌') + '</span><div><strong>' + (ok ? 'Верно!' : 'Неверно') + '</strong>' + (q.e ? KM.md(q.e) : '') + '</div></div>';
    var go = root.querySelector('[data-go]'); go.disabled = false; go.focus();
  }
  root.onkeydown = function (e) {
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= 6) { var b = KM.$$('.quiz-opt', root)[n - 1]; if (b) b.click(); }
  };
  render();
};

/* ---------- закладки и заметки ---------- */
KM.ui.bookmarkBtn = function (route, title) {
  var on = KM.store.state.bookmarks.some(function (b) { return b.route === route; });
  return '<button class="btn sm' + (on ? ' active' : '') + '" data-bookmark="' + KM.esc(route) + '" data-title="' + KM.esc(title) + '" aria-pressed="' + on + '">🔖 ' + (on ? 'В закладках' : 'В закладки') + '</button>';
};
KM.ui.notesBox = function (route) {
  var t = KM.store.state.notes[route] || '';
  return '<details class="card flat no-print" style="margin-top:24px"' + (t ? ' open' : '') + '><summary style="cursor:pointer;font-weight:650">📝 Мои заметки</summary>' +
    '<textarea data-note="' + KM.esc(route) + '" placeholder="Заметки сохраняются автоматически…" style="margin-top:10px" aria-label="Заметки">' + KM.esc(t) + '</textarea><div class="tiny" data-note-status></div></details>';
};
KM.ui.bindCommon = function (root) {
  KM.$$('[data-bookmark]', root).forEach(function (b) {
    b.onclick = function () {
      var s = KM.store.state, r = b.dataset.bookmark;
      var i = s.bookmarks.findIndex(function (x) { return x.route === r; });
      if (i >= 0) s.bookmarks.splice(i, 1); else s.bookmarks.push({ route: r, title: b.dataset.title, t: Date.now() });
      KM.store.touch();
      var on = i < 0;
      b.classList.toggle('active', on); b.setAttribute('aria-pressed', on);
      b.textContent = '🔖 ' + (on ? 'В закладках' : 'В закладки');
      if (on) KM.game.check();
    };
  });
  KM.$$('[data-note]', root).forEach(function (ta) {
    var status = ta.parentNode.querySelector('[data-note-status]');
    ta.oninput = KM.debounce(function () {
      var s = KM.store.state;
      if (ta.value.trim()) s.notes[ta.dataset.note] = ta.value; else delete s.notes[ta.dataset.note];
      KM.store.touch(); KM.game.check();
      if (status) status.textContent = 'Сохранено ' + new Date().toLocaleTimeString();
    }, 400);
  });
  KM.ui.bindZoom(root);
};

/* ---------- поиск по сайту ---------- */
KM.ui.searchIndex = null;
KM.ui.buildIndex = function () {
  var idx = [];
  KM.data.lessons.forEach(function (l) { idx.push({ t: l.title, s: (l.intro || '') + ' ' + (l.tags || []).join(' '), r: '/lesson/' + l.id, k: l.track === 'advanced' ? 'Продвинутое' : 'Урок' }); });
  idx.push({ t: 'Gerber & 3D Просмотрщик', s: 'Просмотр слоёв плат Gerber RS-274X, сверловка Excellon, 3D модель', r: '/gerber', k: 'Инструмент' });
  idx.push({ t: 'Тренажёр трассировки плат (Routing Game)', s: 'Разводка печатных плат, углы 45 градусов, слои F.Cu B.Cu, проверка правил DRC', r: '/routing', k: 'Тренажёр' });
  (KM.data.projects || []).forEach(function (p) { idx.push({ t: p.title, s: p.desc, r: '/project/' + p.id, k: 'Проект' }); });
  (KM.data.templates || []).forEach(function (p) { idx.push({ t: p.title, s: p.desc, r: '/template/' + p.id, k: 'Шаблон' }); });
  (KM.data.demos || []).forEach(function (d) { idx.push({ t: d.title, s: d.desc, r: '/demo/' + d.id, k: 'Видео' }); });
  (KM.data.history || []).forEach(function (a) { idx.push({ t: a.title, s: a.lead, r: '/history/' + a.id, k: 'История' }); });
  (KM.data.glossary || []).forEach(function (g) { idx.push({ t: g.t, s: g.d, r: '/reference?tab=glossary&q=' + encodeURIComponent(g.t), k: 'Глоссарий' }); });
  KM.ui.searchIndex = idx;
};
KM.ui.search = function (q) {
  q = q.trim().toLowerCase();
  if (q.length < 2) return [];
  if (!KM.ui.searchIndex) KM.ui.buildIndex();
  var words = q.split(/\s+/);
  var res = [];
  KM.ui.searchIndex.forEach(function (it) {
    var t = it.t.toLowerCase(), s = (it.s || '').toLowerCase(), score = 0;
    words.forEach(function (w) { if (t.indexOf(w) >= 0) score += t.indexOf(w) === 0 ? 6 : 4; else if (s.indexOf(w) >= 0) score += 1; else score -= 10; });
    if (score > 0) res.push({ it: it, score: score });
  });
  // компоненты ищем отдельно — их много
  if (KM.data.components) {
    var n = 0;
    KM.data.components.list().some(function (c) {
      var t = (c.name + ' ' + c.short).toLowerCase();
      if (words.every(function (w) { return t.indexOf(w) >= 0; })) { res.push({ it: { t: c.name, s: c.short, r: '/component/' + c.id, k: 'Компонент' }, score: 3 }); n++; }
      return n >= 8;
    });
  }
  return res.sort(function (a, b) { return b.score - a.score; }).slice(0, 14).map(function (x) { return x.it; });
};
KM.ui.initSearch = function () {
  var inp = KM.$('#searchInput'), box = KM.$('#searchResults'), sel = -1;
  function show() {
    var r = KM.ui.search(inp.value);
    sel = -1;
    if (!inp.value.trim()) { box.hidden = true; return; }
    box.innerHTML = r.length ? r.map(function (x) { return '<a href="#' + x.r + '" role="option">' + KM.esc(x.t) + '<small>' + KM.esc(x.k) + '</small></a>'; }).join('') : '<div class="tiny" style="padding:10px">Ничего не найдено</div>';
    box.hidden = false;
  }
  inp.addEventListener('input', KM.debounce(show, 120));
  inp.addEventListener('focus', show);
  inp.addEventListener('keydown', function (e) {
    var items = KM.$$('a', box);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach(function (a, i) { a.setAttribute('aria-selected', i === sel); });
    } else if (e.key === 'Enter') {
      e.preventDefault(); var a = items[Math.max(sel, 0)]; if (a) { location.hash = a.getAttribute('href'); box.hidden = true; inp.blur(); }
    } else if (e.key === 'Escape') { box.hidden = true; inp.blur(); }
  });
  document.addEventListener('click', function (e) { if (!KM.$('#globalSearch').contains(e.target)) box.hidden = true; });
  box.addEventListener('click', function () { box.hidden = true; inp.value = ''; });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); inp.focus(); }
  });
};

/* ---------- табы ---------- */
KM.ui.tabs = function (root, onChange) {
  var btns = KM.$$('.tabs [role="tab"]', root);
  btns.forEach(function (b) {
    b.onclick = function () {
      btns.forEach(function (x) { x.setAttribute('aria-selected', x === b); });
      onChange(b.dataset.tab);
    };
    b.onkeydown = function (e) {
      var i = btns.indexOf(b);
      if (e.key === 'ArrowRight') { btns[(i + 1) % btns.length].focus(); btns[(i + 1) % btns.length].click(); }
      if (e.key === 'ArrowLeft') { btns[(i - 1 + btns.length) % btns.length].focus(); btns[(i - 1 + btns.length) % btns.length].click(); }
    };
  });
};
