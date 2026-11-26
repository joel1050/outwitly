import { gsap } from 'gsap';
import { CHARACTERS } from '../../../../src/engine/characters';
import type { TimelineEvent } from '../../../../src/engine/types';
import logic, { type RollCallParams } from '../../../../src/games/roll-call/logic';
import { sfx } from '../../../../src/render/audio';
import { confetti } from '../../../../src/render/fx';
import { H, Stage, W } from '../../../../src/render/stage';
import { OUTLINE, reducedMotion, s, text, wait } from '../../../../src/render/svg';

const ol = (width = 2.5) => ({ stroke: OUTLINE, 'stroke-width': width, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
const PALETTE = ['#F3A883', '#90CDE5', '#B2D593', '#CDB5E6'];
const TOP = 51;
const CHIP_Y = 168;

interface ProjectBoard {
  x: number;
  width: number;
  g: SVGGElement;
  border: SVGRectElement;
  count: SVGTextElement;
  votes: number;
}

function projectArt(parent: SVGGElement, project: string, x: number) {
  const g = s('g', { transform: `translate(${x} 106)` }, parent);
  switch (project.toLowerCase()) {
    case 'mall':
      s('rect', { x: -21, y: -8, width: 42, height: 22, rx: 3, fill: '#F0D6B7', ...ol(2) }, g);
      s('path', { d: 'M-24 -8 L-18 -18 H18 L24 -8 Q21 -1 15 -7 Q10 -1 5 -7 Q0 -1 -5 -7 Q-10 -1 -15 -7 Q-21 -1 -24 -8 Z', fill: '#D97872', ...ol(2) }, g);
      s('path', { d: 'M-5 14 V1 H5 V14 M-16 2 h5 m22 0 h5', fill: '#9CCEE5', ...ol(2) }, g);
      break;
    case 'pool':
      s('path', { d: 'M-24 -2 Q-22 -12 4 -10 Q29 -10 24 3 Q18 16 -8 14 Q-25 12 -24 -2 Z', fill: '#74BADB', ...ol(2) }, g);
      s('path', { d: 'M-16 5 q4 -3 8 0 t8 0 t8 0 M10 -2 V-15 q0 -4 4 -4 M17 -4 V-16 q0 -4 4 -4 M10 -11 h7 M10 -6 h7', fill: 'none', stroke: '#F1FAFF', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
      break;
    case 'park':
      s('path', { d: 'M-11 14 V-4 M-18 14 H13 M6 4 h14 v5 H6 Z M8 10 v4 m10 -4 v4', fill: '#D1A675', ...ol(2.5) }, g);
      s('path', { d: 'M-24 -3 Q-25 -9 -19 -11 Q-20 -19 -12 -19 Q-5 -21 -2 -14 Q6 -13 4 -6 Q3 0 -4 0 H-17 Q-22 0 -24 -3 Z', fill: '#83B66A', ...ol(2) }, g);
      break;
    default:
      s('path', { d: 'M-20 14 V-12 H5 V-3 H20 V14 Z M-13 -6 h4 M-13 1 h4 M-2 14 V5 H7 V14', fill: '#EAD8B7', ...ol(2) }, g);
  }
}

export default class RollCallStage extends Stage {
  private boards = new Map<string, ProjectBoard>();
  private voters: string[] = [];
  private best?: SVGGElement;

  protected build() {
    this.svg.setAttribute('aria-label', logic.setup(this.round));
    const { projects } = this.round.params as RollCallParams;
    this.voters = ['you', ...this.round.characters.map((c) => c.id)];

    s('rect', { width: W, height: H, class: 'c-house' }, this.bg);
    s('rect', { width: W, y: 7, height: 188, class: 'c-stone', ...ol(3) }, this.bg);
    for (const x of [20, 380]) {
      s('path', { d: `M${x - 13} 16 H${x + 13} V195 H${x - 13} Z`, class: 'c-cobble' }, this.bg);
      s('path', { d: `M${x - 5} 27 V185 M${x + 5} 27 V185`, fill: 'none', stroke: 'var(--stone)', 'stroke-width': 3 }, this.bg);
    }
    s('path', { d: 'M0 197 H400 V300 H0 Z', class: 'c-deck', ...ol(3) }, this.bg);
    s('path', { d: 'M0 208 H400 M0 237 H400 M0 272 H400 M92 208 L54 300 M200 208 V300 M308 208 L346 300', stroke: OUTLINE, 'stroke-width': 2, opacity: 0.16, fill: 'none' }, this.bg);

    const width = 360 / projects.length;
    projects.forEach((project, i) => {
      const x = 20 + (i + 0.5) * width;
      const cardWidth = width - 12;
      const g = s('g', {}, this.props);
      s('rect', { x: x - cardWidth / 2, y: TOP + 4, width: cardWidth, height: 136, rx: 11, fill: 'var(--shadow)' }, g);
      const border = s('rect', { x: x - cardWidth / 2, y: TOP, width: cardWidth, height: 136, rx: 11, fill: 'var(--panel)', ...ol(3) }, g);
      s('path', { d: `M${x - cardWidth / 2 + 3} 77 v-15 q0 -8 9 -8 h${cardWidth - 24} q9 0 9 8 v15 Z`, fill: PALETTE[i % PALETTE.length] }, g);
      text(g, x, 66, project, { fill: '#2b2a33', 'font-size': 14, textLength: project.length * 8 > cardWidth - 12 ? cardWidth - 12 : undefined, lengthAdjust: 'spacingAndGlyphs' });
      projectArt(g, project, x);
      const count = text(g, x, 138, '0 votes', { fill: 'var(--ink)', 'font-size': 17 });
      s('rect', { x: x - cardWidth / 2 + 8, y: 154, width: cardWidth - 16, height: 28, rx: 8, fill: 'var(--panel-2)' }, g);
      this.boards.set(project, { x, width: cardWidth, g, border, count, votes: 0 });
    });

    const lane = 350 / this.voters.length;
    this.voters.forEach((id, i) => {
      const x = 25 + (i + 0.5) * lane;
      this.addActor(id, x, 262, Math.min(0.85, lane / 73));
      const name = CHARACTERS[id].name;
      text(this.props, x, 275, name, { fill: 'var(--ink)', 'font-size': 12, textLength: name.length * 6.5 > lane - 5 ? lane - 5 : undefined, lengthAdjust: 'spacingAndGlyphs' });
    });
  }

  preview(optionId: string | null) {
    this.clearPreview();
    const board = optionId ? this.boards.get(optionId) : undefined;
    if (!board) return;
    s('rect', { x: board.x - board.width / 2 - 3, y: TOP - 3, width: board.width + 6, height: 142, rx: 14, class: 'ring' }, this.previewLayer);
    s('path', { d: `M${board.x - 8} 33 h16 l-8 12 Z`, class: 'ring-arrow' }, this.previewLayer);
  }

  protected looks(optionId: string | null) {
    const x = optionId ? this.boards.get(optionId)?.x ?? W / 2 : W / 2;
    for (const voter of Object.values(this.actors)) voter.lookAt(x, CHIP_Y);
  }

  markBest(optionId: string) {
    const board = this.boards.get(optionId);
    if (!board) return;
    this.clearPreview();
    this.best?.remove();
    this.best = this.label(this.fx, board.x, 201, 'Best vote', 'heading-tag');
    s('path', { d: `M${board.x - 5} 190 l5 -6 l5 6 Z`, fill: 'var(--gold)', ...ol(1.5) }, this.best);
  }

  private setTally(tally: Record<string, number>) {
    for (const [project, board] of this.boards) {
      board.votes = tally[project] ?? 0;
      board.count.textContent = `${board.votes} ${board.votes === 1 ? 'vote' : 'votes'}`;
    }
  }

  protected async handle(ev: TimelineEvent) {
    const rm = reducedMotion();
    switch (ev.t) {
      case 'ballot': {
        const board = this.boards.get(ev.choice);
        const voter = this.actors[ev.actor];
        if (!board || !voter) return;
        for (const a of Object.values(this.actors)) a.lookAt(voter.x, voter.headY);
        const chip = s('g', {}, this.fx);
        const color = CHARACTERS[ev.actor].color;
        s('rect', { x: -7, y: -6, width: 14, height: 12, rx: 3, fill: color, ...ol(1.5) }, chip);
        s('path', { d: 'M-3 0 l2 2 l4 -4', fill: 'none', stroke: '#FFF9EC', 'stroke-width': 1.4, 'stroke-linecap': 'round', 'paint-order': 'stroke' }, chip);
        if (ev.actor === 'you') chip.lastElementChild?.setAttribute('stroke', '#2b2a33');
        const paper = this.label(this.fx, voter.x, 194, CHARACTERS[ev.actor].name, 'value-pill');
        const spacing = Math.min(17, (board.width - 22) / this.voters.length);
        const endX = board.x + (board.votes - (this.voters.length - 1) / 2) * spacing;
        sfx('ballot');
        if (rm) {
          gsap.set(chip, { x: endX, y: CHIP_Y, opacity: 0 });
          await gsap.to(paper, { opacity: 0, duration: 0.23, delay: 0.2 });
          await gsap.to(chip, { opacity: 1, duration: 0.17 });
        } else {
          gsap.set(chip, { x: voter.x, y: Math.min(181, voter.headY - 9), rotation: -12 });
          gsap.from(paper, { opacity: 0, y: 6, duration: 0.14 });
          await gsap.timeline()
            .to(voter.squash, { y: -6, duration: 0.12 }, 0)
            .to(voter.squash, { y: 0, duration: 0.16, ease: 'power2.in' }, 0.12)
            .to(chip, { x: endX, duration: 0.39, ease: 'power2.inOut' }, 0.09)
            .to(chip, { y: 104, rotation: 12, duration: 0.19, ease: 'power2.out' }, 0.09)
            .to(chip, { y: CHIP_Y, rotation: 0, duration: 0.2, ease: 'power2.in' }, 0.28)
            .to(paper, { opacity: 0, duration: 0.18 }, 0.31);
        }
        paper.remove();
        sfx('drop');
        this.setTally(ev.tally ?? Object.fromEntries([...this.boards].map(([key, target]) => [
          key, target.votes + Number(key === ev.choice),
        ])));
        if (!rm) gsap.from(board.count, { scale: 1.22, duration: 0.24, ease: 'power2.out', transformOrigin: '50% 50%' });
        await wait(0.25);
        break;
      }
      case 'project-winner': {
        this.setTally(ev.tally);
        const winner = this.boards.get(ev.winner);
        if (!winner) return;
        this.looks(ev.winner);
        const { yourValues } = this.round.params as RollCallParams;
        const good = yourValues[ev.winner] === Math.max(...Object.values(yourValues));
        winner.border.setAttribute('stroke', 'var(--gold)');
        winner.border.setAttribute('stroke-width', '4');
        for (const [project, board] of this.boards) {
          if (project !== ev.winner) gsap.to(board.g, { opacity: 0.65, duration: 0.23 });
        }
        sfx('ding');
        if (!rm) void confetti(this.fx, winner.x, TOP + 39);
        const title = `${ev.winner} gets built`;
        if (rm) {
          const banner = this.label(this.hud, W / 2, 25, title, 'heading-tag');
          await gsap.from(banner, { opacity: 0, duration: 0.2 });
        } else {
          await this.banner(title, good ? 'good' : 'info');
        }
        break;
      }
      default:
        await super.handle(ev);
    }
  }
}
