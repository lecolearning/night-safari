const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'collection.js'), 'utf8');

function boot({ stored = new Map(), denied = false } = {}) {
  const context = vm.createContext({
    window: {},
    localStorage: {
      getItem(key) { if (denied) throw Error('Denied'); return stored.get(key) ?? null; },
      setItem(key, value) { if (denied) throw Error('Denied'); stored.set(key, value); },
    },
  });
  vm.runInContext(source, context, { filename: 'collection.js' });
  return {
    stored,
    read: code => JSON.parse(vm.runInContext(`JSON.stringify(window.COLLECTION.${code})`, context)),
  };
}

test('his animal is always here, and hers arrives with the quiz result', () => {
  assert.deepEqual(boot().read('met()'), ['fishingcat']);
  assert.deepEqual(boot({ stored: new Map([['ns_result', 'otter']]) }).read('met()').sort(),
    ['fishingcat', 'otter']);
  // A quiz result that is not one of the seven is somebody else's business.
  for (const nonsense of ['tapir', 'badger', '', '__proto__']) {
    assert.deepEqual(boot({ stored: new Map([['ns_result', nonsense]]) }).read('met()'), ['fishingcat'], nonsense);
  }
  // Being both his animal and her result does not make him count twice.
  assert.deepEqual(boot({ stored: new Map([['ns_result', 'fishingcat']]) }).read('met()'), ['fishingcat']);
});

test('sightings and bonuses are read separately, and never mixed up', () => {
  const page = boot({ stored: new Map([
    ['ns_dex_met', '["otter","tiger"]'],
    ['ns_dex_bonus_v1', '["tapir","owl"]'],
    ['ns_dex_wild_v1', '["owl","porcupine"]'],
  ]) });
  assert.deepEqual(page.read('met()').sort(), ['fishingcat', 'otter', 'tiger']);
  assert.deepEqual(page.read('earned()'), ['tapir', 'owl']);
  assert.deepEqual(page.read('spotted()'), ['owl', 'porcupine']);
  // Everything whose name this phone has earned the right to see.
  assert.deepEqual(page.read('all()').sort(), ['fishingcat', 'otter', 'owl', 'tapir', 'tiger']);
  assert.equal(page.read('all()').includes('porcupine'), false,
    'a bonus only spotted on the bingo card is still a shadow');
});

test('a quiz friend cannot sneak into the bonuses, or the other way round', () => {
  const page = boot({ stored: new Map([
    ['ns_dex_met', '["tapir","otter"]'],           // a bonus in the sightings list
    ['ns_dex_bonus_v1', '["otter","tapir"]'],      // and a quiz friend in the bonuses
  ]) });
  assert.deepEqual(page.read('met()').sort(), ['fishingcat', 'otter']);
  assert.deepEqual(page.read('earned()'), ['tapir']);
});

test('scribbled, duplicated or missing lists all come back as nothing much', () => {
  for (const raw of ['{broken', 'null', '42', '"otter"', '{"otter":true}', '[]', '[null,7,{}]']) {
    const page = boot({ stored: new Map([['ns_dex_met', raw]]) });
    assert.deepEqual(page.read('met()'), ['fishingcat'], raw);
  }
  const twice = boot({ stored: new Map([['ns_dex_met', '["otter","otter","tiger","otter"]']]) });
  assert.deepEqual(twice.read('met()'), ['fishingcat', 'otter', 'tiger']);
  const overlap = boot({ stored: new Map([['ns_dex_met', '["fishingcat","otter"]']]) });
  assert.deepEqual(overlap.read('met()'), ['fishingcat', 'otter'], 'his own animal is not counted twice');
});

test('a browser that hands over nothing is a fine place to start', () => {
  const page = boot({ denied: true });
  assert.deepEqual(page.read('met()'), ['fishingcat']);
  assert.deepEqual(page.read('earned()'), []);
  assert.deepEqual(page.read('spotted()'), []);
  assert.equal(page.read('quizResult()'), null);
});

test('the keys are the same ones the bingo card and the field guide write', () => {
  const page = boot();
  assert.deepEqual(page.read('KEYS'), { met: 'ns_dex_met', earned: 'ns_dex_bonus_v1',
    spotted: 'ns_dex_wild_v1', result: 'ns_result' });
  const bingo = fs.readFileSync(path.join(__dirname, '..', 'bingo.js'), 'utf8');
  const dex = fs.readFileSync(path.join(__dirname, '..', 'pokedex.js'), 'utf8');
  for (const key of ['ns_dex_met', 'ns_dex_wild_v1']) {
    assert.ok(bingo.includes(`'${key}'`), `the bingo card writes ${key}`);
  }
  for (const key of ['ns_dex_met', 'ns_dex_bonus_v1', 'ns_dex_wild_v1']) {
    assert.ok(dex.includes(`'${key}'`), `the field guide reads ${key}`);
  }
  assert.deepEqual(page.read('CORE'),
    ['otter', 'dhole', 'loris', 'pangolin', 'fishingcat', 'tiger', 'binturong']);
  assert.deepEqual(page.read('BONUS'),
    ['tapir', 'flyingsquirrel', 'flyingfox', 'owl', 'porcupine', 'elephant']);
});
