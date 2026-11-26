# Two Lots (ladder version)

- **id:** `two-lots-ladder`
- **Family:** bidding
- **Source:** Gemini 4 Neon (xhigh) proposal, 2026-11-25. Original: `docs/proposals/gemini-4-neon.md`.
- **Status:** see `content/catalog.json`

- **Story:** An auction house sells two prizes in turn: a small Vase, then a grand Crown. Everyone bids from one shared wallet for both lots.
- **Goal:** End with the highest total of coins and prizes. (Higher is better.)
- **Setup:** Vase (30) sells, then Crown (90). Coins: you 60, Cautious 30, Show-off 90. Bid in order on Vase; top bid wins and pays. On Crown, richest left wins, paying runner-up's coins. Earlier player wins ties; nobody exceeds their coins.
- **Your choice:** Pick one of 4 opening bids on Lot 1 (for example: Pass, Bid 20, Bid 45, or Bid 50).
- **Characters and rules:**
  - **Cautious:** Bids 15 if nobody has bid yet; otherwise passes.
  - **Show-off:** If someone bid, bids 10 higher when that is 55 or less.
  - *(Variant cast — **Greedy:** Bids 5 over the top bid while under Lot 1's value. **Copycat:** Matches the prior bid if affordable; otherwise passes. **Lazy:** Bids 10 if nobody bid yet; otherwise passes.)*
- **How it resolves:** Players act once each in listed turn order on Lot 1. Pass means no bid (0); any rule bid exceeding a character's wallet becomes Pass. The highest positive bid wins Lot 1 and subtracts that bid from its wallet (if all pass, Lot 1 goes unsold). On Lot 2, sort remaining wallets highest first, breaking ties by earlier turn order: first place wins Lot 2 and subtracts second place's remaining coins. Your value equals your remaining coins plus the values of any lots you won.
- **Trap:** Passing on Lot 1 to save your whole wallet for Lot 2 lets Show-off buy the Vase cheaply and still outspend you for the Crown.
- **Idea:** Overbid Lot 1 to drain a rival's wallet for Lot 2.
- **Can vary:** Lot values (Lot 1: 15–50, Lot 2: 70–140), starting wallets (20–120), your 4 bid options, turn order, 2–4 characters, raise steps (5–20), and bid caps (25–80). Variants change the winning idea: if Show-off's cap sits below Lot 1's value, overbidding traps you with the Vase and buying cheap or passing wins; if Cautious drains Show-off enough on its own, passing wins.
- **Scene:** An auction stage with a podium, two velvet pedestals (Vase and Crown), coin stacks beneath each character, and raised bid paddles with numbers.
- **Difficulty range:** Easy: 1 rival with a clear cap. Medium: 2 rivals where your bid controls both who wins Lot 2 and the runner-up price. Hard: 3 rivals whose Lot 1 bids chain together and shift the Lot 2 tie-break.
- **Rating:** Fun: 5/5, Distinct rounds: 5/5 — Overbidding an item on purpose to empty a rival's wallet creates a sharp "aha!" moment, and wallets, caps, and lineups generate thousands of rounds.

## Worked example round

We choose **Two Lots** (`bidding`) because it fills a brand-new family absent from the demo, uses clean two-digit arithmetic solvable in under a minute, requires no custom scoring floor, and gives every option a completely distinct strategic story.

### 1. Round data

```ts
{
  index: 1,
  type: 'two_lots',
  difficulty: 'medium',
  timeLimitMs: 180000,
  params: {
    lots: [
      { id: 'vase', name: 'Vase', value: 30 },
      { id: 'crown', name: 'Crown', value: 90 },
    ],
    order: ['you', 'cautious', 'showoff'],
    wallets: { you: 60, cautious: 30, showoff: 90 },
    bids: [0, 20, 45, 50],
  },
  characters: [
    { id: 'cautious', ruleKey: 'openIfNone', ruleArgs: { bid: 15 } },
    { id: 'showoff', ruleKey: 'raiseIfAtMost', ruleArgs: { step: 10, max: 55 } },
  ],
}
```

### 2. Player-facing text

- **Goal:** End with the highest total of coins and prizes. *(9 words; higher is better.)*
- **Setup:** Vase (30) sells, then Crown (90). Coins: you 60, Cautious 30, Show-off 90. Bid in order on Vase; top bid wins and pays. On Crown, richest left wins, paying runner-up's coins. Earlier player wins ties; nobody exceeds their coins. *(39 words.)*
- **Character cards:**
  - **Cautious:** Bids 15 if nobody has bid yet; otherwise passes. *(9 words.)*
  - **Show-off:** If someone bid, bids 10 higher when that is 55 or less. *(12 words.)*
- **Option labels:**
  - `Pass` — `bid 0 on Vase`
  - `Bid 20` — `on Vase (worth 30)`
  - `Bid 45` — `on Vase (worth 30)`
  - `Bid 50` — `on Vase (worth 30)`

### 3. Every option: step-by-step result, value, and quality

Scoring uses `betterIs: 'higher'` and default `floor = 0`, so `quality = value / 115`.

| Option | Step-by-step result | Value | Quality |
|---|---|---:|---:|
| **Pass (0)** *(Trap)* | **Lot 1 (Vase, 30):** You pass (0). Cautious sees no bid and bids 15. Show-off raises by 10 to 25 (≤ 55). Show-off wins the Vase and pays 25. Wallets left: You 60, Cautious 30, Show-off 65.<br>**Lot 2 (Crown, 90):** Show-off has the most coins (65), wins the Crown, and pays runner-up's 60. You win neither lot and keep your 60 coins. | **60** | **0.522** |
| **Bid 20** | **Lot 1 (Vase, 30):** You bid 20. Cautious passes (someone bid). Show-off raises to 30 (≤ 55), wins the Vase, and pays 30. Wallets left: You 60, Cautious 30, Show-off 60.<br>**Lot 2 (Crown, 90):** You and Show-off tie at 60. Earlier player wins ties, so you win the Crown and pay runner-up Show-off's 60 coins: `0 + 90 = 90`. | **90** | **0.783** |
| **Bid 45** *(Best)* | **Lot 1 (Vase, 30):** You bid 45. Cautious passes. Show-off raises to 55 (≤ 55), wins the Vase, and pays 55. Wallets left: You 60, Cautious 30, Show-off 35.<br>**Lot 2 (Crown, 90):** You are richest (60), win the Crown, and pay runner-up Show-off's 35 coins: `25 + 90 = 115`. | **115** | **1.000** |
| **Bid 50** | **Lot 1 (Vase, 30):** You bid 50. Cautious passes. Show-off checks `50 + 10 = 60 > 55` and passes! You win the Vase and pay 50. Wallets left: You 10, Cautious 30, Show-off 90.<br>**Lot 2 (Crown, 90):** Show-off is richest (90), wins the Crown, and pays Cautious's 30. You end with 10 coins plus the 30-coin Vase: `10 + 30 = 40`. | **40** | **0.348** |

### 4. Best option, trap, and post-round explanation

- **Best option:** **Bid 45** (value **115**, quality **1.000**).
- **Trap (obvious option):** **Pass (0)** (value **60**, quality **0.522** ≤ 0.6).
- **Checks:** Unique best (`115`), next best quality **0.783** (≤ 0.8), obvious option quality **0.522** (≤ 0.6).
- **Best:** Overbid the 30-coin Vase at 45 on purpose: Show-off jumps to 55 and drains its wallet to 35, leaving you free to win the 90-coin Crown for only 35 coins. Bid 50 and Show-off folds, sticking you with an overpriced Vase.

### 5. Proof (solver script output)

Computed by a throwaway Node script outside the project (`/tmp/verify_two_lots.mjs`) implementing the exact rules above:

```text
Pass(0) -> Vase:showoff(25), Crown:showoff(60) => value=60, quality=0.522
Bid(20) -> Vase:showoff(30), Crown:you(60) => value=90, quality=0.783
Bid(45) -> Vase:showoff(55), Crown:you(35) => value=115, quality=1.000
Bid(50) -> Vase:you(50), Crown:showoff(30) => value=40, quality=0.348
Checks: uniqueBest=true, nextBest=0.783<=0.8, obvious=0.522<=0.6
```
