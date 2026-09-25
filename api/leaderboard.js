/* Таблица лидеров. GET — топ-100; POST {xp, level, lessons, projects, streak, achievements} — обновить свою строку */
import { handler, send, body, currentUser, publicUser, limited, HttpError } from '../lib/http.js';
import { getStore, getJSON, setJSON } from '../lib/store.js';

export default handler(['GET', 'POST'], async (req, res) => {
  const s = await getStore();
  if (req.method === 'GET') {
    const ids = await s.zrevrange('lb', 0, 99);
    const users = await Promise.all(ids.map((id) => getJSON(s, 'user:' + id)));
    const rows = users.filter((u) => u && u.stats).map((u) => Object.assign(publicUser(u), u.stats));
    return send(res, 200, { rows });
  }
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, 'Нужен вход');
  if (await limited('lb:' + user.id, 20)) throw new HttpError(429, 'Слишком часто');
  const b = await body(req);
  const n = (x, max) => Math.max(0, Math.min(max, Math.floor(Number(x) || 0)));
  user.stats = { xp: n(b.xp, 1e6), level: n(b.level, 1000), lessons: n(b.lessons, 1000), projects: n(b.projects, 1000), streak: n(b.streak, 10000), achievements: n(b.achievements, 1000), updated: Date.now() };
  await setJSON(s, 'user:' + user.id, user);
  await s.zadd('lb', user.stats.xp, user.id);
  send(res, 200, { ok: true });
});
