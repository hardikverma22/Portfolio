// Delegated access: you set limits, two tokens are forged into one scoped token, and every request the agent
// makes travels a track through five checkpoints. Some pass, some are stopped, one waits for a human,
// and a single switch cuts the agent off.
import { gsap, $, $$, type, count, autoplay, draw, travel, ptL } from './util.js';

const LOCK = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const BOT = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 8V5M9.5 13.5h.01M14.5 13.5h.01M2.5 12.5v3M21.5 12.5v3"/><circle cx="12" cy="4" r="1"/></svg>';
const LAYERS = ['agent identity', 'user consent', 'token exchange', 'tool scope', 'payload rules'];
const BARS = [36, 47, 58, 69, 80];
const START = 17, END = 95;

const html = `
  <div class="dg">
    <div class="dg-a">
      <svg class="dg-wires" aria-hidden="true"></svg>
      <section class="dg-you">
        <p class="dg-lab mono">you set the limits</p>
        <div class="dg-cap"><span>spend cap</span><b class="mono" data-n="cap">$0</b></div>
        <div class="dg-slider"><i></i><u></u></div>
        <div class="dg-chips mono"><span data-k="Electronics">Electronics</span><span data-k="Alcohol">Alcohol</span><span data-k="Gift cards">Gift cards</span><span data-k="Groceries">Groceries</span></div>
        <ul class="dg-tools mono">
          <li><span>search_products</span><em class="tg"></em></li>
          <li><span>add_to_cart</span><em class="tg"></em></li>
          <li><span>place_order</span><small>needs approval</small><em class="tg"></em></li>
        </ul>
        <div class="dg-access"><span>agent access</span><em class="tg tg-main"></em></div>
      </section>

      <section class="dg-forge">
        <p class="dg-lab mono">RFC 8693 token exchange</p>
        <div class="dg-fz">
          <p class="dg-fcap mono">Two tokens go in. One scoped token comes out.</p>
          <div class="dg-vault"><span>${LOCK}</span><div><b>your credential</b><small>never leaves the vault</small></div></div>
          <b class="tk tk-sub mono">subject · you</b>
          <b class="tk tk-act mono">actor · the agent</b>
          <div class="tk tk-del"><b>delegated token</b><span class="mono">scoped · revocable</span></div>
        </div>
      </section>

      <section class="dg-agent">
        <p class="dg-lab mono">the agent</p>
        <div class="dg-node" data-n="agent">
          <header>
            <span class="dg-ic" aria-hidden="true">${BOT}</span>
            <div><b>Shopping agent</b><small class="mono">acts on your behalf</small></div>
            <span class="dg-status mono" data-s="idle"><i></i><em>no token</em></span>
          </header>
          <div class="dg-slot"><span class="mono">waiting for a delegated token</span><div class="tk tk-held"><b>delegated token</b><span class="mono">scoped · revocable</span></div></div>
          <p class="dg-note mono"></p>
        </div>
      </section>
    </div>

    <div class="dg-b">
      <section class="dg-track">
        <p class="dg-lab mono">a gateway checks every request</p>
        <div class="dg-lane">
          <span class="dg-line"></span>
          ${BARS.map((p, i) => `<i class="dg-bar" style="left:${p}%"></i><em class="dg-bl mono" data-n="${i + 1}" style="left:${p}%">${LAYERS[i]}</em>`).join('')}
          <b class="dg-pk mono" data-p="1">search_products</b>
          <b class="dg-pk mono" data-p="2">add_to_cart · $24</b>
          <b class="dg-pk mono" data-p="3">add_to_cart · $180</b>
          <b class="dg-pk mono" data-p="4">add_to_cart · $100</b>
          <b class="dg-pk mono" data-p="5">place_order · $24</b>
          <b class="dg-pk mono" data-p="6">search_products</b>
          <b class="dg-pk mono" data-p="7">search_products</b>
          <b class="dg-pk dg-amb mono" data-amb="1">search_products</b>
          <b class="dg-pk dg-amb mono" data-amb="2">add_to_cart · $24</b>
          <b class="dg-pk dg-amb mono" data-amb="3">add_to_cart · $180</b>
          <span class="dg-why mono" data-w="3" style="left:80%">over the $150 cap</span>
          <span class="dg-why mono" data-w="4" style="left:80%">blocked category</span>
          <span class="dg-why hold mono" data-w="5" style="left:69%">needs approval</span>
          <span class="dg-why mono" data-w="6" style="left:58%">401 · token revoked</span>
          <b class="dg-approve mono" style="left:69%">Approve</b>
        </div>
        <ul class="dg-log mono">
      <li data-l="1"><i class="y">✓</i><span>search_products</span><em>allowed</em></li>
      <li data-l="2"><i class="y">✓</i><span>add_to_cart · water bottle · $24</span><em>allowed</em></li>
      <li data-l="3"><i class="n">✕</i><span>add_to_cart · headphones · $180</span><em>stopped at payload rules: over the $150 cap</em></li>
      <li data-l="4"><i class="n">✕</i><span>add_to_cart · gift card · $100</span><em>stopped at payload rules: blocked category</em></li>
      <li data-l="5"><i class="h">⏸</i><span>place_order · $24</span><em class="e5">held at tool scope: needs approval</em></li>
      <li data-l="6"><i class="n">✕</i><span>search_products</span><em>stopped at token exchange: 401, token revoked</em></li>
      <li data-l="7"><i class="y">✓</i><span>search_products</span><em>allowed again after you re-grant access</em></li>
        </ul>
      </section>
      <section class="dg-store">
        <p class="dg-lab mono">tools</p>
        <ul class="mono"><li data-s="1"><i></i>search_products</li><li data-s="2"><i></i>add_to_cart</li><li data-s="3"><i></i>place_order</li></ul>
        <div class="dg-cart"><span>cart</span><div class="dg-item mono">water bottle · $24</div><b class="mono">$<em data-n="total">0</em></b><div class="dg-placed mono">order placed ✓</div></div>
      </section>
    </div>

  </div>`;

export function mountDelegate(root, reduced, ambientOn = true) {
  root.innerHTML = html;
  const st = $('.dg', root);
  const bars = $$('.dg-bar', st);
  const pk = (n) => $(`[data-p="${n}"]`, st);
  const why = (n) => $(`[data-w="${n}"]`, st);
  const log = (n) => $(`[data-l="${n}"]`, st);
  const store = (n) => $(`[data-s="${n}"]`, st);

  const make = () => {
    const tl = gsap.timeline();
    const edgeEl = $('.dg-wires', st);
    edgeEl.innerHTML = '';
    let edge = null;
    if (innerWidth >= 960) {
      const s = $('.dg-a', st), [x1, y1] = ptL(s, $('.dg-you', st), 'r'), [x2, y2] = ptL(s, $('.dg-node', st), 'l');
      edge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const mx = (x1 + x2) / 2;
      edge.setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
      edge.setAttribute('class', 'dg-edge');
      edgeEl.append(edge);
    }
    tl.edge = edge;
    const setStatus = (s, txt, at) => tl.call(() => { const el = $('.dg-status', st); el.dataset.s = s; $('em', el).textContent = txt; }, null, at);
    const reset = () => {
      const sEl = $('.dg-status', st); sEl.dataset.s = 'idle'; $('em', sEl).textContent = 'no token';
      $('[data-n="cap"]', st).textContent = '$0'; $('[data-n="total"]', st).textContent = '0';
      $('.e5', st).textContent = 'held at tool scope: needs approval';
      $('.dg-note', st).textContent = '';
    };
    tl.resetFn = reset; reset();

    const flash = (bar, at, c) => {
      tl.fromTo(bar, { backgroundColor: 'rgba(232,236,242,.2)', boxShadow: '0 0 0 transparent', scaleY: 1 }, { backgroundColor: c, boxShadow: `0 0 22px ${c}`, scaleY: 1.3, duration: 0.1, immediateRender: false }, at);
      tl.to(bar, { backgroundColor: 'rgba(232,236,242,.2)', boxShadow: '0 0 0 transparent', scaleY: 1, duration: 0.55 }, at + 0.1);
    };
    // slides a packet through the first n checkpoints, flashing each green. Returns when it reaches the last one.
    const through = (p, S, n) => {
      tl.fromTo(p, { left: `${START}%`, opacity: 0, scale: 0.9, borderColor: '#6ea8ff', boxShadow: '0 0 18px -4px #6ea8ff' }, { opacity: 1, scale: 1, duration: 0.18 }, S);
      let t = S + 0.18, prev = START;
      for (let i = 0; i < n; i++) {
        tl.fromTo(p, { left: `${prev}%` }, { left: `${BARS[i]}%`, duration: 0.26, ease: 'none', immediateRender: false }, t);
        t += 0.26; prev = BARS[i];
        flash(bars[i], t, '#6ad19a');
      }
      return { t, prev };
    };
    const finish = (p, { t, prev }, store_) => {
      tl.fromTo(p, { left: `${prev}%` }, { left: `${END - 6}%`, duration: 0.45, ease: 'power1.out', immediateRender: false }, t);
      tl.fromTo(store(store_), { backgroundColor: 'rgba(95,212,160,0)' }, { backgroundColor: 'rgba(95,212,160,.28)', duration: 0.2, yoyo: true, repeat: 1, immediateRender: false }, t + 0.35);
      tl.to(p, { opacity: 0, duration: 0.25 }, t + 0.6);
      return t + 0.6;
    };
    const stopAt = (p, { t }, i, color, n, whyN) => {
      flash(bars[i], t, color);
      tl.to(p, { borderColor: color, boxShadow: `0 0 22px -2px ${color}`, x: 4, duration: 0.06, yoyo: true, repeat: 5 }, t);
      tl.fromTo(why(whyN), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(2)' }, t + 0.1);
      tl.fromTo(log(n), { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power3.out' }, t + 0.2);
    };
    const bounce = (p, at, whyN) => {
      tl.to(p, { left: `${START}%`, opacity: 0, duration: 0.5, ease: 'power2.in' }, at);
      tl.to(why(whyN), { opacity: 0, duration: 0.3 }, at + 0.1);
    };

    // ---------- the stage ----------
    tl.fromTo('.dg-a > *, .dg-b > *', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'expo.out' }, 0);
    tl.set([...$$('.dg-pk', st), ...$$('.dg-why', st), $('.dg-approve', st)], { xPercent: -50, yPercent: -50, opacity: 0 }, 0);
    tl.set($$('.dg-log li', st), { opacity: 0 }, 0);

    // ---------- 1. you set the limits ----------
    const SL = $('.dg-slider', st);
    tl.fromTo($('i', SL), { scaleX: 0 }, { scaleX: 0.5, duration: 1.3, ease: 'power2.inOut', transformOrigin: 'left' }, 0.5);
    tl.fromTo($('u', SL), { left: '0%' }, { left: '50%', duration: 1.3, ease: 'power2.inOut' }, 0.5);
    count(tl, $('[data-n="cap"]', st), 0, 150, 0.5, 1.3, (v) => `$${Math.round(v)}`, 'power2.inOut');
    ['Alcohol', 'Gift cards'].forEach((k, i) => tl.fromTo($(`[data-k="${k}"]`, st), { opacity: 1, textDecoration: 'none' }, { opacity: 0.45, textDecoration: 'line-through', duration: 0.25, immediateRender: false }, 1.9 + i * 0.25));
    $$('.dg-tools .tg', st).forEach((g, i) => tl.fromTo(g, { '--on': 0 }, { '--on': 1, duration: 0.3, immediateRender: false }, 2.4 + i * 0.25));
    tl.fromTo($('.tg-main', st), { '--on': 0 }, { '--on': 1, duration: 0.3, immediateRender: false }, 3.0);

    // ---------- 2. the exchange ----------
    if (edge) { draw(tl, edge, 2.8, 0.9); }
    tl.fromTo($('.dg-vault', st), { opacity: 0.5, y: 6 }, { opacity: 1, y: 0, duration: 0.5 }, 1.0);
    tl.fromTo('.tk-sub', { opacity: 0, left: '0%', top: '30%', xPercent: 0, yPercent: -50, scale: 1 }, { opacity: 1, duration: 0.4 }, 3.1);
    tl.fromTo('.tk-act', { opacity: 0, left: '0%', top: '66%', xPercent: 0, yPercent: -50, scale: 1 }, { opacity: 1, duration: 0.4 }, 3.3);
    tl.to('.tk-sub', { left: '50%', top: '48%', xPercent: -50, scale: 0.7, duration: 0.8, ease: 'power3.inOut' }, 3.9);
    tl.to('.tk-act', { left: '50%', top: '48%', xPercent: -50, scale: 0.7, duration: 0.8, ease: 'power3.inOut' }, 3.9);
    tl.fromTo('.tk-del', { boxShadow: '0 0 0 0 rgba(192,132,252,.0)' }, { boxShadow: '0 0 36px -4px rgba(192,132,252,.9)', duration: 0.5, yoyo: true, repeat: 1, immediateRender: false }, 4.8);
    tl.to('.tk-sub, .tk-act', { opacity: 0, duration: 0.2 }, 4.65);
    tl.fromTo('.tk-del', { opacity: 0, scale: 0.4, left: '50%', top: '48%', xPercent: -50, yPercent: -50 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, 4.65);
    tl.to('.tk-del', { left: '108%', opacity: 0, duration: 0.7, ease: 'power2.in' }, 5.7);
    tl.fromTo('.dg-slot > span', { opacity: 0.7 }, { opacity: 0, duration: 0.3 }, 6.2);
    tl.fromTo('.tk-held', { opacity: 0, scale: 0.6, y: 12 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }, 6.2);
    setStatus('live', 'acting for you', 6.2);
    type(tl, $('.dg-note', st), 'acting for you, never holding your credential', 6.4, 1.1);

    // ---------- 3. request one: search ----------
    const R = 7.6;
    let r = through(pk(1), R, 5);
    let end = finish(pk(1), r, 1);
    tl.fromTo(log(1), { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power3.out' }, r.t + 0.2);

    // ---------- 4. request two: a cart item ----------
    r = through(pk(2), end + 0.3, 5); end = finish(pk(2), r, 2);
    tl.fromTo(log(2), { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power3.out' }, r.t + 0.2);
    tl.fromTo('.dg-item', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3 }, r.t + 0.5);
    count(tl, $('[data-n="total"]', st), 0, 24, r.t + 0.5, 0.5);

    // ---------- 5. request three: over the cap ----------
    r = through(pk(3), end + 0.3, 4); stopAt(pk(3), { t: r.t + 0.26 }, 4, '#ff6b8a', 3, 3);
    tl.fromTo(pk(3), { left: `${BARS[3]}%` }, { left: `${BARS[4]}%`, duration: 0.26, ease: 'none', immediateRender: false }, r.t);
    bounce(pk(3), r.t + 1.5, 3); end = r.t + 2.0;

    // ---------- 6. request four: a blocked category ----------
    r = through(pk(4), end + 0.2, 4); stopAt(pk(4), { t: r.t + 0.26 }, 4, '#ff6b8a', 4, 4);
    tl.fromTo(pk(4), { left: `${BARS[3]}%` }, { left: `${BARS[4]}%`, duration: 0.26, ease: 'none', immediateRender: false }, r.t);
    bounce(pk(4), r.t + 1.5, 4); end = r.t + 2.0;

    // ---------- 7. request five: held for a human, then through ----------
    r = through(pk(5), end + 0.2, 3);
    tl.fromTo(pk(5), { left: `${BARS[2]}%` }, { left: `${BARS[3]}%`, duration: 0.26, ease: 'none', immediateRender: false }, r.t);
    const H = r.t + 0.26;
    flash(bars[3], H, '#f5c451');
    tl.to(pk(5), { borderColor: '#f5c451', boxShadow: '0 0 22px -2px #f5c451', duration: 0.2 }, H);
    tl.fromTo(why(5), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(2)' }, H + 0.1);
    tl.fromTo(log(5), { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.35 }, H + 0.2);
    tl.fromTo('.dg-approve', { opacity: 0, y: 8, scale: 1 }, { opacity: 1, y: 0, duration: 0.3 }, H + 0.8);
    tl.to('.dg-approve', { scale: 0.88, backgroundColor: '#e8ecf2', color: '#0b0d12', duration: 0.12, yoyo: true, repeat: 1 }, H + 1.7);
    tl.to('.dg-approve, ' + `[data-w="5"]`, { opacity: 0, duration: 0.25 }, H + 2.05);
    tl.call(() => { $('.e5', st).textContent = 'approved by you, order placed'; }, null, H + 2.0);
    tl.to(pk(5), { borderColor: '#6ad19a', boxShadow: '0 0 22px -2px #6ad19a', duration: 0.2 }, H + 2.0);
    flash(bars[3], H + 2.05, '#6ad19a');
    tl.fromTo(pk(5), { left: `${BARS[3]}%` }, { left: `${BARS[4]}%`, duration: 0.26, ease: 'none', immediateRender: false }, H + 2.1);
    flash(bars[4], H + 2.36, '#6ad19a');
    tl.fromTo(pk(5), { left: `${BARS[4]}%` }, { left: `${END - 6}%`, duration: 0.45, ease: 'power1.out', immediateRender: false }, H + 2.36);
    tl.fromTo(store(3), { backgroundColor: 'rgba(95,212,160,0)' }, { backgroundColor: 'rgba(95,212,160,.3)', duration: 0.2, yoyo: true, repeat: 1, immediateRender: false }, H + 2.7);
    tl.to(pk(5), { opacity: 0, duration: 0.25 }, H + 2.95);
    tl.fromTo('.dg-placed', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, H + 2.8);
    tl.fromTo($('i.h', log(5)), { color: '#f5c451' }, { color: '#6ad19a', duration: 0.2 }, H + 2.0);
    end = H + 3.4;

    // ---------- 8. revoke ----------
    const V = end + 0.4;
    tl.to($('.tg-main', st), { '--on': 0, duration: 0.3 }, V);
    tl.fromTo('.tk-held', { filter: 'grayscale(0)' }, { opacity: 0.25, filter: 'grayscale(1)', scale: 0.92, duration: 0.5, immediateRender: false }, V + 0.2);
    setStatus('off', 'cut off', V + 0.2);
    r = through(pk(6), V + 1.0, 2); stopAt(pk(6), { t: r.t + 0.26 }, 2, '#ff6b8a', 6, 6);
    tl.fromTo(pk(6), { left: `${BARS[1]}%` }, { left: `${BARS[2]}%`, duration: 0.26, ease: 'none', immediateRender: false }, r.t);
    bounce(pk(6), r.t + 1.5, 6);

    // ---------- 9. re-grant: one switch back on, and traffic flows again ----------
    const G = r.t + 2.3;
    tl.to($('.tg-main', st), { '--on': 1, duration: 0.3 }, G);
    tl.to('.tk-held', { opacity: 1, filter: 'grayscale(0)', scale: 1, duration: 0.5 }, G + 0.1);
    setStatus('live', 'acting for you', G + 0.1);
    const r7 = through(pk(7), G + 0.9, 5); finish(pk(7), r7, 1);
    tl.fromTo(log(7), { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power3.out' }, r7.t + 0.2);
    return tl;
  };

  // the finished frame stays alive: requests keep crossing the gateway, one is always stopped, and tokens ride the edge
  const ambient = (tl) => {
    const a = gsap.timeline({ repeat: -1, paused: true });
    const pks = $$('[data-amb]', st), bars = $$('.dg-bar', st);
    gsap.set(pks, { xPercent: -50, yPercent: -50, opacity: 0, left: `${START}%` });
    const flash = (bar, at, c) => {
      a.fromTo(bar, { backgroundColor: 'rgba(232,236,242,.2)', boxShadow: '0 0 0 transparent', scaleY: 1 }, { backgroundColor: c, boxShadow: `0 0 22px ${c}`, scaleY: 1.3, duration: 0.1, immediateRender: false }, at);
      a.to(bar, { backgroundColor: 'rgba(232,236,242,.2)', boxShadow: '0 0 0 transparent', scaleY: 1, duration: 0.55 }, at + 0.1);
    };
    const run = (p, at, stop, row) => {
      a.fromTo(p, { left: `${START}%`, opacity: 0, scale: 0.9, x: 0, borderColor: '#6ea8ff', boxShadow: '0 0 18px -4px #6ea8ff' }, { opacity: 1, scale: 1, duration: 0.2, immediateRender: false }, at);
      let t = at + 0.2, prev = START;
      const n = stop < 0 ? 5 : stop;
      for (let i = 0; i < n; i++) {
        a.fromTo(p, { left: `${prev}%` }, { left: `${BARS[i]}%`, duration: 0.5, ease: 'none', immediateRender: false }, t);
        t += 0.5; prev = BARS[i]; flash(bars[i], t, '#6ad19a');
      }
      if (stop < 0) {
        a.fromTo(p, { left: `${prev}%` }, { left: `${END - 6}%`, duration: 0.6, ease: 'power1.out', immediateRender: false }, t);
        a.fromTo(store(row), { backgroundColor: 'rgba(95,212,160,0)' }, { backgroundColor: 'rgba(95,212,160,.28)', duration: 0.2, yoyo: true, repeat: 1, immediateRender: false }, t + 0.5);
        a.to(p, { opacity: 0, duration: 0.25 }, t + 0.8);
      } else {
        a.fromTo(p, { left: `${prev}%` }, { left: `${BARS[stop]}%`, duration: 0.5, ease: 'none', immediateRender: false }, t);
        t += 0.5; flash(bars[stop], t, '#ff6b8a');
        a.to(p, { borderColor: '#ff6b8a', boxShadow: '0 0 22px -2px #ff6b8a', x: 4, duration: 0.06, yoyo: true, repeat: 5 }, t);
        a.to(p, { left: `${START}%`, opacity: 0, duration: 0.6, ease: 'power2.in' }, t + 0.8);
      }
    };
    run(pks[0], 0, -1, 1);
    run(pks[1], 3.8, -1, 2);
    run(pks[2], 7.6, 4, 2);
    if (tl.edge) {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', 3.4); dot.setAttribute('class', 'dg-edge-dot');
      $('.dg-wires', st).append(dot);
      travel(a, dot, tl.edge, 0.5, 2.2, 'power1.inOut');
      travel(a, dot.cloneNode(), tl.edge, 6.2, 2.2, 'power1.inOut');
    }
    a.to({}, { duration: 11.6 }, 0);
    return a;
  };

  autoplay(root, make, reduced, { ambient: ambientOn ? ambient : null });

}
