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
| `pokedex.html` + `pokedex.js` + `pokedex.css` | Seven quiz friends, three silhouette-guess bonus cards, synthesised calls, and a sealed No. 008. |
| `bonus-quests.js` | Forgiving name matching and optional clues for the three bonus shadows. |
| `config.js` | Who the site is for. `NAMES_ON` switches real names on or off site-wide. This is the only file that holds them. |
| `animals.js` | Ten animals; `QUIZ_ANIMAL_KEYS` keeps the story's original seven outcomes. |
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

## Field guide bonuses

The lilac double-bordered cards 009–011 unlock by naming their silhouettes:
tapir, flying squirrel, and flying fox (or fruit bat). Full species names count,
and matching ignores case, spacing and punctuation. Three optional clues build
up without a timer, penalty or attempt limit. A correct guess reveals the colour
portrait and saves the unlock under `ns_dex_bonus_v1` on this device. These are
game discoveries, not real-world sightings. The original seven still unlock as
before; existing quiz results, sightings, bingo cards and photos are preserved.

All ten silhouettes use `img/shadow-NNN.webp`, matching the finished portraits.
No. 008 stays sealed for Case 002. Bingo and the field guide have persistent
links to each other outside the dynamic page content.

Bonus animal facts were checked against Mandai's [Malayan tapir](https://www.mandai.com/en/night-safari/animals-and-zones/malayan-tapir.html),
[Pangolin Trail](https://www.mandai.com/en/night-safari/animals-and-zones/pangolin-trail.1501917253627.html),
and [Malayan flying fox](https://www.mandai.com/en/night-safari/animals-and-zones/malayan-flying-fox.html) pages.

## Dev shortcuts

- `index.html?step=4` jumps into the story at beat 4.
- `index.html?result=otter` shows a result card. Valid: `otter`, `dhole`, `loris`,
  `pangolin`, `fishingcat`, `tiger`, `binturong`.
- `bingo.html?who=Onion` skips the player picker. Use whatever labels `config.js` is set to.

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
