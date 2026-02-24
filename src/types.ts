// ===== SCENE MANAGEMENT =====
export type Scene = 'splash' | 'menu' | 'gamepicker' | 'classic' | 'worldmap' | 'aliendex' | 'playing' | 'levelcomplete' | 'victory';

// ===== VECTOR =====
export interface Vec2 { x: number; y: number; }

// ===== ALIEN =====
export type AlienId =
  | 'heatblast' | 'fourarms' | 'xlr8' | 'diamondhead'
  | 'ghostfreak' | 'wildmutt' | 'stinkfly' | 'cannonbolt'
  | 'upgrade' | 'ripjaws' | 'waybig';

export interface AttackDef {
  name: string;
  damage: number;
  cooldown: number;
  range: number;
  projectileSpeed: number;
  projectileRadius: number;
  type: 'projectile' | 'melee' | 'aoe';
  piercing: boolean;
  color: string;
}

export interface AbilityDef {
  name: string;
  damage: number;
  cooldown: number;
  range: number;
  type: 'projectile' | 'melee' | 'aoe' | 'dash' | 'shield' | 'buff';
  duration: number;
  color: string;
  description: string;
  projectileSpeed?: number;
  projectileRadius?: number;
  piercing?: boolean;
}

export interface AlienDef {
  id: AlienId;
  name: string;
  color: string;
  accentColor: string;
  radius: number;
  speed: number;
  health: number;
  basicAttack: AttackDef;
  specialAbility: AbilityDef;
  description: string;
}

// ===== ENEMY =====
export type EnemyType = 'drone' | 'robot' | 'turret' | 'charger';

export interface EnemyDef {
  type: EnemyType;
  radius: number;
  speed: number;
  health: number;
  damage: number;
  attackCooldown: number;
  color: string;
  accentColor: string;
}

// ===== BOSS =====
export type BossId = 'vilgax_mech' | 'sand_worm' | 'shadow_beast' | 'kraken' | 'vilgax_supreme';

export type PatternType = 'chase' | 'shoot' | 'aoe' | 'charge' | 'summon' | 'spiral';

export interface BossPattern {
  type: PatternType;
  duration: number;
  cooldown: number;
  params: Record<string, number>;
}

export interface BossPhase {
  healthThreshold: number;
  patterns: BossPattern[];
  speed: number;
}

export interface BossDef {
  id: BossId;
  name: string;
  radius: number;
  health: number;
  color: string;
  accentColor: string;
  phases: BossPhase[];
}

// ===== WORLD & MISSION =====
export type WorldId = 'bellwood' | 'desert' | 'shadow' | 'ocean' | 'vilgax';

export interface WaveDef {
  enemies: { type: EnemyType; count: number }[];
  delay: number;
}

export interface MissionDef {
  id: string;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3;
  worldId: WorldId;
  missionIndex: number;
  isBoss: boolean;
  arenaRadius: number;
  waves: WaveDef[];
  boss?: BossId;
  unlockAliens: AlienId[];
  background: WorldId;
}

export interface WorldDef {
  id: WorldId;
  name: string;
  color: string;
  missions: MissionDef[];
}

// ===== RUNTIME ENTITIES =====
export interface Entity {
  id: number;
  pos: Vec2;
  vel: Vec2;
  radius: number;
  rotation: number;
  alive: boolean;
}

export interface PlayerState extends Entity {
  currentAlien: AlienId;
  health: number;
  maxHealth: number;
  invincibleTimer: number;
  basicCooldown: number;
  specialCooldown: number;
  specialMaxCooldown: number;
  dashTimer: number;
  dashDamage: number;
  dashColor: string;
  shieldTimer: number;
  buffTimer: number;
  score: number;
  comboCount: number;
  comboTimer: number;
  damageDealt: number;
  damageTaken: number;
  attackAnim: number;
  specialAnim: number;
}

export interface EnemyState extends Entity {
  type: EnemyType;
  health: number;
  maxHealth: number;
  hitTimer: number;
  attackCooldown: number;
  aiState: 'idle' | 'chase' | 'attack' | 'retreat' | 'charge_telegraph' | 'charging';
  aiTimer: number;
  targetAngle: number;
}

export interface BossState extends Entity {
  bossId: BossId;
  health: number;
  maxHealth: number;
  phaseIndex: number;
  patternIndex: number;
  patternTimer: number;
  hitTimer: number;
  attackCooldown: number;
  telegraphTimer: number;
  telegraphPos: Vec2 | null;
}

export interface ProjectileState extends Entity {
  damage: number;
  fromPlayer: boolean;
  lifetime: number;
  maxLifetime: number;
  piercing: boolean;
  hitIds: Set<number>;
  color: string;
  projType: 'bullet' | 'aoe_ring' | 'dash_trail' | 'wave';
}

export interface ParticleState {
  pos: Vec2;
  vel: Vec2;
  color: string;
  radius: number;
  lifetime: number;
  maxLifetime: number;
}

export interface FloatingText {
  pos: Vec2;
  text: string;
  color: string;
  size: number;
  lifetime: number;
  maxLifetime: number;
}

// ===== SAVE DATA =====
export interface SaveData {
  unlockedAliens: AlienId[];
  missionStars: Record<string, number>;
  currentWorld: number;
}

// ===== GAME <-> REACT BRIDGE =====
export interface HudState {
  health: number;
  maxHealth: number;
  score: number;
  wave: number;
  totalWaves: number;
  currentAlien: AlienId;
  specialCooldownPct: number;
  bossHealth?: number;
  bossMaxHealth?: number;
  bossName?: string;
}

export interface GameCallbacks {
  onHudUpdate: (hud: HudState) => void;
  onLevelComplete: (score: number, stars: number) => void;
  onPlayerDied: () => void;
  onRequestAlienSelect: () => void;
}

// ===== CONSTANTS =====
export const VIRTUAL_WIDTH = 1280;
export const VIRTUAL_HEIGHT = 720;
export const INVINCIBLE_TIME = 1.5;
