# River Fork

- **id:** `river-fork`
- **Family:** ahead
- **Source:** Gemini 4 Neon (xhigh) proposal, 2026-11-25. Original: `docs/proposals/gemini-4-neon.md`.
- **Status:** see `content/catalog.json`

- **Story:** You and two characters share one boat heading down a forked river to coin-filled beaches. At each fork, one marked player steers, looking ahead to the final beach.
- **Goal:** Reach the beach with the most coins for you. (Higher is better.)
- **Setup:** You share one boat down a forked river. Each beach pays listed coins to you, Greedy, and Fair. You steer at Fork 1; each character steers at its marked fork, looking ahead to the final beach. Left wins ties.
- **Your choice:** Pick which of 3 branches to steer into at Fork 1 (Left, Middle, or Right).
- **Characters and rules:**
  - **Greedy:** Steers toward the final beach with the most coins for Greedy.
  - **Fair:** Steers toward the beach where top and bottom shares are closest.
  - *(Variant cast — **Hero:** Steers toward the final beach with the highest total coins. **Cautious:** Steers toward the beach where the smallest share is highest. **Show-off:** Steers for the biggest gap: Show-off minus top rival. **Lazy:** Always steers left.)*
- **How it resolves:** Solve the river tree from the deepest forks back to Fork 1. Each branch below a character's fork resolves to one final beach. At its fork, that character scores every branch's resolved beach using its card rule and steers down the best-scoring branch (leftmost wins ties). Your choice at Fork 1 sends the boat along the solved arrows to one beach; your value is your coin payout there.
- **Trap:** Steering into the branch holding your single biggest beach fails because a later character steers away from it — or an earlier character avoids that whole side knowing the last character will ruin it.
- **Idea:** Work backward from the final forks to see where each branch ends.
- **Can vary:** Tree shape (2–4 levels, 4–9 beaches, direct safe beach vs. deep subtrees), payout tuples (0–100), character roster (2–4 characters), fork ownership order, and tie-break direction. Variants change the winning idea: sometimes taking an immediate modest beach beats every deep branch; sometimes steering toward a scary 0-coin beach works because a later rival steers clear of it for you.
- **Scene:** A bright top-down river map with branching blue channels, coloured character signposts at forks, coin badges on each beach, and one cartoon boat paddling through each turn with speech bubbles.
- **Difficulty range:** Easy: 2 levels (you, then 1 character). Medium: 3 levels (you, then 2 characters in sequence). Hard: 3–4 levels where early characters react to later characters' contrasting goals (such as Fair followed by Greedy).
- **Rating:** Fun: 5/5, Distinct rounds: 5/5 — Pure backward induction feels like cracking a treasure map, and tree shapes plus payout combinations yield endless distinct rounds.
