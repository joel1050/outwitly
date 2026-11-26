import { gsap } from 'gsap';
import logic from '../../../../src/games/cookie-cut/logic';
import { CHARACTERS } from '../../../../src/engine/characters';
import type { CookieTray, Outcome, TimelineEvent } from '../../../../src/engine/types';
import { sfx } from '../../../../src/render/audio';
import { burst, shake, sparkle, tag } from '../../../../src/render/fx';
import { Stage, W } from '../../../../src/render/stage';
import { s, text, wait, OUTLINE, reducedMotion } from '../../../../src/render/svg';

const ol = (w = 3) => ({ stroke: OUTLINE, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
const ROW_Y = 146;
const X0 = 34;
const X1 = 366;
const TABLE_TOP = 102;
const TABLE_BOTTOM = 216;
const GAP = 9;
const FEET = 290;
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
/** Keeps a pill of this text fully inside the scene. */
const fit = (x: number, str: string) => {
  const half = (str.length * 7.5 + 18) / 2 + 4;
  return Math.min(W - half, Math.max(half, x));
};

const STYLE = `
.cookie-cut-wall { fill: var(--panel-2); }
.cookie-cut-tile { fill: none; stroke: var(--cobble); stroke-width: 2; }
.cookie-cut-floor { fill: var(--stone); }
.cookie-cut-table { fill: var(--deck); }
.cookie-cut-lip { fill: var(--hull); }
.cookie-cut-pts { font-size: 10px; fill: #2b2a33; }
`;

type Side = 'left' | 'right';

export class CookieCutStage extends Stage {
  private pts: number[] = [];
  private step = 0;
  private cookies: SVGGElement[] = [];
  private pills: SVGGElement[] = [];
  private sheet!: SVGGElement;
  private trays: Partial<Record<Side, SVGGElement>> = {};
  private counts: SVGGElement[] = [];
  private after = 0;
  private rival = 'greedy';
  private result?: { kept: CookieTray; taken: CookieTray };

  private cx(i: number) { return X0 + this.step * (i + 0.5); }
  private gapX(after: number) { return X0 + this.step * after; }
  /** Centre of the cookies on one side of a cut, in the row's resting place. */
  private sideX(after: number, side: Side) {
    const [a, b] = side === 'left' ? [0, after - 1] : [after, this.pts.length - 1];
    return (this.cx(a) + this.cx(b)) / 2;
  }

  protected build() {
    this.pts = this.round.params.cookiePoints as number[];
    this.rival = this.round.characters[0].id;
    const n = this.pts.length;
    this.step = (X1 - X0) / n;
    const r = Math.min(15, this.step * 0.4);
    const lo = Math.min(...this.pts);
    const hi = Math.max(...this.pts);

    s('style', {}, this.svg).textContent = STYLE;

    // Kitchen wall, window and floor.
    s('rect', { x: 0, y: 0, width: W, height: 300, class: 'cookie-cut-wall' }, this.bg);
    for (let y = 18; y < TABLE_TOP; y += 22) s('line', { x1: 0, y1: y, x2: W, y2: y, class: 'cookie-cut-tile' }, this.bg);
    for (let row = 0, y = 0; y < TABLE_TOP; row++, y += 22) {
      for (let x = (row % 2) * 22; x < W; x += 44) s('line', { x1: x, y1: y - 4, x2: x, y2: y + 18, class: 'cookie-cut-tile' }, this.bg);
    }
    s('rect', { x: 0, y: TABLE_BOTTOM, width: W, height: 300 - TABLE_BOTTOM, class: 'cookie-cut-floor' }, this.bg);
    const win = s('g', {}, this.bg);
    s('rect', { x: 300, y: 18, width: 74, height: 58, rx: 6, class: 'c-sky', ...ol(3) }, win);
    s('path', { d: 'M337 18 V76 M300 47 H374', ...ol(3) }, win);
    s('path', { d: 'M306 70 q10 -16 24 -4 q10 -10 20 2', fill: 'none', class: 'c-tuft', 'stroke-width': 2 }, win);
    // A jar on a shelf.
    s('rect', { x: 26, y: 62, width: 92, height: 7, rx: 2, fill: '#A0643A', ...ol(2.5) }, this.bg);
    s('rect', { x: 40, y: 36, width: 26, height: 26, rx: 6, fill: '#E3EEF2', ...ol(2.5) }, this.bg);
    s('rect', { x: 38, y: 31, width: 30, height: 7, rx: 3, fill: '#D55E00', ...ol(2) }, this.bg);
    s('circle', { cx: 53, cy: 50, r: 6, fill: '#C98F3F', ...ol(1.5) }, this.bg);
    s('path', { d: 'M84 62 v-18 h20 v18', fill: '#F2C94C', ...ol(2.5) }, this.bg);

    // Table.
    s('rect', { x: -10, y: TABLE_TOP, width: W + 20, height: TABLE_BOTTOM - TABLE_TOP, class: 'cookie-cut-table', ...ol(3) }, this.bg);
    s('rect', { x: -10, y: TABLE_BOTTOM - 12, width: W + 20, height: 12, class: 'cookie-cut-lip', ...ol(3) }, this.bg);
    for (const y of [124, 172, 196]) s('line', { x1: 0, y1: y, x2: W, y2: y, stroke: 'rgba(0,0,0,.12)', 'stroke-width': 2 }, this.bg);

    // Baking sheet under the whole row.
    this.sheet = s('g', {}, this.props);
    this.tray(this.sheet, X0 - 6, X1 + 6);

    // Cookies, each with its points underneath.
    this.pts.forEach((v, i) => {
      const g = s('g', {}, this.props);
      gsap.set(g, { x: this.cx(i), y: ROW_Y });
      const choc = hi > lo && v === hi;
      const mid = hi > lo && v > lo && v < hi;
      s('circle', { r, fill: choc ? '#8B5A2B' : mid ? '#C98F3F' : '#E8B96A', ...ol(2.5) }, g);
      const spots: [number, number][] = [[-0.4, -0.3], [0.35, -0.4], [0.1, 0.15], [-0.3, 0.4], [0.45, 0.35]];
      spots.forEach(([dx, dy], k) => {
        if (choc || mid) s('ellipse', { cx: dx * r, cy: dy * r, rx: r * 0.17, ry: r * 0.13, fill: '#3E2414' }, g);
        else if (k % 2 === 0) s('circle', { cx: dx * r, cy: dy * r, r: r * 0.08, fill: '#B07A35' }, g);
      });
      const pill = s('g', {}, g);
      gsap.set(pill, { y: r + 13 });
      const pw = Math.max(16, String(v).length * 7 + 9);
      s('rect', { x: -pw / 2, y: -8, width: pw, height: 16, rx: 8, fill: choc ? '#FFE2A8' : '#fff', ...ol(2) }, pill);
      text(pill, 0, 0.5, String(v), { class: 'cookie-cut-pts' });
      this.cookies.push(g);
      this.pills.push(pill);
    });

    this.addActor('you', 84, FEET, 0.95);
    this.addActor(this.rival, 316, FEET, 0.95);
    this.svg.setAttribute('aria-label', logic.setup(this.round));
  }

  /** A baking tray spanning x0..x1, drawn into g around the row's height. */
  private tray(g: SVGGElement, x0: number, x1: number) {
    s('rect', { x: x0, y: ROW_Y - 22, width: x1 - x0, height: 52, rx: 9, fill: '#B9C2CC', ...ol(3) }, g);
    s('rect', { x: x0 + 5, y: ROW_Y - 17, width: x1 - x0 - 10, height: 42, rx: 6, fill: '#D6DCE2', stroke: '#9AA4AF', 'stroke-width': 1.5 }, g);
  }

  preview(optionId: string | null) {
    this.clearPreview();
    this.previewLayer.classList.remove('is-best');
    if (!optionId) return;
    const after = Number(optionId.replace('cut', ''));
    this.knifeMark(after);
    for (const side of ['left', 'right'] as Side[]) {
      const count = side === 'left' ? after : this.pts.length - after;
      const str = plural(count, 'cookie');
      this.label(this.previewLayer, fit(this.sideX(after, side), str), TABLE_TOP - 14, str, 'ghost-pill');
    }
  }

  private knifeMark(after: number) {
    const x = this.gapX(after);
    this.ring(this.previewLayer, x, ROW_Y + 4, 14, 38);
    s('line', { x1: x, y1: ROW_Y - 40, x2: x, y2: ROW_Y + 48, class: 'ghost', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '6 5' }, this.previewLayer);
  }

  /** After the round the trays have moved, so mark the best cut with a gold line and a pill. */
  markBest(optionId: string) {
    this.clearPreview();
    this.previewLayer.classList.add('is-best');
    const after = Number(optionId.replace('cut', ''));
    const x = this.gapX(after);
    s('line', { x1: x, y1: 68, x2: x, y2: TABLE_BOTTOM - 14, class: 'ghost', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '6 5' }, this.previewLayer);
    const str = `best: cut after ${after}`;
    const g = this.label(this.previewLayer, fit(x, str), 58, str, 'ghost-pill');
    gsap.from(g, { opacity: 0, duration: 0.3 });
  }

  protected looks(optionId: string | null) {
    const you = this.actors.you;
    const rival = this.actors[this.rival];
    if (!optionId) {
      you.lookAt(W / 2, ROW_Y);
      // The rival eyes the best cookie on the table.
      rival.lookAt(this.cx(this.pts.indexOf(Math.max(...this.pts))), ROW_Y);
      return;
    }
    const after = Number(optionId.replace('cut', ''));
    you.lookAt(this.gapX(after), ROW_Y);
    const ev = logic.resolve(this.round, optionId).events.find((e) => e.t === 'cookie-trays');
    if (ev && ev.t === 'cookie-trays') rival.lookAt(this.sideX(after, ev.left.actor === this.rival ? 'left' : 'right'), ROW_Y);
  }

  async play(outcome: Outcome) {
    await super.play(outcome);
    if (!this.result) return;
    const { kept, taken } = this.result;
    const kind = kept.points > taken.points ? 'good' : kept.points < taken.points ? 'bad' : 'info';
    await this.banner(`You keep ${plural(kept.points, 'point')}`, kind);
  }

  private side(i: number): Side { return i < this.after ? 'left' : 'right'; }

  protected async handle(ev: TimelineEvent) {
    switch (ev.t) {
      case 'cookie-cut': return this.cut(ev.after);
      case 'cookie-trays': return this.grab(ev.left, ev.right);
      default: return super.handle(ev);
    }
  }

  private async cut(after: number) {
    this.after = after;
    const x = this.gapX(after);
    const rm = reducedMotion();
    this.actors.you.lookAt(x, ROW_Y);
    this.actors[this.rival].lookAt(x, ROW_Y);

    // A knife drops between two cookies.
    const knife = s('g', {}, this.fx);
    s('rect', { x: -5, y: -62, width: 10, height: 24, rx: 4, fill: '#6B4A2E', ...ol(2.5) }, knife);
    s('path', { d: 'M-5 -38 H5 V2 Q0 10 -5 2 Z', fill: '#E3E8EE', ...ol(2.5) }, knife);
    s('line', { x1: 2, y1: -34, x2: 2, y2: -2, stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round' }, knife);
    gsap.set(knife, { x, y: ROW_Y - 50 });
    sfx('whoosh');
    if (rm) await gsap.from(knife, { opacity: 0, duration: 0.2 });
    else {
      gsap.set(knife, { y: ROW_Y - 120 });
      await gsap.to(knife, { y: ROW_Y + 18, duration: 0.32, ease: 'power3.in' });
    }
    sfx('clunk');
    shake(this.world, 3);
    void burst(this.fx, x, ROW_Y + 8, { n: 8, colors: ['#E8B96A', '#C98F3F'], spread: 22, up: 10, size: 2 });

    // The sheet becomes two trays that slide apart.
    gsap.to(this.sheet, { opacity: 0, duration: 0.2 });
    const n = this.pts.length;
    for (const side of ['left', 'right'] as Side[]) {
      const g = s('g', {}, this.props);
      this.props.insertBefore(g, this.cookies[0]);
      const [a, b] = side === 'left' ? [0, after - 1] : [after, n - 1];
      this.tray(g, this.cx(a) - this.step / 2 + 2, this.cx(b) + this.step / 2 - 2);
      this.trays[side] = g;
    }
    const dx = (side: Side) => (side === 'left' ? -GAP : GAP);
    const move = { duration: rm ? 0.01 : 0.35, ease: 'back.out(2)' };
    for (const side of ['left', 'right'] as Side[]) gsap.to(this.trays[side]!, { x: dx(side), ...move });
    this.cookies.forEach((c, i) => gsap.to(c, { x: this.cx(i) + dx(this.side(i)), ...move }));
    gsap.to(knife, { y: ROW_Y - 140, opacity: 0, duration: 0.3, delay: 0.12, ease: 'power2.in', onComplete: () => knife.remove() });
    await wait(0.4);

    // How many cookies each tray holds.
    for (const side of ['left', 'right'] as Side[]) {
      const count = side === 'left' ? after : n - after;
      const str = plural(count, 'cookie');
      const l = this.label(this.fx, fit(this.sideX(after, side) + dx(side), str), TABLE_TOP - 14, str);
      gsap.from(l, { scale: 0, duration: 0.25, ease: 'back.out(2.5)', transformOrigin: '50% 50%' });
      this.counts.push(l);
    }
    sfx('pop');
    await wait(0.5);
  }

  private async grab(left: CookieTray, right: CookieTray) {
    const sides: Record<Side, CookieTray> = { left, right };
    const rivalSide: Side = left.actor === this.rival ? 'left' : 'right';
    const yourSide: Side = rivalSide === 'left' ? 'right' : 'left';
    this.result = { kept: sides[yourSide], taken: sides[rivalSide] };
    const dx = (side: Side) => (side === 'left' ? -GAP : GAP);
    const centre = (side: Side) => this.sideX(this.after, side) + dx(side);
    const clamp = (x: number) => gsap.utils.clamp(48, W - 48, x);
    const rival = this.actors[this.rival];
    const you = this.actors.you;

    // Both walk up to their trays; the rival gets there and grabs.
    rival.lookAt(centre(rivalSide), ROW_Y);
    you.lookAt(centre(yourSide), ROW_Y);
    sfx('step');
    await Promise.all([rival.moveTo(clamp(centre(rivalSide)), FEET), you.moveTo(clamp(centre(yourSide)), FEET)]);
    this.sortActors();

    // The rival pulls its tray toward itself; its cookies are gone from your reach.
    const theirs = [this.trays[rivalSide]!, ...this.cookies.filter((_, i) => this.side(i) === rivalSide)];
    sfx('swish');
    rival.setMouth('grin');
    await gsap.to(theirs, { y: `+=${reducedMotion() ? 0 : 26}`, duration: 0.32, ease: 'power2.out' });
    gsap.to(theirs, { opacity: 0.6, duration: 0.3 });
    this.counts.forEach((c) => gsap.to(c, { opacity: 0, duration: 0.15, onComplete: () => c.remove() }));
    const theirName = `${CHARACTERS[this.rival].name}’s`;
    const theirFmt = (v: number) => `${theirName} · ${plural(v, 'pt')}`;
    tag(this.fx, fit(centre(rivalSide), theirFmt(sides[rivalSide].points)), TABLE_TOP - 14, sides[rivalSide].points, theirFmt);
    await wait(0.35);

    // Your cookies count up, one by one.
    const yours = this.cookies.map((_, i) => i).filter((i) => this.side(i) === yourSide);
    const each = Math.min(0.12, 0.6 / yours.length);
    for (const i of yours) {
      sfx('tick');
      gsap.fromTo(this.pills[i], { scale: 1 }, { scale: 1.45, duration: each, yoyo: true, repeat: 1, ease: 'power1.out', transformOrigin: '50% 50%' });
      await wait(each);
    }
    const yourFmt = (v: number) => `Yours · ${plural(v, 'pt')}`;
    tag(this.fx, fit(centre(yourSide), yourFmt(sides[yourSide].points)), TABLE_TOP - 14, sides[yourSide].points, yourFmt, 'tag-you');
    sfx('coin');
    void sparkle(this.fx, centre(yourSide), ROW_Y);
    await wait(0.55);
  }
}

export default CookieCutStage;
