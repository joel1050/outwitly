# Cookie Cut

- **id:** `cookie-cut`
- **Family:** splitting
- **Source:** GPT-6.2 Sol (high) proposal, 2026-11-25. Original: `docs/proposals/gpt-6.2-sol.md`.
- **Status:** see `content/catalog.json`

You cut a row of cookies into two trays, then Greedy takes one.

- **Goal** — Keep the cookies worth the most points.
- **Setup** — Eight cookies sit in a row. The two on the left are chocolate, worth 3 points each. The rest are plain, worth 1. You cut the row into two trays. Greedy takes one tray and you get the other.
- **Your choice** — Cut after cookie 1, 3 or 4, counting from the left.
- **Greedy** — Takes the tray with more cookies; the left tray on a tie.
- **How it resolves** — The cut divides the ordered `cookiePoints` list. Greedy takes the tray with more cookies. Your score uses the points on the tray that remains.
- **Round results** — Cut after 1 to keep 3 points, after 3 to keep 7, or after 4 to keep 4. Greedy takes the left tray on the middle cut, so that cut loses both chocolates.
- **Idea** — Keep the smaller tray with both chocolates and a plain cookie.
- **Can vary** — Change the point values, their order and the cuts offered. Cluster high-value cookies for easy rounds, or spread them across the row for harder rounds.
- **Scene** — Drop a divider between cookies. Greedy slides one tray away and the remaining cookies show their points.
