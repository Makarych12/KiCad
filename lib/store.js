/* =========================================================
   Хранилище данных для API.
   - На Vercel: Redis из Marketplace (Upstash) через @upstash/redis.
     Переменные KV_REST_API_URL / KV_REST_API_TOKEN (их создаёт
     интеграция Vercel) или UPSTASH_REDIS_REST_URL / _TOKEN.
   - Локально без Redis: память процесса + файл .data/db.json.
   Интерфейс одинаковый для обоих вариантов; значения — строки.
   ========================================================= */
import fs from 'node:fs';
import path from 'node:path';

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

let store = null;

export async function getStore() {
  if (store) return store;
  if (URL_ && TOKEN) {
    const { Redis } = await import('@upstash/redis');
    const r = new Redis({ url: URL_, token: TOKEN, automaticDeserialization: false });
    store = {
      kind: 'redis',
      get: (k) => r.get(k),
      set: (k, v, ex) => (ex ? r.set(k, v, { ex }) : r.set(k, v)),
      setnx: async (k, v) => (await r.set(k, v, { nx: true })) === 'OK',
      del: (k) => r.del(k),
      incr: (k) => r.incr(k),
      expire: (k, s) => r.expire(k, s),
      lpush: (k, v) => r.lpush(k, v),
      lrange: (k, a, b) => r.lrange(k, a, b),
      ltrim: (k, a, b) => r.ltrim(k, a, b),
      zadd: (k, score, member) => r.zadd(k, { score, member }),
      zrevrange: (k, a, b) => r.zrange(k, a, b, { rev: true }),
      hset: (k, f, v) => r.hset(k, { [f]: v }),
      // без автодесериализации hgetall приходит плоским массивом [поле, значение, …]
      hgetall: async (k) => {
        const v = await r.hgetall(k);
        if (!v) return {};
        if (!Array.isArray(v)) return v;
        const o = {};
        for (let i = 0; i < v.length; i += 2) o[v[i]] = v[i + 1];
        return o;
      },
      sadd: (k, m) => r.sadd(k, m)
    };
    return store;
  }
  store = memoryStore();
  return store;
}

/* ---------- резервное хранилище в памяти (для локального запуска) ---------- */
function memoryStore() {
  const file = process.env.VERCEL ? null : path.resolve(process.cwd(), process.env.LOCAL_DB || '.data/db.json');
  let d = { kv: {}, exp: {}, lists: {}, zsets: {}, hashes: {}, sets: {} };
  if (file) { try { d = Object.assign(d, JSON.parse(fs.readFileSync(file, 'utf8'))); } catch { /* новый файл */ } }
  let t = null;
  const persist = () => {
    if (!file) return;
    clearTimeout(t);
    t = setTimeout(() => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(d)); }, 200);
  };
  const alive = (k) => { if (d.exp[k] && d.exp[k] < Date.now()) { delete d.kv[k]; delete d.exp[k]; } return d.kv[k]; };
  const w = (fn) => (...a) => { const r = fn(...a); persist(); return Promise.resolve(r); };
  return {
    kind: 'memory',
    get: (k) => Promise.resolve(alive(k) ?? null),
    set: w((k, v, ex) => { d.kv[k] = String(v); if (ex) d.exp[k] = Date.now() + ex * 1000; else delete d.exp[k]; return 'OK'; }),
    setnx: w((k, v) => { if (alive(k) !== undefined) return false; d.kv[k] = String(v); return true; }),
    del: w((k) => { delete d.kv[k]; delete d.lists[k]; delete d.hashes[k]; return 1; }),
    incr: w((k) => { const n = Number(alive(k) || 0) + 1; d.kv[k] = String(n); return n; }),
    expire: w((k, s) => { d.exp[k] = Date.now() + s * 1000; return 1; }),
    lpush: w((k, v) => { (d.lists[k] = d.lists[k] || []).unshift(String(v)); return d.lists[k].length; }),
    lrange: (k, a, b) => Promise.resolve((d.lists[k] || []).slice(a, b === -1 ? undefined : b + 1)),
    ltrim: w((k, a, b) => { d.lists[k] = (d.lists[k] || []).slice(a, b + 1); return 'OK'; }),
    zadd: w((k, score, member) => { (d.zsets[k] = d.zsets[k] || {})[member] = score; return 1; }),
    zrevrange: (k, a, b) => Promise.resolve(Object.entries(d.zsets[k] || {}).sort((x, y) => y[1] - x[1]).map((x) => x[0]).slice(a, b + 1)),
    hset: w((k, f, v) => { (d.hashes[k] = d.hashes[k] || {})[f] = String(v); return 1; }),
    hgetall: (k) => Promise.resolve({ ...(d.hashes[k] || {}) }),
    sadd: w((k, m) => { const s = new Set(d.sets[k] || []); s.add(m); d.sets[k] = [...s]; return 1; })
  };
}

export async function getJSON(s, k) { const v = await s.get(k); if (v == null) return null; try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return null; } }
export function setJSON(s, k, v, ex) { return s.set(k, JSON.stringify(v), ex); }
