# Night Safari Adventure 🌙

A tiny choose-your-own-evening story that ends in a "Safari ID" card, plus a bingo card for the park.
Static site, no build step, no dependencies. Open `index.html` or host it anywhere.

## Files

| File | What it is |
|---|---|
| `index.html` + `quiz.js` | The story. `CONFIG` at the top of `quiz.js` holds the names and your animal. `ANIMALS` and `STORY` are all the copy. |
| `bingo.html` + `bingo.js` | Bingo card. `ITEMS` is the square list, `NAMES` the two players. Cards live in each phone's localStorage. |
| `art.js` | All artwork: character bodies and story scenes as inline SVG. |
| `sky.js` | Stars, moon, fireflies, treeline. |
| `style.css` | Styles. |

## Dev shortcuts

- `index.html?step=4` jumps into the story at beat 4.
- `index.html?result=otter` shows a result card (`otter`, `dhole`, `loris`, `pangolin`, `fishingcat`, `tiger`, `binturong`).
- `bingo.html?who=XJ` skips the player picker.

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
