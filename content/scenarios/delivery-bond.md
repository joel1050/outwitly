# Delivery Bond

- **id:** `delivery-bond`
- **Family:** trust
- **Source:** GPT-6.2 Sol (high) proposal, 2026-11-25. Original: `docs/proposals/gpt-6.2-sol.md`.
- **Status:** see `content/catalog.json`

- **Story**  
  You hire Greedy to carry a coin parcel past the market gate.
- **Goal**  
  Keep the most coins from the deal. Higher is better.
- **Setup**  
  Parcel holds 14 coins. Greedy has 12. Show a bond for Greedy to post and a fee. Delivery refunds the bond and earns you 24 minus fee. Theft gives Greedy the parcel and you the bond. Decline earns you 6.
- **Your choice**  
  Ask for a bond of 0, 10, or 13 coins, with a delivery fee of 5, 4, or 2 respectively. Show each bond and fee together. A bond is coins Greedy hands over before carrying the parcel.
- **Characters and rules**
  - Greedy — Declines unaffordable bonds, otherwise posts bond and maximizes profit, delivering on ties.
- **How it resolves**  
  If Greedy’s wallet is below the bond, use the fallback sale value. Otherwise Greedy posts the bond. Delivery earns Greedy the fee and returns its posted coins, so its profit is the fee. Theft earns it the parcel contents but costs the bond, so its profit is contents minus bond. Compare the two, deliver on equality, and score your payout as gross delivery minus fee, forfeited bond, or fallback sale.
- **Trap**  
  The largest bond offers the cheapest delivery on paper, but Greedy cannot post it.
- **Idea**  
  Set a bond the courier can afford.
- **Can vary**  
  Use parcel contents of 7–18, courier wallets of 4–18, gross delivery of 16–30, fallback sales of 1–10, and three or four contracts with bonds of 0–20 and fees of 1–15. Keep fees at most gross delivery. Include ties, contracts with low bonds and higher fees, and bonds that yield more on theft than smaller delivered contracts. When a wage is the cheapest way to meet Greedy’s threshold, tag it “Pay for the behavior you want.”
- **Scene**  
  Put the bond on the counter. Greedy walks to the delivery gate, runs off with the parcel, or shakes its head.
- **Difficulty range**  
  Easy when only one bond is affordable and makes delivery pay. Medium when several contracts deliver or a stolen parcel still pays a bond.
- **Rating**  
  Fun 5/5 · Round variety 5/5. The same character can deliver, steal, or refuse, and either side of the contract can settle the choice.
