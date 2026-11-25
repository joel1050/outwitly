import { gsap } from 'gsap';
import { CHARACTERS } from '../engine/characters';
import type { Emote } from '../engine/types';
import { s, text, wait, OUTLINE, reducedMotion } from './svg';
import { sfx } from './audio';

export type MouthShape = 'smile' | 'grin' | 'flat' | 'frown' | 'o' | 'smirk';

interface Parts {
  pupils: SVGCircleElement[];
  lids: SVGEllipseElement[];
  mouth: SVGPathElement;
  mouthW: number;
  glasses?: SVGGElement;
  height: number;
  defaultLid: number;
  defaultMouth: MouthShape;
}

const ol = (w = 3) => ({ stroke: OUTLINE, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });

function mouthPath(shape: MouthShape, w: number): { d: string; fill: string } {
  switch (shape) {
    case 'smile': return { d: `M${-w} 0 Q0 ${w} ${w} 0`, fill: 'none' };
    case 'grin': return { d: `M${-w} -1 Q0 ${w * 1.7} ${w} -1 Z`, fill: '#5A2530' };
    case 'flat': return { d: `M${-w * 0.7} 1 L${w * 0.7} 1`, fill: 'none' };
    case 'frown': return { d: `M${-w} ${w * 0.6} Q0 ${-w * 0.5} ${w} ${w * 0.6}`, fill: 'none' };
    case 'o': return { d: `M-2.6 1 a2.6 3.2 0 1 0 5.2 0 a2.6 3.2 0 1 0 -5.2 0`, fill: '#5A2530' };
    case 'smirk': return { d: `M${-w} 1 Q${w * 0.3} ${w * 0.6} ${w} -2`, fill: 'none' };
  }
}

function eye(parent: Element, x: number, y: number, r: number, lidColor: string, parts: Parts, white = '#fff') {
  const g = s('g', { transform: `translate(${x} ${y})` }, parent);
  s('ellipse', { rx: r, ry: r * 1.1, fill: white, ...ol(2) }, g);
  parts.pupils.push(s('circle', { r: r * 0.52, fill: '#22202A' }, g));
  const lid = s('ellipse', { rx: r + 0.6, ry: r * 1.1 + 0.6, cy: 0, fill: lidColor, ...ol(2) }, g);
  parts.lids.push(lid);
}

function mouth(parent: Element, x: number, y: number, w: number, shape: MouthShape, parts: Parts) {
  const m = s('path', { transform: `translate(${x} ${y})`, ...ol(2.4) }, parent);
  const p = mouthPath(shape, w);
  m.setAttribute('d', p.d);
  m.setAttribute('fill', p.fill);
  parts.mouth = m;
  parts.mouthW = w;
  parts.defaultMouth = shape;
}

/** Draws a character with feet at (0,0). Returns the parts the animator needs. */
export function drawCharacter(id: string, parent: SVGGElement): Parts {
  const c = CHARACTERS[id];
  const parts = { pupils: [], lids: [], height: 50, defaultLid: 0, defaultMouth: 'smile' } as unknown as Parts;
  s('ellipse', { cx: 0, cy: 1, rx: id === 'lazy' ? 30 : 20, ry: 4, fill: 'var(--shadow)' }, parent);
  switch (id) {
    case 'you': {
      s('path', { d: 'M0 -46 q-1 -7 2 -11', fill: 'none', ...ol(2.5) }, parent);
      s('ellipse', { cx: 6, cy: -58, rx: 6, ry: 3.6, transform: 'rotate(-25 6 -58)', fill: '#6BBF59', ...ol(2) }, parent);
      s('ellipse', { cx: 0, cy: -24, rx: 18, ry: 24, fill: c.color, ...ol() }, parent);
      s('ellipse', { cx: -11, cy: -20, rx: 3.5, ry: 2, fill: '#F2A7A0' }, parent);
      s('ellipse', { cx: 11, cy: -20, rx: 3.5, ry: 2, fill: '#F2A7A0' }, parent);
      eye(parent, -6, -30, 4.8, c.color, parts);
      eye(parent, 6, -30, 4.8, c.color, parts);
      mouth(parent, 0, -18, 4.5, 'smile', parts);
      parts.height = 60;
      break;
    }
    case 'greedy': {
      s('path', { d: 'M-3 -44 q2 -10 9 -6 q4 3 -1 6', fill: 'none', ...ol(2.5) }, parent);
      s('ellipse', { cx: 0, cy: -23, rx: 27, ry: 23, fill: c.color, ...ol() }, parent);
      s('ellipse', { cx: 0, cy: -11, rx: 14, ry: 8, fill: '#F6C24E' }, parent);
      eye(parent, -9, -29, 5.4, c.color, parts);
      eye(parent, 9, -29, 5.4, c.color, parts);
      mouth(parent, 0, -16, 6, 'smirk', parts);
      parts.height = 52;
      break;
    }
    case 'copycat': {
      s('polygon', { points: '-9,-43 -5,-56 -1,-43', fill: '#E8F6FF', ...ol(2) }, parent);
      s('polygon', { points: '0,-43 5,-61 10,-43', fill: '#CFEFFF', ...ol(2) }, parent);
      s('rect', { x: -17, y: -44, width: 34, height: 44, rx: 14, fill: c.color }, parent);
      s('path', { d: 'M0 -44 H3 a14 14 0 0 1 14 14 V-14 a14 14 0 0 1 -14 14 H0 Z', fill: '#A9DCF7' }, parent);
      s('rect', { x: -17, y: -44, width: 34, height: 44, rx: 14, fill: 'none', ...ol() }, parent);
      eye(parent, -7, -28, 4.8, c.color, parts);
      eye(parent, 7, -28, 4.8, '#A9DCF7', parts);
      mouth(parent, 0, -15, 4, 'smile', parts);
      parts.height = 62;
      break;
    }
    case 'showoff': {
      s('path', { d: 'M-6 -69 q4 -12 14 -8 q-6 2 -5 8', fill: c.accent, ...ol(2.5) }, parent);
      s('rect', { x: -12, y: -70, width: 24, height: 70, rx: 12, fill: c.color, ...ol() }, parent);
      const gl = s('g', { transform: 'translate(0 -54)' }, parent);
      const star = (cx: number) => {
        const pts: string[] = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 ? 3.4 : 8;
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          pts.push(`${cx + r * Math.cos(a)},${r * Math.sin(a)}`);
        }
        s('polygon', { points: pts.join(' '), fill: '#22202A', ...ol(1.5) }, gl);
        s('circle', { cx: cx - 2, cy: -2, r: 1.4, fill: '#fff' }, gl);
      };
      s('line', { x1: -3, y1: 0, x2: 3, y2: 0, ...ol(2.5) }, gl);
      star(-8);
      star(8);
      parts.glasses = gl;
      mouth(parent, 1, -40, 4.5, 'smirk', parts);
      parts.height = 78;
      break;
    }
    case 'loner': {
      s('path', { d: 'M-17 0 C-19 -18 -14 -38 1 -41 C14 -41 19 -22 18 0 Z', fill: c.color, ...ol() }, parent);
      s('path', { d: 'M-12 -10 C-12 -24 -6 -33 3 -34 C12 -33 13 -22 12 -10', fill: 'none', stroke: c.accent, 'stroke-width': 2 }, parent);
      s('ellipse', { cx: 2, cy: -22, rx: 10, ry: 9, fill: c.accent, ...ol(2) }, parent);
      eye(parent, -2, -23, 2.8, c.accent, parts, '#E8EEF7');
      eye(parent, 6, -23, 2.8, c.accent, parts, '#E8EEF7');
      const m = s('path', { transform: 'translate(2 -16)', stroke: '#9DB2CF', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, parent);
      parts.mouth = m;
      parts.mouthW = 2.5;
      parts.defaultMouth = 'flat';
      m.setAttribute('d', mouthPath('flat', 2.5).d);
      m.setAttribute('fill', 'none');
      parts.height = 44;
      break;
    }
    case 'fair': {
      s('rect', { x: -18, y: -38, width: 36, height: 38, rx: 8, fill: c.color, ...ol() }, parent);
      s('line', { x1: 16, y1: -16, x2: 27, y2: -16, ...ol(2.5) }, parent);
      const sc = s('g', { transform: 'translate(28 -16)' }, parent);
      s('line', { x1: 0, y1: 0, x2: 0, y2: -18, ...ol(2) }, sc);
      s('line', { x1: -8, y1: -18, x2: 8, y2: -18, ...ol(2) }, sc);
      s('path', { d: 'M-12 -11 a4 3 0 0 0 8 0 Z M4 -11 a4 3 0 0 0 8 0 Z', fill: '#F6E7B0', ...ol(1.6) }, sc);
      s('path', { d: 'M-8 -18 L-11 -11 M-8 -18 L-5 -11 M8 -18 L5 -11 M8 -18 L11 -11', fill: 'none', stroke: OUTLINE, 'stroke-width': 1 }, sc);
      eye(parent, -7, -25, 4.4, c.color, parts);
      eye(parent, 7, -25, 4.4, c.color, parts);
      mouth(parent, 0, -13, 4, 'flat', parts);
      parts.height = 44;
      break;
    }
    case 'lazy': {
      s('ellipse', { cx: 0, cy: -11, rx: 28, ry: 11, fill: c.color, ...ol() }, parent);
      s('path', { d: 'M-22 -6 q6 4 12 0', fill: 'none', stroke: c.accent, 'stroke-width': 2, 'stroke-linecap': 'round' }, parent);
      eye(parent, 7, -14, 4, c.color, parts);
      eye(parent, 17, -14, 4, c.color, parts);
      mouth(parent, 12, -6, 3, 'smile', parts);
      parts.defaultLid = 0.6;
      parts.height = 26;
      break;
    }
    case 'hero': {
      s('path', { d: 'M-13 -40 Q-22 -18 -24 0 L24 0 Q22 -18 13 -40 Z', fill: '#9E2A2B', ...ol() }, parent);
      s('rect', { x: -15, y: -46, width: 30, height: 46, rx: 12, fill: c.color, ...ol() }, parent);
      s('polygon', { points: '2,-16 -4,-6 0,-6 -2,2 5,-9 1,-9 3,-16', transform: 'translate(0 -2)', fill: '#FFD34D', ...ol(1.4) }, parent);
      eye(parent, -6, -31, 4.4, c.color, parts);
      eye(parent, 6, -31, 4.4, c.color, parts);
      s('path', { d: 'M-12 -40 L-3 -37 M12 -40 L3 -37', ...ol(3) }, parent);
      mouth(parent, 0, -22, 4, 'flat', parts);
      parts.height = 52;
      break;
    }
    case 'cautious': {
      s('ellipse', { cx: 0, cy: -21, rx: 20, ry: 21, fill: c.color, ...ol() }, parent);
      s('path', { d: 'M-21 -29 A21 19 0 0 1 21 -29 Z', fill: '#F0E442', ...ol() }, parent);
      s('path', { d: 'M-4 -47 h8 v-3 h-8 Z', fill: '#F0E442', ...ol(2) }, parent);
      s('line', { x1: -25, y1: -29, x2: 25, y2: -29, ...ol(4) }, parent);
      s('path', { d: 'M-17 -29 Q-19 -14 -9 -9', fill: 'none', stroke: c.accent, 'stroke-width': 1.6 }, parent);
      eye(parent, -7, -21, 4.4, c.color, parts);
      eye(parent, 7, -21, 4.4, c.color, parts);
      mouth(parent, 0, -10, 3.5, 'flat', parts);
      parts.height = 52;
      break;
    }
  }
  for (const lid of parts.lids) gsap.set(lid, { scaleY: parts.defaultLid, transformOrigin: '50% 0%' });
  return parts;
}

/** A small static SVG of a character, for cards. */
export function portrait(id: string, size = 56): SVGSVGElement {
  const svg = s('svg', { viewBox: '-34 -82 68 88', width: size, height: size, 'aria-hidden': 'true', class: 'portrait' });
  const g = s('g', {}, svg);
  // Parts need layout for lids; set after attach via rAF-safe gsap.set (works without layout for scaleY).
  drawCharacter(id, g);
  return svg;
}

export class Actor {
  readonly g: SVGGElement;
  readonly squash: SVGGElement;
  readonly bob: SVGGElement;
  readonly parts: Parts;
  readonly id: string;
  private loops: gsap.core.Animation[] = [];
  private blinkCall?: gsap.core.Tween;
  private dead = false;

  constructor(id: string, layer: SVGGElement, x: number, y: number, scale = 1) {
    this.id = id;
    this.g = s('g', { class: `actor actor-${id}` }, layer);
    this.squash = s('g', {}, this.g);
    this.bob = s('g', {}, this.squash);
    this.parts = drawCharacter(id, this.bob);
    this.lidLevel = this.parts.defaultLid;
    gsap.set(this.g, { x, y, scale });
    gsap.set(this.squash, { transformOrigin: '50% 100%' });
  }

  get x() { return gsap.getProperty(this.g, 'x') as number; }
  get y() { return gsap.getProperty(this.g, 'y') as number; }
  get scale() { return gsap.getProperty(this.g, 'scale') as number; }
  get headY() { return this.y - this.parts.height * this.scale; }

  popIn(delay: number) {
    gsap.fromTo(this.squash, { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(2.2)', delay });
    gsap.delayedCall(delay, () => sfx('pop'));
  }

  startIdle() {
    if (!reducedMotion()) {
      this.loops.push(gsap.to(this.bob, {
        y: -1.6, scaleY: 1.02, duration: gsap.utils.random(0.9, 1.3), ease: 'sine.inOut', yoyo: true, repeat: -1,
        transformOrigin: '50% 100%',
      }));
    }
    const blink = () => {
      if (this.dead) return;
      const lids = this.parts.lids;
      if (lids.length) {
        gsap.timeline()
          .to(lids, { scaleY: 1, duration: 0.06 })
          .to(lids, { scaleY: () => this.lidLevel, duration: 0.1 });
      }
      this.blinkCall = gsap.delayedCall(gsap.utils.random(2, 5), blink);
    };
    this.blinkCall = gsap.delayedCall(gsap.utils.random(0.5, 3), blink);
  }

  private lidLevel = 0;
  setLids(level: number, dur = 0.15) {
    this.lidLevel = level;
    if (this.parts.lids.length) gsap.to(this.parts.lids, { scaleY: level, duration: dur });
  }

  setMouth(shape: MouthShape) {
    const p = mouthPath(shape, this.parts.mouthW);
    this.parts.mouth.setAttribute('d', p.d);
    this.parts.mouth.setAttribute('fill', this.id === 'loner' ? 'none' : p.fill);
  }

  /** Points pupils (or sunglasses) toward a scene point. */
  lookAt(px: number, py: number) {
    const dx = px - this.x;
    const dy = py - (this.y - this.parts.height * 0.6 * this.scale);
    const len = Math.hypot(dx, dy) || 1;
    const k = this.id === 'loner' ? 1.1 : 1.8;
    if (this.parts.pupils.length) gsap.to(this.parts.pupils, { x: (dx / len) * k, y: (dy / len) * k, duration: 0.5, ease: 'power2.out' });
    if (this.parts.glasses) {
      gsap.to(this.parts.glasses, { x: (dx / len) * 1.6, duration: 0.5, ease: 'power2.out' });
    }
  }

  async moveTo(x: number, y: number) {
    const dist = Math.hypot(x - this.x, y - this.y);
    const dur = gsap.utils.clamp(0.3, 0.8, dist / 220);
    if (reducedMotion()) {
      await gsap.to(this.g, { opacity: 0, duration: 0.15 });
      gsap.set(this.g, { x, y });
      await gsap.to(this.g, { opacity: 1, duration: 0.15 });
      return;
    }
    const dir = Math.sign(x - this.x) || 1;
    await gsap.to(this.squash, { scaleY: 0.88, scaleX: 1.08, rotation: -5 * dir, duration: 0.1, ease: 'power2.out' });
    const steps = Math.max(2, Math.round(dur / 0.12));
    gsap.to(this.squash, { rotation: 6 * dir, duration: dur / steps, yoyo: true, repeat: steps - 1, ease: 'sine.inOut' });
    gsap.to(this.squash, { scaleY: 1, scaleX: 1, duration: 0.15 });
    await gsap.to(this.g, { x, y, duration: dur, ease: 'power1.inOut' });
    await gsap.timeline()
      .to(this.squash, { rotation: 0, scaleY: 0.86, scaleX: 1.12, duration: 0.07 })
      .to(this.squash, { scaleY: 1, scaleX: 1, duration: 0.3, ease: 'elastic.out(1, 0.45)' });
  }

  async emote(e: Emote, note?: string) {
    const rm = reducedMotion();
    switch (e) {
      case 'cheer': {
        this.setMouth('grin');
        this.setLids(0);
        if (this.id === 'greedy' && this.parts.pupils.length) gsap.to(this.parts.pupils, { attr: { r: 3.6 }, fill: '#FFD34D', duration: 0.1 });
        if (rm) { await wait(0.4); break; }
        const y0 = this.y;
        await gsap.timeline()
          .to(this.squash, { scaleY: 0.78, scaleX: 1.18, duration: 0.1, ease: 'power2.out' })
          .to(this.squash, { scaleY: 1.12, scaleX: 0.9, duration: 0.12 })
          .to(this.g, { y: y0 - 22, duration: 0.26, ease: 'power2.out' }, '<')
          .to(this.squash, { scaleY: 1, scaleX: 1, duration: 0.15 })
          .to(this.g, { y: y0, duration: 0.2, ease: 'power2.in' }, '<')
          .to(this.squash, { scaleY: 0.82, scaleX: 1.15, duration: 0.07 })
          .to(this.squash, { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
        break;
      }
      case 'sulk': {
        this.setMouth('frown');
        this.setLids(Math.max(0.45, this.parts.defaultLid), 0.3);
        await gsap.to(this.squash, { scaleY: 0.9, scaleX: 1.05, duration: 0.35, ease: 'power2.out' });
        break;
      }
      case 'shock': {
        this.setMouth('o');
        this.setLids(0, 0.05);
        if (this.parts.pupils.length) gsap.to(this.parts.pupils, { scale: 0.5, duration: 0.1, transformOrigin: '50% 50%' });
        if (this.parts.glasses) gsap.to(this.parts.glasses, { y: -6, duration: 0.12, yoyo: true, repeat: 1 });
        if (rm) { await wait(0.3); break; }
        const x0 = this.x;
        const y0 = this.y;
        await gsap.timeline()
          .to(this.g, { x: x0 - 5, y: y0 - 8, duration: 0.12, ease: 'power2.out' })
          .to(this.g, { y: y0, duration: 0.14, ease: 'power2.in' })
          .to(this.squash, { scaleY: 0.88, scaleX: 1.1, duration: 0.06 })
          .to(this.squash, { scaleY: 1, scaleX: 1, duration: 0.3, ease: 'elastic.out(1,0.5)' })
          .to(this.g, { x: x0, duration: 0.3 }, '<');
        break;
      }
      case 'smug': {
        this.setMouth('smirk');
        this.setLids(0.5);
        if (rm) { await wait(0.3); break; }
        await gsap.to(this.squash, { scaleY: 1.06, duration: 0.14, yoyo: true, repeat: 3, ease: 'sine.inOut' });
        break;
      }
      case 'think': {
        await this.bubble(note ?? '…', 'think', 0.9);
        break;
      }
    }
  }

  /** Thought or speech bubble above the head. */
  async bubble(str: string, kind: 'think' | 'say', hold: number) {
    const top = -this.parts.height - 22;
    const b = s('g', { class: 'bubble' }, this.g);
    const w = Math.max(30, str.length * 7.5 + 16);
    if (kind === 'think') {
      s('circle', { cx: 6, cy: -this.parts.height - 4, r: 2.5, fill: 'var(--bubble)', ...ol(1.5) }, b);
      s('circle', { cx: 10, cy: -this.parts.height - 10, r: 3.5, fill: 'var(--bubble)', ...ol(1.5) }, b);
    } else {
      s('path', { d: `M2 ${top + 10} l4 10 l6 -10`, fill: 'var(--bubble)', ...ol(1.5) }, b);
    }
    s('rect', { x: -w / 2 + 8, y: top - 11, width: w, height: 22, rx: 11, fill: 'var(--bubble)', ...ol(1.8) }, b);
    text(b, 8, top, str, { class: 'bubble-text' });
    gsap.set(b, { transformOrigin: '50% 100%', scale: 1 / this.scale });
    await gsap.from(b, { scale: 0, duration: 0.3, ease: 'back.out(2.5)' });
    await wait(hold);
    await gsap.to(b, { opacity: 0, duration: 0.2 });
    b.remove();
  }

  destroy() {
    this.dead = true;
    this.loops.forEach((l) => l.kill());
    this.blinkCall?.kill();
    gsap.killTweensOf([this.g, this.squash, this.bob, ...this.parts.lids, ...this.parts.pupils]);
  }
}
