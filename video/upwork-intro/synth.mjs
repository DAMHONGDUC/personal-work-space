// Bright, confident pop-house for the Upwork intro film, no samples: 120 bpm in
// D major (D-A-Bm-G), so a scene of 360 frames is exactly three bars.
//   bars 0-2   house piano and finger snaps, a riser into the drop
//   bars 3-11  full groove: kick, clap, shaker, offbeat bass, piano stabs, whistle hook
//   bars 12-14 a lighter breath (no kick), riser
//   bars 15-   full again, the hook an octave up for the close, ending on a held D chord
//   editorial-music.wav
import fs from 'node:fs';

const SR = 48000;
const out = new URL('./public/', import.meta.url);
function writeWav(name, L, R = L) {
  const n = L.length, buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  fs.writeFileSync(new URL(name, out), buf);
}
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
let seed = 5;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
function lowpass(x, hz) {
  const a = Math.exp(-2 * Math.PI * hz / SR); let s = 0;
  const y = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) { s = x[i] * (1 - a) + s * a; y[i] = s; }
  return y;
}
const highpass = (x, hz) => { const l = lowpass(x, hz); return x.map((v, i) => v - l[i]); };
function room(x, wet = 0.25, spread = 0) {
  const y = new Float32Array(x.length);
  for (const d of [1117, 1301, 1559, 1789].map(v => Math.round((v + spread) * SR / 44100))) {
    const b = new Float32Array(d); let idx = 0, lp = 0;
    for (let i = 0; i < x.length; i++) { const o = b[idx]; lp = o * 0.6 + lp * 0.4; b[idx] = x[i] * 0.25 + lp * 0.74; idx = (idx + 1) % d; y[i] += o; }
  }
  return x.map((v, i) => v * (1 - wet) + y[i] * wet);
}

const BPM = 120, BEAT = 60 / BPM, BAR = BEAT * 4, S16 = BEAT / 4;
const DUR = Number(process.argv[2] || 45);
const N = Math.ceil(DUR * SR);
const drums = new Float32Array(N), clapBus = new Float32Array(N), bassBus = new Float32Array(N);
const pnL = new Float32Array(N), pnR = new Float32Array(N), ldL = new Float32Array(N), ldR = new Float32Array(N);
const kicks = [];

function kick(t0) {
  kicks.push(t0);
  const s = Math.round(t0 * SR); let ph = 0;
  for (let i = 0; i < 0.35 * SR && s + i < N; i++) {
    const t = i / SR, f = 50 + 110 * Math.exp(-t * 30);
    ph += 2 * Math.PI * f / SR;
    drums[s + i] += (Math.sin(ph) * Math.exp(-t * 7) + rnd() * 0.2 * Math.exp(-t * 300)) * 0.85;
  }
}
function clap(t0, vel = 1) {
  const s = Math.round(t0 * SR);
  for (let i = 0; i < 0.25 * SR && s + i < N; i++) {
    const t = i / SR;
    const env = [0, 0.01, 0.02].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * (o < 0.02 ? 120 : 20)) : 0), 0);
    clapBus[s + i] += rnd() * env * 0.45 * vel;
  }
}
function snap(t0) {
  const s = Math.round(t0 * SR);
  for (let i = 0; i < 0.08 * SR && s + i < N; i++) { const t = i / SR; clapBus[s + i] += rnd() * Math.exp(-t * 90) * 0.35; }
}
function shaker(t0, vel) {
  const s = Math.round(t0 * SR);
  for (let i = 0; i < 0.05 * SR && s + i < N; i++) { const t = i / SR; drums[s + i] += rnd() * Math.min(1, t / 0.008) * Math.exp(-t * 70) * vel; }
}
function openHat(t0, vel) {
  const s = Math.round(t0 * SR);
  for (let i = 0; i < 0.2 * SR && s + i < N; i++) drums[s + i] += rnd() * Math.exp(-(i / SR) * 18) * vel;
}
function bass(t0, m, dur) {
  const f = midi(m), s = Math.round(t0 * SR);
  for (let i = 0; i < (dur + 0.04) * SR && s + i < N; i++) {
    const t = i / SR, env = Math.min(1, t / 0.004) * (t > dur ? Math.exp(-(t - dur) * 60) : 1);
    const ph = 2 * Math.PI * f * t;
    bassBus[s + i] += (Math.sin(ph) + 0.45 * Math.sin(2 * ph) + 0.2 * Math.sin(3 * ph)) * env * 0.36;
  }
}
/** Bright piano: stretched partials, quick decay, for house stabs. */
function piano(t0, m, vel, pan = 0, len = 1.6) {
  const f = midi(m), s = Math.round(t0 * SR);
  const parts = [[1, 1], [2, 0.5], [3, 0.28], [4, 0.14], [5, 0.08], [6, 0.04]];
  for (let i = 0; i < len * SR && s + i < N; i++) {
    const t = i / SR; let v = 0;
    for (const [h, a] of parts) v += a * Math.sin(2 * Math.PI * f * h * (1 + 0.0004 * h * h) * t) * Math.exp(-t * (1.6 + h * 0.9));
    v *= Math.min(1, t / 0.003) * vel * 0.075;
    pnL[s + i] += v * (1 - pan); pnR[s + i] += v * (1 + pan);
  }
}
const chord = (t, notes, vel) => notes.forEach((m, k) => piano(t + k * 0.004, m, vel, (k / (notes.length - 1) - 0.5) * 0.5));
/** Whistle lead: sine plus a touch of the octave, soft attack, gentle vibrato. */
function lead(t0, m, dur, vel) {
  const f = midi(m), s = Math.round(t0 * SR);
  let ph = 0;
  for (let i = 0; i < (dur + 0.15) * SR && s + i < N; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.025) * (t > dur ? Math.exp(-(t - dur) * 25) : 1);
    const vib = 1 + 0.006 * Math.sin(2 * Math.PI * 5.5 * t) * Math.min(1, t / 0.25);
    ph += 2 * Math.PI * f * vib / SR;
    const v = (Math.sin(ph) + 0.18 * Math.sin(2 * ph)) * env * vel * 0.11;
    ldL[s + i] += v * 0.9; ldR[s + i] += v * 1.1;
  }
}
function riser(t0, dur) {
  const s = Math.round(t0 * SR);
  for (let i = 0; i < dur * SR && s + i < N; i++) { const p = i / (dur * SR); drums[s + i] += rnd() * p * p * 0.16; }
}

const CHORDS = [
  { root: 38, notes: [62, 66, 69, 74] }, // D
  { root: 33, notes: [61, 64, 69, 73] }, // A
  { root: 35, notes: [62, 66, 71, 74] }, // Bm
  { root: 31, notes: [62, 67, 71, 74] }, // G
];
// The hook, one bar per chord: [beat, midi, beats].
const HOOK = [
  [[0, 78, 1], [1, 81, 0.5], [1.5, 78, 0.5], [2, 76, 1], [3, 74, 1]],
  [[0, 76, 1], [1, 73, 0.5], [1.5, 76, 0.5], [2, 78, 1.75]],
  [[0, 74, 0.5], [0.5, 78, 0.5], [1, 81, 1], [2, 83, 1.75]],
  [[0, 81, 1], [1, 79, 0.5], [1.5, 78, 0.5], [2, 76, 1], [3, 78, 0.75]],
];
const bars = Math.ceil(DUR / BAR);
for (let b = 0; b < bars; b++) {
  const c = CHORDS[b % 4], t = b * BAR;
  const intro = b < 3, breath = b >= 12 && b < 15, last = b >= bars - 1, close = b >= bars - 5;
  if (last) { chord(t, [...c.notes, c.notes[0] + 12], 1); kick(t); clap(t, 0.7); bass(t, 38, BAR); break; }
  // House piano: on the "and" of every beat, plus the downbeat.
  chord(t, c.notes, 0.9);
  for (let q = 0; q < 4; q++) chord(t + q * BEAT + BEAT / 2, c.notes.map(m => m + (close ? 12 : 0)), q === 3 ? 0.55 : 0.7);
  if (intro) {
    for (let q = 1; q < 4; q += 2) snap(t + q * BEAT);
    if (b === 2) riser(t + BAR / 2, BAR / 2);
    continue;
  }
  if (breath) {
    for (let q = 1; q < 4; q += 2) snap(t + q * BEAT);
    for (let s16 = 0; s16 < 16; s16++) shaker(t + s16 * S16, s16 % 2 ? 0.03 : 0.05);
    if (b === 14) riser(t, BAR);
  } else {
    for (let q = 0; q < 4; q++) {
      const tb = t + q * BEAT;
      kick(tb);
      if (q % 2) clap(tb);
      openHat(tb + BEAT / 2, 0.06);
      bass(tb + BEAT / 2, c.root + (q === 3 ? 12 : 0), BEAT / 2 - 0.03);
    }
    for (let s16 = 0; s16 < 16; s16++) shaker(t + s16 * S16, s16 % 4 === 2 ? 0.06 : 0.032);
  }
  // The hook from the drop on, an octave up for the close.
  for (const [beat, m, len] of HOOK[b % 4]) lead(t + beat * BEAT, m + (close ? 12 : 0) - (breath ? 12 : 0), len * BEAT * 0.92, breath ? 0.7 : 1);
}

const duck = new Float32Array(N).fill(1);
for (const k of kicks) {
  const s = Math.round(k * SR);
  for (let i = 0; i < 0.3 * SR && s + i < N; i++) duck[s + i] = Math.min(duck[s + i], 1 - 0.5 * Math.exp(-(i / SR) / 0.08));
}
const claps = room(highpass(lowpass(clapBus, 5000), 800), 0.28);
const bassF = lowpass(bassBus, 700);
const pL = room(lowpass(pnL, 6500), 0.22), pR = room(lowpass(pnR, 6500), 0.22, 31);
const lL = room(lowpass(ldL, 7000), 0.35), lR = room(lowpass(ldR, 7000), 0.35, 31);
const dF = highpass(drums, 30);
const L = new Float32Array(N), R = new Float32Array(N);
let peak = 0;
for (let i = 0; i < N; i++) {
  const t = i / SR, fade = Math.min(1, t / 0.05) * Math.min(1, (DUR - t) / 2);
  const d = duck[i];
  L[i] = Math.tanh((dF[i] + claps[i] + (bassF[i] + pL[i]) * d + lL[i]) * 1.25) * fade;
  R[i] = Math.tanh((dF[i] + claps[i] + (bassF[i] + pR[i]) * d + lR[i]) * 1.25) * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const g = 0.6 / peak;
for (let i = 0; i < N; i++) { L[i] *= g; R[i] *= g; }
writeWav('editorial-music.wav', L, R);
console.log('editorial music', DUR, 's,', bars, 'bars at', BPM, 'bpm');
