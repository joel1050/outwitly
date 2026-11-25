import type { DailySet } from './types';

/** The launch reference day (spec appendix), without the `expected` answers. */
export const SAMPLE_DAY: DailySet = {
  puzzleNumber: 0,
  date: '2026-11-25',
  rounds: [
    {
      index: 1, type: 'chests', difficulty: 'easy', timeLimitMs: 30000,
      params: { chests: [100, 60, 30, 10], order: ['you', 'greedy', 'copycat', 'showoff', 'loner'] },
      characters: [
        { id: 'greedy', ruleKey: 'biggest' },
        { id: 'copycat', ruleKey: 'copy', ruleArgs: { target: 'greedy' } },
        { id: 'showoff', ruleKey: 'mostOccupied', ruleArgs: { tieBreak: 'bigger' } },
        { id: 'loner', ruleKey: 'biggestEmpty' },
      ],
    },
    {
      index: 2, type: 'junction', difficulty: 'easy', timeLimitMs: 30000,
      params: { exits: { straight: 3, left: 6, right: 1 }, routing: { 0: 'straight', 1: 'left', 2: 'right' } },
      characters: [{ id: 'hero', ruleKey: 'pullIfHeadingAbove', ruleArgs: { threshold: 2 } }],
    },
    {
      index: 3, type: 'pirates', difficulty: 'medium', timeLimitMs: 45000,
      params: { gold: 100, crew: ['greedy', 'fair', 'lazy'], votesNeeded: 3 },
      characters: [
        { id: 'greedy', ruleKey: 'yesIfAtLeast', ruleArgs: { min: 50 } },
        { id: 'fair', ruleKey: 'yesIfNoneAboveDouble' },
        { id: 'lazy', ruleKey: 'yesIfAny' },
      ],
      options: { A: [97, 1, 1, 1], B: [49, 50, 0, 1], C: [66, 0, 33, 1], D: [25, 25, 25, 25] },
    },
    {
      index: 4, type: 'agenda', difficulty: 'medium', timeLimitMs: 45000,
      params: {
        proposals: ['fountain', 'skatepark', 'garden'],
        yourValues: { garden: 100, fountain: 50, skatepark: 0 },
      },
      characters: [
        { id: 'greedy', ruleKey: 'ranking', ruleArgs: ['skatepark', 'garden', 'fountain'] },
        { id: 'fair', ruleKey: 'ranking', ruleArgs: ['garden', 'fountain', 'skatepark'] },
        { id: 'cautious', ruleKey: 'ranking', ruleArgs: ['fountain', 'skatepark', 'garden'] },
      ],
    },
    {
      index: 5, type: 'duel', difficulty: 'hard', timeLimitMs: 45000,
      params: {
        order: ['you', 'cautious', 'showoff'],
        accuracy: { you: '1/3', cautious: '2/3', showoff: '1/1' },
        aiRule: 'aimAtMostAccurateRemaining',
        floor: 0.2,
      },
      characters: [
        { id: 'cautious', ruleKey: 'aimAtMostAccurateRemaining', stats: { accuracy: '2/3' } },
        { id: 'showoff', ruleKey: 'aimAtMostAccurateRemaining', stats: { accuracy: '1/1' } },
      ],
    },
  ],
};
