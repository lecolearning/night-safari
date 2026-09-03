# Image prompts for ChatGPT

Drop finished files into `img/` with these exact names and the site uses them automatically
(SVG stays as fallback for any that are missing):

    img/otter.png  img/dhole.png  img/loris.png  img/pangolin.png
    img/fishingcat.png  img/tiger.png  img/binturong.png
    optional: img/scene_intro.png (4:3, replaces the intro illustration)

The full story now also has matching 4:3 PNG panels:

    img/scene_gate.png     img/scene_snacks.png  img/scene_tram.png
    img/scene_dog.png      img/scene_dark.png    img/scene_show.png
    img/scene_sunday.png   img/scene_onion.png   img/scene_food.png
    img/scene_route.png    img/scene_spice.png   img/scene_drum.png

Before prompting, upload BOTH reference images from the `ref/` folder in the same chat:
`ref/Onion_image.jpg` and `ref/vegetal_homepage.png`.

---

## Prompt 1: the character sheet (do this first)

Use the two attached images as the exact art style reference. Draw a character sheet of 7 cute
animal characters in that same style: hand-drawn with a thick, slightly wobbly dark brown marker
outline, completely flat pastel colour fills with no gradients, no shading and no 3D, tiny dot
eyes, a small simple smile, faint pink blush, a slightly grainy crayon texture on the lines.
Simple rounded shapes, very little detail, childlike and charming, like a friendly doodle.
Plain pure white background, no scene, no props, no text, no labels, no shadows on the ground.
Arrange them in two rows with lots of space between each character so they can be cropped
into squares. The 7 animals, each facing forward, sitting or standing upright:

1. Asian small-clawed otter, warm brown, pale cream muzzle, holding a small pink heart
2. Dhole (Asian wild dog), rusty orange-red fur, big pointed ears, tongue out
3. Sunda slow loris, tan and cream, huge round dark eyes with dark eye patches, a dark stripe down the forehead
4. Sunda pangolin, golden brown, overlapping scale pattern, long snout, small and round
5. Fishing cat, grey-olive with small dark spots and forehead stripes, holding a tiny mint-green fish
6. Malayan tiger, orange with a few simple black stripes, cream muzzle
7. Binturong (bearcat), dark charcoal grey, shaggy, white whiskers, round tufted ears

Landscape format.

## Prompt 2: individual portraits (after the sheet looks right)

Keep the exact same style and the exact same character designs as the sheet you just made.
Now draw only the [ANIMAL] on its own, centred, square format, pure white background,
no text, no props except the one it was holding, filling about 70% of the frame.

Repeat for each animal. If a character drifts, say: "Redraw to match the [ANIMAL] on the
character sheet exactly, same colours, same proportions."

## Prompt 3 (optional): intro illustration

Same style as the attached references. A night-time scene at a wildlife park: deep royal
blue sky, a few simple white stars, a big pale cream moon with a tiny smiling face, dark
rounded tree silhouettes, bright green grass with little squiggles. In the middle, a cute
onion character and a cute carrot character in the exact style of the attached vegetable
drawings, standing side by side, both smiling, with a small pink heart floating above them.
Small yellow fireflies dotted around. Flat colours, thick wobbly marker outlines, crayon
texture, no text. 4:3 landscape.

## Checklist before saving

- White background is actually white, not off-white or grey. If not, ask "make the background pure #FFFFFF".
- No gradients, no glossy highlights, no drop shadows. Ask "flatter, simpler, more like a doodle" if it looks polished.
- Square crop for portraits. PNG. Roughly 800 to 1200 px is plenty.
- Name the files exactly as listed above.

## Matching story panels

Generated with the built-in image tool using `scene_intro.png` as the scene-style
reference, the relevant animal portraits as character-design references, and
`ref/vegetal_homepage.png` for onion/carrot scenes. Keep all panels 4:3 landscape.
The character sheet is retained locally as `ref/animal_character_sheet.png`.

Shared prompt: Match the attached scene and character references exactly: thick,
slightly wobbly very dark brown grainy marker outlines, naive rounded imperfect
shapes, tiny simple faces, flat bright colours, minimal detail, and a childlike
handmade doodle. Use uniform colour regions, rounded dark tree silhouettes, and
simple grass squiggles. No gradients, shading, gloss, realistic lighting, drop
shadows, 3D, border, captions, watermark, or extra characters. Preserve the
referenced character designs exactly.

Append the relevant scene request:

- `gate`: Early-evening wildlife-park entrance, cheerful yellow NIGHT SAFARI
  sign, small smiling cream moon, trees and grass. Otter waits on the left,
  excited Dhole on the right, and Pangolin checks a folded map by the sign.
- `snacks`: Night-time snack stop. Dhole organises a pink-and-white popcorn tub
  and three snack bowls. Binturong sleeps curled beside the popcorn with two
  tiny z marks. Starry royal-blue sky, cream moon, trees, grass and fireflies.
- `tram`: Yellow safari tram with coral-pink roof stripe, pale-blue windows and
  three dark wheels. Otter, Loris, Tiger and Fishing Cat smile in four separate
  windows. Starry royal-blue sky, cream moon, rounded trees and green ground.
- `dog`: A friendly golden retriever with floppy ears and wagging tail meets
  a delighted small Onion at the tram stop. Three pink hearts, warm violet
  dusk, rounded trees and grass. Exactly one dog and one onion; no text.
- `dark`: Deep-indigo walking trail, nearly black rounded trees and dark-teal
  ground. Curious Onion carries a yellow lantern. Three pairs of friendly
  golden eyes peek from bushes; a few yellow fireflies. No text.
- `show`: Brown stage with a plum rounded backdrop and pale-cream spotlight.
  A small Loris performs. Otter, Pangolin, Onion and another Loris sit in the
  front row; a white phone displays music notes to show it is ringing.
- `sunday`: Late-night tram home, yellow body and coral roof stripe. Fishing
  Cat, Tiger and Dhole sit in three separate windows, happily tired. Starry
  royal-blue sky, smiling cream moon, trees and green ground. No text.
- `onion`: A larger Onion stands beside a large pale-blue magnifying glass;
  a smaller smiling Carrot stands on the right. Starry royal-blue sky,
  smiling cream moon, trees, grass and fireflies. No text.
- `food`: Night picnic with a low pale-cream oval table or mat and exactly
  three steaming bowls in pink, mint and yellow. Otter sits left, Onion in
  the middle, Binturong right. Stars, fireflies, trees and grass. No text.
- `route`: A wooden signpost with mint TRAM arrow pointing right, yellow
  TRAILS arrow pointing left, and pink SHOW arrow pointing right. Onion
  decides at lower right while Loris waits left. Moon, stars, trees and grass.
- `spice`: One large smiling red chilli with green stem stands between proud
  Tiger and worried Pangolin with one pale-blue sweat drop. Royal-blue sky,
  stars, fireflies, trees and grass. No text.
- `drum`: Quiet deep-indigo conferring background, smiling cream moon,
  sparse white stars, nearly black rounded trees, dark-teal ground, three
  pairs of friendly golden eyes and yellow fireflies. Open centre, no main
  characters, objects or text.

## September 2026 additions: three trail friends

Generated with imagegen using `ref/animal_character_sheet.png`,
`ref/Onion_image.jpg`, and `ref/vegetal_homepage.png` as ordered style references.
Each exact final prompt was the common block followed by its subject block below.
Original PNGs are saved locally in `.orig_img/`; deployed copies are 720px WebP
at quality 90 in `img/`. The existing seven colour portraits are unchanged.

### Common portrait prompt

```text
Use case: stylized-concept
Asset type: square website animal character portrait, a new raster illustration.
Input images: Image 1 is a character-consistency and proportions reference; Image 2 is a dark marker doodle line-style reference; Image 3 is a flat friendly doodle-style reference. All are style references only, not edit targets. Do not reproduce the sheet or vegetables.
Scene/backdrop: pure solid #FFFFFF white, with absolutely no tint, texture, scenery, or ground shadow.
Style/medium: match the exact friendly flat hand-drawn character style of the reference sheet and vegetable doodles: thick slightly wobbly dark brown marker outlines with a slight crayon grain only in the linework, flat restrained pastel fills, simple dark eyes, a little smile and faint pink blush, childlike simple rounded shapes. Fictional cute character design, not a realistic animal illustration.
Composition/framing: exactly one animal, entire full body visible and centered in a square 1024x1024 canvas, occupying about 70% of the frame, ample white margin all around.
Constraints: no gradients, no shading, no 3D, no gloss, no background texture or shadow, no text or labels, no props, no extra hearts or scenery, no additional animals.
```

### Tapir → `.orig_img/tapir.png`, `img/tapir.webp`

```text
Subject: one adult Malayan tapir, round and unbothered, sitting upright in a slight three-quarter pose toward the viewer so the distinctive broad clean white saddle across its rounded torso is very clearly visible. Charcoal black head and front of body and hind legs, broad clean white saddle on middle torso, small pale-rimmed round ears. Short gently curved flexible snout, recognizably a tapir snout, never an elephant trunk or pig nose. Tiny simple eyes and a small quiet smile.
```

### Flying squirrel → `.orig_img/flyingsquirrel.png`, `img/flyingsquirrel.webp`

```text
Subject: one spotted giant flying squirrel, facing forward, with tawny chestnut-brown upper fur decorated with a few simple small pale cream spots, cream underside, round ears, large but simply drawn dark eyes, and a broad fluffy tail clearly visible. Forelegs opened just slightly to show its natural pale gliding membrane between forelegs and hindlegs, gently draping like a little cape but absolutely not clothing or a cape prop. Its membrane is part of its body. Tiny simple smiling mouth and faint pink cheek blush. Keep its squirrel silhouette distinct from a bat, no bat wings, no stripes.
```

### Flying fox → `.orig_img/flyingfox.png`, `img/flyingfox.webp`

```text
Subject: one Malayan flying fox, a small friendly fruit bat, upright and front-facing. Warm rusty orange neck ruff, charcoal body and charcoal wing membranes, pointy ears and a short fox-like muzzle. Its wings are folded loosely around its own body in a cozy self-wrap pose, with the simple wing-fold lines visible and tiny feet showing beneath. The wings themselves wrap around the body; do not draw an actual blanket or any clothing. Friendly simple dark eyes, tiny smile and faint pink cheek blush. No fruit or other props, no fangs, no scary vampire motifs.
```

### Bonus silhouettes

Each portrait above was the edit reference for its own silhouette. These are
`.orig_img/shadow-009.png` through `shadow-011.png`, with corresponding deployed
`img/shadow-009.webp` through `shadow-011.webp`. Number-only names avoid spoiling
the guess in locked-card markup. Final prompts:

```text
Use case: precise-object-edit
Asset type: square raster animal silhouette for a name-guessing game.
Input images: Image 1 is the edit target, the finished Malayan tapir portrait.
Primary request: convert the entire animal into a completely solid flat dark plum #342C4A silhouette.
Invariants: exactly preserve the full animal's outer contour, pose, size and position, including ears, snout, feet and all existing white gaps between limbs. Preserve the same square dimensions and white margin. Do not redesign, reposition, crop, simplify, or enlarge the animal.
Changes: replace every part of the animal, including its white saddle, coloured areas, outlines, eyes, nose, smile, toes, blush, internal lines, highlights and texture, with one completely uniform solid #342C4A fill. The silhouette must have no visible internal features or details whatsoever.
Backdrop: pure solid #FFFFFF white, no texture or tint.
Avoid: gradients, shading, glow, shadows, lettering, extra elements, extra animals.
```

```text
Use case: precise-object-edit
Asset type: square raster animal silhouette for a name-guessing game.
Input images: Image 1 is the edit target, the finished spotted giant flying squirrel portrait.
Primary request: convert the entire animal into a completely solid flat dark plum #342C4A silhouette.
Invariants: exactly preserve the full animal's outer contour, pose, size and position, including ears, outstretched forelegs, natural gliding membrane, feet, fluffy tail and all existing white gaps between limbs and tail. Preserve the same square dimensions and white margin. Do not redesign, reposition, crop, simplify, or enlarge the animal.
Changes: replace every part of the animal, including its cream spots and underside, coloured areas, outlines, eyes, nose, smile, toes, blush, internal lines, highlights and texture, with one completely uniform solid #342C4A fill. The silhouette must have no visible internal features or details whatsoever.
Backdrop: pure solid #FFFFFF white, no texture or tint.
Avoid: gradients, shading, glow, shadows, lettering, extra elements, extra animals.
```

```text
Use case: precise-object-edit
Asset type: square raster animal silhouette for a name-guessing game.
Input images: Image 1 is the edit target, the finished Malayan flying fox portrait.
Primary request: convert the entire animal into a completely solid flat dark plum #342C4A silhouette.
Invariants: exactly preserve the full animal's outer contour, pose, size and position, including pointy ears, cheek fur, folded wings, tiny feet and all existing white gaps between limbs and wing edges. Preserve the same square dimensions and white margin. Do not redesign, reposition, crop, simplify, or enlarge the animal.
Changes: replace every part of the animal, including its orange neck ruff, coloured areas, outlines, eyes, nose, smile, toes, blush, wing-fold lines, all internal lines, highlights and texture, with one completely uniform solid #342C4A fill. The silhouette must have no visible internal features or details whatsoever.
Backdrop: pure solid #FFFFFF white, no texture or tint.
Avoid: gradients, shading, glow, shadows, lettering, extra elements, extra animals.
```

Visual QA note: image generation can slightly soften contours and leave a faint
grain or near-white background. These were visually reviewed; exact source-pixel
contours and exact per-pixel hex colours are not guaranteed. The site blends the
white-backed silhouettes into their pale panels, without revealing inner details.

### Refreshed original seven silhouettes

Each current `img/{key}.webp` was used as the sole edit target. Saved originals:
`.orig_img/shadow-001.png` through `shadow-007.png`; deployed 720px WebP copies:
`img/shadow-001.webp` through `shadow-007.webp`. Exact initial prompt template:

```text
Use case: precise-object-edit
Asset type: square raster animal silhouette for a name-guessing game.
Input images: Image 1 is the edit target, the current finished {name} bitmap portrait.
Primary request: convert the entire foreground animal and any held prop into a completely solid flat dark plum #342C4A silhouette.
Invariants: exactly preserve the full portrait's outer contour, pose, scale and position, {features}. Preserve every existing white background gap between limbs, prop and tail. Preserve the same square composition and margins. Do not redesign, reposition, crop, simplify, or enlarge the animal or prop.
Changes: replace every foreground part, including any held prop, all coloured areas, outlines, eyes, nose, smile, toes, blush, internal lines, highlights and texture, with one completely uniform solid #342C4A fill. No visible internal features or details whatsoever. Do not leave facial features, prop shapes or limb lines visible inside the silhouette.
Backdrop: pure solid #FFFFFF white, no texture or tint.
Avoid: gradients, shading, glow, shadows, lettering, extra elements, extra animals.
```

| Number / key | `{name}` | `{features}` |
|---|---|---|
| 001 / otter | otter | including round ears, outward whiskers, small feet, long tail, and the tiny heart held against its body |
| 002 / dhole | dhole | including tall pointy ears, cheek fur, feet and fluffy tail |
| 003 / loris | slow loris | including round head, arms and feet |
| 004 / pangolin | pangolin | including long pointed snout, feet and long curved tail |
| 005 / fishingcat | fishing cat | including pointy ears, outward whiskers, feet and the small fish held against its body |
| 006 / tiger | tiger | including round ears, arms, feet and curled tail |
| 007 / binturong | binturong | including tufted round ears, cheek fur, feet and thick curled tail |

The fishing-cat silhouette needed one corrective edit. Its generated silhouette
was reference 1; the unchanged `img/fishingcat.webp` portrait was reference 2.
Exact final correction prompt:

```text
Use case: precise-object-edit
Asset type: square raster animal silhouette for a name-guessing game.
Input images: Image 1 is the edit target, the existing dark plum fishing cat silhouette. Image 2 is the original full-colour portrait, supplied ONLY to verify which white areas are truly background.
Primary request: make one tiny correction to Image 1. Fill the TWO small white diamond-like cutouts inside the lower torso, beside the held fish's tail, with the exact same solid dark plum fill as the surrounding torso. Those two internal white holes are erroneous: Image 2 shows coloured torso there, not background.
Invariants: change only those two erroneous internal white holes. Preserve every pixel of the outer contour, ears, outward whiskers, body, feet, pose, size, position and margins as closely as possible. Preserve the real exterior white background and the real white gap between the two feet at bottom. Keep the entire silhouette featureless: no eyes, facial features, held-fish detail, outlines or internal lines.
Style: completely solid flat dark plum silhouette, target #342C4A, on pure white #FFFFFF background.
Avoid: new holes, new features, texture, gradients, shading, glow, shadows, lettering, extra elements.
```
