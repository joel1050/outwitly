export type Family = 'crowding' | 'splitting' | 'bidding' | 'conflict' | 'ahead' | 'voting' | 'trust';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type Emote = 'cheer' | 'sulk' | 'shock' | 'smug' | 'think';

export interface CookieTray {
  actor: string;
  count: number;
  points: number;
}

export type TimelineEvent =
  | { t: 'move'; actor: string; to: string }
  | { t: 'vote'; actor: string; choice: 'yes' | 'no' }
  | { t: 'lever'; actor: string; state: 'pulled' | 'left' | 'jammed' }
  | { t: 'heading'; exit: string }
  | { t: 'trolley'; path: string }
  | { t: 'throw'; actor: string; target: string; hit: boolean }
  | { t: 'payout'; actor: string; amount: number }
  | { t: 'emote'; actor: string; emote: Emote }
  | { t: 'say'; actor: string; text: string }
  | { t: 'open'; target: string }
  | { t: 'split'; shares: number[] }
  | { t: 'tally'; yes: number; needed: number; passed: boolean }
  | { t: 'plank'; actor: string }
  | { t: 'matchup'; a: string; b: string }
  | { t: 'ballot'; actor: string; choice: string; tally?: Record<string, number> }
  | { t: 'winner'; winner: string; loser: string; final: boolean }
  | { t: 'cookie-cut'; after: number }
  | { t: 'cookie-trays'; left: CookieTray; right: CookieTray }
  | { t: 'project-winner'; winner: string; tally: Record<string, number> }
  | { t: 'box-case'; contents: number; chance: string; bids: Record<string, number>; winner: string | null; price: number; gain: number }
  | { t: 'box-average'; value: number; exact: string };

export interface Outcome {
  value: number;
  valueLabel: string;
  /** exact value as text, for types that solve with rationals */
  exact?: string;
  events: TimelineEvent[];
  /** plain-text account of what happened, for screen readers and the result panel */
  summary: string;
}

export interface OptionDef {
  id: string;
  label: string;
  /** short secondary line on the option button */
  detail?: string;
}

export interface CharacterRef {
  id: string;
  ruleKey: string;
  ruleArgs?: any;
  stats?: { accuracy?: string };
}

export interface Round<P = any> {
  /** the round file's id (content/rounds/<type>/<id>.json) */
  id?: string;
  index: number;
  type: string;
  difficulty: Difficulty;
  timeLimitMs: number;
  params: P;
  characters: CharacterRef[];
  options?: any;
}

export type RoundStatus = 'draft' | 'ready' | 'retired';

/**
 * One round as stored on disk: content/rounds/<type>/<id>.json.
 * A day's Round is built from this; its index and default time limit are added then.
 */
export interface RoundFile<P = any> {
  id: string;
  type: string;
  difficulty: Difficulty;
  /** The one insight that solves it, as a short kebab-case tag. The schedule keeps equal ideas apart. */
  idea: string;
  /** draft: being worked on, checks are reported but not enforced. ready: may be scheduled. retired: never again. */
  status: RoundStatus;
  /** 'hand' for hand-made rounds; generated rounds will say which template made them. */
  source: string;
  /** Set when the obvious option is meant to win; about one round in five should. */
  obviousIsBest?: boolean;
  timeLimitMs?: number;
  notes?: string;
  params: P;
  characters: CharacterRef[];
  options?: any;
}

export interface DailySet {
  id: string;
  date: string;
  rounds: Round[];
}

export interface PuzzleType<P = any> {
  id: string;
  family: Family;
  title: string;
  /** One short line saying what the player is trying to achieve; it matches how the round is scored. */
  goal(round: Round<P>): string;
  setup(round: Round<P>): string;
  options(round: Round<P>): OptionDef[];
  resolve(round: Round<P>, optionId: string): Outcome;
  betterIs: 'higher' | 'lower';
  floor?(round: Round<P>): number;
  obviousOptionId(round: Round<P>): string;
  explain(round: Round<P>, bestId: string): string;
}
