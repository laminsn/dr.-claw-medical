import { Bot, Zap, Shield, Puzzle, Brain, Mic } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Deploy in Minutes",
    description: "One-click agent setup. Choose your LLM, install skills, and go live — no dev team required.",
  },
  {
    icon: Brain,
    title: "Multi-LLM Choice",
    description: "Pick from OpenAI, Claude, or Gemini. Switch models per agent. Your data, your choice.",
  },
  {
    icon: Mic,
    title: "Voice AI Built In",
    description: "ElevenLabs, Deepgram, VAPI — ultra-realistic voice agents for calls, IVR, and patient outreach.",
  },
  {
    icon: Puzzle,
    title: "OpenClaw Skills",
    description: "Install pre-built healthcare skills from the open-source marketplace. One agent, one skill — or all of them.",
  },
  {
    icon: Shield,
    title: "HIPAA & BAA First",
    description: "Every integration ships with BAA agreements. End-to-end encryption. PHI never leaves your environment.",
  },
  {
    icon: Bot,
    title: "Quick-Start Templates",
    description: "Pre-configured agents for front desk, patient follow-up, insurance, referrals — ready out of the box.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">Why Dr. Claw</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Simple Setup. Advanced Skills.
          </h2>
          <p className="mt-5 text-muted-foreground max-w-lg mx-auto text-lg">
            The fastest way to deploy HIPAA-compliant AI agents for healthcare — with the integrations you already trust.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group relative"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-5 group-hover:shadow-glow transition-shadow duration-500">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
