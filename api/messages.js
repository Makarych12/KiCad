/* Чат сообщества. GET ?since=ts — новые сообщения; POST {text} — отправить */
import crypto from 'node:crypto';
import { handler, send, body, query, clean, limited, currentUser, publicUser, HttpError } from '../lib/http.js';
import { getStore } from '../lib/store.js';

const KEEP = 500;

export default handler(['GET', 'POST'], async (req, res) => {
  const s = await getStore();
  if (req.method === 'GET') {
    const since = Number(query(req).since || 0);
    const raw = await s.lrange('chat', 0, 99);
    const messages = raw.map((x) => { try { return JSON.parse(x); } catch { return null; } })
      .filter((m) => m && m.t > since).reverse();
    return send(res, 200, { messages });
  }
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, 'Нужен вход');
  if (await limited('chat:' + user.id, 10)) throw new HttpError(429, 'Не так быстро 🙂');
  const text = clean((await body(req)).text, 2000);
  if (!text) throw new HttpError(400, 'Пустое сообщение');
  const msg = { id: crypto.randomUUID(), t: Date.now(), user: publicUser(user), text };
  await s.lpush('chat', JSON.stringify(msg));
  await s.ltrim('chat', 0, KEEP - 1);
  send(res, 200, { message: msg });
});
