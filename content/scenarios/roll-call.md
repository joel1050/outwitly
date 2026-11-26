# Roll Call

- **id:** `roll-call`
- **Family:** voting
- **Source:** Gemini 4 Neon (xhigh) proposal, 2026-11-25. Original: `docs/proposals/gemini-4-neon.md`.
- **Status:** see `content/catalog.json`

- **Story:** The town picks one project by public show of hands. You raise your hand first, and each character votes in turn while watching the live tally.
- **Goal:** Get the Park built. Second best: the Pool. (Higher is better.)
- **Setup:** Most votes wins: Mall, Pool, or Park (left to right). Vote first; then Greedy, Loner, Copycat, and Show-off vote in turn, seeing the tally. Leftmost wins ties. Values: Park 100, Pool 50, Mall 0.
- **Your choice:** Vote for one of the 3 (or 4) projects (Mall, Pool, or Park).
- **Characters and rules:**
  - **Greedy:** Always votes Mall.
  - **Loner:** Votes for the choice with the fewest votes (ties: rightmost).
  - **Copycat:** Votes the same as Loner.
  - **Show-off:** Votes for the choice with the most votes (ties: leftmost).
  - *(Variant cast — **Cautious:** Votes its favourite among the top two choices (ties: leftmost). **Fair:** Votes for the choice in second place (ties: leftmost).)*
- **How it resolves:** Start every candidate at 0 votes and add 1 for your chosen candidate. Each character then votes once in listed order using its card rule on the current tally (and prior ballots), adding 1 to its chosen candidate. After the last voter, the candidate with the most votes wins (leftmost breaks ties). Your value is your listed value for the winning project.
- **Trap:** Voting for your favourite (Park) puts Park on the board at 1 vote, so Loner skips Park and backs Pool instead — then Copycat and Show-off pile onto Pool and beat Park.
- **Idea:** Vote away from your favourite so an underdog voter launches a bandwagon for it.
- **Can vary:** Number of candidates (3–4), your preference values, tie-break order, number of voters (3–6), voter order, Copycat's target, and character roster. Variants change the winning idea: when Show-off votes right after you, backing your favourite directly locks in an early bandwagon; when your favourite cannot win, backing your second choice blocks your worst outcome.
- **Scene:** A town-hall stage with coloured project banners and rising live vote bars; each character raises its hand in turn, its badge drops onto a bar, and confetti bursts over the winning banner.
- **Difficulty range:** Easy: 3 candidates, 3 voters (1 reactive rule such as Loner + Show-off). Medium: 3 candidates, 4 voters (Greedy, Loner, Copycat, Show-off). Hard: 4 candidates, 5–6 voters mixing Fair's second-place rule and Cautious's top-two rule.
- **Rating:** Fun: 5/5, Distinct rounds: 5/5 — Deliberately voting against your own favourite to trigger a reverse landslide is immediately memorable, and voter orders and tie-breaks make hundreds of distinct rounds.
