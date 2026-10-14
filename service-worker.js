const CACHE_NAME = "brain-freeze-v9";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/theme.css",
  "./css/screens.css",
  "./css/animations.css",
  "./js/main.js",
  "./js/router.js",
  "./js/state.js",
  "./js/host.js",
  "./js/audio.js",
  "./js/avatars.js",
  "./js/deck.js",
  "./js/game.js",
  "./js/gameflow.js",
  "./js/ui.js",
  "./js/prompts.js",
  "./js/pwa.js",
  "./js/frost.js",
  "./assets/ui/avatars/avatar-icecube.svg",
  "./assets/ui/avatars/avatar-igloo.svg",
  "./assets/ui/avatars/avatar-narwhal.svg",
  "./assets/ui/avatars/avatar-penguin.svg",
  "./assets/ui/avatars/avatar-polarbear.svg",
  "./assets/ui/avatars/avatar-snowflake.svg",
  "./assets/ui/avatars/avatar-snowman.svg",
  "./assets/ui/avatars/avatar-yeti.svg",
  "./assets/ui/backgrounds/bg-studio-portrait.svg",
  "./assets/ui/backgrounds/bg-studio-wide.svg",
  "./assets/ui/backgrounds/overlay-frost-edge.svg",
  "./assets/ui/backgrounds/overlay-frost-edge-stretch.svg",
  "./assets/ui/backgrounds/overlay-spotlight.svg",
  "./assets/ui/backgrounds/tile-checker.svg",
  "./assets/ui/backgrounds/tile-snow.svg",
  "./assets/ui/buttons/btn-gold-pressed.svg",
  "./assets/ui/buttons/btn-gold.svg",
  "./assets/ui/buttons/btn-green-pressed.svg",
  "./assets/ui/buttons/btn-green.svg",
  "./assets/ui/buttons/btn-ice-pressed.svg",
  "./assets/ui/buttons/btn-ice.svg",
  "./assets/ui/buttons/btn-magenta-pressed.svg",
  "./assets/ui/buttons/btn-magenta.svg",
  "./assets/ui/buttons/btn-red-pressed.svg",
  "./assets/ui/buttons/btn-red.svg",
  "./assets/ui/buttons/btn-round-gold-pressed.svg",
  "./assets/ui/buttons/btn-round-gold.svg",
  "./assets/ui/buttons/btn-round-green-pressed.svg",
  "./assets/ui/buttons/btn-round-green.svg",
  "./assets/ui/buttons/btn-round-ice-pressed.svg",
  "./assets/ui/buttons/btn-round-ice.svg",
  "./assets/ui/buttons/btn-round-magenta-pressed.svg",
  "./assets/ui/buttons/btn-round-magenta.svg",
  "./assets/ui/buttons/btn-round-red-pressed.svg",
  "./assets/ui/buttons/btn-round-red.svg",
  "./assets/ui/buttons/seg-off.svg",
  "./assets/ui/buttons/seg-on.svg",
  "./assets/ui/frames/card-back.svg",
  "./assets/ui/frames/card-front.svg",
  "./assets/ui/frames/chip-player-active.svg",
  "./assets/ui/frames/chip-player.svg",
  "./assets/ui/frames/divider-icicles.svg",
  "./assets/ui/frames/frame-marquee-a.svg",
  "./assets/ui/frames/frame-marquee-b.svg",
  "./assets/ui/frames/logo-brain-freeze.svg",
  "./assets/ui/frames/panel-ice.svg",
  "./assets/ui/frames/progress-fill.svg",
  "./assets/ui/frames/progress-track.svg",
  "./assets/ui/frames/ribbon-turn.svg",
  "./assets/ui/frames/stamp-brain-freeze.svg",
  "./assets/ui/frames/timer-ring-progress.svg",
  "./assets/ui/frames/timer-ring-track.svg",
  "./assets/ui/host/host-cheer.png",
  "./assets/ui/host/host-idle.png",
  "./assets/ui/host/host-laugh.png",
  "./assets/ui/host/host-point.png",
  "./assets/ui/host/host-present.png",
  "./assets/ui/host/host-shock.png",
  "./assets/ui/host/host-talk.png",
  "./assets/ui/host/host-think.png",
  "./assets/ui/icons/bulb-dim.svg",
  "./assets/ui/icons/bulb-lit.svg",
  "./assets/ui/icons/icon-check.svg",
  "./assets/ui/icons/icon-clock.svg",
  "./assets/ui/icons/icon-cross.svg",
  "./assets/ui/icons/icon-help.svg",
  "./assets/ui/icons/icon-home.svg",
  "./assets/ui/icons/icon-minus.svg",
  "./assets/ui/icons/icon-music-off.svg",
  "./assets/ui/icons/icon-music-on.svg",
  "./assets/ui/icons/icon-pause.svg",
  "./assets/ui/icons/icon-play.svg",
  "./assets/ui/icons/icon-player.svg",
  "./assets/ui/icons/icon-plus.svg",
  "./assets/ui/icons/icon-replay.svg",
  "./assets/ui/icons/icon-snowflake.svg",
  "./assets/ui/icons/icon-sound-off.svg",
  "./assets/ui/icons/icon-sound-on.svg",
  "./assets/ui/icons/icon-spark.svg",
  "./assets/ui/icons/icon-thaw.svg",
  "./assets/ui/icons/icon-trophy.svg",
  "./assets/ui/tokens.css",
  "./assets/audio/brain-freeze-music.m4a",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    )
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok && event.request.url.startsWith(self.location.origin)) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
