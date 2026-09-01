import confetti from "canvas-confetti";

const BRAND_COLORS = ["#d1f941", "#ff7110", "#1c8055"];

/** Vercel-style two-cannon burst from the bottom corners, converging toward center. */
export function fireSuccessConfetti(): void {
  const end = Date.now() + 800;

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 1 },
      colors: BRAND_COLORS,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 1 },
      colors: BRAND_COLORS,
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  confetti({
    particleCount: 80,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.6 },
    colors: BRAND_COLORS,
  });
}
