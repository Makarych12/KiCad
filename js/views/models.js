/* Каталог моделей OpenRouter и выбор модели для AI-ассистента */
(function () {
  var st = { q: '', vendor: '', sort: 'recommended', onlyOk: true, free: false, vision: false, page: 1 };
  var PER = 48, data = null, loading = null;
  var TOP = ['anthropic', 'openai', 'google', 'meta-llama', 'mistralai', 'deepseek', 'qwen', 'x-ai'];
  var VENDOR = { anthropic: 'Anthropic', openai: 'OpenAI', google: 'Google', 'meta-llama': 'Meta', mistralai: 'Mistral', deepseek: 'DeepSeek', qwen: 'Qwen', 'x-ai': 'xAI', microsoft: 'Microsoft', nvidia: 'NVIDIA', cohere: 'Cohere', amazon: 'Amazon', moonshotai: 'Moonshot', 'z-ai': 'Zhipu', minimax: 'MiniMax', perplexity: 'Perplexity', openrouter: 'OpenRouter' };
  var COLORS = ['#0f7b5a', '#b8672e', '#1d5fb8', '#6b46c1', '#c0392b', '#2b7a78', '#a15c00', '#5d6d7e'];

  function vendorName(v) { return VENDOR[v] || v.replace(/-/g, ' ').replace(/^\w/, function (c) { return c.toUpperCase(); }); }
  function color(v) { var h = 0; for (var i = 0; i < v.length; i++) h = (h * 31 + v.charCodeAt(i)) >>> 0; return COLORS[h % COLORS.length]; }
  function price(v) { return v == null ? '—' : v === 0 ? 'бесплатно' : '$' + (v < 0.1 ? v.toFixed(3) : v < 10 ? v.toFixed(2) : v.toFixed(1)); }
  function ctx(n) { return !n ? '—' : n >= 1e6 ? (n / 1e6).toFixed(n % 1e6 ? 1 : 0) + 'M' : Math.round(n / 1000) + 'K'; }
  function current() { return KM.store.state.settings.aiModel || (data && data.policy.defaultModel) || 'anthropic/claude-opus-5'; }

  // Если API сайта недоступно — каталог напрямую с OpenRouter, доступность по собственному ключу пользователя
  function load() {
    if (loading) return loading;
    var viaApi = KM.api.online ? KM.api.req('GET', '/api/models', null, 20000) : Promise.reject(new Error('offline'));
    loading = viaApi.catch(function () {
      return fetch('https://openrouter.ai/api/v1/models').then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).then(function (j) {
        var key = KM.store.state.settings.aiKey || '';
        var prov = /^sk-or-/.test(key) ? 'openrouter' : /^sk-ant-/.test(key) ? 'anthropic' : null;
        var pm = function (v) { var n = Number(v); return isFinite(n) && n >= 0 ? Math.round(n * 1e9) / 1e3 : null; };
        return {
          policy: { provider: prov, defaultModel: prov === 'anthropic' ? 'anthropic/claude-opus-5' : prov ? 'anthropic/claude-opus-5' : null, maxPrice: null, local: true },
          models: j.data.filter(function (m) { return (m.architecture.output_modalities || ['text']).indexOf('text') >= 0 && m.id[0] !== '~' && !/:batch$/.test(m.id); }).map(function (m) {
            var v = m.id.split('/')[0], out = pm(m.pricing.completion), inp = pm(m.pricing.prompt);
            return { id: m.id, name: m.name, vendor: v, created: m.created, context: m.context_length, maxOutput: m.top_provider && m.top_provider.max_completion_tokens, input: inp, output: out,
              image: (m.architecture.input_modalities || []).indexOf('image') >= 0, reasoning: (m.supported_parameters || []).indexOf('reasoning') >= 0, description: String(m.description || '').slice(0, 400),
              deny: !prov ? 'ни на сайте, ни в Настройках нет ключа' : prov === 'anthropic' && v !== 'anthropic' ? 'с ключом Anthropic доступны только модели Claude' : null };
          })
        };
      });
    }).then(function (d) { data = d; return d; }).catch(function (e) { loading = null; throw e; });
    return loading;
  }

  function filtered() {
    var q = st.q.trim().toLowerCase(), words = q ? q.split(/\s+/) : [];
    var L = data.models.filter(function (m) {
      if (st.vendor && m.vendor !== st.vendor) return false;
      if (st.onlyOk && m.deny) return false;
      if (st.free && m.output !== 0) return false;
      if (st.vision && !m.image) return false;
      var hay = (m.name + ' ' + m.id + ' ' + vendorName(m.vendor)).toLowerCase();
      return words.every(function (w) { return hay.indexOf(w) >= 0; });
    });
    var cmp = {
      recommended: function (a, b) { var ia = TOP.indexOf(a.vendor), ib = TOP.indexOf(b.vendor); ia = ia < 0 ? 99 : ia; ib = ib < 0 ? 99 : ib; return ia - ib || b.created - a.created; },
      newest: function (a, b) { return b.created - a.created; },
      cheap: function (a, b) { return (a.output == null ? 1e9 : a.output) - (b.output == null ? 1e9 : b.output); },
      pricey: function (a, b) { return (b.output || 0) - (a.output || 0); },
      context: function (a, b) { return b.context - a.context; },
      name: function (a, b) { return a.name.localeCompare(b.name); }
    }[st.sort];
    return L.sort(cmp);
  }

  function card(m) {
    var sel = m.id === current();
    return '<article class="card model-card' + (sel ? ' selected' : '') + (m.deny ? ' denied' : '') + '">' +
      '<div class="mc-head"><span class="mc-logo" style="background:' + color(m.vendor) + '" aria-hidden="true">' + KM.esc(vendorName(m.vendor)[0]) + '</span>' +
      '<div class="mc-title"><h3 title="' + KM.esc(m.name) + '">' + KM.esc(m.name.replace(/^[^:]+:\s*/, '')) + '</h3><div class="tiny">' + KM.esc(vendorName(m.vendor)) + ' · <code>' + KM.esc(m.id) + '</code></div></div></div>' +
      '<div class="mc-stats"><div><span>Ввод</span><b>' + price(m.input) + '</b></div><div><span>Вывод</span><b>' + price(m.output) + '</b></div><div><span>Контекст</span><b>' + ctx(m.context) + '</b></div></div>' +
      '<div class="tiny mc-unit">цена за 1 млн токенов</div>' +
      '<div class="chips mc-tags">' + (m.output === 0 ? '<span class="tag ok">бесплатно</span>' : '') + (m.image ? '<span class="tag info">картинки</span>' : '') + (m.reasoning ? '<span class="tag accent">рассуждения</span>' : '') + (m.maxOutput ? '<span class="tag">вывод до ' + ctx(m.maxOutput) + '</span>' : '') + '</div>' +
      (m.description ? '<p class="small muted mc-desc">' + KM.esc(m.description) + '</p>' : '<p class="mc-desc"></p>') +
      (sel ? '<button class="btn primary" disabled>✓ Выбрана</button>' : m.deny ? '<button class="btn" disabled title="' + KM.esc(m.deny) + '">Недоступна</button><div class="tiny">' + KM.esc(m.deny) + '</div>' : '<button class="btn primary" data-pick="' + KM.esc(m.id) + '">Выбрать</button>') +
      '</article>';
  }

  KM.views.models = {
    render: function () {
      return '<div class="page"><div class="page-head"><div class="eyebrow">AI-ассистент</div><h1>Модели AI</h1>' +
        '<p>Каталог моделей OpenRouter. Выберите модель, и AI-ассистент на всех страницах будет отвечать через неё. Цены — за 1 млн токенов: вопрос обычно занимает 1–3 тыс. токенов, ответ — 0,5–2 тыс.</p></div>' +
        '<div class="card flat model-current" id="mcur"></div>' +
        '<div class="filter-bar model-filters"><input type="search" id="mq" placeholder="Поиск: claude, gpt, gemini, llama…" value="' + KM.esc(st.q) + '" aria-label="Поиск моделей">' +
          '<select id="mvendor" aria-label="Производитель"><option value="">Все производители</option></select>' +
          '<select id="msort" aria-label="Сортировка">' + [['recommended', 'Рекомендуемые'], ['newest', 'Сначала новые'], ['cheap', 'Сначала дешёвые'], ['pricey', 'Сначала дорогие'], ['context', 'Больший контекст'], ['name', 'По названию']].map(function (o) { return '<option value="' + o[0] + '"' + (st.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' +
          '<div class="chips"><button class="chip" data-t="onlyOk" aria-pressed="' + st.onlyOk + '">Доступные</button><button class="chip" data-t="free" aria-pressed="' + st.free + '">Бесплатные</button><button class="chip" data-t="vision" aria-pressed="' + st.vision + '">С картинками</button></div></div>' +
        '<div class="small muted" id="mcount">Загрузка каталога…</div><div class="grid model-grid" id="mlist" aria-live="polite"></div>' +
        '<div class="row" style="justify-content:center;margin-top:16px"><button class="btn" id="mmore" hidden>Показать ещё</button></div></div>';
    },
    mount: function (root) {
      var list = KM.$('#mlist', root), cnt = KM.$('#mcount', root), more = KM.$('#mmore', root);
      function head() {
        var p = data.policy, m = data.models.find(function (x) { return x.id === current(); });
        KM.$('#mcur', root).innerHTML = '<div class="row between"><div><div class="tiny">Сейчас ассистент использует</div><b style="font-size:1.1rem">' + KM.esc(m ? m.name : current()) + '</b>' +
          (m ? ' <span class="tiny">· ' + price(m.input) + ' / ' + price(m.output) + ' · контекст ' + ctx(m.context) + '</span>' : '') + '</div>' +
          '<div class="row">' + (KM.store.state.settings.aiModel ? '<button class="btn sm" id="mreset">Сбросить на модель сайта</button>' : '') + '<a class="btn sm primary" href="#/community?tab=ai" data-open-ai>🤖 Открыть ассистента</a></div></div>' +
          '<div class="tiny" style="margin-top:6px">' + (p.local ? 'Каталог загружен напрямую с OpenRouter; доступность — по ключу в Настройках.' : p.provider ? 'AI на сайте: ' + (p.provider === 'openrouter' ? 'OpenRouter' : 'Anthropic') + '. Лимит сайта: до $' + p.maxPrice + ' за 1 млн токенов вывода' + (p.allowList ? ', по списку разрешённых' : '') + '.' : 'На сайте AI не настроен: выбрать модель можно, если указать свой ключ в Настройках.') + '</div>';
        var r = KM.$('#mreset', root); if (r) r.onclick = function () { delete KM.store.state.settings.aiModel; KM.store.touch(); head(); draw(true); };
      }
      function draw(reset) {
        if (reset) st.page = 1;
        var L = filtered();
        cnt.textContent = 'Найдено: ' + L.length + ' из ' + data.models.length;
        list.innerHTML = L.length ? L.slice(0, st.page * PER).map(card).join('') : '<div class="empty" style="grid-column:1/-1"><div class="big">🔍</div>Ничего не найдено. Попробуйте снять фильтр «Доступные».</div>';
        more.hidden = L.length <= st.page * PER;
        KM.$$('[data-pick]', list).forEach(function (b) {
          b.onclick = function () {
            KM.store.state.settings.aiModel = b.dataset.pick; KM.store.touch();
            var m = data.models.find(function (x) { return x.id === b.dataset.pick; });
            KM.ui.toast('Модель выбрана', m ? m.name : b.dataset.pick, '🧠'); head(); draw(false);
          };
        });
      }
      load().then(function () {
        if (!data.models.some(function (m) { return !m.deny; })) { st.onlyOk = false; var ch = KM.$('[data-t="onlyOk"]', root); if (ch) ch.setAttribute('aria-pressed', 'false'); }
        var vs = {}; data.models.forEach(function (m) { vs[m.vendor] = (vs[m.vendor] || 0) + 1; });
        KM.$('#mvendor', root).innerHTML += Object.keys(vs).sort(function (a, b) { return vs[b] - vs[a]; }).map(function (v) { return '<option value="' + KM.esc(v) + '"' + (st.vendor === v ? ' selected' : '') + '>' + KM.esc(vendorName(v)) + ' (' + vs[v] + ')</option>'; }).join('');
        head(); draw(false);
      }).catch(function (e) { cnt.innerHTML = '<div class="callout danger"><span class="ico">⚠️</span><div><strong>Не удалось загрузить каталог</strong>' + KM.esc(e.message) + '. Нужен интернет.</div></div>'; });
      KM.$('#mq', root).oninput = KM.debounce(function () { st.q = this.value; if (data) draw(true); }, 150);
      KM.$('#mvendor', root).onchange = function () { st.vendor = this.value; draw(true); };
      KM.$('#msort', root).onchange = function () { st.sort = this.value; draw(true); };
      KM.$$('[data-t]', root).forEach(function (b) { b.onclick = function () { st[b.dataset.t] = !st[b.dataset.t]; b.setAttribute('aria-pressed', String(st[b.dataset.t])); if (data) draw(true); }; });
      more.onclick = function () { st.page++; draw(false); };
    }
  };
  KM.models = { load: load, current: current };
})();
