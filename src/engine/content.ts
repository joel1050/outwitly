import schedule from '../../content/schedule.json';
import type { DailySet, Round, RoundFile } from './types';

/**
 * Loads the stored content: every round in content/rounds/<type>/<id>.json and
 * the calendar in content/schedule.json (date -> round ids, in play order).
 */

export const DEFAULT_TIME_LIMIT_MS = 180_000;

const files = import.meta.glob<RoundFile>('../../content/rounds/*/*.json', { eager: true, import: 'default' });

export const ROUND_FILES: Record<string, RoundFile> = {};
for (const [path, f] of Object.entries(files)) {
  const [type, name] = path.split('/').slice(-2);
  const id = name.replace(/\.json$/, '');
  if (f.id !== id) throw new Error(`${path}: id '${f.id}' must match the file name`);
  if (f.type !== type) throw new Error(`${path}: type '${f.type}' must match the folder name`);
  if (ROUND_FILES[id]) throw new Error(`duplicate round id '${id}'`);
  ROUND_FILES[id] = f;
}

/** [date, round ids] in date order. A day's puzzle number is its position here. */
export const SCHEDULE: [string, string[]][] = Object.entries(schedule as Record<string, string[]>)
  .sort(([a], [b]) => a.localeCompare(b));

export function toRound(f: RoundFile, index: number): Round {
  return {
    id: f.id,
    index,
    type: f.type,
    difficulty: f.difficulty,
    timeLimitMs: f.timeLimitMs ?? DEFAULT_TIME_LIMIT_MS,
    params: f.params,
    characters: f.characters,
    options: f.options,
  };
}

/** YYYY-MM-DD in the player's own time zone. */
export function localDate(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** The set for a date: that day's entry, else the latest one before it, else the first. */
export function dailySetFor(date: string): DailySet {
  if (!SCHEDULE.length) throw new Error('content/schedule.json is empty');
  let i = SCHEDULE.findIndex(([d]) => d === date);
  if (i < 0) {
    i = SCHEDULE.findLastIndex(([d]) => d < date);
    if (i < 0) i = 0;
  }
  const [day, ids] = SCHEDULE[i];
  return {
    puzzleNumber: i,
    date: day,
    rounds: ids.map((id, k) => {
      const f = ROUND_FILES[id];
      if (!f) throw new Error(`schedule ${day}: no round '${id}'`);
      return toRound(f, k + 1);
    }),
  };
}
