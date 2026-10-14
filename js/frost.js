const PARTICLE_COUNT = 40;

export function startFrost() {
  const canvas = document.getElementById("frost-canvas");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  let particles = [];
  let running = false;
  let rafHandle = null;

  function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }

  function makeParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1.5 + Math.random() * 2.5,
      speed: 0.4 + Math.random() * 0.8,
      drift: (Math.random() - 0.5) * 0.4,
    };
  }

  function seed() {
    particles = Array.from({ length: PARTICLE_COUNT }, makeParticle);
  }

  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(242, 251, 255, 0.6)";
    for (const p of particles) {
      p.y += p.speed;
      p.x += p.drift;
      if (p.y > canvas.height) {
        p.y = -p.r;
        p.x = Math.random() * canvas.width;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    rafHandle = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    rafHandle = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (rafHandle) cancelAnimationFrame(rafHandle);
    rafHandle = null;
  }

  resize();
  seed();
  start();

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
}
