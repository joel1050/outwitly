# Agenda

- **id:** `agenda`
- **Family:** voting
- **Source:** launch demo. Code: `src/games/agenda/`. Rounds: `content/rounds/agenda/`.
- **Status:** see `content/catalog.json`

- **Story:** One of three proposals gets built: Fountain, Skatepark or Garden. Greedy, Fair and Cautious vote; you don't. You pick the first pair. Its winner faces the third; majority wins each vote. Each voter backs whichever option it ranks higher.
- **Goal:** Get the Garden built. Second best: the Fountain. (Your values: Garden 100, Fountain 50, Skatepark 0.)
- **Your choice:** which pair votes first.
- **Characters (rankings):** Greedy: Skatepark > Garden > Fountain. Fair: Garden > Fountain > Skatepark. Cautious: Fountain > Skatepark > Garden.
- **Results:** The rankings form a cycle (Garden beats Fountain, Fountain beats Skatepark, Skatepark beats Garden). Garden vs Fountain first → Skatepark built, 0. Garden vs Skatepark first → Fountain, 50. Fountain vs Skatepark first → Garden, 100.
- **Best:** Fountain vs Skatepark. **Trap:** putting your favourite in the first vote. **Idea:** with a voting cycle, whatever enters last wins; keep your favourite out until the end.
- **Can vary:** proposals, rankings, your values, number of voters.
