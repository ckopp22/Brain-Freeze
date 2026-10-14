import { loadSettings, saveSettings, loadGame } from "./state.js";
import { randomMenuLine, randomMenuPose, setHostPose } from "./host.js";
import { isSoundOn, toggleSound, unlockAudio, play } from "./audio.js";
import { AVATAR_SRCS } from "./avatars.js";
import { showScreen, getScreen } from "./router.js";
import * as GameFlow from "./gameflow.js";
import { registerServiceWorker } from "./pwa.js";
import { startFrost } from "./frost.js";

const settings = loadSettings();
const screens = { splash: getScreen("splash") };

function initSplash() {
  const goToMenu = () => {
    unlockAudio();
    play("marquee");
    screens.splash.removeEventListener("click", goToMenu);
    enterMenu();
  };
  screens.splash.addEventListener("click", goToMenu);
  setTimeout(goToMenu, 1500);
}

let hostLineTimer = null;

export function enterMenu() {
  showScreen("menu");
  refreshSoundButton();
  cycleHostLine();
  if (!hostLineTimer) hostLineTimer = setInterval(cycleHostLine, 6000);

  const resumeBtn = document.getElementById("btn-resume");
  resumeBtn.hidden = !loadGame();
  resumeBtn.onclick = () => {
    play("tap");
    GameFlow.resumeGame();
  };
}

function cycleHostLine() {
  const el = document.getElementById("host-line");
  el.textContent = randomMenuLine();
  setHostPose(document.getElementById("host-img"), randomMenuPose());
}

function setSegActive(groupId, activeBtn) {
  document.querySelectorAll(`#${groupId} .seg-btn`).forEach((b) => {
    const on = b === activeBtn;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-pressed", String(on));
  });
}

function refreshSoundButton() {
  const btn = document.getElementById("btn-sound");
  const label = btn.querySelector(".btn-sound-label");
  const on = isSoundOn();
  btn.setAttribute("aria-pressed", String(on));
  label.textContent = on ? "SOUND: ON" : "SOUND: OFF";
  document.getElementById("menu-sound-ico").src = `./assets/ui/icons/icon-sound-${on ? "on" : "off"}.svg`;
}

function wireMenu() {
  document.getElementById("btn-play").addEventListener("click", () => {
    play("tap");
    showScreen("setup");
    initSetupForm();
  });
  document.getElementById("btn-howto").addEventListener("click", () => {
    play("tap");
    showScreen("howto");
  });
  document.getElementById("btn-sound").addEventListener("click", () => {
    toggleSound();
    play("tap");
    refreshSoundButton();
  });
  document.getElementById("btn-howto-back").addEventListener("click", () => {
    play("tap");
    showScreen("menu");
  });
  document.getElementById("btn-setup-back").addEventListener("click", () => {
    play("tap");
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
  if (![0, 15, 30].includes(settings.timer)) settings.timer = 30;
  renderPlayerNames();
  syncStepperDisplay();

  setSegActive("difficulty-seg", document.querySelector(`#difficulty-seg .seg-btn[data-value="${settings.difficulty}"]`));
  setSegActive("timer-seg", document.querySelector(`#timer-seg .seg-btn[data-value="${settings.timer}"]`));

  validateSetupForm();
}

function syncStepperDisplay() {
  document.getElementById("player-count").textContent = String(settings.players);
}

function renderPlayerNames() {
  const container = document.getElementById("player-names");
  container.innerHTML = "";
  container.dataset.count = String(settings.players);

  while (settings.names.length < settings.players) {
    settings.names.push(`Player ${settings.names.length + 1}`);
  }
  settings.names.length = settings.players;

  for (let i = 0; i < settings.players; i++) {
    const row = document.createElement("div");
    row.className = "player-name-row";

    const icon = document.createElement("img");
    icon.className = "player-avatar-icon";
    icon.src = AVATAR_SRCS[i % AVATAR_SRCS.length];
    icon.alt = "";

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
      play("tap");
      settings.players--;
      renderPlayerNames();
      syncStepperDisplay();
      validateSetupForm();
    }
  });
  document.getElementById("player-inc").addEventListener("click", () => {
    if (settings.players < 8) {
      play("tap");
      settings.players++;
      renderPlayerNames();
      syncStepperDisplay();
      validateSetupForm();
    }
  });

  document.getElementById("difficulty-seg").addEventListener("click", (e) => {
    const btn = e.target.closest(".seg-btn");
    if (!btn) return;
    play("tap");
    settings.difficulty = btn.dataset.value;
    setSegActive("difficulty-seg", btn);
  });

  document.getElementById("timer-seg").addEventListener("click", (e) => {
    const btn = e.target.closest(".seg-btn");
    if (!btn) return;
    play("tap");
    settings.timer = Number(btn.dataset.value);
    setSegActive("timer-seg", btn);
  });

  document.getElementById("btn-setup-play").addEventListener("click", () => {
    if (!validateSetupForm()) return;
    play("tap");
    settings.names = settings.names.map((n, i) => n.trim() || `Player ${i + 1}`);
    saveSettings(settings);
    GameFlow.startNewGame(settings);
  });
}

function boot() {
  initSplash();
  wireMenu();
  wireInstallPrompt();
  wireSetupForm();
  registerServiceWorker();
  startFrost();
}

boot();
