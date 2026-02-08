// ── Pixel Maze – Input System (keyboard + touch D-pad + swipe) ──
import { DIR } from './constants.js';

let currentDir = DIR.NONE;
let bufferedDir = DIR.NONE;
let pausePressed = false;
let soundPressed = false;
let startPressed = false;

// ── Public API ──

export function getDirection()   { return currentDir; }
export function getBuffered()    { return bufferedDir; }
export function clearBuffered()  { bufferedDir = DIR.NONE; }

export function consumePause() {
  if (pausePressed) { pausePressed = false; return true; }
  return false;
}
export function consumeSound() {
  if (soundPressed) { soundPressed = false; return true; }
  return false;
}
export function consumeStart() {
  if (startPressed) { startPressed = false; return true; }
  return false;
}

function setDir(d) {
  bufferedDir = d;
  currentDir = d;
}

// ── Keyboard ──

const KEY_MAP = {
  ArrowUp:    DIR.UP,
  ArrowRight: DIR.RIGHT,
  ArrowDown:  DIR.DOWN,
  ArrowLeft:  DIR.LEFT,
  w: DIR.UP,   d: DIR.RIGHT,  s: DIR.DOWN,  a: DIR.LEFT,
  W: DIR.UP,   D: DIR.RIGHT,  S: DIR.DOWN,  A: DIR.LEFT,
};

window.addEventListener('keydown', (e) => {
  if (e.key in KEY_MAP) {
    e.preventDefault();
    setDir(KEY_MAP[e.key]);
    startPressed = true;
  }
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') pausePressed = true;
  if (e.key === 'm' || e.key === 'M') soundPressed = true;
  if (e.key === 'Enter' || e.key === ' ') startPressed = true;
});

// ── D-pad buttons ──

function attachBtn(id, dir) {
  const el = document.getElementById(id);
  if (!el) return;

  const activate = (e) => {
    e.preventDefault();
    el.classList.add('active');
    setDir(dir);
    startPressed = true;
  };
  const deactivate = (e) => {
    e.preventDefault();
    el.classList.remove('active');
  };

  el.addEventListener('touchstart', activate, { passive: false });
  el.addEventListener('touchend', deactivate, { passive: false });
  el.addEventListener('touchcancel', deactivate, { passive: false });
  el.addEventListener('mousedown', activate);
  el.addEventListener('mouseup', deactivate);
  el.addEventListener('mouseleave', deactivate);
}

export function initDpad() {
  attachBtn('btn-up',    DIR.UP);
  attachBtn('btn-right', DIR.RIGHT);
  attachBtn('btn-down',  DIR.DOWN);
  attachBtn('btn-left',  DIR.LEFT);

  const pauseBtn = document.getElementById('btn-pause');
  if (pauseBtn) {
    pauseBtn.addEventListener('touchstart', (e) => { e.preventDefault(); pausePressed = true; }, { passive: false });
    pauseBtn.addEventListener('click', () => { pausePressed = true; });
  }

  const soundBtn = document.getElementById('btn-sound');
  if (soundBtn) {
    soundBtn.addEventListener('touchstart', (e) => { e.preventDefault(); soundPressed = true; }, { passive: false });
    soundBtn.addEventListener('click', () => { soundPressed = true; });
  }
}

// ── Swipe detection on canvas ──

let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 20;

export function initSwipe(canvas) {
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startPressed = true;
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (e.changedTouches.length === 0) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) return;

    if (absDx > absDy) {
      setDir(dx > 0 ? DIR.RIGHT : DIR.LEFT);
    } else {
      setDir(dy > 0 ? DIR.DOWN : DIR.UP);
    }
  }, { passive: false });

  // Also allow click/tap on canvas for start
  canvas.addEventListener('click', () => { startPressed = true; });
}
