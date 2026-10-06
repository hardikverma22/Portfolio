// mimo: the animated "how the whole loop fits together" diagram.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';
const COL = { act: '#6ea8ff', say: '#f5c451', ax: '#ff6b8a', agent: '#5fd4a0', author: '#c084fc' };

function onView(el, enter, leave, margin = '0px') {
  new IntersectionObserver(([e]) => (e.isIntersecting ? enter() : leave?.()), { rootMargin: margin }).observe(el);
}

function loop(reduced) {
  const root = $('#loop'), svg = $('#loop-wires');
  const el = (w) => $(`[data-w="${w}"]`, root);
  const box = (n) => { const r = n.getBoundingClientRect(), b = root.getBoundingClientRect(); return { l: r.left - b.left, r: r.right - b.left, t: r.top - b.top, b: r.bottom - b.top, cy: r.top - b.top + r.height / 2 }; };

  // One connector per hand-off, left to right. Nothing loops back.
  // dx staggers the vertical runs so connectors that share a gutter never cross.
  const WIRES = [
    { keys: ['act', 'in-act'], color: COL.act, dx: 0, from: () => { const a = box(el('act')), c = box($('.chip', el('act'))); return [a.r, c.cy]; }, to: () => [box(el('mimo')).l, box(el('in-act')).cy] },
    { keys: ['say', 'in-say'], color: COL.say, dx: -9, from: () => { const a = box(el('say')), c = box($('.chip', el('say'))); return [a.r, c.cy]; }, to: () => [box(el('mimo')).l, box(el('in-say')).cy] },
    { keys: ['ax', 'in-ax'], color: COL.ax, dx: 9, from: () => { const a = box(el('ax')), c = box($('.chip', el('ax'))); return [a.r, c.cy]; }, to: () => [box(el('mimo')).l, box(el('in-ax')).cy] },
    { keys: ['agent', 'author'], color: COL.agent, dx: 0, from: () => [box(el('agent')).r, box(el('agent')).cy], to: () => [box(el('author')).l, box(el('author')).t + 34] },
    { keys: ['skill', 'approve'], color: COL.author, dx: 0, from: () => [box(el('author')).r, box(el('skill')).cy], to: () => [box(el('approve')).l, box(el('approve')).t + 34] },
  ];
  let paths = [];

  const elbow = (x1, y1, x2, y2, dx) => {
    const xm = (x1 + x2) / 2 + dx, dy = y2 - y1, r = Math.min(10, Math.abs(dy) / 2);
    if (Math.abs(dy) < 3) return `M${x1},${y1} L${x2 - 9},${y2}`;
    const s = Math.sign(dy);
    return `M${x1},${y1} H${xm - r} Q${xm},${y1} ${xm},${y1 + s * r} V${y2 - s * r} Q${xm},${y2} ${xm + r},${y2} H${x2 - 9}`;
  };
  const mk = (tag, attrs) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); svg.append(n); return n; };

  const build = () => {
    svg.innerHTML = '';
    if (innerWidth < 960) { paths = []; return; }
    paths = WIRES.map((w) => {
      const [x1, y1] = w.from(), [x2, y2] = w.to();
      const line = mk('path', { d: elbow(x1, y1, x2, y2, w.dx), stroke: w.color, class: 'w' });
      mk('circle', { cx: x1, cy: y1, r: 2.6, fill: w.color, class: 'tip' });
      mk('path', { d: `M${x2},${y2} L${x2 - 10},${y2 - 5.5} L${x2 - 10},${y2 + 5.5} Z`, fill: w.color, class: 'tip' });
      const dot = mk('circle', { r: 3, fill: w.color, class: 'dot' });
      return { line, dot, len: line.getTotalLength(), keys: w.keys, tips: $$('.tip', svg).slice(-2) };
    });
    paths.forEach((p) => { p.on = false; });
    mark();
  };

  const mark = () => paths.forEach((p) => {
    const on = !!p.on;
    p.line.classList.toggle('on', on);
    p.tips.forEach((t) => t.classList.toggle('on', on));
    p.dot.classList.toggle('on', on && !reduced);
  });

  // a pulse travels along whichever connector is carrying data right now
  let raf = 0, visible = false;
  const t0 = performance.now();
  const animate = () => {
    raf = requestAnimationFrame(animate);
    if (!visible || reduced) return;
    const t = (performance.now() - t0) / 1000;
    paths.forEach((p) => {
      if (!p.on) return;
      const pt = p.line.getPointAtLength(((t * 0.45) % 1) * p.len);
      p.dot.setAttribute('cx', pt.x); p.dot.setAttribute('cy', pt.y);
    });
  };

  // the story, one beat at a time
  const beats = [
    { lit: ['act', 'in-act'], col: 0 },
    { lit: ['say', 'in-say'], col: 0 },
    { lit: ['ax', 'in-ax'], col: 0 },
    { lit: ['mimo', 'step'], col: 1 },
    { lit: ['agent'], col: 1 },
    { lit: ['author', 'skill'], col: 2 },
    { lit: ['approve'], col: 3 },
    { lit: ['lib'], col: 3 },
  ];
  const nodes = $$('.loop-rail b', root), fill = $('.loop-rail-fill', root);
  let beat = 0, cycle = 0;
  const step = () => {
    $$('.lit', root).forEach((n) => n.classList.remove('lit'));
    const b = beats[beat];
    b.lit.forEach((w) => el(w)?.classList.add('lit'));
    nodes.forEach((n, i) => n.classList.toggle('on', i <= b.col));
    gsap.to(fill, { width: `${(b.col / 3) * 100}%`, duration: 0.6, ease: 'power2.out' });
    // the connector that leaves a card lights while that card is the active one
    paths.forEach((p) => { p.on = b.lit.includes(p.keys[0]) || b.lit.includes(p.keys[1]) || (p.keys[0] === 'agent' && b.lit.includes('author')) ; });
    mark();
    beat = (beat + 1) % beats.length;
  };

  build();
  new ResizeObserver(() => build()).observe(root);
  animate();

  const reveal = () => {
    if (root.classList.contains('built')) return;
    if (reduced) { root.classList.add('built'); build(); step(); return; }
    const cols = $$('.loop-col', root);
    const tl = gsap.timeline({ onComplete: () => root.classList.add('built') });
    cols.forEach((c, i) => tl.to($$('.lc, .lc-arrow', c), { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.08 }, i * 0.35));
    tl.fromTo(svg, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.1);
  };
  ScrollTrigger.create({ trigger: root, start: 'top 70%', once: true, onEnter: reveal });
  onView(root, () => {
    visible = true;
    if (!cycle && !reduced) cycle = setInterval(step, 1100);
  }, () => { visible = false; clearInterval(cycle); cycle = 0; });
}

export function initMimo({ reduced }) {
  loop(reduced);
}
