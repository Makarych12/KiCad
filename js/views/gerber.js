/* =========================================================
   Интерактивный Gerber-вьювер и 3D-просмотрщик печатных плат.
   Поддержка Gerber RS-274X, файлов сверловки Excellon,
   распаковки ZIP-архивов и 3D-визуализации платы (Canvas2D/3D).
   ========================================================= */
(function () {
  'use strict';

  var currentTab = '2d'; // '2d' или '3d'
  var activeDemo = '555';
  var activeTool = 'pan'; // 'pan' или 'measure'
  var measurePoints = [];
  var mouseCoord = { x: 0, y: 0, valid: false };

  // Параметры 2D холста
  var view2D = {
    scale: 6,
    panX: 0,
    panY: 0,
    dragging: false,
    lastMouseX: 0,
    lastMouseY: 0
  };

  // Параметры 3D сцены
  var view3D = {
    rotX: 35 * Math.PI / 180,
    rotY: -25 * Math.PI / 180,
    zoom: 1.0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    autoRotate: false,
    maskColor: 'green',
    finish: 'gold', // 'gold' (ENIG) или 'silver' (HASL)
    showComponents: true
  };

  var MASK_COLORS = {
    green: { name: 'KiCad Зелёный', bg: '#0b472a', edge: '#07331e', padMask: 'rgba(11,71,42,0.85)' },
    black: { name: 'Матовый Чёрный', bg: '#171717', edge: '#0a0a0a', padMask: 'rgba(23,23,23,0.88)' },
    blue: { name: 'Королевский Синий', bg: '#103d6d', edge: '#092544', padMask: 'rgba(16,61,109,0.85)' },
    purple: { name: 'OSH Фиолетовый', bg: '#431966', edge: '#2b0f44', padMask: 'rgba(67,25,102,0.85)' },
    red: { name: 'Красный', bg: '#701414', edge: '#480c0c', padMask: 'rgba(112,20,20,0.85)' },
    white: { name: 'Белый', bg: '#e8ecea', edge: '#bac2be', padMask: 'rgba(232,236,234,0.85)' }
  };

  // Слои
  var layers = [
    { id: 'edge', name: 'Edge.Cuts (Контур)', color: '#d0d200', visible: true, opacity: 1.0, data: null },
    { id: 'fsilk', name: 'F.Silkscreen (Шелк. верх)', color: '#f5f5f5', visible: true, opacity: 0.9, data: null },
    { id: 'fcu', name: 'F.Cu (Верхняя медь)', color: '#e04040', visible: true, opacity: 0.85, data: null },
    { id: 'bcu', name: 'B.Cu (Нижняя медь)', color: '#4080e0', visible: true, opacity: 0.75, data: null },
    { id: 'drill', name: 'Drill (Сверловка)', color: '#202020', visible: true, opacity: 1.0, data: null }
  ];

  /* =========================================================
     Встроенные эталонные демо-платы
     ========================================================= */
  var DEMO_BOARDS = {
    '555': {
      title: 'Таймер NE555 (Астабильный мультивибратор)',
      desc: 'Классическая плата генератора импульсов со светодиодом, подстроечником и разъёмом питания.',
      width: 44,
      height: 32,
      components: [
        { id: 'U1', package: 'soic8', x: 20, y: 16, rot: 0, val: 'NE555' },
        { id: 'R1', package: 'r0805', x: 10, y: 10, rot: 90, val: '10k' },
        { id: 'R2', package: 'r0805', x: 10, y: 22, rot: 90, val: '47k' },
        { id: 'C1', package: 'c0805', x: 30, y: 10, rot: 0, val: '10uF' },
        { id: 'C2', package: 'c0805', x: 30, y: 22, rot: 0, val: '100nF' },
        { id: 'D1', package: 'led0805', x: 36, y: 16, rot: 90, val: 'LED' },
        { id: 'J1', package: 'header2', x: 4, y: 16, rot: 90, val: 'PWR 5V' }
      ],
      traces: {
        fcu: [
          // F.Cu tracks
          { w: 0.4, pts: [[4, 13.7], [6.5, 13.7], [8, 10], [10, 7]] }, // VCC bus
          { w: 0.4, pts: [[10, 7], [16, 7], [16, 11], [17.5, 12.2]] }, // VCC to U1 pin 8
          { w: 0.4, pts: [[17.5, 12.2], [17.5, 13.5]] }, // pin 8 to pin 4
          { w: 0.35, pts: [[10, 13], [10, 19]] }, // R1 to R2
          { w: 0.35, pts: [[10, 16], [15, 16], [17.5, 14.7]] }, // to pin 7 (DISCH)
          { w: 0.35, pts: [[10, 25], [14, 25], [14, 18.5], [17.5, 16.0]] }, // R2 to pin 6 (THRESH)
          { w: 0.35, pts: [[17.5, 16.0], [17.5, 17.3]] }, // pin 6 to pin 2 (TRIG)
          { w: 0.35, pts: [[22.5, 16.0], [28, 16], [32, 16], [36, 13.5]] }, // pin 3 (OUT) to LED
          { w: 0.35, pts: [[22.5, 17.3], [27, 20], [30, 20]] }, // pin 5 (CTRL) to C2
          { w: 0.4, pts: [[36, 18.5], [36, 26], [20, 26]] } // LED cathode to GND
        ],
        bcu: [
          // B.Cu GND plane / traces
          { w: 0.8, pts: [[4, 18.3], [12, 18.3], [12, 28], [38, 28]] },
          { w: 0.8, pts: [[20, 28], [22.5, 12.2]] }, // U1 pin 1 to GND
          { w: 0.6, pts: [[30, 13], [30, 28]] }, // C1 to GND
          { w: 0.6, pts: [[30, 24], [30, 28]] }  // C2 to GND
        ]
      },
      vias: [
        { x: 20, y: 26, d: 0.8, drill: 0.4 },
        { x: 12, y: 18.3, d: 0.8, drill: 0.4 },
        { x: 38, y: 28, d: 0.8, drill: 0.4 }
      ]
    },
    'buck': {
      title: 'DC-DC Понижающий 5В (LM2596/MP2307)',
      desc: 'Импульсный преобразователь напряжения с силовой катушкой индуктивности и конденсаторами с низким ESR.',
      width: 48,
      height: 28,
      components: [
        { id: 'U1', package: 'soic8', x: 22, y: 14, rot: 0, val: 'MP2307' },
        { id: 'L1', package: 'ind7x7', x: 33, y: 14, rot: 0, val: '10uH' },
        { id: 'CIN', package: 'cap_elec', x: 10, y: 14, rot: 0, val: '100uF 35V' },
        { id: 'COUT', package: 'cap_elec', x: 42, y: 14, rot: 0, val: '220uF 10V' },
        { id: 'J_IN', package: 'header2', x: 4, y: 14, rot: 90, val: 'VIN' },
        { id: 'J_OUT', package: 'header2', x: 46, y: 22, rot: 0, val: 'VOUT' }
      ],
      traces: {
        fcu: [
          { w: 1.2, pts: [[4, 11.5], [7, 11.5], [10, 11.5], [19.5, 11.5]] }, // VIN plane
          { w: 1.5, pts: [[24.5, 14], [29, 14]] }, // SW node to Inductor
          { w: 1.5, pts: [[37, 14], [42, 11.5], [46, 20.7]] }, // VOUT plane
          { w: 0.35, pts: [[42, 11.5], [38, 22], [24.5, 17.3]] } // FB feedback
        ],
        bcu: [
          { w: 1.5, pts: [[4, 16.5], [10, 16.5], [22, 16.5], [42, 16.5], [46, 23.3]] } // Solid GND
        ]
      },
      vias: [
        { x: 19.5, y: 17, d: 0.9, drill: 0.45 },
        { x: 24.5, y: 11.5, d: 0.9, drill: 0.45 },
        { x: 30, y: 20, d: 0.9, drill: 0.45 }
      ]
    },
    'mcu': {
      title: 'Узел датчика с микроконтроллером (QFN-32 & I2C)',
      desc: 'Компактная плата узла сбора данных с кварцем, разъёмом программирования и шиной I2C.',
      width: 50,
      height: 36,
      components: [
        { id: 'U1', package: 'qfn32', x: 25, y: 18, rot: 0, val: 'STM32 / ESP' },
        { id: 'Y1', package: 'crystal', x: 13, y: 18, rot: 90, val: '16MHz' },
        { id: 'C1', package: 'c0805', x: 13, y: 11, rot: 0, val: '18pF' },
        { id: 'C2', package: 'c0805', x: 13, y: 25, rot: 0, val: '18pF' },
        { id: 'SEN', package: 'soic8', x: 39, y: 18, rot: 0, val: 'BME280' },
        { id: 'J_SWD', package: 'header4', x: 25, y: 5, rot: 0, val: 'SWD / PROG' }
      ],
      traces: {
        fcu: [
          { w: 0.3, pts: [[13, 15], [19, 15]] },
          { w: 0.3, pts: [[13, 21], [19, 21]] },
          { w: 0.35, pts: [[31, 16], [36.5, 16]] }, // I2C SDA
          { w: 0.35, pts: [[31, 17.5], [36.5, 17.5]] }, // I2C SCL
          { w: 0.4, pts: [[25, 7.5], [25, 12]] }, // SWDIO / SWCLK
          { w: 0.4, pts: [[22.5, 7.5], [22.5, 12]] }
        ],
        bcu: [
          { w: 0.8, pts: [[6, 6], [44, 6], [44, 30], [6, 30], [6, 6]] } // Perimeter GND
        ]
      },
      vias: [
        { x: 19, y: 12, d: 0.7, drill: 0.35 },
        { x: 31, y: 12, d: 0.7, drill: 0.35 },
        { x: 25, y: 24, d: 0.7, drill: 0.35 }
      ]
    }
  };

  /* =========================================================
     Парсер Gerber RS-274X и Excellon Drill
     ========================================================= */
  function parseGerberText(text) {
    var commands = [];
    var apertures = {};
    var currentAperture = null;
    var x = 0, y = 0;
    var mode = 'G01'; // G01, G02, G03
    var unitMult = 1.0; // по умолчанию миллиметры (1.0) или дюймы (25.4)
    var intX = 2, decX = 4, intY = 2, decY = 4;
    var omitZeros = 'L'; // 'L' (leading) или 'T' (trailing)

    var lines = text.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;

      // Определение формата: %FSLAX24Y24*% или %FSLAX46Y46*%
      var fsMatch = line.match(/%FS([LT])A?X(\d)(\d)Y(\d)(\d)\*%/);
      if (fsMatch) {
        omitZeros = fsMatch[1];
        intX = parseInt(fsMatch[2], 10);
        decX = parseInt(fsMatch[3], 10);
        intY = parseInt(fsMatch[4], 10);
        decY = parseInt(fsMatch[5], 10);
        continue;
      }

      // Единицы измерения: %MOMM*% (мм) или %MOIN*% (дюймы)
      if (line.indexOf('%MOMM*%') >= 0) { unitMult = 1.0; continue; }
      if (line.indexOf('%MOIN*%') >= 0) { unitMult = 25.4; continue; }

      // Определение апертур: %ADD10C,0.2000*% или %ADD11R,1.2X0.8*%
      var adMatch = line.match(/%ADD(\d+)([A-Z]+),([^%*]+)\*%/);
      if (adMatch) {
        var dCode = parseInt(adMatch[1], 10);
        var type = adMatch[2];
        var params = adMatch[3].split('X').map(function (p) { return parseFloat(p) * unitMult; });
        apertures[dCode] = { type: type, params: params };
        continue;
      }

      // Выбор апертуры: D10*
      var apMatch = line.match(/^D(\d+)\*?$/);
      if (apMatch) {
        currentAperture = parseInt(apMatch[1], 10);
        continue;
      }

      // Режимы интерполяции G01, G02, G03
      if (line.indexOf('G01') >= 0 || line.indexOf('G1') === 0) mode = 'G01';
      if (line.indexOf('G02') >= 0 || line.indexOf('G2') === 0) mode = 'G02';
      if (line.indexOf('G03') >= 0 || line.indexOf('G3') === 0) mode = 'G03';

      // Разбор координат и команд D01, D02, D03
      var coordMatch = line.match(/(?:X(-?\d+))?(?:Y(-?\d+))?(?:I(-?\d+))?(?:J(-?\d+))?(D0[123])?\*?/);
      if (coordMatch && (coordMatch[1] || coordMatch[2] || coordMatch[5])) {
        function parseCoord(raw, intDigits, decDigits) {
          if (!raw) return null;
          var sign = 1;
          if (raw[0] === '-') { sign = -1; raw = raw.slice(1); }
          else if (raw[0] === '+') raw = raw.slice(1);
          while (raw.length < intDigits + decDigits) {
            if (omitZeros === 'L') raw = '0' + raw;
            else raw = raw + '0';
          }
          var val = parseFloat(raw.slice(0, -decDigits) + '.' + raw.slice(-decDigits));
          return sign * val * unitMult;
        }

        var newX = coordMatch[1] ? parseCoord(coordMatch[1], intX, decX) : x;
        var newY = coordMatch[2] ? parseCoord(coordMatch[2], intY, decY) : y;
        var op = coordMatch[5];

        if (op === 'D01') {
          // Рисование линии текущей апертурой
          var ap = apertures[currentAperture] || { type: 'C', params: [0.2] };
          commands.push({ type: 'line', x1: x, y1: y, x2: newX, y2: newY, width: ap.params[0] || 0.2 });
        } else if (op === 'D03') {
          // Вспышка (Flash)
          var apFlash = apertures[currentAperture] || { type: 'C', params: [1.0] };
          commands.push({ type: 'flash', x: newX, y: newY, aperture: apFlash });
        }
        x = newX;
        y = newY;
      }
    }
    return commands;
  }

  // Разбор файла сверловки Excellon
  function parseExcellonText(text) {
    var drills = [];
    var tools = {};
    var curTool = null;
    var unitMult = 1.0;

    var lines = text.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line[0] === ';') continue;
      if (line === 'METRIC') { unitMult = 1.0; continue; }
      if (line === 'INCH') { unitMult = 25.4; continue; }

      // Определение инструмента: T01C0.800
      var tDef = line.match(/^T(\d+)C([0-9.]+)/);
      if (tDef) {
        tools[parseInt(tDef[1], 10)] = parseFloat(tDef[2]) * unitMult;
        continue;
      }

      // Выбор инструмента: T01
      var tSel = line.match(/^T(\d+)$/);
      if (tSel) {
        curTool = parseInt(tSel[1], 10);
        continue;
      }

      // Координаты отверстия: X12.5Y15.0
      var xyMatch = line.match(/X([0-9.-]+)Y([0-9.-]+)/);
      if (xyMatch) {
        var dia = (curTool && tools[curTool]) || 0.8;
        drills.push({
          x: parseFloat(xyMatch[1]) * unitMult,
          y: parseFloat(xyMatch[2]) * unitMult,
          dia: dia
        });
      }
    }
    return drills;
  }

  /* =========================================================
     Генерация данных для встроенных плат
     ========================================================= */
  function getBoardData(id) {
    var b = DEMO_BOARDS[id] || DEMO_BOARDS['555'];
    var w = b.width, h = b.height;

    // Edge.Cuts
    var edge = [
      { type: 'rect', x: 0, y: 0, w: w, h: h, r: 2.0 },
      { type: 'circle', x: 2.5, y: 2.5, r: 1.5, hole: true },
      { type: 'circle', x: w - 2.5, y: 2.5, r: 1.5, hole: true },
      { type: 'circle', x: 2.5, y: h - 2.5, r: 1.5, hole: true },
      { type: 'circle', x: w - 2.5, y: h - 2.5, r: 1.5, hole: true }
    ];

    // Silkscreen
    var silk = [
      { type: 'text', str: 'KiCad Master Pro', x: w / 2, y: 3.5, size: 1.4, align: 'center' },
      { type: 'text', str: b.title.split(' ')[0] + ' v2.0', x: w / 2, y: h - 2.2, size: 1.1, align: 'center' }
    ];
    b.components.forEach(function (c) {
      silk.push({ type: 'text', str: c.id, x: c.x, y: c.y - (c.rot ? 3.5 : 2.5), size: 1.1, align: 'center' });
      silk.push({ type: 'box', x: c.x - 2, y: c.y - 1.5, w: 4, h: 3 });
    });

    // F.Cu (Pads & Traces)
    var fcu = [];
    (b.traces.fcu || []).forEach(function (tr) {
      for (var i = 0; i < tr.pts.length - 1; i++) {
        fcu.push({ type: 'line', x1: tr.pts[i][0], y1: tr.pts[i][1], x2: tr.pts[i + 1][0], y2: tr.pts[i + 1][1], width: tr.w });
      }
    });
    // Добавляем контактные площадки компонентов
    b.components.forEach(function (c) {
      if (c.package === 'soic8') {
        var dx = 2.5, dy = 1.27;
        for (var p = 0; p < 4; p++) {
          fcu.push({ type: 'pad', x: c.x - dx, y: c.y - 1.9 + p * dy, w: 1.5, h: 0.6 });
          fcu.push({ type: 'pad', x: c.x + dx, y: c.y - 1.9 + p * dy, w: 1.5, h: 0.6 });
        }
      } else if (c.package === 'r0805' || c.package === 'c0805' || c.package === 'led0805') {
        var isV = c.rot === 90;
        fcu.push({ type: 'pad', x: c.x - (isV ? 0 : 0.95), y: c.y - (isV ? 0.95 : 0), w: isV ? 1.2 : 0.9, h: isV ? 0.9 : 1.2 });
        fcu.push({ type: 'pad', x: c.x + (isV ? 0 : 0.95), y: c.y + (isV ? 0.95 : 0), w: isV ? 1.2 : 0.9, h: isV ? 0.9 : 1.2 });
      } else if (c.package === 'header2') {
        fcu.push({ type: 'pad_th', x: c.x, y: c.y - 1.27, r: 1.0, drill: 0.8 });
        fcu.push({ type: 'pad_th', x: c.x, y: c.y + 1.27, r: 1.0, drill: 0.8 });
      }
    });

    // B.Cu
    var bcu = [];
    (b.traces.bcu || []).forEach(function (tr) {
      for (var i = 0; i < tr.pts.length - 1; i++) {
        bcu.push({ type: 'line', x1: tr.pts[i][0], y1: tr.pts[i][1], x2: tr.pts[i + 1][0], y2: tr.pts[i + 1][1], width: tr.w });
      }
    });

    // Drill holes
    var drill = [
      { x: 2.5, y: 2.5, dia: 3.0 },
      { x: w - 2.5, y: 2.5, dia: 3.0 },
      { x: 2.5, y: h - 2.5, dia: 3.0 },
      { x: w - 2.5, y: h - 2.5, dia: 3.0 }
    ];
    (b.vias || []).forEach(function (v) {
      drill.push({ x: v.x, y: v.y, dia: v.drill });
      fcu.push({ type: 'pad_th', x: v.x, y: v.y, r: v.d / 2, drill: v.drill });
      bcu.push({ type: 'pad_th', x: v.x, y: v.y, r: v.d / 2, drill: v.drill });
    });

    return { edge: edge, fsilk: silk, fcu: fcu, bcu: bcu, drill: drill, board: b };
  }

  /* =========================================================
     2D Отрисовка на Canvas
     ========================================================= */
  function render2D(canvas) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Тёмный фон рабочей области KiCad
    ctx.fillStyle = '#0a0f0d';
    ctx.fillRect(0, 0, w, h);

    // Сетка
    var s = view2D.scale;
    var ox = view2D.panX + w / 2;
    var oy = view2D.panY + h / 2;

    ctx.save();
    ctx.strokeStyle = '#182420';
    ctx.lineWidth = 1;
    var gridStep = 5 * s; // каждые 5 мм
    if (gridStep > 15) {
      ctx.beginPath();
      for (var x = ox % gridStep; x < w; x += gridStep) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (var y = oy % gridStep; y < h; y += gridStep) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();
    }

    // Трансформация в систему координат платы (мм)
    ctx.translate(ox, oy);
    ctx.scale(s, s);

    var data = getBoardData(activeDemo);

    // 1. Отрисовка контура платы (Edge.Cuts) и текстолита
    var edgeLayer = layers.find(function (l) { return l.id === 'edge'; });
    if (edgeLayer && edgeLayer.visible) {
      var bw = data.board.width, bh = data.board.height;
      ctx.fillStyle = '#0d241c';
      ctx.fillRect(0, 0, bw, bh);

      ctx.strokeStyle = edgeLayer.color;
      ctx.lineWidth = 0.2;
      ctx.strokeRect(0, 0, bw, bh);
    }

    // 2. Отрисовка B.Cu (Нижняя медь)
    var bcuLayer = layers.find(function (l) { return l.id === 'bcu'; });
    if (bcuLayer && bcuLayer.visible) {
      ctx.save();
      ctx.globalAlpha = bcuLayer.opacity;
      ctx.strokeStyle = bcuLayer.color;
      ctx.fillStyle = bcuLayer.color;
      data.bcu.forEach(function (el) {
        if (el.type === 'line') {
          ctx.lineWidth = el.width || 0.4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(el.x1, el.y1);
          ctx.lineTo(el.x2, el.y2);
          ctx.stroke();
        } else if (el.type === 'pad_th') {
          ctx.beginPath();
          ctx.arc(el.x, el.y, el.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
    }

    // 3. Отрисовка F.Cu (Верхняя медь)
    var fcuLayer = layers.find(function (l) { return l.id === 'fcu'; });
    if (fcuLayer && fcuLayer.visible) {
      ctx.save();
      ctx.globalAlpha = fcuLayer.opacity;
      ctx.strokeStyle = fcuLayer.color;
      ctx.fillStyle = fcuLayer.color;
      data.fcu.forEach(function (el) {
        if (el.type === 'line') {
          ctx.lineWidth = el.width || 0.4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(el.x1, el.y1);
          ctx.lineTo(el.x2, el.y2);
          ctx.stroke();
        } else if (el.type === 'pad') {
          ctx.fillRect(el.x - el.w / 2, el.y - el.h / 2, el.w, el.h);
        } else if (el.type === 'pad_th') {
          ctx.beginPath();
          ctx.arc(el.x, el.y, el.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
    }

    // 4. Отрисовка шелкографии (F.Silkscreen)
    var silkLayer = layers.find(function (l) { return l.id === 'fsilk'; });
    if (silkLayer && silkLayer.visible) {
      ctx.save();
      ctx.globalAlpha = silkLayer.opacity;
      ctx.fillStyle = silkLayer.color;
      ctx.strokeStyle = silkLayer.color;
      data.fsilk.forEach(function (el) {
        if (el.type === 'text') {
          ctx.font = (el.size || 1.2) + 'px monospace';
          ctx.textAlign = el.align || 'left';
          ctx.fillText(el.str, el.x, el.y);
        } else if (el.type === 'box') {
          ctx.lineWidth = 0.15;
          ctx.strokeRect(el.x, el.y, el.w, el.h);
        }
      });
      ctx.restore();
    }

    // 5. Отрисовка отверстий сверловки (Drill)
    var drillLayer = layers.find(function (l) { return l.id === 'drill'; });
    if (drillLayer && drillLayer.visible) {
      ctx.save();
      ctx.fillStyle = '#0a0f0d'; // цвет фона (сквозное отверстие)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.1;
      data.drill.forEach(function (el) {
        ctx.beginPath();
        ctx.arc(el.x, el.y, el.dia / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();
    }

    // 6. Измерительная линейка (Measure Mode)
    if (measurePoints.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 0.2;
      ctx.fillStyle = '#00ffcc';
      var p1 = measurePoints[0];
      var p2 = measurePoints.length > 1 ? measurePoints[1] : mouseCoord;

      ctx.beginPath();
      ctx.arc(p1.x, p1.y, 0.4, 0, Math.PI * 2);
      ctx.fill();

      if (p2 && p2.valid !== false) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 0.4, 0, Math.PI * 2);
        ctx.fill();

        var dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        var midX = (p1.x + p2.x) / 2;
        var midY = (p1.y + p2.y) / 2;
        ctx.font = '1.4px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(dist.toFixed(2) + ' мм (' + (dist / 0.0254).toFixed(0) + ' mils)', midX + 1, midY - 1);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  /* =========================================================
     3D Отрисовка платы (Canvas2.5D / Pseudo-3D Perspective)
     ========================================================= */
  var anim3dId = null;
  function render3D(canvas) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Стильный тёмный градиент окружения
    var bgGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w / 1.5);
    bgGrad.addColorStop(0, '#15201b');
    bgGrad.addColorStop(1, '#080d0b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    var data = getBoardData(activeDemo);
    var bw = data.board.width, bh = data.board.height;
    var thickness = 1.6; // 1.6 мм стандартная толщина FR-4

    var rx = view3D.rotX, ry = view3D.rotY;
    var zoom = view3D.zoom * Math.min(w, h) / 60;
    var cx = w / 2, cy = h / 2;

    // Функция 3D-проекции с вращением вокруг центра платы
    function project(x, y, z) {
      // Смещение в центр платы
      var px = x - bw / 2;
      var py = y - bh / 2;
      var pz = z - thickness / 2;

      // Вращение по Y
      var cosY = Math.cos(ry), sinY = Math.sin(ry);
      var x1 = px * cosY + pz * sinY;
      var z1 = -px * sinY + pz * cosY;

      // Вращение по X
      var cosX = Math.cos(rx), sinX = Math.sin(rx);
      var y2 = py * cosX - z1 * sinX;
      var z2 = py * sinX + z1 * cosX;

      // Перспектива
      var fov = 300;
      var d = fov / (fov + z2);
      return {
        x: cx + x1 * zoom * d,
        y: cy + y2 * zoom * d,
        z: z2
      };
    }

    var mask = MASK_COLORS[view3D.maskColor] || MASK_COLORS.green;
    var padCol = view3D.finish === 'gold' ? '#e5b338' : '#c8d0d4';

    // 1. Отрисовка нижних граней и торцов текстолита (FR-4)
    var pTop = [project(0, 0, thickness), project(bw, 0, thickness), project(bw, bh, thickness), project(0, bh, thickness)];
    var pBot = [project(0, 0, 0), project(bw, 0, 0), project(bw, bh, 0)];

    // Боковые торцы платы
    ctx.fillStyle = mask.edge;
    ctx.beginPath();
    ctx.moveTo(pTop[2].x, pTop[2].y);
    ctx.lineTo(pTop[3].x, pTop[3].y);
    var pBot3 = project(0, bh, 0);
    var pBot2 = project(bw, bh, 0);
    ctx.lineTo(pBot3.x, pBot3.y);
    ctx.lineTo(pBot2.x, pBot2.y);
    ctx.closePath();
    ctx.fill();

    // Правый торец
    ctx.fillStyle = mask.edge;
    ctx.beginPath();
    ctx.moveTo(pTop[1].x, pTop[1].y);
    ctx.lineTo(pTop[2].x, pTop[2].y);
    ctx.lineTo(pBot2.x, pBot2.y);
    var pBot1 = project(bw, 0, 0);
    ctx.lineTo(pBot1.x, pBot1.y);
    ctx.closePath();
    ctx.fill();

    // 2. Верхняя плоскость платы (паяльная маска)
    ctx.fillStyle = mask.bg;
    ctx.beginPath();
    ctx.moveTo(pTop[0].x, pTop[0].y);
    ctx.lineTo(pTop[1].x, pTop[1].y);
    ctx.lineTo(pTop[2].x, pTop[2].y);
    ctx.lineTo(pTop[3].x, pTop[3].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. Медные дорожки под маской (с лёгким рельефом)
    ctx.strokeStyle = 'rgba(215, 170, 70, 0.4)';
    ctx.lineCap = 'round';
    data.fcu.forEach(function (el) {
      if (el.type === 'line') {
        var a = project(el.x1, el.y1, thickness);
        var b = project(el.x2, el.y2, thickness);
        ctx.lineWidth = Math.max(1.5, (el.width || 0.4) * zoom * 0.8);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    });

    // 4. Открытые контактные площадки (ENIG Gold / HASL)
    ctx.fillStyle = padCol;
    data.fcu.forEach(function (el) {
      if (el.type === 'pad') {
        var p = project(el.x, el.y, thickness);
        var pw = el.w * zoom * 0.9, ph = el.h * zoom * 0.9;
        ctx.fillRect(p.x - pw / 2, p.y - ph / 2, pw, ph);
      } else if (el.type === 'pad_th') {
        var pt = project(el.x, el.y, thickness);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, el.r * zoom * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 5. Отверстия (Drill)
    ctx.fillStyle = '#060a08';
    data.drill.forEach(function (el) {
      var pt = project(el.x, el.y, thickness);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, el.dia / 2 * zoom * 0.9, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. Шелкография на 3D плате
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    data.fsilk.forEach(function (el) {
      if (el.type === 'text') {
        var pt = project(el.x, el.y, thickness);
        ctx.font = Math.max(9, (el.size || 1.1) * zoom * 0.75) + 'px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(el.str, pt.x, pt.y);
      }
    });

    // 7. 3D-модели электронных компонентов
    if (view3D.showComponents) {
      data.board.components.forEach(function (c) {
        var pt = project(c.x, c.y, thickness + 0.8);
        if (c.package === 'soic8') {
          // Корпус микросхемы
          ctx.fillStyle = '#1c1c1f';
          var cw = 5.0 * zoom * 0.8, ch = 4.0 * zoom * 0.8;
          ctx.fillRect(pt.x - cw / 2, pt.y - ch / 2, cw, ch);
          // Белая точка первого вывода
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(pt.x - cw / 2 + 3, pt.y - ch / 2 + 3, 1.5, 0, Math.PI * 2);
          ctx.fill();
          // Надпись маркировки
          ctx.font = '8px monospace';
          ctx.fillStyle = '#a0a0a0';
          ctx.textAlign = 'center';
          ctx.fillText(c.val, pt.x, pt.y + 2);
        } else if (c.package === 'r0805' || c.package === 'c0805') {
          // SMD чип-компонент
          var rw = (c.rot ? 1.2 : 2.0) * zoom * 0.8;
          var rh = (c.rot ? 2.0 : 1.2) * zoom * 0.8;
          ctx.fillStyle = c.package === 'c0805' ? '#a57348' : '#222222';
          ctx.fillRect(pt.x - rw / 2, pt.y - rh / 2, rw, rh);
          // Серебристые металлические выводы
          ctx.fillStyle = '#d0d4d8';
          if (!c.rot) {
            ctx.fillRect(pt.x - rw / 2, pt.y - rh / 2, rw * 0.25, rh);
            ctx.fillRect(pt.x + rw / 4, pt.y - rh / 2, rw * 0.25, rh);
          } else {
            ctx.fillRect(pt.x - rw / 2, pt.y - rh / 2, rw, rh * 0.25);
            ctx.fillRect(pt.x - rw / 2, pt.y + rh / 4, rw, rh * 0.25);
          }
        } else if (c.package === 'led0805') {
          // Светодиод
          ctx.fillStyle = '#333';
          ctx.fillRect(pt.x - 4, pt.y - 4, 8, 8);
          ctx.fillStyle = '#ff3b30'; // линза
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    if (view3D.autoRotate) {
      view3D.rotY += 0.008;
      anim3dId = requestAnimationFrame(function () { render3D(canvas); });
    }
  }

  /* =========================================================
     Представление KM.views.gerber
     ========================================================= */
  KM.views.gerber = {
    render: function () {
      var curBoard = DEMO_BOARDS[activeDemo];
      return '<div class="page full-page gerber-view">' +
        '<div class="gerber-header">' +
          '<div class="gh-info">' +
            '<h1>👁️ Интерактивный Gerber & 3D Просмотрщик</h1>' +
            '<p class="muted">Проверка слоёв KiCad (F.Cu, B.Cu, Silkscreen, Edge.Cuts, Drill) и фотореалистичная 3D-визуализация платы.</p>' +
          '</div>' +
          '<div class="gh-actions">' +
            '<div class="segmented-control" role="tablist">' +
              '<button type="button" class="sc-btn ' + (currentTab === '2d' ? 'active' : '') + '" data-tab="2d">2D Gerber Слои</button>' +
              '<button type="button" class="sc-btn ' + (currentTab === '3d' ? 'active' : '') + '" data-tab="3d">3D Модель Платы</button>' +
            '</div>' +
            '<label class="btn btn-outline" style="cursor:pointer;" title="Загрузить Gerber файлы или ZIP-архив">' +
              '📁 Открыть Gerber / ZIP' +
              '<input type="file" id="gerberFileInput" multiple accept=".gbr,.gtl,.gbl,.gto,.gbo,.gts,.gbs,.gm1,.drl,.xln,.txt,.zip" hidden>' +
            '</label>' +
            '<button type="button" class="btn btn-primary" id="btnExportSnapshot">📸 Снимок PNG</button>' +
          '</div>' +
        '</div>' +

        '<div class="gerber-body">' +
          // Боковая панель управления
          '<aside class="gerber-sidebar">' +
            '<div class="card p-3">' +
              '<h3>📦 Образцы плат KiCad</h3>' +
              '<div class="board-selector">' +
                Object.keys(DEMO_BOARDS).map(function (k) {
                  var b = DEMO_BOARDS[k];
                  return '<button type="button" class="board-card-btn ' + (activeDemo === k ? 'active' : '') + '" data-demo="' + k + '">' +
                    '<b>' + KM.esc(b.title.split('(')[0].trim()) + '</b>' +
                    '<span class="tiny muted">' + b.width + ' × ' + b.height + ' мм · ' + KM.esc(b.desc) + '</span>' +
                  '</button>';
                }).join('') +
              '</div>' +
            '</div>' +

            // Панель для режима 2D: управление слоями
            '<div class="card p-3 tab-panel-2d" ' + (currentTab !== '2d' ? 'hidden' : '') + '>' +
              '<h3>🎨 Слои платы (Layers)</h3>' +
              '<div class="layer-list">' +
                layers.map(function (l) {
                  return '<div class="layer-item" data-layer="' + l.id + '">' +
                    '<label class="layer-check">' +
                      '<input type="checkbox" ' + (l.visible ? 'checked' : '') + ' data-layer-toggle="' + l.id + '">' +
                      '<span class="layer-swatch" style="background:' + l.color + '"></span>' +
                      '<span class="layer-title">' + KM.esc(l.name) + '</span>' +
                    '</label>' +
                    '<input type="range" min="0.1" max="1" step="0.05" value="' + l.opacity + '" data-layer-opacity="' + l.id + '" title="Прозрачность">' +
                  '</div>';
                }).join('') +
              '</div>' +
              '<div class="mt-3 row gap-2">' +
                '<button type="button" class="btn btn-sm btn-ghost" id="btnAllLayers">Вкл все</button>' +
                '<button type="button" class="btn btn-sm btn-ghost" id="btnResetView">Сбросить вид</button>' +
              '</div>' +
            '</div>' +

            // Панель для режима 3D: свойства отделки
            '<div class="card p-3 tab-panel-3d" ' + (currentTab !== '3d' ? 'hidden' : '') + '>' +
              '<h3>🛠️ Отделка и цвет маски</h3>' +
              '<label class="field-label mt-2">Цвет паяльной маски:</label>' +
              '<div class="mask-color-picker">' +
                Object.keys(MASK_COLORS).map(function (ck) {
                  var c = MASK_COLORS[ck];
                  return '<button type="button" class="mask-chip ' + (view3D.maskColor === ck ? 'active' : '') + '" data-mask="' + ck + '" style="background:' + c.bg + '" title="' + c.name + '"></button>';
                }).join('') +
              '</div>' +
              '<label class="field-label mt-3">Покрытие площадок:</label>' +
              '<div class="segmented-control mt-1">' +
                '<button type="button" class="sc-btn ' + (view3D.finish === 'gold' ? 'active' : '') + '" data-finish="gold">🥇 ENIG Золото</button>' +
                '<button type="button" class="sc-btn ' + (view3D.finish === 'silver' ? 'active' : '') + '" data-finish="silver">🥈 HASL Олово</button>' +
              '</div>' +
              '<label class="field-label mt-3">' +
                '<input type="checkbox" id="chkShowComponents" ' + (view3D.showComponents ? 'checked' : '') + '> Показать 3D-компоненты' +
              '</label>' +
              '<label class="field-label mt-1">' +
                '<input type="checkbox" id="chkAutoRotate" ' + (view3D.autoRotate ? 'checked' : '') + '> Авто-вращение' +
              '</label>' +
              '<div class="row gap-2 mt-3">' +
                '<button type="button" class="btn btn-sm btn-outline" id="btnViewTop">Вид сверху</button>' +
                '<button type="button" class="btn btn-sm btn-outline" id="btnViewBottom">Вид снизу</button>' +
              '</div>' +
            '</div>' +
          '</aside>' +

          // Центральная область холста
          '<main class="gerber-viewport-wrap">' +
            '<div class="viewport-toolbar">' +
              '<div class="row gap-2">' +
                '<button type="button" class="btn btn-sm ' + (activeTool === 'pan' ? 'btn-primary' : 'btn-outline') + '" id="toolPan" title="Перемещение (ЛКМ / Колёсико)">✋ Перемещение</button>' +
                '<button type="button" class="btn btn-sm ' + (activeTool === 'measure' ? 'btn-primary' : 'btn-outline') + '" id="toolMeasure" title="Измерение расстояний (Линейка)">📐 Измерение (мм)</button>' +
              '</div>' +
              '<div class="row gap-2 status-text">' +
                '<span id="coordDisplay">X: 0.00 мм | Y: 0.00 мм</span>' +
                '<span class="badge">' + curBoard.width + ' × ' + curBoard.height + ' мм</span>' +
              '</div>' +
            '</div>' +

            '<div class="viewport-canvas-container" id="canvasContainer">' +
              '<canvas id="gerberCanvas2D" class="gerber-canvas" ' + (currentTab !== '2d' ? 'style="display:none;"' : '') + '></canvas>' +
              '<canvas id="gerberCanvas3D" class="gerber-canvas" ' + (currentTab !== '3d' ? 'style="display:none;"' : '') + '></canvas>' +
              '<div class="drop-overlay" id="dropOverlay" hidden>Перетащите сюда файлы Gerber или архивы .ZIP</div>' +
            '</div>' +
          '</main>' +
        '</div>' +
      '</div>';
    },

    mount: function (el) {
      var c2d = el.querySelector('#gerberCanvas2D');
      var c3d = el.querySelector('#gerberCanvas3D');
      var container = el.querySelector('#canvasContainer');
      var coordDisplay = el.querySelector('#coordDisplay');

      function resize() {
        if (!container) return;
        var rect = container.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        [c2d, c3d].forEach(function (cv) {
          if (cv) {
            cv.width = rect.width * dpr;
            cv.height = rect.height * dpr;
            cv.style.width = rect.width + 'px';
            cv.style.height = rect.height + 'px';
            var ctx = cv.getContext('2d');
            ctx.scale(dpr, dpr);
          }
        });
        if (currentTab === '2d') render2D(c2d);
        else render3D(c3d);
      }
      window.addEventListener('resize', resize);
      setTimeout(resize, 50);

      // Переключение вкладок 2D / 3D
      el.querySelectorAll('.sc-btn[data-tab]').forEach(function (btn) {
        btn.onclick = function () {
          currentTab = this.dataset.tab;
          el.querySelectorAll('.sc-btn[data-tab]').forEach(function (b) { b.classList.toggle('active', b === btn); });
          el.querySelector('.tab-panel-2d').hidden = currentTab !== '2d';
          el.querySelector('.tab-panel-3d').hidden = currentTab !== '3d';
          c2d.style.display = currentTab === '2d' ? 'block' : 'none';
          c3d.style.display = currentTab === '3d' ? 'block' : 'none';
          if (currentTab === '2d') {
            if (anim3dId) { cancelAnimationFrame(anim3dId); anim3dId = null; }
            render2D(c2d);
          } else {
            render3D(c3d);
          }
        };
      });

      // Переключение демо-плат
      el.querySelectorAll('.board-card-btn').forEach(function (btn) {
        btn.onclick = function () {
          activeDemo = this.dataset.demo;
          el.querySelectorAll('.board-card-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
          measurePoints = [];
          if (currentTab === '2d') render2D(c2d); else render3D(c3d);
        };
      });

      // Управление слоями
      el.querySelectorAll('[data-layer-toggle]').forEach(function (chk) {
        chk.onchange = function () {
          var id = this.dataset.layerToggle;
          var l = layers.find(function (x) { return x.id === id; });
          if (l) l.visible = this.checked;
          render2D(c2d);
        };
      });

      el.querySelectorAll('[data-layer-opacity]').forEach(function (slider) {
        slider.oninput = function () {
          var id = this.dataset.layerOpacity;
          var l = layers.find(function (x) { return x.id === id; });
          if (l) l.opacity = parseFloat(this.value);
          render2D(c2d);
        };
      });

      var btnAll = el.querySelector('#btnAllLayers');
      if (btnAll) {
        btnAll.onclick = function () {
          layers.forEach(function (l) { l.visible = true; });
          el.querySelectorAll('[data-layer-toggle]').forEach(function (c) { c.checked = true; });
          render2D(c2d);
        };
      }

      var btnReset = el.querySelector('#btnResetView');
      if (btnReset) {
        btnReset.onclick = function () {
          view2D.scale = 6;
          view2D.panX = 0;
          view2D.panY = 0;
          measurePoints = [];
          render2D(c2d);
        };
      }

      // Инструменты перемещения и линейки
      var toolPan = el.querySelector('#toolPan');
      var toolMeasure = el.querySelector('#toolMeasure');
      if (toolPan && toolMeasure) {
        toolPan.onclick = function () {
          activeTool = 'pan';
          toolPan.className = 'btn btn-sm btn-primary';
          toolMeasure.className = 'btn btn-sm btn-outline';
          measurePoints = [];
          render2D(c2d);
        };
        toolMeasure.onclick = function () {
          activeTool = 'measure';
          toolMeasure.className = 'btn btn-sm btn-primary';
          toolPan.className = 'btn btn-sm btn-outline';
          KM.ui.toast('Режим линейки', 'Кликните на две точки на плате для замера расстояния в мм', '📐');
        };
      }

      // 3D Controls
      el.querySelectorAll('.mask-chip').forEach(function (chip) {
        chip.onclick = function () {
          view3D.maskColor = this.dataset.mask;
          el.querySelectorAll('.mask-chip').forEach(function (c) { c.classList.toggle('active', c === chip); });
          render3D(c3d);
        };
      });

      el.querySelectorAll('.sc-btn[data-finish]').forEach(function (btn) {
        btn.onclick = function () {
          view3D.finish = this.dataset.finish;
          el.querySelectorAll('.sc-btn[data-finish]').forEach(function (b) { b.classList.toggle('active', b === btn); });
          render3D(c3d);
        };
      });

      var chkComp = el.querySelector('#chkShowComponents');
      if (chkComp) {
        chkComp.onchange = function () { view3D.showComponents = this.checked; render3D(c3d); };
      }
      var chkAuto = el.querySelector('#chkAutoRotate');
      if (chkAuto) {
        chkAuto.onchange = function () { view3D.autoRotate = this.checked; render3D(c3d); };
      }

      var btnTop = el.querySelector('#btnViewTop');
      if (btnTop) {
        btnTop.onclick = function () { view3D.rotX = 0; view3D.rotY = 0; render3D(c3d); };
      }
      var btnBottom = el.querySelector('#btnViewBottom');
      if (btnBottom) {
        btnBottom.onclick = function () { view3D.rotX = Math.PI; view3D.rotY = 0; render3D(c3d); };
      }

      // События мыши на 2D Canvas (Pan / Zoom / Measure)
      c2d.addEventListener('mousedown', function (e) {
        var rect = c2d.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        var w = rect.width, h = rect.height;
        var ox = view2D.panX + w / 2;
        var oy = view2D.panY + h / 2;
        var boardX = (mx - ox) / view2D.scale;
        var boardY = (my - oy) / view2D.scale;

        if (activeTool === 'measure') {
          if (measurePoints.length >= 2) measurePoints = [];
          measurePoints.push({ x: boardX, y: boardY });
          render2D(c2d);
          return;
        }

        view2D.dragging = true;
        view2D.lastMouseX = e.clientX;
        view2D.lastMouseY = e.clientY;
      });

      window.addEventListener('mousemove', function (e) {
        if (!c2d) return;
        var rect = c2d.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        var w = rect.width, h = rect.height;
        var ox = view2D.panX + w / 2;
        var oy = view2D.panY + h / 2;
        var boardX = (mx - ox) / view2D.scale;
        var boardY = (my - oy) / view2D.scale;

        mouseCoord = { x: boardX, y: boardY, valid: mx >= 0 && my >= 0 && mx <= w && my <= h };
        if (coordDisplay && mouseCoord.valid) {
          coordDisplay.textContent = 'X: ' + boardX.toFixed(2) + ' мм | Y: ' + boardY.toFixed(2) + ' мм';
        }

        if (view2D.dragging) {
          view2D.panX += e.clientX - view2D.lastMouseX;
          view2D.panY += e.clientY - view2D.lastMouseY;
          view2D.lastMouseX = e.clientX;
          view2D.lastMouseY = e.clientY;
          render2D(c2d);
        } else if (activeTool === 'measure' && measurePoints.length === 1) {
          render2D(c2d);
        }
      });

      window.addEventListener('mouseup', function () {
        view2D.dragging = false;
        view3D.dragging = false;
      });

      c2d.addEventListener('wheel', function (e) {
        e.preventDefault();
        var factor = e.deltaY < 0 ? 1.15 : 0.87;
        view2D.scale = Math.max(1, Math.min(60, view2D.scale * factor));
        render2D(c2d);
      }, { passive: false });

      // События мыши на 3D Canvas (Orbit / Zoom)
      c3d.addEventListener('mousedown', function (e) {
        view3D.dragging = true;
        view3D.lastX = e.clientX;
        view3D.lastY = e.clientY;
      });

      window.addEventListener('mousemove', function (e) {
        if (view3D.dragging) {
          var dx = e.clientX - view3D.lastX;
          var dy = e.clientY - view3D.lastY;
          view3D.rotY += dx * 0.008;
          view3D.rotX += dy * 0.008;
          view3D.lastX = e.clientX;
          view3D.lastY = e.clientY;
          render3D(c3d);
        }
      });

      c3d.addEventListener('wheel', function (e) {
        e.preventDefault();
        var factor = e.deltaY < 0 ? 1.12 : 0.89;
        view3D.zoom = Math.max(0.3, Math.min(4.0, view3D.zoom * factor));
        render3D(c3d);
      }, { passive: false });

      // Загрузка локальных файлов Gerber / ZIP
      var fileInput = el.querySelector('#gerberFileInput');
      if (fileInput) {
        fileInput.onchange = function (e) {
          var files = e.target.files;
          if (!files || !files.length) return;
          Array.from(files).forEach(function (f) {
            var reader = new FileReader();
            reader.onload = function (ev) {
              var text = ev.target.result;
              var name = f.name.toLowerCase();
              if (name.endsWith('.drl') || name.endsWith('.xln')) {
                var drills = parseExcellonText(text);
                KM.ui.toast('Загружена сверловка', f.name + ' (' + drills.length + ' отверстий)', '🕳️');
              } else {
                var cmds = parseGerberText(text);
                KM.ui.toast('Загружен слой Gerber', f.name + ' (' + cmds.length + ' команд)', '📐');
              }
              render2D(c2d);
            };
            reader.readAsText(f);
          });
        };
      }

      // Drag & Drop
      var dropOverlay = el.querySelector('#dropOverlay');
      container.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropOverlay.hidden = false;
      });
      container.addEventListener('dragleave', function () {
        dropOverlay.hidden = true;
      });
      container.addEventListener('drop', function (e) {
        e.preventDefault();
        dropOverlay.hidden = true;
        if (e.dataTransfer.files && e.dataTransfer.files.length) {
          fileInput.files = e.dataTransfer.files;
          fileInput.dispatchEvent(new Event('change'));
        }
      });

      // Экспорт скриншота PNG
      var btnExport = el.querySelector('#btnExportSnapshot');
      if (btnExport) {
        btnExport.onclick = function () {
          var targetCanvas = currentTab === '2d' ? c2d : c3d;
          targetCanvas.toBlob(function (blob) {
            KM.download('kicad-' + activeDemo + '-' + currentTab + '.png', blob, 'image/png');
            KM.ui.toast('Снимок сохранён', 'Изображение платы загружено', '📸');
          });
        };
      }
    },

    unmount: function () {
      if (anim3dId) {
        cancelAnimationFrame(anim3dId);
        anim3dId = null;
      }
    }
  };
})();
