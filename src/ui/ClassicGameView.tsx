import { useEffect, useRef } from 'react';
import { Game } from '../classic/game';

interface Props {
  onBack: () => void;
}

export function ClassicGameView({ onBack }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

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

  return (
    <div className="classic-game">
      <canvas ref={canvasRef} />
      <button className="classic-game__back" onClick={onBack}>
        &#x2190; BACK
      </button>
    </div>
  );
}
