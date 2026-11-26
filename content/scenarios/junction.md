# Junction

- **id:** `junction`
- **Family:** trust
- **Source:** launch demo. Code: `src/games/junction/`. Rounds: `content/rounds/junction/`.
- **Status:** see `content/catalog.json`

- **Story:** A trolley is heading straight for 3 people. The left track has 6 people, the right track 1. You and Hero each have a lever. One pull sends it left; two send it right. Hero decides after you.
- **Goal:** The trolley hits as few people as possible (lower is better).
- **Your choice:** Pull, Leave, or Jam (Hero can't pull).
- **Character:** Hero: After you move, pulls if it's heading for more than 2 people.
- **Results:** Leave → heading for 3, Hero pulls → left, 6 hit. Pull → heading for 6, Hero pulls → right, 1 hit. Jam → straight, 3 hit.
- **Best:** Pull. **Trap:** Leave. **Idea:** aim it at the worst track on purpose, because Hero's reaction carries it on to the best one.
- **Can vary:** people on each track, how pulls map to tracks, Hero's threshold, a second helper.
