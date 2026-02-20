import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function PricingSection() {
  const { t } = useTranslation();

  const tiers = [
    {
      name: t("home.pricing.starterName"),
      price: t("home.pricing.starterPrice"),
      period: t("home.pricing.starterPeriod"),
      description: t("home.pricing.starterDesc"),
      features: [
        t("home.pricing.starterF1"), t("home.pricing.starterF2"), t("home.pricing.starterF3"),
        t("home.pricing.starterF4"), t("home.pricing.starterF5"), t("home.pricing.starterF6"),
        t("home.pricing.starterF7"), t("home.pricing.starterF8"),
      ],
      cta: t("home.pricing.starterCta"),
      highlighted: false,
    },
    {
      name: t("home.pricing.proName"),
      price: t("home.pricing.proPrice"),
      period: t("home.pricing.proPeriod"),
      description: t("home.pricing.proDesc"),
      badge: t("home.pricing.mostPopular"),
      features: [
        t("home.pricing.proF1"), t("home.pricing.proF2"), t("home.pricing.proF3"),
        t("home.pricing.proF4"), t("home.pricing.proF5"), t("home.pricing.proF6"),
        t("home.pricing.proF7"), t("home.pricing.proF8"), t("home.pricing.proF9"),
        t("home.pricing.proF10"),
      ],
      cta: t("home.pricing.proCta"),
      highlighted: true,
    },
    {
      name: t("home.pricing.advName"),
      price: t("home.pricing.advPrice"),
      period: t("home.pricing.advPeriod"),
      description: t("home.pricing.advDesc"),
      features: [
        t("home.pricing.advF1"), t("home.pricing.advF2"), t("home.pricing.advF3"),
        t("home.pricing.advF4"), t("home.pricing.advF5"), t("home.pricing.advF6"),
        t("home.pricing.advF7"), t("home.pricing.advF8"), t("home.pricing.advF9"),
        t("home.pricing.advF10"),
      ],
      cta: t("home.pricing.advCta"),
      highlighted: false,
    },
    {
      name: t("home.pricing.entName"),
      price: t("home.pricing.entPrice"),
      period: "",
      description: t("home.pricing.entDesc"),
      features: [
        t("home.pricing.entF1"), t("home.pricing.entF2"), t("home.pricing.entF3"),
        t("home.pricing.entF4"), t("home.pricing.entF5"), t("home.pricing.entF6"),
        t("home.pricing.entF7"), t("home.pricing.entF8"),
      ],
      cta: t("home.pricing.entCta"),
      highlighted: false,
      isEnterprise: true,
    },
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 block">
            {t("home.pricing.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-4">
            {t("home.pricing.title1")}{" "}
            <span className="gradient-hero-text">{t("home.pricing.title2")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.pricing.subtitle")}
          </p>
          <p className="text-sm text-blue-400/80 mt-3">
            {t("home.pricing.trialNote")}
          </p>
        </div>

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
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold gradient-primary text-white rounded-full">
                  {tier.badge}
                </span>
              )}
              <h3 className="text-lg font-semibold font-heading text-foreground mb-1">
                {tier.name}
              </h3>
              <div className="mb-3">
                <span className="text-4xl font-bold font-heading gradient-hero-text">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-muted-foreground text-sm">{tier.period}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {tier.description}
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to={"isEnterprise" in tier && tier.isEnterprise ? "/contact" : "/auth"}
                className={`text-center font-semibold py-3 rounded-lg transition-all text-sm ${
                  tier.highlighted
                    ? "gradient-primary text-white shadow-glow-sm hover:opacity-90"
                    : "border border-white/10 text-foreground hover:bg-white/5"
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
