var e={sim:128,dye:768,density:1.9,velocity:.5,pressure:.8,iterations:20,curl:22,radius:.17,force:5200},t=[[.78,.86,1],[.31,.43,.97],[.49,.3,1],[.3,.66,1]],n=`#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv, vL, vR, vT, vB;
uniform vec2 texelSize;
void main(){
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0); vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y); vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,r=`#version 300 es
precision highp float; precision highp sampler2D;
in vec2 vUv, vL, vR, vT, vB; out vec4 o;
`,i={clear:r+`uniform sampler2D uTexture; uniform float value; void main(){ o = value * texture(uTexture, vUv); }`,splat:r+`uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
    void main(){ vec2 p = vUv - point; p.x *= aspectRatio; vec3 s = exp(-dot(p, p) / radius) * color; o = vec4(texture(uTarget, vUv).xyz + s, 1.0); }`,advect:r+`uniform sampler2D uVelocity, uSource; uniform vec2 texelSize; uniform float dt, dissipation, shift;
    void main(){
      vec2 c = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
      c.y -= shift;
      vec4 r = texture(uSource, c) / (1.0 + dissipation * dt);
      if (c.y < 0.0 || c.y > 1.0) r = vec4(0.0);
      o = r;
    }`,divergence:r+`uniform sampler2D uVelocity;
    void main(){
      float L = texture(uVelocity, vL).x, R = texture(uVelocity, vR).x, T = texture(uVelocity, vT).y, B = texture(uVelocity, vB).y;
      vec2 C = texture(uVelocity, vUv).xy;
      if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x; if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
      o = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
    }`,curl:r+`uniform sampler2D uVelocity;
    void main(){
      float L = texture(uVelocity, vL).y, R = texture(uVelocity, vR).y, T = texture(uVelocity, vT).x, B = texture(uVelocity, vB).x;
      o = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
    }`,vorticity:r+`uniform sampler2D uVelocity, uCurl; uniform float curl, dt;
    void main(){
      float L = texture(uCurl, vL).x, R = texture(uCurl, vR).x, T = texture(uCurl, vT).x, B = texture(uCurl, vB).x, C = texture(uCurl, vUv).x;
      vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      f /= length(f) + 0.0001; f *= curl * C; f.y *= -1.0;
      vec2 v = texture(uVelocity, vUv).xy + f * dt;
      o = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
    }`,pressure:r+`uniform sampler2D uPressure, uDivergence;
    void main(){
      float L = texture(uPressure, vL).x, R = texture(uPressure, vR).x, T = texture(uPressure, vT).x, B = texture(uPressure, vB).x;
      o = vec4((L + R + B + T - texture(uDivergence, vUv).x) * 0.25, 0.0, 0.0, 1.0);
    }`,gradient:r+`uniform sampler2D uPressure, uVelocity;
    void main(){
      float L = texture(uPressure, vL).x, R = texture(uPressure, vR).x, T = texture(uPressure, vT).x, B = texture(uPressure, vB).x;
      vec2 v = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
      o = vec4(v, 0.0, 1.0);
    }`,display:r+`uniform sampler2D uTexture; uniform vec2 texelSize;
    void main(){
      vec3 c = texture(uTexture, vUv).rgb;
      float peak = max(c.r, max(c.g, c.b));
      float lum = 1.0 - exp(-peak * 1.5);
      vec3 col = peak > 0.0001 ? c / peak * lum : vec3(0.0);
      float l = length(texture(uTexture, vL).rgb), r = length(texture(uTexture, vR).rgb);
      float t = length(texture(uTexture, vT).rgb), b = length(texture(uTexture, vB).rgb);
      vec3 n = normalize(vec3(l - r, t - b, length(texelSize)));
      float spec = pow(max(dot(n, normalize(vec3(-0.4, 0.6, 1.0))), 0.0), 24.0) * lum * 0.35;
      col += spec;
      float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
      o = vec4(col, a) * 0.72;
    }`};function a({reduced:r}={}){let a=matchMedia(`(hover: hover) and (pointer: fine)`).matches;if(r||!a||innerWidth<768)return null;let o=document.createElement(`canvas`);o.className=`fx-fluid`,o.setAttribute(`aria-hidden`,`true`),document.body.appendChild(o);let s=o.getContext(`webgl2`,{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!1,powerPreference:`high-performance`});if(!s||!s.getExtension(`EXT_color_buffer_float`))return o.remove(),null;s.getExtension(`OES_texture_float_linear`);let c=(e,t)=>{let n=s.createShader(e);if(s.shaderSource(n,t),s.compileShader(n),!s.getShaderParameter(n,s.COMPILE_STATUS))throw Error(s.getShaderInfoLog(n));return n},l=c(s.VERTEX_SHADER,n),u={};for(let[e,t]of Object.entries(i)){let n=s.createProgram();if(s.attachShader(n,l),s.attachShader(n,c(s.FRAGMENT_SHADER,t)),s.bindAttribLocation(n,0,`aPosition`),s.linkProgram(n),!s.getProgramParameter(n,s.LINK_STATUS))throw Error(s.getProgramInfoLog(n));let r={},i=s.getProgramParameter(n,s.ACTIVE_UNIFORMS);for(let e=0;e<i;e++){let t=s.getActiveUniform(n,e).name;r[t]=s.getUniformLocation(n,t)}u[e]={p:n,u:r}}let d=e=>(s.useProgram(u[e].p),u[e].u);s.bindBuffer(s.ARRAY_BUFFER,s.createBuffer()),s.bufferData(s.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),s.STATIC_DRAW),s.vertexAttribPointer(0,2,s.FLOAT,!1,0,0),s.enableVertexAttribArray(0);let f=(e,t,n)=>{s.activeTexture(s.TEXTURE0);let r=s.createTexture();s.bindTexture(s.TEXTURE_2D,r),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,n),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MAG_FILTER,n),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE),s.texImage2D(s.TEXTURE_2D,0,s.RGBA16F,e,t,0,s.RGBA,s.HALF_FLOAT,null);let i=s.createFramebuffer();if(s.bindFramebuffer(s.FRAMEBUFFER,i),s.framebufferTexture2D(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,r,0),s.checkFramebufferStatus(s.FRAMEBUFFER)!==s.FRAMEBUFFER_COMPLETE)throw Error(`fbo incomplete`);return s.viewport(0,0,e,t),s.clearColor(0,0,0,0),s.clear(s.COLOR_BUFFER_BIT),{tex:r,fbo:i,w:e,h:t,tx:1/e,ty:1/t,bind(e){return s.activeTexture(s.TEXTURE0+e),s.bindTexture(s.TEXTURE_2D,r),e}}},p=(e,t,n)=>{let r=f(e,t,n),i=f(e,t,n);return{get read(){return r},get write(){return i},swap(){[r,i]=[i,r]}}},m=e=>{let t=s.drawingBufferWidth/s.drawingBufferHeight;t<1&&(t=1/t);let n=Math.round(e),r=Math.round(e*t);return s.drawingBufferWidth>s.drawingBufferHeight?[r,n]:[n,r]},h=e=>{e?(s.viewport(0,0,e.w,e.h),s.bindFramebuffer(s.FRAMEBUFFER,e.fbo)):(s.viewport(0,0,s.drawingBufferWidth,s.drawingBufferHeight),s.bindFramebuffer(s.FRAMEBUFFER,null)),s.drawArrays(s.TRIANGLES,0,3)},g,_,v,y,b,x=()=>{let t=Math.min(devicePixelRatio||1,1.5);o.width=Math.round(innerWidth*t),o.height=Math.round(innerHeight*t);let[n,r]=m(e.sim),[i,a]=m(e.dye);g=p(n,r,s.LINEAR),_=p(i,a,s.LINEAR),v=f(n,r,s.NEAREST),y=f(n,r,s.NEAREST),b=p(n,r,s.NEAREST)};x();let S;addEventListener(`resize`,()=>{clearTimeout(S),S=setTimeout(x,160)});let C=()=>o.width/o.height,w=(t,n,r,i,a)=>{let o=d(`splat`);s.uniform1i(o.uTarget,g.read.bind(0)),s.uniform1f(o.aspectRatio,C()),s.uniform2f(o.point,t,n),s.uniform3f(o.color,r,i,0);let c=e.radius/100;C()>1&&(c*=C()),s.uniform1f(o.radius,c),h(g.write),g.swap(),s.uniform1i(o.uTarget,_.read.bind(0)),s.uniform3f(o.color,a[0],a[1],a[2]),h(_.write),_.swap()},T=e=>{let n=t.length,r=(e%n+n)%n,i=Math.floor(r),a=r-i,o=t[i],s=t[(i+1)%n];return[o[0]+(s[0]-o[0])*a,o[1]+(s[1]-o[1])*a,o[2]+(s[2]-o[2])*a]},E=[],D=(e,t,n=9,r=950,i=.012,a=0,o=.14)=>{let s=Math.random()*4;for(let c=0;c<n;c++){let l=c/n*Math.PI*2+Math.random()*.4,u=T(s+c*.35).map(e=>e*o);E.push({at:performance.now()+a+c*14,x:e+Math.cos(l)*i,y:t+Math.sin(l)*i*C(),dx:Math.cos(l)*r,dy:Math.sin(l)*r,c:u})}j()},O={x:0,y:0,px:0,py:0,moved:!1,seen:!1},k=performance.now(),A=!1,j=()=>{k=performance.now(),A&&(A=!1,L=performance.now())};addEventListener(`pointermove`,e=>{if(e.pointerType===`touch`)return;let t=e.clientX/innerWidth,n=1-e.clientY/innerHeight;O.seen||=(O.px=t,O.py=n,!0),O.x=t,O.y=n,O.moved=!0,O.overPhoto=!!e.target.closest?.(`.hero-photo-wrap`),j()},{passive:!0}),addEventListener(`pointerdown`,e=>{e.pointerType===`touch`||e.target.closest(`a, button, input, .demo, .rv-track`)||D(e.clientX/innerWidth,1-e.clientY/innerHeight)});let M=scrollY,N=0;addEventListener(`scroll`,()=>{N+=(scrollY-M)/innerHeight,M=scrollY,j()},{passive:!0});let P=()=>{if(!O.moved)return;O.moved=!1;let t=O.x-O.px,n=O.y-O.py,r=Math.hypot(t*C(),n),i=Math.min(8,Math.max(1,Math.ceil(r/.012))),a=(.018+Math.min(r*.5,.05))*(1.6/i+.25)*(O.overPhoto?.1:1),o=T(performance.now()*18e-5).map(e=>e*a),s=t*e.force,c=n*e.force;C()<1&&(s*=C());for(let e=1;e<=i;e++){let r=e/i;w(O.px+t*r,O.py+n*r,s*2/i,c*2/i,o)}O.px=O.x,O.py=O.y},F=t=>{s.disable(s.BLEND);let n=d(`curl`);s.uniform2f(n.texelSize,g.read.tx,g.read.ty),s.uniform1i(n.uVelocity,g.read.bind(0)),h(y),n=d(`vorticity`),s.uniform2f(n.texelSize,g.read.tx,g.read.ty),s.uniform1i(n.uVelocity,g.read.bind(0)),s.uniform1i(n.uCurl,y.bind(1)),s.uniform1f(n.curl,e.curl),s.uniform1f(n.dt,t),h(g.write),g.swap(),n=d(`divergence`),s.uniform2f(n.texelSize,g.read.tx,g.read.ty),s.uniform1i(n.uVelocity,g.read.bind(0)),h(v),n=d(`clear`),s.uniform1i(n.uTexture,b.read.bind(0)),s.uniform1f(n.value,e.pressure),h(b.write),b.swap(),n=d(`pressure`),s.uniform2f(n.texelSize,g.read.tx,g.read.ty),s.uniform1i(n.uDivergence,v.bind(0));for(let t=0;t<e.iterations;t++)s.uniform1i(n.uPressure,b.read.bind(1)),h(b.write),b.swap();n=d(`gradient`),s.uniform2f(n.texelSize,g.read.tx,g.read.ty),s.uniform1i(n.uPressure,b.read.bind(0)),s.uniform1i(n.uVelocity,g.read.bind(1)),h(g.write),g.swap(),n=d(`advect`),s.uniform2f(n.texelSize,g.read.tx,g.read.ty),s.uniform1f(n.dt,t),s.uniform1f(n.shift,N),s.uniform1i(n.uVelocity,g.read.bind(0)),s.uniform1i(n.uSource,g.read.bind(0)),s.uniform1f(n.dissipation,e.velocity),h(g.write),g.swap(),s.uniform1i(n.uVelocity,g.read.bind(0)),s.uniform1i(n.uSource,_.read.bind(1)),s.uniform1f(n.dissipation,e.density),h(_.write),_.swap(),N=0},I=()=>{let e=d(`display`);s.uniform2f(e.texelSize,1/s.drawingBufferWidth,1/s.drawingBufferHeight),s.uniform1i(e.uTexture,_.read.bind(0)),s.enable(s.BLEND),s.blendFunc(s.ONE,s.ONE_MINUS_SRC_ALPHA),h(null)},L=performance.now();return(function e(t){if(requestAnimationFrame(e),document.hidden)return;if(!A&&t-k>6500&&!E.length){A=!0,s.bindFramebuffer(s.FRAMEBUFFER,null),s.clearColor(0,0,0,0),s.clear(s.COLOR_BUFFER_BIT),[_.read,_.write].forEach(e=>{s.bindFramebuffer(s.FRAMEBUFFER,e.fbo),s.clear(s.COLOR_BUFFER_BIT)});return}if(A)return;let n=Math.min((t-L)/1e3,1/60);L=t,P();for(let e=E.length-1;e>=0;e--){let n=E[e];n.at<=t&&(w(n.x,n.y,n.dx,n.dy,n.c),E.splice(e,1))}F(n),I()})(L),{burst:D,sweep(e){let t=e.getBoundingClientRect(),n=Math.random()*4;for(let e=0;e<16;e++){let r=(t.left+t.width*e/15)/innerWidth,i=1-(t.top+t.height*(.25+Math.random()*.5))/innerHeight;E.push({at:performance.now()+380+e*42,x:r,y:i,dx:520+Math.random()*380,dy:(Math.random()-.5)*520,c:T(n+e/8).map(e=>e*.1)})}j()}}}export{a as initFluid};
//# sourceMappingURL=fluid-C5Lli9sq.js.map