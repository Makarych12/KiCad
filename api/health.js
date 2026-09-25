/* GET /api/health — состояние онлайн-функций */
import { handler, send } from '../lib/http.js';
import { getStore } from '../lib/store.js';
import { aiConfig } from '../lib/ai.js';

export default handler(['GET'], async (req, res) => {
  const s = await getStore();
  const ai = aiConfig();
  send(res, 200, { ok: true, ai: !!ai, model: ai ? ai.model : null, provider: ai ? ai.provider : null, storage: s.kind });
});
