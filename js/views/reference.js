/* Справочник: горячие клавиши, таблицы, калькуляторы, глоссарий */
(function () {
  var tab = 'hotkeys';
  function useCalc(id) { if (!KM.store.state.calcUses[id]) { KM.store.state.calcUses[id] = Date.now(); KM.store.touch(); KM.game.check(); } }
  function nearestE(v, series, up) {
    var E = KM.data.eSeries[series], dec = Math.pow(10, Math.floor(Math.log10(v))), best = null;
    [dec / 10, dec, dec * 10].forEach(function (d) { E.forEach(function (m) { var x = +(m * d).toPrecision(3); if (up && x < v * 0.9999) return; if (!best || Math.abs(Math.log(x / v)) < Math.abs(Math.log(best / v))) best = x; }); });
    return best;
  }
  function num(root, id) { return KM.parseSI(KM.$('#' + id, root).value); }
  function res(val, extra) { return '<div class="v">' + val + '</div>' + (extra ? '<div class="small">' + extra + '</div>' : ''); }
  function inp(id, label, val, unit) { return '<div class="field"><label for="' + id + '">' + label + '</label><div class="input-unit"><input type="text" id="' + id + '" value="' + val + '" inputmode="decimal"><span>' + unit + '</span></div></div>'; }

  var CALCS = [
    { id: 'ohm', title: 'Закон Ома и мощность', html: '<p class="small muted">Заполните любые два поля — остальные рассчитаются.</p><div class="inputs">' + inp('oU', 'Напряжение U', '5', 'В') + inp('oI', 'Ток I', '', 'А') + inp('oR', 'Сопротивление R', '330', 'Ом') + inp('oP', 'Мощность P', '', 'Вт') + '</div>',
      calc: function (r) {
        var U = num(r, 'oU'), I = num(r, 'oI'), R = num(r, 'oR'), P = num(r, 'oP'), f = function (x) { return isFinite(x) && x > 0; };
        if (f(U) && f(R)) { I = U / R; P = U * I; } else if (f(U) && f(I)) { R = U / I; P = U * I; } else if (f(I) && f(R)) { U = I * R; P = U * I; }
        else if (f(P) && f(U)) { I = P / U; R = U / I; } else if (f(P) && f(I)) { U = P / I; R = U / I; } else if (f(P) && f(R)) { I = Math.sqrt(P / R); U = I * R; }
        else return 'Введите два значения';
        return res('U = ' + KM.si(U, 'В') + ' · I = ' + KM.si(I, 'А'), 'R = ' + KM.si(R, 'Ом') + ' · P = ' + KM.si(P, 'Вт') + (P > 0.25 ? ' — нужен резистор мощнее 0,25 Вт' : ''));
      } },
    { id: 'led', title: 'Резистор для светодиода', html: '<div class="inputs">' + inp('lU', 'Напряжение питания', '5', 'В') + inp('lF', 'Прямое напряжение LED', '2', 'В') + inp('lI', 'Ток светодиода', '10m', 'А') + inp('lN', 'Светодиодов последовательно', '1', 'шт') + '</div>',
      calc: function (r) {
        var U = num(r, 'lU'), F = num(r, 'lF'), I = num(r, 'lI'), N = num(r, 'lN') || 1;
        var drop = U - F * N; if (!(drop > 0)) return 'Напряжения питания не хватает на ' + N + ' светодиод(а)';
        var R = drop / I, Re = nearestE(R, 'E24', true), Ir = drop / Re, P = drop * Ir;
        return res('R = ' + KM.si(R, 'Ом') + ' → ' + KM.si(Re, 'Ом') + ' (E24)', 'Фактический ток ' + KM.si(Ir, 'А') + ', мощность резистора ' + KM.si(P, 'Вт') + (P > 0.125 ? ' — для 0805 много, берите 1206 или выводной' : ''));
      } },
    { id: 'divider', title: 'Делитель напряжения', html: '<div class="inputs">' + inp('dV', 'Входное напряжение', '12', 'В') + inp('dT', 'Нужно на выходе (для подбора)', '3.3', 'В') + inp('d1', 'R1 (верхний)', '10k', 'Ом') + inp('d2', 'R2 (нижний)', '3k9', 'Ом') + '</div>',
      calc: function (r) {
        var V = num(r, 'dV'), T = num(r, 'dT'), R1 = num(r, 'd1'), R2 = num(r, 'd2');
        var out = V * R2 / (R1 + R2), best = null;
        if (T > 0 && T < V) {
          KM.data.eSeries.E24.forEach(function (a) { [1e3, 1e4].forEach(function (d1) { KM.data.eSeries.E24.forEach(function (b) { [1e3, 1e4, 1e5].forEach(function (d2) {
            var r1 = a * d1, r2 = b * d2, v = V * r2 / (r1 + r2), e = Math.abs(v - T);
            if (r1 + r2 >= 2e3 && r1 + r2 <= 2e5 && (!best || e < best.e)) best = { r1: r1, r2: r2, v: v, e: e };
          }); }); }); });
        }
        return res('Uвых = ' + KM.si(out, 'В'), 'Ток делителя ' + KM.si(V / (R1 + R2), 'А') + (best ? '<br>Подбор E24 для ' + KM.si(T, 'В') + ': R1 = ' + KM.si(best.r1, 'Ом') + ', R2 = ' + KM.si(best.r2, 'Ом') + ' → ' + KM.si(best.v, 'В', 4) : ''));
      } },
    { id: 'rc', title: 'RC-цепь: частота среза и τ', html: '<div class="inputs">' + inp('rR', 'Сопротивление', '1k', 'Ом') + inp('rC', 'Ёмкость', '100n', 'Ф') + '</div>',
      calc: function (r) { var R = num(r, 'rR'), C = num(r, 'rC'), tau = R * C; return res('fср = ' + KM.si(1 / (2 * Math.PI * tau), 'Гц'), 'τ = RC = ' + KM.si(tau, 'с') + ' · заряд до 63% за τ, до 99% за 5τ = ' + KM.si(5 * tau, 'с')); } },
    { id: 'trace', title: 'Ширина дорожки по току (IPC-2221)', html: '<div class="inputs">' + inp('tI', 'Ток', '1', 'А') + inp('tT', 'Допустимый перегрев ΔT', '10', '°C') + '<div class="field"><label for="tO">Толщина меди</label><select id="tO"><option value="1">1 oz (35 мкм)</option><option value="2">2 oz (70 мкм)</option><option value="0.5">0,5 oz (18 мкм)</option></select></div><div class="field"><label for="tL">Слой</label><select id="tL"><option value="ext">Внешний</option><option value="int">Внутренний</option></select></div></div>',
      calc: function (r) {
        var I = num(r, 'tI'), dT = num(r, 'tT'), oz = parseFloat(KM.$('#tO', r).value), ext = KM.$('#tL', r).value === 'ext';
        var k = ext ? 0.048 : 0.024, A = Math.pow(I / (k * Math.pow(dT, 0.44)), 1 / 0.725); // мил²
        var w = A / (1.378 * oz) * 0.0254; // мм
        return res('Ширина ≥ ' + w.toFixed(3) + ' мм', 'Сечение ' + A.toFixed(1) + ' мил². Формула IPC-2221 — грубая оценка; для сильноточных цепей добавляйте запас и учитывайте полигоны.');
      } },
    { id: 'ne555', title: 'NE555 в автогенераторе', html: '<div class="inputs">' + inp('n1', 'R1', '10k', 'Ом') + inp('n2', 'R2', '68k', 'Ом') + inp('nC', 'C', '10u', 'Ф') + '</div>',
      calc: function (r) { var R1 = num(r, 'n1'), R2 = num(r, 'n2'), C = num(r, 'nC'); var f = 1.44 / ((R1 + 2 * R2) * C), th = 0.693 * (R1 + R2) * C, tl = 0.693 * R2 * C; return res('f = ' + KM.si(f, 'Гц'), 'Импульс ' + KM.si(th, 'с') + ', пауза ' + KM.si(tl, 'с') + ', скважность ' + ((th / (th + tl)) * 100).toFixed(1) + '%'); } },
    { id: 'lm317', title: 'LM317: выходное напряжение', html: '<div class="inputs">' + inp('m1', 'R1 (OUT–ADJ)', '240', 'Ом') + inp('m2', 'R2 (ADJ–GND)', '720', 'Ом') + inp('mT', 'Нужно (для подбора R2)', '5', 'В') + '</div>',
      calc: function (r) { var R1 = num(r, 'm1'), R2 = num(r, 'm2'), T = num(r, 'mT'); var V = 1.25 * (1 + R2 / R1) + 50e-6 * R2; var need = (T / 1.25 - 1) * R1; return res('Uвых ≈ ' + KM.si(V, 'В'), T > 1.25 ? 'Для ' + KM.si(T, 'В') + ': R2 = ' + KM.si(need, 'Ом') + ' → E24: ' + KM.si(nearestE(need, 'E24'), 'Ом') : ''); } },
    { id: 'nearest', title: 'Ближайший стандартный номинал', html: '<div class="inputs">' + inp('eV', 'Значение', '5k1', '') + '<div class="field"><label for="eS">Ряд</label><select id="eS"><option>E24</option><option>E12</option><option>E6</option><option>E96</option></select></div></div>',
      calc: function (r) { var v = num(r, 'eV'), s = KM.$('#eS', r).value; if (!(v > 0)) return 'Введите значение'; var n = nearestE(v, s); return res(KM.si(n, ''), 'Отклонение ' + ((n / v - 1) * 100).toFixed(2) + '% · ближайший не меньше: ' + KM.si(nearestE(v, s, true), '')); } },
    { id: 'smd', title: 'Код SMD-резистора / конденсатора', html: '<div class="inputs">' + inp('sC', 'Маркировка', '472', '') + '<div class="field"><label for="sT">Тип</label><select id="sT"><option value="r">Резистор (Ом)</option><option value="c">Конденсатор (пФ)</option></select></div></div>',
      calc: function (r) {
        var c = KM.$('#sC', r).value.trim().toUpperCase(), t = KM.$('#sT', r).value, v;
        if (/R/.test(c)) v = parseFloat(c.replace('R', '.'));
        else if (/^\d{3,4}$/.test(c)) v = parseInt(c.slice(0, -1), 10) * Math.pow(10, parseInt(c.slice(-1), 10));
        else return 'Код вида 472, 1002, 4R7';
        return t === 'r' ? res(KM.si(v, 'Ом')) : res(KM.si(v * 1e-12, 'Ф'), v + ' пФ');
      } },
    { id: 'parallel', title: 'Резисторы параллельно и последовательно', html: '<div class="inputs">' + inp('pa', 'R1', '1k', 'Ом') + inp('pb', 'R2', '2k2', 'Ом') + inp('pc', 'R3 (необязательно)', '', 'Ом') + '</div>',
      calc: function (r) { var v = ['pa', 'pb', 'pc'].map(function (id) { return num(r, id); }).filter(function (x) { return x > 0; }); if (v.length < 2) return 'Нужно минимум два'; return res('Параллельно: ' + KM.si(1 / v.reduce(function (s, x) { return s + 1 / x; }, 0), 'Ом'), 'Последовательно: ' + KM.si(v.reduce(function (s, x) { return s + x; }, 0), 'Ом')); } },
    { id: 'battery', title: 'Время работы от аккумулятора', html: '<div class="inputs">' + inp('bC', 'Ёмкость', '2000m', 'А·ч') + inp('bI', 'Средний ток', '50m', 'А') + inp('bE', 'Полезная доля ёмкости', '0.8', '') + '</div>',
      calc: function (r) { var C = num(r, 'bC'), I = num(r, 'bI'), e = num(r, 'bE') || 0.8; var h = C * e / I; return res('≈ ' + (h < 48 ? h.toFixed(1) + ' ч' : (h / 24).toFixed(1) + ' сут'), 'Учтены ' + Math.round(e * 100) + '% ёмкости: саморазряд, старение, КПД преобразователей.'); } },
    { id: 'reactance', title: 'Реактивное сопротивление', html: '<div class="inputs">' + inp('xF', 'Частота', '1k', 'Гц') + inp('xC', 'Ёмкость', '100n', 'Ф') + inp('xL', 'Индуктивность', '10u', 'Гн') + '</div>',
      calc: function (r) { var f = num(r, 'xF'), C = num(r, 'xC'), L = num(r, 'xL'); return res('Xc = ' + KM.si(1 / (2 * Math.PI * f * C), 'Ом'), 'XL = ' + KM.si(2 * Math.PI * f * L, 'Ом') + ' · резонанс LC: ' + KM.si(1 / (2 * Math.PI * Math.sqrt(L * C)), 'Гц')); } },
    { id: 'antenna', title: 'Длина антенны λ/4', html: '<div class="inputs">' + inp('aF', 'Частота', '433.92M', 'Гц') + inp('aK', 'Коэффициент укорочения', '0.95', '') + '</div>',
      calc: function (r) { var f = num(r, 'aF'), k = num(r, 'aK') || 1; var l = 299792458 / f; return res('λ/4 = ' + (l / 4 * 100).toFixed(1) + ' см', 'С укорочением ×' + k + ': ' + (l / 4 * k * 100).toFixed(1) + ' см · λ = ' + (l * 100).toFixed(1) + ' см'); } }
  ];

  function colorCalc() {
    var cc = KM.data.colorCode;
    function sel(id, filter, def) { return '<select id="' + id + '">' + cc.map(function (c, i) { return filter(c) ? '<option value="' + i + '"' + (i === def ? ' selected' : '') + '>' + c.n + '</option>' : ''; }).join('') + '</select>'; }
    return '<div class="card calc" id="calc-color"><h3>🎨 Цветовая маркировка резисторов</h3><div class="field"><label>Число полос</label><select id="cbN"><option value="4">4 полосы</option><option value="5">5 полос</option></select></div>' +
      '<svg id="cbSvg" viewBox="0 0 300 70" style="width:100%;margin:10px 0"></svg><div class="band-pick" id="cbPick"></div><div class="res" id="cbRes"></div>' +
      '<div class="field" style="margin-top:12px"><label for="cbV">Или номинал → полосы</label><input type="text" id="cbV" placeholder="например 4k7"></div></div>';
  }
  function colorMount(root) {
    var cc = KM.data.colorCode, digits = cc.filter(function (c) { return c.d !== null; }), mults = cc.filter(function (c) { return c.m && c.m <= 1e9; }), tols = cc.filter(function (c) { return c.tol; });
    var st = { n: 4, b: [4, 7, 2, 10, 1] }; // жёлтый фиолетовый красный золотой → 4,7 кОм
    function opts(list, v) { return list.map(function (c) { var i = cc.indexOf(c); return '<option value="' + i + '"' + (i === v ? ' selected' : '') + ' style="background:' + c.c + '">' + c.n + '</option>'; }).join(''); }
    function draw() {
      var n = st.n, pick = KM.$('#cbPick', root);
      var roles = n === 4 ? ['d', 'd', 'm', 't'] : ['d', 'd', 'd', 'm', 't'];
      pick.style.gridTemplateColumns = 'repeat(' + n + ', 1fr)';
      pick.innerHTML = roles.map(function (role, i) { return '<select data-b="' + i + '" aria-label="Полоса ' + (i + 1) + '">' + opts(role === 'd' ? digits : role === 'm' ? mults : tols, st.b[i]) + '</select>'; }).join('');
      KM.$$('[data-b]', pick).forEach(function (s) { s.onchange = function () { st.b[+s.dataset.b] = +s.value; draw(); }; });
      var val = 0, i;
      for (i = 0; i < n - 2; i++) val = val * 10 + (cc[st.b[i]].d || 0);
      val *= cc[st.b[n - 2]].m;
      var tol = cc[st.b[n - 1]].tol;
      KM.$('#cbSvg', root).innerHTML = '<rect x="0" y="33" width="300" height="4" fill="#999"/><rect x="60" y="10" width="180" height="50" rx="22" fill="#d9c79b"/>' +
        roles.map(function (r, k) { return '<rect x="' + (88 + k * (n === 4 ? 28 : 24) + (k === n - 1 ? 18 : 0)) + '" y="10" width="14" height="50" fill="' + cc[st.b[k]].c + '" stroke="rgba(0,0,0,.15)"/>'; }).join('');
      KM.$('#cbRes', root).innerHTML = res(KM.si(val, 'Ом'), 'Допуск ±' + tol + '%');
      useCalc('color');
    }
    KM.$('#cbN', root).onchange = function () {
      st.n = +this.value;
      st.b = st.n === 4 ? [4, 7, 2, 10] : [4, 7, 0, 1, 1];
      draw();
    };
    KM.$('#cbV', root).oninput = function () {
      var v = KM.parseSI(this.value); if (!(v > 0)) return;
      var sig = st.n === 4 ? 2 : 3, e = Math.floor(Math.log10(v)) - (sig - 1), m = Math.round(v / Math.pow(10, e));
      if (m >= Math.pow(10, sig)) { m = Math.round(m / 10); e++; }
      var ds = String(m).padStart(sig, '0').split('').map(Number);
      var mi = cc.findIndex(function (c) { return Math.abs(Math.log10(c.m) - e) < 1e-6; });
      if (mi < 0) return;
      st.b = ds.map(function (d) { return cc.findIndex(function (c) { return c.d === d; }); }).concat([mi, st.n === 4 ? 10 : 1]);
      draw();
    };
    draw();
  }

  function hotkeysHtml() {
    return '<div class="row between"><p class="muted">Значения по умолчанию KiCad 8–10. Актуальный список вашей версии: <b>Справка → Список горячих клавиш</b> (<kbd>Ctrl</kbd>+<kbd>F1</kbd>).</p><button class="btn sm no-print" onclick="window.print()">🖨️ Распечатать шпаргалку</button></div>' +
      '<div class="hotkey-grid">' + KM.data.hotkeys.map(function (g) {
        return '<div class="card"><h3>' + KM.esc(g.group) + '</h3>' + g.keys.map(function (x) {
          return '<div class="hotkey-row"><span>' + KM.esc(x[1]) + '</span><span class="k">' + x[0].split(' / ').map(function (combo) { return (combo.length === 1 ? [combo] : combo.split('+')).map(function (p) { p = p.trim(); return /^[А-Яа-я]/.test(p) && p.length > 3 ? '<span class="small">' + KM.esc(p) + '</span>' : '<kbd>' + KM.esc(p) + '</kbd>'; }).join('+'); }).join(' / ') + '</span></div>';
        }).join('') + '</div>';
      }).join('') + '</div>';
  }
  function tablesHtml() {
    var cc = KM.data.colorCode;
    return '<h2>Стандартные ряды номиналов</h2><p class="muted small">Номиналы внутри каждой декады. Например, в E24 есть 4,7 → 4,7 Ом, 47 Ом, 470 Ом, 4,7 кОм…</p>' +
      ['E6', 'E12', 'E24'].map(function (s) { return '<h3>' + s + ' (±' + { E6: 20, E12: 10, E24: 5 }[s] + '%)</h3><div class="chips" style="margin-bottom:12px">' + KM.data.eSeries[s].map(function (v) { return '<span class="tag">' + v.toFixed(1) + '</span>'; }).join('') + '</div>'; }).join('') +
      '<details><summary style="cursor:pointer;font-weight:650">E96 (±1%)</summary><div class="chips" style="margin-top:8px">' + KM.data.eSeries.E96.map(function (v) { return '<span class="tag">' + v.toFixed(2) + '</span>'; }).join('') + '</div></details>' +
      '<h2 class="mt">Цветовой код (IEC 60062)</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Цвет</th><th>Цифра</th><th>Множитель</th><th>Допуск</th><th>ТКС</th></tr></thead><tbody>' +
        cc.map(function (c) { return '<tr><td><span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:' + c.c + ';border:1px solid var(--border);vertical-align:-2px"></span> ' + c.n + '</td><td class="num">' + (c.d === null ? '—' : c.d) + '</td><td class="num">×' + KM.si(c.m, '') + '</td><td class="num">' + (c.tol ? '±' + c.tol + '%' : '—') + '</td><td class="num">' + (c.tc || '—') + '</td></tr>'; }).join('') +
      '</tbody></table></div>' +
      '<h2 class="mt">Маркировка конденсаторов</h2><p>Три цифры: две значащие + число нулей, результат в пикофарадах. <code>104</code> = 10·10⁴ пФ = 100 нФ; <code>223</code> = 22 нФ; <code>471</code> = 470 пФ; <code>105</code> = 1 мкФ. Буква после кода — допуск: J ±5%, K ±10%, M ±20%.</p>' +
      '<h2 class="mt">Типоразмеры SMD</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Дюймовый</th><th>Метрический</th><th>Размер, мм</th><th>Пайка</th></tr></thead><tbody>' +
        KM.data.packages.map(function (p) { return '<tr><td class="num"><b>' + p[0] + '</b></td><td class="num">' + p[1] + '</td><td class="num">' + p[2] + '</td><td>' + p[3] + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<h2 class="mt">Слои платы в KiCad</h2><div class="tbl-wrap"><table class="tbl"><tbody>' + KM.data.layers.map(function (l) { return '<tr><td style="white-space:nowrap"><code>' + l[0] + '</code></td><td>' + l[1] + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<h2 class="mt">Обозначения на схемах</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Компонент</th><th>IEC / KiCad</th><th>ГОСТ 2.710</th></tr></thead><tbody>' +
        [['Резистор', 'R', 'R'], ['Конденсатор', 'C', 'C'], ['Катушка, дроссель', 'L', 'L'], ['Диод, стабилитрон', 'D', 'VD'], ['Светодиод', 'D, LED', 'HL (индикатор), VD'], ['Транзистор', 'Q', 'VT'], ['Микросхема', 'U, IC', 'DA (аналоговая), DD (цифровая)'], ['Разъём', 'J, P', 'X (XS — гнездо, XP — вилка)'], ['Кнопка, переключатель', 'SW', 'SB, SA'], ['Реле', 'K', 'K'], ['Кварц', 'Y', 'ZQ'], ['Предохранитель', 'F', 'FU'], ['Трансформатор', 'T', 'T'], ['Батарея', 'BT', 'GB']].map(function (x) { return '<tr><td>' + x[0] + '</td><td><code>' + x[1] + '</code></td><td><code>' + x[2] + '</code></td></tr>'; }).join('') +
      '</tbody></table></div>';
  }
  function glossaryHtml(q) {
    var letters = [];
    KM.data.glossary.forEach(function (g) { var l = g.t[0].toUpperCase(); if (letters.indexOf(l) < 0) letters.push(l); });
    return '<input type="search" id="gq" placeholder="Поиск термина…" value="' + KM.esc(q || '') + '" style="max-width:420px;margin-bottom:12px" aria-label="Поиск в глоссарии">' +
      '<div class="alpha-bar">' + letters.map(function (l) { return '<a href="#/reference?tab=glossary" data-letter="' + l + '">' + l + '</a>'; }).join('') + '</div><dl id="glist"></dl>';
  }

  KM.views.reference = {
    render: function (p, q) {
      if (q.tab) tab = q.tab;
      var tabs = [['hotkeys', '⌨️ Горячие клавиши'], ['tables', '📋 Таблицы номиналов'], ['calc', '🧮 Калькуляторы'], ['glossary', '📖 Глоссарий']];
      return '<div class="page"><div class="page-head"><div class="eyebrow">Раздел 9</div><h1>Справочник</h1><p>Всё под рукой во время работы в KiCad.</p></div>' +
        '<div class="tabs" role="tablist">' + tabs.map(function (t) { return '<button role="tab" data-tab="' + t[0] + '" aria-selected="' + (tab === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div><div id="refBody"></div></div>';
    },
    mount: function (root, p, q) {
      var body = KM.$('#refBody', root);
      function show(t) {
        tab = t;
        if (t === 'hotkeys') body.innerHTML = hotkeysHtml();
        if (t === 'tables') body.innerHTML = tablesHtml();
        if (t === 'calc') {
          body.innerHTML = '<div class="calc-grid">' + colorCalc() + CALCS.map(function (c) { return '<div class="card calc" id="calc-' + c.id + '"><h3>' + KM.esc(c.title) + '</h3>' + c.html + '<div class="res" aria-live="polite"></div></div>'; }).join('') + '</div>';
          colorMount(body);
          CALCS.forEach(function (c) {
            var box = KM.$('#calc-' + c.id, body), out = KM.$('.res', box);
            function upd() { try { out.innerHTML = c.calc(box); } catch (e) { out.textContent = 'Проверьте значения'; } }
            KM.$$('input,select', box).forEach(function (i) { i.addEventListener('input', function () { upd(); useCalc(c.id); }); i.addEventListener('change', upd); });
            upd();
          });
        }
        if (t === 'glossary') {
          body.innerHTML = glossaryHtml(q.q);
          var inpEl = KM.$('#gq', body), list = KM.$('#glist', body);
          function filt() {
            var s = inpEl.value.trim().toLowerCase();
            var items = KM.data.glossary.filter(function (g) { return !s || g.t.toLowerCase().indexOf(s) >= 0 || g.d.toLowerCase().indexOf(s) >= 0; });
            list.innerHTML = items.length ? items.map(function (g) { return '<div class="gloss-item" data-l="' + g.t[0].toUpperCase() + '"><dt>' + KM.esc(g.t) + '</dt><dd>' + KM.esc(g.d) + '</dd></div>'; }).join('') : '<p class="muted">Ничего не найдено</p>';
          }
          inpEl.oninput = filt; filt();
          KM.$$('[data-letter]', body).forEach(function (a) { a.onclick = function (e) { e.preventDefault(); inpEl.value = ''; filt(); var el = KM.$('[data-l="' + a.dataset.letter + '"]', list); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }; });
        }
      }
      KM.ui.tabs(root, show);
      show(tab);
    }
  };
})();
