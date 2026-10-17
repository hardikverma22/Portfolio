// "How Grid thinks", paced to be read. A narration line says what is happening in eight steps; the ticket
// rides into the supervisor, tasks ride out to the specialists, findings ride back on their own lane, and
// every label stays pinned to its wire, so the finished diagram is a record of the whole run.
// Same sample run as the replay above it.
import { gsap } from 'gsap';
import { ICON, barHTML, kit, narrator, controls } from './flowkit.js';

const $ = (s, r) => r.querySelector(s);
const $$ = (s, r) => [...r.querySelectorAll(s)];

const AGENTS = [
  { k: 'logs', n: 'LogIQ', m: 'OpenObserve MCP', job: 'checks the logs for the test card', found: '400 card_expiry_invalid on save' },
  { k: 'repro', n: 'Repro', m: 'Playwright MCP', job: 'replays the steps in stage', found: 'reproduced: the save fails' },
  { k: 'gh', n: 'GitHub', m: 'GitHub MCP · gh CLI', job: 'finds the change behind it', found: 'PR #482 now expects MM/YYYY' },
  { k: 'svc', n: 'Serviceability', m: 'Grafana · Prometheus · K8s', job: 'checks clusters, pods, deploys', found: 'not needed: no outage' },
  { k: 'comms', n: 'Communication', m: 'communication MCP', job: 'tells the right team', found: 'ticket updated, author notified' },
];
const STEPS = 8;

export function gridFlowHTML() {
  return `<div class="gf">
    ${barHTML(STEPS)}
    <div class="gf-stage">
    <svg class="gf-wires" aria-hidden="true"></svg>
    <div class="gf-chips" aria-hidden="true"></div>
    <div class="gf-grid">
      <div class="gf-in">
        <div class="gf-ticket" data-n="ticket">
          <p class="gf-tk"><span class="gf-id">QA-2187</span><span class="gf-src">from Jira, by webhook</span></p>
          <p class="gf-tt">Can’t add a credit card in stage</p>
          <p class="gf-data">4111 1111 1111 1111 · 12/30</p>
        </div>
        <p class="gf-doors">Grid also hears from its chat UI, Slack, Teams, ServiceNow, Outlook and other agents.</p>
      </div>
        <div class="gf-sup" data-n="sup">
          <h4>Supervisor</h4>
          <p class="gf-status" data-s="idle"><i></i><span>waiting for work</span></p>
          <ol class="gf-plan">
            <li>Read the ticket and the test card</li>
            <li>Logs and repro, in parallel</li>
            <li>Pick the branch</li>
            <li>Conclude, then ask a person</li>
          </ol>
          <div class="gf-branch" aria-label="Where the issue lives">
            <span data-b="code">Code</span><span data-b="down">Downstream</span><span data-b="out">Outage</span>
          </div>
          <p class="gf-kb">Draws on a vector DB of runbooks and past fixes.</p>
        </div>
      <div class="gf-agents" data-n="agents">
        <h4>Specialists</h4>
        ${AGENTS.map((a) => `<div class="gf-ag" data-a="${a.k}">
          <span class="gf-st"><i class="spin"></i><i class="ok">${ICON.ok}</i><i class="no">${ICON.skip}</i></span>
          <div><p class="gf-name">${a.n} <code>${a.m}</code></p><p class="gf-cap" data-job="${a.job}" data-found="${a.found}">${a.job}</p></div>
        </div>`).join('')}
      </div>
        <div class="gf-verdict" data-n="verdict">
          <h4>Verdict</h4>
          <p class="gf-wait">Waiting for the supervisor to conclude…</p>
          <p class="gf-v">PR #482 expects the expiry as MM/YYYY; the card form still sends MM/YY.</p>
          <p class="gf-plain"><strong>In plain words:</strong> saving a card fails because a recent change wants a four-digit year.</p>
          <div class="gf-gate"><button type="button" class="gf-btn" data-b="ok" tabindex="-1">Approve</button><button type="button" class="gf-btn ghost" tabindex="-1">Dig deeper</button><span class="gf-done">Approved</span></div>
        </div>
    </div>
    </div>
    <div class="gf-race">
      <div class="gf-lane" data-l="hand"><span>By hand</span><div class="gf-track"><i></i></div><b>00:00</b></div>
      <div class="gf-lane" data-l="grid"><span>With Grid</span><div class="gf-track"><i></i></div><b>00:00</b></div>
    </div>
  </div>`;
}

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function mountGridFlow(root, { reduced, scroller }) {
  const stage = $('.gf', root), area = $('.gf-stage', stage);
  const q = (s) => $(s, stage);
  const ag = (k) => q(`[data-a="${k}"]`);
  const K = kit(area), N = narrator(stage, STEPS);
  let tl = null, watch = null, played = false, finished = false;
  const paint = (lane, v) => { $('i', lane).style.transform = `scaleX(${v / 5400})`; $('b', lane).textContent = mmss(v); };

  function reset() {
    $$('.gf-ag', stage).forEach((e) => { e.classList.remove('run', 'ok', 'skipped'); const c = $('.gf-cap', e); c.textContent = c.dataset.job; });
    $$('.gf-plan li', stage).forEach((li) => li.classList.remove('on'));
    $$('.gf-branch span', stage).forEach((b) => b.classList.remove('pick', 'drop'));
    q('.gf-status').dataset.s = 'idle'; $('span', q('.gf-status')).textContent = 'waiting for work';
    q('.gf-verdict').classList.remove('live'); q('.gf-btn[data-b="ok"]').classList.remove('on'); q('.gf-done').classList.remove('in');
    q('[data-l="grid"]').classList.remove('won');
    paint(q('[data-l="hand"]'), 0); paint(q('[data-l="grid"]'), 0);
  }

  function build() {
    tl?.kill(); reset(); K.clear();
    const wide = getComputedStyle(q('.gf-grid')).gridTemplateColumns.split(' ').length >= 3;
    const T = K.box(q('[data-n="ticket"]')), S = K.box(q('[data-n="sup"]')), V = K.box(q('[data-n="verdict"]')), A = K.box(q('[data-n="agents"]'));
    const W = {};
    if (wide) {
      // straight lanes: out on top, the reply just under it, both at the specialist's own height
      W.in = K.wire(`M${T.r} ${T.cy} H${S.l}`);
      AGENTS.forEach((a) => {
        const r = K.box(ag(a.k));
        W[a.k] = K.wire(`M${S.r} ${r.cy - 9} H${A.l}`, a.k === 'svc' ? 'quiet' : 'out');
        if (a.k !== 'svc' && a.k !== 'comms') W[`${a.k}Back`] = K.wire(`M${A.l} ${r.cy + 9} H${S.r}`, 'back');
      });
      W.out = K.wire(`M${S.cx} ${S.b} V${V.t}`);
    }
    const status = (t, st, txt, at) => t.call(() => { q('.gf-status').dataset.s = st; $('span', q('.gf-status')).textContent = txt; }, null, at);
    const step = (t, i, at) => t.call(() => q(`.gf-plan li:nth-child(${i + 1})`).classList.add('on'), null, at);
    const work = (t, k, at, done) => {
      const el = ag(k), cap = $('.gf-cap', el);
      t.call(() => el.classList.add('run'), null, at);
      t.call(() => { el.classList.remove('run'); el.classList.add(k === 'svc' ? 'skipped' : 'ok'); cap.textContent = cap.dataset.found; }, null, done);
    };
    const out = (t, k, label, at, dur = 1.6) => { K.light(t, W[k], at); K.ride(t, W[k], label, at + 0.2, dur, { pinKey: k, pinOpts: { at: 0.5, dy: -13 } }); };
    const back = (t, k, label, at, dur = 1.5) => { K.light(t, W[`${k}Back`], at); K.ride(t, W[`${k}Back`], label, at + 0.2, dur, { kind: 'back', pinKey: `${k}Back`, pinOpts: { at: 0.5, dy: 13 } }); };

    const t = gsap.timeline({ paused: true });
    N.say(t, 1, 'A Jira ticket, with steps and a test card, arrives through Grid’s webhook', 0.2);
    t.fromTo(q('[data-n="ticket"]'), { scale: 0.96 }, { scale: 1, duration: 0.6, ease: 'expo.out' }, 0.3);
    K.light(t, W.in, 0.8, 0.9); K.ride(t, W.in, 'QA-2187', 1.0, 1.8, { kind: 'ticket' });

    N.say(t, 2, 'The supervisor reads it and makes a plan', 3.2);
    status(t, 'run', 'planning', 3.3); step(t, 0, 3.6); step(t, 1, 4.4);

    N.say(t, 3, 'It sends LogIQ to the logs and Repro to reproduce the bug, at the same time', 5.4);
    status(t, 'run', 'logs and repro running', 5.5);
    out(t, 'logs', 'check logs', 5.6); out(t, 'repro', 'replay steps', 5.9);
    work(t, 'logs', 7.4, 9.0); work(t, 'repro', 7.7, 9.6);

    N.say(t, 4, 'Both report back: a 400 error in the logs, and the bug reproduces', 9.8);
    back(t, 'logs', '400 error', 10.0); back(t, 'repro', 'reproduced', 10.4);

    N.say(t, 5, 'The supervisor decides it’s in our code, not a downstream system or an outage', 12.4);
    step(t, 2, 12.5); status(t, 'think', 'where does it live?', 12.5);
    t.call(() => { q('[data-b="code"]').classList.add('pick'); q('[data-b="down"]').classList.add('drop'); q('[data-b="out"]').classList.add('drop'); }, null, 13.6);
    work(t, 'svc', 13.8, 14.0);
    t.call(() => { if (W.svc) K.pin(W.svc, 'svc', 'not needed', { at: 0.5, dy: -13, kind: 'quiet' }); }, null, 14.1);

    N.say(t, 6, 'The GitHub agent looks for the code change behind it', 15.0);
    out(t, 'gh', 'find the change', 15.2); work(t, 'gh', 16.9, 18.2);
    back(t, 'gh', 'PR #482', 18.4);

    N.say(t, 7, 'Communication updates the ticket and tells the PR’s author', 20.4);
    out(t, 'comms', 'update ticket', 20.6); work(t, 'comms', 22.3, 23.2);

    N.say(t, 8, 'The supervisor concludes, and a person approves before anything goes out', 23.8);
    step(t, 3, 23.9); status(t, 'done', 'concluded', 23.9);
    K.light(t, W.out, 24.0, 0.7); K.ride(t, W.out, 'verdict', 24.1, 1.0, { kind: 'ticket' });
    t.call(() => q('.gf-verdict').classList.add('live'), null, 25.2);
    t.to(q('.gf-btn[data-b="ok"]'), { scale: 0.92, duration: 0.12, yoyo: true, repeat: 1 }, 27.0);
    t.call(() => { q('.gf-btn[data-b="ok"]').classList.add('on'); q('.gf-done').classList.add('in'); }, null, 27.3);

    // the race: about five minutes with Grid against 60 to 90 by hand
    const hand = q('[data-l="hand"]'), grid = q('[data-l="grid"]'), R = { v: 0 };
    t.fromTo(R, { v: 0 }, { v: 300, duration: 26.8, ease: 'none', immediateRender: false, onUpdate: () => { paint(hand, R.v); paint(grid, R.v); } }, 0.5);
    t.call(() => grid.classList.add('won'), null, 27.3);
    t.to(R, { v: 5400, duration: 2.0, ease: 'power2.in', onUpdate: () => paint(hand, R.v) }, 27.4);
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
