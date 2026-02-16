import {
  Zap,
  Brain,
  Stethoscope,
  Shield,
  Mic,
  Bot,
  Plug,
  FileText,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Stethoscope,
    title: "Clinical Agent Builder",
    description:
      "Create AI agents for front desk, clinical coordination, patient outreach, and every role in your practice.",
  },
  {
    icon: Brain,
    title: "Multi-LLM Clinical Engine",
    description:
      "OpenAI, Claude, Gemini, MiniMax, Kimi — choose the best model for each clinical workflow.",
  },
  {
    icon: Zap,
    title: "30+ Medical AI Skills",
    description:
      "Patient scheduling, insurance verification, clinical documentation, referral management, and more.",
  },
  {
    icon: Shield,
    title: "HIPAA-First Security",
    description:
      "HIPAA compliant, BAA available, SOC 2 certified, PHI auto-redaction, and end-to-end encryption.",
  },
  {
    icon: Mic,
    title: "Medical Voice AI",
    description:
      "Voice agents for patient calls, appointment reminders, post-op follow-ups, and clinical dictation.",
  },
  {
    icon: Bot,
    title: "Healthcare Templates",
    description:
      "Pre-built agents for front desk, clinical coordinator, insurance verifier, post-op care, and more.",
  },
  {
    icon: Plug,
    title: "EHR & Practice Integrations",
    description:
      "Connect to Epic, Cerner, athenahealth, and 40+ healthcare integrations. Bring your own API keys.",
  },
  {
    icon: FileText,
    title: "Clinical Documentation",
    description:
      "AI-generated clinical notes, referral letters, prior authorizations, and patient communications.",
  },
  {
    icon: Users,
    title: "Care Team Collaboration",
    description:
      "Multi-provider access, role-based permissions, and shared agent workflows across your practice.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 block">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-4">
            Everything You Need to{" "}
            <span className="gradient-hero-text">Automate Healthcare</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A complete AI platform purpose-built for medical practices, clinics,
            and health systems — from patient intake to clinical operations.
          </p>
        </div>

        {/* 3x3 Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card rounded-xl p-6 card-hover animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 shadow-glow-sm">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold font-heading text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
