/* =========================================================
   Достижения и медали. test(state, game) → true, если получено.
   ========================================================= */
(function () {
  function doneCount(s, track) {
    return KM.data.lessons.filter(function (l) { return (!track || l.track === track) && s.lessons[l.id] && s.lessons[l.id].done; }).length;
  }
  function trackDone(s, track) {
    var ls = KM.data.lessons.filter(function (l) { return l.track === track; });
    return ls.length > 0 && ls.every(function (l) { return s.lessons[l.id] && s.lessons[l.id].done; });
  }
  function perfect(s) { return Object.keys(s.quizzes).filter(function (k) { return s.quizzes[k].perfect; }).length; }
  function projects(s, medal) { return Object.keys(s.projects).filter(function (k) { var p = s.projects[k]; return p.checked && (!medal || p.medal === medal); }).length; }

  KM.data.achievements = [
    { id: 'first-step', icon: '👣', title: 'Первый шаг', desc: 'Пройти первый урок', test: function (s) { return doneCount(s) >= 1; } },
    { id: 'lessons-5', icon: '📗', title: 'Втянулся', desc: 'Пройти 5 уроков', test: function (s) { return doneCount(s) >= 5; } },
    { id: 'lessons-15', icon: '📘', title: 'Упорство', desc: 'Пройти 15 уроков', test: function (s) { return doneCount(s) >= 15; } },
    { id: 'lessons-30', icon: '📙', title: 'Полпути', desc: 'Пройти 30 уроков', test: function (s) { return doneCount(s) >= 30; } },
    { id: 'lessons-all', icon: '🎓', title: 'Выпускник', desc: 'Пройти все основные уроки (1–44)', test: function (s) { return ['start', 'schematic', 'pcb', 'production'].every(function (t) { return trackDone(s, t); }); } },
    { id: 'track-start', icon: '🚀', title: 'Старт дан', desc: 'Завершить трек «Основы»', test: function (s) { return trackDone(s, 'start'); } },
    { id: 'track-sch', icon: '📐', title: 'Схемотехник', desc: 'Завершить трек «Редактор схем»', test: function (s) { return trackDone(s, 'schematic'); } },
    { id: 'track-pcb', icon: '🟩', title: 'Трассировщик', desc: 'Завершить трек «Редактор плат»', test: function (s) { return trackDone(s, 'pcb'); } },
    { id: 'track-prod', icon: '🏭', title: 'Готов к заводу', desc: 'Завершить трек «Производство»', test: function (s) { return trackDone(s, 'production'); } },
    { id: 'track-adv', icon: '⚡', title: 'Профи', desc: 'Завершить все продвинутые темы', test: function (s) { return trackDone(s, 'advanced'); } },
    { id: 'bonus', icon: '🎁', title: 'Искатель сокровищ', desc: 'Пройти бонусный урок', test: function (s) { return doneCount(s, 'bonus') >= 1; } },
    { id: 'perfect-1', icon: '💯', title: 'Отличник', desc: 'Пройти тест без ошибок', test: function (s) { return perfect(s) >= 1; } },
    { id: 'perfect-10', icon: '🧠', title: 'Эрудит', desc: '10 тестов без ошибок', test: function (s) { return perfect(s) >= 10; } },
    { id: 'first-try', icon: '🎯', title: 'Снайпер', desc: 'Тест без ошибок с первой попытки', test: function (s) { return Object.keys(s.quizzes).some(function (k) { return s.quizzes[k].perfect === 'first'; }); } },
    { id: 'project-1', icon: '🛠️', title: 'Руки из нужного места', desc: 'Выполнить первый практический проект', test: function (s) { return projects(s) >= 1; } },
    { id: 'project-5', icon: '🔧', title: 'Мастерская', desc: 'Выполнить 5 проектов', test: function (s) { return projects(s) >= 5; } },
    { id: 'project-all', icon: '🏗️', title: 'Конструктор', desc: 'Выполнить все проекты', test: function (s) { return (KM.data.projects || []).length > 0 && projects(s) >= KM.data.projects.length; } },
    { id: 'gold', icon: '🥇', title: 'Золотая медаль', desc: 'Проект верно с первой попытки', test: function (s) { return projects(s, 'gold') >= 1; } },
    { id: 'gold-5', icon: '🏅', title: 'Коллекционер медалей', desc: '5 золотых медалей', test: function (s) { return projects(s, 'gold') >= 5; } },
    { id: 'hard-project', icon: '🧗', title: 'Сложный маршрут', desc: 'Выполнить проект уровня 3', test: function (s) { return (KM.data.projects || []).some(function (p) { return p.level === 3 && s.projects[p.id] && s.projects[p.id].checked; }); } },
    { id: 'streak-3', icon: '🔥', title: 'Разогрев', desc: '3 дня подряд', test: function (s, g) { return g.bestStreak() >= 3; } },
    { id: 'streak-7', icon: '🔥', title: 'Неделя огня', desc: '7 дней подряд', test: function (s, g) { return g.bestStreak() >= 7; } },
    { id: 'streak-30', icon: '☄️', title: 'Месяц без пропусков', desc: '30 дней подряд', test: function (s, g) { return g.bestStreak() >= 30; } },
    { id: 'sim-1', icon: '🔬', title: 'Экспериментатор', desc: 'Запустить схему в симуляторе', test: function (s) { return s.simRuns >= 1; } },
    { id: 'sim-burn', icon: '💥', title: 'Запах гари', desc: 'Сжечь светодиод в симуляторе (бывает!)', test: function (s) { return !!s.simBurn; } },
    { id: 'calc-5', icon: '🧮', title: 'Расчётчик', desc: 'Воспользоваться 5 разными калькуляторами', test: function (s) { return Object.keys(s.calcUses).length >= 5; } },
    { id: 'demo-3', icon: '🎬', title: 'Киноман', desc: 'Посмотреть 3 видео-демо до конца', test: function (s) { return Object.keys(s.demos).length >= 3; } },
    { id: 'comp-20', icon: '🧩', title: 'Знаток деталей', desc: 'Изучить 20 компонентов', test: function (s) { return Object.keys(s.viewed).filter(function (k) { return k.indexOf('c:') === 0; }).length >= 20; } },
    { id: 'history', icon: '🏛️', title: 'Историк', desc: 'Прочитать 3 статьи об истории', test: function (s) { return Object.keys(s.viewed).filter(function (k) { return k.indexOf('h:') === 0; }).length >= 3; } },
    { id: 'download', icon: '📦', title: 'Запасливый', desc: 'Скачать шаблон схемы', test: function (s) { return s.downloads >= 1; } },
    { id: 'notes', icon: '📝', title: 'Конспект', desc: 'Сделать заметку к уроку', test: function (s) { return Object.keys(s.notes).length >= 1; } },
    { id: 'bookmark', icon: '🔖', title: 'Закладочник', desc: 'Добавить 3 закладки', test: function (s) { return s.bookmarks.length >= 3; } },
    { id: 'ai', icon: '🤖', title: 'Собеседник', desc: 'Задать вопрос AI-ассистенту', test: function (s) { return s.aiQuestions >= 1; } },
    { id: 'level-5', icon: '🎖️', title: 'Уровень 5', desc: 'Достичь 5-го уровня', test: function (s, g) { return g.level() >= 5; } },
    { id: 'level-10', icon: '👑', title: 'Уровень 10', desc: 'Достичь 10-го уровня', test: function (s, g) { return g.level() >= 10; } },
    { id: 'night-owl', icon: '🦉', title: 'Сова', desc: 'Заниматься после полуночи', test: function (s) { var h = new Date().getHours(); return h >= 0 && h < 5 && doneCount(s) >= 1; } }
  ];
})();
