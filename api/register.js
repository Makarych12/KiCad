/* POST /api/register {name} → {token, user}; GET — текущий пользователь */
import crypto from 'node:crypto';
import { handler, send, body, clean, limited, ip, currentUser, publicUser, HttpError } from '../lib/http.js';
import { getStore, setJSON } from '../lib/store.js';

const AVATARS = ['🔌', '💡', '🔋', '📡', '🧲', '⚙️', '🛠️', '🔬'];

export default handler(['GET', 'POST'], async (req, res) => {
  if (req.method === 'GET') {
    const u = await currentUser(req);
    return u ? send(res, 200, { user: publicUser(u) }) : send(res, 401, { error: 'Нужен вход' });
  }
  if (await limited('reg:' + ip(req), 5)) throw new HttpError(429, 'Слишком часто. Попробуйте через минуту.');
  const name = clean((await body(req)).name, 32);
  if (name.length < 2) throw new HttpError(400, 'Имя — от 2 символов');
  const s = await getStore();
  const id = crypto.randomUUID(), token = crypto.randomBytes(24).toString('hex');
  if (!(await s.setnx('username:' + name.toLowerCase(), id))) throw new HttpError(409, 'Такое имя уже занято');
  const user = { id, name, avatar: AVATARS[crypto.randomInt(AVATARS.length)], created: Date.now(), stats: null };
  await setJSON(s, 'user:' + id, user);
  await s.set('token:' + token, id);
  await s.incr('stat:users');
  send(res, 200, { token, user: publicUser(user) });
});
