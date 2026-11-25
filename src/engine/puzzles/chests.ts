import { rule, CHARACTERS } from '../characters';
import type { Outcome, PuzzleType, Round, TimelineEvent } from '../types';

export interface ChestsParams { chests: number[]; order: string[] }

const cid = (v: number) => `c${v}`;

function simulate(round: Round<ChestsParams>, yourIdx: number) {
  const { chests, order } = round.params;
  const picks: Record<string, number> = { you: yourIdx };
  for (const actor of order) {
    if (actor === 'you') continue;
    const ref = round.characters.find((c) => c.id === actor)!;
    picks[actor] = rule(actor, ref.ruleKey)(ref.ruleArgs, { chests, picks: { ...picks } });
  }
  const occ = chests.map(() => 0);
  for (const i of Object.values(picks)) occ[i]++;
  return { picks, occ };
}

export const chests: PuzzleType<ChestsParams> = {
  id: 'chests',
  family: 'crowding',
  title: 'Chests',
  betterIs: 'higher',
  setup: (r) => {
    const names = r.params.order.filter((a) => a !== 'you').map((a) => CHARACTERS[a].name);
    return `Four chests hold ${r.params.chests.join(', ')} coins. Everyone on a chest shares it equally. You pick first, then ${names.slice(0, -1).join(', ')} and ${names.at(-1)}.`;
  },
  options: (r) => r.params.chests.map((v) => ({ id: cid(v), label: `${v}`, detail: 'coin chest' })),
  resolve(r, optionId) {
    const { chests: values, order } = r.params;
    const idx = values.findIndex((v) => cid(v) === optionId);
    const { picks, occ } = simulate(r, idx);
    const events: TimelineEvent[] = [];
    for (const actor of order) events.push({ t: 'move', actor, to: cid(values[picks[actor]]) });
    values.forEach((v, i) => { if (occ[i] > 0) events.push({ t: 'open', target: cid(v) }); });
    const share = (a: string) => values[picks[a]] / occ[picks[a]];
    for (const actor of order) events.push({ t: 'payout', actor, amount: share(actor) });
    const mine = share('you');
    const top = Math.max(...order.map(share));
    for (const actor of order) {
      const s = share(actor);
      events.push({ t: 'emote', actor, emote: s === top ? (actor === 'you' ? 'cheer' : 'smug') : s < values[picks[actor]] / 2 ? 'sulk' : 'cheer' });
    }
    const crowd = order.filter((a) => a !== 'you' && picks[a] === idx).map((a) => CHARACTERS[a].name);
    const summary = crowd.length
      ? `You took the ${values[idx]} chest and shared it with ${crowd.join(', ')}: ${fmt(mine)} coins each.`
      : `You had the ${values[idx]} chest to yourself: ${fmt(mine)} coins.`;
    return { value: mine, valueLabel: `${fmt(mine)} coins`, events, summary } satisfies Outcome;
  },
  obviousOptionId: (r) => cid(Math.max(...r.params.chests)),
  explain: (r, bestId) => {
    const sorted = [...r.params.chests].sort((a, b) => b - a);
    if (bestId === cid(sorted[1]))
      return `The big chest is a trap: three characters pile onto it, and Loner always heads elsewhere, so the ${sorted[1]} chest is yours alone.`;
    return `Picture where each character lands before you choose; the best chest is the one nobody else wants.`;
  },
};

const fmt = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(1));
