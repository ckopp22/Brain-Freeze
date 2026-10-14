import { loadSettings, saveSettings } from "./state.js";

const MUSIC_SRC = "./assets/audio/brain-freeze-music.m4a";
const MUSIC_VOLUME = 0.15;

let soundOn = loadSettings().sound;
let musicOn = loadSettings().music !== false;
let musicEl = null;
let ctx = null;
let noiseBuffer = null;

export function isSoundOn() {
  return soundOn;
}

export function setSoundOn(value) {
  soundOn = value;
  const settings = loadSettings();
  settings.sound = value;
  saveSettings(settings);
}

export function toggleSound() {
  setSoundOn(!soundOn);
  return soundOn;
}

export function isMusicOn() {
  return musicOn;
}

export function toggleMusic() {
  musicOn = !musicOn;
  const settings = loadSettings();
  settings.music = musicOn;
  saveSettings(settings);
  if (musicOn) startMusic();
  else if (musicEl) musicEl.pause();
  return musicOn;
}

export function startMusic() {
  if (!musicOn) return;
  if (!musicEl) {
    musicEl = new Audio(MUSIC_SRC);
    musicEl.loop = true;
    musicEl.volume = MUSIC_VOLUME;
    musicEl.preload = "auto";
  }
  musicEl.play().catch(() => {});
}

document.addEventListener("visibilitychange", () => {
  if (!musicEl) return;
  if (document.hidden) musicEl.pause();
  else if (musicOn) musicEl.play().catch(() => {});
});

export function unlockAudio() {
  startMusic();
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ctx = new AudioCtx();
  }
  if (ctx.state === "suspended") ctx.resume();
}

function getNoiseBuffer() {
  if (!noiseBuffer) {
    const length = ctx.sampleRate * 1;
    noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

function now() {
  return ctx.currentTime;
}

function tone(freq, { type = "sine", start = 0, duration = 0.2, peak = 0.25, attack = 0.01, decay = 0.1, slideTo = null } = {}) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now() + start);
  if (slideTo !== null) {
    osc.frequency.linearRampToValueAtTime(slideTo, now() + start + duration);
  }
  gain.gain.setValueAtTime(0, now() + start);
  gain.gain.linearRampToValueAtTime(peak, now() + start + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, now() + start + attack + decay + duration * 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now() + start);
  osc.stop(now() + start + duration + decay + 0.1);
}

function noiseBurst({ start = 0, duration = 0.2, peak = 0.3, filterFreq = 1200, filterType = "bandpass" } = {}) {
  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer();
  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFreq;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now() + start);
  gain.gain.linearRampToValueAtTime(peak, now() + start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now() + start + duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(now() + start);
  src.stop(now() + start + duration + 0.05);
}

function vibrate(pattern) {
  if (soundOn && navigator.vibrate) navigator.vibrate(pattern);
}

const EFFECTS = {
  tap() {
    tone(880, { type: "sine", duration: 0.06, peak: 0.12, decay: 0.05 });
  },

  marquee() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, { start: i * 0.08, duration: 0.15, peak: 0.18, decay: 0.08 }));
  },

  cardSlide() {
    noiseBurst({ duration: 0.25, peak: 0.15, filterFreq: 1800, filterType: "lowpass" });
  },

  timerTick() {
    tone(1200, { type: "square", duration: 0.04, peak: 0.08, decay: 0.03 });
  },

  timerTickFast() {
    tone(1500, { type: "square", duration: 0.03, peak: 0.1, decay: 0.03 });
  },

  cardFlip() {
    noiseBurst({ duration: 0.08, peak: 0.25, filterFreq: 2500, filterType: "highpass" });
  },

  nailedIt() {
    tone(1046, { duration: 0.18, peak: 0.3, decay: 0.12 });
    [784, 988, 1174, 1568].forEach((f, i) => tone(f, { start: 0.08 + i * 0.07, duration: 0.14, peak: 0.22, decay: 0.08 }));
    noiseBurst({ start: 0.1, duration: 0.5, peak: 0.1, filterFreq: 2000, filterType: "bandpass" });
    vibrate(30);
  },

  froze() {
    tone(300, { type: "sawtooth", duration: 0.3, peak: 0.22, decay: 0.15, slideTo: 120 });
    noiseBurst({ start: 0.15, duration: 0.3, peak: 0.2, filterFreq: 3000, filterType: "highpass" });
    vibrate([0, 60, 40, 60]);
  },

  brainFreeze() {
    noiseBurst({ duration: 0.5, peak: 0.3, filterFreq: 2600, filterType: "bandpass" });
    [2000, 2600, 3200].forEach((f, i) => tone(f, { start: 0.1 + i * 0.05, type: "triangle", duration: 0.3, peak: 0.12, decay: 0.3 }));
    vibrate([0, 100, 60, 100, 60, 100]);
  },

  win() {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, { start: i * 0.14, duration: 0.3, peak: 0.28, decay: 0.2 }));
  },

  turnChange() {
    noiseBurst({ duration: 0.18, peak: 0.12, filterFreq: 1400, filterType: "lowpass" });
  },
};

export function play(name) {
  if (!soundOn || !ctx) return;
  const effect = EFFECTS[name];
  if (effect) effect();
}
