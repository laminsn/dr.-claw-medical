export interface SkillCapability {
  name: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  shortName: string;
  category: "executive" | "marketing" | "finance" | "research" | "healthcare" | "operations";
  icon: string;
  description: string;
  longDescription: string;
  capabilities: SkillCapability[];
  useCases: string[];
  tier: "starter" | "professional" | "advanced" | "enterprise";
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const skillCategories: SkillCategory[] = [
  {
    id: "executive",
    name: "C-Suite & Executive",
    description:
      "AI-powered executive leadership agents that drive strategic decision-making, operational excellence, and organizational growth.",
    icon: "Crown",
  },
  {
    id: "marketing",
    name: "Marketing & Content",
    description:
      "Specialized content creation and marketing strategy agents that craft compelling narratives, optimize campaigns, and amplify brand presence.",
    icon: "Megaphone",
  },
  {
    id: "finance",
    name: "Finance & Accounting",
    description:
      "Financial intelligence agents that deliver precise forecasting, compliance oversight, and strategic capital management.",
    icon: "DollarSign",
  },
  {
    id: "research",
    name: "Research & Analysis",
    description:
      "Rigorous research and analytical agents that synthesize complex data into actionable insights and evidence-based recommendations.",
    icon: "Search",
  },
  {
    id: "healthcare",
    name: "Healthcare Operations",
    description:
      "Purpose-built healthcare workflow agents that streamline clinical operations, improve patient outcomes, and reduce administrative burden.",
    icon: "Heart",
  },
  {
    id: "operations",
    name: "Operations & HR",
    description:
      "Operational and human resources agents that optimize workflows, nurture talent, and build high-performing organizational cultures.",
    icon: "Settings",
  },
];

export const skills: Skill[] = [
  // ─────────────────────────────────────────────
  // EXECUTIVE SKILLS
  // ─────────────────────────────────────────────
  {
    id: "ceo",
    name: "Chief Executive Officer",
    shortName: "CEO",
    category: "executive",
    icon: "Crown",
    description:
      "Strategic leadership agent that drives vision, aligns stakeholders, and accelerates organizational growth.",
    longDescription:
      "The CEO agent serves as your AI-powered strategic leadership partner, delivering executive-level thinking for vision development, stakeholder alignment, and business growth. It synthesizes market intelligence, financial data, and organizational dynamics to provide actionable recommendations that drive long-term success. Whether you are preparing for a board meeting, evaluating an acquisition, or navigating a crisis, this agent operates at the highest level of strategic reasoning.",
    capabilities: [
      {
        name: "Strategic Planning",
        description:
          "Develops comprehensive multi-year strategic plans with clear milestones, competitive positioning, and resource allocation frameworks tailored to your market landscape.",
      },
      {
        name: "Vision Development",
        description:
          "Crafts compelling organizational vision and mission statements that inspire teams, attract investors, and establish a clear north star for decision-making.",
      },
      {
        name: "Stakeholder Communication",
        description:
          "Generates polished executive communications for investors, board members, employees, and partners with precise tone calibration for each audience.",
      },
      {
        name: "Board Presentations",
        description:
          "Produces board-ready slide decks, talking points, and supporting materials that concisely convey performance metrics, strategic pivots, and growth opportunities.",
      },
      {
        name: "Business Development",
        description:
          "Identifies and evaluates new market opportunities, strategic partnerships, and revenue streams through systematic analysis of industry trends and competitive gaps.",
      },
      {
        name: "Partnership Strategy",
        description:
          "Designs partnership frameworks including co-marketing agreements, channel partnerships, and technology integrations with clear value propositions for all parties.",
      },
      {
        name: "M&A Evaluation",
        description:
          "Conducts preliminary merger and acquisition assessments including strategic fit analysis, synergy identification, cultural compatibility, and integration planning.",
      },
      {
        name: "Crisis Management",
        description:
          "Develops rapid-response crisis communication plans, stakeholder notification sequences, and recovery strategies that protect brand reputation and business continuity.",
      },
      {
        name: "Executive Decision Frameworks",
        description:
          "Builds structured decision matrices and scenario analyses that weigh trade-offs, quantify risks, and surface the optimal path forward for high-stakes choices.",
      },
      {
        name: "Company Culture Strategy",
        description:
          "Designs cultural initiatives, core value definitions, and organizational rituals that foster engagement, innovation, and alignment across distributed teams.",
      },
      {
        name: "OKR & Goal Setting",
        description:
          "Creates cascading OKR frameworks that translate company-level objectives into measurable departmental and individual key results with clear accountability.",
      },
      {
        name: "Investor Relations",
        description:
          "Prepares investor updates, fundraising narratives, pitch decks, and quarterly reports that build confidence and maintain transparent communication with capital partners.",
      },
    ],
    useCases: [
      "Preparing a board presentation with strategic updates, financial performance, and a three-year growth roadmap",
      "Evaluating a potential acquisition target and generating a comprehensive strategic fit assessment",
      "Developing a crisis communication plan in response to a major product issue or market disruption",
      "Building an annual strategic plan with OKRs that cascade from executive vision to team-level execution",
    ],
    tier: "enterprise",
  },
  {
    id: "coo",
    name: "Chief Operating Officer",
    shortName: "COO",
    category: "executive",
    icon: "Cog",
    description:
      "Operational excellence agent that optimizes processes, manages resources, and drives cross-functional efficiency.",
    longDescription:
      "The COO agent transforms operational complexity into streamlined execution. It analyzes workflows, identifies bottlenecks, and designs scalable processes that reduce costs while improving quality and speed. From supply chain optimization to cross-functional coordination, this agent brings the rigor of a seasoned operations executive to every operational challenge your organization faces.",
    capabilities: [
      {
        name: "Operations Optimization",
        description:
          "Analyzes end-to-end operational workflows to identify inefficiencies, eliminate redundancies, and implement lean methodologies that improve throughput and reduce waste.",
      },
      {
        name: "Process Improvement",
        description:
          "Designs and documents improved business processes using frameworks like Six Sigma, Kaizen, and value stream mapping to achieve measurable performance gains.",
      },
      {
        name: "Supply Chain Management",
        description:
          "Evaluates supplier networks, logistics routing, and inventory strategies to build resilient, cost-effective supply chains with appropriate diversification.",
      },
      {
        name: "Quality Assurance",
        description:
          "Develops quality control frameworks, inspection protocols, and continuous improvement programs that maintain product and service excellence at scale.",
      },
      {
        name: "Vendor Management",
        description:
          "Creates vendor evaluation scorecards, negotiation strategies, and performance monitoring systems that maximize value from external partnerships and contracts.",
      },
      {
        name: "Workflow Automation",
        description:
          "Identifies high-impact automation opportunities across business functions and designs implementation roadmaps that prioritize ROI and minimize operational disruption.",
      },
      {
        name: "Capacity Planning",
        description:
          "Forecasts resource requirements across personnel, infrastructure, and technology to ensure the organization can scale efficiently to meet projected demand.",
      },
      {
        name: "KPI Dashboards",
        description:
          "Designs comprehensive operational dashboards with leading and lagging indicators that provide real-time visibility into organizational health and performance trends.",
      },
      {
        name: "SOP Development",
        description:
          "Creates detailed standard operating procedures with step-by-step instructions, decision trees, and exception handling that ensure consistency across teams and locations.",
      },
      {
        name: "Cross-Functional Coordination",
        description:
          "Builds alignment frameworks and communication protocols that break down departmental silos and ensure seamless collaboration on shared objectives.",
      },
      {
        name: "Operational Budgeting",
        description:
          "Develops operational budgets with detailed line-item analysis, variance tracking, and cost-reduction strategies tied to specific efficiency initiatives.",
      },
      {
        name: "Risk Management",
        description:
          "Identifies operational risks across business continuity, compliance, and execution, then designs mitigation strategies with clear escalation paths and contingency plans.",
      },
    ],
    useCases: [
      "Mapping and redesigning a fulfillment workflow to reduce order processing time by 40%",
      "Building a vendor evaluation framework to consolidate suppliers and negotiate better terms",
      "Creating a capacity plan for scaling operations ahead of a product launch or seasonal peak",
      "Developing a comprehensive SOP library for a newly opened office or distribution center",
    ],
    tier: "enterprise",
  },
  {
    id: "cio",
    name: "Chief Information Officer",
    shortName: "CIO",
    category: "executive",
    icon: "Server",
    description:
      "Technology strategy agent that architects IT infrastructure, ensures security, and drives digital transformation.",
    longDescription:
      "The CIO agent delivers strategic technology leadership that aligns IT investments with business objectives. It evaluates technology stacks, architects scalable infrastructure, and designs cybersecurity frameworks that protect organizational assets. From cloud migration to SOC 2 compliance, this agent provides the deep technical expertise and strategic perspective needed to build a modern, resilient technology foundation.",
    capabilities: [
      {
        name: "IT Strategy & Roadmap",
        description:
          "Develops multi-year IT strategic plans that align technology investments with business priorities, including phased implementation timelines and resource requirements.",
      },
      {
        name: "Technology Stack Evaluation",
        description:
          "Conducts rigorous evaluations of technology platforms, frameworks, and tools using weighted criteria that balance functionality, scalability, cost, and vendor viability.",
      },
      {
        name: "Cybersecurity Planning",
        description:
          "Designs comprehensive cybersecurity strategies including threat modeling, security architecture, incident response plans, and employee security awareness programs.",
      },
      {
        name: "Digital Transformation",
        description:
          "Creates digital transformation roadmaps that modernize legacy systems, digitize workflows, and enable data-driven decision-making across the organization.",
      },
      {
        name: "System Integration",
        description:
          "Architects integration strategies for connecting disparate systems through APIs, middleware, and data pipelines that ensure seamless data flow and process continuity.",
      },
      {
        name: "Data Governance",
        description:
          "Establishes data governance frameworks including data quality standards, ownership models, access controls, and lifecycle management policies that ensure data integrity.",
      },
      {
        name: "Cloud Infrastructure",
        description:
          "Designs cloud architecture strategies across IaaS, PaaS, and SaaS with cost optimization, auto-scaling, and multi-region redundancy for maximum reliability.",
      },
      {
        name: "IT Budget Management",
        description:
          "Creates detailed IT budgets with TCO analyses, build-versus-buy evaluations, and ROI projections that justify technology investments to executive leadership.",
      },
      {
        name: "Vendor Selection",
        description:
          "Manages technology vendor evaluation processes including RFP development, proof-of-concept coordination, contract negotiation, and ongoing performance management.",
      },
      {
        name: "Compliance (SOC 2, ISO)",
        description:
          "Develops compliance programs for SOC 2 Type II, ISO 27001, HIPAA, and other regulatory frameworks with gap analyses, remediation plans, and audit preparation.",
      },
      {
        name: "Disaster Recovery",
        description:
          "Designs disaster recovery and business continuity plans with RPO/RTO targets, failover architectures, backup strategies, and regular testing protocols.",
      },
      {
        name: "API Architecture",
        description:
          "Designs scalable API architectures including RESTful and GraphQL endpoints, authentication schemes, rate limiting, versioning strategies, and developer documentation.",
      },
    ],
    useCases: [
      "Evaluating a cloud migration strategy from on-premise infrastructure to a hybrid cloud architecture",
      "Preparing for a SOC 2 Type II audit with gap analysis, remediation planning, and evidence collection",
      "Designing a cybersecurity incident response plan with playbooks for the top ten threat scenarios",
      "Creating an IT roadmap that supports a 3x scaling of the engineering team over 18 months",
    ],
    tier: "enterprise",
  },
  {
    id: "caio",
    name: "Chief AI Officer",
    shortName: "CAIO",
    category: "executive",
    icon: "Brain",
    description:
      "AI strategy agent that guides responsible adoption, evaluates tools, and maximizes AI-driven business value.",
    longDescription:
      "The CAIO agent is your strategic AI advisor, guiding the responsible and effective adoption of artificial intelligence across your organization. It evaluates AI tools and vendors, designs implementation roadmaps, and establishes governance frameworks that ensure ethical, compliant, and high-ROI AI deployments. From identifying high-impact use cases to building AI literacy programs, this agent helps you navigate the rapidly evolving AI landscape with confidence and clarity.",
    capabilities: [
      {
        name: "AI Strategy Development",
        description:
          "Creates comprehensive AI strategies that align artificial intelligence investments with business objectives, competitive positioning, and organizational readiness assessments.",
      },
      {
        name: "AI Tool Evaluation",
        description:
          "Conducts rigorous evaluations of AI platforms, models, and services using criteria spanning accuracy, cost, scalability, data privacy, and integration complexity.",
      },
      {
        name: "Implementation Roadmap",
        description:
          "Designs phased AI implementation plans with pilot programs, success criteria, scaling triggers, and change management activities that minimize risk and maximize adoption.",
      },
      {
        name: "AI Ethics & Governance",
        description:
          "Establishes AI governance frameworks including bias monitoring, transparency requirements, human oversight protocols, and ethical guidelines that build stakeholder trust.",
      },
      {
        name: "Training Data Management",
        description:
          "Develops data strategies for AI initiatives including data collection, labeling, quality assurance, and privacy compliance that ensure models are trained on representative, high-quality data.",
      },
      {
        name: "Model Performance Monitoring",
        description:
          "Designs monitoring systems that track model accuracy, drift, latency, and fairness metrics in production to ensure AI systems maintain performance standards over time.",
      },
      {
        name: "Vendor Evaluation",
        description:
          "Compares AI vendors across capability, pricing, data handling practices, and roadmap alignment to select partners that deliver long-term strategic value.",
      },
      {
        name: "Use Case Identification",
        description:
          "Systematically identifies and prioritizes AI use cases across business functions using feasibility, impact, and readiness scoring to focus resources on highest-value opportunities.",
      },
      {
        name: "ROI Analysis",
        description:
          "Quantifies the return on investment for AI initiatives by modeling cost savings, revenue uplift, productivity gains, and risk reduction against implementation and operating costs.",
      },
      {
        name: "AI Risk Management",
        description:
          "Identifies and mitigates AI-specific risks including hallucination, data leakage, regulatory exposure, and workforce displacement with proactive governance controls.",
      },
      {
        name: "Prompt Engineering Strategy",
        description:
          "Develops organizational prompt engineering standards, template libraries, and best practices that maximize the quality and consistency of AI-generated outputs.",
      },
      {
        name: "AI Literacy Programs",
        description:
          "Designs AI education curricula for employees at all levels, from executive awareness sessions to hands-on technical workshops, that build organizational AI competency.",
      },
    ],
    useCases: [
      "Building an enterprise AI strategy with a phased roadmap, governance framework, and ROI projections",
      "Evaluating five LLM providers for customer support automation with a weighted scoring matrix",
      "Developing an AI ethics policy and governance structure for a regulated financial services firm",
      "Creating an AI literacy training program for 500 employees across technical and non-technical roles",
    ],
    tier: "enterprise",
  },

  // ─────────────────────────────────────────────
  // MARKETING & CONTENT SKILLS
  // ─────────────────────────────────────────────
  {
    id: "cmo",
    name: "Chief Marketing Officer",
    shortName: "CMO",
    category: "marketing",
    icon: "Target",
    description:
      "Marketing strategy agent that builds brands, drives acquisition, and optimizes campaign performance.",
    longDescription:
      "The CMO agent is your AI-powered marketing strategist, combining creative vision with data-driven precision to build powerful brands and drive measurable growth. It develops comprehensive marketing strategies, designs multi-channel campaigns, and continuously optimizes performance against key acquisition and retention metrics. From brand positioning to go-to-market launches, this agent delivers executive-level marketing leadership at every stage of company growth.",
    capabilities: [
      {
        name: "Marketing Strategy",
        description:
          "Develops holistic marketing strategies that align brand positioning, channel mix, and messaging with business objectives and target audience insights.",
      },
      {
        name: "Brand Positioning",
        description:
          "Crafts differentiated brand positioning frameworks including value propositions, messaging hierarchies, and competitive differentiation that resonate with target markets.",
      },
      {
        name: "Campaign Planning",
        description:
          "Designs integrated multi-channel campaign plans with creative briefs, channel strategies, timelines, budgets, and KPIs that drive measurable business outcomes.",
      },
      {
        name: "Market Research",
        description:
          "Conducts comprehensive market analyses including TAM/SAM/SOM sizing, customer segmentation, buyer persona development, and competitive landscape mapping.",
      },
      {
        name: "Customer Acquisition",
        description:
          "Builds scalable customer acquisition strategies across paid, owned, and earned channels with clear CAC targets and funnel optimization frameworks.",
      },
      {
        name: "Content Strategy",
        description:
          "Develops content ecosystems that span thought leadership, demand generation, and community building with editorial calendars and distribution playbooks.",
      },
      {
        name: "Digital Marketing",
        description:
          "Optimizes digital marketing programs across SEO, SEM, social media, email, and programmatic channels with attribution modeling and conversion rate optimization.",
      },
      {
        name: "Marketing Budget Allocation",
        description:
          "Creates data-informed marketing budgets with channel-level allocation, expected returns, and dynamic rebalancing frameworks that maximize marketing ROI.",
      },
      {
        name: "Competitive Analysis",
        description:
          "Monitors competitive positioning, messaging, pricing, and feature developments to identify threats and opportunities that inform strategic marketing decisions.",
      },
      {
        name: "Performance Reporting",
        description:
          "Builds marketing performance dashboards with attribution models, funnel analytics, and cohort analyses that demonstrate marketing impact on revenue and growth.",
      },
      {
        name: "Go-to-Market Strategy",
        description:
          "Designs comprehensive GTM plans for product launches including positioning, pricing, channel strategy, launch timelines, and success metrics.",
      },
      {
        name: "Brand Guidelines",
        description:
          "Creates detailed brand guideline documents covering visual identity, voice and tone, messaging frameworks, and usage standards that ensure brand consistency.",
      },
    ],
    useCases: [
      "Launching a new product with a full go-to-market strategy including positioning, pricing, and channel plans",
      "Developing a content marketing strategy that drives organic lead generation and thought leadership",
      "Building a competitive analysis report to reposition the brand against emerging market entrants",
      "Designing a Q1 integrated campaign plan with budget allocation across six digital channels",
    ],
    tier: "enterprise",
  },
  {
    id: "professional-copywriter",
    name: "Professional Copywriter",
    shortName: "Copywriter",
    category: "marketing",
    icon: "PenTool",
    description:
      "Expert content creation agent that produces compelling copy across every marketing channel and format.",
    longDescription:
      "The Professional Copywriter agent is a versatile content engine that delivers polished, on-brand copy for every stage of the customer journey. From attention-grabbing ad headlines to long-form thought leadership, this agent adapts its voice and style to match your brand while optimizing for engagement, conversion, and SEO performance. It understands the nuances of different content formats and channels, producing copy that not only reads well but drives measurable business results.",
    capabilities: [
      {
        name: "Blog Posts",
        description:
          "Creates engaging, well-structured blog articles with compelling hooks, clear arguments, and strong CTAs optimized for both reader engagement and search engine visibility.",
      },
      {
        name: "Email Marketing",
        description:
          "Writes high-converting email sequences including welcome series, nurture campaigns, promotional blasts, and re-engagement flows with subject lines optimized for open rates.",
      },
      {
        name: "Social Media Content",
        description:
          "Produces platform-native social content for LinkedIn, X, Instagram, and Facebook with appropriate tone, hashtag strategy, and engagement-driving formats for each channel.",
      },
      {
        name: "Landing Page Copy",
        description:
          "Crafts persuasive landing page copy with benefit-driven headlines, social proof integration, objection handling, and conversion-optimized CTAs that maximize lead capture.",
      },
      {
        name: "Ad Copy (PPC & Social)",
        description:
          "Writes high-performing ad copy for Google Ads, Meta Ads, and LinkedIn Ads with character-count compliance, A/B test variants, and audience-specific messaging.",
      },
      {
        name: "Brand Voice Development",
        description:
          "Defines comprehensive brand voice guidelines including tone attributes, vocabulary preferences, writing style rules, and channel-specific adaptations that ensure consistency.",
      },
      {
        name: "SEO Content Optimization",
        description:
          "Optimizes content for search engines with strategic keyword placement, semantic clustering, meta descriptions, header structures, and internal linking that improve organic rankings.",
      },
      {
        name: "Press Releases",
        description:
          "Writes professional press releases following AP style with newsworthy angles, quotable executive statements, and multimedia elements that earn media coverage.",
      },
      {
        name: "Product Descriptions",
        description:
          "Creates compelling product descriptions that highlight features, communicate benefits, address buyer objections, and drive purchase decisions across e-commerce and B2B contexts.",
      },
      {
        name: "Newsletter Writing",
        description:
          "Produces engaging newsletter content with curated insights, original commentary, and consistent formatting that builds subscriber loyalty and drives click-through rates.",
      },
      {
        name: "Case Studies",
        description:
          "Develops persuasive case studies with clear problem-solution-result narratives, quantified outcomes, and customer quotes that serve as powerful sales enablement tools.",
      },
      {
        name: "White Papers",
        description:
          "Writes authoritative white papers that establish thought leadership, present original research, and generate qualified leads through gated content distribution strategies.",
      },
    ],
    useCases: [
      "Writing a 12-email nurture sequence for a SaaS product launch targeting enterprise decision-makers",
      "Creating a month of social media content across four platforms with platform-specific adaptations",
      "Developing a case study library featuring five customer success stories with measurable outcomes",
      "Producing SEO-optimized blog content for a content hub targeting 20 high-intent keywords",
    ],
    tier: "professional",
  },
  {
    id: "grant-writer",
    name: "Grant Writer",
    shortName: "Grant Writer",
    category: "marketing",
    icon: "FileText",
    description:
      "Specialized grant writing agent that identifies funding opportunities and produces winning proposals.",
    longDescription:
      "The Grant Writer agent is a specialized funding strategist that transforms your mission and programs into compelling, competition-winning grant proposals. It researches funding opportunities, crafts persuasive narratives, develops detailed budget justifications, and ensures compliance with funder requirements. Whether you are pursuing federal grants from NIH, NSF, or DOE, or cultivating foundation and corporate sponsors, this agent brings the expertise and precision needed to maximize your funding success rate.",
    capabilities: [
      {
        name: "Grant Research & Identification",
        description:
          "Identifies relevant funding opportunities across federal, state, foundation, and corporate sources by matching your organization's mission, programs, and eligibility criteria.",
      },
      {
        name: "Proposal Writing",
        description:
          "Crafts compelling grant narratives with clear needs statements, evidence-based program designs, and persuasive arguments that align your work with funder priorities.",
      },
      {
        name: "Budget Narrative Development",
        description:
          "Creates detailed, defensible budget narratives with line-item justifications, cost allocation methodologies, and matching fund documentation that satisfy funder requirements.",
      },
      {
        name: "Logic Model Creation",
        description:
          "Designs visual logic models and theories of change that clearly connect inputs, activities, outputs, outcomes, and impact in a coherent programmatic framework.",
      },
      {
        name: "Compliance Documentation",
        description:
          "Prepares required compliance documents including organizational certifications, assurances, financial statements, and audit reports that meet funder eligibility standards.",
      },
      {
        name: "Grant Reporting",
        description:
          "Produces interim and final grant reports with progress metrics, financial expenditure summaries, and impact narratives that satisfy reporting requirements and build funder trust.",
      },
      {
        name: "Federal Grants (NIH/NSF/DOE)",
        description:
          "Navigates the specific requirements of major federal funding agencies including format guidelines, review criteria, submission portals, and compliance regulations.",
      },
      {
        name: "Foundation Proposals",
        description:
          "Tailors proposals for private foundations with concise narratives, relationship-building language, and alignment with foundation-specific grantmaking priorities and strategies.",
      },
      {
        name: "Corporate Sponsorship",
        description:
          "Develops corporate sponsorship proposals with tiered benefit packages, brand alignment rationale, and measurable deliverables that create mutual value.",
      },
      {
        name: "Grant Calendar Management",
        description:
          "Maintains a comprehensive grant calendar with submission deadlines, reporting dates, renewal timelines, and preparation milestones to ensure nothing falls through the cracks.",
      },
      {
        name: "Letters of Inquiry",
        description:
          "Writes concise, compelling letters of inquiry that capture funder interest and secure invitations to submit full proposals through targeted, mission-aligned messaging.",
      },
      {
        name: "Outcome Measurement Frameworks",
        description:
          "Designs evaluation frameworks with SMART indicators, data collection plans, and analysis methodologies that demonstrate program impact and support future funding requests.",
      },
    ],
    useCases: [
      "Writing an NIH R01 grant proposal for a clinical research study with budget justification and specific aims",
      "Identifying and applying for five foundation grants aligned with a nonprofit's education program",
      "Developing a corporate sponsorship package for a healthcare innovation conference",
      "Creating an outcome measurement framework for a community health intervention program",
    ],
    tier: "professional",
  },

  // ─────────────────────────────────────────────
  // FINANCE SKILLS
  // ─────────────────────────────────────────────
  {
    id: "cfo",
    name: "Chief Financial Officer",
    shortName: "CFO",
    category: "finance",
    icon: "TrendingUp",
    description:
      "Financial strategy agent that delivers precise forecasting, risk analysis, and capital optimization.",
    longDescription:
      "The CFO agent provides sophisticated financial intelligence that empowers data-driven decision-making. It combines rigorous analytical modeling with strategic foresight to deliver actionable insights on cash flow, revenue projections, cost optimization, and capital allocation. Whether you are preparing for a fundraise, optimizing unit economics, or navigating complex tax strategy, this agent brings the precision and judgment of a world-class finance executive.",
    capabilities: [
      {
        name: "Financial Planning & Analysis",
        description:
          "Builds comprehensive financial models including P&L projections, balance sheet forecasts, and scenario analyses that illuminate the financial implications of strategic decisions.",
      },
      {
        name: "Budget Forecasting",
        description:
          "Creates detailed departmental and company-wide budgets with rolling forecasts, variance analysis, and predictive modeling that adapts to changing business conditions.",
      },
      {
        name: "Cash Flow Management",
        description:
          "Analyzes cash conversion cycles, working capital requirements, and liquidity positions to ensure the organization maintains healthy cash reserves and payment capabilities.",
      },
      {
        name: "Financial Reporting",
        description:
          "Generates board-ready financial reports, investor updates, and regulatory filings with clear narratives that contextualize the numbers and highlight key trends.",
      },
      {
        name: "Revenue Modeling",
        description:
          "Constructs detailed revenue models across product lines, customer segments, and geographies with sensitivity analyses that quantify upside potential and downside risk.",
      },
      {
        name: "Cost Optimization",
        description:
          "Performs systematic cost audits across operational, personnel, and technology spend to identify savings opportunities without compromising quality or growth capacity.",
      },
      {
        name: "Investment Analysis",
        description:
          "Evaluates capital investment opportunities using DCF, IRR, and payback period analyses alongside qualitative strategic fit assessments to guide allocation decisions.",
      },
      {
        name: "Risk Assessment",
        description:
          "Quantifies financial risks including market, credit, liquidity, and operational exposures, then develops hedging strategies and risk mitigation frameworks.",
      },
      {
        name: "Tax Strategy",
        description:
          "Identifies tax optimization opportunities across jurisdictions, evaluates entity structure implications, and ensures compliance with evolving tax regulations.",
      },
      {
        name: "Fundraising & Capital Strategy",
        description:
          "Prepares fundraising materials, valuation analyses, and capital structure recommendations that position the organization for successful equity or debt raises.",
      },
      {
        name: "Financial Compliance",
        description:
          "Monitors regulatory requirements across GAAP, IFRS, SOX, and industry-specific standards to ensure accurate reporting and audit readiness at all times.",
      },
      {
        name: "Unit Economics",
        description:
          "Analyzes customer acquisition costs, lifetime value, gross margins, and contribution margins at granular levels to optimize pricing and go-to-market strategies.",
      },
    ],
    useCases: [
      "Building a three-year financial model for a Series B fundraise with multiple growth scenarios",
      "Conducting a comprehensive cost audit to identify $2M in operational savings without headcount reduction",
      "Preparing quarterly financial reports with executive narratives for the board of directors",
      "Analyzing unit economics across customer segments to optimize pricing and acquisition spend",
    ],
    tier: "enterprise",
  },

  // ─────────────────────────────────────────────
  // RESEARCH & ANALYSIS SKILLS
  // ─────────────────────────────────────────────
  {
    id: "researcher",
    name: "Researcher",
    shortName: "Researcher",
    category: "research",
    icon: "Microscope",
    description:
      "Rigorous research agent that designs studies, analyzes data, and delivers evidence-based insights.",
    longDescription:
      "The Researcher agent brings academic rigor and analytical precision to every investigation. It designs research methodologies, conducts comprehensive literature reviews, performs statistical analyses, and synthesizes findings into clear, actionable reports. Whether you need competitive intelligence, market research, or a systematic review of scientific literature, this agent applies the highest standards of evidence-based inquiry to deliver insights you can trust and act upon.",
    capabilities: [
      {
        name: "Literature Review",
        description:
          "Conducts comprehensive reviews of academic papers, industry reports, and grey literature to synthesize the current state of knowledge on any topic with proper citation.",
      },
      {
        name: "Data Collection & Analysis",
        description:
          "Designs data collection instruments and analytical frameworks that transform raw data into structured insights using appropriate quantitative and qualitative methods.",
      },
      {
        name: "Methodology Design",
        description:
          "Develops rigorous research methodologies including study design, sampling strategies, variable definitions, and analytical plans that ensure valid and reliable findings.",
      },
      {
        name: "Survey Design",
        description:
          "Creates professionally structured surveys with validated question types, skip logic, response scales, and sampling plans that generate statistically meaningful data.",
      },
      {
        name: "Statistical Analysis",
        description:
          "Performs statistical analyses including descriptive statistics, hypothesis testing, regression modeling, and multivariate analysis with appropriate interpretation of results.",
      },
      {
        name: "Research Reports",
        description:
          "Produces comprehensive research reports with executive summaries, methodology sections, data visualizations, and actionable recommendations formatted for decision-makers.",
      },
      {
        name: "Competitive Intelligence",
        description:
          "Gathers and analyzes competitive intelligence on market positioning, product features, pricing strategies, and organizational moves to inform strategic decision-making.",
      },
      {
        name: "Market Research",
        description:
          "Conducts primary and secondary market research including market sizing, customer segmentation, demand analysis, and trend identification that guide business strategy.",
      },
      {
        name: "Trend Analysis",
        description:
          "Identifies and evaluates emerging trends across industries, technologies, and consumer behavior to anticipate market shifts and position organizations for future opportunities.",
      },
      {
        name: "Citation Management",
        description:
          "Maintains organized citation databases with proper formatting across APA, MLA, Chicago, and other styles, ensuring academic integrity and easy reference retrieval.",
      },
      {
        name: "Qualitative Coding",
        description:
          "Applies systematic qualitative coding methodologies including open coding, axial coding, and thematic analysis to extract patterns and insights from unstructured text data.",
      },
      {
        name: "Systematic Reviews",
        description:
          "Conducts systematic reviews following PRISMA guidelines with transparent search strategies, inclusion criteria, quality assessments, and evidence synthesis.",
      },
    ],
    useCases: [
      "Conducting a systematic literature review on AI adoption in healthcare with 50+ source synthesis",
      "Designing and analyzing a customer satisfaction survey for a 10,000-person user base",
      "Building a competitive intelligence report covering five key competitors across 15 dimensions",
      "Performing a trend analysis on emerging technologies in the fintech space for strategic planning",
    ],
    tier: "professional",
  },

  // ─────────────────────────────────────────────
  // OPERATIONS & HR SKILLS
  // ─────────────────────────────────────────────
  {
    id: "chro",
    name: "Chief Human Resources Officer",
    shortName: "CHRO",
    category: "operations",
    icon: "Users",
    description:
      "People strategy agent that attracts top talent, builds culture, and drives organizational performance.",
    longDescription:
      "The CHRO agent delivers strategic human resources leadership that transforms workforce management into a competitive advantage. It designs talent acquisition strategies, builds performance management systems, and creates employee engagement programs that attract, develop, and retain top talent. From compensation benchmarking to DEI initiatives, this agent provides the expertise needed to build a high-performing, inclusive organization.",
    capabilities: [
      {
        name: "Talent Acquisition",
        description:
          "Designs end-to-end recruitment strategies including employer branding, sourcing channels, interview frameworks, and candidate experience optimization that attract top-tier talent.",
      },
      {
        name: "Employee Retention",
        description:
          "Develops retention programs using engagement data, exit interview analysis, and industry benchmarks to identify and address the root causes of unwanted attrition.",
      },
      {
        name: "Compensation Planning",
        description:
          "Creates competitive compensation structures with salary bands, equity frameworks, and total rewards packages benchmarked against market data and internal equity principles.",
      },
      {
        name: "Performance Management",
        description:
          "Designs performance evaluation systems with calibration processes, continuous feedback mechanisms, and development plans that drive individual and organizational growth.",
      },
      {
        name: "Training & Development Programs",
        description:
          "Builds learning and development curricula including onboarding programs, leadership development tracks, and skills training that close capability gaps and accelerate career growth.",
      },
      {
        name: "HR Compliance",
        description:
          "Ensures compliance with employment laws, labor regulations, and workplace safety standards across jurisdictions with proactive policy updates and audit readiness.",
      },
      {
        name: "DEI Initiatives",
        description:
          "Designs diversity, equity, and inclusion programs with measurable goals, inclusive hiring practices, ERG frameworks, and cultural competency training that foster belonging.",
      },
      {
        name: "Organizational Design",
        description:
          "Architects organizational structures, reporting lines, and role definitions that optimize for collaboration, decision speed, and scalability as the company grows.",
      },
      {
        name: "Employee Engagement",
        description:
          "Creates engagement measurement frameworks with pulse surveys, eNPS tracking, and action planning that systematically improve workplace satisfaction and productivity.",
      },
      {
        name: "HR Analytics",
        description:
          "Builds people analytics dashboards that track headcount, turnover, time-to-hire, cost-per-hire, and engagement trends to inform data-driven workforce decisions.",
      },
      {
        name: "Succession Planning",
        description:
          "Develops succession planning frameworks that identify high-potential employees, map critical roles, and create development pathways that ensure leadership continuity.",
      },
      {
        name: "Workplace Policy",
        description:
          "Drafts comprehensive workplace policies covering remote work, code of conduct, leave management, and workplace safety that balance employee flexibility with organizational needs.",
      },
    ],
    useCases: [
      "Designing a compensation framework with salary bands and equity guidelines for a 200-person company",
      "Building an onboarding program that reduces new-hire ramp time from 90 days to 45 days",
      "Creating a DEI strategy with measurable goals, accountability structures, and quarterly reporting",
      "Developing a succession plan for the executive team with development pathways for internal candidates",
    ],
    tier: "enterprise",
  },

  // ─────────────────────────────────────────────
  // HEALTHCARE SKILLS
  // ─────────────────────────────────────────────
  {
    id: "appointment-scheduling",
    name: "Appointment Scheduling",
    shortName: "Scheduling",
    category: "healthcare",
    icon: "Calendar",
    description:
      "Intelligent scheduling agent that optimizes provider calendars, reduces gaps, and improves patient access.",
    longDescription:
      "The Appointment Scheduling agent transforms chaotic calendars into optimized, patient-friendly schedules. It manages multi-provider availability, respects patient preferences, and dynamically adjusts for cancellations and urgent needs. By intelligently balancing provider utilization with patient access, this agent reduces no-shows, minimizes wait times, and maximizes the productivity of every clinical hour.",
    capabilities: [
      {
        name: "Multi-Provider Calendar Management",
        description:
          "Coordinates schedules across multiple providers, specialties, and locations to optimize patient flow and ensure appropriate provider-patient matching based on clinical needs.",
      },
      {
        name: "Patient Preference Matching",
        description:
          "Considers patient preferences for provider, time of day, day of week, and location when booking appointments to maximize satisfaction and reduce cancellation rates.",
      },
      {
        name: "Automated Reminders",
        description:
          "Sends intelligent appointment reminders via SMS, email, and phone at optimal intervals with confirmation options that reduce no-show rates by up to 40%.",
      },
      {
        name: "Waitlist Management",
        description:
          "Maintains dynamic waitlists that automatically offer cancelled slots to waiting patients based on urgency, preference match, and proximity to the appointment time.",
      },
      {
        name: "Recurring Appointment Scheduling",
        description:
          "Manages recurring appointment series for chronic care, therapy, and follow-up visits with automatic rebooking and conflict detection across provider schedules.",
      },
      {
        name: "Buffer Time Optimization",
        description:
          "Intelligently allocates buffer time between appointments based on visit type complexity, provider pace, and historical duration data to prevent schedule overruns.",
      },
      {
        name: "Telehealth Scheduling",
        description:
          "Integrates virtual visit scheduling with in-person appointments, managing technology requirements, time zone differences, and platform-specific booking workflows.",
      },
      {
        name: "Multi-Location Support",
        description:
          "Coordinates scheduling across multiple clinic locations with travel time considerations, equipment availability, and location-specific provider schedules.",
      },
    ],
    useCases: [
      "Optimizing a five-provider clinic schedule to reduce patient wait times and increase daily visit capacity",
      "Setting up automated appointment reminders that reduce no-show rates from 18% to under 8%",
      "Managing a waitlist system that automatically fills cancelled slots within 30 minutes of cancellation",
    ],
    tier: "starter",
  },
  {
    id: "insurance-verification",
    name: "Insurance Verification",
    shortName: "Insurance",
    category: "healthcare",
    icon: "ShieldCheck",
    description:
      "Real-time insurance verification agent that confirms coverage, estimates costs, and prevents claim denials.",
    longDescription:
      "The Insurance Verification agent eliminates the administrative burden of manual insurance checks by automating eligibility verification, benefits breakdowns, and cost estimation. It proactively identifies coverage gaps, manages prior authorizations, and tracks claims status to ensure clean claims and timely reimbursement. By catching issues before they become denials, this agent protects both practice revenue and patient financial experience.",
    capabilities: [
      {
        name: "Real-Time Eligibility Checks",
        description:
          "Verifies patient insurance eligibility in real time against payer databases, confirming active coverage, effective dates, and plan details before the patient arrives.",
      },
      {
        name: "Benefits Breakdown",
        description:
          "Retrieves detailed benefits information including deductibles, copays, coinsurance, out-of-pocket maximums, and coverage limitations for specific services and procedure codes.",
      },
      {
        name: "Prior Authorization",
        description:
          "Manages the prior authorization process from initial submission through approval, tracking requirements by payer and procedure to prevent delays in patient care.",
      },
      {
        name: "Claims Status Tracking",
        description:
          "Monitors submitted claims through the adjudication process, flagging delays, requesting additional information, and escalating stalled claims before they reach timely filing limits.",
      },
      {
        name: "Patient Cost Estimates",
        description:
          "Generates accurate patient cost estimates based on verified benefits, contracted rates, and remaining deductibles so patients understand their financial responsibility upfront.",
      },
      {
        name: "Denial Management",
        description:
          "Analyzes denial patterns, identifies root causes, and generates targeted appeal letters with clinical documentation that maximize overturn rates on denied claims.",
      },
      {
        name: "Coverage Gap Identification",
        description:
          "Proactively identifies gaps in patient coverage, lapsed policies, and coordination of benefits issues before services are rendered to avoid unexpected billing problems.",
      },
      {
        name: "Batch Verification",
        description:
          "Processes bulk insurance verifications for upcoming appointments, flagging issues that require attention and ensuring all patients are verified before their scheduled visits.",
      },
    ],
    useCases: [
      "Running batch insurance verification for all appointments scheduled in the next 72 hours",
      "Generating accurate patient cost estimates for elective procedures to support financial counseling",
      "Analyzing denial patterns to identify the top five root causes and implement preventive measures",
    ],
    tier: "starter",
  },
  {
    id: "patient-follow-up",
    name: "Patient Follow-Up",
    shortName: "Follow-Up",
    category: "healthcare",
    icon: "PhoneCall",
    description:
      "Proactive patient engagement agent that drives adherence, satisfaction, and continuity of care.",
    longDescription:
      "The Patient Follow-Up agent ensures no patient falls through the cracks by automating post-visit outreach, medication adherence checks, and preventive care reminders. It personalizes communication based on patient conditions, preferences, and care plans, creating a consistent touchpoint that improves outcomes and strengthens the patient-provider relationship. From chronic care management to no-show recovery, this agent keeps patients engaged and on track.",
    capabilities: [
      {
        name: "Post-Visit Outreach",
        description:
          "Initiates personalized follow-up communications after appointments to check on symptom progression, medication tolerance, and care plan understanding.",
      },
      {
        name: "Medication Adherence",
        description:
          "Monitors and supports medication adherence through timely reminders, refill coordination, and barrier identification that improve treatment compliance rates.",
      },
      {
        name: "Appointment Reminders",
        description:
          "Delivers multi-channel appointment reminders with escalating urgency, confirmation options, and easy rescheduling links that reduce missed appointments.",
      },
      {
        name: "Satisfaction Surveys",
        description:
          "Deploys patient satisfaction surveys at optimal post-visit intervals, analyzes results, and routes negative feedback for immediate service recovery intervention.",
      },
      {
        name: "Care Plan Compliance",
        description:
          "Tracks patient adherence to prescribed care plans including lifestyle modifications, therapy exercises, and follow-up testing with supportive nudges and education.",
      },
      {
        name: "No-Show Recovery",
        description:
          "Reaches out to patients who missed appointments with empathetic, non-judgmental messaging that encourages rebooking and addresses barriers to attendance.",
      },
      {
        name: "Preventive Care Reminders",
        description:
          "Generates proactive outreach for preventive screenings, annual wellness visits, immunizations, and age-appropriate health maintenance based on patient demographics.",
      },
      {
        name: "Chronic Care Check-Ins",
        description:
          "Conducts regular check-ins with chronic disease patients to monitor symptoms, assess self-management, and escalate concerns to clinical staff when intervention is needed.",
      },
    ],
    useCases: [
      "Implementing a chronic care check-in program for diabetic patients that improves A1C outcomes",
      "Recovering 60% of no-show patients through automated outreach within 24 hours of missed appointments",
      "Deploying preventive care reminders that increase annual wellness visit completion rates by 25%",
    ],
    tier: "starter",
  },
  {
    id: "clinical-documentation",
    name: "Clinical Documentation",
    shortName: "Documentation",
    category: "healthcare",
    icon: "ClipboardList",
    description:
      "Clinical writing agent that produces accurate, compliant documentation for every patient encounter.",
    longDescription:
      "The Clinical Documentation agent reduces the documentation burden on clinical staff by generating clear, accurate, and compliant clinical documents. From SOAP notes to discharge summaries, this agent ensures every patient encounter is properly documented with appropriate medical terminology, coding-ready language, and patient-friendly explanations. It maintains consistency across providers and ensures documentation supports quality metrics, reimbursement, and continuity of care.",
    capabilities: [
      {
        name: "Visit Summaries",
        description:
          "Creates comprehensive visit summaries that capture chief complaints, examination findings, diagnoses, treatment plans, and follow-up instructions in clear clinical language.",
      },
      {
        name: "Referral Letters",
        description:
          "Drafts professional referral letters with relevant patient history, current medications, diagnostic results, and specific clinical questions for the receiving specialist.",
      },
      {
        name: "Patient Instructions",
        description:
          "Generates patient-friendly discharge and care instructions at appropriate health literacy levels with clear action steps, warning signs, and contact information.",
      },
      {
        name: "Discharge Notes",
        description:
          "Produces thorough discharge documentation including hospital course summaries, medication reconciliation, follow-up requirements, and activity restrictions.",
      },
      {
        name: "SOAP Notes",
        description:
          "Structures clinical encounters into standardized SOAP format with subjective findings, objective data, clinical assessment, and detailed treatment plans.",
      },
      {
        name: "Procedure Documentation",
        description:
          "Documents procedural details including indications, technique, findings, complications, and post-procedure instructions in format-compliant clinical language.",
      },
      {
        name: "Lab Result Summaries",
        description:
          "Summarizes laboratory results with clinical context, trend analysis, abnormal value flagging, and recommended follow-up actions for provider review.",
      },
      {
        name: "Care Plan Documentation",
        description:
          "Creates detailed care plans with problem lists, treatment goals, interventions, responsible parties, and outcome measures that guide coordinated patient care.",
      },
    ],
    useCases: [
      "Generating SOAP notes for a high-volume urgent care clinic processing 80 patients per day",
      "Creating patient-friendly discharge instructions translated to a sixth-grade reading level",
      "Drafting specialist referral letters that include all relevant clinical history and diagnostic results",
    ],
    tier: "professional",
  },
  {
    id: "referral-management",
    name: "Referral Management",
    shortName: "Referrals",
    category: "healthcare",
    icon: "GitBranch",
    description:
      "End-to-end referral coordination agent that connects patients to specialists and tracks outcomes.",
    longDescription:
      "The Referral Management agent ensures seamless care transitions by coordinating every step of the referral process from initial request to completed specialist visit. It matches patients with appropriate specialists, prepares necessary documentation, tracks referral status, and closes the communication loop between referring and receiving providers. By eliminating referral leakage and delays, this agent improves patient outcomes and strengthens referral network relationships.",
    capabilities: [
      {
        name: "Specialist Matching",
        description:
          "Matches patients to appropriate specialists based on clinical needs, insurance coverage, geographic proximity, availability, and patient preferences for optimal care access.",
      },
      {
        name: "Referral Tracking",
        description:
          "Provides end-to-end visibility into referral status from submission through completion with automated alerts for stalled referrals and approaching deadlines.",
      },
      {
        name: "Status Updates",
        description:
          "Sends proactive status updates to referring providers, patients, and care coordinators at key milestones in the referral process to maintain transparency.",
      },
      {
        name: "Document Preparation",
        description:
          "Compiles and organizes all required documentation including clinical notes, imaging results, lab work, and insurance authorizations into complete referral packages.",
      },
      {
        name: "Patient Communication",
        description:
          "Manages patient-facing referral communications including specialist information, appointment details, preparation instructions, and directions to the specialist office.",
      },
      {
        name: "Follow-Up Coordination",
        description:
          "Ensures referring providers receive specialist consultation notes and integrates recommendations back into the primary care plan for continuity of care.",
      },
      {
        name: "Referral Analytics",
        description:
          "Tracks referral patterns, completion rates, wait times, and outcome data to identify network gaps, improve processes, and optimize specialist relationships.",
      },
      {
        name: "Network Management",
        description:
          "Maintains an up-to-date specialist directory with credentialing status, acceptance criteria, typical wait times, and quality metrics to support informed referral decisions.",
      },
    ],
    useCases: [
      "Reducing referral leakage from 35% to under 10% through automated tracking and patient follow-up",
      "Building a specialist network directory with real-time availability and quality metrics",
      "Generating monthly referral analytics reports that identify bottlenecks and optimization opportunities",
    ],
    tier: "professional",
  },
  {
    id: "no-show-recovery",
    name: "No-Show Recovery",
    shortName: "No-Show",
    category: "healthcare",
    icon: "UserX",
    description:
      "Patient recovery agent that reduces missed appointments and recaptures lost revenue.",
    longDescription:
      "The No-Show Recovery agent combats one of healthcare's most persistent operational challenges by implementing a comprehensive strategy to prevent, respond to, and recover from missed appointments. It identifies patients at risk of no-showing, optimizes reminder strategies, automates rescheduling outreach, and backfills cancelled slots from waitlists. By addressing both the symptoms and root causes of no-shows, this agent protects practice revenue and ensures patients receive timely care.",
    capabilities: [
      {
        name: "Automated Rescheduling",
        description:
          "Initiates immediate automated outreach to no-show patients with frictionless rebooking options that make it easy to get back on the schedule within minutes.",
      },
      {
        name: "Cancellation Follow-Up",
        description:
          "Follows up on last-minute cancellations with personalized messages that address common barriers and offer alternative appointment times or visit modalities.",
      },
      {
        name: "Waitlist Backfill",
        description:
          "Automatically offers newly available time slots to waitlisted patients through real-time notifications, filling gaps within minutes of a cancellation or no-show.",
      },
      {
        name: "Pattern Identification",
        description:
          "Analyzes no-show data to identify patterns by day, time, provider, appointment type, and patient demographics to inform targeted prevention strategies.",
      },
      {
        name: "Patient Engagement",
        description:
          "Deploys targeted engagement campaigns for chronic no-show patients that address underlying barriers such as transportation, childcare, or health literacy challenges.",
      },
      {
        name: "Reminder Optimization",
        description:
          "Tests and optimizes reminder timing, frequency, channel, and messaging to find the most effective combination for different patient segments and visit types.",
      },
      {
        name: "Late Arrival Protocols",
        description:
          "Manages late arrival workflows including grace period policies, schedule adjustment options, and patient communication that balance flexibility with operational efficiency.",
      },
      {
        name: "Financial Impact Tracking",
        description:
          "Quantifies the revenue impact of no-shows and tracks recovery rates to demonstrate ROI and justify investments in prevention and recovery programs.",
      },
    ],
    useCases: [
      "Reducing practice-wide no-show rates from 20% to 8% through optimized reminder and recovery workflows",
      "Implementing a waitlist backfill system that recovers 75% of cancelled appointment revenue",
      "Analyzing no-show patterns to redesign the scheduling template and reduce Tuesday afternoon gaps",
    ],
    tier: "starter",
  },
  {
    id: "rx-refill-coordination",
    name: "Rx Refill Coordination",
    shortName: "Rx Refills",
    category: "healthcare",
    icon: "Pill",
    description:
      "Medication management agent that streamlines refills, prevents gaps, and ensures patient safety.",
    longDescription:
      "The Rx Refill Coordination agent ensures patients never miss a dose by automating the entire medication refill workflow. It sends proactive refill reminders, coordinates with pharmacies, manages prior authorizations for medications, and monitors adherence patterns. By integrating drug interaction checking and formulary verification, this agent not only improves convenience but also enhances patient safety and reduces medication-related adverse events.",
    capabilities: [
      {
        name: "Refill Reminders",
        description:
          "Sends timely medication refill reminders based on fill dates, days supply, and patient-specific adherence patterns to prevent lapses in medication therapy.",
      },
      {
        name: "Pharmacy Coordination",
        description:
          "Coordinates with pharmacies for prescription transfers, fill status inquiries, and therapeutic substitutions to ensure patients receive medications without delays.",
      },
      {
        name: "Prior Authorization for Medications",
        description:
          "Manages medication-specific prior authorization requests including clinical justification, step therapy documentation, and formulary exception appeals.",
      },
      {
        name: "Medication Reconciliation",
        description:
          "Performs comprehensive medication reconciliation across providers and care settings to identify duplications, omissions, and discrepancies in the medication list.",
      },
      {
        name: "Adherence Tracking",
        description:
          "Monitors prescription fill rates and refill patterns to identify patients at risk of non-adherence, triggering targeted interventions before gaps affect outcomes.",
      },
      {
        name: "Drug Interaction Alerts",
        description:
          "Screens new prescriptions and refills against the patient's complete medication list for clinically significant drug-drug, drug-food, and drug-condition interactions.",
      },
      {
        name: "Formulary Checks",
        description:
          "Verifies medication formulary status against the patient's insurance plan and suggests therapeutically equivalent alternatives when preferred drugs are available.",
      },
      {
        name: "Patient Notifications",
        description:
          "Delivers clear patient communications about refill status, pharmacy readiness, cost information, and any required provider actions needed before the prescription can be filled.",
      },
    ],
    useCases: [
      "Automating refill reminders for a cardiology practice managing 2,000 patients on chronic medications",
      "Reducing medication prior authorization turnaround time from five days to 24 hours",
      "Implementing medication reconciliation workflows for patients transitioning between care settings",
    ],
    tier: "professional",
  },
  {
    id: "lab-results-communication",
    name: "Lab Results Communication",
    shortName: "Lab Results",
    category: "healthcare",
    icon: "TestTube",
    description:
      "Lab results management agent that delivers timely, clear, and contextualized diagnostic communications.",
    longDescription:
      "The Lab Results Communication agent bridges the gap between laboratory data and patient understanding. It ensures timely notification of results, provides context-appropriate explanations, flags critical values for immediate attention, and coordinates necessary follow-up actions. By automating result communication with appropriate clinical context, this agent reduces provider inbox burden, improves patient engagement, and ensures no critical result goes unaddressed.",
    capabilities: [
      {
        name: "Result Notification",
        description:
          "Delivers lab results to patients through preferred communication channels with appropriate urgency levels and provider-approved messaging for each result category.",
      },
      {
        name: "Critical Value Alerts",
        description:
          "Immediately escalates critical and panic-level lab values to the ordering provider and care team through high-priority alerts that demand acknowledgment.",
      },
      {
        name: "Normal Range Explanations",
        description:
          "Provides patient-friendly explanations of lab results with reference range context, trend comparisons, and plain-language interpretations that reduce unnecessary anxiety.",
      },
      {
        name: "Follow-Up Scheduling",
        description:
          "Automatically triggers follow-up appointment scheduling when lab results indicate the need for clinical review, treatment adjustment, or repeat testing.",
      },
      {
        name: "Patient Portal Updates",
        description:
          "Pushes lab results to patient portal systems with organized formatting, historical comparisons, and educational resources linked to specific test types.",
      },
      {
        name: "Provider Review Workflow",
        description:
          "Routes lab results to ordering and relevant consulting providers for review with priority queuing based on clinical significance and result abnormality.",
      },
      {
        name: "Trending Analysis",
        description:
          "Tracks longitudinal lab value trends across multiple test dates to identify clinically meaningful patterns that may not be apparent from a single result.",
      },
      {
        name: "Reference Range Context",
        description:
          "Provides age, gender, and condition-specific reference range context that helps patients and providers interpret results within the appropriate clinical framework.",
      },
    ],
    useCases: [
      "Automating lab result notifications for a primary care practice processing 500 results per week",
      "Implementing critical value alert workflows that ensure provider acknowledgment within 30 minutes",
      "Building longitudinal lab trending dashboards for chronic disease management programs",
    ],
    tier: "professional",
  },
  {
    id: "pre-authorization-automation",
    name: "Pre-Authorization Automation",
    shortName: "Pre-Auth",
    category: "healthcare",
    icon: "CheckSquare",
    description:
      "Authorization automation agent that accelerates approvals, reduces denials, and eliminates administrative bottlenecks.",
    longDescription:
      "The Pre-Authorization Automation agent tackles one of healthcare's most time-consuming administrative processes by automating authorization request submission, status tracking, and appeal preparation. It understands payer-specific requirements, assembles clinical justification documentation, and monitors turnaround times to escalate delayed requests. By reducing authorization cycle times and denial rates, this agent ensures patients receive timely care while protecting practice revenue.",
    capabilities: [
      {
        name: "Auth Request Submission",
        description:
          "Prepares and submits authorization requests with complete clinical documentation, correct procedure codes, and payer-specific form requirements to maximize first-pass approval rates.",
      },
      {
        name: "Status Tracking",
        description:
          "Monitors authorization request status across all payers with automated check-ins, timeline tracking, and proactive escalation when requests exceed expected turnaround times.",
      },
      {
        name: "Approval Documentation",
        description:
          "Organizes and archives authorization approvals with reference numbers, valid date ranges, approved units, and any conditions or limitations for easy retrieval at time of service.",
      },
      {
        name: "Appeal Preparation",
        description:
          "Generates well-structured appeal letters with clinical evidence, peer-reviewed literature citations, and medical necessity arguments that maximize overturn rates on denied authorizations.",
      },
      {
        name: "Clinical Justification",
        description:
          "Assembles clinical justification packages with relevant medical records, diagnostic results, treatment history, and evidence-based guidelines that support medical necessity.",
      },
      {
        name: "Payer Communication",
        description:
          "Manages direct communication with payer authorization departments including phone follow-ups, fax submissions, and portal interactions for each insurance carrier.",
      },
      {
        name: "Turnaround Monitoring",
        description:
          "Tracks payer-specific authorization turnaround times against contractual and regulatory requirements, flagging violations and generating escalation communications.",
      },
      {
        name: "Denial Prevention",
        description:
          "Analyzes historical denial data to identify common causes and implements proactive measures including documentation templates and submission checklists that prevent recurring denials.",
      },
    ],
    useCases: [
      "Reducing average pre-authorization turnaround time from seven days to two days through automated submission and tracking",
      "Achieving a 90% first-pass authorization approval rate by implementing payer-specific submission checklists",
      "Preparing and submitting appeals for denied authorizations with a 70% overturn success rate",
    ],
    tier: "advanced",
  },
  {
    id: "post-surgical-follow-up",
    name: "Post-Surgical Follow-Up",
    shortName: "Post-Surgery",
    category: "healthcare",
    icon: "Stethoscope",
    description:
      "Surgical recovery agent that monitors healing, coordinates rehabilitation, and prevents complications.",
    longDescription:
      "The Post-Surgical Follow-Up agent provides comprehensive recovery support from the moment a patient leaves the operating room through their return to full activity. It coordinates wound care instructions, physical therapy scheduling, pain management protocols, and complication screening to ensure optimal surgical outcomes. By maintaining consistent touchpoints during the critical recovery period, this agent catches potential complications early, improves patient compliance with recovery protocols, and supports a smooth return to daily life.",
    capabilities: [
      {
        name: "Recovery Check-Ins",
        description:
          "Conducts structured post-operative check-ins at clinically appropriate intervals to assess pain levels, mobility progress, wound status, and overall recovery trajectory.",
      },
      {
        name: "Wound Care Instructions",
        description:
          "Delivers detailed, procedure-specific wound care instructions with visual guides, warning signs of infection, and step-by-step dressing change protocols.",
      },
      {
        name: "Physical Therapy Scheduling",
        description:
          "Coordinates physical therapy and rehabilitation appointments based on surgical protocol timelines, ensuring patients begin recovery exercises at the optimal post-operative window.",
      },
      {
        name: "Pain Management Follow-Up",
        description:
          "Monitors post-operative pain levels, medication effectiveness, and side effects to support appropriate pain management adjustments while minimizing opioid-related risks.",
      },
      {
        name: "Complication Screening",
        description:
          "Screens for post-surgical complications including infection, blood clots, wound dehiscence, and adverse medication reactions through symptom-based questionnaires and escalation protocols.",
      },
      {
        name: "Activity Restrictions",
        description:
          "Communicates procedure-specific activity restrictions and progressive return-to-activity guidelines with clear timelines for lifting, driving, exercise, and work resumption.",
      },
      {
        name: "Medication Management",
        description:
          "Manages post-operative medication schedules including antibiotics, pain medications, anticoagulants, and tapering protocols with adherence monitoring and interaction checking.",
      },
      {
        name: "Return-to-Work Planning",
        description:
          "Develops personalized return-to-work plans based on procedure type, job requirements, and recovery progress, including work restriction documentation for employers.",
      },
    ],
    useCases: [
      "Implementing a total knee replacement recovery program with automated check-ins at days 1, 3, 7, 14, and 30",
      "Reducing post-surgical complication rates by 25% through early detection via structured symptom screening",
      "Coordinating physical therapy scheduling and adherence tracking for an orthopedic surgery center",
    ],
    tier: "advanced",
  },
];

// ─────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────

export const getSkillsByCategory = (category: string): Skill[] =>
  skills.filter((s) => s.category === category);

export const getSkillById = (id: string): Skill | undefined =>
  skills.find((s) => s.id === id);

export const getSkillsByTier = (tier: Skill["tier"]): Skill[] =>
  skills.filter((s) => s.tier === tier);

export const getSkillCategories = (): SkillCategory[] => skillCategories;

export const getCategoryById = (id: string): SkillCategory | undefined =>
  skillCategories.find((c) => c.id === id);
