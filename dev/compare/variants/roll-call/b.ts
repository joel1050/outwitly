import { gsap } from 'gsap';
import logic from '../../../../src/games/roll-call/logic';
import { CHARACTERS } from '../../../../src/engine/characters';
import type { TimelineEvent } from '../../../../src/engine/types';
import { sfx } from '../../../../src/render/audio';
import { confetti, shake } from '../../../../src/render/fx';
import { Stage, W } from '../../../../src/render/stage';
import { s, text, wait, OUTLINE, reducedMotion } from '../../../../src/render/svg';

const ol = (w = 3) => ({ stroke: OUTLINE, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
const ORDINAL = ['1st', '2nd', '3rd', '4th', '5th'];
const SIGN_Y = 64;
const JAR_TOP = 92;
const JAR_BOTTOM = 196;
const FEET = 292;
const CHIP_R = 10;
const SIGN_COLORS = ['#F2A65A', '#8EC9E8', '#9BD18B', '#E8A3C8'];
/** Rough half-width of each body, so a raised arm starts at its side. */
const HALF: Record<string, number> = { greedy: 25, lazy: 26, showoff: 11, loner: 16 };

const STYLE = `
.roll-call-wall { fill: var(--house); }
.roll-call-floor { fill: var(--stone); }
.roll-call-board { fill: var(--deck); }
.roll-call-jar { fill: rgba(255,255,255,.28); }
.roll-call-rank { font-size: 9px; fill: #2b2a33; }
.roll-call-name { font-size: 12px; fill: #2b2a33; }
`;

function icon(parent: SVGGElement, name: string) {
  const g = s('g', {}, parent);
  const key = name.toLowerCase();
  if (key.includes('pool')) {
    s('rect', { x: -9, y: -6, width: 18, height: 12, rx: 3, fill: '#7EC8E3', ...ol(2) }, g);
    s('path', { d: 'M-6 0 q3 -3 6 0 t6 0', fill: 'none', stroke: '#fff', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, g);
  } else if (key.includes('park')) {
    s('path', { d: 'M0 9 V1', stroke: '#8A6440', 'stroke-width': 2.4 }, g);
    s('circle', { cx: 0, cy: -3, r: 7, fill: '#5F9A52', ...ol(2) }, g);
  } else if (key.includes('mall') || key.includes('shop')) {
    s('rect', { x: -9, y: -3, width: 18, height: 12, fill: '#F4EBDD', ...ol(2) }, g);
    s('path', { d: 'M-10 -3 L-7 -9 H7 L10 -3 Z', fill: '#D4553A', ...ol(2) }, g);
    s('rect', { x: -2.5, y: 2, width: 5, height: 7, fill: '#5D6D8C' }, g);
  } else {
    s('circle', { r: 8, fill: '#FFD34D', ...ol(2) }, g);
    text(g, 0, 0.5, name.charAt(0).toUpperCase(), { class: 'roll-call-rank' });
  }
  return g;
}

export class RollCallStage extends Stage {
  private projects: string[] = [];
  private voters: string[] = [];
  private px: Record<string, number> = {};
  private signW = 90;
  private signs: Record<string, SVGGElement> = {};
  private jars: Record<string, SVGGElement> = {};
  private countText: Record<string, SVGTextElement> = {};
  private badges: Record<string, SVGGElement> = {};
  private stack: Record<string, number> = {};
  private gap = 16;

  protected build() {
    this.projects = this.round.params.projects as string[];
    this.voters = ['you', ...this.round.characters.map((c) => c.id)];
    const vals = this.round.params.yourValues as Record<string, number>;
    const rank = [...this.projects].sort((a, b) => vals[b] - vals[a]);
    const n = this.projects.length;
    const span = n > 1 ? (W - 128) / (n - 1) : 0;
    this.projects.forEach((p, i) => { this.px[p] = n > 1 ? 64 + i * span : W / 2; });
    this.signW = Math.min(96, (n > 1 ? span : W) - 14);
    this.gap = Math.min(21, (JAR_BOTTOM - JAR_TOP - 16) / this.voters.length);

    s('style', {}, this.svg).textContent = STYLE;

    // Town hall: wall, bunting, wooden floor.
    s('rect', { x: 0, y: 0, width: W, height: 300, class: 'roll-call-wall' }, this.bg);
    for (let x = 30; x < W; x += 80) s('rect', { x, y: 0, width: 20, height: 214, fill: 'rgba(0,0,0,.05)' }, this.bg);
    s('rect', { x: 0, y: 214, width: W, height: 86, class: 'roll-call-floor' }, this.bg);
    s('line', { x1: 0, y1: 214, x2: W, y2: 214, ...ol(3) }, this.bg);
    for (let i = 0; i < 9; i++) s('rect', { x: (i * 53) % 380, y: 232 + ((i * 29) % 56), width: 16, height: 6, rx: 3, class: 'c-cobble' }, this.bg);
    s('path', { d: 'M0 8 Q100 26 200 8 T400 8', fill: 'none', stroke: OUTLINE, 'stroke-width': 1.5 }, this.bg);
    const flagColors = ['#E69F00', '#56B4E9', '#CC79A7', '#009E73', '#F0E442'];
    for (let i = 0; i < 16; i++) {
      const x = 12 + i * 25;
      const t = x / 200 - Math.floor(x / 200);
      const y = 8 + 36 * t * (1 - t);
      s('path', { d: `M${x - 6} ${y} L${x + 6} ${y} L${x} ${y + 11} Z`, fill: flagColors[i % 5], ...ol(1.5) }, this.bg);
    }

    this.projects.forEach((p, i) => {
      const x = this.px[p];
      const g = s('g', {}, this.props);
      gsap.set(g, { x, y: 0 });
      // Jar that collects the votes.
      const jar = s('g', {}, g);
      s('rect', { x: -19, y: JAR_TOP, width: 38, height: JAR_BOTTOM - JAR_TOP, rx: 9, class: 'roll-call-jar', ...ol(2.5) }, jar);
      s('rect', { x: -22, y: JAR_TOP - 5, width: 44, height: 8, rx: 3, fill: '#C9C3B8', ...ol(2.5) }, jar);
      s('line', { x1: -12, y1: JAR_TOP + 10, x2: -12, y2: JAR_BOTTOM - 12, stroke: 'rgba(255,255,255,.6)', 'stroke-width': 3, 'stroke-linecap': 'round' }, jar);
      gsap.set(jar, { transformOrigin: '50% 100%' });
      this.jars[p] = jar;
      // Count badge.
      const badge = s('g', {}, g);
      gsap.set(badge, { x: 0, y: JAR_BOTTOM + 4 });
      s('circle', { r: 11, class: 'count-badge', ...ol(2.5) }, badge);
      this.countText[p] = text(badge, 0, 1, '0', { class: 'count-text' });
      gsap.set(badge, { transformOrigin: '50% 50%' });
      this.badges[p] = badge;
      // Sign on top.
      const sign = s('g', {}, g);
      gsap.set(sign, { y: SIGN_Y });
      const w = this.signW;
      s('rect', { x: -w / 2, y: -18, width: w, height: 36, rx: 8, fill: SIGN_COLORS[i % SIGN_COLORS.length], ...ol() }, sign);
      const ic = icon(sign, p);
      gsap.set(ic, { x: -w / 2 + 16, y: 0 });
      text(sign, 10, 1, p, { class: 'roll-call-name' });
      // Your ranking, as a small rosette in the corner.
      const r = rank.indexOf(p);
      s('circle', { cx: w / 2 - 4, cy: -17, r: 9, fill: r === 0 ? '#FFD34D' : '#fff', ...ol(2) }, sign);
      text(sign, w / 2 - 4, -16.5, ORDINAL[r] ?? '', { class: 'roll-call-rank' });
      gsap.set(sign, { transformOrigin: '50% 50%' });
      this.signs[p] = sign;
      this.stack[p] = 0;
    });

    const vs = this.voters.length;
    this.voters.forEach((id, i) => this.addActor(id, 40 + (i * (W - 80)) / Math.max(1, vs - 1), FEET, 0.82));
    this.svg.setAttribute('aria-label', logic.setup(this.round));
  }

  private slotY(k: number) { return JAR_BOTTOM - 12 - k * this.gap; }

  private chip(parent: SVGGElement, id: string, ghost = false) {
    const g = s('g', {}, parent);
    s('circle', { r: CHIP_R, fill: CHARACTERS[id]?.color ?? '#fff', ...ol(2), ...(ghost ? { 'stroke-dasharray': '3 2', opacity: 0.6 } : {}) }, g);
    s('circle', { cx: -3.2, cy: -1.5, r: 1.6, fill: OUTLINE }, g);
    s('circle', { cx: 3.2, cy: -1.5, r: 1.6, fill: OUTLINE }, g);
    s('path', { d: 'M-3 3 q3 2.4 6 0', fill: 'none', stroke: OUTLINE, 'stroke-width': 1.2, 'stroke-linecap': 'round' }, g);
    return g;
  }

  private ringProject(p: string) {
    this.ring(this.previewLayer, this.px[p], (SIGN_Y + JAR_BOTTOM) / 2 - 6, this.signW / 2 + 8, (JAR_BOTTOM - SIGN_Y) / 2 + 30);
  }

  preview(optionId: string | null) {
    this.clearPreview();
    this.previewLayer.classList.remove('is-best');
    if (!optionId) return;
    this.ringProject(optionId);
    const c = this.chip(this.previewLayer, 'you', true);
    gsap.set(c, { x: this.px[optionId], y: this.slotY(0) });
  }

  markBest(optionId: string) {
    this.clearPreview();
    this.previewLayer.classList.add('is-best');
    this.ringProject(optionId);
  }

  protected looks(optionId: string | null) {
    const vals = this.round.params.yourValues as Record<string, number>;
    const fav = [...this.projects].sort((a, b) => vals[b] - vals[a])[0];
    const target = optionId ?? fav;
    this.actors.you.lookAt(this.px[target], SIGN_Y);
    for (const c of this.round.characters) {
      const a = this.actors[c.id];
      const watch = c.ruleArgs?.target as string | undefined;
      // Someone who copies another voter keeps an eye on them; everyone else watches your vote.
      if (watch && this.actors[watch]) a.lookAt(this.actors[watch].x, this.actors[watch].headY);
      else if (optionId) a.lookAt(this.px[optionId], JAR_BOTTOM);
      else a.lookAt(this.actors.you.x, this.actors.you.headY);
    }
  }

  protected async handle(ev: TimelineEvent) {
    switch (ev.t) {
      case 'ballot': return this.ballot(ev.actor, ev.choice, ev.tally);
      case 'project-winner': return this.winner(ev.winner, ev.tally);
      default: return super.handle(ev);
    }
  }

  private setCounts(tally: Record<string, number>, changed?: string) {
    for (const p of this.projects) {
      const v = String(tally[p] ?? 0);
      if (this.countText[p].textContent === v) continue;
      this.countText[p].textContent = v;
      if (p === changed || !changed) {
        gsap.fromTo(this.badges[p], { scale: 1.5 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' });
      }
    }
  }

  private async ballot(id: string, choice: string, tally?: Record<string, number>) {
    const a = this.actors[id];
    const rm = reducedMotion();
    const side = a.x > W / 2 ? -1 : 1;
    const half = (HALF[id] ?? 17);
    const h = a.parts.height;
    for (const other of this.voters) if (other !== id) this.actors[other].lookAt(a.x, a.headY);
    a.lookAt(this.px[choice], SIGN_Y);

    // A hand goes up.
    const arm = s('g', {}, a.bob);
    s('path', { d: `M${side * (half - 3)} ${-h * 0.45} Q${side * (half + 10)} ${-h * 0.7} ${side * (half + 6)} ${-h - 8}`, fill: 'none', ...ol(6) }, arm);
    s('path', { d: `M${side * (half - 3)} ${-h * 0.45} Q${side * (half + 10)} ${-h * 0.7} ${side * (half + 6)} ${-h - 8}`, fill: 'none', stroke: CHARACTERS[id]?.color ?? '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' }, arm);
    s('circle', { cx: side * (half + 6), cy: -h - 10, r: 5, fill: CHARACTERS[id]?.color ?? '#fff', ...ol(2) }, arm);
    gsap.set(arm, { transformOrigin: `${side > 0 ? 0 : 100}% 100%` });
    await gsap.from(arm, { scaleY: 0, opacity: 0, duration: rm ? 0.12 : 0.18, ease: 'back.out(2.5)' });
    sfx('ballot');

    // The voter's chip flies into the project's jar.
    const k = this.stack[choice]++;
    const from: [number, number] = [a.x + side * (half + 6) * a.scale, a.y - (h + 10) * a.scale];
    const to: [number, number] = [this.px[choice], this.slotY(k)];
    const chip = this.chip(this.fx, id);
    gsap.set(chip, { x: from[0], y: from[1] });
    if (rm) {
      gsap.set(chip, { x: to[0], y: to[1] });
      await gsap.from(chip, { opacity: 0, duration: 0.2 });
    } else {
      const mid: [number, number] = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - 50];
      const p = { t: 0 };
      await gsap.to(p, {
        t: 1, duration: 0.42, ease: 'power1.in',
        onUpdate: () => {
          const t = p.t;
          gsap.set(chip, {
            x: (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * mid[0] + t * t * to[0],
            y: (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * mid[1] + t * t * to[1],
            rotation: t * 360,
          });
        },
      });
    }
    sfx('drop');
    gsap.fromTo(this.jars[choice], { scaleY: 0.94 }, { scaleY: 1, duration: 0.3, ease: 'elastic.out(1,0.4)' });
    this.setCounts(tally ?? { ...this.currentTally(), [choice]: this.stack[choice] }, choice);
    gsap.to(arm, { scaleY: 0, opacity: 0, duration: 0.15, delay: 0.1, onComplete: () => arm.remove() });
    for (const other of this.voters) if (other !== id) this.actors[other].lookAt(to[0], to[1]);
    await wait(0.22);
  }

  private currentTally() {
    return Object.fromEntries(this.projects.map((p) => [p, Number(this.countText[p].textContent)]));
  }

  private async winner(winner: string, tally: Record<string, number>) {
    this.setCounts(tally);
    const vals = this.round.params.yourValues as Record<string, number>;
    const best = Math.max(...Object.values(vals));
    const worst = Math.min(...Object.values(vals));
    for (const p of this.projects) {
      if (p === winner) continue;
      gsap.to([this.signs[p], this.jars[p], this.badges[p]], { opacity: 0.4, duration: 0.3 });
    }
    for (const id of this.voters) this.actors[id].lookAt(this.px[winner], SIGN_Y);
    shake(this.world, 2);
    sfx('ding');
    await gsap.to(this.signs[winner], { scale: 1.14, duration: 0.3, ease: 'back.out(2.5)' });
    void confetti(this.fx, this.px[winner], SIGN_Y - 10);
    const n = tally[winner];
    const tied = this.projects.some((p) => p !== winner && tally[p] === n);
    const kind = vals[winner] === best ? 'good' : vals[winner] === worst ? 'bad' : 'info';
    if (kind === 'good') sfx('cheer');
    else if (kind === 'bad') sfx('fail');
    await this.banner(`${winner} wins with ${n} vote${n === 1 ? '' : 's'}${tied ? ' (leftmost tie)' : ''}`, kind);
  }
}

export default RollCallStage;
