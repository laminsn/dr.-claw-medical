import { Bot, Zap, Shield, Brain, Mic, Stethoscope, HeartPulse, FileText, Phone } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "One-Step Registration",
    description: "Enter your email and go. No lengthy credentialing forms or specialty verification. Your HIPAA-compliant workspace is ready in seconds.",
  },
  {
    icon: Brain,
    title: "Multi-LLM Choice",
    description: "Pick from OpenAI, Claude, or Gemini. Switch models per agent. Use the best AI for each task — documentation, calls, or analysis.",
  },
  {
    icon: Mic,
    title: "Voice AI for Patient Calls",
    description: "ElevenLabs, Deepgram, VAPI — natural voice agents for inbound calls, appointment reminders, post-visit follow-ups, and patient outreach.",
  },
  {
    icon: Stethoscope,
    title: "20+ Healthcare Skills",
    description: "Pre-built skills for scheduling, insurance verification, clinical documentation, referral management, lab results, prescription refills, and more.",
  },
  {
    icon: Shield,
    title: "HIPAA & BAA First",
    description: "Every integration ships with BAA agreements. End-to-end encryption. PHI never leaves your environment. SOC 2 Type II certified.",
  },
  {
    icon: Bot,
    title: "Quick-Start Agent Templates",
    description: "Pre-configured agents for Front Desk, Clinical Coordinator, Patient Outreach, Insurance Verifier — live in minutes, not months.",
  },
  {
    icon: HeartPulse,
    title: "Patient Engagement",
    description: "Automated no-show recovery, satisfaction surveys, post-op check-ins, and preventive care reminders that increase retention by 40%.",
  },
  {
    icon: FileText,
    title: "Clinical Documentation",
    description: "AI-powered referral letters, visit summaries, patient instructions, and discharge notes — reducing chart time by up to 60%.",
  },
  {
    icon: Phone,
    title: "24/7 Virtual Front Desk",
    description: "Never miss a patient call again. AI agents answer after-hours calls, triage urgency, book appointments, and route emergencies.",
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
            Built for How{" "}
            <span className="gradient-hero-text">Medicine Works</span>
          </h2>
          <p className="mt-5 text-muted-foreground max-w-lg mx-auto text-lg">
            Every feature is designed for healthcare workflows — from patient intake to post-discharge follow-up. Deploy compliant AI agents in minutes, not months.
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
