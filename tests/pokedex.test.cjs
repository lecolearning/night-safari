const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const BONUS_KEY = 'ns_dex_bonus_v1';
const BONUSES = ['tapir', 'flyingsquirrel', 'flyingfox', 'owl', 'porcupine', 'elephant'];
const BONUS_NUMBERS = ['009', '010', '011', '012', '013', '014'];

// Test the actual application at its DOM boundary; not browser/layout tests.
function boot({ hash = '', stored = new Map(), storageDenied = false } = {}) {
  const handlers = {}, docHandlers = {}, windowHandlers = {}, focused = [], scrolls = [];
  const element = name => ({ innerHTML: '', textContent: '', classList: { add() {}, remove() {} },
    focus: () => focused.push(name), scrollIntoView: () => scrolls.push(name) });
  const elements = Object.fromEntries(['dex-view', 'dex-progress', 'dex-live', 'dex-title', 'guess-message', 'bonus-clues', 'keepsakes-title', 'keepsake-status']
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
  for (const file of ['animals.js', 'bonus-quests.js', 'keepsakes.js', 'pokedex.js']) vm.runInContext(read(file), context, { filename: file });
  function click(attribute, value = '') {
    const button = { getAttribute: () => value, textContent: 'Save / share PNG', disabled: false, setAttribute() {}, removeAttribute() {} };
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

test('six distinct bonus shadows are locked, separate from the seven quiz outcomes', () => {
  const app = boot();
  assert.equal((app.view.innerHTML.match(/is-shadow is-bonus/g) || []).length, 6);
  assert.match(app.view.innerHTML, /No\. 008/);
  assert.ok(app.view.innerHTML.indexOf('data-locked="1"') > app.view.innerHTML.indexOf('data-idx="14"'), 'the unidentified card is last');
  for (const number of BONUS_NUMBERS) assert.match(app.view.innerHTML, new RegExp('shadow-' + number + '.webp'));
  for (const key of BONUSES) assert.ok(!app.view.innerHTML.includes('img/' + key + '.webp'));
  assert.equal(vm.runInContext('QUIZ_ANIMAL_KEYS.length', app.context), 7);
  assert.match(app.elements['dex-progress'].innerHTML, /1 of 13/);
});

test('old sightings and quiz result still work but cannot bypass a bonus guess', () => {
  const stored = new Map([['ns_result', 'otter'], ['ns_dex_met', '["tiger","tapir"]']]);
  const app = boot({ stored });
  assert.match(app.elements['dex-progress'].innerHTML, /3 of 13/);
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

test('bonus scores cannot turn any of the six new friends into a quiz result', () => {
  const source = read('quiz.js');
  const start = source.indexOf('function winner()');
  const end = source.indexOf('function drumroll()', start);
  assert.ok(start >= 0 && end > start);
  for (const key of BONUSES) {
    const result = vm.runInNewContext(source.slice(start, end) + '\nwinner();', { scores: { [key]: 1000000, otter: 5 } });
    assert.equal(result, 'otter');
  }
  assert.match(source, /QUIZ_ANIMAL_KEYS\.includes\(_q\.get\('result'\)\)/);
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
  for (const [number, key, answer] of [['009', 'tapir', 'Tapir'], ['010', 'flyingsquirrel', 'flying squirrel'], ['011', 'flyingfox', 'fruit bat'],
    ['012', 'owl', 'owl'], ['013', 'porcupine', 'porcupine'], ['014', 'elephant', 'elephant']]) {
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
  assert.equal(JSON.parse(stored.get(BONUS_KEY)).length, 6);
  assert.match(app.elements['dex-progress'].innerHTML, /7 of 13/);
  assert.equal(stored.get('ns_bingo_v3'), '{"keep":"exactly"}');
});

test('animal facts remain on the cards without outbound Mandai links', () => {
  const stored = new Map([[BONUS_KEY, JSON.stringify(BONUSES)]]);
  const app = boot({ stored });
  for (const key of BONUSES) {
    app.navigate('#' + key);
    assert.match(app.view.innerHTML, /One true thing/);
    assert.ok(!app.view.innerHTML.includes('mandai.com'));
    assert.ok(!app.view.innerHTML.includes('Animal facts: Mandai'));
  }
});

test('the original three bonus saves remain valid and only the new trio starts locked', () => {
  const stored = new Map([[BONUS_KEY, '["tapir","flyingsquirrel","flyingfox"]'], ['ns_dex_met', '["otter"]']]);
  const app = boot({ stored });
  assert.match(app.elements['dex-progress'].innerHTML, /5 of 13/);
  assert.equal((app.view.innerHTML.match(/is-shadow is-bonus/g) || []).length, 3);
  for (const key of BONUSES.slice(0, 3)) assert.ok(app.view.innerHTML.includes('img/' + key + '.webp'));
  for (const key of BONUSES.slice(3)) {
    app.navigate('#' + key);
    assert.match(app.view.innerHTML, /data-bonus-guess/);
  }
  app.guess('elephant');
  assert.deepEqual(JSON.parse(stored.get(BONUS_KEY)), ['tapir', 'flyingsquirrel', 'flyingfox', 'elephant']);
  assert.equal(stored.get('ns_dex_met'), '["otter"]');
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

test('card navigation reaches all three additions and skips the sealed mystery', () => {
  const app = boot({ hash: '#no011' });
  for (const number of ['012', '013', '014']) {
    app.key('ArrowRight');
    assert.equal(app.location.hash, '#no' + number);
    assert.match(app.view.innerHTML, /data-bonus-guess/);
  }
  app.key('ArrowRight');
  assert.equal(app.location.hash, '#no001');
  app.key('ArrowLeft');
  assert.equal(app.location.hash, '#no014');
});

test('navigation links sit outside bingo rendering, and new images are cached locally', () => {
  const bingo = read('bingo.html');
  assert.ok(bingo.indexOf('href="pokedex.html"') < bingo.indexOf('id="app"'));
  assert.match(read('pokedex.html'), /href="bingo.html"/);
  const sw = read('sw.js');
  for (const key of [...BONUSES, ...[1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14].map(n => 'shadow-' + String(n).padStart(3, '0'))]) {
    assert.ok(fs.existsSync(path.join(root, 'img', key + '.webp')));
    assert.ok(sw.includes('img/' + key + '.webp'));
  }
  assert.ok(read('pokedex.html').indexOf('bonus-quests.js') < read('pokedex.html').indexOf('pokedex.js'));
});

const CORE = ['otter', 'dhole', 'loris', 'pangolin', 'fishingcat', 'tiger', 'binturong'];
const completed = () => new Map([['ns_dex_met', JSON.stringify(CORE)], [BONUS_KEY, JSON.stringify(BONUSES)]]);

test('keepsakes stay hidden until all thirteen collectible cards are unlocked', () => {
  for (const hash of ['', '#keepsakes']) {
    const app = boot({ hash });
    assert.match(app.view.innerHTML, /Collect all 13 animal cards/);
    assert.ok(!app.view.innerHTML.includes('img/reward-'));
    assert.ok(!app.view.innerHTML.includes('data-save-keepsake'));
    assert.match(app.view.innerHTML, /The unidentified card can wait/);
  }
  for (const missing of BONUSES) {
    const stored = completed();
    stored.set(BONUS_KEY, JSON.stringify(BONUSES.filter(k => k !== missing)));
    assert.ok(!boot({ stored }).view.innerHTML.includes('data-save-keepsake'));
  }
});

test('all thirteen unlock three keepsakes without needing the sealed mystery', () => {
  const app = boot({ stored: completed(), hash: '#keepsakes' });
  assert.equal((app.view.innerHTML.match(/data-save-keepsake=/g) || []).length, 3);
  for (const theme of ['play', 'meal', 'tour']) assert.match(app.view.innerHTML, new RegExp('img/reward-' + theme + '.webp'));
  assert.match(app.view.innerHTML, /data-locked="1"/);
  assert.ok(app.view.innerHTML.indexOf('data-locked="1"') > app.view.innerHTML.indexOf('data-idx="14"'));
  assert.equal(app.focused.at(-1), 'keepsakes-title');
  assert.equal(app.scrolls.at(-1), 'keepsakes-title');
  assert.match(app.elements['dex-progress'].innerHTML, /13 of 13/);
});

test('the last bonus or sighting announces the reward and offers a direct route', () => {
  for (const last of ['elephant', 'otter']) {
    const stored = completed();
    stored.set(last === 'otter' ? 'ns_dex_met' : BONUS_KEY, JSON.stringify((last === 'otter' ? CORE : BONUSES).filter(k => k !== last)));
    const app = boot({ stored, hash: '#' + last });
    if (last === 'otter') app.click('data-unlock', '1'); else app.guess('elephant');
    assert.match(app.view.innerHTML, /data-show-keepsakes/);
    assert.match(app.elements['dex-live'].textContent, /three group pictures are ready/);
    app.click('data-show-keepsakes');
    assert.equal(app.location.hash, '#keepsakes');
    assert.match(app.view.innerHTML, /data-save-keepsake/);
  }
});

test('a forged reward click cannot save before completion', () => {
  const app = boot();
  let calls = 0;
  app.context.window.KEEPSAKES.save = () => { calls++; };
  app.click('data-save-keepsake', 'play');
  app.click('data-show-keepsakes');
  assert.equal(calls, 0);
  assert.equal(app.location.hash, '');
});

test('gallery anchors focus correctly even when already on the card grid', () => {
  const app = boot({ stored: completed() });
  app.navigate('#keepsakes');
  assert.equal(app.focused.at(-1), 'keepsakes-title');
  assert.equal(app.scrolls.at(-1), 'keepsakes-title');
});

test('save feedback handles download, sharing, cancellation and failure gently', async () => {
  for (const outcome of ['downloaded', 'shared', 'cancelled', 'error']) {
    const app = boot({ stored: completed() });
    let finish;
    app.context.window.KEEPSAKES.save = () => new Promise((resolve, reject) => { finish = () => outcome === 'error' ? reject(Error('oops')) : resolve(outcome); });
    const button = app.click('data-save-keepsake', 'play');
    assert.equal(button.disabled, true);
    assert.match(button.textContent, /Preparing/);
    finish();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(button.disabled, false);
    assert.equal(button.textContent, 'Save / share PNG');
    const messages = { downloaded: /download has started/, shared: /share sheet/, cancelled: /No rush/, error: /View full size/ };
    assert.match(app.elements['keepsake-status'].textContent, messages[outcome]);
  }
});
