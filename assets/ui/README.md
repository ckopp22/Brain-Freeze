# Brain Freeze: Snowy UI Kit

Every visual asset for the game, all vector SVG, all in the same icy game-show palette.
Drop this folder into the repo as `assets/ui/` (or merge into `assets/`) and link `tokens.css`.

| Folder | What's inside |
|---|---|
| `buttons/` | 5 pill buzzer buttons (gold = PLAY, ice = secondary, green = NAILED IT, red = FROZE, magenta = tertiary), each with a `-pressed` state. 5 round icon buttons (+ pressed). `seg-on/off` for the difficulty and timer pickers. |
| `backgrounds/` | `bg-studio-portrait` (phone), `bg-studio-wide` (desktop), seamless `tile-snow` and `tile-checker`, `overlay-spotlight`, and `overlay-frost-edge` for the BRAIN FREEZE timeout moment. |
| `frames/` | Marquee title frame in two bulb sets (swap A/B to chase the lights), game show `card-front` / `card-back`, `panel-ice`, player `chip` + `chip-active`, `ribbon-turn`, `stamp-brain-freeze`, `logo-brain-freeze`, `timer-ring-track` + `timer-ring-progress`, thermometer `progress-track` + `progress-fill`, `divider-icicles`. |
| `icons/` | 17 white-with-navy-outline icons (snowflake, sound-on/off, pause, play, home, replay, help, thaw, trophy, check, cross, clock, spark, player, plus, minus) + `bulb-lit/dim`. |
| `avatars/` | 8 player avatars at 96x96: penguin, polar bear, snowflake, igloo, yeti, ice cube, snowman, narwhal. |
| `host/` | Chilly Chuck: standalone, 64x64, and 4-pose sprite sheets (idle, cheer, brain freeze, wink). |
| `tokens.css` | Palette variables plus ready-made classes (`.sui-btn--gold`, `.sui-round--ice`, `.sui-panel`, `.sui-studio`, `.sui-snow`...). |
| `preview.html` | Open in a browser to see everything on one page. |
| `tools/build_ui.py` | Regenerates the whole kit. Change a color or shape, re-run, everything stays consistent. |

## Palette
Navy `#0B1633` / `#12306B` - Ice `#7FD8FF` - Frost `#F2FBFF` - Pink `#FF3D9A` - Gold `#FFC531` - Green `#36E6A0` - Red `#FF5C5C`

## Usage notes
- **Buttons carry no text.** Put the label in HTML on top (see `.sui-btn`) so it stays crisp, translatable and accessible. Real `<button>` elements only.
- **Pressed state:** swap to the `-pressed` file on `:active`; the face drops 6px, as the classes already do.
- **9-slice:** `panel-ice.svg` stretches cleanly with `background-size: 100% 100%` for moderate sizes. For very wide or tall panels use `border-image` with slice ~28.
- **Marquee chase:** alternate `frame-marquee-a.svg` and `frame-marquee-b.svg` every ~400ms (CSS `animation` on two stacked images, or a JS timer). Freeze on A when `prefers-reduced-motion`.
- **Timer ring:** stack `timer-ring-progress.svg` on `timer-ring-track.svg`. The progress circle uses `pathLength=100`, so inline the SVG and animate `stroke-dashoffset` 0 to 100 (recolor ice > gold > red).
- **Progress thermometer:** show `progress-fill.svg` clipped to the player's percent width over `progress-track.svg`.
- **Brain Freeze moment:** fade `overlay-frost-edge.svg` in over the screen, then slam `stamp-brain-freeze.svg`.
- **Fonts:** `logo-brain-freeze.svg` and `stamp-brain-freeze.svg` contain text and are meant to be used with an `<img>` tag, so they fall back to Impact / Arial Black. For the exact Bungee look, inline the SVG on a page that loads the font, or swap them for HTML text.
- **Offline PWA:** add every file you actually use to the service worker precache list.
- Everything is original artwork (no licensed characters or brands).
