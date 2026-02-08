// ── Pixel Maze – Game Constants ──

export const TILE_SIZE = 16;
export const MAZE_COLS = 19;
export const MAZE_ROWS = 21;
export const CANVAS_W = MAZE_COLS * TILE_SIZE;   // 304
export const CANVAS_H = MAZE_ROWS * TILE_SIZE;   // 336

// Tile types in the level grid
export const T = {
  PATH: 0,         // walkable, gets a pellet
  WALL: 1,
  EMPTY: 2,        // walkable, no pellet (tunnels, ghost-house area)
  POWER: 3,        // walkable, power pellet
  GHOST_HOUSE: 4,  // inside the ghost house
  GHOST_DOOR: 5,   // ghost-house door (only enemies pass through)
};

// Directions
export const DIR = {
  NONE: -1,
  UP:    0,
  RIGHT: 1,
  DOWN:  2,
  LEFT:  3,
};

// Delta for each direction  [row, col]
export const DIR_DELTA = {
  [DIR.UP]:    [-1,  0],
  [DIR.RIGHT]: [ 0,  1],
  [DIR.DOWN]:  [ 1,  0],
  [DIR.LEFT]:  [ 0, -1],
};

export const OPPOSITE = {
  [DIR.UP]:    DIR.DOWN,
  [DIR.RIGHT]: DIR.LEFT,
  [DIR.DOWN]:  DIR.UP,
  [DIR.LEFT]:  DIR.RIGHT,
};

// Game states
export const STATE = {
  TITLE:          0,
  READY:          1,
  PLAYING:        2,
  DYING:          3,
  LEVEL_COMPLETE: 4,
  GAME_OVER:      5,
  WIN:            6,
  PAUSED:         7,
};

// Scoring
export const SCORE = {
  PELLET:       10,
  POWER:        50,
  GHOST_BASE:  200,   // doubles each successive ghost eaten per power-up
  EXTRA_LIFE: 10000,
};

// Player
export const START_LIVES = 3;
export const MAX_LIVES = 5;

// Timing (in seconds)
export const READY_TIME   = 2.0;
export const DEATH_TIME   = 1.5;
export const LEVEL_CLEAR_TIME = 2.0;
export const GAME_OVER_TIME   = 3.0;

// Frightened duration per level (seconds)
export const FRIGHT_TIME = [0, 7, 6, 4];  // index 0 unused; levels 1-3

// Scatter/Chase phase durations (seconds) per level
// Each array: [scatter, chase, scatter, chase, ...]  – last chase is infinite
export const SCATTER_CHASE = [
  [],
  [7, 20, 7, 20, 5, 20, 5, Infinity],   // level 1
  [5, 20, 5, 20, 5, Infinity],           // level 2
  [3, 20, 3, 20, 3, Infinity],           // level 3
];

// Speed (pixels per second)  – base tile size = 16
export const SPEED = {
  // [level] → px/sec
  PLAYER:           [0, 76, 82, 88],
  PLAYER_FRIGHT:    [0, 82, 88, 94],
  ENEMY_NORMAL:     [0, 66, 72, 80],
  ENEMY_FRIGHT:     [0, 40, 42, 44],
  ENEMY_TUNNEL:     [0, 36, 38, 40],
  ENEMY_RETURNING:  [0, 130, 140, 150],
};

// Colours
export const C = {
  BG:          '#0a0a1a',
  WALL:        '#3333bb',
  WALL_EDGE:   '#5566ee',
  PELLET:      '#ffff99',
  POWER:       '#ffaa22',
  PLAYER_BODY: '#ffdd00',
  PLAYER_DARK: '#cc9900',
  GHOST_DOOR:  '#ffaacc',
  TEXT:        '#ffffff',
  READY_TEXT:  '#ffff00',
  FRIGHTENED:  '#2222ff',
  FRIGHT_FLASH:'#ffffff',
  ENEMY_EYES:  '#ffffff',
  ENEMY_PUPIL: '#222244',
  // Enemy body colours by index
  ENEMY: ['#ff3333', '#ff88cc', '#33ddff', '#ffaa33'],
};

// Enemy types (indices into C.ENEMY and AI behaviours)
export const ENEMY_TYPE = {
  CHASE:  0,  // red – targets player directly
  AMBUSH: 1,  // pink – targets 4 tiles ahead of player
  WHIMSY: 2,  // cyan – uses vector doubling trick
  SHY:    3,  // orange – chases when far, scatters when close
};

// Ghost-house exit order delay (seconds after level start)
export const GHOST_EXIT_DELAY = [0, 0, 3, 6, 9];
