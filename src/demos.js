// Three re-enactments of real systems, running entirely in the browser.
import { triage, delegate } from './data.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const h = (tag, cls, html) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html != null) el.innerHTML = html;
  return el;
};
const rand = (a, b) => a + Math.random() * (b - a);
const b64 = (n) => {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let s = '';
  for (let i = 0; i < n; i++) s += c[(Math.random() * 64) | 0];
  return s;
};

/* =========================================================
   01 · Multi-agent triage
   ========================================================= */
export function mountTriage(root, trace) {
  const inc = triage.incident;
  root.innerHTML = `
    <div class="demo-bar">
      <span class="lights"><i></i><i></i><i></i></span>
      <span>triage.supervisor, human-in-the-loop</span>
      <span class="sp"></span>
      <button class="dbtn solid" data-run data-cursor="run">▶ Dispatch</button>
      <button class="dbtn" data-reset>Reset</button>
    </div>
    <div class="tri-inc">
      <span><span class="sev">${inc.sev}</span><b>${inc.id}</b> · ${inc.title}</span>
      <span class="muted">${inc.source}</span>
    </div>
    <div class="tri-graph"><svg aria-hidden="true"></svg></div>
    <div class="tri-lanes"></div>
    <div class="tri-foot">
      <div class="tri-verdict" aria-live="polite"><span class="muted">Supervisor idle. Press dispatch to plan and fan out.</span></div>
      <div class="tri-clock"><div class="big" data-clock>0:00</div><div class="cmp">manual triage <s>~60:00</s></div></div>
    </div>
    <div class="tri-hitl">
      <button class="dbtn solid" data-act="approve">Approve fix</button>
      <button class="dbtn" data-act="redirect">Redirect</button>
      <button class="dbtn" data-act="takeover">Take over</button>
    </div>`;

  const graph = root.querySelector('.tri-graph');
  const svg = graph.querySelector('svg');
  const lanes = root.querySelector('.tri-lanes');
  const verdict = root.querySelector('.tri-verdict');
  const clockEl = root.querySelector('[data-clock]');
  const hitl = root.querySelector('.tri-hitl');
  const runBtn = root.querySelector('[data-run]');

  const sup = h('div', 'tri-node sup', 'supervisor');
  sup.style.left = '50%'; sup.style.top = '14%';
  graph.appendChild(sup);
  const nodes = [], edges = [], laneEls = [];
  triage.agents.forEach((a, i) => {
    const x = 10 + i * 20;
    const n = h('div', 'tri-node', a.id);
    n.style.left = x + '%'; n.style.top = '84%';
    graph.appendChild(n); nodes.push(n);
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('class', 'edge');
    svg.appendChild(p); edges.push({ p, x });
    const lane = h('div', 'lane', `<h4>${a.name}<small>${a.mcp}</small></h4>`);
    lanes.appendChild(lane); laneEls.push(lane);
  });
  const drawEdges = () => {
    const w = graph.clientWidth, H = graph.clientHeight;
    edges.forEach(({ p, x }) => {
      const x1 = w / 2, y1 = H * 0.14 + 10, x2 = (x / 100) * w, y2 = H * 0.84 - 10;
      p.setAttribute('d', `M${x1},${y1} C${x1},${(y1 + y2) / 2} ${x2},${(y1 + y2) / 2} ${x2},${y2}`);
    });
  };
  drawEdges();
  new ResizeObserver(drawEdges).observe(graph);

  let run = 0, t0 = 0, raf = 0;
  const tick = () => {
    // compress time: 1 real second ≈ 27 simulated seconds
    const s = Math.floor(((performance.now() - t0) / 1000) * 27);
    clockEl.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    raf = requestAnimationFrame(tick);
  };

  const reset = () => {
    run++;
    cancelAnimationFrame(raf);
    clockEl.textContent = '0:00';
    sup.classList.remove('on', 'done');
    nodes.forEach((n) => n.classList.remove('on', 'done'));
    edges.forEach(({ p }) => p.setAttribute('class', 'edge'));
    laneEls.forEach((l) => l.querySelectorAll('p').forEach((p) => p.remove()));
    verdict.innerHTML = '<span class="muted">Supervisor idle. Press dispatch to plan and fan out.</span>';
    hitl.classList.remove('on');
    runBtn.disabled = false;
  };

  const go = async () => {
    reset();
    const id = run;
    runBtn.disabled = true;
    t0 = performance.now(); tick();
    sup.classList.add('on');
    verdict.innerHTML = '<span class="k">plan ▸</span> classify incident · retrieve similar incidents from KB · fan out to 5 specialists in parallel';
    trace?.('triage', `supervisor.plan(${inc.id})`);
    await sleep(900);
    if (id !== run) return;
    await Promise.all(triage.agents.map(async (a, i) => {
      await sleep(i * 140);
      if (id !== run) return;
      nodes[i].classList.add('on');
      edges[i].p.setAttribute('class', 'edge on');
      for (const line of a.lines) {
        await sleep(rand(450, 1100));
        if (id !== run) return;
        laneEls[i].appendChild(h('p', '', line));
      }
      nodes[i].classList.remove('on'); nodes[i].classList.add('done');
      edges[i].p.setAttribute('class', 'edge done');
      trace?.('triage', `agent:${a.id} ✓ ${a.lines.length} findings`);
    }));
    if (id !== run) return;
    verdict.innerHTML = '<span class="k">synthesising ▸</span> correlating findings across agents…';
    await sleep(900);
    if (id !== run) return;
    cancelAnimationFrame(raf);
    sup.classList.remove('on'); sup.classList.add('done');
    verdict.innerHTML = `<span class="k">verdict ▸</span> ${triage.verdict}`;
    hitl.classList.add('on');
    trace?.('triage', 'awaiting human approval');
  };

  runBtn.addEventListener('click', go);
  root.querySelector('[data-reset]').addEventListener('click', reset);
  hitl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    verdict.innerHTML = {
      approve: '<span class="k">approved ▸</span> fix opened behind a flag · status update sent · runbook updated with this incident.',
      redirect: '<span class="k">redirected ▸</span> supervisor re-planning with your hint, checking the messaging client’s connection pool next.',
      takeover: '<span class="k">handed over ▸</span> full trace, HAR, diffs and timeline exported to you. Agents standing by.',
    }[b.dataset.act];
    hitl.classList.remove('on');
    runBtn.disabled = false;
    trace?.('triage', `human.${b.dataset.act}()`);
  });

  return { autoplay: () => !runBtn.disabled && go() };
}

/* =========================================================
   02 · Delegated access
   ========================================================= */
export function mountDelegate(root, trace) {
  const state = {
    cap: 150,
    blocked: new Set(['Alcohol', 'Gift cards']),
    tools: { search: true, cart: true, order: true },
    active: true,
  };

  root.innerHTML = `
    <div class="demo-bar">
      <span class="lights"><i></i><i></i><i></i></span>
      <span>agent-gateway · policy enforced on every call</span>
      <span class="sp"></span>
      <button class="dbtn solid" data-run data-cursor="run">▶ Let the agent shop</button>
    </div>
    <div class="dg">
      <div class="dg-panel">
        <h4>Agent permissions</h4>
        <p class="s mono">your profile · changes apply on the next request</p>
        <div class="dg-row">
          <label for="dg-cap"><span>Spend cap</span><b data-cap>$150</b></label>
          <input id="dg-cap" type="range" min="0" max="300" step="10" value="150" />
        </div>
        <div class="dg-row">
          <label><span>Blocked categories</span></label>
          <div class="cats">${delegate.categories.map((c) => `<button class="cat" aria-pressed="${state.blocked.has(c)}" data-cat="${c}">${c}</button>`).join('')}</div>
        </div>
        <div class="dg-row">
          <label><span>Tool consent</span></label>
          ${delegate.tools.map((t) => `<div class="tool"><span>${t.label}<span class="risk ${t.risk}">${t.risk === 'high' ? 'needs approval' : 'low risk'}</span></span><button class="tg" role="switch" aria-checked="true" aria-label="${t.label}" data-tool="${t.id}"></button></div>`).join('')}
        </div>
        <div class="dg-revoke" data-rv>
          <span><b>Agent access</b><br /><span class="muted" data-rvs>active · revoke anytime</span></span>
          <button class="tg" role="switch" aria-checked="true" aria-label="Agent access" data-access data-cursor="revoke"></button>
        </div>
      </div>
      <div class="dg-console">
        <div class="layers">${delegate.layers.map((l) => `<div class="layer">${l}</div>`).join('')}</div>
        <div class="dg-log" aria-live="polite"><div class="sys">// Press “Let the agent shop”. Then change the policy, or revoke, mid-run.</div></div>
      </div>
    </div>`;

  const log = root.querySelector('.dg-log');
  const layers = [...root.querySelectorAll('.layer')];
  const capOut = root.querySelector('[data-cap]');
  const runBtn = root.querySelector('[data-run]');

  root.querySelector('#dg-cap').addEventListener('input', (e) => { state.cap = +e.target.value; capOut.textContent = '$' + state.cap; });
  root.querySelectorAll('[data-cat]').forEach((b) => b.addEventListener('click', () => {
    const c = b.dataset.cat;
    state.blocked.has(c) ? state.blocked.delete(c) : state.blocked.add(c);
    b.setAttribute('aria-pressed', state.blocked.has(c));
  }));
  root.querySelectorAll('[data-tool]').forEach((b) => b.addEventListener('click', () => {
    const t = b.dataset.tool;
    state.tools[t] = !state.tools[t];
    b.setAttribute('aria-checked', state.tools[t]);
  }));
  const access = root.querySelector('[data-access]');
  const rv = root.querySelector('[data-rv]');
  access.addEventListener('click', () => {
    state.active = !state.active;
    access.setAttribute('aria-checked', state.active);
    rv.classList.toggle('off', !state.active);
    root.querySelector('[data-rvs]').textContent = state.active ? 'active · revoke anytime' : 'revoked · next exchange will fail';
    line(state.active ? 'sys' : 'no', state.active ? '// access re-granted by user' : '// user revoked agent access, no code change, no redeploy');
    trace?.('gateway', state.active ? 'grant restored' : 'grant revoked');
  });

  function line(cls, html) {
    const d = h('div', cls, html);
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  const setLayer = (i, cls) => { layers[i].className = 'layer' + (cls ? ' ' + cls : ''); };
  const clearLayers = () => layers.forEach((_, i) => setLayer(i, ''));

  function approve(amount) {
    return new Promise((res) => {
      const card = h('div', 'approve', `<p>Agent wants to <b>place_order</b> for <b>$${amount}</b>. This needs you.</p><div class="gate-btns"><button class="dbtn solid" data-y>Approve</button><button class="dbtn" data-n>Reject</button></div>`);
      log.appendChild(card); log.scrollTop = log.scrollHeight;
      card.querySelector('[data-y]').onclick = () => { card.remove(); res(true); };
      card.querySelector('[data-n]').onclick = () => { card.remove(); res(false); };
    });
  }

  let running = false;
  async function go() {
    if (running) return;
    running = true; runBtn.disabled = true;
    log.innerHTML = '';
    let total = 0;
    line('sys', `// session start · cap $${state.cap} · blocked [${[...state.blocked].join(', ') || 'none'}]`);
    for (const step of delegate.script) {
      clearLayers();
      line('say', step.say + (step.amount ? ` <span class="muted">($${step.amount}, ${step.cat})</span>` : ''));
      await sleep(500);
      setLayer(0, 'chk'); await sleep(220); setLayer(0, 'pass');
      setLayer(1, 'chk'); await sleep(220);
      if (!state.tools[step.tool]) { setLayer(1, 'fail'); line('no', `✗ consent: user has not allowed ${step.tool}`); await sleep(700); continue; }
      setLayer(1, 'pass');
      setLayer(2, 'chk'); await sleep(320);
      if (!state.active) {
        setLayer(2, 'fail');
        line('no', '✗ token exchange → 400 invalid_grant · delegation revoked');
        line('sys', '// agent is cut off. it never held your credential, so there is nothing to leak.');
        trace?.('gateway', 'exchange failed: revoked');
        break;
      }
      setLayer(2, 'pass');
      line('tok', `↳ delegated token eyJ${b64(10)}… act.sub=shopping-agent scope=${step.tool}`);
      setLayer(3, 'chk'); await sleep(220); setLayer(3, 'pass');
      setLayer(4, 'chk'); await sleep(260);
      if (state.blocked.has(step.cat)) { setLayer(4, 'fail'); line('no', `✗ policy: item.category in blocked ["${step.cat}"]`); await sleep(700); continue; }
      if (step.tool === 'cart' && total + step.amount > state.cap) { setLayer(4, 'fail'); line('no', `✗ policy: cart.total + ${step.amount} > cap ${state.cap}`); await sleep(700); continue; }
      setLayer(4, 'pass');
      if (step.tool === 'order') {
        const ok = await approve(total || step.amount);
        if (!ok) { line('no', '✗ rejected by human · graph halts, model cannot route around it'); break; }
        line('ok', `✓ order placed · $${total || step.amount} · receipt in your profile`);
        trace?.('gateway', 'order approved by human');
        break;
      }
      if (step.tool === 'cart') total += step.amount;
      line('ok', step.tool === 'search' ? '✓ 12 results' : `✓ added · cart $${total}`);
      await sleep(500);
    }
    clearLayers();
    running = false; runBtn.disabled = false;
  }
  runBtn.addEventListener('click', go);
  return { autoplay: () => {} };
}

/* =========================================================
   03 · Token compression
   ========================================================= */
export function mountTokens(root, trace) {
  const words = {
    keep: ['task:', 'fix', 'flaky', 'test', 'auth.ts', 'L42-88', 'verifyOtp()', 'diff', '+12', '−3', 'error:', 'timeout', 'expect()', 'mock', 'retry', 'config.ts', 'user', 'intent', 'repo map', 'symbols', 'session', 'goal'],
    dup: ['import React', 'import React', 'README.md', 'README.md', 'package.json', 'package.json', 'same diff', 'same diff', 'tsconfig', 'tsconfig'],
    verbose: ['[INFO] GET /health 200', '[DEBUG] pool size=10', '[INFO] GET /health 200', 'stack frame #14', 'stack frame #15', 'node_modules/…', '[TRACE] tick', 'lockfile hunk'],
    cold: ['docs/legacy/*.md', 'assets/logo.svg', 'CHANGELOG 2019', 'i18n/fr.json', 'vendor.min.js', '.github/*'],
  };
  const plan = [['keep', 44], ['dup', 40], ['verbose', 46], ['cold', 30]];
  const chips = [];
  plan.forEach(([k, n]) => { for (let i = 0; i < n; i++) chips.push({ k, w: words[k][(Math.random() * words[k].length) | 0] }); });
  chips.sort(() => Math.random() - 0.5);

  root.innerHTML = `
    <div class="demo-bar">
      <span class="lights"><i></i><i></i><i></i></span>
      <span>context window · before the next LLM call</span>
      <span class="sp"></span>
      <button class="dbtn solid" data-run data-cursor="run">▶ Compress</button>
      <button class="dbtn" data-reset>Reset</button>
    </div>
    <div class="tk-meter"><div class="tk-num" data-n>48,210<small>tokens</small></div><div class="tk-pct" data-p>baseline</div></div>
    <div class="tk-bar"><span data-bar></span></div>
    <div class="tk-field"></div>
    <div class="tk-legend">
      <span><i style="background:rgba(231,196,106,.4)"></i>duplicate</span>
      <span><i style="background:rgba(127,178,255,.4)"></i>verbose</span>
      <span><i style="background:rgba(255,122,138,.4)"></i>irrelevant</span>
      <span><i style="background:#6ad19a"></i>summary</span>
    </div>
    <div class="tk-stages">${['dedupe', 'summarise', 'route', 'explain'].map((s, i) => `<span class="tk-stage" data-s="${i}">${i + 1} · ${s}</span>`).join('')}</div>`;

  const field = root.querySelector('.tk-field');
  const numEl = root.querySelector('[data-n]');
  const pctEl = root.querySelector('[data-p]');
  const bar = root.querySelector('[data-bar]');
  const stages = [...root.querySelectorAll('.tk-stage')];
  const runBtn = root.querySelector('[data-run]');
  const BASE = 48210;

  let els = [], cur = BASE, anim = 0, run = 0;
  const build = () => {
    field.innerHTML = '';
    els = chips.map((c) => {
      const el = h('span', 'tk' + (c.k === 'keep' ? '' : ' ' + c.k), c.w);
      field.appendChild(el);
      return { el, k: c.k };
    });
  };
  const setCount = (to) => {
    const from = cur, t0 = performance.now();
    cancelAnimationFrame(anim);
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / 900);
      const e = 1 - Math.pow(1 - k, 3);
      cur = Math.round(from + (to - from) * e);
      numEl.innerHTML = cur.toLocaleString('en-US') + '<small>tokens</small>';
      const pct = Math.round((1 - cur / BASE) * 100);
      pctEl.textContent = pct ? `−${pct}%` : 'baseline';
      bar.style.width = (cur / BASE) * 100 + '%';
      if (k < 1) anim = requestAnimationFrame(step);
    };
    step();
  };
  const reset = () => {
    run++;
    build(); cur = BASE; setCount(BASE);
    stages.forEach((s) => (s.className = 'tk-stage'));
    runBtn.disabled = false;
  };
  const go = async () => {
    reset();
    const id = run;
    runBtn.disabled = true;
    const stage = async (i, kind, to, fn) => {
      stages[i].classList.add('on');
      await sleep(350);
      if (id !== run) return false;
      const list = els.filter((e) => e.k === kind);
      list.forEach((e, j) => setTimeout(() => (fn ? fn(e, j) : e.el.classList.add('gone')), j * 18));
      setCount(to);
      await sleep(list.length * 18 + 700);
      stages[i].classList.remove('on'); stages[i].classList.add('done');
      return id === run;
    };
    if (!(await stage(0, 'dup', 32440))) return;
    if (!(await stage(1, 'verbose', 17120, (e, j) => {
      if (j % 9 === 0) { e.el.className = 'tk sum'; e.el.textContent = ['logs: 2 errors, 0 new', 'trace: timeout @verify', 'deps unchanged', 'health ok ×40', 'stack: auth.ts:61', 'lockfile: no-op'][(j / 9) % 6 | 0]; }
      else e.el.classList.add('gone');
    }))) return;
    if (!(await stage(2, 'cold', 9640))) return;
    stages[3].classList.add('on');
    pctEl.innerHTML = '−80% · <span class="muted">every cut is logged and explainable</span>';
    await sleep(500);
    stages[3].classList.remove('on'); stages[3].classList.add('done');
    runBtn.disabled = false;
    trace?.('tokens', 'context 48,210 → 9,640');
  };
  build();
  runBtn.addEventListener('click', go);
  root.querySelector('[data-reset]').addEventListener('click', reset);
  return { autoplay: () => !runBtn.disabled && cur === BASE && go() };
}
