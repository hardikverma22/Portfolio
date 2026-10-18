// Steam at the chai stall, drawn by a small fragment shader: a soft, drifting plume from the kettle while
// the chaiwala is out, and a fuller one from a glass once it's poured. One canvas over the stall, plain
// WebGL (no library), and it only runs while the stall is on screen. Without WebGL, or with reduced
// motion, the stall keeps its drawn steam lines instead.

// the tip of the kettle's spout, in the kettle's own units (see the vendor drawing in main.js)
const SPOUT = [77, -58];
// plume shapes: the kettle's is wider, softer and drifts left, into the booth; the glass's rises straight up
const SHAPE = new Float32Array([1.5, -26, 0.15, 0, 1, 0, 0, 0]);

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

// value noise + fbm; each emitter is a plume rising from a point, widening as it climbs, swaying with
// noise, thinning out at the top. Output is premultiplied cream.
const FRAG = `precision mediump float;
uniform vec2 res; uniform float t, dpr;
uniform vec4 em[2]; // x, y (px from top-left), strength, height (px)
uniform vec4 sh[2]; // width scale, lean (px across the full height), wisp softness, unused
float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int k = 0; k < 4; k++) { v += a * n(p); p = p * 2.03 + 7.1; a *= 0.5; } return v; }
float plume(vec2 px, vec4 e, vec4 s) {
  if (e.z <= 0.0) return 0.0;
  float up = (e.y - px.y) / e.w;               // 0 at the source, 1 at the top
  if (up < 0.0 || up > 1.0) return 0.0;
  float sway = (fbm(vec2(up * 2.2 - t * 0.35, e.x * 0.01)) - 0.5) * 34.0 * up;
  float w = mix(8.0, 30.0, up) * s.x;          // narrow at the source, wide as it rises
  float dx = (px.x - e.x - sway - s.y * up * up) / w;
  float body = exp(-dx * dx * 1.6);
  float wisps = fbm(vec2(dx * 1.3, up * 3.2 - t * 0.9) * 2.0) + 0.25 * (1.0 - smoothstep(0.0, 0.2, up));
  float fade = smoothstep(0.0, 0.04, up) * (1.0 - smoothstep(0.45, 1.0, up));
  return body * smoothstep(0.35 - s.z, 0.85 + s.z, wisps) * fade * e.z;
}
void main() {
  vec2 px = vec2(gl_FragCoord.x, res.y - gl_FragCoord.y) / dpr;
  float a = clamp(plume(px, em[0], sh[0]) + plume(px, em[1], sh[1]), 0.0, 0.75);
  gl_FragColor = vec4(vec3(1.0, 0.98, 0.94) * a, a);
}`;

export function initSteam({ reduced }) {
  const stall = document.getElementById('stall');
  if (!stall || reduced) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'st-steam';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = { res: gl.getUniformLocation(prog, 'res'), t: gl.getUniformLocation(prog, 't'), dpr: gl.getUniformLocation(prog, 'dpr'), em: gl.getUniformLocation(prog, 'em'), sh: gl.getUniformLocation(prog, 'sh') };
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  stall.append(canvas);
  stall.classList.add('gl-steam-on'); // hides the drawn steam lines it replaces

  let dpr = 1, W = 0, H = 0;
  function size() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(1.5, devicePixelRatio || 1);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  // each plume eases in and out rather than popping
  const mix = [0, 0], str = [0.7, 1];
  const em = new Float32Array(8);
  function emitters() {
    const c = canvas.getBoundingClientRect();
    const out = [[0, 0, 0, 1], [0, 0, 0, 1]];
    // the kettle, while the chaiwala is out
    // (anchored to the spout's tip in the kettle's own drawing, so it follows the kettle as it tips)
    const k = stall.classList.contains('serving') && stall.querySelector('.sv-kbody');
    const m = k && k.getScreenCTM();
    if (m) { const x = m.a * SPOUT[0] + m.c * SPOUT[1] + m.e, y = m.b * SPOUT[0] + m.d * SPOUT[1] + m.f; out[0] = [x - c.left, y - c.top, 0.7, 85]; }
    // a freshly poured glass
    const g = stall.querySelector('.glass.steaming .gl-cup'), hov = !g && stall.querySelector('.glass:hover .gl-cup, .glass:focus-visible .gl-cup');
    if (g || hov) { const cup = g || hov, r = (cup.querySelector('svg') || cup).getBoundingClientRect(); out[1] = [r.left + r.width / 2 - c.left, r.top + r.height * (32 / 92) - c.top, g ? 1 : 0.5, g ? 140 : 90]; } // the rim sits at y 30 of the glass's 92-unit drawing
    out.forEach((e, i) => {
      mix[i] += ((e[2] > 0 ? 1 : 0) - mix[i]) * 0.06;
      if (e[2] > 0) em.set(e, i * 4); // keep the last position while it fades out
      if (e[2] > 0) str[i] = e[2];
      em[i * 4 + 2] = str[i] * mix[i];
    });
  }

  let raf = 0, visible = false, t0 = performance.now();
  function frame(now) {
    raf = 0;
    if (!visible) return;
    // the stall changes size as the chaiwala arrives; keep the canvas matched to it
    if (Math.abs(canvas.clientWidth - W) > 0.5 || Math.abs(canvas.clientHeight - H) > 0.5) size();
    emitters();
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    if (mix[0] > 0.01 || mix[1] > 0.01) {
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.t, (now - t0) / 1000);
      gl.uniform1f(U.dpr, dpr);
      gl.uniform4fv(U.em, em);
      gl.uniform4fv(U.sh, SHAPE);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    raf = requestAnimationFrame(frame);
  }
  // run only while the stall is on screen (checked on scroll as well as by the observer, since a long
  // programmatic jump down the page can land there without the observer reporting it)
  function check() {
    const r = stall.getBoundingClientRect();
    visible = r.bottom > -160 && r.top < innerHeight + 160;
    if (visible && !raf) { size(); raf = requestAnimationFrame(frame); }
  }
  new IntersectionObserver(check).observe(stall);
  addEventListener('scroll', check, { passive: true });
  addEventListener('resize', check);
  check();
}
