# Outwitly puzzle guide

How the game works, the five scenarios in the demo, and how to build a new scenario and a new round.

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

### 1. Chests (family: crowding, easy)

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

### 2. Junction (family: trust, easy)

- **Story:** A trolley is heading straight for 3 people. The left track has 6 people, the right track 1. You and Hero each have a lever. One pull sends it left; two send it right. Hero decides after you.
- **Goal:** The trolley hits as few people as possible (lower is better).
- **Your choice:** Pull, Leave, or Jam (Hero can't pull).
- **Character:** Hero: After you move, pulls if it's heading for more than 2 people.
- **Results:** Leave → heading for 3, Hero pulls → left, 6 hit. Pull → heading for 6, Hero pulls → right, 1 hit. Jam → straight, 3 hit.
- **Best:** Pull. **Trap:** Leave. **Idea:** aim it at the worst track on purpose, because Hero's reaction carries it on to the best one.
- **Can vary:** people on each track, how pulls map to tracks, Hero's threshold, a second helper.

### 3. Pirates (family: splitting, medium)

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

### 4. Agenda (family: voting, medium)

- **Story:** One of three proposals gets built: Fountain, Skatepark or Garden. Greedy, Fair and Cautious vote; you don't. You pick the first pair. Its winner faces the third; majority wins each vote. Each voter backs whichever option it ranks higher.
- **Goal:** Get the Garden built. Second best: the Fountain. (Your values: Garden 100, Fountain 50, Skatepark 0.)
- **Your choice:** which pair votes first.
- **Characters (rankings):** Greedy: Skatepark > Garden > Fountain. Fair: Garden > Fountain > Skatepark. Cautious: Fountain > Skatepark > Garden.
- **Results:** The rankings form a cycle (Garden beats Fountain, Fountain beats Skatepark, Skatepark beats Garden). Garden vs Fountain first → Skatepark built, 0. Garden vs Skatepark first → Fountain, 50. Fountain vs Skatepark first → Garden, 100.
- **Best:** Fountain vs Skatepark. **Trap:** putting your favourite in the first vote. **Idea:** with a voting cycle, whatever enters last wins; keep your favourite out until the end.
- **Can vary:** proposals, rankings, your values, number of voters.

### 5. Duel (family: conflict, hard)

- **Story:** Water-balloon duel. One hit and you're out; the last one dry wins. You hit 1 in 3, Cautious 2 in 3, Show-off never misses. Turns go you, Cautious, Show-off, repeat.
- **Goal:** Best chance of being the last one dry.
- **Your choice:** your first throw: at Show-off, at Cautious, or into the air. After that you, like everyone, aim at the most accurate rival still dry.
- **Character rule:** Aims at the most accurate other player still dry.
- **Results (exact odds):** Air 39.7%, at Show-off 31.2%, at Cautious 26.5%.
- **Best:** the air. **Trap:** Show-off, the biggest threat. **Idea:** miss on purpose; the two strong players aim at each other, then you get the first throw at the survivor.
- **Can vary:** accuracies, turn order, number of players, the aim rule.

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

## How to describe an example round

A round is data. It fits the engine's `Round` type:

```ts
{
  index: 1,
  type: 'chests',              // the scenario id
  difficulty: 'easy',
  timeLimitMs: 180000,
  params: { chests: [100, 60, 30, 10], order: ['you', 'greedy', 'copycat', 'showoff', 'loner'] },
  characters: [
    { id: 'greedy', ruleKey: 'biggest' },
    { id: 'copycat', ruleKey: 'copy', ruleArgs: { target: 'greedy' } },
    { id: 'showoff', ruleKey: 'mostOccupied', ruleArgs: { tieBreak: 'bigger' } },
    { id: 'loner', ruleKey: 'biggestEmpty' },
  ],
}
```

For an example round, give:

1. The `Round` data as above.
2. The text the player sees: goal, setup, each card, each option label.
3. A table with every option: what happens step by step, its value, and its quality.
4. The best option, the trap, and the "Best:" explanation shown after the round (one or two sentences).
5. Proof: the output of a small script that works out every option's value from the rules.
