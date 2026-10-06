// Identity map: a dotted world, the markets lit in ice, arcs from
// Bengaluru to each launch, and a panel that tells the story per pin.
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { markets, origin } from './data.js';

const LIT = { Chile: '152', Mexico: '484', Canada: '124', SouthAfrica: '710', India: '356' };

export function initGeo({ reduced }) {
  const map = document.querySelector('.geo-map');
  const canvas = document.getElementById('geo-canvas');
  const arcs = document.getElementById('geo-arcs');
  const pinsEl = document.getElementById('geo-pins');
  const panel = document.getElementById('geo-panel');
  const countries = feature(world, world.objects.countries);
  const land = countries.features.filter((f) => f.id !== '010'); // no Antarctica
  const lit = new Set(Object.values(LIT));

  let selected = markets[0].id, proj, W = 0, H = 0;

  const panelHtml = (m) => `
      <span class="gp-k mono">${m.when}</span>
      <h3>${m.name}</h3>
      <p class="gp-t">${m.title}</p>
      <p class="gp-l">${m.line}</p>
      ${m.stats?.length ? `<div class="gp-stats">${m.stats.map(([k, v]) => `<div><b>${k}</b><span>${v}</span></div>`).join('')}</div>` : ''}
      ${m.shipped?.length ? `<div class="gp-chips" aria-label="What shipped">${m.shipped.map((s) => `<span>${s}</span>`).join('')}</div>` : ''}
      <ul>${m.did.map((d) => `<li>${d}</li>`).join('')}</ul>`;

  const showPanel = (m) => {
    panel.innerHTML = panelHtml(m);
    if (!reduced) gsap.from(panel.children, { y: 14, opacity: 0, duration: 0.5, ease: 'expo.out', stagger: 0.05 });
  };

  // keep the row as tall as the tallest card so the section does not jump between pins
  const lockHeight = () => {
    const geo = map.parentElement;
    geo.style.minHeight = '';
    if (matchMedia('(max-width: 960px)').matches) return;
    const keep = panel.innerHTML;
    let max = 0;
    markets.forEach((m) => { panel.innerHTML = panelHtml(m); max = Math.max(max, panel.scrollHeight); });
    panel.innerHTML = keep;
    geo.style.minHeight = max + 'px';
  };

  const draw = () => {
    const r = map.getBoundingClientRect();
    W = Math.floor(r.width); H = Math.floor(r.height);
    if (!W) return;
    proj = geoNaturalEarth1().fitExtent([[W * 0.02, H * 0.04], [W * 0.98, H * 1.12]], { type: 'FeatureCollection', features: land });
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');

    // rasterise land and the lit countries into two masks
    const mask = (features) => {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.fillStyle = '#000';
      x.beginPath(); geoPath(proj, x)({ type: 'FeatureCollection', features }); x.fill();
      return x.getImageData(0, 0, W, H).data;
    };
    const all = mask(land), hi = mask(land.filter((f) => lit.has(f.id)));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const step = Math.max(5, Math.round(W / 150));
    for (let y = step / 2; y < H; y += step) {
      for (let x = step / 2; x < W; x += step) {
        const i = ((y | 0) * W + (x | 0)) * 4 + 3;
        if (!all[i]) continue;
        const on = hi[i] > 0;
        ctx.fillStyle = on ? 'rgba(127,178,255,.95)' : 'rgba(232,236,242,.16)';
        ctx.beginPath(); ctx.arc(x, y, on ? step * 0.3 : step * 0.22, 0, Math.PI * 2); ctx.fill();
      }
    }

    // pins
    pinsEl.innerHTML = '';
    const [ox, oy] = proj([origin.lon, origin.lat]);
    const o = document.createElement('span');
    o.className = 'pin origin ' + (W < 600 ? 'left' : 'right');
    o.style.left = ox + 'px'; o.style.top = oy + 'px';
    o.innerHTML = `<span>${origin.name}${W < 600 ? '' : ' · where it\'s built'}</span>`;
    pinsEl.appendChild(o);
    markets.forEach((m) => {
      const [x, y] = proj([m.lon, m.lat]);
      const b = document.createElement('button');
      b.className = 'pin' + (m.id === 'sams' ? ' right' : m.id === 'mx' ? ' left' : '');
      b.style.left = x + (m.ox || 0) + 'px'; b.style.top = y + 'px';
      b.setAttribute('aria-pressed', m.id === selected);
      b.setAttribute('aria-label', `${m.name}: ${m.title}`);
      b.dataset.cursor = 'open';
      b.innerHTML = `<span>${m.name}</span>`;
      b.addEventListener('click', () => {
        selected = m.id;
        pinsEl.querySelectorAll('button.pin').forEach((p) => p.setAttribute('aria-pressed', p === b));
        showPanel(m);
      });
      pinsEl.appendChild(b);
    });

    // arcs from Bengaluru, bowing up over the globe
    arcs.setAttribute('viewBox', `0 0 ${W} ${H}`);
    arcs.innerHTML = `<defs><linearGradient id="arcGrad" x1="1" x2="0" y1="0" y2="0"><stop offset="0" stop-color="#e7c46a"/><stop offset="1" stop-color="#7fb2ff"/></linearGradient></defs>`;
    const seen = new Set();
    markets.forEach((m) => {
      if (seen.has(m.country)) return; seen.add(m.country);
      const [x, y] = proj([m.lon, m.lat]);
      const mx = (ox + x) / 2, my = Math.min(oy, y) - H * 0.38;
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', `M${ox},${oy} Q${mx},${my} ${x},${y}`);
      arcs.appendChild(p);
      const L = p.getTotalLength();
      p.style.strokeDasharray = `${L}`;
      p.style.strokeDashoffset = drawn || reduced ? '0' : `${L}`;
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '2.6'); dot.setAttribute('fill', '#fff');
      arcs.appendChild(dot);
      travellers.push({ p, L, dot, o: Math.random() });
    });
  };

  let drawn = false, travellers = [];
  const redraw = () => { travellers = []; draw(); };
  showPanel(markets[0]);
  lockHeight();
  redraw();
  let rt; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => { lockHeight(); redraw(); }, 120); }).observe(map);

  ScrollTrigger.create({
    trigger: map, start: 'top 75%', once: true,
    onEnter: () => {
      if (reduced) { drawn = true; return; }
      travellers.forEach((t, i) => gsap.to(t.p, { strokeDashoffset: 0, duration: 1.4, delay: i * 0.2, ease: 'power2.inOut' }));
      setTimeout(() => (drawn = true), 1800);
    },
  });

  let visible = false;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(map);
  const t0 = performance.now();
  (function frame() {
    requestAnimationFrame(frame);
    if (!visible || reduced) return;
    const t = (performance.now() - t0) / 1000;
    travellers.forEach((tr) => {
      const k = (t * 0.25 + tr.o) % 1;
      const pt = tr.p.getPointAtLength(k * tr.L);
      tr.dot.setAttribute('cx', pt.x); tr.dot.setAttribute('cy', pt.y);
      tr.dot.setAttribute('opacity', drawn ? Math.sin(k * Math.PI) : 0);
    });
  })();
}
