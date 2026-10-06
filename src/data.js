// Single source of truth for everything the site renders.
// Edit here; the markup is generated from it.

export const identity = {
  name: 'Hardik Verma',
  role: 'Staff Software Engineer',
  company: 'Walmart Global Tech',
  location: 'Bengaluru, India',
  tz: 'Asia/Kolkata',
  since: 2016,
  email: 'hardikverma22@gmail.com',
  links: {
    linkedin: 'https://www.linkedin.com/in/hardikverma22/',
    github: 'https://github.com/hardikverma22',
    medium: 'https://medium.com/@hardikverma22',
  },
  availability: 'Always up for a conversation about AI agents, what they can do today, and what we should let them do tomorrow',
};

export const impact = [
  { k: '60 → 3 min', big: true, v: 'Incident investigation, by hand vs. with the triage agent', r: 'About 60 minutes to find and correlate information across many sources and reach a decision, down to about 3 minutes when the agent does it with its memory and context.', d: '2025', go: ['See the triage agent', '#case-triage'] },
  { k: '~80%', big: true, v: 'Fewer tokens on tasks developers repeat', r: 'Tokens spent on tasks a developer repeats every day, measured with and without tokenOs. Global hackathon finalist.', d: '2026', go: ['See tokenOs', '#case-tokens'] },
  { k: '3', v: 'Countries with identity platforms I built and launched', r: 'Sign-in and account security for millions of users.', d: '2024–26', countries: ['Chile', 'Mexico', 'Canada'], link: '#engineering' },
  { k: '10 yrs', v: 'From enterprise apps to AI agents', r: 'TCS, Fidelity, Walmart. Promoted to Staff Software Engineer in Sep 2026.', d: '2016–26', go: ['See the timeline', '#log'] },
];

export const triage = {
  incident: {
    id: 'INC-0417',
    sev: 'SEV-2',
    title: 'Spike in 5xx on OTP verification, one market',
    source: 'chat · ticketing · email → one pipeline',
  },
  agents: [
    {
      id: 'logs', name: 'Logs & traces', mcp: 'mcp://logs',
      lines: [
        'query error_rate{route="/otp/verify"} last 30m',
        '412 errors · 96% from one upstream',
        'trace 7f3a… → timeout at messaging client (2.8s)',
        'pattern matches 2 past incidents in KB',
      ],
    },
    {
      id: 'code', name: 'Code search', mcp: 'mcp://code',
      lines: [
        'grep retry policy in verification client',
        'found: retries=0 since last config change',
        'diff touches timeout + retry defaults',
      ],
    },
    {
      id: 'browser', name: 'Browser repro', mcp: 'mcp://playwright',
      lines: [
        'launch → sign-in → request OTP',
        'OTP sent ✓ · verify → 504 after 3.0s',
        'screenshot + HAR attached',
      ],
    },
    {
      id: 'health', name: 'Service health', mcp: 'mcp://health',
      lines: [
        'messaging upstream p99: 2.9s (baseline 0.4s)',
        'pods healthy · no deploys in window',
        'upstream degraded, our timeout too tight',
      ],
    },
    {
      id: 'comms', name: 'Stakeholder updates', mcp: 'mcp://comms',
      lines: [
        'drafted status update for incident channel',
        'awaiting human approval before send',
      ],
    },
  ],
  verdict:
    'Root cause: upstream messaging latency + a config change that removed retries. Suggested fix: restore retry policy (2×, jittered) and raise client timeout to 4s behind a flag.',
};

export const delegate = {
  tools: [
    { id: 'search', label: 'search_products', risk: 'low' },
    { id: 'cart', label: 'add_to_cart', risk: 'low' },
    { id: 'order', label: 'place_order', risk: 'high' },
  ],
  categories: ['Electronics', 'Alcohol', 'Gift cards', 'Groceries'],
  layers: ['Agent identity', 'User consent', 'Token exchange', 'Tool scope', 'Payload rules'],
  script: [
    { tool: 'search', say: 'Find a 2L stainless steel water bottle', amount: 0, cat: 'Groceries' },
    { tool: 'cart', say: 'Add bottle to cart', amount: 24, cat: 'Groceries' },
    { tool: 'cart', say: 'Add noise-cancelling headphones', amount: 180, cat: 'Electronics' },
    { tool: 'cart', say: 'Add $100 gift card', amount: 100, cat: 'Gift cards' },
    { tool: 'order', say: 'Place the order', amount: 24, cat: 'Groceries' },
  ],
};

export const caseStudies = [
  {
    id: 'triage',
    no: '01',
    when: 'Walmart · 2025',
    title: 'Multi-agent incident triage',
    line: 'An on-call assistant that investigates production incidents the way a senior engineer would.',
    problem: 'On-call engineers spent about an hour per incident moving between logs, code, dashboards and chat before they could even propose a fix.',
    role: 'I built it, including the log and trace MCP server, written from scratch.',
    points: [
      'A supervisor turns an incident into a plan and dispatches specialised sub-agents in parallel.',
      'Each sub-agent talks to its own MCP server.',
      'Grounded in past incidents and runbooks, so it does not hallucinate on rare failures.',
      'A human-in-the-loop UI streams every step; engineers approve, redirect or take over.',
    ],
    result: 'Manual investigation dropped from about an hour to a few minutes. Demoed to senior leadership.',
    stack: ['Python', 'LangGraph', 'FastAPI', 'MCP', 'Vector search', 'Playwright', 'React'],
  },
  {
    id: 'delegate',
    no: '02',
    when: 'Walmart · 2026',
    title: 'Delegated access for AI agents',
    line: 'A trust layer that lets you give an AI agent scoped, instantly revocable permission to act for you.',
    problem: 'Giving an agent your credentials is unsafe. Giving it nothing makes it useless.',
    role: 'I built the gateway, the token-exchange flow and the approval graph.',
    points: [
      'RFC 8693 token exchange (subject, actor and delegated tokens), so the agent never holds your credential.',
      'Spend caps, blocked categories and per-tool consent, enforced by a gateway on every request.',
      'Revocation is one switch: the next exchange fails and the agent is cut off.',
      'Risky actions need a human approval enforced in the graph, which the model cannot bypass. A2UI and A2A are integrated.',
    ],
    result: 'Policy lives as data (CEL), not code. Written up as “Agent Gateways and the Missing Governance Layer”.',
    stack: ['Python', 'LangGraph', 'MCP', 'OAuth 2.0', 'RFC 8693', 'CEL', 'A2UI', 'React'],
  },
  {
    id: 'tokens',
    no: '03',
    when: 'Walmart · 2026 hackathon',
    title: 'tokenOs: a token-efficiency layer for AI coding assistants',
    line: 'A layer that compresses, routes and explains what goes into an LLM’s context before every call.',
    problem: 'Coding assistants spend much of their context window on duplicate, irrelevant and noisy input, which costs tokens and hurts answers.',
    role: 'I built it in hack week as a single Rust binary, then published it internally as a plugin.',
    points: [
      'Ships as an MCP server, a CLI and editor hooks.',
      'Dedupes, summarises and routes context, and shows you exactly what was cut and why.',
    ],
    result: 'About 80% fewer tokens on tasks developers repeat. Finalist out of thousands of entries in a company-wide global hackathon (2026).',
    stack: ['Rust', 'MCP', 'CLI', 'Editor hooks'],
  },
];

export const skillsBuilt = [
  ['Skill miner', 'Scans session history across AI tools, finds the workflows you keep repeating, and offers to turn them into reusable skills.'],
  ['Headless scheduler', 'Runs any agent skill on a schedule with no open session. launchd-based, survives reboots.'],
  ['PR analytics', 'DORA benchmarks, cycle-time breakdowns and per-developer coaching notes, generated on demand.'],
  ['Parallel-agent pipeline', 'A spreadsheet of support cases in, validated ready-to-run fixes out, one agent per case, in parallel.'],
];

export const engineering = [
  ['One verification component for every market', 'Replaced per-market implementations with a shared phone-verification wrapper, the foundation for every later verification feature.', 'Mobile verification with phone step-up, reused across Canada, Mexico and the unified profile; legacy migrated with zero regressions.'],
  ['Closing a security gap nobody owned', 'Enforced password policy on the server, not just the UI.', 'Picked it up after a security flag, aligned two orgs, shipped in two staged phases, config-driven for every market.'],
  ['Checkout verification, de-risked', 'Caught a config risk that would have silently switched off a mandatory checkout step during rollout.', 'End-to-end validation of every journey and a clear reuse path to the shared component.'],
  ['Passkeys for third-party clients', 'Brought passkey sign-in to third-party client flows.', 'Account page and side-panel work for passkey registration and authentication.'],
  ['Reliability by default', 'Raised the quality bar across several backend modules.', 'Expanded automated tests and found critical gaps before production did.'],
  ['Leading across three countries', 'Kept a team across Mexico, India and the US moving in one direction.', 'Design docs, cross-team execution plans and a recurring cross-timezone sync.'],
];

// Countries on the identity map. lat/lon place the pin; ox nudges stacked pins.
export const markets = [
  { id: 'cl', country: 'Chile', name: 'Chile', lat: -33.45, lon: -70.67, when: 'Feb–Apr 2026', title: 'Zero to production in ~3 months',
    line: 'Launched identity for a brand-new market with passwordless sign-in, without a single regression in the path every other market depends on.',
    did: ['Email/phone OTP sign-in with user choice', 'Found the hidden blocker, a missing national-ID field, that stopped every Chilean sign-up', 'Flags, gated rollout, 98% coverage on new code, clean canary'] },
  { id: 'mx', country: 'Mexico', name: 'Mexico', lat: 19.43, lon: -99.13, ox: -9, when: '2024–26', title: 'Two storefronts, one platform',
    line: 'Helped unify two storefronts into one omnichannel platform serving millions, with the account and profile domain validated before every ramp.',
    did: ['Owned profile-domain integration, traffic segmentation and the monitoring dashboard', 'Caught a critical preference bug during early ramp', 'Privacy-first suggested phone numbers across sign-in, account and post-order'] },
  { id: 'sams', country: 'Mexico', name: 'Sam\u2019s Club Mexico', lat: 19.43, lon: -99.13, ox: 9, when: 'Apr 2026 – now', title: 'A new brand, built from scratch',
    line: 'Leading identity onboarding for a separate brand with its own tenant, where every layer had to be set up independently.',
    did: ['Ran the full discovery first', 'Routing, tenant config, client registration and messaging across seven-plus services', 'Traced production auth failures across services to unblock launch'] },
  { id: 'ca', country: 'Canada', name: 'Canada', lat: 43.65, lon: -79.38, when: '2024–25', title: 'Safe rollouts, measured from day one',
    line: 'Card-security validation to 100% of Canadian traffic with zero rollbacks, and analytics the business could trust from day one.',
    did: ['Progressive ramp with monitoring and rollback playbooks at every stage', 'End-to-end event tracking across the identity flow', 'First home of the shared verification component'] },
];
export const origin = { name: 'Bengaluru', lat: 12.97, lon: 77.59 };

export const principles = [
  ['Discovery first', 'Map dependencies and risks before writing code.'],
  ['Ship behind flags', 'Ramp gradually. Watch production. Keep a rollback ready.'],
  ['Own the unassigned', 'Security gaps, config risks, analytics holes, someone has to.'],
  ['Align across time zones', 'Three countries, one direction.'],
  ['Zero-regression bar', 'High coverage, canaries, migrations nobody notices.'],
];

// Git-log timeline. lane: 0 = education, 1 = TCS, 2 = Fidelity, 3 = Walmart, 4 = personal
export const lanes = [
  { name: 'school', color: '#8a93a3' },
  { name: 'tcs', color: '#c9b6ff', parent: 0 },
  { name: 'fidelity', color: '#6ad19a', parent: 1 },
  { name: 'walmart', color: '#7fb2ff', parent: 2 },
  { name: 'personal', color: '#f5c451', parent: 2 },
];
export const commits = [
  { lane: 3, date: 'Sep 2026', msg: 'release: promoted to Staff Software Engineer', tag: 'v-staff', body: 'Recognising the market launches, identity platform foundations and the self-driven AI track.' },
  { lane: 4, date: 'Jul 2026', msg: 'docs(medium): Loop Engineering + four more essays', body: 'Agents, retrieval, governance and interpretability, five essays in 2026.' },
  { lane: 3, date: 'Jun 2026', msg: 'feat(ai): token-efficiency runtime, hackathon finalist', body: 'tokenOs: a single Rust binary built in hack week; ~80% fewer tokens on repeated tasks.' },
  { lane: 3, date: '2026', msg: 'feat(mimo): record a task once, your agent runs it forever', body: 'A local-first skill recorder for macOS. Show the workflow, review the skill, reuse it.' },
  { lane: 3, date: 'May 2026', msg: 'feat(agents): delegated access with RFC 8693', body: 'User-granted, revocable agent permissions, end to end.' },
  { lane: 4, date: '2026', msg: 'wip(nailoria): on-device nail try-on + booking', body: 'Hand tracking and a custom segmentation model in the browser; a full booking platform for one real studio.' },
  { lane: 3, date: 'Feb 2026', msg: 'feat(cl): Chile launch, passwordless sign-in', body: 'National-ID support, routing migration, launch.' },
  { lane: 3, date: 'Aug 2025', msg: 'feat(agents): multi-agent incident triage', body: 'Supervisor + specialised sub-agents; an hour of triage down to minutes.' },
  { lane: 3, date: 'Jul 2024', msg: 'init: join Walmart Global Tech', body: 'Senior Software Engineer, International Profile team.' },
  { lane: 4, date: 'Mar 2024', msg: 'feat: Voice Wise AI, voice notes to action items', body: 'Next.js, Whisper, Together.ai, Convex.' },
  { lane: 4, date: 'Jan 2024', msg: 'feat: Travel Planner AI', body: 'Itineraries, packing lists and places to visit. Next.js, OpenAI, Convex, Clerk, Razorpay.' },
  { lane: 2, date: '2023', msg: 'award: Impact Award, fastest delivery of a top feature', body: 'Fidelity Investments.' },
  { lane: 4, date: 'May 2023', msg: 'feat: Shoe Forge, real-time 3D configurator', body: 'Three.js, React, Valtio.' },
  { lane: 4, date: 'Apr 2023', msg: 'feat: HDocs, collaborative documents', body: 'React, Quill, Firebase, AWS API Gateway.' },
  { lane: 2, date: 'Dec 2022', msg: 'release: Lead Software Engineer', tag: 'v-lead', body: 'Generic solutions that cut SDLC time-to-market ~90% for enterprise clients like Wells Fargo and PNC. 12+ initiatives led.' },
  { lane: 2, date: '2021', msg: 'award: Impact Award, building tech culture', body: 'Tech talks to 100+ engineers.' },
  { lane: 2, date: '2021', msg: 'feat: customer support bot on AWS Lex + Kendra', body: 'Answering support questions from the product\u2019s own documentation.' },
  { lane: 2, date: '2020', msg: 'feat: ADA-accessible report families · Eureka Award', body: 'Modernised the platform\u2019s report families and made them accessible.' },
  { lane: 2, date: 'Aug 2019', msg: 'init: join Fidelity Investments (eMoney Advisor)', body: 'Third-party integrations into a financial-planning platform.' },
  { lane: 1, date: '2019', msg: 'award: Star of the Month, multiple', body: 'Tata Consultancy Services.' },
  { lane: 1, date: '2018', msg: 'feat: Scrum Master, SAFe team, on-site in Stockholm', body: 'Represented the team for H&M. On the Spot awards for innovation.' },
  { lane: 1, date: '2017', msg: 'feat: MEAN tracking tool used by 1,000+ colleagues', body: '12 full-stack apps shipped with Angular, Node, .NET Core and SQL Server.' },
  { lane: 1, date: 'Aug 2016', msg: 'init: join Tata Consultancy Services', body: 'System Engineer, Chennai.' },
  { lane: 0, date: 'Jun 2016', msg: 'build: B.Tech, Computer Science & Technology', body: 'SRMS College of Engineering & Technology, Bareilly.' },
  { lane: 0, date: '2015', msg: 'feat: first internship, AngularJS, PHP, JSON', body: 'Experdel Software & Consulting.' },
  { lane: 0, date: '2014', msg: 'initial commit', body: 'Six weeks of Java in Bengaluru. It went from there.' },
];


export const projects = [
  { name: 'Nailoria', status: 'in progress', what: 'A nail studio\u2019s own app: try a design on your hand before you book, hand tracking and nail segmentation run entirely on the phone.', stack: 'Next.js · MediaPipe · ONNX Runtime Web · Convex · Razorpay', hue: 340 },
  { name: 'Travel Planner AI', alias: 'Rutugo', what: 'Itineraries, packing lists and places to visit, tailored by AI.', stack: 'Next.js · OpenAI · Convex · Clerk', code: 'https://github.com/hardikverma22/travel-planner-ai', live: 'https://travel-plannerai.vercel.app/', hue: 18 },
  { name: 'Voice Wise AI', what: 'Record a voice note; get transcript, summary and action items.', stack: 'Next.js · Whisper · Together.ai · Convex', code: 'https://github.com/hardikverma22/VoiceWiseAI', live: 'https://voice-wise-ai.vercel.app/', hue: 200 },
  { name: 'Shoe Forge', what: 'Real-time 3D shoe configurator for textures and colours.', stack: 'Three.js · React · Valtio · Framer Motion', code: 'https://github.com/hardikverma22/shoe-forge', live: 'https://hardikverma22.github.io/shoe-forge', hue: 140 },
  { name: 'HDocs', what: 'Create, edit and share documents collaboratively.', stack: 'React · Quill · Firebase · AWS API Gateway', code: 'https://github.com/hardikverma22/HDocs', live: 'https://hdocs.netlify.app/', hue: 260 },
  { name: 'Textop.AI', what: 'Sentiment, classification, keywords and summaries.', stack: 'React · OpenAI · AWS', code: 'https://github.com/hardikverma22/TextOp-AI', live: 'https://text-op-ai.vercel.app/', hue: 320 },
  { name: 'CodeMe', what: 'In-browser HTML/CSS/JS editor with resizable panels.', stack: 'React · CodeMirror · Tailwind', code: 'https://github.com/hardikverma22/Code-Me-with-tailwind-reziable-panels', live: 'https://hardikverma22.github.io/Code-Me-with-tailwind-reziable-panels/', hue: 48 },
];

export const writing = [
  { date: 'Sep 2026', tag: 'AI Agents', title: 'Sandbox Your AI Agent in 15 Minutes with Nvidia\u2019s OpenShell', url: 'https://levelup.gitconnected.com/sandbox-your-ai-agent-in-15-minutes-with-nvidias-openshell-9386e4fd9084', img: 'https://cdn-images-1.medium.com/max/1024/1*GNuYJWe9cFAtSliXnB-AFw.png' },
  { date: 'Sep 2026', tag: 'LLMs', title: 'AI Doesn\u2019t Always Need to Talk: A Practical Guide to Jev and System One Models', url: 'https://levelup.gitconnected.com/ai-doesnt-always-need-to-talk-a-practical-guide-to-jev-and-system-one-models-313e81131da2', img: 'https://cdn-images-1.medium.com/max/1024/1*Fwzdp08Zx1l1AHpwDWFP6Q.png' },
  { date: 'Sep 2026', tag: 'AI Architecture', title: 'What Happens When an AI Stops Thinking in Tokens?', url: 'https://levelup.gitconnected.com/what-happens-when-an-ai-stops-thinking-in-tokens-838f5efeb04c', img: 'https://cdn-images-1.medium.com/max/1024/1*nrbSfZjHgfGA188VOOo_OQ.png' },
  { date: 'Aug 2026', read: 10, tag: 'AI Agents', title: 'Stop Renaming Your Agent Architecture. Start Understanding It', url: 'https://ai.plainenglish.io/stop-renaming-your-agent-architecture-start-understanding-it-7600db0e70c3', img: 'https://cdn-images-1.medium.com/max/1024/1*xRiWvezPMwXp9w0ebfqLqA@2x.jpeg' },
  { date: 'Jul 2026', read: 7, tag: 'Agentic AI', title: 'The Ghost Layer, it\u2019s not in your repo, your standup, or your org chart', url: 'https://levelup.gitconnected.com/the-ghost-layer-its-not-in-your-repo-your-standup-or-your-org-chart-7d61efebc137', img: 'https://cdn-images-1.medium.com/max/1024/1*oiimA9wEqFZB3cHO0AoCdg@2x.jpeg' },
  { date: 'Jul 2026', read: 9, tag: 'Interpretability', title: 'Somewhere Behind Claude\u2019s Answers, There Is a Stage, and a Much Bigger Backstage', url: 'https://medium.com/@hardikverma22/somewhere-behind-claudes-answers-there-is-a-stage-and-a-much-bigger-backstage-16c916ba1343', img: 'https://cdn-images-1.medium.com/max/1024/1*MlsfiJGkFRdEKhFVtT8kMQ@2x.jpeg' },
  { date: 'Jul 2026', read: 8, tag: 'AI Agents', title: 'Loop Engineering: The Quiet Death of Prompting AI Agents', url: 'https://medium.com/@hardikverma22/loop-engineering-why-engineers-suddenly-stopped-prompting-their-ai-agents-cfa0da12e0cb', img: 'https://cdn-images-1.medium.com/max/1024/1*7Q9xkWp0MWPNwOGUX4lF3A.png' },
  { date: 'Jun 2026', read: 7, tag: 'AI Systems', title: 'I Tried to Build a Valuemaxxing Stack. Here\u2019s What I Learned.', url: 'https://medium.com/@hardikverma22/i-tried-to-build-a-valuemaxxing-stack-heres-what-i-learned-1dc364751c71', img: 'https://cdn-images-1.medium.com/max/1024/1*IFmJTeY08R5iwGyjsvNreA.png' },
  { date: 'May 2026', read: 9, tag: 'Governance', title: 'Agent Gateways and the Missing Governance Layer for AI Agents', url: 'https://medium.com/@hardikverma22/agent-gateways-and-the-missing-governance-layer-for-ai-agents-f3a4989b3e1d', img: 'https://cdn-images-1.medium.com/max/1024/1*tBrQB_-7BdW3pY2kuMWYQg.png' },
  { date: 'Mar 2026', read: 10, tag: 'Retrieval', title: 'From Vectors to Trees: The Future of Retrieval in LLMs', url: 'https://medium.com/@hardikverma22/from-vectors-to-trees-the-future-of-retrieval-in-llms-9567124626cd', img: 'https://cdn-images-1.medium.com/max/1024/1*c3NJqewAz-htsdJfYFfCSQ.png' },
];


export const testimonials = [
  { who: 'Siddharth Balekar', img: 'people/siddharth.jpg', role: 'Principal, Product Management · Fidelity Investments', q: 'Hardik is one of the most valuable people I have ever met. He always puts the team before him and truly embodies the agile model of working. He is observant, proactive, and goal-oriented.' },
  { who: 'Ashraf Habash', img: 'people/ashraf.jpg', role: 'Senior Product Manager · H&M', q: 'He was a quick learner and had a great knowledge in the system flow, the programming and architecture as well as the business processes. I highly recommend Hardik for roles where he will lead and coach other people.' },
  { who: 'Maja Ginsburg Duvstedt', img: 'people/maja.jpg', role: 'H&M', q: 'Hardik is very thorough, skilled and he has a way of understanding things quickly and therefore he delivers fast. He is also service-minded and a nice, cooperative team member!' },
  { who: 'Priyalakshumi P', img: 'people/priya.jpg', role: 'Software Engineer (MTS) · Salesforce', q: 'Hardik has a great technical expertise in designing scalable solutions. He is a passionate learner and incorporates his learnings in action to deliver finest results.' },
  { who: 'Harini Renganathan', img: 'people/harini.jpg', role: 'Product Owner', q: 'Hardik has clarity of thoughts and a super cool brain. His approach to a technical problem at work is very logical.' },
  { who: 'Fredrik Garinder', img: 'people/fredrik.jpg', role: 'Engineering Manager · H&M Group', q: 'If you are in search of a solid team player with focus on the task at hand you’ve found it.' },
  { who: 'Sanjana Ganguly', img: 'people/sanjana.jpg', role: 'Senior Software Engineer · Barclays', q: 'He consistently gives his 100 percent effort to the team. He has a knack for learning new technologies.' },
];

export const awards = [
  ['2026', 'Global tech hackathon finalist', 'Walmart'],
  ['2026', '“Making a Difference”, new market launch and AI initiatives', 'Walmart'],
  ['2025', '“Excellence”, platform migration, incident-triage agent, on-call', 'Walmart'],
  ['·', 'Peer badges: Impact Driver, Fire Fighter, Market Launch Champion, Learning Champion; Spotlight ×2', 'Walmart'],
  ['2023', 'Impact Award, fastest delivery of a top product feature', 'Fidelity'],
  ['2021', 'Impact Award, building tech culture', 'Fidelity'],
  ['2020', 'Eureka Award, innovative ideas', 'Fidelity'],
  ['2019', 'Star of the Month, multiple', 'TCS'],
  ['2018', 'On the Spot, innovation', 'TCS'],
];

export const certs = [
  'Certified SAFe® 5 Practitioner',
  'Applied AI for Real-World Applications, IIT',
  'IIT Techkriti, Cyber Forensics Workshop',
];

// The stack as a periodic table. g = group key (see toolboxGroups).
export const toolboxGroups = [
  ['ai', 'AI & agents', '#a78bfa'],
  ['fe', 'Frontend & motion', '#7fb2ff'],
  ['be', 'Backend & languages', '#6ad19a'],
  ['data', 'Data', '#f5c451'],
  ['cloud', 'Cloud & infra', '#5eead4'],
  ['sec', 'Security & identity', '#ff8b99'],
  ['ship', 'Shipping', '#c9b6ff'],
];
export const toolbox = [
  ['ai', 'Lg', 'LangGraph', 'Supervisor graphs for incident triage and delegated access'],
  ['ai', 'Mc', 'MCP', 'Wrote a log/trace MCP server from scratch; MCP everywhere since'],
  ['ai', 'Fa', 'FastAPI', 'The service layer under every agent I ship'],
  ['ai', 'Rg', 'RAG', 'Vector search over past incidents and runbooks'],
  ['ai', 'Cx', 'Context engineering', 'Token-efficiency runtime: ~80% fewer tokens on repeated tasks'],
  ['ai', 'Sk', 'Agent skills', 'mimo, skill miner, headless scheduler'],
  ['ai', 'A2', 'A2A · A2UI', 'Agent-to-agent calls and agents that drive native UI'],
  ['ai', 'Cl', 'Claude / OpenAI', 'Daily drivers, via API and coding agents'],
  ['ai', 'Wh', 'Whisper · Speech', 'Voice notes to action items; on-device transcription in mimo'],
  ['ai', 'Mp', 'MediaPipe · ONNX', 'On-device hand tracking and nail segmentation in Nailoria'],
  ['fe', 'Re', 'React', 'Ten years of interfaces, from Angular days to agent UIs'],
  ['fe', 'Nx', 'Next.js', 'Travel Planner, Voice Wise, Nailoria'],
  ['fe', 'Ts', 'TypeScript', 'The default'],
  ['fe', 'Ng', 'Angular', '12 full-stack apps at TCS'],
  ['fe', 'Tw', 'Tailwind', 'Every side project'],
  ['fe', 'Th', 'Three.js · WebGL', 'Shoe Forge, and this site\u2019s fluid and portrait shaders'],
  ['fe', 'Gs', 'GSAP · Motion', 'Scroll stories and micro-interactions'],
  ['be', 'Py', 'Python', 'Agents, evals and model training'],
  ['be', 'Rs', 'Rust', 'A single-binary token runtime, built in hack week'],
  ['be', 'No', 'Node.js', 'APIs and tooling since 2016'],
  ['be', 'Gq', 'GraphQL', 'Identity and profile APIs'],
  ['be', 'Kf', 'Kafka', 'Event-driven identity flows'],
  ['be', 'Cs', 'C# / .NET', 'Enterprise integrations at Fidelity'],
  ['data', 'Rd', 'Redis', 'Caching and sessions'],
  ['data', 'Sq', 'SQL Server', 'Financial-planning data at Fidelity'],
  ['data', 'Mg', 'MongoDB', 'The MEAN-stack years'],
  ['data', 'Cv', 'Convex', 'Realtime backend for side projects'],
  ['data', 'Fb', 'Firebase', 'HDocs collaboration'],
  ['cloud', 'Aw', 'AWS', 'Lambda, S3, SQS, Cognito, and a Lex + Kendra support bot'],
  ['cloud', 'Dk', 'Docker', 'Every service, every agent'],
  ['cloud', 'K8', 'Kubernetes', 'Running identity services at scale'],
  ['cloud', 'Gf', 'Grafana', 'Ramp dashboards and on-call'],
  ['sec', 'Oa', 'OAuth 2.0 · OIDC', 'Sign-in for millions of users'],
  ['sec', 'Tx', 'Token exchange', 'RFC 8693 so agents never hold your credential'],
  ['sec', 'Pk', 'Passkeys', 'Passwordless sign-in for third-party clients'],
  ['sec', 'Ce', 'CEL', 'Policy as data for agent gateways'],
  ['ship', 'Pw', 'Playwright', 'Browser repro agents and end-to-end tests'],
  ['ship', 'Ff', 'Feature flags', 'Ship dark, ramp gradually, watch production'],
  ['ship', 'Ci', 'CI/CD', 'Canaries and zero-regression migrations'],
  ['ship', 'Sf', 'SAFe', 'Certified practitioner; Scrum Master at TCS'],
];


// Where each element shows up (w = Walmart, f = Fidelity, t = TCS, p = personal) and what it pairs with.
export const toolboxWhere = [['w', 'Walmart'], ['f', 'Fidelity'], ['t', 'TCS'], ['p', 'Personal']];
export const toolboxMeta = {
  Lg: ['w', 'Mc Fa Rg Py'], Mc: ['w', 'Lg Cx Sk A2'], Fa: ['w', 'Py Lg'], Rg: ['w', 'Lg Cx'], Cx: ['w', 'Mc Rs Sk'],
  Sk: ['w', 'Mc Cl Cx'], A2: ['w', 'Lg Mc Tx'], Cl: ['wp', 'Sk Cx'], Wh: ['wp', 'Sk'], Mp: ['p', 'Nx'],
  Re: ['wfp', 'Ts Nx Fb'], Nx: ['p', 'Re Cv Ts'], Ts: ['wp', 'Re Nx No'], Ng: ['t', 'Re No Mg'], Tw: ['p', 'Re Nx'],
  Th: ['p', 'Gs Re'], Gs: ['p', 'Th'], Py: ['w', 'Fa Lg'], Rs: ['w', 'Cx'], No: ['tfw', 'Ng Gq Ts'],
  Gq: ['w', 'No Oa'], Kf: ['w', 'Gq'], Cs: ['f', 'Sq'], Rd: ['w', 'Oa'], Sq: ['f', 'Cs'],
  Mg: ['t', 'Ng No'], Cv: ['p', 'Nx'], Fb: ['p', 'Re'], Aw: ['fp', 'Dk'], Dk: ['w', 'K8'],
  K8: ['w', 'Dk Gf'], Gf: ['w', 'K8 Ff'], Oa: ['w', 'Tx Pk A2'], Tx: ['w', 'Oa Ce A2'], Pk: ['w', 'Oa'],
  Ce: ['w', 'Tx Lg'], Pw: ['w', 'Lg Ci'], Ff: ['w', 'Ci Gf'], Ci: ['w', 'Ff Pw'], Sf: ['t', ''],
};
