import { Particle } from '../types';

/**
 * Quartic ease-out function: 1 - (1 - t)^4
 * Delivers extremely gentle arrival with zero jarring dead-stop.
 */
export function quarticEaseOut(t: number): number {
  const p = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - p, 4);
}

/**
 * Evaluates a 2D cubic Bezier curve at parameter t (0 to 1).
 * B(t) = (1-t)^3 * P0 + 3*(1-t)^2*t * P1 + 3*(1-t)*t^2 * P2 + t^3 * P3
 */
export function evaluateBezier(
  p: Particle,
  progress: number
): { x: number; y: number } {
  // Staggered per-particle progress with wave delay
  const pProg =
    progress <= p.delay ? 0 : (progress - p.delay) / (1 - p.delay);
  const pe = pProg >= 1 ? 1 : quarticEaseOut(pProg);

  const u = 1 - pe;
  const u2 = u * u;
  const u3 = u2 * u;
  const pe2 = pe * pe;
  const pe3 = pe2 * pe;

  const originX = p.midX ?? p.startX;
  const originY = p.midY ?? p.startY;

  const x =
    u3 * originX +
    3 * u2 * pe * p.cp1X +
    3 * u * pe2 * p.cp2X +
    pe3 * p.targetX;

  const y =
    u3 * originY +
    3 * u2 * pe * p.cp1Y +
    3 * u * pe2 * p.cp2Y +
    pe3 * p.targetY;

  return { x, y };
}
