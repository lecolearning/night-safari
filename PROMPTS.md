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

## Accessory trio: cards 012–014

Built-in imagegen generated each portrait, then edited it into its own silhouette.
The original 1254px PNGs are saved locally; only 720px, quality-90 WebP versions
are used by the site. Existing artwork was not overwritten.

| Card | Source portrait | Deployed portrait | Source shadow | Deployed shadow |
|---|---|---|---|---|
| 012 | `.orig_img/owl.png` | `img/owl.webp` | `.orig_img/shadow-012.png` | `img/shadow-012.webp` |
| 013 | `.orig_img/porcupine.png` | `img/porcupine.webp` | `.orig_img/shadow-013.png` | `img/shadow-013.webp` |
| 014 | `.orig_img/elephant.png` | `img/elephant.webp` | `.orig_img/shadow-014.png` | `img/shadow-014.webp` |

Portrait references, in order: `ref/animal_character_sheet.png`,
`ref/Onion_image.jpg`, `ref/vegetal_homepage.png`, and `img/tapir.webp`.
Each exact portrait prompt is the following common block, a newline, then the
corresponding subject block. Silhouette edits used only their finished portrait.

### Common portrait block

```text
Use case: stylized-concept
Asset type: square full-body raster animal character portrait for the existing animal-card website.
Input images: Image 1 is the established animal character and proportions reference; Image 2 is the dark-marker doodle line-style reference; Image 3 is the friendly flat vegetable doodle style reference; Image 4 is the current tapir portrait for new-art consistency. All four are style references only, not edit targets. Do not reproduce the sheet, vegetables, or tapir.
Scene/backdrop: pure solid #FFFFFF white, absolutely no background tint, texture, scenery, ground line or shadow.
Style/medium: match the references' friendly flat hand-drawn doodle style, with thick slightly wobbly dark-brown outlines, slight crayon grain in the outlines, flat restrained pastel fills, simple cute dark eyes, a tiny smile, faint pink blush, rounded childlike shapes. Fictional cute character design, not a realistic animal study.
Composition/framing: exactly one animal, entire full body and approved accessory visible, centered on a square canvas about 1024x1024, occupying about 70-80% of the frame with white margin all around. Keep the approved accessory tucked close to the body so the animal silhouette stays recognisable.
Constraints: no gradients, no shading, no glossy rendering, no 3D, no drop shadows, no text or lettering, no scenery, no hearts, no extra animals, no clothing or props except the exact accessory described below.
```

### Owl subject

```text
Subject and action: one Buffy fish-owl, naturally buff-brown with a rounded body and tufted ears, facing the viewer, slightly bewildered but quietly confident. It is holding a folded cream park map upside down close against its body with its wings. The small map shows only a simple mint path and a few little tree symbols drawn upside down, clearly indicating the map is being held the wrong way; absolutely no lettering. Small feet visible beneath its round body. No other accessories.
```

### Porcupine subject

```text
Subject and action: one Brazilian porcupine, with a rounded natural quilled body, simple restrained brown-and-cream quills, small rounded ears, a gentle rounded nose, a quiet shy smile, and its curled prehensile tail clearly visible beside its body. It must read as a Brazilian porcupine, not a hedgehog: show the long curled prehensile tail and natural quills. It wears exactly one small sage-green sling bag tucked close to its body with ONE yellow flower tucked into the bag. No other clothing or accessories.
```

### Elephant subject

```text
Subject and action: one friendly Asian elephant, warm pastel grey, rounded natural Asian-elephant ears, rounded head and gentle simple eyes with a tiny smile and faint blush. Show its complete rounded body and feet in a slight three-quarter pose toward the viewer. Its flexible trunk is visibly carrying exactly one little cream-and-mint picnic basket tucked close to its body. The basket contains exactly TWO small wrapped snack parcels, both visible inside the basket, drawn as simple closed cream/mint paper-wrapped bundles with no lettering or logos. The trunk supports the basket by the handle. Keep the elephant's natural trunk and ears clearly recognisable. No other clothing, accessories, props or hearts.
```

### Owl silhouette

```text
Use case: precise-object-edit
Asset type: square raster animal silhouette for the name-guessing game.
Input images: Image 1 is the edit target, the finished Buffy fish-owl portrait holding its upside-down map.
Primary request: convert the entire animal AND its map into a completely featureless solid flat dark plum #342C4A silhouette.
Invariants: preserve the full foreground outer contour, tufted ears, wings, feet, pose, scale, position and square margins exactly. Preserve only the true white background, including the real gap between its feet. The map lies against its coloured torso: do not invent holes around the map or wings.
Changes: replace every foreground colour and feature, including the entire cream map, mint map marks, eyes, beak, blush, feathers, outlines, internal lines and texture, with the same uniform dark plum #342C4A fill. The map must be merged visually into the animal's solid silhouette; no map edges or symbols remain inside it.
Backdrop: pure solid #FFFFFF white.
Avoid: any internal features, invented holes, shading, gradients, texture, glow, shadows, text, new elements, altered outer shape.
```

### Porcupine silhouette

```text
Use case: precise-object-edit
Asset type: square raster animal silhouette for the name-guessing game.
Input images: Image 1 is the edit target, the finished Brazilian porcupine portrait with its sage sling bag and one yellow flower.
Primary request: convert the entire animal AND sling bag AND flower into a completely featureless solid flat dark plum #342C4A silhouette.
Invariants: preserve the full foreground outer contour, quills, round ears, feet, curled prehensile tail, pose, scale, position and square margins exactly. Preserve only the true white background, especially the spiral-shaped white gap inside the curled tail and the real gap between its feet. Keep the shape and spacing of the quill edges. The bag and flower lie over the coloured body: do not invent any holes around the bag, flower, stem, strap or arms.
Changes: replace every foreground colour and feature, including the cream quill tips, bag, strap, yellow flower, eyes, nose, blush, fur, outlines, internal lines and texture, with the same uniform dark plum #342C4A fill. Bag and flower must merge visually into the animal's solid silhouette; no accessory edges or symbols remain inside it.
Backdrop: pure solid #FFFFFF white.
Avoid: any internal features, invented holes, shading, gradients, texture, glow, shadows, text, new elements, altered outer shape.
```

### Elephant silhouette

```text
Use case: precise-object-edit
Asset type: square raster animal silhouette for the name-guessing game.
Input images: Image 1 is the edit target, the finished Asian elephant portrait carrying a picnic basket containing two wrapped snack parcels.
Primary request: convert the entire elephant AND its basket AND both parcels into a completely featureless solid flat dark plum #342C4A silhouette.
Invariants: preserve the full foreground outer contour, ears, curved trunk, feet, tail, basket handle, basket and parcel outlines, pose, scale, position and square margins exactly. Preserve the TRUE white background gaps visible in the source: the white opening beneath the trunk and inside the basket handle above the parcels, the narrow white gap separating basket from legs, real gaps between legs and beside the tail. Do not create any new holes inside the elephant, basket or parcels; cream parcel and basket surfaces are foreground, not background.
Changes: replace every foreground colour and feature, including cream and mint basket parts and both cream parcels, eyes, smile, blush, toes, outlines, internal lines, basket weave marks, parcel ties and texture, with the same uniform dark plum #342C4A fill. All foreground parts must be featureless. Remove internal contours while keeping actual background openings.
Backdrop: pure solid #FFFFFF white.
Avoid: any internal features, invented holes, shading, gradients, texture, glow, shadows, text, new elements, altered outer shape.
```

Visual review confirmed all three accessories and both snack parcels, with no
readable text. Generated fills retain faint grain/tonal variation; backgrounds
are near-white and silhouette contours slightly smoothed, not pixel-exact edits.


## Style consistency refinement (September 2026)

Built-in image generation, edit mode. Targets were the three accessory portraits;
style references were the unchanged `img/otter.webp` and `ref/animal_character_sheet.png`.
Selected outputs replace the draft WebP portraits. Earlier draft PNGs remain in
`.orig_img/`; final PNG revisions use `-flat.png`. The original seven are unchanged.

### owl

Final files: `.orig_img/owl-flat.png`, `img/owl.webp`.

```text
Use case: style-transfer. Image 1 is the ONLY EDIT TARGET, a new animal portrait. Image 2 (otter) and Image 3 (original seven sheet) are exact STYLE REFERENCES, not output subjects. Redraw only the animal from Image 1 to match the flatter, simpler hand-drawn original otter style. Thick slightly wobbly very dark brown marker outline with faint crayon grain on LINES ONLY. Completely uniform flat pastel color fills, zero shading, zero gradients, zero gloss, zero painterly body texture. Cute simple rounded doodle. Remove the mottled watercolor fill and most little feather dashes: keep only a few simple feather marks. Keep exact existing outer contour, proportions, small dark dot eyes, broad cream face patch, folded cream map held upside down with mint paths/trees, and tan palette. Do not change eyes to large circles. Preserve pose, overall silhouette and all accessories exactly so the existing shadow silhouette remains valid. Single animal on truly pure #FFFFFF background, no ground shadow, no text, no extra characters. Square full-body portrait filling same frame as Image 1.
```

### porcupine

Final files: `.orig_img/porcupine-flat.png`, `img/porcupine.webp`.

```text
Use case: style-transfer. Image 1 is the ONLY EDIT TARGET, a new animal portrait. Image 2 (otter) and Image 3 (original seven sheet) are exact STYLE REFERENCES, not output subjects. Redraw only the animal from Image 1 to match the flatter, simpler hand-drawn original otter style. Thick slightly wobbly very dark brown marker outline with faint crayon grain on LINES ONLY. Completely uniform flat pastel color fills, zero shading, zero gradients, zero gloss, zero painterly body texture. Cute simple rounded doodle. Remove the mottled painterly body fill. Simplify internal quill texture to clean flat dark brown and cream bands, like the reference pangolin scales. Keep exact existing outer quill and curled tail contour, proportions, dot eyes, small sage sling bag with one yellow flower. Preserve pose, overall silhouette and all accessories exactly so the existing shadow silhouette remains valid. Single animal on truly pure #FFFFFF background, no ground shadow, no text, no extra characters. Square full-body portrait filling same frame as Image 1.
```

### elephant

Final files: `.orig_img/elephant-flat.png`, `img/elephant.webp`.

```text
Use case: style-transfer. Image 1 is the ONLY EDIT TARGET, a new animal portrait. Image 2 (otter) and Image 3 (original seven sheet) are exact STYLE REFERENCES, not output subjects. Redraw only the animal from Image 1 to match the flatter, simpler hand-drawn original otter style. Thick slightly wobbly very dark brown marker outline with faint crayon grain on LINES ONLY. Completely uniform flat pastel color fills, zero shading, zero gradients, zero gloss, zero painterly body texture. Cute simple rounded doodle. Remove the mottled painterly body fill and any tonal shading. Keep exact existing outer contour, proportions, dot eyes, warm grey palette, trunk holding the cream/mint picnic basket containing exactly two tied cream snack parcels. Preserve pose, overall silhouette and all accessories exactly so the existing shadow silhouette remains valid. Single animal on truly pure #FFFFFF background, no ground shadow, no text, no extra characters. Square full-body portrait filling same frame as Image 1.
```


## Collection-completion group keepsakes

Generated with the built-in image tool. Final files:

- Play: `.orig_img/reward-play.png` and `img/reward-play.webp`.
- Meal: `.orig_img/reward-meal.png` and `img/reward-meal.webp`.
- Tour: `.orig_img/reward-tour.png` and `img/reward-tour.webp`.

All three are 1448 × 1086 (4:3); the site uses quality-92 WebP copies without
resizing. PNG export preserves these dimensions. Visual review counted thirteen
distinct animals in each, checked paw-held heart/fish, and removed the tour's
ground-shadow ovals. The selected scenes are substantially simpler than the
discarded first play draft; minor generated fill variation remains.

### Play: exact final style-and-prop correction

References, in order: earlier play draft (not shipped), original-seven character
sheet, `img/scene_intro.webp`, `.orig_img/owl-flat.png`, `img/otter.webp`.

```text
Use case: precise-object-edit
Asset type: corrected landscape 4:3 playtime reward illustration.
Input images: Image 1 is the existing thirteen-animal PLAY scene to edit. Image 2 is the ORIGINAL SEVEN character identity/style authority. Image 3 is the REQUIRED SIMPLE FLAT background/style authority. Image 4 is the corrected owl identity reference. Image 5 is the exact otter identity and paw-held heart reference. References 2-5 are guides, not scenes to copy.
Primary request: keep all THIRTEEN existing animals, their broad positions and playful social interactions, but simplify the whole picture to the exact simple flat doodle style of Images 2 and 3. Make only the specified prop/eye corrections and flattening. Keep the landscape 4:3 frame, at high resolution around 2048x1536.
ESSENTIAL style correction: remove ALL painterly texture, mottling, speckles, watercolour, tonal variation, gradients, lighting, cast shadows and shading from every colour fill, every animal and the whole background. Use a single completely uniform flat colour for each coloured region. Keep only thick slightly wobbly dark-brown marker outlines with subtle grain confined to the outline strokes. Exactly match the original seven's uncomplicated dot eyes, small smiles, simple shapes and flat colours.
Background: replace the detailed background with Image 3's very simple flat royal-blue sky, flat bright-green grass, only a FEW M-shaped grass squiggles, two or three dark-green cloud-shaped trees, one simple cream circle moon with dot eyes and small smile, sparse tiny stars and a few plain yellow firefly dots. No dense leaves, no textured bark, no layers of detailed shrubs, no glowing haze. The few branches needed by the animals should be simple flat brown shapes. Do not add Image 3's vegetables or floating heart.
Critical prop corrections: the brown otter at lower left MUST physically HOLD one small pink heart in BOTH paws in front of its body, exactly like Image 5, with visibly curved arms and paws gripping the heart edges. It must NOT be a pink chest marking, patch, necklace or floating icon. Let the otter watch the ball while holding its heart. The grey striped fishing cat MUST physically HOLD its mint-green toy fish in BOTH paws in front of its body, with paws gripping the fish edges like Image 2; it must NOT be a belly marking or patch. It can smile toward the ball while holding the fish. No extra hearts or fish anywhere.
Critical owl correction: replace the owl's large ringed eyes with small simple dark dot eyes and a broad cream face, matching Image 4. Keep its buff-brown body, ear tufts and folded cream map with simple mint route. No circular spectacle-like eye rings.
Other invariants: keep porcupine's brown-and-cream quills simple, its curled tail, sage sling bag and exactly ONE yellow flower; keep elephant pastel grey with cream/mint basket and exactly TWO wrapped parcels; keep tapir's black head and broad white saddle; keep spotted squirrel's cream spots, membrane and fluffy tail; keep flying fox's charcoal bat wings and rusty-orange ruff. Do not redesign the original seven.
Cast count must stay EXACTLY thirteen, once each: otter, dhole, slow loris, pangolin, fishing cat, tiger, binturong, tapir, spotted flying squirrel, flying fox, owl, porcupine, elephant. All thirteen complete heads and recognisable bodies visible, no face covered; add a little edge margin so otter tail is not cut off. Keep genuine interactions and the existing ball/bubble play. No new character accessories, text, lettering, logos or extra animals.
```

### Meal and tour: exact shared generation block

Each request used this block, a newline, and the relevant scene block below.
References, in order: approved `.orig_img/reward-play.png`, original-seven
character sheet, `img/scene_intro.webp`, `.orig_img/owl-flat.png`, `img/otter.webp`.

```text
Use case: illustration-story
Asset type: high-resolution landscape 4:3 animal-friendship reward illustration, around 2048x1536.
Input images: Image 1 is the thirteen-character group IDENTITY reference, not the desired composition. Image 2 is the ORIGINAL SEVEN animal identity and simple doodle-style authority. Image 3 is the REQUIRED background simplicity and flat-colour authority. Image 4 is the owl identity reference with small dark dot eyes and broad cream face. Image 5 is the otter identity and visibly paw-held heart reference. All five inputs are references, not an edit target; create the new scene described below.
Most important style requirement: retain the exact uncomplicated original-seven doodle simplicity. Uniform flat colour regions, thick slightly wobbly dark-brown marker outlines with only slight grain on the strokes, simple eyes and small smiles. NO painterly texture, mottling, speckles, gradients, tonal shading, glossy surfaces, 3D or realistic lighting. Simplify rather than embellish. Draw only flat royal-blue sky, flat bright-green grass, a FEW M-shaped grass squiggles, a few dark-green cloud-shaped trees, ONE cream circular moon with dot eyes and a tiny smile, sparse white star marks and plain yellow firefly dots as in Image 3. No dense foliage or textured bark; do not copy its vegetables or floating heart.
Mandatory cast: EXACTLY THIRTEEN animals, once each, all with visible complete heads and recognisable bodies. Brown cream-muzzled Asian small-clawed otter; orange pointy-eared dhole; beige dark-eye-patched slow loris; golden scaled long-snouted pangolin; grey striped fishing cat; orange black-striped Malayan tiger; charcoal round-eared pale-whiskered binturong; charcoal black and broad white-saddled Malayan tapir; tawny cream-spotted giant flying squirrel with pale membrane and fluffy tail; charcoal orange-ruffed Malayan flying fox with bat wings; buff-brown tufted Buffy fish-owl with broad cream face and small dot eyes; brown-and-cream quilled Brazilian porcupine with curled tail; warm grey rounded-ear Asian elephant. Match Image 1 for all thirteen and Image 2 exactly for the original seven. No missing species, duplicates, merged animals or additional creatures.
Critical props in EVERY scene: otter physically holds ONE small pink heart in BOTH paws, curved arms and paws visibly gripping the edges exactly as Image 5, never a chest marking, patch or floating icon. Fishing cat physically holds ONE mint-green toy fish in BOTH paws with paws gripping its edges like Image 2, never a belly marking, never food. Give these two clear unobstructed foreground positions. Owl holds folded cream map with simple mint route and has small dot eyes, never large ringed eyes. Porcupine has its small sage sling bag and ONE yellow flower. Elephant has its cream/mint picnic basket containing TWO wrapped snack parcels. No extra hearts or fish. No new wearable accessories or clothing. No text, labels, lettering or logos.
Keep the composition spacious with every animal wholly inside the frame and no face hidden behind another animal or object. Warm interaction through gaze and gesture, not a static lineup.
```

### Meal scene block

```text
Scene: HAVING A MEAL TOGETHER. New composition, unlike the reference playdate: a cozy moonlit picnic on one simple cream oval blanket angled diagonally across a grass clearing. All thirteen friends sit around it in a loose welcoming oval, facing partly toward one another but with faces readable. No ball, bubble wand, bubbles or tree-perching group layout.
Back edge of blanket: FOUR animals, elephant at back-right offering its two-parcel basket toward tapir beside it; owl at back-middle consults its small folded map beside binturong who offers a small simple bowl.
Left arc: THREE animals, porcupine with sage bag and one flower receives a plate from pangolin, while spotted flying squirrel sits nearby with its tail and cream membrane recognisable.
Front edge: THREE animals, otter in a clear foreground spot HOLDING its pink heart in both paws; dhole beside it slides a little plate toward tiger. Their whole heads and bodies visible.
Right arc: THREE animals, fishing cat in a clear foreground spot HOLDING its mint fish in both paws; slow loris and orange-ruffed flying fox with folded wings smile and chat beside it.
Only a few simple communal plates on the blanket: fictional plant-based apple/pear slices, leaf-shaped bites and wrapped snacks. Absolutely no meat, fish as food, bones or seafood; the fishing cat's mint fish is a cherished toy held safely away from food. No eating another character. All thirteen remain distinct. Use only enough picnic detail to explain sharing, never dense objects or texture. The moon, trees and grass are as simple and flat as Image 3. Count the thirteen before finishing.
```

### Tour scene block

```text
Scene: GOING ON A NIGHT TOUR TOGETHER. New composition: the thirteen friends explore the park along a broad simple CREAM S-CURVED PATH sweeping from the lower-left foreground across the middle to the upper-right background. A few small fixed park lanterns on simple short posts beside the path have flat yellow centres, NOT glow effects. Two or three flat cloud-trees, plain green grass and the simple royal-blue sky make a sparse scene. No picnic blanket, no ball, no bubbles or bubble wand. The path and varied walking/gliding poses are the visual focus.
Front-left path group, exactly THREE animals: (1) otter walking while visibly HOLDING its one pink heart in both paws; (2) fishing cat walking beside it while visibly HOLDING its one mint fish in both paws; (3) dhole turns back with a friendly encouraging smile. Heart and fish unobstructed, not body markings.
Centre map-reading pair, exactly TWO animals: (4) buff-brown owl with small dot eyes and broad cream face consults its folded cream mint-route map; (5) slow loris beside it gently points toward the correct path. They look at each other, a thoughtful little navigation moment.
Middle curve social group, exactly FOUR animals: (6) tiger and (7) binturong walk side-by-side smiling and gesturing toward a firefly; (8) porcupine with its sage sling bag, ONE yellow flower and visible curled tail walks beside (9) pangolin. Each face and characteristic body remains visible without overlap hiding anyone.
Back-right curve pair, exactly TWO animals: (10) Asian elephant walking with its trunk carrying its cream/mint basket containing exactly TWO wrapped parcels; (11) black-and-white saddled tapir walking beside it. Elephant's trunk carries only the basket, NO wand, fork or additional object.
Above and beside a low branch, exactly TWO animals, each entire body clearly visible: (12) cream-spotted flying squirrel making a short glide beside the walkers, cream membrane and fluffy tail distinct; (13) charcoal orange-ruffed flying fox flying gently nearby with clear bat wings. Keep these two well separated in space, not merged.
There are exactly 3+2+4+2+2 = THIRTEEN animals. Give them natural varied steps and mutual gazes, not a static posed row. All stay entirely within the landscape frame with generous margins. Preserve all identity colours and original-seven simplicity, and the mandatory held heart/fish in the common brief. Scene props are only a few fixed path lanterns and the established map, bag/flower and basket. No hats, scarves, badges, extra bags, walking sticks or other new accessories. Count every species once before finishing.
```

### Tour: final ground-shadow removal

Sole reference: the otherwise approved tour generation before this correction.

```text
Use case: precise-object-edit
Asset type: final landscape 4:3 night-tour reward illustration.
Input images: Image 1 is the edit target, the otherwise approved thirteen-animal night-tour scene.
Primary request: remove ONLY the flat tan and green cast-shadow blobs or ovals on the ground directly beneath the animals, including under the otter, dhole, owl, slow loris and tiger, and any similar ground-shadow shapes under the other characters. Fill each removed shadow area seamlessly with the same surrounding cream path or bright-green grass colour.
Strict invariants: keep EVERY animal, all thirteen identities and count, outer contours, pose, scale, position, eyes, faces, smiles, colours, limbs, feet, tails, outlines and all props exactly unchanged. Otter must continue visibly holding its pink heart in both paws, fishing cat its mint fish in both paws, owl its map, porcupine its sage bag and one yellow flower, elephant its basket with two parcels. Keep the path shape, lanterns, moon, trees, sky, stars, grass squiggles and all other lines and colours unchanged. Preserve the complete landscape frame and original dimensions.
This is only removal of ground-shadow ovals, not a redraw, restyle, recolouring or compositional change. No replacement shadows, no gradients, no new details, no text, no added or removed animals.
```
