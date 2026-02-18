import { ShieldCheck, Lock, Layers, HeartPulse, Users, Zap } from "lucide-react";
import PlatformDiagram from "@/components/PlatformDiagram";

const pillars = [
  {
    icon: ShieldCheck,
    title: "HIPAA-Compliant by Default",
    description:
      "Every workflow, agent, and data flow is built to meet HIPAA standards out of the box — no configuration required.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
  },
  {
    icon: Lock,
    title: "Zone-Isolated Security",
    description:
      "PHI is locked inside dedicated security zones. Your patient data never mingles with other tenants or leaves your environment.",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
  },
  {
    icon: Layers,
    title: "Unified AI Workspace",
    description:
      "One platform for scheduling, documentation, care coordination, billing outreach, and more — no stitching tools together.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/20",
  },
  {
    icon: HeartPulse,
    title: "Built for Healthcare",
    description:
      "Purpose-built for medical practices, clinics, and health systems — not a generic AI tool retrofitted for healthcare.",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
  },
  {
    icon: Users,
    title: "Your Entire Care Team",
    description:
      "Give every provider, coordinator, and front-desk staff their own AI agent — all under one secure, unified environment.",
    color: "text-violet-400",
    bg: "bg-violet-400/10 border-violet-400/20",
  },
  {
    icon: Zap,
    title: "Instant Deployment",
    description:
      "Launch pre-built clinical agents in minutes. No lengthy onboarding, no IT overhead, no vendor lock-in.",
    color: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
  },
];

export default function UnifiedPlatformSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 block">
            Secure · Unified · Healthcare-Native
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-5">
            One Secure Environment for{" "}
            <span className="gradient-hero-text">Your Entire Practice</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            OpenClaw brings your clinical AI agents, patient workflows, and healthcare integrations
            into a single, unified environment — secured end-to-end so you can focus on care, not compliance.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.title}
              className="glass-card rounded-xl p-6 card-hover animate-fade-up border border-border"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`w-12 h-12 rounded-lg border flex items-center justify-center mb-4 ${pillar.bg}`}>
                <pillar.icon className={`w-6 h-6 ${pillar.color}`} />
              </div>
              <h3 className="text-lg font-semibold font-heading text-foreground mb-2">
                {pillar.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

        {/* Interactive Platform Diagram */}
        <div className="mb-14">
          <div className="text-center mb-8 animate-fade-up">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Interactive Demo
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-heading mt-1">
              See How Agents, Data & Workflows Connect
            </h3>
          </div>
          <PlatformDiagram />
        </div>

        {/* Central callout banner */}
        <div className="glass-card rounded-2xl p-8 sm:p-10 border border-primary/20 text-center animate-fade-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <span className="text-xl font-bold font-heading text-foreground">
              OpenClaw — The Unified Healthcare AI Platform
            </span>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            From patient intake to post-op follow-ups, every clinical workflow lives inside one
            secure, HIPAA-compliant environment. No sprawl. No risk. Just a healthier practice.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            {["HIPAA Compliant", "BAA Available", "SOC 2 Certified", "PHI Zone Isolation", "End-to-End Encryption"].map((badge) => (
              <span
                key={badge}
                className="text-xs px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 font-medium"
              >
                ✓ {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
