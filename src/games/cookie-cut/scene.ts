import { gsap } from 'gsap';
import { CHARACTERS } from '../../engine/characters';
import type { CookieTray, TimelineEvent } from '../../engine/types';
import logic, { type CookieCutParams } from './logic';
import { sfx } from '../../render/audio';
import { burst, shake, sparkle, tag } from '../../render/fx';
import { Stage, W } from '../../render/stage';
import { OUTLINE, reducedMotion, s, text, wait } from '../../render/svg';

const ol = (w = 3) => ({ stroke: OUTLINE, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
const ROW_Y = 148;
const ACTOR_Y = 286;

const STYLES = `
  .cookie-cut-wall { fill: #f9eedc; }
  .cookie-cut-stripe { fill: #f3e2c7; }
  .cookie-cut-awning-a { fill: #e06a54; }
  .cookie-cut-awning-b { fill: #fff6e8; }
  .cookie-cut-counter { fill: #d8ad7e; }
  .cookie-cut-counter-lip { fill: #b88754; }
  .cookie-cut-apron { fill: #9b6c3e; }
  .cookie-cut-mat { fill: #fff7ea; }
  .cookie-cut-tray { fill: #e8eef2; }
  .cookie-cut-tray-inner { fill: #f9fbfc; }
  .cookie-cut-tray.cookie-cut-tray-kept { fill: #ffe799; }
  .cookie-cut-shelf { fill: #cfa274; }
  .cookie-cut-jar { fill: rgba(255, 250, 240, 0.55); }
  .cookie-cut-idx { font-size: 9px; fill: var(--muted); }
  .cookie-cut-pt-bg { fill: #fffdf8; }
  .cookie-cut-pt-hi { fill: #ffe07a; }
  .cookie-cut-pt-text { font-size: 9.5px; fill: #2b2a33; }
  .cookie-cut-cut-line { stroke: var(--primary); stroke-width: 3; stroke-dasharray: 6 4; stroke-linecap: round; }
  .cookie-cut-bracket { fill: none; stroke: var(--primary); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; opacity: 0.75; }
  .is-best .cookie-cut-cut-line, .is-best .cookie-cut-bracket { stroke: var(--gold); opacity: 1; }
  .cookie-cut-owner-bg { fill: #fff; }
  .cookie-cut-owner-you { fill: var(--gold); }
  .cookie-cut-owner-text { font-size: 10.5px; fill: #2b2a33; }
  .cookie-cut-owner-text-light { font-size: 10.5px; fill: #fffdf8; }
  .cookie-cut-count-bg { fill: var(--panel); }
  .cookie-cut-count-text { font-size: 10px; fill: var(--ink); }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) .cookie-cut-wall { fill: #2c2530; }
    :root:not([data-theme='light']) .cookie-cut-stripe { fill: #352c3a; }
    :root:not([data-theme='light']) .cookie-cut-awning-a { fill: #9e4334; }
    :root:not([data-theme='light']) .cookie-cut-awning-b { fill: #5e5563; }
    :root:not([data-theme='light']) .cookie-cut-counter { fill: #6e5135; }
    :root:not([data-theme='light']) .cookie-cut-counter-lip { fill: #543c26; }
    :root:not([data-theme='light']) .cookie-cut-apron { fill: #3f2d1c; }
    :root:not([data-theme='light']) .cookie-cut-mat { fill: #463d4a; }
    :root:not([data-theme='light']) .cookie-cut-tray { fill: #69727c; }
    :root:not([data-theme='light']) .cookie-cut-tray-inner { fill: #818b96; }
    :root:not([data-theme='light']) .cookie-cut-tray.cookie-cut-tray-kept { fill: #d4a63a; }
    :root:not([data-theme='light']) .cookie-cut-shelf { fill: #59412b; }
    :root:not([data-theme='light']) .cookie-cut-jar { fill: rgba(255, 250, 240, 0.14); }
  }
  :root[data-theme='dark'] .cookie-cut-wall { fill: #2c2530; }
  :root[data-theme='dark'] .cookie-cut-stripe { fill: #352c3a; }
  :root[data-theme='dark'] .cookie-cut-awning-a { fill: #9e4334; }
  :root[data-theme='dark'] .cookie-cut-awning-b { fill: #5e5563; }
  :root[data-theme='dark'] .cookie-cut-counter { fill: #6e5135; }
  :root[data-theme='dark'] .cookie-cut-counter-lip { fill: #543c26; }
  :root[data-theme='dark'] .cookie-cut-apron { fill: #3f2d1c; }
  :root[data-theme='dark'] .cookie-cut-mat { fill: #463d4a; }
  :root[data-theme='dark'] .cookie-cut-tray { fill: #69727c; }
  :root[data-theme='dark'] .cookie-cut-tray-inner { fill: #818b96; }
  :root[data-theme='dark'] .cookie-cut-tray.cookie-cut-tray-kept { fill: #d4a63a; }
  :root[data-theme='dark'] .cookie-cut-shelf { fill: #59412b; }
  :root[data-theme='dark'] .cookie-cut-jar { fill: rgba(255, 250, 240, 0.14); }
`;

function drawCookie(parent: SVGGElement, pts: number, r: number, maxPts: number) {
  const g = s('g', {}, parent);
  s('ellipse', { cx: 0, cy: r * 0.72, rx: r * 0.96, ry: r * 0.34, fill: 'var(--shadow)' }, g);
  const isSpecial = pts > 1;
  const isTop = isSpecial && pts === maxPts;
  const fill = isSpecial ? (isTop ? '#734224' : '#965A32') : '#E7BC7C';
  const hi = isSpecial ? (isTop ? '#8F5734' : '#B27246') : '#F3CF97';

  s('circle', { cx: 0, cy: 0, r, fill, ...ol(2.4) }, g);
  s('circle', { cx: -r * 0.14, cy: -r * 0.16, r: r * 0.68, fill: hi, opacity: 0.45 }, g);

  if (isSpecial) {
    // Rich chocolate chips + subtle cocoa sheen.
    const chips: [number, number, number][] = [
      [-0.36, -0.28, 0.17],
      [0.32, -0.3, 0.16],
      [-0.04, 0.04, 0.19],
      [-0.38, 0.28, 0.15],
      [0.36, 0.24, 0.16],
    ];
    for (const [cx, cy, cr] of chips) {
      s('circle', { cx: cx * r, cy: cy * r, r: Math.max(1.8, cr * r), fill: '#331A0C' }, g);
    }
    s('ellipse', { cx: -r * 0.32, cy: -r * 0.42, rx: r * 0.2, ry: r * 0.1, fill: '#fff', opacity: 0.3, transform: `rotate(-25 ${-r * 0.32} ${-r * 0.42})` }, g);
  } else {
    // Plain butter cookie sugar dimples.
    const dots: [number, number][] = [[-0.34, -0.22], [0.28, -0.26], [0.02, 0.06], [-0.24, 0.3], [0.32, 0.22]];
    for (const [cx, cy] of dots) {
      s('circle', { cx: cx * r, cy: cy * r, r: Math.max(1.2, r * 0.09), fill: '#B68443' }, g);
    }
  }

  // Point value pill anchored neatly at the bottom of the cookie.
  const pw = r >= 15 ? 28 : 24;
  const py = r + 10;
  s('rect', {
    x: -pw / 2, y: py - 7.5, width: pw, height: 15, rx: 7.5,
    class: isSpecial ? 'cookie-cut-pt-hi' : 'cookie-cut-pt-bg',
    ...ol(1.8),
  }, g);
  text(g, 0, py + 0.5, `${pts}pt`, { class: 'cookie-cut-pt-text' });
  return g;
}

export class CookieCutStage extends Stage {
  private cookiePoints: number[] = [];
  private rivalId = 'greedy';
  private baseXs: number[] = [];
  private cookieR = 16;
  private cookieGs: SVGGElement[] = [];
  private boardG!: SVGGElement;
  private leftTrayG?: SVGGElement;
  private rightTrayG?: SVGGElement;
  private cutAfter: number | null = null;
  private splitDx = 0;
  private leftOrigCx = 0;
  private rightOrigCx = 0;
  private leftWorld = { x: 0, y: ROW_Y, scale: 1 };
  private rightWorld = { x: 0, y: ROW_Y, scale: 1 };

  protected build() {
    const styleEl = s('style', {}, this.svg);
    styleEl.textContent = STYLES;

    const params = this.round.params as CookieCutParams;
    this.cookiePoints = params.cookiePoints;
    this.rivalId = this.round.characters[0]?.id ?? 'greedy';
    const n = this.cookiePoints.length;
    const maxPts = Math.max(...this.cookiePoints);

    // Cozy bakery background.
    s('rect', { x: 0, y: 0, width: W, height: 120, class: 'cookie-cut-wall' }, this.bg);
    for (let x = 0; x < W; x += 28) {
      s('rect', { x, y: 0, width: 14, height: 120, class: 'cookie-cut-stripe' }, this.bg);
    }
    // Scalloped bakery awning along the very top.
    for (let i = 0; i < 10; i++) {
      const x = i * 40;
      s('path', {
        d: `M${x} 0 H${x + 40} V16 Q${x + 20} 26 ${x} 16 Z`,
        class: i % 2 === 0 ? 'cookie-cut-awning-a' : 'cookie-cut-awning-b',
        ...ol(2),
      }, this.bg);
    }
    // Cozy side bakery shelves with cookie jar silhouettes.
    s('rect', { x: 16, y: 74, width: 54, height: 6, rx: 3, class: 'cookie-cut-shelf', ...ol(1.6) }, this.bg);
    s('rect', { x: 26, y: 50, width: 22, height: 24, rx: 6, class: 'cookie-cut-jar', ...ol(1.6) }, this.bg);
    s('rect', { x: 30, y: 45, width: 14, height: 5, rx: 2, class: 'cookie-cut-shelf', ...ol(1.4) }, this.bg);
    s('rect', { x: 330, y: 74, width: 54, height: 6, rx: 3, class: 'cookie-cut-shelf', ...ol(1.6) }, this.bg);
    s('rect', { x: 344, y: 52, width: 18, height: 22, rx: 4, class: 'cookie-cut-jar', ...ol(1.6) }, this.bg);
    s('rect', { x: 366, y: 58, width: 14, height: 16, rx: 3, class: 'cookie-cut-jar', ...ol(1.6) }, this.bg);

    // Countertop and front apron.
    s('rect', { x: 0, y: 112, width: W, height: 106, class: 'cookie-cut-counter' }, this.bg);
    s('line', { x1: 0, y1: 112, x2: W, y2: 112, ...ol(3) }, this.bg);
    s('rect', { x: 0, y: 214, width: W, height: 12, class: 'cookie-cut-counter-lip', ...ol(2.5) }, this.bg);
    s('rect', { x: 0, y: 226, width: W, height: 74, class: 'cookie-cut-apron' }, this.bg);
    // Subtle wood grain on counter.
    for (const [x1, y, x2] of [[18, 198, 96], [284, 194, 376], [130, 206, 250]]) {
      s('line', { x1, y1: y, x2, y2: y, stroke: 'rgba(0,0,0,0.1)', 'stroke-width': 2, 'stroke-linecap': 'round' }, this.bg);
    }

    // Cookie layout geometry.
    const step = Math.min(42, 326 / n);
    this.cookieR = Math.min(16, step * 0.39);
    const totalW = step * (n - 1);
    const startX = W / 2 - totalW / 2;
    this.baseXs = this.cookiePoints.map((_, i) => startX + i * step);

    // Single wrapper in props so Stage.intro() drops the board and cookies together cleanly.
    const rowWrap = s('g', {}, this.props);
    this.boardG = s('g', {}, rowWrap);
    const matX = this.baseXs[0] - this.cookieR - 12;
    const matW = totalW + (this.cookieR + 12) * 2;
    s('rect', { x: matX, y: ROW_Y - this.cookieR - 20, width: matW, height: this.cookieR * 2 + 46, rx: 12, class: 'cookie-cut-mat', ...ol(2.5) }, this.boardG);

    // Cookie index ticks along top edge of mat, and the cookies themselves.
    this.cookieGs = this.cookiePoints.map((pts, i) => {
      const x = this.baseXs[i];
      text(this.boardG, x, ROW_Y - this.cookieR - 10, String(i + 1), { class: 'cookie-cut-idx' });
      const cg = drawCookie(rowWrap, pts, this.cookieR, maxPts);
      gsap.set(cg, { x, y: ROW_Y });
      return cg;
    });

    // Characters in front of the counter.
    this.addActor('you', 98, ACTOR_Y, 0.92);
    this.addActor(this.rivalId, 302, ACTOR_Y, 0.92);
    this.svg.setAttribute('aria-label', logic.setup(this.round));
  }

  private parseAfter(optionId: string): number | null {
    const m = /^cut(\d+)$/.exec(optionId);
    if (!m) return null;
    const after = Number(m[1]);
    return after >= 1 && after < this.cookiePoints.length ? after : null;
  }

  private cookieWorldX(i: number): number {
    if (this.cutAfter === null) return this.baseXs[i];
    if (i < this.cutAfter) {
      return this.leftWorld.x + (this.baseXs[i] - this.leftOrigCx) * this.leftWorld.scale;
    }
    return this.rightWorld.x + (this.baseXs[i] - this.rightOrigCx) * this.rightWorld.scale;
  }

  private cutXFor(after: number): number {
    return (this.cookieWorldX(after - 1) + this.cookieWorldX(after)) / 2;
  }

  preview(optionId: string | null) {
    this.clearPreview();
    this.previewLayer.classList.remove('is-best');
    if (!optionId) return;
    const after = this.parseAfter(optionId);
    if (after === null) return;

    const cutX = this.cutXFor(after);
    const n = this.cookiePoints.length;

    if (this.cutAfter === null) {
      const topY = ROW_Y - this.cookieR - 30;
      const botY = ROW_Y + this.cookieR + 28;

      // Dashed vertical cut line.
      const line = s('line', { x1: cutX, y1: topY + 12, x2: cutX, y2: botY, class: 'cookie-cut-cut-line' }, this.previewLayer);
      if (!reducedMotion()) gsap.to(line, { strokeDashoffset: -20, duration: 0.9, repeat: -1, ease: 'none' });

      // Bouncing downward pointer arrow at top of cut line.
      const arrow = s('path', { d: `M${cutX - 8} ${topY - 6} h16 l-8 12 Z`, class: 'ring-arrow' }, this.previewLayer);
      if (!reducedMotion()) gsap.to(arrow, { y: -4, duration: 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });

      // Subtle brackets & count pills before the trays have been cut apart.
      const lx0 = this.baseXs[0] - this.cookieR - 3;
      const lx1 = cutX - 5;
      const rx0 = cutX + 5;
      const rx1 = this.baseXs[n - 1] + this.cookieR + 3;
      const by = botY + 5;
      s('path', { d: `M${lx0} ${by - 4} V${by} H${lx1} V${by - 4}`, class: 'cookie-cut-bracket' }, this.previewLayer);
      s('path', { d: `M${rx0} ${by - 4} V${by} H${rx1} V${by - 4}`, class: 'cookie-cut-bracket' }, this.previewLayer);
      const lcx = (lx0 + lx1) / 2;
      const rcx = (rx0 + rx1) / 2;
      this.label(this.previewLayer, lcx, by + 13, `${after}`, 'ghost-pill');
      this.label(this.previewLayer, rcx, by + 13, `${n - after}`, 'ghost-pill');
    } else {
      // Post-play markBest: align the cut line cleanly to the tray containing the best cut.
      const tray = after < this.cutAfter ? this.leftWorld : after > this.cutAfter ? this.rightWorld : null;
      const lineTopY = tray ? tray.y - (this.cookieR + 18) * tray.scale : ROW_Y - this.cookieR - 20;
      const lineBotY = tray ? tray.y + (this.cookieR + 30) * tray.scale : ROW_Y + this.cookieR + 28;

      const line = s('line', { x1: cutX, y1: lineTopY, x2: cutX, y2: lineBotY, class: 'cookie-cut-cut-line' }, this.previewLayer);
      if (!reducedMotion()) gsap.to(line, { strokeDashoffset: -20, duration: 0.9, repeat: -1, ease: 'none' });

      if (!tray) {
        const arrow = s('path', { d: `M${cutX - 7} ${lineTopY - 15} h14 l-7 10 Z`, class: 'ring-arrow' }, this.previewLayer);
        if (!reducedMotion()) gsap.to(arrow, { y: -3, duration: 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      }
      const pillX = gsap.utils.clamp(62, W - 62, cutX);
      this.label(this.previewLayer, pillX, 55, `Best: after ${after}`, 'ghost-pill');
    }
  }

  protected looks(optionId: string | null) {
    const after = optionId ? this.parseAfter(optionId) : null;
    if (after !== null) {
      const cutX = this.cutXFor(after);
      this.actors.you.lookAt(cutX, ROW_Y);
      const out = logic.resolve(this.round, optionId!);
      const traysEv = out.events.find((e) => e.t === 'cookie-trays');
      if (traysEv && traysEv.t === 'cookie-trays') {
        const rivalSide = traysEv.left.actor === this.rivalId ? 'left' : 'right';
        const targetX = rivalSide === 'left'
          ? (this.baseXs[0] + this.baseXs[after - 1]) / 2
          : (this.baseXs[after] + this.baseXs[this.baseXs.length - 1]) / 2;
        this.actors[this.rivalId].lookAt(targetX, ROW_Y);
        return;
      }
    }
    // Idle glance: you eye the highest-value cookie; rival eyes the middle of the row.
    const bestIdx = this.cookiePoints.indexOf(Math.max(...this.cookiePoints));
    this.actors.you.lookAt(this.baseXs[bestIdx] ?? W / 2, ROW_Y);
    this.actors[this.rivalId].lookAt(W / 2, ROW_Y);
  }

  private buildTrayGroup(startIdx: number, endIdx: number): { g: SVGGElement; cx: number; plate: SVGRectElement; inner: SVGRectElement } {
    const x0 = this.baseXs[startIdx] - this.cookieR - 9;
    const x1 = this.baseXs[endIdx] + this.cookieR + 9;
    const cx = (x0 + x1) / 2;
    const w = x1 - x0;
    const h = this.cookieR * 2 + 44;

    const g = s('g', {}, this.props);
    gsap.set(g, { x: cx, y: ROW_Y });
    // Shadow beneath tray.
    s('rect', { x: -w / 2 + 2, y: -this.cookieR - 12, width: w, height: h, rx: 10, fill: 'var(--shadow)' }, g);
    // Outer metallic tray rim + handles.
    s('rect', { x: -w / 2 - 5, y: -7, width: 7, height: 14, rx: 3, class: 'cookie-cut-tray', ...ol(2) }, g);
    s('rect', { x: w / 2 - 2, y: -7, width: 7, height: 14, rx: 3, class: 'cookie-cut-tray', ...ol(2) }, g);
    const plate = s('rect', { x: -w / 2, y: -this.cookieR - 16, width: w, height: h, rx: 10, class: 'cookie-cut-tray', ...ol(2.5) }, g);
    const inner = s('rect', { x: -w / 2 + 5, y: -this.cookieR - 11, width: w - 10, height: h - 10, rx: 6, class: 'cookie-cut-tray-inner', stroke: OUTLINE, 'stroke-width': 1.2, opacity: 0.7 }, g);

    // Reparent cookies into this tray group, preserving their visual x/y.
    for (let i = startIdx; i <= endIdx; i++) {
      const cg = this.cookieGs[i];
      g.appendChild(cg);
      gsap.set(cg, { x: this.baseXs[i] - cx, y: 0 });
    }
    return { g, cx, plate, inner };
  }

  protected async handle(ev: TimelineEvent) {
    switch (ev.t) {
      case 'cookie-cut': {
        const rm = reducedMotion();
        const after = ev.after;
        this.cutAfter = after;
        const cutX = (this.baseXs[after - 1] + this.baseXs[after]) / 2;

        // Animated bakery cutter / spatula blade slicing down.
        const blade = s('g', {}, this.fx);
        s('rect', { x: -6, y: -56, width: 12, height: 18, rx: 4, fill: '#9A6A43', ...ol(2) }, blade);
        s('path', { d: 'M-2.5 -38 H2.5 L3.5 14 L0 24 L-3.5 14 Z', fill: '#DCE6EE', ...ol(2) }, blade);
        gsap.set(blade, { x: cutX, y: ROW_Y - 72, opacity: 0 });

        this.actors.you.lookAt(cutX, ROW_Y);
        this.actors[this.rivalId].lookAt(cutX, ROW_Y);
        sfx('swish');
        if (rm) {
          await gsap.to(blade, { y: ROW_Y + 6, opacity: 1, duration: 0.2 });
        } else {
          await gsap.timeline()
            .to(blade, { opacity: 1, duration: 0.08 })
            .to(blade, { y: ROW_Y + 8, duration: 0.24, ease: 'power3.in' });
        }
        sfx('clunk');
        shake(this.world, 2.5);
        void burst(this.fx, cutX, ROW_Y, { n: 10, colors: ['#E7BC7C', '#8F5734', '#FFF4D6'], spread: 24, up: 12, size: 2.5, dur: 0.55 });

        // Fade parchment mat and split cookies into two distinct serving trays.
        gsap.to(this.boardG, { opacity: 0, duration: 0.2 });
        const left = this.buildTrayGroup(0, after - 1);
        const right = this.buildTrayGroup(after, this.cookiePoints.length - 1);
        this.leftTrayG = left.g;
        this.rightTrayG = right.g;

        // Compute safe horizontal separation so both trays remain well inside 400px canvas.
        const leftMargin = this.baseXs[0] - this.cookieR - 14;
        const rightMargin = W - (this.baseXs[this.baseXs.length - 1] + this.cookieR + 14);
        this.splitDx = Math.min(13, Math.max(5, Math.min(leftMargin, rightMargin) - 4));

        await Promise.all([
          gsap.to(blade, { y: ROW_Y - 50, opacity: 0, duration: 0.25, ease: 'power2.in' }),
          gsap.to(left.g, { x: left.cx - this.splitDx, duration: rm ? 0.2 : 0.35, ease: 'back.out(1.6)' }),
          gsap.to(right.g, { x: right.cx + this.splitDx, duration: rm ? 0.2 : 0.35, ease: 'back.out(1.6)' }),
        ]);
        blade.remove();

        // Update world tracking for markBest accuracy.
        this.leftOrigCx = left.cx;
        this.rightOrigCx = right.cx;
        this.leftWorld = { x: left.cx - this.splitDx, y: ROW_Y, scale: 1 };
        this.rightWorld = { x: right.cx + this.splitDx, y: ROW_Y, scale: 1 };
        this.leftTrayG.dataset.cx = String(this.leftWorld.x);
        this.rightTrayG.dataset.cx = String(this.rightWorld.x);

        // Stamp cookie counts underneath each tray so Greedy's count rule is self-evident.
        const countTag = (tray: SVGGElement, count: number) => {
          const g = s('g', {}, tray);
          const str = `${count} cookie${count === 1 ? '' : 's'}`;
          const w = str.length * 6.2 + 16;
          s('rect', { x: -w / 2, y: this.cookieR + 23, width: w, height: 16, rx: 8, class: 'cookie-cut-count-bg', ...ol(1.8) }, g);
          text(g, 0, this.cookieR + 31.5, str, { class: 'cookie-cut-count-text' });
          gsap.from(g, { scale: 0, duration: 0.25, ease: 'back.out(2)', transformOrigin: '50% 50%' });
        };
        countTag(left.g, after);
        countTag(right.g, this.cookiePoints.length - after);
        await wait(0.3);
        break;
      }

      case 'cookie-trays': {
        const rm = reducedMotion();
        const leftG = this.leftTrayG!;
        const rightG = this.rightTrayG!;
        const leftCx = Number(leftG.dataset.cx);
        const rightCx = Number(rightG.dataset.cx);

        const rivalTookLeft = ev.left.actor === this.rivalId;
        const rivalTray: CookieTray = rivalTookLeft ? ev.left : ev.right;
        const yourTray: CookieTray = rivalTookLeft ? ev.right : ev.left;
        const rivalG = rivalTookLeft ? leftG : rightG;
        const yourG = rivalTookLeft ? rightG : leftG;
        const rivalCx = rivalTookLeft ? leftCx : rightCx;
        const yourCx = rivalTookLeft ? rightCx : leftCx;

        const rivalActor = this.actors[this.rivalId];
        const youActor = this.actors.you;
        const rivalName = CHARACTERS[this.rivalId]?.name ?? this.rivalId;

        // Rival eyes its chosen tray, moves beneath it, and slides it back toward itself.
        rivalActor.lookAt(rivalCx, ROW_Y);
        youActor.lookAt(rivalCx, ROW_Y);
        const rivalSpotX = gsap.utils.clamp(56, W - 56, rivalCx);
        const youSpotX = gsap.utils.clamp(56, W - 56, yourCx);

        await rivalActor.moveTo(rivalSpotX, ACTOR_Y);
        this.sortActors();
        sfx('whoosh');

        // Put owner pill above rival's tray and slide it up/away slightly.
        const rivalPill = s('g', {}, rivalG);
        const rText = `${rivalName} takes ${rivalTray.count}`;
        const rw = rText.length * 6.4 + 18;
        const rivalTextCls = this.rivalId === 'loner' || this.rivalId === 'fair' || this.rivalId === 'hero'
          ? 'cookie-cut-owner-text-light'
          : 'cookie-cut-owner-text';
        s('rect', { x: -rw / 2, y: -this.cookieR - 42, width: rw, height: 20, rx: 10, fill: CHARACTERS[this.rivalId]?.color ?? '#E69F00', ...ol(2) }, rivalPill);
        text(rivalPill, 0, -this.cookieR - 31.5, rText, { class: rivalTextCls });
        gsap.from(rivalPill, { scale: 0, duration: 0.25, ease: 'back.out(2.2)', transformOrigin: '50% 50%' });

        const rivalY = ROW_Y - 22;
        const rivalScale = 0.92;
        if (rivalTookLeft) this.leftWorld = { x: rivalCx, y: rivalY, scale: rivalScale };
        else this.rightWorld = { x: rivalCx, y: rivalY, scale: rivalScale };

        await gsap.to(rivalG, {
          y: rivalY,
          scale: rivalScale,
          opacity: 0.72,
          duration: rm ? 0.2 : 0.42,
          ease: 'power2.out',
          transformOrigin: '0px 0px',
        });

        // You move to your kept tray; your tray slides forward and glows gold.
        youActor.lookAt(yourCx, ROW_Y);
        await youActor.moveTo(youSpotX, ACTOR_Y);
        this.sortActors();

        // Highlight entire kept tray rim and handles in gold.
        yourG.querySelectorAll('.cookie-cut-tray').forEach((el) => el.classList.add('cookie-cut-tray-kept'));

        const yourPill = s('g', {}, yourG);
        const yText = 'You keep';
        const yw = yText.length * 6.8 + 18;
        s('rect', { x: -yw / 2, y: -this.cookieR - 42, width: yw, height: 20, rx: 10, class: 'cookie-cut-owner-you', ...ol(2) }, yourPill);
        text(yourPill, 0, -this.cookieR - 31.5, yText, { class: 'cookie-cut-owner-text' });
        gsap.from(yourPill, { scale: 0, duration: 0.25, ease: 'back.out(2.2)', transformOrigin: '50% 50%' });

        const yourY = ROW_Y - 2;
        const yourScale = 1.03;
        if (rivalTookLeft) this.rightWorld = { x: yourCx, y: yourY, scale: yourScale };
        else this.leftWorld = { x: yourCx, y: yourY, scale: yourScale };

        await gsap.to(yourG, {
          y: yourY,
          scale: yourScale,
          duration: rm ? 0.2 : 0.38,
          ease: 'back.out(1.7)',
          transformOrigin: '0px 0px',
        });

        sfx('coin');
        void sparkle(this.fx, yourCx, yourY - 4);
        tag(this.fx, youSpotX, youActor.headY - 8, yourTray.points, (n) => `${n} pt${n === 1 ? '' : 's'}`, 'tag-you');

        const kind = yourTray.points > rivalTray.points ? 'good' : yourTray.points < rivalTray.points ? 'bad' : 'info';
        sfx(kind === 'good' ? 'cheer' : kind === 'bad' ? 'fail' : 'ding');
        await this.banner(`You kept ${yourTray.points} point${yourTray.points === 1 ? '' : 's'}`, kind);
        await wait(0.2);
        break;
      }

      default:
        await super.handle(ev);
    }
  }
}

export default CookieCutStage;
