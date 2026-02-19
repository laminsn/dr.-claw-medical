import { useTranslation } from "react-i18next";
import { Stethoscope, Building2, TrendingUp, FileText, Users, Briefcase, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PersonasSection() {
  const { t } = useTranslation();

  const personas = [
    {
      icon: Stethoscope,
      title: t("home.personas.healthcareTitle"),
      description: t("home.personas.healthcareDesc"),
      bullets: [t("home.personas.healthcareBullet1"), t("home.personas.healthcareBullet2"), t("home.personas.healthcareBullet3")],
    },
    {
      icon: Building2,
      title: t("home.personas.marketingTitle"),
      description: t("home.personas.marketingDesc"),
      bullets: [t("home.personas.marketingBullet1"), t("home.personas.marketingBullet2"), t("home.personas.marketingBullet3")],
    },
    {
      icon: TrendingUp,
      title: t("home.personas.executiveTitle"),
      description: t("home.personas.executiveDesc"),
      bullets: [t("home.personas.executiveBullet1"), t("home.personas.executiveBullet2"), t("home.personas.executiveBullet3")],
    },
    {
      icon: FileText,
      title: t("home.personas.grantTitle"),
      description: t("home.personas.grantDesc"),
      bullets: [t("home.personas.grantBullet1"), t("home.personas.grantBullet2"), t("home.personas.grantBullet3")],
    },
    {
      icon: Users,
      title: t("home.personas.hrTitle"),
      description: t("home.personas.hrDesc"),
      bullets: [t("home.personas.hrBullet1"), t("home.personas.hrBullet2"), t("home.personas.hrBullet3")],
    },
    {
      icon: Briefcase,
      title: t("home.personas.multiTitle"),
      description: t("home.personas.multiDesc"),
      bullets: [t("home.personas.multiBullet1"), t("home.personas.multiBullet2"), t("home.personas.multiBullet3")],
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 block">
            {t("home.personas.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-4">
            {t("home.personas.title1")}{" "}
            <span className="gradient-hero-text">{t("home.personas.title2")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.personas.subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas.map((persona, i) => (
            <div
              key={persona.title}
              className="glass-card rounded-xl p-6 card-hover animate-fade-up flex flex-col"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 shadow-glow-sm">
                <persona.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold font-heading text-foreground mb-2">
                {persona.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {persona.description}
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {persona.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                {t("home.personas.getStarted")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
