# Night Safari Adventure 🌙

A little choose-your-own-evening story that ends in a "Safari ID" card, a practical
plan page, a bingo card for the park, and a follow-up page for the morning after.

Static site. No build step, no dependencies. Live at
<https://lecolearning.github.io/night-safari/>

## Pages

| Page | What it is |
|---|---|
| `index.html` + `quiz.js` | The story. `CONFIG` at the top of `quiz.js` holds the names and which animal YA is. `ANIMALS` and `STORY` hold all the copy. |
| `plan.html` | Before you go: park times, transport, what to wear. Static HTML, no JS. |
| `bingo.html` + `bingo.js` | The bingo card for the walk. Each phone keeps its own card in localStorage. |
| `sunday.html` + `sunday.js` | Case 002, to send the morning after. Reads the bingo photos off the phone and shows them back as evidence. |
| `pokedex.html` + `pokedex.js` + `pokedex.css` | Seven quiz friends, six silhouette-guess bonus cards, synthesised calls, and a sealed No. 008. |
| `calls.html` + `calls.js` + `calls.css` | "Who's that call?" — an optional listening game. Entirely a side road; see below. |
| `bonus-quests.js` | Forgiving name matching and optional clues for the six bonus shadows. |
| `animal-calls.js` | The synthesised calls, shared by the field guide and the calls game. No audio files. |
| `collection.js` | The one reader for who this phone has met, so no two pages can disagree. |
| `config.js` | Who the site is for. `NAMES_ON` switches real names on or off site-wide. This is the only file that holds them. |
| `animals.js` | Thirteen animals; `QUIZ_ANIMAL_KEYS` keeps the story's original seven outcomes, `ANIMAL_SHORT` the short names. |
| `art.js` + `img/` | WebP characters, matching raster silhouettes and scenes. Original portraits have SVG fallbacks; bonus portraits have simple icon fallbacks. |
| `sky.js` | Stars, moon, fireflies, treeline. |
| `sw.js` + `manifest.webmanifest` | Offline support and add-to-home-screen. |

## Offline

`sw.js` precaches every page and image on first visit, so the site works with no
signal at the park. **Bump `VERSION` in `sw.js` whenever you change any file**,
otherwise phones that already visited will keep serving the old cached copy.

## Artwork

Source PNGs live in `.orig_img/`, which is not committed. To regenerate the WebP
files after adding art, resize scenes to 1100px wide and portraits to 720px square,
then save as WebP at quality 88 to 90. Prompts for generating more art are in
`PROMPTS.md`.

## Two sizes

A card starts **4 × 4**: sixteen squares, fifteen to fill. If the night is going well,
one button on the board makes it **5 × 5** — twenty-five squares, twenty-four to fill.

**Growing keeps everything.** The sixteen squares already on the card stay on the card,
in the same row and the same column, with their marks, their photos and the times they
happened. The card gains a row along the bottom and a column down the right, so only the
stride between rows changes and every index shifts with it (`grownIndex`); photos are
re-keyed to match. The write is all-or-nothing, like a restore: if the phone refuses,
the card goes back exactly as it was.

Nine new squares fill in around them. Three come from the night — see below — and six
are this phone's own. Lines get longer, so finished lines are worked out afresh: a
four-in-a-row is no longer a whole line, and bingos start again. Growing is one way;
there is no honest way to shrink a card without throwing nine squares, and whatever is
on them, away. Each player chooses for their own card, and a fresh card comes back at
whatever size you were playing.

Everything about a card's shape comes from that one number, so both sizes run through
exactly the same code: `cellsOf`, `freeOf`, `momentsOf`, `wildlifeOf`, `linesOf`. The
free square is at row 2, column 2 either way, which is on the ↘ diagonal of both grids.
A saved card's size is read from how many squares it has, so cards saved before any of
this simply open as 4 × 4.

Five squares of prose across a 360px phone is genuinely tight: the big card steps the
type down to 9.5px and lets a long word break rather than spill. On a normal-width
phone it has room to spare.

## Six squares in common

**Six of the fifteen** — four wildlife, two little moments — are dealt from the date
rather than from chance, so they land on both phones. They wear a dotted top edge and a
small `both` in the corner, and they are the race. The other nine are each phone's own
draw, so the card still feels like yours.

A 5 × 5 shares **nine**: the same six plus three more. The small card's six are the first
six of the big card's nine, drawn from the same seeded shuffle, so growing never disturbs
a square that is already there. A small card also keeps clear of all nine from the start,
so its own draw can never collide with the three it might want later.

It needs no server, no signal and no pairing. The night rolls over at 4am, so a card
started at 23:50 and one started at 00:10 still share their six. A card carried over
from an earlier night keeps that night's six and says so; a fresh card keeps tonight's
six and redraws the other nine. Cards dealt before any of this simply have none marked.

Cards still do not sync: marks, photos and progress stay on the phone that made them.

## The night, in order

Every tick records the time it happened, so the end-of-night summary is a timeline
rather than a list, with a line saying how long the evening ran. The keepsake sheet
prints each photo's time under its label. Cards saved before this existed still open;
their squares simply sort to the bottom with no time to show.

## Taking a square off again

Marking is one tap. Unmarking wants two: the first tap on a marked square only asks,
showing "tap again" on the square and a line above the grid, and the second one does it.
A pocket or a dark path finds squares all by itself, and an accidental untick would take
the moment *and* the time it happened.

The question puts itself down after six seconds, and any other tap — another square, the
📷, a player switch, Escape — answers it "no". The free square is never markable either way.

## Bingo and the field guide

Ticking a wildlife square is a sighting, so `bingo.js` writes it straight into the
field guide on the same phone:

- one of the **seven quiz friends** is simply met, and its card opens (`ns_dex_met`);
- one of the **six bonuses** only gets a "spotted for real" stamp (`ns_dex_wild_v1`),
  because those cards are earned by naming a silhouette, not by standing in front of one.

Adding only, never removing: unticking a square leaves the field guide alone, and a
mistap is undone on the card itself, where "I was wrong, put this one back" already
lives. `collection.js` is the single reader for all of this, so the field guide and
the calls game can never disagree about who may be named out loud.

## Who's that call? (optional)

`calls.html` plays one synthesised call and offers four names. No timer, no penalty,
no leaderboard, and nothing is saved — a reload starts a fresh round.

It is deliberately a side road. Nothing depends on it, nothing links to it from the
bingo card, and it is not in the top navigation. The only way in is a single button at
the bottom of the field guide, which appears **only once four animals have been met**,
plus a footer link. It names only animals this phone has already met: a call from a
card still in shadow would give the silhouette away.

## Field guide bonuses

The lilac double-bordered cards 009–014 unlock by naming their silhouettes:
tapir, flying squirrel, flying fox (or fruit bat), owl, porcupine, and elephant. Full species names count,
and matching ignores case, spacing and punctuation. Three optional clues build
up without a timer, penalty or attempt limit. A correct guess reveals the colour
portrait and saves the unlock under `ns_dex_bonus_v1` on this device. These are
game discoveries, not real-world sightings. The original seven still unlock as
before; existing quiz results, sightings, bingo cards and photos are preserved.

All thirteen silhouettes use `img/shadow-NNN.webp`, matching the finished portraits.
No. 008 stays sealed for Case 002 and is always displayed last. Bingo and the field guide have persistent
links to each other outside the dynamic page content.

Bonus animal facts were checked against Mandai's [Malayan tapir](https://www.mandai.com/en/night-safari/animals-and-zones/malayan-tapir.html),
[Pangolin Trail](https://www.mandai.com/en/night-safari/animals-and-zones/pangolin-trail.1501917253627.html),
and [Malayan flying fox](https://www.mandai.com/en/night-safari/animals-and-zones/malayan-flying-fox.html) pages.
The new trio's facts use the [animal directory](https://www.mandai.com/en/night-safari/animals-and-zones.html)
and [Brazilian porcupine introduction](https://www.mandai.com/en/about-mandai/media-centre/new-walk-in-civet-exhibit-and-new-species-debut-at-night-safari.html).
These research references stay in documentation; animal cards have no outbound Mandai links.

Cards 012–014 carry one small accessory each: the fish-owl's upside-down park map,
the porcupine's sage sling bag with one yellow flower, and the elephant's picnic
basket with two snack parcels. Matching silhouette assets include the accessories,
but conceal all internal colour and detail. PNG originals stay in `.orig_img/`;
the site loads compact WebP copies only. The final trio portraits use the `-flat.png`
revisions, simplified against the original otter and seven-character sheet.

## The collection reward

Unlock all thirteen collectible cards (seven quiz friends and six silhouette
bonuses) to reveal three group keepsakes: playtime, a shared picnic, and a night
tour. The sealed No. 008 is deliberately excluded. Finishing either a sighting
or a bonus guess offers a direct button to the gallery; `pokedex.html#keepsakes`
opens it again after completion. Progress stays on this device, as before.

Each scene includes all thirteen animals in the same simple doodle style, with
the otter holding its pink heart. The gallery serves full-resolution WebP art;
Save / share PNG converts it locally at its original dimensions, without uploads.
Supporting phones offer a file share sheet; otherwise it downloads a PNG.
Cancelling sharing does not trigger an unwanted download. A full-size image link
also allows a manual save if the browser cannot prepare the PNG. The three images
and export code are included in the offline cache. This is a playful unlock, not
access control; the public image files are not encrypted.

## Dev shortcuts

- `index.html?step=4` jumps into the story at beat 4.
- `index.html?result=otter` shows a result card. Valid: `otter`, `dhole`, `loris`,
  `pangolin`, `fishingcat`, `tiger`, `binturong`.
- `bingo.html?who=Onion` skips the player picker. Use whatever labels `config.js` is set to.
- The six shared squares are seeded by the date, so they are the same all evening and
  on both phones. To see a different six, change the system date.

## The bingo password

`bingo.html` is locked behind one word, since the story is sent ahead of the night.
The word is `mirepoix`: onion, carrot and celery. Matching ignores case and spaces,
wrong guesses get four escalating hints, and the unlock is remembered per phone in
`localStorage`. It is a soft lock for fun, not security: the word is in `bingo.js`
and anyone reading the source can find it.

## Tests

```bash
node --test tests/*.test.cjs
```

## Deploy

```bash
git add . && git commit -m "..." && git push
```

GitHub Pages serves `main` from the repo root. Changes appear in about a minute.
