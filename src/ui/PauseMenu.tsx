import { useState } from 'react';
import type { ReactNode } from 'react';

interface Props {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  controlsContent: ReactNode;
}

export function PauseMenu({ onResume, onRestart, onQuit, controlsContent }: Props) {
  const [showControls, setShowControls] = useState(false);

  if (showControls) {
    return (
      <div className="pause-overlay">
        <div className="pause-menu">
          {controlsContent}
          <button className="pause-menu__btn pause-menu__btn--resume" onClick={() => setShowControls(false)}>
            BACK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pause-overlay">
      <div className="pause-menu">
        <div className="pause-menu__title">PAUSED</div>
        <button className="pause-menu__btn pause-menu__btn--resume" onClick={onResume}>
          RESUME
        </button>
        <button className="pause-menu__btn" onClick={onRestart}>
          RESTART
        </button>
        <button className="pause-menu__btn" onClick={() => setShowControls(true)}>
          CONTROLS
        </button>
        <button className="pause-menu__btn pause-menu__btn--quit" onClick={onQuit}>
          QUIT TO MENU
        </button>
      </div>
    </div>
  );
}
