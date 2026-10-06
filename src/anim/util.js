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
// plays while the stage is on screen, pauses when it leaves. `make` builds a paused, looping timeline.
export function autoplay(root, make, reduced) {
  let tl = null, rt = 0, playing = false;
  const build = () => {
    tl?.kill();
    tl = make();
    tl.repeat(-1).repeatDelay(2.8).eventCallback('onRepeat', () => tl.resetFn?.());
    tl.pause(0);
    if (reduced) { tl.pause().progress(1); return; }
    if (playing) tl.play();
  };
  build();
  if (!reduced) {
    ScrollTrigger.create({
      trigger: root, start: 'top 85%', end: 'bottom 5%',
      onEnter: () => { playing = true; tl.play(); }, onEnterBack: () => { playing = true; tl.play(); },
      onLeave: () => { playing = false; tl.pause(); }, onLeaveBack: () => { playing = false; tl.pause(); },
    });
    let lastW = root.clientWidth;
    new ResizeObserver(() => {
      if (Math.abs(root.clientWidth - lastW) < 3) return;
      lastW = root.clientWidth;
      clearTimeout(rt); rt = setTimeout(build, 200);
    }).observe(root);
    addEventListener('load', () => build());
  }
  if (import.meta.env.DEV) (window.__anim ||= {})[root.id] = { get tl() { return tl; } };
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
