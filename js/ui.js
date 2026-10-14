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

const SNOWFLAKE_COUNT = { E: 1, M: 2, H: 3 };
const SNOWFLAKE_SRC = "./assets/ui/icons/icon-snowflake.svg";

export function categoryBadge(cat) {
  return CATEGORY_BADGES[cat] || cat;
}

export function renderSnowflakes(container, diff) {
  container.textContent = "";
  container.setAttribute("aria-label", `Difficulty ${SNOWFLAKE_COUNT[diff] || 1} of 3`);
  for (let i = 0; i < (SNOWFLAKE_COUNT[diff] || 1); i++) {
    const img = document.createElement("img");
    img.src = SNOWFLAKE_SRC;
    img.alt = "";
    container.appendChild(img);
  }
}

export function renderHud(container, game, scoringIndex = -1) {
  container.innerHTML = "";
  const current = game.turn % game.players.length;
  game.players.forEach((p, i) => {
    const chip = document.createElement("div");
    chip.className = "hud-chip";
    if (i === current) chip.classList.add("is-current");
    if (i === scoringIndex) chip.classList.add("is-scoring");

    const avatar = document.createElement("img");
    avatar.className = "hud-chip-avatar";
    avatar.src = p.avatar;
    avatar.alt = "";

    const name = document.createElement("span");
    name.className = "hud-chip-name";
    name.textContent = p.name;

    const bar = document.createElement("span");
    bar.className = "hud-chip-bar";
    const fill = document.createElement("span");
    fill.className = "hud-chip-fill";
    fill.style.setProperty("--p", `${Math.min(100, p.score / 10)}%`);
    bar.appendChild(fill);

    const score = document.createElement("span");
    score.className = "hud-chip-score";
    score.textContent = String(p.score);

    chip.append(avatar, name, bar, score);
    container.appendChild(chip);
    if (i === current) chip.scrollIntoView({ block: "nearest", inline: "center" });
  });
}

export function setTimerRing(fgEl, wrapEl, secondsEl, remainingMs, totalMs) {
  if (totalMs <= 0) return;
  const ratio = Math.max(0, Math.min(1, remainingMs / totalMs));
  fgEl.style.strokeDashoffset = String(100 * (1 - ratio));
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
