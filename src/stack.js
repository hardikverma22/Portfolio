// Recognition as a rack of medals (the stack itself is the keyboard in keyboard.js).
//
// Medals: each hangs from a peg on its ribbon and swings like a pendulum when the cursor brushes past.
// Tap one and the coin flips to its back, engraved with what it was for.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sfx } from './sfx.js';
import { awards } from './data.js';
import { initKeyboard } from './keyboard.js';
import { mark } from './marks.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const INK = '#211c33';

// the medals' sounds live in the shared kit (sfx.js), so the visitor's sound choice applies to them
const sound = (kind) => sfx(kind);

export function initStack({ reduced }) {
  initKeyboard({ reduced });
  initMedals(reduced);
}

/* ---------------------------------------------------------------- medals */
function initMedals(reduced) {
  const list = $('#medals');
  if (!list) return;
  const co = { Walmart: ['walmart', '#0071CE'], Fidelity: ['fidelity', '#368727'], TCS: ['tcs', '#EE3984'] };
  list.innerHTML = awards.map(([y, title, w], i) => {
    const cut = title.indexOf(', ');
    const short = cut > 0 ? title.slice(0, cut) : title, more = cut > 0 ? title.slice(cut + 2) : '';
    const [id, c] = co[w];
    return `<li class="mr" style="--c:${c}">
      <button class="mr-hang" aria-pressed="false" aria-label="${esc(title)}, ${esc(w)}${y === '·' ? '' : `, ${y}`}. Tap to flip.">
        <span class="mr-rib" aria-hidden="true"></span>
        <span class="mr-coin" aria-hidden="true"><span class="mr-face mr-front"><b>${y === '·' ? '★' : esc(y)}</b>${mark(id, 'mr-mk')}</span><span class="mr-face mr-back"><small>for</small>${esc(more || short)}</span></span>
      </button>
      <p class="mr-t">${esc(short)}</p><p class="mr-w">${esc(w)}</p></li>`;
  }).join('');
  const items = [...list.querySelectorAll('.mr-hang')].map((el) => ({ el, th: 0, w: 0 }));

  list.addEventListener('click', (e) => {
    const h = e.target.closest('.mr-hang');
    if (!h) return;
    const on = h.getAttribute('aria-pressed') !== 'true';
    h.setAttribute('aria-pressed', on);
    h.classList.toggle('flipped', on);
    sound('clink');
    const it = items.find((x) => x.el === h);
    if (it) { it.w += 1.2; run(); }
  });
  if (reduced) return;

  // pendulums: brushing past a medal gives it a push in the direction the cursor moved
  let raf = 0, last = 0, prev = null;
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.033, (now - (last || now)) / 1000); last = now;
    let energy = 0;
    for (const it of items) {
      it.w += (-26 * Math.sin(it.th) - 3.2 * it.w) * dt;
      it.th += it.w * dt;
      // a medal on a ribbon swings a little and settles; it never swings into its neighbours
      if (Math.abs(it.th) > 0.32) { it.th = Math.sign(it.th) * 0.32; it.w *= -0.3; }
      it.el.style.transform = `rotate(${it.th}rad)`;
      energy = Math.max(energy, Math.abs(it.th) + Math.abs(it.w));
    }
    if (energy > 0.002) raf = requestAnimationFrame(frame);
    else for (const it of items) { it.th = 0; it.w = 0; it.el.style.transform = ''; }
  }
  const run = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };
  list.addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (prev) {
      const dt = Math.max(0.008, (now - prev.t) / 1000), vx = Math.max(-2500, Math.min(2500, (e.clientX - prev.x) / dt));
      for (const it of items) {
        const r = it.el.getBoundingClientRect();
        const crossed = (prev.x - r.left) * (e.clientX - r.left) <= 0 || (prev.x - r.right) * (e.clientX - r.right) <= 0 || (e.clientX > r.left && e.clientX < r.right);
        if (crossed && e.clientY > r.top + r.height * 0.35 && e.clientY < r.bottom + 6) it.w += vx * 0.0006;
      }
      run();
    }
    prev = { x: e.clientX, y: e.clientY, t: now };
  });
  list.addEventListener('pointerleave', () => { prev = null; });
  // when the rack scrolls in, the medals are hung up one by one and swing into place
  ScrollTrigger.create({
    trigger: list, start: 'top 80%', once: true,
    onEnter: () => items.forEach((it, i) => setTimeout(() => { it.th = (i % 2 ? 1 : -1) * 0.28; it.w = 0; run(); }, i * 90)),
  });
}
