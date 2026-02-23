import type { AlienId } from '../types';
import { ALIEN_DEFS } from '../game/data';

interface Props {
  score: number;
  stars: number;
  unlockedAliens: AlienId[];
  onNext: () => void;
  onRetry: () => void;
  onWorldMap: () => void;
}

export function LevelComplete({ score, stars, unlockedAliens, onNext, onRetry, onWorldMap }: Props) {
  return (
    <div className="scene levelcomplete">
      <div className="levelcomplete__title">LEVEL COMPLETE!</div>
      <div className="levelcomplete__stars">
        {[1, 2, 3].map(s => (
          <div key={s} className="levelcomplete__star">
            {s <= stars ? '\u2B50' : '\u2606'}
          </div>
        ))}
      </div>
      <div className="levelcomplete__score">Score: {score}</div>
      {unlockedAliens.length > 0 && (
        <div className="levelcomplete__unlock">
          New Alien: {unlockedAliens.map(id => ALIEN_DEFS[id].name).join(', ')}!
        </div>
      )}
      <div className="levelcomplete__buttons">
        <button className="game-btn game-btn--play" onClick={onNext}>NEXT</button>
        <button className="game-btn game-btn--aliens" onClick={onRetry}>RETRY</button>
        <button className="game-btn" onClick={onWorldMap} style={{ background: '#333', color: '#aaa' }}>MAP</button>
      </div>
    </div>
  );
}
