/* =========================================================
   Просмотрщик Gerber и 3D-вид платы.
   Файлы разбирает js/gerber-parse.js (KM.gerber). Здесь — отрисовка:
   «Верх» и «Низ» — плата как с завода (маска, покрытие, шелкография),
   «Слои» — как в GerbView, «3D» — плата из тех же файлов (CSS 3D).
   Демо-платы — настоящие Gerber из KiCad (tools/pcbgen.py).
   ========================================================= */
(function () {
  'use strict';
  var G = KM.gerber;

  var DEMOS = [
    { id: 'blinker', title: 'Мигалка на NE555', desc: '40×30 мм · 2 слоя · полигон GND · переходные отверстия', file: 'kicad/blinker-gerber.zip' },
    { id: 'badge', title: 'Круглый значок', desc: 'Ø36 мм · 4 светодиода · круглый контур', file: 'kicad/badge-gerber.zip' }
  ];
  var MASKS = {
    green: ['Зелёная', '#0d5a2c'], black: ['Чёрная', '#151515'], blue: ['Синяя', '#12467c'],
    red: ['Красная', '#8c1c1c'], purple: ['Фиолетовая', '#4a1f72'], white: ['Белая', '#e9ebe7']
  };
  var FINISH = { enig: ['ENIG (золото)', '#d8b25c'], hasl: ['HASL (олово)', '#c8cbcd'] };
  var STYLE = {
    'B.Paste': { c: '#8f8f8f', n: 'Паста снизу', o: 0, a: 0.6, off: true },
    'B.Silk': { c: '#d6c35e', n: 'Шелкография снизу', o: 1, a: 0.9 },
    'B.Mask': { c: '#2aa6a6', n: 'Маска снизу', o: 2, a: 0.35, off: true },
    'B.Cu': { c: '#4a86e0', n: 'Медь снизу (B.Cu)', o: 3, a: 0.8 },
    'In.Cu': { c: '#c9a83a', n: 'Внутренний слой меди', o: 4, a: 0.7 },
    'F.Cu': { c: '#e0473f', n: 'Медь сверху (F.Cu)', o: 5, a: 0.8 },
    'F.Mask': { c: '#b54ab5', n: 'Маска сверху', o: 6, a: 0.35, off: true },
    'F.Silk': { c: '#f0f0f0', n: 'Шелкография сверху', o: 7, a: 0.95 },
    'F.Paste': { c: '#a0a0a0', n: 'Паста сверху', o: 8, a: 0.6, off: true },
    'Edge': { c: '#e6d52b', n: 'Контур платы (Edge.Cuts)', o: 9, a: 1 },
    'Drill': { c: '#f4f4f4', n: 'Сверловка', o: 10, a: 1 },
    'Other': { c: '#8a8a8a', n: 'Другой слой', o: 11, a: 0.6, off: true }
  };
  var MODES = [['top', 'Верх'], ['bottom', 'Низ'], ['layers', 'Слои'], ['3d', '3D']];

  var st = { board: null, source: '', mode: 'top', mask: 'green', finish: 'enig', tool: 'pan', meas: [], hover: null,
    view: null, r3: { rx: 55, rz: -25, z: 1, spin: false }, loading: false, demo: null };
  var env = null; // DOM и обработчики текущего монтирования

  /* =================== Path2D из операций =================== */
  function ccw(poly) {
    var a = 0;
    for (var i = 0; i < poly.length; i++) { var p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; }
    return a >= 0 ? poly : poly.slice().reverse();
  }
  function addPoly(path, pts, dx, dy) {
    pts = ccw(pts);
    path.moveTo(pts[0][0] + dx, pts[0][1] + dy);
    for (var i = 1; i < pts.length; i++) path.lineTo(pts[i][0] + dx, pts[i][1] + dy);
    path.closePath();
  }
  function addCircle(path, x, y, r) { path.moveTo(x + r, y); path.arc(x, y, r, 0, Math.PI * 2, false); path.closePath(); }

  // Слой → список {fill|stroke, clear, w}
  function items(layer) {
    if (layer.items) return layer.items;
    var out = [], cur = null;
    function batch(kind, clear, w) {
      if (!cur || cur.kind !== kind || cur.clear !== clear || cur.w !== w) {
        cur = { kind: kind, clear: clear, w: w, path: new Path2D() };
        out.push(cur);
      }
      return cur.path;
    }
    if (layer.kind === 'drill') {
      layer.holes.forEach(function (h) { addCircle(batch('fill', false), h.x, h.y, h.d / 2); });
      layer.slots.forEach(function (s) { var p = batch('stroke', false, s.d); p.moveTo(s.x0, s.y0); p.lineTo(s.x1, s.y1); });
    } else {
      layer.ops.forEach(function (o) {
        if (o.t === 'stroke') {
          if (!(o.w > 0)) return;
          var p = batch('stroke', o.clear, o.w);
          p.moveTo(o.x0, o.y0);
          if (o.arc) {
            var r = Math.hypot(o.x0 - o.arc.cx, o.y0 - o.arc.cy), a0 = Math.atan2(o.y0 - o.arc.cy, o.x0 - o.arc.cx), a1 = Math.atan2(o.y1 - o.arc.cy, o.x1 - o.arc.cx);
            if (Math.hypot(o.x1 - o.x0, o.y1 - o.y0) < 1e-6) a1 = a0 + (o.arc.cw ? -2 : 2) * Math.PI;
            p.arc(o.arc.cx, o.arc.cy, r, a0, a1, o.arc.cw);
          } else p.lineTo(o.x1, o.y1);
        } else if (o.t === 'flash') {
          var ap = layer.aps[o.ap];
          ap.shapes.forEach(function (sh) {
            var clear = sh.clear ? !o.clear : o.clear, path = batch('fill', clear, 0);
            if (sh.circle) addCircle(path, o.x + sh.circle[0], o.y + sh.circle[1], sh.circle[2]);
            else addPoly(path, sh.poly, o.x, o.y);
          });
        } else if (o.t === 'region') {
          var rp = batch('fill', o.clear, 0);
          o.contours.forEach(function (c) { addPoly(rp, c, 0, 0); });
        }
      });
    }
    layer.items = out;
    return out;
  }
  function outlinePath(b) {
    if (b.outlinePath) return b.outlinePath;
    var p = new Path2D();
    if (b.outline.length) b.outline.forEach(function (l) { p.moveTo(l[0][0], l[0][1]); l.forEach(function (q) { p.lineTo(q[0], q[1]); }); p.closePath(); });
    else p.rect(b.box[0], b.box[1], b.box[2] - b.box[0], b.box[3] - b.box[1]);
    b.outlinePath = p;
    return p;
  }

  /* =================== растеризация =================== */
  var pool = [];
  function surface(i, w, h) {
    var c = pool[i] || (pool[i] = document.createElement('canvas'));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    var ctx = c.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, w, h);
    return { c: c, ctx: ctx };
  }
  function paint(ctx, T, list, color, cutAll) {
    ctx.setTransform(T[0], 0, 0, T[1], T[2], T[3]);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    list.forEach(function (it) {
      if (cutAll && it.clear) return;
      ctx.globalCompositeOperation = cutAll || it.clear ? 'destination-out' : 'source-over';
      if (it.kind === 'fill') { ctx.fillStyle = color; ctx.fill(it.path, 'nonzero'); }
      else { ctx.strokeStyle = color; ctx.lineWidth = it.w; ctx.stroke(it.path); }
    });
    ctx.globalCompositeOperation = 'source-over';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  // Видимость: выбор пользователя, иначе — по умолчанию для режима (маска и паста в «Слоях» скрыты)
  function visible(l) {
    var v = st.board.vis[l.layer + '|' + l.name];
    return v != null ? v : !(st.mode === 'layers' && STYLE[l.layer].off);
  }
  function layersOf(kind) { return st.board.layers.filter(function (l) { return l.layer === kind && visible(l); }); }

  // Плата «как с завода»: side = top | bottom. T = [sx, sy, ox, oy] (мм → пиксели)
  function realistic(ctx, w, h, T, side) {
    var b = st.board, f = side === 'top' ? 'F.' : 'B.';
    var base = surface(0, w, h), bc = base.ctx;
    bc.setTransform(T[0], 0, 0, T[1], T[2], T[3]);
    bc.fillStyle = '#8f7f4c';
    bc.fill(outlinePath(b), 'evenodd');
    bc.setTransform(1, 0, 0, 1, 0, 0);
    function over(list, color, alpha, prep) {
      if (!list.length) return;
      var s = surface(1, w, h);
      if (prep) prep(s.ctx);
      list.forEach(function (l) { paint(s.ctx, T, items(l), color, prep); });
      bc.globalCompositeOperation = 'source-atop'; bc.globalAlpha = alpha;
      bc.drawImage(s.c, 0, 0);
      bc.globalCompositeOperation = 'source-over'; bc.globalAlpha = 1;
    }
    over(layersOf(f + 'Cu'), FINISH[st.finish][1], 1);
    var masks = layersOf(f + 'Mask');
    if (masks.length) over(masks, '#000', 0.93, function (mc) { mc.setTransform(T[0], 0, 0, T[1], T[2], T[3]); mc.fillStyle = MASKS[st.mask][1]; mc.fill(outlinePath(b), 'evenodd'); mc.setTransform(1, 0, 0, 1, 0, 0); });
    over(layersOf(f + 'Silk'), st.mask === 'white' ? '#1b1b1b' : '#f3f3ef', 1);
    b.layers.filter(function (l) { return l.kind === 'drill' && visible(l); }).forEach(function (l) { paint(bc, T, items(l), '#000', true); });
    return base.c;
  }

  /* =================== вид и отрисовка 2D =================== */
  function T2D() {
    var v = st.view, d = env.dpr, m = st.mode === 'bottom' ? -1 : 1;
    return [v.s * d * m, -v.s * d, v.ox * d, v.oy * d];
  }
  function fit() {
    if (!env || !st.board) return;
    var W = env.cv.clientWidth, H = env.cv.clientHeight, b = st.board.box;
    var bw = Math.max(1, b[2] - b[0]), bh = Math.max(1, b[3] - b[1]), pad = Math.min(48, W * 0.08);
    var s = Math.min((W - pad * 2) / bw, (H - pad * 2) / bh), m = st.mode === 'bottom' ? -1 : 1;
    st.view = { s: s, ox: W / 2 - m * (b[0] + bw / 2) * s, oy: H / 2 + (b[1] + bh / 2) * s };
    draw();
  }
  function toBoard(sx, sy) {
    var v = st.view, m = st.mode === 'bottom' ? -1 : 1;
    return [(sx - v.ox) / v.s * m, -(sy - v.oy) / v.s];
  }
  function toScreen(x, y) {
    var v = st.view, m = st.mode === 'bottom' ? -1 : 1;
    return [v.ox + m * x * v.s, v.oy - y * v.s];
  }
  function draw() {
    if (!env || env.raf) return;
    env.raf = requestAnimationFrame(function () { env.raf = 0; render(); });
  }
  function render() {
    if (!env || st.mode === '3d') return;
    var cv = env.cv, d = env.dpr, W = Math.max(1, Math.round(cv.clientWidth * d)), H = Math.max(1, Math.round(cv.clientHeight * d));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    var ctx = cv.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var real = st.mode !== 'layers';
    ctx.fillStyle = real ? '#1c2024' : '#0a0e0c';
    ctx.fillRect(0, 0, W, H);
    if (!st.board) return;
    if (!st.view) { fit(); return; }
    var T = T2D();
    grid(ctx, W, H, real);
    if (real) {
      var img = realistic(ctx, W, H, T, st.mode);
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 24 * d; ctx.shadowOffsetY = 6 * d;
      ctx.drawImage(img, 0, 0); ctx.restore();
    } else {
      st.board.layers.slice().sort(function (a, b) { return STYLE[a.layer].o - STYLE[b.layer].o; }).forEach(function (l) {
        if (!visible(l)) return;
        var s = surface(0, W, H), sty = STYLE[l.layer];
        paint(s.ctx, T, items(l), l.kind === 'drill' ? '#0a0e0c' : sty.c);
        if (l.kind === 'drill') { // отверстия: тёмный круг с белой обводкой
          s.ctx.setTransform(T[0], 0, 0, T[1], T[2], T[3]);
          s.ctx.strokeStyle = '#e8e8e8'; s.ctx.lineWidth = 1.2 / st.view.s;
          items(l).forEach(function (it) { if (it.kind === 'fill') s.ctx.stroke(it.path); });
        }
        ctx.globalAlpha = sty.a; ctx.drawImage(s.c, 0, 0); ctx.globalAlpha = 1;
      });
    }
    measureOverlay(ctx, d);
  }
  function grid(ctx, W, H, real) {
    var v = st.view, d = env.dpr, step = 1;
    while (step * v.s < 14) step *= step === 1 ? 5 : 2;
    if (step * v.s > 140) return;
    var b0 = toBoard(0, H), b1 = toBoard(W / d, 0);
    var x0 = Math.floor(Math.min(b0[0], b1[0]) / step) * step, x1 = Math.max(b0[0], b1[0]), y0 = Math.floor(b0[1] / step) * step;
    ctx.fillStyle = real ? 'rgba(255,255,255,.07)' : 'rgba(120,200,160,.14)';
    var r = Math.max(1, d);
    for (var x = x0; x <= x1; x += step) for (var y = y0; y <= b1[1]; y += step) {
      var p = toScreen(x, y);
      ctx.fillRect(p[0] * d - r / 2, p[1] * d - r / 2, r, r);
    }
  }
  function measureOverlay(ctx, d) {
    if (!st.meas.length) return;
    var pts = st.meas.slice();
    if (pts.length === 1 && st.hover) pts.push(st.hover);
    ctx.save(); ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.strokeStyle = '#ffd24a'; ctx.fillStyle = '#ffd24a'; ctx.lineWidth = 2;
    var s = pts.map(function (p) { return toScreen(p[0], p[1]); });
    ctx.beginPath(); ctx.moveTo(s[0][0], s[0][1]); if (s[1]) ctx.lineTo(s[1][0], s[1][1]); ctx.stroke();
    s.forEach(function (q) { ctx.beginPath(); ctx.arc(q[0], q[1], 4, 0, Math.PI * 2); ctx.fill(); });
    if (s[1]) {
      var dx = pts[1][0] - pts[0][0], dy = pts[1][1] - pts[0][1];
      var txt = fmt(Math.hypot(dx, dy)) + ' мм  (Δx ' + fmt(Math.abs(dx)) + ', Δy ' + fmt(Math.abs(dy)) + ')';
      ctx.font = '600 13px system-ui, sans-serif';
      var tw = ctx.measureText(txt).width, mx = (s[0][0] + s[1][0]) / 2, my = (s[0][1] + s[1][1]) / 2 - 14;
      ctx.fillStyle = 'rgba(20,20,20,.85)'; ctx.fillRect(mx - tw / 2 - 8, my - 13, tw + 16, 24);
      ctx.fillStyle = '#ffd24a'; ctx.textAlign = 'center'; ctx.fillText(txt, mx, my + 4);
    }
    ctx.restore();
  }
  function fmt(v) { return v.toFixed(v < 10 ? 2 : 1).replace('.', ','); }

  /* =================== 3D =================== */
  function build3D() {
    if (!env || !st.board) return;
    var b = st.board, box = b.box, bw = box[2] - box[0], bh = box[3] - box[1];
    var k = Math.min(12, 1400 / Math.max(bw, bh)), W = Math.ceil(bw * k), H = Math.ceil(bh * k);
    var T = [k, -k, -box[0] * k, box[3] * k];
    function face(side) {
      var c = document.createElement('canvas'); c.width = W; c.height = H;
      c.getContext('2d').drawImage(realistic(null, W, H, T, side), 0, 0);
      return c;
    }
    var scene = env.scene;
    scene.innerHTML = '';
    scene.style.width = W + 'px'; scene.style.height = H + 'px';
    var t = 1.6 * k, top = face('top'), bot = face('bottom');
    // торец: силуэт платы, повторённый по толщине
    var edge = surface(2, W, H);
    edge.ctx.setTransform(T[0], 0, 0, T[1], T[2], T[3]);
    edge.ctx.fillStyle = '#cbbd8b'; edge.ctx.fill(outlinePath(b), 'evenodd');
    b.layers.filter(function (l) { return l.kind === 'drill'; }).forEach(function (l) { paint(edge.ctx, T, items(l), '#000', true); });
    var n = Math.max(3, Math.min(14, Math.round(t / 1.5)));
    for (var i = 0; i < n; i++) {
      var sl = document.createElement('canvas'); sl.width = W; sl.height = H;
      var sc = sl.getContext('2d'); sc.drawImage(edge.c, 0, 0);
      sc.globalCompositeOperation = 'source-atop'; sc.fillStyle = 'rgba(0,0,0,' + (0.12 + 0.25 * Math.abs(i / (n - 1) - 0.5)) + ')'; sc.fillRect(0, 0, W, H);
      sl.style.transform = 'translateZ(' + (-t / 2 + t * i / (n - 1)).toFixed(2) + 'px)';
      scene.appendChild(sl);
    }
    bot.style.transform = 'rotateY(180deg) translateZ(' + (t / 2 + 0.3) + 'px)';
    top.style.transform = 'translateZ(' + (t / 2 + 0.3) + 'px)';
    scene.appendChild(bot); scene.appendChild(top);
    env.size3 = [W, H];
    st.r3.z = 0;
    apply3D();
  }
  function apply3D() {
    if (!env || !env.size3) return;
    var r = st.r3, box = env.stage.getBoundingClientRect();
    var fitZ = Math.min(box.width * 0.78 / env.size3[0], box.height * 0.78 / env.size3[1]);
    if (!r.z) r.z = fitZ;
    env.scene.style.transform = 'translate(-50%, -50%) scale(' + r.z.toFixed(4) + ') rotateX(' + r.rx.toFixed(1) + 'deg) rotateZ(' + r.rz.toFixed(1) + 'deg)';
  }
  function spin() {
    if (!env || !st.r3.spin || st.mode !== '3d') { if (env) env.spinRaf = 0; return; }
    st.r3.rz += 0.35; apply3D();
    env.spinRaf = requestAnimationFrame(spin);
  }

  /* =================== загрузка =================== */
  function readFiles(list) {
    return Promise.all(Array.prototype.map.call(list, function (f) {
      return f.arrayBuffer().then(function (buf) {
        var u8 = new Uint8Array(buf);
        if (u8[0] === 0x50 && u8[1] === 0x4b) return G.unzip(buf);
        return [{ name: f.name, bytes: u8 }];
      });
    })).then(function (arr) { return [].concat.apply([], arr); });
  }
  function useBoard(files, source, demo) {
    var b = G.board(files);
    if (!b.layers.length) throw new Error('В файлах не нашлось слоёв Gerber или сверловки' + (b.skipped.length ? ': ' + b.skipped.slice(0, 3).join('; ') : ''));
    b.vis = {};
    b.report = G.report(b);
    st.board = b; st.source = source; st.demo = demo || null; st.meas = []; st.view = null;
    if (env) { panels(); if (st.mode === '3d') build3D(); else fit(); }
  }
  function loadDemo(id) {
    var d = DEMOS.find(function (x) { return x.id === id; }) || DEMOS[0];
    setStatus('Загружаю «' + d.title + '»…');
    return fetch(d.file).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
      .then(G.unzip).then(function (files) { useBoard(files, d.title, d.id); setStatus(''); })
      .catch(function (e) {
        setStatus(location.protocol === 'file:' ? 'Демо-платы загружаются, когда сайт открыт по http(s). Откройте свои файлы кнопкой «Открыть Gerber / ZIP».' : 'Не удалось загрузить демо: ' + e.message);
      });
  }
  function loadUser(list) {
    if (!list || !list.length) return;
    setStatus('Читаю файлы…');
    readFiles(list).then(function (files) {
      useBoard(files, list.length === 1 ? list[0].name : 'Ваши файлы (' + list.length + ')');
      setStatus('');
      KM.ui.toast('Плата загружена', st.board.layers.length + ' слоёв · ' + fmt(st.board.report.w) + '×' + fmt(st.board.report.h) + ' мм', '📐');
    }).catch(function (e) { setStatus(''); KM.ui.toast('Не получилось открыть', e.message, '⚠️'); });
  }
  function setStatus(t) { if (env) { env.status.textContent = t; env.status.hidden = !t; } }

  /* =================== панели =================== */
  function panels() {
    if (!env) return;
    var b = st.board;
    KM.$$('[data-demo]', env.root).forEach(function (el) { el.setAttribute('aria-pressed', el.dataset.demo === st.demo); });
    env.src.textContent = b ? st.source : '—';
    var dl = KM.$('#gvDl', env.root);
    var demo = DEMOS.find(function (x) { return x.id === st.demo; });
    dl.hidden = !demo; if (demo) dl.href = demo.file;
    if (!b) return;
    KM.$('#gvLayers', env.root).innerHTML = b.layers.slice().sort(function (a, c) { return STYLE[c.layer].o - STYLE[a.layer].o; }).map(function (l) {
      var key = l.layer + '|' + l.name, sty = STYLE[l.layer];
      var what = l.kind === 'drill' ? (l.plated ? 'PTH' : 'NPTH') + ' · ' + (l.holes.length + l.slots.length) + ' отв.' : sty.n;
      return '<label class="gv-layer"><input type="checkbox" data-key="' + KM.esc(key) + '"' + (b.vis[key] === false ? '' : ' checked') + '>' +
        '<span class="gv-sw" style="background:' + sty.c + '"></span><span class="gv-ln"><b>' + KM.esc(what) + '</b><span>' + KM.esc(l.name) + '</span></span></label>';
    }).join('') + (b.empty.length ? '<p class="tiny mb0">Пустые слои: ' + KM.esc(b.empty.join(', ')) + '</p>' : '') +
      (b.skipped.length ? '<p class="tiny mb0">Пропущено: ' + KM.esc(b.skipped.join('; ')) + '</p>' : '');
    KM.$$('#gvLayers input', env.root).forEach(function (cb) {
      cb.onchange = function () { b.vis[cb.dataset.key] = cb.checked; if (st.mode === '3d') build3D(); else draw(); };
    });
    var r = b.report, icon = { ok: '✅', warn: '⚠️', bad: '❌' };
    var warns = [].concat.apply([], b.layers.map(function (l) { return l.warnings.map(function (w) { return l.name + ': ' + w; }); }));
    KM.$('#gvReport', env.root).innerHTML =
      '<div class="gv-dims"><div><b>' + fmt(r.w) + ' × ' + fmt(r.h) + '</b><span>мм</span></div><div><b>' + r.copper + '</b><span>слоя меди</span></div><div><b>' + (r.pth + r.npth) + '</b><span>отверстий</span></div></div>' +
      '<ul class="gv-checks">' + r.checks.map(function (c) { return '<li class="' + c[0] + '"><span aria-hidden="true">' + icon[c[0]] + '</span>' + KM.esc(c[1]) + '</li>'; }).join('') + '</ul>' +
      (Object.keys(r.tools).length ? '<details><summary>Диаметры отверстий</summary><table class="gv-tools">' + Object.keys(r.tools).sort(function (a, c) { return parseFloat(a) - parseFloat(c); }).map(function (t) { return '<tr><td>⌀ ' + t.replace('.', ',') + ' мм</td><td>' + r.tools[t] + ' шт.</td></tr>'; }).join('') + '</table></details>' : '') +
      (warns.length ? '<p class="tiny mb0">' + KM.esc(warns.join('; ')) + '</p>' : '');
  }
  function setMode(m) {
    st.mode = m; st.meas = [];
    KM.$$('[data-mode]', env.root).forEach(function (el) { el.setAttribute('aria-selected', el.dataset.mode === m); });
    env.stage2.hidden = m === '3d'; env.stage.hidden = m !== '3d';
    KM.$$('.gv-2d-only', env.root).forEach(function (el) { el.hidden = m === '3d'; });
    KM.$$('.gv-3d-only', env.root).forEach(function (el) { el.hidden = m !== '3d'; });
    KM.$('#gvLook', env.root).hidden = m === 'layers';
    if (st.board) panels();
    if (m === '3d') { build3D(); if (st.r3.spin && !env.spinRaf) spin(); }
    else { st.view = null; draw(); }
  }

  /* =================== разметка =================== */
  KM.views.gerber = {
    render: function () {
      var lesson = (KM.data.lessons || []).find(function (l) { return /gerber/i.test(l.title); });
      return '<div class="page gv-page"><div class="page-head"><div class="eyebrow">Инструменты</div><h1>Просмотр Gerber и 3D</h1>' +
        '<p>Проверьте файлы для завода перед заказом: откройте ZIP из KiCad (или отдельные .gbr/.gtl/.drl), посмотрите плату сверху и снизу, по слоям и в 3D. Файлы не покидают ваш браузер.</p></div>' +
        '<div class="gv-wrap">' +
          '<div class="gv-main">' +
            '<div class="gv-bar">' +
              '<div class="tabs gv-tabs" role="tablist">' + MODES.map(function (m) { return '<button role="tab" data-mode="' + m[0] + '" aria-selected="' + (st.mode === m[0]) + '">' + m[1] + '</button>'; }).join('') + '</div>' +
              '<label class="btn sm primary gv-open">📂 Открыть Gerber / ZIP<input type="file" id="gvFile" multiple hidden accept=".zip,.gbr,.ger,.gtl,.gbl,.gts,.gbs,.gto,.gbo,.gtp,.gbp,.gm1,.gko,.gml,.drl,.xln,.txt,.cmp,.sol,.g1,.g2,.g3,.g4"></label>' +
            '</div>' +
            '<div class="gv-view" id="gvView">' +
              '<div class="gv-stage2" id="gvStage2"><canvas id="gvCanvas" aria-label="Изображение печатной платы"></canvas></div>' +
              '<div class="gv-stage3" id="gvStage3" hidden><div class="gv-scene" id="gvScene"></div></div>' +
              '<div class="gv-tools-float">' +
                '<button class="gv-ic" data-act="zin" title="Приблизить" aria-label="Приблизить">+</button><button class="gv-ic" data-act="zout" title="Отдалить" aria-label="Отдалить">−</button>' +
                '<button class="gv-ic" data-act="fit" title="Вся плата (двойной щелчок)" aria-label="Показать всю плату">⤢</button>' +
                '<button class="gv-ic gv-2d-only" data-act="measure" title="Линейка: два щелчка по плате" aria-label="Измерение" aria-pressed="false">📏</button>' +
                '<button class="gv-ic gv-3d-only" data-act="spin" title="Вращение" aria-label="Вращение" aria-pressed="false" hidden>⟳</button>' +
                '<button class="gv-ic" data-act="shot" title="Сохранить PNG" aria-label="Сохранить картинку">📸</button>' +
              '</div>' +
              '<div class="gv-3d-only gv-views3" hidden><button class="btn sm" data-v3="iso">Изометрия</button><button class="btn sm" data-v3="top">Сверху</button><button class="btn sm" data-v3="bottom">Снизу</button><button class="btn sm" data-v3="side">Сбоку</button></div>' +
              '<div class="gv-coord gv-2d-only" id="gvCoord"></div>' +
              '<div class="gv-status" id="gvStatus" hidden></div>' +
              '<div class="gv-drop" id="gvDrop" hidden>Отпустите файлы, чтобы открыть</div>' +
            '</div>' +
            '<p class="tiny mt-s mb0">Колесо или щипок — масштаб, перетаскивание — сдвиг, двойной щелчок — вся плата. В 3D плата поворачивается мышью или пальцем. Компоненты в 3D не показываются: в Gerber их нет — так же выглядит превью на сайтах заводов.</p>' +
          '</div>' +
          '<aside class="gv-side">' +
            '<section class="card"><h3>📦 Плата</h3><div class="gv-demos">' + DEMOS.map(function (d) { return '<button class="gv-demo" data-demo="' + d.id + '" aria-pressed="false"><b>' + d.title + '</b><span>' + d.desc + '</span></button>'; }).join('') + '</div>' +
              '<p class="tiny mb0 mt-s">Открыто: <b id="gvSrc">—</b></p><a class="small" id="gvDl" download hidden>⬇️ Скачать Gerber этой платы (ZIP)</a></section>' +
            '<section class="card" id="gvLook"><h3>🎨 Вид платы</h3><div class="gv-masks">' + Object.keys(MASKS).map(function (k) { return '<button class="gv-mask" data-mask="' + k + '" title="' + MASKS[k][0] + '" aria-label="Маска: ' + MASKS[k][0] + '" aria-pressed="' + (st.mask === k) + '" style="background:' + MASKS[k][1] + '"></button>'; }).join('') + '</div>' +
              '<div class="chips mt-s">' + Object.keys(FINISH).map(function (k) { return '<button class="chip" data-finish="' + k + '" aria-pressed="' + (st.finish === k) + '">' + FINISH[k][0] + '</button>'; }).join('') + '</div></section>' +
            '<section class="card"><h3>🧾 Проверка перед заказом</h3><div id="gvReport"><p class="small muted mb0">Откройте плату.</p></div></section>' +
            '<section class="card"><h3>🗂️ Слои</h3><div id="gvLayers" class="gv-layers"><p class="small muted mb0">—</p></div></section>' +
            (lesson ? '<a class="small" href="#/lesson/' + lesson.id + '">📘 Урок: ' + KM.esc(lesson.title) + '</a>' : '') +
          '</aside>' +
        '</div></div>';
    },

    mount: function (root) {
      env = { root: root, dpr: Math.min(2, window.devicePixelRatio || 1), raf: 0, spinRaf: 0 };
      env.cv = KM.$('#gvCanvas', root); env.view = KM.$('#gvView', root);
      env.stage2 = KM.$('#gvStage2', root); env.stage = KM.$('#gvStage3', root); env.scene = KM.$('#gvScene', root);
      env.status = KM.$('#gvStatus', root); env.src = KM.$('#gvSrc', root);
      var mine = env;

      KM.$$('[data-mode]', root).forEach(function (b) { b.onclick = function () { setMode(b.dataset.mode); }; });
      KM.$$('[data-demo]', root).forEach(function (b) { b.onclick = function () { loadDemo(b.dataset.demo); }; });
      KM.$('#gvFile', root).onchange = function () { loadUser(Array.prototype.slice.call(this.files)); this.value = ''; };
      KM.$$('[data-mask]', root).forEach(function (b) {
        b.onclick = function () { st.mask = b.dataset.mask; KM.$$('[data-mask]', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); st.mode === '3d' ? build3D() : draw(); };
      });
      KM.$$('[data-finish]', root).forEach(function (b) {
        b.onclick = function () { st.finish = b.dataset.finish; KM.$$('[data-finish]', root).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); st.mode === '3d' ? build3D() : draw(); };
      });
      KM.$$('[data-v3]', root).forEach(function (b) {
        b.onclick = function () { var v = { iso: [55, -25], top: [0, 0], bottom: [180, 0], side: [86, 0] }[b.dataset.v3]; st.r3.rx = v[0]; st.r3.rz = v[1]; apply3D(); };
      });

      function zoom(f, cx, cy) {
        if (st.mode === '3d') { st.r3.z = Math.max(0.05, Math.min(20, st.r3.z * f)); apply3D(); return; }
        if (!st.view) return;
        var v = st.view, ns = Math.max(0.5, Math.min(400, v.s * f)), q = ns / v.s;
        if (cx == null) { cx = env.cv.clientWidth / 2; cy = env.cv.clientHeight / 2; }
        v.ox = cx - (cx - v.ox) * q; v.oy = cy - (cy - v.oy) * q; v.s = ns;
        draw();
      }
      KM.$$('[data-act]', root).forEach(function (b) {
        b.onclick = function () {
          var a = b.dataset.act;
          if (a === 'zin') zoom(1.35); else if (a === 'zout') zoom(1 / 1.35);
          else if (a === 'fit') { if (st.mode === '3d') { st.r3.z = 0; apply3D(); } else fit(); }
          else if (a === 'measure') { st.tool = st.tool === 'measure' ? 'pan' : 'measure'; st.meas = []; b.setAttribute('aria-pressed', st.tool === 'measure'); env.view.classList.toggle('measuring', st.tool === 'measure'); draw(); }
          else if (a === 'spin') { st.r3.spin = !st.r3.spin; b.setAttribute('aria-pressed', st.r3.spin); if (st.r3.spin && !env.spinRaf) spin(); }
          else if (a === 'shot') snapshot();
        };
      });

      // указатель: сдвиг, щипок, линейка; в 3D — поворот
      var ptrs = {}, last = null, moved = 0, pinch = null;
      function pos(e) { var r = env.view.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
      env.view.addEventListener('pointerdown', function (e) {
        if (e.target.closest('button,label,a')) return;
        env.view.setPointerCapture(e.pointerId);
        ptrs[e.pointerId] = pos(e); last = pos(e); moved = 0;
        var ids = Object.keys(ptrs);
        if (ids.length === 2) { var a = ptrs[ids[0]], c = ptrs[ids[1]]; pinch = { d: Math.hypot(a[0] - c[0], a[1] - c[1]) }; }
      });
      env.view.addEventListener('pointermove', function (e) {
        var p = pos(e);
        if (st.mode !== '3d' && st.view && st.board) {
          var q = toBoard(p[0], p[1]), bx = st.board.box;
          env.coord = env.coord || KM.$('#gvCoord', root);
          env.coord.textContent = 'X ' + fmt(q[0] - bx[0]) + '  Y ' + fmt(q[1] - bx[1]) + ' мм';
          if (st.tool === 'measure' && st.meas.length === 1) { st.hover = q; draw(); }
        }
        if (!ptrs[e.pointerId]) return;
        ptrs[e.pointerId] = p;
        var ids = Object.keys(ptrs);
        if (ids.length === 2 && pinch) {
          var a = ptrs[ids[0]], c = ptrs[ids[1]], d = Math.hypot(a[0] - c[0], a[1] - c[1]);
          if (pinch.d > 0) zoom(d / pinch.d, (a[0] + c[0]) / 2, (a[1] + c[1]) / 2);
          pinch.d = d; moved = 99; return;
        }
        var dx = p[0] - last[0], dy = p[1] - last[1]; last = p; moved += Math.abs(dx) + Math.abs(dy);
        if (st.mode === '3d') { st.r3.rz += dx * 0.4; st.r3.rx = Math.max(0, Math.min(180, st.r3.rx - dy * 0.4)); apply3D(); }
        else if (st.view && (st.tool === 'pan' || moved > 6)) { st.view.ox += dx; st.view.oy += dy; draw(); }
      });
      function up(e) {
        if (!ptrs[e.pointerId]) return;
        delete ptrs[e.pointerId];
        if (Object.keys(ptrs).length < 2) pinch = null;
        if (st.tool === 'measure' && st.mode !== '3d' && moved < 6 && st.view) {
          var p = pos(e), q = toBoard(p[0], p[1]);
          st.meas = st.meas.length >= 2 ? [q] : st.meas.concat([q]);
          st.hover = null; draw();
        }
      }
      env.view.addEventListener('pointerup', up);
      env.view.addEventListener('pointercancel', up);
      env.view.addEventListener('dblclick', function (e) { if (!e.target.closest('button')) { if (st.mode === '3d') { st.r3.z = 0; apply3D(); } else fit(); } });
      env.view.addEventListener('wheel', function (e) { e.preventDefault(); var p = pos(e); zoom(Math.pow(1.0015, -e.deltaY), p[0], p[1]); }, { passive: false });

      // перетаскивание файлов
      var drop = KM.$('#gvDrop', root), depth = 0;
      env.view.addEventListener('dragenter', function (e) { e.preventDefault(); depth++; drop.hidden = false; });
      env.view.addEventListener('dragover', function (e) { e.preventDefault(); });
      env.view.addEventListener('dragleave', function () { if (--depth <= 0) { depth = 0; drop.hidden = true; } });
      env.view.addEventListener('drop', function (e) { e.preventDefault(); depth = 0; drop.hidden = true; loadUser(Array.prototype.slice.call(e.dataTransfer.files)); });

      env.ro = new ResizeObserver(function () { if (env !== mine) return; if (st.mode === '3d') { st.r3.z = 0; apply3D(); } else if (st.view) { fit(); } else draw(); });
      env.ro.observe(env.view);

      setMode(st.mode);
      if (st.board) panels(); else loadDemo('blinker');
    },

    unmount: function () {
      if (!env) return;
      if (env.raf) cancelAnimationFrame(env.raf);
      if (env.spinRaf) cancelAnimationFrame(env.spinRaf);
      if (env.ro) env.ro.disconnect();
      env = null;
    }
  };

  function snapshot() {
    if (!st.board) return;
    var name = (st.demo || 'board') + '-' + st.mode + '.png';
    if (st.mode !== '3d') { env.cv.toBlob(function (b) { KM.download(name, b); }); return; }
    // в 3D — верх и низ рядом
    var c = KM.$$('canvas', env.scene), top = c[c.length - 1], bot = c[c.length - 2];
    var out = document.createElement('canvas'), gap = 40;
    out.width = top.width * 2 + gap * 3; out.height = top.height + gap * 2;
    var x = out.getContext('2d');
    x.fillStyle = '#1c2024'; x.fillRect(0, 0, out.width, out.height);
    x.drawImage(top, gap, gap);
    x.save(); x.translate(gap * 2 + top.width * 2, gap); x.scale(-1, 1); x.drawImage(bot, 0, 0); x.restore();
    out.toBlob(function (b) { KM.download(name, b); });
  }
})();
