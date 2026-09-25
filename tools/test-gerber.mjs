/* Проверка разбора Gerber/Excellon/ZIP на демо-платах: node tools/test-gerber.mjs */
import fs from 'node:fs';
import vm from 'node:vm';
// сайт подключает файл обычным <script>, поэтому выполняем его так же — в глобальном контексте
vm.runInThisContext(fs.readFileSync(new URL('../js/gerber-parse.js', import.meta.url), 'utf8'));
const G = globalThis.KM.gerber;
let fail = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fail++; };
const expect = {
  blinker: { layers: 'B.Cu,B.Mask,B.Silk,Drill,Drill,Edge,F.Cu,F.Mask,F.Paste,F.Silk', w: 40, h: 30, pth: 8, npth: 4, loops: 1, minTrack: 0.25 },
  badge: { layers: 'B.Cu,B.Mask,Drill,Drill,Edge,F.Cu,F.Mask,F.Paste,F.Silk', w: 36, h: 36, pth: 6, npth: 0, loops: 1, minTrack: 0.25 }
};
for (const [id, e] of Object.entries(expect)) {
  console.log(id);
  const files = await G.unzip(fs.readFileSync(`kicad/${id}-gerber.zip`));
  const b = G.board(files);
  const r = G.report(b);
  const names = b.layers.map((l) => l.layer).sort().join(',');
  ok(names === e.layers, 'слои опознаны: ' + names + (b.empty.length ? ' (пустые: ' + b.empty.join(', ') + ')' : ''));
  ok(b.outline.length === e.loops, 'контур замкнут: ' + b.outline.length);
  ok(Math.abs(r.w - e.w) < 0.05 && Math.abs(r.h - e.h) < 0.05, `размер ${r.w.toFixed(2)}×${r.h.toFixed(2)} мм`);
  ok(r.pth === e.pth && r.npth === e.npth, `отверстия PTH ${r.pth}, NPTH ${r.npth}`);
  ok(Math.abs(r.minTrack - e.minTrack) < 1e-6, 'мин. дорожка ' + r.minTrack);
  const cu = b.layers.find((l) => l.layer === 'F.Cu');
  const macro = Object.values(cu.aps).find((a) => a.type === 'RoundRect');
  ok(macro && macro.shapes.length === 9, 'макрос RoundRect раскрыт: ' + (macro && macro.shapes.length) + ' фигур');
  const bcu = b.layers.find((l) => l.layer === 'B.Cu');
  ok(bcu.ops.some((o) => o.t === 'region' && o.contours[0].length > 10), 'полигон GND на B.Cu');
  ok(b.skipped.length === 0 && b.layers.every((l) => !l.warnings.length), 'без пропусков и предупреждений ' + JSON.stringify(b.skipped.concat(...b.layers.map((l) => l.warnings))));
  console.log('   проверки:', r.checks.map((c) => c[0] + ' ' + c[1]).join(' | '));
}
// дюймовый Gerber с опущенными конечными нулями и Excellon без точек
const g = G.parseGerber('%FSTAX24Y24*%\n%MOIN*%\n%ADD10C,0.010*%\nD10*\nX01Y01D02*\nX02Y01D01*\nM02*');
ok(Math.abs(g.ops[0].x0 - 25.4) < 1e-9 && Math.abs(g.ops[0].x1 - 50.8) < 1e-9 && Math.abs(g.ops[0].w - 0.254) < 1e-9, 'дюймы + конечные нули');
const d = G.parseExcellon('M48\nINCH,TZ\nT1C0.035\n%\nT1\nX01000Y02000\nM30');
ok(Math.abs(d.holes[0].x - 2.54) < 1e-9 && Math.abs(d.holes[0].d - 0.889) < 1e-9, 'Excellon INCH,TZ');
console.log(fail ? `\n❌ Ошибок: ${fail}` : '\n✅ Все проверки пройдены');
process.exit(fail ? 1 : 0);
