import { UserPlus, Puzzle, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Register in One Step",
    description:
      "Enter your email and name — that's it. No lengthy forms, no specialty verification hoops. Your HIPAA-compliant workspace is ready in seconds.",
  },
  {
    number: "02",
    icon: Puzzle,
    title: "Pick Your Skills & LLM",
    description:
      "Browse 20+ healthcare-specific skills — from appointment scheduling to clinical documentation. Choose your AI engine (OpenAI, Claude, or Gemini) and voice provider.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Deploy & Go Live",
    description:
      "One click deploys your AI agents. They start handling calls, follow-ups, scheduling, and patient outreach immediately — HIPAA compliant from day one.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-32 relative" id="how-it-works">
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
            How It Works
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Live in{" "}
            <span className="gradient-hero-text">Under 5 Minutes</span>
          </h2>
          <p className="mt-5 text-muted-foreground max-w-lg mx-auto text-lg">
            No IT department needed. No developer required. Three simple steps
            to AI-powered healthcare operations.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40" />

            {steps.map((step, i) => (
              <div key={step.number} className="relative text-center group">
                <div className="relative z-10 inline-flex flex-col items-center">
                  <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 group-hover:shadow-glow transition-shadow duration-500">
                    <step.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 font-display text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link
              to="/auth"
              className="gradient-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-base hover:opacity-90 transition-all shadow-glow inline-block"
            >
              Get Started Free — No Credit Card
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
