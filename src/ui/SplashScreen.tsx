import { useEffect } from 'react';

interface Props { onTap: () => void; }

export function SplashScreen({ onTap }: Props) {
  useEffect(() => {
    const handler = () => onTap();
    // Accept click/tap/key immediately for desktop, after delay for touch
    window.addEventListener('pointerdown', handler, { once: true });
    window.addEventListener('keydown', handler, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('keydown', handler);
    };
  }, [onTap]);

  return (
    <div className="scene splash" onClick={onTap}>
      <div className="splash__omnitrix">
        <div className="splash__hourglass" />
      </div>
      <div className="splash__title">PARKER'S</div>
      <div className="splash__subtitle">BEN 10</div>
      <div className="splash__tap">Tap or Press Any Key</div>
    </div>
  );
}
