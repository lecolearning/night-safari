/* ============================================================
   Night Safari Adventure — story + logic
   Edit CONFIG, ANIMALS and STORY freely. Everything else renders.
   ============================================================ */

const CONFIG = {
  her: 'XJ',
  me: 'YA',
  myAnimal: 'pangolin',     // YA's result. Change it if you take the quiz and get something else.
  herVeg: 'onion',
  myVeg: 'carrot',
};

// Each animal mirrors the Veggie ID card: strengths, weakness, quotes, alignment, hidden talent, peer reviews.
const ANIMALS = {
  otter: {
    name: 'Asian Small-clawed Otter', color: '#e9a35c',
    tagline: 'Smallest otter in the world, loudest otter in the room',
    strengths: ['Makes friends in under four seconds', 'Holds hands while floating so nobody drifts away', 'Genuinely excited about snacks, every single time'],
    weakness: ['Volume control is theoretical', 'Cannot pass a body of water without commentary', 'Will befriend the tram guide and forget the tram'],
    quotes: ['"Wait wait wait, look at THAT"', '"Okay but are we getting dessert though"'],
    alignment: 'Lawful 30%, Neutral 20%, Chaotic 50%<br>Good 100%, Neutral 0%, Evil 0%',
    talent: 'Can turn any queue into a friend group',
    peers: [['Otter once cheered so loudly for me that I forgot to be shy.', 'Pangolin'], ['Splashed me. Said sorry. Splashed me again.', 'Fishing Cat']],
    compat: [98, "You pull me out of my shell, I hold the hand so nobody floats away. The jungle's most balanced duo."],
  },
  dhole: {
    name: 'Dhole (Asian Wild Dog)', color: '#e88a4c',
    tagline: 'The golden retriever of the jungle. This is peer-reviewed.',
    strengths: ["Greets everyone like they've been gone for years", 'Whistles instead of barking, which is just charming', 'Loyal to a level that concerns biologists'],
    weakness: ['Has never once said no to a plan', 'Runs toward things before knowing what they are', "Thinks 'we should all hang out' is a full sentence"],
    quotes: ['"This is going to be SO fun" (it was)', '"I\'m not lost, I\'m exploring with confidence"'],
    alignment: 'Lawful 60%, Neutral 25%, Chaotic 15%<br>Good 100%, Neutral 0%, Evil 0%',
    talent: "Remembers the name of every dog they've ever met. Owners, less so.",
    peers: [['Dhole ran across the whole park to bring me a snack I mentioned once. Once.', 'Slow Loris'], ['Whistled at me for ten minutes. I think it was a compliment.', 'Tiger']],
    compat: [97, "The jungle's friendliest meets the jungle's most armoured. You say hi to everyone, I make sure we find the exit."],
  },
  loris: {
    name: 'Sunda Slow Loris', color: '#c9ad83',
    tagline: 'Big eyes, zero rush, secretly venomous (only if provoked)',
    strengths: ['Notices everything, mentions it later', 'Calm in a way that calms other people', 'Arrives late and somehow exactly on time'],
    weakness: ["'Five more minutes' is a lifestyle", 'Freezes when a decision is required', 'Cannot be hurried. Has been tested.'],
    quotes: ['"I\'m coming, I\'m coming" (was not coming)', '"Wait, did you see that? No? Too late."'],
    alignment: 'Lawful 55%, Neutral 40%, Chaotic 5%<br>Good 100%, Neutral 0%, Evil 0%',
    talent: 'Finds the one comfortable spot in any room within a minute',
    peers: [['Loris listened to me talk for an hour and remembered all of it.', 'Otter'], ['I watched them consider a leaf for four minutes. Respect.', 'Binturong']],
    compat: [96, 'Two nocturnal softies who take their time. The safari will take us four hours. Worth it.'],
  },
  pangolin: {
    name: 'Sunda Pangolin', color: '#d9b26a',
    tagline: 'Armoured outside, complete softie inside (also: not a hedgehog)',
    strengths: ['Quietly the most caring one in the room', 'Unbothered by drama, is wearing armour', 'Will absolutely show up if you need them'],
    weakness: ['Curls into a ball when a group photo is suggested', 'Takes a while to open up, then never stops', 'Has researched the tram timings, will not admit it'],
    quotes: ['"I\'m fine" (is thinking about it)', '"Oh, I actually read about this..."'],
    alignment: 'Lawful 75%, Neutral 20%, Chaotic 5%<br>Good 100%, Neutral 0%, Evil 0%',
    talent: 'Remembers the small thing you said three weeks ago',
    peers: [["Pangolin doesn't say much but somehow always has a plaster when I need one.", 'Dhole'], ['Rolled into a ball when I complimented them. Adorable. Concerning.', 'Otter']],
    compat: [99, 'Two balls of armour and feelings. Statistically rare, scientifically adorable.'],
  },
  fishingcat: {
    name: 'Fishing Cat', color: '#a9b39a',
    tagline: 'The cat that read the rules about water and said no',
    strengths: ['Independent, a little mysterious, unexpectedly good at things', "Patient right up until it's time to pounce", 'Cool under pressure, warm under everything else'],
    weakness: ["'I'll just do it myself' about literally everything", 'Has strong opinions about the correct snack', 'Will leave a conversation to look at something shiny'],
    quotes: ['"I didn\'t plan it, it just worked out" (planned it)', '"Hm. Interesting." (very interested)'],
    alignment: 'Lawful 40%, Neutral 45%, Chaotic 15%<br>Good 100%, Neutral 0%, Evil 0%',
    talent: 'Finds the best food stall within 200 metres of anywhere',
    peers: [['Fishing Cat pretended not to care about my birthday, then organised the whole thing.', 'Slow Loris'], ['Caught a fish in front of me. Made eye contact. Ate it.', 'Otter']],
    compat: [95, 'You go after what you want, I think about it and then come along. Somehow it works every time.'],
  },
  tiger: {
    name: 'Malayan Tiger', color: '#f0973a',
    tagline: 'Main character energy, respectfully',
    strengths: ['Walks in, room rearranges itself', 'Fiercely protective of their people', "Warm once you're in, and you'll know when you're in"],
    weakness: ['Sleeps sixteen hours a day if unsupervised', 'Has The Look. Uses it.', 'Struggles to pretend to enjoy a bad plan'],
    quotes: ['"I\'m not competitive" (is very competitive)', '"Okay, fine, that\'s actually cute"'],
    alignment: 'Lawful 50%, Neutral 20%, Chaotic 30%<br>Good 100%, Neutral 0%, Evil 0%',
    talent: 'Photographs well from every angle, including asleep',
    peers: [["Tiger scared off someone who cut the queue for me. Didn't say anything. Just looked.", 'Pangolin'], ['Napped through my entire story. Woke up. Asked good follow-up questions.', 'Dhole']],
    compat: [97, 'Main character meets the loyal one with surprisingly good armour. Every good story has this pairing.'],
  },
  binturong: {
    name: 'Binturong (Bearcat)', color: '#a898a0',
    tagline: 'Smells like buttered popcorn. This is real science.',
    strengths: ['Impossible to dislike, nobody can explain why', 'Chill to a degree that lowers nearby heart rates', 'Prehensile tail, which is honestly showing off'],
    weakness: ['Has fallen asleep mid-sentence, twice', 'Slightly odd in ways that turn out to be endearing', "Cannot pass a snack without a 'small taste'"],
    quotes: ['"Wait, does anyone else smell popcorn?"', '"I\'m awake" (was not awake)'],
    alignment: 'Lawful 35%, Neutral 55%, Chaotic 10%<br>Good 100%, Neutral 0%, Evil 0%',
    talent: 'Can nap in any position, on any surface, at any brightness',
    peers: [['Binturong hugged me once and I smelled like a cinema for a week. Ten out of ten.', 'Otter'], ['Slowest walker in the park. Every walk with them is a good one.', 'Slow Loris']],
    compat: [96, 'The popcorn one and the one who curls up next to it. Movie night: solved.'],
  },
};

// The story. Each beat has a scene, text, and choices. Choices either score animals (array) or set a plan key (object).
const STORY = [
  {
    scene: 'gate',
    text: "It's Saturday, 5pm. You and your Night Safari friends are meeting at the entrance. Otter is early, Dhole is vibrating, Pangolin has printed the map. You are:",
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
    text: 'Last question. VeggieVille records confirm you are an onion. Carrot would like to know: which layer are we meeting on Saturday?',
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
      <div class="byline">Conducted by ${CONFIG.me}, certified carrot, on behalf of ${CONFIG.her}.</div>
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

  const planItems = [
    ['🍽️', picks.food || 'Food: to be decided on the tram.'],
    ['🚋', picks.route || 'Route: wherever the animals are.'],
    ['🌶️', picks.spice || 'Spice: negotiable.'],
  ];
  window._shareText =
    `🌙 Night Safari Adventure\n${CONFIG.her} is a ${A.name}!\n` +
    `Compatibility with a ${M.name}: ${pct}%\n` +
    `Plan: ${planItems.map((p) => p[1]).join(' · ')}\n` +
    `Mission: find both animals. Loser buys dessert. 🐾`;

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
        <div class="idfoot">${A.tagline}</div>
      </div>
    </div>

    <div class="card peach tilt-r">
      <span class="tag lilac">Compatibility report</span>
      <div class="duo">
        <div class="who"><span class="em">${ART.portrait(key)}</span><div class="nm">${CONFIG.her}</div><div class="an">${A.name}<br>(formerly ${CONFIG.herVeg})</div></div>
        <div class="heart">💛</div>
        <div class="who"><span class="em">${ART.portrait(CONFIG.myAnimal)}</span><div class="nm">${CONFIG.me}</div><div class="an">${M.name}<br>(formerly ${CONFIG.myVeg})</div></div>
      </div>
      <div class="meter"><b id="meter"></b></div>
      <div class="pct pixel" id="pct">0%</div>
      <p style="margin-top:10px">${line}</p>
      <p class="small muted">Also: onion and carrot are the base of every good soup. That is just science.</p>
    </div>

    <div class="card tilt-l">
      <span class="tag mint">Saturday field plan</span>
      <ul class="plan">${planItems.map((p) => `<li><span class="t">${p[0]}</span><span>${p[1]}</span></li>`).join('')}</ul>
      <div class="mission">
        <b>Mission briefing 🐾</b>
        Find a real ${A.name.toLowerCase()} and a real ${M.name.toLowerCase()} at the Night Safari.
        First to spot their own animal gets dessert bought by the other. Bingo card provided for the walk.
      </div>
    </div>

    <div class="stack" style="margin-top:22px">
      <button class="btn coral" onclick="share()">Send my results to ${CONFIG.me}</button>
      <button class="btn mint" onclick="location.href='bingo.html'">Open the Night Safari bingo card</button>
      <button class="btn paper" onclick="location.reload()">Play again (animals are known to change their minds)</button>
    </div>
  `);

  setTimeout(() => {
    $('#meter').style.width = pct + '%';
    const el = $('#pct'); let n = 0;
    const tick = setInterval(() => { n += 2; if (n >= pct) { n = pct; clearInterval(tick); } el.textContent = n + '%'; }, 28);
  }, 400);
}

async function share() {
  const text = window._shareText;
  try { if (navigator.share) { await navigator.share({ text }); return; } } catch (e) { /* cancelled */ }
  try { await navigator.clipboard.writeText(text); toast('Copied! Paste it to ' + CONFIG.me + ' 🐾'); }
  catch (e) { prompt('Copy this:', text); }
}

// dev shortcuts: ?step=N jumps into the story, ?result=otter shows a result card
const _q = new URLSearchParams(location.search);
if (_q.get('result') && ANIMALS[_q.get('result')]) { scores[_q.get('result')] = 9; picks.food = STORY[8].choices[0][1]; picks.route = STORY[9].choices[1][1]; picks.spice = STORY[10].choices[1][1]; result(); }
else if (_q.get('step')) { step = +_q.get('step'); ask(); }
else intro();
