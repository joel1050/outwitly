import { describe, expect, it } from 'vitest';
import { checkRound, formatReport, passed } from './checks';
import { dailySetById, dailySetFor, ROUND_FILES, SCHEDULE } from './content';
import catalog from '../../content/catalog.json';
import { PUZZLES } from '../games/registry';
import type { Difficulty } from './types';

/** The same idea may not come back within this many days. */
const IDEA_GAP_DAYS = 14;
const LEVEL: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };
const dayNumber = (d: string) => Date.parse(`${d}T00:00:00Z`) / 86_400_000;

describe('stored rounds', () => {
  const files = Object.values(ROUND_FILES);

  it('there is at least one round', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const f of files) {
    it(`${f.id} loads and solves`, () => {
      const r = checkRound(f);
      expect(r.errors, formatReport(r)).toEqual([]);
    });
    if (f.status === 'ready') {
      it(`${f.id} passes every check (status: ready)`, () => {
        const r = checkRound(f);
        expect(passed(r), formatReport(r)).toBe(true);
      });
    }
  }
});

describe('schedule', () => {
  it('has unique day ids', () => {
    expect(new Set(SCHEDULE.map((day) => day.id)).size).toBe(SCHEDULE.length);
  });

  it('chooses the later entry when two sets share a date', () => {
    expect(dailySetFor('2026-11-25').id).toBe('0.2');
    expect(dailySetById('0.1')?.rounds).toHaveLength(5);
    expect(dailySetById('0.2')?.rounds.map((r) => r.type)).toEqual(['cookie-cut', 'roll-call', 'mystery-box']);
  });

  it('only uses rounds that exist and are ready', () => {
    for (const { id: day, rounds: ids } of SCHEDULE) {
      for (const id of ids) {
        expect(ROUND_FILES[id], `${day}: no round '${id}'`).toBeDefined();
        expect(ROUND_FILES[id].status, `${day}: '${id}' is not ready`).toBe('ready');
      }
    }
  });

  it('never repeats a game type within a day, and goes from easier to harder', () => {
    for (const { id: day, rounds: ids } of SCHEDULE) {
      const types = ids.map((id) => ROUND_FILES[id].type);
      expect(new Set(types).size, `${day}: ${types.join(', ')}`).toBe(types.length);
      const levels = ids.map((id) => LEVEL[ROUND_FILES[id].difficulty]);
      expect([...levels].sort(), `${day}: difficulty order`).toEqual(levels);
    }
  });

  it('never schedules a round twice', () => {
    const seen = new Map<string, string>();
    for (const { id: day, rounds: ids } of SCHEDULE) {
      for (const id of ids) {
        expect(seen.get(id), `'${id}' on ${seen.get(id)} and ${day}`).toBeUndefined();
        seen.set(id, day);
      }
    }
  });

  it(`keeps the same idea at least ${IDEA_GAP_DAYS} days apart`, () => {
    const last = new Map<string, string>();
    for (const { date, rounds: ids } of SCHEDULE) {
      for (const id of ids) {
        const idea = ROUND_FILES[id].idea;
        const prev = last.get(idea);
        if (prev) {
          expect(dayNumber(date) - dayNumber(prev), `idea '${idea}' on ${prev} and ${date}`).toBeGreaterThanOrEqual(IDEA_GAP_DAYS);
        }
        last.set(idea, date);
      }
    }
  });
});

describe('catalogue', () => {
  interface Entry { id: string; status: string; sheet: string; code?: string; note?: string; family: string }
  const entries = (catalog as { scenarios: Entry[] }).scenarios;
  const sheets = new Set(Object.keys(import.meta.glob('../../content/scenarios/*.md')).map((p) => p.split('/').pop()!.replace(/\.md$/, '')));
  const STATUSES = ['live', 'approved', 'proposed', 'rejected'];
  const FAMILIES = ['crowding', 'splitting', 'bidding', 'conflict', 'ahead', 'voting', 'trust'];

  it('has unique ids, known statuses and families, and a sheet for each', () => {
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
    for (const e of entries) {
      expect(STATUSES, e.id).toContain(e.status);
      expect(FAMILIES, e.id).toContain(e.family);
      expect(sheets.has(e.id), `content/scenarios/${e.id}.md is missing`).toBe(true);
      expect(e.sheet).toBe(`content/scenarios/${e.id}.md`);
      if (e.status === 'rejected') expect(e.note, `${e.id}: say why it was rejected`).toBeTruthy();
    }
  });

  it('lists exactly the game types that have code, as live', () => {
    const live = entries.filter((e) => e.status === 'live').map((e) => e.id).sort();
    expect(live).toEqual(Object.keys(PUZZLES).sort());
  });

  it('only has rounds for live game types', () => {
    const live = new Set(entries.filter((e) => e.status === 'live').map((e) => e.id));
    for (const f of Object.values(ROUND_FILES)) expect(live.has(f.type), `${f.id}: type '${f.type}' is not live`).toBe(true);
  });
});
