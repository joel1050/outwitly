/**
 * Demo crowd data. The real game gets these from /api/stats after you submit;
 * this demo has no backend, so the numbers below are made up and labelled as such.
 */
export const DEMO_PICKS: Record<number, Record<string, number>> = {
  1: { c100: 38, c60: 41, c30: 15, c10: 6 },
  2: { pull: 34, leave: 41, jam: 25 },
  3: { A: 21, B: 30, C: 32, D: 17 },
  4: { garden_fountain_first: 33, garden_skatepark_first: 25, fountain_skatepark_first: 42 },
  5: { showoff: 61, cautious: 26, air: 13 },
};

const MEAN = 300;
const SD = 70;

/** Histogram of totals in buckets of 10 (0–490). */
export function demoHistogram(): number[] {
  return Array.from({ length: 50 }, (_, i) => Math.exp(-(((i * 10 + 5 - MEAN) / SD) ** 2) / 2));
}

function erf(x: number) {
  // Abramowitz–Stegun 7.1.26
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return Math.sign(x) * y;
}

/** "Top X%" against the demo distribution. */
export function demoTopPercent(total: number): number {
  const below = 0.5 * (1 + erf((total - MEAN) / (SD * Math.SQRT2)));
  return Math.max(1, Math.min(99, Math.round((1 - below) * 100)));
}
