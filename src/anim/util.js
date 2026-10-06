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
export const motionOn = () => !document.documentElement.classList.contains('motion-off');

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
export const isFast = () => !motionOn() || (performance.now() - _last.t < 160 && _v > 1600);

// Each stage opens on its finished, fully readable frame. The intro plays once as it scrolls in (if intros are on),
// with a control to skip or replay it. After that, an optional ambient loop keeps the finished frame alive
// (pulses along connectors, traffic, glows) while the stage is on screen. `make` builds the paused intro timeline;
// `ambient(tl)` builds a paused, endlessly repeating one.
export function autoplay(root, make, reduced, { ambient = null } = {}) {
  let tl = null, amb = null, rt = 0, state = 'done', inView = false, seen = false;
  const holder = root.parentElement && root.parentElement.classList.contains('anim-wrap') ? root.parentElement : root;
  let ctl = null;
  if (!reduced) {
    ctl = document.createElement('button');
    ctl.type = 'button'; ctl.className = 'anim-ctl mono';
    holder.append(ctl);
  }
  const label = () => {
    if (!ctl) return;
    ctl.hidden = !motionOn() || state === 'idle';
    const playing = state === 'playing';
    ctl.textContent = playing ? 'skip to result ›' : '↻ replay';
    ctl.setAttribute('aria-label', playing ? 'Skip to the result' : 'Replay the animation');
  };
  const sync = () => { if (amb) (inView && state === 'done' ? amb.play() : amb.pause()); };
  const finish = () => { if (!tl) return; tl.progress(1).pause(); state = 'done'; label(); sync(); };
  const start = () => { if (!tl) return; amb?.pause(); tl.resetFn?.(); tl.restart(); state = 'playing'; label(); };
  const build = () => {
    tl?.kill(); amb?.kill();
    tl = make();
    tl.repeat(0).pause(0);
    tl.eventCallback('onComplete', () => { state = 'done'; label(); sync(); });
    // before the first play the stage waits on its empty first frame, so it never flashes finished and then restarts
    const hold = !reduced && !seen && motionOn();
    tl.progress(hold ? 0 : 1);
    amb = ambient ? ambient(tl) : null;
    state = hold ? 'idle' : 'done'; label(); sync();
  };
  build();
  ScrollTrigger.create({ trigger: root, start: 'top 90%', end: 'bottom 5%', onToggle: (st) => { inView = st.isActive; sync(); } });
  if (!reduced) {
    addEventListener('motionchange', (e) => { ctl.hidden = !e.detail; if (!e.detail && state !== 'done') { seen = true; finish(); } });
    ctl.hidden = !motionOn() || state === 'idle';
    ctl.addEventListener('click', () => (state === 'playing' ? finish() : start()));
    ScrollTrigger.create({
      trigger: root, start: 'top 75%', end: 'bottom 5%',
      onEnter: () => { if (!seen) { seen = true; isFast() ? finish() : start(); } },
      onLeave: () => { if (state !== 'done') { seen = true; finish(); } },
      onLeaveBack: () => { if (state === 'playing') finish(); },
      onRefresh: (st) => { if (!seen && st.progress === 1) { seen = true; finish(); } },
    });
  }
  let lastW = root.clientWidth;
  new ResizeObserver(() => {
    if (Math.abs(root.clientWidth - lastW) < 3) return;
    lastW = root.clientWidth;
    clearTimeout(rt); rt = setTimeout(build, 200);
  }).observe(root);
  addEventListener('load', build);
  if (import.meta.env.DEV) (window.__anim ||= {})[root.id] = { get tl() { return tl; }, get amb() { return amb; }, finish, start };
  return () => tl;
}
// point of an element relative to a root, from one of its sides
export function pt(root, el, side = 'c') {
  const r = el.getBoundingClientRect(), b = root.getBoundingClientRect();
  const x = side === 'l' ? r.left : side === 'r' ? r.right : r.left + r.width / 2;
  const y = side === 't' ? r.top : side === 'b' ? r.bottom : r.top + r.height / 2;
  return [x - b.left, y - b.top];
}
// like pt, but from layout offsets, so animation transforms (a card sliding in) never skew the result
export function ptL(root, el, side = 'c') {
  let x = 0, y = 0, n = el;
  while (n && n !== root) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
  if (n !== root) return pt(root, el, side);
  const w = el.offsetWidth, h = el.offsetHeight;
  return [x + (side === 'r' ? w : side === 'l' ? 0 : w / 2), y + (side === 't' ? 0 : side === 'b' ? h : h / 2)];
}
export const curve = ([x1, y1], [x2, y2], k = 0.5) => { const mx = x1 + (x2 - x1) * k; return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`; };
export { gsap };
