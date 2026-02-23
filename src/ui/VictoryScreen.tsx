import { useMemo } from 'react';

interface Props {
  score: number;
  onMenu: () => void;
}

const CONFETTI_COLORS = ['#ff4444', '#ffcc00', '#00e500', '#4488ff', '#ff44ff', '#ff8800'];

export function VictoryScreen({ score, onMenu }: Props) {
  const confetti = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 10,
    })),
  []);

  return (
    <div className="scene victory">
      <div className="victory__confetti">
        {confetti.map(c => (
          <div
            key={c.id}
            className="confetti-piece"
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size,
              background: c.color,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
              borderRadius: Math.random() > 0.5 ? '50%' : '0',
            }}
          />
        ))}
      </div>
      <div className="victory__title">YOU SAVED THE WORLD!</div>
      <div className="victory__subtitle">Parker is a True Hero!</div>
      <div className="victory__score">Total Score: {score}</div>
      <button className="game-btn game-btn--play mt-4" onClick={onMenu} style={{ animationDelay: '1s' }}>
        PLAY AGAIN
      </button>
    </div>
  );
}
