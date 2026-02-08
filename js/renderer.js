// ── Pixel Maze – Canvas Renderer ──
import {
  TILE_SIZE, MAZE_COLS, MAZE_ROWS, CANVAS_W, CANVAS_H,
  T, DIR, C, STATE,
} from './constants.js';
import { EMODE } from './enemy.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    this.ctx.imageSmoothingEnabled = false;
    this.wallCache = null;  // off-screen canvas for static walls
    this.powerPulse = 0;
  }

  /** Resize CSS to fit viewport while keeping aspect ratio. */
  resize() {
    const wrapper = document.getElementById('game-wrapper');
    const hud = document.getElementById('hud');
    const livesBar = document.getElementById('lives-bar');
    const controls = document.getElementById('controls');

    const hudH = hud ? hud.offsetHeight : 0;
    const livesH = livesBar ? livesBar.offsetHeight : 0;
    const ctrlH = controls ? controls.offsetHeight : 0;
    const gaps = 20;
    const availH = wrapper.clientHeight - hudH - livesH - ctrlH - gaps;
    const availW = wrapper.clientWidth - 8;

    const aspect = CANVAS_W / CANVAS_H;
    let w = availW;
    let h = w / aspect;
    if (h > availH) {
      h = availH;
      w = h * aspect;
    }
    this.canvas.style.width  = Math.floor(w) + 'px';
    this.canvas.style.height = Math.floor(h) + 'px';
  }

  /** Pre-render static wall tiles to an offscreen canvas. */
  cacheWalls(maze) {
    const off = document.createElement('canvas');
    off.width = CANVAS_W;
    off.height = CANVAS_H;
    const c = off.getContext('2d');
    c.imageSmoothingEnabled = false;

    for (let r = 0; r < MAZE_ROWS; r++) {
      for (let cl = 0; cl < MAZE_COLS; cl++) {
        const t = maze.grid[r][cl];
        if (t === T.WALL) {
          this._drawWallTile(c, r, cl, maze);
        } else if (t === T.GHOST_DOOR) {
          c.fillStyle = C.GHOST_DOOR;
          c.fillRect(cl * TILE_SIZE + 1, r * TILE_SIZE + TILE_SIZE / 2 - 1, TILE_SIZE - 2, 3);
        }
      }
    }
    this.wallCache = off;
  }

  _drawWallTile(c, row, col, maze) {
    const x = col * TILE_SIZE;
    const y = row * TILE_SIZE;
    const s = TILE_SIZE;

    // Filled wall block
    c.fillStyle = C.WALL;
    c.fillRect(x, y, s, s);

    // Draw edges where wall meets non-wall
    c.fillStyle = C.WALL_EDGE;
    const isWall = (r, cl) => {
      if (r < 0 || r >= MAZE_ROWS || cl < 0 || cl >= MAZE_COLS) return true;
      return maze.grid[r][cl] === T.WALL;
    };

    // Top edge
    if (!isWall(row - 1, col)) c.fillRect(x, y, s, 2);
    // Bottom edge
    if (!isWall(row + 1, col)) c.fillRect(x, y + s - 2, s, 2);
    // Left edge
    if (!isWall(row, col - 1)) c.fillRect(x, y, 2, s);
    // Right edge
    if (!isWall(row, col + 1)) c.fillRect(x + s - 2, y, 2, s);

    // Inner corners highlight
    if (!isWall(row - 1, col) && !isWall(row, col - 1)) {
      c.fillRect(x, y, 3, 3);
    }
    if (!isWall(row - 1, col) && !isWall(row, col + 1)) {
      c.fillRect(x + s - 3, y, 3, 3);
    }
    if (!isWall(row + 1, col) && !isWall(row, col - 1)) {
      c.fillRect(x, y + s - 3, 3, 3);
    }
    if (!isWall(row + 1, col) && !isWall(row, col + 1)) {
      c.fillRect(x + s - 3, y + s - 3, 3, 3);
    }
  }

  // ── Drawing primitives ──

  _drawPellet(x, y) {
    const cx = x * TILE_SIZE + TILE_SIZE / 2;
    const cy = y * TILE_SIZE + TILE_SIZE / 2;
    this.ctx.fillStyle = C.PELLET;
    this.ctx.fillRect(cx - 1, cy - 1, 3, 3);
  }

  _drawPowerPellet(x, y) {
    const cx = x * TILE_SIZE + TILE_SIZE / 2;
    const cy = y * TILE_SIZE + TILE_SIZE / 2;
    const pulse = (Math.sin(this.powerPulse) + 1) / 2;
    const r = 3 + pulse * 2;
    this.ctx.fillStyle = C.POWER;
    this.ctx.globalAlpha = 0.6 + pulse * 0.4;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }

  _drawPlayer(player) {
    const { pixelX, pixelY, dir, mouthAngle, moving } = player;
    const r = TILE_SIZE / 2 - 1;

    // Rotation based on direction
    let angle = 0;
    if (dir === DIR.RIGHT) angle = 0;
    else if (dir === DIR.DOWN) angle = Math.PI / 2;
    else if (dir === DIR.LEFT) angle = Math.PI;
    else if (dir === DIR.UP) angle = -Math.PI / 2;

    const mouthSize = moving ? mouthAngle * 0.8 : 0.15;

    this.ctx.save();
    this.ctx.translate(pixelX, pixelY);
    this.ctx.rotate(angle);

    // Body
    this.ctx.fillStyle = C.PLAYER_BODY;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r, mouthSize * Math.PI, -mouthSize * Math.PI, false);
    this.ctx.lineTo(0, 0);
    this.ctx.closePath();
    this.ctx.fill();

    // Eye (small dot)
    this.ctx.fillStyle = C.BG;
    this.ctx.fillRect(-1, -r + 3, 2, 2);

    this.ctx.restore();
  }

  _drawEnemy(enemy, gameTime) {
    const { pixelX, pixelY, dir, mode, frightFlashing, animTimer, type } = enemy;
    const r = TILE_SIZE / 2 - 1;

    // Body colour
    let bodyColor;
    if (mode === EMODE.FRIGHTENED) {
      if (frightFlashing && Math.floor(gameTime * 8) % 2 === 0) {
        bodyColor = C.FRIGHT_FLASH;
      } else {
        bodyColor = C.FRIGHTENED;
      }
    } else if (mode === EMODE.RETURNING) {
      // Just eyes, no body
      this._drawEnemyEyes(pixelX, pixelY, dir);
      return;
    } else {
      bodyColor = C.ENEMY[type];
    }

    const x = pixelX;
    const y = pixelY;

    // Body: rounded top, wavy bottom
    this.ctx.fillStyle = bodyColor;
    this.ctx.beginPath();
    this.ctx.arc(x, y - 1, r, Math.PI, 0, false);
    // Wavy bottom
    const wave = Math.sin(animTimer * 3) > 0 ? 1 : -1;
    const bottom = y + r - 1;
    this.ctx.lineTo(x + r, bottom);
    for (let i = 2; i >= -2; i--) {
      const wx = x + i * (r / 2.5);
      const wy = bottom + wave * (i % 2 === 0 ? -2 : 2);
      this.ctx.lineTo(wx, wy);
    }
    this.ctx.lineTo(x - r, bottom);
    this.ctx.closePath();
    this.ctx.fill();

    // Eyes
    if (mode !== EMODE.FRIGHTENED) {
      this._drawEnemyEyes(x, y, dir);
    } else {
      // Frightened face: simple dots
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(x - 3, y - 2, 2, 2);
      this.ctx.fillRect(x + 2, y - 2, 2, 2);
      // Wavy mouth
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(x - 3, y + 3);
      for (let i = 0; i < 4; i++) {
        this.ctx.lineTo(x - 3 + i * 2 + 1, y + 3 + (i % 2 === 0 ? -1 : 1));
      }
      this.ctx.stroke();
    }
  }

  _drawEnemyEyes(x, y, dir) {
    // Eye whites
    this.ctx.fillStyle = C.ENEMY_EYES;
    this.ctx.fillRect(x - 4, y - 3, 3, 4);
    this.ctx.fillRect(x + 1, y - 3, 3, 4);

    // Pupils - offset by direction
    let px = 0, py = 0;
    if (dir === DIR.LEFT)  px = -1;
    if (dir === DIR.RIGHT) px = 1;
    if (dir === DIR.UP)    py = -1;
    if (dir === DIR.DOWN)  py = 1;

    this.ctx.fillStyle = C.ENEMY_PUPIL;
    this.ctx.fillRect(x - 3 + px, y - 2 + py, 2, 2);
    this.ctx.fillRect(x + 2 + px, y - 2 + py, 2, 2);
  }

  // ── Main render ──

  render(game) {
    const ctx = this.ctx;
    this.powerPulse += 0.15;

    // Clear
    ctx.fillStyle = C.BG;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const state = game.state;

    if (state === STATE.TITLE) {
      this._drawTitleScreen(game);
      return;
    }

    // Draw walls (cached)
    if (this.wallCache) {
      ctx.drawImage(this.wallCache, 0, 0);
    }

    // Draw pellets
    const maze = game.maze;
    for (let r = 0; r < MAZE_ROWS; r++) {
      for (let c = 0; c < MAZE_COLS; c++) {
        const t = maze.grid[r][c];
        if (t === T.PATH)  this._drawPellet(c, r);
        if (t === T.POWER) this._drawPowerPellet(c, r);
      }
    }

    // Draw enemies
    for (const e of game.enemies) {
      this._drawEnemy(e, game.gameTime);
    }

    // Draw player (not during certain states)
    if (state !== STATE.GAME_OVER && state !== STATE.WIN) {
      if (state === STATE.DYING) {
        this._drawDeathAnimation(game.player, game.stateTimer);
      } else {
        this._drawPlayer(game.player);
      }
    }

    // Score popups
    for (const p of game.scorePopups) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y - p.age * 15);
    }

    // Overlays
    if (state === STATE.READY) {
      this._drawCenteredText('READY!', C.READY_TEXT, 12);
    } else if (state === STATE.PAUSED) {
      this._drawOverlay('PAUSED', '#aaaaff', 'Tap to resume');
    } else if (state === STATE.LEVEL_COMPLETE) {
      this._drawFlashingMaze(game);
    } else if (state === STATE.GAME_OVER) {
      this._drawOverlay('GAME OVER', '#ff4444', `Score: ${game.score}`);
    } else if (state === STATE.WIN) {
      this._drawOverlay('YOU WIN!', '#44ff44', `Final Score: ${game.score}`);
    }
  }

  _drawDeathAnimation(player, timer) {
    const progress = Math.min(timer / 1.5, 1);
    const { pixelX, pixelY } = player;
    const r = (TILE_SIZE / 2 - 1) * (1 - progress);

    if (r <= 0) return;

    this.ctx.fillStyle = C.PLAYER_BODY;
    this.ctx.beginPath();
    const startAngle = -Math.PI / 2 + progress * Math.PI;
    const endAngle = -Math.PI / 2 - progress * Math.PI;
    this.ctx.arc(pixelX, pixelY, r, startAngle, endAngle, false);
    this.ctx.lineTo(pixelX, pixelY);
    this.ctx.closePath();
    this.ctx.fill();
  }

  _drawFlashingMaze(game) {
    if (Math.floor(game.stateTimer * 4) % 2 === 0) {
      // Flash walls white
      const ctx = this.ctx;
      for (let r = 0; r < MAZE_ROWS; r++) {
        for (let c = 0; c < MAZE_COLS; c++) {
          if (game.maze.grid[r][c] === T.WALL) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }
  }

  _drawCenteredText(text, color, size = 10) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.font = `bold ${size}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2);
  }

  _drawOverlay(title, titleColor, subtitle = '') {
    const ctx = this.ctx;
    // Semi-transparent backdrop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, CANVAS_H / 2 - 30, CANVAS_W, 60);

    ctx.fillStyle = titleColor;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, CANVAS_W / 2, CANVAS_H / 2 - 8);

    if (subtitle) {
      ctx.fillStyle = '#cccccc';
      ctx.font = '9px monospace';
      ctx.fillText(subtitle, CANVAS_W / 2, CANVAS_H / 2 + 12);
    }
  }

  _drawTitleScreen(game) {
    const ctx = this.ctx;
    const t = game.gameTime;

    // Background pattern
    ctx.fillStyle = C.BG;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Decorative maze border
    ctx.strokeStyle = C.WALL_EDGE;
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, CANVAS_W - 20, CANVAS_H - 20);
    ctx.strokeRect(16, 16, CANVAS_W - 32, CANVAS_H - 32);

    // Title
    ctx.fillStyle = C.PLAYER_BODY;
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PIXEL MAZE', CANVAS_W / 2, 80);

    // Animated player character
    const demoX = CANVAS_W / 2 - 40 + Math.sin(t * 2) * 30;
    const demoY = 140;
    ctx.fillStyle = C.PLAYER_BODY;
    ctx.beginPath();
    const mouth = (Math.sin(t * 8) + 1) / 2 * 0.8;
    ctx.arc(demoX, demoY, 10, mouth * Math.PI, -mouth * Math.PI, false);
    ctx.lineTo(demoX, demoY);
    ctx.closePath();
    ctx.fill();

    // Demo enemies chasing
    C.ENEMY.forEach((color, i) => {
      const ex = demoX + 26 + i * 18;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(ex, demoY - 1, 7, Math.PI, 0);
      ctx.lineTo(ex + 7, demoY + 6);
      ctx.lineTo(ex - 7, demoY + 6);
      ctx.closePath();
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#fff';
      ctx.fillRect(ex - 3, demoY - 3, 2, 3);
      ctx.fillRect(ex + 1, demoY - 3, 2, 3);
      ctx.fillStyle = '#222';
      ctx.fillRect(ex - 3, demoY - 2, 1, 1);
      ctx.fillRect(ex + 1, demoY - 2, 1, 1);
    });

    // Instructions
    ctx.fillStyle = '#aaaaff';
    ctx.font = '9px monospace';
    ctx.fillText('Collect all bits to clear the maze', CANVAS_W / 2, 190);
    ctx.fillText('Grab power cores to eat glitches', CANVAS_W / 2, 205);

    // Controls hint
    ctx.fillStyle = '#888888';
    ctx.font = '8px monospace';
    ctx.fillText('D-Pad / Swipe / Arrow Keys', CANVAS_W / 2, 240);

    // Tap to start (blinking)
    if (Math.floor(t * 2.5) % 2 === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('TAP TO START', CANVAS_W / 2, 285);
    }

    // High score
    if (game.highScore > 0) {
      ctx.fillStyle = '#88ffff';
      ctx.font = '9px monospace';
      ctx.fillText(`HIGH SCORE: ${game.highScore}`, CANVAS_W / 2, 315);
    }
  }
}
