// Multi-agent incident triage: an incident lands, a supervisor wakes five specialists in parallel,
// their findings converge into one verdict, and a human approves. A race bar shows 60 minutes against 3.
import { gsap, $, $$, type, count, travel, draw, autoplay, ptL as pt, curve } from './util.js';

const HUB = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="2.4"/><circle cx="5" cy="18" r="2.4"/><circle cx="19" cy="18" r="2.4"/><path d="M12 8.4v3.2M12 11.6 6.2 16M12 11.6 17.8 16"/></svg>';

const AGENTS = [
  { k: 'logs', n: 'Logs & traces', m: 'mcp://logs', cap: '412 errors, 96% from one upstream',
    viz: '<svg viewBox="0 0 140 40" preserveAspectRatio="none"><path class="tz-fill" d="M0 34 L12 33 L24 34 L36 32 L48 33 L60 30 L68 10 L78 5 L88 8 L100 6 L112 8 L124 6 L140 7 L140 40 L0 40 Z"/><path class="tz-spark" d="M0 34 L12 33 L24 34 L36 32 L48 33 L60 30 L68 10 L78 5 L88 8 L100 6 L112 8 L124 6 L140 7"/></svg>' },
  { k: 'code', n: 'Code search', m: 'mcp://code', cap: 'retries=0 since the last config change',
    viz: '<div class="tz-code mono"><span>timeout: 2800</span><span class="old">retries: 3</span><span class="hit">retries: 0</span></div>' },
  { k: 'browser', n: 'Browser repro', m: 'mcp://playwright', cap: 'verify returns 504 after 3.0s',
    viz: '<div class="tz-steps mono"><i>sign in</i><i>request OTP</i><i class="bad">verify</i></div>' },
  { k: 'health', n: 'Service health', m: 'mcp://health', cap: 'upstream p99 2.9s, baseline 0.4s',
    viz: '<div class="tz-gauge mono"><div><i class="base"></i><span>0.4s</span></div><div><i class="now"></i><span>2.9s</span></div></div>' },
  { k: 'comms', n: 'Stakeholder updates', m: 'mcp://comms', cap: 'draft ready, awaiting approval',
    viz: '<div class="tz-draft"><s></s><s></s><s></s></div>' },
];

const html = `
  <div class="tz">
    <svg class="tz-wires" aria-hidden="true"></svg>
    <div class="tz-grid">
      <section class="tz-col tz-intake">
        <p class="tz-lab mono">incident</p>
        <div class="tz-chan mono"><span>chat</span><span>ticketing</span><span>email</span></div>
        <div class="tz-inc" data-n="inc">
          <i class="tz-ping"></i>
          <div class="tz-inc-top"><b class="tz-sev">SEV-2</b><span class="mono">INC-0417</span></div>
          <p>Spike in 5xx on OTP verification, one market</p>
        </div>
      </section>

      <section class="tz-col tz-sup">
        <p class="tz-lab mono">supervisor</p>
        <div class="tz-node" data-n="orb">
          <header>
            <span class="tz-ic" aria-hidden="true">${HUB}</span>
            <div><b>Supervisor</b><small class="mono">plans and dispatches</small></div>
          </header>
          <span class="tz-status mono" data-s="idle"><i></i><em>idle</em></span>
          <ul class="tz-plan mono">
            <li><em></em></li><li><em></em></li><li><em></em></li>
          </ul>
        </div>
      </section>

      <section class="tz-col tz-agents">
        <p class="tz-lab mono">five specialists, in parallel</p>
        ${AGENTS.map((a) => `
        <article class="tz-ag" data-a="${a.k}">
          <header><b>${a.n}</b><code class="mono">${a.m}</code><span class="tz-st" aria-hidden="true"><i class="spin"></i><i class="ok">✓</i><i class="hold">⏸</i></span></header>
          <div class="tz-viz">${a.viz}</div>
          <p class="tz-cap mono"><em></em></p>
        </article>`).join('')}
      </section>

      <section class="tz-col tz-out">
        <p class="tz-lab mono">verdict</p>
        <div class="tz-verdict" data-n="verdict">
          <p class="tz-v1"><em></em></p>
          <ul class="mono"><li>restore retries (2×, jittered)</li><li>raise client timeout to 4s, behind a flag</li></ul>
        </div>
        <div class="tz-gate">
          <span class="mono">engineer</span>
          <div><b class="tz-btn" data-b="approve">Approve</b><b class="tz-btn">Redirect</b><b class="tz-btn">Take over</b></div>
          <p class="tz-done mono">✓ approved, fix goes out behind a flag</p>
        </div>
      </section>

    <div class="tz-race">
      <p class="tz-lab mono">time to a decision</p>
      <div class="tz-lane" data-l="hand"><span>on-call, by hand</span><div class="tz-track"><i></i></div><b class="mono">00:00</b></div>
      <div class="tz-lane" data-l="agents"><span>with the agents</span><div class="tz-track"><i></i></div><b class="mono">00:00</b></div>
    </div>
    </div>

  </div>`;

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function mountTriage(root, reduced, ambientOn = true) {
  root.innerHTML = html;
  const stage = $('.tz', root), svg = $('.tz-wires', root);
  const q = (s) => $(s, stage);
  const agents = $$('.tz-ag', stage);

  const make = () => {
    const tl = gsap.timeline();
    const wide = innerWidth >= 960;
    svg.innerHTML = '';
    const mk = (d, cls) => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); p.setAttribute('class', cls); svg.append(p); return p; };
    const dot = (cls) => { const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('r', 3.2); c.setAttribute('class', cls); svg.append(c); return c; };
    const inc = q('[data-n="inc"]'), orb = q('[data-n="orb"]'), ver = q('[data-n="verdict"]');

    const wIn = wide ? mk(curve(pt(stage, inc, 'r'), pt(stage, orb, 'l'), 0.5), 'tz-w tz-w-in') : null;
    const wFan = wide ? agents.map((a) => mk(curve(pt(stage, orb, 'r'), pt(stage, a, 'l'), 0.55), 'tz-w tz-w-fan')) : [];
    const wMerge = wide ? agents.map((a) => mk(curve(pt(stage, a, 'r'), pt(stage, ver, 'l'), 0.5), 'tz-w tz-w-merge')) : [];
    const dIn = wide ? dot('tz-d tz-d-in') : null;
    const dFan = wide ? agents.map(() => dot('tz-d tz-d-fan')) : [];
    const dMerge = wide ? agents.map(() => dot('tz-d tz-d-merge')) : [];

    tl.paths = { wIn, wFan, wMerge };

    // ---------- reset ----------
    const reset = () => {
      $$('.tz-plan em, .tz-cap em, .tz-v1 em', stage).forEach((e) => { e.textContent = ''; });
      q('.tz-lane[data-l="hand"] b').textContent = '00:00'; q('.tz-lane[data-l="agents"] b').textContent = '00:00';
      const st = q('.tz-status'); st.dataset.s = 'idle'; $('em', st).textContent = 'idle';
    };
    tl.resetFn = reset; reset();

    // ---------- 1. the incident lands ----------
    tl.fromTo('.tz-intake > *', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'expo.out' }, 0.2);
    tl.fromTo($$('.tz-chan span', stage), { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.15, ease: 'power3.out' }, 0.4);
    tl.fromTo(q('.tz-ping'), { scale: 0.6, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 1.1, ease: 'power2.out', repeat: 1 }, 0.9);

    // ---------- 2. the supervisor wakes and plans ----------
    tl.fromTo('.tz-sup > *', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'expo.out' }, 1.2);
    if (wIn) { draw(tl, wIn, 1.3, 0.7); travel(tl, dIn, wIn, 1.5, 0.8); }
    const setStatus = (s, txt, at) => tl.call(() => { const el = q('.tz-status'); el.dataset.s = s; $('em', el).textContent = txt; }, null, at);
    setStatus('run', 'planning', 1.9);
    setStatus('done', 'dispatched', 3.5);
    const plan = ['classify the incident', 'recall 2 similar incidents', 'fan out to 5 specialists'];
    $$('.tz-plan li', stage).forEach((li, i) => {
      tl.fromTo(li, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3 }, 2.1 + i * 0.6);
      type(tl, $('em', li), plan[i], 2.1 + i * 0.6, 0.5);
    });

    // ---------- 3. five specialists, in parallel ----------
    tl.fromTo(agents, { opacity: 0, x: 26, scale: 0.97 }, { opacity: 1, x: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'expo.out' }, 3.6);
    tl.fromTo(q('.tz-agents .tz-lab'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 3.5);
    wFan.forEach((w, i) => { draw(tl, w, 3.5 + i * 0.07, 0.6); travel(tl, dFan[i], w, 3.7 + i * 0.07, 0.7); });
    const spin = (k, a, b) => {
      const el = q(`[data-a="${k}"]`);
      tl.set($('.tz-st .spin', el), { opacity: 0 }, 0); tl.set($$('.tz-st .ok, .tz-st .hold', el), { opacity: 0 }, 0);
      tl.fromTo($('.tz-st .spin', el), { opacity: 0, rotation: 0 }, { opacity: 1, rotation: 720, duration: b - a, ease: 'none' }, a);
      tl.to($('.tz-st .spin', el), { opacity: 0, duration: 0.15 }, b);
      tl.fromTo($(k === 'comms' ? '.tz-st .hold' : '.tz-st .ok', el), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(3)' }, b);
      tl.to(el, { boxShadow: '0 0 0 1px rgba(95,212,160,.7), 0 0 30px -8px rgba(95,212,160,.6)', duration: 0.3, yoyo: true, repeat: 1 }, b);
    };
    const cap = (k, from, dur) => type(tl, $(`[data-a="${k}"] .tz-cap em`), AGENTS.find((a) => a.k === k).cap, from, dur);

    // logs: the error rate draws itself, then spikes
    spin('logs', 4.3, 5.7); cap('logs', 4.7, 1.0);
    draw(tl, $('[data-a="logs"] .tz-spark', stage), 4.3, 1.3, 'power1.inOut');
    tl.fromTo($('[data-a="logs"] .tz-fill', stage), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 5.0);
    // code: the changed line lights up
    spin('code', 4.4, 6.0); cap('code', 4.9, 1.1);
    tl.fromTo($$('[data-a="code"] .tz-code span', stage), { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.18 }, 4.5);
    tl.to($('[data-a="code"] .old', stage), { opacity: 0.35, textDecoration: 'line-through', duration: 0.3 }, 5.1);
    tl.fromTo($('[data-a="code"] .hit', stage), { backgroundColor: 'rgba(255,107,138,0)' }, { backgroundColor: 'rgba(255,107,138,.28)', duration: 0.4, yoyo: true, repeat: 3 }, 5.1);
    // browser: replays the sign-in and fails on verify
    spin('browser', 4.4, 6.5); cap('browser', 5.5, 0.9);
    $$('[data-a="browser"] .tz-steps i', stage).forEach((s, i) => tl.fromTo(s, { opacity: 0.3, backgroundColor: 'rgba(232,236,242,.05)' }, { opacity: 1, backgroundColor: s.classList.contains('bad') ? 'rgba(255,107,138,.3)' : 'rgba(95,212,160,.22)', duration: 0.3 }, 4.6 + i * 0.7));
    // health: baseline against now
    spin('health', 4.5, 6.2); cap('health', 5.0, 1.0);
    tl.fromTo($('[data-a="health"] .base', stage), { scaleX: 0 }, { scaleX: 1, duration: 0.5, transformOrigin: 'left', ease: 'power2.out' }, 4.6);
    tl.fromTo($('[data-a="health"] .now', stage), { scaleX: 0 }, { scaleX: 1, duration: 1.0, transformOrigin: 'left', ease: 'power2.inOut' }, 5.0);
    // comms: drafts the update and holds for a human
    spin('comms', 4.8, 7.0); cap('comms', 6.1, 0.9);
    tl.fromTo($$('[data-a="comms"] s', stage), { scaleX: 0 }, { scaleX: 1, duration: 0.6, stagger: 0.35, transformOrigin: 'left', ease: 'power2.out' }, 5.0);

    // ---------- 4. findings converge into one verdict ----------
    wMerge.forEach((w, i) => { draw(tl, w, 6.0 + i * 0.25, 0.55); travel(tl, dMerge[i], w, 6.2 + i * 0.25, 0.7); });
    tl.fromTo('.tz-out .tz-lab', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 7.1);
    tl.fromTo(ver, { opacity: 0, y: 18, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'expo.out' }, 7.3);
    type(tl, q('.tz-v1 em'), 'Root cause: upstream messaging latency, plus a config change that removed retries.', 7.7, 1.8);
    tl.fromTo($$('.tz-verdict li', stage), { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.3 }, 9.6);

    // ---------- 5. the human decides ----------
    tl.fromTo('.tz-gate', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 10.4);
    tl.to(q('[data-b="approve"]'), { scale: 0.92, duration: 0.12, yoyo: true, repeat: 1 }, 11.1);
    tl.fromTo(q('[data-b="approve"]'), { backgroundColor: 'rgba(232,236,242,.08)', color: '#9aa3b2' }, { backgroundColor: '#e8ecf2', color: '#0b0d12', duration: 0.3 }, 11.1);
    tl.fromTo(q('.tz-done'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, 11.5);

    // ---------- the race: 3 minutes against 60 ----------
    const hand = q('[data-l="hand"]'), ag = q('[data-l="agents"]');
    tl.fromTo('.tz-race', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.2);
    const S = { t: 0 };
    tl.fromTo(S, { t: 0 }, { t: 180, duration: 11.4, ease: 'none', onUpdate: () => {
      $('i', $('.tz-track', hand)).style.width = `${(S.t / 3600) * 100}%`;
      $('i', $('.tz-track', ag)).style.width = `${(S.t / 3600) * 100}%`;
      $('b', hand).textContent = mmss(S.t); $('b', ag).textContent = mmss(S.t);
    } }, 0.4);
    tl.fromTo(ag, { '--done': 0 }, { '--done': 1, duration: 0.4 }, 11.8);
    tl.to(S, { t: 3600, duration: 2.0, ease: 'power2.in', onUpdate: () => {
      $('i', $('.tz-track', hand)).style.width = `${(S.t / 3600) * 100}%`;
      $('b', hand).textContent = mmss(S.t);
    } }, 12.0);
    return tl;
  };

  // once the story is told, data keeps moving along the edges: that is the only thing that moves in the finished frame
  const ambient = (tl) => {
    const P = tl.paths;
    if (!P || !P.wIn) return null;
    const a = gsap.timeline({ repeat: -1, paused: true });
    const dot = (cls) => { const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('r', 3.2); c.setAttribute('class', `${cls} tz-amb`); svg.append(c); return c; };
    travel(a, dot('tz-d tz-d-in'), P.wIn, 0, 1.3);
    P.wFan.forEach((w, i) => travel(a, dot('tz-d tz-d-fan'), w, 1.2 + i * 0.28, 1.5));
    P.wMerge.forEach((w, i) => travel(a, dot('tz-d tz-d-merge'), w, 3.6 + i * 0.26, 1.5));
    a.to({}, { duration: 6.2 }, 0);
    return a;
  };

  autoplay(root, make, reduced, { ambient: ambientOn ? ambient : null });

}
