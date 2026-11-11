/* מסע הכלים — משחק קצר לתרגול ארבע אסטרטגיות ברוח Cog-Fun: עצור, תכנון, גיוס מאמץ, בדיקה.
   התוכן (עולמות) מגיע מ-window.COGFUN_THEMES ומעולמות שנשמרו במכשיר. */
(function () {
  'use strict';

  var doc = document;
  doc.documentElement.setAttribute('dir', 'rtl');
  doc.documentElement.setAttribute('lang', 'he');

  // ---------- תוכן קבוע ----------
  var ORDER = ['stop', 'plan', 'effort', 'check'];
  var TOOLS = {
    stop: {
      name: 'עצור',
      cue: 'עוצרים. נושמים. מסתכלים.',
      what: 'לפני שמתחילים, עוצרים רגע. ככה לא פועלים מהר מדי.'
    },
    plan: {
      name: 'תכנון',
      cue: 'מה עושים קודם? ומה אחר כך?',
      what: 'מסדרים את הצעדים לפני שיוצאים לדרך.'
    },
    effort: {
      name: 'גיוס מאמץ',
      cue: 'זה קשה, ואפשר להמשיך.',
      what: 'כשנהיה קשה או משעמם, מגייסים כוח וממשיכים עד הסוף.'
    },
    check: {
      name: 'בדיקה',
      cue: 'עוברים על הכול. עשינו מה שתכננו?',
      what: 'בסוף בודקים: הכול נעשה? משהו חסר?'
    }
  };
  var ICONS = {
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><rect x="7.4" y="6.6" width="2.1" height="7.4" rx="1.05"/><rect x="9.9" y="4.8" width="2.1" height="8.6" rx="1.05"/><rect x="12.4" y="5.2" width="2.1" height="8.4" rx="1.05"/><rect x="14.9" y="6.8" width="2.1" height="7.2" rx="1.05"/><rect x="7.4" y="11" width="9.6" height="8.2" rx="3.4"/><rect x="4.9" y="11.6" width="2.2" height="5.6" rx="1.1" transform="rotate(-32 6 14.4)"/></svg>',
    plan: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h10M4 12h10M4 18h10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><g fill="currentColor"><circle cx="19" cy="6" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="19" cy="18" r="2"/></g></svg>',
    effort: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.6 2 4.6 13.6h6L9.4 22l10-12.6h-6.2z" fill="currentColor"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.8"/><path d="M15.6 15.6 21 21"/><path d="M7.6 10.7l2.1 2.1 3.7-4"/></svg>'
  };
  var LEVELS = {
    easy: { label: 'רגוע', stop: { n: 8, ms: 2800 }, plan: 3, effort: [[6, 2], [9, 3], [12, 4]], check: { need: 4, missing: 1, extra: 1 } },
    normal: { label: 'רגיל', stop: { n: 12, ms: 2100 }, plan: 4, effort: [[9, 3], [12, 4], [16, 5]], check: { need: 5, missing: 2, extra: 1 } },
    hard: { label: 'מאתגר', stop: { n: 16, ms: 1600 }, plan: 5, effort: [[12, 3], [16, 5], [20, 6]], check: { need: 6, missing: 2, extra: 2 } }
  };
  var DEFAULT_SITUATIONS = ['התארגנות בבוקר', 'שיעורי בית', 'סידור החדר', 'מקלחת ושינה', 'סוף זמן מסך', 'משחק עם חברים'];
  var EFFORT_PHRASES = ['עוד קצת ומסיימים!', 'לאט לאט, אחד אחרי השני', 'קשה? סימן שהמוח מתאמן'];
  var SWATCHES = ['#1F8A4C', '#5B4BC4', '#C2477F', '#B8651B', '#2466C9', '#0E8C8C', '#B23A3A', '#5A6B2E'];
  var CHECKIN = {
    yes: { label: 'השתמשתי בו', stars: 2, reply: 'כל הכבוד! ככה כלי נהיה שלך.' },
    tried: { label: 'ניסיתי קצת', stars: 1, reply: 'לנסות זה כבר להשתמש. ממשיכים!' },
    notyet: { label: 'עוד לא', stars: 0, reply: 'לא נורא. אולי היום תהיה הזדמנות.' }
  };

  // ---------- שמירה במכשיר ----------
  var KEY = 'masa-hakelim.v1';
  function defaults() {
    return { name: '', level: 'normal', sound: true, situations: DEFAULT_SITUATIONS.slice(), customThemes: [], log: [], pending: null, stars: 0, stickers: {} };
  }
  function load() {
    var d = defaults();
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var saved = JSON.parse(raw) || {};
        Object.keys(d).forEach(function (k) { if (saved[k] !== undefined) d[k] = saved[k]; });
      }
    } catch (e) { /* ממשיכים בלי שמירה */ }
    if (!LEVELS[d.level]) d.level = 'normal';
    if (!Array.isArray(d.situations) || !d.situations.length) d.situations = DEFAULT_SITUATIONS.slice();
    if (!Array.isArray(d.customThemes)) d.customThemes = [];
    if (!Array.isArray(d.log)) d.log = [];
    if (!d.stickers || typeof d.stickers !== 'object') d.stickers = {};
    d.stars = +d.stars || 0;
    return d;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* אין שמירה */ } }
  var S = load();

  // ---------- עזרים ----------
  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function sample(arr, n) { return shuffle(arr).slice(0, n); }
  function cycle(arr, n) { var out = []; while (out.length < n) out = out.concat(shuffle(arr)); return out.slice(0, n); }
  function badge(tool, size) { return '<span class="badge ' + (size || '') + '" data-tool="' + tool + '">' + ICONS[tool] + '</span>'; }
  function starsHTML(n) { var s = ''; for (var i = 1; i <= 3; i++) s += '<span class="' + (i <= n ? 'on' : '') + '">★</span>'; return '<div class="stars" role="img" aria-label="' + n + ' כוכבים מתוך 3">' + s + '</div>'; }
  function tileHTML(it) { return '<span class="tile-e" aria-hidden="true">' + esc(it.e) + '</span><span class="tile-t">' + esc(it.t) + '</span>'; }
  function guideHTML(th, text) {
    return '<div class="guide"><span class="guide-face" aria-hidden="true">' + esc(th.guide.emoji) + '</span><p class="bubble">' +
      (th.guide.name ? '<b>' + esc(th.guide.name) + '</b>' : '') + text + '</p></div>';
  }

  var timers = [];
  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  var ac = null;
  function tone(freq, at, dur, vol) {
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.08, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(ac.destination); o.start(at); o.stop(at + dur + 0.02);
  }
  function sfx(kind) {
    if (!S.sound) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ac = ac || new AC();
      if (ac.state === 'suspended') ac.resume();
      var t = ac.currentTime;
      if (kind === 'good') { tone(660, t, 0.09); tone(880, t + 0.09, 0.14); }
      else if (kind === 'oops') { tone(220, t, 0.18, 0.05); }
      else if (kind === 'tap') { tone(520, t, 0.06, 0.05); }
      else if (kind === 'win') { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, t + i * 0.1, 0.16); }); }
    } catch (e) { /* בלי צליל */ }
  }

  // ---------- עולמות תוכן ----------
  function builtinThemes() { return (window.COGFUN_THEMES || []).map(function (t) { return normalizeTheme(t).theme; }).filter(Boolean); }
  function allThemes() { return builtinThemes().concat(S.customThemes); }
  function parseItem(x) {
    if (x && typeof x === 'object') return { e: String(x.e || x.emoji || '').trim(), t: String(x.t || x.label || x.name || '').trim() };
    var s = String(x || '').trim();
    var m = s.match(/^(\S+)\s+(.*)$/);
    return m ? { e: m[1], t: m[2].trim() } : { e: s, t: '' };
  }
  function splitEmojis(x) {
    if (Array.isArray(x)) return x.map(function (s) { return String(s).trim(); }).filter(Boolean);
    return String(x || '').split(/[\s,]+/).filter(Boolean);
  }
  // מקבל אובייקט עולם (מקובץ, מייבוא או מהטופס) ומחזיר עולם תקין או רשימת בעיות
  function normalizeTheme(raw) {
    var errors = [];
    raw = raw || {};
    var th = {
      id: String(raw.id || ''),
      name: String(raw.name || '').trim(),
      emoji: String(raw.emoji || '').trim() || '⭐',
      color: SWATCHES.indexOf(raw.color) >= 0 || /^#[0-9a-f]{6}$/i.test(raw.color || '') ? raw.color : SWATCHES[0],
      guide: { name: String((raw.guide && raw.guide.name) || '').trim(), emoji: String((raw.guide && raw.guide.emoji) || '').trim() },
      mission: String(raw.mission || '').trim(),
      story: String(raw.story || '').trim(),
      container: { name: String((raw.container && raw.container.name) || '').trim() || 'התיק', emoji: String((raw.container && raw.container.emoji) || '').trim() || '🎒' },
      needed: (Array.isArray(raw.needed) ? raw.needed : []).map(parseItem).filter(function (i) { return i.e; }),
      notNeeded: (Array.isArray(raw.notNeeded) ? raw.notNeeded : []).map(parseItem).filter(function (i) { return i.e; }),
      steps: (Array.isArray(raw.steps) ? raw.steps : []).map(function (s) { return String(s).trim(); }).filter(Boolean),
      search: { target: String((raw.search && raw.search.target) || '').trim(), others: splitEmojis(raw.search && raw.search.others) }
    };
    if (!th.guide.emoji) th.guide.emoji = th.emoji;
    if (!th.search.target) th.search.target = th.emoji;
    th.search.others = th.search.others.filter(function (e) { return e !== th.search.target; });
    if (!th.name) errors.push('חסר שם לעולם.');
    if (!th.mission) errors.push('חסר שם למשימה.');
    if (th.needed.length < 6) errors.push('צריך לפחות 6 פריטים ששייכים למשימה (יש ' + th.needed.length + ').');
    if (th.notNeeded.length < 4) errors.push('צריך לפחות 4 פריטים שלא שייכים (יש ' + th.notNeeded.length + ').');
    if (th.steps.length < 3) errors.push('צריך לפחות 3 צעדים לפי הסדר (יש ' + th.steps.length + ').');
    if (th.search.others.length < 3) errors.push('צריך לפחות 3 אימוג׳ים מסיחים למשחק החיפוש (יש ' + th.search.others.length + ').');
    return errors.length ? { errors: errors } : { theme: th, errors: [] };
  }

  // ---------- מסך ----------
  var app = $('#app'), stage = $('#stage'), pathEl = $('#path'), modal = $('#modal');
  var session = null;   // { theme, idx, stars:{}, playing, logId }

  function show(html, tool) {
    clearTimers();
    stage.innerHTML = html;
    if (tool) stage.setAttribute('data-tool', tool); else stage.removeAttribute('data-tool');
    renderChrome();
    window.scrollTo(0, 0);
    var h = $('h1, h2', stage);
    if (h) { h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (e) { /* דפדפן ישן */ } }
  }
  function on(sel, fn, ev) { $all(sel, stage).forEach(function (el) { el.addEventListener(ev || 'click', function (e) { fn(el, e); }); }); }
  function renderChrome() {
    $('#starCount').textContent = S.stars;
    var sb = $('#soundBtn');
    sb.textContent = S.sound ? 'צליל פועל' : 'צליל כבוי';
    sb.setAttribute('aria-pressed', S.sound ? 'true' : 'false');
    $('#parentsBtn').hidden = !!session;
    if (session && session.idx < ORDER.length) {
      pathEl.hidden = false;
      pathEl.innerHTML = ORDER.map(function (t, i) {
        var st = i < session.idx ? 'is-done' : i === session.idx ? 'is-now' : 'is-next';
        return '<div class="path-node ' + st + '" data-tool="' + t + '"' + (i === session.idx ? ' aria-current="step"' : '') + '>' + badge(t) + '<span>' + TOOLS[t].name + '</span></div>';
      }).join('');
      app.style.setProperty('--world', session.theme.color);
    } else {
      pathEl.hidden = true;
    }
  }
  function ask(text, yes, no, cb) {
    modal.hidden = false;
    modal.innerHTML = '<div class="card center" role="dialog" aria-modal="true"><p class="lead">' + esc(text) + '</p><div class="row">' +
      '<button class="btn slim" id="askYes" type="button">' + esc(yes) + '</button><button class="btn ghost slim" id="askNo" type="button">' + esc(no) + '</button></div></div>';
    $('#askYes').onclick = function () { modal.hidden = true; cb(true); };
    $('#askNo').onclick = function () { modal.hidden = true; cb(false); };
    $('#askNo').focus();
  }

  $('#homeBtn').addEventListener('click', function () {
    if (!session) { home(); return; }
    clearTimers();
    ask('לצאת מהמשימה באמצע?', 'כן, יוצאים', 'ממשיכים לשחק', function (leave) {
      if (leave) { session = null; home(); }
      else if (session.playing) stationIntro();
    });
  });
  $('#soundBtn').addEventListener('click', function () { S.sound = !S.sound; save(); renderChrome(); sfx('tap'); });
  $('#parentsBtn').addEventListener('click', function () { parents(); });

  // ---------- בית ----------
  function home() {
    session = null;
    var themes = allThemes();
    var p = S.pending;
    var hello = S.name ? 'שלום ' + esc(S.name) + '!' : 'שלום!';
    var html = '<div class="stack">' +
      '<section class="hero"><p class="lead soft">' + hello + '</p><h1 class="title xl">מסע הכלים</h1>' +
      '<p class="lead">משימה קצרה, ארבעה כלים, וכלי אחד שלוקחים הביתה.</p></section>' +
      '<div class="legend" aria-label="ארבעת הכלים">' + ORDER.map(function (t) {
        return '<div class="legend-item" data-tool="' + t + '">' + badge(t, 'mid') + '<span>' + TOOLS[t].name + '</span></div>';
      }).join('') + '</div>';

    if (p) {
      html += '<section class="card takehome" data-tool="' + p.tool + '" id="takehome">' +
        '<h3 class="h3">' + (p.checked ? 'הכלי שלקחת הביתה' : 'בפעם הקודמת לקחת הביתה כלי') + '</h3>' +
        '<dl><dt>הכלי</dt><dd>' + TOOLS[p.tool].name + '</dd><dt>מתי</dt><dd>' + esc(p.situation) + '</dd></dl>' +
        (p.checked
          ? '<p class="cue">' + TOOLS[p.tool].cue + '</p>'
          : '<p class="lead">איך הלך?</p><div class="row">' + Object.keys(CHECKIN).map(function (k) {
            return '<button class="btn ghost slim" type="button" data-checkin="' + k + '">' + CHECKIN[k].label + '</button>';
          }).join('') + '</div>') +
        '<p class="feedback good" id="checkinReply"></p></section>';
    }

    html += '<h2 class="h3">באיזה עולם משחקים היום?</h2><div class="worlds">' + themes.map(function (th) {
      var n = S.stickers[th.id] || 0;
      return '<button class="world" type="button" data-world="' + esc(th.id) + '" style="--w:' + esc(th.color) + '">' +
        '<span class="world-e" aria-hidden="true">' + esc(th.emoji) + '</span><span class="world-n">' + esc(th.name) + '</span>' +
        '<span class="world-m">' + esc(th.mission) + '</span>' +
        (n ? '<span class="world-s">' + n + ' משימות הושלמו</span>' : '') + '</button>';
    }).join('') + '</div></div>';
    show(html);

    on('[data-world]', function (el) {
      var th = allThemes().filter(function (t) { return t.id === el.getAttribute('data-world'); })[0];
      if (th) { sfx('tap'); startSession(th); }
    });
    on('[data-checkin]', function (el) {
      var k = el.getAttribute('data-checkin'), c = CHECKIN[k];
      S.pending.checked = true; S.pending.result = k; S.stars += c.stars;
      S.log.forEach(function (row) { if (row.id === S.pending.logId) row.result = k; });
      save();
      if (c.stars) sfx('good');
      home();
      $('#checkinReply').textContent = c.reply + (c.stars ? ' (+' + c.stars + ' ★)' : '');
    });
  }

  // ---------- משימה ----------
  function startSession(th) {
    session = { theme: th, idx: 0, stars: {}, playing: false };
    app.style.setProperty('--world', th.color);
    var html = '<div class="stack">' +
      '<section class="banner"><span class="banner-e" aria-hidden="true">' + esc(th.emoji) + '</span>' +
      '<p class="small">המשימה של היום</p><h1 class="title">' + esc(th.mission) + '</h1></section>' +
      '<section class="card">' + guideHTML(th, esc(th.story || 'כדי להצליח במשימה צריך ארבעה כלים.')) +
      '<p class="soft small">ארבע תחנות קצרות. בכל תחנה מתאמנים בכלי אחד.</p>' +
      '<button class="btn world" type="button" id="go">יוצאים למשימה</button></section></div>';
    show(html);
    on('#go', function () { sfx('tap'); stationIntro(); });
  }

  var TASK_LINES = {
    stop: function (th) { return 'אוספים אל ' + esc(th.container.name) + ' רק מה ששייך למשימה. מופיע משהו שלא שייך? עוצרים ולא נוגעים.'; },
    plan: function () { return 'לפני שיוצאים לדרך מסדרים את הצעדים. מה עושים קודם, ומה אחר כך?'; },
    effort: function (th) { return 'מחפשים כל ' + esc(th.search.target) + ' שמתחבא. יש שלושה סיבובים, וכל אחד קצת יותר קשה. לא מוותרים!'; },
    check: function (th) { return 'כמעט סיימנו. בודקים לפי הרשימה: מה נמצא בתוך ' + esc(th.container.name) + ', ומה חסר?'; }
  };
  var PLAY = { stop: playStop, plan: playPlan, effort: playEffort, check: playCheck };

  function stationIntro() {
    var tool = ORDER[session.idx], T = TOOLS[tool], th = session.theme;
    session.playing = false;
    var html = '<section class="card center">' + badge(tool, 'big') +
      '<p class="kicker">כלי ' + (session.idx + 1) + ' מתוך 4</p><h2 class="title">' + T.name + '</h2>' +
      '<p class="lead">' + T.what + '</p><p class="cue">' + T.cue + '</p>' +
      guideHTML(th, TASK_LINES[tool](th)) +
      '<button class="btn tool" type="button" id="go">מתחילים</button></section>';
    show(html, tool);
    on('#go', function () { sfx('tap'); session.playing = true; PLAY[tool](); });
  }

  function stationDone(tool, stars, line) {
    session.stars[tool] = stars;
    session.playing = false;
    var last = session.idx + 1 >= ORDER.length;
    sfx('win');
    var html = '<section class="card center">' + badge(tool, 'big') +
      '<h2 class="title">הכלי ״' + TOOLS[tool].name + '״ אצלך!</h2>' + starsHTML(stars) +
      '<p class="lead">' + line + '</p><p class="cue">' + TOOLS[tool].cue + '</p>' +
      '<button class="btn tool" type="button" id="go">' + (last ? 'לסיום המשימה' : 'לכלי הבא') + '</button></section>';
    show(html, tool);
    on('#go', function () { sfx('tap'); session.idx++; if (last) summary(); else stationIntro(); });
  }

  // ---------- תחנה 1: עצור ----------
  function playStop() {
    var th = session.theme, L = LEVELS[S.level].stop;
    show('<section class="card center"><h2 class="title">קודם כול עוצרים</h2>' +
      '<p class="lead">לוחצים על השלט, ונושמים נשימה אחת עמוקה.</p>' +
      '<button class="stopsign" type="button" id="sign">עצור</button></section>', 'stop');
    on('#sign', function () {
      sfx('tap');
      show('<section class="card center"><h2 class="title">נושמים</h2><div class="breath" id="breath">שואפים…</div>' +
        '<p class="lead soft">עוצרים. נושמים. מסתכלים.</p></section>', 'stop');
      later(function () { var b = $('#breath'); if (b) b.textContent = 'נושפים…'; }, 2200);
      later(round, 4400);
    });

    function round() {
      var nGo = Math.round(L.n * 0.6);
      var queue = shuffle(
        cycle(th.needed, nGo).map(function (it) { return { it: it, go: true }; })
          .concat(cycle(th.notNeeded, L.n - nGo).map(function (it) { return { it: it, go: false }; }))
      );
      var i = -1, res = { hit: 0, hold: 0, miss: 0, slip: 0 }, locked = true, tmo = null;
      show('<section class="card"><div class="belt-top"><span id="count"></span><span>' + esc(th.container.emoji) + ' <span id="bagN">0</span></span></div>' +
        '<p class="lead center">שייך למשימה? נוגעים. לא שייך? עוצרים.</p>' +
        '<button class="belt-item" type="button" id="item"></button>' +
        '<div class="timebar"><i id="bar" style="--ms:' + L.ms + 'ms"></i></div><p class="feedback" id="fb"></p></section>', 'stop');
      var item = $('#item'), bar = $('#bar'), fb = $('#fb');
      item.addEventListener('click', tap);

      function next() {
        i++;
        if (i >= queue.length) { finish(); return; }
        $('#count').textContent = (i + 1) + ' / ' + queue.length;
        item.className = 'belt-item in';
        item.innerHTML = tileHTML(queue[i].it);
        fb.textContent = ''; fb.className = 'feedback';
        bar.classList.remove('run'); void bar.offsetWidth; bar.classList.add('run');
        locked = false;
        tmo = later(timeout, L.ms);
      }
      function settle(cls, fbCls, text, sound) {
        locked = true;
        clearTimeout(tmo);
        bar.classList.remove('run');
        item.className = 'belt-item ' + cls;
        fb.className = 'feedback ' + fbCls; fb.textContent = text;
        if (sound) sfx(sound);
        later(next, 900);
      }
      function tap() {
        if (locked) return;
        if (queue[i].go) { res.hit++; $('#bagN').textContent = res.hit; settle('good', 'good', 'נכנס!', 'good'); }
        else { res.slip++; settle('oops', 'oops', 'זה לא שייך. בפעם הבאה עוצרים.', 'oops'); }
      }
      function timeout() {
        if (locked) return;
        if (queue[i].go) { res.miss++; settle('pass', '', 'זה דווקא היה שייך. לא נורא!', null); }
        else { res.hold++; settle('pass', 'good', 'יפה שעצרת!', 'good'); }
      }
      function finish() {
        var acc = (res.hit + res.hold) / queue.length;
        var stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
        var noGo = queue.length - nGo;
        stationDone('stop', stars, 'עצרת ' + res.hold + ' פעמים מתוך ' + noGo + ' כשהופיע משהו שלא שייך.');
      }
      later(next, 500);
    }
  }

  // ---------- תחנה 2: תכנון ----------
  function pickSteps(steps, k) {
    if (steps.length <= k) return steps.slice();
    var out = [];
    for (var j = 0; j < k; j++) out.push(steps[Math.round(j * (steps.length - 1) / (k - 1))]);
    return out;
  }
  function playPlan() {
    var steps = pickSteps(session.theme.steps, LEVELS[S.level].plan);
    var order = steps.map(function (s, i) { return i; }), tries = 0;
    do { order = shuffle(order); tries++; } while (tries < 20 && order.every(function (v, i) { return v === i; }));
    var placed = 0, mistakes = 0;
    show('<section class="card"><h2 class="title">בונים תוכנית</h2><p class="lead">נוגעים בצעד שבא עכשיו.</p>' +
      '<ol class="plan-list" id="plan">' + steps.map(function () { return '<li>&nbsp;</li>'; }).join('') + '</ol>' +
      '<p class="feedback" id="fb"></p>' +
      '<div class="pool">' + order.map(function (i) { return '<button class="step" type="button" data-i="' + i + '">' + esc(steps[i]) + '</button>'; }).join('') + '</div></section>', 'plan');
    var slots = $all('#plan li'), fb = $('#fb');
    on('.step', function (el) {
      var i = +el.getAttribute('data-i');
      if (i === placed) {
        slots[placed].textContent = steps[i]; slots[placed].className = 'filled';
        el.remove(); placed++; sfx('good');
        fb.className = 'feedback good'; fb.textContent = placed < steps.length ? 'נכון! ומה אחר כך?' : 'יש תוכנית!';
        if (placed === steps.length) {
          later(function () {
            stationDone('plan', mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1, 'סידרת ' + steps.length + ' צעדים לפי הסדר. עכשיו ברור מה עושים.');
          }, 1100);
        }
      } else {
        mistakes++; sfx('oops');
        el.classList.remove('oops'); void el.offsetWidth; el.classList.add('oops');
        fb.className = 'feedback oops'; fb.textContent = 'עוד לא. מה צריך לקרות לפני זה?';
      }
    });
  }

  // ---------- תחנה 3: גיוס מאמץ ----------
  function playEffort() {
    var th = session.theme, rounds = LEVELS[S.level].effort;
    var total = rounds.reduce(function (s, r) { return s + r[1]; }, 0), foundAll = 0, phrase = '';

    function round(r) {
      var cells = rounds[r][0], targets = rounds[r][1], found = 0, hintT = null;
      var arr = [];
      for (var i = 0; i < cells; i++) arr.push(i < targets ? th.search.target : th.search.others[Math.floor(Math.random() * th.search.others.length)]);
      arr = shuffle(arr);
      var cols = cells <= 9 ? 3 : cells <= 16 ? 4 : 5;
      show('<section class="card"><div class="belt-top"><span>סיבוב ' + (r + 1) + ' מתוך ' + rounds.length + '</span><span id="found"></span></div>' +
        '<div class="meter" role="img" aria-label="מד המאמץ"><i id="meter" style="width:' + (foundAll / total * 100) + '%"></i></div>' +
        (phrase ? '<p class="cue center">' + esc(phrase) + '</p>' : '<p class="lead center">מוצאים כל ' + esc(th.search.target) + ' ונוגעים בו.</p>') +
        '<div class="grid" style="--cols:' + cols + '">' + arr.map(function (e, i) {
          return '<button class="cell" type="button" data-t="' + (e === th.search.target ? 1 : 0) + '" aria-label="משבצת ' + (i + 1) + '">' + esc(e) + '</button>';
        }).join('') + '</div>' +
        '<p class="feedback" id="fb"></p><button class="btn ghost" type="button" id="hint" hidden>רמז קטן</button></section>', 'effort');
      var fb = $('#fb'), hintBtn = $('#hint');
      function count() { $('#found').textContent = 'מצאנו ' + found + ' מתוך ' + targets; }
      function armHint() { clearTimeout(hintT); hintBtn.hidden = true; hintT = later(function () { hintBtn.hidden = false; }, 12000); }
      count(); armHint();
      hintBtn.addEventListener('click', function () {
        var left = $all('.cell[data-t="1"]:not(.found)', stage)[0];
        if (left) { left.classList.add('hint'); later(function () { left.classList.remove('hint'); }, 1500); }
        armHint();
      });
      on('.cell', function (el) {
        if (el.classList.contains('found')) return;
        if (el.getAttribute('data-t') === '1') {
          el.classList.remove('hint'); el.classList.add('found'); el.disabled = true;
          found++; foundAll++; sfx('good'); count(); armHint();
          $('#meter').style.width = (foundAll / total * 100) + '%';
          fb.textContent = '';
          if (found === targets) { clearTimeout(hintT); hintBtn.hidden = true; later(function () { afterRound(r); }, 800); }
        } else {
          sfx('oops');
          el.classList.remove('oops'); void el.offsetWidth; el.classList.add('oops');
          fb.className = 'feedback'; fb.textContent = 'כמעט. ממשיכים לחפש.';
        }
      });
    }
    function afterRound(r) {
      if (r + 1 >= rounds.length) {
        stationDone('effort', 3, 'שלושה סיבובים, עד הסוף. גם כשנהיה קשה, לא ויתרת.');
      } else if (r + 2 === rounds.length) {
        show('<section class="card center">' + badge('effort', 'big') + '<h2 class="title">נהיה קשה יותר</h2>' +
          '<p class="lead">הסיבוב האחרון הוא הכי ארוך. זה הרגע לגייס מאמץ. מה נגיד לעצמנו?</p>' +
          '<div class="phrases">' + EFFORT_PHRASES.map(function (p, i) { return '<button class="btn ghost" type="button" data-p="' + i + '">' + p + '</button>'; }).join('') + '</div></section>', 'effort');
        on('[data-p]', function (el) { phrase = EFFORT_PHRASES[+el.getAttribute('data-p')]; sfx('tap'); round(r + 1); });
      } else {
        round(r + 1);
      }
    }
    round(0);
  }

  // ---------- תחנה 4: בדיקה ----------
  function playCheck() {
    var th = session.theme, L = LEVELS[S.level].check;
    var need = sample(th.needed, L.need);
    var missing = sample(need, L.missing);
    var extras = sample(th.notNeeded, L.extra);
    var bag = shuffle(need.filter(function (it) { return missing.indexOf(it) < 0; }).concat(extras));
    var mistakes = 0, marked = 0, removed = 0;

    show('<section class="card"><h2 class="title">בודקים לפי הרשימה</h2>' +
      '<h3 class="h3">' + esc(th.container.emoji) + ' מה יש בתוך ' + esc(th.container.name) + '</h3>' +
      '<div class="bag" id="bag">' + bag.map(function (it) {
        return '<div class="tile" data-x="' + (extras.indexOf(it) >= 0 ? 1 : 0) + '">' + tileHTML(it) + '</div>';
      }).join('') + '</div>' +
      '<p class="feedback" id="fb"></p>' +
      '<div id="listWrap" class="stack"><h3 class="h3">הרשימה: יש או חסר?</h3><ul class="checklist">' + need.map(function (it, i) {
        return '<li data-i="' + i + '"><span class="what"><span aria-hidden="true">' + esc(it.e) + '</span>' + esc(it.t) + '</span>' +
          '<button class="pick" type="button" data-a="has">יש</button><button class="pick" type="button" data-a="miss">חסר</button></li>';
      }).join('') + '</ul></div></section>', 'check');
    var fb = $('#fb');

    on('.pick', function (el) {
      var li = el.parentNode, it = need[+li.getAttribute('data-i')];
      var isMissing = missing.indexOf(it) >= 0;
      var right = (el.getAttribute('data-a') === 'miss') === isMissing;
      if (right) {
        sfx('good');
        li.className = 'done';
        $all('.pick', li).forEach(function (b) { b.remove(); });
        li.insertAdjacentHTML('beforeend', '<span class="tag">' + (isMissing ? 'חסר, מוסיפים' : 'יש ✓') + '</span>');
        if (isMissing) $('#bag').insertAdjacentHTML('beforeend', '<div class="tile added" data-x="0">' + tileHTML(it) + '</div>');
        fb.className = 'feedback good'; fb.textContent = isMissing ? 'טוב שבדקנו!' : '';
        marked++;
        if (marked === need.length) later(phaseB, 900);
      } else {
        mistakes++; sfx('oops');
        li.classList.remove('oops'); void li.offsetWidth; li.classList.add('oops');
        fb.className = 'feedback oops'; fb.textContent = 'מסתכלים שוב בתוך ' + th.container.name + '.';
      }
    });

    function phaseB() {
      $('#listWrap').hidden = true;
      fb.className = 'feedback'; fb.textContent = extras.length > 1 ? 'ועוד בדיקה: יש כאן דברים שלא שייכים. נוגעים בהם כדי להוציא.' : 'ועוד בדיקה: משהו כאן לא שייך. נוגעים בו כדי להוציא.';
      $all('#bag .tile').forEach(function (t) {
        var b = doc.createElement('button');
        b.type = 'button'; b.className = 'tile'; b.setAttribute('data-x', t.getAttribute('data-x')); b.innerHTML = t.innerHTML;
        t.parentNode.replaceChild(b, t);
        b.addEventListener('click', function () {
          if (b.getAttribute('data-x') === '1') {
            b.classList.add('gone'); b.disabled = true; removed++; sfx('good');
            if (removed === extras.length) {
              fb.className = 'feedback good'; fb.textContent = 'בדקנו, והכול מוכן!';
              later(function () {
                stationDone('check', mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1, 'הבדיקה מצאה ' + missing.length + ' חסרים ו־' + extras.length + ' שלא שייכים. בלי בדיקה היינו מפספסים.');
              }, 1100);
            }
          } else {
            mistakes++; sfx('oops');
            b.classList.remove('oops'); void b.offsetWidth; b.classList.add('oops');
          }
        });
      });
    }
  }

  // ---------- סיכום + כלי לקחת הביתה ----------
  function summary() {
    var th = session.theme;
    var total = ORDER.reduce(function (s, t) { return s + (session.stars[t] || 0); }, 0);
    var logId = Date.now();
    S.stars += total;
    S.stickers[th.id] = (S.stickers[th.id] || 0) + 1;
    S.log.unshift({ id: logId, date: logId, theme: th.name, level: S.level, stars: total, tool: '', situation: '', result: '' });
    S.log = S.log.slice(0, 60);
    save();
    session.logId = logId;
    session.playing = false;

    var html = '<div class="stack"><section class="banner"><span class="banner-e" aria-hidden="true">' + esc(th.emoji) + '</span>' +
      '<h1 class="title">המשימה הושלמה!</h1><p>' + total + ' כוכבים חדשים, וארבעה כלים בתיק.</p></section>' +
      '<div class="results">' + ORDER.map(function (t) {
        return '<div class="result" data-tool="' + t + '">' + badge(t) + '<div><b>' + TOOLS[t].name + '</b>' + starsHTML(session.stars[t] || 0) + '</div></div>';
      }).join('') + '</div>' +
      '<button class="btn world" type="button" id="go">כלי אחד לוקחים הביתה</button></div>';
    show(html);
    sfx('win');
    on('#go', function () { sfx('tap'); takeHome(); });
  }

  function takeHome() {
    var tool = '', situation = '';
    show('<section class="card" id="th"><h2 class="title">איזה כלי לוקחים הביתה?</h2>' +
      '<p class="lead">בוחרים כלי אחד שיעזור היום, וגם מתי.</p>' +
      '<div class="choices">' + ORDER.map(function (t) {
        return '<button class="choice" type="button" data-tool="' + t + '" aria-pressed="false">' + badge(t, 'mid') + TOOLS[t].name + '<small>' + TOOLS[t].cue + '</small></button>';
      }).join('') + '</div>' +
      '<h3 class="h3">מתי הוא יעזור?</h3><div class="chips" id="chips">' + S.situations.map(function (s, i) {
        return '<button class="chip" type="button" data-s="' + i + '" aria-pressed="false">' + esc(s) + '</button>';
      }).join('') + '</div>' +
      '<button class="btn" type="button" id="go" disabled>זה הכלי שלי להיום</button></section>');
    var card = $('#th'), go = $('#go');
    function refresh() { go.disabled = !(tool && situation); if (tool) { card.setAttribute('data-tool', tool); go.className = 'btn tool'; } }
    on('.choice', function (el) {
      tool = el.getAttribute('data-tool'); sfx('tap');
      $all('.choice', stage).forEach(function (b) { b.setAttribute('aria-pressed', b === el ? 'true' : 'false'); });
      refresh();
    });
    on('.chip', function (el) {
      situation = S.situations[+el.getAttribute('data-s')]; sfx('tap');
      $all('.chip', stage).forEach(function (b) { b.setAttribute('aria-pressed', b === el ? 'true' : 'false'); });
      refresh();
    });
    on('#go', function () {
      var logId = session.logId;
      S.pending = { tool: tool, situation: situation, logId: logId, checked: false, result: '' };
      S.log.forEach(function (row) { if (row.id === logId) { row.tool = tool; row.situation = situation; } });
      save();
      session = null;
      sfx('win');
      show('<section class="card takehome center" data-tool="' + tool + '">' + badge(tool, 'big') +
        '<h2 class="title">הכלי שלי להיום</h2>' +
        '<dl><dt>הכלי</dt><dd>' + TOOLS[tool].name + '</dd><dt>מתי</dt><dd>' + esc(situation) + '</dd></dl>' +
        '<p class="cue">' + TOOLS[tool].cue + '</p>' +
        '<p class="soft small">בפעם הבאה שנשחק, נשאל איך הלך.</p>' +
        '<button class="btn" type="button" id="done">סיימנו להיום</button></section>');
      on('#done', function () { home(); });
    });
  }

  // ---------- אזור הורים ומטפלים ----------
  var AI_PROMPT = [
    'אני מכין/ה "עולם תוכן" למשחק "מסע הכלים": משחק קצר לילדים, שמתרגל ארבע אסטרטגיות ברוח Cog-Fun (עצור, תכנון, גיוס מאמץ, בדיקה).',
    'תחום העניין של הילד/ה: [להשלים כאן, למשל: דינוזאורים / בלט / לגו / שחייה]',
    'גיל: [להשלים]',
    '',
    'החזר JSON בלבד, בדיוק במבנה הזה:',
    '{',
    '  "name": "שם העולם",',
    '  "emoji": "🦖",',
    '  "guide": { "name": "שם של דמות מלווה", "emoji": "🦕" },',
    '  "mission": "משימה אחת ברורה, בלשון רבים (למשל: מתכוננים למשחק הגדול)",',
    '  "story": "שניים-שלושה משפטים קצרים שפותחים את המשימה",',
    '  "container": { "name": "לאן אוספים את הפריטים, בצורה מיודעת (למשל: תיק הספורט)", "emoji": "🎒" },',
    '  "needed": ["⚽ כדור", "..."],',
    '  "notNeeded": ["📱 טלפון", "..."],',
    '  "steps": ["צעד ראשון", "צעד שני", "..."],',
    '  "search": { "target": "⚽", "others": ["🏀", "🏐", "🎾", "🥎", "🏈", "⚾"] }',
    '}',
    '',
    'כללים:',
    '- needed: 8 פריטים שבאמת נחוצים למשימה. כל פריט: אימוג׳י אחד, רווח, ומילה או שתיים.',
    '- notNeeded: 7 פריטים שברור לילד שאינם שייכים למשימה (מסיחים מוכרים מהיום-יום).',
    '- steps: 5 צעדים קצרים, בלשון רבים (לובשים, בודקים), שיש להם סדר הגיוני אחד בלבד.',
    '- search.target: אימוג׳י אחד. search.others: 6 אימוג׳ים דומים לו אבל שונים.',
    '- עברית פשוטה וחיובית, בלי פנייה בלשון זכר או נקבה.'
  ].join('\n');

  function themeToForm(th) {
    function lines(items) { return items.map(function (i) { return (i.e + ' ' + i.t).trim(); }).join('\n'); }
    return {
      name: th.name, emoji: th.emoji, color: th.color, guideName: th.guide.name, guideEmoji: th.guide.emoji,
      mission: th.mission, story: th.story, contName: th.container.name, contEmoji: th.container.emoji,
      needed: lines(th.needed), notNeeded: lines(th.notNeeded), steps: th.steps.join('\n'),
      target: th.search.target, others: th.search.others.join(' ')
    };
  }
  function exportTheme(th) {
    var o = JSON.parse(JSON.stringify(th));
    delete o.id;
    o.needed = th.needed.map(function (i) { return (i.e + ' ' + i.t).trim(); });
    o.notNeeded = th.notNeeded.map(function (i) { return (i.e + ' ' + i.t).trim(); });
    return JSON.stringify(o, null, 2);
  }
  function copyFrom(box, note) {
    function fallback() { box.focus(); box.select(); note.textContent = 'הטקסט מסומן. אפשר להעתיק.'; }
    try {
      navigator.clipboard.writeText(box.value).then(function () { note.textContent = 'הועתק.'; }, fallback);
    } catch (e) { fallback(); }
  }

  function parents(openId, flash) {
    session = null;
    var custom = S.customThemes;
    var html = '<div class="stack"><section class="hero"><h1 class="title">להורים ולמטפלים</h1>' +
      '<p class="soft">כאן מתאימים את המשחק לילד/ה: שם, רמה, מצבים מהיום-יום ועולמות תוכן. הכול נשמר במכשיר הזה בלבד.</p>' +
      (flash ? '<p class="ok">' + esc(flash) + '</p>' : '') + '</section>' +

      '<details class="panel" id="p-settings"' + (openId === 'p-settings' || !openId ? ' open' : '') + '><summary>הגדרות</summary><div class="stack">' +
      '<label class="field"><span>שם הילד/ה (לא חובה)</span><input type="text" id="set-name" maxlength="20" value="' + esc(S.name) + '"></label>' +
      '<div class="field"><span>רמה</span><div class="radios">' + Object.keys(LEVELS).map(function (k) {
        return '<label><input type="radio" name="level" id="set-level-' + k + '" value="' + k + '"' + (S.level === k ? ' checked' : '') + '><span>' + LEVELS[k].label + '</span></label>';
      }).join('') + '</div><small>״רגוע״: פחות פריטים ויותר זמן. ״מאתגר״: יותר פריטים ופחות זמן.</small></div>' +
      '<label class="field"><span>מצבים מהיום-יום (שורה לכל מצב)</span><textarea id="set-situations">' + esc(S.situations.join('\n')) + '</textarea>' +
      '<small>מתוכם בוחרים בסוף המשימה מתי להשתמש בכלי. כדאי לכתוב כאן את המטרות שעובדים עליהן בטיפול.</small></label>' +
      '<button class="btn slim" type="button" id="set-save">שמירה</button></div></details>' +

      '<details class="panel" id="p-themes"' + (openId === 'p-themes' ? ' open' : '') + '><summary>עולמות תוכן</summary><div class="stack">' +
      '<p class="soft small">עולם תוכן הוא תחום עניין אחד: משימה, פריטים וצעדים. הכלים והמבנה נשארים קבועים, ורק התוכן מתחלף.</p><div>' +
      builtinThemes().map(function (th) {
        return '<div class="themerow"><span aria-hidden="true">' + esc(th.emoji) + '</span><span class="n">' + esc(th.name) + '</span><span class="soft small">מובנה</span>' +
          '<button class="linkbtn" type="button" data-dup="' + esc(th.id) + '">שכפול ועריכה</button></div>';
      }).join('') +
      custom.map(function (th) {
        return '<div class="themerow"><span aria-hidden="true">' + esc(th.emoji) + '</span><span class="n">' + esc(th.name) + '</span>' +
          '<button class="linkbtn" type="button" data-edit="' + esc(th.id) + '">עריכה</button>' +
          '<button class="linkbtn" type="button" data-export="' + esc(th.id) + '">ייצוא</button>' +
          '<button class="linkbtn danger" type="button" data-del="' + esc(th.id) + '">מחיקה</button></div>';
      }).join('') + '</div>' +
      '<button class="btn slim" type="button" id="th-new">עולם חדש</button>' +
      '<div class="field" id="exportWrap" hidden><span>העולם כ-JSON (להעתקה ולשיתוף)</span><textarea class="box mono" id="exportBox" readonly></textarea>' +
      '<button class="btn ghost slim" type="button" id="exportCopy">העתקה</button><small id="exportNote"></small></div>' +
      '<label class="field"><span>ייבוא עולם מ-JSON</span><textarea class="box mono" id="importBox" placeholder="{ ... }"></textarea></label>' +
      '<button class="btn ghost slim" type="button" id="importBtn">ייבוא</button><p class="err" id="importErr"></p>' +
      '<div class="field"><span>בקשה מוכנה ל-AI ליצירת עולם חדש</span><textarea class="box" id="aiBox" readonly>' + esc(AI_PROMPT) + '</textarea>' +
      '<button class="btn ghost slim" type="button" id="aiCopy">העתקת הבקשה</button><small id="aiNote">ממלאים את תחום העניין, שולחים לעוזר AI, ואת התשובה מדביקים ב״ייבוא עולם״.</small></div>' +
      '</div></details>' +

      '<details class="panel" id="p-log"' + (openId === 'p-log' ? ' open' : '') + '><summary>יומן התקדמות</summary><div class="stack">' +
      (S.log.length ? '<div class="tablewrap"><table><thead><tr><th>תאריך</th><th>עולם</th><th>כוכבים</th><th>כלי לבית</th><th>מתי</th><th>איך הלך</th></tr></thead><tbody>' +
        S.log.map(function (r) {
          return '<tr><td>' + new Date(r.date).toLocaleDateString('he-IL') + '</td><td>' + esc(r.theme) + '</td><td>' + r.stars + ' / 12</td><td>' +
            (r.tool && TOOLS[r.tool] ? TOOLS[r.tool].name : '—') + '</td><td>' + esc(r.situation || '—') + '</td><td>' + (r.result && CHECKIN[r.result] ? CHECKIN[r.result].label : '—') + '</td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<p class="soft">עוד אין משימות ביומן. אחרי המשימה הראשונה יופיעו כאן העולם, הכוכבים, הכלי שנבחר לבית ואיך הלך.</p>') +
      '<button class="linkbtn danger" type="button" id="resetAll">איפוס כל הנתונים במכשיר</button></div></details>' +

      '<details class="panel" id="p-tips"' + (openId === 'p-tips' ? ' open' : '') + '><summary>איך לשחק יחד</summary><ul class="tips">' +
      '<li>משחקים יחד, כחמש דקות. המבוגר מתווך: שואל, מתפעל, ולא פותר במקום הילד/ה.</li>' +
      '<li>משתמשים באותן מילים גם מחוץ למשחק: ״עוצרים״, ״מה התוכנית?״, ״מגייסים מאמץ״, ״בודקים״.</li>' +
      '<li>אחרי כל תחנה אפשר לשאול: ״באיזה כלי השתמשת עכשיו? איפה עוד הוא עוזר לך?״</li>' +
      '<li>הכלי שנבחר לבית הוא העיקר. כדאי להזכיר אותו ברגע המתאים, ולשים לב כשהוא מופיע.</li>' +
      '<li>טעות במשחק היא הזדמנות לעצור ולחשוב, ולא כישלון. המשחק לא מעניש על טעויות.</li>' +
      '<li>המשחק תומך בתרגול ואינו מחליף טיפול. את המטרות והמצבים כדאי לתאם עם המרפא/ה בעיסוק.</li></ul></details>' +

      '<button class="btn ghost" type="button" id="back">חזרה למשחק</button></div>';
    show(html);

    on('#back', function () { home(); });
    on('#set-save', function () {
      S.name = $('#set-name').value.trim();
      var lv = $('input[name="level"]:checked'); if (lv) S.level = lv.value;
      var sit = $('#set-situations').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      S.situations = sit.length ? sit : DEFAULT_SITUATIONS.slice();
      save(); parents('p-settings', 'ההגדרות נשמרו.');
    });
    on('#th-new', function () { editor(null); });
    on('[data-edit]', function (el) { editor(custom.filter(function (t) { return t.id === el.getAttribute('data-edit'); })[0]); });
    on('[data-dup]', function (el) {
      var src = builtinThemes().filter(function (t) { return t.id === el.getAttribute('data-dup'); })[0];
      var copy = JSON.parse(JSON.stringify(src)); copy.id = ''; copy.name = src.name + ' (עותק)';
      editor(copy);
    });
    on('[data-export]', function (el) {
      var th = custom.filter(function (t) { return t.id === el.getAttribute('data-export'); })[0];
      $('#exportWrap').hidden = false; $('#exportBox').value = exportTheme(th); $('#exportNote').textContent = '';
    });
    on('#exportCopy', function () { copyFrom($('#exportBox'), $('#exportNote')); });
    on('#aiCopy', function () { copyFrom($('#aiBox'), $('#aiNote')); });
    on('[data-del]', function (el) {
      var id = el.getAttribute('data-del');
      ask('למחוק את העולם הזה?', 'כן, למחוק', 'ביטול', function (yes) {
        if (!yes) return;
        S.customThemes = S.customThemes.filter(function (t) { return t.id !== id; }); save();
        parents('p-themes', 'העולם נמחק.');
      });
    });
    on('#importBtn', function () {
      var err = $('#importErr'), raw = $('#importBox').value.trim(), obj;
      var m = raw.match(/\{[\s\S]*\}/);
      try { obj = JSON.parse(m ? m[0] : raw); } catch (e) { err.textContent = 'זה לא JSON תקין. כדאי להעתיק שוב את כל הטקסט, מהסוגר הפותח { ועד הסוגר הסוגר }.'; return; }
      var res = normalizeTheme(obj);
      if (res.errors.length) { err.textContent = res.errors.join('\n'); return; }
      res.theme.id = 'custom-' + Date.now();
      S.customThemes.push(res.theme); save();
      parents('p-themes', 'העולם ״' + res.theme.name + '״ נוסף.');
    });
    on('#resetAll', function () {
      ask('לאפס את כל הנתונים? העולמות שיצרתם, היומן והכוכבים יימחקו.', 'כן, לאפס', 'ביטול', function (yes) {
        if (!yes) return;
        S = defaults(); save(); parents('p-log', 'הנתונים אופסו.');
      });
    });
  }

  function editor(th) {
    var isNew = !th || !th.id;
    var f = th ? themeToForm(th) : { name: '', emoji: '', color: SWATCHES[0], guideName: '', guideEmoji: '', mission: '', story: '', contName: '', contEmoji: '', needed: '', notNeeded: '', steps: '', target: '', others: '' };
    function text(id, label, val, hint, max) {
      return '<label class="field"><span>' + label + '</span><input type="text" id="' + id + '" value="' + esc(val) + '"' + (max ? ' maxlength="' + max + '"' : '') + '>' + (hint ? '<small>' + hint + '</small>' : '') + '</label>';
    }
    function area(id, label, val, hint) {
      return '<label class="field"><span>' + label + '</span><textarea id="' + id + '">' + esc(val) + '</textarea><small>' + hint + '</small></label>';
    }
    show('<div class="stack"><section class="hero"><h1 class="title">' + (isNew ? 'עולם חדש' : 'עריכת עולם') + '</h1>' +
      '<p class="soft">ממלאים תחום עניין אחד. את ארבע התחנות המשחק בונה לבד מהרשימות.</p></section>' +
      '<section class="card">' +
      '<div class="two">' + text('th-name', 'שם העולם', f.name, '', 24) + text('th-emoji', 'אימוג׳י', f.emoji, '', 8) + '</div>' +
      '<div class="field"><span>צבע</span><div class="radios">' + SWATCHES.map(function (c, i) {
        return '<label><input type="radio" name="th-color" id="th-color-' + i + '" value="' + c + '"' + (f.color === c ? ' checked' : '') + '><span class="swatch" style="--c:' + c + '"></span></label>';
      }).join('') + '</div></div>' +
      text('th-mission', 'המשימה', f.mission, 'בלשון רבים, למשל: מתכוננים למשחק הגדול', 40) +
      area('th-story', 'פתיחה קצרה', f.story, 'שניים-שלושה משפטים. אפשר להשאיר ריק.') +
      '<div class="two">' + text('th-guide-name', 'דמות מלווה', f.guideName, '', 16) + text('th-guide-emoji', 'אימוג׳י', f.guideEmoji, '', 8) + '</div>' +
      '<div class="two">' + text('th-cont-name', 'לאן אוספים', f.contName, 'בצורה מיודעת: תיק הספורט, החללית', 24) + text('th-cont-emoji', 'אימוג׳י', f.contEmoji, '', 8) + '</div>' +
      area('th-needed', 'פריטים ששייכים למשימה', f.needed, 'שורה לכל פריט: אימוג׳י, רווח, מילה. לפחות 6, עדיף 8.') +
      area('th-not', 'פריטים שלא שייכים', f.notNeeded, 'מסיחים שהילד/ה מכיר/ה. לפחות 4, עדיף 7.') +
      area('th-steps', 'צעדי המשימה לפי הסדר', f.steps, 'שורה לכל צעד, מהראשון לאחרון. 3 עד 6 צעדים.') +
      '<div class="two">' + text('th-others', 'משחק החיפוש: אימוג׳ים מסיחים', f.others, 'לפחות 3, עם רווח ביניהם', 60) + text('th-target', 'מה מחפשים', f.target, '', 8) + '</div>' +
      '<p class="err" id="th-err"></p>' +
      '<div class="row"><button class="btn slim" type="button" id="th-save">שמירת העולם</button><button class="btn ghost slim" type="button" id="th-cancel">ביטול</button></div>' +
      '</section></div>');
    function lines(id) { return $('#' + id).value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean); }
    on('#th-cancel', function () { parents('p-themes'); });
    on('#th-save', function () {
      var color = $('input[name="th-color"]:checked');
      var res = normalizeTheme({
        name: $('#th-name').value, emoji: $('#th-emoji').value, color: color ? color.value : SWATCHES[0],
        guide: { name: $('#th-guide-name').value, emoji: $('#th-guide-emoji').value },
        mission: $('#th-mission').value, story: $('#th-story').value,
        container: { name: $('#th-cont-name').value, emoji: $('#th-cont-emoji').value },
        needed: lines('th-needed'), notNeeded: lines('th-not'), steps: lines('th-steps'),
        search: { target: $('#th-target').value, others: $('#th-others').value }
      });
      if (res.errors.length) { $('#th-err').textContent = res.errors.join('\n'); return; }
      if (isNew) { res.theme.id = 'custom-' + Date.now(); S.customThemes.push(res.theme); }
      else { res.theme.id = th.id; S.customThemes = S.customThemes.map(function (t) { return t.id === th.id ? res.theme : t; }); }
      save();
      parents('p-themes', 'העולם ״' + res.theme.name + '״ נשמר.');
    });
  }

  home();
})();
