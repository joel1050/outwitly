# Tile Stack

- **id:** `tile-stack`
- **Family:** ahead
- **Source:** GPT-6.2 Sol (high) proposal, 2026-11-25. Original: `docs/proposals/gpt-6.2-sol.md`.
- **Status:** see `content/catalog.json`

- **Story**  
  You and Greedy race to clear a stack of tiles and claim its last tile bonus.
- **Goal**  
  Score the most points from the stack. Higher is better.
- **Setup**  
  Stack has 11 tiles. Pick your first take. Greedy sees what’s left and goes next. Alternate turns. After opening, you take 3 or all remaining if fewer. Each tile scores one. Last taker scores 7 extra.
- **Your choice**  
  Open by taking 1, 2, or 3 tiles. All later turns are automatic.
- **Characters and rules**
  - Greedy — Takes 3 tiles, or all remaining if fewer.
- **How it resolves**  
  Deduct the opening take and credit those tiles to you. Alternate, taking the smaller of that actor’s fixed take and the remaining stack. Stop at zero and award the bonus to the actor who emptied it. Your value is your own tile count plus any bonus. For a shortcut after the opening, group the remaining tiles into complete Greedy-then-you cycles. A positive leftover of at most Greedy’s take ends on Greedy’s turn. A larger leftover ends on yours, as does an exact number of complete cycles.
- **Trap**  
  Taking three tiles up front gives you more tiles at first, but Greedy gets the bonus.
- **Idea**  
  Leave the right remainder.
- **Can vary**  
  Use stacks of 7–21 tiles, automatic takes of 2–5 per actor, last tile bonuses of 2–15, and two to four opening takes from 1–5. Match the bonus to the visible difference in tile counts. When the biggest opening lines up the last turn, it can win. When the bonus is small and openings far apart, a large haul can beat taking the last tile, tagged “Count points before chasing the bonus.”
- **Scene**  
  Slide tiles one short stack at a time. Light the bonus when the table clears.
- **Difficulty range**  
  Easy with a stack that lasts three turns. Medium with unequal takes and enough tiles for several cycles.
- **Rating**  
  Fun 4/5 · Round variety 4/5. The visible countdown makes the last turn easy to follow, and the bonus can change which finish matters.
