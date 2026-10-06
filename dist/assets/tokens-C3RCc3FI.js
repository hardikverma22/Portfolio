import{h as e,i as t,n,r,s as i,t as a,u as o}from"./index-B2SiabPq.js";var s={u:84,d:150,v:100,i:86},c={d:6,v:14},l=[[`dedupe`,48210,31400],[`summarise`,31400,17900],[`route`,17900,9640]],u=[`−150 duplicate blocks became 6 stubs: README.md ×12, tsconfig ×9, import React ×14`,`−100 verbose blocks became 14 summaries: stack frames, health checks, debug logs`,`−86 irrelevant blocks dropped: node_modules, lockfile hunks, CHANGELOG 2019`],d=e=>{let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619)>>>0;return t.toString(16).padStart(8,`0`)},f=()=>{let e=Object.entries(s).flatMap(([e,t])=>Array.from({length:t},()=>e)),t=7,n=()=>(t=t*1664525+1013904223>>>0)/4294967296;for(let t=e.length-1;t>0;t--){let r=Math.floor(n()*(t+1));[e[t],e[r]]=[e[r],e[t]]}return e},p=`
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
      <div class="cw-why mono">${u.map(()=>`<p><em></em></p>`).join(``)}</div>
    </section>

    <aside class="cw-side">
      <section class="cw-route">
        <p class="cw-lab mono">each turn goes to the cheapest model that can do it</p>
        <div class="cw-lanes">
          <span class="cw-hub"><b>◇</b></span>
          ${[[`Haiku`,`lookups`,`where is the auth file?`],[`Sonnet`,`everyday dev work`,`add a request handler`],[`Opus`,`refactor · debug · plan`,`refactor this service`]].map(([e,t,n],r)=>`
          <div class="cw-lane" data-m="${r}"><span class="cw-ln mono"><b>${e}</b><small>${t}</small></span><i></i><b class="cw-prompt mono">${n}</b></div>`).join(``)}
        </div>
        <div class="cw-cost mono">
          <div><span>one premium model, every turn</span><i class="cw-c0"></i></div>
          <div><span>routed per turn</span><i class="cw-c1"></i><b>−73%</b></div>
        </div>
      </section>
      <section class="cw-ledger">
        <p class="cw-lab mono">every saving is a receipt</p>
        <div class="cw-chain mono">
          ${l.map(([e,t,n],r)=>`<div class="cw-blk"><span>#${r+1} ${e}</span><b>−${i(t-n)}</b><code data-h="${r}"></code></div>`).join(``)}
        </div>
        <p class="cw-ok mono">✓ chain verified, every hash links to the one before</p>
      </section>
    </aside>
  </div>`;function m(s,m){s.innerHTML=p;let h=a(`.cw`,s),g=a(`.cw-grid`,h),_=f().map(e=>{let t=document.createElement(`i`);return t.className=`c c-${e}`,t.dataset.k=e,g.append(t),t}),v=e=>_.filter(t=>t.dataset.k===e),y=v(`d`),b=v(`v`),x=v(`i`),S=y.slice(0,c.d),C=y.slice(c.d),w=b.slice(0,c.v),T=b.slice(c.v),E=(()=>{let e=`000000`;return l.map(([t,n,r])=>{let i=d(`${e}|${t}|${n}|${r}`).slice(0,6),a={prev:e,h:i};return e=i,a})})();r(s,()=>{let r=e.timeline(),s=()=>{e.set(_,{clearProps:`width,marginRight,marginBottom,opacity,scale,y,backgroundColor,boxShadow`}),a(`[data-n="count"]`,h).textContent=i(48210),n(`.cw-why em`,h).forEach(e=>{e.textContent=``}),n(`.cw-blk code`,h).forEach((e,t)=>{e.textContent=`${E[t].prev} → ${E[t].h}`})};r.resetFn=s,s();let c=a(`.cw-bar i`,h),l=e=>{c.style.width=`${e/48210*100}%`};r.fromTo(`.cw-win, .cw-side > *`,{opacity:0,y:18},{opacity:1,y:0,duration:.6,stagger:.1,ease:`expo.out`},0),r.fromTo(_,{opacity:0,scale:.3},{opacity:1,scale:1,duration:.3,stagger:{each:.0028,from:`random`},ease:`back.out(2)`},.4),t(r,a(`[data-n="count"]`,h),0,48210,.4,1.4);let d={v:0};r.fromTo(d,{v:0},{v:48210,duration:1.4,ease:`power2.out`,onUpdate:()=>l(d.v)},.4);let f=n(`.cw-pills li`,h),p=(e,t)=>{r.to(f,{backgroundColor:`rgba(232,236,242,.05)`,color:`#9aa3b2`,duration:.2},t),r.to(f[e],{backgroundColor:`#e8ecf2`,color:`#0b0d12`,duration:.25},t)},m=(e,n,o,s)=>{t(r,a(`[data-n="count"]`,h),e,n,o,s,i,`power2.inOut`);let c={v:e};r.fromTo(c,{v:e},{v:n,duration:s,ease:`power2.inOut`,onUpdate:()=>l(c.v)},o)},g=(e,t,n)=>r.fromTo(e,{boxShadow:`0 0 0 0 transparent`},{boxShadow:`0 0 0 2px ${t}, 0 0 14px ${t}`,duration:.25,yoyo:!0,repeat:3,stagger:{each:.004,from:`random`},immediateRender:!1},n),v=(e,t,n)=>r.to(e,{width:0,marginRight:0,opacity:0,scale:0,duration:n,stagger:{each:.006,from:`random`},ease:`power2.inOut`},t);p(0,1.9),g(y,`#f5c451`,2),v(C,3,.8),r.to(S,{backgroundColor:`rgba(245,196,81,.32)`,duration:.4},3),m(48210,31400,3,1.2),p(1,4.6),g(b,`#a78bfa`,4.7),v(T,5.7,.8),r.to(w,{backgroundColor:`#5fd4a0`,duration:.5},5.7),m(31400,17900,5.7,1.2),p(2,7.3),g(x,`#ff6b8a`,7.4),r.to(x,{y:26,width:0,marginRight:0,opacity:0,scale:.4,duration:.8,stagger:{each:.007,from:`random`},ease:`power2.in`},8.4),m(17900,9640,8.4,1.2),r.fromTo(`.cw-pct`,{opacity:0,scale:.6,y:8},{opacity:1,scale:1,y:0,duration:.5,ease:`back.out(2.4)`},9.4),r.to(_.filter(e=>!x.includes(e)&&!C.includes(e)&&!T.includes(e)),{boxShadow:`0 0 12px rgba(127,178,255,.5)`,duration:.4,yoyo:!0,repeat:1},9.5),p(3,10.2),n(`.cw-why p`,h).forEach((e,t)=>{r.fromTo(e,{opacity:0,x:-10},{opacity:1,x:0,duration:.3},10.3+t*1.1),o(r,a(`em`,e),u[t],10.3+t*1.1,1)});let D=n(`.cw-blk`,h);[3.9,6.9,9.6].forEach((e,t)=>r.fromTo(D[t],{opacity:0,x:-14,scale:.94},{opacity:1,x:0,scale:1,duration:.45,ease:`back.out(2)`},e)),r.fromTo(`.cw-ok`,{opacity:0,y:6},{opacity:1,y:0,duration:.4},11.4);let O=n(`.cw-lane`,h),k=a(`.cw-hub`,h);return r.fromTo(k,{scale:.7},{scale:1,duration:.5,ease:`back.out(2)`},2),[[0,4.4],[1,6],[2,7.6]].forEach(([e,t])=>{let n=O[e],i=a(`.cw-prompt`,n),o=a(`i`,n);r.fromTo(o,{scaleX:0},{scaleX:1,duration:.6,ease:`power2.inOut`,transformOrigin:`left`},t),r.fromTo(i,{opacity:0,left:`0%`,xPercent:0},{opacity:1,duration:.2},t),r.to(i,{left:`100%`,xPercent:-100,duration:1.2,ease:`power2.inOut`},t+.1),r.fromTo(n,{"--hot":0},{"--hot":1,duration:.3,immediateRender:!1},t+1.2),r.to(i,{opacity:0,duration:.3},t+2.1),r.to(n,{"--hot":0,duration:.4},t+2.2)}),r.fromTo(`.cw-c0`,{scaleX:0},{scaleX:1,duration:.8,transformOrigin:`left`,ease:`power2.out`},10.2),r.fromTo(`.cw-c1`,{scaleX:0},{scaleX:.27,duration:1,transformOrigin:`left`,ease:`power2.out`},10.6),r.fromTo(`.cw-cost b`,{opacity:0,scale:.7},{opacity:1,scale:1,duration:.4,ease:`back.out(2)`},11.4),r},m,{speed:1.7})}export{m as mountTokens};
//# sourceMappingURL=tokens-C3RCc3FI.js.map