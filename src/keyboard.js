// The stack as a mechanical keyboard. Every keycap is one tool, coloured by field, sitting on a real
// QWERTY position (number row, Q, A and Z rows: exactly forty keys), so typing on your own keyboard
// presses the same key here. A press clacks, and the screen on the case types out the tool, what I built
// with it and where, while the keys it pairs with light up. The space bar picks one at random.
// By night the board is backlit. On phones it splits into two halves, one above the other, like a split
// keyboard, so it stays readable without sideways scrolling.
import { gsap } from 'gsap';
import { toolbox, toolboxGroups, toolboxMeta } from './data.js';
import { mark } from './marks.js';
import { sfx } from './sfx.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// the physical keys, row by row, and the decorative keys at each end (label, width in key units)
const ROWS = [
  { codes: 'Digit1 Digit2 Digit3 Digit4 Digit5 Digit6 Digit7 Digit8 Digit9 Digit0', chars: '1234567890', l: ['esc', 1], r: ['⌫', 1.5] },
  { codes: 'KeyQ KeyW KeyE KeyR KeyT KeyY KeyU KeyI KeyO KeyP', chars: 'QWERTYUIOP', l: ['tab', 1.25], r: ['\\', 1.25] },
  { codes: 'KeyA KeyS KeyD KeyF KeyG KeyH KeyJ KeyK KeyL Semicolon', chars: 'ASDFGHJKL;', l: ['caps', 1.5], r: ['enter', 1] },
  { codes: 'KeyZ KeyX KeyC KeyV KeyB KeyN KeyM Comma Period Slash', chars: 'ZXCVBNM,./', l: ['shift', 1.75], r: ['shift', .75] },
];
// shorter names where the full one won't fit on a keycap
const SHORT = {
  'Context engineering': 'Context eng.', 'Claude / OpenAI': 'Claude · OpenAI', 'Whisper · Speech': 'Whisper', 'MediaPipe · ONNX': 'MediaPipe',
  'Three.js · WebGL': 'Three.js', 'GSAP · Motion': 'GSAP', 'OAuth 2.0 · OIDC': 'OAuth · OIDC', 'Token exchange': 'Token exch.',
  'Feature flags': 'Feature flags', 'Kubernetes': 'K8s', 'Agent skills': 'Skills', 'C# / .NET': 'C# · .NET',
};
const WHERE = { w: ['walmart', 'Walmart'], f: ['fidelity', 'Fidelity'], t: ['tcs', 'TCS'], p: [null, 'Personal'] };

// the keycap sound lives in the shared kit (sfx.js), so the visitor's sound choice applies to it
const clack = () => sfx('clack');

export function initKeyboard({ reduced }) {
  const root = $('#keyboard');
  if (!root) return;
  const colour = Object.fromEntries(toolboxGroups.map(([k, , c]) => [k, c]));
  const groupName = Object.fromEntries(toolboxGroups.map(([k, n]) => [k, n]));
  const tools = toolbox.map(([g, code, name, note], i) => ({ i, g, code, name, note, c: colour[g] }));
  const codeAt = ROWS.flatMap((r) => r.codes.split(' '));
  const charAt = ROWS.flatMap((r) => [...r.chars]);
  const byCode = Object.fromEntries(codeAt.map((c, i) => [c, i]));

  const deco = ([t, u], side) => `<span class="kb-key kb-mod kb-${side}" style="--u:${u}" aria-hidden="true"><span class="kb-cap">${esc(t)}</span></span>`;
  const key = (i) => {
    const t = tools[i];
    return `<button class="kb-key" type="button" data-i="${i}" style="--c:${t.c};--u:1;--col:${i % 10}" aria-label="${esc(t.name)}"><span class="kb-cap"><i class="kb-ch" aria-hidden="true">${esc(charAt[i])}</i><b>${esc(SHORT[t.name] || t.name)}</b></span></button>`;
  };
  const rows = ROWS.map((r, ri) => {
    const ids = [...Array(10)].map((_, k) => ri * 10 + k);
    return `<div class="kb-row">
      <div class="kb-half kb-hl" style="--ro:${ri}">${deco(r.l, 'l')}${ids.slice(0, 5).map(key).join('')}</div>
      <div class="kb-half kb-hr" style="--ro:${ri + 10}">${ids.slice(5).map(key).join('')}${deco(r.r, 'r')}</div>
    </div>`;
  }).join('');

  root.innerHTML = `
  <div class="kb-case">
    <div class="kb-top">
      <div class="kb-screen" aria-live="polite">
        <p class="ks-line"><span class="ks-prompt">&gt;</span> <span class="ks-name">press any key</span><i class="ks-cur"></i></p>
        <p class="ks-note">Every key is a tool I use. <span class="kb-touch">Tap</span><span class="kb-type">Type on your keyboard or click</span> one to see what I built with it.</p>
        <p class="ks-meta"></p>
      </div>
      <div class="kb-badge" aria-hidden="true"><b>HV-40</b><span><i class="kb-led"></i>found <em id="kb-count">0</em>/40</span></div>
    </div>
    <div class="kb-board">
      ${rows}
      <div class="kb-row kb-row-sp">
        <div class="kb-half kb-hl" style="--ro:4">${deco(['fn', 1], 'l')}${deco(['⌥', 1], 'l')}${deco(['⌘', 1.25], 'l')}</div>
        <button class="kb-key kb-space" type="button" style="--u:7" aria-label="Space bar: a random tool"><span class="kb-cap"><b>space · surprise me</b></span></button>
        <div class="kb-half kb-hr" style="--ro:14">${deco(['⌘', 1.25], 'r')}${deco(['⌥', 1], 'r')}</div>
      </div>
    </div>
  </div>
  <ul class="kb-legend">${toolboxGroups.map(([k, n, c]) => `<li data-g="${k}" style="--c:${c}"><i></i>${esc(n)}</li>`).join('')}</ul>
  <div class="kb-where" role="group" aria-label="Show the tools I used at"><span>Used at</span>${Object.entries(WHERE).map(([k, [id, n]]) => `<button type="button" data-w="${k}" aria-pressed="false">${id ? mark(id, 'kw-mk') : ''}${esc(n)}<i>${tools.filter((t) => (toolboxMeta[t.code]?.[0] || 'p').includes(k)).length}</i></button>`).join('')}</div>`;

  const keys = [...root.querySelectorAll('.kb-key[data-i]')];
  const nameEl = $('.ks-name', root), noteEl = $('.ks-note', root), metaEl = $('.ks-meta', root);
  const found = new Set();
  let typing = null, pairTimer = 0;

  function show(i) {
    const t = tools[i], m = toolboxMeta[t.code] || ['p', ''];
    found.add(i);
    $('#kb-count').textContent = found.size;
    root.style.setProperty('--now', t.c);
    keys.forEach((k) => k.classList.toggle('now', +k.dataset.i === i));
    // the name types itself out, then the note and where it's from
    typing?.kill();
    const places = [...m[0]].map((k) => WHERE[k]).filter(Boolean);
    const pairs = m[1].split(' ').filter(Boolean).map((c) => tools.find((x) => x.code === c)).filter(Boolean);
    noteEl.textContent = t.note;
    metaEl.innerHTML = `<span class="ks-g" style="--c:${t.c}">${esc(groupName[t.g])}</span>${places.map(([id, n]) => `<span class="ks-w">${id ? mark(id, 'ks-mk') : '<i class="ks-me">me</i>'}${esc(n)}</span>`).join('')}${pairs.length ? `<span class="ks-p">pairs with ${pairs.map((p) => `<b style="--c:${p.c}">${esc(p.name)}</b>`).join(' ')}</span>` : ''}`;
    if (reduced) { nameEl.textContent = t.name; } else {
      const o = { n: 0 };
      nameEl.textContent = '';
      typing = gsap.to(o, { n: t.name.length, duration: Math.min(0.5, t.name.length * 0.035), ease: 'none', onUpdate: () => { nameEl.textContent = t.name.slice(0, Math.round(o.n)); } });
      gsap.fromTo([noteEl, metaEl], { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.35, delay: 0.25, stagger: 0.06, ease: 'power2.out' });
    }
    // the keys it pairs with light up for a moment
    clearTimeout(pairTimer);
    keys.forEach((k) => k.classList.toggle('pair', pairs.some((p) => p.i === +k.dataset.i)));
    pairTimer = setTimeout(() => keys.forEach((k) => k.classList.remove('pair')), 2600);
  }
  function press(el, i) {
    el.classList.add('down');
    setTimeout(() => el.classList.remove('down'), 140);
    clack();
    if (i != null) show(i);
  }

  root.addEventListener('click', (e) => {
    const k = e.target.closest('.kb-key[data-i], .kb-space');
    if (!k) return;
    if (k.classList.contains('kb-space')) {
      const pool = tools.filter((t) => !found.has(t.i));
      const pick = (pool.length ? pool : tools)[Math.floor(Math.random() * (pool.length || tools.length))];
      press(k); press(keys[pick.i], pick.i);
      return;
    }
    press(k, +k.dataset.i);
  });

  // the legend lights up its keys on hover
  root.querySelector('.kb-legend').addEventListener('pointerover', (e) => {
    const g = e.target.closest('li')?.dataset.g;
    keys.forEach((k) => k.classList.toggle('lit', !!g && tools[+k.dataset.i].g === g));
  });
  root.querySelector('.kb-legend').addEventListener('pointerleave', () => keys.forEach((k) => k.classList.remove('lit')));

  // "used at": pick a company and the keys used there light up while the rest step back
  const board = $('.kb-board', root);
  root.querySelector('.kb-where').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-w]');
    if (!b) return;
    const on = b.getAttribute('aria-pressed') !== 'true';
    root.querySelectorAll('.kb-where button').forEach((x) => x.setAttribute('aria-pressed', String(x === b && on)));
    const w = on ? b.dataset.w : null;
    board.classList.toggle('filtered', !!w);
    keys.forEach((k, j) => {
      const hit = !!w && (toolboxMeta[tools[+k.dataset.i].code]?.[0] || 'p').includes(w);
      k.classList.toggle('used', hit);
      // a quick ripple across the board, left to right
      k.style.setProperty('--wd', `${((+k.style.getPropertyValue('--col') || 0) * 18)}ms`);
    });
  });

  // typing on a real keyboard presses the same key here, while the keyboard is on screen
  let inView = false;
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0.35 }).observe($('.kb-board', root));
  addEventListener('keydown', (e) => {
    if (!inView || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.documentElement.classList.contains('case-open')) return;
    if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
    const i = byCode[e.code];
    if (i == null) return;
    press(keys[i], i);
  });

  // the first time it scrolls into view, a wave of light runs across the board
  if (!reduced) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      root.classList.add('wave');
      setTimeout(() => root.classList.remove('wave'), 1800);
    }, { threshold: 0.4 });
    io.observe($('.kb-board', root));
  }
}
