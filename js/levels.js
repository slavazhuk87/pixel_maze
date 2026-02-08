// ── Pixel Maze – Level Data ──
import { T } from './constants.js';

const W = T.WALL;
const _ = T.PATH;
const E = T.EMPTY;
const P = T.POWER;
const H = T.GHOST_HOUSE;
const D = T.GHOST_DOOR;

// Each level: { grid, playerStart, enemyStarts, scatterTargets }
// grid is 21 rows × 19 cols

const LEVEL_1_GRID = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  [W,_,_,_,_,_,_,_,_,W,_,_,_,_,_,_,_,_,W],
  [W,_,W,W,_,W,W,W,_,W,_,W,W,W,_,W,W,_,W],
  [W,P,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,P,W],
  [W,_,W,W,_,W,_,W,W,W,W,W,_,W,_,W,W,_,W],
  [W,_,_,_,_,W,_,_,_,W,_,_,_,W,_,_,_,_,W],
  [W,W,W,W,_,W,W,W,E,W,E,W,W,W,_,W,W,W,W],
  [E,E,E,W,_,W,E,E,E,E,E,E,E,W,_,W,E,E,E],
  [W,W,W,W,_,W,E,W,W,D,W,W,E,W,_,W,W,W,W],
  [E,E,E,E,_,E,E,W,H,H,H,W,E,E,_,E,E,E,E],
  [W,W,W,W,_,W,E,W,W,W,W,W,E,W,_,W,W,W,W],
  [E,E,E,W,_,W,E,E,E,E,E,E,E,W,_,W,E,E,E],
  [W,W,W,W,_,W,E,W,W,W,W,W,E,W,_,W,W,W,W],
  [W,_,_,_,_,_,_,_,_,W,_,_,_,_,_,_,_,_,W],
  [W,_,W,W,_,W,W,W,_,W,_,W,W,W,_,W,W,_,W],
  [W,P,_,W,_,_,_,_,_,E,_,_,_,_,_,W,_,P,W],
  [W,W,_,W,_,W,_,W,W,W,W,W,_,W,_,W,_,W,W],
  [W,_,_,_,_,W,_,_,_,W,_,_,_,W,_,_,_,_,W],
  [W,_,W,W,W,W,W,W,_,W,_,W,W,W,W,W,W,_,W],
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];

const LEVEL_2_GRID = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  [W,_,W,W,W,_,W,_,W,W,W,_,W,_,W,W,W,_,W],
  [W,P,_,_,_,_,W,_,_,W,_,_,W,_,_,_,_,P,W],
  [W,_,W,_,W,_,W,W,_,W,_,W,W,_,W,_,W,_,W],
  [W,_,W,_,_,_,_,_,_,_,_,_,_,_,_,_,W,_,W],
  [W,W,W,_,W,_,W,W,E,W,E,W,W,_,W,_,W,W,W],
  [E,E,E,_,W,_,W,E,E,E,E,E,W,_,W,_,E,E,E],
  [W,W,W,_,W,_,W,E,W,D,W,E,W,_,W,_,W,W,W],
  [E,E,E,_,_,_,E,W,H,H,H,W,E,_,_,_,E,E,E],
  [W,W,W,_,W,_,W,E,W,W,W,E,W,_,W,_,W,W,W],
  [E,E,E,_,W,_,W,E,E,E,E,E,W,_,W,_,E,E,E],
  [W,W,W,_,W,_,W,W,W,W,W,W,W,_,W,_,W,W,W],
  [W,_,_,_,_,_,_,_,_,W,_,_,_,_,_,_,_,_,W],
  [W,_,W,W,_,W,_,W,_,W,_,W,_,W,_,W,W,_,W],
  [W,P,_,_,_,W,_,_,_,E,_,_,_,W,_,_,_,P,W],
  [W,_,W,W,_,W,_,W,W,W,W,W,_,W,_,W,W,_,W],
  [W,_,_,_,_,_,_,W,_,W,_,W,_,_,_,_,_,_,W],
  [W,_,W,W,W,W,_,_,_,_,_,_,_,W,W,W,W,_,W],
  [W,_,_,_,_,_,_,W,_,_,_,W,_,_,_,_,_,_,W],
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];

const LEVEL_3_GRID = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  [W,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,W],
  [W,_,W,_,W,W,W,_,W,W,W,_,W,W,W,_,W,_,W],
  [W,P,W,_,_,_,_,_,_,W,_,_,_,_,_,_,W,P,W],
  [W,_,W,_,W,_,W,_,W,W,W,_,W,_,W,_,W,_,W],
  [W,_,_,_,W,_,_,_,_,_,_,_,_,_,W,_,_,_,W],
  [W,W,W,_,W,W,W,W,E,W,E,W,W,W,W,_,W,W,W],
  [E,E,E,_,_,_,W,E,E,E,E,E,W,_,_,_,E,E,E],
  [W,W,W,_,W,_,W,E,W,D,W,E,W,_,W,_,W,W,W],
  [E,E,E,_,W,_,E,W,H,H,H,W,E,_,W,_,E,E,E],
  [W,W,W,_,W,_,W,E,W,W,W,E,W,_,W,_,W,W,W],
  [E,E,E,_,_,_,W,E,E,E,E,E,W,_,_,_,E,E,E],
  [W,W,W,_,W,W,W,W,W,W,W,W,W,W,W,_,W,W,W],
  [W,_,_,_,_,_,_,_,_,W,_,_,_,_,_,_,_,_,W],
  [W,_,W,_,W,W,_,W,_,W,_,W,_,W,W,_,W,_,W],
  [W,P,_,_,_,_,_,_,_,E,_,_,_,_,_,_,_,P,W],
  [W,_,W,_,W,_,W,W,_,W,_,W,W,_,W,_,W,_,W],
  [W,_,W,_,W,_,_,_,_,_,_,_,_,_,W,_,W,_,W],
  [W,_,_,_,_,_,W,_,W,W,W,_,W,_,_,_,_,_,W],
  [W,_,W,W,W,_,_,_,_,_,_,_,_,_,W,W,W,_,W],
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];

export const LEVELS = [
  null, // index 0 unused
  {
    grid: LEVEL_1_GRID,
    playerStart: { row: 15, col: 9 },
    // Enemy start positions inside ghost house
    enemyStarts: [
      { row: 9, col: 9 },   // Chase  (red)   – starts outside
      { row: 9, col: 8 },   // Ambush (pink)
      { row: 9, col: 9 },   // Whimsy (cyan)
      { row: 9, col: 10 },  // Shy    (orange)
    ],
    // Scatter targets (corner tiles enemies head toward in scatter mode)
    scatterTargets: [
      { row: 0,  col: 17 },  // top-right
      { row: 0,  col: 1  },  // top-left
      { row: 20, col: 17 },  // bottom-right
      { row: 20, col: 1  },  // bottom-left
    ],
  },
  {
    grid: LEVEL_2_GRID,
    playerStart: { row: 15, col: 9 },
    enemyStarts: [
      { row: 9, col: 9 },
      { row: 9, col: 8 },
      { row: 9, col: 9 },
      { row: 9, col: 10 },
    ],
    scatterTargets: [
      { row: 0,  col: 17 },
      { row: 0,  col: 1  },
      { row: 20, col: 17 },
      { row: 20, col: 1  },
    ],
  },
  {
    grid: LEVEL_3_GRID,
    playerStart: { row: 15, col: 9 },
    enemyStarts: [
      { row: 9, col: 9 },
      { row: 9, col: 8 },
      { row: 9, col: 9 },
      { row: 9, col: 10 },
    ],
    scatterTargets: [
      { row: 0,  col: 17 },
      { row: 0,  col: 1  },
      { row: 20, col: 17 },
      { row: 20, col: 1  },
    ],
  },
];

export const TOTAL_LEVELS = 3;
