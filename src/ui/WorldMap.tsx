import type { SaveData, MissionDef } from '../types';
import { WORLDS } from '../game/data';

interface Props {
  save: SaveData;
  onBack: () => void;
  onSelectMission: (mission: MissionDef) => void;
}

function isMissionUnlocked(save: SaveData, worldIdx: number, missionIdx: number): boolean {
  // World must be unlocked
  if (worldIdx > save.currentWorld) return false;
  // First mission of unlocked world is always available
  if (missionIdx === 0) return true;
  // Previous mission in same world must be completed (at least 1 star)
  const world = WORLDS[worldIdx];
  const prevMission = world.missions[missionIdx - 1];
  return (save.missionStars[prevMission.id] || 0) >= 1;
}

export function WorldMap({ save, onBack, onSelectMission }: Props) {
  return (
    <div className="scene worldmap">
      <div className="worldmap__header">
        <div className="worldmap__title">SELECT MISSION</div>
        <button className="worldmap__back" onClick={onBack}>BACK</button>
      </div>
      <div className="worldmap__worlds">
        {WORLDS.map((world, wIdx) => {
          const locked = wIdx > save.currentWorld;
          return (
            <div
              key={world.id}
              className={`world-card${locked ? ' world-card--locked' : ''}`}
              style={{ borderColor: locked ? '#333' : world.color }}
            >
              <div className="world-card__name" style={{ color: world.color }}>
                {world.name}
              </div>
              <div className="world-card__missions">
                {world.missions.map((mission, mIdx) => {
                  const unlocked = isMissionUnlocked(save, wIdx, mIdx);
                  const stars = save.missionStars[mission.id] || 0;
                  const isAvailable = unlocked && stars === 0;
                  let cls = 'mission-node';
                  if (!unlocked) cls += ' mission-node--locked';
                  else if (mission.isBoss) cls += ' mission-node--boss';
                  if (isAvailable) cls += ' mission-node--available';

                  return (
                    <div
                      key={mission.id}
                      className={cls}
                      onClick={() => unlocked && onSelectMission(mission)}
                    >
                      <div className="mission-node__info">
                        <div className="mission-node__name">
                          {mission.name}
                          {mission.isBoss && <span className="mission-node__badge">BOSS</span>}
                        </div>
                        <div className="mission-node__difficulty">
                          {[1, 2, 3].map(s => (
                            <span key={s}>{s <= mission.difficulty ? '\u2605' : '\u2606'}</span>
                          ))}
                        </div>
                        {unlocked && (
                          <div className="mission-node__desc">{mission.description}</div>
                        )}
                      </div>
                      <div className="mission-node__right">
                        {!unlocked ? (
                          <div className="mission-node__lock">{'\uD83D\uDD12'}</div>
                        ) : (
                          <div className="mission-node__stars">
                            {[1, 2, 3].map(s => (
                              <span key={s} className={`star ${s <= stars ? 'star--filled' : 'star--empty'}`}>
                                &#9733;
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
