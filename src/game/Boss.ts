import type { BossState, BossId, PlayerState } from '../types';
import { BOSS_DEFS } from './data';
import { createProjectile, type ProjectileState } from './Projectile';
import { spawnEnemyAtEdge, type EnemyState } from './Enemy';
import type { ParticleSystem } from './Particle';
import type { Audio } from './Audio';

let bossIdCounter = 9000;

const ENEMY_TYPES = ['robot', 'drone', 'turret', 'charger'] as const;

export function createBoss(bossId: BossId, arenaRadius: number): BossState {
  const def = BOSS_DEFS[bossId];
  return {
    id: bossIdCounter++,
    pos: { x: 0, y: -arenaRadius * 0.5 },
    vel: { x: 0, y: 0 },
    radius: def.radius,
    rotation: 0,
    alive: true,
    bossId,
    health: def.health,
    maxHealth: def.health,
    phaseIndex: 0,
    patternIndex: 0,
    patternTimer: 0,
    hitTimer: 0,
    attackCooldown: 1,
    telegraphTimer: 0,
    telegraphPos: null,
  };
}

export function updateBoss(
  boss: BossState,
  player: PlayerState,
  dt: number,
  arenaRadius: number,
  projectiles: ProjectileState[],
  enemies: EnemyState[],
  particles: ParticleSystem,
  audio: Audio,
): EnemyState[] {
  if (!boss.alive) return [];
  const spawned: EnemyState[] = [];

  const def = BOSS_DEFS[boss.bossId];
  if (boss.hitTimer > 0) boss.hitTimer -= dt;
  if (boss.attackCooldown > 0) boss.attackCooldown -= dt;
  if (boss.telegraphTimer > 0) boss.telegraphTimer -= dt;

  // Determine phase
  const hpPct = boss.health / boss.maxHealth;
  let phaseIdx = 0;
  for (let i = def.phases.length - 1; i >= 0; i--) {
    if (hpPct <= def.phases[i].healthThreshold) { phaseIdx = i; }
  }
  if (phaseIdx !== boss.phaseIndex) {
    boss.phaseIndex = phaseIdx;
    boss.patternIndex = 0;
    boss.patternTimer = 0;
    particles.spawnExplosion(boss.pos, def.accentColor, 20);
    audio.bossAppear();
  }

  const phase = def.phases[boss.phaseIndex];
  const pattern = phase.patterns[boss.patternIndex];
  boss.patternTimer -= dt;

  if (boss.patternTimer <= 0) {
    // Advance to next pattern
    boss.patternIndex = (boss.patternIndex + 1) % phase.patterns.length;
    boss.patternTimer = phase.patterns[boss.patternIndex].duration;
    boss.attackCooldown = 0.5;
  }

  // Face player
  const dx = player.pos.x - boss.pos.x;
  const dy = player.pos.y - boss.pos.y;
  const angleToPlayer = Math.atan2(dy, dx);
  boss.rotation = angleToPlayer;

  // Execute current pattern
  switch (pattern.type) {
    case 'chase':
      boss.pos.x += Math.cos(angleToPlayer) * phase.speed * dt;
      boss.pos.y += Math.sin(angleToPlayer) * phase.speed * dt;
      break;

    case 'shoot':
      // Move slowly toward player
      boss.pos.x += Math.cos(angleToPlayer) * phase.speed * 0.3 * dt;
      boss.pos.y += Math.sin(angleToPlayer) * phase.speed * 0.3 * dt;
      if (boss.attackCooldown <= 0) {
        boss.attackCooldown = pattern.cooldown;
        const count = pattern.params.count || 3;
        const spread = pattern.params.spread || 0.3;
        for (let i = 0; i < count; i++) {
          const a = angleToPlayer + (i - (count - 1) / 2) * spread;
          const speed = 200;
          projectiles.push(createProjectile(
            { ...boss.pos }, { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
            2, false, 7, def.accentColor,
          ));
        }
        audio.shoot();
      }
      break;

    case 'spiral':
      // Stay mostly still, fire rotating spiral
      if (boss.attackCooldown <= 0) {
        boss.attackCooldown = pattern.params.interval || 0.15;
        const arms = pattern.params.arms || 3;
        const rotSpeed = pattern.params.rotSpeed || 2;
        const elapsed = pattern.duration - boss.patternTimer;
        const baseAngle = elapsed * rotSpeed;
        for (let i = 0; i < arms; i++) {
          const a = baseAngle + (i / arms) * Math.PI * 2;
          const speed = 160;
          projectiles.push(createProjectile(
            { ...boss.pos }, { x: Math.cos(a) * speed, y: Math.sin(a) * speed },
            1, false, 5, def.accentColor, false, 2.5,
          ));
        }
      }
      break;

    case 'charge':
      if (boss.telegraphTimer > 0) {
        // Telegraph phase - boss glows
        particles.spawnTrail(boss.pos, '#ff0000');
      } else if (boss.telegraphPos === null) {
        // Start telegraph
        boss.telegraphTimer = 0.7;
        boss.telegraphPos = { ...player.pos };
        audio.dash();
      } else {
        // Charge toward telegraph position
        const tdx = boss.telegraphPos.x - boss.pos.x;
        const tdy = boss.telegraphPos.y - boss.pos.y;
        const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
        if (tdist > 20) {
          const chargeSpeed = phase.speed * 3;
          boss.pos.x += (tdx / tdist) * chargeSpeed * dt;
          boss.pos.y += (tdy / tdist) * chargeSpeed * dt;
          particles.spawnTrail(boss.pos, def.color);
        } else {
          boss.telegraphPos = null;
          particles.spawnExplosion(boss.pos, def.accentColor, 10);
        }
      }
      break;

    case 'summon': {
      if (boss.attackCooldown <= 0 && enemies.filter(e => e.alive).length < 12) {
        boss.attackCooldown = pattern.duration; // only summon once per pattern
        const count = pattern.params.count || 3;
        const typeIdx = pattern.params.type ?? 0;
        const enemyType = ENEMY_TYPES[Math.min(typeIdx, ENEMY_TYPES.length - 1)];
        for (let i = 0; i < count; i++) {
          spawned.push(spawnEnemyAtEdge(enemyType, arenaRadius));
        }
        particles.spawnExplosion(boss.pos, '#ff00ff', 15);
        audio.waveStart();
      }
      break;
    }

    case 'aoe': {
      // Expanding ring attack
      if (boss.attackCooldown <= 0) {
        boss.attackCooldown = pattern.duration; // one AOE per pattern cycle
        const radius = pattern.params.radius || 120;
        projectiles.push(createProjectile(
          { ...boss.pos }, { x: 0, y: 0 },
          2, false, radius, def.accentColor + '44', false, 0.8, 'aoe_ring',
        ));
        particles.spawnExplosion(boss.pos, def.accentColor, 18);
        audio.special();
      }
      break;
    }
  }

  // Clamp boss to arena
  const bDist = Math.sqrt(boss.pos.x * boss.pos.x + boss.pos.y * boss.pos.y);
  const maxDist = arenaRadius - boss.radius;
  if (bDist > maxDist && maxDist > 0) {
    boss.pos.x = (boss.pos.x / bDist) * maxDist;
    boss.pos.y = (boss.pos.y / bDist) * maxDist;
  }

  return spawned;
}

export function killBoss(boss: BossState, player: PlayerState, particles: ParticleSystem, audio: Audio) {
  boss.alive = false;
  particles.spawnExplosion(boss.pos, '#ffcc00', 30);
  particles.spawnExplosion(boss.pos, '#ff4444', 25);
  particles.addFloatingText(boss.pos, 'BOSS DEFEATED!', '#ffcc00', 32);
  player.score += 1000;
  audio.levelComplete();
}
