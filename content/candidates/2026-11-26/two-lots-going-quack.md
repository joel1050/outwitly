# Going, Going, Quack

- **Difficulty:** medium
- **Scenario:** two-lots (content/scenarios/two-lots.md)
- **Idea tag:** set-the-rivals-price
- **Written by:** GPT-6.2 Sol
- **Changes from the scenario sheet:**
  - Set Duck’s value to 12 coins, Crown’s value to 24, Greedy’s starting wallet to 12, and your fixed Crown bid to 6. Offer Duck bids of 6, 8, and 9.

## What the player sees

**Goal:** Earn the most coins after bid payments.

**Setup:** Duck, worth 12 coins, sells before Crown, worth 24. Greedy starts with 12 coins. You bid first each time, with 6 fixed for Crown. You can pay both. High bidder wins and pays the other bid. Greedy wins ties.

**Cards:**

- Greedy: Bids all remaining coins, up to 8 on Duck.

**Options:**

1. Bid 6 — Offer 6 coins for Duck.
2. Bid 8 — Offer 8 coins for Duck.
3. Bid 9 — Offer 9 coins for Duck.

## After the round

- Bid 6: Greedy pays 6 for Duck and wins Crown on a tie, leaving you with 0 profit.
- Bid 8: Greedy wins the tie for Duck and pays 8, so you buy Crown for 4 and earn 20 coins.
- Bid 9: You buy Duck for 8 and earn 4 coins, while Greedy still has enough to take Crown.

**Best:** Bid 8. Greedy wins the Duck tie and pays your 8, so its 4 remaining coins fall short of your Crown bid and you get Crown for 4.

## How to solve it

1. Greedy starts with 12 coins and caps its Duck bid at 8. It wins against 6 or 8 and pays that bid. Against 9, it keeps its full wallet.
2. Compare Greedy’s remaining coins with your Crown bid of 6. Its 6 wins a tie, its 4 loses, and its 12 wins outright.
3. With a bid of 8 you buy Crown for 4 and earn 20. With a bid of 9 you buy Duck for 8 and earn 4. With a bid of 6 you buy nothing.

## Why the other options lose

**Bid 6** makes Greedy pay for Duck, but leaves it with exactly 6 coins. It can match your Crown bid, and the tie goes its way.

**Bid 9** is the trap. It wins Duck outright, but that leaves Greedy’s wallet full for Crown and you earn just 4 coins from Duck.

## Numbers

| Option | Value | Quality | |
| --- | ---: | ---: | --- |
| Bid 6 | 0 | 0 | |
| Bid 8 | 20 | 1 | ★ |
| Bid 9 | 4 | 0.2 | ⚠ |

- ✓ 3 options, within the 2–4 limit.
- ✓ 1 best option at 20 coins of profit. The runner-up earns 4/20 = 0.2, below 0.8.
- ✓ The highest opening bid earns quality 0.2, below the 0.6 trap limit.
- ✓ Goal 7 words, setup 39 words, Greedy’s card 9 words. The card has no bracketed notes.
- ✓ Both sales specify their order, bids, winner, price, and tie-break. Greedy wins the 8–8 Duck tie and the 6–6 Crown tie. All bids are payable.
- ✓ The three bids give you different purchases. You buy nothing, Crown, or Duck.
- ✓ Medium within 3 minutes. Resolve 2 sales per option and subtract the winning price from the toy’s value.

## Draft round data

```json
{
  "id": "two-lots-going-quack",
  "type": "two-lots",
  "difficulty": "medium",
  "idea": "set-the-rivals-price",
  "status": "draft",
  "source": "hand",
  "params": {
    "lots": [
      { "id": "duck", "worth": 12 },
      { "id": "crown", "worth": 24 }
    ],
    "greedyCoins": 12,
    "standingCrownBid": 6
  },
  "characters": [
    { "id": "greedy", "ruleKey": "bidRemaining", "ruleArgs": { "duckCap": 8 } }
  ],
  "options": { "bid6": 6, "bid8": 8, "bid9": 9 }
}
```

## Proof

```text
two-lots-going-quack
Bid 6: Duck 6 vs 8, Greedy pays 6; Crown 6 vs 6, Greedy pays 6 | value 0 | quality 0
Bid 8: Duck 8 vs 8, Greedy pays 8; Crown 6 vs 4, you pay 4 | value 20 | quality 1
Bid 9: Duck 9 vs 8, you pay 8; Crown 6 vs 12, Greedy pays 6 | value 4 | quality 1/5
Words: goal 7, setup 39, cards 9
```
