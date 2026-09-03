/* A pocket-sized collection of little moments. Everything stays on this phone. */
// Player labels come from config.js when the page provides it, so the one
// NAMES_ON switch there covers the bingo too. The literal pair is the fallback
// for the test harness, which runs this file without config.js.
const NAMES = (typeof PEOPLE !== 'undefined' && Array.isArray(PEOPLE.players) && PEOPLE.players.length === 2)
  ? PEOPLE.players.slice()
  : ['One', 'Two'];
const SIZE = 4;                          // four across, four down
const CELLS = SIZE * SIZE;               // sixteen squares
const FREE_INDEX = 5;                    // row 2, column 2 — sits on the ↘ diagonal
const MOMENTS = CELLS - 1;               // fifteen to fill; the middle is already yours
const WILDLIFE_PER_CARD = 10;
const TOGETHER_PER_CARD = MOMENTS - WILDLIFE_PER_CARD;
const LABEL_MAX = 32;                    // keeps every label on a narrow phone without ugly breaks
const KEY = 'ns_bingo_v3';
const OLD_KEYS = ['ns_bingo_v2', 'ns_bingo_v1']; // 5×5 saves; left untouched, never read into a 4×4 board
const GATE_KEY = 'ns_bingo_unlocked';   // the card is sent ahead of the night, so it waits for a word
const GATE_WORD = 'mirepoix';           // onion, carrot and celery — the three of them together
const GATE_HINTS = [
  'Not quite. It is a cooking word.',
  'Think about what an onion and a carrot get up to in a pot.',
  'Add celery. The French have a word for the three of them.',
  'It begins with an M. That is the last hint you are getting.',
];
const PHOTO_KEY = 'ns_bingo_photos_v1';  // photos live apart, so a full album can never spoil a card
const PHOTO_MAX_EDGE = 640;
const PHOTO_QUALITY = 0.7;
const PHOTO_MAX_CHARS = 700000;
const PHOTO_PATTERN = /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/;
const ART_KEYS = ['otter', 'dhole', 'loris', 'pangolin', 'fishingcat', 'tiger', 'binturong', 'tapir', 'flyingsquirrel', 'flyingfox'];
const FREE_CELL = { icon: '💛', label: 'Here with you', kind: 'free' };

// Night Safari residents and the small sensory things you actually look for in the dark.
// Every named species below is confirmed at Night Safari, either on Mandai's own
// animals-and-zones pages or in its own press material (dhole, Malayan tiger).
// Sambar deer, capybara and pythons were dropped: they appear only in third-party
// guides and could leave a square that can never honestly be ticked.
const WILDLIFE = [
  ['🦦', 'Asian small-clawed otter', 'otter'],
  ['🐯', 'A Malayan tiger, prowling', 'tiger'],
  ['🦔', 'Sunda pangolin in armour', 'pangolin'],
  ['🐒', 'A slow loris, wide eyes', 'loris'],
  ['🐈', 'A fishing cat, paws wet', 'fishingcat'],
  ['🍿', 'A binturong (like popcorn)', 'binturong'],
  ['🐕', 'A dhole, the whistling dog', 'dhole'],
  ['🐖', 'A Malayan tapir, two-tone', 'tapir'],
  ['🐘', 'An Asian elephant, gentle'],
  ['🐺', 'A striped hyena, head down'],
  ['🐿️', 'A flying squirrel, gliding', 'flyingsquirrel'],
  ['🐆', 'A leopard cat, small spots'],
  ['🦇', 'A fruit bat, wings folded', 'flyingfox'],
  ['🦏', 'A one-horned rhino, calm'],
  ['🦁', 'A lion with a proper mane'],
  ['😈', 'A Tasmanian devil, awake'],
  ['🐗', 'A babirusa and its tusks'],
  ['🌵', 'A porcupine, quills out'],
  ['🦘', 'A wallaby, mid-hop'],
  ['🐆', 'A leopard, high on a branch'],
  ['🌴', 'A palm civet on the move'],
  ['🐿️', 'A sugar glider, tiny, quick'],
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
let keepsakeNote = null;   // how saving the photos went, on the end screen only
let working = false;       // a keepsake is being drawn; one at a time is plenty

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
  return { who, cells, on: cells.map((_, i) => i === FREE_INDEX), celebrated: [], started: Date.now() };
}

function validCard(value, who) {
  if (!value || value.who !== who || !Array.isArray(value.cells) || value.cells.length !== CELLS ||
      !Array.isArray(value.on) || value.on.length !== CELLS || value.on.some(on => typeof on !== 'boolean')) return null;
  const cells = value.cells.map(cell => {
    if (!cell || typeof cell.icon !== 'string' || cell.icon.length > 16 ||
        typeof cell.label !== 'string' || !cell.label.trim() || cell.label.length > LABEL_MAX) return null;
    return { icon: cell.icon, label: cell.label,
      art: ART_KEYS.includes(cell.art) ? cell.art :
        WILDLIFE.find(item => item.label === cell.label && ['tapir', 'flyingsquirrel', 'flyingfox'].includes(item.art))?.art,
      kind: ['wildlife', 'together', 'free'].includes(cell.kind) ? cell.kind : 'together' };
  });
  if (cells.some(cell => !cell)) return null;
  cells[FREE_INDEX] = { ...FREE_CELL };
  const on = value.on.slice();
  on[FREE_INDEX] = true;
  const celebrated = Array.isArray(value.celebrated) ? [...new Set(value.celebrated.filter(i =>
    Number.isInteger(i) && i >= 0 && i < LINES.length))] : [];
  // The night this card began, so a keepsake can be dated. An older save simply starts from today.
  const started = Number.isFinite(value.started) && value.started > 0 ? Math.floor(value.started) : Date.now();
  return { who, cells, on, celebrated, started };
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

/* ---------- one keepsake image ---------- */
// These photos live in one browser and nowhere else. This turns the lot of them into a
// single picture that can sit in a camera roll, a chat, or a printer — somewhere that lasts.
const SHEET_WIDTH = 1080;                // kind to a phone screen and still decent printed
const SHEET_MARGIN = 48;
const SHEET_GUTTER = 28;
const SHEET_PAD = 12;                    // the white border around each little polaroid
const SHEET_CAPTION = 46;                // room under each photo for its square’s label
const SHEET_CELL_MAX = 460;              // one lonely photo shouldn’t balloon to the full width
const SHEET_HEAD = 196;                  // title and date
const SHEET_FOOT = 116;                  // the warm line at the bottom
const SHEET_COLS_MAX = 4;
const SHEET_TILT = 1.6;                  // degrees — just enough to look taped in
const SHEET_QUALITY = 0.88;
const SHEET_CREAM = '#fff7e6';
const SHEET_INK = '#2b2340';
const SHEET_SOFT = '#5e5673';
const SHEET_TITLE_FONT = '"Fredoka","Nunito","Segoe UI",sans-serif';
const SHEET_BODY_FONT = '"Nunito","Segoe UI",sans-serif';

function sheetLabelSize(cellWidth) { return cellWidth < 260 ? 16 : 19; }
function sheetLabelMax(cellWidth) {
  const inner = cellWidth - SHEET_PAD * 2 - 8;
  return Math.max(12, Math.min(34, Math.floor(inner / (sheetLabelSize(cellWidth) * 0.55))));
}
// Gentle, alternating, and always the same tilt for the same position.
function tiltAt(index) {
  return (index % 2 ? 1 : -1) * SHEET_TILT * (1 + (index % 3) * 0.15);
}
// Where every polaroid sits. One photo through sixteen, always inside the page.
function sheetLayout(count) {
  const total = Math.min(Math.max(Math.floor(Number(count)) || 0, 0), CELLS);
  if (total < 1) return null;
  const cols = Math.min(SHEET_COLS_MAX, Math.ceil(Math.sqrt(total)));
  const rows = Math.ceil(total / cols);
  const room = SHEET_WIDTH - SHEET_MARGIN * 2 - SHEET_GUTTER * (cols - 1);
  const cellW = Math.min(SHEET_CELL_MAX, Math.floor(room / cols));
  const photoW = cellW - SHEET_PAD * 2;
  const cellH = photoW + SHEET_PAD * 2 + SHEET_CAPTION;
  const height = SHEET_HEAD + rows * cellH + SHEET_GUTTER * (rows - 1) + SHEET_FOOT;
  const frames = [];
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / cols);
    const column = i % cols;
    const inRow = Math.min(cols, total - row * cols);   // a short last row is centred, not left-hung
    const rowWidth = inRow * cellW + SHEET_GUTTER * (inRow - 1);
    const x = Math.round((SHEET_WIDTH - rowWidth) / 2) + column * (cellW + SHEET_GUTTER);
    const y = SHEET_HEAD + row * (cellH + SHEET_GUTTER);
    frames.push({ x, y, w: cellW, h: cellH, row, column, tilt: tiltAt(i) });
  }
  return { width: SHEET_WIDTH, height, cols, rows, gutter: SHEET_GUTTER,
    cell: { w: cellW, h: cellH }, photo: { w: photoW, h: photoW },
    labelMax: sheetLabelMax(cellW), labelSize: sheetLabelSize(cellW), frames };
}
// A long label is trimmed at a word where one is near enough, never mid-letter-soup.
function clipLabel(text, max) {
  const clean = String(text === undefined || text === null ? '' : text).replace(/\s+/g, ' ').trim();
  const cap = Math.max(4, Math.floor(Number(max)) || 0);
  if (clean.length <= cap) return clean;
  const cut = clean.slice(0, cap - 1);
  const space = cut.lastIndexOf(' ');
  const kept = (space >= Math.floor(cap * 0.6) ? cut.slice(0, space) : cut).replace(/[\s,.;:!?–-]+$/, '');
  return (kept || cut.trim() || clean.slice(0, cap - 1)) + '…';
}
// Fill the square without squashing anybody: crop the long side away, evenly.
function coverRect(sourceW, sourceH, boxW, boxH) {
  if (!(sourceW > 0) || !(sourceH > 0) || !(boxW > 0) || !(boxH > 0)) return null;
  const scale = Math.max(boxW / sourceW, boxH / sourceH);
  const width = Math.min(sourceW, boxW / scale);
  const height = Math.min(sourceH, boxH / scale);
  return { x: (sourceW - width) / 2, y: (sourceH - height) / 2, w: width, h: height };
}
function sheetDate(when) {
  const date = new Date(Number(when));
  if (!Number.isFinite(date.getTime())) return '';
  try { return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch (_) { return date.toISOString().slice(0, 10); }
}
function dayStamp(when) {
  const date = new Date(Number(when));
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : 'night';
}
function warmSheetLine(count) {
  if (count >= 10) return 'A whole night, tucked into one little sheet.';
  if (count >= 5) return 'A good handful from our night in the dark.';
  if (count >= 2) return 'A few keepers from a very dark park.';
  return 'One photo, with a whole evening behind it.';
}
function keepsakeName(who, started) { return `night-safari-${who}-${dayStamp(started)}.jpg`; }

// A photo that will not decode is quietly left out rather than spoiling the sheet.
function loadPhoto(dataURL) {
  return new Promise(resolve => {
    let image;
    try { image = new Image(); } catch (_) { resolve(null); return; }
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    try { image.src = dataURL; } catch (_) { resolve(null); }
  });
}
function drawSheet(ctx, layout, items, meta) {
  ctx.fillStyle = SHEET_CREAM;
  ctx.fillRect(0, 0, layout.width, layout.height);
  ctx.strokeStyle = 'rgba(43,35,64,.2)';
  ctx.lineWidth = 3;
  ctx.strokeRect(15, 15, layout.width - 30, layout.height - 30);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = SHEET_INK;
  ctx.font = `700 70px ${SHEET_TITLE_FONT}`;
  ctx.fillText('Night Safari', layout.width / 2, 100);
  ctx.font = `700 26px ${SHEET_BODY_FONT}`;
  ctx.fillStyle = SHEET_SOFT;
  ctx.fillText(meta.subtitle, layout.width / 2, 144);

  items.forEach((item, i) => {
    const frame = layout.frames[i];
    ctx.save();
    ctx.translate(frame.x + frame.w / 2, frame.y + frame.h / 2);
    ctx.rotate(frame.tilt * Math.PI / 180);
    ctx.translate(-frame.w / 2, -frame.h / 2);
    ctx.fillStyle = 'rgba(43,35,64,.2)';
    ctx.fillRect(5, 7, frame.w, frame.h);              // a flat little drop shadow
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, frame.w, frame.h);
    const image = item.image;
    const crop = coverRect(image.naturalWidth || image.width, image.naturalHeight || image.height,
      layout.photo.w, layout.photo.h);
    if (crop) {
      try {
        ctx.drawImage(image, crop.x, crop.y, crop.w, crop.h,
          SHEET_PAD, SHEET_PAD, layout.photo.w, layout.photo.h);
      } catch (_) { /* one shy photo leaves an empty frame, never a broken sheet */ }
    }
    ctx.fillStyle = SHEET_INK;
    ctx.font = `700 ${layout.labelSize}px ${SHEET_BODY_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(clipLabel(item.label, layout.labelMax),
      frame.w / 2, SHEET_PAD * 2 + layout.photo.h + Math.round(SHEET_CAPTION * 0.55));
    ctx.restore();
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = SHEET_INK;
  ctx.font = `700 30px ${SHEET_BODY_FONT}`;
  ctx.fillText(meta.warm, layout.width / 2, layout.height - SHEET_FOOT + 52);
  ctx.font = `600 22px ${SHEET_BODY_FONT}`;
  ctx.fillStyle = SHEET_SOFT;
  ctx.fillText('Little moments bingo · kept just for us', layout.width / 2, layout.height - SHEET_FOOT + 90);
}
function dataURLBlob(dataURL) {
  try {
    const base64 = String(dataURL).split(',')[1] || '';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: 'image/jpeg' });
  } catch (_) { return null; }
}
function canvasBlob(canvas) {
  return new Promise(resolve => {
    try {
      if (typeof canvas.toBlob === 'function') {
        canvas.toBlob(blob => resolve(blob || null), 'image/jpeg', SHEET_QUALITY);
        return;
      }
      resolve(dataURLBlob(canvas.toDataURL('image/jpeg', SHEET_QUALITY)));
    } catch (_) { resolve(null); }
  });
}
// Every photo on this player's card, laid out and drawn. Resolves null if there is nothing to draw.
function composeSheet(who) {
  const card = book.cards[who];
  if (!card) return Promise.resolve(null);
  const wanted = [];
  for (let i = 0; i < CELLS; i++) {
    const photo = photoOf(who, i);
    if (photo) wanted.push({ index: i, label: card.cells[i].label, photo });
  }
  if (!wanted.length) return Promise.resolve(null);
  return Promise.all(wanted.map(item => loadPhoto(item.photo))).then(images => {
    const items = wanted.map((item, i) => ({ ...item, image: images[i] })).filter(item => item.image);
    if (!items.length) return null;
    const layout = sheetLayout(items.length);
    let canvas;
    try {
      canvas = document.createElement('canvas');
      canvas.width = layout.width;
      canvas.height = layout.height;
      drawSheet(canvas.getContext('2d'), layout, items, {
        subtitle: [`${who}’s little collection`, sheetDate(card.started)].filter(Boolean).join(' · '),
        warm: warmSheetLine(items.length),
      });
    } catch (_) { return null; }
    return canvasBlob(canvas).then(blob => blob && { blob, layout,
      drawn: items.length, missed: wanted.length - items.length });
  });
}

/* ---------- getting a file off the phone ---------- */
function makeBlob(parts, type) {
  try { return new Blob(parts, { type }); } catch (_) { return null; }
}
function makeFile(blob, name, type) {
  try { return new File([blob], name, { type }); } catch (_) { return null; }
}
function canDownload() {
  try { return 'download' in document.createElement('a'); } catch (_) { return false; }
}
function canShareFile(file) {
  if (!file || typeof navigator === 'undefined') return false;
  if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') return false;
  try { return navigator.canShare({ files: [file] }) === true; } catch (_) { return false; }
}
// Backing out of the share sheet is a perfectly normal thing to do; it is not an error.
function wasCancelled(error) {
  if (!error) return true;
  return error.name === 'AbortError' || /abort|cancel/i.test(String(error.message || ''));
}
function makeURL(blob) {
  try { return URL.createObjectURL(blob); } catch (_) { return null; }
}
function dropURL(url) {
  try { URL.revokeObjectURL(url); } catch (_) { /* already gone */ }
}
function downloadBlob(blob, filename) {
  if (!blob || !canDownload()) return false;
  const url = makeURL(blob);
  if (!url) return false;
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    anchor.className = 'sr-only';
    // A couple of browsers only follow a link that is really on the page, so it visits, briefly.
    if (document.body && document.body.appendChild) document.body.appendChild(anchor);
    anchor.click();
    if (anchor.remove) anchor.remove();
  } catch (_) { dropURL(url); return false; }
  setTimeout(() => dropURL(url), 20000);   // let the browser take it first, then tidy up
  return true;
}
function openBlob(blob) {
  if (!blob || typeof window === 'undefined' || typeof window.open !== 'function') return false;
  const url = makeURL(blob);
  if (!url) return false;
  let opened;
  try { opened = window.open(url, '_blank', 'noopener'); } catch (_) { opened = null; }
  if (!opened) { dropURL(url); return false; }
  setTimeout(() => dropURL(url), 60000);
  return true;
}
// Share sheet first (that is what reaches a camera roll), then a download, then a new tab.
function deliverImage(blob, filename, words) {
  const file = makeFile(blob, filename, 'image/jpeg');
  const rest = () => {
    if (downloadBlob(blob, filename)) return { how: 'download' };
    if (openBlob(blob)) return { how: 'tab' };
    return { how: 'stuck' };
  };
  if (!canShareFile(file)) return Promise.resolve(rest());
  return Promise.resolve()
    .then(() => navigator.share({ files: [file], title: words.title, text: words.text }))
    .then(() => ({ how: 'share' }), error => (wasCancelled(error) ? { how: 'cancelled' } : rest()));
}

/* ---------- a backup you can hold ---------- */
const BACKUP_TAG = 'ns-bingo';
const BACKUP_VERSION = 1;
const BACKUP_TROUBLE = {
  unreadable: 'That file wouldn’t open, so nothing has changed.',
  shape: 'That isn’t one of our backup files, so nothing has changed.',
  version: 'That backup came from a newer version of the card, so this one can’t read it. Nothing has changed.',
  player: `That backup isn’t for ${NAMES[0]} or ${NAMES[1]}, so nothing has changed.`,
  card: 'The card inside that backup is damaged, so nothing has changed.',
  photos: 'The photos inside that backup are damaged, so nothing has changed.',
};
function backupOf(who) {
  if (!NAMES.includes(who)) return null;
  const card = book.cards[who];
  if (!card) return null;
  const photos = {};
  for (const [index, photo] of Object.entries(album.photos[who] || {})) photos[index] = photo;
  return {
    app: BACKUP_TAG,
    version: BACKUP_VERSION,
    savedAt: new Date().toISOString(),
    who,
    card: { who, cells: card.cells.map(cell => ({ ...cell })), on: card.on.slice(),
      celebrated: card.celebrated.slice(), started: card.started },
    photos,
  };
}
function backupName(who) { return `night-safari-bingo-${who}-${dayStamp(Date.now())}.json`; }
// Strict on the way in: a file we cannot completely trust is refused, never half-applied.
function validBackup(value) {
  const no = reason => ({ ok: false, reason, message: BACKUP_TROUBLE[reason] || BACKUP_TROUBLE.shape });
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.app !== BACKUP_TAG) return no('shape');
  if (!Number.isInteger(value.version)) return no('shape');
  if (value.version !== BACKUP_VERSION) return no('version');
  if (!NAMES.includes(value.who)) return no('player');
  const card = validCard(value.card, value.who);
  if (!card) return no('card');
  const kept = value.photos;
  if (kept !== undefined && (!kept || typeof kept !== 'object' || Array.isArray(kept))) return no('photos');
  const photos = {};
  let skipped = 0;
  for (const [key, photo] of Object.entries(kept || {})) {
    const index = /^\d+$/.test(key) ? Number(key) : -1;
    // A single unreadable photo is dropped; the rest of the evening still comes home.
    if (index >= 0 && index < CELLS && validPhoto(photo)) photos[index] = photo;
    else skipped++;
  }
  return { ok: true, who: value.who, card, photos, skipped,
    savedAt: typeof value.savedAt === 'string' ? value.savedAt : '' };
}
function readBackup(text) {
  let value;
  try { value = JSON.parse(String(text)); }
  catch (_) { return { ok: false, reason: 'unreadable', message: BACKUP_TROUBLE.unreadable }; }
  return validBackup(value);
}
// All of it or none of it. If either write is refused, the board goes back exactly as it was.
function applyBackup(parsed) {
  if (!parsed || !parsed.ok) return { ok: false, reason: 'bad' };
  const who = parsed.who;
  const hadCard = Object.prototype.hasOwnProperty.call(book.cards, who);
  const beforeCard = book.cards[who];
  const beforeActive = book.active;
  const beforePhotos = album.photos[who];
  book.cards[who] = parsed.card;
  book.active = who;
  album.photos[who] = { ...parsed.photos };
  // Photos are the bulky write, so they go first: if there is no room we find out before touching the card.
  const photoWrite = saveAlbum();
  const cardWrite = photoWrite.ok ? save() : photoWrite;
  if (!cardWrite.ok) {
    if (hadCard) book.cards[who] = beforeCard; else delete book.cards[who];
    book.active = beforeActive;
    album.photos[who] = beforePhotos || {};
    saveAlbum();                        // the old, smaller album fitted a moment ago
    save();
    return { ok: false, reason: cardWrite.reason || 'blocked' };
  }
  if (state && state.who === who) state = book.cards[who];
  return { ok: true, who, photos: Object.keys(parsed.photos).length, skipped: parsed.skipped,
    marked: parsed.card.on.filter(Boolean).length - 1 };
}

let book = loadBook();
let album = loadAlbum();
let state = null;

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(book)); storageOK = true; return { ok: true }; }
  catch (error) { storageOK = false; return { ok: false, reason: isQuotaError(error) ? 'full' : 'blocked' }; }
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function announce(message) { announcement.textContent = message; }

function gateOpen() {
  if (typeof GATE_OPEN !== 'undefined' && GATE_OPEN) return true;   // test harness
  try { return localStorage.getItem(GATE_KEY) === '1'; } catch (error) { return false; }
}
function openGate() {
  try { localStorage.setItem(GATE_KEY, '1'); } catch (error) { /* private mode: this visit only */ }
}
function normalise(word) {
  return String(word == null ? '' : word).trim().toLowerCase().replace(/\s+/g, '');
}
let gateTries = 0;

function showGate(message) {
  app.innerHTML = `<div class="screen">
    <div class="card tilt-l gate">
      <span class="tape"></span>
      <span class="tag">Sealed until Saturday</span>
      <h1 class="pixel">One word</h1>
      <p>The bingo card is for the night itself, so it is locked until then.</p>
      <p class="gate-riddle">An onion and a carrot walk into a pot. They bring a friend.<br>
        <b>What do you call the three of them together?</b></p>
      <form class="gate-form" data-gate>
        <label class="sr-only" for="gate-word">The word</label>
        <input id="gate-word" name="word" type="text" autocomplete="off" autocapitalize="none"
          spellcheck="false" placeholder="one word" aria-describedby="gate-msg">
        <button class="btn" type="submit">Unlock</button>
      </form>
      <p class="gate-msg" id="gate-msg" role="status" aria-live="polite">${message ? escapeHTML(message) : ''}</p>
    </div>
  </div>`;
  const field = app.querySelector('#gate-word');
  if (field && field.focus) field.focus({ preventScroll: true });
}

function tryGate(word) {
  if (normalise(word) === GATE_WORD) {
    openGate();
    announce('Unlocked. Your bingo card is ready.');
    if (book.active) start(book.active); else pickWho();
    return true;
  }
  gateTries += 1;
  showGate(normalise(word) ? GATE_HINTS[Math.min(gateTries - 1, GATE_HINTS.length - 1)] : 'A word goes in the box.');
  return false;
}

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
    <div class="who-pick">${NAMES.map(who => `<button class="btn ${who === NAMES[1] ? 'mint' : 'coral'}" data-player="${who}">${who}<small>${book.cards[who] ? 'Continue my card' : 'That’s me'}</small></button>`).join('')}</div>
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
  keepsakeNote = null;
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
// The honest line about where photos live. Said once per screen, never twice.
function photoTruth(count) {
  if (!count) return 'No photos yet. Tap a 📷 whenever something is worth keeping.';
  const many = `${count} ${count === 1 ? 'photo' : 'photos'} tucked into this card, kept on this phone only.`;
  return storageOK ? `${many} Worth saving at the end of the night.` : many;
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
  const classes = ['cell', state.on[i] && 'on', free && 'free', winCells.has(i) && 'win', photo && 'has-photo'];
  return `<div class="cell-wrap">
    <button type="button" class="${classes.filter(Boolean).join(' ')}"
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
  // Worth listing if it was ticked, or if it was worth a photo even without a tick.
  const marked = state.cells.map((cell, i) => ({ cell, i }))
    .filter(({ i }) => (state.on[i] && i !== FREE_INDEX) || photoOf(state.who, i));
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
    ${keepsakeHTML(photos)}
    <div class="bingo-aftercare">
      <button class="bingo-reset" data-action="board">← Back to the card</button>
    </div>
  </div>`;
}

// The one place the photos can be taken off this phone.
function keepsakeWhy(photos) {
  if (!photos) return storageOK
    ? 'No photos on this card yet. Tap a 📷 on any square and they’ll gather here, ready to keep.'
    : 'No photos on this card yet — and this browser isn’t keeping anything tonight, so any you add would go when this tab does.';
  if (!storageOK) return 'This browser isn’t keeping anything tonight, so save these photos before you leave this page.';
  return `Your ${photos === 1 ? 'photo lives' : 'photos live'} on this phone only. One tap tidies ${photos === 1 ? 'it' : 'them'} into a single picture for your camera roll.`;
}
function keepsakeHTML(photos) {
  const label = working ? 'Making your picture…'
    : `Save our photos${photos ? `<small>${photos} ${photos === 1 ? 'photo' : 'photos'}, one little picture</small>` : ''}`;
  return `<div class="card bingo-keepsake">
      <h2 class="keepsake-title">Take tonight with you</h2>
      <p class="keepsake-why">${keepsakeWhy(photos)}</p>
      <button type="button" class="keepsake-primary" data-action="keepsake"${photos && !working ? '' : ' disabled'}>${label}</button>
      ${keepsakeNote ? `<p class="keepsake-note" role="status">${escapeHTML(keepsakeNote)}</p>` : ''}
      <div class="keepsake-pair">
        <button type="button" class="keepsake-minor" data-action="backup">Back up this card</button>
        <button type="button" class="keepsake-minor" data-action="restore">Restore from a file</button>
      </div>
      <p class="keepsake-smallprint">A backup is one small file holding ${state.who}’s squares and photos — handy before a new phone. Restoring puts it all back.</p>
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
      <p class="bingo-album-note">${photoTruth(photos)}</p>
    </div>
    <div class="bingo-aftercare">
      <p class="bingo-save-note ${storageOK ? '' : 'save-warning'}">${storageOK ? 'Saved on this device. Switching players keeps both cards.<br>Cards don’t sync between phones.' : 'This browser can’t save right now — a private window, most likely. Keep this tab open: tonight’s squares and photos won’t be kept.'}</p>
      <button class="bingo-summary-link" data-action="summary">See how our night went →</button>
      <details class="bingo-details"><summary>A tiny field guide</summary>
        <p>Wildlife squares have a mint edge; our little moments have a pink one. The middle is already yours—you showed up together.</p>
        <p>Photos are shrunk and kept on this phone alone. Nothing is uploaded, and nothing is shared unless you show someone. That also means clearing this browser takes them with it, so the end screen has a button that saves them all as one picture.</p>
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
  keepsakeNote = null;
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
  const refresh = () => {
    if (!state || state.who !== who || view !== 'board') return;
    render();
    // The grid was rebuilt, so put focus back on the square they were just working on.
    const button = app.querySelector(`[data-view-photo="${index}"], [data-photo="${index}"]`);
    if (button) button.focus({ preventScroll: true });
  };
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

/* ---------- taking it all with you ---------- */
function setKeepsake(message) {
  keepsakeNote = message || null;
  if (view === 'summary') render();
  if (message) announce(message);
}
const KEEPSAKE_DONE = {
  share: 'Sent on. Choose “Save Image” and the whole night lands in your camera roll.',
  cancelled: 'No trouble at all — the picture is here whenever you want it.',
  download: 'Saved as one picture. That’s the whole evening in a single file.',
  tab: 'Opened in a new tab — press and hold the picture to save it to your phone.',
  stuck: 'This browser wouldn’t hand the picture over. Try again from your usual browser?',
};
function saveKeepsake() {
  if (!state || working) return;
  const who = state.who;
  if (!photoCount(who)) {
    setKeepsake('No photos on this card yet — the 📷 on each square keeps one.');
    return;
  }
  working = true;
  setKeepsake('Putting your photos together…');
  const finish = message => { working = false; setKeepsake(message); };
  return Promise.resolve().then(() => composeSheet(who)).then(sheet => {
    if (!sheet) return { how: 'nothing', missed: 0 };
    return deliverImage(sheet.blob, keepsakeName(who, book.cards[who].started), {
      title: 'Our Night Safari',
      text: `${who}’s little collection from the Night Safari.`,
    }).then(result => ({ how: result.how, missed: sheet.missed }));
  }).then(result => {
    if (result.how === 'nothing') { finish('Those photos wouldn’t open just now, so there was nothing to draw.'); return; }
    const missed = result.missed
      ? ` ${result.missed} photo${result.missed === 1 ? ' wouldn’t open, so it is' : 's wouldn’t open, so they are'} not on it.` : '';
    finish((KEEPSAKE_DONE[result.how] || KEEPSAKE_DONE.stuck) + missed);
  }, () => finish('That didn’t work out just now. Try again in a moment?'));
}
function saveBackup() {
  if (!state) return;
  const who = state.who;
  const payload = backupOf(who);
  if (!payload) { setKeepsake('There’s no card to back up yet.'); return; }
  const photos = Object.keys(payload.photos).length;
  const blob = makeBlob([JSON.stringify(payload)], 'application/json');
  if (downloadBlob(blob, backupName(who))) {
    setKeepsake(`Backed up ${who}’s card and ${photos} ${photos === 1 ? 'photo' : 'photos'} into one file. Keep it somewhere safe.`);
    return;
  }
  if (openBlob(blob)) { setKeepsake('The backup opened in a new tab — save that page to keep it.'); return; }
  setKeepsake('This browser wouldn’t hand over the file. Try again from your usual browser?');
}
function pickRestore() {
  if (!state) return;
  let input;
  try { input = document.createElement('input'); } catch (_) { return; }
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.className = 'sr-only';
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (file) readRestoreFile(file);
  });
  input.click();
}
function readRestoreFile(file) {
  return new Promise(resolve => {
    const sorry = () => { setKeepsake(BACKUP_TROUBLE.unreadable); resolve(false); };
    let reader;
    try { reader = new FileReader(); } catch (_) { sorry(); return; }
    reader.onerror = sorry;
    reader.onload = () => resolve(takeBackup(String(reader.result)));
    try { reader.readAsText(file); } catch (_) { sorry(); }
  });
}
// Ask before replacing anything, and say plainly whose card it was.
function takeBackup(text) {
  const parsed = readBackup(text);
  if (!parsed.ok) { setKeepsake(parsed.message); return false; }
  const who = parsed.who;
  const other = NAMES.find(name => name !== who);
  if (book.cards[who] && !confirm(
    `Put this backup back for ${who}? ${who}’s squares and photos on this phone are replaced. ${other}’s card stays safe.`)) {
    setKeepsake('Left everything exactly as it was.');
    return false;
  }
  const done = applyBackup(parsed);
  if (!done.ok) {
    setKeepsake(done.reason === 'full'
      ? 'There isn’t room on this phone for that backup, so nothing was changed.'
      : 'This browser won’t save right now, so nothing was changed.');
    return false;
  }
  start(who, true);
  const skipped = done.skipped
    ? ` ${done.skipped} photo${done.skipped === 1 ? '' : 's'} in the file couldn’t be read.` : '';
  notice = `${who}’s card is back: ${done.marked} of ${MOMENTS} squares and ${done.photos} ${done.photos === 1 ? 'photo' : 'photos'}.${skipped}`;
  render();
  announce(notice);
  return true;
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

const ACTIONS = { reset, summary: showSummary, board: showBoard, 'close-photo': closePhoto, 'remove-photo': dropPhoto,
  keepsake: saveKeepsake, backup: saveBackup, restore: pickRestore };
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
app.addEventListener('submit', event => {
  const form = event.target.closest('[data-gate]');
  if (!form) return;
  event.preventDefault();
  const field = form.querySelector('input');
  tryGate(field ? field.value : '');
});
// A failed image reveals its emoji fallback; never retry a broken URL.
app.addEventListener('error', event => {
  if (event.target.matches('img[data-fallback]')) event.target.remove();
}, true);

const requestedPlayer = new URLSearchParams(location.search).get('who');
if (!gateOpen()) showGate('');
else if (NAMES.includes(requestedPlayer)) start(requestedPlayer);
else if (book.active) start(book.active);
else pickWho();
