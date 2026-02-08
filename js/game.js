// ── Pixel Maze – Game State Machine ──
import {
  STATE, SCORE, START_LIVES, MAX_LIVES,
  READY_TIME, DEATH_TIME, LEVEL_CLEAR_TIME, GAME_OVER_TIME,
  FRIGHT_TIME, SCATTER_CHASE, SPEED, GHOST_EXIT_DELAY,
  ENEMY_TYPE,
} from './constants.js';
import { LEVELS, TOTAL_LEVELS } from './levels.js';
import { Maze } from './maze.js';
import { Player } from './player.js';
import { Enemy, EMODE } from './enemy.js';
import { Renderer } from './renderer.js';
import * as Audio from './audio.js';
import * as Input from './input.js';

export class Game {
  constructor(canvas) {
    this.renderer = new Renderer(canvas);
    this.maze = new Maze();
    this.player = new Player();
    this.enemies = [];
    this.scorePopups = [];

    this.state = STATE.TITLE;
    this.stateTimer = 0;
    this.gameTime = 0;
    this.level = 1;
    this.score = 0;
    this.lives = START_LIVES;
    this.highScore = parseInt(localStorage.getItem('pixelmaze_hi') || '0', 10);
    this.extraLifeAwarded = false;
    this.ghostsEatenThisPower = 0;

    // Scatter/chase phase tracking
    this.phaseIndex = 0;
    this.phaseTimer = 0;
    this.currentPhaseIsScatter = true;

    this._updateHUD();
    this._updateLives();
  }

  // ── Level setup ──

  _loadLevel() {
    const data = LEVELS[this.level];
    this.maze.load(data.grid);
    this.renderer.cacheWalls(this.maze);

    // Player
    this.player.reset(data.playerStart.col, data.playerStart.row);
    this.player.speed = SPEED.PLAYER[this.level];

    // Enemies
    this.enemies = [];
    for (let i = 0; i < 4; i++) {
      const es = data.enemyStarts[i];
      const enemy = new Enemy(i, es.col, es.row);
      enemy.scatterTarget = data.scatterTargets[i];
      enemy.normalSpeed = SPEED.ENEMY_NORMAL[this.level];
      enemy.frightSpeed = SPEED.ENEMY_FRIGHT[this.level];
      enemy.tunnelSpeed = SPEED.ENEMY_TUNNEL[this.level];
      enemy.returnSpeed = SPEED.ENEMY_RETURNING[this.level];
      enemy.exitTimer = GHOST_EXIT_DELAY[i];

      // First enemy (red) starts outside
      if (i === 0) {
        enemy.mode = EMODE.SCATTER;
        enemy.row = 7;
        enemy.col = 9;
        enemy.pixelX = 9 * 16 + 8;
        enemy.pixelY = 7 * 16 + 8;
      }
      this.enemies.push(enemy);
    }

    // Phase tracking
    this.phaseIndex = 0;
    this.phaseTimer = 0;
    this.currentPhaseIsScatter = true;
    this.ghostsEatenThisPower = 0;
    this.scorePopups = [];
  }

  _resetPositions() {
    const data = LEVELS[this.level];
    this.player.reset(data.playerStart.col, data.playerStart.row);
    this.player.speed = SPEED.PLAYER[this.level];

    for (let i = 0; i < this.enemies.length; i++) {
      const es = data.enemyStarts[i];
      this.enemies[i].reset();
      this.enemies[i].col = es.col;
      this.enemies[i].row = es.row;
      this.enemies[i].pixelX = es.col * 16 + 8;
      this.enemies[i].pixelY = es.row * 16 + 8;
      this.enemies[i].exitTimer = GHOST_EXIT_DELAY[i];
      this.enemies[i].normalSpeed = SPEED.ENEMY_NORMAL[this.level];
      this.enemies[i].frightSpeed = SPEED.ENEMY_FRIGHT[this.level];
      this.enemies[i].tunnelSpeed = SPEED.ENEMY_TUNNEL[this.level];
      this.enemies[i].returnSpeed = SPEED.ENEMY_RETURNING[this.level];
      this.enemies[i].scatterTarget = LEVELS[this.level].scatterTargets[i];
      if (i === 0) {
        this.enemies[i].mode = EMODE.SCATTER;
        this.enemies[i].row = 7;
        this.enemies[i].col = 9;
        this.enemies[i].pixelX = 9 * 16 + 8;
        this.enemies[i].pixelY = 7 * 16 + 8;
      }
    }

    this.ghostsEatenThisPower = 0;
    this.scorePopups = [];
  }

  // ── State transitions ──

  _enterState(newState) {
    this.state = newState;
    this.stateTimer = 0;

    switch (newState) {
      case STATE.READY:
        Audio.stopSiren();
        Audio.stopFrightSound();
        Audio.startJingle();
        break;
      case STATE.PLAYING:
        Audio.startSiren();
        break;
      case STATE.DYING:
        Audio.stopSiren();
        Audio.stopFrightSound();
        Audio.death();
        break;
      case STATE.LEVEL_COMPLETE:
        Audio.stopSiren();
        Audio.stopFrightSound();
        Audio.levelComplete();
        break;
      case STATE.GAME_OVER:
        Audio.stopSiren();
        Audio.stopFrightSound();
        Audio.gameOver();
        this._saveHighScore();
        break;
      case STATE.WIN:
        Audio.stopSiren();
        Audio.stopFrightSound();
        Audio.levelComplete();
        this._saveHighScore();
        break;
      case STATE.PAUSED:
        Audio.stopSiren();
        Audio.stopFrightSound();
        break;
    }
  }

  // ── Main update (called each frame) ──

  update(dt) {
    this.gameTime += dt;

    // Global: sound toggle
    if (Input.consumeSound()) {
      const on = Audio.toggle();
      const btn = document.getElementById('btn-sound');
      if (btn) btn.classList.toggle('sound-off', !on);
      if (!on) {
        Audio.stopSiren();
        Audio.stopFrightSound();
      }
    }

    // Update score popups
    this.scorePopups = this.scorePopups.filter(p => {
      p.age += dt;
      return p.age < 1;
    });

    switch (this.state) {
      case STATE.TITLE:    this._updateTitle(dt); break;
      case STATE.READY:    this._updateReady(dt); break;
      case STATE.PLAYING:  this._updatePlaying(dt); break;
      case STATE.DYING:    this._updateDying(dt); break;
      case STATE.LEVEL_COMPLETE: this._updateLevelComplete(dt); break;
      case STATE.GAME_OVER:      this._updateGameOver(dt); break;
      case STATE.WIN:            this._updateWin(dt); break;
      case STATE.PAUSED:         this._updatePaused(dt); break;
    }
  }

  _updateTitle(dt) {
    if (Input.consumeStart()) {
      Audio.unlock();
      this.score = 0;
      this.lives = START_LIVES;
      this.level = 1;
      this.extraLifeAwarded = false;
      this._loadLevel();
      this._updateHUD();
      this._updateLives();
      this._enterState(STATE.READY);
    }
  }

  _updateReady(dt) {
    this.stateTimer += dt;
    if (this.stateTimer >= READY_TIME) {
      this._enterState(STATE.PLAYING);
    }
  }

  _updatePlaying(dt) {
    // Pause
    if (Input.consumePause()) {
      this._enterState(STATE.PAUSED);
      return;
    }

    // Player input
    const inputDir = Input.getBuffered();
    this.player.setDirection(inputDir);
    Input.clearBuffered();

    // Update scatter/chase phase
    this._updatePhase(dt);

    // Player movement
    const result = this.player.update(dt, this.maze);

    // Pellet eaten
    if (result.ate === 'pellet') {
      this._addScore(SCORE.PELLET);
      Audio.chompAlternate();
    } else if (result.ate === 'power') {
      this._addScore(SCORE.POWER);
      Audio.powerUp();
      this.ghostsEatenThisPower = 0;
      const frightDur = FRIGHT_TIME[this.level];
      for (const e of this.enemies) {
        e.frighten(frightDur);
      }
      this.player.speed = SPEED.PLAYER_FRIGHT[this.level];
      Audio.stopSiren();
      Audio.startFrightSound();
    }

    // Check if any enemy is still frightened
    const anyFrightened = this.enemies.some(e => e.mode === EMODE.FRIGHTENED);
    if (!anyFrightened && this.player.speed !== SPEED.PLAYER[this.level]) {
      this.player.speed = SPEED.PLAYER[this.level];
      Audio.stopFrightSound();
      if (Audio.isEnabled()) Audio.startSiren();
    }

    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(dt, this.maze, this.player, this.enemies);
    }

    // Collision detection
    for (const enemy of this.enemies) {
      if (!enemy.collidesWith(this.player)) continue;

      if (enemy.mode === EMODE.FRIGHTENED) {
        // Eat the enemy
        this.ghostsEatenThisPower++;
        const pts = SCORE.GHOST_BASE * (2 ** (this.ghostsEatenThisPower - 1));
        this._addScore(pts);
        this.scorePopups.push({
          text: String(pts),
          x: enemy.pixelX,
          y: enemy.pixelY,
          age: 0,
        });
        enemy.startReturning();
        Audio.eatEnemy();
      } else if (enemy.mode !== EMODE.RETURNING) {
        // Player dies
        this.lives--;
        this._updateLives();
        this._enterState(STATE.DYING);
        return;
      }
    }

    // Level cleared
    if (this.maze.isCleared()) {
      this._enterState(STATE.LEVEL_COMPLETE);
    }
  }

  _updateDying(dt) {
    this.stateTimer += dt;
    if (this.stateTimer >= DEATH_TIME) {
      if (this.lives <= 0) {
        this._enterState(STATE.GAME_OVER);
      } else {
        this._resetPositions();
        this._enterState(STATE.READY);
      }
    }
  }

  _updateLevelComplete(dt) {
    this.stateTimer += dt;
    if (this.stateTimer >= LEVEL_CLEAR_TIME) {
      if (this.level >= TOTAL_LEVELS) {
        this._enterState(STATE.WIN);
      } else {
        this.level++;
        this._loadLevel();
        this._updateHUD();
        this._enterState(STATE.READY);
      }
    }
  }

  _updateGameOver(dt) {
    this.stateTimer += dt;
    if (this.stateTimer >= GAME_OVER_TIME && Input.consumeStart()) {
      this._enterState(STATE.TITLE);
    }
  }

  _updateWin(dt) {
    this.stateTimer += dt;
    if (this.stateTimer >= GAME_OVER_TIME && Input.consumeStart()) {
      this._enterState(STATE.TITLE);
    }
  }

  _updatePaused(dt) {
    if (Input.consumePause() || Input.consumeStart()) {
      this._enterState(STATE.PLAYING);
    }
  }

  // ── Scatter / Chase phase management ──

  _updatePhase(dt) {
    const phases = SCATTER_CHASE[this.level];
    if (this.phaseIndex >= phases.length) return; // permanent chase

    this.phaseTimer += dt;
    if (this.phaseTimer >= phases[this.phaseIndex]) {
      this.phaseTimer = 0;
      this.phaseIndex++;
      this.currentPhaseIsScatter = this.phaseIndex % 2 === 0;

      // Switch enemies that are in scatter/chase
      const newMode = this.currentPhaseIsScatter ? EMODE.SCATTER : EMODE.CHASE;
      for (const e of this.enemies) {
        if (e.mode === EMODE.SCATTER || e.mode === EMODE.CHASE) {
          e.mode = newMode;
          e.reverse();
        }
      }
    }

    // Keep active enemies in the correct phase mode (if not frightened/returning/in-house)
    const expectedMode = this.currentPhaseIsScatter ? EMODE.SCATTER : EMODE.CHASE;
    for (const e of this.enemies) {
      if (e.mode === EMODE.SCATTER || e.mode === EMODE.CHASE) {
        e.mode = expectedMode;
      }
    }
  }

  // ── Scoring ──

  _addScore(pts) {
    this.score += pts;
    if (!this.extraLifeAwarded && this.score >= SCORE.EXTRA_LIFE) {
      this.extraLifeAwarded = true;
      if (this.lives < MAX_LIVES) {
        this.lives++;
        this._updateLives();
        Audio.powerUp();
      }
    }
    this._updateHUD();
  }

  _saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('pixelmaze_hi', String(this.highScore));
    }
  }

  // ── UI updates ──

  _updateHUD() {
    const scoreEl = document.getElementById('score-val');
    const hiEl = document.getElementById('hiscore-val');
    const lvlEl = document.getElementById('level-val');
    if (scoreEl) scoreEl.textContent = this.score;
    if (hiEl)    hiEl.textContent = Math.max(this.highScore, this.score);
    if (lvlEl)   lvlEl.textContent = this.level;
  }

  _updateLives() {
    const bar = document.getElementById('lives-bar');
    if (!bar) return;
    bar.innerHTML = '';
    for (let i = 0; i < this.lives; i++) {
      const icon = document.createElement('div');
      icon.className = 'life-icon';
      bar.appendChild(icon);
    }
  }

  // ── Render (called each frame after update) ──

  draw() {
    this.renderer.render(this);
  }
}
