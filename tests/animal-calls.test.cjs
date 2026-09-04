const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the actual audio recipes without playing sound or requiring a browser.
// These checks validate scheduling and the intended softer envelope, not fidelity
// to a real animal recording (the site deliberately uses cartoon impressions).
const source = fs.readFileSync(path.join(__dirname, '..', 'animal-calls.js'), 'utf8');
const start = source.indexOf('  function noiseBuffer(c)');
const end = source.indexOf('  /* ---------- the little public door ---------- */');
assert.ok(start >= 0 && end > start, 'audio recipes must be present');
const cries = vm.runInNewContext(source.slice(start, end) + '\nCRIES;');

function audioContext() {
  const nodes = [];
  const buffers = [];
  const currentTime = 5;
  function param() {
    return {
      value: 1, events: [],
      setValueAtTime(value, time) { this.add('set', value, time); },
      exponentialRampToValueAtTime(value, time) {
        assert.ok(value > 0, 'exponential ramps cannot end at zero or negative values');
        this.add('ramp', value, time);
      },
      add(type, value, time) {
        assert.ok(Number.isFinite(value));
        assert.ok(Number.isFinite(time) && time >= currentTime);
        this.events.push({ type, value, time });
      },
    };
  }
  function node(kind) {
    const result = {
      kind, connections: [],
      connect(target) { this.connections.push(target); return target; },
    };
    if (kind === 'gain') result.gain = param();
    if (kind === 'oscillator' || kind === 'filter') result.frequency = param();
    if (kind === 'filter') result.Q = param();
    if (kind === 'oscillator' || kind === 'buffer') {
      result.start = time => {
        assert.ok(Number.isFinite(time) && time >= currentTime);
        result.startsAt = time;
      };
      result.stop = time => {
        assert.ok(Number.isFinite(time) && time > result.startsAt);
        result.stopsAt = time;
      };
    }
    nodes.push(result);
    return result;
  }
  const context = {
    currentTime, sampleRate: 48000,
    createOscillator: () => node('oscillator'),
    createGain: () => node('gain'),
    createBiquadFilter: () => node('filter'),
    createBufferSource: () => node('buffer'),
    createBuffer(channels, length, sampleRate) {
      assert.equal(channels, 1);
      assert.equal(sampleRate, context.sampleRate);
      const data = new Float32Array(length);
      const buffer = { getChannelData: () => data };
      buffers.push(buffer);
      return buffer;
    },
  };
  return { context, nodes, buffers, bus: { kind: 'bus' } };
}

test('all thirteen calls schedule finite, bounded audio with faded endings', () => {
  assert.equal(Object.keys(cries).length, 13);
  for (const [name, cry] of Object.entries(cries)) {
    const { context, bus, nodes } = audioContext();
    cry(context, bus);
    const sources = nodes.filter(node => node.kind === 'oscillator' || node.kind === 'buffer');
    assert.ok(sources.length > 0, name);
    for (const node of sources) assert.ok(node.stopsAt <= context.currentTime + 1.5, name);
    for (const node of nodes.filter(node => node.kind === 'gain')) {
      assert.equal(node.gain.events[0].value, 0.0001, name);
      assert.equal(node.gain.events.at(-1).value, 0.0001, name);
      assert.equal(node.connections[0], bus, name);
      assert.ok(node.gain.events[1].time > node.gain.events[0].time, name);
      assert.ok(node.gain.events[2].time > node.gain.events[1].time, name);
    }
  }
});

test('bearcat uses three rounded sine notes with soft attacks, not sawtooth buzzing', () => {
  const { context, bus, nodes } = audioContext();
  cries.binturong(context, bus);
  const notes = nodes.filter(node => node.kind === 'oscillator');
  assert.equal(notes.length, 3);
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    assert.equal(note.type, 'sine');
    const envelope = note.connections[0].gain.events;
    assert.ok(envelope[1].time - envelope[0].time >= 0.06, 'at least 60ms to ease in');
    assert.ok(envelope[1].value <= 0.13, 'keep it quieter than the old 0.26 pulses');
    assert.ok(envelope[2].time - envelope[1].time >= 0.12, 'gentle release');
    if (i < notes.length - 1) assert.ok(envelope[2].time < notes[i + 1].startsAt);
  }
});

test('bearcat breath is filtered, subtle and uses one reusable noise buffer', () => {
  const { context, bus, nodes, buffers } = audioContext();
  cries.binturong(context, bus);
  const breaths = nodes.filter(node => node.kind === 'buffer');
  assert.equal(breaths.length, 3);
  assert.equal(buffers.length, 1);
  for (const breath of breaths) {
    assert.equal(breath.buffer, buffers[0]);
    const filter = breath.connections[0];
    assert.equal(filter.type, 'bandpass');
    assert.ok(filter.connections[0].gain.events[1].value <= 0.025);
  }
  cries.binturong(context, bus);
  assert.equal(buffers.length, 1, 'repeated taps do not allocate more noise buffers');
});
