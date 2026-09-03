const { test } = require('node:test');
const assert = require('node:assert/strict');
const quests = require('../bonus-quests.js');

for (const [key, aliases] of Object.entries({
  tapir: ['tapir', 'Malayan Tapir', ' the Asian tapir! '],
  flyingsquirrel: ['flying squirrel', 'Spotted Giant Flying Squirrel', 'a flying-squirrel'],
  flyingfox: ['flying fox', 'MALAYAN FLYING FOX', 'Fruit Bat', 'large flying fox'],
  owl: ['owl', 'BUFFY FISH-OWL', 'a fish owl'],
  porcupine: ['porcupine', 'Brazilian Porcupine', 'a prehensile-tailed porcupine'],
  elephant: ['elephant', 'Asian Elephant', 'the asiatic elephant'],
})) {
  test(key + ' accepts familiar names and harmless formatting', () => {
    for (const alias of aliases) {
      const game = quests.create(key);
      assert.equal(quests.guess(game, alias), true, alias);
      assert.equal(game.complete, true);
      assert.equal(quests.guess(game, alias), false, 'a completed card cannot be awarded twice');
    }
  });
  test(key + ' offers three accumulating clues without a penalty or lockout', () => {
    const game = quests.create(key);
    assert.ok(quests.outline(key).length > 30);
    assert.equal(quests.guess(game, '   '), false);
    assert.equal(game.attempts, 0);
    for (let i = 0; i < 50; i++) {
      quests.guess(game, 'onion');
      quests.hint(game);
    }
    assert.equal(game.complete, false);
    assert.equal(game.hints, 3);
    assert.equal(quests.clues(game).length, 3);
    assert.equal(quests.guess(game, aliases[0]), true);
  });
}
test('unknown keys, broad partial names and blank answers never earn a card', () => {
  for (const key of ['otter', '__proto__', 'constructor', '', null]) {
    assert.equal(quests.create(key), null);
    assert.equal(quests.guess({ key }, 'tapir'), false);
    assert.equal(quests.hint({ key }), false);
  }
  for (const key of quests.KEYS) {
    for (const name of ['', null, 'fox', 'squirrel', 'bat', 'tap', '<script>']) {
      assert.equal(quests.guess(quests.create(key), name), false);
    }
  }
});
