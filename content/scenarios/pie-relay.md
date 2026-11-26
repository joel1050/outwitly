# Pie Relay

- **id:** `pie-relay`
- **Family:** ahead
- **Source:** GPT-6.2 Sol (high) proposal, 2026-11-25. Original: `docs/proposals/gpt-6.2-sol.md`.
- **Status:** see `content/catalog.json`

- **Story**  
  One oven, three pies, and enough time to bake two.
- **Goal**  
  Earn the most coins from baked pies. Higher is better.
- **Setup**  
  Apple needs cold and leaves hot (24), Plum warm to cold (16), Pear cold to warm (5). Bake any pie first. Greedy sees the new heat and picks once from unbaked pies. You earn each price.
- **Your choice**  
  Start with Apple, Plum, or Pear. You set the starting heat for that pie.
- **Characters and rules**
  - Greedy — Bakes the priciest match, leftmost on ties, or skips without one.
- **How it resolves**  
  Bake your first pie and set the oven to its finish heat. From the remaining pies, keep only those whose required heat matches. Greedy bakes the one with the highest printed price, breaking ties by the left-to-right display order. Stop after this pick or skip. Sum the prices of all pies baked.
- **Trap**  
  Apple pays most on its own, but its heat leaves Greedy with nothing to bake.
- **Idea**  
  Bake what unlocks the next job.
- **Can vary**  
  Use three or four pies, prices of 3–30, and any starting and finish heats from cold, warm, and hot. Allow a pie to leave the same heat it needs. Vary which pies can follow each other, how many choices Greedy has, and whether the best pair works in both orders. When the highest-priced pie can bake first or second, compare the best companion it enables with the best pie that enables it, tagged “Find the best partner.”
- **Scene**  
  Slide a pie into the oven, change one thermometer, and slide the next pie in or show an empty tray.
- **Difficulty range**  
  Easy with one match at most per opening. Medium with four pies, competing matches, or a price tie at Greedy’s turn.
- **Rating**  
  Fun 4/5 · Round variety 5/5. Oven heat gives each first move a visible consequence, and changing which pies can follow creates different routes to two payouts.
