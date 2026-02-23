interface Props {
  onPlay: () => void;
  onAliens: () => void;
}

export function MainMenu({ onPlay, onAliens }: Props) {
  return (
    <div className="scene menu">
      <div className="menu__title">BEN 10: OMNI ARENA</div>
      <div className="menu__subtitle">Choose your aliens. Save the world.</div>
      <div className="menu__buttons">
        <button className="game-btn game-btn--play" onClick={onPlay}>PLAY</button>
        <button className="game-btn game-btn--aliens" onClick={onAliens}>ALIENS</button>
      </div>
    </div>
  );
}
