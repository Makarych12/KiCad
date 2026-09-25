/* Практические проекты и проверка netlist */
(function () {
  var MEDAL = { gold: '🥇', silver: '🥈', bronze: '🥉' };

  /* ---------- разбор netlist KiCad (S-выражения или XML) ---------- */
  function parseSexpr(txt) {
    var i = 0, n = txt.length;
    function ws() { while (i < n && /\s/.test(txt[i])) i++; }
    function atom() {
      ws();
      if (txt[i] === '"') {
        var s = ''; i++;
        while (i < n && txt[i] !== '"') { if (txt[i] === '\\') { i++; } s += txt[i++]; }
        i++; return s;
      }
      var st = i; while (i < n && !/[\s()]/.test(txt[i])) i++;
      return txt.slice(st, i);
    }
    function list() {
      ws();
      if (txt[i] !== '(') return atom();
      i++; var out = [];
      for (;;) { ws(); if (i >= n) break; if (txt[i] === ')') { i++; break; } out.push(txt[i] === '(' ? list() : atom()); }
      return out;
    }
    return list();
  }
  function findAll(node, name, out) {
    out = out || [];
    if (Array.isArray(node)) { if (node[0] === name) out.push(node); node.forEach(function (c) { findAll(c, name, out); }); }
    return out;
  }
  function field(node, name) { var f = Array.isArray(node) && node.find(function (c) { return Array.isArray(c) && c[0] === name; }); return f ? f[1] : undefined; }

  function parseNetlist(txt) {
    txt = txt.trim();
    var comps = {}, nets = [];
    if (txt[0] === '<') {
      var doc = new DOMParser().parseFromString(txt, 'application/xml');
      if (doc.querySelector('parsererror')) throw new Error('Не удалось прочитать XML');
      KM.$$('comp', doc).forEach(function (c) { comps[c.getAttribute('ref')] = { value: (c.querySelector('value') || {}).textContent || '', fp: (c.querySelector('footprint') || {}).textContent || '' }; });
      KM.$$('net', doc).forEach(function (nt) { nets.push({ name: nt.getAttribute('name'), nodes: KM.$$('node', nt).map(function (x) { return x.getAttribute('ref') + '.' + x.getAttribute('pin'); }) }); });
    } else if (txt[0] === '(') {
      var tree = parseSexpr(txt);
      if (tree[0] !== 'export') throw new Error('Это не netlist KiCad: ожидается (export …). Экспортируйте через Файл → Экспорт → Список цепей.');
      findAll(tree, 'comp').forEach(function (c) { comps[field(c, 'ref')] = { value: field(c, 'value') || '', fp: field(c, 'footprint') || '' }; });
      findAll(tree, 'net').forEach(function (nt) {
        nets.push({ name: field(nt, 'name'), nodes: findAll(nt, 'node').map(function (x) { return field(x, 'ref') + '.' + field(x, 'pin'); }) });
      });
    } else throw new Error('Неизвестный формат. Нужен файл .net (KiCad) или .xml.');
    if (!Object.keys(comps).length) throw new Error('В файле нет компонентов.');
    return { comps: comps, nets: nets };
  }

  function normVal(v) {
    var orig = String(v || '').replace(/\s+/g, '').replace(/(Ом|ом|ohm|Ohm|Ω)$/, '');
    var n = KM.parseSI(orig);
    return { raw: orig.toLowerCase(), num: isFinite(n) ? n : null };
  }
  function sameValue(a, b) {
    var x = normVal(a), y = normVal(b);
    if (x.raw === y.raw) return true;
    if (x.num !== null && y.num !== null && x.num > 0) return Math.abs(x.num - y.num) / y.num < 0.011;
    return x.raw.indexOf(y.raw) >= 0 || y.raw.indexOf(x.raw) >= 0;
  }

  /* ---------- сравнение с эталоном ---------- */
  function check(project, user) {
    var res = { parts: [], nets: [], extra: [], score: 0 };
    var refParts = project.parts;
    refParts.forEach(function (p) {
      var u = user.comps[p.ref];
      res.parts.push({ ref: p.ref, ok: !!u && sameValue(u.value, p.value), missing: !u, want: p.value, got: u ? u.value : null });
    });
    Object.keys(user.comps).forEach(function (r) { if (r[0] !== '#' && !refParts.some(function (p) { return p.ref === r; })) res.extra.push(r); });

    // пин → номер цепи пользователя
    var pinNet = {};
    user.nets.forEach(function (nt, i) { nt.nodes.forEach(function (n) { pinNet[n] = i; }); });
    var refNetOf = {};
    Object.keys(project.nets).forEach(function (name) { project.nets[name].forEach(function (n) { refNetOf[n] = name; }); });
    // симметричные детали (R, C…): выбираем ориентацию, лучше совпадающую с эталоном
    var swap = {};
    refParts.filter(function (p) { return p.symmetric && p.sym_pins === 2; }).forEach(function (p) {
      function agree(pinU, pinR) {
        var un = pinNet[p.ref + '.' + pinU], rn = refNetOf[p.ref + '.' + pinR];
        if (un === undefined || !rn) return 0;
        return project.nets[rn].filter(function (n) { return n.split('.')[0] !== p.ref && pinNet[n] === un; }).length;
      }
      if (agree('2', '1') + agree('1', '2') > agree('1', '1') + agree('2', '2')) swap[p.ref] = true;
    });
    function userNet(node) {
      var parts = node.split('.'), r = parts[0], pin = parts[1];
      if (swap[r]) pin = pin === '1' ? '2' : '1';
      return pinNet[r + '.' + pin];
    }
    var names = Object.keys(project.nets).filter(function (n) { return project.nets[n].length > 1; });
    names.forEach(function (name) {
      var nodes = project.nets[name];
      var ids = {}, missing = [];
      nodes.forEach(function (n) { var id = userNet(n); if (id === undefined) missing.push(n); else (ids[id] = ids[id] || []).push(n); });
      var groups = Object.keys(ids);
      var main = groups.sort(function (a, b) { return ids[b].length - ids[a].length; })[0];
      var extra = [];
      if (main !== undefined) {
        user.nets[main].nodes.forEach(function (n) {
          var r = n.split('.')[0];
          if (r[0] === '#') return;
          var back = swap[r] ? r + '.' + (n.split('.')[1] === '1' ? '2' : '1') : n;
          if (nodes.indexOf(back) < 0 && refParts.some(function (p) { return p.ref === r; })) extra.push(back);
        });
      }
      var ok = groups.length === 1 && !missing.length && !extra.length;
      res.nets.push({ name: name, ok: ok, nodes: nodes, split: groups.length > 1 ? groups.map(function (g) { return ids[g]; }) : null, missing: missing, extra: extra });
    });
    var nOk = res.nets.filter(function (x) { return x.ok; }).length, pOk = res.parts.filter(function (x) { return x.ok; }).length;
    res.score = Math.round(nOk / Math.max(1, res.nets.length) * 80 + pOk / Math.max(1, res.parts.length) * 20);
    if (res.score === 100 && res.extra.length) res.score = 99;
    return res;
  }
  KM.netlist = { parse: parseNetlist, check: check };

  function pinLabel(project, node) {
    var r = node.split('.')[0], pin = node.split('.')[1];
    var p = project.parts.find(function (x) { return x.ref === r; });
    var nm = p && p.pins[pin];
    return r + '.' + pin + (nm && nm !== '~' && nm !== pin && !/^Pin_/.test(nm) ? ' (' + nm + ')' : '');
  }
  function renderResult(project, r) {
    var html = '<div class="callout ' + (r.score === 100 ? 'ok' : r.score >= 70 ? 'warn' : 'danger') + '"><span class="ico">' + (r.score === 100 ? '🏆' : '🔍') + '</span><div><strong>Результат: ' + r.score + '%</strong>' +
      (r.score === 100 ? 'Все соединения и номиналы совпадают с эталоном. Отличная работа!' : 'Исправьте замечания ниже, экспортируйте netlist ещё раз и проверьте снова.') + '</div></div>';
    var bad = r.nets.filter(function (n) { return !n.ok; });
    html += '<h3>Соединения: ' + (r.nets.length - bad.length) + ' из ' + r.nets.length + '</h3><ul class="check-list">' + r.nets.map(function (n) {
      var why = '';
      if (!n.ok) {
        if (n.missing.length) why += '<div class="small">Не подключены: ' + n.missing.map(function (x) { return '<code>' + KM.esc(pinLabel(project, x)) + '</code>'; }).join(' ') + '</div>';
        if (n.split) why += '<div class="small">Цепь разорвана на ' + n.split.length + ' части: ' + n.split.map(function (g) { return '[' + g.map(function (x) { return KM.esc(pinLabel(project, x)); }).join(', ') + ']'; }).join(' · ') + '</div>';
        if (n.extra.length) why += '<div class="small">Лишнее соединение (замыкание) с: ' + n.extra.map(function (x) { return '<code>' + KM.esc(pinLabel(project, x)) + '</code>'; }).join(' ') + '</div>';
      }
      return '<li><span>' + (n.ok ? '✅' : '❌') + '</span><div><b>' + KM.esc(n.name) + '</b> <span class="tiny">' + n.nodes.map(function (x) { return KM.esc(pinLabel(project, x)); }).join(', ') + '</span>' + why + '</div></li>';
    }).join('') + '</ul>';
    html += '<h3 class="mt">Компоненты</h3><ul class="check-list">' + r.parts.map(function (p) {
      return '<li><span>' + (p.ok ? '✅' : '❌') + '</span><div><b>' + p.ref + '</b> ' + (p.missing ? '<span class="small">нет в схеме — проверьте обозначение</span>' : p.ok ? KM.esc(p.got) : '<span class="small">номинал «' + KM.esc(p.got) + '», ожидалось «' + KM.esc(p.want) + '»</span>') + '</div></li>';
    }).join('') + '</ul>';
    if (r.extra.length) html += '<div class="callout warn"><span class="ico">ℹ️</span><div>Лишние компоненты: ' + r.extra.map(KM.esc).join(', ') + '. Если они нужны по вашей задумке — это не ошибка, но для проверки задания уберите их.</div></div>';
    return html;
  }

  KM.views.projects = {
    render: function () {
      var s = KM.store.state, P = KM.data.projects || [];
      var done = P.filter(function (p) { return s.projects[p.id] && s.projects[p.id].checked; }).length;
      return '<div class="page"><div class="page-head"><div class="eyebrow">Раздел 3</div><h1>Практические задания</h1>' +
        '<p>' + P.length + ' проектов. Скачайте заготовку KiCad, соберите схему по требованиям, экспортируйте netlist и загрузите его — сайт сравнит соединения с эталоном. Выполнено: ' + done + '.</p></div>' +
        '<div class="grid cols-3">' + P.map(function (p) {
          var r = s.projects[p.id];
          return '<a class="card" href="#/project/' + p.id + '"><div class="thumb-sch"><img src="' + p.svg + '" alt="" loading="lazy"></div>' +
            '<div class="row between"><span style="font-size:1.5rem">' + p.icon + '</span><span>' + (r && r.medal ? MEDAL[r.medal] : r && r.score ? '<span class="tag warn">' + r.score + '%</span>' : '') + '</span></div>' +
            '<h3>' + KM.esc(p.title) + '</h3><p class="muted small">' + KM.esc(p.short) + '</p>' +
            '<div class="row small"><span class="tag">' + '●'.repeat(p.level) + '○'.repeat(3 - p.level) + '</span><span class="tag copper">+' + p.xp + ' XP</span><span class="tag">' + p.parts.length + ' комп.</span></div></a>';
        }).join('') + '</div>' +
        '<div class="callout tip mt"><span class="ico">🏅</span><div><strong>Медали</strong>🥇 — верно с первой попытки, 🥈 — со 2–3-й, 🥉 — позже. Подсмотренное решение ограничивает медаль бронзой.</div></div></div>';
    }
  };

  KM.views.project = {
    render: function (p) {
      var pr = (KM.data.projects || []).find(function (x) { return x.id === p.id; });
      if (!pr) return '<div class="page narrow empty"><div class="big">🛠️</div><h1>Проект не найден</h1></div>';
      var r = KM.store.state.projects[pr.id] || {};
      var route = '/project/' + pr.id;
      return '<div class="page"><div class="crumbs"><a href="#/projects">Практика</a> › ' + KM.esc(pr.title) + '</div>' +
        '<div class="row between"><h1>' + pr.icon + ' ' + KM.esc(pr.title) + '</h1><div class="row">' + (r.medal ? '<span class="tag copper" style="font-size:1rem">' + MEDAL[r.medal] + ' медаль</span>' : '') + KM.ui.bookmarkBtn(route, pr.title) + '</div></div>' +
        '<div class="lesson-meta"><span class="tag">' + '●'.repeat(pr.level) + '○'.repeat(3 - pr.level) + ' уровень ' + pr.level + '</span><span class="tag copper">+' + pr.xp + ' XP</span>' +
          pr.learn.map(function (x) { return '<span class="tag accent">' + KM.esc(x) + '</span>'; }).join('') + '</div>' +
        '<div class="lesson-layout"><div>' +
        '<h2>🎯 Задача</h2><p>' + KM.esc(pr.goal) + '</p>' +
        '<h2>📋 Требования</h2><ul class="check-list">' + pr.req.map(function (x) { return '<li><span>▫️</span><div>' + KM.md(x).replace(/^<p>|<\/p>$/g, '') + '</div></li>'; }).join('') + '</ul>' +
        '<h2 class="mt">🧾 Список компонентов</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Обозн.</th><th>Номинал</th><th>Назначение</th><th>Посадочное место</th></tr></thead><tbody>' +
          pr.parts.map(function (x) { return '<tr><td><b>' + x.ref + '</b></td><td class="num">' + KM.esc(x.value) + '</td><td>' + KM.esc(x.desc) + '</td><td class="tiny">' + KM.esc(x.fp || '— (назначьте сами)') + '</td></tr>'; }).join('') +
        '</tbody></table></div>' +
        '<h2 class="mt">🪜 Как выполнить</h2><ol>' + pr.steps.map(function (x) { return '<li>' + KM.md(x).replace(/^<p>|<\/p>$/g, '') + '</li>'; }).join('') + '</ol>' +
        '<details class="card flat"><summary style="cursor:pointer;font-weight:650">💡 Подсказки</summary>' + pr.hints.map(function (h) { return KM.md(h); }).join('') + '</details>' +
        '<h2 class="mt" id="check">✅ Проверка решения</h2>' +
        '<div class="dropzone" id="drop" tabindex="0" role="button" aria-label="Загрузить netlist"><div style="font-size:2rem">📄</div><b>Перетащите сюда netlist (.net) или нажмите, чтобы выбрать файл</b><div class="small">В KiCad: Редактор схем → Файл → Экспорт → Список цепей → формат KiCad</div><input type="file" id="file" accept=".net,.xml,.txt" hidden></div>' +
        '<details style="margin-top:8px"><summary class="small" style="cursor:pointer">…или вставьте текст netlist</summary><textarea id="pasted" rows="6" placeholder="(export (version &quot;E&quot;) …"></textarea><button class="btn sm" id="checkPaste" style="margin-top:6px">Проверить</button></details>' +
        '<div id="result" class="mt" aria-live="polite"></div>' +
        KM.ui.notesBox(route) +
        '</div><aside class="lesson-aside"><div class="card flat stack">' +
          '<a class="btn primary" style="width:100%" href="' + pr.starter + '" download data-dl>⬇️ Заготовка KiCad (.zip)</a>' +
          '<button class="btn" style="width:100%" id="showSol">👀 Эталонное решение</button>' +
          '<div id="sol" hidden><div class="sch-preview"><img src="' + pr.svg + '" alt="Эталонная схема"></div><div class="row" style="margin-top:8px"><a class="btn sm" href="' + pr.zip + '" download data-dl>⬇️ Проект</a><a class="btn sm" href="' + pr.pdf + '" target="_blank">PDF</a><a class="btn sm" href="' + pr.bom + '" download data-dl>BOM</a></div></div>' +
          (r.attempts ? '<div class="small muted">Попыток: ' + r.attempts + ' · лучший результат: ' + (r.score || 0) + '%</div>' : '') +
          (KM.api.aiAvailable() ? '<a class="btn sm" href="#/community?tab=ai&ctx=' + encodeURIComponent('практический проект «' + pr.title + '»') + '">🤖 Спросить AI</a>' : '') +
        '</div></aside></div></div>';
    },
    mount: function (root, p) {
      var pr = (KM.data.projects || []).find(function (x) { return x.id === p.id; });
      if (!pr) return;
      var drop = KM.$('#drop', root), file = KM.$('#file', root), out = KM.$('#result', root);
      function run(txt) {
        try {
          var u = parseNetlist(txt), r = check(pr, u);
          var st = KM.store.state.projects[pr.id];
          if (st && st.sawSolution && r.score === 100 && !st.checked) {
            // подсмотренное решение → не выше бронзы
            st.attempts = Math.max(st.attempts || 0, 3);
          }
          KM.game.projectResult(pr, r.score);
          out.innerHTML = renderResult(pr, r);
          if (r.score === 100) { var m = KM.store.state.projects[pr.id].medal; KM.ui.toast('Проект выполнен!', 'Медаль: ' + ({ gold: 'золото', silver: 'серебро', bronze: 'бронза' })[m], MEDAL[m], 'achievement'); }
        } catch (e) {
          out.innerHTML = '<div class="callout danger"><span class="ico">⚠️</span><div><strong>Не удалось проверить</strong>' + KM.esc(e.message) + '</div></div>';
        }
      }
      function readFile(f) { var fr = new FileReader(); fr.onload = function () { run(String(fr.result)); }; fr.readAsText(f); }
      drop.onclick = function () { file.click(); };
      drop.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } };
      file.onchange = function () { if (file.files[0]) readFile(file.files[0]); };
      drop.ondragover = function (e) { e.preventDefault(); drop.classList.add('over'); };
      drop.ondragleave = function () { drop.classList.remove('over'); };
      drop.ondrop = function (e) { e.preventDefault(); drop.classList.remove('over'); if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]); };
      KM.$('#checkPaste', root).onclick = function () { run(KM.$('#pasted', root).value); };
      KM.$('#showSol', root).onclick = function () {
        var st = KM.store.state.projects[pr.id];
        if (!(st && st.checked) && !confirm('Показать эталонное решение? Если проект ещё не сдан, максимальная медаль станет бронзовой.')) return;
        st = KM.store.state.projects[pr.id] || (KM.store.state.projects[pr.id] = { attempts: 0, score: 0 });
        if (!st.checked) st.sawSolution = true;
        KM.store.touch();
        KM.$('#sol', root).hidden = false; this.hidden = true;
      };
      KM.$$('[data-dl]', root).forEach(function (a) { a.addEventListener('click', function () { KM.store.state.downloads++; KM.game.activity(); }); });
    }
  };
})();
