# The Pact

- **id:** `the-pact`
- **Family:** trust
- **Source:** Gemini 4 Neon (xhigh) proposal, 2026-11-25. Original: `docs/proposals/gemini-4-neon.md`.
- **Status:** see `content/catalog.json`

- **Story:** You and three neighbours run a four-day market pact. Each day everyone picks Share or Steal at once; once you switch to Steal, you steal every remaining day.
- **Goal:** Earn as many coins as you can across all days. (Higher is better.)
- **Setup:** Four days with Greedy, Fair, and Cautious. Everyone picks Share or Steal together. If you Share: +50 if all share, else 0. If you Steal: +20 per sharing neighbour. Pick the day you switch to Steal.
- **Your choice:** Pick which day you switch from Share to Steal (Day 1, Day 2, Day 3, or Day 4; some variants include Never).
- **Characters and rules:**
  - **Greedy:** Shares Days 1 and 2, then always steals.
  - **Fair:** Shares Day 1; steals forever after anyone steals.
  - **Cautious:** Shares until anyone steals, and always steals on Day 4.
  - *(Variant cast — **Copycat:** Shares Day 1, then copies your move from yesterday. **Show-off:** Shares Day 1, then copies yesterday's majority among others (ties: Steal). **Lazy:** Always shares. **Hero:** Shares until two players steal on one day; then always steals.)*
- **How it resolves:** Simulate Day 1 through Day N. On day `d`, you Share if `d < switchDay`, else Steal; each character picks simultaneously using only moves from days `1` to `d - 1`. If you Shared and all characters Shared, add the all-share reward (50); if you Shared and anyone Stole, add 0; if you Stole, add the steal reward (20) times the count of characters who Shared on day `d`. Your value is the sum across all days.
- **Trap:** Waiting until Day 4 to betray gets you burned on Day 3 when Greedy defects (spoiling your Day-3 share and turning Fair and Cautious hostile on Day 4), while stealing on Day 1 forfeits two high-paying cooperative days.
- **Idea:** Stay loyal while the alliance holds, then defect the exact day a traitor breaks it.
- **Can vary:** Total days (3–6), all-share reward (30–80), steal-per-sharer reward (10–35), optional sucker penalty when you share into a theft, switch-day choices (including Never), and character mix/defection days. Variants change the winning idea: with no early traitor, waiting until the final day (or Never, with a loyalty bonus) wins; with Lazy and a high steal reward, stealing on Day 1 wins.
- **Scene:** A village market square with a 4-day calendar across the top; each day, all players flip Handshake (Share) or Grab (Steal) cards together, coins tally up, and betrayed neighbours scowl.
- **Difficulty range:** Easy: 3 days, 2 characters (Greedy + Copycat). Medium: 4 days, 3 characters with one scheduled defector. Hard: 5 days, 3–4 characters combining Show-off's majority rule and Hero's two-stealer trigger.
- **Rating:** Fun: 4/5, Distinct rounds: 4/5 — Timing a preemptive exit one beat before a pact unravels is a classic repeated-game thrill, with hundreds of schedule and rule combinations.
