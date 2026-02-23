export class Audio {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext | null {
    if (!this.ctx) {
      try { this.ctx = new AudioContext(); } catch { return null; }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  private tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.15) {
    const ctx = this.getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }

  private noise(dur: number, vol = 0.1) {
    const ctx = this.getCtx();
    if (!ctx) return;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.connect(gain).connect(ctx.destination);
    src.start();
  }

  shoot() { this.tone(600, 0.1, 'square', 0.08); }
  hit() { this.noise(0.08, 0.12); this.tone(200, 0.08, 'sawtooth', 0.06); }
  enemyDie() { this.tone(400, 0.1, 'square', 0.08); this.tone(600, 0.15, 'square', 0.06); }
  playerHit() { this.tone(150, 0.15, 'sawtooth', 0.12); this.noise(0.1, 0.08); }
  special() { this.tone(300, 0.1, 'sine', 0.1); this.tone(500, 0.15, 'sine', 0.1); this.tone(800, 0.2, 'sine', 0.08); }
  dash() { this.tone(200, 0.08, 'sawtooth', 0.1); this.tone(400, 0.12, 'sawtooth', 0.06); }
  transform() { this.tone(400, 0.1, 'sine', 0.12); this.tone(800, 0.15, 'sine', 0.1); this.tone(1200, 0.2, 'sine', 0.08); }
  waveStart() { this.tone(300, 0.15, 'square', 0.1); this.tone(450, 0.2, 'square', 0.08); }
  levelComplete() { this.tone(500, 0.15, 'sine', 0.12); this.tone(700, 0.2, 'sine', 0.1); this.tone(900, 0.3, 'sine', 0.1); }
  bossAppear() { this.tone(100, 0.3, 'sawtooth', 0.15); this.tone(80, 0.4, 'sawtooth', 0.12); }
  menuSelect() { this.tone(800, 0.08, 'sine', 0.06); }
}
