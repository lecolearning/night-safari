/* ============================================================
   Night Safari Adventure — story + logic
   Edit CONFIG, ANIMALS and STORY freely. Everything else renders.
   ============================================================ */

// Names come from config.js. Flip NAMES_ON there to switch them on or off.
const CONFIG = {
  her: PEOPLE.her,
  me: PEOPLE.me,
  myAnimal: 'fishingcat',     // his result. Change it if he takes the quiz and gets something else.
  herVeg: PEOPLE.herVeg,
  myVeg: PEOPLE.meVeg,
};


// The story. Each beat has a scene, text, and choices. Choices either score animals (array) or set a plan key (object).
const STORY = [
  {
    scene: 'gate',
    text: "It's Saturday evening and the gates have just opened. You and your Night Safari friends are meeting at the entrance. Otter is early, Dhole is vibrating, Pangolin has printed the map. You are:",
    choices: [
      ["Ready since 4, already sent 'omw!!' with three exclamation marks", ['dhole']],
      ['Doing one final outfit review. Again.', ['tiger']],
      ["Texting 'five more minutes' for the third time", ['loris']],
      ['Quietly checking the tram schedule and the weather', ['pangolin']],
    ],
  },
  {
    scene: 'snacks',
    text: 'Dhole is organising snacks for the walk (Binturong has already fallen asleep next to the popcorn). What are you bringing?',
    choices: [
      ['Popcorn. Obviously.', ['binturong']],
      ['Anything shareable, sharing is the whole point', ['otter']],
      ['One very specific thing from one very specific stall', ['fishingcat']],
      ["Forgot snacks. Will charm some off whoever's nearby.", ['dhole']],
    ],
  },
  {
    scene: 'tram',
    text: 'The tram guide asks everyone to introduce themselves. Before you can speak, your friends jump in and describe you as:',
    choices: [
      ['The glue of the group chat', ['dhole']],
      ["The one who remembers everyone's birthday", ['otter', 'pangolin']],
      ["Chill until it's time to not be chill", ['tiger']],
      ['Mysteriously good at random things', ['fishingcat']],
    ],
  },
  {
    scene: 'dog',
    text: "A golden retriever (someone's extremely good boy) trots up at the tram stop. There are no wrong answers here. This is a dog question. You:",
    choices: [
      ['Drop everything. Nothing else matters now.', ['otter']],
      ["Ask the dog's name before the owner's name", ['dhole']],
      ['Already on the floor', ['dhole', 'otter']],
      ['Calm exterior. Screaming interior.', ['pangolin', 'loris']],
    ],
  },
  {
    scene: 'dark',
    text: 'On the walking trail the lights dip and everything goes properly dark. A friendly firefly offers you one superpower for the night:',
    choices: [
      ['Night vision. I want to see everything.', ['fishingcat']],
      ['Glow softly so I can always be found', ['loris']],
      ['Roll into an impenetrable ball at will', ['pangolin']],
      ['Smell like buttered popcorn (this is a real animal)', ['binturong']],
    ],
  },
  {
    scene: 'show',
    text: "Front row at the Creatures of the Night show. Right as the star performer appears, someone's phone rings at full volume. You:",
    choices: [
      ["Laugh. We've all been there.", ['otter']],
      ['Politely, telepathically judge', ['fishingcat']],
      ['The Look. Just the Look.', ['tiger']],
      ["Didn't notice. Was looking at the animal.", ['loris']],
    ],
  },
  {
    scene: 'sunday',
    text: 'On the tram home, Tiger asks what everyone is doing tomorrow to recover. You say:',
    choices: [
      ['Brunch with six people and two spontaneous add-ons', ['dhole', 'otter']],
      ['Solo pottering, nice coffee, zero notifications', ['loris', 'pangolin']],
      ["Something I've never tried before", ['fishingcat', 'tiger']],
      ['Nap. Snack. Nap.', ['binturong']],
    ],
  },
  {
    scene: 'onion',
    text: 'Back to onion business for a second. Carrot would like to know: which layer are we meeting on Saturday?',
    choices: [
      ['Outer layer: polite, charming, slightly crispy', ['fishingcat', 'tiger']],
      ['Middle layer: chatty, warm, makes friends with the tram guide', ['dhole', 'otter']],
      ['Inner layer: soft, sweet, reserved for people who did the work', ['pangolin', 'loris']],
      ['The layer that makes people cry (from laughing)', ['binturong', 'tiger']],
    ],
  },
  // ---- practical section (shapes the Saturday plan) ----
  {
    scene: 'food', practical: true, key: 'food',
    text: 'Quick logistics before the animals decide. Fuel strategy for Saturday?',
    choices: [
      ['Dinner first. I do not do safaris hungry.', 'Dinner first, then animals. A hungry explorer is a grumpy explorer.'],
      ['Animals first, supper after. Tell me about the pangolin over prata.', 'Animals first, supper after. Prata debrief mandatory.'],
      ['Snack now, snack later, snacks always.', 'Rolling snack policy. Snack now, snack later, snacks always.'],
    ],
  },
  {
    scene: 'route', practical: true, key: 'route',
    text: 'First move once we are inside?',
    choices: [
      ['Tram first, see everything, then walk back to the favourites', 'Tram first for the overview, then walk back to the favourites.'],
      ['Walking trails first, tram as the victory lap', 'Walking trails first, tram as the victory lap.'],
      ['Creatures of the Night show first, then decide', 'Catch the Creatures of the Night show first, decide the rest after.'],
    ],
  },
  {
    scene: 'spice', practical: true, key: 'spice',
    text: 'Spice tolerance, strictly for supper planning purposes:',
    choices: [
      ['Tiger level. Bring the chilli padi.', 'Spice: tiger level. Chilli padi on the table.'],
      ['Otter level. Mild but enthusiastic.', 'Spice: otter level. Mild but enthusiastic.'],
      ['Pangolin level. I will curl up.', 'Spice: pangolin level. Nothing that requires curling up.'],
    ],
  },
];

/* ---------------- rendering ---------------- */
const $ = (s) => document.querySelector(s);
const app = $('#app');
const scores = {};
const picks = {};
let step = 0;

function swap(html) {
  const cur = app.querySelector('.screen');
  const go = () => { app.innerHTML = `<div class="screen">${html}</div>`; window.scrollTo({ top: 0, behavior: 'smooth' }); };
  if (cur) { cur.classList.add('leaving'); setTimeout(go, 240); } else go();
}

function progress() {
  return '<div class="progress">' + STORY.map((b, i) => `<i class="${i < step ? 'done' : ''} ${b.practical ? 'practical' : ''}"></i>`).join('') + '</div>';
}

function intro() {
  swap(`
    <div class="card story tilt-l">
      <div class="scenebox">${ART.scene('intro')}</div>
      <span class="tag">Official follow-up study</span>
      <h1 class="pixel">Night Safari Adventure</h1>
      <p>You have been peer-reviewed as an <b>onion</b>. Respectable. Extroverted, loyal, gets back up no matter the fall.</p>
      <p>Unfortunately the Night Safari does not admit vegetables. A second opinion is required, and the animals have agreed to help.</p>
      <p class="small muted">One evening, eleven choices, one animal. Results are final and scientifically binding.</p>
      <div class="byline">${PEOPLE.byline}</div>
      <p class="small muted" style="padding:0 4px">For the record, carrots are root vegetables. I am rooting for Saturday.</p>
    </div>
    <div class="stack" style="margin-top:22px"><button class="btn" onclick="ask()">Start</button></div>
  `);
}

function ask() {
  if (step >= STORY.length) return drumroll();
  const b = STORY[step];
  swap(progress() + `
    <div class="card story ${b.practical ? 'peach' : ''} ${step % 2 ? 'tilt-r' : 'tilt-l'}">
      <div class="scenebox">${ART.scene(b.scene)}</div>
      ${b.practical ? '<span class="tag mint">Practical section</span>' : ''}
      <p class="storytext">${b.text}</p>
      <div class="opts">${b.choices.map((c, i) =>
        `<button class="opt" style="--i:${i}" onclick="pick(this,${i})">${c[0]}</button>`).join('')}
      </div>
    </div>`);
}

function pick(el, i) {
  if (el.parentElement.dataset.locked) return;
  el.parentElement.dataset.locked = '1';
  el.classList.add('picked');
  const b = STORY[step];
  if (b.practical) picks[b.key] = b.choices[i][1];
  else b.choices[i][1].forEach((a) => { scores[a] = (scores[a] || 0) + 1; });
  step++;
  setTimeout(ask, 420);
}

function winner() {
  const order = ['dhole', 'otter', 'loris', 'pangolin', 'fishingcat', 'tiger', 'binturong'];
  let best = order[0];
  order.forEach((a) => { if ((scores[a] || 0) > (scores[best] || 0)) best = a; });
  return best;
}

function drumroll() {
  swap(`<div class="card story tilt-l">
      <div class="scenebox">${ART.scene('drum')}</div>
      <p class="storytext center">The animals are conferring...</p>
      <p class="small muted center">Pangolin is double-checking the maths.</p>
    </div>`);
  setTimeout(result, 2300);
}

function result() {
  const key = winner();
  const A = ANIMALS[key];
  const M = ANIMALS[CONFIG.myAnimal];
  const [pct, line] = A.compat;
  try { localStorage.setItem('ns_result', key); } catch (e) { /* private mode */ }

  const planItems = [
    ['🍽️', picks.food || 'Food: to be decided on the tram.'],
    ['🚋', picks.route || 'Route: wherever the animals are.'],
    ['🌶️', picks.spice || 'Spice: negotiable.'],
  ];
  window._shareText =
    `🌙 Night Safari Adventure\n${PEOPLE.subjectIs(A.name)}!\n` +
    `Compatibility with a ${M.name}: ${pct}%\n` +
    `Plan: ${planItems.map((p) => p[1]).join(' · ')}\n` +
    `Mission: find both animals. Whoever finds theirs first gets dessert bought by the other. 🐾`;

  swap(`
    <div class="idcard tilt-l" style="--acc:${A.color}">
      <div class="idhead"><div class="pixel idtitle">Safari ID</div><div class="idname">${A.name}</div></div>
      <div class="idbody">
        <div class="idtop">
          <div class="idpic">${ART.portrait(key)}</div>
          <div class="idblock">
            <b>Strengths:</b>${A.strengths.map((s) => `<div>-${s}</div>`).join('')}
            <b style="margin-top:10px;display:block">Weakness:</b>${A.weakness.map((s) => `<div>-${s}</div>`).join('')}
          </div>
        </div>
        <div class="idblock quotes">${A.quotes.join('<br>')}</div>
        <div class="idblock"><b>Alignment:</b> ${A.alignment}<br><b>Hidden Talent:</b> ${A.talent}</div>
        <div class="idblock"><b>Peer reviews:</b>${A.peers.map((p) => `<div>“${p[0]}” - ${p[1]}</div>`).join('')}</div>
        <div class="idblock"><b>One true thing:</b>${A.fact}</div>
        <div class="idblock"><b>Where to find me on Saturday:</b>${A.findme}</div>
        <div class="idfoot">${A.tagline}</div>
      </div>
    </div>

    <div class="card peach tilt-r">
      <span class="tag lilac">Compatibility report</span>
      <div class="duo">
        <div class="who"><span class="em">${ART.portrait(key)}</span><div class="nm">${CONFIG.her}</div><div class="an">${A.name}${PEOPLE.formerly(CONFIG.herVeg)}</div></div>
        <div class="heart">💛</div>
        <div class="who"><span class="em">${ART.portrait(CONFIG.myAnimal)}</span><div class="nm">${CONFIG.me}</div><div class="an">${M.name}${PEOPLE.formerly(CONFIG.myVeg)}</div></div>
      </div>
      <div class="meter"><b id="meter"></b></div>
      <div class="pct pixel" id="pct">0%</div>
      <p style="margin-top:10px">${line}</p>
      <p class="small muted">Also: onion and carrot are the base of every good soup. That is just science.</p>
      <p class="small muted">Onions are famous for making people cry. Something tells me this one will not.</p>
    </div>

    <div class="card tilt-l">
      <span class="tag mint">Saturday field plan</span>
      <ul class="plan">${planItems.map((p) => `<li><span class="t">${p[0]}</span><span>${p[1]}</span></li>`).join('')}</ul>
      <div class="mission">
        <b>Mission briefing 🐾</b>
        Find a real ${A.name.toLowerCase()} and a real ${M.name.toLowerCase()} at the Night Safari.
        ${A.findme === M.findme ? `Handily, both live on the ${A.findme.toLowerCase()}.` : `Yours: ${A.findme.toLowerCase()}. Mine: ${M.findme.toLowerCase()}.`}
        Help each other spot both. Whoever's animal turns up first gets dessert bought by the other.
      </div>
    </div>

    <button class="sealed" id="sealed" onclick="openCase()">
      <span class="seal">✉</span>
      <b>CASE 002</b>
      <span class="sealnote">Sealed until after Saturday</span>
      <span class="sealsmall">Do not open this. You are going to open this.</span>
    </button>

    <div class="stack" style="margin-top:22px">
      <button class="btn coral" onclick="share()">${PEOPLE.sendResults}</button>
      <button class="btn mint" onclick="location.href='bingo.html'">Open the Night Safari bingo card</button>
      <button class="btn lilac" onclick="location.href='pokedex.html'">Open the animal field guide</button>
      <button class="btn paper" onclick="location.href='plan.html'">Before you go: the practical bits</button>
      <button class="btn paper" onclick="location.reload()">Play again (animals are known to change their minds)</button>
    </div>
  `);

  setTimeout(() => {
    $('#meter').style.width = pct + '%';
    const el = $('#pct'); let n = 0;
    const tick = setInterval(() => { n += 2; if (n >= pct) { n = pct; clearInterval(tick); } el.textContent = n + '%'; }, 28);
  }, 400);
}

const SEAL_WARNINGS = [
  ['That is a sealed case file.', 'Sealed means sealed. Please respect the process.'],
  ['Still sealed.', 'I want you to know that sealing this took real effort.'],
  ['You are extremely persistent.', 'Noted in your file, by the way. Under strengths.'],
  ['Fine.', 'Opening under protest.'],
];

function openCase() {
  const el = document.getElementById('sealed');
  if (!el || el.dataset.open) return;
  const taps = (+el.dataset.taps || 0) + 1;
  el.dataset.taps = taps;

  el.classList.remove('rattle');
  void el.offsetWidth;
  el.classList.add('rattle');

  if (taps <= SEAL_WARNINGS.length) {
    const [head, sub] = SEAL_WARNINGS[taps - 1];
    const note = el.querySelector('.sealnote');
    const small = el.querySelector('.sealsmall');
    if (note) note.textContent = head;
    if (small) small.textContent = sub;
    if (navigator.vibrate) navigator.vibrate(taps < SEAL_WARNINGS.length ? 30 : [40, 40, 90]);
    return;
  }

  el.dataset.open = '1';
  setTimeout(() => {
    el.classList.remove('rattle');
    el.classList.add('opened');
    el.innerHTML = `
      <span class="tag lilac">Partially declassified</span>
      <p>Still sealed. But here is the part I am allowed to tell you.</p>
      <p>There is one creature on the Night Safari list that we are not going to find on Saturday.
      Not for lack of looking. It only ever turns up for people who come back a second time.</p>
      <p class="sealsmall">Case 002 opens after the safari.</p>`;
  }, 620);
}

async function share() {
  const text = window._shareText;
  try { if (navigator.share) { await navigator.share({ text }); return; } } catch (e) { /* cancelled */ }
  try { await navigator.clipboard.writeText(text); toast(PEOPLE.copied); }
  catch (e) { prompt('Copy this:', text); }
}

// dev shortcuts: ?step=N jumps into the story, ?result=otter shows a result card
const _q = new URLSearchParams(location.search);
if (QUIZ_ANIMAL_KEYS.includes(_q.get('result'))) { scores[_q.get('result')] = 9; picks.food = STORY[8].choices[0][1]; picks.route = STORY[9].choices[1][1]; picks.spice = STORY[10].choices[1][1]; result(); }
else if (_q.get('step')) { step = +_q.get('step'); ask(); }
else intro();
