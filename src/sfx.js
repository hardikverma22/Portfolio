// The town's sounds: one small kit, all synthesized (nothing to download), and all one family. Every
// sound is built from the same voice, a soft FM-bell pluck, tuned to the music's notes (D minor /
// F major) and sent through the same short room reverb, so a tap and a chime sound like one place.
// Clean tones only, short and quiet; the one exception is the ticket's paper tearing, which has to
// sound like paper.
//
// - Nothing plays until the visitor has said they want sound (the entry ticket, see prefs.js) and the
//   browser has seen a gesture. Their choice: 'all' (music and sounds), 'fx' or 'off'.
// - A sound fires on the same frame as the thing it belongs to, and only for moments that mean
//   something: a press, a commit, a snap.
// - Taps on any button or link get a soft "tock" from one delegated listener; things with a character
//   of their own (buildings, stamps, medals, keys, the car) play their own sound instead.

let ac = null, out = null, room = null, noiseBuf = null;
let mode = (() => { try { return JSON.parse(localStorage.getItem('hv-prefs') || 'null')?.sound || 'fx'; } catch { return 'fx'; } })();

export const soundMode = () => mode;
export function setSoundMode(m) { mode = m; }
const enabled = () => mode !== 'off';

// the notes everything is tuned to: D minor / F major, the same notes as the day and night music
const N = { D4: 293.7, A4: 440, D5: 587.3, E5: 659.3, F5: 698.5, A5: 880, C6: 1046.5, D6: 1174.7, E6: 1318.5, F6: 1396.9, A6: 1760 };

function ctx() {
  if (!ac) {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 5;
    out = ac.createGain(); out.gain.value = 0.85;
    out.connect(comp); comp.connect(ac.destination);
    // a small, soft room: a short decaying impulse, mixed in low so sounds have air but no wash
    const len = Math.floor(ac.sampleRate * 1.1), ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3.2; }
    const conv = ac.createConvolver(); conv.buffer = ir;
    const damp = ac.createBiquadFilter(); damp.type = 'lowpass'; damp.frequency.value = 3800;
    room = ac.createGain(); room.gain.value = 0.22;
    room.connect(conv); conv.connect(damp); damp.connect(out);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
// call from a gesture so later sounds (and the intro's notes) are allowed to play
export function unlockSound() { if (enabled()) try { ctx(); } catch { /* no audio */ } }

// The one voice: a sine carrier with a gentle FM modulator, so it rings like a small bell or a kalimba
// tine. `bright` is the FM index (0 = pure sine); `wet` how much goes to the room.
function pluck(t, f, { vol = 0.06, decay = 0.35, bright = 1.2, ratio = 2, glide = 0, wet = 1, attack = 0.003 } = {}) {
  const car = ac.createOscillator(), mod = ac.createOscillator(), mg = ac.createGain(), g = ac.createGain();
  car.frequency.setValueAtTime(f, t);
  if (glide) car.frequency.exponentialRampToValueAtTime(f * glide, t + decay);
  mod.frequency.setValueAtTime(f * ratio, t);
  mg.gain.setValueAtTime(f * bright + 0.01, t); mg.gain.exponentialRampToValueAtTime(f * 0.01 + 0.01, t + decay * 0.6);
  mod.connect(mg); mg.connect(car.frequency);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  car.connect(g); g.connect(out);
  if (wet) { const w = ac.createGain(); w.gain.value = wet; g.connect(w); w.connect(room); }
  car.start(t); mod.start(t); car.stop(t + attack + decay + 0.05); mod.stop(t + attack + decay + 0.05);
}
// a soft, round body for things that land (a stamp, a key): a low sine dropping in pitch
function thump(t, { f = 150, to = 60, vol = 0.22, decay = 0.14 } = {}) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(to, t + decay);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + decay + 0.03);
}
// a plain tone with a quick swell and fall (the car's beep)
function tone(t, f, type, vol, a = 0.01, d = 0.1) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + a + d + 0.02);
}
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// "Air rise": a soft, low-passed tone that swells and glides, like a sheet sliding in (up) or away (down)
function air(t, f, f2, { vol = 0.06, attack = 0.09, decay = 0.35, cut = 1800 } = {}) {
  const o = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain(), w = ac.createGain();
  o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f2, t + attack + decay);
  lp.type = 'lowpass'; lp.frequency.value = cut;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  w.gain.value = 0.9;
  o.connect(lp); lp.connect(g); g.connect(out); g.connect(w); w.connect(room);
  o.start(t); o.stop(t + attack + decay + 0.05);
}

// Paper tearing: bright, broadband noise whose loudness flickers grain by grain, the way fibres snap one
// after another. Fades in fast and trails off; `dur` long, `vol` at its loudest.
function rip(t, dur, vol) {
  const src = ac.createBufferSource(), hp = ac.createBiquadFilter(), bp = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = noiseBuf; src.loop = true;
  hp.type = 'highpass'; hp.frequency.value = 900;
  bp.type = 'peaking'; bp.frequency.value = 3200; bp.gain.value = 6; bp.Q.value = 0.7;
  const n = Math.max(8, Math.round(dur * 500)), curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1), env = Math.min(1, x / 0.06) * (1 - Math.max(0, (x - 0.6) / 0.4)) ** 1.5;
    curve[i] = vol * env * (0.15 + 0.85 * Math.random() ** 2.2); // mostly small grains, now and then a loud snap
  }
  g.gain.setValueAtTime(0, t); g.gain.setValueCurveAtTime(curve, t, dur);
  src.connect(hp); hp.connect(bp); bp.connect(g); g.connect(out);
  src.start(t, Math.random()); src.stop(t + dur + 0.02);
}

// --- the kit ---
const KIT = {
  // a press: a tiny, dry tock (a very short pluck that drops a little)
  tap(t) { pluck(t, pick([N.D6, N.E6]), { vol: 0.045, decay: 0.05, bright: 0.6, glide: 0.7, wet: 0.25 }); },
  // lighter still: tabs, chips, the ticket's fibres
  tick(t) { pluck(t, pick([N.A6, N.F6]), { vol: 0.022, decay: 0.03, bright: 0.3, wet: 0.2 }); },
  // a choice made: two notes up
  select(t) { pluck(t, N.A5, { vol: 0.05, decay: 0.25 }); pluck(t + 0.07, N.D6, { vol: 0.045, decay: 0.4 }); },
  // something opens or closes: the "air rise" glides up, and back down to close
  open(t) { air(t, 330, 880); air(t + 0.02, 495, 1320, { vol: 0.025, attack: 0.1, decay: 0.3, cut: 2200 }); },
  close(t) { air(t, 880, 330, { vol: 0.05, attack: 0.05, decay: 0.3 }); },
  // moving on to the next stop: a lighter air rise
  whoosh(t) { air(t, 330, 880, { vol: 0.04, attack: 0.08, decay: 0.3 }); },
  // a page or postcard turning: two light plucks
  paper(t) { pluck(t, N.C6, { vol: 0.03, decay: 0.12, bright: 0.5 }); pluck(t + 0.035, N.E6, { vol: 0.025, decay: 0.16, bright: 0.5 }); },
  // the ticket: a short rip as you pull it a little further, and the full rip when it gives way
  ripStep(t) { rip(t, 0.05 + Math.random() * 0.04, 0.22); },
  tear(t) { rip(t, 0.34, 0.42); rip(t + 0.05, 0.22, 0.2); },
  // a rubber stamp landing: a round thump and the faintest ring
  stamp(t) { thump(t, { f: 140, to: 55, vol: 0.26, decay: 0.16 }); pluck(t + 0.01, N.D4, { vol: 0.02, decay: 0.2, bright: 0.4, wet: 0.5 }); },
  // a medal's clink: a bell with an inharmonic shimmer
  clink(t) { pluck(t, N.A6, { vol: 0.04, decay: 0.6, bright: 2.2, ratio: 3.5 }); },
  // a keycap: a soft click with a little body
  clack(t) { thump(t, { f: 260, to: 120, vol: 0.12, decay: 0.05 }); pluck(t, pick([N.A6, N.F6]), { vol: 0.015, decay: 0.02, bright: 0.2, wet: 0 }); },
  pop(t) { pluck(t, N.D5, { vol: 0.05, decay: 0.18, glide: 1.6, bright: 0.5 }); },
  clunk(t) { thump(t, { f: 180, to: 70, vol: 0.2, decay: 0.18 }); },
  // the agent car's polite electric beep-beep: a clean sine with a soft triangle an octave-and-a-fifth up
  beep(t) { [0, 0.16].forEach((dt) => { tone(t + dt, 880, 'sine', 0.07); tone(t + dt, 1320, 'triangle', 0.03); }); },
  // evening falls / morning comes: a slow two-note glide, like a breath
  dusk(t) { pluck(t, N.D6, { vol: 0.035, decay: 1.3, bright: 0.4, glide: 0.75, attack: 0.18 }); pluck(t + 0.12, N.A5, { vol: 0.03, decay: 1.3, bright: 0.4, glide: 0.75, attack: 0.2 }); },
  dawn(t) { pluck(t, N.A5, { vol: 0.035, decay: 1.3, bright: 0.4, glide: 1.33, attack: 0.18 }); pluck(t + 0.12, N.D6, { vol: 0.03, decay: 1.4, bright: 0.4, glide: 1.33, attack: 0.2 }); },
};

export function sfx(name) {
  if (!enabled() || !KIT[name]) return;
  try { const c = ctx(); KIT[name](c.currentTime + 0.003); } catch { /* no audio, no problem */ }
}

// Any press on a button or link gets the tock, unless it has a sound of its own (those call sfx() themselves).
const OWN = '.pin, .bld, .town-dir button, #town-auto, .stamp, .stamps a, .pc-stack, .mr-hang, .kb-key, .mode, #mail, #music, .balloon, .sky-grab, .tix-scene, .tp-next, .sb-next, #tour-btn, .glass, .proof, #pc-prev, #pc-next, .case-back, .case-nav button, .mt-card, .dev';
export function initSfx() {
  document.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    const el = e.target.closest?.('a[href], button, [role="button"], summary, label');
    if (!el || el.closest(OWN)) return;
    sfx(el.closest('.nav, .kb-where, .sb-list, .gz-topics') ? 'tick' : 'tap');
  }, { capture: true, passive: true });
}
