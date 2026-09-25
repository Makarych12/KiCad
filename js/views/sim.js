/* Интерактивный симулятор схем */
(function () {
  var COLS = 16, ROWS = 10, S = 50, M = 30;
  var W = M * 2 + (COLS - 1) * S, H = M * 2 + (ROWS - 1) * S;
  var TOOLS = [
    { id: 'select', name: 'Выбор', hint: 'Щелчок — выбрать деталь, щелчок по ключу — переключить' },
    { id: 'wire', name: 'Провод', hint: 'Тяните от узла к узлу' },
    { id: 'R', name: 'Резистор', hint: 'Тяните от узла к узлу', def: 330 },
    { id: 'V', name: 'Батарея', hint: 'Тяните от «минуса» к «плюсу»', def: 5 },
    { id: 'LED', name: 'Светодиод', hint: 'Тяните от анода (+) к катоду (−)' },
    { id: 'D', name: 'Диод', hint: 'Тяните от анода к катоду' },
    { id: 'SW', name: 'Ключ', hint: 'Тяните; в режиме «Выбор» щелчок переключает' },
    { id: 'LAMP', name: 'Лампа', hint: 'Лампа накаливания 6 В 0,6 Вт (≈60 Ом)', def: 60 },
    { id: 'C', name: 'Конденсатор', hint: 'Тяните; ёмкость меняется справа', def: 100e-6 },
    { id: 'AM', name: 'Амперметр', hint: 'Включается в разрыв цепи' },
    { id: 'GND', name: 'Земля', hint: 'Щелчок по узлу — точка 0 В' },
    { id: 'erase', name: 'Ластик', hint: 'Щелчок по детали — удалить' }
  ];
  var UNITS = { R: 'Ом', V: 'В', LAMP: 'Ом', C: 'Ф' };
  var PREFIX = { wire: 'W', R: 'R', V: 'BT', LED: 'D', D: 'VD', SW: 'SW', LAMP: 'HL', C: 'C', AM: 'PA', GND: 'GND' };

  function k(c, r) { return c + ',' + r; }
  function xy(key) { var p = key.split(','); return [M + p[0] * S, M + p[1] * S]; }

  var PRESETS = {
    led: { name: 'Светодиод с резистором', parts: [['V', '2,6', '2,2', 5], ['R', '2,2', '7,2', 330], ['LED', '7,2', '7,6', 0, 'red'], ['wire', '7,6', '2,6']] },
    burn: { name: 'Светодиод без резистора 💥', parts: [['V', '2,6', '2,2', 5], ['wire', '2,2', '7,2'], ['LED', '7,2', '7,6', 0, 'green'], ['wire', '7,6', '2,6']] },
    divider: { name: 'Делитель напряжения', parts: [['V', '2,7', '2,2', 9], ['R', '2,2', '6,2', 10000], ['R', '6,2', '6,7', 10000], ['wire', '6,7', '2,7'], ['wire', '6,2', '10,2'], ['R', '10,2', '10,7', 100000], ['wire', '10,7', '6,7']] },
    series: { name: 'Последовательно и параллельно', parts: [['V', '1,7', '1,2', 12], ['AM', '1,2', '3,2'], ['R', '3,2', '5,2', 100], ['wire', '5,2', '9,2'], ['R', '5,2', '5,7', 220], ['R', '9,2', '9,7', 220], ['wire', '5,7', '9,7'], ['wire', '5,7', '1,7']] },
    rc: { name: 'Заряд конденсатора (τ = 1 с)', parts: [['V', '2,7', '2,2', 5], ['SW', '2,2', '5,2', 0, null, true], ['R', '5,2', '9,2', 100000], ['C', '9,2', '9,7', 10e-6], ['wire', '9,7', '2,7'], ['R', '9,2', '13,2', 1e6], ['wire', '13,2', '13,7'], ['wire', '13,7', '9,7']] },
    lamps: { name: 'Лампы и ключи', parts: [['V', '2,7', '2,2', 6], ['SW', '2,2', '6,2', 0, null, true], ['LAMP', '6,2', '6,7', 60], ['wire', '6,2', '10,2'], ['SW', '10,2', '10,4', 0, null, false], ['LAMP', '10,4', '10,7', 60], ['wire', '10,7', '6,7'], ['wire', '6,7', '2,7']] },
    diode: { name: 'Диод: прямое и обратное включение', parts: [['V', '2,7', '2,2', 5], ['R', '2,2', '6,2', 1000], ['D', '6,2', '6,7'], ['wire', '6,7', '2,7'], ['wire', '2,2', '2,1'], ['wire', '2,1', '11,1'], ['R', '11,1', '11,4', 1000], ['D', '11,7', '11,4'], ['wire', '11,7', '6,7']] }
  };

  var st = null; // состояние экрана симулятора

  function newState() {
    return { parts: [], tool: 'select', sel: null, run: true, speed: 1, circuit: new KM.Sim.Circuit(), dirty: true, lastRes: null, drag: null, hover: null, scope: [], raf: 0, counters: {}, flow: {}, msg: null };
  }
  function label(type) { st.counters[type] = (st.counters[type] || 0) + 1; return PREFIX[type] + st.counters[type]; }
  function addPart(type, a, b, value, color, on) {
    var t = TOOLS.find(function (x) { return x.id === type; });
    var p = { id: KM.uid(), type: type, a: a, b: b || a, value: value != null && value !== 0 ? value : (t && t.def) || 0, label: label(type) };
    if (type === 'LED') p.color = color || 'red';
    if (type === 'SW') p.on = on !== undefined ? on : true;
    // одинаковые концы — заменяем
    st.parts = st.parts.filter(function (x) { return !(x.type !== 'GND' && type !== 'GND' && ((x.a === p.a && x.b === p.b) || (x.a === p.b && x.b === p.a))); });
    if (type === 'GND') st.parts = st.parts.filter(function (x) { return x.type !== 'GND'; });
    st.parts.push(p); st.dirty = true;
    return p;
  }
  function loadPreset(id) {
    st.parts = []; st.counters = {}; st.sel = null; st.circuit.reset(); st.scope = [];
    PRESETS[id].parts.forEach(function (x) { addPart(x[0], x[1], x[2], x[3], x[4], x[5]); });
    st.dirty = true;
  }

  /* ---------- отрисовка деталей ---------- */
  function partSvg(p, res) {
    var A = xy(p.a), B = xy(p.b);
    if (p.type === 'GND') return '<g data-id="' + p.id + '" class="part"><path d="M' + A[0] + ' ' + A[1] + 'v10m-12 0h24m-18 6h12m-6 6h0" stroke="var(--text)" stroke-width="2.5" fill="none"/><text x="' + (A[0] + 14) + '" y="' + (A[1] + 22) + '" font-size="11" fill="var(--text-3)">0 В</text></g>';
    var dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI;
    var cx = (A[0] + B[0]) / 2, cy = (A[1] + B[1]) / 2, sel = st.sel === p.id;
    var col = 'var(--text)', body = '', h = 16;
    var lead = function (w) { return '<line x1="' + (-L / 2) + '" y1="0" x2="' + (-w / 2) + '" y2="0"/><line x1="' + (w / 2) + '" y1="0" x2="' + (L / 2) + '" y2="0"/>'; };
    var I = res ? res.i : 0;
    switch (p.type) {
      case 'wire': body = '<line x1="' + (-L / 2) + '" y1="0" x2="' + (L / 2) + '" y2="0"/>'; break;
      case 'R': body = lead(36) + '<rect x="-18" y="-8" width="36" height="16" rx="2" fill="var(--surface)"/>'; break;
      case 'LAMP': {
        var pw = res ? res.p : 0, glow = Math.min(1, pw / 0.6);
        body = lead(30) + (glow > 0.02 ? '<circle r="' + (18 + 14 * glow) + '" fill="#ffd54a" opacity="' + (0.25 + 0.5 * glow) + '" stroke="none"/>' : '') + '<circle r="14" fill="var(--surface)"/><path d="M-10 -10L10 10M10 -10L-10 10"/>'; break;
      }
      case 'V': body = lead(16) + '<line x1="6" y1="-16" x2="6" y2="16" stroke-width="3"/><line x1="-6" y1="-9" x2="-6" y2="9" stroke-width="6"/>' +
        '<text x="18" y="-18" font-size="14" fill="#e23" stroke="none" transform="rotate(' + (-ang) + ' 18 -18)">+</text>'; break;
      case 'LED': case 'D': {
        var on = p.type === 'LED' && !p.burned ? Math.min(1, Math.max(0, (I - 0.0003) / 0.015)) : 0;
        var lc = { red: '#ff3030', green: '#27d04a', blue: '#3a7bff', yellow: '#ffd21f', white: '#ffffff', orange: '#ff8a1f' }[p.color] || '#ff3030';
        body = lead(24) + (on > 0 ? '<circle r="' + (14 + 16 * on) + '" fill="' + lc + '" opacity="' + (0.2 + 0.55 * on) + '" stroke="none"/>' : '') +
          '<path d="M-12 -11 L12 0 L-12 11 Z" fill="' + (p.type === 'LED' ? (p.burned ? '#555' : lc) : 'var(--surface)') + '" fill-opacity="' + (p.type === 'LED' ? 0.35 + 0.65 * on : 1) + '"/><line x1="12" y1="-11" x2="12" y2="11"/>' +
          (p.type === 'LED' ? '<path d="M0 -14l6 -8m-4 1l4 -1 0 4M8 -12l6 -8m-4 1l4 -1 0 4" stroke-width="1.5" fill="none"/>' : '') +
          (p.burned ? '<text x="0" y="28" font-size="16" text-anchor="middle" stroke="none" transform="rotate(' + (-ang) + ' 0 28)">💥</text>' : '');
        break;
      }
      case 'SW': body = lead(36) + '<circle cx="-18" cy="0" r="3" fill="var(--text)"/><circle cx="18" cy="0" r="3" fill="var(--text)"/>' + (p.on ? '<line x1="-18" y1="0" x2="18" y2="-2"/>' : '<line x1="-18" y1="0" x2="14" y2="-18"/>'); h = 20; break;
      case 'C': body = lead(10) + '<line x1="-5" y1="-14" x2="-5" y2="14" stroke-width="3"/><line x1="5" y1="-14" x2="5" y2="14" stroke-width="3"/>'; break;
      case 'AM': body = lead(30) + '<circle r="15" fill="var(--surface)"/><text y="5" font-size="14" text-anchor="middle" stroke="none" fill="var(--text)" transform="rotate(' + (-ang) + ')">A</text>'; break;
    }
    // «бегущие» точки тока
    var dots = '';
    if (res && Math.abs(res.i) > 1e-6 && p.type !== 'C' && !(p.type === 'SW' && !p.on)) {
      var off = st.flow[p.id] || 0;
      dots = '<line x1="' + (-L / 2) + '" y1="0" x2="' + (L / 2) + '" y2="0" stroke="#ffcc00" stroke-width="4" stroke-dasharray="3 17" stroke-dashoffset="' + off.toFixed(1) + '" stroke-linecap="round" opacity=".9" class="flow"/>';
    }
    var lbl = '<text x="0" y="' + (-(h + 8)) + '" font-size="13" text-anchor="middle" fill="var(--text-2)" stroke="none" transform="rotate(' + (ang > 90 || ang < -90 ? 180 : 0) + ' 0 ' + (-(h + 8)) + ')">' + KM.esc(p.type === 'wire' ? '' : p.label + (valueText(p) ? ' ' + valueText(p) : '')) + '</text>';
    return '<g data-id="' + p.id + '" class="part" transform="translate(' + cx + ' ' + cy + ') rotate(' + ang + ')" stroke="' + col + '" stroke-width="2.5" fill="none" stroke-linecap="round">' +
      '<line x1="' + (-L / 2) + '" y1="0" x2="' + (L / 2) + '" y2="0" stroke="transparent" stroke-width="18" class="hit"/>' +
      (sel ? '<line x1="' + (-L / 2) + '" y1="0" x2="' + (L / 2) + '" y2="0" stroke="var(--accent)" stroke-width="12" opacity=".25"/>' : '') + body + dots + lbl + '</g>';
  }
  function valueText(p) {
    if (p.type === 'R' || p.type === 'LAMP') return KM.si(p.value, 'Ом');
    if (p.type === 'V') return KM.si(p.value, 'В');
    if (p.type === 'C') return KM.si(p.value, 'Ф');
    if (p.type === 'AM' && st.lastRes && st.lastRes[p.id]) return KM.si(Math.abs(st.lastRes[p.id].i), 'А');
    return '';
  }

  function drawBoard(root) {
    var svg = KM.$('#simSvg', root); if (!svg) return;
    var res = st.circuit.results, V = st.circuit.v, vmax = 0.001;
    Object.keys(V).forEach(function (key) { if (key.indexOf(':') < 0) vmax = Math.max(vmax, Math.abs(V[key])); });
    var nodes = '';
    var used = {};
    st.parts.forEach(function (p) { used[p.a] = 1; used[p.b] = 1; });
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      var key = k(c, r), P = xy(key);
      if (used[key] && V[key] !== undefined) {
        var t = Math.max(0, Math.min(1, V[key] / vmax)), hue = 220 - 220 * t;
        nodes += '<circle cx="' + P[0] + '" cy="' + P[1] + '" r="5" fill="hsl(' + hue + ' 80% 55%)"/>';
      } else nodes += '<circle cx="' + P[0] + '" cy="' + P[1] + '" r="2.2" fill="var(--border-strong)"/>';
    }
    var ghost = '';
    if (st.drag && st.drag.end && st.drag.end !== st.drag.start) {
      var a = xy(st.drag.start), b = xy(st.drag.end);
      ghost = '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="var(--accent)" stroke-width="4" stroke-dasharray="8 6" opacity=".7"/>';
    }
    var hov = '';
    if (st.hover && V[st.hover] !== undefined) {
      var h = xy(st.hover), txt = KM.si(V[st.hover], 'В');
      hov = '<g><rect x="' + (h[0] + 8) + '" y="' + (h[1] - 30) + '" width="' + (txt.length * 7.5 + 14) + '" height="22" rx="5" fill="#1d1d1f" opacity=".9"/><text x="' + (h[0] + 15) + '" y="' + (h[1] - 15) + '" font-size="12" fill="#fff" font-family="monospace">' + txt + '</text></g>';
    }
    svg.innerHTML = '<rect width="' + W + '" height="' + H + '" fill="var(--surface)"/>' + nodes + st.parts.map(function (p) { return partSvg(p, res[p.id]); }).join('') + ghost + hov;
  }

  function drawPanel(root) {
    var box = KM.$('#simSel', root); if (!box) return;
    var p = st.parts.find(function (x) { return x.id === st.sel; });
    if (!p) { box.innerHTML = '<div class="small muted">Выберите деталь инструментом «Выбор», чтобы изменить номинал и увидеть напряжение, ток и мощность.</div>'; return; }
    var r = st.circuit.results[p.id] || { v: 0, i: 0, p: 0 };
    var editable = p.type === 'R' || p.type === 'V' || p.type === 'LAMP' || p.type === 'C';
    box.innerHTML = '<div class="row between"><b>' + KM.esc(p.label) + '</b><span class="tag">' + KM.esc((TOOLS.find(function (t) { return t.id === p.type; }) || {}).name || p.type) + '</span></div>' +
      (editable ? '<div class="field" style="margin-top:8px"><label for="pval">Номинал</label><div class="input-unit"><input type="text" id="pval" value="' + KM.esc(KM.si(p.value, '').trim()) + '"><span>' + UNITS[p.type] + '</span></div><div class="tiny">Можно писать 4k7, 100n, 2.2М</div></div>' : '') +
      (p.type === 'LED' ? '<div class="field" style="margin-top:8px"><label for="pcol">Цвет</label><select id="pcol">' + Object.keys(KM.Sim.LED_VF).map(function (c) { return '<option value="' + c + '"' + (p.color === c ? ' selected' : '') + '>' + ({ red: 'Красный', orange: 'Оранжевый', yellow: 'Жёлтый', green: 'Зелёный', blue: 'Синий', white: 'Белый' })[c] + ' (≈' + KM.Sim.LED_VF[c] + ' В)</option>'; }).join('') + '</select></div>' : '') +
      (p.type === 'SW' ? '<button class="btn sm" id="ptog" style="margin-top:8px">' + (p.on ? 'Разомкнуть' : 'Замкнуть') + '</button>' : '') +
      (p.type !== 'GND' ? '<div class="sim-readout" style="margin-top:10px"><div><span>Напряжение</span><b>' + KM.si(Math.abs(r.v), 'В') + '</b></div><div><span>Ток</span><b>' + KM.si(Math.abs(r.i), 'А') + '</b></div><div><span>Мощность</span><b>' + KM.si(r.p, 'Вт') + '</b></div></div>' : '') +
      '<div class="row" style="margin-top:10px">' + (p.type !== 'GND' ? '<button class="btn sm" id="pflip" title="Поменять выводы местами">⇄ Развернуть</button>' : '') + (p.burned ? '<button class="btn sm" id="pfix">🔧 Заменить</button>' : '') + '<button class="btn sm danger" id="pdel">Удалить</button></div>';
    var pv = KM.$('#pval', box);
    if (pv) pv.onchange = function () { var v = KM.parseSI(pv.value); if (isFinite(v) && v > 0) { p.value = v; st.dirty = true; } else { KM.ui.toast('Не понял значение', 'Пример: 4k7, 100n, 12', '⚠️'); } };
    var pc = KM.$('#pcol', box); if (pc) pc.onchange = function () { p.color = pc.value; st.dirty = true; };
    var tg = KM.$('#ptog', box); if (tg) tg.onclick = function () { p.on = !p.on; st.dirty = true; drawPanel(root); };
    var fl = KM.$('#pflip', box); if (fl) fl.onclick = function () { var t = p.a; p.a = p.b; p.b = t; st.dirty = true; };
    var fx = KM.$('#pfix', box); if (fx) fx.onclick = function () { p.burned = false; st.dirty = true; drawPanel(root); };
    KM.$('#pdel', box).onclick = function () { st.parts = st.parts.filter(function (x) { return x !== p; }); st.sel = null; st.dirty = true; drawPanel(root); };
  }

  function drawStatus(root, r) {
    var el = KM.$('#simStatus', root); if (!el) return;
    if (!st.parts.length) { el.className = 'sim-status callout tip'; el.innerHTML = 'Выберите деталь слева и протяните её между точками сетки. Или загрузите пример.'; return; }
    if (!r.ok) { el.className = 'sim-status callout danger'; el.textContent = r.error; return; }
    var w = (r.warnings || []).concat(st.msg ? [st.msg] : []);
    if (w.length) { el.className = 'sim-status callout warn'; el.innerHTML = w.map(function (x) { return '⚠️ ' + KM.esc(x.text); }).join('<br>'); return; }
    el.className = 'sim-status callout ok';
    el.textContent = '✅ Схема рассчитана. Наведите на узел, чтобы увидеть напряжение' + (st.parts.some(function (p) { return p.type === 'C'; }) ? '. Время: ' + st.circuit.t.toFixed(2) + ' с' : '') + '.';
  }

  function drawScope(root) {
    var svg = KM.$('#scope', root); if (!svg) return;
    var d = st.scope, wmax = 0.001;
    d.forEach(function (v) { wmax = Math.max(wmax, Math.abs(v)); });
    var pts = d.map(function (v, i) { return (i / 300 * 240).toFixed(1) + ',' + (90 - Math.abs(v) / wmax * 80).toFixed(1); }).join(' ');
    svg.innerHTML = '<rect width="240" height="100" fill="#0c1a14"/><g stroke="#1f3b2f">' + [20, 40, 60, 80].map(function (y) { return '<line x1="0" y1="' + y + '" x2="240" y2="' + y + '"/>'; }).join('') + '</g>' +
      (pts ? '<polyline points="' + pts + '" fill="none" stroke="#3ccf95" stroke-width="2"/>' : '') + '<text x="4" y="12" font-size="10" fill="#8fc">' + KM.si(wmax, 'В') + '</text>';
  }

  /* ---------- цикл симуляции ---------- */
  function loop(root) {
    var last = performance.now();
    function frame(now) {
      var dtReal = Math.min(0.05, (now - last) / 1000); last = now;
      var hasC = st.parts.some(function (p) { return p.type === 'C'; });
      var r = st.lastStep;
      if (st.run && (hasC || st.dirty)) {
        var sub = hasC ? Math.max(1, Math.round(dtReal * 1000 * st.speed / 2)) : 1;
        for (var i = 0; i < Math.min(sub, 200); i++) r = st.circuit.step(st.parts, 0.002);
        if (r && r.warnings && r.warnings.some(function (w) { return /сгорел/.test(w.text); })) { KM.store.state.simBurn = true; KM.game.check(); }
        if (st.dirty) { KM.store.state.simRuns++; KM.store.touch(); if (KM.store.state.simRuns === 1) KM.game.check(); }
        st.dirty = false; st.lastStep = r; st.lastRes = st.circuit.results;
        var sp = st.parts.find(function (x) { return x.id === st.sel; });
        if (sp && st.circuit.results[sp.id]) { st.scope.push(st.circuit.results[sp.id].v); if (st.scope.length > 300) st.scope.shift(); }
        drawStatus(root, r || { ok: true });
        drawPanelReadout(root);
      }
      // анимация тока
      Object.keys(st.circuit.results).forEach(function (id) {
        var i = st.circuit.results[id].i, v = Math.sign(i) * Math.min(120, 12 + Math.log10(1 + Math.abs(i) * 1e4) * 25);
        if (Math.abs(i) < 1e-6) v = 0;
        st.flow[id] = ((st.flow[id] || 0) - v * dtReal) % 20;
      });
      drawBoard(root);
      if (hasC || st.sel) drawScope(root);
      st.raf = requestAnimationFrame(frame);
    }
    st.raf = requestAnimationFrame(frame);
  }
  var panelTick = 0;
  function drawPanelReadout(root) { if (++panelTick % 6 === 0 && !document.activeElement.closest('#simSel')) drawPanel(root); }

  /* ---------- ввод ---------- */
  function nodeAt(svg, ev) {
    var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    var p = pt.matrixTransform(svg.getScreenCTM().inverse());
    var c = Math.round((p.x - M) / S), r = Math.round((p.y - M) / S);
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return null;
    if (Math.hypot(p.x - (M + c * S), p.y - (M + r * S)) > S * 0.45) return { key: k(c, r), near: false, x: p.x, y: p.y };
    return { key: k(c, r), near: true, x: p.x, y: p.y, c: c, r: r };
  }
  function partAt(ev) { var g = ev.target.closest && ev.target.closest('.part'); return g ? st.parts.find(function (x) { return x.id === g.dataset.id; }) : null; }

  KM.views.sim = {
    render: function () {
      return '<div class="page" style="max-width:1400px"><div class="page-head"><div class="eyebrow">Раздел 6</div><h1>Интерактивный симулятор</h1>' +
        '<p>Соберите цепь прямо в браузере: батареи, резисторы, светодиоды, диоды, лампы, ключи, конденсаторы. Симулятор решает уравнения Кирхгофа (метод узловых потенциалов), показывает напряжения, токи и мощность, анимирует ток и может «сжечь» светодиод без резистора.</p></div>' +
        '<div class="sim-wrap"><div><div class="sim-tools" role="toolbar" aria-label="Инструменты">' + TOOLS.map(function (t) {
          return '<button class="sim-tool" data-tool="' + t.id + '" aria-pressed="false" title="' + KM.esc(t.hint) + '">' + toolIcon(t.id) + t.name + '</button>';
        }).join('') + '</div>' +
        '<div class="card flat" style="margin-top:12px;padding:12px"><div class="small muted" style="font-weight:700;margin-bottom:6px">Примеры</div><div class="stack" style="--gap:6px">' +
          Object.keys(PRESETS).map(function (id) { return '<button class="btn sm" style="width:100%;justify-content:flex-start" data-preset="' + id + '">' + KM.esc(PRESETS[id].name) + '</button>'; }).join('') +
        '</div></div></div>' +
        '<div><div class="sim-board"><svg id="simSvg" viewBox="0 0 ' + W + ' ' + H + '" role="application" aria-label="Монтажное поле симулятора"></svg></div>' +
          '<div class="row" style="margin-top:10px"><button class="btn sm" id="simRun">⏸ Пауза</button><label class="small">Скорость времени <select id="simSpeed"><option value="0.25">0,25×</option><option value="1" selected>1×</option><option value="4">4×</option><option value="16">16×</option></select></label>' +
          '<button class="btn sm" id="simReset">↺ Сброс (разрядить C)</button><button class="btn sm danger" id="simClear">🗑 Очистить</button><span style="flex:1"></span>' +
          '<button class="btn sm" id="simSave">💾 Сохранить</button><button class="btn sm" id="simLoad">📂 Мои схемы</button><button class="btn sm" id="simExport">⬇️ JSON</button><button class="btn sm" id="simImport">⬆️ Загрузить</button><input type="file" id="simFile" accept=".json" hidden></div>' +
          '<div id="simStatus" class="sim-status callout tip" style="margin-top:10px" aria-live="polite"></div></div>' +
        '<div class="sim-panel"><div class="card"><div class="small muted" style="font-weight:700;margin-bottom:6px">Выбранная деталь</div><div id="simSel"></div></div>' +
          '<div class="card"><div class="small muted" style="font-weight:700;margin-bottom:6px">Осциллограф (напряжение на выбранной детали)</div><svg id="scope" viewBox="0 0 240 100" style="width:100%;border-radius:6px"></svg></div>' +
          '<div class="card"><div class="small muted" style="font-weight:700;margin-bottom:6px">Подсказки</div><ul class="small" style="padding-left:18px;margin:0"><li>Узлы окрашены по напряжению: синий — 0 В, красный — максимум.</li><li>Жёлтые точки показывают направление тока (от плюса к минусу).</li><li><kbd>Del</kbd> — удалить выбранное, <kbd>Esc</kbd> — отмена.</li><li>Модели упрощены: светодиоды и диоды — по Шокли, лампа — постоянное сопротивление.</li></ul></div>' +
        '</div></div></div>';
    },
    mount: function (root) {
      if (!st) { st = newState(); loadPreset('led'); }
      st.circuit.reset(); st.dirty = true;
      var svg = KM.$('#simSvg', root);
      function setTool(t) { st.tool = t; KM.$$('[data-tool]', root).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.tool === t)); }); }
      setTool(st.tool);
      KM.$$('[data-tool]', root).forEach(function (b) { b.onclick = function () { setTool(b.dataset.tool); }; });
      KM.$$('[data-preset]', root).forEach(function (b) { b.onclick = function () { loadPreset(b.dataset.preset); drawPanel(root); }; });
      svg.addEventListener('pointerdown', function (ev) {
        var n = nodeAt(svg, ev), p = partAt(ev);
        if (st.tool === 'select') {
          st.sel = p ? p.id : null;
          if (p && p.type === 'SW') { p.on = !p.on; st.dirty = true; }
          st.scope = []; drawPanel(root); return;
        }
        if (st.tool === 'erase') { if (p) { st.parts = st.parts.filter(function (x) { return x !== p; }); if (st.sel === p.id) st.sel = null; st.dirty = true; drawPanel(root); } return; }
        if (!n || !n.near) return;
        if (st.tool === 'GND') { addPart('GND', n.key); return; }
        st.drag = { start: n.key, end: n.key };
        svg.setPointerCapture(ev.pointerId);
      });
      svg.addEventListener('pointermove', function (ev) {
        var n = nodeAt(svg, ev);
        st.hover = n && n.near ? n.key : null;
        if (st.drag && n) {
          var s = st.drag.start.split(',').map(Number), c = Math.round((n.x - M) / S), r = Math.round((n.y - M) / S);
          c = Math.max(0, Math.min(COLS - 1, c)); r = Math.max(0, Math.min(ROWS - 1, r));
          if (Math.abs(c - s[0]) >= Math.abs(r - s[1])) r = s[1]; else c = s[0]; // только по горизонтали/вертикали
          st.drag.end = k(c, r);
        }
      });
      svg.addEventListener('pointerup', function () {
        if (st.drag && st.drag.end !== st.drag.start) {
          var p = addPart(st.tool, st.drag.start, st.drag.end);
          if (st.tool !== 'wire') { st.sel = p.id; st.scope = []; drawPanel(root); }
        }
        st.drag = null;
      });
      svg.addEventListener('pointerleave', function () { st.hover = null; });
      root.onkeydown = function (e) {
        if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
        if ((e.key === 'Delete' || e.key === 'Backspace') && st.sel) { st.parts = st.parts.filter(function (x) { return x.id !== st.sel; }); st.sel = null; st.dirty = true; drawPanel(root); }
        if (e.key === 'Escape') { st.drag = null; setTool('select'); }
      };
      KM.$('#simRun', root).onclick = function () { st.run = !st.run; this.textContent = st.run ? '⏸ Пауза' : '▶ Пуск'; };
      KM.$('#simSpeed', root).onchange = function () { st.speed = parseFloat(this.value); };
      KM.$('#simReset', root).onclick = function () { st.circuit.reset(); st.parts.forEach(function (p) { p.burned = false; }); st.scope = []; st.dirty = true; };
      KM.$('#simClear', root).onclick = function () { if (!st.parts.length || confirm('Очистить поле?')) { st.parts = []; st.counters = {}; st.sel = null; st.circuit.reset(); st.dirty = true; drawPanel(root); } };
      function serialize() { return { app: 'kicad-master-pro-sim', v: 1, parts: st.parts.map(function (p) { return { type: p.type, a: p.a, b: p.b, value: p.value, color: p.color, on: p.on, label: p.label }; }) }; }
      function restore(obj) {
        if (!obj || !Array.isArray(obj.parts)) throw new Error('Неверный файл схемы');
        st.parts = []; st.counters = {}; st.sel = null; st.circuit.reset();
        obj.parts.forEach(function (x) { if (/^\d+,\d+$/.test(x.a) && /^\d+,\d+$/.test(x.b) && PREFIX[x.type]) { var p = addPart(x.type, x.a, x.b, Number(x.value) || 0, x.color, x.on); } });
        st.dirty = true; drawPanel(root);
      }
      KM.$('#simSave', root).onclick = function () {
        var name = prompt('Название схемы:', 'Моя схема ' + (KM.store.state.simSaved.length + 1));
        if (!name) return;
        KM.store.state.simSaved.push({ name: name, t: Date.now(), data: serialize() }); KM.store.touch();
        KM.ui.toast('Схема сохранена', name, '💾');
      };
      KM.$('#simLoad', root).onclick = function () {
        var list = KM.store.state.simSaved;
        KM.ui.modal('Мои схемы', list.length ? '<ul class="check-list">' + list.map(function (x, i) { return '<li><div style="flex:1"><b>' + KM.esc(x.name) + '</b><div class="tiny">' + new Date(x.t).toLocaleString() + ' · ' + x.data.parts.length + ' дет.</div></div><button class="btn sm" data-load="' + i + '">Открыть</button><button class="btn sm danger" data-del="' + i + '">✕</button></li>'; }).join('') + '</ul>' : '<p class="muted">Сохранённых схем пока нет.</p>', function (body, dlg) {
          KM.$$('[data-load]', body).forEach(function (b) { b.onclick = function () { restore(list[b.dataset.load].data); dlg.close(); }; });
          KM.$$('[data-del]', body).forEach(function (b) { b.onclick = function () { list.splice(b.dataset.del, 1); KM.store.touch(); dlg.close(); KM.$('#simLoad', root).click(); }; });
        });
      };
      KM.$('#simExport', root).onclick = function () { KM.download('schema-sim.json', JSON.stringify(serialize(), null, 1), 'application/json'); };
      KM.$('#simImport', root).onclick = function () { KM.$('#simFile', root).click(); };
      KM.$('#simFile', root).onchange = function () {
        var f = this.files[0]; if (!f) return;
        var fr = new FileReader(); fr.onload = function () { try { restore(JSON.parse(fr.result)); } catch (e) { KM.ui.toast('Не удалось загрузить', e.message, '⚠️'); } }; fr.readAsText(f);
      };
      drawPanel(root);
      loop(root);
    },
    unmount: function () { if (st) cancelAnimationFrame(st.raf); }
  };

  function toolIcon(id) {
    var s = { select: '<path d="M4 2l0 14 4-4 3 6 2-1-3-6 5 0z" fill="currentColor"/>', wire: '<line x1="2" y1="9" x2="28" y2="9" stroke="currentColor" stroke-width="2"/>',
      R: '<path d="M2 9h6M22 9h6" stroke="currentColor" stroke-width="2"/><rect x="8" y="5" width="14" height="8" fill="none" stroke="currentColor" stroke-width="2"/>',
      V: '<path d="M2 9h10M18 9h10M12 3v12M18 6v6" stroke="currentColor" stroke-width="2"/>', LED: '<path d="M2 9h8M20 9h8M10 3l10 6-10 6z M20 3v12" stroke="currentColor" stroke-width="2" fill="none"/>',
      D: '<path d="M2 9h8M20 9h8M10 3l10 6-10 6z M20 3v12" stroke="currentColor" stroke-width="2" fill="none"/>', SW: '<path d="M2 9h7M21 9h7M9 9l11-6" stroke="currentColor" stroke-width="2" fill="none"/>',
      LAMP: '<circle cx="15" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 5l8 8M19 5l-8 8" stroke="currentColor" stroke-width="1.5"/>', C: '<path d="M2 9h11M17 9h11M13 3v12M17 3v12" stroke="currentColor" stroke-width="2"/>',
      AM: '<circle cx="15" cy="9" r="7" fill="none" stroke="currentColor" stroke-width="2"/><text x="15" y="13" font-size="10" text-anchor="middle" fill="currentColor">A</text>',
      GND: '<path d="M15 1v8M7 9h16M10 13h10M13 17h4" stroke="currentColor" stroke-width="2"/>', erase: '<path d="M6 14l8-10 8 6-6 8H9z" fill="none" stroke="currentColor" stroke-width="2"/>' }[id];
    return '<svg viewBox="0 0 30 18" aria-hidden="true">' + s + '</svg>';
  }
})();
