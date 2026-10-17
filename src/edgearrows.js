// Round ‹ › buttons pinned to both ends of a row that scrolls sideways, so it's obvious there's more
// to see and how to get to it. They only show while the row actually overflows, and each one fades out
// once there's nothing further in its direction. A press moves about one card.
export function edgeArrows(row, { label = 'items' } = {}) {
  const wrap = row.parentElement;
  wrap.classList.add('ea-wrap');
  const mk = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `ea ea-${dir < 0 ? 'l' : 'r'}`;
    b.setAttribute('aria-label', `${dir < 0 ? 'Previous' : 'Next'} ${label}`);
    b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${dir < 0 ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7'}"/></svg>`;
    b.addEventListener('click', () => {
      const card = row.firstElementChild;
      const step = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(row).columnGap || 0) : row.clientWidth * 0.8;
      row.scrollBy({ left: dir * step, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    wrap.append(b);
    return b;
  };
  const prev = mk(-1), next = mk(1);
  const sync = () => {
    const max = row.scrollWidth - row.clientWidth;
    const on = max > 4;
    wrap.classList.toggle('ea-on', on);
    prev.disabled = !on || row.scrollLeft <= 4;
    next.disabled = !on || row.scrollLeft >= max - 4;
  };
  row.addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', sync);
  document.fonts?.ready.then(sync);
  sync();
  return sync;
}
