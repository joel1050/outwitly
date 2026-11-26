import { gsap } from 'gsap';
import { pirates as logic } from './logic';
import type { TimelineEvent } from '../../engine/types';
import { sfx } from '../../render/audio';
import { coinArc, shake, splash, tag } from '../../render/fx';
import { Stage, W } from '../../render/stage';
import { s, text, wait, OUTLINE } from '../../render/svg';

const ol = (w = 3) => ({ stroke: OUTLINE, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
const DECK = 204;
const HEAP_X = 222;

export class PiratesStage extends Stage {
  private heap!: SVGGElement;
  private order: string[] = [];
  private splits: Record<string, number[]> = {};

  protected build() {
    const crew = this.round.params.crew as string[];
    this.order = ['you', ...crew];
    this.splits = this.round.options;
    s('rect', { x: 0, y: 0, width: W, height: 300, class: 'c-sky' }, this.bg);
    s('circle', { cx: 340, cy: 50, r: 22, class: 'c-sun' }, this.bg);
    s('path', { d: 'M60 60 q10 -14 24 -6 q12 -10 22 4 q12 0 10 10 h-58 q-6 -6 2 -8 Z', class: 'c-cloud' }, this.bg);
    const sea = s('path', { d: 'M-20 226 Q20 218 60 226 T140 226 T220 226 T300 226 T380 226 T460 226 V300 H-20 Z', class: 'c-sea' }, this.bg);
    this.loops.push(gsap.to(sea, { x: -40, duration: 4, repeat: -1, ease: 'none' }));

    const ship = s('g', {}, this.props);
    s('line', { x1: 26, y1: DECK, x2: 26, y2: 40, ...ol(6) }, ship);
    s('line', { x1: 26, y1: DECK, x2: 26, y2: 40, stroke: '#8A6440', 'stroke-width': 3 }, ship);
    s('path', { d: 'M26 44 L58 52 L26 60 Z', fill: '#2B2A33', ...ol(2) }, ship);
    s('circle', { cx: 37, cy: 52, r: 3, fill: '#F4EBDD' }, ship);
    s('path', { d: `M-10 ${DECK} H330 L312 262 Q160 274 4 262 Z`, class: 'c-hull', ...ol() }, ship);
    s('rect', { x: -10, y: DECK - 2, width: 340, height: 8, class: 'c-deck', ...ol(2.5) }, ship);
    for (let x = 30; x < 320; x += 48) s('line', { x1: x, y1: DECK + 18, x2: x + 20, y2: DECK + 18, stroke: 'rgba(0,0,0,.2)', 'stroke-width': 2 }, ship);
    s('rect', { x: 318, y: DECK - 2, width: 76, height: 7, rx: 2, fill: '#C79B6B', ...ol(2.5) }, ship);

    this.heap = s('g', {}, this.props);
    gsap.set(this.heap, { x: HEAP_X, y: DECK - 2 });
    const coins: [number, number][] = [[-16, 0], [-6, 0], [4, 0], [14, 0], [-11, -6], [-1, -6], [9, -6], [-6, -12], [4, -12], [-1, -18]];
    for (const [x, y] of coins) s('ellipse', { cx: x, cy: y - 3, rx: 7, ry: 4, fill: '#FFD34D', ...ol(2) }, this.heap);
    text(this.heap, 0, 14, `${this.round.params.gold} gold`, { class: 'small-label' });
    gsap.set(this.heap, { transformOrigin: '50% 100%' });

    const xs: Record<string, number> = { greedy: 46, fair: 104, lazy: 170, you: 284 };
    for (const id of this.order) {
      const a = this.addActor(id, xs[id] ?? 60, DECK - 2, 0.92);
      if (id === 'you') {
        s('path', { d: 'M-23 -40 Q-18 -50 -10 -50 Q-6 -64 0 -64 Q6 -64 10 -50 Q18 -50 23 -40 Q0 -47 -23 -40 Z', fill: '#2B2A33', ...ol(2.5) }, a.bob);
        s('path', { d: 'M-18 -43 Q0 -49 18 -43', fill: 'none', stroke: '#F2C94C', 'stroke-width': 2 }, a.bob);
        s('circle', { cx: 0, cy: -55, r: 3, fill: '#F4EBDD' }, a.bob);
      }
    }
    this.svg.setAttribute('aria-label', logic.setup(this.round));
  }

  preview(optionId: string | null) {
    this.clearPreview();
    this.previewLayer.classList.remove('is-best');
    if (!optionId) return;
    const shares = this.splits[optionId];
    this.order.forEach((id, i) => {
      const a = this.actors[id];
      this.label(this.previewLayer, a.x, a.headY - 14, String(shares[i]), 'ghost-pill');
    });
  }

  /** The result panel names the best split; the deck stays as the vote left it. */
  markBest() {}

  protected looks() {
    for (const id of this.order) this.actors[id].lookAt(HEAP_X, DECK - 10);
  }

  private flag(x: number, top: number, yes: boolean) {
    const g = s('g', {}, this.fx);
    s('line', { x1: x, y1: DECK - 8, x2: x, y2: top, ...ol(2.5) }, g);
    s('path', { d: `M${x} ${top} h22 l-4 8 l4 8 h-22 Z`, class: yes ? 'flag-yes' : 'flag-no', ...ol(2) }, g);
    text(g, x + 10, top + 8.5, yes ? '✓' : '✗', { class: 'flag-mark' });
    gsap.set(g, { transformOrigin: '0% 100%' });
    return g;
  }

  protected async handle(ev: TimelineEvent) {
    switch (ev.t) {
      case 'split': {
        sfx('coin');
        const total = ev.shares.reduce((a, b) => a + b, 0) || 1;
        const all: Promise<unknown>[] = [];
        this.order.forEach((id, i) => {
          const a = this.actors[id];
          if (ev.shares[i] > 0) all.push(coinArc(this.fx, [HEAP_X, DECK - 16], [a.x, a.headY + 10], Math.max(1, Math.round((ev.shares[i] / total) * 14))));
          tag(this.fx, a.x, a.headY - 14, ev.shares[i], (n) => `${n}`, id === 'you' ? 'tag-you' : '');
        });
        gsap.to(this.heap, { scale: 0.35, opacity: 0.5, duration: 0.6 });
        await Promise.all(all);
        await wait(0.2);
        break;
      }
      case 'vote': {
        const a = this.actors[ev.actor];
        const yes = ev.choice === 'yes';
        const f = this.flag(a.x + (ev.actor === 'lazy' ? 30 : 22), a.headY - 4, yes);
        sfx(yes ? 'pop' : 'thud');
        gsap.from(f, { scaleY: 0, duration: 0.3, ease: 'back.out(2.5)' });
        if (!yes) a.setMouth('frown');
        await wait(0.38);
        break;
      }
      case 'tally': {
        if (ev.passed) sfx('cheer'); else { sfx('fail'); shake(this.world, 4); }
        await this.banner(`${ev.yes} of ${this.order.length} yes · ${ev.passed ? 'it passes' : 'it fails'}`, ev.passed ? 'good' : 'bad');
        await wait(0.3);
        break;
      }
      case 'plank': {
        const a = this.actors[ev.actor];
        a.setMouth('o');
        await a.moveTo(330, DECK - 2);
        await a.moveTo(382, DECK - 2);
        await gsap.to(a.squash, { rotation: 18, duration: 0.25, ease: 'power2.in' });
        await gsap.to(a.g, { y: 250, x: 388, duration: 0.35, ease: 'power2.in' });
        sfx('splash');
        shake(this.world, 4);
        void splash(this.fx, 388, 232);
        await gsap.to(a.g, { opacity: 0, duration: 0.2 });
        await wait(0.35);
        break;
      }
      case 'payout':
        break;
      default:
        await super.handle(ev);
    }
  }
}

export default PiratesStage;
