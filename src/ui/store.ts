export interface RoundRecord {
  round: number;
  optionId: string | null;
  msRemaining: number;
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
  days: Record<number, { records: RoundRecord[] }>;
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
    if (raw) return { ...fresh(), ...JSON.parse(raw) };
  } catch { /* storage blocked: play without saving */ }
  return fresh();
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export const store = {
  get settings() { return data.settings; },
  setSettings(p: Partial<Settings>) { data.settings = { ...data.settings, ...p }; save(); },
  records(day: number): RoundRecord[] { return data.days[day]?.records ?? []; },
  addRecord(day: number, r: RoundRecord) {
    const d = (data.days[day] ??= { records: [] });
    if (!d.records.some((x) => x.round === r.round)) d.records.push(r);
    save();
  },
  resetDay(day: number) { delete data.days[day]; save(); },
};
