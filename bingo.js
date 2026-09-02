/* A pocket-sized collection of little moments. Progress stays on this device. */
const NAMES = ['XJ', 'YA'];
const KEY = 'ns_bingo_v2';
const LEGACY_KEY = 'ns_bingo_v1';
const ART_KEYS = ['otter', 'dhole', 'loris', 'pangolin', 'fishingcat', 'tiger', 'binturong'];
const FREE_CELL = { icon: '💛', label: 'Here with you', kind: 'free' };

const WILDLIFE = [
  ['🦔', 'Spot a pangolin', 'pangolin'],
  ['🦦', 'Otter antics', 'otter'],
  ['🐯', 'Tiger stripes', 'tiger'],
  ['🐒', 'A slow loris', 'loris'],
  ['🐈', 'A fishing cat', 'fishingcat'],
  ['🍿', 'A binturong', 'binturong'],
  ['👂', 'A mystery call'],
  ['👀', 'Eyes in the dark'],
  ['🐾', 'Tiny paws'],
  ['💤', 'A sleepy animal'],
  ['🌿', 'Leafy camouflage'],
  ['🦇', 'Something flying'],
  ['👃', 'A twitchy nose'],
  ['🐘', 'Big animal ears'],
  ['🌀', 'A swishy tail'],
  ['🥬', 'An animal snack'],
].map(([icon, label, art]) => ({ icon, label, art, kind: 'wildlife' }));

const TOGETHER = [
  ['🍢', 'Share a snack'],
  ['😂', 'A terrible pun'],
  ['🧠', 'Learn a new fact'],
  ['🤝', 'Pick a favourite'],
  ['🚋', 'Tram ride together'],
  ['🌑', '“It’s so dark!”'],
  ['📸', 'A blurry photo'],
  ['🖼️', 'A keeper photo'],
  ['💧', 'Water break'],
  ['🪑', 'A little sit-down'],
  ['✨', 'A shared “wow”'],
  ['🗺️', 'Choose a trail'],
  ['🔎', 'Spot it together'],
  ['🎯', 'Find your animal'],
  ['💭', 'A curious question'],
  ['🍨', 'Dream of dessert'],
].map(([icon, label]) => ({ icon, label, kind: 'together' }));

const LINES = (() => {
  const lines = [];
  for (let r = 0; r < 5; r++) lines.push([0, 1, 2, 3, 4].map(c => r * 5 + c));
  for (let c = 0; c < 5; c++) lines.push([0, 1, 2, 3, 4].map(r => r * 5 + c));
  return [...lines, [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]];
})();
const app = document.querySelector('#app');
const announcement = document.querySelector('#bingo-announcement');
let storageOK = true;

function shuffle(items) {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function newCard(who) {
  const cells = shuffle([...shuffle(WILDLIFE).slice(0, 12), ...shuffle(TOGETHER).slice(0, 12)]);
  cells.splice(12, 0, { ...FREE_CELL });
  return { who, cells, on: cells.map((_, i) => i === 12), celebrated: [] };
}

// Validate saved cards, including the original array-shaped squares.
function validCard(value, who) {
  if (!value || value.who !== who || !Array.isArray(value.cells) || value.cells.length !== 25 ||
      !Array.isArray(value.on) || value.on.length !== 25 || value.on.some(on => typeof on !== 'boolean')) return null;
  const cells = value.cells.map(cell => {
    if (Array.isArray(cell)) cell = { icon: cell[0], label: cell[1], kind: 'legacy' };
    if (!cell || typeof cell.icon !== 'string' || cell.icon.length > 16 ||
        typeof cell.label !== 'string' || !cell.label.trim() || cell.label.length > 160) return null;
    return { icon: cell.icon, label: cell.label,
      art: ART_KEYS.includes(cell.art) ? cell.art : undefined,
      kind: ['wildlife', 'together', 'free'].includes(cell.kind) ? cell.kind : 'legacy' };
  });
  if (cells.some(cell => !cell)) return null;
  cells[12] = { ...FREE_CELL };
  const on = value.on.slice();
  on[12] = true;
  const celebrated = Array.isArray(value.celebrated) ? [...new Set(value.celebrated.filter(i =>
    Number.isInteger(i) && i >= 0 && i < LINES.length))] : [];
  return { who, cells, on, celebrated };
}
function readJSON(key) {
  let raw;
  try { raw = localStorage.getItem(key); } catch (_) { storageOK = false; return null; }
  try { return JSON.parse(raw); } catch (_) { return null; }
}
function loadBook() {
  const saved = readJSON(KEY);
  const result = { version: 2, active: null, cards: {} };
  if (saved && saved.version === 2 && saved.cards && typeof saved.cards === 'object') {
    for (const who of NAMES) {
      const card = validCard(saved.cards[who], who);
      if (card) result.cards[who] = card;
    }
    if (NAMES.includes(saved.active) && result.cards[saved.active]) result.active = saved.active;
  }
  // Keep the original saved card as a recoverable backup; migration never deletes it.
  const legacy = readJSON(LEGACY_KEY);
  if (legacy && NAMES.includes(legacy.who) && !result.cards[legacy.who]) {
    const card = validCard(legacy, legacy.who);
    if (card) {
      result.cards[legacy.who] = card;
      if (!result.active) result.active = legacy.who;
    }
  }
  return result;
}
let book = loadBook();
let state = null;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(book)); storageOK = true; }
  catch (_) { storageOK = false; }
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function announce(message) { announcement.textContent = message; }

function pickWho() {
  app.innerHTML = `<div class="screen"><div class="card bingo-welcome">
    <span class="tape" aria-hidden="true"></span>
    <div class="bingo-illustration" aria-hidden="true"><span>🌙 🧅 🥕</span>
      <img src="img/scene_intro.png" alt="" width="1448" height="1086" data-fallback></div>
    <span class="tag">A side quest for two</span>
    <h1>Little moments,<br>together.</h1>
    <p>A few furry faces. A few terrible puns. A pocket-sized collection of our night.</p>
    <p class="bingo-promise">Winner picks dessert. We share it.</p>
    <h2 class="bingo-picker-title">Whose bingo card?</h2>
    <div class="who-pick">${NAMES.map(who => `<button class="btn ${who === 'YA' ? 'mint' : 'coral'}" data-player="${who}">${who}<small>${book.cards[who] ? 'Continue my card' : 'That’s me'}</small></button>`).join('')}</div>
    <p class="bingo-smallprint">Each phone saves its own cards. Nothing to sign up for—just show up as you.</p>
  </div></div>`;
}
function start(who, focus = false) {
  if (!NAMES.includes(who)) return;
  const resuming = Boolean(book.cards[who]);
  state = book.cards[who] || newCard(who);
  book.cards[who] = state;
  book.active = who;
  save();
  render();
  if (focus) {
    app.querySelector('#bingo-heading').focus({ preventScroll: true });
    announce(`${who}'s card ${resuming ? 'resumed' : 'ready'}. ${state.on.filter(Boolean).length - 1} of 24 moments marked.`);
  }
}
function getProgress(card) {
  const wins = LINES.filter(line => line.every(i => card.on[i]));
  const remaining = Math.min(...LINES.map(line => line.filter(i => !card.on[i]).length));
  return { wins, remaining, count: card.on.filter(Boolean).length - 1 };
}
function render() {
  const { wins, remaining, count } = getProgress(state);
  const winCells = new Set(wins.flat());
  const note = count === 24 ? 'A whole card of memories. The best bit was doing it together.' :
    wins.length ? 'A little victory! Dessert is still a team sport.' :
    remaining === 1 ? 'One little moment away from your first bingo.' :
    'No rush to fill the card. The lovely part is being here.';
  app.innerHTML = `<div class="bingo-board">
    <header class="bingo-page-head"><span class="bingo-eyebrow">Our Night Safari side quest</span>
      <h1 id="bingo-heading" tabindex="-1">Little moments bingo</h1>
      <p>Winner picks dessert. We share it.</p></header>
    <div class="card bingo-card">
      <span class="tape" aria-hidden="true"></span>
      <div class="bingo-card-top"><h2>${state.who}’s little collection</h2>
        <div class="bingo-players" role="group" aria-label="Switch player; both cards are kept">${NAMES.map(who =>
          `<button type="button" data-player="${who}" aria-pressed="${who === state.who}" aria-label="${who}’s card">${who}</button>`).join('')}</div></div>
      <p id="bingo-help" class="bingo-instructions">Tap to mark; tap again to undo. Five across, down or diagonally makes a bingo.</p>
      <div class="bingo-legend" aria-hidden="true"><span>🌿 Wildlife</span><span>💗 Us being us</span><span>💛 A free middle</span></div>
      <div class="grid" role="group" aria-label="${state.who}’s 5 by 5 bingo card" aria-describedby="bingo-help">${state.cells.map((cell, i) =>
        `<button type="button" class="cell ${state.on[i] ? 'on' : ''} ${i === 12 ? 'free' : ''} ${winCells.has(i) ? 'win' : ''}" data-cell="${i}" data-kind="${cell.kind}"
          aria-pressed="${state.on[i]}" ${i === 12 ? 'aria-disabled="true"' : ''}
          aria-label="${escapeHTML(cell.label)}${i === 12 ? '. Free square, always marked' : ''}. Row ${Math.floor(i / 5) + 1}, column ${i % 5 + 1}">
          <span class="cell-check" aria-hidden="true">${state.on[i] ? '✓' : ''}</span>
          <span class="bingo-icon" aria-hidden="true"><span>${escapeHTML(cell.icon)}</span>${cell.art ? `<img src="img/${cell.art}.png" alt="" width="40" height="40" loading="lazy" data-fallback>` : ''}</span>
          <span class="cell-label">${escapeHTML(cell.label)}</span>${i === 12 ? '<span class="cell-free-label" aria-hidden="true">FREE</span>' : ''}
        </button>`).join('')}</div>
      <div class="score"><span>${count} <span class="muted">/ 24 little moments</span></span><span>${wins.length ? '♡ ' + wins.length + ' bingo' + (wins.length > 1 ? 's' : '') : 'Room for memories'}</span></div>
      <progress class="bingo-progress" max="24" value="${count}" aria-label="${count} of 24 moments marked"></progress>
      <p class="bingo-note ${wins.length ? 'has-bingo' : ''}">${note}</p>
    </div>
    <div class="bingo-aftercare">
      <p class="bingo-save-note ${storageOK ? '' : 'save-warning'}">${storageOK ? 'Saved on this device. Switching players keeps both cards.<br>Cards don’t sync between phones.' : 'This browser can’t save right now. Keep this tab open so your moments aren’t lost.'}</p>
      <details class="bingo-details"><summary>A tiny field guide</summary>
        <p>Wildlife squares have a mint edge; our little moments have a pink one. The middle is already yours—you showed up together.</p>
        <p>Tick what happens naturally. A shy animal or an unfinished card doesn’t make the night any less lovely.</p>
        <p>Keep voices gentle, skip the flash, and follow the park’s signs. We’re guests in their home.</p>
      </details>
      <div class="bingo-supper"><span aria-hidden="true">🍨</span><p><strong>For the dessert debrief</strong><br>Favourite animal? Funniest moment? One tiny thing we want to remember?</p></div>
      <button class="bingo-reset" data-action="reset">Start a fresh ${state.who} card</button>
      <p class="bingo-reset-note">Asks first. Only this player’s card changes.</p>
    </div>
  </div>`;
}
function toggle(i) {
  if (!state || !Number.isInteger(i) || i < 0 || i >= 25 || i === 12) return;
  state.on[i] = !state.on[i];
  const before = state.celebrated.length;
  LINES.forEach((line, k) => {
    if (line.every(j => state.on[j]) && !state.celebrated.includes(k)) state.celebrated.push(k);
  });
  save();
  render();
  const button = app.querySelector(`[data-cell="${i}"]`);
  button.focus({ preventScroll: true });
  if (state.on[i]) button.classList.add('just-marked');
  const { count, wins } = getProgress(state);
  const newBingo = state.celebrated.length > before;
  announce(`${state.cells[i].label} ${state.on[i] ? 'marked' : 'unmarked'}. ${count} of 24 moments. ${newBingo ? 'Bingo! A little victory for ' + state.who + '. ' : ''}${wins.length} completed ${wins.length === 1 ? 'line' : 'lines'}.`);
  if (newBingo) celebrate();
}
function reset() {
  if (!state || !confirm(`Start a fresh card for ${state.who}? This clears only ${state.who}’s current squares. The other player’s card stays safe.`)) return;
  book.cards[state.who] = newCard(state.who);
  start(state.who, true);
  announce(`Fresh card ready for ${state.who}. The other player’s card is unchanged.`);
}
function celebrate() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // One brief, quiet celebration; no sound, vibration, or blocking dialog.
  document.querySelectorAll('.bingo-banner, .confetti').forEach(element => element.remove());
  const banner = document.createElement('div');
  banner.className = 'bingo-banner';
  banner.setAttribute('aria-hidden', 'true');
  banner.innerHTML = '<span>BINGO!</span>';
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 2100);
  const colors = ['#ffcf5c', '#ff8fab', '#9ff0cf', '#c9bcff'];
  for (let i = 0; i < 28; i++) {
    const confetti = document.createElement('i');
    confetti.className = 'confetti';
    confetti.setAttribute('aria-hidden', 'true');
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.background = colors[i % colors.length];
    confetti.style.setProperty('--t', (1.8 + Math.random()) + 's');
    confetti.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
    confetti.style.setProperty('--rot', (Math.random() * 600 - 300) + 'deg');
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
}
app.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || !app.contains(button)) return;
  if (button.dataset.player) start(button.dataset.player, true);
  else if (button.dataset.cell !== undefined) toggle(Number(button.dataset.cell));
  else if (button.dataset.action === 'reset') reset();
});
// A failed PNG reveals its emoji fallback; never retry a broken URL.
app.addEventListener('error', event => {
  if (event.target.matches('img[data-fallback]')) event.target.remove();
}, true);
const requestedPlayer = new URLSearchParams(location.search).get('who');
if (NAMES.includes(requestedPlayer)) start(requestedPlayer);
else if (book.active) start(book.active);
else pickWho();
