// Small shader touches for the hero, all soft and quiet so the drawing stays the star.
//  - The sky, behind the town: at night, stars with a soft glow, the odd shooting star and faint wisps
//    drifting past; by day, a warm halo and slowly turning rays around the sun.
//  - The town, over the street layer (so it moves with the parallax): at night, glowing lamp bulbs with a
//    little flicker and dust floating in their light, and fireflies round the trees; by day, cloud shadows
//    drifting across the town and motes in the sunlight. The chai cart steams day and night.
// Plain WebGL, no library. It runs only while the hero is on screen, eases between day and night with
// the site's own switch, and stays off entirely for reduced motion.

import { musicLevel } from './music.js';

const NOISE = `
float h1(float n) { return fract(sin(n) * 43758.5453); }
float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int k = 0; k < 4; k++) { v += a * vn(p); p = p * 2.03 + 7.1; a *= 0.5; } return v; }
`;

// ---- the sky, in screen pixels
const SKY = `precision mediump float;
uniform vec2 res; uniform float t, night, k, beat; uniform vec3 sun; // sun: x, y, radius (px)
${NOISE}
// a star in each cell of a grid, at a random spot, with its own size and twinkle
float stars(vec2 p, float cell, float seed) {
  vec2 c = floor(p / cell), f = p - c * cell;
  float r = h2(c + seed);
  if (r < 0.8) return 0.0;
  vec2 at = vec2(h2(c + seed + 1.3), h2(c + seed + 2.7)) * cell;
  float d = length(f - at);
  float tw = 0.55 + 0.45 * sin(t * (0.8 + 2.0 * h2(c + 9.1)) + r * 40.0);
  // a crisp core with a small soft glow and a faint cross flare, like a bright star seen through air
  vec2 o = abs(f - at);
  float flare = smoothstep(1.0 * k, 0.0, min(o.x, o.y)) * smoothstep(9.0 * k, 0.0, max(o.x, o.y)) * 0.5;
  return (smoothstep(1.3 * k, 0.3 * k, d) + 0.45 * smoothstep(5.0 * k, 0.0, d) + flare) * tw * (r - 0.8) * 5.0;
}
void main() {
  vec2 p = vec2(gl_FragCoord.x, res.y - gl_FragCoord.y);
  float up = 1.0 - p.y / res.y;                     // 1 at the top of the screen, 0 at the bottom
  vec3 col = vec3(0.0); float a = 0.0;
  if (night > 0.01) {
    float s = stars(p, 90.0 * k, 0.0) + 0.5 * stars(p + 400.0, 60.0 * k, 5.0);
    s *= smoothstep(0.35, 0.8, up) * (1.0 + beat * 0.8);   // the stars brighten a touch with the music                 // none down where the buildings are
    // a shooting star every ~9 seconds, crossing the upper sky
    float cyc = floor(t / 9.0), ph = fract(t / 9.0);
    // starts in the open sky on the right, away from the headline; none on narrow screens, where the text fills the sky
    vec2 a0 = vec2(h1(cyc) * 0.25 + 0.5, h1(cyc + 3.0) * 0.15 + 0.04) * res;
    vec2 dir = normalize(vec2(1.0, 0.42));
    vec2 head = a0 + dir * ph * res.x * 0.3;
    vec2 rel = p - head; float along = dot(rel, -dir), across = abs(dot(rel, vec2(-dir.y, dir.x)));
    float trail = step(0.0, along) * smoothstep(160.0 * k, 0.0, along) * smoothstep(2.2 * k, 0.0, across);
    float shoot = trail * smoothstep(0.0, 0.08, ph) * (1.0 - smoothstep(0.22, 0.32, ph)) * step(0.45, h1(cyc + 7.0)) * step(820.0, res.x / k);
    // faint wisps of cloud drifting across
    float w = fbm(vec2(p.x / (520.0 * k) - t * 0.012, p.y / (90.0 * k)));
    float wisp = smoothstep(0.55, 0.85, w) * 0.10 * smoothstep(0.35, 0.8, up);
    col += vec3(1.0, 0.97, 0.88) * (s + shoot) + vec3(0.72, 0.68, 0.95) * wisp;
    a += clamp(s + shoot + wisp, 0.0, 1.0);
    col *= night; a *= night;
  }
  if (night < 0.99 && sun.z > 0.0) {
    vec2 d = p - sun.xy; float r = length(d) / sun.z;
    float ang = atan(d.y, d.x);
    float rays = 0.5 + 0.5 * sin(ang * 9.0 + t * 0.12) * sin(ang * 5.0 - t * 0.08 + 1.3);
    float halo = exp(-r * r * 0.28) * 0.42 + smoothstep(6.0, 1.2, r) * pow(rays, 2.0) * 0.32;
    halo *= (1.0 - night) * smoothstep(0.9, 1.4, r);  // stays clear of the sun's own disc
    col += vec3(1.0, 0.82, 0.42) * halo; a += halo * 0.9;
  }
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
}`;

// ---- the town, in scene units (the drawing's own 1600 x 900 space)
const TOWN = `precision mediump float;
uniform vec2 res; uniform float t, night, u, beat; // u: canvas pixels per scene unit
${NOISE}
const vec2 CUP = vec2(707.0, 675.0);   // the glasses on the chai cart's counter, under its canopy
float soft(float d, float r) { return exp(-(d * d) / (r * r)); }
void main() {
  vec2 p = vec2(gl_FragCoord.x, res.y - gl_FragCoord.y) / u;   // scene units
  vec3 col = vec3(0.0); float a = 0.0;
  // --- by night
  if (night > 0.01) {
    float glow = 0.0, dust = 0.0;
    for (int i = 0; i < 3; i++) {
      float lx = i == 0 ? 398.0 : i == 1 ? 1206.0 : 1614.0;   // the bulbs (lamp x + 26)
      vec2 b = vec2(lx, 606.0);
      float fl = (0.88 + 0.12 * vn(vec2(t * 7.0, float(i) * 9.0))) * (1.0 + beat * 0.6);   // and the lamps swell with it
      glow += (soft(length(p - b), 9.0) * 0.9 + soft(length(p - b), 34.0) * 0.35) * fl;
      // dust drifting through the cone of light under the bulb
      float inCone = step(b.y, p.y) * step(p.y, 712.0) * step(abs(p.x - b.x), (p.y - b.y) * 0.45 + 6.0);
      vec2 q = (p - vec2(0.0, -t * 6.0)) / 7.0;
      vec2 c = floor(q), f = fract(q);
      float spk = step(0.93, h2(c + float(i) * 13.0)) * soft(length(f - vec2(h2(c + 1.7), h2(c + 4.2))), 0.09);
      dust += spk * inCone * fl * (0.6 + 0.4 * sin(t * 2.0 + h2(c) * 30.0));
    }
    // fireflies around the trees: drifting on slow loops and blinking
    float ff = 0.0;
    for (int i = 0; i < 16; i++) {
      float fi = float(i);
      float tx = fi < 4.0 ? 398.0 : fi < 8.0 ? 982.0 : fi < 12.0 ? 1203.0 : 1408.0;
      vec2 home = vec2(tx + (h1(fi * 3.1) - 0.5) * 120.0, 600.0 + h1(fi * 7.3) * 90.0);
      vec2 at = home + vec2(sin(t * (0.3 + 0.2 * h1(fi)) + fi * 2.0) * 26.0, cos(t * (0.25 + 0.2 * h1(fi + 1.0)) + fi) * 14.0);
      float blink = smoothstep(0.35, 0.95, sin(t * (0.6 + 0.5 * h1(fi + 2.0)) + fi * 4.0));
      ff += (soft(length(p - at), 2.2) + soft(length(p - at), 8.0) * (0.45 + beat * 0.5)) * blink;
    }
    col += (vec3(1.0, 0.86, 0.5) * glow + vec3(1.0, 0.93, 0.7) * dust * 0.9 + vec3(0.85, 1.0, 0.55) * ff) * night;
    a += clamp(glow * 0.9 + dust * 0.8 + ff, 0.0, 1.0) * night;
  }
  // --- by day
  if (night < 0.99) {
    float day = 1.0 - night;
    // cloud shadows sliding across the town, only over the buildings and the street
    float cs = fbm(vec2(p.x / 380.0 - t * 0.025, p.y / 160.0));
    float shade = smoothstep(0.5, 0.68, cs) * smoothstep(380.0, 560.0, p.y) * 0.14 * day;
    // motes floating in the sunlight on the sunny side, drifting up
    vec2 q = (p + vec2(t * 4.0, t * 9.0)) / 22.0;
    vec2 c = floor(q), f = fract(q);
    float m = step(0.965, h2(c)) * soft(length(f - vec2(h2(c + 1.3), h2(c + 2.9))), 0.08);
    m *= (0.5 + 0.5 * sin(t * 1.7 + h2(c) * 40.0)) * smoothstep(700.0, 1300.0, p.x) * smoothstep(720.0, 380.0, p.y) * smoothstep(120.0, 300.0, p.y);
    col += vec3(1.0, 0.96, 0.82) * m * 0.9 * day;
    a += shade + m * 0.8 * day;
  }
  // --- the chai cart's steam, always
  float up = (CUP.y - p.y) / 30.0;     // short: it fades out before the canopy
  if (up > 0.0 && up < 1.0) {
    float sway = (fbm(vec2(up * 2.2 - t * 0.35, 3.0)) - 0.5) * 8.0 * up;
    float dx = (p.x - CUP.x - sway) / mix(3.0, 8.0, up);
    float wisp = fbm(vec2(dx * 1.3, up * 3.2 - t * 0.9) * 2.0) + 0.25 * (1.0 - smoothstep(0.0, 0.2, up));
    float st = exp(-dx * dx * 1.6) * smoothstep(0.35, 0.85, wisp) * smoothstep(0.0, 0.05, up) * (1.0 - smoothstep(0.45, 1.0, up)) * mix(0.8, 0.95, night);
    col += vec3(1.0, 0.98, 0.94) * st; a += st;
  }
  // cloud shadows darken (dark colour, low alpha); the lights and steam add light
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
}`;

function layer(canvas, frag) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const vs = sh(gl.VERTEX_SHADER, 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }'), fs = sh(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const cache = {};
  const U = (n) => (n in cache ? cache[n] : (cache[n] = gl.getUniformLocation(prog, n)));
  // canvases render a little under full resolution: everything here is soft, and it saves a lot of work
  const fit = () => {
    const r = canvas.getBoundingClientRect(), s = Math.min(1, devicePixelRatio || 1) * (r.width > 1400 ? 0.7 : 0.85);
    canvas.width = Math.max(1, Math.round(r.width * s)); canvas.height = Math.max(1, Math.round(r.height * s));
    gl.viewport(0, 0, canvas.width, canvas.height);
    return s;
  };
  const draw = (set) => { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.uniform2f(U('res'), canvas.width, canvas.height); set(gl, U); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
  return { fit, draw };
}

export function initHeroFx({ reduced }) {
  const stage = document.getElementById('stage'), street = document.querySelector('.ly-street');
  if (!stage || !street || reduced) return;
  const root = document.documentElement;

  const skyCv = document.createElement('canvas'); skyCv.className = 'fx-sky'; skyCv.setAttribute('aria-hidden', 'true');
  const townCv = document.createElement('canvas'); townCv.className = 'fx-town'; townCv.setAttribute('aria-hidden', 'true');
  stage.prepend(skyCv); street.append(townCv);
  const sky = layer(skyCv, SKY), town = layer(townCv, TOWN);
  if (!sky && !town) { skyCv.remove(); townCv.remove(); return; }
  if (!sky) skyCv.remove();
  if (!town) townCv.remove();
  root.classList.add('fx-on');

  let skyS = 1, townS = 1, night = root.dataset.mode === 'night' ? 1 : 0;
  const fit = () => { if (sky) skyS = sky.fit(); if (town) townS = town.fit(); };
  const sunEl = document.querySelector('.ly-sky .sun circle[r="62"]');
  const target = () => ({ night: 1, dusk: 0.6, dawn: 0.35 }[root.dataset.mode] ?? 0);

  let raf = 0, on = false;
  const t0 = performance.now();
  function frame(now) {
    raf = 0;
    if (!on) return;
    // while the intro covers the hero there is nothing to see, so don't spend frames on it
    if (root.classList.contains('intro')) { raf = requestAnimationFrame(frame); return; }
    const t = (now - t0) / 1000;
    night += (target() - night) * 0.03;
    if (sky) {
      const cr = skyCv.getBoundingClientRect(), sr = sunEl?.getBoundingClientRect();
      sky.draw((gl, U) => {
        gl.uniform1f(U('t'), t); gl.uniform1f(U('night'), night); gl.uniform1f(U('k'), skyS); gl.uniform1f(U('beat'), musicLevel());
        if (sr && sr.width) gl.uniform3f(U('sun'), (sr.left + sr.width / 2 - cr.left) * skyS, (sr.top + sr.height / 2 - cr.top) * skyS, (sr.width / 2) * skyS);
        else gl.uniform3f(U('sun'), 0, 0, 0);
      });
    }
    if (town) {
      town.draw((gl, U) => {
        gl.uniform1f(U('t'), t); gl.uniform1f(U('night'), night); gl.uniform1f(U('beat'), musicLevel());
        gl.uniform1f(U('u'), townCv.width / 1600);
      });
    }
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(([e]) => { on = e.isIntersecting && !document.hidden; if (on) { fit(); start(); } }).observe(stage);
  document.addEventListener('visibilitychange', () => { on = !document.hidden && stage.getBoundingClientRect().bottom > 0; if (on) start(); });
  addEventListener('resize', () => { if (on) fit(); });
}
