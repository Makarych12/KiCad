/* =========================================================
   Движок симулятора: модифицированный метод узловых потенциалов (MNA).
   - резисторы, провода, ключи — проводимости;
   - источники напряжения — дополнительные неизвестные токи;
   - диоды и светодиоды — модель Шокли, итерации Ньютона с ограничением шага;
   - конденсаторы — неявный метод Эйлера (переходные процессы).
   ========================================================= */
KM.Sim = (function () {
  var VT = 0.025852;
  var LED_VF = { red: 1.9, orange: 2.0, yellow: 2.05, green: 2.2, blue: 2.9, white: 3.0 };
  // Модель светодиода: Is подобран так, чтобы при 10 мА падение было ≈ Vf (n = 2), плюс Rs = 8 Ом
  function ledParams(color) {
    var vf = LED_VF[color] || 2, n = 2, rs = 8;
    var vj = vf - 0.01 * rs;
    return { n: n, is: 0.01 / Math.exp(vj / (n * VT)), rs: rs, imax: 0.05 };
  }
  var DIODE = { n: 1.9, is: 2.52e-9, rs: 0.1 }; // ≈ 1N4148 / 1N4007: 0,6–0,7 В на миллиамперах

  function solveLinear(A, b) {
    var n = b.length, i, j, k;
    for (i = 0; i < n; i++) {
      var max = Math.abs(A[i][i]), row = i;
      for (k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > max) { max = Math.abs(A[k][i]); row = k; }
      if (max < 1e-18) return null;
      if (row !== i) { var t = A[i]; A[i] = A[row]; A[row] = t; var tb = b[i]; b[i] = b[row]; b[row] = tb; }
      for (k = i + 1; k < n; k++) {
        var f = A[k][i] / A[i][i];
        if (f === 0) continue;
        for (j = i; j < n; j++) A[k][j] -= f * A[i][j];
        b[k] -= f * b[i];
      }
    }
    var x = new Array(n);
    for (i = n - 1; i >= 0; i--) { var s = b[i]; for (j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; }
    return x;
  }

  /*
    parts: [{id, type, a:'c,r', b:'c,r', value, on, color, burned}]
    Типы: wire, R, V, LED, D, SW, LAMP, C, AM (амперметр), GND (a — узел земли)
    V: вывод b — «плюс». LED/D: a — анод, b — катод.
  */
  function Circuit() { this.caps = {}; this.t = 0; this.v = {}; this.results = {}; }

  Circuit.prototype.step = function (parts, dt) {
    // узлы
    var nodeIdx = {}, nodes = [];
    function node(k) { if (!(k in nodeIdx)) { nodeIdx[k] = nodes.length; nodes.push(k); } return nodeIdx[k]; }
    var gndKey = null;
    parts.forEach(function (p) { if (p.type === 'GND') gndKey = p.a; });
    if (!gndKey) { var v = parts.find(function (p) { return p.type === 'V'; }); if (v) gndKey = v.a; }
    if (!gndKey && parts.length) gndKey = parts[0].a;
    if (!gndKey) { this.results = {}; this.v = {}; return { ok: true, empty: true }; }
    node(gndKey);
    var active = parts.filter(function (p) { return p.type !== 'GND'; });
    active.forEach(function (p) { node(p.a); node(p.b); if (p.type === 'LED' || p.type === 'D') node(p.id + ':j'); });
    var N = nodes.length;
    var vsrc = active.filter(function (p) { return p.type === 'V' || p.type === 'AM'; });
    var M = N - 1 + vsrc.length;
    var self = this;
    var prevV = this.v;
    var guess = nodes.map(function (k) { return prevV[k] || 0; });
    guess[0] = 0;

    function build(vg) {
      var A = [], b = [], i;
      for (i = 0; i < M; i++) { A.push(new Float64Array(M)); b.push(0); }
      function stamp(na, nb, g) {
        var ia = na - 1, ib = nb - 1;
        if (ia >= 0) A[ia][ia] += g;
        if (ib >= 0) A[ib][ib] += g;
        if (ia >= 0 && ib >= 0) { A[ia][ib] -= g; A[ib][ia] -= g; }
      }
      function cur(na, nb, I) { // источник тока I через элемент из узла na в узел nb
        if (na - 1 >= 0) b[na - 1] -= I;
        if (nb - 1 >= 0) b[nb - 1] += I;
      }
      // малая проводимость на землю для устойчивости «висящих» узлов
      for (i = 1; i < N; i++) A[i - 1][i - 1] += 1e-9;
      active.forEach(function (p) {
        var na = nodeIdx[p.a], nb = nodeIdx[p.b];
        switch (p.type) {
          case 'wire': stamp(na, nb, 1e3); break;
          case 'R': stamp(na, nb, 1 / Math.max(1e-3, p.value)); break;
          case 'LAMP': stamp(na, nb, 1 / Math.max(1e-3, p.value)); break;
          case 'SW': stamp(na, nb, p.on ? 1e3 : 1e-12); break;
          case 'C': {
            var g = p.value / dt, vprev = self.caps[p.id] || 0;
            stamp(na, nb, g); cur(na, nb, -g * vprev); // Ieq = g·Vprev, направлен из b в a
            break;
          }
          case 'LED': case 'D': {
            // анод —[Rs]— внутренний узел j —[переход]— катод
            var nj = nodeIdx[p.id + ':j'];
            if (p.burned) { stamp(na, nj, 1e-12); stamp(nj, nb, 1e-12); break; }
            var m = p.type === 'LED' ? ledParams(p.color) : DIODE;
            stamp(na, nj, 1 / m.rs);
            var nvt = m.n * VT, vcrit = nvt * Math.log(nvt / (Math.SQRT2 * m.is));
            var vd = Math.min((vg[nj] || 0) - (vg[nb] || 0), vcrit + 10 * nvt);
            var ex = Math.exp(vd / nvt), id = m.is * (ex - 1), gd = m.is * ex / nvt + 1e-12;
            stamp(nj, nb, gd); cur(nj, nb, id - gd * vd);
            break;
          }
        }
      });
      vsrc.forEach(function (p, k) {
        var row = N - 1 + k, na = nodeIdx[p.a] - 1, nb = nodeIdx[p.b] - 1;
        // V(b) − V(a) = E
        if (nb >= 0) { A[row][nb] += 1; A[nb][row] += 1; }
        if (na >= 0) { A[row][na] -= 1; A[na][row] -= 1; }
        b[row] = p.type === 'V' ? p.value : 0;
      });
      return { A: A, b: b };
    }

    var x = null, vg = guess.slice(), it, converged = false;
    var hasNl = active.some(function (p) { return p.type === 'LED' || p.type === 'D'; });
    for (it = 0; it < (hasNl ? 300 : 1); it++) {
      var sys = build(vg);
      x = solveLinear(sys.A, sys.b);
      if (!x) break;
      var nv = [0].concat(x.slice(0, N - 1)), maxd = 0;
      for (var i = 0; i < N; i++) {
        var d = nv[i] - vg[i];
        // демпфирование нелинейных схем: не более 1 В за итерацию
        if (hasNl && Math.abs(d) > 1) d = d > 0 ? 1 : -1;
        maxd = Math.max(maxd, Math.abs(d));
        vg[i] += d;
      }
      if (maxd < 1e-6) { converged = true; break; }
    }
    if (!x) return { ok: false, error: 'Схема не решается: возможно, источник замкнут накоротко или соединён параллельно с другим источником.' };

    var V = {};
    nodes.forEach(function (k, i) { V[k] = vg[i]; });
    this.v = V;
    var res = {}, warnings = [];
    active.forEach(function (p) {
      var va = V[p.a], vb = V[p.b], vd = va - vb, I = 0;
      switch (p.type) {
        case 'wire': I = vd * 1e3; break;
        case 'R': case 'LAMP': I = vd / p.value; break;
        case 'SW': I = p.on ? vd * 1e3 : 0; break;
        case 'C': I = p.value / dt * (vd - (self.caps[p.id] || 0)); self.caps[p.id] = vd; break;
        case 'LED': case 'D': {
          if (p.burned) { I = 0; break; }
          var m = p.type === 'LED' ? ledParams(p.color) : DIODE;
          I = (va - V[p.id + ':j']) / m.rs;
          if (p.type === 'LED' && I > m.imax) { p.burned = true; warnings.push({ id: p.id, text: 'Светодиод сгорел: ток ' + (I * 1000).toFixed(0) + ' мА. Поставьте резистор!' }); }
          break;
        }
      }
      res[p.id] = { va: va, vb: vb, v: vd, i: I, p: Math.abs(vd * I) };
    });
    vsrc.forEach(function (p, k) {
      var I = x[N - 1 + k]; res[p.id].i = -I; res[p.id].p = Math.abs(I * (res[p.id].v));
      if (p.type === 'V' && Math.abs(I) > 5) warnings.push({ id: p.id, text: 'Короткое замыкание! Ток источника ' + Math.abs(I).toFixed(0) + ' А — настоящая батарея нагреется или выйдет из строя.' });
    });
    active.forEach(function (p) { if (p.type === 'R' && res[p.id].p > (p.pmax || 0.25)) warnings.push({ id: p.id, soft: true, text: 'Резистор ' + p.label + ' рассеивает ' + res[p.id].p.toFixed(2) + ' Вт — больше 0,25 Вт, он перегреется.' }); });
    this.results = res;
    this.t += dt;
    return { ok: true, converged: converged || !hasNl, warnings: warnings, gnd: gndKey };
  };
  Circuit.prototype.reset = function () { this.caps = {}; this.t = 0; this.v = {}; this.results = {}; };

  return { Circuit: Circuit, LED_VF: LED_VF };
})();
