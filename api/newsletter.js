/* POST /api/newsletter {email} — подписка на новости */
import { handler, send, body, clean, limited, ip, HttpError } from '../lib/http.js';
import { getStore } from '../lib/store.js';

export default handler(['POST'], async (req, res) => {
  if (await limited('nl:' + ip(req), 5)) throw new HttpError(429, 'Слишком часто');
  const email = clean((await body(req)).email, 120).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Неверный email');
  await (await getStore()).sadd('newsletter', email);
  send(res, 200, { ok: true });
});
