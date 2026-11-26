# Auction Booth

- **id:** `auction-booth`
- **Family:** bidding
- **Source:** GPT-6.2 Sol (high) proposal, 2026-11-25. Original: `docs/proposals/gpt-6.2-sol.md`.
- **Status:** see `content/catalog.json`

- **Story**  
  At a fairground booth, you sell entry to a toy auction.
- **Goal**  
  Collect the most coins from the sale. Higher is better.
- **Setup**  
  Pick the public entry fee. Entrants pay it, then reveal bids together. High bidder wins and pays the other bid, or zero when alone. Greedy wins ties. With no entrants, sell for 2.
- **Your choice**  
  Set the fee at 3, 8, or 23 coins.
- **Characters and rules**
  - Greedy — Enters if fee fits its 22-coin budget, then bids what’s left.
  - Cautious — Enters if fee fits its 10-coin budget, then bids what’s left.
- **How it resolves**  
  A bidder enters if its budget covers the fee exactly or with coins left over. Collect that fee from each entrant, including the loser. Rank the remaining balances as bids, with Greedy first on ties. Collect the losing bid when both enter, zero when one enters, or the fallback sale price when neither enters. Your value is all coins collected.
- **Trap**  
  The highest fee sends both buyers away, so you collect only 2 coins.
- **Idea**  
  Charge for entry without losing competition.
- **Can vary**  
  Set Greedy’s budget to 14–28, Cautious’s to 5–16, the fallback sale to 1–8, and three distinct fees from 0–30. Allow fees equal to either budget. A fee both can pay adds a losing bid to your take. A high fee can win with one entrant who can cover it, tagged “Sell one expensive seat.” If the fallback pays more than two low fees plus the losing bid, tag it “Keep the fallback sale.”
- **Scene**  
  Flip the fee sign, show buyers stepping through or walking away, and put entry coins and bid coins into separate jars.
- **Difficulty range**  
  Easy when the fee choices divide cleanly into two, one, and zero entrants. Medium near both budget limits, where a zero bid can still earn you an entry fee.
- **Rating**  
  Fun 4/5 · Round variety 4/5. The fee changes who can bid, so a cheaper ticket can make the sale pay more.
