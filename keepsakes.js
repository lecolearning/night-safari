/* Full-resolution group pictures, exported as PNG on demand. No uploads. */
(function () {
  const ITEMS = [
    { key: 'play', title: 'One more game?', description: 'A little clearing, a lot of friends, and nobody ready to go home.', file: 'img/reward-play.webp', filename: 'our-night-safari-playtime.png' },
    { key: 'meal', title: 'There is room for everyone', description: 'A moonlit meal. Everybody brought something to share.', file: 'img/reward-meal.webp', filename: 'our-night-safari-picnic.png' },
    { key: 'tour', title: 'The scenic way, together', description: 'A whole little group taking the long way round.', file: 'img/reward-tour.webp', filename: 'our-night-safari-tour.png' },
  ];

  async function pngFrom(item) {
    const response = await fetch(item.file);
    if (!response.ok) throw Error('The picture could not be loaded.');
    const source = await response.blob();
    const url = URL.createObjectURL(source);
    try {
      const picture = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(Error('The picture could not be opened.'));
        img.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = picture.naturalWidth;
      canvas.height = picture.naturalHeight;
      if (!canvas.width || !canvas.height) throw Error('The picture has no size.');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw Error('This browser cannot prepare a PNG.');
      ctx.drawImage(picture, 0, 0);
      return await new Promise((resolve, reject) => {
        canvas.toBlob(blob => blob ? resolve(blob) : reject(Error('The PNG could not be prepared.')), 'image/png');
      });
    } finally { URL.revokeObjectURL(url); }
  }

  async function save(key) {
    const item = ITEMS.find(picture => picture.key === key);
    if (!item) throw Error('Unknown keepsake.');
    const blob = await pngFrom(item);
    // A phone can offer Save Image through its share sheet. Desktop browsers
    // get a download. Cancelling the share sheet must not trigger a download.
    if (typeof File !== 'undefined' && navigator.share && navigator.canShare) {
      const file = new File([blob], item.filename, { type: 'image/png' });
      try {
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: item.title });
          return 'shared';
        }
      } catch (error) { if (error.name === 'AbortError') return 'cancelled'; }
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.filename;
    try {
      document.body.appendChild(link);
      link.click();
    } finally {
      link.remove();
      // Give the browser time to consume the download before releasing it.
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
    return 'downloaded';
  }
  const api = { ITEMS, save };
  if (typeof window !== 'undefined') window.KEEPSAKES = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
