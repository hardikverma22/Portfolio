// Small, simplified company marks used on pins, panels and inline in the story. Drawn in a 24×24 box.

const spark = (fill) => Array.from({ length: 6 }, (_, i) => `<rect x="-1.5" y="-9.6" width="3" height="6.4" rx="1.5" fill="${fill}" transform="translate(12 12) rotate(${i * 60})"/>`).join('');

const marks = {
  walmart: `<rect width="24" height="24" rx="6" fill="#0071dc"/>${spark('#ffc220')}`,
  tcs: `<rect width="24" height="24" rx="6" fill="#1b3f8f"/><text x="12" y="15.6" text-anchor="middle" font-family="Figtree, Arial, sans-serif" font-weight="800" font-size="10.5" fill="#fff" letter-spacing="-.3">tcs</text>`,
  fidelity: `<rect width="24" height="24" rx="6" fill="#368727"/><path d="M8.2 18.5 V6 h8 v2.6 h-5 v2.6 h4.3 v2.5 h-4.3 v4.8 Z" fill="#fff"/>`,
  medium: `<rect width="24" height="24" rx="6" fill="#111"/><ellipse cx="8.4" cy="12" rx="4.4" ry="4.6" fill="#fff"/><ellipse cx="15.6" cy="12" rx="2.1" ry="4.3" fill="#fff"/><ellipse cx="19.4" cy="12" rx=".8" ry="3.9" fill="#fff"/>`,
  home: `<rect width="24" height="24" rx="6" fill="#ef6a5b"/><path d="M5 12 L12 5.5 L19 12 V19 H5 Z" fill="#fff4e0"/><rect x="10" y="13" width="4" height="6" fill="#ef6a5b"/>`,
  java: `<rect width="24" height="24" rx="6" fill="#fff4e0" stroke="#211c33" stroke-width="1.6"/><path d="M6.5 10 h9 v4.6 a4.5 4.5 0 0 1 -9 0 Z" fill="#e2725b" stroke="#211c33" stroke-width="1.4"/><path d="M15.5 11 h1.6 a1.8 1.8 0 0 1 0 3.6 h-1.6" fill="none" stroke="#211c33" stroke-width="1.4"/><path d="M9 7.6 q-1 -1.4 0 -2.8 M12 7.6 q-1 -1.4 0 -2.8" fill="none" stroke="#211c33" stroke-width="1.2" stroke-linecap="round"/>`,
  sweden: `<rect width="24" height="24" rx="6" fill="#006aa7"/><path d="M8 0 v24 M0 12 h24" stroke="#fecc00" stroke-width="4"/><rect width="24" height="24" rx="6" fill="none" stroke="#211c33" stroke-width="1"/>`,
};

export function mark(id, cls = 'mk-ico') {
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${marks[id] || ''}</svg>`;
}
export const markInner = (id) => marks[id] || '';
export { spark };
