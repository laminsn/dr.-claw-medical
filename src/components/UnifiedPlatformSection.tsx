import { useTranslation } from "react-i18next";
import { ShieldCheck, Lock, Layers, HeartPulse, Users, Zap } from "lucide-react";
import PlatformDiagram from "@/components/PlatformDiagram";

export default function UnifiedPlatformSection() {
  const { t } = useTranslation();

  const pillars = [
    { icon: ShieldCheck, titleKey: "home.unified.pillarHipaaTitle", descKey: "home.unified.pillarHipaaDesc",       color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
    { icon: Lock,        titleKey: "home.unified.pillarZoneTitle",  descKey: "home.unified.pillarZoneDesc",        color: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/20" },
    { icon: Layers,      titleKey: "home.unified.pillarWorkspaceTitle", descKey: "home.unified.pillarWorkspaceDesc", color: "text-cyan-400",   bg: "bg-cyan-400/10 border-cyan-400/20" },
    { icon: HeartPulse,  titleKey: "home.unified.pillarHealthcareTitle", descKey: "home.unified.pillarHealthcareDesc", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
    { icon: Users,       titleKey: "home.unified.pillarTeamTitle",  descKey: "home.unified.pillarTeamDesc",        color: "text-violet-400",  bg: "bg-violet-400/10 border-violet-400/20" },
    { icon: Zap,         titleKey: "home.unified.pillarDeployTitle", descKey: "home.unified.pillarDeployDesc",     color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20" },
  ];

  const badges = ["HIPAA Compliant", "BAA Available", "SOC 2 Certified", "PHI Zone Isolation", "End-to-End Encryption"];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 block">
            {t("home.unified.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-5">
            {t("home.unified.title1")}{" "}
            <span className="gradient-hero-text">{t("home.unified.title2")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("home.unified.subtitle")}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {pillars.map((pillar, i) => (
            <div
              key={pillar.titleKey}
              className="glass-card rounded-xl p-6 card-hover animate-fade-up border border-border"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`w-12 h-12 rounded-lg border flex items-center justify-center mb-4 ${pillar.bg}`}>
                <pillar.icon className={`w-6 h-6 ${pillar.color}`} />
              </div>
              <h3 className="text-lg font-semibold font-heading text-foreground mb-2">
                {t(pillar.titleKey)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(pillar.descKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Interactive Platform Diagram */}
        <div className="mb-14">
          <div className="text-center mb-8 animate-fade-up">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              {t("home.unified.demoLabel")}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-heading mt-1">
              {t("home.unified.demoTitle")}
            </h3>
          </div>
          <PlatformDiagram />
        </div>

        {/* Callout Banner */}
        <div className="glass-card rounded-2xl p-8 sm:p-10 border border-primary/20 text-center animate-fade-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <span className="text-xl font-bold font-heading text-foreground">
              {t("home.unified.bannerTitle")}
            </span>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
            {t("home.unified.bannerDesc")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            {badges.map((badge) => (
              <span
                key={badge}
                className="text-xs px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 font-medium"
              >
                ✓ {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
