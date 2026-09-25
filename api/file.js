/* GET /api/file?id=…&kind=file|image — выдача файла из галереи */
import { handler, send, query } from '../lib/http.js';
import { getStore, getJSON } from '../lib/store.js';

export default handler(['GET'], async (req, res) => {
  const { id, kind } = query(req);
  if (!/^[\w-]{10,}$/.test(String(id || '')) || !['file', 'image'].includes(kind)) return send(res, 400, { error: 'Неверный запрос' });
  const f = await getJSON(await getStore(), 'gfile:' + id + ':' + kind);
  if (!f) return send(res, 404, { error: 'Нет файла' });
  const buf = Buffer.from(f.data, 'base64');
  res.statusCode = 200;
  res.setHeader('Content-Type', f.type);
  res.setHeader('Content-Length', buf.length);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
  res.setHeader('Content-Disposition', (kind === 'image' ? 'inline' : 'attachment') + "; filename*=UTF-8''" + encodeURIComponent(f.name));
  res.end(buf);
});
