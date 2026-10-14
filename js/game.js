import { PROMPTS } from "./prompts.js";
import { AVATAR_SRCS } from "./avatars.js";
import { createDeckContext, drawCard } from "./deck.js";
import { saveGame, clearGame } from "./state.js";

const WIN_SCORE = 1000;
const ROUND_CAP = 25;

let deckCtx = null;

function findPrompt(id) {
  return PROMPTS.find((p) => p.id === id) || null;
}

export function newGame(settings) {
  const players = settings.names.slice(0, settings.players).map((name, i) => ({
    name,
    avatar: AVATAR_SRCS[i % AVATAR_SRCS.length],
    score: 0,
    correct: 0,
    played: 0,
    streak: 0,
    bestStreak: 0,
    thawUsed: false,
  }));

  const game = {
    settings: { ...settings },
    players,
    turn: 0,
    round: 1,
    current: null,
    usedIds: [],
    lastCategory: null,
    status: "playing",
  };

  deckCtx = createDeckContext(settings.difficulty, [], null);
  return game;
}

export function resumeDeckContext(game) {
  deckCtx = createDeckContext(game.settings.difficulty, game.usedIds, game.lastCategory);
}

export function currentPlayerIndex(game) {
  return game.turn % game.players.length;
}

export function currentPlayer(game) {
  return game.players[currentPlayerIndex(game)];
}

export function startTurn(game) {
  const card = drawCard(deckCtx);
  game.usedIds = [...deckCtx.usedThisGame];
  game.lastCategory = deckCtx.lastCategory;
  game.current = {
    promptId: card ? card.id : null,
    startedAt: null,
    remainingMs: (game.settings.timer || 0) * 1000,
    phase: "intro",
  };
  persist(game);
  return card;
}

export function getCurrentCard(game) {
  if (!game.current || !game.current.promptId) return null;
  return findPrompt(game.current.promptId);
}

export function beginPrompt(game) {
  game.current.phase = "prompt";
  game.current.startedAt = Date.now();
}

export function flipCard(game) {
  game.current.phase = "answer";
}

export function useThaw(game) {
  const player = currentPlayer(game);
  if (player.thawUsed) return null;
  player.thawUsed = true;
  const card = drawCard(deckCtx);
  game.usedIds = [...deckCtx.usedThisGame];
  game.lastCategory = deckCtx.lastCategory;
  game.current.promptId = card ? card.id : null;
  return card;
}

function applyResult(game, nailedIt) {
  const player = currentPlayer(game);
  player.played++;
  if (nailedIt) {
    player.score += 100;
    player.correct++;
    player.streak++;
    player.bestStreak = Math.max(player.bestStreak, player.streak);
  } else {
    player.streak = 0;
  }
  game.current.phase = "judged";
}

export function judge(game, nailedIt) {
  applyResult(game, nailedIt);
}

export function timeoutFreeze(game) {
  applyResult(game, false);
}

export function checkWinner(game) {
  const winner = game.players.find((p) => p.score >= WIN_SCORE);
  if (winner) return winner;
  if (game.round > ROUND_CAP) {
    const top = Math.max(...game.players.map((p) => p.score));
    return game.players.find((p) => p.score === top);
  }
  return null;
}

export function advanceTurn(game) {
  game.turn++;
  game.round = Math.floor(game.turn / game.players.length) + 1;
}

export function finishGame(game) {
  game.status = "finished";
  clearGame();
}

function persist(game) {
  if (game.status === "playing") saveGame(game);
}
