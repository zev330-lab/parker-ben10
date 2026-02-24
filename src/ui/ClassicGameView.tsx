import { useEffect, useRef, useState, useCallback } from 'react';
import { Game } from '../classic/game';
import { PauseMenu } from './PauseMenu';
import { ControlsHelp } from './ControlsHelp';

interface Props {
  onBack: () => void;
}

export function ClassicGameView({ onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [paused, setPaused] = useState(false);
  const [showControlsToast, setShowControlsToast] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = new Game(canvas);
    gameRef.current = game;
    game.start();

    return () => {
      game.stop();
      gameRef.current = null;
    };
  }, []);

  // Auto-dismiss controls toast after 3 seconds
  useEffect(() => {
    if (!showControlsToast) return;
    const timer = setTimeout(() => setShowControlsToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showControlsToast]);

  // ESC key listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPaused(prev => {
          if (!prev) {
            gameRef.current?.pause();
            return true;
          } else {
            gameRef.current?.resume();
            return false;
          }
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handlePause = useCallback(() => {
    gameRef.current?.pause();
    setPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    gameRef.current?.resume();
    setPaused(false);
  }, []);

  const handleRestart = useCallback(() => {
    gameRef.current?.restart();
    setPaused(false);
  }, []);

  const handleQuit = useCallback(() => {
    setPaused(false);
    onBack();
  }, [onBack]);

  return (
    <div className="classic-game">
      <canvas ref={canvasRef} />

      {/* Pause button (replaces BACK) */}
      <button className="pause-btn" onClick={handlePause}>&#9208;</button>

      {/* Controls toast on mount */}
      {showControlsToast && (
        <div className="controls-toast" onClick={() => setShowControlsToast(false)}>
          <div className="controls-toast__text">
            TAP &#9664; &#9654; to move | &#11014; JUMP | POW! ATTACK | &#9203; OMNITRIX
          </div>
        </div>
      )}

      {/* Pause menu */}
      {paused && (
        <PauseMenu
          onResume={handleResume}
          onRestart={handleRestart}
          onQuit={handleQuit}
          controlsContent={<ControlsHelp mode="classic" />}
        />
      )}
    </div>
  );
}
