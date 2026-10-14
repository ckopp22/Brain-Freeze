const CATEGORY_BADGES = {
  LAN: "🗣️ WORDS & LANGUAGE",
  GEO: "🗺️ MAPS & PLACES",
  SCI: "🔬 SCIENCE & SPACE",
  BOD: "🫀 BODY & HEALTH",
  LIF: "🏠 EVERYDAY LIFE",
  HIS: "🏛️ HISTORY & GOVERNMENT",
  MTH: "🔢 NUMBERS & MEASURES",
  STO: "📚 STORIES & CHARACTERS",
  ANI: "🐧 ANIMALS",
  OUT: "⛵ BOATS, ROADS & SPORTS",
};

const SNOWFLAKES = { E: "❄️", M: "❄️❄️", H: "❄️❄️❄️" };

const RING_CIRCUMFERENCE = 276.46;

export function categoryBadge(cat) {
  return CATEGORY_BADGES[cat] || cat;
}

export function difficultySnowflakes(diff) {
  return SNOWFLAKES[diff] || "❄️";
}

export function renderHud(container, game, scoringIndex = -1) {
  container.innerHTML = "";
  game.players.forEach((p, i) => {
    const chip = document.createElement("div");
    chip.className = "hud-chip";
    if (i === game.turn % game.players.length) chip.classList.add("is-current");
    if (i === scoringIndex) chip.classList.add("is-scoring");

    const avatar = document.createElement("div");
    avatar.className = "hud-chip-avatar";
    avatar.textContent = p.avatar;

    const name = document.createElement("div");
    name.className = "hud-chip-name";
    name.textContent = p.name;

    const thermo = document.createElement("div");
    thermo.className = "hud-thermo";
    const filled = Math.min(10, Math.round(p.score / 100));
    for (let s = 0; s < 10; s++) {
      const seg = document.createElement("span");
      seg.className = "hud-thermo-seg" + (s < filled ? " is-filled" : "");
      thermo.appendChild(seg);
    }

    chip.append(avatar, name, thermo);
    container.appendChild(chip);
  });
}

export function setTimerRing(fgEl, wrapEl, secondsEl, remainingMs, totalMs) {
  if (totalMs <= 0) return;
  const ratio = Math.max(0, Math.min(1, remainingMs / totalMs));
  fgEl.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - ratio));
  secondsEl.textContent = String(Math.ceil(remainingMs / 1000));

  let color = "var(--ice)";
  if (ratio < 0.5) color = "var(--gold)";
  if (ratio < 0.2) color = "var(--red)";
  fgEl.style.stroke = color;

  wrapEl.classList.toggle("is-urgent", remainingMs <= 5000 && remainingMs > 0);
}

export function spawnConfetti(container, count = 40) {
  const emojis = ["❄️", "🎉", "✨"];
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.className = "confetti-piece";
    span.textContent = emojis[i % emojis.length];
    span.style.left = `${Math.random() * 100}%`;
    span.style.animationDuration = `${2 + Math.random() * 2}s`;
    span.style.animationDelay = `${Math.random() * 0.6}s`;
    container.appendChild(span);
    setTimeout(() => span.remove(), 5000);
  }
}
