import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Starter",
    price: "$147",
    period: "/mo",
    description: "For individuals and small teams getting started with AI agents.",
    features: [
      "2 AI Agents",
      "5 Skills",
      "1 LLM Provider",
      "Basic Voice AI",
      "HIPAA Compliant",
      "Email Support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$297",
    period: "/mo",
    description: "For growing teams that need multi-model AI and full voice capabilities.",
    badge: "Most Popular",
    features: [
      "10 AI Agents",
      "Unlimited Skills",
      "Multi-LLM (OpenAI, Claude, Gemini)",
      "Full Voice AI Suite",
      "All Integrations",
      "BAA Available",
      "5 Team Seats",
      "Priority Support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Advanced",
    price: "$447",
    period: "/mo",
    description: "For organizations needing advanced integrations and white-label capabilities.",
    features: [
      "25 AI Agents",
      "All Integrations + AWS",
      "Custom Skills",
      "Advanced Analytics",
      "White-Label Option",
      "15 Team Seats",
      "Dedicated Account Manager",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with custom requirements and on-premise needs.",
    features: [
      "Unlimited Agents & Skills",
      "All LLM Providers",
      "Custom Integrations",
      "On-Premise Deployment",
      "Custom SLA",
      "Unlimited Seats",
      "24/7 Dedicated Support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 block">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-4">
            Simple, Transparent{" "}
            <span className="gradient-hero-text">Pricing</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Start free for 14 days. No credit card required. Scale as you grow.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              className={`rounded-xl p-6 flex flex-col animate-fade-up ${
                tier.highlighted
                  ? "glass-card-solid border-2 border-blue-500/50 shadow-glow relative"
                  : "glass-card card-hover"
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Badge */}
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold gradient-primary text-white rounded-full">
                  {tier.badge}
                </span>
              )}

              {/* Tier Name */}
              <h3 className="text-lg font-semibold font-heading text-white mb-1">
                {tier.name}
              </h3>

              {/* Price */}
              <div className="mb-3">
                <span className="text-4xl font-bold font-heading gradient-hero-text">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-slate-400 text-sm">{tier.period}</span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                {tier.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-slate-300"
                  >
                    <Check className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to={tier.name === "Enterprise" ? "/contact" : "/auth"}
                className={`text-center font-semibold py-3 rounded-lg transition-all text-sm ${
                  tier.highlighted
                    ? "gradient-primary text-white shadow-glow-sm hover:opacity-90"
                    : "border border-white/10 text-white hover:bg-white/5"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
