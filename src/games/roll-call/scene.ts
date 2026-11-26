import { gsap } from 'gsap';
import { CHARACTERS, leadingProject } from '../../engine/characters';
import type { TimelineEvent } from '../../engine/types';
import logic, { type RollCallParams } from './logic';
import { sfx } from '../../render/audio';
import { confetti, shake, sparkle } from '../../render/fx';
import { Stage, W } from '../../render/stage';
import { OUTLINE, reducedMotion, s, text, wait } from '../../render/svg';

const ol = (w = 3) => ({ stroke: OUTLINE, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
const ORDINAL = ['1st', '2nd', '3rd', '4th'];
const BOARD_Y = 70;
const BOARD_H = 108;
const ACTOR_Y = 278;

const PROJECT_PALETTE: Record<string, string> = {
  mall: '#F2A679',
  pool: '#8EC9E8',
  park: '#9BD18B',
  library: '#C7AEE8',
  bridge: '#F2C97D',
  market: '#F29EB0',
  garden: '#9BD18B',
  fountain: '#8EC9E8',
  skatepark: '#F2A65A',
};
const FALLBACK_COLORS = ['#F2A679', '#8EC9E8', '#9BD18B', '#C7AEE8'];

const STYLES = `
  .roll-call-hall { fill: #e7d9c4; }
  .roll-call-roof { fill: #c67c5c; }
  .roll-call-floor { fill: #d8ccb8; }
  .roll-call-stage { fill: #c5b49b; }
  .roll-call-board { fill: #fffdf8; }
  .roll-call-slot { fill: #eee5d6; stroke: var(--outline); stroke-width: 1.4; stroke-dasharray: 2 2; }
  .roll-call-title { font-size: 12px; fill: #2b2a33; }
  .roll-call-tally { font-size: 18px; fill: #2b2a33; font-family: var(--font-display); }
  .roll-call-tally-bg { fill: #f6efe2; }
  .roll-call-pref-bg { fill: #fff; }
  .roll-call-pref-top { fill: #ffe07a; }
  .roll-call-pref-text { font-size: 9.5px; fill: #2b2a33; }
  .roll-call-chip-text { font-size: 8.5px; fill: #2b2a33; }
  .roll-call-chip-text-light { font-size: 8.5px; fill: #fffdf8; }
  .roll-call-preview-box { fill: none; stroke: var(--primary); stroke-width: 3; stroke-dasharray: 8 4; }
  .is-best .roll-call-preview-box { stroke: var(--gold); }
  .roll-call-win-frame { fill: none; stroke: var(--gold); stroke-width: 4; }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) .roll-call-hall { fill: #3f3844; }
    :root:not([data-theme='light']) .roll-call-roof { fill: #784838; }
    :root:not([data-theme='light']) .roll-call-floor { fill: #3b3742; }
    :root:not([data-theme='light']) .roll-call-stage { fill: #4a4452; }
    :root:not([data-theme='light']) .roll-call-board { fill: #312d3a; }
    :root:not([data-theme='light']) .roll-call-slot { fill: #433e4f; }
    :root:not([data-theme='light']) .roll-call-tally-bg { fill: #494456; }
    :root:not([data-theme='light']) .roll-call-tally { fill: #f3ede2; }
  }
  :root[data-theme='dark'] .roll-call-hall { fill: #3f3844; }
  :root[data-theme='dark'] .roll-call-roof { fill: #784838; }
  :root[data-theme='dark'] .roll-call-floor { fill: #3b3742; }
  :root[data-theme='dark'] .roll-call-stage { fill: #4a4452; }
  :root[data-theme='dark'] .roll-call-board { fill: #312d3a; }
  :root[data-theme='dark'] .roll-call-slot { fill: #433e4f; }
  :root[data-theme='dark'] .roll-call-tally-bg { fill: #494456; }
  :root[data-theme='dark'] .roll-call-tally { fill: #f3ede2; }
`;

function projectColor(name: string, index: number): string {
  return PROJECT_PALETTE[name.toLowerCase()] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function drawProjectIcon(parent: SVGGElement, name: string) {
  const g = s('g', {}, parent);
  const key = name.toLowerCase();
  if (key === 'mall' || key === 'market') {
    s('rect', { x: -9, y: -4, width: 18, height: 11, rx: 1.5, fill: '#FFF4E0', ...ol(1.6) }, g);
    s('path', { d: 'M-11 -4 L-8 -10 H8 L11 -4 Z', fill: '#E06A54', ...ol(1.6) }, g);
    s('rect', { x: -3, y: 1, width: 6, height: 6, fill: '#8EC9E8', ...ol(1.2) }, g);
  } else if (key === 'pool') {
    s('rect', { x: -10, y: -5, width: 20, height: 12, rx: 5, fill: '#5BA7D1', ...ol(1.6) }, g);
    s('path', { d: 'M-6 0 q3 -3 6 0 t6 0 M-5 4 q2.5 -2 5 0 t5 0', fill: 'none', stroke: '#E9F6F8', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
  } else if (key === 'park' || key === 'garden') {
    s('rect', { x: -2, y: 0, width: 4, height: 8, fill: '#8A6440', ...ol(1.3) }, g);
    s('circle', { cx: 0, cy: -4, r: 7, fill: '#5F9A52', ...ol(1.6) }, g);
    s('circle', { cx: -5, cy: -1, r: 4.5, fill: '#6EB15E', ...ol(1.4) }, g);
    s('circle', { cx: 5, cy: -1, r: 4.5, fill: '#6EB15E', ...ol(1.4) }, g);
  } else if (key === 'library' || key === 'school' || key === 'museum') {
    s('path', { d: 'M-10 -3 L0 -10 L10 -3 Z', fill: '#D9C8B2', ...ol(1.5) }, g);
    s('rect', { x: -9, y: -3, width: 18, height: 10, fill: '#FFF4E0', ...ol(1.5) }, g);
    s('line', { x1: -4, y1: -3, x2: -4, y2: 7, ...ol(1.4) }, g);
    s('line', { x1: 4, y1: -3, x2: 4, y2: 7, ...ol(1.4) }, g);
  } else if (key === 'bridge') {
    s('path', { d: 'M-10 6 Q-10 -4 0 -4 Q10 -4 10 6', fill: 'none', ...ol(2) }, g);
    s('line', { x1: -11, y1: 6, x2: 11, y2: 6, ...ol(2) }, g);
    s('line', { x1: -5, y1: -2, x2: -5, y2: 6, ...ol(1.4) }, g);
    s('line', { x1: 5, y1: -2, x2: 5, y2: 6, ...ol(1.4) }, g);
  } else {
    // Civic star badge fallback for any custom project name.
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 4 : 8.5;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push(`${r * Math.cos(a)},${r * Math.sin(a)}`);
    }
    s('polygon', { points: pts.join(' '), fill: '#FFD34D', ...ol(1.5) }, g);
  }
  return g;
}

interface BoardRef {
  g: SVGGElement;
  x: number;
  w: number;
  color: string;
  tallyBg: SVGRectElement;
  tallyText: SVGTextElement;
  slotsG: SVGGElement;
  crown: SVGGElement;
  chips: number;
}

export class RollCallStage extends Stage {
  private projects: string[] = [];
  private yourValues: Record<string, number> = {};
  private boards: Record<string, BoardRef> = {};
  private voterOrder: string[] = [];
  private tally: Record<string, number> = {};
  private winnerProject: string | null = null;

  protected build() {
    const styleEl = s('style', {}, this.svg);
    styleEl.textContent = STYLES;

    const params = this.round.params as RollCallParams;
    this.projects = params.projects;
    this.yourValues = params.yourValues;
    this.voterOrder = ['you', ...this.round.characters.map((c) => c.id)];
    this.tally = Object.fromEntries(this.projects.map((p) => [p, 0]));

    // Town hall plaza background.
    s('rect', { x: 0, y: 0, width: W, height: 86, class: 'c-sky' }, this.bg);
    // Subtle town hall pediment & columns behind the boards.
    s('path', { d: 'M116 42 L200 10 L284 42 Z', class: 'roll-call-roof', ...ol(2.2) }, this.bg);
    s('rect', { x: 126, y: 42, width: 148, height: 46, class: 'roll-call-hall', ...ol(2) }, this.bg);
    s('circle', { cx: 200, cy: 28, r: 6, fill: '#FFFDF8', ...ol(1.6) }, this.bg);
    s('path', { d: 'M200 28 V24.5 M200 28 L203 29', fill: 'none', ...ol(1.2) }, this.bg);
    // Plaza floor and voter stage.
    s('rect', { x: 0, y: 84, width: W, height: 216, class: 'roll-call-floor' }, this.bg);
    s('line', { x1: 0, y1: 84, x2: W, y2: 84, ...ol(2.5) }, this.bg);
    s('rect', { x: 0, y: 196, width: W, height: 104, class: 'roll-call-stage' }, this.bg);
    s('line', { x1: 0, y1: 196, x2: W, y2: 196, ...ol(2) }, this.bg);

    // Preference ranking (best first).
    const ranked = [...this.projects].sort((a, b) => this.yourValues[b] - this.yourValues[a]);
    const n = this.projects.length;
    const boardW = n >= 4 ? 86 : 108;
    const span = n >= 4 ? 290 : 254;
    const startX = W / 2 - span / 2;
    const stepX = n > 1 ? span / (n - 1) : 0;

    this.projects.forEach((project, idx) => {
      const x = startX + idx * stepX;
      const color = projectColor(project, idx);
      const g = s('g', {}, this.props);
      gsap.set(g, { x, y: BOARD_Y, transformOrigin: '50% 50%' });

      // Support posts standing on the plaza.
      s('rect', { x: -boardW * 0.34, y: BOARD_H - 4, width: 6, height: 22, fill: '#8A6440', ...ol(2) }, g);
      s('rect', { x: boardW * 0.34 - 6, y: BOARD_H - 4, width: 6, height: 22, fill: '#8A6440', ...ol(2) }, g);

      // Board drop shadow & main card.
      s('rect', { x: -boardW / 2 + 2, y: 3, width: boardW, height: BOARD_H, rx: 12, fill: 'var(--shadow)' }, g);
      s('rect', { x: -boardW / 2, y: 0, width: boardW, height: BOARD_H, rx: 12, class: 'roll-call-board', ...ol(2.6) }, g);

      // Colored header band.
      s('path', {
        d: `M${-boardW / 2} 12 a12 12 0 0 1 12 -12 h${boardW - 24} a12 12 0 0 1 12 12 v18 H${-boardW / 2} Z`,
        fill: color,
        ...ol(2.4),
      }, g);

      // Icon + project title in header.
      const ic = drawProjectIcon(g, project);
      gsap.set(ic, { x: -boardW / 2 + 19, y: 15, scale: n >= 4 ? 0.78 : 0.88 });
      text(g, 10, 15.5, project, { class: 'roll-call-title' });

      // Live tally pill.
      const tallyBg = s('rect', { x: -24, y: 36, width: 48, height: 26, rx: 10, class: 'roll-call-tally-bg', ...ol(2) }, g);
      const tallyText = text(g, 0, 49.5, '0', { class: 'roll-call-tally' });

      // Vote chip slots (row of tiny dashed slots that fill with voter chips).
      const slotsG = s('g', {}, g);
      const maxSlots = this.voterOrder.length;
      const slotGap = Math.min(18, (boardW - 18) / Math.max(1, maxSlots));
      for (let k = 0; k < maxSlots; k++) {
        const sx = (k - (maxSlots - 1) / 2) * slotGap;
        s('circle', { cx: sx, cy: 78, r: 6.2, class: 'roll-call-slot' }, slotsG);
      }

      // Your preference pill along bottom edge of board.
      const rankIdx = ranked.indexOf(project);
      const isTop = rankIdx === 0;
      const prefStr = isTop ? `★ ${ORDINAL[rankIdx]} choice` : `${ORDINAL[rankIdx] ?? `#${rankIdx + 1}`} choice`;
      const pw = Math.min(boardW - 8, prefStr.length * 5.6 + 14);
      s('rect', {
        x: -pw / 2, y: BOARD_H - 13, width: pw, height: 18, rx: 9,
        class: isTop ? 'roll-call-pref-top' : 'roll-call-pref-bg',
        ...ol(1.8),
      }, g);
      text(g, 0, BOARD_H - 3.5, prefStr, { class: 'roll-call-pref-text' });

      // Leader crown (hidden until this project leads).
      const crown = s('g', { opacity: 0 }, g);
      s('path', { d: 'M-9 3 L-11 -5 L-4 -1 L0 -8 L4 -1 L11 -5 L9 3 Z', fill: '#FFD34D', ...ol(2) }, crown);
      gsap.set(crown, { x: 0, y: -8, scale: 0, transformOrigin: '50% 100%' });

      this.boards[project] = { g, x, w: boardW, color, tallyBg, tallyText, slotsG, crown, chips: 0 };
    });

    // Voters lined up in cast order left-to-right at the bottom.
    const vn = this.voterOrder.length;
    const actorScale = vn >= 5 ? 0.78 : 0.86;
    const vSpan = vn >= 5 ? 310 : 270;
    const vStart = W / 2 - vSpan / 2;
    const vStep = vn > 1 ? vSpan / (vn - 1) : 0;

    this.voterOrder.forEach((id, i) => {
      const vx = vStart + i * vStep;
      this.addActor(id, vx, ACTOR_Y, actorScale);
    });

    this.svg.setAttribute('aria-label', logic.setup(this.round));
  }

  preview(optionId: string | null) {
    this.clearPreview();
    this.previewLayer.classList.remove('is-best');
    if (!optionId || !this.boards[optionId]) return;
    const b = this.boards[optionId];

    // Dashed frame around the project board + bouncing pointer arrow.
    const frame = s('rect', {
      x: b.x - b.w / 2 - 5, y: BOARD_Y - 5, width: b.w + 10, height: BOARD_H + 14, rx: 15,
      class: 'roll-call-preview-box',
    }, this.previewLayer);
    if (!reducedMotion()) gsap.to(frame, { strokeDashoffset: -24, duration: 1, repeat: -1, ease: 'none' });

    const arrow = s('path', { d: `M${b.x - 8} ${BOARD_Y - 22} h16 l-8 11 Z`, class: 'ring-arrow' }, this.previewLayer);
    if (!reducedMotion()) gsap.to(arrow, { y: -3, duration: 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  markBest(optionId: string) {
    this.clearPreview();
    this.previewLayer.classList.add('is-best');
    const b = this.boards[optionId];
    if (!b) return;

    const isWinner = optionId === this.winnerProject;
    const pad = isWinner ? 9 : 5;
    const fy = isWinner ? BOARD_Y - 3 - pad : BOARD_Y - pad;
    const fh = isWinner ? BOARD_H + pad * 2 + 6 : BOARD_H + pad * 2 + 4;
    const frame = s('rect', {
      x: b.x - b.w / 2 - pad, y: fy, width: b.w + pad * 2, height: fh, rx: 16,
      class: 'roll-call-preview-box',
    }, this.previewLayer);
    if (!reducedMotion()) gsap.to(frame, { strokeDashoffset: -24, duration: 1, repeat: -1, ease: 'none' });

    if (!isWinner) {
      const arrow = s('path', { d: `M${b.x - 7} ${BOARD_Y - 21} h14 l-7 10 Z`, class: 'ring-arrow' }, this.previewLayer);
      if (!reducedMotion()) gsap.to(arrow, { y: -3, duration: 0.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    }
    this.label(this.previewLayer, b.x, BOARD_Y + BOARD_H + 19, 'Best vote', 'ghost-pill');
  }

  protected looks(optionId: string | null) {
    if (optionId && this.boards[optionId]) {
      this.actors.you.lookAt(this.boards[optionId].x, BOARD_Y + 40);
      const out = logic.resolve(this.round, optionId);
      for (const ev of out.events) {
        if (ev.t === 'ballot' && ev.actor !== 'you' && this.boards[ev.choice]) {
          this.actors[ev.actor]?.lookAt(this.boards[ev.choice].x, BOARD_Y + 40);
        }
      }
      return;
    }
    // Idle: you eye your top choice; fixed-project voters eye their favorite; copycat eyes its target.
    const topProj = [...this.projects].sort((a, b) => this.yourValues[b] - this.yourValues[a])[0];
    this.actors.you.lookAt(this.boards[topProj].x, BOARD_Y + 40);
    for (const c of this.round.characters) {
      const a = this.actors[c.id];
      if (!a) continue;
      if (c.ruleKey === 'fixedProject' && c.ruleArgs?.project && this.boards[c.ruleArgs.project]) {
        a.lookAt(this.boards[c.ruleArgs.project].x, BOARD_Y + 40);
      } else if (c.ruleKey === 'copyVote' && c.ruleArgs?.target && this.actors[c.ruleArgs.target]) {
        const t = this.actors[c.ruleArgs.target];
        a.lookAt(t.x, t.headY + 14);
      } else {
        a.lookAt(W / 2, BOARD_Y + 45);
      }
    }
  }

  private updateLeaderCrown() {
    const total = Object.values(this.tally).reduce((a, b) => a + b, 0);
    const leader = total > 0 ? leadingProject(this.projects, this.tally) : null;
    for (const p of this.projects) {
      const crown = this.boards[p].crown;
      const isLead = p === leader;
      gsap.to(crown, {
        scale: isLead ? 1 : 0,
        opacity: isLead ? 1 : 0,
        duration: 0.25,
        ease: isLead ? 'back.out(2.4)' : 'power2.in',
      });
    }
  }

  protected async handle(ev: TimelineEvent) {
    switch (ev.t) {
      case 'ballot': {
        const rm = reducedMotion();
        const actor = this.actors[ev.actor];
        const board = this.boards[ev.choice];
        if (!actor || !board) break;

        // Update local tally from event payload.
        if (ev.tally) {
          this.tally = { ...ev.tally };
        } else {
          this.tally[ev.choice] = (this.tally[ev.choice] ?? 0) + 1;
        }

        // Actor glances at target board and hops up as they cast their vote.
        actor.lookAt(board.x, BOARD_Y + 50);
        if (!rm) {
          gsap.timeline()
            .to(actor.squash, { scaleY: 0.86, scaleX: 1.1, duration: 0.09 })
            .to(actor.squash, { scaleY: 1.08, scaleX: 0.94, duration: 0.12 })
            .to(actor.squash, { scaleY: 1, scaleX: 1, duration: 0.18, ease: 'back.out(2)' });
        }

        const voterColor = CHARACTERS[ev.actor]?.color ?? '#F4EBDD';
        const initial = ev.actor === 'you' ? 'Y' : (CHARACTERS[ev.actor]?.name?.[0] ?? '?');
        const chipTxtCls = ev.actor === 'loner' || ev.actor === 'fair' || ev.actor === 'hero'
          ? 'roll-call-chip-text-light'
          : 'roll-call-chip-text';

        // Flying ballot token in voter's color.
        const maxSlots = this.voterOrder.length;
        const slotGap = Math.min(18, (board.w - 18) / Math.max(1, maxSlots));
        const slotIdx = board.chips;
        const slotLocalX = (slotIdx - (maxSlots - 1) / 2) * slotGap;
        const slotLocalY = 78;
        const targetX = board.x + slotLocalX;
        const targetY = BOARD_Y + slotLocalY;

        const slip = s('g', {}, this.fx);
        s('circle', { r: 8.5, fill: voterColor, ...ol(2) }, slip);
        text(slip, 0, 0.5, initial, { class: chipTxtCls });
        gsap.set(slip, { x: actor.x, y: actor.headY - 8 });

        sfx('ballot');
        if (rm) {
          gsap.set(slip, { x: targetX, y: targetY, opacity: 0 });
          await gsap.to(slip, { opacity: 1, duration: 0.22 });
        } else {
          const midX = (actor.x + targetX) / 2;
          const midY = Math.min(actor.headY - 44, targetY - 26);
          const p = { t: 0 };
          await gsap.to(p, {
            t: 1,
            duration: 0.42,
            ease: 'power1.inOut',
            onUpdate: () => {
              const t = p.t;
              const x = (1 - t) ** 2 * actor.x + 2 * (1 - t) * t * midX + t * t * targetX;
              const y = (1 - t) ** 2 * (actor.headY - 8) + 2 * (1 - t) * t * midY + t * t * targetY;
              gsap.set(slip, { x, y, scale: 1 + Math.sin(t * Math.PI) * 0.28 });
            },
          });
        }
        slip.remove();

        // Land permanent voter chip onto the project board.
        const chip = s('g', {}, board.slotsG);
        gsap.set(chip, { x: slotLocalX, y: slotLocalY });
        s('circle', { r: 7, fill: voterColor, ...ol(1.8) }, chip);
        text(chip, 0, 0.5, initial, { class: chipTxtCls });
        board.chips++;

        sfx('drop');
        board.tallyText.textContent = String(this.tally[ev.choice]);
        gsap.fromTo(board.tallyText, { scale: 1.45, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.28, ease: 'back.out(2.5)' });
        gsap.fromTo(board.g, { scale: 1.04 }, { scale: 1, duration: 0.24, ease: 'elastic.out(1, 0.5)' });

        this.updateLeaderCrown();
        await wait(0.22);
        break;
      }

      case 'project-winner': {
        const rm = reducedMotion();
        this.tally = { ...ev.tally };
        this.winnerProject = ev.winner;
        const winBoard = this.boards[ev.winner];
        if (!winBoard) break;

        // Dim losing boards and pop the winning board forward with a golden frame.
        for (const p of this.projects) {
          const b = this.boards[p];
          if (p === ev.winner) {
            s('rect', {
              x: -b.w / 2 - 3, y: -3, width: b.w + 6, height: BOARD_H + 6, rx: 14,
              class: 'roll-call-win-frame',
            }, b.g);
            gsap.to(b.g, { scale: 1.06, y: BOARD_Y - 3, duration: rm ? 0.2 : 0.35, ease: 'back.out(2)' });
          } else {
            gsap.to(b.g, { opacity: 0.42, scale: 0.94, duration: 0.3 });
          }
        }
        this.updateLeaderCrown();

        // All characters look at the winning project.
        for (const a of Object.values(this.actors)) a.lookAt(winBoard.x, BOARD_Y + 40);

        const val = this.yourValues[ev.winner];
        const vals = Object.values(this.yourValues);
        const top = Math.max(...vals);
        const bottom = Math.min(...vals);
        const kind = val === top ? 'good' : val === bottom ? 'bad' : 'info';

        if (kind === 'good') {
          sfx('cheer');
          void confetti(this.fx, winBoard.x, BOARD_Y + 18);
        } else if (kind === 'bad') {
          sfx('fail');
          shake(this.world, 3);
        } else {
          sfx('ding');
          void sparkle(this.fx, winBoard.x, BOARD_Y + 18);
        }

        const winCount = ev.tally[ev.winner];
        await this.banner(`${ev.winner} wins (${winCount} vote${winCount === 1 ? '' : 's'})`, kind);
        await wait(0.2);
        break;
      }

      default:
        await super.handle(ev);
    }
  }
}

export default RollCallStage;
