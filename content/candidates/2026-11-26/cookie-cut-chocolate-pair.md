# Two Trays of Trouble

- **Difficulty:** easy
- **Scenario:** cookie-cut (content/scenarios/cookie-cut.md)
- **Idea tag:** keep-the-small-sweet-tray
- **Written by:** GPT-6.2 Sol
- **Changes from the scenario sheet:**
  - Use eight cookies, with the two leftmost chocolate and worth 3 points each. Offer cuts after cookies 1, 3, and 4.

## What the player sees

**Goal:** Keep the cookies worth the most points.

**Setup:** Cut a row of eight cookies into two trays. The two leftmost are chocolate, worth 3 points each. Plain cookies are worth 1 each. Greedy takes one tray and leaves you the other.

**Cards:**

- Greedy: Takes the tray with more cookies, the left tray on ties.

**Options:**

1. Cut after 1 — Leave one chocolate cookie on the left.
2. Cut after 3 — Leave three cookies on the left.
3. Cut after 4 — Put four cookies on each tray.

## After the round

- Cut after 1: Greedy grabs seven cookies and leaves you one chocolate cookie worth 3 points.
- Cut after 3: Greedy grabs five plain cookies and leaves you both chocolates and a plain cookie for 7 points.
- Cut after 4: Greedy takes the left tray on the tie, leaving you four plain cookies worth 4 points.

**Best:** Cut after 3. Greedy grabs the tray with five cookies, so you keep both chocolates and a plain cookie.

## How to solve it

1. Greedy compares tray sizes. It takes the right tray on the first two cuts and the left tray on the even cut.
2. Count points on the tray you keep. One chocolate gives you 3, two chocolates and a plain give you 7, and four plains give you 4.

## Why the other options lose

**Cut after 1** guarantees a chocolate cookie, but the second chocolate goes with Greedy’s big haul, so you get only 3 points.

**Cut after 4** is the trap. An even split looks like it secures four cookies, but Greedy takes the left tray on the tie and leaves you the four plain ones.

## Numbers

| Option | Value | Quality | |
| --- | ---: | ---: | --- |
| Cut after 1 | 3 | 3/7 ≈ 0.4286 | |
| Cut after 3 | 7 | 1 | ★ |
| Cut after 4 | 4 | 4/7 ≈ 0.5714 | ⚠ |

- ✓ 3 options, within the 2–4 limit.
- ✓ 1 best option at 7 points. The runner-up earns 4/7 ≈ 0.5714, below 0.8.
- ✓ The even cut earns 4/7 ≈ 0.5714, below the 0.6 trap limit.
- ✓ Goal 7 words, setup 33 words, Greedy’s card 11 words. The card has no bracketed notes.
- ✓ The counts determine a single tray for Greedy on every cut. The 4–4 tie goes left. All cookie values and the order of play are visible.
- ✓ All three cuts leave different trays, worth 3, 7, and 4 points.
- ✓ Easy within 3 minutes. Predict 1 Greedy pick per cut and count at most 4 cookies on your tray.

## Draft round data

```json
{
  "id": "cookie-cut-chocolate-pair",
  "type": "cookie-cut",
  "difficulty": "easy",
  "idea": "keep-the-small-sweet-tray",
  "status": "draft",
  "source": "hand",
  "params": {
    "cookiePoints": [3, 3, 1, 1, 1, 1, 1, 1]
  },
  "characters": [
    { "id": "greedy", "ruleKey": "takeMostCookies", "ruleArgs": { "tieBreak": "left" } }
  ],
  "options": { "cut1": 1, "cut3": 3, "cut4": 4 }
}
```

## Proof

```text
cookie-cut-chocolate-pair
Cut after 1: Greedy takes right tray of 7; you keep [3] | value 3 | quality 3/7
Cut after 3: Greedy takes right tray of 5; you keep [3, 3, 1] | value 7 | quality 1
Cut after 4: Greedy takes left tray of 4; you keep [1, 1, 1, 1] | value 4 | quality 4/7
Words: goal 7, setup 33, cards 11
```
