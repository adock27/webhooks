import type { GameRange } from "../shared/protocol.js";

/** % de cercanía vs. la mayor distancia posible al secreto dentro de [min, max]. */
export function proximityPercent(
  guess: number,
  secret: number,
  range: GameRange
): number {
  const d = Math.abs(guess - secret);
  const maxDist = Math.max(secret - range.min, range.max - secret);
  if (maxDist <= 0) return d === 0 ? 100 : 0;
  const raw = 100 * (1 - d / maxDist);
  const clamped = Math.max(0, Math.min(100, raw));
  return parseFloat(clamped.toFixed(2));
}
