import { gsap } from 'gsap';
import logic from '../../../../src/games/mystery-box/logic';
import { CHARACTERS } from '../../../../src/engine/characters';
import type { TimelineEvent } from '../../../../src/engine/types';
import { sfx } from '../../../../src/render/audio';
import { coinArc, confetti, sparkle, tag } from '../../../../src/render/fx';
import { Stage, W } from '../../../../src/render/stage';
import { s, text, wait, OUTLINE, reducedMotion } from '../../../../src/render/svg';

const ol = (w = 3) => ({ stroke: OUTLINE, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
const CARD_Y = 102;
const CARD_H = 120;
const GAIN_Y = CARD_Y + CARD_H / 2 + 15;
const FEET = 290;
const WALLET: [number, number] = [38, 262];

type BoxCase = Extract<TimelineEvent, { t: 'box-case' }>;

const STYLE = `
.mystery-box-wall { fill: color-mix(in srgb, #8E5A9E 30%, var(--bg)); }
.mystery-box-curtain { fill: color-mix(in srgb, #C0504A 75%, var(--bg)); }
.mystery-box-fold { stroke: color-mix(in srgb, #7A2A26 70%, var(--bg)); }
.mystery-box-floor { fill: var(--deck); }
.mystery-box-card { fill: var(--panel); }
.mystery-box-ink { font-size: 10px; fill: var(--ink); }
.mystery-box-num { font-size: 13px; fill: #2b2a33; }
.mystery-box-paddle { font-size: 11px; fill: #2b2a33; }
.mystery-box-gain-up .scene-label-bg { fill: #9fe0b8; }
.mystery-box-gain-down .scene-label-bg { fill: #f6b0a0; }
.mystery-box-won rect { fill: var(--gold); }
`;

const fmtCoins = (v: number) => (Number.isInteger(v) ? String(v) : (Math.round(v * 10) / 10).toString());
const signed = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '±0');
const odds = (chance: string) => {
  const [n, d] = chance.split('/');
  return d ? `${n} in ${d}` : n === '1' ? 'sure' : chance;
};

export class MysteryBoxStage extends Stage {
  private cards: SVGGElement[] = [];
  private lids: SVGGElement[] = [];
  private coins: SVGGElement[] = [];
  private cardX: number[] = [];
  private bidders: string[] = [];
  private caseNo = 0;
  private gains: SVGGElement[] = [];
  private walletText!: SVGTextElement;
  private walletG!: SVGGElement;

  protected build() {
    const { wallet, boxes } = this.round.params as { wallet: number; boxes: { contents: number; chance: string }[] };
    this.bidders = ['you', ...this.round.characters.map((c) => c.id)];
    s('style', {}, this.svg).textContent = STYLE;

    // Auction hall: back wall, curtains, wooden stage.
    s('rect', { x: 0, y: 0, width: W, height: 300, class: 'mystery-box-wall' }, this.bg);
    for (const [x0, dir] of [[0, 1], [W, -1]] as const) {
      s('path', { d: `M${x0} 0 H${x0 + dir * 34} Q${x0 + dir * 22} 110 ${x0 + dir * 30} 216 H${x0} Z`, class: 'mystery-box-curtain', ...ol(3) }, this.bg);
      s('path', { d: `M${x0 + dir * 12} 6 Q${x0 + dir * 8} 110 ${x0 + dir * 14} 210 M${x0 + dir * 22} 6 Q${x0 + dir * 16} 110 ${x0 + dir * 22} 210`, fill: 'none', class: 'mystery-box-fold', 'stroke-width': 2 }, this.bg);
    }
    s('path', { d: 'M0 0 H400 V14 Q350 24 300 14 Q250 24 200 14 Q150 24 100 14 Q50 24 0 14 Z', class: 'mystery-box-curtain', ...ol(2.5) }, this.bg);
    s('rect', { x: -4, y: 214, width: W + 8, height: 90, class: 'mystery-box-floor', ...ol(3) }, this.bg);
    for (const y of [240, 268]) s('line', { x1: 0, y1: y, x2: W, y2: y, stroke: 'rgba(0,0,0,.14)', 'stroke-width': 2 }, this.bg);

    // One card per possible box: its odds, the box, and the coins inside.
    const n = boxes.length;
    const cw = Math.min(108, (W - 60) / n - 10);
    boxes.forEach((b, i) => {
      const x = 30 + ((W - 60) * (i + 0.5)) / n;
      this.cardX.push(x);
      const g = s('g', {}, this.props);
      gsap.set(g, { x, y: CARD_Y, transformOrigin: '50% 50%' });
      s('rect', { x: -cw / 2, y: -CARD_H / 2, width: cw, height: CARD_H, rx: 12, class: 'mystery-box-card', ...ol(3) }, g);
      this.label(g, 0, -CARD_H / 2 + 17, odds(b.chance), 'value-pill');
      // The box.
      // Coins inside, hidden until the lid comes off.
      const coins = s('g', { opacity: 0 }, g);
      for (const [cx, cy] of [[-12, -14], [0, -17], [12, -14], [-6, -20], [6, -21]]) s('ellipse', { cx, cy, rx: 8, ry: 4, fill: '#FFD34D', ...ol(2) }, coins);
      this.coins.push(coins);
      s('rect', { x: -24, y: -14, width: 48, height: 30, rx: 4, fill: '#C68B4E', ...ol(2.5) }, g);
      s('line', { x1: 0, y1: -14, x2: 0, y2: 16, stroke: '#8A5A2E', 'stroke-width': 4 }, g);
      const lid = s('g', {}, g);
      s('rect', { x: -27, y: -24, width: 54, height: 11, rx: 3, fill: '#D99B5B', ...ol(2.5) }, lid);
      s('rect', { x: -4, y: -24, width: 8, height: 11, fill: '#8A5A2E' }, lid);
      text(lid, 0, -18, '?', { class: 'mystery-box-num' });
      this.lids.push(lid);
      // Coin plate.
      s('rect', { x: -22, y: 21, width: 44, height: 18, rx: 6, fill: '#FFD34D', ...ol(2) }, g);
      text(g, 0, 30.5, String(b.contents), { class: 'mystery-box-num' });
      this.cards.push(g);
    });

    // Your wallet.
    this.walletG = s('g', {}, this.props);
    gsap.set(this.walletG, { x: WALLET[0], y: WALLET[1] });
    for (let k = 0; k < 4; k++) s('ellipse', { cx: 0, cy: -4 - k * 5, rx: 11, ry: 4.5, fill: '#FFD34D', ...ol(2) }, this.walletG);
    const pill = s('g', {}, this.walletG);
    gsap.set(pill, { y: 16 });
    s('rect', { x: -22, y: -9, width: 44, height: 18, rx: 9, class: 'tag-bg', ...ol(2) }, pill);
    this.walletText = text(pill, 0, 1, String(wallet), { class: 'tag-text' });

    const xs = this.bidders.length === 3 ? [112, 226, 332] : this.bidders.map((_, i) => 100 + (i * 240) / Math.max(1, this.bidders.length - 1));
    this.bidders.forEach((id, i) => this.addActor(id, xs[i], FEET, 0.9));
    this.svg.setAttribute('aria-label', logic.setup(this.round));
  }

  private bidOf(optionId: string) {
    return optionId === 'pass' ? 0 : Number(optionId.replace('bid', ''));
  }

  /** An auction paddle above someone's head. */
  private paddle(layer: SVGGElement, id: string, label: string, cls = '') {
    const a = this.actors[id];
    const g = s('g', { class: cls }, layer);
    gsap.set(g, { x: a.x + 4, y: a.headY - 4 });
    s('line', { x1: 0, y1: 0, x2: 0, y2: -10, ...ol(3) }, g);
    const face = s('g', {}, g);
    s('rect', { x: -18, y: -32, width: 36, height: 22, rx: 8, fill: '#fff', ...ol(2.5) }, face);
    const t = text(face, 0, -20.5, label, { class: 'mystery-box-paddle' });
    gsap.set(face, { transformOrigin: '50% 50%' });
    return { g, face, t };
  }

  preview(optionId: string | null) {
    this.clearPreview();
    this.previewLayer.classList.remove('is-best');
    if (!optionId) return;
    const bid = this.bidOf(optionId);
    const you = this.actors.you;
    this.ring(this.previewLayer, you.x, you.y - 32, 32, 44);
    this.label(this.previewLayer, you.x, you.headY - 22, bid === 0 ? 'pass' : `bid ${bid}`, 'ghost-pill');
  }

  protected looks(optionId: string | null) {
    // The rivals peek inside the boxes; you watch the boxes, or your paddle once you pick a bid.
    this.round.characters.forEach((c, i) => {
      const k = Math.min(this.cardX.length - 1, Math.round((i * (this.cardX.length - 1)) / Math.max(1, this.round.characters.length - 1)));
      this.actors[c.id].lookAt(this.cardX[k], CARD_Y);
    });
    const you = this.actors.you;
    if (optionId) you.lookAt(you.x, you.headY - 40);
    else you.lookAt(W / 2, CARD_Y);
  }

  protected async handle(ev: TimelineEvent) {
    switch (ev.t) {
      case 'box-case': return this.boxCase(ev);
      case 'box-average': return this.average(ev.value, ev.exact);
      default: return super.handle(ev);
    }
  }

  private async boxCase(ev: BoxCase) {
    const i = this.caseNo++;
    const card = this.cards[i];
    const x = this.cardX[i];
    const rm = reducedMotion();
    // Keep each case near two seconds, and shorter when there are many boxes.
    const k = Math.min(1, 3 / this.cards.length);

    // Spotlight this box and open it.
    this.cards.forEach((c, j) => gsap.to(c, { opacity: j === i ? 1 : 0.45, scale: j === i ? 1.06 : 1, duration: 0.25 }));
    for (const id of this.bidders) this.actors[id].lookAt(x, CARD_Y);
    sfx('pop');
    gsap.to(this.lids[i], { y: rm ? 0 : -12, opacity: 0, duration: 0.22 * k, ease: 'power2.out' });
    await gsap.to(this.coins[i], { opacity: 1, duration: 0.15 * k });
    void sparkle(this.fx, x, CARD_Y - 20);
    sfx('coin');
    await wait(0.15 * k);

    // Sealed paddles go up, then flip all at once.
    const paddles = this.bidders.map((id) => ({ id, ...this.paddle(this.fx, id, '?') }));
    paddles.forEach((p) => gsap.from(p.g, { scaleY: 0, duration: 0.18, ease: 'back.out(2.5)', transformOrigin: '50% 100%' }));
    sfx('swish');
    await wait(0.3 * k);
    await gsap.to(paddles.map((p) => p.face), { scaleX: 0, duration: 0.1 });
    for (const p of paddles) {
      const bid = ev.bids[p.id] ?? 0;
      p.t.textContent = bid === 0 ? 'pass' : String(bid);
      if (bid === 0) (p.face.firstChild as SVGRectElement).setAttribute('fill', '#D9D4CC');
    }
    sfx('tick');
    await gsap.to(paddles.map((p) => p.face), { scaleX: 1, duration: 0.14, ease: 'back.out(2)' });
    await wait(0.35 * k);

    // The top bid wins the box.
    const result = s('g', {}, card);
    if (ev.winner) {
      const win = paddles.find((p) => p.id === ev.winner)!;
      win.g.classList.add('mystery-box-won');
      paddles.forEach((p) => { if (p !== win) gsap.to(p.g, { opacity: 0.4, duration: 0.15 }); });
      gsap.fromTo(win.face, { scale: 1.3 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
      sfx('ding');
      const a = this.actors[ev.winner];
      void coinArc(this.fx, [x, CARD_Y - 6], [a.x, a.headY + 14], Math.max(2, Math.min(6, Math.round(ev.contents / 30))));
      text(result, 0, CARD_H / 2 - 11, ev.winner === 'you' ? `you win at ${ev.price}` : `${CHARACTERS[ev.winner]?.name ?? ev.winner} wins`, { class: 'mystery-box-ink' });
    } else {
      paddles.forEach((p) => gsap.to(p.g, { opacity: 0.4, duration: 0.15 }));
      sfx('thud');
      text(result, 0, CARD_H / 2 - 11, 'no sale', { class: 'mystery-box-ink' });
    }
    gsap.from(result, { opacity: 0, duration: 0.2 });
    await wait(0.3 * k);

    // Your gain or loss on this box.
    const gainCls = ev.gain > 0 ? 'mystery-box-gain-up' : ev.gain < 0 ? 'mystery-box-gain-down' : '';
    const gain = this.label(this.fx, x, GAIN_Y, `you ${signed(ev.gain)}`);
    if (gainCls) gain.classList.add(gainCls);
    gsap.from(gain, { scale: 0, duration: 0.25, ease: 'back.out(2.5)', transformOrigin: '50% 50%' });
    this.gains.push(gain);
    const you = this.actors.you;
    if (ev.gain > 0) { you.setMouth('grin'); sfx('coin'); }
    else if (ev.gain < 0) { you.setMouth('frown'); sfx('fail'); }
    else you.setMouth('flat');
    await wait(0.45 * k);
    gsap.to(paddles.map((p) => p.g), { opacity: 0, duration: 0.15, onComplete: () => paddles.forEach((p) => p.g.remove()) });
  }

  private async average(value: number, exact: string) {
    const wallet = this.round.params.wallet as number;
    this.cards.forEach((c) => gsap.to(c, { opacity: 1, scale: 1, duration: 0.25 }));
    const you = this.actors.you;
    you.setMouth('smile');
    you.lookAt(WALLET[0], WALLET[1]);
    // Each case pours into the wallet in turn, which settles on the average.
    for (const [i, g] of this.gains.entries()) {
      gsap.fromTo(g, { scale: 1.25 }, { scale: 1, duration: 0.25, ease: 'back.out(3)', transformOrigin: '50% 50%' });
      void coinArc(this.fx, [this.cardX[i], GAIN_Y], [WALLET[0], WALLET[1] - 10], 2);
      await wait(0.14);
    }
    sfx('coin');
    const o = { v: wallet };
    const shown = exact.includes('/') ? `≈${fmtCoins(value)}` : exact;
    await gsap.to(o, { v: value, duration: 0.5, ease: 'power1.out', onUpdate: () => { this.walletText.textContent = fmtCoins(Math.round(o.v)); } });
    this.walletText.textContent = shown;
    gsap.fromTo(this.walletG, { scale: 1.3 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' });
    const kind = value > wallet ? 'good' : value < wallet ? 'bad' : 'info';
    if (kind === 'good') { sfx('cheer'); void confetti(this.fx, WALLET[0] + 10, WALLET[1] - 20); }
    else if (kind === 'bad') sfx('fail');
    tag(this.fx, WALLET[0] + 10, WALLET[1] - 46, value - wallet, (v) => signed(v), 'tag-you');
    void you.emote(kind === 'good' ? 'cheer' : kind === 'bad' ? 'sulk' : 'think');
    await this.banner(`On average you end with ${shown} coins`, kind);
  }
}

export default MysteryBoxStage;
