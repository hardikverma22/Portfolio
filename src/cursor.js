// The cursor: a small sun-yellow dot (the bot's antenna beacon) with a ring that trails it. Over anything
// you can use, the ring grows; over the things where a click isn't obvious, it turns into a label that says
// what the click does ("Open TCS", "Press", "Pour chai"). It glows at night.
// Only for a mouse or trackpad, and not when the visitor asks for reduced motion. The native cursor is
// hidden only once this one is up, and comes back over text fields and when the mouse leaves the window.
import { gsap } from 'gsap';

// what a click does, for targets that don't say it themselves (first match wins)
const LABELS = [
  ['.nudge', () => 'Take me there'],
  ['.pin, .bld', (el) => { const id = el.dataset.id; const pin = document.querySelector(`.pin[data-id="${id}"]`); return `Open ${(pin?.getAttribute('aria-label') || '').split(',')[0]}`; }],
  ['[data-case]', () => 'Open'],
  ['.kb-space', () => 'Surprise me'],
  ['.kb-key[data-i]', () => 'Press'],
  ['.glass', () => 'Pour chai'],
  ['.stamp', () => 'See market'],
  ['.mr-hang', () => 'Flip'],
  ['.pol-c', (el) => (el.tagName === 'A' ? 'View ↗' : '')],
  ['.pc:not(.reading)', (el, t) => (t.closest('.pc-more, .pc-fold, a') ? '' : 'Next card')],
  ['.gz a[target="_blank"]', () => 'Read ↗'],
];
const HOVER = 'a, button, [role="button"], summary, label, .pin, .bld, .glass, .stamp, .pc, [data-case]';

export function initCursor({ reduced }) {
  if (reduced || !matchMedia('(pointer: fine)').matches) return;
  const root = document.documentElement;
  const cur = document.createElement('div');
  cur.className = 'cur';
  cur.setAttribute('aria-hidden', 'true');
  cur.innerHTML = '<div class="cur-ring"><span class="cur-label"></span></div><div class="cur-dot"></div>';
  document.body.append(cur);
  const dot = cur.querySelector('.cur-dot'), ring = cur.querySelector('.cur-ring'), label = cur.querySelector('.cur-label');

  // the dot sits on the pointer; the ring catches up a moment later
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  let on = false, lastText = '';

  function state(t) {
    // native cursor over text fields, where precision matters
    if (t.closest?.('input, textarea, select, [contenteditable="true"]')) { cur.dataset.s = 'off'; return; }
    let text = '';
    for (const [sel, fn] of LABELS) {
      const el = t.closest?.(sel);
      if (el) { text = fn(el, t) || ''; break; }
    }
    if (text) {
      if (text !== lastText) label.textContent = text;
      lastText = text;
      cur.dataset.s = 'label';
    } else {
      cur.dataset.s = t.closest?.(HOVER) ? 'hover' : '';
    }
  }

  addEventListener('pointermove', (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    if (!on) {
      on = true;
      gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
      root.classList.add('has-cur');
    }
    cur.classList.add('in');
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    state(e.target);
  }, { passive: true });
  // labels can change under a still pointer (a card flips, a case opens)
  addEventListener('pointerover', (e) => { if (on) state(e.target); }, { passive: true });
  document.addEventListener('pointerleave', () => cur.classList.remove('in'));
  addEventListener('blur', () => cur.classList.remove('in'));
  addEventListener('pointerdown', () => cur.classList.add('down'));
  addEventListener('pointerup', () => cur.classList.remove('down'));
}
