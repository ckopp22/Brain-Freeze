# BRAIN FREEZE — Master Design Document (MDD)

**Project:** Brain Freeze
**Type:** Installable PWA party game (HTML / CSS / vanilla JavaScript, no build step)
**Builder:** Claude Code
**Hosting:** New GitHub repo `brain-freeze`, deployed with GitHub Pages
**Tagline:** "Things you *should* know... but your brain just froze."

---

## 1. Concept

Brain Freeze is a pass-the-device game show for 1–8 players. Each turn a player gets one card with a simple, everyday prompt, the kind of thing everyone feels like they should know ("Is starboard left or right?", "How long did Sleeping Beauty sleep?", "Name 5 countries in Africa"). A countdown timer runs. The player answers out loud, the answer is revealed, and the group (or the player, in solo mode) taps **NAILED IT** or **FROZE**. Nailed it = **+100 points**.

First player to **1,000 points (10 correct cards)** wins the game.

**Design goal:** about half the cards feel easy and satisfying, and about half make the player squirm. The game should be funny, quick (10–20 minutes), and make people say "one more game."

**Not trivia.** No obscure facts. Every prompt is a common-knowledge, everyday-life, "wait, do I actually know this?" item.

---

## 2. Theme & Art Direction

**Theme: a TV game show set inside a giant freezer.** One theme applies to every screen, button, sound and transition.

- **Show name on the marquee:** BRAIN FREEZE, with ice-block letters, frost edges and a dripping-icicle underline.
- **Palette:**
  - Deep navy / midnight blue background (`#0B1633`)
  - Ice blue (`#7FD8FF`), frost white (`#F2FBFF`)
  - Hot "stage light" magenta (`#FF3D9A`) and spotlight gold (`#FFC531`) for buttons, scores and highlights
  - Success green (`#36E6A0`), freeze red (`#FF5C5C`)
- **Stage dressing (CSS only):** marquee bulbs that chase around title frames, a spotlight cone sweeping the background, falling snow/frost particles (canvas or CSS), a subtle checkerboard studio floor at the bottom of screens.
- **Typography:** chunky display font for headings (Google Font such as "Bungee" or "Lilita One", cached by the service worker for offline), clean sans (e.g., "Nunito") for body text. Provide system-font fallbacks.
- **Host character:** **"Chilly Chuck"**, an original animated host (simple SVG snowman-in-a-sparkly-suit with a microphone). He appears on the menu, delivers one-liners (see Section 8) and reacts to results (cheers, "oooh!", brain-freeze wince). Do not use any existing licensed characters.
- **Card design:** each prompt appears on a "game show card": cream card with a category badge, a difficulty snowflake rating (1–3 snowflakes), and a 3D flip animation when revealing the answer.
- **Brain Freeze moment:** when time runs out the screen frosts over (white ice crawl from the edges), the timer shatters, and a "BRAIN FREEZE!" stamp slams down.
- **Buttons:** big, rounded, glossy "game show buzzer" style with a pressed state and soft glow. All tap targets at least 48px.
- **Consistency rule:** every screen uses the same marquee frame, palette, fonts, button style, host and sound language.

---

## 3. Screen Flow

```
 [Splash/Loading] → [Main Menu] → [How To Play]  (back to menu)
                        │
                        ├→ [Sound Toggle] (always visible, persists)
                        │
                        └→ [Player Setup] → [Get Ready countdown] → [Game Loop] → [Final Scoreboard]
                                                                                    ├→ Play Again (same players/settings)
                                                                                    └→ Main Menu
```

### 3.1 Splash
- Brief 1.5s intro: marquee bulbs flicker on, "BRAIN FREEZE" drops in with an ice-crack sound. Skippable with a tap. Doubles as audio unlock (the first tap enables WebAudio).

### 3.2 Main Menu (game show main menu)
- Title marquee with chasing bulbs, Chilly Chuck at a podium, a spotlight sweep.
- Buttons (stacked, buzzer style):
  1. **PLAY** (gold, pulsing)
  2. **HOW TO PLAY**
  3. **SOUND: ON/OFF** toggle (icon + label; speaker with snowflake)
- Footer: version number and "Made with Claude Code".
- Chilly Chuck cycles a random one-liner every ~6 seconds.
- If the PWA install prompt is available (`beforeinstallprompt`), show a small **INSTALL** button. On iOS Safari show a one-time hint ("Tap Share → Add to Home Screen").

### 3.3 How To Play
- Single scrollable "rules card" with 5 short steps, each with an icon:
  1. Pick your players and settings.
  2. Pass the device. Each player gets one card per turn.
  3. Beat the clock by answering out loud.
  4. Flip the card. The group decides: **NAILED IT** (+100) or **FROZE** (0).
  5. First to **1,000 points (10 cards)** wins!
- A "Name 5…" note: *you need all of them to count unless the card says otherwise.*
- **Got It!** button returns to the menu.

### 3.4 Player Setup
Fields (all on one screen, stacked "control panel" cards):
- **Players:** stepper 1–8 (default 2). Under it, name inputs appear for each player with a default ("Player 1"…) and an auto-assigned icy avatar/color (penguin, polar bear, snowflake, igloo, yeti, ice cube, snowman, narwhal).
- **Difficulty:** segmented control: **Easy / Medium / Hard** (default Medium). See deck weighting in Section 5.
- **Timer duration:** segmented control: **15s / 30s / No Timer** (default 30s).
- **PLAY** button (disabled only if a name is blank or duplicated; empty names auto-fill).
- **Back** button to the menu.
- Settings are remembered in `localStorage` for next time.

### 3.5 Get Ready
- 3-2-1 countdown with ice-crack beat, "Chilly Chuck says: let's play!"

### 3.6 Game Loop (see Section 4)

### 3.7 Final Scoreboard
- Winner announcement with confetti made of snowflakes, a trophy (ice trophy SVG), and Chilly Chuck cheering.
- Ranked scoreboard: rank, avatar, name, points, cards correct / cards played, best streak.
- Fun awards (computed from stats): "Coolest Head" (most correct), "Brain Freezer" (most freezes), "Hot Streak" (longest streak).
- Buttons: **PLAY AGAIN** (same players and settings, reshuffled deck, unseen cards prioritized) and **MAIN MENU**.

---

## 4. Core Gameplay

### 4.1 Turn Flow
1. **Turn Intro:** the banner shows "NAME's turn" with the avatar. A big "PASS THE DEVICE TO NAME" screen with a **READY** button prevents other players from seeing the card early (skipped in 1-player mode).
2. **Card Reveal (prompt side):** the card slides in with the prompt text, category and difficulty. Timer starts on the player tapping **READY** (or immediately after the card appears — see 4.4). A circular timer ring around the card drains and changes color (blue → gold → red). Last 5 seconds: ticking sound and pulsing ring.
3. **Answer:** the player answers out loud. A **I'M DONE / FLIP CARD** button stops the clock and flips the card.
4. **Answer Side:** card flips to show the correct answer (and any note, such as "Any 5 valid ones count").
5. **Judgement:** two buttons:
   - **NAILED IT! (+100)** — green, with a ding, snow-burst and score roll-up.
   - **FROZE** — red, with a frost-crack sound and 0 points.
   - Multiplayer: another player (or the group by agreement) taps the button. Solo: the player self-judges (honor system).
6. **Timeout:** if the timer hits 0, Brain Freeze animation plays, the card flips to show the answer automatically, and the result is an automatic **FROZE** (no judging step). Option: a "Close call?" override is NOT included, to keep it simple and fair.
7. **Score update:** the scoreboard strip animates, then the next player's turn begins.

### 4.2 Scoring
- Correct card = **+100 points**. Incorrect/timeout = **0**. No negatives.
- **Win condition:** the first player to reach **1,000 points** (equivalent to 10 correct cards). The game ends immediately when that happens.
- **Tiebreaks:** because the game ends the instant someone hits 1,000, ties cannot happen at the finish line. For the (rare) "all players hit end by round cap" case, see 4.5.

### 4.3 Live HUD (during game)
- Top: a compact scoreboard strip showing each player's avatar, name and a 10-step "thermometer" progress bar (frozen → thawed as they near 1,000). Current player highlighted with a spotlight glow.
- Bottom: small buttons for **Pause** (opens a menu: Resume / Quit to Main Menu with confirm) and **Sound toggle**.
- Round counter: "Round 4".

### 4.4 Timer Behavior
- Options: 15 or 30 seconds, or **No Timer**.
- Timer starts when the card prompt is shown after the player taps **READY**.
- Timer pauses if the game is paused or the tab/app is backgrounded (`visibilitychange`).
- With **No Timer**, the ring is replaced by a snowflake and the player taps **FLIP CARD** when ready.

### 4.5 Safety Rules / Edge Cases
- **Round cap:** if after 25 rounds nobody has reached 1,000, the game ends and the highest score wins (ties shown as co-winners).
- **Skip ("Thaw") lifeline:** each player gets **1 Thaw per game**: swap the current card for a new one, with no penalty except using the lifeline (shown as a snowflake icon on their HUD chip). Disabled in Easy mode? No — available in all modes.
- **No repeats:** no card repeats within a game. Across games the deck prioritizes cards not recently seen (tracked via `localStorage`); when all 500 have been seen, reset the seen list.
- **Quit mid-game:** confirm dialog; returns to the main menu and discards the game.
- **Resume:** game state is saved to `localStorage` after every turn. On launch, if a game is in progress show **RESUME GAME** on the main menu.

---

## 5. Prompt Deck & Difficulty

- **500 prompts** (see Appendix A), spread across **10 categories × 50 prompts**.
- Each prompt has a difficulty tag:
  - **E (Easy, 1 snowflake):** most adults get it. Confidence builders.
  - **M (Medium, 2 snowflakes):** roughly half of people hesitate or miss it.
  - **H (Hard, 3 snowflakes):** the "I KNEW that!" cards. Most people struggle.
- **Deck weighting by difficulty setting** (for each draw, pick a difficulty by weighted random, then a random unseen card of that difficulty, falling back to any unseen card):

| Setting | Easy | Medium | Hard |
|---|---|---|---|
| Easy | 60% | 35% | 5% |
| **Medium (default)** | 30% | 50% | 20% |
| Hard | 10% | 45% | 45% |

  Goal: on Medium, the typical table gets about half right and struggles with the rest.
- **Category variety:** avoid drawing the same category twice in a row (soft rule, relaxed if the pool is exhausted).
- **Answer judging:** all prompts are free-response and judged by the group. Each card stores a canonical answer and, where needed, a note about what counts (e.g., "Any 5 valid countries"). "Name N" cards require N valid items.

### 5.1 Categories (50 prompts each)
| Code | Category | Badge |
|---|---|---|
| LAN | Words & Language | 🗣️ |
| GEO | Maps & Places | 🗺️ |
| SCI | Science & Space | 🔬 |
| BOD | Body & Health | 🫀 |
| LIF | Everyday Life | 🏠 |
| HIS | History & Government | 🏛️ |
| MTH | Numbers & Measures | 🔢 |
| STO | Stories & Characters | 📚 |
| ANI | Animals | 🐧 |
| OUT | Boats, Roads & Sports | ⛵ |

### 5.2 Prompt Data Format
Store in `js/prompts.js` as a plain array (not fetched, so it works offline and loads instantly):

```js
export const PROMPTS = [
  { id: "LAN-001", cat: "LAN", diff: "E", q: "How do you say \"hello\" in French?", a: "Bonjour" },
  // ... 500 total
];
```

Claude Code should parse **Appendix A** (lines of the form `ID | D | Prompt | Answer`) into this structure, with a one-time script or by hand, and verify there are exactly 500 unique IDs and no duplicate prompt text.

---

## 6. Audio

- **Sound toggle:** on the main menu and in-game HUD. State persists in `localStorage` (`bf_sound`). Default: ON.
- **No audio files.** Generate all effects with the WebAudio API (oscillators, noise bursts, gain envelopes), which keeps the repo tiny and fully offline.
- Audio context is created/resumed on the first user tap (mobile autoplay rules).
- Sound events:
  - Button tap (soft "ping")
  - Marquee on / splash (rising sparkle)
  - Card slide-in (whoosh)
  - Timer tick, last 5 seconds (faster tick)
  - Card flip (snap)
  - **NAILED IT** (bright ding + short rising arpeggio, crowd-cheer noise burst)
  - **FROZE** (descending "womp" + ice crack)
  - **Brain Freeze** (timer shatter: filtered noise burst + glass-ice tinkle)
  - Win fanfare (game show style stinger)
  - Turn change (swoosh)
- Optional light looping background music (simple synthesized game show groove) that is OFF unless added later; keep out of v1 to avoid annoyance.
- All sound calls go through one `audio.js` module that checks the toggle.
- Vibration (`navigator.vibrate`) on FROZE/Brain Freeze where supported, also gated by the sound toggle.

---

## 7. Technical Spec

### 7.1 Stack
- Plain **HTML + CSS + JavaScript (ES modules)**. No frameworks, no bundler, no build step.
- Single-page app; screens are `<section>` elements toggled by a tiny router/state machine.
- Mobile-first, portrait-primary, responsive up to tablet/desktop (center the game column at max ~560px with the studio background filling the rest). Landscape must remain usable.
- Persistent storage: `localStorage` with a namespaced prefix `bf_`.

### 7.2 File Structure
```
brain-freeze/
├── index.html
├── manifest.webmanifest
├── service-worker.js
├── README.md
├── css/
│   ├── theme.css        (variables, fonts, base, marquee, buttons)
│   ├── screens.css      (menu, setup, how-to, game, scoreboard)
│   └── animations.css   (flip, frost, confetti, bulbs, snow)
├── js/
│   ├── main.js          (boot, router, screen wiring)
│   ├── state.js         (game state, save/resume, settings)
│   ├── game.js          (turn logic, scoring, win check)
│   ├── deck.js          (weighted draw, seen tracking)
│   ├── prompts.js       (the 500 prompts)
│   ├── audio.js         (WebAudio synth + toggle)
│   ├── ui.js            (DOM helpers, timer ring, animations)
│   └── host.js          (Chilly Chuck lines)
├── assets/
│   ├── host.svg         (Chilly Chuck)
│   ├── avatars/*.svg    (8 player avatars)
│   └── icons/
│       ├── icon.svg
│       ├── icon-192.png
│       ├── icon-512.png
│       ├── icon-maskable-512.png
│       └── apple-touch-icon.png (180)
└── .github/workflows/pages.yml (optional; see Section 9)
```

### 7.3 State Model (simplified)
```js
settings = { sound: true, players: 2, difficulty: "M", timer: 30, names: [] }
game = {
  players: [{ name, avatar, score, correct, played, frozen, streak, bestStreak, thawUsed }],
  turn: 0, round: 1,
  current: { promptId, startedAt, remainingMs, phase }, // phase: intro|prompt|answer|judged
  usedIds: [], status: "playing" | "finished"
}
```
Persist `game` after every phase change so a refresh resumes cleanly.

### 7.4 PWA Requirements
- **`manifest.webmanifest`:** `name: "Brain Freeze"`, `short_name: "Brain Freeze"`, `start_url: "./"`, `scope: "./"` (**relative paths only**, since GitHub Pages serves from `/brain-freeze/`), `display: "standalone"`, `orientation: "portrait"`, `background_color: "#0B1633"`, `theme_color: "#0B1633"`, icons 192/512 plus maskable.
- **`<head>` tags:** manifest link, `theme-color`, `apple-mobile-web-app-capable`, `apple-touch-icon`, viewport with `viewport-fit=cover`.
- **Service worker (`service-worker.js`):** precache all app shell files (HTML, CSS, JS, SVGs, icons, fonts) with a versioned cache name (`brain-freeze-v1`). Cache-first for static assets, network fallback. On activate, delete old caches. Show an "Update ready — tap to refresh" toast when a new worker is waiting.
- All asset URLs relative (`./css/theme.css`), never root-absolute (`/css/...`), so the app works under the GitHub Pages sub-path.
- Fully playable offline after the first load.
- Lighthouse PWA/installability checks should pass.
- Safe-area insets respected (`env(safe-area-inset-*)`) for notched phones.
- Prevent accidental pull-to-refresh and text selection/zoom on game buttons (`touch-action`, `user-select: none`).

### 7.5 Accessibility
- Semantic buttons and headings, visible focus states, keyboard play on desktop (Space/Enter = flip, Y/N = nailed/froze).
- Respect `prefers-reduced-motion` (disable snow, bulb chase, shake; use simple fades).
- Color is never the only signal (icons and text on NAILED IT / FROZE).
- Text contrast of at least 4.5:1; prompt text minimum 24px on mobile.
- `aria-live` region announces the current player, the timer at key moments (10s, 5s) and the result.

### 7.6 Performance
- Total repo under ~1 MB (no audio/image assets beyond small SVGs and icons).
- Animations via CSS transforms/opacity; snow particles capped (e.g., 40) and paused when hidden.

---

## 8. Chilly Chuck (Host) Lines
Short, clean, family-friendly one-liners, rotated randomly and never repeated back-to-back. Examples (Claude Code should write ~10 more per bucket in the same style):

- **Menu:** "Welcome to the coolest show on ice!" · "Your brain called. It's on break." · "Ready to get a little... frosty?"
- **Turn start:** "{name}, you're in the hot seat. Well, the cold seat!" · "Chill, {name}. You've got this."
- **Nailed it:** "That's one cool customer!" · "Ice work!" · "Nothing but snow-nets!"
- **Froze:** "Brrrr... that one stung." · "Brain freeze! It happens to the best of us." · "Don't worry, you'll thaw out."
- **Timeout:** "Time's up — and so is your brain!" · "Frozen solid!"
- **Near the win (900 pts):** "{name} is one card from the finish line!"
- **Winner:** "{name} wins Brain Freeze! Stay cool, champ."

---

## 9. Build & Deployment (Claude Code Instructions)

### 9.1 Build Order
1. Scaffold the repo structure (Section 7.2) and `README.md`.
2. Build `theme.css` (palette, fonts, marquee, buttons) and the Main Menu.
3. Build How To Play and Player Setup (with `localStorage` settings).
4. Build the deck/draw logic with `prompts.js` from Appendix A; unit-check counts (500 unique IDs; 50 per category; E/M/H spread).
5. Build the turn loop: pass screen → card + timer ring → flip → judge → score → next turn → win check.
6. Build the final scoreboard with awards, Play Again and Main Menu.
7. Add `audio.js` (synth sounds + toggle) and wire it everywhere.
8. Add animations: marquee bulbs, snow, card flip, Brain Freeze frost, confetti.
9. Add save/resume, pause menu and edge cases.
10. Add PWA: manifest, icons (generate PNGs from `icon.svg`), service worker, install button.
11. Run the QA checklist (Section 10).
12. Deploy (9.2).

### 9.2 GitHub Repo & Pages Deployment
1. Initialize git in the project folder; create `.gitignore` (OS junk files, editor folders).
2. Create a **new public GitHub repo named `brain-freeze`** (e.g., `gh repo create brain-freeze --public --source=. --remote=origin --push`).
3. Push the `main` branch.
4. Enable GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / root**. (CLI alternative: `gh api -X POST repos/{owner}/brain-freeze/pages -f "source[branch]=main" -f "source[path]=/"`.)
5. Wait for the first deploy, then verify at `https://<username>.github.io/brain-freeze/`.
6. Verify the **installability** (manifest and service worker load, no 404s from sub-path issues), then test "Add to Home Screen" on iOS and Android.
7. Because there is no build step, each future update is just `git push`. **Bump the cache name** in `service-worker.js` (`brain-freeze-v2`, etc.) on every release so installed copies update.
8. Put the live URL in the README.

---

## 10. QA Checklist
- [ ] 500 prompts, unique IDs, no duplicate prompt text, every prompt has an answer.
- [ ] Each difficulty setting draws the expected E/M/H mix (spot check 100 draws).
- [ ] 1–8 players all work; names/avatars unique; settings persist.
- [ ] Both timer lengths (15s, 30s) and No Timer behave correctly; timer pauses on tab hide.
- [ ] Brain Freeze animation + auto-FROZE on timeout.
- [ ] NAILED IT adds exactly 100; game ends at 1,000 / 10th correct card.
- [ ] Thaw lifeline works once per player and never repeats a card.
- [ ] Scoreboard ranks and awards are correct; Play Again reshuffles; Main Menu works.
- [ ] Sound toggle mutes everything (including vibration) and persists.
- [ ] Refresh mid-game resumes; Quit confirms and clears.
- [ ] Works offline after first load; installs on iOS and Android; maskable icon looks right.
- [ ] No console errors; no root-absolute URLs; works under `/brain-freeze/` sub-path.
- [ ] Same theme/host/buttons/sounds on every screen; reduced-motion respected.

---

## 11. Future Ideas (Out of Scope for v1)
- Team mode (2 teams of N), "Speed Round" (3 cards in 60s), custom card packs, kid-friendly deck, daily challenge card, shareable result image, themed seasonal decks (Brain Freeze: Holiday Edition).

---

# APPENDIX A — The 500 Prompts

**Format:** `ID | Difficulty | Prompt | Answer`
**Difficulty:** E = Easy, M = Medium, H = Hard.
For "Name N" cards, the listed answers are examples; any N valid answers count.

## LAN — Words & Language (50)
LAN-001 | E | How do you say "hello" in French? | Bonjour
LAN-002 | E | How do you say "thank you" in Spanish? | Gracias
LAN-003 | E | What do you call a word that means the opposite of another word? | Antonym
LAN-004 | M | What do you call a word that means the same as another word? | Synonym
LAN-005 | E | How many letters are in the English alphabet? | 26
LAN-006 | E | Name the 5 vowels. | A, E, I, O, U
LAN-007 | M | Which is the standard word: "irregardless" or "regardless"? | Regardless
LAN-008 | M | What do you call words that sound the same but have different spellings and meanings, like "to" and "two"? | Homophones
LAN-009 | M | What do you call a word that reads the same forward and backward, like "racecar"? | Palindrome
LAN-010 | H | What do you call a word that imitates a sound, like "buzz" or "sizzle"? | Onomatopoeia
LAN-011 | E | How do you say "goodbye" in Spanish? | Adiós (or hasta luego)
LAN-012 | E | How do you say "yes" in French? | Oui
LAN-013 | M | How do you say "thank you" in German? | Danke
LAN-014 | M | How do you say "thank you" in Italian? | Grazie
LAN-015 | M | How do you say "thank you" in Japanese? | Arigatō
LAN-016 | M | What does "ciao" mean in Italian? | Both "hello" and "goodbye"
LAN-017 | E | What language is mainly spoken in Brazil? | Portuguese
LAN-018 | M | What is the most spoken native language in the world? | Mandarin Chinese
LAN-019 | M | What does "e.g." mean? | "For example" (exempli gratia)
LAN-020 | M | What does "i.e." mean? | "That is" (id est)
LAN-021 | E | What are you being asked to do when an invitation says "RSVP"? | Reply / respond to the invitation
LAN-022 | E | What does "ASAP" stand for? | As soon as possible
LAN-023 | E | What does "DIY" stand for? | Do it yourself
LAN-024 | E | What does "FYI" stand for? | For your information
LAN-025 | M | What does "BYOB" stand for? | Bring your own bottle (or beverage)
LAN-026 | M | What does "AM" stand for in "7 AM"? | Ante meridiem ("before midday")
LAN-027 | H | What does "PM" stand for in "7 PM"? | Post meridiem ("after midday")
LAN-028 | E | What is the plural of "mouse" (the animal)? | Mice
LAN-029 | E | What is the plural of "child"? | Children
LAN-030 | M | What is the plural of "goose"? | Geese
LAN-031 | M | What is the plural of "cactus"? | Cacti (or cactuses)
LAN-032 | M | What is the plural of "sheep"? | Sheep
LAN-033 | M | What is the past tense of "swim"? | Swam
LAN-034 | M | What is the past tense of "bring"? | Brought
LAN-035 | H | Which is correct: "Who" or "Whom" — "To ___ did you give the book?" | Whom
LAN-036 | M | Which is correct: "less" or "fewer" — "I have ___ cookies than you." | Fewer
LAN-037 | M | Name the three articles in English. | A, an, the
LAN-038 | M | Name the "Five W's" used to ask about a story or situation. | Who, what, when, where, why
LAN-039 | E | Name 5 colors of the rainbow. | Any 5 of: red, orange, yellow, green, blue, indigo, violet
LAN-040 | E | Name 5 words that rhyme with "cat." | e.g., hat, bat, mat, rat, sat, flat, chat
LAN-041 | M | What punctuation mark shows possession or replaces missing letters in a contraction? | Apostrophe
LAN-042 | H | What are the two dots over a letter, like in "naïve" or "Zoë," called? | Diaeresis (umlaut also accepted)
LAN-043 | M | What do you call a word made from the first letters of a phrase that you pronounce as a word, like NASA? | Acronym
LAN-044 | M | What do you call a comparison that uses "like" or "as"? | Simile
LAN-045 | M | What do you call a comparison that says one thing IS another, without "like" or "as"? | Metaphor
LAN-046 | E | What do you call the person who writes a book? | Author
LAN-047 | E | How many syllables are in the word "banana"? | Three
LAN-048 | M | What do you call a book of words and their meanings? | Dictionary
LAN-049 | H | What do you call a book of synonyms? | Thesaurus
LAN-050 | M | Name the days of the week that start with the letter "T." | Tuesday and Thursday

## GEO — Maps & Places (50)
GEO-001 | E | How many continents are there? | 7
GEO-002 | E | Name the 7 continents. | Asia, Africa, North America, South America, Antarctica, Europe, Australia/Oceania
GEO-003 | E | How many oceans are there? | 5 (Pacific, Atlantic, Indian, Southern, Arctic)
GEO-004 | M | Which US city is nicknamed the Windy City? | Chicago
GEO-005 | E | In which direction does the sun set? | West
GEO-006 | E | Which country lies directly south of the United States? | Mexico
GEO-007 | E | Which country is the Colosseum in? | Italy
GEO-008 | M | Which US state is the Grand Canyon in? | Arizona
GEO-009 | M | Which river runs through Paris? | The Seine
GEO-010 | M | Which river runs through London? | The Thames
GEO-011 | M | Which sea lies between Europe and Africa? | The Mediterranean Sea
GEO-012 | M | Which country is shaped like a boot? | Italy
GEO-013 | H | Which Great Lake is entirely within the United States? | Lake Michigan
GEO-014 | H | What is the largest island in the world? | Greenland
GEO-015 | M | Which country is the Taj Mahal in? | India
GEO-016 | M | Which two oceans does the Panama Canal connect? | Atlantic and Pacific
GEO-017 | M | Which country is the city of Sydney in? | Australia
GEO-018 | H | Which mountain range runs along the western edge of South America? | The Andes
GEO-019 | H | What is the tallest mountain in North America? | Denali (Mount McKinley)
GEO-020 | M | Which country has a maple leaf on its flag? | Canada
GEO-021 | E | Which US state is made up of islands in the Pacific Ocean? | Hawaii
GEO-022 | M | Which US state is nicknamed the Lone Star State? | Texas
GEO-023 | M | Which two US states are not connected to the other 48? | Alaska and Hawaii
GEO-024 | H | Which is larger by area: Canada or the United States? | Canada
GEO-025 | H | Which sea is the lowest point on land, bordering Israel and Jordan? | The Dead Sea
GEO-026 | E | What is the largest US state by area? | Alaska
GEO-027 | M | What is the smallest US state by area? | Rhode Island
GEO-028 | E | How many US states are there? | 50
GEO-029 | M | Name the 5 Great Lakes. | Superior, Michigan, Huron, Erie, Ontario
GEO-030 | E | What famous river runs through Egypt? | The Nile
GEO-031 | M | What river forms much of the border between Texas and Mexico? | Rio Grande
GEO-032 | E | What is the largest ocean? | Pacific Ocean
GEO-033 | E | What is the tallest mountain on Earth above sea level? | Mount Everest
GEO-034 | M | Name the two countries with more than a billion people. | India and China
GEO-035 | M | What is the largest country in the world by area? | Russia
GEO-036 | M | What is the smallest country in the world? | Vatican City
GEO-037 | E | In which direction does the sun rise? | East
GEO-038 | M | Which two countries share the world's longest international land border? | United States and Canada
GEO-039 | E | Which continent is the coldest? | Antarctica
GEO-040 | E | Which continent is Egypt in? | Africa
GEO-041 | E | Which continent is Brazil in? | South America
GEO-042 | M | What is the largest hot desert in the world? | The Sahara
GEO-043 | E | Name the 4 cardinal directions. | North, south, east, west
GEO-044 | M | What does the Equator divide the Earth into? | Northern and Southern Hemispheres
GEO-045 | H | What line of longitude is 0 degrees and divides East from West? | The Prime Meridian
GEO-046 | E | Which country are the Great Pyramids of Giza in? | Egypt
GEO-047 | E | Which country is the Great Wall in? | China
GEO-048 | E | Which country is the Eiffel Tower in? | France
GEO-049 | M | Which country is Big Ben in? | United Kingdom (England)
GEO-050 | H | Name 5 countries in Africa. | Any 5 valid (e.g., Egypt, Kenya, Nigeria, Ghana, Morocco, South Africa)

## SCI — Science & Space (50)
SCI-001 | E | How many planets are in our solar system? | 8
SCI-002 | M | Name the 8 planets. | Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune
SCI-003 | E | Which planet is closest to the Sun? | Mercury
SCI-004 | E | Which planet is known as the Red Planet? | Mars
SCI-005 | E | What is the largest planet in our solar system? | Jupiter
SCI-006 | E | Which planet is famous for its bright rings? | Saturn
SCI-007 | E | What star is at the center of our solar system? | The Sun
SCI-008 | E | What does the Moon orbit? | The Earth
SCI-009 | E | What gas do humans need to breathe to live? | Oxygen
SCI-010 | M | What gas do plants take in from the air? | Carbon dioxide
SCI-011 | M | What is the process plants use to make food from sunlight? | Photosynthesis
SCI-012 | E | At what temperature in Fahrenheit does water freeze? | 32°F (0°C)
SCI-013 | E | At what temperature in Celsius does water boil at sea level? | 100°C (212°F)
SCI-014 | E | Name the three common states of matter. | Solid, liquid, gas
SCI-015 | E | What is the chemical formula for water? | H2O
SCI-016 | M | What is the chemical symbol for gold? | Au
SCI-017 | M | What two elements make up table salt? | Sodium and chlorine
SCI-018 | M | What is the chemical symbol for oxygen? | O
SCI-019 | E | What force keeps us on the ground? | Gravity
SCI-020 | M | Which scientist is famous for discovering gravity after an apple fell? | Isaac Newton
SCI-021 | M | Who developed the theory of relativity? | Albert Einstein
SCI-022 | M | What is the hardest natural substance on Earth? | Diamond
SCI-023 | H | What type of rock forms from cooled lava or magma? | Igneous
SCI-024 | H | Name the 3 main types of rock. | Igneous, sedimentary, metamorphic
SCI-025 | E | What causes day and night? | Earth rotating (spinning) on its axis
SCI-026 | M | What causes the seasons? | Earth's tilted axis as it orbits the Sun
SCI-027 | E | About how long does Earth take to orbit the Sun? | About 365 days (one year)
SCI-028 | E | How many days are in a leap year? | 366
SCI-029 | M | Name the colors of the rainbow in order. | Red, orange, yellow, green, blue, indigo, violet
SCI-030 | M | What is it called when liquid water turns into vapor? | Evaporation
SCI-031 | M | What is it called when water falls from clouds as rain, snow, or hail? | Precipitation
SCI-032 | M | What do you call a scientist who studies rocks and the Earth? | Geologist
SCI-033 | M | What do you call a scientist who studies weather? | Meteorologist
SCI-034 | M | What do you call a scientist who studies stars and planets? | Astronomer
SCI-035 | H | What is the closest star to Earth other than the Sun? | Proxima Centauri
SCI-036 | M | Who was the first person to walk on the Moon? | Neil Armstrong
SCI-037 | M | In what year did humans first land on the Moon? | 1969
SCI-038 | E | Which travels faster: light or sound? | Light
SCI-039 | H | What causes thunder? | Lightning rapidly heating the air, which expands and creates a shock wave
SCI-040 | H | Is a tomato botanically a fruit or a vegetable? | A fruit
SCI-041 | M | What are the three primary colors of paint (traditional)? | Red, yellow, blue
SCI-042 | H | What are the primary colors of light? | Red, green, blue
SCI-043 | E | What tool uses Earth's magnetic field to show direction? | A compass
SCI-044 | E | What type of energy do solar panels use? | Sunlight (solar energy)
SCI-045 | E | What do you call a baby frog that lives in water? | Tadpole
SCI-046 | M | If you bring two opposite magnet poles together, do they attract or repel? | Attract
SCI-047 | H | What do you call a rock from space that survives and lands on Earth? | Meteorite
SCI-048 | M | What happens during a solar eclipse? | The Moon passes between Earth and the Sun, blocking it
SCI-049 | M | What is the name of our galaxy? | The Milky Way
SCI-050 | M | What is the center of an atom called? | The nucleus

## BOD — Body & Health (50)
BOD-001 | M | About how many bones does an adult human have? | 206
BOD-002 | M | How many teeth does a full adult set have (with wisdom teeth)? | 32
BOD-003 | E | Name the 5 senses. | Sight, hearing, smell, taste, touch
BOD-004 | M | How many chambers does the human heart have? | 4
BOD-005 | E | Which organ pumps blood around your body? | The heart
BOD-006 | E | Which organs do you use to breathe? | The lungs
BOD-007 | M | What is the largest organ of the human body? | The skin
BOD-008 | H | Which organs filter your blood and make urine? | The kidneys
BOD-009 | H | Which organ makes bile to help digest fat? | The liver
BOD-010 | E | Where does your food go to be broken down after you swallow it? | The stomach
BOD-011 | H | What is the longest bone in the human body? | The femur (thigh bone)
BOD-012 | H | Where are the smallest bones in your body located? | In the ear
BOD-013 | M | What is the medical name for the kneecap? | Patella
BOD-014 | H | What is the medical name for the collarbone? | Clavicle
BOD-015 | H | What is the medical name for the shoulder blade? | Scapula
BOD-016 | H | What is the "funny bone" actually? | A nerve (the ulnar nerve) at the elbow
BOD-017 | E | What is normal human body temperature in Fahrenheit? | About 98.6°F (37°C)
BOD-018 | E | How many fingers and thumbs do you have in total? | 10
BOD-019 | M | Name the four main blood types. | A, B, AB, O
BOD-020 | H | Which blood type is the "universal donor"? | O negative
BOD-021 | M | Which vitamin does your skin make from sunlight? | Vitamin D
BOD-022 | E | Which vitamin are oranges famous for? | Vitamin C
BOD-023 | E | Which mineral in milk helps build strong bones and teeth? | Calcium
BOD-024 | E | About how many hours of sleep do most adults need? | 7 to 9 hours
BOD-025 | M | Which nutrient found in meat, eggs, and beans helps build muscle? | Protein
BOD-026 | M | What do red blood cells carry? | Oxygen
BOD-027 | H | What is the medical term for high blood pressure? | Hypertension
BOD-028 | M | What does CPR stand for? | Cardiopulmonary resuscitation
BOD-029 | H | What does AED stand for? | Automated external defibrillator
BOD-030 | E | What number do you dial for emergencies in the United States? | 911
BOD-031 | M | What is the Heimlich maneuver used for? | Helping someone who is choking
BOD-032 | E | What should you do if your clothes catch on fire? | Stop, drop, and roll
BOD-033 | E | Which sense organ do you use to smell? | The nose
BOD-034 | H | Name the five basic tastes. | Sweet, sour, salty, bitter, umami
BOD-035 | M | What is the colored part of your eye called? | The iris
BOD-036 | M | What is the black circle in the center of your eye called? | The pupil
BOD-037 | H | What is the medical name for your voice box? | Larynx
BOD-038 | H | What is the medical name for your windpipe? | Trachea
BOD-039 | H | What is the name of the tube that carries food from your mouth to your stomach? | Esophagus
BOD-040 | H | What is the largest muscle in the human body? | Gluteus maximus
BOD-041 | H | What is the medical name for the breastbone? | Sternum
BOD-042 | M | What are the bones of your spine called? | Vertebrae
BOD-043 | E | What part of your body protects your brain? | The skull
BOD-044 | M | What are the two halves of the brain called? | Hemispheres (left and right)
BOD-045 | M | What do you call a doctor who treats children? | Pediatrician
BOD-046 | M | What do you call a doctor who specializes in the heart? | Cardiologist
BOD-047 | M | What do you call a doctor who specializes in skin? | Dermatologist
BOD-048 | H | What do you call a doctor who specializes in eyes and can perform eye surgery? | Ophthalmologist
BOD-049 | E | About how long should you wash your hands with soap? | At least 20 seconds
BOD-050 | M | About how often should you replace your toothbrush? | Every 3 months

## LIF — Everyday Life (50)
LIF-001 | E | What are the three R's of recycling? | Reduce, reuse, recycle
LIF-002 | E | Which way do you turn a screw to tighten it? | Clockwise (to the right)
LIF-003 | E | "Righty-tighty, lefty-loosey": which direction loosens a screw? | Left / counterclockwise
LIF-004 | M | What internal temperature (°F) should chicken reach to be safe to eat? | 165°F
LIF-005 | M | What ingredient makes bread dough rise? | Yeast
LIF-006 | M | How many tablespoons are in a cup? | 16
LIF-007 | M | How many teaspoons are in a tablespoon? | 3
LIF-008 | E | How many ounces are in a pound? | 16
LIF-009 | M | How many cups are in a quart? | 4
LIF-010 | M | How many quarts are in a gallon? | 4
LIF-011 | E | Which side of the road do people drive on in the United States? | The right side
LIF-012 | E | What does a red traffic light mean? | Stop
LIF-013 | E | What does a yellow traffic light mean? | Slow down / prepare to stop
LIF-014 | E | What shape is a stop sign? | Octagon (8 sides)
LIF-015 | M | What shape is a yield sign? | Downward-pointing triangle
LIF-016 | H | At a four-way stop, if two cars arrive at the same time, who goes first? | The car on the right
LIF-017 | M | Which pedal is on the left in an automatic car: gas or brake? | Neither: the brake is on the left of the two pedals (the gas is on the right)
LIF-018 | M | What does "PIN" stand for? | Personal identification number
LIF-019 | M | What does "ATM" stand for? | Automated teller machine
LIF-020 | M | What does "USB" stand for? | Universal Serial Bus
LIF-021 | M | What does "WWW" stand for in a web address? | World Wide Web
LIF-022 | M | What does "GPS" stand for? | Global Positioning System
LIF-023 | M | What does "SPF" on sunscreen stand for? | Sun Protection Factor
LIF-024 | E | What is the first thing to do for a minor burn? | Cool it under cool running water
LIF-025 | M | What common household cleaner should you never mix with bleach? | Ammonia
LIF-026 | E | Name the four seasons. | Winter, spring, summer, fall (autumn)
LIF-027 | M | How many months of the year have 31 days? | 7
LIF-028 | E | How many months have 28 days? | All 12 (February is the only one with exactly 28, in non-leap years)
LIF-029 | E | Which direction do the hands of a clock move? | Clockwise
LIF-030 | M | What should you do first if you smell natural gas in your home? | Leave the building and call for help from outside; don't use switches or flames
LIF-031 | E | What does a smoke detector chirping every minute usually mean? | The battery is low
LIF-032 | M | How often should you test smoke detectors? | At least monthly (replace batteries yearly or when it chirps)
LIF-033 | M | What is a typical restaurant tip percentage in the US? | About 15–20%
LIF-034 | E | What does "tbsp" stand for in a recipe? | Tablespoon
LIF-035 | E | What does "tsp" stand for in a recipe? | Teaspoon
LIF-036 | M | What does "oz" stand for? | Ounce
LIF-037 | E | Name the three main meals of the day. | Breakfast, lunch, dinner
LIF-038 | E | Name the three main ingredients in a classic PB&J sandwich. | Peanut butter, jelly (or jam), bread
LIF-039 | M | What is the difference between a Phillips and a flathead screwdriver? | Phillips has a + shaped tip; flathead has a single flat blade
LIF-040 | E | What tool do you use to drive in a nail? | A hammer
LIF-041 | E | What tool do you use to measure the length of something? | A tape measure (or ruler)
LIF-042 | M | What does the saying "measure twice, cut once" mean? | Double-check before doing something you can't undo
LIF-043 | M | If an outlet suddenly stops working, what should you check first? | The circuit breaker (or a GFCI reset button)
LIF-044 | M | Which way do you turn a faucet handle to turn the water ON? | Counterclockwise (left)
LIF-045 | H | What is the "five-second rule," and is it true? | Idea that dropped food is safe if picked up fast; it's a myth, since bacteria transfer instantly
LIF-046 | M | About how many days can leftovers safely stay in the fridge? | 3 to 4 days
LIF-047 | E | What should you do before crossing the street? | Look both ways
LIF-048 | E | What are the colors of a traffic light from top to bottom? | Red, yellow, green
LIF-049 | M | What does "perishable" mean for food? | It spoils quickly
LIF-050 | E | What does a "dishwasher safe" label mean? | The item can be cleaned in a dishwasher

## HIS — History & Government (50)
HIS-001 | E | Who was the first president of the United States? | George Washington
HIS-002 | M | Name 5 US presidents. | Any 5 valid presidents
HIS-003 | E | Whose face is on the US one-dollar bill? | George Washington
HIS-004 | E | Whose face is on the US penny? | Abraham Lincoln
HIS-005 | M | Whose face is on the US $10 bill? | Alexander Hamilton
HIS-006 | M | Whose face is on the US $100 bill? | Benjamin Franklin
HIS-007 | E | In what year was the Declaration of Independence signed? | 1776
HIS-008 | M | Who was the main author of the Declaration of Independence? | Thomas Jefferson
HIS-009 | E | On what date do Americans celebrate Independence Day? | July 4
HIS-010 | E | How many stars are on the US flag? | 50
HIS-011 | E | How many stripes are on the US flag? | 13
HIS-012 | M | What do the 13 stripes on the US flag represent? | The original 13 colonies
HIS-013 | E | How many branches does the US government have? | 3
HIS-014 | M | Name the three branches of the US government. | Legislative, executive, judicial
HIS-015 | M | What two chambers make up the US Congress? | The Senate and the House of Representatives
HIS-016 | E | How many senators does each state have? | 2
HIS-017 | M | How many US senators are there in total? | 100
HIS-018 | H | How many members are in the US House of Representatives? | 435
HIS-019 | E | How long is one term for the US president? | 4 years
HIS-020 | M | How many terms can a US president serve? | Two
HIS-021 | H | What is the minimum age to be US president? | 35
HIS-022 | M | How many justices are on the US Supreme Court? | 9
HIS-023 | M | What is the main job of the vice president if the president can't serve? | To become president
HIS-024 | M | Name 3 freedoms protected by the First Amendment. | Speech, religion, press, assembly, petition (any 3)
HIS-025 | M | What famous document begins with "We the People"? | The US Constitution
HIS-026 | M | What is the Bill of Rights? | The first 10 amendments to the Constitution
HIS-027 | E | Which president led the US during the Civil War? | Abraham Lincoln
HIS-028 | H | What did the Emancipation Proclamation declare? | Enslaved people in the rebelling states were free
HIS-029 | M | In what years did World War II take place? | 1939–1945
HIS-030 | M | In what years did World War I take place? | 1914–1918
HIS-031 | M | What event brought the United States into World War II? | The attack on Pearl Harbor
HIS-032 | M | In which US state is Pearl Harbor? | Hawaii
HIS-033 | H | What was the Boston Tea Party? | Colonists dumped British tea into Boston Harbor in 1773 to protest taxes
HIS-034 | E | Which explorer sailed across the Atlantic in 1492? | Christopher Columbus
HIS-035 | M | What was the name of the ship that carried the Pilgrims to America in 1620? | The Mayflower
HIS-036 | M | Who gave the famous "I Have a Dream" speech? | Martin Luther King Jr.
HIS-037 | H | Who was the first US president to live in the White House? | John Adams
HIS-038 | E | What is the name of the US president's official residence? | The White House
HIS-039 | E | In what city's harbor does the Statue of Liberty stand? | New York City
HIS-040 | M | Which country gave the Statue of Liberty to the US? | France
HIS-041 | H | In what year did the Berlin Wall fall? | 1989
HIS-042 | M | Which ancient wonder, built as a tomb, is the only one still standing? | The Great Pyramid of Giza
HIS-043 | M | Which ancient empire built the Colosseum? | The Roman Empire
HIS-044 | M | Which ancient civilization built Machu Picchu? | The Inca
HIS-045 | H | Who was the first emperor of Rome? | Augustus
HIS-046 | M | In what year did the Titanic sink? | 1912
HIS-047 | H | Which English king signed the Magna Carta in 1215? | King John
HIS-048 | E | Who painted the Mona Lisa? | Leonardo da Vinci
HIS-049 | M | Who is credited with inventing the telephone? | Alexander Graham Bell
HIS-050 | M | What did the Wright brothers achieve in 1903? | The first powered, controlled airplane flight (Kitty Hawk, NC)

## MTH — Numbers & Measures (50)
MTH-001 | E | How many minutes are in an hour? | 60
MTH-002 | E | How many hours are in a day? | 24
MTH-003 | E | How many days are in a regular year? | 365
MTH-004 | E | How many weeks are in a year? | 52
MTH-005 | E | How many months are in a year? | 12
MTH-006 | E | How many seconds are in a minute? | 60
MTH-007 | E | How many pennies are in a dollar? | 100
MTH-008 | E | How many cents is a nickel worth? | 5
MTH-009 | E | How many cents is a dime worth? | 10
MTH-010 | E | How many cents is a quarter worth? | 25
MTH-011 | M | How many nickels are in a dollar? | 20
MTH-012 | E | How many sides does a triangle have? | 3
MTH-013 | M | How many sides does a hexagon have? | 6
MTH-014 | M | How many sides does an octagon have? | 8
MTH-015 | M | How many sides does a pentagon have? | 5
MTH-016 | M | How many degrees are in a full circle? | 360
MTH-017 | M | How many degrees are in a right angle? | 90
MTH-018 | H | What do the angles of any triangle add up to? | 180 degrees
MTH-019 | E | What is 12 times 12? | 144
MTH-020 | E | What is 7 times 8? | 56
MTH-021 | E | What is 9 times 6? | 54
MTH-022 | E | What is half of 150? | 75
MTH-023 | M | What is a 15% tip on a $20 bill? | $3
MTH-024 | E | What is 10% of 250? | 25
MTH-025 | E | What fraction is the same as 25%? | 1/4
MTH-026 | E | What fraction is the same as 0.5? | 1/2
MTH-027 | M | What is the square root of 81? | 9
MTH-028 | M | What is the square root of 144? | 12
MTH-029 | H | What is 2 to the 10th power? | 1,024
MTH-030 | M | Name 5 prime numbers. | Any 5 of: 2, 3, 5, 7, 11, 13, 17, 19, 23...
MTH-031 | M | Is zero an even or odd number? | Even
MTH-032 | M | Is 1 a prime number? | No
MTH-033 | M | What is the name for the number 1,000,000,000? | One billion
MTH-034 | M | How many zeros are in one million? | 6
MTH-035 | H | How many zeros are in one billion? | 9
MTH-036 | H | How many zeros are in one trillion? | 12
MTH-037 | M | What is the Roman numeral for 10? | X
MTH-038 | M | What is the Roman numeral for 50? | L
MTH-039 | M | What is the Roman numeral for 100? | C
MTH-040 | H | What is the Roman numeral for 1,000? | M
MTH-041 | M | What number is the Roman numeral IV? | 4
MTH-042 | M | What is the Roman numeral for 9? | IX
MTH-043 | E | How many feet are in a yard? | 3
MTH-044 | E | How many inches are in a foot? | 12
MTH-045 | M | How many feet are in a mile? | 5,280
MTH-046 | M | How many centimeters are in a meter? | 100
MTH-047 | M | How many meters are in a kilometer? | 1,000
MTH-048 | M | Which is longer: a mile or a kilometer? | A mile
MTH-049 | M | How many pounds are in a US ton? | 2,000
MTH-050 | M | What is pi, rounded to two decimal places? | 3.14

## STO — Stories & Characters (50)
STO-001 | E | How long did Sleeping Beauty actually sleep? | 100 years
STO-002 | E | What did Cinderella lose at the ball? | A glass slipper
STO-003 | E | Who did Snow White live with in the forest? | The seven dwarfs
STO-004 | M | Name 5 of the seven dwarfs. | Doc, Grumpy, Happy, Sleepy, Bashful, Sneezy, Dopey (any 5)
STO-005 | E | What did Jack trade his cow for in "Jack and the Beanstalk"? | Magic beans
STO-006 | E | How many little pigs are in the famous fairy tale? | 3
STO-007 | M | What did the third little pig build his house out of? | Bricks
STO-008 | M | Who was Little Red Riding Hood going to visit? | Her grandmother
STO-009 | E | What happens to Pinocchio's nose when he lies? | It grows longer
STO-010 | M | Who wrote "Romeo and Juliet"? | William Shakespeare
STO-011 | E | Who wrote the Harry Potter books? | J.K. Rowling
STO-012 | E | What school does Harry Potter attend? | Hogwarts
STO-013 | M | Who wrote "Charlie and the Chocolate Factory"? | Roald Dahl
STO-014 | M | Who wrote "The Cat in the Hat"? | Dr. Seuss
STO-015 | H | What was Dr. Seuss's real name? | Theodor Geisel
STO-016 | E | What is the name of Peter Pan's home? | Neverland
STO-017 | E | What is the name of Peter Pan's fairy friend? | Tinker Bell
STO-018 | E | What food did Goldilocks sample in the three bears' house? | Porridge
STO-019 | E | How many bears are in "Goldilocks and the Three Bears"? | 3
STO-020 | E | Who lives in a pineapple under the sea? | SpongeBob SquarePants
STO-021 | E | Who is Mickey Mouse's girlfriend? | Minnie Mouse
STO-022 | M | What color is Kermit the Frog? | Green
STO-023 | E | What is Superman's secret identity name? | Clark Kent
STO-024 | E | What is Batman's secret identity name? | Bruce Wayne
STO-025 | E | What is Spider-Man's secret identity name? | Peter Parker
STO-026 | M | Name 5 of Santa's reindeer. | Dasher, Dancer, Prancer, Vixen, Comet, Cupid, Donner, Blitzen, Rudolph (any 5)
STO-027 | M | How many reindeer pull Santa's sleigh in the classic poem, not counting Rudolph? | 8
STO-028 | E | What does the Tooth Fairy leave under your pillow? | Money
STO-029 | E | Who hides eggs on Easter morning? | The Easter Bunny
STO-030 | M | What is the name of the wizard in "The Lord of the Rings"? | Gandalf
STO-031 | M | What did Dorothy use to get home in "The Wizard of Oz"? | Ruby slippers (clicking her heels)
STO-032 | M | Who are the three friends Dorothy meets on the Yellow Brick Road? | Scarecrow, Tin Man, Cowardly Lion
STO-033 | E | What does the Tin Man want from the Wizard? | A heart
STO-034 | E | What does the Scarecrow want from the Wizard? | A brain
STO-035 | E | What is the name of the green ogre in a famous animated movie series? | Shrek
STO-036 | E | What is the name of the lion cub who becomes king in "The Lion King"? | Simba
STO-037 | M | Who is the villain in "The Lion King"? | Scar
STO-038 | E | What is the name of the cowboy toy in "Toy Story"? | Woody
STO-039 | E | What food does Winnie the Pooh love most? | Honey
STO-040 | M | What does Alice follow down the hole in "Alice in Wonderland"? | The White Rabbit
STO-041 | E | What is the name of the Little Mermaid in the Disney movie? | Ariel
STO-042 | E | What is the name of the heroine in "Beauty and the Beast"? | Belle
STO-043 | M | What does Aladdin find the genie in? | A magic lamp
STO-044 | E | How many wishes does a genie typically grant? | 3
STO-045 | H | What is the name of the Grinch's dog? | Max
STO-046 | E | What is the name of the snowman in "Frozen"? | Olaf
STO-047 | E | What are Santa's workshop helpers called? | Elves
STO-048 | M | Name the four members of The Beatles. | John Lennon, Paul McCartney, George Harrison, Ringo Starr
STO-049 | M | Who wrote "The Adventures of Tom Sawyer"? | Mark Twain
STO-050 | H | Who wrote "Little Women"? | Louisa May Alcott

## ANI — Animals (50)
ANI-001 | E | Is a penguin a bird? | Yes
ANI-002 | E | Can penguins fly? | No
ANI-003 | E | Is a whale a fish or a mammal? | A mammal
ANI-004 | M | Is a bat a bird or a mammal? | A mammal
ANI-005 | M | Is a spider an insect? | No, it is an arachnid
ANI-006 | E | How many legs does an insect have? | 6
ANI-007 | E | How many legs does a spider have? | 8
ANI-008 | E | How many arms does an octopus have? | 8
ANI-009 | E | What do you call a baby dog? | Puppy
ANI-010 | E | What do you call a baby cat? | Kitten
ANI-011 | M | What do you call a baby cow? | Calf
ANI-012 | E | What do you call a baby sheep? | Lamb
ANI-013 | M | What do you call a baby goat? | Kid
ANI-014 | M | What do you call a baby horse? | Foal
ANI-015 | M | What do you call a baby kangaroo? | Joey
ANI-016 | H | What do you call a baby swan? | Cygnet
ANI-017 | E | What do you call a baby duck? | Duckling
ANI-018 | M | What do you call a baby pig? | Piglet
ANI-019 | E | What do you call a baby chicken? | Chick
ANI-020 | M | What do you call a group of lions? | A pride
ANI-021 | M | What do you call a group of fish swimming together? | A school
ANI-022 | H | What do you call a group of crows? | A murder
ANI-023 | M | What do you call a group of wolves? | A pack
ANI-024 | M | What do you call a group of cows? | A herd
ANI-025 | H | What do you call a group of geese on the ground? | A gaggle
ANI-026 | E | What sound does a cow make? | Moo
ANI-027 | E | What do you call a male chicken? | Rooster
ANI-028 | E | What do you call a female chicken? | Hen
ANI-029 | M | What do you call a male deer? | Buck (or stag)
ANI-030 | M | What do you call a female horse? | Mare
ANI-031 | M | What do you call a male horse? | Stallion
ANI-032 | E | What is the fastest land animal? | Cheetah
ANI-033 | E | What is the largest animal on Earth? | Blue whale
ANI-034 | E | What is the tallest animal in the world? | Giraffe
ANI-035 | E | What is the largest land animal? | African elephant
ANI-036 | E | What do giant pandas mostly eat? | Bamboo
ANI-037 | M | What do koalas eat? | Eucalyptus leaves
ANI-038 | E | On which continent do kangaroos live in the wild? | Australia
ANI-039 | M | Do wild penguins live at the North Pole? | No (they live in the Southern Hemisphere)
ANI-040 | H | Do camel humps store water or fat? | Fat
ANI-041 | E | What do bees make? | Honey
ANI-042 | E | What does a caterpillar turn into? | A butterfly (or moth)
ANI-043 | E | What does a tadpole grow into? | A frog
ANI-044 | M | Are snakes warm-blooded or cold-blooded? | Cold-blooded
ANI-045 | M | Are dolphins fish or mammals? | Mammals
ANI-046 | M | What do you call animals that eat only plants? | Herbivores
ANI-047 | M | What do you call animals that eat only meat? | Carnivores
ANI-048 | M | What do you call animals that eat both plants and meat? | Omnivores
ANI-049 | E | What animal is often called "man's best friend"? | The dog
ANI-050 | E | Name 5 animals that live in the ocean. | Any 5 valid (e.g., shark, whale, dolphin, octopus, jellyfish, crab)

## OUT — Boats, Roads & Sports (50)
OUT-001 | M | Is starboard on the left or right side of a boat? | Right (facing forward)
OUT-002 | M | What is the left side of a boat called? | Port
OUT-003 | M | What is the front of a boat or ship called? | The bow
OUT-004 | M | What is the back of a boat or ship called? | The stern
OUT-005 | H | When you say "port" and "starboard," which direction are you facing? | Toward the bow (forward)
OUT-006 | H | What color is the navigation light on the port side of a boat? | Red (starboard is green)
OUT-007 | M | What is the kitchen on a ship called? | The galley
OUT-008 | M | What do you call the floor of a ship? | The deck
OUT-009 | M | What do you call a ship's steering wheel or steering position? | The helm
OUT-010 | H | What unit is used to measure a ship's speed? | Knots
OUT-011 | E | What does "SOS" signal? | Distress / a call for help
OUT-012 | E | What does a lighthouse do? | Warns ships of danger and guides them
OUT-013 | M | What does "Mayday" mean on a radio call? | Life-threatening emergency
OUT-014 | H | What color is a plane's "black box" flight recorder? | Bright orange
OUT-015 | E | What do you need to show to board a plane? | A boarding pass (and ID)
OUT-016 | E | What document do you need to travel to another country? | A passport
OUT-017 | M | What do you call the official permission stamp to enter some countries? | A visa
OUT-018 | M | What do double solid yellow lines in the middle of the road mean? | Do not pass
OUT-019 | E | What should you do when you see flashing red lights at a railroad crossing? | Stop and wait for the train to pass
OUT-020 | M | What should you do when an emergency vehicle with a siren approaches behind you? | Pull over to the right and stop
OUT-021 | M | In the US, which lane is usually the passing lane on a highway? | The left lane
OUT-022 | E | What color is a typical US school bus? | Yellow
OUT-023 | M | What must you do when a school bus has flashing red lights and its stop sign out? | Stop (in most cases both directions)
OUT-024 | M | Name 3 things to check on your car before a long road trip. | Tire pressure, oil, fuel, lights, brakes, coolant (any 3)
OUT-025 | E | What does the "check engine" light on your dashboard mean? | The car has detected a possible problem
OUT-026 | E | What does "MPG" stand for? | Miles per gallon
OUT-027 | M | What does "RPM" stand for? | Revolutions per minute
OUT-028 | H | What is the typical octane number of regular gas in the US? | 87
OUT-029 | M | What kind of fuel does a diesel truck use? | Diesel fuel
OUT-030 | M | What do the letters P, R, N, D on a car's gear selector stand for? | Park, Reverse, Neutral, Drive
OUT-031 | E | How many wheels does a tricycle have? | 3
OUT-032 | E | How many players per team are on the field in soccer? | 11
OUT-033 | E | How many players per team are on the court in basketball? | 5
OUT-034 | E | How many players are on the field for the defending team in baseball? | 9
OUT-035 | E | How many strikes make an out in baseball? | 3
OUT-036 | E | How many balls equal a walk in baseball? | 4
OUT-037 | M | How many outs are in each half-inning of baseball? | 3
OUT-038 | M | How many innings are in a regulation baseball game? | 9
OUT-039 | E | How many points is a touchdown worth in football (before the extra point)? | 6
OUT-040 | M | How many points is a field goal worth in football? | 3
OUT-041 | E | How many points is a free throw worth in basketball? | 1
OUT-042 | E | How many holes are in a full round of golf? | 18
OUT-043 | M | What is a score of one under par called in golf? | A birdie
OUT-044 | H | What is a score of two under par called in golf? | An eagle
OUT-045 | E | Which sport's championship game is called the Super Bowl? | American football
OUT-046 | E | How often are the Summer Olympic Games held? | Every 4 years
OUT-047 | M | Name the colors of the five Olympic rings. | Blue, yellow, black, green, red
OUT-048 | E | What should you do with a campfire before you leave? | Fully put it out with water, stir, and make sure it's cold
OUT-049 | M | What does the outdoor ethic "Leave No Trace" mean? | Pack out what you pack in and leave nature as you found it
OUT-050 | M | Which star helps you find north? | Polaris (the North Star)

---
*End of document. Total prompts: 10 categories × 50 = 500.*
