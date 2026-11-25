# Outwitly (one-day demo)

A playable demo of the sample day from the spec: Chests, Junction, Pirates, Agenda and Duel.

```
npm install
npm run dev      # http://localhost:5173
npm test         # engine checks against the spec's appendix fixtures
npm run build    # dist/index.html, a single self-contained file
```

- `src/engine` – pure TypeScript: character rules (card text comes from the same entry), the five solvers, scoring. The Duel uses exact fractions.
- `src/render` – SVG characters and scenes animated with GSAP, synthesized sound.
- `src/ui` – screens, timer, results, end screen, local storage.

Not in the demo: backend, real crowd stats (the pick percentages and bell curve are made up and labelled so), groups, tutorial round, generator.
