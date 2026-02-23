import { useEffect, useRef, useState, useCallback } from 'react';
import type { MissionDef, SaveData, HudState, AlienId } from '../types';
import { Engine, type EngineCommands } from '../game/Engine';
import { AlienSelect } from './AlienSelect';

interface Props {
  mission: MissionDef;
  save: SaveData;
  onLevelComplete: (score: number, stars: number) => void;
}

export function GameView({ mission, save, onLevelComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const commandsRef = useRef<EngineCommands | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const [hud, setHud] = useState<HudState | null>(null);
  const [showAlienSelect, setShowAlienSelect] = useState(false);

  const onHudUpdate = useCallback((h: HudState) => setHud(h), []);
  const onRequestAlienSelect = useCallback(() => setShowAlienSelect(true), []);

  useEffect(() => {
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
  }, [mission, save, onHudUpdate, onLevelComplete, onRequestAlienSelect]);

  const selectAlien = useCallback((id: AlienId) => {
    commandsRef.current?.selectAlien(id);
    setShowAlienSelect(false);
  }, []);

  const cancelAlienSelect = useCallback(() => {
    commandsRef.current?.resume();
    setShowAlienSelect(false);
  }, []);

  const healthPct = hud ? (hud.health / hud.maxHealth) * 100 : 100;
  const healthClass = healthPct > 60 ? 'health-bar__fill--high' : healthPct > 30 ? 'health-bar__fill--mid' : '';

  return (
    <div className="gameview">
      <div id="portrait-warning">
        <span>&#x1F4F1;</span>
        Turn your phone sideways to play!
      </div>
      <canvas ref={canvasRef} />

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
