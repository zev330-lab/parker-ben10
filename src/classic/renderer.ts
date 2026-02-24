import type {
  Player, Enemy, Projectile, Particle, Camera, LevelData,
} from './types';
import {
  AlienType,
  VIRTUAL_WIDTH, VIRTUAL_HEIGHT, GROUND_Y, ALIEN_STATS,
  GameState,
} from './types';
import type { InputManager } from './input';

// Colors
const OMNITRIX_GREEN = '#00e500';
const OMNITRIX_DARK = '#003300';
const HUD_BG = 'rgba(0,0,0,0.5)';

// Pre-generate stars for space bg
const stars: { x: number; y: number; size: number; brightness: number }[] = [];
for (let i = 0; i < 200; i++) {
  stars.push({
    x: Math.random() * 6000,
    y: Math.random() * GROUND_Y,
    size: Math.random() * 2.5 + 0.5,
    brightness: Math.random() * 0.5 + 0.5,
  });
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private time = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  render(
    state: GameState,
    player: Player,
    enemies: Enemy[],
    projectiles: Projectile[],
    particles: Particle[],
    camera: Camera,
    level: LevelData,
    levelIndex: number,
    score: number,
    input: InputManager,
    stateTimer: number,
    totalTime: number,
  ) {
    const ctx = this.ctx;
    this.time = totalTime;

    ctx.save();

    if (state === GameState.SPLASH) {
      this.drawSplash(stateTimer);
    } else if (state === GameState.LEVEL_INTRO) {
      this.drawBackground(level, camera);
      this.drawLevelIntro(levelIndex, level, stateTimer);
    } else if (state === GameState.PLAYING || state === GameState.ALIEN_SELECT) {
      this.drawBackground(level, camera);
      this.drawEntities(player, enemies, projectiles, particles, camera);
      this.drawHUD(player, score, levelIndex);
      this.drawControls(input, player);
      if (state === GameState.ALIEN_SELECT) {
        this.drawAlienSelectWheel(player.unlockedAliens);
      }
    } else if (state === GameState.LEVEL_COMPLETE) {
      this.drawBackground(level, camera);
      this.drawEntities(player, enemies, projectiles, particles, camera);
      this.drawLevelComplete(levelIndex, score, stateTimer);
    } else if (state === GameState.VICTORY) {
      this.drawBackground(level, camera);
      this.drawEntities(player, enemies, projectiles, particles, camera);
      this.drawVictory(score, stateTimer);
    }

    ctx.restore();
  }

  // ============ BACKGROUNDS ============

  drawBackground(level: LevelData, camera: Camera) {
    switch (level.background) {
      case 'city': this.drawCityBg(camera); break;
      case 'desert': this.drawDesertBg(camera); break;
      case 'forest': this.drawForestBg(camera); break;
      case 'space': this.drawSpaceBg(camera); break;
    }
  }

  drawCityBg(camera: Camera) {
    const ctx = this.ctx;
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, '#1a237e');
    skyGrad.addColorStop(0.5, '#3949ab');
    skyGrad.addColorStop(1, '#7986cb');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, GROUND_Y);

    // Clouds (far layer, slow parallax)
    const cloudOffset = -camera.x * 0.1;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    for (let i = 0; i < 8; i++) {
      const cx = ((i * 350 + cloudOffset) % (VIRTUAL_WIDTH + 300)) - 150;
      const cy = 50 + (i % 3) * 60;
      this.drawCloud(cx, cy, 60 + (i % 3) * 20);
    }

    // Far buildings (slow parallax)
    const farOffset = -camera.x * 0.3;
    ctx.fillStyle = '#283593';
    for (let i = 0; i < 15; i++) {
      const bx = ((i * 200 + farOffset) % (VIRTUAL_WIDTH + 200)) - 100;
      const bh = 100 + (i * 37 % 120);
      ctx.fillRect(bx, GROUND_Y - bh, 80, bh);
      // Windows
      ctx.fillStyle = '#ffeb3b44';
      for (let wy = GROUND_Y - bh + 15; wy < GROUND_Y - 10; wy += 25) {
        for (let wx = bx + 10; wx < bx + 70; wx += 20) {
          if (Math.random() > 0.3 || true) {
            ctx.fillRect(wx, wy, 8, 12);
          }
        }
      }
      ctx.fillStyle = '#283593';
    }

    // Near buildings (medium parallax)
    const nearOffset = -camera.x * 0.6;
    ctx.fillStyle = '#1a237e';
    for (let i = 0; i < 12; i++) {
      const bx = ((i * 250 + nearOffset) % (VIRTUAL_WIDTH + 250)) - 125;
      const bh = 150 + (i * 53 % 150);
      ctx.fillRect(bx, GROUND_Y - bh, 100, bh);
      ctx.fillStyle = '#ffab0044';
      for (let wy = GROUND_Y - bh + 20; wy < GROUND_Y - 10; wy += 30) {
        for (let wx = bx + 15; wx < bx + 85; wx += 25) {
          ctx.fillRect(wx, wy, 10, 15);
        }
      }
      ctx.fillStyle = '#1a237e';
    }

    // Ground
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(0, GROUND_Y, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - GROUND_Y);
    ctx.fillStyle = '#455a64';
    ctx.fillRect(0, GROUND_Y, VIRTUAL_WIDTH, 4);
    // Road markings
    ctx.fillStyle = '#ffd600';
    const roadOff = -camera.x * 1;
    for (let i = 0; i < 20; i++) {
      const rx = ((i * 120 + roadOff) % (VIRTUAL_WIDTH + 120)) - 60;
      ctx.fillRect(rx, GROUND_Y + 40, 50, 4);
    }
  }

  drawDesertBg(camera: Camera) {
    const ctx = this.ctx;
    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, '#ff8f00');
    skyGrad.addColorStop(0.4, '#ffb74d');
    skyGrad.addColorStop(1, '#ffe0b2');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, GROUND_Y);

    // Sun
    ctx.fillStyle = '#fff9c4';
    ctx.beginPath();
    ctx.arc(200, 80, 50, 0, Math.PI * 2);
    ctx.fill();

    // Far mesas
    const farOff = -camera.x * 0.2;
    ctx.fillStyle = '#bf360c88';
    for (let i = 0; i < 6; i++) {
      const mx = ((i * 400 + farOff) % (VIRTUAL_WIDTH + 400)) - 200;
      const mw = 200 + (i % 3) * 80;
      const mh = 80 + (i % 2) * 40;
      ctx.fillRect(mx, GROUND_Y - mh, mw, mh);
      ctx.fillRect(mx + mw * 0.2, GROUND_Y - mh - 30, mw * 0.6, 30);
    }

    // Cacti
    const midOff = -camera.x * 0.5;
    ctx.fillStyle = '#2e7d32';
    for (let i = 0; i < 10; i++) {
      const cx = ((i * 300 + midOff) % (VIRTUAL_WIDTH + 300)) - 150;
      this.drawCactus(cx, GROUND_Y, 40 + (i % 3) * 15);
    }

    // Ground
    ctx.fillStyle = '#e8c06a';
    ctx.fillRect(0, GROUND_Y, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - GROUND_Y);
    ctx.fillStyle = '#d4a843';
    ctx.fillRect(0, GROUND_Y, VIRTUAL_WIDTH, 3);
    // Sand dunes
    const sandOff = -camera.x * 0.8;
    ctx.fillStyle = '#dbb565';
    for (let i = 0; i < 15; i++) {
      const dx = ((i * 180 + sandOff) % (VIRTUAL_WIDTH + 180)) - 90;
      ctx.beginPath();
      ctx.ellipse(dx, GROUND_Y + 50, 60, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawForestBg(camera: Camera) {
    const ctx = this.ctx;
    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, '#1b5e20');
    skyGrad.addColorStop(0.3, '#2e7d32');
    skyGrad.addColorStop(1, '#4caf50');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, GROUND_Y);

    // Light rays
    ctx.fillStyle = 'rgba(255,255,200,0.05)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(200 + i * 200, 0);
      ctx.lineTo(150 + i * 200, GROUND_Y);
      ctx.lineTo(250 + i * 200, GROUND_Y);
      ctx.fill();
    }

    // Far trees
    const farOff = -camera.x * 0.2;
    ctx.fillStyle = '#1b5e20';
    for (let i = 0; i < 15; i++) {
      const tx = ((i * 200 + farOff) % (VIRTUAL_WIDTH + 200)) - 100;
      this.drawTree(tx, GROUND_Y, 120 + (i % 3) * 40, '#1b5e20');
    }

    // Mid trees
    const midOff = -camera.x * 0.5;
    for (let i = 0; i < 10; i++) {
      const tx = ((i * 280 + midOff) % (VIRTUAL_WIDTH + 280)) - 140;
      this.drawTree(tx, GROUND_Y, 160 + (i % 3) * 30, '#2e7d32');
    }

    // Ground
    ctx.fillStyle = '#33691e';
    ctx.fillRect(0, GROUND_Y, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - GROUND_Y);
    ctx.fillStyle = '#558b2f';
    ctx.fillRect(0, GROUND_Y, VIRTUAL_WIDTH, 4);
    // Grass tufts
    ctx.fillStyle = '#7cb342';
    const grassOff = -camera.x * 1;
    for (let i = 0; i < 40; i++) {
      const gx = ((i * 70 + grassOff) % (VIRTUAL_WIDTH + 70)) - 35;
      ctx.fillRect(gx, GROUND_Y - 8, 3, 10);
      ctx.fillRect(gx + 5, GROUND_Y - 12, 3, 14);
      ctx.fillRect(gx + 10, GROUND_Y - 6, 3, 8);
    }
  }

  drawSpaceBg(camera: Camera) {
    const ctx = this.ctx;
    // Deep space
    ctx.fillStyle = '#0d0221';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // Stars (parallax)
    const starOff = -camera.x * 0.05;
    for (const s of stars) {
      const sx = ((s.x + starOff) % (VIRTUAL_WIDTH + 100)) - 50;
      const twinkle = 0.7 + 0.3 * Math.sin(this.time * 3 + s.x);
      ctx.fillStyle = `rgba(255,255,255,${s.brightness * twinkle})`;
      ctx.fillRect(sx, s.y, s.size, s.size);
    }

    // Nebula glow
    const nebulaGrad = ctx.createRadialGradient(800, 200, 0, 800, 200, 300);
    nebulaGrad.addColorStop(0, 'rgba(100,0,200,0.15)');
    nebulaGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(500, 0, 600, 400);

    // Station panels (mid parallax)
    const panelOff = -camera.x * 0.6;
    ctx.fillStyle = '#37474f';
    for (let i = 0; i < 8; i++) {
      const px = ((i * 350 + panelOff) % (VIRTUAL_WIDTH + 350)) - 175;
      ctx.fillRect(px, GROUND_Y - 200, 150, 200);
      ctx.fillStyle = '#546e7a';
      ctx.fillRect(px + 5, GROUND_Y - 195, 140, 190);
      // Tech details
      ctx.fillStyle = '#00e5ff22';
      for (let j = 0; j < 4; j++) {
        ctx.fillRect(px + 15, GROUND_Y - 180 + j * 45, 120, 2);
      }
      ctx.fillStyle = OMNITRIX_GREEN + '33';
      ctx.fillRect(px + 60, GROUND_Y - 160, 30, 30);
      ctx.fillStyle = '#37474f';
    }

    // Metal floor
    ctx.fillStyle = '#455a64';
    ctx.fillRect(0, GROUND_Y, VIRTUAL_WIDTH, VIRTUAL_HEIGHT - GROUND_Y);
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(0, GROUND_Y, VIRTUAL_WIDTH, 3);
    // Floor lines
    ctx.fillStyle = '#37474f';
    const floorOff = -camera.x * 1;
    for (let i = 0; i < 25; i++) {
      const fx = ((i * 100 + floorOff) % (VIRTUAL_WIDTH + 100)) - 50;
      ctx.fillRect(fx, GROUND_Y + 15, 2, VIRTUAL_HEIGHT - GROUND_Y - 15);
    }
    // Glowing strips
    ctx.fillStyle = OMNITRIX_GREEN + '44';
    ctx.fillRect(0, GROUND_Y + 5, VIRTUAL_WIDTH, 2);
  }

  private drawCloud(x: number, y: number, size: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.4, 0, 0, Math.PI * 2);
    ctx.ellipse(x - size * 0.5, y + 5, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
    ctx.ellipse(x + size * 0.4, y + 3, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawCactus(x: number, groundY: number, height: number) {
    const ctx = this.ctx;
    // Trunk
    ctx.fillRect(x - 6, groundY - height, 12, height);
    // Arms
    ctx.fillRect(x - 25, groundY - height * 0.7, 20, 8);
    ctx.fillRect(x - 25, groundY - height * 0.7 - 20, 8, 28);
    ctx.fillRect(x + 6, groundY - height * 0.5, 20, 8);
    ctx.fillRect(x + 18, groundY - height * 0.5 - 25, 8, 33);
  }

  private drawTree(x: number, groundY: number, height: number, color: string) {
    const ctx = this.ctx;
    // Trunk
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x - 8, groundY - height * 0.4, 16, height * 0.4);
    // Foliage layers
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 40, groundY - height * 0.35);
    ctx.lineTo(x, groundY - height);
    ctx.lineTo(x + 40, groundY - height * 0.35);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 50, groundY - height * 0.2);
    ctx.lineTo(x, groundY - height * 0.75);
    ctx.lineTo(x + 50, groundY - height * 0.2);
    ctx.fill();
  }

  // ============ ENTITIES ============

  drawEntities(player: Player, enemies: Enemy[], projectiles: Projectile[], particles: Particle[], camera: Camera) {
    // Draw projectiles
    for (const p of projectiles) {
      this.drawProjectile(p, camera);
    }
    // Draw enemies
    for (const e of enemies) {
      if (e.alive) this.drawEnemy(e, camera);
    }
    // Draw player
    this.drawPlayer(player, camera);
    // Draw particles
    for (const p of particles) {
      this.drawParticle(p, camera);
    }
  }

  drawPlayer(player: Player, camera: Camera) {
    const ctx = this.ctx;
    const sx = player.pos.x - camera.x;
    const sy = player.pos.y;

    // Invincibility flash
    if (player.invincibleTimer > 0 && Math.floor(this.time * 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Shield visual
    if (player.shieldActive) {
      ctx.fillStyle = ALIEN_STATS[AlienType.DIAMONDHEAD].color + '44';
      ctx.beginPath();
      ctx.arc(sx + player.width / 2, sy + player.height / 2, player.width + 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = ALIEN_STATS[AlienType.DIAMONDHEAD].color;
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Dash trail
    if (player.dashActive) {
      for (let i = 1; i <= 5; i++) {
        ctx.globalAlpha = 0.15 * (1 - i / 6);
        ctx.fillStyle = ALIEN_STATS[AlienType.XLR8].color;
        ctx.fillRect(sx - i * 20 * player.facing, sy + 5, player.width, player.height - 10);
      }
      ctx.globalAlpha = player.invincibleTimer > 0 && Math.floor(this.time * 10) % 2 === 0 ? 0.5 : 1;
    }

    if (player.currentAlien === null) {
      this.drawBen(sx, sy, player);
    } else {
      this.drawAlien(player.currentAlien, sx, sy, player);
    }

    ctx.globalAlpha = 1;
  }

  drawBen(x: number, y: number, player: Player) {
    const ctx = this.ctx;
    const w = player.width;
    const h = player.height;
    const f = player.facing;

    // Legs
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x + w * 0.2, y + h * 0.65, w * 0.2, h * 0.35);
    ctx.fillRect(x + w * 0.55, y + h * 0.65, w * 0.2, h * 0.35);

    // Body/shirt
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + w * 0.15, y + h * 0.3, w * 0.7, h * 0.38);
    // Black stripe
    ctx.fillStyle = '#222222';
    ctx.fillRect(x + w * 0.35, y + h * 0.3, w * 0.3, h * 0.38);

    // Head
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.22, w * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Hair
    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.15, w * 0.32, Math.PI, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.arc(x + w * 0.38, y + h * 0.22, 3, 0, Math.PI * 2);
    ctx.arc(x + w * 0.62, y + h * 0.22, 3, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.fillStyle = '#ffcc80';
    const armSwing = player.attackAnim > 0 ? Math.sin(player.attackAnim * 8) * 10 : 0;
    ctx.fillRect(x - 4, y + h * 0.32 + armSwing, 8, h * 0.25);
    ctx.fillRect(x + w - 4, y + h * 0.32 - armSwing, 8, h * 0.25);

    // Omnitrix on wrist
    const omniX = f === 1 ? x + w - 2 : x - 6;
    ctx.fillStyle = OMNITRIX_GREEN;
    ctx.fillRect(omniX, y + h * 0.5, 8, 8);
    ctx.fillStyle = '#000';
    ctx.fillRect(omniX + 2, y + h * 0.5 + 2, 4, 4);
  }

  drawAlien(type: AlienType, x: number, y: number, player: Player) {
    const stats = ALIEN_STATS[type];
    const w = stats.width;
    const h = stats.height;
    const f = player.facing;
    const atkAnim = player.attackAnim;

    switch (type) {
      case AlienType.HEATBLAST:
        this.drawHeatblast(x, y, w, h, f, atkAnim);
        break;
      case AlienType.FOURARMS:
        this.drawFourArms(x, y, w, h, f, atkAnim);
        break;
      case AlienType.XLR8:
        this.drawXLR8(x, y, w, h, f, atkAnim);
        break;
      case AlienType.DIAMONDHEAD:
        this.drawDiamondhead(x, y, w, h, f, atkAnim);
        break;
    }
  }

  drawHeatblast(x: number, y: number, w: number, h: number, f: number, atk: number) {
    const ctx = this.ctx;
    const cx = x + w / 2;

    // Flame aura
    const flicker = Math.sin(this.time * 15) * 3;
    ctx.fillStyle = '#ff660044';
    ctx.beginPath();
    ctx.arc(cx, y + h * 0.4, w * 0.8 + flicker, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#cc3300';
    ctx.fillRect(x + w * 0.15, y + h * 0.65, w * 0.25, h * 0.35);
    ctx.fillRect(x + w * 0.55, y + h * 0.65, w * 0.25, h * 0.35);

    // Body
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(x + w * 0.1, y + h * 0.25, w * 0.8, h * 0.45);

    // Head
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(cx, y + h * 0.2, w * 0.35, 0, Math.PI * 2);
    ctx.fill();
    // Flame head
    ctx.fillStyle = '#ff4400';
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 2 + (i - 2) * 0.4;
      const fh = 15 + Math.sin(this.time * 10 + i) * 5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * w * 0.2, y + h * 0.1);
      ctx.lineTo(cx + Math.cos(angle) * w * 0.1, y + h * 0.1 - fh);
      ctx.lineTo(cx + Math.cos(angle) * w * 0.3, y + h * 0.1);
      ctx.fill();
    }

    // Eyes
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(cx - 7, y + h * 0.2, 4, 0, Math.PI * 2);
    ctx.arc(cx + 7, y + h * 0.2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.fillStyle = '#ff6600';
    const armX = atk > 0 ? f * 15 : 0;
    ctx.fillRect(x - 8 + armX, y + h * 0.3, 10, h * 0.3);
    ctx.fillRect(x + w - 2 + armX, y + h * 0.3, 10, h * 0.3);

    // Attack fireball hand glow
    if (atk > 0) {
      const handX = f === 1 ? x + w + 5 + armX : x - 10 + armX;
      ctx.fillStyle = '#ffff0088';
      ctx.beginPath();
      ctx.arc(handX, y + h * 0.45, 12 + Math.sin(this.time * 20) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawFourArms(x: number, y: number, w: number, h: number, f: number, atk: number) {
    const ctx = this.ctx;
    const cx = x + w / 2;

    // Legs (thick)
    ctx.fillStyle = '#b71c1c';
    ctx.fillRect(x + w * 0.1, y + h * 0.6, w * 0.3, h * 0.4);
    ctx.fillRect(x + w * 0.55, y + h * 0.6, w * 0.3, h * 0.4);

    // Body (large)
    ctx.fillStyle = '#cc0000';
    ctx.fillRect(x, y + h * 0.2, w, h * 0.45);
    // Chest detail
    ctx.fillStyle = '#990000';
    ctx.fillRect(x + w * 0.2, y + h * 0.25, w * 0.6, h * 0.1);

    // Head
    ctx.fillStyle = '#cc0000';
    ctx.beginPath();
    ctx.arc(cx, y + h * 0.15, w * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Jaw
    ctx.fillRect(cx - w * 0.25, y + h * 0.15, w * 0.5, h * 0.08);
    // Eyes (4 of them!)
    ctx.fillStyle = '#76ff03';
    ctx.beginPath();
    ctx.arc(cx - 10, y + h * 0.1, 4, 0, Math.PI * 2);
    ctx.arc(cx + 10, y + h * 0.1, 4, 0, Math.PI * 2);
    ctx.arc(cx - 6, y + h * 0.16, 3, 0, Math.PI * 2);
    ctx.arc(cx + 6, y + h * 0.16, 3, 0, Math.PI * 2);
    ctx.fill();

    // Four arms!
    ctx.fillStyle = '#cc0000';
    const punchExtend = atk > 0 ? f * 20 : 0;
    // Upper arms
    ctx.fillRect(x - 14 + punchExtend, y + h * 0.22, 16, h * 0.2);
    ctx.fillRect(x + w - 2 + punchExtend, y + h * 0.22, 16, h * 0.2);
    // Lower arms
    ctx.fillRect(x - 10 + punchExtend * 0.5, y + h * 0.4, 12, h * 0.2);
    ctx.fillRect(x + w + punchExtend * 0.5, y + h * 0.4, 12, h * 0.2);
    // Fists
    ctx.fillStyle = '#b71c1c';
    if (atk > 0) {
      ctx.fillStyle = '#ffff0066';
      const fistX = f === 1 ? x + w + 12 + punchExtend : x - 20 + punchExtend;
      ctx.beginPath();
      ctx.arc(fistX, y + h * 0.32, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawXLR8(x: number, y: number, w: number, h: number, f: number, atk: number) {
    const ctx = this.ctx;
    const cx = x + w / 2;

    // Speed lines when moving
    ctx.fillStyle = '#0088ff44';
    if (atk > 0 || Math.abs(this.time % 0.5) < 0.25) {
      for (let i = 1; i <= 3; i++) {
        ctx.fillRect(cx - f * i * 25, y + h * 0.3, 15, 2);
        ctx.fillRect(cx - f * i * 30, y + h * 0.5, 20, 2);
      }
    }

    // Legs (sleek)
    ctx.fillStyle = '#0066cc';
    ctx.fillRect(x + w * 0.2, y + h * 0.6, w * 0.2, h * 0.4);
    ctx.fillRect(x + w * 0.55, y + h * 0.6, w * 0.2, h * 0.4);

    // Body (streamlined)
    ctx.fillStyle = '#0088ff';
    ctx.beginPath();
    ctx.ellipse(cx, y + h * 0.45, w * 0.4, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    // Stripe
    ctx.fillStyle = '#000';
    ctx.fillRect(x + w * 0.3, y + h * 0.35, w * 0.4, h * 0.05);

    // Head (pointed visor)
    ctx.fillStyle = '#0066cc';
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(cx - w * 0.3, y + h * 0.25);
    ctx.lineTo(cx + w * 0.3, y + h * 0.25);
    ctx.fill();
    // Visor
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.25, y + h * 0.15);
    ctx.lineTo(cx + w * 0.25, y + h * 0.15);
    ctx.lineTo(cx + w * 0.15, y + h * 0.22);
    ctx.lineTo(cx - w * 0.15, y + h * 0.22);
    ctx.fill();

    // Tail
    ctx.fillStyle = '#0088ff';
    ctx.beginPath();
    ctx.moveTo(cx - f * w * 0.3, y + h * 0.55);
    ctx.lineTo(cx - f * w * 0.8, y + h * 0.45);
    ctx.lineTo(cx - f * w * 0.3, y + h * 0.5);
    ctx.fill();

    // Arms
    ctx.fillStyle = '#0077dd';
    ctx.fillRect(x - 5, y + h * 0.3, 8, h * 0.25);
    ctx.fillRect(x + w - 3, y + h * 0.3, 8, h * 0.25);

    // Wheel feet (Kineceleran)
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x + w * 0.3, y + h - 5, 6, 0, Math.PI * 2);
    ctx.arc(x + w * 0.65, y + h - 5, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  drawDiamondhead(x: number, y: number, w: number, h: number, f: number, atk: number) {
    const ctx = this.ctx;
    const cx = x + w / 2;

    // Crystal glow
    ctx.fillStyle = '#00ccaa22';
    ctx.beginPath();
    ctx.arc(cx, y + h * 0.4, w * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Legs (angular)
    ctx.fillStyle = '#009688';
    ctx.beginPath();
    ctx.moveTo(x + w * 0.15, y + h * 0.6);
    ctx.lineTo(x + w * 0.05, y + h);
    ctx.lineTo(x + w * 0.35, y + h);
    ctx.lineTo(x + w * 0.35, y + h * 0.6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w * 0.6, y + h * 0.6);
    ctx.lineTo(x + w * 0.6, y + h);
    ctx.lineTo(x + w * 0.9, y + h);
    ctx.lineTo(x + w * 0.8, y + h * 0.6);
    ctx.fill();

    // Body (crystalline)
    ctx.fillStyle = '#00ccaa';
    ctx.beginPath();
    ctx.moveTo(cx, y + h * 0.2);
    ctx.lineTo(x, y + h * 0.4);
    ctx.lineTo(x + w * 0.1, y + h * 0.65);
    ctx.lineTo(x + w * 0.9, y + h * 0.65);
    ctx.lineTo(x + w, y + h * 0.4);
    ctx.fill();
    // Crystal facets
    ctx.strokeStyle = '#80ffec';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, y + h * 0.2);
    ctx.lineTo(cx - 5, y + h * 0.5);
    ctx.moveTo(cx, y + h * 0.2);
    ctx.lineTo(cx + 8, y + h * 0.45);
    ctx.stroke();

    // Head (diamond shape)
    ctx.fillStyle = '#00ccaa';
    ctx.beginPath();
    ctx.moveTo(cx, y - 5);
    ctx.lineTo(cx - w * 0.3, y + h * 0.15);
    ctx.lineTo(cx, y + h * 0.25);
    ctx.lineTo(cx + w * 0.3, y + h * 0.15);
    ctx.fill();
    // Crystal point on head
    ctx.fillStyle = '#80ffec';
    ctx.beginPath();
    ctx.moveTo(cx, y - 15);
    ctx.lineTo(cx - 6, y);
    ctx.lineTo(cx + 6, y);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#76ff03';
    ctx.beginPath();
    ctx.arc(cx - 8, y + h * 0.13, 4, 0, Math.PI * 2);
    ctx.arc(cx + 8, y + h * 0.13, 4, 0, Math.PI * 2);
    ctx.fill();

    // Arms (crystal)
    ctx.fillStyle = '#00bfa5';
    const armOff = atk > 0 ? f * 10 : 0;
    ctx.fillRect(x - 10 + armOff, y + h * 0.25, 12, h * 0.3);
    ctx.fillRect(x + w - 2 + armOff, y + h * 0.25, 12, h * 0.3);
    // Crystal blade on arm
    if (atk > 0) {
      ctx.fillStyle = '#80ffec88';
      const bx = f === 1 ? x + w + 8 + armOff : x - 18 + armOff;
      ctx.beginPath();
      ctx.moveTo(bx, y + h * 0.2);
      ctx.lineTo(bx + f * 20, y + h * 0.35);
      ctx.lineTo(bx, y + h * 0.5);
      ctx.fill();
    }
  }

  drawEnemy(enemy: Enemy, camera: Camera) {
    const ctx = this.ctx;
    const sx = enemy.pos.x - camera.x;
    const sy = enemy.pos.y;

    if (sx < -100 || sx > VIRTUAL_WIDTH + 100) return;

    // Hit flash
    if (enemy.hitTimer > 0) {
      ctx.fillStyle = '#ffffff';
    }

    if (enemy.type === 'robot') {
      this.drawRobot(sx, sy, enemy);
    } else {
      this.drawDrone(sx, sy, enemy);
    }
  }

  drawRobot(x: number, y: number, enemy: Enemy) {
    const ctx = this.ctx;
    const w = enemy.width;
    const h = enemy.height;
    const flash = enemy.hitTimer > 0;

    // Legs
    ctx.fillStyle = flash ? '#fff' : '#666';
    ctx.fillRect(x + w * 0.15, y + h * 0.65, w * 0.2, h * 0.35);
    ctx.fillRect(x + w * 0.6, y + h * 0.65, w * 0.2, h * 0.35);

    // Body
    ctx.fillStyle = flash ? '#fff' : '#888';
    ctx.fillRect(x + w * 0.1, y + h * 0.25, w * 0.8, h * 0.42);
    // Chest plate
    ctx.fillStyle = flash ? '#fff' : '#ff1744';
    ctx.fillRect(x + w * 0.25, y + h * 0.3, w * 0.5, h * 0.15);

    // Head
    ctx.fillStyle = flash ? '#fff' : '#999';
    ctx.fillRect(x + w * 0.2, y, w * 0.6, h * 0.28);
    // Antenna
    ctx.fillStyle = flash ? '#fff' : '#ff1744';
    ctx.fillRect(x + w * 0.45, y - 12, 4, 14);
    ctx.beginPath();
    ctx.arc(x + w * 0.47, y - 14, 4, 0, Math.PI * 2);
    ctx.fill();
    // Eyes (menacing red)
    ctx.fillStyle = flash ? '#fff' : '#ff0000';
    ctx.fillRect(x + w * 0.28, y + h * 0.08, w * 0.15, h * 0.06);
    ctx.fillRect(x + w * 0.55, y + h * 0.08, w * 0.15, h * 0.06);

    // Arms
    ctx.fillStyle = flash ? '#fff' : '#777';
    ctx.fillRect(x - 5, y + h * 0.28, 8, h * 0.3);
    ctx.fillRect(x + w - 3, y + h * 0.28, 8, h * 0.3);

    // Health bar
    if (enemy.health < enemy.maxHealth) {
      const barW = w * 0.8;
      const barH = 5;
      const barX = x + w * 0.1;
      const barY = y - 12;
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(barX, barY, barW * (enemy.health / enemy.maxHealth), barH);
    }
  }

  drawDrone(x: number, y: number, enemy: Enemy) {
    const ctx = this.ctx;
    const w = enemy.width;
    const h = enemy.height;
    const flash = enemy.hitTimer > 0;
    const bob = Math.sin(this.time * 4 + enemy.sineOffset) * 5;

    const dy = y + bob;

    // Propeller
    ctx.fillStyle = flash ? '#fff' : '#aaa';
    ctx.fillRect(x + w * 0.1, dy - 5, w * 0.35, 3);
    ctx.fillRect(x + w * 0.55, dy - 5, w * 0.35, 3);

    // Body (octagonal)
    ctx.fillStyle = flash ? '#fff' : '#607d8b';
    ctx.beginPath();
    const cx = x + w / 2;
    const cy = dy + h / 2;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 8;
      const r = w * 0.45;
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.7);
    }
    ctx.fill();

    // Eye (center)
    ctx.fillStyle = flash ? '#fff' : '#ff0000';
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff000088';
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();

    // Health bar
    if (enemy.health < enemy.maxHealth) {
      const barW = w * 0.8;
      const barH = 5;
      const barX = x + w * 0.1;
      const barY = dy - 15;
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(barX, barY, barW * (enemy.health / enemy.maxHealth), barH);
    }
  }

  drawProjectile(proj: Projectile, camera: Camera) {
    const ctx = this.ctx;
    const sx = proj.pos.x - camera.x;
    const sy = proj.pos.y;

    if (sx < -50 || sx > VIRTUAL_WIDTH + 50) return;

    switch (proj.type) {
      case 'fireball': {
        // Glowing fireball
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 18);
        grad.addColorStop(0, '#ffff00');
        grad.addColorStop(0.4, '#ff6600');
        grad.addColorStop(1, '#ff000000');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, 18, 0, Math.PI * 2);
        ctx.fill();
        // Core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'punch_wave': {
        // Shockwave ring
        ctx.strokeStyle = '#ff4444cc';
        ctx.lineWidth = 4;
        const r = (1 - proj.lifetime / 0.3) * 50 + 20;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ff444444';
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'crystal': {
        // Crystal shard
        ctx.fillStyle = '#80ffec';
        ctx.beginPath();
        ctx.moveTo(sx, sy - 8);
        ctx.lineTo(sx + 15, sy);
        ctx.lineTo(sx, sy + 8);
        ctx.lineTo(sx - 5, sy);
        ctx.fill();
        ctx.fillStyle = '#00ccaa88';
        ctx.beginPath();
        ctx.arc(sx + 5, sy, 10, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'speed_dash': {
        // Speed trail
        ctx.fillStyle = '#0088ff88';
        ctx.fillRect(sx - 30, sy - 15, 60, 30);
        ctx.fillStyle = '#00ccff44';
        ctx.fillRect(sx - 50, sy - 8, 100, 16);
        break;
      }
    }
  }

  drawParticle(p: Particle, camera: Camera) {
    const ctx = this.ctx;
    const sx = p.pos.x - camera.x;
    const alpha = p.lifetime / p.maxLifetime;
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(sx - p.size / 2, p.pos.y - p.size / 2, p.size, p.size);
    ctx.globalAlpha = 1;
  }

  // ============ HUD ============

  drawHUD(player: Player, score: number, levelIndex: number) {
    const ctx = this.ctx;

    // HUD background strip
    ctx.fillStyle = HUD_BG;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, 50);

    // Hearts
    for (let i = 0; i < player.maxHealth; i++) {
      const hx = 15 + i * 35;
      const hy = 15;
      if (i < player.health) {
        ctx.fillStyle = '#ff1744';
      } else {
        ctx.fillStyle = '#555';
      }
      this.drawHeart(hx, hy, 14);
    }

    // Score
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SCORE: ${score}`, VIRTUAL_WIDTH / 2, 33);

    // Level indicator
    ctx.font = '16px "DM Sans", sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'left';
    ctx.fillText(`Level ${levelIndex + 1}`, 200, 33);

    // Current alien icon (left of omnitrix)
    if (player.currentAlien) {
      const stats = ALIEN_STATS[player.currentAlien];
      ctx.fillStyle = stats.color;
      ctx.beginPath();
      ctx.arc(VIRTUAL_WIDTH - 160, 55, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px "DM Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stats.name, VIRTUAL_WIDTH - 160, 60);
    }
  }

  private drawHeart(x: number, y: number, size: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.3);
    ctx.bezierCurveTo(x - size, y + size * 0.6, x, y + size, x, y + size);
    ctx.bezierCurveTo(x, y + size, x + size, y + size * 0.6, x + size, y + size * 0.3);
    ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3);
    ctx.fill();
  }

  // ============ CONTROLS ============

  drawControls(input: InputManager, player: Player) {
    const ctx = this.ctx;
    const buttons = input.getButtons();

    for (const btn of buttons) {
      if (btn.id === 'omnitrix') {
        this.drawOmnitrixDial(btn.x, btn.y, btn.w, btn.h, player);
        continue;
      }

      const pressed = (btn.id === 'left' && input.state.left) ||
        (btn.id === 'right' && input.state.right) ||
        (btn.id === 'jump' && input.state.jump) ||
        (btn.id === 'attack' && input.state.attack);

      // Button background
      ctx.fillStyle = pressed ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)';
      this.roundRect(btn.x, btn.y, btn.w, btn.h, 15);
      ctx.fill();

      // Button border
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      this.roundRect(btn.x, btn.y, btn.w, btn.h, 15);
      ctx.stroke();

      // Button icon/label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px "DM Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const cx = btn.x + btn.w / 2;
      const cy = btn.y + btn.h / 2;

      switch (btn.id) {
        case 'left':
          ctx.font = 'bold 40px sans-serif';
          ctx.fillText('◀', cx, cy);
          break;
        case 'right':
          ctx.font = 'bold 40px sans-serif';
          ctx.fillText('▶', cx, cy);
          break;
        case 'jump':
          ctx.font = 'bold 32px sans-serif';
          ctx.fillText('⬆', cx, cy);
          break;
        case 'attack':
          ctx.fillStyle = '#ff4444';
          this.roundRect(btn.x, btn.y, btn.w, btn.h, 15);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 22px "DM Sans", sans-serif';
          ctx.fillText('POW!', cx, cy);
          break;
      }
    }
    ctx.textBaseline = 'alphabetic';
  }

  drawOmnitrixDial(x: number, y: number, w: number, h: number, player: Player) {
    const ctx = this.ctx;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = w / 2 - 5;

    const ready = player.omnitrixCooldown <= 0 && player.unlockedAliens.length > 0;
    const cooldownPct = Math.max(0, player.omnitrixCooldown / player.omnitrixMaxCooldown);

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fill();

    // Cooldown ring
    if (cooldownPct > 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, r + 2, -Math.PI / 2, -Math.PI / 2 + (1 - cooldownPct) * Math.PI * 2);
      ctx.strokeStyle = OMNITRIX_GREEN;
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, r + 2, 0, Math.PI * 2);
      ctx.strokeStyle = OMNITRIX_GREEN;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Inner circle
    ctx.beginPath();
    ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
    ctx.fillStyle = ready ? OMNITRIX_GREEN : OMNITRIX_DARK;
    ctx.fill();

    // Glow when ready
    if (ready) {
      const glowR = r + 8 + Math.sin(this.time * 4) * 4;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.strokeStyle = OMNITRIX_GREEN + '66';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Hourglass shape (Omnitrix symbol)
    ctx.fillStyle = ready ? '#003300' : '#001100';
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - 18);
    ctx.lineTo(cx + 12, cy - 18);
    ctx.lineTo(cx + 6, cy);
    ctx.lineTo(cx + 12, cy + 18);
    ctx.lineTo(cx - 12, cy + 18);
    ctx.lineTo(cx - 6, cy);
    ctx.fill();
    // Outline
    ctx.strokeStyle = ready ? '#aaffaa' : '#446644';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - 18);
    ctx.lineTo(cx + 12, cy - 18);
    ctx.lineTo(cx + 6, cy);
    ctx.lineTo(cx + 12, cy + 18);
    ctx.lineTo(cx - 12, cy + 18);
    ctx.lineTo(cx - 6, cy);
    ctx.closePath();
    ctx.stroke();
  }

  // ============ ALIEN SELECT WHEEL ============

  drawAlienSelectWheel(unlockedAliens: AlienType[]) {
    const ctx = this.ctx;

    // Dim overlay
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    const cx = VIRTUAL_WIDTH / 2;
    const cy = VIRTUAL_HEIGHT / 2;

    // Omnitrix circle
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, Math.PI * 2);
    ctx.fillStyle = OMNITRIX_GREEN;
    ctx.fill();
    // Hourglass
    ctx.fillStyle = '#003300';
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 25);
    ctx.lineTo(cx + 15, cy - 25);
    ctx.lineTo(cx + 8, cy);
    ctx.lineTo(cx + 15, cy + 25);
    ctx.lineTo(cx - 15, cy + 25);
    ctx.lineTo(cx - 8, cy);
    ctx.fill();

    // Alien options in circle
    const radius = 150;
    for (let i = 0; i < unlockedAliens.length; i++) {
      const angle = (i / unlockedAliens.length) * Math.PI * 2 - Math.PI / 2;
      const ax = cx + Math.cos(angle) * radius;
      const ay = cy + Math.sin(angle) * radius;
      const alien = unlockedAliens[i];
      const stats = ALIEN_STATS[alien];

      // Circle bg
      ctx.beginPath();
      ctx.arc(ax, ay, 45, 0, Math.PI * 2);
      ctx.fillStyle = stats.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Alien name
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px "DM Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stats.name, ax, ay + 5);

      // Connecting line
      ctx.strokeStyle = OMNITRIX_GREEN + '88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 50, cy + Math.sin(angle) * 50);
      ctx.lineTo(ax - Math.cos(angle) * 45, ay - Math.sin(angle) * 45);
      ctx.stroke();
    }

    // Instructions
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TAP AN ALIEN TO TRANSFORM!', cx, cy + radius + 80);
  }

  // ============ SCREENS ============

  drawSplash(timer: number) {
    const ctx = this.ctx;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
    grad.addColorStop(0, '#000');
    grad.addColorStop(0.5, '#002200');
    grad.addColorStop(1, '#000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // Radiating green lines
    const cx = VIRTUAL_WIDTH / 2;
    const cy = VIRTUAL_HEIGHT / 2 - 30;
    ctx.strokeStyle = OMNITRIX_GREEN + '22';
    ctx.lineWidth = 2;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2 + timer * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * 600, cy + Math.sin(a) * 600);
      ctx.stroke();
    }

    // Big Omnitrix
    const pulse = Math.sin(timer * 3) * 10;
    const omniR = 80 + pulse;

    // Outer glow
    const glowGrad = ctx.createRadialGradient(cx, cy, omniR - 20, cx, cy, omniR + 40);
    glowGrad.addColorStop(0, OMNITRIX_GREEN + '44');
    glowGrad.addColorStop(1, '#00000000');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, omniR + 40, 0, Math.PI * 2);
    ctx.fill();

    // Omnitrix body
    ctx.beginPath();
    ctx.arc(cx, cy, omniR, 0, Math.PI * 2);
    ctx.fillStyle = OMNITRIX_GREEN;
    ctx.fill();
    ctx.strokeStyle = '#88ff88';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Hourglass
    ctx.fillStyle = '#003300';
    const s = omniR * 0.35;
    ctx.beginPath();
    ctx.moveTo(cx - s, cy - s * 1.5);
    ctx.lineTo(cx + s, cy - s * 1.5);
    ctx.lineTo(cx + s * 0.4, cy);
    ctx.lineTo(cx + s, cy + s * 1.5);
    ctx.lineTo(cx - s, cy + s * 1.5);
    ctx.lineTo(cx - s * 0.4, cy);
    ctx.fill();

    // Title
    ctx.fillStyle = OMNITRIX_GREEN;
    ctx.font = 'bold 52px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("PARKER'S", cx, cy - omniR - 60);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 44px "DM Sans", sans-serif';
    ctx.fillText('BEN 10 ADVENTURE', cx, cy - omniR - 15);

    // Tap to start (blinking)
    if (Math.floor(timer * 2) % 2 === 0) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px "DM Sans", sans-serif';
      ctx.fillText('TAP TO START!', cx, cy + omniR + 70);
    }

    // Bottom credits
    ctx.fillStyle = '#555';
    ctx.font = '14px "DM Sans", sans-serif';
    ctx.fillText('A game made for Parker', cx, VIRTUAL_HEIGHT - 30);
  }

  drawLevelIntro(levelIndex: number, level: LevelData, timer: number) {
    const ctx = this.ctx;

    // Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    const cx = VIRTUAL_WIDTH / 2;
    const cy = VIRTUAL_HEIGHT / 2;

    // Slide in from left
    const slideIn = Math.min(1, timer / 0.5);
    const textX = cx * slideIn + (-300) * (1 - slideIn);

    // Level number
    ctx.fillStyle = OMNITRIX_GREEN;
    ctx.font = 'bold 36px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`LEVEL ${levelIndex + 1}`, textX, cy - 60);

    // Level name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 52px "DM Sans", sans-serif';
    ctx.fillText(level.name.toUpperCase(), textX, cy);

    // "IT'S HERO TIME PARKER!"
    if (timer > 0.5) {
      const alpha = Math.min(1, (timer - 0.5) / 0.5);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = OMNITRIX_GREEN;
      ctx.font = 'bold 42px "DM Sans", sans-serif';
      ctx.fillText("IT'S HERO TIME PARKER! 🟢", cx, cy + 70);

      // New alien unlock
      if (timer > 1) {
        const alienStats = ALIEN_STATS[level.newAlien];
        ctx.fillStyle = alienStats.color;
        ctx.font = 'bold 28px "DM Sans", sans-serif';
        ctx.fillText(`NEW ALIEN: ${alienStats.name.toUpperCase()}!`, cx, cy + 130);
      }

      // Controls hint
      if (timer > 1.5) {
        ctx.fillStyle = '#888';
        ctx.font = '18px "DM Sans", sans-serif';
        ctx.fillText('\u25C0 \u25B6 Move  |  \u2B06 Jump  |  POW! Attack  |  \u23F3 Omnitrix', cx, cy + 180);
      }

      ctx.globalAlpha = 1;
    }
  }

  drawLevelComplete(_levelIndex: number, score: number, timer: number) {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    const cx = VIRTUAL_WIDTH / 2;
    const cy = VIRTUAL_HEIGHT / 2;

    ctx.fillStyle = OMNITRIX_GREEN;
    ctx.font = 'bold 48px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL COMPLETE!', cx, cy - 40);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px "DM Sans", sans-serif';
    ctx.fillText(`SCORE: ${score}`, cx, cy + 20);

    if (timer > 1) {
      ctx.fillStyle = '#aaa';
      ctx.font = '24px "DM Sans", sans-serif';
      ctx.fillText('TAP TO CONTINUE', cx, cy + 80);
    }
  }

  drawVictory(totalScore: number, timer: number) {
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    const cx = VIRTUAL_WIDTH / 2;
    const cy = VIRTUAL_HEIGHT / 2;

    // Confetti!
    for (let i = 0; i < 60; i++) {
      const fx = (cx + Math.sin(timer * 2 + i * 0.7) * 500 + i * 21) % VIRTUAL_WIDTH;
      const fy = ((timer * 100 + i * 50) % (VIRTUAL_HEIGHT + 50)) - 25;
      const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff', OMNITRIX_GREEN];
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(fx, fy, 8, 8);
    }

    // Stars
    ctx.fillStyle = '#ffd700';
    ctx.font = '60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⭐ ⭐ ⭐', cx, cy - 100);

    ctx.fillStyle = OMNITRIX_GREEN;
    ctx.font = 'bold 56px "DM Sans", sans-serif';
    ctx.fillText('PARKER SAVED', cx, cy - 30);
    ctx.fillText('THE DAY! 🎉', cx, cy + 35);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px "DM Sans", sans-serif';
    ctx.fillText(`FINAL SCORE: ${totalScore}`, cx, cy + 100);

    if (timer > 2) {
      ctx.fillStyle = '#aaa';
      ctx.font = '24px "DM Sans", sans-serif';
      ctx.fillText('TAP TO PLAY AGAIN!', cx, cy + 160);
    }
  }

  // ============ HELPERS ============

  private roundRect(x: number, y: number, w: number, h: number, r: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

