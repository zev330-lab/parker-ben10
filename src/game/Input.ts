import type { Vec2 } from '../types';

export interface InputState {
  move: Vec2;       // normalized -1..1
  attack: boolean;  // attack button held
  special: boolean; // special button pressed (one-shot)
  omnitrix: boolean; // omnitrix button pressed (one-shot)
}

const JOYSTICK_DEAD_ZONE = 12;
const JOYSTICK_MAX = 60;

export class Input {
  private canvas: HTMLCanvasElement;
  private moveTouch: number | null = null;
  private moveOrigin: Vec2 = { x: 0, y: 0 };
  private moveCurrent: Vec2 = { x: 0, y: 0 };
  private attackHeld = false;
  private specialPressed = false;
  private omnitrixPressed = false;
  private attackTouchId: number | null = null;
  private specialTouchId: number | null = null;

  // Joystick visual data for renderer
  joystickActive = false;
  joystickOrigin: Vec2 = { x: 0, y: 0 };
  joystickPos: Vec2 = { x: 0, y: 0 };

  // Button positions (set by GameView)
  attackBtnRect = { x: 0, y: 0, w: 90, h: 90 };
  specialBtnRect = { x: 0, y: 0, w: 70, h: 70 };
  omnitrixBtnRect = { x: 0, y: 0, w: 50, h: 50 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    canvas.addEventListener('touchend', this.onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', this.onTouchEnd, { passive: false });
  }

  private hitTest(x: number, y: number, rect: { x: number; y: number; w: number; h: number }) {
    // Generous hit area (1.5x)
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    const hw = rect.w * 0.75;
    const hh = rect.h * 0.75;
    return x >= cx - hw && x <= cx + hw && y >= cy - hh && y <= cy + hh;
  }

  private onTouchStart(e: TouchEvent) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const x = t.clientX - rect.left;
      const y = t.clientY - rect.top;

      // Check buttons first (right side)
      if (this.hitTest(x, y, this.omnitrixBtnRect)) {
        this.omnitrixPressed = true;
        continue;
      }
      if (this.hitTest(x, y, this.specialBtnRect)) {
        this.specialPressed = true;
        this.specialTouchId = t.identifier;
        continue;
      }
      if (this.hitTest(x, y, this.attackBtnRect)) {
        this.attackHeld = true;
        this.attackTouchId = t.identifier;
        continue;
      }

      // Left half = joystick
      if (x < rect.width * 0.5 && this.moveTouch === null) {
        this.moveTouch = t.identifier;
        this.moveOrigin = { x, y };
        this.moveCurrent = { x, y };
        this.joystickActive = true;
        this.joystickOrigin = { x, y };
        this.joystickPos = { x, y };
      }
    }
  }

  private onTouchMove(e: TouchEvent) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === this.moveTouch) {
        const rect = this.canvas.getBoundingClientRect();
        this.moveCurrent = { x: t.clientX - rect.left, y: t.clientY - rect.top };
        this.joystickPos = { ...this.moveCurrent };
      }
    }
  }

  private onTouchEnd(e: TouchEvent) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === this.moveTouch) {
        this.moveTouch = null;
        this.joystickActive = false;
      }
      if (t.identifier === this.attackTouchId) {
        this.attackHeld = false;
        this.attackTouchId = null;
      }
      if (t.identifier === this.specialTouchId) {
        this.specialTouchId = null;
      }
    }
  }

  read(): InputState {
    let mx = 0, my = 0;
    if (this.moveTouch !== null) {
      const dx = this.moveCurrent.x - this.moveOrigin.x;
      const dy = this.moveCurrent.y - this.moveOrigin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > JOYSTICK_DEAD_ZONE) {
        const clamped = Math.min(dist, JOYSTICK_MAX);
        mx = (dx / dist) * (clamped / JOYSTICK_MAX);
        my = (dy / dist) * (clamped / JOYSTICK_MAX);
      }
    }

    const state: InputState = {
      move: { x: mx, y: my },
      attack: this.attackHeld,
      special: this.specialPressed,
      omnitrix: this.omnitrixPressed,
    };

    // Reset one-shot inputs
    this.specialPressed = false;
    this.omnitrixPressed = false;

    return state;
  }

  /** Update button positions (called by GameView on resize) */
  setButtonRects(
    attack: { x: number; y: number; w: number; h: number },
    special: { x: number; y: number; w: number; h: number },
    omnitrix: { x: number; y: number; w: number; h: number },
  ) {
    this.attackBtnRect = attack;
    this.specialBtnRect = special;
    this.omnitrixBtnRect = omnitrix;
  }

  destroy() {
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.onTouchEnd);
  }
}
