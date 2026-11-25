import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { PUZZLES } from '../../engine/registry';
import type { TimelineEvent } from '../../engine/types';
import { sfx } from '../audio';
import { dust, shake, burst } from '../fx';
import { Stage, W } from '../stage';
import { s, text, wait, OUTLINE, reducedMotion } from '../svg';

gsap.registerPlugin(MotionPathPlugin);

const ol = (w = 3) => ({ stroke: OUTLINE, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
const JX = 200;
const JY = 178;
const BRANCH: Record<string, string> = {
  straight: `M${JX} ${JY} L${JX} 30`,
  left: `M${JX} ${JY} C${JX} 120 150 78 60 56`,
  right: `M${JX} ${JY} C${JX} 120 250 78 340 56`,
};
const END: Record<string, [number, number]> = { straight: [200, 44], left: [62, 52], right: [338, 52] };
const PEOPLE_COLORS = ['#E9B8A0', '#9DB4C0', '#C9A9D9', '#F1D38A', '#A8C69F', '#E8A3A3'];
const LEVER: Record<string, [number, number]> = { you: [140, 246], hero: [260, 246] };

export class JunctionStage extends Stage {
  private sticks: Record<string, SVGGElement> = {};
  private heading!: SVGPathElement;
  private trolley!: SVGGElement;
  private groups: Record<string, SVGGElement[]> = {};
  private exits: Record<string, number> = {};
  private headingExit = 'straight';

  protected build() {
    this.exits = this.round.params.exits;
    s('rect', { x: 0, y: 0, width: W, height: 300, class: 'c-grass' }, this.bg);
    for (const [x, y] of [[30, 150], [370, 160], [90, 120], [320, 120], [40, 260], [360, 230]]) {
      s('path', { d: `M${x} ${y} l3 -7 l3 7 M${x + 5} ${y} l3 -5 l2 5`, fill: 'none', class: 'c-tuft', 'stroke-width': 2 }, this.bg);
    }
    // Rails.
    const rails = s('g', {}, this.props);
    const trunk = `M${JX} 320 L${JX} ${JY}`;
    for (const d of [trunk, ...Object.values(BRANCH)]) {
      s('path', { d, fill: 'none', class: 'c-ballast', 'stroke-width': 26, 'stroke-linecap': 'round' }, rails);
    }
    for (const d of [trunk, ...Object.values(BRANCH)]) {
      s('path', { d, fill: 'none', class: 'c-sleeper', 'stroke-width': 20, 'stroke-dasharray': '4 9' }, rails);
      s('path', { d, fill: 'none', class: 'c-rail', 'stroke-width': 13 }, rails);
      s('path', { d, fill: 'none', class: 'c-ballast', 'stroke-width': 8 }, rails);
    }
    this.heading = s('path', { d: BRANCH.straight, fill: 'none', class: 'heading-line', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': '10 10' }, this.props);
    if (!reducedMotion()) this.loops.push(gsap.to(this.heading, { strokeDashoffset: -40, duration: 1, repeat: -1, ease: 'none' }));

    // People.
    for (const exit of Object.keys(END)) {
      const [ex, ey] = END[exit];
      const n = this.exits[exit];
      const g = s('g', {}, this.props);
      this.groups[exit] = [];
      const cols = Math.min(3, n);
      for (let i = 0; i < n; i++) {
        const px = ex + ((i % cols) - (cols - 1) / 2) * 14;
        const py = ey + Math.floor(i / cols) * 13 - 4;
        const p = s('g', {}, g);
        gsap.set(p, { x: px, y: py });
        s('rect', { x: -5, y: -6, width: 10, height: 12, rx: 5, fill: PEOPLE_COLORS[(i + exit.length) % PEOPLE_COLORS.length], ...ol(2) }, p);
        s('circle', { cx: 0, cy: -9, r: 4.5, fill: '#F6DCC4', ...ol(2) }, p);
        this.groups[exit].push(p);
        if (!reducedMotion()) this.loops.push(gsap.to(p, { y: py - 1.5, duration: gsap.utils.random(0.3, 0.6), yoyo: true, repeat: -1, ease: 'sine.inOut', delay: Math.random() }));
      }
      const bx = exit === 'straight' ? ex + 36 : exit === 'left' ? ex : ex;
      const by = exit === 'straight' ? ey - 4 : ey + 30;
      s('circle', { cx: bx, cy: by, r: 11, class: 'count-badge', ...ol(2) }, g);
      text(g, bx, by + 1, String(n), { class: 'count-text' });
    }

    // Levers.
    for (const who of ['you', 'hero']) {
      const [lx, ly] = LEVER[who];
      const g = s('g', {}, this.props);
      gsap.set(g, { x: lx, y: ly });
      const stick = s('g', {}, g);
      s('line', { x1: 0, y1: 0, x2: 0, y2: -30, ...ol(5) }, stick);
      s('line', { x1: 0, y1: 0, x2: 0, y2: -30, stroke: '#C9C3B8', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, stick);
      s('circle', { cx: 0, cy: -32, r: 6, fill: who === 'you' ? '#F4EBDD' : '#D55E00', ...ol(2.5) }, stick);
      gsap.set(stick, { rotation: -32, transformOrigin: '50% 100%' });
      s('rect', { x: -14, y: -4, width: 28, height: 12, rx: 4, fill: '#7E7A86', ...ol(2.5) }, g);
      text(g, 0, 20, who === 'you' ? 'yours' : 'Hero’s', { class: 'lever-label' });
      this.sticks[who] = stick;
    }

    // Trolley, waiting at the bottom.
    this.trolley = s('g', {}, this.props);
    s('rect', { x: -15, y: -19, width: 30, height: 38, rx: 6, fill: '#5C6B8A', ...ol(2.5) }, this.trolley);
    s('rect', { x: -10, y: -14, width: 20, height: 14, rx: 3, fill: '#A9C4E6', ...ol(2) }, this.trolley);
    s('circle', { cx: -6, cy: -19, r: 3, fill: '#FFE07A', ...ol(1.5) }, this.trolley);
    s('circle', { cx: 6, cy: -19, r: 3, fill: '#FFE07A', ...ol(1.5) }, this.trolley);
    gsap.set(this.trolley, { x: JX, y: 300 });

    this.addActor('you', 95, 290, 0.85);
    this.addActor('hero', 305, 290, 0.85);
    this.svg.setAttribute('aria-label', PUZZLES.junction.setup(this.round));
  }

  preview(optionId: string | null) {
    this.clearPreview();
    this.previewLayer.classList.remove('is-best');
    if (!optionId) return;
    const who = optionId === 'jam' ? 'hero' : 'you';
    const [lx, ly] = LEVER[who];
    this.ring(this.previewLayer, lx, ly - 12, 30, 30);
    if (optionId === 'pull') {
      s('line', { x1: lx, y1: ly, x2: lx + 18, y2: ly - 25, class: 'ghost', 'stroke-width': 5, 'stroke-linecap': 'round' }, this.previewLayer);
    }
    if (optionId === 'jam') this.lock(this.previewLayer, lx, ly - 18, true);
    if (optionId === 'leave') text(this.previewLayer, lx, ly - 52, 'hands off', { class: 'ghost-text' });
  }

  protected looks() {
    this.actors.you.lookAt(LEVER.you[0], LEVER.you[1]);
    this.actors.hero.lookAt(JX, 120);
  }

  private lock(layer: SVGGElement, x: number, y: number, ghost = false) {
    const g = s('g', { class: ghost ? 'ghost-lock' : 'lock' }, layer);
    gsap.set(g, { x, y });
    s('path', { d: 'M-6 -2 v-6 a6 6 0 0 1 12 0 v6', fill: 'none', ...ol(3) }, g);
    s('rect', { x: -9, y: -3, width: 18, height: 14, rx: 3, fill: '#F2C94C', ...ol(2.5) }, g);
    s('circle', { cx: 0, cy: 4, r: 2, fill: OUTLINE }, g);
    return g;
  }

  protected async handle(ev: TimelineEvent) {
    switch (ev.t) {
      case 'lever': {
        const a = this.actors[ev.actor];
        const [lx, ly] = LEVER[ev.actor];
        if (ev.state === 'pulled') {
          a.lookAt(lx, ly);
          await gsap.to(this.sticks[ev.actor], { rotation: -44, duration: 0.18, ease: 'power2.out' });
          await gsap.to(this.sticks[ev.actor], { rotation: 32, duration: 0.16, ease: 'back.out(3)' });
          sfx('clunk');
          shake(this.world, 2);
          await wait(0.25);
        } else if (ev.state === 'jammed') {
          const l = this.lock(this.fx, lx, ly - 18);
          sfx('clunk');
          await gsap.from(l, { scale: 2.2, opacity: 0, duration: 0.3, ease: 'back.out(2)' });
          await wait(0.2);
        } else if (ev.actor === 'you') {
          await a.bubble('hands off', 'say', 0.6);
        }
        break;
      }
      case 'heading': {
        this.headingExit = ev.exit;
        this.heading.setAttribute('d', BRANCH[ev.exit]);
        await gsap.fromTo(this.heading, { opacity: 0.2 }, { opacity: 1, duration: 0.3 });
        const [ex, ey] = END[ev.exit];
        const b = this.label(this.fx, ex, ey + (ev.exit === 'straight' ? 34 : 50), `heading: ${this.exits[ev.exit]}`, 'heading-tag');
        gsap.from(b, { scale: 0, transformOrigin: '50% 50%', duration: 0.25, ease: 'back.out(2)' });
        await wait(0.55);
        b.remove();
        break;
      }
      case 'emote': {
        if (ev.emote === 'think') {
          await this.actors[ev.actor].bubble(`${this.exits[this.headingExit]} > 2!`, 'think', 0.55);
        }
        break;
      }
      case 'trolley': {
        const path = `M${JX} 300 L${JX} ${JY} ${BRANCH[ev.path].replace(`M${JX} ${JY}`, '')}`;
        const guide = s('path', { d: path, fill: 'none', stroke: 'none' }, this.fx);
        this.actors.you.lookAt(JX, 150);
        sfx('rumble');
        gsap.to(this.heading, { opacity: 0, duration: 0.3 });
        await gsap.to(this.trolley, {
          duration: reducedMotion() ? 0.8 : 1.5, ease: 'power1.in',
          motionPath: { path: guide, align: guide, alignOrigin: [0.5, 0.5], autoRotate: 90, end: 0.92 },
        });
        guide.remove();
        const [ex, ey] = END[ev.path];
        sfx('poof');
        shake(this.world, 4);
        void dust(this.fx, ex, ey, 60);
        burst(this.fx, ex, ey - 10, { n: 8, colors: ['#FFE07A'], spread: 30, up: 12, size: 2.5 });
        gsap.killTweensOf(Object.values(this.groups).flat(), 'y');
        for (const p of this.groups[ev.path]) {
          gsap.to(p, { rotation: gsap.utils.random(-100, 100), scaleY: 0.55, duration: 0.25, ease: 'power2.out', transformOrigin: '50% 100%' });
        }
        for (const [exit, ps] of Object.entries(this.groups)) {
          if (exit === ev.path) continue;
          gsap.to(ps, { y: '-=8', duration: 0.18, yoyo: true, repeat: 3, stagger: 0.03, ease: 'power1.out' });
        }
        await wait(0.45);
        this.label(this.fx, ex, ey + 34, `${this.exits[ev.path]} hit`, 'hit-tag');
        break;
      }
      default:
        break;
    }
  }
}
