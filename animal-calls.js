/* ============================================================
   The animal calls, shared by the field guide and the guessing game.
   Every one is a few oscillators and a bit of noise: an impression,
   not a recording. Nothing plays unprompted, nothing is downloaded,
   and nothing here decides who is allowed to hear what — that is the
   calling page's business.
   ============================================================ */
(function () {
  /* ============================================================
     The calls. Every one is a few oscillators and a bit of noise:
     an impression, not a recording. Nothing plays unprompted.
     ============================================================ */
  const CRY_NOTE = {
    otter: 'A burst of excited squeaks, all at once, about nothing.',
    dhole: "A rising whistle. It is how the pack says 'over here' in the dark.",
    loris: 'A soft unhurried whistle. It will get there when it gets there.',
    pangolin: 'Two small snuffles. Pangolins are famously almost silent, so this is generous.',
    fishingcat: 'A chirrup, then a low rumble of approval.',
    tiger: 'A long low roar, more felt than heard.',
    binturong: 'A soft, sleepy chuckle. Still faintly popcorn-scented.',
    tapir: 'A tiny whistle from someone in no particular hurry.',
    flyingsquirrel: 'A quick little chirrup, then off to the next tree.',
    flyingfox: 'Two soft chatters. Supper has been located.',
    owl: 'Two rounded little hoots. A confident direction, probably.',
    porcupine: 'A tiny rustle and a shy little snuffle.',
    elephant: 'A warm, low rumble. The picnic is ready.',
  };

  let audio = null;            // AudioContext, made on the first tap
  let playing = null;          // gain node of whatever is sounding now
  let audioBroken = false;

  function ctx() {
    if (audioBroken) return null;
    if (!audio) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) { audioBroken = true; return null; }
      try { audio = new Ctor(); } catch (e) { audioBroken = true; return null; }
    }
    if (audio.state === 'suspended' && audio.resume) audio.resume().catch(() => {});
    return audio;
  }

  function noiseBuffer(c) {
    if (!c._dexNoise) {
      const buf = c.createBuffer(1, Math.floor(c.sampleRate * 1.5), c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      c._dexNoise = buf;
    }
    return c._dexNoise;
  }

  // A pitched note that slides from f0 to f1.
  function chirp(c, bus, at, o) {
    const t = c.currentTime + at;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f0, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.f1 || o.f0), t + o.dur);
    const peak = o.gain || 0.2;
    const rise = o.soft ? o.dur * 0.35 : 0.012;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + rise);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    osc.connect(g).connect(bus);
    osc.start(t);
    osc.stop(t + o.dur + 0.05);
  }

  // A breathy puff of filtered noise.
  function puff(c, bus, at, o) {
    const t = c.currentTime + at;
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(o.f, t);
    bp.Q.value = o.q || 1;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain || 0.2, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(bp).connect(g).connect(bus);
    src.start(t);
    src.stop(t + o.dur + 0.05);
  }

  // Something big and low, with the top rolled off.
  function rumble(c, bus, at, o) {
    const t = c.currentTime + at;
    const osc = c.createOscillator();
    const lp = c.createBiquadFilter();
    const g = c.createGain();
    osc.type = o.saw ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(o.f0, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(25, o.f1 || o.f0), t + o.dur);
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(o.cut || 420, t);
    lp.frequency.exponentialRampToValueAtTime(180, t + o.dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain || 0.3, t + Math.min(0.08, o.dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    osc.connect(lp).connect(g).connect(bus);
    osc.start(t);
    osc.stop(t + o.dur + 0.05);
  }

  const CRIES = {
    otter: (c, bus) => {
      for (let i = 0; i < 5; i++) {
        chirp(c, bus, i * 0.085, { type: 'triangle', f0: 880 + i * 95, f1: 1480 + i * 95, dur: 0.07, gain: 0.2 });
      }
      chirp(c, bus, 0.47, { type: 'triangle', f0: 1300, f1: 900, dur: 0.12, gain: 0.16 });
    },
    dhole: (c, bus) => {
      chirp(c, bus, 0, { type: 'sine', f0: 720, f1: 1680, dur: 0.26, gain: 0.22 });
      chirp(c, bus, 0.25, { type: 'sine', f0: 1680, f1: 1180, dur: 0.32, gain: 0.18 });
      chirp(c, bus, 0.66, { type: 'sine', f0: 900, f1: 1500, dur: 0.2, gain: 0.14 });
    },
    loris: (c, bus) => {
      chirp(c, bus, 0, { type: 'sine', f0: 620, f1: 800, dur: 0.5, gain: 0.14, soft: true });
      chirp(c, bus, 0.62, { type: 'sine', f0: 780, f1: 560, dur: 0.5, gain: 0.11, soft: true });
    },
    pangolin: (c, bus) => {
      puff(c, bus, 0, { f: 780, q: 1.1, dur: 0.16, gain: 0.26 });
      puff(c, bus, 0.26, { f: 540, q: 1.1, dur: 0.22, gain: 0.22 });
      rumble(c, bus, 0.3, { f0: 120, f1: 90, dur: 0.25, gain: 0.12 });
    },
    fishingcat: (c, bus) => {
      chirp(c, bus, 0, { type: 'triangle', f0: 1150, f1: 720, dur: 0.11, gain: 0.2 });
      chirp(c, bus, 0.16, { type: 'triangle', f0: 980, f1: 640, dur: 0.14, gain: 0.18 });
      rumble(c, bus, 0.36, { f0: 72, f1: 58, dur: 0.55, gain: 0.3, saw: true, cut: 300 });
    },
    tiger: (c, bus) => {
      rumble(c, bus, 0, { f0: 92, f1: 60, dur: 1.15, gain: 0.42, saw: true, cut: 520 });
      puff(c, bus, 0.04, { f: 240, q: 0.8, dur: 1.0, gain: 0.16 });
      rumble(c, bus, 0.02, { f0: 46, f1: 38, dur: 1.2, gain: 0.28 });
    },
    binturong: (c, bus) => {
      // Rounded little "hoo" notes instead of short sawtooth bursts, which
      // made the chuckle sound like a buzzing speaker. A little breath keeps
      // it warm; each note eases in and fades out before the next one starts.
      [0, 0.25, 0.52].forEach((at, i) => {
        chirp(c, bus, at, { type: 'sine', f0: 330 - i * 30, f1: 220 - i * 15,
          dur: 0.2 + i * 0.03, gain: 0.13 - i * 0.02, soft: true });
        puff(c, bus, at + 0.01, { f: 700 - i * 60, q: 0.7, dur: 0.16 + i * 0.02, gain: 0.025 });
      });
    },
    tapir: (c, bus) => {
      chirp(c, bus, 0, { f0: 640, f1: 880, dur: 0.3, gain: 0.12, soft: true });
      chirp(c, bus, 0.4, { f0: 820, f1: 620, dur: 0.22, gain: 0.09, soft: true });
    },
    flyingsquirrel: (c, bus) => {
      [0, 0.17, 0.37].forEach((at, i) => chirp(c, bus, at,
        { f0: 920 + i * 70, f1: 1250 - i * 40, dur: 0.12, gain: 0.09, soft: true }));
    },
    flyingfox: (c, bus) => {
      [0, 0.28].forEach((at, i) => chirp(c, bus, at,
        { f0: 570 - i * 50, f1: 340, dur: 0.2, gain: 0.1, soft: true }));
    },
    owl: (c, bus) => {
      [0, 0.42].forEach((at, i) => chirp(c, bus, at,
        { f0: 440 - i * 35, f1: 350 - i * 25, dur: 0.3, gain: 0.1, soft: true }));
    },
    porcupine: (c, bus) => {
      puff(c, bus, 0, { f: 580, q: 0.8, dur: 0.24, gain: 0.035 });
      chirp(c, bus, 0.28, { f0: 340, f1: 260, dur: 0.22, gain: 0.07, soft: true });
    },
    elephant: (c, bus) => {
      rumble(c, bus, 0, { f0: 100, f1: 65, dur: 0.8, gain: 0.18, cut: 300 });
      puff(c, bus, 0.05, { f: 220, q: 0.8, dur: 0.65, gain: 0.025 });
    },
  };

  /* ---------- the little public door ---------- */
  // Returns what happened, so each page can say so in its own words:
  // 'played', 'quiet' (this browser will not make a sound) or 'broken'.
  function play(key) {
    if (!Object.prototype.hasOwnProperty.call(CRIES, key)) return 'quiet';
    const c = ctx();
    if (!c) return 'quiet';
    hush(c);
    const bus = c.createGain();
    bus.gain.value = 0.9;
    bus.connect(c.destination);
    playing = bus;
    try { CRIES[key](c, bus); } catch (e) { return 'broken'; }
    setTimeout(() => {
      try { bus.disconnect(); } catch (e) { /* already gone */ }
      if (playing === bus) playing = null;
    }, 2600);
    return 'played';
  }

  // Hush whatever is already sounding, gently, rather than cutting it off.
  function hush(c) {
    if (!playing) return;
    try {
      playing.gain.cancelScheduledValues(c.currentTime);
      playing.gain.setValueAtTime(playing.gain.value || 0.0001, c.currentTime);
      playing.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.06);
    } catch (e) { /* already finished */ }
  }
  function stop() {
    const c = audio;
    if (c) hush(c);
    playing = null;
  }

  const api = {
    KEYS: Object.keys(CRIES),
    has: (key) => Object.prototype.hasOwnProperty.call(CRIES, key),
    note: (key) => CRY_NOTE[key] || '',
    play,
    stop,
  };
  if (typeof window !== 'undefined') window.ANIMAL_CALLS = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
