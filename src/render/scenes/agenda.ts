import { gsap } from 'gsap';
import { PUZZLES } from '../../engine/registry';
import type { TimelineEvent } from '../../engine/types';
import { sfx } from '../audio';
import { confetti, shake } from '../fx';
import { Stage, W } from '../stage';
import { s, text, OUTLINE } from '../svg';

const ol = (w = 3) => ({ stroke: OUTLINE, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
const title = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
const SIGN_Y = 96;
const BOX: [number, number] = [200, 218];
const SIGN_X: Record<string, number> = { fountain: 72, skatepark: 200, garden: 328 };
const SIGN_COLOR: Record<string, string> = { fountain: '#8EC9E8', skatepark: '#F2A65A', garden: '#9BD18B' };

function icon(parent: SVGGElement, id: string) {
  const g = s('g', {}, parent);
  if (id === 'fountain') {
    s('path', { d: 'M-10 6 h20 l-3 6 h-14 Z', fill: '#DCE6EE', ...ol(2) }, g);
    s('path', { d: 'M0 6 V-4 M0 -4 q-6 -6 -9 2 M0 -4 q6 -6 9 2', fill: 'none', stroke: '#3D8FC4', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
  } else if (id === 'skatepark') {
    s('path', { d: 'M-12 10 Q-12 -6 -4 -6 H4 Q12 -6 12 10 Z', fill: '#E7C7A0', ...ol(2) }, g);
    s('rect', { x: -7, y: -12, width: 14, height: 3, rx: 1.5, fill: '#2B2A33' }, g);
    s('circle', { cx: -4, cy: -8, r: 1.6, fill: '#2B2A33' }, g);
    s('circle', { cx: 4, cy: -8, r: 1.6, fill: '#2B2A33' }, g);
  } else {
    s('path', { d: 'M0 12 V0', stroke: '#3E7B3A', 'stroke-width': 2.4 }, g);
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5;
      s('circle', { cx: Math.cos(a) * 5, cy: -4 + Math.sin(a) * 5, r: 4, fill: '#F28FB0', ...ol(1.5) }, g);
    }
    s('circle', { cx: 0, cy: -4, r: 3, fill: '#FFD34D', ...ol(1.5) }, g);
  }
  return g;
}

export class AgendaStage extends Stage {
  private signs: Record<string, SVGGElement> = {};
  private box!: SVGGElement;
  private count: Record<string, number> = {};

  protected build() {
    const proposals = this.round.params.proposals as string[];
    const vals = this.round.params.yourValues as Record<string, number>;
    s('rect', { x: 0, y: 0, width: W, height: 300, class: 'c-stone' }, this.bg);
    s('rect', { x: 0, y: 0, width: W, height: 44, class: 'c-sky' }, this.bg);
    const houses: [number, number, number][] = [[0, 44, 22], [48, 40, 30], [96, 52, 20], [150, 46, 28], [210, 50, 18], [262, 44, 30], [318, 42, 24], [362, 48, 30]];
    for (const [x, w, h] of houses) {
      s('path', { d: `M${x} 44 V${44 - h} l${w / 2} -10 l${w / 2} 10 V44 Z`, class: 'c-house', ...ol(2) }, this.bg);
    }
    for (let i = 0; i < 26; i++) {
      s('rect', { x: (i * 67) % 390, y: 60 + ((i * 41) % 230), width: 14, height: 7, rx: 3, class: 'c-cobble' }, this.bg);
    }

    for (const p of proposals) {
      const x = SIGN_X[p];
      const g = s('g', { class: 'sign' }, this.props);
      gsap.set(g, { x, y: SIGN_Y });
      s('rect', { x: -3, y: 0, width: 6, height: 44, fill: '#8A6440', ...ol(2) }, g);
      s('rect', { x: -48, y: -30, width: 96, height: 40, rx: 8, fill: SIGN_COLOR[p], ...ol() }, g);
      const ic = icon(g, p);
      gsap.set(ic, { x: -31, y: -11 });
      text(g, 12, -10, title(p), { class: 'sign-text' });
      gsap.set(g, { transformOrigin: '50% 100%' });
      this.signs[p] = g;
      this.label(this.props, x, SIGN_Y + 58, `you: ${vals[p]}`, 'value-pill');
    }

    this.box = s('g', {}, this.props);
    gsap.set(this.box, { x: BOX[0], y: BOX[1] });
    s('rect', { x: -22, y: -16, width: 44, height: 34, rx: 4, fill: '#5D6D8C', ...ol() }, this.box);
    s('rect', { x: -12, y: -19, width: 24, height: 5, rx: 2, fill: '#2B2A33' }, this.box);
    text(this.box, 0, 4, 'VOTE', { class: 'box-text' });

    const xs: Record<string, number> = {};
    this.round.characters.forEach((c, i) => { xs[c.id] = [50, 120, 280][i]; });
    for (const c of this.round.characters) this.addActor(c.id, xs[c.id], 288, 0.9);
    this.addActor('you', 350, 288, 0.9);
    this.svg.setAttribute('aria-label', PUZZLES.agenda.setup(this.round));
  }

  preview(optionId: string | null) {
    this.clearPreview();
    this.previewLayer.classList.remove('is-best');
    if (!optionId) return;
    const [a, b] = optionId.replace('_first', '').split('_');
    for (const p of [a, b]) {
      this.ring(this.previewLayer, SIGN_X[p], SIGN_Y - 10, 54, 30);
      this.label(this.previewLayer, SIGN_X[p], SIGN_Y - 46, '1st vote', 'ghost-pill');
    }
  }

  protected looks() {
    for (const c of this.round.characters) {
      const fav = (c.ruleArgs as string[])[0];
      this.actors[c.id].lookAt(SIGN_X[fav], SIGN_Y);
    }
    this.actors.you.lookAt(SIGN_X.garden, SIGN_Y);
  }

  protected async handle(ev: TimelineEvent) {
    switch (ev.t) {
      case 'matchup': {
        this.count = { [ev.a]: 0, [ev.b]: 0 };
        for (const [p, g] of Object.entries(this.signs)) {
          const on = p === ev.a || p === ev.b;
          if (g.dataset.down) continue;
          gsap.to(g, { opacity: on ? 1 : 0.35, scale: on ? 1.06 : 0.94, duration: 0.3 });
        }
        sfx('pop');
        await this.banner(`${title(ev.a)} vs ${title(ev.b)}`, 'info', 0.7);
        break;
      }
      case 'ballot': {
        this.count[ev.choice]++;
        const a = this.actors[ev.actor];
        a.lookAt(SIGN_X[ev.choice], SIGN_Y);
        const paper = s('g', {}, this.fx);
        s('rect', { x: -9, y: -7, width: 18, height: 14, rx: 2, fill: SIGN_COLOR[ev.choice], ...ol(2) }, paper);
        text(paper, 0, 0.5, ev.choice[0].toUpperCase(), { class: 'ballot-text' });
        gsap.set(paper, { x: a.x, y: a.headY - 6 });
        sfx('ballot');
        await gsap.timeline()
          .to(paper, { y: a.headY - 30, rotation: -20, duration: 0.18, ease: 'power2.out' })
          .to(paper, { x: BOX[0], duration: 0.42, ease: 'power1.inOut' })
          .to(paper, { y: BOX[1] - 20, rotation: 0, duration: 0.42, ease: 'power2.in' }, '<')
          .to(paper, { scale: 0.3, opacity: 0, duration: 0.1 });
        paper.remove();
        sfx('drop');
        gsap.fromTo(this.box, { scaleY: 0.9 }, { scaleY: 1, duration: 0.3, ease: 'elastic.out(1,0.4)', transformOrigin: '50% 100%' });
        break;
      }
      case 'winner': {
        const w = this.signs[ev.winner];
        const l = this.signs[ev.loser];
        const score = `${this.count[ev.winner]}–${this.count[ev.loser]}`;
        l.dataset.down = '1';
        await gsap.timeline()
          .to(l, { rotation: -6, duration: 0.08 })
          .to(l, { rotation: 6, duration: 0.08 })
          .to(l, { rotation: -4, duration: 0.08 })
          .to(l, { rotation: 88 * (SIGN_X[ev.loser] < 200 ? -1 : 1), opacity: 0.3, duration: 0.4, ease: 'bounce.out' });
        sfx('thud');
        if (!ev.final) sfx('ding');
        shake(this.world, 2);
        gsap.to(w, { scale: 1.1, opacity: 1, duration: 0.25, ease: 'back.out(2)' });
        if (ev.final) {
          sfx('cheer');
          void confetti(this.fx, SIGN_X[ev.winner], SIGN_Y - 20);
          const vals = this.round.params.yourValues as Record<string, number>;
          const top = Math.max(...Object.values(vals));
          await this.banner(`${title(ev.winner)} wins ${score}`, vals[ev.winner] === top ? 'good' : 'bad');
        } else {
          await this.banner(`${title(ev.winner)} wins ${score}`, 'info', 0.6);
        }
        break;
      }
      default:
        break;
    }
  }
}
