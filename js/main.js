import { loadSettings, saveSettings, loadGame } from "./state.js";
import { randomMenuLine } from "./host.js";
import { isSoundOn, toggleSound, unlockAudio } from "./audio.js";

const AVATARS = ["🐧", "🐻‍❄️", "❄️", "🧊", "🧪", "🧊", "☃️", "🦭"];
// penguin, polar bear, snowflake, ice-cube-ish stand-ins for igloo/yeti/ice cube/snowman/narwhal
const AVATAR_ICONS = ["🐧", "🐻‍❄️", "❄️", "🏠", "👹", "🧊", "☃️", "🐬"];

const settings = loadSettings();

const screens = {
  splash: document.getElementById("screen-splash"),
  menu: document.getElementById("screen-menu"),
  howto: document.getElementById("screen-howto"),
  setup: document.getElementById("screen-setup"),
};

function showScreen(name) {
  for (const key of Object.keys(screens)) {
    screens[key].hidden = key !== name;
  }
}

function initSplash() {
  const goToMenu = () => {
    unlockAudio();
    screens.splash.removeEventListener("click", goToMenu);
    enterMenu();
  };
  screens.splash.addEventListener("click", goToMenu);
  setTimeout(goToMenu, 1500);
}

function enterMenu() {
  showScreen("menu");
  refreshSoundButton();
  cycleHostLine();
  setInterval(cycleHostLine, 6000);

  const resumeBtn = document.getElementById("btn-resume");
  if (loadGame()) {
    resumeBtn.hidden = false;
  }
}

function cycleHostLine() {
  const el = document.getElementById("host-line");
  el.textContent = randomMenuLine();
}

function refreshSoundButton() {
  const btn = document.getElementById("btn-sound");
  const label = btn.querySelector(".btn-sound-label");
  const on = isSoundOn();
  btn.setAttribute("aria-pressed", String(on));
  label.textContent = on ? "SOUND: ON" : "SOUND: OFF";
}

function wireMenu() {
  document.getElementById("btn-play").addEventListener("click", () => {
    showScreen("setup");
    initSetupForm();
  });
  document.getElementById("btn-howto").addEventListener("click", () => {
    showScreen("howto");
  });
  document.getElementById("btn-sound").addEventListener("click", () => {
    toggleSound();
    refreshSoundButton();
  });
  document.getElementById("btn-howto-back").addEventListener("click", () => {
    showScreen("menu");
  });
  document.getElementById("btn-setup-back").addEventListener("click", () => {
    showScreen("menu");
  });
}

function wireInstallPrompt() {
  let deferredPrompt = null;
  const installBtn = document.getElementById("btn-install");

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  });

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (isIos && !isStandalone) {
    document.getElementById("ios-install-hint").hidden = false;
  }
}

function initSetupForm() {
  renderPlayerNames();
  syncStepperDisplay();

  document.querySelectorAll("#difficulty-seg .seg-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.value === settings.difficulty);
  });
  document.querySelectorAll("#timer-seg .seg-btn").forEach((btn) => {
    btn.classList.toggle("is-active", Number(btn.dataset.value) === settings.timer);
  });

  validateSetupForm();
}

function syncStepperDisplay() {
  document.getElementById("player-count").textContent = String(settings.players);
}

function renderPlayerNames() {
  const container = document.getElementById("player-names");
  container.innerHTML = "";

  while (settings.names.length < settings.players) {
    settings.names.push(`Player ${settings.names.length + 1}`);
  }
  settings.names.length = settings.players;

  for (let i = 0; i < settings.players; i++) {
    const row = document.createElement("div");
    row.className = "player-name-row";

    const icon = document.createElement("span");
    icon.className = "player-avatar-icon";
    icon.textContent = AVATAR_ICONS[i % AVATAR_ICONS.length];
    icon.setAttribute("aria-hidden", "true");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "player-name-input";
    input.maxLength = 16;
    input.value = settings.names[i] || `Player ${i + 1}`;
    input.setAttribute("aria-label", `Player ${i + 1} name`);
    input.addEventListener("input", () => {
      settings.names[i] = input.value;
      validateSetupForm();
    });

    row.append(icon, input);
    container.appendChild(row);
  }
}

function validateSetupForm() {
  const inputs = Array.from(document.querySelectorAll(".player-name-input"));
  const values = inputs.map((inp) => inp.value.trim().toLowerCase());
  let valid = true;

  inputs.forEach((inp, i) => {
    const val = values[i];
    const isDuplicate = val !== "" && values.filter((v) => v === val).length > 1;
    const hasError = val === "" || isDuplicate;
    inp.classList.toggle("has-error", hasError);
    if (hasError) valid = false;
  });

  document.getElementById("btn-setup-play").disabled = !valid;
  return valid;
}

function wireSetupForm() {
  document.getElementById("player-dec").addEventListener("click", () => {
    if (settings.players > 1) {
      settings.players--;
      renderPlayerNames();
      syncStepperDisplay();
      validateSetupForm();
    }
  });
  document.getElementById("player-inc").addEventListener("click", () => {
    if (settings.players < 8) {
      settings.players++;
      renderPlayerNames();
      syncStepperDisplay();
      validateSetupForm();
    }
  });

  document.getElementById("difficulty-seg").addEventListener("click", (e) => {
    const btn = e.target.closest(".seg-btn");
    if (!btn) return;
    settings.difficulty = btn.dataset.value;
    document.querySelectorAll("#difficulty-seg .seg-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
  });

  document.getElementById("timer-seg").addEventListener("click", (e) => {
    const btn = e.target.closest(".seg-btn");
    if (!btn) return;
    settings.timer = Number(btn.dataset.value);
    document.querySelectorAll("#timer-seg .seg-btn").forEach((b) => b.classList.toggle("is-active", b === btn));
  });

  document.getElementById("btn-setup-play").addEventListener("click", () => {
    if (!validateSetupForm()) return;
    settings.names = settings.names.map((n, i) => n.trim() || `Player ${i + 1}`);
    saveSettings(settings);
    // Game loop / Get Ready screen lands in Phase 2.
  });
}

function boot() {
  initSplash();
  wireMenu();
  wireInstallPrompt();
  wireSetupForm();
}

boot();
