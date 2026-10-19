// Music for the town: tap the transistor radio on the bench and a sustained chord fades in, then loops
// forever without a seam; a play/pause button slides into the top bar to control it from anywhere.
//
// - Browsers only allow sound after the visitor does something, so it never starts on its own.
// - The track ends at full volume, so a plain loop would jump. Instead each pass crossfades into the next
//   one (equal-power, a few seconds), skipping the swell at the very start of the file.
// - It fades in along an eased curve and out again on pause; below the hero it settles to about half,
//   at night a gentle low-pass warms it, and it fades out while the tab is hidden.
// - The level is measured live, so the radio's speaker, the top-bar bars and the hero's lights can move
//   with it (musicLevel()).
// - A pause is remembered: the button is there on the next visit, but nothing plays until they ask.

const SRC = 'audio/sustained-chord.mp3';
const SKIP = 0.6;     // the swell at the start of the file, heard only on the very first pass
const XF = 4;         // seconds each pass crossfades into the next
const LEVEL = 0.38;   // full volume on the hero
const BELOW = 0.5;    // share of that once you scroll past the hero
const FADE_IN = 4, FADE_OUT = 1.2;

// two volume stages: `fader` carries the eased play/pause fades, `duck` the softer level below the hero
// (and silence while the tab is hidden), so a fade and a duck can never fight over one parameter
let ac = null, buf = null, master = null, fader = null, duck = null, filter = null, analyser = null, bins = null;
let fade = { from: 0, to: 0, at: 0, dur: 0 }; // the fade in progress, so its current level is always known
let playing = false, loading = null, nextAt = 0, timer = 0, sources = [];
let hero = 1, visible = true, level = 0;
const listeners = new Set();

const ease = (n, from, to) => { const c = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / (n - 1); c[i] = from + (to - from) * (0.5 - 0.5 * Math.cos(Math.PI * t)); } return c; };
// equal-power curves for the crossfade
const ramp = (n, up) => { const c = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / (n - 1); c[i] = up ? Math.sin(t * Math.PI / 2) : Math.cos(t * Math.PI / 2); } return c; };

function setup() {
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); fader = ac.createGain(); fader.gain.value = 0; duck = ac.createGain(); duck.gain.value = 1;
  master.connect(fader); fader.connect(duck);
  filter = ac.createBiquadFilter(); filter.type = 'lowpass'; filter.Q.value = 0.4;
  filter.frequency.value = document.documentElement.dataset.mode === 'night' ? 3800 : 18000;
  analyser = ac.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.82;
  bins = new Uint8Array(analyser.frequencyBinCount);
  duck.connect(filter); filter.connect(analyser); analyser.connect(ac.destination);
}
async function load() {
  if (buf) return buf;
  loading ??= fetch(SRC).then((r) => r.arrayBuffer()).then((a) => new Promise((ok, no) => ac.decodeAudioData(a, ok, no))).then((b) => (buf = b));
  return loading;
}

// one pass of the track, starting at `when`; it fades in over XF (except the first) and out over its last XF
function pass(when, first) {
  const src = ac.createBufferSource(), g = ac.createGain();
  src.buffer = buf; src.connect(g); g.connect(master);
  const from = first ? 0 : SKIP, len = buf.duration - from;
  if (first) g.gain.value = 1;
  else { g.gain.setValueAtTime(0, when); g.gain.setValueCurveAtTime(ramp(64, true), when, XF); }
  g.gain.setValueCurveAtTime(ramp(64, false), when + len - XF, XF);
  src.start(when, from); src.stop(when + len + 0.05);
  sources.push(src);
  src.onended = () => { sources = sources.filter((s) => s !== src); };
  nextAt = when + len - XF;
  // schedule the next pass a couple of seconds before it's due
  clearTimeout(timer);
  timer = setTimeout(() => { if (playing) pass(nextAt, false); }, Math.max(0, (nextAt - ac.currentTime - 2) * 1000));
}

const shaped = (t) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)));
// where the current fade has got to right now
function fadeLevel() {
  if (!fade.dur) return fade.to;
  return fade.from + (fade.to - fade.from) * shaped((ac.currentTime - fade.at) / fade.dur);
}
// an eased fade on the fader from wherever it is now; anything still scheduled is dropped first
function fadeTo(to, secs) {
  const g = fader.gain, now = ac.currentTime, from = fadeLevel();
  g.cancelScheduledValues(0);
  g.setValueAtTime(from, now);
  if (Math.abs(to - from) < 0.002) { g.setValueAtTime(to, now); fade = { from: to, to, at: now, dur: 0 }; return; }
  g.setValueCurveAtTime(ease(64, from, to), now + 0.005, secs);
  fade = { from, to, at: now + 0.005, dur: secs };
}
// the softer level below the hero, and silence while hidden: a smooth glide on the duck stage
const duckLevel = () => (visible ? (hero ? 1 : BELOW) : 0);
function duckTo(secs) { duck.gain.setTargetAtTime(duckLevel(), ac.currentTime, secs / 3); }

export async function play() {
  if (playing) return;
  if (!ac) setup();
  playing = true; emit();
  if (ac.state === 'suspended') await ac.resume();
  await load();
  if (!playing) return;
  if (!sources.length) pass(ac.currentTime + 0.05, nextAt === 0);
  duck.gain.setValueAtTime(duckLevel(), ac.currentTime);
  fadeTo(LEVEL, FADE_IN);
  try { localStorage.setItem('hv-music', 'on'); } catch { /* fine */ }
}
export function pause() {
  if (!playing) return;
  playing = false; emit();
  fadeTo(0, FADE_OUT);
  setTimeout(() => { if (!playing) { sources.forEach((s) => { try { s.stop(); } catch { /* done */ } }); sources = []; clearTimeout(timer); ac.suspend(); } }, FADE_OUT * 1000 + 100);
  try { localStorage.setItem('hv-music', 'off'); } catch { /* fine */ }
}
export const toggle = () => (playing ? pause() : play());
export const isPlaying = () => playing;
export const onMusic = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
function emit() { listeners.forEach((fn) => fn(playing)); }
export const wasOn = () => { try { return !!localStorage.getItem('hv-music'); } catch { return false; } };

// a smoothed 0..1 loudness, and three bands for the top-bar bars
export function musicLevel() { return level; }
export function musicBands(out) {
  if (!analyser || !playing) { out[0] = out[1] = out[2] = 0; return out; }
  analyser.getByteFrequencyData(bins);
  const band = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += bins[i]; return s / ((b - a) * 255); };
  out[0] = band(1, 6); out[1] = band(6, 20); out[2] = band(20, 60);
  return out;
}
function meter() {
  if (analyser) {
    analyser.getByteFrequencyData(bins);
    let s = 0; for (let i = 1; i < 60; i++) s += bins[i];
    const raw = Math.min(1, (s / (59 * 255)) * 2.2);
    level += (raw - level) * 0.12;
  }
  requestAnimationFrame(meter);
}

export function initMusic() {
  // quieter below the hero, warmer at night, silent while the tab is hidden
  const town = document.getElementById('town');
  if (town) new IntersectionObserver(([e]) => { hero = e.intersectionRatio > 0.3 ? 1 : 0; if (ac) duckTo(2.2); }, { threshold: [0, 0.3, 0.6] }).observe(town);
  new MutationObserver(() => {
    if (!filter) return;
    const night = document.documentElement.dataset.mode === 'night';
    filter.frequency.setTargetAtTime(night ? 3800 : 18000, ac.currentTime, 1.2);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (!ac || !playing) return;
    if (visible) {
      ac.resume();
      // timers are throttled in a hidden tab, so the next pass may not have been queued in time
      if (!sources.length || nextAt < ac.currentTime) pass(ac.currentTime + 0.05, false);
      duckTo(1.5);
    } else duckTo(0.6);
  });
  requestAnimationFrame(meter);
}

// dev only: a handle for inspecting the audio graph from the console
if (import.meta.env.DEV) window.__music = { get ac() { return ac; }, get buf() { return buf; }, get gain() { return fader ? fadeLevel() * duck.gain.value : 0; }, get param() { return fader?.gain.value; }, get sources() { return sources.length; }, get playing() { return playing; } };
