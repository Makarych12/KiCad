/* Каталог моделей OpenRouter и политика выбора модели для AI-ассистента.
   KM_MAX_PRICE       — максимум цены вывода, $ за 1 млн токенов (по умолчанию 30);
   KM_ALLOWED_MODELS  — необязательный список разрешённых моделей через запятую (можно с *),
                        например: anthropic/*,google/gemini-2.5-flash
   Так посетители сайта не смогут выбрать модель дороже, чем готов оплачивать владелец ключа. */
import { aiConfig } from './ai.js';

const TTL = 60 * 60 * 1000;
let cache = { t: 0, list: null };

const perMillion = (v) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? Math.round(n * 1e6 * 1000) / 1000 : null; };

export async function fetchModels() {
  if (cache.list && Date.now() - cache.t < TTL) return cache.list;
  const r = await fetch('https://openrouter.ai/api/v1/models', { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('OpenRouter models: HTTP ' + r.status);
  const data = (await r.json()).data || [];
  const list = data
    // :batch — варианты для пакетной обработки, в живом чате не работают
    .filter((m) => (m.architecture?.output_modalities || ['text']).includes('text') && !m.id.startsWith('~') && !m.id.endsWith(':batch'))
    .map((m) => ({
      id: m.id,
      name: m.name || m.id,
      vendor: m.id.split('/')[0],
      created: m.created || 0,
      context: m.context_length || m.top_provider?.context_length || 0,
      maxOutput: m.top_provider?.max_completion_tokens || null,
      input: perMillion(m.pricing?.prompt),
      output: perMillion(m.pricing?.completion),
      image: (m.architecture?.input_modalities || []).includes('image'),
      reasoning: (m.supported_parameters || []).includes('reasoning'),
      description: String(m.description || '').slice(0, 400)
    }));
  cache = { t: Date.now(), list };
  return list;
}

function patterns() {
  return String(process.env.KM_ALLOWED_MODELS || '').split(',').map((s) => s.trim()).filter(Boolean)
    .map((p) => new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'));
}

export function policy() {
  const cfg = aiConfig();
  return { provider: cfg ? cfg.provider : null, defaultModel: cfg ? (cfg.provider === 'anthropic' ? 'anthropic/' + cfg.model : cfg.model) : null,
    maxPrice: Number(process.env.KM_MAX_PRICE || 30), allowList: !!process.env.KM_ALLOWED_MODELS };
}

// Причина недоступности модели или null, если её можно выбрать
export function denyReason(m, pol = policy()) {
  if (!pol.provider) return 'AI на сайте не настроен';
  if (pol.provider === 'anthropic' && m.vendor !== 'anthropic') return 'на сайте подключён только ключ Anthropic';
  const pats = patterns();
  if (pats.length && !pats.some((re) => re.test(m.id))) return 'не входит в список разрешённых';
  if (m.output == null || m.input == null) return 'цена неизвестна';
  if (m.output > pol.maxPrice) return 'дороже лимита сайта ($' + pol.maxPrice + ' за 1 млн токенов вывода)';
  return null;
}

// Модель, которую реально использовать для запроса
export async function resolveModel(requested, ai) {
  if (!requested || typeof requested !== 'string' || !/^[\w.-]+\/[\w.:-]+$/.test(requested)) return ai.model;
  let list;
  try { list = await fetchModels(); } catch { return ai.model; }
  const m = list.find((x) => x.id === requested);
  if (!m || denyReason(m)) return ai.model;
  // у прямого API Anthropic идентификаторы без префикса и с дефисами: claude-opus-4.8 → claude-opus-4-8
  return ai.provider === 'anthropic' ? requested.replace(/^anthropic\//, '').replace(/\./g, '-') : requested;
}
