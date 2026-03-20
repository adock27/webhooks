import type { GameRange } from "../shared/protocol.js";
import {
  MAX_RANGE_SPAN,
  MIN_RANGE_SPAN,
  RANGE_CEILING,
} from "./constants.js";

export function randomInt(a: number, b: number): number {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

export function pickRandomRange(): GameRange {
  const span = randomInt(MIN_RANGE_SPAN, MAX_RANGE_SPAN);
  const min = randomInt(1, RANGE_CEILING - span);
  const max = min + span;
  return { min, max };
}
