import { CHARACTERS, cardText, rule } from './characters';
import { toRound } from './content';
import { PUZZLES } from '../games/registry';
import { gradeRound, type Graded } from './scoring';
import type { Round, RoundFile } from './types';

/**
 * The checks every round must pass before it can be scheduled (status 'ready').
 * Used by the content tests and by `npm run rounds`, which prints the same report
 * for anyone hand-making a round.
 */

export const LIMITS = {
  goalWords: 10,
  setupWords: 40,
  cardWords: 12,
  minOptions: 2,
  maxOptions: 4,
  /** The next best option may score at most this much quality. */
  nextBestMax: 0.8,
  /** When the obvious option is a trap, it may score at most this much. */
  trapMax: 0.6,
};

export interface Check { name: string; ok: boolean; detail: string }

export interface RoundReport {
  file: RoundFile;
  round?: Round;
  goal?: string;
  setup?: string;
  cards: { name: string; text: string }[];
  graded: Graded[];
  bestId?: string;
  explanation?: string;
  obviousId?: string;
  checks: Check[];
  /** Load errors: the round can't be graded at all. */
  errors: string[];
}

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function checkRound(file: RoundFile): RoundReport {
  const rep: RoundReport = { file, cards: [], graded: [], checks: [], errors: [] };
  const type = PUZZLES[file.type];
  if (!type) {
    rep.errors.push(`no game type '${file.type}' (expected src/games/${file.type}/logic.ts)`);
    return rep;
  }
  for (const c of file.characters) {
    if (!CHARACTERS[c.id]) { rep.errors.push(`unknown character '${c.id}'`); continue; }
    try {
      rule(c.id, c.ruleKey);
      rep.cards.push({ name: CHARACTERS[c.id].name, text: cardText(c.id, c.ruleKey, c.ruleArgs) });
    } catch (e) {
      rep.errors.push((e as Error).message);
    }
  }
  if (rep.errors.length) return rep;

  try {
    const round = toRound(file, 1);
    rep.round = round;
    rep.goal = type.goal(round);
    rep.setup = type.setup(round);
    const { graded, bestId } = gradeRound(round);
    rep.graded = graded;
    rep.bestId = bestId;
    rep.explanation = type.explain(round, bestId);
    rep.obviousId = type.obviousOptionId(round);
  } catch (e) {
    rep.errors.push(`could not solve: ${(e as Error).message}`);
    return rep;
  }

  const add = (name: string, ok: boolean, detail: string) => rep.checks.push({ name, ok, detail });
  const qs = rep.graded.map((g) => g.quality).sort((a, b) => b - a);
  const n = rep.graded.length;

  add('option count', n >= LIMITS.minOptions && n <= LIMITS.maxOptions, `${n} options (${LIMITS.minOptions}–${LIMITS.maxOptions})`);
  add('one best option', qs.filter((q) => q >= 0.9999).length === 1, `${qs.filter((q) => q >= 0.9999).length} option(s) score full quality`);
  add('clear gap', (qs[1] ?? 0) <= LIMITS.nextBestMax, `next best quality ${(qs[1] ?? 0).toFixed(2)} (max ${LIMITS.nextBestMax})`);

  const obvious = rep.graded.find((g) => g.optionId === rep.obviousId);
  if (file.obviousIsBest) {
    add('obvious option wins', rep.obviousId === rep.bestId, `obvious is ${rep.obviousId}, best is ${rep.bestId} (round says the obvious move wins)`);
  } else {
    add('trap bites', !!obvious && obvious.quality <= LIMITS.trapMax, `obvious option ${rep.obviousId} scores ${obvious?.quality.toFixed(2)} (max ${LIMITS.trapMax})`);
  }

  add('goal length', words(rep.goal!) <= LIMITS.goalWords, `${words(rep.goal!)} words (max ${LIMITS.goalWords})`);
  add('setup length', words(rep.setup!) <= LIMITS.setupWords, `${words(rep.setup!)} words (max ${LIMITS.setupWords})`);
  const longest = rep.cards.reduce((m, c) => Math.max(m, words(c.text)), 0);
  add('card length', longest <= LIMITS.cardWords, `longest card ${longest} words (max ${LIMITS.cardWords})`);
  return rep;
}

export const passed = (r: RoundReport) => !r.errors.length && r.checks.every((c) => c.ok);

/** Plain-text report of one round, for the terminal. */
export function formatReport(r: RoundReport): string {
  const f = r.file;
  const out: string[] = [];
  const verdict = r.errors.length ? 'BROKEN' : passed(r) ? 'PASS' : 'FAIL';
  out.push(`${f.id}  [${f.type} · ${f.difficulty} · ${f.status} · idea: ${f.idea}]  ${verdict}`);
  for (const e of r.errors) out.push(`  ✗ ${e}`);
  if (r.errors.length) return out.join('\n');
  out.push(`  Goal:  ${r.goal}`);
  out.push(`  Setup: ${r.setup}`);
  for (const c of r.cards) out.push(`  Card:  ${c.name}: ${c.text}`);
  out.push('');
  const w = Math.max(...r.graded.map((g) => g.label.length), 6);
  for (const g of [...r.graded].sort((a, b) => b.quality - a.quality)) {
    const marks = [g.optionId === r.bestId ? '★ best' : '', g.optionId === r.obviousId ? '⚠ obvious' : ''].filter(Boolean).join(' ');
    out.push(`  ${g.label.padEnd(w)}  ${g.outcome.valueLabel.padEnd(18)} q=${g.quality.toFixed(2)}  ${marks}`);
    out.push(`  ${''.padEnd(w)}  ${g.outcome.summary}`);
  }
  out.push('');
  out.push(`  Best:  ${r.explanation}`);
  out.push('');
  for (const c of r.checks) out.push(`  ${c.ok ? '✓' : '✗'} ${c.name}: ${c.detail}`);
  return out.join('\n');
}
