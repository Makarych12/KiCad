/* Галерея проектов участников.
   GET                          — список
   POST {title, desc, file?, image?}  — опубликовать (file/image: {name, data: base64})
   POST ?action=rate&id=… {stars}     — оценить 1–5 */
import crypto from 'node:crypto';
import { handler, send, body, query, clean, limited, currentUser, publicUser, HttpError } from '../lib/http.js';
import { getStore, getJSON, setJSON } from '../lib/store.js';

// Файлы хранятся в Redis, поэтому лимит небольшой (запрос к Upstash ограничен ~1 МБ на бесплатном тарифе)
const MAX_FILE = 700 * 1024;
const KINDS = {
  file: { re: /\.(zip|kicad_sch|kicad_pcb|kicad_pro|net)$/i, type: 'application/octet-stream', err: 'Разрешены .zip, .kicad_sch, .kicad_pcb, .kicad_pro, .net' },
  image: { re: /\.(png|jpe?g|webp)$/i, type: null, err: 'Картинка: .png, .jpg или .webp' }
};
const IMG_TYPE = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };

function avg(r) { const v = Object.values(r).map(Number); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length * 10) / 10 : 0; }

export default handler(['GET', 'POST'], async (req, res) => {
  const s = await getStore(), q = query(req);
  if (req.method === 'GET') {
    const ids = await s.lrange('gallery', 0, 99);
    const items = await Promise.all(ids.map(async (id) => {
      const g = await getJSON(s, 'gitem:' + id);
      if (!g) return null;
      const r = await s.hgetall('grate:' + id);
      return Object.assign(g, { rating: avg(r), votes: Object.keys(r).length });
    }));
    return send(res, 200, { items: items.filter(Boolean) });
  }
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, 'Нужен вход');

  if (q.action === 'rate') {
    const id = String(q.id || '');
    if (!/^[\w-]{10,}$/.test(id) || !(await getJSON(s, 'gitem:' + id))) throw new HttpError(404, 'Не найдено');
    const stars = Math.max(1, Math.min(5, Math.round(Number((await body(req)).stars) || 0)));
    await s.hset('grate:' + id, user.id, stars);
    const r = await s.hgetall('grate:' + id);
    return send(res, 200, { rating: avg(r), votes: Object.keys(r).length });
  }

  if (await limited('up:' + user.id, 3)) throw new HttpError(429, 'Слишком много загрузок подряд');
  const b = await body(req);
  const title = clean(b.title, 80), desc = clean(b.desc, 1500);
  if (!title) throw new HttpError(400, 'Нужно название');
  const id = crypto.randomUUID();
  const item = { id, t: Date.now(), user: publicUser(user), title, desc, file: null, image: null };
  for (const kind of ['file', 'image']) {
    const f = b[kind];
    if (!f || !f.data) continue;
    const name = clean(f.name, 120), m = KINDS[kind].re.exec(name);
    if (!m) throw new HttpError(400, KINDS[kind].err);
    const buf = Buffer.from(String(f.data), 'base64');
    if (buf.length > MAX_FILE) throw new HttpError(413, 'Файл больше 700 КБ');
    const type = kind === 'image' ? IMG_TYPE[m[1].toLowerCase()] : KINDS.file.type;
    await setJSON(s, 'gfile:' + id + ':' + kind, { name, type, data: buf.toString('base64') });
    item[kind] = { name, size: buf.length, url: '/api/file?id=' + id + '&kind=' + kind };
  }
  await setJSON(s, 'gitem:' + id, item);
  await s.lpush('gallery', id);
  await s.ltrim('gallery', 0, 499);
  send(res, 200, { item });
});
