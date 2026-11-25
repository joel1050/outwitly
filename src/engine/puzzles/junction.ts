import { rule } from '../characters';
import type { PuzzleType, TimelineEvent } from '../types';

export interface JunctionParams {
  exits: Record<string, number>;
  /** number of pulled levers -> exit */
  routing: Record<string, string>;
}

export const junction: PuzzleType<JunctionParams> = {
  id: 'junction',
  family: 'trust',
  title: 'Junction',
  betterIs: 'lower',
  setup: (r) => {
    const e = r.params.exits;
    return `A trolley is coming. One lever pulled sends it left; both send it right; neither, straight. Straight: ${e.straight}. Left: ${e.left}. Right: ${e.right}. Hero acts after you.`;
  },
  options: () => [
    { id: 'pull', label: 'Pull', detail: 'your lever' },
    { id: 'leave', label: 'Leave', detail: 'do nothing' },
    { id: 'jam', label: 'Jam', detail: 'Hero’s lever' },
  ],
  resolve(r, optionId) {
    const { exits, routing } = r.params;
    const hero = r.characters[0];
    const events: TimelineEvent[] = [];
    let pulled = 0;
    const heroJammed = optionId === 'jam';
    if (optionId === 'pull') pulled++;
    events.push({ t: 'lever', actor: 'you', state: optionId === 'pull' ? 'pulled' : 'left' });
    if (heroJammed) events.push({ t: 'lever', actor: hero.id, state: 'jammed' });
    let heading = routing[String(pulled)];
    events.push({ t: 'heading', exit: heading });

    let heroPulled = false;
    if (heroJammed) {
      events.push({ t: 'emote', actor: hero.id, emote: 'shock' });
    } else {
      const wants = rule(hero.id, hero.ruleKey)(hero.ruleArgs, { heading: exits[heading] });
      events.push({ t: 'emote', actor: hero.id, emote: 'think' });
      if (wants) {
        heroPulled = true;
        pulled++;
        events.push({ t: 'lever', actor: hero.id, state: 'pulled' });
        heading = routing[String(pulled)];
        events.push({ t: 'heading', exit: heading });
      } else {
        events.push({ t: 'lever', actor: hero.id, state: 'left' });
      }
    }
    events.push({ t: 'trolley', path: heading });
    const hit = exits[heading];
    events.push({ t: 'emote', actor: 'you', emote: hit <= 1 ? 'cheer' : hit >= 5 ? 'shock' : 'sulk' });
    events.push({ t: 'emote', actor: hero.id, emote: hit <= 1 ? 'smug' : 'shock' });

    const what =
      optionId === 'pull' ? `You pulled, aiming it left at ${exits.left}. Hero pulled too, so it went ${heading}.`
      : optionId === 'leave' ? `You left it heading straight at ${exits.straight}. ${heroPulled ? `Hero pulled and sent it ${heading}.` : 'Hero did nothing.'}`
      : `You jammed Hero’s lever, so nobody could pull. It went ${heading}.`;
    return { value: hit, valueLabel: `${hit} ${hit === 1 ? 'person' : 'people'} hit`, events, summary: `${what} ${hit} hit.` };
  },
  obviousOptionId: () => 'leave',
  explain: () =>
    'Aim it at six on purpose: Hero always pulls when more than two are in danger, and two pulled levers send it right, where only one stands.',
};
