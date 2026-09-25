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

// Параметры потока: серверные fallbacks есть только у API Anthropic
export function streamParams(cfg, base) {
  return cfg.provider === 'anthropic'
    ? { ...base, model: cfg.model, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }
    : { ...base, model: cfg.model };
}
