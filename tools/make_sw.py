#!/usr/bin/env python3
"""Генерирует sw.js (service worker) и assets.json со списком всех файлов сайта.
Запускайте после изменения файлов:  python3 tools/make_sw.py"""
import hashlib, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP_DIRS = {'server', 'tools', 'node_modules', '.git', 'media/screens/.keep'}
CORE_EXT = {'.html', '.css', '.js', '.webmanifest', '.svg', '.png'}
files, h = [], hashlib.sha256()
for root, dirs, fns in os.walk(ROOT):
    rel_root = os.path.relpath(root, ROOT)
    dirs[:] = sorted(d for d in dirs if d not in SKIP_DIRS and not d.startswith('.'))
    for fn in sorted(fns):
        if fn.startswith('.') or fn in ('sw.js', 'assets.json') or fn.endswith('.kicad_prl'):
            continue
        rel = os.path.normpath(os.path.join(rel_root, fn)).replace(os.sep, '/')
        full = os.path.join(ROOT, rel)
        files.append(rel)
        h.update(rel.encode()); h.update(open(full, 'rb').read())
version = h.hexdigest()[:12]
core = ['./'] + [f for f in files if f.split('/')[0] in ('js', 'data', 'css', 'icons') or f in ('index.html', 'manifest.webmanifest')]
json.dump({'version': version, 'files': files}, open(os.path.join(ROOT, 'assets.json'), 'w'), ensure_ascii=False)
tpl = open(os.path.join(ROOT, 'tools', 'sw.template.js'), encoding='utf-8').read()
open(os.path.join(ROOT, 'sw.js'), 'w', encoding='utf-8').write(tpl.replace('__VERSION__', version).replace('__CORE__', json.dumps(core, ensure_ascii=False, indent=1)))
print('sw.js: версия', version, '| ядро:', len(core), 'файлов | всего:', len(files))
