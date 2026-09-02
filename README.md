# Night Safari Adventure 🌙

A tiny choose-your-own-evening story that ends in a "Safari ID" card, plus a bingo card for the park.
Static site, no build step, no dependencies. Open `index.html` or host it anywhere.

## Files

| File | What it is |
|---|---|
| `index.html` + `quiz.js` | The story. `CONFIG` at the top of `quiz.js` holds the names and your animal. `ANIMALS` and `STORY` are all the copy. |
| `bingo.html` + `bingo.js` | Bingo: `WILDLIFE` and `TOGETHER` are the square pools, `NAMES` the players. Separate cards live in each phone's localStorage. |
| `art.js` + `img/` | Matching PNG characters and story scenes, with inline SVG fallbacks. |
| `sky.js` | Stars, moon, fireflies, treeline. |
| `style.css` | Styles. |

## Dev shortcuts

- `index.html?step=4` jumps into the story at beat 4.
- `index.html?result=otter` shows a result card (`otter`, `dhole`, `loris`, `pangolin`, `fishingcat`, `tiger`, `binturong`).
- `bingo.html?who=XJ` skips the player picker and resumes XJ's card without resetting it.

## Bingo checks

Run `node --test tests/bingo.test.cjs` (Node 18+). No dependencies or build step.

New cards contain 12 wildlife squares, 12 shared moments, and a free middle. Switching players preserves both cards; starting fresh asks for confirmation and only changes the active card. The old saved card is migrated without deleting its backup. Storage is local to the browser, not shared between phones. If browser storage is unavailable, the page warns you and keeps the card in memory for the current visit.

## Publish on GitHub Pages

```bash
cd C:/dev/date_plan
git init -b main
git add .
git commit -m "Night Safari Adventure"
gh repo create night-safari --public --source=. --push
gh api -X POST repos/{owner}/night-safari/pages -f 'source[branch]=main' -f 'source[path]=/'
```

The site appears at `https://<your-username>.github.io/night-safari/` after a minute or two.
Push again to update.
