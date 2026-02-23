import type { ProjectileState, Vec2 } from '../types';
export type { ProjectileState };

let nextProjId = 10000;

export function createProjectile(
  pos: Vec2,
  vel: Vec2,
  damage: number,
  fromPlayer: boolean,
  radius: number,
  color: string,
  piercing = false,
  lifetime = 3,
  projType: ProjectileState['projType'] = 'bullet',
): ProjectileState {
  return {
    id: nextProjId++,
    pos: { ...pos },
    vel: { ...vel },
    radius,
    rotation: Math.atan2(vel.y, vel.x),
    alive: true,
    damage,
    fromPlayer,
    lifetime,
    maxLifetime: lifetime,
    piercing,
    hitIds: new Set(),
    color,
    projType,
  };
}

export function updateProjectiles(projectiles: ProjectileState[], dt: number, arenaRadius: number) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    if (!p.alive) { projectiles.splice(i, 1); continue; }

    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;
    p.rotation = Math.atan2(p.vel.y, p.vel.x);
    p.lifetime -= dt;

    // Out of arena or expired
    const dist = Math.sqrt(p.pos.x * p.pos.x + p.pos.y * p.pos.y);
    if (p.lifetime <= 0 || dist > arenaRadius + 50) {
      p.alive = false;
      projectiles.splice(i, 1);
    }
  }
}
