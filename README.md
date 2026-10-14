# Brain Freeze

A pass-the-device party game show. Things you *should* know... but your brain just froze.

Installable PWA built with plain HTML/CSS/JavaScript (ES modules, no framework, no build step).

## Run locally

```
python3 -m http.server 8000
```

Open `http://localhost:8000/` (ES modules require a server, not `file://`).

## Status

Complete: full game loop, scoring, scoreboard, WebAudio sound effects, and installable PWA (manifest + service worker).

UI art lives in `assets/ui/` (snowy UI kit: buttons, frames, avatars, icons, backgrounds, plus Chilly Chuck host sprites in `assets/ui/host/`).

Live URL: https://ckopp22.github.io/Brain-Freeze/

Each future update is just `git push` (no build step). Bump the cache name in `service-worker.js` on every release so installed copies update.
