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
  reducedMotion = true, confirmResult = false } = {}) {
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

function fullCard(who = 'XJ') {
  return { who, cells: Array.from({ length: CELLS }, (_, i) => ({ icon: '🐾', label: `Moment ${i}`, kind: 'together' })),
    on: Array.from({ length: CELLS }, (_, i) => i < 4 || i === FREE), celebrated: [0] };
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
  const page = boot({ search: '?who=XJ' });
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
    const card = page.read("newCard('XJ')");
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
  const first = boot({ search: '?who=XJ' });
  first.run('toggle(0); toggle(4)');
  const snapshot = first.read('state');
  const reloaded = boot({ search: '?who=XJ', stored: first.stored });
  assert.deepEqual(reloaded.read('state'), snapshot);
});

test('switching players preserves both cards and the last active player', () => {
  const page = boot({ search: '?who=XJ' });
  page.click({ cell: '3' });
  const xj = page.read('state');
  page.click({ player: 'YA' });
  page.click({ cell: '7' });
  const ya = page.read('state');
  page.click({ player: 'XJ' });
  assert.deepEqual(page.read('state'), xj);
  page.click({ player: 'YA' });
  assert.deepEqual(page.read('state'), ya);
  const reloaded = boot({ stored: page.stored });
  assert.deepEqual(reloaded.read('state'), ya);
  assert.deepEqual(reloaded.read('book.cards.XJ'), xj);
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
  const old5x5 = JSON.stringify({ version: 2, active: 'XJ', cards: { XJ: { who: 'XJ',
    cells: Array.from({ length: 25 }, () => ({ icon: '🐾', label: 'Old moment', kind: 'wildlife' })),
    on: Array.from({ length: 25 }, (_, i) => i === 12), celebrated: [] } } });
  const stored = new Map(OLD_KEYS.map(key => [key, old5x5]));
  const page = boot({ stored, search: '?who=XJ' });
  assert.deepEqual(page.read('OLD_KEYS'), OLD_KEYS);
  assert.equal(page.read('state.cells.length'), CELLS);
  assert.equal(page.read('getProgress(state).count'), 0, 'a 25-square save never leaks into the new card');
  for (const key of OLD_KEYS) assert.equal(page.stored.get(key), old5x5, `${key} must survive intact`);
});

test('malformed saves are ignored without crashing or discarding another valid player', () => {
  for (const raw of ['{broken', 'null', '[]', '42', '{"version":3,"cards":null}', '{"version":2,"cards":{}}']) {
    const page = boot({ stored: new Map([[KEY, raw]]), search: '?who=XJ' });
    assert.equal(page.read('state.cells.length'), CELLS);
  }
  const setup = boot({ search: '?who=YA' });
  setup.run('toggle(2)');
  const saved = JSON.parse(setup.stored.get(KEY));
  saved.cards.XJ = { who: 'XJ', cells: [], on: [] };
  saved.active = 'XJ';
  setup.stored.set(KEY, JSON.stringify(saved));
  const page = boot({ stored: setup.stored });
  assert.equal(page.read('state'), null);
  page.run("start('YA')");
  assert.equal(page.read('state.on[2]'), true);
});

test('card validation rejects broken shapes and repairs the free square', () => {
  const page = boot();
  const good = fullCard();
  for (const mutate of [c => c.cells.pop(), c => c.on.pop(), c => c.on[0] = 'true',
    c => c.cells[0] = null, c => c.cells[0] = { icon: '🐾', label: '' },
    c => c.cells[0] = { icon: '🐾', label: 'x'.repeat(33) },       // the 32-character cap is enforced on load too
    c => c.cells[0] = { icon: 'x'.repeat(17), label: 'Fine' },
    c => c.who = 'YA']) {
    const card = structuredClone(good);
    mutate(card);
    assert.equal(page.read(`validCard(${JSON.stringify(card)}, 'XJ')`), null);
  }
  good.on[FREE] = false;
  good.celebrated = [0, 0, -1, 10, '1', null];
  const repaired = page.read(`validCard(${JSON.stringify(good)}, 'XJ')`);
  assert.equal(repaired.on[FREE], true);
  assert.equal(repaired.cells[FREE].label, 'Here with you');
  assert.deepEqual(repaired.celebrated, [0]);
});

test('persisted labels and icons are escaped; arbitrary image paths and kinds are rejected', () => {
  const card = fullCard();
  card.cells[0] = { icon: '<b>hi</b>', label: '<img src=x onerror="alert(1)">', kind: 'wildlife' };
  card.cells[1] = { icon: '🐾', label: 'Safe label', art: '../private', kind: '" onclick="bad' };
  const page = boot({ stored: new Map([[KEY, JSON.stringify({ version: 3, active: 'XJ', cards: { XJ: card } })]]) });
  assert.match(page.app.innerHTML, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.equal(page.app.innerHTML.includes('<b>hi</b>'), false);
  assert.equal(page.app.innerHTML.includes('../private'), false);
  assert.equal(page.app.innerHTML.includes('onclick='), false);
  assert.equal(page.read('state.cells[1].kind'), 'together');
});

test('mark and undo preserve focus, announce changes and keep the free square marked', () => {
  const page = boot({ search: '?who=XJ' });
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
    const page = boot({ search: '?who=XJ' });
    for (const i of line) if (i !== FREE) page.run(`toggle(${i})`);
    assert.deepEqual(page.read('state.celebrated'), [index]);
    assert.equal(page.read('getProgress(state).wins.length'), 1);
    assert.match(page.announcement.textContent, /Bingo!/);
    assert.match(page.app.innerHTML, /A little victory!/);
  }
});

test('two simultaneous lines count correctly and undo does not replay a celebration', () => {
  const page = boot({ search: '?who=XJ' });
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
  const page = boot({ search: '?who=XJ' });
  page.run('[0,1,2].forEach(toggle)');
  assert.match(page.app.innerHTML, /One little moment away/);
  page.run('state.on.forEach((on, i) => { if (!on) toggle(i); })');
  assert.equal(page.read('getProgress(state).count'), MOMENTS);
  assert.equal(page.read('getProgress(state).wins.length'), 10);
});

test('cancelling a fresh card changes nothing', () => {
  const page = boot({ search: '?who=XJ', confirmResult: false });
  page.run('toggle(1)');
  const snapshot = page.read('book');
  page.click({ action: 'reset' });
  assert.deepEqual(page.read('book'), snapshot);
  assert.equal(page.confirmations.length, 1);
});

test('confirmed fresh card clears only the selected player, photos included', () => {
  const page = boot({ search: '?who=XJ', confirmResult: true });
  page.run("toggle(1); start('YA'); toggle(2); start('XJ')");
  page.run(`setPhoto('XJ', 3, ${JSON.stringify(jpeg())}); setPhoto('YA', 4, ${JSON.stringify(jpeg())})`);
  const ya = page.read('book.cards.YA');
  page.click({ action: 'reset' });
  assert.equal(page.read('getProgress(state).count'), 0);
  assert.equal(page.read("photoCount('XJ')"), 0);
  assert.equal(page.read("photoCount('YA')"), 1, 'the other player keeps their photos');
  assert.deepEqual(page.read('book.cards.YA'), ya);
  assert.equal(JSON.parse(page.stored.get(KEY)).active, 'XJ');
  assert.match(page.confirmations[0], /only XJ/);
});

test('blocked storage still permits both in-memory cards, with an honest warning', () => {
  const page = boot({ search: '?who=XJ', storageDenied: true, confirmResult: true });
  assert.match(page.app.innerHTML, /This browser can’t save right now/);
  page.run("toggle(6); start('YA'); toggle(7); start('XJ')");
  assert.equal(page.read('state.on[6]'), true);
  assert.equal(page.read('book.cards.YA.on[7]'), true);
  page.run('reset()');
  assert.equal(page.read('getProgress(state).count'), 0);
  assert.equal(page.stored.size, 0);
});

test('reduced motion creates no confetti or banner, while announcing the win', () => {
  const page = boot({ search: '?who=XJ', reducedMotion: true });
  page.run('[0,1,2,3].forEach(toggle)');
  assert.equal(page.elements.length, 0);
  assert.equal(page.timers.length, 0);
  assert.match(page.announcement.textContent, /Bingo!/);
});

test('normal celebration is brief, decorative, cleaned up, and never repeated for the same line', () => {
  const page = boot({ search: '?who=XJ', reducedMotion: false });
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
  const page = boot({ search: '?who=XJ' });
  const photo = jpeg(60);
  assert.deepEqual(page.read(`setPhoto('XJ', 2, ${JSON.stringify(photo)})`), { ok: true });
  assert.deepEqual(page.read(`setPhoto('YA', 9, ${JSON.stringify(photo)})`), { ok: true });
  assert.notEqual(page.stored.get(PHOTO_KEY), undefined);
  assert.equal(page.stored.get(PHOTO_KEY).includes('"cells"'), false, 'the album holds no card state');
  assert.equal(page.stored.get(KEY).includes('data:image'), false, 'the card holds no photo data');
  assert.equal(page.read("photoCount('XJ')"), 1);
  assert.equal(page.read("photoCount('YA')"), 1);

  const reloaded = boot({ search: '?who=XJ', stored: page.stored });
  assert.equal(reloaded.run("photoOf('XJ', 2)"), photo);
  assert.equal(reloaded.run("photoOf('YA', 9)"), photo);
  assert.equal(reloaded.run("photoOf('XJ', 9)"), undefined);
  assert.deepEqual(reloaded.read("removePhoto('XJ', 2)"), { ok: true });
  assert.equal(reloaded.read("photoCount('XJ')"), 0);
  assert.deepEqual(reloaded.read("removePhoto('XJ', 2)"), { ok: true }, 'removing twice is harmless');
  assert.equal(reloaded.read("photoCount('YA')"), 1, 'one player’s removal leaves the other alone');
});

test('a rejected or corrupt album never reaches the board', () => {
  for (const raw of ['{broken', 'null', '[]', '{"version":9,"photos":{"XJ":{"0":"data:image/jpeg;base64,QUJD"}}}',
    '{"version":1,"photos":"nope"}',
    '{"version":1,"photos":{"XJ":{"0":"javascript:alert(1)","1":"data:image/svg+xml;base64,QUJD"}}}',
    '{"version":1,"photos":{"XJ":{"99":"data:image/jpeg;base64,QUJD"}}}']) {
    const page = boot({ search: '?who=XJ', stored: new Map([[PHOTO_KEY, raw]]) });
    assert.equal(page.read("photoCount('XJ')"), 0, raw.slice(0, 40));
    assert.equal(page.read('state.cells.length'), CELLS);
    assert.equal(page.app.innerHTML.includes('javascript:'), false);
  }
  const good = boot({ search: '?who=XJ',
    stored: new Map([[PHOTO_KEY, '{"version":1,"photos":{"XJ":{"0":"data:image/jpeg;base64,QUJD"},"ZZ":{"0":"x"}}}']]) });
  assert.equal(good.read("photoCount('XJ')"), 1);
});

test('a full album fails gracefully and leaves the album and the board exactly as they were', () => {
  const page = boot({ search: '?who=XJ', fullKeys: [PHOTO_KEY] });
  const board = page.stored.get(KEY);
  assert.deepEqual(page.read(`setPhoto('XJ', 1, ${JSON.stringify(jpeg())})`), { ok: false, reason: 'full' });
  assert.equal(page.run("photoOf('XJ', 1)"), undefined, 'the in-memory album is put back');
  assert.equal(page.read("photoCount('XJ')"), 0);
  assert.equal(page.stored.get(PHOTO_KEY), undefined);
  assert.equal(page.stored.get(KEY), board, 'a full album cannot corrupt the saved card');
  assert.equal(page.read('state.cells.length'), CELLS);

  // An existing photo is restored rather than lost when the replacement will not fit.
  const kept = boot({ search: '?who=XJ' });
  const first = jpeg(20);
  kept.run(`setPhoto('XJ', 1, ${JSON.stringify(first)})`);
  kept.run('localStorage.setItem = () => { const e = Error("full"); e.name = "QuotaExceededError"; throw e; }');
  assert.deepEqual(kept.read(`setPhoto('XJ', 1, ${JSON.stringify(jpeg(80))})`), { ok: false, reason: 'full' });
  assert.equal(kept.run("photoOf('XJ', 1)"), first);
});

test('a blocked (not full) browser is reported differently, and bad input is refused', () => {
  const page = boot({ search: '?who=XJ' });
  page.run('localStorage.setItem = () => { throw Error("Denied"); }');
  assert.deepEqual(page.read(`setPhoto('XJ', 1, ${JSON.stringify(jpeg())})`), { ok: false, reason: 'blocked' });
  const clean = boot({ search: '?who=XJ' });
  for (const call of ["setPhoto('ZZ', 1, P)", "setPhoto('XJ', -1, P)", "setPhoto('XJ', 16, P)",
    "setPhoto('XJ', 1.5, P)", "setPhoto('XJ', 1, 'javascript:alert(1)')", "removePhoto('ZZ', 1)",
    "removePhoto('XJ', 99)", "clearPhotos('ZZ')"]) {
    assert.deepEqual(clean.read(call.replace(/\bP\b/, JSON.stringify(jpeg()))), { ok: false, reason: 'bad' }, call);
  }
  assert.equal(clean.stored.get(PHOTO_KEY), undefined);
});

test('each square offers a camera button; a photo turns it into the tile and a viewer', () => {
  const page = boot({ search: '?who=XJ' });
  assert.equal((page.app.innerHTML.match(/data-photo="/g) || []).length, CELLS, 'every square, free one included');
  assert.match(page.app.innerHTML, /No photos yet/);
  const photo = jpeg(24);
  page.run(`setPhoto('XJ', 4, ${JSON.stringify(photo)}); render()`);
  assert.match(page.app.innerHTML, /class="cell-photo" src="data:image\/jpeg;base64,/);
  assert.match(page.app.innerHTML, /class="cell[^"]*has-photo"[^>]*data-cell="4"/);
  assert.match(page.app.innerHTML, /data-view-photo="4"/);
  assert.equal(page.app.innerHTML.includes('data-photo="4"'), false, 'that square now opens its photo instead');
  assert.match(page.app.innerHTML, /1 photo tucked into this card/);
  assert.match(page.app.innerHTML, /aria-label="[^"]*\. Has a photo\. Row 2, column 1"/);
});

test('the camera button opens a real image picker and never uploads anything', () => {
  const page = boot({ search: '?who=XJ' });
  page.click({ photo: '3' });
  const input = page.created.at(-1);
  assert.equal(input.tag, 'input');
  assert.equal(input.type, 'file');
  assert.equal(input.accept, 'image/*');
  assert.equal(input.clicks, 1);
  assert.equal(typeof input.handlers.change, 'function');
  input.handlers.change();                      // no file chosen: nothing should happen
  assert.equal(page.read("photoCount('XJ')"), 0);
  assert.equal(source.includes('fetch('), false, 'photos never leave the phone');
  assert.equal(source.includes('XMLHttpRequest'), false);
  page.click({ photo: '99' });
  assert.equal(page.created.length, 1, 'an impossible square opens no picker');
});

test('the lightbox shows the photo large, closes on Escape, and can remove it', () => {
  const page = boot({ search: '?who=XJ' });
  page.run(`setPhoto('XJ', 6, ${JSON.stringify(jpeg(24))}); render()`);
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
  assert.equal(page.read("photoCount('XJ')"), 0);
  assert.equal(page.read('lightbox'), null);
  assert.match(page.announcement.textContent, /Photo removed from/);
  assert.equal(page.app.innerHTML.includes('cell-photo"'), false);
  page.click({ viewPhoto: '6' });
  assert.equal(page.read('lightbox'), null, 'a square with no photo has nothing to open');
});

test('a full album tells you kindly, and offers the way out', async () => {
  const page = boot({ search: '?who=XJ', fullKeys: [PHOTO_KEY] });
  page.run(`downscale = () => Promise.resolve(${JSON.stringify(jpeg(24))})`);
  await page.run('attachPhoto(2, { type: "image/jpeg" })');
  assert.match(page.app.innerHTML, /Our little album is full/);
  assert.match(page.app.innerHTML, /remove it to make room/);
  assert.match(page.announcement.textContent, /album is full/);
  assert.equal(page.read("photoCount('XJ')"), 0);
  assert.equal(page.read('state.cells.length'), CELLS, 'the board is untouched');

  const ok = boot({ search: '?who=XJ' });
  ok.run(`downscale = () => Promise.resolve(${JSON.stringify(jpeg(24))})`);
  await ok.run('attachPhoto(2, { type: "image/jpeg" })');
  assert.equal(ok.read("photoCount('XJ')"), 1);
  assert.match(ok.announcement.textContent, /Photo added to .*1 photo in this card/);
  assert.equal(ok.app.innerHTML.includes('album is full'), false);

  const sad = boot({ search: '?who=XJ' });
  sad.run('downscale = () => Promise.reject(Error("nope"))');
  await sad.run('attachPhoto(2, { type: "image/jpeg" })');
  assert.match(sad.app.innerHTML, /didn’t want to come along/);
  assert.equal(sad.read("photoCount('XJ')"), 0);
});

/* ---------- the little end screen ---------- */

test('the summary is always one tap away and reads gently', () => {
  const page = boot({ search: '?who=XJ' });
  assert.match(page.app.innerHTML, /data-action="summary"/);
  page.run(`[0,1,2,7,11].forEach(toggle); setPhoto('XJ', 7, ${JSON.stringify(jpeg(24))})`);
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
  const empty = boot({ search: '?who=XJ' });
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
  const page = boot({ search: '?who=XJ' });
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
  const page = boot({ search: '?who=XJ' });
  page.click({ action: 'summary' });
  page.click({ player: 'YA' });
  assert.equal(page.read('view'), 'board');
  assert.equal(page.read('state.who'), 'YA');
  assert.equal(page.read('lightbox'), null);
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
  page.click({ player: 'XJ' }, false);
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
