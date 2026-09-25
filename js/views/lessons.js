/* Уроки: список, продвинутые темы, страница урока */
(function () {
  var LV = ['', 'Начальный', 'Средний', 'Продвинутый'];
  function isDone(l) { var r = KM.store.state.lessons[l.id]; return !!(r && r.done); }
  function item(l) {
    var locked = !KM.game.isUnlocked(l), q = KM.store.state.quizzes[l.id];
    return '<a class="lesson-item' + (isDone(l) ? ' done' : '') + (locked ? ' locked' : '') + '" href="#/lesson/' + l.id + '">' +
      '<span class="num">' + (locked ? '🔒' : isDone(l) ? '✓' : l.n) + '</span>' +
      '<div><h3>' + KM.esc(l.title) + '</h3><div class="meta"><span>⏱️ ' + l.time + ' мин</span><span>' + '●'.repeat(l.level) + '○'.repeat(3 - l.level) + ' ' + LV[l.level] + '</span>' +
      (q ? '<span>📝 тест ' + q.best + '/' + (l.quiz || []).length + (q.perfect ? ' 🏅' : '') + '</span>' : '') +
      (locked ? '<span>откроется на уровне ' + l.unlockLevel + '</span>' : '') + '</div></div>' +
      '<span class="tag' + (isDone(l) ? ' ok' : '') + '">' + (isDone(l) ? 'пройден' : locked ? 'бонус' : 'урок ' + l.n) + '</span></a>';
  }
  function trackBlock(t) {
    var ls = KM.data.lessons.filter(function (l) { return l.track === t.id; });
    var d = ls.filter(isDone).length;
    return '<section id="track-' + t.id + '"><div class="track-head"><span style="font-size:1.6rem">' + t.ico + '</span><div style="flex:1"><h2>' + KM.esc(t.title) + '</h2><div class="small muted">' + KM.esc(t.desc) + '</div></div>' +
      '<span class="tag accent">' + d + '/' + ls.length + '</span></div><div class="progress" style="margin-bottom:12px"><span style="width:' + (d / ls.length * 100) + '%"></span></div>' +
      '<div class="lesson-list">' + ls.map(item).join('') + '</div></section>';
  }

  KM.views.lessons = {
    render: function () {
      var L = KM.data.lessons, d = L.filter(isDone).length, mins = L.reduce(function (s, l) { return s + l.time; }, 0);
      return '<div class="page narrow"><div class="page-head"><div class="eyebrow">Раздел 1</div><h1>Интерактивные уроки</h1>' +
        '<p>' + L.length + ' уроков, около ' + Math.round(mins / 60) + ' часов. Каждый — с пошаговыми иллюстрациями, советами, разбором ошибок и тестом. Пройдено: ' + d + '.</p>' +
        '<div class="row"><a class="btn sm" href="#/print">🖨️ Все уроки в PDF</a>' + KM.data.tracks.map(function (t) { return '<a class="btn sm ghost" href="#/lessons" data-jump="' + t.id + '">' + t.ico + ' ' + KM.esc(t.title) + '</a>'; }).join('') + '</div></div>' +
        KM.data.tracks.filter(function (t) { return t.id !== 'advanced'; }).map(trackBlock).join('') +
        '<p class="mt"><a class="btn" href="#/advanced">⚡ Продвинутые темы →</a></p></div>';
    },
    mount: function (root) {
      KM.$$('[data-jump]', root).forEach(function (a) {
        a.onclick = function (e) {
          e.preventDefault();
          if (a.dataset.jump === 'advanced') { location.hash = '#/advanced'; return; }
          var el = KM.$('#track-' + a.dataset.jump); if (el) el.scrollIntoView({ behavior: 'smooth' });
        };
      });
    }
  };

  KM.views.advanced = {
    render: function () {
      var t = KM.data.tracks.find(function (x) { return x.id === 'advanced'; });
      return '<div class="page narrow"><div class="page-head"><div class="eyebrow">Раздел 11</div><h1>Продвинутые темы</h1>' +
        '<p>Для тех, кто освоил основы: высокочастотные схемы, электромагнитная совместимость, проектирование для производства, автоматизация на Python, платы для Arduino, Raspberry Pi и IoT-модулей.</p></div>' +
        trackBlock(t) + '</div>';
    }
  };

  KM.views.lesson = {
    render: function (p) {
      var L = KM.data.lessons, i = L.findIndex(function (l) { return l.id === p.id; }), l = L[i];
      if (!l) return '<div class="page narrow empty"><div class="big">📘</div><h1>Урок не найден</h1><a href="#/lessons">К списку уроков</a></div>';
      var track = KM.data.tracks.find(function (t) { return t.id === l.track; });
      if (!KM.game.isUnlocked(l)) {
        return '<div class="page narrow empty"><div class="big">🔒</div><h1>' + KM.esc(l.title) + '</h1><p>Бонусный урок откроется на уровне ' + l.unlockLevel + '. Сейчас у вас уровень ' + KM.game.level() + '.</p>' +
          '<p class="muted">Проходите уроки, тесты и практические проекты, чтобы набрать опыт.</p><a class="btn primary" href="#/lessons">К урокам</a></div>';
      }
      var rec = KM.store.state.lessons[l.id] || { steps: {} };
      var prev = L[i - 1], next = L[i + 1];
      var route = '/lesson/' + l.id;
      var stepsHtml = l.steps.map(function (s, k) {
        return '<section class="step" id="step-' + (k + 1) + '"><span class="step-n">' + (k + 1) + '</span><h3>' + KM.esc(s.title) + '</h3>' + KM.md(s.text) +
          (s.fig ? KM.ui.figure(Object.assign({ id: l.id + '-s' + (k + 1) }, s.fig)) : '') +
          '<label class="step-check no-print"><input type="checkbox" data-step="' + k + '"' + (rec.steps && rec.steps[k] ? ' checked' : '') + '> Сделал(а) этот шаг в KiCad</label></section>';
      }).join('');
      return '<div class="page"><div class="crumbs"><a href="#/lessons">Уроки</a> › ' + track.ico + ' ' + KM.esc(track.title) + ' › урок ' + l.n + '</div>' +
        '<div class="lesson-layout"><article>' +
        '<h1>' + KM.esc(l.title) + '</h1>' +
        '<div class="lesson-meta"><span class="tag">⏱️ ~' + l.time + ' мин</span><span class="tag">' + '●'.repeat(l.level) + '○'.repeat(3 - l.level) + ' ' + LV[l.level] + '</span>' +
        (isDone(l) ? '<span class="tag ok">✓ пройден</span>' : '') + (l.tags || []).slice(0, 3).map(function (t) { return '<span class="tag">#' + KM.esc(t) + '</span>'; }).join('') +
        '<span style="flex:1"></span>' + KM.ui.bookmarkBtn(route, 'Урок ' + l.n + '. ' + l.title) + ' <button class="btn sm no-print" onclick="window.print()">🖨️ PDF</button></div>' +
        '<p style="font-size:1.08rem">' + KM.esc(l.intro) + '</p>' +
        '<div class="progress no-print" style="margin:16px 0" title="Отмеченные шаги"><span id="stepProg" style="width:0"></span></div>' +
        stepsHtml +
        (l.tips && l.tips.length ? '<h2 id="tips">🔔 Важные советы</h2>' + l.tips.map(function (t) { return '<div class="callout tip"><span class="ico">💡</span><div>' + KM.md(t) + '</div></div>'; }).join('') : '') +
        (l.mistakes && l.mistakes.length ? '<h2 id="mistakes">⚠️ Типичные ошибки</h2>' + l.mistakes.map(function (m) {
          return '<div class="callout warn"><span class="ico">⚠️</span><div><strong>' + KM.md(m.m).replace(/^<p>|<\/p>$/g, '') + '</strong><div class="small">✅ Как избежать: ' + KM.md(m.fix).replace(/^<p>|<\/p>$/g, '') + '</div></div></div>';
        }).join('') : '') +
        '<div class="card no-print" style="margin-top:24px;text-align:center" id="completeBox">' +
          (isDone(l) ? '<p class="mb0">✅ Урок пройден ' + new Date(rec.done).toLocaleDateString() + '. Закрепите знания тестом ниже.</p>' :
          '<p>Прочитали урок и повторили шаги в KiCad?</p><button class="btn primary" id="completeBtn">✅ Отметить урок пройденным (+' + (l.xp || 40 + 10 * (l.level || 1)) + ' XP)</button>') +
        '</div>' +
        (l.quiz && l.quiz.length ? '<h2 id="quiz" class="mt">📝 Проверьте себя</h2><div class="quiz" id="quizBox"><p>' + l.quiz.length + ' вопросов. За каждый верный ответ — 10 XP, за тест без ошибок — медаль.</p><button class="btn primary" id="quizStart">Начать тест</button></div>' : '') +
        KM.ui.notesBox(route) +
        '<nav class="row between mt no-print">' +
          (prev ? '<a class="btn" href="#/lesson/' + prev.id + '">← ' + prev.n + '. ' + KM.esc(prev.title) + '</a>' : '<span></span>') +
          (next ? '<a class="btn" href="#/lesson/' + next.id + '">' + next.n + '. ' + KM.esc(next.title) + ' →</a>' : '<a class="btn primary" href="#/projects">К практике →</a>') +
        '</nav></article>' +
        '<aside class="lesson-aside no-print"><div class="card flat"><div class="small muted" style="font-weight:700;margin-bottom:6px">Содержание</div><ol>' +
          l.steps.map(function (s, k) { return '<li><a href="#/lesson/' + l.id + '" data-scroll="step-' + (k + 1) + '">' + KM.esc(s.title) + '</a></li>'; }).join('') +
          '</ol><div style="margin-top:8px"><a href="#/lesson/' + l.id + '" data-scroll="tips" class="small">Советы</a> · <a href="#/lesson/' + l.id + '" data-scroll="mistakes" class="small">Ошибки</a> · <a href="#/lesson/' + l.id + '" data-scroll="quiz" class="small">Тест</a></div></div>' +
          (KM.api.aiAvailable() ? '<a class="btn sm" style="margin-top:12px;width:100%" href="#/community?tab=ai&ctx=' + encodeURIComponent('урок «' + l.title + '»') + '">🤖 Спросить AI по уроку</a>' : '') +
        '</aside></div></div>';
    },
    mount: function (root, p) {
      var l = KM.data.lessons.find(function (x) { return x.id === p.id; });
      if (!l || !KM.game.isUnlocked(l)) return;
      var s = KM.store.state;
      function updProg() {
        var rec = s.lessons[l.id] || { steps: {} };
        var n = Object.keys(rec.steps || {}).filter(function (k) { return rec.steps[k]; }).length;
        var bar = KM.$('#stepProg', root); if (bar) bar.style.width = (n / l.steps.length * 100) + '%';
      }
      updProg();
      KM.$$('[data-step]', root).forEach(function (c) {
        c.onchange = function () {
          var rec = s.lessons[l.id] || (s.lessons[l.id] = { steps: {} });
          rec.steps = rec.steps || {};
          rec.steps[c.dataset.step] = c.checked;
          KM.game.activity(); updProg();
        };
      });
      var cb = KM.$('#completeBtn', root);
      if (cb) cb.onclick = function () {
        KM.game.completeLesson(l);
        KM.$('#completeBox', root).innerHTML = '<p class="mb0">🎉 Урок пройден! Теперь — тест.</p>';
        var q = KM.$('#quiz', root); if (q) q.scrollIntoView({ behavior: 'smooth' });
      };
      var qs = KM.$('#quizStart', root);
      if (qs) qs.onclick = function () {
        var box = KM.$('#quizBox', root);
        var i = KM.data.lessons.indexOf(l), next = KM.data.lessons[i + 1];
        KM.ui.quiz(box, l, next ? function () { location.hash = '#/lesson/' + next.id; } : null);
        // тест тоже считается прохождением урока
        if (!isDone(l)) { KM.game.completeLesson(l); var c = KM.$('#completeBox', root); if (c) c.innerHTML = '<p class="mb0">✅ Урок отмечен пройденным.</p>'; }
      };
      KM.$$('[data-scroll]', root).forEach(function (a) {
        a.onclick = function (e) { e.preventDefault(); var el = KM.$('#' + a.dataset.scroll, root); if (el) el.scrollIntoView({ behavior: 'smooth' }); };
      });
    }
  };
})();
