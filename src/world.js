// Copy for the Agent Town layer of the site. Facts come from data.js; this file only arranges them.

// Buildings in the hero town. x/y are the pin anchor in the 1600×900 scene; zoom is where the camera flies on click.
export const buildings = [
  {
    id: 'tcs', name: 'TCS', when: '2016–19', place: 'Chennai · Stockholm', x: 250, y: 462,
    kicker: 'Chapter 1 · my first job',
    role: 'System Engineer · TCS, working for H&M',
    title: 'TCS taught me to always add something extra.',
    paras: [
      'I learned everything from scratch here. For **H&M** I built **12 season-planning tools** from zero, used to plan sizes, prices and stock for the next season. Angular, .NET Core and SQL Server.',
      'I always looked for one extra thing to add. I learned the MEAN stack and built a tool to track those extras across the unit, and **10,000+ colleagues** ended up using it. Seeing people use something I built felt unreal.',
      'In **Stockholm** I learned that process matters as much as code, and that how people treat each other at work matters as much as skill.',
    ],
    stats: [['12', 'tools built for H&M'], ['10,000+', 'colleagues used my side tool'], ['Sweden', 'on-site with H&M']],
    notes: ['Star of the Month, a few times', 'Presented at large forums'],
    go: ['Walk the full journey', '#journey'],
  },
  {
    id: 'fidelity', name: 'Fidelity', when: '2019–24', place: 'Chennai', x: 560, y: 408,
    kicker: 'Chapter 2 · learning to lead',
    role: 'Lead Software Engineer · eMoney Advisor',
    title: 'Fidelity taught me what a team really is.',
    paras: [
      'I worked on **eMoney Advisor**, one of the best financial-advice platforms in the US. .NET APIs, and this is where I fell for **React and Next.js**.',
      'I became tech lead for **12 engineers**. We had each other’s backs, at work and outside it, and it never felt like pressure. A daily **15-minute call** to teach each other something new kept the whole team growing.',
    ],
    stats: [['12', 'engineers I led'], ['~90%', 'faster time-to-market with reusable platforms'], ['3', 'Impact / Eureka awards']],
    notes: ['Promoted to Lead, Dec 2022', 'Tech talks to 100+ engineers'],
    go: ['Read what people said', '#words'],
  },
  {
    id: 'lab', name: 'Walmart · AI agents', when: '2025–now', place: 'Walmart', x: 830, y: 444,
    kicker: 'Walmart · the agent lab',
    role: 'Staff Software Engineer · AI agents',
    title: 'Walmart made me an AI advocate.',
    paras: [
      'Walmart runs on a tech-driven, AI-first culture, with AI in front of customers too. I built **Grid**, a super agent that triages incidents right in the Slack thread, and **Delegation Hub**, so an agent can shop for you safely.',
      'I shipped features for Walmart’s super agents **Wibey** and **Code Puppy**, and built tools like **token-OS** and **mimo**. That work is a big reason I was **promoted to Staff**.',
    ],
    stats: [['<5 min', 'to triage an incident, was 60–90'], ['~80%', 'fewer tokens with token-OS'], ['Finalist', 'global tech hackathon 2026']],
    notes: ['Supervisor + 5 sub-agents, with memory', 'Presented at big forums'],
    go: ['Walk into the lab', '#lab'],
  },
  {
    id: 'tower', name: 'Walmart · Identity', when: '2024–now', place: 'Bengaluru', x: 1090, y: 204,
    kicker: 'Walmart · scale',
    role: 'Profile, then Identity · International',
    title: 'Walmart taught me what scale really means.',
    paras: [
      'I joined the **international profile team**: addresses, payment methods and everything in your account, across countries and brands, for **millions of customers**.',
      'Then **identity**: everything that keeps an account safe. Sign-up and sign-in, passwords and **passkeys**, phone collection and verification, **2FA and MFA**, a **risk engine** that spots fraud, and the **OIDC and OAuth** plumbing underneath. I saw how “customer first” turns into engineering choices.',
    ],
    stats: [['Millions', 'of customers signing in'], ['4', 'countries on the identity platform'], ['Staff', 'promoted Sep 2026']],
    notes: ['Passwordless OTP + passkeys', 'Ship behind flags, keep a rollback'],
    go: ['Flip through the passport', '#passport'],
  },
  {
    id: 'press', name: 'Writing', when: '2026', place: 'Medium', x: 1298, y: 522,
    kicker: 'After the day job · writing',
    role: 'Medium · Level Up Coding · AI in Plain English',
    title: 'Writing taught me to really understand things.',
    paras: [
      'I research a topic, try it myself, then write it down. If I can’t explain it simply, I don’t understand it yet.',
      'Every essay made me more confident, at work and outside it.',
    ],
    stats: [['10', 'essays in 2026'], ['~9 min', 'average read'], ['3', 'publications']],
    notes: ['Loop Engineering', 'Agent Gateways'],
    go: ['Read the paper', '#writing'],
  },
  {
    id: 'home', name: 'After hours', when: '', place: 'home, Bengaluru', x: 1466, y: 552,
    kicker: 'After hours · side projects',
    role: 'Travel Planner AI, now part of Rutugo',
    title: 'A side project taught me to ship like a founder.',
    paras: [
      'I built **Travel Planner AI** just to learn **Convex**, and became one of their early **Convex Champions**. It grew into a full SaaS: itineraries, weather, budgets, packing lists, expenses, collaborators and payments.',
      '**Rutugo acquired it**, then brought me in to build more, like finding the cheapest flight and hotel links. I learned and earned from the same project, and that still drives me.',
    ],
    stats: [['Acquired', 'by Rutugo'], ['Convex', 'Champion'], ['6', 'side projects shipped']],
    notes: ['Next.js · Convex · Clerk · Razorpay', 'AI tool calling'],
    links: [['rutugo.com', 'https://rutugo.com/'], ['Convex Champions', 'https://www.convex.dev/champions']],
    go: ['See the side projects', '#after-hours'],
  },
];

// The scroll-scrubbed story. [[text|doodle|tone]] marks a phrase that gets a hand-drawn mark.
export const story = 'I started at TCS {{tcs}} in 2016, building tools for H&M {{hm}} and spending time [[on-site in Stockholm|under|sun]] {{sweden}}. At Fidelity {{fidelity}} I became a tech lead and learned [[what a team really is|circle]]. Today at Walmart {{walmart}} I keep [[millions of customers signed in|hilite|sky]] and build agents that do [[the parts of the job nobody wants|strike]]. On the side, one of my projects [[got acquired.|under|rose]]';

export const stickies = [
  { t: 'Staff Software Engineer, since Sep 2026.', s: 'promotion', c: 'sun', r: -5 },
  { t: 'Ten years shipping. Two of them teaching agents.', s: 'since 2016', c: 'rose', r: 4 },
  { t: 'Finalist, Walmart’s global tech hackathon.', s: 'token-OS · 2026', c: 'sky', r: -2 },
];

// Highway milestones for the journey. km is just how far along the road the stone sits.
export const milestones = [
  { co: 'tcs', y: '2016', place: 'Chennai', t: 'Joined TCS', d: 'First job. Built 12 season-planning tools for H&M from scratch, and a side tool 10,000+ colleagues used.' },
  { co: 'hm', y: '2018', place: 'Stockholm', t: 'On-site for H&M', d: 'Learned that process and people matter as much as code.' },
  { co: 'fidelity', y: '2019', place: 'Chennai', t: 'Joined Fidelity', d: 'Building for eMoney Advisor. Fell for React and Next.js.' },
  { co: 'fidelity', y: '2022', place: 'Chennai', t: 'Tech lead', d: 'Led 12 engineers. Reusable platforms, ~90% faster time-to-market.' },
  { co: 'home', y: '2024', place: 'Chennai', t: 'Travel Planner AI', d: 'Built it to learn Convex, became a Convex Champion. Later acquired by Rutugo.' },
  { co: 'walmart', y: '2024', place: 'Bengaluru', t: 'Joined Walmart', d: 'Profile and payments, then identity: sign-in, passkeys, MFA and fraud checks for millions of customers.' },
  { co: 'walmart', y: '2025', place: 'Bengaluru', t: 'Built Grid', d: 'A super agent that triages incidents in Slack. 60–90 minutes down to under 5.' },
  { co: 'walmart', y: '2026', place: 'Bengaluru', t: 'Hackathon finalist', d: 'token-OS cuts ~80% of tokens on repeated tasks.' },
  { co: 'walmart', y: '2026', place: 'Bengaluru', t: 'Staff Software Engineer', d: 'Promoted for my work on AI. The road keeps going.' },
];

// Vending-machine labels for the four agents.
export const snacks = {
  triage: { kind: 'agent', code: 'A1', name: 'Triage', flavour: '60 → 3 min', hue: 18, icon: 'siren' },
  delegate: { kind: 'agent', code: 'A2', name: 'Delegate', flavour: 'revoke anytime', hue: 200, icon: 'key' },
  tokens: { kind: 'tool', code: 'B1', name: 'token-OS', flavour: '−80% tokens', hue: 45, icon: 'chip' },
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
