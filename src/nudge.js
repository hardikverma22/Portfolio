// If a visitor stops scrolling partway down, the bot peeks in from the left or right edge of the screen
// (picked at random each time), on top of everything, and says what's next (and that there's chai at the end). It always appears in the same
// place, so it never lands on top of the content in a surprising spot.
// It waits a few seconds first, ducks back out the moment they scroll, and tapping it rides them on.
// Once per section (the last stop can ask up to three times, until the auto parks and the chaiwala
// arrives), and never over an open building or case study.
import { buddySvg } from './town.js';

const NEXT = [
  ['town', 'More below, and chai at the end'],
  ['story', 'Next: the agents I built'],
  ['lab', 'Next: Chennai to Bengaluru'],
  ['journey', 'Next: things I’ve written'],
  ['writing', 'Next: kind words from colleagues'],
  ['words', 'Next: after-hours projects'],
  ['after-hours', 'Next: my stack, as a keyboard'],
  ['stack', 'Last stop: chai’s on me'],
];
const IDLE = 6000;

export function initNudge({ reduced, scrollToEl }) {
  const ids = [...NEXT.map(([id]) => id), 'contact'];
  const secs = ids.map((id) => document.getElementById(id));
  if (secs.some((s) => !s)) return;
  const root = document.documentElement;

  const el = document.createElement('button');
  el.className = 'nudge';
  el.type = 'button';
  el.innerHTML = `<span class="ng-bubble"><span class="ng-msg"></span> <i class="ng-arrow" aria-hidden="true">↓</i></span><span class="ng-peek" aria-hidden="true"><span class="ng-peek-in">${buddySvg()}</span></span>`;
  document.body.append(el);
  const msg = el.querySelector('.ng-msg');
  if (reduced) el.classList.add('still');

  const seen = new Set();
  let timer = 0, target = null;
  function current() {
    const mid = innerHeight * 0.5;
    let k = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= mid) k = i; });
    return k;
  }
  const busy = () => root.classList.contains('case-open') || root.classList.contains('town-focus') || document.hidden;

  // the stop that matters most: on the last section, the chaiwala only turns up once the auto parks,
  // so someone who stops just short would never meet them. Here the bot can ask more than once.
  const stall = document.getElementById('stall');
  let parkAsks = 0;
  function show() {
    const k = current(), last = k === NEXT.length;
    if (busy()) return;
    // on an upright phone the hero's own building directory is the guide
    if (k === 0 && matchMedia('(max-width: 600px) and (max-aspect-ratio: 1/1)').matches) return;
    // below the hero on a phone, the stop bar (progress.js) already says what's next; only the chai stop still asks
    if (k > 0 && !last && matchMedia('(max-width: 900px)').matches) return;
    if (last ? parkAsks >= 3 || stall?.classList.contains('serving') : seen.has(k)) return;
    if (scrollY + innerHeight >= root.scrollHeight - 40) return;
    const text = last ? 'A little more and your chai’s ready' : NEXT[k][1];
    if (last) { parkAsks++; target = root.scrollHeight; } else { seen.add(k); target = secs[k + 1]; }
    msg.textContent = text;
    el.dataset.side = Math.random() < 0.5 ? 'left' : 'right';
    el.setAttribute('aria-label', `${text}. Take me there.`);
    el.classList.add('on');
  }
  function hide() { el.classList.remove('on'); }
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
}
