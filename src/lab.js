// Inside the Agent Lab: a workbench of four live devices, and a case page for each one.
// Case pages have their own URL (#/lab/<id>), so they can be shared and the browser's Back button closes them.
import { gsap } from 'gsap';
import { sfx } from './sfx.js';
import { gridFlowHTML, mountGridFlow } from './gridflow.js';
import { delegateFlowHTML, mountDelegateFlow } from './delegateflow.js';
import { lab } from './labdata.js';
import { tokenos } from './data.js';
import { mark } from './marks.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = (n) => Math.round(n).toLocaleString('en-US');

/* =====================================================================
   The workbench: one device per project, each quietly doing its job
   ===================================================================== */
const devices = {
  grid: () => `
    <div class="dv-screen dv-slack" aria-hidden="true">
      <div class="dvs-top"><i></i><i></i><i></i><span># triage</span></div>
      <div class="dvs-feed">
        <p class="dvs-msg alert"><b>Jira</b> QA-2187 · can’t add a card</p>
        <p class="dvs-msg bot"><b>Grid</b> Webhook received. Plan ready</p>
        <p class="dvs-msg bot"><b>Grid</b> Logs, repro, then GitHub</p>
        <p class="dvs-msg bot ok"><b>Grid</b> Root cause found ✓</p>
      </div>
    </div>`,
  delegate: () => `
    <div class="dv-screen dv-gate" aria-hidden="true">
      <div class="dvg-card"><span>agent</span><b>Purchase Assistant</b></div>
      <div class="dvg-slot"></div>
      <div class="dvg-checks">${['profile', 'consent', 'token', 'scope', 'policy'].map((c, i) => `<i style="--i:${i}" title="${c}"></i>`).join('')}</div>
      <div class="dvg-switch"><span>access</span><i></i></div>
    </div>`,
  tokens: () => `
    <div class="dv-screen dv-press" aria-hidden="true">
      <p class="dvp-k">tokens in context</p>
      <p class="dvp-n" data-count>48,210</p>
      <div class="dvp-bar"><i></i></div>
      <div class="dvp-models"><span>Haiku</span><span>Sonnet</span><span>Opus</span></div>
    </div>`,
  mimo: () => `
    <div class="dv-screen dv-rec" aria-hidden="true">
      <div class="dvr-top"><span class="dvr-dot"></span>REC <time>00:12</time></div>
      <div class="dvr-wave">${Array.from({ length: 18 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
      <p class="dvr-say">“open the pull requests tab…”</p>
    </div>`,
};

function benchHTML() {
  return `<div class="bench">
    <div class="bench-wall" aria-hidden="true"></div>
    <div class="bench-row">
      ${lab.map((p, i) => `
      <button class="dev dev-${p.id}" data-case="${p.id}" style="--i:${i}" aria-label="Open the ${esc(p.name)} case">
        <span class="dev-tag" aria-hidden="true"><b>${esc(p.tag[0])}</b><span>→ ${esc(p.tag[1])}</span></span>
        <span class="dev-frame">${devices[p.id]()}</span>
        <span class="dev-label"><span class="dev-kind dev-kind-${p.kind.toLowerCase()}">${p.kind}</span><b>${esc(p.name)}</b><small>${esc(p.hook)}</small><em>Open the case →</em></span>
      </button>`).join('')}
    </div>
    <div class="bench-top" aria-hidden="true"></div>
  </div>`;
}

/* =====================================================================
   Case pages
   ===================================================================== */
function caseHTML(p) {
  const i = lab.indexOf(p), next = lab[(i + 1) % lab.length];
  return `
  <header class="cs-hero">
    <p class="cs-k">${mark(p.mark, 'cs-mk')}<span>${p.kind} · ${esc(p.when)}</span></p>
    <h2 class="cs-name">${esc(p.name)}</h2>
    <p class="cs-full">${esc(p.full)}</p>
    <p class="cs-hook">${esc(p.hook)}</p>
    <p class="cs-pitch">${esc(p.pitch)}</p>
    <dl class="cs-meta">${p.meta.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  </header>
  <section class="cs-demo" aria-label="${esc(p.name)}, re-enacted">
    <div class="cs-demo-bar"><span>Re-enacted with sample data</span><button class="cs-replay" type="button">↻ Replay</button></div>
    <div class="cs-stage" id="cs-stage"></div>
  </section>
  <section class="cs-nums">${p.numbers.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</section>
  ${p.id === 'grid' ? gridArch() : ''}${p.id === 'delegate' ? `<section class="cs-arch"><h3>How the Hub keeps the agent honest</h3>${delegateFlowHTML()}</section>` : ''}
  <section class="cs-built"><h3>What I built</h3><ol>${p.built.map(([t, d]) => `<li><b>${esc(t)}</b><p>${esc(d)}</p></li>`).join('')}</ol></section>
  <section class="cs-stack"><h3>Stack</h3><ul>${p.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></section>
  <footer class="cs-next"><button type="button" data-case="${next.id}"><span>Next in the lab</span><b>${esc(next.name)} →</b><small>${esc(next.hook)}</small></button></footer>`;
}

function gridArch() {
  return `<section class="cs-arch"><h3>How Grid thinks</h3>${gridFlowHTML()}</section>`;
}

/* =====================================================================
   Replays. Each returns a gsap timeline built on the stage element.
   ===================================================================== */
const typing = '<span class="typing"><i></i><i></i><i></i></span>';

function gridReplay(st) {
  // sample run: a QA ticket for a card that won't save in the test environment
  const subs = [
    ['LogIQ', 'OpenObserve MCP: the save for card ••1111 failed with 400 card_expiry_invalid', 'run'],
    ['Repro', 'Playwright MCP: reproduced in stage, the save fails, screenshot attached', 'run'],
    ['GitHub', 'GitHub MCP: PR #482, merged yesterday, now expects the expiry as MM/YYYY', 'run'],
    ['Serviceability', 'not needed: no sign of an outage or a deployment in progress', 'skip'],
    ['Communication', 'ticket updated with the findings, PR author notified', 'run'],
  ];
  st.innerHTML = `<div class="sk">
    <aside class="sk-side"><p class="sk-ws">Walmart</p><p class="sk-sec">Channels</p><p># general</p><p class="on"># triage</p><p># releases</p><p class="sk-sec">Apps</p><p><span class="sk-app">G</span> Grid</p><p><span class="sk-app sk-app-j">J</span> Jira</p></aside>
    <div class="sk-main">
      <header class="sk-head"># triage <small>bugs and incidents, picked up by Grid</small></header>
      <div class="sk-msg sk-alert" data-s="0"><span class="sk-av av-j">J</span><div><p class="sk-who">Jira <span class="sk-tag">APP</span><time>10:32 AM</time></p>
        <p><span class="sev">QA-2187</span> Can’t add a credit card in stage</p>
        <p class="sk-steps">Steps: Account → Wallet → Add card → Save<br/>Test card: 4111 1111 1111 1111 · 12/30 · CVV 123</p>
        <p class="sk-replies" data-s="1">6 replies · last reply just now</p></div></div>
    </div>
    <div class="sk-thread">
      <header class="sk-head">Thread <small># triage</small></header>
      <div class="sk-msg" data-s="1"><span class="sk-av av-g">G</span><div><p class="sk-who">Grid <span class="sk-tag">APP</span><time>10:32 AM</time></p><p>Webhook received QA-2187. Reading the ticket: steps to reproduce and test card data included.</p></div></div>
      <div class="sk-msg" data-s="2"><span class="sk-av av-g">G</span><div><p class="sk-who">Grid <span class="sk-tag">APP</span><time>10:33 AM</time></p><p class="sk-typing">${typing}</p><div class="sk-body"><p>Supervisor’s plan: check the logs and reproduce first, then decide.</p>
        <ul class="sk-plan">${subs.map(([n, fnd, k], i) => `<li data-sub="${i}" data-kind="${k}"><span class="sk-st"><i class="sp"></i><i class="ck">${k === 'skip' ? '–' : '✓'}</i></span><b>${n}</b><em>${fnd}</em></li>`).join('')}</ul></div></div></div>
      <div class="sk-msg" data-s="3"><span class="sk-av av-g">G</span><div><p class="sk-who">Grid <span class="sk-tag">APP</span><time>10:35 AM</time></p>
        <div class="sk-card mem"><b>Supervisor’s call</b><p>It reproduces, and the logs point at our own validation code, not a downstream system or an outage. Sending the GitHub agent to find the change.</p></div>
        <div class="sk-card kb"><b>From the knowledge base</b><p>Earlier card_expiry_invalid errors came from date-format changes in the card form.</p></div></div></div>
      <div class="sk-msg" data-s="4"><span class="sk-av av-g">G</span><div><p class="sk-who">Grid <span class="sk-tag">APP</span><time>10:37 AM</time></p>
        <div class="sk-card verdict"><b>Likely root cause</b><p>PR #482 changed expiry parsing to MM/YYYY, but the add-card form still sends MM/YY.</p><b>Suggested fix</b><p>Accept both formats, or revert the parsing change in #482.</p><b>In plain words</b><p>Saving a card fails in the test environment because a recent code change expects a four-digit expiry year.</p><div class="sk-btns"><span class="sk-btn primary">Approve and notify</span><span class="sk-btn">Dig deeper</span></div></div></div></div>
      <div class="sk-msg" data-s="5"><span class="sk-av av-r">D</span><div><p class="sk-who">Dev<time>10:41 AM</time></p><p>Picked up the ticket and it’s already triaged. Fixing in #489.</p></div></div>
      <p class="sk-foot" data-s="5"><b>5 minutes</b> from ticket to root cause · by hand, 60 to 90</p>
    </div>
  </div>`;
  const th = $('.sk-thread', st);
  const follow = () => requestAnimationFrame(() => th.scrollTo({ top: th.scrollHeight, behavior: 'smooth' }));
  const show = (s) => { $$(`[data-s="${s}"]`, st).forEach((e) => e.classList.add('in')); follow(); };
  const tl = gsap.timeline();
  tl.call(() => show(0), null, 0.3).call(() => show(1), null, 1.4)
    .call(() => { show(2); $('[data-s="2"]', st).classList.add('is-typing'); }, null, 2.6)
    .call(() => $('[data-s="2"]', st).classList.remove('is-typing'), null, 3.6);
  // logs and repro first, in parallel; then the supervisor decides; then the GitHub agent, a skipped check, and the update
  const run = (i, t0, t1) => tl.call(() => $(`[data-sub="${i}"]`, st).classList.add('run'), null, t0).call(() => { $(`[data-sub="${i}"]`, st).classList.add(subs[i][2] === 'skip' ? 'skip' : 'done'); follow(); }, null, t1);
  run(0, 3.9, 5.4); run(1, 4.1, 6.0);
  tl.call(() => show(3), null, 6.8);
  run(2, 7.6, 8.8); run(3, 8.9, 9.3); run(4, 9.4, 10.2);
  tl.call(() => show(4), null, 11.0).call(() => show(5), null, 12.8).to({}, { duration: 0.5 });
  return tl;
}

function delegateReplay(st) {
  const checks = ['Agent profile', 'Your consent', 'Token exchange', 'Tool scope', 'Payload policy'];
  // [request, checks passed, result, note]; the TV waits for you because it is over the spend limit
  const reqs = [
    ['Find JLab earbuds', 5, 'ok', 'allowed: purchase_read'],
    ['Add JLab earbuds · $49 · ship to Home', 5, 'ok', 'added to cart'],
    ['Add a bottle of wine', 4, 'no', 'denied: alcohol on an under-age account'],
    ['Check tomorrow’s weather', 1, 'no', 'skipped: you didn’t share weather'],
    ['Buy a $5,400 TV', 4, 'wait', 'over your $5,000 limit: asking you'],
  ];
  const WAIT = 4, LAST = reqs.length;
  st.innerHTML = `<div class="dg">
    <aside class="dg-policy">
      <p class="dg-h">Delegate access to <b>Purchase Assistant</b></p>
      <div class="dg-row"><span>Spend limit</span><b>$5,000</b></div><div class="dg-slider"><i style="width:42%"></i></div>
      <div class="dg-row"><span>Ask me beyond the limit</span><b>on</b></div>
      <div class="dg-row"><span>Scopes</span></div><div class="dg-scopes"><span class="y">purchase read</span><span class="y">purchase admin</span><span class="n">weather</span></div>
      <div class="dg-row"><span>Pays with</span><b>credit card</b></div>
      <div class="dg-row"><span>Ships to</span><b>Home</b></div>
      <button class="dg-revoke" type="button" aria-pressed="false"><span>Access</span><i></i><em>on</em></button>
    </aside>
    <div class="dg-flow">
      <div class="dg-heads"><span>Request from the agent</span>${checks.map((c) => `<span>${c}</span>`).join('')}</div>
      ${reqs.map(([q], i) => `<div class="dg-req" data-r="${i}"><span class="dg-t">${esc(q)}</span>${checks.map((_, k) => `<i data-k="${k}"></i>`).join('')}<em class="dg-out"></em></div>`).join('')}
      <div class="dg-req dg-last" data-r="${LAST}"><span class="dg-t">Add bread</span>${checks.map((_, k) => `<i data-k="${k}"></i>`).join('')}<em class="dg-out"></em></div>
    </div>
  </div>`;
  const tl = gsap.timeline();
  let t = 0.4;
  const runReq = (i, upto, res, note) => {
    const row = $(`[data-r="${i}"]`, st);
    tl.call(() => row.classList.add('in'), null, t);
    for (let k = 0; k < 5; k++) {
      const pass = k < upto;
      tl.call(() => $(`[data-k="${k}"]`, row).classList.add(pass ? 'pass' : (res === 'wait' ? 'hold' : 'stop')), null, t + 0.25 + k * 0.28);
      if (!pass) break;
    }
    const end = t + 0.25 + Math.min(upto + 1, 5) * 0.28;
    tl.call(() => { const o = $('.dg-out', row); o.textContent = note; row.classList.add(res); }, null, end);
    t = end + 0.55;
  };
  reqs.forEach(([, upto, res, note], i) => runReq(i, upto === 5 && res !== 'wait' ? 5 : upto, res, note));
  tl.call(() => { const row = $(`[data-r="${WAIT}"]`, st); row.classList.remove('wait'); row.classList.add('ok'); $('.dg-out', row).textContent = 'approved by you · order placed'; $(`[data-r="${WAIT}"] [data-k="4"]`, st).classList.replace('hold', 'pass'); }, null, t + 0.6);
  t += 1.4;
  tl.call(() => { const b = $('.dg-revoke', st); b.classList.add('off'); b.setAttribute('aria-pressed', 'true'); $('em', b).textContent = 'revoked'; }, null, t);
  t += 0.8;
  runReq(LAST, 2, 'no', 'token exchange failed: access revoked, agent cut off');
  tl.to({}, { duration: 0.4 });
  return tl;
}

function tokensReplay(st) {
  const kinds = [['u', 84], ['d', 150], ['v', 100], ['i', 86]];
  let blocks = [];
  kinds.forEach(([k, n]) => { for (let j = 0; j < Math.round(n / 3); j++) blocks.push(k); });
  blocks = blocks.map((k, i) => ({ k, r: (Math.sin(i * 12.9898) * 43758.5453) % 1 })).sort((a, b) => a.r - b.r).map((b) => b.k);
  const steps = [['Dedupe', 48210, 31400, 'd', '150 duplicate blocks became 6 stubs'], ['Summarise', 31400, 17900, 'v', '100 verbose blocks became 14 summaries'], ['Prune', 17900, 9640, 'i', '86 irrelevant blocks dropped']];
  const entries = tokenos.ledger.entries;
  st.innerHTML = `<div class="tk">
    <div class="tk-win"><div class="tk-head"><span>context window</span><b class="tk-n">48,210</b><span>tokens</span></div>
      <div class="tk-grid">${blocks.map((k) => `<i class="b-${k}"></i>`).join('')}</div>
      <div class="tk-legend"><span class="b-u">useful</span><span class="b-d">duplicate</span><span class="b-v">verbose</span><span class="b-i">irrelevant</span></div>
      <ol class="tk-steps">${steps.map(([n, , , , w], i) => `<li data-st="${i}"><b>${n}</b><span>${w}</span></li>`).join('')}<li data-st="3"><b>Route</b><span>this turn goes to the cheapest capable model: <em class="tk-model">Haiku</em></span></li></ol>
    </div>
    <div class="tk-ledger"><p class="tk-lh">Ledger <code>token-os ledger tail</code></p>
      <div class="tk-rows">${entries.map(([n, base, act], i) => `<div class="tk-row" data-l="${i}"><span>${esc(n)}</span><span>${fmt(base)} → ${fmt(act)}</span><b>−${Math.round((1 - act / base) * 100)}%</b><code class="tk-hash">········</code></div>`).join('')}</div>
      <p class="tk-verify" data-l="v"><code>token-os ledger verify</code> <b>✓ chain intact</b></p>
    </div>
  </div>`;
  const n = $('.tk-n', st), counter = { v: 48210 };
  const tl = gsap.timeline();
  let t = 0.6;
  steps.forEach(([, from, to, k], i) => {
    tl.call(() => $(`[data-st="${i}"]`, st).classList.add('on'), null, t)
      .call(() => $$(`.tk-grid .b-${k}`, st).forEach((b, j) => { if (k !== 'v' || j % 7) b.classList.add('gone'); else b.classList.add('kept'); }), null, t + 0.2)
      .call(() => $$('.tk-grid .gone', st).forEach((b) => { b.hidden = true; }), null, t + 0.8)
      .to(counter, { v: to, duration: 1.1, ease: 'power2.out', onUpdate: () => { n.textContent = fmt(counter.v); } }, t + 0.2);
    t += 1.7;
  });
  tl.call(() => $('[data-st="3"]', st).classList.add('on'), null, t);
  t += 0.9;
  let prev = 'genesis';
  entries.forEach((e, i) => {
    tl.call(async () => {
      const row = $(`[data-l="${i}"]`, st);
      row.classList.add('in');
      try {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(prev + e.join('|')));
        prev = [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('');
        $('.tk-hash', row).textContent = prev.slice(0, 8);
      } catch (_) { $('.tk-hash', row).textContent = 'a3f9c2e1'; }
    }, null, t + i * 0.35);
  });
  tl.call(() => $('[data-l="v"]', st).classList.add('in'), null, t + entries.length * 0.35 + 0.3).to({}, { duration: 0.4 });
  return tl;
}

function mimoReplay(st) {
  st.innerHTML = `<div class="mm">
    <div class="mm-app"><div class="mm-chrome"><i></i><i></i><i></i><span>github.com</span><span class="mm-rec"><i></i>mimo recording</span></div>
      <div class="mm-page"><nav class="mm-nav"><span data-c="0">Pull requests</span><span>Issues</span><span>Actions</span></nav>
        <div class="mm-filter"><span data-c="1">Author: anyone ▾</span></div>
        <ul class="mm-list"><li>Fix OTP retry config <em>#4821</em></li><li>Add passkey fallback <em>#4815</em></li><li>Bump token-OS plugin <em>#4810</em></li></ul>
        <span class="mm-cursor" aria-hidden="true"></span></div></div>
    <div class="mm-tracks">
      <div class="mm-track" data-t="act"><b>Actions</b><div></div></div>
      <div class="mm-track" data-t="say"><b>Narration</b><div></div></div>
      <div class="mm-track" data-t="ax"><b>Accessibility</b><div></div></div>
    </div>
    <div class="mm-skill"><p class="mm-sh">my-open-prs / SKILL.md <small>written by your agent</small></p><pre class="mm-code"></pre>
      <div class="mm-end"><span class="mm-approve">Approve</span><span class="mm-chat"><span class="mm-bub">show my open PRs</span><span class="mm-ran">✓ ran my-open-prs</span></span></div></div>
  </div>`;
  const cursor = $('.mm-cursor', st);
  const at = (sel) => { const r = $(sel, st).getBoundingClientRect(), p = $('.mm-page', st).getBoundingClientRect(); return { x: r.left - p.left + r.width / 2, y: r.top - p.top + r.height / 2 }; };
  const chip = (t, html) => { const d = document.createElement('span'); d.className = 'mm-chip'; d.innerHTML = html; $(`[data-t="${t}"] div`, st).appendChild(d); };
  const code = '1. gh pr list --author @me --state open\n2. if not signed in: gh auth login\n3. fallback: open github.com/pulls';
  const tl = gsap.timeline();
  tl.set(cursor, { x: 20, y: 150 })
    .to(cursor, { x: () => at('[data-c="0"]').x, y: () => at('[data-c="0"]').y, duration: 0.9, ease: 'power2.inOut' }, 0.4)
    .call(() => { $('[data-c="0"]', st).classList.add('hit'); chip('act', 'click <b>Pull requests</b>'); chip('say', '“open the pull requests tab”'); chip('ax', 'AXLink · Pull requests'); }, null, 1.35)
    .to(cursor, { x: () => at('[data-c="1"]').x, y: () => at('[data-c="1"]').y, duration: 0.8, ease: 'power2.inOut' }, 1.8)
    .call(() => { const f = $('[data-c="1"]', st); f.classList.add('hit'); f.textContent = 'Author: me ▾'; chip('act', 'select <b>Author: me</b>'); chip('say', '“just mine, the open ones”'); chip('ax', 'AXPopUpButton · Author'); $('.mm-list', st).classList.add('mine'); }, null, 2.65)
    .call(() => st.querySelector('.mm-skill').classList.add('in'), null, 3.5);
  const pre = $('.mm-code', st), typed = { n: 0 };
  tl.to(typed, { n: code.length, duration: 2.2, ease: 'none', onUpdate: () => { pre.textContent = code.slice(0, Math.round(typed.n)); } }, 3.8)
    .call(() => $('.mm-approve', st).classList.add('on'), null, 6.3)
    .call(() => $('.mm-chat', st).classList.add('in'), null, 7.1)
    .call(() => $('.mm-ran', st).classList.add('in'), null, 7.9).to({}, { duration: 0.4 });
  return tl;
}

const replays = { grid: gridReplay, delegate: delegateReplay, tokens: tokensReplay, mimo: mimoReplay };

/* =====================================================================
   Wiring
   ===================================================================== */
export function initLab({ reduced, lenis }) {
  $('#bench').innerHTML = benchHTML();

  // idle life on the bench: the press counter keeps compressing
  const n = $('.dv-press [data-count]');
  if (n && !reduced) {
    const c = { v: 48210 };
    gsap.timeline({ repeat: -1, repeatDelay: 1.2 }).to(c, { v: 9640, duration: 2.6, ease: 'power2.inOut', onUpdate: () => { n.textContent = fmt(c.v); } }).to({}, { duration: 1.2 }).set(c, { v: 48210, onComplete: () => { n.textContent = '48,210'; } });
  }

  const sheet = $('#case'), body = $('#case-body'), scroller = $('#case-scroll');
  let current = null, tl = null, opener = null, pushed = false, hiding = false, flow = null;

  let watch = null;
  function play(p, now = false) {
    tl?.kill(); watch?.disconnect();
    const st = $('#cs-stage', body);
    tl = replays[p.id](st);
    if (reduced) { tl.progress(1); return; }
    if (now) return;
    // hold the replay until its stage is actually on screen
    tl.pause(0);
    watch = new IntersectionObserver(([e]) => { if (e.isIntersecting) { tl.play(); watch.disconnect(); } }, { root: scroller, threshold: 0.35 });
    watch.observe(st);
  }
  function render(id) {
    const p = lab.find((x) => x.id === id);
    if (!p) return false;
    current = id;
    flow?.kill(); flow = null;
    body.innerHTML = caseHTML(p);
    if (p.id === 'grid') flow = mountGridFlow(body, { reduced, scroller });
    if (p.id === 'delegate') flow = mountDelegateFlow(body, { reduced, scroller });
    $('#case-crumb').textContent = `${p.kind} · ${p.name}`;
    scroller.scrollTop = 0;
    play(p);
    return true;
  }
  function open(id, push = true) {
    const wasOpen = !sheet.hidden && !hiding;
    if (!render(id)) return;
    sfx(wasOpen ? 'paper' : 'open');
    gsap.killTweensOf(sheet); hiding = false;
    const url = `#/lab/${id}`;
    if (push) { history.pushState({ lab: id }, '', url); pushed = true; } else if (location.hash !== url) history.replaceState({ lab: id }, '', url);
    if (!wasOpen) {
      if (sheet.hidden) opener = document.activeElement;
      sheet.hidden = false;
      document.documentElement.classList.add('case-open');
      lenis?.stop();
      if (!reduced) gsap.fromTo(sheet, { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: 'power3.out' });
      setTimeout(() => $('.case-back', sheet).focus({ preventScroll: true }), 50);
    } else if (!reduced) gsap.fromTo(body, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out', clearProps: 'all' });
  }
  function hide() {
    if (sheet.hidden || hiding) return;
    hiding = true;
    tl?.kill(); watch?.disconnect();
    const done = () => { hiding = false; sheet.hidden = true; document.documentElement.classList.remove('case-open'); lenis?.start(); current = null; opener?.focus?.({ preventScroll: true }); };
    if (reduced) done(); else gsap.to(sheet, { yPercent: 100, duration: 0.55, ease: 'power3.in', onComplete: done });
  }
  function close() {
    sfx('close');
    if (pushed) { pushed = false; history.back(); } else { history.replaceState(null, '', `${location.pathname}#lab`); hide(); }
  }
  const fromHash = () => (location.hash.match(/^#\/lab\/(\w+)/) || [])[1];

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-case]');
    if (t) { e.preventDefault(); open(t.dataset.case, current === null); return; }
    if (e.target.closest('.case-back')) close();
    const nav = e.target.closest('[data-step]');
    if (nav && current) { const i = lab.findIndex((x) => x.id === current); open(lab[(i + +nav.dataset.step + lab.length) % lab.length].id, false); }
    if (e.target.closest('.cs-replay') && current) play(lab.find((x) => x.id === current), true);
  });
  addEventListener('popstate', () => { const id = fromHash(); if (id) open(id, false); else { pushed = false; hide(); } });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) close(); });
  const initial = fromHash();
  if (initial) open(initial, false);
}
