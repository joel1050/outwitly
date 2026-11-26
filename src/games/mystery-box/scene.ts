import { gsap } from 'gsap';
import { CHARACTERS } from '../../engine/characters';
import type { TimelineEvent } from '../../engine/types';
import logic, { type MysteryBoxParams } from './logic';
import { sfx } from '../../render/audio';
import { coinArc, confetti, shake, sparkle } from '../../render/fx';
import { Stage, W } from '../../render/stage';
import { OUTLINE, reducedMotion, s, text, wait } from '../../render/svg';

const ol = (w = 3) => ({ stroke: OUTLINE, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
const CRATE_Y = 106;
const SLATE_Y = 136;
const ACTOR_Y = 282;

const STYLES = `
  .mystery-box-wall { fill: #e9dfd0; }
  .mystery-box-panel { fill: #ded2bf; }
  .mystery-box-beam { fill: #fff6dc; opacity: 0.35; }
  .mystery-box-table { fill: #9c6f46; }
  .mystery-box-table-top { fill: #b88759; }
  .mystery-box-floor { fill: #d7cab5; }
  .mystery-box-slate { fill: #fffdf8; }
  .mystery-box-crate { fill: #c68b52; }
  .mystery-box-crate-lid { fill: #d69c62; }
  .mystery-box-crate-trim { fill: #8c5a2f; }
  .mystery-box-odds-bg { fill: #fffdf8; }
  .mystery-box-odds-text { font-size: 10px; fill: #2b2a33; }
  .mystery-box-val-bg { fill: #fff4d6; }
  .mystery-box-val-text { font-size: 12px; fill: #2b2a33; }
  .mystery-box-bid-row { fill: #f4ece0; }
  .mystery-box-bid-win { fill: #ffe07a; }
  .mystery-box-bid-text { font-size: 9.5px; fill: #2b2a33; }
  .mystery-box-gain-pos { fill: #9fe0b8; }
  .mystery-box-gain-neg { fill: #f6b0a0; }
  .mystery-box-gain-zero { fill: #e8e2d8; }
  .mystery-box-gain-text { font-size: 10.5px; fill: #2b2a33; }
  .mystery-box-wallet-bg { fill: #fff4d6; }
  .mystery-box-wallet-text { font-size: 10px; fill: #2b2a33; }
  .mystery-box-paddle { fill: #ece6ff; }
  .mystery-box-paddle-text { font-size: 11px; fill: #2b2a33; }
  .is-best .mystery-box-paddle { fill: var(--gold); }
  .mystery-box-active-ring { fill: none; stroke: var(--gold); stroke-width: 3; }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) .mystery-box-wall { fill: #2a2632; }
    :root:not([data-theme='light']) .mystery-box-panel { fill: #332e3d; }
    :root:not([data-theme='light']) .mystery-box-beam { fill: #f5d87d; opacity: 0.08; }
    :root:not([data-theme='light']) .mystery-box-table { fill: #5c4028; }
    :root:not([data-theme='light']) .mystery-box-table-top { fill: #735134; }
    :root:not([data-theme='light']) .mystery-box-floor { fill: #383440; }
    :root:not([data-theme='light']) .mystery-box-slate { fill: #312d3a; }
    :root:not([data-theme='light']) .mystery-box-bid-row { fill: #443f50; }
    :root:not([data-theme='light']) .mystery-box-bid-text { fill: #f3ede2; }
    :root:not([data-theme='light']) .mystery-box-bid-win .mystery-box-bid-text { fill: #2b2a33; }
    :root:not([data-theme='light']) .mystery-box-gain-zero { fill: #4c4759; }
    :root:not([data-theme='light']) .mystery-box-gain-zero-txt { fill: #f3ede2; }
  }
  :root[data-theme='dark'] .mystery-box-wall { fill: #2a2632; }
  :root[data-theme='dark'] .mystery-box-panel { fill: #332e3d; }
  :root[data-theme='dark'] .mystery-box-beam { fill: #f5d87d; opacity: 0.08; }
  :root[data-theme='dark'] .mystery-box-table { fill: #5c4028; }
  :root[data-theme='dark'] .mystery-box-table-top { fill: #735134; }
  :root[data-theme='dark'] .mystery-box-floor { fill: #383440; }
  :root[data-theme='dark'] .mystery-box-slate { fill: #312d3a; }
  :root[data-theme='dark'] .mystery-box-bid-row { fill: #443f50; }
  :root[data-theme='dark'] .mystery-box-bid-text { fill: #f3ede2; }
  :root[data-theme='dark'] .mystery-box-bid-win .mystery-box-bid-text { fill: #2b2a33; }
  :root[data-theme='dark'] .mystery-box-gain-zero { fill: #4c4759; }
  :root[data-theme='dark'] .mystery-box-gain-zero-txt { fill: #f3ede2; }
`;

interface BoxColumn {
  x: number;
  w: number;
  crateG: SVGGElement;
  lidG: SVGGElement;
  slateG: SVGGElement;
  activeRing: SVGRectElement;
  contents: number;
}

export class MysteryBoxStage extends Stage {
  private wallet = 0;
  private cols: BoxColumn[] = [];
  private actorIds: string[] = [];
  private caseIdx = 0;
  private walletPill?: SVGGElement;

  protected build() {
    const styleEl = s('style', {}, this.svg);
    styleEl.textContent = STYLES;

    const params = this.round.params as MysteryBoxParams;
    this.wallet = params.wallet;
    this.actorIds = ['you', ...this.round.characters.map((c) => c.id)];

    // Cozy auction room background.
    s('rect', { x: 0, y: 0, width: W, height: 140, class: 'mystery-box-wall' }, this.bg);
    for (let x = 14; x < W; x += 96) {
      s('rect', { x, y: 12, width: 78, height: 112, rx: 6, class: 'mystery-box-panel' }, this.bg);
    }
    // Auction table and floor.
    s('rect', { x: 0, y: 126, width: W, height: 14, class: 'mystery-box-table-top', ...ol(2.5) }, this.bg);
    s('rect', { x: 0, y: 140, width: W, height: 76, class: 'mystery-box-table' }, this.bg);
    s('line', { x1: 0, y1: 216, x2: W, y2: 216, ...ol(2.5) }, this.bg);
    s('rect', { x: 0, y: 216, width: W, height: 84, class: 'mystery-box-floor' }, this.bg);

    // Starting wallet pill in top-left corner.
    this.walletPill = s('g', {}, this.props);
    s('rect', { x: 8, y: 12, width: 78, height: 22, rx: 11, class: 'mystery-box-wallet-bg', ...ol(2) }, this.walletPill);
    s('circle', { cx: 20, cy: 23, r: 5.5, fill: '#FFD34D', stroke: '#B8860B', 'stroke-width': 1.5 }, this.walletPill);
    text(this.walletPill, 53, 23.5, `Start ${this.wallet}`, { class: 'mystery-box-wallet-text' });

    // Possible mystery crates along the auction table.
    const boxes = params.boxes;
    const n = boxes.length;
    const colW = n >= 4 ? 88 : 114;
    const span = n >= 4 ? 294 : 260;
    const startX = W / 2 - span / 2;
    const stepX = n > 1 ? span / (n - 1) : 0;

    this.cols = boxes.map((box, i) => {
      const x = startX + i * stepX;

      // Soft overhead spotlight beam.
      s('polygon', { points: `${x - 16},0 ${x + 16},0 ${x + 48},136 ${x - 48},136`, class: 'mystery-box-beam' }, this.bg);

      // Odds pill above each crate (high enough to stay clear when lid opens).
      const oddsG = s('g', {}, this.props);
      const oddsText = box.chance.replace('/', ' in ');
      const ow = Math.max(46, oddsText.length * 6.4 + 14);
      s('rect', { x: x - ow / 2, y: 44, width: ow, height: 17, rx: 8.5, class: 'mystery-box-odds-bg', ...ol(1.8) }, oddsG);
      text(oddsG, x, 53, oddsText, { class: 'mystery-box-odds-text' });

      // Wooden mystery crate with hinged lid and peeker's knothole.
      const crateG = s('g', {}, this.props);
      gsap.set(crateG, { x, y: CRATE_Y, transformOrigin: '50% 100%' });
      s('ellipse', { cx: 0, cy: 26, rx: 34, ry: 5, fill: 'var(--shadow)' }, crateG);
      const cw = n >= 4 ? 58 : 68;
      // Coins tucked inside rim, revealed when the lid opens.
      for (const [cx, cy] of [[-12, -16], [0, -18], [12, -16], [-6, -20], [6, -20]]) {
        s('ellipse', { cx, cy, rx: 6.5, ry: 3.5, fill: '#FFD34D', stroke: '#B8860B', 'stroke-width': 1.4 }, crateG);
      }
      // Crate body.
      s('rect', { x: -cw / 2, y: -16, width: cw, height: 40, rx: 5, class: 'mystery-box-crate', ...ol(2.5) }, crateG);
      // Plank seams & wooden corner trim.
      s('line', { x1: -cw / 2 + 4, y1: 4, x2: cw / 2 - 4, y2: 4, stroke: '#8C5A2F', 'stroke-width': 2 }, crateG);
      s('rect', { x: -cw / 2 + 3, y: -13, width: 6, height: 34, rx: 2, class: 'mystery-box-crate-trim', opacity: 0.45 }, crateG);
      s('rect', { x: cw / 2 - 9, y: -13, width: 6, height: 34, rx: 2, class: 'mystery-box-crate-trim', opacity: 0.45 }, crateG);
      // Little knothole on the right side.
      s('ellipse', { cx: cw / 2 - 12, cy: -6, rx: 3.2, ry: 2.5, fill: '#2B2018', stroke: '#6E4521', 'stroke-width': 1.2 }, crateG);
      // Prize plate on crate front.
      s('rect', { x: -24, y: -4, width: 48, height: 18, rx: 6, class: 'mystery-box-val-bg', ...ol(1.8) }, crateG);
      s('circle', { cx: -15, cy: 5, r: 4, fill: '#FFD34D', stroke: '#B8860B', 'stroke-width': 1.2 }, crateG);
      text(crateG, 6, 5.5, String(box.contents), { class: 'mystery-box-val-text' });

      // Hinged lid.
      const lidG = s('g', {}, crateG);
      s('rect', { x: -cw / 2 - 3, y: -25, width: cw + 6, height: 11, rx: 4, class: 'mystery-box-crate-lid', ...ol(2.5) }, lidG);
      s('rect', { x: -5, y: -19, width: 10, height: 7, rx: 2, fill: '#F2C94C', ...ol(1.6) }, lidG);
      gsap.set(lidG, { transformOrigin: '0% 100%' });

      // Result slate below the crate (on the table apron) for secret bids + gain/loss.
      const slateG = s('g', {}, this.props);
      gsap.set(slateG, { x, y: SLATE_Y });
      const slateH = 77;
      s('rect', { x: -colW / 2, y: 0, width: colW, height: slateH, rx: 9, class: 'mystery-box-slate', ...ol(2) }, slateG);
      const activeRing = s('rect', {
        x: -colW / 2 - 2, y: -2, width: colW + 4, height: slateH + 4, rx: 11,
        class: 'mystery-box-active-ring', opacity: 0,
      }, slateG);

      return { x, w: colW, crateG, lidG, slateG, activeRing, contents: box.contents };
    });

    // Characters in front of the auction table.
    const an = this.actorIds.length;
    const aScale = an >= 4 ? 0.8 : 0.86;
    const aSpan = an >= 4 ? 290 : 244;
    const aStart = W / 2 - aSpan / 2;
    const aStep = an > 1 ? aSpan / (an - 1) : 0;

    this.actorIds.forEach((id, i) => {
      const ax = aStart + i * aStep;
      this.addActor(id, ax, ACTOR_Y, aScale);
    });

    this.svg.setAttribute('aria-label', logic.setup(this.round));
  }

  private parseBidLabel(optionId: string): string {
    if (optionId === 'pass') return 'Pass';
    if (optionId.startsWith('bid')) return `Bid ${optionId.slice(3)}`;
    return optionId;
  }

  preview(optionId: string | null) {
    this.clearPreview();
    this.previewLayer.classList.remove('is-best');
    if (!optionId) return;

    const you = this.actors.you;
    const labelStr = this.parseBidLabel(optionId);
    const px = you.x + 48;
    const py = you.headY + 14;

    // Auction paddle held up beside you.
    const g = s('g', {}, this.previewLayer);
    gsap.set(g, { x: px, y: py, transformOrigin: '50% 100%' });
    s('rect', { x: -3, y: 10, width: 6, height: 18, rx: 2, fill: '#9A6A43', ...ol(2) }, g);
    const pw = Math.max(54, labelStr.length * 7.5 + 16);
    s('rect', { x: -pw / 2, y: -14, width: pw, height: 26, rx: 13, class: 'mystery-box-paddle', ...ol(2.4) }, g);
    text(g, 0, -0.5, labelStr, { class: 'mystery-box-paddle-text' });

    if (!reducedMotion()) {
      gsap.fromTo(g, { rotation: -6 }, { rotation: 6, duration: 0.55, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }
    this.ring(this.previewLayer, px, py - 1, pw / 2 + 6, 19);
  }

  protected looks(optionId: string | null) {
    if (optionId) {
      const you = this.actors.you;
      you.lookAt(you.x + 48, you.headY + 12);
    } else {
      this.actors.you.lookAt(W / 2, CRATE_Y);
    }
    // Rivals slyly glance toward the crates (peeking inside!).
    const midCol = this.cols[Math.floor(this.cols.length / 2)];
    for (const c of this.round.characters) {
      const targetCol = c.id === 'greedy' ? this.cols[this.cols.length - 1] : midCol;
      this.actors[c.id]?.lookAt(targetCol?.x ?? W / 2, CRATE_Y);
    }
  }

  protected async handle(ev: TimelineEvent) {
    switch (ev.t) {
      case 'box-case': {
        const rm = reducedMotion();
        const col = this.cols[this.caseIdx++];
        if (!col) break;

        // Focus this crate & highlight its slate.
        for (const a of Object.values(this.actors)) a.lookAt(col.x, CRATE_Y);
        gsap.to(col.activeRing, { opacity: 1, duration: 0.2 });
        sfx('pop');

        // Reveal secret bids on the slate.
        const rowH = Math.min(14.5, 45 / Math.max(1, this.actorIds.length));
        const bidEls: SVGGElement[] = [];
        this.actorIds.forEach((id, i) => {
          const bid = ev.bids[id] ?? 0;
          const isWin = ev.winner === id;
          const rowY = 5 + i * (rowH + 2);
          const row = s('g', { class: isWin ? 'mystery-box-bid-win' : '' }, col.slateG);
          s('rect', {
            x: -col.w / 2 + 5, y: rowY, width: col.w - 10, height: rowH, rx: 4,
            class: isWin ? 'mystery-box-bid-win' : 'mystery-box-bid-row',
            stroke: isWin ? OUTLINE : 'none', 'stroke-width': isWin ? 1.5 : 0,
          }, row);
          // Character color dot.
          s('circle', { cx: -col.w / 2 + 13, cy: rowY + rowH / 2, r: 3.6, fill: CHARACTERS[id]?.color ?? '#ccc', ...ol(1.2) }, row);
          const shortName = id === 'you' ? 'You' : (CHARACTERS[id]?.name ?? id);
          const bidStr = bid === 0 ? 'Pass' : String(bid);
          text(row, -col.w / 2 + 21, rowY + rowH / 2 + 0.5, shortName, {
            class: 'mystery-box-bid-text',
            'text-anchor': 'start',
          });
          text(row, col.w / 2 - 9, rowY + rowH / 2 + 0.5, isWin ? `★ ${bidStr}` : bidStr, {
            class: 'mystery-box-bid-text',
            'text-anchor': 'end',
          });
          gsap.set(row, { opacity: 0, scaleY: 0.5, transformOrigin: '50% 50%' });
          bidEls.push(row);
        });

        sfx('ballot');
        await gsap.to(bidEls, {
          opacity: 1, scaleY: 1, duration: rm ? 0.14 : 0.22, stagger: 0.05, ease: 'back.out(2)',
        });

        // Open crate lid to reveal the coins inside, staying cleanly below the odds pill.
        sfx('clunk');
        if (!rm) {
          gsap.timeline()
            .to(col.lidG, { y: -3, rotation: -16, duration: 0.2, ease: 'back.out(2.6)' })
            .to(col.lidG, { y: 0, duration: 0.16 });
        } else {
          gsap.set(col.lidG, { rotation: -15 });
        }

        // Coin arc & quick actor reaction based on who won this case.
        if (ev.winner === 'you') {
          const you = this.actors.you;
          if (ev.gain >= 0) {
            void sparkle(this.fx, col.x, CRATE_Y - 22);
            void coinArc(this.fx, [col.x, CRATE_Y - 12], [you.x, you.headY + 14], 5, () => {});
            sfx('coin');
            you.setMouth(ev.gain > 0 ? 'grin' : 'smile');
          } else {
            void coinArc(this.fx, [you.x, you.headY + 14], [col.x, CRATE_Y - 8], 4, () => {});
            sfx('thud');
            shake(this.world, 2);
            you.setMouth('frown');
          }
        } else if (ev.winner && this.actors[ev.winner]) {
          const winActor = this.actors[ev.winner];
          void coinArc(this.fx, [col.x, CRATE_Y - 12], [winActor.x, winActor.headY + 14], 4, () => {});
          sfx('drop');
          winActor.setMouth('smirk');
        } else {
          sfx('drop');
        }

        // Signed gain/loss pill at bottom of the slate.
        const gainG = s('g', {}, col.slateG);
        const gainStr = ev.gain > 0 ? `You: +${ev.gain}` : ev.gain < 0 ? `You: ${ev.gain}` : 'You: 0';
        const gainCls = ev.gain > 0 ? 'mystery-box-gain-pos' : ev.gain < 0 ? 'mystery-box-gain-neg' : 'mystery-box-gain-zero';
        const txtCls = ev.gain === 0 ? 'mystery-box-gain-text mystery-box-gain-zero-txt' : 'mystery-box-gain-text';
        s('rect', { x: -col.w / 2 + 6, y: 57, width: col.w - 12, height: 16.5, rx: 8.25, class: gainCls, ...ol(1.6) }, gainG);
        text(gainG, 0, 65.5, gainStr, { class: txtCls });
        gsap.from(gainG, { scale: 0, duration: 0.28, ease: 'back.out(2.4)', transformOrigin: '50% 50%' });

        await wait(rm ? 0.5 : 0.95);
        gsap.to(col.activeRing, { opacity: 0.25, duration: 0.2 });
        break;
      }

      case 'box-average': {
        const rm = reducedMotion();
        // Briefly pulse all slates together to connect the three cases to the weighted average.
        for (const col of this.cols) {
          gsap.fromTo(col.activeRing, { opacity: 0.9 }, { opacity: 0.25, duration: 0.45 });
        }

        const delta = ev.value - this.wallet;
        const kind = delta > 0 ? 'good' : delta < 0 ? 'bad' : 'info';

        if (kind === 'good') {
          sfx('cheer');
          void confetti(this.fx, W / 2, 56);
        } else if (kind === 'bad') {
          sfx('fail');
          shake(this.world, 3);
        } else {
          sfx('ding');
        }

        // Actors react to the final average!
        const emotes: Promise<unknown>[] = [];
        if (delta > 0) {
          emotes.push(this.actors.you.emote('cheer'));
          for (const c of this.round.characters) emotes.push(this.actors[c.id]?.emote('sulk') ?? Promise.resolve());
        } else if (delta < 0) {
          emotes.push(this.actors.you.emote('sulk'));
          for (const c of this.round.characters) emotes.push(this.actors[c.id]?.emote('smug') ?? Promise.resolve());
        } else {
          this.actors.you.setMouth('flat');
          for (const c of this.round.characters) emotes.push(this.actors[c.id]?.emote('smug') ?? Promise.resolve());
        }

        const bannerPromise = this.banner(`Average: ${ev.exact} coins`, kind);
        if (this.walletPill) gsap.to(this.walletPill, { opacity: rm ? 0.7 : 0.85, duration: 0.25 });
        await Promise.all([bannerPromise, ...emotes]);
        await wait(0.15);
        break;
      }

      default:
        await super.handle(ev);
    }
  }
}

export default MysteryBoxStage;
