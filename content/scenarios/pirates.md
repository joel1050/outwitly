# Pirates

- **id:** `pirates`
- **Family:** splitting
- **Source:** launch demo. Code: `src/games/pirates/`. Rounds: `content/rounds/pirates/`.
- **Status:** see `content/catalog.json`

- **Story:** You are the pirate captain splitting 100 gold with Greedy, Fair and Lazy. You need 3 of 4 yes votes, and you always vote yes. Fail and you walk the plank with nothing.
- **Goal:** Keep as much gold as you can.
- **Your choice:** one of four fixed splits (you / Greedy / Fair / Lazy): A 97/1/1/1, B 49/50/0/1, C 66/0/33/1, D 25/25/25/25.
- **Characters:**
  - Greedy: Votes yes only if it gets 50 gold or more.
  - Fair: Votes yes only if nobody gets over twice what Fair gets.
  - Lazy: Votes yes if it gets anything at all.
- **Results:** A fails (2 yes), 0. B passes, 49. C passes, 66. D passes, 25.
- **Best:** C. **Trap:** A (keeps the most if it passed). **Idea:** buy the cheapest votes; Fair accepts you keeping exactly double its share.
- **Can vary:** gold, votes needed, each character's price, the four splits on offer.
