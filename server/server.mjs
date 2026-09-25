/* =========================================================
   Локальный сервер для разработки (аналог `vercel dev` без аккаунта).
   Раздаёт статику и вызывает те же serverless-функции из папки api/,
   что и Vercel, — код API один и тот же.

     npm install
     npm run dev            # http://localhost:8080
     ANTHROPIC_API_KEY=... npm run dev   # с AI-ассистентом

   Без KV_REST_API_URL/KV_REST_API_TOKEN данные хранятся в .data/db.json.
   ========================================================= */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 8080);
const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));

// .env / .env.local — для удобства локального запуска
for (const f of ['.env', '.env.local']) {
  try {
    for (const line of fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n')) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (m && !(m[1] in process.env) && !m[2].includes('...') && !m[2].includes('xxxx')) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* нет файла */ }
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.pdf': 'application/pdf', '.zip': 'application/zip', '.csv': 'text/csv; charset=utf-8', '.mp4': 'video/mp4', '.md': 'text/markdown; charset=utf-8',
  '.kicad_sch': 'text/plain; charset=utf-8', '.kicad_pro': 'application/json', '.kicad_sym': 'text/plain; charset=utf-8', '.net': 'text/plain; charset=utf-8'
};
const PRIVATE = ['server', 'tools', 'lib', 'api', '.data', 'node_modules', '.git', '.env', '.env.local', '.env.example', '.vercel', 'package.json', 'package-lock.json', 'vercel.json'];

// как Vercel: req.query, req.body (JSON), res.status().json()
async function runFunction(name, req, res, url) {
  const file = path.join(ROOT, 'api', name + '.js');
  if (!/^[\w-]+$/.test(name) || !fs.existsSync(file)) { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end('{"error":"Нет такого метода API"}'); }
  req.query = Object.fromEntries(url.searchParams);
  if (['POST', 'PUT'].includes(req.method) && /json/.test(req.headers['content-type'] || '')) {
    const chunks = []; let size = 0;
    for await (const c of req) { size += c.length; if (size > 4.5 * 1024 * 1024) { res.writeHead(413); return res.end('{"error":"Запрос больше 4,5 МБ (лимит Vercel)"}'); } chunks.push(c); }
    const raw = Buffer.concat(chunks).toString('utf8');
    try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = raw; }
  }
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(o)); };
  const mod = await import(pathToFileURL(file).href);
  await mod.default(req, res);
}

function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.resolve(ROOT, '.' + rel);
  const top = path.relative(ROOT, file).split(path.sep)[0];
  if (!file.startsWith(ROOT + path.sep) || PRIVATE.includes(top)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': 'no-cache' });
    fs.createReadStream(file).pipe(res);
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  for (const r of vercel.rewrites || []) if (url.pathname === r.source) url.pathname = r.destination;
  try {
    const m = /^\/api\/([^/]+)\/?$/.exec(url.pathname);
    if (m) await runFunction(m[1], req, res, url);
    else serveStatic(req, res, url);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) { res.writeHead(500, { 'Content-Type': 'application/json' }); res.end('{"error":"Ошибка сервера"}'); } else res.end();
  }
}).listen(PORT, () => {
  const kv = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  console.log(`KiCad Мастер Pro: http://localhost:${PORT}  (AI: ${process.env.ANTHROPIC_API_KEY ? 'вкл' : 'выкл'}, данные: ${kv ? 'Redis' : '.data/db.json'})`);
});
