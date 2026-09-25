/* POST /api/chat {messages, context} — AI-ассистент курса (Claude), ответ потоком (SSE) */
import { handler, body, clean, limited, ip, currentUser, HttpError } from '../lib/http.js';
import { aiClient, streamParams } from '../lib/ai.js';

const SYSTEM = `Ты — дружелюбный преподаватель курса «KiCad Мастер Pro» по проектированию печатных плат в KiCad (версии 8–10) и основам электроники.
Отвечай по-русски, понятно для начинающего, но технически точно. Давай конкретные шаги с названиями пунктов меню KiCad (русская локализация и английский оригинал в скобках) и горячими клавишами.
Если вопрос про расчёт (резистор для светодиода, делитель, ширина дорожки) — покажи формулу и подставь числа.
Если не уверен в детали конкретной версии KiCad — так и скажи и подскажи, где проверить.
Не выдумывай номера деталей и ссылки. Предупреждай об опасности при работе с сетевым напряжением 230 В.`;

export default handler(['POST'], async (req, res) => {
  const ai = aiClient();
  if (!ai) throw new HttpError(503, 'AI-ассистент не настроен: задайте ANTHROPIC_API_KEY или OPENROUTER_API_KEY в переменных окружения.');
  const user = await currentUser(req);
  if (await limited('ai:' + (user ? user.id : ip(req)), 6)) throw new HttpError(429, 'Слишком много вопросов подряд — подождите минуту.');
  const b = await body(req);
  const messages = (Array.isArray(b.messages) ? b.messages : []).slice(-20)
    .filter((x) => (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string' && x.content.trim())
    .map((x) => ({ role: x.role, content: x.content.slice(0, 8000) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') throw new HttpError(400, 'Нужен вопрос');
  const context = clean(b.context, 2000);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');
  const out = (o) => res.write('data: ' + JSON.stringify(o) + '\n\n');
  let aborted = false;
  // клиент закрыл вкладку/нажал «Стоп» — прекращаем генерацию
  res.on('close', () => { if (!res.writableEnded) aborted = true; });
  try {
    const params = streamParams(ai, {
      max_tokens: 16000,
      system: SYSTEM + (context ? '\n\nКонтекст: пользователь сейчас на странице курса: ' + context : ''),
      messages
    });
    // у Anthropic — beta-поток с серверным fallback при отказе; у OpenRouter — обычный
    const stream = ai.provider === 'anthropic' ? ai.client.beta.messages.stream(params) : ai.client.messages.stream(params);
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
    out({ error: e.status === 401 ? 'Сервер: неверный API-ключ (' + ai.provider + ').' : e.status === 402 ? 'На балансе OpenRouter недостаточно средств.' : e.status === 429 ? 'Лимит запросов к Claude исчерпан, попробуйте позже.' : 'Ошибка AI: ' + (e.message || 'неизвестная') });
  }
  res.end();
});
