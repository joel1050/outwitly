import { CHARACTERS, rule } from '../../engine/characters';
import { listJoin } from '../../engine/text';
import type { CookieTray, PuzzleType } from '../../engine/types';

export interface CookieCutParams { cookiePoints: number[]; explanation?: string }

const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const countWord = (n: number) => numbers[n] ?? String(n);
const cutId = (cut: number) => `cut${cut}`;
const points = (n: number) => `${n} point${n === 1 ? '' : 's'}`;
const cookies = (n: number) => `${n} cookie${n === 1 ? '' : 's'}`;

function describeCookies(values: number[]) {
  const chocolate = values.filter((v) => v > 1);
  const n = chocolate.length;
  const chocolatePoints = chocolate[0];
  if (n >= 2 && n < values.length && values.every((v, i) => v === (i < n ? chocolatePoints : 1))) {
    return `The ${countWord(n)} on the left are chocolate, worth ${points(chocolatePoints)} each. The rest are plain, worth 1.`;
  }
  return `From left to right, they're worth ${listJoin(values.map(String))} points.`;
}

const cookieCut: PuzzleType<CookieCutParams> = {
  id: 'cookie-cut',
  family: 'splitting',
  title: 'Cookie Cut',
  betterIs: 'higher',
  goal: () => 'Keep the cookies worth the most points.',
  setup: ({ params, characters: [rival] }) => {
    const { cookiePoints } = params;
    const n = countWord(cookiePoints.length);
    return `${n[0].toUpperCase() + n.slice(1)} cookies sit in a row. ${describeCookies(cookiePoints)} You cut the row into two trays. ${CHARACTERS[rival.id].name} takes one tray and you get the other.`;
  },
  options: (r) => (r.options.cuts as number[]).map((cut) => ({ id: cutId(cut), label: `Cut after cookie ${cut}` })),
  resolve({ params, characters: [rival], options }, optionId) {
    const after = (options.cuts as number[]).find((cut) => cutId(cut) === optionId);
    const { cookiePoints } = params;
    if (after === undefined || !Number.isInteger(after) || after < 1 || after >= cookiePoints.length) {
      throw new Error(`invalid cut: ${optionId}`);
    }
    const counts = { left: after, right: cookiePoints.length - after };
    const chosen: 'left' | 'right' = rule(rival.id, rival.ruleKey)(rival.ruleArgs, counts);
    const sum = (xs: number[]) => xs.reduce((total, value) => total + value, 0);
    const left: CookieTray = { actor: chosen === 'left' ? rival.id : 'you', count: counts.left, points: sum(cookiePoints.slice(0, after)) };
    const right: CookieTray = { actor: chosen === 'right' ? rival.id : 'you', count: counts.right, points: sum(cookiePoints.slice(after)) };
    const kept = chosen === 'left' ? right : left;
    const taken = chosen === 'left' ? left : right;
    const value = kept.points;
    return {
      value,
      valueLabel: points(value),
      events: [
        { t: 'cookie-cut', after },
        { t: 'cookie-trays', left, right },
        { t: 'emote', actor: rival.id, emote: 'smug' },
        { t: 'emote', actor: 'you', emote: value > taken.points ? 'cheer' : value < taken.points ? 'sulk' : 'think' },
      ],
      summary: `${CHARACTERS[rival.id].name} took the ${chosen} tray with ${cookies(taken.count)}. You kept ${cookies(kept.count)} worth ${points(value)}.`,
    };
  },
  obviousOptionId: (r) => {
    const middle = r.params.cookiePoints.length / 2;
    const cuts: number[] = r.options.cuts;
    return cutId(cuts.reduce((best, cut) => Math.abs(cut - middle) < Math.abs(best - middle) ? cut : best));
  },
  explain: (r, bestId) => r.params.explanation ?? cookieCut.resolve(r, bestId).summary,
};

export default cookieCut;
