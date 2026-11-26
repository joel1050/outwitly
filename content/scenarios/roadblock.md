# Roadblock

- **id:** `roadblock`
- **Family:** crowding
- **Source:** Gemini 4 Neon (xhigh) proposal, 2026-11-25. Original: `docs/proposals/gemini-4-neon.md`.
- **Status:** see `content/catalog.json`

- **Story:** Four commuters drive from Home to Beach across a diamond road network with a tempting center shortcut. As traffic chief, you place one roadblock before the cars set off.
- **Goal:** Make the slowest car's trip as short as possible. (Lower is better.)
- **Setup:** Four cars drive in turn from Home to Beach. Upper: A (10/car) then B (45). Lower: C (50) then D (10/car). One-way Bridge (0) links A to D. Close one road or none. Ties: Upper, Zigzag, Lower.
- **Your choice:** Pick one roadblock action from 4 options (Leave all open, Close Bridge, Close road A, or Close road D).
- **Characters and rules:**
  - **Greedy, Cautious, Hero, Show-off (shared commuter rule):** Takes the open route fastest right now, counting itself.
  - *(Variant cast — **Copycat:** Takes the same open route as Greedy. **Loner:** Takes the open route with fewest cars on its roads. **Show-off:** Joins the open route with the most cars already on it. **Lazy:** Takes an open two-road route, never using the Bridge.)*
- **How it resolves:** Remove the closed road (if any) and list the remaining valid routes from Home to Beach (subset of Upper `A+B`, Zigzag `A+Bridge+D`, Lower `C+D`). Each car chooses one valid route in listed turn order using its card rule (counting itself on every segment when checking current travel time; ties break Upper, then Zigzag, then Lower). After all cars commit, compute each car's true travel time from the final car counts on its segments. Your value is the maximum (slowest) trip time; lower is better.
- **Trap:** Leaving all roads open ("more roads must be faster!") lures every car onto the 0-minute Bridge, jamming both A and D so every trip slows from 70 minutes to 80 minutes (Braess's paradox).
- **Idea:** Remove a tempting shortcut so drivers spread across separate roads.
- **Can vary:** Fixed road times (20–60), congestion slopes (5–20 per car), Bridge time (0–30) and direction, number of cars (3–5), which 4 closures are offered, and mixing standard commuters with Copycat, Loner, Show-off, or Lazy. Variants change the winning idea: when the Bridge is slow enough or slopes are gentle, leaving all roads open wins; when Show-off crowds Upper, closing road B can beat closing the Bridge.
- **Scene:** A cartoon top-down town map with Home on the left, Beach on the right, 5 labeled roads, orange cones dropping onto the closed road, tiny coloured cars zooming out in turn, and live minute clocks above each car.
- **Difficulty range:** Easy: 3 uniform commuters on a symmetric diamond. Medium: 4 uniform commuters on an asymmetric diamond. Hard: 4–5 cars mixing Copycat, Show-off, and Loner with unequal congestion slopes.
- **Rating:** Fun: 5/5, Distinct rounds: 4/5 — Closing a road to speed up traffic is one of the best paradoxes in game theory, and slopes plus driver quirks supply hundreds of distinct rounds.
