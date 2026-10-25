// The headline's one joke, told as a little scene: "boring" is struck out the way a pen would do it,
// "work." steps aside to make room, and "real" is written in by hand, then settles at a tilt.
//
// Before it plays, the line reads "I build agents that do the boring work." with no gap: "work." sits
// shifted left over the space "real" will take, so the intro never shows a hole in the sentence.
// Only transforms, opacity, clip-path and the stroke's dash animate, so nothing reflows.
import { gsap } from 'gsap';

export function initHeadline({ reduced }) {
  const h1 = document.querySelector('.h1');
  const fix = h1?.querySelector('.fix'), was = fix?.querySelector('s'), pen = fix?.querySelector('.fix-strike path');
  const real = h1?.querySelector('.fix-new'), work = h1?.querySelector('.fix-work');
  let played = false;
  const settle = () => { h1?.classList.add('done'); };
  if (!h1 || !fix || !pen || !real || !work || reduced) return { play: settle };

  h1.classList.add('swap-ready');
  // "work." waits where it would sit if "real" weren't there: back by the word's width and the space after it
  // (layout positions, so the word's tilt doesn't count; if the two words sit on different lines, no shift)
  const gap = () => (Math.abs(work.offsetTop - real.offsetTop) < work.offsetHeight ? work.offsetLeft - real.offsetLeft : 0);
  const len = pen.getTotalLength?.() || 260;
  gsap.set(pen, { strokeDasharray: len, strokeDashoffset: len });
  gsap.set(real, { clipPath: 'inset(-30% 100% -30% -10%)', rotate: -14, y: '0.08em', opacity: 1 });
  const park = () => gsap.set(work, { x: -gap() });
  park();
  document.fonts?.ready.then(() => { if (!played) park(); });
  addEventListener('resize', () => { if (!played) park(); });

  function play() {
    if (played) return;
    played = true;
    const tl = gsap.timeline({ onComplete: () => { settle(); gsap.set([real, work, was, pen], { clearProps: 'all' }); h1.classList.remove('swap-ready'); } });
    // 1. the pen strikes through, left to right, like a hand would: quick in the middle, careful at the ends
    tl.to(pen, { strokeDashoffset: 0, duration: 0.42, ease: 'power2.inOut' }, 0)
      .to(was, { opacity: 0.45, duration: 0.3, ease: 'power1.out' }, 0.12)
    // 2. a beat, then "work." makes room on a light spring
      .to(work, { x: 0, duration: 0.7, ease: 'elastic.out(1, 0.75)' }, 0.5)
    // 3. "real" is written in as the room opens, then the tilt settles with a small overshoot
      .to(real, { clipPath: 'inset(-30% -10% -30% -10%)', duration: 0.45, ease: 'power2.out' }, 0.56)
      .to(real, { rotate: -7, y: 0, duration: 0.8, ease: 'elastic.out(1.1, 0.5)' }, 0.62);
  }
  return { play };
}
