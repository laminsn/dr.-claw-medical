import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/dr-claw-logo.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-float inline-block mb-8">
            <img src={logo} alt="Dr. Claw mascot" className="h-28 w-28 mx-auto" />
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight animate-fade-up">
            The AI Platform Built for{" "}
            <span className="gradient-hero-text">Healthcare</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto animate-fade-up" style={{ animationDelay: "200ms" }}>
            Pre-trained AI agents for medical execs, agency owners, and office staff. 
            One-click setup. HIPAA-ready. Starting at just $49/mo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-fade-up" style={{ animationDelay: "400ms" }}>
            <Link
              to="/dashboard"
              className="gradient-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity shadow-glow"
            >
              Start Free Trial
            </Link>
            <a
              href="#features"
              className="px-8 py-3.5 rounded-xl font-semibold text-base border border-border text-foreground hover:bg-secondary transition-colors"
            >
              See Features
            </a>
          </div>

          <p className="mt-6 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "600ms" }}>
            No credit card required · 14-day free trial · HIPAA compliant
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
