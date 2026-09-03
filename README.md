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
| `pokedex.html` + `pokedex.js` + `pokedex.css` | The nocturnal seven: collectible cards, detail files, synthesised animal calls, and a locked No. 008. |
| `config.js` | Who the site is for. `NAMES_ON` switches real names on or off site-wide. This is the only file that holds them. |
| `animals.js` | The seven animals, shared by the story and the Pokedex. |
| `art.js` + `img/` | Artwork. WebP characters and scenes, with inline SVG fallbacks if WebP fails. |
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

## Dev shortcuts

- `index.html?step=4` jumps into the story at beat 4.
- `index.html?result=otter` shows a result card. Valid: `otter`, `dhole`, `loris`,
  `pangolin`, `fishingcat`, `tiger`, `binturong`.
- `bingo.html?who=Onion` skips the player picker. Use whatever labels `config.js` is set to.

## Tests

```bash
node --test tests/bingo.test.cjs
```

## Deploy

```bash
git add . && git commit -m "..." && git push
```

GitHub Pages serves `main` from the repo root. Changes appear in about a minute.
