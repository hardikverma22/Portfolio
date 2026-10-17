import { edgeArrows } from './edgearrows.js';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { skillsBuilt, markets, writing, testimonials, projects, toolbox, toolboxGroups, awards, identity } from './data.js';
import { buildings, story, stickies, milestones, tiffin } from './world.js';
import { townMarkup, autoRickshaw, skylines } from './town.js';
import { mark } from './marks.js';
import { initLab } from './lab.js';
import { initGuide } from './guide.js';
import { initStack } from './stack.js';
import { initNudge } from './nudge.js';
import { initCursor } from './cursor.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;

/* ---------------- smooth scroll ---------------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollToEl = (target) => {
  if (typeof target === 'number') { if (lenis) lenis.scrollTo(target, { duration: 1.4 }); else scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' }); return; }
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
};
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length < 2 || id.startsWith('#/') || !$(id)) return;
  e.preventDefault();
  if (townOpen) closeBuilding();
  scrollToEl(id === '#town' ? document.body : id);
});

/* ---------------- day / night + clock ---------------- */
const modeBtn = $('#mode');
let wantNight = root.dataset.mode === 'night';
let modeTimer = 0;
const modeBtns = [modeBtn, $('#case-mode')].filter(Boolean);
const syncMode = () => modeBtns.forEach((b) => b.setAttribute('aria-label', wantNight ? 'Switch to day' : 'Switch to night'));
syncMode();
// the case-study sheet has its own switch; night spreads from whichever one was pressed
modeBtns.forEach((b) => b.addEventListener('click', () => toggleMode(b)));
function toggleMode(from) {
  wantNight = !wantNight;
  syncMode();
  try { localStorage.setItem('hv-mode', wantNight ? 'night' : 'day'); } catch (_) {}
  clearTimeout(modeTimer);
  const settle = () => { if (wantNight) root.dataset.mode = 'night'; else delete root.dataset.mode; };
  if (reduced) { settle(); return; }
  // on the hero, dusk (or dawn) first so the sky, lights and paper fade through in stages;
  // further down the page, night spreads as a circle from the switch (View Transitions)
  const heroInView = !root.classList.contains('case-open') && $('#town').getBoundingClientRect().bottom > innerHeight * 0.35;
  if (heroInView || !document.startViewTransition) {
    root.dataset.mode = wantNight ? 'dusk' : 'dawn';
    modeTimer = setTimeout(settle, wantNight ? 1100 : 900);
    return;
  }
  const r = from.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  // the new theme renders settled underneath; the circle is the only motion
  root.classList.add('theme-snap');
  const vt = document.startViewTransition(settle);
  vt.ready.then(() => root.animate(
    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${R}px at ${x}px ${y}px)`] },
    { duration: 1500, easing: 'cubic-bezier(.65, 0, .35, 1)', pseudoElement: '::view-transition-new(root)' },
  )).catch(() => {}); // skipped transitions (hidden tab, rapid clicks) still switch the theme
  vt.finished.finally(() => root.classList.remove('theme-snap'));
}
const clock = $('#clock');
const tick = () => {
  const t = new Intl.DateTimeFormat('en-GB', { timeZone: identity.tz, hour: '2-digit', minute: '2-digit' }).format(new Date());
  clock.textContent = `Bengaluru ${t}`;
};
tick(); setInterval(tick, 20000);

/* =====================================================================
   TOWN
   ===================================================================== */
const layers = townMarkup();
for (const k of Object.keys(layers)) $(`.ly-${k}`).insertAdjacentHTML('afterbegin', layers[k]);
const cam = $('#cam');
const scene = $('#scene');
const stage = $('#stage');
const pinColours = { tcs: '#EE3984', fidelity: '#368727', lab: '#0071CE', tower: '#0071CE', press: '#ef6a5b', home: '#ef6a5b' };
const pinMarks = { tcs: 'tcs', fidelity: 'fidelity', lab: 'walmart', tower: 'walmart', press: 'medium', home: 'home' };
$('#pins').innerHTML = buildings.map((b, i) => `
  <button class="pin" data-id="${b.id}" style="--x:${(b.x / 16).toFixed(2)};--y:${(b.y / 9).toFixed(2)};--c:${pinColours[b.id]};--pd:${(i * 0.37).toFixed(2)}s" aria-label="${esc(b.name)}${b.when ? `, ${esc(b.when)}` : ''}">
    <span class="pin-tag">${mark(pinMarks[b.id], 'pin-mk')}${esc(b.name)}${b.when ? `<small>${esc(b.when)}</small>` : ''}</span>
  </button>`).join('') + '<p class="tap-hint hand" id="tap-hint" aria-hidden="true">tap a building <svg viewBox="0 0 40 40"><path d="M4 4 C14 10 24 20 30 34 M30 34 l-9 -3 M30 34 l3 -9"/></svg></p>';

// buddy bot
// the newsroom ticker loops by exactly one copy of its text
const tick$ = $('.tick-t');
if (tick$) $('.ticker').style.setProperty('--tw', (tick$.getComputedTextLength() / 2).toFixed(1));
// chapters link to each other in the order they happened
const TOUR = ['tcs', 'fidelity', 'lab', 'tower', 'press', 'home']; // left to right along the street


// mouse parallax: each layer drifts by its depth
const lys = $$('.ly');
if (fine && !reduced) {
  const setters = lys.map((l) => ({ d: +l.dataset.depth, x: gsap.quickTo(l, 'x', { duration: 1.1, ease: 'power3' }), y: gsap.quickTo(l, 'y', { duration: 1.1, ease: 'power3' }) }));
  const eyes = $('.bd-eyes');
  stage.addEventListener('pointermove', (e) => {
    if (townOpen) return;
    const mx = e.clientX / innerWidth - 0.5, my = e.clientY / innerHeight - 0.5;
    for (const s of setters) { s.x(-mx * s.d * 260); s.y(-my * s.d * 90); }
    if (eyes) gsap.to(eyes, { x: mx * 6, y: my * 4, duration: 0.3 });
  });
}

// upright screens: the whole street fits across the screen (no sideways swiping), and a small directory
// above it names each building, with the same logo as the tag on its roof; tap one to open that chapter
const STOPS = ['tcs', 'fidelity', 'lab', 'tower', 'press', 'home'];
const shortName = { lab: 'AI agent lab', tower: 'Walmart identity', home: 'After hours' };
$('#town-dir').innerHTML = '<p class="td-k">Tap a building</p>' + STOPS.map((id) => {
  const b = buildings.find((x) => x.id === id);
  return `<button type="button" data-id="${id}" aria-label="Open ${esc(b.name)}">${mark(pinMarks[id], 'td-mk')}<span><b>${esc(shortName[id] || b.name)}</b>${b.when ? `<small>${esc(b.when)}</small>` : ''}</span></button>`;
}).join('');
$('#town-dir').addEventListener('click', (e) => { const t = e.target.closest('button'); if (t) openBuilding(t.dataset.id); });

// leaving town: no pin, no zoom. The layers just slide away at different speeds, so the street feels deep.
if (!reduced) {
  const exit = { trigger: '#town', start: 'top top', end: 'bottom top', scrub: true };
  lys.forEach((l) => gsap.to(l, { yPercent: -(+l.dataset.depth) * 60, ease: 'none', scrollTrigger: exit }));
  gsap.to('#hero-copy', { yPercent: -30, autoAlpha: 0, ease: 'none', scrollTrigger: { ...exit, end: '60% top' } });
}

// building focus: the camera dollies into the building and its chapter slides in
const panel = $('#tpanel');
let townOpen = null;
function openBuilding(id) {
  const b = buildings.find((x) => x.id === id);
  if (!b) return;
  if (scrollY > 40) { scrollToEl(document.body); setTimeout(() => openBuilding(id), 900); return; }
  const next = buildings.find((x) => x.id === TOUR[TOUR.indexOf(id) + 1]);
  townOpen = id;
  lenis?.stop();
  $('#tap-hint').style.opacity = 0;
  const r = scene.getBoundingClientRect();
  const W = scene.offsetWidth, H = scene.offsetHeight;
  const narrow = innerWidth < 760;
  const withAuto = townAuto.classList.contains('touring');
  const scale = id === 'tower' ? (narrow ? 1.2 : 1.35) : withAuto ? (narrow ? 1.45 : 1.6) : (narrow ? 1.7 : 2.1);
  const px = (b.x / 1600) * W, py = (((b.y + (withAuto ? 860 : 700)) / 2) / 900) * H;
  const sx = narrow ? innerWidth * 0.5 : innerWidth * 0.66, sy = narrow ? innerHeight * 0.3 : innerHeight * (withAuto ? 0.52 : 0.56);
  gsap.to(cam, { x: sx - r.left - px * scale, y: sy - r.top - py * scale, scale, duration: 1.3, ease: 'power3.inOut' });
  gsap.to(['#hero-copy', '#fly-cue', '#town-dir'], { autoAlpha: 0, duration: 0.4 });
  cam.classList.add('focus');
  $$('.bld, .pin', cam).forEach((el) => el.classList.toggle('on', el.dataset.id === id));
  panel.innerHTML = `
    <button class="tp-x" id="tp-x" aria-label="Back to town">✕</button>
    ${touring ? `<p class="tp-stop">Stop ${TOUR.indexOf(id) + 1} of ${TOUR.length} <span>${TOUR.map((t) => `<i class="${t === id ? 'on' : TOUR.indexOf(t) < TOUR.indexOf(id) ? 'past' : ''}"></i>`).join('')}</span></p>` : ''}
    <p class="tp-k">${mark(pinMarks[b.id], 'tp-mk')}${esc(b.kicker)}</p>
    <h3 class="tp-name">${esc(b.name.replace('Walmart · ', 'Walmart '))}</h3>
    <p class="tp-role">${esc(b.role)}${b.when ? ` · ${esc(b.when)}` : ''}</p>
    <p class="tp-t">${esc(b.title)}</p>
    ${b.paras.map((t) => `<p class="tp-b">${esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</p>`).join('')}
    <div class="tp-stats">${b.stats.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>
    ${b.links ? `<p class="tp-links">${b.links.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(t)} ↗</a>`).join('')}</p>` : ''}
    <div class="tp-go">${touring
      ? `<button class="btn btn-ink tp-next" type="button" data-next="${next ? next.id : '__ride'}">${next ? `Next stop: ${esc(next.name.replace('Walmart · ', ''))} →` : 'Continue the ride ↓'}</button><a class="btn btn-paper" href="${b.go[1]}">${esc(b.go[0])}</a>`
      : `<a class="btn btn-ink" href="${b.go[1]}">${esc(b.go[0])} →</a>${next ? `<button class="btn btn-paper tp-next" type="button" data-next="${next.id}">Next stop: ${esc(next.name.replace('Walmart · ', ''))} →</button>` : ''}`}</div>`;
  panel.classList.add('open');
  panel.removeAttribute('inert');
  panel.setAttribute('aria-hidden', 'false');
  $('#tp-x').addEventListener('click', closeBuilding);
  $('.tp-next', panel)?.addEventListener('click', (e) => tourTo(e.currentTarget.dataset.next));
  setTimeout(() => $('#tp-x')?.focus({ preventScroll: true }), 500);
  gsap.from('.tp-stats div', { y: 20, autoAlpha: 0, stagger: 0.06, delay: 0.45, ease: 'back.out(2)' });
  document.dispatchEvent(new CustomEvent('town', { detail: { open: id } }));
}
function closeBuilding() {
  if (!townOpen) return;
  touring = false;
  if (townAuto.classList.contains('touring')) releaseAuto();
  const was = townOpen;
  townOpen = null;
  gsap.to(cam, { x: 0, y: 0, scale: 1, duration: 1.1, ease: 'power3.inOut' });
  gsap.to(['#hero-copy', '#fly-cue', '#town-dir'], { autoAlpha: 1, duration: 0.5, delay: 0.5 });
  cam.classList.remove('focus');
  panel.classList.remove('open');
  panel.setAttribute('inert', '');
  panel.setAttribute('aria-hidden', 'true');
  lenis?.start();
  $(`.pin[data-id="${was}"]`)?.focus({ preventScroll: true });
  document.dispatchEvent(new CustomEvent('town', { detail: { open: null } }));
}
/* ---------------- the town tour: the auto drives from building to building ---------------- */
// Take the tour: the town's auto stops its loop, drives in from the left and pulls up at each building
// in turn while its chapter opens. After the last one it drives off and the page ride carries on.
let touring = false;
// The town auto is driven from here all the time: it cruises along the street at an easy pace, the tour
// pulls it up at each building, and afterwards it eases back into cruising from wherever it stopped.
const townAuto = $('#town-auto'), ta = { x: 350 };
const CRUISE = 150; // scene units per second
// The street is drawn wider than the scene, so a vehicle must wrap just past the edges of the *window*,
// not the scene, or it pops in mid-street. These are those edges in scene units, kept up to date.
const edges = { start: -1000, end: 2600 };
function measureEdges() {
  const r = scene.getBoundingClientRect(), k = 1600 / r.width;
  edges.start = (0 - r.left) * k - 240;
  edges.end = (innerWidth - r.left) * k + 240;
  const sc = $('.scooter');
  if (sc) {
    sc.style.setProperty('--scoot-from', `${edges.end.toFixed(0)}px`);
    sc.style.setProperty('--scoot-to', `${(edges.start + 80).toFixed(0)}px`);
    sc.style.setProperty('--scoot-dur', `${((edges.end - edges.start) / 175).toFixed(1)}s`);
  }
}
measureEdges();
addEventListener('resize', measureEdges);
const placeAuto = () => townAuto.setAttribute('transform', `translate(${ta.x.toFixed(1)} 810)`);
function cruise() {
  if (reduced) return;
  if (ta.x > edges.end) ta.x = edges.start;
  gsap.to(ta, { x: edges.end, duration: Math.max(0.1, (edges.end - ta.x) / CRUISE), ease: 'none', onUpdate: placeAuto, onComplete: () => { measureEdges(); ta.x = edges.start; cruise(); } });
}
placeAuto();
cruise();
function driveAuto(x, done) {
  townAuto.classList.add('touring');
  gsap.killTweensOf(ta);
  const d = Math.abs(x - ta.x);
  if (reduced) { ta.x = x; placeAuto(); done?.(); return; }
  gsap.to(ta, { x, duration: gsap.utils.clamp(0.9, 2.4, d / 520), ease: 'power2.inOut', onUpdate: placeAuto, onComplete: done });
}
const stopAt = (id) => buildings.find((b) => b.id === id).x - 30;
// pulls away gently from the stop and settles back into its usual cruise
function releaseAuto() {
  townAuto.classList.remove('touring');
  gsap.killTweensOf(ta);
  if (reduced) return;
  gsap.to(ta, { x: ta.x + 90, duration: 1.2, ease: 'power1.in', onUpdate: placeAuto, onComplete: cruise });
}
function tourTo(id) {
  if (id === '__ride') {
    closeBuilding();
    setTimeout(() => scrollToEl('#story'), 900);
    return;
  }
  driveAuto(stopAt(id));
  openBuilding(id);
}
$('#tour-btn').addEventListener('click', () => {
  touring = true;
  // the auto slips out of view, reappears at the left edge of town and drives in to the first stop
  const go = () => {
    gsap.killTweensOf(ta);
    townAuto.classList.add('touring');
    gsap.to(townAuto, { opacity: 0, duration: reduced ? 0 : 0.2, onComplete: () => {
      ta.x = -260; placeAuto();
      gsap.set(townAuto, { opacity: 1 });
      tourTo(TOUR[0]);
    } });
  };
  if (scrollY > 40) { scrollToEl(document.body); setTimeout(go, 900); } else go();
});
cam.addEventListener('click', (e) => {
  const t = e.target.closest('.pin, .bld');
  if (t) openBuilding(t.dataset.id);
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeBuilding(); });
$('#fly-cue').addEventListener('click', () => scrollToEl('#story'));

/* =====================================================================
   STORY: words fill in as you scroll; marked phrases get drawn on
   ===================================================================== */
// doodles are drawn in each phrase's own pixel space so the stroke stays even at any width
const doodleShape = {
  circle: (w, h) => `M${w * 0.1} ${h * 0.62} C${w * 0.02} ${h * 0.1} ${w * 0.56} ${-h * 0.05} ${w * 0.88} ${h * 0.18} C${w * 1.06} ${h * 0.32} ${w * 0.98} ${h * 0.9} ${w * 0.58} ${h * 0.95} C${w * 0.22} ${h * 1.02} ${w * 0.0} ${h * 0.82} ${w * 0.07} ${h * 0.42} C${w * 0.12} ${h * 0.2} ${w * 0.3} ${h * 0.08} ${w * 0.5} ${h * 0.1}`,
  under: (w, h) => `M2 ${h * 0.6} C${w * 0.2} ${h * 0.15} ${w * 0.34} ${h * 0.95} ${w * 0.52} ${h * 0.5} S${w * 0.82} ${h * 0.2} ${w - 2} ${h * 0.45}`,
  strike: (w, h) => `M2 ${h * 0.65} C${w * 0.36} ${h * 0.3} ${w * 0.64} ${h * 0.75} ${w - 2} ${h * 0.35}`,
};
const doodles = { circle: '<svg><path pathLength="1"/></svg>', under: '<svg><path pathLength="1"/></svg>', strike: '<svg><path pathLength="1"/></svg>', hilite: '' };
function drawDoodles() {
  $$('#tell .mk svg').forEach((svg) => {
    const type = ['circle', 'under', 'strike'].find((t) => svg.parentElement.classList.contains(t));
    const { width: w, height: h } = svg.getBoundingClientRect();
    if (!w || !h) return;
    svg.setAttribute('viewBox', `0 0 ${w.toFixed(1)} ${h.toFixed(1)}`);
    svg.firstElementChild.setAttribute('d', doodleShape[type](w, h));
  });
}
const words = (t) => (/^\s/.test(t) ? ' ' : '') + t.split(/\s+/).filter(Boolean).map((w) => `<span class="w">${esc(w)}</span>`).join(' ') + (/\s$/.test(t) ? ' ' : '');
$('#tell').innerHTML = story.split(/(\[\[.*?\]\]|\{\{\w+\}\})/).map((part) => {
  const ic = part.match(/^\{\{(\w+)\}\}$/);
  if (ic) return `<span class="w ico">${mark(ic[1], 'ico-svg')}</span>`;
  const m = part.match(/^\[\[(.*?)\|(\w+)(?:\|(\w+))?\]\]$/);
  if (!m) return words(part);
  return `<span class="mk ${m[2]}${m[3] ? ` tone-${m[3]}` : ''}">${words(m[1])}${doodles[m[2]]}</span>`;
}).join('');
drawDoodles();
addEventListener('resize', drawDoodles);
document.fonts?.ready.then(drawDoodles);
const ws = $$('#tell .w');
const mks = $$('#tell .mk');
const paintStory = (p) => {
  const lit = Math.round(p * ws.length);
  ws.forEach((w, i) => { w.style.opacity = i < lit ? 1 : ''; w.classList.toggle('lit', i < lit); });
  mks.forEach((m) => { const last = $$('.w', m).pop(); m.classList.toggle('on', ws.indexOf(last) < lit); });
};
if (reduced) paintStory(1);
else ScrollTrigger.create({ trigger: '#tell', start: 'top 78%', end: 'bottom 42%', scrub: true, onUpdate: (s) => paintStory(s.progress) });

$('#stickies').innerHTML = `<figure class="pola"><img src="hero-color.webp" alt="Hardik Verma" width="768" height="1024" loading="lazy" /><figcaption class="hand">hi, that’s me</figcaption></figure>` + stickies.map((s) => `<div class="sticky sk-${s.c}" style="--r:${s.r}deg">${esc(s.t)}<small>${esc(s.s)}</small></div>`).join('');
if (!reduced) gsap.fromTo('.pola, .sticky', { y: -70, rotation: 14, autoAlpha: 0 }, { y: 0, rotation: 0, autoAlpha: 1, stagger: 0.18, duration: 0.9, ease: 'back.out(1.8)', clearProps: 'transform,rotate,translate,scale', scrollTrigger: { trigger: '#stickies', start: 'top 75%' } });

gsap.to('.rd-bot', { x: () => $('.rd-road').offsetWidth - 64, ease: 'none', scrollTrigger: { trigger: '.road-div', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });

/* =====================================================================
   LAB: the workbench, and a case page per project (see lab.js)
   ===================================================================== */
initLab({ reduced, lenis });
// each smaller tool gets a little screen that loops what it does
const mtScene = {
  miner: () => `<div class="mts-rows">${['a', 'b', 'c', 'b', 'd', 'b'].map((k, i) => `<i class="r-${k}" style="--i:${i}"></i>`).join('')}</div><span class="mts-chip">3× seen → <b>skill.md</b></span>`,
  clock: () => `<div class="mts-clock"><i class="h"></i><i class="m"></i></div><div class="mts-log">${['02:00', '02:00', '02:00'].map((t, i) => `<span style="--i:${i}">${['Mon', 'Tue', 'Wed'][i]} ${t} <b>✓</b></span>`).join('')}</div><span class="mts-moon"></span>`,
  bars: () => `<div class="mts-bars">${[62, 38, 80, 50, 70, 30].map((h, i) => `<i style="--h:${h}%;--i:${i}"></i>`).join('')}</div><div class="mts-dora"><span>deploys</span><span>lead time</span><span>fail rate</span></div>`,
  pipe: () => `<div class="mts-pipe">${['ticket', 'agent', 'verify', 'fix', 'report'].map((k, i) => `<span style="--i:${i}"><i></i>${k}</span>`).join('')}<b class="mts-dot"></b></div>`,
};
$('#mt-list').innerHTML = skillsBuilt.map(([t, d, scene, tag], i) => `<li class="mt-card" style="--r:${[-1.2, 0.8, -0.6, 1.2][i % 4]}deg">
  <div class="mt-screen" data-scene="${scene}" aria-hidden="true">${mtScene[scene]()}</div>
  <span class="mt-tag">${esc(tag)}</span><b>${esc(t)}</b><p>${esc(d)}</p></li>`).join('');
ScrollTrigger.create({ trigger: '#mt-list', start: 'top 90%', end: 'bottom top', toggleClass: 'play' });

/* =====================================================================
   JOURNEY: the auto drives past highway milestones
   ===================================================================== */
// the same auto that drives through town, now carrying the story between stops
$('#jr-auto').innerHTML = `<svg viewBox="-80 -80 240 100">${autoRickshaw()}</svg>`;
const AUTO_BODY = 82 / 240; // where the auto's body sits within its svg box
$('#jr-track').innerHTML = milestones.map((m, i) => `<div class="stone" data-i="${i}"><div class="stone-b"><div class="stone-top">${esc(m.place)}</div><div class="stone-y">${m.y}</div>${mark(m.co, 'stone-mk')}</div></div>`).join('');
// one skyline per city; they cross-fade as the auto arrives somewhere new
const cities = [...new Set(milestones.map((m) => m.place))];
$('#jr-cities').innerHTML = cities.map((c) => `<div class="city" data-city="${c}">${skylines[c] || ''}</div>`).join('') + '<span class="city-name hand" id="city-name"></span>';
(() => {
  let d = 'M0 260 ', trees = '';
  for (let x = 0; x <= 6000; x += 200) d += `Q${x + 100} ${200 + ((x / 200) % 3) * 30} ${x + 200} 240 `;
  d += 'V400 H0 Z';
  for (let x = 60; x < 6000; x += 130 + ((x * 7) % 90)) trees += `<g transform="translate(${x} ${238 - ((x / 13) % 18)})"><path d="M0 0 v-20" stroke="var(--ink)" stroke-width="4"/><circle cy="-34" r="${16 + ((x / 5) % 8)}" fill="var(--leaf-1)" stroke="var(--ink)" stroke-width="3"/></g>`;
  $('#jr-hills').innerHTML = `<svg viewBox="0 0 6000 400" preserveAspectRatio="none"><path d="${d}" fill="var(--hill-near)" stroke="var(--ink)" stroke-width="3"/>${trees}</svg>`;
})();
// progress strip: one dot per stop, coloured by company
const coColour = { tcs: '#EE3984', hm: '#E50010', fidelity: '#368727', walmart: '#0071CE', home: '#ef6a5b' };
$('#jr-meter').innerHTML = `<span class="jm-y" id="jm-y"></span><span class="jm-dots">${milestones.map((m, i) => `<i style="--c:${coColour[m.co]}" data-i="${i}"></i>`).join('')}</span>`;
const jCard = $('#jr-card'), stones = $$('.stone'), jDots = $$('#jr-meter i'), jWheels = $$('#jr-auto .wheel'), jAuto = $('#jr-auto');
let jIdx = -1, jCity = '', moveT = 0;
function showStop(i) {
  if (i === jIdx) return;
  jIdx = i;
  const m = milestones[i];
  stones.forEach((s, k) => s.classList.toggle('on', k === i));
  jDots.forEach((d, k) => { d.classList.toggle('on', k === i); d.classList.toggle('past', k < i); });
  $('#jm-y').textContent = m.y;
  jCard.innerHTML = `<span class="jc-k">${mark(m.co, 'jc-mk')}<span>${m.y} · ${esc(m.place)}</span><em>${i + 1} / ${milestones.length}</em></span><h3>${esc(m.t)}</h3><p>${esc(m.d)}</p>`;
  if (!reduced) gsap.fromTo(jCard, { y: 14, autoAlpha: 0.3 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' });
  if (m.place !== jCity) {
    const dir = jCity && cities.indexOf(m.place) < cities.indexOf(jCity) ? -1 : 1;
    const first = !jCity;
    jCity = m.place;
    const label = $('#city-name');
    const all = $$('.city');
    gsap.killTweensOf([...all, label]);
    if (reduced || first) {
      all.forEach((c) => gsap.set(c, { autoAlpha: c.dataset.city === m.place ? 1 : 0, x: 0 }));
      label.textContent = m.place; gsap.set(label, { autoAlpha: 1, y: 0 });
    } else {
      // hand over in sequence: the old skyline and label leave, then the new ones arrive
      all.forEach((c) => { if (c.dataset.city !== m.place) gsap.to(c, { autoAlpha: 0, x: -80 * dir, duration: 0.35, ease: 'power2.in' }); });
      const next = all.find((c) => c.dataset.city === m.place);
      gsap.fromTo(next, { autoAlpha: 0, x: 100 * dir }, { autoAlpha: 1, x: 0, duration: 0.7, delay: 0.3, ease: 'power3.out' });
      gsap.to(label, { autoAlpha: 0, y: -8, duration: 0.2, onComplete: () => { label.textContent = m.place; gsap.fromTo(label, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.35, delay: 0.15 }); } });
    }
  }
}
// the last stretch of scroll pulls the camera back so the whole road fits on screen
const STOPS_END = 0.84;
let jSummary = false;
function showSummary(on) {
  if (on === jSummary) return;
  jSummary = on;
  if (!on) { const i = jIdx; jIdx = -1; showStop(i); return; }
  jCard.innerHTML = `<span class="jc-k"><span>2016 → 2026 · the whole road</span><em>${milestones.length} stops</em></span><h3>Ten years on the road, and it keeps going.</h3><p>TCS in Chennai and Stockholm, Fidelity in Chennai, Walmart in Bengaluru.</p>`;
  jDots.forEach((d) => { d.classList.remove('on'); d.classList.add('past'); });
  $('#jm-y').textContent = '2026';
  if (!reduced) gsap.fromTo(jCard, { y: 14, autoAlpha: 0.3 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' });
}
const lerp = (a, b, t) => a + (b - a) * t;
const journeyPos = (p) => {
  const sw = stones[0].offsetWidth, n = milestones.length;
  const center = jAuto.offsetLeft + jAuto.offsetWidth * AUTO_BODY;
  const q = Math.min(1, p / STOPS_END);
  const t = p > STOPS_END ? gsap.parseEase('power2.inOut')((p - STOPS_END) / (1 - STOPS_END)) : 0;
  const lastX = center - sw / 2 - q * (n - 1) * sw;
  const trackW = n * sw;
  const fit = Math.min(1, (innerWidth - 80) / trackW);
  const x = lerp(lastX, (innerWidth - trackW * fit) / 2, t);
  const scale = lerp(1, fit, t);
  gsap.set('#jr-track', { x, scale, transformOrigin: '0% 100%' });
  gsap.set('#jr-hills', { x: Math.min(0, lastX * 0.3) });
  // the auto drives in from off the left edge as the journey starts, and off to the right at the end
  const IN = 0.06, inT = reduced ? 1 : gsap.parseEase('power2.out')(Math.min(1, p / IN));
  const off = jAuto.offsetLeft + jAuto.offsetWidth + 40;
  gsap.set(jAuto, { autoAlpha: 1, x: lerp(-off, 0, inT) + (reduced ? 0 : t * (innerWidth - jAuto.offsetLeft + 40)) });
  $('.jr-road i').style.setProperty('--lane-x', `${lastX}px`);
  jWheels.forEach((w) => w.setAttribute('transform', `rotate(${(-lastX * 2.4) % 360})`));
  jAuto.classList.add('moving');
  clearTimeout(moveT); moveT = setTimeout(() => jAuto.classList.remove('moving'), 160);
  $('#jr-pin').classList.toggle('overview', t > 0.02);
  if (t > 0.5) showSummary(true);
  else { if (jSummary) showSummary(false); showStop(Math.round(q * (n - 1))); }
};
gsap.set('.city', { autoAlpha: 0 });
journeyPos(0);
ScrollTrigger.create({
  trigger: '#journey', start: 'top top', end: () => `+=${(milestones.length + 2) * (innerWidth < 760 ? 240 : 320)}`,
  pin: '#jr-pin', scrub: reduced ? true : 0.8, anticipatePin: 1, invalidateOnRefresh: true,
  onUpdate: (s) => journeyPos(s.progress), onRefresh: (s) => journeyPos(s.progress), onLeaveBack: () => journeyPos(0),
});

/* =====================================================================
   PASSPORT: markets as visa stamps
   ===================================================================== */
const stampLook = [
  ['6%', '3%', '-9deg', 'round', '#c0392b'], ['48%', '4%', '7deg', 'rect', '#1f4fbf'], ['2%', '40%', '5deg', 'oval', '#178a5a'],
  ['50%', '38%', '-6deg', 'ticket', '#7a3cc4'], ['22%', '70%', '-3deg', 'rect', '#b5402f'],
];
const flags = {
  cl: '<rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#d52b1e"/><rect width="11" height="10" fill="#0039a6"/><path d="M5.5 2.2 l1 3 h3 l-2.5 1.8 l1 3 l-2.5 -1.9 l-2.5 1.9 l1 -3 l-2.5 -1.8 h3 Z" fill="#fff"/>',
  mx: '<rect width="10" height="20" fill="#006847"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ce1126"/><circle cx="15" cy="10" r="2.6" fill="#8a5a2b"/>',
  ca: '<rect width="30" height="20" fill="#fff"/><rect width="7.5" height="20" fill="#d52b1e"/><rect x="22.5" width="7.5" height="20" fill="#d52b1e"/><path d="M15 4 l1.2 2.4 l1.6 -.6 l-.6 3 l2 -1.6 l.4 1.4 l1.6 -.2 l-1 2 l.8 .6 l-3.6 2.4 l.4 1.4 h-2.4 v2 h-.8 v-2 h-2.4 l.4 -1.4 l-3.6 -2.4 l.8 -.6 l-1 -2 l1.6 .2 l.4 -1.4 l2 1.6 l-.6 -3 l1.6 .6 Z" fill="#d52b1e"/>',
  za: '<rect width="30" height="10" fill="#e03c31"/><rect y="10" width="30" height="10" fill="#001489"/><path d="M0 0 L12 8 H30 V12 H12 L0 20 Z" fill="#fff"/><path d="M0 2.4 L10.6 9.2 H30 V10.8 H10.6 L0 17.6 Z" fill="#007749"/><path d="M0 4 L8.4 10 L0 16 Z" fill="#ffb81c"/><path d="M0 5.4 L6.6 10 L0 14.6 Z" fill="#000"/>',
};
flags.sams = flags.mx;
const flag = (id) => `<svg class="pd-flag" viewBox="0 0 30 20" aria-hidden="true">${flags[id] || ''}</svg>`;
const stampDate = { cl: 'Feb 2026', mx: '2024–26', sams: '2026 – now', ca: '2024 – now', za: 'Africa' };
const short = { cl: 'CHILE', mx: 'MÉXICO', sams: 'SAM’S MX', ca: 'CANADA', za: 'S. AFRICA' };
$('#pp-left').innerHTML = `
  <div class="pp-h"><span>Identity platform</span><span>IND</span></div>
  <div class="pp-id"><img class="pp-photo" src="hero-color.webp" alt="Hardik Verma" loading="lazy" width="116" height="146" />
    <div class="pp-f"><div><span>Surname</span><b>VERMA</b></div><div><span>Given name</span><b>HARDIK</b></div><div><span>Role</span><b>STAFF SOFTWARE ENGINEER</b></div><div><span>Issued by</span><b>WALMART GLOBAL TECH</b></div><div><span>Valid since</span><b>JUL 2024</b></div></div></div>
  <p class="pp-sign">Hardik V.</p>
  <div class="pp-mrz">P&lt;INDVERMA&lt;&lt;HARDIK&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br/>IDENTITY&lt;PLATFORM&lt;STAFF&lt;2026&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>`;
$('#pp-right').innerHTML = `<div class="pp-h"><span>Launches · markets</span><span>p. 07</span></div>
  <div class="pp-stamps">${markets.map((m, i) => {
    const [x, y, r, shape, c] = stampLook[i % stampLook.length];
    return `<button class="stamp ${shape}" data-id="${m.id}" style="--sx:${x};--sy:${y};--sr:${r};--c:${c}" aria-label="${esc(m.name)}"><span class="stamp-in">Launch · identity<b>${short[m.id] || esc(m.name)}</b>${esc(stampDate[m.id] || m.when)}</span></button>`;
  }).join('')}</div>`;
function showMarket(id) {
  const m = markets.find((x) => x.id === id);
  $$('.stamp').forEach((s) => s.classList.toggle('on', s.dataset.id === id));
  $('#pp-detail').innerHTML = `<p class="pd-k">${flag(m.id)}<span>${esc(m.name)} · ${esc(m.when)}</span></p><h3 class="pd-t">${esc(m.title)}</h3><p class="pd-l">${esc(m.line)}</p>
    ${m.stats.length ? `<div class="pd-stats">${m.stats.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>` : ''}
    <ul class="pd-ul">${m.did.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
    <div class="pd-chips">${m.shipped.map((s) => `<span>${esc(s)}</span>`).join('')}</div>`;
  if (!reduced) gsap.from('#pp-detail > *', { y: 14, autoAlpha: 0, stagger: 0.05, duration: 0.4 });
}
$('#pp-book').insertAdjacentHTML('beforeend', `<div class="pp-cover" id="pp-cover" aria-hidden="true"><div class="ppc-in"><span class="ppc-k">Identity platform</span><span class="ppc-emb">${mark('walmart', 'ppc-mk')}</span><b>PASSPORT</b><span class="ppc-n">Hardik Verma</span></div></div>`);
$('#pp-right').insertAdjacentHTML('beforeend', '<p class="pp-tip hand">tap a stamp ↑</p>');
$('#pp-right').addEventListener('click', (e) => { const s = e.target.closest('.stamp'); if (s) showMarket(s.dataset.id); });
showMarket('cl');
if (!reduced) {
  const stl = gsap.timeline({ scrollTrigger: { trigger: '#pp-book', start: 'top 70%' } });
  stl.to('#pp-cover', { rotateY: -178, duration: 1.1, ease: 'power3.inOut' })
    .set('#pp-cover', { autoAlpha: 0 });
  $$('.stamp').forEach((s, i) => {
    stl.fromTo(s, { scale: 2.6, autoAlpha: 0, rotation: 25 }, { scale: 1, autoAlpha: 1, rotation: 0, duration: 0.32, ease: 'power4.in', clearProps: 'transform,scale,rotate,translate' }, 1 + i * 0.26)
      .fromTo('#pp-book', { x: 0, y: 0 }, { x: () => gsap.utils.random(-4, 4), y: 3, duration: 0.06, yoyo: true, repeat: 1 }, 1 + i * 0.26 + 0.3);
  });
  stl.from('.pp-tip', { autoAlpha: 0, y: 10, duration: 0.4 });
}

/* =====================================================================
   WRITING: the gazette
   ===================================================================== */
$('#gz-date').textContent = `Bengaluru · ${new Intl.DateTimeFormat('en-GB', { timeZone: identity.tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}`;
$('#gz-topics').innerHTML = [...new Set(writing.map((w) => w.tag))].map((t) => `<span>${esc(t)}</span>`).join('<i>✦</i>');
const gzMeta = (w) => `<div class="gz-meta"><b>${esc(w.tag)}</b><span>${esc(w.date)}</span>${w.read ? `<span>${w.read} min read</span>` : ''}</div>`;
const [lead, ...rest] = writing;
$('#gz-grid').innerHTML = `
  <a class="gz-lead" href="${lead.url}" target="_blank" rel="noopener">
    <div class="gz-img"><img src="${lead.img}" alt="" loading="lazy" referrerpolicy="no-referrer" /></div>
    ${gzMeta(lead)}
    <h3>${esc(lead.title)}</h3>
    <p class="gz-by">By Hardik Verma · continued on Medium →</p>
  </a>
  <div class="gz-side">${rest.slice(0, 2).map((w) => `
    <a class="gz-sec" href="${w.url}" target="_blank" rel="noopener">
      <div class="gz-img"><img src="${w.img}" alt="" loading="lazy" referrerpolicy="no-referrer" /></div>
      ${gzMeta(w)}<h3>${esc(w.title)}</h3>
    </a>`).join('')}</div>
  <div class="gz-index"><p class="gz-ih">Also in this edition</p><ol>${rest.slice(2, 8).map((w) => `
    <li><a href="${w.url}" target="_blank" rel="noopener">${gzMeta(w)}<h4>${esc(w.title)}</h4></a></li>`).join('')}</ol></div>`;
$$('.gz-img img').forEach((img) => img.addEventListener('error', () => img.parentElement.remove()));

/* =====================================================================
   WORDS: a stack of postcards
   ===================================================================== */
const pcStack = $('#pc-stack');
pcStack.innerHTML = testimonials.map((t, i) => `
  <article class="pc" data-i="${i}" aria-label="Recommendation from ${esc(t.who)}">
    <div class="pc-l">
      <p class="pc-q">“${esc(t.pull)}”</p>
      <p class="pc-sig hand">— ${esc(t.who.split(' ')[0])}</p>
      ${t.q.trim() !== t.pull.trim() ? '<button class="pc-more" type="button">Read the full note</button>' : ''}
      <div class="pc-full" hidden><div class="pc-full-in">${esc(t.q).replace(/\n\n/g, '</p><p>').replace(/^/, '<p>')}</p></div><button class="pc-fold" type="button">Fold it back</button></div>
    </div>
    <div class="pc-r">
      <div class="pc-top"><div class="pc-mark"><span>${esc(t.when)}</span><small>LinkedIn</small></div><div class="pc-stamp"><img src="${t.img}" alt="" loading="lazy" /></div></div>
      <div class="pc-to">
        <div><span>From</span>${esc(t.who)}</div>
        <div><span>Role</span>${esc(t.role)}</div>
        <div><span>To</span>whoever’s hiring Hardik</div>
      </div>
    </div>
  </article>`).join('');
const cards = $$('.pc');
let cur = 0;
function layoutCards(animate) {
  const n = cards.length;
  cards.forEach((c, i) => {
    const k = (i - cur + n) % n;
    const props = { x: k * 10, y: k * 12, rotation: k === 0 ? -1 : (k % 2 ? 2.5 : -3) * Math.min(k, 3) * 0.6, zIndex: n - k, autoAlpha: k < 4 ? 1 : 0 };
    if (animate && !reduced) gsap.to(c, { ...props, duration: 0.5, ease: 'power3.out' }); else gsap.set(c, props);
    c.setAttribute('aria-hidden', String(k !== 0));
  });
  $('#pc-count').textContent = `${cur + 1} / ${n}`;
}
function flip(dir) {
  const n = cards.length;
  cards.forEach((c) => { c.classList.remove('reading'); $('.pc-full', c).hidden = true; });
  const top = cards[cur];
  if (reduced) { cur = (cur + dir + n) % n; layoutCards(false); return; }
  if (dir > 0) {
    gsap.to(top, { x: 640, y: -60, rotation: 22, duration: 0.42, ease: 'power2.in', onComplete: () => { cur = (cur + 1) % n; layoutCards(true); } });
  } else {
    cur = (cur - 1 + n) % n;
    gsap.set(cards[cur], { x: -640, y: -60, rotation: -22, zIndex: n + 1, autoAlpha: 1 });
    layoutCards(true);
  }
}
layoutCards(false);
$('#pc-next').addEventListener('click', () => flip(1));
$('#pc-prev').addEventListener('click', () => flip(-1));
pcStack.addEventListener('click', (e) => {
  const card = e.target.closest('.pc');
  if (e.target.closest('.pc-more')) { $('.pc-full', card).hidden = false; card.classList.add('reading'); return; }
  if (e.target.closest('.pc-fold')) { $('.pc-full', card).hidden = true; card.classList.remove('reading'); return; }
  if (e.target.closest('.pc-full') || card?.classList.contains('reading')) return;
  flip(1);
});
pcStack.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') flip(1); if (e.key === 'ArrowLeft') flip(-1); });

/* =====================================================================
   AFTER HOURS: polaroids on a clothesline
   ===================================================================== */
const n = projects.length;
const W = 'fill="none" stroke="#fffaf0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
const polArt = {
  'Travel Planner AI': `<svg viewBox="0 0 64 64"><path d="M8 50 C20 44 18 30 32 30 S46 18 56 14" ${W} stroke-dasharray="4 5"/><path d="M50 6 a8 8 0 0 1 8 8 c0 7 -8 14 -8 14 s-8 -7 -8 -14 a8 8 0 0 1 8 -8 Z" fill="#fffaf0"/><circle cx="50" cy="14" r="3" fill="var(--ink)"/><circle cx="8" cy="50" r="4" fill="#fffaf0"/></svg>`,
  'Voice Wise AI': `<svg viewBox="0 0 64 64"><rect x="24" y="8" width="16" height="28" rx="8" fill="#fffaf0"/><path d="M16 30 a16 16 0 0 0 32 0 M32 46 v10 M24 56 h16" ${W}/><path d="M4 32 v4 M10 28 v12 M54 28 v12 M60 32 v4" ${W}/></svg>`,
  'Shoe Forge': `<svg viewBox="0 0 64 64"><path d="M6 44 V30 l10 -10 h8 l4 8 q10 6 24 8 q8 2 8 8 v4 Z" fill="#fffaf0"/><path d="M6 48 h54" ${W}/><path d="M22 28 l4 4 M26 25 l4 4" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  HDocs: `<svg viewBox="0 0 64 64"><rect x="18" y="8" width="32" height="42" rx="3" fill="#fffaf0" opacity=".55"/><rect x="12" y="14" width="32" height="42" rx="3" fill="#fffaf0"/><path d="M18 24 h20 M18 31 h20 M18 38 h14" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/><circle cx="46" cy="46" r="8" fill="var(--sun)" stroke="var(--ink)" stroke-width="2"/></svg>`,
  'Textop.AI': `<svg viewBox="0 0 64 64"><path d="M6 10 h34 a6 6 0 0 1 6 6 v14 a6 6 0 0 1 -6 6 h-20 l-10 8 v-8 h-4 a6 6 0 0 1 -6 -6 v-14 a6 6 0 0 1 6 -6 Z" fill="#fffaf0"/><path d="M14 20 h20 M14 26 h12" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round"/><path d="M58 30 h-12 v14 h4 v6 l7 -6 a5 5 0 0 0 5 -5 v-4 a5 5 0 0 0 -4 -5 Z" fill="#fffaf0" opacity=".7"/></svg>`,
  CodeMe: `<svg viewBox="0 0 64 64"><path d="M22 18 L8 32 L22 46 M42 18 L56 32 L42 46 M36 12 L28 52" ${W} stroke-width="4"/></svg>`,
};
$('#line').innerHTML = projects.map((p, i) => {
  const t = (i + 0.5) / n, dy = (1 - t) ** 2 * 20 + 2 * (1 - t) * t * 110 + t ** 2 * 20;
  const href = p.live || p.code;
  const tag = href ? `a href="${href}" target="_blank" rel="noopener"` : 'div tabindex="0"';
  const end = href ? 'a' : 'div';
  const initials = p.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2);
  return `<li class="pol" style="--dy:${dy.toFixed(0)}px;--sd:${(-i * 0.7).toFixed(1)}s;--tilt:${i % 2 ? 5 : -5}deg">
    <${tag} class="pol-c"><div class="pol-art" style="--h:${p.hue}"><em>${p.live ? 'live demo' : 'source'}</em>${polArt[p.name] || `<b>${esc(initials)}</b>`}</div>
    <p class="pol-cap">${esc(p.name)}</p><p class="pol-what">${esc(p.what)}</p><p class="pol-stack">${esc(p.stack)}</p>
    <p class="pol-go">${p.live ? 'Open the demo ↗' : 'Read the code ↗'}</p></${end}></li>`;
}).join('');

function hangPolaroids() {
  const line = $('#line'), wrap = line.parentElement, W = wrap.offsetWidth;
  if (innerWidth <= 900) { $$('.pol').forEach((p) => { p.style.marginTop = ''; }); return; }
  $$('.pol').forEach((p) => {
    p.style.marginTop = '0px';
    const t = (p.offsetLeft + p.offsetWidth / 2) / W;
    const ropeY = ((1 - t) ** 2 * 20 + 2 * (1 - t) * t * 110 + t ** 2 * 20) * (wrap.querySelector('svg').getBoundingClientRect().height / 120);
    p.style.marginTop = `${(ropeY + 6).toFixed(1)}px`;
  });
}
hangPolaroids();
addEventListener('resize', hangPolaroids);
edgeArrows($('#line'), { label: 'project' });
document.fonts?.ready.then(hangPolaroids);

/* =====================================================================
   STACK: the keyboard + the medal rack (see keyboard.js, stack.js)
   ===================================================================== */
initStack({ reduced });

/* =====================================================================
   CONTACT: the chai stall at the end of the road, and the town at night
   ===================================================================== */
$('#mail').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(identity.email); $('#mail-s').textContent = 'copied!'; }
  catch (_) { location.href = `mailto:${identity.email}`; }
  setTimeout(() => { $('#mail-s').textContent = 'copy'; }, 1800);
});
/* The road ends at a chai stall, the classic place for a conversation. Every way to reach me is a glass
   on the counter with a note on what it's for. Tap one and the bot behind the counter walks over, tilts
   the kettle and pours; the glass fills and steams, and then that channel opens. */
const GLASSES = [
  { id: 'mail', tag: '@', name: 'Email', note: 'roles, projects, or just hi', href: `mailto:${identity.email}?subject=${encodeURIComponent('Hello from Agent Town')}` },
  { id: 'linkedin', tag: 'in', name: 'LinkedIn', note: 'the work, and what I learned', href: identity.links?.linkedin || 'https://www.linkedin.com/in/hardikverma22/' },
  { id: 'github', tag: 'gh', name: 'GitHub', note: 'the code behind it all', href: identity.links?.github || 'https://github.com/hardikverma22' },
  { id: 'medium', tag: 'M', name: 'Medium', note: 'what I’m learning, written down', href: identity.links?.medium || 'https://medium.com/@hardikverma22' },
];
const glassSvg = (i) => `<svg viewBox="0 0 64 92" aria-hidden="true">
  <defs><clipPath id="gl-in-${i}"><path d="M15 30 L49 30 L45.5 82 Q32 86 18.5 82 Z"/></clipPath>
  <linearGradient id="gl-chai-${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a066"/><stop offset="1" stop-color="#a8663a"/></linearGradient></defs>
  <g class="gl-steam" fill="none" stroke="#fffaf0" stroke-width="3" stroke-linecap="round"><path d="M24 24 q-5 -7 0 -13 q5 -6 0 -12"/><path d="M33 22 q-5 -7 0 -13 q5 -6 0 -12"/><path d="M42 24 q-5 -7 0 -13 q5 -6 0 -12"/></g>
  <g clip-path="url(#gl-in-${i})"><rect class="gl-chai" x="10" y="74" width="44" height="40" fill="url(#gl-chai-${i})"/><ellipse class="gl-foam" cx="32" cy="74" rx="20" ry="3.2" fill="#f1d3ad"/></g>
  <path d="M15 30 L49 30 L45.5 82 Q32 86 18.5 82 Z" fill="rgba(255,255,255,.28)" stroke="#211c33" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M22 33 L23.5 80 M32 33 V83 M42 33 L40.5 80" stroke="#211c33" stroke-width="1.2" opacity=".18"/>
  <path d="M18 34 L20 76" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>
  <ellipse cx="32" cy="30" rx="17" ry="2.6" fill="none" stroke="#211c33" stroke-width="2.4"/>
</svg>`;
$('#st-counter').innerHTML = GLASSES.map((g, i) => `<li style="--k:${i}"><a class="glass" href="${g.href}" ${g.id === 'mail' ? '' : 'target="_blank" rel="noopener"'} data-i="${i}" aria-label="${g.name}: ${g.note}">
  <span class="gl-cup">${glassSvg(i)}<i class="gl-tag">${g.tag}</i></span>
  <b>${g.name}</b><span class="gl-note hand">${g.note}</span></a></li>`).join('');
// the chaiwala: the same bot, behind the counter, holding a kettle. Hover (or tap) and it says hello.
$('#st-vendor').innerHTML = `<span class="sv-bubble hand">Ek chai? Pick a glass!</span><svg viewBox="-50 -96 130 110" aria-hidden="true">
  <g class="sv-bot">
    <path d="M-8 0 v10 M8 0 v10" stroke="#211c33" stroke-width="5" stroke-linecap="round"/>
    <rect x="-17" y="-24" width="34" height="26" rx="8" fill="#7cc4a8" stroke="#211c33" stroke-width="3"/>
    <path d="M-10 -24 v26 M10 -24 v26" stroke="#fff8e6" stroke-width="3" opacity=".8"/>
    <path class="sv-arm" d="M-17 -16 q-12 4 -12 -12" fill="none" stroke="#211c33" stroke-width="4" stroke-linecap="round"/>
    <path d="M17 -16 q14 -4 14 -36" fill="none" stroke="#211c33" stroke-width="4" stroke-linecap="round"/>
    <g class="sv-head">
      <path d="M0 -64 v-10" stroke="#211c33" stroke-width="3" stroke-linecap="round"/><circle class="sv-bulb" cx="0" cy="-76" r="4.5" fill="#ffc94a" stroke="#211c33" stroke-width="2.4"/>
      <rect x="-23" y="-64" width="46" height="38" rx="11" fill="#fff8e6" stroke="#211c33" stroke-width="3"/>
      <rect x="-17" y="-58" width="34" height="23" rx="6" fill="#211c33"/>
      <g class="sv-eyes"><circle cx="-6.5" cy="-46.5" r="3.4" fill="#7dffb0"/><circle cx="6.5" cy="-46.5" r="3.4" fill="#7dffb0"/></g>
      <g class="sv-happy" fill="none" stroke="#7dffb0" stroke-width="2.6" stroke-linecap="round"><path d="M-10 -45 q3.5 -5 7 0"/><path d="M3 -45 q3.5 -5 7 0"/></g>
      <g class="sv-cheeks" fill="#ff8fa3"><ellipse cx="-12" cy="-39" rx="3" ry="1.8"/><ellipse cx="12" cy="-39" rx="3" ry="1.8"/></g>
    </g>
  </g>
  <g class="sv-kettle" transform="translate(0 -28)"><g class="sv-kbody">
    <g class="sv-ksteam" fill="none" stroke="#fffaf0" stroke-width="2.2" stroke-linecap="round"><path d="M78 -62 q-4 -5 0 -10 q4 -5 0 -10"/><path d="M84 -60 q-4 -5 0 -10 q4 -5 0 -10"/></g>
    <path d="M30 -46 h26 l4 26 q-17 6 -34 0 Z" fill="#c9c3d6" stroke="#211c33" stroke-width="3" stroke-linejoin="round"/>
    <path d="M58 -40 q14 -2 18 -16" fill="none" stroke="#211c33" stroke-width="4" stroke-linecap="round"/>
    <circle class="sv-tip" cx="77" cy="-57" r="1" fill="none"/>
    <path d="M29 -42 q-9 6 -1 16" fill="none" stroke="#211c33" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="34" y="-52" width="18" height="6" rx="3" fill="#a9a2bb" stroke="#211c33" stroke-width="2.4"/>
    <path d="M36 -34 h20" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>
  </g></g>
</svg>`;
// what every tea stall has: snack packets clipped to a string, and jars of rusk, biscuits and toffees on a shelf
$('#st-decor').innerHTML = (() => {
  const packs = [['#ef6a5b', '#ffc94a'], ['#ffc94a', '#2e6fb7'], ['#4fb06d', '#fffaf0'], ['#2e6fb7', '#ffc94a'], ['#c04a8c', '#fffaf0']];
  const zig = 'l3 -3 l3 3 l3 -3 l3 3 l3 -3 l3 3 l3 -3';
  const pk = packs.map(([c, d], i) => `<g transform="translate(${18 + i * 40} ${12 + Math.sin((i + 0.5) / 5 * Math.PI) * 9})"><g class="sd-pack" style="--i:${i}">
    <rect x="-3" y="-3" width="6" height="7" rx="1" fill="#a9a2bb" stroke="#211c33" stroke-width="1.4"/>
    <path d="M-10.5 4 ${zig} V34 l-3 3 l-3 -3 l-3 3 l-3 -3 l-3 3 l-3 -3 l-3 3 Z" fill="${c}" stroke="#211c33" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="0" cy="18" r="5" fill="${d}" stroke="#211c33" stroke-width="1.4"/><path d="M-6 28 h12" stroke="${d}" stroke-width="2" stroke-linecap="round"/></g></g>`).join('');
  const jar = (x, lid, fill) => `<g transform="translate(${x} 96)"><rect x="-15" y="-36" width="30" height="36" rx="7" fill="rgba(255,255,255,.22)" stroke="#211c33" stroke-width="2.2"/>${fill}
    <rect x="-12" y="-42" width="24" height="7" rx="3" fill="${lid}" stroke="#211c33" stroke-width="2"/><path d="M-10 -30 v20" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/></g>`;
  const rusk = '<g fill="#d99a52" stroke="#8a5a2b" stroke-width="1"><rect x="-11" y="-14" width="22" height="7" rx="2"/><rect x="-11" y="-7" width="22" height="6" rx="2"/><rect x="-10" y="-21" width="20" height="7" rx="2" transform="rotate(-8)"/></g>';
  const bisc = '<g fill="#e8b04a" stroke="#8a5a2b" stroke-width="1"><circle cx="-6" cy="-6" r="6"/><circle cx="6" cy="-6" r="6"/><circle cx="0" cy="-16" r="6"/><circle cx="-7" cy="-26" r="5"/></g>';
  const tof = '<g stroke="#211c33" stroke-width=".8"><circle cx="-7" cy="-5" r="3.5" fill="#ef6a5b"/><circle cx="0" cy="-6" r="3.5" fill="#ffc94a"/><circle cx="7" cy="-5" r="3.5" fill="#4fb06d"/><circle cx="-4" cy="-12" r="3.5" fill="#2e6fb7"/><circle cx="4" cy="-12" r="3.5" fill="#c04a8c"/><circle cx="0" cy="-18" r="3.5" fill="#ef6a5b"/></g>';
  return `<svg viewBox="0 0 220 110" preserveAspectRatio="xMaxYMin meet" aria-hidden="true">
    <path d="M0 10 Q110 30 220 10" fill="none" stroke="#211c33" stroke-width="1.6"/>${pk}
    ${jar(118, '#ef6a5b', rusk)}${jar(158, '#ffc94a', bisc)}${jar(198, '#4fb06d', tof)}
    <rect x="98" y="96" width="122" height="7" rx="2" fill="#9a6438" stroke="#211c33" stroke-width="2"/>
    <path d="M110 103 l6 8 M208 103 l-6 8" stroke="#211c33" stroke-width="2.4" stroke-linecap="round"/></svg>`;
})();
$('.st-lights').innerHTML = Array.from({ length: 9 }, (_, i) => `<i style="--i:${i}"></i>`).join('');

const stall = $('#stall'), vendor = $('#st-vendor'), stream = $('#st-stream'), pourSvg = $('#st-pour');
let pouring = false;
// until someone picks a glass, the stall says so: the chaiwala greets on arrival, then every few
// seconds the glasses hop in a little wave with a puff of steam
let picked = false, waveTimer = 0;
function wave() {
  if (picked || reduced) return;
  stall.classList.remove('wave'); void stall.offsetWidth; stall.classList.add('wave');
  waveTimer = setTimeout(wave, 5200);
}
function serve() {
  if (stall.classList.contains('serving')) return;
  stall.classList.add('serving');
  if (picked || reduced) return;
  setTimeout(() => { if (!pouring) { vendor.classList.add('greet'); setTimeout(() => vendor.classList.remove('greet'), 3400); } }, 600);
  clearTimeout(waveTimer); waveTimer = setTimeout(wave, 1400);
}
vendor.addEventListener('click', () => { if (pouring) return; vendor.classList.add('greet'); clearTimeout(vendor._g); vendor._g = setTimeout(() => vendor.classList.remove('greet'), 1800); });
document.addEventListener('stall', (e) => { if (e.detail === 'arrive') serve(); else if (e.detail === 'leave' && !pouring) stall.classList.remove('serving'); });
function pour(glass) {
  const i = +glass.dataset.i, g = GLASSES[i];
  // opens once the glass is full and has had a moment to steam
  const open = () => {
    if (g.id === 'mail') { location.href = g.href; return; }
    const w = window.open(g.href, '_blank');
    if (w) w.opener = null; else location.href = g.href;
  };
  if (reduced) { open(); return; }
  pouring = true;
  picked = true; clearTimeout(waveTimer); stall.classList.remove('wave');
  stall.classList.add('pouring');
  serve();
  gsap.killTweensOf(vendor);
  const sr = stall.getBoundingClientRect(), cup = glass.querySelector('.gl-cup'), gr = cup.getBoundingClientRect(), vr = vendor.getBoundingClientRect();
  const pr = pourSvg.getBoundingClientRect();
  pourSvg.setAttribute('viewBox', `0 0 ${pr.width} ${pr.height}`);
  // the vendor steps behind the chosen glass so that, once the kettle tips, the spout sits just off the rim
  // (facing left for the left-hand glasses). 1.04 is where the tipped spout lands across the vendor's 130-unit box.
  const glassX = gr.left + gr.width / 2 - sr.left, baseLeft = vr.left - sr.left - gsap.getProperty(vendor, 'x');
  const flip = glassX < sr.width * 0.45, tipFrac = flip ? -0.04 : 1.04;
  const shift = glassX + (flip ? 9 : -9) - (baseLeft + tipFrac * vr.width);
  const chai = glass.querySelector('.gl-chai'), foam = glass.querySelector('.gl-foam');
  const kettle = vendor.querySelector('.sv-kettle'), tip = vendor.querySelector('.sv-tip');
  const shine = $('#st-shine'), drops = $('#st-drops');
  let L = 0, wobble = null;
  gsap.timeline({ onComplete: () => { pouring = false; stall.classList.remove('pouring'); } })
    .set(vendor, { scaleX: flip ? -1 : 1 })
    .to(vendor, { x: shift, duration: Math.min(0.45, 0.15 + Math.abs(shift - gsap.getProperty(vendor, 'x')) / 1000), ease: 'power2.inOut' })
    .to(kettle, { rotation: 38, svgOrigin: '44 -58', duration: 0.25, ease: 'power2.out' })
    // chai leaves the spout moving sideways, then gravity takes it straight down into the glass
    .call(() => {
      const t = tip.getBoundingClientRect();
      const sx = t.left + t.width / 2 - pr.left, sy = t.top + t.height / 2 - pr.top;
      const ex = gr.left + gr.width / 2 - pr.left + (flip ? 3 : -3), ey = gr.top - pr.top + gr.height * 0.62;
      const d = `M${sx} ${sy} C${sx + (flip ? -5 : 5)} ${sy + 2} ${ex} ${sy + 6} ${ex} ${ey}`;
      stream.setAttribute('d', d);
      shine.setAttribute('d', `M${sx} ${sy + 1} C${sx + (flip ? -4 : 4)} ${sy + 3} ${ex - 1.5} ${sy + 8} ${ex - 1.5} ${ey}`);
      L = stream.getTotalLength();
      gsap.fromTo([stream, shine], { strokeDasharray: L + 2, strokeDashoffset: L + 2, opacity: 1 }, { strokeDashoffset: 0, duration: 0.22, ease: 'power2.in' });
      wobble = gsap.to(stream, { strokeWidth: 4.6, duration: 0.09, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      // a few splashes where it lands
      drops.innerHTML = Array.from({ length: 4 }, () => `<circle cx="${ex}" cy="${gr.top - pr.top + gr.height * 0.36}" r="1.8"/>`).join('');
      gsap.fromTo(drops.children, { x: 0, y: 0, opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.01 }, { x: () => gsap.utils.random(-9, 9), y: () => gsap.utils.random(-12, -5), duration: 0.22, ease: 'power2.out' }, { y: 0, opacity: 0, duration: 0.2, ease: 'power2.in' }], delay: 0.22, stagger: { each: 0.14, repeat: 2 } });
    })
    .to(chai, { attr: { y: 36 }, duration: 0.85, ease: 'power1.out' }, '+=0.2')
    .to(foam, { attr: { cy: 36 }, duration: 0.85, ease: 'power1.out' }, '<')
    // the stream breaks at the spout and its tail falls into the glass
    .add(() => { wobble?.kill(); gsap.to([stream, shine], { strokeDashoffset: -(L + 2), duration: 0.22, ease: 'power2.in' }); })
    .to(kettle, { rotation: 0, svgOrigin: '44 -58', duration: 0.35, ease: 'power2.inOut' }, '+=0.05')
    .call(() => glass.classList.add('steaming'))
    .to(cup, { y: -8, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 1 }, '<+0.1')
    // let it steam for a beat, then open the channel
    .call(open, null, '+=0.9')
    .call(() => { setTimeout(() => { glass.classList.remove('steaming'); gsap.set([stream, shine], { opacity: 0 }); gsap.set(chai, { attr: { y: 74 } }); gsap.set(foam, { attr: { cy: 74 } }); gsap.to(vendor, { x: 0, duration: 0.5, ease: 'power2.inOut', delay: 0.6, onComplete: () => gsap.set(vendor, { scaleX: 1 }) }); }, 1500); });
}
$('#st-counter').addEventListener('click', (e) => {
  const glass = e.target.closest('.glass');
  if (!glass) return;
  e.preventDefault();
  if (!pouring) pour(glass);
});
(() => {
  let b = '', w = '';
  let x = 0, i = 0;
  while (x < 1600) {
    const bw = 50 + ((i * 37) % 70), bh = 40 + ((i * 53) % 90);
    b += `<rect x="${x}" y="${150 - bh}" width="${bw}" height="${bh}" fill="#2a2752" stroke="#14122a" stroke-width="2"/>`;
    for (let wy = 150 - bh + 10; wy < 140; wy += 16) for (let wx = x + 8; wx < x + bw - 10; wx += 14) if ((wx * 7 + wy * 3) % 5 < 2) w += `<rect x="${wx}" y="${wy}" width="6" height="8" fill="#ffd66b"/>`;
    x += bw + 6; i++;
  }
  $('#night-strip').innerHTML = `<svg viewBox="0 0 1600 150" preserveAspectRatio="xMidYMax slice"><rect y="0" width="1600" height="150" fill="none"/>${b}${w}<circle cx="1380" cy="40" r="20" fill="#fff6d8"/></svg>`;
})();
// footer sits on a night-blue band under the skyline
const foot = $('.foot');
const band = document.createElement('div');
band.className = 'foot-band';
foot.replaceWith(band);
band.appendChild(foot);

/* nav highlight follows the guide, see guide.js */

/* ---------------- section entrances ---------------- */
if (!reduced) {
  $$('.sec-h, .gz, .pp-detail').forEach((el) => gsap.from(el, { y: 50, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }));
  gsap.from('.pol', { y: -120, rotation: () => gsap.utils.random(-25, 25), autoAlpha: 0, stagger: 0.08, duration: 1, ease: 'elastic.out(1, .5)', scrollTrigger: { trigger: '#line', start: 'top 80%' } });
  gsap.fromTo('.stamps a', { y: 40, rotation: 30, autoAlpha: 0 }, { y: 0, rotation: 0, autoAlpha: 1, stagger: 0.1, ease: 'back.out(2)', clearProps: 'transform,scale,rotate,translate', scrollTrigger: { trigger: '.stamps', start: 'top 90%' } });
}

/* ---------------- intro: the shutter rolls up ---------------- */
const lift = () => {
  $('#shutter').classList.add('up');
  setTimeout(() => $('.h1').classList.add('done'), reduced ? 0 : 900);
  setTimeout(() => $('#shutter')?.remove(), 1400);
  if (!reduced) {
    gsap.from('.ly-fg', { scale: 1.15, duration: 1.8, ease: 'power3.out' });
    gsap.from('.ly-street', { scale: 1.12, duration: 2, ease: 'power3.out' });
    gsap.from('.hero-copy > *', { y: 40, autoAlpha: 0, stagger: 0.09, duration: 0.9, delay: 0.45, ease: 'power3.out' });
    gsap.from('.pin', { autoAlpha: 0, stagger: 0.1, duration: 0.5, delay: 0.9, clearProps: 'opacity,visibility' });
  }
};
if (reduced) lift();
else if (document.readyState === 'complete') setTimeout(lift, 500);
else addEventListener('load', () => setTimeout(lift, 400));
addEventListener('load', () => ScrollTrigger.refresh());

/* ---------------- the guide: one bot that walks you through the whole page ---------------- */
initGuide({ reduced });
initNudge({ reduced, scrollToEl });
initCursor({ reduced });
