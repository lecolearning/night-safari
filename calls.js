/* ============================================================
   Who's that call? — a small listening game for a dark park.

   Every sound is synthesised on the spot by animal-calls.js, so this
   works with no signal and downloads nothing. It only ever names an
   animal this phone has already met: a call from a card still in
   shadow would hand the field guide's surprise straight over.

   No timer, no penalty, no leaderboard. Nothing is saved and nothing
   leaves the phone; a reload starts a fresh round, which is the worst
   thing that can happen here.
   ============================================================ */
(function () {
  const app = document.getElementById('app');
  const live = document.getElementById('calls-live');
  if (!app) return;

  const A = window.ANIMALS || {};
  const CALLS = window.ANIMAL_CALLS || null;
  const COLLECTION = window.COLLECTION || null;
  const SHORT = window.ANIMAL_SHORT || {};
  const OPTIONS = 4;               // one right answer and three near neighbours
  const ROUND = 8;                 // long enough to be a game, short enough to finish

  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
  const short = (k) => SHORT[k] || (A[k] && A[k].name) || k;
  const colour = (c) => (/^#[0-9a-f]{3,8}$/i.test(String(c || '')) ? String(c) : '#ffcf5c');
  const say = (msg) => { if (live) live.textContent = msg; };
  const pic = (k) => (window.ART && window.ART.portrait
    ? window.ART.portrait(k)
    : '<img class="art portrait-img" src="img/' + esc(k) + '.webp" alt="">');

  function shuffle(items) {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /* ---------- who is allowed to be heard ---------- */
  // Met here or on the bingo card, earned by naming a silhouette, and with a call
  // and a portrait to show for it. Everybody else keeps quiet for now.
  function pool() {
    const met = COLLECTION ? COLLECTION.all() : [];
    return met.filter((k) => A[k] && CALLS && CALLS.has(k));
  }

  /* ---------- the state of one little round ---------- */
  let view = 'intro';              // 'intro' | 'asking' | 'answered' | 'over' | 'silent'
  let target = null;               // whose call is sounding
  let options = [];                // the four names on offer
  let chosen = null;               // what they tapped, once they have
  let asked = 0;
  let right = 0;
  let last = null;                 // never the same animal twice running

  function nextQuestion() {
    const friends = pool();
    if (friends.length < OPTIONS) { view = 'intro'; render(); return; }
    const choices = friends.length > 1 ? friends.filter((k) => k !== last) : friends;
    target = choices[Math.floor(Math.random() * choices.length)];
    last = target;
    options = shuffle([target].concat(
      shuffle(friends.filter((k) => k !== target)).slice(0, OPTIONS - 1)));
    chosen = null;
    view = 'asking';
    asked++;
    render();
    playCall(true);
  }

  // The first play of a round follows a tap, so the audio context is always allowed
  // to open. A browser that still refuses says so once, rather than on every question.
  function playCall(first) {
    const how = CALLS ? CALLS.play(target) : 'quiet';
    if (how === 'played') { say('Playing a call.'); return; }
    if (first) { view = 'silent'; render(); return; }
    say('That call would not play. Try it once more?');
  }

  function answer(key) {
    if (view !== 'asking' || !options.includes(key)) return;
    chosen = key;
    if (key === target) right++;
    view = 'answered';
    render();
    const verdict = key === target ? 'Yes, that was the ' + short(target) + '.'
      : 'Not quite. That was the ' + short(target) + '.';
    say(verdict + ' ' + right + ' of ' + asked + ' so far.');
  }

  function finish() {
    view = 'over';
    render();
    say('Round finished. ' + right + ' of ' + asked + ' calls named.');
  }
  function restart() {
    asked = 0;
    right = 0;
    last = null;
    nextQuestion();
  }

  /* ---------- what it says about how you did ---------- */
  function warmLine(score, total) {
    if (!total) return 'No calls yet tonight.';
    if (score === total) return 'Every single one. The animals are slightly unnerved.';
    if (score >= total * 0.75) return 'A very good ear for a Saturday night.';
    if (score >= total * 0.4) return 'A respectable showing. Some of these are genuinely hard.';
    if (score) return 'Ears are difficult. The animals forgive you entirely.';
    return 'Not one. Honestly, that takes a sort of talent.';
  }

  /* ---------- the screens ---------- */
  function introHTML() {
    const friends = pool();
    const count = friends.length;
    if (count >= OPTIONS) {
      return '<div class="screen"><div class="card calls-card">'
        + '<span class="tape" aria-hidden="true"></span>'
        + '<span class="tag">A game for the tram</span>'
        + '<h1 id="calls-heading" tabindex="-1">Who’s that call?</h1>'
        + '<p>A little sound plays. Four names. Pick the one you think made it.</p>'
        + '<p class="calls-quiet-note">No timer and no penalty, so guess freely. Every call is '
        + 'made up on the spot by your phone — an impression, not a recording, and nothing is downloaded.</p>'
        + '<p class="calls-pool">Playing with the <b>' + count + '</b> animals you have met so far. '
        + 'Meet more and they join in.</p>'
        + '<button class="btn mint" type="button" data-go>Start listening ♪</button>'
        + '<p class="calls-headphones">Best with the volume low. We are guests in their home.</p>'
        + '</div>' + footerLinks() + '</div>';
    }
    return '<div class="screen"><div class="card calls-card">'
      + '<span class="tape" aria-hidden="true"></span>'
      + '<span class="tag">Not quite yet</span>'
      + '<h1 id="calls-heading" tabindex="-1">Who’s that call?</h1>'
      + '<p>This one needs <b>four</b> animals you have met. You have <b>' + count + '</b>.</p>'
      + '<p class="calls-quiet-note">Meeting one is easy enough: tick a wildlife square on the bingo card, '
      + 'or name one of the lilac silhouettes in the field guide. Both count, and both keep to this phone.</p>'
      + '<div class="stack">'
      + '<a class="btn mint" href="bingo.html">Open the bingo card</a>'
      + '<a class="btn lilac" href="pokedex.html">Open the field guide</a>'
      + '</div></div>' + footerLinks() + '</div>';
  }

  function silentHTML() {
    return '<div class="screen"><div class="card calls-card">'
      + '<span class="tape" aria-hidden="true"></span>'
      + '<h1 id="calls-heading" tabindex="-1">This browser would rather stay quiet</h1>'
      + '<p>It will not let a page make a sound tonight, so there is nothing to guess at. '
      + 'No harm done, and nothing else on the site minds.</p>'
      + '<p class="calls-quiet-note">Sometimes a silent switch, a locked screen, or a browser being careful. '
      + 'Worth one more try, and otherwise the field guide reads perfectly well in silence.</p>'
      + '<div class="stack">'
      + '<button class="btn mint" type="button" data-go>Try again</button>'
      + '<a class="btn paper" href="pokedex.html">Back to the field guide</a>'
      + '</div></div>' + footerLinks() + '</div>';
  }

  function scoreHTML() {
    return '<p class="calls-score"><span>Call <b>' + asked + '</b> of ' + ROUND + '</span>'
      + '<span>' + right + ' named so far</span></p>';
  }

  function askingHTML() {
    return '<div class="screen"><div class="card calls-card">'
      + '<span class="tape" aria-hidden="true"></span>'
      + scoreHTML()
      + '<h1 id="calls-heading" tabindex="-1" class="calls-question">Who made that sound?</h1>'
      + '<button type="button" class="calls-replay" data-again>'
      + '<span aria-hidden="true">♪</span> Play it again</button>'
      + '<div class="calls-options" role="group" aria-label="Four animals to choose from">'
      + options.map((k) => '<button type="button" class="btn paper calls-option" data-pick="'
        + esc(k) + '">' + esc(short(k)) + '</button>').join('')
      + '</div>'
      + '<button type="button" class="calls-stop" data-stop>Stop here and see how we did</button>'
      + '</div>' + footerLinks() + '</div>';
  }

  function answeredHTML() {
    const got = chosen === target;
    const an = A[target] || {};
    return '<div class="screen"><div class="card calls-card calls-reveal' + (got ? ' is-right' : '') + '"'
      + ' style="--acc:' + colour(an.color) + '">'
      + '<span class="tape" aria-hidden="true"></span>'
      + scoreHTML()
      + '<p class="calls-verdict">' + (got ? 'Yes — that was ' : 'Not quite. That was ')
      + '<b>the ' + esc(short(target)) + '</b>.</p>'
      + (got ? '' : '<p class="calls-yours">You said the ' + esc(short(chosen)) + '.</p>')
      + '<div class="calls-portrait">' + pic(target) + '</div>'
      + '<h2 id="calls-heading" tabindex="-1" class="calls-name">' + esc(an.name || short(target)) + '</h2>'
      + '<p class="calls-note">' + esc(CALLS ? CALLS.note(target) : '') + '</p>'
      + (an.fact ? '<p class="calls-fact"><b>One true thing.</b> ' + esc(an.fact) + '</p>' : '')
      + '<div class="stack">'
      + '<button class="btn mint" type="button" data-again-sound>Hear it once more ♪</button>'
      + (asked >= ROUND
        ? '<button class="btn coral" type="button" data-stop>See how we did →</button>'
        : '<button class="btn coral" type="button" data-go>Next call →</button>')
      + '</div>'
      + '<a class="calls-link" href="pokedex.html#' + esc(target) + '">Open its card in the field guide</a>'
      + '</div>' + footerLinks() + '</div>';
  }

  function overHTML() {
    return '<div class="screen"><div class="card calls-card">'
      + '<span class="tape" aria-hidden="true"></span>'
      + '<span class="tag">How that went</span>'
      + '<h1 id="calls-heading" tabindex="-1">' + right + ' of ' + asked + '</h1>'
      + '<p class="calls-warm">' + esc(warmLine(right, asked)) + '</p>'
      + '<p class="calls-quiet-note">Nothing here was saved, so this is entirely between the two of you '
      + 'and one browser that has never met any of these animals.</p>'
      + '<div class="stack">'
      + '<button class="btn mint" type="button" data-restart>Another round ♪</button>'
      + '<a class="btn lilac" href="pokedex.html">Back to the field guide</a>'
      + '<a class="btn paper" href="bingo.html">Back to the bingo card</a>'
      + '</div></div>' + footerLinks() + '</div>';
  }

  function footerLinks() {
    return '<p class="calls-foot">Calls are cartoon impressions, not recordings. '
      + 'Please keep the real animals in peace.</p>';
  }

  const SCREENS = { intro: introHTML, asking: askingHTML, answered: answeredHTML,
    over: overHTML, silent: silentHTML };

  function render() {
    app.innerHTML = (SCREENS[view] || introHTML)();
    const heading = app.querySelector('#calls-heading');
    if (heading && heading.focus) heading.focus({ preventScroll: true });
  }

  /* ---------- taps ---------- */
  app.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-pick')) { answer(button.getAttribute('data-pick')); return; }
    if (button.hasAttribute('data-go')) { nextQuestion(); return; }
    if (button.hasAttribute('data-again') || button.hasAttribute('data-again-sound')) { playCall(false); return; }
    if (button.hasAttribute('data-stop')) { finish(); return; }
    if (button.hasAttribute('data-restart')) { restart(); return; }
  });
  // A failed portrait leaves a gap rather than a broken-image icon.
  app.addEventListener('error', (event) => {
    if (event.target.matches && event.target.matches('img')) event.target.remove();
  }, true);

  render();
})();
