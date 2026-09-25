/* =========================================================
   Движок тренажёра трассировки: уровни, проверка правил (DRC)
   и связности цепей. Без DOM — проверяется в Node
   (tools/test-routing.mjs прогоняет эталонные решения уровней).
   Координаты в мм, ось Y вниз (как в KiCad).
   ========================================================= */
(function (root) {
  'use strict';
  var R = {};

  /* ---------- посадочные места ---------- */
  function smd(x, y, w, h, net, name) { return { x: x, y: y, w: w, h: h, shape: 'rect', layers: ['F'], net: net, name: name }; }
  function tht(x, y, d, net, name, square) { return { x: x, y: y, w: d, h: d, shape: square ? 'rect' : 'circle', layers: ['F', 'B'], net: net, drill: d * 0.58, name: name }; }
  function part(ref, value, box, pads) { return { ref: ref, value: value, box: box, pads: pads }; }
  function header(ref, value, x, ys, nets, d) {
    d = d || 1.7;
    return part(ref, value, [x - d / 2 - 0.5, ys[0] - d / 2 - 0.5, d + 1, ys[ys.length - 1] - ys[0] + d + 1],
      nets.map(function (n, i) { return tht(x, ys[i], d, n, String(i + 1), i === 0); }));
  }
  function r0805(ref, value, x, y, n1, n2, vertical, big) {
    var s = big ? [1.8, 1.3, 1.5] : [1.45, 1.0, 0.95];
    if (vertical) return part(ref, value, [x - s[0] / 2 - 0.3, y - s[2] - s[1] / 2 - 0.3, s[0] + 0.6, 2 * s[2] + s[1] + 0.6], [smd(x, y - s[2], s[0], s[1], n1, '1'), smd(x, y + s[2], s[0], s[1], n2, '2')]);
    return part(ref, value, [x - s[2] - s[1] / 2 - 0.3, y - s[0] / 2 - 0.3, 2 * s[2] + s[1] + 0.6, s[0] + 0.6], [smd(x - s[2], y, s[1], s[0], n1, '1'), smd(x + s[2], y, s[1], s[0], n2, '2')]);
  }

  /* ---------- уровни ---------- */
  R.levels = [
    {
      id: 'r1', title: 'Первая дорожка', icon: '💡', xp: 60, w: 30, h: 20, layers: 1,
      goal: 'Соедините батарейку, резистор и светодиод. Дорожки идут только под 0°, 45° и 90° — как в KiCad.',
      hint: 'Щёлкните по площадке, ведите курсор и щёлкайте, чтобы ставить изломы. Щелчок по площадке той же цепи завершает дорожку.',
      rules: { clearance: 0.3, edge: 0.5, widths: [0.25, 0.5, 1.0], width: 0.5 },
      parts: [
        header('J1', 'BAT', 4, [8.5, 11], ['VCC', 'GND']),
        r0805('R1', '330', 15, 5, 'VCC', 'LED'),
        r0805('D1', 'LED', 25, 10, 'LED', 'GND', true)
      ],
      solution: [
        { net: 'VCC', layer: 'F', w: 0.5, pts: [[4, 8.5], [7.5, 5], [14.05, 5]] },
        { net: 'LED', layer: 'F', w: 0.5, pts: [[15.95, 5], [20.95, 5], [25, 9.05]] },
        { net: 'GND', layer: 'F', w: 0.5, pts: [[4, 11], [25, 11]] }
      ]
    },
    {
      id: 'r2', title: 'Обход препятствий', icon: '🧭', xp: 90, w: 36, h: 24, layers: 1,
      goal: 'Подключите датчик U1 и конденсатор C1 к разъёму. Посередине — крепёжное отверстие, а сигнальный вывод датчика спрятан за корпусом.',
      hint: 'На одном слое дорожки не могут пересекаться. Подумайте, с какой стороны обойти разъём J1 и датчик, чтобы SIG не пересёк VCC.',
      rules: { clearance: 0.3, edge: 0.5, widths: [0.25, 0.5, 1.0], width: 0.25 },
      holes: [{ x: 16, y: 12, r: 2.5 }],
      parts: [
        header('J1', 'IN', 4, [9.5, 12, 14.5], ['VCC', 'SIG', 'GND']),
        part('U1', 'SENSOR', [28, 9.5, 5, 5], [smd(29, 10.5, 1.2, 1.0, 'VCC', '1'), smd(29, 13.5, 1.2, 1.0, 'GND', '2'), smd(32, 12, 1.2, 1.0, 'SIG', '3')]),
        r0805('C1', '100n', 22, 19, 'VCC', 'GND', false)
      ],
      solution: [
        { net: 'SIG', layer: 'F', w: 0.25, pts: [[4, 12], [2.2, 10.2], [2.2, 6], [3.2, 5], [30, 5], [34, 9], [34, 10], [32, 12]] },
        { net: 'VCC', layer: 'F', w: 0.25, pts: [[4, 9.5], [5.5, 8], [28, 8], [29, 9], [29, 10.5]] },
        { net: 'VCC', layer: 'F', w: 0.25, pts: [[20, 8], [20, 18.05], [21.05, 19]] },
        { net: 'GND', layer: 'F', w: 0.25, pts: [[4, 14.5], [10, 20.5], [21.45, 20.5], [22.95, 19]] },
        { net: 'GND', layer: 'F', w: 0.25, pts: [[22.95, 19], [27.45, 14.5], [28.45, 13.5], [29, 13.5]] }
      ]
    },
    {
      id: 'r3', title: 'Силовые цепи', icon: '⚡', xp: 120, w: 40, h: 26, layers: 1,
      goal: 'Разведите стабилизатор AMS1117. По цепям VIN, VOUT и GND течёт до 1 А — их дорожки должны быть не уже 1 мм.',
      hint: 'Выберите ширину 1,0 мм перед тем, как вести силовые цепи. GND к правой части платы проще провести поверху.',
      rules: { clearance: 0.3, edge: 0.5, widths: [0.25, 0.5, 1.0, 1.5], width: 1.0, minWidth: { VIN: 1.0, VOUT: 1.0, GND: 1.0 } },
      parts: [
        header('J1', 'IN', 4, [11.5, 14], ['GND', 'VIN'], 2.0),
        part('U1', 'AMS1117', [16.5, 9, 7, 9.5], [smd(20, 10.5, 3.6, 2.0, 'VOUT', '4'), smd(17.7, 17, 1.2, 2.0, 'GND', '1'), smd(20, 17, 1.2, 2.0, 'VOUT', '2'), smd(22.3, 17, 1.2, 2.0, 'VIN', '3')]),
        r0805('C1', '10u', 10, 14.7, 'GND', 'VIN', true, true),
        r0805('C2', '22u', 30, 9, 'GND', 'VOUT', true, true),
        header('J2', 'OUT', 36, [9, 11.5], ['GND', 'VOUT'], 2.0)
      ],
      solution: [
        { net: 'GND', layer: 'F', w: 1.0, pts: [[4, 11.5], [8.5, 11.5], [10, 13]] },
        { net: 'GND', layer: 'F', w: 1.0, pts: [[8.5, 11.5], [15, 11.5], [17.7, 14.2], [17.7, 17]] },
        { net: 'GND', layer: 'F', w: 1.0, pts: [[4, 11.5], [4, 5], [5, 4], [31, 4], [36, 9]] },
        { net: 'GND', layer: 'F', w: 1.0, pts: [[29, 4], [30, 5], [30, 7.5]] },
        { net: 'VIN', layer: 'F', w: 1.0, pts: [[4, 14], [6.2, 16.2], [10, 16.2]] },
        { net: 'VIN', layer: 'F', w: 1.0, pts: [[10, 16.2], [13.8, 20], [21, 20], [22.3, 18.7], [22.3, 17]] },
        { net: 'VOUT', layer: 'F', w: 1.0, pts: [[20, 17], [20, 10.5], [30, 10.5], [31, 11.5], [36, 11.5]] }
      ]
    },
    {
      id: 'r4', title: 'Два слоя и переходы', icon: '🔀', xp: 150, w: 34, h: 22, layers: 2,
      goal: 'Разъёмы J1 и J2 соединены «наоборот»: цепи A, B и C неизбежно пересекаются. Используйте нижний слой B.Cu и переходные отверстия (via).',
      hint: 'Выводные площадки разъёмов есть на обоих слоях. Клавиша V (или кнопка «Переход») ставит via и переключает слой прямо во время трассировки.',
      rules: { clearance: 0.3, edge: 0.5, widths: [0.25, 0.5, 1.0], width: 0.5, vias: 1 },
      parts: [
        header('J1', 'IN', 1.6, [7, 11, 15], ['A', 'B', 'C']),
        header('J2', 'OUT', 32.4, [7, 11, 15], ['C', 'B', 'A'])
      ],
      solution: [
        { net: 'A', layer: 'B', w: 0.5, pts: [[1.6, 7], [6, 7], [14, 15], [32.4, 15]] },
        { net: 'C', layer: 'F', w: 0.5, pts: [[1.6, 15], [18, 15], [26, 7], [32.4, 7]] },
        { net: 'B', layer: 'F', w: 0.5, pts: [[1.6, 11], [19, 11]] },
        { via: true, net: 'B', x: 19, y: 11 },
        { net: 'B', layer: 'B', w: 0.5, pts: [[19, 11], [32.4, 11]] }
      ]
    },
    {
      id: 'r5', title: 'Мигалка на NE555', icon: '🏁', xp: 220, w: 40, h: 30, layers: 2,
      goal: 'Финал: плата генератора на NE555 с шагом выводов 1,27 мм. Та же плата, что в просмотрщике Gerber, — её разводка проверена DRC KiCad.',
      hint: 'Выводы 2 и 6 (THRES) соединяются под корпусом микросхемы. Землю удобно собрать на нижнем слое через переходные отверстия.',
      rules: { clearance: 0.2, edge: 0.5, widths: [0.25, 0.3, 0.4, 0.5], width: 0.25 },
      holes: [{ x: 3.5, y: 3.5, r: 1.6 }, { x: 36.5, y: 3.5, r: 1.6 }, { x: 3.5, y: 26.5, r: 1.6 }, { x: 36.5, y: 26.5, r: 1.6 }],
      parts: [
        header('J1', '5V', 5, [13.73, 16.27], ['VCC', 'GND']),
        part('U1', 'NE555', [16.2, 12.3, 7.6, 5.4], [
          smd(17.525, 13.095, 1.95, 0.6, 'GND', '1'), smd(17.525, 14.365, 1.95, 0.6, 'THR', '2'), smd(17.525, 15.635, 1.95, 0.6, 'OUT', '3'), smd(17.525, 16.905, 1.95, 0.6, 'VCC', '4'),
          smd(22.475, 16.905, 1.95, 0.6, 'CTRL', '5'), smd(22.475, 15.635, 1.95, 0.6, 'THR', '6'), smd(22.475, 14.365, 1.95, 0.6, 'DIS', '7'), smd(22.475, 13.095, 1.95, 0.6, 'VCC', '8')]),
        r0805('R1', '10k', 28, 9, 'VCC', 'DIS', true),
        r0805('R2', '47k', 28, 13, 'DIS', 'THR', true),
        r0805('C1', '10u', 28, 20, 'THR', 'GND', true),
        r0805('C2', '10n', 24, 22, 'CTRL', 'GND', true),
        r0805('R3', '470', 12, 20, 'LED', 'OUT'),
        r0805('D1', 'LED', 8, 22, 'LED', 'GND', true)
      ],
      solution: [
        { net: 'VCC', layer: 'F', w: 0.5, pts: [[5, 13.73], [7.5, 11.23], [7.5, 8], [8.5, 7], [26, 7], [27.05, 8.05], [28, 8.05]] },
        { net: 'VCC', layer: 'F', w: 0.4, pts: [[23.5, 7], [23.5, 12.07], [22.475, 13.095]] },
        { net: 'VCC', layer: 'F', w: 0.3, pts: [[17.525, 16.905], [16.3, 16.905], [15.6, 17.6]] },
        { via: true, net: 'VCC', x: 15.6, y: 17.6 }, { via: true, net: 'VCC', x: 7.5, y: 9 },
        { net: 'VCC', layer: 'B', w: 0.4, pts: [[15.6, 17.6], [10.8, 12.8], [10.8, 10], [9.8, 9], [7.5, 9]] },
        { net: 'DIS', layer: 'F', w: 0.25, pts: [[22.475, 14.365], [24.6, 14.365], [26.9, 12.05], [28, 12.05]] },
        { net: 'DIS', layer: 'F', w: 0.25, pts: [[28, 9.95], [28, 12.05]] },
        { net: 'THR', layer: 'F', w: 0.25, pts: [[17.525, 14.365], [19, 14.365], [20.27, 15.635], [22.475, 15.635], [26.5, 15.635], [28, 14.135], [28, 13.95]] },
        { net: 'THR', layer: 'F', w: 0.25, pts: [[28, 13.95], [28, 19.05]] },
        { net: 'CTRL', layer: 'F', w: 0.25, pts: [[22.475, 16.905], [24, 18.43], [24, 21.05]] },
        { net: 'OUT', layer: 'F', w: 0.25, pts: [[17.525, 15.635], [15.2, 15.635], [13.5, 17.335], [13.5, 19.45], [12.95, 20]] },
        { net: 'LED', layer: 'F', w: 0.25, pts: [[11.05, 20], [9.05, 20], [8, 21.05]] },
        { net: 'GND', layer: 'F', w: 0.4, pts: [[17.525, 13.095], [15.8, 13.095]] }, { via: true, net: 'GND', x: 15.8, y: 13.095 },
        { net: 'GND', layer: 'F', w: 0.4, pts: [[28, 20.95], [28, 22.4]] }, { via: true, net: 'GND', x: 28, y: 22.4 },
        { net: 'GND', layer: 'F', w: 0.4, pts: [[24, 22.95], [24, 24.3]] }, { via: true, net: 'GND', x: 24, y: 24.3 },
        { net: 'GND', layer: 'F', w: 0.4, pts: [[8, 22.95], [8, 24.4]] }, { via: true, net: 'GND', x: 8, y: 24.4 },
        { net: 'GND', layer: 'B', w: 0.5, pts: [[5, 16.27], [5, 23.4], [6, 24.4], [8, 24.4], [24, 24.3], [25.9, 22.4], [28, 22.4]] },
        { net: 'GND', layer: 'B', w: 0.4, pts: [[15.8, 13.095], [18.2, 13.095], [19.2, 14.095], [19.2, 24.35]] }
      ]
    }
  ];

  R.VIA = { d: 0.8, drill: 0.4 };
  R.pads = function (lv) { return [].concat.apply([], lv.parts.map(function (p) { return p.pads.map(function (pd) { pd.ref = p.ref; return pd; }); })); };
  R.nets = function (lv) {
    var n = {};
    R.pads(lv).forEach(function (p) { (n[p.net] = n[p.net] || []).push(p); });
    return n;
  };

  /* ---------- геометрия ---------- */
  function dPS(px, py, x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0, L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L)) : 0;
    return Math.hypot(px - x0 - t * dx, py - y0 - t * dy);
  }
  function cross(ax, ay, bx, by, cx, cy) { return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax); }
  function dSS(a, b) {
    var d1 = cross(a[0], a[1], a[2], a[3], b[0], b[1]), d2 = cross(a[0], a[1], a[2], a[3], b[2], b[3]),
      d3 = cross(b[0], b[1], b[2], b[3], a[0], a[1]), d4 = cross(b[0], b[1], b[2], b[3], a[2], a[3]);
    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return 0;
    return Math.min(dPS(a[0], a[1], b[0], b[1], b[2], b[3]), dPS(a[2], a[3], b[0], b[1], b[2], b[3]), dPS(b[0], b[1], a[0], a[1], a[2], a[3]), dPS(b[2], b[3], a[0], a[1], a[2], a[3]));
  }
  // расстояние от отрезка до площадки (0 — касается/внутри)
  function dSPad(s, p) {
    if (p.shape === 'circle') return Math.max(0, dPS(p.x, p.y, s[0], s[1], s[2], s[3]) - p.w / 2);
    var x0 = p.x - p.w / 2, x1 = p.x + p.w / 2, y0 = p.y - p.h / 2, y1 = p.y + p.h / 2;
    function inside(x, y) { return x >= x0 && x <= x1 && y >= y0 && y <= y1; }
    if (inside(s[0], s[1]) || inside(s[2], s[3])) return 0;
    return Math.min(dSS(s, [x0, y0, x1, y0]), dSS(s, [x1, y0, x1, y1]), dSS(s, [x1, y1, x0, y1]), dSS(s, [x0, y1, x0, y0]));
  }
  function dPointPad(x, y, p) { return dSPad([x, y, x, y], p); }
  function padGap(a, b) { // приближённо: площадки как прямоугольники/круги
    if (a.shape === 'circle' && b.shape === 'circle') return Math.hypot(a.x - b.x, a.y - b.y) - a.w / 2 - b.w / 2;
    var q = a.shape === 'circle' ? a : b, r = q === a ? b : a;
    if (q.shape === 'circle') return dPointPad(q.x, q.y, r) - q.w / 2;
    var dx = Math.max(0, Math.abs(a.x - b.x) - (a.w + b.w) / 2), dy = Math.max(0, Math.abs(a.y - b.y) - (a.h + b.h) / 2);
    return Math.hypot(dx, dy);
  }
  R.geom = { dPS: dPS, dSS: dSS, dSPad: dSPad };

  /* ---------- сегменты и via из состояния ---------- */
  function flatten(lv, tracks, vias) {
    var segs = [];
    tracks.forEach(function (t, ti) {
      for (var i = 0; i < t.pts.length - 1; i++) segs.push({ s: [t.pts[i][0], t.pts[i][1], t.pts[i + 1][0], t.pts[i + 1][1]], w: t.w, layer: t.layer, net: t.net, ti: ti, i: i });
    });
    return segs;
  }

  /* ---------- связность: union-find по площадкам, дорожкам и via ---------- */
  R.connectivity = function (lv, tracks, vias) {
    var pads = R.pads(lv), n = pads.length + tracks.length + vias.length, par = [];
    for (var i = 0; i < n; i++) par[i] = i;
    function f(x) { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; }
    function u(a, b) { a = f(a); b = f(b); if (a !== b) par[a] = b; }
    var T0 = pads.length, V0 = T0 + tracks.length, eps = 0.005;
    var segs = flatten(lv, tracks, vias);
    segs.forEach(function (sg) {
      pads.forEach(function (p, pi) { if (p.net === sg.net && p.layers.indexOf(sg.layer) >= 0 && dSPad(sg.s, p) <= sg.w / 2 + eps) u(T0 + sg.ti, pi); });
      vias.forEach(function (v, vi) { if (v.net === sg.net && dPS(v.x, v.y, sg.s[0], sg.s[1], sg.s[2], sg.s[3]) <= sg.w / 2 + R.VIA.d / 2 + eps) u(T0 + sg.ti, V0 + vi); });
    });
    for (var a = 0; a < segs.length; a++) for (var b = a + 1; b < segs.length; b++) {
      var A = segs[a], B = segs[b];
      if (A.ti !== B.ti && A.net === B.net && A.layer === B.layer && dSS(A.s, B.s) <= (A.w + B.w) / 2 + eps) u(T0 + A.ti, T0 + B.ti);
    }
    vias.forEach(function (v, vi) { pads.forEach(function (p, pi) { if (p.net === v.net && dPointPad(v.x, v.y, p) <= R.VIA.d / 2 + eps) u(V0 + vi, pi); }); });
    var nets = {};
    pads.forEach(function (p, pi) { (nets[p.net] = nets[p.net] || []).push(pi); });
    var res = {};
    Object.keys(nets).forEach(function (k) {
      var roots = {};
      nets[k].forEach(function (pi) { roots[f(pi)] = true; });
      res[k] = { done: Object.keys(roots).length === 1, groups: Object.keys(roots).length, pads: nets[k].map(function (pi) { return pads[pi]; }), root: nets[k].map(f) };
    });
    // «воздушные» линии: минимальное остовное дерево между группами площадок
    var rats = [];
    Object.keys(res).forEach(function (k) {
      var r = res[k]; if (r.done) return;
      var gid = r.root.slice(), edges = [];
      for (var i = 0; i < r.pads.length; i++) for (var j = i + 1; j < r.pads.length; j++) if (gid[i] !== gid[j]) edges.push([Math.hypot(r.pads[i].x - r.pads[j].x, r.pads[i].y - r.pads[j].y), i, j]);
      edges.sort(function (x, y) { return x[0] - y[0]; });
      var g = {}; gid.forEach(function (x) { g[x] = x; });
      function gf(x) { while (g[x] !== x) x = g[x]; return x; }
      edges.forEach(function (e) {
        var a = gf(gid[e[1]]), b = gf(gid[e[2]]);
        if (a !== b) { g[a] = b; rats.push({ net: k, a: r.pads[e[1]], b: r.pads[e[2]] }); }
      });
    });
    return { nets: res, rats: rats, trackRoot: tracks.map(function (t, i) { return f(T0 + i); }), padRoot: pads.map(function (p, i) { return f(i); }) };
  };

  /* ---------- DRC ---------- */
  R.drc = function (lv, tracks, vias) {
    var rules = lv.rules, cl = rules.clearance, out = [], pads = R.pads(lv), segs = flatten(lv, tracks, vias), seen = {};
    function add(sev, x, y, msg, key) {
      if (key && seen[key]) return; if (key) seen[key] = 1;
      out.push({ sev: sev, x: x, y: y, msg: msg });
    }
    function mid(s) { return [(s[0] + s[2]) / 2, (s[1] + s[3]) / 2]; }
    function near(s, x, y) { // точка отрезка, ближайшая к (x, y)
      var dx = s[2] - s[0], dy = s[3] - s[1], L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, ((x - s[0]) * dx + (y - s[1]) * dy) / L)) : 0;
      return [s[0] + t * dx, s[1] + t * dy];
    }
    function verdict(gap, what, x, y, key) {
      if (gap <= 1e-6) add('error', x, y, 'Короткое замыкание: ' + what, key);
      else if (gap < cl - 1e-6) add('error', x, y, 'Зазор ' + gap.toFixed(2).replace('.', ',') + ' мм < ' + String(cl).replace('.', ',') + ' мм: ' + what, key);
    }
    // дорожка — дорожка
    for (var a = 0; a < segs.length; a++) for (var b = a + 1; b < segs.length; b++) {
      var A = segs[a], B = segs[b];
      if (A.layer !== B.layer || A.net === B.net) continue;
      var g = dSS(A.s, B.s) - (A.w + B.w) / 2;
      if (g < cl - 1e-6) { var p = near(A.s, (B.s[0] + B.s[2]) / 2, (B.s[1] + B.s[3]) / 2); verdict(g, A.net + ' и ' + B.net, p[0], p[1], 'tt' + A.ti + '-' + B.ti); }
    }
    segs.forEach(function (S) {
      pads.forEach(function (P) {
        if (P.net === S.net || P.layers.indexOf(S.layer) < 0) return;
        var g = dSPad(S.s, P) - S.w / 2;
        if (g < cl - 1e-6) verdict(g, 'дорожка ' + S.net + ' и площадка ' + P.ref + '.' + P.name + ' (' + P.net + ')', P.x, P.y, 'tp' + S.ti + '-' + P.ref + P.name);
      });
      vias.forEach(function (V, vi) {
        if (V.net === S.net) return;
        var g = dPS(V.x, V.y, S.s[0], S.s[1], S.s[2], S.s[3]) - S.w / 2 - R.VIA.d / 2;
        if (g < cl - 1e-6) verdict(g, 'дорожка ' + S.net + ' и переход ' + V.net, V.x, V.y, 'tv' + S.ti + '-' + vi);
      });
      (lv.holes || []).forEach(function (H, hi) {
        var g = dPS(H.x, H.y, S.s[0], S.s[1], S.s[2], S.s[3]) - S.w / 2 - H.r;
        if (g < cl - 1e-6) { var p = near(S.s, H.x, H.y); add('error', p[0], p[1], 'Дорожка ' + S.net + ' задевает крепёжное отверстие', 'th' + S.ti + '-' + hi); }
      });
      [[S.s[0], S.s[1]], [S.s[2], S.s[3]]].forEach(function (q) {
        var g = Math.min(q[0], q[1], lv.w - q[0], lv.h - q[1]) - S.w / 2;
        if (g < rules.edge - 1e-6) add('error', q[0], q[1], 'Дорожка ' + S.net + ' ближе ' + String(rules.edge).replace('.', ',') + ' мм к краю платы', 'te' + S.ti);
      });
    });
    vias.forEach(function (V, vi) {
      pads.forEach(function (P) {
        if (P.net === V.net) return;
        var g = dPointPad(V.x, V.y, P) - R.VIA.d / 2;
        if (g < cl - 1e-6) verdict(g, 'переход ' + V.net + ' и площадка ' + P.ref + '.' + P.name, V.x, V.y, 'vp' + vi + P.ref + P.name);
      });
      vias.forEach(function (W, wi) {
        if (wi <= vi || W.net === V.net) return;
        var g = Math.hypot(V.x - W.x, V.y - W.y) - R.VIA.d;
        if (g < cl - 1e-6) verdict(g, 'переходы ' + V.net + ' и ' + W.net, V.x, V.y, 'vv' + vi + '-' + wi);
      });
      (lv.holes || []).forEach(function (H) { if (Math.hypot(V.x - H.x, V.y - H.y) - H.r - R.VIA.d / 2 < cl) add('error', V.x, V.y, 'Переход слишком близко к крепёжному отверстию'); });
      if (Math.min(V.x, V.y, lv.w - V.x, lv.h - V.y) - R.VIA.d / 2 < rules.edge) add('error', V.x, V.y, 'Переход у самого края платы');
    });
    // ширина силовых цепей
    tracks.forEach(function (t, ti) {
      var mw = rules.minWidth && rules.minWidth[t.net];
      if (mw && t.w < mw - 1e-6) { var m = mid([t.pts[0][0], t.pts[0][1], t.pts[1][0], t.pts[1][1]]); add('error', m[0], m[1], 'Цепь ' + t.net + ' — силовая: нужна ширина от ' + String(mw).replace('.', ',') + ' мм, а дорожка ' + String(t.w).replace('.', ',') + ' мм', 'w' + ti); }
      // углы
      for (var i = 1; i < t.pts.length - 1; i++) {
        var p0 = t.pts[i - 1], p1 = t.pts[i], p2 = t.pts[i + 1];
        var ax = p0[0] - p1[0], ay = p0[1] - p1[1], bx = p2[0] - p1[0], by = p2[1] - p1[1];
        var la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
        if (la < 1e-6 || lb < 1e-6) continue;
        // излом внутри площадки или перехода своей цепи — не считается
        if (pads.some(function (P) { return P.net === t.net && dPointPad(p1[0], p1[1], P) === 0; }) || vias.some(function (V) { return V.net === t.net && Math.hypot(V.x - p1[0], V.y - p1[1]) <= R.VIA.d / 2; })) continue;
        var cos = (ax * bx + ay * by) / la / lb;
        if (cos > 0.05) add('warn', p1[0], p1[1], 'Острый угол на цепи ' + t.net + ' — кислотные ловушки при травлении');
        else if (Math.abs(cos) <= 0.05) add('warn', p1[0], p1[1], 'Прямой угол на цепи ' + t.net + ' — лучше два излома по 45°');
      }
    });
    return out;
  };

  /* ---------- итог уровня ---------- */
  R.length = function (tracks) {
    return tracks.reduce(function (s, t) { for (var i = 1; i < t.pts.length; i++) s += Math.hypot(t.pts[i][0] - t.pts[i - 1][0], t.pts[i][1] - t.pts[i - 1][1]); return s; }, 0);
  };
  R.split = function (items) {
    return { tracks: items.filter(function (x) { return !x.via; }), vias: items.filter(function (x) { return x.via; }) };
  };
  R.evaluate = function (lv, tracks, vias) {
    var con = R.connectivity(lv, tracks, vias), drc = R.drc(lv, tracks, vias);
    var nets = Object.keys(con.nets), done = nets.filter(function (k) { return con.nets[k].done; });
    var errors = drc.filter(function (d) { return d.sev === 'error'; }), warns = drc.filter(function (d) { return d.sev === 'warn'; });
    var sol = R.split(lv.solution), best = R.length(sol.tracks), len = R.length(tracks);
    var complete = done.length === nets.length && !errors.length;
    var stars = 0;
    if (complete) {
      stars = 1;
      if (len <= best * 1.25 + 2 && vias.length <= Math.max(sol.vias.length, lv.rules.vias || 0)) stars++;
      if (!warns.length) stars++;
    }
    return { con: con, drc: drc, errors: errors, warns: warns, nets: nets, done: done, complete: complete, stars: stars, length: len, best: best };
  };

  /* ---------- построение дорожки под 45° (как «поза» в KiCad) ---------- */
  R.bend = function (x0, y0, x1, y1, diagFirst) {
    var dx = x1 - x0, dy = y1 - y0, ax = Math.abs(dx), ay = Math.abs(dy), sx = Math.sign(dx), sy = Math.sign(dy);
    // почти прямо или почти 45° — один отрезок, без изломов в доли миллиметра (площадки не всегда стоят на сетке)
    if (ax < 0.25 || ay < 0.25 || Math.abs(ax - ay) < 0.25) return [[x1, y1]];
    var d = Math.min(ax, ay), mid;
    if (!diagFirst) mid = ax > ay ? [x1 - sx * d, y0] : [x0, y1 - sy * d];
    else mid = [x0 + sx * d, y0 + sy * d];
    return [mid, [x1, y1]];
  };

  root.KM = root.KM || {};
  root.KM.routing = R;
})(typeof window !== 'undefined' ? window : globalThis);
