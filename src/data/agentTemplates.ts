export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: string; // lucide icon name
  category:
    | "healthcare"
    | "executive"
    | "marketing"
    | "operations"
    | "finance"
    | "research";
  defaultSkills: string[]; // skill IDs
  suggestedModel: string;
  tier: "starter" | "professional" | "advanced" | "enterprise";
  metrics: { label: string; value: string }[];
}

export const agentTemplates: AgentTemplate[] = [
  // ──────────────────────────────────────────────
  // Healthcare Agents
  // ──────────────────────────────────────────────
  {
    id: "front-desk-agent",
    name: "Front Desk Agent",
    description:
      "Handles incoming calls, scheduling, and patient inquiries around the clock.",
    longDescription:
      "Your always-on virtual receptionist that manages the full spectrum of front-desk operations. From triaging incoming calls and booking appointments to answering insurance questions and routing urgent requests, this agent ensures no patient interaction falls through the cracks. Deploys in minutes and integrates seamlessly with your existing PMS and EHR systems.",
    icon: "Phone",
    category: "healthcare",
    defaultSkills: [
      "appointment-scheduling",
      "insurance-verification",
      "patient-follow-up",
    ],
    suggestedModel: "OpenAI",
    tier: "starter",
    metrics: [
      { label: "Avg calls/day", value: "120" },
      { label: "Booking rate", value: "94%" },
      { label: "Wait time", value: "<10s" },
    ],
  },
  {
    id: "clinical-coordinator",
    name: "Clinical Coordinator",
    description:
      "Coordinates clinical workflows, documentation, and referral management.",
    longDescription:
      "An intelligent clinical operations partner that streamlines the documentation burden and keeps referral pipelines moving. This agent automates chart prep, generates clinical summaries, tracks pending referrals, and surfaces lab results that need physician attention. Designed for practices that want to give clinicians more face time with patients and less time on paperwork.",
    icon: "ClipboardList",
    category: "healthcare",
    defaultSkills: [
      "clinical-documentation",
      "referral-management",
      "lab-results-communication",
    ],
    suggestedModel: "Claude",
    tier: "professional",
    metrics: [
      { label: "Docs/day", value: "45" },
      { label: "Referral completion", value: "98%" },
      { label: "Turnaround", value: "2hrs" },
    ],
  },
  {
    id: "patient-outreach-agent",
    name: "Patient Outreach Agent",
    description:
      "Proactive patient communication, engagement, and retention campaigns.",
    longDescription:
      "A proactive engagement engine that reaches out to patients before they disengage. This agent handles appointment reminders, wellness check-ins, preventive care nudges, and re-engagement campaigns for lapsed patients. It dramatically reduces no-show rates while building stronger patient-provider relationships through consistent, personalized communication.",
    icon: "MessageSquareHeart",
    category: "healthcare",
    defaultSkills: ["patient-follow-up", "no-show-recovery", "rx-refill-coordination"],
    suggestedModel: "OpenAI",
    tier: "starter",
    metrics: [
      { label: "Outreach/day", value: "200" },
      { label: "Response rate", value: "78%" },
      { label: "No-show reduction", value: "40%" },
    ],
  },
  {
    id: "insurance-verifier",
    name: "Insurance Verifier",
    description:
      "Automated insurance eligibility verification and prior authorization processing.",
    longDescription:
      "Eliminates the tedious back-and-forth of insurance verification by automating eligibility checks, benefits breakdowns, and prior authorization submissions. This agent works across all major payers, flags coverage gaps before appointments, and tracks pre-auth status in real time. Practices using this agent see near-zero claim denials due to eligibility errors.",
    icon: "ShieldCheck",
    category: "healthcare",
    defaultSkills: [
      "insurance-verification",
      "pre-authorization-automation",
      "rx-refill-coordination",
    ],
    suggestedModel: "Gemini",
    tier: "professional",
    metrics: [
      { label: "Verifications/day", value: "150" },
      { label: "Accuracy", value: "99.2%" },
      { label: "Pre-auth approval", value: "91%" },
    ],
  },
  {
    id: "post-op-care-agent",
    name: "Post-Op Care Agent",
    description:
      "Post-surgical follow-up, recovery monitoring, and complication detection.",
    longDescription:
      "A dedicated recovery companion that monitors post-surgical patients through structured check-in protocols. This agent tracks pain levels, medication adherence, wound healing progress, and activity milestones, escalating to clinical staff when warning signs appear. It closes the gap between discharge and the first follow-up visit, catching complications early and improving surgical outcomes.",
    icon: "HeartPulse",
    category: "healthcare",
    defaultSkills: [
      "post-surgical-follow-up",
      "patient-follow-up",
      "clinical-documentation",
    ],
    suggestedModel: "Claude",
    tier: "advanced",
    metrics: [
      { label: "Check-ins/day", value: "80" },
      { label: "Recovery compliance", value: "96%" },
      { label: "Complication detection", value: "99%" },
    ],
  },

  // ──────────────────────────────────────────────
  // Executive Agents
  // ──────────────────────────────────────────────
  {
    id: "strategic-advisor",
    name: "Strategic Advisor",
    description:
      "CEO-level strategic planning, competitive analysis, and decision support.",
    longDescription:
      "A senior strategic partner that synthesizes market data, financial performance, and operational metrics into actionable executive insights. This agent builds decision frameworks, prepares board-ready presentations, and runs scenario analyses for major strategic initiatives. Think of it as a tireless chief of staff that ensures leadership always has the data-driven context they need.",
    icon: "Compass",
    category: "executive",
    defaultSkills: ["ceo", "researcher", "coo"],
    suggestedModel: "Claude",
    tier: "enterprise",
    metrics: [
      { label: "Strategic plans", value: "12/mo" },
      { label: "Decision frameworks", value: "30+" },
      { label: "Board decks", value: "4/quarter" },
    ],
  },
  {
    id: "ai-strategy-director",
    name: "AI Strategy Director",
    description:
      "CAIO-level AI implementation guidance, roadmapping, and vendor evaluation.",
    longDescription:
      "Your in-house AI transformation expert that evaluates emerging technologies, builds implementation roadmaps, and quantifies ROI for AI initiatives. This agent conducts readiness assessments, benchmarks vendor solutions, and develops governance frameworks tailored to your organization. Ideal for companies navigating the complexity of enterprise AI adoption without a full-time Chief AI Officer.",
    icon: "BrainCircuit",
    category: "executive",
    defaultSkills: ["caio", "cio", "researcher"],
    suggestedModel: "Claude",
    tier: "enterprise",
    metrics: [
      { label: "AI assessments", value: "8/mo" },
      { label: "ROI models", value: "15+" },
      { label: "Vendor evals", value: "20+" },
    ],
  },

  // ──────────────────────────────────────────────
  // Marketing & Content Agents
  // ──────────────────────────────────────────────
  {
    id: "content-engine",
    name: "Content Engine",
    description:
      "Full-service content creation across articles, social media, and email campaigns.",
    longDescription:
      "A high-output content production system that generates blog posts, social media content, email sequences, and marketing collateral at scale. This agent maintains your brand voice across every channel, optimizes content for SEO and engagement, and adapts messaging for different audience segments. It turns your content calendar from aspirational to fully executed.",
    icon: "PenTool",
    category: "marketing",
    defaultSkills: ["professional-copywriter", "cmo", "researcher"],
    suggestedModel: "OpenAI",
    tier: "starter",
    metrics: [
      { label: "Articles/week", value: "10" },
      { label: "Social posts", value: "30/day" },
      { label: "Email campaigns", value: "5/week" },
    ],
  },
  {
    id: "marketing-strategist",
    name: "Marketing Strategist",
    description:
      "Campaign planning, audience targeting, and marketing performance optimization.",
    longDescription:
      "A data-driven marketing strategist that designs multi-channel campaigns, identifies high-value audience segments, and continuously optimizes spend allocation. This agent analyzes conversion funnels, A/B test results, and competitive positioning to recommend strategies that lower customer acquisition costs and accelerate pipeline growth. It brings CMO-caliber thinking to every campaign decision.",
    icon: "Target",
    category: "marketing",
    defaultSkills: ["cmo", "professional-copywriter", "researcher"],
    suggestedModel: "Claude",
    tier: "professional",
    metrics: [
      { label: "Campaigns/mo", value: "8" },
      { label: "CAC reduction", value: "35%" },
      { label: "Lead gen", value: "200%" },
    ],
  },
  {
    id: "grant-writing-specialist",
    name: "Grant Writing Specialist",
    description:
      "End-to-end grant application preparation, from research to final submission.",
    longDescription:
      "A specialized grant professional that handles the complete lifecycle of funding applications. This agent identifies relevant funding opportunities, drafts compelling narratives aligned with funder priorities, assembles budget justifications, and manages submission timelines. Organizations using this agent consistently outperform industry-average win rates while reducing the internal burden of proposal development.",
    icon: "Award",
    category: "marketing",
    defaultSkills: ["grant-writer", "researcher", "cfo"],
    suggestedModel: "Claude",
    tier: "advanced",
    metrics: [
      { label: "Proposals/mo", value: "4" },
      { label: "Win rate", value: "42%" },
      { label: "Avg award", value: "$250K" },
    ],
  },

  // ──────────────────────────────────────────────
  // Finance Agents
  // ──────────────────────────────────────────────
  {
    id: "financial-analyst",
    name: "Financial Analyst",
    description:
      "Financial planning, forecasting, and cost optimization analysis.",
    longDescription:
      "A precision-driven financial analyst that generates detailed reports, builds dynamic forecast models, and uncovers cost-saving opportunities across your organization. This agent tracks KPIs against benchmarks, prepares variance analyses, and models the financial impact of strategic decisions. It gives finance teams the bandwidth to focus on high-judgment work instead of routine number-crunching.",
    icon: "TrendingUp",
    category: "finance",
    defaultSkills: ["cfo", "researcher", "coo"],
    suggestedModel: "Gemini",
    tier: "professional",
    metrics: [
      { label: "Reports/week", value: "5" },
      { label: "Forecast accuracy", value: "97%" },
      { label: "Cost savings", value: "18%" },
    ],
  },

  // ──────────────────────────────────────────────
  // Operations Agents
  // ──────────────────────────────────────────────
  {
    id: "operations-manager",
    name: "Operations Manager",
    description:
      "Process optimization, workflow automation, and operational efficiency.",
    longDescription:
      "A systematic operations partner that maps existing processes, identifies bottlenecks, and designs optimized workflows. This agent creates standard operating procedures, tracks operational KPIs, and recommends automation opportunities that deliver measurable efficiency gains. It brings the rigor of management consulting to day-to-day operational improvements.",
    icon: "Settings",
    category: "operations",
    defaultSkills: ["coo", "cio", "chro"],
    suggestedModel: "Claude",
    tier: "professional",
    metrics: [
      { label: "Processes optimized", value: "25" },
      { label: "Efficiency gain", value: "40%" },
      { label: "SOP docs", value: "50+" },
    ],
  },
  {
    id: "hr-coordinator",
    name: "HR Coordinator",
    description:
      "Talent acquisition support, employee engagement, and HR operations.",
    longDescription:
      "A versatile HR operations agent that streamlines recruiting workflows, automates onboarding sequences, and monitors employee engagement signals. This agent drafts job descriptions, screens candidate profiles, generates offer letters, and builds training materials, freeing your people team to focus on culture and strategic talent initiatives rather than administrative overhead.",
    icon: "Users",
    category: "operations",
    defaultSkills: ["chro", "coo", "professional-copywriter"],
    suggestedModel: "OpenAI",
    tier: "starter",
    metrics: [
      { label: "Hires supported", value: "15/mo" },
      { label: "Retention", value: "+22%" },
      { label: "Onboarding time", value: "-50%" },
    ],
  },
  {
    id: "it-strategist",
    name: "IT Strategist",
    description:
      "Technology planning, infrastructure assessment, and digital transformation.",
    longDescription:
      "A forward-looking technology advisor that evaluates your current infrastructure, identifies modernization opportunities, and builds migration roadmaps. This agent conducts security posture assessments, benchmarks technology costs against industry standards, and creates implementation plans for cloud migrations, system integrations, and platform upgrades. Essential for organizations navigating complex technology decisions.",
    icon: "Server",
    category: "operations",
    defaultSkills: ["cio", "caio", "coo"],
    suggestedModel: "Claude",
    tier: "advanced",
    metrics: [
      { label: "Tech assessments", value: "10/mo" },
      { label: "Migration plans", value: "3/quarter" },
      { label: "Cost optimization", value: "25%" },
    ],
  },

  // ──────────────────────────────────────────────
  // Research Agents
  // ──────────────────────────────────────────────
  {
    id: "research-analyst",
    name: "Research Analyst",
    description:
      "Deep research, data synthesis, and comprehensive analytical reporting.",
    longDescription:
      "A meticulous research powerhouse that dives deep into complex topics, synthesizes information from hundreds of sources, and distills findings into clear, actionable reports. This agent handles literature reviews, data analysis, trend identification, and evidence-based recommendations. It delivers the depth of a dedicated research team with the speed and consistency of intelligent automation.",
    icon: "Search",
    category: "research",
    defaultSkills: ["researcher", "caio", "cfo"],
    suggestedModel: "Claude",
    tier: "professional",
    metrics: [
      { label: "Reports/week", value: "8" },
      { label: "Sources analyzed", value: "500+" },
      { label: "Insights/report", value: "15+" },
    ],
  },
  {
    id: "market-intelligence-agent",
    name: "Market Intelligence Agent",
    description:
      "Competitive monitoring, market analysis, and emerging trend detection.",
    longDescription:
      "A vigilant market intelligence system that continuously tracks competitor movements, industry shifts, and emerging trends that could impact your business. This agent monitors pricing changes, product launches, regulatory developments, and market sentiment, delivering timely alerts and periodic strategic briefings. It ensures your leadership team is never blindsided by market dynamics.",
    icon: "Radar",
    category: "research",
    defaultSkills: ["researcher", "cmo", "ceo"],
    suggestedModel: "Gemini",
    tier: "advanced",
    metrics: [
      { label: "Competitors tracked", value: "25" },
      { label: "Market reports", value: "4/mo" },
      { label: "Trend alerts", value: "daily" },
    ],
  },
];
