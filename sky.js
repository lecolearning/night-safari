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
