import { showScreen } from "./router.js";
import * as Game from "./game.js";
import * as UI from "./ui.js";
import { loadGame } from "./state.js";
import { play } from "./audio.js";

let game = null;
let tickHandle = null;
let manualPaused = false;
let pausedAt = null;
let lastTickSecond = null;

const el = {
  getreadyCount: document.getElementById("getready-count"),
  hudRound: document.getElementById("hud-round"),
  hudStrip: document.getElementById("hud-strip"),
  turnIntro: document.getElementById("turn-intro"),
  turnIntroText: document.getElementById("turn-intro-text"),
  turnIntroName: document.getElementById("turn-intro-name"),
  btnReady: document.getElementById("btn-ready"),
  cardStage: document.getElementById("card-stage"),
  timerWrap: document.getElementById("timer-wrap"),
  timerRingFg: document.getElementById("timer-ring-fg"),
  timerSeconds: document.getElementById("timer-seconds"),
  timerNoTimer: document.getElementById("timer-no-timer"),
  gameCard: document.getElementById("game-card"),
  cardBadge: document.getElementById("card-badge"),
  cardSnow: document.getElementById("card-snow"),
  cardPrompt: document.getElementById("card-prompt"),
  cardAnswer: document.getElementById("card-answer"),
  cardAnswerNote: document.getElementById("card-answer-note"),
  brainFreezeStamp: document.getElementById("brain-freeze-stamp"),
  btnThaw: document.getElementById("btn-thaw"),
  btnFlip: document.getElementById("btn-flip"),
  judgeActions: document.getElementById("judge-actions"),
  btnFroze: document.getElementById("btn-froze"),
  btnNailed: document.getElementById("btn-nailed"),
  btnPause: document.getElementById("btn-pause"),
  pauseOverlay: document.getElementById("pause-overlay"),
  btnResumeGame: document.getElementById("btn-resume-game"),
  btnQuitGame: document.getElementById("btn-quit-game"),
  quitConfirmOverlay: document.getElementById("quit-confirm-overlay"),
  btnQuitConfirm: document.getElementById("btn-quit-confirm"),
  btnQuitCancel: document.getElementById("btn-quit-cancel"),
  winnerName: document.getElementById("winner-name"),
  scoreboardList: document.getElementById("scoreboard-list"),
  awardsList: document.getElementById("awards-list"),
  btnPlayAgain: document.getElementById("btn-play-again"),
  btnScoreboardMenu: document.getElementById("btn-scoreboard-menu"),
  announcer: document.getElementById("aria-announcer"),
};

function announce(text) {
  el.announcer.textContent = text;
}

export function startNewGame(settings) {
  game = Game.newGame(settings);
  goToGetReady();
}

export function resumeGame() {
  const saved = loadGame();
  if (!saved) return;
  game = saved;
  Game.resumeDeckContext(game);
  showScreen("game");
  renderHud();
  enterTurnPhase();
}

function goToGetReady() {
  showScreen("getready");
  let n = 3;
  el.getreadyCount.textContent = String(n);
  play("timerTickFast");
  const iv = setInterval(() => {
    n--;
    if (n <= 0) {
      clearInterval(iv);
      showScreen("game");
      beginTurn();
      return;
    }
    el.getreadyCount.textContent = String(n);
    play("timerTickFast");
  }, 700);
}

function renderHud(scoringIndex = -1) {
  el.hudRound.textContent = `Round ${game.round}`;
  UI.renderHud(el.hudStrip, game, scoringIndex);
}

function beginTurn() {
  Game.startTurn(game);
  renderHud();
  play("turnChange");
  enterTurnPhase();
}

function enterTurnPhase() {
  const player = Game.currentPlayer(game);
  const soloMode = game.players.length === 1;

  resetCardVisuals();
  announce(`${player.name}'s turn.`);

  if (soloMode || game.current.phase !== "intro") {
    showCardStage();
    return;
  }

  el.turnIntro.hidden = false;
  el.cardStage.hidden = true;
  el.turnIntroName.textContent = player.name;
}

el.btnReady.addEventListener("click", () => {
  play("tap");
  el.turnIntro.hidden = true;
  showCardStage();
});

function showCardStage() {
  el.turnIntro.hidden = true;
  el.cardStage.hidden = false;
  el.gameCard.classList.add("is-entering");
  setTimeout(() => el.gameCard.classList.remove("is-entering"), 300);
  play("cardSlide");

  const card = Game.getCurrentCard(game);
  renderCardFront(card);

  if (game.current.phase === "intro" || game.current.phase === "prompt") {
    Game.beginPrompt(game);
    startTimer();
  }

  const player = Game.currentPlayer(game);
  el.btnThaw.hidden = player.thawUsed;
}

function renderCardFront(card) {
  if (!card) {
    el.cardBadge.textContent = "—";
    el.cardSnow.textContent = "";
    el.cardPrompt.textContent = "No more cards available.";
    return;
  }
  el.cardBadge.textContent = UI.categoryBadge(card.cat);
  el.cardSnow.textContent = UI.difficultySnowflakes(card.diff);
  el.cardPrompt.textContent = card.q;
  el.cardAnswer.textContent = card.a;
  el.cardAnswerNote.hidden = true;
}

function resetCardVisuals() {
  el.gameCard.classList.remove("is-flipped");
  el.cardStage.classList.remove("is-frozen");
  el.brainFreezeStamp.hidden = true;
  el.brainFreezeStamp.classList.remove("is-active");
  el.judgeActions.hidden = true;
  el.btnFlip.hidden = false;
  el.timerWrap.classList.remove("is-urgent");
}

function startTimer() {
  stopTimer();
  const totalMs = (game.settings.timer || 0) * 1000;

  if (totalMs <= 0) {
    el.timerWrap.querySelector(".timer-ring").style.visibility = "hidden";
    el.timerSeconds.hidden = true;
    el.timerNoTimer.hidden = false;
    return;
  }

  el.timerWrap.querySelector(".timer-ring").style.visibility = "visible";
  el.timerSeconds.hidden = false;
  el.timerNoTimer.hidden = true;
  lastTickSecond = Math.ceil(totalMs / 1000);

  tickHandle = setInterval(() => {
    if (manualPaused || pausedAt || tabHiddenAt) return;
    const elapsed = Date.now() - game.current.startedAt;
    const remaining = totalMs - elapsed;
    if (remaining <= 0) {
      UI.setTimerRing(el.timerRingFg, el.timerWrap, el.timerSeconds, 0, totalMs);
      stopTimer();
      onTimeout();
      return;
    }
    const second = Math.ceil(remaining / 1000);
    if (second !== lastTickSecond) {
      lastTickSecond = second;
      play(remaining <= 5000 ? "timerTickFast" : "timerTick");
      if (second === 10 || second === 5) announce(`${second} seconds left.`);
    }
    UI.setTimerRing(el.timerRingFg, el.timerWrap, el.timerSeconds, remaining, totalMs);
  }, 100);
}

function stopTimer() {
  if (tickHandle) {
    clearInterval(tickHandle);
    tickHandle = null;
  }
}

el.btnThaw.addEventListener("click", () => {
  play("tap");
  const card = Game.useThaw(game);
  if (card) {
    renderCardFront(card);
    stopTimer();
    startTimer();
  }
  el.btnThaw.hidden = true;
});

el.btnFlip.addEventListener("click", () => {
  stopTimer();
  play("cardFlip");
  flipToAnswer();
});

function flipToAnswer() {
  Game.flipCard(game);
  el.gameCard.classList.add("is-flipped");
  el.btnFlip.hidden = true;
  el.judgeActions.hidden = false;
}

function onTimeout() {
  Game.flipCard(game);
  el.gameCard.classList.add("is-flipped");
  el.cardStage.classList.add("is-frozen");
  el.brainFreezeStamp.hidden = false;
  el.brainFreezeStamp.classList.add("is-active");
  el.btnFlip.hidden = true;
  el.judgeActions.hidden = true;
  play("brainFreeze");
  announce("Brain freeze! Time's up.");
  Game.timeoutFreeze(game);
  setTimeout(() => finishJudging(), 1400);
}

el.btnNailed.addEventListener("click", () => {
  play("nailedIt");
  announce("Nailed it! Plus 100 points.");
  Game.judge(game, true);
  finishJudging();
});

el.btnFroze.addEventListener("click", () => {
  play("froze");
  announce("Froze. No points.");
  Game.judge(game, false);
  finishJudging();
});

function finishJudging() {
  const scoringIndex = Game.currentPlayerIndex(game);
  renderHud(scoringIndex);

  const winner = Game.checkWinner(game);
  if (winner) {
    endGame(winner);
    return;
  }

  Game.advanceTurn(game);
  setTimeout(beginTurn, 900);
}

function endGame(winner) {
  Game.finishGame(game);
  showScreen("scoreboard");
  play("win");
  renderScoreboard(winner);
}

function renderScoreboard(winner) {
  el.winnerName.textContent = `${winner.name} Wins Brain Freeze!`;
  UI.spawnConfetti(document.getElementById("screen-scoreboard"), 40);

  const ranked = [...game.players].sort((a, b) => b.score - a.score);
  el.scoreboardList.innerHTML = "";
  ranked.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "scoreboard-row";
    row.innerHTML = `
      <span class="scoreboard-rank">#${i + 1}</span>
      <span class="scoreboard-avatar">${p.avatar}</span>
      <span class="scoreboard-info">
        <span class="scoreboard-info-name">${escapeHtml(p.name)}</span>
        <span class="scoreboard-info-sub">${p.correct}/${p.played} correct &middot; best streak ${p.bestStreak}</span>
      </span>
      <span class="scoreboard-score">${p.score}</span>
    `;
    el.scoreboardList.appendChild(row);
  });

  const coolestHead = [...game.players].sort((a, b) => b.correct - a.correct)[0];
  const brainFreezer = [...game.players].sort((a, b) => (b.played - b.correct) - (a.played - a.correct))[0];
  const hotStreak = [...game.players].sort((a, b) => b.bestStreak - a.bestStreak)[0];

  el.awardsList.innerHTML = "";
  const awards = [
    [`🧠 Coolest Head: ${coolestHead.name}`, coolestHead.correct > 0],
    [`🥶 Brain Freezer: ${brainFreezer.name}`, brainFreezer.played - brainFreezer.correct > 0],
    [`🔥 Hot Streak: ${hotStreak.name} (${hotStreak.bestStreak})`, hotStreak.bestStreak > 1],
  ];
  awards.forEach(([text, show]) => {
    if (!show) return;
    const row = document.createElement("div");
    row.className = "award-row";
    row.textContent = text;
    el.awardsList.appendChild(row);
  });
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function pauseGame() {
  if (manualPaused) return;
  manualPaused = true;
  pausedAt = Date.now();
}

function unpauseGame() {
  if (!manualPaused) return;
  manualPaused = false;
  if (pausedAt && game && game.current) {
    game.current.startedAt += Date.now() - pausedAt;
  }
  pausedAt = null;
}

el.btnPause.addEventListener("click", () => {
  play("tap");
  pauseGame();
  el.pauseOverlay.hidden = false;
});

el.btnResumeGame.addEventListener("click", () => {
  play("tap");
  unpauseGame();
  el.pauseOverlay.hidden = true;
});

el.btnQuitGame.addEventListener("click", () => {
  play("tap");
  el.pauseOverlay.hidden = true;
  el.quitConfirmOverlay.hidden = false;
});

el.btnQuitCancel.addEventListener("click", () => {
  play("tap");
  el.quitConfirmOverlay.hidden = true;
  el.pauseOverlay.hidden = false;
});

el.btnQuitConfirm.addEventListener("click", () => {
  stopTimer();
  manualPaused = false;
  pausedAt = null;
  el.quitConfirmOverlay.hidden = true;
  el.pauseOverlay.hidden = true;
  Game.finishGame(game);
  import("./main.js").then((m) => m.enterMenu());
});

el.btnPlayAgain.addEventListener("click", () => {
  play("tap");
  const settings = game.settings;
  game = Game.newGame(settings);
  goToGetReady();
});

el.btnScoreboardMenu.addEventListener("click", () => {
  play("tap");
  import("./main.js").then((m) => m.enterMenu());
});

let tabHiddenAt = null;

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    tabHiddenAt = Date.now();
  } else if (tabHiddenAt) {
    if (game && game.current) {
      game.current.startedAt += Date.now() - tabHiddenAt;
    }
    tabHiddenAt = null;
  }
});

document.addEventListener("keydown", (e) => {
  if (!game || game.status !== "playing") return;
  if (!el.pauseOverlay.hidden || !el.quitConfirmOverlay.hidden) return;

  if ((e.code === "Space" || e.code === "Enter") && !el.turnIntro.hidden) {
    e.preventDefault();
    el.btnReady.click();
  } else if ((e.code === "Space" || e.code === "Enter") && !el.btnFlip.hidden) {
    e.preventDefault();
    el.btnFlip.click();
  } else if (!el.judgeActions.hidden) {
    if (e.key === "y" || e.key === "Y") {
      e.preventDefault();
      el.btnNailed.click();
    } else if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      el.btnFroze.click();
    }
  }
});
