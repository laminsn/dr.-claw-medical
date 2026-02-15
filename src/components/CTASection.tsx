import { Link } from "react-router-dom";
import { Shield, Zap, Clock } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-[0.06]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Transform Your{" "}
            <span className="gradient-hero-text">Practice?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of healthcare professionals already using AI agents
            to reduce admin burden, cut no-shows, and deliver better patient
            care.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link
              to="/auth"
              className="gradient-primary text-primary-foreground px-10 py-4 rounded-xl font-semibold text-base hover:opacity-90 transition-all shadow-glow"
            >
              Start Your Free Trial
            </Link>
            <a
              href="#pricing"
              className="px-10 py-4 rounded-xl font-semibold text-base border border-border text-foreground hover:border-primary/40 hover:text-primary transition-all"
            >
              View Pricing
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 flex-wrap">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" /> HIPAA & BAA Secured
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" /> 14-Day Free Trial
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" /> No Credit Card Required
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
