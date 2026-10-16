// The guide: the bot from the hero follows you down the page. It always says where you are,
// what to do here, where to go next, and how to go back, whether you use its buttons or just scroll.
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const $ = (s, r = document) => r.querySelector(s);

const STOPS = [
  { id: 'town', name: 'Agent Town', say: 'Hi, I’m Hardik’s agent. Tap any building for its chapter, or let me walk you through.', next: 'Start the tour' },
  { id: 'story', name: 'The story', say: 'Ten years in one paragraph. Keep scrolling and it fills in.' },
  { id: 'lab', name: 'Agents', say: 'Four things built at Walmart. Open any one to watch it work.' },
  { id: 'journey', name: 'Journey', say: 'Scroll to drive down the road, one stop at a time.' },
  { id: 'passport', name: 'Markets', say: 'Tap a stamp to see that country.' },
  { id: 'writing', name: 'Writing', say: 'Pick any story to read it on Medium.' },
  { id: 'words', name: 'Kind words', say: 'Flip through what people I’ve worked with said.' },
  { id: 'after-hours', name: 'After hours', say: 'Side projects. Most are live, tap one to try it.' },
  { id: 'stack', name: 'Stack', say: 'Open the tiffin to see what I work with.' },
  { id: 'contact', name: 'Say hi', say: 'That’s the tour! Post a letter and I’ll pass it to Hardik.', next: 'Back to the top' },
];

export function initGuide({ scrollToEl, reduced }) {
  const stops = STOPS.filter((s) => document.getElementById(s.id));
  const root = $('#buddy'), card = $('#g-card'), bot = $('#g-bot');
  let at = 0;
  $('#g-dots').innerHTML = stops.map(() => '<i></i>').join('');

  // a button press updates the guide at once and holds it there while the page scrolls
  const go = (i) => { if (i < 0) return; hold = Date.now() + 1600; show(i); scrollToEl(i === 0 ? document.body : `#${stops[i].id}`); };
  function show(i) {
    at = i;
    const s = stops[i], last = i === stops.length - 1;
    $('#g-step').textContent = `${i + 1} / ${stops.length}`;
    $('#g-where').textContent = s.name;
    $('#g-say').textContent = s.say;
    $('#g-next').textContent = last ? `${s.next} ↑` : `${s.next || `Next: ${stops[i + 1].name}`} ↓`;
    $('#g-back').textContent = `↑ ${stops[i - 1]?.name || ''}`;
    $('#g-back').hidden = i === 0;
    $('#g-back').setAttribute('aria-label', i ? `Back to ${stops[i - 1].name}` : '');
    [...$('#g-dots').children].forEach((d, k) => { d.classList.toggle('on', k === i); d.classList.toggle('seen', k < i); });
    document.documentElement.classList.toggle('in-hero', i === 0);
    if (!reduced) { card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop'); }
  }

  $('#g-next').addEventListener('click', () => go(at === stops.length - 1 ? 0 : at + 1));
  $('#g-back').addEventListener('click', () => go(at - 1));

  // shrink to just the bot, tap the bot to bring the guide back
  let open = true;
  try { open = sessionStorage.getItem('hv-guide') !== 'min'; } catch (_) {}
  const setOpen = (v) => {
    open = v;
    root.classList.toggle('min', !v);
    bot.setAttribute('aria-expanded', String(v));
    bot.setAttribute('aria-label', v ? 'Hide the tour guide' : 'Show the tour guide');
    try { sessionStorage.setItem('hv-guide', v ? 'open' : 'min'); } catch (_) {}
  };
  $('#g-min').addEventListener('click', () => setOpen(false));
  bot.addEventListener('click', () => setOpen(!open));
  setOpen(open);

  // follow the reader: the current stop is the last section whose top has passed the middle of the screen,
  // or the last stop once you reach the bottom (short closing sections never reach the middle)
  let hold = 0;
  const current = () => {
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 4) return stops.length - 1;
    let k = 0;
    stops.forEach((s, i) => { if (document.getElementById(s.id).getBoundingClientRect().top <= innerHeight * 0.55) k = i; });
    return k;
  };
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: () => { if (Date.now() < hold) return; const k = current(); if (k !== at) show(k); } });
  show(0);
  ScrollTrigger.refresh();
}
