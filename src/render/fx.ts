import { gsap } from 'gsap';
import { s, text, reducedMotion, OUTLINE } from './svg';

let live = 0;
const MAX = 150;

function spawn<K extends 'circle' | 'rect' | 'ellipse'>(layer: SVGGElement, tag: K, attrs: Record<string, string | number>) {
  if (live >= MAX) return null;
  live++;
  return s(tag, attrs, layer);
}
function kill(el: Element) { el.remove(); live--; }

/** Coins arcing from one point to another. */
export function coinArc(layer: SVGGElement, from: [number, number], to: [number, number], count: number, onLand?: () => void) {
  const n = reducedMotion() ? Math.min(3, count) : count;
  const tweens: Promise<unknown>[] = [];
  for (let i = 0; i < n; i++) {
    const c = spawn(layer, 'circle', { r: 4.5, fill: '#FFD34D', stroke: '#B8860B', 'stroke-width': 1.5 });
    if (!c) break;
    const mid: [number, number] = [(from[0] + to[0]) / 2 + gsap.utils.random(-12, 12), Math.min(from[1], to[1]) - gsap.utils.random(40, 70)];
    const p = { t: 0 };
    tweens.push(gsap.to(p, {
      t: 1, duration: 0.5, delay: i * 0.05, ease: 'power1.inOut',
      onUpdate: () => {
        const t = p.t;
        const x = (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * mid[0] + t * t * to[0];
        const y = (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * mid[1] + t * t * to[1];
        c.setAttribute('cx', String(x));
        c.setAttribute('cy', String(y));
      },
      onComplete: () => { kill(c); onLand?.(); },
    }).then());
  }
  return Promise.all(tweens);
}

export function burst(layer: SVGGElement, x: number, y: number, opts: { n: number; colors: string[]; spread?: number; up?: number; size?: number; shape?: 'circle' | 'rect'; dur?: number }) {
  const n = reducedMotion() ? Math.ceil(opts.n / 3) : opts.n;
  const ps: Promise<unknown>[] = [];
  for (let i = 0; i < n; i++) {
    const size = (opts.size ?? 3) * gsap.utils.random(0.6, 1.3);
    const fill = opts.colors[i % opts.colors.length];
    const el = opts.shape === 'rect'
      ? spawn(layer, 'rect', { x: -size, y: -size / 2, width: size * 2, height: size, fill })
      : spawn(layer, 'circle', { r: size, fill });
    if (!el) break;
    gsap.set(el, { x, y });
    const a = gsap.utils.random(-Math.PI, 0);
    const v = gsap.utils.random(0.4, 1) * (opts.spread ?? 40);
    const dur = opts.dur ?? 0.7;
    ps.push(gsap.timeline({ onComplete: () => kill(el) })
      .to(el, { x: x + Math.cos(a) * v, duration: dur, ease: 'power2.out' }, 0)
      .to(el, { y: y + Math.sin(a) * v - (opts.up ?? 0), duration: dur * 0.45, ease: 'power2.out' }, 0)
      .to(el, { y: `+=${(opts.up ?? 0) + 30}`, duration: dur * 0.55, ease: 'power2.in' }, dur * 0.45)
      .to(el, { rotation: gsap.utils.random(-360, 360), opacity: 0, duration: dur * 0.4 }, dur * 0.6).then());
  }
  return Promise.all(ps);
}

export const splash = (layer: SVGGElement, x: number, y: number) =>
  burst(layer, x, y, { n: 18, colors: ['#7EC8E3', '#A8DCF0', '#5BA7D1'], spread: 34, up: 14, size: 3 });

export const confetti = (layer: SVGGElement, x: number, y: number) =>
  burst(layer, x, y, { n: 40, colors: ['#E69F00', '#56B4E9', '#CC79A7', '#009E73', '#F0E442'], spread: 90, up: 40, size: 3.5, shape: 'rect', dur: 1.2 });

export const sparkle = (layer: SVGGElement, x: number, y: number) =>
  burst(layer, x, y, { n: 12, colors: ['#FFE07A', '#FFF5C9'], spread: 30, up: 10, size: 2.5 });

export function dust(layer: SVGGElement, x: number, y: number, w = 40) {
  const n = reducedMotion() ? 3 : 9;
  const ps: Promise<unknown>[] = [];
  for (let i = 0; i < n; i++) {
    const c = spawn(layer, 'circle', { r: gsap.utils.random(7, 12), fill: 'var(--dust)', stroke: OUTLINE, 'stroke-width': 2 });
    if (!c) break;
    const dx = gsap.utils.random(-w / 2, w / 2);
    gsap.set(c, { x: x + dx * 0.3, y, scale: 0.2, transformOrigin: '50% 50%' });
    ps.push(gsap.timeline({ onComplete: () => kill(c) })
      .to(c, { x: x + dx, y: y - gsap.utils.random(4, 20), scale: 1, duration: 0.35, ease: 'power2.out' })
      .to(c, { scale: 0, opacity: 0, duration: 0.4, ease: 'power1.in' }).then());
  }
  return Promise.all(ps);
}

export function shake(el: Element, strength = 4) {
  if (reducedMotion()) return;
  gsap.fromTo(el, { x: 0 }, {
    keyframes: [{ x: -strength }, { x: strength }, { x: -strength * 0.6, y: 2 }, { x: strength * 0.5, y: -1 }, { x: 0, y: 0 }],
    duration: 0.32, ease: 'none',
  });
}

/** A pill label that pops in and counts up. Stays until the scene is torn down. */
export function tag(layer: SVGGElement, x: number, y: number, value: number, fmt: (n: number) => string, cls = '') {
  const g = s('g', { class: `tag ${cls}` }, layer);
  gsap.set(g, { x, y });
  const w = Math.max(30, fmt(Math.round(value)).length * 7.5 + 14);
  s('rect', { x: -w / 2, y: -11, width: w, height: 22, rx: 11, class: 'tag-bg', stroke: OUTLINE, 'stroke-width': 2 }, g);
  const t = text(g, 0, 1, fmt(0), { class: 'tag-text' });
  gsap.from(g, { scale: 0, duration: 0.3, ease: 'back.out(2.5)', transformOrigin: '50% 50%' });
  const o = { v: 0 };
  gsap.to(o, { v: value, duration: 0.5, ease: 'power1.out', onUpdate: () => { t.textContent = fmt(Math.round(o.v)); } });
  return g;
}
