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
    icon: Zap,
    title: "Custom Agent Builder",
    description:
      "Create and name your own AI agents, assign skills, and choose the models that power them.",
  },
  {
    icon: Brain,
    title: "Multi-LLM Choice",
    description:
      "OpenAI, Claude, Gemini, MiniMax, Kimi — switch between models per agent for the best results.",
  },
  {
    icon: Stethoscope,
    title: "30+ AI Skills",
    description:
      "From C-suite strategy to healthcare operations to content creation — one platform, every skill.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "HIPAA compliant, BAA available, SOC 2 certified, end-to-end encryption, and PHI protection.",
  },
  {
    icon: Mic,
    title: "Voice AI",
    description:
      "Natural voice agents for calls, follow-ups, patient outreach, and hands-free workflows.",
  },
  {
    icon: Bot,
    title: "Quick-Start Templates",
    description:
      "16 pre-built agent templates to get you started — deploy a working agent in one click.",
  },
  {
    icon: Plug,
    title: "Your Integrations",
    description:
      "Connect your own API keys and use your preferred AI providers. Full control, zero lock-in.",
  },
  {
    icon: FileText,
    title: "Professional Content",
    description:
      "Copywriting, grant proposals, research papers, marketing campaigns — all AI-powered.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Multi-seat plans, role-based access, and a shared agent library for your entire team.",
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
            <span className="gradient-hero-text">Deploy AI Agents</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A complete platform for building, customizing, and managing AI
            agents across your organization.
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
