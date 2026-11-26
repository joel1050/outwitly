import { rule } from '../../engine/characters';
import { Q } from '../../engine/rational';
import { listJoin } from '../../engine/text';
import type { PuzzleType, Round, TimelineEvent } from '../../engine/types';

export interface MysteryBoxParams {
  wallet: number;
  boxes: { contents: number; chance: string }[];
  obvious: string;
  explanation?: string;
}

const bidId = (bid: number) => bid === 0 ? 'pass' : `bid${bid}`;

function solve(r: Round<MysteryBoxParams>, bid: number) {
  const cases: Extract<TimelineEvent, { t: 'box-case' }>[] = r.params.boxes.map(({ contents, chance }) => {
    const bids: Record<string, number> = { you: bid };
    let winner: string | null = null;
    let price = 0;
    for (const c of r.characters) {
      const rivalBid: number = rule(c.id, c.ruleKey)(c.ruleArgs, { contents });
      bids[c.id] = rivalBid;
      if (rivalBid > price) {
        winner = c.id;
        price = rivalBid;
      }
    }
    if (bid > price) {
      winner = 'you';
      price = bid;
    }
    return { t: 'box-case', contents, chance, bids, winner, price, gain: winner === 'you' ? contents - bid : 0 };
  });
  const average = cases.reduce(
    (total, box) => total.add(Q.parse(box.chance).mul(new Q(box.gain))),
    new Q(r.params.wallet),
  );
  return { cases, average };
}

const mysteryBox: PuzzleType<MysteryBoxParams> = {
  id: 'mystery-box',
  family: 'bidding',
  title: 'Mystery Box',
  betterIs: 'higher',
  goal: ({ params: { wallet } }) => `Start with ${wallet} coins. End with the most, on average.`,
  setup: ({ params: { boxes } }) => {
    const contents = boxes.map(({ contents }) => String(contents));
    const chances = boxes.map(({ chance }) => { const { n, d } = Q.parse(chance); return `${n} in ${d}`; });
    return `A single box holds ${listJoin(contents, 'or')} coins, with chances ${listJoin(chances)}. Rivals peek inside; you can't. Everyone bids once, in secret. The highest bid buys the box; rivals win ties.`;
  },
  options: (r) => (r.options.bids as number[]).map((bid) => ({ id: bidId(bid), label: bid === 0 ? 'Pass' : `Bid ${bid}` })),
  resolve(r, optionId) {
    const bid = (r.options.bids as number[]).find((b) => bidId(b) === optionId);
    if (bid === undefined) throw new Error(`unknown bid: ${optionId}`);
    const { cases, average } = solve(r, bid);
    const value = average.toNumber();
    const exact = average.toString();
    const won = cases.filter((box) => box.winner === 'you').map((box) => String(box.contents));
    const result = bid === 0 ? 'You passed and kept your starting coins'
      : won.length ? `You paid ${bid} when the box held ${listJoin(won, 'or')} coins`
      : 'You lost every bid and kept your starting coins';
    return {
      value,
      exact,
      valueLabel: `${exact} coins on average`,
      events: [...cases, { t: 'box-average', value, exact }],
      summary: `${result}. You ended with ${exact} coins on average.`,
    };
  },
  floor: (r) => Math.min(...(r.options.bids as number[]).map((bid) => solve(r, bid).average.toNumber())),
  obviousOptionId: (r) => r.params.obvious,
  explain: (r, bestId) => r.params.explanation ?? mysteryBox.resolve(r, bestId).summary,
};

export default mysteryBox;
