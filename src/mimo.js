// mimo: the animated "how the whole loop fits together" diagram.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';
const COL = { act: '#6ea8ff', say: '#f5c451', ax: '#ff6b8a', mm: '#a78bfa', agent: '#5fd4a0', author: '#c084fc', ok: '#6ad19a', lib: '#5eead4' };

/* ---------- when an element is on screen ---------- */
function onView(el, enter, leave, margin = '0px') {
  new IntersectionObserver(([e]) => (e.isIntersecting ? enter() : leave?.()), { rootMargin: margin }).observe(el);
}

/* ---------- the loop ---------- */
function loop(reduced) {
  const root = $('#loop'), svg = $('#loop-wires');
  const el = (w) => $(`[data-w="${w}"]`, root);
  // wires: [from, to, colour, kind]
  const WIRES = [
    ['act', 'in-act', COL.act], ['say', 'in-say', COL.say], ['ax', 'in-ax', COL.ax],
    ['agent', 'author', COL.agent, 'bundle'],
    ['skill', 'approve', COL.author, 'draft'],
    ['lib', 'act', COL.lib, 'return'],
  ];
  let paths = [];

  const anchor = (node, side) => {
    const r = node.getBoundingClientRect(), b = root.getBoundingClientRect();
    const x = side === 'l' ? r.left - b.left : side === 'r' ? r.right - b.left : r.left - b.left + r.width / 2;
    const y = side === 'b' ? r.bottom - b.top : side === 't' ? r.top - b.top : r.top - b.top + r.height / 2;
    return [x, y];
  };
  const build = () => {
    svg.innerHTML = `<defs><filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
    if (innerWidth < 960) { paths = []; return; }
    paths = WIRES.map(([a, b, color, kind]) => {
      const A = el(a), B = el(b);
      let d;
      if (kind === 'return') {
        const [x1, y1] = anchor(A, 'b');
        const [x2, y2] = anchor(B, 'l');
        const yb = root.clientHeight - 14, xl = 8;
        d = `M${x1},${y1} L${x1},${yb - 10} Q${x1},${yb} ${x1 - 10},${yb} L${xl + 10},${yb} Q${xl},${yb} ${xl},${yb - 10} L${xl},${y2 + 10} Q${xl},${y2} ${xl + 10},${y2} L${x2},${y2}`;
      } else {
        const [x1, y1] = anchor(A, 'r');
        const [x2, y2] = anchor(B, 'l');
        const mx = (x1 + x2) / 2;
        d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
      }
      const base = document.createElementNS(NS, 'path');
      base.setAttribute('d', d); base.setAttribute('stroke', color); base.setAttribute('opacity', '.28');
      const flow = document.createElementNS(NS, 'path');
      flow.setAttribute('d', d); flow.setAttribute('stroke', color); flow.setAttribute('class', 'dash');
      svg.append(base, flow);
      const dots = [0, 0.33, 0.66].map((o) => {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('r', '3'); c.setAttribute('fill', color); c.setAttribute('filter', 'url(#glow)');
        svg.append(c);
        return { c, o };
      });
      const len = flow.getTotalLength();
      if (!root.classList.contains('built')) { [base, flow].forEach((p) => { p.style.strokeDasharray = `${len}`; p.style.strokeDashoffset = `${len}`; }); dots.forEach((d0) => (d0.c.style.opacity = 0)); }
      return { base, flow, dots, len, kind };
    });
  };

  // particles travel along every wire
  let raf = 0, visible = false, t0 = performance.now();
  const animate = () => {
    raf = requestAnimationFrame(animate);
    if (!visible || !root.classList.contains('built')) return;
    const t = (performance.now() - t0) / 1000;
    paths.forEach(({ flow, dots, len, kind }) => {
      const speed = kind === 'return' ? 0.12 : 0.35;
      dots.forEach(({ c, o }) => {
        const p = flow.getPointAtLength(((t * speed + o) % 1) * len);
        c.setAttribute('cx', p.x); c.setAttribute('cy', p.y);
      });
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
    tl.add(() => {
      paths.forEach((p, i) => {
        gsap.to([p.base, p.flow], { strokeDashoffset: 0, duration: 0.9, delay: i * 0.12, ease: 'power2.inOut', onComplete: () => { p.flow.style.strokeDasharray = ''; p.flow.style.strokeDashoffset = ''; } });
        gsap.to(p.dots.map((d) => d.c), { opacity: 1, duration: 0.4, delay: 0.6 + i * 0.12 });
      });
    }, 0.6);
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
