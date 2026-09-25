"""
Сборка листа схемы из описания компонентов и цепей.
"""
import datetime
from kicadlib import (U, q, f, G, FONT, FONT_HIDE, POWER_NETS, GROUND_LIKE, LIB,
                      sym_power, sym_pwrflag, snap)

PAGES = {'A4': (297.0, 210.0), 'A3': (420.0, 297.0)}
STUB = G  # длина отвода от вывода до метки


def outward(angle):
    # угол вывода в координатах символа → направление «наружу» на экране (y вниз)
    return {0: (-1, 0), 180: (1, 0), 270: (0, -1), 90: (0, 1)}[angle]


class Part:
    def __init__(self, ref, sym, value, fp='', nets=None, desc='', fields=None, symmetric=None):
        self.ref = ref
        self.sym = sym
        self.value = value
        self.fp = fp
        self.nets = {str(k): v for k, v in (nets or {}).items()}
        self.desc = desc
        self.fields = fields or {}
        # симметричные 2-выводные детали: при проверке выводы можно поменять местами
        self.symmetric = symmetric if symmetric is not None else sym.name in ('R', 'C', 'L', 'Crystal', 'SW_Push', 'FerriteBead', 'Polyfuse')
        for k in self.nets:
            sym.pin(k)  # проверка, что вывод существует


class Sheet:
    def __init__(self, name, title, desc='', rev='1'):
        self.name = name
        self.title = title
        self.desc = desc
        self.rev = rev
        self.parts = []
        self.root = U()
        self.wrap = 230.0  # ширина строки раскладки, мм
        self.bounds = None

    def add(self, *a, **kw):
        p = Part(*a, **kw)
        if any(x.ref == p.ref for x in self.parts):
            raise ValueError('Повтор обозначения ' + p.ref)
        self.parts.append(p)
        return p

    # ---- вспомогательное ----
    def nets(self):
        res = {}
        for p in self.parts:
            for pin, n in p.nets.items():
                res.setdefault(n, []).append((p.ref, pin))
        return res

    def symbols(self):
        d = {}
        for p in self.parts:
            d[p.sym.name] = p.sym
        return d

    def _extent(self, p):
        """Габарит детали с отводами и метками (экранные координаты относительно начала символа)."""
        b = p.sym.bbox or (-5, -5, 5, 5)
        xmin, xmax = b[0], b[2]
        ymin, ymax = -b[3], -b[1]
        for pin in p.sym.pins:
            num, _, _, x, y, ang, _ = pin
            dx, dy = outward(ang)
            px, py = x, -y
            net = p.nets.get(num)
            use_sym = net in POWER_NETS and dx == 0
            ln = STUB + (4.5 if use_sym else (len(net) * 1.05 + 1.5 if net else 1.5))
            ex, ey = px + dx * ln, py + dy * ln
            xmin, xmax = min(xmin, ex), max(xmax, ex)
            ymin, ymax = min(ymin, ey - (1.8 if dx else 0)), max(ymax, ey + (0.8 if dx else 0))
        # текст обозначения и значения
        rp = p.sym.ref_pos or (0, 5.08)
        vp = p.sym.val_pos or (0, -5.08)
        tl = max(len(p.ref), len(p.value)) * 1.05
        xmax = max(xmax, rp[0] + tl, vp[0] + tl)
        ymin = min(ymin, -rp[1] - 1.5)
        ymax = max(ymax, -vp[1] + 1.0)
        return xmin, ymin, xmax, ymax

    def layout(self, width):
        x0, y0 = 22.86, 33.02
        x, y, rowh = x0, y0, 0
        pos = {}
        for p in self.parts:
            e = self._extent(p)
            w, h = e[2] - e[0], e[3] - e[1]
            if x + w > width - 20 and x > x0:
                x, y, rowh = x0, y + rowh + 5.08, 0
            sx, sy = snap(x - e[0]), snap(y - e[1])
            pos[p.ref] = (sx, sy)
            x += w + 7.62
            rowh = max(rowh, h)
        return pos, y + rowh

    # ---- генерация ----
    def render(self, starter=False, date=None):
        """starter=True — заготовка: детали расставлены, но не соединены."""
        date = date or datetime.date.today().isoformat()
        paper = 'A4'
        pos, bottom = self.layout(min(PAGES['A4'][0], self.wrap))
        power_nets = sorted({n for p in self.parts for n in p.nets.values() if n in POWER_NETS})
        need_h = bottom + (20 if power_nets else 0) + 45
        if need_h > PAGES['A4'][1]:
            paper = 'A3'
            pos, bottom = self.layout(PAGES['A3'][0])
        W, H = PAGES[paper]

        items = []
        syms_used = dict(self.symbols())
        pwr_counter = [0]
        instances = []

        def wire(a, b):
            items.append('(wire (pts (xy %s %s) (xy %s %s)) (stroke (width 0) (type default)) (uuid %s))' % (f(a[0]), f(a[1]), f(b[0]), f(b[1]), q(U())))

        def label(net, at, d):
            ang = {(1, 0): 0, (-1, 0): 180, (0, -1): 90, (0, 1): 270}[d]
            just = 'left bottom' if ang in (0, 90) else 'right bottom'
            items.append('(label %s (at %s %s %d) (fields_autoplaced yes) (effects (font (size 1.27 1.27)) (justify %s)) (uuid %s))' % (q(net), f(at[0]), f(at[1]), ang, just, q(U())))

        def place_power(net, at, d, flag=False):
            s = sym_pwrflag() if flag else sym_power(net)
            syms_used[s.name] = s
            if flag:
                rot = {(0, -1): 0, (0, 1): 180, (1, 0): 270, (-1, 0): 90}[d]
                ref = '#FLG%02d' % (pwr_counter[0] + 1)
            elif net in GROUND_LIKE:
                rot = {(0, 1): 0, (1, 0): 90, (0, -1): 180, (-1, 0): 270}[d]
                ref = '#PWR%02d' % (pwr_counter[0] + 1)
            else:
                rot = {(0, -1): 0, (-1, 0): 90, (0, 1): 180, (1, 0): 270}[d]
                ref = '#PWR%02d' % (pwr_counter[0] + 1)
            pwr_counter[0] += 1
            vx, vy = at[0] + d[0] * 4.2, at[1] + d[1] * 4.2 + (0.6 if d[0] else (1.2 if d[1] > 0 else -0.4))
            just = '' if d[0] == 0 else (' (justify left)' if d[0] > 0 else ' (justify right)')
            items.append('(symbol (lib_id %s) (at %s %s %d) (unit 1) (exclude_from_sim no) (in_bom yes) (on_board yes) (dnp no) (uuid %s) '
                         '(property "Reference" %s (at %s %s 0) %s) (property "Value" %s (at %s %s 0) (effects (font (size 1.27 1.27))%s)) '
                         '(property "Footprint" "" (at %s %s 0) %s) (property "Datasheet" "" (at %s %s 0) %s) (property "Description" "" (at %s %s 0) %s) '
                         '(pin "1" (uuid %s)) (instances (project %s (path %s (reference %s) (unit 1)))))' % (
                             q(s.lib_id), f(at[0]), f(at[1]), rot, q(U()),
                             q(ref), f(at[0]), f(at[1]), FONT_HIDE, q(s.name if not flag else 'PWR_FLAG'), f(vx), f(vy), just,
                             f(at[0]), f(at[1]), FONT_HIDE, f(at[0]), f(at[1]), FONT_HIDE, f(at[0]), f(at[1]), FONT_HIDE,
                             q(U()), q(self.name), q('/' + self.root), q(ref)))

        for p in self.parts:
            sx, sy = pos[p.ref]
            s = p.sym
            rp = s.ref_pos or (0, 5.08)
            vp = s.val_pos or (0, -5.08)
            fields = ''.join('(property %s %s (at %s %s 0) %s) ' % (q(k), q(v), f(sx), f(sy), FONT_HIDE) for k, v in p.fields.items())
            items.append('(symbol (lib_id %s) (at %s %s 0) (unit 1) (exclude_from_sim no) (in_bom yes) (on_board yes) (dnp no) (uuid %s) '
                         '(property "Reference" %s (at %s %s 0) (effects (font (size 1.27 1.27)) (justify left))) '
                         '(property "Value" %s (at %s %s 0) (effects (font (size 1.27 1.27)) (justify left))) '
                         '(property "Footprint" %s (at %s %s 0) %s) (property "Datasheet" "~" (at %s %s 0) %s) '
                         '(property "Description" %s (at %s %s 0) %s) %s%s '
                         '(instances (project %s (path %s (reference %s) (unit 1)))))' % (
                             q(s.lib_id), f(sx), f(sy), q(U()),
                             q(p.ref), f(sx + rp[0]), f(sy - rp[1]),
                             q(p.value), f(sx + vp[0]), f(sy - vp[1]),
                             q(p.fp), f(sx), f(sy), FONT_HIDE, f(sx), f(sy), FONT_HIDE,
                             q(p.desc), f(sx), f(sy), FONT_HIDE, fields,
                             ' '.join('(pin %s (uuid %s))' % (q(pin[0]), q(U())) for pin in s.pins),
                             q(self.name), q('/' + self.root), q(p.ref)))
            if starter:
                continue
            for pin in s.pins:
                num, _, _, x, y, ang, _ = pin
                P = (sx + x, sy - y)
                d = outward(ang)
                net = p.nets.get(num)
                if not net:
                    items.append('(no_connect (at %s %s) (uuid %s))' % (f(P[0]), f(P[1]), q(U())))
                    continue
                Q = (P[0] + d[0] * STUB, P[1] + d[1] * STUB)
                wire(P, Q)
                if net in POWER_NETS and d[0] == 0:
                    place_power(net, Q, d)
                else:
                    label(net, Q, d)

        # блок флагов питания: для каждой цепи питания и для каждой цепи с выводом
        # «вход питания», где нет вывода «выход питания», ставим PWR_FLAG
        flags, bx, by = [], 22.86, 0
        if not starter:
            has_in, driven = set(), set()
            for p in self.parts:
                for pin in p.sym.pins:
                    n = p.nets.get(pin[0])
                    if not n:
                        continue
                    if pin[2] == 'power_out':
                        driven.add(n)
                    if pin[2] == 'power_in':
                        has_in.add(n)
            flags = sorted((set(power_nets) | has_in) - driven)
            bx, by = 22.86, snap(bottom + 12.7)
            if flags:
                items.append('(text %s (exclude_from_sim no) (at %s %s 0) (effects (font (size 1.27 1.27)) (justify left bottom)) (uuid %s))' % (
                    q('Флаги питания для ERC (на плату не попадают):'), f(bx), f(by - 7.62), q(U())))
            for i, n in enumerate(flags):
                at = (bx + 5.08 + i * 17.78, by)
                if n in GROUND_LIKE:
                    place_power(n, at, (0, 1))
                    place_power(n, at, (0, -1), flag=True)
                elif n in POWER_NETS:
                    place_power(n, at, (0, -1))
                    place_power(n, at, (0, 1), flag=True)
                else:
                    end = (at[0], at[1] - STUB)
                    wire(at, end)
                    label(n, end, (0, -1))
                    place_power(n, at, (0, 1), flag=True)

        # границы содержимого (для обрезки превью)
        xs, ys = [], []
        for p in self.parts:
            e = self._extent(p)
            sx, sy = pos[p.ref]
            xs += [sx + e[0], sx + e[2]]
            ys += [sy + e[1], sy + e[3]]
        if self.desc:
            lines = self.desc.split('\n')
            xs += [20.32, 22.86 + max(len(x) for x in lines) * 1.35]
            ys += [14.0]
        if not starter and flags:
            xs += [bx + 5.08 + len(flags) * 17.78]
            ys += [by + 9.0]
        self.bounds = (min(xs) - 4, min(ys) - 4, max(xs) + 4, max(ys) + 4)

        # пояснение на листе
        if self.desc:
            for i, line in enumerate(self.desc.split('\n')):
                items.append('(text %s (exclude_from_sim no) (at 22.86 %s 0) (effects (font (size 1.524 1.524)) (justify left bottom)) (uuid %s))' % (
                    q(line), f(17.78 + i * 2.54), q(U())))

        libs = ' '.join(sym.sexpr() for sym in syms_used.values())
        out = ['(kicad_sch (version 20231120) (generator "eeschema") (generator_version "8.0")',
               '  (uuid %s)' % q(self.root),
               '  (paper %s)' % q(paper),
               '  (title_block (title %s) (date %s) (rev %s) (company "KiCad Мастер Pro") (comment 1 %s))' % (
                   q(self.title), q(date), q(self.rev), q('Сгенерировано автоматически; стиль «соединения метками»')),
               '  (lib_symbols ' + libs + ')']
        out += ['  ' + it for it in items]
        out.append('  (sheet_instances (path "/" (page "1")))')
        out.append(')')
        return '\n'.join(out) + '\n', syms_used

    def library(self, syms):
        body = ' '.join(s.sexpr(top_level_name=s.name) for s in syms.values())
        return '(kicad_symbol_lib (version 20231120) (generator "kicad_symbol_editor") (generator_version "8.0") %s)\n' % body
