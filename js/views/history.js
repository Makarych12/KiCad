/* История технологий */
KM.views.history = {
  render: function () {
    var seen = KM.store.state.viewed;
    return '<div class="page"><div class="page-head"><div class="eyebrow">Раздел 8</div><h1>История технологий</h1>' +
      '<p>Как появились печатные платы, транзисторы и KiCad, кто стоял за ключевыми изобретениями и откуда взялись стандарты, по которым делают платы сегодня.</p></div>' +
      '<div class="grid cols-2">' + KM.data.history.map(function (a) {
        return '<a class="card" href="#/history/' + a.id + '"><div class="row between"><span style="font-size:1.8rem">' + a.icon + '</span><span class="tag">' + KM.esc(a.era) + '</span></div><h3 style="margin-top:8px">' + KM.esc(a.title) + (seen['h:' + a.id] ? ' <span class="tag ok">✓</span>' : '') + '</h3><p class="muted small">' + KM.esc(a.lead) + '</p><div class="tiny">⏱️ ' + a.time + ' мин чтения</div></a>';
      }).join('') + '</div>' +
      '<div class="grid cols-2 mt" style="align-items:start"><section><h2>🕰️ Хронология</h2><div class="timeline">' + KM.data.timeline.map(function (t) {
        return '<div class="tl-item"><div class="y">' + t[0] + '</div><div class="small">' + KM.esc(t[1]) + '</div></div>';
      }).join('') + '</div></section>' +
      '<section><h2>👤 Известные инженеры</h2><div class="stack">' + KM.data.people.map(function (p) {
        var ini = p.name.split(/[ ,]/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('');
        return '<div class="card flat person"><div class="av" style="background:' + p.color + '" aria-hidden="true">' + ini + '</div><div><b>' + KM.esc(p.name) + '</b> <span class="tiny">' + KM.esc(p.years) + '</span><div class="small" style="color:var(--accent);font-weight:600">' + KM.esc(p.role) + '</div><div class="small muted">' + KM.esc(p.text) + '</div></div></div>';
      }).join('') + '</div></section></div></div>';
  }
};
KM.views.article = {
  render: function (p) {
    var list = KM.data.history, i = list.findIndex(function (a) { return a.id === p.id; }), a = list[i];
    if (!a) return '<div class="page narrow empty"><div class="big">🏛️</div><h1>Статья не найдена</h1></div>';
    var next = list[i + 1], prev = list[i - 1];
    return '<div class="page narrow"><div class="crumbs"><a href="#/history">История</a> › ' + KM.esc(a.era) + '</div>' +
      '<div class="row between"><h1>' + a.icon + ' ' + KM.esc(a.title) + '</h1>' + KM.ui.bookmarkBtn('/history/' + a.id, a.title) + '</div>' +
      '<p class="muted" style="font-size:1.1rem">' + KM.esc(a.lead) + '</p><article class="article">' + KM.md(a.body) + '</article>' +
      '<nav class="row between mt">' + (prev ? '<a class="btn" href="#/history/' + prev.id + '">← ' + KM.esc(prev.title) + '</a>' : '<span></span>') + (next ? '<a class="btn" href="#/history/' + next.id + '">' + KM.esc(next.title) + ' →</a>' : '<a class="btn" href="#/history">Все статьи</a>') + '</nav>' +
      KM.ui.notesBox('/history/' + a.id) + '</div>';
  },
  mount: function (root, p) {
    var s = KM.store.state;
    if (!s.viewed['h:' + p.id]) { s.viewed['h:' + p.id] = Date.now(); KM.game.addXP(10, 'Статья прочитана'); }
  }
};
