import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const fmt = (n) => Math.round(n).toLocaleString('en-US');

// types text into an element over `dur` seconds
export function type(tl, el, text, at, dur) {
  const o = { n: 0 };
  tl.fromTo(o, { n: 0 }, { n: text.length, duration: dur, ease: 'none', onUpdate: () => { el.textContent = text.slice(0, Math.round(o.n)); } }, at);
}
// counts a number from a to b
export function count(tl, el, a, b, at, dur, f = fmt, ease = 'power2.out') {
  const o = { v: a };
  tl.fromTo(o, { v: a }, { v: b, duration: dur, ease, onUpdate: () => { el.textContent = f(o.v); } }, at);
}
// moves a dot along an svg path
export function travel(tl, dot, path, at, dur, ease = 'power1.inOut') {
  const len = path.getTotalLength(), o = { p: 0 };
  tl.fromTo(o, { p: 0 }, { p: 1, duration: dur, ease, onUpdate: () => { const pt = path.getPointAtLength(o.p * len); dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); } }, at);
  tl.fromTo(dot, { opacity: 0 }, { opacity: 1, duration: 0.12 }, at);
  tl.to(dot, { opacity: 0, duration: 0.15 }, at + dur - 0.15);
}
// draws a path in
export function draw(tl, path, at, dur, ease = 'power2.inOut') {
  const len = path.getTotalLength();
  tl.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: dur, ease }, at);
}
// true while the visitor is scrolling fast: they want the result, not the show
let _last = { y: 0, t: 0 }, _v = 0;
if (typeof window !== 'undefined') {
  _last = { y: scrollY, t: performance.now() };
  addEventListener('scroll', () => {
    const now = performance.now(), dt = now - _last.t;
    if (dt > 0) _v = _v * 0.6 + (Math.abs(scrollY - _last.y) / dt) * 1000 * 0.4;
    _last = { y: scrollY, t: now };
  }, { passive: true });
}
export const isFast = () => performance.now() - _last.t < 160 && _v > 1600;

// Each stage opens on its finished, fully readable frame. It plays once as it scrolls in, never loops,
// and a small control lets the visitor skip to the result or replay it. `make` builds a paused timeline.
export function autoplay(root, make, reduced, { speed = 1 } = {}) {
  let tl = null, rt = 0, state = 'done';
  const holder = root.parentElement && root.parentElement.classList.contains('anim-wrap') ? root.parentElement : root;
  let ctl = null;
  if (!reduced) {
    ctl = document.createElement('button');
    ctl.type = 'button'; ctl.className = 'anim-ctl mono';
    holder.append(ctl);
  }
  const label = () => {
    if (!ctl) return;
    const playing = state === 'playing';
    ctl.textContent = playing ? 'skip to result ›' : '↻ replay';
    ctl.setAttribute('aria-label', playing ? 'Skip to the result' : 'Replay the animation');
  };
  const finish = () => { if (!tl) return; tl.progress(1).pause(); state = 'done'; label(); };
  const start = () => {
    if (!tl) return;
    tl.resetFn?.(); tl.timeScale(speed).restart(); state = 'playing'; label();
  };
  const build = () => {
    tl?.kill();
    tl = make();
    tl.repeat(0).pause(0);
    tl.eventCallback('onComplete', () => { state = 'done'; label(); });
    tl.progress(1);
    state = 'done'; label();
  };
  build();
  if (!reduced) {
    ctl.addEventListener('click', () => (state === 'playing' ? finish() : start()));
    ScrollTrigger.create({
      trigger: root, start: 'top 75%', end: 'bottom 5%', once: false,
      onEnter: () => { if (!tl.__seen) { tl.__seen = true; isFast() ? finish() : start(); } },
      onLeave: () => { if (state === 'playing') finish(); },
      onLeaveBack: () => { if (state === 'playing') finish(); },
    });
    let lastW = root.clientWidth;
    new ResizeObserver(() => {
      if (Math.abs(root.clientWidth - lastW) < 3) return;
      lastW = root.clientWidth;
      clearTimeout(rt); rt = setTimeout(() => { const seen = tl.__seen; build(); tl.__seen = seen; }, 200);
    }).observe(root);
    addEventListener('load', () => { const seen = tl.__seen; build(); tl.__seen = seen; });
  }
  if (import.meta.env.DEV) (window.__anim ||= {})[root.id] = { get tl() { return tl; }, finish, start };
  return () => tl;
}
// point of an element relative to a root, from one of its sides
export function pt(root, el, side = 'c') {
  const r = el.getBoundingClientRect(), b = root.getBoundingClientRect();
  const x = side === 'l' ? r.left : side === 'r' ? r.right : r.left + r.width / 2;
  const y = side === 't' ? r.top : side === 'b' ? r.bottom : r.top + r.height / 2;
  return [x - b.left, y - b.top];
}
export const curve = ([x1, y1], [x2, y2], k = 0.5) => { const mx = x1 + (x2 - x1) * k; return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`; };
export { gsap };
