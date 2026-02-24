import { useEffect, useRef, useState, useCallback } from 'react';
import type { MissionDef, SaveData, HudState, AlienId } from '../types';
import { Engine, type EngineCommands } from '../game/Engine';
import { AlienSelect } from './AlienSelect';
import { PauseMenu } from './PauseMenu';
import { ControlsHelp } from './ControlsHelp';

interface Props {
  mission: MissionDef;
  save: SaveData;
  onLevelComplete: (score: number, stars: number) => void;
  onQuit: () => void;
  onRestart: () => void;
}

export function GameView({ mission, save, onLevelComplete, onQuit, onRestart }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const commandsRef = useRef<EngineCommands | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const [hud, setHud] = useState<HudState | null>(null);
  const [showAlienSelect, setShowAlienSelect] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  const [showBriefingControls, setShowBriefingControls] = useState(false);

  const onHudUpdate = useCallback((h: HudState) => setHud(h), []);
  const onRequestAlienSelect = useCallback(() => setShowAlienSelect(true), []);

  useEffect(() => {
    if (showBriefing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, mission, save, {
      onHudUpdate,
      onLevelComplete,
      onPlayerDied: () => { /* kid-friendly: player revives automatically */ },
      onRequestAlienSelect,
    });
    engineRef.current = engine;
    commandsRef.current = engine.getCommands();
    engine.start();

    return () => {
      commandsRef.current?.destroy();
      engineRef.current = null;
      commandsRef.current = null;
    };
  }, [mission, save, onHudUpdate, onLevelComplete, onRequestAlienSelect, showBriefing]);

  // ESC key listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAlienSelect) return;
        if (showBriefing) return;
        setPaused(prev => {
          if (!prev) {
            commandsRef.current?.pause();
            return true;
          } else {
            commandsRef.current?.resume();
            return false;
          }
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showAlienSelect, showBriefing]);

  const selectAlien = useCallback((id: AlienId) => {
    commandsRef.current?.selectAlien(id);
    setShowAlienSelect(false);
  }, []);

  const cancelAlienSelect = useCallback(() => {
    commandsRef.current?.resume();
    setShowAlienSelect(false);
  }, []);

  const handlePause = useCallback(() => {
    commandsRef.current?.pause();
    setPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    commandsRef.current?.resume();
    setPaused(false);
  }, []);

  const handleRestart = useCallback(() => {
    commandsRef.current?.destroy();
    engineRef.current = null;
    commandsRef.current = null;
    setPaused(false);
    onRestart();
  }, [onRestart]);

  const handleQuit = useCallback(() => {
    commandsRef.current?.destroy();
    engineRef.current = null;
    commandsRef.current = null;
    setPaused(false);
    onQuit();
  }, [onQuit]);

  const startFromBriefing = useCallback(() => {
    setShowBriefing(false);
    setShowBriefingControls(false);
  }, []);

  // Briefing screen
  if (showBriefing) {
    const difficultyStars = [1, 2, 3].map(s => (
      <span key={s} className={s <= mission.difficulty ? 'briefing__star--filled' : 'briefing__star--empty'}>
        &#9733;
      </span>
    ));

    if (showBriefingControls) {
      return (
        <div className="briefing">
          <ControlsHelp mode="arena" />
          <div className="briefing__buttons">
            <button className="briefing__btn briefing__btn--controls" onClick={() => setShowBriefingControls(false)}>
              BACK
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="briefing">
        <div className="briefing__name">{mission.name}</div>
        {mission.isBoss && <div className="briefing__boss-badge">BOSS FIGHT</div>}
        <div className="briefing__difficulty">{difficultyStars}</div>
        <div className="briefing__desc">{mission.description}</div>
        <div className="briefing__buttons">
          <button className="briefing__btn briefing__btn--start" onClick={startFromBriefing}>
            START MISSION
          </button>
          <button className="briefing__btn briefing__btn--controls" onClick={() => setShowBriefingControls(true)}>
            CONTROLS
          </button>
        </div>
      </div>
    );
  }

  const healthPct = hud ? (hud.health / hud.maxHealth) * 100 : 100;
  const healthClass = healthPct > 60 ? 'health-bar__fill--high' : healthPct > 30 ? 'health-bar__fill--mid' : '';

  return (
    <div className="gameview">
      <canvas ref={canvasRef} />

      {/* Pause button */}
      <button className="pause-btn" onClick={handlePause}>&#9208;</button>

      {/* HUD overlay */}
      {hud && (
        <div className="hud">
          <div className="hud__top">
            <div className="hud__health">
              <div className="health-bar">
                <div
                  className={`health-bar__fill ${healthClass}`}
                  style={{ width: `${healthPct}%` }}
                />
              </div>
            </div>
            <div className="hud__score">{hud.score}</div>
          </div>
          <div className="hud__wave">
            Wave {hud.wave} / {hud.totalWaves}
          </div>
          {hud.bossHealth !== undefined && hud.bossMaxHealth && (
            <div>
              <div className="hud__boss-name">{hud.bossName}</div>
              <div className="hud__boss-bar">
                <div
                  className="hud__boss-bar-fill"
                  style={{ width: `${(hud.bossHealth / hud.bossMaxHealth) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pause menu */}
      {paused && (
        <PauseMenu
          onResume={handleResume}
          onRestart={handleRestart}
          onQuit={handleQuit}
          controlsContent={<ControlsHelp mode="arena" />}
        />
      )}

      {/* Alien select overlay */}
      {showAlienSelect && engineRef.current && (
        <AlienSelect
          unlockedAliens={engineRef.current.getUnlockedAliens()}
          currentAlien={engineRef.current.getCurrentAlien()}
          onSelect={selectAlien}
          onCancel={cancelAlienSelect}
        />
      )}
    </div>
  );
}
