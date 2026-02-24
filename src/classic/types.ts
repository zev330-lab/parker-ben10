export const GameState = {
  SPLASH: 0,
  LEVEL_INTRO: 1,
  PLAYING: 2,
  LEVEL_COMPLETE: 3,
  VICTORY: 4,
  ALIEN_SELECT: 5,
} as const;
export type GameState = (typeof GameState)[keyof typeof GameState];

export const AlienType = {
  HEATBLAST: 'heatblast',
  FOURARMS: 'fourarms',
  XLR8: 'xlr8',
  DIAMONDHEAD: 'diamondhead',
} as const;
export type AlienType = (typeof AlienType)[keyof typeof AlienType];

export interface Vec2 {
  x: number;
  y: number;
}

export interface Player {
  pos: Vec2;
  vel: Vec2;
  width: number;
  height: number;
  facing: 1 | -1;
  grounded: boolean;
  currentAlien: AlienType | null;
  health: number;
  maxHealth: number;
  invincibleTimer: number;
  attackCooldown: number;
  attackAnim: number;
  omnitrixCooldown: number;
  omnitrixMaxCooldown: number;
  unlockedAliens: AlienType[];
  animFrame: number;
  animTimer: number;
  shieldActive: boolean;
  shieldTimer: number;
  dashActive: boolean;
  dashTimer: number;
}

export interface Enemy {
  pos: Vec2;
  vel: Vec2;
  width: number;
  height: number;
  type: 'robot' | 'drone';
  health: number;
  maxHealth: number;
  alive: boolean;
  hitTimer: number;
  animFrame: number;
  animTimer: number;
  sineOffset: number;
  baseY: number;
}

export interface Projectile {
  pos: Vec2;
  vel: Vec2;
  width: number;
  height: number;
  type: 'fireball' | 'crystal' | 'punch_wave' | 'speed_dash';
  lifetime: number;
  fromPlayer: boolean;
}

export interface Particle {
  pos: Vec2;
  vel: Vec2;
  color: string;
  size: number;
  lifetime: number;
  maxLifetime: number;
}

export interface EnemySpawn {
  x: number;
  type: 'robot' | 'drone';
  count: number;
  spawned: boolean;
}

export interface LevelData {
  name: string;
  background: 'city' | 'desert' | 'forest' | 'space';
  width: number;
  newAlien: AlienType;
  enemySpawns: EnemySpawn[];
}

export interface Camera {
  x: number;
  y: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
  omnitrix: boolean;
  alienSelect: number; // -1 = none, 0-3 = alien index
}

// Virtual canvas dimensions
export const VIRTUAL_WIDTH = 1280;
export const VIRTUAL_HEIGHT = 720;

// Physics
export const GRAVITY = 1800;
export const GROUND_Y = 580;
export const PLAYER_SPEED = 300;
export const PLAYER_JUMP_VEL = -620;

// Timers
export const OMNITRIX_COOLDOWN = 8;
export const ATTACK_COOLDOWN = 0.35;
export const INVINCIBLE_TIME = 1.5;
export const KNOCKBACK_VEL_X = 300;
export const KNOCKBACK_VEL_Y = -250;

// Alien stats
export const ALIEN_STATS: Record<AlienType, {
  speed: number;
  jumpVel: number;
  attackRange: number;
  attackDamage: number;
  color: string;
  name: string;
  width: number;
  height: number;
}> = {
  [AlienType.HEATBLAST]: { speed: 320, jumpVel: -620, attackRange: 500, attackDamage: 2, color: '#ff6600', name: 'Heatblast', width: 50, height: 70 },
  [AlienType.FOURARMS]: { speed: 250, jumpVel: -550, attackRange: 130, attackDamage: 4, color: '#cc0000', name: 'Four Arms', width: 65, height: 80 },
  [AlienType.XLR8]: { speed: 520, jumpVel: -650, attackRange: 300, attackDamage: 1, color: '#0088ff', name: 'XLR8', width: 45, height: 65 },
  [AlienType.DIAMONDHEAD]: { speed: 290, jumpVel: -600, attackRange: 90, attackDamage: 3, color: '#00ccaa', name: 'Diamondhead', width: 55, height: 75 },
};

// Level definitions
export const LEVELS: LevelData[] = [
  {
    name: 'Bellwood City',
    background: 'city',
    width: 4000,
    newAlien: AlienType.HEATBLAST,
    enemySpawns: [
      { x: 400, type: 'robot', count: 2, spawned: false },
      { x: 900, type: 'robot', count: 2, spawned: false },
      { x: 1400, type: 'drone', count: 1, spawned: false },
      { x: 1800, type: 'robot', count: 3, spawned: false },
      { x: 2300, type: 'drone', count: 2, spawned: false },
      { x: 2800, type: 'robot', count: 2, spawned: false },
      { x: 3200, type: 'robot', count: 3, spawned: false },
      { x: 3500, type: 'drone', count: 2, spawned: false },
    ],
  },
  {
    name: 'Dusty Desert',
    background: 'desert',
    width: 4500,
    newAlien: AlienType.FOURARMS,
    enemySpawns: [
      { x: 400, type: 'robot', count: 3, spawned: false },
      { x: 900, type: 'drone', count: 2, spawned: false },
      { x: 1400, type: 'robot', count: 3, spawned: false },
      { x: 1900, type: 'drone', count: 2, spawned: false },
      { x: 2400, type: 'robot', count: 4, spawned: false },
      { x: 2900, type: 'drone', count: 2, spawned: false },
      { x: 3400, type: 'robot', count: 3, spawned: false },
      { x: 3900, type: 'drone', count: 3, spawned: false },
    ],
  },
  {
    name: 'Wild Forest',
    background: 'forest',
    width: 5000,
    newAlien: AlienType.XLR8,
    enemySpawns: [
      { x: 400, type: 'drone', count: 2, spawned: false },
      { x: 900, type: 'robot', count: 3, spawned: false },
      { x: 1400, type: 'drone', count: 3, spawned: false },
      { x: 2000, type: 'robot', count: 4, spawned: false },
      { x: 2600, type: 'drone', count: 3, spawned: false },
      { x: 3200, type: 'robot', count: 3, spawned: false },
      { x: 3800, type: 'drone', count: 2, spawned: false },
      { x: 4300, type: 'robot', count: 4, spawned: false },
    ],
  },
  {
    name: 'Space Station',
    background: 'space',
    width: 5500,
    newAlien: AlienType.DIAMONDHEAD,
    enemySpawns: [
      { x: 400, type: 'drone', count: 3, spawned: false },
      { x: 900, type: 'robot', count: 3, spawned: false },
      { x: 1500, type: 'drone', count: 3, spawned: false },
      { x: 2100, type: 'robot', count: 4, spawned: false },
      { x: 2700, type: 'drone', count: 4, spawned: false },
      { x: 3300, type: 'robot', count: 4, spawned: false },
      { x: 3900, type: 'drone', count: 3, spawned: false },
      { x: 4500, type: 'robot', count: 5, spawned: false },
      { x: 5000, type: 'drone', count: 3, spawned: false },
    ],
  },
];

