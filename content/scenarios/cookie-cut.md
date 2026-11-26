# Cookie Cut

- **id:** `cookie-cut`
- **Family:** splitting
- **Source:** GPT-6.2 Sol (high) proposal, 2026-11-25. Original: `docs/proposals/gpt-6.2-sol.md`.
- **Status:** see `content/catalog.json`

- **Story**  
  You cut a row of cookies into two trays, then Greedy takes one.
- **Goal**  
  Keep the cookies worth the most points. Higher is better.
- **Setup**  
  Cut ten cookies once. The leftmost two are chocolate, worth 4 points each. Plain cookies score one. Greedy sees your cut, takes one section, and leaves you the other.
- **Your choice**  
  Cut after cookie 1, 4, or 5, counting from the left.
- **Characters and rules**
  - Greedy — Takes the section with more cookies, left on ties.
- **How it resolves**  
  For a cut after cookie k, compare the first k cookies with the remaining cookies by count. Give Greedy the larger count, or the left section on equality. Sum the point values of your remaining section. Cuts are only between cookies.
- **Trap**  
  The middle cut gives Greedy the left tray with both chocolate cookies.
- **Idea**  
  Give away quantity and keep quality.
- **Can vary**  
  Use 8–14 cookies with two to five chocolate cookies in any positions, chocolate values of 3–7, and three distinct cuts. Keep at least one cut on each side of, or at, the middle. Include rounds with clustered treats and scattered treats. Sometimes the closest cut to even also keeps every chocolate cookie, tagged “Keep the biggest good tray.”
- **Scene**  
  Drop a divider between cookies. Greedy slides one tray away and the remaining cookies show their points.
- **Difficulty range**  
  Easy with chocolate cookies clustered at one end. Medium with several small groups and three plausible cuts.
- **Rating**  
  Fun 4/5 · Round variety 4/5. Counting cookies and counting points give different answers, and the location of each chocolate cookie can change the best cut.
