# Cake Cut

- **id:** `cake-cut`
- **Family:** splitting
- **Source:** Gemini 4 Neon (xhigh) proposal, 2026-11-25. Original: `docs/proposals/gemini-4-neon.md`.
- **Status:** see `content/catalog.json`

- **Story:** A five-slice cake topped with coins sits on a bakery counter. You make one cut, Fair splits the richer half in two, and two characters pick before you get the leftover piece.
- **Goal:** End up with the piece holding the most coins. (Higher is better.)
- **Setup:** Five slices hold 20, 10, 50, 55, 10 coins left to right. Make one cut. Fair halves the richer piece by slices (ties: right; odd: extra slice left). Greedy picks first, Show-off second; you keep the leftover piece.
- **Your choice:** Pick one of the 4 gaps between slices to make Cut 1 (Cut 1, Cut 2, Cut 3, or Cut 4).
- **Characters and rules:**
  - **Fair:** Halves the richer piece by slices (ties: right; odd: extra left).
  - **Greedy:** Takes the piece with the most coins (ties: leftmost).
  - **Show-off:** Takes the piece with the most slices (ties: most coins, leftmost).
  - *(Variant cast — **Lazy:** Takes the leftmost piece remaining. **Loner:** Takes the piece with the fewest slices (ties: most coins, leftmost). **Cautious:** Takes the piece whose smallest slice is highest (ties: leftmost).)*
- **How it resolves:** Your cut splits the cake into Left and Right pieces. Fair selects whichever piece has higher total coins (ties: Right; if that piece has only 1 slice, Fair halves the other piece instead) and splits its `k` slices into `ceil(k/2)` slices on the left and `floor(k/2)` on the right, creating 3 pieces left to right. The first picker takes one piece by its rule; the second picker takes one of the remaining two by its rule; you keep the last piece. Your value is its coin total.
- **Trap:** Cutting down the middle (Cut 2) or right beside the big slices (Cut 4) lets Greedy grab `[50, 55]` and Show-off grab `[20, 10]`, stranding you with `[10]` — whereas Cut 3 makes Fair split off `[50]` as a 1-slice gem that Show-off ignores for bulky `[20, 10]`.
- **Idea:** Slice so rivals grab bulky low-value chunks and leave a dense gem behind.
- **Can vary:** Slice coin values (5–100), cake length (4–6 slices, offering up to 4 cut gaps), Fair's target (richest piece vs. longest piece; extra slice left vs. right), and picker pair/order (Greedy, Show-off, Lazy, Loner, Cautious). Variants change the winning idea: with Loner instead of Show-off, you want a bulky leftover piece; with Lazy picking second, you want the rich piece on the far right.
- **Scene:** A bright layered cake bar on a counter with coin piles on each slice; your knife drops first, Fair's knife makes the second chop, plates slide apart, and Greedy and Show-off snatch theirs before the last plate slides to you.
- **Difficulty range:** Easy: 4 slices with Greedy + Lazy. Medium: 5 slices with Fair's split plus Greedy + Show-off. Hard: 5–6 slices where Fair's richer-piece choice flips between left and right across cuts, or with Loner/Cautious pickers.
- **Rating:** Fun: 5/5, Distinct rounds: 5/5 — Cutting a physical cake while predicting a second cut and two picky eaters is super readable, and slice arrays yield thousands of distinct rounds.
