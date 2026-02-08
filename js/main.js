// ── Pixel Maze – Entry Point ──
import { Game } from './game.js';
import { initDpad, initSwipe } from './input.js';
import { unlock as unlockAudio } from './audio.js';

// ── Boot ──

const canvas = document.getElementById('game-canvas');
const game = new Game(canvas);

// Input setup
initDpad();
initSwipe(canvas);

// Unlock audio on first interaction
const unlockOnce = () => {
  unlockAudio();
  window.removeEventListener('touchstart', unlockOnce);
  window.removeEventListener('click', unlockOnce);
  window.removeEventListener('keydown', unlockOnce);
};
window.addEventListener('touchstart', unlockOnce, { passive: true });
window.addEventListener('click', unlockOnce);
window.addEventListener('keydown', unlockOnce);

// Sizing
function handleResize() {
  game.renderer.resize();
}
window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', () => setTimeout(handleResize, 200));
handleResize();

// ── Game Loop ──

let lastTime = 0;

function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50ms
  lastTime = timestamp;

  game.update(dt);
  game.draw();

  requestAnimationFrame(loop);
}

requestAnimationFrame((ts) => {
  lastTime = ts;
  requestAnimationFrame(loop);
});
