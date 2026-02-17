import {
  Stethoscope,
  Building2,
  TrendingUp,
  FileText,
  Users,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const personas = [
  {
    icon: Stethoscope,
    title: "Healthcare Practices",
    description:
      "AI front desk, clinical documentation, and patient follow-ups — purpose-built for healthcare.",
    bullets: [
      "Automated patient scheduling & reminders",
      "Clinical note generation & summaries",
      "Referral tracking & follow-up outreach",
    ],
  },
  {
    icon: Building2,
    title: "Marketing Teams",
    description:
      "Content creation, campaign strategy, and brand management powered by AI agents.",
    bullets: [
      "Blog posts, social media & ad copy",
      "Campaign strategy & performance analysis",
      "Brand voice consistency at scale",
    ],
  },
  {
    icon: TrendingUp,
    title: "Executive Leadership",
    description:
      "Strategic planning, financial analysis, and AI strategy from your C-suite AI team.",
    bullets: [
      "CEO, CFO & CAIO strategic insights",
      "Financial modeling & forecasting",
      "AI adoption roadmap & governance",
    ],
  },
  {
    icon: FileText,
    title: "Grant & Research",
    description:
      "Grant writing, market research, and competitive intelligence — automated.",
    bullets: [
      "Grant proposal drafting & review",
      "Market research & data synthesis",
      "Competitive intelligence reports",
    ],
  },
  {
    icon: Users,
    title: "HR & Operations",
    description:
      "Talent management, process optimization, and compliance handled by AI agents.",
    bullets: [
      "Job descriptions & candidate screening",
      "Process documentation & SOPs",
      "Compliance monitoring & reporting",
    ],
  },
  {
    icon: Briefcase,
    title: "Multi-Department",
    description:
      "Deploy AI agents across your entire organization with shared libraries and role-based access.",
    bullets: [
      "Cross-department agent sharing",
      "Centralized management dashboard",
      "Role-based access & permissions",
    ],
  },
];

export default function PersonasSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 block">
            Who We Serve
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-4">
            Built for{" "}
            <span className="gradient-hero-text">Healthcare Organizations</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            From solo practitioners to multi-location health systems — Dr. Claw
            agents automate every department in your organization.
          </p>
        </div>

        {/* Persona Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona, i) => (
            <div
              key={persona.title}
              className="glass-card rounded-xl p-6 card-hover animate-fade-up flex flex-col"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 shadow-glow-sm">
                <persona.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-lg font-semibold font-heading text-white mb-2">
                {persona.title}
              </h3>
              <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                {persona.description}
              </p>

              <ul className="space-y-2 mb-6 flex-1">
                {persona.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>

              <Link
                to="/auth"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
