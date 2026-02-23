import type { SaveData, AlienId } from '../types';
import { ALIEN_DEFS } from '../game/data';

interface Props {
  save: SaveData;
  onBack: () => void;
}

const ALL_ALIENS: AlienId[] = [
  'heatblast', 'fourarms', 'xlr8', 'diamondhead',
  'ghostfreak', 'wildmutt', 'stinkfly', 'cannonbolt',
  'upgrade', 'ripjaws', 'waybig',
];

export function AlienDex({ save, onBack }: Props) {
  return (
    <div className="scene aliendex">
      <div className="aliendex__header">
        <div className="aliendex__title">ALIEN DEX ({save.unlockedAliens.length}/{ALL_ALIENS.length})</div>
        <button className="worldmap__back" onClick={onBack}>BACK</button>
      </div>
      <div className="aliendex__grid">
        {ALL_ALIENS.map((alienId, idx) => {
          const def = ALIEN_DEFS[alienId];
          const unlocked = save.unlockedAliens.includes(alienId);
          return (
            <div
              key={alienId}
              className={`alien-card${unlocked ? '' : ' alien-card--locked'}`}
              style={{ animationDelay: `${idx * 0.05}s`, borderColor: unlocked ? def.color : '#333' }}
            >
              <div
                className="alien-card__circle"
                style={{ background: unlocked ? def.color : '#333' }}
              >
                {unlocked ? def.name[0] : '?'}
              </div>
              <div className="alien-card__name">{unlocked ? def.name : '???'}</div>
              <div className="alien-card__desc">{unlocked ? def.description : 'Locked'}</div>
              {unlocked && (
                <div style={{ marginTop: 6, fontSize: 10, color: '#888' }}>
                  {def.basicAttack.name} / {def.specialAbility.name}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
