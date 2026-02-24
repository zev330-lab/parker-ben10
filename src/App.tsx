import { useState, useCallback, useRef, useEffect } from 'react';
import type { Scene, SaveData, AlienId, MissionDef } from './types';
import { WORLDS } from './game/data';
import { SplashScreen } from './ui/SplashScreen';
import { MainMenu } from './ui/MainMenu';
import { GamePicker } from './ui/GamePicker';
import { ClassicGameView } from './ui/ClassicGameView';
import { WorldMap } from './ui/WorldMap';
import { AlienDex } from './ui/AlienDex';
import { GameView } from './ui/GameView';
import { LevelComplete } from './ui/LevelComplete';
import { VictoryScreen } from './ui/VictoryScreen';

const SAVE_KEY = 'parker-ben10-save';

function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { unlockedAliens: ['heatblast'], missionStars: {}, currentWorld: 0 };
}

function writeSave(data: SaveData) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function App() {
  const [scene, setScene] = useState<Scene>('splash');
  const [save, setSave] = useState<SaveData>(loadSave);
  const [activeMission, setActiveMission] = useState<MissionDef | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const [lastStars, setLastStars] = useState(0);
  const [lastUnlocked, setLastUnlocked] = useState<AlienId[]>([]);
  const saveRef = useRef(save);
  saveRef.current = save;

  // Persist save whenever it changes
  useEffect(() => { writeSave(save); }, [save]);

  const updateSave = useCallback((updater: (prev: SaveData) => SaveData) => {
    setSave(prev => {
      const next = updater(prev);
      return next;
    });
  }, []);

  const goMenu = useCallback(() => setScene('menu'), []);
  const goGamePicker = useCallback(() => setScene('gamepicker'), []);
  const goClassic = useCallback(() => setScene('classic'), []);
  const goWorldMap = useCallback(() => setScene('worldmap'), []);
  const goAlienDex = useCallback(() => setScene('aliendex'), []);

  const startMission = useCallback((mission: MissionDef) => {
    setActiveMission(mission);
    setScene('playing');
  }, []);

  const onLevelComplete = useCallback((score: number, stars: number) => {
    if (!activeMission) return;
    setLastScore(score);
    setLastStars(stars);

    const newlyUnlocked: AlienId[] = [];

    updateSave(prev => {
      const next = { ...prev };
      next.missionStars = { ...prev.missionStars };
      const existing = next.missionStars[activeMission.id] || 0;
      if (stars > existing) {
        next.missionStars[activeMission.id] = stars;
      }

      // Unlock aliens from this mission
      next.unlockedAliens = [...prev.unlockedAliens];
      for (const alienId of activeMission.unlockAliens) {
        if (!next.unlockedAliens.includes(alienId)) {
          next.unlockedAliens.push(alienId);
          newlyUnlocked.push(alienId);
        }
      }

      // Check if this was the last boss - unlock next world
      if (activeMission.isBoss) {
        const worldIdx = WORLDS.findIndex(w => w.id === activeMission.worldId);
        if (worldIdx >= 0 && worldIdx + 1 > next.currentWorld) {
          next.currentWorld = Math.min(worldIdx + 1, WORLDS.length - 1);
        }
      }

      return next;
    });

    setLastUnlocked(newlyUnlocked);

    // Check if this was the final boss
    const isVilgaxSupreme = activeMission.id === 'vilgax_3';
    setScene(isVilgaxSupreme ? 'victory' : 'levelcomplete');
  }, [activeMission, updateSave]);

  const nextMission = useCallback(() => {
    if (!activeMission) { goWorldMap(); return; }
    const world = WORLDS.find(w => w.id === activeMission.worldId);
    if (!world) { goWorldMap(); return; }
    const nextIdx = activeMission.missionIndex + 1;
    if (nextIdx < world.missions.length) {
      startMission(world.missions[nextIdx]);
    } else {
      goWorldMap();
    }
  }, [activeMission, goWorldMap, startMission]);

  const retryMission = useCallback(() => {
    if (activeMission) startMission(activeMission);
  }, [activeMission, startMission]);

  let content: React.ReactNode = null;
  switch (scene) {
    case 'splash':
      content = <SplashScreen onTap={goMenu} />;
      break;
    case 'menu':
      content = <MainMenu onPlay={goGamePicker} onAliens={goAlienDex} />;
      break;
    case 'gamepicker':
      content = <GamePicker onClassic={goClassic} onArena={goWorldMap} onBack={goMenu} />;
      break;
    case 'classic':
      content = <ClassicGameView onBack={goGamePicker} />;
      break;
    case 'worldmap':
      content = <WorldMap save={save} onBack={goMenu} onSelectMission={startMission} />;
      break;
    case 'aliendex':
      content = <AlienDex save={save} onBack={goMenu} />;
      break;
    case 'playing':
      content = activeMission ? (
        <GameView
          mission={activeMission}
          save={save}
          onLevelComplete={onLevelComplete}
        />
      ) : null;
      break;
    case 'levelcomplete':
      content = (
        <LevelComplete
          score={lastScore}
          stars={lastStars}
          unlockedAliens={lastUnlocked}
          onNext={nextMission}
          onRetry={retryMission}
          onWorldMap={goWorldMap}
        />
      );
      break;
    case 'victory':
      content = <VictoryScreen score={lastScore} onMenu={goMenu} />;
      break;
  }

  return (
    <>
      <div id="portrait-warning">
        <span>&#x1F4F1;</span>
        Turn your phone sideways to play!
      </div>
      {content}
    </>
  );
}

export default App;
