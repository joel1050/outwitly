import type { PuzzleType } from '../engine/types';

/**
 * Every game type lives in its own folder, src/games/<id>/, and is found here
 * automatically: logic.ts must default-export the PuzzleType, and the folder
 * name must match its id. Nothing else needs registering.
 */
const modules = import.meta.glob<PuzzleType>('./*/logic.ts', { eager: true, import: 'default' });

export const PUZZLES: Record<string, PuzzleType> = Object.fromEntries(
  Object.entries(modules).map(([path, p]) => {
    const folder = path.split('/')[1];
    if (p.id !== folder) throw new Error(`src/games/${folder}/logic.ts has id '${p.id}'; it must match the folder name`);
    return [p.id, p];
  }),
);
