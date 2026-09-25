"""
Описания схем: шаблоны (templates) и практические проекты (projects).
Цоколёвки микросхем — по даташитам производителей.
"""
from kicadlib import (sym_R, sym_C, sym_L, sym_FB, sym_diode, sym_npn, sym_nmos, sym_pot, sym_switch,
                      sym_crystal, sym_buzzer, sym_speaker, sym_battery, sym_mic, sym_antenna, sym_conn, sym_box)
from schgen import Sheet

# ------------------------------------------------------------------
# Символы
# ------------------------------------------------------------------
S = {}
S['R'] = sym_R()
S['C'] = sym_C()
S['CP'] = sym_C('C_Polarized', True, 'Полярный конденсатор')
S['L'] = sym_L()
S['FB'] = sym_FB()
S['F'] = sym_R('Polyfuse', 'Самовосстанавливающийся предохранитель (PPTC)'); S['F'].ref = 'F'
S['D'] = sym_diode('D', 'D', 'Диод')
S['DZ'] = sym_diode('D_Zener', 'Z', 'Стабилитрон')
S['DS'] = sym_diode('D_Schottky', 'S', 'Диод Шоттки')
S['LED'] = sym_diode('LED', 'LED', 'Светодиод')
S['NPN_CBE'] = sym_npn('Q_NPN_CBE', 'CBE', desc='NPN-транзистор (1=C, 2=B, 3=E), напр. BC547')
S['NMOS_GSD'] = sym_nmos('Q_NMOS_GSD', 'GSD', desc='N-MOSFET (1=G, 2=S, 3=D), корпус SOT-23')
S['NMOS_GDS'] = sym_nmos('Q_NMOS_GDS', 'GDS', desc='N-MOSFET (1=G, 2=D, 3=S), корпус TO-220')
S['POT'] = sym_pot()
S['SW'] = sym_switch()
S['XTAL'] = sym_crystal()
S['BZ'] = sym_buzzer()
S['LS'] = sym_speaker()
S['BT'] = sym_battery()
S['MK'] = sym_mic()
S['AE'] = sym_antenna()
for n in range(1, 9):
    S['J%d' % n] = sym_conn(n)
S['J2x3'] = sym_conn(6, 2, 'Conn_02x03_Odd_Even', 'Разъём 2×3 (ISP)')

P_IN, P_OUT, P_BI, P_PAS, P_PWR, P_PWO, P_OC, P_NC = 'input', 'output', 'bidirectional', 'passive', 'power_in', 'power_out', 'open_collector', 'no_connect'

S['NE555'] = sym_box('NE555', 'U', [('2', 'TR', P_IN), ('6', 'THR', P_IN), ('4', 'R', P_IN), ('5', 'CV', P_IN)], [('3', 'Q', P_OUT), ('7', 'DIS', P_OC)],
                     [('8', 'VCC', P_PWR)], [('1', 'GND', P_PWR)], 'Таймер NE555, DIP-8', 'timer 555')
S['LM358'] = sym_box('LM358', 'U', [('3', '+INA', P_IN), ('2', '-INA', P_IN), ('5', '+INB', P_IN), ('6', '-INB', P_IN)], [('1', 'OUTA', P_OUT), ('7', 'OUTB', P_OUT)],
                     [('8', 'V+', P_PWR)], [('4', 'V-', P_PWR)], 'Сдвоенный ОУ LM358 (обе части в одном символе)', 'opamp dual', min_w=12.7)
S['LM393'] = sym_box('LM393', 'U', [('3', '+INA', P_IN), ('2', '-INA', P_IN), ('5', '+INB', P_IN), ('6', '-INB', P_IN)], [('1', 'OUTA', P_OC), ('7', 'OUTB', P_OC)],
                     [('8', 'V+', P_PWR)], [('4', 'GND', P_PWR)], 'Сдвоенный компаратор LM393', 'comparator', min_w=12.7)
S['LM386'] = sym_box('LM386', 'U', [('3', '+IN', P_IN), ('2', '-IN', P_IN), ('1', 'GAIN', P_PAS), ('8', 'GAIN', P_PAS), ('7', 'BYPASS', P_PAS)], [('5', 'OUT', P_OUT)],
                     [('6', 'VS', P_PWR)], [('4', 'GND', P_PWR)], 'Аудиоусилитель LM386', 'audio amplifier')
S['L7805'] = sym_box('L7805', 'U', [('1', 'IN', P_PWR)], [('3', 'OUT', P_PWO)], [], [('2', 'GND', P_PWR)], 'Стабилизатор 5 В, TO-220', 'regulator linear')
S['LM317'] = sym_box('LM317', 'U', [('3', 'IN', P_PWR)], [('2', 'OUT', P_PWO)], [], [('1', 'ADJ', P_IN)], 'Регулируемый стабилизатор LM317, TO-220', 'regulator adjustable')
S['AMS1117'] = sym_box('AMS1117-3.3', 'U', [('3', 'VI', P_PWR)], [('2', 'VO', P_PWO)], [], [('1', 'GND', P_PWR)], 'LDO 3,3 В, SOT-223', 'regulator ldo')
S['AP2112'] = sym_box('AP2112K-3.3', 'U', [('1', 'VIN', P_PWR), ('3', 'EN', P_IN)], [('5', 'VOUT', P_PWO), ('4', 'NC', P_NC)], [], [('2', 'GND', P_PWR)], 'LDO 3,3 В 600 мА, SOT-23-5', 'regulator ldo')
S['LM2596'] = sym_box('LM2596S-5', 'U', [('1', 'VIN', P_PWR), ('5', 'ON/OFF', P_IN)], [('2', 'OUT', P_OUT), ('4', 'FB', P_IN)], [], [('3', 'GND', P_PWR)], 'Понижающий преобразователь 5 В 3 А, TO-263-5', 'buck')
S['MT3608'] = sym_box('MT3608', 'U', [('5', 'IN', P_PWR), ('4', 'EN', P_IN)], [('1', 'SW', P_OUT), ('3', 'FB', P_IN), ('6', 'NC', P_NC)], [], [('2', 'GND', P_PWR)], 'Повышающий преобразователь, SOT-23-6', 'boost')
S['TP4056'] = sym_box('TP4056', 'U', [('4', 'VCC', P_PWR), ('8', 'CE', P_IN), ('2', 'PROG', P_PAS), ('1', 'TEMP', P_IN)], [('5', 'BAT', P_PAS), ('7', '~{CHRG}', P_OC), ('6', '~{STDBY}', P_OC)],
                      [], [('3', 'GND', P_PWR), ('9', 'EP', P_PWR)], 'Зарядное Li-ion 1 А, ESOP-8', 'charger')
S['DS18B20'] = sym_box('DS18B20', 'U', [('2', 'DQ', P_BI)], [], [('3', 'VDD', P_PWR)], [('1', 'GND', P_PWR)], 'Цифровой датчик температуры 1-Wire, TO-92', 'temperature', min_w=7.62)
S['LM75A'] = sym_box('LM75A', 'U', [('1', 'SDA', P_BI), ('2', 'SCL', P_IN), ('3', 'OS', P_OC)], [('7', 'A0', P_IN), ('6', 'A1', P_IN), ('5', 'A2', P_IN)],
                     [('8', 'VCC', P_PWR)], [('4', 'GND', P_PWR)], 'Датчик температуры I²C, SOIC-8', 'temperature i2c')
S['PC817'] = sym_box('PC817', 'U', [('1', 'A', P_PAS), ('2', 'K', P_PAS)], [('4', 'C', P_PAS), ('3', 'E', P_PAS)], [], [], 'Оптопара, DIP-4', 'optocoupler', min_w=10.16)
S['CD4017'] = sym_box('CD4017', 'U', [('14', 'CLK', P_IN), ('13', '~{EN}', P_IN), ('15', 'RST', P_IN)],
                      [('3', 'Q0', P_OUT), ('2', 'Q1', P_OUT), ('4', 'Q2', P_OUT), ('7', 'Q3', P_OUT), ('10', 'Q4', P_OUT), ('1', 'Q5', P_OUT), ('5', 'Q6', P_OUT), ('6', 'Q7', P_OUT), ('9', 'Q8', P_OUT), ('11', 'Q9', P_OUT), ('12', 'CO', P_OUT)],
                      [('16', 'VDD', P_PWR)], [('8', 'VSS', P_PWR)], 'Десятичный счётчик CD4017, DIP-16', 'counter')
S['74HC14'] = sym_box('74HC14', 'U', [('1', '1A', P_IN), ('3', '2A', P_IN), ('5', '3A', P_IN), ('9', '4A', P_IN), ('11', '5A', P_IN), ('13', '6A', P_IN)],
                      [('2', '1Y', P_OUT), ('4', '2Y', P_OUT), ('6', '3Y', P_OUT), ('8', '4Y', P_OUT), ('10', '5Y', P_OUT), ('12', '6Y', P_OUT)],
                      [('14', 'VCC', P_PWR)], [('7', 'GND', P_PWR)], '6 инверторов Шмитта, DIP-14', 'schmitt')
S['L293D'] = sym_box('L293D', 'U', [('1', 'EN12', P_IN), ('2', '1A', P_IN), ('7', '2A', P_IN), ('9', 'EN34', P_IN), ('10', '3A', P_IN), ('15', '4A', P_IN)],
                     [('3', '1Y', P_OUT), ('6', '2Y', P_OUT), ('11', '3Y', P_OUT), ('14', '4Y', P_OUT)],
                     [('16', 'VCC1', P_PWR), ('8', 'VCC2', P_PWR)], [('4', 'GND', P_PWR), ('5', 'GND', P_PWR), ('12', 'GND', P_PWR), ('13', 'GND', P_PWR)], 'Сдвоенный H-мост L293D, DIP-16', 'motor driver')
S['MAX485'] = sym_box('MAX485', 'U', [('4', 'DI', P_IN), ('3', 'DE', P_IN), ('2', '~{RE}', P_IN), ('1', 'RO', P_OUT)], [('6', 'A', P_BI), ('7', 'B', P_BI)],
                      [('8', 'VCC', P_PWR)], [('5', 'GND', P_PWR)], 'Приёмопередатчик RS-485, DIP-8', 'rs485')
S['USBLC6'] = sym_box('USBLC6-2SC6', 'U', [('1', 'IO1', P_PAS), ('3', 'IO2', P_PAS)], [('6', 'IO1', P_PAS), ('4', 'IO2', P_PAS)], [('5', 'VBUS', P_PAS)], [('2', 'GND', P_PAS)], 'ESD-защита USB, SOT-23-6', 'esd')
S['USBC'] = sym_box('USB_C_Receptacle_USB2.0', 'J', [('A4', 'VBUS', P_PAS), ('A9', 'VBUS', P_PAS), ('B4', 'VBUS', P_PAS), ('B9', 'VBUS', P_PAS), ('A5', 'CC1', P_BI), ('B5', 'CC2', P_BI), ('A8', 'SBU1', P_BI), ('B8', 'SBU2', P_BI)],
                    [('A6', 'D+', P_BI), ('B6', 'D+', P_BI), ('A7', 'D-', P_BI), ('B7', 'D-', P_BI), ('S1', 'SHIELD', P_PAS)], [],
                    [('A1', 'GND', P_PAS), ('A12', 'GND', P_PAS), ('B1', 'GND', P_PAS), ('B12', 'GND', P_PAS)], 'Гнездо USB-C (USB 2.0, 16 выводов)', 'usb type-c', min_w=15.24)
S['CH340C'] = sym_box('CH340C', 'U', [('5', 'UD+', P_BI), ('6', 'UD-', P_BI), ('9', '~{CTS}', P_IN), ('10', '~{DSR}', P_IN), ('11', '~{RI}', P_IN), ('12', '~{DCD}', P_IN), ('15', 'R232', P_IN)],
                      [('2', 'TXD', P_OUT), ('3', 'RXD', P_IN), ('13', '~{DTR}', P_OUT), ('14', '~{RTS}', P_OUT), ('7', 'NC', P_NC), ('8', 'NC', P_NC)],
                      [('16', 'VCC', P_PWR), ('4', 'V3', P_PAS)], [('1', 'GND', P_PWR)], 'Мост USB–UART CH340C, SOP-16', 'usb uart')
S['ATMEGA328P'] = sym_box('ATmega328P-P', 'U',
    [('1', 'PC6/~{RESET}', P_BI), ('9', 'PB6/XTAL1', P_BI), ('10', 'PB7/XTAL2', P_BI), ('21', 'AREF', P_PAS), ('23', 'PC0/A0', P_BI), ('24', 'PC1/A1', P_BI), ('25', 'PC2/A2', P_BI), ('26', 'PC3/A3', P_BI), ('27', 'PC4/SDA', P_BI), ('28', 'PC5/SCL', P_BI)],
    [('2', 'PD0/RXD', P_BI), ('3', 'PD1/TXD', P_BI), ('4', 'PD2', P_BI), ('5', 'PD3', P_BI), ('6', 'PD4', P_BI), ('11', 'PD5', P_BI), ('12', 'PD6', P_BI), ('13', 'PD7', P_BI), ('14', 'PB0', P_BI), ('15', 'PB1', P_BI), ('16', 'PB2', P_BI), ('17', 'PB3/MOSI', P_BI), ('18', 'PB4/MISO', P_BI), ('19', 'PB5/SCK', P_BI)],
    [('7', 'VCC', P_PWR), ('20', 'AVCC', P_PWR)], [('8', 'GND', P_PWR), ('22', 'GND', P_PWR)], 'МК ATmega328P, DIP-28', 'avr arduino')
S['ESP32'] = sym_box('ESP32-WROOM-32E', 'U',
    [('3', 'EN', P_IN), ('4', 'SENSOR_VP', P_IN), ('5', 'SENSOR_VN', P_IN), ('6', 'IO34', P_IN), ('7', 'IO35', P_IN), ('8', 'IO32', P_BI), ('9', 'IO33', P_BI), ('10', 'IO25', P_BI), ('11', 'IO26', P_BI), ('12', 'IO27', P_BI), ('13', 'IO14', P_BI), ('14', 'IO12', P_BI), ('16', 'IO13', P_BI), ('23', 'IO15', P_BI)],
    [('25', 'IO0', P_BI), ('35', 'TXD0/IO1', P_BI), ('24', 'IO2', P_BI), ('34', 'RXD0/IO3', P_BI), ('26', 'IO4', P_BI), ('29', 'IO5', P_BI), ('27', 'IO16', P_BI), ('28', 'IO17', P_BI), ('30', 'IO18', P_BI), ('31', 'IO19', P_BI), ('33', 'IO21', P_BI), ('36', 'IO22', P_BI), ('37', 'IO23', P_BI),
     ('17', 'NC', P_NC), ('18', 'NC', P_NC), ('19', 'NC', P_NC), ('20', 'NC', P_NC), ('21', 'NC', P_NC), ('22', 'NC', P_NC), ('32', 'NC', P_NC)],
    [('2', '3V3', P_PWR)], [('1', 'GND', P_PWR), ('15', 'GND', P_PWR), ('38', 'GND', P_PWR), ('39', 'GND', P_PWR)], 'Модуль ESP32-WROOM-32E (выводы 17–22 — флэш, не подключать)', 'esp32 wifi')

# ------------------------------------------------------------------
# Посадочные места (из стандартных библиотек KiCad)
# ------------------------------------------------------------------
FP = {
    'R0805': 'Resistor_SMD:R_0805_2012Metric', 'R_THT': 'Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal',
    'C0805': 'Capacitor_SMD:C_0805_2012Metric', 'C_THT': 'Capacitor_THT:C_Disc_D5.0mm_W2.5mm_P5.00mm',
    'CP5': 'Capacitor_THT:CP_Radial_D5.0mm_P2.00mm', 'CP6': 'Capacitor_THT:CP_Radial_D6.3mm_P2.50mm', 'CP8': 'Capacitor_THT:CP_Radial_D8.0mm_P3.50mm', 'CP10': 'Capacitor_THT:CP_Radial_D10.0mm_P5.00mm',
    'LED5': 'LED_THT:LED_D5.0mm', 'LED0805': 'LED_SMD:LED_0805_2012Metric', 'DO41': 'Diode_THT:D_DO-41_SOD81_P10.16mm_Horizontal', 'DO35': 'Diode_THT:D_DO-35_SOD27_P7.62mm_Horizontal', 'SMA': 'Diode_SMD:D_SMA',
    'DO201': 'Diode_THT:D_DO-201AD_P15.24mm_Horizontal', 'TO92': 'Package_TO_SOT_THT:TO-92_Inline', 'SOT23': 'Package_TO_SOT_SMD:SOT-23', 'TO220': 'Package_TO_SOT_THT:TO-220-3_Vertical',
    'DIP8': 'Package_DIP:DIP-8_W7.62mm', 'DIP14': 'Package_DIP:DIP-14_W7.62mm', 'DIP16': 'Package_DIP:DIP-16_W7.62mm', 'DIP28': 'Package_DIP:DIP-28_W7.62mm', 'DIP4': 'Package_DIP:DIP-4_W7.62mm',
    'SOIC8': 'Package_SO:SOIC-8_3.9x4.9mm_P1.27mm', 'SOP16': 'Package_SO:SOIC-16_3.9x9.9mm_P1.27mm', 'ESOP8': 'Package_SO:SOIC-8-1EP_3.9x4.9mm_P1.27mm_EP2.41x3.3mm',
    'SOT223': 'Package_TO_SOT_SMD:SOT-223-3_TabPin2', 'SOT23-5': 'Package_TO_SOT_SMD:SOT-23-5', 'SOT23-6': 'Package_TO_SOT_SMD:SOT-23-6', 'TO263-5': 'Package_TO_SOT_SMD:TO-263-5_TabPin3',
    'POT': 'Potentiometer_THT:Potentiometer_Alps_RK09K_Single_Vertical', 'SW6': 'Button_Switch_THT:SW_PUSH_6mm', 'HC49': 'Crystal:Crystal_HC49-4H_Vertical',
    'L_CD54': 'Inductor_SMD:L_Sunlord_CD54', 'L_RAD': 'Inductor_THT:L_Radial_D8.7mm_P5.00mm_Fastron_07HCP', 'FB0805': 'Inductor_SMD:L_0805_2012Metric',
    'BZ': 'Buzzer_Beeper:Buzzer_12x9.5RM7.6', 'MIC': 'Sensor_Audio:CUI_CMA-4544PF-W', 'USBC': 'Connector_USB:USB_C_Receptacle_GCT_USB4105-xx-A_16P_TopMnt_Horizontal',
    'ESP32': 'RF_Module:ESP32-WROOM-32D', 'ISP': 'Connector_PinHeader_2.54mm:PinHeader_2x03_P2.54mm_Vertical', 'TERM2': 'TerminalBlock_Phoenix:TerminalBlock_Phoenix_MKDS-1,5-2_1x02_P5.08mm_Horizontal',
    'JACK35': 'Connector_Audio:Jack_3.5mm_CUI_SJ1-3523N_Horizontal', 'WIRE_PAD': 'TestPoint:TestPoint_Pad_D2.0mm', 'SPK2': 'Connector_JST:JST_XH_B2B-XH-A_1x02_P2.50mm_Vertical',
}
def HDR(n):
    return 'Connector_PinHeader_2.54mm:PinHeader_1x%02d_P2.54mm_Vertical' % n


# ------------------------------------------------------------------
# Шаблоны
# ------------------------------------------------------------------
def t_led_basic():
    s = Sheet('led_module', 'Светодиодный модуль', 'Светодиод с токоограничивающим резистором.\nI = (5 В − 2 В) / 330 Ом ≈ 9 мА')
    s.add('J1', S['J2'], 'Conn_01x02', HDR(2), {1: '+5V', 2: 'GND'}, 'Питание 5 В: 1 = +5V, 2 = GND')
    s.add('R1', S['R'], '330', FP['R0805'], {1: '+5V', 2: 'LED_A'}, 'Ограничение тока светодиода')
    s.add('D1', S['LED'], 'LED red', FP['LED5'], {2: 'LED_A', 1: 'GND'}, 'Светодиод 5 мм')
    return s

def t_7805():
    s = Sheet('psu_7805', 'Стабилизатор 5 В на L7805', 'Вход 7–20 В, выход 5 В до ~1 А (с радиатором).\nD1 — защита от переполюсовки, D2 — индикатор.')
    s.add('J1', S['J2'], 'IN 7-20V', FP['TERM2'], {1: 'VIN_RAW', 2: 'GND'}, 'Вход: 1 = +, 2 = GND')
    s.add('D1', S['D'], '1N4007', FP['DO41'], {2: 'VIN_RAW', 1: 'VIN'}, 'Защита от переполюсовки')
    s.add('C1', S['CP'], '100u/35V', FP['CP8'], {1: 'VIN', 2: 'GND'}, 'Входной фильтр')
    s.add('C2', S['C'], '330n', FP['C0805'], {1: 'VIN', 2: 'GND'}, 'Входной конденсатор по даташиту (0,33 мкФ)')
    s.add('U1', S['L7805'], 'L7805', FP['TO220'], {1: 'VIN', 2: 'GND', 3: '+5V'}, 'Линейный стабилизатор 5 В')
    s.add('C3', S['C'], '100n', FP['C0805'], {1: '+5V', 2: 'GND'}, 'Выходной конденсатор по даташиту (0,1 мкФ)')
    s.add('C4', S['CP'], '47u/16V', FP['CP6'], {1: '+5V', 2: 'GND'}, 'Выходной накопительный')
    s.add('R1', S['R'], '1k', FP['R0805'], {1: '+5V', 2: 'PWR_LED'}, 'Ток индикатора ≈ 3 мА')
    s.add('D2', S['LED'], 'LED green', FP['LED0805'], {2: 'PWR_LED', 1: 'GND'}, 'Индикатор питания')
    s.add('J2', S['J2'], 'OUT 5V', FP['TERM2'], {1: '+5V', 2: 'GND'}, 'Выход 5 В')
    return s

def t_lm317():
    s = Sheet('psu_lm317', 'Регулируемый стабилизатор LM317', 'Uвых = 1,25 × (1 + (R2+RV1)/R1) ≈ 2,4…15 В.\nВход должен быть выше выхода минимум на 3 В.')
    s.add('J1', S['J2'], 'IN', FP['TERM2'], {1: 'VIN', 2: 'GND'}, 'Вход до 30 В')
    s.add('C1', S['C'], '100n', FP['C0805'], {1: 'VIN', 2: 'GND'}, 'Входной (по даташиту 0,1 мкФ)')
    s.add('U1', S['LM317'], 'LM317', FP['TO220'], {3: 'VIN', 2: 'VOUT', 1: 'ADJ'}, 'Регулируемый стабилизатор')
    s.add('R1', S['R'], '240', FP['R0805'], {1: 'VOUT', 2: 'ADJ'}, 'Задаёт ток делителя ≈ 5 мА')
    s.add('R2', S['R'], '220', FP['R0805'], {1: 'ADJ', 2: 'ADJ_POT'}, 'Минимальное сопротивление нижнего плеча')
    s.add('RV1', S['POT'], '2k5', FP['POT'], {1: 'ADJ_POT', 2: 'GND', 3: 'GND'}, 'Регулировка напряжения')
    s.add('C2', S['CP'], '10u', FP['CP5'], {1: 'ADJ', 2: 'GND'}, 'Подавление пульсаций на ADJ')
    s.add('D1', S['D'], '1N4007', FP['DO41'], {1: 'VIN', 2: 'VOUT'}, 'Защита при КЗ входа (разряд выходной ёмкости)')
    s.add('C3', S['CP'], '10u', FP['CP5'], {1: 'VOUT', 2: 'GND'}, 'Выходной (по даташиту ≥1 мкФ)')
    s.add('J2', S['J2'], 'OUT', FP['TERM2'], {1: 'VOUT', 2: 'GND'}, 'Выход')
    return s

def t_ams1117():
    s = Sheet('psu_3v3', 'Питание 3,3 В на AMS1117', 'Стабилизатор 5 → 3,3 В до ~800 мА (с учётом нагрева).')
    s.add('J1', S['J2'], '5V IN', HDR(2), {1: '+5V', 2: 'GND'}, 'Вход 5 В')
    s.add('C1', S['C'], '10u', FP['C0805'], {1: '+5V', 2: 'GND'}, 'Входной')
    s.add('U1', S['AMS1117'], 'AMS1117-3.3', FP['SOT223'], {3: '+5V', 1: 'GND', 2: '+3V3'}, 'LDO 3,3 В')
    s.add('C2', S['CP'], '22u', FP['CP5'], {1: '+3V3', 2: 'GND'}, 'Выходной (AMS1117 любит ESR 0,1–10 Ом → электролит/тантал)')
    s.add('C3', S['C'], '100n', FP['C0805'], {1: '+3V3', 2: 'GND'}, 'ВЧ-развязка')
    s.add('R1', S['R'], '1k', FP['R0805'], {1: '+3V3', 2: 'LED_3V3'}, 'Индикатор')
    s.add('D1', S['LED'], 'LED green', FP['LED0805'], {2: 'LED_3V3', 1: 'GND'}, 'Индикатор 3,3 В')
    s.add('J2', S['J2'], '3V3 OUT', HDR(2), {1: '+3V3', 2: 'GND'}, 'Выход 3,3 В')
    return s

def t_lm2596():
    s = Sheet('buck_lm2596', 'Понижающий преобразователь 5 В / 3 А (LM2596-5.0)', 'Вход 7–40 В → 5 В. Компоненты по типовой схеме даташита.\nДорожки VIN, SW (OUT), диод и C1 — короткими и широкими!')
    s.add('J1', S['J2'], 'IN 7-40V', FP['TERM2'], {1: 'VIN', 2: 'GND'}, 'Вход')
    s.add('C1', S['CP'], '470u/50V', FP['CP10'], {1: 'VIN', 2: 'GND'}, 'Входной low-ESR')
    s.add('U1', S['LM2596'], 'LM2596S-5.0', FP['TO263-5'], {1: 'VIN', 5: 'GND', 2: 'SW', 4: '+5V', 3: 'GND'}, 'ON/OFF на GND = включён')
    s.add('D1', S['DS'], '1N5822', FP['DO201'], {1: 'SW', 2: 'GND'}, 'Диод Шоттки 3 А 40 В')
    s.add('L1', S['L'], '33u 3A', FP['L_RAD'], {1: 'SW', 2: '+5V'}, 'Дроссель с током насыщения ≥ 3,5 А')
    s.add('C2', S['CP'], '220u/16V', FP['CP8'], {1: '+5V', 2: 'GND'}, 'Выходной low-ESR')
    s.add('J2', S['J2'], 'OUT 5V', FP['TERM2'], {1: '+5V', 2: 'GND'}, 'Выход')
    return s

def t_mt3608():
    s = Sheet('boost_mt3608', 'Повышающий преобразователь 3,7 → 5 В (MT3608)', 'Uвых = 0,6 × (1 + R1/R2) = 0,6 × (1 + 73,2k/10k) ≈ 5,0 В.\nВыходной ток до ~0,5–1 А в зависимости от входа.')
    s.add('J1', S['J2'], 'BAT', HDR(2), {1: '+BATT', 2: 'GND'}, 'Вход 2–5 В (Li-ion)')
    s.add('C1', S['C'], '22u', FP['C0805'], {1: '+BATT', 2: 'GND'}, 'Входной')
    s.add('L1', S['L'], '22u', FP['L_CD54'], {1: '+BATT', 2: 'SW'}, 'Силовой дроссель')
    s.add('U1', S['MT3608'], 'MT3608', FP['SOT23-6'], {5: '+BATT', 4: '+BATT', 1: 'SW', 3: 'FB', 2: 'GND'}, 'EN подключён к входу — всегда включён')
    s.add('D1', S['DS'], 'SS34', FP['SMA'], {2: 'SW', 1: '+5V'}, 'Шоттки')
    s.add('R1', S['R'], '73k2', FP['R0805'], {1: '+5V', 2: 'FB'}, 'Верхнее плечо делителя')
    s.add('R2', S['R'], '10k', FP['R0805'], {1: 'FB', 2: 'GND'}, 'Нижнее плечо делителя')
    s.add('C2', S['C'], '22u', FP['C0805'], {1: '+5V', 2: 'GND'}, 'Выходной')
    s.add('J2', S['J2'], 'OUT 5V', HDR(2), {1: '+5V', 2: 'GND'}, 'Выход')
    return s

def t_tp4056():
    s = Sheet('charger_tp4056', 'Зарядка Li-ion на TP4056', 'Ток заряда 1 А (R1 = 1,2 кОм). Красный — заряд, зелёный — заряжено.\nЗащиту аккумулятора (DW01A) добавьте отдельно, если её нет в самом аккумуляторе.')
    s.add('J1', S['J2'], '5V IN', HDR(2), {1: '+5V', 2: 'GND'}, 'Вход 5 В')
    s.add('C1', S['C'], '10u', FP['C0805'], {1: '+5V', 2: 'GND'}, 'Входной')
    s.add('U1', S['TP4056'], 'TP4056', FP['ESOP8'], {4: '+5V', 8: '+5V', 2: 'PROG', 1: 'GND', 5: 'BAT', 7: 'CHRG', 6: 'STDBY', 3: 'GND', 9: 'GND'}, 'TEMP на GND — термодатчик не используется')
    s.add('R1', S['R'], '1k2', FP['R0805'], {1: 'PROG', 2: 'GND'}, 'Задаёт ток 1 А')
    s.add('R2', S['R'], '1k', FP['R0805'], {1: '+5V', 2: 'LED_R'}, 'Ток индикатора')
    s.add('D1', S['LED'], 'LED red', FP['LED0805'], {2: 'LED_R', 1: 'CHRG'}, 'Идёт заряд')
    s.add('R3', S['R'], '1k', FP['R0805'], {1: '+5V', 2: 'LED_G'}, 'Ток индикатора')
    s.add('D2', S['LED'], 'LED green', FP['LED0805'], {2: 'LED_G', 1: 'STDBY'}, 'Заряд окончен')
    s.add('C2', S['C'], '10u', FP['C0805'], {1: 'BAT', 2: 'GND'}, 'Выходной')
    s.add('J2', S['J2'], 'BATTERY', 'Connector_JST:JST_PH_B2B-PH-K_1x02_P2.00mm_Vertical', {1: 'BAT', 2: 'GND'}, 'Аккумулятор 3,7 В')
    return s

def t_rc_lowpass():
    s = Sheet('rc_lowpass', 'RC-фильтр нижних частот', 'fср = 1 / (2π·R·C) = 1 / (2π · 1 кОм · 100 нФ) ≈ 1,59 кГц')
    s.add('J1', S['J2'], 'IN', HDR(2), {1: 'IN', 2: 'GND'}, 'Вход сигнала')
    s.add('R1', S['R'], '1k', FP['R0805'], {1: 'IN', 2: 'OUT'}, 'Последовательное сопротивление')
    s.add('C1', S['C'], '100n', FP['C0805'], {1: 'OUT', 2: 'GND'}, 'Шунтирующий конденсатор')
    s.add('J2', S['J2'], 'OUT', HDR(2), {1: 'OUT', 2: 'GND'}, 'Выход')
    return s

def t_rc_highpass():
    s = Sheet('rc_highpass', 'RC-фильтр верхних частот', 'fср = 1 / (2π·R·C) = 1 / (2π · 10 кОм · 100 нФ) ≈ 159 Гц.\nЗаодно убирает постоянную составляющую.')
    s.add('J1', S['J2'], 'IN', HDR(2), {1: 'IN', 2: 'GND'}, 'Вход')
    s.add('C1', S['C'], '100n', FP['C0805'], {1: 'IN', 2: 'OUT'}, 'Разделительный конденсатор')
    s.add('R1', S['R'], '10k', FP['R0805'], {1: 'OUT', 2: 'GND'}, 'Резистор на землю')
    s.add('J2', S['J2'], 'OUT', HDR(2), {1: 'OUT', 2: 'GND'}, 'Выход')
    return s

def t_sallen_key():
    s = Sheet('sallen_key_lpf', 'Активный ФНЧ 2-го порядка (Саллен–Ки) на LM358', 'Однополярное питание 5–12 В, виртуальная земля VREF = VCC/2.\nf ≈ 1/(2π·R·√(C1·C2)) ≈ 1,07 кГц, Q ≈ 0,74. Второй ОУ — буфер VREF.')
    s.add('J1', S['J3'], 'PWR/IN', HDR(3), {1: '+12V', 2: 'IN', 3: 'GND'}, '1 = +12V, 2 = вход, 3 = GND')
    s.add('C5', S['C'], '1u', FP['C0805'], {1: 'IN', 2: 'IN_AC'}, 'Разделительный')
    s.add('R5', S['R'], '100k', FP['R0805'], {1: 'IN_AC', 2: 'VREF'}, 'Смещение входа на VREF')
    s.add('R1', S['R'], '10k', FP['R0805'], {1: 'IN_AC', 2: 'N1'}, 'R первого звена')
    s.add('R2', S['R'], '10k', FP['R0805'], {1: 'N1', 2: 'N2'}, 'R второго звена')
    s.add('C1', S['C'], '22n', FP['C0805'], {1: 'N1', 2: 'OUT'}, 'Конденсатор обратной связи')
    s.add('C2', S['C'], '10n', FP['C0805'], {1: 'N2', 2: 'VREF'}, 'Конденсатор на опору')
    s.add('U1', S['LM358'], 'LM358', FP['DIP8'], {3: 'N2', 2: 'OUT', 1: 'OUT', 5: 'VDIV', 6: 'VREF', 7: 'VREF', 8: '+12V', 4: 'GND'}, 'A — фильтр, B — буфер VREF')
    s.add('R3', S['R'], '10k', FP['R0805'], {1: '+12V', 2: 'VDIV'}, 'Делитель VCC/2')
    s.add('R4', S['R'], '10k', FP['R0805'], {1: 'VDIV', 2: 'GND'}, 'Делитель VCC/2')
    s.add('C3', S['CP'], '10u', FP['CP5'], {1: 'VDIV', 2: 'GND'}, 'Фильтр делителя')
    s.add('C4', S['C'], '100n', FP['C0805'], {1: '+12V', 2: 'GND'}, 'Развязка питания ОУ')
    s.add('J2', S['J2'], 'OUT', HDR(2), {1: 'OUT', 2: 'VREF'}, 'Выход относительно VREF')
    return s

def t_noninv():
    s = Sheet('opamp_noninv', 'Неинвертирующий усилитель на LM358', 'K = 1 + R2/R1 = 1 + 100k/10k = 11. Для сигналов от датчиков (0…0,3 В → 0…3,3 В).\nВторой ОУ не используется: включён повторителем с входом на GND.')
    s.add('J1', S['J3'], 'SENSOR', HDR(3), {1: '+5V', 2: 'IN', 3: 'GND'}, '1 = +5V, 2 = вход, 3 = GND')
    s.add('R3', S['R'], '1k', FP['R0805'], {1: 'IN', 2: 'IN_F'}, 'Фильтр/защита входа')
    s.add('C2', S['C'], '100n', FP['C0805'], {1: 'IN_F', 2: 'GND'}, 'Фильтр входа')
    s.add('U1', S['LM358'], 'LM358', FP['SOIC8'], {3: 'IN_F', 2: 'FB', 1: 'OUT', 5: 'GND', 6: 'UNUSED_OUT', 7: 'UNUSED_OUT', 8: '+5V', 4: 'GND'}, 'Однополярное питание')
    s.add('R1', S['R'], '10k', FP['R0805'], {1: 'FB', 2: 'GND'}, 'R1')
    s.add('R2', S['R'], '100k', FP['R0805'], {1: 'OUT', 2: 'FB'}, 'R2 обратной связи')
    s.add('C1', S['C'], '100n', FP['C0805'], {1: '+5V', 2: 'GND'}, 'Развязка')
    s.add('J2', S['J2'], 'OUT', HDR(2), {1: 'OUT', 2: 'GND'}, 'Выход на АЦП')
    return s

def t_lm386():
    s = Sheet('amp_lm386', 'Усилитель звука на LM386', 'Усиление 20 (выводы 1–8 свободны). Питание 5–12 В, динамик 8 Ом.\nRV1 — регулятор громкости (логарифмический).')
    s.add('J1', S['J3'], 'AUDIO IN', HDR(3), {1: 'IN_L', 2: 'IN_R', 3: 'GND'}, 'Линейный вход (L+R смешиваются резисторами)')
    s.add('R1', S['R'], '10k', FP['R0805'], {1: 'IN_L', 2: 'MIX'}, 'Смешение левого')
    s.add('R2', S['R'], '10k', FP['R0805'], {1: 'IN_R', 2: 'MIX'}, 'Смешение правого')
    s.add('RV1', S['POT'], 'A10k', FP['POT'], {1: 'MIX', 3: 'GND', 2: 'VOL'}, 'Громкость')
    s.add('U1', S['LM386'], 'LM386', FP['DIP8'], {3: 'VOL', 2: 'GND', 6: '+9V', 4: 'GND', 5: 'AMP_OUT', 7: 'BYP'}, 'Усилитель')
    s.add('C1', S['CP'], '10u', FP['CP5'], {1: 'BYP', 2: 'GND'}, 'Bypass (подавление пульсаций)')
    s.add('C2', S['C'], '47n', FP['C0805'], {1: 'AMP_OUT', 2: 'ZOB'}, 'Цепь Зобеля')
    s.add('R3', S['R'], '10', FP['R0805'], {1: 'ZOB', 2: 'GND'}, 'Цепь Зобеля')
    s.add('C3', S['CP'], '220u/16V', FP['CP8'], {1: 'AMP_OUT', 2: 'SPK+'}, 'Разделительный выходной')
    s.add('C4', S['CP'], '100u/16V', FP['CP6'], {1: '+9V', 2: 'GND'}, 'Фильтр питания')
    s.add('C5', S['C'], '100n', FP['C0805'], {1: '+9V', 2: 'GND'}, 'Развязка')
    s.add('J2', S['J2'], 'SPEAKER', FP['SPK2'], {1: 'SPK+', 2: 'GND'}, 'Динамик 8 Ом')
    s.add('J3', S['J2'], 'PWR 9V', HDR(2), {1: '+9V', 2: 'GND'}, 'Питание')
    return s

def t_555_astable():
    s = Sheet('ne555_astable', 'Мигалка на NE555', 'f = 1,44 / ((R1 + 2·R2)·C1) = 1,44 / (146 кОм · 10 мкФ) ≈ 1 Гц')
    s.add('J1', S['J2'], '5-12V', HDR(2), {1: '+5V', 2: 'GND'}, 'Питание')
    s.add('U1', S['NE555'], 'NE555', FP['DIP8'], {8: '+5V', 4: '+5V', 1: 'GND', 7: 'DIS', 6: 'TH', 2: 'TH', 3: 'OUT', 5: 'CV'}, 'Таймер в автоколебательном режиме')
    s.add('R1', S['R'], '10k', FP['R_THT'], {1: '+5V', 2: 'DIS'}, 'R1')
    s.add('R2', S['R'], '68k', FP['R_THT'], {1: 'DIS', 2: 'TH'}, 'R2')
    s.add('C1', S['CP'], '10u', FP['CP5'], {1: 'TH', 2: 'GND'}, 'Времязадающий')
    s.add('C2', S['C'], '10n', FP['C_THT'], {1: 'CV', 2: 'GND'}, 'Фильтр вывода CV')
    s.add('C3', S['C'], '100n', FP['C_THT'], {1: '+5V', 2: 'GND'}, 'Развязка питания')
    s.add('R3', S['R'], '330', FP['R_THT'], {1: 'OUT', 2: 'LED_A'}, 'Ток светодиода')
    s.add('D1', S['LED'], 'LED', FP['LED5'], {2: 'LED_A', 1: 'GND'}, 'Мигающий светодиод')
    return s

def t_555_mono():
    s = Sheet('ne555_monostable', 'Одновибратор на NE555 (таймер по кнопке)', 't = 1,1·R1·C1 = 1,1 · 100 кОм · 47 мкФ ≈ 5,2 с.\nКнопка запускает импульс, зуммер/нагрузка работает t секунд.')
    s.add('J1', S['J2'], '5V', HDR(2), {1: '+5V', 2: 'GND'}, 'Питание')
    s.add('U1', S['NE555'], 'NE555', FP['DIP8'], {8: '+5V', 4: '+5V', 1: 'GND', 2: 'TRIG', 6: 'TH', 7: 'TH', 3: 'OUT', 5: 'CV'}, 'Ждущий режим')
    s.add('R2', S['R'], '10k', FP['R_THT'], {1: '+5V', 2: 'TRIG'}, 'Подтяжка входа запуска')
    s.add('SW1', S['SW'], 'START', FP['SW6'], {1: 'TRIG', 2: 'GND'}, 'Запуск')
    s.add('R1', S['R'], '100k', FP['R_THT'], {1: '+5V', 2: 'TH'}, 'Времязадающий')
    s.add('C1', S['CP'], '47u', FP['CP5'], {1: 'TH', 2: 'GND'}, 'Времязадающий')
    s.add('C2', S['C'], '10n', FP['C_THT'], {1: 'CV', 2: 'GND'}, 'Фильтр CV')
    s.add('C3', S['C'], '100n', FP['C_THT'], {1: '+5V', 2: 'GND'}, 'Развязка')
    s.add('BZ1', S['BZ'], 'Buzzer active', FP['BZ'], {2: 'OUT', 1: 'GND'}, 'Активный зуммер до 100 мА')
    return s

def t_schmitt_osc():
    s = Sheet('hc14_oscillator', 'RC-генератор на 74HC14', 'Генератор на инверторе с триггером Шмитта: f ≈ 1 / (0,8·R·C) ≈ 1,2 кГц (зависит от питания и порогов).\nОстальные входы заземлены — у КМОП нельзя оставлять входы свободными.')
    s.add('J1', S['J3'], 'PWR/OUT', HDR(3), {1: '+5V', 2: 'CLK_OUT', 3: 'GND'}, '1 = +5V, 2 = выход, 3 = GND')
    s.add('U1', S['74HC14'], '74HC14', FP['DIP14'], {1: 'OSC', 2: 'OSC_FB', 3: 'OSC_FB', 4: 'CLK_OUT', 5: 'GND', 9: 'GND', 11: 'GND', 13: 'GND', 14: '+5V', 7: 'GND'}, 'Инвертор 1 — генератор, 2 — буфер')
    s.add('R1', S['R'], '100k', FP['R0805'], {1: 'OSC_FB', 2: 'OSC'}, 'Обратная связь')
    s.add('C1', S['C'], '10n', FP['C0805'], {1: 'OSC', 2: 'GND'}, 'Времязадающий')
    s.add('C2', S['C'], '100n', FP['C0805'], {1: '+5V', 2: 'GND'}, 'Развязка')
    return s

def t_npn_relay():
    s = Sheet('relay_driver', 'Управление реле от микроконтроллера', 'Логический вход 3,3/5 В → NPN BC547 → катушка реле 5 В (~70 мА).\nD1 гасит ЭДС самоиндукции катушки — без него транзистор выйдет из строя.')
    s.add('J1', S['J3'], 'CTRL', HDR(3), {1: '+5V', 2: 'IN', 3: 'GND'}, '1 = +5V, 2 = сигнал, 3 = GND')
    s.add('R1', S['R'], '1k', FP['R0805'], {1: 'IN', 2: 'BASE'}, 'Ток базы ≈ 3–4 мА')
    s.add('R2', S['R'], '10k', FP['R0805'], {1: 'BASE', 2: 'GND'}, 'Закрывает транзистор при отключённом входе')
    s.add('Q1', S['NPN_CBE'], 'BC547', FP['TO92'], {1: 'COIL-', 2: 'BASE', 3: 'GND'}, 'Ключ')
    s.add('D1', S['D'], '1N4148', FP['DO35'], {1: '+5V', 2: 'COIL-'}, 'Защитный диод (катод к +5V)')
    s.add('K1', S['J2'], 'Relay coil', HDR(2), {1: '+5V', 2: 'COIL-'}, 'Катушка реле (или модуль реле)')
    s.add('R3', S['R'], '1k', FP['R0805'], {1: '+5V', 2: 'LED_A'}, 'Индикатор')
    s.add('D2', S['LED'], 'LED', FP['LED0805'], {2: 'LED_A', 1: 'COIL-'}, 'Горит при включённом реле')
    return s

def t_mosfet_load():
    s = Sheet('mosfet_switch', 'Ключ нагрузки 12 В на MOSFET', 'Логический MOSFET AO3400 управляет лентой/мотором до ~3 А от выхода 3,3 В.\nR2 держит транзистор закрытым при старте МК.')
    s.add('J1', S['J2'], 'CTRL', HDR(2), {1: 'PWM', 2: 'GND'}, 'Вход ШИМ от МК: 1 = сигнал, 2 = GND')
    s.add('R1', S['R'], '100', FP['R0805'], {1: 'PWM', 2: 'GATE'}, 'Ограничение тока заряда затвора')
    s.add('R2', S['R'], '100k', FP['R0805'], {1: 'GATE', 2: 'GND'}, 'Подтяжка затвора к земле')
    s.add('Q1', S['NMOS_GSD'], 'AO3400A', FP['SOT23'], {1: 'GATE', 2: 'GND', 3: 'LOAD-'}, 'N-MOSFET, Rds ≈ 30 мОм')
    s.add('D1', S['DS'], 'SS34', FP['SMA'], {1: '+12V', 2: 'LOAD-'}, 'Для индуктивной нагрузки (мотор)')
    s.add('J2', S['J2'], 'LOAD', FP['TERM2'], {1: '+12V', 2: 'LOAD-'}, 'Нагрузка')
    s.add('J3', S['J2'], '12V IN', FP['TERM2'], {1: '+12V', 2: 'GND'}, 'Питание нагрузки')
    s.add('C1', S['CP'], '100u/25V', FP['CP6'], {1: '+12V', 2: 'GND'}, 'Фильтр питания')
    return s

def t_level_shifter():
    s = Sheet('i2c_level_shifter', 'Преобразователь уровней I²C 3,3 ↔ 5 В', 'Классическая схема на BSS138 (AN10441): двунаправленная, для I²C до 400 кГц.')
    s.add('J1', S['J4'], 'LV 3V3', HDR(4), {1: '+3V3', 2: 'SDA_LV', 3: 'SCL_LV', 4: 'GND'}, 'Сторона 3,3 В')
    s.add('J2', S['J4'], 'HV 5V', HDR(4), {1: '+5V', 2: 'SDA_HV', 3: 'SCL_HV', 4: 'GND'}, 'Сторона 5 В')
    s.add('Q1', S['NMOS_GSD'], 'BSS138', FP['SOT23'], {1: '+3V3', 2: 'SDA_LV', 3: 'SDA_HV'}, 'Канал SDA')
    s.add('Q2', S['NMOS_GSD'], 'BSS138', FP['SOT23'], {1: '+3V3', 2: 'SCL_LV', 3: 'SCL_HV'}, 'Канал SCL')
    s.add('R1', S['R'], '10k', FP['R0805'], {1: '+3V3', 2: 'SDA_LV'}, 'Подтяжка LV')
    s.add('R2', S['R'], '10k', FP['R0805'], {1: '+3V3', 2: 'SCL_LV'}, 'Подтяжка LV')
    s.add('R3', S['R'], '10k', FP['R0805'], {1: '+5V', 2: 'SDA_HV'}, 'Подтяжка HV')
    s.add('R4', S['R'], '10k', FP['R0805'], {1: '+5V', 2: 'SCL_HV'}, 'Подтяжка HV')
    return s

def t_usbc_power():
    s = Sheet('usb_c_power', 'Питание 5 В от USB Type-C', 'R1/R2 = 5,1 кОм на CC1/CC2 — «я потребитель», иначе кабель C–C не даст питание.\nF1 — защита от КЗ, U1 — ESD-защита.')
    s.add('J1', S['USBC'], 'USB-C', FP['USBC'], {'A4': 'VBUS', 'A9': 'VBUS', 'B4': 'VBUS', 'B9': 'VBUS', 'A5': 'CC1', 'B5': 'CC2', 'A6': 'D+', 'B6': 'D+', 'A7': 'D-', 'B7': 'D-',
                                               'A1': 'GND', 'A12': 'GND', 'B1': 'GND', 'B12': 'GND', 'S1': 'GND'}, 'Гнездо USB-C 16 pin')
    s.add('R1', S['R'], '5k1', FP['R0805'], {1: 'CC1', 2: 'GND'}, 'Rd на CC1')
    s.add('R2', S['R'], '5k1', FP['R0805'], {1: 'CC2', 2: 'GND'}, 'Rd на CC2')
    s.add('U1', S['USBLC6'], 'USBLC6-2SC6', FP['SOT23-6'], {1: 'D+', 6: 'D+', 3: 'D-', 4: 'D-', 5: 'VBUS', 2: 'GND'}, 'ESD-защита линий данных')
    s.add('F1', S['F'], '500mA PTC', 'Fuse:Fuse_1206_3216Metric', {1: 'VBUS', 2: '+5V'}, 'Самовосстанавливающийся предохранитель')
    s.add('C1', S['C'], '10u', FP['C0805'], {1: '+5V', 2: 'GND'}, 'Фильтр')
    s.add('R3', S['R'], '1k', FP['R0805'], {1: '+5V', 2: 'LED_A'}, 'Индикатор')
    s.add('D1', S['LED'], 'LED', FP['LED0805'], {2: 'LED_A', 1: 'GND'}, 'Питание есть')
    s.add('J2', S['J4'], 'OUT', HDR(4), {1: '+5V', 2: 'D+', 3: 'D-', 4: 'GND'}, 'Выход 5 В и линии USB')
    return s

def t_arduino_min():
    s = Sheet('arduino_minimal', 'Минимальная Arduino-совместимая схема на ATmega328P', 'Кварц 16 МГц, сброс, ISP-разъём, UART-разъём с автосбросом (DTR через 100 нФ), светодиод на D13 (PB5).\nЗагрузчик Arduino прошивается через ISP.')
    s.add('U1', S['ATMEGA328P'], 'ATmega328P-PU', FP['DIP28'],
          {7: '+5V', 20: '+5V', 8: 'GND', 22: 'GND', 1: 'RESET', 9: 'XTAL1', 10: 'XTAL2', 21: 'AREF', 2: 'RXD', 3: 'TXD', 17: 'MOSI', 18: 'MISO', 19: 'SCK'}, 'Микроконтроллер')
    s.add('Y1', S['XTAL'], '16MHz', FP['HC49'], {1: 'XTAL1', 2: 'XTAL2'}, 'Кварц')
    s.add('C1', S['C'], '22p', FP['C0805'], {1: 'XTAL1', 2: 'GND'}, 'Нагрузочный')
    s.add('C2', S['C'], '22p', FP['C0805'], {1: 'XTAL2', 2: 'GND'}, 'Нагрузочный')
    s.add('C3', S['C'], '100n', FP['C0805'], {1: '+5V', 2: 'GND'}, 'Развязка VCC')
    s.add('C4', S['C'], '100n', FP['C0805'], {1: '+5V', 2: 'GND'}, 'Развязка AVCC')
    s.add('C5', S['C'], '100n', FP['C0805'], {1: 'AREF', 2: 'GND'}, 'Фильтр AREF')
    s.add('R1', S['R'], '10k', FP['R0805'], {1: '+5V', 2: 'RESET'}, 'Подтяжка RESET')
    s.add('SW1', S['SW'], 'RESET', FP['SW6'], {1: 'RESET', 2: 'GND'}, 'Кнопка сброса')
    s.add('C6', S['C'], '100n', FP['C0805'], {1: 'DTR', 2: 'RESET'}, 'Автосброс от DTR')
    s.add('J1', S['J2x3'], 'ISP', FP['ISP'], {1: 'MISO', 2: '+5V', 3: 'SCK', 4: 'MOSI', 5: 'RESET', 6: 'GND'}, 'Программирование (стандарт AVR ISP)')
    s.add('J2', S['J6'], 'UART', HDR(6), {1: 'GND', 2: 'GND', 3: '+5V', 4: 'RXD', 5: 'TXD', 6: 'DTR'}, 'FTDI-совместимый: GND, CTS, VCC, TXD→RX, RXD, DTR')
    s.add('R2', S['R'], '330', FP['R0805'], {1: 'SCK', 2: 'LED_A'}, 'Светодиод D13')
    s.add('D1', S['LED'], 'LED', FP['LED0805'], {2: 'LED_A', 1: 'GND'}, '«Blink»')
    return s

def t_esp32_min():
    s = Sheet('esp32_minimal', 'Минимальная плата ESP32-WROOM с USB (CH340C)', 'Питание от USB через AP2112K-3.3, автозагрузка: DTR/RTS → EN/IO0 через два транзистора.\nПод антенной модуля — никакой меди!')
    s.add('J1', S['J4'], 'USB', HDR(4), {1: '+5V', 2: 'USB_D-', 3: 'USB_D+', 4: 'GND'}, 'Линии USB (или подключите USB-C по шаблону «Питание от USB Type-C»)')
    s.add('U2', S['AP2112'], 'AP2112K-3.3', FP['SOT23-5'], {1: '+5V', 3: '+5V', 5: '+3V3', 2: 'GND'}, 'LDO 3,3 В 600 мА')
    s.add('C1', S['C'], '10u', FP['C0805'], {1: '+5V', 2: 'GND'}, 'Вход LDO')
    s.add('C2', S['C'], '22u', FP['C0805'], {1: '+3V3', 2: 'GND'}, 'Выход LDO / пики ESP32')
    s.add('C3', S['C'], '100n', FP['C0805'], {1: '+3V3', 2: 'GND'}, 'Развязка модуля')
    s.add('U3', S['CH340C'], 'CH340C', FP['SOP16'], {16: '+3V3', 4: '+3V3', 1: 'GND', 5: 'USB_D+', 6: 'USB_D-', 2: 'U_TXD', 3: 'U_RXD', 13: 'DTR', 14: 'RTS'}, 'USB–UART при питании 3,3 В: V3 соединён с VCC')
    s.add('C4', S['C'], '100n', FP['C0805'], {1: '+3V3', 2: 'GND'}, 'Развязка CH340C')
    s.add('U1', S['ESP32'], 'ESP32-WROOM-32E', FP['ESP32'], {2: '+3V3', 1: 'GND', 15: 'GND', 38: 'GND', 39: 'GND', 3: 'EN', 25: 'IO0', 35: 'U_RXD', 34: 'U_TXD', 24: 'LED'}, 'Модуль')
    s.add('R1', S['R'], '10k', FP['R0805'], {1: '+3V3', 2: 'EN'}, 'Подтяжка EN')
    s.add('C5', S['C'], '1u', FP['C0805'], {1: 'EN', 2: 'GND'}, 'Задержка старта EN')
    s.add('R2', S['R'], '10k', FP['R0805'], {1: '+3V3', 2: 'IO0'}, 'Подтяжка IO0')
    s.add('SW1', S['SW'], 'EN', FP['SW6'], {1: 'EN', 2: 'GND'}, 'Сброс')
    s.add('SW2', S['SW'], 'BOOT', FP['SW6'], {1: 'IO0', 2: 'GND'}, 'Режим прошивки')
    s.add('Q1', S['NPN_CBE'], 'BC817', FP['SOT23'], {1: 'EN', 2: 'QB1', 3: 'RTS'}, 'Автосброс')
    s.add('Q2', S['NPN_CBE'], 'BC817', FP['SOT23'], {1: 'IO0', 2: 'QB2', 3: 'DTR'}, 'Автозагрузка')
    s.add('R3', S['R'], '10k', FP['R0805'], {1: 'DTR', 2: 'QB1'}, 'База Q1')
    s.add('R4', S['R'], '10k', FP['R0805'], {1: 'RTS', 2: 'QB2'}, 'База Q2')
    s.add('R5', S['R'], '1k', FP['R0805'], {1: 'LED', 2: 'LED_A'}, 'Светодиод на IO2')
    s.add('D1', S['LED'], 'LED', FP['LED0805'], {2: 'LED_A', 1: 'GND'}, 'Индикатор')
    return s

def t_ds18b20():
    s = Sheet('ds18b20_sensor', 'Датчик температуры DS18B20', 'Шина 1-Wire: подтяжка 4,7 кОм к питанию. На одну линию можно повесить несколько датчиков.')
    s.add('J1', S['J3'], '1-Wire', HDR(3), {1: '+5V', 2: 'DQ', 3: 'GND'}, '1 = VCC, 2 = DATA, 3 = GND')
    s.add('U1', S['DS18B20'], 'DS18B20', FP['TO92'], {3: '+5V', 2: 'DQ', 1: 'GND'}, 'Датчик')
    s.add('R1', S['R'], '4k7', FP['R0805'], {1: '+5V', 2: 'DQ'}, 'Подтяжка 1-Wire')
    s.add('C1', S['C'], '100n', FP['C0805'], {1: '+5V', 2: 'GND'}, 'Развязка')
    return s

def t_rs485():
    s = Sheet('rs485_node', 'Узел RS-485 на MAX485', 'Полудуплекс: DE и ~RE объединены (передача при высоком уровне).\nR3 = 120 Ом — терминатор (только на концах линии, ставится перемычкой).')
    s.add('J1', S['J5'], 'MCU', HDR(5), {1: '+5V', 2: 'TXD', 3: 'RXD', 4: 'DIR', 5: 'GND'}, 'К микроконтроллеру')
    s.add('U1', S['MAX485'], 'MAX485', FP['DIP8'], {4: 'TXD', 1: 'RXD', 3: 'DIR', 2: 'DIR', 6: 'LINE_A', 7: 'LINE_B', 8: '+5V', 5: 'GND'}, 'Приёмопередатчик')
    s.add('C1', S['C'], '100n', FP['C0805'], {1: '+5V', 2: 'GND'}, 'Развязка')
    s.add('R1', S['R'], '680', FP['R0805'], {1: '+5V', 2: 'LINE_A'}, 'Смещение линии (fail-safe)')
    s.add('R2', S['R'], '680', FP['R0805'], {1: 'LINE_B', 2: 'GND'}, 'Смещение линии (fail-safe)')
    s.add('R3', S['R'], '120', FP['R0805'], {1: 'LINE_A', 2: 'TERM'}, 'Терминатор')
    s.add('JP1', S['J2'], 'TERM', HDR(2), {1: 'TERM', 2: 'LINE_B'}, 'Перемычка терминатора')
    s.add('J2', S['J3'], 'RS-485', FP['TERM2'].replace('-2_1x02', '-3_1x03'), {1: 'LINE_A', 2: 'LINE_B', 3: 'GND'}, 'Линия A, B, GND')
    return s

def t_opto_input():
    s = Sheet('opto_input', 'Изолированный вход 12–24 В на PC817', 'Гальваническая развязка: промышленный сигнал 12–24 В → логика 3,3/5 В.\nI_LED ≈ (24 − 1,2)/4,7k ≈ 5 мА; при 12 В ≈ 2,3 мА. D1 защищает от обратной полярности.')
    s.add('J1', S['J2'], 'IN 12-24V', FP['TERM2'], {1: 'IN+', 2: 'IN-'}, 'Изолированный вход')
    s.add('R1', S['R'], '4k7', FP['R_THT'], {1: 'IN+', 2: 'LED_IN'}, 'Ток светодиода оптопары (0,25 Вт)')
    s.add('D1', S['D'], '1N4148', FP['DO35'], {1: 'LED_IN', 2: 'IN-'}, 'Защита от переполюсовки (антипараллельно)')
    s.add('U1', S['PC817'], 'PC817', FP['DIP4'], {1: 'LED_IN', 2: 'IN-', 4: 'OUT', 3: 'GND'}, 'Оптопара')
    s.add('R2', S['R'], '10k', FP['R0805'], {1: '+3V3', 2: 'OUT'}, 'Подтяжка выхода')
    s.add('J2', S['J3'], 'MCU', HDR(3), {1: '+3V3', 2: 'OUT', 3: 'GND'}, 'К МК: активный низкий уровень')
    return s

def t_l293d():
    s = Sheet('motor_l293d', 'Драйвер двух моторов на L293D', 'Два коллекторных мотора: EN — ШИМ скорости, 1A/2A и 3A/4A — направление.\nVCC1 — логика 5 В, VCC2 — моторы 4,5–36 В. Встроенные диоды есть только у L293D (с буквой D).')
    s.add('J1', S['J8'], 'MCU', HDR(8), {1: '+5V', 2: 'EN_A', 3: 'IN1', 4: 'IN2', 5: 'EN_B', 6: 'IN3', 7: 'IN4', 8: 'GND'}, 'Управление')
    s.add('U1', S['L293D'], 'L293D', FP['DIP16'], {1: 'EN_A', 2: 'IN1', 7: 'IN2', 9: 'EN_B', 10: 'IN3', 15: 'IN4', 3: 'M1+', 6: 'M1-', 11: 'M2+', 14: 'M2-', 16: '+5V', 8: 'VMOT', 4: 'GND', 5: 'GND', 12: 'GND', 13: 'GND'}, 'H-мосты')
    s.add('J2', S['J2'], 'MOTOR A', FP['TERM2'], {1: 'M1+', 2: 'M1-'}, 'Мотор A')
    s.add('J3', S['J2'], 'MOTOR B', FP['TERM2'], {1: 'M2+', 2: 'M2-'}, 'Мотор B')
    s.add('J4', S['J2'], 'VMOT', FP['TERM2'], {1: 'VMOT', 2: 'GND'}, 'Питание моторов')
    s.add('C1', S['CP'], '100u/25V', FP['CP6'], {1: 'VMOT', 2: 'GND'}, 'Фильтр питания моторов')
    s.add('C2', S['C'], '100n', FP['C0805'], {1: 'VMOT', 2: 'GND'}, 'ВЧ-развязка VMOT')
    s.add('C3', S['C'], '100n', FP['C0805'], {1: '+5V', 2: 'GND'}, 'Развязка логики')
    return s

def t_mic_preamp():
    s = Sheet('mic_preamp', 'Микрофонный предусилитель на LM358', 'Электретный микрофон (смещение R1) → разделительный C2 → неинвертирующий усилитель K = 1 + R5/R4 = 101.\nВыход смещён на VCC/2 — удобно для АЦП микроконтроллера.')
    s.add('J1', S['J3'], 'PWR/OUT', HDR(3), {1: '+5V', 2: 'AUDIO', 3: 'GND'}, '1 = +5V, 2 = выход, 3 = GND')
    s.add('MK1', S['MK'], 'Electret', FP['MIC'], {2: 'MIC', 1: 'GND'}, 'Микрофон')
    s.add('R1', S['R'], '2k2', FP['R0805'], {1: '+5V', 2: 'MIC'}, 'Питание микрофона')
    s.add('C2', S['C'], '1u', FP['C0805'], {1: 'MIC', 2: 'IN'}, 'Разделительный')
    s.add('R2', S['R'], '100k', FP['R0805'], {1: '+5V', 2: 'IN'}, 'Смещение VCC/2')
    s.add('R3', S['R'], '100k', FP['R0805'], {1: 'IN', 2: 'GND'}, 'Смещение VCC/2')
    s.add('U1', S['LM358'], 'LM358', FP['SOIC8'], {3: 'IN', 2: 'FB', 1: 'AUDIO', 5: 'GND', 6: 'UNUSED_OUT', 7: 'UNUSED_OUT', 8: '+5V', 4: 'GND'}, 'Усилитель; вторая половина не используется')
    s.add('R4', S['R'], '1k', FP['R0805'], {1: 'FB', 2: 'FB_C'}, 'R4')
    s.add('C3', S['CP'], '10u', FP['CP5'], {1: 'FB_C', 2: 'GND'}, 'Усиление только для переменного сигнала')
    s.add('R5', S['R'], '100k', FP['R0805'], {1: 'AUDIO', 2: 'FB'}, 'R5 обратной связи')
    s.add('C4', S['C'], '100p', FP['C0805'], {1: 'AUDIO', 2: 'FB'}, 'Ограничение полосы ~16 кГц')
    s.add('C1', S['C'], '100n', FP['C0805'], {1: '+5V', 2: 'GND'}, 'Развязка')
    return s


TEMPLATES = [
    ('t-led', t_led_basic, 'Светодиоды', 1, 'Простейшая схема: разъём питания, резистор и светодиод. Отправная точка для любого проекта.'),
    ('t-7805', t_7805, 'Питание', 1, 'Линейный стабилизатор 5 В с защитой от переполюсовки и индикатором.'),
    ('t-lm317', t_lm317, 'Питание', 2, 'Регулируемый источник напряжения на LM317 с защитным диодом.'),
    ('t-ams1117', t_ams1117, 'Питание', 1, 'Получение 3,3 В от 5 В для ESP8266/ESP32, датчиков и SD-карт.'),
    ('t-lm2596', t_lm2596, 'Питание', 2, 'Импульсный понижающий преобразователь 5 В 3 А по типовой схеме.'),
    ('t-mt3608', t_mt3608, 'Питание', 2, 'Повышающий преобразователь: 5 В из Li-ion аккумулятора.'),
    ('t-tp4056', t_tp4056, 'Питание', 2, 'Зарядное устройство для одного Li-ion аккумулятора с индикацией.'),
    ('t-usbc', t_usbc_power, 'Питание', 2, 'Правильное подключение USB-C как источника 5 В: CC-резисторы, предохранитель, ESD.'),
    ('t-rc-lp', t_rc_lowpass, 'Фильтры', 1, 'Пассивный фильтр нижних частот первого порядка.'),
    ('t-rc-hp', t_rc_highpass, 'Фильтры', 1, 'Пассивный фильтр верхних частот первого порядка.'),
    ('t-sallen-key', t_sallen_key, 'Фильтры', 3, 'Активный ФНЧ 2-го порядка с однополярным питанием и виртуальной землёй.'),
    ('t-noninv', t_noninv, 'Усилители', 2, 'Усилитель сигнала датчика на ОУ с однополярным питанием.'),
    ('t-lm386', t_lm386, 'Усилители', 2, 'Усилитель для динамика с регулятором громкости и цепью Зобеля.'),
    ('t-mic', t_mic_preamp, 'Усилители', 2, 'Предусилитель электретного микрофона для АЦП микроконтроллера.'),
    ('t-555-astable', t_555_astable, 'Генераторы', 1, 'Генератор прямоугольных импульсов 1 Гц на NE555.'),
    ('t-555-mono', t_555_mono, 'Генераторы', 2, 'Таймер-одновибратор на NE555: импульс заданной длительности по кнопке.'),
    ('t-hc14-osc', t_schmitt_osc, 'Генераторы', 2, 'Тактовый RC-генератор на триггере Шмитта.'),
    ('t-relay', t_npn_relay, 'Ключи и драйверы', 1, 'Управление реле от Arduino/ESP через транзистор с защитным диодом.'),
    ('t-mosfet', t_mosfet_load, 'Ключи и драйверы', 2, 'Коммутация нагрузки 12 В (лента, мотор) логическим MOSFET.'),
    ('t-l293d', t_l293d, 'Ключи и драйверы', 2, 'Драйвер двух коллекторных моторов на L293D.'),
    ('t-level', t_level_shifter, 'Интерфейсы', 2, 'Двунаправленный преобразователь уровней I²C 3,3 ↔ 5 В.'),
    ('t-rs485', t_rs485, 'Интерфейсы', 2, 'Узел промышленной шины RS-485 с терминатором и смещением.'),
    ('t-opto', t_opto_input, 'Интерфейсы', 2, 'Гальванически развязанный вход для сигналов 12–24 В.'),
    ('t-ds18b20', t_ds18b20, 'Датчики', 1, 'Цифровой датчик температуры на шине 1-Wire.'),
    ('t-arduino', t_arduino_min, 'Микроконтроллеры', 3, 'Arduino на макетке/своей плате: минимальная обвязка ATmega328P.'),
    ('t-esp32', t_esp32_min, 'Микроконтроллеры', 3, 'ESP32-WROOM с USB-UART и автозагрузкой — основа IoT-устройств.'),
]
