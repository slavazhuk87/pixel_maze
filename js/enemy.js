// ── Pixel Maze – Enemy Entity & AI ──
import {
  TILE_SIZE, DIR, DIR_DELTA, OPPOSITE, MAZE_COLS, MAZE_ROWS,
  ENEMY_TYPE,
} from './constants.js';

/** Enemy mode */
export const EMODE = {
  IN_HOUSE:   0,
  EXITING:    1,
  SCATTER:    2,
  CHASE:      3,
  FRIGHTENED: 4,
  RETURNING:  5,
};

export class Enemy {
  constructor(type, startCol, startRow) {
    this.type = type;           // ENEMY_TYPE.*
    this.startCol = startCol;
    this.startRow = startRow;
    this.reset();
  }

  reset() {
    this.col = this.startCol;
    this.row = this.startRow;
    this.pixelX = this.col * TILE_SIZE + TILE_SIZE / 2;
    this.pixelY = this.row * TILE_SIZE + TILE_SIZE / 2;
    this.dir = DIR.UP;
    this.mode = EMODE.IN_HOUSE;
    this.speed = 0;           // set by game
    this.normalSpeed = 0;
    this.frightSpeed = 0;
    this.tunnelSpeed = 0;
    this.returnSpeed = 0;
    this.frightTimer = 0;
    this.frightFlashing = false;
    this.exitTimer = 0;
    this.scatterTarget = { row: 0, col: 0 };
    this.animTimer = 0;
    this.justReversed = false;
  }

  /** Force a direction reversal (called on mode switch). */
  reverse() {
    if (this.dir !== DIR.NONE) {
      this.dir = OPPOSITE[this.dir];
      this.justReversed = true;
    }
  }

  /** Set to frightened mode. */
  frighten(duration) {
    if (this.mode === EMODE.RETURNING) return; // don't interrupt returning
    if (this.mode === EMODE.IN_HOUSE || this.mode === EMODE.EXITING) {
      this.frightTimer = duration; // will apply once exited
      return;
    }
    this.mode = EMODE.FRIGHTENED;
    this.frightTimer = duration;
    this.frightFlashing = false;
    this.reverse();
  }

  /** Begin returning to ghost house after being eaten. */
  startReturning() {
    this.mode = EMODE.RETURNING;
    this.frightTimer = 0;
  }

  /** Get the AI target tile based on mode and enemy type. */
  getTarget(player, enemies) {
    if (this.mode === EMODE.SCATTER) {
      return this.scatterTarget;
    }

    if (this.mode === EMODE.FRIGHTENED) {
      // Random target – handled differently in chooseDirection
      return null;
    }

    if (this.mode === EMODE.RETURNING) {
      // Head to ghost house door
      return { row: 8, col: 9 };
    }

    // Chase mode – behaviour depends on type
    switch (this.type) {
      case ENEMY_TYPE.CHASE:
        // Target player directly
        return { row: player.row, col: player.col };

      case ENEMY_TYPE.AMBUSH: {
        // Target 4 tiles ahead of player
        const [dr, dc] = player.dir !== DIR.NONE ? DIR_DELTA[player.dir] : [0, 0];
        return { row: player.row + dr * 4, col: player.col + dc * 4 };
      }

      case ENEMY_TYPE.WHIMSY: {
        // Vector doubling from red's position through 2 tiles ahead of player
        const red = enemies[ENEMY_TYPE.CHASE];
        const [dr, dc] = player.dir !== DIR.NONE ? DIR_DELTA[player.dir] : [0, 0];
        const aheadR = player.row + dr * 2;
        const aheadC = player.col + dc * 2;
        return {
          row: aheadR + (aheadR - red.row),
          col: aheadC + (aheadC - red.col),
        };
      }

      case ENEMY_TYPE.SHY: {
        // Chase when far (>8 tiles), scatter when close
        const dist = Math.abs(this.row - player.row) + Math.abs(this.col - player.col);
        if (dist > 8) {
          return { row: player.row, col: player.col };
        }
        return this.scatterTarget;
      }

      default:
        return { row: player.row, col: player.col };
    }
  }

  /** Choose the best direction at an intersection. */
  chooseDirection(maze, player, enemies) {
    const excludeDir = this.justReversed ? DIR.NONE : OPPOSITE[this.dir];
    this.justReversed = false;

    const available = maze.getAvailableDirs(this.row, this.col, true, excludeDir);
    if (available.length === 0) {
      // Fallback: allow reversing
      const all = maze.getAvailableDirs(this.row, this.col, true, DIR.NONE);
      return all.length > 0 ? all[0] : this.dir;
    }
    if (available.length === 1) return available[0];

    // Frightened: random choice
    if (this.mode === EMODE.FRIGHTENED) {
      return available[Math.floor(Math.random() * available.length)];
    }

    // Otherwise pick direction that minimises distance to target
    const target = this.getTarget(player, enemies);
    if (!target) return available[Math.floor(Math.random() * available.length)];

    let bestDir = available[0];
    let bestDist = Infinity;

    for (const d of available) {
      const [dr, dc] = DIR_DELTA[d];
      let nr = this.row + dr;
      let nc = this.col + dc;
      if (nc < 0) nc = MAZE_COLS - 1;
      if (nc >= MAZE_COLS) nc = 0;
      const dist = (nr - target.row) ** 2 + (nc - target.col) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        bestDir = d;
      }
    }
    return bestDir;
  }

  /** Main update. */
  update(dt, maze, player, enemies) {
    this.animTimer += dt * 5;

    // Determine speed
    if (this.mode === EMODE.RETURNING) {
      this.speed = this.returnSpeed;
    } else if (this.mode === EMODE.FRIGHTENED) {
      this.speed = this.frightSpeed;
    } else if (maze.isTunnel(this.row, this.col)) {
      this.speed = this.tunnelSpeed;
    } else {
      this.speed = this.normalSpeed;
    }

    // Handle IN_HOUSE
    if (this.mode === EMODE.IN_HOUSE) {
      this.exitTimer -= dt;
      if (this.exitTimer <= 0) {
        this.mode = EMODE.EXITING;
      } else {
        // Bob up and down inside house
        const centerY = this.startRow * TILE_SIZE + TILE_SIZE / 2;
        this.pixelY = centerY + Math.sin(this.animTimer * 2) * 3;
        return;
      }
    }

    // Handle EXITING (move to ghost house door, then above it)
    if (this.mode === EMODE.EXITING) {
      const doorX = 9 * TILE_SIZE + TILE_SIZE / 2;
      const doorY = 8 * TILE_SIZE + TILE_SIZE / 2;
      const aboveDoorY = 7 * TILE_SIZE + TILE_SIZE / 2;

      const exitSpeed = this.normalSpeed * 0.7;

      // First move horizontally to door column
      if (Math.abs(this.pixelX - doorX) > 1) {
        this.pixelX += (doorX > this.pixelX ? 1 : -1) * exitSpeed * dt;
        return;
      }
      this.pixelX = doorX;

      // Then move up through door
      if (this.pixelY > aboveDoorY + 1) {
        this.pixelY -= exitSpeed * dt;
        return;
      }

      // Exited – set position and enter scatter/chase
      this.pixelY = aboveDoorY;
      this.row = 7;
      this.col = 9;
      this.dir = DIR.LEFT;
      if (this.frightTimer > 0) {
        this.mode = EMODE.FRIGHTENED;
      } else {
        this.mode = EMODE.SCATTER;
      }
      return;
    }

    // Handle RETURNING (entering ghost house)
    if (this.mode === EMODE.RETURNING) {
      const doorX = 9 * TILE_SIZE + TILE_SIZE / 2;
      const doorY = 8 * TILE_SIZE + TILE_SIZE / 2;
      const insideY = 9 * TILE_SIZE + TILE_SIZE / 2;

      // Check if at the door
      if (Math.abs(this.pixelX - doorX) < 2 && Math.abs(this.pixelY - doorY) < 2) {
        // Go down into house
        if (this.pixelY < insideY - 1) {
          this.pixelY += this.returnSpeed * dt;
          return;
        }
        // Reached inside – re-enter as active enemy
        this.pixelY = insideY;
        this.row = 9;
        this.col = 9;
        this.mode = EMODE.EXITING;
        this.exitTimer = 0;
        return;
      }
    }

    // Frightened timer
    if (this.mode === EMODE.FRIGHTENED) {
      this.frightTimer -= dt;
      this.frightFlashing = this.frightTimer < 2.0;
      if (this.frightTimer <= 0) {
        this.mode = EMODE.SCATTER; // game will set correct mode
        this.frightTimer = 0;
      }
    }

    // Movement – tile-to-tile with direction choice at each tile center
    if (this.dir === DIR.NONE) {
      this.dir = this.chooseDirection(maze, player, enemies);
    }
    if (this.dir === DIR.NONE) return;

    const [dr, dc] = DIR_DELTA[this.dir];
    let moveLeft = this.speed * dt;

    while (moveLeft > 0.001) {
      let tgtRow = this.row + dr;
      let tgtCol = this.col + dc;
      if (tgtCol < 0) tgtCol = MAZE_COLS - 1;
      if (tgtCol >= MAZE_COLS) tgtCol = 0;

      let tgtPX = tgtCol * TILE_SIZE + TILE_SIZE / 2;
      let tgtPY = tgtRow * TILE_SIZE + TILE_SIZE / 2;
      if (dc === -1 && tgtCol === MAZE_COLS - 1 && this.col === 0) tgtPX = -TILE_SIZE / 2;
      if (dc === 1 && tgtCol === 0 && this.col === MAZE_COLS - 1) tgtPX = MAZE_COLS * TILE_SIZE + TILE_SIZE / 2;

      const dist = Math.abs(tgtPX - this.pixelX) + Math.abs(tgtPY - this.pixelY);

      if (tgtRow < 0 || tgtRow >= MAZE_ROWS || !maze.isWalkable(tgtRow, tgtCol, true)) {
        this.pixelX = this.col * TILE_SIZE + TILE_SIZE / 2;
        this.pixelY = this.row * TILE_SIZE + TILE_SIZE / 2;
        this.dir = this.chooseDirection(maze, player, enemies);
        break;
      }

      if (moveLeft >= dist) {
        moveLeft -= dist;
        this.col = tgtCol;
        this.row = tgtRow;
        this.pixelX = tgtCol * TILE_SIZE + TILE_SIZE / 2;
        this.pixelY = tgtRow * TILE_SIZE + TILE_SIZE / 2;

        // Choose new direction at tile center
        this.dir = this.chooseDirection(maze, player, enemies);
        if (this.dir === DIR.NONE) break;
        break; // process remaining movement next frame
      } else {
        this.pixelX += dc * moveLeft;
        this.pixelY += dr * moveLeft;
        moveLeft = 0;
      }
    }

    // Tunnel wrapping
    const totalW = MAZE_COLS * TILE_SIZE;
    if (this.pixelX < -TILE_SIZE / 2) this.pixelX += totalW;
    else if (this.pixelX > totalW + TILE_SIZE / 2) this.pixelX -= totalW;
  }

  /** Check collision with player (pixel-distance based). */
  collidesWith(player) {
    if (this.mode === EMODE.IN_HOUSE || this.mode === EMODE.EXITING) return false;
    const dx = this.pixelX - player.pixelX;
    const dy = this.pixelY - player.pixelY;
    return (dx * dx + dy * dy) < (TILE_SIZE * 0.8) ** 2;
  }
}
