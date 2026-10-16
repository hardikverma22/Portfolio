// One auto ride. Below the town a wide road curves in from off the edge of the screen and sweeps across
// the page behind the content, then curves away again before the journey (which has a highway of its
// own). After the journey it curves back in and ends in a parking bay beside the postbox. The bot's auto
// drives it as you scroll, easing toward where it should be every frame, like a vehicle would.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const $ = (s, r = document) => r.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';

// the auto from above, nose down the road: three wheels, a ribbed canopy, the bot at the wheel looking
// out through the windscreen, mirrors, number plates, and lights that do what lights do
const AUTO = `<svg viewBox="-32 -56 64 136">
  <defs>
    <linearGradient id="ride-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4cc" stop-opacity=".85"/><stop offset="1" stop-color="#fff4cc" stop-opacity="0"/></linearGradient>
    <radialGradient id="ride-red"><stop offset="0" stop-color="#ff4d4d" stop-opacity=".95"/><stop offset="1" stop-color="#ff4d4d" stop-opacity="0"/></radialGradient>
    <linearGradient id="ride-can" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f0bf22"/><stop offset=".35" stop-color="#ffd84a"/><stop offset=".65" stop-color="#ffd84a"/><stop offset="1" stop-color="#e8b31c"/></linearGradient>
  </defs>
  <path class="ride-beam" d="M-5 41 L-22 80 H22 L5 41 Z" fill="url(#ride-beam)"/>
  <g class="ride-speed" stroke="#fffaf0" stroke-width="2.6" stroke-linecap="round"><path d="M-14 -50 v-14"/><path d="M14 -50 v-10"/><path d="M0 -52 v-18"/></g>
  <g class="ride-brake"><circle cx="-11" cy="-45" r="8" fill="url(#ride-red)"/><circle cx="11" cy="-45" r="8" fill="url(#ride-red)"/></g>
  <g class="ride-body">
    <ellipse cx="4" cy="2" rx="22" ry="44" fill="rgba(20,16,40,.22)"/>
    <rect x="-23" y="-34" width="7" height="16" rx="3" fill="#2a2638"/><rect x="16" y="-34" width="7" height="16" rx="3" fill="#2a2638"/>
    <rect x="-3.5" y="30" width="7" height="13" rx="3" fill="#2a2638"/>
    <path d="M-19 -38 Q-19 -45 -12 -45 H12 Q19 -45 19 -38 V10 Q19 27 9 38 Q0 44 -9 38 Q-19 27 -19 10 Z" fill="#1f8a4c" stroke="#211c33" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M-13 30 Q0 37 13 30" fill="none" stroke="#3aa866" stroke-width="2.5" stroke-linecap="round"/>
    <rect x="-17" y="-44" width="34" height="9" rx="4" fill="#2a2638" stroke="#211c33" stroke-width="2"/>
    <rect x="-6" y="-48" width="12" height="5" rx="1.2" fill="#fffaf0" stroke="#211c33" stroke-width="1.4"/>
    <rect x="-14" y="-47.5" width="5" height="3.5" rx="1" fill="#c0392b"/><rect x="9" y="-47.5" width="5" height="3.5" rx="1" fill="#c0392b"/>
    <path d="M-17 -38 Q-17 -41 -13 -41 H13 Q17 -41 17 -38 V12 Q17 17 12 17 H-12 Q-17 17 -17 12 Z" fill="url(#ride-can)" stroke="#211c33" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M-15 -28 H15 M-15 -17 H15 M-15 -6 H15 M-15 5 H15" stroke="#211c33" stroke-width="1.4" opacity=".22"/>
    <path d="M-11 -36 Q-11 -38 -9 -38 H-3" stroke="#fff6c4" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    <rect x="-11.5" y="17" width="23" height="9" rx="3.5" fill="#cfe8f7" stroke="#211c33" stroke-width="2"/>
    <g transform="translate(0 19)"><rect x="-6" y="-1" width="12" height="9" rx="3" fill="#fff8e6" stroke="#211c33" stroke-width="1.6"/><rect x="-4.2" y="1" width="8.4" height="4.6" rx="1.4" fill="#211c33"/><circle class="ride-eye" cx="-1.8" cy="3.3" r="1.1" fill="#7dffb0"/><circle class="ride-eye" cx="1.8" cy="3.3" r="1.1" fill="#7dffb0"/></g>
    <path d="M-8 26 l3 2 M8 26 l-3 2" stroke="#211c33" stroke-width="2" stroke-linecap="round"/>
    <path d="M-19 20 h-5" stroke="#211c33" stroke-width="2"/><circle cx="-25" cy="20" r="2.8" fill="#cfe8f7" stroke="#211c33" stroke-width="1.6"/>
    <path d="M19 20 h5" stroke="#211c33" stroke-width="2"/><circle cx="25" cy="20" r="2.8" fill="#cfe8f7" stroke="#211c33" stroke-width="1.6"/>
    <path d="M0 -5 v-10" stroke="#211c33" stroke-width="2.2" stroke-linecap="round"/>
    <circle class="ride-ball" cx="0" cy="-16" r="4" fill="#ef6a5b" stroke="#211c33" stroke-width="2"/><circle cx="-1.3" cy="-17.3" r="1.1" fill="#fff" opacity=".8"/>
    <circle class="ind ind-l" cx="16" cy="28" r="2.6" fill="#ffb020"/><circle class="ind ind-r" cx="-16" cy="28" r="2.6" fill="#ffb020"/>
    <circle cx="0" cy="39.5" r="3" fill="#fff3c4" stroke="#211c33" stroke-width="1.6"/>
  </g>
</svg>`;

// one smooth curve through the waypoints; the road passes every waypoint heading straight down the page,
// so each swing is an even S and every join (town, highway, parking) lines up without a kink
function smooth(pts) {
  let d = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1], h = (y2 - y1) * 0.55;
    d += ` C${x1.toFixed(1)} ${(y1 + h).toFixed(1)} ${x2.toFixed(1)} ${(y2 - h).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return d;
}
const M = (p) => `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
function sample(d, step) {
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', d);
  const L = p.getTotalLength(), X = [], Y = [];
  for (let s = 0; s <= L; s += step) { const q = p.getPointAtLength(s); X.push(q.x); Y.push(q.y); }
  return { L, X, Y };
}
// a road drawn in layers: kerb, surface, centre line; `paint` decides the colours
function road(svg, d, w, paint, extra = '') {
  for (const [cls, sw] of [['r-edge', w + 8], ['r-surf', w], ['r-lane', w > 60 ? 4 : 3]]) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d); p.setAttribute('class', `${cls} ${extra}`); p.setAttribute('stroke-width', sw);
    if (paint[cls]) p.setAttribute('stroke', paint[cls]);
    svg.appendChild(p);
  }
}

export function initGuide({ reduced }) {
  const route = $('#route'), svg = $('#route-svg'), junction = $('#junction'), ride = $('#ride');
  const town = $('#town'), journey = $('#journey'), postbox = $('#postbox');
  ride.innerHTML = AUTO;
  const autoSvg = ride.firstElementChild;
  const STEP = 4;
  let A = null, B = null, jTop = 0, jBot = 0, built = false;
  const eye = () => innerHeight * 0.6;

  function build() {
    const vw = document.documentElement.clientWidth, vh = innerHeight, docH = document.documentElement.scrollHeight;
    const phone = vw < 760;
    const pageTop = (el) => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };
    for (const s of [svg, junction]) { s.setAttribute('viewBox', `0 0 ${vw} ${docH}`); s.setAttribute('width', vw); s.setAttribute('height', docH); s.innerHTML = ''; }
    route.style.height = `${docH}px`;
    const w = phone ? 44 : 84;
    const lo = vw * (phone ? 0.17 : 0.12), hi = vw * (phone ? 0.83 : 0.88), span = vh * (phone ? 0.85 : 1.05);
    const yB = pageTop(town) + town.offsetHeight;
    jTop = pageTop(journey); jBot = jTop + journey.offsetHeight;

    function swings(from, to, startSide) {
      const out = [];
      let side = startSide, y = from + span * 0.6;
      while (y < to - span * 0.55) { out.push([side, y]); side = side === lo ? hi : lo; y += span; }
      return out;
    }
    // in from off the right edge, a sweeping turn, then side to side
    const enter = (y, first) => `M${(vw + w * 2).toFixed(1)} ${y.toFixed(1)} C${(vw * 0.62).toFixed(1)} ${y.toFixed(1)} ${first[0].toFixed(1)} ${(first[1] - span * 0.45).toFixed(1)} ${first[0].toFixed(1)} ${first[1].toFixed(1)}`;
    // and out again off the left edge
    const leave = (last, y) => ` C${last[0].toFixed(1)} ${(last[1] + span * 0.45).toFixed(1)} ${(vw * 0.38).toFixed(1)} ${y.toFixed(1)} ${(-w * 2).toFixed(1)} ${y.toFixed(1)}`;

    // A: below the town, off-screen right → … → off-screen left before the journey
    let midA = swings(yB + vh * 0.15, jTop, lo);
    if (!midA.length) midA = [[lo, (yB + jTop) / 2]];
    if (midA[midA.length - 1][0] === lo && midA.length > 1) midA.pop();
    const dA = enter(yB + vh * 0.12, midA[0]) + smooth(midA) + leave(midA[midA.length - 1], jTop - vh * 0.08);
    // B: after the journey, off-screen right → … → the parking bay by the postbox
    const park = [Math.max(lo, postbox.getBoundingClientRect().left + scrollX - w * 1.2), pageTop(postbox) + postbox.offsetHeight - w * 0.6];
    let midB = swings(jBot + vh * 0.1, park[1], lo);
    if (!midB.length) midB = [[lo, (jBot + park[1]) / 2]];
    const ptsB = [...midB, park];
    const dB = enter(jBot + vh * 0.1, midB[0]) + smooth(ptsB);

    road(svg, dA, w, {});
    road(svg, dB, w, {});
    svg.insertAdjacentHTML('beforeend', `<g class="r-park" transform="translate(${park[0].toFixed(1)} ${park[1].toFixed(1)})">
      <rect x="${-w * 0.9}" y="${-w * 0.55}" width="${w * 1.8}" height="${w * 1.5}" rx="${w * 0.4}" class="r-bay"/>
      <path d="M${-w * 0.6} ${w * 0.75} h${w * 1.2}" class="r-bay-line"/></g>`);
    for (const [id, d] of [['A', dA], ['B', dB]]) {
      const t = document.createElementNS(NS, 'path');
      t.setAttribute('d', d); t.setAttribute('class', 'r-trail'); t.setAttribute('stroke-width', phone ? 5 : 7); t.dataset.piece = id;
      svg.appendChild(t);
    }
    junction.insertAdjacentHTML('beforeend', `<g class="r-sign" transform="translate(${(park[0] + w * 1.25).toFixed(1)} ${(park[1] - w * 0.2).toFixed(1)})"><path d="M0 0 V-46" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/><rect x="-15" y="-78" width="30" height="34" rx="6" fill="#2e6fb7" stroke="var(--ink)" stroke-width="3"/><text x="0" y="-53" text-anchor="middle">P</text></g>`);
    A = sample(dA, STEP);
    B = sample(dB, STEP);
    gsap.set(ride, { scale: phone ? 0.62 : 1 });
    built = true;
  }

  /* ---------- where on the road ---------- */
  function pt(T, s) {
    const f = gsap.utils.clamp(0, T.X.length - 1, s / STEP), i = Math.floor(f), j = Math.min(T.X.length - 1, i + 1), t = f - i;
    return { x: T.X[i] + (T.X[j] - T.X[i]) * t, y: T.Y[i] + (T.Y[j] - T.Y[i]) * t };
  }
  // the roads head down the page, so a height maps to a distance (the off-screen turns are nearly flat,
  // and the auto simply drives through them)
  function sOnY(T, y) {
    if (y <= T.Y[0]) return 0;
    if (y >= T.Y[T.Y.length - 1]) return T.L;
    let a = 0, b = T.Y.length - 1;
    while (b - a > 1) { const m = (a + b) >> 1; if (T.Y[m] < y) a = m; else b = m; }
    return (a + (y - T.Y[a]) / ((T.Y[b] - T.Y[a]) || 1)) * STEP;
  }
  const goal = () => {
    // at the very bottom of the page the auto pulls all the way into the parking bay
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 6) return A.L + B.L;
    const y = scrollY + eye();
    return y < (jTop + jBot) / 2 ? sOnY(A, y) : A.L + sOnY(B, y);
  };
  const where = (u) => (u <= A.L ? pt(A, u) : pt(B, u - A.L));
  function heading(u) {
    const a = where(u - 10), b = where(u + 10);
    if (Math.hypot(b.x - a.x, b.y - a.y) > 200) return null; // between the two roads
    return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI - 90;
  }

  /* ---------- drive: every frame the auto eases toward where it should be ---------- */
  let u = 0, rot = 0, lastX = 0, lastY = 0, lastV = 0, puffAt = 0;
  function frame() {
    if (!built) return;
    const want = goal();
    // jumping from one road to the other happens off-screen, in one go
    if ((u <= A.L) !== (want <= A.L)) u = want;
    const diff = want - u;
    u = reduced || Math.abs(diff) < 0.3 ? want : u + diff * 0.12;
    const p = where(u), h = heading(u) ?? rot;
    let dr = h - rot; if (dr > 180) dr -= 360; if (dr < -180) dr += 360;
    rot = reduced ? h : rot + dr * 0.22;
    gsap.set(ride, { x: p.x, y: p.y, rotation: rot, autoAlpha: document.documentElement.classList.contains('town-focus') ? 0 : 1 });
    const v = Math.hypot(p.x - lastX, p.y - lastY), acc = v - lastV;
    lastX = p.x; lastY = p.y; lastV = v;
    autoSvg.classList.toggle('braking', acc < -0.6 && v > 1);
    autoSvg.classList.toggle('moving', v > 0.6);
    autoSvg.classList.toggle('fast', v > 9);
    const turn = (heading(u + 70) ?? h) - h;
    autoSvg.classList.toggle('turn-l', turn > 8 && turn < 120);
    autoSvg.classList.toggle('turn-r', turn < -8 && turn > -120);
    if (!reduced && acc > 0.8 && v < 60 && performance.now() - puffAt > 110) { puffAt = performance.now(); puff(p); }
    svg.querySelectorAll('.r-trail').forEach((t) => {
      const L = t.getTotalLength(), done = t.dataset.piece === 'A' ? Math.min(L, u) : Math.max(0, u - A.L);
      t.style.strokeDasharray = `${L} ${L}`; t.style.strokeDashoffset = `${L - Math.min(L, done)}`;
    });
  }
  function puff(p) {
    const r = (rot + 90) * Math.PI / 180, bx = p.x - Math.cos(r) * 40, by = p.y - Math.sin(r) * 40;
    const el = document.createElement('i');
    el.className = 'ride-puff';
    route.appendChild(el);
    gsap.fromTo(el, { x: bx, y: by, scale: 0.4, autoAlpha: 0.7 }, { x: bx + gsap.utils.random(-16, 16), y: by - 20, scale: 1.8, autoAlpha: 0, duration: 0.9, ease: 'power1.out', onComplete: () => el.remove() });
  }

  // the nav follows along
  let current = -2;
  const secs = ['story', 'lab', 'journey', 'passport', 'writing', 'words', 'after-hours', 'stack', 'contact'].map((id) => document.getElementById(id)).filter(Boolean);
  function section() {
    const yy = scrollY + innerHeight * 0.45;
    let k = -1;
    secs.forEach((el, i) => { if (el.getBoundingClientRect().top + scrollY <= yy) k = i; });
    if (k === current) return;
    current = k;
    document.querySelectorAll('.nav a').forEach((l) => l.classList.toggle('on', k >= 0 && l.getAttribute('href') === `#${secs[k].id}`));
  }

  document.addEventListener('town', (e) => { document.documentElement.classList.toggle('town-focus', !!e.detail.open); });
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: section });
  gsap.ticker.add(frame);
  const reset = () => { build(); u = goal(); rot = heading(u) ?? 0; section(); };
  ScrollTrigger.addEventListener('refresh', reset);
  reset();
}
