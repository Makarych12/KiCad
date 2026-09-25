/* Видео-демонстрации: список и плеер анимированных сценариев */
(function () {
  function fmt(t) { t = Math.max(0, Math.floor(t)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); }
  var player = null;

  KM.views.demos = {
    render: function () {
      var s = KM.store.state;
      return '<div class="page"><div class="page-head"><div class="eyebrow">Раздел 2</div><h1>Видео-демонстрации</h1>' +
        '<p>Пошаговые анимации работы в KiCad: курсор, щелчки, окна и подписи. Можно ставить на паузу, перематывать по главам и менять скорость от 0,25× до 2×.</p></div>' +
        '<div class="callout tip"><span class="ico">🎥</span><div>Анимации построены на схематичных иллюстрациях интерфейса. Хотите добавить настоящие записи экрана — положите mp4 в <code>media/videos/</code> и укажите файл в <code>data/demos.js</code> (поле <code>video</code>): плеер покажет видео с теми же элементами управления.</div></div>' +
        '<div class="grid cols-2">' + KM.data.demos.map(function (d) {
          var lesson = KM.data.lessons.find(function (l) { return l.id === d.lesson; });
          var sc = KM.data.scenes[d.shots[Math.min(1, d.shots.length - 1)].scene];
          return '<a class="card" href="#/demo/' + d.id + '"><div class="frame" style="border-radius:10px;overflow:hidden;border:1px solid var(--border);margin-bottom:12px;background:var(--k-bg)"><svg viewBox="0 0 960 600" style="display:block;width:100%;height:auto" font-family="system-ui,sans-serif">' + sc(d.shots[Math.min(1, d.shots.length - 1)].opts || {}) +
            '<circle cx="480" cy="300" r="46" fill="rgba(0,0,0,.55)"/><path d="M466 276l40 24-40 24z" fill="#fff"/></svg></div>' +
            '<h3>' + KM.esc(d.title) + (s.demos[d.id] ? ' <span class="tag ok">✓</span>' : '') + '</h3><p class="muted small">' + KM.esc(d.desc) + '</p>' +
            '<div class="row small muted"><span>⏱️ ' + fmt(d.duration) + '</span><span>' + '●'.repeat(d.level) + '○'.repeat(3 - d.level) + '</span>' + (lesson ? '<span>к уроку ' + lesson.n + '</span>' : '') + '</div></a>';
        }).join('') + '</div></div>';
    }
  };

  KM.views.demo = {
    render: function (p) {
      var d = KM.data.demos.find(function (x) { return x.id === p.id; });
      if (!d) return '<div class="page narrow empty"><div class="big">🎬</div><h1>Видео не найдено</h1></div>';
      var lesson = KM.data.lessons.find(function (l) { return l.id === d.lesson; });
      var t = 0;
      return '<div class="page"><div class="crumbs"><a href="#/demos">Видео-демо</a> › ' + KM.esc(d.title) + '</div>' +
        '<h1>' + KM.esc(d.title) + '</h1><p class="muted">' + KM.esc(d.desc) + '</p>' +
        '<div class="lesson-layout"><div>' +
        '<div class="player" id="player" tabindex="0" aria-label="Плеер. Пробел — пауза, стрелки — перемотка">' +
          (d.video ? '<video id="vid" src="' + KM.esc(d.video) + '" style="width:100%;display:block" preload="metadata"></video>' :
          '<div class="stage"><svg id="stage" viewBox="0 0 960 600" font-family="system-ui,sans-serif"><g id="shot"></g><g id="annot"></g><g id="ripple"></g>' +
          '<path id="cursor" d="M0 0l0 22 6-6 5 11 4-2-5-11 9 0z" fill="#fff" stroke="#000" stroke-width="1.4"/></svg><div class="caption-bar" id="caption" aria-live="polite"></div></div>') +
          '<div class="controls"><button id="pp" aria-label="Воспроизвести">▶</button><button id="back" aria-label="Назад 5 секунд">⏪</button><button id="fwd" aria-label="Вперёд 5 секунд">⏩</button>' +
          '<input type="range" id="seek" min="0" max="1000" value="0" aria-label="Перемотка"><span class="time" id="time">0:00 / ' + fmt(d.duration) + '</span>' +
          '<label class="small">Скорость <select id="rate">' + [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(function (r) { return '<option value="' + r + '"' + (r === 1 ? ' selected' : '') + '>' + r + '×</option>'; }).join('') + '</select></label>' +
          '<button id="fs" aria-label="Во весь экран">⛶</button></div>' +
        '</div>' +
        (lesson ? '<p class="mt">📘 Подробно эта тема разобрана в уроке <a href="#/lesson/' + lesson.id + '">' + lesson.n + '. ' + KM.esc(lesson.title) + '</a>.</p>' : '') +
        '</div><aside class="lesson-aside"><div class="card flat"><div class="small muted" style="font-weight:700;margin-bottom:6px">Главы</div><div class="chapters" id="chapters">' +
          d.shots.map(function (s, i) { var st = t; t += s.d; return '<button data-i="' + i + '" data-t="' + st + '"><span class="t">' + fmt(st) + '</span><span>' + KM.esc(s.title || s.caption) + '</span></button>'; }).join('') +
        '</div></div><div class="card flat" style="margin-top:12px"><div class="small muted">Клавиши: <kbd>Space</kbd> пауза, <kbd>←</kbd>/<kbd>→</kbd> ±5 с, <kbd>[</kbd>/<kbd>]</kbd> скорость</div></div></aside></div></div>';
    },
    mount: function (root, p) {
      var d = KM.data.demos.find(function (x) { return x.id === p.id; });
      if (!d) return;
      player = createPlayer(root, d);
    },
    unmount: function () { if (player) player.destroy(); player = null; }
  };

  function createPlayer(root, d) {
    var el = function (id) { return KM.$('#' + id, root); };
    var vid = el('vid');
    var starts = [], acc = 0;
    d.shots.forEach(function (s) { starts.push(acc); acc += s.d; });
    var total = acc, t = 0, rate = 1, playing = false, last = 0, raf = 0, curShot = -1, done = false;

    function shotAt(time) { for (var i = starts.length - 1; i >= 0; i--) if (time >= starts[i]) return i; return 0; }
    function cursorPos(s, lt) {
      var c = s.cur || [[0, 480, 300]];
      if (lt <= c[0][0]) return [c[0][1], c[0][2]];
      for (var i = 0; i < c.length - 1; i++) {
        if (lt >= c[i][0] && lt <= c[i + 1][0]) {
          var k = (lt - c[i][0]) / (c[i + 1][0] - c[i][0] || 1);
          k = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // плавность
          return [c[i][1] + (c[i + 1][1] - c[i][1]) * k, c[i][2] + (c[i + 1][2] - c[i][2]) * k];
        }
      }
      var e = c[c.length - 1]; return [e[1], e[2]];
    }
    function draw() {
      if (vid) return;
      var i = shotAt(t), s = d.shots[i], lt = t - starts[i];
      if (i !== curShot) {
        curShot = i;
        el('shot').innerHTML = KM.data.scenes[s.scene](s.opts || {});
        el('annot').innerHTML = KM.ui.annotSvg(s.annot);
        el('caption').textContent = s.caption || '';
        KM.$$('#chapters button', root).forEach(function (b, j) { b.classList.toggle('on', j === i); });
      }
      var pos = cursorPos(s, lt);
      el('cursor').setAttribute('transform', 'translate(' + pos[0].toFixed(1) + ' ' + pos[1].toFixed(1) + ')');
      // щелчки: круги в течение 0,45 с после точки с флагом click
      var r = '';
      (s.cur || []).forEach(function (c) {
        if (c[3] && lt >= c[0] && lt < c[0] + 0.45) {
          var k = (lt - c[0]) / 0.45;
          r += '<circle cx="' + c[1] + '" cy="' + c[2] + '" r="' + (6 + k * 22) + '" fill="none" stroke="#ff3b30" stroke-width="3" opacity="' + (1 - k) + '"/>';
        }
      });
      el('ripple').innerHTML = r;
      el('seek').value = Math.round(t / total * 1000);
      el('time').textContent = fmt(t) + ' / ' + fmt(total);
    }
    function tick(now) {
      var dt = Math.min(0.1, (now - last) / 1000); last = now;
      t += dt * rate;
      if (t >= total) { t = total; pause(); finish(); }
      draw();
      if (playing) raf = requestAnimationFrame(tick);
    }
    function finish() {
      if (done) return; done = true;
      if (!KM.store.state.demos[d.id]) { KM.store.state.demos[d.id] = Date.now(); KM.game.addXP(20, 'Видео просмотрено: ' + d.title); }
    }
    function play() {
      if (vid) { vid.play(); return; }
      if (t >= total) { t = 0; }
      playing = true; el('pp').textContent = '⏸'; el('pp').setAttribute('aria-label', 'Пауза');
      last = performance.now(); raf = requestAnimationFrame(tick);
    }
    function pause() {
      if (vid) { vid.pause(); return; }
      playing = false; el('pp').textContent = '▶'; el('pp').setAttribute('aria-label', 'Воспроизвести'); cancelAnimationFrame(raf);
    }
    function seek(to) {
      if (vid) { vid.currentTime = Math.max(0, Math.min(vid.duration || 0, to)); return; }
      t = Math.max(0, Math.min(total, to)); draw();
    }
    function setRate(r) { rate = r; if (vid) vid.playbackRate = r; el('rate').value = String(r); }

    el('pp').onclick = function () { (vid ? !vid.paused : playing) ? pause() : play(); };
    el('back').onclick = function () { seek((vid ? vid.currentTime : t) - 5); };
    el('fwd').onclick = function () { seek((vid ? vid.currentTime : t) + 5); };
    el('seek').oninput = function () { seek(this.value / 1000 * (vid ? vid.duration || 0 : total)); };
    el('rate').onchange = function () { setRate(parseFloat(this.value)); };
    el('fs').onclick = function () { var pl = el('player'); if (document.fullscreenElement) document.exitFullscreen(); else if (pl.requestFullscreen) pl.requestFullscreen(); };
    KM.$$('#chapters button', root).forEach(function (b) { b.onclick = function () { seek(parseFloat(b.dataset.t) + 0.01); if (!playing && !vid) play(); }; });
    el('player').onkeydown = function (e) {
      if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); el('pp').click(); }
      if (e.key === 'ArrowLeft') el('back').click();
      if (e.key === 'ArrowRight') el('fwd').click();
      var rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2], ri = rates.indexOf(rate);
      if (e.key === '[' && ri > 0) setRate(rates[ri - 1]);
      if (e.key === ']' && ri < rates.length - 1) setRate(rates[ri + 1]);
    };
    if (vid) {
      vid.ontimeupdate = function () { el('seek').value = vid.duration ? Math.round(vid.currentTime / vid.duration * 1000) : 0; el('time').textContent = fmt(vid.currentTime) + ' / ' + fmt(vid.duration || 0); };
      vid.onplay = function () { el('pp').textContent = '⏸'; };
      vid.onpause = function () { el('pp').textContent = '▶'; };
      vid.onended = finish;
    } else draw();
    return { destroy: function () { playing = false; cancelAnimationFrame(raf); } };
  }
})();
