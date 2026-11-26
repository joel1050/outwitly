# Town Hall Swing
- **Difficulty:** medium
- **Scenario:** roll-call (content/scenarios/roll-call.md)
- **Idea tag:** back-worst-for-rebound
- **Written by:** Gemini 4 Neon
- **Changes from the scenario sheet:** Swapped card tie-breaks so Loner breaks ties leftmost and Show-off breaks ties rightmost (each stated on its card). Greedy backs Pool instead of Mall.

## What the player sees
**Goal:** Get the Park built. Second best: the Pool.
**Setup:** Left to right: Mall 0, Pool 50, Park 100 points. You vote first; then Greedy, Loner, Copycat, and Show-off vote in turn, seeing the tally. Most votes wins; leftmost breaks ties.
**Cards:**
- Greedy: Always votes for Pool.
- Loner: Votes for the project with fewest votes; leftmost breaks ties.
- Copycat: Votes the same as Loner.
- Show-off: Votes for the project with most votes; rightmost breaks ties.
**Options:**
1. Vote Mall — Raise your hand for Mall, worth 0 points
2. Vote Pool — Raise your hand for Pool, worth 50 points
3. Vote Park — Raise your hand for Park, worth 100 points

## After the round
- Vote Mall: Greedy backs Pool, leaving Park alone at 0, so Loner, Copycat, and Show-off sweep Park to a 3–1–1 win!
- Vote Pool: Greedy joins you on Pool, Loner and Copycat tie Mall at 2, and Show-off tips the tie to Pool 3–2.
- Vote Park: Greedy backs Pool, leaving Mall alone at 0, so Loner, Copycat, and Show-off hand Mall a 3–1–1 win.
**Best:** Vote Mall—your worst option—because Greedy always takes Pool, leaving Park as the lone zero-vote underdog. Loner, Copycat, and Show-off then pile onto Park for a 3–1–1 landslide.

## How to solve it
1. Look at the voting bloc: Loner picks the lowest-vote project, Copycat copies Loner (giving it 2 votes), and Show-off joins the leader.
2. Notice Greedy always puts 1 vote on Pool right after you vote.
3. If you want Loner to start a 3-vote run for Park, Park must still have 0 votes when Loner goes—and must be the only project at 0, since Loner breaks ties leftmost.
4. Put your own vote on Mall so the tally before Loner is Mall 1, Pool 1, Park 0. Loner picks Park, Copycat makes it 2 for Park, and Show-off seals Park 3–1–1.

## Why the other options lose
**Vote Park (the trap):** Raising your hand for your favourite feels like the natural way to win. Instead, your vote plus Greedy's vote on Pool leaves Mall as the only project with 0 votes, so Loner, Copycat, and Show-off hand Mall—worth 0 points—a 3–1–1 victory.

**Vote Pool:** Backing your second choice pairs with Greedy to put Pool at 2 while Mall and Park sit tied at 0. Loner breaks that tie leftmost to Mall, Copycat brings Mall to 2, and Show-off breaks the 2–2 tie rightmost for Pool—locking in 50 points, half the Park score.

## Numbers
| Option | Value | Quality | |
|---|---:|---:|---|
| Vote Mall | 100 | 1.000 | ★ |
| Vote Pool | 50 | 0.500 | |
| Vote Park | 0 | 0.000 | ⚠ |

- ✓ 2 to 4 options: 3 options
- ✓ Exactly one best option: Vote Mall (100 points)
- ✓ Next best quality ≤ 0.8: Vote Pool scores 0.500 (50 / 100, floor = 0)
- ✓ Obvious option quality ≤ 0.6: Vote Park scores 0.000 (0 / 100)
- ✓ Goal ≤ 10 words: 8 words
- ✓ Setup ≤ 40 words (aim for 30): 31 words
- ✓ Each card ≤ 12 words, no brackets: Greedy 4, Loner 10, Copycat 5, Show-off 10 words; no brackets
- ✓ Exact rules and tie-breaks: voter order, tally rule, winner tie-break (leftmost), Loner tie-break (leftmost), and Show-off tie-break (rightmost) all stated
- ✓ Solvable in your head within 3 minutes at medium difficulty: 4 sequential voters forming a clean 3-voter chain across 3 choices

## Draft round data
```json
{
  "id": "roll-call-town-hall-swing",
  "type": "roll-call",
  "difficulty": "medium",
  "idea": "back-worst-for-rebound",
  "status": "draft",
  "source": "hand",
  "notes": "All four characters are load-bearing. Voting Mall leaves Park alone at 0 for a 3-1-1 Park landslide; voting Pool relies on Show-off's rightmost tie-break to beat Mall 3-2; voting Park hands Mall a 3-1-1 win.",
  "params": {
    "projects": [
      { "id": "mall", "label": "Mall", "value": 0 },
      { "id": "pool", "label": "Pool", "value": 50 },
      { "id": "park", "label": "Park", "value": 100 }
    ],
    "order": ["you", "greedy", "loner", "copycat", "showoff"],
    "winnerTieBreak": "left"
  },
  "characters": [
    { "id": "greedy", "ruleKey": "alwaysVote", "ruleArgs": { "project": "pool" } },
    { "id": "loner", "ruleKey": "fewestVotes", "ruleArgs": { "tieBreak": "left" } },
    { "id": "copycat", "ruleKey": "copyVote", "ruleArgs": { "target": "loner" } },
    { "id": "showoff", "ruleKey": "mostVotes", "ruleArgs": { "tieBreak": "right" } }
  ]
}
```

## Proof
Command: `python3 /tmp/proof_roll_call_town_hall_swing.py`

```text
roll-call-town-hall-swing (higher is better, floor = 0)
  Vote Mall: You->Mall | Greedy->Pool | Loner->Park | Copycat->Park | Show-off->Park => Mall=1, Pool=1, Park=3 -> Park wins (100), quality=1.000 [BEST]
  Vote Pool: You->Pool | Greedy->Pool | Loner->Mall | Copycat->Mall | Show-off->Pool => Mall=2, Pool=3, Park=0 -> Pool wins ( 50), quality=0.500
  Vote Park: You->Park | Greedy->Pool | Loner->Mall | Copycat->Mall | Show-off->Mall => Mall=3, Pool=1, Park=1 -> Mall wins (  0), quality=0.000 [OBVIOUS]
```
