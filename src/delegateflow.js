// "How the Hub keeps the agent honest", following the end-to-end diagram and paced to be read: you set the
// rules in the Delegation Hub, they're saved with your identity provider, and every request the agent makes
// goes through the agent gateway, which trades tokens (RFC 8693), checks the tool's scope and the payload,
// then forwards it or returns 403. Replies travel back on their own lane; every label stays on its wire.
import { gsap } from 'gsap';
import { ICON, barHTML, kit, narrator, controls } from './flowkit.js';

const $ = (s, r) => r.querySelector(s);
const $$ = (s, r) => [...r.querySelectorAll(s)];
const STEPS = 8;
const CHECKS = [
  ['obo', 'Reads the on-behalf-of headers', 'subject + actor tokens'],
  ['xchg', 'Trades them for a delegated token', 'RFC 8693, 15 minutes'],
  ['rbac', 'Checks the tool’s scope', 'add_* needs purchase_read'],
  ['cel', 'Checks the payload policy', 'CEL rules on the arguments'],
];
const st = () => `<span class="gf-st"><i class="spin"></i><i class="ok">${ICON.ok}</i><i class="no">${ICON.no}</i></span>`;

export function delegateFlowHTML() {
  return `<div class="gf df">
    ${barHTML(STEPS)}
    <div class="gf-stage">
    <svg class="gf-wires" aria-hidden="true"></svg>
    <div class="gf-chips" aria-hidden="true"></div>
    <div class="df-grid">
      <div class="df-card df-hub" data-n="hub">
        <h4>Delegation Hub</h4>
        <p class="df-sub">You decide what <b>Purchase Assistant</b> may do.</p>
        <div class="df-scopes"><span class="y">purchase_read</span><span class="y">purchase_admin</span><span class="n">weather</span></div>
        <p class="df-line"><span>Spend limit</span><b>$5,000</b></p>
        <p class="df-line"><span>Expires</span><b>in 30 days</b></p>
        <p class="df-line df-access"><span>Access</span><b class="df-switch" data-on="1"><i></i><em>on</em></b></p>
      </div>
      <div class="df-card df-idp" data-n="idp">
        <h4>Identity provider</h4>
        <ul class="df-list">
          <li data-i="consent">${st()}<span>Your consent, per agent</span></li>
          <li data-i="scopes">${st()}<span>Approved scopes and expiry</span></li>
          <li data-i="revoke">${st()}<span>Revocation state: <b class="df-rv">active</b></span></li>
        </ul>
      </div>
      <div class="df-card df-agent" data-n="agent">
        <h4>Shopping agent</h4>
        <p class="df-sub">Holds your subject token and its own actor token. Never the delegated one.</p>
        <p class="df-ask">“Add JLab earbuds”</p>
      </div>
      <div class="df-card df-gw" data-n="gw">
        <h4>Agent gateway</h4>
        <ul class="df-list">${CHECKS.map(([k, a, b]) => `<li data-c="${k}">${st()}<span>${a}<small>${b}</small></span></li>`).join('')}</ul>
        <p class="df-verdict" data-v=""><b></b></p>
      </div>
      <div class="df-card df-mcp" data-n="mcp">
        <h4>Purchase MCP</h4>
        <p class="df-sub">13 cart and checkout tools</p>
        <p class="df-cart"><span class="df-item">JLab earbuds · $49</span></p>
      </div>
    </div>
    </div>
  </div>`;
}

export function mountDelegateFlow(root, { reduced, scroller }) {
  const stage = $('.df', root), area = $('.gf-stage', stage);
  const q = (s) => $(s, stage);
  const K = kit(area), N = narrator(stage, STEPS);
  let tl = null, watch = null, played = false, finished = false;
  const mark = (li, state) => { li.classList.remove('run', 'ok', 'bad'); if (state) li.classList.add(state); };
  const setAccess = (on) => { const s = q('.df-switch'); s.dataset.on = on ? '1' : '0'; $('em', s).textContent = on ? 'on' : 'revoked'; };
  const verdict = (kind, text) => { const v = q('.df-verdict'); v.dataset.v = kind; $('b', v).textContent = text; };

  function reset() {
    $$('.df-list li', stage).forEach((li) => mark(li, ''));
    setAccess(true); q('.df-rv').textContent = 'active';
    verdict('', ''); q('.df-mcp').classList.remove('got'); q('.df-ask').textContent = '“Add JLab earbuds”';
  }

  function build() {
    tl?.kill(); reset(); K.clear();
    const wide = getComputedStyle(q('.df-grid')).gridTemplateColumns.split(' ').length >= 3;
    const H = K.box(q('[data-n="hub"]')), I = K.box(q('[data-n="idp"]')), A = K.box(q('[data-n="agent"]')), G = K.box(q('[data-n="gw"]')), M = K.box(q('[data-n="mcp"]'));
    const W = {};
    if (wide) {
      const yS = Math.max(H.t, I.t) + Math.min(H.h, I.h) / 2, yR = A.cy;
      W.save = K.wire(`M${H.r} ${yS} H${I.l}`);
      W.req = K.wire(`M${A.r} ${yR - 9} H${G.l}`);
      W.resp = K.wire(`M${G.l} ${yR + 9} H${A.r}`, 'back');
      W.up = K.wire(`M${I.cx - 12} ${G.t} V${I.b}`);
      W.down = K.wire(`M${I.cx + 12} ${I.b} V${G.t}`, 'back');
      W.fwd = K.wire(`M${G.r} ${M.cy} H${M.l}`);
    }
    const at = (t, time, fn) => t.call(fn, null, time);
    const check = (t, k, time, state) => { const li = q(`[data-c="${k}"]`); at(t, time, () => mark(li, 'run')); at(t, time + 0.6, () => mark(li, state)); };
    const clearChecks = (t, time) => at(t, time, () => { $$('.df-gw li', stage).forEach((li) => mark(li, '')); verdict('', ''); });
    const req = (t, label, time) => { K.ride(t, W.req, label, time, 1.6, { kind: 'ticket', pinKey: 'req', pinOpts: { dy: -13 } }); };
    const resp = (t, label, time, bad) => { K.light(t, W.resp, time - 0.2); K.ride(t, W.resp, label, time, 1.4, { kind: bad ? 'bad' : 'back', pinKey: 'resp', pinOpts: { dy: 13 } }); };

    const t = gsap.timeline({ paused: true });
    N.say(t, 1, 'In the Delegation Hub, you decide what Purchase Assistant may do', 0.2);
    t.fromTo(q('[data-n="hub"]'), { scale: 0.97 }, { scale: 1, duration: 0.6, ease: 'expo.out' }, 0.3);

    N.say(t, 2, 'Your choices are saved with your identity provider', 2.4);
    K.light(t, W.save, 2.6); K.ride(t, W.save, 'your choices', 2.8, 1.6, { pinKey: 'save', pinOpts: { dy: -13 } });
    at(t, 4.6, () => mark(q('[data-i="consent"]'), 'ok')); at(t, 5.0, () => mark(q('[data-i="scopes"]'), 'ok')); at(t, 5.4, () => mark(q('[data-i="revoke"]'), 'ok'));

    N.say(t, 3, 'The agent asks to add earbuds, carrying your token and its own', 6.4);
    K.light(t, W.req, 6.6); req(t, 'add earbuds', 6.8);
    check(t, 'obo', 8.6, 'ok');

    N.say(t, 4, 'The gateway trades them for a short-lived delegated token', 9.8);
    at(t, 10.0, () => mark(q('[data-c="xchg"]'), 'run'));
    K.light(t, W.up, 10.0); K.ride(t, W.up, 'exchange', 10.2, 1.4, { pinKey: 'up', pinOpts: { dx: -44, dy: 0 } });
    K.light(t, W.down, 11.8); K.ride(t, W.down, '15-min token', 12.0, 1.4, { kind: 'back', pinKey: 'down', pinOpts: { dx: 52, dy: 0 } });
    at(t, 13.5, () => mark(q('[data-c="xchg"]'), 'ok'));

    N.say(t, 5, 'Scope and payload checks pass, so the call reaches the cart', 14.4);
    check(t, 'rbac', 14.6, 'ok'); check(t, 'cel', 15.4, 'ok');
    at(t, 16.2, () => verdict('ok', 'Forwarded'));
    K.light(t, W.fwd, 16.4); K.ride(t, W.fwd, 'add_to_cart', 16.6, 1.5, { pinKey: 'fwd', pinOpts: { dy: -13 } });
    at(t, 18.2, () => q('.df-mcp').classList.add('got'));
    resp(t, '200 added', 18.6, false);

    N.say(t, 6, 'Next it tries to add wine. The payload policy says no', 20.6);
    clearChecks(t, 20.6); at(t, 20.6, () => { q('.df-ask').textContent = '“Add a bottle of wine”'; });
    req(t, 'add wine', 20.8);
    check(t, 'obo', 22.5, 'ok'); check(t, 'xchg', 22.9, 'ok'); check(t, 'rbac', 23.3, 'ok'); check(t, 'cel', 23.7, 'bad');
    at(t, 24.4, () => verdict('no', '403 · alcohol on an under-age account'));
    resp(t, '403 policy', 24.6, true);

    N.say(t, 7, 'You revoke the agent in the Hub', 26.6);
    at(t, 26.8, () => setAccess(false));
    K.ride(t, W.save, 'revoke', 27.0, 1.4, { kind: 'bad', pinKey: 'save', pinOpts: { dy: -13 } });
    at(t, 28.5, () => { mark(q('[data-i="revoke"]'), 'bad'); q('.df-rv').textContent = 'revoked'; });

    N.say(t, 8, 'Its next request can’t get a token. 403, and the agent is cut off', 29.2);
    clearChecks(t, 29.2); at(t, 29.2, () => { q('.df-ask').textContent = '“Add bread”'; });
    req(t, 'add bread', 29.4);
    check(t, 'obo', 31.1, 'ok');
    at(t, 31.8, () => mark(q('[data-c="xchg"]'), 'run'));
    K.ride(t, W.up, 'exchange', 31.8, 1.2, { pinKey: 'up', pinOpts: { dx: -44, dy: 0 } });
    K.ride(t, W.down, 'denied', 33.1, 1.2, { kind: 'bad', pinKey: 'down', pinOpts: { dx: 52, dy: 0 } });
    at(t, 34.4, () => mark(q('[data-c="xchg"]'), 'bad'));
    at(t, 34.6, () => verdict('no', '403 · access revoked, agent cut off'));
    resp(t, '403 revoked', 34.8, true);
    t.to({}, { duration: 1 });
    tl = t;
    return t;
  }

  const start = () => { played = true; finished = false; C.reset(); build(); if (reduced) { tl.progress(1, false); finished = true; return; } tl.eventCallback('onComplete', () => { finished = true; }); C.apply(tl); tl.play(0); };
  const C = controls(stage, () => tl, start);
  reset();
  watch = new IntersectionObserver(([e]) => { if (e.isIntersecting && !played) { start(); watch.disconnect(); } }, { root: scroller, threshold: 0.15 });
  watch.observe(area);
  let rz = 0;
  const onResize = () => { clearTimeout(rz); rz = setTimeout(() => { if (finished) { build(); tl.progress(1, false); } }, 200); };
  addEventListener('resize', onResize);
  return { kill() { tl?.kill(); watch?.disconnect(); removeEventListener('resize', onResize); } };
}
