import { CHARACTERS, leadingProject, rule, type ProjectVoteCtx } from '../../engine/characters';
import { listJoin } from '../../engine/text';
import type { PuzzleType, TimelineEvent } from '../../engine/types';

export interface RollCallParams { projects: string[]; yourValues: Record<string, number>; explanation?: string }

const preferences = ({ projects, yourValues }: RollCallParams) =>
  [...projects].sort((a, b) => yourValues[b] - yourValues[a]);

const rollCall: PuzzleType<RollCallParams> = {
  id: 'roll-call',
  family: 'voting',
  title: 'Roll Call',
  betterIs: 'higher',
  goal: ({ params }) => {
    const [first, second] = preferences(params);
    return `Get the ${first} built. Second best: the ${second}.`;
  },
  setup: ({ params: { projects }, characters }) => {
    const n = projects.length === 3 ? 'Three' : 'Four';
    const names = characters.map((c) => CHARACTERS[c.id].name);
    return `${n} projects stand left to right: ${projects.join(', ')}. You vote first, then ${listJoin(names)}, and each sees the votes so far. The most votes wins; the leftmost wins a tie.`;
  },
  options: ({ params: { projects } }) => projects.map((project) => ({ id: project, label: `Vote ${project}` })),
  resolve({ params: { projects, yourValues }, characters }, optionId) {
    const ctx: ProjectVoteCtx = {
      projects,
      tally: Object.fromEntries(projects.map((project) => [project, 0])),
      ballots: {},
    };
    const events: TimelineEvent[] = [];
    const countVote = (actor: string, choice: string) => {
      if (!Object.hasOwn(ctx.tally, choice)) throw new Error(`${actor} voted for unknown project '${choice}'`);
      ctx.ballots[actor] = choice;
      ctx.tally[choice]++;
      events.push({ t: 'ballot', actor, choice, tally: { ...ctx.tally } });
    };
    countVote('you', optionId);
    for (const c of characters) countVote(c.id, rule(c.id, c.ruleKey)(c.ruleArgs, ctx));

    const winner = leadingProject(projects, ctx.tally);
    const value = yourValues[winner];
    events.push({ t: 'project-winner', winner, tally: ctx.tally });
    const top = Math.max(...Object.values(yourValues));
    const bottom = Math.min(...Object.values(yourValues));
    events.push({ t: 'emote', actor: 'you', emote: value === top ? 'cheer' : value === bottom ? 'sulk' : 'think' });
    for (const c of characters) {
      events.push({ t: 'emote', actor: c.id, emote: ctx.ballots[c.id] === winner ? 'cheer' : 'sulk' });
    }
    const totals = listJoin(projects.map((project) => `${project} ${ctx.tally[project]}`));
    return {
      value,
      valueLabel: `${winner} built`,
      events,
      summary: `You voted for ${optionId}. The final tally was ${totals}, so ${winner} gets built.`,
    };
  },
  obviousOptionId: ({ params }) => preferences(params)[0],
  explain: (r, bestId) => r.params.explanation ?? rollCall.resolve(r, bestId).summary,
};

export default rollCall;
