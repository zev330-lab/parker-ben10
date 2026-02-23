import type { MissionDef, EnemyState } from '../types';
import { spawnEnemyAtEdge } from './Enemy';
import type { Audio } from './Audio';

export interface WorldState {
  mission: MissionDef;
  currentWave: number;
  totalWaves: number;
  waveDelay: number;
  waveActive: boolean;
  allWavesSpawned: boolean;
  bossSpawned: boolean;
}

export function createWorldState(mission: MissionDef): WorldState {
  return {
    mission,
    currentWave: 0,
    totalWaves: mission.waves.length,
    waveDelay: mission.waves[0]?.delay ?? 1,
    waveActive: false,
    allWavesSpawned: false,
    bossSpawned: false,
  };
}

export function updateWorld(
  state: WorldState,
  enemies: EnemyState[],
  dt: number,
  audio: Audio,
): EnemyState[] {
  const spawned: EnemyState[] = [];

  if (state.allWavesSpawned) return spawned;

  if (!state.waveActive) {
    // Waiting for delay before spawning next wave
    state.waveDelay -= dt;
    if (state.waveDelay <= 0) {
      // Spawn wave
      const wave = state.mission.waves[state.currentWave];
      if (wave) {
        audio.waveStart();
        for (const group of wave.enemies) {
          for (let i = 0; i < group.count; i++) {
            spawned.push(spawnEnemyAtEdge(group.type, state.mission.arenaRadius));
          }
        }
        state.waveActive = true;
      }
    }
    return spawned;
  }

  // Wave is active - check if all enemies from this wave are dead
  const aliveEnemies = enemies.filter(e => e.alive);
  if (aliveEnemies.length === 0) {
    state.waveActive = false;
    state.currentWave++;
    if (state.currentWave >= state.totalWaves) {
      state.allWavesSpawned = true;
    } else {
      state.waveDelay = state.mission.waves[state.currentWave]?.delay ?? 2;
    }
  }

  return spawned;
}

export function isLevelComplete(state: WorldState, enemies: EnemyState[], bossAlive: boolean): boolean {
  if (!state.allWavesSpawned) return false;
  const aliveEnemies = enemies.filter(e => e.alive);
  if (aliveEnemies.length > 0) return false;
  if (state.mission.isBoss && bossAlive) return false;
  return true;
}
