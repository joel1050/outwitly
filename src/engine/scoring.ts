import { PUZZLES } from '../games/registry';
import type { Outcome, Round } from './types';

export interface Graded {
  optionId: string;
  label: string;
  outcome: Outcome;
  quality: number;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Every option resolved and graded. The best option has quality 1. */
export function gradeRound(round: Round): { graded: Graded[]; bestId: string } {
  const type = PUZZLES[round.type];
  const opts = type.options(round);
  const outs = opts.map((o) => ({ o, outcome: type.resolve(round, o.id) }));
  const vals = outs.map((x) => x.outcome.value);
  const best = type.betterIs === 'higher' ? Math.max(...vals) : Math.min(...vals);
  const worst = type.betterIs === 'higher' ? Math.min(...vals) : Math.max(...vals);
  const floor = type.floor?.(round) ?? 0;
  const graded = outs.map(({ o, outcome }) => {
    const v = outcome.value;
    const q = type.betterIs === 'higher'
      ? (best === floor ? 1 : (v - floor) / (best - floor))
      : (worst === best ? 1 : (worst - v) / (worst - best));
    return { optionId: o.id, label: o.label, outcome, quality: clamp01(q) };
  });
  const bestId = graded.reduce((a, b) => (b.quality > a.quality ? b : a)).optionId;
  return { graded, bestId };
}

/** Answer within this long and speed costs nothing. */
export const GRACE_MS = 45_000;
/** Share of the points still earned by an answer given just before the deadline. */
export const SLOWEST_SPEED = 0.5;

/**
 * Share of the points kept for answering after `elapsedMs`: 1 inside the grace period, then a
 * straight line down to SLOWEST_SPEED at the deadline. 0 once time is up.
 */
export function speedFactor(elapsedMs: number, limitMs: number): number {
  if (elapsedMs >= limitMs) return 0;
  if (elapsedMs <= GRACE_MS) return 1;
  return 1 - (1 - SLOWEST_SPEED) * ((elapsedMs - GRACE_MS) / (limitMs - GRACE_MS));
}

/** Round score, 0–100: how good the move was times how fast it came. */
export function roundScore(quality: number, elapsedMs: number, limitMs: number): number {
  return Math.round(100 * quality * speedFactor(elapsedMs, limitMs));
}

export type Square = '🟩' | '🟨' | '🟧' | '🟥';
export function square(quality: number): Square {
  if (quality >= 0.9) return '🟩';
  if (quality >= 0.6) return '🟨';
  if (quality >= 0.3) return '🟧';
  return '🟥';
}
