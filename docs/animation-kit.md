# Animation kit

Every game type has one scene: `src/games/<id>/scene.ts`, a subclass of `Stage` that draws the place and plays the round. The logic never touches the screen. It returns a list of **timeline events** (`Outcome.events`), and the scene plays them in order. The kit below covers what all scenes share, so a new scene only draws its own place and the few events nobody else has.

## How a scene plays a round

1. `build()` draws the background, props and characters. The canvas is 400 × 300 (`W`, `H`).
2. `intro()` fades in the background, drops in the props, and pops in each character, who then idles and blinks.
3. While the player decides, `preview(optionId)` highlights what an option would do, and `looks(optionId)` turns the characters' eyes toward it.
4. When the player picks, `play(outcome)` runs the events one by one through `handle(ev)`. A run of emotes plays together.
5. `markBest(optionId)` shows the best move afterwards (by default, the preview highlight in gold).

## Writing a scene

```ts
import { Stage } from '../../render/stage';
import type { TimelineEvent } from '../../engine/types';
import { myGame as logic } from './logic';

export class MyGameStage extends Stage {
  protected build() {
    // Draw into this.bg (background), this.props (things that pop in), then add characters.
    this.svg.setAttribute('aria-label', logic.setup(this.round));
    this.addActor('you', 80, 250);
    this.addActor('greedy', 200, 250);
  }

  preview(optionId: string | null) {
    this.clearPreview();
    if (optionId) this.ring(this.previewLayer, 200, 150, 40, 14);
  }

  // Where named places are, so the shared 'move' event can walk characters there.
  protected spot(id: string): [number, number] | undefined {
    return { left: [100, 200], right: [300, 200] }[id] as [number, number] | undefined;
  }

  protected async handle(ev: TimelineEvent) {
    switch (ev.t) {
      case 'open': /* something only this scene draws */ break;
      default: await super.handle(ev); // emote, say, move, payout
    }
  }
}

export default MyGameStage;
```

The default export is what registers the scene; the folder name is the game type.

## Layers

Draw into the right layer so things stack correctly:

| Layer | Use |
|---|---|
| `bg` | Sky, ground, walls. Fades in first. |
| `props` | Chests, signs, levers. Each child drops in during the intro. |
| `previewLayer` | Highlights while the player decides. Cleared by `clearPreview()`. |
| `actorLayer` | Characters. `sortActors()` keeps nearer ones (larger y) in front. |
| `fx` | Coins, splashes, tags: anything that flies or pops during play. |
| `hud` | Banners across the top, above everything. |

## Events

The event list is shared by all game types (`TimelineEvent` in `src/engine/types.ts`). Reuse an event before adding a new one.

**The base `Stage` plays these for every scene:**

| Event | What you see |
|---|---|
| `emote` (`cheer`, `sulk`, `shock`, `smug`, `think`) | Face and pose change; `think` shows a thought bubble. |
| `say` | Speech bubble over the character. |
| `move` | The character walks to `spot(to)`, if the scene defines that spot. |
| `payout` | A `+N` tag pops over the character's head, with a coin sound. |

**Scene-specific events in use:** `open` (chest lid), `split`, `vote`, `tally`, `plank` (pirates), `lever`, `heading`, `trolley` (junction), `matchup`, `ballot`, `winner` (agenda), `throw` (duel). A scene may also handle a shared event itself, for example to send coins flying to a chest instead of showing a tag.

## Building blocks

**Characters** (`src/render/actor.ts`): `this.addActor(id, x, y, scale?)` returns an `Actor`:

| Method | Does |
|---|---|
| `moveTo(x, y)` | Waddles to a point. |
| `emote(e, note?)` | Plays an emote; `note` is the text of a thought bubble. |
| `bubble(text, 'say' \| 'think', seconds)` | Speech or thought bubble. |
| `lookAt(x, y)` | Turns the eyes toward a point. |
| `setMouth(shape)`, `setLids(level)` | Face details. |
| `headY` | Top of the head, for placing bubbles and tags. |

Every character in `src/engine/characters.ts` already has art (`drawCharacter`) and a small `portrait()` for cards.

**Effects** (`src/render/fx.ts`): `coinArc` (coins fly from A to B), `tag` (a counting number pill), `burst`, `confetti`, `sparkle`, `splash`, `dust`, `shake`.

**Stage helpers** (`src/render/stage.ts`): `banner(text, 'good' | 'bad' | 'info', hold?)`, `ring(...)` (dashed gold ring), `label(...)` (pill label), `clearPreview()`.

**SVG** (`src/render/svg.ts`): `s(tag, attrs, parent)` makes an element, `text(...)` places text, `wait(seconds)` pauses, `OUTLINE` is the outline colour, `reducedMotion()` says whether to keep motion small.

**Sound** (`src/render/audio.ts`): `sfx(name)`, for example `pop`, `coin`, `clunk`, `swish`, `whoosh`, `ballot`, `drop`, `ding`, `cheer`, `fail`. Sounds are made in code; there are no audio files.

## Rules of thumb

- Never put a round's numbers in the scene by hand. Read them from `this.round` (params and `characters[i].ruleArgs`), because hand-made rounds change them.
- Keep every event under about a second, and the whole result under about 8 seconds.
- Respect `reducedMotion()`: fade instead of fly.
- Use the theme's CSS classes and `OUTLINE`, not fixed colours, so dark mode works.
