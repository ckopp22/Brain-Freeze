const SCREEN_IDS = ["splash", "menu", "howto", "setup", "getready", "game", "scoreboard"];

const screens = {};
for (const id of SCREEN_IDS) {
  screens[id] = document.getElementById(`screen-${id}`);
}

export function showScreen(name) {
  for (const key of Object.keys(screens)) {
    if (!screens[key]) continue;
    screens[key].hidden = key !== name;
  }
}

export function getScreen(name) {
  return screens[name];
}
