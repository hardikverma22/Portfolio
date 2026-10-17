// Shared pieces for the case-study flows (gridflow.js, delegateflow.js), built to be read, not just watched:
// wires draw with an arrowhead, a reply travels back on its own lane, and every chip that arrives leaves its
// label pinned on the wire. A narration line says what is happening, with pause and replay.
import { gsap } from 'gsap';

const NS = 'http://www.w3.org/2000/svg';
let uid = 0;

export const ICON = {
  ok: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  no: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  skip: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8h8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  replay: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v2.8h2.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5v9M10.5 3.5v9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor"/></svg>',
};

// the bar above a flow: step counter, what is happening now, pause/resume and replay
export const barHTML = (total) => `<div class="gf-bar">
  <p class="gf-say" aria-live="polite"><b class="gf-n">0/${total}</b><span>Scroll down a little to start</span></p>
  <div class="gf-ctl">
    <div class="gf-speed" role="group" aria-label="Animation speed"><button class="gf-slower" type="button" aria-label="Slower">−</button><output class="gf-x" aria-live="polite">1.3×</output><button class="gf-faster" type="button" aria-label="Faster">+</button></div>
    <button class="gf-pause" type="button" aria-pressed="false">${ICON.pause}<span>Pause</span></button><button class="gf-replay" type="button">${ICON.replay}<span>Replay</span></button>
  </div>
</div>`;

export function kit(stage) {
  const svg = stage.querySelector('.gf-wires'), layer = stage.querySelector('.gf-chips');
  const id = `fk${++uid}`;
  const pins = new Map();
  const box = (el) => { const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(); return { l: r.left - s.left, r: r.right - s.left, t: r.top - s.top, b: r.bottom - s.top, cy: r.top - s.top + r.height / 2, cx: r.left - s.left + r.width / 2, w: r.width, h: r.height }; };
  const hcurve = (ax, ay, bx, by) => { const k = (bx - ax) * 0.5; return `M${ax} ${ay} C${ax + k} ${ay} ${bx - k} ${by} ${bx} ${by}`; };

  function clear() {
    const s = stage.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${s.width} ${s.height}`);
    svg.innerHTML = `<defs>${['out', 'back', 'bad'].map((k) => `<marker id="${id}-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1 9 5 1 9z" class="gf-ah ${k}"/></marker>`).join('')}</defs>`;
    layer.innerHTML = '';
    pins.clear();
  }
  // a wire; kind is 'out' (rose), 'back' (green) or 'bad'; dashed and faint until it is lit
  function wire(d, kind = 'out') {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d); p.setAttribute('class', `gf-w ${kind}`); p.dataset.kind = kind;
    svg.append(p);
    return p;
  }
  function light(t, p, at, dur = 0.8) {
    if (!p) return;
    const L = p.getTotalLength();
    t.call(() => { p.setAttribute('marker-end', `url(#${id}-${p.dataset.kind})`); p.classList.add('lit'); }, null, at);
    t.fromTo(p, { strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDashoffset: 0, duration: dur, ease: 'power2.out', immediateRender: false }, at);
  }
  // a label pinned on a wire, at a fraction of its length, nudged off the line
  function pin(p, key, text, { at = 0.5, dx = 0, dy = -12, kind = '' } = {}) {
    let el = pins.get(key);
    if (!el) {
      el = document.createElement('span'); el.className = 'gf-pin'; layer.append(el); pins.set(key, el);
      const pt = p.getPointAtLength(p.getTotalLength() * at);
      gsap.set(el, { x: pt.x + dx, y: pt.y + dy });
    }
    el.className = `gf-pin ${kind}`; el.textContent = text;
    gsap.fromTo(el, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' });
    return el;
  }
  // the chip rides the wire, then its label stays pinned there
  function ride(t, p, label, at, dur, { kind = '', pinKey, pinOpts } = {}) {
    if (!p) return;
    const c = document.createElement('span'); c.className = `gf-chip ${kind}`; c.textContent = label; layer.append(c);
    gsap.set(c, { autoAlpha: 0 });
    const L = p.getTotalLength(), o = { v: 0 };
    t.fromTo(o, { v: 0 }, { v: 1, duration: dur, ease: 'power1.inOut', immediateRender: false,
      onStart: () => gsap.set(c, { autoAlpha: 1, scale: 1 }),
      onUpdate: () => { const a = p.getPointAtLength(o.v * L); gsap.set(c, { x: a.x, y: a.y }); },
      onComplete: () => { gsap.to(c, { autoAlpha: 0, scale: 0.6, duration: 0.25 }); if (pinKey) pin(p, pinKey, label, { ...pinOpts, kind }); } }, at);
  }
  return { box, hcurve, clear, wire, light, ride, pin, pins };
}

// narration + controls; returns say(t, n, text, at)
export function narrator(stage, total) {
  const bar = stage.querySelector('.gf-bar');
  const n = bar.querySelector('.gf-n'), txt = bar.querySelector('.gf-say span');
  const set = (i, text) => { n.textContent = `${i}/${total}`; txt.textContent = text; gsap.fromTo(txt, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'expo.out' }); };
  return { say: (t, i, text, at) => t.call(() => set(i, text), null, at), set };
}

// speeds a visitor can step through; 1.3x by default, and the choice is remembered for the other flow
const SPEEDS = [0.5, 0.75, 1, 1.3, 1.6, 2, 2.5];
const DEFAULT_SPEED = 1.3;
const readSpeed = () => { try { const v = parseFloat(localStorage.getItem('flow-speed')); return SPEEDS.includes(v) ? v : DEFAULT_SPEED; } catch { return DEFAULT_SPEED; } };

export function controls(stage, getTl, onReplay) {
  const pause = stage.querySelector('.gf-pause'), replay = stage.querySelector('.gf-replay');
  const slower = stage.querySelector('.gf-slower'), faster = stage.querySelector('.gf-faster'), out = stage.querySelector('.gf-x');
  let speed = readSpeed();
  const label = (paused) => { pause.setAttribute('aria-pressed', String(paused)); pause.innerHTML = paused ? `${ICON.play}<span>Resume</span>` : `${ICON.pause}<span>Pause</span>`; };
  const showSpeed = () => {
    out.textContent = `${speed}×`;
    const i = SPEEDS.indexOf(speed);
    slower.disabled = i <= 0; faster.disabled = i >= SPEEDS.length - 1;
  };
  const setSpeed = (v) => {
    speed = v; showSpeed();
    try { localStorage.setItem('flow-speed', String(v)); } catch { /* private mode: just this page */ }
    getTl()?.timeScale(speed);
  };
  slower.addEventListener('click', () => { const i = SPEEDS.indexOf(speed); if (i > 0) setSpeed(SPEEDS[i - 1]); });
  faster.addEventListener('click', () => { const i = SPEEDS.indexOf(speed); if (i < SPEEDS.length - 1) setSpeed(SPEEDS[i + 1]); });
  pause.addEventListener('click', () => { const tl = getTl(); if (!tl) return; if (tl.paused()) { tl.play(); label(false); } else { tl.pause(); label(true); } });
  replay.addEventListener('click', () => { label(false); onReplay(); });
  showSpeed();
  // apply the current speed to a freshly built timeline
  return { reset: () => label(false), apply: (tl) => { speed = readSpeed(); showSpeed(); tl.timeScale(speed); } };
}
