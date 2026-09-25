/* =========================================================
   Интеграционный тест API.
   Запускает server/server.mjs дважды:
     1) с имитацией Upstash Redis REST (как Vercel KV / Marketplace);
     2) с локальным хранилищем в памяти.
   и проверяет все эндпоинты:  npm run test:api
   ========================================================= */
import http from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✅ ' : '  ❌ ') + msg); if (!cond) failed++; };

/* ---------- имитация Upstash REST ---------- */
function mockUpstash(port) {
  const kv = new Map(), exp = new Map(), lists = new Map(), zsets = new Map(), hashes = new Map(), sets = new Map();
  let calls = 0;
  const alive = (k) => { if (exp.has(k) && exp.get(k) < Date.now()) { kv.delete(k); exp.delete(k); } return kv.get(k); };
  function exec(cmd) {
    const [c, ...a] = cmd.map(String); const k = a[0];
    switch (c.toLowerCase()) {
      case 'get': return alive(k) ?? null;
      case 'set': {
        const opts = a.slice(2).map((x) => x.toLowerCase());
        if (opts.includes('nx') && alive(k) !== undefined) return null;
        kv.set(k, a[1]);
        const ex = opts.indexOf('ex'); if (ex >= 0) exp.set(k, Date.now() + Number(a[2 + ex + 1]) * 1000); else exp.delete(k);
        return 'OK';
      }
      case 'del': return [kv, lists, hashes].reduce((n, m) => n + (m.delete(k) ? 1 : 0), 0);
      case 'incr': { const n = Number(alive(k) || 0) + 1; kv.set(k, String(n)); return n; }
      case 'expire': exp.set(k, Date.now() + Number(a[1]) * 1000); return 1;
      case 'lpush': { const l = lists.get(k) || []; a.slice(1).forEach((v) => l.unshift(v)); lists.set(k, l); return l.length; }
      case 'lrange': { const l = lists.get(k) || []; const e = Number(a[2]); return l.slice(Number(a[1]), e === -1 ? undefined : e + 1); }
      case 'ltrim': { const l = lists.get(k) || []; lists.set(k, l.slice(Number(a[1]), Number(a[2]) + 1)); return 'OK'; }
      case 'zadd': { const z = zsets.get(k) || new Map(); z.set(a[2], Number(a[1])); zsets.set(k, z); return 1; }
      case 'zrange': {
        const z = [...(zsets.get(k) || new Map())].sort((x, y) => x[1] - y[1]).map((x) => x[0]);
        if (a.map((x) => x.toLowerCase()).includes('rev')) z.reverse();
        return z.slice(Number(a[1]), Number(a[2]) + 1);
      }
      case 'hset': { const h = hashes.get(k) || new Map(); for (let i = 1; i < a.length; i += 2) h.set(a[i], a[i + 1]); hashes.set(k, h); return 1; }
      case 'hgetall': return [...(hashes.get(k) || new Map())].flat();
      case 'sadd': { const s = sets.get(k) || new Set(); a.slice(1).forEach((v) => s.add(v)); sets.set(k, s); return 1; }
      default: throw new Error('mock: неизвестная команда ' + c);
    }
  }
  const enc = (v, b64) => (!b64 ? v : typeof v === 'string' ? Buffer.from(v).toString('base64') : Array.isArray(v) ? v.map((x) => enc(x, b64)) : v);
  const srv = http.createServer((req, res) => {
    let raw = ''; req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      calls++;
      if (req.headers.authorization !== 'Bearer test-token') { res.writeHead(401); return res.end('{"error":"Unauthorized"}'); }
      const b64 = String(req.headers['upstash-encoding'] || '').toLowerCase() === 'base64';
      const body = JSON.parse(raw);
      const run = (cmd) => { try { return { result: enc(exec(cmd), b64) }; } catch (e) { return { error: e.message }; } };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(req.url.startsWith('/pipeline') || req.url.startsWith('/multi-exec') ? body.map(run) : run(body)));
    });
  });
  return new Promise((r) => srv.listen(port, () => r({ srv, calls: () => calls })));
}

/* ---------- сценарии ---------- */
async function suite(label, env, port) {
  console.log('\n▶ ' + label);
  const child = spawn(process.execPath, ['server/server.mjs'], { cwd: ROOT, env: { ...process.env, ...env, PORT: String(port), ANTHROPIC_API_KEY: '' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = ''; child.stdout.on('data', (d) => { log += d; }); child.stderr.on('data', (d) => { log += d; });
  const B = 'http://127.0.0.1:' + port;
  for (let i = 0; i < 50; i++) { try { await fetch(B + '/api/health'); break; } catch { await sleep(100); } }
  const call = async (method, p, body, token, extra = {}) => {
    const r = await fetch(B + p, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...extra }, body: body ? JSON.stringify(body) : undefined });
    const ct = r.headers.get('content-type') || '';
    return { status: r.status, headers: r.headers, json: ct.includes('json') ? await r.json() : null, buf: ct.includes('json') ? null : Buffer.from(await r.arrayBuffer()) };
  };
  try {
    const h = await call('GET', '/api/health');
    ok(h.status === 200 && h.json.ok, 'health: ' + JSON.stringify(h.json));
    const pre = await fetch(B + '/api/messages', { method: 'OPTIONS' });
    ok(pre.status === 204 && pre.headers.get('access-control-allow-origin') === '*', 'CORS preflight 204 + Access-Control-Allow-Origin');

    const name = 'Тест' + Math.floor(Math.random() * 1e6);
    const reg = await call('POST', '/api/register', { name });
    ok(reg.status === 200 && reg.json.token, 'регистрация');
    const t = reg.json.token;
    ok((await call('POST', '/api/register', { name: name.toUpperCase() })).status === 409, 'повтор имени → 409');
    ok((await call('GET', '/api/register', null, t)).json.user.name === name, 'GET /api/register возвращает пользователя');
    const reg2 = await call('POST', '/api/register', { name: name + '_2' });

    ok((await call('POST', '/api/messages', { text: 'x' })).status === 401, 'чат без входа → 401');
    const m = await call('POST', '/api/messages', { text: 'Привет, <b>KiCad</b>!' }, t);
    ok(m.status === 200 && m.json.message.text.includes('KiCad'), 'сообщение отправлено');
    await call('POST', '/api/messages', { text: 'Второе' }, reg2.json.token);
    const list = await call('GET', '/api/messages?since=0');
    ok(list.json.messages.length === 2 && list.json.messages[0].text.startsWith('Привет'), 'история чата в хронологическом порядке');
    const since = await call('GET', '/api/messages?since=' + list.json.messages[0].t);
    ok(since.json.messages.length === 1, 'опрос ?since= возвращает только новые');

    await call('POST', '/api/leaderboard', { xp: 120, level: 2, lessons: 3, projects: 1, streak: 2, achievements: 4 }, t);
    await call('POST', '/api/leaderboard', { xp: 500, level: 4, lessons: 9, projects: 2, streak: 5, achievements: 7 }, reg2.json.token);
    const lb = await call('GET', '/api/leaderboard');
    ok(lb.json.rows.length === 2 && lb.json.rows[0].xp === 500 && lb.json.rows[1].name === name, 'лидеры отсортированы по опыту');
    await call('POST', '/api/leaderboard', { xp: 900 }, t);
    ok((await call('GET', '/api/leaderboard')).json.rows[0].name === name, 'обновление опыта меняет место');

    ok((await call('GET', '/api/sync', null, t)).json.state === null, 'sync: пусто');
    const st = { xp: 900, lessons: { l01: { done: 1 } }, settings: { theme: 'dark' } };
    ok((await call('PUT', '/api/sync', { state: st }, t)).json.ok, 'sync: сохранено');
    ok((await call('GET', '/api/sync', null, t)).json.state.lessons.l01.done === 1, 'sync: получено обратно');

    const img = fs.readFileSync(path.join(ROOT, 'icons/icon-192.png'));
    const net = fs.readFileSync(path.join(ROOT, 'kicad/p01/p01_led_module.net'));
    const up = await call('POST', '/api/submit-project', { title: 'Мой светодиодный модуль', desc: 'Первая плата', file: { name: 'led.net', data: net.toString('base64') }, image: { name: 'photo.png', data: img.toString('base64') } }, t);
    ok(up.status === 200 && up.json.item.file.url.startsWith('/api/file?'), 'проект загружен');
    const bad = await call('POST', '/api/submit-project', { title: 'x', file: { name: 'virus.exe', data: 'AAAA' } }, t);
    ok(bad.status === 400, 'запрещённое расширение → 400');
    const big = await call('POST', '/api/submit-project', { title: 'big', file: { name: 'a.zip', data: Buffer.alloc(800 * 1024).toString('base64') } }, t);
    ok(big.status === 413, 'файл > 700 КБ → 413');
    const gal = await call('GET', '/api/submit-project');
    ok(gal.json.items.length === 1 && gal.json.items[0].title === 'Мой светодиодный модуль', 'галерея: список');
    const id = gal.json.items[0].id;
    await call('POST', '/api/submit-project?action=rate&id=' + id, { stars: 5 }, t);
    const rate = await call('POST', '/api/submit-project?action=rate&id=' + id, { stars: 2 }, reg2.json.token);
    ok(rate.json.rating === 3.5 && rate.json.votes === 2, 'рейтинг: среднее 3.5 из 2 голосов');
    const f = await call('GET', up.json.item.file.url);
    ok(f.status === 200 && f.buf.equals(net), 'скачивание файла совпадает с загруженным');
    const im = await call('GET', up.json.item.image.url);
    ok(im.headers.get('content-type') === 'image/png' && im.buf.equals(img), 'картинка отдаётся как image/png');

    ok((await call('POST', '/api/newsletter', { email: 'user@example.com' })).json.ok, 'подписка на рассылку');
    ok((await call('POST', '/api/newsletter', { email: 'нет' })).status === 400, 'неверный email → 400');
    const ai = await call('POST', '/api/chat', { messages: [{ role: 'user', content: 'Привет' }] });
    ok(ai.status === 503, 'AI без ключа → 503 с понятной ошибкой');
    ok((await call('GET', '/api/nope')).status === 404, 'неизвестный метод → 404');
    ok((await call('DELETE', '/api/messages')).status === 405, 'неподдерживаемый метод → 405');
    let limitedHit = false;
    for (let i = 0; i < 12; i++) if ((await call('POST', '/api/messages', { text: 'спам ' + i }, t)).status === 429) { limitedHit = true; break; }
    ok(limitedHit, 'ограничение частоты сообщений (429)');
    ok((await fetch(B + '/lib/store.js')).status === 403 && (await fetch(B + '/api/../.env.example')).status !== 200, 'служебные файлы не раздаются');
    ok((await fetch(B + '/')).status === 200 && (await fetch(B + '/kicad/p01.zip')).status === 200, 'статика: главная и архивы KiCad');
  } catch (e) { ok(false, 'исключение: ' + e.stack); }
  child.kill();
  if (/Error|ошибка/i.test(log.replace(/KiCad Мастер Pro.*\n/, ''))) console.log('  лог сервера:\n' + log);
}

const mock = await mockUpstash(18090);
await suite('Upstash Redis REST (как на Vercel)', { KV_REST_API_URL: 'http://127.0.0.1:18090', KV_REST_API_TOKEN: 'test-token' }, 18081);
console.log('  запросов к Redis: ' + mock.calls());
ok(mock.calls() > 20, 'данные действительно шли через Redis');
mock.srv.close();
const tmp = path.join(os.tmpdir(), 'km-test-' + Date.now() + '.json');
await suite('Локальное хранилище (без Redis)', { KV_REST_API_URL: '', KV_REST_API_TOKEN: '', UPSTASH_REDIS_REST_URL: '', LOCAL_DB: tmp }, 18082);
fs.rmSync(tmp, { force: true });
console.log(failed ? `\n❌ Провалено проверок: ${failed}` : '\n✅ Все проверки пройдены');
process.exit(failed ? 1 : 0);
