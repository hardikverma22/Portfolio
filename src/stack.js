// Recognition as a rack of medals (the stack itself is the keyboard in keyboard.js).
//
// Medals: each hangs from a peg on its ribbon and swings like a pendulum when the cursor brushes past.
// Tap one and the coin flips to its back, engraved with what it was for.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { awards } from './data.js';
import { initKeyboard } from './keyboard.js';
import { mark } from './marks.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const INK = '#211c33';

// a tiny synth for the machine's sounds; created on the first gesture
let ac = null;
function sound(kind) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime, g = ac.createGain();
    g.connect(ac.destination);
    if (kind === 'tick') {
      // a ratchet click: a very short band-passed noise burst
      const n = ac.createBuffer(1, ac.sampleRate * 0.03, ac.sampleRate), d = n.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
      const src = ac.createBufferSource(), bp = ac.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 2;
      src.buffer = n; src.connect(bp); bp.connect(g);
      g.gain.setValueAtTime(0.35, t);
      src.start(t);
    } else if (kind === 'pop') {
      const o = ac.createOscillator();
      o.type = 'sine'; o.frequency.setValueAtTime(380, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.08);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      o.connect(g); o.start(t); o.stop(t + 0.16);
    } else if (kind === 'clunk') {
      const o = ac.createOscillator();
      o.type = 'triangle'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.12);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.connect(g); o.start(t); o.stop(t + 0.22);
    } else if (kind === 'clink') {
      for (const [f, v] of [[2100, 0.12], [3150, 0.06]]) {
        const o = ac.createOscillator(), gg = ac.createGain();
        o.frequency.value = f; gg.gain.setValueAtTime(v, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        o.connect(gg); gg.connect(ac.destination); o.start(t); o.stop(t + 0.36);
      }
    }
  } catch { /* no audio, no problem */ }
}

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
    if (it) { it.w += 2.2; run(); }
  });
  if (reduced) return;

  // pendulums: brushing past a medal gives it a push in the direction the cursor moved
  let raf = 0, last = 0, prev = null;
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.033, (now - (last || now)) / 1000); last = now;
    let energy = 0;
    for (const it of items) {
      it.w += (-26 * Math.sin(it.th) - 1.7 * it.w) * dt;
      it.th += it.w * dt;
      it.th = Math.max(-1.1, Math.min(1.1, it.th));
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
        if (crossed && e.clientY > r.top + r.height * 0.35 && e.clientY < r.bottom + 6) it.w += vx * 0.0016;
      }
      run();
    }
    prev = { x: e.clientX, y: e.clientY, t: now };
  });
  list.addEventListener('pointerleave', () => { prev = null; });
  // when the rack scrolls in, the medals are hung up one by one and swing into place
  ScrollTrigger.create({
    trigger: list, start: 'top 80%', once: true,
    onEnter: () => items.forEach((it, i) => setTimeout(() => { it.th = (i % 2 ? 1 : -1) * 0.5; it.w = 0; run(); }, i * 90)),
  });
}
