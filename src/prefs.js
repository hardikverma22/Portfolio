// The entry ticket. On a first visit, before the pen draws the town, a paper ticket to Agent Town sits on
// the blank sheet and asks two things: how it should sound (music and sounds, just sounds, or silent) and
// what light to see it in (day, night, or the visitor's own time). Every choice previews straight away:
// the sheet darkens for night, the music fades in. Then you tear off the stub to go in.
//
// The tear is a real gesture: the stub hangs from the top of the perforation and follows the pointer
// down 1:1, ticking as the fibres give; let go early and it springs back, pull far enough (or flick)
// and it rips off and falls. A tap, Enter or Escape tears it too. The choice is remembered; the ticket
// comes back on every visit with the last choices already picked, and it can be reopened from the footer.
import { gsap } from 'gsap';
import { sfx, setSoundMode, unlockSound } from './sfx.js';

const KEY = 'hv-prefs';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; } };
const I = {
  all: '<svg viewBox="0 0 20 20"><path d="M8 14.5V4.5l8-2v10"/><circle cx="5.8" cy="14.6" r="2.2"/><circle cx="13.8" cy="12.6" r="2.2"/></svg>',
  fx: '<svg viewBox="0 0 20 20"><path d="M3 8h3l4-3.5v11L6 12H3z"/><path d="M13 7.5a3.5 3.5 0 0 1 0 5"/></svg>',
  off: '<svg viewBox="0 0 20 20"><path d="M3 8h3l4-3.5v11L6 12H3z"/><path d="M13.5 8l4 4m0-4l-4 4"/></svg>',
  day: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="3.6"/><path d="M10 1.8v2.2M10 16v2.2M1.8 10H4M16 10h2.2M4.2 4.2l1.6 1.6M14.2 14.2l1.6 1.6M4.2 15.8l1.6-1.6M14.2 5.8l1.6-1.6"/></svg>',
  night: '<svg viewBox="0 0 20 20"><path d="M16.5 12.2A7 7 0 0 1 7.8 3.5a7 7 0 1 0 8.7 8.7z"/></svg>',
  auto: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.4"/><path d="M10 5.6V10l3 2"/></svg>',
};
const SOUND = [['all', 'Music & sounds'], ['fx', 'Just sounds'], ['off', 'Silent']];
const LIGHT = [['day', 'Day'], ['night', 'Night'], ['auto', 'My time']];
export const SOUND_LABEL = Object.fromEntries(SOUND);
export const SOUND_ICON = I;

// what "my time" means: evening and night by the visitor's own clock
export const nightByClock = () => { const h = new Date().getHours(); return h >= 19 || h < 6; };

export function initPrefs({ reduced, lenis, music, setNight }) {
  const root = document.documentElement;
  const saved = read();
  const prefs = { sound: saved?.sound || 'fx', light: saved?.light || 'auto' };
  setSoundMode(prefs.sound);
  root.dataset.sound = prefs.sound;

  // "music and sounds": music needs a gesture, so it starts on the first tap anywhere after a return visit
  if (saved?.sound === 'all') addEventListener('pointerdown', () => { if (prefs.sound === 'all') music.play(); }, { once: true, capture: true });
  addEventListener('pointerdown', () => unlockSound(), { once: true, capture: true });

  function applySound(s, { preview } = {}) {
    prefs.sound = s;
    setSoundMode(s);
    root.dataset.sound = s;
    if (s === 'all') music.play(); else music.pause();
    if (preview) { unlockSound(); sfx('select'); }
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
      if (prefs.light === 'auto') localStorage.removeItem('hv-mode'); else localStorage.setItem('hv-mode', prefs.light);
    } catch { /* private mode: it just won't be remembered */ }
  }

  let open = false, done = () => {};
  function show({ first } = {}) {
    if (open) return Promise.resolve();
    open = true;
    const scene = document.createElement('div');
    scene.className = `tix-scene${first ? ' first' : ''}`;
    scene.setAttribute('role', 'dialog');
    scene.setAttribute('aria-modal', 'true');
    scene.setAttribute('aria-labelledby', 'tix-h');
    const today = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()).toUpperCase();
    const group = (name, legend, opts, cur) => `<fieldset class="tix-row"><legend>${legend}</legend><div class="tix-opts">${opts.map(([v, l]) =>
      `<label class="tix-opt"><input type="radio" name="tix-${name}" value="${v}"${v === cur ? ' checked' : ''}><span>${I[v]}${l}</span></label>`).join('')}</div></fieldset>`;
    scene.innerHTML = `<div class="tix">
      <div class="tix-main">
        <p class="tix-k"><span>Admit one · Agent Town</span><span>${today}</span></p>
        <h2 class="tix-h" id="tix-h">Before you come in, how would you like the visit?</h2>
        ${group('sound', 'Sound', SOUND, prefs.sound)}
        ${group('light', 'Light', LIGHT, prefs.light)}
        <p class="tix-fine">You can change these any time from the top bar.</p>
      </div>
      <button class="tix-stub" type="button" aria-label="Tear the stub to enter Agent Town">
        <span class="tix-stub-in"><b>Enter</b><small>pull to tear</small><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v15m-6-6 6 6 6-6"/></svg><span class="tix-no">No. ${String(Math.floor(Math.random() * 9000) + 1000)}</span></span>
      </button>
    </div>`;
    document.body.append(scene);
    root.classList.add('tix-open');
    lenis?.stop();
    const ticket = scene.querySelector('.tix'), stub = scene.querySelector('.tix-stub');

    // choices preview live
    scene.addEventListener('change', (e) => {
      const { name, value } = e.target;
      if (name === 'tix-sound') applySound(value, { preview: true });
      if (name === 'tix-light') {
        prefs.light = value;
        setNight(value === 'night' || (value === 'auto' && nightByClock()));
        sfx('tick');
      }
    });

    // arrive: the ticket is set down on the paper with a little settle
    if (!reduced) gsap.fromTo(ticket, { y: 40, rotate: -4, autoAlpha: 0 }, { y: 0, rotate: -1.2, autoAlpha: 1, duration: 0.9, ease: 'elastic.out(1, 0.75)', delay: first ? 0.25 : 0 });
    requestAnimationFrame(() => scene.querySelector('input:checked')?.focus({ preventScroll: true }));

    // keep focus inside the ticket; Escape and Enter on the stub go in
    scene.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); tear(); }
      if (e.key !== 'Tab') return;
      const f = [...scene.querySelectorAll('input:checked, button')];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    });

    // The tear. It runs along the perforation as you pull: on a wide screen from the top of the stub
    // down, on a phone from the left across. The torn part peels away and curls off the page, hinged at
    // the point where the paper still holds, little fibres flick off at the tear front, and the edges are
    // ragged, not cut. Let go early and it lies back down; pull past halfway (or flick) and it rips free.
    const tall = matchMedia('(max-width: 600px)').matches; // the stub sits under the ticket, not beside it
    const main = ticket.querySelector('.tix-main');
    const st = { p: 0 };
    let id = null, y0 = 0, last = [], step = 0, torn = false, roughened = false;

    // ragged edges, one shared random line so the two halves of the tear still fit together
    function roughen() {
      if (roughened) return;
      roughened = true;
      const n = 36, j = Array.from({ length: n + 1 }, () => 1 + Math.random() * 5);
      const at = (i) => ((i / n) * 100).toFixed(2);
      if (!tall) {
        stub.style.clipPath = `polygon(${j.map((x, i) => `${x.toFixed(1)}px ${at(i)}%`).join(',')}, 100% 100%, 100% 0)`;
        main.style.clipPath = `polygon(0 0, ${j.map((x, i) => `calc(100% - ${(6 - x).toFixed(1)}px) ${at(i)}%`).join(',')}, 0 100%)`;
      } else {
        stub.style.clipPath = `polygon(${j.map((y, i) => `${at(i)}% ${y.toFixed(1)}px`).join(',')}, 100% 100%, 0 100%)`;
        main.style.clipPath = `polygon(0 0, 100% 0, ${j.slice().reverse().map((y, i) => `${at(n - i)}% calc(100% - ${(6 - y).toFixed(1)}px)`).join(',')})`;
      }
    }
    // a fibre of paper flicked off the tear front
    function fibre(spray = 1) {
      const r = stub.getBoundingClientRect();
      const x = tall ? r.left + st.p * r.width : r.left, y = tall ? r.top : r.top + st.p * r.height;
      const f = document.createElement('i');
      f.className = 'tix-fibre';
      f.style.cssText = `left:${x}px;top:${y}px;--s:${(3 + Math.random() * 5).toFixed(1)}px`;
      scene.append(f);
      gsap.fromTo(f, { x: 0, y: 0, rotate: Math.random() * 180, autoAlpha: 1 }, {
        x: (tall ? gsap.utils.random(-20, 20) : gsap.utils.random(4, 40)) * spray,
        y: gsap.utils.random(30, 110) * spray, rotate: '+=' + gsap.utils.random(-260, 260),
        autoAlpha: 0, duration: gsap.utils.random(0.6, 1.1), ease: 'power1.in', onComplete: () => f.remove(),
      });
    }
    // draw the tear at progress p (0..1): the freed part lifts and curls about where it still holds
    function render() {
      const p = st.p;
      if (!tall) gsap.set(stub, { transformOrigin: '0% 100%', rotate: p * 16, rotationY: -p * 26, x: p * 7, transformPerspective: 700 });
      else gsap.set(stub, { transformOrigin: '100% 0%', rotate: -p * 12, rotationX: p * 30, y: p * 6, transformPerspective: 700 });
      const k = Math.floor(p * 12);
      if (k > step) { for (let i = step; i < k; i++) fibre(); step = k; sfx('ripStep'); }
    }

    // dev only: a handle for stepping through the tear
    if (import.meta.env.DEV) window.__tix = { st, render, roughen, tear: (v) => tear(v) };
    stub.addEventListener('pointerdown', (e) => {
      if (torn || e.button > 0) return;
      unlockSound();
      roughen();
      id = e.pointerId; y0 = e.clientY; last = [[e.clientY, performance.now()]];
      stub.setPointerCapture(id);
      gsap.killTweensOf(st);
      stub.classList.add('held');
    });
    stub.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      const dy = Math.max(0, e.clientY - y0);
      // 1:1 at first, then the paper resists as it nears the point of giving way (rubber-band)
      st.p = Math.min(1, dy / (dy + 140));
      render();
      last.push([e.clientY, performance.now()]); if (last.length > 5) last.shift();
    });
    const release = (e) => {
      if (e.pointerId !== id) return;
      id = null; stub.classList.remove('held');
      const [[ya, ta], [yb, tb]] = [last[0], last[last.length - 1]];
      const v = tb > ta ? ((yb - ya) / (tb - ta)) * 1000 : 0; // px per second, downwards
      const moved = Math.abs(e.clientY - y0) > 6;
      if (!moved || st.p >= 0.42 || v > 650) tear(v);
      else gsap.to(st, { p: 0, duration: 0.7, ease: 'elastic.out(1, 0.6)', onUpdate: render, onComplete: () => { step = 0; } }); // it lies back down
    };
    stub.addEventListener('pointerup', release);
    stub.addEventListener('pointercancel', release);
    stub.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tear(); } });

    function tear(v = 0) {
      if (torn) return;
      torn = true;
      save();
      const finish = () => {
        scene.remove();
        root.classList.remove('tix-open');
        if (!root.classList.contains('intro')) lenis?.start(); // the intro lets go of the page itself
        open = false;
        done();
      };
      if (reduced) { sfx('tear'); gsap.to(scene, { autoAlpha: 0, duration: 0.25, onComplete: finish }); return; }
      roughen();
      const fast = Math.min(1, v / 2500);
      const tl = gsap.timeline({ onComplete: finish });
      if (import.meta.env.DEV) window.__tix.tl = tl;
      tl
        // the rest of the perforation gives way, quicker if it was pulled hard
        .to(st, { p: 1, duration: 0.28 - fast * 0.14, ease: 'power2.in', onUpdate: render })
        .call(() => { sfx('tear'); for (let i = 0; i < 8; i++) fibre(1.6); })
        .addLabel('free')
        // the stub drops away, tumbling as it falls, keeping the way it was curling
        .to(stub, tall
          ? { y: innerHeight * 0.75, x: -50, rotate: -46, rotationX: 75, duration: 1.05, ease: 'power2.in' }
          : { y: innerHeight * 0.85, x: 90, rotate: 62, rotationY: -80, rotationX: 30, duration: 1.05, ease: 'power2.in' }, 'free')
        .to(stub, { autoAlpha: 0, duration: 0.3 }, 'free+=0.75')
        // and slips into the town: it tips back, away from you, and fades into the paper
        .to(ticket, { rotationX: 58, y: -24, scale: 0.86, autoAlpha: 0, transformOrigin: '50% 100%', duration: 0.65, ease: 'power2.in' }, 'free+=0.85')
        .to(scene, { autoAlpha: 0, duration: 0.45 }, 'free+=1.2');
    }
    return new Promise((ok) => { done = ok; });
  }

  // every visit opens with the ticket (with the last choices already picked); the intro waits on it
  const gate = show({ first: true });

  // the top-bar sound button cycles music & sounds → just sounds → silent
  function cycle() {
    const order = ['all', 'fx', 'off'];
    applySound(order[(order.indexOf(prefs.sound) + 1) % 3]);
    if (prefs.sound !== 'off') { unlockSound(); sfx('select'); }
    save();
    return prefs.sound;
  }
  // the balloon's radio: music on or off, sounds stay as they are
  function setMusic(on) {
    applySound(on ? 'all' : (prefs.sound === 'all' ? 'fx' : prefs.sound));
    save();
  }
  return { gate, reopen: () => show(), cycle, setMusic, get sound() { return prefs.sound; } };
}
