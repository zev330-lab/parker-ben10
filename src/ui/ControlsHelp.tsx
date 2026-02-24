interface Props {
  mode: 'classic' | 'arena';
}

export function ControlsHelp({ mode }: Props) {
  if (mode === 'classic') {
    return (
      <div className="controls-help">
        <div className="controls-help__title">CONTROLS</div>
        <div className="controls-help__grid">
          <div className="controls-help__row">
            <span className="controls-help__key">&#9664; &#9654;</span>
            <span className="controls-help__label">Move Left / Right</span>
          </div>
          <div className="controls-help__row">
            <span className="controls-help__key">&#11014;</span>
            <span className="controls-help__label">Jump</span>
          </div>
          <div className="controls-help__row">
            <span className="controls-help__key">POW!</span>
            <span className="controls-help__label">Attack</span>
          </div>
          <div className="controls-help__row">
            <span className="controls-help__key controls-help__key--omni">&#9203;</span>
            <span className="controls-help__label">Open Omnitrix (transform)</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="controls-help">
      <div className="controls-help__title">CONTROLS</div>
      <div className="controls-help__grid">
        <div className="controls-help__row">
          <span className="controls-help__key">Joystick / WASD</span>
          <span className="controls-help__label">Move</span>
        </div>
        <div className="controls-help__row">
          <span className="controls-help__key">ATK / J / Click</span>
          <span className="controls-help__label">Basic Attack</span>
        </div>
        <div className="controls-help__row">
          <span className="controls-help__key">SPL / K / Space</span>
          <span className="controls-help__label">Special Ability</span>
        </div>
        <div className="controls-help__row">
          <span className="controls-help__key controls-help__key--omni">Omnitrix / E</span>
          <span className="controls-help__label">Switch Alien</span>
        </div>
      </div>
    </div>
  );
}
