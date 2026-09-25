/* =========================================================
   Схематичные иллюстрации интерфейса KiCad (SVG, 960×600).
   Используются в уроках и демо. Если положить реальный скриншот
   в media/screens и прописать его в KM.data.screens[id] —
   он заменит иллюстрацию, а аннотации наложатся поверх.
   ========================================================= */
KM.data = KM.data || {};
KM.data.screens = {
  // 'l01-f1': 'media/screens/l01-f1.png'
};

(function () {
  var S = {};
  function t(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" font-size="' + (o.size || 12) + '" fill="' + (o.fill || 'var(--k-ui-text)') + '"' +
      (o.anchor ? ' text-anchor="' + o.anchor + '"' : '') + (o.weight ? ' font-weight="' + o.weight + '"' : '') +
      (o.mono ? ' font-family="monospace"' : '') + (o.rot ? ' transform="rotate(' + o.rot + ' ' + x + ' ' + y + ')"' : '') + '>' + KM.esc(s) + '</text>';
  }
  function rect(x, y, w, h, fill, stroke, rx, extra) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + (fill || 'none') + '"' + (stroke ? ' stroke="' + stroke + '"' : '') + (rx ? ' rx="' + rx + '"' : '') + (extra || '') + '/>';
  }
  function line(x1, y1, x2, y2, c, w, extra) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="' + (w || 1) + '"' + (extra || '') + '/>';
  }
  function poly(pts, c, w, fill) {
    return '<polyline points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '" fill="' + (fill || 'none') + '" stroke="' + c + '" stroke-width="' + (w || 1) + '" stroke-linejoin="round"/>';
  }

  /* ---------- оконная рамка ---------- */
  function frame(title, menus, body, o) {
    o = o || {};
    var s = rect(0, 0, 960, 600, 'var(--k-ui)');
    s += rect(0, 0, 960, 28, 'var(--k-ui-2)') + t(12, 19, title, { size: 13, weight: 600 });
    s += '<circle cx="912" cy="14" r="6" fill="#e0b000"/><circle cx="932" cy="14" r="6" fill="#3cb043"/><circle cx="948" cy="14" r="6" fill="#e0443e"/>';
    var mx = 10;
    (menus || []).forEach(function (m) { s += t(mx, 46, m, { size: 12.5 }); mx += m.length * 7.4 + 18; });
    s += line(0, 54, 960, 54, 'var(--k-ui-2)');
    s += body;
    // строка состояния
    s += rect(0, 578, 960, 22, 'var(--k-ui-2)') + t(10, 593, o.status || 'Z 1.23   X 101.60  Y 76.20   dx 0.00  dy 0.00   дюйм/мм: мм   Сетка: 1.27 мм', { size: 11, mono: true });
    return s;
  }
  function toolbarTop(n, y, x0, active) {
    var s = rect(0, y || 55, 960, 30, 'var(--k-ui)');
    for (var i = 0; i < n; i++) {
      var x = (x0 || 8) + i * 30 + Math.floor(i / 5) * 8;
      s += rect(x, (y || 55) + 4, 24, 22, i === active ? 'var(--k-ui-2)' : 'none', null, 4);
      s += glyph(x + 12, (y || 55) + 15, i);
    }
    return s;
  }
  // упрощённые пиктограммы — не копия реальных иконок, а условные значки
  function glyph(cx, cy, k) {
    var c = 'var(--k-ui-text)', g = '';
    switch (k % 12) {
      case 0: g = rect(cx - 7, cy - 7, 14, 14, 'none', c, 2); break;
      case 1: g = '<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="none" stroke="' + c + '"/>'; break;
      case 2: g = line(cx - 7, cy + 5, cx + 7, cy - 5, c, 2); break;
      case 3: g = poly([[cx - 7, cy], [cx - 2, cy + 5], [cx + 7, cy - 6]], c, 2); break;
      case 4: g = rect(cx - 6, cy - 4, 12, 8, 'none', c, 1); break;
      case 5: g = '<path d="M' + (cx - 6) + ' ' + (cy + 5) + 'l6-11 6 11z" fill="none" stroke="' + c + '"/>'; break;
      case 6: g = line(cx - 6, cy, cx + 6, cy, c, 2) + line(cx, cy - 6, cx, cy + 6, c, 2); break;
      case 7: g = line(cx - 6, cy, cx + 6, cy, c, 2); break;
      case 8: g = poly([[cx - 6, cy - 5], [cx + 6, cy - 5], [cx + 6, cy + 5], [cx - 6, cy + 5]], c, 1.5); break;
      case 9: g = '<path d="M' + (cx - 6) + ' ' + cy + 'a6 6 0 1 1 12 0" fill="none" stroke="' + c + '" stroke-width="1.5"/>'; break;
      case 10: g = line(cx - 6, cy - 6, cx + 6, cy + 6, c, 1.5) + line(cx + 6, cy - 6, cx - 6, cy + 6, c, 1.5); break;
      default: g = '<circle cx="' + cx + '" cy="' + cy + '" r="2.5" fill="' + c + '"/>';
    }
    return g;
  }
  function toolbarSide(x, y0, items, active, w) {
    w = w || 30;
    var s = rect(x, y0, w, 578 - y0, 'var(--k-ui)');
    items.forEach(function (it, i) {
      var y = y0 + 6 + i * 30;
      if (i === active) s += rect(x + 3, y - 2, w - 6, 26, 'var(--k-ui-2)', '#3c82dc', 4, ' stroke-width="1.5"');
      s += t(x + w / 2, y + 16, it, { size: 12, anchor: 'middle', weight: 700 });
    });
    return s;
  }
  function grid(x, y, w, h, step, color) {
    var s = '<g opacity=".8">';
    for (var gx = x + step; gx < x + w; gx += step)
      for (var gy = y + step; gy < y + h; gy += step)
        s += '<circle cx="' + gx + '" cy="' + gy + '" r=".9" fill="' + (color || 'var(--k-grid)') + '"/>';
    return s + '</g>';
  }
  // Правая панель инструментов редактора схем (значки-буквы условные)
  var SCH_TOOLS = ['↖', '⌖', 'A', '⏚', '╱', '≡', '✕', '●', 'Lb', 'G', 'H', '▭', 'T', '▢'];
  S.SCH_TOOL_Y = function (i) { return 91 + i * 30 + 12; };
  var PCB_TOOLS = ['↖', '⌖', 'Fp', '╱', '⫽', '◎', '▧', '▨', '╌', 'T', '↔', '⌗'];

  /* ---------- примитивы схемы ---------- */
  var W = 'var(--k-wire)', B = 'var(--k-body)', BF = 'var(--k-bodyfill)', TX = 'var(--k-text)';
  function R(x, y, ref, val, horiz) {
    // резистор: прямоугольник, выводы сверху/снизу (или слева/справа)
    if (horiz) return line(x - 40, y, x - 20, y, B, 1.5) + line(x + 20, y, x + 40, y, B, 1.5) + rect(x - 20, y - 8, 40, 16, BF, B, 0, ' stroke-width="2"') +
      t(x, y - 14, ref, { fill: TX, anchor: 'middle', size: 13 }) + t(x, y + 24, val, { fill: TX, anchor: 'middle', size: 13 });
    return line(x, y - 40, x, y - 20, B, 1.5) + line(x, y + 20, x, y + 40, B, 1.5) + rect(x - 8, y - 20, 16, 40, BF, B, 0, ' stroke-width="2"') +
      t(x + 14, y - 3, ref, { fill: TX, size: 13 }) + t(x + 14, y + 13, val, { fill: TX, size: 13 });
  }
  function C(x, y, ref, val) {
    return line(x, y - 30, x, y - 5, B, 1.5) + line(x, y + 5, x, y + 30, B, 1.5) + line(x - 14, y - 5, x + 14, y - 5, B, 3) + line(x - 14, y + 5, x + 14, y + 5, B, 3) +
      t(x + 20, y - 3, ref, { fill: TX, size: 13 }) + t(x + 20, y + 13, val, { fill: TX, size: 13 });
  }
  function LED(x, y, ref, val) {
    // вертикальный, анод сверху
    return line(x, y - 30, x, y - 10, B, 1.5) + line(x, y + 10, x, y + 30, B, 1.5) +
      '<path d="M' + (x - 11) + ' ' + (y - 10) + 'h22l-11 18z" fill="' + BF + '" stroke="' + B + '" stroke-width="2"/>' + line(x - 11, y + 9, x + 11, y + 9, B, 2) +
      poly([[x + 14, y - 4], [x + 24, y - 12]], B, 1.5) + poly([[x + 16, y + 4], [x + 26, y - 4]], B, 1.5) +
      t(x + 30, y - 2, ref, { fill: TX, size: 13 }) + t(x + 30, y + 14, val, { fill: TX, size: 13 });
  }
  function GND(x, y) { return line(x, y, x, y + 8, B, 1.5) + '<path d="M' + (x - 10) + ' ' + (y + 8) + 'h20l-10 10z" fill="none" stroke="' + B + '" stroke-width="1.5"/>' + t(x, y + 32, 'GND', { fill: TX, anchor: 'middle', size: 11 }); }
  function VCC(x, y, name) { return line(x, y, x, y - 12, B, 1.5) + '<path d="M' + (x - 7) + ' ' + (y - 6) + 'l7-10 7 10" fill="none" stroke="' + B + '" stroke-width="1.5"/>' + t(x, y - 22, name || '+5V', { fill: TX, anchor: 'middle', size: 12 }); }
  function wire(pts) { return poly(pts, W, 2.2); }
  function junction(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="4" fill="' + W + '"/>'; }
  function label(x, y, name) { return line(x, y, x + name.length * 8 + 4, y, W, 0) + t(x + 2, y - 4, name, { fill: 'var(--k-label)', size: 13 }); }
  function glabel(x, y, name) {
    var w = name.length * 8 + 16;
    return '<path d="M' + x + ' ' + y + 'l8 -8h' + w + 'v16h-' + w + 'z" fill="none" stroke="#840084" stroke-width="1.5"/>' + t(x + 12, y + 4, name, { fill: '#840084', size: 12 });
  }
  function conn(x, y, n, ref, val) {
    var h = n * 25 + 10, s = rect(x - 30, y - 5, 30, h, BF, B, 0, ' stroke-width="2"');
    for (var i = 0; i < n; i++) s += line(x, y + 10 + i * 25, x + 25, y + 10 + i * 25, B, 1.5) + t(x - 6, y + 14 + i * 25, String(i + 1), { fill: B, anchor: 'end', size: 10 });
    return s + t(x - 15, y - 12, ref, { fill: TX, anchor: 'middle', size: 13 }) + t(x - 15, y + h + 14, val, { fill: TX, anchor: 'middle', size: 12 });
  }
  function noconn(x, y) { return line(x - 6, y - 6, x + 6, y + 6, '#0000c8', 2) + line(x + 6, y - 6, x - 6, y + 6, '#0000c8', 2); }
  function ic(x, y, w, h, ref, name, pinsL, pinsR) {
    var s = rect(x, y, w, h, BF, B, 0, ' stroke-width="2"');
    (pinsL || []).forEach(function (p, i) { var py = y + 20 + i * 25; s += line(x - 25, py, x, py, B, 1.5) + t(x + 5, py + 4, p, { fill: TX, size: 10 }); });
    (pinsR || []).forEach(function (p, i) { var py = y + 20 + i * 25; s += line(x + w, py, x + w + 25, py, B, 1.5) + t(x + w - 5, py + 4, p, { fill: TX, size: 10, anchor: 'end' }); });
    return s + t(x + w / 2, y - 8, ref, { fill: TX, anchor: 'middle', size: 13 }) + t(x + w / 2, y + h + 16, name, { fill: TX, anchor: 'middle', size: 12 });
  }
  function titleBlock(x, y) {
    return rect(x, y, 260, 70, 'none', B, 0, ' stroke-width="1"') + line(x, y + 24, x + 260, y + 24, B) + line(x, y + 48, x + 260, y + 48, B) +
      t(x + 6, y + 17, 'Лист: /   Файл: led.kicad_sch', { fill: B, size: 10 }) + t(x + 6, y + 41, 'Название: Светодиодный модуль', { fill: B, size: 10 }) + t(x + 6, y + 64, 'KiCad E.D.A.   Ред: 1   Разм: A4', { fill: B, size: 10 });
  }
  S.prim = { R: R, C: C, LED: LED, GND: GND, VCC: VCC, wire: wire, junction: junction, label: label, glabel: glabel, conn: conn, noconn: noconn, ic: ic, t: t, rect: rect, line: line, poly: poly };

  // Содержимое листа схемы по варианту
  function schContent(v) {
    var s = '';
    if (v === 'empty' || !v) return titleBlock(620, 490);
    if (v === 'parts' || v === 'led' || v === 'led-labels' || v === 'led-erc') {
      s += conn(200, 230, 2, 'J1', 'Conn_01x02');
      s += R(420, 250, 'R1', '330');
      s += LED(560, 260, 'D1', 'LED');
      if (v !== 'parts') {
        s += wire([[225, 240], [420, 240], [420, 210]]);
        s += wire([[420, 290], [420, 320], [560, 320], [560, 290]]);
        if (v === 'led-labels') { s += wire([[225, 265], [300, 265], [300, 380]]) + wire([[560, 230], [560, 200], [680, 200]]); s += label(640, 200, 'LED_A') + GND(300, 380); }
        else s += wire([[225, 265], [300, 265], [300, 380], [560, 380], [560, 230]]);
        if (v === 'led-erc') s += '<g><circle cx="560" cy="230" r="9" fill="none" stroke="#e0a000" stroke-width="3"/><path d="M552 222l6-12 6 12z" fill="#e0a000"/></g>';
      }
      return s + titleBlock(620, 490);
    }
    if (v === 'divider') {
      s += VCC(400, 130, '+5V') + wire([[400, 130], [400, 160]]) + R(400, 200, 'R1', '10k') + wire([[400, 240], [400, 280]]) + R(400, 320, 'R2', '10k') + wire([[400, 360], [400, 400]]) + GND(400, 400);
      s += junction(400, 260) + wire([[400, 260], [520, 260]]) + label(470, 260, 'VOUT');
      return s + titleBlock(620, 490);
    }
    if (v === 'mcu') {
      s += ic(380, 150, 150, 260, 'U1', 'ATmega328P-P', ['VCC', 'AVCC', 'AREF', 'RESET', 'XTAL1', 'XTAL2', 'GND', 'GND'], ['PB5', 'PB4', 'PB3', 'PD0', 'PD1', 'PD2', 'PD3', 'PD4']);
      s += VCC(330, 150, '+5V') + wire([[330, 150], [330, 170], [355, 170]]) + wire([[330, 170], [330, 195], [355, 195]]) + junction(330, 170);
      s += C(250, 230, 'C1', '100n') + wire([[250, 200], [250, 170], [330, 170]]) + GND(250, 260);
      s += glabel(555, 170, 'SCK') + glabel(555, 195, 'MISO') + glabel(555, 220, 'MOSI');
      s += noconn(555, 345) + noconn(555, 370) + noconn(555, 320);
      s += wire([[355, 320], [330, 320], [330, 370]]) + wire([[355, 345], [330, 345]]) + junction(330, 345) + GND(330, 370);
      return s + titleBlock(620, 490);
    }
    return s;
  }

  /* ---------- сцена: менеджер проектов ---------- */
  S.pm = function (o) {
    var body = toolbarSide(0, 55, ['🗎', '📂', '⎘', '⇩', '⇧'], -1, 36);
    body += rect(36, 55, 250, 523, 'var(--k-bg)') + t(46, 76, 'Файлы проекта', { size: 12, weight: 700 });
    var files = [['▾ 📁 led_module', 0], ['📄 led_module.kicad_pro', 1], ['📐 led_module.kicad_sch', 1], ['🟩 led_module.kicad_pcb', 1], ['📄 fp-lib-table', 1]];
    if (o.more) files.push(['📄 sym-lib-table', 1]);
    files.forEach(function (f, i) { body += t(50 + f[1] * 16, 104 + i * 24, f[0], { size: 12.5 }); });
    // плитки приложений
    var apps = [['Редактор схем', '📐'], ['Редактор символов', '🔣'], ['Редактор плат', '🟩'], ['Редактор посад. мест', '🔲'], ['Просмотр Gerber', '🔍'], ['Преобразователь изобр.', '🖼'], ['Калькулятор', '🧮'], ['Редактор листа', '📄'], ['Менеджер плагинов', '📦']];
    apps.forEach(function (a, i) {
      var col = i % 3, row = Math.floor(i / 3), x = 320 + col * 205, y = 90 + row * 150;
      body += rect(x, y, 180, 120, 'var(--k-ui-2)', null, 10) + t(x + 90, y + 58, a[1], { size: 34, anchor: 'middle' }) + t(x + 90, y + 100, a[0], { size: 12.5, anchor: 'middle', weight: 600 });
    });
    return frame('KiCad — led_module', ['Файл', 'Вид', 'Инструменты', 'Настройки', 'Справка'], body, { status: 'Проект: ~/kicad/led_module/led_module.kicad_pro' });
  };

  /* ---------- сцена: редактор схем ---------- */
  S.sch = function (o) {
    var body = toolbarTop(22, 55, 8, o.topActive);
    body += toolbarSide(0, 85, ['▦', 'in', 'mm', '↖', '⊹', '⤢', '⎌'], -1);
    body += toolbarSide(930, 85, SCH_TOOLS, o.tool == null ? 0 : o.tool);
    body += rect(30, 85, 900, 493, 'var(--k-bg)') + grid(30, 85, 900, 493, 20);
    body += '<g>' + schContent(o.content) + '</g>';
    if (o.cursor) body += '<path d="M' + o.cursor[0] + ' ' + o.cursor[1] + 'l0 18 5-5 4 9 3-1-4-9 7 0z" fill="#fff" stroke="#000" stroke-width="1.2"/>';
    if (o.ghost) body += '<g opacity=".55">' + R(o.ghost[0], o.ghost[1], 'R?', 'R') + '</g>';
    if (o.dialog === 'props') body += propsDialog();
    if (o.dialog === 'erc') body += ercDialog(o.ercClean);
    if (o.dialog === 'annotate') body += annotateDialog();
    return frame('Редактор схем — led_module [/]', ['Файл', 'Правка', 'Вид', 'Разместить', 'Проверка', 'Инструменты', 'Настройки', 'Справка'], body);
  };
  function dlg(x, y, w, h, title) {
    return rect(x + 6, y + 8, w, h, 'rgba(0,0,0,.25)', null, 8) + rect(x, y, w, h, 'var(--k-ui)', 'var(--k-ui-2)', 8, ' stroke-width="2"') +
      rect(x, y, w, 30, 'var(--k-ui-2)', null, 8) + t(x + 12, y + 20, title, { size: 13, weight: 700 });
  }
  function btn(x, y, w, label, primary) {
    return rect(x, y, w, 28, primary ? '#3c82dc' : 'var(--k-ui-2)', null, 5) + t(x + w / 2, y + 18, label, { size: 12, anchor: 'middle', fill: primary ? '#fff' : 'var(--k-ui-text)', weight: 600 });
  }
  function field(x, y, w, label, val) {
    return t(x, y + 18, label, { size: 12 }) + rect(x + 120, y, w - 120, 26, 'var(--k-bg)', 'var(--k-ui-2)', 4) + t(x + 128, y + 18, val, { size: 12, fill: 'var(--k-label)' });
  }
  function propsDialog() {
    var s = dlg(230, 120, 500, 360, 'Свойства символа');
    s += t(250, 172, 'Поля', { size: 12, weight: 700 });
    var rows = [['Обозначение', 'R1'], ['Значение', '330'], ['Посад. место', 'Resistor_SMD:R_0805_2012Metric'], ['Документация', '~']];
    s += rect(250, 182, 460, 26, 'var(--k-ui-2)') + t(258, 200, 'Имя', { size: 11, weight: 700 }) + t(390, 200, 'Значение', { size: 11, weight: 700 }) + t(640, 200, 'Показ.', { size: 11, weight: 700 });
    rows.forEach(function (r, i) { var y = 208 + i * 28; s += rect(250, y, 460, 28, i % 2 ? 'var(--k-ui)' : 'var(--k-bg)') + t(258, y + 18, r[0], { size: 12 }) + t(390, y + 18, r[1], { size: 12, fill: 'var(--k-label)' }) + t(655, y + 18, i < 2 ? '☑' : '☐', { size: 13 }); });
    s += t(250, 346, '☐ Исключить из спецификации (BOM)     ☐ Не размещать на плате', { size: 12 });
    s += t(250, 372, 'Единица: A    Ориентация: 0°    ☐ Отразить', { size: 12 });
    s += btn(530, 432, 90, 'Отмена') + btn(630, 432, 90, 'OK', true);
    return s;
  }
  function ercDialog(clean) {
    var s = dlg(200, 110, 560, 380, 'Проверка электрических правил (ERC)');
    s += rect(220, 150, 520, 26, 'var(--k-ui-2)') + t(230, 168, 'Нарушения (' + (clean ? 0 : 2) + ')      Игнорируемые тесты      Карта пинов', { size: 12 });
    if (clean) s += t(480, 280, '✔ Нарушений не найдено', { size: 16, anchor: 'middle', fill: '#2e9d4a', weight: 700 });
    else {
      s += rect(220, 186, 520, 60, 'var(--k-bg)', '#e0a000', 4) + t(232, 206, '⚠ Предупреждение: Вывод не подключён', { size: 12, weight: 700 }) + t(250, 228, '@(127.00 мм, 88.90 мм): Вывод 2 (Пассивный) символа D1', { size: 11 });
      s += rect(220, 254, 520, 60, 'var(--k-bg)', '#d03030', 4) + t(232, 274, '✖ Ошибка: Вход питания не запитан', { size: 12, weight: 700 }) + t(250, 296, '@(101.60 мм, 76.20 мм): Вывод 1 (Вход питания) символа #PWR01', { size: 11 });
    }
    s += t(220, 356, 'Показать:  ☑ Все   ☑ Ошибки   ☑ Предупреждения   ☐ Исключения', { size: 12 });
    s += btn(220, 440, 150, 'Запустить ERC', true) + btn(380, 440, 170, 'Удалить все маркеры') + btn(650, 440, 90, 'Закрыть');
    return s;
  }
  function annotateDialog() {
    var s = dlg(250, 130, 460, 330, 'Аннотировать схему');
    s += t(270, 180, 'Область:   ◉ Вся схема   ○ Текущий лист   ○ Выделение', { size: 12 });
    s += t(270, 215, 'Порядок:   ◉ Сортировать по X   ○ Сортировать по Y', { size: 12 });
    s += t(270, 250, 'Нумерация: ◉ Первый свободный номер   ○ С номера листа ×100', { size: 12 });
    s += t(270, 285, 'Опции:     ◉ Сохранить существующие   ○ Переаннотировать всё', { size: 12 });
    s += btn(270, 410, 120, 'Аннотировать', true) + btn(400, 410, 170, 'Очистить аннотацию') + btn(600, 410, 90, 'Закрыть');
    return s;
  }

  /* ---------- сцена: выбор символа ---------- */
  S.symchooser = function (o) {
    var s = S.sch({ content: 'empty', tool: 2 });
    s += dlg(150, 70, 660, 460, 'Выбор символа (' + (o.count || '23 185') + ' элементов загружено)');
    s += rect(170, 112, 280, 28, 'var(--k-bg)', '#3c82dc', 4) + t(180, 131, o.query || 'resistor', { size: 13, fill: 'var(--k-label)' });
    var items = o.items || [['▾ Device', 1], ['R', 2, 'Резистор'], ['R_Small', 2, 'Резистор, малый символ'], ['R_US', 2, 'Резистор, символ US'], ['R_Pack04', 2, 'Резисторная сборка'], ['R_Potentiometer', 2, 'Потенциометр'], ['▸ Connector_Generic', 1], ['▸ power', 1]];
    items.forEach(function (it, i) {
      var y = 150 + i * 26, sel = i === (o.sel == null ? 1 : o.sel);
      s += rect(170, y, 280, 26, sel ? '#3c82dc' : 'none', null, 3) + t(176 + (it[1] - 1) * 16, y + 18, it[0], { size: 12.5, fill: sel ? '#fff' : 'var(--k-ui-text)' });
    });
    s += rect(470, 112, 320, 200, 'var(--k-bg)', 'var(--k-ui-2)', 4) + '<g transform="translate(630 212)">' + R(0, 0, 'R', 'R') + '</g>';
    s += rect(470, 322, 320, 110, 'var(--k-bg)', 'var(--k-ui-2)', 4) + t(480, 342, 'Описание: Резистор', { size: 12 }) + t(480, 362, 'Ключ. слова: R res resistor', { size: 12 }) + t(480, 382, 'Документация: ~', { size: 12 });
    s += rect(470, 442, 320, 34, 'var(--k-bg)', 'var(--k-ui-2)', 4) + t(480, 464, 'Посад. место: не задано ▾', { size: 12 });
    s += btn(610, 490, 85, 'Отмена') + btn(705, 490, 85, 'OK', true);
    return s;
  };

  /* ---------- сцена: назначение посадочных мест ---------- */
  S.fpassign = function (o) {
    var body = toolbarTop(12, 55);
    body += rect(0, 85, 230, 493, 'var(--k-bg)') + t(10, 104, 'Библиотеки посадочных мест', { size: 12, weight: 700 });
    ['Capacitor_SMD', 'Capacitor_THT', 'Connector_PinHeader_2.54mm', 'LED_SMD', 'LED_THT', 'Resistor_SMD', 'Resistor_THT', 'Package_DIP', 'Package_SO'].forEach(function (l, i) {
      var sel = l === (o.lib || 'Resistor_SMD');
      body += rect(4, 114 + i * 24, 222, 24, sel ? '#3c82dc' : 'none', null, 3) + t(12, 131 + i * 24, l, { size: 12, fill: sel ? '#fff' : 'var(--k-ui-text)' });
    });
    body += rect(234, 85, 380, 493, 'var(--k-bg)') + t(244, 104, 'Символы схемы', { size: 12, weight: 700 });
    var rows = o.rows || [['1', 'D1 -', 'LED', 'LED_THT:LED_D5.0mm'], ['2', 'J1 -', 'Conn_01x02', 'Connector_PinHeader_2.54mm:PinHeader_1x02'], ['3', 'R1 -', '330', '']];
    rows.forEach(function (r, i) {
      var y = 114 + i * 26, sel = i === (o.sel == null ? 2 : o.sel);
      body += rect(238, y, 372, 26, sel ? '#3c82dc' : 'none', null, 3) + t(244, y + 18, r[0] + '   ' + r[1] + '  ' + r[2] + '  : ' + r[3], { size: 11.5, fill: sel ? '#fff' : 'var(--k-ui-text)' });
    });
    body += rect(618, 85, 342, 493, 'var(--k-bg)') + t(628, 104, 'Отфильтрованные посад. места', { size: 12, weight: 700 });
    (o.fps || ['R_0402_1005Metric', 'R_0603_1608Metric', 'R_0805_2012Metric', 'R_1206_3216Metric', 'R_2010_5025Metric']).forEach(function (f, i) {
      var sel = i === (o.fpSel == null ? 2 : o.fpSel);
      body += rect(622, 114 + i * 24, 334, 24, sel ? '#3c82dc' : 'none', null, 3) + t(630, 131 + i * 24, (i + 1) + '  ' + f, { size: 12, fill: sel ? '#fff' : 'var(--k-ui-text)' });
    });
    body += rect(0, 540, 960, 38, 'var(--k-ui)') + btn(700, 545, 120, 'Применить, сохр.', true) + btn(830, 545, 110, 'OK');
    return frame('Назначить посадочные места', [], body, { status: 'Фильтры:  ☑ ключевые слова   ☑ кол-во выводов   ☑ библиотека' });
  };

  /* ---------- сцена: редактор плат ---------- */
  function pcbFootprint(x, y, kind, ref, rot) {
    var s = '', pad = 'var(--k-pad)';
    if (kind === 'R0805') {
      s += rect(x - 22, y - 9, 14, 18, pad, null, 2) + rect(x + 8, y - 9, 14, 18, pad, null, 2) + rect(x - 28, y - 14, 56, 28, 'none', 'var(--k-silk)', 0, ' stroke-width="1.2"') + t(x, y - 20, ref, { fill: 'var(--k-silk)', anchor: 'middle', size: 11 });
    } else if (kind === 'LED5') {
      s += '<circle cx="' + x + '" cy="' + y + '" r="34" fill="none" stroke="var(--k-silk)" stroke-width="1.2"/>' + rect(x - 22, y - 9, 18, 18, pad, null, 2) + '<circle cx="' + (x + 13) + '" cy="' + y + '" r="9" fill="' + pad + '"/>' + t(x, y - 42, ref, { fill: 'var(--k-silk)', anchor: 'middle', size: 11 });
    } else if (kind === 'HDR2') {
      s += rect(x - 14, y - 14, 28, 56, 'none', 'var(--k-silk)', 0, ' stroke-width="1.2"') + rect(x - 9, y - 9, 18, 18, pad, null, 2) + '<circle cx="' + x + '" cy="' + (y + 28) + '" r="9" fill="' + pad + '"/>' + t(x, y - 20, ref, { fill: 'var(--k-silk)', anchor: 'middle', size: 11 });
    }
    return s;
  }
  S.pcb = function (o) {
    var st = o.state || 'ratsnest';
    var body = toolbarTop(24, 55, 8, o.topActive);
    body += toolbarSide(0, 85, ['▦', 'in', 'mm', '⊹', '◐', '▭'], -1);
    body += toolbarSide(784, 85, PCB_TOOLS, o.tool == null ? 0 : o.tool);
    // панель слоёв справа
    body += rect(814, 85, 146, 493, 'var(--k-ui)') + t(824, 104, 'Слои', { size: 12, weight: 700 });
    [['F.Cu', 'var(--k-fcu)'], ['B.Cu', 'var(--k-bcu)'], ['F.Silkscreen', 'var(--k-silk)'], ['B.Silkscreen', '#e0c0e0'], ['F.Mask', '#843c84'], ['B.Mask', '#02a6a6'], ['Edge.Cuts', 'var(--k-edge)'], ['F.Courtyard', '#ff26e2'], ['F.Fab', '#afafaf'], ['User.Drawings', '#c2c2c2']].forEach(function (l, i) {
      var y = 114 + i * 24, sel = l[0] === (o.layer || 'F.Cu');
      body += rect(818, y, 138, 22, sel ? '#3c82dc' : 'none', null, 3) + rect(824, y + 5, 12, 12, l[1], null, 2) + t(844, y + 16, l[0], { size: 11.5, fill: sel ? '#fff' : 'var(--k-ui-text)' });
    });
    body += rect(30, 85, 754, 493, 'var(--k-pcb)') + grid(30, 85, 754, 493, 25, '#2a3a50');
    if (st !== 'empty') {
      // контур платы
      body += rect(200, 170, 400, 250, 'none', 'var(--k-edge)', 6, ' stroke-width="2"');
      if (st === 'zone' || st === '3dready') body += rect(210, 180, 380, 230, 'rgba(77,127,196,.35)', 'var(--k-bcu)', 4, ' stroke-width="1"');
      if (st === 'unplaced') {
        // после «Обновить плату из схемы» посадочные места лежат кучей рядом с курсором
        body += pcbFootprint(660, 470, 'HDR2', 'J1') + pcbFootprint(700, 480, 'R0805', 'R1') + pcbFootprint(720, 520, 'LED5', 'D1');
        body += line(660, 470, 686, 480, '#dfdfdf', 1, ' stroke-dasharray="3 3"') + line(714, 480, 707, 520, '#dfdfdf', 1, ' stroke-dasharray="3 3"') + line(660, 498, 733, 520, '#dfdfdf', 1, ' stroke-dasharray="3 3"');
      } else {
        body += pcbFootprint(270, 280, 'HDR2', 'J1');
        body += pcbFootprint(400, 250, 'R0805', 'R1');
        body += pcbFootprint(510, 300, 'LED5', 'D1');
      }
      if (st === 'unplaced' || st === 'outline') { /* дорожек нет */ }
      else if (st === 'ratsnest') {
        body += line(270, 280, 385, 250, '#dfdfdf', 1, ' stroke-dasharray="3 3"') + line(415, 250, 497, 300, '#dfdfdf', 1, ' stroke-dasharray="3 3"') + line(270, 308, 523, 300, '#dfdfdf', 1, ' stroke-dasharray="3 3"');
      } else {
        body += poly([[270, 280], [330, 280], [360, 250], [385, 250]], 'var(--k-fcu)', 8);
        body += poly([[415, 250], [450, 250], [480, 280], [480, 300], [497, 300]], 'var(--k-fcu)', 8);
        if (st === 'routing') body += poly([[270, 308], [330, 360], [440, 360]], 'var(--k-fcu)', 8) + line(440, 360, 523, 300, '#dfdfdf', 1, ' stroke-dasharray="3 3"');
        else body += poly([[270, 308], [300, 370], [500, 370], [523, 347], [523, 300]], 'var(--k-bcu)', 8) + '<circle cx="523" cy="300" r="7" fill="#e0e0e0"/>';
      }
      if (o.drcMarker) body += '<g><circle cx="480" cy="290" r="10" fill="none" stroke="#ff4040" stroke-width="3"/><path d="M473 270l7-13 7 13z" fill="#ff4040"/></g>';
    }
    if (o.dialog === 'drc') body += drcDialog(o.drcClean);
    if (o.dialog === 'boardsetup') body += boardSetup();
    if (o.dialog === 'plot') body += plotDialog();
    return frame('Редактор плат — led_module', ['Файл', 'Правка', 'Вид', 'Разместить', 'Трассировка', 'Проверка', 'Инструменты', 'Настройки', 'Справка'], body,
      { status: 'Площадки 6   Переходных 1   Цепей 3   Не разведено ' + (st === 'ratsnest' ? 3 : st === 'routing' ? 1 : 0) + '   Слой: F.Cu' });
  };
  function drcDialog(clean) {
    var s = dlg(180, 110, 600, 380, 'Проверка правил проектирования (DRC)');
    s += t(200, 160, '☑ Проверка связности с учётом зон    ☑ Сверить с данными схемы', { size: 12 });
    s += rect(200, 176, 560, 26, 'var(--k-ui-2)') + t(210, 194, 'Нарушения (' + (clean ? 0 : 1) + ')    Неразведённые (' + (clean ? 0 : 0) + ')    Несоответствия схеме (0)', { size: 12 });
    if (clean) s += t(480, 300, '✔ Нарушений нет', { size: 16, anchor: 'middle', fill: '#2e9d4a', weight: 700 });
    else s += rect(200, 212, 560, 60, 'var(--k-bg)', '#d03030', 4) + t(212, 232, '✖ Ошибка: Зазор (правило netclass Default: 0.2000 мм; факт. 0.1380 мм)', { size: 12, weight: 700 }) + t(230, 254, 'Дорожка [Net-(D1-A)] на F.Cu ↔ Площадка 1 [GND] посад. места R1', { size: 11 });
    s += btn(200, 440, 140, 'Запустить DRC', true) + btn(680, 440, 80, 'Закрыть');
    return s;
  }
  function boardSetup() {
    var s = dlg(120, 70, 720, 470, 'Параметры платы');
    ['▾ Структура платы', '    Редактор слоёв', '    Физические слои', '    Маска и паста', '▾ Текст и графика', '▾ Правила проектирования', '    Ограничения', '    Предопр. размеры', '    Классы цепей', '    Пользов. правила', '    Серьёзность нарушений'].forEach(function (x, i) {
      var sel = i === 6; s += rect(128, 108 + i * 24, 200, 24, sel ? '#3c82dc' : 'none', null, 3) + t(134, 125 + i * 24, x, { size: 12, fill: sel ? '#fff' : 'var(--k-ui-text)' });
    });
    var rows = [['Минимальный зазор', '0.2 мм'], ['Мин. ширина дорожки', '0.2 мм'], ['Мин. кольцо переходного', '0.13 мм'], ['Мин. диаметр переходного', '0.6 мм'], ['Зазор до края платы', '0.5 мм'], ['Мин. отверстие', '0.3 мм'], ['Отверстие ↔ отверстие', '0.25 мм']];
    rows.forEach(function (r, i) { s += field(350, 110 + i * 38, 470, r[0], r[1]); });
    s += btn(640, 500, 90, 'Отмена') + btn(740, 500, 90, 'OK', true);
    return s;
  }
  function plotDialog() {
    var s = dlg(130, 70, 700, 470, 'Выходные данные для производства (Plot)');
    s += field(150, 110, 380, 'Формат', 'Gerber') + field(150, 146, 380, 'Каталог', 'gerbers/');
    s += t(150, 204, 'Слои для вывода', { size: 12, weight: 700 });
    ['☑ F.Cu', '☑ B.Cu', '☑ F.Paste', '☐ B.Paste', '☑ F.Silkscreen', '☑ B.Silkscreen', '☑ F.Mask', '☑ B.Mask', '☑ Edge.Cuts'].forEach(function (l, i) { s += t(160, 228 + i * 22, l, { size: 12 }); });
    s += t(400, 204, 'Параметры', { size: 12, weight: 700 });
    ['☑ Выводить обозн. позиций', '☑ Выводить значения', '☐ Отверстия на медных слоях', '☑ Использовать расширения Protel', '☑ Формат Gerber X2', '☑ Атрибуты цепей', '☐ Вычитать маску из шелкографии'].forEach(function (l, i) { s += t(410, 228 + i * 22, l, { size: 12 }); });
    s += btn(150, 500, 90, 'Вывести', true) + btn(250, 500, 200, 'Создать файлы сверловки…') + btn(460, 500, 180, 'Запустить DRC…') + btn(730, 500, 80, 'Закрыть');
    return s;
  }

  /* ---------- сцена: 3D-просмотр ---------- */
  S.v3d = function () {
    var body = toolbarTop(18, 55);
    body += '<defs><linearGradient id="g3d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfd9e6"/><stop offset="1" stop-color="#7e8ea3"/></linearGradient></defs>';
    body += rect(0, 85, 960, 493, 'url(#g3d)');
    // плата в изометрии
    body += '<path d="M260 380 L520 470 L760 330 L500 250 Z" fill="#1c6b35" stroke="#0e3d1d" stroke-width="2"/>';
    body += '<path d="M260 380 L520 470 L520 480 L260 390 Z" fill="#124d25"/><path d="M520 470 L760 330 L760 340 L520 480 Z" fill="#0e3d1d"/>';
    body += '<path d="M430 330 l30 10 l0 -8 l-30 -10 z" fill="#222"/><path d="M430 322 l30 10 l12 -7 l-30 -10z" fill="#333"/>';
    body += '<path d="M424 330 l6 2 l0-8 l-6-2z" fill="#d7d7d7"/><path d="M460 340 l6 2 l0-8 l-6-2z" fill="#d7d7d7"/>';
    body += '<ellipse cx="600" cy="320" rx="28" ry="14" fill="#c62828"/><rect x="572" y="258" width="56" height="62" fill="#e53935"/><ellipse cx="600" cy="258" rx="28" ry="14" fill="#ef5350"/>';
    body += '<rect x="330" y="300" width="22" height="46" fill="#111"/><rect x="352" y="306" width="22" height="46" fill="#111"/><rect x="338" y="270" width="4" height="30" fill="#e0c050"/><rect x="360" y="276" width="4" height="30" fill="#e0c050"/>';
    body += t(300, 420, 'J1', { size: 12, fill: '#fff' }) + t(470, 420, 'R1', { size: 12, fill: '#fff' });
    return frame('3D-просмотр — led_module', ['Файл', 'Правка', 'Вид', 'Настройки', 'Справка'], body, { status: 'Вращение: ЛКМ   Сдвиг: СКМ   Масштаб: колесо' });
  };

  /* ---------- сцена: редактор символов ---------- */
  S.symedit = function (o) {
    var body = toolbarTop(18, 55);
    body += rect(0, 85, 230, 493, 'var(--k-bg)') + t(10, 104, 'Библиотеки', { size: 12, weight: 700 });
    ['▾ my_symbols', '     LM75A', '     TP4056', '▸ Device', '▸ power'].forEach(function (x, i) { var sel = i === 1; body += rect(4, 114 + i * 24, 222, 24, sel ? '#3c82dc' : 'none', null, 3) + t(10, 131 + i * 24, x, { size: 12, fill: sel ? '#fff' : 'var(--k-ui-text)' }); });
    body += toolbarSide(930, 85, ['↖', 'P', 'T', '▭', '○', '◠', '╱', '⌖', '⌫'], o.tool == null ? 0 : o.tool);
    body += rect(230, 85, 700, 493, 'var(--k-bg)') + grid(230, 85, 700, 493, 20);
    body += '<g>' + ic(500, 220, 160, 130, 'U', 'LM75A', ['SDA', 'SCL', 'OS', 'GND'], ['VCC', 'A0', 'A1', 'A2']) + '</g>';
    body += line(570, 200, 590, 220, '#999', 1) + line(560, 330, 580, 350, '#999', 1);
    if (o.dialog === 'pin') {
      body += dlg(300, 140, 420, 300, 'Свойства вывода');
      body += field(320, 184, 380, 'Имя вывода', 'SDA') + field(320, 220, 380, 'Номер', '1') + field(320, 256, 380, 'Электр. тип', 'Двунаправленный') + field(320, 292, 380, 'Графич. стиль', 'Линия') + field(320, 328, 380, 'Длина', '2.54 мм');
      body += btn(520, 400, 80, 'Отмена') + btn(610, 400, 90, 'OK', true);
    }
    return frame('Редактор символов — my_symbols:LM75A', ['Файл', 'Правка', 'Вид', 'Разместить', 'Проверка', 'Настройки', 'Справка'], body);
  };

  /* ---------- сцена: редактор посадочных мест ---------- */
  S.fpedit = function (o) {
    var body = toolbarTop(18, 55);
    body += rect(0, 85, 230, 493, 'var(--k-bg)') + t(10, 104, 'Библиотеки', { size: 12, weight: 700 });
    ['▾ my_footprints', '     SOT-23_hand', '     TestPoint_1mm', '▸ Resistor_SMD', '▸ Package_SO'].forEach(function (x, i) { var sel = i === 1; body += rect(4, 114 + i * 24, 222, 24, sel ? '#3c82dc' : 'none', null, 3) + t(10, 131 + i * 24, x, { size: 12, fill: sel ? '#fff' : 'var(--k-ui-text)' }); });
    body += rect(230, 85, 700, 493, 'var(--k-pcb)') + grid(230, 85, 700, 493, 25, '#2a3a50');
    body += toolbarSide(930, 85, ['↖', '▣', '╱', '○', '◠', 'T', '▭', '⌖'], o.tool == null ? 0 : o.tool);
    // SOT-23
    var pad = 'var(--k-pad)';
    body += rect(480, 330, 36, 56, pad, null, 4) + rect(620, 330, 36, 56, pad, null, 4) + rect(550, 190, 36, 56, pad, null, 4);
    body += rect(470, 240, 196, 90, 'none', 'var(--k-silk)', 0, ' stroke-width="2"') + rect(450, 170, 236, 236, 'none', '#ff26e2', 0, ' stroke-width="1.2"');
    body += t(498, 364, '1', { size: 16, anchor: 'middle', fill: '#000' }) + t(638, 364, '2', { size: 16, anchor: 'middle', fill: '#000' }) + t(568, 224, '3', { size: 16, anchor: 'middle', fill: '#000' });
    body += t(568, 160, 'REF**', { size: 14, anchor: 'middle', fill: 'var(--k-silk)' }) + t(568, 430, 'SOT-23_hand', { size: 13, anchor: 'middle', fill: '#afafaf' });
    return frame('Редактор посадочных мест — my_footprints:SOT-23_hand', ['Файл', 'Правка', 'Вид', 'Разместить', 'Проверка', 'Настройки', 'Справка'], body);
  };

  /* ---------- сцена: таблица библиотек ---------- */
  S.libtable = function (o) {
    var s = S.pm({ more: true });
    s += dlg(110, 80, 740, 440, o.fp ? 'Библиотеки посадочных мест' : 'Библиотеки символов');
    s += rect(130, 120, 300, 28, 'var(--k-ui-2)', null, 4) + t(140, 139, 'Глобальные библиотеки', { size: 12 }) + rect(430, 120, 300, 28, '#3c82dc', null, 4) + t(440, 139, 'Библиотеки проекта', { size: 12, fill: '#fff' });
    s += rect(130, 160, 700, 26, 'var(--k-ui-2)') + t(140, 178, 'Акт.   Имя              Путь', { size: 12, weight: 700 });
    s += rect(130, 186, 700, 26, 'var(--k-bg)') + t(140, 204, '☑     my_symbols     ${KIPRJMOD}/lib/my_symbols.kicad_sym', { size: 12 });
    s += btn(130, 400, 36, '+') + btn(172, 400, 36, '📂') + btn(214, 400, 36, '−');
    s += t(130, 460, 'Путь: ${KIPRJMOD} — папка текущего проекта', { size: 12 });
    s += btn(640, 480, 90, 'Отмена') + btn(740, 480, 90, 'OK', true);
    return s;
  };

  /* ---------- сцена: Gerber-просмотрщик ---------- */
  S.gerbview = function () {
    var body = toolbarTop(14, 55);
    body += rect(0, 85, 790, 493, '#000');
    body += rect(200, 170, 400, 250, 'none', '#d0d200', 0, ' stroke-width="2"');
    body += poly([[270, 280], [330, 280], [360, 250], [385, 250]], '#c83434', 8) + poly([[415, 250], [450, 250], [480, 280], [480, 300], [497, 300]], '#c83434', 8);
    body += rect(256, 266, 28, 28, '#c83434') + '<circle cx="270" cy="308" r="12" fill="#c83434"/>' + rect(380, 241, 14, 18, '#c83434') + rect(410, 241, 14, 18, '#c83434');
    body += rect(790, 85, 170, 493, 'var(--k-ui)') + t(800, 104, 'Слои Gerber', { size: 12, weight: 700 });
    ['led-F_Cu.gtl', 'led-B_Cu.gbl', 'led-F_Mask.gts', 'led-B_Mask.gbs', 'led-F_Silkscreen.gto', 'led-Edge_Cuts.gm1', 'led-PTH.drl'].forEach(function (f, i) { body += t(806, 130 + i * 24, '☑ ' + f, { size: 11 }); });
    return frame('Просмотр Gerber — gerbers/', ['Файл', 'Правка', 'Вид', 'Инструменты', 'Настройки', 'Справка'], body);
  };

  KM.data.scenes = S;
})();
