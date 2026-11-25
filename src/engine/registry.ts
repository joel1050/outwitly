import { agenda } from './puzzles/agenda';
import { chests } from './puzzles/chests';
import { duel } from './puzzles/duel';
import { junction } from './puzzles/junction';
import { pirates } from './puzzles/pirates';
import type { PuzzleType } from './types';

export const PUZZLES: Record<string, PuzzleType> = { chests, junction, pirates, agenda, duel };
