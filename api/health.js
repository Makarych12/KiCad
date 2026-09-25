/* GET /api/health — состояние онлайн-функций */
import { handler, send } from '../lib/http.js';
import { getStore } from '../lib/store.js';

export default handler(['GET'], async (req, res) => {
  const s = await getStore();
  send(res, 200, { ok: true, ai: !!process.env.ANTHROPIC_API_KEY, model: process.env.ANTHROPIC_API_KEY ? (process.env.KM_MODEL || 'claude-opus-5') : null, storage: s.kind });
});
