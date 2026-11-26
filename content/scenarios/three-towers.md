# Three Towers

- **id:** `three-towers`
- **Family:** conflict
- **Source:** Gemini 4 Neon (xhigh) proposal, 2026-11-25. Original: `docs/proposals/gemini-4-neon.md`.
- **Status:** see `content/catalog.json`

- **Story:** Three castle towers hold gold, silver, and bronze treasure. You station your guards first; then Greedy and Loner deploy their guards to capture towers.
- **Goal:** Win the highest total treasure from the towers. (Higher is better.)
- **Setup:** Towers hold 55, 45, and 35 coins. Deploy 7 guards first; then Greedy (6) and Loner (2) deploy in turn. Most guards wins a tower. Ties go to you if you stationed at least 1 guard; 0 wins nothing.
- **Your choice:** Pick one of 4 guard formations summing to your budget (for example: `4 / 2 / 1`, `6 / 1 / 0`, `5 / 1 / 1`, or `3 / 2 / 2`).
- **Characters and rules:**
  - **Greedy:** Checks towers richest first; spends just enough to beat each it can.
  - **Loner:** Puts all guards on the tower with fewest total guards (ties: richest).
  - *(Variant cast — **Show-off:** Puts all guards on the tower with most total guards (ties: richest). **Cautious:** Splits guards evenly across towers, extra guards left to right. **Lazy:** Puts all guards on the leftmost tower.)*
- **How it resolves:** Place your guards on the three towers according to your chosen formation. Each character deploys once in listed order using its rule (to beat a tower where the highest single player has `m` guards, Greedy must place `m + 1` guards; unspent guards stay off the board). On each tower, find the highest single-player guard count: if it is 0, nobody wins; if you hold or tie that positive maximum, you win the tower's coins (other ties go to the earlier player). Your value is the sum of coins from towers you win.
- **Trap:** Spreading guards in proportion to tower values (`4 / 2 / 1`) lets Greedy capture Gold with 5 while leaving Bronze with 1 guard for Loner to snipe, whereas `3 / 2 / 2` sacrifices Gold cheaply (draining 4 of Greedy's 6 guards) and double-guards both flanks so Loner bounces off your tie-break.
- **Idea:** Bait a rival to overspend on one tower so you hold the flanks.
- **Can vary:** Tower values (10–100), number of towers (3–4), guard budgets for you and each rival (2–12), formation options, tie-break rule (defender wins ties vs. split ties), and rival mix (Greedy, Loner, Show-off, Cautious, Lazy). Variants change the winning idea: when your guards outnumber Greedy's, fortifying Gold (`6 / 1 / 0`) wins; when Show-off joins Greedy on Gold, abandoning Gold (`0 / 4 / 3`) sweeps the other two towers.
- **Scene:** Three cartoon castle towers flying coin banners; your knights march into position first, then Greedy's and Loner's knights rush their chosen towers, and winning flags hoist with trumpets.
- **Difficulty range:** Easy: 3 towers and 1 rival (Greedy alone). Medium: 3 towers and 2 rivals (Greedy + Loner). Hard: 4 towers or 3 rivals where Show-off and Loner react to Greedy's deployment.
- **Rating:** Fun: 5/5, Distinct rounds: 5/5 — Outsmarting a stronger-looking force by pricing a sacrifice tower right delivers pure Colonel Blotto tactics, with massive formation and budget variety.
