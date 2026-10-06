import{a as e,c as t,h as n,l as r,n as i,o as a,r as o,t as s,u as c}from"./index-B2SiabPq.js";var l=[{k:`logs`,n:`Logs & traces`,m:`mcp://logs`,cap:`412 errors, 96% from one upstream`,viz:`<svg viewBox="0 0 140 40" preserveAspectRatio="none"><path class="tz-fill" d="M0 34 L12 33 L24 34 L36 32 L48 33 L60 30 L68 10 L78 5 L88 8 L100 6 L112 8 L124 6 L140 7 L140 40 L0 40 Z"/><path class="tz-spark" d="M0 34 L12 33 L24 34 L36 32 L48 33 L60 30 L68 10 L78 5 L88 8 L100 6 L112 8 L124 6 L140 7"/></svg>`},{k:`code`,n:`Code search`,m:`mcp://code`,cap:`retries=0 since the last config change`,viz:`<div class="tz-code mono"><span>timeout: 2800</span><span class="old">retries: 3</span><span class="hit">retries: 0</span></div>`},{k:`browser`,n:`Browser repro`,m:`mcp://playwright`,cap:`verify returns 504 after 3.0s`,viz:`<div class="tz-steps mono"><i>sign in</i><i>request OTP</i><i class="bad">verify</i></div>`},{k:`health`,n:`Service health`,m:`mcp://health`,cap:`upstream p99 2.9s, baseline 0.4s`,viz:`<div class="tz-gauge mono"><div><i class="base"></i><span>0.4s</span></div><div><i class="now"></i><span>2.9s</span></div></div>`},{k:`comms`,n:`Stakeholder updates`,m:`mcp://comms`,cap:`draft ready, awaiting approval`,viz:`<div class="tz-draft"><s></s><s></s><s></s></div>`}],u=`
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
        <div class="tz-orb" data-n="orb"><i></i><i></i><i></i><b>◆</b></div>
        <ul class="tz-plan mono">
          <li><em></em></li><li><em></em></li><li><em></em></li>
        </ul>
      </section>

      <section class="tz-col tz-agents">
        <p class="tz-lab mono">five specialists, in parallel</p>
        ${l.map(e=>`
        <article class="tz-ag" data-a="${e.k}">
          <header><b>${e.n}</b><code class="mono">${e.m}</code><span class="tz-st" aria-hidden="true"><i class="spin"></i><i class="ok">✓</i><i class="hold">⏸</i></span></header>
          <div class="tz-viz">${e.viz}</div>
          <p class="tz-cap mono"><em></em></p>
        </article>`).join(``)}
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

  </div>`,d=e=>`${String(Math.floor(e/60)).padStart(2,`0`)}:${String(Math.floor(e%60)).padStart(2,`0`)}`;function f(f,p){f.innerHTML=u;let m=s(`.tz`,f),h=s(`.tz-wires`,f),g=e=>s(e,m),_=i(`.tz-ag`,m);o(f,()=>{let o=n.timeline(),u=innerWidth>=960;h.innerHTML=``;let f=(e,t)=>{let n=document.createElementNS(`http://www.w3.org/2000/svg`,`path`);return n.setAttribute(`d`,e),n.setAttribute(`class`,t),h.append(n),n},p=e=>{let t=document.createElementNS(`http://www.w3.org/2000/svg`,`circle`);return t.setAttribute(`r`,3.2),t.setAttribute(`class`,e),h.append(t),t},v=g(`[data-n="inc"]`),y=g(`[data-n="orb"]`),b=g(`[data-n="verdict"]`),x=u?f(e(t(m,v,`r`),t(m,y,`l`),.5),`tz-w tz-w-in`):null,S=u?_.map(n=>f(e(t(m,y,`r`),t(m,n,`l`),.55),`tz-w tz-w-fan`)):[],C=u?_.map(n=>f(e(t(m,n,`r`),t(m,b,`l`),.5),`tz-w tz-w-merge`)):[],w=u?p(`tz-d tz-d-in`):null,T=u?_.map(()=>p(`tz-d tz-d-fan`)):[],E=u?_.map(()=>p(`tz-d tz-d-merge`)):[],D=()=>{i(`.tz-plan em, .tz-cap em, .tz-v1 em`,m).forEach(e=>{e.textContent=``}),g(`.tz-lane[data-l="hand"] b`).textContent=`00:00`,g(`.tz-lane[data-l="agents"] b`).textContent=`00:00`};o.resetFn=D,D(),o.fromTo(`.tz-intake > *`,{opacity:0,y:16},{opacity:1,y:0,duration:.6,stagger:.12,ease:`expo.out`},.2),o.fromTo(i(`.tz-chan span`,m),{opacity:0,x:-16},{opacity:1,x:0,duration:.4,stagger:.15,ease:`power3.out`},.4),o.fromTo(g(`.tz-ping`),{scale:.6,opacity:.9},{scale:2.6,opacity:0,duration:1.1,ease:`power2.out`,repeat:1},.9),o.fromTo(`.tz-sup > *`,{opacity:0,y:16},{opacity:1,y:0,duration:.6,stagger:.1,ease:`expo.out`},1.2),x&&(a(o,x,1.3,.7),r(o,w,x,1.5,.8)),o.fromTo(y,{scale:.85},{scale:1,duration:.7,ease:`back.out(2)`},1.9);let O=[`classify the incident`,`recall 2 similar incidents`,`fan out to 5 specialists`];i(`.tz-plan li`,m).forEach((e,t)=>{o.fromTo(e,{opacity:0,x:-10},{opacity:1,x:0,duration:.3},2.1+t*.6),c(o,s(`em`,e),O[t],2.1+t*.6,.5)}),o.fromTo(_,{opacity:0,x:26,scale:.97},{opacity:1,x:0,scale:1,duration:.6,stagger:.1,ease:`expo.out`},3.6),o.fromTo(g(`.tz-agents .tz-lab`),{opacity:0},{opacity:1,duration:.4},3.5),S.forEach((e,t)=>{a(o,e,3.5+t*.07,.6),r(o,T[t],e,3.7+t*.07,.7)});let k=(e,t,n)=>{let r=g(`[data-a="${e}"]`);o.set(s(`.tz-st .spin`,r),{opacity:0},0),o.set(i(`.tz-st .ok, .tz-st .hold`,r),{opacity:0},0),o.fromTo(s(`.tz-st .spin`,r),{opacity:0,rotation:0},{opacity:1,rotation:720,duration:n-t,ease:`none`},t),o.to(s(`.tz-st .spin`,r),{opacity:0,duration:.15},n),o.fromTo(s(e===`comms`?`.tz-st .hold`:`.tz-st .ok`,r),{opacity:0,scale:.4},{opacity:1,scale:1,duration:.3,ease:`back.out(3)`},n),o.to(r,{boxShadow:`0 0 0 1px rgba(95,212,160,.7), 0 0 30px -8px rgba(95,212,160,.6)`,duration:.3,yoyo:!0,repeat:1},n)},A=(e,t,n)=>c(o,s(`[data-a="${e}"] .tz-cap em`),l.find(t=>t.k===e).cap,t,n);k(`logs`,4.3,5.7),A(`logs`,4.7,1),a(o,s(`[data-a="logs"] .tz-spark`,m),4.3,1.3,`power1.inOut`),o.fromTo(s(`[data-a="logs"] .tz-fill`,m),{opacity:0},{opacity:1,duration:.6},5),k(`code`,4.4,6),A(`code`,4.9,1.1),o.fromTo(i(`[data-a="code"] .tz-code span`,m),{opacity:0,x:-8},{opacity:1,x:0,duration:.3,stagger:.18},4.5),o.to(s(`[data-a="code"] .old`,m),{opacity:.35,textDecoration:`line-through`,duration:.3},5.1),o.fromTo(s(`[data-a="code"] .hit`,m),{backgroundColor:`rgba(255,107,138,0)`},{backgroundColor:`rgba(255,107,138,.28)`,duration:.4,yoyo:!0,repeat:3},5.1),k(`browser`,4.4,6.5),A(`browser`,5.5,.9),i(`[data-a="browser"] .tz-steps i`,m).forEach((e,t)=>o.fromTo(e,{opacity:.3,backgroundColor:`rgba(232,236,242,.05)`},{opacity:1,backgroundColor:e.classList.contains(`bad`)?`rgba(255,107,138,.3)`:`rgba(95,212,160,.22)`,duration:.3},4.6+t*.7)),k(`health`,4.5,6.2),A(`health`,5,1),o.fromTo(s(`[data-a="health"] .base`,m),{scaleX:0},{scaleX:1,duration:.5,transformOrigin:`left`,ease:`power2.out`},4.6),o.fromTo(s(`[data-a="health"] .now`,m),{scaleX:0},{scaleX:1,duration:1,transformOrigin:`left`,ease:`power2.inOut`},5),k(`comms`,4.8,7),A(`comms`,6.1,.9),o.fromTo(i(`[data-a="comms"] s`,m),{scaleX:0},{scaleX:1,duration:.6,stagger:.35,transformOrigin:`left`,ease:`power2.out`},5),C.forEach((e,t)=>{a(o,e,6+t*.25,.55),r(o,E[t],e,6.2+t*.25,.7)}),o.fromTo(`.tz-out .tz-lab`,{opacity:0},{opacity:1,duration:.4},7.1),o.fromTo(b,{opacity:0,y:18,scale:.97},{opacity:1,y:0,scale:1,duration:.6,ease:`expo.out`},7.3),c(o,g(`.tz-v1 em`),`Root cause: upstream messaging latency, plus a config change that removed retries.`,7.7,1.8),o.fromTo(i(`.tz-verdict li`,m),{opacity:0,x:-10},{opacity:1,x:0,duration:.4,stagger:.3},9.6),o.fromTo(`.tz-gate`,{opacity:0,y:14},{opacity:1,y:0,duration:.5,ease:`expo.out`},10.4),o.to(g(`[data-b="approve"]`),{scale:.92,duration:.12,yoyo:!0,repeat:1},11.1),o.fromTo(g(`[data-b="approve"]`),{backgroundColor:`rgba(232,236,242,.08)`,color:`#9aa3b2`},{backgroundColor:`#e8ecf2`,color:`#0b0d12`,duration:.3},11.1),o.fromTo(g(`.tz-done`),{opacity:0,y:8},{opacity:1,y:0,duration:.4},11.5);let j=g(`[data-l="hand"]`),M=g(`[data-l="agents"]`);o.fromTo(`.tz-race`,{opacity:0},{opacity:1,duration:.6},.2);let N={t:0};return o.fromTo(N,{t:0},{t:180,duration:11.4,ease:`none`,onUpdate:()=>{s(`i`,s(`.tz-track`,j)).style.width=`${N.t/3600*100}%`,s(`i`,s(`.tz-track`,M)).style.width=`${N.t/3600*100}%`,s(`b`,j).textContent=d(N.t),s(`b`,M).textContent=d(N.t)}},.4),o.fromTo(M,{"--done":0},{"--done":1,duration:.4},11.8),o.to(N,{t:3600,duration:2,ease:`power2.in`,onUpdate:()=>{s(`i`,s(`.tz-track`,j)).style.width=`${N.t/3600*100}%`,s(`b`,j).textContent=d(N.t)}},12),o},p,{speed:2})}export{f as mountTriage};
//# sourceMappingURL=triage-RJCOiugU.js.map