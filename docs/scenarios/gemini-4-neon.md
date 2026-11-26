# Ten new scenarios for Outwitly

Ten original scenarios covering all seven families (`bidding` ×2, `ahead` ×2, `trust` ×2, `crowding`, `splitting`, `voting`, `conflict`), followed by one fully worked example round for **Two Lots**. Every scenario reuses the existing eight characters (`Greedy`, `Copycat`, `Show-off`, `Loner`, `Fair`, `Lazy`, `Hero`, `Cautious`) with rules that fit their established personalities, so no new character art is needed.

---

## Scenarios

### 1. Two Lots (family: bidding)

- **Story:** An auction house sells two prizes in turn: a small Vase, then a grand Crown. Everyone bids from one shared wallet for both lots.
- **Goal:** End with the highest total of coins and prizes. (Higher is better.)
- **Setup:** Vase (30) sells, then Crown (90). Coins: you 60, Cautious 30, Show-off 90. Bid in order on Vase; top bid wins and pays. On Crown, richest left wins, paying runner-up's coins. Earlier player wins ties; nobody exceeds their coins.
- **Your choice:** Pick one of 4 opening bids on Lot 1 (for example: Pass, Bid 20, Bid 45, or Bid 50).
- **Characters and rules:**
  - **Cautious:** Bids 15 if nobody has bid yet; otherwise passes.
  - **Show-off:** If someone bid, bids 10 higher when that is 55 or less.
  - *(Variant cast — **Greedy:** Bids 5 over the top bid while under Lot 1's value. **Copycat:** Matches the prior bid if affordable; otherwise passes. **Lazy:** Bids 10 if nobody bid yet; otherwise passes.)*
- **How it resolves:** Players act once each in listed turn order on Lot 1. Pass means no bid (0); any rule bid exceeding a character's wallet becomes Pass. The highest positive bid wins Lot 1 and subtracts that bid from its wallet (if all pass, Lot 1 goes unsold). On Lot 2, sort remaining wallets highest first, breaking ties by earlier turn order: first place wins Lot 2 and subtracts second place's remaining coins. Your value equals your remaining coins plus the values of any lots you won.
- **Trap:** Passing on Lot 1 to save your whole wallet for Lot 2 lets Show-off buy the Vase cheaply and still outspend you for the Crown.
- **Idea:** Overbid Lot 1 to drain a rival's wallet for Lot 2.
- **Can vary:** Lot values (Lot 1: 15–50, Lot 2: 70–140), starting wallets (20–120), your 4 bid options, turn order, 2–4 characters, raise steps (5–20), and bid caps (25–80). Variants change the winning idea: if Show-off's cap sits below Lot 1's value, overbidding traps you with the Vase and buying cheap or passing wins; if Cautious drains Show-off enough on its own, passing wins.
- **Scene:** An auction stage with a podium, two velvet pedestals (Vase and Crown), coin stacks beneath each character, and raised bid paddles with numbers.
- **Difficulty range:** Easy: 1 rival with a clear cap. Medium: 2 rivals where your bid controls both who wins Lot 2 and the runner-up price. Hard: 3 rivals whose Lot 1 bids chain together and shift the Lot 2 tie-break.
- **Rating:** Fun: 5/5, Distinct rounds: 5/5 — Overbidding an item on purpose to empty a rival's wallet creates a sharp "aha!" moment, and wallets, caps, and lineups generate thousands of rounds.

### 2. Mystery Box (family: bidding)

- **Story:** A sealed crate holds one of several known coin prizes with equal or stated odds. Some rivals peek inside before everyone submits one sealed bid at once.
- **Goal:** End with the highest average coin total. (Higher is better.)
- **Setup:** A sealed box holds 40 or 120 coins (equal chance). You start with 100 coins. Everyone submits one sealed bid at once; highest bid wins the box and pays its bid. Pass pays nothing. Rivals win ties.
- **Your choice:** Pick one of 4 sealed bids (for example: Pass, Bid 25, Bid 65, or Bid 105).
- **Characters and rules:**
  - **Greedy:** Peeks inside; bids 20 less than the box value (minimum 0).
  - **Show-off:** Peeks inside; bids 90 if the box holds 120, else passes.
  - *(Variant cast — **Cautious:** Peeks inside; bids half the box value, rounded down. **Lazy:** Does not peek; always bids 30.)*
- **How it resolves:** For each possible box value, compute every character's exact bid from its card (a bid of 0 counts as Pass and never wins). You win that case only if your bid is positive and strictly exceeds every rival's bid; if you win, your ending coins are `wallet - bid + box`, else `wallet`. The exact solver computes the probability-weighted average across all cases using exact rationals (with `floor` set to the worst option's value so bad bids grade cleanly).
- **Trap:** Bidding below the box's average value (such as 65 when the average is 80) looks like a bargain, but peeking rivals outbid you whenever the box holds 120, so you only win when it holds 40.
- **Idea:** Account for the winner's curse: winning means informed rivals walked away.
- **Can vary:** Number of box cases (2–4), prize values (10–200), stated odds (equal or weighted fractions), starting wallet, bid options, first-price vs. second-price payment, tie-break owner, and which characters peek vs. bid blind. Variants change the winning idea: when rivals bid too high on the cheap box, Pass is best; when rivals underbid on the rich box, bidding high wins both cases profitably.
- **Scene:** A stage holding a giant wooden `?` crate; peeking characters squint through a knothole, everyone drops sealed envelopes, and the crate lid pops open to show each case's payout and the exact average.
- **Difficulty range:** Easy: 2 equally likely boxes and 1 peeking rival. Medium: 2–3 boxes and 2 peeking rivals. Hard: 3–4 boxes with unequal odds and a mix of peeking and blind bidders.
- **Rating:** Fun: 5/5, Distinct rounds: 4/5 — Discovering that you only win when the box is a dud is a classic game-theory shock, and box odds plus peek rules support hundreds of crisp rounds.

### 3. River Fork (family: ahead)

- **Story:** You and two characters share one boat heading down a forked river to coin-filled beaches. At each fork, one marked player steers, looking ahead to the final beach.
- **Goal:** Reach the beach with the most coins for you. (Higher is better.)
- **Setup:** You share one boat down a forked river. Each beach pays listed coins to you, Greedy, and Fair. You steer at Fork 1; each character steers at its marked fork, looking ahead to the final beach. Left wins ties.
- **Your choice:** Pick which of 3 branches to steer into at Fork 1 (Left, Middle, or Right).
- **Characters and rules:**
  - **Greedy:** Steers toward the final beach with the most coins for Greedy.
  - **Fair:** Steers toward the beach where top and bottom shares are closest.
  - *(Variant cast — **Hero:** Steers toward the final beach with the highest total coins. **Cautious:** Steers toward the beach where the smallest share is highest. **Show-off:** Steers for the biggest gap: Show-off minus top rival. **Lazy:** Always steers left.)*
- **How it resolves:** Solve the river tree from the deepest forks back to Fork 1. Each branch below a character's fork resolves to one final beach. At its fork, that character scores every branch's resolved beach using its card rule and steers down the best-scoring branch (leftmost wins ties). Your choice at Fork 1 sends the boat along the solved arrows to one beach; your value is your coin payout there.
- **Trap:** Steering into the branch holding your single biggest beach fails because a later character steers away from it — or an earlier character avoids that whole side knowing the last character will ruin it.
- **Idea:** Work backward from the final forks to see where each branch ends.
- **Can vary:** Tree shape (2–4 levels, 4–9 beaches, direct safe beach vs. deep subtrees), payout tuples (0–100), character roster (2–4 characters), fork ownership order, and tie-break direction. Variants change the winning idea: sometimes taking an immediate modest beach beats every deep branch; sometimes steering toward a scary 0-coin beach works because a later rival steers clear of it for you.
- **Scene:** A bright top-down river map with branching blue channels, coloured character signposts at forks, coin badges on each beach, and one cartoon boat paddling through each turn with speech bubbles.
- **Difficulty range:** Easy: 2 levels (you, then 1 character). Medium: 3 levels (you, then 2 characters in sequence). Hard: 3–4 levels where early characters react to later characters' contrasting goals (such as Fair followed by Greedy).
- **Rating:** Fun: 5/5, Distinct rounds: 5/5 — Pure backward induction feels like cracking a treasure map, and tree shapes plus payout combinations yield endless distinct rounds.

### 4. Magic Pond (family: ahead)

- **Story:** Fish in a magic pond double overnight up to a cap. You fish on Day 1, characters fish in turn on the next days, and you scoop every fish left on the final day.
- **Goal:** Catch as many fish in total as you can. (Higher is better.)
- **Setup:** The pond holds 8 fish and caps at 12. Leftover fish double each night, never past 12. You fish Day 1, Show-off Day 2, Cautious Day 3, and you take all fish left on Day 4.
- **Your choice:** Choose how many fish to catch on Day 1 from 4 options (for example: 0, 3, 5, or 7).
- **Characters and rules:**
  - **Show-off:** Takes 10 fish if the pond holds 12; else takes 2.
  - **Cautious:** Takes 5 fish if at least 8 remain; else takes 0.
  - *(Variant cast — **Greedy:** Takes half the fish, rounded up. **Hero:** Adds 3 fish if 2 or fewer remain; else takes 1. **Lazy:** Takes 2 fish if any remain. **Copycat:** Takes the same number as the previous fisher.)*
- **How it resolves:** Day 1 subtracts your catch from the pond and adds it to your total. Each night multiplies the pond by the growth rule (capped at the maximum). On each middle day, the scheduled character applies its rule, clamping the pond between 0 and the cap (no ties exist). On the final day, add every remaining fish in the pond to your total.
- **Trap:** Catching 0 on Day 1 ("let it grow!") fills the pond to 12 on Day 2, triggering Show-off to take 10, while catching 7 leaves too little to survive Show-off's normal catch and wipes out the pond.
- **Idea:** Trim the resource just under a rival's trigger without killing regrowth.
- **Can vary:** Starting fish (4–16), pond cap (10–24), growth rule (double, +50% rounded down, or +fixed), total days (3–5), your 4 Day-1 catch options, and character order and thresholds. Variants change the winning idea: with Hero in the lineup, deliberately dipping low triggers Hero's restock; with no high trigger, catching 0 wins; against an unstoppable drain, grabbing the maximum on Day 1 wins.
- **Scene:** A lily-pad pond with a big fish counter and a sun/moon day bar; characters dip nets on their day, fish splash into baskets, and sparkling bubbles double the remaining fish at night.
- **Difficulty range:** Easy: 3 days and 1 character threshold. Medium: 4 days and 2 characters (such as Show-off and Cautious). Hard: 5 days with 3 characters mixing Hero's restock or Copycat's echo.
- **Rating:** Fun: 5/5, Distinct rounds: 5/5 — Balancing overnight growth against rivals' greed triggers feels intuitive and fresh, and growth rules plus character lineups produce huge variety.

### 5. Chip In (family: trust)

- **Story:** Everyone wants a river bridge built, which pays every player a big bonus if funded. You chip in first; if the pot misses the target, nobody gets a refund.
- **Goal:** End with as many coins as you can. (Higher is better.)
- **Setup:** You have 50 coins. Reach 85 in the pot and everyone gains 60 coins; miss it and contributions are lost. You chip in first, then Fair, Cautious, and Hero go in turn, each seeing the pot so far.
- **Your choice:** Pick one of 4 chip-in amounts from your wallet (for example: 0, 15, 20, or 40 coins).
- **Characters and rules:**
  - **Fair:** Matches your chip-in, up to 25 coins.
  - **Cautious:** Adds 25 if the pot holds at least 40; else 0.
  - **Hero:** Finishes the target if 20 or less is needed; else 0.
  - *(Variant cast — **Show-off:** Adds 20 if at least two others chipped in; else 0. **Copycat:** Matches the previous player's chip-in, up to 20. **Greedy:** Finishes the target if the shortfall is under 30; else 0. **Lazy:** Always adds 5 coins.)*
- **How it resolves:** Subtract your chosen chip-in from your wallet and start the pot at that amount. Each character acts once in listed order, checking the current pot and earlier chip-ins, and adding its exact amount (0 if the target is already met for finishers). After the final character, if `pot >= target`, add the bonus payout to your wallet; otherwise add 0. Your value is your ending coins (using `floor` = worst option's value when wallets keep failed options high).
- **Trap:** Chipping in 0 to free-ride leaves Fair at 0 and keeps the pot below Cautious's threshold so the bridge fails; meanwhile chipping in 40 wastes 20 coins when 20 triggers the exact same funding cascade.
- **Idea:** Seed just enough to start a chain of conditional cooperators.
- **Can vary:** Target cost (50–150), bonus payout (40–100), starting wallet (30–80), the 4 chip-in choices, character order (2–4 characters), caps, and thresholds. Variants change the winning idea: when Show-off and Hero can cover the target without you, free-riding at 0 wins; when the target is unreachable at every option, 0 saves your coins; putting Cautious before Fair forces you to cross Cautious's threshold alone.
- **Scene:** A river gap with a half-built wooden bridge and a clear glass coin jar marked with a red target line; characters drop coins in turn, and hitting the line snaps the bridge shut in a shower of gold.
- **Difficulty range:** Easy: 2 characters (Fair and Hero). Medium: 3 characters with a two-threshold cascade. Hard: 4 characters where order shifts who triggers whom and one option is a tempting near-miss.
- **Rating:** Fun: 4/5, Distinct rounds: 5/5 — Finding the exact minimum seed that sets off a domino chain of cautious allies feels crisp, and swapping thresholds and turn orders yields hundreds of rounds.

### 6. The Pact (family: trust)

- **Story:** You and three neighbours run a four-day market pact. Each day everyone picks Share or Steal at once; once you switch to Steal, you steal every remaining day.
- **Goal:** Earn as many coins as you can across all days. (Higher is better.)
- **Setup:** Four days with Greedy, Fair, and Cautious. Everyone picks Share or Steal together. If you Share: +50 if all share, else 0. If you Steal: +20 per sharing neighbour. Pick the day you switch to Steal.
- **Your choice:** Pick which day you switch from Share to Steal (Day 1, Day 2, Day 3, or Day 4; some variants include Never).
- **Characters and rules:**
  - **Greedy:** Shares Days 1 and 2, then always steals.
  - **Fair:** Shares Day 1; steals forever after anyone steals.
  - **Cautious:** Shares until anyone steals, and always steals on Day 4.
  - *(Variant cast — **Copycat:** Shares Day 1, then copies your move from yesterday. **Show-off:** Shares Day 1, then copies yesterday's majority among others (ties: Steal). **Lazy:** Always shares. **Hero:** Shares until two players steal on one day; then always steals.)*
- **How it resolves:** Simulate Day 1 through Day N. On day `d`, you Share if `d < switchDay`, else Steal; each character picks simultaneously using only moves from days `1` to `d - 1`. If you Shared and all characters Shared, add the all-share reward (50); if you Shared and anyone Stole, add 0; if you Stole, add the steal reward (20) times the count of characters who Shared on day `d`. Your value is the sum across all days.
- **Trap:** Waiting until Day 4 to betray gets you burned on Day 3 when Greedy defects (spoiling your Day-3 share and turning Fair and Cautious hostile on Day 4), while stealing on Day 1 forfeits two high-paying cooperative days.
- **Idea:** Stay loyal while the alliance holds, then defect the exact day a traitor breaks it.
- **Can vary:** Total days (3–6), all-share reward (30–80), steal-per-sharer reward (10–35), optional sucker penalty when you share into a theft, switch-day choices (including Never), and character mix/defection days. Variants change the winning idea: with no early traitor, waiting until the final day (or Never, with a loyalty bonus) wins; with Lazy and a high steal reward, stealing on Day 1 wins.
- **Scene:** A village market square with a 4-day calendar across the top; each day, all players flip Handshake (Share) or Grab (Steal) cards together, coins tally up, and betrayed neighbours scowl.
- **Difficulty range:** Easy: 3 days, 2 characters (Greedy + Copycat). Medium: 4 days, 3 characters with one scheduled defector. Hard: 5 days, 3–4 characters combining Show-off's majority rule and Hero's two-stealer trigger.
- **Rating:** Fun: 4/5, Distinct rounds: 4/5 — Timing a preemptive exit one beat before a pact unravels is a classic repeated-game thrill, with hundreds of schedule and rule combinations.

### 7. Roadblock (family: crowding)

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

### 8. Cake Cut (family: splitting)

- **Story:** A five-slice cake topped with coins sits on a bakery counter. You make one cut, Fair splits the richer half in two, and two characters pick before you get the leftover piece.
- **Goal:** End up with the piece holding the most coins. (Higher is better.)
- **Setup:** Five slices hold 20, 10, 50, 55, 10 coins left to right. Make one cut. Fair halves the richer piece by slices (ties: right; odd: extra slice left). Greedy picks first, Show-off second; you keep the leftover piece.
- **Your choice:** Pick one of the 4 gaps between slices to make Cut 1 (Cut 1, Cut 2, Cut 3, or Cut 4).
- **Characters and rules:**
  - **Fair:** Halves the richer piece by slices (ties: right; odd: extra left).
  - **Greedy:** Takes the piece with the most coins (ties: leftmost).
  - **Show-off:** Takes the piece with the most slices (ties: most coins, leftmost).
  - *(Variant cast — **Lazy:** Takes the leftmost piece remaining. **Loner:** Takes the piece with the fewest slices (ties: most coins, leftmost). **Cautious:** Takes the piece whose smallest slice is highest (ties: leftmost).)*
- **How it resolves:** Your cut splits the cake into Left and Right pieces. Fair selects whichever piece has higher total coins (ties: Right; if that piece has only 1 slice, Fair halves the other piece instead) and splits its `k` slices into `ceil(k/2)` slices on the left and `floor(k/2)` on the right, creating 3 pieces left to right. The first picker takes one piece by its rule; the second picker takes one of the remaining two by its rule; you keep the last piece. Your value is its coin total.
- **Trap:** Cutting down the middle (Cut 2) or right beside the big slices (Cut 4) lets Greedy grab `[50, 55]` and Show-off grab `[20, 10]`, stranding you with `[10]` — whereas Cut 3 makes Fair split off `[50]` as a 1-slice gem that Show-off ignores for bulky `[20, 10]`.
- **Idea:** Slice so rivals grab bulky low-value chunks and leave a dense gem behind.
- **Can vary:** Slice coin values (5–100), cake length (4–6 slices, offering up to 4 cut gaps), Fair's target (richest piece vs. longest piece; extra slice left vs. right), and picker pair/order (Greedy, Show-off, Lazy, Loner, Cautious). Variants change the winning idea: with Loner instead of Show-off, you want a bulky leftover piece; with Lazy picking second, you want the rich piece on the far right.
- **Scene:** A bright layered cake bar on a counter with coin piles on each slice; your knife drops first, Fair's knife makes the second chop, plates slide apart, and Greedy and Show-off snatch theirs before the last plate slides to you.
- **Difficulty range:** Easy: 4 slices with Greedy + Lazy. Medium: 5 slices with Fair's split plus Greedy + Show-off. Hard: 5–6 slices where Fair's richer-piece choice flips between left and right across cuts, or with Loner/Cautious pickers.
- **Rating:** Fun: 5/5, Distinct rounds: 5/5 — Cutting a physical cake while predicting a second cut and two picky eaters is super readable, and slice arrays yield thousands of distinct rounds.

### 9. Roll Call (family: voting)

- **Story:** The town picks one project by public show of hands. You raise your hand first, and each character votes in turn while watching the live tally.
- **Goal:** Get the Park built. Second best: the Pool. (Higher is better.)
- **Setup:** Most votes wins: Mall, Pool, or Park (left to right). Vote first; then Greedy, Loner, Copycat, and Show-off vote in turn, seeing the tally. Leftmost wins ties. Values: Park 100, Pool 50, Mall 0.
- **Your choice:** Vote for one of the 3 (or 4) projects (Mall, Pool, or Park).
- **Characters and rules:**
  - **Greedy:** Always votes Mall.
  - **Loner:** Votes for the choice with the fewest votes (ties: rightmost).
  - **Copycat:** Votes the same as Loner.
  - **Show-off:** Votes for the choice with the most votes (ties: leftmost).
  - *(Variant cast — **Cautious:** Votes its favourite among the top two choices (ties: leftmost). **Fair:** Votes for the choice in second place (ties: leftmost).)*
- **How it resolves:** Start every candidate at 0 votes and add 1 for your chosen candidate. Each character then votes once in listed order using its card rule on the current tally (and prior ballots), adding 1 to its chosen candidate. After the last voter, the candidate with the most votes wins (leftmost breaks ties). Your value is your listed value for the winning project.
- **Trap:** Voting for your favourite (Park) puts Park on the board at 1 vote, so Loner skips Park and backs Pool instead — then Copycat and Show-off pile onto Pool and beat Park.
- **Idea:** Vote away from your favourite so an underdog voter launches a bandwagon for it.
- **Can vary:** Number of candidates (3–4), your preference values, tie-break order, number of voters (3–6), voter order, Copycat's target, and character roster. Variants change the winning idea: when Show-off votes right after you, backing your favourite directly locks in an early bandwagon; when your favourite cannot win, backing your second choice blocks your worst outcome.
- **Scene:** A town-hall stage with coloured project banners and rising live vote bars; each character raises its hand in turn, its badge drops onto a bar, and confetti bursts over the winning banner.
- **Difficulty range:** Easy: 3 candidates, 3 voters (1 reactive rule such as Loner + Show-off). Medium: 3 candidates, 4 voters (Greedy, Loner, Copycat, Show-off). Hard: 4 candidates, 5–6 voters mixing Fair's second-place rule and Cautious's top-two rule.
- **Rating:** Fun: 5/5, Distinct rounds: 5/5 — Deliberately voting against your own favourite to trigger a reverse landslide is immediately memorable, and voter orders and tie-breaks make hundreds of distinct rounds.

### 10. Three Towers (family: conflict)

- **Story:** Three castle towers hold gold, silver, and bronze treasure. You station your guards first; then Greedy and Loner deploy their guards to capture towers.
- **Goal:** Win the highest total treasure from the towers. (Higher is better.)
- **Setup:** Towers hold 55, 45, and 35 coins. Deploy 7 guards first; then Greedy (6) and Loner (2) deploy in turn. Most guards wins a tower. Ties go to you if you stationed at least 1 guard; 0 wins nothing.
- **Your choice:** Pick one of 4 guard formations summing to your budget (for example: `4 / 2 / 1`, `6 / 1 / 0`, `5 / 1 / 1`, or `3 / 2 / 2`).
- **Characters and rules:**
  - **Greedy:** Checks towers richest first; spends just enough to beat each it can.
  - **Loner:** Puts all guards on the tower with fewest total guards (ties: richest).
  - *(Variant cast — **Show-off:** Puts all guards on the tower with most total guards (ties: richest). **Cautious:** Splits guards evenly across towers, extra guards left to right. **Lazy:** Puts all guards on the leftmost tower.)*
- **How it resolves:** Place your guards on the three towers according to your chosen formation. Each character deploys once in listed order using its rule (to beat a tower where the highest single player has `m` guards, Greedy must place `m + 1` guards; unspent guards stay off the board). On each tower, find the highest single-player guard count: if it is 0, nobody wins; if you hold or tie that positive maximum, you win the tower's coins (other ties go to the earlier player). Your value is the sum of coins from towers you win.
- **Trap:** Spreading guards in proportion to tower values (`4 / 2 / 1`) lets Greedy capture Gold with 5 while leaving Bronze with 1 guard for Loner to snipe, whereas `3 / 2 / 2` sacrifices Gold cheaply (draining 4 of Greedy's 6 guards) and double-guards both flanks so Loner bounces off your tie-break.
- **Idea:** Bait a rival to overspend on one tower so you hold the flanks.
- **Can vary:** Tower values (10–100), number of towers (3–4), guard budgets for you and each rival (2–12), formation options, tie-break rule (defender wins ties vs. split ties), and rival mix (Greedy, Loner, Show-off, Cautious, Lazy). Variants change the winning idea: when your guards outnumber Greedy's, fortifying Gold (`6 / 1 / 0`) wins; when Show-off joins Greedy on Gold, abandoning Gold (`0 / 4 / 3`) sweeps the other two towers.
- **Scene:** Three cartoon castle towers flying coin banners; your knights march into position first, then Greedy's and Loner's knights rush their chosen towers, and winning flags hoist with trumpets.
- **Difficulty range:** Easy: 3 towers and 1 rival (Greedy alone). Medium: 3 towers and 2 rivals (Greedy + Loner). Hard: 4 towers or 3 rivals where Show-off and Loner react to Greedy's deployment.
- **Rating:** Fun: 5/5, Distinct rounds: 5/5 — Outsmarting a stronger-looking force by pricing a sacrifice tower right delivers pure Colonel Blotto tactics, with massive formation and budget variety.

---

## Fully worked example round: Two Lots

We choose **Two Lots** (`bidding`) because it fills a brand-new family absent from the demo, uses clean two-digit arithmetic solvable in under a minute, requires no custom scoring floor, and gives every option a completely distinct strategic story.

### 1. Round data

```ts
{
  index: 1,
  type: 'two_lots',
  difficulty: 'medium',
  timeLimitMs: 180000,
  params: {
    lots: [
      { id: 'vase', name: 'Vase', value: 30 },
      { id: 'crown', name: 'Crown', value: 90 },
    ],
    order: ['you', 'cautious', 'showoff'],
    wallets: { you: 60, cautious: 30, showoff: 90 },
    bids: [0, 20, 45, 50],
  },
  characters: [
    { id: 'cautious', ruleKey: 'openIfNone', ruleArgs: { bid: 15 } },
    { id: 'showoff', ruleKey: 'raiseIfAtMost', ruleArgs: { step: 10, max: 55 } },
  ],
}
```

### 2. Player-facing text

- **Goal:** End with the highest total of coins and prizes. *(9 words; higher is better.)*
- **Setup:** Vase (30) sells, then Crown (90). Coins: you 60, Cautious 30, Show-off 90. Bid in order on Vase; top bid wins and pays. On Crown, richest left wins, paying runner-up's coins. Earlier player wins ties; nobody exceeds their coins. *(39 words.)*
- **Character cards:**
  - **Cautious:** Bids 15 if nobody has bid yet; otherwise passes. *(9 words.)*
  - **Show-off:** If someone bid, bids 10 higher when that is 55 or less. *(12 words.)*
- **Option labels:**
  - `Pass` — `bid 0 on Vase`
  - `Bid 20` — `on Vase (worth 30)`
  - `Bid 45` — `on Vase (worth 30)`
  - `Bid 50` — `on Vase (worth 30)`

### 3. Every option: step-by-step result, value, and quality

Scoring uses `betterIs: 'higher'` and default `floor = 0`, so `quality = value / 115`.

| Option | Step-by-step result | Value | Quality |
|---|---|---:|---:|
| **Pass (0)** *(Trap)* | **Lot 1 (Vase, 30):** You pass (0). Cautious sees no bid and bids 15. Show-off raises by 10 to 25 (≤ 55). Show-off wins the Vase and pays 25. Wallets left: You 60, Cautious 30, Show-off 65.<br>**Lot 2 (Crown, 90):** Show-off has the most coins (65), wins the Crown, and pays runner-up's 60. You win neither lot and keep your 60 coins. | **60** | **0.522** |
| **Bid 20** | **Lot 1 (Vase, 30):** You bid 20. Cautious passes (someone bid). Show-off raises to 30 (≤ 55), wins the Vase, and pays 30. Wallets left: You 60, Cautious 30, Show-off 60.<br>**Lot 2 (Crown, 90):** You and Show-off tie at 60. Earlier player wins ties, so you win the Crown and pay runner-up Show-off's 60 coins: `0 + 90 = 90`. | **90** | **0.783** |
| **Bid 45** *(Best)* | **Lot 1 (Vase, 30):** You bid 45. Cautious passes. Show-off raises to 55 (≤ 55), wins the Vase, and pays 55. Wallets left: You 60, Cautious 30, Show-off 35.<br>**Lot 2 (Crown, 90):** You are richest (60), win the Crown, and pay runner-up Show-off's 35 coins: `25 + 90 = 115`. | **115** | **1.000** |
| **Bid 50** | **Lot 1 (Vase, 30):** You bid 50. Cautious passes. Show-off checks `50 + 10 = 60 > 55` and passes! You win the Vase and pay 50. Wallets left: You 10, Cautious 30, Show-off 90.<br>**Lot 2 (Crown, 90):** Show-off is richest (90), wins the Crown, and pays Cautious's 30. You end with 10 coins plus the 30-coin Vase: `10 + 30 = 40`. | **40** | **0.348** |

### 4. Best option, trap, and post-round explanation

- **Best option:** **Bid 45** (value **115**, quality **1.000**).
- **Trap (obvious option):** **Pass (0)** (value **60**, quality **0.522** ≤ 0.6).
- **Checks:** Unique best (`115`), next best quality **0.783** (≤ 0.8), obvious option quality **0.522** (≤ 0.6).
- **Best:** Overbid the 30-coin Vase at 45 on purpose: Show-off jumps to 55 and drains its wallet to 35, leaving you free to win the 90-coin Crown for only 35 coins. Bid 50 and Show-off folds, sticking you with an overpriced Vase.

### 5. Proof (solver script output)

Computed by a throwaway Node script outside the project (`/tmp/verify_two_lots.mjs`) implementing the exact rules above:

```text
Pass(0) -> Vase:showoff(25), Crown:showoff(60) => value=60, quality=0.522
Bid(20) -> Vase:showoff(30), Crown:you(60) => value=90, quality=0.783
Bid(45) -> Vase:showoff(55), Crown:you(35) => value=115, quality=1.000
Bid(50) -> Vase:you(50), Crown:showoff(30) => value=40, quality=0.348
Checks: uniqueBest=true, nextBest=0.783<=0.8, obvious=0.522<=0.6
```
