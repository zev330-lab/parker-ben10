import type { MissionDef, AlienId, HudState, GameCallbacks, EnemyState, BossState, SaveData } from '../types';
import type { ProjectileState } from './Projectile';
import { BOSS_DEFS } from './data';
import { Input } from './Input';
import { Camera } from './Camera';
import { ParticleSystem } from './Particle';
import { Audio } from './Audio';
import { Renderer } from './Renderer';
import { createPlayer, updatePlayer, switchAlien, damagePlayer } from './Player';
import { updateEnemies, killEnemy } from './Enemy';
import { updateProjectiles } from './Projectile';
import { createWorldState, updateWorld, isLevelComplete } from './World';
import { createBoss, updateBoss, killBoss } from './Boss';

export interface EngineCommands {
  selectAlien: (id: AlienId) => void;
  pause: () => void;
  resume: () => void;
  destroy: () => void;
}

export class Engine {
  private canvas: HTMLCanvasElement;
  private input: Input;
  private camera: Camera;
  private particles: ParticleSystem;
  private audio: Audio;
  private renderer: Renderer;
  private callbacks: GameCallbacks;
  private mission: MissionDef;
  private unlockedAliens: AlienId[];

  private player;
  private enemies: EnemyState[] = [];
  private boss: BossState | null = null;
  private projectiles: ProjectileState[] = [];
  private worldState;

  private running = false;
  private paused = false;
  private animFrame = 0;
  private lastTime = 0;
  private levelCompleteTriggered = false;
  private levelCompleteDelay = 0;

  private lastHud: string = '';

  constructor(
    canvas: HTMLCanvasElement,
    mission: MissionDef,
    save: SaveData,
    callbacks: GameCallbacks,
  ) {
    this.canvas = canvas;
    this.mission = mission;
    this.callbacks = callbacks;
    this.unlockedAliens = [...save.unlockedAliens];

    this.input = new Input(canvas);
    this.camera = new Camera();
    this.particles = new ParticleSystem();
    this.audio = new Audio();
    this.renderer = new Renderer(canvas);

    // Pick starting alien: prefer the one unlocked by this mission, else first unlocked
    const startAlien = mission.unlockAliens.length > 0 && save.unlockedAliens.includes(mission.unlockAliens[0])
      ? mission.unlockAliens[0]
      : save.unlockedAliens[0] || 'heatblast';

    this.player = createPlayer(startAlien);
    this.worldState = createWorldState(mission);

    this.resize();
    window.addEventListener('resize', this.resize);
  }

  private resize = () => {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.camera.resize(this.canvas.width, this.canvas.height);

    // Update button hit areas
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    this.input.setButtonRects(
      { x: cw - 120, y: ch - 120, w: 80, h: 80 },
      { x: cw - 170, y: ch - 105, w: 60, h: 60 },
      { x: cw - 67, y: 23, w: 44, h: 44 },
    );
  };

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  private loop = () => {
    if (!this.running) return;
    this.animFrame = requestAnimationFrame(this.loop);

    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > 0.1) dt = 0.1; // cap delta

    if (this.paused) {
      this.render();
      return;
    }

    this.update(dt);
    this.render();
  };

  private update(dt: number) {
    const inp = this.input.read();

    // Omnitrix button
    if (inp.omnitrix && this.unlockedAliens.length > 1) {
      this.callbacks.onRequestAlienSelect();
      this.paused = true;
      return;
    }

    // Update player
    updatePlayer(
      this.player, inp, dt, this.mission.arenaRadius,
      this.enemies, this.boss, this.projectiles, this.particles, this.audio,
    );

    // Update enemies
    updateEnemies(this.enemies, this.player, dt, this.mission.arenaRadius, this.projectiles, this.particles, this.audio);

    // Spawn waves
    const spawned = updateWorld(this.worldState, this.enemies, dt, this.audio);
    this.enemies.push(...spawned);

    // Spawn boss when waves done and it's a boss level
    if (this.worldState.allWavesSpawned && this.mission.isBoss && !this.boss && !this.worldState.bossSpawned) {
      const bossId = this.mission.boss!;
      this.boss = createBoss(bossId, this.mission.arenaRadius);
      this.worldState.bossSpawned = true;
      this.audio.bossAppear();
      this.particles.addFloatingText({ x: 0, y: -50 }, 'BOSS FIGHT!', '#ff0044', 32);
    }

    // Update boss
    if (this.boss && this.boss.alive) {
      const bossSpawned = updateBoss(
        this.boss, this.player, dt, this.mission.arenaRadius,
        this.projectiles, this.enemies, this.particles, this.audio,
      );
      this.enemies.push(...bossSpawned);
    }

    // Update projectiles
    updateProjectiles(this.projectiles, dt, this.mission.arenaRadius);

    // Collision: player projectiles vs enemies
    for (const proj of this.projectiles) {
      if (!proj.alive || !proj.fromPlayer) continue;

      for (const e of this.enemies) {
        if (!e.alive || proj.hitIds.has(e.id)) continue;
        const dx = e.pos.x - proj.pos.x;
        const dy = e.pos.y - proj.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < e.radius + proj.radius) {
          e.health -= proj.damage;
          e.hitTimer = 0.15;
          proj.hitIds.add(e.id);
          this.particles.spawnHit(e.pos, proj.color);
          this.audio.hit();
          if (!proj.piercing) proj.alive = false;
          if (e.health <= 0) killEnemy(e, this.player, this.particles, this.audio);
        }
      }

      // vs boss
      if (this.boss && this.boss.alive && !proj.hitIds.has(this.boss.id)) {
        const dx = this.boss.pos.x - proj.pos.x;
        const dy = this.boss.pos.y - proj.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.boss.radius + proj.radius) {
          this.boss.health -= proj.damage;
          this.boss.hitTimer = 0.15;
          proj.hitIds.add(this.boss.id);
          this.particles.spawnHit(this.boss.pos, proj.color);
          this.audio.hit();
          if (!proj.piercing) proj.alive = false;
          if (this.boss.health <= 0) killBoss(this.boss, this.player, this.particles, this.audio);
        }
      }
    }

    // Collision: enemy projectiles vs player
    for (const proj of this.projectiles) {
      if (!proj.alive || proj.fromPlayer) continue;
      const dx = this.player.pos.x - proj.pos.x;
      const dy = this.player.pos.y - proj.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.player.radius + proj.radius) {
        damagePlayer(this.player, proj.damage, this.particles, this.audio);
        proj.alive = false;
      }
    }

    // Collision: enemies touching player (contact damage)
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const dx = this.player.pos.x - e.pos.x;
      const dy = this.player.pos.y - e.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.player.radius + e.radius) {
        const def = { robot: 1, drone: 1, turret: 0, charger: 2 }[e.type] || 1;
        damagePlayer(this.player, def, this.particles, this.audio);
        // Push enemy away
        if (dist > 0) {
          e.pos.x -= (dx / dist) * 20;
          e.pos.y -= (dy / dist) * 20;
        }
      }
    }

    // Boss contact damage
    if (this.boss && this.boss.alive) {
      const dx = this.player.pos.x - this.boss.pos.x;
      const dy = this.player.pos.y - this.boss.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.player.radius + this.boss.radius) {
        damagePlayer(this.player, 2, this.particles, this.audio);
      }
    }

    // Player dashing through enemies
    if (this.player.dashTimer > 0) {
      for (const e of this.enemies) {
        if (!e.alive) continue;
        const dx = e.pos.x - this.player.pos.x;
        const dy = e.pos.y - this.player.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.player.radius + e.radius + 10) {
          e.health -= this.player.dashDamage;
          e.hitTimer = 0.15;
          this.particles.spawnHit(e.pos, this.player.dashColor);
          if (e.health <= 0) killEnemy(e, this.player, this.particles, this.audio);
        }
      }
    }

    // Update particles
    this.particles.update(dt);

    // Camera follow
    this.camera.follow(this.player.pos, dt);

    // Clean dead enemies
    this.enemies = this.enemies.filter(e => e.alive);

    // Level complete check
    const bossAlive = this.boss ? this.boss.alive : false;
    if (!this.levelCompleteTriggered && isLevelComplete(this.worldState, this.enemies, bossAlive)) {
      this.levelCompleteTriggered = true;
      this.levelCompleteDelay = 1.5;
      this.audio.levelComplete();
      this.particles.addFloatingText(this.player.pos, 'LEVEL CLEAR!', '#00e500', 28);
    }

    if (this.levelCompleteTriggered) {
      this.levelCompleteDelay -= dt;
      if (this.levelCompleteDelay <= 0) {
        // Calculate stars
        const hpPct = this.player.health / this.player.maxHealth;
        let stars = 1;
        if (hpPct > 0.4) stars = 2;
        if (hpPct > 0.8) stars = 3;
        this.callbacks.onLevelComplete(this.player.score, stars);
        this.running = false;
      }
    }

    // HUD update (only when changed)
    this.sendHud();
  }

  private sendHud() {
    const hud: HudState = {
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      score: this.player.score,
      wave: this.worldState.currentWave + 1,
      totalWaves: this.worldState.totalWaves,
      currentAlien: this.player.currentAlien,
      specialCooldownPct: this.player.specialCooldown / this.player.specialMaxCooldown,
    };
    if (this.boss && this.boss.alive) {
      hud.bossHealth = this.boss.health;
      hud.bossMaxHealth = this.boss.maxHealth;
      hud.bossName = BOSS_DEFS[this.boss.bossId].name;
    }
    const json = JSON.stringify(hud);
    if (json !== this.lastHud) {
      this.lastHud = json;
      this.callbacks.onHudUpdate(hud);
    }
  }

  private render() {
    this.renderer.clear();
    this.renderer.drawArena(this.mission.arenaRadius, this.mission.background, this.camera);

    // Draw entities
    for (const e of this.enemies) {
      if (e.alive) this.renderer.drawEnemy(e, this.camera);
    }
    if (this.boss && this.boss.alive) {
      this.renderer.drawBoss(this.boss, this.camera);
    }
    for (const p of this.projectiles) {
      this.renderer.drawProjectile(p, this.camera);
    }
    this.renderer.drawPlayer(this.player, this.camera);
    this.renderer.drawParticles(this.particles, this.camera);

    // UI overlay
    this.renderer.drawJoystick(this.input);
    const specialPct = this.player.specialCooldown / this.player.specialMaxCooldown;
    this.renderer.drawButtons(this.canvas, specialPct);
  }

  // === Commands from React ===
  getCommands(): EngineCommands {
    return {
      selectAlien: (id: AlienId) => {
        switchAlien(this.player, id);
        this.audio.transform();
        this.paused = false;
      },
      pause: () => { this.paused = true; },
      resume: () => { this.paused = false; },
      destroy: () => {
        this.running = false;
        cancelAnimationFrame(this.animFrame);
        this.input.destroy();
        window.removeEventListener('resize', this.resize);
      },
    };
  }

  getUnlockedAliens(): AlienId[] {
    return this.unlockedAliens;
  }

  getCurrentAlien(): AlienId {
    return this.player.currentAlien;
  }
}
