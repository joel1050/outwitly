# Two Lots

- **id:** `two-lots`
- **Family:** bidding
- **Source:** GPT-6.2 Sol (high) proposal, 2026-11-25. Original: `docs/proposals/gpt-6.2-sol.md`.
- **Status:** see `content/catalog.json`

- **Story**  
  Two toys roll across an auction table, one at a time.
- **Goal**  
  Earn the most coins after bid payments. Higher is better.
- **Setup**  
  Duck worth 11 coins sells before Crown worth 20. Greedy starts with 10 coins. You bid first each time, with 5 fixed for Crown. High bidder wins and pays the other bid. Greedy wins ties.
- **Your choice**  
  Bid 4, 6, or 9 for Duck. Your Crown bid is automatic.
- **Characters and rules**
  - Greedy — Bids all remaining coins, up to 8 on Duck.
- **How it resolves**  
  For each lot, compare your bid with Greedy’s. Award the lot to the higher bidder, or Greedy on a tie, and charge the winner the losing bid. Subtract each Greedy payment from its wallet before the next lot. Add the values of your lots and subtract what you paid. Every offered bid is payable by you.
- **Trap**  
  The highest bid wins Duck and leaves Greedy’s wallet full for Crown.
- **Idea**  
  Set the rival’s price.
- **Can vary**  
  Use Greedy wallets of 8–14, Duck caps of 5–11, Duck values of 7–20, Crown values of 12–24, Crown bids of 3–11, and three distinct Duck bids from 1–15. Keep Duck cheaper than Crown. Generate low bids that leave Greedy able to tie or win Crown, middle bids that make it fall short, and high bids that win Duck. Include variants where Duck’s profit beats Crown’s, tagged “Take the sure profit.” When the standing bid beats Greedy’s full wallet, you can buy both, tagged “Win both at a profit.”
- **Scene**  
  Slide the toys onto the podium. Flip up bid cards and move coins out of the winner’s wallet.
- **Difficulty range**  
  Medium with a small wallet and three bids. Harder when a bid ties a cap or when the standing Crown bid can beat Greedy’s full wallet and buying both may pay.
- **Rating**  
  Fun 5/5 · Round variety 5/5. A losing bid can change the second winner, and both prices matter once the wallet starts shrinking.

## Worked example round · Two Lots

### Round data

```ts
{
  index: 1,
  type: 'twoLots',
  difficulty: 'medium',
  timeLimitMs: 180000,
  params: {
    lots: [
      { id: 'duck', worth: 11 },
      { id: 'crown', worth: 20 },
    ],
    greedyCoins: 10,
    standingCrownBid: 5,
  },
  characters: [
    { id: 'greedy', ruleKey: 'bidRemaining', ruleArgs: { duckCap: 8 } },
  ],
  options: { bid4: 4, bid6: 6, bid9: 9 },
}
```

`twoLots` and `bidRemaining` are the proposed scenario and rule IDs. Use higher-is-better scoring with the engine’s default floor of zero. Mark `bid9` as the obvious option.

### Player-facing text

- **Goal**  
  Earn the most coins after bid payments.
- **Setup**  
  Duck worth 11 coins sells before Crown worth 20. Greedy starts with 10 coins. You bid first each time, with 5 fixed for Crown. High bidder wins and pays the other bid. Greedy wins ties.
- **Greedy’s card**  
  Bids all remaining coins, up to 8 on Duck.
- **Option labels**  
  Bid 4 · Bid 6 · Bid 9

### Results

| Option | Duck | Crown | Value | Quality |
| --- | --- | --- | ---: | ---: |
| Bid 4 | Greedy bids 8, wins, and pays 4. It has 6 left. | Greedy’s 6 beats your 5. It pays 5. You buy nothing. | 0 | 0 |
| Bid 6 | Greedy bids 8, wins, and pays 6. It has 4 left. | Your 5 beats Greedy’s 4. You pay 4 for a Crown worth 20. | 16 | 1 |
| Bid 9 | Your 9 beats Greedy’s 8. You pay 8 for a Duck worth 11. Greedy still has 10. | Greedy’s 10 beats your 5. It pays 5. | 3 | 0.1875 |

Bid 6 is the unique best. Bid 9 is both the trap and the runner-up. Its quality is 3/16 = 0.1875, below both the 0.8 runner-up limit and the 0.6 trap limit.

**Best:** Bid 6. Greedy pays your bid for Duck and has only 4 coins left, so you win Crown and pay 4.

### Script output

A throwaway Python script ran both sales for each opening bid, applied the tie rule, and graded the resulting profit with a zero floor.

```text
Bid 4: Duck: Greedy pays 4, Crown: Greedy pays 5 | value 0 | quality 0.0000
Bid 6: Duck: Greedy pays 6, Crown: You pay 4 | value 16 | quality 1.0000
Bid 9: Duck: You pay 8, Crown: Greedy pays 5 | value 3 | quality 0.1875
```
