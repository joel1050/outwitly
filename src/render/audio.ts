/** Tiny synthesized sound effects. Silent until the first user interaction. */
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let enabled = false;
let userMuted = false;
let suppressed = false;

export function initAudio(muted: boolean) {
  userMuted = muted;
  const unlock = () => {
    if (!ctx) {
      ctx = new AudioContext();
      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    void ctx.resume();
    enabled = true;
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
}

export function setMuted(m: boolean) { userMuted = m; }
export function isMuted() { return userMuted || !enabled; }
export function setSuppressed(v: boolean) { suppressed = v; }

function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.15, at = 0, slideTo?: number) {
  const c = ctx!;
  const t = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function hiss(dur: number, filter: BiquadFilterType, freq: number, gain = 0.2, at = 0, freqTo?: number) {
  const c = ctx!;
  const t = c.currentTime + at;
  const src = c.createBufferSource();
  src.buffer = noise;
  const f = c.createBiquadFilter();
  f.type = filter;
  f.frequency.setValueAtTime(freq, t);
  if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(c.destination);
  src.start(t);
  src.stop(t + dur);
}

/** Noise through a filter whose cutoff and gain follow the given points [time, value]. */
function shapedNoise(dur: number, type: BiquadFilterType, freqPts: [number, number][], gainPts: [number, number][], q = 1, at = 0) {
  const c = ctx!;
  const t = c.currentTime + at;
  const src = c.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(freqPts[0][1], t);
  for (const [dt, v] of freqPts.slice(1)) f.frequency.exponentialRampToValueAtTime(v, t + dt);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  for (const [dt, v] of gainPts) g.gain.exponentialRampToValueAtTime(Math.max(0.0001, v), t + dt);
  src.connect(f).connect(g).connect(c.destination);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur);
}

/** Paper rustle: bursts of filtered noise, like a slip being folded and tossed. */
function rustle() {
  for (let i = 0; i < 4; i++) {
    const at = i * 0.045 + Math.random() * 0.02;
    const fq = 2800 + Math.random() * 1800;
    shapedNoise(0.07, 'bandpass', [[0, fq], [0.06, fq * 0.7]], [[0.008, 0.16], [0.065, 0.0001]], 1.4, at);
  }
}

/** Water droplets: short sine blips that fall in pitch. */
function droplets(n: number, spread: number, gain: number, at = 0) {
  for (let i = 0; i < n; i++) {
    const f = 700 + Math.random() * 1300;
    tone(f, 0.07, 'sine', gain, at + Math.random() * spread, f * 0.45);
  }
}

export type Sfx = 'pop' | 'coin' | 'clunk' | 'splash' | 'splat' | 'swish' | 'whoosh' | 'balloonpop' | 'drizzle'
  | 'thud' | 'cheer' | 'fail' | 'tick' | 'rumble' | 'select' | 'lock' | 'step' | 'poof'
  | 'ballot' | 'drop' | 'ding';

export function sfx(name: Sfx) {
  if (!ctx || !enabled || userMuted || suppressed) return;
  switch (name) {
    case 'pop': tone(420, 0.09, 'sine', 0.1, 0, 820); break;
    case 'select': tone(660, 0.06, 'triangle', 0.08); break;
    case 'lock': tone(523, 0.08, 'triangle', 0.12); tone(784, 0.12, 'triangle', 0.12, 0.07); break;
    case 'coin': tone(988, 0.07, 'square', 0.04); tone(1319, 0.16, 'square', 0.04, 0.06); break;
    case 'clunk': tone(110, 0.14, 'square', 0.1, 0, 70); hiss(0.06, 'lowpass', 900, 0.25); break;
    case 'splash':
      // A wet slap, the body of the splash, then droplets landing.
      shapedNoise(0.08, 'highpass', [[0, 2500], [0.08, 1200]], [[0.004, 0.5], [0.08, 0.0001]], 0.7);
      shapedNoise(0.55, 'lowpass', [[0, 3200], [0.5, 350]], [[0.01, 0.45], [0.12, 0.25], [0.55, 0.0001]], 0.8);
      droplets(7, 0.35, 0.05, 0.08);
      break;
    case 'splat':
      shapedNoise(0.3, 'lowpass', [[0, 1800], [0.28, 250]], [[0.006, 0.3], [0.3, 0.0001]], 0.9);
      tone(140, 0.12, 'sine', 0.18, 0, 60);
      droplets(3, 0.15, 0.03, 0.05);
      break;
    case 'whoosh':
      // Air rushing past: a resonant band that sweeps up then back down.
      shapedNoise(0.5, 'bandpass', [[0, 350], [0.2, 1900], [0.5, 500]], [[0.12, 0.32], [0.3, 0.18], [0.5, 0.0001]], 3.5);
      break;
    case 'balloonpop':
      shapedNoise(0.06, 'highpass', [[0, 900], [0.06, 600]], [[0.002, 0.7], [0.06, 0.0001]], 0.5);
      tone(160, 0.08, 'sine', 0.3, 0, 70);
      break;
    case 'drizzle':
      shapedNoise(0.9, 'highpass', [[0, 5000], [0.9, 3000]], [[0.1, 0.06], [0.9, 0.0001]], 0.6);
      droplets(6, 0.7, 0.025, 0.05);
      break;
    case 'ballot': rustle(); break;
    case 'drop':
      // Slip lands in a wooden box: a hollow knock.
      tone(260, 0.12, 'triangle', 0.22, 0, 130);
      tone(520, 0.05, 'sine', 0.08, 0, 300);
      shapedNoise(0.04, 'bandpass', [[0, 1800], [0.04, 900]], [[0.002, 0.25], [0.04, 0.0001]], 2);
      break;
    case 'ding':
      // Small bell: a fundamental plus an inharmonic partial, long tail.
      tone(1046, 0.9, 'sine', 0.12);
      tone(2637, 0.5, 'sine', 0.04);
      tone(1568, 0.7, 'sine', 0.05, 0.01);
      break;
    case 'swish': hiss(0.18, 'highpass', 1200, 0.2, 0, 4000); break;
    case 'thud': tone(90, 0.18, 'sine', 0.3, 0, 50); break;
    case 'poof': hiss(0.3, 'lowpass', 1600, 0.4, 0, 200); tone(70, 0.25, 'sine', 0.25, 0, 40); break;
    case 'step': tone(240, 0.04, 'sine', 0.05, 0, 180); break;
    case 'tick': tone(1500, 0.03, 'square', 0.03); break;
    case 'rumble': hiss(1.2, 'lowpass', 300, 0.25, 0, 500); break;
    case 'cheer': [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'triangle', 0.1, i * 0.07)); break;
    case 'fail': [392, 330, 262].forEach((f, i) => tone(f, 0.22, 'sawtooth', 0.05, i * 0.13)); break;
  }
}
