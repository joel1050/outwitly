/**
 * Demo crowd data. The real game gets these from /api/stats after you submit;
 * this demo has no backend, so the numbers below are made up and labelled as such.
 */
/** Made-up share of players picking each option, in percent, by round id. */
export const DEMO_PICKS: Record<string, Record<string, number>> = {
  // Day 0.1
  'chests-pile-on': { c100: 38, c60: 41, c30: 15, c10: 6 },
  'junction-hero-finishes-it': { pull: 34, leave: 41, jam: 25 },
  'pirates-cheapest-votes': { A: 21, B: 30, C: 32, D: 17 },
  'agenda-voting-cycle': { garden_fountain_first: 33, garden_skatepark_first: 25, fountain_skatepark_first: 42 },
  'duel-miss-on-purpose': { showoff: 61, cautious: 26, air: 13 },
  // Day 0.2
  'cookie-cut-chocolate-pair': { cut4: 52, cut3: 31, cut1: 17 },
  'roll-call-town-hall-swing': { Park: 47, Pool: 29, Mall: 24 },
  'mystery-box-knothole-auction': { pass: 14, bid40: 23, bid90: 41, bid105: 22 },
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
