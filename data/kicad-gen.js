/* Сгенерировано tools/build.py — не редактировать вручную. */
KM.data.templates = [
 {
  "cat": "Светодиоды",
  "level": 1,
  "desc": "Простейшая схема: разъём питания, резистор и светодиод. Отправная точка для любого проекта.",
  "id": "t-led",
  "kind": "template",
  "title": "Светодиодный модуль",
  "name": "led_module",
  "sheetDesc": "Светодиод с токоограничивающим резистором.\nI = (5 В − 2 В) / 330 Ом ≈ 9 мА",
  "dir": "kicad/t-led/",
  "zip": "kicad/t-led.zip",
  "starter": null,
  "svg": "kicad/t-led/preview.svg",
  "pdf": "kicad/t-led/led_module.pdf",
  "bom": "kicad/t-led/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "Conn_01x02",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Питание 5 В: 1 = +5V, 2 = GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "330",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Ограничение тока светодиода",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED red",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Светодиод 5 мм",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "R1.1"
   ],
   "GND": [
    "J1.2",
    "D1.1"
   ],
   "LED_A": [
    "R1.2",
    "D1.2"
   ]
  }
 },
 {
  "cat": "Питание",
  "level": 1,
  "desc": "Линейный стабилизатор 5 В с защитой от переполюсовки и индикатором.",
  "id": "t-7805",
  "kind": "template",
  "title": "Стабилизатор 5 В на L7805",
  "name": "psu_7805",
  "sheetDesc": "Вход 7–20 В, выход 5 В до ~1 А (с радиатором).\nD1 — защита от переполюсовки, D2 — индикатор.",
  "dir": "kicad/t-7805/",
  "zip": "kicad/t-7805.zip",
  "starter": null,
  "svg": "kicad/t-7805/preview.svg",
  "pdf": "kicad/t-7805/psu_7805.pdf",
  "bom": "kicad/t-7805/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "IN 7-20V",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Вход: 1 = +, 2 = GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "D1",
    "value": "1N4007",
    "sym": "D",
    "fp": "Diode_THT:D_DO-41_SOD81_P10.16mm_Horizontal",
    "desc": "Защита от переполюсовки",
    "sym_desc": "Диод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "100u/35V",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D8.0mm_P3.50mm",
    "desc": "Входной фильтр",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C2",
    "value": "330n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Входной конденсатор по даташиту (0,33 мкФ)",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U1",
    "value": "L7805",
    "sym": "L7805",
    "fp": "Package_TO_SOT_THT:TO-220-3_Vertical",
    "desc": "Линейный стабилизатор 5 В",
    "sym_desc": "Стабилизатор 5 В, TO-220",
    "pins": {
     "1": "IN",
     "3": "OUT",
     "2": "GND"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "C3",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Выходной конденсатор по даташиту (0,1 мкФ)",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C4",
    "value": "47u/16V",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D6.3mm_P2.50mm",
    "desc": "Выходной накопительный",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Ток индикатора ≈ 3 мА",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D2",
    "value": "LED green",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Индикатор питания",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J2",
    "value": "OUT 5V",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Выход 5 В",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "VIN_RAW": [
    "J1.1",
    "D1.2"
   ],
   "GND": [
    "J1.2",
    "C1.2",
    "C2.2",
    "U1.2",
    "C3.2",
    "C4.2",
    "D2.1",
    "J2.2"
   ],
   "VIN": [
    "D1.1",
    "C1.1",
    "C2.1",
    "U1.1"
   ],
   "+5V": [
    "U1.3",
    "C3.1",
    "C4.1",
    "R1.1",
    "J2.1"
   ],
   "PWR_LED": [
    "R1.2",
    "D2.2"
   ]
  }
 },
 {
  "cat": "Питание",
  "level": 2,
  "desc": "Регулируемый источник напряжения на LM317 с защитным диодом.",
  "id": "t-lm317",
  "kind": "template",
  "title": "Регулируемый стабилизатор LM317",
  "name": "psu_lm317",
  "sheetDesc": "Uвых = 1,25 × (1 + (R2+RV1)/R1) ≈ 2,4…15 В.\nВход должен быть выше выхода минимум на 3 В.",
  "dir": "kicad/t-lm317/",
  "zip": "kicad/t-lm317.zip",
  "starter": null,
  "svg": "kicad/t-lm317/preview.svg",
  "pdf": "kicad/t-lm317/psu_lm317.pdf",
  "bom": "kicad/t-lm317/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "IN",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Вход до 30 В",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Входной (по даташиту 0,1 мкФ)",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U1",
    "value": "LM317",
    "sym": "LM317",
    "fp": "Package_TO_SOT_THT:TO-220-3_Vertical",
    "desc": "Регулируемый стабилизатор",
    "sym_desc": "Регулируемый стабилизатор LM317, TO-220",
    "pins": {
     "3": "IN",
     "2": "OUT",
     "1": "ADJ"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "240",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Задаёт ток делителя ≈ 5 мА",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "220",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Минимальное сопротивление нижнего плеча",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "RV1",
    "value": "2k5",
    "sym": "R_Potentiometer",
    "fp": "Potentiometer_THT:Potentiometer_Alps_RK09K_Single_Vertical",
    "desc": "Регулировка напряжения",
    "sym_desc": "Потенциометр",
    "pins": {
     "1": "1",
     "2": "2",
     "3": "3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "C2",
    "value": "10u",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D5.0mm_P2.00mm",
    "desc": "Подавление пульсаций на ADJ",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "D1",
    "value": "1N4007",
    "sym": "D",
    "fp": "Diode_THT:D_DO-41_SOD81_P10.16mm_Horizontal",
    "desc": "Защита при КЗ входа (разряд выходной ёмкости)",
    "sym_desc": "Диод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C3",
    "value": "10u",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D5.0mm_P2.00mm",
    "desc": "Выходной (по даташиту ≥1 мкФ)",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J2",
    "value": "OUT",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Выход",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "VIN": [
    "J1.1",
    "C1.1",
    "U1.3",
    "D1.1"
   ],
   "GND": [
    "J1.2",
    "C1.2",
    "RV1.2",
    "RV1.3",
    "C2.2",
    "C3.2",
    "J2.2"
   ],
   "VOUT": [
    "U1.2",
    "R1.1",
    "D1.2",
    "C3.1",
    "J2.1"
   ],
   "ADJ": [
    "U1.1",
    "R1.2",
    "R2.1",
    "C2.1"
   ],
   "ADJ_POT": [
    "R2.2",
    "RV1.1"
   ]
  }
 },
 {
  "cat": "Питание",
  "level": 1,
  "desc": "Получение 3,3 В от 5 В для ESP8266/ESP32, датчиков и SD-карт.",
  "id": "t-ams1117",
  "kind": "template",
  "title": "Питание 3,3 В на AMS1117",
  "name": "psu_3v3",
  "sheetDesc": "Стабилизатор 5 → 3,3 В до ~800 мА (с учётом нагрева).",
  "dir": "kicad/t-ams1117/",
  "zip": "kicad/t-ams1117.zip",
  "starter": null,
  "svg": "kicad/t-ams1117/preview.svg",
  "pdf": "kicad/t-ams1117/psu_3v3.pdf",
  "bom": "kicad/t-ams1117/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "5V IN",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Вход 5 В",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "10u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Входной",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U1",
    "value": "AMS1117-3.3",
    "sym": "AMS1117-3.3",
    "fp": "Package_TO_SOT_SMD:SOT-223-3_TabPin2",
    "desc": "LDO 3,3 В",
    "sym_desc": "LDO 3,3 В, SOT-223",
    "pins": {
     "3": "VI",
     "2": "VO",
     "1": "GND"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "C2",
    "value": "22u",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D5.0mm_P2.00mm",
    "desc": "Выходной (AMS1117 любит ESR 0,1–10 Ом → электролит/тантал)",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C3",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "ВЧ-развязка",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R1",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Индикатор",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED green",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Индикатор 3,3 В",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J2",
    "value": "3V3 OUT",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Выход 3,3 В",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "C1.1",
    "U1.3"
   ],
   "GND": [
    "J1.2",
    "C1.2",
    "U1.1",
    "C2.2",
    "C3.2",
    "D1.1",
    "J2.2"
   ],
   "+3V3": [
    "U1.2",
    "C2.1",
    "C3.1",
    "R1.1",
    "J2.1"
   ],
   "LED_3V3": [
    "R1.2",
    "D1.2"
   ]
  }
 },
 {
  "cat": "Питание",
  "level": 2,
  "desc": "Импульсный понижающий преобразователь 5 В 3 А по типовой схеме.",
  "id": "t-lm2596",
  "kind": "template",
  "title": "Понижающий преобразователь 5 В / 3 А (LM2596-5.0)",
  "name": "buck_lm2596",
  "sheetDesc": "Вход 7–40 В → 5 В. Компоненты по типовой схеме даташита.\nДорожки VIN, SW (OUT), диод и C1 — короткими и широкими!",
  "dir": "kicad/t-lm2596/",
  "zip": "kicad/t-lm2596.zip",
  "starter": null,
  "svg": "kicad/t-lm2596/preview.svg",
  "pdf": "kicad/t-lm2596/buck_lm2596.pdf",
  "bom": "kicad/t-lm2596/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "IN 7-40V",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Вход",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "470u/50V",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D10.0mm_P5.00mm",
    "desc": "Входной low-ESR",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "LM2596S-5.0",
    "sym": "LM2596S-5",
    "fp": "Package_TO_SOT_SMD:TO-263-5_TabPin3",
    "desc": "ON/OFF на GND = включён",
    "sym_desc": "Понижающий преобразователь 5 В 3 А, TO-263-5",
    "pins": {
     "1": "VIN",
     "5": "ON/OFF",
     "2": "OUT",
     "4": "FB",
     "3": "GND"
    },
    "sym_pins": 5,
    "symmetric": false
   },
   {
    "ref": "D1",
    "value": "1N5822",
    "sym": "D_Schottky",
    "fp": "Diode_THT:D_DO-201AD_P15.24mm_Horizontal",
    "desc": "Диод Шоттки 3 А 40 В",
    "sym_desc": "Диод Шоттки",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "L1",
    "value": "33u 3A",
    "sym": "L",
    "fp": "Inductor_THT:L_Radial_D8.7mm_P5.00mm_Fastron_07HCP",
    "desc": "Дроссель с током насыщения ≥ 3,5 А",
    "sym_desc": "Индуктивность",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C2",
    "value": "220u/16V",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D8.0mm_P3.50mm",
    "desc": "Выходной low-ESR",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J2",
    "value": "OUT 5V",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Выход",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "VIN": [
    "J1.1",
    "C1.1",
    "U1.1"
   ],
   "GND": [
    "J1.2",
    "C1.2",
    "U1.5",
    "U1.3",
    "D1.2",
    "C2.2",
    "J2.2"
   ],
   "SW": [
    "U1.2",
    "D1.1",
    "L1.1"
   ],
   "+5V": [
    "U1.4",
    "L1.2",
    "C2.1",
    "J2.1"
   ]
  }
 },
 {
  "cat": "Питание",
  "level": 2,
  "desc": "Повышающий преобразователь: 5 В из Li-ion аккумулятора.",
  "id": "t-mt3608",
  "kind": "template",
  "title": "Повышающий преобразователь 3,7 → 5 В (MT3608)",
  "name": "boost_mt3608",
  "sheetDesc": "Uвых = 0,6 × (1 + R1/R2) = 0,6 × (1 + 73,2k/10k) ≈ 5,0 В.\nВыходной ток до ~0,5–1 А в зависимости от входа.",
  "dir": "kicad/t-mt3608/",
  "zip": "kicad/t-mt3608.zip",
  "starter": null,
  "svg": "kicad/t-mt3608/preview.svg",
  "pdf": "kicad/t-mt3608/boost_mt3608.pdf",
  "bom": "kicad/t-mt3608/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "BAT",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Вход 2–5 В (Li-ion)",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "22u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Входной",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "L1",
    "value": "22u",
    "sym": "L",
    "fp": "Inductor_SMD:L_Sunlord_CD54",
    "desc": "Силовой дроссель",
    "sym_desc": "Индуктивность",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U1",
    "value": "MT3608",
    "sym": "MT3608",
    "fp": "Package_TO_SOT_SMD:SOT-23-6",
    "desc": "EN подключён к входу — всегда включён",
    "sym_desc": "Повышающий преобразователь, SOT-23-6",
    "pins": {
     "5": "IN",
     "4": "EN",
     "1": "SW",
     "3": "FB",
     "6": "NC",
     "2": "GND"
    },
    "sym_pins": 6,
    "symmetric": false
   },
   {
    "ref": "D1",
    "value": "SS34",
    "sym": "D_Schottky",
    "fp": "Diode_SMD:D_SMA",
    "desc": "Шоттки",
    "sym_desc": "Диод Шоттки",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "73k2",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Верхнее плечо делителя",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Нижнее плечо делителя",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C2",
    "value": "22u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Выходной",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "J2",
    "value": "OUT 5V",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Выход",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+BATT": [
    "J1.1",
    "C1.1",
    "L1.1",
    "U1.5",
    "U1.4"
   ],
   "GND": [
    "J1.2",
    "C1.2",
    "U1.2",
    "R2.2",
    "C2.2",
    "J2.2"
   ],
   "SW": [
    "L1.2",
    "U1.1",
    "D1.2"
   ],
   "FB": [
    "U1.3",
    "R1.2",
    "R2.1"
   ],
   "+5V": [
    "D1.1",
    "R1.1",
    "C2.1",
    "J2.1"
   ]
  }
 },
 {
  "cat": "Питание",
  "level": 2,
  "desc": "Зарядное устройство для одного Li-ion аккумулятора с индикацией.",
  "id": "t-tp4056",
  "kind": "template",
  "title": "Зарядка Li-ion на TP4056",
  "name": "charger_tp4056",
  "sheetDesc": "Ток заряда 1 А (R1 = 1,2 кОм). Красный — заряд, зелёный — заряжено.\nЗащиту аккумулятора (DW01A) добавьте отдельно, если её нет в самом аккумуляторе.",
  "dir": "kicad/t-tp4056/",
  "zip": "kicad/t-tp4056.zip",
  "starter": null,
  "svg": "kicad/t-tp4056/preview.svg",
  "pdf": "kicad/t-tp4056/charger_tp4056.pdf",
  "bom": "kicad/t-tp4056/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "5V IN",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Вход 5 В",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "10u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Входной",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U1",
    "value": "TP4056",
    "sym": "TP4056",
    "fp": "Package_SO:SOIC-8-1EP_3.9x4.9mm_P1.27mm_EP2.41x3.3mm",
    "desc": "TEMP на GND — термодатчик не используется",
    "sym_desc": "Зарядное Li-ion 1 А, ESOP-8",
    "pins": {
     "4": "VCC",
     "8": "CE",
     "2": "PROG",
     "1": "TEMP",
     "5": "BAT",
     "7": "~{CHRG}",
     "6": "~{STDBY}",
     "3": "GND",
     "9": "EP"
    },
    "sym_pins": 9,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "1k2",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Задаёт ток 1 А",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Ток индикатора",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED red",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Идёт заряд",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R3",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Ток индикатора",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D2",
    "value": "LED green",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Заряд окончен",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C2",
    "value": "10u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Выходной",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "J2",
    "value": "BATTERY",
    "sym": "Conn_01x02",
    "fp": "Connector_JST:JST_PH_B2B-PH-K_1x02_P2.00mm_Vertical",
    "desc": "Аккумулятор 3,7 В",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "C1.1",
    "U1.4",
    "U1.8",
    "R2.1",
    "R3.1"
   ],
   "GND": [
    "J1.2",
    "C1.2",
    "U1.1",
    "U1.3",
    "U1.9",
    "R1.2",
    "C2.2",
    "J2.2"
   ],
   "PROG": [
    "U1.2",
    "R1.1"
   ],
   "BAT": [
    "U1.5",
    "C2.1",
    "J2.1"
   ],
   "CHRG": [
    "U1.7",
    "D1.1"
   ],
   "STDBY": [
    "U1.6",
    "D2.1"
   ],
   "LED_R": [
    "R2.2",
    "D1.2"
   ],
   "LED_G": [
    "R3.2",
    "D2.2"
   ]
  }
 },
 {
  "cat": "Питание",
  "level": 2,
  "desc": "Правильное подключение USB-C как источника 5 В: CC-резисторы, предохранитель, ESD.",
  "id": "t-usbc",
  "kind": "template",
  "title": "Питание 5 В от USB Type-C",
  "name": "usb_c_power",
  "sheetDesc": "R1/R2 = 5,1 кОм на CC1/CC2 — «я потребитель», иначе кабель C–C не даст питание.\nF1 — защита от КЗ, U1 — ESD-защита.",
  "dir": "kicad/t-usbc/",
  "zip": "kicad/t-usbc.zip",
  "starter": null,
  "svg": "kicad/t-usbc/preview.svg",
  "pdf": "kicad/t-usbc/usb_c_power.pdf",
  "bom": "kicad/t-usbc/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "USB-C",
    "sym": "USB_C_Receptacle_USB2.0",
    "fp": "Connector_USB:USB_C_Receptacle_GCT_USB4105-xx-A_16P_TopMnt_Horizontal",
    "desc": "Гнездо USB-C 16 pin",
    "sym_desc": "Гнездо USB-C (USB 2.0, 16 выводов)",
    "pins": {
     "A4": "VBUS",
     "A9": "VBUS",
     "B4": "VBUS",
     "B9": "VBUS",
     "A5": "CC1",
     "B5": "CC2",
     "A8": "SBU1",
     "B8": "SBU2",
     "A6": "D+",
     "B6": "D+",
     "A7": "D-",
     "B7": "D-",
     "S1": "SHIELD",
     "A1": "GND",
     "A12": "GND",
     "B1": "GND",
     "B12": "GND"
    },
    "sym_pins": 17,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "5k1",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Rd на CC1",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "5k1",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Rd на CC2",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U1",
    "value": "USBLC6-2SC6",
    "sym": "USBLC6-2SC6",
    "fp": "Package_TO_SOT_SMD:SOT-23-6",
    "desc": "ESD-защита линий данных",
    "sym_desc": "ESD-защита USB, SOT-23-6",
    "pins": {
     "1": "IO1",
     "3": "IO2",
     "6": "IO1",
     "4": "IO2",
     "5": "VBUS",
     "2": "GND"
    },
    "sym_pins": 6,
    "symmetric": false
   },
   {
    "ref": "F1",
    "value": "500mA PTC",
    "sym": "Polyfuse",
    "fp": "Fuse:Fuse_1206_3216Metric",
    "desc": "Самовосстанавливающийся предохранитель",
    "sym_desc": "Самовосстанавливающийся предохранитель (PPTC)",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C1",
    "value": "10u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Фильтр",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R3",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Индикатор",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Питание есть",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J2",
    "value": "OUT",
    "sym": "Conn_01x04",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x04_P2.54mm_Vertical",
    "desc": "Выход 5 В и линии USB",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3",
     "4": "Pin_4"
    },
    "sym_pins": 4,
    "symmetric": false
   }
  ],
  "nets": {
   "VBUS": [
    "J1.A4",
    "J1.A9",
    "J1.B4",
    "J1.B9",
    "U1.5",
    "F1.1"
   ],
   "CC1": [
    "J1.A5",
    "R1.1"
   ],
   "CC2": [
    "J1.B5",
    "R2.1"
   ],
   "D+": [
    "J1.A6",
    "J1.B6",
    "U1.1",
    "U1.6",
    "J2.2"
   ],
   "D-": [
    "J1.A7",
    "J1.B7",
    "U1.3",
    "U1.4",
    "J2.3"
   ],
   "GND": [
    "J1.A1",
    "J1.A12",
    "J1.B1",
    "J1.B12",
    "J1.S1",
    "R1.2",
    "R2.2",
    "U1.2",
    "C1.2",
    "D1.1",
    "J2.4"
   ],
   "+5V": [
    "F1.2",
    "C1.1",
    "R3.1",
    "J2.1"
   ],
   "LED_A": [
    "R3.2",
    "D1.2"
   ]
  }
 },
 {
  "cat": "Фильтры",
  "level": 1,
  "desc": "Пассивный фильтр нижних частот первого порядка.",
  "id": "t-rc-lp",
  "kind": "template",
  "title": "RC-фильтр нижних частот",
  "name": "rc_lowpass",
  "sheetDesc": "fср = 1 / (2π·R·C) = 1 / (2π · 1 кОм · 100 нФ) ≈ 1,59 кГц",
  "dir": "kicad/t-rc-lp/",
  "zip": "kicad/t-rc-lp.zip",
  "starter": null,
  "svg": "kicad/t-rc-lp/preview.svg",
  "pdf": "kicad/t-rc-lp/rc_lowpass.pdf",
  "bom": "kicad/t-rc-lp/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "IN",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Вход сигнала",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Последовательное сопротивление",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C1",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Шунтирующий конденсатор",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "J2",
    "value": "OUT",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Выход",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "IN": [
    "J1.1",
    "R1.1"
   ],
   "GND": [
    "J1.2",
    "C1.2",
    "J2.2"
   ],
   "OUT": [
    "R1.2",
    "C1.1",
    "J2.1"
   ]
  }
 },
 {
  "cat": "Фильтры",
  "level": 1,
  "desc": "Пассивный фильтр верхних частот первого порядка.",
  "id": "t-rc-hp",
  "kind": "template",
  "title": "RC-фильтр верхних частот",
  "name": "rc_highpass",
  "sheetDesc": "fср = 1 / (2π·R·C) = 1 / (2π · 10 кОм · 100 нФ) ≈ 159 Гц.\nЗаодно убирает постоянную составляющую.",
  "dir": "kicad/t-rc-hp/",
  "zip": "kicad/t-rc-hp.zip",
  "starter": null,
  "svg": "kicad/t-rc-hp/preview.svg",
  "pdf": "kicad/t-rc-hp/rc_highpass.pdf",
  "bom": "kicad/t-rc-hp/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "IN",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Вход",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Разделительный конденсатор",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R1",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Резистор на землю",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "J2",
    "value": "OUT",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Выход",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "IN": [
    "J1.1",
    "C1.1"
   ],
   "GND": [
    "J1.2",
    "R1.2",
    "J2.2"
   ],
   "OUT": [
    "C1.2",
    "R1.1",
    "J2.1"
   ]
  }
 },
 {
  "cat": "Фильтры",
  "level": 3,
  "desc": "Активный ФНЧ 2-го порядка с однополярным питанием и виртуальной землёй.",
  "id": "t-sallen-key",
  "kind": "template",
  "title": "Активный ФНЧ 2-го порядка (Саллен–Ки) на LM358",
  "name": "sallen_key_lpf",
  "sheetDesc": "Однополярное питание 5–12 В, виртуальная земля VREF = VCC/2.\nf ≈ 1/(2π·R·√(C1·C2)) ≈ 1,07 кГц, Q ≈ 0,74. Второй ОУ — буфер VREF.",
  "dir": "kicad/t-sallen-key/",
  "zip": "kicad/t-sallen-key.zip",
  "starter": null,
  "svg": "kicad/t-sallen-key/preview.svg",
  "pdf": "kicad/t-sallen-key/sallen_key_lpf.pdf",
  "bom": "kicad/t-sallen-key/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "PWR/IN",
    "sym": "Conn_01x03",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x03_P2.54mm_Vertical",
    "desc": "1 = +12V, 2 = вход, 3 = GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "C5",
    "value": "1u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Разделительный",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R5",
    "value": "100k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Смещение входа на VREF",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R1",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "R первого звена",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "R второго звена",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C1",
    "value": "22n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Конденсатор обратной связи",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C2",
    "value": "10n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Конденсатор на опору",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U1",
    "value": "LM358",
    "sym": "LM358",
    "fp": "Package_DIP:DIP-8_W7.62mm",
    "desc": "A — фильтр, B — буфер VREF",
    "sym_desc": "Сдвоенный ОУ LM358 (обе части в одном символе)",
    "pins": {
     "3": "+INA",
     "2": "-INA",
     "5": "+INB",
     "6": "-INB",
     "1": "OUTA",
     "7": "OUTB",
     "8": "V+",
     "4": "V-"
    },
    "sym_pins": 8,
    "symmetric": false
   },
   {
    "ref": "R3",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Делитель VCC/2",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R4",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Делитель VCC/2",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C3",
    "value": "10u",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D5.0mm_P2.00mm",
    "desc": "Фильтр делителя",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C4",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка питания ОУ",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "J2",
    "value": "OUT",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Выход относительно VREF",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+12V": [
    "J1.1",
    "U1.8",
    "R3.1",
    "C4.1"
   ],
   "IN": [
    "J1.2",
    "C5.1"
   ],
   "GND": [
    "J1.3",
    "U1.4",
    "R4.2",
    "C3.2",
    "C4.2"
   ],
   "IN_AC": [
    "C5.2",
    "R5.1",
    "R1.1"
   ],
   "VREF": [
    "R5.2",
    "C2.2",
    "U1.6",
    "U1.7",
    "J2.2"
   ],
   "N1": [
    "R1.2",
    "R2.1",
    "C1.1"
   ],
   "N2": [
    "R2.2",
    "C2.1",
    "U1.3"
   ],
   "OUT": [
    "C1.2",
    "U1.2",
    "U1.1",
    "J2.1"
   ],
   "VDIV": [
    "U1.5",
    "R3.2",
    "R4.1",
    "C3.1"
   ]
  }
 },
 {
  "cat": "Усилители",
  "level": 2,
  "desc": "Усилитель сигнала датчика на ОУ с однополярным питанием.",
  "id": "t-noninv",
  "kind": "template",
  "title": "Неинвертирующий усилитель на LM358",
  "name": "opamp_noninv",
  "sheetDesc": "K = 1 + R2/R1 = 1 + 100k/10k = 11. Для сигналов от датчиков (0…0,3 В → 0…3,3 В).\nВторой ОУ не используется: включён повторителем с входом на GND.",
  "dir": "kicad/t-noninv/",
  "zip": "kicad/t-noninv.zip",
  "starter": null,
  "svg": "kicad/t-noninv/preview.svg",
  "pdf": "kicad/t-noninv/opamp_noninv.pdf",
  "bom": "kicad/t-noninv/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "SENSOR",
    "sym": "Conn_01x03",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x03_P2.54mm_Vertical",
    "desc": "1 = +5V, 2 = вход, 3 = GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "R3",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Фильтр/защита входа",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C2",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Фильтр входа",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U1",
    "value": "LM358",
    "sym": "LM358",
    "fp": "Package_SO:SOIC-8_3.9x4.9mm_P1.27mm",
    "desc": "Однополярное питание",
    "sym_desc": "Сдвоенный ОУ LM358 (обе части в одном символе)",
    "pins": {
     "3": "+INA",
     "2": "-INA",
     "5": "+INB",
     "6": "-INB",
     "1": "OUTA",
     "7": "OUTB",
     "8": "V+",
     "4": "V-"
    },
    "sym_pins": 8,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "R1",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "100k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "R2 обратной связи",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C1",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "J2",
    "value": "OUT",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Выход на АЦП",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "U1.8",
    "C1.1"
   ],
   "IN": [
    "J1.2",
    "R3.1"
   ],
   "GND": [
    "J1.3",
    "C2.2",
    "U1.5",
    "U1.4",
    "R1.2",
    "C1.2",
    "J2.2"
   ],
   "IN_F": [
    "R3.2",
    "C2.1",
    "U1.3"
   ],
   "FB": [
    "U1.2",
    "R1.1",
    "R2.2"
   ],
   "OUT": [
    "U1.1",
    "R2.1",
    "J2.1"
   ],
   "UNUSED_OUT": [
    "U1.6",
    "U1.7"
   ]
  }
 },
 {
  "cat": "Усилители",
  "level": 2,
  "desc": "Усилитель для динамика с регулятором громкости и цепью Зобеля.",
  "id": "t-lm386",
  "kind": "template",
  "title": "Усилитель звука на LM386",
  "name": "amp_lm386",
  "sheetDesc": "Усиление 20 (выводы 1–8 свободны). Питание 5–12 В, динамик 8 Ом.\nRV1 — регулятор громкости (логарифмический).",
  "dir": "kicad/t-lm386/",
  "zip": "kicad/t-lm386.zip",
  "starter": null,
  "svg": "kicad/t-lm386/preview.svg",
  "pdf": "kicad/t-lm386/amp_lm386.pdf",
  "bom": "kicad/t-lm386/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "AUDIO IN",
    "sym": "Conn_01x03",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x03_P2.54mm_Vertical",
    "desc": "Линейный вход (L+R смешиваются резисторами)",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Смешение левого",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Смешение правого",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "RV1",
    "value": "A10k",
    "sym": "R_Potentiometer",
    "fp": "Potentiometer_THT:Potentiometer_Alps_RK09K_Single_Vertical",
    "desc": "Громкость",
    "sym_desc": "Потенциометр",
    "pins": {
     "1": "1",
     "2": "2",
     "3": "3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "LM386",
    "sym": "LM386",
    "fp": "Package_DIP:DIP-8_W7.62mm",
    "desc": "Усилитель",
    "sym_desc": "Аудиоусилитель LM386",
    "pins": {
     "3": "+IN",
     "2": "-IN",
     "1": "GAIN",
     "8": "GAIN",
     "7": "BYPASS",
     "5": "OUT",
     "6": "VS",
     "4": "GND"
    },
    "sym_pins": 8,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "10u",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D5.0mm_P2.00mm",
    "desc": "Bypass (подавление пульсаций)",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C2",
    "value": "47n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Цепь Зобеля",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R3",
    "value": "10",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Цепь Зобеля",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C3",
    "value": "220u/16V",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D8.0mm_P3.50mm",
    "desc": "Разделительный выходной",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C4",
    "value": "100u/16V",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D6.3mm_P2.50mm",
    "desc": "Фильтр питания",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C5",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "J2",
    "value": "SPEAKER",
    "sym": "Conn_01x02",
    "fp": "Connector_JST:JST_XH_B2B-XH-A_1x02_P2.50mm_Vertical",
    "desc": "Динамик 8 Ом",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J3",
    "value": "PWR 9V",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Питание",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "IN_L": [
    "J1.1",
    "R1.1"
   ],
   "IN_R": [
    "J1.2",
    "R2.1"
   ],
   "GND": [
    "J1.3",
    "RV1.3",
    "U1.2",
    "U1.4",
    "C1.2",
    "R3.2",
    "C4.2",
    "C5.2",
    "J2.2",
    "J3.2"
   ],
   "MIX": [
    "R1.2",
    "R2.2",
    "RV1.1"
   ],
   "VOL": [
    "RV1.2",
    "U1.3"
   ],
   "+9V": [
    "U1.6",
    "C4.1",
    "C5.1",
    "J3.1"
   ],
   "AMP_OUT": [
    "U1.5",
    "C2.1",
    "C3.1"
   ],
   "BYP": [
    "U1.7",
    "C1.1"
   ],
   "ZOB": [
    "C2.2",
    "R3.1"
   ],
   "SPK+": [
    "C3.2",
    "J2.1"
   ]
  }
 },
 {
  "cat": "Усилители",
  "level": 2,
  "desc": "Предусилитель электретного микрофона для АЦП микроконтроллера.",
  "id": "t-mic",
  "kind": "template",
  "title": "Микрофонный предусилитель на LM358",
  "name": "mic_preamp",
  "sheetDesc": "Электретный микрофон (смещение R1) → разделительный C2 → неинвертирующий усилитель K = 1 + R5/R4 = 101.\nВыход смещён на VCC/2 — удобно для АЦП микроконтроллера.",
  "dir": "kicad/t-mic/",
  "zip": "kicad/t-mic.zip",
  "starter": null,
  "svg": "kicad/t-mic/preview.svg",
  "pdf": "kicad/t-mic/mic_preamp.pdf",
  "bom": "kicad/t-mic/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "PWR/OUT",
    "sym": "Conn_01x03",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x03_P2.54mm_Vertical",
    "desc": "1 = +5V, 2 = выход, 3 = GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "MK1",
    "value": "Electret",
    "sym": "Microphone",
    "fp": "Sensor_Audio:CUI_CMA-4544PF-W",
    "desc": "Микрофон",
    "sym_desc": "Электретный микрофон",
    "pins": {
     "1": "-",
     "2": "+"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "2k2",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Питание микрофона",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C2",
    "value": "1u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Разделительный",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "100k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Смещение VCC/2",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R3",
    "value": "100k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Смещение VCC/2",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U1",
    "value": "LM358",
    "sym": "LM358",
    "fp": "Package_SO:SOIC-8_3.9x4.9mm_P1.27mm",
    "desc": "Усилитель; вторая половина не используется",
    "sym_desc": "Сдвоенный ОУ LM358 (обе части в одном символе)",
    "pins": {
     "3": "+INA",
     "2": "-INA",
     "5": "+INB",
     "6": "-INB",
     "1": "OUTA",
     "7": "OUTB",
     "8": "V+",
     "4": "V-"
    },
    "sym_pins": 8,
    "symmetric": false
   },
   {
    "ref": "R4",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "R4",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C3",
    "value": "10u",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D5.0mm_P2.00mm",
    "desc": "Усиление только для переменного сигнала",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R5",
    "value": "100k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "R5 обратной связи",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C4",
    "value": "100p",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Ограничение полосы ~16 кГц",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C1",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "R1.1",
    "R2.1",
    "U1.8",
    "C1.1"
   ],
   "AUDIO": [
    "J1.2",
    "U1.1",
    "R5.1",
    "C4.1"
   ],
   "GND": [
    "J1.3",
    "MK1.1",
    "R3.2",
    "U1.5",
    "U1.4",
    "C3.2",
    "C1.2"
   ],
   "MIC": [
    "MK1.2",
    "R1.2",
    "C2.1"
   ],
   "IN": [
    "C2.2",
    "R2.2",
    "R3.1",
    "U1.3"
   ],
   "FB": [
    "U1.2",
    "R4.1",
    "R5.2",
    "C4.2"
   ],
   "UNUSED_OUT": [
    "U1.6",
    "U1.7"
   ],
   "FB_C": [
    "R4.2",
    "C3.1"
   ]
  }
 },
 {
  "cat": "Генераторы",
  "level": 1,
  "desc": "Генератор прямоугольных импульсов 1 Гц на NE555.",
  "id": "t-555-astable",
  "kind": "template",
  "title": "Мигалка на NE555",
  "name": "ne555_astable",
  "sheetDesc": "f = 1,44 / ((R1 + 2·R2)·C1) = 1,44 / (146 кОм · 10 мкФ) ≈ 1 Гц",
  "dir": "kicad/t-555-astable/",
  "zip": "kicad/t-555-astable.zip",
  "starter": null,
  "svg": "kicad/t-555-astable/preview.svg",
  "pdf": "kicad/t-555-astable/ne555_astable.pdf",
  "bom": "kicad/t-555-astable/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "5-12V",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Питание",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "NE555",
    "sym": "NE555",
    "fp": "Package_DIP:DIP-8_W7.62mm",
    "desc": "Таймер в автоколебательном режиме",
    "sym_desc": "Таймер NE555, DIP-8",
    "pins": {
     "2": "TR",
     "6": "THR",
     "4": "R",
     "5": "CV",
     "3": "Q",
     "7": "DIS",
     "8": "VCC",
     "1": "GND"
    },
    "sym_pins": 8,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal",
    "desc": "R1",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "68k",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal",
    "desc": "R2",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C1",
    "value": "10u",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D5.0mm_P2.00mm",
    "desc": "Времязадающий",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C2",
    "value": "10n",
    "sym": "C",
    "fp": "Capacitor_THT:C_Disc_D5.0mm_W2.5mm_P5.00mm",
    "desc": "Фильтр вывода CV",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C3",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_THT:C_Disc_D5.0mm_W2.5mm_P5.00mm",
    "desc": "Развязка питания",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R3",
    "value": "330",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal",
    "desc": "Ток светодиода",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Мигающий светодиод",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "U1.8",
    "U1.4",
    "R1.1",
    "C3.1"
   ],
   "GND": [
    "J1.2",
    "U1.1",
    "C1.2",
    "C2.2",
    "C3.2",
    "D1.1"
   ],
   "DIS": [
    "U1.7",
    "R1.2",
    "R2.1"
   ],
   "TH": [
    "U1.6",
    "U1.2",
    "R2.2",
    "C1.1"
   ],
   "OUT": [
    "U1.3",
    "R3.1"
   ],
   "CV": [
    "U1.5",
    "C2.1"
   ],
   "LED_A": [
    "R3.2",
    "D1.2"
   ]
  }
 },
 {
  "cat": "Генераторы",
  "level": 2,
  "desc": "Таймер-одновибратор на NE555: импульс заданной длительности по кнопке.",
  "id": "t-555-mono",
  "kind": "template",
  "title": "Одновибратор на NE555 (таймер по кнопке)",
  "name": "ne555_monostable",
  "sheetDesc": "t = 1,1·R1·C1 = 1,1 · 100 кОм · 47 мкФ ≈ 5,2 с.\nКнопка запускает импульс, зуммер/нагрузка работает t секунд.",
  "dir": "kicad/t-555-mono/",
  "zip": "kicad/t-555-mono.zip",
  "starter": null,
  "svg": "kicad/t-555-mono/preview.svg",
  "pdf": "kicad/t-555-mono/ne555_monostable.pdf",
  "bom": "kicad/t-555-mono/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "5V",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Питание",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "NE555",
    "sym": "NE555",
    "fp": "Package_DIP:DIP-8_W7.62mm",
    "desc": "Ждущий режим",
    "sym_desc": "Таймер NE555, DIP-8",
    "pins": {
     "2": "TR",
     "6": "THR",
     "4": "R",
     "5": "CV",
     "3": "Q",
     "7": "DIS",
     "8": "VCC",
     "1": "GND"
    },
    "sym_pins": 8,
    "symmetric": false
   },
   {
    "ref": "R2",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal",
    "desc": "Подтяжка входа запуска",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "SW1",
    "value": "START",
    "sym": "SW_Push",
    "fp": "Button_Switch_THT:SW_PUSH_6mm",
    "desc": "Запуск",
    "sym_desc": "Кнопка без фиксации",
    "pins": {
     "1": "1",
     "2": "2"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R1",
    "value": "100k",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal",
    "desc": "Времязадающий",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C1",
    "value": "47u",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D5.0mm_P2.00mm",
    "desc": "Времязадающий",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C2",
    "value": "10n",
    "sym": "C",
    "fp": "Capacitor_THT:C_Disc_D5.0mm_W2.5mm_P5.00mm",
    "desc": "Фильтр CV",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C3",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_THT:C_Disc_D5.0mm_W2.5mm_P5.00mm",
    "desc": "Развязка",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "BZ1",
    "value": "Buzzer active",
    "sym": "Buzzer",
    "fp": "Buzzer_Beeper:Buzzer_12x9.5RM7.6",
    "desc": "Активный зуммер до 100 мА",
    "sym_desc": "Зуммер",
    "pins": {
     "1": "-",
     "2": "+"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "U1.8",
    "U1.4",
    "R2.1",
    "R1.1",
    "C3.1"
   ],
   "GND": [
    "J1.2",
    "U1.1",
    "SW1.2",
    "C1.2",
    "C2.2",
    "C3.2",
    "BZ1.1"
   ],
   "TRIG": [
    "U1.2",
    "R2.2",
    "SW1.1"
   ],
   "TH": [
    "U1.6",
    "U1.7",
    "R1.2",
    "C1.1"
   ],
   "OUT": [
    "U1.3",
    "BZ1.2"
   ],
   "CV": [
    "U1.5",
    "C2.1"
   ]
  }
 },
 {
  "cat": "Генераторы",
  "level": 2,
  "desc": "Тактовый RC-генератор на триггере Шмитта.",
  "id": "t-hc14-osc",
  "kind": "template",
  "title": "RC-генератор на 74HC14",
  "name": "hc14_oscillator",
  "sheetDesc": "Генератор на инверторе с триггером Шмитта: f ≈ 1 / (0,8·R·C) ≈ 1,2 кГц (зависит от питания и порогов).\nОстальные входы заземлены — у КМОП нельзя оставлять входы свободными.",
  "dir": "kicad/t-hc14-osc/",
  "zip": "kicad/t-hc14-osc.zip",
  "starter": null,
  "svg": "kicad/t-hc14-osc/preview.svg",
  "pdf": "kicad/t-hc14-osc/hc14_oscillator.pdf",
  "bom": "kicad/t-hc14-osc/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "PWR/OUT",
    "sym": "Conn_01x03",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x03_P2.54mm_Vertical",
    "desc": "1 = +5V, 2 = выход, 3 = GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "74HC14",
    "sym": "74HC14",
    "fp": "Package_DIP:DIP-14_W7.62mm",
    "desc": "Инвертор 1 — генератор, 2 — буфер",
    "sym_desc": "6 инверторов Шмитта, DIP-14",
    "pins": {
     "1": "1A",
     "3": "2A",
     "5": "3A",
     "9": "4A",
     "11": "5A",
     "13": "6A",
     "2": "1Y",
     "4": "2Y",
     "6": "3Y",
     "8": "4Y",
     "10": "5Y",
     "12": "6Y",
     "14": "VCC",
     "7": "GND"
    },
    "sym_pins": 14,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "100k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Обратная связь",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C1",
    "value": "10n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Времязадающий",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C2",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "U1.14",
    "C2.1"
   ],
   "CLK_OUT": [
    "J1.2",
    "U1.4"
   ],
   "GND": [
    "J1.3",
    "U1.5",
    "U1.9",
    "U1.11",
    "U1.13",
    "U1.7",
    "C1.2",
    "C2.2"
   ],
   "OSC": [
    "U1.1",
    "R1.2",
    "C1.1"
   ],
   "OSC_FB": [
    "U1.2",
    "U1.3",
    "R1.1"
   ]
  }
 },
 {
  "cat": "Ключи и драйверы",
  "level": 1,
  "desc": "Управление реле от Arduino/ESP через транзистор с защитным диодом.",
  "id": "t-relay",
  "kind": "template",
  "title": "Управление реле от микроконтроллера",
  "name": "relay_driver",
  "sheetDesc": "Логический вход 3,3/5 В → NPN BC547 → катушка реле 5 В (~70 мА).\nD1 гасит ЭДС самоиндукции катушки — без него транзистор выйдет из строя.",
  "dir": "kicad/t-relay/",
  "zip": "kicad/t-relay.zip",
  "starter": null,
  "svg": "kicad/t-relay/preview.svg",
  "pdf": "kicad/t-relay/relay_driver.pdf",
  "bom": "kicad/t-relay/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "CTRL",
    "sym": "Conn_01x03",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x03_P2.54mm_Vertical",
    "desc": "1 = +5V, 2 = сигнал, 3 = GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Ток базы ≈ 3–4 мА",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Закрывает транзистор при отключённом входе",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "Q1",
    "value": "BC547",
    "sym": "Q_NPN_CBE",
    "fp": "Package_TO_SOT_THT:TO-92_Inline",
    "desc": "Ключ",
    "sym_desc": "NPN-транзистор (1=C, 2=B, 3=E), напр. BC547",
    "pins": {
     "1": "C",
     "2": "B",
     "3": "E"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "D1",
    "value": "1N4148",
    "sym": "D",
    "fp": "Diode_THT:D_DO-35_SOD27_P7.62mm_Horizontal",
    "desc": "Защитный диод (катод к +5V)",
    "sym_desc": "Диод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "K1",
    "value": "Relay coil",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Катушка реле (или модуль реле)",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R3",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Индикатор",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D2",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Горит при включённом реле",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "D1.1",
    "K1.1",
    "R3.1"
   ],
   "IN": [
    "J1.2",
    "R1.1"
   ],
   "GND": [
    "J1.3",
    "R2.2",
    "Q1.3"
   ],
   "BASE": [
    "R1.2",
    "R2.1",
    "Q1.2"
   ],
   "COIL-": [
    "Q1.1",
    "D1.2",
    "K1.2",
    "D2.1"
   ],
   "LED_A": [
    "R3.2",
    "D2.2"
   ]
  }
 },
 {
  "cat": "Ключи и драйверы",
  "level": 2,
  "desc": "Коммутация нагрузки 12 В (лента, мотор) логическим MOSFET.",
  "id": "t-mosfet",
  "kind": "template",
  "title": "Ключ нагрузки 12 В на MOSFET",
  "name": "mosfet_switch",
  "sheetDesc": "Логический MOSFET AO3400 управляет лентой/мотором до ~3 А от выхода 3,3 В.\nR2 держит транзистор закрытым при старте МК.",
  "dir": "kicad/t-mosfet/",
  "zip": "kicad/t-mosfet.zip",
  "starter": null,
  "svg": "kicad/t-mosfet/preview.svg",
  "pdf": "kicad/t-mosfet/mosfet_switch.pdf",
  "bom": "kicad/t-mosfet/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "CTRL",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Вход ШИМ от МК: 1 = сигнал, 2 = GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "100",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Ограничение тока заряда затвора",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "100k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка затвора к земле",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "Q1",
    "value": "AO3400A",
    "sym": "Q_NMOS_GSD",
    "fp": "Package_TO_SOT_SMD:SOT-23",
    "desc": "N-MOSFET, Rds ≈ 30 мОм",
    "sym_desc": "N-MOSFET (1=G, 2=S, 3=D), корпус SOT-23",
    "pins": {
     "1": "G",
     "2": "S",
     "3": "D"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "D1",
    "value": "SS34",
    "sym": "D_Schottky",
    "fp": "Diode_SMD:D_SMA",
    "desc": "Для индуктивной нагрузки (мотор)",
    "sym_desc": "Диод Шоттки",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J2",
    "value": "LOAD",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Нагрузка",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J3",
    "value": "12V IN",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Питание нагрузки",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "100u/25V",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D6.3mm_P2.50mm",
    "desc": "Фильтр питания",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "PWM": [
    "J1.1",
    "R1.1"
   ],
   "GND": [
    "J1.2",
    "R2.2",
    "Q1.2",
    "J3.2",
    "C1.2"
   ],
   "GATE": [
    "R1.2",
    "R2.1",
    "Q1.1"
   ],
   "LOAD-": [
    "Q1.3",
    "D1.2",
    "J2.2"
   ],
   "+12V": [
    "D1.1",
    "J2.1",
    "J3.1",
    "C1.1"
   ]
  }
 },
 {
  "cat": "Ключи и драйверы",
  "level": 2,
  "desc": "Драйвер двух коллекторных моторов на L293D.",
  "id": "t-l293d",
  "kind": "template",
  "title": "Драйвер двух моторов на L293D",
  "name": "motor_l293d",
  "sheetDesc": "Два коллекторных мотора: EN — ШИМ скорости, 1A/2A и 3A/4A — направление.\nVCC1 — логика 5 В, VCC2 — моторы 4,5–36 В. Встроенные диоды есть только у L293D (с буквой D).",
  "dir": "kicad/t-l293d/",
  "zip": "kicad/t-l293d.zip",
  "starter": null,
  "svg": "kicad/t-l293d/preview.svg",
  "pdf": "kicad/t-l293d/motor_l293d.pdf",
  "bom": "kicad/t-l293d/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "MCU",
    "sym": "Conn_01x08",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x08_P2.54mm_Vertical",
    "desc": "Управление",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3",
     "4": "Pin_4",
     "5": "Pin_5",
     "6": "Pin_6",
     "7": "Pin_7",
     "8": "Pin_8"
    },
    "sym_pins": 8,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "L293D",
    "sym": "L293D",
    "fp": "Package_DIP:DIP-16_W7.62mm",
    "desc": "H-мосты",
    "sym_desc": "Сдвоенный H-мост L293D, DIP-16",
    "pins": {
     "1": "EN12",
     "2": "1A",
     "7": "2A",
     "9": "EN34",
     "10": "3A",
     "15": "4A",
     "3": "1Y",
     "6": "2Y",
     "11": "3Y",
     "14": "4Y",
     "16": "VCC1",
     "8": "VCC2",
     "4": "GND",
     "5": "GND",
     "12": "GND",
     "13": "GND"
    },
    "sym_pins": 16,
    "symmetric": false
   },
   {
    "ref": "J2",
    "value": "MOTOR A",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Мотор A",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J3",
    "value": "MOTOR B",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Мотор B",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J4",
    "value": "VMOT",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Питание моторов",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "100u/25V",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D6.3mm_P2.50mm",
    "desc": "Фильтр питания моторов",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C2",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "ВЧ-развязка VMOT",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C3",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка логики",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "U1.16",
    "C3.1"
   ],
   "EN_A": [
    "J1.2",
    "U1.1"
   ],
   "IN1": [
    "J1.3",
    "U1.2"
   ],
   "IN2": [
    "J1.4",
    "U1.7"
   ],
   "EN_B": [
    "J1.5",
    "U1.9"
   ],
   "IN3": [
    "J1.6",
    "U1.10"
   ],
   "IN4": [
    "J1.7",
    "U1.15"
   ],
   "GND": [
    "J1.8",
    "U1.4",
    "U1.5",
    "U1.12",
    "U1.13",
    "J4.2",
    "C1.2",
    "C2.2",
    "C3.2"
   ],
   "M1+": [
    "U1.3",
    "J2.1"
   ],
   "M1-": [
    "U1.6",
    "J2.2"
   ],
   "M2+": [
    "U1.11",
    "J3.1"
   ],
   "M2-": [
    "U1.14",
    "J3.2"
   ],
   "VMOT": [
    "U1.8",
    "J4.1",
    "C1.1",
    "C2.1"
   ]
  }
 },
 {
  "cat": "Интерфейсы",
  "level": 2,
  "desc": "Двунаправленный преобразователь уровней I²C 3,3 ↔ 5 В.",
  "id": "t-level",
  "kind": "template",
  "title": "Преобразователь уровней I²C 3,3 ↔ 5 В",
  "name": "i2c_level_shifter",
  "sheetDesc": "Классическая схема на BSS138 (AN10441): двунаправленная, для I²C до 400 кГц.",
  "dir": "kicad/t-level/",
  "zip": "kicad/t-level.zip",
  "starter": null,
  "svg": "kicad/t-level/preview.svg",
  "pdf": "kicad/t-level/i2c_level_shifter.pdf",
  "bom": "kicad/t-level/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "LV 3V3",
    "sym": "Conn_01x04",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x04_P2.54mm_Vertical",
    "desc": "Сторона 3,3 В",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3",
     "4": "Pin_4"
    },
    "sym_pins": 4,
    "symmetric": false
   },
   {
    "ref": "J2",
    "value": "HV 5V",
    "sym": "Conn_01x04",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x04_P2.54mm_Vertical",
    "desc": "Сторона 5 В",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3",
     "4": "Pin_4"
    },
    "sym_pins": 4,
    "symmetric": false
   },
   {
    "ref": "Q1",
    "value": "BSS138",
    "sym": "Q_NMOS_GSD",
    "fp": "Package_TO_SOT_SMD:SOT-23",
    "desc": "Канал SDA",
    "sym_desc": "N-MOSFET (1=G, 2=S, 3=D), корпус SOT-23",
    "pins": {
     "1": "G",
     "2": "S",
     "3": "D"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "Q2",
    "value": "BSS138",
    "sym": "Q_NMOS_GSD",
    "fp": "Package_TO_SOT_SMD:SOT-23",
    "desc": "Канал SCL",
    "sym_desc": "N-MOSFET (1=G, 2=S, 3=D), корпус SOT-23",
    "pins": {
     "1": "G",
     "2": "S",
     "3": "D"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка LV",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка LV",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R3",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка HV",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R4",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка HV",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   }
  ],
  "nets": {
   "+3V3": [
    "J1.1",
    "Q1.1",
    "Q2.1",
    "R1.1",
    "R2.1"
   ],
   "SDA_LV": [
    "J1.2",
    "Q1.2",
    "R1.2"
   ],
   "SCL_LV": [
    "J1.3",
    "Q2.2",
    "R2.2"
   ],
   "GND": [
    "J1.4",
    "J2.4"
   ],
   "+5V": [
    "J2.1",
    "R3.1",
    "R4.1"
   ],
   "SDA_HV": [
    "J2.2",
    "Q1.3",
    "R3.2"
   ],
   "SCL_HV": [
    "J2.3",
    "Q2.3",
    "R4.2"
   ]
  }
 },
 {
  "cat": "Интерфейсы",
  "level": 2,
  "desc": "Узел промышленной шины RS-485 с терминатором и смещением.",
  "id": "t-rs485",
  "kind": "template",
  "title": "Узел RS-485 на MAX485",
  "name": "rs485_node",
  "sheetDesc": "Полудуплекс: DE и ~RE объединены (передача при высоком уровне).\nR3 = 120 Ом — терминатор (только на концах линии, ставится перемычкой).",
  "dir": "kicad/t-rs485/",
  "zip": "kicad/t-rs485.zip",
  "starter": null,
  "svg": "kicad/t-rs485/preview.svg",
  "pdf": "kicad/t-rs485/rs485_node.pdf",
  "bom": "kicad/t-rs485/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "MCU",
    "sym": "Conn_01x05",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x05_P2.54mm_Vertical",
    "desc": "К микроконтроллеру",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3",
     "4": "Pin_4",
     "5": "Pin_5"
    },
    "sym_pins": 5,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "MAX485",
    "sym": "MAX485",
    "fp": "Package_DIP:DIP-8_W7.62mm",
    "desc": "Приёмопередатчик",
    "sym_desc": "Приёмопередатчик RS-485, DIP-8",
    "pins": {
     "4": "DI",
     "3": "DE",
     "2": "~{RE}",
     "1": "RO",
     "6": "A",
     "7": "B",
     "8": "VCC",
     "5": "GND"
    },
    "sym_pins": 8,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R1",
    "value": "680",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Смещение линии (fail-safe)",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "680",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Смещение линии (fail-safe)",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R3",
    "value": "120",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Терминатор",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "JP1",
    "value": "TERM",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Перемычка терминатора",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J2",
    "value": "RS-485",
    "sym": "Conn_01x03",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-3_1x03_P5.08mm_Horizontal",
    "desc": "Линия A, B, GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "U1.8",
    "C1.1",
    "R1.1"
   ],
   "TXD": [
    "J1.2",
    "U1.4"
   ],
   "RXD": [
    "J1.3",
    "U1.1"
   ],
   "DIR": [
    "J1.4",
    "U1.3",
    "U1.2"
   ],
   "GND": [
    "J1.5",
    "U1.5",
    "C1.2",
    "R2.2",
    "J2.3"
   ],
   "LINE_A": [
    "U1.6",
    "R1.2",
    "R3.1",
    "J2.1"
   ],
   "LINE_B": [
    "U1.7",
    "R2.1",
    "JP1.2",
    "J2.2"
   ],
   "TERM": [
    "R3.2",
    "JP1.1"
   ]
  }
 },
 {
  "cat": "Интерфейсы",
  "level": 2,
  "desc": "Гальванически развязанный вход для сигналов 12–24 В.",
  "id": "t-opto",
  "kind": "template",
  "title": "Изолированный вход 12–24 В на PC817",
  "name": "opto_input",
  "sheetDesc": "Гальваническая развязка: промышленный сигнал 12–24 В → логика 3,3/5 В.\nI_LED ≈ (24 − 1,2)/4,7k ≈ 5 мА; при 12 В ≈ 2,3 мА. D1 защищает от обратной полярности.",
  "dir": "kicad/t-opto/",
  "zip": "kicad/t-opto.zip",
  "starter": null,
  "svg": "kicad/t-opto/preview.svg",
  "pdf": "kicad/t-opto/opto_input.pdf",
  "bom": "kicad/t-opto/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "IN 12-24V",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Изолированный вход",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "4k7",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal",
    "desc": "Ток светодиода оптопары (0,25 Вт)",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "1N4148",
    "sym": "D",
    "fp": "Diode_THT:D_DO-35_SOD27_P7.62mm_Horizontal",
    "desc": "Защита от переполюсовки (антипараллельно)",
    "sym_desc": "Диод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "PC817",
    "sym": "PC817",
    "fp": "Package_DIP:DIP-4_W7.62mm",
    "desc": "Оптопара",
    "sym_desc": "Оптопара, DIP-4",
    "pins": {
     "1": "A",
     "2": "K",
     "4": "C",
     "3": "E"
    },
    "sym_pins": 4,
    "symmetric": false
   },
   {
    "ref": "R2",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка выхода",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "J2",
    "value": "MCU",
    "sym": "Conn_01x03",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x03_P2.54mm_Vertical",
    "desc": "К МК: активный низкий уровень",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   }
  ],
  "nets": {
   "IN+": [
    "J1.1",
    "R1.1"
   ],
   "IN-": [
    "J1.2",
    "D1.2",
    "U1.2"
   ],
   "LED_IN": [
    "R1.2",
    "D1.1",
    "U1.1"
   ],
   "OUT": [
    "U1.4",
    "R2.2",
    "J2.2"
   ],
   "GND": [
    "U1.3",
    "J2.3"
   ],
   "+3V3": [
    "R2.1",
    "J2.1"
   ]
  }
 },
 {
  "cat": "Датчики",
  "level": 1,
  "desc": "Цифровой датчик температуры на шине 1-Wire.",
  "id": "t-ds18b20",
  "kind": "template",
  "title": "Датчик температуры DS18B20",
  "name": "ds18b20_sensor",
  "sheetDesc": "Шина 1-Wire: подтяжка 4,7 кОм к питанию. На одну линию можно повесить несколько датчиков.",
  "dir": "kicad/t-ds18b20/",
  "zip": "kicad/t-ds18b20.zip",
  "starter": null,
  "svg": "kicad/t-ds18b20/preview.svg",
  "pdf": "kicad/t-ds18b20/ds18b20_sensor.pdf",
  "bom": "kicad/t-ds18b20/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "1-Wire",
    "sym": "Conn_01x03",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x03_P2.54mm_Vertical",
    "desc": "1 = VCC, 2 = DATA, 3 = GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "DS18B20",
    "sym": "DS18B20",
    "fp": "Package_TO_SOT_THT:TO-92_Inline",
    "desc": "Датчик",
    "sym_desc": "Цифровой датчик температуры 1-Wire, TO-92",
    "pins": {
     "2": "DQ",
     "3": "VDD",
     "1": "GND"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "4k7",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка 1-Wire",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C1",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "U1.3",
    "R1.1",
    "C1.1"
   ],
   "DQ": [
    "J1.2",
    "U1.2",
    "R1.2"
   ],
   "GND": [
    "J1.3",
    "U1.1",
    "C1.2"
   ]
  }
 },
 {
  "cat": "Микроконтроллеры",
  "level": 3,
  "desc": "Arduino на макетке/своей плате: минимальная обвязка ATmega328P.",
  "id": "t-arduino",
  "kind": "template",
  "title": "Минимальная Arduino-совместимая схема на ATmega328P",
  "name": "arduino_minimal",
  "sheetDesc": "Кварц 16 МГц, сброс, ISP-разъём, UART-разъём с автосбросом (DTR через 100 нФ), светодиод на D13 (PB5).\nЗагрузчик Arduino прошивается через ISP.",
  "dir": "kicad/t-arduino/",
  "zip": "kicad/t-arduino.zip",
  "starter": null,
  "svg": "kicad/t-arduino/preview.svg",
  "pdf": "kicad/t-arduino/arduino_minimal.pdf",
  "bom": "kicad/t-arduino/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "U1",
    "value": "ATmega328P-PU",
    "sym": "ATmega328P-P",
    "fp": "Package_DIP:DIP-28_W7.62mm",
    "desc": "Микроконтроллер",
    "sym_desc": "МК ATmega328P, DIP-28",
    "pins": {
     "1": "PC6/~{RESET}",
     "9": "PB6/XTAL1",
     "10": "PB7/XTAL2",
     "21": "AREF",
     "23": "PC0/A0",
     "24": "PC1/A1",
     "25": "PC2/A2",
     "26": "PC3/A3",
     "27": "PC4/SDA",
     "28": "PC5/SCL",
     "2": "PD0/RXD",
     "3": "PD1/TXD",
     "4": "PD2",
     "5": "PD3",
     "6": "PD4",
     "11": "PD5",
     "12": "PD6",
     "13": "PD7",
     "14": "PB0",
     "15": "PB1",
     "16": "PB2",
     "17": "PB3/MOSI",
     "18": "PB4/MISO",
     "19": "PB5/SCK",
     "7": "VCC",
     "20": "AVCC",
     "8": "GND",
     "22": "GND"
    },
    "sym_pins": 28,
    "symmetric": false
   },
   {
    "ref": "Y1",
    "value": "16MHz",
    "sym": "Crystal",
    "fp": "Crystal:Crystal_HC49-4H_Vertical",
    "desc": "Кварц",
    "sym_desc": "Кварцевый резонатор",
    "pins": {
     "1": "1",
     "2": "2"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C1",
    "value": "22p",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Нагрузочный",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C2",
    "value": "22p",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Нагрузочный",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C3",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка VCC",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C4",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка AVCC",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C5",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Фильтр AREF",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R1",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка RESET",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "SW1",
    "value": "RESET",
    "sym": "SW_Push",
    "fp": "Button_Switch_THT:SW_PUSH_6mm",
    "desc": "Кнопка сброса",
    "sym_desc": "Кнопка без фиксации",
    "pins": {
     "1": "1",
     "2": "2"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C6",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Автосброс от DTR",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "J1",
    "value": "ISP",
    "sym": "Conn_02x03_Odd_Even",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_2x03_P2.54mm_Vertical",
    "desc": "Программирование (стандарт AVR ISP)",
    "sym_desc": "Разъём 2×3 (ISP)",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3",
     "4": "Pin_4",
     "5": "Pin_5",
     "6": "Pin_6"
    },
    "sym_pins": 6,
    "symmetric": false
   },
   {
    "ref": "J2",
    "value": "UART",
    "sym": "Conn_01x06",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x06_P2.54mm_Vertical",
    "desc": "FTDI-совместимый: GND, CTS, VCC, TXD→RX, RXD, DTR",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3",
     "4": "Pin_4",
     "5": "Pin_5",
     "6": "Pin_6"
    },
    "sym_pins": 6,
    "symmetric": false
   },
   {
    "ref": "R2",
    "value": "330",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Светодиод D13",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "«Blink»",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "U1.7",
    "U1.20",
    "C3.1",
    "C4.1",
    "R1.1",
    "J1.2",
    "J2.3"
   ],
   "GND": [
    "U1.8",
    "U1.22",
    "C1.2",
    "C2.2",
    "C3.2",
    "C4.2",
    "C5.2",
    "SW1.2",
    "J1.6",
    "J2.1",
    "J2.2",
    "D1.1"
   ],
   "RESET": [
    "U1.1",
    "R1.2",
    "SW1.1",
    "C6.2",
    "J1.5"
   ],
   "XTAL1": [
    "U1.9",
    "Y1.1",
    "C1.1"
   ],
   "XTAL2": [
    "U1.10",
    "Y1.2",
    "C2.1"
   ],
   "AREF": [
    "U1.21",
    "C5.1"
   ],
   "RXD": [
    "U1.2",
    "J2.4"
   ],
   "TXD": [
    "U1.3",
    "J2.5"
   ],
   "MOSI": [
    "U1.17",
    "J1.4"
   ],
   "MISO": [
    "U1.18",
    "J1.1"
   ],
   "SCK": [
    "U1.19",
    "J1.3",
    "R2.1"
   ],
   "DTR": [
    "C6.1",
    "J2.6"
   ],
   "LED_A": [
    "R2.2",
    "D1.2"
   ]
  }
 },
 {
  "cat": "Микроконтроллеры",
  "level": 3,
  "desc": "ESP32-WROOM с USB-UART и автозагрузкой — основа IoT-устройств.",
  "id": "t-esp32",
  "kind": "template",
  "title": "Минимальная плата ESP32-WROOM с USB (CH340C)",
  "name": "esp32_minimal",
  "sheetDesc": "Питание от USB через AP2112K-3.3, автозагрузка: DTR/RTS → EN/IO0 через два транзистора.\nПод антенной модуля — никакой меди!",
  "dir": "kicad/t-esp32/",
  "zip": "kicad/t-esp32.zip",
  "starter": null,
  "svg": "kicad/t-esp32/preview.svg",
  "pdf": "kicad/t-esp32/esp32_minimal.pdf",
  "bom": "kicad/t-esp32/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "USB",
    "sym": "Conn_01x04",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x04_P2.54mm_Vertical",
    "desc": "Линии USB (или подключите USB-C по шаблону «Питание от USB Type-C»)",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3",
     "4": "Pin_4"
    },
    "sym_pins": 4,
    "symmetric": false
   },
   {
    "ref": "U2",
    "value": "AP2112K-3.3",
    "sym": "AP2112K-3.3",
    "fp": "Package_TO_SOT_SMD:SOT-23-5",
    "desc": "LDO 3,3 В 600 мА",
    "sym_desc": "LDO 3,3 В 600 мА, SOT-23-5",
    "pins": {
     "1": "VIN",
     "3": "EN",
     "5": "VOUT",
     "4": "NC",
     "2": "GND"
    },
    "sym_pins": 5,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "10u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Вход LDO",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C2",
    "value": "22u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Выход LDO / пики ESP32",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C3",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка модуля",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U3",
    "value": "CH340C",
    "sym": "CH340C",
    "fp": "Package_SO:SOIC-16_3.9x9.9mm_P1.27mm",
    "desc": "USB–UART при питании 3,3 В: V3 соединён с VCC",
    "sym_desc": "Мост USB–UART CH340C, SOP-16",
    "pins": {
     "5": "UD+",
     "6": "UD-",
     "9": "~{CTS}",
     "10": "~{DSR}",
     "11": "~{RI}",
     "12": "~{DCD}",
     "15": "R232",
     "2": "TXD",
     "3": "RXD",
     "13": "~{DTR}",
     "14": "~{RTS}",
     "7": "NC",
     "8": "NC",
     "16": "VCC",
     "4": "V3",
     "1": "GND"
    },
    "sym_pins": 16,
    "symmetric": false
   },
   {
    "ref": "C4",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка CH340C",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U1",
    "value": "ESP32-WROOM-32E",
    "sym": "ESP32-WROOM-32E",
    "fp": "RF_Module:ESP32-WROOM-32D",
    "desc": "Модуль",
    "sym_desc": "Модуль ESP32-WROOM-32E (выводы 17–22 — флэш, не подключать)",
    "pins": {
     "3": "EN",
     "4": "SENSOR_VP",
     "5": "SENSOR_VN",
     "6": "IO34",
     "7": "IO35",
     "8": "IO32",
     "9": "IO33",
     "10": "IO25",
     "11": "IO26",
     "12": "IO27",
     "13": "IO14",
     "14": "IO12",
     "16": "IO13",
     "23": "IO15",
     "25": "IO0",
     "35": "TXD0/IO1",
     "24": "IO2",
     "34": "RXD0/IO3",
     "26": "IO4",
     "29": "IO5",
     "27": "IO16",
     "28": "IO17",
     "30": "IO18",
     "31": "IO19",
     "33": "IO21",
     "36": "IO22",
     "37": "IO23",
     "17": "NC",
     "18": "NC",
     "19": "NC",
     "20": "NC",
     "21": "NC",
     "22": "NC",
     "32": "NC",
     "2": "3V3",
     "1": "GND",
     "15": "GND",
     "38": "GND",
     "39": "GND"
    },
    "sym_pins": 39,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка EN",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C5",
    "value": "1u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Задержка старта EN",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка IO0",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "SW1",
    "value": "EN",
    "sym": "SW_Push",
    "fp": "Button_Switch_THT:SW_PUSH_6mm",
    "desc": "Сброс",
    "sym_desc": "Кнопка без фиксации",
    "pins": {
     "1": "1",
     "2": "2"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "SW2",
    "value": "BOOT",
    "sym": "SW_Push",
    "fp": "Button_Switch_THT:SW_PUSH_6mm",
    "desc": "Режим прошивки",
    "sym_desc": "Кнопка без фиксации",
    "pins": {
     "1": "1",
     "2": "2"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "Q1",
    "value": "BC817",
    "sym": "Q_NPN_CBE",
    "fp": "Package_TO_SOT_SMD:SOT-23",
    "desc": "Автосброс",
    "sym_desc": "NPN-транзистор (1=C, 2=B, 3=E), напр. BC547",
    "pins": {
     "1": "C",
     "2": "B",
     "3": "E"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "Q2",
    "value": "BC817",
    "sym": "Q_NPN_CBE",
    "fp": "Package_TO_SOT_SMD:SOT-23",
    "desc": "Автозагрузка",
    "sym_desc": "NPN-транзистор (1=C, 2=B, 3=E), напр. BC547",
    "pins": {
     "1": "C",
     "2": "B",
     "3": "E"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "R3",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "База Q1",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R4",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "База Q2",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R5",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Светодиод на IO2",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Индикатор",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "U2.1",
    "U2.3",
    "C1.1"
   ],
   "USB_D-": [
    "J1.2",
    "U3.6"
   ],
   "USB_D+": [
    "J1.3",
    "U3.5"
   ],
   "GND": [
    "J1.4",
    "U2.2",
    "C1.2",
    "C2.2",
    "C3.2",
    "U3.1",
    "C4.2",
    "U1.1",
    "U1.15",
    "U1.38",
    "U1.39",
    "C5.2",
    "SW1.2",
    "SW2.2",
    "D1.1"
   ],
   "+3V3": [
    "U2.5",
    "C2.1",
    "C3.1",
    "U3.16",
    "U3.4",
    "C4.1",
    "U1.2",
    "R1.1",
    "R2.1"
   ],
   "U_TXD": [
    "U3.2",
    "U1.34"
   ],
   "U_RXD": [
    "U3.3",
    "U1.35"
   ],
   "DTR": [
    "U3.13",
    "Q2.3",
    "R3.1"
   ],
   "RTS": [
    "U3.14",
    "Q1.3",
    "R4.1"
   ],
   "EN": [
    "U1.3",
    "R1.2",
    "C5.1",
    "SW1.1",
    "Q1.1"
   ],
   "IO0": [
    "U1.25",
    "R2.2",
    "SW2.1",
    "Q2.1"
   ],
   "LED": [
    "U1.24",
    "R5.1"
   ],
   "QB1": [
    "Q1.2",
    "R3.2"
   ],
   "QB2": [
    "Q2.2",
    "R4.2"
   ],
   "LED_A": [
    "R5.2",
    "D1.2"
   ]
  }
 }
];
KM.data.projects = [
 {
  "id": "p01",
  "title": "Простой светодиодный модуль",
  "level": 1,
  "xp": 100,
  "icon": "🔌",
  "short": "Резистор, светодиод и разъём питания — первая плата.",
  "goal": "Собрать модуль индикации питания 5 В: светодиод горит, когда на разъём подано напряжение.",
  "req": [
   "J1: вывод 1 = +5V, вывод 2 = GND",
   "R1 330 Ом между +5V и анодом D1",
   "Катод D1 — на GND",
   "Используйте символы питания +5V и GND"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "Катод светодиода — вывод 1 (K), анод — вывод 2 (A), как в библиотеке KiCad.",
   "Ток: (5 − 2) / 330 ≈ 9 мА — безопасно для любого светодиода."
  ],
  "learn": [
   "Символы питания",
   "Токоограничивающий резистор",
   "Полярность светодиода"
  ],
  "kind": "project",
  "name": "p01_led_module",
  "sheetDesc": "Питание 5 В с разъёма → резистор → светодиод.",
  "dir": "kicad/p01/",
  "zip": "kicad/p01.zip",
  "starter": "kicad/p01-starter.zip",
  "svg": "kicad/p01/preview.svg",
  "pdf": "kicad/p01/p01_led_module.pdf",
  "bom": "kicad/p01/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "Conn_01x02",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Разъём питания",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "330",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Токоограничивающий резистор",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Светодиод",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "R1.1"
   ],
   "GND": [
    "J1.2",
    "D1.1"
   ],
   "LED_A": [
    "R1.2",
    "D1.2"
   ]
  }
 },
 {
  "id": "p02",
  "title": "Светодиод с кнопкой",
  "level": 1,
  "xp": 120,
  "icon": "🔘",
  "short": "Индикатор питания и светодиод, загорающийся по нажатию.",
  "goal": "Добавить в схему кнопку: второй светодиод горит только при нажатии.",
  "req": [
   "J1: 1 = +5V, 2 = GND",
   "D1 (зелёный) через R1 1 кОм — постоянно горит",
   "SW1 между +5V и цепью, идущей к R2",
   "R2 330 Ом → анод D2, катод D2 — GND"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "Кнопка — просто разрыв цепи. Ставьте её до резистора, со стороны +5V."
  ],
  "learn": [
   "Кнопки",
   "Параллельные ветви"
  ],
  "kind": "project",
  "name": "p02_led_button",
  "sheetDesc": "Зелёный светодиод — индикатор питания, красный загорается по кнопке.",
  "dir": "kicad/p02/",
  "zip": "kicad/p02.zip",
  "starter": "kicad/p02-starter.zip",
  "svg": "kicad/p02/preview.svg",
  "pdf": "kicad/p02/p02_led_button.pdf",
  "bom": "kicad/p02/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "Conn_01x02",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Питание 5 В",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Индикатор питания",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED green",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Питание есть",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "SW1",
    "value": "SW_Push",
    "sym": "SW_Push",
    "fp": "Button_Switch_THT:SW_PUSH_6mm",
    "desc": "Кнопка",
    "sym_desc": "Кнопка без фиксации",
    "pins": {
     "1": "1",
     "2": "2"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "330",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Ток красного светодиода",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D2",
    "value": "LED red",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Горит при нажатии",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "R1.1",
    "SW1.1"
   ],
   "GND": [
    "J1.2",
    "D1.1",
    "D2.1"
   ],
   "PWR_LED": [
    "R1.2",
    "D1.2"
   ],
   "SW_OUT": [
    "SW1.2",
    "R2.1"
   ],
   "LED_A": [
    "R2.2",
    "D2.2"
   ]
  }
 },
 {
  "id": "p03",
  "title": "Модуль питания 5 В и 3,3 В",
  "level": 2,
  "xp": 180,
  "icon": "🔋",
  "short": "Два стабилизатора, защита от переполюсовки и индикаторы.",
  "goal": "Сделать модуль, выдающий 5 В и 3,3 В от адаптера 7–12 В.",
  "req": [
   "J1: 1 = вход +, 2 = GND; D1 (1N4007) — анод к J1.1",
   "U1 L7805: IN(1) = вход после диода, GND(2), OUT(3) = +5V",
   "U2 AMS1117-3.3: VI(3) = +5V, GND(1), VO(2) = +3V3",
   "Конденсаторы: C1 на входе, C2 на +5V, C3 на +3V3",
   "Индикаторы: R1+D2 на +5V, R2+D3 на +3V3",
   "J2: 1 = +5V, 2 = +3V3, 3 = GND"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "Для цепи после диода дайте метку (например VIN) или символ питания.",
   "Проверьте цоколёвку: у AMS1117 в SOT-223 вывод 1 — GND, 2 — выход, 3 — вход."
  ],
  "learn": [
   "Линейные стабилизаторы",
   "Каскад питаний",
   "PWR_FLAG"
  ],
  "kind": "project",
  "name": "p03_power_module",
  "sheetDesc": "Вход 7–12 В → L7805 → 5 В → AMS1117 → 3,3 В.",
  "dir": "kicad/p03/",
  "zip": "kicad/p03.zip",
  "starter": "kicad/p03-starter.zip",
  "svg": "kicad/p03/preview.svg",
  "pdf": "kicad/p03/p03_power_module.pdf",
  "bom": "kicad/p03/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "IN 7-12V",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Вход",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "D1",
    "value": "1N4007",
    "sym": "D",
    "fp": "Diode_THT:D_DO-41_SOD81_P10.16mm_Horizontal",
    "desc": "Защита от переполюсовки",
    "sym_desc": "Диод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "100u",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D6.3mm_P2.50mm",
    "desc": "Входной фильтр",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "L7805",
    "sym": "L7805",
    "fp": "Package_TO_SOT_THT:TO-220-3_Vertical",
    "desc": "Стабилизатор 5 В",
    "sym_desc": "Стабилизатор 5 В, TO-220",
    "pins": {
     "1": "IN",
     "3": "OUT",
     "2": "GND"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "C2",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Выход 7805",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U2",
    "value": "AMS1117-3.3",
    "sym": "AMS1117-3.3",
    "fp": "Package_TO_SOT_SMD:SOT-223-3_TabPin2",
    "desc": "Стабилизатор 3,3 В",
    "sym_desc": "LDO 3,3 В, SOT-223",
    "pins": {
     "3": "VI",
     "2": "VO",
     "1": "GND"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "C3",
    "value": "22u",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D5.0mm_P2.00mm",
    "desc": "Выход AMS1117",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Индикатор 5 В",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D2",
    "value": "LED red",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Есть 5 В",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R2",
    "value": "470",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Индикатор 3,3 В",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D3",
    "value": "LED green",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Есть 3,3 В",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J2",
    "value": "OUT",
    "sym": "Conn_01x03",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x03_P2.54mm_Vertical",
    "desc": "Выход: 5 В, 3,3 В, GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   }
  ],
  "nets": {
   "VIN_RAW": [
    "J1.1",
    "D1.2"
   ],
   "GND": [
    "J1.2",
    "C1.2",
    "U1.2",
    "C2.2",
    "U2.1",
    "C3.2",
    "D2.1",
    "D3.1",
    "J2.3"
   ],
   "VIN": [
    "D1.1",
    "C1.1",
    "U1.1"
   ],
   "+5V": [
    "U1.3",
    "C2.1",
    "U2.3",
    "R1.1",
    "J2.1"
   ],
   "+3V3": [
    "U2.2",
    "C3.1",
    "R2.1",
    "J2.2"
   ],
   "LED5": [
    "R1.2",
    "D2.2"
   ],
   "LED33": [
    "R2.2",
    "D3.2"
   ]
  }
 },
 {
  "id": "p04",
  "title": "Модуль датчика температуры",
  "level": 1,
  "xp": 140,
  "icon": "🌡️",
  "short": "DS18B20 с подтяжкой и индикатором — для Arduino и ESP.",
  "goal": "Собрать модуль с цифровым датчиком температуры для подключения тремя проводами.",
  "req": [
   "J1: 1 = +5V, 2 = DQ (данные), 3 = GND",
   "U1 DS18B20: GND(1), DQ(2), VDD(3)",
   "R1 4,7 кОм между +5V и DQ",
   "C1 100 нФ между +5V и GND",
   "R2 1 кОм + D1 — индикатор питания"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "Без подтягивающего резистора шина 1-Wire не работает."
  ],
  "learn": [
   "Шина 1-Wire",
   "Подтяжки",
   "Развязка питания"
  ],
  "kind": "project",
  "name": "p04_temp_sensor",
  "sheetDesc": "DS18B20 на шине 1-Wire + светодиод питания.",
  "dir": "kicad/p04/",
  "zip": "kicad/p04.zip",
  "starter": "kicad/p04-starter.zip",
  "svg": "kicad/p04/preview.svg",
  "pdf": "kicad/p04/p04_temp_sensor.pdf",
  "bom": "kicad/p04/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "Conn_01x03",
    "sym": "Conn_01x03",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x03_P2.54mm_Vertical",
    "desc": "VCC, DATA, GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "DS18B20",
    "sym": "DS18B20",
    "fp": "Package_TO_SOT_THT:TO-92_Inline",
    "desc": "Датчик",
    "sym_desc": "Цифровой датчик температуры 1-Wire, TO-92",
    "pins": {
     "2": "DQ",
     "3": "VDD",
     "1": "GND"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "4k7",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка 1-Wire",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C1",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Индикатор",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Индикатор питания",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "U1.3",
    "R1.1",
    "C1.1",
    "R2.1"
   ],
   "DQ": [
    "J1.2",
    "U1.2",
    "R1.2"
   ],
   "GND": [
    "J1.3",
    "U1.1",
    "C1.2",
    "D1.1"
   ],
   "LED_A": [
    "R2.2",
    "D1.2"
   ]
  }
 },
 {
  "id": "p05",
  "title": "Термометр I²C на LM75A",
  "level": 2,
  "xp": 180,
  "icon": "📟",
  "short": "Датчик на шине I²C с адресными выводами и выходом перегрева.",
  "goal": "Сделать модуль с разъёмом в стиле Qwiic/STEMMA QT.",
  "req": [
   "J1: 1 = GND, 2 = +3V3, 3 = SDA, 4 = SCL",
   "U1 LM75A: A0, A1, A2 → GND (адрес 0x48)",
   "Подтяжки R1 (SDA) и R2 (SCL) 4,7 кОм к +3V3",
   "OS (вывод 3) через D1 и R3 к +3V3: светодиод горит при низком уровне OS",
   "C1 100 нФ у питания"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "Выход OS — открытый сток: он может только «тянуть вниз», поэтому светодиод включён между питанием и OS."
  ],
  "learn": [
   "Шина I²C",
   "Адресация",
   "Открытый сток"
  ],
  "kind": "project",
  "name": "p05_i2c_thermometer",
  "sheetDesc": "Адрес 0x48 (A0–A2 на GND), подтяжки шины, светодиод на выходе OS (перегрев).",
  "dir": "kicad/p05/",
  "zip": "kicad/p05.zip",
  "starter": "kicad/p05-starter.zip",
  "svg": "kicad/p05/preview.svg",
  "pdf": "kicad/p05/p05_i2c_thermometer.pdf",
  "bom": "kicad/p05/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "I2C",
    "sym": "Conn_01x04",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x04_P2.54mm_Vertical",
    "desc": "Порядок как у Qwiic/STEMMA QT: GND, VCC, SDA, SCL",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3",
     "4": "Pin_4"
    },
    "sym_pins": 4,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "LM75A",
    "sym": "LM75A",
    "fp": "Package_SO:SOIC-8_3.9x4.9mm_P1.27mm",
    "desc": "Датчик",
    "sym_desc": "Датчик температуры I²C, SOIC-8",
    "pins": {
     "1": "SDA",
     "2": "SCL",
     "3": "OS",
     "7": "A0",
     "6": "A1",
     "5": "A2",
     "8": "VCC",
     "4": "GND"
    },
    "sym_pins": 8,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R1",
    "value": "4k7",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка SDA",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "4k7",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка SCL",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R3",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Ток светодиода",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED red",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Загорается при превышении порога",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "GND": [
    "J1.1",
    "U1.4",
    "U1.5",
    "U1.6",
    "U1.7",
    "C1.2"
   ],
   "+3V3": [
    "J1.2",
    "U1.8",
    "C1.1",
    "R1.1",
    "R2.1",
    "R3.1"
   ],
   "SDA": [
    "J1.3",
    "U1.1",
    "R1.2"
   ],
   "SCL": [
    "J1.4",
    "U1.2",
    "R2.2"
   ],
   "OS": [
    "U1.3",
    "D1.1"
   ],
   "OS_LED": [
    "R3.2",
    "D1.2"
   ]
  }
 },
 {
  "id": "p06",
  "title": "Регулятор громкости с буфером",
  "level": 2,
  "xp": 200,
  "icon": "🎛️",
  "short": "Стерео-регулятор на двух потенциометрах с буферами на ОУ.",
  "goal": "Сделать регулятор громкости, который не «проседает» от нагрузки благодаря повторителям на LM358.",
  "req": [
   "J1: 1 = L, 2 = R, 3 = GND; вход через C1/C2 1 мкФ",
   "RV1/RV2: вывод 1 — сигнал, 3 — VREF, 2 (движок) — на вход ОУ",
   "U1 LM358: оба канала повторителями (выход соединён с инвертирующим входом)",
   "VREF = делитель R1/R2 10k + C3 47 мкФ",
   "Выходы через C4/C5 10 мкФ на J2 (1 = L, 2 = R, 3 = GND)",
   "J3: 1 = VCC (5–12 В), 2 = GND; C6 100 нФ у ОУ"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "Однополярное питание требует смещения сигнала на VCC/2 — для этого VREF.",
   "Используйте потенциометр логарифмический (A) — громкость воспринимается логарифмически."
  ],
  "learn": [
   "ОУ-повторитель",
   "Однополярное питание",
   "Разделительные конденсаторы"
  ],
  "kind": "project",
  "name": "p06_volume_control",
  "sheetDesc": "Стерео: два потенциометра A10k, буферы на LM358, питание 5–12 В, опора VCC/2.",
  "dir": "kicad/p06/",
  "zip": "kicad/p06.zip",
  "starter": "kicad/p06-starter.zip",
  "svg": "kicad/p06/preview.svg",
  "pdf": "kicad/p06/p06_volume_control.pdf",
  "bom": "kicad/p06/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "IN",
    "sym": "Conn_01x03",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x03_P2.54mm_Vertical",
    "desc": "Вход: L, R, GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "1u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Разделительный L",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C2",
    "value": "1u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Разделительный R",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "RV1",
    "value": "A10k",
    "sym": "R_Potentiometer",
    "fp": "Potentiometer_THT:Potentiometer_Alps_RK09K_Single_Vertical",
    "desc": "Громкость L (секция сдвоенного потенциометра)",
    "sym_desc": "Потенциометр",
    "pins": {
     "1": "1",
     "2": "2",
     "3": "3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "RV2",
    "value": "A10k",
    "sym": "R_Potentiometer",
    "fp": "Potentiometer_THT:Potentiometer_Alps_RK09K_Single_Vertical",
    "desc": "Громкость R",
    "sym_desc": "Потенциометр",
    "pins": {
     "1": "1",
     "2": "2",
     "3": "3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "LM358",
    "sym": "LM358",
    "fp": "Package_DIP:DIP-8_W7.62mm",
    "desc": "Два повторителя",
    "sym_desc": "Сдвоенный ОУ LM358 (обе части в одном символе)",
    "pins": {
     "3": "+INA",
     "2": "-INA",
     "5": "+INB",
     "6": "-INB",
     "1": "OUTA",
     "7": "OUTB",
     "8": "V+",
     "4": "V-"
    },
    "sym_pins": 8,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Опора VCC/2",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Опора VCC/2",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C3",
    "value": "47u",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D5.0mm_P2.00mm",
    "desc": "Фильтр опоры",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C4",
    "value": "10u",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D5.0mm_P2.00mm",
    "desc": "Выходной L",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C5",
    "value": "10u",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D5.0mm_P2.00mm",
    "desc": "Выходной R",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C6",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка ОУ",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "J2",
    "value": "OUT",
    "sym": "Conn_01x03",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x03_P2.54mm_Vertical",
    "desc": "Выход: L, R, GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "J3",
    "value": "PWR",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Питание 5–12 В",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "IN_L": [
    "J1.1",
    "C1.1"
   ],
   "IN_R": [
    "J1.2",
    "C2.1"
   ],
   "GND": [
    "J1.3",
    "U1.4",
    "R2.2",
    "C3.2",
    "C6.2",
    "J2.3",
    "J3.2"
   ],
   "L_AC": [
    "C1.2",
    "RV1.1"
   ],
   "R_AC": [
    "C2.2",
    "RV2.1"
   ],
   "VREF": [
    "RV1.3",
    "RV2.3",
    "R1.2",
    "R2.1",
    "C3.1"
   ],
   "L_VOL": [
    "RV1.2",
    "U1.3"
   ],
   "R_VOL": [
    "RV2.2",
    "U1.5"
   ],
   "L_OUT": [
    "U1.2",
    "U1.1",
    "C4.1"
   ],
   "R_OUT": [
    "U1.6",
    "U1.7",
    "C5.1"
   ],
   "VCC": [
    "U1.8",
    "R1.1",
    "C6.1",
    "J3.1"
   ],
   "OUT_L": [
    "C4.2",
    "J2.1"
   ],
   "OUT_R": [
    "C5.2",
    "J2.2"
   ]
  }
 },
 {
  "id": "p07",
  "title": "Модуль приёмника радиосигналов 433 МГц",
  "level": 2,
  "xp": 220,
  "icon": "📡",
  "short": "Плата-носитель для модуля приёмника с фильтром питания и индикатором приёма.",
  "goal": "Сделать удобную плату для модуля RXB6/SYN480R: чистое питание, антенна и индикация.",
  "req": [
   "J1 — гнездо модуля: 1 = +5V_RF, 2 = RF_DATA, 3 = GND, 4 = ANT",
   "AE1 (антенна) → ANT",
   "FB1 между +5V и +5V_RF, после неё C1 10 мкФ и C2 100 нФ",
   "RF_DATA → R1 10k → база Q1 BC547, эмиттер — GND",
   "R2 1k → D1 → коллектор Q1 (цепь LED_K)",
   "RF_DATA → R3 1k → DATA_OUT; J2: 1 = +5V, 2 = DATA_OUT, 3 = GND"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "Чувствительный приёмник боится помех от цифровой части — отсюда ферритовая бусина и конденсаторы.",
   "Длина антенны λ/4 = 300 / 433,92 МГц / 4 ≈ 17,3 см."
  ],
  "learn": [
   "LC-фильтр питания",
   "Транзисторный ключ",
   "Антенны"
  ],
  "kind": "project",
  "name": "p07_rf433_receiver",
  "sheetDesc": "Модуль-приёмник (RXB6/SYN480R) + LC-фильтр питания + антенна λ/4 (17,3 см) + индикатор приёма.",
  "dir": "kicad/p07/",
  "zip": "kicad/p07.zip",
  "starter": "kicad/p07-starter.zip",
  "svg": "kicad/p07/preview.svg",
  "pdf": "kicad/p07/p07_rf433_receiver.pdf",
  "bom": "kicad/p07/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "RX433 module",
    "sym": "Conn_01x04",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x04_P2.54mm_Vertical",
    "desc": "Гнездо под модуль: VCC, DATA, GND, ANT (сверьте с вашим модулем)",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3",
     "4": "Pin_4"
    },
    "sym_pins": 4,
    "symmetric": false
   },
   {
    "ref": "AE1",
    "value": "Wire 173mm",
    "sym": "Antenna",
    "fp": "TestPoint:TestPoint_Pad_D2.0mm",
    "desc": "Штыревая антенна: провод 17,3 см",
    "sym_desc": "Антенна",
    "pins": {
     "1": "A"
    },
    "sym_pins": 1,
    "symmetric": false
   },
   {
    "ref": "FB1",
    "value": "600R@100MHz",
    "sym": "FerriteBead",
    "fp": "Inductor_SMD:L_0805_2012Metric",
    "desc": "Ферритовая бусина — фильтр помех питания",
    "sym_desc": "Ферритовая бусина",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C1",
    "value": "10u",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D5.0mm_P2.00mm",
    "desc": "Фильтр питания приёмника",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C2",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "ВЧ-развязка",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R1",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Ток базы (не нагружает выход модуля)",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "Q1",
    "value": "BC547",
    "sym": "Q_NPN_CBE",
    "fp": "Package_TO_SOT_THT:TO-92_Inline",
    "desc": "Ключ индикатора",
    "sym_desc": "NPN-транзистор (1=C, 2=B, 3=E), напр. BC547",
    "pins": {
     "1": "C",
     "2": "B",
     "3": "E"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "R2",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Ток светодиода",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED yellow",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Мигает при приёме данных",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R3",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Защитный резистор выхода",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "J2",
    "value": "MCU",
    "sym": "Conn_01x03",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x03_P2.54mm_Vertical",
    "desc": "К микроконтроллеру: 5V, DATA, GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V_RF": [
    "J1.1",
    "FB1.2",
    "C1.1",
    "C2.1"
   ],
   "RF_DATA": [
    "J1.2",
    "R1.1",
    "R3.1"
   ],
   "GND": [
    "J1.3",
    "C1.2",
    "C2.2",
    "Q1.3",
    "J2.3"
   ],
   "ANT": [
    "J1.4",
    "AE1.1"
   ],
   "+5V": [
    "FB1.1",
    "R2.1",
    "J2.1"
   ],
   "Q_B": [
    "R1.2",
    "Q1.2"
   ],
   "LED_K": [
    "Q1.1",
    "D1.1"
   ],
   "LED_A": [
    "R2.2",
    "D1.2"
   ],
   "DATA_OUT": [
    "R3.2",
    "J2.2"
   ]
  }
 },
 {
  "id": "p08",
  "title": "Двухцветная мигалка на NE555",
  "level": 1,
  "xp": 150,
  "icon": "🚨",
  "short": "Два светодиода мигают поочерёдно от одного выхода таймера.",
  "goal": "Собрать мигалку, где один светодиод подключён к выходу «вверх» (к GND), а второй — «вниз» (к питанию).",
  "req": [
   "J1: 1 = +9V, 2 = GND",
   "NE555 по классической схеме автогенератора: R1 10k, R2 47k, C1 10 мкФ, C2 10 нФ на CV",
   "Выход (3) → R3 → D1 → GND",
   "+9V → R4 → D2 → выход (3)",
   "RESET (4) и VCC (8) — на +9V"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "Выход NE555 может и отдавать, и принимать ток — поэтому работают оба светодиода."
  ],
  "learn": [
   "Таймер 555",
   "Втекающий и вытекающий ток"
  ],
  "kind": "project",
  "name": "p08_dual_blinker",
  "sheetDesc": "Светодиоды мигают поочерёдно: D1 — при высоком уровне выхода, D2 — при низком.",
  "dir": "kicad/p08/",
  "zip": "kicad/p08.zip",
  "starter": "kicad/p08-starter.zip",
  "svg": "kicad/p08/preview.svg",
  "pdf": "kicad/p08/p08_dual_blinker.pdf",
  "bom": "kicad/p08/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "PWR",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Питание 5–12 В (например батарея 9 В)",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "NE555",
    "sym": "NE555",
    "fp": "Package_DIP:DIP-8_W7.62mm",
    "desc": "Таймер",
    "sym_desc": "Таймер NE555, DIP-8",
    "pins": {
     "2": "TR",
     "6": "THR",
     "4": "R",
     "5": "CV",
     "3": "Q",
     "7": "DIS",
     "8": "VCC",
     "1": "GND"
    },
    "sym_pins": 8,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal",
    "desc": "R1",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "47k",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal",
    "desc": "R2",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C1",
    "value": "10u",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D5.0mm_P2.00mm",
    "desc": "Времязадающий",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C2",
    "value": "10n",
    "sym": "C",
    "fp": "Capacitor_THT:C_Disc_D5.0mm_W2.5mm_P5.00mm",
    "desc": "Фильтр CV",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R3",
    "value": "680",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal",
    "desc": "Ток D1",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED red",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Горит при OUT = 1",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R4",
    "value": "680",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal",
    "desc": "Ток D2",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D2",
    "value": "LED green",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Горит при OUT = 0",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C3",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_THT:C_Disc_D5.0mm_W2.5mm_P5.00mm",
    "desc": "Развязка",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   }
  ],
  "nets": {
   "+9V": [
    "J1.1",
    "U1.8",
    "U1.4",
    "R1.1",
    "R4.1",
    "C3.1"
   ],
   "GND": [
    "J1.2",
    "U1.1",
    "C1.2",
    "C2.2",
    "D1.1",
    "C3.2"
   ],
   "DIS": [
    "U1.7",
    "R1.2",
    "R2.1"
   ],
   "TH": [
    "U1.6",
    "U1.2",
    "R2.2",
    "C1.1"
   ],
   "OUT": [
    "U1.3",
    "R3.1",
    "D2.1"
   ],
   "CV": [
    "U1.5",
    "C2.1"
   ],
   "LED1_A": [
    "R3.2",
    "D1.2"
   ],
   "LED2_A": [
    "R4.2",
    "D2.2"
   ]
  }
 },
 {
  "id": "p09",
  "title": "Бегущие огни",
  "level": 2,
  "xp": 220,
  "icon": "✨",
  "short": "NE555 + CD4017 и десять светодиодов.",
  "goal": "Собрать классический «бегущий огонь» с регулировкой скорости.",
  "req": [
   "NE555: R1 1k, RV1 100k (выводы 2 и 3 вместе), C1 4,7 мкФ; выход (3) → CLK (14) CD4017",
   "CD4017: EN (13) и RST (15) — на GND, VDD (16) — +9V, VSS (8) — GND",
   "Выходы Q0…Q9 → аноды D1…D10",
   "Все катоды → общий R2 680 Ом → GND",
   "C3 100 нФ у питания"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "Цоколёвка CD4017 «перемешана»: Q0 — вывод 3, Q1 — 2, Q2 — 4, Q3 — 7, Q4 — 10, Q5 — 1, Q6 — 5, Q7 — 6, Q8 — 9, Q9 — 11."
  ],
  "learn": [
   "Счётчики",
   "Тактирование",
   "Шины меток"
  ],
  "kind": "project",
  "name": "p09_running_lights",
  "sheetDesc": "NE555 даёт тактовые импульсы, CD4017 по очереди зажигает 10 светодиодов.\nОдин общий резистор в катодах — одновременно горит только один светодиод.",
  "dir": "kicad/p09/",
  "zip": "kicad/p09.zip",
  "starter": "kicad/p09-starter.zip",
  "svg": "kicad/p09/preview.svg",
  "pdf": "kicad/p09/p09_running_lights.pdf",
  "bom": "kicad/p09/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "PWR",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Питание 5–12 В",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "NE555",
    "sym": "NE555",
    "fp": "Package_DIP:DIP-8_W7.62mm",
    "desc": "Генератор",
    "sym_desc": "Таймер NE555, DIP-8",
    "pins": {
     "2": "TR",
     "6": "THR",
     "4": "R",
     "5": "CV",
     "3": "Q",
     "7": "DIS",
     "8": "VCC",
     "1": "GND"
    },
    "sym_pins": 8,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal",
    "desc": "R1",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "RV1",
    "value": "100k",
    "sym": "R_Potentiometer",
    "fp": "Potentiometer_THT:Potentiometer_Alps_RK09K_Single_Vertical",
    "desc": "Скорость бега",
    "sym_desc": "Потенциометр",
    "pins": {
     "1": "1",
     "2": "2",
     "3": "3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "4u7",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D5.0mm_P2.00mm",
    "desc": "Времязадающий",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C2",
    "value": "10n",
    "sym": "C",
    "fp": "Capacitor_THT:C_Disc_D5.0mm_W2.5mm_P5.00mm",
    "desc": "Фильтр CV",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U2",
    "value": "CD4017",
    "sym": "CD4017",
    "fp": "Package_DIP:DIP-16_W7.62mm",
    "desc": "Счётчик",
    "sym_desc": "Десятичный счётчик CD4017, DIP-16",
    "pins": {
     "14": "CLK",
     "13": "~{EN}",
     "15": "RST",
     "3": "Q0",
     "2": "Q1",
     "4": "Q2",
     "7": "Q3",
     "10": "Q4",
     "1": "Q5",
     "5": "Q6",
     "6": "Q7",
     "9": "Q8",
     "11": "Q9",
     "12": "CO",
     "16": "VDD",
     "8": "VSS"
    },
    "sym_pins": 16,
    "symmetric": false
   },
   {
    "ref": "D1",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Светодиод 1",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "D2",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Светодиод 2",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "D3",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Светодиод 3",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "D4",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Светодиод 4",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "D5",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Светодиод 5",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "D6",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Светодиод 6",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "D7",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Светодиод 7",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "D8",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Светодиод 8",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "D9",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Светодиод 9",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "D10",
    "value": "LED",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Светодиод 10",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R2",
    "value": "680",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal",
    "desc": "Общий резистор светодиодов",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C3",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_THT:C_Disc_D5.0mm_W2.5mm_P5.00mm",
    "desc": "Развязка",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   }
  ],
  "nets": {
   "+9V": [
    "J1.1",
    "U1.8",
    "U1.4",
    "R1.1",
    "U2.16",
    "C3.1"
   ],
   "GND": [
    "J1.2",
    "U1.1",
    "C1.2",
    "C2.2",
    "U2.13",
    "U2.15",
    "U2.8",
    "R2.2",
    "C3.2"
   ],
   "DIS": [
    "U1.7",
    "R1.2",
    "RV1.1"
   ],
   "TH": [
    "U1.6",
    "U1.2",
    "RV1.2",
    "RV1.3",
    "C1.1"
   ],
   "CLK": [
    "U1.3",
    "U2.14"
   ],
   "CV": [
    "U1.5",
    "C2.1"
   ],
   "Q0": [
    "U2.3",
    "D1.2"
   ],
   "Q1": [
    "U2.2",
    "D2.2"
   ],
   "Q2": [
    "U2.4",
    "D3.2"
   ],
   "Q3": [
    "U2.7",
    "D4.2"
   ],
   "Q4": [
    "U2.10",
    "D5.2"
   ],
   "Q5": [
    "U2.1",
    "D6.2"
   ],
   "Q6": [
    "U2.5",
    "D7.2"
   ],
   "Q7": [
    "U2.6",
    "D8.2"
   ],
   "Q8": [
    "U2.9",
    "D9.2"
   ],
   "Q9": [
    "U2.11",
    "D10.2"
   ],
   "LED_K": [
    "D1.1",
    "D2.1",
    "D3.1",
    "D4.1",
    "D5.1",
    "D6.1",
    "D7.1",
    "D8.1",
    "D9.1",
    "D10.1",
    "R2.1"
   ]
  }
 },
 {
  "id": "p10",
  "title": "Автоматический ночник",
  "level": 2,
  "xp": 220,
  "icon": "🌙",
  "short": "Фоторезистор, компаратор с гистерезисом и MOSFET-ключ.",
  "goal": "Светодиоды включаются в темноте и гаснут при свете.",
  "req": [
   "Делитель: R1 (фоторезистор) от +5V к LIGHT, R2 10k от LIGHT к GND",
   "RV1: концы на +5V и GND, движок — THRESH",
   "LM393: −IN (2) = LIGHT, +IN (3) = THRESH, выход (1) = CMP; вход B (5, 6) на GND",
   "R3 10k подтяжка CMP к +5V, R4 1 МОм между CMP и THRESH",
   "Q1 AO3400: затвор = CMP, исток = GND, сток = LED_K",
   "+5V → R5 → аноды D1, D2; катоды → LED_K"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "Без гистерезиса (R4) ночник будет мерцать в сумерках."
  ],
  "learn": [
   "Компаратор",
   "Гистерезис",
   "MOSFET-ключ"
  ],
  "kind": "project",
  "name": "p10_night_light",
  "sheetDesc": "Темнеет → сопротивление фоторезистора растёт → компаратор LM393 включает MOSFET и светодиоды.\nRV1 — порог срабатывания, R4 — гистерезис (чтобы не мерцало на границе).",
  "dir": "kicad/p10/",
  "zip": "kicad/p10.zip",
  "starter": "kicad/p10-starter.zip",
  "svg": "kicad/p10/preview.svg",
  "pdf": "kicad/p10/p10_night_light.pdf",
  "bom": "kicad/p10/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "PWR 5V",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Питание",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "GL5528",
    "sym": "R",
    "fp": "OptoDevice:R_LDR_5.1x4.3mm_P3.4mm_Vertical",
    "desc": "Фоторезистор (верхнее плечо)",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Нижнее плечо делителя",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "RV1",
    "value": "10k",
    "sym": "R_Potentiometer",
    "fp": "Potentiometer_THT:Potentiometer_Alps_RK09K_Single_Vertical",
    "desc": "Порог",
    "sym_desc": "Потенциометр",
    "pins": {
     "1": "1",
     "2": "2",
     "3": "3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "LM393",
    "sym": "LM393",
    "fp": "Package_DIP:DIP-8_W7.62mm",
    "desc": "Компаратор; B не используется",
    "sym_desc": "Сдвоенный компаратор LM393",
    "pins": {
     "3": "+INA",
     "2": "-INA",
     "5": "+INB",
     "6": "-INB",
     "1": "OUTA",
     "7": "OUTB",
     "8": "V+",
     "4": "GND"
    },
    "sym_pins": 8,
    "symmetric": false
   },
   {
    "ref": "R3",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка открытого коллектора",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R4",
    "value": "1M",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Гистерезис",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "Q1",
    "value": "AO3400A",
    "sym": "Q_NMOS_GSD",
    "fp": "Package_TO_SOT_SMD:SOT-23",
    "desc": "Ключ",
    "sym_desc": "N-MOSFET (1=G, 2=S, 3=D), корпус SOT-23",
    "pins": {
     "1": "G",
     "2": "S",
     "3": "D"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "R5",
    "value": "100",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Ток светодиодов (≈2×15 мА)",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED white",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Светодиод 1",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "D2",
    "value": "LED white",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Светодиод 2",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "R1.1",
    "RV1.1",
    "U1.8",
    "R3.1",
    "R5.1",
    "C1.1"
   ],
   "GND": [
    "J1.2",
    "R2.2",
    "RV1.3",
    "U1.5",
    "U1.6",
    "U1.4",
    "Q1.2",
    "C1.2"
   ],
   "LIGHT": [
    "R1.2",
    "R2.1",
    "U1.2"
   ],
   "THRESH": [
    "RV1.2",
    "U1.3",
    "R4.2"
   ],
   "CMP": [
    "U1.1",
    "R3.2",
    "R4.1",
    "Q1.1"
   ],
   "LED_K": [
    "Q1.3",
    "D1.1",
    "D2.1"
   ],
   "LED_A": [
    "R5.2",
    "D1.2",
    "D2.2"
   ]
  }
 },
 {
  "id": "p11",
  "title": "Зарядка Li-ion от USB-C",
  "level": 2,
  "xp": 220,
  "icon": "⚡",
  "short": "Правильный USB-C (CC-резисторы) и контроллер TP4056.",
  "goal": "Сделать зарядку аккумулятора с разъёмом USB-C и двумя индикаторами.",
  "req": [
   "J1 USB-C: все VBUS → +5V, все GND и SHIELD → GND",
   "R1/R2 5,1 кОм: CC1 и CC2 на GND",
   "TP4056: VCC и CE на +5V, TEMP и GND/EP на GND, PROG через R3 1,2 кОм на GND",
   "Индикаторы: +5V → R4 → D1 → CHRG; +5V → R5 → D2 → STDBY",
   "BAT → J2.1, C2 10 мкФ; J2.2 — GND; C1 10 мкФ на входе"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "Без резисторов 5,1 кОм на CC зарядка от кабеля USB-C–USB-C не будет получать питание."
  ],
  "learn": [
   "USB Type-C",
   "Зарядка Li-ion"
  ],
  "kind": "project",
  "name": "p11_usb_charger",
  "sheetDesc": "USB-C (5,1 кОм на CC) → TP4056 (1 А) → аккумулятор 18650/Li-pol.",
  "dir": "kicad/p11/",
  "zip": "kicad/p11.zip",
  "starter": "kicad/p11-starter.zip",
  "svg": "kicad/p11/preview.svg",
  "pdf": "kicad/p11/p11_usb_charger.pdf",
  "bom": "kicad/p11/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "USB-C",
    "sym": "USB_C_Receptacle_USB2.0",
    "fp": "Connector_USB:USB_C_Receptacle_GCT_USB4105-xx-A_16P_TopMnt_Horizontal",
    "desc": "Только питание, линии данных не используются",
    "sym_desc": "Гнездо USB-C (USB 2.0, 16 выводов)",
    "pins": {
     "A4": "VBUS",
     "A9": "VBUS",
     "B4": "VBUS",
     "B9": "VBUS",
     "A5": "CC1",
     "B5": "CC2",
     "A8": "SBU1",
     "B8": "SBU2",
     "A6": "D+",
     "B6": "D+",
     "A7": "D-",
     "B7": "D-",
     "S1": "SHIELD",
     "A1": "GND",
     "A12": "GND",
     "B1": "GND",
     "B12": "GND"
    },
    "sym_pins": 17,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "5k1",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "CC1",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "5k1",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "CC2",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C1",
    "value": "10u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Входной",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U1",
    "value": "TP4056",
    "sym": "TP4056",
    "fp": "Package_SO:SOIC-8-1EP_3.9x4.9mm_P1.27mm_EP2.41x3.3mm",
    "desc": "Зарядка",
    "sym_desc": "Зарядное Li-ion 1 А, ESOP-8",
    "pins": {
     "4": "VCC",
     "8": "CE",
     "2": "PROG",
     "1": "TEMP",
     "5": "BAT",
     "7": "~{CHRG}",
     "6": "~{STDBY}",
     "3": "GND",
     "9": "EP"
    },
    "sym_pins": 9,
    "symmetric": false
   },
   {
    "ref": "R3",
    "value": "1k2",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Ток 1 А",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R4",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Индикатор",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED red",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Заряд",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R5",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Индикатор",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D2",
    "value": "LED green",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Готово",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C2",
    "value": "10u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Выходной",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "J2",
    "value": "BAT",
    "sym": "Conn_01x02",
    "fp": "Connector_JST:JST_PH_B2B-PH-K_1x02_P2.00mm_Vertical",
    "desc": "Аккумулятор",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "J1.A4",
    "J1.A9",
    "J1.B4",
    "J1.B9",
    "C1.1",
    "U1.4",
    "U1.8",
    "R4.1",
    "R5.1"
   ],
   "CC1": [
    "J1.A5",
    "R1.1"
   ],
   "CC2": [
    "J1.B5",
    "R2.1"
   ],
   "GND": [
    "J1.A1",
    "J1.A12",
    "J1.B1",
    "J1.B12",
    "J1.S1",
    "R1.2",
    "R2.2",
    "C1.2",
    "U1.1",
    "U1.3",
    "U1.9",
    "R3.2",
    "C2.2",
    "J2.2"
   ],
   "PROG": [
    "U1.2",
    "R3.1"
   ],
   "BAT": [
    "U1.5",
    "C2.1",
    "J2.1"
   ],
   "CHRG": [
    "U1.7",
    "D1.1"
   ],
   "STDBY": [
    "U1.6",
    "D2.1"
   ],
   "LED_R": [
    "R4.2",
    "D1.2"
   ],
   "LED_G": [
    "R5.2",
    "D2.2"
   ]
  }
 },
 {
  "id": "p12",
  "title": "ШИМ-регулятор мотора",
  "level": 2,
  "xp": 200,
  "icon": "⚙️",
  "short": "Мощный MOSFET, затворные резисторы и обратный диод.",
  "goal": "Управлять скоростью мотора 12 В сигналом ШИМ от микроконтроллера.",
  "req": [
   "J1: 1 = PWM, 2 = GND",
   "PWM → R1 220 Ом → затвор Q1; R2 47k затвор–GND",
   "Q1 IRLZ44N: G = 1, D = 2 (MOT-), S = 3 (GND)",
   "D1: катод на +12V, анод на MOT-",
   "J2 (мотор): 1 = +12V, 2 = MOT-; J3 (питание): 1 = +12V, 2 = GND",
   "C1 470 мкФ на +12V"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "У TO-220 IRLZ44N порядок выводов G-D-S — не спутайте с SOT-23 (G-S-D)."
  ],
  "learn": [
   "Силовые ключи",
   "Индуктивная нагрузка"
  ],
  "kind": "project",
  "name": "p12_motor_pwm",
  "sheetDesc": "Мотор 12 В до ~5 А через логический MOSFET IRLZ44N, ШИМ от Arduino (5 В).\nD1 — обязательный обратный диод для индуктивной нагрузки.",
  "dir": "kicad/p12/",
  "zip": "kicad/p12.zip",
  "starter": "kicad/p12-starter.zip",
  "svg": "kicad/p12/preview.svg",
  "pdf": "kicad/p12/p12_motor_pwm.pdf",
  "bom": "kicad/p12/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "PWM IN",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "ШИМ от МК",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "220",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Затворный резистор",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "47k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка затвора",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "Q1",
    "value": "IRLZ44N",
    "sym": "Q_NMOS_GDS",
    "fp": "Package_TO_SOT_THT:TO-220-3_Vertical",
    "desc": "Ключ",
    "sym_desc": "N-MOSFET (1=G, 2=D, 3=S), корпус TO-220",
    "pins": {
     "1": "G",
     "2": "D",
     "3": "S"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "D1",
    "value": "1N5822",
    "sym": "D_Schottky",
    "fp": "Diode_THT:D_DO-201AD_P15.24mm_Horizontal",
    "desc": "Обратный диод Шоттки 3 А",
    "sym_desc": "Диод Шоттки",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "470u/25V",
    "sym": "C_Polarized",
    "fp": "Capacitor_THT:CP_Radial_D10.0mm_P5.00mm",
    "desc": "Накопительный",
    "sym_desc": "Полярный конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J2",
    "value": "MOTOR",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Мотор",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J3",
    "value": "12V",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Питание",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "PWM": [
    "J1.1",
    "R1.1"
   ],
   "GND": [
    "J1.2",
    "R2.2",
    "Q1.3",
    "C1.2",
    "J3.2"
   ],
   "GATE": [
    "R1.2",
    "R2.1",
    "Q1.1"
   ],
   "MOT-": [
    "Q1.2",
    "D1.2",
    "J2.2"
   ],
   "+12V": [
    "D1.1",
    "C1.1",
    "J2.1",
    "J3.1"
   ]
  }
 },
 {
  "id": "p13",
  "title": "Модуль реле с оптопарой",
  "level": 2,
  "xp": 220,
  "icon": "🔁",
  "short": "Гальваническая развязка входа, транзистор и реле.",
  "goal": "Сделать модуль реле, безопасный для выходов микроконтроллера.",
  "req": [
   "J1: 1 = +5V, 2 = IN, 3 = GND",
   "IN → R1 1k → анод оптопары (1), катод (2) → GND",
   "Коллектор оптопары (4) → +5V, эмиттер (3) → R2 2,2k → база Q1; R3 10k база–GND",
   "Q1: коллектор = COIL-, эмиттер = GND; D1 катод к +5V, анод к COIL-",
   "K1: COIL1 = +5V, COIL2 = COIL-; COM/NO/NC → J2 (1 = NO, 2 = COM, 3 = NC)",
   "Индикатор: +5V → R4 → D2 → COIL-"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "Нумерация выводов реле в заготовке условная: при разводке платы сверьте её с посадочным местом конкретного реле."
  ],
  "learn": [
   "Оптопары",
   "Реле",
   "Защитные диоды"
  ],
  "kind": "project",
  "name": "p13_relay_module",
  "sheetDesc": "Вход IN (3,3/5 В) → PC817 → BC547 → реле 5 В. Светодиод D2 показывает включение.",
  "dir": "kicad/p13/",
  "zip": "kicad/p13.zip",
  "starter": "kicad/p13-starter.zip",
  "svg": "kicad/p13/preview.svg",
  "pdf": "kicad/p13/p13_relay_module.pdf",
  "bom": "kicad/p13/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "CTRL",
    "sym": "Conn_01x03",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x03_P2.54mm_Vertical",
    "desc": "VCC, IN, GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Ток светодиода оптопары ≈ 2–4 мА",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U1",
    "value": "PC817",
    "sym": "PC817",
    "fp": "Package_DIP:DIP-4_W7.62mm",
    "desc": "Оптопара",
    "sym_desc": "Оптопара, DIP-4",
    "pins": {
     "1": "A",
     "2": "K",
     "4": "C",
     "3": "E"
    },
    "sym_pins": 4,
    "symmetric": false
   },
   {
    "ref": "R2",
    "value": "2k2",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Ток базы",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R3",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Закрывает транзистор",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "Q1",
    "value": "BC547",
    "sym": "Q_NPN_CBE",
    "fp": "Package_TO_SOT_THT:TO-92_Inline",
    "desc": "Ключ катушки",
    "sym_desc": "NPN-транзистор (1=C, 2=B, 3=E), напр. BC547",
    "pins": {
     "1": "C",
     "2": "B",
     "3": "E"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "D1",
    "value": "1N4148",
    "sym": "D",
    "fp": "Diode_THT:D_DO-35_SOD27_P7.62mm_Horizontal",
    "desc": "Защитный диод",
    "sym_desc": "Диод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "K1",
    "value": "SRD-05VDC-SL-C",
    "sym": "Relay_SPDT",
    "fp": "",
    "desc": "Реле 5 В",
    "sym_desc": "Реле с одной переключающей группой (нумерация условная — сверьте с посадочным местом вашего реле)",
    "pins": {
     "1": "COIL1",
     "2": "COIL2",
     "3": "COM",
     "4": "NC",
     "5": "NO"
    },
    "sym_pins": 5,
    "symmetric": false
   },
   {
    "ref": "R4",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Индикатор",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D2",
    "value": "LED red",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Реле включено",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J2",
    "value": "LOAD",
    "sym": "Conn_01x03",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-3_1x03_P5.08mm_Horizontal",
    "desc": "Контакты: NO, COM, NC",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3"
    },
    "sym_pins": 3,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "U1.4",
    "D1.1",
    "K1.1",
    "R4.1"
   ],
   "IN": [
    "J1.2",
    "R1.1"
   ],
   "GND": [
    "J1.3",
    "U1.2",
    "R3.2",
    "Q1.3"
   ],
   "OPTO_A": [
    "R1.2",
    "U1.1"
   ],
   "Q_DRV": [
    "U1.3",
    "R2.1"
   ],
   "Q_B": [
    "R2.2",
    "R3.1",
    "Q1.2"
   ],
   "COIL-": [
    "Q1.1",
    "D1.2",
    "K1.2",
    "D2.1"
   ],
   "COM": [
    "K1.3",
    "J2.2"
   ],
   "NC": [
    "K1.4",
    "J2.3"
   ],
   "NO": [
    "K1.5",
    "J2.1"
   ],
   "LED_A": [
    "R4.2",
    "D2.2"
   ]
  }
 },
 {
  "id": "p14",
  "title": "Сигнализатор протечки воды",
  "level": 1,
  "xp": 150,
  "icon": "💧",
  "short": "Два транзистора по схеме Дарлингтона и зуммер.",
  "goal": "Сигнализация срабатывает, когда вода замыкает щупы.",
  "req": [
   "+9V → R1 10k → щуп 1 (PROBE); щуп 2 (SENSE) → база Q1; R2 100k SENSE–GND",
   "Q1: коллектор к коллектору Q2 (Q2_C), эмиттер — к базе Q2",
   "Q2: эмиттер на GND",
   "Зуммер BZ1: + на +9V, − на Q2_C",
   "D1 через R3 1k между +9V и Q2_C",
   "J2 (батарея): 1 = +9V, 2 = GND"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "Вода проводит слабо — сотни кОм. Поэтому нужен большой коэффициент усиления двух транзисторов."
  ],
  "learn": [
   "Составной транзистор",
   "Датчики на проводимость"
  ],
  "kind": "project",
  "name": "p14_water_leak",
  "sheetDesc": "Вода замыкает щупы → составной транзистор открывается → звучит зуммер и горит светодиод.",
  "dir": "kicad/p14/",
  "zip": "kicad/p14.zip",
  "starter": "kicad/p14-starter.zip",
  "svg": "kicad/p14/preview.svg",
  "pdf": "kicad/p14/p14_water_leak.pdf",
  "bom": "kicad/p14/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "PROBES",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Щупы (дорожки-«гребёнка» или провода)",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal",
    "desc": "Ограничение тока через воду",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "100k",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal",
    "desc": "Закрывает транзисторы без воды",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "Q1",
    "value": "BC547",
    "sym": "Q_NPN_CBE",
    "fp": "Package_TO_SOT_THT:TO-92_Inline",
    "desc": "Первый транзистор (Дарлингтон)",
    "sym_desc": "NPN-транзистор (1=C, 2=B, 3=E), напр. BC547",
    "pins": {
     "1": "C",
     "2": "B",
     "3": "E"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "Q2",
    "value": "BC547",
    "sym": "Q_NPN_CBE",
    "fp": "Package_TO_SOT_THT:TO-92_Inline",
    "desc": "Второй транзистор",
    "sym_desc": "NPN-транзистор (1=C, 2=B, 3=E), напр. BC547",
    "pins": {
     "1": "C",
     "2": "B",
     "3": "E"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "BZ1",
    "value": "Buzzer active 9V",
    "sym": "Buzzer",
    "fp": "Buzzer_Beeper:Buzzer_12x9.5RM7.6",
    "desc": "Активный зуммер",
    "sym_desc": "Зуммер",
    "pins": {
     "1": "-",
     "2": "+"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R3",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal",
    "desc": "Ток светодиода",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED red",
    "sym": "LED",
    "fp": "LED_THT:LED_D5.0mm",
    "desc": "Тревога",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "J2",
    "value": "BAT 9V",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Батарея «Крона»",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "PROBE": [
    "J1.1",
    "R1.2"
   ],
   "SENSE": [
    "J1.2",
    "R2.1",
    "Q1.2"
   ],
   "+9V": [
    "R1.1",
    "BZ1.2",
    "R3.1",
    "J2.1"
   ],
   "GND": [
    "R2.2",
    "Q2.3",
    "J2.2"
   ],
   "Q2_C": [
    "Q1.1",
    "Q2.1",
    "BZ1.1",
    "D1.1"
   ],
   "Q2_B": [
    "Q1.3",
    "Q2.2"
   ],
   "LED_A": [
    "R3.2",
    "D1.2"
   ]
  }
 },
 {
  "id": "p15",
  "title": "Термореле на NTC",
  "level": 3,
  "xp": 260,
  "icon": "🌀",
  "short": "Терморезистор, компаратор с гистерезисом и реле.",
  "goal": "Включать вентилятор, когда температура превышает уставку.",
  "req": [
   "Делитель: R1 10k (+5V → TEMP), TH1 NTC 10k (TEMP → GND)",
   "RV1: концы на +5V/GND, движок = SET",
   "LM393: +IN (3) = SET, −IN (2) = TEMP, выход (1) = CMP; вход B на GND",
   "R4 10k подтяжка CMP, R5 1 МОм CMP–SET",
   "CMP → R2 4,7k → база Q1; Q1 коммутирует катушку K1 (COIL2), D1 защитный",
   "Контакты K1: COM → J2.1, NO → J2.2"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "При нагреве сопротивление NTC падает → TEMP снижается → когда TEMP < SET, выход компаратора отпускается подтяжкой вверх и включает транзистор."
  ],
  "learn": [
   "Терморезисторы",
   "Компараторы",
   "Реле"
  ],
  "kind": "project",
  "name": "p15_thermostat",
  "sheetDesc": "NTC 10k — нижнее плечо делителя: при нагреве его сопротивление и напряжение TEMP падают.\nКогда TEMP < SET — реле включает вентилятор. R5 — гистерезис.",
  "dir": "kicad/p15/",
  "zip": "kicad/p15.zip",
  "starter": "kicad/p15-starter.zip",
  "svg": "kicad/p15/preview.svg",
  "pdf": "kicad/p15/p15_thermostat.pdf",
  "bom": "kicad/p15/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "PWR 5V",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Питание",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "R1",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Верхнее плечо",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "TH1",
    "value": "NTC 10k B3950",
    "sym": "R",
    "fp": "Resistor_THT:R_Axial_DIN0204_L3.6mm_D1.6mm_P5.08mm_Horizontal",
    "desc": "Терморезистор (нижнее плечо) — при нагреве сопротивление падает",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "RV1",
    "value": "10k",
    "sym": "R_Potentiometer",
    "fp": "Potentiometer_THT:Potentiometer_Alps_RK09K_Single_Vertical",
    "desc": "Уставка температуры",
    "sym_desc": "Потенциометр",
    "pins": {
     "1": "1",
     "2": "2",
     "3": "3"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "U1",
    "value": "LM393",
    "sym": "LM393",
    "fp": "Package_DIP:DIP-8_W7.62mm",
    "desc": "Компаратор: при TEMP < SET выход отпущен (высокий уровень) — реле включено",
    "sym_desc": "Сдвоенный компаратор LM393",
    "pins": {
     "3": "+INA",
     "2": "-INA",
     "5": "+INB",
     "6": "-INB",
     "1": "OUTA",
     "7": "OUTB",
     "8": "V+",
     "4": "GND"
    },
    "sym_pins": 8,
    "symmetric": false
   },
   {
    "ref": "R4",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка выхода",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R5",
    "value": "1M",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Гистерезис",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "4k7",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Ток базы",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "Q1",
    "value": "BC547",
    "sym": "Q_NPN_CBE",
    "fp": "Package_TO_SOT_THT:TO-92_Inline",
    "desc": "Ключ",
    "sym_desc": "NPN-транзистор (1=C, 2=B, 3=E), напр. BC547",
    "pins": {
     "1": "C",
     "2": "B",
     "3": "E"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "D1",
    "value": "1N4148",
    "sym": "D",
    "fp": "Diode_THT:D_DO-35_SOD27_P7.62mm_Horizontal",
    "desc": "Защитный диод",
    "sym_desc": "Диод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "K1",
    "value": "SRD-05VDC-SL-C",
    "sym": "Relay_SPDT",
    "fp": "",
    "desc": "Реле (контакт NC не используется)",
    "sym_desc": "Реле с одной переключающей группой (нумерация условная — сверьте с посадочным местом вашего реле)",
    "pins": {
     "1": "COIL1",
     "2": "COIL2",
     "3": "COM",
     "4": "NC",
     "5": "NO"
    },
    "sym_pins": 5,
    "symmetric": false
   },
   {
    "ref": "J2",
    "value": "FAN",
    "sym": "Conn_01x02",
    "fp": "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal",
    "desc": "Коммутируемая нагрузка",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "R1.1",
    "RV1.1",
    "U1.8",
    "R4.1",
    "D1.1",
    "K1.1",
    "C1.1"
   ],
   "GND": [
    "J1.2",
    "TH1.2",
    "RV1.3",
    "U1.5",
    "U1.6",
    "U1.4",
    "Q1.3",
    "C1.2"
   ],
   "TEMP": [
    "R1.2",
    "TH1.1",
    "U1.2"
   ],
   "SET": [
    "RV1.2",
    "U1.3",
    "R5.2"
   ],
   "CMP": [
    "U1.1",
    "R4.2",
    "R5.1",
    "R2.1"
   ],
   "Q_B": [
    "R2.2",
    "Q1.2"
   ],
   "COIL-": [
    "Q1.1",
    "D1.2",
    "K1.2"
   ],
   "COM": [
    "K1.3",
    "J2.1"
   ],
   "NO": [
    "K1.5",
    "J2.2"
   ]
  }
 },
 {
  "id": "p16",
  "title": "IoT-термометр на ESP32",
  "level": 3,
  "xp": 300,
  "icon": "🌐",
  "short": "ESP32-WROOM, стабилизатор, кнопки прошивки и датчик.",
  "goal": "Сделать плату IoT-термометра, прошиваемую через USB-UART адаптер.",
  "req": [
   "J1: 1 = +5V, 2 = GND; U2 AP2112K-3.3: VIN и EN на +5V, VOUT = +3V3",
   "U1: 3V3 (2) = +3V3, все GND (1, 15, 38, 39) = GND",
   "EN: R1 10k к +3V3, C4 1 мкФ к GND, SW1 на GND",
   "IO0: R2 10k к +3V3, SW2 на GND",
   "UART: J2 1 = +3V3, 2 = TXD (вывод 35), 3 = RXD (вывод 34), 4 = GND",
   "DS18B20 на IO4 (вывод 26) с R3 4,7k; светодиод на IO2 (вывод 24) через R4 1k"
  ],
  "steps": [
   "Скачайте заготовку: в ней уже стоят все детали с нужными обозначениями, номиналами и посадочными местами.",
   "Откройте файл `.kicad_pro` в KiCad и перейдите в редактор схем.",
   "Соедините выводы проводами, метками и символами питания согласно требованиям.",
   "Запустите ERC и исправьте все ошибки.",
   "Экспортируйте netlist: **Файл → Экспорт → Список цепей** (формат KiCad) и загрузите его сюда для проверки."
  ],
  "hints": [
   "Выводы 17–22 модуля — флэш-память: оставьте их неподключёнными (флаги «не подключено»).",
   "Под антенной модуля на плате не должно быть меди."
  ],
  "learn": [
   "ESP32",
   "Режимы загрузки",
   "IoT"
  ],
  "kind": "project",
  "name": "p16_esp32_iot",
  "sheetDesc": "ESP32-WROOM + DS18B20 (IO4) + светодиод (IO2) + разъём прошивки UART.\nПитание 5 В → AP2112K-3.3.",
  "dir": "kicad/p16/",
  "zip": "kicad/p16.zip",
  "starter": "kicad/p16-starter.zip",
  "svg": "kicad/p16/preview.svg",
  "pdf": "kicad/p16/p16_esp32_iot.pdf",
  "bom": "kicad/p16/bom.csv",
  "erc": [],
  "parts": [
   {
    "ref": "J1",
    "value": "5V IN",
    "sym": "Conn_01x02",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
    "desc": "Питание 5 В",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2"
    },
    "sym_pins": 2,
    "symmetric": false
   },
   {
    "ref": "U2",
    "value": "AP2112K-3.3",
    "sym": "AP2112K-3.3",
    "fp": "Package_TO_SOT_SMD:SOT-23-5",
    "desc": "LDO",
    "sym_desc": "LDO 3,3 В 600 мА, SOT-23-5",
    "pins": {
     "1": "VIN",
     "3": "EN",
     "5": "VOUT",
     "4": "NC",
     "2": "GND"
    },
    "sym_pins": 5,
    "symmetric": false
   },
   {
    "ref": "C1",
    "value": "10u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Вход LDO",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C2",
    "value": "22u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Выход LDO",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "U1",
    "value": "ESP32-WROOM-32E",
    "sym": "ESP32-WROOM-32E",
    "fp": "RF_Module:ESP32-WROOM-32D",
    "desc": "Модуль",
    "sym_desc": "Модуль ESP32-WROOM-32E (выводы 17–22 — флэш, не подключать)",
    "pins": {
     "3": "EN",
     "4": "SENSOR_VP",
     "5": "SENSOR_VN",
     "6": "IO34",
     "7": "IO35",
     "8": "IO32",
     "9": "IO33",
     "10": "IO25",
     "11": "IO26",
     "12": "IO27",
     "13": "IO14",
     "14": "IO12",
     "16": "IO13",
     "23": "IO15",
     "25": "IO0",
     "35": "TXD0/IO1",
     "24": "IO2",
     "34": "RXD0/IO3",
     "26": "IO4",
     "29": "IO5",
     "27": "IO16",
     "28": "IO17",
     "30": "IO18",
     "31": "IO19",
     "33": "IO21",
     "36": "IO22",
     "37": "IO23",
     "17": "NC",
     "18": "NC",
     "19": "NC",
     "20": "NC",
     "21": "NC",
     "22": "NC",
     "32": "NC",
     "2": "3V3",
     "1": "GND",
     "15": "GND",
     "38": "GND",
     "39": "GND"
    },
    "sym_pins": 39,
    "symmetric": false
   },
   {
    "ref": "C3",
    "value": "100n",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Развязка модуля",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R1",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка EN",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "C4",
    "value": "1u",
    "sym": "C",
    "fp": "Capacitor_SMD:C_0805_2012Metric",
    "desc": "Задержка EN",
    "sym_desc": "Конденсатор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R2",
    "value": "10k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка IO0",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "SW1",
    "value": "EN",
    "sym": "SW_Push",
    "fp": "Button_Switch_THT:SW_PUSH_6mm",
    "desc": "Сброс",
    "sym_desc": "Кнопка без фиксации",
    "pins": {
     "1": "1",
     "2": "2"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "SW2",
    "value": "BOOT",
    "sym": "SW_Push",
    "fp": "Button_Switch_THT:SW_PUSH_6mm",
    "desc": "Прошивка",
    "sym_desc": "Кнопка без фиксации",
    "pins": {
     "1": "1",
     "2": "2"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "J2",
    "value": "UART",
    "sym": "Conn_01x04",
    "fp": "Connector_PinHeader_2.54mm:PinHeader_1x04_P2.54mm_Vertical",
    "desc": "К USB-UART адаптеру (3,3 В!): 3V3, TX модуля, RX модуля, GND",
    "sym_desc": "Разъём",
    "pins": {
     "1": "Pin_1",
     "2": "Pin_2",
     "3": "Pin_3",
     "4": "Pin_4"
    },
    "sym_pins": 4,
    "symmetric": false
   },
   {
    "ref": "U3",
    "value": "DS18B20",
    "sym": "DS18B20",
    "fp": "Package_TO_SOT_THT:TO-92_Inline",
    "desc": "Датчик температуры",
    "sym_desc": "Цифровой датчик температуры 1-Wire, TO-92",
    "pins": {
     "2": "DQ",
     "3": "VDD",
     "1": "GND"
    },
    "sym_pins": 3,
    "symmetric": false
   },
   {
    "ref": "R3",
    "value": "4k7",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Подтяжка 1-Wire",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "R4",
    "value": "1k",
    "sym": "R",
    "fp": "Resistor_SMD:R_0805_2012Metric",
    "desc": "Светодиод",
    "sym_desc": "Резистор",
    "pins": {
     "1": "~",
     "2": "~"
    },
    "sym_pins": 2,
    "symmetric": true
   },
   {
    "ref": "D1",
    "value": "LED blue",
    "sym": "LED",
    "fp": "LED_SMD:LED_0805_2012Metric",
    "desc": "Статус Wi-Fi",
    "sym_desc": "Светодиод",
    "pins": {
     "1": "K",
     "2": "A"
    },
    "sym_pins": 2,
    "symmetric": false
   }
  ],
  "nets": {
   "+5V": [
    "J1.1",
    "U2.1",
    "U2.3",
    "C1.1"
   ],
   "GND": [
    "J1.2",
    "U2.2",
    "C1.2",
    "C2.2",
    "U1.1",
    "U1.15",
    "U1.38",
    "U1.39",
    "C3.2",
    "C4.2",
    "SW1.2",
    "SW2.2",
    "J2.4",
    "U3.1",
    "D1.1"
   ],
   "+3V3": [
    "U2.5",
    "C2.1",
    "U1.2",
    "C3.1",
    "R1.1",
    "R2.1",
    "J2.1",
    "U3.3",
    "R3.1"
   ],
   "EN": [
    "U1.3",
    "R1.2",
    "C4.1",
    "SW1.1"
   ],
   "IO0": [
    "U1.25",
    "R2.2",
    "SW2.1"
   ],
   "TXD": [
    "U1.35",
    "J2.2"
   ],
   "RXD": [
    "U1.34",
    "J2.3"
   ],
   "ONEWIRE": [
    "U1.26",
    "U3.2",
    "R3.2"
   ],
   "LED": [
    "U1.24",
    "R4.1"
   ],
   "LED_A": [
    "R4.2",
    "D1.2"
   ]
  }
 }
];
