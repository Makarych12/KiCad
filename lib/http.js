/* Общие утилиты serverless-функций: CORS, JSON, тело запроса, вход, лимиты */
import { getStore, getJSON } from './store.js';

const ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// true — запрос обработан (preflight OPTIONS)
export function cors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return true; }
  return false;
}

export function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

export class HttpError extends Error { constructor(code, msg) { super(msg); this.code = code; } }

// Vercel сам разбирает JSON в req.body; локальный сервер делает так же
export async function body(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { throw new HttpError(400, 'Неверный JSON'); } }
    return req.body;
  }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new HttpError(400, 'Неверный JSON'); }
}

export function query(req) {
  if (req.query) return req.query;
  return Object.fromEntries(new URL(req.url, 'http://x').searchParams);
}

export async function currentUser(req) {
  const m = /^Bearer ([a-f0-9]{16,})$/.exec(req.headers.authorization || '');
  if (!m) return null;
  const s = await getStore();
  const uid = await s.get('token:' + m[1]);
  return uid ? getJSON(s, 'user:' + uid) : null;
}

export function ip(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '?').split(',')[0].trim();
}

// Лимит запросов: не больше perMin в минуту на ключ
export async function limited(key, perMin) {
  const s = await getStore();
  const k = 'rl:' + key + ':' + Math.floor(Date.now() / 60000);
  const n = await s.incr(k);
  if (n === 1) await s.expire(k, 70);
  return n > perMin;
}

export function clean(v, max) { return String(v || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max); }
export function publicUser(u) { return u && { id: u.id, name: u.name, avatar: u.avatar }; }

// Обёртка обработчика: CORS, разрешённые методы, единый формат ошибок
export function handler(methods, fn) {
  return async (req, res) => {
    if (cors(req, res)) return;
    if (!methods.includes(req.method)) return send(res, 405, { error: 'Метод не поддерживается' });
    try { await fn(req, res); } catch (e) {
      if (!(e instanceof HttpError)) console.error(e);
      if (!res.headersSent) send(res, e instanceof HttpError ? e.code : 500, { error: e instanceof HttpError ? e.message : 'Ошибка сервера' });
      else res.end();
    }
  };
}
