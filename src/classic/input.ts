import type { InputState } from './types';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from './types';

// Button regions in virtual coordinates
interface ButtonRegion {
  x: number;
  y: number;
  w: number;
  h: number;
  id: string;
}

// Track active touches to button mappings
const activeTouches = new Map<number, string>();

export class InputManager {
  state: InputState = {
    left: false,
    right: false,
    jump: false,
    attack: false,
    omnitrix: false,
    alienSelect: -1,
  };

  private canvas: HTMLCanvasElement;
  private offsetX = 0;
  private offsetY = 0;
  private scale = 1;

  // Alien select wheel state
  alienSelectVisible = false;
  private unlockedCount = 0;

  // Button layout (set in updateLayout)
  private buttons: ButtonRegion[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.updateLayout();

    canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', this.onTouchEnd, { passive: false });

    // Mouse fallback for desktop testing
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mouseup', this.onMouseUp);
  }

  updateScale(scale: number, offsetX: number, offsetY: number) {
    this.scale = scale;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  updateLayout() {
    const btnW = 100;
    const btnH = 90;
    const pad = 15;
    const bottomY = VIRTUAL_HEIGHT - btnH - pad;

    this.buttons = [
      // Left side - movement
      { x: pad, y: bottomY, w: btnW, h: btnH, id: 'left' },
      { x: pad + btnW + pad, y: bottomY, w: btnW, h: btnH, id: 'right' },
      // Right side - actions
      { x: VIRTUAL_WIDTH - btnW - pad, y: bottomY, w: btnW + 10, h: btnH, id: 'attack' },
      { x: VIRTUAL_WIDTH - btnW * 2 - pad * 2, y: bottomY, w: btnW, h: btnH, id: 'jump' },
      // Omnitrix button - top right
      { x: VIRTUAL_WIDTH - 110, y: 10, w: 100, h: 100, id: 'omnitrix' },
    ];
  }

  setAlienSelectVisible(visible: boolean, unlockedCount: number) {
    this.alienSelectVisible = visible;
    this.unlockedCount = unlockedCount;
    if (!visible) {
      this.state.alienSelect = -1;
    }
  }

  getButtons(): ButtonRegion[] {
    return this.buttons;
  }

  private toVirtual(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const dpr = window.devicePixelRatio || 1;
    return {
      x: (px * dpr - this.offsetX) / this.scale,
      y: (py * dpr - this.offsetY) / this.scale,
    };
  }

  private hitTest(vx: number, vy: number): string | null {
    // Check alien select wheel first
    if (this.alienSelectVisible) {
      const cx = VIRTUAL_WIDTH / 2;
      const cy = VIRTUAL_HEIGHT / 2;
      const radius = 150;
      for (let i = 0; i < this.unlockedCount; i++) {
        const angle = (i / this.unlockedCount) * Math.PI * 2 - Math.PI / 2;
        const ax = cx + Math.cos(angle) * radius;
        const ay = cy + Math.sin(angle) * radius;
        const dist = Math.sqrt((vx - ax) ** 2 + (vy - ay) ** 2);
        if (dist < 55) {
          return `alien_${i}`;
        }
      }
      // Tap outside wheel = cancel
      return 'cancel_alien';
    }

    for (const btn of this.buttons) {
      if (vx >= btn.x && vx <= btn.x + btn.w && vy >= btn.y && vy <= btn.y + btn.h) {
        return btn.id;
      }
    }
    return null;
  }

  private updateStateFromTouches() {
    this.state.left = false;
    this.state.right = false;
    this.state.jump = false;
    this.state.attack = false;
    this.state.omnitrix = false;
    this.state.alienSelect = -1;

    for (const [, id] of activeTouches) {
      switch (id) {
        case 'left': this.state.left = true; break;
        case 'right': this.state.right = true; break;
        case 'jump': this.state.jump = true; break;
        case 'attack': this.state.attack = true; break;
        case 'omnitrix': this.state.omnitrix = true; break;
      }
      if (id.startsWith('alien_')) {
        this.state.alienSelect = parseInt(id.split('_')[1]);
      }
    }
  }

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const v = this.toVirtual(t.clientX, t.clientY);
      const id = this.hitTest(v.x, v.y);
      if (id) {
        activeTouches.set(t.identifier, id);
      }
    }
    this.updateStateFromTouches();
  };

  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const v = this.toVirtual(t.clientX, t.clientY);
      const id = this.hitTest(v.x, v.y);
      if (id) {
        activeTouches.set(t.identifier, id);
      } else {
        activeTouches.delete(t.identifier);
      }
    }
    this.updateStateFromTouches();
  };

  private onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      activeTouches.delete(e.changedTouches[i].identifier);
    }
    this.updateStateFromTouches();
  };

  // Mouse support for testing
  private onMouseDown = (e: MouseEvent) => {
    const v = this.toVirtual(e.clientX, e.clientY);
    const id = this.hitTest(v.x, v.y);
    if (id) {
      activeTouches.set(-1, id);
    }
    this.updateStateFromTouches();
  };

  private onMouseUp = () => {
    activeTouches.delete(-1);
    this.updateStateFromTouches();
  };

  consumeAttack(): boolean {
    if (this.state.attack) {
      this.state.attack = false;
      activeTouches.forEach((v, k) => { if (v === 'attack') activeTouches.delete(k); });
      return true;
    }
    return false;
  }

  consumeOmnitrix(): boolean {
    if (this.state.omnitrix) {
      this.state.omnitrix = false;
      activeTouches.forEach((v, k) => { if (v === 'omnitrix') activeTouches.delete(k); });
      return true;
    }
    return false;
  }

  consumeAlienSelect(): number {
    const v = this.state.alienSelect;
    if (v >= 0) {
      this.state.alienSelect = -1;
      activeTouches.forEach((val, k) => { if (val.startsWith('alien_') || val === 'cancel_alien') activeTouches.delete(k); });
      return v;
    }
    // Check for cancel
    for (const [, val] of activeTouches) {
      if (val === 'cancel_alien') {
        activeTouches.forEach((val2, k) => { if (val2 === 'cancel_alien') activeTouches.delete(k); });
        return -2; // cancel signal
      }
    }
    return -1;
  }

  consumeJump(): boolean {
    if (this.state.jump) {
      this.state.jump = false;
      activeTouches.forEach((v, k) => { if (v === 'jump') activeTouches.delete(k); });
      return true;
    }
    return false;
  }

  // For splash/menu taps
  consumeAnyTap(): boolean {
    if (activeTouches.size > 0) {
      activeTouches.clear();
      this.updateStateFromTouches();
      return true;
    }
    return false;
  }

  destroy() {
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.onTouchEnd);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
  }
}

