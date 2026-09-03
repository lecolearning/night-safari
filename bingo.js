/* A pocket-sized collection of little moments. Everything stays on this phone. */
const NAMES = ['XJ', 'YA'];
const SIZE = 4;                          // four across, four down
const CELLS = SIZE * SIZE;               // sixteen squares
const FREE_INDEX = 5;                    // row 2, column 2 — sits on the ↘ diagonal
const MOMENTS = CELLS - 1;               // fifteen to fill; the middle is already yours
const WILDLIFE_PER_CARD = 10;
const TOGETHER_PER_CARD = MOMENTS - WILDLIFE_PER_CARD;
const LABEL_MAX = 32;                    // keeps every label on a narrow phone without ugly breaks
const KEY = 'ns_bingo_v3';
const OLD_KEYS = ['ns_bingo_v2', 'ns_bingo_v1']; // 5×5 saves; left untouched, never read into a 4×4 board
const PHOTO_KEY = 'ns_bingo_photos_v1';  // photos live apart, so a full album can never spoil a card
const PHOTO_MAX_EDGE = 640;
const PHOTO_QUALITY = 0.7;
const PHOTO_MAX_CHARS = 700000;
const PHOTO_PATTERN = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/;
const ART_KEYS = ['otter', 'dhole', 'loris', 'pangolin', 'fishingcat', 'tiger', 'binturong'];
const FREE_CELL = { icon: '💛', label: 'Here with you', kind: 'free' };

// Night Safari residents and the small sensory things you actually look for in the dark.
const WILDLIFE = [
  ['🦦', 'Asian small-clawed otter', 'otter'],
  ['🐯', 'A Malayan tiger, prowling', 'tiger'],
  ['🦔', 'Sunda pangolin in armour', 'pangolin'],
  ['🐒', 'A slow loris, wide eyes', 'loris'],
  ['🐈', 'A fishing cat, paws wet', 'fishingcat'],
  ['🍿', 'A binturong (like popcorn)', 'binturong'],
  ['🐕', 'A dhole, the whistling dog', 'dhole'],
  ['🐖', 'A Malayan tapir, two-tone'],
  ['🐘', 'An Asian elephant, gentle'],
  ['🐺', 'A striped hyena, head down'],
  ['🐿️', 'A flying squirrel, gliding'],
  ['🐆', 'A leopard cat, small spots'],
  ['🦇', 'A fruit bat, wings folded'],
  ['🦏', 'A one-horned rhino, calm'],
  ['🦁', 'A lion with a proper mane'],
  ['🦌', 'A sambar deer, big ears'],
  ['🐗', 'A babirusa and its tusks'],
  ['🌵', 'A porcupine, quills out'],
  ['🦘', 'A wallaby, mid-hop'],
  ['🫓', 'A capybara, deeply calm'],
  ['🌴', 'A palm civet on the move'],
  ['🐍', 'A snake, perfectly still'],
  ['👀', 'Glowing eyes in the dark'],
  ['👂', 'Heard, but never seen'],
  ['💤', 'An animal fast asleep'],
  ['🌿', 'Something hiding in leaves'],
  ['🥬', 'An animal mid-snack'],
  ['🐾', 'Tiny paws on a branch'],
  ['🌀', 'A tail longer than its body'],
  ['🥱', 'Someone caught mid-yawn'],
  ['🫂', 'Two animals sitting close'],
  ['🌙', 'An animal watching us back'],
  ['🍃', 'A rustle with no animal'],
  ['🏔️', 'Something bigger than us'],
].map(([icon, label, art]) => ({ icon, label, art, kind: 'wildlife' }));

const TOGETHER = [
  ['🍢', 'Share a snack, half each'],
  ['😂', 'A truly terrible pun'],
  ['🧠', 'Learn one new animal fact'],
  ['🤝', 'Both pick a favourite'],
  ['🚋', 'Ride the tram together'],
  ['🌑', 'Someone says “so dark!”'],
  ['📸', 'One very blurry photo'],
  ['🖼️', 'A photo worth keeping'],
  ['💧', 'A water break, side by side'],
  ['🪑', 'Find a bench, sit a while'],
  ['✨', 'A wow at the same moment'],
  ['🗺️', 'Pick the next trail together'],
  ['🔎', 'Spot one thing at once'],
  ['💭', 'Ask a curious question'],
  ['🍨', 'Plan dessert out loud'],
  ['🧣', 'Someone gets a bit cold'],
  ['🗣️', 'Whisper so nothing startles'],
  ['🥾', 'Agree we walked far enough'],
  ['😊', 'Catch each other smiling'],
  ['🎧', 'Hear the same night sound'],
].map(([icon, label]) => ({ icon, label, kind: 'together' }));

// Four rows, four columns, both diagonals: ten lines.
const LINES = (() => {
  const span = [...Array(SIZE).keys()];
  const lines = span.map(r => span.map(c => r * SIZE + c));
  span.forEach(c => lines.push(span.map(r => r * SIZE + c)));
  lines.push(span.map(i => i * SIZE + i));
  lines.push(span.map(i => i * SIZE + (SIZE - 1 - i)));
  return lines;
})();

const app = document.querySelector('#app');
const announcement = document.querySelector('#bingo-announcement');
let storageOK = true;
let view = 'board';        // 'board' | 'summary'
let lightbox = null;       // index of the photo shown large
let notice = null;         // one gentle, temporary message

function shuffle(items) {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function newCard(who) {
  const cells = shuffle([
    ...shuffle(WILDLIFE).slice(0, WILDLIFE_PER_CARD),
    ...shuffle(TOGETHER).slice(0, TOGETHER_PER_CARD),
  ]);
  cells.splice(FREE_INDEX, 0, { ...FREE_CELL });
  return { who, cells, on: cells.map((_, i) => i === FREE_INDEX), celebrated: [] };
}

function validCard(value, who) {
  if (!value || value.who !== who || !Array.isArray(value.cells) || value.cells.length !== CELLS ||
      !Array.isArray(value.on) || value.on.length !== CELLS || value.on.some(on => typeof on !== 'boolean')) return null;
  const cells = value.cells.map(cell => {
    if (!cell || typeof cell.icon !== 'string' || cell.icon.length > 16 ||
        typeof cell.label !== 'string' || !cell.label.trim() || cell.label.length > LABEL_MAX) return null;
    return { icon: cell.icon, label: cell.label,
      art: ART_KEYS.includes(cell.art) ? cell.art : undefined,
      kind: ['wildlife', 'together', 'free'].includes(cell.kind) ? cell.kind : 'together' };
  });
  if (cells.some(cell => !cell)) return null;
  cells[FREE_INDEX] = { ...FREE_CELL };
  const on = value.on.slice();
  on[FREE_INDEX] = true;
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
  const result = { version: 3, active: null, cards: {} };
  if (saved && saved.version === 3 && saved.cards && typeof saved.cards === 'object') {
    for (const who of NAMES) {
      const card = validCard(saved.cards[who], who);
      if (card) result.cards[who] = card;
    }
    if (NAMES.includes(saved.active) && result.cards[saved.active]) result.active = saved.active;
  }
  return result;
}

/* ---------- the little album ---------- */
function validPhoto(value) {
  return typeof value === 'string' && value.length <= PHOTO_MAX_CHARS && PHOTO_PATTERN.test(value);
}
function isQuotaError(error) {
  if (!error) return false;
  return error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    error.code === 22 || error.code === 1014;
}
function loadAlbum() {
  const saved = readJSON(PHOTO_KEY);
  const photos = {};
  for (const who of NAMES) photos[who] = {};
  if (saved && saved.version === 1 && saved.photos && typeof saved.photos === 'object') {
    for (const who of NAMES) {
      const kept = saved.photos[who];
      if (!kept || typeof kept !== 'object') continue;
      for (let i = 0; i < CELLS; i++) if (validPhoto(kept[i])) photos[who][i] = kept[i];
    }
  }
  return { version: 1, photos };
}
function saveAlbum() {
  try { localStorage.setItem(PHOTO_KEY, JSON.stringify(album)); return { ok: true }; }
  catch (error) { return { ok: false, reason: isQuotaError(error) ? 'full' : 'blocked' }; }
}
function photoOf(who, index) {
  return NAMES.includes(who) && album.photos[who] ? album.photos[who][index] : undefined;
}
function photoCount(who) {
  return NAMES.includes(who) ? Object.keys(album.photos[who] || {}).length : 0;
}
// Writes the album, and puts it straight back if the phone says no. The board is never touched.
function setPhoto(who, index, dataURL) {
  if (!NAMES.includes(who) || !Number.isInteger(index) || index < 0 || index >= CELLS) return { ok: false, reason: 'bad' };
  if (!validPhoto(dataURL)) return { ok: false, reason: 'bad' };
  const previous = album.photos[who][index];
  album.photos[who][index] = dataURL;
  const result = saveAlbum();
  if (!result.ok) {
    if (previous === undefined) delete album.photos[who][index];
    else album.photos[who][index] = previous;
  }
  return result;
}
function removePhoto(who, index) {
  if (!NAMES.includes(who) || !Number.isInteger(index) || index < 0 || index >= CELLS) return { ok: false, reason: 'bad' };
  if (album.photos[who][index] === undefined) return { ok: true };
  delete album.photos[who][index];       // removing frees room, so we keep it even if the write fails
  return saveAlbum();
}
function clearPhotos(who) {
  if (!NAMES.includes(who)) return { ok: false, reason: 'bad' };
  album.photos[who] = {};
  return saveAlbum();
}
function fitSize(width, height, max = PHOTO_MAX_EDGE) {
  const longest = Math.max(width, height);
  if (!Number.isFinite(longest) || longest <= 0) return { width: 0, height: 0 };
  const scale = Math.min(1, max / longest);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
// Shrink to 640px on the long edge and re-encode as a modest JPEG; localStorage is a small pocket.
function downscale(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type || '')) { reject(Error('not an image')); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(Error('unreadable'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(Error('undecodable'));
      image.onload = () => {
        const { width, height } = fitSize(image.naturalWidth || image.width, image.naturalHeight || image.height);
        if (!width || !height) { reject(Error('empty')); return; }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        let out;
        try {
          canvas.getContext('2d').drawImage(image, 0, 0, width, height);
          out = canvas.toDataURL('image/jpeg', PHOTO_QUALITY);
        } catch (_) { reject(Error('encode')); return; }
        if (validPhoto(out)) resolve(out); else reject(Error('too big'));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

let book = loadBook();
let album = loadAlbum();
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
      <img src="img/scene_intro.webp" alt="" width="1100" height="825" data-fallback></div>
    <span class="tag">A side quest for two</span>
    <h1>Little moments,<br>together.</h1>
    <p>A few furry faces. A few terrible puns. A pocket-sized collection of our night.</p>
    <p class="bingo-promise">Winner picks dessert. We share it.</p>
    <h2 class="bingo-picker-title">Whose bingo card?</h2>
    <div class="who-pick">${NAMES.map(who => `<button class="btn ${who === 'YA' ? 'mint' : 'coral'}" data-player="${who}">${who}<small>${book.cards[who] ? 'Continue my card' : 'That’s me'}</small></button>`).join('')}</div>
    <p class="bingo-smallprint">Each phone saves its own cards and photos. Nothing is uploaded anywhere.</p>
  </div></div>`;
}
function start(who, focus = false) {
  if (!NAMES.includes(who)) return;
  const resuming = Boolean(book.cards[who]);
  state = book.cards[who] || newCard(who);
  book.cards[who] = state;
  book.active = who;
  view = 'board';
  lightbox = null;
  notice = null;
  save();
  render();
  if (focus) {
    app.querySelector('#bingo-heading').focus({ preventScroll: true });
    announce(`${who}'s card ${resuming ? 'resumed' : 'ready'}. ${state.on.filter(Boolean).length - 1} of ${MOMENTS} moments marked.`);
  }
}
function getProgress(card) {
  const wins = LINES.filter(line => line.every(i => card.on[i]));
  const remaining = Math.min(...LINES.map(line => line.filter(i => !card.on[i]).length));
  return { wins, remaining, count: card.on.filter(Boolean).length - 1 };
}
function warmLine(count, photos) {
  if (count >= MOMENTS) return 'A whole card. Every square is a bit of tonight.';
  if (count >= 10) return 'A night with plenty in it. Look at all that.';
  if (count >= 5) return 'A good handful of moments, safely kept.';
  if (count >= 1) return 'Even one little moment is worth keeping.';
  return photos ? 'No squares ticked, and still a photo to keep.' : 'Nothing ticked, and the night still counted.';
}

function cellHTML(cell, i, winCells) {
  const photo = photoOf(state.who, i);
  const free = i === FREE_INDEX;
  const label = escapeHTML(cell.label);
  const position = `Row ${Math.floor(i / SIZE) + 1}, column ${i % SIZE + 1}`;
  return `<div class="cell-wrap">
    <button type="button" class="cell ${state.on[i] ? 'on' : ''} ${free ? 'free' : ''} ${winCells.has(i) ? 'win' : ''} ${photo ? 'has-photo' : ''}"
      data-cell="${i}" data-kind="${cell.kind}" aria-pressed="${state.on[i]}" ${free ? 'aria-disabled="true"' : ''}
      aria-label="${label}${free ? '. Free square, always marked' : ''}${photo ? '. Has a photo' : ''}. ${position}">
      ${photo ? `<img class="cell-photo" src="${escapeHTML(photo)}" alt="" aria-hidden="true">` : ''}
      <span class="cell-check" aria-hidden="true">${state.on[i] ? '✓' : ''}</span>
      <span class="bingo-icon" aria-hidden="true"><span>${escapeHTML(cell.icon)}</span>${cell.art ? `<img src="img/${cell.art}.webp" alt="" width="40" height="40" loading="lazy" data-fallback>` : ''}</span>
      <span class="cell-label">${label}</span>${free ? '<span class="cell-free-label" aria-hidden="true">FREE</span>' : ''}
    </button>
    ${photo
      ? `<button type="button" class="cell-photo-btn has-photo" data-view-photo="${i}" aria-label="Open the photo for ${label}"><img src="${escapeHTML(photo)}" alt="" aria-hidden="true"></button>`
      : `<button type="button" class="cell-photo-btn" data-photo="${i}" aria-label="Add a photo to ${label}"><span aria-hidden="true">📷</span></button>`}
  </div>`;
}

function lightboxHTML() {
  const photo = photoOf(state.who, lightbox);
  if (!photo) return '';
  const label = escapeHTML(state.cells[lightbox].label);
  return `<div class="photo-lightbox" role="dialog" aria-modal="true" aria-label="Photo for ${label}">
    <div class="photo-lightbox-inner">
      <img src="${escapeHTML(photo)}" alt="Your photo for ${label}">
      <p class="photo-lightbox-caption">${label}</p>
      <div class="photo-lightbox-actions">
        <button type="button" class="photo-close" data-action="close-photo">Close</button>
        <button type="button" class="photo-remove" data-action="remove-photo">Remove this photo</button>
      </div>
      <p class="photo-lightbox-note">Stays on this phone. Nothing is uploaded.</p>
    </div>
  </div>`;
}

function summaryHTML() {
  const { count, wins } = getProgress(state);
  const photos = photoCount(state.who);
  const marked = state.cells.map((cell, i) => ({ cell, i })).filter(({ i }) => state.on[i] && i !== FREE_INDEX);
  return `<div class="bingo-board">
    <header class="bingo-page-head"><span class="bingo-eyebrow">The end of the evening</span>
      <h1 id="bingo-heading" tabindex="-1">${state.who}’s little collection</h1>
      <p>However full the card, we were both there.</p></header>
    <div class="card bingo-card bingo-summary">
      <span class="tape" aria-hidden="true"></span>
      <div class="summary-figures">
        <div class="summary-figure"><strong>${count}</strong><span>of ${MOMENTS} squares marked</span></div>
        <div class="summary-figure"><strong>${photos}</strong><span>${photos === 1 ? 'photo kept' : 'photos kept'}</span></div>
        <div class="summary-figure"><strong>${wins.length}</strong><span>${wins.length === 1 ? 'line finished' : 'lines finished'}</span></div>
      </div>
      <p class="summary-warm">${warmLine(count, photos)}</p>
      ${marked.length ? `<ul class="summary-list">${marked.map(({ cell, i }) =>
        `<li><span aria-hidden="true">${escapeHTML(cell.icon)}</span>${escapeHTML(cell.label)}${photoOf(state.who, i) ? ' <span class="summary-photo-tag">with a photo</span>' : ''}</li>`).join('')}</ul>`
        : '<p class="summary-empty">Nothing marked yet — there is still a whole night in front of you.</p>'}
      <p class="summary-supper"><span aria-hidden="true">🍨</span> Favourite animal? Funniest moment? One tiny thing to remember?</p>
    </div>
    <div class="bingo-aftercare">
      <button class="bingo-reset" data-action="board">← Back to the card</button>
    </div>
  </div>`;
}

function boardHTML() {
  const { wins, remaining, count } = getProgress(state);
  const winCells = new Set(wins.flat());
  const photos = photoCount(state.who);
  const note = count === MOMENTS ? 'A whole card of memories. The best bit was doing it together.' :
    wins.length ? 'A little victory! Dessert is still a team sport.' :
    remaining === 1 ? 'One little moment away from your first bingo.' :
    'No rush to fill the card. The lovely part is being here.';
  return `<div class="bingo-board">
    <header class="bingo-page-head"><span class="bingo-eyebrow">Our Night Safari side quest</span>
      <h1 id="bingo-heading" tabindex="-1">Little moments bingo</h1>
      <p>Winner picks dessert. We share it.</p></header>
    <div class="card bingo-card">
      <span class="tape" aria-hidden="true"></span>
      <div class="bingo-card-top"><h2>${state.who}’s little collection</h2>
        <div class="bingo-players" role="group" aria-label="Switch player; both cards are kept">${NAMES.map(who =>
          `<button type="button" data-player="${who}" aria-pressed="${who === state.who}" aria-label="${who}’s card">${who}</button>`).join('')}</div></div>
      <p id="bingo-help" class="bingo-instructions">Tap a square to mark it; tap again to undo. Four across, down or diagonally makes a bingo. The little 📷 on each square adds a photo.</p>
      <div class="bingo-legend" aria-hidden="true"><span>🌿 Wildlife</span><span>💗 Us being us</span><span>💛 A free square</span></div>
      ${notice ? `<p class="bingo-notice" role="status">${escapeHTML(notice)}</p>` : ''}
      <div class="grid" role="group" aria-label="${state.who}’s ${SIZE} by ${SIZE} bingo card" aria-describedby="bingo-help">${
        state.cells.map((cell, i) => cellHTML(cell, i, winCells)).join('')}</div>
      <div class="score"><span>${count} <span class="muted">/ ${MOMENTS} little moments</span></span><span>${wins.length ? '♡ ' + wins.length + ' bingo' + (wins.length > 1 ? 's' : '') : 'Room for memories'}</span></div>
      <progress class="bingo-progress" max="${MOMENTS}" value="${count}" aria-label="${count} of ${MOMENTS} moments marked"></progress>
      <p class="bingo-note ${wins.length ? 'has-bingo' : ''}">${note}</p>
      <p class="bingo-album-note">${photos ? `${photos} ${photos === 1 ? 'photo' : 'photos'} tucked into this card, kept on this phone only.` : 'No photos yet. Tap a 📷 whenever something is worth keeping.'}</p>
    </div>
    <div class="bingo-aftercare">
      <p class="bingo-save-note ${storageOK ? '' : 'save-warning'}">${storageOK ? 'Saved on this device. Switching players keeps both cards.<br>Cards don’t sync between phones.' : 'This browser can’t save right now. Keep this tab open so your moments aren’t lost.'}</p>
      <button class="bingo-summary-link" data-action="summary">See how our night went →</button>
      <details class="bingo-details"><summary>A tiny field guide</summary>
        <p>Wildlife squares have a mint edge; our little moments have a pink one. The middle is already yours—you showed up together.</p>
        <p>Photos are shrunk and kept on this phone alone. Nothing is uploaded, and nothing is shared unless you show someone.</p>
        <p>Tick what happens naturally. A shy animal or an unfinished card doesn’t make the night any less lovely.</p>
        <p>Keep voices gentle, skip the flash, and follow the park’s signs. We’re guests in their home.</p>
      </details>
      <div class="bingo-supper"><span aria-hidden="true">🍨</span><p><strong>For the dessert debrief</strong><br>Favourite animal? Funniest moment? One tiny thing we want to remember?</p></div>
      <button class="bingo-reset" data-action="reset">Start a fresh ${state.who} card</button>
      <p class="bingo-reset-note">Asks first. Only this player’s card and photos change.</p>
    </div>
    ${lightbox === null ? '' : lightboxHTML()}
  </div>`;
}

function render() {
  app.innerHTML = view === 'summary' ? summaryHTML() : boardHTML();
  if (view === 'board' && lightbox !== null) app.querySelector('.photo-close').focus({ preventScroll: true });
}

function toggle(i) {
  if (!state || !Number.isInteger(i) || i < 0 || i >= CELLS || i === FREE_INDEX) return;
  const wasFull = getProgress(state).count === MOMENTS;
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
  const said = `${state.cells[i].label} ${state.on[i] ? 'marked' : 'unmarked'}. ${count} of ${MOMENTS} moments. ${newBingo ? 'Bingo! A little victory for ' + state.who + '. ' : ''}${wins.length} completed ${wins.length === 1 ? 'line' : 'lines'}.`;
  announce(said);
  if (newBingo) celebrate();
  // A full card gently turns itself into the little end screen.
  if (count === MOMENTS && !wasFull) showSummary(said);
}
function showSummary(lead = '') {
  if (!state) return;
  view = 'summary';
  lightbox = null;
  render();
  app.querySelector('#bingo-heading').focus({ preventScroll: true });
  const { count } = getProgress(state);
  const photos = photoCount(state.who);
  announce(`${lead ? lead + ' ' : ''}How our night went. ${count} of ${MOMENTS} squares marked, ${photos} ${photos === 1 ? 'photo' : 'photos'} kept.`);
}
function showBoard() {
  if (!state) return;
  view = 'board';
  render();
  app.querySelector('#bingo-heading').focus({ preventScroll: true });
}
function reset() {
  if (!state || !confirm(`Start a fresh card for ${state.who}? This clears only ${state.who}’s squares and photos. The other player’s card stays safe.`)) return;
  clearPhotos(state.who);
  book.cards[state.who] = newCard(state.who);
  start(state.who, true);
  announce(`Fresh card ready for ${state.who}. The other player’s card is unchanged.`);
}

/* ---------- photos ---------- */
function pickPhoto(index) {
  if (!state || !Number.isInteger(index) || index < 0 || index >= CELLS) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.className = 'sr-only';
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (file) attachPhoto(index, file);
  });
  input.click();
}
function attachPhoto(index, file) {
  const who = state.who;
  const label = state.cells[index].label;
  const refresh = () => { if (state && state.who === who && view === 'board') render(); };
  return downscale(file).then(dataURL => {
    const result = setPhoto(who, index, dataURL);
    if (result.ok) {
      notice = null;
      refresh();
      const kept = photoCount(who);
      announce(`Photo added to ${label}. ${kept} ${kept === 1 ? 'photo' : 'photos'} in this card.`);
      return;
    }
    notice = result.reason === 'full'
      ? 'Our little album is full. Open a photo you have already kept and remove it to make room for this one.'
      : 'This browser won’t save photos right now, so that one couldn’t be kept.';
    refresh();
    announce(notice);
  }, () => {
    notice = 'That picture didn’t want to come along. Try another one?';
    refresh();
    announce(notice);
  });
}
function openPhoto(index) {
  if (!state || !photoOf(state.who, index)) return;
  view = 'board';
  lightbox = index;
  render();
}
function closePhoto() {
  if (lightbox === null) return;
  const index = lightbox;
  lightbox = null;
  render();
  const button = app.querySelector(`[data-view-photo="${index}"], [data-photo="${index}"]`);
  if (button) button.focus({ preventScroll: true });
}
function dropPhoto() {
  if (lightbox === null || !state) return;
  const index = lightbox;
  const label = state.cells[index].label;
  removePhoto(state.who, index);
  notice = null;
  closePhoto();
  announce(`Photo removed from ${label}. ${photoCount(state.who)} left in this card.`);
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

const ACTIONS = { reset, summary: showSummary, board: showBoard, 'close-photo': closePhoto, 'remove-photo': dropPhoto };
app.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || !app.contains(button)) return;
  if (button.dataset.player) start(button.dataset.player, true);
  else if (button.dataset.cell !== undefined) toggle(Number(button.dataset.cell));
  else if (button.dataset.photo !== undefined) pickPhoto(Number(button.dataset.photo));
  else if (button.dataset.viewPhoto !== undefined) openPhoto(Number(button.dataset.viewPhoto));
  else if (Object.prototype.hasOwnProperty.call(ACTIONS, button.dataset.action)) ACTIONS[button.dataset.action]();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && lightbox !== null) closePhoto();
});
// A failed image reveals its emoji fallback; never retry a broken URL.
app.addEventListener('error', event => {
  if (event.target.matches('img[data-fallback]')) event.target.remove();
}, true);

const requestedPlayer = new URLSearchParams(location.search).get('who');
if (NAMES.includes(requestedPlayer)) start(requestedPlayer);
else if (book.active) start(book.active);
else pickWho();
