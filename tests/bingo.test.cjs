const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'bingo.js'), 'utf8');
const KEY = 'ns_bingo_v2';
const LEGACY_KEY = 'ns_bingo_v1';

// Minimal DOM boundary: exercise the real script, event handlers and rendered HTML
// without a browser dependency. These tests do not claim to measure browser layout.
function boot({ search = '', stored = new Map(), storageDenied = false, reducedMotion = true, confirmResult = false } = {}) {
  const listeners = {};
  const focused = [];
  const elements = [];
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
      setItem(key, value) { if (storageDenied) throw Error('Denied'); stored.set(key, value); },
    },
    window: { matchMedia: () => ({ matches: reducedMotion }) },
    confirm(message) { confirmations.push(message); return confirmResult; },
    setTimeout(callback) { timers.push(callback); },
    document: {
      querySelector: selector => selector === '#app' ? app : announcement,
      querySelectorAll: () => elements.filter(element => !element.removed),
      createElement() {
        return { style: { setProperty() {} }, attributes: {},
          setAttribute(name, value) { this.attributes[name] = value; },
          remove() { this.removed = true; } };
      },
      body: { appendChild: element => elements.push(element) },
    },
  });
  vm.runInContext(source, context, { filename: 'bingo.js' });
  const run = code => vm.runInContext(code, context);
  const read = code => JSON.parse(run(`JSON.stringify(${code})`));
  const click = (dataset, inside = true) => listeners.click({ target: { closest: () => ({ dataset, inside }) } });
  return { run, read, app, announcement, focused, elements, timers, confirmations, listeners, click, stored };
}

function oldCard(who = 'XJ') {
  return { who, cells: Array.from({ length: 25 }, (_, i) => ['🐾', `Original moment ${i}`]),
    on: Array.from({ length: 25 }, (_, i) => i < 5 || i === 12), celebrated: [0] };
}

test('first visit is a warm player picker, with no accidental card creation', () => {
  const page = boot();
  assert.equal(page.read('state'), null);
  assert.match(page.app.innerHTML, /Little moments/);
  assert.match(page.app.innerHTML, /Winner picks dessert\. We share it\./);
  assert.equal(page.stored.size, 0);
});

test('500 fresh cards have 12 unique wildlife moments, 12 shared moments and a free middle', () => {
  const page = boot();
  const poolBefore = page.read('[WILDLIFE, TOGETHER]');
  const arrangements = new Set();
  for (let i = 0; i < 500; i++) {
    const card = page.read("newCard('XJ')");
    assert.equal(card.cells.length, 25);
    assert.equal(new Set(card.cells.map(cell => cell.label)).size, 25);
    assert.equal(card.cells.filter(cell => cell.kind === 'wildlife').length, 12);
    assert.equal(card.cells.filter(cell => cell.kind === 'together').length, 12);
    assert.equal(card.cells[12].label, 'Here with you');
    assert.deepEqual(card.on, Array.from({ length: 25 }, (_, k) => k === 12));
    arrangements.add(card.cells.map(cell => cell.label).join('|'));
  }
  assert.equal(arrangements.size, 500);
  assert.deepEqual(page.read('[WILDLIFE, TOGETHER]'), poolBefore);
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

test('legacy progress migrates intact, retaining the old backup', () => {
  const legacy = oldCard();
  const raw = JSON.stringify(legacy);
  const page = boot({ stored: new Map([[LEGACY_KEY, raw]]) });
  assert.equal(page.read('state.who'), 'XJ');
  assert.deepEqual(page.read('state.on'), legacy.on);
  assert.deepEqual(page.read('state.celebrated'), [0]);
  assert.equal(page.read('state.cells[0].label'), 'Original moment 0');
  assert.equal(page.read('state.cells[12].label'), 'Here with you');
  assert.equal(page.stored.get(LEGACY_KEY), raw);
  assert.equal(JSON.parse(page.stored.get(KEY)).version, 2);
});

test('legacy backup never overwrites a newer card', () => {
  const page = boot({ search: '?who=XJ' });
  page.run('toggle(9)');
  const current = page.read('state');
  page.stored.set(LEGACY_KEY, JSON.stringify(oldCard()));
  assert.deepEqual(boot({ stored: page.stored }).read('state'), current);
});

test('malformed saves are ignored without crashing or discarding another valid player', () => {
  for (const raw of ['{broken', 'null', '[]', '42', '{"version":2,"cards":null}']) {
    const page = boot({ stored: new Map([[KEY, raw]]), search: '?who=XJ' });
    assert.equal(page.read('state.cells.length'), 25);
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
  const good = oldCard();
  for (const mutate of [c => c.cells.pop(), c => c.on.pop(), c => c.on[0] = 'true',
    c => c.cells[0] = null, c => c.cells[0] = ['🐾', ''], c => c.cells[0] = ['🐾', 'x'.repeat(161)],
    c => c.who = 'YA']) {
    const card = structuredClone(good);
    mutate(card);
    assert.equal(page.read(`validCard(${JSON.stringify(card)}, 'XJ')`), null);
  }
  good.on[12] = false;
  good.celebrated = [0, 0, -1, 12, '1', null];
  const repaired = page.read(`validCard(${JSON.stringify(good)}, 'XJ')`);
  assert.equal(repaired.on[12], true);
  assert.deepEqual(repaired.celebrated, [0]);
});

test('persisted labels and icons are escaped; arbitrary image paths and kinds are rejected', () => {
  const legacy = oldCard();
  legacy.cells[0] = ['<b>hi</b>', '<img src=x onerror="alert(1)">'];
  legacy.cells[1] = { icon: '🐾', label: 'Safe label', art: '../private', kind: '" onclick="bad' };
  const page = boot({ stored: new Map([[LEGACY_KEY, JSON.stringify(legacy)]]) });
  assert.match(page.app.innerHTML, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.equal(page.app.innerHTML.includes('<b>hi</b>'), false);
  assert.equal(page.app.innerHTML.includes('../private'), false);
  assert.equal(page.app.innerHTML.includes('onclick='), false);
  assert.equal(page.read('state.cells[1].kind'), 'legacy');
});

test('mark and undo preserve focus, announce changes and keep the free square marked', () => {
  const page = boot({ search: '?who=XJ' });
  page.click({ cell: '0' });
  assert.equal(page.read('state.on[0]'), true);
  assert.match(page.app.innerHTML, /data-cell="0"[^>]*aria-pressed="true"/);
  assert.equal(page.focused.at(-1).selector, '[data-cell="0"]');
  assert.equal(page.focused.at(-1).options.preventScroll, true);
  assert.match(page.announcement.textContent, /1 of 24 moments/);
  page.click({ cell: '0' });
  assert.equal(page.read('state.on[0]'), false);
  const snapshot = page.read('state');
  page.run('toggle(12); toggle(-1); toggle(25); toggle(0.5); toggle(NaN)');
  assert.deepEqual(page.read('state'), snapshot);
  assert.match(page.app.innerHTML, /data-cell="12"[^>]*aria-disabled="true"/);
});

test('all five rows, five columns and both diagonals are detected independently', () => {
  const lines = boot().read('LINES');
  assert.equal(lines.length, 12);
  assert.equal(new Set(lines.map(line => line.join(','))).size, 12);
  for (const [index, line] of lines.entries()) {
    const page = boot({ search: '?who=XJ' });
    for (const i of line) if (i !== 12) page.run(`toggle(${i})`);
    assert.deepEqual(page.read('state.celebrated'), [index]);
    assert.equal(page.read('getProgress(state).wins.length'), 1);
    assert.match(page.announcement.textContent, /Bingo!/);
    assert.match(page.app.innerHTML, /A little victory!/);
  }
});

test('two simultaneous lines count correctly and undo does not replay a celebration', () => {
  const page = boot({ search: '?who=XJ' });
  page.run('[1,2,3,4,5,10,15,20].forEach(toggle)');
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
  page.run('[0,1,2,3].forEach(toggle)');
  assert.match(page.app.innerHTML, /One little moment away/);
  page.run('state.on.forEach((on, i) => { if (!on) toggle(i); })');
  assert.equal(page.read('getProgress(state).count'), 24);
  assert.equal(page.read('getProgress(state).wins.length'), 12);
  assert.match(page.app.innerHTML, /A whole card of memories/);
});

test('cancelling a fresh card changes nothing', () => {
  const page = boot({ search: '?who=XJ', confirmResult: false });
  page.run('toggle(1)');
  const snapshot = page.read('book');
  page.click({ action: 'reset' });
  assert.deepEqual(page.read('book'), snapshot);
  assert.equal(page.confirmations.length, 1);
});

test('confirmed fresh card clears only the selected player', () => {
  const page = boot({ search: '?who=XJ', confirmResult: true });
  page.run("toggle(1); start('YA'); toggle(2); start('XJ')");
  const ya = page.read('book.cards.YA');
  page.click({ action: 'reset' });
  assert.equal(page.read('getProgress(state).count'), 0);
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
  page.run('[0,1,2,3,4].forEach(toggle)');
  assert.equal(page.elements.length, 0);
  assert.equal(page.timers.length, 0);
  assert.match(page.announcement.textContent, /Bingo!/);
});

test('normal celebration is brief, decorative, cleaned up, and never repeated for the same line', () => {
  const page = boot({ search: '?who=XJ', reducedMotion: false });
  page.run('[0,1,2,3,4].forEach(toggle)');
  assert.equal(page.elements.length, 29);
  assert.ok(page.elements.every(element => element.attributes['aria-hidden'] === 'true'));
  page.run('toggle(0); toggle(0)');
  assert.equal(page.elements.length, 29);
  page.timers.forEach(callback => callback());
  assert.ok(page.elements.every(element => element.removed));
});

test('missing images are removed once to reveal a fallback, without a retry loop', () => {
  const page = boot();
  let removed = 0;
  const target = { matches: selector => selector === 'img[data-fallback]', remove: () => removed++ };
  page.listeners.error({ target });
  assert.equal(removed, 1);
});

test('clicks outside the app and non-button clicks do nothing', () => {
  const page = boot();
  page.click({ player: 'XJ' }, false);
  page.listeners.click({ target: { closest: () => null } });
  assert.equal(page.read('state'), null);
});

test('all bingo image references exist and have valid PNG dimensions', () => {
  const keys = boot().read('ART_KEYS');
  for (const name of [...keys, 'scene_intro']) {
    const bytes = fs.readFileSync(path.join(root, 'img', name + '.png'));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    assert.ok(width >= 1000 && height >= 1000);
    assert.equal(width / height, name === 'scene_intro' ? 4 / 3 : 1);
  }
});
