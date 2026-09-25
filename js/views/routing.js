/* =========================================================
   Модуль трассировки и интерактивный симулятор печатных плат
   (PCB Routing Game & Real-time DRC).
   Тренажёр ручной разводки плат в стиле KiCad: 45° углы,
   переключение слоёв (F.Cu / B.Cu), переходные отверстия (Vias),
   проверка правил проектирования (DRC) и система уровней.
   ========================================================= */
(function () {
  'use strict';

  var currentLevelId = 'l1';
  var activeLayer = 'fcu'; // 'fcu' (Top, Red) или 'bcu' (Bottom, Blue)
  var trackWidth = 0.5; // 0.25, 0.5, 1.0 мм
  var gridStep = 1.0; // 0.5 или 1.0 мм
  var scale = 8; // пикселей на мм
  var panX = 0, panY = 0;

  // Текущее состояние трассировки
  var routingActive = false;
  var currentNet = null;
  var currentTrack = []; // [{x, y, layer, w}]
  var tracks = []; // массив завершённых дорожек [{net, layer, w, pts: [{x,y}]}]
  var vias = []; // массив переходных отверстий [{x, y, net, d, drill}]
  var drcErrors = []; // ошибки DRC [{type, x, y, msg, severity}]

  /* =========================================================
     Уровни тренажёра
     ========================================================= */
  var LEVELS = [
    {
      id: 'l1',
      title: 'Уровень 1: Светодиодный маяк',
      desc: 'Базовая 1-слойная плата. Соедините источник питания, токоограничивающий резистор и светодиод. Избегайте прямых углов 90°!',
      boardW: 40,
      boardH: 30,
      xp: 80,
      components: [
        { id: 'J1', name: 'Батарея 3.3V', x: 6, y: 15, rot: 90, pads: [{ id: '1', net: 'VCC', x: 6, y: 12.5 }, { id: '2', net: 'GND', x: 6, y: 17.5 }] },
        { id: 'R1', name: 'Резистор 220 Ом', x: 20, y: 8, rot: 0, pads: [{ id: '1', net: 'VCC', x: 17.5, y: 8 }, { id: '2', net: 'LED_A', x: 22.5, y: 8 }] },
        { id: 'D1', name: 'Светодиод 0805', x: 32, y: 15, rot: 90, pads: [{ id: 'A', net: 'LED_A', x: 32, y: 12.5 }, { id: 'K', net: 'GND', x: 32, y: 17.5 }] }
      ],
      rules: { allowBcu: false, minClearance: 0.4, no90Deg: true }
    },
    {
      id: 'l2',
      title: 'Уровень 2: Делитель и фильтр',
      desc: 'Разводка схемы обхода препятствий. Соедините резистивный делитель напряжения и блокировочный конденсатор, обходя выводы без коротких замыканий.',
      boardW: 46,
      boardH: 32,
      xp: 120,
      components: [
        { id: 'IN', name: 'Входной разъём', x: 6, y: 16, rot: 90, pads: [{ id: '1', net: 'VIN', x: 6, y: 13.5 }, { id: '2', net: 'GND', x: 6, y: 18.5 }] },
        { id: 'R1', name: 'Резистор R1 10к', x: 18, y: 10, rot: 0, pads: [{ id: '1', net: 'VIN', x: 15.5, y: 10 }, { id: '2', net: 'MID', x: 20.5, y: 10 }] },
        { id: 'R2', name: 'Резистор R2 10к', x: 28, y: 22, rot: 0, pads: [{ id: '1', net: 'MID', x: 25.5, y: 22 }, { id: '2', net: 'GND', x: 30.5, y: 22 }] },
        { id: 'C1', name: 'Конденсатор 100нФ', x: 28, y: 10, rot: 90, pads: [{ id: '1', net: 'MID', x: 28, y: 7.5 }, { id: '2', net: 'GND', x: 28, y: 12.5 }] },
        { id: 'OUT', name: 'Выходной разъём', x: 40, y: 16, rot: 90, pads: [{ id: '1', net: 'MID', x: 40, y: 13.5 }, { id: '2', net: 'GND', x: 40, y: 18.5 }] }
      ],
      rules: { allowBcu: true, minClearance: 0.35, no90Deg: true }
    },
    {
      id: 'l3',
      title: 'Уровень 3: Мультивибратор NE555',
      desc: 'Многовыводная микросхема SOIC-8. Разведите времязадающие цепи, соединив выводы TRIG (2) и THRESH (6), а также шины питания VCC и GND.',
      boardW: 52,
      boardH: 36,
      xp: 160,
      components: [
        {
          id: 'U1', name: 'NE555 (SOIC-8)', x: 26, y: 18, rot: 0,
          pads: [
            { id: '1', net: 'GND', x: 23.5, y: 14.2 },
            { id: '2', net: 'TRIG', x: 23.5, y: 15.5 },
            { id: '3', net: 'OUT', x: 23.5, y: 16.8 },
            { id: '4', net: 'VCC', x: 23.5, y: 18.1 },
            { id: '5', net: 'CTRL', x: 28.5, y: 18.1 },
            { id: '6', net: 'TRIG', x: 28.5, y: 16.8 },
            { id: '7', net: 'DISCH', x: 28.5, y: 15.5 },
            { id: '8', net: 'VCC', x: 28.5, y: 14.2 }
          ]
        },
        { id: 'R1', name: 'Резистор R1', x: 14, y: 10, rot: 0, pads: [{ id: '1', net: 'VCC', x: 11.5, y: 10 }, { id: '2', net: 'DISCH', x: 16.5, y: 10 }] },
        { id: 'R2', name: 'Резистор R2', x: 38, y: 10, rot: 0, pads: [{ id: '1', net: 'DISCH', x: 35.5, y: 10 }, { id: '2', net: 'TRIG', x: 40.5, y: 10 }] },
        { id: 'C1', name: 'Конденсатор C1', x: 38, y: 26, rot: 90, pads: [{ id: '1', net: 'TRIG', x: 38, y: 23.5 }, { id: '2', net: 'GND', x: 38, y: 28.5 }] },
        { id: 'PWR', name: 'Питание', x: 6, y: 18, rot: 90, pads: [{ id: '1', net: 'VCC', x: 6, y: 15.5 }, { id: '2', net: 'GND', x: 6, y: 20.5 }] }
      ],
      rules: { allowBcu: true, minClearance: 0.3, no90Deg: true }
    },
    {
      id: 'l4',
      title: 'Уровень 4: Двухслойная трассировка с Vias',
      desc: 'Топологический вызов: дорожки физически пересекаются! Переключайтесь на нижний слой B.Cu нажатием клавиши «V» для установки переходных отверстий.',
      boardW: 48,
      boardH: 34,
      xp: 200,
      components: [
        { id: 'J_L', name: 'Вход сигналов', x: 6, y: 17, rot: 90, pads: [{ id: '1', net: 'SIG_A', x: 6, y: 11 }, { id: '2', net: 'SIG_B', x: 6, y: 17 }, { id: '3', net: 'SIG_C', x: 6, y: 23 }] },
        { id: 'J_R', name: 'Выход сигналов', x: 42, y: 17, rot: 90, pads: [{ id: '1', net: 'SIG_C', x: 42, y: 11 }, { id: '2', net: 'SIG_B', x: 42, y: 17 }, { id: '3', net: 'SIG_A', x: 42, y: 23 }] }
      ],
      rules: { allowBcu: true, requireVias: true, minClearance: 0.35, no90Deg: true }
    },
    {
      id: 'l5',
      title: 'Уровень 5: Силовой узел DFM (Ширина проводников)',
      desc: 'Разведите плату импульсного стабилизатора с соблюдением плотности тока: силовые шины VIN, SW, VOUT должны быть шириной не менее 1.0 мм!',
      boardW: 50,
      boardH: 36,
      xp: 250,
      components: [
        { id: 'J_IN', name: 'Вход 12V', x: 6, y: 18, rot: 90, pads: [{ id: '1', net: 'VIN', x: 6, y: 15 }, { id: '2', net: 'GND', x: 6, y: 21 }] },
        { id: 'U1', name: 'Драйвер SW', x: 22, y: 18, rot: 0, pads: [{ id: '1', net: 'VIN', x: 19.5, y: 16 }, { id: '2', net: 'SW', x: 24.5, y: 16 }, { id: '3', net: 'FB', x: 19.5, y: 20 }, { id: '4', net: 'GND', x: 24.5, y: 20 }] },
        { id: 'L1', name: 'Катушка L1', x: 33, y: 18, rot: 0, pads: [{ id: '1', net: 'SW', x: 30, y: 18 }, { id: '2', net: 'VOUT', x: 36, y: 18 }] },
        { id: 'J_OUT', name: 'Выход 5V', x: 44, y: 18, rot: 90, pads: [{ id: '1', net: 'VOUT', x: 44, y: 15 }, { id: '2', net: 'GND', x: 44, y: 21 }] }
      ],
      rules: { allowBcu: true, minPowerWidth: 1.0, powerNets: ['VIN', 'SW', 'VOUT', 'GND'], minClearance: 0.4, no90Deg: true }
    }
  ];

  function getLevel() {
    return LEVELS.find(function (l) { return l.id === currentLevelId; }) || LEVELS[0];
  }

  /* =========================================================
     Вспомогательные геометрические функции
     ========================================================= */
  function snapToGrid(val, step) {
    return Math.round(val / step) * step;
  }

  // Приведение отрезка к углам 45° / 90° (KiCad-стиль)
  function snap45(x0, y0, x1, y1) {
    var dx = x1 - x0, dy = y1 - y0;
    var absDx = Math.abs(dx), absDy = Math.abs(dy);
    var signX = dx >= 0 ? 1 : -1;
    var signY = dy >= 0 ? 1 : -1;

    if (absDx > absDy * 2) return { x: x1, y: y0 }; // чисто горизонтальная
    if (absDy > absDx * 2) return { x: x0, y: y1 }; // чисто вертикальная
    // диагональ 45°
    var d = Math.min(absDx, absDy);
    return { x: x0 + d * signX, y: y0 + d * signY };
  }

  function dist(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  function distToSegment(px, py, x1, y1, x2, y2) {
    var l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return dist(px, py, x1, y1);
    var t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2));
    var projX = x1 + t * (x2 - x1);
    var projY = y1 + t * (y2 - y1);
    return dist(px, py, projX, projY);
  }

  // Пересечение двух отрезков
  function segmentsIntersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y) {
    function ccw(ax, ay, bx, by, cx, cy) {
      return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
    }
    return ccw(a1x, a1y, b1x, b1y, b2x, b2y) !== ccw(a2x, a2y, b1x, b1y, b2x, b2y) &&
           ccw(a1x, a1y, a2x, a2y, b1x, b1y) !== ccw(a1x, a1y, a2x, a2y, b2x, b2y);
  }

  /* =========================================================
     Проверка правил проектирования (DRC)
     ========================================================= */
  function runDRC() {
    drcErrors = [];
    var lvl = getLevel();
    var allPads = [];
    lvl.components.forEach(function (c) {
      c.pads.forEach(function (p) { allPads.push({ ...p, comp: c.id }); });
    });

    // 1. Проверка замыканий (Short Circuits) между разными цепями
    for (var i = 0; i < tracks.length; i++) {
      var t1 = tracks[i];
      for (var j = i + 1; j < tracks.length; j++) {
        var t2 = tracks[j];
        if (t1.net !== t2.net && t1.layer === t2.layer) {
          // Проверяем пересечение каждого сегмента t1 с каждым сегментом t2
          for (var s1 = 0; s1 < t1.pts.length - 1; s1++) {
            for (var s2 = 0; s2 < t2.pts.length - 1; s2++) {
              var p1 = t1.pts[s1], p2 = t1.pts[s1 + 1];
              var q1 = t2.pts[s2], q2 = t2.pts[s2 + 1];
              if (segmentsIntersect(p1.x, p1.y, p2.x, p2.y, q1.x, q1.y, q2.x, q2.y)) {
                drcErrors.push({
                  type: 'short',
                  x: (p1.x + p2.x) / 2,
                  y: (p1.y + p2.y) / 2,
                  msg: 'КЗ: Замыкание цепей «' + t1.net + '» и «' + t2.net + '»!',
                  severity: 'error'
                });
              }
            }
          }
        }
      }

      // Проверка зазора между дорожкой и контактными площадками других цепей
      allPads.forEach(function (pad) {
        if (pad.net !== t1.net) {
          for (var s = 0; s < t1.pts.length - 1; s++) {
            var d = distToSegment(pad.x, pad.y, t1.pts[s].x, t1.pts[s].y, t1.pts[s + 1].x, t1.pts[s + 1].y);
            if (d < (lvl.rules.minClearance || 0.3) + t1.w / 2 + 0.4) {
              drcErrors.push({
                type: 'clearance',
                x: pad.x,
                y: pad.y,
                msg: 'Нарушение зазора (Clearance) до площадки ' + pad.comp + '.' + pad.id,
                severity: 'error'
              });
            }
          }
        }
      });

      // 2. Проверка углов 90° (Острые углы и кислотные карманы / Acid Traps)
      if (lvl.rules.no90Deg) {
        for (var k = 0; k < t1.pts.length - 2; k++) {
          var a = t1.pts[k], b = t1.pts[k + 1], c = t1.pts[k + 2];
          var v1x = a.x - b.x, v1y = a.y - b.y;
          var v2x = c.x - b.x, v2y = c.y - b.y;
          var dot = v1x * v2x + v1y * v2y;
          var l1 = Math.hypot(v1x, v1y), l2 = Math.hypot(v2x, v2y);
          if (l1 > 0 && l2 > 0) {
            var cosAngle = dot / (l1 * l2);
            // Прямой угол 90°: dot ≈ 0 (cos ≈ 0), острый угол <90°: dot > 0
            if (Math.abs(cosAngle) < 0.15 || cosAngle > 0.15) {
              drcErrors.push({
                type: 'angle90',
                x: b.x,
                y: b.y,
                msg: 'Острый или прямой угол (90°)! По правилам DFM используйте сглаживание под 45°',
                severity: 'warn'
              });
            }
          }
        }
      }

      // 3. Проверка ширины силовых проводников (для Level 5)
      if (lvl.rules.minPowerWidth && (lvl.rules.powerNets || []).indexOf(t1.net) >= 0) {
        if (t1.w < lvl.rules.minPowerWidth) {
          drcErrors.push({
            type: 'width',
            x: t1.pts[0].x,
            y: t1.pts[0].y,
            msg: 'Ширина силовой шины «' + t1.net + '» меньше ' + lvl.rules.minPowerWidth + ' мм!',
            severity: 'error'
          });
        }
      }
    }

    return drcErrors;
  }

  // Проверка соединения всех цепей (Ratsnest)
  function getUnconnectedNets() {
    var lvl = getLevel();
    var nets = {};
    lvl.components.forEach(function (c) {
      c.pads.forEach(function (p) {
        nets[p.net] = nets[p.net] || [];
        nets[p.net].push(p);
      });
    });

    var unconnected = [];
    Object.keys(nets).forEach(function (netName) {
      var pads = nets[netName];
      if (pads.length < 2) return;

      // Проверяем связанность через tracks
      var netTracks = tracks.filter(function (t) { return t.net === netName; });

      // Граф связей между контактными площадками цепи
      var connectedCount = 0;
      for (var i = 0; i < pads.length; i++) {
        for (var j = i + 1; j < pads.length; j++) {
          var p1 = pads[i], p2 = pads[j];
          var linked = netTracks.some(function (t) {
            var nearP1 = dist(t.pts[0].x, t.pts[0].y, p1.x, p1.y) < 1.0 || dist(t.pts[t.pts.length - 1].x, t.pts[t.pts.length - 1].y, p1.x, p1.y) < 1.0;
            var nearP2 = dist(t.pts[0].x, t.pts[0].y, p2.x, p2.y) < 1.0 || dist(t.pts[t.pts.length - 1].x, t.pts[t.pts.length - 1].y, p2.x, p2.y) < 1.0;
            return nearP1 && nearP2;
          });
          if (!linked) {
            unconnected.push({ net: netName, p1: p1, p2: p2 });
          } else {
            connectedCount++;
          }
        }
      }
    });

    return unconnected;
  }

  /* =========================================================
     Отрисовка игрового поля на Canvas
     ========================================================= */
  function renderCanvas(canvas) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    var lvl = getLevel();
    var bw = lvl.boardW, bh = lvl.boardH;

    // Центрирование платы
    var ox = (w - bw * scale) / 2 + panX;
    var oy = (h - bh * scale) / 2 + panY;

    // 1. Тёмный фон рабочей зоны платы KiCad
    ctx.fillStyle = '#0b1411';
    ctx.fillRect(0, 0, w, h);

    // 2. Сетка (Grid dots)
    ctx.fillStyle = '#1c2d26';
    var stepPx = gridStep * scale;
    if (stepPx >= 6) {
      for (var gx = ox % stepPx; gx < w; gx += stepPx) {
        for (var gy = oy % stepPx; gy < h; gy += stepPx) {
          ctx.fillRect(gx - 0.5, gy - 0.5, 1.2, 1.2);
        }
      }
    }

    // 3. Контур платы (Edge.Cuts)
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(scale, scale);

    // Подложка платы
    ctx.fillStyle = '#0e241c';
    ctx.fillRect(0, 0, bw, bh);
    ctx.strokeStyle = '#d0d200'; // Edge.Cuts желтый
    ctx.lineWidth = 0.2;
    ctx.strokeRect(0, 0, bw, bh);

    // 4. Тонкие линии связей (Ratsnest / Паутинка)
    var airwires = getUnconnectedNets();
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 0.15;
    ctx.setLineDash([0.4, 0.4]);
    airwires.forEach(function (aw) {
      ctx.beginPath();
      ctx.moveTo(aw.p1.x, aw.p1.y);
      ctx.lineTo(aw.p2.x, aw.p2.y);
      ctx.stroke();
    });
    ctx.restore();

    // 5. Отрисовка дорожек нижнего слоя B.Cu (Синий)
    ctx.save();
    ctx.strokeStyle = '#3878d6';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    tracks.filter(function (t) { return t.layer === 'bcu'; }).forEach(function (t) {
      ctx.lineWidth = t.w;
      ctx.beginPath();
      ctx.moveTo(t.pts[0].x, t.pts[0].y);
      for (var i = 1; i < t.pts.length; i++) ctx.lineTo(t.pts[i].x, t.pts[i].y);
      ctx.stroke();
    });
    ctx.restore();

    // 6. Отрисовка дорожек верхнего слоя F.Cu (Красный)
    ctx.save();
    ctx.strokeStyle = '#d63838';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    tracks.filter(function (t) { return t.layer === 'fcu'; }).forEach(function (t) {
      ctx.lineWidth = t.w;
      ctx.beginPath();
      ctx.moveTo(t.pts[0].x, t.pts[0].y);
      for (var i = 1; i < t.pts.length; i++) ctx.lineTo(t.pts[i].x, t.pts[i].y);
      ctx.stroke();
    });
    ctx.restore();

    // 7. Текущая незавершённая трассировка
    if (routingActive && currentTrack.length > 0) {
      ctx.save();
      ctx.strokeStyle = activeLayer === 'fcu' ? '#ff5050' : '#50a0ff';
      ctx.lineWidth = trackWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(currentTrack[0].x, currentTrack[0].y);
      for (var ct = 1; ct < currentTrack.length; ct++) ctx.lineTo(currentTrack[ct].x, currentTrack[ct].y);
      ctx.stroke();
      ctx.restore();
    }

    // 8. Переходные отверстия (Vias)
    vias.forEach(function (v) {
      // Медный поясок
      ctx.fillStyle = '#b8860b';
      ctx.beginPath();
      ctx.arc(v.x, v.y, (v.d || 0.8) / 2, 0, Math.PI * 2);
      ctx.fill();
      // Отверстие
      ctx.fillStyle = '#0b1411';
      ctx.beginPath();
      ctx.arc(v.x, v.y, (v.drill || 0.4) / 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // 9. Отрисовка компонентов и контактных площадок
    lvl.components.forEach(function (comp) {
      // Шелкография корпуса
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 0.15;
      ctx.font = '1.0px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(comp.id, comp.x, comp.y - 3.0);

      // Контактные площадки
      comp.pads.forEach(function (p) {
        ctx.fillStyle = '#d4a017'; // золото площадки
        ctx.fillRect(p.x - 0.7, p.y - 0.7, 1.4, 1.4);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.1;
        ctx.strokeRect(p.x - 0.7, p.y - 0.7, 1.4, 1.4);

        // Имя цепи площадки
        ctx.font = '0.7px sans-serif';
        ctx.fillStyle = '#111111';
        ctx.textAlign = 'center';
        ctx.fillText(p.net, p.x, p.y + 0.25);
      });
    });

    // 10. Маркеры ошибок DRC
    drcErrors.forEach(function (err) {
      ctx.save();
      ctx.fillStyle = err.severity === 'error' ? '#ff3b30' : '#ff9500';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.15;
      ctx.beginPath();
      ctx.arc(err.x, err.y, 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 1.0px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', err.x, err.y + 0.35);
      ctx.restore();
    });

    ctx.restore();
  }

  /* =========================================================
     Представление KM.views.routing
     ========================================================= */
  KM.views.routing = {
    render: function () {
      var lvl = getLevel();
      var airCount = getUnconnectedNets().length;
      var drcCount = drcErrors.filter(function (e) { return e.severity === 'error'; }).length;
      var isCompleted = airCount === 0 && drcCount === 0;

      return '<div class="page full-page routing-view">' +
        '<div class="routing-topbar">' +
          '<div class="rt-title-block">' +
            '<h1>🕹️ Тренажёр трассировки плат (PCB Routing Game)</h1>' +
            '<p class="muted">Разводите дорожки между компонентами по правилам KiCad: избегайте прямых углов 90°, используйте слои F.Cu / B.Cu и соблюдайте DRC.</p>' +
          '</div>' +
          '<div class="rt-stats">' +
            '<span class="badge ' + (airCount === 0 ? 'badge-ok' : 'badge-warn') + '">Цепей осталось: <b>' + airCount + '</b></span>' +
            '<span class="badge ' + (drcCount === 0 ? 'badge-ok' : 'badge-danger') + '">Ошибок DRC: <b>' + drcCount + '</b></span>' +
            (isCompleted ? '<button type="button" class="btn btn-primary" id="btnNextLevel">🎉 Следующий уровень!</button>' : '') +
          '</div>' +
        '</div>' +

        '<div class="routing-layout">' +
          // Боковая панель
          '<aside class="routing-sidebar">' +
            '<div class="card p-3">' +
              '<h3>🏆 Уровни сложности</h3>' +
              '<div class="level-list">' +
                LEVELS.map(function (l) {
                  var active = l.id === currentLevelId;
                  return '<button type="button" class="level-card-btn ' + (active ? 'active' : '') + '" data-level="' + l.id + '">' +
                    '<b>' + KM.esc(l.title) + '</b>' +
                    '<span class="tiny muted">' + KM.esc(l.desc) + '</span>' +
                    '<span class="badge xp-badge">⚡ +' + l.xp + ' XP</span>' +
                  '</button>';
                }).join('') +
              '</div>' +
            '</div>' +

            '<div class="card p-3 mt-3">' +
              '<h3>🛠️ Инструменты разводки</h3>' +
              '<label class="field-label mt-2">Текущий слой дорожки:</label>' +
              '<div class="segmented-control">' +
                '<button type="button" class="sc-btn ' + (activeLayer === 'fcu' ? 'active' : '') + '" data-layer="fcu" style="color:#ff6b6b;">🟥 F.Cu (Верхний)</button>' +
                '<button type="button" class="sc-btn ' + (activeLayer === 'bcu' ? 'active' : '') + '" data-layer="bcu" style="color:#6ba4ff;" ' + (!lvl.rules.allowBcu ? 'disabled title="Заблокировано на этом уровне"' : '') + '>🟦 B.Cu (Нижний)</button>' +
              '</div>' +

              '<label class="field-label mt-3">Ширина дорожки проводника:</label>' +
              '<div class="segmented-control">' +
                '<button type="button" class="sc-btn ' + (trackWidth === 0.25 ? 'active' : '') + '" data-width="0.25">0.25 мм (Сигнал)</button>' +
                '<button type="button" class="sc-btn ' + (trackWidth === 0.5 ? 'active' : '') + '" data-width="0.5">0.5 мм (Стандарт)</button>' +
                '<button type="button" class="sc-btn ' + (trackWidth === 1.0 ? 'active' : '') + '" data-width="1.0">1.0 мм (Питание)</button>' +
              '</div>' +

              '<div class="row gap-2 mt-4">' +
                '<button type="button" class="btn btn-outline" id="btnPlaceVia" ' + (!lvl.rules.allowBcu ? 'disabled' : '') + ' title="Поставить переходное отверстие (Клавиша V)">🔘 Via (V)</button>' +
                '<button type="button" class="btn btn-outline" id="btnUndoTrack">↩️ Отмена</button>' +
                '<button type="button" class="btn btn-ghost" id="btnClearBoard">🗑️ Очистить</button>' +
              '</div>' +
            '</div>' +

            '<div class="card p-3 mt-3 drc-card">' +
              '<h3>🛡️ Автопроверка DRC</h3>' +
              '<div class="drc-list" id="drcList">' +
                (drcErrors.length === 0 ? '<div class="text-success small">✅ Нет нарушений правил проектирования!</div>' :
                  drcErrors.map(function (e) {
                    return '<div class="drc-msg-item ' + e.severity + '">⚠️ ' + KM.esc(e.msg) + '</div>';
                  }).join('')) +
              '</div>' +
            '</div>' +
          '</aside>' +

          // Интерактивный холст
          '<main class="routing-canvas-wrap">' +
            '<div class="canvas-hints-bar">' +
              '<span>💡 <b>Управление:</b> Клик по площадке — начать дорожку · Клик в поле — зафиксировать угол 45° · Двойной клик / повторный клик по целевой площадке — завершить · <b>Клавиша V</b> — поставить Via и сменить слой</span>' +
            '</div>' +
            '<div class="routing-canvas-box" id="routingCanvasBox">' +
              '<canvas id="routingCanvas" class="routing-canvas"></canvas>' +
            '</div>' +
          '</main>' +
        '</div>' +
      '</div>';
    },

    mount: function (el) {
      var canvas = el.querySelector('#routingCanvas');
      var box = el.querySelector('#routingCanvasBox');

      function resize() {
        if (!box || !canvas) return;
        var rect = box.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        var ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        renderCanvas(canvas);
      }
      window.addEventListener('resize', resize);
      setTimeout(resize, 40);

      // Смена уровня
      el.querySelectorAll('.level-card-btn').forEach(function (btn) {
        btn.onclick = function () {
          currentLevelId = this.dataset.level;
          tracks = [];
          vias = [];
          routingActive = false;
          currentTrack = [];
          drcErrors = [];
          runDRC();
          KM.router.go('/routing');
        };
      });

      // Смена слоя (F.Cu / B.Cu)
      el.querySelectorAll('[data-layer]').forEach(function (btn) {
        btn.onclick = function () {
          if (this.disabled) return;
          activeLayer = this.dataset.layer;
          el.querySelectorAll('[data-layer]').forEach(function (b) { b.classList.toggle('active', b === btn); });
          renderCanvas(canvas);
        };
      });

      // Смена ширины проводника
      el.querySelectorAll('[data-width]').forEach(function (btn) {
        btn.onclick = function () {
          trackWidth = parseFloat(this.dataset.width);
          el.querySelectorAll('[data-width]').forEach(function (b) { b.classList.toggle('active', b === btn); });
        };
      });

      // Кнопка Via
      function dropVia() {
        var lvl = getLevel();
        if (!lvl.rules.allowBcu) {
          KM.ui.toast('Ограничение уровня', 'Этот уровень рассчитан на 1 слой!', '⚠️');
          return;
        }
        if (routingActive && currentTrack.length > 0) {
          var lastPt = currentTrack[currentTrack.length - 1];
          vias.push({ x: lastPt.x, y: lastPt.y, net: currentNet, d: 0.8, drill: 0.4 });
          activeLayer = activeLayer === 'fcu' ? 'bcu' : 'fcu';
          el.querySelectorAll('[data-layer]').forEach(function (b) { b.classList.toggle('active', b.dataset.layer === activeLayer); });
          KM.ui.toast('Переходное отверстие', 'Установлен Via на слой ' + (activeLayer === 'fcu' ? 'F.Cu (Верх)' : 'B.Cu (Низ)'), '🔘');
          renderCanvas(canvas);
        }
      }

      var btnVia = el.querySelector('#btnPlaceVia');
      if (btnVia) btnVia.onclick = dropVia;

      // Горячая клавиша 'V'
      var keyHandler = function (e) {
        if (e.key === 'v' || e.key === 'V' || e.key === 'м' || e.key === 'М') {
          dropVia();
        }
      };
      window.addEventListener('keydown', keyHandler);

      // Кнопка отмены последнего сегмента
      var btnUndo = el.querySelector('#btnUndoTrack');
      if (btnUndo) {
        btnUndo.onclick = function () {
          if (routingActive) {
            currentTrack.pop();
            if (currentTrack.length === 0) routingActive = false;
          } else if (tracks.length > 0) {
            tracks.pop();
          }
          runDRC();
          renderCanvas(canvas);
        };
      }

      // Очистка платы
      var btnClear = el.querySelector('#btnClearBoard');
      if (btnClear) {
        btnClear.onclick = function () {
          tracks = [];
          vias = [];
          routingActive = false;
          currentTrack = [];
          runDRC();
          renderCanvas(canvas);
        };
      }

      // Интерактивное кликание и трассировка
      canvas.addEventListener('mousedown', function (e) {
        var rect = canvas.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        var lvl = getLevel();
        var bw = lvl.boardW, bh = lvl.boardH;
        var ox = (rect.width - bw * scale) / 2 + panX;
        var oy = (rect.height - bh * scale) / 2 + panY;

        var boardX = snapToGrid((mx - ox) / scale, gridStep);
        var boardY = snapToGrid((my - oy) / scale, gridStep);

        // Поиск площадки под курсором
        var hitPad = null;
        lvl.components.forEach(function (c) {
          c.pads.forEach(function (p) {
            if (dist(p.x, p.y, boardX, boardY) <= 1.2) hitPad = p;
          });
        });

        if (!routingActive) {
          // Начало трассировки от площадки
          if (hitPad) {
            routingActive = true;
            currentNet = hitPad.net;
            currentTrack = [{ x: hitPad.x, y: hitPad.y, layer: activeLayer, w: trackWidth }];
            renderCanvas(canvas);
          }
        } else {
          // Добавление точки или завершение дорожки
          var last = currentTrack[currentTrack.length - 1];
          var snapped = snap45(last.x, last.y, boardX, boardY);

          if (hitPad) {
            // Клик по целевой площадке
            if (hitPad.net === currentNet) {
              currentTrack.push({ x: hitPad.x, y: hitPad.y, layer: activeLayer, w: trackWidth });
              tracks.push({ net: currentNet, layer: activeLayer, w: trackWidth, pts: currentTrack.slice() });
              routingActive = false;
              currentTrack = [];
              KM.ui.toast('Цепь соединена!', 'Дорожка цепи «' + currentNet + '» успешно проложена', '✅');

              runDRC();
              checkWinCondition();
            } else {
              KM.ui.toast('Замыкание (КЗ)!', 'Нельзя соединять разные цепи («' + currentNet + '» и «' + hitPad.net + '»)', '❌');
            }
          } else {
            // Обычная точка излома дорожки
            currentTrack.push({ x: snapped.x, y: snapped.y, layer: activeLayer, w: trackWidth });
          }
          runDRC();
          renderCanvas(canvas);
        }
      });

      canvas.addEventListener('mousemove', function (e) {
        if (!routingActive || currentTrack.length === 0) return;
        var rect = canvas.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        var lvl = getLevel();
        var bw = lvl.boardW, bh = lvl.boardH;
        var ox = (rect.width - bw * scale) / 2 + panX;
        var oy = (rect.height - bh * scale) / 2 + panY;

        var boardX = snapToGrid((mx - ox) / scale, gridStep);
        var boardY = snapToGrid((my - oy) / scale, gridStep);
        var last = currentTrack[currentTrack.length - 1];
        var snapped = snap45(last.x, last.y, boardX, boardY);

        renderCanvas(canvas);

        // Отрисовка превью тянущейся дорожки
        var ctx = canvas.getContext('2d');
        ctx.save();
        ctx.translate(ox, oy);
        ctx.scale(scale, scale);
        ctx.strokeStyle = activeLayer === 'fcu' ? 'rgba(255, 80, 80, 0.7)' : 'rgba(80, 160, 255, 0.7)';
        ctx.lineWidth = trackWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(snapped.x, snapped.y);
        ctx.stroke();
        ctx.restore();
      });

      function checkWinCondition() {
        var air = getUnconnectedNets();
        var drc = runDRC().filter(function (e) { return e.severity === 'error'; });
        if (air.length === 0 && drc.length === 0) {
          var lvl = getLevel();
          KM.game.addXP(lvl.xp, 'Тренажёр трассировки: пройден ' + lvl.title);
          KM.ui.modal(
            '🎉 Уровень пройден!',
            '<div class="text-center p-3">' +
              '<div style="font-size: 3rem; margin-bottom: 8px;">⭐⭐⭐</div>' +
              '<h3>Идеальная трассировка!</h3>' +
              '<p>Все цепи платы «' + KM.esc(lvl.title) + '» соединены, коротких замыканий и нарушений DRC нет.</p>' +
              '<div class="badge xp-badge mb-3">Получено +' + lvl.xp + ' XP</div>' +
              '<div class="row gap-2 justify-center mt-3">' +
                '<button type="button" class="btn btn-primary" id="btnModalNext">Перейти к следующему уровню</button>' +
              '</div>' +
            '</div>',
            function (modalEl, d) {
              var btnNext = modalEl.querySelector('#btnModalNext');
              if (btnNext) {
                btnNext.onclick = function () {
                  d.close();
                  var idx = LEVELS.findIndex(function (l) { return l.id === currentLevelId; });
                  if (idx >= 0 && idx < LEVELS.length - 1) {
                    currentLevelId = LEVELS[idx + 1].id;
                    tracks = [];
                    vias = [];
                    routingActive = false;
                    drcErrors = [];
                    KM.router.go('/routing');
                  }
                };
              }
            }
          );
        }
      }

      var btnNext = el.querySelector('#btnNextLevel');
      if (btnNext) btnNext.onclick = checkWinCondition;
    },

    unmount: function () {
      routingActive = false;
      currentTrack = [];
    }
  };
})();
