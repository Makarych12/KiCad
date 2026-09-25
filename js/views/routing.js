/* =========================================================
   Тренажёр трассировки: разводка дорожек как в KiCad.
   Логика уровней, DRC и связности — js/routing-engine.js (KM.routing).
   Здесь — SVG-поле, управление мышью/пальцем/клавиатурой и прогресс.
   ========================================================= */
(function () {
  'use strict';
  var R = KM.routing;
  var COLORS = { F: '#d8453b', B: '#3d7be0' };
  var NET_COLORS = ['#ffd24a', '#6ee7b7', '#f9a8d4', '#93c5fd', '#fdba74', '#c4b5fd', '#a3e635', '#67e8f9'];

  var S = { lv: 0, items: [], cur: null, layer: 'F', width: 0.5, diag: false, tool: 'route', hover: null, ev: null, zoom: 1,
    usedSolution: false, announced: false, focus: null, confirmReset: false };
  var env = null;

  function lv() { return R.levels[S.lv]; }
  function prog() { var s = KM.store.state; if (!s.routing) s.routing = {}; return s.routing; }
  function fmt(v) { return (Math.round(v * 100) / 100).toString().replace('.', ','); }
  function stars(n) { return '<span class="rt-stars" aria-label="' + n + ' из 3">' + '★★★'.slice(0, n) + '<span>' + '★★★'.slice(n) + '</span></span>'; }
  function netColor(net) { var ns = Object.keys(R.nets(lv())).sort(); return NET_COLORS[ns.indexOf(net) % NET_COLORS.length]; }

  function startLevel(i) {
    S.lv = Math.max(0, Math.min(R.levels.length - 1, i));
    var l = lv();
    S.items = []; S.cur = null; S.layer = 'F'; S.width = l.rules.width; S.tool = 'route'; S.hover = null;
    S.usedSolution = false; S.announced = false; S.focus = null; S.confirmReset = false;
    S.zoom = autoZoom();
    evaluate();
  }
  // на узких экранах — не меньше ~11 px на мм, поле прокручивается
  function autoZoom() {
    var w = env && env.field ? env.field.clientWidth : 0;
    return w ? Math.max(1, Math.min(4, (lv().w + 3) * 11 / w)) : 1;
  }
  function evaluate() {
    var sp = R.split(S.items);
    S.ev = R.evaluate(lv(), sp.tracks, sp.vias);
  }

  /* =================== привязка курсора =================== */
  function snap(p, forNet) {
    var l = lv(), pads = R.pads(l), sp = R.split(S.items);
    for (var i = 0; i < pads.length; i++) {
      var P = pads[i];
      if (R.geom.dSPad([p[0], p[1], p[0], p[1]], P) <= 0.25) return { pt: [P.x, P.y], pad: P };
    }
    for (var v = 0; v < sp.vias.length; v++) if (Math.hypot(sp.vias[v].x - p[0], sp.vias[v].y - p[1]) <= 0.7) return { pt: [sp.vias[v].x, sp.vias[v].y], via: sp.vias[v] };
    var best = null;
    sp.tracks.forEach(function (t) {
      if (forNet && t.net !== forNet) return;
      t.pts.forEach(function (q) { var d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d <= 0.6 && (!best || d < best.d)) best = { d: d, pt: q.slice(), track: t }; });
    });
    if (best) return best;
    sp.tracks.forEach(function (t) {
      if (forNet && t.net !== forNet) return;
      for (var i = 1; i < t.pts.length; i++) {
        var a = t.pts[i - 1], b = t.pts[i], d = R.geom.dPS(p[0], p[1], a[0], a[1], b[0], b[1]);
        if (d <= t.w / 2 + 0.25 && (!best || d < best.d)) {
          var dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy, k = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L)) : 0;
          best = { d: d, pt: [a[0] + k * dx, a[1] + k * dy], track: t, onSeg: true };
        }
      }
    });
    if (best) return best;
    var g = 0.5;
    return { pt: [Math.round(p[0] / g) * g, Math.round(p[1] / g) * g] };
  }
  // точка на своей цепи: сюда можно закончить дорожку
  function isTarget(s, cur) {
    if (s.pad) return s.pad.net === cur.net && s.pad.layers.indexOf(cur.layer) >= 0;
    if (s.via) return s.via.net === cur.net;
    if (s.track) return s.track.net === cur.net && s.track.layer === cur.layer && s.track !== cur.from;
    return false;
  }

  /* =================== действия =================== */
  function say(t) { if (env) env.status.innerHTML = t; }
  function click(p) {
    var l = lv();
    if (S.tool === 'delete') {
      var sp = R.split(S.items), hit = null;
      sp.vias.forEach(function (v) { if (Math.hypot(v.x - p[0], v.y - p[1]) <= 0.6) hit = v; });
      if (!hit) sp.tracks.forEach(function (t) {
        for (var i = 1; i < t.pts.length; i++) if (R.geom.dPS(p[0], p[1], t.pts[i - 1][0], t.pts[i - 1][1], t.pts[i][0], t.pts[i][1]) <= t.w / 2 + 0.3) hit = t;
      });
      if (hit) { S.items.splice(S.items.indexOf(hit), 1); changed(); }
      return;
    }
    if (!S.cur) {
      var s = snap(p);
      var net = s.pad ? s.pad.net : s.via ? s.via.net : s.track ? s.track.net : null;
      if (!net) { KM.ui.toast('Начните с площадки', 'Щёлкните по контактной площадке компонента — дорожка всегда идёт от вывода к выводу', '👆'); return; }
      if (s.pad && s.pad.layers.indexOf(S.layer) < 0) { S.layer = s.pad.layers[0]; KM.ui.toast('Слой F.Cu', 'SMD-площадки есть только на верхнем слое — переключаю', '🔴'); }
      if (s.track && s.track.layer !== S.layer) S.layer = s.track.layer;
      S.cur = { net: net, layer: S.layer, w: S.width, pts: [s.pt], from: s.track || null };
      S.hover = null;
      render();
      return;
    }
    var c = S.cur, t = snap(p, c.net), last = c.pts[c.pts.length - 1];
    if (t.pad && t.pad.net !== c.net) { KM.ui.toast('Чужая цепь', 'Площадка ' + t.pad.ref + '.' + t.pad.name + ' принадлежит цепи ' + t.pad.net + ' — это было бы короткое замыкание', '⛔'); return; }
    if (t.pad && t.pad.layers.indexOf(c.layer) < 0) { KM.ui.toast('Другой слой', 'Площадка ' + t.pad.ref + '.' + t.pad.name + ' есть только на F.Cu. Поставьте переход (V), чтобы вернуться на верхний слой', '🔁'); return; }
    if (Math.hypot(t.pt[0] - last[0], t.pt[1] - last[1]) < 1e-6) { finish(); return; } // повторный щелчок — завершить
    R.bend(last[0], last[1], t.pt[0], t.pt[1], S.diag).forEach(function (q) { c.pts.push(q); });
    if (isTarget(t, c) && c.pts.length > 1) finish(); else render();
  }
  function finish() {
    var c = S.cur;
    S.cur = null; S.hover = null;
    if (c && c.pts.length > 1) { S.items.push({ net: c.net, layer: c.layer, w: c.w, pts: c.pts }); changed(); }
    else render();
  }
  function via() {
    var l = lv();
    if (l.layers < 2) { KM.ui.toast('Однослойная плата', 'На этом уровне есть только слой F.Cu', 'ℹ️'); return; }
    if (!S.cur) { S.layer = S.layer === 'F' ? 'B' : 'F'; render(); return; }
    var c = S.cur, last = c.pts[c.pts.length - 1];
    if (S.hover && Math.hypot(S.hover[0] - last[0], S.hover[1] - last[1]) > 1e-6) {
      R.bend(last[0], last[1], S.hover[0], S.hover[1], S.diag).forEach(function (q) { c.pts.push(q); });
      last = c.pts[c.pts.length - 1];
    }
    if (c.pts.length > 1) S.items.push({ net: c.net, layer: c.layer, w: c.w, pts: c.pts });
    S.items.push({ via: true, net: c.net, x: last[0], y: last[1] });
    S.layer = c.layer === 'F' ? 'B' : 'F';
    S.cur = { net: c.net, layer: S.layer, w: c.w, pts: [last.slice()] };
    changed();
  }
  function undo() {
    if (S.cur) { if (S.cur.pts.length > 1) S.cur.pts.pop(); else S.cur = null; render(); return; }
    if (S.items.length) { S.items.pop(); changed(); }
  }
  function changed() {
    evaluate();
    render();
    var e = S.ev, l = lv();
    if (e.complete && !S.announced) {
      S.announced = true;
      var p = prog(), prev = p[l.id], first = !prev;
      if (!S.usedSolution) {
        if (first) KM.game.addXP(l.xp, 'Тренажёр трассировки: «' + l.title + '»');
        if (!prev || e.stars > prev.stars || (e.stars === prev.stars && e.length < prev.len)) { p[l.id] = { stars: Math.max(e.stars, prev ? prev.stars : 0), len: Math.round(e.length * 10) / 10, t: Date.now() }; KM.store.touch(); }
        KM.game.activity();
      }
      if (S.usedSolution) say('👀 Это эталонное решение. Нажмите «Начать уровень заново», чтобы развести плату самостоятельно.');
      else result(first);
    }
  }
  function result(first) {
    var e = S.ev, l = lv(), next = R.levels[S.lv + 1], sp = R.split(S.items);
    var body = '<div class="rt-result"><div class="rt-big">' + stars(S.usedSolution ? 0 : e.stars) + '</div>' +
      (S.usedSolution ? '<p>Это эталонное решение. Сбросьте уровень и разведите плату сами, чтобы получить звёзды и опыт.</p>' :
        '<p><b>Все цепи соединены, DRC без ошибок!</b>' + (first ? ' +' + l.xp + ' XP' : '') + '</p>') +
      '<ul class="rt-score"><li>' + (e.stars >= 1 ? '✅' : '◻️') + ' Все цепи разведены без нарушений DRC</li>' +
      '<li>' + (e.stars >= 2 ? '✅' : '◻️') + ' Экономная разводка: длина ' + fmt(e.length) + ' мм (эталон ' + fmt(e.best) + ' мм)' + (l.layers > 1 ? ', переходов ' + sp.vias.length : '') + '</li>' +
      '<li>' + (e.stars >= 3 ? '✅' : '◻️') + ' Без острых и прямых углов' + (e.warns.length ? ' (замечаний: ' + e.warns.length + ')' : '') + '</li></ul>' +
      '<div class="row">' + (next ? '<button class="btn primary" data-go="next">Следующий уровень →</button>' : '<a class="btn primary" href="#/gerber">👁️ Посмотреть эту плату в Gerber</a>') + '<button class="btn" data-go="stay">Остаться</button></div></div>';
    KM.ui.modal(e.stars === 3 && !S.usedSolution ? 'Отлично! Уровень пройден' : 'Уровень пройден', body, function (b, d) {
      KM.$$('[data-go]', b).forEach(function (x) { x.onclick = function () { d.close(); if (x.dataset.go === 'next') { startLevel(S.lv + 1); full(); } }; });
    });
  }

  /* =================== отрисовка поля =================== */
  function padSvg(P, onF) {
    var col = P.layers.length > 1 ? '#caa63d' : COLORS.F;
    var sh = P.shape === 'circle' ? '<circle cx="' + P.x + '" cy="' + P.y + '" r="' + P.w / 2 + '" fill="' + col + '"/>'
      : '<rect x="' + (P.x - P.w / 2) + '" y="' + (P.y - P.h / 2) + '" width="' + P.w + '" height="' + P.h + '" rx="' + Math.min(P.w, P.h) * (P.drill ? 0.1 : 0.25) + '" fill="' + col + '"/>';
    if (P.drill) sh += '<circle cx="' + P.x + '" cy="' + P.y + '" r="' + P.drill / 2 + '" fill="#07110c"/>';
    return sh;
  }
  function trackSvg(t, cls) {
    return '<polyline class="' + (cls || '') + '" points="' + t.pts.map(function (q) { return q[0] + ',' + q[1]; }).join(' ') + '" stroke-width="' + t.w + '"/>';
  }
  function board() {
    var l = lv(), e = S.ev, sp = R.split(S.items), pads = R.pads(l), focusNet = S.cur ? S.cur.net : S.focus;
    var o = '<svg class="rt-svg" viewBox="-1.5 -1.5 ' + (l.w + 3) + ' ' + (l.h + 3) + '" style="width:' + (S.zoom * 100) + '%" role="img" aria-label="Поле трассировки платы ' + KM.esc(l.title) + '">' +
      '<defs><pattern id="rtGrid" width="1" height="1" patternUnits="userSpaceOnUse"><circle cx="0" cy="0" r=".045" fill="#8fd4b0" opacity=".35"/></pattern></defs>' +
      '<rect x="0" y="0" width="' + l.w + '" height="' + l.h + '" rx=".8" fill="#0d3121"/>' +
      '<rect x="0" y="0" width="' + l.w + '" height="' + l.h + '" fill="url(#rtGrid)"/>' +
      '<rect x="0" y="0" width="' + l.w + '" height="' + l.h + '" rx=".8" fill="none" stroke="#e6d52b" stroke-width=".15"/>';
    (l.holes || []).forEach(function (h) { o += '<circle cx="' + h.x + '" cy="' + h.y + '" r="' + h.r + '" fill="#07110c" stroke="#9aa39f" stroke-width=".12"/>'; });
    // слои: неактивный — снизу и приглушён
    var order = S.layer === 'F' ? ['B', 'F'] : ['F', 'B'];
    order.forEach(function (L) {
      var active = L === S.layer;
      o += '<g class="rt-layer" style="opacity:' + (active ? 1 : 0.45) + '" stroke="' + COLORS[L] + '">';
      if (L === 'F') pads.forEach(function (P) { if (P.layers.length === 1) o += padSvg(P); });
      sp.tracks.forEach(function (t) { if (t.layer === L) o += trackSvg(t, focusNet && t.net === focusNet ? 'hl' : ''); });
      o += '</g>';
    });
    pads.forEach(function (P) { if (P.layers.length > 1) o += padSvg(P); });
    sp.vias.forEach(function (v) { o += '<circle cx="' + v.x + '" cy="' + v.y + '" r="' + R.VIA.d / 2 + '" fill="#c7c9c8"/><circle cx="' + v.x + '" cy="' + v.y + '" r="' + R.VIA.drill / 2 + '" fill="#07110c"/>'; });
    // шелкография
    o += '<g class="rt-silk">';
    l.parts.forEach(function (p) {
      o += '<rect x="' + p.box[0] + '" y="' + p.box[1] + '" width="' + p.box[2] + '" height="' + p.box[3] + '" rx=".3"/>';
      // у узких вертикальных деталей подпись сбоку, чтобы не наезжать на соседей сверху
      if (p.box[3] > p.box[2] * 1.4 && p.box[2] < 3) o += '<text class="side" x="' + (p.box[0] + p.box[2] + 0.35) + '" y="' + (p.box[1] + p.box[3] / 2 + 0.35) + '">' + p.ref + ' <tspan>' + KM.esc(p.value) + '</tspan></text>';
      else o += '<text x="' + (p.box[0] + p.box[2] / 2) + '" y="' + (p.box[1] - 0.45) + '">' + p.ref + ' <tspan>' + KM.esc(p.value) + '</tspan></text>';
    });
    o += '</g><g class="rt-netlbl">';
    pads.forEach(function (P) { var fs = Math.min(0.62, Math.max(P.w, P.h) / Math.max(2.2, P.net.length * 0.62)); o += '<text x="' + P.x + '" y="' + (P.y + fs * 0.35) + '" font-size="' + fs.toFixed(2) + '">' + KM.esc(P.net) + '</text>'; });
    o += '</g>';
    // воздушные линии
    o += '<g class="rt-rats">';
    e.con.rats.forEach(function (r) { o += '<line x1="' + r.a.x + '" y1="' + r.a.y + '" x2="' + r.b.x + '" y2="' + r.b.y + '" stroke="' + netColor(r.net) + '"' + (focusNet && focusNet !== r.net ? ' opacity=".35"' : '') + '/>'; });
    o += '</g>';
    // маркеры DRC
    o += '<g class="rt-drc">';
    e.drc.forEach(function (d, i) { o += '<g class="' + d.sev + (S.flash === i ? ' flash' : '') + '"><circle cx="' + d.x + '" cy="' + d.y + '" r=".75"/><text x="' + d.x + '" y="' + (d.y + 0.33) + '">!</text></g>'; });
    o += '</g><g id="rtPreview">' + preview() + '</g></svg>';
    return o;
  }
  function preview() {
    var c = S.cur, o = '';
    if (c) {
      var pts = c.pts.slice(), last = pts[pts.length - 1];
      if (S.hover) R.bend(last[0], last[1], S.hover[0], S.hover[1], S.diag).forEach(function (q) { pts.push(q); });
      if (pts.length > 1) {
        var d = pts.map(function (q) { return q[0] + ',' + q[1]; }).join(' ');
        o += '<polyline class="rt-halo" points="' + d + '" stroke-width="' + (c.w + 2 * lv().rules.clearance) + '"/>';
        o += '<polyline class="rt-live" points="' + d + '" stroke="' + COLORS[c.layer] + '" stroke-width="' + c.w + '"/>';
      }
      o += '<circle class="rt-end" cx="' + last[0] + '" cy="' + last[1] + '" r="' + Math.max(0.25, c.w / 2) + '"/>';
    }
    if (S.hover) o += '<g class="rt-cross"><line x1="' + (S.hover[0] - 0.7) + '" y1="' + S.hover[1] + '" x2="' + (S.hover[0] + 0.7) + '" y2="' + S.hover[1] + '"/><line x1="' + S.hover[0] + '" y1="' + (S.hover[1] - 0.7) + '" x2="' + S.hover[0] + '" y2="' + (S.hover[1] + 0.7) + '"/></g>';
    return o;
  }

  /* =================== панели =================== */
  function levelsHtml() {
    var p = prog();
    return R.levels.map(function (l, i) {
      var r = p[l.id];
      return '<button class="rt-lvl" data-lv="' + i + '" aria-pressed="' + (i === S.lv) + '"><span class="rt-ico" aria-hidden="true">' + l.icon + '</span><span class="rt-lt"><b>' + (i + 1) + '. ' + KM.esc(l.title) + '</b><span>' + (l.layers > 1 ? '2 слоя' : '1 слой') + ' · +' + l.xp + ' XP</span></span>' + (r ? stars(r.stars) : '') + '</button>';
    }).join('');
  }
  function sideHtml() {
    var l = lv(), e = S.ev, nets = R.nets(l), sp = R.split(S.items);
    var rules = ['зазор ' + fmt(l.rules.clearance) + ' мм', 'до края ' + fmt(l.rules.edge) + ' мм', l.layers > 1 ? 'слои F.Cu + B.Cu' : 'только F.Cu'];
    if (l.rules.minWidth) rules.push(Object.keys(l.rules.minWidth).join(', ') + ' ≥ ' + fmt(l.rules.minWidth[Object.keys(l.rules.minWidth)[0]]) + ' мм');
    return '<section class="card"><h3>' + l.icon + ' ' + (S.lv + 1) + '. ' + KM.esc(l.title) + '</h3><p class="small">' + KM.esc(l.goal) + '</p>' +
      '<div class="chips">' + rules.map(function (r) { return '<span class="tag">' + r + '</span>'; }).join('') + '</div>' +
      '<details class="mt-s"><summary class="small">💡 Подсказка</summary><p class="small muted mb0">' + KM.esc(l.hint) + '</p></details></section>' +
      '<section class="card"><h3>🔌 Цепи <span class="tiny muted">' + e.done.length + ' из ' + e.nets.length + '</span></h3><div class="rt-nets">' +
        Object.keys(nets).sort().map(function (k) {
          var done = e.con.nets[k].done;
          return '<button class="rt-net' + (done ? ' done' : '') + '" data-net="' + KM.esc(k) + '" aria-pressed="' + (S.focus === k) + '"><span class="rt-dot" style="background:' + netColor(k) + '"></span>' + KM.esc(k) + '<span>' + (done ? '✅' : nets[k].length + ' выв.') + '</span></button>';
        }).join('') + '</div>' +
        '<div class="rt-meter"><span style="width:' + (e.done.length / e.nets.length * 100) + '%"></span></div>' +
        '<p class="tiny mb0">Длина дорожек: ' + fmt(e.length) + ' мм' + (l.layers > 1 ? ' · переходов: ' + sp.vias.length : '') + '</p></section>' +
      '<section class="card"><h3>🛡️ DRC <span class="tiny ' + (e.errors.length ? 'rt-bad' : 'rt-ok') + '">' + (e.errors.length ? 'ошибок: ' + e.errors.length : 'ошибок нет') + '</span></h3>' +
        (e.drc.length ? '<ul class="rt-drclist">' + e.drc.map(function (d, i) { return '<li class="' + d.sev + '"><button data-drc="' + i + '">' + (d.sev === 'error' ? '⛔ ' : '⚠️ ') + KM.esc(d.msg) + '</button></li>'; }).join('') + '</ul>'
          : '<p class="small muted mb0">' + (S.items.length ? 'Нарушений нет — так держать.' : 'Проверка идёт автоматически после каждой дорожки.') + '</p>') + '</section>' +
      '<section class="card"><h3>🏆 Уровни</h3><div class="rt-lvls">' + levelsHtml() + '</div></section>';
  }
  function toolbarHtml() {
    var l = lv(), c = S.cur;
    return '<div class="rt-tb">' +
      '<div class="rt-seg" role="group" aria-label="Слой"><button data-layer="F" aria-pressed="' + (S.layer === 'F') + '"><i style="background:' + COLORS.F + '"></i>F.Cu</button>' +
        '<button data-layer="B" aria-pressed="' + (S.layer === 'B') + '"' + (l.layers < 2 ? ' disabled title="На этом уровне один слой"' : '') + '><i style="background:' + COLORS.B + '"></i>B.Cu</button></div>' +
      '<div class="rt-seg" role="group" aria-label="Ширина дорожки">' + l.rules.widths.map(function (w) { return '<button data-w="' + w + '" aria-pressed="' + ((c ? c.w : S.width) === w) + '">' + fmt(w) + '</button>'; }).join('') + '</div>' +
      '<button class="btn sm" data-act="diag" aria-pressed="' + S.diag + '" title="Порядок изломов: сначала прямо или сначала под 45° (клавиша /)">' + (S.diag ? '⟋ 45° сначала' : '⟶ прямо сначала') + '</button>' +
      (l.layers > 1 ? '<button class="btn sm" data-act="via" title="Переходное отверстие и смена слоя (V)">⦿ Переход</button>' : '') +
      '<button class="btn sm" data-act="undo" title="Отменить (Ctrl+Z / Backspace)">↶ Отменить</button>' +
      '<button class="btn sm" data-act="del" aria-pressed="' + (S.tool === 'delete') + '" title="Щёлкните по дорожке, чтобы удалить">🗑 Удалить</button>' +
      (c ? '<button class="btn sm primary" data-act="finish">✓ Готово</button><button class="btn sm" data-act="cancel">✕ Отмена</button>' : '') +
      '<span class="rt-sp"></span><button class="btn sm" data-act="zout" aria-label="Отдалить">−</button><button class="btn sm" data-act="zin" aria-label="Приблизить">+</button>' +
    '</div>';
  }
  function statusText() {
    var c = S.cur;
    if (S.tool === 'delete') return '🗑 Режим удаления: щёлкните по дорожке или переходу. Нажмите «Удалить» ещё раз, чтобы вернуться к трассировке.';
    if (c) return 'Цепь <b style="color:' + netColor(c.net) + '">' + KM.esc(c.net) + '</b> · слой <b>' + c.layer + '.Cu</b> · ' + fmt(c.w) + ' мм — щелчок ставит излом, щелчок по площадке цепи завершает, <kbd>Esc</kbd> — отмена' + (lv().layers > 1 ? ', <kbd>V</kbd> — переход' : '');
    if (S.ev.complete) return '🎉 Плата разведена! Выберите следующий уровень или улучшите результат.';
    return 'Щёлкните по площадке, чтобы начать дорожку. Пунктир показывает, что осталось соединить.';
  }

  function render() {
    if (!env) return;
    env.field.innerHTML = board();
    env.tb.innerHTML = toolbarHtml();
    env.side.innerHTML = sideHtml();
    say(statusText());
  }
  function full() { render(); if (env) env.field.scrollTo(0, 0); }
  function updatePreview() {
    var g = env && env.field.querySelector('#rtPreview');
    if (g) g.innerHTML = preview();
  }

  KM.views.routing = {
    render: function () {
      return '<div class="page rt-page"><div class="page-head"><div class="eyebrow">Инструменты</div><h1>Тренажёр трассировки</h1>' +
        '<p>Разводите печатные платы по правилам KiCad: дорожки под 45°, зазоры, силовые цепи, два слоя и переходные отверстия. Проверка DRC идёт после каждого действия.</p></div>' +
        '<div class="rt-wrap"><div class="rt-main"><div id="rtTb"></div><div class="rt-field" id="rtField"></div><p class="rt-status" id="rtStatus" aria-live="polite"></p>' +
          '<div class="row mt-s"><button class="btn sm ghost" id="rtReset">⟲ Начать уровень заново</button><button class="btn sm ghost" id="rtSol">👀 Показать решение</button></div>' +
          '<details class="mt-s"><summary class="small">⌨️ Управление</summary><p class="small muted mb0">Мышь: щелчок — начать дорожку или поставить излом, двойной щелчок или щелчок по площадке — завершить. Клавиши: <kbd>Esc</kbd> — отменить дорожку, <kbd>Backspace</kbd> или <kbd>Ctrl</kbd>+<kbd>Z</kbd> — шаг назад, <kbd>V</kbd> — переходное отверстие, <kbd>/</kbd> — порядок изломов, <kbd>Enter</kbd> — завершить. На телефоне — касания и кнопки над полем; поле можно прокручивать и увеличивать кнопкой «+».</p></details>' +
        '</div><aside class="rt-side" id="rtSide"></aside></div></div>';
    },
    mount: function (root) {
      env = { root: root, field: KM.$('#rtField', root), tb: KM.$('#rtTb', root), side: KM.$('#rtSide', root), status: KM.$('#rtStatus', root) };
      if (!S.ev) {
        var p = prog(), first = R.levels.findIndex(function (l) { return !p[l.id]; });
        startLevel(first < 0 ? 0 : first);
      } else S.zoom = Math.max(S.zoom, autoZoom());
      render();

      function toMM(e) {
        var svg = env.field.querySelector('svg'), pt = svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        var q = pt.matrixTransform(svg.getScreenCTM().inverse());
        return [q.x, q.y];
      }
      var down = null;
      env.field.addEventListener('pointerdown', function (e) { if (e.button === 0 || e.pointerType !== 'mouse') down = [e.clientX, e.clientY, e.pointerType]; });
      env.field.addEventListener('pointerup', function (e) {
        if (!down) return;
        var moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]);
        down = null;
        if (moved < 8 && e.target.closest('svg')) click(toMM(e));
      });
      env.field.addEventListener('pointercancel', function () { down = null; });
      env.field.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || !e.target.closest('svg')) return;
        var s = snap(toMM(e), S.cur && S.cur.net);
        S.hover = s.pt;
        if (!env.hoverRaf) env.hoverRaf = requestAnimationFrame(function () { env.hoverRaf = 0; updatePreview(); });
      });
      env.field.addEventListener('pointerleave', function () { S.hover = null; updatePreview(); });
      env.field.addEventListener('dblclick', function (e) { e.preventDefault(); if (S.cur) finish(); });

      env.tb.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || b.disabled) return;
        if (b.dataset.layer) { if (S.cur && b.dataset.layer !== S.cur.layer) via(); else { S.layer = b.dataset.layer; render(); } return; }
        if (b.dataset.w) { S.width = parseFloat(b.dataset.w); if (S.cur) S.cur.w = S.width; render(); return; }
        var a = b.dataset.act;
        if (a === 'diag') { S.diag = !S.diag; render(); }
        else if (a === 'via') via();
        else if (a === 'undo') undo();
        else if (a === 'del') { S.tool = S.tool === 'delete' ? 'route' : 'delete'; S.cur = null; env.field.classList.toggle('deleting', S.tool === 'delete'); render(); }
        else if (a === 'finish') finish();
        else if (a === 'cancel') { S.cur = null; render(); }
        else if (a === 'zin' || a === 'zout') { S.zoom = Math.max(1, Math.min(4, S.zoom * (a === 'zin' ? 1.5 : 1 / 1.5))); if (S.zoom < 1.05) S.zoom = 1; render(); }
      });
      env.side.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        if (b.dataset.lv != null) { startLevel(+b.dataset.lv); full(); }
        else if (b.dataset.net) { S.focus = S.focus === b.dataset.net ? null : b.dataset.net; render(); }
        else if (b.dataset.drc != null) {
          S.flash = +b.dataset.drc; render();
          var m = env.field.querySelector('.rt-drc .flash'); if (m && m.scrollIntoView) m.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          setTimeout(function () { S.flash = null; if (env) render(); }, 1600);
        }
      });
      KM.$('#rtReset', root).onclick = function () {
        if (!S.confirmReset && S.items.length) { S.confirmReset = true; this.textContent = '⟲ Точно сбросить? Нажмите ещё раз'; return; }
        startLevel(S.lv); this.textContent = '⟲ Начать уровень заново'; render();
      };
      KM.$('#rtSol', root).onclick = function () {
        S.items = JSON.parse(JSON.stringify(lv().solution)); S.cur = null; S.usedSolution = true; S.announced = false;
        KM.ui.toast('Эталонное решение', 'Изучите его, затем начните уровень заново — за самостоятельную разводку дают опыт и звёзды', '👀');
        changed();
      };
      env.key = function (e) {
        if (!env || /INPUT|TEXTAREA|SELECT/.test(document.activeElement && document.activeElement.tagName) || KM.$('#modal').open) return;
        var handled = true;
        if (e.key === 'Escape' && S.cur) { S.cur = null; render(); }
        else if ((e.key === 'Backspace' && S.cur) || (e.key.toLowerCase() === 'z' && (e.ctrlKey || e.metaKey))) undo();
        else if (/^[vVмМ]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) via();
        else if (e.key === '/' && S.cur) { S.diag = !S.diag; render(); }
        else if (e.key === 'Enter' && S.cur) finish();
        else handled = false;
        if (handled) { e.preventDefault(); e.stopPropagation(); }
      };
      document.addEventListener('keydown', env.key, true);
    },
    unmount: function () {
      if (!env) return;
      document.removeEventListener('keydown', env.key, true);
      if (env.hoverRaf) cancelAnimationFrame(env.hoverRaf);
      S.cur = null; S.hover = null;
      env = null;
    }
  };
})();
