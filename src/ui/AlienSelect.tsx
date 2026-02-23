import type { AlienId } from '../types';
import { ALIEN_DEFS } from '../game/data';

interface Props {
  unlockedAliens: AlienId[];
  currentAlien: AlienId;
  onSelect: (id: AlienId) => void;
  onCancel: () => void;
}

export function AlienSelect({ unlockedAliens, currentAlien, onSelect, onCancel }: Props) {
  const count = unlockedAliens.length;
  const ringRadius = 120;

  return (
    <div className="alien-select" onClick={onCancel}>
      <div className="alien-select__ring" onClick={e => e.stopPropagation()}>
        {/* Center cancel button */}
        <div className="alien-select__center" onClick={onCancel}>
          CLOSE
        </div>

        {/* Alien items arranged in circle */}
        {unlockedAliens.map((alienId, idx) => {
          const def = ALIEN_DEFS[alienId];
          const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
          const x = 170 + Math.cos(angle) * ringRadius - 32;
          const y = 170 + Math.sin(angle) * ringRadius - 32;
          const isCurrent = alienId === currentAlien;

          return (
            <div
              key={alienId}
              className="alien-select__item"
              style={{
                left: x,
                top: y,
                background: def.color,
                borderColor: isCurrent ? '#00e500' : '#fff',
                borderWidth: isCurrent ? 4 : 3,
              }}
              onClick={() => onSelect(alienId)}
            >
              <span style={{ fontSize: 20, fontWeight: 900 }}>{def.name[0]}</span>
              <span>{def.name.slice(0, 5)}</span>
            </div>
          );
        })}
      </div>
      <div className="alien-select__label">Choose Alien</div>
    </div>
  );
}
