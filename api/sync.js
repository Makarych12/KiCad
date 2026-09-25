/* Синхронизация прогресса между устройствами. GET — получить; PUT {state} — сохранить */
import { handler, send, body, currentUser, limited, HttpError } from '../lib/http.js';
import { getStore, getJSON, setJSON } from '../lib/store.js';

export default handler(['GET', 'PUT'], async (req, res) => {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, 'Нужен вход');
  const s = await getStore();
  if (req.method === 'GET') return send(res, 200, (await getJSON(s, 'sync:' + user.id)) || { state: null });
  if (await limited('sync:' + user.id, 10)) throw new HttpError(429, 'Слишком часто');
  const b = await body(req);
  if (!b.state || typeof b.state.xp !== 'number') throw new HttpError(400, 'Нет данных прогресса');
  const json = JSON.stringify(b.state);
  if (json.length > 900000) throw new HttpError(413, 'Прогресс слишком большой для синхронизации');
  const rec = { state: b.state, t: Date.now() };
  await setJSON(s, 'sync:' + user.id, rec);
  send(res, 200, { ok: true, t: rec.t });
});
