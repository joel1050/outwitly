import { gsap } from 'gsap';

export const NS = 'http://www.w3.org/2000/svg';

type Attrs = Record<string, string | number | undefined>;

export function s<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs = {}, parent?: Element): SVGElementTagNameMap[K] {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined) el.setAttribute(k, String(v));
  parent?.appendChild(el);
  return el;
}

export function text(parent: Element, x: number, y: number, str: string, attrs: Attrs = {}) {
  const t = s('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central', ...attrs }, parent);
  t.textContent = str;
  return t;
}

/** Waits on the GSAP clock, so skipping (which speeds the clock up) also shortens waits. */
export const wait = (sec: number) => new Promise<void>((res) => { gsap.delayedCall(sec, res); });

export const OUTLINE = 'var(--outline)';

export const reducedMotion = () =>
  document.documentElement.dataset.motion === 'reduced' ||
  (document.documentElement.dataset.motion !== 'full' && matchMedia('(prefers-reduced-motion: reduce)').matches);
