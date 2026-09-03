/* ============================================================
   Night Safari field guide — a small collectible set of seven.
   Loads after art.js and animals.js. Renders the grid and the
   detail card into #dex-view and keeps the animal id in the URL
   hash, so #otter can be linked and Back behaves itself.
   Calls are synthesised with the Web Audio API: no audio files,
   no network, works offline like the rest of the site.
   ============================================================ */
(function () {
  const A = window.ANIMALS || {};
  const view = document.getElementById('dex-view');
  const progressBox = document.getElementById('dex-progress');
  const live = document.getElementById('dex-live');
  if (!view) return;

  /* ---------- the set, in card order ---------- */
  const ORDER = ['otter', 'dhole', 'loris', 'pangolin', 'fishingcat', 'tiger', 'binturong'].filter((k) => A[k]);
  Object.keys(A).forEach((k) => { if (ORDER.indexOf(k) < 0) ORDER.push(k); });
  const N = ORDER.length;

  if (!N) {
    view.innerHTML = '<div class="card"><p>The animals are not loading tonight. A reload usually convinces them.</p></div>';
    return;
  }

  // Short names for the small spaces. Falls back to the full name.
  const SHORT = {
    otter: 'Otter', dhole: 'Dhole', loris: 'Slow Loris', pangolin: 'Pangolin',
    fishingcat: 'Fishing Cat', tiger: 'Tiger', binturong: 'Binturong',
  };
  /* Names follow config.js, so the aliases stay on when NAMES_ON is false. */
  const PEOPLE = window.PEOPLE || {};
  const HIM = PEOPLE.me || 'Carrot';
  const HER = PEOPLE.her || 'Onion';
  const HIS_KEY = 'fishingcat';   // his animal, same as CONFIG.myAnimal in quiz.js

  /* Her animal comes from the story. Missing, unreadable or unknown is fine:
     she simply gets no badge and nothing anywhere else changes. */
  let HER_KEY = null;
  try {
    const saved = localStorage.getItem('ns_result');
    if (saved && Object.prototype.hasOwnProperty.call(A, saved)) HER_KEY = saved;
  } catch (e) { /* private mode. No badge, no drama. */ }

  const MET = ORDER.filter((k) => k === HIS_KEY || k === HER_KEY);
  const isMet = (k) => MET.indexOf(k) >= 0;

  /* ---------- text helpers ---------- */
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
  // animals.js writes `alignment` with a deliberate <br>. Escape everything,
  // then let that one tag back through.
  const escBr = (v) => esc(v).replace(/&lt;br\s*\/?&gt;/gi, '<br>');
  // Colours land in a style attribute, so only let a plain hex through.
  const colour = (c) => (/^#[0-9a-f]{3,8}$/i.test(String(c || '')) ? String(c) : '#ffcf5c');
  const short = (k) => SHORT[k] || (A[k] && A[k].name) || k;
  const lower = (k) => short(k).toLowerCase();
  const pad = (n) => String(n).padStart(3, '0');
  const num = (k) => pad(ORDER.indexOf(k) + 1);
  const pic = (k) => (window.ART && window.ART.portrait
    ? window.ART.portrait(k)
    : '<img class="art portrait-img" src="img/' + esc(k) + '.webp" alt="">');
  const say = (msg) => { if (live) live.textContent = msg; };

  /* ============================================================
     The calls. Every one is a few oscillators and a bit of noise:
     an impression, not a recording. Nothing plays unprompted.
     ============================================================ */
  const CRY_NOTE = {
    otter: 'A burst of excited squeaks, all at once, about nothing.',
    dhole: "A rising whistle. It is how the pack says 'over here' in the dark.",
    loris: 'A soft unhurried whistle. It will get there when it gets there.',
    pangolin: 'Two small snuffles. Pangolins are famously almost silent, so this is generous.',
    fishingcat: 'A chirrup, then a low rumble of approval.',
    tiger: 'A long low roar, more felt than heard.',
    binturong: 'A popcorn-scented chuckle.',
  };

  let audio = null;            // AudioContext, made on the first tap
  let playing = null;          // gain node of whatever is sounding now
  let audioBroken = false;

  function ctx() {
    if (audioBroken) return null;
    if (!audio) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) { audioBroken = true; return null; }
      try { audio = new Ctor(); } catch (e) { audioBroken = true; return null; }
    }
    if (audio.state === 'suspended' && audio.resume) audio.resume().catch(() => {});
    return audio;
  }

  function noiseBuffer(c) {
    if (!c._dexNoise) {
      const buf = c.createBuffer(1, Math.floor(c.sampleRate * 1.5), c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      c._dexNoise = buf;
    }
    return c._dexNoise;
  }

  // A pitched note that slides from f0 to f1.
  function chirp(c, bus, at, o) {
    const t = c.currentTime + at;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f0, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.f1 || o.f0), t + o.dur);
    const peak = o.gain || 0.2;
    const rise = o.soft ? o.dur * 0.35 : 0.012;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + rise);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    osc.connect(g).connect(bus);
    osc.start(t);
    osc.stop(t + o.dur + 0.05);
  }

  // A breathy puff of filtered noise.
  function puff(c, bus, at, o) {
    const t = c.currentTime + at;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(o.f, t);
    bp.Q.value = o.q || 1;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain || 0.2, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(bp).connect(g).connect(bus);
    src.start(t);
    src.stop(t + o.dur + 0.05);
  }

  // Something big and low, with the top rolled off.
  function rumble(c, bus, at, o) {
    const t = c.currentTime + at;
    const osc = c.createOscillator();
    const lp = c.createBiquadFilter();
    const g = c.createGain();
    osc.type = o.saw ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(o.f0, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(25, o.f1 || o.f0), t + o.dur);
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(o.cut || 420, t);
    lp.frequency.exponentialRampToValueAtTime(180, t + o.dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain || 0.3, t + Math.min(0.08, o.dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    osc.connect(lp).connect(g).connect(bus);
    osc.start(t);
    osc.stop(t + o.dur + 0.05);
  }

  const CRIES = {
    otter: (c, bus) => {
      for (let i = 0; i < 5; i++) {
        chirp(c, bus, i * 0.085, { type: 'triangle', f0: 880 + i * 95, f1: 1480 + i * 95, dur: 0.07, gain: 0.2 });
      }
      chirp(c, bus, 0.47, { type: 'triangle', f0: 1300, f1: 900, dur: 0.12, gain: 0.16 });
    },
    dhole: (c, bus) => {
      chirp(c, bus, 0, { type: 'sine', f0: 720, f1: 1680, dur: 0.26, gain: 0.22 });
      chirp(c, bus, 0.25, { type: 'sine', f0: 1680, f1: 1180, dur: 0.32, gain: 0.18 });
      chirp(c, bus, 0.66, { type: 'sine', f0: 900, f1: 1500, dur: 0.2, gain: 0.14 });
    },
    loris: (c, bus) => {
      chirp(c, bus, 0, { type: 'sine', f0: 620, f1: 800, dur: 0.5, gain: 0.14, soft: true });
      chirp(c, bus, 0.62, { type: 'sine', f0: 780, f1: 560, dur: 0.5, gain: 0.11, soft: true });
    },
    pangolin: (c, bus) => {
      puff(c, bus, 0, { f: 780, q: 1.1, dur: 0.16, gain: 0.26 });
      puff(c, bus, 0.26, { f: 540, q: 1.1, dur: 0.22, gain: 0.22 });
      rumble(c, bus, 0.3, { f0: 120, f1: 90, dur: 0.25, gain: 0.12 });
    },
    fishingcat: (c, bus) => {
      chirp(c, bus, 0, { type: 'triangle', f0: 1150, f1: 720, dur: 0.11, gain: 0.2 });
      chirp(c, bus, 0.16, { type: 'triangle', f0: 980, f1: 640, dur: 0.14, gain: 0.18 });
      rumble(c, bus, 0.36, { f0: 72, f1: 58, dur: 0.55, gain: 0.3, saw: true, cut: 300 });
    },
    tiger: (c, bus) => {
      rumble(c, bus, 0, { f0: 92, f1: 60, dur: 1.15, gain: 0.42, saw: true, cut: 520 });
      puff(c, bus, 0.04, { f: 240, q: 0.8, dur: 1.0, gain: 0.16 });
      rumble(c, bus, 0.02, { f0: 46, f1: 38, dur: 1.2, gain: 0.28 });
    },
    binturong: (c, bus) => {
      for (let i = 0; i < 4; i++) {
        rumble(c, bus, i * 0.135, { f0: 158 - i * 9, f1: 120 - i * 8, dur: 0.11, gain: 0.26, saw: true, cut: 340 });
      }
      chirp(c, bus, 0.56, { type: 'sine', f0: 300, f1: 220, dur: 0.18, gain: 0.1 });
    },
  };

  function playCry(key, btn) {
    const c = ctx();
    if (!c || !CRIES[key]) {
      say('This browser would rather stay quiet. The animals understand.');
      return;
    }
    // Hush whatever is already sounding, gently.
    if (playing) {
      try {
        playing.gain.cancelScheduledValues(c.currentTime);
        playing.gain.setValueAtTime(playing.gain.value || 0.0001, c.currentTime);
        playing.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.06);
      } catch (e) { /* already finished */ }
    }
    const bus = c.createGain();
    bus.gain.value = 0.9;
    bus.connect(c.destination);
    playing = bus;
    try { CRIES[key](c, bus); } catch (e) { say('That call did not come out right. Try again?'); return; }
    setTimeout(() => { try { bus.disconnect(); } catch (e) {} if (playing === bus) playing = null; }, 2600);

    if (btn) {
      btn.classList.remove('playing');
      void btn.offsetWidth;
      btn.classList.add('playing');
      setTimeout(() => btn.classList.remove('playing'), 700);
    }
    say(short(key) + ': ' + CRY_NOTE[key]);
  }

  /* ============================================================
     Markup
     ============================================================ */
  function badgesHTML(k) {
    const out = [];
    if (k === HIS_KEY) out.push('<span class="dex-badge ya">' + esc(HIM) + '<span class="sr-only">, this one is ' + esc(HIM) + '’s</span></span>');
    if (k === HER_KEY) out.push('<span class="dex-badge xj">' + esc(HER) + '<span class="sr-only">, this one is ' + esc(HER) + '’s</span></span>');
    return out.length ? '<span class="dex-badges">' + out.join('') + '</span>' : '';
  }
  function badgeWords(k) {
    const who = [];
    if (k === HIS_KEY) who.push(HIM);
    if (k === HER_KEY) who.push(HER);
    return who.length ? ', ' + who.join(' and ') + '’s animal' : '';
  }

  function gridHTML() {
    const cards = ORDER.map((k) => {
      const an = A[k];
      return '<li class="dex-cell">'
        + '<button type="button" class="dex-card' + (isMet(k) ? ' is-met' : '') + '" data-open="' + esc(k) + '"'
        + ' style="--acc:' + colour(an.color) + '"'
        + ' aria-label="Card number ' + num(k) + ', ' + esc(an.name) + badgeWords(k) + '. Open its file.">'
        + badgesHTML(k)
        + '<span class="dex-no">No. ' + num(k) + '</span>'
        + '<span class="dex-pic">' + pic(k) + '</span>'
        + '<span class="dex-name">' + esc(short(k)) + '</span>'
        + '<span class="dex-species">' + esc(an.name) + '</span>'
        + '<span class="dex-status">' + (isMet(k) ? 'Met ✓' : 'Not yet met') + '</span>'
        + '</button>'
        + '<button type="button" class="dex-sound" data-cry="' + esc(k) + '" aria-label="Hear the ' + esc(lower(k)) + '">'
        + '<span aria-hidden="true">♪</span></button>'
        + '</li>';
    }).join('');

    // No. 008 is the Case 002 tie-in: a slot that never fills in.
    const locked = '<li class="dex-cell">'
      + '<button type="button" class="dex-card dex-locked" data-locked="1"'
      + ' aria-label="Card number 008, unidentified. Nothing is known about it yet.">'
      + '<span class="dex-no">No. 008</span>'
      + '<span class="dex-pic"><span class="dex-qmark" aria-hidden="true">?</span></span>'
      + '<span class="dex-name">Unidentified</span>'
      + '<span class="dex-species">Species unknown</span>'
      + '<span class="dex-status">No sightings</span>'
      + '</button></li>';

    return '<div class="screen">'
      + '<ul class="dex-grid">' + cards + locked + '</ul>'
      + '<p class="dex-note">Seven cards, seven real residents. Every fact on them is true, including the popcorn. '
      + 'The little ♪ plays each one’s call. No. 008 is not a mistake.</p>'
      + '<div class="stack" style="margin-top:16px">'
      + '<a class="btn mint" href="bingo.html">Open the bingo card</a>'
      + '<a class="btn paper" href="index.html">Back to the story</a>'
      + '</div></div>';
  }

  function listHTML(items) {
    return '<ul class="dex-list">' + (items || []).map((s) => '<li>' + esc(s) + '</li>').join('') + '</ul>';
  }
  function peersHTML(peers) {
    return (peers || []).map((p) => '<span class="dex-peer"><q>' + esc(p[0]) + '</q><span>— ' + esc(p[1]) + '</span></span>').join('');
  }

  function detailHTML(k) {
    const an = A[k];
    const i = ORDER.indexOf(k);
    const prev = ORDER[(i - 1 + N) % N];
    const next = ORDER[(i + 1) % N];

    return '<div class="screen">'
      + '<div class="dex-topbar">'
      + '<button type="button" class="dex-mini" data-back>← All seven</button>'
      + '<span class="dex-of">Card ' + num(k) + ' of ' + pad(N) + '</span>'
      + '</div>'

      + '<article class="idcard dex-file" style="--acc:' + colour(an.color) + '">'
      + '<div class="idhead">'
      + '<div class="dex-hno">No. ' + num(k) + '</div>'
      + '<h2 class="idname" id="dex-title" tabindex="-1">' + esc(an.name) + '</h2>'
      + '<p class="dex-tagline">' + esc(an.tagline) + '</p>'
      + badgesHTML(k)
      + '</div>'
      + '<div class="idbody">'
      + '<div class="dex-bigpic">' + pic(k) + '</div>'
      + '<button type="button" class="dex-cry" data-cry="' + esc(k) + '">'
      + '<span aria-hidden="true">♪</span> Hear the ' + esc(lower(k)) + '</button>'
      + '<p class="dex-crynote">' + esc(CRY_NOTE[k] || '') + ' Synthesised on the spot by a browser that has never met one.</p>'

      + '<div class="idblock"><b>One true thing</b>' + esc(an.fact) + '</div>'
      + '<div class="idblock"><b>Where to find it on Saturday</b>' + esc(an.findme) + '</div>'
      + '<div class="idblock"><b>Strengths</b>' + listHTML(an.strengths) + '</div>'
      + '<div class="idblock"><b>Weakness</b>' + listHTML(an.weakness) + '</div>'
      + '<div class="idblock quotes">' + (an.quotes || []).map(esc).join('<br>') + '</div>'
      + '<div class="idblock"><b>Alignment</b>' + escBr(an.alignment)
      + '<b style="margin-top:10px">Hidden talent</b>' + esc(an.talent) + '</div>'
      + '<div class="idblock"><b>Peer reviews</b>' + peersHTML(an.peers) + '</div>'
      + '<div class="idfoot">Card ' + num(k) + ' of ' + pad(N) + ' · ' + (isMet(k) ? 'met' : 'not yet met') + '</div>'
      + '</div></article>'

      + '<nav class="dex-nav" aria-label="Move through the set">'
      + '<button type="button" class="dex-navbtn" data-jump="' + esc(prev) + '" aria-label="Previous card: ' + esc(A[prev].name) + '">'
      + '<span class="arw" aria-hidden="true">‹</span><span class="lbl">' + esc(short(prev)) + '</span></button>'
      + '<button type="button" class="dex-navbtn" data-jump="' + esc(next) + '" aria-label="Next card: ' + esc(A[next].name) + '">'
      + '<span class="lbl">' + esc(short(next)) + '</span><span class="arw" aria-hidden="true">›</span></button>'
      + '</nav>'
      + '<button type="button" class="btn paper" style="margin-top:12px" data-back>Back to all seven</button>'
      + '<p class="dex-hint">Left and right arrows flick through the set. Escape comes back here.</p>'
      + '</div>';
  }

  function progressHTML() {
    const n = MET.length;
    const left = N - n;
    const pips = ORDER.map((k) => '<i class="' + (isMet(k) ? 'met' : '') + '" style="--acc:' + colour(A[k].color) + '"></i>').join('');
    const his = esc(lower(HIS_KEY));
    const him = esc(HIM);
    const her = esc(HER);
    let line;
    if (!HER_KEY) {
      line = '<b>' + n + ' of ' + N + '</b> met so far. ' + him + ' is the ' + his
        + ', and ' + her + '’s animal turns up here the moment the quiz has had its say. '
        + 'The rest are simply not met yet.';
    } else if (HER_KEY === HIS_KEY) {
      line = '<b>' + n + ' of ' + N + '</b> met so far. ' + her + ' and ' + him + ' are both the ' + his
        + ', which we are choosing to read as a good sign. The other ' + left + ' are still to meet.';
    } else {
      line = '<b>' + n + ' of ' + N + '</b> met so far: ' + her + ' the ' + esc(lower(HER_KEY)) + ', '
        + him + ' the ' + his
        + '. The other ' + left + ' are simply not met yet, which is a nice thing to still have ahead of us.';
    }
    return '<span class="dex-pips" aria-hidden="true">' + pips + '</span><p>' + line + '</p>';
  }

  /* ============================================================
     Routing: the hash is the whole state.
     ============================================================ */
  let shown = null;         // null before the first paint, '' for the grid, else an id
  let last = ORDER[0];      // the card to return focus to
  let pushed = false;       // did we push the current detail entry ourselves?

  function hashId() {
    let h = '';
    try { h = decodeURIComponent(String(location.hash || '').replace(/^#/, '')); } catch (e) { h = ''; }
    return Object.prototype.hasOwnProperty.call(A, h) && ORDER.indexOf(h) >= 0 ? h : '';
  }

  function render() {
    const id = hashId();
    if (id === shown) return;
    const first = shown === null;
    shown = id;

    if (id) {
      last = id;
      view.innerHTML = detailHTML(id);
      if (!first) {
        const title = document.getElementById('dex-title');
        if (title) title.focus({ preventScroll: true });
        window.scrollTo(0, 0);
        say(A[id].name + ', card ' + num(id) + ' of ' + pad(N) + '.');
      }
    } else {
      view.innerHTML = gridHTML();
      pushed = false;
      if (!first) {
        const card = view.querySelector('.dex-card[data-open="' + last + '"]');
        if (card) card.focus({ preventScroll: true });
        say('Back to all seven cards.');
      }
    }
  }

  function open(id) {
    if (!A[id]) return;
    history.pushState(null, '', '#' + id);
    pushed = true;
    render();
  }
  function jump(id) {
    if (!A[id]) return;
    // Flicking through replaces the entry, so Back always returns to the grid
    // rather than walking backwards through every animal.
    history.replaceState(null, '', '#' + id);
    render();
  }
  function toGrid() {
    if (pushed) { pushed = false; history.back(); return; }   // popstate re-renders
    history.replaceState(null, '', location.pathname + location.search);
    render();
  }
  const step = (dir) => {
    const i = ORDER.indexOf(shown);
    if (i < 0) return;
    jump(ORDER[(i + dir + N) % N]);
  };

  // No. 008 cannot be opened. It can only be poked, and it says less each time.
  const LOCKED_LINES = [
    'No sightings. No photographs. No description.',
    'Whatever it is, it was not there on Saturday.',
    'The file says it turns up for people who come back.',
    'That is genuinely all there is. See Case 002.',
  ];
  let lockedTaps = 0;
  function nudgeLocked(el) {
    lockedTaps++;
    el.classList.remove('nudge');
    void el.offsetWidth;
    el.classList.add('nudge');
    const status = el.querySelector('.dex-status');
    if (status) status.textContent = LOCKED_LINES[Math.min(lockedTaps - 1, LOCKED_LINES.length - 1)];
    if (navigator.vibrate) navigator.vibrate(20);
  }

  view.addEventListener('click', (e) => {
    const cry = e.target.closest('[data-cry]');
    if (cry) { playCry(cry.getAttribute('data-cry'), cry); return; }
    const card = e.target.closest('[data-open]');
    if (card) { open(card.getAttribute('data-open')); return; }
    const jumper = e.target.closest('[data-jump]');
    if (jumper) { jump(jumper.getAttribute('data-jump')); return; }
    const locked = e.target.closest('[data-locked]');
    if (locked) { nudgeLocked(locked); return; }
    if (e.target.closest('[data-back]')) toGrid();
  });

  document.addEventListener('keydown', (e) => {
    if (!shown) return;                                   // the grid needs no shortcuts
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    if (e.key === 'Escape') { e.preventDefault(); toGrid(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });

  window.addEventListener('hashchange', render);
  window.addEventListener('popstate', render);

  if (progressBox) progressBox.innerHTML = progressHTML();
  render();
})();
