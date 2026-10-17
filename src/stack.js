// The stack as a Bengaluru gumball machine, and recognition as a rack of medals.
//
// Gumball: forty capsules (colour = tier) tumble in a glass globe with a small hand-rolled physics solver.
// Turn the crank (tap it, or drag it round): it clicks every quarter turn, the capsules jostle, one drops
// down the chute, bounces into the tray and pops open; its slip prints on the side with the tool, where
// I used it and what for. A new capsule of the same tool drops back in from the top so the globe stays full.
// On a narrow screen the slip is below the machine, so the page brings it into view as it prints.
// Not everyone wants to play, so every tool is also listed by tier underneath; tap one to print its slip
// (and its capsule hops in the globe).
//
// Medals: each hangs from a peg on its ribbon and swings like a pendulum when the cursor brushes past.
// Tap one and the coin flips to its back, engraved with what it was for.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { toolbox, toolboxGroups, toolboxMeta, awards } from './data.js';
import { tiffin } from './world.js';
import { mark } from './marks.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const INK = '#211c33';

// a tiny synth for the machine's sounds; created on the first gesture
let ac = null;
function sound(kind) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime, g = ac.createGain();
    g.connect(ac.destination);
    if (kind === 'tick') {
      // a ratchet click: a very short band-passed noise burst
      const n = ac.createBuffer(1, ac.sampleRate * 0.03, ac.sampleRate), d = n.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3;
      const src = ac.createBufferSource(), bp = ac.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 2;
      src.buffer = n; src.connect(bp); bp.connect(g);
      g.gain.setValueAtTime(0.35, t);
      src.start(t);
    } else if (kind === 'pop') {
      const o = ac.createOscillator();
      o.type = 'sine'; o.frequency.setValueAtTime(380, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.08);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      o.connect(g); o.start(t); o.stop(t + 0.16);
    } else if (kind === 'clunk') {
      const o = ac.createOscillator();
      o.type = 'triangle'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.12);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.connect(g); o.start(t); o.stop(t + 0.22);
    } else if (kind === 'clink') {
      for (const [f, v] of [[2100, 0.12], [3150, 0.06]]) {
        const o = ac.createOscillator(), gg = ac.createGain();
        o.frequency.value = f; gg.gain.setValueAtTime(v, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        o.connect(gg); gg.connect(ac.destination); o.start(t); o.stop(t + 0.36);
      }
    }
  } catch { /* no audio, no problem */ }
}

export function initStack({ reduced }) {
  initGumball(reduced);
  initMedals(reduced);
}

/* ---------------------------------------------------------------- gumball */
function initGumball(reduced) {
  const root = $('#gumball');
  if (!root) return;
  const groupOf = { ai: ['ai'], fe: ['fe'], be: ['be'], cloud: ['cloud', 'data', 'ship'], sec: ['sec'] };
  const colour = Object.fromEntries(toolboxGroups.map(([k, , c]) => [k, c]));
  const tierOf = (g) => tiffin.find((t) => groupOf[t.g].includes(g));
  const tools = toolbox.map(([g, code, name, note]) => ({ g, tier: tierOf(g).g, code, name, note, c: colour[tierOf(g).g] }));
  const where = { w: ['walmart', 'Walmart'], f: ['fidelity', 'Fidelity'], t: ['tcs', 'TCS'], p: [null, 'Personal'] };

  root.innerHTML = `
  <div class="gb-machine" id="gb-machine">
    <svg class="gb-back" viewBox="0 0 360 560" aria-hidden="true">
      <ellipse cx="180" cy="548" rx="132" ry="10" fill="rgba(33,28,51,.14)"/>
      <circle cx="180" cy="215" r="135" fill="rgba(255,255,255,.35)"/>
      <circle cx="180" cy="215" r="135" fill="url(#gb-shade)"/>
      <defs>
        <radialGradient id="gb-shade" cx=".5" cy=".55" r=".55"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></radialGradient>
        <linearGradient id="gb-red" x1="0" x2="1"><stop offset="0" stop-color="#d9523f"/><stop offset=".35" stop-color="#ef6a5b"/><stop offset=".7" stop-color="#e45a49"/><stop offset="1" stop-color="#b8402f"/></linearGradient>
        <linearGradient id="gb-steel" x1="0" x2="1"><stop offset="0" stop-color="#9aa0ad"/><stop offset=".45" stop-color="#eef1f5"/><stop offset="1" stop-color="#8a909e"/></linearGradient>
      </defs>
    </svg>
    <canvas class="gb-balls" id="gb-balls" aria-hidden="true"></canvas>
    <svg class="gb-front" viewBox="0 0 360 560" aria-hidden="true">
      <!-- glass: rim and reflections over the capsules -->
      <circle cx="180" cy="215" r="135" fill="none" stroke="${INK}" stroke-width="4"/>
      <path d="M92 150 A105 105 0 0 1 150 96" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".75"/>
      <path d="M80 182 A105 105 0 0 1 84 168" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>
      <path d="M282 270 A110 110 0 0 1 252 318" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".35"/>
      <!-- the lid -->
      <path d="M118 92 Q118 52 180 50 Q242 52 242 92 Z" fill="url(#gb-red)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <rect x="106" y="84" width="148" height="18" rx="7" fill="url(#gb-red)" stroke="${INK}" stroke-width="4"/>
      <path d="M134 70 Q150 58 170 57" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>
      <rect x="171" y="30" width="18" height="24" rx="6" fill="url(#gb-steel)" stroke="${INK}" stroke-width="3.5"/>
      <!-- collar and body -->
      <path d="M126 338 L234 338 L244 368 L116 368 Z" fill="url(#gb-steel)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M112 364 L248 364 Q262 364 266 378 L290 528 Q292 542 278 542 L82 542 Q68 542 70 528 L94 378 Q98 364 112 364 Z" fill="url(#gb-red)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M108 384 L96 520" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".35"/>
      <!-- the plate the crank sits on -->
      <rect x="124" y="386" width="112" height="92" rx="16" fill="url(#gb-steel)" stroke="${INK}" stroke-width="4"/>
      <circle cx="180" cy="432" r="34" fill="#c9c3d6" stroke="${INK}" stroke-width="3"/>
      <!-- chute, flap and tray -->
      <rect x="146" y="488" width="68" height="40" rx="10" fill="#2a2440" stroke="${INK}" stroke-width="4"/>
      <path class="gb-flap" transform="rotate(0 180 492)" d="M150 492 H210 V512 Q180 518 150 512 Z" fill="url(#gb-steel)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M136 526 Q136 548 160 548 H200 Q224 548 224 526" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    </svg>
    <button class="gb-crank" id="gb-crank" aria-label="Turn the crank for a random tool from my stack">
      <svg viewBox="-40 -40 80 80" aria-hidden="true"><circle r="27" fill="url(#gb-knob)" stroke="${INK}" stroke-width="4"/>
        <defs><radialGradient id="gb-knob" cx=".35" cy=".3"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#a9a2bb"/></radialGradient></defs>
        <rect x="-7" y="-34" width="14" height="68" rx="7" fill="#ffc94a" stroke="${INK}" stroke-width="4"/><circle r="6" fill="${INK}"/></svg>
      <i class="gb-hint hand" aria-hidden="true">turn me ↻</i>
    </button>
    <div class="gb-cap" id="gb-cap" aria-hidden="true"><span class="gb-cap-top"></span><span class="gb-cap-bot"></span><span class="gb-cap-paper"></span></div>
  </div>
  <div class="gb-side">
    <div class="gb-printer"><div class="gb-slot" aria-hidden="true"></div>
      <div class="gb-slip" id="gb-slip" aria-live="polite">
        <p class="gs-k">Your capsule</p>
        <p class="gs-n">Turn the crank</p>
        <p class="gs-note hand">Every capsule holds one tool from my stack, and a note on what I built with it.</p>
      </div>
    </div>
    <div class="gb-coll">
      <p class="gb-coll-k"><span>All ${tools.length} at a glance</span><span>opened <b id="gb-count">0</b></span></p>
      <div class="gb-all" id="gb-all">${tiffin.map((tr) => `<div class="gb-row" style="--c:${colour[tr.g]}"><p class="gb-row-k">${esc(tr.label)}</p><ul>${tools.map((t, i) => t.tier === tr.g ? `<li><button data-i="${i}">${esc(t.name)}</button></li>` : '').join('')}</ul></div>`).join('')}</div>
    </div>
  </div>`;

  const machine = $('#gb-machine'), canvas = $('#gb-balls'), ctx = canvas.getContext('2d');
  const crank = $('#gb-crank'), cap = $('#gb-cap'), slip = $('#gb-slip'), flap = root.querySelector('.gb-flap');
  const opened = new Set();

  // ---- physics: all in the globe's own units (the glass is a circle of radius 135 centred at 135,135)
  const C = 135, RIN = 131, R = 15.5, G = 980;
  const balls = [];
  let scale = 1, dpr = 1;
  function size() {
    const w = machine.clientWidth;
    scale = w / 360; dpr = Math.min(2, devicePixelRatio || 1);
    Object.assign(canvas.style, { left: `${45 * scale}px`, top: `${80 * scale}px`, width: `${270 * scale}px`, height: `${270 * scale}px` });
    canvas.width = Math.round(270 * scale * dpr); canvas.height = canvas.width;
    draw();
  }
  const add = (i, x, y, vx = 0, vy = 0) => balls.push({ i, x, y, vx, vy, a: Math.random() * 6.28, glow: 0 });

  function step(dt) {
    for (const b of balls) {
      if (b.exit) continue;
      b.vy += G * dt;
      b.x += b.vx * dt; b.y += b.vy * dt;
      b.vx *= 0.999; b.vy *= 0.999;
    }
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < balls.length; i++) {
        const a = balls[i];
        if (a.exit) continue;
        for (let j = i + 1; j < balls.length; j++) {
          const b = balls[j];
          if (b.exit) continue;
          const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
          if (d2 >= 4 * R * R || d2 === 0) continue;
          const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, o = (2 * R - d) / 2;
          a.x -= nx * o; a.y -= ny * o; b.x += nx * o; b.y += ny * o;
          const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (vn < 0) { const jn = -(1.15 * vn) / 2; a.vx -= jn * nx; a.vy -= jn * ny; b.vx += jn * nx; b.vy += jn * ny; }
        }
        // the glass
        const dx = a.x - C, dy = a.y - C, d = Math.hypot(dx, dy), lim = RIN - R;
        if (d > lim) {
          const nx = dx / d, ny = dy / d;
          a.x = C + nx * lim; a.y = C + ny * lim;
          const vn = a.vx * nx + a.vy * ny;
          if (vn > 0) { a.vx -= 1.25 * vn * nx; a.vy -= 1.25 * vn * ny; a.vx *= 0.985; a.vy *= 0.985; }
        }
      }
    }
    for (const b of balls) if (!b.exit) b.a += (b.vx * dt) / R;
  }

  function drawBall(b) {
    const t = tools[b.i];
    ctx.save();
    ctx.translate(b.x, b.y);
    if (b.s) ctx.scale(b.s, b.s);
    if (b.glow > 0.01) { ctx.beginPath(); ctx.arc(0, 0, R + 6, 0, 7); ctx.fillStyle = `rgba(255, 236, 160, ${0.85 * b.glow})`; ctx.fill(); }
    ctx.rotate(b.a);
    // a capsule: a coloured half and a clear half with the folded slip inside
    ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fillStyle = 'rgba(255, 250, 240, .92)'; ctx.fill();
    ctx.fillStyle = '#efe6cf'; ctx.fillRect(-6, 3, 12, 6);
    ctx.beginPath(); ctx.arc(0, 0, R, Math.PI, 0); ctx.closePath(); ctx.fillStyle = t.c; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-R, 0); ctx.lineTo(R, 0); ctx.lineWidth = 1.6; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.lineWidth = 2.2; ctx.stroke();
    ctx.beginPath(); ctx.arc(-5, -7, 3.2, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill();
    ctx.restore();
  }
  function draw() {
    const k = scale * dpr;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.clearRect(0, 0, 270, 270);
    for (const b of balls) drawBall(b);
  }

  // ---- the loop sleeps when nothing moves and wakes on any input
  let raf = 0, last = 0, still = 0, inView = false;
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.033, (now - (last || now)) / 1000); last = now;
    const n = Math.max(1, Math.round(dt / (1 / 120)));
    for (let s = 0; s < n; s++) step(dt / n);
    let moving = 0;
    for (const b of balls) { moving = Math.max(moving, Math.abs(b.vx) + Math.abs(b.vy)); if (b.glow > 0) { b.glow = Math.max(0, b.glow - dt * 1.2); moving = Math.max(moving, 7); } }
    draw();
    still = moving < 6 && !busy ? still + 1 : 0;
    if (inView && still < 40) raf = requestAnimationFrame(frame);
  }
  const wake = () => { still = 0; if (!raf && inView) { last = 0; raf = requestAnimationFrame(frame); } };

  // ---- fill the globe the first time it comes into view: capsules pour in through the lid
  let filled = false;
  function fill() {
    filled = true;
    const order = tools.map((_, i) => i).sort(() => Math.random() - 0.5);
    if (reduced) {
      order.forEach((i, k) => add(i, C - 90 + (k % 8) * 26, C + 100 - Math.floor(k / 8) * 26));
      for (let s = 0; s < 600; s++) step(1 / 120);
      draw();
      return;
    }
    order.forEach((i, k) => setTimeout(() => { add(i, C + (Math.random() - 0.5) * 30, 18, (Math.random() - 0.5) * 160, 60); wake(); }, k * 45));
  }
  ScrollTrigger.create({
    trigger: machine, start: 'top 85%', end: 'bottom top',
    onToggle: (st) => { inView = st.isActive; if (inView && !filled) fill(); if (inView) wake(); },
  });
  addEventListener('resize', size);
  size();

  // ---- push the capsules around through the glass
  const toLocal = (e) => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) / scale, (e.clientY - r.top) / scale]; };
  let prev = null, downAt = null;
  canvas.addEventListener('pointermove', (e) => {
    const [x, y] = toLocal(e), now = performance.now();
    if (prev && !reduced) {
      const dt = Math.max(0.008, (now - prev.t) / 1000);
      const pvx = Math.max(-900, Math.min(900, (x - prev.x) / dt)), pvy = Math.max(-900, Math.min(900, (y - prev.y) / dt));
      for (const b of balls) {
        const dx = b.x - x, dy = b.y - y, d = Math.hypot(dx, dy);
        if (d < R + 16 && !b.exit) { b.vx += pvx * 0.35 + (dx / (d || 1)) * 60; b.vy += pvy * 0.35 + (dy / (d || 1)) * 60; }
      }
      wake();
    }
    prev = { x, y, t: now };
  });
  canvas.addEventListener('pointerleave', () => { prev = null; });
  canvas.addEventListener('pointerdown', (e) => { downAt = toLocal(e); });
  canvas.addEventListener('pointerup', (e) => {
    const [x, y] = toLocal(e);
    if (downAt && Math.hypot(x - downAt[0], y - downAt[1]) < 6) shake(1);
    downAt = null;
  });
  function shake(f) {
    if (reduced) return;
    for (const b of balls) { b.vx += (Math.random() - 0.5) * 260 * f; b.vy -= (150 + Math.random() * 260) * f; }
    wake();
  }

  // ---- the crank: tap for a full turn, or drag it round yourself
  let busy = false, turned = 0, dragging = null;
  const setCrank = (deg) => gsap.set(crank.querySelector('svg'), { rotation: deg });
  function tick() {
    sound('tick');
    // every quarter turn the mechanism nudges the pile
    for (const b of balls) if (b.y > C + 30 && !b.exit) { b.vy -= 120 + Math.random() * 140; b.vx += (Math.random() - 0.5) * 90; }
    wake();
  }
  function turn() {
    if (busy) return;
    busy = true;
    root.classList.add('turned');
    if (reduced) { dispense(); return; }
    const o = { d: 0 };
    let q = 0;
    gsap.to(o, { d: 360, duration: 1.1, ease: 'power1.inOut', onUpdate: () => { setCrank(o.d); const nq = Math.floor(o.d / 90); if (nq > q) { q = nq; tick(); } }, onComplete: () => { setCrank(0); dispense(); } });
  }
  const angleAt = (e) => { const r = crank.getBoundingClientRect(); return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI; };
  crank.addEventListener('pointerdown', (e) => {
    if (busy || reduced) return;
    dragging = { a: angleAt(e), moved: 0 };
    turned = 0;
    crank.setPointerCapture(e.pointerId);
  });
  crank.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const a = angleAt(e);
    let d = a - dragging.a;
    if (d > 180) d -= 360; if (d < -180) d += 360;
    dragging.a = a;
    if (d > 0) { // it only turns one way, like the real thing
      const before = Math.floor(turned / 90);
      turned += d; dragging.moved += d;
      setCrank(turned);
      if (Math.floor(turned / 90) > before) tick();
      if (turned >= 345) { dragging = null; busy = true; root.classList.add('turned'); gsap.to(crank.querySelector('svg'), { rotation: 360, duration: 0.15, onComplete: () => { setCrank(0); dispense(); } }); }
    }
  });
  const release = () => {
    if (!dragging) return;
    const small = dragging.moved < 12;
    dragging = null;
    if (small) { setCrank(0); turn(); return; } // a tap
    gsap.to(crank.querySelector('svg'), { rotation: 0, duration: 0.5, ease: 'back.out(2)' }); // let go early: it springs back
  };
  crank.addEventListener('pointerup', release);
  crank.addEventListener('pointercancel', release);
  crank.addEventListener('click', (e) => { if (e.detail === 0) turn(); }); // keyboard

  // ---- one capsule out
  function pick() {
    const pool = balls.filter((b) => !b.exit);
    const fresh = pool.filter((b) => !opened.has(b.i));
    const from = fresh.length ? fresh : pool;
    // prefer one near the bottom, so it looks like it fell through the hole
    from.sort((a, b) => b.y - a.y);
    return from[Math.floor(Math.random() * Math.min(4, from.length))];
  }
  function dispense() {
    const b = pick();
    if (!b) { busy = false; return; }
    const t = tools[b.i];
    if (reduced) { balls.splice(balls.indexOf(b), 1); add(b.i, C, C - 60); for (let s = 0; s < 200; s++) step(1 / 120); draw(); show(b.i); busy = false; return; }
    b.exit = true;
    // down through the hole at the bottom of the globe
    gsap.timeline({ onUpdate: draw })
      .to(b, { x: C, y: RIN + 2, duration: 0.35, ease: 'power2.in' })
      .to(b, { s: 0.4, duration: 0.15 }, '-=0.12')
      .call(() => { balls.splice(balls.indexOf(b), 1); wake(); });
    // out of the chute, a bounce in the tray, and it pops open
    cap.style.setProperty('--c', t.c);
    const cx = 180 * scale, cy = 512 * scale;
    gsap.set(cap, { left: cx, top: cy, autoAlpha: 0, scale: 0.5, rotation: 0 });
    gsap.set(cap.querySelector('.gb-cap-top'), { y: 0, x: 0, rotation: 0 });
    gsap.set(cap.querySelector('.gb-cap-paper'), { scaleY: 0, autoAlpha: 0 });
    gsap.timeline({ delay: 0.5, onComplete: () => { busy = false; } })
      .to(flap, { attr: { transform: 'rotate(-35 180 492)' }, duration: 0.12 })
      .call(() => sound('clunk'))
      .to(cap, { autoAlpha: 1, scale: 1, top: 533 * scale, duration: 0.26, ease: 'power2.in' })
      .to(flap, { attr: { transform: 'rotate(0 180 492)' }, duration: 0.4, ease: 'elastic.out(1, .4)' }, '<+0.1')
      .to(cap, { top: 518 * scale, left: 192 * scale, rotation: 30, duration: 0.14, ease: 'power2.out' })
      .to(cap, { top: 533 * scale, left: 198 * scale, rotation: -12, duration: 0.14, ease: 'power2.in' })
      .to(cap, { top: 528 * scale, rotation: 0, duration: 0.08, ease: 'power1.out', yoyo: true, repeat: 1 })
      .call(() => sound('pop'), null, '+=0.1')
      .to(cap.querySelector('.gb-cap-top'), { y: -22, x: -10, rotation: -40, duration: 0.3, ease: 'back.out(2)' })
      .to(cap.querySelector('.gb-cap-paper'), { autoAlpha: 1, scaleY: 1, duration: 0.25, ease: 'back.out(2)' }, '<+0.05')
      .call(() => show(b.i))
      .to(cap, { autoAlpha: 0, duration: 0.4 }, '+=1.6')
      // and the globe gets a fresh one of the same, through the lid
      .call(() => { add(b.i, C + (Math.random() - 0.5) * 20, 18, (Math.random() - 0.5) * 120, 40); wake(); }, null, '-=0.6');
  }

  // ---- the slip
  function show(i) {
    const t = tools[i], m = toolboxMeta[t.code] || ['p', ''];
    opened.add(i);
    $('#gb-count').textContent = opened.size;
    const dot = root.querySelector(`.gb-all button[data-i="${i}"]`);
    root.querySelectorAll('.gb-all button.now').forEach((x) => x.classList.remove('now'));
    dot.classList.add('got', 'now');
    const places = [...m[0]].map((k) => where[k]).filter(Boolean);
    const pairs = m[1].split(' ').filter(Boolean).map((c) => tools.find((x) => x.code === c)).filter(Boolean);
    slip.style.setProperty('--c', t.c);
    slip.innerHTML = `<p class="gs-k"><span>${esc(tierOf(t.g).label)}</span><span>#${String(i + 1).padStart(2, '0')}</span></p>
      <p class="gs-n">${esc(t.name)}</p>
      <p class="gs-note hand">${esc(t.note)}</p>
      <p class="gs-w">${places.map(([id, n]) => `<span>${id ? mark(id, 'gs-mk') : '<i class="gs-me">me</i>'}${esc(n)}</span>`).join('')}</p>
      ${pairs.length ? `<p class="gs-p"><span>pairs with</span>${pairs.map((p) => `<b style="--c:${p.c}">${esc(p.name)}</b>`).join('')}</p>` : ''}`;
    if (!reduced) gsap.fromTo(slip, { yPercent: -100, rotation: -1.5 }, { yPercent: 0, rotation: 0, duration: 0.7, ease: 'power3.out' });
    // if the slip is off screen (below the machine on a phone, or above the list), bring it into view
    const r = slip.getBoundingClientRect();
    if (r.top < 70 || r.bottom > innerHeight - 10) slip.closest('.gb-printer').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  }
  root.querySelector('.gb-all').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const i = +btn.dataset.i;
    show(i);
    // its capsule in the globe gives a little hop
    const b = balls.find((x) => x.i === i);
    if (b && !reduced) { b.vy -= 380; b.glow = 1; wake(); }
  });
}

/* ---------------------------------------------------------------- medals */
function initMedals(reduced) {
  const list = $('#medals');
  if (!list) return;
  const co = { Walmart: ['walmart', '#0071CE'], Fidelity: ['fidelity', '#368727'], TCS: ['tcs', '#EE3984'] };
  list.innerHTML = awards.map(([y, title, w], i) => {
    const cut = title.indexOf(', ');
    const short = cut > 0 ? title.slice(0, cut) : title, more = cut > 0 ? title.slice(cut + 2) : '';
    const [id, c] = co[w];
    return `<li class="mr" style="--c:${c}">
      <button class="mr-hang" aria-pressed="false" aria-label="${esc(title)}, ${esc(w)}${y === '·' ? '' : `, ${y}`}. Tap to flip.">
        <span class="mr-rib" aria-hidden="true"></span>
        <span class="mr-coin" aria-hidden="true"><span class="mr-face mr-front"><b>${y === '·' ? '★' : esc(y)}</b>${mark(id, 'mr-mk')}</span><span class="mr-face mr-back"><small>for</small>${esc(more || short)}</span></span>
      </button>
      <p class="mr-t">${esc(short)}</p><p class="mr-w">${esc(w)}</p></li>`;
  }).join('');
  const items = [...list.querySelectorAll('.mr-hang')].map((el) => ({ el, th: 0, w: 0 }));

  list.addEventListener('click', (e) => {
    const h = e.target.closest('.mr-hang');
    if (!h) return;
    const on = h.getAttribute('aria-pressed') !== 'true';
    h.setAttribute('aria-pressed', on);
    h.classList.toggle('flipped', on);
    sound('clink');
    const it = items.find((x) => x.el === h);
    if (it) { it.w += 2.2; run(); }
  });
  if (reduced) return;

  // pendulums: brushing past a medal gives it a push in the direction the cursor moved
  let raf = 0, last = 0, prev = null;
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.033, (now - (last || now)) / 1000); last = now;
    let energy = 0;
    for (const it of items) {
      it.w += (-26 * Math.sin(it.th) - 1.7 * it.w) * dt;
      it.th += it.w * dt;
      it.th = Math.max(-1.1, Math.min(1.1, it.th));
      it.el.style.transform = `rotate(${it.th}rad)`;
      energy = Math.max(energy, Math.abs(it.th) + Math.abs(it.w));
    }
    if (energy > 0.002) raf = requestAnimationFrame(frame);
    else for (const it of items) { it.th = 0; it.w = 0; it.el.style.transform = ''; }
  }
  const run = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };
  list.addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (prev) {
      const dt = Math.max(0.008, (now - prev.t) / 1000), vx = Math.max(-2500, Math.min(2500, (e.clientX - prev.x) / dt));
      for (const it of items) {
        const r = it.el.getBoundingClientRect();
        const crossed = (prev.x - r.left) * (e.clientX - r.left) <= 0 || (prev.x - r.right) * (e.clientX - r.right) <= 0 || (e.clientX > r.left && e.clientX < r.right);
        if (crossed && e.clientY > r.top + r.height * 0.35 && e.clientY < r.bottom + 6) it.w += vx * 0.0016;
      }
      run();
    }
    prev = { x: e.clientX, y: e.clientY, t: now };
  });
  list.addEventListener('pointerleave', () => { prev = null; });
  // when the rack scrolls in, the medals are hung up one by one and swing into place
  ScrollTrigger.create({
    trigger: list, start: 'top 80%', once: true,
    onEnter: () => items.forEach((it, i) => setTimeout(() => { it.th = (i % 2 ? 1 : -1) * 0.5; it.w = 0; run(); }, i * 90)),
  });
}
