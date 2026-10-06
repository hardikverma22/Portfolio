// Hero FX, after the old portfolio's hero:
//  · portrait, B&W photo revealed as halftone; a gooey 3-lens metaball
//    follows the cursor and shows the colour photo through it; resting
//    the cursor blooms colour across the frame.
//  · x-ray name, letters hollow out / fill in near the cursor.
import { Vector2, Vector3, Color, WebGLRenderer, TextureLoader, ShaderMaterial, Scene, PlaneGeometry, OrthographicCamera, NormalBlending, NoColorSpace, NoBlending, Mesh, LinearFilter } from 'three';
const THREE = { Vector2, Vector3, Color, WebGLRenderer, TextureLoader, ShaderMaterial, Scene, PlaneGeometry, OrthographicCamera, NormalBlending, NoColorSpace, NoBlending, Mesh, LinearFilter };

const VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

/* ---------------------------------------------------------------- portrait */
const PORTRAIT = /* glsl */ `
  precision highp float;
  uniform sampler2D tBW;
  uniform sampler2D tColor;
  uniform vec2  uRes;       // canvas size in px
  uniform vec2  uImg;       // image size (aspect)
  uniform vec2  uL0, uL1, uL2; // lens centres, px, y down
  uniform float uRadius;    // 0..1 hover ease
  uniform float uReveal;    // entrance 0..1
  uniform float uBloom;     // 0..1
  uniform float uCell;      // halftone cell px
  uniform float uTime;
  uniform vec3  uIce;
  uniform vec3  uBg;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
  }
  float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0); return mix(b, a, h) - k*h*(1.0-h); }

  // cover crop, biased towards the top of the photo
  vec2 cover(vec2 uv){
    float ra = uRes.x / uRes.y, ia = uImg.x / uImg.y;
    vec2 s = ra > ia ? vec2(1.0, ia / ra) : vec2(ra / ia, 1.0);
    vec2 o = vec2((1.0 - s.x) * 0.5, (1.0 - s.y) * 0.8);
    return uv * s + o;
  }
  float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }

  void main(){
    vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uRes;
    // halftone grid
    vec2 cell = floor(px / uCell);
    vec2 cc = (cell + 0.5) * uCell;
    vec2 ccUv = vec2(cc.x / uRes.x, 1.0 - cc.y / uRes.y);
    float dCell = length(px - cc) / uCell;               // 0 centre → ~0.7 corner

    vec3 bw  = texture2D(tBW, cover(vUv)).rgb;
    vec3 col = texture2D(tColor, cover(vUv)).rgb;
    float Lc = lum(texture2D(tBW, cover(ccUv)).rgb);

    // entrance: dots grow bottom-up behind a noisy front
    float front = uReveal * 1.75 - 0.25;
    float local = clamp((front - (1.0 - cc.y / uRes.y) - noise(cell * 0.35) * 0.18) * 5.0, 0.0, 1.0);
    float dotR = mix(sqrt(Lc) * 0.62, 0.75, smoothstep(0.6, 1.0, local)) * smoothstep(0.0, 0.35, local);
    float inDot = 1.0 - smoothstep(dotR - 0.06, dotR, dCell);
    vec3 base = bw * 0.92;

    // lens: gooey metaball of three chasing centres
    float R = min(uRes.x, uRes.y) * 0.2 * uRadius + max(uRes.x, uRes.y) * 1.4 * uBloom;
    float f = smin(smin(length(px - uL0) - R, length(px - uL1) - R * 0.72, R * 0.6 + 1.0), length(px - uL2) - R * 0.46, R * 0.6 + 1.0);
    float live = clamp(uRadius * 8.0 + uBloom * 8.0, 0.0, 1.0);
    // normal from the dominant centre for the chromatic offset
    vec2 n = normalize(px - uL0 + 0.0001);

    // band just outside the lens turns into growing colour dots
    float band = R * 0.35 + uCell * 2.0;
    float t = clamp(1.0 - f / band, 0.0, 1.0);             // 1 inside → 0 far
    float colDotR = mix(0.0, 0.78, t);
    float inColDot = 1.0 - smoothstep(colDotR - 0.06, colDotR, dCell);
    float inside = 1.0 - smoothstep(-1.0, 1.0, f);

    vec2 off = n * 0.006 * (1.0 - smoothstep(0.0, R * 0.5, -f)) * live;
    vec3 colCA = vec3(texture2D(tColor, cover(vUv + off)).r, col.g, texture2D(tColor, cover(vUv - off)).b);

    float fIn = max(inside, inColDot * step(0.0, f) * step(f, band)) * live;
    vec3 outc = mix(base, colCA, fIn);
    float alpha = max(inDot, fIn);

    // ice rim + halo of dots just outside
    float rim = (1.0 - smoothstep(0.0, 1.6, abs(f))) * live * (1.0 - uBloom);
    outc = mix(outc, uIce, rim * 0.85);
    alpha = max(alpha, rim * 0.85);
    float halo = (1.0 - smoothstep(dotR * 0.4 - 0.05, dotR * 0.4, dCell)) * smoothstep(band * 1.6, band, f) * step(band, f) * live * (1.0 - uBloom);
    outc = mix(outc, uIce, halo * 0.5);
    alpha = max(alpha, halo * 0.5);

    gl_FragColor = vec4(outc * alpha, alpha);
  }
`;

const BG = new THREE.Color('#0b0d12');
const ICE = new THREE.Color('#7fb2ff');

function fullscreen(canvas, frag, uniforms, { pr = 1, alpha = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha, premultipliedAlpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(pr);
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms, transparent: alpha, blending: alpha ? THREE.NoBlending : THREE.NormalBlending });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  return { renderer, render: () => renderer.render(scene, cam) };
}

const loadTex = (url) => new Promise((res, rej) => new THREE.TextureLoader().load(url, (t) => {
  t.colorSpace = THREE.NoColorSpace; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; res(t);
}, undefined, rej));

/* ---------------------------------------------------------------- portrait */
export async function initPortrait({ wrap, canvas, bwSrc, colorSrc, reduced }) {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const tBW = await loadTex(bwSrc);
  const uniforms = {
    tBW: { value: tBW }, tColor: { value: tBW },
    uRes: { value: new THREE.Vector2(1, 1) },
    uImg: { value: new THREE.Vector2(tBW.image.width, tBW.image.height) },
    uL0: { value: new THREE.Vector2(-999, -999) }, uL1: { value: new THREE.Vector2(-999, -999) }, uL2: { value: new THREE.Vector2(-999, -999) },
    uRadius: { value: 0 }, uReveal: { value: reduced ? 1 : 0 }, uBloom: { value: 0 },
    uCell: { value: Math.max(6, Math.round(9 * dpr)) / dpr }, uTime: { value: 0 },
    uIce: { value: new THREE.Vector3(ICE.r, ICE.g, ICE.b) }, uBg: { value: new THREE.Vector3(BG.r, BG.g, BG.b) },
  };
  const gl = fullscreen(canvas, PORTRAIT, uniforms, { pr: dpr, alpha: true });
  gl.renderer.setClearColor(0x000000, 0);
  wrap.classList.add('is-gl');

  const size = () => {
    const r = wrap.getBoundingClientRect();
    gl.renderer.setSize(r.width, r.height, false);
    uniforms.uRes.value.set(r.width, r.height);
    dirty = true;
  };
  let dirty = true;
  new ResizeObserver(size).observe(wrap);
  size();

  let colorReady = false;
  const st = { hover: 0, target: 0, bloom: 0, rest: 0, mx: 0, my: 0, lastMove: 0, revealing: !reduced, seen: false };
  const L = [new THREE.Vector2(-999, -999), new THREE.Vector2(-999, -999), new THREE.Vector2(-999, -999)];
  const rates = [16, 8, 4.5];

  const onMove = (e) => {
    const r = wrap.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
    if (!colorReady || st.revealing) return;
    if (inside && !st.seen) L.forEach((l) => l.set(x, y));
    if (Math.hypot(x - st.mx, y - st.my) > 6) st.lastMove = performance.now();
    st.mx = x; st.my = y; st.seen = inside; st.target = inside ? 1 : 0;
  };
  wrap.addEventListener('pointermove', onMove);
  wrap.addEventListener('pointerdown', onMove);
  wrap.addEventListener('pointerleave', () => { st.target = 0; st.seen = false; });
  if (!fine) wrap.addEventListener('pointerup', () => { st.target = 0; st.seen = false; });

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '80px' }).observe(wrap);

  let last = performance.now();
  (function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 1 / 30); last = now;
    if (!visible) return;
    st.hover += (st.target - st.hover) * (1 - Math.exp(-dt * 7));
    const resting = st.target && now - st.lastMove > 900;
    st.bloom += ((resting ? 1 : 0) - st.bloom) * (1 - Math.exp(-dt * (resting ? 1.6 : 3.2)));
    L.forEach((l, i) => { const k = 1 - Math.exp(-dt * rates[i]); l.x += (st.mx - l.x) * k; l.y += (st.my - l.y) * k; });
    const settling = Math.abs(st.target - st.hover) > 0.002 || st.bloom > 0.002 || st.target;
    if (!(dirty || settling || st.revealing)) return;
    dirty = false;
    uniforms.uL0.value.copy(L[0]); uniforms.uL1.value.copy(L[1]); uniforms.uL2.value.copy(L[2]);
    uniforms.uRadius.value = st.hover * 0.95 + 0.05 * st.target;
    uniforms.uBloom.value = st.bloom;
    uniforms.uTime.value = now / 1000;
    gl.render();
  })(last);

  return {
    reveal(delay = 0.1, dur = 1.9) {
      if (reduced) { uniforms.uReveal.value = 1; dirty = true; return; }
      const t0 = performance.now() + delay * 1000;
      const step = () => {
        const k = Math.min(1, Math.max(0, (performance.now() - t0) / (dur * 1000)));
        uniforms.uReveal.value = 1 - Math.pow(1 - k, 3);
        dirty = true;
        if (k < 1) requestAnimationFrame(step); else st.revealing = false;
      };
      step();
      // colour texture arrives shortly after the entrance
      setTimeout(async () => {
        try { uniforms.tColor.value = await loadTex(colorSrc); colorReady = true; dirty = true; } catch (_) {}
      }, 900);
    },
  };
}

/* ---------------------------------------------------------------- x-ray name */
export function initXray(chars) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const p = chars.map(() => 0);
  let mx = -9999, my = -9999, active = false;
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; active = true; }, { passive: true });
  (function frame() {
    requestAnimationFrame(frame);
    if (!active) return;
    const radius = Math.max(140, innerWidth * 0.11);
    let moving = false;
    chars.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const d = Math.hypot(r.left + r.width / 2 - mx, r.top + r.height / 2 - my);
      let t = Math.max(0, 1 - d / radius); t = t * t * (3 - 2 * t);
      const n = p[i] + (t - p[i]) * 0.16;
      if (Math.abs(n - p[i]) > 0.001) { p[i] = n; el.style.setProperty('--p', n.toFixed(3)); moving = true; }
    });
    if (!moving) active = false;
  })();
}
