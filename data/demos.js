/* =========================================================
   Видео-демонстрации: анимированные сценарии поверх иллюстраций
   интерфейса KiCad. Плеер (js/views/demos.js) умеет паузу,
   перемотку, главы и скорость 0.5×–2×.
   Шот: { d: длительность (с), scene, opts, title?, caption,
          cur: [[t, x, y, click?], ...]  — путь курсора внутри шота,
          annot?: [...] }
   Реальные видеозаписи: положите mp4 в media/videos и укажите
   поле video: 'media/videos/имя.mp4' — плеер покажет его.
   ========================================================= */
KM.data.demos = [
  {
    id: 'd1', title: 'Первая схема за две минуты', lesson: 'l04', level: 1,
    desc: 'Разместим разъём, резистор и светодиод, соединим проводами, добавим землю и проверим ERC.',
    shots: [
      { d: 4, scene: 'sch', opts: { content: 'empty', tool: 0 }, title: 'Пустой лист', caption: 'Открываем редактор схем нового проекта', cur: [[0, 500, 300], [3.5, 900, 170]] },
      { d: 4, scene: 'sch', opts: { content: 'empty', tool: 2 }, title: 'Инструмент «Символ»', caption: 'Нажимаем A (или кнопку справа) и щёлкаем по листу', cur: [[0, 900, 170], [1, 945, 163, 1], [2.5, 420, 280, 1]] },
      { d: 5, scene: 'symchooser', opts: { query: 'resistor' }, title: 'Выбор символа', caption: 'Ищем «resistor» → Device:R → OK', cur: [[0, 420, 280], [1.2, 300, 126, 1], [2.6, 260, 176, 1], [4.2, 747, 504, 1]] },
      { d: 4, scene: 'sch', opts: { content: 'empty', tool: 2, ghost: [420, 250] }, caption: 'Символ «висит» на курсоре — R поворачивает, щелчок ставит', cur: [[0, 430, 260], [3, 420, 250, 1]] },
      { d: 4, scene: 'sch', opts: { content: 'parts', tool: 0 }, title: 'Все детали', caption: 'Так же добавляем Device:LED и Connector_Generic:Conn_01x02', cur: [[0, 420, 250], [2, 560, 260], [3.5, 200, 250]] },
      { d: 6, scene: 'sch', opts: { content: 'led', tool: 4 }, title: 'Провода', caption: 'W — провод: щелчок на выводе, изломы, щелчок на другом выводе', cur: [[0, 945, 223, 1], [1.2, 225, 240, 1], [2.5, 420, 240, 1], [3.2, 420, 210, 1], [4.4, 420, 290, 1], [5.4, 560, 290, 1]] },
      { d: 5, scene: 'sch', opts: { content: 'led-labels', tool: 3 }, title: 'Земля и метка', caption: 'P → GND; L → метка LED_A — цепи получают имена', cur: [[0, 945, 193, 1], [1.5, 300, 380, 1], [3, 945, 343, 1], [4.2, 640, 200, 1]] },
      { d: 6, scene: 'sch', opts: { content: 'led-labels', dialog: 'erc', ercClean: true }, title: 'ERC', caption: 'Проверка → ERC → «Запустить»: нарушений нет', cur: [[0, 640, 200], [2, 295, 454, 1], [5, 480, 280]] }
    ]
  },
  {
    id: 'd2', title: 'Назначение посадочных мест', lesson: 'l12', level: 1,
    desc: 'Свяжем символы схемы с корпусами: резистор 0805, светодиод 5 мм и штыревой разъём.',
    shots: [
      { d: 4, scene: 'fpassign', opts: { lib: 'Resistor_SMD', sel: 2, fpSel: -1, rows: [['1', 'D1 -', 'LED', ''], ['2', 'J1 -', 'Conn_01x02', ''], ['3', 'R1 -', '330', '']] }, title: 'Окно назначения', caption: 'Инструменты → Назначить посадочные места', cur: [[0, 480, 300], [3, 420, 176, 1]] },
      { d: 5, scene: 'fpassign', opts: { lib: 'Resistor_SMD', sel: 2, fpSel: 2, rows: [['1', 'D1 -', 'LED', ''], ['2', 'J1 -', 'Conn_01x02', ''], ['3', 'R1 -', '330', '']] }, title: 'Резистор', caption: 'Библиотека Resistor_SMD → двойной щелчок по R_0805_2012Metric', cur: [[0, 420, 176], [1.2, 115, 246, 1], [3, 740, 176, 1], [3.3, 740, 176, 1]] },
      { d: 5, scene: 'fpassign', opts: { lib: 'LED_THT', sel: 0, fpSel: 0, fps: ['LED_D3.0mm', 'LED_D5.0mm', 'LED_D5.0mm_Horizontal', 'LED_Rectangular_W5.0mm_H2.0mm'], rows: [['1', 'D1 -', 'LED', ''], ['2', 'J1 -', 'Conn_01x02', ''], ['3', 'R1 -', '330', 'Resistor_SMD:R_0805_2012Metric']] }, title: 'Светодиод', caption: 'LED_THT → LED_D5.0mm (обычный светодиод 5 мм)', cur: [[0, 740, 176], [1.2, 420, 124, 1], [2.2, 115, 222, 1], [3.8, 740, 152, 1]] },
      { d: 5, scene: 'fpassign', opts: { lib: 'Connector_PinHeader_2.54mm', sel: 1, fpSel: 0, fps: ['PinHeader_1x02_P2.54mm_Vertical', 'PinHeader_1x02_P2.54mm_Horizontal', 'PinHeader_2x01_P2.54mm_Vertical'], rows: [['1', 'D1 -', 'LED', 'LED_THT:LED_D5.0mm'], ['2', 'J1 -', 'Conn_01x02', ''], ['3', 'R1 -', '330', 'Resistor_SMD:R_0805_2012Metric']] }, title: 'Разъём', caption: 'Штыревой разъём 1×2 с шагом 2,54 мм', cur: [[0, 740, 152], [1, 420, 150, 1], [2.4, 115, 174, 1], [3.8, 740, 128, 1]] },
      { d: 4, scene: 'fpassign', opts: { lib: 'Connector_PinHeader_2.54mm', sel: -1, fpSel: -1, fps: [], rows: [['1', 'D1 -', 'LED', 'LED_THT:LED_D5.0mm'], ['2', 'J1 -', 'Conn_01x02', 'Connector_PinHeader_2.54mm:PinHeader_1x02...'], ['3', 'R1 -', '330', 'Resistor_SMD:R_0805_2012Metric']] }, title: 'Готово', caption: 'Все символы связаны с корпусами → «Применить, сохранить»', cur: [[0, 740, 128], [2.5, 760, 559, 1]] }
    ]
  },
  {
    id: 'd3', title: 'Переносим схему на плату', lesson: 'l21', level: 1,
    desc: 'F8 — обновить плату из схемы, затем контур и расстановка компонентов.',
    shots: [
      { d: 4, scene: 'pcb', opts: { state: 'empty' }, title: 'Пустая плата', caption: 'Открываем редактор плат и нажимаем F8', cur: [[0, 400, 300], [3, 400, 300, 1]] },
      { d: 5, scene: 'pcb', opts: { state: 'unplaced' }, title: 'Компоненты', caption: 'Посадочные места и линии связей появились у курсора', cur: [[0, 690, 480], [4, 690, 480, 1]] },
      { d: 5, scene: 'pcb', opts: { state: 'outline', layer: 'Edge.Cuts' }, title: 'Контур', caption: 'Слой Edge.Cuts → прямоугольник 50×30 мм', annot: [{ x: 600, y: 420, label: 'Edge.Cuts', lx: 12 }], cur: [[0, 830, 270, 1], [1.5, 200, 170, 1], [3.5, 600, 420, 1]] },
      { d: 6, scene: 'pcb', opts: { state: 'ratsnest' }, title: 'Расстановка', caption: 'M — переместить, R — повернуть; линии связей короткие и не пересекаются', cur: [[0, 700, 480], [1, 690, 480, 1], [2.2, 270, 280, 1], [3.3, 400, 250, 1], [4.6, 510, 300, 1]] }
    ]
  },
  {
    id: 'd4', title: 'Трассировка дорожек', lesson: 'l25', level: 2,
    desc: 'Интерактивный трассировщик: X, переход на другой слой по V, завершение трассы.',
    shots: [
      { d: 4, scene: 'pcb', opts: { state: 'ratsnest', tool: 3 }, title: 'Инструмент X', caption: 'X — трассировка одиночной дорожки', cur: [[0, 600, 450], [2.5, 798, 181, 1]] },
      { d: 6, scene: 'pcb', opts: { state: 'routing', tool: 3 }, title: 'Первые дорожки', caption: 'Щелчок по площадке → ведём → щелчок по цели', cur: [[0, 270, 280, 1], [1.5, 330, 280, 1], [2.5, 385, 250, 1], [3.6, 415, 250, 1], [5, 497, 300, 1]] },
      { d: 6, scene: 'pcb', opts: { state: 'routed', tool: 3, layer: 'B.Cu' }, title: 'Смена слоя', caption: 'Земля — по нижнему слою: V ставит переходное и меняет слой', cur: [[0, 270, 308, 1], [1.5, 300, 370, 1], [3, 500, 370, 1], [4.2, 523, 347], [5, 523, 300, 1]] }
    ]
  },
  {
    id: 'd5', title: 'Земляной полигон и DRC', lesson: 'l27', level: 2,
    desc: 'Зона GND на нижнем слое, заливка клавишей B и финальная проверка DRC.',
    shots: [
      { d: 5, scene: 'pcb', opts: { state: 'routed', tool: 6, layer: 'B.Cu' }, title: 'Зона', caption: 'Инструмент «Зона»: слой B.Cu, цепь GND, обводим плату', cur: [[0, 798, 271, 1], [1.4, 195, 165, 1], [2.4, 605, 165, 1], [3.2, 605, 425, 1], [4.2, 195, 425, 1]] },
      { d: 4, scene: 'pcb', opts: { state: 'zone', layer: 'B.Cu' }, title: 'Заливка', caption: 'B — залить все зоны', cur: [[0, 400, 400], [3, 400, 400]] },
      { d: 5, scene: 'pcb', opts: { state: 'zone', dialog: 'drc', drcMarker: true }, title: 'DRC', caption: 'Проверка → DRC: нашлось нарушение зазора', cur: [[0, 400, 400], [1.5, 270, 454, 1], [3.5, 480, 232, 1]] },
      { d: 5, scene: 'pcb', opts: { state: 'zone', dialog: 'drc', drcClean: true }, title: 'Исправлено', caption: 'Сдвигаем дорожку, снова DRC — нарушений нет', cur: [[0, 480, 232], [2, 270, 454, 1], [4.5, 480, 300]] }
    ]
  },
  {
    id: 'd6', title: 'Выпуск Gerber и проверка', lesson: 'l35', level: 2,
    desc: 'Выводим слои, создаём сверловку и смотрим результат в GerbView.',
    shots: [
      { d: 5, scene: 'pcb', opts: { state: 'zone', dialog: 'plot' }, title: 'Окно вывода', caption: 'Файл → Выходные данные для производства → Gerber', cur: [[0, 480, 300], [2, 160, 228], [4, 160, 404]] },
      { d: 4, scene: 'pcb', opts: { state: 'zone', dialog: 'plot' }, title: 'Вывод', caption: '«Вывести», затем «Создать файлы сверловки…»', cur: [[0, 160, 404], [1.2, 195, 514, 1], [3, 350, 514, 1]] },
      { d: 6, scene: 'gerbview', title: 'GerbView', caption: 'Открываем папку gerbers/ в просмотрщике и проверяем слои', cur: [[0, 500, 300], [2, 810, 130, 1], [3.5, 810, 250, 1], [5, 400, 290]] }
    ]
  },
  {
    id: 'd7', title: 'Рисуем свой символ', lesson: 'l16', level: 3,
    desc: 'Новая библиотека проекта, символ LM75A, выводы с правильными электрическими типами.',
    shots: [
      { d: 5, scene: 'symedit', opts: { tool: 0 }, title: 'Редактор символов', caption: 'Библиотека my_symbols → новый символ LM75A', cur: [[0, 400, 300], [2, 100, 150, 1], [4, 580, 280]] },
      { d: 6, scene: 'symedit', opts: { tool: 1, dialog: 'pin' }, title: 'Выводы', caption: 'P — вывод: имя, номер из даташита, электрический тип', cur: [[0, 945, 133, 1], [1.5, 520, 197, 1], [3, 520, 233, 1], [4.2, 520, 269, 1], [5.4, 655, 414, 1]] },
      { d: 4, scene: 'symedit', opts: { tool: 0 }, title: 'Готово', caption: 'Проверка → Проверить символ → сохраняем', cur: [[0, 655, 414], [3, 580, 280]] }
    ]
  },
  {
    id: 'd8', title: 'Посадочное место и 3D', lesson: 'l30', level: 3,
    desc: 'Посадочное место SOT-23 для ручной пайки и проверка готовой платы в 3D.',
    shots: [
      { d: 5, scene: 'fpedit', opts: { tool: 1 }, title: 'Площадки', caption: 'Площадки по рекомендуемой разводке из даташита', cur: [[0, 945, 133, 1], [1.5, 498, 358, 1], [3, 638, 358, 1], [4.2, 568, 218, 1]] },
      { d: 4, scene: 'fpedit', opts: { tool: 6 }, title: 'Courtyard', caption: 'Контур корпуса, шелкография и Courtyard', cur: [[0, 945, 283, 1], [1.2, 450, 170, 1], [3, 686, 406, 1]] },
      { d: 6, scene: 'v3d', title: '3D', caption: 'Alt+3 — плата в 3D: проверяем ориентацию и высоту компонентов', cur: [[0, 500, 360], [2, 560, 330], [4, 460, 380]] }
    ]
  }
];
KM.data.demos.forEach(function (d) { d.duration = d.shots.reduce(function (s, x) { return s + x.d; }, 0); });
