/* ============================================================
   Night Safari field guide — seven quiz friends and six trail bonuses.
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
  const CORE_ORDER = (window.QUIZ_ANIMAL_KEYS || ['otter', 'dhole', 'loris', 'pangolin', 'fishingcat', 'tiger', 'binturong']).filter((k) => A[k]);
  const BONUS_ORDER = ['tapir', 'flyingsquirrel', 'flyingfox', 'owl', 'porcupine', 'elephant'].filter((k) => A[k]);
  const ORDER = [...CORE_ORDER, ...BONUS_ORDER];
  const isBonus = (k) => BONUS_ORDER.includes(k);
  const quests = window.BONUS_QUESTS;
  const keepsakes = window.KEEPSAKES;
  const N = ORDER.length;

  if (!N) {
    view.innerHTML = '<div class="card"><p>The animals are not loading tonight. A reload usually convinces them.</p></div>';
    return;
  }

  // Short names for the small spaces, from animals.js. Falls back to the full name.
  const SHORT = window.ANIMAL_SHORT || {};
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
    if (CORE_ORDER.includes(saved)) HER_KEY = saved;
  } catch (e) { /* private mode. No badge, no drama. */ }

  /* ---------- who has actually been met ----------
     Two come free: his fishing cat, and hers as soon as the quiz has spoken.
     The other five are silhouettes until somebody stands in front of one and
     says so. That list lives in localStorage. If the browser will not play
     along, or the value has been scribbled on since, we quietly start from
     nothing rather than making a fuss about it. */
  const DEX_KEY = 'ns_dex_met';
  function readSeen() {
    try {
      const raw = localStorage.getItem(DEX_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      // Known ids only, once each. Anything else is somebody else's typing.
      return arr.filter((k, i) => typeof k === 'string' && CORE_ORDER.indexOf(k) >= 0 && arr.indexOf(k) === i);
    } catch (e) { return []; }
  }
  const SEEN = readSeen();
  function saveSeen() {
    try { localStorage.setItem(DEX_KEY, JSON.stringify(SEEN)); } catch (e) { /* private mode. It still works for tonight. */ }
  }
  // The bingo card meets animals too, possibly in another tab since this page loaded.
  // Fold in whatever is on disk before writing, so nobody's sighting gets overwritten.
  function mergeSeen() {
    for (const k of readSeen()) if (SEEN.indexOf(k) < 0) SEEN.push(k);
  }

  /* Sightings that came from the bingo card. A quiz friend ticked over there is
     simply met, and lands in SEEN. A bonus is earned by naming its silhouette, so
     a real sighting cannot open one — it only adds a stamp to a card already won. */
  const WILD_KEY = 'ns_dex_wild_v1';
  let wild = [];
  try {
    const saved = JSON.parse(localStorage.getItem(WILD_KEY) || '[]');
    if (Array.isArray(saved)) wild = [...new Set(saved.filter((k) => BONUS_ORDER.includes(k)))];
  } catch (e) { /* private mode: no stamps, and nothing else changes. */ }
  const spotted = (k) => isBonus(k) && wild.indexOf(k) >= 0;

  const isAuto = (k) => k === HIS_KEY || k === HER_KEY;   // these two need no button
  const BONUS_KEY = 'ns_dex_bonus_v1';
  let bonusSaved = true;
  let earned = [];
  try {
    const saved = JSON.parse(localStorage.getItem(BONUS_KEY) || '[]');
    if (Array.isArray(saved)) earned = [...new Set(saved.filter(k => BONUS_ORDER.includes(k)))];
  } catch (_) { /* A corrupt value or private browser starts with fresh games. */ }
  const games = {};
  const isMet = (k) => isBonus(k) ? earned.includes(k) : isAuto(k) || SEEN.indexOf(k) >= 0;
  const metCount = () => ORDER.filter(isMet).length;
  const collectionComplete = () => metCount() === N;

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
  const num = (k) => pad(idx(k));
  const pic = (k) => (window.ART && window.ART.portrait
    ? window.ART.portrait(k)
    : '<img class="art portrait-img" src="img/' + esc(k) + '.webp" alt="">');
  const say = (msg) => { if (live) live.textContent = msg; };

  /* The card number is the only id we put in the markup. img/otter.webp would
     hand the whole surprise over to anyone who opened the inspector. */
  // Keep existing card numbers stable; append new bonuses after 011. No. 008 stays sealed.
  const idx = (k) => CORE_ORDER.includes(k) ? CORE_ORDER.indexOf(k) + 1 :
    BONUS_ORDER.includes(k) ? BONUS_ORDER.indexOf(k) + 9 : 0;
  const byIdx = (s) => ORDER.find(k => idx(k) === Number(s)) || '';

  /* Every shadow matches its finished raster portrait, not the older SVG art.
     Number-only filenames keep names out of the locked card's rendered markup. */
  function shade(k) {
    return '<img class="dex-portrait-shadow" src="img/shadow-' + num(k) + '.webp"'
      + ' width="720" height="720" alt="Mystery animal silhouette, card ' + num(k) + '"'
      + ' onerror="this.hidden=true;this.nextElementSibling.hidden=false">'
      + '<span class="dex-shadow-missing" hidden>Our shadow is hiding too. Try reloading in a little while.</span>';
  }

  /* The calls moved to animal-calls.js so the guessing game can use the same ones.
     This page still decides who may be heard: a shadow's call would give it away. */
  const CALLS = (typeof window !== 'undefined' && window.ANIMAL_CALLS) || null;
  const callNote = (k) => (CALLS ? CALLS.note(k) : '');

  function playCry(key, btn) {
    if (!ORDER.includes(key) || !isMet(key)) return;
    const how = CALLS ? CALLS.play(key) : 'quiet';
    if (how === 'quiet') { say('This browser would rather stay quiet. The animals understand.'); return; }
    if (how === 'broken') { say('That call did not come out right. Try again?'); return; }
    if (btn) {
      btn.classList.remove('playing');
      void btn.offsetWidth;
      btn.classList.add('playing');
      setTimeout(() => btn.classList.remove('playing'), 700);
    }
    say(short(key) + ': ' + callNote(key));
  }

  /* ============================================================
     Markup
     ============================================================ */
  function badgesHTML(k) {
    const out = [];
    if (isBonus(k)) return '<span class="dex-bonus-badge">✨ Trail bonus</span>';
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
    const cardHTML = (k) => {
      const an = A[k];
      const n = num(k);
      // Not met: a number, a shadow and nothing else. No name, no species,
      // no colour, no call button — the call alone would give it away.
      if (!isMet(k)) {
        return '<li class="dex-cell">'
          + '<button type="button" class="dex-card is-shadow' + (isBonus(k) ? ' is-bonus' : '') + '" data-idx="' + idx(k) + '"'
          + ' aria-label="Card number ' + n + (isBonus(k) ? '. Trail bonus. Guess the silhouette to reveal it.' : '. Not met yet. Open it for a hint.') + '">'
          + (isBonus(k) ? badgesHTML(k) : '')
          + '<span class="dex-no">No. ' + n + '</span>'
          + '<span class="dex-pic dex-shadowpic">' + shade(k) + '</span>'
          + '<span class="dex-name" aria-hidden="true">???</span>'
          + '<span class="dex-status">' + (isBonus(k) ? 'Guess to discover' : 'Not met yet') + '</span>'
          + '</button></li>';
      }
      return '<li class="dex-cell">'
        + '<button type="button" class="dex-card is-met' + (isBonus(k) ? ' is-bonus' : '') + '" data-idx="' + idx(k) + '"'
        + ' style="--acc:' + colour(an.color) + '"'
        + ' aria-label="Card number ' + n + ', ' + esc(an.name) + badgeWords(k) + '. Open its file.">'
        + badgesHTML(k)
        + '<span class="dex-no">No. ' + n + '</span>'
        + '<span class="dex-pic">' + pic(k) + '</span>'
        + '<span class="dex-name">' + esc(short(k)) + '</span>'
        + '<span class="dex-species">' + esc(an.name) + '</span>'
        + '<span class="dex-status">' + (isBonus(k) ? (spotted(k) ? 'Earned · spotted ✓' : 'Bonus earned ✓') : 'Met ✓') + '</span>'
        + '</button>'
        + '<button type="button" class="dex-sound" data-cry="' + esc(k) + '" aria-label="Hear the ' + esc(lower(k)) + '">'
        + '<span aria-hidden="true">♪</span></button>'
        + '</li>';
    };

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
      + '<h2 class="dex-section-title">The quiz cast</h2>'
      + '<ul class="dex-grid">' + CORE_ORDER.map(cardHTML).join('') + '</ul>'
      + '<p class="dex-note">Seven quiz friends, seven real residents. A shadow fills itself in the moment you meet the animal, '
      + 'and every fact that turns up on it is true, including the popcorn. The little ♪ plays a met animal’s call. '
      + 'Each shadow matches its portrait.</p>'
      + '<section class="dex-bonus-section" aria-labelledby="bonus-title"><h2 id="bonus-title">Six little detours</h2>'
      + '<p>These lilac-bordered friends are not quiz results. Who is hiding in each shadow? Guess their names to collect their cards.</p>'
      + '<ul class="dex-grid">' + BONUS_ORDER.map(cardHTML).join('') + '</ul>'
      + '<p class="dex-note">Clues if you need them. As many guesses as you like. A bonus is a little discovery, not a claim that you spotted the animal.</p></section>'
      + keepsakesHTML()
      + '<section class="dex-afterword" aria-labelledby="afterword-title"><h2 id="afterword-title">For another night</h2>'
      + '<ul class="dex-grid dex-last-card">' + locked + '</ul>'
      + '<p class="dex-note">No. 008 is not a mistake. Some introductions can wait.</p></section>'
      + '<div class="stack" style="margin-top:16px">'
      + '<a class="btn mint" href="bingo.html">Open the bingo card</a>'
      // Four is the smallest set the guessing game can offer a choice from. Below
      // that it would only be a locked door, so there is no door at all.
      + (metCount() >= 4 ? '<a class="btn lilac" href="calls.html">Who’s that call? ♪</a>' : '')
      + '<a class="btn paper" href="index.html">Back to the story</a>'
      + '</div></div>';
  }

  function listHTML(items) {
    return '<ul class="dex-list">' + (items || []).map((s) => '<li>' + esc(s) + '</li>').join('') + '</ul>';
  }
  // Reviews are signed by the other six. A reviewer you have not met yet signs
  // with their card number instead, which is somehow even more in character.
  const BY_SHORT = {};
  ORDER.forEach((k) => { BY_SHORT[short(k).toLowerCase()] = k; });
  function peersHTML(peers) {
    return (peers || []).map((p) => {
      const who = BY_SHORT[String(p[1] == null ? '' : p[1]).trim().toLowerCase()];
      const sig = (who && !isMet(who)) ? 'No. ' + num(who) : esc(p[1]);
      return '<span class="dex-peer"><q>' + esc(p[0]) + '</q><span>— ' + sig + '</span></span>';
    }).join('');
  }

  /* Nudges for a card nobody has met. Every one of them is true of all seven,
     which is the point: warm, useless, and gives away precisely nothing. */
  const HINTS = [
    'It is out there tonight, somewhere on the route you are already taking. Eyes low, voices lower.',
    'The tram goes right past it. Blink, and the two of you will spend ten happy minutes disagreeing about what that was.',
    'Wide awake, and getting considerably more out of a Saturday night than most of Singapore.',
    'Bring patience. This one has plenty and is not lending you any of it.',
    'Look for the shape first. The name can wait until you are standing in front of it.',
    'It is on the park map. It is not on the park map anywhere obvious.',
    'Two eyes will find you before you find them. That absolutely still counts.',
  ];
  const hint = (k) => HINTS[(idx(k) - 1) % HINTS.length];

  function questHTML(k) {
    const game = games[k] || (games[k] = quests.create(k));
    return '<article class="idcard dex-file dex-quest is-bonus">'
      + '<div class="idhead"><div class="dex-hno">No. ' + num(k) + '</div>'
      + '<h2 class="idname" id="dex-title" tabindex="-1">Who’s that animal?</h2>'
      + badgesHTML(k) + '<p class="dex-tagline">A little shadow. A new friend.</p></div>'
      + '<div class="idbody"><div class="dex-bigpic dex-shadowpic">' + shade(k) + '</div>'
      + '<details class="dex-outline"><summary>Describe the shadow</summary><p>' + esc(quests.outline(k)) + '</p></details>'
      + '<form class="dex-guess" data-bonus-guess><label for="bonus-answer">Your guess</label>'
      + '<p id="guess-help">Common names count. No timer, no lost guesses.</p>'
      + '<input id="bonus-answer" name="answer" type="text" maxlength="80" autocomplete="off"'
      + ' spellcheck="false" aria-describedby="guess-help guess-message" value="' + esc(game.answer) + '">'
      + '<button class="btn mint" type="submit">Is it you?</button>'
      + '<p id="guess-message" class="dex-guess-message">' + esc(game.message) + '</p></form>'
      + '<div id="bonus-clues">' + cluesHTML(game) + '</div>'
      + '<button class="dex-mini dex-clue-button" type="button" data-bonus-hint'
      + (game.hints === 3 ? ' disabled' : '') + '>' + clueLabel(game) + '</button>'
      + '<p class="dex-locknote">Guess together if you like. Your discovery is saved on this device.</p>'
      + '</div></article>';
  }

  function keepsakesHTML() {
    if (!keepsakes) return '';
    if (!collectionComplete()) return '<section class="dex-keepsakes dex-keepsakes-locked">'
      + '<span aria-hidden="true">🎁</span><h2>A little something at the end</h2>'
      + '<p>Collect all ' + N + ' animal cards to unwrap three pictures of the whole gang: playing, sharing a meal, and exploring together.</p>'
      + '<p class="dex-keepsake-note">' + (N - metCount()) + ' cards to go. The unidentified card can wait for another night.</p></section>';
    return '<section class="dex-keepsakes" aria-labelledby="keepsakes-title" id="keepsakes">'
      + '<span class="tag mint">The whole gang, together</span>'
      + '<h2 id="keepsakes-title" tabindex="-1">A little night worth keeping</h2>'
      + '<p>You found everyone. Here are three pictures to take home—one for each way of spending a lovely little evening.</p>'
      + '<div class="dex-keepsake-grid">' + keepsakes.ITEMS.map(item =>
        '<article class="dex-keepsake"><a href="' + esc(item.file) + '" target="_blank" rel="noopener noreferrer" aria-label="View ' + esc(item.title) + ' at full size">'
        + '<img src="' + esc(item.file) + '" alt="All thirteen animal friends ' + (item.key === 'play' ? 'playing together in a moonlit clearing' : item.key === 'meal' ? 'sharing a moonlit picnic' : 'exploring the wildlife park together at night')
        + '" loading="lazy" width="1448" height="1086"></a><h3>' + esc(item.title) + '</h3><p>' + esc(item.description) + '</p>'
        + '<div class="dex-keepsake-actions"><button class="btn mint" type="button" data-save-keepsake="' + esc(item.key) + '">Save / share PNG</button>'
        + '<a href="' + esc(item.file) + '" target="_blank" rel="noopener noreferrer">View full size ↗</a></div></article>').join('')
      + '</div><p class="dex-keepsake-note">Full-size PNGs are prepared on your device. On a phone, choose Save Image from the share sheet if offered. You can also open a picture and save it directly.</p>'
      + '<p id="keepsake-status" class="dex-keepsake-note" role="status" aria-live="polite"></p></section>';
  }

  function showKeepsakes() {
    if (!collectionComplete()) return;
    history.replaceState(null, '', location.pathname + location.search + '#keepsakes');
    render({ force: true, quiet: true });
  }

  async function saveKeepsake(key, button) {
    if (!collectionComplete() || !keepsakes || !keepsakes.ITEMS.some(item => item.key === key) || button.disabled) return;
    const original = button.textContent;
    const status = document.getElementById('keepsake-status');
    const tell = message => { if (status) status.textContent = message; say(message); };
    button.disabled = true;
    button.textContent = 'Preparing your picture…';
    button.setAttribute('aria-busy', 'true');
    try {
      const result = await keepsakes.save(key);
      tell(result === 'cancelled' ? 'No rush. Your pictures are still here.' : result === 'shared'
        ? 'Your picture was handed to the share sheet.' : 'Your PNG download has started. A little night to keep.');
    } catch (_) {
      tell('That save did not work this time. Try “View full size”, then save the picture from there.');
    } finally {
      button.disabled = false;
      button.textContent = original;
      button.removeAttribute('aria-busy');
    }
  }
  const clueLabel = game => game.hints === 3 ? 'All three clues are here' :
    (game.hints ? 'One more little clue' : 'A little clue, please');
  const cluesHTML = game => quests.clues(game).map((clue, i) =>
    '<p class="dex-clue"><b>Clue ' + (i + 1) + '</b> ' + esc(clue) + '</p>').join('');

  function submitGuess(form) {
    if (!isBonus(shown) || isMet(shown)) return;
    const game = games[shown];
    const input = form.querySelector('[name="answer"]');
    if (!game || !input) return;
    if (!quests.guess(game, input.value)) {
      const message = document.getElementById('guess-message');
      if (message) message.textContent = game.message;
      say(game.message);
      input.focus({ preventScroll: true });
      return;
    }
    earned.push(shown);
    try { localStorage.setItem(BONUS_KEY, JSON.stringify(earned)); bonusSaved = true; }
    catch (_) { bonusSaved = false; }
    justMet = shown;
    history.replaceState(null, '', '#' + token(shown));
    render({ force: true, quiet: true, keepPosition: true });
    paintProgress();
    say('You found me! ' + A[shown].name + ' joined your collection.'
      + (collectionComplete() ? ' Your three group pictures are ready. Choose “See our group pictures” to open them.' : '')
      + (bonusSaved ? '' : ' Your browser could not save it; keep this tab open for this visit.'));
  }

  function showClue(button) {
    if (!isBonus(shown) || isMet(shown)) return;
    const game = games[shown];
    if (!quests.hint(game)) return;
    const clues = document.getElementById('bonus-clues');
    if (clues) clues.innerHTML = cluesHTML(game);
    button.textContent = clueLabel(game);
    button.disabled = game.hints === 3;
    say('Clue ' + game.hints + '. ' + quests.clues(game).at(-1));
  }

  // A card still in shadow: the number, the shape, a nudge, and one button.
  function shadowHTML(k) {
    if (isBonus(k)) return questHTML(k);
    const n = num(k);
    return '<article class="idcard dex-file dex-shadowfile">'
      + '<div class="idhead">'
      + '<div class="dex-hno">No. ' + n + '</div>'
      + '<h2 class="idname" id="dex-title" tabindex="-1"><span aria-hidden="true">???</span>'
      + '<span class="sr-only">Card ' + n + ', not met yet</span></h2>'
      + '<p class="dex-tagline">Somebody you have not been introduced to</p>'
      + '</div>'
      + '<div class="idbody">'
      + '<div class="dex-bigpic dex-shadowpic">' + shade(k) + '</div>'
      + '<p class="dex-lockline">Not met yet, so the file stays shut. Honestly, it is nicer this way.</p>'
      + '<div class="idblock"><b>A gentle nudge</b>' + esc(hint(k)) + '</div>'
      + '<button type="button" class="btn mint dex-unlock" data-unlock="' + idx(k) + '">I saw this one!</button>'
      + '<p class="dex-locknote">Press it at the park and the card is yours for keeps. Press it on the sofa and you are only fibbing to a website.</p>'
      + '<div class="idfoot">No. ' + n + ' · quiz cast · not met yet</div>'
      + '</div></article>';
  }

  function navHTML(k) {
    const i = ORDER.indexOf(k);
    const prev = ORDER[(i - 1 + N) % N];
    const next = ORDER[(i + 1) % N];
    // A neighbour still in shadow keeps its name to itself, out loud too.
    const label = (t) => (isMet(t) ? esc(A[t].name) : 'number ' + num(t) + (isBonus(t) ? ', trail bonus to discover' : ', not met yet'));
    const face = (t) => (isMet(t) ? esc(short(t)) : '???');
    return '<nav class="dex-nav" aria-label="Move through the set">'
      + '<button type="button" class="dex-navbtn" data-jump="' + idx(prev) + '" aria-label="Previous card: ' + label(prev) + '">'
      + '<span class="arw" aria-hidden="true">‹</span><span class="lbl">' + face(prev) + '</span></button>'
      + '<button type="button" class="dex-navbtn" data-jump="' + idx(next) + '" aria-label="Next card: ' + label(next) + '">'
      + '<span class="lbl">' + face(next) + '</span><span class="arw" aria-hidden="true">›</span></button>'
      + '</nav>';
  }

  function detailHTML(k) {
    return '<div class="screen">'
      + '<div class="dex-topbar">'
      + '<button type="button" class="dex-mini" data-back>← All cards</button>'
      + '<span class="dex-of">No. ' + num(k) + ' · ' + (isBonus(k) ? 'Trail bonus' : 'Quiz cast') + '</span>'
      + '</div>'
      + (isMet(k) ? fileHTML(k) : shadowHTML(k))
      + navHTML(k)
      + '<button type="button" class="btn paper" style="margin-top:12px" data-back>Back to all cards</button>'
      + '<p class="dex-hint">Left and right arrows flick through the set. Escape comes back here.</p>'
      + '</div>';
  }

  function fileHTML(k) {
    const an = A[k];
    return '<article class="idcard dex-file' + (isBonus(k) ? ' is-bonus' : '') + '" style="--acc:' + colour(an.color) + '">'
      + '<div class="idhead">'
      + '<div class="dex-hno">No. ' + num(k) + '</div>'
      + '<h2 class="idname" id="dex-title" tabindex="-1">' + esc(an.name) + '</h2>'
      + '<p class="dex-tagline">' + esc(an.tagline) + '</p>'
      + badgesHTML(k)
      + '</div>'
      + '<div class="idbody">'
      + '<div class="dex-bigpic">' + pic(k) + '</div>'
      + (collectionComplete() && keepsakes ? '<div class="dex-reward-invite"><p>You found everyone. A little something is waiting for you.</p>'
        + '<button class="btn mint" type="button" data-show-keepsakes>See our group pictures 🎁</button></div>' : '')
      + '<button type="button" class="dex-cry" data-cry="' + esc(k) + '">'
      + '<span aria-hidden="true">♪</span> Hear the ' + esc(lower(k)) + '</button>'
      + '<p class="dex-crynote">' + esc(callNote(k)) + ' Synthesised on the spot by a browser that has never met one.</p>'

      + (spotted(k) ? '<div class="idblock dex-spotted"><b>Spotted for real ✓</b>You ticked this one on the bingo card, '
        + 'so this is not only a shadow you named. You stood in front of it.</div>' : '')
      + '<div class="idblock"><b>One true thing</b>' + esc(an.fact) + '</div>'
      + '<div class="idblock"><b>Where to find it on Saturday</b>' + esc(an.findme) + '</div>'
      + '<div class="idblock"><b>Strengths</b>' + listHTML(an.strengths) + '</div>'
      + '<div class="idblock"><b>Weakness</b>' + listHTML(an.weakness) + '</div>'
      + '<div class="idblock quotes">' + (an.quotes || []).map(esc).join('<br>') + '</div>'
      + '<div class="idblock"><b>Alignment</b>' + escBr(an.alignment)
      + '<b style="margin-top:10px">Hidden talent</b>' + esc(an.talent) + '</div>'
      + '<div class="idblock"><b>Peer reviews</b>' + peersHTML(an.peers) + '</div>'
      + '<div class="idfoot">No. ' + num(k) + ' · ' + (isBonus(k) ? 'trail bonus earned ✓' + (spotted(k) ? ' · spotted' : '') : 'met ✓') + '</div>'
      + (isBonus(k) ? '<p class="dex-locknote">' + (bonusSaved ? 'Your bonus is saved on this device. Spotting the real animal is a separate little joy.' : 'This browser could not save your bonus. Keep this tab open to keep it for this visit.') + '</p>' : '')
      // Only for the ones unlocked by hand. The other two were never a claim.
      + (isAuto(k) || isBonus(k) ? ''
        : '<p class="dex-undo"><button type="button" class="dex-undolink" data-relock="' + idx(k)
          + '">I was wrong, put this one back</button></p>')
      + '</div></article>';
  }

  function progressHTML() {
    const n = metCount();
    // An unmet pip keeps even its colour to itself.
    const pips = ORDER.map((k) => (isMet(k)
      ? '<i class="met" style="--acc:' + colour(A[k].color) + '"></i>'
      : '<i></i>')).join('');
    const his = esc(lower(HIS_KEY));
    const him = esc(HIM);
    const her = esc(HER);
    let who;
    if (!HER_KEY) {
      who = him + ' is the ' + his + ', and ' + her + '’s animal turns up the moment the quiz has had its say. ';
    } else if (HER_KEY === HIS_KEY) {
      who = her + ' and ' + him + ' are both the ' + his + ', which we are choosing to read as a good sign. ';
    } else {
      who = her + ' is the ' + esc(lower(HER_KEY)) + ' and ' + him + ' is the ' + his + '. ';
    }
    const originals = CORE_ORDER.filter(isMet).length;
    const bonuses = BONUS_ORDER.filter(isMet).length;
    const line = '<b>' + n + ' of ' + N + '</b> cards collected. ' + originals + ' quiz friends · ' + bonuses + ' trail bonuses. '
      + who + (n === N ? 'The whole collection. A lovely little record of your curiosity.'
        : 'Meet the quiz cast at the park — ticking a wildlife square on the bingo card counts — and play the lilac bonus cards whenever you like.');
    return '<span class="dex-pips" aria-hidden="true">' + pips + '</span><p>' + line + '</p>';
  }
  function paintProgress() { if (progressBox) progressBox.innerHTML = progressHTML(); }

  /* ---------- meeting one, and unmeeting one ---------- */
  let justMet = null;          // the card to sparkle on the next paint

  function unlock(k) {
    if (!CORE_ORDER.includes(k)) return;
    mergeSeen();
    if (isMet(k)) return;
    SEEN.push(k);
    saveSeen();
    justMet = k;
    // Now that it is met, its name can have the URL as well.
    history.replaceState(null, '', '#' + token(k));
    render({ force: true, quiet: true });
    paintProgress();
    say('Met! ' + A[k].name + ', card ' + num(k) + '. The file is open.'
      + (collectionComplete() ? ' Your three group pictures are ready. Choose “See our group pictures” to open them.' : ''));
  }

  function relock(k) {
    if (!CORE_ORDER.includes(k)) return;
    mergeSeen();
    const i = SEEN.indexOf(k);
    if (i < 0) return;                    // the automatic two are not up for debate
    SEEN.splice(i, 1);
    saveSeen();
    history.replaceState(null, '', '#' + token(k));
    render({ force: true, quiet: true });
    paintProgress();
    say('Put back. Card ' + num(k) + ' is a shadow again, no harm done.');
  }

  /* ============================================================
     Routing: the hash is the whole state.
     ============================================================ */
  let shown = null;         // null before the first paint, '' for the grid, else an id
  let shownHash = null;     // distinguish the gallery anchor from the ordinary grid
  let last = ORDER[0];      // the card to return focus to
  let pushed = false;       // did we push the current detail entry ourselves?

  // A met animal gets its name in the hash, as #otter always has. One still in
  // shadow travels as #no003, so the address bar keeps the secret too.
  const token = (k) => (isMet(k) ? k : 'no' + num(k));

  function hashId() {
    let h = '';
    try { h = decodeURIComponent(String(location.hash || '').replace(/^#/, '')); } catch (e) { h = ''; }
    if (Object.prototype.hasOwnProperty.call(A, h) && ORDER.indexOf(h) >= 0) return h;
    const m = /^no0*(\d{1,3})$/.exec(h);
    return m ? byIdx(m[1]) : '';
  }

  function render(opt) {
    const force = !!(opt && opt.force);
    const quiet = !!(opt && opt.quiet);
    const id = hashId();
    if (id === shown && location.hash === shownHash && !force) return;
    const first = shown === null;
    shown = id;
    shownHash = location.hash;

    if (id) {
      last = id;
      view.innerHTML = detailHTML(id);
      if (justMet === id) {
        justMet = null;
        const file = view.querySelector('.dex-file');
        if (file) {
          file.classList.add('is-revealing');
          setTimeout(() => file.classList.remove('is-revealing'), 1300);
        }
      }
      if (!first) {
        const title = document.getElementById('dex-title');
        if (title) title.focus({ preventScroll: true });
        if (!(opt && opt.keepPosition)) window.scrollTo(0, 0);
        if (!quiet) {
          say(isMet(id)
            ? A[id].name + ', card ' + num(id) + '.'
            : 'Card ' + num(id) + (isBonus(id) ? '. Guess the silhouette to discover it.' : '. Not met yet.'));
        }
      }
    } else {
      view.innerHTML = gridHTML();
      pushed = false;
      if (location.hash === '#keepsakes' && collectionComplete()) {
        const title = document.getElementById('keepsakes-title');
        if (title) { title.focus({ preventScroll: true }); title.scrollIntoView({ block: 'start' }); }
        say('Everyone is here. Your three group pictures are ready to save.');
        return;
      }
      if (!first) {
        const card = view.querySelector('.dex-card[data-idx="' + idx(last) + '"]');
        if (card) card.focus({ preventScroll: true });
        if (!quiet) say('Back to the animal collection.');
      }
    }
  }

  function open(id) {
    if (!A[id]) return;
    history.pushState(null, '', '#' + token(id));
    pushed = true;
    render();
  }
  function jump(id) {
    if (!A[id]) return;
    // Flicking through replaces the entry, so Back always returns to the grid
    // rather than walking backwards through every animal.
    history.replaceState(null, '', '#' + token(id));
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
    if (e.target.closest('[data-show-keepsakes]')) { showKeepsakes(); return; }
    const save = e.target.closest('[data-save-keepsake]');
    if (save) { saveKeepsake(save.getAttribute('data-save-keepsake'), save); return; }
    const clue = e.target.closest('[data-bonus-hint]');
    if (clue) { showClue(clue); return; }
    const cry = e.target.closest('[data-cry]');
    if (cry) { playCry(cry.getAttribute('data-cry'), cry); return; }
    const met = e.target.closest('[data-unlock]');
    if (met) { unlock(byIdx(met.getAttribute('data-unlock'))); return; }
    const oops = e.target.closest('[data-relock]');
    if (oops) { relock(byIdx(oops.getAttribute('data-relock'))); return; }
    const card = e.target.closest('[data-idx]');
    if (card) { open(byIdx(card.getAttribute('data-idx'))); return; }
    const jumper = e.target.closest('[data-jump]');
    if (jumper) { jump(byIdx(jumper.getAttribute('data-jump'))); return; }
    const locked = e.target.closest('[data-locked]');
    if (locked) { nudgeLocked(locked); return; }
    if (e.target.closest('[data-back]')) toGrid();
  });

  view.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-bonus-guess]');
    if (!form) return;
    e.preventDefault();
    submitGuess(form);
  });

  document.addEventListener('keydown', (e) => {
    if (!shown) return;                                   // the grid needs no shortcuts
    if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    if (e.key === 'Escape') { e.preventDefault(); toGrid(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });

  window.addEventListener('hashchange', () => render());
  window.addEventListener('popstate', () => render());

  paintProgress();
  render();
})();
