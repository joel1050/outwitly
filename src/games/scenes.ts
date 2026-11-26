import type { Round } from '../engine/types';
import type { Stage } from '../render/stage';

type StageClass = new (r: Round, c: HTMLElement) => Stage;

/** Each src/games/<id>/scene.ts default-exports its Stage class. Kept apart from the
 *  logic registry so tests and tools can grade rounds without loading any DOM code. */
const modules = import.meta.glob<StageClass>('./*/scene.ts', { eager: true, import: 'default' });

const STAGES: Record<string, StageClass> = Object.fromEntries(
  Object.entries(modules).map(([path, cls]) => [path.split('/')[1], cls]),
);

export function createStage(round: Round, container: HTMLElement): Stage {
  const Cls = STAGES[round.type];
  if (!Cls) throw new Error(`no scene for game type '${round.type}'`);
  return new Cls(round, container).mount();
}
