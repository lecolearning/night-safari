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
