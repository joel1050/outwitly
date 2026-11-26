# Outwitly

A daily browser game of short game-theory puzzles. Read the cards, outthink the characters.

Live: https://joel1050.github.io/outwitly/

```
npm install
npm run dev                  # http://localhost:5173
npm test                     # solvers, scoring, every stored round, the schedule and the catalogue
npm run rounds -- <filter>   # check report for rounds whose id or type matches
npm run build                # dist/index.html, a single self-contained file
```

## Layout

- `src/games/<id>/` – one folder per game type: `logic.ts` (rules and exact solver) and `scene.ts` (SVG animation). Found automatically.
- `src/engine/` – shared engine: characters and their rules, scoring, the content loader and the round checks.
- `src/render/` – the animation kit: stage, characters, effects, sound. See `docs/animation-kit.md`.
- `src/ui/` – screens, timer, results, local storage.
- `content/` – everything that isn't code:
  - `catalog.json` – every scenario and its status (live, approved, proposed, rejected).
  - `scenarios/<id>.md` – one spec sheet per scenario.
  - `rounds/<type>/<id>.json` – one file per round.
  - `schedule.json` – which rounds play on which day.
- `docs/puzzle-guide.md` – how the game works, what makes a good round, and how to make rounds and game types.

Not built yet: backend, real crowd stats (the pick percentages and bell curve are made up and labelled so), round generators.
