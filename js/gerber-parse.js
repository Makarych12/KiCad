/* =========================================================
   Разбор файлов для производства плат (без зависимостей):
   Gerber RS-274X / X2, сверловка Excellon, ZIP-архивы.
   Результат — «операции» в миллиметрах (ось Y вверх, как в Gerber),
   из которых просмотрщик строит Path2D. В Node работает всё, кроме
   построения Path2D (для тестов: tools/test-gerber.mjs).
   ========================================================= */
(function (root) {
  'use strict';
  var G = {};

  /* ---------- безопасное вычисление арифметики макросов ---------- */
  function calc(expr, vars) {
    var s = String(expr).replace(/\$(\d+)/g, function (_, n) { return '(' + (vars[n] || 0) + ')'; }).replace(/[xX]/g, '*');
    if (!/^[\d.+\-*/()\seE]*$/.test(s) || !s.trim()) return 0;
    try { var v = Function('"use strict";return (' + s + ')')(); return isFinite(v) ? v : 0; } catch (e) { return 0; }
  }

  /* ---------- фигуры: многоугольники и окружности в мм ---------- */
  function rot(px, py, deg) {
    if (!deg) return [px, py];
    var a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return [px * c - py * s, px * s + py * c];
  }
  function rectPoly(cx, cy, w, h, deg) {
    return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(function (p) { return rot(p[0] + cx, p[1] + cy, deg); });
  }
  function regPoly(cx, cy, d, n, deg) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = (deg || 0) * Math.PI / 180 + i * 2 * Math.PI / n;
      pts.push([cx + d / 2 * Math.cos(a), cy + d / 2 * Math.sin(a)]);
    }
    return pts;
  }

  // Фигуры апертуры относительно её центра: [{circle:[x,y,r]} | {poly:[[x,y]...]} , clear?]
  function apertureShapes(ap, macros, k) {
    var p = ap.params, out = [];
    function hole(d) { if (d) out.push({ circle: [0, 0, d / 2], clear: true }); }
    switch (ap.type) {
      case 'C': out.push({ circle: [0, 0, p[0] / 2] }); hole(p[1]); break;
      case 'R': out.push({ poly: rectPoly(0, 0, p[0], p[1], 0) }); hole(p[2]); break;
      case 'O': {
        var w = p[0], h = p[1], r = Math.min(w, h) / 2;
        if (w > h) out.push({ poly: rectPoly(0, 0, w - h, h, 0) }, { circle: [-(w - h) / 2, 0, r] }, { circle: [(w - h) / 2, 0, r] });
        else out.push({ poly: rectPoly(0, 0, w, h - w, 0) }, { circle: [0, -(h - w) / 2, r] }, { circle: [0, (h - w) / 2, r] });
        hole(p[2]); break;
      }
      case 'P': out.push({ poly: regPoly(0, 0, p[0], Math.max(3, Math.round(p[1])), p[2] || 0) }); hole(p[3]); break;
      default: {
        var m = macros[ap.type];
        if (!m) { out.push({ circle: [0, 0, (p[0] || 0.2) / 2] }); break; }
        var vars = {};
        (ap.raw || []).forEach(function (v, i) { vars[i + 1] = v; });
        m.forEach(function (line) {
          line = line.trim();
          if (!line || line[0] === '0') return;
          var def = line.match(/^\$(\d+)\s*=\s*(.+)$/);
          if (def) { vars[def[1]] = calc(def[2], vars); return; }
          var f = line.split(',').map(function (x) { return calc(x, vars); });
          var code = f[0], clear = f[1] === 0;
          var S = function (v) { return v * k; };
          if (code === 1) out.push({ circle: [].concat(rot(S(f[3]), S(f[4]), f[5] || 0), [S(f[2]) / 2]), clear: clear });
          else if (code === 20 || code === 2) {
            var x1 = S(f[3]), y1 = S(f[4]), x2 = S(f[5]), y2 = S(f[6]), wd = S(f[2]);
            var L = Math.hypot(x2 - x1, y2 - y1) || 1e-9, nx = -(y2 - y1) / L * wd / 2, ny = (x2 - x1) / L * wd / 2;
            out.push({ poly: [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]].map(function (q) { return rot(q[0], q[1], f[7] || 0); }), clear: clear });
          } else if (code === 21) out.push({ poly: rectPoly(S(f[4]), S(f[5]), S(f[2]), S(f[3]), f[6] || 0), clear: clear });
          else if (code === 4) {
            var n = Math.round(f[2]), pts = [];
            for (var i = 0; i <= n; i++) pts.push(rot(S(f[3 + i * 2]), S(f[4 + i * 2]), f[5 + n * 2] || 0));
            out.push({ poly: pts, clear: clear });
          } else if (code === 5) out.push({ poly: regPoly(S(f[3]), S(f[4]), S(f[5]), Math.max(3, Math.round(f[2])), f[6] || 0).map(function (q) { return rot(q[0], q[1], 0); }), clear: clear });
          else if (code === 7) {
            var c = rot(S(f[1]), S(f[2]), f[6] || 0);
            out.push({ circle: [c[0], c[1], S(f[3]) / 2] }, { circle: [c[0], c[1], S(f[4]) / 2], clear: true });
          }
        });
      }
    }
    return out;
  }

  /* ---------- дуги: точки для контуров и габаритов ---------- */
  function arcPoints(x0, y0, x1, y1, cx, cy, cw) {
    var r = Math.hypot(x0 - cx, y0 - cy), a0 = Math.atan2(y0 - cy, x0 - cx), a1 = Math.atan2(y1 - cy, x1 - cx);
    var sweep = cw ? a0 - a1 : a1 - a0;
    while (sweep <= 1e-9) sweep += 2 * Math.PI;
    if (Math.hypot(x1 - x0, y1 - y0) < 1e-6) sweep = 2 * Math.PI;
    var n = Math.max(4, Math.ceil(sweep / (Math.PI / 36))), pts = [];
    for (var i = 1; i <= n; i++) {
      var a = a0 + (cw ? -1 : 1) * sweep * i / n;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return pts;
  }

  /* ---------- Gerber ---------- */
  function tokens(text) {
    var out = [], i = 0, n = text.length;
    while (i < n) {
      var ch = text[i];
      if (ch === '%') {
        var j = text.indexOf('%', i + 1);
        if (j < 0) j = n;
        text.slice(i + 1, j).split('*').forEach(function (s, idx, arr) {
          s = s.replace(/[\r\n]/g, '');
          if (s || idx < arr.length - 1) out.push({ ext: true, s: s, first: idx === 0, block: arr });
        });
        i = j + 1;
      } else if (/\s/.test(ch)) i++;
      else {
        var k = text.indexOf('*', i);
        if (k < 0) k = n;
        out.push({ ext: false, s: text.slice(i, k).replace(/\s+/g, '') });
        i = k + 1;
      }
    }
    return out;
  }

  G.parseGerber = function (text) {
    var fmt = { z: 'L', xi: 3, xd: 6, yi: 3, yd: 6 }, k = 1, aps = {}, macros = {}, cur = null;
    var x = 0, y = 0, interp = 1, multi = true, region = null, clear = false;
    var ops = [], attrs = {}, warn = {}, used = {};
    var box = [Infinity, Infinity, -Infinity, -Infinity];
    function grow(px, py, r) {
      r = r || 0;
      if (px - r < box[0]) box[0] = px - r; if (py - r < box[1]) box[1] = py - r;
      if (px + r > box[2]) box[2] = px + r; if (py + r > box[3]) box[3] = py + r;
    }
    function num(v, axis) {
      if (v == null) return null;
      if (v.indexOf('.') >= 0) return parseFloat(v) * k;
      var neg = v[0] === '-', d = v.replace(/^[+-]/, ''), dec = axis === 'x' ? fmt.xd : fmt.yd, tot = dec + (axis === 'x' ? fmt.xi : fmt.yi);
      if (fmt.z === 'T') while (d.length < tot) d += '0';
      var val = parseInt(d, 10) / Math.pow(10, dec);
      return (neg ? -val : val) * k;
    }
    var T = tokens(text), mac = null;
    for (var t = 0; t < T.length; t++) {
      var tk = T[t], s = tk.s;
      if (tk.ext) {
        if (mac) { if (tk.first) mac = null; else { if (s) mac.push(s); continue; } }
        if (!s) continue;
        var c2 = s.slice(0, 2);
        if (c2 === 'FS') {
          var m = s.match(/^FS([LT])?[AI]?X(\d)(\d)Y(\d)(\d)/);
          if (m) fmt = { z: m[1] || 'L', xi: +m[2], xd: +m[3], yi: +m[4], yd: +m[5] };
        } else if (c2 === 'MO') k = s.indexOf('IN') > 0 ? 25.4 : 1;
        else if (c2 === 'AM') { mac = macros[s.slice(2)] = []; }
        else if (c2 === 'AD') {
          var a = s.match(/^ADD(\d+)([^,]+)(?:,(.*))?$/);
          if (a) {
            var raw = a[3] ? a[3].split('X').map(parseFloat) : [];
            var std = /^[CROP]$/.test(a[2]);
            aps[a[1]] = { type: a[2], params: std ? raw.map(function (v, i) { return a[2] === 'P' && (i === 1 || i === 2) ? v : v * k; }) : raw, raw: raw };
          }
        } else if (c2 === 'LP') clear = s[2] === 'C';
        else if (c2 === 'TF') {
          var tf = s.slice(3).split(',');
          attrs[tf[0]] = tf.slice(1);
        } else if (c2 === 'SR' && s !== 'SR') warn.sr = 'Шаг-повтор (SR) не поддерживается — показан один экземпляр';
        else if (c2 === 'LM' || c2 === 'LR' || c2 === 'LS') warn.lx = 'Зеркалирование/поворот апертур (LM/LR/LS) не поддерживаются';
        else if (c2 === 'IN' || c2 === 'IP' || c2 === 'OF') { /* устаревшие параметры — пропускаем */ }
        continue;
      }
      if (!s || s.indexOf('G04') === 0 || s === 'G4') continue;
      if (s === 'M02' || s === 'M00' || s === 'M2') break;
      if (s === 'G36') { region = { pts: [], contours: [] }; continue; }
      if (s === 'G37') {
        if (region) {
          if (region.pts.length > 2) region.contours.push(region.pts);
          if (region.contours.length) ops.push({ t: 'region', contours: region.contours, clear: clear });
        }
        region = null; continue;
      }
      if (s === 'G74') { multi = false; continue; }
      if (s === 'G75') { multi = true; continue; }
      if (s === 'G70') { k = 25.4; continue; }
      if (s === 'G71') { k = 1; continue; }
      var g = s.match(/^G0?([123])(?=\D|$)/);
      if (g) { interp = +g[1]; s = s.slice(g[0].length); }
      s = s.replace(/^G5[45]/, '');
      var dsel = s.match(/^D(\d+)$/);
      if (dsel) { if (+dsel[1] >= 10) cur = dsel[1]; continue; }
      if (!s) continue;
      var w = {}, re = /([XYIJD])([+-]?[\d.]+)/g, mm;
      while ((mm = re.exec(s))) w[mm[1]] = mm[2];
      var nx = w.X != null ? num(w.X, 'x') : x, ny = w.Y != null ? num(w.Y, 'y') : y;
      var d = w.D != null ? parseInt(w.D, 10) : (w.X != null || w.Y != null ? 1 : 0);
      if (d >= 10) { cur = String(d); continue; }
      if (d === 1) {
        var arc = null;
        if (interp !== 1) {
          var I = w.I != null ? num(w.I, 'x') : 0, J = w.J != null ? num(w.J, 'y') : 0, cx, cy;
          if (multi) { cx = x + I; cy = y + J; }
          else {
            var best = null;
            [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (sg) {
              var px = x + sg[0] * Math.abs(I), py = y + sg[1] * Math.abs(J);
              var e = Math.abs(Math.hypot(x - px, y - py) - Math.hypot(nx - px, ny - py));
              var sw = arcPoints(x, y, nx, ny, px, py, interp === 2).length;
              if (!best || e + sw * 1e-6 < best.e) best = { e: e + sw * 1e-6, cx: px, cy: py };
            });
            cx = best.cx; cy = best.cy;
          }
          arc = { cx: cx, cy: cy, cw: interp === 2 };
        }
        if (region) {
          if (!region.pts.length) region.pts.push([x, y]);
          if (arc) region.pts = region.pts.concat(arcPoints(x, y, nx, ny, arc.cx, arc.cy, arc.cw));
          else region.pts.push([nx, ny]);
          grow(nx, ny);
        } else {
          var ap = aps[cur] || { type: 'C', params: [0], raw: [] };
          var width = ap.type === 'C' ? ap.params[0] : Math.min(ap.params[0] || 0, ap.params[1] || ap.params[0] || 0);
          if (ap.type !== 'C') warn.rstroke = 'Дорожки прямоугольной апертурой показаны скруглёнными';
          var op = { t: 'stroke', w: width, x0: x, y0: y, x1: nx, y1: ny, clear: clear, ap: cur };
          if (arc) { op.arc = arc; arcPoints(x, y, nx, ny, arc.cx, arc.cy, arc.cw).forEach(function (p) { grow(p[0], p[1], width / 2); }); }
          ops.push(op); used[cur] = (used[cur] || 0) + 1;
          grow(x, y, width / 2); grow(nx, ny, width / 2);
        }
      } else if (d === 2) {
        if (region && region.pts.length > 2) region.contours.push(region.pts);
        if (region) region.pts = [];
      } else if (d === 3) {
        var fa = aps[cur];
        if (fa) {
          if (!fa.shapes) fa.shapes = apertureShapes(fa, macros, k);
          ops.push({ t: 'flash', x: nx, y: ny, ap: cur, clear: clear });
          fa.shapes.forEach(function (sh) {
            if (sh.circle) grow(nx + sh.circle[0], ny + sh.circle[1], sh.circle[2]);
            else sh.poly.forEach(function (p) { grow(nx + p[0], ny + p[1]); });
          });
        }
      }
      x = nx; y = ny;
    }
    Object.keys(aps).forEach(function (id) { if (!aps[id].shapes) aps[id].shapes = apertureShapes(aps[id], macros, k); });
    return { kind: 'gerber', ops: ops, aps: aps, attrs: attrs, box: box, warnings: Object.keys(warn).map(function (w) { return warn[w]; }) };
  };

  /* ---------- Excellon ---------- */
  G.parseExcellon = function (text) {
    var tools = {}, tool = null, k = 1, zeros = 'LZ', idig = 3, ddig = 3, holes = [], slots = [], plated = null;
    var x = 0, y = 0, routing = false, down = false, attrs = {};
    function num(v) {
      if (v.indexOf('.') >= 0) return parseFloat(v) * k;
      var neg = v[0] === '-', d = v.replace(/^[+-]/, ''), val;
      if (zeros === 'LZ') { while (d.length < idig + ddig) d += '0'; val = parseInt(d, 10) / Math.pow(10, ddig); }
      else val = parseInt(d, 10) / Math.pow(10, ddig);
      return (neg ? -val : val) * k;
    }
    text.split(/\r?\n/).forEach(function (raw) {
      var l = raw.trim();
      if (!l) return;
      if (l[0] === ';') {
        var ff = l.match(/TF\.FileFunction,(\w+)/);
        if (ff) { attrs.FileFunction = ff[1]; plated = /^Plated/i.test(ff[1]) ? true : /NonPlated/i.test(ff[1]) ? false : plated; }
        if (/NON_PLATED|NPTH/i.test(l) && plated === null) plated = false;
        var f = l.match(/FORMAT=\{(\d)+:(\d)+/);
        if (f) { idig = +f[1]; ddig = +f[2]; }
        return;
      }
      var u = l.match(/^(METRIC|INCH)(?:,(LZ|TZ))?(?:,(0+)\.(0+))?/);
      if (u) {
        k = u[1] === 'INCH' ? 25.4 : 1;
        if (u[2]) zeros = u[2];
        if (u[3]) { idig = u[3].length; ddig = u[4].length; } else if (u[1] === 'INCH') { idig = 2; ddig = 4; }
        return;
      }
      if (l === 'M71') { k = 1; return; }
      if (l === 'M72') { k = 25.4; return; }
      var td = l.match(/^T(\d+).*?C([\d.]+)/);
      if (td) { tools[+td[1]] = parseFloat(td[2]) * k; return; }
      var ts = l.match(/^T(\d+)$/);
      if (ts) { tool = +ts[1]; return; }
      if (l === 'M15') { down = true; return; }
      if (l === 'M16' || l === 'M17') { down = false; return; }
      if (/^G00/.test(l)) { routing = true; down = false; l = l.slice(3); }
      else if (/^G0?1(?=X|Y|$)/.test(l)) { l = l.replace(/^G0?1/, ''); }
      else if (l === 'G05' || l === 'G5' || l === 'G90') { routing = false; return; }
      var slot = l.match(/^(X[+-]?[\d.]+)?(Y[+-]?[\d.]+)?G85(X[+-]?[\d.]+)?(Y[+-]?[\d.]+)?/);
      if (slot) {
        var sx = slot[1] ? num(slot[1].slice(1)) : x, sy = slot[2] ? num(slot[2].slice(1)) : y;
        var ex = slot[3] ? num(slot[3].slice(1)) : sx, ey = slot[4] ? num(slot[4].slice(1)) : sy;
        slots.push({ x0: sx, y0: sy, x1: ex, y1: ey, d: tools[tool] || 0.8 });
        x = ex; y = ey; return;
      }
      var mx = l.match(/X([+-]?[\d.]+)/), my = l.match(/Y([+-]?[\d.]+)/);
      if (!mx && !my) return;
      var nx = mx ? num(mx[1]) : x, ny = my ? num(my[1]) : y;
      if (routing && down) slots.push({ x0: x, y0: y, x1: nx, y1: ny, d: tools[tool] || 0.8 });
      else if (!routing) holes.push({ x: nx, y: ny, d: tools[tool] || 0.8 });
      x = nx; y = ny;
    });
    var box = [Infinity, Infinity, -Infinity, -Infinity];
    holes.forEach(function (h) { box = [Math.min(box[0], h.x - h.d / 2), Math.min(box[1], h.y - h.d / 2), Math.max(box[2], h.x + h.d / 2), Math.max(box[3], h.y + h.d / 2)]; });
    slots.forEach(function (h) { [[h.x0, h.y0], [h.x1, h.y1]].forEach(function (p) { box = [Math.min(box[0], p[0] - h.d / 2), Math.min(box[1], p[1] - h.d / 2), Math.max(box[2], p[0] + h.d / 2), Math.max(box[3], p[1] + h.d / 2)]; }); });
    return { kind: 'drill', holes: holes, slots: slots, tools: tools, plated: plated, attrs: attrs, box: box, warnings: [] };
  };

  /* ---------- определение слоя по X2-атрибутам и имени файла ---------- */
  var KINDS = {
    'F.Cu': { side: 'top', type: 'copper' }, 'B.Cu': { side: 'bottom', type: 'copper' }, 'In.Cu': { side: 'inner', type: 'copper' },
    'F.Mask': { side: 'top', type: 'mask' }, 'B.Mask': { side: 'bottom', type: 'mask' },
    'F.Silk': { side: 'top', type: 'silk' }, 'B.Silk': { side: 'bottom', type: 'silk' },
    'F.Paste': { side: 'top', type: 'paste' }, 'B.Paste': { side: 'bottom', type: 'paste' },
    'Edge': { side: 'all', type: 'edge' }, 'Drill': { side: 'all', type: 'drill' }, 'Other': { side: 'all', type: 'other' }
  };
  G.KINDS = KINDS;
  G.identify = function (name, parsed) {
    var n = name.toLowerCase(), ff = parsed && parsed.attrs && parsed.attrs.FileFunction;
    if (parsed && parsed.kind === 'drill') return 'Drill';
    if (ff) {
      var f0 = ff[0], side = (ff[1] || '') + ' ' + (ff[2] || '');
      if (f0 === 'Copper') return /Top/.test(side) ? 'F.Cu' : /Bot/.test(side) ? 'B.Cu' : 'In.Cu';
      if (f0 === 'Soldermask') return /Bot/.test(side) ? 'B.Mask' : 'F.Mask';
      if (f0 === 'Legend') return /Bot/.test(side) ? 'B.Silk' : 'F.Silk';
      if (f0 === 'Paste') return /Bot/.test(side) ? 'B.Paste' : 'F.Paste';
      if (f0 === 'Profile') return 'Edge';
      if (/Drill|Plated/.test(f0)) return 'Drill';
    }
    var ext = n.split('.').pop();
    var byExt = { gtl: 'F.Cu', cmp: 'F.Cu', top: 'F.Cu', gbl: 'B.Cu', sol: 'B.Cu', bot: 'B.Cu', gts: 'F.Mask', stc: 'F.Mask', gbs: 'B.Mask', sts: 'B.Mask',
      gto: 'F.Silk', plc: 'F.Silk', gbo: 'B.Silk', pls: 'B.Silk', gtp: 'F.Paste', crc: 'F.Paste', gbp: 'B.Paste', crs: 'B.Paste',
      gm1: 'Edge', gko: 'Edge', gml: 'Edge', gm: 'Edge', dim: 'Edge', drl: 'Drill', xln: 'Drill', exc: 'Drill', drd: 'Drill' };
    if (byExt[ext]) return byExt[ext];
    if (/^g\d+$|^gp\d+$/.test(ext) || /in\d+[_.]cu/.test(n)) return 'In.Cu';
    var pairs = [[/f[_.]cu|top[_ ]?copper|copper[_ ]?top/, 'F.Cu'], [/b[_.]cu|bot(tom)?[_ ]?copper|copper[_ ]?bot/, 'B.Cu'], [/f[_.]mask|top[_ ]?(solder)?mask/, 'F.Mask'], [/b[_.]mask|bot(tom)?[_ ]?(solder)?mask/, 'B.Mask'],
      [/f[_.]silk|top[_ ]?silk|legend[_ ]?top/, 'F.Silk'], [/b[_.]silk|bot(tom)?[_ ]?silk/, 'B.Silk'], [/f[_.]paste|top[_ ]?paste/, 'F.Paste'], [/b[_.]paste|bot(tom)?[_ ]?paste/, 'B.Paste'],
      [/edge[_.]cuts|outline|profile|board[_ ]?edge/, 'Edge'], [/drill|npth|pth/, 'Drill']];
    for (var i = 0; i < pairs.length; i++) if (pairs[i][0].test(n)) return pairs[i][1];
    return 'Other';
  };
  G.isDrillText = function (name, text) { return /\.(drl|xln|exc|drd)$/i.test(name) || /^\s*M48/m.test(text.slice(0, 200)); };
  G.parseFile = function (name, text) {
    var p = G.isDrillText(name, text) ? G.parseExcellon(text) : G.parseGerber(text);
    p.name = name;
    p.layer = G.identify(name, p);
    if (p.layer === 'Drill' && p.plated === null) p.plated = !/npth|non.?plated/i.test(name);
    return p;
  };

  /* ---------- контур платы из Edge.Cuts: сшиваем отрезки в замкнутые контуры ---------- */
  G.outline = function (edge) {
    if (!edge) return [];
    var segs = [];
    edge.ops.forEach(function (o) {
      if (o.t === 'stroke') {
        var pts = [[o.x0, o.y0]].concat(o.arc ? arcPoints(o.x0, o.y0, o.x1, o.y1, o.arc.cx, o.arc.cy, o.arc.cw) : [[o.x1, o.y1]]);
        segs.push(pts);
      } else if (o.t === 'region') o.contours.forEach(function (c) { segs.push(c.concat([c[0]])); });
    });
    var eps = 0.02, loops = [];
    function same(a, b) { return Math.abs(a[0] - b[0]) < eps && Math.abs(a[1] - b[1]) < eps; }
    while (segs.length) {
      var loop = segs.shift().slice(), grew = true;
      while (grew && !(loop.length > 2 && same(loop[0], loop[loop.length - 1]))) {
        grew = false;
        for (var i = 0; i < segs.length; i++) {
          var s = segs[i], end = loop[loop.length - 1];
          if (same(s[0], end)) { loop = loop.concat(s.slice(1)); }
          else if (same(s[s.length - 1], end)) { loop = loop.concat(s.slice().reverse().slice(1)); }
          else if (same(s[s.length - 1], loop[0])) { loop = s.slice(0, -1).concat(loop); }
          else if (same(s[0], loop[0])) { loop = s.slice(1).reverse().concat(loop); }
          else continue;
          segs.splice(i, 1); grew = true; break;
        }
      }
      if (loop.length > 2 && same(loop[0], loop[loop.length - 1])) loops.push(loop);
    }
    return loops;
  };

  /* ---------- ZIP (store и deflate через DecompressionStream) ---------- */
  G.unzip = function (buf) {
    var u8 = new Uint8Array(buf), dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    var eocd = -1;
    for (var i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) return Promise.reject(new Error('Это не ZIP-архив или он повреждён'));
    var count = dv.getUint16(eocd + 10, true), p = dv.getUint32(eocd + 16, true), files = [];
    for (var n = 0; n < count; n++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      var method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nlen = dv.getUint16(p + 28, true),
        xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), loff = dv.getUint32(p + 42, true), flags = dv.getUint16(p + 8, true);
      var name = new TextDecoder(flags & 0x800 ? 'utf-8' : 'utf-8').decode(u8.subarray(p + 46, p + 46 + nlen));
      var ds = loff + 30 + dv.getUint16(loff + 26, true) + dv.getUint16(loff + 28, true);
      if (!/\/$/.test(name)) files.push({ name: name, method: method, data: u8.subarray(ds, ds + csize) });
      p += 46 + nlen + xlen + clen;
    }
    return Promise.all(files.map(function (f) {
      if (f.method === 0) return Promise.resolve({ name: f.name, bytes: f.data });
      if (f.method !== 8) return Promise.resolve({ name: f.name, error: 'метод сжатия ' + f.method });
      if (typeof DecompressionStream === 'undefined') return Promise.resolve({ name: f.name, error: 'браузер не умеет распаковывать ZIP — распакуйте архив и выберите файлы' });
      var stream = new Blob([f.data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return new Response(stream).arrayBuffer().then(function (b) { return { name: f.name, bytes: new Uint8Array(b) }; }, function (e) { return { name: f.name, error: String(e) }; });
    }));
  };

  /* ---------- сборка платы из набора файлов ---------- */
  G.board = function (files) {
    var layers = [], skipped = [], empty = [];
    files.forEach(function (f) {
      var base = f.name.split('/').pop();
      if (f.error) { skipped.push(base + ' — ' + f.error); return; }
      if (/\.(gbrjob|pdf|png|jpe?g|svg|kicad_\w+|csv|pos|rpt|html?|md|json)$/i.test(base) || base[0] === '.') { skipped.push(base); return; }
      var text = f.text != null ? f.text : new TextDecoder().decode(f.bytes);
      if (/[\x00-\x08\x0e-\x1a]/.test(text.slice(0, 400))) { skipped.push(base + ' — не текстовый файл'); return; }
      if (!/%FS|%MO|M48|G0[1-4]|D0?[123]\*/.test(text.slice(0, 20000))) { skipped.push(base + ' — не Gerber и не сверловка'); return; }
      try {
        var p = G.parseFile(base, text);
        if (p.kind === 'gerber' && !p.ops.length) { empty.push(base); return; }
        p.size = text.length;
        layers.push(p);
      } catch (e) { skipped.push(base + ' — ошибка разбора: ' + e.message); }
    });
    var edge = layers.find(function (l) { return l.layer === 'Edge'; });
    var loops = G.outline(edge);
    var box = [Infinity, Infinity, -Infinity, -Infinity];
    function add(b) { if (isFinite(b[0])) box = [Math.min(box[0], b[0]), Math.min(box[1], b[1]), Math.max(box[2], b[2]), Math.max(box[3], b[3])]; }
    if (loops.length) loops.forEach(function (l) { l.forEach(function (p) { add([p[0], p[1], p[0], p[1]]); }); });
    else layers.forEach(function (l) { add(l.box); });
    return { layers: layers, skipped: skipped, empty: empty, outline: loops, box: box };
  };

  /* ---------- сводка для проверки перед заказом ---------- */
  function mm(v, n) { return v.toFixed(n).replace('.', ','); }
  G.report = function (b) {
    var r = { w: b.box[2] - b.box[0], h: b.box[3] - b.box[1], copper: 0, pth: 0, npth: 0, via: 0, minTrack: Infinity, minDrill: Infinity, tools: {}, checks: [] };
    b.layers.forEach(function (l) {
      if (l.layer === 'F.Cu' || l.layer === 'B.Cu' || l.layer === 'In.Cu') {
        r.copper++;
        l.ops.forEach(function (o) { if (o.t === 'stroke' && !o.clear && o.w > 0 && o.w < r.minTrack) r.minTrack = o.w; });
      }
      if (l.kind === 'drill') {
        l.holes.concat(l.slots).forEach(function (h) {
          if (l.plated) r.pth++; else r.npth++;
          if (h.d < r.minDrill) r.minDrill = h.d;
          var key = h.d.toFixed(2) + (l.plated ? '' : ' NPTH');
          r.tools[key] = (r.tools[key] || 0) + 1;
        });
      }
    });
    var has = function (id) { return b.layers.some(function (l) { return l.layer === id; }); };
    var c = r.checks;
    c.push(b.outline.length ? ['ok', 'Контур платы замкнут (Edge.Cuts)'] : has('Edge') ? ['bad', 'Контур платы не замкнут — завод не поймёт форму платы'] : ['bad', 'Нет файла контура (Edge.Cuts / .gm1)']);
    c.push(r.copper >= 1 ? ['ok', 'Медных слоёв: ' + r.copper] : ['bad', 'Нет ни одного медного слоя']);
    c.push(has('F.Mask') || has('B.Mask') ? ['ok', 'Паяльная маска есть'] : ['warn', 'Нет слоёв маски — плата будет без маски']);
    c.push(has('F.Silk') || has('B.Silk') ? ['ok', 'Шелкография есть'] : ['warn', 'Нет шелкографии']);
    c.push(has('Drill') ? ['ok', 'Сверловка: ' + (r.pth + r.npth) + ' отв.'] : ['warn', 'Нет файла сверловки (.drl) — если на плате есть отверстия, добавьте его']);
    if (isFinite(r.minTrack)) c.push(r.minTrack >= 0.127 ? ['ok', 'Мин. дорожка ' + mm(r.minTrack, 3) + ' мм (≥ 0,127 мм)'] : ['bad', 'Дорожка ' + mm(r.minTrack, 3) + ' мм тоньше 0,127 мм — большинство заводов не сделает']);
    if (isFinite(r.minDrill)) c.push(r.minDrill >= 0.3 ? ['ok', 'Мин. отверстие ' + mm(r.minDrill, 2) + ' мм'] : r.minDrill >= 0.2 ? ['warn', 'Отверстие ' + mm(r.minDrill, 2) + ' мм — доступно не на всех заводах (часто за доплату)'] : ['bad', 'Отверстие ' + mm(r.minDrill, 2) + ' мм слишком мало']);
    if (r.w > 0 && (r.w > 500 || r.h > 500)) c.push(['warn', 'Плата больше 500 мм — проверьте единицы измерения']);
    return r;
  };

  G.arcPoints = arcPoints;
  root.KM = root.KM || {};
  root.KM.gerber = G;
})(typeof window !== 'undefined' ? window : globalThis);
