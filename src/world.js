// Copy for the Agent Town layer of the site. Facts come from data.js; this file only arranges them.

// Buildings in the hero town. x/y are the pin anchor in the 1600×900 scene; zoom is where the camera flies on click.
export const buildings = [
  {
    id: 'tcs', name: 'TCS', when: '2016–19', place: 'Chennai · Stockholm', x: 250, y: 462,
    kicker: 'Chapter 1 · where it began',
    title: 'Twelve apps, one tracking tool, and a winter in Stockholm.',
    body: 'System Engineer at Tata Consultancy Services. Angular, Node, .NET Core and SQL Server, from schema to screen. Built a MEAN-stack tool used by more than a thousand colleagues, then ran a SAFe team on-site in Stockholm for H&M.',
    stats: [['12', 'full-stack apps'], ['1,000+', 'colleagues on my tool'], ['1', 'SAFe team, on-site in Stockholm']],
    notes: ['Star of the Month, a few times', 'On the Spot award, innovation'],
    go: ['Walk the full journey', '#journey'],
  },
  {
    id: 'fidelity', name: 'Fidelity', when: '2019–24', place: 'Chennai', x: 540, y: 410,
    kicker: 'Chapter 2 · the platform years',
    title: 'Turned one-off client work into platforms.',
    body: 'Lead Software Engineer on eMoney Advisor. Generic, reusable solutions replaced per-client custom work for clients such as Wells Fargo and PNC, which cut time-to-market by about 90%. Also: accessible report families, an AWS Lex + Kendra support bot, and tech talks to 100+ engineers.',
    stats: [['~90%', 'faster time-to-market'], ['12+', 'initiatives led'], ['3', 'Impact / Eureka awards']],
    notes: ['Promoted to Lead in Dec 2022', 'Tech talks to 100+ engineers'],
    go: ['Read what people said', '#words'],
  },
  {
    id: 'lab', name: 'Walmart · AI agents', when: '2025–now', place: 'Walmart', x: 830, y: 398,
    kicker: 'Walmart · the agent lab',
    title: 'Two agents, and the tooling around them.',
    body: 'The agents: Grid, a super agent that triages an incident right inside the Slack thread before an engineer joins, and Delegation Hub, so an agent can shop for you without your password. The tooling: tokenOs, a token-efficiency layer for AI coding assistants, and mimo, which turns a demonstration into a reusable skill.',
    stats: [['<5 min', 'to triage an incident'], ['~80%', 'fewer tokens'], ['Finalist', 'global hackathon 2026']],
    notes: ['Supervisor + 5 sub-agents, with memory', 'Policy as data, not code'],
    go: ['Walk into the lab', '#lab'],
  },
  {
    id: 'tower', name: 'Walmart · Identity', when: '2024–now', place: 'Walmart Global Tech', x: 1090, y: 130,
    kicker: 'Walmart · the tower with the lock',
    title: 'Keeping millions of customers signed in.',
    body: 'Staff Software Engineer at Walmart Global Tech. The identity platform behind sign-up, sign-in, two-factor, recovery and fraud-detection support, live in several countries and for partner brands. Chile went from zero to production in about three months.',
    stats: [['Staff', 'promoted Sep 2026'], ['~3 mo', 'Chile, zero to live'], ['1,000+', 'incidents a week, worked by a skill']],
    notes: ['Passwordless OTP + passkeys', 'Ship behind flags, keep a rollback'],
    go: ['Flip through the passport', '#passport'],
  },
  {
    id: 'press', name: 'Writing', when: '2026', place: 'Medium', x: 1305, y: 512,
    kicker: 'After the day job · the press',
    title: 'I write down what the agents taught me.',
    body: 'Essays on agents, retrieval, governance and what happens behind a model’s answers, published on Medium and in Level Up Coding and AI in Plain English.',
    stats: [['10', 'essays in 2026'], ['~9 min', 'average read'], ['3', 'publications']],
    notes: ['Loop Engineering', 'Agent Gateways'],
    go: ['Read the paper', '#writing'],
  },
  {
    id: 'home', name: 'After hours', when: 'nights', place: 'home, Bengaluru', x: 1478, y: 552,
    kicker: 'After hours · home',
    title: 'Things I build for fun, after the day job.',
    body: 'Travel Planner AI for itineraries and packing lists, Voice Wise AI for turning voice notes into action items, a real-time 3D shoe configurator, collaborative docs and a few more. Small, shipped, and mostly live.',
    stats: [['6', 'side projects'], ['5', 'live demos'], ['3', 'built on AI']],
    notes: ['Next.js · Convex · Clerk', 'Three.js · Valtio'],
    go: ['See the side projects', '#after-hours'],
  },
];

// The scroll-scrubbed story. [[text|doodle|tone]] marks a phrase that gets a hand-drawn mark.
export const story = 'I started at TCS {{tcs}} in 2016, shipping twelve full-stack apps and running a team [[on-site for H&M in Stockholm|under|sun]] {{hm}}{{sweden}}. Then five years at Fidelity {{fidelity}}, turning one-off client work into [[reusable platforms|circle]]. Today I keep [[millions of people signed in|hilite|sky]] at Walmart {{walmart}}. Somewhere along the way I started teaching software to do [[the parts of the job nobody wants|strike]], and it became [[my favourite part.|under|rose]]';

export const stickies = [
  { t: 'Staff Software Engineer, since Sep 2026.', s: 'promotion', c: 'sun', r: -5 },
  { t: 'Ten years shipping. Two of them teaching agents.', s: 'since 2016', c: 'rose', r: 4 },
  { t: 'Finalist, Walmart’s global tech hackathon.', s: 'tokenOs · 2026', c: 'sky', r: -2 },
];

// Highway milestones for the journey. km is just how far along the road the stone sits.
export const milestones = [
  { co: 'tcs', y: '2016', place: 'Chennai', t: 'Joined TCS', d: 'System Engineer. Twelve full-stack apps in three years, and a tool more than a thousand colleagues used.' },
  { co: 'hm', y: '2018', place: 'Stockholm', t: 'Scrum Master, on-site', d: 'Ran a SAFe team on-site for H&M, the client side said “delivers fast”.' },
  { co: 'fidelity', y: '2019', place: 'Chennai', t: 'Joined Fidelity', d: 'Third-party integrations into the eMoney Advisor platform.' },
  { co: 'fidelity', y: '2022', place: 'Chennai', t: 'Lead Software Engineer', d: 'Reusable client solutions, ~90% faster time-to-market.' },
  { co: 'walmart', y: '2024', place: 'Bengaluru', t: 'Joined Walmart', d: 'Accounts and identity, at platform scale.' },
  { co: 'walmart', y: '2025', place: 'Bengaluru', t: 'Built the triage agent', d: 'An hour of incident investigation, down to about three minutes.' },
  { co: 'walmart', y: '2026', place: 'Bengaluru', t: 'Chile goes live', d: 'Shipped from Bengaluru: a brand-new market on the identity platform in about three months.' },
  { co: 'walmart', y: '2026', place: 'Bengaluru', t: 'Hackathon finalist', d: 'tokenOs: a Rust binary that cuts ~80% of tokens on repeated tasks.' },
  { co: 'walmart', y: '2026', place: 'Bengaluru', t: 'Staff Software Engineer', d: 'You are here. The road keeps going.' },
];

// Vending-machine labels for the four agents.
export const snacks = {
  triage: { kind: 'agent', code: 'A1', name: 'Triage', flavour: '60 → 3 min', hue: 18, icon: 'siren' },
  delegate: { kind: 'agent', code: 'A2', name: 'Delegate', flavour: 'revoke anytime', hue: 200, icon: 'key' },
  tokens: { kind: 'tool', code: 'B1', name: 'tokenOs', flavour: '−80% tokens', hue: 45, icon: 'chip' },
  mimo: { kind: 'tool', code: 'B2', name: 'mimo', flavour: 'record once', hue: 280, icon: 'rec' },
};

export const mimoCase = {
  id: 'mimo', no: '04', when: 'Walmart · 2026', title: 'mimo: record a task once, your agent runs it forever',
  line: 'Writing the perfect prompt is often slower than doing the task. So mimo lets you show it instead.',
  problem: 'Teaching an agent a workflow meant writing long prompts that still missed the details you do without thinking.',
  role: 'I built it: a macOS-native recorder that captures clicks, keys, screenshots and your narration, transcribed on-device.',
  result: 'Your agent turns the recording into a SKILL.md you can read, review and approve. Approve once, run it forever.',
  stack: ['Swift', 'Accessibility API', 'On-device speech', 'Agent skills', 'MCP'],
};

// Tiffin tiers for the stack, top to bottom.
export const tiffin = [
  { g: 'ai', label: 'Agents & AI', note: 'the main course' },
  { g: 'fe', label: 'Frontend & motion', note: 'the sweet' },
  { g: 'be', label: 'Backend & languages', note: 'rice, every day' },
  { g: 'cloud', label: 'Cloud, data & shipping', note: 'the sabzi' },
  { g: 'sec', label: 'Security & identity', note: 'the pickle, a little goes far' },
];

export const botLines = [
  'psst. tap a building.',
  'I’m an incident-triage agent. Hardik built me.',
  'try night mode, top right ☾',
  'every building opens a chapter.',
  'the lab and the tower are both Walmart.',
];
