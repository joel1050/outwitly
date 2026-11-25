import { PUZZLES } from './registry';
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

export function roundScore(quality: number, msRemaining: number, timeLimitMs: number): number {
  if (msRemaining <= 0) return 0;
  const speed = Math.max(0, Math.min(1, msRemaining / timeLimitMs));
  return Math.round(95 * quality + 5 * speed * (quality > 0 ? 1 : 0));
}

/** Score with no clock: the speed bonus is dropped and quality alone fills 0–100. */
export function untimedScore(quality: number): number {
  return Math.round(100 * quality);
}

export type Square = '🟩' | '🟨' | '🟧' | '🟥';
export function square(quality: number): Square {
  if (quality >= 0.9) return '🟩';
  if (quality >= 0.6) return '🟨';
  if (quality >= 0.3) return '🟧';
  return '🟥';
}
