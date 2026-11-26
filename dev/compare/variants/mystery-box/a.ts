import { gsap } from 'gsap';
import { CHARACTERS } from '../../../../src/engine/characters';
import type { TimelineEvent } from '../../../../src/engine/types';
import logic, { type MysteryBoxParams } from '../../../../src/games/mystery-box/logic';
import { sfx } from '../../../../src/render/audio';
import { sparkle } from '../../../../src/render/fx';
import { H, Stage, W } from '../../../../src/render/stage';
import { OUTLINE, reducedMotion, s, text, wait } from '../../../../src/render/svg';

const ol = (width = 2.5) => ({ stroke: OUTLINE, 'stroke-width': width, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
const CASE_LEFT = 88;
const CASE_RIGHT = W - 12;
const BID_TOP = 140;
const BID_HEIGHT = 50;
const PALETTE = ['#D79B71', '#AF9BCD', '#7EB2A5'];
const bidId = (bid: number) => bid === 0 ? 'pass' : `bid${bid}`;
const bidText = (bid: number) => bid === 0 ? 'Pass' : String(bid);
const signed = (gain: number) => gain < 0 ? `−${Math.abs(gain)}` : `+${gain}`;

interface BidSlip {
  g: SVGGElement;
  rect: SVGRectElement;
  label: SVGTextElement;
  seal: SVGGElement;
}

interface BoxCard {
  x: number;
  width: number;
  border: SVGRectElement;
  lid: SVGGElement;
  coins: SVGGElement;
  slips: Map<string, BidSlip>;
}

export default class MysteryBoxStage extends Stage {
  private cast: string[] = [];
  private boxes: BoxCard[] = [];
  private bids = new Map<string, number>();
  private caseIndex = 0;
  private heading!: SVGGElement;
  private chosen?: SVGGElement;
  private best?: SVGGElement;

  protected build() {
    this.svg.setAttribute('aria-label', logic.setup(this.round));
    const { wallet, boxes } = this.round.params as MysteryBoxParams;
    this.cast = ['you', ...this.round.characters.map((c) => c.id)];
    for (const bid of this.round.options.bids as number[]) this.bids.set(bidId(bid), bid);

    s('rect', { width: W, height: H, class: 'c-house' }, this.bg);
    s('path', { d: 'M0 9 H400 V109 H0 Z', class: 'c-stone', ...ol(3) }, this.bg);
    for (const x of [12, 388]) {
      s('path', { d: `M${x - 8} 86 V43 a8 11 0 0 1 16 0 v43 Z`, class: 'c-sky', ...ol(2) }, this.bg);
    }
    s('path', { d: 'M0 108 H400 V239 H0 Z', class: 'c-deck', ...ol(3) }, this.bg);
    s('path', { d: 'M0 239 H400 V300 H0 Z', class: 'c-hull', ...ol(3) }, this.bg);
    s('path', { d: 'M0 247 H400 M0 285 H400 M80 247 V285 M310 247 V285', fill: 'none', stroke: OUTLINE, 'stroke-width': 2, opacity: 0.2 }, this.bg);

    const walletLabel = s('g', {}, this.props);
    s('rect', { x: 7, y: 11, width: 77, height: 34, rx: 9, fill: '#FFE9A8', ...ol(2) }, walletLabel);
    text(walletLabel, 45.5, 21, 'Starting coins', { fill: '#2b2a33', 'font-size': 10 });
    text(walletLabel, 45.5, 34, String(wallet), { fill: '#2b2a33', 'font-size': 14 });
    this.heading = this.label(this.props, (CASE_LEFT + CASE_RIGHT) / 2, 28, 'Possible boxes');

    const slot = (CASE_RIGHT - CASE_LEFT) / boxes.length;
    boxes.forEach(({ contents, chance }, index) => {
      const width = slot - 7;
      const x = CASE_LEFT + (index + 0.5) * slot;
      const card = s('g', {}, this.props);
      s('rect', { x: x - width / 2, y: 53, width, height: 183, rx: 10, fill: 'var(--shadow)' }, card);
      const border = s('rect', { x: x - width / 2, y: 49, width, height: 183, rx: 10, fill: 'var(--panel)', ...ol() }, card);
      text(card, x, 64, `${contents} coins`, { fill: 'var(--ink)', 'font-size': 14 });
      text(card, x, 82, chance.replace('/', ' in '), { fill: 'var(--muted)', 'font-size': 11 });
      const { coins, lid } = this.drawBox(card, x, PALETTE[index % PALETTE.length]);
      const slips = new Map<string, BidSlip>();
      this.cast.forEach((id, i) => slips.set(id, this.drawSlip(card, x, this.bidY(i), width)));
      this.boxes.push({ x, width, border, coins, lid, slips });
    });

    text(this.props, 45, 121, 'Secret bids', { fill: 'var(--ink)', 'font-size': 12 });
    this.cast.forEach((id, i) => {
      const color = CHARACTERS[id].color;
      const y = this.bidY(i);
      s('rect', { x: 7, y: y - 8, width: 78, height: 16, rx: 7, fill: 'var(--panel-2)', ...ol(1.3) }, this.props);
      s('circle', { cx: 17, cy: y, r: 3.8, fill: color, ...ol(1) }, this.props);
      text(this.props, 26, y, CHARACTERS[id].name, { 'text-anchor': 'start', fill: 'var(--ink)', 'font-size': 11 });
      this.addActor(id, 36 + (i + 0.5) * 328 / this.cast.length, 275, Math.min(0.63, 4 / this.cast.length));
    });
  }

  private bidY(i: number) {
    const step = Math.min(18, BID_HEIGHT / this.cast.length);
    return BID_TOP + 8 + i * step;
  }

  private drawBox(card: SVGGElement, x: number, paint: string) {
    const box = s('g', { transform: `translate(${x} 126)` }, card);
    s('ellipse', { cx: 0, cy: 1, rx: 26, ry: 4, fill: 'var(--shadow)' }, box);
    const coins = s('g', { opacity: 0 }, box);
    for (const [cx, cy] of [[-11, -19], [0, -22], [12, -19], [-6, -25], [6, -27]]) {
      s('ellipse', { cx, cy, rx: 6, ry: 3.5, fill: '#FFD86D', ...ol(1.4) }, coins);
    }
    s('rect', { x: -21, y: -17, width: 42, height: 17, rx: 3, fill: paint, ...ol(2) }, box);
    s('path', { d: 'M-13 -16 v15 M13 -16 v15', fill: 'none', stroke: OUTLINE, 'stroke-width': 1.3, opacity: 0.42 }, box);
    const lid = s('g', {}, box);
    s('rect', { x: -23, y: -25, width: 46, height: 9, rx: 3, fill: paint, ...ol(2) }, lid);
    s('path', { d: 'M-17 -22 H17', fill: 'none', stroke: '#FFF1DC', 'stroke-width': 1.4, opacity: 0.6 }, lid);
    s('rect', { x: -4, y: -21, width: 8, height: 8, rx: 2, fill: '#FFD86D', ...ol(1.5) }, lid);
    gsap.set(lid, { transformOrigin: '0% 50%' });
    return { coins, lid };
  }

  private drawSlip(parent: SVGGElement, x: number, y: number, width: number): BidSlip {
    const g = s('g', {}, parent);
    const w = Math.min(62, width - 8);
    const rect = s('rect', { x: x - w / 2, y: y - 7, width: w, height: 14, rx: 4, fill: 'var(--panel-2)', ...ol(1.2) }, g);
    const seal = s('g', {}, g);
    s('path', { d: `M${x - 8} ${y - 4} l8 5 l8 -5`, fill: 'none', stroke: 'var(--muted)', 'stroke-width': 1.2, 'stroke-linecap': 'round' }, seal);
    s('circle', { cx: x, cy: y + 1, r: 2.8, fill: '#C96F70', ...ol(0.8) }, seal);
    const label = text(g, x, y, '', { fill: 'var(--ink)', 'font-size': 11 });
    return { g, rect, label, seal };
  }

  preview(optionId: string | null) {
    this.clearPreview();
    const bid = optionId ? this.bids.get(optionId) : undefined;
    if (bid === undefined) return;
    const x = this.actors.you.x;
    const label = bid === 0 ? 'You pass' : `Your bid: ${bid}`;
    this.label(this.previewLayer, x, 289, label, 'ghost-pill');
    for (const box of this.boxes) {
      s('rect', { x: box.x - Math.min(34, box.width / 2), y: this.bidY(0) - 9, width: Math.min(68, box.width), height: 18, rx: 6, class: 'aim', 'stroke-width': 2 }, this.previewLayer);
    }
  }

  protected looks(optionId: string | null) {
    const bid = optionId ? this.bids.get(optionId) : undefined;
    const focus = this.boxes[Math.floor(this.boxes.length / 2)];
    for (const a of Object.values(this.actors)) a.lookAt(focus.x, bid === undefined ? 116 : this.bidY(0));
  }

  markBest(optionId: string) {
    const bid = this.bids.get(optionId);
    this.clearPreview();
    if (bid === undefined) return;
    this.best?.remove();
    this.best = this.label(this.fx, 305, 289, bid === 0 ? 'Best: pass' : `Best: bid ${bid}`, 'heading-tag');
  }

  protected async handle(ev: TimelineEvent) {
    switch (ev.t) {
      case 'box-case':
        await this.reveal(ev);
        break;
      case 'box-average': {
        this.heading.remove();
        this.boxes[this.caseIndex - 1]?.border.setAttribute('stroke', OUTLINE);
        const { wallet } = this.round.params as MysteryBoxParams;
        const avg = this.label(this.hud, (CASE_LEFT + CASE_RIGHT) / 2, 28, `Average: ${ev.exact} coins`, ev.value >= wallet ? 'heading-tag' : 'hit-tag');
        sfx(ev.value >= wallet ? 'ding' : 'fail');
        await gsap.from(avg, reducedMotion() ? { opacity: 0, duration: 0.22 } : { y: -7, opacity: 0, duration: 0.29, ease: 'back.out(1.5)' });
        break;
      }
      default:
        await super.handle(ev);
    }
  }

  private async reveal(ev: Extract<TimelineEvent, { t: 'box-case' }>) {
    const rm = reducedMotion();
    this.boxes[this.caseIndex - 1]?.border.setAttribute('stroke', OUTLINE);
    const card = this.boxes[this.caseIndex++];
    card.border.setAttribute('stroke', 'var(--gold)');
    for (const actor of Object.values(this.actors)) actor.lookAt(card.x, 112);

    if (!this.chosen) {
      this.chosen = this.label(this.fx, this.actors.you.x, 289, ev.bids.you === 0 ? 'You passed' : `You bid ${ev.bids.you}`);
    }
    sfx('clunk');
    await gsap.timeline()
      .to(card.lid, rm ? { opacity: 0, duration: 0.19 } : { rotation: -20, x: -11, y: 5, duration: 0.28, ease: 'back.out(1.5)' }, 0)
      .to(card.coins, { opacity: 1, duration: 0.19 }, 0.08);
    if (!rm) void sparkle(this.fx, card.x, 105);

    const slips = [...card.slips.values()].map((slip) => slip.g);
    sfx('ballot');
    await gsap.to(slips, rm ? { opacity: 0, duration: 0.14 } : { scaleY: 0, duration: 0.16, transformOrigin: '50% 50%' });
    for (const [id, slip] of card.slips) {
      slip.seal.remove();
      slip.label.textContent = bidText(ev.bids[id]);
      if (id === ev.winner) {
        slip.rect.setAttribute('fill', 'var(--gold)');
        slip.label.setAttribute('fill', '#2b2a33');
      }
    }
    await gsap.to(slips, rm ? { opacity: 1, duration: 0.16 } : { scaleY: 1, duration: 0.2, ease: 'back.out(1.6)' });
    await wait(0.19);

    const who = ev.winner ? CHARACTERS[ev.winner].name : null;
    const winner = who ? `${who} paid ${ev.price}` : 'No bids';
    const gain = `You ${signed(ev.gain)}`;
    const result = s('g', {}, this.fx);
    text(result, card.x, 203, winner, { fill: 'var(--ink)', 'font-size': 11, textLength: winner.length * 5.5 > card.width - 9 ? card.width - 9 : undefined, lengthAdjust: 'spacingAndGlyphs' });
    s('rect', { x: card.x - 33, y: 213, width: 66, height: 15, rx: 6, fill: ev.gain > 0 ? '#9FE0B8' : ev.gain < 0 ? '#F6B0A0' : 'var(--panel-2)', ...ol(1.2) }, result);
    text(result, card.x, 221, gain, { fill: ev.gain === 0 ? 'var(--ink)' : '#2b2a33', 'font-size': 11 });
    this.actors.you.setMouth(ev.gain > 0 ? 'grin' : ev.gain < 0 ? 'frown' : 'flat');
    sfx(ev.gain > 0 ? 'coin' : ev.gain < 0 ? 'thud' : 'drop');
    await gsap.from(result, { opacity: 0, duration: 0.22 });
    await wait(0.54);
  }
}
