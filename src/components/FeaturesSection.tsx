import { useTranslation } from "react-i18next";
import {
  Zap,
  Brain,
  Stethoscope,
  Shield,
  Mic,
  Bot,
  Plug,
  FileText,
  Users,
} from "lucide-react";

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    { icon: Stethoscope, title: t("home.features.clinicalBuilder"), description: t("home.features.clinicalBuilderDesc") },
    { icon: Brain, title: t("home.features.multiLlm"), description: t("home.features.multiLlmDesc") },
    { icon: Zap, title: t("home.features.medicalSkills"), description: t("home.features.medicalSkillsDesc") },
    { icon: Shield, title: t("home.features.hipaaFirst"), description: t("home.features.hipaaFirstDesc") },
    { icon: Mic, title: t("home.features.voiceAi"), description: t("home.features.voiceAiDesc") },
    { icon: Bot, title: t("home.features.templates"), description: t("home.features.templatesDesc") },
    { icon: Plug, title: t("home.features.ehr"), description: t("home.features.ehrDesc") },
    { icon: FileText, title: t("home.features.docs"), description: t("home.features.docsDesc") },
    { icon: Users, title: t("home.features.team"), description: t("home.features.teamDesc") },
  ];

  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 block">
            {t("home.features.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-4">
            {t("home.features.title1")}{" "}
            <span className="gradient-hero-text">{t("home.features.title2")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.features.subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card rounded-xl p-6 card-hover animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 shadow-glow-sm">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold font-heading text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
