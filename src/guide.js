// The guide: the bot from the hero walks you through the whole page. The tour starts with the town,
// building by building in the order they happened, then moves down the sections. It always says where
// you are, what to do, where next and how to go back, whether you use its buttons or just scroll.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mark } from './marks.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// a small prop the bot holds up at each stop
const I = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="#211c33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const PROPS = {
  town: I('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
  story: I('<path d="M4 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4z"/><path d="M20 5h-4a2 2 0 0 0-2 2"/><path d="M20 5v13h-6"/>'),
  lab: I('<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7 15h10"/>'),
  journey: I('<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
  passport: I('<rect x="6" y="14" width="12" height="6" rx="1"/><path d="M9 14V9a3 3 0 1 1 6 0v5"/><path d="M4 22h16"/>'),
  writing: I('<rect x="3" y="5" width="15" height="15" rx="1.5"/><path d="M18 9h3v9a2 2 0 0 1-2 2"/><path d="M7 9h7M7 13h7M7 17h4"/>'),
  words: I('<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"/>'),
  'after-hours': I('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
  stack: I('<rect x="5" y="4" width="14" height="5" rx="2"/><rect x="5" y="9" width="14" height="5" rx="2"/><rect x="5" y="14" width="14" height="6" rx="2"/>'),
  contact: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
};
const CO = { tcs: 'tcs', fidelity: 'fidelity', lab: 'walmart', tower: 'walmart', press: 'medium', home: 'home' };
const short = (n) => n.replace('Walmart · ', '');

const STOPS = [
  { id: 'town', name: 'Agent Town', say: 'Hi, I’m Hardik’s agent. Ten years live in this town. Want me to walk you through it?' },
  { id: 'story', name: 'The story', say: 'The same ten years, in one paragraph. Keep scrolling and it fills in.' },
  { id: 'lab', name: 'Agents', say: 'Four things built at Walmart. Open any one to watch it work.' },
  { id: 'journey', name: 'Journey', say: 'Scroll to drive down the road, one stop at a time.' },
  { id: 'passport', name: 'Markets', say: 'Tap a stamp to see that country.' },
  { id: 'writing', name: 'Writing', say: 'Pick any story to read it on Medium.' },
  { id: 'words', name: 'Kind words', say: 'Flip through what people I’ve worked with said.' },
  { id: 'after-hours', name: 'After hours', say: 'Side projects. Most are live, tap one to try it.' },
  { id: 'stack', name: 'Stack', say: 'Open the tiffin to see what I work with.' },
  { id: 'contact', name: 'Say hi', say: 'That’s the tour! Post a letter and I’ll pass it to Hardik.' },
];

export function initGuide({ scrollToEl, reduced, openBuilding, closeBuilding, chapters }) {
  const stops = STOPS.filter((s) => document.getElementById(s.id));
  const root = $('#buddy'), card = $('#g-card'), bot = $('#g-bot');
  const body = $('#buddy-bot svg');
  bot.insertAdjacentHTML('afterbegin', '<span class="g-prop" id="g-prop" aria-hidden="true"></span>');
  const prop = $('#g-prop');
  let at = -1, ch = -1, propKey = '', hold = 0;

  /* ---------- drawing the bubble ---------- */
  function render({ step, where, say, prim, sec, pk, propHTML, dots }) {
    gsap.killTweensOf(card, 'height');
    card.style.height = '';
    const h0 = card.offsetHeight;
    $('#g-step').textContent = step;
    $('#g-where').textContent = where;
    $('#g-say').innerHTML = say.split(' ').map((w) => `<span class="gw">${esc(w)}</span>`).join(' ');
    const p = $('#g-next'), b = $('#g-back');
    p.textContent = prim.label; p.onclick = prim.fn;
    b.hidden = !sec;
    if (sec) { b.textContent = sec.label; b.onclick = sec.fn; b.setAttribute('aria-label', sec.aria || sec.label); }
    $('#g-dots').innerHTML = Array.from({ length: dots.n }, (_, k) => `<i class="${k < dots.i ? 'seen' : k === dots.i ? 'on' : ''}"></i>`).join('');
    if (pk !== propKey) swapProp(pk, propHTML);
    if (reduced || !open) return;
    // the bubble grows or shrinks to its new text, and the words arrive one after another
    const h1 = card.offsetHeight;
    if (h0 && h0 !== h1) gsap.fromTo(card, { height: h0 }, { height: h1, duration: 0.45, ease: 'power3.out', clearProps: 'height' });
    gsap.fromTo('#g-say .gw', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.025, ease: 'power2.out', delay: 0.05 });
    gsap.fromTo('#g-next, #g-back', { scale: 0.85 }, { scale: 1, duration: 0.5, ease: 'back.out(3)', clearProps: 'transform' });
  }
  function swapProp(pk, html) {
    propKey = pk;
    if (reduced) { prop.innerHTML = html; return; }
    gsap.killTweensOf(prop);
    gsap.timeline()
      .to(prop, { scale: 0, rotation: 30, duration: prop.innerHTML ? 0.18 : 0, ease: 'power2.in' })
      .call(() => { prop.innerHTML = html; })
      .fromTo(prop, { scale: 0, rotation: -40, y: 10 }, { scale: 1, rotation: -8, y: 0, duration: 0.55, ease: 'back.out(2.6)' });
  }

  /* ---------- the page tour ---------- */
  function showStop(i) {
    at = i; ch = -1;
    const s = stops[i], last = i === stops.length - 1;
    const prim = i === 0 ? { label: 'Walk the town →', fn: () => walk(0) }
      : last ? { label: 'Back to the top ↑', fn: () => goStop(0) }
        : { label: `Next: ${stops[i + 1].name} ↓`, fn: () => goStop(i + 1) };
    const sec = i === 0 ? { label: 'Skip to the story ↓', fn: () => goStop(1) }
      : { label: `↑ ${stops[i - 1].name}`, aria: `Back to ${stops[i - 1].name}`, fn: () => goStop(i - 1) };
    render({ step: `${i + 1} / ${stops.length}`, where: s.name, say: s.say, prim, sec, pk: s.id, propHTML: PROPS[s.id] || PROPS.town, dots: { n: stops.length, i } });
    document.documentElement.classList.toggle('in-hero', i === 0);
    document.querySelectorAll('.nav a').forEach((l) => l.classList.toggle('on', l.getAttribute('href') === `#${s.id}`));
  }
  function goStop(i) {
    if (i < 0) return;
    hold = Date.now() + 1700;
    const dir = i >= Math.max(at, 0) ? 1 : -1;
    if (ch >= 0) { ch = -1; closeBuilding(); }
    showStop(i);
    travel(dir);
    scrollToEl(i === 0 ? document.body : `#${stops[i].id}`);
  }

  /* ---------- the town walk: each building is a chapter ---------- */
  const walk = (k) => openBuilding(chapters[k].id);
  function showChapter(k) {
    ch = k;
    const b = chapters[k], prev = chapters[k - 1], next = chapters[k + 1];
    const say = k === 0 ? 'This is where it started. Read the card, then keep walking.'
      : next ? b.title : 'That’s the whole town. Now the short version, in words.';
    render({
      step: `Chapter ${k + 1} / ${chapters.length}`, where: b.name.replace('Walmart · ', 'Walmart '), say,
      prim: next ? { label: `Next: ${short(next.name)} →`, fn: () => walk(k + 1) } : { label: 'On to the story ↓', fn: () => goStop(1) },
      sec: prev ? { label: `← ${short(prev.name)}`, aria: `Back to ${prev.name}`, fn: () => walk(k - 1) } : { label: '✕ Back to town', fn: () => closeBuilding() },
      pk: `co-${b.id}`, propHTML: mark(CO[b.id], 'g-mk'), dots: { n: chapters.length, i: k },
    });
    hop();
  }
  document.addEventListener('town', (e) => {
    const id = e.detail.open;
    if (id) showChapter(Math.max(0, chapters.findIndex((c) => c.id === id)));
    else if (ch >= 0) showStop(current());
  });

  /* ---------- motion ---------- */
  // jumping to another section: the bot leaps toward where the page is heading, then settles back in the corner
  function travel(dir) {
    if (reduced) return;
    const r = bot.getBoundingClientRect();
    const tx = Math.min(innerWidth * 0.5 - (r.left + r.width / 2), 0);
    const ty = dir > 0 ? -innerHeight * 0.42 : -innerHeight * 0.2;
    gsap.killTweensOf(bot);
    gsap.killTweensOf(card, 'scale,opacity,visibility');
    gsap.timeline()
      .to(card, { scale: 0.4, autoAlpha: 0, transformOrigin: '92% 100%', duration: 0.22, ease: 'power2.in' }, 0)
      .to(bot, { keyframes: [
        { x: tx * 0.45, y: ty, rotation: -14 * dir, scale: 1.12, duration: 0.45, ease: 'power2.out' },
        { x: tx * 0.2, y: ty * 0.6, rotation: 8 * dir, duration: 0.3, ease: 'sine.inOut' },
        { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.6, ease: 'back.out(1.8)' },
      ], clearProps: 'transform' }, 0)
      .to(card, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.8)', clearProps: 'transform,opacity,visibility' }, 1.05);
  }
  // moving between chapters: a small hop
  function hop() {
    if (reduced) return;
    gsap.timeline()
      .to(bot, { y: -22, scaleY: 1.06, duration: 0.2, ease: 'power2.out' })
      .to(bot, { y: 0, scaleY: 1, duration: 0.55, ease: 'bounce.out', clearProps: 'transform' });
  }
  // the bot leans into fast scrolling and springs back when the page stops
  if (!reduced && body) {
    gsap.set(body, { transformOrigin: '50% 100%' });
    const lean = gsap.quickTo(body, 'rotation', { duration: 0.8, ease: 'elastic.out(1, 0.35)' });
    let rest = 0;
    ScrollTrigger.create({ onUpdate: (self) => {
      lean(gsap.utils.clamp(-14, 14, -self.getVelocity() / 160));
      clearTimeout(rest); rest = setTimeout(() => lean(0), 140);
    } });
  }

  /* ---------- shrink to just the bot ---------- */
  let open = true;
  try { open = sessionStorage.getItem('hv-guide') !== 'min'; } catch (_) {}
  function setOpen(v, animate = true) {
    open = v;
    bot.setAttribute('aria-expanded', String(v));
    bot.setAttribute('aria-label', v ? 'Hide the tour guide' : 'Show the tour guide');
    try { sessionStorage.setItem('hv-guide', v ? 'open' : 'min'); } catch (_) {}
    gsap.killTweensOf(card, 'scale,opacity,visibility');
    if (!animate || reduced) { root.classList.toggle('min', !v); return; }
    if (v) {
      root.classList.remove('min');
      gsap.fromTo(card, { scale: 0.2, autoAlpha: 0, transformOrigin: '92% 100%' }, { scale: 1, autoAlpha: 1, duration: 0.55, ease: 'back.out(1.8)', clearProps: 'transform,opacity,visibility' });
      gsap.fromTo('#g-say .gw', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.02, delay: 0.2 });
    } else {
      gsap.to(card, { scale: 0.2, autoAlpha: 0, transformOrigin: '92% 100%', duration: 0.3, ease: 'back.in(1.6)', onComplete: () => { root.classList.add('min'); gsap.set(card, { clearProps: 'transform,opacity,visibility' }); } });
      hop();
    }
  }
  $('#g-min').addEventListener('click', () => setOpen(false));
  bot.addEventListener('click', () => setOpen(!open));
  setOpen(open, false);

  /* ---------- follow the reader ---------- */
  // the current stop is the last section whose top has passed the middle of the screen,
  // or the last stop once you reach the bottom (short closing sections never reach the middle)
  const current = () => {
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 4) return stops.length - 1;
    let k = 0;
    stops.forEach((s, i) => { if (document.getElementById(s.id).getBoundingClientRect().top <= innerHeight * 0.55) k = i; });
    return k;
  };
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: () => {
    if (Date.now() < hold || ch >= 0) return;
    const k = current();
    if (k !== at) showStop(k);
  } });
  showStop(0);
  ScrollTrigger.refresh();
}
