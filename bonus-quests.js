/* Untimed silhouette guesses. Pure state transitions; no network or scorekeeping. */
(function () {
  const ANIMALS = {
    tapir: {
      aliases: ['tapir', 'malayan tapir', 'asian tapir'],
      outline: 'A round, sturdy body, little round ears and a short, curved snout.',
      clues: ['I forage for leaves and fruit with my flexible little snout.',
        'My grown-up coat is black and white, like a very relaxed formal outfit.',
        'My short name starts with T and rhymes with “caper”.'],
    },
    flyingsquirrel: {
      aliases: ['flying squirrel', 'giant flying squirrel', 'spotted giant flying squirrel', 'spotted flying squirrel'],
      outline: 'A small animal with a big fluffy tail and wide skin flaps between its outstretched legs.',
      clues: ['I take shortcuts between trees without flapping any wings.',
        'A stretchy membrane lets me glide. My tail is wonderfully fluffy.',
        'Two words: “flying” + the little nut-stashing animal with a bushy tail.'],
    },
    flyingfox: {
      aliases: ['flying fox', 'malayan flying fox', 'fruit bat', 'malayan fruit bat', 'large flying fox'],
      outline: 'Pointed ears, a fox-like muzzle and a pair of folded wings wrapped around a little body.',
      clues: ['Despite my mysterious looks, I am interested in fruit, nectar and flowers.',
        'I am a large bat with a fox-like face. My eyes and nose help me find supper.',
        '“Flying” + a pointy-eared woodland animal. “Fruit bat” counts too.'],
    },
    owl: {
      aliases: ['owl', 'fish owl', 'buffy fish owl', 'buffy owl'],
      outline: 'A round bird with two little head tufts, folded wings and small feet, holding a folded map.',
      clues: ['I am a bird, awake after dark. My map-reading is less impressive than my night vision.',
        'Fish, crabs and frogs can all be on my supper menu.',
        'My short name is three letters and starts with O. Think “hoot”.'],
    },
    porcupine: {
      aliases: ['porcupine', 'brazilian porcupine', 'prehensile tailed porcupine', 'tree porcupine'],
      outline: 'A rounded quilled animal with a long curling tail, a little sling bag and one flower tucked into it.',
      clues: ['My prickly coat is made of quills. The little flower is just for someone special.',
        'My long tail can grip branches to help me climb. I am not a hedgehog.',
        'My name starts with “porcu” and ends with “pine”.'],
    },
    elephant: {
      aliases: ['elephant', 'asian elephant', 'asiatic elephant'],
      outline: 'A large round-eared animal with a long curved trunk carrying a basket, and sturdy little legs.',
      clues: ['My long trunk is helping me carry a picnic for two.',
        'I am a very large plant-eating mammal. My Asian relatives have smaller ears than African ones.',
        'My name begins with E. Think trunk, big ears and a gentle giant.'],
    },
  };
  const KEYS = Object.keys(ANIMALS);
  const normalize = value => String(value == null ? '' : value).normalize('NFKC').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim().replace(/^(?:a|an|the)\s+/, '').replace(/\s/g, '');
  function create(key) {
    return KEYS.includes(key) ? { key, attempts: 0, hints: 0, complete: false,
      answer: '', message: 'Take a little guess. Common names count, and there is no rush.' } : null;
  }
  function guess(game, answer) {
    if (!game || !KEYS.includes(game.key) || game.complete) return false;
    game.answer = String(answer == null ? '' : answer).slice(0, 80);
    const value = normalize(game.answer);
    if (!value) { game.message = 'Pop a name in the box when you are ready.'; return false; }
    game.attempts++;
    game.complete = ANIMALS[game.key].aliases.some(alias => normalize(alias) === value);
    game.message = game.complete ? 'You found me! A new little friend for your collection.'
      : 'Not quite, but this little friend is happy to wait. Try again, or ask for a clue.';
    return game.complete;
  }
  function hint(game) {
    if (!game || !KEYS.includes(game.key) || game.complete) return false;
    game.hints = Math.min(game.hints + 1, ANIMALS[game.key].clues.length);
    return true;
  }
  const api = { KEYS, normalize, create, guess, hint,
    outline: key => KEYS.includes(key) ? ANIMALS[key].outline : '',
    clues: game => game && KEYS.includes(game.key) ? ANIMALS[game.key].clues.slice(0, game.hints) : [],
  };
  if (typeof window !== 'undefined') window.BONUS_QUESTS = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
