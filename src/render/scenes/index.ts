import type { Round } from '../../engine/types';
import type { Stage } from '../stage';
import { AgendaStage } from './agenda';
import { ChestsStage } from './chests';
import { DuelStage } from './duel';
import { JunctionStage } from './junction';
import { PiratesStage } from './pirates';

const STAGES: Record<string, new (r: Round, c: HTMLElement) => Stage> = {
  chests: ChestsStage,
  junction: JunctionStage,
  pirates: PiratesStage,
  agenda: AgendaStage,
  duel: DuelStage,
};

export function createStage(round: Round, container: HTMLElement): Stage {
  return new STAGES[round.type](round, container).mount();
}
