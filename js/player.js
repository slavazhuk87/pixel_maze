// ── Pixel Maze – Player Entity ──
import { TILE_SIZE, DIR, DIR_DELTA, OPPOSITE, MAZE_COLS, MAZE_ROWS } from './constants.js';

export class Player {
  constructor() {
    this.reset(9, 15);
  }

  reset(col, row) {
    this.row = row;
    this.col = col;
    this.pixelX = col * TILE_SIZE + TILE_SIZE / 2;
    this.pixelY = row * TILE_SIZE + TILE_SIZE / 2;
    this.dir = DIR.NONE;
    this.nextDir = DIR.NONE;
    this.speed = 0;       // px/sec – set by game
    this.mouthAngle = 0;
    this.animTimer = 0;
    this.moving = false;
  }

  /** Set desired direction from input. */
  setDirection(d) {
    if (d !== DIR.NONE) this.nextDir = d;
  }

  _canMove(dir, fromRow, fromCol, maze) {
    const [dr, dc] = DIR_DELTA[dir];
    let nr = fromRow + dr, nc = fromCol + dc;
    if (nc < 0) nc = MAZE_COLS - 1;
    if (nc >= MAZE_COLS) nc = 0;
    if (nr < 0 || nr >= MAZE_ROWS) return false;
    return maze.isWalkable(nr, nc, false);
  }

  /** Update position. Returns { ate: 'pellet'|'power'|null, newTile: bool } */
  update(dt, maze) {
    const result = { ate: null, newTile: false };

    // Animate mouth
    this.animTimer += dt * (this.moving ? 10 : 4);
    this.mouthAngle = (Math.sin(this.animTimer) + 1) / 2;

    // -- Try to start or reverse --
    if (this.dir === DIR.NONE) {
      if (this.nextDir !== DIR.NONE && this._canMove(this.nextDir, this.row, this.col, maze)) {
        this.dir = this.nextDir;
      } else {
        this.moving = false;
        return result;
      }
    }

    // Allow immediate reversal
    if (this.nextDir !== DIR.NONE && this.nextDir === OPPOSITE[this.dir]) {
      this.dir = this.nextDir;
    }

    this.moving = true;
    const [dr, dc] = DIR_DELTA[this.dir];
    let moveLeft = this.speed * dt;

    // Move toward next tile center, processing tile crossings
    while (moveLeft > 0.001) {
      // Next tile in current direction
      let tgtRow = this.row + dr;
      let tgtCol = this.col + dc;
      if (tgtCol < 0) tgtCol = MAZE_COLS - 1;
      if (tgtCol >= MAZE_COLS) tgtCol = 0;

      const curCX = this.col * TILE_SIZE + TILE_SIZE / 2;
      const curCY = this.row * TILE_SIZE + TILE_SIZE / 2;

      // Effective target position (handle tunnel wrapping in pixel space)
      let tgtPX = tgtCol * TILE_SIZE + TILE_SIZE / 2;
      let tgtPY = tgtRow * TILE_SIZE + TILE_SIZE / 2;
      if (dc === -1 && tgtCol === MAZE_COLS - 1 && this.col === 0) tgtPX = -TILE_SIZE / 2;
      if (dc === 1 && tgtCol === 0 && this.col === MAZE_COLS - 1) tgtPX = MAZE_COLS * TILE_SIZE + TILE_SIZE / 2;

      // Distance from current pixel position to target tile center
      const dist = Math.abs(tgtPX - this.pixelX) + Math.abs(tgtPY - this.pixelY);

      // Check if target is walkable
      if (tgtRow < 0 || tgtRow >= MAZE_ROWS || !maze.isWalkable(tgtRow, tgtCol, false)) {
        // Blocked – snap to current tile center and stop
        this.pixelX = curCX;
        this.pixelY = curCY;
        this.dir = DIR.NONE;
        this.moving = false;
        break;
      }

      if (moveLeft >= dist) {
        // Reach the target tile center
        moveLeft -= dist;
        this.col = tgtCol;
        this.row = tgtRow;
        this.pixelX = tgtCol * TILE_SIZE + TILE_SIZE / 2;
        this.pixelY = tgtRow * TILE_SIZE + TILE_SIZE / 2;
        result.newTile = true;
        result.ate = maze.eatPellet(this.row, this.col);

        // At tile center: try turning
        if (this.nextDir !== DIR.NONE && this.nextDir !== this.dir) {
          if (this._canMove(this.nextDir, this.row, this.col, maze)) {
            this.dir = this.nextDir;
            // Recalculate dr/dc for continued movement in new direction
            break; // process remaining moveLeft next frame (negligible)
          }
        }

        // Check if continuing in current dir is blocked
        if (!this._canMove(this.dir, this.row, this.col, maze)) {
          this.dir = DIR.NONE;
          this.moving = false;
          break;
        }
        // else continue loop with remaining moveLeft
      } else {
        // Normal sub-tile movement
        this.pixelX += dc * moveLeft;
        this.pixelY += dr * moveLeft;
        moveLeft = 0;
      }
    }

    // Tunnel wrapping for pixel position
    const totalW = MAZE_COLS * TILE_SIZE;
    if (this.pixelX < -TILE_SIZE / 2) this.pixelX += totalW;
    else if (this.pixelX > totalW + TILE_SIZE / 2) this.pixelX -= totalW;

    return result;
  }

  /** Grid distance to a target tile. */
  distTo(row, col) {
    return Math.abs(this.row - row) + Math.abs(this.col - col);
  }
}
