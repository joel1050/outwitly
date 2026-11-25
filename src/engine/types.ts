export type Family = 'crowding' | 'splitting' | 'bidding' | 'conflict' | 'ahead' | 'voting' | 'trust';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type Emote = 'cheer' | 'sulk' | 'shock' | 'smug' | 'think';

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
  | { t: 'ballot'; actor: string; choice: string }
  | { t: 'winner'; winner: string; loser: string; final: boolean };

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
  index: number;
  type: string;
  difficulty: Difficulty;
  timeLimitMs: number;
  params: P;
  characters: CharacterRef[];
  options?: any;
}

export interface DailySet {
  puzzleNumber: number;
  date: string;
  rounds: Round[];
}

export interface PuzzleType<P = any> {
  id: string;
  family: Family;
  title: string;
  setup(round: Round<P>): string;
  options(round: Round<P>): OptionDef[];
  resolve(round: Round<P>, optionId: string): Outcome;
  betterIs: 'higher' | 'lower';
  floor?(round: Round<P>): number;
  obviousOptionId(round: Round<P>): string;
  explain(round: Round<P>, bestId: string): string;
}
