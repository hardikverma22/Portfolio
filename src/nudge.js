// If a visitor stops scrolling partway down, the auto on screen pulls over and the bot driving it says
// what's next (and that there's chai at the end). It's the same bot in whichever auto is on screen: the one
// on the page road, the journey's, or the town's. If that auto is hidden behind a card or a block of text,
// the bot peeks its head over the edge of whatever is in the way and talks from there ("psst, back here").
// It waits a few seconds first, ducks back the moment they scroll, and tapping the bubble rides them on.
// Once per section (the last stop can ask up to three times, until the auto parks and the chaiwala
// arrives), never over an open building or case study, and only when an auto is around.
import { buddySvg } from './town.js';

const NEXT = [
  ['town', 'More town below, and chai at the very end'],
  ['story', 'Next up: two agents and two tools, still running'],
  ['lab', 'Next up: the ride from Chennai to Bengaluru'],
  ['journey', 'Next up: one sign-in, stamped in every market'],
  ['passport', 'Next up: the Agent Herald, fresh off the press'],
  ['writing', 'Next up: kind words from people I’ve worked with'],
  ['words', 'Next up: what I build after hours'],
  ['after-hours', 'Next up: a gumball machine full of my stack'],
  ['stack', 'Last stop ahead: the chai’s on me'],
];
const IDLE = 6000;
const PEEK = 40; // how much of the bot shows over an edge: antenna and head

export function initNudge({ reduced, scrollToEl }) {
  const ids = [...NEXT.map(([id]) => id), 'contact'];
  const secs = ids.map((id) => document.getElementById(id));
  if (secs.some((s) => !s)) return;
  const root = document.documentElement;
  // the autos the bot rides, and where in each box it sits
  const autos = [
    [() => document.querySelector('#ride'), [0.5, 0.5]],
    [() => document.getElementById('jr-auto'), [0.3, 0.17]],
    [() => document.getElementById('town-auto'), [0.42, 0.03]],
  ];

  const el = document.createElement('button');
  el.className = 'nudge';
  el.type = 'button';
  el.innerHTML = `<span class="ng-peek" aria-hidden="true"><span class="ng-peek-in">${buddySvg()}</span></span><span class="ng-bubble"><small class="ng-k">psst</small><b><span class="ng-msg"></span> <i class="ng-arrow">↓</i></b></span>`;
  document.body.append(el);
  const msg = el.querySelector('.ng-msg'), kick = el.querySelector('.ng-k');

  const seen = new Set();
  let timer = 0, target = null, anchor = null, raf = 0;

  function current() {
    const mid = innerHeight * 0.5;
    let k = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= mid) k = i; });
    return k;
  }
  const busy = () => root.classList.contains('case-open') || root.classList.contains('town-focus') || document.hidden;

  // What, if anything, is drawn on top of the auto at (x, y)? Walk up from whatever is under the point
  // to its section: the outermost thing with a solid background, an image, or its own text is the cover.
  const solid = (n) => {
    const cs = getComputedStyle(n), bg = cs.backgroundColor.match(/[\d.]+/g);
    if (bg && (bg.length < 4 || +bg[3] > 0.5)) return true;
    if (/^(IMG|CANVAS|VIDEO|P|H1|H2|H3)$/.test(n.tagName)) return true;
    return [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
  };
  function coverAt(x, y, auto) {
    const hit = document.elementFromPoint(x, y);
    if (!hit || auto.contains(hit)) return null;
    let cover = null;
    for (let n = hit; n && n !== document.body; n = n.parentElement) {
      if (n.matches('section, main, #scene, .stage, .cam, .wrap')) break;
      if (n instanceof SVGElement && !(n instanceof SVGSVGElement)) continue;
      if (solid(n)) cover = n;
    }
    return cover;
  }
  // where the bot can peek out from behind a cover: from whichever on-screen edge is nearest the auto
  // (over the top, round a side, or hanging upside down from the bottom)
  function peekFrom(cover, x, y) {
    const r = cover.getBoundingClientRect(), pad = 26;
    const cx = Math.min(r.right - pad, Math.max(r.left + pad, x)), cy = Math.min(r.bottom - pad, Math.max(Math.max(r.top, 110) + pad, y));
    const edges = [
      { side: 'top', x: cx, y: r.top, d: y - r.top, ok: r.top > 110 && r.top < innerHeight - 20 },
      { side: 'bottom', x: cx, y: r.bottom, d: r.bottom - y, ok: r.bottom > 60 && r.bottom < innerHeight - 140 },
      { side: 'left', x: r.left, y: cy, d: x - r.left, ok: r.left > 70 },
      { side: 'right', x: r.right, y: cy, d: r.right - x, ok: r.right < innerWidth - 70 },
    ].filter((e) => e.ok).sort((a, b) => a.d - b.d);
    return edges[0] || null;
  }

  // the first auto that is on screen. If any part of it shows (say its back end, sticking out from under
  // a card) the bubble comes from that part; only when it's completely hidden does the bot peek.
  const GRID = [0.5, 0.3, 0.7, 0.15, 0.85];
  function findAnchor() {
    for (const [get, at] of autos) {
      const a = get();
      if (!a) continue;
      const r = a.getBoundingClientRect(), cs = getComputedStyle(a);
      if (!r.width || cs.visibility === 'hidden' || +cs.opacity < 0.2) continue;
      const x = r.left + r.width * at[0], y = r.top + r.height * at[1];
      if (x < 20 || x > innerWidth - 20 || y < 120 || y > innerHeight - 20) continue;
      let cover = coverAt(x, y, a);
      if (!cover) return { a, at };
      // a peek at the rest of the auto, centre-out, for a part that isn't covered
      for (const fy of GRID) for (const fx of GRID) {
        const px = r.left + r.width * fx, py = r.top + r.height * fy;
        if (px < 20 || px > innerWidth - 20 || py < 120 || py > innerHeight - 20) continue;
        if (!coverAt(px, py, a)) return { a, at: [fx, fy] };
      }
      const peek = peekFrom(cover, x, y);
      if (peek) return { a, at, cover, peek };
    }
    return null;
  }

  // follow the auto (or the edge it's hiding behind) while the bubble is up
  function place() {
    if (!anchor) return;
    let x, y;
    if (anchor.peek) {
      const r = anchor.cover.getBoundingClientRect(), p = anchor.peek;
      x = p.side === 'left' ? r.left : p.side === 'right' ? r.right : p.x;
      y = p.side === 'top' ? r.top : p.side === 'bottom' ? r.bottom : p.y;
    } else {
      const r = anchor.a.getBoundingClientRect();
      x = r.left + r.width * anchor.at[0]; y = r.top + r.height * anchor.at[1];
    }
    if (x < -10 || x > innerWidth + 10 || y < 0 || y > innerHeight + 40) { hide(); return; }
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    el.classList.toggle('flip', anchor.peek ? anchor.peek.side === 'left' || (/top|bottom/.test(anchor.peek.side) && x > innerWidth * 0.55) : x > innerWidth * 0.55);
    raf = requestAnimationFrame(place);
  }

  // the stop that matters most: on the last section, the chaiwala only turns up once the auto parks,
  // so someone who stops just short would never meet them. Here the driver can ask more than once.
  const stall = document.getElementById('stall');
  let parkAsks = 0;
  function show() {
    const k = current(), last = k === NEXT.length;
    if (busy()) return;
    if (last ? parkAsks >= 3 || stall?.classList.contains('serving') : seen.has(k)) return;
    if (scrollY + innerHeight >= root.scrollHeight - 40) return;
    anchor = findAnchor();
    if (!anchor) { timer = setTimeout(show, 2500); return; } // no auto around yet: look again shortly
    const text = last ? 'Almost there! Scroll a bit more to park, and I’ll pour your chai' : NEXT[k][1];
    if (last) { parkAsks++; target = root.scrollHeight; } else { seen.add(k); target = secs[k + 1]; }
    msg.textContent = text;
    kick.textContent = anchor.peek ? 'psst, back here' : 'psst';
    el.dataset.side = anchor.peek ? anchor.peek.side : 'auto';
    el.setAttribute('aria-label', `${text}. Take me there.`);
    cancelAnimationFrame(raf); place();
    el.classList.add('on');
    document.dispatchEvent(new CustomEvent('nudge', { detail: { on: true, auto: anchor.a } }));
  }
  function hide() {
    if (!el.classList.contains('on')) return;
    el.classList.remove('on');
    document.dispatchEvent(new CustomEvent('nudge', { detail: { on: false } }));
    setTimeout(() => { if (!el.classList.contains('on')) { cancelAnimationFrame(raf); anchor = null; } }, 500);
  }
  function poke() {
    hide();
    clearTimeout(timer);
    timer = setTimeout(show, IDLE);
  }
  for (const ev of ['scroll', 'wheel', 'touchmove', 'keydown']) addEventListener(ev, poke, { passive: true });
  poke();

  el.addEventListener('click', () => {
    hide();
    if (target != null) scrollToEl(typeof target === 'number' ? root.scrollHeight : target);
  });
  if (reduced) el.classList.add('still');
  el.style.setProperty('--peek', `${PEEK}px`);
}
