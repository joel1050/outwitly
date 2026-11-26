# Chests

- **id:** `chests`
- **Family:** crowding
- **Source:** launch demo. Code: `src/games/chests/`. Rounds: `content/rounds/chests/`.
- **Status:** see `content/catalog.json`

- **Story:** Four treasure chests on a beach hold 100, 60, 30 and 10 coins. Everyone on a chest splits it equally.
- **Goal:** Get as many coins as you can.
- **Your choice:** which chest to stand on. You pick first, then the characters pick in turn, each seeing every earlier pick.
- **Characters:**
  - Greedy: Takes the biggest chest, even if others are on it.
  - Copycat: Picks the same chest as Greedy.
  - Show-off: Joins the chest with the most characters on it, you included (ties go to the bigger chest).
  - Loner: Takes the biggest chest nobody is on yet.
- **Results:** 100 → shared four ways, 25. 60 → alone, 60. 30 → alone, 30. 10 → 10.
- **Best:** 60. **Trap:** 100. **Idea:** everyone piles on the biggest prize, so the second biggest is yours alone.
- **Can vary:** chest values, number of chests, which characters appear and in what order, the copy target.
