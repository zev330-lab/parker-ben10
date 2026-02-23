import type { ParticleState, FloatingText, Vec2 } from '../types';

export class ParticleSystem {
  particles: ParticleState[] = [];
  floatingTexts: FloatingText[] = [];

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.vel.x *= 0.98;
      p.vel.y *= 0.98;
      p.lifetime -= dt;
      if (p.lifetime <= 0) {
        this.particles.splice(i, 1);
      }
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.pos.y -= 40 * dt;
      ft.lifetime -= dt;
      if (ft.lifetime <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  spawnHit(pos: Vec2, color: string, count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        pos: { x: pos.x, y: pos.y },
        vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        color,
        radius: 2 + Math.random() * 3,
        lifetime: 0.3 + Math.random() * 0.3,
        maxLifetime: 0.6,
      });
    }
  }

  spawnExplosion(pos: Vec2, color: string, count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 180;
      this.particles.push({
        pos: { x: pos.x, y: pos.y },
        vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        color,
        radius: 3 + Math.random() * 5,
        lifetime: 0.4 + Math.random() * 0.5,
        maxLifetime: 0.9,
      });
    }
  }

  spawnTrail(pos: Vec2, color: string) {
    this.particles.push({
      pos: { x: pos.x + (Math.random() - 0.5) * 8, y: pos.y + (Math.random() - 0.5) * 8 },
      vel: { x: (Math.random() - 0.5) * 20, y: (Math.random() - 0.5) * 20 },
      color,
      radius: 2 + Math.random() * 3,
      lifetime: 0.15 + Math.random() * 0.15,
      maxLifetime: 0.3,
    });
  }

  addFloatingText(pos: Vec2, text: string, color: string, size = 18) {
    this.floatingTexts.push({
      pos: { x: pos.x, y: pos.y },
      text,
      color,
      size,
      lifetime: 0.8,
      maxLifetime: 0.8,
    });
  }

  clear() {
    this.particles.length = 0;
    this.floatingTexts.length = 0;
  }
}
