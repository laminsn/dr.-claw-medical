import { Check } from "lucide-react";
import { Link } from "react-router-dom";

interface PricingTierProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const PricingCard = ({ name, price, description, features, highlighted, cta }: PricingTierProps) => (
  <div
    className={`relative flex flex-col ${
      highlighted
        ? "border border-primary/40 rounded-2xl bg-primary/5 shadow-glow p-8"
        : "p-8"
    }`}
  >
    {highlighted && (
      <span className="absolute -top-3 left-8 gradient-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
        Most Popular
      </span>
    )}
    <h3 className="font-display text-xl font-bold text-foreground">{name}</h3>
    <p className="text-sm mt-1 text-muted-foreground">
      {description}
    </p>
    <div className="mt-6 mb-8">
      <span className="font-display text-5xl font-bold text-foreground">{price}</span>
      {price !== "Custom" && (
        <span className="text-sm text-muted-foreground ml-1">/month</span>
      )}
    </div>
    <ul className="space-y-3 flex-1">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-3 text-sm">
          <Check className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
          <span className="text-foreground/80">{feature}</span>
        </li>
      ))}
    </ul>
    <Link
      to="/auth"
      className={`mt-8 w-full py-3.5 rounded-xl font-semibold text-sm transition-all text-center block ${
        highlighted
          ? "gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
          : "border border-border text-foreground hover:border-primary/40 hover:text-primary"
      }`}
    >
      {cta}
    </Link>
  </div>
);

const PricingSection = () => {
  const tiers: PricingTierProps[] = [
    {
      name: "Starter",
      price: "$147",
      description: "Solo practitioners getting started",
      cta: "Start Free Trial",
      features: [
        "1 AI agent",
        "5 OpenClaw skills",
        "1 LLM integration",
        "Basic voice (ElevenLabs)",
        "HIPAA compliant",
        "Email support",
        "Patient follow-up automation",
      ],
    },
    {
      name: "Professional",
      price: "$297",
      description: "Growing practices and clinics",
      cta: "Start Free Trial",
      highlighted: true,
      features: [
        "5 AI agents",
        "Unlimited OpenClaw skills",
        "Multi-LLM (OpenAI, Claude, Gemini)",
        "Full voice stack (ElevenLabs + Deepgram + VAPI)",
        "EHR & practice management integrations",
        "BAA agreements included",
        "5 user seats",
        "Priority support",
        "Clinical workflow templates",
      ],
    },
    {
      name: "Advanced",
      price: "$447",
      description: "Multi-location medical groups",
      cta: "Start Free Trial",
      features: [
        "15 AI agents",
        "All integrations unlocked",
        "AWS Healthcare (Comprehend, Transcribe)",
        "Custom clinical skill development",
        "Advanced analytics & reporting",
        "White-label options",
        "15 user seats",
        "Dedicated account manager",
        "HIPAA audit trail & compliance dashboard",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Hospital networks & health systems",
      cta: "Contact Sales",
      features: [
        "Unlimited AI agents",
        "Unlimited user seats",
        "Custom EHR/EMR/billing integrations",
        "On-premise deployment option",
        "Custom BAA & compliance review",
        "SLA guarantee with 99.9% uptime",
        "24/7 phone & dedicated support",
        "HL7 FHIR & SMART on FHIR support",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-32 relative">
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">Pricing</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-5 text-muted-foreground max-w-lg mx-auto text-lg">
            Start free for 14 days. All plans include HIPAA compliance and BAA agreements.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 max-w-6xl mx-auto divide-x divide-border">
          {tiers.map((tier) => (
            <PricingCard key={tier.name} {...tier} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
