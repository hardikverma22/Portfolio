// The intro: the town draws itself. On a blank sheet, a pen sweeps left to right and the town's line
// drawing appears behind it while "hey, I'm Hardik Verma" writes itself on and the headline inks in as
// outlines. When the page is ready, the colour rises from the street as the sheet wipes away upward,
// and the headline, buttons and tags arrive. The loader becomes the hero.
//
// Smoothness: the line drawing is a static copy of the town (drawn once, outlines only), revealed by a
// paper "eraser" sliding off it; the colour comes in as the whole cover wipes away. Only transforms
// animate, so nothing in the town repaints during the motion.
//
// On every load, reloads included; never for reduced motion. Any click, key or scroll while it plays
// fast-forwards it: it should welcome people, never hold them up.
// index.html adds .intro, .intro-hide and .sketch to <html> before the first paint.
import { gsap } from 'gsap';

const SWEEP = 1.7; // seconds for the pen to cross the town
const CAP = 1200;  // the most we wait for the page to settle before drawing anyway (ms)
const PEN = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 28 L8 18 L22 4 L28 10 L14 24 Z" fill="var(--paper)" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M8 18 L14 24 M19 7 L25 13" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M4 28 L6 23 L9 26 Z" fill="currentColor"/></svg>';

// Resolves once the intro is over (straight away when it doesn't run), so heavy page work can wait for it.
export function runIntro({ reduced, onDone }) {
  let done;
  const over = new Promise((ok) => { done = ok; });
  const root = document.documentElement;
  let active = null, hurry = false, hurried;
  const skipped = new Promise((ok) => { hurried = ok; });
  const SKIP = ['pointerdown', 'keydown', 'wheel', 'touchmove'];
  const skip = () => { hurry = true; active?.timeScale(5); hurried(); };
  const finish = () => {
    SKIP.forEach((ev) => removeEventListener(ev, skip));
    root.classList.remove('intro', 'intro-hide', 'sketch', 'wash', 'cover-ready');
    onDone?.();
    done();
  };
  const stage = document.getElementById('stage'), scene = document.getElementById('scene');
  if (reduced || !root.classList.contains('intro') || !stage || !scene) { finish(); return over; }

  // the cover: paper, a copy of the town drawn in outline, and the eraser that slides off to reveal it
  const cover = document.createElement('div');
  cover.className = 'intro-cover';
  cover.setAttribute('aria-hidden', 'true');
  cover.innerHTML = '<div class="intro-cover-in"><div class="intro-sketch"></div><div class="intro-eraser"><span class="intro-pen">' + PEN + '</span></div></div>';
  const copy = scene.cloneNode(true);
  copy.removeAttribute('id');
  copy.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
  copy.querySelectorAll('.ly-sky, .ly-pins, canvas').forEach((el) => el.remove());
  cover.querySelector('.intro-sketch').append(copy);
  stage.append(cover);
  root.classList.add('cover-ready');
  SKIP.forEach((ev) => addEventListener(ev, skip, { passive: true }));

  const inner = cover.querySelector('.intro-cover-in'), eraser = cover.querySelector('.intro-eraser');
  const hello = document.querySelector('.hello'), h1 = document.querySelector('.h1');
  // dev only: record frame gaps through the whole intro, to check it stays smooth
  if (import.meta.env.DEV) { const g = (window.__introFrames = []); window.__introT0 = performance.now(); let last = performance.now(); const tick = (t) => { g.push([t - window.__introT0, t - last]); last = t; if (root.classList.contains('intro')) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }

  // Start drawing only once the page has settled: loaded, fonts in, and a few steady frames in a row,
  // so the boot work never lands in the middle of the sweep. A slow image can't hold it past CAP.
  const loaded = new Promise((ok) => (document.readyState === 'complete' ? ok() : addEventListener('load', ok, { once: true })));
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const steady = () => new Promise((ok) => {
    let calm = 0, last = performance.now();
    const f = (t) => { calm = t - last < 24 ? calm + 1 : 0; last = t; if (calm >= 4) ok(); else requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
  const cap = new Promise((ok) => setTimeout(ok, CAP));
  let drawn = false;
  Promise.race([Promise.all([loaded, fonts]).then(steady), cap, skipped]).then(() => { if (!drawn) { drawn = true; draw(); } });

  function draw() {
    // the pen sweeps across; the hello line writes on and the headline inks in alongside it
    const tl = active = gsap.timeline({ onComplete: () => { root.classList.add('wash'); const w = active = prepWash(); if (hurry) w.timeScale(5); requestAnimationFrame(() => requestAnimationFrame(() => w.play())); } });
    if (hurry) tl.timeScale(5);
    tl.fromTo(eraser, { xPercent: 0 }, { xPercent: 100, duration: SWEEP, ease: 'power1.inOut', force3D: true }, 0);
    if (hello) tl.fromTo(hello, { clipPath: 'inset(-20% 100% -40% 0)' }, { clipPath: 'inset(-20% 0% -40% 0)', duration: 1.1, ease: 'power1.inOut' }, 0);
    if (h1) tl.fromTo(h1, { clipPath: 'inset(-20% 100% -30% 0)' }, { clipPath: 'inset(-20% 0% -30% 0)', duration: 1.4, ease: 'power1.inOut' }, 0.3);
    tl.to({}, { duration: 0.2 });
  }

  // the wipe is set up during the pause after the pen (the style work lands there, unseen), then played
  function prepWash() {
    if (import.meta.env.DEV) window.__washAt = performance.now() - window.__introT0;
    // the cover moves up while its contents move down by the same amount, so it wipes away from the
    // bottom (the colour rises from the street) without the drawing itself moving
    const tl = gsap.timeline({ paused: true, onComplete: cleanup });
    const lift = cover.offsetHeight;
    // nudge both by a pixel now, so the browser readies the moving layers before the wipe starts
    gsap.set(cover, { y: -1, force3D: true }); gsap.set(inner, { y: 1, force3D: true });
    tl.to(cover, { y: -lift, duration: 1.25, ease: 'power2.inOut', force3D: true }, 0)
      .to(inner, { y: lift, duration: 1.25, ease: 'power2.inOut', force3D: true }, 0)
      .from('.hero-copy > *:not(.hello):not(.h1)', { y: 36, autoAlpha: 0, stagger: 0.09, duration: 0.85, ease: 'power3.out' }, 0.55)
      .call(() => h1?.classList.add('done'), null, 1.2)
      .from('.pin, .town-dir, .balloon-lane', { autoAlpha: 0, y: 10, stagger: 0.06, duration: 0.5, clearProps: 'opacity,visibility,transform' }, 0.9)
      .from('#top-bar', { autoAlpha: 0, y: -16, duration: 0.6, ease: 'power3.out', clearProps: 'opacity,visibility,transform' }, 0.8)
      .to({}, { duration: 0.3 });
    root.classList.remove('intro-hide'); // the from() tweens above have taken over hiding the copy
    return tl;
  }
  function cleanup() {
    cover.remove();
    gsap.set([hello, h1].filter(Boolean), { clearProps: 'clipPath' });
    finish();
  }
  return over;
}
