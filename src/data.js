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
  { k: '~90%', v: 'Faster time-to-market for enterprise client solutions', r: 'Generic, reusable solutions replaced per-client custom work at Fidelity, for clients such as Wells Fargo and PNC.', d: '2022–24', go: ['See the Fidelity years', '#engineering'], tab: 'fidelity' },
  { k: '4', v: 'Countries running the identity platform I help build', r: 'Sign-up, sign-in, two-factor, recovery and fraud-detection support for millions of customers, plus partner brands.', d: '2024–26', countries: ['Mexico', 'Chile', 'Canada', 'South Africa'], link: '#engineering' },
];

export const caseStudies = [
  {
    id: 'triage',
    alt: 'An incident lands, a supervisor wakes five specialist agents in parallel, their findings merge into one verdict, and an engineer approves. Manual triage takes about 60 minutes; the agents take about 3.',
    no: '01',
    when: 'Walmart · 2025',
    title: 'Multi-agent incident triage',
    line: 'An on-call assistant that investigates production incidents the way a senior engineer would.',
    problem: 'On-call engineers spent about an hour per incident moving between logs, code, dashboards and chat before they could even propose a fix.',
    role: 'I built it, including the log and trace MCP server, written from scratch.',
    result: 'Manual investigation dropped from about an hour to a few minutes. Demoed to senior leadership.',
    stack: ['Python', 'LangGraph', 'FastAPI', 'MCP', 'Vector search', 'Playwright', 'React'],
  },
  {
    id: 'delegate',
    alt: 'An agent works through a gateway with a delegated token. Allowed calls pass five checkpoints, over-limit and blocked-category calls are stopped, ordering waits for human approval, and revoking cuts the agent off.',
    no: '02',
    when: 'Walmart · 2026',
    title: 'Delegated access for AI agents',
    line: 'A trust layer that lets you give an AI agent scoped, instantly revocable permission to act for you.',
    problem: 'Giving an agent your credentials is unsafe. Giving it nothing makes it useless.',
    role: 'I built the gateway, the token-exchange flow and the approval graph.',
    result: 'Policy lives as data (CEL), not code. Written up as “Agent Gateways and the Missing Governance Layer”.',
    stack: ['Python', 'LangGraph', 'MCP', 'OAuth 2.0', 'RFC 8693', 'CEL', 'A2UI', 'React'],
  },
  {
    id: 'tokens',
    alt: 'A context window full of duplicate, verbose and irrelevant tokens is compressed from about 48,000 to under 10,000, each prompt is routed to the cheapest capable model, and every saving is recorded in a hash-chained ledger.',
    no: '03',
    when: 'Walmart · 2026 hackathon',
    title: 'tokenOs: a token-efficiency layer for AI coding assistants',
    line: 'A layer that compresses, routes and explains what goes into an LLM’s context before every call.',
    problem: 'Coding assistants spend much of their context window on duplicate, irrelevant and noisy input, which costs tokens and hurts answers.',
    role: 'I built it in hack week as a single Rust binary, then published it internally as a plugin.',
    result: 'About 80% fewer tokens on tasks developers repeat. Finalist out of thousands of entries in a company-wide global hackathon (2026).',
    stack: ['Rust', 'MCP', 'CLI', 'Editor hooks'],
  },
];

export const skillsBuilt = [
  ['Skill miner', 'Scans session history across AI tools, finds the workflows you keep repeating, and offers to turn them into reusable skills.'],
  ['Headless scheduler', 'Runs any agent skill on a schedule with no open session. launchd-based, survives reboots.'],
  ['PR analytics', 'DORA benchmarks, cycle-time breakdowns and per-developer coaching notes, generated on demand.'],
  ['Incident-to-fix pipeline', 'Works a ServiceNow queue end to end: a sub-agent per incident, a second wave to verify, a data lake check, a scripted fix, then an Excel report, a ServiceNow update over MCP and a stakeholder email through Microsoft Graph.'],
];

// Three chapters, newest first. Every chapter has 3 stats and 6 capability cards so the layout stays even.
export const careers = [
  {
    id: 'walmart', short: 'Walmart', name: 'Walmart Global Tech', color: '#7fb2ff',
    title: 'Staff Software Engineer', when: 'Jul 2024 to now', place: 'Bengaluru',
    headline: 'Accounts and identity, at platform scale',
    line: 'From the international profile and account platform to the identity platform behind sign-up, sign-in, two-factor, recovery and fraud-detection support, serving millions of customers in four countries and a growing list of partner brands.',
    stats: [['4', 'countries live'], ['1,000+', 'Canada incidents a week, worked through a skill I built'], ['3 months', 'from zero to production in Chile']],
    caps: [
      ['Identity platform', 'Sign-up, sign-in with passwordless OTP and passkeys, and account recovery, shared by every market and partner.'],
      ['Two-factor and fraud detection', 'One shared verification component and fraud-detection support built into the sign-up, sign-in and checkout flows.'],
      ['Identity for partners', 'Third-party brands, including a digital pharmacy, plug into the platform instead of building their own sign-in.'],
      ['Walmart Commerce Platform', 'Part of the initiative that unified code bases and databases across the international markets: credit cards, addresses, address unification and payment methods.'],
      ['Incident-to-fix pipeline', 'A skill I built that works a ServiceNow queue end to end: sub-agents analyze each incident, a second wave verifies them, the data lake confirms, and a script applies the fix. It then writes the Excel report, updates ServiceNow through MCP and emails the stakeholder.'],
      ['Launches that stay quiet', 'New markets go live behind flags with a rollback ready, without disturbing the markets already running.'],
    ],
  },
  {
    id: 'fidelity', short: 'Fidelity', name: 'Fidelity Investments', color: '#6ad19a',
    title: 'Lead Software Engineer', when: 'Aug 2019 to Jul 2024', place: 'Chennai',
    headline: 'Reusable platforms for enterprise clients',
    line: 'Cut time-to-market by about 90% for enterprise clients such as Wells Fargo and PNC by turning one-off client work into reusable platforms.',
    stats: [['~90%', 'lower SDLC time-to-market'], ['12+', 'initiatives led'], ['1,000+', 'customers a day on features I designed']],
    caps: [
      ['Reusable client solutions', 'Generic building blocks that replaced per-client custom work and cut time-to-market by about 90%.'],
      ['Third-party integrations', 'Multiple integrations into the eMoney Advisor financial-planning platform.'],
      ['Accessible reporting', 'Report families rebuilt with web components and documents, and made ADA compliant. Eureka Award, 2020.'],
      ['AI support bot', 'A bot on AWS Lex and Kendra that answers support questions from the product’s own documentation.'],
      ['Architecture and leadership', 'Designed product features used by 1,000+ customers a day and led 12+ initiatives as Lead Engineer.'],
      ['Mentoring', 'Tech talks to 100+ engineers. Impact Awards in 2021 for tech culture and 2023 for delivery speed.'],
    ],
  },
  {
    id: 'tcs', short: 'TCS', name: 'Tata Consultancy Services', color: '#c9b6ff',
    title: 'System Engineer', when: 'Aug 2016 to Aug 2019', place: 'Chennai',
    headline: 'Full-stack foundations',
    line: 'Shipped twelve full-stack applications in three years, built a tool a thousand colleagues used, and ran a SAFe team on-site in Stockholm.',
    stats: [['12', 'full-stack apps shipped'], ['1,000+', 'colleagues using the tracking tool'], ['3 yrs', 'from UI to SQL']],
    caps: [
      ['Full-stack delivery', 'Angular, Node, .NET Core and SQL Server, from schema to screen.'],
      ['Internal tracking tool', 'A MEAN-stack tool used by more than a thousand colleagues.'],
      ['Agile leadership', 'Scrum Master for a SAFe team, on-site in Stockholm for H&M.'],
      ['Client feedback', 'H&M product owners and managers described quick learning, thorough work and fast delivery.'],
      ['Recognition', 'Star of the Month several times, and an On the Spot award for innovation.'],
      ['Where it began', 'Six weeks of Java in 2014, then an internship in AngularJS, PHP and JSON.'],
    ],
  },
];

// Countries on the identity map. lat/lon place the pin; ox nudges stacked pins.
export const markets = [
  { id: 'cl', country: 'Chile', name: 'Chile', lat: -33.45, lon: -70.67, when: 'Feb–Apr 2026', title: 'A new country, live in about 3 months',
    line: 'Took identity for a brand-new market from zero to production, with passwordless sign-in, while every other market kept running on the same platform.',
    stats: [['~3 mo', 'zero to production'], ['0', 'regressions in other markets'], ['2', 'ways in: email or phone OTP']],
    shipped: ['Sign-up', 'Passwordless sign-in', 'National ID', 'Safe rollout'],
    did: ['A brand-new market stood up on the shared platform', 'Customers choose email or phone to sign in', 'Local requirements, such as national ID, handled inside the flow'] },
  { id: 'mx', country: 'Mexico', name: 'Mexico', lat: 19.43, lon: -99.13, ox: -9, when: '2024–26', title: 'Two storefronts, one platform',
    line: 'Helped merge two storefronts into one omnichannel platform serving millions of customers, with accounts and profiles ready before every traffic ramp.',
    stats: [['2 → 1', 'storefronts on one platform'], ['Millions', 'of customers served'], ['3', 'places phone suggestions appear']],
    shipped: ['Profile and accounts', 'Account unification', 'Sign-in', 'Phone suggestions', 'Monitoring', 'Safe rollout'],
    did: ['Owned the profile domain behind the unified storefront', 'Segmented traffic and built the dashboard that tracked every ramp', 'Privacy-first suggested phone numbers across sign-in, account and post-order'] },
  { id: 'sams', country: 'Mexico', name: 'Sam’s Club Mexico', lat: 19.43, lon: -99.13, ox: 9, when: 'Apr 2026 – now', title: 'A new brand, built from scratch',
    line: 'Leading identity for a separate brand with its own tenant, where every layer had to be stood up on its own.',
    stats: [['7+', 'services onboarded'], ['1', 'separate tenant, built from scratch'], ['Apr 2026', 'started, still in flight']],
    shipped: ['Tenant config', 'Routing', 'Client registration', 'Messaging', 'Discovery first'],
    did: ['Leading the onboarding end to end, starting with full discovery', 'Routing, tenant setup, client registration and messaging across the stack', 'Unblocked launch by tracing production auth failures across services'] },
  { id: 'ca', country: 'Canada', name: 'Canada', lat: 43.65, lon: -79.38, when: '2024 – now', title: 'On the commerce platform, then supporting it',
    line: 'Joined through the profile and account team on the Walmart Commerce Platform (WCP) initiative, which unified code bases and databases for the international markets and onboarded Canada. Now I support Canada from the identity side too.',
    stats: [['1,000+', 'incidents a week worked'], ['100%', 'card-security traffic, zero rollbacks'], ['WCP', 'one platform for all international clients']],
    shipped: ['Profile and accounts', 'Credit cards', 'Addresses', 'Payment methods', 'Customer data changes', 'Incident support'],
    did: ['WCP: one code base and one database model across the international clients', 'Address unification and payment-method work on the profile and account side', 'A skill I built works the incident queue, alongside customer data changes and everyday identity operations'] },
  { id: 'za', country: 'South Africa', name: 'South Africa', lat: -26.2, lon: 28.05, when: 'Walmart · Africa', title: 'The same platform, one more market',
    line: 'Sign-up, sign-in and account security delivered to another market from the shared identity platform.',
    stats: [],
    shipped: ['Sign-up', 'Sign-in', 'Two-factor', 'Recovery', 'Fraud checks'],
    did: ['Another market on the shared identity platform', 'Fraud-detection support in the same flows'] },
];
export const origin = { name: 'Bengaluru', lat: 12.97, lon: 77.59 };

export const principles = [
  ['Discovery first', 'Map dependencies and risks before writing code.'],
  ['Ship behind flags', 'Ramp gradually, watch production, keep a rollback ready. High coverage and canaries.'],
  ['Own the unassigned', 'Security gaps, config risks, accessibility debt, analytics holes. Someone has to.'],
  ['Build once, reuse everywhere', 'Shared components and generic solutions beat per-market and per-client rebuilds.'],
  ['Teach what you learn', 'Tech talks, walkthroughs and essays, so the whole team gets faster.'],
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
  { name: 'Voice Wise AI', what: 'Record a voice note; get transcript, summary and action items.', stack: 'Next.js · Whisper · Together.ai · Convex', code: 'https://github.com/hardikverma22/VoiceWiseAI', hue: 200 },
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

// tokenOs deep dive. Sample ledger entries use numbers from the benchmark runs; hashes are computed in the browser.
export const tokenos = {
  intro: {
    k: 'under the hood',
    t: 'Six things an agent could not ask for',
    d: 'A developer skims a table of contents, searches by meaning, and remembers last week. An AI agent had no way to do any of it, so these had to be built underneath the agent as primitives.',
    q: 'Under any token quota, waste is a throughput problem, not just a cost problem. Every token saved is a token spent on real work.',
  },
  axes: [
    { n: 'Axis 1', t: 'Fewer tokens per operation', d: '21 MCP tools: cached reads, ranked search, shell compression, persistent memory and a whole-codebase graph.', v: '50–99%', vl: 'fewer tokens per call' },
    { n: 'Axis 2', t: 'A cheaper model per turn', d: 'A local classifier routes every turn to Haiku, Sonnet or Opus, at zero API cost for the decision.', v: '−73%', vl: 'cost on the same workload' },
  ],
  axisNote: 'The two axes are independent, so the savings multiply instead of adding.',
  caps: [
    { id: 'read', c: '#7fb2ff', t: 'Selective reads', tool: 'ctx_read', human: 'A developer skims the table of contents, not the whole book.',
      body: '11 read modes built on tree-sitter: signatures only, a line range, the diff since the last read, one symbol, or the full file, cached after the first read.',
      bars: [['Signatures only', 2500, 80], ['Re-read, file unchanged', 2500, 13]], note: 'An agent that reads a file 10 times pays 2,617 tokens instead of 25,000.' },
    { id: 'search', c: '#a78bfa', t: 'Ranked search', tool: 'ctx_search', human: 'Search by meaning, instead of dumping every match.',
      body: 'BM25 keywords and semantic embeddings, fused with reciprocal rank fusion. Five ranked results, each with an exact file and line anchor.',
      bars: [['grep for a request handler', 3000, 200]], note: '93% fewer tokens, and the right code on top.' },
    { id: 'shell', c: '#f5c451', t: 'Shell compression', tool: 'ctx_shell', human: 'Pass or fail plus the failures, not 800 tokens of green dots.',
      body: '20 dedicated compressors for the noisiest commands: cargo, npm, git, kubectl, docker and terraform.',
      bars: [['cargo test', 800, 60]], note: '92% on cargo test, and 50–95% across commands.' },
    { id: 'graph', c: '#5eead4', t: 'Codebase graph', tool: 'ctx_graph_*', human: 'Ask what breaks if I change this, instead of reading the repo.',
      body: 'A queryable graph in SQLite: tree-sitter across about 14 languages, cross-file symbol resolution for 8, Leiden clustering and a Cypher engine. Twelve tools, including impact, dead code, trace and hot paths.',
      compare: [['“What calls charge_card?”', '15+ file reads'], ['with the graph', 'one query, ~50 tokens']] },
    { id: 'memory', c: '#6ad19a', t: 'Memory that survives', tool: 'ctx_session · ctx_knowledge', human: 'Agents forget everything when the context window runs out.',
      body: 'Two layers keep the agent warm after the window is exhausted.',
      layers: [['Short-term', 'The current task, findings, decisions and files. Survives restarts.'], ['Long-term', 'Conventions, gotchas and architecture decisions, with PII redaction and contradiction detection.']] },
    { id: 'route', c: '#ff8b99', t: 'Per-turn model routing', tool: 'per-turn router', human: 'A throwaway question should not cost what a refactor costs.',
      body: 'A local classifier picks the cheapest model that can do the turn well, and only switches when the savings beat the prompt cache the switch would throw away.',
      tiers: [['Haiku', 'qna_local · tooling'], ['Sonnet', 'code_write · code_review · devops'], ['Opus', 'code_refactor · debug · plan']] },
  ],
  bench: {
    title: 'Measured, not projected',
    sub: 'Same 21-prompt workload, Claude Sonnet 4.6, benchmarked on 11 June 2026.',
    groups: [
      ['MCP tools alone', [['Cost per session', '$1.347', '$0.963', 28.5, 0.715], ['Output tokens', '13,063', '9,106', 30.3, 0.697], ['Session time', '22m 40s', '16m 55s', 25.4, 0.746], ['Peak single call', '10,434 tokens', '90 tokens', 99.1, 0.02]]],
      ['With per-turn routing', [['Total cost', '$1.37', '$0.36', 73, 0.263]]],
    ],
  },
  ledger: {
    t: 'Receipts, not projections',
    d: 'Every saving is written to a SHA-256 hash-chained ledger: tool, baseline tokens, actual tokens, tokens saved, and a hash chained to the previous row. Alter any past entry and every later hash breaks. Judges at the hackathon ran the verify command, and the numbers held.',
    cmds: ['token-os ledger summary', 'token-os ledger verify', 'token-os ledger tail'],
    entries: [['ctx_read · signatures', 2500, 80], ['ctx_read · unchanged', 2500, 13], ['ctx_search', 3000, 200], ['ctx_shell · cargo test', 800, 60], ['ctx_read · peak call', 10434, 90]],
  },
  ships: ['Single Rust binary, ~35 MB', 'macOS and Linux', 'MCP over stdio', '21 tools', 'Background daemon keeps caches warm', '3D code graph UI', 'One-command plugin install', 'Hooks intercept native Read, Grep and Bash', '~140 tests, zero clippy warnings', 'p50 / p95 / p99 benchmarks'],
  tools: {
    core: ['ctx_read', 'ctx_search', 'ctx_shell', 'ctx_session', 'ctx_knowledge', 'ctx_metrics', 'ctx_ledger', 'ctx_tree', 'ctx_overview'],
    graph: ['ctx_graph_index', 'ctx_graph_query', 'ctx_graph_schema', 'ctx_semantic_search', 'ctx_impact', 'ctx_hotpath', 'ctx_dead_code', 'ctx_trace', 'ctx_traces', 'ctx_diff_query', 'ctx_tools_called', 'ctx_health'],
  },
};
