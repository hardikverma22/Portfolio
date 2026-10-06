// tokenOs deep dive: capabilities, benchmark and an interactive hash-chained ledger.
import { tokenos as T } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmt = (n) => n.toLocaleString('en-US');
const saved = (a, b) => Math.floor((1 - b / a) * 100);

const h32 = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
};

function capBody(c) {
  if (c.bars) {
    return `<div class="tc-bars">${c.bars.map(([l, a, b]) => `
      <div class="tc-bar">
        <div class="tc-bar-h"><span>${l}</span><b>${fmt(a)} <i>→</i> ${fmt(b)} <small>tokens</small></b></div>
        <div class="tc-track"><span class="was"></span><span class="now" style="--w:${Math.max(2, (b / a) * 100)}%"></span></div>
        <em class="tc-pct">−${saved(a, b)}%</em>
      </div>`).join('')}</div>`;
  }
  if (c.compare) {
    return `<div class="tc-cmp">${c.compare.map(([l, v], i) => `<div class="${i ? 'now' : 'was'}"><span>${l}</span><b>${v}</b></div>`).join('<i class="tc-arr" aria-hidden="true">→</i>')}</div>`;
  }
  if (c.layers) {
    return `<ul class="tc-layers">${c.layers.map(([k, v]) => `<li><b>${k}</b><span>${v}</span></li>`).join('')}</ul>`;
  }
  if (c.tiers) {
    return `<ul class="tc-tiers">${c.tiers.map(([m, i]) => `<li><b>${m}</b><span>${i}</span></li>`).join('')}</ul>`;
  }
  return '';
}

function ledgerHtml() {
  return `
    <div class="tl-chain" id="tl-chain" role="list" aria-label="Sample ledger entries"></div>
    <div class="tl-bar">
      <div class="tl-btns">
        <button class="btn btn-solid" id="tl-verify" type="button">Verify chain</button>
        <button class="btn btn-ghost" id="tl-tamper" type="button">Tamper with entry 2</button>
        <button class="btn btn-ghost" id="tl-reset" type="button">Reset</button>
      </div>
      <p class="tl-msg mono" id="tl-msg" aria-live="polite">Sample entries. Hashes are computed live in your browser.</p>
    </div>`;
}

export function renderTokenos(root) {
  const bench = T.bench;
  root.innerHTML = `
    <div class="tos-head">
      <div><p class="tos-k mono">${T.intro.k}</p><h3 class="tos-t">${T.intro.t}</h3></div>
      <div><p class="tos-d">${T.intro.d}</p><p class="tos-q">${T.intro.q}</p></div>
    </div>

    <div class="tos-axes">
      ${T.axes.map((a) => `
        <article class="tos-axis">
          <span class="mono tos-n">${a.n}</span>
          <h4>${a.t}</h4>
          <p>${a.d}</p>
          <div class="tos-v"><b>${a.v}</b><span>${a.vl}</span></div>
        </article>`).join('<div class="tos-x" aria-hidden="true">×</div>')}
    </div>
    <p class="tos-axisnote mono">${T.axisNote}</p>

    <div class="tos-caps">
      ${T.caps.map((c, i) => `
        <article class="tc" style="--c:${c.c}">
          <header><span class="tc-n mono">${String(i + 1).padStart(2, '0')}</span><code class="tc-tool">${c.tool}</code></header>
          <h4>${c.t}</h4>
          <p class="tc-human">${c.human}</p>
          <p class="tc-body">${c.body}</p>
          <div class="tc-viz">${capBody(c)}</div>
          ${c.note ? `<p class="tc-note">${c.note}</p>` : ''}
        </article>`).join('')}
    </div>

    <div class="tos-bench">
      <div class="tb-head"><h4>${bench.title}</h4><p class="mono">${bench.sub}</p></div>
      ${bench.groups.map(([g, rows]) => `
        <div class="tb-group">
          <p class="tb-g mono">${g}</p>
          ${rows.map(([l, a, b, pct, r]) => `
            <div class="tb-row">
              <span class="tb-l">${l}</span>
              <div class="tb-bars"><div class="tb-was"><i></i><em>${a}</em></div><div class="tb-now"><i style="--w:${Math.max(2, r * 100)}%"></i><em>${b}</em></div></div>
              <b class="tb-d">−${pct}%</b>
            </div>`).join('')}
        </div>`).join('')}
    </div>

    <div class="tos-ledger">
      <div class="tl-copy">
        <h4>${T.ledger.t}</h4>
        <p>${T.ledger.d}</p>
        <div class="tl-cmds">${T.ledger.cmds.map((c) => `<code>${c}</code>`).join('')}</div>
      </div>
      <div class="tl-demo">${ledgerHtml()}</div>
    </div>

    <div class="tos-ships">
      <ul class="chips">${T.ships.map((s) => `<li>${s}</li>`).join('')}</ul>
      <div class="tos-tools">
        <div><p class="mono">core · always on</p><div>${T.tools.core.map((t) => `<code>${t}</code>`).join('')}</div></div>
        <div><p class="mono">graph · on by default</p><div>${T.tools.graph.map((t) => `<code>${t}</code>`).join('')}</div></div>
      </div>
    </div>`;

  // bars grow when they scroll into view
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.25 });
  $$('.tc, .tos-bench, .tos-axes', root).forEach((n) => io.observe(n));

  initLedger(root);
}

function initLedger(root) {
  const chain = $('#tl-chain', root), msg = $('#tl-msg', root);
  const mk = () => {
    let prev = '00000000';
    return T.ledger.entries.map(([tool, base, actual]) => {
      const e = { tool, base, actual, prev };
      e.hash = h32(`${e.prev}|${e.tool}|${e.base}|${e.actual}`);
      prev = e.hash;
      return e;
    });
  };
  let rows = mk(), state = rows.map(() => 'idle'), tampered = -1;

  const draw = () => {
    chain.innerHTML = rows.map((r, i) => `
      <div class="tl-b ${state[i]}" role="listitem">
        <span class="tl-i mono">#${i + 1}</span>
        <b>${r.tool}</b>
        <span class="tl-n">${fmt(r.base)} <i>→</i> ${fmt(r.actual)}</span>
        <span class="tl-s">saved ${fmt(r.base - r.actual)}</span>
        <code title="previous hash">← ${r.prev.slice(0, 6)}</code>
        <code title="this row's hash" class="tl-h">${r.hash.slice(0, 6)}</code>
        <span class="tl-st mono">${state[i] === 'ok' ? 'verified' : state[i] === 'bad' ? 'hash mismatch' : state[i] === 'edit' ? 'edited' : state[i] === 'chk' ? 'checking' : ''}</span>
      </div>`).join('');
  };

  const verify = async () => {
    msg.textContent = 'Re-hashing the whole chain…';
    state = state.map((s) => (s === 'edit' ? 'edit' : 'idle'));
    draw();
    let broken = -1, prevHash = '00000000';
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      state[i] = broken >= 0 ? 'bad' : 'chk';
      draw();
      await new Promise((res) => setTimeout(res, 320));
      const calc = h32(`${prevHash}|${r.tool}|${r.base}|${r.actual}`);
      if (broken < 0 && (r.prev !== prevHash || r.hash !== calc)) broken = i;
      state[i] = broken >= 0 && broken <= i ? 'bad' : i === tampered ? 'edit' : 'ok';
      if (i === tampered && broken < 0) state[i] = 'ok';
      draw();
      prevHash = r.hash;
    }
    msg.textContent = broken < 0
      ? `All ${rows.length} entries verified. Every hash chains to the one before it.`
      : `Chain broken at entry ${broken + 1}. Entry ${tampered + 1} was altered, so every later hash fails.`;
  };

  const tamper = () => {
    if (tampered >= 0) return;
    tampered = 1;
    const r = rows[1];
    r.actual = 2400;
    r.hash = h32(`${r.prev}|${r.tool}|${r.base}|${r.actual}`); // a careful forger re-hashes their own row
    state = rows.map((_, i) => (i === 1 ? 'edit' : 'idle'));
    msg.textContent = 'Entry 2 now claims 2,400 tokens, not 13. Press verify.';
    draw();
  };
  const reset = () => { rows = mk(); state = rows.map(() => 'idle'); tampered = -1; msg.textContent = 'Sample entries. Hashes are computed live in your browser.'; draw(); };

  $('#tl-verify', root).addEventListener('click', verify);
  $('#tl-tamper', root).addEventListener('click', tamper);
  $('#tl-reset', root).addEventListener('click', reset);
  draw();
}
