const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const MET = 'ns_dex_met';
const EARNED = 'ns_dex_bonus_v1';
const SPOTTED = 'ns_dex_wild_v1';

// The listening game at its DOM boundary. No sound is made: the shared calls
// module is loaded for real and only its `play` is stood in for, so the pool
// rules, the tally and the wording are all the actual ones.
function boot({ stored = new Map(), storageDenied = false, plays = 'played' } = {}) {
  const handlers = {};
  const played = [];
  const focused = [];
  const live = { textContent: '' };
  const app = {
    innerHTML: '',
    addEventListener: (name, fn) => { handlers[name] = fn; },
    querySelector: () => ({ focus: () => focused.push('heading') }),
  };
  const context = vm.createContext({
    window: { ART: { portrait: key => '<img class="art" src="img/' + key + '.webp">' } },
    document: { getElementById: id => (id === 'app' ? app : id === 'calls-live' ? live : null) },
    localStorage: {
      getItem(key) { if (storageDenied) throw Error('Denied'); return stored.get(key) ?? null; },
      setItem(key, value) { if (storageDenied) throw Error('Denied'); stored.set(key, value); },
    },
    setTimeout() {},
  });
  for (const file of ['animals.js', 'collection.js', 'animal-calls.js']) {
    vm.runInContext(read(file), context, { filename: file });
  }
  // Stand in for the speaker, before the game gets hold of the module.
  vm.runInContext(`window.ANIMAL_CALLS.play = (key) => { globalThis.__played.push(key); return ${JSON.stringify(plays)}; };
    globalThis.__played = globalThis.__played || [];`, context);
  context.__played = played;
  vm.runInContext(read('calls.js'), context, { filename: 'calls.js' });

  const press = attribute => {
    const button = {
      hasAttribute: name => name === attribute,
      getAttribute: () => null,
      matches: () => false,
    };
    handlers.click({ target: { closest: selector => (selector === 'button' ? button : null) } });
  };
  const pick = key => {
    const button = {
      hasAttribute: name => name === 'data-pick',
      getAttribute: name => (name === 'data-pick' ? key : null),
      matches: () => false,
    };
    handlers.click({ target: { closest: selector => (selector === 'button' ? button : null) } });
  };
  return { app, live, played, focused, press, pick, stored, context,
    read: code => JSON.parse(vm.runInContext(`JSON.stringify(${code})`, context)) };
}

const four = () => new Map([[MET, '["otter","dhole","loris"]']]);   // plus his fishing cat: four

test('the game waits politely until four animals have been met', () => {
  const page = boot({ stored: new Map() });
  assert.match(page.app.innerHTML, /needs <b>four<\/b> animals/);
  assert.match(page.app.innerHTML, /You have <b>1<\/b>/, 'his fishing cat is the only given');
  assert.match(page.app.innerHTML, /bingo\.html/);
  assert.match(page.app.innerHTML, /pokedex\.html/);
  assert.equal(page.app.innerHTML.includes('data-go'), false, 'and there is nothing to start');

  const nearly = boot({ stored: new Map([[MET, '["otter","dhole"]']]) });
  assert.match(nearly.app.innerHTML, /You have <b>3<\/b>/);
  assert.equal(nearly.app.innerHTML.includes('Start listening'), false);
});

test('four animals is enough, and the intro says how many are playing', () => {
  const page = boot({ stored: four() });
  assert.match(page.app.innerHTML, /Who’s that call\?/);
  assert.match(page.app.innerHTML, /Playing with the <b>4<\/b> animals/);
  assert.match(page.app.innerHTML, /Start listening/);
  assert.match(page.app.innerHTML, /an impression, not a recording/);
});

test('a question plays one call and offers four names, the right one among them', () => {
  const page = boot({ stored: four() });
  page.press('data-go');
  assert.equal(page.played.length, 1, 'exactly one call, and only after a tap');
  const options = [...page.app.innerHTML.matchAll(/data-pick="([a-z]+)"/g)].map(m => m[1]);
  assert.equal(options.length, 4);
  assert.equal(new Set(options).size, 4, 'no animal is offered twice');
  assert.ok(options.includes(page.played[0]), 'the animal that made the sound is on offer');
  assert.match(page.app.innerHTML, /Call <b>1<\/b> of 8/);
  assert.match(page.app.innerHTML, /Play it again/);
  page.press('data-again');
  assert.deepEqual(page.played, [page.played[0], page.played[0]], 'the same call, replayed');
});

test('it never names an animal this phone has not met', () => {
  const stored = new Map([[MET, '["otter","dhole","loris","tiger"]'],
    [EARNED, '["tapir"]'], [SPOTTED, '["owl","porcupine"]']]);
  const allowed = new Set(['otter', 'dhole', 'loris', 'tiger', 'fishingcat', 'tapir']);
  const page = boot({ stored });
  for (let i = 0; i < 40; i++) {
    page.press('data-go');
    for (const [, key] of page.app.innerHTML.matchAll(/data-pick="([a-z]+)"/g)) {
      assert.ok(allowed.has(key), `${key} has not been met`);
    }
    assert.ok(allowed.has(page.played[page.played.length - 1]));
  }
  // Spotting a bonus on the bingo card does not open its card, so it stays unnamed.
  assert.equal(page.app.innerHTML.includes('data-pick="owl"'), false);
  assert.equal(page.app.innerHTML.includes('data-pick="porcupine"'), false);
});

test('a right answer is warm about it, and a wrong one is not unkind', () => {
  const page = boot({ stored: four() });
  page.press('data-go');
  const target = page.played[0];
  page.pick(target);
  assert.match(page.app.innerHTML, /Yes — that was/);
  assert.match(page.app.innerHTML, /is-right/);
  assert.match(page.app.innerHTML, /1 named so far/);
  assert.match(page.live.textContent, /Yes, that was the .+\. 1 of 1 so far\./);
  assert.match(page.app.innerHTML, /One true thing/, 'and you learn something either way');
  assert.match(page.app.innerHTML, new RegExp('pokedex\\.html#' + target));

  page.press('data-go');
  const next = page.played[page.played.length - 1];
  const wrong = [...page.app.innerHTML.matchAll(/data-pick="([a-z]+)"/g)].map(m => m[1])
    .find(key => key !== next);
  page.pick(wrong);
  assert.match(page.app.innerHTML, /Not quite\. That was/);
  assert.match(page.app.innerHTML, /You said the /);
  assert.equal(page.app.innerHTML.includes('is-right'), false);
  assert.match(page.app.innerHTML, /1 named so far/, 'a wrong guess costs nothing but the point');
});

test('a tapped name is only counted once, and only while a call is waiting', () => {
  const page = boot({ stored: four() });
  page.press('data-go');
  const target = page.played[0];
  page.pick(target);
  page.pick(target);                                   // a second, hopeful tap
  assert.match(page.app.innerHTML, /1 named so far/);
  page.pick('binturong');                              // and a name that was never offered
  assert.match(page.app.innerHTML, /1 named so far/);
});

test('the round ends after eight calls and says how it went', () => {
  const page = boot({ stored: four() });
  for (let i = 0; i < 8; i++) {
    page.press('data-go');
    page.pick(page.played[page.played.length - 1]);    // a suspiciously good ear
  }
  assert.match(page.app.innerHTML, /Call <b>8<\/b> of 8/);
  assert.match(page.app.innerHTML, /See how we did/);
  assert.equal(page.app.innerHTML.includes('Next call'), false);
  page.press('data-stop');
  assert.match(page.app.innerHTML, /<h1[^>]*>8 of 8<\/h1>/);
  assert.match(page.app.innerHTML, /The animals are slightly unnerved/);
  assert.match(page.app.innerHTML, /Nothing here was saved/);
  assert.match(page.live.textContent, /Round finished\. 8 of 8 calls named\./);

  page.press('data-restart');
  assert.match(page.app.innerHTML, /Call <b>1<\/b> of 8/, 'another round starts from nothing');
});

test('stopping early is always allowed, and counts what actually happened', () => {
  const page = boot({ stored: four() });
  page.press('data-go');
  page.press('data-stop');
  assert.match(page.app.innerHTML, /<h1[^>]*>0 of 1<\/h1>/);
  assert.match(page.app.innerHTML, /takes a sort of talent/);
});

test('a browser that will not make a sound says so once, kindly', () => {
  const page = boot({ stored: four(), plays: 'quiet' });
  page.press('data-go');
  assert.match(page.app.innerHTML, /would rather stay quiet/);
  assert.match(page.app.innerHTML, /pokedex\.html/);
  assert.equal(page.app.innerHTML.includes('data-pick'), false, 'nothing to guess at');
});

test('a call that will not come out is a nudge, not a dead end', () => {
  const page = boot({ stored: four() });
  page.press('data-go');
  vm.runInContext("window.ANIMAL_CALLS.play = () => 'broken';", page.context);
  page.press('data-again');
  assert.match(page.live.textContent, /would not play\. Try it once more\?/);
  assert.match(page.app.innerHTML, /data-pick/, 'the four names are still on offer');
});

test('a phone that will not remember anything still shows the waiting screen', () => {
  const page = boot({ storageDenied: true });
  assert.match(page.app.innerHTML, /needs <b>four<\/b> animals/);
  assert.match(page.app.innerHTML, /You have <b>1<\/b>/);
});
