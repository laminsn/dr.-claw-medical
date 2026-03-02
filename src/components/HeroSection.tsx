import { Link } from "react-router-dom";
import { ArrowRight, Play, Shield, FileCheck, Lock, Bot, Zap, Brain, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const poweredBy = ["OpenAI", "Claude", "Gemini", "MiniMax", "Kimi", "ElevenLabs"];

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[160px] animate-pulse-glow" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[140px] animate-pulse-glow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Floating decorative elements */}
      <div className="absolute top-32 right-[12%] hidden lg:block animate-float opacity-10">
        <Zap className="h-28 w-28 text-primary" />
      </div>
      <div className="absolute bottom-40 left-[8%] hidden lg:block animate-float opacity-[0.06]" style={{ animationDelay: "3s" }}>
        <Bot className="h-16 w-16 text-primary" />
      </div>
      <div className="absolute top-48 left-[15%] hidden xl:block animate-float opacity-[0.06]" style={{ animationDelay: "1.5s" }}>
        <Sparkles className="h-12 w-12 text-cyan-400" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          {t("hero.badge")}
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-heading leading-[1.1] mb-6 animate-fade-up">
          <span className="gradient-hero-text">{t("hero.title1")}</span>{" "}
          <br className="hidden sm:block" />
          {t("hero.title2")}
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-up leading-relaxed">
          {t("hero.subtitle")}
        </p>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 mb-10 animate-fade-up">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-emerald-400" />
            {t("hero.hipaa")}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            {t("hero.baa")}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock className="w-4 h-4 text-emerald-400" />
            {t("hero.soc2")}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up">
          <Link
            to="/auth"
            className="gradient-primary text-white font-semibold px-8 py-3.5 rounded-xl shadow-glow hover:opacity-90 transition-all hover:shadow-glow-sm inline-flex items-center gap-2 text-lg"
          >
            {t("hero.startFreeTrial")}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#how-it-works"
            className="glass-card text-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-secondary transition-colors inline-flex items-center gap-2 text-lg border border-border"
          >
            <Play className="w-5 h-5" />
            {t("hero.seeHowItWorks")}
          </a>
        </div>

        {/* Powered By */}
        <div className="animate-fade-up">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-5">
            {t("hero.poweredBy")}
          </p>
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            {poweredBy.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border"
              >
                <Brain className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
