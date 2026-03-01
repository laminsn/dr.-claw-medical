import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Shield, FileCheck, Lock, Brain } from "lucide-react";
import { useTranslation } from "react-i18next";

const poweredBy = ["OpenAI", "Claude", "Gemini", "MiniMax", "Kimi", "ElevenLabs"];

export default function HeroSection() {
  const { t } = useTranslation();
  const [scrollY, setScrollY] = useState(0);

  // Track scroll position for background parallax motion
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 bg-[#070B14]">
      {/* Parallax Ambient Glow Effects - Strict Aqua to Royal Blue */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00D2FF]/25 rounded-full blur-[160px] pointer-events-none will-change-transform"
        style={{ transform: `translateY(${scrollY * 0.35}px)` }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#2563EB]/30 rounded-full blur-[140px] pointer-events-none will-change-transform"
        style={{ transform: `translateY(${scrollY * -0.2}px)` }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0284C7]/20 rounded-full blur-[200px] pointer-events-none will-change-transform"
        style={{ transform: `translateY(${scrollY * 0.15}px)` }}
      />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* THE MAIN LIQUID GLASS PANEL - Thickened and detailed */}
        <div className="p-8 sm:p-12 md:p-16 rounded-[3rem]
          backdrop-blur-[40px] bg-gradient-to-br from-white/[0.08] to-transparent
          border border-white/[0.15] border-t-white/[0.5] border-l-white/[0.4]
          shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_6px_15px_rgba(255,255,255,0.1),0_30px_60px_rgba(0,0,0,0.8)]
          overflow-hidden relative">

          {/* Glossy top edge highlight reflection */}
          <div className="absolute top-0 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

          {/* Liquid Glass Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
            backdrop-blur-xl bg-[#00D2FF]/10
            border border-[#00D2FF]/20 border-t-[#00D2FF]/50
            shadow-[inset_0_2px_4px_rgba(0,210,255,0.3)]
            text-[#00D2FF] text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse" />
            {t("hero.badge")}
          </div>

          {/* Headline - Strict Aqua to Royal Blue Gradient */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-heading leading-[1.1] mb-6 animate-fade-up text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00D2FF] to-[#2563EB] drop-shadow-md">
              {t("hero.title1")}
            </span>{" "}
            <br className="hidden sm:block" />
            {t("hero.title2")}
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-8 animate-fade-up leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 mb-10 animate-fade-up">
            <div className="flex items-center gap-1.5 text-sm text-white/70 font-medium">
              <Shield className="w-4 h-4 text-[#00D2FF] drop-shadow-[0_0_5px_rgba(0,210,255,0.5)]" />
              {t("hero.hipaa")}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/70 font-medium">
              <FileCheck className="w-4 h-4 text-[#00D2FF] drop-shadow-[0_0_5px_rgba(0,210,255,0.5)]" />
              {t("hero.baa")}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/70 font-medium">
              <Lock className="w-4 h-4 text-[#00D2FF] drop-shadow-[0_0_5px_rgba(0,210,255,0.5)]" />
              {t("hero.soc2")}
            </div>
          </div>

          {/* 3D Liquid Droplet CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16 animate-fade-up">
            <Link
              to="/auth"
              className="px-8 py-4 rounded-full
                backdrop-blur-xl bg-[#00D2FF]/20
                border border-[#00D2FF]/30 border-t-[#00D2FF]/70 border-l-[#00D2FF]/50
                shadow-[inset_0_2px_5px_rgba(255,255,255,0.5),0_10px_25px_rgba(0,210,255,0.2)]
                hover:bg-[#00D2FF]/30 hover:-translate-y-1 hover:shadow-[inset_0_2px_5px_rgba(255,255,255,0.6),0_15px_30px_rgba(0,210,255,0.4)]
                transition-all duration-300 inline-flex items-center gap-2 text-lg text-white font-semibold tracking-wide"
            >
              {t("hero.startFreeTrial")}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-full
                backdrop-blur-xl bg-white/5
                border border-white/15 border-t-white/50 border-l-white/40
                shadow-[inset_0_2px_5px_rgba(255,255,255,0.4),0_10px_25px_rgba(0,0,0,0.4)]
                hover:bg-white/10 hover:-translate-y-1 hover:shadow-[inset_0_2px_5px_rgba(255,255,255,0.5),0_15px_30px_rgba(0,0,0,0.5)]
                transition-all duration-300 inline-flex items-center gap-2 text-lg text-white font-semibold tracking-wide"
            >
              <Play className="w-5 h-5 text-[#00D2FF]" />
              {t("hero.seeHowItWorks")}
            </a>
          </div>

          {/* Powered By - Liquid Glass Pills */}
          <div className="animate-fade-up pt-8 border-t border-white/15">
            <p className="text-xs text-white/50 uppercase tracking-widest mb-6 font-semibold">
              {t("hero.poweredBy")}
            </p>
            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
              {poweredBy.map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl
                    backdrop-blur-xl bg-white/[0.05]
                    border border-white/15 border-t-white/40
                    shadow-[inset_0_1px_3px_rgba(255,255,255,0.2)]"
                >
                  <Brain className="h-4 w-4 text-[#00D2FF]" />
                  <span className="text-sm text-white/80 font-medium">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
