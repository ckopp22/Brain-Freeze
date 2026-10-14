import { PROMPTS } from "./prompts.js";
import { loadSeenIds, saveSeenIds } from "./state.js";

const WEIGHTS = {
  E: { E: 0.6, M: 0.35, H: 0.05 },
  M: { E: 0.3, M: 0.5, H: 0.2 },
  H: { E: 0.1, M: 0.45, H: 0.45 },
};

export function createDeckContext(difficulty, usedIds = [], lastCategory = null) {
  return {
    difficulty,
    seen: new Set(loadSeenIds()),
    usedThisGame: new Set(usedIds),
    lastCategory,
  };
}

function pickDifficulty(weights) {
  const r = Math.random();
  let cum = 0;
  for (const d of ["E", "M", "H"]) {
    cum += weights[d];
    if (r <= cum) return d;
  }
  return "H";
}

export function drawCard(ctx) {
  if (ctx.seen.size >= PROMPTS.length) {
    ctx.seen.clear();
  }
  const weights = WEIGHTS[ctx.difficulty] || WEIGHTS.M;
  const targetDiff = pickDifficulty(weights);

  const notUsed = (p) => !ctx.usedThisGame.has(p.id);
  const notSeen = (p) => !ctx.seen.has(p.id);
  const notSameCat = (p) => p.cat !== ctx.lastCategory;

  const tries = [
    (p) => p.diff === targetDiff && notUsed(p) && notSeen(p) && notSameCat(p),
    (p) => p.diff === targetDiff && notUsed(p) && notSeen(p),
    (p) => p.diff === targetDiff && notUsed(p),
    (p) => notUsed(p) && notSeen(p) && notSameCat(p),
    (p) => notUsed(p) && notSeen(p),
    (p) => notUsed(p),
  ];

  let pool = [];
  for (const pred of tries) {
    pool = PROMPTS.filter(pred);
    if (pool.length > 0) break;
  }
  if (pool.length === 0) return null;

  const card = pool[Math.floor(Math.random() * pool.length)];
  ctx.usedThisGame.add(card.id);
  ctx.seen.add(card.id);
  ctx.lastCategory = card.cat;
  saveSeenIds([...ctx.seen]);
  return card;
}
