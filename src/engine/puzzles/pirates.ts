import { rule, CHARACTERS } from '../characters';
import type { PuzzleType, Round, TimelineEvent } from '../types';

export interface PiratesParams { gold: number; crew: string[]; votesNeeded: number }
type Splits = Record<string, number[]>;

/** Votes for a split [you, ...crew]. The captain always votes yes. */
export function votes(round: Round<PiratesParams>, shares: number[]): boolean[] {
  return [true, ...round.params.crew.map((id, i) => {
    const ref = round.characters.find((c) => c.id === id)!;
    return !!rule(id, ref.ruleKey)(ref.ruleArgs, { shares, mine: shares[i + 1] });
  })];
}

export function captainValue(round: Round<PiratesParams>, shares: number[]): number {
  const yes = votes(round, shares).filter(Boolean).length;
  return yes >= round.params.votesNeeded ? shares[0] : 0;
}

/** Best captain value over every integer split of the gold. */
export function bestPossible(round: Round<PiratesParams>): { value: number; split: number[] } {
  const n = round.params.crew.length + 1;
  const g = round.params.gold;
  let best = { value: -1, split: [] as number[] };
  const cur: number[] = [];
  const rec = (i: number, left: number) => {
    if (i === n - 1) {
      cur[i] = left;
      const v = captainValue(round, cur);
      if (v > best.value) best = { value: v, split: [...cur] };
      return;
    }
    for (let x = 0; x <= left; x++) { cur[i] = x; rec(i + 1, left - x); }
  };
  rec(0, g);
  return best;
}

const listJoin = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);

export const pirates: PuzzleType<PiratesParams> = {
  id: 'pirates',
  family: 'splitting',
  title: 'Pirates',
  betterIs: 'higher',
  goal: () => 'Keep the most gold without walking the plank.',
  setup: (r) =>
    `You’re captain, splitting ${r.params.gold} gold with ${listJoin(r.params.crew.map((c) => CHARACTERS[c].name))}. Shares go in order: you, ${r.params.crew.map((c) => CHARACTERS[c].name).join(', ')}. Get ${r.params.votesNeeded} of ${r.params.crew.length + 1} votes (yours counts) or walk the plank.`,
  options: (r) =>
    Object.entries(r.options as Splits).map(([id, s]) => ({ id, label: id, detail: s.join(' / ') })),
  resolve(r, optionId) {
    const shares = (r.options as Splits)[optionId];
    const v = votes(r, shares);
    const yes = v.filter(Boolean).length;
    const passed = yes >= r.params.votesNeeded;
    const actors = ['you', ...r.params.crew];
    const events: TimelineEvent[] = [{ t: 'split', shares }];
    actors.forEach((a, i) => events.push({ t: 'vote', actor: a, choice: v[i] ? 'yes' : 'no' }));
    events.push({ t: 'tally', yes, needed: r.params.votesNeeded, passed });
    if (passed) {
      actors.forEach((a, i) => events.push({ t: 'payout', actor: a, amount: shares[i] }));
      actors.forEach((a, i) => events.push({ t: 'emote', actor: a, emote: v[i] ? (a === 'you' ? 'cheer' : 'smug') : 'sulk' }));
    } else {
      events.push({ t: 'plank', actor: 'you' });
      r.params.crew.forEach((a) => events.push({ t: 'emote', actor: a, emote: 'shock' }));
    }
    const value = passed ? shares[0] : 0;
    const yesNames = actors.filter((_, i) => v[i]).map((a) => (a === 'you' ? 'you' : CHARACTERS[a].name));
    const summary = passed
      ? `${listJoin(yesNames).replace(/^you/, 'You')} voted yes (${yes} of ${actors.length}). The split passed and you kept ${value} gold.`
      : `Only ${yesNames.join(' and ')} voted yes (${yes} of ${actors.length}). The split failed and you walked the plank.`;
    return { value, valueLabel: `${value} gold`, events, summary };
  },
  obviousOptionId: (r) => {
    const s = r.options as Splits;
    return Object.keys(s).reduce((a, b) => (s[b][0] > s[a][0] ? b : a));
  },
  explain: () =>
    'Buy off Fair, not Greedy: Fair accepts you keeping exactly double its share, and Lazy votes yes for a single coin.',
};
