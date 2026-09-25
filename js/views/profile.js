/* Прогресс, достижения, закладки, заметки, экспорт, сертификат, печать всех уроков */
(function () {
  var MEDAL = { gold: '🥇', silver: '🥈', bronze: '🥉' };
  function heatmap() {
    var s = KM.store.state, d = new Date(), cells = [];
    d.setDate(d.getDate() - 7 * 20 - d.getDay() + 1);
    for (var i = 0; i < 7 * 21; i++) {
      var key = KM.today(d), n = s.days[key] || 0;
      cells.push('<i class="' + (n ? (n > 8 ? 'l3' : n > 3 ? 'l2' : 'l1') : '') + '" title="' + key + ': ' + n + ' действ."></i>');
      d.setDate(d.getDate() + 1);
      if (d > new Date()) break;
    }
    return '<div class="heat" aria-label="Активность за 20 недель">' + cells.join('') + '</div>';
  }

  KM.views.profile = {
    render: function () {
      var s = KM.store.state, g = KM.game, lv = g.level();
      var from = g.xpForLevel(lv), to = g.xpForLevel(lv + 1), pct = (s.xp - from) / (to - from);
      var C = 2 * Math.PI * 52;
      var tracks = KM.data.tracks.map(function (t) {
        var ls = KM.data.lessons.filter(function (l) { return l.track === t.id; }), d = ls.filter(function (l) { return s.lessons[l.id] && s.lessons[l.id].done; }).length;
        return '<div style="margin-bottom:10px"><div class="row between small"><span>' + t.ico + ' ' + KM.esc(t.title) + '</span><span>' + d + '/' + ls.length + '</span></div><div class="progress"><span style="width:' + (d / ls.length * 100) + '%"></span></div></div>';
      }).join('');
      var medals = { gold: 0, silver: 0, bronze: 0 };
      Object.keys(s.projects).forEach(function (k) { var m = s.projects[k].medal; if (m) medals[m]++; });
      var bonus = KM.data.lessons.filter(function (l) { return l.unlockLevel; });
      return '<div class="page"><div class="page-head"><div class="eyebrow">Раздел 12</div><h1>Прогресс и достижения</h1></div>' +
        '<div class="grid cols-2"><div class="card"><div class="row" style="gap:20px"><div class="level-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg-2)" stroke-width="10"/><circle cx="60" cy="60" r="52" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + C + '" stroke-dashoffset="' + (C * (1 - pct)) + '"/></svg><div style="text-align:center"><div class="lv">' + lv + '</div><div class="tiny">уровень</div></div></div>' +
          '<div style="flex:1;min-width:180px"><h2 style="margin:0">' + KM.esc(g.title(lv)) + '</h2><div class="muted">' + s.xp + ' XP · до уровня ' + (lv + 1) + ' ещё ' + (to - s.xp) + ' XP</div>' +
          '<div class="field" style="margin-top:10px"><label for="pname">Имя для сертификата</label><input type="text" id="pname" value="' + KM.esc(s.name) + '" placeholder="Как вас зовут?" maxlength="60"></div></div></div>' +
          '<div class="kpis" style="margin:16px 0 0"><div class="kpi"><div class="v">🔥 ' + g.streak() + '</div><div class="l">серия дней</div></div><div class="kpi"><div class="v">' + g.bestStreak() + '</div><div class="l">рекорд серии</div></div>' +
          '<div class="kpi"><div class="v">' + MEDAL.gold + medals.gold + ' ' + MEDAL.silver + medals.silver + ' ' + MEDAL.bronze + medals.bronze + '</div><div class="l">медали за проекты</div></div>' +
          '<div class="kpi"><div class="v">' + Object.keys(s.quizzes).filter(function (k) { return s.quizzes[k].perfect; }).length + '</div><div class="l">тестов без ошибок</div></div></div></div>' +
        '<div class="card"><h3>📈 Статистика по трекам</h3>' + tracks + '<h3 class="mt">🎁 Бонусные уроки</h3>' + bonus.map(function (l) { var u = g.isUnlocked(l); return '<div class="small">' + (u ? '🔓 <a href="#/lesson/' + l.id + '">' + KM.esc(l.title) + '</a>' : '🔒 ' + KM.esc(l.title) + ' — уровень ' + l.unlockLevel) + '</div>'; }).join('') + '</div></div>' +
        '<h2 class="mt">🔥 Активность</h2><div class="card">' + heatmap() + '<div class="tiny" style="margin-top:6px">Каждая клетка — день. Занимайтесь хотя бы немного каждый день, чтобы не прерывать серию.</div></div>' +
        '<h2 class="mt">🏆 Достижения · ' + Object.keys(s.achievements).length + ' из ' + KM.data.achievements.length + '</h2><div class="ach-grid">' + KM.data.achievements.map(function (a) {
          var got = s.achievements[a.id];
          return '<div class="ach' + (got ? ' got' : '') + '" title="' + (got ? 'Получено ' + new Date(got).toLocaleDateString() : 'Ещё не получено') + '"><div class="i">' + a.icon + '</div><b>' + KM.esc(a.title) + '</b><span>' + KM.esc(a.desc) + '</span></div>';
        }).join('') + '</div>' +
        '<div class="grid cols-2 mt" style="align-items:start"><div><h2>🔖 Закладки</h2><div class="card flat">' + (s.bookmarks.length ? '<ul class="check-list">' + s.bookmarks.map(function (b, i) { return '<li><a href="#' + KM.esc(b.route) + '" style="flex:1">' + KM.esc(b.title) + '</a><button class="btn sm ghost" data-unbm="' + i + '" aria-label="Удалить закладку">✕</button></li>'; }).join('') + '</ul>' : '<p class="muted small mb0">Добавляйте уроки, компоненты и схемы кнопкой 🔖.</p>') + '</div>' +
          '<h2 class="mt">📝 Заметки</h2><div class="card flat">' + (Object.keys(s.notes).length ? Object.keys(s.notes).map(function (r) { return '<div style="margin-bottom:10px"><a href="#' + KM.esc(r) + '" class="small"><b>' + KM.esc(r) + '</b></a><div class="small muted" style="white-space:pre-wrap">' + KM.esc(s.notes[r].slice(0, 300)) + '</div></div>'; }).join('') + '<button class="btn sm" id="expNotes">⬇️ Экспорт заметок (.md)</button>' : '<p class="muted small mb0">Заметки к урокам появятся здесь.</p>') + '</div></div>' +
        '<div><h2>🕓 История опыта</h2><div class="card flat" style="max-height:360px;overflow:auto">' + (s.xpLog.length ? s.xpLog.slice(-40).reverse().map(function (x) { return '<div class="hotkey-row"><span class="small">' + KM.esc(x.why) + '<div class="tiny">' + new Date(x.t).toLocaleString() + '</div></span><b>+' + x.xp + '</b></div>'; }).join('') : '<p class="muted small mb0">Пока пусто.</p>') + '</div></div></div>' +
        '<h2 class="mt">💾 Экспорт и синхронизация</h2><div class="grid cols-3">' +
          '<div class="card"><h3>📊 Сертификат</h3><p class="small muted">Сертификат о прохождении курса с вашими результатами — в PNG или PDF.</p><a class="btn primary" href="#/certificate">Открыть сертификат</a></div>' +
          '<div class="card"><h3>📄 Все уроки в PDF</h3><p class="small muted">Все ' + KM.data.lessons.length + ' уроков одной страницей для печати или «Сохранить как PDF».</p><a class="btn" href="#/print">Подготовить к печати</a></div>' +
          '<div class="card"><h3>☁️ Синхронизация</h3>' + (KM.api.online && KM.api.user ? '<p class="small muted">Сервер: вы вошли как ' + KM.esc(KM.api.user.name) + '.</p><div class="row"><button class="btn sm" id="syncPush">⬆️ Отправить</button><button class="btn sm" id="syncPull">⬇️ Получить и объединить</button></div>' :
            '<p class="small muted">Перенос между устройствами через файл. С сервером курса синхронизация работает по кнопке (нужен вход в «Сообществе»).</p>') +
            '<div class="row" style="margin-top:8px"><button class="btn sm" id="expJson">⬇️ Резервная копия</button><button class="btn sm" id="impJson">⬆️ Восстановить</button><input type="file" id="impFile" accept=".json" hidden></div></div>' +
        '</div><p class="mt"><button class="btn sm danger" id="resetAll">Сбросить весь прогресс</button></p></div>';
    },
    mount: function (root) {
      var s = KM.store.state;
      KM.$('#pname', root).oninput = KM.debounce(function () { s.name = this.value.trim(); KM.store.touch(); }, 300);
      KM.$$('[data-unbm]', root).forEach(function (b) { b.onclick = function () { s.bookmarks.splice(+b.dataset.unbm, 1); KM.store.touch(); location.hash = '#/profile?keep=' + Date.now(); }; });
      var en = KM.$('#expNotes', root);
      if (en) en.onclick = function () { KM.download('kicad-master-notes.md', Object.keys(s.notes).map(function (r) { return '## ' + r + '\n\n' + s.notes[r] + '\n'; }).join('\n'), 'text/markdown;charset=utf-8'); };
      KM.$('#expJson', root).onclick = function () { KM.download('kicad-master-progress-' + KM.today() + '.json', KM.store.export(), 'application/json'); };
      KM.$('#impJson', root).onclick = function () { KM.$('#impFile', root).click(); };
      KM.$('#impFile', root).onchange = function () {
        var f = this.files[0]; if (!f) return;
        var fr = new FileReader();
        fr.onload = function () {
          try {
            var merge = confirm('Объединить с текущим прогрессом? (ОК — объединить, Отмена — заменить полностью)');
            KM.store.import(String(fr.result), merge); KM.ui.toast('Прогресс восстановлен', '', '✅'); location.hash = '#/profile?keep=' + Date.now();
          } catch (e) { KM.ui.toast('Не удалось восстановить', e.message, '⚠️'); }
        };
        fr.readAsText(f);
      };
      var sp = KM.$('#syncPush', root), sl = KM.$('#syncPull', root);
      if (sp) sp.onclick = function () { KM.api.syncPush().then(function () { KM.ui.toast('Прогресс отправлен', '', '☁️'); }).catch(function (e) { KM.ui.toast('Ошибка', e.message, '⚠️'); }); };
      if (sl) sl.onclick = function () { KM.api.syncPull().then(function (j) { KM.ui.toast(j.state ? 'Прогресс объединён' : 'На сервере пусто', '', '☁️'); location.hash = '#/profile?keep=' + Date.now(); }).catch(function (e) { KM.ui.toast('Ошибка', e.message, '⚠️'); }); };
      KM.$('#resetAll', root).onclick = function () {
        if (confirm('Удалить весь прогресс, достижения, заметки и закладки? Это нельзя отменить. Сначала сделайте резервную копию.') && confirm('Точно сбросить?')) { KM.store.reset(); location.hash = '#/'; }
      };
    }
  };

  /* ---------- сертификат ---------- */
  function certSvg() {
    var s = KM.store.state, L = KM.data.lessons;
    var done = L.filter(function (l) { return s.lessons[l.id] && s.lessons[l.id].done; }).length;
    var core = L.filter(function (l) { return ['start', 'schematic', 'pcb', 'production'].indexOf(l.track) >= 0; });
    var coreDone = core.filter(function (l) { return s.lessons[l.id] && s.lessons[l.id].done; }).length;
    var proj = Object.keys(s.projects).filter(function (k) { return s.projects[k].checked; }).length;
    var full = coreDone === core.length;
    var name = s.name || 'Ваше имя';
    var id = 'KMP-' + (s.created || 0).toString(36).toUpperCase().slice(-6) + '-' + done + proj;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1414 1000" font-family="Georgia, \'Times New Roman\', serif">' +
      '<defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0e2a20"/><stop offset="1" stop-color="#0c1a24"/></linearGradient><pattern id="pcb" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M0 30h20l10-10h30M30 60V40" stroke="#1f5a44" stroke-width="2" fill="none"/><circle cx="20" cy="30" r="4" fill="#1f5a44"/></pattern></defs>' +
      '<rect width="1414" height="1000" fill="url(#cg)"/><rect width="1414" height="1000" fill="url(#pcb)" opacity=".5"/>' +
      '<rect x="40" y="40" width="1334" height="920" rx="24" fill="#fbfaf5" stroke="#c2a031" stroke-width="6"/><rect x="60" y="60" width="1294" height="880" rx="16" fill="none" stroke="#c2a031" stroke-width="1.5"/>' +
      '<text x="707" y="170" text-anchor="middle" font-size="30" letter-spacing="8" fill="#0f7b5a">KICAD МАСТЕР PRO</text>' +
      '<text x="707" y="265" text-anchor="middle" font-size="76" fill="#17201c">' + (full ? 'Сертификат' : 'Свидетельство') + '</text>' +
      '<text x="707" y="320" text-anchor="middle" font-size="26" fill="#4b5852">' + (full ? 'о прохождении курса проектирования печатных плат в KiCad' : 'об успехах в изучении курса проектирования печатных плат в KiCad') + '</text>' +
      '<text x="707" y="430" text-anchor="middle" font-size="64" font-style="italic" fill="#0b5f46">' + KM.esc(name) + '</text>' +
      '<line x1="360" y1="455" x2="1054" y2="455" stroke="#c2a031" stroke-width="2"/>' +
      '<g font-size="30" fill="#17201c" text-anchor="middle"><text x="355" y="570">' + done + ' / ' + L.length + '</text><text x="707" y="570">' + proj + ' / ' + (KM.data.projects || []).length + '</text><text x="1059" y="570">' + s.xp + ' XP · ур. ' + KM.game.level() + '</text></g>' +
      '<g font-size="20" fill="#75827b" text-anchor="middle"><text x="355" y="605">уроков пройдено</text><text x="707" y="605">практических проектов</text><text x="1059" y="605">опыт и уровень</text></g>' +
      '<text x="707" y="690" text-anchor="middle" font-size="22" fill="#4b5852">Достижений: ' + Object.keys(s.achievements).length + ' · Лучшая серия: ' + KM.game.bestStreak() + ' дн.</text>' +
      '<circle cx="1180" cy="800" r="70" fill="#c2a031"/><circle cx="1180" cy="800" r="56" fill="none" stroke="#fbfaf5" stroke-width="3"/><text x="1180" y="812" text-anchor="middle" font-size="36" fill="#fbfaf5">✓</text>' +
      '<text x="120" y="830" font-size="22" fill="#4b5852">Дата: ' + new Date().toLocaleDateString('ru-RU') + '</text><text x="120" y="865" font-size="18" fill="#75827b">№ ' + id + '</text>' +
      '<text x="707" y="905" text-anchor="middle" font-size="16" fill="#9aa59f">Сертификат сформирован по данным прогресса в этом браузере и не является документом об образовании</text></svg>';
  }
  KM.views.certificate = {
    render: function () {
      return '<div class="page"><div class="crumbs no-print"><a href="#/profile">Прогресс</a> › Сертификат</div><h1 class="no-print">Сертификат</h1>' +
        '<div class="row no-print" style="margin-bottom:12px"><input type="text" id="cname" value="' + KM.esc(KM.store.state.name) + '" placeholder="Имя на сертификате" style="max-width:320px"><button class="btn primary" id="cpng">⬇️ PNG</button><button class="btn" onclick="window.print()">🖨️ PDF / печать</button></div>' +
        '<div class="cert" id="cert">' + certSvg() + '</div></div>';
    },
    mount: function (root) {
      KM.$('#cname', root).oninput = KM.debounce(function () { KM.store.state.name = this.value.trim(); KM.store.touch(); KM.$('#cert', root).innerHTML = certSvg(); }, 250);
      KM.$('#cpng', root).onclick = function () {
        var svg = certSvg(), img = new Image();
        img.onload = function () {
          var c = document.createElement('canvas'); c.width = 2828; c.height = 2000;
          var ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(function (b) { KM.download('kicad-master-certificate.png', b); });
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      };
    }
  };

  /* ---------- все уроки для печати/PDF ---------- */
  KM.views.print = {
    render: function () {
      return '<div class="page narrow"><div class="no-print callout tip"><span class="ico">🖨️</span><div><strong>Все уроки на одной странице</strong>Нажмите «Печать» и выберите «Сохранить как PDF». Тесты в PDF не попадают.<div style="margin-top:8px"><button class="btn primary" onclick="window.print()">🖨️ Печать / PDF</button> <a class="btn" href="#/lessons">← К урокам</a></div></div></div>' +
        '<h1>KiCad Мастер Pro — уроки</h1><p class="muted">Версия от ' + new Date().toLocaleDateString('ru-RU') + '. ' + KM.data.lessons.length + ' уроков.</p>' +
        '<ol>' + KM.data.lessons.map(function (l) { return '<li>' + KM.esc(l.title) + '</li>'; }).join('') + '</ol>' +
        KM.data.lessons.map(function (l) {
          return '<section class="print-break"><h2>Урок ' + l.n + '. ' + KM.esc(l.title) + '</h2><p><em>' + KM.esc(l.intro) + '</em></p>' +
            l.steps.map(function (s, k) { return '<h3>' + (k + 1) + '. ' + KM.esc(s.title) + '</h3>' + KM.md(s.text) + (s.fig ? KM.ui.figure(s.fig) : ''); }).join('') +
            (l.tips || []).map(function (t) { return '<div class="callout tip"><span class="ico">💡</span><div>' + KM.md(t) + '</div></div>'; }).join('') +
            (l.mistakes || []).map(function (m) { return '<div class="callout warn"><span class="ico">⚠️</span><div><strong>' + KM.esc(m.m) + '</strong>' + KM.md(m.fix) + '</div></div>'; }).join('') + '</section>';
        }).join('') + '</div>';
    }
  };
})();
