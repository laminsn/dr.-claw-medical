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
    <section id="pricing" className="py-32 relative">
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">Pricing</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-5 text-muted-foreground max-w-lg mx-auto text-lg">
            Start free for 14 days. No credit card required. Scale as you grow.
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
