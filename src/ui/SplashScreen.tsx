import { useEffect } from 'react';

interface Props { onTap: () => void; }

export function SplashScreen({ onTap }: Props) {
  useEffect(() => {
    const handler = () => onTap();
    const timer = setTimeout(() => {
      window.addEventListener('pointerdown', handler, { once: true });
    }, 2000); // wait for animations before accepting tap
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', handler);
    };
  }, [onTap]);

  return (
    <div className="scene splash" onClick={onTap}>
      <div id="portrait-warning">
        <span>&#x1F4F1;</span>
        Turn your phone sideways to play!
      </div>
      <div className="splash__omnitrix">
        <div className="splash__hourglass" />
      </div>
      <div className="splash__title">PARKER'S</div>
      <div className="splash__subtitle">BEN 10</div>
      <div className="splash__tap">Tap to Start</div>
    </div>
  );
}
