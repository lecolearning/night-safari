/* Night Safari Bingo — each phone keeps its own card in localStorage. */

const NAMES = ['XJ', 'YA'];

const ITEMS = [
  ['🦔', 'Spot a pangolin'],
  ['👂', "Hear an animal you can't see"],
  ['👀', 'Glowing eyes in the dark'],
  ['🦦', 'Otters being chaotic'],
  ['🐯', 'See the Malayan tiger'],
  ['🐘', 'Elephant spotted'],
  ['😈', 'Tasmanian devil (yes, really)'],
  ['🐿️', 'Flying squirrel mid-glide'],
  ['🚋', 'Tram guide makes a pun'],
  ['🌑', "Someone says 'it's so dark'"],
  ['🧒', 'A kid asks a better question than the adults'],
  ['📸', 'Take a blurry animal photo'],
  ['🖼️', 'Take an actually good photo'],
  ['🦟', 'Survive a mosquito ambush'],
  ['🍿', 'Binturong (bonus: smell popcorn)'],
  ['🎯', 'Find your own spirit animal'],
  ['🔎', "Find the other person's spirit animal"],
  ['😂', 'Make the other person laugh at a bad animal pun'],
  ['🧠', 'Learn a fact neither of us knew'],
  ['🤝', 'Agree on a favourite animal'],
  ['🐒', 'Slow loris being slow'],
  ['🐈‍⬛', 'Fishing cat near water'],
  ['🐺', 'Striped hyena spotted'],
  ['🦡', 'Malayan tapir spotted'],
  ['🐆', 'Leopard cat, not a leopard'],
  ['🦇', 'A bat flies a bit too close'],
  ['🍢', 'Snack acquired'],
];

const $ = (s) => document.querySelector(s);
const app = $('#app');
const KEY = 'ns_bingo_v1';

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } }
function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

function newCard(who) {
  const pool = ITEMS.slice().sort(() => Math.random() - 0.5).slice(0, 24);
  pool.splice(12, 0, ['🎉', 'Showed up. Already winning.']);
  return { who, cells: pool, on: pool.map((_, i) => i === 12), celebrated: [] };
}

const LINES = (() => {
  const L = [];
  for (let r = 0; r < 5; r++) L.push([0, 1, 2, 3, 4].map((c) => r * 5 + c));
  for (let c = 0; c < 5; c++) L.push([0, 1, 2, 3, 4].map((r) => r * 5 + c));
  L.push([0, 6, 12, 18, 24]); L.push([4, 8, 12, 16, 20]);
  return L;
})();

let state = load();

function pickWho() {
  app.innerHTML = `<div class="screen">
    <div class="card tilt-l">
      <span class="tape"></span>
      <span class="tag">Night Safari Bingo</span>
      <h1>Whose card is this?</h1>
      <p>Everyone gets their own card on their own phone. Compare at the exit. Loser buys dessert and writes the peer review.</p>
      <div class="who-pick">${NAMES.map((n) => `<button class="btn" onclick="start('${n}')">${n}</button>`).join('')}</div>
    </div>
  </div>`;
}

function start(who) { state = newCard(who); save(state); render(); }

function render() {
  const wins = LINES.filter((l) => l.every((i) => state.on[i]));
  const winCells = new Set(wins.flat());
  const count = state.on.filter(Boolean).length - 1;
  app.innerHTML = `<div class="screen">
    <div class="card tilt-l">
      <span class="tape"></span>
      <div class="center">
        <span class="tag">${state.who}'s card</span>
        <h2 style="margin:0">Night Safari Bingo 🐾</h2>
        <p class="small muted" style="margin:6px 0 0">Tap a square when it happens. Five in a row is a bingo. Honour system, mostly.</p>
      </div>
      <div class="grid">${state.cells.map((c, i) =>
        `<button class="cell ${state.on[i] ? 'on' : ''} ${i === 12 ? 'free' : ''} ${winCells.has(i) ? 'win' : ''}" onclick="toggle(${i})">
          <span class="ce">${c[0]}</span><span>${c[1]}</span></button>`).join('')}
      </div>
      <div class="score">
        <span>${count} / 24 spotted</span>
        <span>${wins.length ? '🏆 ' + wins.length + ' bingo' + (wins.length > 1 ? 's' : '') : 'no bingo yet'}</span>
      </div>
    </div>
    <div class="stack" style="margin-top:18px">
      <button class="btn paper" onclick="reset()">New card / switch player</button>
    </div>
  </div>`;
}

function toggle(i) {
  if (i === 12) return;
  state.on[i] = !state.on[i];
  const before = state.celebrated.length;
  LINES.forEach((l, k) => {
    if (l.every((j) => state.on[j]) && !state.celebrated.includes(k)) state.celebrated.push(k);
  });
  save(state);
  render();
  if (state.celebrated.length > before) celebrate();
}

function reset() {
  if (confirm('Start a fresh card? The current one will be cleared.')) { localStorage.removeItem(KEY); state = null; pickWho(); }
}

function celebrate() {
  const b = document.createElement('div');
  b.className = 'bingo-banner'; b.innerHTML = '<span>BINGO!</span>';
  document.body.appendChild(b); setTimeout(() => b.remove(), 2100);
  const colors = ['#ffcf5c', '#ff8fab', '#9ff0cf', '#c9bcff', '#ffb88a', '#ffffff'];
  for (let i = 0; i < 90; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colors[i % colors.length];
    c.style.setProperty('--t', (1.8 + Math.random() * 1.6) + 's');
    c.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
    c.style.setProperty('--rot', (Math.random() * 900 - 450) + 'deg');
    c.style.animationDelay = Math.random() * .6 + 's';
    document.body.appendChild(c); setTimeout(() => c.remove(), 4000);
  }
  if (navigator.vibrate) navigator.vibrate([60, 40, 120]);
}

const _who = new URLSearchParams(location.search).get('who');
if (_who) start(_who); else if (state && state.cells) render(); else pickWho();
