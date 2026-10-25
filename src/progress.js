// Where am I on the ride? One place works out which section is on screen, and two things show it:
// on a wide screen the yellow tab in the top nav glides to that section's tab; on a phone (no nav) a
// small "stop" bar sits at the bottom with the stop you're at, how far along the ride you are, and
// a button to the next stop. Tapping the stop's name opens the whole list, so the phone has a nav too.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const STOPS = [
  ['story', 'Story'], ['lab', 'Agents'], ['journey', 'Journey'], ['writing', 'Writing'],
  ['words', 'Kind words'], ['after-hours', 'After hours'], ['stack', 'Stack'], ['contact', 'Contact'],
];
// sections without their own tab light up the one they belong to (the passport and medals are part of
// the journey stop, so they simply count as it)
const TAB = { words: 'writing' };

export function initProgress({ reduced, scrollToEl }) {
  const root = document.documentElement;
  const secs = STOPS.map(([id]) => document.getElementById(id));
  if (secs.some((s) => !s)) return;

  /* ---- wide screens: the tab highlight glides ---- */
  const nav = $('.nav');
  const glide = document.createElement('i');
  glide.className = 'nav-glide';
  glide.setAttribute('aria-hidden', 'true');
  nav?.prepend(glide);
  function placeGlide(id, instant) {
    const a = id && nav ? $(`a[href="#${id}"]`, nav) : null;
    $$('a', nav).forEach((l) => { l.classList.toggle('on', l === a); l.toggleAttribute('aria-current', l === a); });
    if (!a) { glide.classList.remove('show'); return; }
    if (instant || !glide.classList.contains('show')) glide.classList.add('snap');
    glide.style.setProperty('--gx', `${a.offsetLeft}px`);
    glide.style.setProperty('--gw', `${a.offsetWidth}px`);
    glide.classList.add('show');
    if (glide.classList.contains('snap')) requestAnimationFrame(() => requestAnimationFrame(() => glide.classList.remove('snap')));
  }

  /* ---- phones: the stop bar ---- */
  const bar = document.createElement('nav');
  bar.className = 'stopbar';
  bar.setAttribute('aria-label', 'Where you are on the page');
  bar.innerHTML = `
    <button class="sb-here" type="button" aria-expanded="false" aria-controls="sb-list"><span class="sb-n"></span><b class="sb-name"></b><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 7.5 6 4.5l3 3"/></svg></button>
    <span class="sb-track" aria-hidden="true"><i class="sb-fill"></i></span>
    <button class="sb-next" type="button"><span class="sb-next-t">Next</span> <span aria-hidden="true">↓</span></button>
    <ol class="sb-list" id="sb-list" hidden>${STOPS.map(([id, name], i) => `<li><a href="#${id}" data-i="${i}"><span>${String(i + 1).padStart(2, '0')}</span>${name}</a></li>`).join('')}</ol>`;
  document.body.append(bar);
  const here = $('.sb-here', bar), list = $('.sb-list', bar), next = $('.sb-next', bar);
  const setOpen = (open) => {
    list.hidden = !open;
    bar.classList.toggle('open', open);
    here.setAttribute('aria-expanded', String(open));
  };
  here.addEventListener('click', () => setOpen(list.hidden));
  list.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); }); // main.js scrolls to the anchor
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !list.hidden) { setOpen(false); here.focus(); } });
  document.addEventListener('pointerdown', (e) => { if (!list.hidden && !bar.contains(e.target)) setOpen(false); });

  let k = -2;
  next.addEventListener('click', () => {
    if (k >= STOPS.length - 1) scrollToEl(document.body);
    else scrollToEl(secs[k + 1]);
  });

  function update() {
    const line = innerHeight * 0.45;
    let i = -1;
    secs.forEach((s, j) => { if (s.getBoundingClientRect().top <= line) i = j; });
    // the very bottom of the page always counts as the last stop, however short it is
    if (scrollY + innerHeight >= root.scrollHeight - 4) i = secs.length - 1;
    // how far through the ride, from the first stop to the bottom of the page
    const start = secs[0].getBoundingClientRect().top + scrollY - innerHeight * 0.45;
    const p = Math.min(1, Math.max(0, (scrollY - start) / (root.scrollHeight - innerHeight - start)));
    bar.style.setProperty('--p', p.toFixed(3));
    bar.classList.toggle('show', i >= 0);
    if (i === k) return;
    const first = k === -2;
    k = i;
    placeGlide(i >= 0 ? TAB[STOPS[i][0]] || STOPS[i][0] : '', first);
    if (i < 0) return;
    $('.sb-n', bar).textContent = `${String(i + 1).padStart(2, '0')}/${STOPS.length}`;
    $('.sb-name', bar).textContent = STOPS[i][1];
    const last = i === STOPS.length - 1;
    $('.sb-next-t', bar).textContent = last ? 'Top' : STOPS[i + 1][1];
    next.lastElementChild.textContent = last ? '↑' : '↓';
    next.setAttribute('aria-label', last ? 'Back to the top' : `Next stop: ${STOPS[i + 1][1]}`);
    $$('a', list).forEach((a, j) => a.toggleAttribute('aria-current', j === i));
    if (!reduced && !first) { bar.classList.remove('tick'); void bar.offsetWidth; bar.classList.add('tick'); }
  }
  let queued = false;
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; update(); }); } }, { passive: true });
  addEventListener('resize', () => { k = -2; update(); });
  document.fonts?.ready.then(() => { k = -2; update(); });
  update();
}
