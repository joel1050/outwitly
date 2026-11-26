import { listJoin } from '../../engine/text';
import { rule, CHARACTERS } from '../../engine/characters';
import type { PuzzleType, Round, TimelineEvent } from '../../engine/types';

export interface AgendaParams { proposals: string[]; yourValues: Record<string, number> }

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Pairs in the fixture's order: garden_fountain, garden_skatepark, fountain_skatepark. */
function pairs(r: Round<AgendaParams>): [string, string][] {
  const byValue = [...r.params.proposals].sort((a, b) => r.params.yourValues[b] - r.params.yourValues[a]);
  const [top, mid, low] = byValue;
  return [[top, mid], [top, low], [mid, low]];
}

function head2head(r: Round<AgendaParams>, a: string, b: string, events: TimelineEvent[]) {
  events.push({ t: 'matchup', a, b });
  let va = 0;
  for (const c of r.characters) {
    const ranking: string[] = rule(c.id, c.ruleKey)(c.ruleArgs, {});
    const pick = ranking.indexOf(a) < ranking.indexOf(b) ? a : b;
    if (pick === a) va++;
    events.push({ t: 'ballot', actor: c.id, choice: pick });
  }
  return va * 2 > r.characters.length ? a : b;
}

export const agenda: PuzzleType<AgendaParams> = {
  id: 'agenda',
  family: 'voting',
  title: 'Agenda',
  betterIs: 'higher',
  goal: (r) => {
    // Built from your values, so the goal always matches the scoring.
    const [first, second] = Object.entries(r.params.yourValues as Record<string, number>)
      .sort((a, b) => b[1] - a[1]).map(([k]) => title(k));
    return `Get the ${first} built. Second best: the ${second}.`;
  },
  setup: (r) => {
    const voters = r.characters.map((c) => CHARACTERS[c.id].name);
    return `One of three proposals gets built: ${listJoin(r.params.proposals.map(title), 'or')}. ${listJoin(voters)} vote; you don’t. Pick the first pair. Its winner faces the third; majority wins each vote. Each voter backs whichever option it ranks higher.`;
  },
  options: (r) => pairs(r).map(([a, b]) => ({
    id: `${a}_${b}_first`, label: `${title(a)} vs ${title(b)}`,
  })),
  resolve(r, optionId) {
    const [a, b] = optionId.replace('_first', '').split('_');
    const third = r.params.proposals.find((p) => p !== a && p !== b)!;
    const events: TimelineEvent[] = [];
    const w1 = head2head(r, a, b, events);
    events.push({ t: 'winner', winner: w1, loser: w1 === a ? b : a, final: false });
    const w2 = head2head(r, w1, third, events);
    events.push({ t: 'winner', winner: w2, loser: w2 === w1 ? third : w1, final: true });
    const value = r.params.yourValues[w2];
    events.push({ t: 'emote', actor: 'you', emote: value >= 100 ? 'cheer' : value > 0 ? 'think' : 'sulk' });
    const summary = `${title(w1)} won the first vote against ${title(w1 === a ? b : a)}, then ${w2 === w1 ? 'beat' : 'lost to'} ${title(third)}. ${title(w2)} gets built.`;
    return { value, valueLabel: `${title(w2)} built`, events, summary };
  },
  obviousOptionId: (r) => `${pairs(r)[0][0]}_${pairs(r)[0][1]}_first`,
  explain: () =>
    'Each proposal beats one rival and loses to the other, so the order decides. Keep the Garden out of the first vote and set it against the only rival it beats.',
};

export default agenda;
