import { ROUND_FILES, toRound } from '../../src/engine/content';
import { PUZZLES } from '../../src/games/registry';
import { CHARACTERS, cardText } from '../../src/engine/characters';

// Blind side-by-side compare of scene variants in dev/compare/variants/<type>/<letter>.ts.
// Every variant plays in its own iframe; the buttons here drive all of them at once.

const files = import.meta.glob('./variants/*/*.ts');
const byType: Record<string, string[]> = {};
for (const p of Object.keys(files)) {
  const [type, name] = p.split('/').slice(-2);
  (byType[type] ??= []).push(name.replace(/\.ts$/, ''));
}
for (const t of Object.keys(byType)) byType[t].sort();

const ORDER = ['cookie-cut', 'roll-call', 'mystery-box'];
const types = Object.keys(byType).sort((a, b) => (ORDER.indexOf(a) + 99) % 99 - (ORDER.indexOf(b) + 99) % 99);
const themes = ['auto', 'light', 'dark'];
let theme = 'auto';
const params = new URLSearchParams(location.search);
let current = params.get('type') ?? types[0];
// ?only=p shows a single variant, for whoever is building it.
const only = params.get('only');
if (only) for (const t of Object.keys(byType)) byType[t] = byType[t].filter((v) => v === only);

const $ = (id: string) => document.getElementById(id)!;
const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
const frames = () => Array.from(document.querySelectorAll<HTMLIFrameElement>('iframe'));
const send = (m: unknown) => frames().forEach((f) => f.contentWindow?.postMessage(m, '*'));

function render() {
  $('tabs').innerHTML = types.map((t) => `<button data-t="${t}" aria-pressed="${t === current}">${PUZZLES[t]?.title ?? t}</button>`).join('');
  const file = Object.values(ROUND_FILES).find((f) => f.type === current);
  const type = PUZZLES[current];
  if (!file || !type) { $('brief').textContent = `No round or logic for ${current}.`; return; }
  const round = toRound(file, 1);
  const cards = file.characters.map((c) => `<b>${CHARACTERS[c.id].name}:</b> ${esc(cardText(c.id, c.ruleKey, c.ruleArgs))}`).join('<br>');
  $('brief').innerHTML = `<p><b>Goal:</b> ${esc(type.goal(round))}<br><b>Setup:</b> ${esc(type.setup(round))}<br>${cards}</p>`;
  $('opts').innerHTML = type.options(round).map((o) => `<button class="opt" data-id="${o.id}">${esc(o.label)}</button>`).join('')
    + '<span class="hint">Hover to preview, click to play in all three.</span>';
  const th = theme === 'auto' ? '' : `&theme=${theme}`;
  $('grid').innerHTML = byType[current].map((v) => `
    <div class="col"><h2>${v.toUpperCase()} <small data-ms="${v}"></small></h2>
    <iframe src="./frame.html?type=${current}&v=${v}${th}" title="Variant ${v.toUpperCase()}"></iframe></div>`).join('');
}

window.addEventListener('message', (e) => {
  const m = e.data ?? {};
  const el = document.querySelector(`[data-ms="${m.from}"]`);
  if (!el) return;
  if (m.done) el.textContent = `${(m.ms / 1000).toFixed(1)} s`;
  if (m.error) el.textContent = 'error';
});

document.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest('button');
  if (!b) return;
  if (b.dataset.t) { current = b.dataset.t; history.replaceState(null, '', `?type=${current}${only ? `&only=${only}` : ''}`); render(); }
  else if (b.dataset.id) { document.querySelectorAll('[data-ms]').forEach((x) => (x.textContent = '')); send({ cmd: 'play', id: b.dataset.id }); }
  else if (b.id === 'reset') send({ cmd: 'reset' });
  else if (b.id === 'slow') { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); send({ cmd: 'speed', x: on ? 0.5 : 1 }); }
  else if (b.id === 'theme') {
    theme = themes[(themes.indexOf(theme) + 1) % themes.length];
    b.textContent = `Theme: ${theme}`;
    if (theme === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = theme;
    render();
  }
});
document.addEventListener('mouseover', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('.opt');
  send({ cmd: 'preview', id: b?.dataset.id ?? null });
});

render();
