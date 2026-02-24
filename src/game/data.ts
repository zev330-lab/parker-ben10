import type { AlienDef, AlienId, EnemyDef, EnemyType, BossDef, BossId, WorldDef, MissionDef, WorldId } from '../types';

export const ALIEN_DEFS: Record<AlienId, AlienDef> = {
  heatblast: {
    id: 'heatblast', name: 'Heatblast', color: '#ff6600', accentColor: '#ffaa00',
    radius: 22, speed: 200, health: 6,
    basicAttack: { name: 'Fireball', damage: 2, cooldown: 0.4, range: 400, projectileSpeed: 350, projectileRadius: 8, type: 'projectile', piercing: false, color: '#ff4400' },
    specialAbility: { name: 'Fire Ring', damage: 3, cooldown: 5, range: 120, type: 'aoe', duration: 0.5, color: '#ff6600', description: 'Ring of fire damages nearby enemies' },
    description: 'A fiery alien who shoots fireballs!',
  },
  fourarms: {
    id: 'fourarms', name: 'Four Arms', color: '#cc0000', accentColor: '#ff4444',
    radius: 28, speed: 160, health: 10,
    basicAttack: { name: 'Mega Punch', damage: 3, cooldown: 0.5, range: 60, projectileSpeed: 0, projectileRadius: 35, type: 'melee', piercing: false, color: '#ff2222' },
    specialAbility: { name: 'Ground Slam', damage: 4, cooldown: 6, range: 150, type: 'aoe', duration: 0.6, color: '#cc0000', description: 'Smash the ground to damage all nearby enemies' },
    description: 'Super strong with four powerful arms!',
  },
  xlr8: {
    id: 'xlr8', name: 'XLR8', color: '#0088ff', accentColor: '#00ccff',
    radius: 18, speed: 320, health: 5,
    basicAttack: { name: 'Speed Strike', damage: 1, cooldown: 0.2, range: 350, projectileSpeed: 500, projectileRadius: 6, type: 'projectile', piercing: false, color: '#00aaff' },
    specialAbility: { name: 'Dash Through', damage: 2, cooldown: 4, range: 250, type: 'dash', duration: 0.3, color: '#0088ff', description: 'Dash through enemies at lightning speed' },
    description: 'The fastest alien in the Omnitrix!',
  },
  diamondhead: {
    id: 'diamondhead', name: 'Diamondhead', color: '#00ccaa', accentColor: '#80ffec',
    radius: 24, speed: 180, health: 8,
    basicAttack: { name: 'Crystal Shard', damage: 2, cooldown: 0.45, range: 380, projectileSpeed: 320, projectileRadius: 7, type: 'projectile', piercing: false, color: '#80ffec' },
    specialAbility: { name: 'Crystal Shield', damage: 1, cooldown: 7, range: 50, type: 'shield', duration: 3, color: '#00ccaa', description: 'Create a crystal shield that blocks damage' },
    description: 'Made of living diamond crystal!',
  },
  ghostfreak: {
    id: 'ghostfreak', name: 'Ghostfreak', color: '#9933ff', accentColor: '#cc88ff',
    radius: 20, speed: 210, health: 6,
    basicAttack: { name: 'Phase Claw', damage: 2, cooldown: 0.4, range: 55, projectileSpeed: 0, projectileRadius: 30, type: 'melee', piercing: false, color: '#bb77ff' },
    specialAbility: { name: 'Terror Wave', damage: 3, cooldown: 5, range: 140, type: 'aoe', duration: 0.5, color: '#9933ff', description: 'Release a wave of ghostly energy' },
    description: 'A spooky ghost alien with scary powers!',
  },
  wildmutt: {
    id: 'wildmutt', name: 'Wildmutt', color: '#cc6600', accentColor: '#ff9944',
    radius: 22, speed: 260, health: 7,
    basicAttack: { name: 'Bite', damage: 3, cooldown: 0.35, range: 50, projectileSpeed: 0, projectileRadius: 28, type: 'melee', piercing: false, color: '#ff8800' },
    specialAbility: { name: 'Pounce', damage: 4, cooldown: 4, range: 200, type: 'dash', duration: 0.25, color: '#cc6600', description: 'Leap at the nearest enemy with savage force', projectileSpeed: 600 },
    description: 'A wild beast alien with super senses!',
  },
  stinkfly: {
    id: 'stinkfly', name: 'Stinkfly', color: '#66cc00', accentColor: '#88ff22',
    radius: 20, speed: 190, health: 5,
    basicAttack: { name: 'Goo Spit', damage: 2, cooldown: 0.5, range: 420, projectileSpeed: 300, projectileRadius: 9, type: 'projectile', piercing: false, color: '#88ff22' },
    specialAbility: { name: 'Swarm Cloud', damage: 1, cooldown: 6, range: 100, type: 'aoe', duration: 3, color: '#66cc00', description: 'Create a cloud that damages enemies over time' },
    description: 'A flying bug alien that spits goo!',
  },
  cannonbolt: {
    id: 'cannonbolt', name: 'Cannonbolt', color: '#ffcc00', accentColor: '#fff',
    radius: 26, speed: 170, health: 9,
    basicAttack: { name: 'Roll Slam', damage: 3, cooldown: 0.5, range: 55, projectileSpeed: 0, projectileRadius: 32, type: 'melee', piercing: false, color: '#ffdd44' },
    specialAbility: { name: 'Cannonball', damage: 5, cooldown: 5, range: 300, type: 'dash', duration: 0.4, color: '#ffcc00', description: 'Roll into a ball and smash through enemies', projectileSpeed: 500 },
    description: 'Rolls into an armored ball of destruction!',
  },
  upgrade: {
    id: 'upgrade', name: 'Upgrade', color: '#111', accentColor: '#00ff66',
    radius: 22, speed: 200, health: 6,
    basicAttack: { name: 'Energy Beam', damage: 2, cooldown: 0.35, range: 400, projectileSpeed: 400, projectileRadius: 6, type: 'projectile', piercing: true, color: '#00ff66' },
    specialAbility: { name: 'Tech Overload', damage: 2, cooldown: 6, range: 160, type: 'aoe', duration: 0.4, color: '#00cc44', description: 'Overload nearby tech, damaging all enemies in range' },
    description: 'A tech alien that merges with machines!',
  },
  ripjaws: {
    id: 'ripjaws', name: 'Ripjaws', color: '#006688', accentColor: '#00ccdd',
    radius: 24, speed: 220, health: 7,
    basicAttack: { name: 'Jaw Snap', damage: 3, cooldown: 0.4, range: 55, projectileSpeed: 0, projectileRadius: 30, type: 'melee', piercing: false, color: '#00aacc' },
    specialAbility: { name: 'Tidal Wave', damage: 3, cooldown: 5, range: 200, type: 'aoe', duration: 0.6, color: '#006688', description: 'Unleash a tidal wave that pushes and damages enemies', projectileSpeed: 350, projectileRadius: 40, piercing: true },
    description: 'A fierce sea creature with powerful jaws!',
  },
  waybig: {
    id: 'waybig', name: 'Way Big', color: '#cc2222', accentColor: '#ddd',
    radius: 35, speed: 140, health: 12,
    basicAttack: { name: 'Cosmic Punch', damage: 4, cooldown: 0.6, range: 70, projectileSpeed: 0, projectileRadius: 45, type: 'melee', piercing: false, color: '#ff4444' },
    specialAbility: { name: 'Cosmic Ray', damage: 6, cooldown: 8, range: 500, type: 'projectile', duration: 0.8, color: '#ff6644', description: 'Fire a massive cosmic energy beam', projectileSpeed: 300, projectileRadius: 25, piercing: true },
    description: 'The biggest and most powerful alien!',
  },
};

export const ENEMY_DEFS: Record<EnemyType, EnemyDef> = {
  robot:   { type: 'robot',   radius: 18, speed: 70,  health: 4, damage: 1, attackCooldown: 1.5, color: '#888', accentColor: '#ff4444' },
  drone:   { type: 'drone',   radius: 15, speed: 90,  health: 2, damage: 1, attackCooldown: 2.0, color: '#607d8b', accentColor: '#ff0000' },
  turret:  { type: 'turret',  radius: 20, speed: 0,   health: 5, damage: 1, attackCooldown: 1.2, color: '#555', accentColor: '#ff0000' },
  charger: { type: 'charger', radius: 16, speed: 50,  health: 3, damage: 2, attackCooldown: 3.0, color: '#cc4444', accentColor: '#ff8888' },
};

export const BOSS_DEFS: Record<BossId, BossDef> = {
  vilgax_mech: {
    id: 'vilgax_mech', name: 'Vilgax Mech', radius: 45, health: 40, color: '#4a148c', accentColor: '#ff0000',
    phases: [
      { healthThreshold: 1, speed: 60, patterns: [
        { type: 'chase', duration: 3, cooldown: 0, params: {} },
        { type: 'shoot', duration: 4, cooldown: 0.8, params: { count: 3, spread: 0.4 } },
        { type: 'chase', duration: 2, cooldown: 0, params: {} },
      ]},
      { healthThreshold: 0.5, speed: 80, patterns: [
        { type: 'charge', duration: 2.5, cooldown: 0, params: {} },
        { type: 'spiral', duration: 4, cooldown: 0, params: { arms: 3, interval: 0.18, rotSpeed: 2.5 } },
        { type: 'chase', duration: 2, cooldown: 0, params: {} },
        { type: 'shoot', duration: 3, cooldown: 0.5, params: { count: 5, spread: 0.3 } },
      ]},
    ],
  },
  sand_worm: {
    id: 'sand_worm', name: 'Sand Worm', radius: 40, health: 50, color: '#8d6e3f', accentColor: '#d4a843',
    phases: [
      { healthThreshold: 1, speed: 50, patterns: [
        { type: 'charge', duration: 3, cooldown: 0, params: {} },
        { type: 'aoe', duration: 2, cooldown: 0, params: { radius: 120 } },
        { type: 'chase', duration: 3, cooldown: 0, params: {} },
      ]},
      { healthThreshold: 0.5, speed: 70, patterns: [
        { type: 'summon', duration: 2, cooldown: 0, params: { type: 2, count: 3 } },
        { type: 'charge', duration: 2, cooldown: 0, params: {} },
        { type: 'shoot', duration: 3, cooldown: 0.6, params: { count: 4, spread: 0.5 } },
        { type: 'aoe', duration: 2, cooldown: 0, params: { radius: 150 } },
      ]},
    ],
  },
  shadow_beast: {
    id: 'shadow_beast', name: 'Shadow Beast', radius: 42, health: 55, color: '#1a1a2e', accentColor: '#9933ff',
    phases: [
      { healthThreshold: 1, speed: 80, patterns: [
        { type: 'chase', duration: 2, cooldown: 0, params: {} },
        { type: 'shoot', duration: 3, cooldown: 0.6, params: { count: 5, spread: 0.35 } },
        { type: 'charge', duration: 2.5, cooldown: 0, params: {} },
      ]},
      { healthThreshold: 0.5, speed: 100, patterns: [
        { type: 'spiral', duration: 4, cooldown: 0, params: { arms: 4, interval: 0.15, rotSpeed: 3 } },
        { type: 'summon', duration: 2, cooldown: 0, params: { type: 0, count: 4 } },
        { type: 'charge', duration: 2, cooldown: 0, params: {} },
        { type: 'shoot', duration: 3, cooldown: 0.4, params: { count: 7, spread: 0.25 } },
      ]},
    ],
  },
  kraken: {
    id: 'kraken', name: 'Kraken', radius: 50, health: 65, color: '#004466', accentColor: '#00ccff',
    phases: [
      { healthThreshold: 1, speed: 40, patterns: [
        { type: 'aoe', duration: 3, cooldown: 0, params: { radius: 140 } },
        { type: 'shoot', duration: 4, cooldown: 0.7, params: { count: 6, spread: 0.3 } },
        { type: 'chase', duration: 3, cooldown: 0, params: {} },
      ]},
      { healthThreshold: 0.6, speed: 55, patterns: [
        { type: 'summon', duration: 2, cooldown: 0, params: { type: 0, count: 3 } },
        { type: 'spiral', duration: 4, cooldown: 0, params: { arms: 5, interval: 0.12, rotSpeed: 2 } },
        { type: 'charge', duration: 2.5, cooldown: 0, params: {} },
      ]},
      { healthThreshold: 0.3, speed: 70, patterns: [
        { type: 'charge', duration: 2, cooldown: 0, params: {} },
        { type: 'spiral', duration: 5, cooldown: 0, params: { arms: 6, interval: 0.1, rotSpeed: 3.5 } },
        { type: 'aoe', duration: 2, cooldown: 0, params: { radius: 180 } },
        { type: 'shoot', duration: 3, cooldown: 0.3, params: { count: 8, spread: 0.2 } },
      ]},
    ],
  },
  vilgax_supreme: {
    id: 'vilgax_supreme', name: 'Vilgax Supreme', radius: 48, health: 80, color: '#2a0a4a', accentColor: '#ff0044',
    phases: [
      { healthThreshold: 1, speed: 70, patterns: [
        { type: 'shoot', duration: 3, cooldown: 0.5, params: { count: 5, spread: 0.3 } },
        { type: 'charge', duration: 2.5, cooldown: 0, params: {} },
        { type: 'chase', duration: 2, cooldown: 0, params: {} },
      ]},
      { healthThreshold: 0.65, speed: 90, patterns: [
        { type: 'spiral', duration: 4, cooldown: 0, params: { arms: 4, interval: 0.14, rotSpeed: 3 } },
        { type: 'summon', duration: 2, cooldown: 0, params: { type: 3, count: 3 } },
        { type: 'charge', duration: 2, cooldown: 0, params: {} },
        { type: 'shoot', duration: 3, cooldown: 0.35, params: { count: 7, spread: 0.25 } },
      ]},
      { healthThreshold: 0.3, speed: 110, patterns: [
        { type: 'aoe', duration: 2, cooldown: 0, params: { radius: 160 } },
        { type: 'spiral', duration: 5, cooldown: 0, params: { arms: 6, interval: 0.1, rotSpeed: 4 } },
        { type: 'charge', duration: 1.5, cooldown: 0, params: {} },
        { type: 'summon', duration: 2, cooldown: 0, params: { type: 1, count: 4 } },
        { type: 'shoot', duration: 3, cooldown: 0.25, params: { count: 9, spread: 0.2 } },
      ]},
    ],
  },
};

function makeWaves(waveDefs: { enemies: { type: EnemyType; count: number }[]; delay: number }[]) {
  return waveDefs;
}

export const WORLDS: WorldDef[] = [
  {
    id: 'bellwood', name: 'Bellwood City', color: '#3949ab',
    missions: [
      { id: 'bellwood_0', name: 'City Park', description: 'Robots are attacking the park! Clear them out with your fireballs.', difficulty: 1, worldId: 'bellwood', missionIndex: 0, isBoss: false, arenaRadius: 320, background: 'bellwood', unlockAliens: ['heatblast'],
        waves: makeWaves([
          { enemies: [{ type: 'robot', count: 3 }], delay: 1 },
          { enemies: [{ type: 'robot', count: 3 }, { type: 'drone', count: 2 }], delay: 2 },
          { enemies: [{ type: 'robot', count: 4 }, { type: 'drone', count: 2 }], delay: 2 },
        ]),
      },
      { id: 'bellwood_1', name: 'Downtown', description: 'The invasion has spread downtown. Chargers join the fight!', difficulty: 1, worldId: 'bellwood', missionIndex: 1, isBoss: false, arenaRadius: 340, background: 'bellwood', unlockAliens: ['fourarms'],
        waves: makeWaves([
          { enemies: [{ type: 'robot', count: 4 }, { type: 'drone', count: 1 }], delay: 1 },
          { enemies: [{ type: 'drone', count: 3 }, { type: 'robot', count: 2 }], delay: 2 },
          { enemies: [{ type: 'robot', count: 3 }, { type: 'drone', count: 3 }, { type: 'charger', count: 1 }], delay: 2 },
        ]),
      },
      { id: 'bellwood_2', name: 'Rooftops', description: 'Battle drones and robots on the city rooftops. Watch out for swarms!', difficulty: 1, worldId: 'bellwood', missionIndex: 2, isBoss: false, arenaRadius: 300, background: 'bellwood', unlockAliens: [],
        waves: makeWaves([
          { enemies: [{ type: 'drone', count: 4 }], delay: 1 },
          { enemies: [{ type: 'robot', count: 3 }, { type: 'drone', count: 3 }], delay: 2 },
          { enemies: [{ type: 'charger', count: 2 }, { type: 'drone', count: 3 }, { type: 'robot', count: 2 }], delay: 2 },
          { enemies: [{ type: 'robot', count: 4 }, { type: 'drone', count: 3 }], delay: 2 },
        ]),
      },
      { id: 'bellwood_3', name: 'Vilgax Mech', description: 'Vilgax has sent his mech! Defeat the boss to save Bellwood.', difficulty: 2, worldId: 'bellwood', missionIndex: 3, isBoss: true, arenaRadius: 380, background: 'bellwood', unlockAliens: [], boss: 'vilgax_mech',
        waves: makeWaves([
          { enemies: [{ type: 'robot', count: 3 }], delay: 1 },
          { enemies: [{ type: 'drone', count: 3 }], delay: 2 },
        ]),
      },
    ],
  },
  {
    id: 'desert', name: 'Desert Wasteland', color: '#e65100',
    missions: [
      { id: 'desert_0', name: 'Oasis Camp', description: 'Chargers patrol the desert oasis. Use speed to your advantage!', difficulty: 1, worldId: 'desert', missionIndex: 0, isBoss: false, arenaRadius: 340, background: 'desert', unlockAliens: ['xlr8'],
        waves: makeWaves([
          { enemies: [{ type: 'charger', count: 2 }, { type: 'robot', count: 2 }], delay: 1 },
          { enemies: [{ type: 'robot', count: 3 }, { type: 'drone', count: 3 }], delay: 2 },
          { enemies: [{ type: 'charger', count: 3 }, { type: 'drone', count: 2 }], delay: 2 },
        ]),
      },
      { id: 'desert_1', name: 'Canyon Pass', description: 'Turrets guard the canyon. Take cover and strike back!', difficulty: 2, worldId: 'desert', missionIndex: 1, isBoss: false, arenaRadius: 320, background: 'desert', unlockAliens: ['diamondhead'],
        waves: makeWaves([
          { enemies: [{ type: 'turret', count: 2 }, { type: 'robot', count: 3 }], delay: 1 },
          { enemies: [{ type: 'charger', count: 3 }, { type: 'drone', count: 2 }], delay: 2 },
          { enemies: [{ type: 'turret', count: 2 }, { type: 'charger', count: 2 }, { type: 'robot', count: 2 }], delay: 2 },
          { enemies: [{ type: 'drone', count: 4 }, { type: 'robot', count: 3 }], delay: 2 },
        ]),
      },
      { id: 'desert_2', name: 'Sandstorm', description: 'A sandstorm brings waves of enemies from every direction.', difficulty: 2, worldId: 'desert', missionIndex: 2, isBoss: false, arenaRadius: 350, background: 'desert', unlockAliens: [],
        waves: makeWaves([
          { enemies: [{ type: 'charger', count: 3 }, { type: 'robot', count: 3 }], delay: 1 },
          { enemies: [{ type: 'turret', count: 3 }, { type: 'drone', count: 3 }], delay: 2 },
          { enemies: [{ type: 'charger', count: 4 }, { type: 'robot', count: 3 }], delay: 2 },
          { enemies: [{ type: 'turret', count: 2 }, { type: 'drone', count: 4 }, { type: 'charger', count: 2 }], delay: 2 },
        ]),
      },
      { id: 'desert_3', name: 'Sand Worm Lair', description: 'The Sand Worm lurks below. Dodge its charges and strike when it surfaces!', difficulty: 2, worldId: 'desert', missionIndex: 3, isBoss: true, arenaRadius: 400, background: 'desert', unlockAliens: [], boss: 'sand_worm',
        waves: makeWaves([
          { enemies: [{ type: 'charger', count: 3 }], delay: 1 },
          { enemies: [{ type: 'robot', count: 3 }, { type: 'drone', count: 2 }], delay: 2 },
        ]),
      },
    ],
  },
  {
    id: 'shadow', name: 'Shadow Forest', color: '#2e7d32',
    missions: [
      { id: 'shadow_0', name: 'Dark Clearing', description: 'Strange creatures lurk in the shadowy clearing. Stay alert!', difficulty: 2, worldId: 'shadow', missionIndex: 0, isBoss: false, arenaRadius: 330, background: 'shadow', unlockAliens: ['ghostfreak'],
        waves: makeWaves([
          { enemies: [{ type: 'drone', count: 3 }, { type: 'robot', count: 2 }], delay: 1 },
          { enemies: [{ type: 'charger', count: 2 }, { type: 'drone', count: 3 }], delay: 2 },
          { enemies: [{ type: 'robot', count: 4 }, { type: 'turret', count: 2 }], delay: 2 },
          { enemies: [{ type: 'charger', count: 3 }, { type: 'drone', count: 3 }], delay: 2 },
        ]),
      },
      { id: 'shadow_1', name: 'Mushroom Grove', description: 'Turrets and chargers hide among the giant mushrooms.', difficulty: 2, worldId: 'shadow', missionIndex: 1, isBoss: false, arenaRadius: 340, background: 'shadow', unlockAliens: ['wildmutt'],
        waves: makeWaves([
          { enemies: [{ type: 'charger', count: 3 }, { type: 'turret', count: 2 }], delay: 1 },
          { enemies: [{ type: 'drone', count: 4 }, { type: 'robot', count: 3 }], delay: 2 },
          { enemies: [{ type: 'turret', count: 3 }, { type: 'charger', count: 3 }], delay: 2 },
          { enemies: [{ type: 'robot', count: 4 }, { type: 'drone', count: 4 }], delay: 2 },
        ]),
      },
      { id: 'shadow_2', name: 'Ancient Ruins', description: 'Fight through ancient ruins swarming with all enemy types.', difficulty: 2, worldId: 'shadow', missionIndex: 2, isBoss: false, arenaRadius: 350, background: 'shadow', unlockAliens: [],
        waves: makeWaves([
          { enemies: [{ type: 'turret', count: 3 }, { type: 'robot', count: 3 }], delay: 1 },
          { enemies: [{ type: 'charger', count: 4 }, { type: 'drone', count: 3 }], delay: 2 },
          { enemies: [{ type: 'robot', count: 4 }, { type: 'turret', count: 2 }, { type: 'charger', count: 2 }], delay: 2 },
          { enemies: [{ type: 'drone', count: 5 }, { type: 'charger', count: 3 }], delay: 2 },
        ]),
      },
      { id: 'shadow_3', name: 'Shadow Beast Den', description: 'Face the Shadow Beast in its den. It summons minions and fires spirals!', difficulty: 3, worldId: 'shadow', missionIndex: 3, isBoss: true, arenaRadius: 380, background: 'shadow', unlockAliens: [], boss: 'shadow_beast',
        waves: makeWaves([
          { enemies: [{ type: 'drone', count: 4 }], delay: 1 },
          { enemies: [{ type: 'charger', count: 3 }, { type: 'robot', count: 2 }], delay: 2 },
        ]),
      },
    ],
  },
  {
    id: 'ocean', name: 'Deep Ocean', color: '#006688',
    missions: [
      { id: 'ocean_0', name: 'Coral Reef', description: 'Drones and turrets patrol the reef. Keep moving to survive!', difficulty: 2, worldId: 'ocean', missionIndex: 0, isBoss: false, arenaRadius: 340, background: 'ocean', unlockAliens: ['stinkfly'],
        waves: makeWaves([
          { enemies: [{ type: 'drone', count: 4 }, { type: 'robot', count: 2 }], delay: 1 },
          { enemies: [{ type: 'turret', count: 2 }, { type: 'charger', count: 3 }], delay: 2 },
          { enemies: [{ type: 'robot', count: 4 }, { type: 'drone', count: 3 }], delay: 2 },
          { enemies: [{ type: 'charger', count: 3 }, { type: 'turret', count: 2 }, { type: 'drone', count: 2 }], delay: 2 },
        ]),
      },
      { id: 'ocean_1', name: 'Sunken Ship', description: 'Explore the sunken ship, but heavy resistance awaits inside.', difficulty: 2, worldId: 'ocean', missionIndex: 1, isBoss: false, arenaRadius: 350, background: 'ocean', unlockAliens: ['ripjaws'],
        waves: makeWaves([
          { enemies: [{ type: 'turret', count: 3 }, { type: 'drone', count: 3 }], delay: 1 },
          { enemies: [{ type: 'charger', count: 4 }, { type: 'robot', count: 3 }], delay: 2 },
          { enemies: [{ type: 'turret', count: 3 }, { type: 'drone', count: 4 }], delay: 2 },
          { enemies: [{ type: 'robot', count: 5 }, { type: 'charger', count: 3 }], delay: 2 },
        ]),
      },
      { id: 'ocean_2', name: 'Abyssal Trench', description: 'The deepest trench holds the fiercest enemies. Five waves of chaos!', difficulty: 3, worldId: 'ocean', missionIndex: 2, isBoss: false, arenaRadius: 360, background: 'ocean', unlockAliens: [],
        waves: makeWaves([
          { enemies: [{ type: 'charger', count: 4 }, { type: 'turret', count: 3 }], delay: 1 },
          { enemies: [{ type: 'drone', count: 5 }, { type: 'robot', count: 3 }], delay: 2 },
          { enemies: [{ type: 'turret', count: 3 }, { type: 'charger', count: 3 }, { type: 'robot', count: 3 }], delay: 2 },
          { enemies: [{ type: 'drone', count: 5 }, { type: 'charger', count: 4 }], delay: 2 },
          { enemies: [{ type: 'robot', count: 5 }, { type: 'turret', count: 3 }], delay: 2 },
        ]),
      },
      { id: 'ocean_3', name: 'Kraken Depths', description: 'The Kraken has three phases! Dodge spirals and AOE attacks.', difficulty: 3, worldId: 'ocean', missionIndex: 3, isBoss: true, arenaRadius: 420, background: 'ocean', unlockAliens: [], boss: 'kraken',
        waves: makeWaves([
          { enemies: [{ type: 'drone', count: 4 }, { type: 'robot', count: 3 }], delay: 1 },
          { enemies: [{ type: 'charger', count: 3 }, { type: 'turret', count: 2 }], delay: 2 },
        ]),
      },
    ],
  },
  {
    id: 'vilgax', name: "Vilgax's Domain", color: '#4a148c',
    missions: [
      { id: 'vilgax_0', name: 'Outer Defenses', description: 'Break through Vilgax\'s outer defense grid. Five intense waves!', difficulty: 3, worldId: 'vilgax', missionIndex: 0, isBoss: false, arenaRadius: 360, background: 'vilgax', unlockAliens: ['cannonbolt'],
        waves: makeWaves([
          { enemies: [{ type: 'turret', count: 3 }, { type: 'charger', count: 3 }], delay: 1 },
          { enemies: [{ type: 'robot', count: 4 }, { type: 'drone', count: 4 }], delay: 2 },
          { enemies: [{ type: 'charger', count: 4 }, { type: 'turret', count: 3 }], delay: 2 },
          { enemies: [{ type: 'drone', count: 5 }, { type: 'robot', count: 4 }], delay: 2 },
          { enemies: [{ type: 'turret', count: 3 }, { type: 'charger', count: 4 }], delay: 2 },
        ]),
      },
      { id: 'vilgax_1', name: 'Command Center', description: 'Infiltrate the command center. Every enemy type guards it.', difficulty: 3, worldId: 'vilgax', missionIndex: 1, isBoss: false, arenaRadius: 350, background: 'vilgax', unlockAliens: ['upgrade'],
        waves: makeWaves([
          { enemies: [{ type: 'charger', count: 4 }, { type: 'drone', count: 4 }], delay: 1 },
          { enemies: [{ type: 'turret', count: 4 }, { type: 'robot', count: 4 }], delay: 2 },
          { enemies: [{ type: 'charger', count: 5 }, { type: 'drone', count: 3 }], delay: 2 },
          { enemies: [{ type: 'robot', count: 5 }, { type: 'turret', count: 3 }, { type: 'charger', count: 2 }], delay: 2 },
          { enemies: [{ type: 'drone', count: 5 }, { type: 'charger', count: 4 }], delay: 2 },
        ]),
      },
      { id: 'vilgax_2', name: 'Throne Room', description: 'The toughest non-boss mission. Massive enemy waves in the throne room.', difficulty: 3, worldId: 'vilgax', missionIndex: 2, isBoss: false, arenaRadius: 370, background: 'vilgax', unlockAliens: [],
        waves: makeWaves([
          { enemies: [{ type: 'turret', count: 4 }, { type: 'charger', count: 4 }], delay: 1 },
          { enemies: [{ type: 'robot', count: 5 }, { type: 'drone', count: 4 }], delay: 2 },
          { enemies: [{ type: 'charger', count: 5 }, { type: 'turret', count: 3 }, { type: 'drone', count: 3 }], delay: 2 },
          { enemies: [{ type: 'robot', count: 5 }, { type: 'drone', count: 5 }], delay: 2 },
          { enemies: [{ type: 'charger', count: 5 }, { type: 'turret', count: 4 }, { type: 'robot', count: 3 }], delay: 2 },
        ]),
      },
      { id: 'vilgax_3', name: 'Vilgax Supreme', description: 'The final battle! Vilgax Supreme has 3 phases and summons minions.', difficulty: 3, worldId: 'vilgax', missionIndex: 3, isBoss: true, arenaRadius: 440, background: 'vilgax', unlockAliens: ['waybig'], boss: 'vilgax_supreme',
        waves: makeWaves([
          { enemies: [{ type: 'charger', count: 4 }, { type: 'drone', count: 4 }], delay: 1 },
          { enemies: [{ type: 'robot', count: 4 }, { type: 'turret', count: 3 }], delay: 2 },
        ]),
      },
    ],
  },
];

export function getMission(id: string): MissionDef | undefined {
  for (const world of WORLDS) {
    for (const mission of world.missions) {
      if (mission.id === id) return mission;
    }
  }
  return undefined;
}

export function getWorld(id: WorldId): WorldDef | undefined {
  return WORLDS.find(w => w.id === id);
}
