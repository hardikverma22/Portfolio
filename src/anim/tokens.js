// tokenOs: a context window full of tokens is deduped, summarised and pruned while the counter falls.
// Beside it, each prompt is routed to the cheapest capable model, and every saving lands in a hash-chained ledger.
import { gsap, $, $$, type, count, autoplay, fmt } from './util.js';

const COUNTS = { u: 84, d: 150, v: 100, i: 86 };               // useful, duplicate, verbose, irrelevant
const KEEP = { d: 6, v: 14 };                                   // survivors: stubs and summaries
const STEPS = [['dedupe', 48210, 31400], ['summarise', 31400, 17900], ['route', 17900, 9640]];
const WHY = [
  '−150 duplicate blocks became 6 stubs: README.md ×12, tsconfig ×9, import React ×14',
  '−100 verbose blocks became 14 summaries: stack frames, health checks, debug logs',
  '−86 irrelevant blocks dropped: node_modules, lockfile hunks, CHANGELOG 2019',
];

const h32 = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };

// a fixed shuffle so the grid looks the same on every load
const shuffled = () => {
  const a = Object.entries(COUNTS).flatMap(([k, n]) => Array.from({ length: n }, () => k));
  let s = 7; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

const html = `
  <div class="cw">
    <section class="cw-win">
      <header>
        <div>
          <p class="cw-lab mono">context window, before the next model call</p>
          <div class="cw-count"><b data-n="count">48,210</b><span>tokens</span><em class="cw-pct mono">−80%</em></div>
        </div>
        <ul class="cw-pills mono" aria-hidden="true"><li>1 · dedupe</li><li>2 · summarise</li><li>3 · route</li><li>4 · explain</li></ul>
      </header>
      <div class="cw-bar"><i></i></div>
      <div class="cw-grid" aria-hidden="true"></div>
      <ul class="cw-legend mono"><li><i class="u"></i>useful</li><li><i class="d"></i>duplicate</li><li><i class="v"></i>verbose</li><li><i class="x"></i>irrelevant</li><li><i class="s"></i>kept as a summary</li></ul>
      <div class="cw-why mono">${WHY.map(() => '<p><em></em></p>').join('')}</div>
    </section>

    <aside class="cw-side">
      <section class="cw-route">
        <p class="cw-lab mono">each turn goes to the cheapest model that can do it</p>
        <div class="cw-lanes">
          <span class="cw-hub"><b>◇</b></span>
          ${[['Haiku', 'lookups', 'where is the auth file?'], ['Sonnet', 'everyday dev work', 'add a request handler'], ['Opus', 'refactor · debug · plan', 'refactor this service']].map(([m, w, p], i) => `
          <div class="cw-lane" data-m="${i}"><span class="cw-ln mono"><b>${m}</b><small>${w}</small></span><i></i><b class="cw-prompt mono">${p}</b></div>`).join('')}
        </div>
        <div class="cw-cost mono">
          <div><span>one premium model, every turn</span><i class="cw-c0"></i></div>
          <div><span>routed per turn</span><i class="cw-c1"></i><b>−73%</b></div>
        </div>
      </section>
      <section class="cw-ledger">
        <p class="cw-lab mono">every saving is a receipt</p>
        <div class="cw-chain mono">
          ${STEPS.map(([n, a, b], i) => `<div class="cw-blk"><span>#${i + 1} ${n}</span><b>−${fmt(a - b)}</b><code data-h="${i}"></code></div>`).join('')}
        </div>
        <p class="cw-ok mono">✓ chain verified, every hash links to the one before</p>
      </section>
    </aside>
  </div>`;

export function mountTokens(root, reduced) {
  root.innerHTML = html;
  const st = $('.cw', root), grid = $('.cw-grid', st);
  const kinds = shuffled();
  const cells = kinds.map((k) => { const c = document.createElement('i'); c.className = `c c-${k}`; c.dataset.k = k; grid.append(c); return c; });
  const by = (k) => cells.filter((c) => c.dataset.k === k);
  const dups = by('d'), verb = by('v'), irr = by('i');
  const keepD = dups.slice(0, KEEP.d), dropD = dups.slice(KEEP.d);
  const keepV = verb.slice(0, KEEP.v), dropV = verb.slice(KEEP.v);
  const hashes = (() => { let prev = '000000'; return STEPS.map(([n, a, b]) => { const h = h32(`${prev}|${n}|${a}|${b}`).slice(0, 6); const r = { prev, h }; prev = h; return r; }); })();

  const make = () => {
    const tl = gsap.timeline();
    const reset = () => {
      gsap.set(cells, { clearProps: 'width,marginRight,marginBottom,opacity,scale,y,backgroundColor,boxShadow' });
      $('[data-n="count"]', st).textContent = fmt(48210);
      $$('.cw-why em', st).forEach((e) => { e.textContent = ''; });
      $$('.cw-blk code', st).forEach((c, i) => { c.textContent = `${hashes[i].prev} → ${hashes[i].h}`; });
    };
    tl.resetFn = reset; reset();
    const bar = $('.cw-bar i', st);
    const setBar = (v) => { bar.style.width = `${(v / 48210) * 100}%`; };

    // ---------- the window fills ----------
    tl.fromTo('.cw-win, .cw-side > *', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'expo.out' }, 0);
    tl.fromTo(cells, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.3, stagger: { each: 0.0028, from: 'random' }, ease: 'back.out(2)' }, 0.4);
    count(tl, $('[data-n="count"]', st), 0, 48210, 0.4, 1.4);
    const B0 = { v: 0 }; tl.fromTo(B0, { v: 0 }, { v: 48210, duration: 1.4, ease: 'power2.out', onUpdate: () => setBar(B0.v) }, 0.4);

    // ---------- the three passes ----------
    const pills = $$('.cw-pills li', st);
    const pill = (i, at) => {
      tl.to(pills, { backgroundColor: 'rgba(232,236,242,.05)', color: '#9aa3b2', duration: 0.2 }, at);
      tl.to(pills[i], { backgroundColor: '#e8ecf2', color: '#0b0d12', duration: 0.25 }, at);
    };
    const num = (a, b, at, dur) => {
      count(tl, $('[data-n="count"]', st), a, b, at, dur, fmt, 'power2.inOut');
      const o = { v: a }; tl.fromTo(o, { v: a }, { v: b, duration: dur, ease: 'power2.inOut', onUpdate: () => setBar(o.v) }, at);
    };
    const flashAll = (arr, color, at) => tl.fromTo(arr, { boxShadow: '0 0 0 0 transparent' }, { boxShadow: `0 0 0 2px ${color}, 0 0 14px ${color}`, duration: 0.25, yoyo: true, repeat: 3, stagger: { each: 0.004, from: 'random' }, immediateRender: false }, at);
    const collapse = (arr, at, dur) => tl.to(arr, { width: 0, marginRight: 0, opacity: 0, scale: 0, duration: dur, stagger: { each: 0.006, from: 'random' }, ease: 'power2.inOut' }, at);

    // 1 dedupe
    pill(0, 1.9);
    flashAll(dups, '#f5c451', 2.0);
    collapse(dropD, 3.0, 0.8);
    tl.to(keepD, { backgroundColor: 'rgba(245,196,81,.32)', duration: 0.4 }, 3.0);
    num(48210, 31400, 3.0, 1.2);
    // 2 summarise
    pill(1, 4.6);
    flashAll(verb, '#a78bfa', 4.7);
    collapse(dropV, 5.7, 0.8);
    tl.to(keepV, { backgroundColor: '#5fd4a0', duration: 0.5 }, 5.7);
    num(31400, 17900, 5.7, 1.2);
    // 3 route
    pill(2, 7.3);
    flashAll(irr, '#ff6b8a', 7.4);
    tl.to(irr, { y: 26, width: 0, marginRight: 0, opacity: 0, scale: 0.4, duration: 0.8, stagger: { each: 0.007, from: 'random' }, ease: 'power2.in' }, 8.4);
    num(17900, 9640, 8.4, 1.2);
    tl.fromTo('.cw-pct', { opacity: 0, scale: 0.6, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(2.4)' }, 9.4);
    tl.to(cells.filter((c) => !irr.includes(c) && !dropD.includes(c) && !dropV.includes(c)), { boxShadow: '0 0 12px rgba(127,178,255,.5)', duration: 0.4, yoyo: true, repeat: 1 }, 9.5);

    // 4 explain
    pill(3, 10.2);
    $$('.cw-why p', st).forEach((p, i) => {
      tl.fromTo(p, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3 }, 10.3 + i * 1.1);
      type(tl, $('em', p), WHY[i], 10.3 + i * 1.1, 1.0);
    });

    // ---------- receipts: each pass lands in the ledger ----------
    const blks = $$('.cw-blk', st);
    [3.9, 6.9, 9.6].forEach((t, i) => tl.fromTo(blks[i], { opacity: 0, x: -14, scale: 0.94 }, { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: 'back.out(2)' }, t));
    tl.fromTo('.cw-ok', { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 }, 11.4);

    // ---------- routing ----------
    const lanes = $$('.cw-lane', st);
    const hub = $('.cw-hub', st);
    tl.fromTo(hub, { scale: 0.7 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, 2.0);
    [[0, 4.4], [1, 6.0], [2, 7.6]].forEach(([i, at]) => {
      const l = lanes[i], p = $('.cw-prompt', l), line = $('i', l);
      tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.inOut', transformOrigin: 'left' }, at);
      tl.fromTo(p, { opacity: 0, left: '0%', xPercent: 0 }, { opacity: 1, duration: 0.2 }, at);
      tl.to(p, { left: '100%', xPercent: -100, duration: 1.2, ease: 'power2.inOut' }, at + 0.1);
      tl.fromTo(l, { '--hot': 0 }, { '--hot': 1, duration: 0.3, immediateRender: false }, at + 1.2);
      tl.to(p, { opacity: 0, duration: 0.3 }, at + 2.1);
      tl.to(l, { '--hot': 0, duration: 0.4 }, at + 2.2);
    });
    tl.fromTo('.cw-c0', { scaleX: 0 }, { scaleX: 1, duration: 0.8, transformOrigin: 'left', ease: 'power2.out' }, 10.2);
    tl.fromTo('.cw-c1', { scaleX: 0 }, { scaleX: 0.27, duration: 1.0, transformOrigin: 'left', ease: 'power2.out' }, 10.6);
    tl.fromTo('.cw-cost b', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 11.4);
    return tl;
  };

  autoplay(root, make, reduced);
}
