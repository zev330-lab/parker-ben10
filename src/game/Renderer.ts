import type { PlayerState, EnemyState, BossState, ProjectileState, WorldId } from '../types';
import { ALIEN_DEFS } from './data';
import { ENEMY_DEFS } from './data';
import { BOSS_DEFS } from './data';
import type { Camera } from './Camera';
import type { ParticleSystem } from './Particle';
import type { Input } from './Input';

const WORLD_COLORS: Record<WorldId, { bg: string; grid: string; edge: string }> = {
  bellwood: { bg: '#0a0a18', grid: '#151528', edge: '#3949ab' },
  desert:   { bg: '#1a1005', grid: '#2a1a08', edge: '#e65100' },
  shadow:   { bg: '#050a05', grid: '#0a150a', edge: '#2e7d32' },
  ocean:    { bg: '#030a10', grid: '#061520', edge: '#006688' },
  vilgax:   { bg: '#0a0515', grid: '#150a20', edge: '#4a148c' },
};

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  clear() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawArena(arenaRadius: number, worldId: WorldId, camera: Camera) {
    const ctx = this.ctx;
    camera.apply(ctx);
    const colors = WORLD_COLORS[worldId];

    // Arena fill
    ctx.beginPath();
    ctx.arc(0, 0, arenaRadius, 0, Math.PI * 2);
    ctx.fillStyle = colors.bg;
    ctx.fill();

    // Grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = -arenaRadius; x <= arenaRadius; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -arenaRadius);
      ctx.lineTo(x, arenaRadius);
      ctx.stroke();
    }
    for (let y = -arenaRadius; y <= arenaRadius; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-arenaRadius, y);
      ctx.lineTo(arenaRadius, y);
      ctx.stroke();
    }

    // Arena edge
    ctx.beginPath();
    ctx.arc(0, 0, arenaRadius, 0, Math.PI * 2);
    ctx.strokeStyle = colors.edge;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Inner ring decorations
    ctx.beginPath();
    ctx.arc(0, 0, arenaRadius * 0.6, 0, Math.PI * 2);
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawPlayer(player: PlayerState, camera: Camera) {
    const ctx = this.ctx;
    camera.apply(ctx);
    const def = ALIEN_DEFS[player.currentAlien];
    const { x, y } = player.pos;
    const r = player.radius;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(player.rotation);

    // Invincibility flash
    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 10) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Shield visual
    if (player.shieldTimer > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, r + 12, 0, Math.PI * 2);
      ctx.strokeStyle = def.accentColor;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.6;
      ctx.stroke();
      ctx.globalAlpha = player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 10) % 2 === 0 ? 0.4 : 1;
    }

    // Body
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = def.color;
    ctx.fill();
    ctx.strokeStyle = def.accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Direction indicator
    ctx.beginPath();
    ctx.moveTo(r * 0.5, 0);
    ctx.lineTo(r + 6, 0);
    ctx.strokeStyle = def.accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Initial letter
    ctx.rotate(-player.rotation); // unrotate for text
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.round(r * 0.8)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def.name[0], 0, 1);

    // Attack animation
    if (player.attackAnim > 0) {
      ctx.rotate(player.rotation);
      ctx.beginPath();
      ctx.arc(r + 5, 0, r * 0.6, -0.5, 0.5);
      ctx.strokeStyle = def.basicAttack.color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = player.attackAnim / 0.15;
      ctx.stroke();
    }

    // Special animation
    if (player.specialAnim > 0) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      camera.apply(ctx);
      ctx.translate(x, y);
      ctx.beginPath();
      const specialR = r * 1.5 * (1 - player.specialAnim / 0.3);
      ctx.arc(0, 0, specialR + r, 0, Math.PI * 2);
      ctx.strokeStyle = def.specialAbility.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = player.specialAnim / 0.3;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawEnemy(enemy: EnemyState, camera: Camera) {
    const ctx = this.ctx;
    camera.apply(ctx);
    const def = ENEMY_DEFS[enemy.type];
    const { x, y } = enemy.pos;
    const r = enemy.radius;

    ctx.save();
    ctx.translate(x, y);

    // Hit flash
    if (enemy.hitTimer > 0) {
      ctx.globalAlpha = 0.6;
    }

    // Draw shape based on type
    ctx.fillStyle = def.color;
    ctx.strokeStyle = def.accentColor;
    ctx.lineWidth = 2;

    switch (enemy.type) {
      case 'robot': {
        // Square body
        ctx.fillRect(-r, -r, r * 2, r * 2);
        ctx.strokeRect(-r, -r, r * 2, r * 2);
        // Eye
        ctx.fillStyle = def.accentColor;
        ctx.fillRect(-r * 0.3, -r * 0.3, r * 0.6, r * 0.3);
        break;
      }
      case 'drone': {
        // Diamond
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Center dot
        ctx.fillStyle = def.accentColor;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'turret': {
        // Hexagon base
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Barrel pointing at player
        ctx.rotate(enemy.rotation);
        ctx.fillStyle = def.accentColor;
        ctx.fillRect(0, -3, r + 8, 6);
        break;
      }
      case 'charger': {
        // Triangle (pointing forward)
        ctx.rotate(enemy.rotation);
        ctx.beginPath();
        ctx.moveTo(r + 4, 0);
        ctx.lineTo(-r, -r * 0.8);
        ctx.lineTo(-r, r * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Telegraph flash for charging
        if (enemy.aiState === 'charge_telegraph') {
          ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.02) * 0.3;
          ctx.fillStyle = '#ff0000';
          ctx.fill();
        }
        break;
      }
    }

    ctx.restore();

    // Health bar
    if (enemy.health < enemy.maxHealth) {
      camera.apply(ctx);
      const barW = r * 2;
      const barH = 4;
      const barY = y - r - 8;
      ctx.fillStyle = '#333';
      ctx.fillRect(x - barW / 2, barY, barW, barH);
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(x - barW / 2, barY, barW * (enemy.health / enemy.maxHealth), barH);
    }
  }

  drawBoss(boss: BossState, camera: Camera) {
    const ctx = this.ctx;
    camera.apply(ctx);
    const def = BOSS_DEFS[boss.bossId];
    const { x, y } = boss.pos;
    const r = boss.radius;

    ctx.save();
    ctx.translate(x, y);

    // Hit flash
    if (boss.hitTimer > 0) {
      ctx.globalAlpha = 0.6;
    }

    // Outer ring
    ctx.beginPath();
    ctx.arc(0, 0, r + 5, 0, Math.PI * 2);
    ctx.strokeStyle = def.accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = def.color;
    ctx.fill();
    ctx.strokeStyle = def.accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner detail - menacing eyes
    const eyeSize = r * 0.15;
    ctx.fillStyle = def.accentColor;
    ctx.beginPath();
    ctx.arc(-r * 0.25, -r * 0.1, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(r * 0.25, -r * 0.1, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Phase indicator lines
    const hpPct = boss.health / boss.maxHealth;
    const segments = def.phases.length;
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.6, a, a + (1 / segments) * Math.PI * 2 * hpPct);
      ctx.strokeStyle = i <= boss.phaseIndex ? def.accentColor : '#333';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Telegraph indicator
    if (boss.telegraphTimer > 0 && boss.telegraphPos) {
      ctx.restore();
      camera.apply(ctx);
      ctx.beginPath();
      ctx.setLineDash([8, 8]);
      ctx.moveTo(boss.pos.x, boss.pos.y);
      ctx.lineTo(boss.telegraphPos.x, boss.telegraphPos.y);
      ctx.strokeStyle = '#ff000088';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      // Target circle
      ctx.beginPath();
      ctx.arc(boss.telegraphPos.x, boss.telegraphPos.y, 20, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff000088';
      ctx.lineWidth = 2;
      ctx.stroke();
      return;
    }

    ctx.restore();
  }

  drawProjectile(proj: ProjectileState, camera: Camera) {
    const ctx = this.ctx;
    camera.apply(ctx);

    if (proj.projType === 'aoe_ring') {
      // Expanding ring
      const alpha = proj.lifetime / proj.maxLifetime;
      ctx.beginPath();
      ctx.arc(proj.pos.x, proj.pos.y, proj.radius * (1 - alpha * 0.5), 0, Math.PI * 2);
      ctx.strokeStyle = proj.color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = alpha;
      ctx.stroke();
      ctx.globalAlpha = 1;
      return;
    }

    if (proj.projType === 'wave') {
      const alpha = proj.lifetime / proj.maxLifetime;
      ctx.beginPath();
      ctx.arc(proj.pos.x, proj.pos.y, proj.radius, 0, Math.PI * 2);
      ctx.fillStyle = proj.color;
      ctx.globalAlpha = alpha * 0.4;
      ctx.fill();
      ctx.globalAlpha = 1;
      return;
    }

    // Standard bullet
    ctx.save();
    ctx.translate(proj.pos.x, proj.pos.y);
    ctx.rotate(proj.rotation);

    // Glow
    ctx.beginPath();
    ctx.arc(0, 0, proj.radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = proj.color + '44';
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
    ctx.fillStyle = proj.color;
    ctx.fill();

    // Trail
    if (proj.fromPlayer) {
      ctx.beginPath();
      ctx.moveTo(-proj.radius, 0);
      ctx.lineTo(-proj.radius * 3, -proj.radius * 0.5);
      ctx.lineTo(-proj.radius * 3, proj.radius * 0.5);
      ctx.closePath();
      ctx.fillStyle = proj.color + '66';
      ctx.fill();
    }

    ctx.restore();
  }

  drawParticles(particles: ParticleSystem, camera: Camera) {
    const ctx = this.ctx;
    camera.apply(ctx);

    for (const p of particles.particles) {
      const alpha = p.lifetime / p.maxLifetime;
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.radius * alpha, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const ft of particles.floatingTexts) {
      const alpha = ft.lifetime / ft.maxLifetime;
      ctx.font = `bold ${ft.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = alpha;
      ctx.fillText(ft.text, ft.pos.x, ft.pos.y);
    }
    ctx.globalAlpha = 1;
  }

  drawJoystick(input: Input) {
    if (!input.joystickActive) return;
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Outer ring
    ctx.beginPath();
    ctx.arc(input.joystickOrigin.x, input.joystickOrigin.y, 60, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner thumb
    ctx.beginPath();
    ctx.arc(input.joystickPos.x, input.joystickPos.y, 25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
  }

  drawButtons(canvas: HTMLCanvasElement, specialCooldownPct: number) {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const w = canvas.width;
    const h = canvas.height;

    // Attack button (bottom-right)
    const atkX = w - 80;
    const atkY = h - 80;
    ctx.beginPath();
    ctx.arc(atkX, atkY, 40, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,68,68,0.35)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,68,68,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ATK', atkX, atkY);

    // Special button (above attack)
    const spcX = w - 140;
    const spcY = h - 75;
    ctx.beginPath();
    ctx.arc(spcX, spcY, 30, 0, Math.PI * 2);
    const canUse = specialCooldownPct <= 0;
    ctx.fillStyle = canUse ? 'rgba(0,229,0,0.35)' : 'rgba(100,100,100,0.25)';
    ctx.fill();
    ctx.strokeStyle = canUse ? 'rgba(0,229,0,0.6)' : 'rgba(100,100,100,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Cooldown arc
    if (specialCooldownPct > 0) {
      ctx.beginPath();
      ctx.moveTo(spcX, spcY);
      ctx.arc(spcX, spcY, 30, -Math.PI / 2, -Math.PI / 2 + (1 - specialCooldownPct) * Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0,229,0,0.15)';
      ctx.fill();
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('SPL', spcX, spcY);

    // Omnitrix button (top-right)
    const omniX = w - 45;
    const omniY = 45;
    ctx.beginPath();
    ctx.arc(omniX, omniY, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,229,0,0.3)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,229,0,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Hourglass icon
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(omniX - 7, omniY - 9);
    ctx.lineTo(omniX + 7, omniY - 9);
    ctx.lineTo(omniX, omniY);
    ctx.lineTo(omniX + 7, omniY + 9);
    ctx.lineTo(omniX - 7, omniY + 9);
    ctx.lineTo(omniX, omniY);
    ctx.closePath();
    ctx.stroke();

    return {
      attack: { x: atkX - 40, y: atkY - 40, w: 80, h: 80 },
      special: { x: spcX - 30, y: spcY - 30, w: 60, h: 60 },
      omnitrix: { x: omniX - 22, y: omniY - 22, w: 44, h: 44 },
    };
  }
}
