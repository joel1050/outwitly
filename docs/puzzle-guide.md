# Outwitly puzzle guide

How the game works, the five scenarios in the demo, and how to build a new scenario and a new round.

## Where things live

| What | Where | Notes |
|---|---|---|
| Scenario list | `content/catalog.json` | Every scenario with its status: `live`, `approved`, `proposed` or `rejected` (with the reason). |
| Scenario specs | `content/scenarios/<id>.md` | One sheet per scenario: story, rules, trap, idea, what can vary. |
| Game type code | `src/games/<id>/` | `logic.ts` (rules and solver) and `scene.ts` (the animation). Found automatically; nothing else to register. |
| Rounds | `content/rounds/<type>/<id>.json` | One file per round. See "Round files" below. |
| Schedule | `content/schedule.json` | Days with an id, date and round ids in play order. The later entry wins when dates match. |
| Characters | `src/engine/characters.ts` | Each rule and its card text sit together, so a card can't disagree with its rule. |
| Animation kit | `src/render/` | See `docs/animation-kit.md`. |
| Raw model proposals | `docs/proposals/` | Kept as a record. The sheets in `content/scenarios/` are the working copies. |

`npm test` checks all of it: every round solves, every `ready` round passes the checks below, the schedule follows its rules, and the catalogue matches the code.

## The game

Outwitly is a daily browser game. Each day brings a short set of rounds; we are moving from five rounds to **three a day (easy, medium, hard)**, so we need about **93 rounds a month**.

Every round works the same way:

- A small cartoon scene sets up a situation with a clear **goal** ("Get as many coins as you can").
- A few **characters** take part. Each has a **card** that states its rule in one plain sentence ("Takes the biggest chest, even if others are on it."). Characters follow their rule exactly, every time. There is no hidden behaviour.
- The player makes **one choice** from 2 to 4 options. Then the scene plays out by the rules and shows the result.
- The game is about reading the cards and working out how the characters will react to your move. The obvious move is usually a trap.

Because every rule is exact, every option has one true result, and the code works it out. Nothing is judged by hand.

### Scoring

- Each option has a **value** (coins won, people hit, chance to win). The puzzle says whether higher or lower is better.
- **Quality** = how close your option's value is to the best option's, from 0 to 1. For "higher is better": `(value − floor) / (best − floor)`. For "lower is better": `(worst − value) / (worst − best)`. `floor` is optional; it stops an option with a small but non-zero value from scoring well (the duel uses 0.2).
- **Round score** = `100 × quality × speed`. Speed is 1 for answers within 45 seconds, falls in a straight line to 0.5 at 3 minutes, and is 0 when time runs out.

## The five scenarios in the demo

Each has a spec sheet in `content/scenarios/`, with its story, rules, every option's result, the trap, the idea and what can vary. Read them before designing a new one.

| Scenario | Family | Choice | Idea |
|---|---|---|---|
| [Chests](../content/scenarios/chests.md) | crowding | which chest to stand on | everyone piles on the biggest prize |
| [Junction](../content/scenarios/junction.md) | trust | pull, leave or jam a lever | aim at the worst track; Hero's pull carries it on |
| [Pirates](../content/scenarios/pirates.md) | splitting | which split of the gold | buy the cheapest votes |
| [Agenda](../content/scenarios/agenda.md) | voting | which pair votes first | in a voting cycle, whatever enters last wins |
| [Duel](../content/scenarios/duel.md) | conflict | where your first balloon goes | miss on purpose |

### Characters so far

| Character | Personality | Rules in use |
|---|---|---|
| Greedy | Always goes for the biggest prize. | biggest chest; yes if it gets at least N; a ranking |
| Copycat | Does whatever someone else did. | copies a named character |
| Show-off | Joins whatever's most popular. | most-occupied chest; aim rule |
| Loner | Avoids everyone. | biggest empty chest |
| Fair | Rejects anything lopsided. | yes if nobody gets over twice its share; a ranking |
| Lazy | Says yes to anything that gives it something. | yes if it gets anything |
| Hero | Acts when harm passes a threshold. | pulls if heading for more than N |
| Cautious | Picks the safest option. | a ranking; aim rule |

New scenarios may reuse these characters with new rules that fit their personality, or add new characters. A new character needs a name, a one-line personality and a colour.

## How to build a scenario

A **scenario** is a puzzle type: a story, a kind of choice, a set of rules, and a solver that gives every option its exact value. A **round** is one scenario with fixed numbers and characters.

### What a scenario needs

1. **A one-line story** a child could picture, with a cartoon tone. One place, a few props, the characters on screen.
2. **One choice**, with 2 to 4 options. The player makes it once; the characters then act by their rules.
3. **A goal of 10 words or fewer** that matches how the round is scored.
4. **A setup of 40 words or fewer** that states every fact the player needs: amounts, turn order, who sees what, and what happens on a tie or failure.
5. **Character rules of 12 words or fewer each**, exact enough that only one action fits. Every tie must have a stated or obvious tie-break.
6. **An exact solver:** code can compute every option's value with no guessing. Chance is allowed only if it is stated (hit chances) and the value is an exact probability, not a simulation.
7. **A trap:** an option that looks best at first glance but isn't. Usually the "obvious" option grabs the biggest prize, makes the strongest move or does nothing.
8. **An idea:** the one insight that solves it, in a short phrase ("everyone piles on", "aim at the worst track", "buy the cheapest votes"). The scheduler uses this tag to keep the same idea from repeating within a few weeks.
9. **Room for many rounds:** list the parameters that can change and how, so a generator can make 100+ different rounds from one scenario. Some variants should change which idea wins, not just the numbers.
10. **A scene that can animate simply:** the characters move to spots, vote, throw, pull or grab; numbers and speech bubbles appear. No new art beyond a background, a few props and the characters.

### Checks for a good round

- **One clear best move.** The best option beats the next best by a clear margin (as a rough guide, the next best has quality ≤ 0.8).
- **The trap bites.** The obvious option scores quality ≤ 0.6. In about one round in five the obvious move is actually right, so players can't learn "never pick the obvious one".
- **Every option tells a story.** Each option should play out differently and teach something when you see it.
- **Solvable in your head within 3 minutes.** Easy: one reaction to think through. Medium: two or three reactions, or a small count. Hard: a chain of reactions or simple odds. No long sums.
- **No hidden information and no trivia.** Everything needed is on screen.
- **Fair wording.** Read every line and ask "could this mean anything else?" If yes, rewrite it.

### Difficulty

- **Easy:** one step. "What will the others do after my move?"
- **Medium:** two or three steps, or several characters reacting to each other.
- **Hard:** a chain of reasoning, backward induction, or comparing odds.

## How to describe a new scenario

Use this template for each scenario:

```markdown
### <Name> (family: crowding | splitting | bidding | conflict | ahead | voting | trust)

- **Story:** one or two lines.
- **Goal:** ≤10 words. Higher or lower is better?
- **Your choice:** what the options are.
- **Characters and rules:** one line each, ≤12 words, exact.
- **How it resolves:** the order of events and any tie-breaks.
- **Trap:** the obvious option and why it fails.
- **Idea:** the insight, in a short phrase.
- **Can vary:** the parameters and their ranges; which variants change the idea.
- **Scene:** background, props, and what moves.
- **Difficulty range:** which settings make it easy, medium or hard.
```

## Making a new day

1. **Draft six candidates.** GPT-6.2 Sol (high) and Gemini 4 Neon (xhigh) each write three rounds: one easy, one medium, one hard. Split the approved scenarios between them so no scenario appears twice. Each round is text only: what the player sees, the result line for every option, the "Best:" explanation, how to solve it, why the other options lose, the numbers and checks, draft round data, and a script's proof. They go in `content/candidates/<date>/<round-id>.md`.
2. **Choose and improve.** The owner picks the best three (easy, medium, hard) and works on the wording and numbers until they are right.
3. **Build.** Once the owner says yes, Opus builds what is missing: the game type's logic and scene if the scenario isn't live yet, the round files in `content/rounds/`, and the schedule entry. `npm run rounds` and `npm test` must pass, and the rounds are played in the app before they go live.

   To compare several takes on a scene, put each in `dev/compare/variants/<type>/<letter>.ts` (imports point at `../../../../src/`) and open `/dev/compare/` on the dev server. Each variant plays in its own frame, and one click plays an option in all of them. Copy the winner to `src/games/<type>/scene.ts` and delete the variants. The page is for development only and never reaches the build.

Candidates are drafts. Nothing in `content/candidates/` reaches the game.

## Round files

A round is one JSON file, `content/rounds/<type>/<id>.json`. The file name is the id.

```json
{
  "id": "chests-pile-on",
  "type": "chests",
  "difficulty": "easy",
  "idea": "everyone-piles-on",
  "status": "ready",
  "source": "hand",
  "notes": "Greedy, Copycat and Show-off all end up on the 100; Loner heads elsewhere.",
  "params": { "chests": [100, 60, 30, 10], "order": ["you", "greedy", "copycat", "showoff", "loner"] },
  "characters": [
    { "id": "greedy", "ruleKey": "biggest" },
    { "id": "copycat", "ruleKey": "copy", "ruleArgs": { "target": "greedy" } },
    { "id": "showoff", "ruleKey": "mostOccupied", "ruleArgs": { "tieBreak": "bigger" } },
    { "id": "loner", "ruleKey": "biggestEmpty" }
  ]
}
```

| Field | Meaning |
|---|---|
| `id` | Same as the file name. Start with the type, then a few words: `chests-pile-on`. |
| `type` | The game type; must match the folder. |
| `difficulty` | `easy`, `medium` or `hard`. A day runs from easier to harder. |
| `idea` | The insight that solves it, as a short tag. The schedule keeps the same idea at least 14 days apart, so reuse a tag only when the idea really is the same. |
| `status` | `draft` while you work on it (checks are reported, not enforced), `ready` when it may be scheduled (every check must pass), `retired` when it should never come back. |
| `source` | `hand` for hand-made rounds. |
| `obviousIsBest` | Optional. Set it on the rare round where the obvious move is right; the check then demands that it wins. |
| `timeLimitMs` | Optional. Defaults to 3 minutes. |
| `notes` | Why the round works, for whoever reviews it. |
| `params`, `characters`, `options` | What the game type needs. See its spec sheet and `src/games/<type>/logic.ts`. |

## How to hand-make a round

The rules and the twist are where the fun is, so people make rounds by hand. Code only checks them.

1. Pick a live game type and an idea you haven't used lately (`content/schedule.json` shows what ran recently).
2. Copy a round file in `content/rounds/<type>/`, rename it, set `"status": "draft"`, and change the numbers, the cast or the rules.
3. Run `npm run rounds -- <id>`. It prints the goal, setup and cards as the player sees them, then every option with its result and quality, marks the best (★) and the obvious (⚠) option, and lists each check with ✓ or ✗.
4. Change it until it reads well and every check passes. Then play it in the app (`npm run dev`) to see the scene.
5. Set `"status": "ready"` and add its id to a day in `content/schedule.json`. Run `npm test`.

`npm run rounds -- --failing` lists only rounds that fail a check.

A character's rule must already exist in `src/engine/characters.ts`. To add one, add the rule and its card text to that character, in the same entry.

## How to describe an example round in a proposal

When proposing a new scenario, give one example round:

1. The round file, as above.
2. The text the player sees: goal, setup, each card, each option label.
3. A table with every option: what happens step by step, its value, and its quality.
4. The best option, the trap, and the "Best:" explanation shown after the round (one or two sentences).
5. Proof: the output of a small script that works out every option's value from the rules.

## How to add a game type

1. Create `src/games/<id>/logic.ts` that default-exports a `PuzzleType` whose `id` is the folder name. It must solve every option exactly.
2. Create `src/games/<id>/scene.ts` that default-exports a `Stage` subclass. See `docs/animation-kit.md`.
3. Set the scenario's status to `live` in `content/catalog.json` and bring its spec sheet up to date.
4. Add at least one round in `content/rounds/<id>/` and run `npm run rounds -- <id>` and `npm test`.
