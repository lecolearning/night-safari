// Night sky: stars, a moon, fireflies, a treeline and a pair of eyes that peek out now and then.
(function () {
  const sky = document.createElement('div');
  sky.className = 'sky';
  const rnd = (a, b) => a + Math.random() * (b - a);

  for (let i = 0; i < 70; i++) {
    const s = document.createElement('i');
    s.className = 'star';
    s.style.left = rnd(0, 100) + '%';
    s.style.top = rnd(0, 75) + '%';
    s.style.setProperty('--d', rnd(2, 6) + 's');
    s.style.animationDelay = rnd(0, 5) + 's';
    if (Math.random() < 0.2) { s.style.width = s.style.height = '3px'; }
    sky.appendChild(s);
  }

  const moon = document.createElement('div');
  moon.className = 'moon';
  moon.innerHTML = '<span class="face">˙ᵕ˙</span>';
  sky.appendChild(moon);

  for (let i = 0; i < 16; i++) {
    const f = document.createElement('i');
    f.className = 'firefly';
    f.style.left = rnd(0, 100) + '%';
    f.style.top = rnd(20, 95) + '%';
    f.style.setProperty('--t', rnd(9, 18) + 's');
    f.style.setProperty('--g', rnd(1.8, 3.6) + 's');
    f.style.setProperty('--dl', rnd(0, 8) + 's');
    for (let k = 1; k <= 3; k++) {
      f.style.setProperty('--x' + k, rnd(-60, 60) + 'px');
      f.style.setProperty('--y' + k, rnd(-50, 50) + 'px');
    }
    sky.appendChild(f);
  }

  const trees = document.createElement('div');
  trees.className = 'trees';
  sky.appendChild(trees);

  const eyes = document.createElement('div');
  eyes.className = 'peek';
  eyes.textContent = '••';
  eyes.style.left = rnd(10, 80) + '%';
  eyes.style.animationDelay = rnd(0, 4) + 's';
  sky.appendChild(eyes);

  document.body.prepend(sky);
})();

// Tiny toast helper shared by both pages.
window.toast = function (msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 1800);
};

/* ============================================================
   Easter eggs. Self-contained: styles are injected from here so
   this file can be dropped into any page without touching CSS.
   Three of them, all quiet, none of them get in the way.
   ============================================================ */
(function easterEggs() {
  const css = document.createElement('style');
  css.textContent = `
    .moon{pointer-events:auto;cursor:pointer}
    .firefly{pointer-events:auto;cursor:pointer}
    .firefly.caught{animation:none!important;opacity:1;background:#fff;
      box-shadow:0 0 22px 10px rgba(255,240,180,.95);transform:scale(1.7)}
    .egg-rain{position:fixed;top:-40px;z-index:6;pointer-events:none;font-size:26px;
      animation:eggfall var(--t) linear forwards}
    @keyframes eggfall{to{transform:translate(var(--dx),110vh) rotate(var(--r));opacity:.85}}
    @media (prefers-reduced-motion:reduce){.egg-rain{display:none}}
  `;
  document.head.appendChild(css);

  /* --- 1. the moon keeps count --- */
  const NOTES = [
    'Field note: the moon is aware of you.',
    'Field note: still being watched. Politely.',
    'Field note: the moon has filed a report.',
    'Field note: nothing further to add. Nice hat, though.',
  ];
  let moonTaps = 0;
  const moon = document.querySelector('.moon');
  if (moon) {
    moon.setAttribute('title', '');
    moon.addEventListener('click', () => {
      moonTaps++;
      const face = moon.querySelector('.face');
      if (face) {
        face.textContent = moonTaps % 2 ? '^‿^' : '˙ᵕ˙';
        moon.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.14)' }, { transform: 'scale(1)' }],
          { duration: 420, easing: 'ease-out' });
      }
      if (moonTaps >= 3 && window.toast) {
        window.toast(NOTES[Math.min(moonTaps - 3, NOTES.length - 1)]);
      }
    });
  }

  /* --- 2. catch all seven fireflies --- */
  const flies = [...document.querySelectorAll('.firefly')];
  let caught = 0;
  flies.forEach((f) => {
    f.addEventListener('click', () => {
      if (f.classList.contains('caught')) return;
      f.classList.add('caught');
      caught++;
      if (navigator.vibrate) navigator.vibrate(18);
      if (caught === 1 && window.toast) window.toast('Caught one. ✨');
      else if (caught === 3 && window.toast) window.toast('Three. Keep going.');
      else if (caught === 7 && window.toast) {
        window.toast('Seven caught. One for each animal. 🔎');
        flies.forEach((x, i) => setTimeout(() => x.classList.remove('caught'), 900 + i * 120));
        caught = 0;
      }
    });
  });

  /* --- 3. type a certain vegetable --- */
  const WORDS = { onion: ['🧅', 'I knew it.'], carrot: ['🥕', 'Rooting for you.'] };
  let typed = '';
  window.addEventListener('keydown', (e) => {
    if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    typed = (typed + e.key.toLowerCase()).slice(-8);
    for (const w of Object.keys(WORDS)) {
      if (typed.endsWith(w)) { typed = ''; rain(WORDS[w][0]); if (window.toast) window.toast(WORDS[w][1]); }
    }
  });

  function rain(glyph) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < 22; i++) {
      const el = document.createElement('span');
      el.className = 'egg-rain';
      el.textContent = glyph;
      el.style.left = Math.random() * 96 + 'vw';
      el.style.setProperty('--t', (2 + Math.random() * 1.8) + 's');
      el.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
      el.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      el.style.animationDelay = Math.random() * 0.7 + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5200);
    }
  }
})();
