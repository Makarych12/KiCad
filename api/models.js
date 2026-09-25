/* GET /api/models — каталог моделей OpenRouter с отметкой, какие доступны на этом сайте */
import { handler, send } from '../lib/http.js';
import { fetchModels, policy, denyReason } from '../lib/models.js';

export default handler(['GET'], async (req, res) => {
  const pol = policy();
  const list = await fetchModels();
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ policy: pol, models: list.map((m) => Object.assign({}, m, { deny: denyReason(m, pol) })) }));
});
