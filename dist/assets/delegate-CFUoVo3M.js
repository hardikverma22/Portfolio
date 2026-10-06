import{h as e,i as t,n,r,t as i,u as a}from"./index-B2SiabPq.js";var o=`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`,s=[`agent identity`,`user consent`,`token exchange`,`tool scope`,`payload rules`],c=[36,47,58,69,80],l=17,u=`
  <div class="dg">
    <div class="dg-a">
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
          <div class="dg-vault"><span>${o}</span><div><b>your credential</b><small>never leaves the vault</small></div></div>
          <b class="tk tk-sub mono">subject · you</b>
          <b class="tk tk-act mono">actor · the agent</b>
          <i class="dg-ring"></i>
          <div class="tk tk-del"><b>delegated token</b><span class="mono">scoped · revocable</span></div>
        </div>
      </section>

      <section class="dg-agent">
        <p class="dg-lab mono">the agent</p>
        <div class="dg-orb"><i></i><b>▸</b></div>
        <div class="dg-slot"><span class="mono">no token yet</span><div class="tk tk-held"><b>delegated token</b><span class="mono">acting for you</span></div></div>
        <p class="dg-note mono"></p>
      </section>
    </div>

    <div class="dg-b">
      <section class="dg-track">
        <p class="dg-lab mono">a gateway checks every request</p>
        <div class="dg-lane">
          <span class="dg-line"></span>
          ${c.map((e,t)=>`<i class="dg-bar" style="left:${e}%"></i><em class="dg-bl mono" data-n="${t+1}" style="left:${e}%">${s[t]}</em>`).join(``)}
          <b class="dg-pk mono" data-p="1">search_products</b>
          <b class="dg-pk mono" data-p="2">add_to_cart · $24</b>
          <b class="dg-pk mono" data-p="3">add_to_cart · $180</b>
          <b class="dg-pk mono" data-p="4">add_to_cart · $100</b>
          <b class="dg-pk mono" data-p="5">place_order · $24</b>
          <b class="dg-pk mono" data-p="6">search_products</b>
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
        </ul>
      </section>
      <section class="dg-store">
        <p class="dg-lab mono">tools</p>
        <ul class="mono"><li data-s="1"><i></i>search_products</li><li data-s="2"><i></i>add_to_cart</li><li data-s="3"><i></i>place_order</li></ul>
        <div class="dg-cart"><span>cart</span><div class="dg-item mono">water bottle · $24</div><b class="mono">$<em data-n="total">0</em></b><div class="dg-placed mono">order placed ✓</div></div>
      </section>
    </div>

  </div>`;function d(o,s){o.innerHTML=u;let d=i(`.dg`,o),f=n(`.dg-bar`,d),p=e=>i(`[data-p="${e}"]`,d),m=e=>i(`[data-w="${e}"]`,d),h=e=>i(`[data-l="${e}"]`,d),g=e=>i(`[data-s="${e}"]`,d);r(o,()=>{let r=e.timeline(),o=()=>{i(`[data-n="cap"]`,d).textContent=`$0`,i(`[data-n="total"]`,d).textContent=`0`,i(`.e5`,d).textContent=`held at tool scope: needs approval`,i(`.dg-note`,d).textContent=``};r.resetFn=o,o();let s=(e,t,n)=>{r.fromTo(e,{backgroundColor:`rgba(232,236,242,.2)`,boxShadow:`0 0 0 transparent`,scaleY:1},{backgroundColor:n,boxShadow:`0 0 22px ${n}`,scaleY:1.3,duration:.1,immediateRender:!1},t),r.to(e,{backgroundColor:`rgba(232,236,242,.2)`,boxShadow:`0 0 0 transparent`,scaleY:1,duration:.55},t+.1)},u=(e,t,n)=>{r.fromTo(e,{left:`${l}%`,opacity:0,scale:.9,borderColor:`#6ea8ff`,boxShadow:`0 0 18px -4px #6ea8ff`},{opacity:1,scale:1,duration:.18},t);let i=t+.18,a=l;for(let t=0;t<n;t++)r.fromTo(e,{left:`${a}%`},{left:`${c[t]}%`,duration:.26,ease:`none`,immediateRender:!1},i),i+=.26,a=c[t],s(f[t],i,`#6ad19a`);return{t:i,prev:a}},_=(e,{t,prev:n},i)=>(r.fromTo(e,{left:`${n}%`},{left:`89%`,duration:.45,ease:`power1.out`,immediateRender:!1},t),r.fromTo(g(i),{backgroundColor:`rgba(95,212,160,0)`},{backgroundColor:`rgba(95,212,160,.28)`,duration:.2,yoyo:!0,repeat:1,immediateRender:!1},t+.35),r.to(e,{opacity:0,duration:.25},t+.6),t+.6),v=(e,{t},n,i,a,o)=>{s(f[n],t,i),r.to(e,{borderColor:i,boxShadow:`0 0 22px -2px ${i}`,x:4,duration:.06,yoyo:!0,repeat:5},t),r.fromTo(m(o),{opacity:0,y:8},{opacity:1,y:0,duration:.3,ease:`back.out(2)`},t+.1),r.fromTo(h(a),{opacity:0,x:-14},{opacity:1,x:0,duration:.35,ease:`power3.out`},t+.2)},y=(e,t,n)=>{r.to(e,{left:`${l}%`,opacity:0,duration:.5,ease:`power2.in`},t),r.to(m(n),{opacity:0,duration:.3},t+.1)};r.fromTo(`.dg-a > *, .dg-b > *`,{opacity:0,y:18},{opacity:1,y:0,duration:.6,stagger:.1,ease:`expo.out`},0),r.set([...n(`.dg-pk`,d),...n(`.dg-why`,d),i(`.dg-approve`,d)],{xPercent:-50,yPercent:-50,opacity:0},0),r.set(n(`.dg-log li`,d),{opacity:0},0);let b=i(`.dg-slider`,d);r.fromTo(i(`i`,b),{scaleX:0},{scaleX:.5,duration:1.3,ease:`power2.inOut`,transformOrigin:`left`},.5),r.fromTo(i(`u`,b),{left:`0%`},{left:`50%`,duration:1.3,ease:`power2.inOut`},.5),t(r,i(`[data-n="cap"]`,d),0,150,.5,1.3,e=>`$${Math.round(e)}`,`power2.inOut`),[`Alcohol`,`Gift cards`].forEach((e,t)=>r.fromTo(i(`[data-k="${e}"]`,d),{opacity:1,textDecoration:`none`},{opacity:.45,textDecoration:`line-through`,duration:.25,immediateRender:!1},1.9+t*.25)),n(`.dg-tools .tg`,d).forEach((e,t)=>r.fromTo(e,{"--on":0},{"--on":1,duration:.3,immediateRender:!1},2.4+t*.25)),r.fromTo(i(`.tg-main`,d),{"--on":0},{"--on":1,duration:.3,immediateRender:!1},3),r.fromTo(i(`.dg-vault`,d),{opacity:.5,y:6},{opacity:1,y:0,duration:.5},1),r.fromTo(`.tk-sub`,{opacity:0,left:`0%`,top:`30%`,xPercent:0,yPercent:-50,scale:1},{opacity:1,duration:.4},3.1),r.fromTo(`.tk-act`,{opacity:0,left:`0%`,top:`66%`,xPercent:0,yPercent:-50,scale:1},{opacity:1,duration:.4},3.3),r.to(`.tk-sub`,{left:`50%`,top:`48%`,xPercent:-50,scale:.7,duration:.8,ease:`power3.inOut`},3.9),r.to(`.tk-act`,{left:`50%`,top:`48%`,xPercent:-50,scale:.7,duration:.8,ease:`power3.inOut`},3.9),r.fromTo(`.dg-ring`,{scale:.2,opacity:.9},{scale:2.4,opacity:0,duration:.8,ease:`power2.out`},4.6),r.to(`.tk-sub, .tk-act`,{opacity:0,duration:.2},4.65),r.fromTo(`.tk-del`,{opacity:0,scale:.4,left:`50%`,top:`48%`,xPercent:-50,yPercent:-50},{opacity:1,scale:1,duration:.5,ease:`back.out(2.2)`},4.65),r.to(`.tk-del`,{left:`108%`,opacity:0,duration:.7,ease:`power2.in`},5.7),r.fromTo(`.dg-slot > span`,{opacity:.7},{opacity:0,duration:.3},6.2),r.fromTo(`.tk-held`,{opacity:0,scale:.6,y:12},{opacity:1,scale:1,y:0,duration:.5,ease:`back.out(2)`},6.2),r.fromTo(`.dg-orb`,{"--glow":0},{"--glow":1,duration:.6},6.2),a(r,i(`.dg-note`,d),`acting for you, never holding your credential`,6.4,1.1);let x=u(p(1),7.6,5),S=_(p(1),x,1);r.fromTo(h(1),{opacity:0,x:-14},{opacity:1,x:0,duration:.35,ease:`power3.out`},x.t+.2),x=u(p(2),S+.3,5),S=_(p(2),x,2),r.fromTo(h(2),{opacity:0,x:-14},{opacity:1,x:0,duration:.35,ease:`power3.out`},x.t+.2),r.fromTo(`.dg-item`,{opacity:0,y:8},{opacity:1,y:0,duration:.3},x.t+.5),t(r,i(`[data-n="total"]`,d),0,24,x.t+.5,.5),x=u(p(3),S+.3,4),v(p(3),{t:x.t+.26},4,`#ff6b8a`,3,3),r.fromTo(p(3),{left:`${c[3]}%`},{left:`${c[4]}%`,duration:.26,ease:`none`,immediateRender:!1},x.t),y(p(3),x.t+1.5,3),S=x.t+2,x=u(p(4),S+.2,4),v(p(4),{t:x.t+.26},4,`#ff6b8a`,4,4),r.fromTo(p(4),{left:`${c[3]}%`},{left:`${c[4]}%`,duration:.26,ease:`none`,immediateRender:!1},x.t),y(p(4),x.t+1.5,4),S=x.t+2,x=u(p(5),S+.2,3),r.fromTo(p(5),{left:`${c[2]}%`},{left:`${c[3]}%`,duration:.26,ease:`none`,immediateRender:!1},x.t);let C=x.t+.26;s(f[3],C,`#f5c451`),r.to(p(5),{borderColor:`#f5c451`,boxShadow:`0 0 22px -2px #f5c451`,duration:.2},C),r.fromTo(m(5),{opacity:0,y:8},{opacity:1,y:0,duration:.3,ease:`back.out(2)`},C+.1),r.fromTo(h(5),{opacity:0,x:-14},{opacity:1,x:0,duration:.35},C+.2),r.fromTo(`.dg-approve`,{opacity:0,y:8,scale:1},{opacity:1,y:0,duration:.3},C+.8),r.to(`.dg-approve`,{scale:.88,backgroundColor:`#e8ecf2`,color:`#0b0d12`,duration:.12,yoyo:!0,repeat:1},C+1.7),r.to(`.dg-approve, [data-w="5"]`,{opacity:0,duration:.25},C+2.05),r.call(()=>{i(`.e5`,d).textContent=`approved by you, order placed`},null,C+2),r.to(p(5),{borderColor:`#6ad19a`,boxShadow:`0 0 22px -2px #6ad19a`,duration:.2},C+2),s(f[3],C+2.05,`#6ad19a`),r.fromTo(p(5),{left:`${c[3]}%`},{left:`${c[4]}%`,duration:.26,ease:`none`,immediateRender:!1},C+2.1),s(f[4],C+2.36,`#6ad19a`),r.fromTo(p(5),{left:`${c[4]}%`},{left:`89%`,duration:.45,ease:`power1.out`,immediateRender:!1},C+2.36),r.fromTo(g(3),{backgroundColor:`rgba(95,212,160,0)`},{backgroundColor:`rgba(95,212,160,.3)`,duration:.2,yoyo:!0,repeat:1,immediateRender:!1},C+2.7),r.to(p(5),{opacity:0,duration:.25},C+2.95),r.fromTo(`.dg-placed`,{opacity:0,scale:.8},{opacity:1,scale:1,duration:.4,ease:`back.out(2)`},C+2.8),r.fromTo(i(`i.h`,h(5)),{color:`#f5c451`},{color:`#6ad19a`,duration:.2},C+2),S=C+3.4;let w=S+.4;return r.to(i(`.tg-main`,d),{"--on":0,duration:.3},w),r.fromTo(`.tk-held`,{filter:`grayscale(0)`},{opacity:.25,filter:`grayscale(1)`,scale:.92,duration:.5,immediateRender:!1},w+.2),r.to(`.dg-orb`,{"--glow":0,duration:.5},w+.2),x=u(p(6),w+1,2),v(p(6),{t:x.t+.26},2,`#ff6b8a`,6,6),r.fromTo(p(6),{left:`${c[1]}%`},{left:`${c[2]}%`,duration:.26,ease:`none`,immediateRender:!1},x.t),y(p(6),x.t+1.5,6),r},s,{speed:2.2})}export{d as mountDelegate};
//# sourceMappingURL=delegate-CFUoVo3M.js.map