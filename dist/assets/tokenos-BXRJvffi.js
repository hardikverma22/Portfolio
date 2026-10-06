import{p as e}from"./index-B2SiabPq.js";var t=(e,t=document)=>t.querySelector(e),n=(e,t=document)=>[...t.querySelectorAll(e)],r=e=>e.toLocaleString(`en-US`),i=(e,t)=>Math.floor((1-t/e)*100),a=e=>{let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619)>>>0;return t.toString(16).padStart(8,`0`)};function o(e){return e.bars?`<div class="tc-bars">${e.bars.map(([e,t,n])=>`
      <div class="tc-bar">
        <div class="tc-bar-h"><span>${e}</span><b>${r(t)} <i>→</i> ${r(n)} <small>tokens</small></b></div>
        <div class="tc-track"><span class="was"></span><span class="now" style="--w:${Math.max(2,n/t*100)}%"></span></div>
        <em class="tc-pct">−${i(t,n)}%</em>
      </div>`).join(``)}</div>`:e.compare?`<div class="tc-cmp">${e.compare.map(([e,t],n)=>`<div class="${n?`now`:`was`}"><span>${e}</span><b>${t}</b></div>`).join(`<i class="tc-arr" aria-hidden="true">→</i>`)}</div>`:e.layers?`<ul class="tc-layers">${e.layers.map(([e,t])=>`<li><b>${e}</b><span>${t}</span></li>`).join(``)}</ul>`:e.tiers?`<ul class="tc-tiers">${e.tiers.map(([e,t])=>`<li><b>${e}</b><span>${t}</span></li>`).join(``)}</ul>`:``}function s(){return`
    <div class="tl-chain" id="tl-chain" role="list" aria-label="Sample ledger entries"></div>
    <div class="tl-bar">
      <div class="tl-btns">
        <button class="btn btn-solid" id="tl-verify" type="button">Verify chain</button>
        <button class="btn btn-ghost" id="tl-tamper" type="button">Tamper with entry 2</button>
        <button class="btn btn-ghost" id="tl-reset" type="button">Reset</button>
      </div>
      <p class="tl-msg mono" id="tl-msg" aria-live="polite">Sample entries. Hashes are computed live in your browser.</p>
    </div>`}function c(t){let r=e.bench;t.innerHTML=`
    <div class="tos-head">
      <div><p class="tos-k mono">${e.intro.k}</p><h3 class="tos-t">${e.intro.t}</h3></div>
      <div><p class="tos-d">${e.intro.d}</p><p class="tos-q">${e.intro.q}</p></div>
    </div>

    <div class="tos-axes">
      ${e.axes.map(e=>`
        <article class="tos-axis">
          <span class="mono tos-n">${e.n}</span>
          <h4>${e.t}</h4>
          <p>${e.d}</p>
          <div class="tos-v"><b>${e.v}</b><span>${e.vl}</span></div>
        </article>`).join(`<div class="tos-x" aria-hidden="true">×</div>`)}
    </div>
    <p class="tos-axisnote mono">${e.axisNote}</p>

    <div class="tos-caps">
      ${e.caps.map((e,t)=>`
        <article class="tc" style="--c:${e.c}">
          <header><span class="tc-n mono">${String(t+1).padStart(2,`0`)}</span><code class="tc-tool">${e.tool}</code></header>
          <h4>${e.t}</h4>
          <p class="tc-human">${e.human}</p>
          <p class="tc-body">${e.body}</p>
          <div class="tc-viz">${o(e)}</div>
          ${e.note?`<p class="tc-note">${e.note}</p>`:``}
        </article>`).join(``)}
    </div>

    <div class="tos-bench">
      <div class="tb-head"><h4>${r.title}</h4><p class="mono">${r.sub}</p></div>
      ${r.groups.map(([e,t])=>`
        <div class="tb-group">
          <p class="tb-g mono">${e}</p>
          ${t.map(([e,t,n,r,i])=>`
            <div class="tb-row">
              <span class="tb-l">${e}</span>
              <div class="tb-bars"><div class="tb-was"><i></i><em>${t}</em></div><div class="tb-now"><i style="--w:${Math.max(2,i*100)}%"></i><em>${n}</em></div></div>
              <b class="tb-d">−${r}%</b>
            </div>`).join(``)}
        </div>`).join(``)}
    </div>

    <div class="tos-ledger">
      <div class="tl-copy">
        <h4>${e.ledger.t}</h4>
        <p>${e.ledger.d}</p>
        <div class="tl-cmds">${e.ledger.cmds.map(e=>`<code>${e}</code>`).join(``)}</div>
      </div>
      <div class="tl-demo">${s()}</div>
    </div>

    <div class="tos-ships">
      <ul class="chips">${e.ships.map(e=>`<li>${e}</li>`).join(``)}</ul>
      <div class="tos-tools">
        <div><p class="mono">core · always on</p><div>${e.tools.core.map(e=>`<code>${e}</code>`).join(``)}</div></div>
        <div><p class="mono">graph · on by default</p><div>${e.tools.graph.map(e=>`<code>${e}</code>`).join(``)}</div></div>
      </div>
    </div>`;let i=new IntersectionObserver(e=>e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`in`),i.unobserve(e.target))}),{threshold:.25});n(`.tc, .tos-bench, .tos-axes`,t).forEach(e=>i.observe(e)),l(t)}function l(n){let i=t(`#tl-chain`,n),o=t(`#tl-msg`,n),s=()=>{let t=`00000000`;return e.ledger.entries.map(([e,n,r])=>{let i={tool:e,base:n,actual:r,prev:t};return i.hash=a(`${i.prev}|${i.tool}|${i.base}|${i.actual}`),t=i.hash,i})},c=s(),l=c.map(()=>`idle`),u=-1,d=()=>{i.innerHTML=c.map((e,t)=>`
      <div class="tl-b ${l[t]}" role="listitem">
        <span class="tl-i mono">#${t+1}</span>
        <b>${e.tool}</b>
        <span class="tl-n">${r(e.base)} <i>→</i> ${r(e.actual)}</span>
        <span class="tl-s">saved ${r(e.base-e.actual)}</span>
        <code title="previous hash">← ${e.prev.slice(0,6)}</code>
        <code title="this row's hash" class="tl-h">${e.hash.slice(0,6)}</code>
        <span class="tl-st mono">${l[t]===`ok`?`verified`:l[t]===`bad`?`hash mismatch`:l[t]===`edit`?`edited`:l[t]===`chk`?`checking`:``}</span>
      </div>`).join(``)};t(`#tl-verify`,n).addEventListener(`click`,async()=>{o.textContent=`Re-hashing the whole chain…`,l=l.map(e=>e===`edit`?`edit`:`idle`),d();let e=-1,t=`00000000`;for(let n=0;n<c.length;n++){let r=c[n];l[n]=e>=0?`bad`:`chk`,d(),await new Promise(e=>setTimeout(e,320));let i=a(`${t}|${r.tool}|${r.base}|${r.actual}`);e<0&&(r.prev!==t||r.hash!==i)&&(e=n),l[n]=e>=0&&e<=n?`bad`:n===u?`edit`:`ok`,n===u&&e<0&&(l[n]=`ok`),d(),t=r.hash}o.textContent=e<0?`All ${c.length} entries verified. Every hash chains to the one before it.`:`Chain broken at entry ${e+1}. Entry ${u+1} was altered, so every later hash fails.`}),t(`#tl-tamper`,n).addEventListener(`click`,()=>{if(u>=0)return;u=1;let e=c[1];e.actual=2400,e.hash=a(`${e.prev}|${e.tool}|${e.base}|${e.actual}`),l=c.map((e,t)=>t===1?`edit`:`idle`),o.textContent=`Entry 2 now claims 2,400 tokens, not 13. Press verify.`,d()}),t(`#tl-reset`,n).addEventListener(`click`,()=>{c=s(),l=c.map(()=>`idle`),u=-1,o.textContent=`Sample entries. Hashes are computed live in your browser.`,d()}),d()}export{c as renderTokenos};
//# sourceMappingURL=tokenos-BXRJvffi.js.map