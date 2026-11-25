import { gsap } from 'gsap';
import { cardText, CHARACTERS } from '../engine/characters';
import { PUZZLES } from '../engine/registry';
import { SAMPLE_DAY } from '../engine/sample-day';
import { gradeRound, untimedScore, square } from '../engine/scoring';
import type { Round } from '../engine/types';
import { portrait } from '../render/actor';
import { initAudio, isMuted, setMuted, setSuppressed, sfx } from '../render/audio';
import { createStage } from '../render/scenes';
import type { Stage } from '../render/stage';
import { reducedMotion } from '../render/svg';
import { DEMO_PICKS, demoHistogram, demoTopPercent } from './crowd';
import { store, type RoundRecord } from './store';

const DAY = SAMPLE_DAY;
const N = DAY.rounds.length;
const root = document.getElementById('app')!;

type Phase = 'home' | 'intro' | 'decide' | 'playout' | 'result' | 'end';
const state = {
  phase: 'home' as Phase,
  round: null as Round | null,
  stage: null as Stage | null,
  selected: null as string | null,
  homeTick: 0,
  onNext: null as null | (() => void),
  select: null as null | ((n: number) => void),
  skip: null as null | (() => void),
  share: null as null | (() => void),
};

const esc = (str: string) => str.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const DIFF_DOTS = { easy: 1, medium: 2, hard: 3 } as const;
const baseScale = () => (reducedMotion() ? 1.5 : 1);

// ---------- settings ----------

function applySettings() {
  const st = store.settings;
  const html = document.documentElement;
  if (st.theme === 'auto') delete html.dataset.theme; else html.dataset.theme = st.theme;
  if (st.motion === 'auto') delete html.dataset.motion; else html.dataset.motion = st.motion;
  setMuted(st.muted);
  gsap.globalTimeline.timeScale(baseScale());
  document.querySelectorAll<HTMLButtonElement>('[data-action="mute"]').forEach((b) => {
    b.setAttribute('aria-pressed', String(!isMuted()));
    b.innerHTML = soundIcon();
    b.setAttribute('aria-label', isMuted() ? 'Sound off' : 'Sound on');
  });
}

const soundIcon = () => (isMuted()
  ? '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  : '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>');

const controls = () => `
  <div class="controls">
    <button class="icon-btn" data-action="mute" aria-label="Sound">${soundIcon()}</button>
    <button class="icon-btn" data-action="settings" aria-label="Settings">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
  </div>`;

// ---------- modal ----------

function modal(html: string, label: string) {
  const prev = document.activeElement as HTMLElement | null;
  const wrap = document.createElement('div');
  wrap.className = 'modal-wrap';
  wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(label)}">${html}<button class="btn ghost close" data-close>Close</button></div>`;
  document.body.appendChild(wrap);
  const close = () => { wrap.remove(); prev?.focus(); document.removeEventListener('keydown', onKey, true); };
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
  document.addEventListener('keydown', onKey, true);
  wrap.addEventListener('click', (e) => { if (e.target === wrap || (e.target as HTMLElement).closest('[data-close]')) close(); });
  gsap.from(wrap.querySelector('.modal'), { y: 24, opacity: 0, duration: 0.25, ease: 'power2.out' });
  (wrap.querySelector('[data-close]') as HTMLElement).focus();
  return { wrap, close };
}

function howToPlay() {
  modal(`
    <h2>How to play</h2>
    <ol class="how">
      <li>Each round is one decision in a small scene shared with cartoon characters.</li>
      <li>Every character follows the rule on its card, every time. Tap a card to read it.</li>
      <li>Tap an option to play it. One try per round, so read the cards first. Keys: <kbd>1</kbd>–<kbd>4</kbd>.</li>
      <li>Best move scores 100. Other moves earn partial credit. There’s no clock, so take your time.</li>
    </ol>
    <p class="muted">Five rounds a day: two easy, two medium, one hard.</p>`, 'How to play');
}

function settings() {
  const st = store.settings;
  const seg = (name: string, value: string, opts: [string, string][]) => `
    <div class="seg" role="radiogroup" aria-label="${name}">
      ${opts.map(([v, l]) => `<button role="radio" aria-checked="${v === value}" data-set="${name}:${v}">${l}</button>`).join('')}
    </div>`;
  const m = modal(`
    <h2>Settings</h2>
    <div class="setting"><span>Sound</span>${seg('muted', String(st.muted), [['false', 'On'], ['true', 'Off']])}</div>
    <div class="setting"><span>Theme</span>${seg('theme', st.theme, [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']])}</div>
    <div class="setting"><span>Motion</span>${seg('motion', st.motion, [['auto', 'Auto'], ['reduced', 'Reduced'], ['full', 'Full']])}</div>
    <hr/>
    <button class="btn ghost" data-reset>Reset today’s demo progress</button>`, 'Settings');
  m.wrap.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-set]');
    if (b) {
      const [k, v] = b.dataset.set!.split(':');
      store.setSettings(k === 'muted' ? { muted: v === 'true' } : { [k]: v });
      b.parentElement!.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      applySettings();
    }
    if ((e.target as HTMLElement).closest('[data-reset]')) {
      store.resetDay(DAY.puzzleNumber);
      m.close();
      teardown();
      renderHome();
    }
  });
}

function cardModal(id: string, rule: string, badge: string) {
  const c = CHARACTERS[id];
  const m = modal(`
    <div class="card-big">
      <div class="card-big-art" style="--c:${c.color}"></div>
      <h2>${esc(c.name)}</h2>
      <p class="muted">${esc(c.personality)}</p>
      ${badge ? `<span class="badge">${esc(badge)}</span>` : ''}
      <p class="rule-big">${esc(rule)}</p>
    </div>`, `${c.name} card`);
  m.wrap.querySelector('.card-big-art')!.appendChild(portrait(id, 120));
}

// ---------- home ----------

function teardown() {
  clearInterval(state.homeTick);
  state.stage?.destroy();
  state.stage = null;
  state.onNext = state.select = state.skip = null;
  gsap.globalTimeline.timeScale(baseScale());
  setSuppressed(false);
  // Each screen starts at its top; otherwise a phone keeps the last screen's scroll and hides the header.
  window.scrollTo(0, 0);
}

function dayTotal(recs: RoundRecord[]) { return recs.reduce((a, r) => a + r.score, 0); }

export function renderHome() {
  teardown();
  state.phase = 'home';
  const recs = store.records(DAY.puzzleNumber);
  const done = recs.length >= N;
  const date = new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  root.innerHTML = `
    <main class="home screen">
      <header class="bar">${controls()}</header>
      <div class="home-hero">
        <div class="lineup" aria-hidden="true"></div>
        <h1 class="logo">Outwitly</h1>
        <p class="tagline">Five quick puzzles. Read the cards. Outthink the crowd.</p>
        <p class="meta">Puzzle #${DAY.puzzleNumber} · ${esc(date)}</p>
      </div>
      <div class="home-actions">
        ${done ? `
          <div class="done-card">
            <div class="done-total"><b>${dayTotal(recs)}</b>/500</div>
            <div class="squares" aria-label="Round squares">${recs.map((r) => square(r.quality)).join('')}</div>
            <p class="muted">Next set in <span class="countdown">--:--:--</span></p>
          </div>
          <button class="btn primary big" data-action="results">See results</button>
          <button class="btn ghost" data-action="replay">Replay demo</button>`
        : `<button class="btn primary big" data-action="play">${recs.length ? `Continue · round ${recs.length + 1} of ${N}` : 'Play today’s puzzles'}</button>`}
        <button class="btn ghost" data-action="how">How to play</button>
      </div>
      <p class="foot muted">Demo build: one sample day, no accounts, crowd stats simulated.</p>
    </main>`;
  const line = root.querySelector('.lineup')!;
  ['greedy', 'copycat', 'showoff', 'loner', 'fair', 'hero', 'cautious', 'lazy'].forEach((id, i) => {
    const p = portrait(id, 52);
    line.appendChild(p);
    if (!reducedMotion()) {
      gsap.from(p, { y: 30, opacity: 0, duration: 0.5, delay: 0.05 * i, ease: 'back.out(2)' });
      gsap.to(p, { y: -4, duration: 0.9 + (i % 3) * 0.15, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.6 + i * 0.1 });
    }
  });
  applySettings();
  if (done) {
    const tick = () => {
      const now = new Date();
      const next = new Date(now); next.setHours(24, 0, 0, 0);
      const ms = next.getTime() - now.getTime();
      const h = Math.floor(ms / 3.6e6), m = Math.floor((ms % 3.6e6) / 6e4), sec = Math.floor((ms % 6e4) / 1000);
      const el = root.querySelector('.countdown');
      if (el) el.textContent = [h, m, sec].map((x) => String(x).padStart(2, '0')).join(':');
    };
    tick();
    state.homeTick = window.setInterval(tick, 1000);
  }
  (root.querySelector('.btn.primary') as HTMLElement)?.focus({ preventScroll: true });
}

// ---------- round ----------

function cardsHtml(round: Round) {
  return round.characters.map((c) => {
    const def = CHARACTERS[c.id];
    const rule = cardText(c.id, c.ruleKey, c.ruleArgs);
    const acc = c.stats?.accuracy;
    const badge = acc ? (acc === '1/1' ? 'Never misses' : `Hits ${acc.replace('/', ' in ')}`) : '';
    return `<button class="card" data-card="${c.id}" data-rule="${esc(rule)}" data-badge="${esc(badge)}" style="--c:${def.color}" aria-label="${esc(def.name)}: ${esc(rule)}${badge ? ` ${badge}` : ''}">
      <span class="card-art"></span>
      <span class="card-body"><span class="card-name">${esc(def.name)}${badge ? ` <span class="badge sm">${esc(badge)}</span>` : ''}</span><span class="card-rule">${esc(rule)}</span></span>
    </button>`;
  }).join('');
}

const OPTION_CAPTION: Record<string, string> = {
  pirates: 'Coins for: you / Greedy / Fair / Lazy',
  agenda: 'Which pair votes first?',
  duel: 'Your first balloon goes at…',
};

function startRound(idx: number) {
  teardown();
  const round = DAY.rounds[idx];
  const type = PUZZLES[round.type];
  const opts = type.options(round);
  state.round = round;
  state.selected = null;
  state.phase = 'intro';
  const dots = Array.from({ length: 3 }, (_, i) => `<i class="${i < DIFF_DOTS[round.difficulty] ? 'on' : ''}"></i>`).join('');
  root.innerHTML = `
    <main class="round screen" data-type="${round.type}">
      <header class="bar">
        <div class="round-meta">
          <span class="round-no">Round ${idx + 1} of ${N}</span>
          <span class="diff" aria-label="${round.difficulty}">${dots}</span>
          <span class="type-name">${type.title}</span>
        </div>
        ${controls()}
      </header>
      <p class="setup"><span class="goal"><b>Goal:</b> ${esc(type.goal(round))}</span>${esc(type.setup(round))}</p>
      <div class="scene-slot">
        <div class="scene-wrap">
          <button class="skip btn small" hidden>Skip ›</button>
        </div>
      </div>
      <section class="panel">
        <div class="cards">${cardsHtml(round)}</div>
        ${OPTION_CAPTION[round.type] ? `<p class="opt-caption">${OPTION_CAPTION[round.type]}</p>` : ''}
        <div class="options n${opts.length}" role="radiogroup" aria-label="Options">
          ${opts.map((o, i) => `<button class="option" role="radio" aria-checked="false" data-opt="${o.id}" disabled>
            <kbd>${i + 1}</kbd><span class="opt-label">${esc(o.label)}</span>${o.detail ? `<span class="opt-detail">${esc(o.detail)}</span>` : ''}</button>`).join('')}
        </div>
      </section>
      <div class="sr-only" aria-live="polite" id="live"></div>
    </main>`;
  root.querySelectorAll<HTMLElement>('.card').forEach((el) => el.querySelector('.card-art')!.appendChild(portrait(el.dataset.card!, 40)));
  applySettings();

  const sceneWrap = root.querySelector<HTMLElement>('.scene-wrap')!;
  const stage = createStage(round, sceneWrap);
  state.stage = stage;
  gsap.from(root.querySelectorAll('.card, .option'), { y: 16, opacity: 0, stagger: 0.04, duration: 0.3, ease: 'power2.out', clearProps: 'all' });

  stage.intro().then(() => {
    if (state.stage !== stage) return;
    state.phase = 'decide';
    root.querySelectorAll<HTMLButtonElement>('.option').forEach((b) => (b.disabled = false));
    (root.querySelector('.option') as HTMLElement)?.focus({ preventScroll: true });
  });

  // One tap commits. There is no separate lock-in step.
  const choose = (id: string) => {
    if (state.phase !== 'decide') return;
    state.selected = id;
    root.querySelectorAll<HTMLElement>('.option').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.opt === id)));
    sfx('lock');
    finishRound(idx, id);
  };
  const optionsEl = root.querySelector<HTMLElement>('.options')!;
  optionsEl.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.option');
    if (b) choose(b.dataset.opt!);
  });
  // With a mouse, hovering an option previews it in the scene. Touch has no hover, so phones skip this.
  let hovered: string | null = null;
  const hover = (id: string | null) => {
    if (state.phase !== 'decide' || id === hovered) return;
    hovered = id;
    stage.setPreview(id);
  };
  optionsEl.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'mouse') hover((e.target as HTMLElement).closest<HTMLElement>('.option')?.dataset.opt ?? null);
  });
  optionsEl.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hover(null); });
  root.querySelector('.cards')!.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('.card');
    if (b) cardModal(b.dataset.card!, b.dataset.rule!, b.dataset.badge!);
  });
  state.select = (n: number) => {
    const o = opts[n];
    if (o) choose(o.id);
  };
}

/** On very short screens the page can still scroll; bring the whole scene into view for the playout. */
function showWholeScene() {
  const scene = root.querySelector<HTMLElement>('.scene-wrap');
  if (!scene) return;
  const r = scene.getBoundingClientRect();
  if (r.top >= 0 && r.bottom <= window.innerHeight) return;
  scene.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

async function finishRound(idx: number, optionId: string) {
  if (state.phase !== 'decide') return;
  const round = DAY.rounds[idx];
  const stage = state.stage!;
  state.phase = 'playout';
  const { graded, bestId } = gradeRound(round);
  const mine = graded.find((g) => g.optionId === optionId)!;
  const quality = mine.quality;
  const score = untimedScore(quality);
  store.addRecord(DAY.puzzleNumber, { round: round.index, optionId, msRemaining: 0, score, quality });

  const panel = root.querySelector<HTMLElement>('.panel')!;
  root.querySelectorAll<HTMLButtonElement>('.option').forEach((b) => (b.disabled = true));
  panel.classList.add('dim');
  showWholeScene();

  {
    const skip = root.querySelector<HTMLButtonElement>('.skip')!;
    const doSkip = () => {
      if (state.phase !== 'playout' || skip.hidden) return;
      skip.hidden = true;
      gsap.globalTimeline.timeScale(30);
      setSuppressed(true);
    };
    const showSkip = window.setTimeout(() => { if (state.phase === 'playout') skip.hidden = false; }, 1000);
    skip.onclick = doSkip;
    state.skip = doSkip;
    try {
      await stage.play(mine.outcome);
    } finally {
      clearTimeout(showSkip);
      skip.hidden = true;
      gsap.globalTimeline.timeScale(baseScale());
      setSuppressed(false);
      state.skip = null;
    }
  }
  if (state.stage !== stage) return;
  stage.markBest(bestId);
  showResult(idx, optionId, score, quality, graded, bestId);
}

function showResult(idx: number, optionId: string | null, score: number, quality: number, graded: ReturnType<typeof gradeRound>['graded'], bestId: string) {
  state.phase = 'result';
  const round = DAY.rounds[idx];
  const type = PUZZLES[round.type];
  const best = graded.find((g) => g.optionId === bestId)!;
  const mine = optionId ? graded.find((g) => g.optionId === optionId)! : null;
  const picks = DEMO_PICKS[round.index] ?? {};
  const panel = root.querySelector<HTMLElement>('.panel')!;
  const sq = square(quality);
  const isLast = idx === N - 1;
  panel.classList.remove('dim');
  root.querySelector('.round')?.classList.add('done');
  panel.innerHTML = `
    <div class="result">
      <div class="res-head">
        <div class="res-score"><span class="plus">+</span><span class="num">0</span></div>
        <div class="res-q">
          <div class="qbar"><i style="width:0%"></i></div>
          <span class="qtext">${sq} ${Math.round(quality * 100)}% of the best</span>
        </div>
      </div>
      <p class="res-line">${mine ? `${esc(mine.outcome.summary)}` : 'Time’s up. No move, no points.'}</p>
      <p class="res-explain"><b>★ Best: ${esc(best.label)}.</b> ${esc(type.explain(round, bestId))}</p>
      <ul class="crowd" aria-label="How players picked">
        ${graded.map((g) => `
          <li class="${g.optionId === bestId ? 'best' : ''} ${g.optionId === optionId ? 'mine' : ''}">
            <span class="c-label">${g.optionId === bestId ? '★ ' : ''}${esc(g.label)}${g.optionId === optionId ? ' <em>you</em>' : ''}</span>
            <span class="c-val">${esc(g.outcome.valueLabel)}</span>
            <span class="c-bar"><i style="--w:${picks[g.optionId] ?? 0}%"></i></span>
            <span class="c-pct">${picks[g.optionId] ?? 0}%</span>
          </li>`).join('')}
      </ul>
      <p class="demo-note">Pick percentages are demo data.</p>
      <button class="btn primary next">${isLast ? 'See your day' : 'Next round'} →</button>
    </div>`;
  const live = root.querySelector('#live');
  if (live) live.textContent = `${mine ? mine.outcome.summary : 'Time’s up.'} You scored ${score}. Best move: ${best.label}.`;
  gsap.from(panel.querySelector('.result'), { y: 30, opacity: 0, duration: 0.35, ease: 'power2.out' });
  const o = { v: 0 };
  const num = panel.querySelector('.num')!;
  gsap.to(o, { v: score, duration: 0.8, ease: 'power2.out', onUpdate: () => { num.textContent = String(Math.round(o.v)); } });
  gsap.to(panel.querySelector('.qbar i'), { width: `${quality * 100}%`, duration: 0.8, ease: 'power2.out' });
  panel.querySelector('.qbar i')!.classList.add(`q-${['🟩', '🟨', '🟧', '🟥'].indexOf(sq)}`);
  gsap.from(panel.querySelectorAll('.c-bar i'), { scaleX: 0, transformOrigin: 'left', duration: 0.6, stagger: 0.06, delay: 0.2 });
  if (score >= 90) sfx('cheer');
  const next = panel.querySelector<HTMLButtonElement>('.next')!;
  state.onNext = () => { if (isLast) renderEnd(); else startRound(idx + 1); };
  next.addEventListener('click', () => state.onNext?.());
  next.focus({ preventScroll: true });
}

// ---------- end ----------

function shareText(total: number, top: number, recs: RoundRecord[]) {
  return `Outwitly #${DAY.puzzleNumber} · ${total}/500 · Top ${top}%\n${recs.map((r) => square(r.quality)).join('')}\njoel1050.github.io/outwitly`;
}

/** Copy to the clipboard. Falls back to a hidden textarea where the Clipboard API is blocked (file:// pages, old browsers). */
async function copyText(txt: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(txt);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = txt;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove();
    return ok;
  }
}

function toast(msg: string) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.textContent = msg;
  document.body.appendChild(t);
  gsap.fromTo(t, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 });
  setTimeout(() => t.remove(), 2200);
}

function bellSvg(total: number) {
  const h = demoHistogram();
  const max = Math.max(...h);
  const W = 320, H = 110;
  const bw = W / h.length;
  const bars = h.map((v, i) => {
    const bh = (v / max) * (H - 20);
    const mine = Math.min(49, Math.floor(total / 10)) === i;
    return `<rect x="${(i * bw + 0.5).toFixed(1)}" y="${(H - bh).toFixed(1)}" width="${(bw - 1).toFixed(1)}" height="${bh.toFixed(1)}" rx="1.5" class="${mine ? 'bar mine' : 'bar'}"/>`;
  }).join('');
  const mx = Math.min(W - 2, (total / 500) * W);
  return `<svg viewBox="0 -14 ${W} ${H + 30}" class="bell" role="img" aria-label="Today's totals form a bell curve; your ${total} is marked.">
    ${bars}
    <line x1="${mx}" y1="-4" x2="${mx}" y2="${H}" class="marker"/>
    <text x="${Math.max(18, Math.min(W - 18, mx))}" y="-6" text-anchor="middle" class="marker-text">you</text>
    <text x="0" y="${H + 14}" class="axis">0</text><text x="${W / 2}" y="${H + 14}" text-anchor="middle" class="axis">250</text><text x="${W}" y="${H + 14}" text-anchor="end" class="axis">500</text>
  </svg>`;
}

function renderEnd() {
  teardown();
  state.phase = 'end';
  const recs = [...store.records(DAY.puzzleNumber)].sort((a, b) => a.round - b.round);
  const total = dayTotal(recs);
  const top = demoTopPercent(total);
  const rows = recs.map((r) => {
    const round = DAY.rounds[r.round - 1];
    const type = PUZZLES[round.type];
    const { graded, bestId } = gradeRound(round);
    const mine = graded.find((g) => g.optionId === r.optionId);
    const best = graded.find((g) => g.optionId === bestId)!;
    const missed = r.optionId !== bestId;
    return `<li>
      <span class="sq">${square(r.quality)}</span>
      <span class="r-name">${type.title}</span>
      <span class="r-move">${mine ? esc(mine.label) : 'timed out'}${missed ? ` <span class="muted">· best: ${esc(best.label)}</span>` : ''}</span>
      <span class="r-score">${r.score}</span>
    </li>`;
  }).join('');
  root.innerHTML = `
    <main class="end screen">
      <header class="bar"><span class="round-meta">Outwitly #${DAY.puzzleNumber}</span>${controls()}</header>
      <section class="end-hero">
        <div class="total"><span class="big">0</span><span class="of">/500</span></div>
        <div class="pct">Top ${top}%</div>
        ${bellSvg(total)}
        <p class="demo-note">Bell curve and percentile use demo data.</p>
        <div class="squares big-sq">${recs.map((r) => `<span>${square(r.quality)}</span>`).join('')}</div>
      </section>
      <ol class="rounds">${rows}</ol>
      <div class="end-actions">
        <button class="btn primary big" data-action="share">Copy result</button>
        <button class="btn ghost" data-action="home">Home</button>
      </div>
    </main>`;
  applySettings();
  const o = { v: 0 };
  const big = root.querySelector('.big')!;
  gsap.to(o, { v: total, duration: 1.2, ease: 'power2.out', onUpdate: () => { big.textContent = String(Math.round(o.v)); } });
  gsap.from(root.querySelectorAll('.big-sq span'), { scale: 0, duration: 0.35, stagger: 0.1, delay: 0.4, ease: 'back.out(3)' });
  gsap.from(root.querySelectorAll('.bell .bar'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.5, stagger: 0.008 });
  if (total >= 400) sfx('cheer');
  (root.querySelector('[data-action="share"]') as HTMLElement).focus({ preventScroll: true });
  state.share = async () => {
    const txt = shareText(total, top, recs);
    toast(await copyText(txt) ? 'Result copied' : txt);
  };
}

// ---------- wiring ----------

export function boot() {
  initAudio(store.settings.muted);
  applySettings();
  // Refresh the speaker icon once audio unlocks, unless that first tap is on the speaker itself
  // (its click handler then reads the icon as it was).
  window.addEventListener('pointerdown', (e) => {
    if (!(e.target as HTMLElement).closest?.('[data-action="mute"]')) setTimeout(applySettings, 0);
  }, { once: true });
  window.addEventListener('keydown', () => setTimeout(applySettings, 0), { once: true });

  root.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!b) return;
    switch (b.dataset.action) {
      case 'mute': {
        // Flip what the icon showed: before the first tap audio is locked, so it read "off".
        store.setSettings({ muted: b.getAttribute('aria-pressed') === 'true' });
        applySettings();
        break;
      }
      case 'settings': settings(); break;
      case 'how': howToPlay(); break;
      case 'play': {
        const recs = store.records(DAY.puzzleNumber);
        startRound(recs.length);
        break;
      }
      case 'replay': store.resetDay(DAY.puzzleNumber); startRound(0); break;
      case 'results': renderEnd(); break;
      case 'home': renderHome(); break;
      case 'share': state.share?.(); break;
    }
  });
  root.addEventListener('click', (e) => {
    if (state.phase === 'playout' && (e.target as HTMLElement).closest('.scene-wrap')) state.skip?.();
  });

  document.addEventListener('keydown', (e) => {
    if (document.querySelector('.modal-wrap')) return;
    if (state.phase === 'decide' && /^[1-9]$/.test(e.key)) {
      state.select?.(Number(e.key) - 1);
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter') {
      const t = e.target as HTMLElement;
      // Let other buttons (cards, mute, settings) keep their own Enter behaviour.
      if (t.closest?.('button') && !t.closest('.option, .next, .skip')) return;
      if (state.phase === 'decide') {
        const opt = t.closest?.('.option') as HTMLElement | null;
        if (opt) {
          e.preventDefault();
          state.select?.([...root.querySelectorAll('.option')].indexOf(opt));
        }
      } else if (state.phase === 'result') {
        e.preventDefault();
        state.onNext?.();
      } else if (state.phase === 'playout') {
        e.preventDefault();
        state.skip?.();
      }
    }
  });

  renderHome();
}
