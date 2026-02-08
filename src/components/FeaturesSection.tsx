import { Bot, CalendarCheck, FileText, Phone, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Pre-Trained Medical AI",
    description: "AI assistants that understand HIPAA, CPT codes, insurance lingo, and patient communication from day one.",
  },
  {
    icon: Phone,
    title: "Multi-Channel Outreach",
    description: "Automated calls, SMS, and emails for appointment reminders, follow-ups, and patient engagement.",
  },
  {
    icon: CalendarCheck,
    title: "Smart Scheduling",
    description: "AI-powered scheduling that reduces no-shows and optimizes your daily patient flow.",
  },
  {
    icon: FileText,
    title: "Document Automation",
    description: "Generate referral letters, insurance forms, and patient summaries in seconds.",
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Enterprise-grade security with end-to-end encryption. Your patient data stays protected.",
  },
  {
    icon: Zap,
    title: "One-Click Setup",
    description: "Go from zero to fully operational in under 10 minutes. No technical expertise required.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Everything Your Practice Needs
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Purpose-built AI tools for healthcare professionals — not generic software adapted for medicine.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:shadow-glow hover:border-primary/30 transition-all duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
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
};

export default FeaturesSection;
