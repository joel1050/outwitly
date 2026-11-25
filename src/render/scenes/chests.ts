import { gsap } from 'gsap';
import { PUZZLES } from '../../engine/registry';
import type { TimelineEvent } from '../../engine/types';
import { sfx } from '../audio';
import { coinArc, sparkle, tag } from '../fx';
import { Stage, W } from '../stage';
import { s, text, wait, OUTLINE } from '../svg';

const ol = (w = 3) => ({ stroke: OUTLINE, 'stroke-width': w, 'stroke-linejoin': 'round' });
const CHEST_Y = 150;
const SLOT_DX = [0, -22, 22, -11, 11];
const SLOT_DY = [0, 7, 7, 16, 16];

export class ChestsStage extends Stage {
  private chestX: Record<string, number> = {};
  private lids: Record<string, SVGGElement> = {};
  private occupants: Record<string, number> = {};
  private tagged = new Set<string>();

  protected build() {
    const { chests, order } = this.round.params as { chests: number[]; order: string[] };
    // Sea and sand.
    s('rect', { x: 0, y: 0, width: W, height: 300, class: 'c-sand' }, this.bg);
    s('path', { d: 'M0 0 H400 V72 Q350 84 300 74 T200 76 T100 72 T0 78 Z', class: 'c-sea' }, this.bg);
    const foam = s('path', { d: 'M0 78 Q50 70 100 72 T200 76 T300 74 T400 72', fill: 'none', class: 'c-foam', 'stroke-width': 4, 'stroke-linecap': 'round' }, this.bg);
    this.loops.push(gsap.to(foam, { y: 3, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
    for (const [x, y] of [[40, 110], [330, 260], [210, 270], [370, 120], [120, 250]]) {
      s('path', { d: `M${x} ${y} q3 -3 6 0`, fill: 'none', class: 'c-sand-dot', 'stroke-width': 2 }, this.bg);
    }
    // Palm in the corner.
    s('path', { d: 'M18 140 Q24 110 16 84', fill: 'none', stroke: '#8A6440', 'stroke-width': 6, 'stroke-linecap': 'round' }, this.bg);
    s('path', { d: 'M16 84 q-20 -2 -26 10 M16 84 q18 -8 30 4 M16 84 q-6 -16 -22 -14 M16 84 q10 -14 26 -12', fill: 'none', stroke: '#4E8B4A', 'stroke-width': 5, 'stroke-linecap': 'round' }, this.bg);

    const n = chests.length;
    chests.forEach((v, i) => {
      const x = 70 + (i * (W - 140)) / (n - 1);
      const id = `c${v}`;
      this.chestX[id] = x;
      this.occupants[id] = 0;
      const g = s('g', { class: 'chest' }, this.props);
      gsap.set(g, { x, y: CHEST_Y });
      s('ellipse', { cx: 0, cy: 2, rx: 32, ry: 6, fill: 'var(--shadow)' }, g);
      s('rect', { x: -26, y: -28, width: 52, height: 30, rx: 4, fill: '#A0643A', ...ol() }, g);
      s('line', { x1: -26, y1: -16, x2: 26, y2: -16, stroke: '#7A4A27', 'stroke-width': 3 }, g);
      const lid = s('g', {}, g);
      s('path', { d: 'M-27 -28 Q-27 -44 0 -46 Q27 -44 27 -28 Z', fill: '#B87444', ...ol() }, lid);
      s('rect', { x: -4, y: -32, width: 8, height: 9, rx: 2, fill: '#F2C94C', ...ol(2) }, lid);
      gsap.set(lid, { transformOrigin: '0% 100%' });
      this.lids[id] = lid;
      // Value plate.
      s('rect', { x: -20, y: -14, width: 40, height: 16, rx: 5, fill: '#FFF4D6', ...ol(2) }, g);
      text(g, 0, -6, String(v), { class: 'chest-num' });
      s('circle', { cx: 0, cy: -60, r: 0, class: 'chest-anchor' }, g);
    });

    order.forEach((id, i) => {
      const x = 46 + i * ((W - 92) / (order.length - 1));
      this.addActor(id, x, 286, 0.9);
    });
    this.svg.setAttribute('aria-label', PUZZLES.chests.setup(this.round));
  }

  preview(optionId: string | null) {
    this.clearPreview();
    this.previewLayer.classList.remove('is-best');
    if (!optionId) return;
    const x = this.chestX[optionId];
    this.ring(this.previewLayer, x, CHEST_Y - 18, 40, 38);
    const arrow = s('path', { d: `M${x - 8} ${CHEST_Y - 78} h16 l-8 12 Z`, class: 'ring-arrow' }, this.previewLayer);
    gsap.to(arrow, { y: -4, duration: 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  protected looks(optionId: string | null) {
    // Each character glances at the chest its rule would pick if you chose this option.
    const pick = optionId ?? `c${Math.max(...(this.round.params.chests as number[]))}`;
    const out = PUZZLES.chests.resolve(this.round, pick);
    for (const ev of out.events) {
      if (ev.t === 'move' && ev.actor !== 'you') this.actors[ev.actor].lookAt(this.chestX[ev.to], CHEST_Y - 20);
    }
    this.actors.you.lookAt(optionId ? this.chestX[optionId] : W / 2, CHEST_Y - 20);
  }

  protected async handle(ev: TimelineEvent) {
    switch (ev.t) {
      case 'move': {
        const k = this.occupants[ev.to]++;
        const a = this.actors[ev.actor];
        a.lookAt(this.chestX[ev.to], CHEST_Y);
        sfx('step');
        await a.moveTo(this.chestX[ev.to] + SLOT_DX[k], 214 + SLOT_DY[k]);
        this.sortActors();
        break;
      }
      case 'open': {
        const lid = this.lids[ev.target];
        sfx('coin');
        gsap.timeline()
          .to(lid, { y: -6, rotation: -28, duration: 0.18, ease: 'back.out(3)' })
          .to(lid, { y: 0, duration: 0.2 });
        sparkle(this.fx, this.chestX[ev.target], CHEST_Y - 30);
        await wait(0.12);
        break;
      }
      case 'payout': {
        const a = this.actors[ev.actor];
        const chest = Object.entries(this.chestX).reduce((b, [id, x]) => (Math.abs(x - a.x) < Math.abs(this.chestX[b] - a.x) ? id : b), Object.keys(this.chestX)[0]);
        const coins = Math.max(2, Math.min(9, Math.round(ev.amount / 8)));
        let first = true;
        void coinArc(this.fx, [this.chestX[chest], CHEST_Y - 30], [a.x, a.headY + 20], coins, () => { if (first) { sfx('coin'); first = false; } });
        await wait(0.22);
        if (ev.actor === 'you') {
          tag(this.fx, a.x, a.headY - 12, ev.amount, (n) => `+${n}`, 'tag-you');
        } else if (!this.tagged.has(chest)) {
          this.tagged.add(chest);
          const each = this.occupants[chest] > 1 ? ' each' : '';
          tag(this.fx, this.chestX[chest], CHEST_Y - 62, ev.amount, (n) => `${n}${each}`);
        }
        break;
      }
      default:
        break;
    }
  }
}
