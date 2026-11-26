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
  goal: () => 'The trolley hits as few people as possible.',
  setup: (r) => {
    const { exits: e, routing } = r.params;
    const n = (k: string) => `${e[k]} ${e[k] === 1 ? 'person' : 'people'}`;
    // Built from the routing, so the text always matches how the levers work.
    return `A trolley is heading ${routing[0]} for ${n(routing[0])}. The left track has ${n('left')}, the right track ${n('right')}. You and Hero each have a lever. One pull sends it ${routing[1]}; two send it ${routing[2]}. Hero decides after you.`;
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
      optionId === 'pull' ? `You pulled, aiming it left at ${exits.left} people. Hero pulled too, so it went ${heading}.`
      : optionId === 'leave' ? `You left it heading straight at ${exits.straight} people. ${heroPulled ? `Hero pulled and sent it ${heading}.` : 'Hero did nothing.'}`
      : `You jammed Hero’s lever, so nobody could pull. It went ${heading}.`;
    return { value: hit, valueLabel: `${hit} ${hit === 1 ? 'person' : 'people'} hit`, events, summary: `${what} ${hit} hit.` };
  },
  obviousOptionId: () => 'leave',
  explain: () =>
    'Aim it at six on purpose: Hero always pulls when more than two are in danger, and two pulled levers send it right, where only one stands.',
};
