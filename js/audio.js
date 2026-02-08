// ── Pixel Maze – Audio Engine (Web Audio API chiptune) ──

let ctx = null;
let enabled = true;
let unlocked = false;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return ctx;
}

/** Resume AudioContext on first user gesture (mobile policy). */
export function unlock() {
  if (unlocked) return;
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
  unlocked = true;
}

export function toggle() {
  enabled = !enabled;
  return enabled;
}

export function isEnabled() { return enabled; }

// ── helpers ──

function playTone(freq, duration, type = 'square', gain = 0.12, slide = 0) {
  if (!enabled) return;
  const c = getCtx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (slide) osc.frequency.linearRampToValueAtTime(freq + slide, c.currentTime + duration);
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(g).connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

function playNoise(duration, gain = 0.06) {
  if (!enabled) return;
  const c = getCtx();
  const bufSize = c.sampleRate * duration;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  src.connect(g).connect(c.destination);
  src.start();
}

// ── sound effects ──

export function chomp() {
  playTone(200, 0.07, 'square', 0.08, 300);
}

let chompAlt = false;
export function chompAlternate() {
  chompAlt = !chompAlt;
  playTone(chompAlt ? 220 : 260, 0.06, 'square', 0.07, chompAlt ? 180 : -100);
}

export function powerUp() {
  if (!enabled) return;
  const c = getCtx();
  const t = c.currentTime;
  [330, 440, 550, 660].forEach((f, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'square';
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.1, t + i * 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.12);
    osc.connect(g).connect(c.destination);
    osc.start(t + i * 0.06);
    osc.stop(t + i * 0.06 + 0.12);
  });
}

export function eatEnemy() {
  playTone(600, 0.15, 'square', 0.1, -400);
  playTone(400, 0.1, 'sawtooth', 0.06, 200);
}

export function death() {
  if (!enabled) return;
  const c = getCtx();
  const t = c.currentTime;
  for (let i = 0; i < 8; i++) {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'square';
    osc.frequency.value = 500 - i * 50;
    g.gain.setValueAtTime(0.1, t + i * 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.15);
    osc.connect(g).connect(c.destination);
    osc.start(t + i * 0.12);
    osc.stop(t + i * 0.12 + 0.15);
  }
}

export function levelComplete() {
  if (!enabled) return;
  const c = getCtx();
  const t = c.currentTime;
  const notes = [523, 587, 659, 784, 880, 1047];
  notes.forEach((f, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'square';
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.1, t + i * 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.2);
    osc.connect(g).connect(c.destination);
    osc.start(t + i * 0.1);
    osc.stop(t + i * 0.1 + 0.2);
  });
}

export function gameOver() {
  if (!enabled) return;
  const c = getCtx();
  const t = c.currentTime;
  const notes = [392, 330, 262, 196];
  notes.forEach((f, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.12, t + i * 0.25);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.25 + 0.35);
    osc.connect(g).connect(c.destination);
    osc.start(t + i * 0.25);
    osc.stop(t + i * 0.25 + 0.35);
  });
}

export function startJingle() {
  if (!enabled) return;
  const c = getCtx();
  const t = c.currentTime;
  const notes = [262, 330, 392, 523, 392, 523];
  notes.forEach((f, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'square';
    osc.frequency.value = f;
    g.gain.setValueAtTime(0.09, t + i * 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.18);
    osc.connect(g).connect(c.destination);
    osc.start(t + i * 0.12);
    osc.stop(t + i * 0.12 + 0.18);
  });
}

// Siren-like background hum during play
let sirenOsc = null;
let sirenGain = null;

export function startSiren() {
  if (!enabled) return;
  stopSiren();
  const c = getCtx();
  sirenOsc = c.createOscillator();
  sirenGain = c.createGain();
  sirenOsc.type = 'sine';
  sirenOsc.frequency.value = 80;
  sirenGain.gain.value = 0.04;
  // Wobble
  const lfo = c.createOscillator();
  const lfoGain = c.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 0.4;
  lfoGain.gain.value = 30;
  lfo.connect(lfoGain).connect(sirenOsc.frequency);
  lfo.start();
  sirenOsc.connect(sirenGain).connect(c.destination);
  sirenOsc.start();
  sirenOsc._lfo = lfo; // prevent GC
}

export function stopSiren() {
  if (sirenOsc) {
    try { sirenOsc._lfo.stop(); } catch(_) {}
    try { sirenOsc.stop(); } catch(_) {}
    sirenOsc = null;
  }
}

// Frightened mode sound
let frightOsc = null;

export function startFrightSound() {
  if (!enabled) return;
  stopFrightSound();
  const c = getCtx();
  frightOsc = c.createOscillator();
  const g = c.createGain();
  frightOsc.type = 'triangle';
  frightOsc.frequency.value = 120;
  g.gain.value = 0.04;
  const lfo = c.createOscillator();
  const lfoG = c.createGain();
  lfo.type = 'square';
  lfo.frequency.value = 8;
  lfoG.gain.value = 60;
  lfo.connect(lfoG).connect(frightOsc.frequency);
  lfo.start();
  frightOsc.connect(g).connect(c.destination);
  frightOsc.start();
  frightOsc._lfo = lfo;
}

export function stopFrightSound() {
  if (frightOsc) {
    try { frightOsc._lfo.stop(); } catch(_) {}
    try { frightOsc.stop(); } catch(_) {}
    frightOsc = null;
  }
}
