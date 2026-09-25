"""
Мини-библиотека для генерации схем KiCad (.kicad_sch, формат KiCad 8,
открывается в KiCad 8/9/10).

Схема строится «в стиле меток»: у каждого вывода короткий провод и метка
цепи (или символ питания). Это полноценная, электрически корректная схема:
KiCad соединяет одноимённые метки. Проверка — kicad-cli (ERC + netlist).
"""
import uuid
import math

G = 2.54  # шаг сетки выводов

def U():
    return str(uuid.uuid4())

def q(s):
    return '"' + str(s).replace('\\', '\\\\').replace('"', '\\"') + '"'

def f(v):
    v = round(v, 4)
    return ('%.4f' % v).rstrip('0').rstrip('.') if v != int(v) else str(int(v))

FONT = '(effects (font (size 1.27 1.27)))'
FONT_HIDE = '(effects (font (size 1.27 1.27)) hide)'

POWER_NETS = {'GND', '+5V', '+3V3', '+12V', '+9V', 'VCC', '+BATT', '-12V', 'VIN', '+24V'}
GROUND_LIKE = {'GND'}

LIB = 'KiCadMaster'

# ------------------------------------------------------------------
# Описание символа: список выводов (num, name, type, x, y, angle, length)
# в координатах символа (Y вверх) + графика.
# ------------------------------------------------------------------
class Sym:
    def __init__(self, name, ref, pins, graphics, desc='', show_pin_names=True, show_pin_numbers=True,
                 power=False, ref_pos=None, val_pos=None, bbox=None, keywords=''):
        self.name = name
        self.ref = ref
        self.pins = pins            # [(num, name, type, x, y, angle, length)]
        self.graphics = graphics    # строка S-выражений
        self.desc = desc
        self.show_pin_names = show_pin_names
        self.show_pin_numbers = show_pin_numbers
        self.power = power
        self.ref_pos = ref_pos
        self.val_pos = val_pos
        self.bbox = bbox            # (xmin, ymin, xmax, ymax) в координатах символа
        self.keywords = keywords

    @property
    def lib_id(self):
        return LIB + ':' + self.name

    def sexpr(self, top_level_name=None):
        n = top_level_name or self.lib_id
        head = '(symbol %s' % q(n)
        if self.power:
            head += ' (power)'
        head += ' (pin_numbers%s)' % ('' if self.show_pin_numbers else ' hide')
        head += ' (pin_names (offset %s)%s)' % ('0' if not self.show_pin_names else '1.016', '' if self.show_pin_names else ' hide')
        head += ' (exclude_from_sim no) (in_bom yes) (on_board yes)'
        rp = self.ref_pos or (0, 5.08)
        vp = self.val_pos or (0, -5.08)
        props = [
            '(property "Reference" %s (at %s %s 0) %s)' % (q(self.ref), f(rp[0]), f(rp[1]), FONT_HIDE if self.power else FONT),
            '(property "Value" %s (at %s %s 0) %s)' % (q(self.name), f(vp[0]), f(vp[1]), FONT),
            '(property "Footprint" "" (at 0 0 0) %s)' % FONT_HIDE,
            '(property "Datasheet" "~" (at 0 0 0) %s)' % FONT_HIDE,
            '(property "Description" %s (at 0 0 0) %s)' % (q(self.desc), FONT_HIDE),
        ]
        if self.keywords:
            props.append('(property "ki_keywords" %s (at 0 0 0) %s)' % (q(self.keywords), FONT_HIDE))
        short = self.name
        g = '(symbol %s %s)' % (q(short + '_0_1'), self.graphics)
        pins = []
        for (num, pname, ptype, x, y, ang, ln) in self.pins:
            hide = ' hide' if self.power else ''
            pins.append('(pin %s line (at %s %s %d) (length %s)%s (name %s %s) (number %s %s))' % (
                ptype, f(x), f(y), ang, f(ln), hide, q(pname), FONT, q(num), FONT))
        p = '(symbol %s %s)' % (q(short + '_1_1'), ' '.join(pins))
        return '%s %s %s %s)' % (head, ' '.join(props), g, p)

    def pin(self, num):
        for p in self.pins:
            if p[0] == str(num):
                return p
        raise KeyError('%s: нет вывода %s' % (self.name, num))


def stroke(w=0.254):
    return '(stroke (width %s) (type default))' % f(w)

def rect(x1, y1, x2, y2, fill='background', w=0.254):
    return '(rectangle (start %s %s) (end %s %s) %s (fill (type %s)))' % (f(x1), f(y1), f(x2), f(y2), stroke(w), fill)

def pline(pts, w=0.254, fill='none'):
    return '(polyline (pts %s) %s (fill (type %s)))' % (' '.join('(xy %s %s)' % (f(a), f(b)) for a, b in pts), stroke(w), fill)

def circle(x, y, r, w=0.254, fill='none'):
    return '(circle (center %s %s) (radius %s) %s (fill (type %s)))' % (f(x), f(y), f(r), stroke(w), fill)

def arc(sx, sy, mx, my, ex, ey, w=0.254):
    return '(arc (start %s %s) (mid %s %s) (end %s %s) %s (fill (type none)))' % (f(sx), f(sy), f(mx), f(my), f(ex), f(ey), stroke(w))

def text_g(s, x, y, size=1.27):
    return '(text %s (at %s %s 0) (effects (font (size %s %s))))' % (q(s), f(x), f(y), f(size), f(size))

# ------------------------------------------------------------------
# Базовые символы
# ------------------------------------------------------------------
def sym_R(name='R', desc='Резистор'):
    return Sym(name, 'R', [('1', '~', 'passive', 0, 3.81, 270, 1.27), ('2', '~', 'passive', 0, -3.81, 90, 1.27)],
               rect(-1.016, -2.54, 1.016, 2.54, 'none'), desc, show_pin_names=False, show_pin_numbers=False,
               ref_pos=(2.54, 0.635), val_pos=(2.54, -1.905), bbox=(-1.1, -3.81, 1.1, 3.81))

def sym_C(name='C', polarized=False, desc='Конденсатор'):
    g = pline([(-2.032, 0.762), (2.032, 0.762)], 0.508) + ' ' + pline([(-2.032, -0.762), (2.032, -0.762)], 0.508)
    if polarized:
        g = rect(-2.286, 0.508, 2.286, 1.016, 'none') + ' ' + rect(-2.286, -1.016, 2.286, -0.508, 'outline') + ' ' + pline([(-1.778, 2.286), (-0.762, 2.286)]) + ' ' + pline([(-1.27, 2.794), (-1.27, 1.778)])
    return Sym(name, 'C', [('1', '~', 'passive', 0, 3.81, 270, 2.794 if polarized else 3.048), ('2', '~', 'passive', 0, -3.81, 90, 2.794 if polarized else 3.048)],
               g, desc, show_pin_names=False, show_pin_numbers=False, ref_pos=(3.81, 0.635), val_pos=(3.81, -1.905), bbox=(-2.3, -3.81, 2.3, 3.81))

def sym_L(name='L', desc='Индуктивность'):
    g = ' '.join(arc(0, 2.54 - i * 1.27, 0.635, 1.905 - i * 1.27, 0, 1.27 - i * 1.27) for i in range(4))
    return Sym(name, 'L', [('1', '~', 'passive', 0, 3.81, 270, 1.27), ('2', '~', 'passive', 0, -3.81, 90, 1.27)],
               g, desc, False, False, ref_pos=(2.54, 0.635), val_pos=(2.54, -1.905), bbox=(-1, -3.81, 1, 3.81))

def sym_FB(name='FerriteBead', desc='Ферритовая бусина'):
    g = pline([(-2.3, 0.2), (0.4, 2.1), (2.3, -0.4), (-0.4, -2.3), (-2.3, 0.2)])
    return Sym(name, 'FB', [('1', '~', 'passive', 0, 3.81, 270, 1.27), ('2', '~', 'passive', 0, -3.81, 90, 1.27)],
               g, desc, False, False, ref_pos=(3.3, 0.635), val_pos=(3.3, -1.905), bbox=(-2.3, -3.81, 2.3, 3.81))

def sym_diode(name, kind='D', desc='Диод'):
    # Как в библиотеке KiCad: вывод 1 — катод (слева), вывод 2 — анод (справа)
    g = pline([(1.27, 1.27), (1.27, -1.27), (-1.27, 0), (1.27, 1.27)], 0.254, 'none')
    if kind == 'D':
        g += ' ' + pline([(-1.27, 1.27), (-1.27, -1.27)])
    elif kind == 'Z':
        g += ' ' + pline([(-0.762, 1.27), (-1.27, 1.27), (-1.27, -1.27), (-1.778, -1.27)])
    elif kind == 'S':
        g += ' ' + pline([(-1.905, 0.635), (-1.905, 1.27), (-1.27, 1.27), (-1.27, -1.27), (-0.635, -1.27), (-0.635, -0.635)])
    elif kind == 'LED':
        g += ' ' + pline([(-1.27, 1.27), (-1.27, -1.27)]) + ' ' + pline([(-3.048, -0.762), (-4.572, -2.286), (-3.81, -2.286), (-4.572, -2.286), (-4.572, -1.524)]) + ' ' + pline([(-1.778, -0.762), (-3.302, -2.286), (-2.54, -2.286), (-3.302, -2.286), (-3.302, -1.524)])
    return Sym(name, 'D', [('1', 'K', 'passive', -3.81, 0, 0, 2.54), ('2', 'A', 'passive', 3.81, 0, 180, 2.54)],
               g, desc, False, False, ref_pos=(0, 2.54), val_pos=(0, -3.81 if kind == 'LED' else -2.54), bbox=(-3.81, -2.4, 3.81, 1.4))

def sym_npn(name, order='CBE', pnp=False, desc='Биполярный транзистор'):
    # order — функции выводов 1,2,3 (как у корпуса)
    pos = {'B': (-5.08, 0, 0, 3.81), 'C': (2.54, 5.08, 270, 2.794), 'E': (2.54, -5.08, 90, 2.794)}
    pins = []
    for i, fn in enumerate(order):
        x, y, a, l = pos[fn]
        pins.append((str(i + 1), fn, 'passive', x, y, a, l))
    g = circle(1.27, 0, 2.8194, 0.254, 'none') + ' ' + pline([(0.635, 1.905), (0.635, -1.905)], 0.508) + ' ' + pline([(-1.27, 0), (0.635, 0)]) + ' ' + pline([(0.635, 0.635), (2.54, 2.286)]) + ' ' + pline([(0.635, -0.635), (2.54, -2.286)])
    if pnp:
        g += ' ' + pline([(0.762, -0.762), (1.524, -1.143), (1.143, -1.524), (0.762, -0.762)], 0.254, 'outline')
    else:
        g += ' ' + pline([(1.905, -1.778), (2.286, -1.397), (1.397, -1.016), (1.905, -1.778)], 0.254, 'outline')
    return Sym(name, 'Q', pins, g, desc, False, False, ref_pos=(5.08, 0.635), val_pos=(5.08, -1.905), bbox=(-5.08, -5.08, 4.2, 5.08))

def sym_nmos(name, order='GSD', pmos=False, desc='Полевой транзистор'):
    pos = {'G': (-5.08, 0, 0, 3.81), 'D': (2.54, 5.08, 270, 2.54), 'S': (2.54, -5.08, 90, 2.54)}
    pins = []
    for i, fn in enumerate(order):
        x, y, a, l = pos[fn]
        pins.append((str(i + 1), fn, 'passive', x, y, a, l))
    g = circle(1.651, 0, 2.794, 0.254, 'none') + ' ' + pline([(0.254, 1.905), (0.254, -1.905)], 0.254) + ' ' + pline([(0.762, 2.286), (0.762, 1.27)], 0.254) + ' ' + pline([(0.762, 0.508), (0.762, -0.508)], 0.254) + ' ' + pline([(0.762, -1.27), (0.762, -2.286)], 0.254)
    g += ' ' + pline([(0.762, 1.778), (2.54, 1.778), (2.54, 2.54)]) + ' ' + pline([(0.762, -1.778), (2.54, -1.778), (2.54, -2.54)]) + ' ' + pline([(0.762, 0), (2.54, 0), (2.54, -1.778)]) + ' ' + pline([(-1.27, 0), (0.254, 0)])
    if pmos:
        g += ' ' + pline([(2.286, 0), (1.27, 0.381), (1.27, -0.381), (2.286, 0)], 0.254, 'outline')
    else:
        g += ' ' + pline([(1.016, 0), (2.032, 0.381), (2.032, -0.381), (1.016, 0)], 0.254, 'outline')
    return Sym(name, 'Q', pins, g, desc, False, False, ref_pos=(5.08, 0.635), val_pos=(5.08, -1.905), bbox=(-5.08, -5.08, 4.5, 5.08))

def sym_pot(name='R_Potentiometer', desc='Потенциометр'):
    g = rect(-1.016, -2.54, 1.016, 2.54, 'none') + ' ' + pline([(2.54, 0), (1.524, 0)]) + ' ' + pline([(1.143, 0), (2.032, 0.508), (2.032, -0.508), (1.143, 0)], 0.254, 'outline')
    return Sym(name, 'RV', [('1', '1', 'passive', 0, 3.81, 270, 1.27), ('2', '2', 'passive', 3.81, 0, 180, 1.27), ('3', '3', 'passive', 0, -3.81, 90, 1.27)],
               g, desc, False, False, ref_pos=(-2.54, 0.635), val_pos=(-2.54, -1.905), bbox=(-1.1, -3.81, 3.81, 3.81))

def sym_2pin_h(name, ref, graphics, desc, pin_names=('1', '2'), half=5.08, ln=2.54, bbox_h=2.0):
    return Sym(name, ref, [('1', pin_names[0], 'passive', -half, 0, 0, ln), ('2', pin_names[1], 'passive', half, 0, 180, ln)],
               graphics, desc, False, False, ref_pos=(0, 3.81), val_pos=(0, -3.81), bbox=(-half, -bbox_h, half, bbox_h))

def sym_switch():
    g = circle(-2.032, 0, 0.508) + ' ' + circle(2.032, 0, 0.508) + ' ' + pline([(0, 1.27), (0, 3.048)]) + ' ' + pline([(2.54, 1.27), (-2.54, 1.27)])
    return sym_2pin_h('SW_Push', 'SW', g, 'Кнопка без фиксации', half=5.08, ln=2.54, bbox_h=3.2)

def sym_crystal():
    g = rect(-1.143, -2.54, 1.143, 2.54, 'none') + ' ' + pline([(-2.54, -1.905), (-2.54, 1.905)]) + ' ' + pline([(2.54, -1.905), (2.54, 1.905)])
    return sym_2pin_h('Crystal', 'Y', g, 'Кварцевый резонатор', half=3.81, ln=1.27, bbox_h=2.6)

def sym_buzzer():
    g = arc(0, -3.175, 3.175, 0, 0, 3.175) + ' ' + pline([(0, 3.175), (0, -3.175)])
    s = Sym('Buzzer', 'BZ', [('1', '-', 'passive', -2.54, -5.08, 90, 1.905), ('2', '+', 'passive', 2.54, -5.08, 90, 1.905)],
            g + ' ' + pline([(-2.54, -3.175), (-2.54, -3.175)]), 'Зуммер', False, True, ref_pos=(5.08, 1.27), val_pos=(5.08, -1.27), bbox=(-2.6, -5.08, 3.2, 3.2))
    return s

def sym_speaker():
    g = rect(-1.016, -1.27, 1.016, 1.27, 'none') + ' ' + pline([(1.016, 1.27), (3.302, 3.302), (3.302, -3.302), (1.016, -1.27)])
    return Sym('Speaker', 'LS', [('1', '1', 'passive', -2.54, 0.635, 0, 1.524), ('2', '2', 'passive', -2.54, -0.635, 0, 1.524)],
               g, 'Динамик', False, True, ref_pos=(3.81, 5.08), val_pos=(3.81, -5.08), bbox=(-2.54, -3.4, 3.4, 3.4))

def sym_battery():
    g = pline([(-2.032, 1.016), (2.032, 1.016)], 0.508) + ' ' + pline([(-1.016, 0), (1.016, 0)], 0.508) + ' ' + pline([(-2.032, -1.016), (2.032, -1.016)], 0.508) + ' ' + pline([(-1.016, -2.032), (1.016, -2.032)], 0.508) + ' ' + pline([(0.762, 2.286), (1.778, 2.286)]) + ' ' + pline([(1.27, 2.794), (1.27, 1.778)])
    return Sym('Battery_Cell', 'BT', [('1', '+', 'passive', 0, 3.81, 270, 2.794), ('2', '-', 'passive', 0, -3.81, 90, 1.778)],
               g, 'Элемент питания', False, False, ref_pos=(3.048, 0.635), val_pos=(3.048, -1.905), bbox=(-2.1, -3.81, 2.1, 3.81))

def sym_mic():
    g = circle(0, 0, 2.54) + ' ' + pline([(-2.54, 2.54), (-2.54, -2.54)])
    return Sym('Microphone', 'MK', [('1', '-', 'passive', 0, -5.08, 90, 2.54), ('2', '+', 'passive', 0, 5.08, 270, 2.54)],
               g, 'Электретный микрофон', False, True, ref_pos=(3.81, 0.635), val_pos=(3.81, -1.905), bbox=(-2.6, -5.08, 2.6, 5.08))

def sym_antenna():
    g = pline([(0, 2.54), (0, -2.54)]) + ' ' + pline([(-1.905, 4.445), (0, 2.54), (1.905, 4.445), (-1.905, 4.445)])
    return Sym('Antenna', 'AE', [('1', 'A', 'input', 0, -5.08, 90, 2.54)], g, 'Антенна', False, False,
               ref_pos=(2.54, 2.54), val_pos=(2.54, 0), bbox=(-2, -5.08, 2, 4.5))

def sym_conn(n, rows=1, name=None, desc='Разъём'):
    """Разъём: выводы слева (1 ряд) — как Connector_Generic:Conn_01xNN."""
    pins = []
    h = (n - 1) * G
    top = math.ceil((n - 1) / 2) * G
    if rows == 1:
        for i in range(n):
            pins.append((str(i + 1), 'Pin_%d' % (i + 1), 'passive', -5.08, top - i * G, 0, 3.81))
        g = rect(-1.27, top + 1.27, 1.27, top - h - 1.27, 'background') + ' ' + ' '.join(rect(-1.27, top - i * G + 0.127, 0, top - i * G - 0.127, 'none', 0.1524) for i in range(n))
        bbox = (-5.08, top - h - 1.3, 1.3, top + 1.3)
    else:
        m = n // 2
        top = math.ceil((m - 1) / 2) * G
        h = (m - 1) * G
        for i in range(m):
            pins.append((str(2 * i + 1), 'Pin_%d' % (2 * i + 1), 'passive', -5.08, top - i * G, 0, 3.81))
            pins.append((str(2 * i + 2), 'Pin_%d' % (2 * i + 2), 'passive', 6.35, top - i * G, 180, 3.81))
        g = rect(-1.27, top + 1.27, 2.54, top - h - 1.27, 'background')
        bbox = (-5.08, top - h - 1.3, 6.35, top + 1.3)
    nm = name or ('Conn_%02dx%02d' % (rows, n // rows))
    return Sym(nm, 'J', pins, g, desc, False, True, ref_pos=(0, top + 2.54), val_pos=(0, top - h - 2.54), bbox=bbox)

def sym_box(name, ref, left, right=(), top=(), bottom=(), desc='', keywords='', min_w=10.16):
    """Микросхема-прямоугольник. Списки выводов: (num, name, type)."""
    maxl = max([len(p[1]) for p in left] + [0])
    maxr = max([len(p[1]) for p in right] + [0])
    w = max(min_w, (maxl + maxr) * 1.1 + 5.08, len(top) * 2 * G + G, len(bottom) * 2 * G + G)
    w = math.ceil(w / (2 * G)) * 2 * G
    n = max(len(left), len(right), 1)
    h = math.ceil((n + 1) * G / (2 * G)) * 2 * G
    pins = []
    def col(lst, x, ang):
        t = h / 2 - G
        for i, (num, nm, tp) in enumerate(lst):
            pins.append((str(num), nm, tp, x, t - i * G, ang, G))
    col(left, -w / 2 - G, 0)
    col(right, w / 2 + G, 180)
    def row(lst, y, ang):
        k = len(lst)
        for i, (num, nm, tp) in enumerate(lst):
            pins.append((str(num), nm, tp, (2 * i - (k - 1)) * G, y, ang, G))
    row(top, h / 2 + G, 270)
    row(bottom, -h / 2 - G, 90)
    g = rect(-w / 2, h / 2, w / 2, -h / 2, 'background')
    s = Sym(name, ref, pins, g, desc, True, True, ref_pos=(-w / 2, h / 2 + (G * 2 if top else 1.27)),
            val_pos=(-w / 2, -h / 2 - (G * 2 if bottom else 1.27)), bbox=(-w / 2 - G, -h / 2 - G, w / 2 + G, h / 2 + G), keywords=keywords)
    return s

def snap(x):
    return round(x / G) * G

def sym_power(name):
    if name in GROUND_LIKE:
        g = pline([(0, 0), (0, -1.27), (1.27, -1.27), (0, -2.54), (-1.27, -1.27), (0, -1.27)], 0)
        return Sym(name, '#PWR', [('1', name, 'power_in', 0, 0, 270, 0)], g, 'Символ питания: ' + name, False, False, power=True,
                   ref_pos=(0, -6.35), val_pos=(0, -3.81))
    if name.startswith('-'):
        g = pline([(0, 0), (0, -1.27)]) + ' ' + pline([(-0.762, -1.27), (0, -2.54), (0.762, -1.27), (-0.762, -1.27)], 0, 'outline')
        return Sym(name, '#PWR', [('1', name, 'power_in', 0, 0, 90, 0)], g, 'Символ питания: ' + name, False, False, power=True,
                   ref_pos=(0, -3.81), val_pos=(0, -3.81))
    g = pline([(-0.762, 1.27), (0, 2.54)]) + ' ' + pline([(0, 0), (0, 2.54)]) + ' ' + pline([(0, 2.54), (0.762, 1.27)])
    return Sym(name, '#PWR', [('1', name, 'power_in', 0, 0, 90, 0)], g, 'Символ питания: ' + name, False, False, power=True,
               ref_pos=(0, -3.81), val_pos=(0, 3.556))

def sym_pwrflag():
    g = pline([(0, 0), (0, 1.27), (-1.016, 1.905), (0, 2.54), (1.016, 1.905), (0, 1.27)])
    return Sym('PWR_FLAG', '#FLG', [('1', 'pwr', 'power_out', 0, 0, 90, 0)], g, 'Флаг: цепь запитана извне (для ERC)', False, False,
               power=True, ref_pos=(0, 1.905), val_pos=(0, 3.81))
