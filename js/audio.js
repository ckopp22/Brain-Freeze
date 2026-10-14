import { loadSettings, saveSettings } from "./state.js";

let soundOn = loadSettings().sound;

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

// Synth sound effects land in a later phase (WebAudio oscillators/noise).
export function play(_name) {
  if (!soundOn) return;
}

export function unlockAudio() {
  // AudioContext creation/resume lands with the full synth in a later phase.
}
