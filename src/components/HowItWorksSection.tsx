import { useTranslation } from "react-i18next";
import { UserPlus, Puzzle, Rocket } from "lucide-react";

export default function HowItWorksSection() {
  const { t } = useTranslation();

  const steps = [
    { icon: UserPlus, title: t("home.howItWorks.step1Title"), description: t("home.howItWorks.step1Desc") },
    { icon: Puzzle,   title: t("home.howItWorks.step2Title"), description: t("home.howItWorks.step2Desc") },
    { icon: Rocket,   title: t("home.howItWorks.step3Title"), description: t("home.howItWorks.step3Desc") },
  ];

  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 block">
            {t("home.howItWorks.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-4">
            {t("home.howItWorks.title1")}{" "}
            <span className="gradient-hero-text">{t("home.howItWorks.title2")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.howItWorks.subtitle")}
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-blue-500/50 via-cyan-500/50 to-blue-500/50" />
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="text-center animate-fade-up"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-glow relative z-10">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-cyan-500 text-white text-xs font-bold flex items-center justify-center z-20">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold font-heading text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
