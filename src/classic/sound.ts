let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'square', volume = 0.15) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playSweep(startFreq: number, endFreq: number, duration: number, type: OscillatorType = 'sawtooth', volume = 0.12) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, volume = 0.08) {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

export const Sound = {
  init() {
    getCtx();
  },

  // Omnitrix transformation - rising pitch sweep
  transform() {
    playSweep(200, 1200, 0.6, 'sawtooth', 0.15);
    setTimeout(() => playTone(1200, 0.3, 'sine', 0.1), 500);
    setTimeout(() => playTone(1500, 0.2, 'sine', 0.08), 700);
  },

  // Heatblast fireball - whoosh + crackle
  fireball() {
    playSweep(800, 200, 0.3, 'sawtooth', 0.1);
    playNoise(0.15, 0.06);
  },

  // Four Arms punch - boom
  punch() {
    playSweep(300, 60, 0.2, 'square', 0.15);
    playNoise(0.1, 0.1);
  },

  // XLR8 dash - zap
  dash() {
    playSweep(400, 2000, 0.15, 'sawtooth', 0.08);
    playSweep(2000, 600, 0.1, 'sine', 0.06);
  },

  // Diamondhead shield - crystalline clang
  shield() {
    playTone(800, 0.15, 'triangle', 0.1);
    setTimeout(() => playTone(1200, 0.1, 'triangle', 0.08), 50);
    setTimeout(() => playTone(1600, 0.15, 'sine', 0.06), 100);
  },

  // Ben punch (weak)
  weakPunch() {
    playSweep(200, 100, 0.1, 'square', 0.08);
  },

  // Enemy defeat - pop
  enemyDefeat() {
    playSweep(300, 800, 0.15, 'sine', 0.1);
    setTimeout(() => playTone(1000, 0.1, 'sine', 0.08), 100);
  },

  // Player hit
  playerHit() {
    playSweep(400, 100, 0.2, 'square', 0.1);
  },

  // Level start
  levelStart() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'square', 0.1), i * 150);
    });
  },

  // Victory fanfare
  victory() {
    const notes = [523, 659, 784, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.25, 'square', 0.12), i * 200);
    });
    setTimeout(() => {
      playTone(1047, 0.5, 'sine', 0.1);
      playTone(1319, 0.5, 'triangle', 0.08);
    }, 1200);
  },

  // Omnitrix ready ding
  omnitrixReady() {
    playTone(880, 0.1, 'sine', 0.08);
    setTimeout(() => playTone(1100, 0.15, 'sine', 0.1), 100);
  },

  // Button tap feedback
  tap() {
    playTone(600, 0.05, 'square', 0.04);
  },

  // Jump
  jump() {
    playSweep(200, 500, 0.15, 'sine', 0.06);
  },
};

