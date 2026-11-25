import { gsap } from 'gsap';
import { CHARACTERS } from '../../engine/characters';
import { PUZZLES } from '../../engine/registry';
import type { Outcome, TimelineEvent } from '../../engine/types';
import { sfx } from '../audio';
import { burst, shake, splash } from '../fx';
import { Stage, W } from '../stage';
import { s, wait, OUTLINE, reducedMotion } from '../svg';

const ol = (w = 3) => ({ stroke: OUTLINE, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
const POS: Record<string, [number, number, number]> = { you: [78, 258, 1], cautious: [322, 258, 1], showoff: [200, 132, 0.85] };
const ACC_TEXT = (q: string) => (q === '1/1' ? 'never misses' : `hits ${q.replace('/', ' in ')}`);

export class DuelStage extends Stage {
  private front!: SVGGElement;

  protected build() {
    s('rect', { x: 0, y: 0, width: W, height: 300, class: 'c-grass' }, this.bg);
    s('rect', { x: 0, y: 0, width: W, height: 60, class: 'c-sky' }, this.bg);
    for (let x = -4; x < W; x += 22) s('path', { d: `M${x} 70 V48 l6 -6 l6 6 V70 Z`, class: 'c-fence', ...ol(2) }, this.bg);
    s('rect', { x: 0, y: 56, width: W, height: 5, class: 'c-fence', ...ol(2) }, this.bg);
    for (const [x, y, c] of [[40, 110, '#F28FB0'], [360, 112, '#FFD34D'], [140, 220, '#B9A6E0'], [262, 214, '#F28FB0'], [200, 284, '#FFD34D']] as const) {
      s('circle', { cx: x, cy: y, r: 4, fill: c, ...ol(1.5) }, this.bg);
    }
    this.front = s('g', {}, this.world);
    this.world.insertBefore(this.front, this.fx);

    const acc = this.round.params.accuracy as Record<string, string>;
    for (const id of this.round.params.order as string[]) {
      const [x, y, k] = POS[id];
      this.addActor(id, x, y, k);
      const hedge = s('g', {}, this.front);
      gsap.set(hedge, { x, y: y + 2, scale: k });
      s('path', { d: 'M-34 4 Q-38 -14 -22 -14 Q-18 -26 -4 -20 Q6 -30 18 -20 Q34 -24 34 -8 Q40 0 34 6 Z', class: 'c-hedge', ...ol(2.5) }, hedge);
      s('path', { d: 'M-18 -6 q4 -4 8 0 M6 -10 q4 -4 8 0', fill: 'none', class: 'c-hedge-line', 'stroke-width': 2 }, hedge);
      this.label(this.front, x, y + 22 * k, ACC_TEXT(acc[id]), 'acc-pill');
    }
    this.svg.setAttribute('aria-label', PUZZLES.duel.setup(this.round));
  }

  preview(optionId: string | null) {
    this.clearPreview();
    this.previewLayer.classList.remove('is-best');
    if (!optionId) return;
    if (optionId === 'air') {
      const g = s('g', { class: 'ring-arrow-g' }, this.previewLayer);
      s('path', { d: 'M78 186 V130 M66 142 L78 128 L90 142', fill: 'none', class: 'aim', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      gsap.to(g, { y: -6, duration: 0.45, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      return;
    }
    const a = this.actors[optionId];
    const cy = a.y - a.parts.height * a.scale * 0.55;
    const g = s('g', {}, this.previewLayer);
    gsap.set(g, { x: a.x, y: cy });
    s('circle', { r: 20, fill: 'none', class: 'aim', 'stroke-width': 3 }, g);
    s('path', { d: 'M-28 0 H-12 M12 0 H28 M0 -28 V-12 M0 12 V28', class: 'aim', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    if (!reducedMotion()) gsap.to(g, { rotation: 90, duration: 2, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
  }

  protected looks(optionId: string | null) {
    this.actors.cautious.lookAt(...this.head('showoff'));
    this.actors.showoff.lookAt(...this.head('cautious'));
    if (optionId && optionId !== 'air') this.actors.you.lookAt(...this.head(optionId));
    else this.actors.you.lookAt(78, 60);
  }

  private head(id: string): [number, number] {
    const a = this.actors[id];
    return [a.x, a.y - a.parts.height * a.scale * 0.6];
  }

  async play(outcome: Outcome) {
    await this.banner('One way it could go', 'info', 0.9);
    await super.play(outcome);
    const last = [...outcome.events].reverse().find((e) => e.t === 'emote');
    const winner = last && last.t === 'emote' ? last.actor : 'you';
    await this.banner(winner === 'you' ? 'You’re the last one dry!' : `${CHARACTERS[winner].name} is the last one dry`, winner === 'you' ? 'good' : 'bad');
  }

  protected async handle(ev: TimelineEvent) {
    if (ev.t !== 'throw') return;
    const from = this.head(ev.actor);
    const b = s('g', {}, this.fx);
    s('circle', { r: 7, fill: '#5BA7D1', ...ol(2) }, b);
    s('path', { d: 'M-2 7 l2 3 l2 -3', fill: '#5BA7D1', ...ol(1.5) }, b);
    s('circle', { cx: -2.5, cy: -2.5, r: 2, fill: '#CDEAF7' }, b);
    gsap.set(b, { x: from[0], y: from[1] });
    const thrower = this.actors[ev.actor];
    await gsap.timeline()
      .to(thrower.squash, { scaleY: 0.86, scaleX: 1.1, duration: 0.12 })
      .to(thrower.squash, { scaleY: 1, scaleX: 1, duration: 0.2, ease: 'back.out(3)' });
    sfx('whoosh');

    if (ev.target === 'air') {
      await gsap.to(b, { y: -20, duration: 0.55, ease: 'power2.out' });
      b.remove();
      const cloud = s('g', {}, this.fx);
      gsap.set(cloud, { x: from[0], y: 34 });
      for (const [cx, r] of [[-12, 9], [0, 12], [12, 9]]) s('circle', { cx, cy: 0, r, fill: '#EAF4FA', ...ol(2) }, cloud);
      sfx('balloonpop');
      sfx('drizzle');
      await gsap.from(cloud, { scale: 0, duration: 0.3, ease: 'back.out(3)', transformOrigin: '50% 50%' });
      void burst(this.fx, from[0], 40, { n: 8, colors: ['#7EC8E3'], spread: 16, up: -10, size: 2 });
      await wait(0.35);
      gsap.to(cloud, { opacity: 0, duration: 0.5, onComplete: () => cloud.remove() });
      return;
    }

    const to = this.head(ev.target);
    const miss: [number, number] = [to[0] + (to[0] - from[0]) * 0.25 + 10, to[1] + 40];
    const end = ev.hit ? to : miss;
    const mid: [number, number] = [(from[0] + end[0]) / 2, Math.min(from[1], end[1]) - 60];
    const p = { t: 0 };
    await gsap.to(p, {
      t: 1, duration: 0.55, ease: 'power1.inOut',
      onUpdate: () => {
        const t = p.t;
        gsap.set(b, {
          x: (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * mid[0] + t * t * end[0],
          y: (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * mid[1] + t * t * end[1],
          rotation: t * 360,
        });
      },
    });
    b.remove();
    sfx(ev.hit ? 'splash' : 'splat');
    void splash(this.fx, end[0], end[1]);
    if (ev.hit) {
      shake(this.world, 3);
      this.soak(ev.target);
      await wait(0.3);
    } else {
      this.label(this.fx, end[0], end[1] + 12, 'miss', 'miss-tag');
      await wait(0.3);
    }
  }

  private soak(id: string) {
    const a = this.actors[id];
    s('ellipse', { cx: 0, cy: -a.parts.height * 0.5, rx: 22, ry: a.parts.height * 0.5, fill: '#5BA7D1', opacity: 0.35 }, a.bob);
    const [hx, hy] = this.head(id);
    if (reducedMotion()) return;
    for (let i = 0; i < 3; i++) {
      const d = s('circle', { r: 2.2, fill: '#5BA7D1' }, this.fx);
      this.loops.push(gsap.fromTo(d, { x: hx - 10 + i * 10, y: hy, opacity: 1 }, { y: hy + 28, opacity: 0, duration: 0.8, repeat: -1, delay: i * 0.25, ease: 'power1.in' }));
    }
  }
}
