import '../../src/style.css';
import { gsap } from 'gsap';
import { ROUND_FILES, toRound } from '../../src/engine/content';
import { PUZZLES } from '../../src/games/registry';
import { gradeRound } from '../../src/engine/scoring';
import type { Round } from '../../src/engine/types';
import type { Stage } from '../../src/render/stage';

// One scene variant in its own page, so variants can't clash on CSS, ids or gsap state.
// Driven by the parent page through postMessage. Dev only; never built.

type StageClass = new (r: Round, c: HTMLElement) => Stage;
const variants = import.meta.glob<StageClass>('./variants/*/*.ts', { eager: true, import: 'default' });

const q = new URLSearchParams(location.search);
const type = q.get('type')!;
const v = q.get('v')!;
const Cls = variants[`./variants/${type}/${v}.ts`];
const file = Object.values(ROUND_FILES).find((f) => f.type === type);
const wrap = document.getElementById('wrap')!;
const err = document.getElementById('err')!;

if (q.get('theme')) document.documentElement.dataset.theme = q.get('theme')!;

let stage: Stage | null = null;
let token = 0;
let speed = 1;

function fail(e: unknown) {
  err.textContent = String((e as Error)?.stack ?? e);
  parent.postMessage({ from: v, error: String(e) }, '*');
}

async function fresh() {
  gsap.globalTimeline.timeScale(speed);
  stage?.destroy();
  wrap.innerHTML = '';
  const round = toRound(file!, 1);
  stage = new Cls(round, wrap).mount();
  await stage.intro();
  return round;
}

async function play(optionId: string) {
  const my = ++token;
  try {
    const round = await fresh();
    if (my !== token) return; // a newer command took over
    const t0 = performance.now();
    const outcome = PUZZLES[type].resolve(round, optionId);
    await stage!.play(outcome);
    stage!.markBest(gradeRound(round).bestId);
    parent.postMessage({ from: v, done: optionId, ms: Math.round(performance.now() - t0) }, '*');
  } catch (e) { fail(e); }
}

window.addEventListener('message', (e) => {
  const m = e.data ?? {};
  try {
    if (m.cmd === 'play') void play(m.id);
    else if (m.cmd === 'reset') { token++; void fresh().catch(fail); }
    else if (m.cmd === 'preview') stage?.setPreview(m.id ?? null);
    else if (m.cmd === 'speed') { speed = m.x; gsap.globalTimeline.timeScale(speed); }
  } catch (e) { fail(e); }
});

if (!Cls || !file) fail(`missing variant ${type}/${v} or no round for ${type}`);
else fresh().catch(fail);
