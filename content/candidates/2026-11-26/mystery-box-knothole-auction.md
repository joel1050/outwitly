# Knothole Auction
- **Difficulty:** hard
- **Scenario:** mystery-box (content/scenarios/mystery-box.md)
- **Idea tag:** outbid-to-escape-curse
- **Written by:** Gemini 4 Neon
- **Changes from the scenario sheet:** Stated "Highest positive bid buys the box for its bid; others pay 0" in the setup so Pass (a 0 bid) and losing bids are explicit on screen. Uses `floor = 115` (worst option's value), as specified on the sheet.

## What the player sees
**Goal:** End with the highest average coin total.
**Setup:** You have 120 coins. Box odds: 1/4 for 60, 1/4 for 100, 1/2 for 160 coins. All bid at once. Highest positive bid buys the box for its bid; others pay 0. Rivals win ties.
**Cards:**
- Cautious: Peeks inside. Bids half the box value.
- Greedy: Peeks inside. Bids 60 less than the box, minimum 0.
**Options:**
1. Pass — Bid 0 and keep your 120 coins
2. Bid 40 — Place a low sealed bid of 40 coins
3. Bid 90 — Place a mid sealed bid of 90 coins
4. Bid 105 — Place a high sealed bid of 105 coins

## After the round
- Pass: You never win a crate and keep your 120 coins every time—average 120 coins.
- Bid 40: You beat Cautious on the 60 box for +20 a quarter of the time and lose the rest—average 125 coins.
- Bid 90: Greedy beats you on the 160 box with 100, so you only win the 60 and 100 boxes—average 115 coins.
- Bid 105: You beat both rivals on every box, unlocking the 160 jackpot half the time—average 135 coins.
**Best:** Bid 105 beats Greedy's 100-coin bid on the 160 box, so you win all three cases and earn the full 120-coin box average minus 105—a +15 average gain. Bid 90 falls into the winner's curse because Greedy takes the 160 box whenever it appears.

## How to solve it
1. Work out the crate's overall average: `(1/4 × 60) + (1/4 × 100) + (1/2 × 160) = 15 + 25 + 80 = 120` coins.
2. Find the highest rival bid in each box case (since both rivals peek):
   - Box 60: Cautious bids 30, Greedy bids 0 → rival max is 30.
   - Box 100: Cautious bids 50, Greedy bids 40 → rival max is 50.
   - Box 160: Cautious bids 80, Greedy bids 100 → rival max is 100.
3. Check which boxes each bid wins (rivals win ties) and compute its average profit:
   - Pass wins none: `0` → 120 coins.
   - Bid 40 wins only 60 (`+20` at 1/4 odds): `+5` → 125 coins.
   - Bid 90 wins 60 (`-30` at 1/4) and 100 (`+10` at 1/4), losing 160 to Greedy's 100: `(-30 + 10) / 4 = -5` → 115 coins.
   - Bid 105 beats 100 and wins all three boxes: `120 − 105 = +15` → 135 coins.
4. Pick Bid 105 for the highest average total of 135 coins.

## Why the other options lose
**Bid 90 (the trap):** Bidding 90 looks like a huge bargain—30 coins below the 120-coin box average—and it even beats Cautious on every crate (30, 50, 80). That overlooks Greedy crossing ahead of Cautious on the 160 box with a 100-coin bid, sticking you with only the 60 and 100 boxes for a -5 average loss (115 coins).

**Bid 40:** Cherry-picking the 60 box avoids the winner's curse, since 40 beats Cautious's 30 on 60 and safely loses to Cautious's 50 on 100. That nets +20 a quarter of the time, or just +5 on average (125 coins)—a third of Bid 105's gain.

**Pass:** Walking away feels smart once you spot the winner's curse on Bid 90, keeping all 120 coins intact. Because Greedy stops at 100 on the 160 box, bidding 105 still stays well under the 120-coin box average, so passing leaves 15 average coins on the table.

## Numbers
| Option | Value | Quality | |
|---|---:|---:|---|
| Pass | 120 | 0.250 | |
| Bid 40 | 125 | 0.500 | |
| Bid 90 | 115 | 0.000 | ⚠ |
| Bid 105 | 135 | 1.000 | ★ |

*(Quality uses `floor = 115`, the worst option's value, as specified in `content/scenarios/mystery-box.md`.)*

- ✓ 2 to 4 options: 4 options
- ✓ Exactly one best option: Bid 105 (135 average coins)
- ✓ Next best quality ≤ 0.8: Bid 40 scores 0.500 (`(125 − 115) / (135 − 115)`)
- ✓ Obvious option quality ≤ 0.6: Bid 90 scores 0.000 (`(115 − 115) / (135 − 115)`)
- ✓ Goal ≤ 10 words: 7 words
- ✓ Setup ≤ 40 words (aim for 30): 35 words
- ✓ Each card ≤ 12 words, no brackets: Cautious 7 words, Greedy 10 words; no brackets
- ✓ Exact rules and tie-breaks: box odds, simultaneous sealed bids, positive-bid win rule, loser payment (0), and rival tie-break all stated
- ✓ Solvable in your head within 3 minutes at hard difficulty: compares simple quarter/half odds across 3 cases and spots Greedy overtaking Cautious on the jackpot box

## Draft round data
```json
{
  "id": "mystery-box-knothole-auction",
  "type": "mystery-box",
  "difficulty": "hard",
  "idea": "outbid-to-escape-curse",
  "status": "draft",
  "source": "hand",
  "notes": "Hard unequal-odds auction. Cautious leads on 60 and 100, then Greedy crosses above Cautious on 160 (100 vs 80). Bid 90 looks like a bargain below the 120 average yet suffers the winner's curse (-5); Bid 105 clears Greedy's 100 to win all boxes (+15), beating both Pass (0) and low cherry-picking Bid 40 (+5).",
  "params": {
    "wallet": 120,
    "boxes": [
      { "value": 60, "probNum": 1, "probDen": 4 },
      { "value": 100, "probNum": 1, "probDen": 4 },
      { "value": 160, "probNum": 1, "probDen": 2 }
    ],
    "payment": "first-price",
    "tieWinner": "rival",
    "floor": 115
  },
  "options": [
    { "id": "pass", "label": "Pass", "bid": 0 },
    { "id": "bid-40", "label": "Bid 40", "bid": 40 },
    { "id": "bid-90", "label": "Bid 90", "bid": 90 },
    { "id": "bid-105", "label": "Bid 105", "bid": 105 }
  ],
  "characters": [
    { "id": "cautious", "ruleKey": "peekHalfFloor" },
    { "id": "greedy", "ruleKey": "peekMinus", "ruleArgs": { "margin": 60, "min": 0 } }
  ]
}
```

## Proof
Command: `python3 /tmp/proof_mystery_box_knothole_auction.py`

```text
mystery-box-knothole-auction (higher is better, floor = 115)
  Pass   : avg=120 (120.00), quality=1/4 (0.250)
           - box 60 (C=30, G=0): LOSE (0)
           - box 100 (C=50, G=40): LOSE (0)
           - box 160 (C=80, G=100): LOSE (0)
  Bid 40 : avg=125 (125.00), quality=1/2 (0.500)
           - box 60 (C=30, G=0): WIN (+20)
           - box 100 (C=50, G=40): LOSE (0)
           - box 160 (C=80, G=100): LOSE (0)
  Bid 90 : avg=115 (115.00), quality=0 (0.000) [OBVIOUS]
           - box 60 (C=30, G=0): WIN (-30)
           - box 100 (C=50, G=40): WIN (+10)
           - box 160 (C=80, G=100): LOSE (0)
  Bid 105: avg=135 (135.00), quality=1 (1.000) [BEST]
           - box 60 (C=30, G=0): WIN (-45)
           - box 100 (C=50, G=40): WIN (-5)
           - box 160 (C=80, G=100): WIN (+55)
```
