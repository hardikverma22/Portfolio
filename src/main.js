import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { caseStudies, skillsBuilt, markets, writing, testimonials, projects, toolbox, toolboxGroups, awards, identity } from './data.js';
import { buildings, story, stickies, milestones, snacks, mimoCase, tiffin, botLines } from './world.js';
import { townMarkup, buddySvg, autoRickshaw, skylines } from './town.js';
import { mark } from './marks.js';

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
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
};
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length < 2 || !$(id)) return;
  e.preventDefault();
  if (townOpen) closeBuilding();
  scrollToEl(id === '#town' ? document.body : id);
});

/* ---------------- day / on-call mode + clock ---------------- */
const modeBtn = $('#mode');
let wantNight = root.dataset.mode === 'night';
let modeTimer = 0;
const syncMode = () => modeBtn.setAttribute('aria-checked', String(wantNight));
syncMode();
modeBtn.addEventListener('click', () => {
  wantNight = !wantNight;
  syncMode();
  try { localStorage.setItem('hv-mode', wantNight ? 'night' : 'day'); } catch (_) {}
  clearTimeout(modeTimer);
  const settle = () => { if (wantNight) root.dataset.mode = 'night'; else delete root.dataset.mode; };
  if (reduced) { settle(); return; }
  root.dataset.mode = wantNight ? 'dusk' : 'dawn';
  modeTimer = setTimeout(settle, wantNight ? 1100 : 900);
});
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
const pinColours = { tcs: '#1b3f8f', fidelity: '#368727', lab: '#ffc220', tower: '#ffc220', press: '#ef6a5b', home: '#ef6a5b' };
const pinMarks = { tcs: 'tcs', fidelity: 'fidelity', lab: 'walmart', tower: 'walmart', press: 'medium', home: 'home' };
$('#pins').innerHTML = buildings.map((b, i) => `
  <button class="pin" data-id="${b.id}" style="--x:${(b.x / 16).toFixed(2)};--y:${(b.y / 9).toFixed(2)};--c:${pinColours[b.id]};--pd:${(i * 0.37).toFixed(2)}s" aria-label="${esc(b.name)}, ${esc(b.when)}">
    <span class="pin-tag">${mark(pinMarks[b.id], 'pin-mk')}${esc(b.name)}<small>${esc(b.when)}</small></span><span class="pin-stem"></span><span class="pin-dot"></span>
  </button>`).join('') + '<p class="tap-hint hand" id="tap-hint" aria-hidden="true">tap a building <svg viewBox="0 0 40 40"><path d="M4 4 C14 10 24 20 30 34 M30 34 l-9 -3 M30 34 l3 -9"/></svg></p>';

// buddy bot
$('#buddy-bot').innerHTML = buddySvg();
// the newsroom ticker loops by exactly one copy of its text
const tick$ = $('.tick-t');
if (tick$) $('.ticker').style.setProperty('--tw', (tick$.getComputedTextLength() / 2).toFixed(1));
const sayEl = $('#buddy-say');
let line = 0;
let sayHide = setTimeout(() => sayEl.classList.add('hide'), 6000);
function say(text) {
  clearTimeout(sayHide);
  sayEl.classList.remove('hide');
  sayHide = setTimeout(() => sayEl.classList.add('hide'), 4500);
  sayEl.textContent = text;
  sayEl.classList.remove('pop'); void sayEl.offsetWidth; sayEl.classList.add('pop');
}
$('#buddy').addEventListener('click', () => {
  say(botLines[++line % botLines.length]);
  gsap.fromTo('#buddy-bot', { y: 0 }, { y: -26, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' });
});

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

// touch: drag sideways to look around a town that is wider than the phone
if (!fine) {
  let sx = 0, base = 0, pan = 0, drag = false;
  const limit = () => Math.max(0, (scene.offsetWidth - innerWidth) / 2);
  stage.addEventListener('pointerdown', (e) => { if (e.target.closest('button,a,.tpanel')) return; drag = true; sx = e.clientX; base = pan; });
  stage.addEventListener('pointermove', (e) => {
    if (!drag || townOpen) return;
    pan = Math.max(-limit(), Math.min(limit(), base + (e.clientX - sx)));
    scene.style.setProperty('--pan', `${pan}px`);
  });
  addEventListener('pointerup', () => { drag = false; });
  // start slightly left so the lab and the tower share the screen
  scene.style.setProperty('--pan', '0px');
}

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
  townOpen = id;
  lenis?.stop();
  $('#tap-hint').style.opacity = 0;
  const r = scene.getBoundingClientRect();
  const W = scene.offsetWidth, H = scene.offsetHeight;
  const narrow = innerWidth < 760;
  const scale = id === 'tower' ? (narrow ? 1.25 : 1.45) : (narrow ? 1.7 : 2.1);
  const px = (b.x / 1600) * W, py = (((b.y + 700) / 2) / 900) * H;
  const sx = narrow ? innerWidth * 0.5 : innerWidth * 0.66, sy = narrow ? innerHeight * 0.3 : innerHeight * 0.56;
  gsap.to(cam, { x: sx - r.left - px * scale, y: sy - r.top - py * scale, scale, duration: 1.3, ease: 'power3.inOut' });
  gsap.to(['#hero-copy', '#fly-cue', '#buddy'], { autoAlpha: 0, duration: 0.4 });
  cam.classList.add('focus');
  $$('.bld, .pin', cam).forEach((el) => el.classList.toggle('on', el.dataset.id === id));
  panel.innerHTML = `
    <button class="tp-x" id="tp-x" aria-label="Back to town">✕</button>
    <p class="tp-k">${mark(pinMarks[b.id], 'tp-mk')}${esc(b.kicker)}</p>
    <p class="tp-when">${esc(b.when)} · ${esc(b.place)}</p>
    <h3 class="tp-t">${esc(b.title)}</h3>
    <p class="tp-b">${esc(b.body)}</p>
    <div class="tp-stats">${b.stats.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>
    <div class="tp-notes">${b.notes.map((n) => `<span>${esc(n)}</span>`).join('')}</div>
    <a class="btn btn-ink" href="${b.go[1]}">${esc(b.go[0])} →</a>`;
  panel.classList.add('open');
  panel.removeAttribute('inert');
  panel.setAttribute('aria-hidden', 'false');
  $('#tp-x').addEventListener('click', closeBuilding);
  setTimeout(() => $('#tp-x')?.focus({ preventScroll: true }), 500);
  gsap.from('.tp-stats div, .tp-notes span', { y: 20, autoAlpha: 0, stagger: 0.06, delay: 0.45, ease: 'back.out(2)' });
}
function closeBuilding() {
  if (!townOpen) return;
  const was = townOpen;
  townOpen = null;
  gsap.to(cam, { x: 0, y: 0, scale: 1, duration: 1.1, ease: 'power3.inOut' });
  gsap.to(['#hero-copy', '#fly-cue', '#buddy'], { autoAlpha: 1, duration: 0.5, delay: 0.5 });
  cam.classList.remove('focus');
  panel.classList.remove('open');
  panel.setAttribute('inert', '');
  panel.setAttribute('aria-hidden', 'true');
  lenis?.start();
  $(`.pin[data-id="${was}"]`)?.focus({ preventScroll: true });
}
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
   LAB: the vending machine
   ===================================================================== */
const icons = {
  siren: '<svg viewBox="0 0 32 32"><path d="M8 24 V16 a8 8 0 0 1 16 0 V24 Z" fill="#fff" stroke="#211c33" stroke-width="2.5"/><rect x="5" y="24" width="22" height="5" rx="2" fill="#211c33"/><path d="M16 3 v4 M5 8 l3 3 M27 8 l-3 3" stroke="#211c33" stroke-width="2.5" stroke-linecap="round"/></svg>',
  key: '<svg viewBox="0 0 32 32"><circle cx="11" cy="16" r="7" fill="#fff" stroke="#211c33" stroke-width="2.5"/><path d="M18 16 H29 M25 16 v5 M29 16 v4" stroke="#211c33" stroke-width="2.5" stroke-linecap="round"/></svg>',
  chip: '<svg viewBox="0 0 32 32"><rect x="8" y="8" width="16" height="16" rx="3" fill="#fff" stroke="#211c33" stroke-width="2.5"/><path d="M12 4v4M20 4v4M12 24v4M20 24v4M4 12h4M4 20h4M24 12h4M24 20h4" stroke="#211c33" stroke-width="2.5" stroke-linecap="round"/></svg>',
  rec: '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="#fff" stroke="#211c33" stroke-width="2.5"/><circle cx="16" cy="16" r="5" fill="#ef6a5b"/></svg>',
};
const totals = { triage: ['TIME SAVED', '~57 min'], delegate: ['PASSWORDS SHARED', '0'], tokens: ['TOKENS SAVED', '~80%'], mimo: ['PROMPTS WRITTEN', '0'] };
const agents = [...caseStudies, mimoCase];
$('#vm-glass').innerHTML = agents.map((a) => {
  const s = snacks[a.id];
  return `<div class="vm-slot" data-id="${a.id}">
    <div class="snack" style="--h:${s.hue}" role="button" tabindex="-1" aria-hidden="true"><em class="kind kind-${s.kind}">${s.kind}</em>${icons[s.icon]}<b>${esc(s.name)}</b><span>${esc(s.flavour)}</span></div>
    <div class="coil"><svg viewBox="0 0 120 22" preserveAspectRatio="none"><g class="coil-g"><path d="M-30 11 ${Array.from({ length: 10 }, (_, i) => `Q${-22 + i * 16} -2 ${-14 + i * 16} 11 T${2 + i * 16} 11`).join(' ')}"/></g></svg></div>
    <span class="code">${s.code}</span></div>`;
}).join('');
$('#vm-glass').insertAdjacentHTML('afterbegin', '<span class="shelf-tag st-a">A · agents</span><span class="shelf-tag st-b">B · tooling</span>');
$('#mt-list').innerHTML = skillsBuilt.map(([t, d], i) => `<li style="--r:${[-1.5, 1, -0.5, 1.5][i % 4]}deg"><b>${esc(t)}</b><p>${esc(d)}</p></li>`).join('');
$('#vm-keys').innerHTML = agents.map((a) => `<button data-id="${a.id}" aria-pressed="false" aria-label="${snacks[a.id].code}: ${esc(a.title)}">${snacks[a.id].code}</button>`).join('');
const screen = $('#vm-screen');
const out = $('#vm-out');
out.innerHTML = '<div class="rc-empty">← press a button.<br/>it’s free.</div>';
let vending = false;
async function vend(id, quiet) {
  if (vending) return;
  vending = true;
  const a = agents.find((x) => x.id === id), s = snacks[id];
  const slot = $(`.vm-slot[data-id="${id}"]`), snack = $('.snack', slot), key = $(`#vm-keys [data-id="${id}"]`);
  $$('#vm-keys button').forEach((b) => b.setAttribute('aria-pressed', String(b === key)));
  key.classList.add('down'); setTimeout(() => key.classList.remove('down'), 160);
  screen.textContent = `${s.code} · ${s.name.toUpperCase()}\nVENDING…`;
  const tray = $('#vm-tray');
  $$('.snack', tray).forEach((n) => gsap.to(n, { y: 90, autoAlpha: 0, duration: 0.3, onComplete: () => n.remove() }));
  const glass = $('#vm-glass').getBoundingClientRect(), sr = snack.getBoundingClientRect();
  const tl = gsap.timeline();
  tl.to($('.coil-g', slot), { x: 16, duration: 0.5, ease: 'none', repeat: 1 }, 0)
    .to(snack, { y: 8, scale: 1.06, duration: 0.6, ease: 'power1.inOut' }, 0)
    .to(snack, { y: glass.bottom - sr.top + 40, rotation: 32, duration: 0.55, ease: 'power2.in' })
    .set(snack, { autoAlpha: 0 });
  if (quiet || reduced) tl.progress(1);
  await tl.then();
  const mini = document.createElement('div');
  mini.className = 'snack';
  mini.style.setProperty('--h', s.hue);
  mini.innerHTML = `<b>${esc(s.name)}</b>`;
  tray.appendChild(mini);
  gsap.from(mini, { y: -90, duration: 0.8, ease: 'bounce.out' });
  screen.textContent = `${s.code} · ${s.name.toUpperCase()}\nENJOY ✓`;
  const [tk, tv] = totals[id];
  out.innerHTML = `<div class="receipt" style="--h:${s.hue}">
    <div class="rc-top"><span>${s.code} · ${s.kind === 'agent' ? 'Agent' : 'Tooling'} · ${esc(a.when)}</span><span>no. 00${a.no.slice(-1)}</span></div>
    <h3 class="rc-t">${esc(a.title)}</h3>
    <p class="rc-line">${esc(a.line)}</p>
    <div class="rc-row"><b>Problem</b><p>${esc(a.problem)}</p></div>
    <div class="rc-row"><b>My part</b><p>${esc(a.role)}</p></div>
    <div class="rc-row"><b>Result</b><p>${esc(a.result)}</p></div>
    <div class="rc-stack">${a.stack.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
    <div class="rc-total"><span>${tk}</span><strong>${tv}</strong></div>
  </div>`;
  if (!reduced) {
    gsap.fromTo('.receipt', { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'steps(14)' });
    gsap.from('.rc-row, .rc-stack, .rc-total', { autoAlpha: 0, x: -10, stagger: 0.08, delay: 0.3 });
  }
  gsap.set(snack, { y: 0, rotation: 0, scale: 0.6, autoAlpha: 0 });
  gsap.to(snack, { scale: 1, autoAlpha: 1, delay: 0.5, duration: 0.5, ease: 'back.out(2)' });
  vending = false;
}
$('#vm-keys').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) vend(b.dataset.id); });
$('#vm-glass').addEventListener('click', (e) => { const s = e.target.closest('.vm-slot'); if (s) vend(s.dataset.id); });
ScrollTrigger.create({ trigger: '#vm', start: 'top 60%', once: true, onEnter: () => setTimeout(() => { if (!$('.receipt')) vend('triage'); }, 700) });

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
const coColour = { tcs: '#1b3f8f', fidelity: '#368727', walmart: '#0071dc' };
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
  gsap.set('#jr-hills', { x: lastX * 0.3 });
  gsap.set(jAuto, { autoAlpha: 1 - t });
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
document.fonts?.ready.then(hangPolaroids);

/* =====================================================================
   STACK: the tiffin + trophy shelf
   ===================================================================== */
const groupOf = { ai: ['ai'], fe: ['fe'], be: ['be'], cloud: ['cloud', 'data', 'ship'], sec: ['sec'] };
const colour = Object.fromEntries(toolboxGroups.map(([k, , c]) => [k, c]));
$('#tiffin').innerHTML = '<div class="tf-handle"></div>' + tiffin.map((t, i) => {
  const items = toolbox.filter(([g]) => groupOf[t.g].includes(g));
  return `<div class="tier${i === 0 ? ' open' : ''}" style="--c:${colour[t.g]}">
    <button class="tier-h" aria-expanded="${i === 0}"><span><b>${esc(t.label)}</b><br/><small>${esc(t.note)}</small></span><span class="tier-r"><span class="tier-n">${items.length}</span><i class="tier-chev" aria-hidden="true"></i></span></button>
    <div class="tier-body"><div class="tier-in"><div class="tier-food">${items.map(([g, , name, note], k) => `<span class="food" tabindex="0" style="--c:${colour[g]}55;--i:${k}" data-tip="${esc(note)}">${esc(name)}</span>`).join('')}</div></div></div>
  </div>`;
}).join('');
$('#tiffin').addEventListener('click', (e) => {
  const h = e.target.closest('.tier-h');
  if (!h) return;
  const tier = h.parentElement, open = !tier.classList.contains('open');
  $$('.tier').forEach((t) => { t.classList.remove('open'); $('.tier-h', t).setAttribute('aria-expanded', 'false'); });
  if (open) { tier.classList.add('open'); h.setAttribute('aria-expanded', 'true'); }
  setTimeout(() => ScrollTrigger.refresh(), 650);
});
const medalCo = { Walmart: 'walmart', Fidelity: 'fidelity', TCS: 'tcs' };
$('#medals').innerHTML = awards.map(([y, t, w], i) => `<li style="--r:${[-3, 2, -1, 3, -2][i % 5]}deg">
  <div class="md"><span class="md-rib" style="--c:${({ walmart: '#0071dc', fidelity: '#368727', tcs: '#1b3f8f' })[medalCo[w]]}"></span><span class="md-coin">${y === '·' ? '★' : esc(y)}</span></div>
  <p class="md-t">${esc(t)}</p><p class="md-w">${mark(medalCo[w], 'md-mk')}${esc(w)}</p></li>`).join('');

/* =====================================================================
   CONTACT: copy, the postbox, and the town at night
   ===================================================================== */
$('#mail').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(identity.email); $('#mail-s').textContent = 'copied!'; }
  catch (_) { location.href = `mailto:${identity.email}`; }
  setTimeout(() => { $('#mail-s').textContent = 'copy'; }, 1800);
});
$('#pb-svg').innerHTML = `<svg viewBox="0 0 200 330" aria-hidden="true">
  <ellipse cx="100" cy="318" rx="80" ry="10" fill="rgba(0,0,0,.18)"/>
  <rect x="44" y="284" width="112" height="30" rx="6" fill="#2a2638" stroke="#211c33" stroke-width="4"/>
  <path d="M40 120 Q40 286 52 290 H148 Q160 286 160 120 Z" fill="#d93a2b" stroke="#211c33" stroke-width="4" stroke-linejoin="round"/>
  <path d="M30 118 Q30 40 100 36 Q170 40 170 118 Z" fill="#c22f22" stroke="#211c33" stroke-width="4" stroke-linejoin="round"/>
  <rect x="26" y="112" width="148" height="16" rx="6" fill="#2a2638" stroke="#211c33" stroke-width="4"/>
  <circle cx="100" cy="30" r="10" fill="#c22f22" stroke="#211c33" stroke-width="4"/>
  <rect x="62" y="146" width="76" height="12" rx="6" fill="#211c33"/>
  <rect x="62" y="176" width="76" height="46" rx="4" fill="#fff4e0" stroke="#211c33" stroke-width="3"/>
  <text x="100" y="196" text-anchor="middle" font-family="Space Mono, monospace" font-weight="700" font-size="12" fill="#211c33">LETTERS</text>
  <text x="100" y="212" text-anchor="middle" font-family="Space Mono, monospace" font-weight="700" font-size="8.5" fill="#5d566f">to Hardik</text>
  <path d="M60 64 Q80 50 100 50" fill="none" stroke="#ff8a7a" stroke-width="5" stroke-linecap="round"/>
  <path d="M54 140 V270" stroke="#ff8a7a" stroke-width="5" stroke-linecap="round"/>
</svg>`;
$('#postbox').addEventListener('click', () => {
  const pb = $('#postbox');
  pb.classList.add('posting');
  setTimeout(() => { location.href = `mailto:${identity.email}?subject=${encodeURIComponent('Hello from Agent Town')}`; }, 950);
  setTimeout(() => pb.classList.remove('posting'), 1800);
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

/* ---------------- nav highlight ---------------- */
const navLinks = $$('.nav a');
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === `#${e.target.id}`));
}, { rootMargin: '-45% 0px -50% 0px' });
['story', 'lab', 'journey', 'passport', 'writing', 'contact'].forEach((id) => io.observe($(`#${id}`)));

/* ---------------- section entrances ---------------- */
if (!reduced) {
  $$('.sec-h, .gz, .pp-detail').forEach((el) => gsap.from(el, { y: 50, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }));
  gsap.from('.pol', { y: -120, rotation: () => gsap.utils.random(-25, 25), autoAlpha: 0, stagger: 0.08, duration: 1, ease: 'elastic.out(1, .5)', scrollTrigger: { trigger: '#line', start: 'top 80%' } });
  gsap.fromTo('.md', { y: -50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.9, ease: 'bounce.out', clearProps: 'transform,opacity,visibility', scrollTrigger: { trigger: '#medals', start: 'top 85%' } });
  gsap.from('.tier', { x: 80, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: 'back.out(1.6)', scrollTrigger: { trigger: '#tiffin', start: 'top 80%' } });
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
    gsap.from('#buddy', { y: 120, duration: 0.9, delay: 1.2, ease: 'back.out(1.6)' });
  }
};
if (reduced) lift();
else if (document.readyState === 'complete') setTimeout(lift, 500);
else addEventListener('load', () => setTimeout(lift, 400));
addEventListener('load', () => ScrollTrigger.refresh());
