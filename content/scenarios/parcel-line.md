# Parcel Line

- **id:** `parcel-line`
- **Family:** trust
- **Source:** GPT-6.2 Sol (high) proposal, 2026-11-25. Original: `docs/proposals/gpt-6.2-sol.md`.
- **Status:** see `content/catalog.json`

- **Story**  
  Two inspectors check a line of parcels before the cart leaves.
- **Goal**  
  Keep the most coins after damage charges. Higher is better.
- **Setup**  
  Pick inspectors. Each sees the remaining line. Ship survivors. Sound parcels earn listed fees. Cracked ones cost 12. Left to right, parcels are uneven and sound (3), even and cracked, then even and sound (15).
- **Your choice**  
  Send Cautious alone, Cautious then Fair, or Fair then Cautious. Each parcel shows whether its fee split between senders is even. The listed fee is your own revenue.
- **Characters and rules**
  - Cautious — Checks one parcel from the front if present, rejecting cracks.
  - Fair — Checks one parcel from the front if present, rejecting uneven splits.
- **How it resolves**  
  Each inspector checks a snapshot of the first displayed number of parcels still in line, or all of them if fewer. Remove all parcels it rejects, preserve the survivors’ order, and pass that new line to the next inspector. Add the fees for the sound shipments and subtract the damage charge per cracked shipment. A removed parcel earns nothing and costs nothing. For a limit of two or three, the card says “Rejects cracked parcels among the first 2 remaining parcels” or “Rejects uneven splits among the first 2 remaining parcels,” with the actual limit.
- **Trap**  
  Putting Cautious first sounds safest, but it spends its only check on the sound parcel at the front.
- **Idea**  
  Clear space for the right inspector.
- **Can vary**  
  Use three to five parcels with sound fees of 1–20, two independent flags per parcel, damage charges of 3–15, and inspection limits of 1–3. Keep all offered values nonnegative. Vary which flag comes first and whether uneven parcels are worth keeping. Sometimes Cautious alone handles the cracked goods and keeps extra paid parcels, tagged “Skip the costly extra check.” Sometimes Cautious must remove a cracked head parcel first so Fair can see past it.
- **Scene**  
  Stamp a parcel and slide it off the table. The rest move forward one spot, then the cart takes the survivors.
- **Difficulty range**  
  Easy with three parcels and one check per inspector. Medium when a pass covers several parcels.
- **Rating**  
  Fun 4/5 · Round variety 5/5. Removing a parcel changes what the next inspector can reach, so ordering the same helpers can change the shipment.
