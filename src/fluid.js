// Page-wide fluid ink that follows the cursor (Navier–Stokes, after
// GPU Gems ch. 38 and Pavel Dobryakov's WebGL-Fluid-Simulation, MIT).
// Raw WebGL2: half-float ping-pong targets, Jacobi pressure solve,
// vorticity confinement. Ink sticks to the page as it scrolls and the
// simulation sleeps when idle.

const CFG = { sim: 128, dye: 768, density: 1.9, velocity: 0.5, pressure: 0.8, iterations: 20, curl: 22, radius: 0.17, force: 5200 };
// ice → blue → violet → sky, linear RGB
const PALETTE = [[0.78, 0.86, 1.0], [0.31, 0.43, 0.97], [0.49, 0.30, 1.0], [0.30, 0.66, 1.0]];

const VERT = `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv, vL, vR, vT, vB;
uniform vec2 texelSize;
void main(){
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0); vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y); vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;
const H = `#version 300 es
precision highp float; precision highp sampler2D;
in vec2 vUv, vL, vR, vT, vB; out vec4 o;
`;
const FRAG = {
  clear: H + `uniform sampler2D uTexture; uniform float value; void main(){ o = value * texture(uTexture, vUv); }`,
  splat: H + `uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
    void main(){ vec2 p = vUv - point; p.x *= aspectRatio; vec3 s = exp(-dot(p, p) / radius) * color; o = vec4(texture(uTarget, vUv).xyz + s, 1.0); }`,
  advect: H + `uniform sampler2D uVelocity, uSource; uniform vec2 texelSize; uniform float dt, dissipation, shift;
    void main(){
      vec2 c = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
      c.y -= shift;
      vec4 r = texture(uSource, c) / (1.0 + dissipation * dt);
      if (c.y < 0.0 || c.y > 1.0) r = vec4(0.0);
      o = r;
    }`,
  divergence: H + `uniform sampler2D uVelocity;
    void main(){
      float L = texture(uVelocity, vL).x, R = texture(uVelocity, vR).x, T = texture(uVelocity, vT).y, B = texture(uVelocity, vB).y;
      vec2 C = texture(uVelocity, vUv).xy;
      if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x; if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
      o = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
    }`,
  curl: H + `uniform sampler2D uVelocity;
    void main(){
      float L = texture(uVelocity, vL).y, R = texture(uVelocity, vR).y, T = texture(uVelocity, vT).x, B = texture(uVelocity, vB).x;
      o = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
    }`,
  vorticity: H + `uniform sampler2D uVelocity, uCurl; uniform float curl, dt;
    void main(){
      float L = texture(uCurl, vL).x, R = texture(uCurl, vR).x, T = texture(uCurl, vT).x, B = texture(uCurl, vB).x, C = texture(uCurl, vUv).x;
      vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      f /= length(f) + 0.0001; f *= curl * C; f.y *= -1.0;
      vec2 v = texture(uVelocity, vUv).xy + f * dt;
      o = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
    }`,
  pressure: H + `uniform sampler2D uPressure, uDivergence;
    void main(){
      float L = texture(uPressure, vL).x, R = texture(uPressure, vR).x, T = texture(uPressure, vT).x, B = texture(uPressure, vB).x;
      o = vec4((L + R + B + T - texture(uDivergence, vUv).x) * 0.25, 0.0, 0.0, 1.0);
    }`,
  gradient: H + `uniform sampler2D uPressure, uVelocity;
    void main(){
      float L = texture(uPressure, vL).x, R = texture(uPressure, vR).x, T = texture(uPressure, vT).x, B = texture(uPressure, vB).x;
      vec2 v = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
      o = vec4(v, 0.0, 1.0);
    }`,
  // tone-map the peak channel so dense ink keeps its hue; faint bump specular; alpha = max channel
  display: H + `uniform sampler2D uTexture; uniform vec2 texelSize;
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
    }`,
};

export function initFluid({ reduced } = {}) {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduced || !fine || innerWidth < 768) return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'fx-fluid';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) { canvas.remove(); return null; }
  gl.getExtension('OES_texture_float_linear');

  // ---------- programs ----------
  const compile = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const programs = {};
  for (const [name, src] of Object.entries(FRAG)) {
    const p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, src));
    gl.bindAttribLocation(p, 0, 'aPosition');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const nm = gl.getActiveUniform(p, i).name; u[nm] = gl.getUniformLocation(p, nm); }
    programs[name] = { p, u };
  }
  const use = (name) => { gl.useProgram(programs[name].p); return programs[name].u; };

  // fullscreen triangle
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  // ---------- targets ----------
  const target = (w, h, filter) => {
    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('fbo incomplete');
    gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fbo, w, h, tx: 1 / w, ty: 1 / h, bind(unit) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); return unit; } };
  };
  const pair = (w, h, f) => { let a = target(w, h, f), b = target(w, h, f); return { get read() { return a; }, get write() { return b; }, swap() { [a, b] = [b, a]; } }; };
  const res = (r) => {
    let ar = gl.drawingBufferWidth / gl.drawingBufferHeight; if (ar < 1) ar = 1 / ar;
    const lo = Math.round(r), hi = Math.round(r * ar);
    return gl.drawingBufferWidth > gl.drawingBufferHeight ? [hi, lo] : [lo, hi];
  };
  const draw = (t) => {
    if (t) { gl.viewport(0, 0, t.w, t.h); gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo); }
    else { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  let vel, dye, div, curl, pres;
  const build = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
    const [sw, sh] = res(CFG.sim), [dw, dh] = res(CFG.dye);
    vel = pair(sw, sh, gl.LINEAR); dye = pair(dw, dh, gl.LINEAR);
    div = target(sw, sh, gl.NEAREST); curl = target(sw, sh, gl.NEAREST); pres = pair(sw, sh, gl.NEAREST);
  };
  build();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 160); });

  // ---------- splats ----------
  const aspect = () => canvas.width / canvas.height;
  const splat = (x, y, dx, dy, color) => {
    let u = use('splat');
    gl.uniform1i(u.uTarget, vel.read.bind(0));
    gl.uniform1f(u.aspectRatio, aspect());
    gl.uniform2f(u.point, x, y);
    gl.uniform3f(u.color, dx, dy, 0);
    let r = CFG.radius / 100; if (aspect() > 1) r *= aspect();
    gl.uniform1f(u.radius, r);
    draw(vel.write); vel.swap();
    gl.uniform1i(u.uTarget, dye.read.bind(0));
    gl.uniform3f(u.color, color[0], color[1], color[2]);
    draw(dye.write); dye.swap();
  };
  const paletteAt = (t) => {
    const n = PALETTE.length, f = ((t % n) + n) % n, i = Math.floor(f), k = f - i;
    const a = PALETTE[i], b = PALETTE[(i + 1) % n];
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  };
  const queue = [];
  const burst = (x, y, count = 9, strength = 950, spread = 0.012, delay = 0, bright = 0.14) => {
    const seed = Math.random() * 4;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const c = paletteAt(seed + i * 0.35).map((v) => v * bright);
      queue.push({ at: performance.now() + delay + i * 14, x: x + Math.cos(a) * spread, y: y + Math.sin(a) * spread * aspect(), dx: Math.cos(a) * strength, dy: Math.sin(a) * strength, c });
    }
    wake();
  };

  // ---------- pointer ----------
  const ptr = { x: 0, y: 0, px: 0, py: 0, moved: false, seen: false };
  let lastInput = performance.now(), sleeping = false;
  const wake = () => { lastInput = performance.now(); if (sleeping) { sleeping = false; last = performance.now(); } };
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const x = e.clientX / innerWidth, y = 1 - e.clientY / innerHeight;
    if (!ptr.seen) { ptr.px = x; ptr.py = y; ptr.seen = true; }
    ptr.x = x; ptr.y = y; ptr.moved = true;
    ptr.overPhoto = !!e.target.closest?.('.hero-photo-wrap');
    wake();
  }, { passive: true });
  addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.target.closest('a, button, input, .demo, .rv-track')) return;
    burst(e.clientX / innerWidth, 1 - e.clientY / innerHeight);
  });

  // scroll: shift the ink with the page
  let lastScroll = scrollY, shift = 0;
  addEventListener('scroll', () => { shift += (scrollY - lastScroll) / innerHeight; lastScroll = scrollY; wake(); }, { passive: true });

  const pointerSplats = () => {
    if (!ptr.moved) return;
    ptr.moved = false;
    const dxu = ptr.x - ptr.px, dyu = ptr.y - ptr.py;
    const dist = Math.hypot(dxu * aspect(), dyu);
    const steps = Math.min(8, Math.max(1, Math.ceil(dist / 0.012)));
    const k = (0.018 + Math.min(dist * 0.5, 0.05)) * (1.6 / steps + 0.25) * (ptr.overPhoto ? 0.1 : 1);
    const col = paletteAt(performance.now() * 0.00018).map((v) => v * k);
    let fx = dxu * CFG.force, fy = dyu * CFG.force;
    if (aspect() < 1) fx *= aspect();
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      splat(ptr.px + dxu * t, ptr.py + dyu * t, (fx * 2) / steps, (fy * 2) / steps, col);
    }
    ptr.px = ptr.x; ptr.py = ptr.y;
  };

  // ---------- step ----------
  const step = (dt) => {
    gl.disable(gl.BLEND);
    let u = use('curl');
    gl.uniform2f(u.texelSize, vel.read.tx, vel.read.ty);
    gl.uniform1i(u.uVelocity, vel.read.bind(0));
    draw(curl);

    u = use('vorticity');
    gl.uniform2f(u.texelSize, vel.read.tx, vel.read.ty);
    gl.uniform1i(u.uVelocity, vel.read.bind(0));
    gl.uniform1i(u.uCurl, curl.bind(1));
    gl.uniform1f(u.curl, CFG.curl); gl.uniform1f(u.dt, dt);
    draw(vel.write); vel.swap();

    u = use('divergence');
    gl.uniform2f(u.texelSize, vel.read.tx, vel.read.ty);
    gl.uniform1i(u.uVelocity, vel.read.bind(0));
    draw(div);

    u = use('clear');
    gl.uniform1i(u.uTexture, pres.read.bind(0));
    gl.uniform1f(u.value, CFG.pressure);
    draw(pres.write); pres.swap();

    u = use('pressure');
    gl.uniform2f(u.texelSize, vel.read.tx, vel.read.ty);
    gl.uniform1i(u.uDivergence, div.bind(0));
    for (let i = 0; i < CFG.iterations; i++) { gl.uniform1i(u.uPressure, pres.read.bind(1)); draw(pres.write); pres.swap(); }

    u = use('gradient');
    gl.uniform2f(u.texelSize, vel.read.tx, vel.read.ty);
    gl.uniform1i(u.uPressure, pres.read.bind(0));
    gl.uniform1i(u.uVelocity, vel.read.bind(1));
    draw(vel.write); vel.swap();

    u = use('advect');
    gl.uniform2f(u.texelSize, vel.read.tx, vel.read.ty);
    gl.uniform1f(u.dt, dt); gl.uniform1f(u.shift, shift);
    gl.uniform1i(u.uVelocity, vel.read.bind(0));
    gl.uniform1i(u.uSource, vel.read.bind(0));
    gl.uniform1f(u.dissipation, CFG.velocity);
    draw(vel.write); vel.swap();
    gl.uniform1i(u.uVelocity, vel.read.bind(0));
    gl.uniform1i(u.uSource, dye.read.bind(1));
    gl.uniform1f(u.dissipation, CFG.density);
    draw(dye.write); dye.swap();
    shift = 0;
  };
  const display = () => {
    const u = use('display');
    gl.uniform2f(u.texelSize, 1 / gl.drawingBufferWidth, 1 / gl.drawingBufferHeight);
    gl.uniform1i(u.uTexture, dye.read.bind(0));
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    draw(null);
  };

  let last = performance.now();
  (function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    if (!sleeping && now - lastInput > 6500 && !queue.length) {
      sleeping = true;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      [dye.read, dye.write].forEach((t) => { gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo); gl.clear(gl.COLOR_BUFFER_BIT); });
      return;
    }
    if (sleeping) return;
    const dt = Math.min((now - last) / 1000, 1 / 60); last = now;
    pointerSplats();
    for (let i = queue.length - 1; i >= 0; i--) {
      const q = queue[i];
      if (q.at <= now) { splat(q.x, q.y, q.dx, q.dy, q.c); queue.splice(i, 1); }
    }
    step(dt);
    display();
  })(last);

  return {
    burst,
    // ink sweep left → right across an element (the hero name on entrance)
    sweep(el) {
      const r = el.getBoundingClientRect();
      const t0 = Math.random() * 4;
      for (let i = 0; i < 16; i++) {
        const x = (r.left + (r.width * i) / 15) / innerWidth;
        const y = 1 - (r.top + r.height * (0.25 + Math.random() * 0.5)) / innerHeight;
        queue.push({ at: performance.now() + 380 + i * 42, x, y, dx: 520 + Math.random() * 380, dy: (Math.random() - 0.5) * 520, c: paletteAt(t0 + i / 8).map((v) => v * 0.1) });
      }
      wake();
    },
  };
}
