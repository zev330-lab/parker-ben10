import type { Player, Enemy, Projectile, Particle, Camera, LevelData } from './types';
import {
  GameState, AlienType,
  VIRTUAL_WIDTH, VIRTUAL_HEIGHT, GROUND_Y, GRAVITY,
  PLAYER_SPEED, PLAYER_JUMP_VEL, OMNITRIX_COOLDOWN, ATTACK_COOLDOWN,
  INVINCIBLE_TIME, KNOCKBACK_VEL_X, KNOCKBACK_VEL_Y,
  ALIEN_STATS, LEVELS,
} from './types';
import { Renderer } from './renderer';
import { InputManager } from './input';
import { Sound } from './sound';

// Deep clone level data so spawns can be reset
function cloneLevels(): LevelData[] {
  return JSON.parse(JSON.stringify(LEVELS));
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: Renderer;
  private input: InputManager;
  private running = false;
  private rafId = 0;

  // State
  state: GameState = GameState.SPLASH;
  stateTimer = 0;
  totalTime = 0;

  // Level
  levels: LevelData[] = cloneLevels();
  levelIndex = 0;
  score = 0;

  // Entities
  player!: Player;
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  particles: Particle[] = [];
  camera: Camera = { x: 0, y: 0 };

  // Transformation animation
  transformAnim = 0;
  transformFlash = false;

  // Track if level end zone reached
  levelEndReached = false;
  allEnemiesSpawned = false;

  // Cooldowns for taps in menus
  private tapCooldown = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.renderer = new Renderer(this.ctx);
    this.input = new InputManager(canvas);
    this.resetPlayer();
  }

  resetPlayer() {
    this.player = {
      pos: { x: 100, y: GROUND_Y - 60 },
      vel: { x: 0, y: 0 },
      width: 40,
      height: 60,
      facing: 1,
      grounded: true,
      currentAlien: null,
      health: 5,
      maxHealth: 5,
      invincibleTimer: 0,
      attackCooldown: 0,
      attackAnim: 0,
      omnitrixCooldown: 0,
      omnitrixMaxCooldown: OMNITRIX_COOLDOWN,
      unlockedAliens: [],
      animFrame: 0,
      animTimer: 0,
      shieldActive: false,
      shieldTimer: 0,
      dashActive: false,
      dashTimer: 0,
    };
  }

  start() {
    this.running = true;
    Sound.init();
    let lastTime = performance.now();

    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      this.resize();
      this.update(dt);
      this.render();
      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.input.destroy();
  }

  private resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (this.canvas.width !== w * dpr || this.canvas.height !== h * dpr) {
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
    }
    // Calculate scaling
    const scaleX = this.canvas.width / VIRTUAL_WIDTH;
    const scaleY = this.canvas.height / VIRTUAL_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (this.canvas.width - VIRTUAL_WIDTH * scale) / 2;
    const offsetY = (this.canvas.height - VIRTUAL_HEIGHT * scale) / 2;
    this.input.updateScale(scale, offsetX, offsetY);
  }

  private update(dt: number) {
    this.totalTime += dt;
    this.stateTimer += dt;
    this.tapCooldown = Math.max(0, this.tapCooldown - dt);

    switch (this.state) {
      case GameState.SPLASH:
        this.updateSplash(dt);
        break;
      case GameState.LEVEL_INTRO:
        this.updateLevelIntro(dt);
        break;
      case GameState.PLAYING:
        this.updatePlaying(dt);
        break;
      case GameState.ALIEN_SELECT:
        this.updateAlienSelect(dt);
        break;
      case GameState.LEVEL_COMPLETE:
        this.updateLevelComplete(dt);
        break;
      case GameState.VICTORY:
        this.updateVictory(dt);
        break;
    }
  }

  private changeState(newState: GameState) {
    this.state = newState;
    this.stateTimer = 0;
    this.tapCooldown = 0.3;
  }

  // ============ STATE UPDATES ============

  private updateSplash(_dt: number) {
    if (this.stateTimer > 0.5 && this.input.consumeAnyTap()) {
      Sound.tap();
      this.startGame();
    }
  }

  private startGame() {
    this.levels = cloneLevels();
    this.levelIndex = 0;
    this.score = 0;
    this.resetPlayer();
    this.startLevel();
  }

  private startLevel() {
    const level = this.levels[this.levelIndex];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.camera = { x: 0, y: 0 };
    this.levelEndReached = false;
    this.allEnemiesSpawned = false;

    // Reset player position but keep aliens and health
    this.player.pos = { x: 100, y: GROUND_Y - this.player.height };
    this.player.vel = { x: 0, y: 0 };
    this.player.grounded = true;

    // Unlock the new alien for this level
    if (!this.player.unlockedAliens.includes(level.newAlien)) {
      this.player.unlockedAliens.push(level.newAlien);
    }

    // Reset enemy spawn flags
    for (const spawn of level.enemySpawns) {
      spawn.spawned = false;
    }

    this.changeState(GameState.LEVEL_INTRO);
    Sound.levelStart();
  }

  private updateLevelIntro(_dt: number) {
    if (this.stateTimer > 2 && this.input.consumeAnyTap()) {
      this.changeState(GameState.PLAYING);
    }
    // Auto-advance after 4s
    if (this.stateTimer > 4) {
      this.changeState(GameState.PLAYING);
    }
  }

  private updatePlaying(dt: number) {
    const level = this.levels[this.levelIndex];

    this.updatePlayerMovement(dt);
    this.updatePlayerAttack(dt);
    this.updateOmnitrix(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateParticles(dt);
    this.updateCamera(dt);
    this.spawnEnemies(level);
    this.checkCollisions();
    this.checkLevelComplete(level);
    this.updateTransformAnim(dt);
  }

  private updateAlienSelect(_dt: number) {
    this.input.setAlienSelectVisible(true, this.player.unlockedAliens.length);
    const sel = this.input.consumeAlienSelect();
    if (sel >= 0 && sel < this.player.unlockedAliens.length) {
      // Transform!
      const alien = this.player.unlockedAliens[sel];
      this.player.currentAlien = alien;
      const stats = ALIEN_STATS[alien];
      this.player.width = stats.width;
      this.player.height = stats.height;
      this.player.omnitrixCooldown = OMNITRIX_COOLDOWN;
      this.transformAnim = 0.5;
      this.transformFlash = true;

      // Snap to ground
      this.player.pos.y = GROUND_Y - this.player.height;

      Sound.transform();
      this.input.setAlienSelectVisible(false, 0);
      this.changeState(GameState.PLAYING);

      // Spawn green particles
      for (let i = 0; i < 20; i++) {
        this.particles.push({
          pos: { x: this.player.pos.x + this.player.width / 2, y: this.player.pos.y + this.player.height / 2 },
          vel: { x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 400 },
          color: '#00ff00',
          size: 4 + Math.random() * 6,
          lifetime: 0.5 + Math.random() * 0.5,
          maxLifetime: 1,
        });
      }
    } else if (sel === -2) {
      // Cancel
      this.input.setAlienSelectVisible(false, 0);
      this.changeState(GameState.PLAYING);
    }
  }

  private updateLevelComplete(_dt: number) {
    if (this.stateTimer > 1.5 && this.input.consumeAnyTap()) {
      this.nextLevel();
    }
    if (this.stateTimer > 5) {
      this.nextLevel();
    }
  }

  private nextLevel() {
    this.levelIndex++;
    if (this.levelIndex >= this.levels.length) {
      this.changeState(GameState.VICTORY);
      Sound.victory();
    } else {
      this.startLevel();
    }
  }

  private updateVictory(_dt: number) {
    if (this.stateTimer > 2.5 && this.input.consumeAnyTap()) {
      this.changeState(GameState.SPLASH);
    }
  }

  // ============ GAMEPLAY ============

  private updatePlayerMovement(dt: number) {
    const p = this.player;
    const speed = p.currentAlien ? ALIEN_STATS[p.currentAlien].speed : PLAYER_SPEED;
    const jumpVel = p.currentAlien ? ALIEN_STATS[p.currentAlien].jumpVel : PLAYER_JUMP_VEL;

    // Don't allow input during dash
    if (p.dashActive) {
      p.dashTimer -= dt;
      if (p.dashTimer <= 0) {
        p.dashActive = false;
      }
      p.pos.x += p.vel.x * dt;
      return;
    }

    // Horizontal movement
    if (this.input.state.left) {
      p.vel.x = -speed;
      p.facing = -1;
    } else if (this.input.state.right) {
      p.vel.x = speed;
      p.facing = 1;
    } else {
      p.vel.x = p.vel.x * 0.8; // friction
      if (Math.abs(p.vel.x) < 10) p.vel.x = 0;
    }

    // Jump
    if (this.input.consumeJump() && p.grounded) {
      p.vel.y = jumpVel;
      p.grounded = false;
      Sound.jump();
    }

    // Gravity
    if (!p.grounded) {
      p.vel.y += GRAVITY * dt;
    }

    // Update position
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;

    // Ground collision
    const groundLevel = GROUND_Y - p.height;
    if (p.pos.y >= groundLevel) {
      p.pos.y = groundLevel;
      p.vel.y = 0;
      p.grounded = true;
    }

    // Keep in bounds (left side = camera, right side = level width)
    const level = this.levels[this.levelIndex];
    p.pos.x = Math.max(this.camera.x, Math.min(p.pos.x, level.width - p.width));

    // Invincibility
    if (p.invincibleTimer > 0) {
      p.invincibleTimer -= dt;
    }

    // Shield timer
    if (p.shieldActive) {
      p.shieldTimer -= dt;
      if (p.shieldTimer <= 0) {
        p.shieldActive = false;
      }
    }

    // Animation
    p.animTimer += dt;
    if (p.animTimer > 0.15) {
      p.animTimer = 0;
      p.animFrame = (p.animFrame + 1) % 4;
    }

    // Attack anim decay
    if (p.attackAnim > 0) {
      p.attackAnim -= dt * 4;
      if (p.attackAnim < 0) p.attackAnim = 0;
    }
  }

  private updatePlayerAttack(dt: number) {
    const p = this.player;
    p.attackCooldown = Math.max(0, p.attackCooldown - dt);

    if (this.input.consumeAttack() && p.attackCooldown <= 0) {
      p.attackCooldown = ATTACK_COOLDOWN;
      p.attackAnim = 1;

      if (p.currentAlien === null) {
        // Ben's weak punch - melee only
        Sound.weakPunch();
        this.meleeAttack(p.pos.x + (p.facing === 1 ? p.width : -30), p.pos.y + p.height * 0.2, 35, p.height * 0.5, 1);
      } else {
        switch (p.currentAlien) {
          case AlienType.HEATBLAST: {
            Sound.fireball();
            this.projectiles.push({
              pos: { x: p.pos.x + (p.facing === 1 ? p.width + 5 : -15), y: p.pos.y + p.height * 0.35 },
              vel: { x: p.facing * 600, y: 0 },
              width: 20,
              height: 20,
              type: 'fireball',
              lifetime: 1.5,
              fromPlayer: true,
            });
            // Fire particles
            for (let i = 0; i < 5; i++) {
              this.particles.push({
                pos: { x: p.pos.x + p.width / 2, y: p.pos.y + p.height * 0.35 },
                vel: { x: p.facing * (200 + Math.random() * 200), y: (Math.random() - 0.5) * 150 },
                color: Math.random() > 0.5 ? '#ff6600' : '#ffaa00',
                size: 3 + Math.random() * 4,
                lifetime: 0.3 + Math.random() * 0.3,
                maxLifetime: 0.6,
              });
            }
            break;
          }
          case AlienType.FOURARMS: {
            Sound.punch();
            // Wide melee + shockwave projectile
            this.meleeAttack(
              p.pos.x + (p.facing === 1 ? p.width : -ALIEN_STATS[AlienType.FOURARMS].attackRange),
              p.pos.y,
              ALIEN_STATS[AlienType.FOURARMS].attackRange,
              p.height,
              ALIEN_STATS[AlienType.FOURARMS].attackDamage
            );
            this.projectiles.push({
              pos: { x: p.pos.x + (p.facing === 1 ? p.width + 20 : -20), y: p.pos.y + p.height * 0.4 },
              vel: { x: p.facing * 300, y: 0 },
              width: 40,
              height: 40,
              type: 'punch_wave',
              lifetime: 0.3,
              fromPlayer: true,
            });
            break;
          }
          case AlienType.XLR8: {
            Sound.dash();
            // Speed dash - move forward rapidly, damage everything in path
            p.dashActive = true;
            p.dashTimer = 0.25;
            p.vel.x = p.facing * 900;
            p.invincibleTimer = Math.max(p.invincibleTimer, 0.3);
            this.projectiles.push({
              pos: { x: p.pos.x + p.width / 2, y: p.pos.y + p.height * 0.3 },
              vel: { x: p.facing * 900, y: 0 },
              width: 60,
              height: 50,
              type: 'speed_dash',
              lifetime: 0.25,
              fromPlayer: true,
            });
            break;
          }
          case AlienType.DIAMONDHEAD: {
            Sound.shield();
            // Crystal shield + forward crystal projectile
            p.shieldActive = true;
            p.shieldTimer = 1.5;
            p.invincibleTimer = Math.max(p.invincibleTimer, 0.5);
            this.projectiles.push({
              pos: { x: p.pos.x + (p.facing === 1 ? p.width + 5 : -15), y: p.pos.y + p.height * 0.3 },
              vel: { x: p.facing * 400, y: 0 },
              width: 25,
              height: 16,
              type: 'crystal',
              lifetime: 1.0,
              fromPlayer: true,
            });
            // Crystal particles
            for (let i = 0; i < 8; i++) {
              this.particles.push({
                pos: { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 },
                vel: { x: (Math.random() - 0.5) * 300, y: (Math.random() - 0.5) * 300 },
                color: Math.random() > 0.5 ? '#00ccaa' : '#80ffec',
                size: 3 + Math.random() * 4,
                lifetime: 0.4 + Math.random() * 0.4,
                maxLifetime: 0.8,
              });
            }
            break;
          }
        }
      }
    }
  }

  private meleeAttack(x: number, y: number, w: number, h: number, damage: number) {
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (this.aabb(x, y, w, h, e.pos.x, e.pos.y, e.width, e.height)) {
        this.damageEnemy(e, damage);
      }
    }
  }

  private updateOmnitrix(dt: number) {
    const p = this.player;
    p.omnitrixCooldown = Math.max(0, p.omnitrixCooldown - dt);

    // Check if omnitrix just became ready
    if (p.omnitrixCooldown <= 0 && p.unlockedAliens.length > 0) {
      if (this.input.consumeOmnitrix()) {
        Sound.omnitrixReady();
        this.input.setAlienSelectVisible(true, p.unlockedAliens.length);
        this.changeState(GameState.ALIEN_SELECT);
      }
    }
  }

  private updateTransformAnim(dt: number) {
    if (this.transformAnim > 0) {
      this.transformAnim -= dt;
      if (this.transformAnim <= 0) {
        this.transformFlash = false;
      }
    }
  }

  private updateEnemies(dt: number) {
    for (const e of this.enemies) {
      if (!e.alive) continue;

      e.hitTimer = Math.max(0, e.hitTimer - dt);
      e.animTimer += dt;
      if (e.animTimer > 0.2) {
        e.animTimer = 0;
        e.animFrame = (e.animFrame + 1) % 4;
      }

      if (e.type === 'robot') {
        // Walk toward player
        const dx = this.player.pos.x - e.pos.x;
        e.vel.x = dx > 0 ? 100 : -100;
        e.pos.x += e.vel.x * dt;
        e.pos.y = GROUND_Y - e.height;
      } else {
        // Drone - float with sine wave, move toward player
        const dx = this.player.pos.x - e.pos.x;
        e.vel.x = dx > 0 ? 80 : -80;
        e.pos.x += e.vel.x * dt;
        e.pos.y = e.baseY + Math.sin(this.totalTime * 2 + e.sineOffset) * 30;
      }
    }

    // Remove dead enemies that have faded
    this.enemies = this.enemies.filter(e => e.alive);
  }

  private updateProjectiles(dt: number) {
    for (const p of this.projectiles) {
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.lifetime -= dt;
    }
    this.projectiles = this.projectiles.filter(p => p.lifetime > 0);
  }

  private updateParticles(dt: number) {
    for (const p of this.particles) {
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.vel.y += 200 * dt; // gentle gravity
      p.lifetime -= dt;
    }
    this.particles = this.particles.filter(p => p.lifetime > 0);
  }

  private updateCamera(_dt: number) {
    const level = this.levels[this.levelIndex];
    // Camera follows player, keeping player in left third
    const targetX = this.player.pos.x - VIRTUAL_WIDTH * 0.3;
    this.camera.x += (targetX - this.camera.x) * 0.1;
    this.camera.x = Math.max(0, Math.min(this.camera.x, level.width - VIRTUAL_WIDTH));
  }

  private spawnEnemies(level: LevelData) {
    let allSpawned = true;
    for (const spawn of level.enemySpawns) {
      if (spawn.spawned) continue;
      allSpawned = false;
      // Spawn when camera reaches the trigger point
      if (this.camera.x + VIRTUAL_WIDTH >= spawn.x) {
        spawn.spawned = true;
        for (let i = 0; i < spawn.count; i++) {
          this.spawnEnemy(spawn.x + VIRTUAL_WIDTH + i * 80, spawn.type);
        }
      }
    }
    this.allEnemiesSpawned = allSpawned;
  }

  private spawnEnemy(x: number, type: 'robot' | 'drone') {
    const isRobot = type === 'robot';
    const w = isRobot ? 45 : 50;
    const h = isRobot ? 65 : 40;
    const hp = isRobot ? 3 : 2;
    const baseY = isRobot ? GROUND_Y - h : GROUND_Y - h - 100 - Math.random() * 80;

    this.enemies.push({
      pos: { x, y: baseY },
      vel: { x: 0, y: 0 },
      width: w,
      height: h,
      type,
      health: hp,
      maxHealth: hp,
      alive: true,
      hitTimer: 0,
      animFrame: 0,
      animTimer: 0,
      sineOffset: Math.random() * Math.PI * 2,
      baseY,
    });
  }

  private checkCollisions() {
    const p = this.player;

    // Player projectiles hitting enemies
    for (const proj of this.projectiles) {
      if (!proj.fromPlayer) continue;
      for (const e of this.enemies) {
        if (!e.alive) continue;
        if (this.aabb(proj.pos.x - proj.width / 2, proj.pos.y - proj.height / 2, proj.width, proj.height,
          e.pos.x, e.pos.y, e.width, e.height)) {
          const damage = p.currentAlien ? ALIEN_STATS[p.currentAlien].attackDamage : 1;
          this.damageEnemy(e, damage);
          // Remove fireball/crystal on hit, but not punch_wave or speed_dash
          if (proj.type === 'fireball' || proj.type === 'crystal') {
            proj.lifetime = 0;
          }
        }
      }
    }

    // Enemies hitting player
    if (p.invincibleTimer <= 0 && !p.shieldActive) {
      for (const e of this.enemies) {
        if (!e.alive) continue;
        if (this.aabb(p.pos.x, p.pos.y, p.width, p.height, e.pos.x, e.pos.y, e.width, e.height)) {
          this.playerHit(e);
        }
      }
    }

    // Shield damaging nearby enemies
    if (p.shieldActive) {
      const shieldRange = p.width + 25;
      const cx = p.pos.x + p.width / 2;
      const cy = p.pos.y + p.height / 2;
      for (const e of this.enemies) {
        if (!e.alive || e.hitTimer > 0) continue;
        const ex = e.pos.x + e.width / 2;
        const ey = e.pos.y + e.height / 2;
        const dist = Math.sqrt((cx - ex) ** 2 + (cy - ey) ** 2);
        if (dist < shieldRange + e.width / 2) {
          this.damageEnemy(e, 1);
        }
      }
    }
  }

  private damageEnemy(e: Enemy, damage: number) {
    e.health -= damage;
    e.hitTimer = 0.15;

    if (e.health <= 0) {
      e.alive = false;
      this.score += 100;
      Sound.enemyDefeat();
      // Death particles
      for (let i = 0; i < 12; i++) {
        this.particles.push({
          pos: { x: e.pos.x + e.width / 2, y: e.pos.y + e.height / 2 },
          vel: { x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 400 },
          color: e.type === 'robot' ? '#888' : '#607d8b',
          size: 4 + Math.random() * 6,
          lifetime: 0.5 + Math.random() * 0.5,
          maxLifetime: 1,
        });
      }
      // Score popup particle
      this.particles.push({
        pos: { x: e.pos.x + e.width / 2, y: e.pos.y - 10 },
        vel: { x: 0, y: -80 },
        color: '#ffff00',
        size: 1,
        lifetime: 1,
        maxLifetime: 1,
      });
    }
  }

  private playerHit(e: Enemy) {
    const p = this.player;
    p.health--;
    p.invincibleTimer = INVINCIBLE_TIME;
    Sound.playerHit();

    // Knockback
    const knockDir = p.pos.x < e.pos.x ? -1 : 1;
    p.vel.x = knockDir * KNOCKBACK_VEL_X;
    p.vel.y = KNOCKBACK_VEL_Y;
    p.grounded = false;

    // Lose points
    this.score = Math.max(0, this.score - 50);

    // Hit particles
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        pos: { x: p.pos.x + p.width / 2, y: p.pos.y + p.height / 2 },
        vel: { x: (Math.random() - 0.5) * 300, y: (Math.random() - 0.5) * 300 },
        color: '#ff4444',
        size: 3 + Math.random() * 4,
        lifetime: 0.3 + Math.random() * 0.3,
        maxLifetime: 0.6,
      });
    }

    // If health hits 0, refill
    if (p.health <= 0) {
      p.health = p.maxHealth;
      p.invincibleTimer = 2;
      // "Shake it off" flash
      this.transformFlash = true;
      this.transformAnim = 0.3;
    }
  }

  private checkLevelComplete(level: LevelData) {
    // Level is complete when all enemies are spawned and defeated
    if (this.allEnemiesSpawned && this.enemies.filter(e => e.alive).length === 0) {
      // Check player has moved past most of the level
      if (this.player.pos.x > level.width * 0.6) {
        this.changeState(GameState.LEVEL_COMPLETE);
        Sound.victory();
      }
    }
  }

  private aabb(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  // ============ RENDER ============

  private render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Black letterbox
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply virtual coordinate transform
    const scaleX = this.canvas.width / VIRTUAL_WIDTH;
    const scaleY = this.canvas.height / VIRTUAL_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (this.canvas.width - VIRTUAL_WIDTH * scale) / 2;
    const offsetY = (this.canvas.height - VIRTUAL_HEIGHT * scale) / 2;

    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);

    // Clip to virtual viewport
    ctx.beginPath();
    ctx.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    ctx.clip();

    const level = this.levels[this.levelIndex];

    this.renderer.render(
      this.state,
      this.player,
      this.enemies,
      this.projectiles,
      this.particles,
      this.camera,
      level,
      this.levelIndex,
      this.score,
      this.input,
      this.stateTimer,
      this.totalTime,
    );

    // Transform flash overlay
    if (this.transformFlash && this.transformAnim > 0) {
      const alpha = this.transformAnim * 2;
      ctx.fillStyle = `rgba(0, 229, 0, ${Math.min(0.5, alpha)})`;
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    }

    ctx.restore();
  }
}

