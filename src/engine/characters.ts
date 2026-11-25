/**
 * Characters are defined once. Each rule is code, and the card text for it is
 * generated from the same entry, so the card can never disagree with the rule.
 */

export interface ChestCtx { chests: number[]; picks: Record<string, number> }
export interface VoteCtx { shares: number[]; mine: number }
export interface DuelCtx { self: string; alive: string[]; accuracy: Record<string, number> }

type RuleFn = (args: any, ctx: any) => any;

export interface CharacterDef {
  id: string;
  name: string;
  color: string;
  accent: string;
  personality: string;
  rules: Record<string, RuleFn>;
  cardText: Record<string, (args: any) => string>;
}

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function occupancy(ctx: ChestCtx): number[] {
  const occ = ctx.chests.map(() => 0);
  for (const i of Object.values(ctx.picks)) occ[i]++;
  return occ;
}

function biggest(ctx: ChestCtx, allowed: (i: number) => boolean = () => true): number {
  let best = -1;
  ctx.chests.forEach((v, i) => {
    if (allowed(i) && (best < 0 || v > ctx.chests[best])) best = i;
  });
  return best;
}

const sharedRules = {
  ranking: (args: string[]) => args,
  aimAtMostAccurateRemaining: (_: unknown, ctx: DuelCtx) => {
    const others = ctx.alive.filter((a) => a !== ctx.self);
    return others.reduce((b, a) => (ctx.accuracy[a] > ctx.accuracy[b] ? a : b));
  },
};

const sharedText = {
  ranking: (args: string[]) => `Prefers ${args.slice(0, -1).map(title).join(', then ')}, then ${title(args.at(-1)!)}.`,
  aimAtMostAccurateRemaining: () => 'Aims at the most accurate opponent still dry.',
};

export const CHARACTERS: Record<string, CharacterDef> = {
  you: {
    id: 'you', name: 'You', color: '#F4EBDD', accent: '#2B2A33',
    personality: 'That’s you.',
    rules: {}, cardText: {},
  },
  greedy: {
    id: 'greedy', name: 'Greedy', color: '#E69F00', accent: '#8A5A00',
    personality: 'Always goes for the biggest prize.',
    rules: {
      ...sharedRules,
      biggest: (_: unknown, ctx: ChestCtx) => biggest(ctx),
      yesIfAtLeast: (a: { min: number }, ctx: VoteCtx) => ctx.mine >= a.min,
    },
    cardText: {
      ...sharedText,
      biggest: () => 'Takes the biggest chest.',
      yesIfAtLeast: (a: { min: number }) => `Votes yes only if it gets ${a.min} or more.`,
    },
  },
  copycat: {
    id: 'copycat', name: 'Copycat', color: '#56B4E9', accent: '#1F6E99',
    personality: 'Does whatever someone else did.',
    rules: {
      copy: (a: { target: string }, ctx: ChestCtx) => ctx.picks[a.target],
    },
    cardText: {
      copy: (a: { target: string }) => `Picks the same chest as ${CHARACTERS[a.target]?.name ?? a.target}.`,
    },
  },
  showoff: {
    id: 'showoff', name: 'Show-off', color: '#CC79A7', accent: '#7D3A63',
    personality: 'Joins whatever’s most popular.',
    rules: {
      ...sharedRules,
      mostOccupied: (_: { tieBreak: 'bigger' }, ctx: ChestCtx) => {
        const occ = occupancy(ctx);
        let best = 0;
        for (let i = 1; i < occ.length; i++) {
          if (occ[i] > occ[best] || (occ[i] === occ[best] && ctx.chests[i] > ctx.chests[best])) best = i;
        }
        return best;
      },
    },
    cardText: {
      ...sharedText,
      mostOccupied: () => 'Joins the chest with the most characters.',
    },
  },
  loner: {
    id: 'loner', name: 'Loner', color: '#3D5A80', accent: '#1C2C44',
    personality: 'Avoids everyone.',
    rules: {
      biggestEmpty: (_: unknown, ctx: ChestCtx) => {
        const occ = occupancy(ctx);
        const i = biggest(ctx, (j) => occ[j] === 0);
        return i >= 0 ? i : biggest(ctx);
      },
    },
    cardText: { biggestEmpty: () => 'Takes the biggest chest nobody is on yet.' },
  },
  fair: {
    id: 'fair', name: 'Fair', color: '#009E73', accent: '#005A42',
    personality: 'Rejects anything lopsided.',
    rules: {
      ...sharedRules,
      yesIfNoneAboveDouble: (_: unknown, ctx: VoteCtx) => ctx.shares.every((s) => s <= 2 * ctx.mine),
    },
    cardText: {
      ...sharedText,
      yesIfNoneAboveDouble: () => 'Votes yes only if nobody gets more than double its share.',
    },
  },
  lazy: {
    id: 'lazy', name: 'Lazy', color: '#B9A6E0', accent: '#5E4B8B',
    personality: 'Says yes to anything that gives it something.',
    rules: { yesIfAny: (_: unknown, ctx: VoteCtx) => ctx.mine > 0 },
    cardText: { yesIfAny: () => 'Votes yes if it gets anything at all.' },
  },
  hero: {
    id: 'hero', name: 'Hero', color: '#D55E00', accent: '#7A3500',
    personality: 'Acts when harm passes a threshold.',
    rules: {
      pullIfHeadingAbove: (a: { threshold: number }, ctx: { heading: number }) => ctx.heading > a.threshold,
    },
    cardText: {
      pullIfHeadingAbove: (a: { threshold: number }) =>
        `Pulls if the trolley is heading for more than ${a.threshold} people.`,
    },
  },
  cautious: {
    id: 'cautious', name: 'Cautious', color: '#7FB77E', accent: '#3E6B3D',
    personality: 'Picks the safest option.',
    rules: { ...sharedRules },
    cardText: { ...sharedText },
  },
};

export function cardText(id: string, ruleKey: string, args?: unknown): string {
  const c = CHARACTERS[id];
  const fn = c?.cardText[ruleKey];
  if (!fn) throw new Error(`no card text for ${id}.${ruleKey}`);
  return fn(args);
}

export function rule(id: string, ruleKey: string): RuleFn {
  const fn = CHARACTERS[id]?.rules[ruleKey];
  if (!fn) throw new Error(`no rule ${id}.${ruleKey}`);
  return fn;
}
