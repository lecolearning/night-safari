/* Case 002 — the morning after. Reads whatever the bingo card saved on this
   phone and shows it back as "evidence". Everything stays local. */

const CONFIG = { her: 'XJ', me: 'YA' };
const app = document.getElementById('app');

/* ---------- read the bingo leftovers, defensively ---------- */
function readBingo() {
  const out = { marked: 0, total: 0, photos: [], player: null };
  let keys = [];
  try { keys = Object.keys(localStorage); } catch (e) { return out; }

  for (const k of keys) {
    if (!/bingo|ns_/i.test(k)) continue;
    let v;
    try { v = JSON.parse(localStorage.getItem(k)); } catch (e) { continue; }
    if (!v || typeof v !== 'object') continue;
    collect(v, out);
  }
  out.photos = out.photos.slice(0, 12);
  return out;
}

function collect(node, out, depth) {
  depth = depth || 0;
  if (depth > 4 || !node || typeof node !== 'object') return;

  if (Array.isArray(node)) {
    // a marked-state array of booleans
    if (node.length && node.every((x) => typeof x === 'boolean')) {
      out.marked = Math.max(out.marked, node.filter(Boolean).length);
      out.total = Math.max(out.total, node.length);
    }
    node.forEach((v) => collect(v, out, depth + 1));
    return;
  }

  for (const [k, v] of Object.entries(node)) {
    if (typeof v === 'string' && v.startsWith('data:image/')) {
      if (!out.photos.includes(v)) out.photos.push(v);
    } else if (typeof v === 'string' && /^(XJ|YA)$/i.test(v) && /who|player|name/i.test(k)) {
      out.player = v;
    } else {
      collect(v, out, depth + 1);
    }
  }
}

/* ---------- render ---------- */
const b = readBingo();
const hasEvidence = b.photos.length > 0 || b.marked > 0;

const tally = [
  b.marked ? `${b.marked} square${b.marked === 1 ? '' : 's'} marked` : null,
  b.photos.length ? `${b.photos.length} photograph${b.photos.length === 1 ? '' : 's'} recovered` : null,
].filter(Boolean);

app.innerHTML = `
  <div class="card story tilt-l">
    <div class="scenebox"><img class="scene" src="img/scene_drum.webp" alt="A quiet night scene with glowing eyes in the undergrowth"></div>
    <span class="tag lilac">Case 002</span>
    <h1 class="pixel">Opened</h1>
    <p>Filed the morning after, by the carrot, with a slight headache and no regrets.</p>
  </div>

  <div class="card peach tilt-r">
    <span class="tag">Evidence log</span>
    ${hasEvidence
      ? `<p>Recovered from your phone. ${tally.join(', ')}.</p>`
      : `<p>The evidence log on this phone is empty. Either you were far too busy looking at animals to tap squares, which is the correct way to do a safari, or you are reading this on a different phone.</p>`}
    ${b.photos.length ? `<div class="evidence">${b.photos.map((p, i) =>
      `<figure><img src="${p}" alt="Photo ${i + 1} from Saturday" loading="lazy"><figcaption>Exhibit ${String(i + 1).padStart(2, '0')}</figcaption></figure>`).join('')}</div>` : ''}
  </div>

  <div class="card tilt-l">
    <span class="tag mint">The part I could not declassify on Thursday</span>
    <p>There is one creature on the Night Safari list that we did not find on Saturday.</p>
    <p>The field notes describe it like this. It appears only in the presence of two people who go back to the same place on purpose. It cannot be photographed. It is recognisable mainly by the fact that the evening goes far too quickly.</p>
    <p><b>Specimen 002: still unidentified.</b></p>
    <div class="mission">
      <b>Recommendation 🔎</b>
      Further study required. Ideally somewhere with better lighting, and a shorter queue.
    </div>
  </div>

  <div class="card peach tilt-r">
    <span class="tag">Reply to the investigator</span>
    <p class="small muted">Tap one. It writes the message, you send it, I do the rest.</p>
    <div class="stack">
      <button class="btn" onclick="reply('I am in. Case 002 stays open.')">I am in</button>
      <button class="btn mint" onclick="reply('Yes, but somewhere with better lighting this time.')">Yes, but better lighting</button>
      <button class="btn coral" onclick="reply('Same place. More pangolins. I have unfinished business with that tram.')">Same place, more pangolins</button>
    </div>
  </div>
`;

async function reply(text) {
  const msg = `${text} 🔎 — ${CONFIG.her}`;
  try { if (navigator.share) { await navigator.share({ text: msg }); return; } } catch (e) { /* cancelled */ }
  try { await navigator.clipboard.writeText(msg); toast('Copied. Send it to ' + CONFIG.me + ' 🐾'); }
  catch (e) { prompt('Copy this:', msg); }
}
