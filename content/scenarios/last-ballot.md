# Last Ballot

- **id:** `last-ballot`
- **Family:** voting
- **Source:** GPT-6.2 Sol (high) proposal, 2026-11-25. Original: `docs/proposals/gpt-6.2-sol.md`.
- **Status:** see `content/catalog.json`

- **Story**  
  One last ranked ballot decides what the town builds.
- **Goal**  
  Elect the project worth most to you. Higher is better.
- **Setup**  
  Greedy and Fair get two votes each. Others get one. Four or more votes win. Otherwise drop the lowest first tally, rightmost on ties. Transfer those votes to their next choice. Left to right, Garden 20, Stage 0, Pond 12.
- **Your choice**  
  Rank Garden, Pond, Stage, or rank Pond, Garden, Stage. Each option is a complete ballot.
- **Characters and rules**
  - Greedy — Ranks Garden first, Pond second, Stage third.
  - Fair — Ranks Pond first, Stage second, Garden third.
  - Cautious — Ranks Stage first, Garden second, Pond third.
  - Copycat — Copies Cautious’s ranking.
- **How it resolves**  
  You cast your ballot. The others cast the fixed rankings shown, with Copycat copying Cautious. Count first choices by weight. If nobody has four or more of the seven votes, eliminate the lowest total, choosing the rightmost project on a tie. Reassign its ballots to their second choice at full weight. One of the two survivors must then have at least four votes. Score the printed value of that winner.
- **Trap**  
  Put Garden first and Pond drops out on the tie. Its two votes go to Stage, beating Garden 4–3.
- **Idea**  
  Back a rival to redirect the transfer.
- **Can vary**  
  Vary each of the three independent rankings over six orders, which voter Copycat copies, the display order, which two to four complete ballots you offer, and positive project values from 6–24 with a zero for last place. Include a sincere ballot first. Seek profiles where its first tally differs from the tactical ballot’s and where dropping a different project changes the winner. When a sincere vote secures a majority before elimination, tag it “Win on first choices.”
- **Scene**  
  Stack vote tokens above the three projects. Remove one project and slide its tokens to the next choices.
- **Difficulty range**  
  Medium with two ballots and one obvious first tally. Hard with three or four ballots and multiple possible elimination ties.
- **Rating**  
  Fun 5/5 · Round variety 5/5. A vote for Pond can elect Garden, and watching the tokens transfer makes the switch easy to see.
