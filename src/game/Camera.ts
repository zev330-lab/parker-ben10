import type { Vec2 } from '../types';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../types';

export class Camera {
  x = 0;
  y = 0;
  scale = 1;
  private canvasW = VIRTUAL_WIDTH;
  private canvasH = VIRTUAL_HEIGHT;

  resize(canvasW: number, canvasH: number) {
    this.canvasW = canvasW;
    this.canvasH = canvasH;
    // Scale to fit virtual resolution
    this.scale = Math.min(canvasW / VIRTUAL_WIDTH, canvasH / VIRTUAL_HEIGHT);
  }

  follow(target: Vec2, dt: number) {
    const lerp = 1 - Math.pow(0.001, dt); // smooth follow
    this.x += (target.x - this.x) * lerp;
    this.y += (target.y - this.y) * lerp;
  }

  /** Convert world position to screen position */
  worldToScreen(wx: number, wy: number): Vec2 {
    return {
      x: (wx - this.x) * this.scale + this.canvasW / 2,
      y: (wy - this.y) * this.scale + this.canvasH / 2,
    };
  }

  /** Convert screen position to world position */
  screenToWorld(sx: number, sy: number): Vec2 {
    return {
      x: (sx - this.canvasW / 2) / this.scale + this.x,
      y: (sy - this.canvasH / 2) / this.scale + this.y,
    };
  }

  /** Apply camera transform to canvas context */
  apply(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(this.scale, 0, 0, this.scale, this.canvasW / 2 - this.x * this.scale, this.canvasH / 2 - this.y * this.scale);
  }

  /** Reset canvas transform */
  reset(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
