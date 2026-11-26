# Chip In

- **id:** `chip-in`
- **Family:** trust
- **Source:** Gemini 4 Neon (xhigh) proposal, 2026-11-25. Original: `docs/proposals/gemini-4-neon.md`.
- **Status:** see `content/catalog.json`

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
