import { Link } from "react-router-dom";
import { ArrowRight, Play, Shield, FileCheck, Lock } from "lucide-react";

const poweredBy = [
  { name: "OpenAI", logo: "/logos/openai.svg" },
  { name: "Claude", logo: "/logos/claude.svg" },
  { name: "Gemini", logo: "/logos/gemini.svg" },
  { name: "MiniMax", logo: "/logos/minimax.svg" },
  { name: "Kimi", logo: "/logos/kimi.svg" },
  { name: "ElevenLabs", logo: "/logos/elevenlabs.svg" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[128px] animate-pulse-glow" />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Floating Logo */}
      <div className="absolute top-32 right-[10%] hidden lg:block animate-float opacity-20">
        <img src="/Dr. Claw Logo.png" alt="" className="h-32 w-32" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Enterprise AI Agent Platform
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-heading leading-tight mb-6 animate-fade-up">
          <span className="gradient-hero-text">AI Agents</span> That{" "}
          <br className="hidden sm:block" />
          Work For You
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-8 animate-fade-up leading-relaxed">
          Deploy AI agents with C-suite strategy skills, healthcare operations,
          professional content creation, and more. Choose your models, assign
          skills, and let your AI team handle the rest.
        </p>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 mb-10 animate-fade-up">
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <Shield className="w-4 h-4 text-green-400" />
            HIPAA Compliant
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <FileCheck className="w-4 h-4 text-green-400" />
            BAA Available
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <Lock className="w-4 h-4 text-green-400" />
            SOC 2
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up">
          <Link
            to="/auth"
            className="gradient-primary text-white font-semibold px-8 py-3.5 rounded-lg shadow-glow hover:opacity-90 transition-opacity inline-flex items-center gap-2 text-lg"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#how-it-works"
            className="glass-card text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors inline-flex items-center gap-2 text-lg"
          >
            <Play className="w-5 h-5" />
            See How It Works
          </a>
        </div>

        {/* Powered By */}
        <div className="animate-fade-up">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">
            Powered By
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap opacity-50">
            {poweredBy.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <img
                  src={item.logo}
                  alt={item.name}
                  className="h-6 w-auto brightness-0 invert"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="text-sm text-slate-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
