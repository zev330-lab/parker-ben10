import type { PlayerState, AlienId, Vec2, EnemyState, BossState } from '../types';
import { INVINCIBLE_TIME } from '../types';
import { ALIEN_DEFS } from './data';
import { createProjectile, type ProjectileState } from './Projectile';
import type { ParticleSystem } from './Particle';
import type { Audio } from './Audio';
import type { InputState } from './Input';

let nextId = 1;

export function createPlayer(alienId: AlienId): PlayerState {
  const def = ALIEN_DEFS[alienId];
  return {
    id: nextId++,
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    radius: def.radius,
    rotation: 0,
    alive: true,
    currentAlien: alienId,
    health: def.health,
    maxHealth: def.health,
    invincibleTimer: INVINCIBLE_TIME, // start with brief invincibility
    basicCooldown: 0,
    specialCooldown: 0,
    specialMaxCooldown: def.specialAbility.cooldown,
    dashTimer: 0,
    shieldTimer: 0,
    buffTimer: 0,
    score: 0,
    comboCount: 0,
    comboTimer: 0,
    damageDealt: 0,
    damageTaken: 0,
    attackAnim: 0,
    specialAnim: 0,
  };
}

export function switchAlien(player: PlayerState, alienId: AlienId) {
  const def = ALIEN_DEFS[alienId];
  player.currentAlien = alienId;
  player.radius = def.radius;
  // Scale health proportionally
  const pct = player.health / player.maxHealth;
  player.maxHealth = def.health;
  player.health = Math.max(1, Math.round(pct * def.health));
  player.specialMaxCooldown = def.specialAbility.cooldown;
  player.specialCooldown = 0;
}

function findNearestTarget(player: PlayerState, enemies: EnemyState[], boss: BossState | null): Vec2 | null {
  let nearest: Vec2 | null = null;
  let minDist = Infinity;

  for (const e of enemies) {
    if (!e.alive) continue;
    const dx = e.pos.x - player.pos.x;
    const dy = e.pos.y - player.pos.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < minDist) { minDist = d; nearest = e.pos; }
  }

  if (boss && boss.alive) {
    const dx = boss.pos.x - player.pos.x;
    const dy = boss.pos.y - player.pos.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < minDist) { nearest = boss.pos; }
  }

  return nearest;
}

export function updatePlayer(
  player: PlayerState,
  input: InputState,
  dt: number,
  arenaRadius: number,
  enemies: EnemyState[],
  boss: BossState | null,
  projectiles: ProjectileState[],
  particles: ParticleSystem,
  audio: Audio,
) {
  const def = ALIEN_DEFS[player.currentAlien];

  // Timers
  if (player.invincibleTimer > 0) player.invincibleTimer -= dt;
  if (player.basicCooldown > 0) player.basicCooldown -= dt;
  if (player.specialCooldown > 0) player.specialCooldown -= dt;
  if (player.attackAnim > 0) player.attackAnim -= dt;
  if (player.specialAnim > 0) player.specialAnim -= dt;
  if (player.comboTimer > 0) {
    player.comboTimer -= dt;
    if (player.comboTimer <= 0) player.comboCount = 0;
  }
  if (player.dashTimer > 0) {
    player.dashTimer -= dt;
    particles.spawnTrail(player.pos, def.color);
    if (player.dashTimer <= 0) {
      player.vel.x = 0;
      player.vel.y = 0;
    }
    // During dash, still move but skip normal movement
    player.pos.x += player.vel.x * dt;
    player.pos.y += player.vel.y * dt;
    clampToArena(player, arenaRadius);
    return;
  }
  if (player.shieldTimer > 0) player.shieldTimer -= dt;
  if (player.buffTimer > 0) player.buffTimer -= dt;

  // Movement
  const speed = def.speed;
  player.vel.x = input.move.x * speed;
  player.vel.y = input.move.y * speed;
  player.pos.x += player.vel.x * dt;
  player.pos.y += player.vel.y * dt;

  // Face direction of movement or nearest enemy
  if (Math.abs(input.move.x) > 0.1 || Math.abs(input.move.y) > 0.1) {
    player.rotation = Math.atan2(input.move.y, input.move.x);
  }

  clampToArena(player, arenaRadius);

  // Auto-aim target
  const target = findNearestTarget(player, enemies, boss);
  let aimAngle = player.rotation;
  if (target) {
    aimAngle = Math.atan2(target.y - player.pos.y, target.x - player.pos.x);
  }

  // Basic attack (hold to auto-fire)
  if (input.attack && player.basicCooldown <= 0) {
    player.basicCooldown = def.basicAttack.cooldown;
    player.attackAnim = 0.15;
    fireBasicAttack(player, def, aimAngle, projectiles, enemies, boss, particles, audio);
  }

  // Special ability
  if (input.special && player.specialCooldown <= 0) {
    player.specialCooldown = player.specialMaxCooldown;
    player.specialAnim = 0.3;
    fireSpecialAbility(player, def, aimAngle, projectiles, enemies, boss, particles, audio);
  }
}

function fireBasicAttack(
  player: PlayerState,
  def: typeof ALIEN_DEFS[AlienId],
  angle: number,
  projectiles: ProjectileState[],
  enemies: EnemyState[],
  boss: BossState | null,
  particles: ParticleSystem,
  audio: Audio,
) {
  audio.shoot();
  const atk = def.basicAttack;

  if (atk.type === 'projectile') {
    const vx = Math.cos(angle) * atk.projectileSpeed;
    const vy = Math.sin(angle) * atk.projectileSpeed;
    const spawnDist = player.radius + atk.projectileRadius + 4;
    projectiles.push(createProjectile(
      { x: player.pos.x + Math.cos(angle) * spawnDist, y: player.pos.y + Math.sin(angle) * spawnDist },
      { x: vx, y: vy },
      atk.damage, true, atk.projectileRadius, atk.color, atk.piercing,
    ));
  } else if (atk.type === 'melee') {
    // Damage all enemies in range
    const range = atk.range;
    applyMeleeDamage(player, atk.damage, range, enemies, boss, particles, atk.color);
  }
}

function fireSpecialAbility(
  player: PlayerState,
  def: typeof ALIEN_DEFS[AlienId],
  angle: number,
  projectiles: ProjectileState[],
  enemies: EnemyState[],
  boss: BossState | null,
  particles: ParticleSystem,
  audio: Audio,
) {
  audio.special();
  const ability = def.specialAbility;

  switch (ability.type) {
    case 'aoe':
      // Damage all enemies in radius
      applyMeleeDamage(player, ability.damage, ability.range, enemies, boss, particles, ability.color);
      particles.spawnExplosion(player.pos, ability.color, 20);
      break;

    case 'dash': {
      const dashSpeed = ability.projectileSpeed || 500;
      player.vel.x = Math.cos(angle) * dashSpeed;
      player.vel.y = Math.sin(angle) * dashSpeed;
      player.dashTimer = ability.duration;
      player.invincibleTimer = ability.duration;
      audio.dash();
      break;
    }

    case 'shield':
      player.shieldTimer = ability.duration;
      player.invincibleTimer = ability.duration;
      particles.spawnExplosion(player.pos, ability.color, 10);
      break;

    case 'projectile': {
      const vx = Math.cos(angle) * (ability.projectileSpeed || 300);
      const vy = Math.sin(angle) * (ability.projectileSpeed || 300);
      const spawnDist = player.radius + (ability.projectileRadius || 15) + 4;
      projectiles.push(createProjectile(
        { x: player.pos.x + Math.cos(angle) * spawnDist, y: player.pos.y + Math.sin(angle) * spawnDist },
        { x: vx, y: vy },
        ability.damage, true, ability.projectileRadius || 15, ability.color, ability.piercing ?? false,
        2, 'bullet',
      ));
      break;
    }

    case 'buff':
      player.buffTimer = ability.duration;
      particles.spawnExplosion(player.pos, ability.color, 8);
      break;
  }
}

function applyMeleeDamage(
  player: PlayerState,
  damage: number,
  range: number,
  enemies: EnemyState[],
  boss: BossState | null,
  particles: ParticleSystem,
  color: string,
) {
  for (const e of enemies) {
    if (!e.alive) continue;
    const dx = e.pos.x - player.pos.x;
    const dy = e.pos.y - player.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < range + e.radius) {
      e.health -= damage;
      e.hitTimer = 0.15;
      particles.spawnHit(e.pos, color);
    }
  }
  if (boss && boss.alive) {
    const dx = boss.pos.x - player.pos.x;
    const dy = boss.pos.y - player.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < range + boss.radius) {
      boss.health -= damage;
      boss.hitTimer = 0.15;
      particles.spawnHit(boss.pos, color);
    }
  }
}

export function damagePlayer(player: PlayerState, damage: number, particles: ParticleSystem, audio: Audio) {
  if (player.invincibleTimer > 0 || player.shieldTimer > 0) return;

  player.health -= damage;
  player.damageTaken += damage;
  player.invincibleTimer = INVINCIBLE_TIME;
  audio.playerHit();
  particles.spawnHit(player.pos, '#ff0000', 8);
  particles.addFloatingText(player.pos, `-${damage}`, '#ff4444', 22);

  if (player.health <= 0) {
    // Kid-friendly: don't die, reset health with longer invincibility
    player.health = Math.ceil(player.maxHealth * 0.5);
    player.invincibleTimer = 3;
    particles.addFloatingText(player.pos, 'REVIVED!', '#00e500', 24);
  }
}

function clampToArena(player: PlayerState, arenaRadius: number) {
  const dist = Math.sqrt(player.pos.x * player.pos.x + player.pos.y * player.pos.y);
  const maxDist = arenaRadius - player.radius;
  if (dist > maxDist && maxDist > 0) {
    player.pos.x = (player.pos.x / dist) * maxDist;
    player.pos.y = (player.pos.y / dist) * maxDist;
  }
}
