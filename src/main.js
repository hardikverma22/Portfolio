import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  impact, caseStudies, skillsBuilt, engineering, principles, commits, lanes,
  projects, writing, testimonials, awards, certs, identity, toolbox, toolboxGroups, toolboxWhere, toolboxMeta,
} from './data.js';
import { initMimo } from './mimo.js';
import { initFluid } from './fluid.js';
import { mountTriage, mountDelegate, mountTokens } from './demos.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rnd = (n) => { const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let s = ''; for (let i = 0; i < n; i++) s += c[(Math.random() * c.length) | 0]; return s; };

/* =========================================================
   TRACE, every section is a sub-agent; the ticker shows its spans
   ========================================================= */
const traceEl = $('#trace');
const traceList = $('#trace-list');
let spans = 0;
function trace(agent, msg, ok) {
  const t = new Date();
  const li = document.createElement('li');
  li.innerHTML = `<span class="t">${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}</span><span class="a">${esc(agent)}</span> ${ok ? '<span class="ok">✓</span> ' : '› '}${esc(msg)}`;
  traceList.prepend(li);
  while (traceList.children.length > 9) traceList.lastChild.remove();
  $('#trace-count').textContent = `${++spans} spans`;
}

/* =========================================================
   RENDER, all content from data.js
   ========================================================= */
function render() {
  $('#impact-grid').innerHTML = impact.map((i) => `
    <div class="imp${i.big ? ' imp-big' : ''}"><span class="imp-d mono">${i.d}</span><span class="imp-k">${i.k}</span><span class="imp-v">${i.v}</span>${i.countries ? `<span class="imp-cty">${i.countries.map((c) => `<a href="${i.link}">${c}</a>`).join('')}</span>` : ''}<p class="imp-r">${i.r}</p>${i.go ? `<a class="imp-go mono" href="${i.go[1]}">${i.go[0]} →</a>` : ''}</div>`).join('');

  // about → words for scroll-scrubbed reading
  const walk = (node) => [...node.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((w) => {
        if (!w.trim()) return frag.appendChild(document.createTextNode(w));
        const s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.appendChild(s);
      });
      n.replaceWith(frag);
    } else walk(n);
  });
  walk($('#about'));

  $('#cases').innerHTML = caseStudies.map((c) => `
    <article class="case" id="case-${c.id}">
      <div class="case-info">
        <span class="case-no mono">case ${c.no} / 04<span class="case-when">${c.when}</span></span>
        <h3 class="case-title">${c.title}</h3>
        <p class="case-line">${c.line}</p>
        <dl class="case-ps"><div><dt class="mono">Problem</dt><dd>${c.problem}</dd></div><div><dt class="mono">My role</dt><dd>${c.role}</dd></div></dl>
        <ul class="case-pts">${c.points.map((p) => `<li>${p}</li>`).join('')}</ul>
        <p class="case-res"><span class="mono">Result</span>${c.result}</p>
        <ul class="chips">${c.stack.map((s) => `<li>${s}</li>`).join('')}</ul>
      </div>
      <div class="demo" data-demo="${c.id}"></div>
    </article>`).join('');

  $('#skills-list').innerHTML = skillsBuilt.map(([t, d], i) => `
    <li><button class="sk${i === 0 ? ' on' : ''}" data-i="${i}"><span class="n mono">${String(i + 1).padStart(2, '0')}</span><span class="t">${t}</span><span class="d">${d}</span></button></li>`).join('');

  $('#eng-track').innerHTML = engineering.map(([t, imp, did], i) => `
    <article class="ec">
      <div class="ec-top"><span class="ec-no">${String(i + 1).padStart(2, '0')}</span><span class="ec-tag mono">identity · intl</span></div>
      <h3>${t}</h3>
      <p class="imp-line">${imp}</p>
      <p class="did">${did}</p>
    </article>`).join('');

  $('#pr-list').innerHTML = principles.map(([t, d], i) => `
    <li><span class="n mono">rule.${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('');

  renderGitLog();

  $('#proj-list').innerHTML = projects.map((p, i) => `
    <li><div class="pj" data-i="${i}">
      <span class="n mono">${String(i + 1).padStart(2, '0')}</span>
      <h3>${p.name}${p.alias ? ` <em class="pj-alias">(${p.alias})</em>` : ''}</h3>
      <p class="w">${p.what}<span>${p.stack}</span></p>
      <div class="lk">${p.live
        ? `<a href="${p.live}" target="_blank" rel="noopener">live ↗</a><a href="${p.code}" target="_blank" rel="noopener">code ↗</a>`
        : `<span class="pj-status mono"><i></i>${p.status}</span>`}</div>
    </div></li>`).join('');

  $('#wr-list').innerHTML = writing.map((w, i) => `
    <a class="wr-card${i < 2 ? ' big' : ''}" href="${w.url}" target="_blank" rel="noopener">
      <span class="wr-cover"><img src="${w.img}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" /></span>
      <span class="wr-meta mono">${w.date}${w.read ? ` · ${w.read} min` : ''} · #${w.tag.toLowerCase()}</span>
      <h3>${w.title}</h3>
    </a>`).join('');

  $('#awards').insertAdjacentHTML('beforeend', `<tbody>${awards.map(([y, a, s]) => `<tr><th scope="row">${y}</th><td>${a}</td><td>${s}</td></tr>`).join('')}</tbody>`);
  $('#certs').innerHTML = certs.map((c) => `<li>${c}</li>`).join('');

  $$('.sec-title').forEach((el) => (el.innerHTML = `<span class="rv-line"><span>${el.innerHTML}</span></span>`));
}

/* ---------- git log ---------- */
function renderGitLog() {
  const root = $('#gitlog');
  const colors = lanes.map((l) => l.color);
  const names = lanes.map((l) => l.name);
  const mobile = innerWidth < 760;
  const LW = mobile ? 16 : 26;
  const graphW = LW * lanes.length + 10;
  root.style.setProperty('--graph-w', graphW + 'px');
  root.innerHTML = `<div class="gl-legend">${names.map((n, i) => `<span><i style="background:${colors[i]}"></i>${n}</span>`).join('')}</div>`;
  const rows = commits.map((c) => {
    const [type, ...rest] = c.msg.split(': ');
    const hash = [...c.msg].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7).toString(16).padStart(7, '0').slice(0, 7);
    const row = document.createElement('div');
    row.className = 'gl-row';
    row.tabIndex = 0;
    row.innerHTML = `<span></span><span class="h">${hash}</span><span class="dt">${c.date}</span>
      <span class="m">${rest.length ? `<span class="ty">${type}:</span> ${rest.join(': ')}` : c.msg}${c.tag ? `<span class="tag">tag: ${c.tag}</span>` : ''}</span>
      <span class="b">${c.body}</span>`;
    root.appendChild(row);
    return row;
  });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  root.appendChild(svg);

  const draw = () => {
    svg.setAttribute('width', graphW);
    svg.setAttribute('height', root.scrollHeight);
    svg.innerHTML = '';
    const x = (lane) => 8 + lane * LW;
    const y = (r) => r.offsetTop + 22;
    for (let lane = 0; lane < lanes.length; lane++) {
      const idx = commits.map((c, i) => (c.lane === lane ? i : -1)).filter((i) => i >= 0);
      if (!idx.length) continue;
      const first = idx[0], last = idx[idx.length - 1];
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let d = `M${x(lane)},${y(rows[first])} L${x(lane)},${y(rows[last])}`;
      // branch off the parent lane at the parent's next commit below this lane's first one
      const parent = lanes[lane].parent;
      if (parent != null) {
        const join = commits.findIndex((c, i) => i > last && c.lane === parent);
        if (join > 0) {
          const y1 = y(rows[last]), y2 = y(rows[join]);
          const yc = y1 + Math.min(60, (y2 - y1) / 2);
          d += ` L${x(lane)},${yc - 20} C${x(lane)},${yc} ${x(parent)},${yc} ${x(parent)},${yc + 20} L${x(parent)},${y2}`;
        }
      }
      p.setAttribute('d', d);
      p.setAttribute('stroke', colors[lane]);
      p.setAttribute('class', 'gl-path');
      svg.appendChild(p);
    }
    commits.forEach((c, i) => {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', x(c.lane));
      dot.setAttribute('cy', y(rows[i]));
      dot.setAttribute('r', c.tag ? 6 : 4);
      dot.setAttribute('fill', c.tag ? colors[c.lane] : '#0f1218');
      dot.setAttribute('stroke', colors[c.lane]);
      dot.setAttribute('stroke-width', 2);
      svg.appendChild(dot);
    });
  };
  requestAnimationFrame(draw);
  new ResizeObserver(() => draw()).observe(root);
}

/* =========================================================
   GATE, token exchange, with a human in the loop
   ========================================================= */
async function runGate(onGrant) {
  const gate = $('#gate');
  const log = $('#gate-log');
  const bar = $('#gate-bar');
  const actions = $('#gate-actions');
  const tok = 'eyJhbGciOiJFUzI1NiJ9.' + rnd(18);

  let remembered = false;
  try { remembered = sessionStorage.getItem('hv-granted') === '1'; } catch (_) {}
  if (remembered || location.hash.length > 1 || new URLSearchParams(location.search).has('skip')) {
    gate.remove();
    onGrant(tok);
    return;
  }

  const lines = [
    '<b>→ POST</b> /oauth/token',
    '  grant_type      = urn:ietf:params:oauth:grant-type:<i>token-exchange</i>',
    '  subject_token   = &lt;visitor:anonymous&gt;',
    '  actor_token     = &lt;agent:hardik.portfolio&gt;',
    '  scope           = read:agents read:identity read:career contact',
    '<b>→</b> verifying actor signature … <u>ok</u>',
    '<b>→</b> evaluating policy (CEL) … <u>allow</u>',
    `<b>← 200 OK</b>  { "access_token": "<i>${tok.slice(0, 26)}…</i>", "expires_in": 900 }`,
  ];
  if (reduced) { log.innerHTML = lines.join('\n'); bar.style.width = '100%'; }
  else {
    for (let i = 0; i < lines.length; i++) {
      log.innerHTML += (i ? '\n' : '') + lines[i];
      bar.style.width = ((i + 1) / lines.length) * 100 + '%';
      await sleep(i === 5 || i === 6 ? 380 : 150);
    }
  }
  actions.classList.add('on');
  const grantBtn = $('#gate-grant');
  grantBtn.focus({ preventScroll: true });

  return new Promise((resolve) => {
    let done = false;
    const grant = async () => {
      if (done) return;
      done = true; clearInterval(tick);
      removeEventListener('keydown', onKey);
      gate.classList.add('is-done');
      try { sessionStorage.setItem('hv-granted', '1'); } catch (_) {}
      onGrant(tok);
      if (reduced) { gate.remove(); return resolve(); }
      await gsap.to(gate, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' });
      gate.remove();
      resolve();
    };
    const onKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); grant(); } };
    addEventListener('keydown', onKey);
    grantBtn.addEventListener('click', grant);
    const AUTO = reduced ? 1500 : 3000;
    gate.style.setProperty('--auto', AUTO + 'ms');
    gate.classList.add('is-auto');
    const count = $('#gate-count');
    let left = Math.ceil(AUTO / 1000);
    count.textContent = `Granting read access automatically in ${left}…`;
    const tick = setInterval(() => { left--; if (left > 0) count.textContent = `Granting read access automatically in ${left}…`; }, 1000);
    const auto = setTimeout(grant, AUTO);
    $('#gate-deny').addEventListener('click', () => {
      clearTimeout(auto); clearInterval(tick); gate.classList.remove('is-auto');
      $('.gate-q', gate).innerHTML = 'Holding. Take your time.<br /><em>The page is public anyway.</em>';
      grantBtn.innerHTML = 'Continue <kbd>↵</kbd>';
      $('#gate-deny').remove();
      grantBtn.focus();
    });
  });
}

/* =========================================================
   HUD, token and ttl
   ========================================================= */
/* =========================================================
   CURSOR
   ========================================================= */
function initCursor() {
  if (!fine || reduced) return;
  document.body.classList.add('has-cursor');
  const c = $('#cursor'), lbl = $('#cursor-label');
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
  const loop = () => { cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; c.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); };
  loop();
  // Three states: a dot by default; hidden over anything clickable (the
  // native hand takes over and the control pulls towards the pointer); a
  // labelled bubble only over areas with no text of their own, like drag rails.
  addEventListener('pointerover', (e) => {
    const ctl = e.target.closest('a, button, input, [role="switch"], label');
    const area = e.target.closest('[data-cursor]');
    const labelled = area && !ctl && !area.matches('a, button');
    c.classList.toggle('big', !!labelled);
    c.classList.toggle('ring', !!ctl);
    lbl.textContent = labelled ? area.dataset.cursor : '';
  });
}

function initMagnetic() {
  if (!fine || reduced) return;
  $$('.btn, .ct-mail, .hud-k, .dbtn, .switch, .kw-p').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.25);
      yTo((e.clientY - r.top - r.height / 2) * 0.3);
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* =========================================================
   PALETTE (⌘K)
   ========================================================= */
function initPalette(lenis, api) {
  const pal = $('#palette'), input = $('#pal-input'), list = $('#pal-list');
  const go = (sel) => () => (lenis ? lenis.scrollTo(sel, { duration: 1.6 }) : $(sel).scrollIntoView());
  const cmds = [
    ['Run the incident-triage agents', 'demo', () => { go('#case-triage')(); setTimeout(() => $('#case-triage [data-run]').click(), 1400); }],
    ['Give an agent a credit card (safely)', 'demo', go('#case-delegate')],
    ['Compress a context window', 'demo', () => { go('#case-tokens')(); setTimeout(() => $('#case-tokens [data-run]').click(), 1400); }],
    ['Work, agents I built', 'section', go('#agents')],
    ['mimo, record a task once', 'section', go('#case-mimo')],
    ['Identity in three countries', 'section', go('#engineering')],
    ['Career timeline (git log)', 'section', go('#log')],
    ['The stack, as elements', 'section', go('#stack')],
    ['Side projects', 'section', go('#work')],
    ['Writing', 'section', go('#writing')],
    ['Get in touch', 'section', go('#contact')],
    ['Kind words', 'section', go('#reviews')],
    ['Copy email', 'action', () => api.copyMail()],
    ['Open LinkedIn', 'link', () => open(identity.links.linkedin, '_blank', 'noopener')],
    ['Open GitHub', 'link', () => open(identity.links.github, '_blank', 'noopener')],
    ['Revoke my token', 'danger', () => api.revoke()],
    ['Back to top', 'section', go('#top')],
  ];
  let sel = 0, shown = cmds;
  const draw = () => {
    const q = input.value.toLowerCase().trim();
    shown = cmds.filter(([t, k]) => !q || (t + ' ' + k).toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = shown.map(([t, k], i) => `<li role="option" aria-selected="${i === sel}" data-i="${i}">${t}<small>${k}</small></li>`).join('') || '<li>No matching agent.</li>';
  };
  const openP = () => { pal.hidden = false; input.value = ''; sel = 0; draw(); input.focus(); lenis?.stop(); trace('palette', 'opened'); };
  const close = () => { pal.hidden = true; lenis?.start(); };
  const run = (i) => { const c = shown[i]; if (!c) return; close(); c[2](); trace('palette', c[0]); };
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? openP() : close(); }
    else if (!pal.hidden) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowDown') { sel = (sel + 1) % shown.length; draw(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { sel = (sel - 1 + shown.length) % shown.length; draw(); e.preventDefault(); }
      else if (e.key === 'Enter') run(sel);
    }
  });
  input.addEventListener('input', () => { sel = 0; draw(); });
  list.addEventListener('click', (e) => { const li = e.target.closest('[data-i]'); if (li) run(+li.dataset.i); });
  pal.addEventListener('click', (e) => { if (e.target === pal) close(); });
  $('#open-palette').addEventListener('click', openP);
}

/* =========================================================
   INTERACTIONS
   ========================================================= */
function initSkills() {
  const pre = $('#skills-preview');
  const show = (i) => {
    const [t, d] = skillsBuilt[i];
    const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    pre.innerHTML = [
      `<span class="c">~/.agent/skills/${slug}/SKILL.md</span>`,
      '<span class="c">---</span>',
      `<span class="k">name</span>: <span class="s">${slug}</span>`,
      `<span class="k">description</span>: <span class="s">${esc(d)}</span>`,
      `<span class="k">author</span>: <span class="s">hardik</span>`,
      '<span class="c">---</span>',
      '',
      `# ${esc(t)}`,
      '',
      '## When to use',
      'Trigger when the user asks for anything that looks like',
      `“${esc(t.toLowerCase())}”. Prefer this over ad-hoc prompting.`,
      '',
      '## Steps',
      '1. Gather context with the minimum tool calls.',
      '2. Plan; ask a human before anything irreversible.',
      '3. Execute, verify, and explain what changed.',
    ].join('\n');
    $$('.sk').forEach((b) => b.classList.toggle('on', +b.dataset.i === i));
  };
  show(0);
  $$('.sk').forEach((b) => {
    ['mouseenter', 'focus', 'click'].forEach((ev) => b.addEventListener(ev, () => show(+b.dataset.i)));
  });
}

function initProjectFloat() {
  if (!fine) return;
  const fl = $('#proj-float'), cv = fl.querySelector('canvas'), lbl = fl.querySelector('span'), ctx = cv.getContext('2d');
  let x = 0, y = 0, fx = 0, fy = 0, cur = null, t = 0, raf = 0;
  const paint = () => {
    t += 0.016;
    const p = projects[cur];
    const W = cv.width, H = cv.height;
    ctx.fillStyle = `hsl(${p.hue} 40% 10%)`;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 7; i++) {
      const cx = W / 2 + Math.cos(t * 0.8 + i) * W * 0.32, cy = H / 2 + Math.sin(t * 1.1 + i * 1.7) * H * 0.3;
      const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
      gr.addColorStop(0, `hsla(${p.hue + i * 14} 85% 62% / .5)`);
      gr.addColorStop(1, 'transparent');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.07)';
    for (let gx = 0; gx < W; gx += 24) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.font = '800 150px Archivo, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.name[0], 22 + Math.sin(t) * 4, H / 2);
  };
  const loop = () => {
    fx += (x - fx) * 0.14; fy += (y - fy) * 0.14;
    fl.style.left = fx + 24 + 'px'; fl.style.top = fy - 100 + 'px';
    if (cur != null) paint();
    raf = requestAnimationFrame(loop);
  };
  $$('.pj').forEach((el) => {
    el.addEventListener('mouseenter', () => { cur = +el.dataset.i; lbl.textContent = projects[cur].stack; fl.classList.add('on'); if (!raf) loop(); });
    el.addEventListener('mouseleave', () => fl.classList.remove('on'));
  });
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
}

/* ---------- Kind words: one voice at a time, photo ringed by a timer ---------- */
function initKindWords() {
  const people = $('#kw-people'), img = $('#kw-img'), q = $('#kw-q'), who = $('#kw-who'), prog = $('#kw-prog');
  const C = 2 * Math.PI * 56;
  prog.style.strokeDasharray = C;
  people.innerHTML = testimonials.map((t, i) => `
    <button class="kw-p" role="tab" aria-selected="${i === 0}" data-i="${i}" aria-label="${t.who}">
      <img src="${t.img}" alt="" width="48" height="48" /><span>${t.who.split(' ')[0]}</span>
    </button>`).join('');
  const btns = $$('.kw-p', people);
  let i = 0, t0 = performance.now(), paused = false, pausedAt = 0;
  const DUR = 8000;
  const show = (n, animate = true) => {
    i = (n + testimonials.length) % testimonials.length;
    const t = testimonials[i];
    btns.forEach((b, k) => b.setAttribute('aria-selected', k === i));
    const set = () => {
      img.src = t.img; img.alt = t.who;
      q.innerHTML = t.q.split(' ').map((w) => `<span class="kw-w">${esc(w)}</span>`).join(' ');
      who.innerHTML = `<b>${t.who}</b><span>${t.role}</span>`;
    };
    t0 = performance.now();
    if (reduced || !animate) return set();
    gsap.timeline()
      .to([q, who, img], { opacity: 0, y: -10, duration: 0.25, ease: 'power2.in' })
      .add(set)
      .set([q, who, img], { opacity: 1, y: 0 })
      .from('#kw-q .kw-w', { opacity: 0, y: 14, filter: 'blur(6px)', duration: 0.6, ease: 'expo.out', stagger: 0.018 })
      .from(img, { scale: 0.85, duration: 0.6, ease: 'expo.out' }, '<')
      .from(who, { opacity: 0, y: 8, duration: 0.4 }, '-=0.3');
  };
  show(0, false);
  people.addEventListener('click', (e) => { const b = e.target.closest('.kw-p'); if (b) show(+b.dataset.i); });
  const kw = $('#kw');
  kw.addEventListener('pointerenter', () => { paused = true; pausedAt = performance.now(); });
  kw.addEventListener('pointerleave', () => { paused = false; t0 += performance.now() - pausedAt; });
  kw.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1); });
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !paused) t0 = performance.now() - ((performance.now() - t0) % DUR); }).observe(kw);
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible || paused || reduced) return;
    const k = (performance.now() - t0) / DUR;
    prog.style.strokeDashoffset = C * (1 - Math.min(1, k));
    if (k >= 1) show(i + 1);
  })();
}

/* ---------- The stack as a periodic table ---------- */
function initToolbox() {
  const pt = $('#pt'), card = $('#pt-card'), legend = $('#pt-legend'), whereEl = $('#pt-where');
  const color = Object.fromEntries(toolboxGroups.map(([g, , c]) => [g, c]));
  const label = Object.fromEntries(toolboxGroups.map(([g, l]) => [g, l]));
  const whereName = Object.fromEntries(toolboxWhere);
  const bySym = Object.fromEntries(toolbox.map((t, n) => [t[1], n]));
  const meta = (sym) => { const [at = '', rel = ''] = toolboxMeta[sym] || []; return { at: [...at], rel: rel.split(' ').filter(Boolean) }; };

  legend.innerHTML = toolboxGroups.map(([g, l, c]) => `<li><button data-g="${g}" style="--c:${c}" aria-pressed="false">${l}</button></li>`).join('');
  whereEl.innerHTML = `<li class="pw-k mono">used at</li>` + toolboxWhere.map(([w, l]) => `<li><button data-w="${w}" aria-pressed="false">${l}</button></li>`).join('');
  pt.insertAdjacentHTML('beforeend', toolbox.map(([g, sym, name, use], n) => `
    <button class="el" data-g="${g}" data-n="${n}" style="--c:${color[g]}" aria-label="${name}: ${use}">
      <span class="el-n mono">${n + 1}</span><span class="el-s">${sym}</span><span class="el-name">${name}</span>
    </button>`).join(''));
  const els = $$('.el', pt);
  const st = { g: null, w: null, n: null };

  const paint = () => {
    const act = st.n != null ? toolbox[st.n][1] : null;
    const rel = act ? meta(act).rel : [];
    els.forEach((e) => {
      const n = +e.dataset.n, sym = toolbox[n][1];
      const filtered = (st.g && e.dataset.g !== st.g) || (st.w && !meta(sym).at.includes(st.w));
      const isAct = n === st.n, isRel = rel.includes(sym);
      e.classList.toggle('on', isAct);
      e.classList.toggle('rel', !isAct && isRel);
      e.classList.toggle('dim', act ? !(isAct || isRel) : !!filtered);
    });
  };

  const place = (e) => {
    const pw = pt.clientWidth, cw = Math.min(300, pw - 8);
    const cx = e.offsetLeft + e.offsetWidth / 2;
    const left = Math.max(0, Math.min(pw - cw, cx - cw / 2));
    const below = e.offsetTop + e.offsetHeight / 2 < pt.clientHeight / 2;
    card.style.width = cw + 'px';
    card.style.left = left + 'px';
    card.style.setProperty('--ax', Math.max(18, Math.min(cw - 18, cx - left)) + 'px');
    card.classList.toggle('up', !below);
    card.style.top = below ? e.offsetTop + e.offsetHeight + 12 + 'px' : 'auto';
    card.style.bottom = below ? 'auto' : pt.clientHeight - e.offsetTop + 12 + 'px';
  };

  const show = (e) => {
    const n = +e.dataset.n, [g, sym, name, use] = toolbox[n], mt = meta(sym);
    st.n = n;
    card.style.setProperty('--c', color[g]);
    card.innerHTML = `<div class="pc-top"><span class="pc-s">${sym}</span><div><b class="pc-name">${name}</b><small class="mono">${label[g]} · ${String(n + 1).padStart(2, '0')}</small></div></div>
      <p class="pc-use">${use}</p>
      ${mt.at.length ? `<div class="pc-at">${mt.at.map((a) => `<span>${whereName[a]}</span>`).join('')}</div>` : ''}
      ${mt.rel.length ? `<p class="pc-rel mono">pairs with <b>${mt.rel.map((s) => toolbox[bySym[s]][2]).join(' · ')}</b></p>` : ''}`;
    place(e);
    card.classList.add('on');
    paint();
  };
  const hide = () => { st.n = null; card.classList.remove('on'); paint(); };

  els.forEach((e) => {
    e.addEventListener('pointerenter', () => show(e));
    e.addEventListener('focus', () => show(e));
    e.addEventListener('click', () => show(e));
    e.addEventListener('blur', hide);
  });
  pt.addEventListener('pointerleave', hide);
  addEventListener('keydown', (ev) => { if (ev.key === 'Escape') hide(); });
  addEventListener('resize', hide);

  const toggle = (box, key, attr) => box.addEventListener('click', (ev) => {
    const b = ev.target.closest('button'); if (!b) return;
    const v = b.dataset[attr];
    st[key] = st[key] === v ? null : v;
    $$('button', box).forEach((x) => { const on = x.dataset[attr] === st[key]; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
    paint();
  });
  toggle(legend, 'g', 'g');
  toggle(whereEl, 'w', 'w');

  pt.addEventListener('pointermove', (e) => {
    const r = pt.getBoundingClientRect();
    pt.style.setProperty('--mx', `${e.clientX - r.left}px`);
    pt.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}

function initContact() {
  const btn = $('#copy-mail'), st = $('#copy-state');
  const copyMail = async () => {
    try { await navigator.clipboard.writeText(identity.email); st.textContent = 'copied ✓'; }
    catch { location.href = `mailto:${identity.email}`; }
    trace('contact', 'email copied', true);
    setTimeout(() => (st.textContent = 'copy'), 2200);
  };
  btn.addEventListener('click', copyMail);

  const sw = $('#revoke'), ov = $('#revoked');
  const revoke = () => {
    sw.setAttribute('aria-checked', 'false');
    document.body.classList.add('revoked');
    ov.classList.add('on'); ov.setAttribute('aria-hidden', 'false'); ov.inert = false;
    gsap.fromTo(ov, { opacity: 0, backgroundColor: 'rgba(5,6,9,0)' }, { opacity: 1, backgroundColor: 'rgba(5,6,9,.82)', duration: reduced ? 0 : 0.6 });
    gsap.from('#revoked h2', { y: 40, opacity: 0, duration: reduced ? 0 : 0.8, ease: 'expo.out', delay: 0.15 });
    trace('gateway', 'token revoked by user');
    $('#regrant').focus();
  };
  const regrant = () => {
    sw.setAttribute('aria-checked', 'true');
    document.body.classList.remove('revoked');
    gsap.to(ov, { opacity: 0, duration: reduced ? 0 : 0.4, onComplete: () => { ov.classList.remove('on'); ov.setAttribute('aria-hidden', 'true'); ov.inert = true; } });
    trace('gateway', 'access re-granted', true);
  };
  sw.addEventListener('click', () => (sw.getAttribute('aria-checked') === 'true' ? revoke() : regrant()));
  $('#regrant').addEventListener('click', regrant);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && ov.classList.contains('on')) regrant(); });
  return { copyMail, revoke };
}

/* =========================================================
   SCROLL CHOREOGRAPHY
   ========================================================= */
function initScroll(demos) {
  // hero exit: photo pushes in, copy drifts up and fades (desktop)
  if (!reduced) {
    gsap.matchMedia().add('(min-width: 769px)', () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } });
      tl.to('#hero-photo', { scale: 1.16, yPercent: 6, ease: 'none' }, 0)
        .to('.hero-orb-1', { y: 150, x: -30, ease: 'none' }, 0)
        .to('.hero-orb-2', { y: 100, x: 30, ease: 'none' }, 0)
        .to('.hero-right', { yPercent: -18, autoAlpha: 0.15, ease: 'none' }, 0)
        .to('.hero-grid', { opacity: 0, ease: 'none' }, 0);
      return () => tl.kill();
    });
    gsap.to('.hero-cue span', { y: 6, duration: 1, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    $$('.sec-title .rv-line > span').forEach((s) => {
      gsap.from(s, { yPercent: 110, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 88%' } });
    });
    $$('.imp, .pr-list li, .wr-card, .pj, .gl-row, .awards tr').forEach((el) => {
      gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
    });
    // the periodic table settles in, tiles in random order
    gsap.fromTo('.el', { opacity: 0, scale: 0.6, rotateX: -60 }, { opacity: 1, scale: 1, rotateX: 0, duration: 0.8, ease: 'expo.out', stagger: { each: 0.018, from: 'random' }, clearProps: 'transform,opacity,scale,rotate,translate', scrollTrigger: { trigger: '#pt', start: 'top 80%' } });
    gsap.from('.imp-k', { yPercent: 60, opacity: 0, stagger: 0.08, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '#impact-grid', start: 'top 80%' } });
  }

  // about: words light up as you read
  const words = $$('#about .w');
  ScrollTrigger.create({
    trigger: '#about', start: 'top 80%', end: 'bottom 45%', scrub: true,
    onUpdate: (st) => { const n = Math.round(st.progress * words.length); words.forEach((w, i) => (w.style.opacity = i < n ? 1 : 0.14)); },
  });
  if (reduced) words.forEach((w) => (w.style.opacity = 1));

  // engineering: horizontal on desktop
  gsap.matchMedia().add('(min-width: 761px)', () => {
    const track = $('#eng-track');
    const dist = () => track.scrollWidth - innerWidth;
    const tw = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.eng-pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: reduced ? true : 0.6, invalidateOnRefresh: true,
        onUpdate: (st) => {
          $('#eng-count').textContent = String(Math.min(engineering.length, 1 + Math.floor(st.progress * engineering.length))).padStart(2, '0');
          $('#eng-bar').style.width = st.progress * 100 + '%';
        },
      },
    });
    return () => tw.kill();
  });

  // git log draws itself as you scroll
  ScrollTrigger.create({
    trigger: '#gitlog', start: 'top 70%', end: 'bottom 70%', scrub: true,
    onUpdate: (st) => $$('#gitlog .gl-path').forEach((p) => {
      const L = p.getTotalLength();
      p.style.strokeDasharray = L;
      p.style.strokeDashoffset = L * (1 - st.progress);
    }),
  });

  // each section reports in as a sub-agent
  const labels = { impact: 'summarise', agents: 'agents', stack: 'stack', skills: 'skills', platform: 'identity', principles: 'principles', log: 'git', work: 'projects', writing: 'medium', reviews: 'kind-words', ledger: 'recognition', contact: 'contact' };
  const seen = new Set();
  $$('[data-agent]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 60%',
      onEnter: () => {
        const a = sec.dataset.agent;
        if (seen.has(a)) return;
        seen.add(a);
        trace('supervisor', `dispatch → agent:${labels[a] || a}`);
        setTimeout(() => trace(labels[a] || a, 'rendered', true), 380 + Math.random() * 400);
      },
    });
  });

  // demos autoplay once on first view
  [['triage', demos.triage], ['tokens', demos.tokens]].forEach(([id, d]) => {
    ScrollTrigger.create({ trigger: `#case-${id} .demo`, start: 'top 65%', once: true, onEnter: () => !reduced && d.autoplay() });
  });

  // nav state + scroll rail + trace visibility
  $$('.hud-nav a').forEach((a) => {
    ScrollTrigger.create({ trigger: a.getAttribute('href'), start: 'top 50%', end: 'bottom 50%', onToggle: (st) => a.classList.toggle('on', st.isActive) });
  });
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (st) => ($('#scope-fill').style.height = st.progress * 100 + '%') });
  ScrollTrigger.create({ trigger: '#impact', start: 'top 80%', onEnter: () => traceEl.classList.add('on'), onLeaveBack: () => traceEl.classList.remove('on') });

  if (!reduced) gsap.from('.ct-title > *', { yPercent: 60, opacity: 0, stagger: 0.12, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.ct-title', start: 'top 85%' } });
}

/* =========================================================
   BOOT
   ========================================================= */
(async function boot() {
  render();
  const demos = {
    triage: mountTriage($('[data-demo="triage"]'), trace),
    delegate: mountDelegate($('[data-demo="delegate"]'), trace),
    tokens: mountTokens($('[data-demo="tokens"]'), trace),
  };
  initSkills();
  initMimo({ reduced });
  const geoEl = $('#geo');
  const loadGeo = () => import('./geo.js').then((m) => { m.initGeo({ reduced }); ScrollTrigger.refresh(); });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { io.disconnect(); loadGeo(); } }, { rootMargin: '900px 0px' });
    io.observe(geoEl);
  } else loadGeo();
  initProjectFloat();
  initKindWords();
  initToolbox();
  const api = initContact();
  initCursor();
  initMagnetic();

  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    if (import.meta.env.DEV) { window.__lenis = lenis; window.__ST = ScrollTrigger; }
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2 || !$(id)) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(id, { duration: 1.6 }) : $(id).scrollIntoView();
  }));
  initPalette(lenis, api);

  // hero: split the name into masked characters, start the FX in parallel with the gate
  history.scrollRestoration = 'manual';
  if (location.hash.length < 2) scrollTo(0, 0);
  $$('.hn-line').forEach((line) => {
    line.innerHTML = [...line.textContent.trim()].map((c) => `<span class="hc-mask"><span class="hc">${c}</span></span>`).join('');
  });
  const fluid = (() => { try { return initFluid({ reduced }); } catch (e) { console.warn('fluid off', e); document.querySelector('.fx-fluid')?.remove(); return null; } })();
  if (import.meta.env.DEV) window.__fluid = fluid;
  const heroMod = import('./hero.js');
  const xray = () => heroMod.then((m) => m.initXray($$('.hc'))).catch(() => {});
  const portraitP = heroMod.then((m) => m.initPortrait({ wrap: $('#hero-photo'), canvas: $('#hero-photo-gl'), bwSrc: 'hero-bw.jpeg', colorSrc: 'hero-color.jpeg', reduced }))
    .catch((e) => { console.warn('portrait off', e); $('#hero-photo-gl')?.remove(); return null; });

  const heroEntrance = () => {
    const hero = $('.hero');
    portraitP.then((p) => p?.reveal(0.1, 1.9));
    if (reduced) { hero.classList.add('ready'); xray(); return; }
    const tl = gsap.timeline({ delay: 0.2, defaults: { ease: 'power3.out' }, onStart: () => hero.classList.add('ready') });
    tl.from('#hero-photo', { scale: 1.18, xPercent: -4, autoAlpha: 0, duration: 1.5, ease: 'expo.out' }, 0)
      .from('.hero-role', { autoAlpha: 0, x: 24, duration: 0.7 }, 0.25)
      .from($$('.hn-line')[0].querySelectorAll('.hc'), { yPercent: 120, rotationX: 35, duration: 0.95, ease: 'expo.out', stagger: 0.03 }, 0.22)
      .from($$('.hn-line')[1].querySelectorAll('.hc'), { yPercent: 120, rotationX: 35, duration: 0.95, ease: 'expo.out', stagger: { each: 0.03, from: 'end' } }, 0.38)
      .from('.hero-intro', { yPercent: 40, autoAlpha: 0, duration: 0.75 }, 0.55)
      .from('.hero-caps li', { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.08 }, 0.72)
      .from('.hero-cue', { y: 10, autoAlpha: 0, duration: 0.45 }, 0.95)
      .fromTo('.hero-avail', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.95);
    setTimeout(() => fluid?.sweep($('.hero-name')), 250);
    setTimeout(xray, 1500);
  };

  await runGate((tok) => {
    document.body.classList.remove('is-locked');
    lenis?.start();
    trace('auth', 'token exchanged · act=hardik.portfolio', true);
    heroEntrance();
  });
  initScroll(demos);
  ScrollTrigger.refresh();
  if (location.hash.length > 1 && $(location.hash)) {
    requestAnimationFrame(() => (lenis ? lenis.scrollTo(location.hash, { immediate: true }) : $(location.hash).scrollIntoView()));
  }
  addEventListener('load', () => ScrollTrigger.refresh());
})();
