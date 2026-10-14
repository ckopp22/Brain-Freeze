const PREFIX = "bf_";

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* storage unavailable */
  }
}

const DEFAULT_SETTINGS = {
  sound: true,
  music: true,
  players: 2,
  difficulty: "M",
  timer: 30,
  names: ["Player 1", "Player 2"],
};

export function loadSettings() {
  const saved = read("settings", null);
  if (!saved) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...saved };
}

export function saveSettings(settings) {
  write("settings", settings);
}

export function loadGame() {
  return read("game", null);
}

export function saveGame(game) {
  write("game", game);
}

export function clearGame() {
  remove("game");
}

export function loadSeenIds() {
  return read("seen", []);
}

export function saveSeenIds(ids) {
  write("seen", ids);
}
