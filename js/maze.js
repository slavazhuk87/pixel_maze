// ── Pixel Maze – Maze State ──
import { T, MAZE_COLS, MAZE_ROWS, DIR, DIR_DELTA } from './constants.js';

export class Maze {
  constructor() {
    this.grid = [];       // working copy – mutated as pellets are eaten
    this.pelletsLeft = 0;
    this.totalPellets = 0;
  }

  /** Load a level grid (deep copy) and place pellets. */
  load(srcGrid) {
    this.pelletsLeft = 0;
    this.grid = srcGrid.map(row => {
      return row.map(cell => {
        if (cell === T.PATH)  { this.pelletsLeft++; return T.PATH; }
        if (cell === T.POWER) { this.pelletsLeft++; return T.POWER; }
        return cell;
      });
    });
    this.totalPellets = this.pelletsLeft;
  }

  /** Get tile type at (row, col), with tunnel wrapping. */
  tileAt(row, col) {
    // Wrap horizontally for tunnel
    if (col < 0) col = MAZE_COLS - 1;
    if (col >= MAZE_COLS) col = 0;
    if (row < 0 || row >= MAZE_ROWS) return T.WALL;
    return this.grid[row][col];
  }

  /** Can an entity walk onto this tile? */
  isWalkable(row, col, isEnemy = false, isReturning = false) {
    const t = this.tileAt(row, col);
    if (t === T.WALL) return false;
    // Ghost door: only enemies can pass (and only when exiting/returning)
    if (t === T.GHOST_DOOR) return isEnemy;
    // Ghost house interior: only enemies can be here
    if (t === T.GHOST_HOUSE) return isEnemy;
    return true;
  }

  /** Eat pellet at (row, col).  Returns 'pellet', 'power', or null. */
  eatPellet(row, col) {
    if (row < 0 || row >= MAZE_ROWS) return null;
    const c = col < 0 ? MAZE_COLS - 1 : col >= MAZE_COLS ? 0 : col;
    const t = this.grid[row][c];
    if (t === T.PATH) {
      this.grid[row][c] = T.EMPTY;
      this.pelletsLeft--;
      return 'pellet';
    }
    if (t === T.POWER) {
      this.grid[row][c] = T.EMPTY;
      this.pelletsLeft--;
      return 'power';
    }
    return null;
  }

  /** Is the level cleared? */
  isCleared() {
    return this.pelletsLeft <= 0;
  }

  /** Check if a tile is a tunnel (off-screen columns). */
  isTunnel(row, col) {
    return col < 1 || col >= MAZE_COLS - 1;
  }

  /** Get available directions from a tile (for AI path-finding). */
  getAvailableDirs(row, col, isEnemy = false, excludeDir = DIR.NONE) {
    const dirs = [];
    for (const d of [DIR.UP, DIR.LEFT, DIR.DOWN, DIR.RIGHT]) {
      if (d === excludeDir) continue;
      const [dr, dc] = DIR_DELTA[d];
      let nr = row + dr;
      let nc = col + dc;
      // Wrap
      if (nc < 0) nc = MAZE_COLS - 1;
      if (nc >= MAZE_COLS) nc = 0;
      if (this.isWalkable(nr, nc, isEnemy)) {
        dirs.push(d);
      }
    }
    return dirs;
  }
}
