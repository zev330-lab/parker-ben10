import type { EnemyState, EnemyType, PlayerState, Vec2 } from '../types';
export type { EnemyState };
import { ENEMY_DEFS } from './data';
import { createProjectile, type ProjectileState } from './Projectile';
import type { ParticleSystem } from './Particle';
import type { Audio } from './Audio';

let nextEnemyId = 5000;

export function createEnemy(type: EnemyType, pos: Vec2): EnemyState {
  const def = ENEMY_DEFS[type];
  return {
    id: nextEnemyId++,
    pos: { ...pos },
    vel: { x: 0, y: 0 },
    radius: def.radius,
    rotation: 0,
    alive: true,
    type,
    health: def.health,
    maxHealth: def.health,
    hitTimer: 0,
    attackCooldown: Math.random() * def.attackCooldown, // stagger initial attacks
    aiState: 'chase',
    aiTimer: 0,
    targetAngle: 0,
  };
}

export function spawnEnemyAtEdge(type: EnemyType, arenaRadius: number): EnemyState {
  const angle = Math.random() * Math.PI * 2;
  const r = arenaRadius - 20;
  return createEnemy(type, { x: Math.cos(angle) * r, y: Math.sin(angle) * r });
}

export function updateEnemies(
  enemies: EnemyState[],
  player: PlayerState,
  dt: number,
  arenaRadius: number,
  projectiles: ProjectileState[],
  particles: ParticleSystem,
  audio: Audio,
) {
  for (const e of enemies) {
    if (!e.alive) continue;
    if (e.hitTimer > 0) e.hitTimer -= dt;
    if (e.attackCooldown > 0) e.attackCooldown -= dt;

    const def = ENEMY_DEFS[e.type];
    const dx = player.pos.x - e.pos.x;
    const dy = player.pos.y - e.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angleToPlayer = Math.atan2(dy, dx);
    e.rotation = angleToPlayer;

    switch (e.type) {
      case 'robot':
        updateRobot(e, def, player, dx, dy, dist, angleToPlayer, dt, particles, audio);
        break;
      case 'drone':
        updateDrone(e, def, player, dx, dy, dist, angleToPlayer, dt, projectiles, audio);
        break;
      case 'turret':
        updateTurret(e, def, angleToPlayer, dist, dt, projectiles, audio);
        break;
      case 'charger':
        updateCharger(e, def, player, dx, dy, dist, angleToPlayer, dt, particles, audio);
        break;
    }

    // Clamp to arena
    clampEntity(e, arenaRadius);
  }

  // Push enemies apart
  for (let i = 0; i < enemies.length; i++) {
    for (let j = i + 1; j < enemies.length; j++) {
      const a = enemies[i], b = enemies[j];
      if (!a.alive || !b.alive) continue;
      const dx = b.pos.x - a.pos.x;
      const dy = b.pos.y - a.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.radius + b.radius;
      if (dist < minDist && dist > 0) {
        const push = (minDist - dist) / 2;
        const nx = dx / dist, ny = dy / dist;
        a.pos.x -= nx * push;
        a.pos.y -= ny * push;
        b.pos.x += nx * push;
        b.pos.y += ny * push;
      }
    }
  }
}

function updateRobot(
  e: EnemyState, def: typeof ENEMY_DEFS[EnemyType],
  player: PlayerState,
  _dx: number, _dy: number, dist: number, angle: number,
  dt: number, _particles: ParticleSystem, _audio: Audio,
) {
  // Walk toward player, melee attack
  if (dist > def.radius + player.radius + 5) {
    e.pos.x += Math.cos(angle) * def.speed * dt;
    e.pos.y += Math.sin(angle) * def.speed * dt;
  }
  if (dist < def.radius + player.radius + 10 && e.attackCooldown <= 0) {
    e.attackCooldown = def.attackCooldown;
    // Melee hit handled by collision in Engine
  }
}

function updateDrone(
  e: EnemyState, def: typeof ENEMY_DEFS[EnemyType],
  _player: PlayerState,
  _dx: number, _dy: number, dist: number, angle: number,
  dt: number, projectiles: ProjectileState[], audio: Audio,
) {
  // Keep distance, shoot
  const idealDist = 180;
  if (dist > idealDist + 30) {
    e.pos.x += Math.cos(angle) * def.speed * dt;
    e.pos.y += Math.sin(angle) * def.speed * dt;
  } else if (dist < idealDist - 30) {
    e.pos.x -= Math.cos(angle) * def.speed * 0.5 * dt;
    e.pos.y -= Math.sin(angle) * def.speed * 0.5 * dt;
  } else {
    // Strafe
    e.pos.x += Math.cos(angle + Math.PI / 2) * def.speed * 0.3 * dt;
    e.pos.y += Math.sin(angle + Math.PI / 2) * def.speed * 0.3 * dt;
  }

  if (e.attackCooldown <= 0 && dist < 400) {
    e.attackCooldown = def.attackCooldown;
    const speed = 200;
    projectiles.push(createProjectile(
      { x: e.pos.x, y: e.pos.y },
      { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
      def.damage, false, 5, '#ff4444',
    ));
    audio.shoot();
  }
}

function updateTurret(
  e: EnemyState, def: typeof ENEMY_DEFS[EnemyType],
  angle: number, dist: number,
  _dt: number, projectiles: ProjectileState[], audio: Audio,
) {
  // Stationary, shoots in patterns
  if (e.attackCooldown <= 0 && dist < 450) {
    e.attackCooldown = def.attackCooldown;
    // Fire 3 bullets in spread
    const spread = 0.3;
    for (let i = -1; i <= 1; i++) {
      const a = angle + i * spread;
      const speed = 180;
      projectiles.push(createProjectile(
        { x: e.pos.x, y: e.pos.y },
        { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
        def.damage, false, 5, '#ff0000',
      ));
    }
    audio.shoot();
  }
}

function updateCharger(
  e: EnemyState, def: typeof ENEMY_DEFS[EnemyType],
  _player: PlayerState,
  _dx: number, _dy: number, dist: number, angle: number,
  dt: number, particles: ParticleSystem, audio: Audio,
) {
  e.aiTimer -= dt;

  switch (e.aiState) {
    case 'chase':
      e.pos.x += Math.cos(angle) * def.speed * dt;
      e.pos.y += Math.sin(angle) * def.speed * dt;
      if (dist < 200 && e.attackCooldown <= 0) {
        e.aiState = 'charge_telegraph';
        e.aiTimer = 0.6;
        e.targetAngle = angle;
        e.attackCooldown = def.attackCooldown;
      }
      break;
    case 'charge_telegraph':
      // Flash/shake to telegraph
      if (e.aiTimer <= 0) {
        e.aiState = 'charging';
        e.aiTimer = 0.4;
        audio.dash();
      }
      break;
    case 'charging':
      e.pos.x += Math.cos(e.targetAngle) * 400 * dt;
      e.pos.y += Math.sin(e.targetAngle) * 400 * dt;
      particles.spawnTrail(e.pos, def.color);
      if (e.aiTimer <= 0) {
        e.aiState = 'chase';
        e.aiTimer = 1;
      }
      break;
  }
}

export function killEnemy(e: EnemyState, player: PlayerState, particles: ParticleSystem, audio: Audio) {
  e.alive = false;
  audio.enemyDie();
  particles.spawnExplosion(e.pos, ENEMY_DEFS[e.type].color, 12);

  // Score
  const baseScore = 100;
  player.comboCount++;
  player.comboTimer = 2;
  const combo = player.comboCount;
  const score = baseScore * Math.min(combo, 5);
  player.score += score;
  player.damageDealt += 1;
  particles.addFloatingText(e.pos, `+${score}`, '#ffcc00', combo > 1 ? 20 : 16);
  if (combo > 1) {
    particles.addFloatingText(
      { x: e.pos.x, y: e.pos.y - 20 },
      `${combo}x COMBO!`, '#ff8800', 14,
    );
  }
}

function clampEntity(e: EnemyState, arenaRadius: number) {
  const dist = Math.sqrt(e.pos.x * e.pos.x + e.pos.y * e.pos.y);
  const max = arenaRadius - e.radius;
  if (dist > max && max > 0) {
    e.pos.x = (e.pos.x / dist) * max;
    e.pos.y = (e.pos.y / dist) * max;
  }
}
