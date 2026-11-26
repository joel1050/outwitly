# One Last Vote

- **Difficulty:** hard
- **Scenario:** last-ballot (content/scenarios/last-ballot.md)
- **Idea tag:** back-a-rival-to-redirect-votes
- **Written by:** GPT-6.2 Sol
- **Changes from the scenario sheet:**
  - Display Garden, Pond, Stage from left to right and raise Garden’s value from 20 to 24. Fair ranks Garden second and Stage third. Cautious ranks Pond second and Garden third. Add Stage, Garden, Pond as a third ballot.

## What the player sees

**Goal:** Elect the project worth the most points.

**Setup:** Greedy and Fair get two votes each. Others get one. Four or more win. Otherwise drop the project with fewest first picks, rightmost on ties. Send its votes to second choices. Left to right: Garden 24, Pond 12, Stage 0.

**Cards:**

- Greedy: Ranks Garden first, Pond second, Stage third.
- Fair: Ranks Pond first, Garden second, Stage third.
- Cautious: Ranks Stage first, Pond second, Garden third.
- Copycat: Copies Cautious’s ranking.

**Options:**

1. Garden first — Garden, Pond, Stage.
2. Pond first — Pond, Garden, Stage.
3. Stage first — Stage, Garden, Pond.

## After the round

- Garden first: Stage drops out and sends two votes to Pond, which wins 4–3 and scores you 12 points.
- Pond first: Stage drops out and sends two more votes to Pond, which wins 5–2 and scores you 12 points.
- Stage first: Pond drops out and Fair’s two votes elect Garden 4–3, scoring you 24 points.

**Best:** Put Stage first to save it from the tie at the bottom. Pond drops out instead, so Fair’s two votes go to Garden and give it the win.

## How to solve it

1. Greedy puts two votes on Garden, Fair puts two on Pond, and Cautious and Copycat give Stage one each.
2. Your first choice reaches three votes. The other two projects tie at two, so drop the rightmost of those two.
3. If Stage drops, both its votes go to Pond. If Pond drops, both its votes go to Garden. Put Stage first to make Pond drop and get Garden’s 24 points.

## Why the other options lose

**Garden first** is the trap. It puts the 24-point project in the lead, but Stage sits farther right than Pond and drops on their tie. Its two votes land on Pond, which passes Garden.

**Pond first** also drops Stage, but now your own vote joins the two votes that transfer to Pond. That gives Pond a wider win and still pays you 12 points.

## Numbers

| Option | Value | Quality | |
| --- | ---: | ---: | --- |
| Garden first | 12 | 0.5 | ⚠ |
| Pond first | 12 | 0.5 | |
| Stage first | 24 | 1 | ★ |

- ✓ 3 options, within the 2–4 limit.
- ✓ 1 best option at 24 points. Each runner-up earns 12/24 = 0.5, below 0.8.
- ✓ Ranking the highest-point project first earns quality 0.5, below the 0.6 trap limit.
- ✓ Goal 7 words, setup 40 words, cards 7, 7, 7, and 3 words. No card has bracketed notes.
- ✓ The ballot order, vote weights, majority of at least 4, and rightmost tie-break are visible. Each transfer goes to a single second choice. With 7 votes and 2 survivors, the final tally cannot tie.
- ✓ The three ballots produce different first and final tallies. Two elect Pond by different margins and one elects Garden.
- ✓ Hard within 3 minutes. Add the weighted votes, compare 2 possible elimination ties, and trace transfers of 2 votes to see who reaches 4.

## Draft round data

```json
{
  "id": "last-ballot-town-square",
  "type": "last-ballot",
  "difficulty": "hard",
  "idea": "back-a-rival-to-redirect-votes",
  "status": "draft",
  "source": "hand",
  "params": {
    "projects": [
      { "id": "garden", "points": 24 },
      { "id": "pond", "points": 12 },
      { "id": "stage", "points": 0 }
    ],
    "voteWeights": { "greedy": 2, "fair": 2, "cautious": 1, "copycat": 1, "you": 1 },
    "majority": 4,
    "eliminationTieBreak": "rightmost"
  },
  "characters": [
    { "id": "greedy", "ruleKey": "ranking", "ruleArgs": ["garden", "pond", "stage"] },
    { "id": "fair", "ruleKey": "ranking", "ruleArgs": ["pond", "garden", "stage"] },
    { "id": "cautious", "ruleKey": "ranking", "ruleArgs": ["stage", "pond", "garden"] },
    { "id": "copycat", "ruleKey": "copyRanking", "ruleArgs": { "target": "cautious" } }
  ],
  "options": {
    "gardenFirst": ["garden", "pond", "stage"],
    "pondFirst": ["pond", "garden", "stage"],
    "stageFirst": ["stage", "garden", "pond"]
  }
}
```

## Proof

```text
last-ballot-town-square
Garden first: 3/2/2; drop Stage, then 3/4/0; Pond wins | value 12 | quality 1/2
Pond first: 2/3/2; drop Stage, then 2/5/0; Pond wins | value 12 | quality 1/2
Stage first: 2/2/3; drop Pond, then 4/0/3; Garden wins | value 24 | quality 1
Words: goal 7, setup 40, cards 7, 7, 7, 3
```
