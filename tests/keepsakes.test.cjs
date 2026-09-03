const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'keepsakes.js'), 'utf8');

function boot(options = {}) {
  const requests = [], revoked = [], urls = [], timers = [], downloads = [], shares = [], drawings = [];
  const png = { type: 'image/png' }, original = { type: 'image/webp' };
  let canvas;
  const context = vm.createContext({ window: {},
    fetch: async file => { requests.push(file); if (options.networkError) throw Error('offline'); return { ok: !options.httpError, blob: async () => original }; },
    URL: { createObjectURL(blob) { urls.push(blob); return 'blob:' + urls.length; }, revokeObjectURL(url) { revoked.push(url); } },
    Image: class {
      naturalWidth = options.noSize ? 0 : 2048; naturalHeight = 1536;
      set src(value) { if (options.decodeError) this.onerror(); else this.onload(); }
    },
    File: class { constructor(parts, name, settings) { this.parts = parts; this.name = name; this.type = settings.type; } },
    navigator: options.share ? {
      canShare: () => !options.cannotShare,
      share: async data => { shares.push(data); if (options.shareError) throw { name: options.shareError }; },
    } : {},
    document: {
      body: { appendChild(link) { link.appended = true; } },
      createElement(tag) {
        if (tag === 'canvas') {
          canvas = { getContext: () => options.noContext ? null : { drawImage: (...args) => drawings.push(args) },
            toBlob(callback, type) { assert.equal(type, 'image/png'); callback(options.noBlob ? null : png); } };
          return canvas;
        }
        const link = { click() { downloads.push({ href: this.href, name: this.download, appended: this.appended }); }, remove() { this.removed = true; } };
        return link;
      },
    },
    setTimeout: (callback, delay) => timers.push({ callback, delay }),
  });
  vm.runInContext(source, context);
  return { api: context.window.KEEPSAKES, requests, revoked, urls, timers, downloads, shares, drawings, get canvas() { return canvas; } };
}

test('three different rewards are lazy and reject unrecognised requests', async () => {
  const app = boot();
  assert.equal(app.api.ITEMS.length, 3);
  assert.equal(new Set(app.api.ITEMS.map(item => item.key)).size, 3);
  assert.deepEqual(app.requests, []);
  await assert.rejects(app.api.save('../../anything'), /Unknown keepsake/);
  assert.deepEqual(app.requests, []);
});

test('reward code loads before the field guide and every offline asset exists', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'pokedex.html'), 'utf8');
  assert.ok(html.indexOf('keepsakes.js') < html.indexOf('pokedex.js'));
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const block = sw.slice(sw.indexOf('const CORE_ASSETS'), sw.indexOf('self.addEventListener'));
  const assets = [...block.matchAll(/'([^']+)'/g)].map(match => match[1]);
  for (const asset of assets) assert.ok(fs.existsSync(path.join(root, asset)), 'Missing offline asset: ' + asset);
  for (const item of boot().api.ITEMS) assert.ok(assets.includes(item.file));
  assert.ok(assets.includes('keepsakes.js'));
});

test('desktop downloads a full-resolution PNG and cleans up object URLs', async () => {
  const app = boot();
  assert.equal(await app.api.save('play'), 'downloaded');
  assert.deepEqual(app.requests, ['img/reward-play.webp']);
  assert.equal(app.canvas.width, 2048);
  assert.equal(app.canvas.height, 1536);
  assert.equal(app.drawings.length, 1);
  assert.equal(app.urls[1].type, 'image/png');
  assert.deepEqual(app.downloads, [{ href: 'blob:2', name: 'our-night-safari-playtime.png', appended: true }]);
  assert.deepEqual(app.revoked, ['blob:1']);
  assert.equal(app.timers[0].delay, 60000);
  app.timers[0].callback();
  assert.deepEqual(app.revoked, ['blob:1', 'blob:2']);
});

test('mobile sharing supplies a named PNG file, with no duplicate download', async () => {
  const app = boot({ share: true });
  assert.equal(await app.api.save('meal'), 'shared');
  assert.equal(app.shares[0].files[0].name, 'our-night-safari-picnic.png');
  assert.equal(app.shares[0].files[0].type, 'image/png');
  assert.equal(app.downloads.length, 0);
  assert.deepEqual(app.revoked, ['blob:1']);
});

test('cancelling the share sheet does not start an unwanted download', async () => {
  const app = boot({ share: true, shareError: 'AbortError' });
  assert.equal(await app.api.save('tour'), 'cancelled');
  assert.equal(app.downloads.length, 0);
});

test('unavailable or refused sharing falls back to a PNG download', async () => {
  for (const options of [{ share: true, cannotShare: true }, { share: true, shareError: 'NotAllowedError' }]) {
    const app = boot(options);
    assert.equal(await app.api.save('tour'), 'downloaded');
    assert.equal(app.downloads[0].name, 'our-night-safari-tour.png');
  }
});

for (const failure of ['networkError', 'httpError', 'decodeError', 'noSize', 'noContext', 'noBlob']) {
  test('failed PNG preparation does not claim success: ' + failure, async () => {
    const app = boot({ [failure]: true });
    await assert.rejects(app.api.save('play'));
    assert.equal(app.downloads.length, 0);
    assert.equal(app.shares.length, 0);
    assert.equal(app.revoked.length, app.urls.length);
  });
}
