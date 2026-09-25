/* POST /api/chat {messages, context} — AI-ассистент курса (Claude), ответ потоком (SSE) */
import Anthropic from '@anthropic-ai/sdk';
import { handler, send, body, clean, limited, ip, currentUser, HttpError } from '../lib/http.js';

export const config = { maxDuration: 60 };

const MODEL = process.env.KM_MODEL || 'claude-opus-5';
const SYSTEM = `Ты — дружелюбный преподаватель курса «KiCad Мастер Pro» по проектированию печатных плат в KiCad (версии 8–10) и основам электроники.
Отвечай по-русски, понятно для начинающего, но технически точно. Давай конкретные шаги с названиями пунктов меню KiCad (русская локализация и английский оригинал в скобках) и горячими клавишами.
Если вопрос про расчёт (резистор для светодиода, делитель, ширина дорожки) — покажи формулу и подставь числа.
Если не уверен в детали конкретной версии KiCad — так и скажи и подскажи, где проверить.
Не выдумывай номера деталей и ссылки. Предупреждай об опасности при работе с сетевым напряжением 230 В.`;

let client = null;

export default handler(['POST'], async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) throw new HttpError(503, 'AI-ассистент не настроен: задайте ANTHROPIC_API_KEY в переменных окружения.');
  const user = await currentUser(req);
  if (await limited('ai:' + (user ? user.id : ip(req)), 6)) throw new HttpError(429, 'Слишком много вопросов подряд — подождите минуту.');
  const b = await body(req);
  const messages = (Array.isArray(b.messages) ? b.messages : []).slice(-20)
    .filter((x) => (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string' && x.content.trim())
    .map((x) => ({ role: x.role, content: x.content.slice(0, 8000) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') throw new HttpError(400, 'Нужен вопрос');
  const context = clean(b.context, 2000);

  client = client || new Anthropic();
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  const out = (o) => res.write('data: ' + JSON.stringify(o) + '\n\n');
  let aborted = false;
  req.on('close', () => { aborted = true; });
  try {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM + (context ? '\n\nКонтекст: пользователь сейчас на странице курса: ' + context : ''),
      messages,
      // при отказе классификатора запрос автоматически повторяется на рекомендованной модели
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default'
    });
    for await (const event of stream) {
      if (aborted) { stream.abort(); break; }
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') out({ text: event.delta.text });
    }
    if (!aborted) {
      const final = await stream.finalMessage();
      if (final.stop_reason === 'refusal') out({ error: 'Ассистент не может ответить на этот вопрос. Попробуйте переформулировать.' });
      if (final.stop_reason === 'max_tokens') out({ text: '\n\n…(ответ обрезан по длине)' });
      out({ done: true, model: final.model });
    }
  } catch (e) {
    console.error('AI error:', e.status || '', e.message);
    out({ error: e.status === 401 ? 'Сервер: неверный API-ключ.' : e.status === 429 ? 'Лимит запросов к Claude исчерпан, попробуйте позже.' : 'Ошибка AI: ' + (e.message || 'неизвестная') });
  }
  res.end();
});
