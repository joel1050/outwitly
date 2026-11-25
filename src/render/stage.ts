import { gsap } from 'gsap';
import type { Outcome, Round, TimelineEvent } from '../engine/types';
import { Actor } from './actor';
import { s, text, wait, reducedMotion, OUTLINE } from './svg';

export const W = 400;
export const H = 300;

export abstract class Stage {
  readonly svg: SVGSVGElement;
  readonly world: SVGGElement;
  readonly bg: SVGGElement;
  readonly props: SVGGElement;
  readonly actorLayer: SVGGElement;
  readonly fx: SVGGElement;
  readonly hud: SVGGElement;
  actors: Record<string, Actor> = {};
  protected previewLayer: SVGGElement;
  protected loops: gsap.core.Animation[] = [];

  constructor(public round: Round, container: HTMLElement) {
    this.svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'scene-svg', role: 'img' });
    container.appendChild(this.svg);
    this.world = s('g', {}, this.svg);
    this.bg = s('g', {}, this.world);
    this.props = s('g', {}, this.world);
    this.previewLayer = s('g', { class: 'preview-layer' }, this.world);
    this.actorLayer = s('g', {}, this.world);
    this.fx = s('g', { class: 'fx' }, this.world);
    this.hud = s('g', {}, this.svg);
  }

  /** Call after construction, so subclass fields exist before build() runs. */
  mount() {
    this.build();
    this.sortActors();
    return this;
  }

  protected abstract build(): void;
  protected abstract handle(ev: TimelineEvent): Promise<void>;
  /** Highlights an option in the scene while the player is deciding. */
  abstract preview(optionId: string | null): void;
  /** Where the characters glance while the player decides. */
  protected looks(_optionId: string | null): void {}

  protected addActor(id: string, x: number, y: number, scale = 1) {
    const a = new Actor(id, this.actorLayer, x, y, scale);
    this.actors[id] = a;
    return a;
  }

  /** Keep nearer actors (larger y) drawn on top. */
  protected sortActors() {
    Object.values(this.actors)
      .sort((a, b) => a.y - b.y)
      .forEach((a) => this.actorLayer.appendChild(a.g));
  }

  async intro() {
    const rm = reducedMotion();
    gsap.from(this.bg, { opacity: 0, duration: 0.35 });
    const props = Array.from(this.props.children);
    if (props.length) {
      gsap.from(props, rm
        ? { opacity: 0, duration: 0.3 }
        : { y: 14, opacity: 0, duration: 0.45, stagger: 0.04, ease: 'back.out(1.6)' });
    }
    Object.values(this.actors).forEach((a, i) => a.popIn(0.35 + i * 0.16));
    await wait(0.4 + Object.keys(this.actors).length * 0.16 + 0.3);
    Object.values(this.actors).forEach((a) => a.startIdle());
    this.looks(null);
  }

  setPreview(optionId: string | null) {
    this.preview(optionId);
    this.looks(optionId);
  }

  async play(outcome: Outcome) {
    this.preview(null);
    const evs = outcome.events;
    for (let i = 0; i < evs.length; i++) {
      // Run a run of emotes together.
      if (evs[i].t === 'emote') {
        const group: Promise<unknown>[] = [];
        while (i < evs.length && evs[i].t === 'emote') {
          const e = evs[i] as Extract<TimelineEvent, { t: 'emote' }>;
          if (e.emote !== 'think') group.push(this.actors[e.actor]?.emote(e.emote) ?? Promise.resolve());
          else group.push(this.handle(e));
          i++;
        }
        i--;
        await Promise.all(group);
        await wait(0.15);
        continue;
      }
      await this.handle(evs[i]);
    }
  }

  /** Gold ring around a scene point, used to show the best move. */
  protected ring(layer: SVGGElement, x: number, y: number, rx: number, ry: number, cls = 'ring') {
    const e = s('ellipse', { cx: x, cy: y, rx, ry, class: cls }, layer);
    if (!reducedMotion()) gsap.to(e, { strokeDashoffset: -24, duration: 1, repeat: -1, ease: 'none' });
    return e;
  }

  protected label(layer: SVGGElement, x: number, y: number, str: string, cls = 'scene-label') {
    const g = s('g', {}, layer);
    const w = str.length * 7 + 18;
    s('rect', { x: x - w / 2, y: y - 11, width: w, height: 22, rx: 11, class: `${cls}-bg`, stroke: OUTLINE, 'stroke-width': 2 }, g);
    text(g, x, y + 1, str, { class: cls });
    return g;
  }

  clearPreview() {
    const old = this.previewLayer.querySelectorAll('*');
    if (old.length) gsap.killTweensOf(old);
    this.previewLayer.replaceChildren();
  }

  /** Banner across the top of the scene. */
  async banner(str: string, kind: 'good' | 'bad' | 'info' = 'info', hold = 0) {
    const g = s('g', { class: `banner banner-${kind}` }, this.hud);
    const w = Math.max(140, str.length * 9 + 30);
    s('rect', { x: W / 2 - w / 2, y: 10, width: w, height: 30, rx: 15, stroke: OUTLINE, 'stroke-width': 2.5 }, g);
    text(g, W / 2, 26, str, { class: 'banner-text' });
    gsap.set(g, { transformOrigin: '50% 50%' });
    await gsap.from(g, { y: -50, duration: 0.4, ease: 'back.out(1.8)' });
    if (hold) {
      await wait(hold);
      await gsap.to(g, { y: -50, opacity: 0, duration: 0.3 });
      g.remove();
    }
    return g;
  }

  /** Shows the best option after the result. Default: reuse the preview highlight. */
  markBest(optionId: string) {
    this.preview(optionId);
    this.previewLayer.classList.add('is-best');
  }

  destroy() {
    Object.values(this.actors).forEach((a) => a.destroy());
    this.loops.forEach((l) => l.kill());
    gsap.killTweensOf(this.svg.querySelectorAll('*'));
    this.svg.remove();
  }
}
