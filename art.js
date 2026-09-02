/* ============================================================
   Hand-drawn art, in the VeggieVille look: thick wobbly marker
   outlines, flat pastel fills, dot eyes and tiny smiles, stick
   arms, grass squiggles. Characters are 200x200 groups; scenes
   are 400x300 illustrations composed from them.
   ============================================================ */
(function () {
  const INK = '#2b2340';

  /* ---------- shared bits ---------- */
  const eyes = (lx, rx, y, r = 5) =>
    `<circle cx="${lx}" cy="${y}" r="${r}" fill="${INK}" stroke="none"/><circle cx="${rx}" cy="${y}" r="${r}" fill="${INK}" stroke="none"/>` +
    `<circle cx="${lx - r * .35}" cy="${y - r * .35}" r="${r * .3}" fill="#fff" stroke="none"/><circle cx="${rx - r * .35}" cy="${y - r * .35}" r="${r * .3}" fill="#fff" stroke="none"/>`;
  const blush = (lx, rx, y) =>
    `<ellipse cx="${lx}" cy="${y}" rx="9" ry="5" fill="#ff9aa2" opacity=".55" stroke="none"/><ellipse cx="${rx}" cy="${y}" rx="9" ry="5" fill="#ff9aa2" opacity=".55" stroke="none"/>`;
  const smile = (x, y, w = 16) => `<path d="M${x - w / 2} ${y} q${w / 2} ${w * .7} ${w} 0" fill="none"/>`;
  const catMouth = (x, y) => `<path d="M${x} ${y} q-5 10 -13 6 M${x} ${y} q5 10 13 6" fill="none"/>`;
  const arms = (lx, rx, y) => `<path d="M${lx} ${y} l-16 10 M${rx} ${y} l16 10" fill="none"/>`;

  /* ---------- character bodies (200x200, feet near y=190) ---------- */
  const BODY = {};

  BODY.onion = `
    <path d="M92 62 l-8 -30 l14 16 l2 -24 l8 24 l12 -16 l-8 30 Z" fill="#f7c04a"/>
    <path d="M100 60 C 55 70 40 100 45 132 C 50 165 150 165 155 132 C 160 100 145 70 100 60 Z" fill="#f1a94b"/>
    <path d="M100 66 q-24 30 -18 78 M100 66 q24 30 18 78" fill="none" stroke-opacity=".22"/>
    ${eyes(82, 118, 112, 4)} ${smile(100, 128, 30)} ${blush(66, 134, 124)} ${arms(48, 152, 130)}
    <path d="M84 166 l-4 20 M116 166 l4 20" fill="none"/>`;

  BODY.carrot = `
    <path d="M100 44 q-34 -34 -38 -8 q16 2 34 12 Z" fill="#3f8a3f"/>
    <path d="M100 44 q34 -34 38 -8 q-16 2 -34 12 Z" fill="#3f8a3f"/>
    <path d="M100 42 q-2 -36 12 -32 q0 20 -10 34 Z" fill="#4c9a4a"/>
    <path d="M100 42 C 132 42 130 74 122 104 C 115 134 106 162 100 178 C 94 162 85 134 78 104 C 70 74 68 42 100 42 Z" fill="#f28a2e"/>
    <path d="M86 98 q8 4 16 0 M88 124 q8 4 16 0 M93 148 q6 3 12 0" fill="none" stroke-opacity=".3"/>
    ${eyes(90, 110, 84, 4)} ${smile(100, 98, 20)} ${blush(80, 120, 94)} ${arms(80, 120, 110)}`;

  BODY.otter = `
    <ellipse cx="100" cy="150" rx="40" ry="40" fill="#a5683d"/>
    <circle cx="48" cy="64" r="12" fill="#a5683d"/><circle cx="152" cy="64" r="12" fill="#a5683d"/>
    <circle cx="48" cy="64" r="5" fill="#7a4a28" stroke="none"/><circle cx="152" cy="64" r="5" fill="#7a4a28" stroke="none"/>
    <ellipse cx="100" cy="100" rx="60" ry="56" fill="#a5683d"/>
    <ellipse cx="100" cy="120" rx="36" ry="26" fill="#e8c9a0"/>
    <path d="M40 110 L66 116 M40 128 L66 122 M160 110 L134 116 M160 128 L134 122" fill="none" stroke-width="3"/>
    <ellipse cx="100" cy="106" rx="9" ry="6" fill="${INK}" stroke="none"/>
    ${catMouth(100, 111)} ${eyes(78, 122, 86)} ${blush(60, 140, 104)}
    <path d="M100 184 c-14 -14 -24 -20 -20 -32 c3 -8 14 -8 20 0 c6 -8 17 -8 20 0 c4 12 -6 18 -20 32 Z" fill="#ff8fab"/>
    <ellipse cx="66" cy="182" rx="12" ry="7" fill="#a5683d"/><ellipse cx="134" cy="182" rx="12" ry="7" fill="#a5683d"/>`;

  BODY.dhole = `
    <ellipse cx="100" cy="152" rx="42" ry="38" fill="#d5773a"/>
    <path d="M44 84 L30 20 L94 60 Z" fill="#d5773a"/><path d="M156 84 L170 20 L106 60 Z" fill="#d5773a"/>
    <path d="M52 74 L44 38 L82 62 Z" fill="#f2b6a0" stroke="none"/><path d="M148 74 L156 38 L118 62 Z" fill="#f2b6a0" stroke="none"/>
    <ellipse cx="100" cy="106" rx="60" ry="54" fill="#d5773a"/>
    <ellipse cx="100" cy="130" rx="31" ry="22" fill="#f4dcb8"/>
    <path d="M104 144 q6 18 -6 20 q-10 -1 -6 -14 Z" fill="#ff8fab"/>
    <ellipse cx="100" cy="117" rx="9" ry="7" fill="${INK}" stroke="none"/>
    ${catMouth(100, 123)} ${eyes(78, 122, 96)} ${blush(58, 142, 114)}
    <path d="M66 82 q10 -8 20 -2 M114 80 q10 -6 20 2" fill="none" stroke-width="3"/>
    <path d="M140 160 q30 -10 26 -40" fill="none" stroke-width="7" stroke="#d5773a"/><path d="M140 160 q30 -10 26 -40" fill="none"/>
    <ellipse cx="70" cy="186" rx="13" ry="7" fill="#d5773a"/><ellipse cx="130" cy="186" rx="13" ry="7" fill="#d5773a"/>`;

  BODY.loris = `
    <ellipse cx="100" cy="152" rx="40" ry="36" fill="#b39a7a"/>
    <circle cx="50" cy="80" r="11" fill="#b39a7a"/><circle cx="150" cy="80" r="11" fill="#b39a7a"/>
    <circle cx="100" cy="104" r="58" fill="#b39a7a"/>
    <ellipse cx="100" cy="116" rx="44" ry="38" fill="#e6d3b3" stroke="none"/>
    <path d="M100 50 V 90" stroke="#6b4b3a" stroke-width="7" fill="none"/>
    <circle cx="76" cy="100" r="21" fill="#6b4b3a" stroke="none"/><circle cx="124" cy="100" r="21" fill="#6b4b3a" stroke="none"/>
    <circle cx="76" cy="100" r="14" fill="${INK}" stroke="none"/><circle cx="124" cy="100" r="14" fill="${INK}" stroke="none"/>
    <circle cx="71" cy="94" r="5" fill="#fff" stroke="none"/><circle cx="119" cy="94" r="5" fill="#fff" stroke="none"/>
    <path d="M95 124 h10 l-5 6 Z" fill="${INK}" stroke="none"/>
    ${smile(100, 134, 16)} ${blush(56, 144, 122)}
    <ellipse cx="72" cy="184" rx="12" ry="7" fill="#b39a7a"/><ellipse cx="128" cy="184" rx="12" ry="7" fill="#b39a7a"/>`;

  let scales = '';
  [[84, 3], [104, 4], [124, 4], [146, 3]].forEach(([y, n], r) => {
    const start = 100 - (n - 1) * 14 + (r % 2 ? 6 : 0);
    for (let i = 0; i < n; i++) { const x = start + i * 28; scales += `<path d="M${x - 13} ${y} q13 -16 26 0 q-13 12 -26 0 Z" fill="#dcb26c"/>`; }
  });
  BODY.pangolin = `
    <path d="M158 138 q30 8 12 42 q-12 10 -24 -6" fill="#c69a5a"/>
    <ellipse cx="108" cy="116" rx="64" ry="54" fill="#c69a5a"/>
    ${scales}
    <path d="M72 108 q-42 -8 -54 14 q12 18 54 12 Z" fill="#f0d9b0"/>
    <circle cx="54" cy="116" r="4" fill="${INK}" stroke="none"/><circle cx="52.5" cy="114.5" r="1.4" fill="#fff" stroke="none"/>
    <circle cx="22" cy="122" r="3" fill="${INK}" stroke="none"/>
    <path d="M38 128 q6 5 12 1" fill="none"/>
    <ellipse cx="62" cy="126" rx="7" ry="4" fill="#ff9aa2" opacity=".55" stroke="none"/>
    <ellipse cx="84" cy="172" rx="13" ry="7" fill="#dcb26c"/><ellipse cx="128" cy="174" rx="13" ry="7" fill="#dcb26c"/>`;

  BODY.fishingcat = `
    <ellipse cx="100" cy="152" rx="40" ry="38" fill="#9aa38f"/>
    <path d="M44 88 L48 32 L94 64 Z" fill="#9aa38f"/><path d="M156 88 L152 32 L106 64 Z" fill="#9aa38f"/>
    <path d="M54 78 L56 48 L82 66 Z" fill="#f2b6a0" stroke="none"/><path d="M146 78 L144 48 L118 66 Z" fill="#f2b6a0" stroke="none"/>
    <ellipse cx="100" cy="108" rx="60" ry="52" fill="#9aa38f"/>
    <path d="M86 66 V88 M100 62 V84 M114 66 V88" stroke="#4a4a44" stroke-width="5" fill="none"/>
    <circle cx="56" cy="108" r="5" fill="#4a4a44" stroke="none"/><circle cx="144" cy="108" r="5" fill="#4a4a44" stroke="none"/>
    <circle cx="62" cy="132" r="4" fill="#4a4a44" stroke="none"/><circle cx="138" cy="132" r="4" fill="#4a4a44" stroke="none"/>
    <ellipse cx="100" cy="130" rx="28" ry="20" fill="#ecebe0"/>
    <path d="M36 124 L70 128 M36 140 L70 134 M164 124 L130 128 M164 140 L130 134" fill="none" stroke-width="3"/>
    <path d="M92 118 h16 l-8 8 Z" fill="#ff8fab"/>
    ${catMouth(100, 126)}
    <ellipse cx="78" cy="100" rx="6" ry="8" fill="${INK}" stroke="none"/><ellipse cx="122" cy="100" rx="6" ry="8" fill="${INK}" stroke="none"/>
    <circle cx="76" cy="97" r="2" fill="#fff" stroke="none"/><circle cx="120" cy="97" r="2" fill="#fff" stroke="none"/>
    ${blush(60, 140, 118)}
    <path d="M118 176 q22 -16 44 0 q-22 16 -44 0 Z" fill="#8ef0c9"/><path d="M162 176 l16 -10 v20 Z" fill="#8ef0c9"/>
    <circle cx="130" cy="174" r="2.2" fill="${INK}" stroke="none"/>
    <ellipse cx="70" cy="186" rx="12" ry="7" fill="#9aa38f"/>`;

  BODY.tiger = `
    <ellipse cx="100" cy="154" rx="44" ry="38" fill="#f0973a"/>
    <path d="M70 150 l-4 16 l14 -8 Z M130 150 l4 16 l-14 -8 Z" fill="${INK}" stroke="none"/>
    <circle cx="52" cy="66" r="15" fill="#f0973a"/><circle cx="148" cy="66" r="15" fill="#f0973a"/>
    <circle cx="52" cy="66" r="7" fill="#f2b6a0" stroke="none"/><circle cx="148" cy="66" r="7" fill="#f2b6a0" stroke="none"/>
    <ellipse cx="100" cy="108" rx="62" ry="56" fill="#f0973a"/>
    <g fill="${INK}" stroke="none">
      <path d="M100 54 l-6 24 h12 Z"/><path d="M70 62 l-2 24 l14 -8 Z"/><path d="M130 62 l2 24 l-14 -8 Z"/>
      <path d="M42 108 l18 -4 l-3 13 Z"/><path d="M158 108 l-18 -4 l3 13 Z"/>
      <path d="M46 130 l16 -1 l-5 10 Z"/><path d="M154 130 l-16 -1 l5 10 Z"/>
    </g>
    <ellipse cx="100" cy="132" rx="31" ry="22" fill="#fff3dc"/>
    <path d="M91 119 h18 l-9 9 Z" fill="${INK}" stroke="none"/>
    ${catMouth(100, 128)} ${eyes(78, 122, 98)} ${blush(60, 140, 116)}
    <ellipse cx="70" cy="188" rx="13" ry="7" fill="#f0973a"/><ellipse cx="130" cy="188" rx="13" ry="7" fill="#f0973a"/>`;

  BODY.binturong = `
    <ellipse cx="100" cy="154" rx="44" ry="38" fill="#4a3f44"/>
    <circle cx="50" cy="64" r="16" fill="#4a3f44"/><circle cx="150" cy="64" r="16" fill="#4a3f44"/>
    <path d="M40 52 l-9 -14 M50 48 l-2 -16 M160 52 l9 -14 M150 48 l2 -16" stroke="#cfc3b6" stroke-width="3.5" fill="none"/>
    <ellipse cx="100" cy="108" rx="62" ry="54" fill="#4a3f44"/>
    <ellipse cx="100" cy="120" rx="42" ry="34" fill="#6b5b60" stroke="none"/>
    <path d="M66 92 q10 -8 22 -2 M112 90 q12 -6 22 2" stroke="#cfc3b6" stroke-width="3.5" fill="none"/>
    <ellipse cx="100" cy="134" rx="25" ry="17" fill="#cfc3b6"/>
    <path d="M74 132 L36 124 M74 138 L36 144 M126 132 L164 124 M126 138 L164 144" stroke="#f6f1ff" stroke-width="3" fill="none"/>
    <ellipse cx="100" cy="125" rx="8" ry="6" fill="${INK}" stroke="none"/>
    ${catMouth(100, 130)} ${eyes(78, 122, 102, 6)} ${blush(60, 140, 118)}
    <ellipse cx="70" cy="188" rx="13" ry="7" fill="#4a3f44"/><ellipse cx="130" cy="188" rx="13" ry="7" fill="#4a3f44"/>`;

  // a golden retriever, for the dog question
  BODY.goldie = `
    <ellipse cx="100" cy="156" rx="46" ry="36" fill="#e8b96a"/>
    <path d="M146 150 q34 -14 22 -46" fill="none" stroke-width="8" stroke="#e8b96a"/><path d="M146 150 q34 -14 22 -46" fill="none"/>
    <path d="M52 70 q-26 10 -22 60 q10 12 24 -4 Z" fill="#d9a24f"/><path d="M148 70 q26 10 22 60 q-10 12 -24 -4 Z" fill="#d9a24f"/>
    <ellipse cx="100" cy="104" rx="56" ry="52" fill="#e8b96a"/>
    <ellipse cx="100" cy="128" rx="30" ry="22" fill="#f6e2b6"/>
    <path d="M104 142 q8 18 -6 22 q-11 -2 -7 -15 Z" fill="#ff8fab"/>
    <ellipse cx="100" cy="116" rx="10" ry="7" fill="${INK}" stroke="none"/>
    ${catMouth(100, 122)} ${eyes(78, 122, 96)} ${blush(58, 142, 114)}
    <path d="M70 86 q8 -6 16 -1 M114 85 q8 -5 16 1" fill="none" stroke-width="3"/>
    <ellipse cx="66" cy="188" rx="14" ry="7" fill="#e8b96a"/><ellipse cx="134" cy="188" rx="14" ry="7" fill="#e8b96a"/>`;

  /* ---------- wrappers ---------- */
  const FILTER = `<filter id="wob" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7"/>
      <feDisplacementMap in="SourceGraphic" scale="2.4"/></filter>
    <linearGradient id="duskG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7a8c4"/><stop offset=".45" stop-color="#ffd7a3"/><stop offset="1" stop-color="#8fd3ff"/></linearGradient>`;
  const G = (inner, sw = 4) => `<g filter="url(#wob)" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;

  const portrait = (key) => `<svg viewBox="0 0 200 200" class="art" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${FILTER}</defs>${G(BODY[key])}</svg>`;

  // place a character with its feet at (x,y), scaled by s
  const ch = (key, x, y, s = .6, flip = false) =>
    `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s}) translate(-100 -192)">${BODY[key]}</g>`;

  /* ---------- scene parts (400x300) ---------- */
  const P = {
    dusk: `<rect width="400" height="300" fill="url(#duskG)"/>`,
    night: `<rect width="400" height="300" fill="#2b3bd6"/>`,
    deep: `<rect width="400" height="300" fill="#151a5a"/>`,
    stars: (seed = 1) => [[40, 30], [120, 18], [210, 44], [300, 24], [360, 60], [80, 70], [250, 80], [340, 110], [30, 120], [160, 96]]
      .filter((_, i) => (i + seed) % 3 !== 0)
      .map(([x, y]) => `<path d="M${x} ${y - 7} l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" fill="#fff" stroke="#fff" stroke-width="1.5"/>`).join(''),
    moon: (x = 340, y = 58, r = 34) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff4f6" stroke="#f0c8dc"/>
      <circle cx="${x - r * .35}" cy="${y - r * .3}" r="${r * .16}" fill="#efc3da" stroke="none"/><circle cx="${x + r * .3}" cy="${y + r * .35}" r="${r * .22}" fill="#efc3da" stroke="none"/>
      <circle cx="${x - 7}" cy="${y - 2}" r="2.2" fill="${INK}" stroke="none"/><circle cx="${x + 7}" cy="${y - 2}" r="2.2" fill="${INK}" stroke="none"/>${smile(x, y + 6, 12)}`,
    ground: (c = '#8fe08f', y = 200) => `<path d="M-5 ${y} q60 -8 120 0 t120 0 t120 0 t60 0 V310 H-5 Z" fill="${c}"/>`,
    grass: (c = '#3f8a3f') => [30, 90, 150, 230, 300, 370].map((x, i) => `<path d="M${x} ${232 + (i % 3) * 18} l4 -12 l4 12 l4 -12 l4 12" fill="none" stroke="${c}" stroke-width="3"/>`).join(''),
    trees: (c = '#0f2f3a') => `<g fill="${c}" stroke="${c}"><ellipse cx="30" cy="150" rx="40" ry="70"/><ellipse cx="95" cy="170" rx="30" ry="50"/><ellipse cx="370" cy="160" rx="42" ry="66"/><ellipse cx="310" cy="176" rx="26" ry="42"/></g>`,
    fireflies: [[60, 120], [140, 90], [220, 130], [300, 100], [180, 60], [340, 150], [90, 180]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="9" fill="#ffd166" opacity=".25" stroke="none"/><circle cx="${x}" cy="${y}" r="3.5" fill="#ffe28a" stroke="none"/>`).join(''),
    peekEyes: [[70, 120], [250, 95], [330, 130]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="3" fill="#ffd166" stroke="none"/><circle cx="${x + 12}" cy="${y}" r="3" fill="#ffd166" stroke="none"/>`).join(''),
    sign: (text, x = 200, y = 210, w = 150) => `<path d="M${x} ${y} V${y - 70}" stroke-width="6"/>
      <rect x="${x - w / 2}" y="${y - 118}" width="${w}" height="50" rx="8" fill="#f7c04a"/>
      <text x="${x}" y="${y - 84}" text-anchor="middle" font-family="'Pixelify Sans','Fredoka',sans-serif" font-size="22" font-weight="700" fill="${INK}" stroke="none">${text}</text>`,
    tram: `<rect x="60" y="120" width="280" height="90" rx="22" fill="#ffcf5c"/>
      <rect x="60" y="120" width="280" height="24" rx="12" fill="#ff8fab"/>
      <rect x="84" y="152" width="46" height="34" rx="8" fill="#bfe9ff"/><rect x="146" y="152" width="46" height="34" rx="8" fill="#bfe9ff"/><rect x="208" y="152" width="46" height="34" rx="8" fill="#bfe9ff"/><rect x="270" y="152" width="46" height="34" rx="8" fill="#bfe9ff"/>
      <circle cx="110" cy="214" r="16" fill="#3b3b4a"/><circle cx="200" cy="214" r="16" fill="#3b3b4a"/><circle cx="290" cy="214" r="16" fill="#3b3b4a"/>
      <circle cx="80" cy="200" r="6" fill="#fff8d0"/><circle cx="320" cy="200" r="6" fill="#fff8d0"/>`,
    phone: (x, y) => `<rect x="${x}" y="${y}" width="26" height="44" rx="6" fill="#fff"/><rect x="${x + 5}" y="${y + 6}" width="16" height="26" fill="#bfe9ff" stroke="none"/>
      <text x="${x + 32}" y="${y - 4}" font-size="18" fill="${INK}" stroke="none">♪</text><text x="${x + 44}" y="${y - 18}" font-size="14" fill="${INK}" stroke="none">♪</text>`,
    popcorn: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 h44 l-5 36 h-34 Z" fill="#ff8fab"/><path d="M14 2 l-2 32 M30 2 l2 32" stroke="#fff" stroke-width="4"/>
      <g fill="#fff3dc"><circle cx="10" cy="-4" r="8"/><circle cx="23" cy="-10" r="9"/><circle cx="36" cy="-4" r="8"/><circle cx="22" cy="1" r="7"/></g></g>`,
    bowl: (x, y, c) => `<ellipse cx="${x}" cy="${y}" rx="26" ry="9" fill="${c}"/><path d="M${x - 26} ${y} q4 22 26 22 q22 0 26 -22" fill="#fff"/>
      <path d="M${x - 10} ${y - 10} q-3 -8 2 -14 M${x + 4} ${y - 10} q-3 -8 2 -14" fill="none" stroke-opacity=".5"/>`,
    chilli: (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 c-4 14 2 34 18 52 c16 18 40 26 62 18 c-4 12 -30 20 -54 6 C4 62 -14 30 0 0 Z" fill="#ff4d4d"/><path d="M0 0 q-14 -10 -8 -22 q12 2 16 16 q-4 4 -8 6 Z" fill="#3f8a3f"/><path d="M8 22 q4 14 14 24" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/><circle cx="52" cy="82" r="4" fill="#3b2a2a" stroke="none"/><circle cx="70" cy="76" r="4" fill="#3b2a2a" stroke="none"/><path d="M56 90 q6 6 12 0" fill="none"/></g>`,
    stage: `<rect x="40" y="110" width="320" height="16" fill="#8b5a2b"/><rect x="40" y="126" width="320" height="30" fill="#c98a4a"/>
      <path d="M40 110 q30 -70 70 -30 q10 -60 90 -40 q80 -20 90 40 q40 -40 70 30 Z" fill="#a03a6a"/>
      <path d="M200 40 L120 126 H280 Z" fill="#fff6c8" opacity=".35" stroke="none"/>`,
    signpost: `<path d="M200 230 V70" stroke-width="7"/>
      <g font-family="'Pixelify Sans','Fredoka',sans-serif" font-size="18" font-weight="700">
        <path d="M200 80 h96 l14 14 l-14 14 h-96 Z" fill="#9ff0cf"/><text x="214" y="100" fill="${INK}" stroke="none">TRAM</text>
        <path d="M200 124 h-96 l-14 14 l14 14 h96 Z" fill="#ffcf5c"/><text x="102" y="144" fill="${INK}" stroke="none">TRAILS</text>
        <path d="M200 168 h96 l14 14 l-14 14 h-96 Z" fill="#ff8fab"/><text x="214" y="188" fill="${INK}" stroke="none">SHOW</text>
      </g>`,
    heart: (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 14 c-14 -14 -22 -18 -18 -30 c3 -8 14 -8 18 0 c4 -8 15 -8 18 0 c4 12 -4 16 -18 30 Z" fill="#ff8fab"/>`,
    magnifier: (x, y) => `<circle cx="${x}" cy="${y}" r="26" fill="#bfe9ff" fill-opacity=".6"/><path d="M${x + 18} ${y + 18} l22 22" stroke-width="9"/>`,
    lantern: (x, y) => `<path d="M${x} ${y} V${y - 60}" stroke-width="5"/><path d="M${x} ${y - 60} q20 -20 40 0" fill="none" stroke-width="5"/><circle cx="${x + 40}" cy="${y - 52}" r="12" fill="#ffe28a"/><circle cx="${x + 40}" cy="${y - 52}" r="24" fill="#ffe28a" opacity=".22" stroke="none"/>`,
    zzz: (x, y) => `<text x="${x}" y="${y}" font-family="'Fredoka'" font-size="20" font-weight="700" fill="${INK}" stroke="none">z</text><text x="${x + 14}" y="${y - 14}" font-family="'Fredoka'" font-size="16" fill="${INK}" stroke="none">z</text>`,
  };

  const scene = (inner) => `<svg viewBox="0 0 400 300" class="scene" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${FILTER}</defs>${G(inner, 3.5)}</svg>`;

  /* ---------- the story scenes ---------- */
  const SCENES = {
    intro: scene(P.night + P.stars(1) + P.moon() + P.trees() + P.ground('#2fa06a', 215) + P.grass('#1f6f48') + P.fireflies +
      ch('onion', 150, 262, .6) + ch('carrot', 235, 262, .58) + P.heart(195, 150, .9) + P.magnifier(300, 200)),
    gate: scene(P.dusk + P.moon(350, 50, 26) + P.trees('#1d5e4a') + P.ground('#8fe08f', 205) + P.grass() +
      P.sign('NIGHT SAFARI', 200, 250, 170) + ch('otter', 80, 270, .55) + ch('dhole', 330, 270, .55) + ch('pangolin', 250, 280, .42)),
    snacks: scene(P.night + P.stars(2) + P.moon(60, 56, 26) + P.trees() + P.ground('#2fa06a', 210) + P.grass('#1f6f48') +
      ch('dhole', 120, 272, .6) + P.popcorn(200, 220) + P.bowl(290, 246, '#ffcf5c') + ch('binturong', 340, 278, .45) + P.zzz(360, 190)),
    tram: scene(P.night + P.stars(1) + P.moon(340, 50, 26) + P.trees() + P.ground('#2fa06a', 220) + P.tram +
      ch('otter', 108, 190, .32) + ch('loris', 170, 190, .32) + ch('tiger', 232, 190, .32) + ch('fishingcat', 294, 190, .32)),
    dog: scene(P.dusk + P.trees('#1d5e4a') + P.ground('#8fe08f', 205) + P.grass() +
      ch('goldie', 230, 280, .7) + P.heart(300, 120, 1) + P.heart(150, 140, .7) + P.heart(330, 170, .55) + ch('onion', 90, 276, .5)),
    dark: scene(P.deep + P.stars(2) + P.trees('#0a1030') + P.ground('#173a3a', 215) + P.peekEyes + P.fireflies +
      ch('onion', 200, 270, .55) + P.lantern(260, 268)),
    show: scene(P.deep + P.stage + P.ground('#3b3f78', 210) +
      ch('otter', 90, 272, .42) + ch('pangolin', 160, 282, .38) + ch('onion', 240, 272, .42) + ch('loris', 320, 272, .42) + P.phone(180, 150) + ch('loris', 200, 126, .3)),
    sunday: scene(P.night + P.stars(1) + P.moon(340, 50, 30) + P.trees() + P.ground('#2fa06a', 215) + P.grass('#1f6f48') +
      P.tram.replace('y="120"', 'y="130"') + ch('fishingcat', 150, 200, .3) + ch('tiger', 210, 200, .3) + ch('dhole', 270, 200, .3)),
    onion: scene(P.night + P.stars(2) + P.moon(60, 56, 26) + P.trees() + P.ground('#2fa06a', 215) + P.grass('#1f6f48') +
      ch('onion', 160, 270, .75) + P.magnifier(262, 168) + ch('carrot', 320, 275, .5)),
    food: scene(P.night + P.stars(2) + P.trees() + P.ground('#2fa06a', 215) +
      `<ellipse cx="200" cy="240" rx="150" ry="34" fill="#f7e2b0"/>` + P.bowl(140, 232, '#ff8fab') + P.bowl(200, 226, '#9ff0cf') + P.bowl(262, 234, '#ffcf5c') +
      ch('otter', 90, 250, .38) + ch('onion', 200, 236, .34) + ch('binturong', 316, 252, .36)),
    route: scene(P.night + P.stars(1) + P.moon(60, 56, 26) + P.trees() + P.ground('#2fa06a', 215) + P.grass('#1f6f48') + P.signpost +
      ch('onion', 300, 276, .5) + ch('loris', 90, 276, .5)),
    spice: scene(P.night + P.stars(2) + P.trees() + P.ground('#2fa06a', 215) + P.grass('#1f6f48') +
      P.chilli(170, 160, 1.1) + ch('tiger', 90, 276, .5) + ch('pangolin', 300, 282, .45) + `<path d="M318 226 q7 -10 0 -16 q-7 6 0 16 Z" fill="#8fd3ff"/>`),
    drum: scene(P.deep + P.stars(1) + P.trees('#0a1030') + P.ground('#173a3a', 215) + P.peekEyes + P.fireflies + P.moon(340, 50, 30)),
  };

  window.ART = { portrait, scene: (k) => SCENES[k] || '', BODY };
})();
