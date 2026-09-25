/* Схемы-шаблоны: готовые проекты KiCad */
(function () {
  var cat = '';
  KM.views.templates = {
    render: function () {
      var T = KM.data.templates || [];
      var cats = T.map(function (t) { return t.cat; }).filter(function (c, i, a) { return a.indexOf(c) === i; });
      return '<div class="page"><div class="page-head"><div class="eyebrow">Раздел 5</div><h1>Схемы-шаблоны</h1>' +
        '<p>' + T.length + ' готовых рабочих схем. Каждая — полноценный проект KiCad: скачайте архив, распакуйте и откройте файл <code>.kicad_pro</code>. Все схемы проверены ERC в KiCad 10 без ошибок; превью и PDF — настоящий рендер KiCad.</p></div>' +
        '<div class="chips" style="margin-bottom:16px"><button class="chip" data-c="" aria-pressed="' + (!cat) + '">Все</button>' + cats.map(function (c) { return '<button class="chip" data-c="' + KM.esc(c) + '" aria-pressed="' + (cat === c) + '">' + KM.esc(c) + '</button>'; }).join('') + '</div>' +
        '<div class="grid cols-3" id="tlist">' + T.filter(function (t) { return !cat || t.cat === cat; }).map(function (t) {
          return '<a class="card" href="#/template/' + t.id + '"><div class="thumb-sch"><img src="' + t.svg + '" alt="" loading="lazy"></div><div class="row between"><span class="tag accent">' + KM.esc(t.cat) + '</span><span class="tag">' + '●'.repeat(t.level) + '○'.repeat(3 - t.level) + '</span></div>' +
            '<h3 style="margin-top:8px">' + KM.esc(t.title) + '</h3><p class="muted small">' + KM.esc(t.desc) + '</p><div class="tiny">' + t.parts.length + ' компонентов · ERC: ' + (t.erc.length ? t.erc.length + ' замечаний' : '✓ без ошибок') + '</div></a>';
        }).join('') + '</div>' +
        '<div class="callout tip mt"><span class="ico">🧷</span><div><strong>О символах</strong>Шаблоны используют собственную библиотеку символов <code>KiCadMaster</code>, которая лежит внутри каждого архива (подключена через <code>${KIPRJMOD}</code>). Схема оформлена «метками цепей»: у каждого вывода — короткий провод с именем цепи. Это полностью рабочая схема; перерисуйте её проводами — отличное упражнение.</div></div></div>';
    },
    mount: function (root) {
      KM.$$('[data-c]', root).forEach(function (b) { b.onclick = function () { cat = b.dataset.c; KM.$('#main').innerHTML = KM.views.templates.render(); KM.views.templates.mount(KM.$('#main')); }; });
    }
  };

  KM.views.template = {
    render: function (p) {
      var t = (KM.data.templates || []).find(function (x) { return x.id === p.id; });
      if (!t) return '<div class="page narrow empty"><div class="big">📐</div><h1>Шаблон не найден</h1></div>';
      KM.store.state.viewed['t:' + t.id] = Date.now();
      var nets = Object.keys(t.nets).filter(function (n) { return t.nets[n].length > 1; });
      return '<div class="page"><div class="crumbs"><a href="#/templates">Схемы-шаблоны</a> › ' + KM.esc(t.cat) + '</div>' +
        '<div class="row between"><h1>' + KM.esc(t.title) + '</h1>' + KM.ui.bookmarkBtn('/template/' + t.id, t.title) + '</div>' +
        '<p class="muted" style="font-size:1.05rem">' + KM.esc(t.desc) + '</p>' +
        (t.sheetDesc ? '<div class="callout tip"><span class="ico">📏</span><div>' + KM.esc(t.sheetDesc).replace(/\n/g, '<br>') + '</div></div>' : '') +
        '<div class="sch-preview"><a href="' + t.svg + '" target="_blank" title="Открыть в полном размере"><img src="' + t.svg + '" alt="Схема: ' + KM.esc(t.title) + '"></a></div>' +
        '<div class="row mt"><a class="btn primary" href="' + t.zip + '" download data-dl>⬇️ Проект KiCad (.zip)</a><a class="btn" href="' + t.pdf + '" target="_blank">📄 PDF</a><a class="btn" href="' + t.bom + '" download data-dl>🧾 BOM (.csv)</a>' +
        '<a class="btn" href="' + t.dir + t.name + '.kicad_sch" download data-dl>📐 .kicad_sch</a>' + (KM.api.aiAvailable() ? '<a class="btn ghost" href="#/community?tab=ai&ctx=' + encodeURIComponent('схема-шаблон «' + t.title + '»') + '">🤖 Спросить AI о схеме</a>' : '') + '</div>' +
        '<div class="grid cols-2 mt"><div><h2>🧾 Компоненты</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Обозн.</th><th>Номинал</th><th>Назначение</th></tr></thead><tbody>' +
          t.parts.map(function (x) { return '<tr><td><b>' + x.ref + '</b></td><td class="num">' + KM.esc(x.value) + '</td><td>' + KM.esc(x.desc) + '<div class="tiny">' + KM.esc(x.fp) + '</div></td></tr>'; }).join('') +
        '</tbody></table></div></div><div><h2>🔗 Цепи</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Цепь</th><th>Выводы</th></tr></thead><tbody>' +
          nets.map(function (n) { return '<tr><td><b>' + KM.esc(n) + '</b></td><td class="tiny">' + t.nets[n].map(KM.esc).join(', ') + '</td></tr>'; }).join('') +
        '</tbody></table></div>' +
        '<h2 class="mt">🧪 Проверка</h2><p class="small">ERC (kicad-cli 10): ' + (t.erc.length ? t.erc.map(function (e) { return KM.esc(e.desc); }).join('; ') : '<span class="tag ok">0 ошибок, 0 предупреждений</span>') + '. Соединения сверены с netlist, экспортированным KiCad.</p>' +
        '<h2 class="mt">📂 Как открыть</h2><ol class="small"><li>Распакуйте архив в отдельную папку.</li><li>Откройте <code>' + KM.esc(t.name) + '.kicad_pro</code> в KiCad 8 или новее.</li><li>Схема: двойной щелчок по <code>.kicad_sch</code> в менеджере проектов.</li><li>Для платы: откройте редактор плат и нажмите [[F8]] — «Обновить плату из схемы».</li></ol>'.replace(/\[\[F8\]\]/, '<kbd>F8</kbd>') +
        '</div></div>' + KM.ui.notesBox('/template/' + t.id) + '</div>';
    },
    mount: function (root) {
      KM.$$('[data-dl]', root).forEach(function (a) { a.addEventListener('click', function () { KM.store.state.downloads++; KM.game.activity(); }); });
    }
  };
})();
