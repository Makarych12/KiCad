/* Настройка клиента Claude: напрямую через Anthropic или через OpenRouter.
   OpenRouter принимает запросы в формате Anthropic Messages API по адресу
   https://openrouter.ai/api, поэтому используется тот же официальный SDK. */
import Anthropic from '@anthropic-ai/sdk';

let cached = null;

export function aiConfig() {
  if (process.env.ANTHROPIC_API_KEY) {
    return { provider: 'anthropic', model: process.env.KM_MODEL || 'claude-opus-5' };
  }
  if (process.env.OPENROUTER_API_KEY) {
    return { provider: 'openrouter', model: process.env.KM_MODEL || 'anthropic/claude-opus-5' };
  }
  return null;
}

export function aiClient() {
  const cfg = aiConfig();
  if (!cfg) return null;
  if (cached && cached.provider === cfg.provider) return cached;
  const client = cfg.provider === 'anthropic'
    ? new Anthropic()
    : new Anthropic({
      baseURL: 'https://openrouter.ai/api',
      apiKey: null,
      authToken: process.env.OPENROUTER_API_KEY,
      defaultHeaders: { 'HTTP-Referer': process.env.SITE_URL || 'https://github.com/Makarych12/KiCad', 'X-Title': 'KiCad Master Pro' }
    });
  cached = { ...cfg, client };
  return cached;
}

// Параметры потока. Серверные fallbacks есть только у API Anthropic и нужны моделям,
// у которых бывают отказы классификаторов (Claude Opus 5, Claude Fable 5.1)
const WITH_FALLBACK = new Set(['claude-opus-5', 'claude-fable-5-1']);
export function streamParams(cfg, base, model) {
  model = model || cfg.model;
  return cfg.provider === 'anthropic' && WITH_FALLBACK.has(model)
    ? { ...base, model, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }
    : { ...base, model };
}
