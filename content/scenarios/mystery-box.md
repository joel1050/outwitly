# Mystery Box

- **id:** `mystery-box`
- **Family:** bidding
- **Source:** Gemini 4 Neon (xhigh) proposal, 2026-11-25. Original: `docs/proposals/gemini-4-neon.md`.
- **Status:** see `content/catalog.json`

- **Story:** A sealed crate holds one of several known coin prizes with equal or stated odds. Some rivals peek inside before everyone submits one sealed bid at once.
- **Goal:** End with the highest average coin total. (Higher is better.)
- **Setup:** A sealed box holds 40 or 120 coins (equal chance). You start with 100 coins. Everyone submits one sealed bid at once; highest bid wins the box and pays its bid. Pass pays nothing. Rivals win ties.
- **Your choice:** Pick one of 4 sealed bids (for example: Pass, Bid 25, Bid 65, or Bid 105).
- **Characters and rules:**
  - **Greedy:** Peeks inside; bids 20 less than the box value (minimum 0).
  - **Show-off:** Peeks inside; bids 90 if the box holds 120, else passes.
  - *(Variant cast — **Cautious:** Peeks inside; bids half the box value, rounded down. **Lazy:** Does not peek; always bids 30.)*
- **How it resolves:** For each possible box value, compute every character's exact bid from its card (a bid of 0 counts as Pass and never wins). You win that case only if your bid is positive and strictly exceeds every rival's bid; if you win, your ending coins are `wallet - bid + box`, else `wallet`. The exact solver computes the probability-weighted average across all cases using exact rationals (with `floor` set to the worst option's value so bad bids grade cleanly).
- **Trap:** Bidding below the box's average value (such as 65 when the average is 80) looks like a bargain, but peeking rivals outbid you whenever the box holds 120, so you only win when it holds 40.
- **Idea:** Account for the winner's curse: winning means informed rivals walked away.
- **Can vary:** Number of box cases (2–4), prize values (10–200), stated odds (equal or weighted fractions), starting wallet, bid options, first-price vs. second-price payment, tie-break owner, and which characters peek vs. bid blind. Variants change the winning idea: when rivals bid too high on the cheap box, Pass is best; when rivals underbid on the rich box, bidding high wins both cases profitably.
- **Scene:** A stage holding a giant wooden `?` crate; peeking characters squint through a knothole, everyone drops sealed envelopes, and the crate lid pops open to show each case's payout and the exact average.
- **Difficulty range:** Easy: 2 equally likely boxes and 1 peeking rival. Medium: 2–3 boxes and 2 peeking rivals. Hard: 3–4 boxes with unequal odds and a mix of peeking and blind bidders.
- **Rating:** Fun: 5/5, Distinct rounds: 4/5 — Discovering that you only win when the box is a dud is a classic game-theory shock, and box odds plus peek rules support hundreds of crisp rounds.
