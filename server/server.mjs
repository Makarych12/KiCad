/* =========================================================
   KiCad Мастер Pro — сервер (Node.js 18+).
   Раздаёт сайт и включает онлайн-функции: чат, таблицу лидеров,
   синхронизацию прогресса, галерею проектов с рейтингом,
   рассылку и AI-ассистента (Claude).

   Запуск:
     cd server && npm install        # один раз (SDK Anthropic для ассистента)
     ANTHROPIC_API_KEY=... node server.mjs
   Затем откройте http://localhost:8080

   Хранилище — файл server/data/db.json и папка server/data/uploads.
   Авторизация упрощённая (ник + токен) — для учебного/домашнего
   использования. Для публичного сервера добавьте полноценную
   аутентификацию, HTTPS и модерацию.
   ========================================================= */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DATA = path.join(HERE, 'data');
const UPLOADS = path.join(DATA, 'uploads');
const DB_FILE = path.join(DATA, 'db.json');
const PORT = Number(process.env.PORT || 8080);
const MODEL = process.env.KM_MODEL || 'claude-opus-5';
const MAX_UPLOAD = 5 * 1024 * 1024;

fs.mkdirSync(UPLOADS, { recursive: true });

/* ---------- хранилище ---------- */
let db = { users: {}, tokens: {}, chat: [], gallery: [], newsletter: [], sync: {} };
try { db = Object.assign(db, JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))); } catch { /* первый запуск */ }
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFileSync(DB_FILE + '.tmp', JSON.stringify(db));
    fs.renameSync(DB_FILE + '.tmp', DB_FILE);
  }, 300);
}

/* ---------- AI (Claude) ---------- */
let anthropic = null;
try {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  // Ключ берётся из окружения (ANTHROPIC_API_KEY или профиль `ant auth login`)
  anthropic = new Anthropic();
} catch {
  console.log('ℹ️  AI-ассистент выключен: нет @anthropic-ai/sdk (npm install в папке server) или не задан ANTHROPIC_API_KEY.');
}
const SYSTEM = `Ты — дружелюбный преподаватель курса «KiCad Мастер Pro» по проектированию печатных плат в KiCad (версии 8–10) и основам электроники.
Отвечай по-русски, понятно для начинающего, но технически точно. Давай конкретные шаги с названиями пунктов меню KiCad (русская локализация и английский оригинал в скобках) и горячими клавишами.
Если вопрос про расчёт (резистор для светодиода, делитель, ширина дорожки) — покажи формулу и подставь числа.
Если не уверен в детали конкретной версии KiCad — так и скажи и подскажи, где проверить.
Не выдумывай номера деталей и ссылки. Предупреждай об опасности при работе с сетевым напряжением 230 В.`;

/* ---------- утилиты ---------- */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.zip': 'application/zip', '.csv': 'text/csv; charset=utf-8', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.kicad_sch': 'text/plain; charset=utf-8', '.kicad_pro': 'application/json', '.kicad_sym': 'text/plain; charset=utf-8', '.net': 'text/plain; charset=utf-8'
};
function send(res, code, obj, headers = {}) {
  const body = typeof obj === 'string' || Buffer.isBuffer(obj) ? obj : JSON.stringify(obj);
  res.writeHead(code, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, headers));
  res.end(body);
}
function readBody(req, limit = MAX_UPLOAD * 1.4) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(Object.assign(new Error('Слишком большой запрос'), { code: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(Object.assign(new Error('Неверный JSON'), { code: 400 })); } });
    req.on('error', reject);
  });
}
function auth(req) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  const uid = m && db.tokens[m[1]];
  return uid ? db.users[uid] : null;
}
function clean(s, max) { return String(s || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max); }
const buckets = new Map();
function limited(key, perMin) {
  const now = Date.now(), b = buckets.get(key) || [];
  const recent = b.filter((t) => now - t < 60000);
  if (recent.length >= perMin) { buckets.set(key, recent); return true; }
  recent.push(now); buckets.set(key, recent); return false;
}
function publicUser(u) { return u && { id: u.id, name: u.name, avatar: u.avatar }; }

/* ---------- SSE для чата ---------- */
const chatClients = new Set();
function broadcast(msg) {
  const data = 'data: ' + JSON.stringify(msg) + '\n\n';
  for (const c of chatClients) c.write(data);
}

/* ---------- маршруты API ---------- */
async function api(req, res, url) {
  const p = url.pathname, method = req.method;
  const ip = req.socket.remoteAddress;

  if (p === '/api/health') return send(res, 200, { ok: true, ai: !!anthropic, model: anthropic ? MODEL : null, users: Object.keys(db.users).length });

  if (p === '/api/register' && method === 'POST') {
    if (limited('reg:' + ip, 5)) return send(res, 429, { error: 'Слишком часто. Попробуйте через минуту.' });
    const b = await readBody(req, 4096);
    const name = clean(b.name, 32);
    if (name.length < 2) return send(res, 400, { error: 'Имя — от 2 символов' });
    if (Object.values(db.users).some((u) => u.name.toLowerCase() === name.toLowerCase())) return send(res, 409, { error: 'Такое имя уже занято' });
    const id = crypto.randomUUID(), token = crypto.randomBytes(24).toString('hex');
    db.users[id] = { id, name, avatar: ['🔌', '💡', '🔋', '📡', '🧲', '⚙️', '🛠️', '🔬'][Math.floor(Math.random() * 8)], created: Date.now(), stats: null };
    db.tokens[token] = id; save();
    return send(res, 200, { token, user: publicUser(db.users[id]) });
  }

  const user = auth(req);

  if (p === '/api/me') return user ? send(res, 200, { user: publicUser(user) }) : send(res, 401, { error: 'Нужен вход' });

  /* чат */
  if (p === '/api/chat' && method === 'GET') {
    const since = Number(url.searchParams.get('since') || 0);
    return send(res, 200, { messages: db.chat.filter((m) => m.t > since).slice(-100) });
  }
  if (p === '/api/chat' && method === 'POST') {
    if (!user) return send(res, 401, { error: 'Нужен вход' });
    if (limited('chat:' + user.id, 10)) return send(res, 429, { error: 'Не так быстро 🙂' });
    const b = await readBody(req, 8192);
    const text = clean(b.text, 2000);
    if (!text) return send(res, 400, { error: 'Пустое сообщение' });
    const msg = { id: crypto.randomUUID(), t: Date.now(), user: publicUser(user), text };
    db.chat.push(msg); if (db.chat.length > 2000) db.chat.splice(0, db.chat.length - 2000);
    save(); broadcast(msg);
    return send(res, 200, { message: msg });
  }
  if (p === '/api/chat/stream') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(': ok\n\n');
    chatClients.add(res);
    const ping = setInterval(() => res.write(': ping\n\n'), 25000);
    req.on('close', () => { clearInterval(ping); chatClients.delete(res); });
    return;
  }

  /* таблица лидеров */
  if (p === '/api/leaderboard' && method === 'GET') {
    const rows = Object.values(db.users).filter((u) => u.stats).map((u) => Object.assign(publicUser(u), u.stats))
      .sort((a, b) => b.xp - a.xp).slice(0, 100);
    return send(res, 200, { rows });
  }
  if (p === '/api/progress' && method === 'POST') {
    if (!user) return send(res, 401, { error: 'Нужен вход' });
    const b = await readBody(req, 4096);
    const n = (x, max) => Math.max(0, Math.min(max, Math.floor(Number(x) || 0)));
    user.stats = { xp: n(b.xp, 1e6), level: n(b.level, 1000), lessons: n(b.lessons, 1000), projects: n(b.projects, 1000), streak: n(b.streak, 10000), achievements: n(b.achievements, 1000), updated: Date.now() };
    save();
    return send(res, 200, { ok: true });
  }

  /* синхронизация прогресса между устройствами */
  if (p === '/api/sync') {
    if (!user) return send(res, 401, { error: 'Нужен вход' });
    if (method === 'GET') return send(res, 200, db.sync[user.id] || { state: null });
    if (method === 'PUT') {
      const b = await readBody(req, 2 * 1024 * 1024);
      if (!b.state || typeof b.state.xp !== 'number') return send(res, 400, { error: 'Нет данных прогресса' });
      db.sync[user.id] = { state: b.state, t: Date.now() }; save();
      return send(res, 200, { ok: true, t: db.sync[user.id].t });
    }
  }

  /* галерея проектов */
  if (p === '/api/gallery' && method === 'GET') {
    return send(res, 200, { items: db.gallery.map((g) => Object.assign({}, g, { ratings: undefined, rating: avg(g.ratings), votes: Object.keys(g.ratings).length })) });
  }
  if (p === '/api/gallery' && method === 'POST') {
    if (!user) return send(res, 401, { error: 'Нужен вход' });
    if (limited('up:' + user.id, 3)) return send(res, 429, { error: 'Слишком много загрузок подряд' });
    const b = await readBody(req);
    const title = clean(b.title, 80), desc = clean(b.desc, 1500);
    if (!title) return send(res, 400, { error: 'Нужно название' });
    const id = crypto.randomUUID();
    const item = { id, t: Date.now(), user: publicUser(user), title, desc, file: null, image: null, ratings: {} };
    for (const kind of ['file', 'image']) {
      const f = b[kind];
      if (!f || !f.data) continue;
      const buf = Buffer.from(String(f.data), 'base64');
      if (buf.length > MAX_UPLOAD) return send(res, 413, { error: 'Файл больше 5 МБ' });
      const ext = kind === 'image' ? (/\.(png|jpe?g|webp)$/i.exec(f.name || '') || ['.png'])[0].toLowerCase() : (/\.(zip|kicad_sch|kicad_pcb|kicad_pro|net)$/i.exec(f.name || '') || [null])[0];
      if (!ext) return send(res, 400, { error: 'Разрешены .zip, .kicad_sch, .kicad_pcb, .kicad_pro, .net' });
      const fname = id + '-' + kind + ext;
      fs.writeFileSync(path.join(UPLOADS, fname), buf);
      item[kind] = { name: clean(f.name, 120), size: buf.length, url: '/api/uploads/' + fname };
    }
    db.gallery.unshift(item); save();
    return send(res, 200, { item });
  }
  let m;
  if ((m = /^\/api\/gallery\/([\w-]+)\/rate$/.exec(p)) && method === 'POST') {
    if (!user) return send(res, 401, { error: 'Нужен вход' });
    const g = db.gallery.find((x) => x.id === m[1]);
    if (!g) return send(res, 404, { error: 'Не найдено' });
    const b = await readBody(req, 1024);
    const stars = Math.max(1, Math.min(5, Math.round(Number(b.stars) || 0)));
    g.ratings[user.id] = stars; save();
    return send(res, 200, { rating: avg(g.ratings), votes: Object.keys(g.ratings).length });
  }
  if ((m = /^\/api\/uploads\/([\w.-]+)$/.exec(p))) {
    const f = path.join(UPLOADS, path.basename(m[1]));
    if (!fs.existsSync(f)) return send(res, 404, { error: 'Нет файла' });
    const ext = path.extname(f).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Disposition': /\.(png|jpe?g|webp)$/.test(ext) ? 'inline' : 'attachment', 'X-Content-Type-Options': 'nosniff' });
    return fs.createReadStream(f).pipe(res);
  }

  /* рассылка */
  if (p === '/api/newsletter' && method === 'POST') {
    if (limited('nl:' + ip, 5)) return send(res, 429, { error: 'Слишком часто' });
    const b = await readBody(req, 1024);
    const email = clean(b.email, 120).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return send(res, 400, { error: 'Неверный email' });
    if (!db.newsletter.includes(email)) { db.newsletter.push(email); save(); }
    return send(res, 200, { ok: true });
  }

  /* AI-ассистент: потоковый ответ (SSE) */
  if (p === '/api/ai' && method === 'POST') {
    if (!anthropic) return send(res, 503, { error: 'AI-ассистент не настроен на сервере (npm install и ANTHROPIC_API_KEY).' });
    if (limited('ai:' + (user ? user.id : ip), 6)) return send(res, 429, { error: 'Слишком много вопросов подряд — подождите минуту.' });
    const b = await readBody(req, 200000);
    const messages = (Array.isArray(b.messages) ? b.messages : []).slice(-20)
      .filter((x) => (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string' && x.content.trim())
      .map((x) => ({ role: x.role, content: x.content.slice(0, 8000) }));
    if (!messages.length || messages[messages.length - 1].role !== 'user') return send(res, 400, { error: 'Нужен вопрос' });
    const context = clean(b.context, 2000);
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    const out = (o) => res.write('data: ' + JSON.stringify(o) + '\n\n');
    let aborted = false;
    req.on('close', () => { aborted = true; });
    try {
      const stream = anthropic.beta.messages.stream({
        model: MODEL,
        max_tokens: 16000,
        system: SYSTEM + (context ? '\n\nКонтекст: пользователь сейчас на странице курса: ' + context : ''),
        messages,
        // при отказе классификатора запрос автоматически повторяется на рекомендованной модели
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default'
      });
      for await (const event of stream) {
        if (aborted) { stream.abort(); break; }
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') out({ text: event.delta.text });
      }
      if (!aborted) {
        const final = await stream.finalMessage();
        if (final.stop_reason === 'refusal') out({ error: 'Ассистент не может ответить на этот вопрос. Попробуйте переформулировать.' });
        if (final.stop_reason === 'max_tokens') out({ text: '\n\n…(ответ обрезан по длине)' });
        out({ done: true, model: final.model });
      }
    } catch (e) {
      console.error('AI error:', e.status || '', e.message);
      out({ error: e.status === 401 ? 'Сервер: неверный API-ключ.' : e.status === 429 ? 'Лимит запросов к Claude исчерпан, попробуйте позже.' : 'Ошибка AI: ' + (e.message || 'неизвестная') });
    }
    return res.end();
  }

  return send(res, 404, { error: 'Нет такого метода API' });
}
function avg(r) { const v = Object.values(r || {}); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10 : 0; }

/* ---------- статика ---------- */
function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.resolve(ROOT, '.' + rel);
  if (!file.startsWith(ROOT + path.sep) || file.startsWith(DATA) || file.startsWith(path.join(ROOT, 'server'))) return send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain' });
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': ext === '.html' || file.endsWith('sw.js') ? 'no-cache' : 'public, max-age=300' });
    fs.createReadStream(file).pipe(res);
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else serveStatic(req, res, url);
  } catch (e) {
    if (!res.headersSent) send(res, e.code >= 400 && e.code < 600 ? e.code : 500, { error: e.message || 'Ошибка сервера' });
    else res.end();
  }
}).listen(PORT, () => {
  console.log(`KiCad Мастер Pro: http://localhost:${PORT}  (AI: ${anthropic ? MODEL : 'выключен'})`);
});
