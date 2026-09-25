#!/usr/bin/env python3
"""Демо-платы для просмотрщика Gerber.

Собирает настоящие файлы .kicad_pcb (посадочные места описаны прямо здесь —
библиотеки KiCad не нужны), проверяет их DRC и выгружает Gerber + сверловку
через kicad-cli. Результат: kicad/boards/<id>/<id>.kicad_pcb и
kicad/<id>-gerber.zip — их открывает раздел «Gerber & 3D».

Запуск: python3 tools/pcbgen.py   (нужен kicad-cli 8+)
"""
import json, math, os, shutil, subprocess, sys, tempfile, uuid, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'kicad')


def uid():
    return str(uuid.uuid4())


def f(v):
    return ('%.4f' % v).rstrip('0').rstrip('.')


class Board:
    def __init__(self, title):
        self.title = title
        self.nets = ['']
        self.items = []

    def net(self, name):
        if name not in self.nets:
            self.nets.append(name)
        return '(net %d "%s")' % (self.nets.index(name), name)

    # ---------- посадочные места (без поворота: «вертикальные» варианты описаны явно) ----------
    def footprint(self, lib, ref, value, x, y, pads, silk=(), ref_at=(0, -2), value_at=(0, 2)):
        body = ['(footprint "%s" (layer "F.Cu") (uuid "%s") (at %s %s)' % (lib, uid(), f(x), f(y)),
                '  (property "Reference" "%s" (at %s %s 0) (layer "F.SilkS") (uuid "%s") (effects (font (size 1 1) (thickness 0.15))))' % (ref, f(ref_at[0]), f(ref_at[1]), uid()),
                '  (property "Value" "%s" (at %s %s 0) (layer "F.Fab") (uuid "%s") (effects (font (size 1 1) (thickness 0.15))))' % (value, f(value_at[0]), f(value_at[1]), uid())]
        for (x1, y1, x2, y2) in silk:
            body.append('  (fp_line (start %s %s) (end %s %s) (stroke (width 0.12) (type solid)) (layer "F.SilkS") (uuid "%s"))' % (f(x1), f(y1), f(x2), f(y2), uid()))
        for p in pads:
            body.append('  ' + p)
        body.append(')')
        self.items.append('\n'.join(body))

    def smd(self, num, dx, dy, w, h, net):
        return '(pad "%s" smd roundrect (at %s %s) (size %s %s) (layers "F.Cu" "F.Paste" "F.Mask") (roundrect_rratio 0.25) %s (uuid "%s"))' % (num, f(dx), f(dy), f(w), f(h), self.net(net), uid())

    def tht(self, num, dx, dy, net, shape='circle', size=1.7, drill=1.0):
        return '(pad "%s" thru_hole %s (at %s %s) (size %s %s) (drill %s) (layers "*.Cu" "*.Mask") %s (uuid "%s"))' % (num, shape, f(dx), f(dy), f(size), f(size), f(drill), self.net(net), uid())

    def r0805(self, ref, value, x, y, n1, n2, vertical=False):
        """Резистор/конденсатор/светодиод 0805. Вывод 1 — слева (или сверху)."""
        if vertical:
            pads = [self.smd('1', 0, -0.95, 1.45, 1.0, n1), self.smd('2', 0, 0.95, 1.45, 1.0, n2)]
            silk = [(-1.1, -0.2, -1.1, 0.2), (1.1, -0.2, 1.1, 0.2)]
            self.footprint('R_0805_V', ref, value, x, y, pads, silk, ref_at=(-2.2, 0), value_at=(2.2, 0))
        else:
            pads = [self.smd('1', -0.95, 0, 1.0, 1.45, n1), self.smd('2', 0.95, 0, 1.0, 1.45, n2)]
            silk = [(-0.2, -1.1, 0.2, -1.1), (-0.2, 1.1, 0.2, 1.1)]
            self.footprint('R_0805', ref, value, x, y, pads, silk, ref_at=(0, -2), value_at=(0, 2))

    def soic8(self, ref, value, x, y, nets):
        pads = []
        for i in range(4):
            pads.append(self.smd(str(i + 1), -2.475, -1.905 + i * 1.27, 1.95, 0.6, nets[i]))
            pads.append(self.smd(str(8 - i), 2.475, -1.905 + i * 1.27, 1.95, 0.6, nets[7 - i]))
        silk = [(-1.95, -2.56, 1.95, -2.56), (-1.95, 2.56, 1.95, 2.56), (-3.45, -2.56, -1.95, -2.56)]
        self.footprint('SOIC-8', ref, value, x, y, pads, silk, ref_at=(0, -3.5), value_at=(0, 3.5))

    def header(self, ref, value, x, y, nets, horizontal=False):
        pads = []
        for i, n in enumerate(nets):
            dx, dy = (i * 2.54, 0) if horizontal else (0, i * 2.54)
            pads.append(self.tht(str(i + 1), dx, dy, n, 'rect' if i == 0 else 'circle'))
        n = len(nets) - 1
        w, h = ((n * 2.54 + 2.6, 2.6) if horizontal else (2.6, n * 2.54 + 2.6))
        x0, y0 = -1.3, -1.3
        silk = [(x0, y0, x0 + w, y0), (x0 + w, y0, x0 + w, y0 + h), (x0 + w, y0 + h, x0, y0 + h), (x0, y0 + h, x0, y0)]
        self.footprint('PinHeader_1x%02d' % len(nets), ref, value, x, y, pads, silk,
                       ref_at=((n * 1.27, -2.4) if horizontal else (-2.6, n * 1.27)), value_at=(0, 30))

    def hole(self, x, y, d=3.2):
        self.items.append('(footprint "MountingHole" (layer "F.Cu") (uuid "%s") (at %s %s)\n'
                          '  (property "Reference" "H" (at 0 0 0) (layer "F.Fab") (hide yes) (uuid "%s") (effects (font (size 1 1) (thickness 0.15))))\n'
                          '  (pad "" np_thru_hole circle (at 0 0) (size %s %s) (drill %s) (layers "*.Cu" "*.Mask") (uuid "%s"))\n)' % (uid(), f(x), f(y), uid(), f(d), f(d), f(d), uid()))

    # ---------- медь ----------
    def track(self, pts, net, layer='F.Cu', w=0.25):
        for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
            self.items.append('(segment (start %s %s) (end %s %s) (width %s) (layer "%s") %s (uuid "%s"))' % (f(x1), f(y1), f(x2), f(y2), f(w), layer, self.net(net).split(' "')[0] + ')', uid()))

    def via(self, x, y, net):
        self.items.append('(via (at %s %s) (size 0.8) (drill 0.4) (layers "F.Cu" "B.Cu") %s (uuid "%s"))' % (f(x), f(y), self.net(net).split(' "')[0] + ')', uid()))

    def zone(self, net, layer, pts):
        self.net(net)
        self.items.append('(zone (net %d) (net_name "%s") (layer "%s") (uuid "%s") (hatch edge 0.5) (connect_pads (clearance 0.3)) (min_thickness 0.25) (filled_areas_thickness no)'
                          ' (fill yes (thermal_gap 0.5) (thermal_bridge_width 0.5)) (polygon (pts %s)))' % (self.nets.index(net), net, layer, uid(), ' '.join('(xy %s %s)' % (f(x), f(y)) for x, y in pts)))

    # ---------- графика ----------
    def edge_line(self, x1, y1, x2, y2):
        self.items.append('(gr_line (start %s %s) (end %s %s) (stroke (width 0.1) (type default)) (layer "Edge.Cuts") (uuid "%s"))' % (f(x1), f(y1), f(x2), f(y2), uid()))

    def edge_arc(self, s, m, e):
        self.items.append('(gr_arc (start %s %s) (mid %s %s) (end %s %s) (stroke (width 0.1) (type default)) (layer "Edge.Cuts") (uuid "%s"))' % (f(s[0]), f(s[1]), f(m[0]), f(m[1]), f(e[0]), f(e[1]), uid()))

    def edge_circle(self, cx, cy, r):
        self.items.append('(gr_circle (center %s %s) (end %s %s) (stroke (width 0.1) (type default)) (fill none) (layer "Edge.Cuts") (uuid "%s"))' % (f(cx), f(cy), f(cx + r), f(cy), uid()))

    def rounded_rect(self, x0, y0, x1, y1, r):
        k = r * (1 - math.sqrt(0.5))
        self.edge_line(x0 + r, y0, x1 - r, y0); self.edge_line(x1, y0 + r, x1, y1 - r)
        self.edge_line(x1 - r, y1, x0 + r, y1); self.edge_line(x0, y1 - r, x0, y0 + r)
        self.edge_arc((x1 - r, y0), (x1 - k, y0 + k), (x1, y0 + r))
        self.edge_arc((x1, y1 - r), (x1 - k, y1 - k), (x1 - r, y1))
        self.edge_arc((x0 + r, y1), (x0 + k, y1 - k), (x0, y1 - r))
        self.edge_arc((x0, y0 + r), (x0 + k, y0 + k), (x0 + r, y0))

    def text(self, s, x, y, size=1.2, layer='F.SilkS'):
        mirror = ' (justify mirror)' if layer.startswith('B.') else ''
        self.items.append('(gr_text "%s" (at %s %s 0) (layer "%s") (uuid "%s") (effects (font (size %s %s) (thickness %s))%s))' % (s, f(x), f(y), layer, uid(), f(size), f(size), f(size * 0.15), mirror))

    def save(self, path):
        layers = '''(layers (0 "F.Cu" signal) (31 "B.Cu" signal) (32 "B.Adhes" user "B.Adhesive") (33 "F.Adhes" user "F.Adhesive")
  (34 "B.Paste" user) (35 "F.Paste" user) (36 "B.SilkS" user "B.Silkscreen") (37 "F.SilkS" user "F.Silkscreen")
  (38 "B.Mask" user) (39 "F.Mask" user) (40 "Dwgs.User" user "User.Drawings") (41 "Cmts.User" user "User.Comments")
  (44 "Edge.Cuts" user) (45 "Margin" user) (46 "B.CrtYd" user "B.Courtyard") (47 "F.CrtYd" user "F.Courtyard")
  (48 "B.Fab" user) (49 "F.Fab" user))'''
        nets = '\n'.join('(net %d "%s")' % (i, n) for i, n in enumerate(self.nets))
        with open(path, 'w', encoding='utf8') as fh:
            fh.write('(kicad_pcb (version 20240108) (generator "pcbnew") (generator_version "8.0")\n'
                     '(general (thickness 1.6) (legacy_teardrops no))\n(paper "A4")\n(title_block (title "%s") (company "KiCad Мастер Pro"))\n'
                     '%s\n(setup (pad_to_mask_clearance 0))\n%s\n%s\n)\n' % (self.title, layers, nets, '\n'.join(self.items)))


# =====================================================================
def blinker():
    """Мигалка на NE555: 40×30 мм, 2 слоя, полигон GND снизу, переходные отверстия."""
    b = Board('Мигалка на NE555')
    b.rounded_rect(100, 100, 140, 130, 2)
    for x, y in ((103.5, 103.5), (136.5, 103.5), (103.5, 126.5), (136.5, 126.5)):
        b.hole(x, y, 3.2)
    b.header('J1', '5V', 105, 113.73, ['VCC', 'GND'])
    # NE555: 1 GND, 2 TRIG, 3 OUT, 4 RESET, 5 CTRL, 6 THRES, 7 DISCH, 8 VCC
    b.soic8('U1', 'NE555', 120, 115, ['GND', 'THRES', 'OUT', 'VCC', 'CTRL', 'THRES', 'DISCH', 'VCC'])
    b.r0805('R1', '10k', 128, 109, 'VCC', 'DISCH', vertical=True)
    b.r0805('R2', '47k', 128, 113, 'DISCH', 'THRES', vertical=True)
    b.r0805('C1', '10u', 128, 120, 'THRES', 'GND', vertical=True)
    b.r0805('C2', '10n', 124, 122, 'CTRL', 'GND', vertical=True)
    b.r0805('R3', '470', 112, 120, 'LED', 'OUT')
    b.r0805('D1', 'LED', 108, 122, 'LED', 'GND', vertical=True)
    # питание: J1 → верхняя шина → R1 и вывод 8
    b.track([(105, 113.73), (107.5, 111.23), (107.5, 107), (126, 107), (127.05, 108.05), (128, 108.05)], 'VCC', w=0.5)
    b.track([(123.5, 107), (123.5, 112.07), (122.475, 113.095)], 'VCC', w=0.4)
    # вывод 4 (RESET) → через нижний слой к шине питания
    b.track([(117.525, 116.905), (116.3, 116.905), (115.6, 117.6)], 'VCC', w=0.3)
    b.via(115.6, 117.6, 'VCC'); b.via(107.5, 109, 'VCC')
    b.track([(115.6, 117.6), (110.8, 112.8), (110.8, 110), (109.8, 109), (107.5, 109)], 'VCC', layer='B.Cu', w=0.4)
    # времязадающая цепь
    b.track([(122.475, 114.365), (124.6, 114.365), (126.9, 112.05), (128, 112.05)], 'DISCH')
    b.track([(128, 109.95), (128, 112.05)], 'DISCH')
    b.track([(117.525, 114.365), (119, 114.365), (120.27, 115.635), (122.475, 115.635), (126.5, 115.635), (128, 114.135), (128, 113.95)], 'THRES')
    b.track([(128, 113.95), (128, 119.05)], 'THRES')
    b.track([(122.475, 116.905), (124, 118.43), (124, 121.05)], 'CTRL')
    # выход → резистор → светодиод
    b.track([(117.525, 115.635), (115.2, 115.635), (113.5, 117.335), (113.5, 119.45), (112.95, 120)], 'OUT')
    b.track([(111.05, 120), (109.05, 120), (108, 121.05)], 'LED')
    # земля: переходные отверстия в полигон на B.Cu
    for pad, v in (((117.525, 113.095), (115.8, 113.095)), ((128, 120.95), (128, 122.4)), ((124, 122.95), (124, 124.3)), ((108, 122.95), (108, 124.4))):
        b.track([pad, v], 'GND', w=0.4); b.via(v[0], v[1], 'GND')
    b.zone('GND', 'B.Cu', [(100.5, 100.5), (139.5, 100.5), (139.5, 129.5), (100.5, 129.5)])
    b.text('KiCad Master Pro', 120, 103.2, 1.2)
    b.text('NE555 BLINK v1.0', 120, 127.3, 1.0)
    b.text('GND', 120, 127, 1.5, 'B.SilkS')
    return b


def badge():
    """Круглый значок Ø36 мм: 4 светодиода с резисторами, питание буквой «Н»."""
    b = Board('Значок со светодиодами')
    cx, cy = 120, 120
    b.edge_circle(cx, cy, 18)
    b.header('J1', 'BAT', 118.73, 120, ['VCC', 'GND'], horizontal=True)
    for i, (sx, y) in enumerate(((-1, 113), (1, 113), (-1, 127), (1, 127))):
        n = 'LED%d' % (i + 1)
        if sx < 0:
            b.r0805('R%d' % (i + 1), '330', 112, y, n, 'VCC')        # вывод 2 (VCC) ближе к центру
            b.r0805('D%d' % (i + 1), 'LED', 108, y, 'GND', n)        # вывод 1 = катод
            b.track([(111.05, y), (108.95, y)], n)
            b.track([(107.05, y), (105.7, y)], 'GND', w=0.4); b.via(105.7, y, 'GND')
        else:
            b.r0805('R%d' % (i + 1), '330', 128, y, 'VCC', n)
            b.r0805('D%d' % (i + 1), 'LED', 132, y, n, 'GND')
            b.track([(128.95, y), (131.05, y)], n)
            b.track([(132.95, y), (134.3, y)], 'GND', w=0.4); b.via(134.3, y, 'GND')
    b.track([(118.73, 120), (118.73, 113)], 'VCC', w=0.5)
    b.track([(118.73, 120), (118.73, 127)], 'VCC', w=0.5)
    b.track([(112.95, 113), (127.05, 113)], 'VCC', w=0.5)
    b.track([(112.95, 127), (127.05, 127)], 'VCC', w=0.5)
    b.zone('GND', 'B.Cu', [(cx + 17.4 * math.cos(a * math.pi / 24), cy + 17.4 * math.sin(a * math.pi / 24)) for a in range(48)])
    b.text('KiCad Master Pro', cx, 107.5, 1.1)
    b.text('BADGE', cx, 133.2, 1.2)
    b.text('+ BAT -', cx, 123.3, 0.8)
    return b


BOARDS = {'blinker': blinker, 'badge': badge}


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout, r.stderr)
        sys.exit('ошибка: ' + ' '.join(cmd))
    return r.stdout


def main():
    for bid, make in BOARDS.items():
        d = os.path.join(OUT, 'boards', bid)
        os.makedirs(d, exist_ok=True)
        pcb = os.path.join(d, bid + '.kicad_pcb')
        make().save(pcb)
        # заливка полигонов сохраняется в файл, чтобы DRC видел её
        tmp = tempfile.mkdtemp()
        run(['kicad-cli', 'pcb', 'export', 'gerbers', '--check-zones', '-l', 'F.Cu,B.Cu,F.Mask,B.Mask,F.Silkscreen,B.Silkscreen,F.Paste,B.Paste,Edge.Cuts', '-o', tmp + '/', pcb])
        rep = os.path.join(tmp, 'drc.json')
        run(['kicad-cli', 'pcb', 'drc', '--refill-zones', '--format', 'json', '--severity-error', '-o', rep, pcb])
        drc = json.load(open(rep))
        errs = [v for v in drc.get('violations', []) if v.get('type') not in ('lib_footprint_issues', 'lib_footprint_mismatch')]
        unc = drc.get('unconnected_items', [])
        print('%s: DRC ошибок %d, не разведено %d' % (bid, len(errs), len(unc)))
        for v in errs + unc:
            print('   ', v.get('type'), v.get('description'), [i.get('description') for i in v.get('items', [])][:2])
        run(['kicad-cli', 'pcb', 'export', 'drill', '--excellon-separate-th', '-o', tmp + '/', pcb])
        files = sorted(fn for fn in os.listdir(tmp) if fn != 'drc.json' and not fn.endswith('.gbrjob'))
        z = os.path.join(OUT, bid + '-gerber.zip')
        with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
            for fn in files:
                zf.write(os.path.join(tmp, fn), fn)
        print('   ', os.path.relpath(z, ROOT), files)
        shutil.rmtree(tmp)
        if errs or unc:
            sys.exit('DRC не пройден: ' + bid)


if __name__ == '__main__':
    main()
