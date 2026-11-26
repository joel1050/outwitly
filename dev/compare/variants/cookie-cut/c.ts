import { gsap } from 'gsap';
import { CHARACTERS } from '../../../../src/engine/characters';
import type { CookieTray, TimelineEvent } from '../../../../src/engine/types';
import logic, { type CookieCutParams } from '../../../../src/games/cookie-cut/logic';
import { sfx } from '../../../../src/render/audio';
import { burst, sparkle } from '../../../../src/render/fx';
import { H, Stage, W } from '../../../../src/render/stage';
import { OUTLINE, reducedMotion, s, text, wait } from '../../../../src/render/svg';

const ol = (width = 2.5) => ({ stroke: OUTLINE, 'stroke-width': width, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
const TRAY_Y = 167;
const OWNER_X = { you: 104, rival: 296 };

export default class CookieCutStage extends Stage {
  private values: number[] = [];
  private cuts = new Map<string, number>();
  private span = 0;
  private cell = 0;
  private whole!: SVGGElement;
  private divider?: SVGGElement;
  private split: SVGGElement[] = [];
  private rival = '';

  protected build() {
    this.svg.setAttribute('aria-label', logic.setup(this.round));
    this.values = (this.round.params as CookieCutParams).cookiePoints;
    this.rival = this.round.characters[0].id;
    this.cell = Math.min(49, 338 / this.values.length);
    this.span = this.values.length * this.cell;
    for (const after of this.round.options.cuts as number[]) this.cuts.set(`cut${after}`, after);

    s('rect', { width: W, height: H, fill: 'var(--panel-2)' }, this.bg);
    for (let x = 0; x < W; x += 40) {
      s('path', { d: `M${x} 0 h20 v125 h-20 Z`, fill: 'var(--house)', opacity: 0.48 }, this.bg);
    }
    // A bakery oven between the two cooks.
    s('path', { d: 'M145 122 V83 a55 40 0 0 1 110 0 v39 Z', class: 'c-house', ...ol() }, this.bg);
    s('path', { d: 'M157 122 V85 a43 30 0 0 1 86 0 v37 Z', fill: 'var(--rail)', ...ol() }, this.bg);
    s('path', { d: 'M164 110 H236 M171 73 l11 7 M229 73 l-11 7', stroke: 'var(--deck)', 'stroke-width': 3, fill: 'none', opacity: 0.75 }, this.bg);
    s('path', { d: 'M0 120 H400 V246 H0 Z', class: 'c-deck', ...ol(3) }, this.bg);
    s('path', { d: 'M0 243 H400 V300 H0 Z', class: 'c-hull', ...ol(3) }, this.bg);
    s('path', { d: 'M0 253 H400 M10 289 H390 M200 253 V300', fill: 'none', stroke: OUTLINE, 'stroke-width': 2, opacity: 0.23 }, this.bg);
    for (const [x, y] of [[19, 146], [278, 133], [358, 222], [45, 226]]) {
      s('path', { d: `M${x} ${y} q10 -4 22 0`, fill: 'none', stroke: 'var(--hull)', 'stroke-width': 2, opacity: 0.42 }, this.bg);
    }

    this.whole = this.tray(this.props, this.values, 200);
    for (const [id, x] of [['you', OWNER_X.you], [this.rival, OWNER_X.rival]] as const) {
      this.addActor(id, x, 119, 0.94);
      this.label(this.props, x, 270, CHARACTERS[id].name);
    }
  }

  private tray(layer: SVGGElement, values: number[], x: number) {
    const width = values.length * this.cell;
    const g = s('g', {}, layer);
    gsap.set(g, { x, y: TRAY_Y });
    s('rect', { x: -width / 2, y: -25, width, height: 57, rx: 9, fill: 'var(--shadow)' }, g);
    s('rect', { x: -width / 2, y: -29, width, height: 57, rx: 9, class: 'c-stone', ...ol() }, g);
    s('rect', { x: -width / 2 + 4, y: -24, width: width - 8, height: 46, rx: 6, class: 'c-cobble', ...ol(1.2) }, g);
    values.forEach((value, i) => {
      const cx = (i + 0.5) * this.cell - width / 2;
      const cookie = s('g', { transform: `translate(${cx} -4) scale(${Math.min(1, this.cell / 37)})` }, g);
      const rich = value > 1;
      s('path', { d: 'M-13 1 Q-15 -8 -7 -12 Q-1 -16 6 -12 Q15 -11 15 -2 Q17 8 7 12 Q0 17 -8 11 Q-14 9 -13 1 Z', fill: rich ? '#995848' : '#F0BC72', ...ol(2) }, cookie);
      for (const [dx, dy, r] of [[-6, -4, 2.5], [5, -6, 1.8], [4, 5, 2.7], [-5, 6, 1.5]]) {
        s('circle', { cx: dx, cy: dy, r, fill: rich ? '#54343D' : '#C68B55' }, cookie);
      }
      text(g, cx, 15, String(value), { fill: 'var(--ink)', 'font-size': Math.min(12, this.cell * 0.45) });
    });
    return g;
  }

  private cutX(after: number) {
    return W / 2 - this.span / 2 + after * this.cell;
  }

  preview(optionId: string | null) {
    this.clearPreview();
    const after = optionId ? this.cuts.get(optionId) : undefined;
    if (after === undefined) return;
    const x = this.cutX(after);
    s('path', { d: `M${x} 134 V201`, class: 'aim', 'stroke-width': 3, 'stroke-dasharray': '5 4' }, this.previewLayer);
    s('path', { d: `M${x - 6} 127 h12 l-6 9 Z`, class: 'ring-arrow' }, this.previewLayer);
    this.label(this.previewLayer, Math.max(59, Math.min(W - 59, x)), 216, `Cut after ${after}`, 'ghost-pill');
  }

  protected looks(optionId: string | null) {
    const after = optionId ? this.cuts.get(optionId) : undefined;
    for (const actor of Object.values(this.actors)) actor.lookAt(after === undefined ? W / 2 : this.cutX(after), TRAY_Y);
  }

  markBest(optionId: string) {
    const after = this.cuts.get(optionId);
    this.clearPreview();
    if (after === undefined) return;
    this.previewLayer.classList.add('is-best');
    this.label(this.previewLayer, W / 2, 22, `Best cut: after ${after}`, 'ghost-pill');
  }

  protected async handle(ev: TimelineEvent) {
    const rm = reducedMotion();
    switch (ev.t) {
      case 'cookie-cut': {
        const x = this.cutX(ev.after);
        for (const actor of Object.values(this.actors)) actor.lookAt(x, TRAY_Y);
        this.divider = s('g', {}, this.fx);
        s('path', { d: `M${x - 3} 137 h6 v55 l-3 6 l-3 -6 Z`, fill: '#E5E9EF', ...ol(2) }, this.divider);
        s('rect', { x: x - 8, y: 132, width: 16, height: 8, rx: 4, fill: '#BD7270', ...ol(2) }, this.divider);
        await gsap.from(this.divider, rm ? { opacity: 0, duration: 0.2 } : { y: -33, opacity: 0, duration: 0.3, ease: 'power2.in' });
        sfx('clunk');
        if (!rm) void burst(this.fx, x, TRAY_Y + 7, { n: 7, colors: ['#E0A268', '#B87B58'], spread: 23, size: 2 });
        await wait(0.29);
        this.whole.remove();
        const leftWidth = ev.after * this.cell;
        const rightWidth = this.span - leftWidth;
        this.split = [
          this.tray(this.props, this.values.slice(0, ev.after), x - leftWidth / 2 - 3),
          this.tray(this.props, this.values.slice(ev.after), x + rightWidth / 2 + 3),
        ];
        await gsap.to(this.divider, { opacity: 0, duration: 0.17 });
        this.divider.remove();
        break;
      }
      case 'cookie-trays': {
        const trays = [ev.left, ev.right];
        const first = trays.findIndex((tray) => tray.actor !== 'you');
        for (const i of [first, 1 - first]) await this.claim(this.split[i], trays[i], rm);
        if (!rm) void sparkle(this.fx, OWNER_X.you, 222);
        break;
      }
      default:
        await super.handle(ev);
    }
  }

  private async claim(g: SVGGElement, tray: CookieTray, rm: boolean) {
    const you = tray.actor === 'you';
    const x = you ? OWNER_X.you : OWNER_X.rival;
    const scale = Math.min(1, 170 / (tray.count * this.cell));
    const oldX = Number(gsap.getProperty(g, 'x'));
    for (const actor of Object.values(this.actors)) actor.lookAt(oldX, TRAY_Y);
    g.parentElement?.appendChild(g);
    sfx(you ? 'coin' : 'swish');
    if (rm) {
      await gsap.to(g, { opacity: 0, duration: 0.12 });
      gsap.set(g, { x, y: you ? 183 : 151, scale });
      await gsap.to(g, { opacity: 1, duration: 0.17 });
    } else {
      await gsap.to(g, { x, y: you ? 183 : 151, scale, duration: 0.52, ease: 'back.out(1.3)' });
    }
    const who = you ? 'You kept' : `${CHARACTERS[tray.actor].name} took`;
    const label = this.label(this.fx, x, 228, `${who} ${tray.count} · ${tray.points} pts`, you ? 'heading-tag' : 'scene-label');
    await gsap.from(label, { opacity: 0, duration: 0.2 });
  }
}
