import schedule from '../../content/schedule.json';
import type { DailySet, Round, RoundFile } from './types';

/**
 * Loads the stored content: every round in content/rounds/<type>/<id>.json and
 * the days in content/schedule.json, with round ids in play order.
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

/** Days in date order. When dates match, the later schedule entry is newer. */
export const SCHEDULE = [...schedule.days].sort((a, b) => a.date.localeCompare(b.date));

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

/** The last set on or before a date, or the first set before the schedule starts. */
export function dailySetFor(date: string): DailySet {
  const day = SCHEDULE.findLast((day) => day.date <= date) ?? SCHEDULE[0];
  if (!day) throw new Error('content/schedule.json is empty');
  return buildDay(day);
}

export function dailySetById(id: string): DailySet | undefined {
  const day = SCHEDULE.find((day) => day.id === id);
  return day && buildDay(day);
}

function buildDay(day: (typeof SCHEDULE)[number]): DailySet {
  return {
    id: day.id,
    date: day.date,
    rounds: day.rounds.map((id, k) => {
      const f = ROUND_FILES[id];
      if (!f) throw new Error(`schedule ${day.id}: no round '${id}'`);
      return toRound(f, k + 1);
    }),
  };
}
