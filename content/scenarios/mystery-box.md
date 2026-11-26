# Mystery Box

- **id:** `mystery-box`
- **Family:** bidding
- **Source:** Gemini 4 Neon (xhigh) proposal, 2026-11-25. Original: `docs/proposals/gemini-4-neon.md`.
- **Status:** see `content/catalog.json`

A sealed box holds one of several coin prizes. Two rivals peek before the secret bids go in.

- **Goal** — Start with 120 coins. End with the most, on average.
- **Setup** — A single box holds 60, 100 or 160 coins, with chances 1 in 4, 1 in 4 and 1 in 2. Rivals peek inside; you can't. Everyone bids once, in secret. The highest bid buys the box; rivals win ties.
- **Your choice** — Pass, Bid 40, Bid 90 or Bid 105.
- **Characters and rules**
  - Cautious peeks, then bids half the coins inside.
  - Greedy peeks, then bids 60 coins less than the box holds. A bid of zero counts as a pass.
- **How it resolves** — Score each possible box separately. If you win, add the box contents and subtract your bid. If a rival wins or everyone passes, keep your starting coins. When rivals tie for the highest positive bid, the first in cast order wins. Weight the ending totals by their stated odds using exact fractions. The lowest option value sets the scoring floor.
- **Round results** — Pass averages 120 coins. Bid 40 wins the 60-coin box and averages 125. Bid 90 wins both smaller boxes and averages 115. Bid 105 wins all three boxes and averages 135.
- **Idea** — Outbid Greedy's 100-coin bid on the 160-coin box. It comes up half the time and makes Bid 105 the best option.
- **Can vary** — Change the possible prizes, their odds, your starting wallet, your bids and Greedy's discount. Use prizes at least as large as the discount and odds that sum to one. Set `obvious` to the tempting option's id.
- **Scene** — Reveal each possible box with everyone's bids, the winner and the player's gain. Finish with the weighted average.
