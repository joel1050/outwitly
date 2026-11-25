import { rule, CHARACTERS } from '../characters';
import { Q } from '../rational';
import { seeded, hashString } from '../rng';
import type { PuzzleType, Round, TimelineEvent } from '../types';

export interface DuelParams {
  order: string[];
  accuracy: Record<string, string>;
  aiRule: string;
  floor: number;
}

const AIR = 'air';

/** Whom `self` aims at once the first throw is done. Everyone, you included, aims at the most accurate opponent. */
function target(r: Round<DuelParams>, self: string, alive: string[]): string {
  const acc = Object.fromEntries(Object.entries(r.params.accuracy).map(([k, v]) => [k, Q.parse(v).toNumber()]));
  const ruleOwner = self === 'you' ? 'cautious' : self;
  return rule(ruleOwner, r.params.aiRule)(undefined, { self, alive, accuracy: acc });
}

function nextAfter(order: string[], alive: string[], who: string): string {
  const i = order.indexOf(who);
  for (let k = 1; k <= order.length; k++) {
    const c = order[(i + k) % order.length];
    if (alive.includes(c)) return c;
  }
  return who;
}

/** Exact chance that you are the last one dry, from `alive` with `shooter` to throw, all using the standard rule. */
export function winChance(r: Round<DuelParams>, alive: string[], shooter: string, memo = new Map<string, Q>()): Q {
  if (!alive.includes('you')) return Q.ZERO;
  if (alive.length === 1) return Q.ONE;
  const key = `${alive.join(',')}|${shooter}`;
  const hit = memo.get(key);
  if (hit) return hit;

  const order = r.params.order.filter((a) => alive.includes(a));
  const start = order.indexOf(shooter);
  const cycle = order.map((_, k) => order[(start + k) % order.length]);
  // V_k = a_k + m_k * V_{k+1}, wrapping round. Solve for V_0.
  const a: Q[] = [];
  const m: Q[] = [];
  for (const s of cycle) {
    const p = Q.parse(r.params.accuracy[s]);
    const t = target(r, s, alive);
    const rest = alive.filter((x) => x !== t);
    a.push(p.mul(winChance(r, rest, nextAfter(r.params.order, rest, s), memo)));
    m.push(Q.ONE.sub(p));
  }
  let num = Q.ZERO;
  let prod = Q.ONE;
  for (let k = 0; k < cycle.length; k++) {
    num = num.add(prod.mul(a[k]));
    prod = prod.mul(m[k]);
  }
  const v = num.div(Q.ONE.sub(prod));
  memo.set(key, v);
  return v;
}

export function optionChance(r: Round<DuelParams>, first: string): Q {
  const all = r.params.order;
  const after = nextAfter(all, all, 'you');
  const missValue = winChance(r, all, after);
  if (first === AIR) return missValue;
  const p = Q.parse(r.params.accuracy.you);
  const rest = all.filter((x) => x !== first);
  return p.mul(winChance(r, rest, nextAfter(all, rest, 'you'))).add(Q.ONE.sub(p).mul(missValue));
}

function playOnce(r: Round<DuelParams>, first: string, seed: number): { events: TimelineEvent[]; winner: string } {
  const rng = seeded(seed);
  const events: TimelineEvent[] = [];
  let alive = [...r.params.order];
  let shooter = 'you';
  let firstThrow = true;
  for (let n = 0; n < 40 && alive.length > 1; n++) {
    const t = firstThrow ? first : target(r, shooter, alive);
    firstThrow = false;
    if (t === AIR) {
      events.push({ t: 'throw', actor: shooter, target: AIR, hit: false });
    } else {
      const hit = rng() < Q.parse(r.params.accuracy[shooter]).toNumber();
      events.push({ t: 'throw', actor: shooter, target: t, hit });
      if (hit) {
        alive = alive.filter((x) => x !== t);
        events.push({ t: 'emote', actor: t, emote: 'sulk' });
      }
    }
    shooter = nextAfter(r.params.order, alive, shooter);
  }
  events.push({ t: 'emote', actor: alive[0], emote: alive[0] === 'you' ? 'cheer' : 'smug' });
  return { events, winner: alive[0] };
}

const pct = (q: Q) => `${(q.toNumber() * 100).toFixed(1)}%`;

export const duel: PuzzleType<DuelParams> = {
  id: 'duel',
  family: 'conflict',
  title: 'Duel',
  betterIs: 'higher',
  floor: (r) => r.params.floor,
  setup: () =>
    'A water-balloon duel; the last one dry wins. Throw order: you, Cautious, Show-off, repeat. Where does your first balloon go? After that, you aim at whoever is left.',
  options: () => [
    { id: 'showoff', label: 'Show-off', detail: 'never misses' },
    { id: 'cautious', label: 'Cautious', detail: 'hits 2 in 3' },
    { id: AIR, label: 'The air', detail: 'miss on purpose' },
  ],
  resolve(r, optionId) {
    const q = optionChance(r, optionId);
    const { events, winner } = playOnce(r, optionId, hashString(`duel:${optionId}`));
    const firstText = optionId === AIR ? 'You threw into the air.' : `You threw first at ${CHARACTERS[optionId].name}.`;
    const runText = winner === 'you' ? 'In this run you were the last one dry.' : `In this run ${CHARACTERS[winner].name} was the last one dry.`;
    return {
      value: q.toNumber(),
      exact: q.toString(),
      valueLabel: `${pct(q)} to win`,
      events,
      summary: `${firstText} ${runText} Over every run, you stay dry ${q.toString()} of the time (${pct(q)}).`,
    };
  },
  obviousOptionId: () => 'showoff',
  explain: () =>
    'Miss on purpose. Soak either rival and the survivor aims straight at you; throw into the air and they soak each other, then you get first throw at whoever is left.',
};
