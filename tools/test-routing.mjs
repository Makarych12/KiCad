/* Проверка тренажёра трассировки: node tools/test-routing.mjs
   Эталонное решение каждого уровня проходит DRC и соединяет все цепи;
   испорченные варианты ловятся проверками. */
import fs from 'node:fs';
import vm from 'node:vm';
vm.runInThisContext(fs.readFileSync(new URL('../js/routing-engine.js', import.meta.url), 'utf8'));
const R = globalThis.KM.routing;
let fail = 0;
const ok = (c, m) => { console.log((c ? '  ✅ ' : '  ❌ ') + m); if (!c) fail++; };
for (const lv of R.levels) {
  console.log(lv.id, lv.title);
  const { tracks, vias } = R.split(lv.solution);
  const e = R.evaluate(lv, tracks, vias);
  ok(e.complete, `решение: цепей ${e.done.length}/${e.nets.length}, ошибок ${e.errors.length}`);
  e.errors.forEach((d) => console.log('     ⛔', d.msg, d.x.toFixed(2), d.y.toFixed(2)));
  e.warns.forEach((d) => console.log('     ⚠️', d.msg, d.x.toFixed(2), d.y.toFixed(2)));
  ok(e.stars === 3, 'три звезды у эталона: ' + e.stars);
  const empty = R.evaluate(lv, [], []);
  ok(!empty.complete && empty.con.rats.length >= empty.nets.length, 'без дорожек: воздушных линий ' + empty.con.rats.length);
}
// короткое замыкание и зазор
const l1 = R.levels[0];
let r = R.evaluate(l1, [{ net: 'VCC', layer: 'F', w: 0.5, pts: [[4, 8.5], [4, 11]] }], []);
ok(r.errors.some((d) => /Короткое/.test(d.msg)), 'дорожка через чужую площадку → короткое замыкание');
r = R.evaluate(l1, [{ net: 'GND', layer: 'F', w: 0.5, pts: [[4, 11], [25, 11]] }, { net: 'LED', layer: 'F', w: 0.5, pts: [[20, 11.6], [24, 11.6]] }], []);
ok(r.errors.some((d) => /Зазор/.test(d.msg)), 'близкие дорожки разных цепей → нарушение зазора');
r = R.evaluate(l1, [{ net: 'GND', layer: 'F', w: 0.5, pts: [[4, 11], [4, 19.9]] }], []);
ok(r.errors.some((d) => /краю/.test(d.msg)), 'дорожка у края платы');
const l3 = R.levels[2];
r = R.evaluate(l3, [{ net: 'VIN', layer: 'F', w: 0.25, pts: [[4, 14], [6.2, 16.2], [10, 16.2]] }], []);
ok(r.errors.some((d) => /силовая/.test(d.msg)), 'тонкая силовая дорожка');
ok(JSON.stringify(R.bend(0, 0, 5, 2)) === '[[3,0],[5,2]]' && JSON.stringify(R.bend(0, 0, 5, 2, true)) === '[[2,2],[5,2]]', 'изломы под 45°');
ok(JSON.stringify(R.bend(21, 5, 25, 9.05)) === '[[25,9.05]]' && JSON.stringify(R.bend(4, 11, 25, 10.95)) === '[[25,10.95]]', 'без микроизломов у площадок вне сетки');
r = R.evaluate(R.levels[3], [{ net: 'A', layer: 'F', w: 0.5, pts: [[1.6, 7], [6, 7], [14, 15], [32.4, 15]] }, { net: 'C', layer: 'F', w: 0.5, pts: [[1.6, 15], [18, 15], [26, 7], [32.4, 7]] }], []);
ok(r.errors.some((d) => /Короткое/.test(d.msg)), 'пересечение на одном слое → короткое замыкание');
console.log(fail ? `\n❌ Ошибок: ${fail}` : '\n✅ Все проверки пройдены');
process.exit(fail ? 1 : 0);
