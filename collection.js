/* ============================================================
   Who this phone has actually met.

   One reader, so the field guide and the calls game can never
   disagree about which animals are allowed to be named out loud.
   Reading only: unlocking still belongs to whichever page does the
   unlocking. A browser that will not hand anything over simply
   reports an empty collection, which is a fine place to start.
   ============================================================ */
(function () {
  const CORE = ['otter', 'dhole', 'loris', 'pangolin', 'fishingcat', 'tiger', 'binturong'];
  const BONUS = ['tapir', 'flyingsquirrel', 'flyingfox', 'owl', 'porcupine', 'elephant'];
  const HIS = 'fishingcat';        // his animal, same as CONFIG.myAnimal in quiz.js
  const KEYS = {
    met: 'ns_dex_met',             // quiz friends stood in front of, here or on the bingo card
    earned: 'ns_dex_bonus_v1',     // bonus cards won by naming a silhouette
    spotted: 'ns_dex_wild_v1',     // bonus animals also ticked on the bingo card
    result: 'ns_result',           // her animal, once the story has had its say
  };

  // Known ids only, once each. Anything else is somebody else's typing.
  function readList(key, allowed) {
    let raw;
    try { raw = localStorage.getItem(key); } catch (e) { return []; }
    let value;
    try { value = JSON.parse(raw || '[]'); } catch (e) { return []; }
    if (!Array.isArray(value)) return [];
    return value.filter((k, i) => allowed.indexOf(k) >= 0 && value.indexOf(k) === i);
  }
  const unique = (list) => list.filter((k, i) => list.indexOf(k) === i);

  function quizResult() {
    try {
      const saved = localStorage.getItem(KEYS.result);
      return CORE.indexOf(saved) >= 0 ? saved : null;
    } catch (e) { return null; }
  }
  // Two come free: his fishing cat, and hers the moment the quiz has spoken.
  const auto = () => unique([HIS, quizResult()].filter(Boolean));

  const met = () => unique(auto().concat(readList(KEYS.met, CORE)));
  const earned = () => readList(KEYS.earned, BONUS);
  const spotted = () => readList(KEYS.spotted, BONUS);
  // Every card whose name this phone has earned the right to see.
  const all = () => met().concat(earned());

  const api = { CORE, BONUS, HIS, KEYS, readList, quizResult, auto, met, earned, spotted, all };
  if (typeof window !== 'undefined') window.COLLECTION = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
