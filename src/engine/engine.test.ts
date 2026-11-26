import { describe, expect, it } from 'vitest';
import { cardText } from './characters';
import { bestPossible } from './puzzles/pirates';
import { optionChance } from './puzzles/duel';
import { PUZZLES } from './registry';
import { SAMPLE_DAY } from './sample-day';
import { gradeRound, roundScore, speedFactor } from './scoring';

// Spec appendix fixtures.
const EXPECTED: Record<number, Record<string, { value: number; quality: number; winner?: string }>> = {
  1: {
    c100: { value: 25, quality: 0.4167 },
    c60: { value: 60, quality: 1.0 },
    c30: { value: 30, quality: 0.5 },
    c10: { value: 10, quality: 0.1667 },
  },
  2: {
    pull: { value: 1, quality: 1.0 },
    leave: { value: 6, quality: 0.0 },
    jam: { value: 3, quality: 0.6 },
  },
  3: {
    A: { value: 0, quality: 0.0 },
    B: { value: 49, quality: 0.7424 },
    C: { value: 66, quality: 1.0 },
    D: { value: 25, quality: 0.3788 },
  },
  4: {
    garden_fountain_first: { value: 0, quality: 0.0, winner: 'Skatepark' },
    garden_skatepark_first: { value: 50, quality: 0.5, winner: 'Fountain' },
    fountain_skatepark_first: { value: 100, quality: 1.0, winner: 'Garden' },
  },
};

describe('sample day fixtures', () => {
  for (const idx of [1, 2, 3, 4]) {
    it(`round ${idx} matches the appendix`, () => {
      const round = SAMPLE_DAY.rounds[idx - 1];
      const { graded } = gradeRound(round);
      expect(graded.map((g) => g.optionId).sort()).toEqual(Object.keys(EXPECTED[idx]).sort());
      for (const g of graded) {
        const e = EXPECTED[idx][g.optionId];
        expect(g.outcome.value).toBe(e.value);
        expect(g.quality).toBeCloseTo(e.quality, 4);
        if (e.winner) expect(g.outcome.valueLabel).toContain(e.winner);
      }
    });
  }

  it('round 5 duel: exact survival chances', () => {
    const r = SAMPLE_DAY.rounds[4];
    expect(optionChance(r, 'air').toString()).toBe('25/63');
    expect(optionChance(r, 'showoff').toString()).toBe('59/189');
    expect(optionChance(r, 'cautious').toString()).toBe('50/189');
    const { graded, bestId } = gradeRound(r);
    expect(bestId).toBe('air');
    const q = Object.fromEntries(graded.map((g) => [g.optionId, g.quality]));
    expect(q.air).toBe(1);
    // Exact: (59/189 - 1/5) / (25/63 - 1/5) = 106/186 and 61/186.
    // The appendix lists 0.5693 / 0.3283, which is a rounding slip; the 57% / 33% in the table agree.
    expect(q.showoff).toBeCloseTo(106 / 186, 10);
    expect(q.cautious).toBeCloseTo(61 / 186, 10);
    expect(q.showoff).toBeCloseTo(0.5693, 2);
    expect(q.cautious).toBeCloseTo(0.3283, 2);
  });

  it('pirates: split C is the best of every possible split', () => {
    const best = bestPossible(SAMPLE_DAY.rounds[2]);
    expect(best.value).toBe(66);
  });

  it('round score: full points inside 45 s, then down to half at 3 min, 0 on timeout', () => {
    const L = 180_000;
    expect(roundScore(1, 0, L)).toBe(100);
    expect(roundScore(1, 45_000, L)).toBe(100);
    expect(roundScore(1, 112_500, L)).toBe(75); // halfway through the slide
    expect(roundScore(1, 179_999, L)).toBe(50);
    expect(roundScore(1, 180_000, L)).toBe(0);
    expect(roundScore(0.5, 10_000, L)).toBe(50);
    expect(roundScore(0, 10_000, L)).toBe(0);
    // Faster is never worse.
    for (let t = 0; t < L; t += 1000) expect(speedFactor(t, L)).toBeGreaterThanOrEqual(speedFactor(t + 1000, L));
  });

  it('card rules are at most 12 words', () => {
    for (const r of SAMPLE_DAY.rounds) {
      for (const c of r.characters) {
        const text = cardText(c.id, c.ruleKey, c.ruleArgs);
        expect(text.split(/\s+/).length, text).toBeLessThanOrEqual(12);
      }
    }
  });

  it('setup text is at most 40 words', () => {
    for (const r of SAMPLE_DAY.rounds) {
      const text = PUZZLES[r.type].setup(r);
      expect(text.split(/\s+/).length, text).toBeLessThanOrEqual(40);
    }
  });

  it('every round states a short goal', () => {
    for (const r of SAMPLE_DAY.rounds) {
      const text = PUZZLES[r.type].goal(r);
      expect(text.split(/\s+/).length, text).toBeLessThanOrEqual(10);
    }
    expect(PUZZLES.agenda.goal(SAMPLE_DAY.rounds[3])).toBe('Get the Garden built. Second best: the Fountain.');
  });

  it('every round has a single best option with a clear gap', () => {
    for (const r of SAMPLE_DAY.rounds) {
      const qs = gradeRound(r).graded.map((g) => g.quality).sort((a, b) => b - a);
      expect(qs[0]).toBe(1);
      expect(qs[0] - qs[1]).toBeGreaterThanOrEqual(0.08);
    }
  });
});
