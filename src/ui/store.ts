export interface RoundRecord {
  round: number;
  optionId: string | null;
  msRemaining: number;
  /** Time taken to answer. Missing on records saved before the timer came back. */
  elapsedMs?: number;
  score: number;
  quality: number;
}

export interface Settings {
  muted: boolean;
  theme: 'auto' | 'light' | 'dark';
  motion: 'auto' | 'reduced' | 'full';
}

interface Saved {
  deviceId: string;
  settings: Settings;
  days: Record<string, { records: RoundRecord[] }>;
}

const KEY = 'outwit:v1';

function fresh(): Saved {
  return {
    deviceId: crypto.randomUUID?.() ?? String(Math.random()).slice(2),
    settings: { muted: false, theme: 'auto', motion: 'auto' },
    days: {},
  };
}

let data: Saved = load();

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved: Saved = { ...fresh(), ...JSON.parse(raw) };
      // The only day saved before ids was the five-round demo at index 0.
      if (saved.days['0']) {
        saved.days['0.1'] ??= saved.days['0'];
        delete saved.days['0'];
      }
      return saved;
    }
  } catch { /* storage blocked: play without saving */ }
  return fresh();
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export const store = {
  get settings() { return data.settings; },
  setSettings(p: Partial<Settings>) { data.settings = { ...data.settings, ...p }; save(); },
  records(day: string): RoundRecord[] { return data.days[day]?.records ?? []; },
  addRecord(day: string, r: RoundRecord) {
    const d = (data.days[day] ??= { records: [] });
    if (!d.records.some((x) => x.round === r.round)) d.records.push(r);
    save();
  },
  resetDay(day: string) { delete data.days[day]; save(); },
};
