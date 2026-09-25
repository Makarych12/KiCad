/* Библиотека компонентов: каталог, фильтры, карточка */
(function () {
  var CC = function () { return KM.data.colorCode; };
  function bands(v) {
    // 4 полосы: 2 значащие цифры, множитель, допуск 5 %
    var e = Math.floor(Math.log10(v)) - 1, m = Math.round(v / Math.pow(10, e));
    if (m >= 100) { m = Math.round(m / 10); e++; }
    var d1 = Math.floor(m / 10), d2 = m % 10, cc = CC();
    var mult = cc.find(function (c) { return Math.abs(c.m - Math.pow(10, e)) < 1e-9 * Math.max(1, c.m); });
    return [cc[d1].c, cc[d2].c, mult ? mult.c : '#000', '#cfa22e'];
  }
  function pinsRow(x0, y, n, step, len) { var s = ''; for (var i = 0; i < n; i++) s += '<rect x="' + (x0 + i * step - 2) + '" y="' + y + '" width="4" height="' + len + '" fill="#b8b8b8"/>'; return s; }
  function label(t, x, y, size, fill) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="monospace" font-size="' + (size || 10) + '" fill="' + (fill || '#ddd') + '">' + KM.esc(t) + '</text>'; }

  // Схематичная «фотография» корпуса. viewBox 0 0 140 110
  KM.compArt = function (c) {
    var p = c.pkg || '', s = '';
    var short = c.name.split(/[ (/]/)[0].slice(0, 10);
    if (p === 'axial-res') {
      var b = bands(c.value || 1000);
      s = '<rect x="0" y="53" width="140" height="4" fill="#aaa"/><rect x="32" y="38" width="76" height="34" rx="14" fill="#d9c79b"/>' +
        b.map(function (col, i) { return '<rect x="' + (44 + i * 13 + (i === 3 ? 10 : 0)) + '" y="38" width="7" height="34" fill="' + col + '"/>'; }).join('');
    } else if (p === 'axial-diode' || p === 'axial-glass') {
      var glass = p === 'axial-glass';
      s = '<rect x="0" y="53" width="140" height="4" fill="#aaa"/><rect x="40" y="' + (glass ? 44 : 40) + '" width="60" height="' + (glass ? 22 : 30) + '" rx="' + (glass ? 10 : 4) + '" fill="' + (glass ? 'rgba(230,120,60,.55)' : '#222') + '" stroke="' + (glass ? '#c86' : 'none') + '"/>' +
        '<rect x="86" y="' + (glass ? 44 : 40) + '" width="6" height="' + (glass ? 22 : 30) + '" fill="' + (glass ? '#222' : '#ddd') + '"/>';
    } else if (/^chip/.test(p)) {
      var isC = c.cat === 'cap', isL = c.cat === 'ind';
      s = '<rect x="35" y="35" width="70" height="40" rx="3" fill="' + (isC ? '#c9a77a' : isL ? '#555' : '#1d1d1d') + '"/><rect x="30" y="35" width="14" height="40" fill="#cfcfcf"/><rect x="96" y="35" width="14" height="40" fill="#cfcfcf"/>' +
        (c.series === 'resistor' ? label(KM.data.components.smdCode(c.value), 70, 60, 14, '#eee') : '') + label(p.replace('chip', ''), 70, 98, 10, 'var(--text-3)');
    } else if (p === 'sot23' || p === 'sot23-5' || p === 'sot23-6' || p === 'sod123' || p === 'minimelf' || p === 'sma' || p === 'smb') {
      if (p === 'sod123' || p === 'sma' || p === 'smb' || p === 'minimelf') {
        s = '<rect x="36" y="38" width="68" height="34" rx="' + (p === 'minimelf' ? 16 : 3) + '" fill="' + (p === 'minimelf' ? 'rgba(230,120,60,.6)' : '#222') + '"/><rect x="40" y="38" width="8" height="34" fill="#bbb"/><rect x="26" y="46" width="12" height="18" fill="#cfcfcf"/><rect x="102" y="46" width="12" height="18" fill="#cfcfcf"/>';
      } else {
        var np = p === 'sot23' ? [2, 1] : p === 'sot23-5' ? [3, 2] : [3, 3];
        s = pinsRow(70 - (np[0] - 1) * 12, 72, np[0], 24, 12) + pinsRow(70 - (np[1] - 1) * 12, 26, np[1], 24, 12) + '<rect x="40" y="36" width="60" height="38" rx="3" fill="#1d1d1d"/>' + label(short.slice(0, 6), 70, 59, 10);
      }
    } else if (p === 'sot223' || p === 'sot89') {
      s = '<rect x="46" y="16" width="48" height="16" fill="#cfcfcf"/><rect x="30" y="30" width="80" height="44" rx="3" fill="#1d1d1d"/>' + pinsRow(46, 74, 3, 24, 14) + label(short, 70, 56, 10);
    } else if (p === 'to92' || p === 'tsop' || p === 'ldr' || p === 'ntc' || p === 'bpw') {
      if (p === 'ldr') s = '<circle cx="70" cy="45" r="28" fill="#e8d6a8" stroke="#aa8"/><path d="M52 35h36M52 45h36M52 55h36" stroke="#c43" stroke-width="3"/><path d="M60 45v-10M80 45v10" stroke="#c43" stroke-width="3"/><rect x="58" y="72" width="3" height="36" fill="#aaa"/><rect x="79" y="72" width="3" height="36" fill="#aaa"/>';
      else if (p === 'ntc') s = '<ellipse cx="70" cy="42" rx="18" ry="22" fill="#222"/><rect x="62" y="62" width="3" height="46" fill="#aaa"/><rect x="75" y="62" width="3" height="46" fill="#aaa"/>';
      else if (p === 'bpw') s = '<rect x="44" y="22" width="52" height="48" rx="3" fill="#333"/><rect x="54" y="32" width="32" height="28" fill="#6b5a9a" opacity=".8"/><rect x="58" y="70" width="3" height="36" fill="#aaa"/><rect x="79" y="70" width="3" height="36" fill="#aaa"/>';
      else s = '<path d="M46 60 V28 a24 24 0 0 1 48 0 V60 Z" fill="' + (p === 'tsop' ? '#333' : '#1d1d1d') + '"/>' + (p === 'tsop' ? '<circle cx="70" cy="34" r="10" fill="#555"/>' : label(short.slice(0, 7), 70, 46, 9)) + pinsRow(56, 60, 3, 14, 46);
    } else if (/^to220|^to126|^to263/.test(p)) {
      var to263 = p === 'to263';
      s = (to263 ? '' : '<rect x="42" y="6" width="56" height="30" fill="#cfcfcf"/><circle cx="70" cy="20" r="7" fill="var(--surface-2)"/>') + '<rect x="40" y="' + (to263 ? 20 : 34) + '" width="60" height="' + (to263 ? 50 : 40) + '" rx="2" fill="#1d1d1d"/>' + label(short.slice(0, 8), 70, to263 ? 50 : 58, 9) +
        (p === 'to220-5' || to263 ? pinsRow(50, to263 ? 70 : 74, 5, 10, to263 ? 14 : 34) : pinsRow(54, 74, 3, 16, 34));
    } else if (/^dip|^soic|^ssop|^tssop|^msop/.test(p)) {
      var n = parseInt(p.replace(/\D/g, ''), 10) || 8, half = n / 2, dip = /^dip/.test(p);
      var w = Math.min(120, 16 + half * (dip ? 12 : 8)), x0 = 70 - w / 2, step = (w - 12) / Math.max(1, half - 1);
      s = pinsRow(x0 + 6, dip ? 22 : 26, half, step, 10) + pinsRow(x0 + 6, dip ? 78 : 74, half, step, 10) +
        '<rect x="' + x0 + '" y="' + (dip ? 30 : 34) + '" width="' + w + '" height="' + (dip ? 50 : 42) + '" rx="3" fill="#1d1d1d"/><circle cx="' + (x0 + 8) + '" cy="' + (dip ? 70 : 68) + '" r="3" fill="#444"/>' + (dip ? '<path d="M' + (x0) + ' 50 a6 6 0 0 1 0 12" fill="#333"/>' : '') + label(short, 70, dip ? 58 : 58, 9);
    } else if (p === 'lqfp48' || p === 'qfn' || p === 'lga') {
      var q = p === 'lqfp48';
      s = '<rect x="30" y="20" width="80" height="80" rx="3" fill="#1d1d1d"/>' + (q ? [0, 1, 2, 3].map(function (k) {
        var r = ''; for (var i = 0; i < 10; i++) { var o = 36 + i * 7; r += k === 0 ? '<rect x="' + o + '" y="12" width="3" height="8" fill="#bbb"/>' : k === 1 ? '<rect x="' + o + '" y="100" width="3" height="8" fill="#bbb"/>' : k === 2 ? '<rect x="22" y="' + (o - 10) + '" width="8" height="3" fill="#bbb"/>' : '<rect x="110" y="' + (o - 10) + '" width="8" height="3" fill="#bbb"/>'; } return r;
      }).join('') : '') + '<circle cx="40" cy="30" r="3" fill="#444"/>' + label(short, 70, 64, 10);
    } else if (/^led|^seg7|^oled|^lcd|^dip4|^dip6/.test(p)) {
      if (p === 'led5' || p === 'led3') {
        var r = p === 'led5' ? 22 : 16, col = c.color || '#e23';
        s = '<rect x="' + (70 - r) + '" y="30" width="' + 2 * r + '" height="44" fill="' + col + '" opacity=".75"/><circle cx="70" cy="30" r="' + r + '" fill="' + col + '" opacity=".75"/><rect x="' + (68 - r) + '" y="70" width="' + (2 * r + 4) + '" height="6" fill="' + col + '" opacity=".85"/><rect x="60" y="76" width="3" height="32" fill="#aaa"/><rect x="77" y="76" width="3" height="26" fill="#aaa"/>';
      } else if (p === 'led-smd' || p === 'led5050') {
        s = '<rect x="38" y="30" width="64" height="' + (p === 'led5050' ? 64 : 40) + '" rx="3" fill="#eee" stroke="#bbb"/><circle cx="70" cy="' + (p === 'led5050' ? 62 : 50) + '" r="' + (p === 'led5050' ? 22 : 13) + '" fill="' + (c.color || '#ffe9a8') + '" opacity=".85"/>';
      } else if (p === 'seg7') {
        s = '<rect x="30" y="10" width="80" height="90" rx="4" fill="#222"/><g stroke="#e23" stroke-width="6" stroke-linecap="round"><path d="M52 24h32M88 28v20M88 60v20M52 86h32M48 60v20M48 28v20M52 54h32"/></g>';
      } else if (p === 'oled' || p === 'lcd') {
        s = '<rect x="10" y="18" width="120" height="74" rx="4" fill="' + (p === 'oled' ? '#1a4d8f' : '#2a7a2a') + '"/><rect x="20" y="30" width="100" height="44" fill="' + (p === 'oled' ? '#000' : '#9fd88f') + '"/>' + label(p === 'oled' ? 'Hello KiCad' : 'KiCad 16x2', 70, 57, 11, p === 'oled' ? '#8cf' : '#123');
      } else {
        var nn = p === 'dip6' ? 6 : 4;
        s = pinsRow(56, 26, nn / 2, 28 / Math.max(1, nn / 2 - 1), 10) + pinsRow(56, 74, nn / 2, 28 / Math.max(1, nn / 2 - 1), 10) + '<rect x="42" y="34" width="56" height="42" rx="3" fill="#eee" stroke="#aaa"/>' + label(short, 70, 60, 10, '#333');
      }
    } else if (p === 'elec') {
      s = '<rect x="44" y="12" width="52" height="72" rx="6" fill="#1b3f8f"/><rect x="82" y="12" width="10" height="72" fill="#8fb0e8"/><text x="87" y="52" font-size="12" fill="#1b3f8f" text-anchor="middle">−</text><rect x="58" y="84" width="3" height="24" fill="#aaa"/><rect x="79" y="84" width="3" height="18" fill="#aaa"/>';
    } else if (p === 'disc') {
      s = '<ellipse cx="70" cy="42" rx="26" ry="24" fill="#d99a3b"/>' + label(c.specs && c.specs['Маркировка'] || '', 70, 46, 11, '#422') + '<rect x="60" y="64" width="3" height="44" fill="#aaa"/><rect x="77" y="64" width="3" height="44" fill="#aaa"/>';
    } else if (p === 'ind-smd' || p === 'ind-rad' || p === 'cmc') {
      s = p === 'ind-rad' ? '<ellipse cx="70" cy="50" rx="30" ry="34" fill="#3a3a3a"/><path d="M48 30q22 10 44 0M48 42q22 10 44 0M48 54q22 10 44 0M48 66q22 10 44 0" stroke="#b86" stroke-width="4" fill="none"/><rect x="60" y="84" width="3" height="24" fill="#aaa"/><rect x="77" y="84" width="3" height="24" fill="#aaa"/>' :
        '<rect x="36" y="26" width="68" height="60" rx="8" fill="#333"/><circle cx="70" cy="56" r="20" fill="#b86"/><circle cx="70" cy="56" r="8" fill="#333"/>';
    } else if (p === 'hc49' || p === 'tuningfork' || p === 'osc') {
      s = p === 'tuningfork' ? '<rect x="60" y="14" width="20" height="60" rx="8" fill="#c8c8c8"/><rect x="63" y="74" width="3" height="34" fill="#aaa"/><rect x="74" y="74" width="3" height="34" fill="#aaa"/>' :
        p === 'osc' ? '<rect x="40" y="34" width="60" height="42" rx="4" fill="#ccc"/>' + label(short, 70, 60, 10, '#333') :
        '<rect x="34" y="30" width="72" height="40" rx="18" fill="#cfcfcf" stroke="#999"/>' + label(short.replace('Кварц', '').slice(0, 7), 70, 54, 11, '#333') + '<rect x="56" y="70" width="3" height="36" fill="#aaa"/><rect x="81" y="70" width="3" height="36" fill="#aaa"/>';
    } else if (/^module|^usb|^microusb|^dcjack|^jst|^idc|^header|^terminal|^sma|^button|^slide|^relay|^buzzer|^pot|^encoder|^speaker|^mic|^fuse/.test(p)) {
      if (/^module/.test(p)) {
        var col2 = p === 'module-esp' ? '#222' : p === 'module-rf' ? '#1f5a8f' : p === 'module-sensor' ? '#2a6fb0' : '#0e6b3a';
        s = '<rect x="14" y="16" width="112" height="78" rx="4" fill="' + col2 + '"/>' + (p === 'module-esp' ? '<rect x="24" y="24" width="72" height="54" rx="2" fill="#b8b8b8"/><path d="M100 24h20v54h-20" stroke="#caa35a" stroke-width="3" fill="none"/>' : '<rect x="44" y="34" width="40" height="30" fill="#111"/>') +
          pinsRow(24, 86, 8, 12.5, 8) + label(short, 70, 58, 9, '#fff');
      } else if (p === 'header') {
        var hn = Math.min(c.pins || 4, 10), rows = c.rows || 1;
        s = ''; for (var k = 0; k < rows; k++) s += '<rect x="' + (70 - hn * 6) + '" y="' + (40 + k * 14) + '" width="' + hn * 12 + '" height="12" fill="#111"/>' + pinsRow(70 - hn * 6 + 6, 22 + k * 14, hn, 12, 40);
      } else if (p === 'terminal') {
        var tn = c.pins || 2; s = '<rect x="' + (70 - tn * 14) + '" y="30" width="' + tn * 28 + '" height="50" rx="3" fill="#2a8a3a"/>'; for (var t = 0; t < tn; t++) s += '<circle cx="' + (70 - tn * 14 + 14 + t * 28) + '" cy="44" r="8" fill="#ccc"/><path d="M' + (70 - tn * 14 + 8 + t * 28) + ' 44h12" stroke="#666" stroke-width="2"/>';
      } else if (p === 'jst' || p === 'idc') {
        s = '<rect x="30" y="34" width="80" height="40" rx="3" fill="' + (p === 'jst' ? '#f2f0e6' : '#222') + '" stroke="#999"/>' + pinsRow(44, 40, p === 'idc' ? 5 : Math.min(c.pins || 2, 6), p === 'idc' ? 13 : 10, 12);
      } else if (p === 'usbc' || p === 'microusb' || p === 'usba') {
        s = '<rect x="' + (p === 'usba' ? 30 : 38) + '" y="' + (p === 'usba' ? 36 : 42) + '" width="' + (p === 'usba' ? 80 : 64) + '" height="' + (p === 'usba' ? 36 : 26) + '" rx="' + (p === 'usbc' ? 13 : 3) + '" fill="#cfcfcf" stroke="#888"/><rect x="' + (p === 'usba' ? 40 : 50) + '" y="' + (p === 'usba' ? 48 : 52) + '" width="' + (p === 'usba' ? 60 : 40) + '" height="' + (p === 'usba' ? 10 : 6) + '" rx="2" fill="#333"/>';
      } else if (p === 'dcjack') {
        s = '<rect x="30" y="30" width="80" height="50" rx="4" fill="#222"/><circle cx="50" cy="55" r="16" fill="#111" stroke="#555"/><circle cx="50" cy="55" r="4" fill="#bbb"/>';
      } else if (p === 'sma') {
        s = '<rect x="30" y="44" width="30" height="22" fill="#caa35a"/><polygon points="60,40 90,40 98,55 90,70 60,70" fill="#d6b36a"/><circle cx="96" cy="55" r="6" fill="#fff" stroke="#999"/>';
      } else if (p === 'button') {
        s = '<rect x="36" y="30" width="68" height="52" rx="4" fill="#333"/><circle cx="70" cy="56" r="17" fill="#111" stroke="#666"/>' + pinsRow(44, 82, 2, 52, 20);
      } else if (p === 'slide') {
        s = '<rect x="30" y="40" width="80" height="30" rx="3" fill="#bbb"/><rect x="62" y="30" width="14" height="14" fill="#333"/>' + pinsRow(50, 70, 3, 20, 20);
      } else if (p === 'relay') {
        s = '<rect x="24" y="16" width="92" height="78" rx="4" fill="#1d5fb8"/>' + label('SRD-05VDC', 70, 52, 10, '#fff') + label('10A 250VAC', 70, 68, 8, '#cde');
      } else if (p === 'buzzer' || p === 'mic' || p === 'speaker') {
        s = p === 'speaker' ? '<circle cx="70" cy="55" r="40" fill="#333"/><circle cx="70" cy="55" r="16" fill="#555"/>' : '<circle cx="70" cy="50" r="' + (p === 'mic' ? 22 : 30) + '" fill="#222"/><circle cx="70" cy="50" r="' + (p === 'mic' ? 12 : 5) + '" fill="#111" stroke="#555"/>' + '<rect x="62" y="80" width="3" height="26" fill="#aaa"/><rect x="75" y="80" width="3" height="26" fill="#aaa"/>';
      } else if (p === 'pot' || p === 'encoder') {
        s = '<rect x="36" y="46" width="68" height="44" rx="4" fill="#2a6a2a"/><rect x="62" y="6" width="16" height="42" fill="#bbb"/><rect x="62" y="6" width="16" height="6" fill="#999"/>' + pinsRow(50, 90, 3, 20, 18);
      } else if (p === 'fuse') {
        s = '<rect x="20" y="42" width="100" height="26" rx="4" fill="rgba(200,220,255,.5)" stroke="#999"/><rect x="20" y="42" width="16" height="26" fill="#ccc"/><rect x="104" y="42" width="16" height="26" fill="#ccc"/><path d="M36 55 Q70 45 104 55" stroke="#888" stroke-width="2" fill="none"/>';
      }
    } else {
      s = '<rect x="30" y="30" width="80" height="50" rx="6" fill="#444"/>' + label(short, 70, 60, 10);
    }
    return '<svg viewBox="0 0 140 110" role="img" aria-label="Иллюстрация корпуса ' + KM.esc(c.name) + '">' + s + '</svg>';
  };

  var state = { q: '', cat: '', pkg: '', sort: 'pop', page: 1 };
  var PER = 48;
  function pkgGroup(c) {
    var p = c.pkg || '';
    if (/^chip|^sot|^sod|^sma|^smb|^minimelf|^led-smd|^led5050|^soic|^ssop|^tssop|^msop|^lqfp|^qfn|^lga|^ind-smd|^osc|^usbc|^microusb|^to263|^sot/.test(p)) return 'smd';
    if (/^module/.test(p)) return 'module';
    return 'tht';
  }
  function filtered() {
    var q = state.q.trim().toLowerCase(), words = q ? q.split(/\s+/) : [];
    var L = KM.data.components.list().filter(function (c) {
      if (state.cat && c.cat !== state.cat) return false;
      if (state.pkg && pkgGroup(c) !== state.pkg) return false;
      if (!words.length) return true;
      var hay = (c.name + ' ' + c.short + ' ' + (c.tags || '') + ' ' + c.id).toLowerCase();
      return words.every(function (w) { return hay.indexOf(w) >= 0; });
    });
    if (state.sort === 'name') L = L.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'ru'); });
    else if (state.sort === 'price') L = L.slice().sort(function (a, b) { return (a.price[0] + a.price[1]) - (b.price[0] + b.price[1]); });
    else L = L.slice().sort(function (a, b) { return (b.curated ? 1 : 0) - (a.curated ? 1 : 0); });
    return L;
  }
  function card(c) {
    return '<a class="card comp-card" href="#/component/' + encodeURIComponent(c.id) + '"><div class="thumb">' + KM.compArt(c) + '</div><div style="min-width:0"><h3>' + KM.esc(c.name) + '</h3><div class="d">' + KM.esc(c.short) + '</div><div class="tiny">≈ ' + KM.priceRange(c.price) + '</div></div></a>';
  }

  KM.views.components = {
    render: function (p, query) {
      if (query.q !== undefined) state.q = query.q;
      if (query.cat !== undefined) state.cat = query.cat;
      var cats = KM.data.components.cats, all = KM.data.components.list();
      return '<div class="page"><div class="page-head"><div class="eyebrow">Раздел 4</div><h1>Библиотека компонентов</h1>' +
        '<p>' + all.length + ' компонентов: ' + all.filter(function (c) { return c.curated; }).length + ' популярных деталей с подробным описанием и параметрические ряды (резисторы E24, конденсаторы E6, стабилитроны, светодиоды, разъёмы). Для каждой — характеристики, символ и посадочное место KiCad, ссылки на даташиты и магазины.</p></div>' +
        '<div class="filter-bar"><input type="search" id="cq" placeholder="Поиск: NE555, 10k 0805, стабилизатор 3.3…" value="' + KM.esc(state.q) + '" aria-label="Поиск компонентов">' +
        '<select id="ccat" aria-label="Категория"><option value="">Все категории</option>' + cats.map(function (c) { return '<option value="' + c.id + '"' + (state.cat === c.id ? ' selected' : '') + '>' + c.ico + ' ' + c.title + '</option>'; }).join('') + '</select>' +
        '<select id="cpkg" aria-label="Монтаж"><option value="">Любой монтаж</option><option value="smd"' + (state.pkg === 'smd' ? ' selected' : '') + '>SMD</option><option value="tht"' + (state.pkg === 'tht' ? ' selected' : '') + '>Выводной (THT)</option><option value="module"' + (state.pkg === 'module' ? ' selected' : '') + '>Модули</option></select>' +
        '<select id="csort" aria-label="Сортировка"><option value="pop">Сначала популярные</option><option value="name"' + (state.sort === 'name' ? ' selected' : '') + '>По названию</option><option value="price"' + (state.sort === 'price' ? ' selected' : '') + '>По цене</option></select></div>' +
        '<div class="chips" style="margin-bottom:14px">' + cats.map(function (c) { return '<button class="chip" data-cat="' + c.id + '" aria-pressed="' + (state.cat === c.id) + '">' + c.ico + ' ' + c.title + '</button>'; }).join('') + '</div>' +
        '<div class="small muted" id="ccount"></div><div class="grid cols-3" id="clist" style="margin-top:10px"></div><div class="row" style="justify-content:center;margin-top:16px"><button class="btn" id="cmore">Показать ещё</button></div>' +
        '<div class="callout warn mt"><span class="ico">💰</span><div>Цены ориентировочные (розница за 1 шт., ' + KM.region().flag + ' ' + KM.region().title + ', ' + KM.region().cur + ') и сильно зависят от магазина и партии. Ссылки ведут на поиск у поставщиков. Регион и валюту можно сменить в <a href="#/settings">Настройках</a>. Иллюстрации — схематичные изображения типового корпуса.</div></div></div>';
    },
    mount: function (root) {
      var list = KM.$('#clist', root), cnt = KM.$('#ccount', root), more = KM.$('#cmore', root);
      function draw(reset) {
        if (reset) state.page = 1;
        var L = filtered();
        cnt.textContent = 'Найдено: ' + L.length;
        list.innerHTML = L.length ? L.slice(0, state.page * PER).map(card).join('') : '<div class="empty"><div class="big">🔍</div>Ничего не найдено</div>';
        more.hidden = L.length <= state.page * PER;
      }
      draw(false);
      KM.$('#cq', root).oninput = KM.debounce(function () { state.q = this.value; draw(true); }, 150);
      KM.$('#ccat', root).onchange = function () { state.cat = this.value; syncChips(); draw(true); };
      KM.$('#cpkg', root).onchange = function () { state.pkg = this.value; draw(true); };
      KM.$('#csort', root).onchange = function () { state.sort = this.value; draw(true); };
      more.onclick = function () { state.page++; draw(false); };
      function syncChips() { KM.$$('[data-cat]', root).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.cat === state.cat)); }); KM.$('#ccat', root).value = state.cat; }
      KM.$$('[data-cat]', root).forEach(function (b) { b.onclick = function () { state.cat = state.cat === b.dataset.cat ? '' : b.dataset.cat; syncChips(); draw(true); }; });
    }
  };

  KM.views.component = {
    render: function (p) {
      var c = KM.data.components.get(p.id);
      if (!c) return '<div class="page narrow empty"><div class="big">🧩</div><h1>Компонент не найден</h1><a href="#/components">В каталог</a></div>';
      var cat = KM.data.components.cats.find(function (x) { return x.id === c.cat; });
      KM.store.state.viewed['c:' + c.id] = Date.now(); KM.store.touch();
      var similar = KM.data.components.list().filter(function (x) { return x.cat === c.cat && x.id !== c.id && x.curated; }).slice(0, 6);
      var usedIn = (KM.data.templates || []).concat(KM.data.projects || []).filter(function (t) {
        var key = c.name.split(/[ (/]/)[0].toLowerCase();
        return c.curated && key.length > 2 && t.parts.some(function (x) { return x.value.toLowerCase().indexOf(key) >= 0; });
      });
      return '<div class="page"><div class="crumbs"><a href="#/components">Компоненты</a> › <a href="#/components?cat=' + c.cat + '">' + (cat ? cat.ico + ' ' + cat.title : '') + '</a></div>' +
        '<div class="comp-hero"><div><div class="photo">' + KM.compArt(c) + '</div><div class="tiny" style="margin-top:6px;text-align:center">🖼️ Схематичное изображение корпуса</div></div><div>' +
        '<h1>' + KM.esc(c.name) + '</h1><p class="muted" style="font-size:1.05rem">' + KM.esc(c.short) + '</p>' +
        '<div class="row" style="margin-bottom:14px"><span class="tag copper" style="font-size:.95rem">💰 ≈ ' + KM.priceRange(c.price) + ' / шт.</span>' + KM.ui.bookmarkBtn('/component/' + c.id, c.name) + '</div>' +
        '<p>' + KM.esc(c.desc) + '</p>' +
        '<h2>📐 Характеристики</h2><dl class="spec-list">' + Object.keys(c.specs).map(function (k) { return '<dt>' + KM.esc(k) + '</dt><dd>' + KM.esc(c.specs[k]) + '</dd>'; }).join('') + '</dl>' +
        '<h2 class="mt">🧷 В KiCad</h2><dl class="spec-list"><dt>Символ</dt><dd><code>' + KM.esc(c.sym || '—') + '</code></dd><dt>Посадочное место</dt><dd><code>' + KM.esc(c.fp || 'подберите по даташиту') + '</code></dd></dl>' +
        '</div></div>' +
        '<div class="grid cols-2 mt"><div class="card"><h3>🔗 Даташиты</h3><div class="row">' + KM.data.components.datasheet(c).map(function (l) { return '<a class="btn sm" href="' + l.url + '" target="_blank" rel="noopener">' + l.name + ' ↗</a>'; }).join('') + '</div><p class="tiny" style="margin-top:8px">Даташит — главный источник: цоколёвка, предельные режимы, рекомендуемая разводка.</p></div>' +
        '<div class="card"><h3>📍 Где купить <span class="tiny muted">' + KM.region().flag + ' ' + KM.region().title + ' · <a href="#/settings">сменить</a></span></h3><div class="row">' + KM.data.components.buy(c).map(function (l) { return '<a class="btn sm" href="' + l.url + '" target="_blank" rel="noopener">' + l.name + ' ↗</a>'; }).join('') + '</div><p class="tiny" style="margin-top:8px">' + KM.region().note + ' Остерегайтесь подделок популярных микросхем.</p></div></div>' +
        (usedIn.length ? '<h2 class="mt">📦 Используется в схемах курса</h2><div class="chips">' + usedIn.map(function (t) { return '<a class="chip" href="#/' + (t.kind === 'project' ? 'project/' : 'template/') + t.id + '">' + KM.esc(t.title) + '</a>'; }).join('') + '</div>' : '') +
        (similar.length ? '<h2 class="mt">Похожие компоненты</h2><div class="grid cols-3">' + similar.map(card).join('') + '</div>' : '') +
        KM.ui.notesBox('/component/' + c.id) + '</div>';
    },
    mount: function () { KM.game.check(); }
  };
})();
