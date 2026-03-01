import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Shield, FileCheck, Lock, Brain } from "lucide-react";
import { useTranslation } from "react-i18next";

const poweredBy = ["OpenAI", "Claude", "Gemini", "MiniMax", "Kimi", "ElevenLabs"];

export default function HeroSection() {
  const { t } = useTranslation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track mouse movement for the interactive background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Calculate parallax offsets relative to the center of the screen
  const xOffset = typeof window !== "undefined" ? mousePos.x - window.innerWidth / 2 : 0;
  const yOffset = typeof window !== "undefined" ? mousePos.y - window.innerHeight / 2 : 0;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 bg-[#0B0C10]">

      {/* Interactive Ambient Glow Effects - Following the Cursor */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/30 rounded-full blur-[160px] pointer-events-none transition-transform duration-700 ease-out"
        style={{ transform: `translate(${xOffset * 0.08}px, ${yOffset * 0.08}px)` }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[140px] pointer-events-none transition-transform duration-1000 ease-out"
        style={{ transform: `translate(${xOffset * -0.05}px, ${yOffset * -0.05}px)` }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[200px] pointer-events-none transition-transform duration-500 ease-out"
        style={{ transform: `translate(${xOffset * 0.03}px, ${yOffset * 0.03}px)` }}
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

        {/* THE MAIN LIQUID GLASS PANEL */}
        <div className="p-8 sm:p-12 md:p-16 rounded-[3rem]
          backdrop-blur-3xl bg-white/[0.02]
          border border-white/10 border-t-white/40 border-l-white/30
          shadow-[inset_0_4px_10px_rgba(255,255,255,0.2),inset_0_-4px_10px_rgba(255,255,255,0.02),0_25px_50px_rgba(0,0,0,0.6)]
          overflow-hidden relative transition-all duration-500">

          {/* Glossy top edge highlight reflection */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

          {/* Liquid Glass Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
            backdrop-blur-md bg-cyan-500/10
            border border-cyan-400/20 border-t-cyan-300/50
            shadow-[inset_0_2px_4px_rgba(69,243,255,0.3)]
            text-cyan-200 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {t("hero.badge")}
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-heading leading-[1.1] mb-6 animate-fade-up text-white text-shadow-sm">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 drop-shadow-md">
              {t("hero.title1")}
            </span>{" "}
            <br className="hidden sm:block" />
            {t("hero.title2")}
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto mb-8 animate-fade-up leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 mb-10 animate-fade-up">
            <div className="flex items-center gap-1.5 text-sm text-white/60 font-medium">
              <Shield className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
              {t("hero.hipaa")}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/60 font-medium">
              <FileCheck className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
              {t("hero.baa")}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/60 font-medium">
              <Lock className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
              {t("hero.soc2")}
            </div>
          </div>

          {/* 3D Liquid Droplet CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16 animate-fade-up">
            <Link
              to="/auth"
              className="px-8 py-4 rounded-full
                backdrop-blur-xl bg-cyan-500/20
                border border-cyan-300/30 border-t-cyan-100/70 border-l-cyan-100/50
                shadow-[inset_0_2px_5px_rgba(255,255,255,0.5),0_10px_25px_rgba(69,243,255,0.2)]
                hover:bg-cyan-500/30 hover:-translate-y-1 hover:shadow-[inset_0_2px_5px_rgba(255,255,255,0.6),0_15px_30px_rgba(69,243,255,0.4)]
                transition-all duration-300 inline-flex items-center gap-2 text-lg text-white font-semibold tracking-wide"
            >
              {t("hero.startFreeTrial")}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-full
                backdrop-blur-xl bg-white/5
                border border-white/10 border-t-white/40 border-l-white/30
                shadow-[inset_0_2px_5px_rgba(255,255,255,0.3),0_10px_25px_rgba(0,0,0,0.3)]
                hover:bg-white/10 hover:-translate-y-1 hover:shadow-[inset_0_2px_5px_rgba(255,255,255,0.4),0_15px_30px_rgba(0,0,0,0.4)]
                transition-all duration-300 inline-flex items-center gap-2 text-lg text-white font-semibold tracking-wide"
            >
              <Play className="w-5 h-5 text-cyan-300" />
              {t("hero.seeHowItWorks")}
            </a>
          </div>

          {/* Powered By - Liquid Glass Pills */}
          <div className="animate-fade-up pt-8 border-t border-white/10">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-6 font-semibold">
              {t("hero.poweredBy")}
            </p>
            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
              {poweredBy.map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl
                    backdrop-blur-md bg-white/[0.03]
                    border border-white/10 border-t-white/30
                    shadow-[inset_0_1px_3px_rgba(255,255,255,0.15)]"
                >
                  <Brain className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-white/70 font-medium">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
