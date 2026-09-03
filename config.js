/* ============================================================
   Who this site is for.

   Set NAMES_ON to true to use real first names anywhere they would
   normally appear. Set it to false and the site falls back to the
   vegetable aliases it already runs on, so nothing personally
   identifying is published. Everything else reads from PEOPLE, so
   this one flag is the only thing to change.
   ============================================================ */

const NAMES_ON = false;

const REAL = { her: 'XJ', me: 'YA' };
const ALIAS = { her: 'Onion', me: 'Carrot' };

const PEOPLE = {
  namesOn: NAMES_ON,
  her: NAMES_ON ? REAL.her : ALIAS.her,
  me: NAMES_ON ? REAL.me : ALIAS.me,
  herVeg: 'onion',
  meVeg: 'carrot',
};

/* Phrases that need different wording depending on the switch,
   so neither version reads awkwardly. */
PEOPLE.byline = NAMES_ON
  ? `Conducted by ${PEOPLE.me}, certified carrot, on behalf of ${PEOPLE.her}.`
  : 'Conducted by one certified carrot, on behalf of one onion.';

PEOPLE.sendResults = NAMES_ON ? `Send my results to ${PEOPLE.me}` : 'Send my results';

PEOPLE.copied = NAMES_ON
  ? `Copied. Paste it to ${PEOPLE.me} 🐾`
  : 'Copied. Paste it into the chat 🐾';

// Subject of the share message: "XJ is a Fishing Cat" vs "I am a Fishing Cat".
PEOPLE.subjectIs = (what) => (NAMES_ON ? `${PEOPLE.her} is a ${what}` : `I am a ${what}`);

// The "(formerly onion)" line is redundant when the label already says Onion.
PEOPLE.formerly = (veg) => (NAMES_ON ? `<br>(formerly ${veg})` : '');

// Bingo player labels, which must work on two separate phones.
PEOPLE.players = NAMES_ON ? [REAL.her, REAL.me] : [ALIAS.her, ALIAS.me];

if (typeof window !== 'undefined') {
  window.PEOPLE = PEOPLE;
  window.NAMES_ON = NAMES_ON;
}
if (typeof module !== 'undefined' && module.exports) module.exports = { PEOPLE, NAMES_ON };
