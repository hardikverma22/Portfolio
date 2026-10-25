// Music for the town, one track for the day and one for the night. They loop forever without a seam,
// and when the sky changes (the switch, or pulling the sun or moon down) the two crossfade slowly.
//
// - Browsers only allow sound after the visitor does something, so it never starts on its own.
// - Each file is looped by crossfading every pass into the next (equal-power, a few seconds), so a cut
//   or a swell at either end is never heard. The night pad skips the swell at the very start of its file.
// - Day and night share their notes (F major and D minor), so the switch is a blend, not a key change.
//   It glides along an eased, equal-power curve and can be reversed halfway without a jump.
// - It fades in along an eased curve and out again on pause; below the hero it settles to about half,
//   at night a gentle low-pass warms it, and it fades out while the tab is hidden.
// - The level is measured live, so the balloon's radio, the top-bar bars and the hero's lights can move
//   with it (musicLevel()).

const TRACKS = {
  day: { src: 'audio/day-morning.mp3', skip: 0 },
  night: { src: 'audio/sustained-chord.mp3', skip: 0.6 },
};
const XF = 4;         // seconds each pass crossfades into the next
const SWITCH = 3.2;   // seconds for day ↔ night
const LEVEL = 0.38;   // full volume on the hero
const BELOW = 0.5;    // share of that once you scroll past the hero
const FADE_IN = 4, FADE_OUT = 1.2;

// volume stages: each track has its own gain (the day/night blend), `fader` carries the eased play/pause
// fades and `duck` the softer level below the hero (and silence while hidden), so nothing fights
let ac = null, master = null, fader = null, duck = null, filter = null, analyser = null, bins = null;
let fade = { from: 0, to: 0, at: 0, dur: 0 }; // the play/pause fade in progress
let playing = false, cur = null;
let hero = 1, visible = true, level = 0;
const listeners = new Set();
const T = {}; // per track: buf, loading, gain, glide, sources, nextAt, timer, started

const ease = (n, from, to) => { const c = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / (n - 1); c[i] = from + (to - from) * (0.5 - 0.5 * Math.cos(Math.PI * t)); } return c; };
// equal-power curves for the loop crossfade
const ramp = (n, up) => { const c = new Float32Array(n); for (let i = 0; i < n; i++) { const t = i / (n - 1); c[i] = up ? Math.sin(t * Math.PI / 2) : Math.cos(t * Math.PI / 2); } return c; };
const shaped = (t) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)));
const want = () => (/^(night|dusk)$/.test(document.documentElement.dataset.mode || '') ? 'night' : 'day');

function setup() {
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); fader = ac.createGain(); fader.gain.value = 0; duck = ac.createGain(); duck.gain.value = 1;
  master.connect(fader); fader.connect(duck);
  filter = ac.createBiquadFilter(); filter.type = 'lowpass'; filter.Q.value = 0.4;
  filter.frequency.value = want() === 'night' ? 3800 : 18000;
  analyser = ac.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.82;
  bins = new Uint8Array(analyser.frequencyBinCount);
  duck.connect(filter); filter.connect(analyser); analyser.connect(ac.destination);
  for (const name of Object.keys(TRACKS)) {
    const g = ac.createGain(); g.gain.value = 0; g.connect(master);
    T[name] = { buf: null, loading: null, gain: g, glide: { from: 0, to: 0, at: 0, dur: 0 }, sources: [], nextAt: 0, timer: 0, started: false };
  }
}
function load(name) {
  const t = T[name];
  if (t.buf) return Promise.resolve(t.buf);
  t.loading ??= fetch(TRACKS[name].src).then((r) => r.arrayBuffer()).then((a) => new Promise((ok, no) => ac.decodeAudioData(a, ok, no))).then((b) => (t.buf = b));
  return t.loading;
}

// one pass of a track, starting at `when`; it fades in over XF (except the very first) and out over its last XF
function pass(name, when, first) {
  const t = T[name], { skip } = TRACKS[name];
  const src = ac.createBufferSource(), g = ac.createGain();
  src.buffer = t.buf; src.connect(g); g.connect(t.gain);
  const from = first ? 0 : skip, len = t.buf.duration - from;
  if (first) g.gain.value = 1;
  else { g.gain.setValueAtTime(0, when); g.gain.setValueCurveAtTime(ramp(64, true), when, XF); }
  g.gain.setValueCurveAtTime(ramp(64, false), when + len - XF, XF);
  src.start(when, from); src.stop(when + len + 0.05);
  t.sources.push(src);
  src.onended = () => { t.sources = t.sources.filter((s) => s !== src); };
  t.nextAt = when + len - XF;
  // schedule the next pass a couple of seconds before it's due, for as long as this track is wanted
  clearTimeout(t.timer);
  t.timer = setTimeout(() => { if (playing && cur === name) pass(name, t.nextAt, false); }, Math.max(0, (t.nextAt - ac.currentTime - 2) * 1000));
}
function startTrack(name) {
  const t = T[name];
  if (t.sources.length) return;
  pass(name, ac.currentTime + 0.05, !t.started);
  t.started = true;
}
function stopTrack(name) {
  const t = T[name];
  clearTimeout(t.timer);
  t.sources.forEach((s) => { try { s.stop(); } catch { /* done */ } });
  t.sources = [];
}

// where a glide on a track's gain has got to right now
function glideLevel(t) {
  const g = t.glide;
  if (!g.dur) return g.to;
  const e = shaped((ac.currentTime - g.at) / g.dur);
  return g.from + (g.to - g.from) * (g.to > g.from ? Math.sin(e * Math.PI / 2) : 1 - Math.cos(e * Math.PI / 2));
}
// an eased, equal-power glide of a track's level from wherever it is now (so it can be reversed mid-way)
function glideTo(name, to, secs) {
  const t = T[name], p = t.gain.gain, now = ac.currentTime, from = glideLevel(t);
  p.cancelScheduledValues(0);
  p.setValueAtTime(from, now);
  if (!secs || Math.abs(to - from) < 0.002) { p.setValueAtTime(to, now); t.glide = { from: to, to, at: now, dur: 0 }; return; }
  const n = 96, c = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const e = shaped(i / (n - 1));
    c[i] = from + (to - from) * (to > from ? Math.sin(e * Math.PI / 2) : 1 - Math.cos(e * Math.PI / 2));
  }
  p.setValueCurveAtTime(c, now + 0.005, secs);
  t.glide = { from, to, at: now + 0.005, dur: secs };
}

// day ↔ night: the wanted track comes in as the other one goes, then the old one is stopped
let switchTimer = 0;
async function switchTo(name) {
  if (!ac || !playing || name === cur) { if (!playing) cur = name; return; }
  const old = cur;
  cur = name;
  await load(name);
  if (!playing || cur !== name) return;
  startTrack(name);
  glideTo(name, 1, SWITCH);
  if (old) glideTo(old, 0, SWITCH);
  clearTimeout(switchTimer);
  switchTimer = setTimeout(() => { if (old && cur !== old) stopTrack(old); }, SWITCH * 1000 + 150);
}

// the play/pause fade
function fadeLevel() {
  if (!fade.dur) return fade.to;
  return fade.from + (fade.to - fade.from) * shaped((ac.currentTime - fade.at) / fade.dur);
}
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
  const name = (cur = want());
  await load(name);
  if (!playing || cur !== name) return;
  startTrack(name);
  for (const n of Object.keys(TRACKS)) glideTo(n, n === name ? 1 : 0, 0);
  duck.gain.setValueAtTime(duckLevel(), ac.currentTime);
  fadeTo(LEVEL, FADE_IN);
  // fetch the other track in the background, so the first switch is instant
  setTimeout(() => { for (const n of Object.keys(TRACKS)) if (n !== name) load(n).catch(() => {}); }, 6000);
  try { localStorage.setItem('hv-music', 'on'); } catch { /* fine */ }
}
export function pause() {
  if (!playing) return;
  playing = false; emit();
  fadeTo(0, FADE_OUT);
  setTimeout(() => { if (!playing) { Object.keys(TRACKS).forEach(stopTrack); ac.suspend(); } }, FADE_OUT * 1000 + 100);
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
  // quieter below the hero, silent while the tab is hidden
  const town = document.getElementById('town');
  if (town) new IntersectionObserver(([e]) => { hero = e.intersectionRatio > 0.3 ? 1 : 0; if (ac) duckTo(2.2); }, { threshold: [0, 0.3, 0.6] }).observe(town);
  // the sky changes: the music follows it (dusk already counts as night, dawn as day), warmer at night
  new MutationObserver(() => {
    if (!ac) return;
    const name = want();
    filter.frequency.setTargetAtTime(name === 'night' ? 3800 : 18000, ac.currentTime, 1.2);
    switchTo(name);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (!ac || !playing) return;
    if (visible) {
      ac.resume();
      // timers are throttled in a hidden tab, so the next pass may not have been queued in time
      const t = T[cur];
      if (t?.buf && (!t.sources.length || t.nextAt < ac.currentTime)) pass(cur, ac.currentTime + 0.05, false);
      duckTo(1.5);
    } else duckTo(0.6);
  });
  requestAnimationFrame(meter);
}

// dev only: a handle for inspecting the audio graph from the console
if (import.meta.env.DEV) window.__music = { get ac() { return ac; }, get cur() { return cur; }, get playing() { return playing; }, levels: () => Object.fromEntries(Object.entries(T).map(([k, t]) => [k, +glideLevel(t).toFixed(3)])), sources: () => Object.fromEntries(Object.entries(T).map(([k, t]) => [k, t.sources.length])) };
