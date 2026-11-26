import { gsap } from 'gsap';
import { CHARACTERS } from '../../engine/characters';
import type { TimelineEvent } from '../../engine/types';
import logic, { type MysteryBoxParams } from './logic';
import { sfx } from '../../render/audio';
import { coinArc, confetti, shake, sparkle } from '../../render/fx';
import { Stage, W } from '../../render/stage';
import { OUTLINE, reducedMotion, s, text, wait } from '../../render/svg';

const ol = (w = 3) => ({ stroke: OUTLINE, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
const CRATE_X = W / 2;
const CRATE_Y = 100;
const CARD_Y = 142;
const CARD_W = 120;
const ACTOR_Y = 282;
/** One pile coin stands for this many coins. */
const COIN_UNIT = 10;
const MINUS = '\u2212';

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
  .mystery-box-card-amt { font-size: 13px; font-weight: 700; fill: #2b2a33; }
  .mystery-box-card-odds { font-size: 10px; fill: #5a5560; }
  .mystery-box-card-rule { stroke: #2b2a33; stroke-opacity: 0.2; stroke-width: 1.2; }
  .mystery-box-card-hole { fill: #ece4d6; }
  .mystery-box-val-bg { fill: #fff4d6; }
  .mystery-box-val-text { font-size: 12px; fill: #2b2a33; }
  .mystery-box-bid-row { fill: #f4ece0; }
  .mystery-box-bid-win { fill: #ffe07a; }
  .mystery-box-bid-text { font-size: 9.5px; fill: #2b2a33; }
  .mystery-box-gain-pos { fill: #9fe0b8; }
  .mystery-box-gain-neg { fill: #f6b0a0; }
  .mystery-box-gain-zero { fill: #e8e2d8; }
  .mystery-box-gain-text { font-size: 10.5px; fill: #2b2a33; }
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
    :root:not([data-theme='light']) .mystery-box-card-amt { fill: #f3ede2; }
    :root:not([data-theme='light']) .mystery-box-card-odds { fill: #cfc7d6; }
    :root:not([data-theme='light']) .mystery-box-card-rule { stroke: #f3ede2; }
    :root:not([data-theme='light']) .mystery-box-card-hole { fill: #3d3847; }
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
  :root[data-theme='dark'] .mystery-box-card-amt { fill: #f3ede2; }
  :root[data-theme='dark'] .mystery-box-card-odds { fill: #cfc7d6; }
  :root[data-theme='dark'] .mystery-box-card-rule { stroke: #f3ede2; }
  :root[data-theme='dark'] .mystery-box-card-hole { fill: #3d3847; }
  :root[data-theme='dark'] .mystery-box-bid-row { fill: #443f50; }
  :root[data-theme='dark'] .mystery-box-bid-text { fill: #f3ede2; }
  :root[data-theme='dark'] .mystery-box-bid-win .mystery-box-bid-text { fill: #2b2a33; }
  :root[data-theme='dark'] .mystery-box-gain-zero { fill: #4c4759; }
  :root[data-theme='dark'] .mystery-box-gain-zero-txt { fill: #f3ede2; }
`;

interface BoxCard {
  x: number;
  w: number;
  g: SVGGElement;
  activeRing: SVGRectElement;
  contents: number;
}

/** A pile of gold coins, one per COIN_UNIT, in up to three stacks. It grows and shrinks. */
class CoinPile {
  readonly g: SVGGElement;
  private coins: SVGEllipseElement[] = [];

  constructor(parent: Element, private x: number, private y: number, count: number) {
    this.g = s('g', {}, parent);
    this.set(count, false);
  }

  get count() { return this.coins.length; }
  /** Where flying coins leave or land (global coordinates). */
  get top(): [number, number] {
    return [this.x, this.y - 6 - Math.ceil(Math.max(this.coins.length, 3) / 3) * 4.4];
  }

  set(n: number, animate = true) {
    const rm = reducedMotion();
    while (this.coins.length < n) {
      const i = this.coins.length;
      const level = Math.floor(i / 3);
      const side = [0, 15, -15][i % 3];
      const c = s('ellipse', {
        cx: this.x + side, cy: this.y - level * 4.4 - (side ? 2 : 0), rx: 9, ry: 3.8,
        fill: '#FFD34D', stroke: '#B8860B', 'stroke-width': 1.5,
      }, this.g);
      if (animate) gsap.from(c, rm ? { opacity: 0, duration: 0.2 } : { opacity: 0, y: -14, duration: 0.2, ease: 'power1.in' });
      this.coins.push(c);
    }
    while (this.coins.length > n) {
      const c = this.coins.pop()!;
      if (animate) gsap.to(c, { opacity: 0, y: rm ? 0 : -10, duration: 0.15, onComplete: () => c.remove() });
      else c.remove();
    }
  }
}

export class MysteryBoxStage extends Stage {
  private wallet = 0;
  private cards: BoxCard[] = [];
  private actorIds: string[] = [];
  private caseIdx = 0;
  private pile!: CoinPile;
  private lidG!: SVGGElement;
  private plateText!: SVGTextElement;

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
    // Soft overhead spotlight on the one crate.
    s('polygon', { points: `${CRATE_X - 22},0 ${CRATE_X + 22},0 ${CRATE_X + 70},134 ${CRATE_X - 70},134`, class: 'mystery-box-beam' }, this.bg);
    // Auction table and floor.
    s('rect', { x: 0, y: 126, width: W, height: 14, class: 'mystery-box-table-top', ...ol(2.5) }, this.bg);
    s('rect', { x: 0, y: 140, width: W, height: 86, class: 'mystery-box-table' }, this.bg);
    s('line', { x1: 0, y1: 226, x2: W, y2: 226, ...ol(2.5) }, this.bg);
    s('rect', { x: 0, y: 226, width: W, height: 74, class: 'mystery-box-floor' }, this.bg);

    // The one wooden mystery crate, centre stage, with a hinged lid and a prize plate.
    const crateG = s('g', {}, this.props);
    gsap.set(crateG, { x: CRATE_X, y: CRATE_Y });
    const cw = 68;
    const body = s('g', { transform: 'scale(1.2)' }, crateG);
    s('ellipse', { cx: 0, cy: 26, rx: 38, ry: 5, fill: 'var(--shadow)' }, body);
    // Coins tucked inside the rim, revealed when the lid opens.
    for (const [cx, cy] of [[-12, -16], [0, -18], [12, -16], [-6, -20], [6, -20]]) {
      s('ellipse', { cx, cy, rx: 6.5, ry: 3.5, fill: '#FFD34D', stroke: '#B8860B', 'stroke-width': 1.4 }, body);
    }
    s('rect', { x: -cw / 2, y: -16, width: cw, height: 40, rx: 5, class: 'mystery-box-crate', ...ol(2.5) }, body);
    // Plank seams and wooden corner trim.
    s('line', { x1: -cw / 2 + 4, y1: 4, x2: cw / 2 - 4, y2: 4, stroke: '#8C5A2F', 'stroke-width': 2 }, body);
    s('rect', { x: -cw / 2 + 3, y: -13, width: 6, height: 34, rx: 2, class: 'mystery-box-crate-trim', opacity: 0.45 }, body);
    s('rect', { x: cw / 2 - 9, y: -13, width: 6, height: 34, rx: 2, class: 'mystery-box-crate-trim', opacity: 0.45 }, body);
    // Prize plate: "?" while shut, the amount once open.
    s('rect', { x: -24, y: -4, width: 48, height: 18, rx: 6, class: 'mystery-box-val-bg', ...ol(1.8) }, body);
    s('circle', { cx: -15, cy: 5, r: 4, fill: '#FFD34D', stroke: '#B8860B', 'stroke-width': 1.2 }, body);
    this.plateText = text(body, 6, 5.5, '?', { class: 'mystery-box-val-text' });
    // Hinged lid.
    const lidG = s('g', {}, body);
    this.lidG = lidG;
    s('rect', { x: -cw / 2 - 3, y: -25, width: cw + 6, height: 11, rx: 4, class: 'mystery-box-crate-lid', ...ol(2.5) }, lidG);
    s('rect', { x: -5, y: -19, width: 10, height: 7, rx: 2, fill: '#F2C94C', ...ol(1.6) }, lidG);
    gsap.set(lidG, { transformOrigin: '0% 100%' });

    // One card per possible amount, on the table apron: amount, chance, then bids and the result.
    const boxes = params.boxes;
    const n = boxes.length;
    const gap = n > 1 ? Math.min(8, (W - 16 - n * CARD_W) / (n - 1)) : 0;
    const startX = W / 2 - ((n * CARD_W + (n - 1) * gap) / 2) + CARD_W / 2;
    const rowH = Math.min(12, 40 / Math.max(1, this.actorIds.length) - 1.2);
    const cardH = 21 + this.actorIds.length * (rowH + 1.2) + 2 + 14 + 3;

    this.cards = boxes.map((box, i) => {
      const x = startX + i * (CARD_W + gap);
      const g = s('g', {}, this.props);
      gsap.set(g, { x, y: CARD_Y });
      s('rect', { x: -CARD_W / 2, y: 0, width: CARD_W, height: cardH, rx: 9, class: 'mystery-box-slate', ...ol(2) }, g);
      const activeRing = s('rect', {
        x: -CARD_W / 2 - 2, y: -2, width: CARD_W + 4, height: cardH + 4, rx: 11,
        class: 'mystery-box-active-ring', opacity: 0,
      }, g);
      // Header: coin, amount, chance.
      s('circle', { cx: -CARD_W / 2 + 13, cy: 10.5, r: 5.5, fill: '#FFD34D', stroke: '#B8860B', 'stroke-width': 1.5 }, g);
      text(g, -CARD_W / 2 + 23, 11, String(box.contents), { class: 'mystery-box-card-amt', 'text-anchor': 'start' });
      text(g, CARD_W / 2 - 8, 11, box.chance.replace('/', ' in '), { class: 'mystery-box-card-odds', 'text-anchor': 'end' });
      s('line', { x1: -CARD_W / 2 + 7, y1: 19, x2: CARD_W / 2 - 7, y2: 19, class: 'mystery-box-card-rule' }, g);
      // Empty bid slots until the bids come out.
      for (let r = 0; r < this.actorIds.length; r++) {
        s('rect', {
          x: -CARD_W / 2 + 5, y: 21 + r * (rowH + 1.2), width: CARD_W - 10, height: rowH, rx: 4,
          class: 'mystery-box-card-hole', opacity: 0.55,
        }, g);
      }
      return { x, w: CARD_W, g, activeRing, contents: box.contents };
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

    // The player's coins, as a pile beside them. No number: the size is the number.
    const you = this.actors.you;
    this.pile = new CoinPile(this.props, you.x - 45, ACTOR_Y - 4, this.coinsFor(this.wallet));

    this.svg.setAttribute('aria-label', logic.setup(this.round));
  }

  private coinsFor(amount: number) {
    return Math.max(0, Math.round(amount / COIN_UNIT));
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
      this.actors.you.lookAt(CRATE_X, CRATE_Y);
    }
    // Rivals slyly glance at the crate (they peek inside!).
    for (const c of this.round.characters) this.actors[c.id]?.lookAt(CRATE_X, CRATE_Y);
  }

  protected async handle(ev: TimelineEvent) {
    switch (ev.t) {
      case 'box-case': {
        const rm = reducedMotion();
        const card = this.cards[this.caseIdx++];
        if (!card) break;
        const you = this.actors.you;

        // Light up this case's card; the pile goes back to the start amount.
        for (const a of Object.values(this.actors)) a.lookAt(CRATE_X, CRATE_Y);
        this.pile.set(this.coinsFor(this.wallet));
        gsap.to(card.activeRing, { opacity: 1, duration: 0.2 });
        if (!rm) gsap.to(card.g, { y: CARD_Y - 3, duration: 0.2, ease: 'power2.out' });
        sfx('pop');

        // The crate opens and shows the amount.
        this.plateText.textContent = String(ev.contents);
        sfx('clunk');
        if (!rm) {
          gsap.timeline()
            .to(this.lidG, { y: -3, rotation: -16, duration: 0.2, ease: 'back.out(2.6)' })
            .to(this.lidG, { y: 0, duration: 0.12 });
        } else {
          gsap.set(this.lidG, { rotation: -15 });
        }
        await wait(rm ? 0.12 : 0.22);

        // Reveal the secret bids on the card.
        const rowH = Math.min(12, 40 / Math.max(1, this.actorIds.length) - 1.2);
        const bidEls: SVGGElement[] = [];
        this.actorIds.forEach((id, i) => {
          const bid = ev.bids[id] ?? 0;
          const isWin = ev.winner === id;
          const rowY = 21 + i * (rowH + 1.2);
          const row = s('g', { class: isWin ? 'mystery-box-bid-win' : '' }, card.g);
          s('rect', {
            x: -card.w / 2 + 5, y: rowY, width: card.w - 10, height: rowH, rx: 4,
            class: isWin ? 'mystery-box-bid-win' : 'mystery-box-bid-row',
            stroke: isWin ? OUTLINE : 'none', 'stroke-width': isWin ? 1.5 : 0,
          }, row);
          s('circle', { cx: -card.w / 2 + 13, cy: rowY + rowH / 2, r: 3.4, fill: CHARACTERS[id]?.color ?? '#ccc', ...ol(1.2) }, row);
          const shortName = id === 'you' ? 'You' : (CHARACTERS[id]?.name ?? id);
          const bidStr = bid === 0 ? 'Pass' : String(bid);
          text(row, -card.w / 2 + 21, rowY + rowH / 2 + 0.5, shortName, { class: 'mystery-box-bid-text', 'text-anchor': 'start' });
          text(row, card.w / 2 - 9, rowY + rowH / 2 + 0.5, isWin ? `\u2605 ${bidStr}` : bidStr, { class: 'mystery-box-bid-text', 'text-anchor': 'end' });
          gsap.set(row, { opacity: 0, scaleY: 0.5, transformOrigin: '50% 50%' });
          bidEls.push(row);
        });
        sfx('ballot');
        await gsap.to(bidEls, { opacity: 1, scaleY: 1, duration: rm ? 0.14 : 0.2, stagger: 0.05, ease: 'back.out(2)' });

        // The winner takes the box; coins move.
        const crateTop: [number, number] = [CRATE_X, CRATE_Y - 8];
        const pips = (amount: number) => Math.max(1, Math.min(6, this.coinsFor(amount)));
        if (ev.winner === 'you') {
          const after = this.coinsFor(this.wallet + ev.gain);
          const paid = Math.max(0, this.coinsFor(this.wallet) - this.coinsFor(this.wallet - ev.price));
          // Pay: coins leave the pile for the crate.
          const from = this.pile.top;
          this.pile.set(this.coinsFor(this.wallet - ev.price));
          sfx('thud');
          if (!rm && paid) void coinArc(this.fx, from, crateTop, pips(ev.price), () => {});
          await wait(rm ? 0.2 : 0.38);
          // Win: the contents come back to the pile.
          sfx('coin');
          void sparkle(this.fx, CRATE_X, CRATE_Y - 24);
          if (!rm) await coinArc(this.fx, crateTop, this.pile.top, pips(ev.contents), () => {});
          this.pile.set(after);
          you.setMouth(ev.gain > 0 ? 'grin' : ev.gain < 0 ? 'frown' : 'smile');
          if (ev.gain < 0) shake(this.world, 2);
        } else if (ev.winner && this.actors[ev.winner]) {
          const winActor = this.actors[ev.winner];
          sfx('drop');
          if (!rm) void coinArc(this.fx, crateTop, [winActor.x, winActor.headY + 14], 4, () => {});
          winActor.setMouth('smirk');
          await wait(rm ? 0.2 : 0.5);
        } else {
          sfx('drop');
          await wait(0.2);
        }

        // The gain or loss stays on this card.
        const gainG = s('g', {}, card.g);
        const gainStr = ev.gain > 0 ? `You: +${ev.gain}` : ev.gain < 0 ? `You: ${MINUS}${-ev.gain}` : 'You: 0';
        const gainCls = ev.gain > 0 ? 'mystery-box-gain-pos' : ev.gain < 0 ? 'mystery-box-gain-neg' : 'mystery-box-gain-zero';
        const txtCls = ev.gain === 0 ? 'mystery-box-gain-text mystery-box-gain-zero-txt' : 'mystery-box-gain-text';
        const gainY = 21 + this.actorIds.length * (rowH + 1.2) + 2;
        s('rect', { x: -card.w / 2 + 6, y: gainY, width: card.w - 12, height: 14, rx: 7, class: gainCls, ...ol(1.6) }, gainG);
        text(gainG, 0, gainY + 7.5, gainStr, { class: txtCls });
        gsap.from(gainG, { opacity: 0, scale: rm ? 1 : 0, duration: 0.28, ease: 'back.out(2.4)', transformOrigin: '50% 50%' });
        await wait(rm ? 0.15 : 0.25);

        // Shut the crate for the next case.
        if (!rm) gsap.to(this.lidG, { rotation: 0, y: 0, duration: 0.15 });
        else gsap.set(this.lidG, { rotation: 0 });
        this.plateText.textContent = '?';
        gsap.to(card.activeRing, { opacity: 0.25, duration: 0.2 });
        if (!rm) gsap.to(card.g, { y: CARD_Y, duration: 0.2 });
        break;
      }

      case 'box-average': {
        const rm = reducedMotion();
        // Pulse all cards together to tie the three cases to the weighted average.
        for (const card of this.cards) {
          gsap.fromTo(card.activeRing, { opacity: 0.9 }, { opacity: 0.25, duration: 0.45 });
        }
        // The pile settles at the average: bigger if you gain, smaller if you lose.
        this.pile.set(this.coinsFor(ev.value));

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

        await Promise.all([this.banner(`Average: ${ev.exact} coins`, kind), ...emotes]);
        await wait(rm ? 0.1 : 0.15);
        break;
      }

      default:
        await super.handle(ev);
    }
  }
}

export default MysteryBoxStage;
