import { Check } from "lucide-react";

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
    className={`relative rounded-2xl p-8 flex flex-col ${
      highlighted
        ? "gradient-primary text-primary-foreground shadow-glow scale-105"
        : "bg-card border border-border"
    }`}
  >
    {highlighted && (
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-accent text-accent-foreground text-xs font-bold px-4 py-1 rounded-full">
        Most Popular
      </span>
    )}
    <h3 className="font-display text-xl font-bold">{name}</h3>
    <p className={`text-sm mt-1 ${highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
      {description}
    </p>
    <div className="mt-6 mb-6">
      <span className="font-display text-4xl font-bold">{price}</span>
      <span className={`text-sm ${highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
        /month
      </span>
    </div>
    <ul className="space-y-3 flex-1">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2 text-sm">
          <Check className={`h-4 w-4 mt-0.5 shrink-0 ${highlighted ? "text-primary-foreground" : "text-primary"}`} />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button
      className={`mt-8 w-full py-3 rounded-lg font-semibold text-sm transition-all ${
        highlighted
          ? "bg-card text-foreground hover:bg-card/90"
          : "gradient-primary text-primary-foreground hover:opacity-90"
      }`}
    >
      {cta}
    </button>
  </div>
);

const PricingSection = () => {
  const tiers: PricingTierProps[] = [
    {
      name: "Starter",
      price: "$49",
      description: "For solo practitioners getting started",
      cta: "Start Free Trial",
      features: [
        "Pre-trained medical AI assistant",
        "Patient scheduling automation",
        "Basic document generation",
        "Email & chat support",
        "1 user seat",
      ],
    },
    {
      name: "Professional",
      price: "$99",
      description: "For growing practices and agencies",
      cta: "Start Free Trial",
      highlighted: true,
      features: [
        "Everything in Starter",
        "Multi-channel outreach (calls, SMS, email)",
        "Insurance verification workflows",
        "Custom AI training on your data",
        "5 user seats",
        "Priority support",
      ],
    },
    {
      name: "Advanced",
      price: "$149",
      description: "For multi-location offices",
      cta: "Start Free Trial",
      features: [
        "Everything in Professional",
        "Advanced analytics & reporting",
        "HIPAA-compliant data handling",
        "White-label options",
        "15 user seats",
        "Dedicated account manager",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For hospital networks & large groups",
      cta: "Contact Sales",
      features: [
        "Everything in Advanced",
        "Unlimited user seats",
        "Custom integrations (EHR, billing)",
        "On-premise deployment option",
        "SLA guarantee",
        "24/7 phone support",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-secondary/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Start free for 14 days. No credit card required. Scale as your practice grows.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto items-start">
          {tiers.map((tier) => (
            <PricingCard key={tier.name} {...tier} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
