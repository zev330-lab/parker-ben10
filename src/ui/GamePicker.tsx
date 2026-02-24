import { useState } from 'react';
import { ControlsHelp } from './ControlsHelp';

interface Props {
  onClassic: () => void;
  onArena: () => void;
  onBack: () => void;
}

export function GamePicker({ onClassic, onArena, onBack }: Props) {
  const [showControls, setShowControls] = useState<'classic' | 'arena' | null>(null);

  return (
    <div className="scene game-picker">
      <div className="game-picker__header">
        <div className="game-picker__title">CHOOSE YOUR GAME</div>
        <button className="worldmap__back" onClick={onBack}>&#x2190; MENU</button>
      </div>
      <div className="game-picker__cards">
        <button className="game-picker__card" onClick={onClassic}>
          <div className="game-picker__card-icon game-picker__card-icon--classic">
            <div className="game-picker__omnitrix-mini" />
          </div>
          <div className="game-picker__card-title">Classic Adventure</div>
          <div className="game-picker__card-desc">Side-scrolling beat-em-up</div>
          <div className="game-picker__card-full-desc">
            Fight through 4 levels as Ben 10, unlocking aliens along the way.
          </div>
          <div className="game-picker__card-info">4 Levels &bull; 4 Aliens</div>
          <button
            className="game-picker__how-to-play"
            onClick={(e) => { e.stopPropagation(); setShowControls('classic'); }}
          >
            HOW TO PLAY
          </button>
        </button>
        <button className="game-picker__card" onClick={onArena}>
          <div className="game-picker__card-icon game-picker__card-icon--arena">
            <div className="game-picker__arena-mini" />
          </div>
          <div className="game-picker__card-title">Omni Arena</div>
          <div className="game-picker__card-desc">Top-down arena battles</div>
          <div className="game-picker__card-full-desc">
            Complete 20 missions across 5 worlds with 11 alien forms.
          </div>
          <div className="game-picker__card-info">20 Missions &bull; 11 Aliens</div>
          <button
            className="game-picker__how-to-play"
            onClick={(e) => { e.stopPropagation(); setShowControls('arena'); }}
          >
            HOW TO PLAY
          </button>
        </button>
      </div>

      {/* Controls overlay */}
      {showControls && (
        <div className="game-picker__controls-overlay" onClick={() => setShowControls(null)}>
          <div className="game-picker__controls-card" onClick={(e) => e.stopPropagation()}>
            <ControlsHelp mode={showControls} />
            <button className="game-picker__controls-close" onClick={() => setShowControls(null)}>
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
