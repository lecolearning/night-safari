const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const BONUS_KEY = 'ns_dex_bonus_v1';

// Test the actual application at its DOM boundary; not browser/layout tests.
function boot({ hash = '', stored = new Map(), storageDenied = false } = {}) {
  const handlers = {}, docHandlers = {}, windowHandlers = {}, focused = [], scrolls = [];
  const element = name => ({ innerHTML: '', textContent: '', classList: { add() {}, remove() {} },
    focus: () => focused.push(name) });
  const elements = Object.fromEntries(['dex-view', 'dex-progress', 'dex-live', 'dex-title', 'guess-message', 'bonus-clues']
    .map(name => [name, element(name)]));
  const view = elements['dex-view'];
  view.addEventListener = (name, fn) => { handlers[name] = fn; };
  view.querySelector = selector => element(selector);
  const location = { hash, pathname: '/pokedex.html', search: '' };
  function setURL(url) { location.hash = url.includes('#') ? '#' + url.split('#')[1] : ''; }
  const history = {
    pushState(_a, _b, url) { setURL(url); }, replaceState(_a, _b, url) { setURL(url); },
    back() { location.hash = ''; windowHandlers.popstate(); },
  };
  const context = vm.createContext({
    window: { addEventListener: (name, fn) => { windowHandlers[name] = fn; },
      scrollTo: (...args) => scrolls.push(args),
      ART: { portrait: key => '<img class="art" src="img/' + key + '.webp">' } },
    document: { getElementById: id => elements[id] || null,
      addEventListener: (name, fn) => { docHandlers[name] = fn; } },
    location, history, navigator: {}, setTimeout() {},
    localStorage: {
      getItem(key) { if (storageDenied) throw Error('Denied'); return stored.get(key) ?? null; },
      setItem(key, value) { if (storageDenied) throw Error('Denied'); stored.set(key, value); },
    },
  });
  for (const file of ['animals.js', 'bonus-quests.js', 'pokedex.js']) vm.runInContext(read(file), context, { filename: file });
  function click(attribute, value = '') {
    const button = { getAttribute: () => value, textContent: '', disabled: false };
    handlers.click({ target: { closest: selector => selector === '[' + attribute + ']' ? button : null } });
    return button;
  }
  function guess(value) {
    const input = { value, focus: () => focused.push('answer') };
    const form = { querySelector: () => input, closest: selector => selector === '[data-bonus-guess]' ? form : null };
    handlers.submit({ target: form, preventDefault() {} });
  }
  return { view, elements, stored, location, context, focused, scrolls, click, guess,
    navigate(hash) { location.hash = hash; windowHandlers.hashchange(); },
    key(key, typing = false) {
      let prevented = false;
      docHandlers.keydown({ key, target: { closest: () => typing ? {} : null }, preventDefault() { prevented = true; } });
      return prevented;
    },
  };
}

test('three distinct bonus shadows are locked, separate from the seven quiz outcomes', () => {
  const app = boot();
  assert.equal((app.view.innerHTML.match(/is-shadow is-bonus/g) || []).length, 3);
  assert.match(app.view.innerHTML, /No\. 008/);
  assert.ok(app.view.innerHTML.indexOf('data-locked="1"') > app.view.innerHTML.indexOf('data-idx="11"'), 'the unidentified card is last');
  for (const number of ['009', '010', '011']) assert.match(app.view.innerHTML, new RegExp('shadow-' + number + '.webp'));
  for (const key of ['tapir', 'flyingsquirrel', 'flyingfox']) assert.ok(!app.view.innerHTML.includes('img/' + key + '.webp'));
  assert.equal(vm.runInContext('QUIZ_ANIMAL_KEYS.length', app.context), 7);
  assert.match(app.elements['dex-progress'].innerHTML, /1 of 10/);
});

test('old sightings and quiz result still work but cannot bypass a bonus guess', () => {
  const stored = new Map([['ns_result', 'otter'], ['ns_dex_met', '["tiger","tapir"]']]);
  const app = boot({ stored });
  assert.match(app.elements['dex-progress'].innerHTML, /3 of 10/);
  app.navigate('#tapir');
  assert.match(app.view.innerHTML, /Who’s that animal/);
  app.click('data-unlock', '9');
  assert.match(app.view.innerHTML, /data-bonus-guess/);
  assert.equal(stored.has(BONUS_KEY), false);
  assert.equal(stored.get('ns_dex_met'), '["tiger","tapir"]');
  const stale = boot({ hash: '#tapir', stored: new Map([['ns_result', 'tapir']]) });
  assert.match(stale.view.innerHTML, /data-bonus-guess/);
});

test('all seven original shadows use the finished raster silhouettes, never the old SVG', () => {
  const app = boot();
  for (const number of ['001', '002', '003', '004', '006', '007']) {
    app.navigate('#no' + number);
    assert.match(app.view.innerHTML, new RegExp('img/shadow-' + number + '.webp'));
    assert.ok(!app.view.innerHTML.includes('<svg'));
    assert.ok(!app.view.innerHTML.includes('data-bonus-guess'));
    assert.match(app.view.innerHTML, /I saw this one!/);
  }
  // Fishing cat is automatically known, but its matching asset is shipped too.
  assert.ok(!read('pokedex.js').includes('art.svgPortrait'));
});

test('wrong and empty guesses retain focus and shadow; clues accumulate in place', () => {
  const app = boot({ hash: '#no009' });
  const before = app.view.innerHTML;
  app.guess('');
  assert.match(app.elements['guess-message'].textContent, /Pop a name/);
  app.guess('carrot');
  assert.match(app.elements['guess-message'].textContent, /Not quite/);
  assert.equal(app.view.innerHTML, before, 'no full rerender or focus jump');
  assert.equal(app.focused.at(-1), 'answer');
  for (let i = 0; i < 3; i++) app.click('data-bonus-hint');
  assert.match(app.elements['bonus-clues'].innerHTML, /Clue 3/);
  assert.equal(app.click('data-bonus-hint').disabled, true);
  assert.equal(app.scrolls.length, 0);
  assert.equal(app.stored.has(BONUS_KEY), false);
});

test('each correct common name reveals once, updates progress, and survives reload', () => {
  const stored = new Map([['ns_bingo_v3', '{"keep":"exactly"}']]);
  const app = boot({ stored });
  for (const [number, key, answer] of [['009', 'tapir', 'Tapir'], ['010', 'flyingsquirrel', 'flying squirrel'], ['011', 'flyingfox', 'fruit bat']]) {
    app.navigate('#no' + number);
    app.guess(answer);
    assert.equal(app.location.hash, '#' + key);
    assert.match(app.view.innerHTML, /trail bonus earned/);
    assert.match(app.view.innerHTML, new RegExp('img/' + key + '.webp'));
    assert.ok(!app.view.innerHTML.includes('data-bonus-guess'));
    const once = stored.get(BONUS_KEY);
    app.guess(answer);
    assert.equal(stored.get(BONUS_KEY), once);
    assert.match(boot({ hash: '#no' + number, stored }).view.innerHTML, /trail bonus earned/);
  }
  assert.equal(JSON.parse(stored.get(BONUS_KEY)).length, 3);
  assert.match(app.elements['dex-progress'].innerHTML, /4 of 10/);
  assert.equal(stored.get('ns_bingo_v3'), '{"keep":"exactly"}');
});

test('storage errors are gentle, and malformed saved data never unlocks surprises', () => {
  const app = boot({ hash: '#no011', storageDenied: true });
  app.guess('fruit bat');
  assert.match(app.view.innerHTML, /could not save your bonus/);
  app.navigate('');
  app.navigate('#no011');
  assert.match(app.view.innerHTML, /trail bonus earned/);
  for (const raw of ['broken', '{}', 'null', '["unknown","__proto__"]']) {
    const fresh = boot({ hash: '#no009', stored: new Map([[BONUS_KEY, raw]]) });
    assert.match(fresh.view.innerHTML, /data-bonus-guess/);
  }
});

test('text editing keeps arrow keys; card navigation and return to grid still work', () => {
  const app = boot();
  app.click('data-idx', '9');
  assert.equal(app.location.hash, '#no009');
  assert.equal(app.key('ArrowLeft', true), false);
  assert.equal(app.key('ArrowRight', true), false);
  assert.equal(app.location.hash, '#no009');
  assert.equal(app.key('ArrowRight'), true);
  assert.equal(app.location.hash, '#no010');
  app.click('data-back');
  assert.equal(app.location.hash, '');
  assert.match(app.view.innerHTML, /The quiz cast/);
});

test('guesses are escaped when returning to a card', () => {
  const app = boot({ hash: '#no009' });
  app.guess('\"><script>alert(1)</script>');
  app.navigate('#no010');
  app.navigate('#no009');
  assert.ok(!app.view.innerHTML.includes('<script>'));
  assert.match(app.view.innerHTML, /&lt;script&gt;/);
});

test('navigation links sit outside bingo rendering, and new images are cached locally', () => {
  const bingo = read('bingo.html');
  assert.ok(bingo.indexOf('href="pokedex.html"') < bingo.indexOf('id="app"'));
  assert.match(read('pokedex.html'), /href="bingo.html"/);
  const sw = read('sw.js');
  for (const key of ['tapir', 'flyingsquirrel', 'flyingfox', ...[1, 2, 3, 4, 5, 6, 7, 9, 10, 11].map(n => 'shadow-' + String(n).padStart(3, '0'))]) {
    assert.ok(fs.existsSync(path.join(root, 'img', key + '.webp')));
    assert.ok(sw.includes('img/' + key + '.webp'));
  }
  assert.ok(read('pokedex.html').indexOf('bonus-quests.js') < read('pokedex.html').indexOf('pokedex.js'));
});
