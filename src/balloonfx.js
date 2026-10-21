// A small shader layer around the hot-air balloon (it sits just behind the drawing and bobs with it):
//  - the burner's glow, warm and flickering, a little stronger at night;
//  - while the music plays, soft sound-wave rings ripple out from the radio in time with the level,
//    and the envelope gets a faint glowing halo.
// Plain WebGL on a tiny canvas; it runs only while the balloon is on screen, and never for reduced motion.
import { musicLevel } from './music.js';

const FRAG = `precision mediump float;
uniform vec2 res; uniform float t, play, lv, night, s;
uniform vec2 burner, radio; uniform vec3 env; // positions in canvas pixels; env.z is the envelope's radius
float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
void main() {
  vec2 p = vec2(gl_FragCoord.x, res.y - gl_FragCoord.y);
  vec3 col = vec3(0.0); float a = 0.0;
  // the burner: a warm glow that breathes and flickers
  float fl = 0.8 + 0.35 * vn(vec2(t * 9.0, 1.7)) + 0.6 * play * lv;
  float db = length(p - burner) / s;
  float g = (exp(-db * db / 40.0) * 0.9 + exp(-db * db / 420.0) * 0.35) * fl * (0.45 + 0.4 * night);
  col += vec3(1.0, 0.62, 0.25) * g; a += g * 0.85;
  if (play > 0.01) {
    // a soft halo just outside the envelope (its inside is hidden by the drawing)
    float de = length(p - env.xy) / env.z;
    float halo = exp(-pow(max(de - 0.96, 0.0) * 3.2, 1.3)) * step(0.8, de) * play * (0.22 + lv * 0.9) * (0.7 + 0.5 * night);
    col += vec3(1.0, 0.86, 0.55) * halo; a += halo * 0.8;
    // sound-wave rings rippling out from the radio, a new one every ~0.75s
    float dr = length(p - radio) / s, rings = 0.0;
    for (int i = 0; i < 3; i++) {
      float ph = fract(t * 0.45 + float(i) / 3.0);
      float R = 6.0 + ph * 95.0, w = 1.6 + ph * 4.0;
      rings += exp(-pow((dr - R) / w, 2.0)) * pow(1.0 - ph, 1.6);
    }
    rings *= play * (0.25 + lv * 1.3);
    col += vec3(1.0, 0.95, 0.8) * rings; a += rings * 0.7;
  }
  a = clamp(a, 0.0, 0.9);
  gl_FragColor = vec4(min(col, vec3(1.0)) * (a > 0.0 ? 1.0 : 0.0), a);
}`;

export function initBalloonFx({ reduced }) {
  const balloon = document.getElementById('balloon'), canvas = balloon?.querySelector('.bl-fx');
  if (!canvas || reduced) { canvas?.remove(); return; }
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) { canvas.remove(); return; }
  const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null; };
  const vs = sh(gl.VERTEX_SHADER, 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }'), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.remove(); return; }
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const U = {}; for (const n of ['res', 't', 'play', 'lv', 'night', 's', 'burner', 'radio', 'env']) U[n] = gl.getUniformLocation(prog, n);

  // where things are: the balloon is drawn in a -60..60 x -10..180 box that fills the button, and the
  // canvas reaches 70% of its width out to each side and 25% of its height above
  let dpr = 1, W = 0, H = 0;
  const at = (x, y) => [((x + 60) / 120 * W + 0.7 * W) * dpr, ((y + 10) / 190 * H + 0.25 * H) * dpr];
  function size() {
    W = balloon.offsetWidth; H = balloon.offsetHeight;
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.round(W * 2.4 * dpr)); canvas.height = Math.max(1, Math.round(H * 1.6 * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  const root = document.documentElement;
  let raf = 0, visible = false, play = 0, t0 = performance.now();
  function frame(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    if (!root.classList.contains('intro')) {
      play += ((root.classList.contains('music-on') ? 1 : 0) - play) * 0.05;
      const night = root.dataset.mode === 'night' ? 1 : 0, s = (W / 120) * dpr;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.t, (now - t0) / 1000); gl.uniform1f(U.play, play); gl.uniform1f(U.lv, musicLevel());
      gl.uniform1f(U.night, night); gl.uniform1f(U.s, s);
      gl.uniform2f(U.burner, ...at(0, 114)); gl.uniform2f(U.radio, ...at(0, 128));
      const [ex, ey] = at(0, 50); gl.uniform3f(U.env, ex, ey, 54 * s);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && visible) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { size(); start(); } }).observe(balloon);
  document.addEventListener('visibilitychange', start);
  addEventListener('resize', () => { if (visible) size(); });
}
