// The intro: the town draws itself. While the page loads, the hero's own drawing starts out as bare ink
// lines on plain paper and a pen sweeps left to right drawing every building, tree and lamp, while
// "hey, I'm Hardik Verma" writes itself on. When the page is ready, colour washes up from the street,
// the sky dawns into its gradient, and the headline, buttons and tags arrive. The loader becomes the hero.
//
// Once per session (a reload in the same tab goes straight to the town), never for reduced motion.
// index.html adds .intro and .sketch to <html> before the first paint, so the finished town never flashes.
import { gsap } from 'gsap';

const LAYERS = ['.ly-far', '.ly-mid', '.ly-street', '.ly-fg'];
const SHAPES = 'path, rect, circle, ellipse, line, polyline, polygon';
const SWEEP = 1.15;  // seconds for the pen to cross the town
const STROKE = 0.75; // seconds to draw each shape
const MIN = 1.9;     // the sketch always gets this long, so it reads as a drawing, not a glitch

export function runIntro({ reduced, onDone }) {
  const root = document.documentElement;
  const finish = () => {
    root.classList.remove('intro', 'intro-hide', 'sketch', 'drawing', 'wash');
    onDone?.();
  };
  if (reduced || !root.classList.contains('intro')) { finish(); return; }
  try { sessionStorage.setItem('hv-intro', '1'); } catch { /* fine */ }

  // every outlined shape gets its own length and a start time by its position, so the pen sweeps across
  const drawn = [];
  for (const sel of LAYERS) {
    for (const el of document.querySelectorAll(`${sel} ${SHAPES}`)) {
      if (!el.hasAttribute('stroke') || el.getAttribute('stroke') === 'none' || el.hasAttribute('stroke-dasharray')) continue;
      if (el.closest('.lights, defs, clipPath, .nightonly')) continue;
      let len = 0, x = 0;
      try { len = el.getTotalLength(); x = el.getBBox().x; } catch { continue; }
      if (!len || len > 6000) continue;
      el.style.setProperty('--len', len.toFixed(1));
      el.style.setProperty('--dd', `${(Math.max(0, Math.min(1, x / 1600)) * SWEEP + Math.random() * 0.12).toFixed(2)}s`);
      el.classList.add('pen');
      drawn.push(el);
    }
  }
  // start the pen on the next frame, once the dashes are in place
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('drawing')));
  // the hello line writes itself on, left to right
  const hello = document.querySelector('.hello');
  if (hello) gsap.fromTo(hello, { clipPath: 'inset(-20% 100% -40% 0)' }, { clipPath: 'inset(-20% 0% -40% 0)', duration: 1.2, delay: 0.2, ease: 'power1.inOut' });
  // and the headline is inked in, in outline, just behind it
  const h1 = document.querySelector('.h1');
  if (h1) gsap.fromTo(h1, { clipPath: 'inset(-20% 100% -30% 0)' }, { clipPath: 'inset(-20% 0% -30% 0)', duration: 1.5, delay: 0.6, ease: 'power1.inOut' });

  const t0 = performance.now();
  const ready = new Promise((ok) => (document.readyState === 'complete' ? ok() : addEventListener('load', ok, { once: true })));
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const cap = new Promise((ok) => setTimeout(ok, 4500)); // never wait on a slow image for longer than this
  Promise.race([Promise.all([ready, fonts]), cap]).then(() => {
    const wait = Math.max(0, MIN * 1000 - (performance.now() - t0));
    setTimeout(wash, wait);
  });

  function wash() {
    // colour floods up from the street, layer by layer, and the paper fades into the sky
    root.classList.add('wash');
    const tl = gsap.timeline({ onComplete: cleanup });
    // the from() tweens below take over hiding the copy and the tags, so the blanket hide can go
    tl.from('.hero-copy > *:not(.hello):not(.h1)', { y: 36, autoAlpha: 0, stagger: 0.09, duration: 0.85, ease: 'power3.out' }, 0.55)
      .call(() => document.querySelector('.h1')?.classList.add('done'), null, 1.2)
      .from('.pin, .town-dir, .balloon-lane', { autoAlpha: 0, y: 10, stagger: 0.06, duration: 0.5, clearProps: 'opacity,visibility,transform' }, 0.9)
      .from('#top-bar', { autoAlpha: 0, y: -16, duration: 0.6, ease: 'power3.out', clearProps: 'opacity,visibility,transform' }, 0.8)
      .to({}, { duration: 0.4 });
    root.classList.remove('intro-hide');
  }
  function cleanup() {
    for (const el of drawn) { el.classList.remove('pen'); el.style.removeProperty('--len'); el.style.removeProperty('--dd'); }
    gsap.set([hello, h1].filter(Boolean), { clearProps: 'clipPath' });
    finish();
  }
}
