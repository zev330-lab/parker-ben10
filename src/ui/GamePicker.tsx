interface Props {
  onClassic: () => void;
  onArena: () => void;
  onBack: () => void;
}

export function GamePicker({ onClassic, onArena, onBack }: Props) {
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
          <div className="game-picker__card-info">4 Levels &bull; 4 Aliens</div>
        </button>
        <button className="game-picker__card" onClick={onArena}>
          <div className="game-picker__card-icon game-picker__card-icon--arena">
            <div className="game-picker__arena-mini" />
          </div>
          <div className="game-picker__card-title">Omni Arena</div>
          <div className="game-picker__card-desc">Top-down arena battles</div>
          <div className="game-picker__card-info">20 Missions &bull; 11 Aliens</div>
        </button>
      </div>
    </div>
  );
}
