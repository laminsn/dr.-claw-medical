import { Link } from "react-router-dom";
import logo from "@/assets/dr-claw-logo-transparent.png";
import ComplianceBadges from "@/components/ComplianceBadges";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(217 100% 59% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(217 100% 59% / 0.3) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="container mx-auto px-6 relative z-10 pt-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-float inline-block mb-10">
            <div className="relative">
              <img src={logo} alt="Dr. Claw mascot" className="h-24 w-24 mx-auto relative z-10" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-150" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8 animate-fade-up">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            AI-Powered Healthcare Platform
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] animate-fade-up tracking-tight">
            The AI Platform{" "}
            <br className="hidden sm:block" />
            Built for{" "}
            <span className="gradient-hero-text">Healthcare</span>
          </h1>

          <p className="mt-8 text-lg text-muted-foreground max-w-lg mx-auto animate-fade-up leading-relaxed" style={{ animationDelay: "200ms" }}>
            Pre-trained AI agents for medical execs, agency owners, and office staff. 
            One-click setup. Simple implementation. Starting at $49/mo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 animate-fade-up" style={{ animationDelay: "400ms" }}>
            <Link
              to="/auth"
              className="gradient-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-base hover:opacity-90 transition-all shadow-glow"
            >
              Start Free Trial
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-xl font-semibold text-base border border-border text-foreground hover:border-primary/40 hover:text-primary transition-all"
            >
              See Features
            </a>
          </div>

          {/* Compliance Badges */}
          <div className="mt-10 flex justify-center animate-fade-in" style={{ animationDelay: "600ms" }}>
            <ComplianceBadges />
          </div>

          <p className="mt-6 text-xs text-muted-foreground animate-fade-in flex items-center justify-center gap-4" style={{ animationDelay: "800ms" }}>
            <span>No credit card required</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span>14-day free trial</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span>Safe &amp; open-source ready</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
