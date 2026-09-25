#!/usr/bin/env python3
"""
Генерация проектов KiCad для сайта и их проверка через kicad-cli.

  python3 tools/build.py            — все шаблоны и проекты
  python3 tools/build.py t-led p01  — только выбранные

Результат:
  kicad/<id>/                       — проект KiCad (открывается двойным щелчком по .kicad_pro)
  kicad/<id>.zip                    — архив для скачивания
  kicad/<id>/preview.svg            — рендер схемы (kicad-cli)
  kicad/<id>/bom.csv                — спецификация (kicad-cli)
  data/kicad-gen.js                 — метаданные для сайта (цепи, детали, результаты ERC)
"""
import json
import os
import re
import shutil
import subprocess
import sys
import xml.etree.ElementTree as ET
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

from circuits import TEMPLATES          # noqa: E402
from projects import PROJECTS           # noqa: E402
from kicadlib import LIB                # noqa: E402

OUT = os.path.join(ROOT, 'kicad')
TEMPLATE_PRO = '/usr/share/kicad/template/kicad.kicad_pro'
DATE = '2026-09-25'


def run(cmd, cwd):
    r = subprocess.run(cmd, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    return r.returncode, r.stdout


def write_project(dirname, sheet, starter=False):
    os.makedirs(dirname, exist_ok=True)
    sch, syms = sheet.render(starter=starter, date=DATE)
    name = sheet.name
    with open(os.path.join(dirname, name + '.kicad_sch'), 'w', encoding='utf-8') as fh:
        fh.write(sch)
    with open(os.path.join(dirname, LIB + '.kicad_sym'), 'w', encoding='utf-8') as fh:
        fh.write(sheet.library(syms))
    with open(os.path.join(dirname, 'sym-lib-table'), 'w', encoding='utf-8') as fh:
        fh.write('(sym_lib_table\n  (version 7)\n  (lib (name "%s")(type "KiCad")(uri "${KIPRJMOD}/%s.kicad_sym")(options "")(descr "Символы курса KiCad Мастер Pro"))\n)\n' % (LIB, LIB))
    with open(TEMPLATE_PRO) as fh:
        pro = json.load(fh)
    pro['meta']['filename'] = name + '.kicad_pro'
    pro['sheets'] = [[sheet.root, 'Root']]
    with open(os.path.join(dirname, name + '.kicad_pro'), 'w') as fh:
        json.dump(pro, fh, indent=2)
    return name


def parse_netlist(path):
    tree = ET.parse(path)
    nets = {}
    for net in tree.getroot().iter('net'):
        nodes = sorted('%s.%s' % (n.get('ref'), n.get('pin')) for n in net.iter('node'))
        nets[net.get('name')] = nodes
    comps = {}
    for c in tree.getroot().iter('comp'):
        comps[c.get('ref')] = {'value': (c.findtext('value') or ''), 'footprint': (c.findtext('footprint') or '')}
    return nets, comps


def normalize_net_name(n):
    return n.lstrip('/')


def verify(sheet, nets):
    """Сравнение цепей из netlist с задуманными."""
    want = {}
    for n, nodes in sheet.nets().items():
        want[n] = sorted('%s.%s' % x for x in nodes)
    got = {normalize_net_name(k): v for k, v in nets.items()}
    problems = []
    for n, nodes in want.items():
        match = [k for k, v in got.items() if v == nodes]
        if not match:
            problems.append('цепь %s: ожидалось %s' % (n, nodes))
    # лишние соединения
    for k, v in got.items():
        if len(v) > 1 and v not in want.values():
            problems.append('лишняя цепь %s: %s' % (k, v))
    return problems


def build_one(kind, id_, title, sheet, meta):
    d = os.path.join(OUT, id_)
    if os.path.isdir(d):
        shutil.rmtree(d)
    name = write_project(d, sheet)
    sch = name + '.kicad_sch'
    # ERC
    code, out = run(['kicad-cli', 'sch', 'erc', '--format', 'json', '--severity-all', '-o', 'erc.json', sch], d)
    erc = json.load(open(os.path.join(d, 'erc.json')))
    allv = [v for s in erc.get('sheets', []) for v in s.get('violations', [])]
    # footprint_link_issues возникает только потому, что на сборочной машине не установлены
    # библиотеки посадочных мест KiCad; в обычной установке KiCad этих предупреждений нет
    viol = [v for v in allv if v.get('type') != 'footprint_link_issues']
    os.remove(os.path.join(d, 'erc.json'))
    # netlist
    run(['kicad-cli', 'sch', 'export', 'netlist', '--format', 'kicadxml', '-o', 'netlist.xml', sch], d)
    nets, comps = parse_netlist(os.path.join(d, 'netlist.xml'))
    os.remove(os.path.join(d, 'netlist.xml'))
    run(['kicad-cli', 'sch', 'export', 'netlist', '-o', name + '.net', sch], d)
    problems = verify(sheet, nets)
    # SVG и PDF
    run(['kicad-cli', 'sch', 'export', 'svg', '--exclude-drawing-sheet', '-o', '.', sch], d)
    svgs = [x for x in os.listdir(d) if x.endswith('.svg')]
    if svgs:
        os.replace(os.path.join(d, svgs[0]), os.path.join(d, 'preview.svg'))
        crop_svg(os.path.join(d, 'preview.svg'), sheet.bounds)
    run(['kicad-cli', 'sch', 'export', 'pdf', '-o', name + '.pdf', sch], d)
    # BOM
    run(['kicad-cli', 'sch', 'export', 'bom', '--fields', 'Reference,Value,Footprint,${QUANTITY},Description',
         '--labels', 'Обозначения,Номинал,Посадочное место,Кол-во,Описание', '--group-by', 'Value,Footprint',
         '--ref-range-delimiter', '', '-o', 'bom.csv', sch], d)
    # заготовка для практических проектов
    if kind == 'project':
        sd = os.path.join(d, 'starter')
        write_project(sd, sheet, starter=True)
        zipdir(sd, os.path.join(OUT, id_ + '-starter.zip'), name + '_starter')
        shutil.rmtree(sd)
    zipdir(d, os.path.join(OUT, id_ + '.zip'), name)
    status = 'OK' if not viol and not problems else 'ВНИМАНИЕ'
    print('%-14s %-9s ERC: %d  цепи: %s  %s' % (id_, status, len(viol), 'ok' if not problems else len(problems), title))
    for v in viol:
        print('     ERC', v.get('type'), '—', v.get('description'), [i.get('description') for i in v.get('items', [])][:2])
    for p in problems:
        print('     NET', p)
    entry = dict(meta)
    entry.update({
        'id': id_, 'kind': kind, 'title': title, 'name': name, 'sheetDesc': sheet.desc,
        'dir': 'kicad/' + id_ + '/', 'zip': 'kicad/' + id_ + '.zip',
        'starter': ('kicad/' + id_ + '-starter.zip') if kind == 'project' else None,
        'svg': 'kicad/' + id_ + '/preview.svg', 'pdf': 'kicad/' + id_ + '/' + name + '.pdf', 'bom': 'kicad/' + id_ + '/bom.csv',
        'erc': [{'type': v.get('type'), 'desc': v.get('description')} for v in viol],
        'parts': [{'ref': p.ref, 'value': p.value, 'sym': p.sym.name, 'fp': p.fp, 'desc': p.desc, 'sym_desc': p.sym.desc,
                   'pins': {pin[0]: pin[1] for pin in p.sym.pins}, 'sym_pins': len(p.sym.pins), 'symmetric': p.symmetric} for p in sheet.parts],
        'nets': {n: ['%s.%s' % x for x in nodes] for n, nodes in sheet.nets().items()},
    })
    return entry


def crop_svg(path, b):
    """Обрезка SVG kicad-cli по содержимому (viewBox в миллиметрах = координаты схемы)."""
    if not b:
        return
    txt = open(path, encoding='utf-8').read()
    w, h = b[2] - b[0], b[3] - b[1]
    txt = re.sub(r'width="[^"]+" height="[^"]+" viewBox="[^"]+"',
                 'width="%.2fmm" height="%.2fmm" viewBox="%.3f %.3f %.3f %.3f"' % (w, h, b[0], b[1], w, h), txt, count=1)
    open(path, 'w', encoding='utf-8').write(txt)


def zipdir(d, zpath, prefix):
    with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(d):
            for fn in files:
                if fn.endswith('.zip'):
                    continue
                full = os.path.join(root, fn)
                rel = os.path.relpath(full, d)
                if rel.startswith('starter' + os.sep):
                    continue
                z.write(full, os.path.join(prefix, rel))


def main():
    only = set(sys.argv[1:])
    os.makedirs(OUT, exist_ok=True)
    templates, projects = [], []
    for (id_, fn, cat, level, desc) in TEMPLATES:
        if only and id_ not in only:
            continue
        s = fn()
        templates.append(build_one('template', id_, s.title, s, {'cat': cat, 'level': level, 'desc': desc}))
    for pr in PROJECTS:
        if only and pr['id'] not in only:
            continue
        s = pr['build']()
        meta = {k: v for k, v in pr.items() if k != 'build'}
        projects.append(build_one('project', pr['id'], pr['title'], s, meta))
    if only:
        return
    js = ('/* Сгенерировано tools/build.py — не редактировать вручную. */\n'
          'KM.data.templates = ' + json.dumps(templates, ensure_ascii=False, indent=1) + ';\n'
          'KM.data.projects = ' + json.dumps(projects, ensure_ascii=False, indent=1) + ';\n')
    with open(os.path.join(ROOT, 'data', 'kicad-gen.js'), 'w', encoding='utf-8') as fh:
        fh.write(js)
    print('Шаблонов: %d, проектов: %d → data/kicad-gen.js' % (len(templates), len(projects)))


if __name__ == '__main__':
    main()
