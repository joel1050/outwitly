# Magic Pond

- **id:** `magic-pond`
- **Family:** ahead
- **Source:** Gemini 4 Neon (xhigh) proposal, 2026-11-25. Original: `docs/proposals/gemini-4-neon.md`.
- **Status:** see `content/catalog.json`

- **Story:** Fish in a magic pond double overnight up to a cap. You fish on Day 1, characters fish in turn on the next days, and you scoop every fish left on the final day.
- **Goal:** Catch as many fish in total as you can. (Higher is better.)
- **Setup:** The pond holds 8 fish and caps at 12. Leftover fish double each night, never past 12. You fish Day 1, Show-off Day 2, Cautious Day 3, and you take all fish left on Day 4.
- **Your choice:** Choose how many fish to catch on Day 1 from 4 options (for example: 0, 3, 5, or 7).
- **Characters and rules:**
  - **Show-off:** Takes 10 fish if the pond holds 12; else takes 2.
  - **Cautious:** Takes 5 fish if at least 8 remain; else takes 0.
  - *(Variant cast — **Greedy:** Takes half the fish, rounded up. **Hero:** Adds 3 fish if 2 or fewer remain; else takes 1. **Lazy:** Takes 2 fish if any remain. **Copycat:** Takes the same number as the previous fisher.)*
- **How it resolves:** Day 1 subtracts your catch from the pond and adds it to your total. Each night multiplies the pond by the growth rule (capped at the maximum). On each middle day, the scheduled character applies its rule, clamping the pond between 0 and the cap (no ties exist). On the final day, add every remaining fish in the pond to your total.
- **Trap:** Catching 0 on Day 1 ("let it grow!") fills the pond to 12 on Day 2, triggering Show-off to take 10, while catching 7 leaves too little to survive Show-off's normal catch and wipes out the pond.
- **Idea:** Trim the resource just under a rival's trigger without killing regrowth.
- **Can vary:** Starting fish (4–16), pond cap (10–24), growth rule (double, +50% rounded down, or +fixed), total days (3–5), your 4 Day-1 catch options, and character order and thresholds. Variants change the winning idea: with Hero in the lineup, deliberately dipping low triggers Hero's restock; with no high trigger, catching 0 wins; against an unstoppable drain, grabbing the maximum on Day 1 wins.
- **Scene:** A lily-pad pond with a big fish counter and a sun/moon day bar; characters dip nets on their day, fish splash into baskets, and sparkling bubbles double the remaining fish at night.
- **Difficulty range:** Easy: 3 days and 1 character threshold. Medium: 4 days and 2 characters (such as Show-off and Cautious). Hard: 5 days with 3 characters mixing Hero's restock or Copycat's echo.
- **Rating:** Fun: 5/5, Distinct rounds: 5/5 — Balancing overnight growth against rivals' greed triggers feels intuitive and fresh, and growth rules plus character lineups produce huge variety.
