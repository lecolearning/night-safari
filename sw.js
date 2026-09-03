/* Night Safari Adventure — offline support.
   The park has patchy signal, so everything is cached on first visit and
   served from the cache afterwards. Bump VERSION to ship an update. */

const VERSION = 'ns-v10';
const CORE = 'core-' + VERSION;
const RUNTIME = 'runtime-' + VERSION;

// Relative paths so this works from a GitHub Pages sub-path.
const CORE_ASSETS = [
  './',
  'index.html',
  'bingo.html',
  'sunday.html',
  'plan.html',
  'style.css',
  'sky.js',
  'art.js',
  'quiz.js',
  'animals.js',
  'config.js',
  'pokedex.html',
  'pokedex.js',
  'pokedex.css',
  'bingo.js',
  'sunday.js',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'img/otter.webp',
  'img/dhole.webp',
  'img/loris.webp',
  'img/pangolin.webp',
  'img/fishingcat.webp',
  'img/tiger.webp',
  'img/binturong.webp',
  'img/scene_intro.webp',
  'img/scene_gate.webp',
  'img/scene_snacks.webp',
  'img/scene_tram.webp',
  'img/scene_dog.webp',
  'img/scene_dark.webp',
  'img/scene_show.webp',
  'img/scene_sunday.webp',
  'img/scene_onion.webp',
  'img/scene_food.webp',
  'img/scene_route.webp',
  'img/scene_spice.webp',
  'img/scene_drum.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE);
    // addAll fails the whole install if any single file 404s, so add individually.
    await Promise.all(CORE_ASSETS.map((url) =>
      cache.add(new Request(url, { cache: 'reload' })).catch(() => null)));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Pages: try the network first so updates land, fall back to cache offline.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CORE);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        return (await caches.match(req)) || (await caches.match('index.html')) ||
          new Response('<h1>Offline</h1><p>Open this page once with a connection first.</p>',
            { headers: { 'Content-Type': 'text/html' } });
      }
    })());
    return;
  }

  // Everything else, including fonts: cache first, then network, then cache the result.
  event.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res && (res.ok || res.type === 'opaque')) {
        const cache = await caches.open(sameOrigin ? CORE : RUNTIME);
        cache.put(req, res.clone());
      }
      return res;
    } catch (e) {
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});
