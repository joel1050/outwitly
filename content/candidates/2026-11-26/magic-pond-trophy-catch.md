# Trophy Catch
- **Difficulty:** easy
- **Scenario:** magic-pond (content/scenarios/magic-pond.md)
- **Idea tag:** skim-below-trigger
- **Written by:** Gemini 4 Neon
- **Changes from the scenario sheet:** Added "stopping at 0" on Show-off's card so empty-pond clamping is stated directly on screen.

## What the player sees
**Goal:** Catch as many fish in total as you can.
**Setup:** The pond holds 6 fish, max 10. Leftover fish double each night, up to 10. You fish Day 1, Show-off Day 2, and you take all fish left on Day 3.
**Cards:**
- Show-off: Takes 8 if the pond holds 10; else 2, stopping at 0.
**Options:**
1. Catch 0 — Leave all 6 fish in the pond
2. Catch 2 — Take 2 fish and leave 4
3. Catch 4 — Take 4 fish and leave 2
4. Catch 6 — Take all 6 fish right away

## After the round
- Catch 0: The pond hits 10 overnight, so Show-off hauls away 8 and leaves you only 4 on Day 3.
- Catch 2: Four fish double to 8, so Show-off settles for 2 and the rest double to 10—giving you 12 in total.
- Catch 4: Two fish double to 4, Show-off takes 2, and you scoop 4 more for 8 fish total.
- Catch 6: You empty the pond on Day 1, so Show-off leaves empty-handed and nothing regrows—6 fish total.
**Best:** Catch 2 keeps the pond at 8 on Day 2, just under Show-off's 10-fish trophy trigger. Show-off takes only 2, and the 6 fish left double right back to a full 10 for your Day 3 scoop.

## How to solve it
1. Check Show-off's trigger: if the pond reaches 10 fish on Day 2, Show-off scoops 8 and leaves only 2.
2. See how many fish you can leave on Day 1 without hitting 10 overnight: leaving 5 or 6 doubles to 10 (capped), while leaving 4 doubles to 8.
3. Trace Catch 2 (leaving 4): Night 1 doubles 4 to 8, Show-off takes only 2 (leaving 6), and Night 2 doubles 6 to the cap of 10, giving `2 + 10 = 12` fish.
4. Compare the other three choices: Catch 0 triggers the 8-fish haul (total 4), Catch 4 leaves too little to refill the pond (total 8), and Catch 6 kills regrowth (total 6).

## Why the other options lose
**Catch 0 (the trap):** Leaving every fish alone looks like the smartest way to grow a full pond. Instead, the pond hits 10 on Day 2, waking up Show-off's 8-fish trophy haul; the 2 survivors double to 4, leaving you with just 4 fish.

**Catch 4:** Taking 4 avoids Show-off's big haul, since 2 fish only double to 4 on Day 2. Still, Show-off takes 2 of those 4, leaving just 2 to double to 4 on Day 3—8 fish total, four behind Catch 2.

**Catch 6:** Grabbing all 6 fish on Day 1 feels safe because Show-off gets nothing on Day 2. With zero fish left, overnight doubling produces nothing, so you finish with only those 6 fish.

## Numbers
| Option | Value | Quality | |
|---|---:|---:|---|
| Catch 0 | 4 | 0.333 | ⚠ |
| Catch 2 | 12 | 1.000 | ★ |
| Catch 4 | 8 | 0.667 | |
| Catch 6 | 6 | 0.500 | |

- ✓ 2 to 4 options: 4 options
- ✓ Exactly one best option: Catch 2 (12 fish)
- ✓ Next best quality ≤ 0.8: Catch 4 scores 0.667 (8 / 12, floor = 0)
- ✓ Obvious option quality ≤ 0.6: Catch 0 scores 0.333 (4 / 12)
- ✓ Goal ≤ 10 words: 9 words
- ✓ Setup ≤ 40 words (aim for 30): 31 words
- ✓ Each card ≤ 12 words, no brackets: Show-off 12 words, no brackets
- ✓ Exact rules and tie-breaks: deterministic arithmetic, clamping at 0 and 10 stated, no ties exist
- ✓ Solvable in your head within 3 minutes at easy difficulty: one reaction (does Day 2 hit 10?) with small single-digit sums

## Draft round data
```json
{
  "id": "magic-pond-trophy-catch",
  "type": "magic-pond",
  "difficulty": "easy",
  "idea": "skim-below-trigger",
  "status": "draft",
  "source": "hand",
  "notes": "Easy 3-day pond with one character. Leaving all 6 fish maxes the pond to 10 on Day 2 and triggers Show-off's 8-fish haul; skimming 2 keeps Day 2 at 8 so 6 fish double back to 10 for Day 3.",
  "params": {
    "startFish": 6,
    "cap": 10,
    "growth": "double",
    "days": 3,
    "schedule": ["you", "showoff", "youAll"]
  },
  "options": [
    { "id": "catch-0", "label": "Catch 0", "catch": 0 },
    { "id": "catch-2", "label": "Catch 2", "catch": 2 },
    { "id": "catch-4", "label": "Catch 4", "catch": 4 },
    { "id": "catch-6", "label": "Catch 6", "catch": 6 }
  ],
  "characters": [
    {
      "id": "showoff",
      "ruleKey": "takeAtCapElseFixed",
      "ruleArgs": { "trigger": 10, "highTake": 8, "lowTake": 2 }
    }
  ]
}
```

## Proof
Command: `python3 /tmp/proof_magic_pond_trophy_catch.py`

```text
magic-pond-trophy-catch (higher is better, floor = 0)
  Catch 0: Day2=10, Show-off takes 8, Day3= 4 -> total= 4, quality=0.333 [OBVIOUS]
  Catch 2: Day2= 8, Show-off takes 2, Day3=10 -> total=12, quality=1.000 [BEST]
  Catch 4: Day2= 4, Show-off takes 2, Day3= 4 -> total= 8, quality=0.667
  Catch 6: Day2= 0, Show-off takes 0, Day3= 0 -> total= 6, quality=0.500
```
