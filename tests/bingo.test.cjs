const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'bingo.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const KEY = 'ns_bingo_v3';
const PHOTO_KEY = 'ns_bingo_photos_v1';
const OLD_KEYS = ['ns_bingo_v2', 'ns_bingo_v1'];
const CELLS = 16;
const MOMENTS = 15;
const FREE = 5;

// A small stand-in JPEG data URL: the shape the album accepts, without a real encoder.
const jpeg = (size = 40) => 'data:image/jpeg;base64,' + 'A'.repeat(size) + '==';

function quotaError() {
  const error = Error('exceeded the quota');
  error.name = 'QuotaExceededError';
  error.code = 22;
  return error;
}

// Minimal DOM boundary: exercise the real script, event handlers and rendered HTML
// without a browser dependency. These tests do not claim to measure browser layout.
function boot({ search = '', stored = new Map(), storageDenied = false, fullKeys = [],
  reducedMotion = true, confirmResult = false, people = { players: ['Ace', 'Bee'] } } = {}) {
  const listeners = {};
  const docListeners = {};
  const focused = [];
  const elements = [];
  const created = [];
  const timers = [];
  const confirmations = [];
  const announcement = { textContent: '' };
  const app = {
    innerHTML: '',
    addEventListener: (name, handler) => { listeners[name] = handler; },
    contains: button => button.inside !== false,
    querySelector(selector) {
      return { focus: options => focused.push({ selector, options }), classList: { add() {} } };
    },
  };
  const context = vm.createContext({
    ...(people ? { PEOPLE: people } : {}),
    URLSearchParams,
    location: { search },
    localStorage: {
      getItem(key) { if (storageDenied) throw Error('Denied'); return stored.get(key) ?? null; },
      setItem(key, value) {
        if (storageDenied) throw Error('Denied');
        if (fullKeys.includes(key)) throw quotaError();
        stored.set(key, value);
      },
    },
    window: { matchMedia: () => ({ matches: reducedMotion }) },
    confirm(message) { confirmations.push(message); return confirmResult; },
    setTimeout(callback) { timers.push(callback); },
    Promise,
    document: {
      querySelector: selector => selector === '#app' ? app : announcement,
      querySelectorAll: () => elements.filter(element => !element.removed),
      addEventListener: (name, handler) => { docListeners[name] = handler; },
      createElement(tag) {
        const element = { tag, style: { setProperty() {} }, attributes: {}, handlers: {}, clicks: 0,
          setAttribute(name, value) { this.attributes[name] = value; },
          addEventListener(name, handler) { this.handlers[name] = handler; },
          click() { this.clicks++; },
          remove() { this.removed = true; } };
        created.push(element);
        return element;
      },
      body: { appendChild: element => elements.push(element) },
    },
  });
  vm.runInContext(source, context, { filename: 'bingo.js' });
  const run = code => vm.runInContext(code, context);
  const read = code => JSON.parse(run(`JSON.stringify(${code})`));
  const click = (dataset, inside = true) => listeners.click({ target: { closest: () => ({ dataset, inside }) } });
  return { run, read, app, announcement, focused, elements, created, timers, confirmations,
    listeners, docListeners, click, stored };
}

function fullCard(who = 'Ace') {
  return { who, cells: Array.from({ length: CELLS }, (_, i) => ({ icon: '🐾', label: `Moment ${i}`, kind: 'together' })),
    on: Array.from({ length: CELLS }, (_, i) => i < 4 || i === FREE), celebrated: [0] };
}

// The handful of browser bits a file needs to leave the phone: blobs, object URLs, a share sheet.
// Everything a real browser would do is recorded in `tally` instead of actually happening.
function equip(page, { share = 'none', download = true, tab = true } = {}) {
  page.run(`
    globalThis.tally = { made: 0, live: [], revoked: [], shared: [], opened: [] };
    globalThis.Blob = function (parts, options) { this.parts = parts; this.type = (options || {}).type || ''; };
    globalThis.File = function (parts, name, options) {
      this.parts = parts; this.name = name; this.type = (options || {}).type || '';
    };
    globalThis.URL = {
      createObjectURL() { const url = 'blob:' + (tally.made++); tally.live.push(url); return url; },
      revokeObjectURL(url) { tally.revoked.push(url); tally.live = tally.live.filter(one => one !== url); },
    };
    canDownload = () => ${Boolean(download)};
    window.open = ${tab ? "url => { tally.opened.push(url); return {}; }" : '() => null'};
  `);
  const sheets = {
    cannot: 'globalThis.navigator = { share: () => Promise.resolve(), canShare: () => false };',
    ok: `globalThis.navigator = { canShare: () => true,
      share: data => { tally.shared.push(data.files[0].name); return Promise.resolve(); } };`,
    cancel: `globalThis.navigator = { canShare: () => true, share: () => {
      const stop = Error('Share canceled'); stop.name = 'AbortError'; return Promise.reject(stop); } };`,
    broken: `globalThis.navigator = { canShare: () => true,
      share: () => Promise.reject(Error('not permitted here')) };`,
  };
  if (sheets[share]) page.run(sheets[share]);
  return page;
}

/* ---------- the board ---------- */

test('first visit is a warm player picker, with no accidental card creation', () => {
  const page = boot();
  assert.equal(page.read('state'), null);
  assert.match(page.app.innerHTML, /Little moments/);
  assert.match(page.app.innerHTML, /Winner picks dessert\. We share it\./);
  assert.equal(page.stored.size, 0);
});

test('the board is four by four with a free square on a diagonal', () => {
  const page = boot({ search: '?who=Ace' });
  assert.equal(page.read('SIZE'), 4);
  assert.equal(page.read('CELLS'), CELLS);
  assert.equal(page.read('MOMENTS'), MOMENTS);
  assert.equal(page.read('FREE_INDEX'), FREE);
  const lines = page.read('LINES');
  assert.equal(lines.length, 10);                                   // 4 rows + 4 columns + 2 diagonals
  assert.equal(new Set(lines.map(line => line.join(','))).size, 10);
  assert.ok(lines.every(line => line.length === 4));
  assert.ok(lines.every(line => line.every(i => i >= 0 && i < CELLS)));
  assert.deepEqual(lines.at(-2), [0, 5, 10, 15]);
  assert.deepEqual(lines.at(-1), [3, 6, 9, 12]);
  assert.ok(lines.slice(-2).some(line => line.includes(FREE)), 'free square sits on a diagonal');
  assert.match(page.app.innerHTML, /4 by 4 bingo card/);
  assert.match(page.app.innerHTML, /Four across, down or diagonally/);
});

test('500 fresh cards balance ten wildlife, five shared moments and a free middle', () => {
  const page = boot();
  const poolBefore = page.read('[WILDLIFE, TOGETHER]');
  const arrangements = new Set();
  for (let i = 0; i < 500; i++) {
    const card = page.read("newCard('Ace')");
    assert.equal(card.cells.length, CELLS);
    assert.equal(new Set(card.cells.map(cell => cell.label)).size, CELLS);
    assert.equal(card.cells.filter(cell => cell.kind === 'wildlife').length, 10);
    assert.equal(card.cells.filter(cell => cell.kind === 'together').length, 5);
    assert.equal(card.cells.filter(cell => cell.kind === 'free').length, 1);
    assert.equal(card.cells[FREE].label, 'Here with you');
    assert.deepEqual(card.on, Array.from({ length: CELLS }, (_, k) => k === FREE));
    arrangements.add(card.cells.map(cell => cell.label).join('|'));
  }
  assert.equal(arrangements.size, 500, 'two phones should not draw the same card');
  assert.deepEqual(page.read('[WILDLIFE, TOGETHER]'), poolBefore, 'drawing must not consume the pools');
});

test('the pools are generous, all Night Safari residents, and free of stray art keys', () => {
  const page = boot();
  const wildlife = page.read('WILDLIFE');
  const together = page.read('TOGETHER');
  const artKeys = page.read('ART_KEYS');
  assert.ok(wildlife.length >= 24, `wildlife pool is ${wildlife.length}; want a generous one`);
  assert.ok(together.length >= 15, `shared pool is ${together.length}; want a generous one`);
  // A card takes 10 and 5; a pool at least twice that keeps two phones looking different.
  assert.ok(wildlife.length >= 20 && together.length >= 10);
  const labels = [...wildlife, ...together].map(cell => cell.label);
  assert.equal(new Set(labels).size, labels.length, 'no repeated labels between the pools');
  for (const cell of wildlife) if (cell.art) assert.ok(artKeys.includes(cell.art), `unknown art key ${cell.art}`);
  for (const banned of ['giraffe', 'penguin', 'panda', 'polar bear', 'koala']) {
    assert.equal(labels.some(label => label.toLowerCase().includes(banned)), false, `${banned} is not in the park`);
  }
  // A decent share of the wildlife squares name a real resident rather than a generic sense.
  const named = ['otter', 'tiger', 'pangolin', 'loris', 'fishing cat', 'binturong', 'dhole', 'tapir',
    'elephant', 'hyena', 'squirrel', 'leopard cat', 'bat'];
  const hits = named.filter(name => wildlife.some(cell => cell.label.toLowerCase().includes(name)));
  assert.deepEqual(hits, named, 'every named resident from the brief should appear');
});

test('every label fits a four-column square at a 360 pixel viewport', () => {
  const page = boot();
  const labels = [...page.read('WILDLIFE'), ...page.read('TOGETHER'), page.read('FREE_CELL')].map(cell => cell.label);
  assert.equal(page.read('LABEL_MAX'), 32);
  for (const label of labels) assert.ok(label.length <= 32, `"${label}" is ${label.length} characters`);

  // Layout arithmetic straight from the bingo CSS, at the narrow-phone breakpoint.
  const narrow = css.match(/@media\(max-width:380px\)\{([\s\S]*?)\n\}/)[1];
  assert.match(css, /\n\.grid\{[^}]*grid-template-columns:repeat\(4,/, 'the grid must be four columns');
  assert.match(narrow, /\.grid\{gap:5px\}/, 'narrow gap is 5px');
  assert.match(narrow, /\.cell\{padding-left:2px;padding-right:2px/, 'narrow cell padding is 2px');
  assert.match(narrow, /\.bingo-page \.wrap\{padding-left:10px/, 'narrow wrap padding is 10px');
  assert.match(css, /\n\.cell\{[^}]*overflow-wrap:break-word/, 'break whole words only when they truly cannot fit');
  const viewport = 360;
  const wrapInner = viewport - 10 * 2;            // .bingo-page .wrap padding at this breakpoint
  const cardInner = wrapInner - 2 * 2 - 8 * 2;    // .bingo-card border + padding
  const column = (cardInner - 5 * 3) / 4;         // three 5px gaps between four columns
  const textWidth = column - 2 * 2 - 2 * 2;       // .cell border + padding
  const fontSize = 11;                            // clamp(11px, 2.9vw, 13px) bottoms out at 360px
  assert.ok(textWidth > 60, `only ${textWidth}px of text per square`);

  for (const label of labels) {
    // Browsers may break after a hyphen, so each hyphenated part is measured on its own.
    for (const word of label.split(/(?<=-)|\s+/)) {
      assert.ok(word.length * 0.62 * fontSize <= textWidth,
        `"${word}" in "${label}" is too wide for a ${Math.round(textWidth)}px square`);
    }
    // Greedy line packing at a generous average advance; four lines is the cell's budget.
    let lines = 1;
    let used = 0;
    for (const word of label.split(/\s+/)) {
      const width = (word.length + 1) * 0.58 * fontSize;
      if (used && used + width > textWidth) { lines++; used = width; } else { used += width; }
    }
    assert.ok(lines <= 4, `"${label}" needs ${lines} lines`);
  }
});

test('known player links resume the exact saved card and marks on reload', () => {
  const first = boot({ search: '?who=Ace' });
  first.run('toggle(0); toggle(4)');
  const snapshot = first.read('state');
  const reloaded = boot({ search: '?who=Ace', stored: first.stored });
  assert.deepEqual(reloaded.read('state'), snapshot);
});

test('switching players preserves both cards and the last active player', () => {
  const page = boot({ search: '?who=Ace' });
  page.click({ cell: '3' });
  const xj = page.read('state');
  page.click({ player: 'Bee' });
  page.click({ cell: '7' });
  const ya = page.read('state');
  page.click({ player: 'Ace' });
  assert.deepEqual(page.read('state'), xj);
  page.click({ player: 'Bee' });
  assert.deepEqual(page.read('state'), ya);
  const reloaded = boot({ stored: page.stored });
  assert.deepEqual(reloaded.read('state'), ya);
  assert.deepEqual(reloaded.read('book.cards.Ace'), xj);
});

test('unrecognised and malicious player links cannot become HTML or create cards', () => {
  for (const who of ['Bob', '<img src=x onerror=alert(1)>', '__proto__', 'xj']) {
    const page = boot({ search: '?who=' + encodeURIComponent(who) });
    assert.equal(page.read('state'), null);
    assert.equal(page.app.innerHTML.includes(who), false);
    page.run(`start(${JSON.stringify(who)})`);
    assert.equal(page.stored.size, 0);
  }
});

test('older five-by-five saves are left untouched rather than forced onto a smaller board', () => {
  const old5x5 = JSON.stringify({ version: 2, active: 'Ace', cards: { Ace: { who: 'Ace',
    cells: Array.from({ length: 25 }, () => ({ icon: '🐾', label: 'Old moment', kind: 'wildlife' })),
    on: Array.from({ length: 25 }, (_, i) => i === 12), celebrated: [] } } });
  const stored = new Map(OLD_KEYS.map(key => [key, old5x5]));
  const page = boot({ stored, search: '?who=Ace' });
  assert.deepEqual(page.read('OLD_KEYS'), OLD_KEYS);
  assert.equal(page.read('state.cells.length'), CELLS);
  assert.equal(page.read('getProgress(state).count'), 0, 'a 25-square save never leaks into the new card');
  for (const key of OLD_KEYS) assert.equal(page.stored.get(key), old5x5, `${key} must survive intact`);
});

test('malformed saves are ignored without crashing or discarding another valid player', () => {
  for (const raw of ['{broken', 'null', '[]', '42', '{"version":3,"cards":null}', '{"version":2,"cards":{}}']) {
    const page = boot({ stored: new Map([[KEY, raw]]), search: '?who=Ace' });
    assert.equal(page.read('state.cells.length'), CELLS);
  }
  const setup = boot({ search: '?who=Bee' });
  setup.run('toggle(2)');
  const saved = JSON.parse(setup.stored.get(KEY));
  saved.cards.Ace = { who: 'Ace', cells: [], on: [] };
  saved.active = 'Ace';
  setup.stored.set(KEY, JSON.stringify(saved));
  const page = boot({ stored: setup.stored });
  assert.equal(page.read('state'), null);
  page.run("start('Bee')");
  assert.equal(page.read('state.on[2]'), true);
});

test('card validation rejects broken shapes and repairs the free square', () => {
  const page = boot();
  const good = fullCard();
  for (const mutate of [c => c.cells.pop(), c => c.on.pop(), c => c.on[0] = 'true',
    c => c.cells[0] = null, c => c.cells[0] = { icon: '🐾', label: '' },
    c => c.cells[0] = { icon: '🐾', label: 'x'.repeat(33) },       // the 32-character cap is enforced on load too
    c => c.cells[0] = { icon: 'x'.repeat(17), label: 'Fine' },
    c => c.who = 'Bee']) {
    const card = structuredClone(good);
    mutate(card);
    assert.equal(page.read(`validCard(${JSON.stringify(card)}, 'Ace')`), null);
  }
  good.on[FREE] = false;
  good.celebrated = [0, 0, -1, 10, '1', null];
  const repaired = page.read(`validCard(${JSON.stringify(good)}, 'Ace')`);
  assert.equal(repaired.on[FREE], true);
  assert.equal(repaired.cells[FREE].label, 'Here with you');
  assert.deepEqual(repaired.celebrated, [0]);
});

test('persisted labels and icons are escaped; arbitrary image paths and kinds are rejected', () => {
  const card = fullCard();
  card.cells[0] = { icon: '<b>hi</b>', label: '<img src=x onerror="alert(1)">', kind: 'wildlife' };
  card.cells[1] = { icon: '🐾', label: 'Safe label', art: '../private', kind: '" onclick="bad' };
  const page = boot({ stored: new Map([[KEY, JSON.stringify({ version: 3, active: 'Ace', cards: { Ace: card } })]]) });
  assert.match(page.app.innerHTML, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.equal(page.app.innerHTML.includes('<b>hi</b>'), false);
  assert.equal(page.app.innerHTML.includes('../private'), false);
  assert.equal(page.app.innerHTML.includes('onclick='), false);
  assert.equal(page.read('state.cells[1].kind'), 'together');
});

test('mark and undo preserve focus, announce changes and keep the free square marked', () => {
  const page = boot({ search: '?who=Ace' });
  page.click({ cell: '0' });
  assert.equal(page.read('state.on[0]'), true);
  assert.match(page.app.innerHTML, /data-cell="0"[^>]*aria-pressed="true"/);
  assert.equal(page.focused.at(-1).selector, '[data-cell="0"]');
  assert.equal(page.focused.at(-1).options.preventScroll, true);
  assert.match(page.announcement.textContent, /1 of 15 moments/);
  page.click({ cell: '0' });
  assert.equal(page.read('state.on[0]'), false);
  const snapshot = page.read('state');
  page.run(`toggle(${FREE}); toggle(-1); toggle(16); toggle(0.5); toggle(NaN)`);
  assert.deepEqual(page.read('state'), snapshot);
  assert.match(page.app.innerHTML, /data-cell="5"[^>]*aria-disabled="true"/);
  assert.match(page.app.innerHTML, /data-cell="5"[^>]*aria-pressed="true"/);
});

test('all four rows, four columns and both diagonals are detected independently', () => {
  const lines = boot().read('LINES');
  for (const [index, line] of lines.entries()) {
    const page = boot({ search: '?who=Ace' });
    for (const i of line) if (i !== FREE) page.run(`toggle(${i})`);
    assert.deepEqual(page.read('state.celebrated'), [index]);
    assert.equal(page.read('getProgress(state).wins.length'), 1);
    assert.match(page.announcement.textContent, /Bingo!/);
    assert.match(page.app.innerHTML, /A little victory!/);
  }
});

test('two simultaneous lines count correctly and undo does not replay a celebration', () => {
  const page = boot({ search: '?who=Ace' });
  page.run('[1,2,3,4,8,12].forEach(toggle)');           // row 1 minus 0, column 0 minus 0
  assert.equal(page.read('getProgress(state).wins.length'), 0);
  page.run('toggle(0)');
  assert.equal(page.read('getProgress(state).wins.length'), 2);
  assert.equal(page.read('state.celebrated.length'), 2);
  page.run('toggle(0)');
  assert.equal(page.read('getProgress(state).wins.length'), 0);
  page.run('toggle(0)');
  assert.equal(page.read('getProgress(state).wins.length'), 2);
  assert.doesNotMatch(page.announcement.textContent, /Bingo!/);
});

test('almost-bingo and full-card messages reflect the actual progress', () => {
  const page = boot({ search: '?who=Ace' });
  page.run('[0,1,2].forEach(toggle)');
  assert.match(page.app.innerHTML, /One little moment away/);
  page.run('state.on.forEach((on, i) => { if (!on) toggle(i); })');
  assert.equal(page.read('getProgress(state).count'), MOMENTS);
  assert.equal(page.read('getProgress(state).wins.length'), 10);
});

test('cancelling a fresh card changes nothing', () => {
  const page = boot({ search: '?who=Ace', confirmResult: false });
  page.run('toggle(1)');
  const snapshot = page.read('book');
  page.click({ action: 'reset' });
  assert.deepEqual(page.read('book'), snapshot);
  assert.equal(page.confirmations.length, 1);
});

test('confirmed fresh card clears only the selected player, photos included', () => {
  const page = boot({ search: '?who=Ace', confirmResult: true });
  page.run("toggle(1); start('Bee'); toggle(2); start('Ace')");
  page.run(`setPhoto('Ace', 3, ${JSON.stringify(jpeg())}); setPhoto('Bee', 4, ${JSON.stringify(jpeg())})`);
  const ya = page.read('book.cards.Bee');
  page.click({ action: 'reset' });
  assert.equal(page.read('getProgress(state).count'), 0);
  assert.equal(page.read("photoCount('Ace')"), 0);
  assert.equal(page.read("photoCount('Bee')"), 1, 'the other player keeps their photos');
  assert.deepEqual(page.read('book.cards.Bee'), ya);
  assert.equal(JSON.parse(page.stored.get(KEY)).active, 'Ace');
  assert.match(page.confirmations[0], /only Ace/);
});

test('blocked storage still permits both in-memory cards, with an honest warning', () => {
  const page = boot({ search: '?who=Ace', storageDenied: true, confirmResult: true });
  assert.match(page.app.innerHTML, /This browser can’t save right now/);
  page.run("toggle(6); start('Bee'); toggle(7); start('Ace')");
  assert.equal(page.read('state.on[6]'), true);
  assert.equal(page.read('book.cards.Bee.on[7]'), true);
  page.run('reset()');
  assert.equal(page.read('getProgress(state).count'), 0);
  assert.equal(page.stored.size, 0);
});

test('reduced motion creates no confetti or banner, while announcing the win', () => {
  const page = boot({ search: '?who=Ace', reducedMotion: true });
  page.run('[0,1,2,3].forEach(toggle)');
  assert.equal(page.elements.length, 0);
  assert.equal(page.timers.length, 0);
  assert.match(page.announcement.textContent, /Bingo!/);
});

test('normal celebration is brief, decorative, cleaned up, and never repeated for the same line', () => {
  const page = boot({ search: '?who=Ace', reducedMotion: false });
  page.run('[0,1,2,3].forEach(toggle)');
  assert.equal(page.elements.length, 29);
  assert.ok(page.elements.every(element => element.attributes['aria-hidden'] === 'true'));
  page.run('toggle(0); toggle(0)');
  assert.equal(page.elements.length, 29);
  page.timers.forEach(callback => callback());
  assert.ok(page.elements.every(element => element.removed));
});

/* ---------- photos ---------- */

test('only re-encoded JPEG data URLs of a sane size are accepted into the album', () => {
  const page = boot();
  assert.equal(page.read('PHOTO_MAX_EDGE'), 640);
  assert.equal(page.read('PHOTO_QUALITY'), 0.7);
  for (const good of [jpeg(), jpeg(4), 'data:image/jpeg;base64,QUJD']) {
    assert.equal(page.read(`validPhoto(${JSON.stringify(good)})`), true, good.slice(0, 40));
  }
  for (const bad of ['', 'https://example.com/cat.jpg', 'javascript:alert(1)',
    'data:image/svg+xml;base64,QUJD', 'data:text/html;base64,QUJD',
    'data:image/jpeg;base64,<script>', 'data:image/jpeg;base64,' + 'A'.repeat(700001), null, 42, {}]) {
    assert.equal(page.read(`validPhoto(${JSON.stringify(bad)})`), false, String(bad).slice(0, 40));
  }
});

test('images are shrunk to 640 pixels on the long edge, never enlarged', () => {
  const page = boot();
  assert.deepEqual(page.read('fitSize(4000, 3000)'), { width: 640, height: 480 });
  assert.deepEqual(page.read('fitSize(3000, 4000)'), { width: 480, height: 640 });
  assert.deepEqual(page.read('fitSize(640, 640)'), { width: 640, height: 640 });
  assert.deepEqual(page.read('fitSize(320, 200)'), { width: 320, height: 200 }, 'small photos are left alone');
  assert.deepEqual(page.read('fitSize(5000, 4)'), { width: 640, height: 1 }, 'never rounds an edge to zero');
  for (const bad of ['fitSize(0, 0)', 'fitSize(-5, -5)', 'fitSize(NaN, NaN)', 'fitSize(Infinity, 10)']) {
    assert.deepEqual(page.read(bad), { width: 0, height: 0 }, bad);
  }
});

test('a full album is recognised however the browser phrases it', () => {
  const page = boot();
  for (const error of [{ name: 'QuotaExceededError' }, { name: 'NS_ERROR_DOM_QUOTA_REACHED' },
    { code: 22 }, { code: 1014 }]) {
    assert.equal(page.read(`isQuotaError(${JSON.stringify(error)})`), true, JSON.stringify(error));
  }
  for (const error of [null, {}, { name: 'SecurityError' }, { code: 18 }]) {
    assert.equal(page.read(`isQuotaError(${JSON.stringify(error)})`), false, JSON.stringify(error));
  }
});

test('photos live under their own key, per player, and survive a reload', () => {
  const page = boot({ search: '?who=Ace' });
  const photo = jpeg(60);
  assert.deepEqual(page.read(`setPhoto('Ace', 2, ${JSON.stringify(photo)})`), { ok: true });
  assert.deepEqual(page.read(`setPhoto('Bee', 9, ${JSON.stringify(photo)})`), { ok: true });
  assert.notEqual(page.stored.get(PHOTO_KEY), undefined);
  assert.equal(page.stored.get(PHOTO_KEY).includes('"cells"'), false, 'the album holds no card state');
  assert.equal(page.stored.get(KEY).includes('data:image'), false, 'the card holds no photo data');
  assert.equal(page.read("photoCount('Ace')"), 1);
  assert.equal(page.read("photoCount('Bee')"), 1);

  const reloaded = boot({ search: '?who=Ace', stored: page.stored });
  assert.equal(reloaded.run("photoOf('Ace', 2)"), photo);
  assert.equal(reloaded.run("photoOf('Bee', 9)"), photo);
  assert.equal(reloaded.run("photoOf('Ace', 9)"), undefined);
  assert.deepEqual(reloaded.read("removePhoto('Ace', 2)"), { ok: true });
  assert.equal(reloaded.read("photoCount('Ace')"), 0);
  assert.deepEqual(reloaded.read("removePhoto('Ace', 2)"), { ok: true }, 'removing twice is harmless');
  assert.equal(reloaded.read("photoCount('Bee')"), 1, 'one player’s removal leaves the other alone');
});

test('a rejected or corrupt album never reaches the board', () => {
  for (const raw of ['{broken', 'null', '[]', '{"version":9,"photos":{"Ace":{"0":"data:image/jpeg;base64,QUJD"}}}',
    '{"version":1,"photos":"nope"}',
    '{"version":1,"photos":{"Ace":{"0":"javascript:alert(1)","1":"data:image/svg+xml;base64,QUJD"}}}',
    '{"version":1,"photos":{"Ace":{"99":"data:image/jpeg;base64,QUJD"}}}']) {
    const page = boot({ search: '?who=Ace', stored: new Map([[PHOTO_KEY, raw]]) });
    assert.equal(page.read("photoCount('Ace')"), 0, raw.slice(0, 40));
    assert.equal(page.read('state.cells.length'), CELLS);
    assert.equal(page.app.innerHTML.includes('javascript:'), false);
  }
  const good = boot({ search: '?who=Ace',
    stored: new Map([[PHOTO_KEY, '{"version":1,"photos":{"Ace":{"0":"data:image/jpeg;base64,QUJD"},"ZZ":{"0":"x"}}}']]) });
  assert.equal(good.read("photoCount('Ace')"), 1);
});

test('a full album fails gracefully and leaves the album and the board exactly as they were', () => {
  const page = boot({ search: '?who=Ace', fullKeys: [PHOTO_KEY] });
  const board = page.stored.get(KEY);
  assert.deepEqual(page.read(`setPhoto('Ace', 1, ${JSON.stringify(jpeg())})`), { ok: false, reason: 'full' });
  assert.equal(page.run("photoOf('Ace', 1)"), undefined, 'the in-memory album is put back');
  assert.equal(page.read("photoCount('Ace')"), 0);
  assert.equal(page.stored.get(PHOTO_KEY), undefined);
  assert.equal(page.stored.get(KEY), board, 'a full album cannot corrupt the saved card');
  assert.equal(page.read('state.cells.length'), CELLS);

  // An existing photo is restored rather than lost when the replacement will not fit.
  const kept = boot({ search: '?who=Ace' });
  const first = jpeg(20);
  kept.run(`setPhoto('Ace', 1, ${JSON.stringify(first)})`);
  kept.run('localStorage.setItem = () => { const e = Error("full"); e.name = "QuotaExceededError"; throw e; }');
  assert.deepEqual(kept.read(`setPhoto('Ace', 1, ${JSON.stringify(jpeg(80))})`), { ok: false, reason: 'full' });
  assert.equal(kept.run("photoOf('Ace', 1)"), first);
});

test('a blocked (not full) browser is reported differently, and bad input is refused', () => {
  const page = boot({ search: '?who=Ace' });
  page.run('localStorage.setItem = () => { throw Error("Denied"); }');
  assert.deepEqual(page.read(`setPhoto('Ace', 1, ${JSON.stringify(jpeg())})`), { ok: false, reason: 'blocked' });
  const clean = boot({ search: '?who=Ace' });
  for (const call of ["setPhoto('ZZ', 1, P)", "setPhoto('Ace', -1, P)", "setPhoto('Ace', 16, P)",
    "setPhoto('Ace', 1.5, P)", "setPhoto('Ace', 1, 'javascript:alert(1)')", "removePhoto('ZZ', 1)",
    "removePhoto('Ace', 99)", "clearPhotos('ZZ')"]) {
    assert.deepEqual(clean.read(call.replace(/\bP\b/, JSON.stringify(jpeg()))), { ok: false, reason: 'bad' }, call);
  }
  assert.equal(clean.stored.get(PHOTO_KEY), undefined);
});

test('each square offers a camera button; a photo turns it into the tile and a viewer', () => {
  const page = boot({ search: '?who=Ace' });
  assert.equal((page.app.innerHTML.match(/data-photo="/g) || []).length, CELLS, 'every square, free one included');
  assert.match(page.app.innerHTML, /No photos yet/);
  const photo = jpeg(24);
  page.run(`setPhoto('Ace', 4, ${JSON.stringify(photo)}); render()`);
  assert.match(page.app.innerHTML, /class="cell-photo" src="data:image\/jpeg;base64,/);
  assert.match(page.app.innerHTML, /class="cell[^"]*has-photo"[^>]*data-cell="4"/);
  assert.match(page.app.innerHTML, /data-view-photo="4"/);
  assert.equal(page.app.innerHTML.includes('data-photo="4"'), false, 'that square now opens its photo instead');
  assert.match(page.app.innerHTML, /1 photo tucked into this card/);
  assert.match(page.app.innerHTML, /aria-label="[^"]*\. Has a photo\. Row 2, column 1"/);
});

test('the camera button opens a real image picker and never uploads anything', () => {
  const page = boot({ search: '?who=Ace' });
  page.click({ photo: '3' });
  const input = page.created.at(-1);
  assert.equal(input.tag, 'input');
  assert.equal(input.type, 'file');
  assert.equal(input.accept, 'image/*');
  assert.equal(input.clicks, 1);
  assert.equal(typeof input.handlers.change, 'function');
  input.handlers.change();                      // no file chosen: nothing should happen
  assert.equal(page.read("photoCount('Ace')"), 0);
  assert.equal(source.includes('fetch('), false, 'photos never leave the phone');
  assert.equal(source.includes('XMLHttpRequest'), false);
  page.click({ photo: '99' });
  assert.equal(page.created.length, 1, 'an impossible square opens no picker');
});

test('the lightbox shows the photo large, closes on Escape, and can remove it', () => {
  const page = boot({ search: '?who=Ace' });
  page.run(`setPhoto('Ace', 6, ${JSON.stringify(jpeg(24))}); render()`);
  page.click({ viewPhoto: '6' });
  assert.match(page.app.innerHTML, /class="photo-lightbox" role="dialog" aria-modal="true"/);
  assert.match(page.app.innerHTML, /Stays on this phone\. Nothing is uploaded\./);
  assert.match(page.app.innerHTML, /data-action="remove-photo"/);
  assert.equal(page.focused.at(-1).selector, '.photo-close');

  page.docListeners.keydown({ key: 'a' });
  assert.notEqual(page.read('lightbox'), null);
  page.docListeners.keydown({ key: 'Escape' });
  assert.equal(page.read('lightbox'), null);
  assert.equal(page.app.innerHTML.includes('photo-lightbox'), false);

  page.click({ viewPhoto: '6' });
  page.click({ action: 'remove-photo' });
  assert.equal(page.read("photoCount('Ace')"), 0);
  assert.equal(page.read('lightbox'), null);
  assert.match(page.announcement.textContent, /Photo removed from/);
  assert.equal(page.app.innerHTML.includes('cell-photo"'), false);
  page.click({ viewPhoto: '6' });
  assert.equal(page.read('lightbox'), null, 'a square with no photo has nothing to open');
});

test('a full album tells you kindly, and offers the way out', async () => {
  const page = boot({ search: '?who=Ace', fullKeys: [PHOTO_KEY] });
  page.run(`downscale = () => Promise.resolve(${JSON.stringify(jpeg(24))})`);
  await page.run('attachPhoto(2, { type: "image/jpeg" })');
  assert.match(page.app.innerHTML, /Our little album is full/);
  assert.match(page.app.innerHTML, /remove it to make room/);
  assert.match(page.announcement.textContent, /album is full/);
  assert.equal(page.read("photoCount('Ace')"), 0);
  assert.equal(page.read('state.cells.length'), CELLS, 'the board is untouched');

  const ok = boot({ search: '?who=Ace' });
  ok.run(`downscale = () => Promise.resolve(${JSON.stringify(jpeg(24))})`);
  await ok.run('attachPhoto(2, { type: "image/jpeg" })');
  assert.equal(ok.read("photoCount('Ace')"), 1);
  assert.match(ok.announcement.textContent, /Photo added to .*1 photo in this card/);
  assert.equal(ok.app.innerHTML.includes('album is full'), false);

  const sad = boot({ search: '?who=Ace' });
  sad.run('downscale = () => Promise.reject(Error("nope"))');
  await sad.run('attachPhoto(2, { type: "image/jpeg" })');
  assert.match(sad.app.innerHTML, /didn’t want to come along/);
  assert.equal(sad.read("photoCount('Ace')"), 0);
});

/* ---------- the little end screen ---------- */

test('the summary is always one tap away and reads gently', () => {
  const page = boot({ search: '?who=Ace' });
  assert.match(page.app.innerHTML, /data-action="summary"/);
  page.run(`[0,1,2,7,11].forEach(toggle); setPhoto('Ace', 7, ${JSON.stringify(jpeg(24))})`);
  page.click({ action: 'summary' });
  assert.equal(page.read('view'), 'summary');
  assert.match(page.app.innerHTML, /<strong>5<\/strong><span>of 15 squares marked/);
  assert.match(page.app.innerHTML, /<strong>1<\/strong><span>photo kept/);
  assert.match(page.app.innerHTML, /<strong>0<\/strong><span>lines finished/);
  assert.match(page.app.innerHTML, /A good handful of moments/);
  assert.match(page.app.innerHTML, /<li>.*summary-photo-tag">with a photo/, 'the photographed square is flagged');
  assert.equal(page.app.innerHTML.includes('data-cell='), false, 'the summary replaces the grid');
  assert.equal(page.focused.at(-1).selector, '#bingo-heading');
  assert.match(page.announcement.textContent, /5 of 15 squares marked, 1 photo kept/);

  page.click({ action: 'board' });
  assert.equal(page.read('view'), 'board');
  assert.match(page.app.innerHTML, /data-cell="0"/);
});

test('an empty and a finished card both get a warm, uncompetitive line', () => {
  const empty = boot({ search: '?who=Ace' });
  empty.click({ action: 'summary' });
  assert.match(empty.app.innerHTML, /<strong>0<\/strong>/);
  assert.match(empty.app.innerHTML, /still a whole night in front of you/);
  assert.match(empty.app.innerHTML, /the night still counted/);
  for (const word of ['lose', 'loser', 'failed', 'score:', 'poor']) {
    assert.equal(empty.app.innerHTML.toLowerCase().includes(word), false, word);
  }
  const messages = ['warmLine(15, 0)', 'warmLine(12, 2)', 'warmLine(6, 0)', 'warmLine(1, 0)',
    'warmLine(0, 1)', 'warmLine(0, 0)'].map(call => empty.read(call));
  assert.equal(new Set(messages).size, messages.length);
  assert.ok(messages.every(message => message.length > 20));
});

test('a completed card opens the summary by itself, still announcing the last bingo', () => {
  const page = boot({ search: '?who=Ace' });
  page.run('state.on.forEach((on, i) => { if (!on && i !== 15) toggle(i); })');
  assert.equal(page.read('view'), 'board');
  page.run('toggle(15)');
  assert.equal(page.read('view'), 'summary');
  assert.match(page.app.innerHTML, /<strong>15<\/strong><span>of 15 squares marked/);
  assert.match(page.app.innerHTML, /Every square is a bit of tonight/);
  assert.match(page.announcement.textContent, /Bingo!/);
  assert.match(page.announcement.textContent, /How our night went\. 15 of 15 squares marked/);

  page.click({ action: 'board' });
  page.run('toggle(15); toggle(15)');            // going back and forth does not re-trigger it
  assert.equal(page.read('view'), 'summary');
  page.click({ action: 'board' });
  page.run('toggle(15)');
  assert.equal(page.read('view'), 'board');
});

test('switching player from the summary returns to that player’s board', () => {
  const page = boot({ search: '?who=Ace' });
  page.click({ action: 'summary' });
  page.click({ player: 'Bee' });
  assert.equal(page.read('view'), 'board');
  assert.equal(page.read('state.who'), 'Bee');
  assert.equal(page.read('lightbox'), null);
});

/* ---------- one keepsake image ---------- */

test('the contact sheet lays out one photo through sixteen without breaking', () => {
  const page = boot();
  for (const nothing of ['sheetLayout(0)', 'sheetLayout(-3)', 'sheetLayout(NaN)', 'sheetLayout(0.4)',
    "sheetLayout('lots')", 'sheetLayout(null)']) {
    assert.equal(page.read(nothing), null, nothing);
  }
  assert.equal(page.read('sheetLayout(99).frames.length'), CELLS, 'a card only ever holds sixteen');

  for (let count = 1; count <= CELLS; count++) {
    const layout = page.read(`sheetLayout(${count})`);
    const where = `${count} photo(s)`;
    assert.equal(layout.width, 1080, where);
    assert.equal(layout.frames.length, count, where);
    assert.ok(layout.cols >= 1 && layout.cols <= 4, `${where}: ${layout.cols} columns`);
    assert.ok(layout.rows * layout.cols >= count && (layout.rows - 1) * layout.cols < count, where);
    // Tall enough for the title, the rows and the warm line, and never an absurd scroll.
    assert.ok(layout.height > 700 && layout.height < 2600, `${where}: ${layout.height}px tall`);
    assert.ok(layout.height / layout.width < 2.4, `${where}: too long and thin`);
    assert.ok(layout.photo.w >= 180 && layout.photo.w === layout.photo.h, `${where}: ${layout.photo.w}px photos`);
    assert.equal(layout.cell.h, layout.photo.h + 24 + 46, where);

    for (const frame of layout.frames) {
      assert.equal(frame.w, layout.cell.w, where);
      assert.equal(frame.h, layout.cell.h, where);
      assert.ok(frame.x >= 8 && frame.x + frame.w <= layout.width - 8, `${where}: off the side`);
      assert.ok(frame.y >= 150, `${where}: sitting on the title`);
      assert.ok(frame.y + frame.h <= layout.height - 100, `${where}: sitting on the warm line`);
      assert.ok(Math.abs(frame.tilt) > 0 && Math.abs(frame.tilt) <= 2.5, `${where}: ${frame.tilt}deg is not a gentle tilt`);
    }
    // No two polaroids share a patch of paper.
    for (let a = 0; a < count; a++) {
      for (let b = a + 1; b < count; b++) {
        const one = layout.frames[a];
        const two = layout.frames[b];
        const apart = one.x + one.w <= two.x || two.x + two.w <= one.x ||
          one.y + one.h <= two.y || two.y + two.h <= one.y;
        assert.ok(apart, `${where}: frames ${a} and ${b} overlap`);
      }
    }
    // Every row, including a short last one, is centred on the page.
    const byRow = new Map();
    for (const frame of layout.frames) byRow.set(frame.row, [...(byRow.get(frame.row) || []), frame]);
    for (const [row, frames] of byRow) {
      const left = Math.min(...frames.map(frame => frame.x));
      const right = Math.max(...frames.map(frame => frame.x + frame.w));
      assert.ok(Math.abs((left + right) / 2 - layout.width / 2) <= 1, `${where}: row ${row} is off-centre`);
    }
  }
  // The tilt alternates, so the sheet reads as taped in rather than machine-set.
  const tilts = page.read('sheetLayout(16).frames').map(frame => frame.tilt);
  for (let i = 1; i < tilts.length; i++) assert.ok(tilts[i] * tilts[i - 1] < 0, 'tilts alternate');
});

test('long square labels are trimmed cleanly under each photo', () => {
  const page = boot();
  assert.equal(page.read("clipLabel('Short one', 20)"), 'Short one');
  assert.equal(page.read("clipLabel('  spaced   out  ', 40)"), 'spaced out');
  for (const empty of ['clipLabel(null, 20)', 'clipLabel(undefined, 20)', "clipLabel('', 20)", "clipLabel('   ', 20)"]) {
    assert.equal(page.read(empty), '', empty);
  }
  // A word boundary is preferred when one is close enough to the end.
  assert.equal(page.read("clipLabel('Two animals sitting close together', 24)"), 'Two animals sitting…');
  // One unbroken word is still cut rather than allowed to run off the polaroid.
  assert.equal(page.read(`clipLabel('${'z'.repeat(60)}', 12)`), 'z'.repeat(11) + '…');
  const long = 'An Asian small-clawed otter having a lovely time';
  const cut = page.read(`clipLabel(${JSON.stringify(long)}, 20)`);
  assert.ok(cut.length <= 20, `"${cut}" is ${cut.length} characters`);
  assert.match(cut, /…$/);
  assert.doesNotMatch(cut, /[\s,.;:!?-]…$/, 'no dangling space or comma before the ellipsis');
  assert.ok(long.startsWith(cut.slice(0, -1)), 'the trim keeps the front of the label');
  // Every real label fits its caption at every sheet width.
  const labels = [...page.read('WILDLIFE'), ...page.read('TOGETHER'), page.read('FREE_CELL')].map(cell => cell.label);
  for (const count of [1, 4, 9, 16]) {
    const layout = page.read(`sheetLayout(${count})`);
    assert.ok(layout.labelMax >= 12 && layout.labelMax <= 34, `labelMax ${layout.labelMax}`);
    for (const label of [...labels, 'x'.repeat(32), 'A truly enormous label that nobody could ever type']) {
      const text = page.read(`clipLabel(${JSON.stringify(label)}, ${layout.labelMax})`);
      assert.ok(text.length > 0 && text.length <= layout.labelMax, `"${text}" at ${count} photos`);
      assert.ok(text.length * layout.labelSize * 0.55 <= layout.cell.w - 12,
        `"${text}" is wider than a ${layout.cell.w}px polaroid`);
    }
  }
});

test('photos are centre-cropped to fill their square without squashing anyone', () => {
  const page = boot();
  assert.deepEqual(page.read('coverRect(640, 480, 200, 200)'), { x: 80, y: 0, w: 480, h: 480 });
  assert.deepEqual(page.read('coverRect(480, 640, 200, 200)'), { x: 0, y: 80, w: 480, h: 480 });
  assert.deepEqual(page.read('coverRect(300, 300, 225, 225)'), { x: 0, y: 0, w: 300, h: 300 });
  for (const bad of ['coverRect(0, 100, 10, 10)', 'coverRect(100, 0, 10, 10)', 'coverRect(100, 100, 0, 10)',
    'coverRect(NaN, 100, 10, 10)']) {
    assert.equal(page.read(bad), null, bad);
  }
});

test('a photo that will not decode is left out rather than spoiling the whole sheet', async () => {
  const page = boot({ search: '?who=Ace' });
  const fine = jpeg(20);
  const shy = jpeg(26);
  page.run(`setPhoto('Ace', 0, ${JSON.stringify(fine)}); setPhoto('Ace', 1, ${JSON.stringify(shy)});
    setPhoto('Ace', 2, ${JSON.stringify(fine)})`);
  page.run(`
    globalThis.sketch = null;
    loadPhoto = url => Promise.resolve(url === ${JSON.stringify(shy)} ? null : { naturalWidth: 640, naturalHeight: 480 });
    drawSheet = (ctx, layout, items, meta) => { sketch = { count: items.length,
      labels: items.map(item => item.label), height: layout.height, meta }; };
    canvasBlob = () => Promise.resolve({ drawnAt: Date.now() });
    document.createElement = tag => ({ tag, getContext: () => ({}) });
  `);
  const sheet = await page.run("composeSheet('Ace')");
  assert.equal(sheet.drawn, 2);
  assert.equal(sheet.missed, 1);
  const sketch = page.read('sketch');
  assert.equal(sketch.count, 2);
  assert.deepEqual(sketch.labels, [page.read('state.cells[0].label'), page.read('state.cells[2].label')]);
  assert.match(sketch.meta.subtitle, /^Ace’s little collection · \d+ \w+ \d{4}$/);
  assert.ok(sketch.meta.warm.length > 20);

  page.run('loadPhoto = () => Promise.resolve(null)');
  assert.equal(await page.run("composeSheet('Ace')"), null, 'not one photo opened, so there is nothing to draw');
  assert.equal(await page.run("composeSheet('Bee')"), null, 'a player with no card has no sheet');
});

test('a full sixteen photos all reach the sheet, in board order', async () => {
  const page = boot({ search: '?who=Ace' });
  page.run(`for (let i = 0; i < 16; i++) setPhoto('Ace', i, 'data:image/jpeg;base64,' + 'A'.repeat(20 + i * 4) + '==')`);
  assert.equal(page.read("photoCount('Ace')"), CELLS);
  page.run(`
    globalThis.sketch = null;
    loadPhoto = () => Promise.resolve({ naturalWidth: 640, naturalHeight: 640 });
    drawSheet = (ctx, layout, items) => { sketch = { count: items.length, indexes: items.map(item => item.index),
      frames: layout.frames.length, height: layout.height }; };
    canvasBlob = () => Promise.resolve({ ok: true });
    document.createElement = tag => ({ tag, getContext: () => ({}) });
  `);
  const sheet = await page.run("composeSheet('Ace')");
  assert.equal(sheet.drawn, CELLS);
  assert.equal(sheet.missed, 0);
  const sketch = page.read('sketch');
  assert.equal(sketch.frames, CELLS);
  assert.deepEqual(sketch.indexes, Array.from({ length: CELLS }, (_, i) => i));
});

test('the end screen offers the keepsake, and explains itself when there is nothing to save', () => {
  const empty = boot({ search: '?who=Ace' });
  empty.click({ action: 'summary' });
  assert.match(empty.app.innerHTML, /data-action="keepsake"[^>]*disabled/);
  assert.match(empty.app.innerHTML, /No photos on this card yet/);
  empty.click({ action: 'keepsake' });
  assert.match(empty.announcement.textContent, /No photos on this card yet/);
  assert.equal(empty.created.length, 0, 'an empty card draws nothing at all');

  const page = boot({ search: '?who=Ace' });
  page.run(`setPhoto('Ace', 0, ${JSON.stringify(jpeg(24))})`);
  page.click({ action: 'summary' });
  assert.doesNotMatch(page.app.innerHTML, /data-action="keepsake"[^>]*disabled/);
  assert.match(page.app.innerHTML, /1 photo, one little picture/);
  assert.match(page.app.innerHTML, /photo lives on this phone only/, 'the note is in the singular');
  assert.match(page.app.innerHTML, /data-action="backup"/);
  assert.match(page.app.innerHTML, /data-action="restore"/);
  assert.equal(page.app.innerHTML.includes('data-cell='), false, 'still no grid on the end screen');
});

test('a saved keepsake prefers the share sheet, then a download, then a new tab', async () => {
  const make = "makeBlob(['x'], 'image/jpeg'), 'ours.jpg', { title: 'Our Night Safari', text: 'hello' }";

  const shared = equip(boot(), { share: 'ok' });
  assert.equal((await shared.run(`deliverImage(${make})`)).how, 'share');
  assert.deepEqual(shared.read('tally.shared'), ['ours.jpg']);
  assert.equal(shared.created.length, 0, 'a successful share starts no download');

  // Backing out of the share sheet is a normal thing to do, not a failure.
  const bailed = equip(boot(), { share: 'cancel' });
  assert.equal((await bailed.run(`deliverImage(${make})`)).how, 'cancelled');
  assert.equal(bailed.created.length, 0, 'cancelling does not fall through to a download');

  // A share that genuinely breaks does fall through.
  const broke = equip(boot(), { share: 'broken' });
  assert.equal((await broke.run(`deliverImage(${make})`)).how, 'download');

  const down = equip(boot(), { share: 'cannot' });
  assert.equal((await down.run(`deliverImage(${make})`)).how, 'download');
  const anchor = down.created.at(-1);
  assert.equal(anchor.tag, 'a');
  assert.equal(anchor.download, 'ours.jpg');
  assert.equal(anchor.href, 'blob:0');
  assert.equal(anchor.clicks, 1);
  assert.deepEqual(down.read('tally.live'), ['blob:0'], 'the URL lives until the browser has taken the file');
  down.timers.forEach(callback => callback());
  assert.deepEqual(down.read('tally.revoked'), ['blob:0'], 'and is revoked afterwards');
  assert.deepEqual(down.read('tally.live'), []);

  const tab = equip(boot(), { download: false });
  assert.equal((await tab.run(`deliverImage(${make})`)).how, 'tab');
  assert.deepEqual(tab.read('tally.opened'), ['blob:0']);

  const stuck = equip(boot(), { download: false, tab: false });
  assert.equal((await stuck.run(`deliverImage(${make})`)).how, 'stuck');

  const page = boot();
  for (const quiet of ['wasCancelled(null)', "wasCancelled({ name: 'AbortError' })",
    "wasCancelled({ message: 'Share canceled' })", "wasCancelled({ message: 'user aborted' })"]) {
    assert.equal(page.read(quiet), true, quiet);
  }
  for (const real of ["wasCancelled({ name: 'NotAllowedError', message: 'no gesture' })",
    "wasCancelled({ name: 'TypeError', message: 'bad file' })"]) {
    assert.equal(page.read(real), false, real);
  }
  assert.match(page.read("keepsakeName('Ace', 0)"), /^night-safari-Ace-1970-01-01\.jpg$/);
  assert.equal(page.read("keepsakeName('Bee', NaN)"), 'night-safari-Bee-night.jpg');
  assert.ok(page.read('warmSheetLine(1)') !== page.read('warmSheetLine(16)'));
});

test('saving the keepsake says how it went, and never leaves the button stuck', async () => {
  const stubs = `
    loadPhoto = () => Promise.resolve({ naturalWidth: 640, naturalHeight: 480 });
    drawSheet = () => {};
    document.createElement = tag => ({ tag, getContext: () => ({}), click() {}, addEventListener() {} });
  `;
  const page = equip(boot({ search: '?who=Ace' }), { share: 'ok' });
  page.run(`setPhoto('Ace', 0, ${JSON.stringify(jpeg(20))}); setPhoto('Ace', 1, ${JSON.stringify(jpeg(24))})`);
  page.run(`${stubs}
    globalThis.release = null;
    canvasBlob = () => new Promise(resolve => { release = () => resolve(makeBlob(['x'], 'image/jpeg')); });
  `);
  page.click({ action: 'summary' });
  const saving = page.run('saveKeepsake()');
  assert.equal(page.read('working'), true);
  assert.match(page.app.innerHTML, /Making your picture…/);
  assert.match(page.app.innerHTML, /data-action="keepsake"[^>]*disabled/, 'no double-tapping mid-draw');
  page.click({ action: 'keepsake' });                      // a second tap while drawing is ignored
  await new Promise(resolve => setImmediate(resolve));     // let the photos finish decoding
  page.run('release()');
  await saving;
  assert.equal(page.read('working'), false);
  assert.match(page.read('keepsakeNote'), /Save Image/);
  assert.match(page.read('tally.shared')[0], /^night-safari-Ace-\d{4}-\d{2}-\d{2}\.jpg$/);
  assert.doesNotMatch(page.app.innerHTML, /data-action="keepsake"[^>]*disabled/, 'and it is offered again');

  // Backing out of the share sheet reads as a shrug, not a failure, and one shy photo is owned up to.
  const shy = jpeg(26);
  const bailed = equip(boot({ search: '?who=Ace' }), { share: 'cancel' });
  bailed.run(`setPhoto('Ace', 0, ${JSON.stringify(jpeg(20))}); setPhoto('Ace', 1, ${JSON.stringify(shy)})`);
  bailed.run(`${stubs}
    loadPhoto = url => Promise.resolve(url === ${JSON.stringify(shy)} ? null : { naturalWidth: 640, naturalHeight: 480 });
    canvasBlob = () => Promise.resolve(makeBlob(['x'], 'image/jpeg'));
  `);
  bailed.click({ action: 'summary' });
  await bailed.run('saveKeepsake()');
  assert.equal(bailed.read('working'), false);
  assert.match(bailed.read('keepsakeNote'), /No trouble at all/);
  assert.match(bailed.read('keepsakeNote'), /1 photo wouldn’t open/);
  for (const alarming of ['Error', 'error', 'failed']) {
    assert.equal(bailed.read('keepsakeNote').includes(alarming), false, alarming);
  }

  // If drawing itself gives up, the button comes back rather than sulking forever.
  const sad = equip(boot({ search: '?who=Ace' }), { share: 'ok' });
  sad.run(`setPhoto('Ace', 0, ${JSON.stringify(jpeg(20))})`);
  sad.run(`${stubs} composeSheet = () => Promise.reject(Error('no canvas here'));`);
  sad.click({ action: 'summary' });
  await sad.run('saveKeepsake()');
  assert.equal(sad.read('working'), false);
  assert.match(sad.read('keepsakeNote'), /Try again in a moment/);
});

/* ---------- a backup you can hold ---------- */

test('a backup file holds one player’s card, marks and photos, and nothing else', () => {
  const page = boot({ search: '?who=Ace' });
  const mine = jpeg(30);
  const theirs = jpeg(44);
  page.run(`toggle(0); toggle(1); setPhoto('Ace', 0, ${JSON.stringify(mine)});
    start('Bee'); toggle(3); setPhoto('Bee', 3, ${JSON.stringify(theirs)}); start('Ace')`);
  const backup = page.read("backupOf('Ace')");
  assert.equal(backup.app, 'ns-bingo');
  assert.equal(backup.version, 1);
  assert.equal(backup.who, 'Ace');
  assert.match(backup.savedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(backup.card.who, 'Ace');
  assert.equal(backup.card.cells.length, CELLS);
  assert.deepEqual(backup.card.on, page.read('book.cards.Ace.on'));
  assert.deepEqual(backup.card.celebrated, []);
  assert.ok(backup.card.started > 0, 'the night the card began travels with it');
  assert.deepEqual(Object.keys(backup.photos), ['0']);
  assert.equal(backup.photos[0], mine);
  assert.equal(JSON.stringify(backup).includes(theirs), false, 'the other player is not in this file');
  assert.equal(page.read("backupOf('ZZ')"), null);
  assert.equal(boot().read("backupOf('Ace')"), null, 'no card, no backup');
  assert.match(page.read("backupName('Ace')"), /^night-safari-bingo-Ace-\d{4}-\d{2}-\d{2}\.json$/);

  // It survives its own round trip, exactly.
  const back = page.read(`validBackup(${JSON.stringify(backup)})`);
  assert.equal(back.ok, true);
  assert.equal(back.who, 'Ace');
  assert.equal(back.skipped, 0);
  assert.deepEqual(back.card, page.read('book.cards.Ace'));
  assert.deepEqual(back.photos, { 0: mine });
});

test('a restore file is checked strictly and refused kindly, one reason at a time', () => {
  const page = boot({ search: '?who=Ace' });
  const good = () => ({ app: 'ns-bingo', version: 1, savedAt: '2026-09-03T12:00:00.000Z', who: 'Ace',
    card: fullCard('Ace'), photos: { 3: jpeg(20) } });
  const check = value => page.read(`validBackup(${JSON.stringify(value)})`);
  const twist = change => { const value = good(); change(value); return value; };

  const refusals = [
    ['shape', null], ['shape', 42], ['shape', 'a string'], ['shape', []], ['shape', {}],
    ['shape', twist(value => { value.app = 'something-else'; })],
    ['shape', twist(value => { delete value.app; })],
    ['shape', twist(value => { value.version = '1'; })],
    ['shape', twist(value => { value.version = 1.5; })],
    ['shape', twist(value => { delete value.version; })],
    ['version', twist(value => { value.version = 2; })],       // a file from a newer card
    ['version', twist(value => { value.version = 99; })],
    ['version', twist(value => { value.version = 0; })],
    ['player', twist(value => { value.who = 'Bob'; })],
    ['player', twist(value => { value.who = '__proto__'; })],
    ['player', twist(value => { delete value.who; })],
    ['card', twist(value => { delete value.card; })],
    ['card', twist(value => { value.card = null; })],
    ['card', twist(value => { value.card.cells.pop(); })],
    ['card', twist(value => { value.card.on[0] = 'yes'; })],
    ['card', twist(value => { value.card.who = 'Bee'; })],       // the card must belong to the named player
    ['card', twist(value => { value.card.cells[2].label = 'x'.repeat(33); })],
    ['photos', twist(value => { value.photos = 'nope'; })],
    ['photos', twist(value => { value.photos = []; })],
    ['photos', twist(value => { value.photos = null; })],
  ];
  for (const [reason, value] of refusals) {
    const result = check(value);
    assert.equal(result.ok, false, `${reason}: ${JSON.stringify(value).slice(0, 60)}`);
    assert.equal(result.reason, reason, JSON.stringify(value).slice(0, 70));
    assert.ok(result.message.length > 20, reason);
    assert.match(result.message, /[Nn]othing has changed/, reason);
  }
  assert.equal(check(undefined).ok, false);
  assert.equal(page.stored.get(KEY) !== undefined && page.stored.size <= 1, true, 'checking a file writes nothing');

  // Unreadable text never throws; it comes back as a polite refusal.
  for (const raw of ["readBackup('{not json')", 'readBackup(undefined)', "readBackup('')",
    "readBackup('<html>')"]) {
    assert.equal(page.read(raw).reason, 'unreadable', raw);
  }
  assert.equal(page.read("readBackup('null')").reason, 'shape');
  assert.equal(page.read(`readBackup(${JSON.stringify(JSON.stringify(good()))})`).ok, true);

  // A photo missing an eye is dropped; the rest of the evening still comes home.
  const messy = twist(value => {
    value.photos = { 0: jpeg(20), 1: 'data:image/jpeg;base64,<script>', 2: 'javascript:alert(1)',
      3: 'data:image/png;base64,QUJD', 99: jpeg(8), later: jpeg(8) };
  });
  const salvaged = check(messy);
  assert.equal(salvaged.ok, true);
  assert.deepEqual(Object.keys(salvaged.photos), ['0']);
  assert.equal(salvaged.skipped, 5);
  const none = check(twist(value => { delete value.photos; }));
  assert.equal(none.ok, true);
  assert.deepEqual(none.photos, {});
});

test('a confirmed restore brings back one player’s squares and photos, and only theirs', () => {
  const source = boot({ search: '?who=Ace' });
  source.run(`[0,1,2].forEach(toggle); setPhoto('Ace', 0, ${JSON.stringify(jpeg(24))});
    setPhoto('Ace', 1, ${JSON.stringify(jpeg(28))})`);
  const file = JSON.stringify(source.read("backupOf('Ace')"));
  const wanted = source.read('book.cards.Ace');

  const page = boot({ search: '?who=Ace', confirmResult: true });
  page.run(`toggle(7); start('Bee'); toggle(11); setPhoto('Bee', 11, ${JSON.stringify(jpeg(20))})`);
  const ya = page.read('book.cards.Bee');
  page.click({ action: 'summary' });
  assert.equal(page.run(`takeBackup(${JSON.stringify(file)})`), true);
  assert.equal(page.confirmations.length, 1, 'an existing card is never replaced without asking');
  assert.match(page.confirmations[0], /Ace’s squares and photos/);
  assert.match(page.confirmations[0], /Bee’s card stays safe/);
  assert.deepEqual(page.read('book.cards.Ace'), wanted);
  assert.deepEqual(page.read('book.cards.Bee'), ya, 'the other player is untouched');
  assert.equal(page.read("photoCount('Ace')"), 2);
  assert.equal(page.read("photoCount('Bee')"), 1);
  assert.equal(page.read('state.who'), 'Ace');
  assert.equal(page.read('view'), 'board');
  assert.match(page.app.innerHTML, /Ace’s card is back: 3 of 15 squares and 2 photos/);
  assert.match(page.announcement.textContent, /Ace’s card is back/);

  const reloaded = boot({ stored: page.stored });
  assert.deepEqual(reloaded.read('book.cards.Ace'), wanted, 'and it is still there after a reload');
  assert.equal(reloaded.read("photoCount('Ace')"), 2);
  assert.equal(reloaded.read("photoCount('Bee')"), 1);
});

test('declining the question changes nothing at all', () => {
  const source = boot({ search: '?who=Ace' });
  source.run('toggle(4)');
  const file = JSON.stringify(source.read("backupOf('Ace')"));

  const page = boot({ search: '?who=Ace', confirmResult: false });
  page.run(`toggle(9); setPhoto('Ace', 9, ${JSON.stringify(jpeg(20))})`);
  const before = page.read('book');
  const album = page.read('album');
  assert.equal(page.run(`takeBackup(${JSON.stringify(file)})`), false);
  assert.equal(page.confirmations.length, 1);
  assert.deepEqual(page.read('book'), before);
  assert.deepEqual(page.read('album'), album);
  assert.match(page.read('keepsakeNote'), /exactly as it was/);
});

test('a backup for the other player restores their card without touching yours', () => {
  const source = boot({ search: '?who=Bee' });
  source.run(`toggle(3); setPhoto('Bee', 3, ${JSON.stringify(jpeg(20))})`);
  const file = JSON.stringify(source.read("backupOf('Bee')"));

  const page = boot({ search: '?who=Ace', confirmResult: true });
  const xj = page.read('book.cards.Ace');
  assert.equal(page.run(`takeBackup(${JSON.stringify(file)})`), true);
  assert.equal(page.confirmations.length, 0, 'there was no Bee card here, so there was nothing to ask about');
  assert.equal(page.read('state.who'), 'Bee');
  assert.deepEqual(page.read('book.cards.Ace'), xj, 'Ace’s card is left exactly alone');
  assert.equal(page.read("photoCount('Bee')"), 1);
  assert.equal(page.read("photoCount('Ace')"), 0);
  assert.match(page.announcement.textContent, /Bee’s card is back/);
});

test('a restore that will not fit puts the card and the album back exactly as they were', () => {
  const source = boot({ search: '?who=Ace' });
  source.run(`[1,2,3].forEach(toggle); setPhoto('Ace', 1, ${JSON.stringify(jpeg(400))})`);
  const file = JSON.stringify(source.read("backupOf('Ace')"));

  // The photos are the bulky write, so a full phone is discovered before the card is touched.
  const full = boot({ search: '?who=Ace', confirmResult: true });
  full.run(`toggle(9); setPhoto('Ace', 9, ${JSON.stringify(jpeg(20))})`);
  const bookBefore = full.read('book');
  const albumBefore = full.read('album');
  const diskBefore = new Map(full.stored);
  full.run('localStorage.setItem = () => { const e = Error("full"); e.name = "QuotaExceededError"; throw e; }');
  assert.equal(full.run(`takeBackup(${JSON.stringify(file)})`), false);
  assert.deepEqual(full.read('book'), bookBefore, 'the board is never half-written');
  assert.deepEqual(full.read('album'), albumBefore);
  assert.equal(full.read('state.on[9]'), true);
  assert.deepEqual([...full.stored], [...diskBefore]);
  assert.match(full.read('keepsakeNote'), /isn’t room on this phone/);
  assert.match(full.read('keepsakeNote'), /nothing was changed/);

  // And if the card write is the one that fails, the album is put back too.
  const card = boot({ search: '?who=Ace', confirmResult: true, fullKeys: [KEY] });
  card.run(`toggle(9); setPhoto('Ace', 9, ${JSON.stringify(jpeg(20))})`);
  const keptBook = card.read('book');
  const keptAlbum = card.read('album');
  const keptDisk = card.stored.get(PHOTO_KEY);
  assert.equal(card.run(`takeBackup(${JSON.stringify(file)})`), false);
  assert.deepEqual(card.read('book'), keptBook);
  assert.deepEqual(card.read('album'), keptAlbum);
  assert.equal(card.stored.get(PHOTO_KEY), keptDisk, 'the saved album is rolled back as well');
  assert.equal(card.read("photoCount('Ace')"), 1);
  assert.match(card.read('keepsakeNote'), /nothing was changed/);
});

test('a phone that cannot save at all still hands over a backup, and admits a restore did not happen', () => {
  const source = boot({ search: '?who=Ace' });
  source.run('toggle(4)');
  const file = JSON.stringify(source.read("backupOf('Ace')"));

  const page = equip(boot({ search: '?who=Ace', storageDenied: true, confirmResult: true }));
  page.click({ action: 'summary' });
  page.click({ action: 'backup' });
  const anchor = page.created.at(-1);
  assert.equal(anchor.tag, 'a');
  assert.match(anchor.download, /^night-safari-bingo-Ace-/);
  assert.match(page.read('keepsakeNote'), /Backed up Ace’s card and 0 photos/);

  const before = page.read('book');
  assert.equal(page.run(`takeBackup(${JSON.stringify(file)})`), false);
  assert.deepEqual(page.read('book'), before, 'nothing half-written when nothing can be written');
  assert.match(page.read('keepsakeNote'), /won’t save right now, so nothing was changed/);
});

test('the photos-only-live-here truth is told plainly, once per screen', () => {
  const page = boot({ search: '?who=Ace' });
  assert.match(page.app.innerHTML, /No photos yet/);
  page.run(`setPhoto('Ace', 0, ${JSON.stringify(jpeg(24))}); render()`);
  assert.match(page.app.innerHTML, /kept on this phone only\. Worth saving at the end of the night/);
  assert.equal((page.app.innerHTML.match(/Worth saving at the end of the night/g) || []).length, 1, 'said once');
  assert.match(page.app.innerHTML, /clearing this browser takes them with it/, 'the field guide is honest too');

  const blocked = boot({ search: '?who=Ace', storageDenied: true });
  assert.match(blocked.app.innerHTML, /This browser can’t save right now/);
  assert.match(blocked.app.innerHTML, /photos won’t be kept/);
  assert.equal(blocked.app.innerHTML.includes('Worth saving at the end of the night'), false,
    'one warning per screen, not two');
  blocked.click({ action: 'summary' });
  assert.match(blocked.app.innerHTML, /isn’t keeping anything tonight/);
  assert.equal((blocked.app.innerHTML.match(/isn’t keeping anything tonight/g) || []).length, 1);

  // Calm, not shouty.
  for (const shouty of ['WARNING', 'Warning', '⚠', 'lost forever', 'Danger', '!!']) {
    assert.equal(page.app.innerHTML.includes(shouty), false, shouty);
    assert.equal(blocked.app.innerHTML.includes(shouty), false, shouty);
  }
});

/* ---------- plumbing ---------- */

test('missing images are removed once to reveal a fallback, without a retry loop', () => {
  const page = boot();
  let removed = 0;
  const target = { matches: selector => selector === 'img[data-fallback]', remove: () => removed++ };
  page.listeners.error({ target });
  assert.equal(removed, 1);
});

test('clicks outside the app, non-buttons and inherited action names do nothing', () => {
  const page = boot();
  page.click({ player: 'Ace' }, false);
  page.listeners.click({ target: { closest: () => null } });
  page.click({ action: 'toString' });
  page.click({ action: 'constructor' });
  page.click({});
  assert.equal(page.read('state'), null);
});

test('all bingo image references exist and have valid WebP dimensions', () => {
  const page = boot();
  const used = new Set(page.read('WILDLIFE').map(cell => cell.art).filter(Boolean));
  const keys = page.read('ART_KEYS');
  assert.deepEqual([...used].sort(), [...keys].sort(), 'every art key is used and every used key is declared');
  for (const name of [...keys, 'scene_intro']) {
    const bytes = fs.readFileSync(path.join(root, 'img', name + '.webp'));
    assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
    assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
    assert.equal(bytes.subarray(12, 16).toString('ascii'), 'VP8 ');
    const width = bytes.readUInt16LE(26) & 0x3fff;
    const height = bytes.readUInt16LE(28) & 0x3fff;
    assert.ok(width >= 700 && height >= 700, `${name} is ${width}x${height}`);
    assert.equal(width / height, name === 'scene_intro' ? 4 / 3 : 1);
    assert.ok(source.includes(`img/${name === 'scene_intro' ? 'scene_intro' : '${cell.art}'}.webp`) ||
      source.includes(`${name}.webp`), `${name} is referenced`);
  }
});

test('player labels follow config.js when the page provides PEOPLE', () => {
  const page = boot({ people: { players: ['Onion', 'Carrot'] } });
  assert.deepEqual(page.read('NAMES'), ['Onion', 'Carrot'],
    'NAMES should come from PEOPLE.players when config.js is loaded');
});

test('player labels fall back to a neutral pair without config.js', () => {
  const page = boot({ people: null });
  assert.deepEqual(page.read('NAMES'), ['One', 'Two'],
    'NAMES should fall back to neutral labels when PEOPLE is absent');
});

test('a malformed PEOPLE is ignored rather than breaking the board', () => {
  for (const bad of [{}, { players: [] }, { players: ['Solo'] }, { players: 'Ace,Bee' }]) {
    const page = boot({ people: bad });
    assert.deepEqual(page.read('NAMES'), ['One', 'Two'],
      `NAMES should fall back for ${JSON.stringify(bad)}`);
  }
});
