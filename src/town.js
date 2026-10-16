// Agent Town: the hero scene, drawn in code. Five SVG layers share one 1600×900 space so they can
// parallax and dolly independently. Colours come from CSS custom properties; on-call (night) mode is an
// attribute on <html>, and every light carries its own delay so the town switches on piece by piece.

const INK = 'var(--ink)';
const S = 'stroke="var(--ink)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
const s2 = (w) => `stroke="var(--ink)" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const rand = mulberry(7);
function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
import { markInner, spark } from './marks.js';
const f = (n) => n.toFixed(1);
const swing = (cx, cy, a, b, dur, begin = 0) => `<animateTransform attributeName="transform" type="rotate" values="${a} ${cx} ${cy};${b} ${cx} ${cy};${a} ${cx} ${cy}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>`;
const spinAt = (cx, cy, dur) => `<animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="${dur}s" repeatCount="indefinite"/>`;

// Window lights glow in on-call mode. Each gets a switch-on delay that grows from the street up,
// plus a little noise, so the town lights up the way a real one does.
const lights = [];
function windows(x, y, cols, rows, w, h, gx, gy, opts = {}) {
  let s = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const wx = x + c * (w + gx), wy = y + r * (h + gy);
    if (opts.skip && opts.skip.some(([sr, sc]) => sr === r && sc === c)) continue;
    s += `<rect x="${wx}" y="${wy}" width="${w}" height="${h}" rx="2" fill="var(--glass)" ${s2(2.5)}/>`;
    if (opts.sill) s += `<path d="M${wx - 3} ${wy - 4} h${w + 6} l-3 -5 h${-w}" fill="${opts.sill}" ${s2(2)}/>`;
    if (opts.glint && rand() > 0.5) s += `<path d="M${wx + 3} ${wy + h - 4} l${Math.min(w, h) * 0.45} ${-Math.min(w, h) * 0.45}" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
    if (rand() > 0.3) {
      const wd = ((700 - wy) / 520) * 1.4 + rand() * 0.7;
      const tv = rand() > 0.9 ? ' tv' : rand() > 0.82 ? ' flk' : '';
      lights.push(`<rect class="lit${tv}" style="--wd:${f(wd)}s;--d:${f(rand() * 9)}s" x="${wx + 1.5}" y="${wy + 1.5}" width="${w - 3}" height="${h - 3}" rx="1.5"/>`);
    }
  }
  return s;
}
const glow = (shape, wd) => lights.push(shape.includes('class="')
  ? shape.replace('class="', `style="--wd:${wd}s" class="lit `)
  : shape.replace(/^<(\w+)/, `<$1 class="lit" style="--wd:${wd}s"`));

/* ============================== sky ============================== */
function cloud(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><g fill="var(--cloud)" ${s2(2.5)}>
    <path d="M0 40 C-6 22 14 10 30 18 C36 0 66 -4 78 14 C92 2 120 10 118 32 C134 34 136 52 120 56 L6 56 C-8 54 -10 44 0 40 Z"/></g>
    <path d="M14 46 H104" stroke="var(--cloud-shade)" stroke-width="5" stroke-linecap="round" opacity=".6"/></g>`;
}
function sky() {
  let stars = '';
  for (let i = 0; i < 200; i++) {
    const big = rand() > 0.9;
    stars += big
      ? `<path class="st" style="--d:${f(rand() * 4)}s;--sd:${f(0.6 + rand() * 1.6)}s" transform="translate(${(rand() * 4800 - 1600) | 0} ${(rand() * 820 - 400) | 0})" d="M0 -6 L1.4 -1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4 -1.4 Z"/>`
      : `<circle class="st" style="--d:${f(rand() * 4)}s;--sd:${f(0.4 + rand() * 1.8)}s" cx="${(rand() * 4800 - 1600) | 0}" cy="${(rand() * 870 - 400) | 0}" r="${f(rand() * 1.6 + 0.6)}"/>`;
  }
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
  <defs>
    <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style="stop-color:var(--sky-1)"/><stop offset=".55" style="stop-color:var(--sky-2)"/><stop offset="1" style="stop-color:var(--sky-3)"/>
    </linearGradient>
    <radialGradient id="g-glow"><stop offset="0" style="stop-color:var(--sun-glow)" stop-opacity=".9"/><stop offset="1" style="stop-color:var(--sun-glow)" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-moon"><stop offset="0" stop-color="#fffbe6" stop-opacity=".85"/><stop offset=".35" stop-color="#fff2c4" stop-opacity=".35"/><stop offset="1" stop-color="#fff2c4" stop-opacity="0"/></radialGradient>
  </defs>
  <g class="stars" fill="#fff">${stars}</g>
  <g class="sun"><circle cx="1290" cy="170" r="190" fill="url(#g-glow)"/>
    <g class="sun-rays">${Array.from({ length: 12 }, (_, i) => `<path d="M1290 ${170 - 78} v-16" transform="rotate(${i * 30} 1290 170)" ${s2(4)} stroke="var(--sun-ray)"/>`).join('')}</g>
    <circle cx="1290" cy="170" r="62" fill="var(--sun)" ${S}/><path d="M1258 150 q14 -18 34 -16" fill="none" stroke="#fff6d0" stroke-width="5" stroke-linecap="round" opacity=".8"/></g>
  <g class="moon">
    <path d="M1320 118 A62 62 0 1 0 1340 222 A50 50 0 1 1 1320 118 Z" fill="#fffdf0" stroke="#fff3c4" stroke-width="3"/>
    <path d="M1300 124 A50 50 0 0 0 1306 214" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/><circle cx="1262" cy="168" r="6" fill="#e9dcb5"/><circle cx="1282" cy="200" r="4" fill="#e9dcb5"/><circle cx="1250" cy="196" r="3" fill="#e9dcb5"/></g>
  <g class="nightonly"><g class="plane"><path d="M-22 0 h40 l8 -3 l-8 -3 h-6 l-10 -10 h-6 l5 10 h-14 l-5 -5 h-4 l2 8 Z" fill="#3a3866"/>
    <circle class="nav-r" cx="-4" cy="-14" r="2.4" fill="#ff4d4d"/><circle class="nav-w" cx="-22" cy="-2" r="2" fill="#fff"/><circle class="nav-g" cx="2" cy="1" r="2" fill="#7dffb0"/></g></g>
  <g class="drift-a">${cloud(960, 60, 0.85)}${cloud(1440, 250, 1)}</g>
  <g class="drift-b">${cloud(1120, 330, 0.55)}</g>
</svg>`;
}

/* ============================== far ============================== */
function far() {
  let city = '', cityLights = '';
  const xs = [[-700, 130], [-640, 90], [-560, 170], [-380, 120], [-300, 150], [-160, 100], [1680, 140], [1740, 100], [1820, 180], [1990, 120], [2060, 150], [2240, 110], [600, 120], [650, 170], [700, 90], [745, 140], [880, 200], [930, 120], [1180, 160], [1230, 110], [1270, 210], [1450, 130], [1500, 180], [1550, 100], [60, 110], [100, 160], [330, 140]];
  for (const [x, h] of xs) {
    const w = 36 + ((x / 7) % 22);
    city += `<rect x="${x}" y="${640 - h}" width="${w}" height="${h + 40}" fill="var(--city-far)"/>`;
    for (let wy = 650 - h; wy < 620; wy += 14) for (let wx = x + 6; wx < x + w - 6; wx += 10) if (rand() > 0.72) cityLights += `<rect class="lit far-lit" style="--wd:${f(0.3 + rand() * 1.6)}s;--d:${f(rand() * 9)}s" x="${wx}" y="${wy}" width="4" height="5"/>`;
  }
  // a mobile tower on the hill, because every Bengaluru skyline has one
  const mast = `<g class="mast"><path d="M1530 560 L1544 470 L1558 560 M1534 534 h20 M1538 506 h12 M1531 548 L1554 520 M1557 548 L1534 520" fill="none" stroke="var(--city-far)" stroke-width="3"/></g>`;
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><g class="art">
  <g>${city}
    <g fill="var(--city-far)"><path d="M1370 640 V560 H1440 V640 Z M1378 560 V528 H1432 V560 Z M1386 528 V500 H1424 V528 Z M1394 500 V476 H1416 V500 Z M1400 476 l5 -16 l5 16 Z"/>
    <path d="M200 640 V552 Q240 500 280 552 V640 Z"/></g>
    <g fill="var(--city-far)"><path d="M520 640 Q522 560 530 520" stroke="var(--city-far)" stroke-width="6" fill="none"/><path d="M530 520 q-30 -4 -44 10 q24 -16 44 -10 q-20 -24 -42 -24 q28 -2 42 24 q8 -26 34 -30 q-24 12 -34 30 q30 -10 46 4 q-30 -8 -46 -4Z"/></g>
  </g>
  <defs><linearGradient id="g-haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--haze)" stop-opacity="0"/><stop offset="1" style="stop-color:var(--haze)" stop-opacity=".75"/></linearGradient></defs>
  <rect x="-1600" y="380" width="4800" height="280" fill="url(#g-haze)"/>
  <path d="M-1600 600 C-1200 570 -600 620 -300 596 C-150 584 -60 600 0 610 C180 560 360 600 520 590 C700 575 860 620 1040 596 C1220 570 1400 610 1600 580 C1900 560 2300 610 2700 590 C2900 580 3100 600 3200 596 L3200 1300 L-1600 1300 Z" fill="var(--hill-far)"/>
  ${mast}
  <rect x="-1600" y="520" width="4800" height="150" fill="url(#g-haze)" opacity=".55"/>
  <path d="M-1600 650 C-1100 630 -600 676 -200 656 C-80 650 -30 662 0 660 C220 630 420 668 640 650 C860 632 1080 676 1300 656 C1440 644 1520 650 1600 640 C2000 620 2500 670 3200 650 L3200 1300 L-1600 1300 Z" fill="var(--hill-near)"/>
  </g>
  <g class="lights">${cityLights}<circle class="lit mast-led" style="--wd:.4s" cx="1544" cy="468" r="4"/><circle class="lit" style="--wd:.9s" cx="1405" cy="458" r="3"/></g>
</svg>`;
}

/* ============================== mid ============================== */
function tree(x, y, s = 1, c = 'var(--leaf-1)') {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 V-34" ${s2(5)}/><circle cx="0" cy="-58" r="30" fill="${c}" ${S}/><circle cx="-18" cy="-44" r="18" fill="${c}" ${S}/><circle cx="18" cy="-46" r="20" fill="${c}" ${S}/><path d="M-8 -66 q8 -8 16 0" fill="none" stroke="var(--leaf-hi)" stroke-width="4" stroke-linecap="round"/></g>`;
}
function pigeon(x, y, flip, cls = '') {
  return `<g transform="translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}"><g class="pigeon ${cls}"><g class="pg-bob">
    <path d="M-12 -4 Q-14 -14 -2 -15 Q8 -16 10 -8 L8 -2 Q0 1 -12 -4 Z" fill="#a3a9be" ${s2(2)}/>
    <path d="M-10 -6 Q-2 -12 6 -7" fill="none" stroke="#7d84a0" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M-12 -5 l-7 2 l6 2 Z" fill="#7d84a0" ${s2(1.6)}/>
    <circle cx="9" cy="-17" r="5" fill="#a3a9be" ${s2(2)}/><path d="M5 -13 q4 3 8 0" fill="none" stroke="#6fbf9a" stroke-width="2.2"/>
    <path d="M13.5 -17.5 l4 1.2 l-4 1.2 Z" fill="#e9a24a" ${s2(1.2)}/><circle cx="10" cy="-18" r="1.1" fill="${INK}"/>
    <path d="M-2 -2 v4 M3 -2 v4" stroke="#e9785a" stroke-width="2" stroke-linecap="round"/></g></g></g>`;
}
function bot(cls, tint, carry = 'mail') {
  const carried = {
    mail: '<g transform="translate(12 -12) rotate(-8)"><rect x="0" y="-8" width="18" height="12" rx="1.5" fill="#fff" stroke="var(--ink)" stroke-width="2"/><path d="M0 -8 l9 7 l9 -7" fill="none" stroke="var(--ink)" stroke-width="1.6"/></g>',
    box: '<g transform="translate(10 -14)"><rect x="0" y="-10" width="18" height="16" rx="2" fill="#d9a066" stroke="var(--ink)" stroke-width="2"/><path d="M0 -3 h18 M9 -10 v16" stroke="#8a5a2b" stroke-width="1.6"/></g>',
    chai: '<g transform="translate(13 -14)"><path d="M0 -8 h9 l-1.5 10 h-6 Z" fill="#fff" stroke="var(--ink)" stroke-width="2"/><path class="steam" d="M3 -12 q-3 -4 0 -8 q3 -4 0 -8" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".8"/></g>',
    none: '',
  }[carry];
  return `<g class="${cls}"><g class="bot-bob">
    <path class="leg l1" d="M-6 0 v10" ${s2(4)}/><path class="leg l2" d="M6 0 v10" ${s2(4)}/>
    <rect x="-11" y="-16" width="22" height="18" rx="6" fill="${tint}" ${s2(2.5)}/>
    <rect x="-15" y="-42" width="30" height="24" rx="8" fill="#fff8e6" ${s2(2.5)}/>
    <rect x="-10" y="-37" width="20" height="13" rx="4" fill="${INK}"/><g class="blink"><circle cx="-4" cy="-30.5" r="2" fill="#7dffb0"/><circle cx="4" cy="-30.5" r="2" fill="#7dffb0"/></g>
    <path d="M0 -42 v-8" ${s2(2.5)}/><circle cx="0" cy="-52" r="3" fill="var(--rose)" ${s2(2)}/>
    ${carried}
  </g></g>`;
}

function tcs() {
  // an office, not a house: its lit windows are the apps shipped there, and the roof remembers the H&M stint in Stockholm
  const app = (x, y, c, k) => `<g><rect x="${x + 4}" y="${y + 4}" width="22" height="4" rx="1" fill="${c}"/>${k ? `<rect x="${x + 4}" y="${y + 11}" width="9" height="9" rx="1.5" fill="${c}" opacity=".55"/><path d="M${x + 16} ${y + 13} h10 M${x + 16} ${y + 18} h7" stroke="#8d88a6" stroke-width="1.8"/>` : `<path d="M${x + 4} ${y + 13} h22 M${x + 4} ${y + 18} h15" stroke="#8d88a6" stroke-width="1.8"/>`}</g>`;
  let wins = '';
  const apps = { '0,0': '#ef6a5b', '0,2': '#4f7cf0', '1,1': '#7cc4a8', '1,3': '#f2b134', '2,0': '#b9a6f2', '2,3': '#ef6a5b' };
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const x = 170 + c * 42, y = 572 + r * 34;
    if (r === 2 && (c === 1 || c === 2)) continue; // the entrance
    wins += `<rect x="${x}" y="${y}" width="30" height="24" rx="2" fill="var(--glass)" ${s2(2.5)}/>`;
    const a = apps[`${r},${c}`];
    if (a) wins += app(x, y, a, (r + c) % 2);
    lights.push(`<rect class="lit" style="--wd:${f(0.3 + r * 0.25 + c * 0.08)}s;--d:${f(c * 1.7)}s" x="${x + 1.5}" y="${y + 1.5}" width="27" height="21" rx="1.5"/>`);
  }
  const s = `<g class="bld" data-id="tcs">
    <path d="M186 528 V470" ${s2(3)}/><g class="flag"><path d="M186 472 q12 -5 22 0 t22 0 v16 q-11 -5 -22 0 t-22 0 Z" fill="#2e6fb7" ${s2(2.5)}/><path d="M198 471 v18 M187 480 q11 -4 21 0 t21 0" fill="none" stroke="#ffcd00" stroke-width="4"/></g>
    <path d="M292 528 V514 M330 528 V514" ${s2(3)}/>
    <rect x="280" y="488" width="62" height="28" rx="3" fill="#fff" ${S}/><text x="311" y="508" text-anchor="middle" class="sign hm-sign">H&amp;M</text>
    <rect x="156" y="526" width="188" height="12" fill="#d6cfe8" ${S}/>
    <rect x="160" y="536" width="180" height="164" fill="#eeeaf8" ${S}/>
    <rect x="160" y="536" width="180" height="26" fill="#2b2f45" ${S}/>
    <g transform="translate(184 549) scale(.75) translate(-12 -12)">${markInner('tcs')}</g><text x="258" y="555" text-anchor="middle" class="sign">TCS</text>
    ${wins}
    <rect x="214" y="644" width="72" height="56" fill="var(--glass)" ${S}/><path d="M250 644 v56" ${s2(2.5)}/><path d="M244 674 v8 M256 674 v8" ${s2(2.5)}/>
    <rect x="208" y="638" width="84" height="8" fill="#EE3984" ${s2(2.5)}/>
    ${[150, 350].map((x) => `<g transform="translate(${x} 700)"><path d="M-7 0 l2 -12 h10 l2 12 Z" fill="#c2593a" ${s2(2)}/><circle cx="0" cy="-20" r="10" fill="var(--leaf-2)" ${s2(2.5)}/></g>`).join('')}
  </g>`;
  glow(`<rect class="soft" x="214" y="644" width="72" height="56"/>`, 0.2);
  return s;
}
function fidelity() {
  // a platform, built from identical modules: one-off client work turned into reusable pieces, the next one on the crane
  const greens = ['#7cc4a8', '#69b597'];
  let mods = '';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    const x = 440 + c * 62, y = 556 + r * 36;
    if (r === 3 && c === 1) continue; // the door
    mods += `<rect x="${x}" y="${y}" width="62" height="36" fill="${greens[(r + c) % 2]}" ${s2(2.5)}/><rect x="${x + 8}" y="${y + 9}" width="46" height="14" rx="2" fill="var(--glass)" ${s2(2)}/><path d="M${x + 31} ${y + 9} v14" ${s2(1.6)}/>`;
    lights.push(`<rect class="lit" style="--wd:${f(0.35 + (3 - r) * 0.2 + c * 0.1)}s;--d:${f(r * 2.1 + c)}s" x="${x + 9.5}" y="${y + 10.5}" width="43" height="11" rx="1"/>`);
  }
  const s = `<g class="bld" data-id="fidelity">
    <path d="M612 556 V430" ${s2(4)}/>${Array.from({ length: 7 }, (_, i) => `<path d="M606 ${552 - i * 18} l12 -18 M618 ${552 - i * 18} l-12 -18" stroke="var(--ink)" stroke-width="1.8"/>`).join('')}
    <path d="M606 556 V430 M618 556 V430" ${s2(2.5)}/>
    <path d="M488 436 H650" ${s2(5)}/><path d="M488 436 H650" stroke="#ffd25e" stroke-width="2.5"/>
    <rect x="630" y="438" width="22" height="16" fill="#5d566f" ${s2(2)}/><path d="M612 430 L612 414 L650 436 M612 414 L500 436" fill="none" ${s2(1.6)}/>
    <rect x="598" y="440" width="28" height="18" rx="3" fill="#ffd25e" ${s2(2.5)}/>
    <g><path d="M530 436 V462" stroke="var(--ink)" stroke-width="1.8"/><path d="M522 462 h16 l-8 -8 Z" fill="#5d566f" ${s2(1.6)}/>
      <rect x="499" y="466" width="62" height="36" fill="#7cc4a8" ${s2(2.5)}/><rect x="507" y="475" width="46" height="14" rx="2" fill="var(--glass)" ${s2(2)}/><path d="M530 475 v14" ${s2(1.6)}/>
      ${swing(530, 436, -2.5, 2.5, 4)}</g>
    <rect x="432" y="548" width="202" height="10" fill="#e9f5ef" ${S}/>
    ${mods}
    <rect x="502" y="664" width="62" height="36" fill="#e9f5ef" ${s2(2.5)}/><rect x="514" y="670" width="38" height="30" fill="var(--glass)" ${s2(2.5)}/><path d="M533 670 v30" ${s2(2)}/>
    <path d="M462 548 V538 M560 548 V538" ${s2(3)}/><rect x="448" y="512" width="126" height="28" rx="4" fill="#fff" ${S}/><g transform="translate(464 526) scale(.8) translate(-12 -12)">${markInner('fidelity')}</g><text x="520" y="532" text-anchor="middle" class="sign fid-sign">Fidelity</text>
    <g transform="translate(652 700)"><rect x="-10" y="-12" width="20" height="12" fill="#c2593a" ${s2(2)}/><circle cx="0" cy="-22" r="12" fill="var(--leaf-2)" ${s2(2.5)}/></g>
  </g>`;
  glow(`<rect class="soft" x="514" y="670" width="38" height="30"/>`, 0.25);
  return s;
}
function lab() {
  const s = `<g class="bld" data-id="lab">
    <path d="M720 562 A110 110 0 0 1 940 562 Z" fill="#7fa8f7" ${S}/>
    <path d="M760 476 Q790 520 786 562 M900 476 Q870 520 874 562" fill="none" stroke="#6a95ee" stroke-width="3"/>
    <path d="M808 456 A110 110 0 0 1 852 456 L846 562 H814 Z" fill="#3f63cf" ${s2(2.5)}/>
    <path d="M814 470 h32 M816 494 h28 M818 518 h24 M818 542 h24" stroke="#3355b8" stroke-width="2"/>
    <path d="M742 508 Q830 486 918 508" fill="none" ${s2(2.5)}/>
    <rect x="706" y="560" width="248" height="140" fill="#eef3ff" ${S}/>
    <path d="M706 572 H954" stroke="#ffc220" stroke-width="5"/>
    <rect x="758" y="578" width="144" height="26" rx="4" fill="#0071dc" ${s2(2.5)}/><g transform="translate(772 591) scale(.62) translate(-12 -12)">${spark('#ffc220')}</g><text x="840" y="596" text-anchor="middle" class="sign">AGENT LAB</text>
    <defs><clipPath id="cp-door"><path d="M806 700 V650 A24 24 0 0 1 854 650 V700 Z"/></clipPath></defs>
    <path d="M806 700 V650 A24 24 0 0 1 854 650 V700 Z" fill="var(--door-glow)" ${S}/>
    <g clip-path="url(#cp-door)"><g class="peek"><rect x="816" y="668" width="28" height="22" rx="7" fill="#fff8e6" ${s2(2.5)}/><rect x="821" y="673" width="18" height="11" rx="3" fill="${INK}"/><circle cx="826" cy="678.5" r="2" fill="#7dffb0"/><circle cx="834" cy="678.5" r="2" fill="#7dffb0"/><rect x="818" y="690" width="24" height="20" rx="6" fill="#7cc4a8" ${s2(2.5)}/></g></g>
    <path d="M806 700 V650 A24 24 0 0 1 854 650 V700 Z" fill="none" ${S}/>
    <circle cx="746" cy="640" r="18" fill="var(--glass)" ${S}/><circle cx="914" cy="640" r="18" fill="var(--glass)" ${S}/>
    <circle cx="746" cy="640" r="23" fill="none" stroke="#b9c8ea" stroke-width="3"/><circle cx="914" cy="640" r="23" fill="none" stroke="#b9c8ea" stroke-width="3"/>
    <path d="M736 634 l8 -6 M904 634 l8 -6" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>
  </g>`;
  glow(`<path d="M806 700 V650 A24 24 0 0 1 854 650 V700 Z"/>`, 0.1);
  glow(`<circle class="soft" cx="746" cy="640" r="16"/>`, 0.5);
  glow(`<circle class="soft" cx="914" cy="640" r="16"/>`, 0.6);
  return s;
}
function tower() {
  const s = `<g class="bld" data-id="tower">
    <g><rect x="952" y="584" width="70" height="24" fill="#3f63cf" ${S}/>${[0, 1, 2].map((i) => `<rect x="${960 + i * 20}" y="590" width="14" height="12" rx="2" fill="var(--glass)" ${s2(2)}/>`).join('')}<path d="M952 608 H1022" stroke="#ffc220" stroke-width="4"/></g>
    <path d="M1048 226 V258 M1132 226 V258" ${s2(3)}/>
    <rect x="1026" y="212" width="128" height="34" rx="5" fill="#0071ce" ${S}/>
    <text x="1102" y="236" text-anchor="middle" class="sign wm-sign">Walmart</text><g transform="translate(1046 229) scale(.95) translate(-12 -12)">${spark('#ffc220')}</g>
    <rect x="1020" y="260" width="140" height="440" fill="#4f7cf0" ${S}/>
    <rect x="1014" y="258" width="152" height="10" fill="#3f63cf" ${s2(2.5)}/>
    <path d="M1090 270 V640" stroke="#3f63cf" stroke-width="6"/>
    <path d="M1024 270 V640 M1156 270 V640" stroke="#6f95ff" stroke-width="3" opacity=".7"/>
    ${windows(1034, 278, 2, 13, 20, 18, 12, 11, { glint: true })}${windows(1102, 278, 2, 13, 20, 18, 12, 11, { glint: true })}
    <rect x="1030" y="636" width="120" height="10" fill="#3f63cf" ${s2(2.5)}/>
    <rect x="1060" y="646" width="60" height="54" fill="var(--door-glow)" ${S}/>
    <g class="revolve"><path d="M1090 652 v48" ${s2(2.5)}/><path d="M1072 676 h36" ${s2(2.5)}/></g>
  </g>`;
  glow(`<rect x="1060" y="646" width="60" height="54"/>`, 0.1);
  return s;
}
function press() {
  const titles = 'LOOP ENGINEERING · AGENT GATEWAYS · FROM VECTORS TO TREES · THE GHOST LAYER · SANDBOX YOUR AGENT · ';
  const s = `<g class="bld" data-id="press">
    <rect x="1366" y="522" width="18" height="40" fill="#7a3324" ${S}/><rect x="1362" y="516" width="26" height="8" fill="#5a2418" ${s2(2.5)}/>
    <g class="puffs">${[0, 1, 2, 3].map((i) => `<circle class="puff smoke" style="--pd:${-i * 1.1}s" cx="1375" cy="510" r="8" fill="#e8e3ee"/>`).join('')}</g>
    <rect x="1242" y="532" width="112" height="30" rx="4" fill="#fff4e0" ${S}/><text x="1298" y="553" text-anchor="middle" class="sign sign-ink">THE PRESS</text>
    <rect x="1225" y="560" width="160" height="140" fill="#e2725b" ${S}/>
    <defs><clipPath id="cp-tick"><rect x="1234" y="568" width="142" height="18"/></clipPath></defs>
    <rect x="1232" y="566" width="146" height="22" rx="3" fill="#2a2234" ${s2(2.5)}/>
    <g clip-path="url(#cp-tick)"><g class="ticker"><text x="1380" y="582" class="tick-t">${titles}${titles}</text></g></g>
    <path d="M1218 600 H1392 L1380 626 H1230 Z" fill="#fff4e0" ${S}/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${1236 + i * 26} 600 h13 l-2 26 h-13 Z" fill="#e2725b"/>`).join('')}
    <path d="M1218 600 H1392 L1380 626 H1230 Z" fill="none" ${S}/>
    <rect x="1240" y="640" width="70" height="44" fill="var(--glass)" ${S}/>
    <g transform="rotate(-4 1275 662)"><rect x="1252" y="646" width="46" height="34" rx="1.5" fill="#fffdf6" ${s2(2)}/><path d="M1256 652 h38" stroke="${INK}" stroke-width="3.2"/><rect x="1256" y="657" width="16" height="12" fill="#c9c3d6"/><path d="M1276 658 h18 M1276 663 h18 M1276 668 h14 M1256 674 h38" stroke="${INK}" stroke-width="1.5" opacity=".55"/></g>
    <rect x="1324" y="640" width="44" height="60" fill="#7a3324" ${S}/><circle cx="1360" cy="672" r="2.2" fill="#ffd25e"/>
    <g transform="translate(1270 692)"><rect x="-22" y="-6" width="34" height="8" fill="#fff" ${s2(2)}/><rect x="-18" y="-14" width="34" height="8" fill="#f2efe8" ${s2(2)}/></g>
  </g>`;
  glow(`<rect class="soft" x="1240" y="640" width="70" height="44"/>`, 0.35);
  return s;
}
function home() {
  const s = `<g class="bld" data-id="home">
    <path d="M1520 278 Q1586 430 1555 576" fill="none" stroke="var(--ink)" stroke-width="1.3"/>
    <g transform="translate(1520 200)"><g>
      <path d="M0 0 L26 34 L0 78 L-26 34 Z" fill="var(--rose)" ${S}/><path d="M0 0 V78 M-26 34 H26" ${s2(2)}/><path d="M0 0 L26 34 L0 34 Z" fill="#ffd25e" opacity=".9"/>
      <path d="M0 78 C10 96 -10 110 4 128 C14 142 -4 152 6 166" fill="none" ${s2(2)}/>
      <path d="M2 100 l9 -5 l-2 10 Z M3 144 l-9 -5 l2 10 Z" fill="var(--sun)" ${s2(1.8)}/>
      ${swing(0, 34, -6, 7, 5)}</g></g>
    <path d="M1424 612 L1495 560 L1566 612 Z" fill="#c2593a" ${S}/><path d="M1446 596 L1495 560 L1544 596" fill="none" stroke="#e07a52" stroke-width="3"/>
    <rect x="1536" y="560" width="14" height="30" fill="#9a3f2a" ${s2(2.5)}/>
    <g transform="translate(1546 600)"><g class="flier">${bot('', '#ffd25e', 'none')}<path d="M10 -12 L9 -24" ${s2(3)}/></g></g>
    <rect x="1432" y="610" width="126" height="90" fill="#fff4e0" ${S}/>
    <path d="M1432 622 H1558" stroke="#f2d9b8" stroke-width="3"/>
    <rect x="1444" y="632" width="52" height="38" rx="2" fill="var(--glass)" ${S}/><path d="M1470 632 v38 M1444 651 h52" stroke="${INK}" stroke-width="2"/>
    <g transform="translate(1458 666)"><path d="M0 0 l4 -12 l8 -2" fill="none" ${s2(2)}/><path d="M10 -18 l8 2 l-3 6 Z" fill="#ffd25e" ${s2(1.6)}/><rect x="-6" y="0" width="12" height="3" fill="${INK}"/></g>
    <rect x="1508" y="642" width="34" height="58" fill="#5a7bd8" ${S}/><circle cx="1536" cy="672" r="2.2" fill="#ffd25e"/>
    <rect x="1440" y="672" width="60" height="8" rx="2" fill="#c9935a" ${s2(2)}/><circle cx="1452" cy="668" r="5" fill="var(--leaf-1)" ${s2(1.8)}/><circle cx="1488" cy="667" r="6" fill="#ef6a5b" ${s2(1.8)}/>
  </g>`;
  glow(`<rect class="soft" x="1444" y="632" width="52" height="38" rx="2"/>`, 0.2);
  return s;
}
function mid() {
  lights.length = 0;
  const trees = tree(1408, 700, 0.6);
  const body = trees + tcs() + fidelity() + lab() + tower() + press() + home();
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><g class="art">
  <defs><radialGradient id="g-sunwash" cx="1290" cy="170" r="1100" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff6d6" stop-opacity=".55"/><stop offset=".6" stop-color="#fff6d6" stop-opacity="0"/></radialGradient></defs>
  <rect x="-1600" y="696" width="4800" height="30" fill="var(--hill-near)"/>
  <g class="contact-shadows"><ellipse cx="250" cy="702" rx="120" ry="7" fill="#1d1745" opacity=".16"/><ellipse cx="530" cy="702" rx="140" ry="7" fill="#1d1745" opacity=".16"/><ellipse cx="830" cy="702" rx="140" ry="7" fill="#1d1745" opacity=".16"/><ellipse cx="1090" cy="702" rx="90" ry="7" fill="#1d1745" opacity=".16"/><ellipse cx="1305" cy="702" rx="95" ry="7" fill="#1d1745" opacity=".16"/><ellipse cx="1495" cy="702" rx="80" ry="7" fill="#1d1745" opacity=".16"/></g>
  ${body}
  <g class="side-shade" style="mix-blend-mode:multiply"><rect x="161" y="563" width="30" height="136" fill="#1d1745" opacity=".11"/><rect x="441" y="557" width="22" height="142" fill="#1d1745" opacity=".11"/><rect x="707" y="573" width="40" height="126" fill="#1d1745" opacity=".11"/><rect x="1021" y="268" width="26" height="368" fill="#1d1745" opacity=".11"/><rect x="1045" y="213" width="16" height="48" fill="#1d1745" opacity=".11"/><rect x="1226" y="561" width="28" height="138" fill="#1d1745" opacity=".11"/><rect x="1433" y="623" width="22" height="76" fill="#1d1745" opacity=".11"/></g>
  <rect class="dayonly sunwash" x="-1600" y="-400" width="4800" height="1100" fill="url(#g-sunwash)" style="mix-blend-mode:soft-light"/>
  </g>
  <g class="lights">
    <defs><linearGradient id="g-beam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff6cf" stop-opacity="1"/><stop offset=".55" stop-color="#fff6cf" stop-opacity=".35"/><stop offset="1" stop-color="#fff6cf" stop-opacity="0"/></linearGradient></defs>
    <rect class="lit sign-lit" style="--wd:.8s" x="1244" y="534" width="108" height="26" rx="3"/><text class="lit lit-text" style="--wd:.8s" x="1298" y="553" text-anchor="middle">THE PRESS</text>
    <text class="lit lit-agent" style="--wd:.3s" x="840" y="596" text-anchor="middle">AGENT LAB</text>
    <g class="lit wm-lit" style="--wd:.15s"><text x="1102" y="236" text-anchor="middle" class="wm-sign">Walmart</text><g transform="translate(1046 229) scale(.95) translate(-12 -12)">${spark('#ffc220')}</g></g>
    ${[[1426, 611], [1438, 602], [1450, 593], [1462, 584], [1474, 575], [1486, 566], [1504, 566], [1516, 575], [1528, 584], [1540, 593], [1552, 602], [1564, 611]].map(([x, y], i) => `<circle class="lit fairy" style="--wd:${(1 + i * 0.06).toFixed(2)}s;--fc:${['#ffd66b', '#ff8ab8', '#7dffb0', '#9fd0ff'][i % 4]};--fd:${(i * 0.23).toFixed(2)}s" cx="${x}" cy="${y + 3}" r="3"/>`).join('')}
    ${lights.join('')}
  </g>
</svg>`;
}

/* ============================== street ============================== */
function chaiCart() {
  // sits on the pavement in the gap between Fidelity and the lab, out of the errand bot's way
  return `<g transform="translate(672 712)">
    <path d="M-40 -64 V-30 M40 -64 V-30" ${s2(3)}/>
    <g transform="translate(-6 -30)">
      <rect x="-10" y="-14" width="20" height="16" rx="5" fill="#f4f1ea" ${s2(2.2)}/>
      <circle cx="0" cy="-22" r="8" fill="#a0643c" ${s2(2.2)}/><path d="M-8 -26 q8 -9 16 0 Z" fill="#2a2638"/><path d="M-4 -19 q4 2 8 0" fill="none" stroke="#2a2638" stroke-width="2" stroke-linecap="round"/><circle cx="3" cy="-23" r="1.1" fill="${INK}"/>
      <g><path d="M8 -8 L20 -16" ${s2(2.6)}/><g transform="translate(20 -16)"><path d="M-6 0 q0 -10 6 -10 q6 0 6 10 Z" fill="#c9c3d6" ${s2(2)}/><path d="M6 -6 l7 4" ${s2(2.4)}/></g>${swing(8, -8, -4, -22, 3.2)}</g>
    </g>
    <path d="M-46 -64 h92 l-7 -16 h-78 Z" fill="#ef6a5b" ${s2(2.5)}/>${[0, 1, 2, 3].map((i) => `<path d="M${-38 + i * 20} -80 h10 l2 16 h-10 Z" fill="#fff4e0"/>`).join('')}<path d="M-46 -64 h92 l-7 -16 h-78 Z" fill="none" ${s2(2.5)}/>
    <rect x="-44" y="-32" width="88" height="26" rx="3" fill="#2a9d8f" ${S}/><text x="0" y="-15" text-anchor="middle" class="sign sign-s">CHAI ₹10</text>
    <g transform="translate(26 -36)">${[0, 1, 2].map((i) => `<path d="M${i * 6} 0 h4.5 l-1 6 h-2.5 Z" fill="#fff" ${s2(1.3)}/>`).join('')}
      <g class="puffs">${[0, 1].map((i) => `<circle class="puff steam-p" style="--pd:${-i * 1}s" cx="6" cy="-4" r="3" fill="#fff"/>`).join('')}</g></g>
    <circle cx="-26" cy="-2" r="8" fill="#2a2638" ${s2(2.5)}/><circle cx="26" cy="-2" r="8" fill="#2a2638" ${s2(2.5)}/>
  </g>`;
}

export function autoRickshaw() {
  return `<defs><linearGradient id="g-hl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff4cc" stop-opacity=".9"/><stop offset=".45" stop-color="#fff4cc" stop-opacity=".35"/><stop offset="1" stop-color="#fff4cc" stop-opacity="0"/></linearGradient></defs><g class="auto"><g class="auto-bob">
    <path d="M-62 -30 V-54 Q-62 -64 -50 -64 H20 Q38 -64 46 -44 L52 -30 Z" fill="#2a2638" ${S}/>
    <path d="M-54 -32 V-54 H-8 V-32 Z" fill="#3d3852"/>
    <g transform="translate(-30 -32)"><rect x="-8" y="-9" width="16" height="10" rx="3" fill="var(--rose)" ${s2(2)}/><circle cx="0" cy="-15" r="6" fill="#8a5a3a" ${s2(2)}/><path d="M-7 -17 q7 -9 14 0 Z" fill="#2a2638"/><path d="M5 -18 h6" stroke="#2a2638" stroke-width="2.4" stroke-linecap="round"/><path d="M-3 -14 h6" stroke="#2a2638" stroke-width="1.4" opacity=".7"/></g>
    <path d="M4 -58 H22 Q34 -56 40 -34 H4 Z" fill="var(--glass)" ${s2(2.5)}/>
    <g transform="translate(15 -32)"><rect x="-7" y="-8" width="14" height="9" rx="3" fill="#7cc4a8" ${s2(2)}/><rect x="-8" y="-21" width="16" height="13" rx="4" fill="#fff8e6" ${s2(2)}/><rect x="-5.5" y="-18" width="11" height="6" rx="2" fill="${INK}"/><circle cx="-2" cy="-15" r="1.2" fill="#7dffb0"/><circle cx="2.5" cy="-15" r="1.2" fill="#7dffb0"/><path d="M0 -21 v-4" ${s2(1.6)}/><circle cx="0" cy="-26" r="1.8" fill="var(--rose)"/><path d="M6 -4 l10 -2" ${s2(2.2)}/></g>
    <path d="M-66 -32 H56 Q70 -30 70 -16 V-14 H-66 Z" fill="#ffd23f" ${S}/>
    <path d="M-66 -14 H70 V-6 Q70 2 62 2 H-58 Q-66 2 -66 -6 Z" fill="#1f8a4c" ${S}/>
    <circle cx="64" cy="-22" r="4" fill="#fff3c4" ${s2(2)}/>
    <g transform="translate(-40 2)"><g class="wheel"><circle r="12" fill="#2a2638" ${S}/><circle r="4" fill="#bdb6cc"/></g></g>
    <g transform="translate(48 2)"><g class="wheel"><circle r="11" fill="#2a2638" ${S}/><circle r="4" fill="#bdb6cc"/></g></g>
    <ellipse class="hl hl-pool" cx="104" cy="2" rx="34" ry="5"/><path class="hl" d="M68 -22 L130 -33 Q136 -22 130 -9 Z"/>
  </g></g>`;
}
function scooter() {
  return `<g class="scooter"><g class="auto-bob">
    <rect x="-42" y="-50" width="24" height="22" rx="3" fill="#ef8a3a" ${s2(2.5)}/><path d="M-42 -40 h24" stroke="#c96a22" stroke-width="2"/>
    <path d="M-34 -8 Q-34 -26 -12 -26 H10 L26 -8 Z" fill="var(--skyc)" ${S}/>
    <path d="M22 -10 L16 -44 h-8" fill="none" ${s2(3.5)}/>
    <path d="M-14 -26 L-4 -46 L8 -44" fill="none" stroke="#4f7cf0" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M-14 -26 L-4 -46 L8 -44" fill="none" ${s2(2)}/>
    <path d="M-12 -28 L4 -28 L10 -14" fill="none" stroke="#2a2638" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="-2" cy="-56" r="9" fill="var(--rose)" ${s2(2.5)}/><path d="M1 -60 h8 v6 h-6" fill="#2a2638"/>
    <g transform="translate(-22 0)"><g class="wheel"><circle r="9" fill="#2a2638" ${s2(2.5)}/><circle r="3" fill="#bdb6cc"/></g></g>
    <g transform="translate(22 0)"><g class="wheel"><circle r="9" fill="#2a2638" ${s2(2.5)}/><circle r="3" fill="#bdb6cc"/></g></g>
    <circle cx="20" cy="-40" r="3.5" fill="#fff3c4" ${s2(1.5)}/><ellipse class="hl hl-pool" cx="72" cy="0" rx="28" ry="4"/><path class="hl" d="M22 -40 L78 -50 Q84 -38 78 -26 Z"/>
    <circle class="tail" cx="-40" cy="-30" r="2.6" fill="#ff4d4d"/>
  </g></g>`;
}
const LAMPS = [372, 1180, 1588];
function street() {
  const poles = LAMPS.map((x) => `<g><path d="M${x} 712 V606 q0 -10 12 -10 h10" fill="none" ${s2(4)}/><path d="M${x - 6} 612 h12" ${s2(3)}/><path d="M${x + 16} 594 h20 l-4 10 h-12 Z" fill="#3b3750" ${s2(2.5)}/><circle class="bulb-day" cx="${x + 26}" cy="606" r="4" fill="#fff3c4" ${s2(1.5)}/></g>`).join('');
  let wires = '';
  for (let i = 0; i < LAMPS.length - 1; i++) {
    const a = LAMPS[i], b = LAMPS[i + 1], m = (a + b) / 2;
    wires += `<path d="M${a} 612 Q${m} 648 ${b} 612" fill="none" stroke="var(--ink)" stroke-width="1.6"/><path d="M${a} 618 Q${m} 662 ${b} 618" fill="none" stroke="var(--ink)" stroke-width="1.2" opacity=".7"/>`;
  }
  const wireY = (a, b, x) => { const t = (x - a) / (b - a); return (1 - t) ** 2 * 612 + 2 * (1 - t) * t * 648 + t ** 2 * 612; };
  const cones = LAMPS.map((x, i) => `<g class="lamp" style="--ld:${f(0.25 + i * 0.22)}s"><path class="cone" d="M${x + 20} 604 h12 L${x + 74} 716 H${x - 22} Z"/><ellipse class="pool" cx="${x + 26}" cy="712" rx="52" ry="7"/><circle class="bulb" cx="${x + 26}" cy="606" r="5"/></g>`).join('');
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><g class="art">
  <rect x="-1600" y="700" width="4800" height="20" fill="var(--pavement)" ${S}/>
  <path d="M-1600 708 H3200" stroke="var(--pavement-line)" stroke-width="2" stroke-dasharray="40 14"/>
  <rect x="-1600" y="720" width="4800" height="96" fill="var(--road)" ${S}/>
  <rect x="-1600" y="816" width="4800" height="400" fill="var(--leaf-2)"/>
  <path d="M-1600 768 H3200" stroke="var(--lane)" stroke-width="5" stroke-dasharray="44 34"/>
  <defs><linearGradient id="g-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".95"/><stop offset=".6" stop-color="#ffe9a8" stop-opacity=".35"/><stop offset="1" stop-color="#ffe9a8" stop-opacity=".08"/></linearGradient></defs>
  ${poles}
  ${chaiCart()}
  <g fill="var(--lane)" opacity=".8">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="1398" y="${727 + i * 14}" width="58" height="8" rx="1"/>`).join('')}</g>
  <g transform="translate(0 764)">${scooter()}</g>
  <g transform="translate(0 810)">${autoRickshaw()}</g>
  </g>
  <g class="lights">${cones}${Array.from({ length: 9 }, (_, i) => `<circle class="lit fairy" style="--wd:${(0.9 + i * 0.05).toFixed(2)}s;--fc:${['#ffd66b', '#ff8ab8', '#7dffb0'][i % 3]};--fd:${(i * 0.3).toFixed(2)}s" cx="${632 + i * 10}" cy="${650 + Math.sin(i / 8 * Math.PI) * 5}" r="2.6"/>`).join('')}</g>
</svg>`;
}

/* ============================== foreground ============================== */
function fg() {
  let crown = '';
  const blobs = [[60, 580, 70], [-20, 630, 58], [140, 640, 52], [30, 500, 52], [120, 520, 44], [-50, 540, 44], [170, 590, 36]];
  for (const [x, y, r] of blobs) crown += `<circle cx="${x}" cy="${y}" r="${r}" fill="var(--bloom)" ${S}/>`;
  let dots = '';
  for (let i = 0; i < 46; i++) { const a = rand() * Math.PI * 2, d = rand() * 120; dots += `<circle cx="${f(60 + Math.cos(a) * d * 1.1)}" cy="${f(580 + Math.sin(a) * d * 0.7)}" r="${f(rand() * 4 + 3)}" fill="var(--bloom-hi)"/>`; }
  let petals = '';
  for (let i = 0; i < 12; i++) petals += `<path class="petal" style="--x:${(rand() * 260 + 20) | 0}px;--d:${f(rand() * 8)}s;--t:${f(7 + rand() * 5)}s" d="M0 0 q6 -6 10 0 q-4 6 -10 0 Z" fill="var(--bloom)"/>`;
  let grass = 'M-1600 1300 V836';
  for (let x = -1600; x <= 3200; x += 40) grass += ` Q${x + 20} ${818 + (x % 120 === 0 ? -6 : 6)} ${x + 40} 836`;
  grass += ' V1300 Z';
  let blades = '';
  for (let i = 0; i < 70; i++) { const x = rand() * 1600, h = 8 + rand() * 12; blades += `<path class="blade" style="--bd:${f(-rand() * 3)}s" d="M${f(x)} 842 q${f(rand() * 6 - 3)} ${f(-h / 2)} ${f(rand() * 8 - 4)} ${f(-h)}" stroke="var(--leaf-1)" stroke-width="2.5" stroke-linecap="round" fill="none"/>`; }
  let flowers = '';
  for (let i = 0; i < 26; i++) { const x = 340 + rand() * 1240, y = 852 + rand() * 30; flowers += `<g transform="translate(${x | 0} ${y | 0})"><g class="flower" style="--fd:${f(-rand() * 4)}s"><path d="M0 0 v10" stroke="var(--leaf-2)" stroke-width="2"/><circle r="4.5" fill="${['#fff', 'var(--sun)', 'var(--rose)'][i % 3]}" ${s2(1.5)}/><circle r="1.6" fill="${INK}" opacity=".6"/></g></g>`; }
  let flies = '';
  for (let i = 0; i < 18; i++) flies += `<circle class="firefly" style="--fx:${f(rand() * 60 - 30)}px;--fy:${f(rand() * 40 - 20)}px;--fd:${f(-rand() * 6)}s;--ft:${f(4 + rand() * 4)}s;--wd:${f(0.6 + rand() * 1.4)}s" cx="${f(i < 10 ? rand() * 320 : 1380 + rand() * 220)}" cy="${f(i < 10 ? 520 + rand() * 200 : 760 + rand() * 90)}" r="${f(2 + rand() * 1.5)}"/>`;
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><g class="art">
  <g transform="translate(-120 0)">
  <path d="M40 900 C46 820 32 760 70 650 M60 730 C30 700 0 690 -20 660 M70 700 C110 670 130 660 160 640" fill="none" stroke="var(--ink)" stroke-width="22" stroke-linecap="round"/>
  <path d="M40 900 C46 820 32 760 70 650 M60 730 C30 700 0 690 -20 660 M70 700 C110 670 130 660 160 640" fill="none" stroke="var(--bark)" stroke-width="15" stroke-linecap="round"/>
  <path d="M36 880 q6 -30 0 -60 M52 800 q4 -20 0 -40" fill="none" stroke="#5e3a20" stroke-width="3" stroke-linecap="round"/>
  <g class="crown">${crown}${dots}</g></g>
  <path d="${grass}" fill="var(--leaf-2)" ${S}/>
  ${blades}${flowers}
  <g transform="translate(1500 900)"><circle cx="-40" cy="-60" r="60" fill="var(--leaf-1)" ${S}/><circle cx="40" cy="-80" r="70" fill="var(--leaf-2)" ${S}/><circle cx="110" cy="-50" r="60" fill="var(--leaf-1)" ${S}/>
    <circle cx="-30" cy="-90" r="5" fill="var(--rose)" ${s2(1.5)}/><circle cx="20" cy="-120" r="5" fill="#fff" ${s2(1.5)}/><circle cx="70" cy="-100" r="5" fill="var(--sun)" ${s2(1.5)}/></g>
  <g class="signpost" transform="translate(330 900)"><path d="M0 0 V-118" ${s2(7)}/><path d="M0 0 V-118" stroke="var(--bark)" stroke-width="3"/>
    <path d="M-6 -116 H96 l14 14 l-14 14 H-6 Z" fill="#fff4e0" ${S}/><text x="44" y="-96" text-anchor="middle" class="sign sign-ink">AGENT TOWN</text>
    <path d="M6 -78 H-80 l-12 12 l12 12 H6 Z" fill="var(--sun)" ${S}/><text x="-40" y="-60" text-anchor="middle" class="sign sign-ink">EST. 2016</text></g>
  </g>
  <g class="lights">${flies}</g>
</svg>`;
}

export function townMarkup() {
  return { sky: sky(), far: far(), mid: mid(), street: street(), fg: fg() };
}

// The little companion bot that sits in the corner and talks.
export function buddySvg() {
  return `<svg viewBox="-40 -80 80 96" aria-hidden="true">
    <ellipse cx="0" cy="12" rx="24" ry="4" fill="rgba(0,0,0,.18)"/>
    <g class="bd-body">
    <path d="M-8 0 v10 M8 0 v10" ${s2(5)}/>
    <rect x="-16" y="-22" width="32" height="24" rx="8" fill="var(--rose)" ${S}/>
    <path class="bd-arm" d="M16 -14 q14 -6 16 -22" fill="none" ${s2(4)}/>
    <rect x="-22" y="-62" width="44" height="36" rx="11" fill="#fff8e6" ${S}/>
    <rect x="-16" y="-56" width="32" height="22" rx="6" fill="${INK}"/>
    <g class="bd-eyes"><g class="blink"><circle cx="-6" cy="-45" r="3.2" fill="#7dffb0"/><circle cx="6" cy="-45" r="3.2" fill="#7dffb0"/></g></g>
    <path d="M0 -62 v-10" ${s2(3)}/><circle class="beacon" cx="0" cy="-74" r="4.5" fill="var(--sun)" ${s2(2)}/>
    </g></svg>`;
}

// Skylines for the journey section, one per city. 600×240, ground at y=240.
const SK = 'stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"';
export const skylines = {
  Chennai: `<svg viewBox="0 0 600 240" aria-hidden="true">
    <g fill="#e8c27a" ${SK}><path d="M120 240 V130 H200 V240 Z"/><path d="M126 130 V108 H194 V130 Z" fill="#e07a52"/><path d="M132 108 V88 H188 V108 Z" fill="#7cc4a8"/><path d="M138 88 V70 H182 V88 Z" fill="#f2b134"/><path d="M144 70 V54 H176 V70 Z" fill="#ef6a5b"/><path d="M148 54 Q160 34 172 54 Z" fill="#f2b134"/></g>
    <g stroke="var(--ink)" stroke-width="1.6">${[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((c) => `<rect x="${130 + c * 13}" y="${140 + r * 22}" width="6" height="10" fill="#c98f4a"/>`).join('')).join('')}</g>
    <path d="M150 240 V214 Q160 200 170 214 V240 Z" fill="#7a4a2a" ${SK}/>
    <g ${SK}><path d="M420 240 L428 90 H452 L460 240 Z" fill="#fff"/><path d="M425 150 H455 M424 190 H457" stroke="#ef6a5b" stroke-width="12"/><path d="M422 92 H458 V78 H422 Z" fill="#2f2d3b"/><path d="M428 78 V64 H452 V78" fill="#ffe9a8"/><path d="M426 64 L440 52 L454 64 Z" fill="#ef6a5b"/></g>
    ${[40, 260, 330, 540].map((x, i) => `<g transform="translate(${x} 240)"><path d="M0 0 Q4 -50 -2 -96" fill="none" stroke="#7a4a2a" stroke-width="6" stroke-linecap="round"/><path d="M-2 -96 q-30 -2 -42 14 q22 -14 42 -14 q-18 -24 -40 -22 q26 2 40 22 q10 -24 34 -26 q-22 10 -34 26 q30 -6 44 10 q-28 -8 -44 -10Z" fill="var(--leaf-2)" ${SK}/></g>`).join('')}
    <path d="M220 240 V196 H300 V240 Z M310 240 V176 H370 V240 Z" fill="var(--city-far)"/>
  </svg>`,
  Stockholm: `<svg viewBox="0 0 600 240" aria-hidden="true">
    <g ${SK}>${[['#e2a33b', 60], ['#c2593a', 104], ['#f2d27a', 148], ['#7a9e6f', 192], ['#e07a52', 236], ['#f4e7d3', 280], ['#b0473a', 324]].map(([c, x], i) => {
      const h = 110 + ((i * 37) % 50);
      return `<path d="M${x} 228 V${228 - h} l22 -22 l22 22 V228 Z" fill="${c}"/>` + [0, 1, 2].map((r) => `<rect x="${x + 8}" y="${228 - h + 14 + r * 30}" width="10" height="16" fill="var(--glass)" stroke="var(--ink)" stroke-width="1.6"/><rect x="${x + 26}" y="${228 - h + 14 + r * 30}" width="10" height="16" fill="var(--glass)" stroke="var(--ink)" stroke-width="1.6"/>`).join('');
    }).join('')}
    <path d="M420 228 V120 H470 V228 Z" fill="#b0473a"/><path d="M426 120 L445 20 L464 120 Z" fill="#3b3750"/><path d="M432 92 h26 M436 70 h18 M439 50 h12" stroke="#8a84a0" stroke-width="2"/><path d="M445 20 v-12" /></g>
    <rect x="0" y="226" width="600" height="14" fill="#7fb2d8"/><path d="M0 232 q20 -4 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/>
    <g transform="translate(510 226)"><path d="M-30 0 h60 l-8 10 h-44 Z" fill="#fff4e0" ${SK}/><path d="M-6 0 v-26 l20 22 Z" fill="#fff" ${SK}/></g>
  </svg>`,
  Bengaluru: `<svg viewBox="0 0 600 240" aria-hidden="true">
    <g ${SK}><path d="M60 240 V60 H120 V240 Z" fill="#9fc3ea"/><path d="M130 240 V96 H180 V240 Z" fill="#b5d3f2"/><path d="M470 240 V40 H530 V240 Z" fill="#9fc3ea"/><path d="M540 240 V110 H580 V240 Z" fill="#b5d3f2"/></g>
    <g stroke="#7aa2d0" stroke-width="2">${[60, 130, 470, 540].map((x) => Array.from({ length: 8 }, (_, r) => `<path d="M${x + 4} ${70 + r * 22} h${x === 60 || x === 470 ? 52 : 42}"/>`).join('')).join('')}</g>
    <g ${SK}><path d="M210 240 V170 H390 V240 Z" fill="#efe3c8"/><path d="M200 170 H400 V158 H200 Z" fill="#e2d1b0"/><path d="M250 158 V128 H350 V158 Z" fill="#efe3c8"/><path d="M262 128 A38 38 0 0 1 338 128 Z" fill="#e8d6a8"/><path d="M300 90 v-14" /><circle cx="300" cy="74" r="4" fill="#f2b134"/></g>
    <g stroke="var(--ink)" stroke-width="1.8">${Array.from({ length: 9 }, (_, i) => `<rect x="${222 + i * 19}" y="180" width="8" height="44" fill="#fff8e6"/>`).join('')}</g>
    <rect x="0" y="198" width="600" height="10" fill="#8a84a0" ${SK}/>${[30, 200, 420, 580].map((x) => `<rect x="${x}" y="208" width="10" height="32" fill="#8a84a0" ${SK}/>`).join('')}
    <g class="metro"><rect x="0" y="180" width="150" height="18" rx="6" fill="#8b4fc4" ${SK}/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${10 + i * 27}" y="184" width="16" height="8" rx="2" fill="var(--glass)" stroke="var(--ink)" stroke-width="1.4"/>`).join('')}</g>
  </svg>`,
};
