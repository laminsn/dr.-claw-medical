import { Stethoscope, Building2, Users, Heart, Bone, Baby, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const personas = [
  {
    icon: Stethoscope,
    title: "Primary Care & Family Medicine",
    description: "Automate appointment scheduling, patient follow-ups, preventive care reminders, and chronic disease management outreach across your patient panel.",
    features: ["Annual wellness visit reminders", "Chronic care follow-ups", "Lab result notifications"],
  },
  {
    icon: Building2,
    title: "Multi-Specialty Groups",
    description: "Deploy AI agents across locations. Centralize referral management, coordinate between specialists, and maintain consistent patient communication.",
    features: ["Cross-location scheduling", "Specialist referral routing", "Centralized analytics"],
  },
  {
    icon: Users,
    title: "Urgent Care & Walk-In Clinics",
    description: "Manage high patient volume with AI-powered triage, wait time communication, and follow-up coordination to reduce readmissions.",
    features: ["Wait time updates", "Post-visit follow-ups", "Insurance pre-verification"],
  },
  {
    icon: Heart,
    title: "Cardiology & Internal Medicine",
    description: "Monitor patient adherence to medication regimens, automate post-procedure check-ins, and streamline prior authorization for imaging and procedures.",
    features: ["Medication adherence calls", "Post-procedure follow-ups", "Prior auth automation"],
  },
  {
    icon: Bone,
    title: "Orthopedics & Surgical Centers",
    description: "Pre-op preparation calls, post-surgical recovery check-ins, physical therapy scheduling, and surgical clearance coordination — all automated.",
    features: ["Pre-op preparation", "Recovery check-ins", "PT scheduling"],
  },
  {
    icon: Baby,
    title: "Pediatrics & OB/GYN",
    description: "Well-child visit scheduling, vaccine reminders, prenatal appointment coordination, and parent communication that builds lasting trust.",
    features: ["Vaccine schedule reminders", "Prenatal visit coordination", "Parent outreach"],
  },
];

const PersonasSection = () => {
  return (
    <section id="personas" className="py-32 relative">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">Specialties</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Purpose-Built for{" "}
            <span className="gradient-hero-text">Every Specialty</span>
          </h2>
          <p className="mt-5 text-muted-foreground max-w-lg mx-auto text-lg">
            Pre-configured AI agents with specialty-specific skills. Choose your medical focus and deploy immediately.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {personas.map((persona) => (
            <div
              key={persona.title}
              className="group relative bg-card rounded-xl border border-border p-6 hover:border-primary/20 transition-all"
            >
              <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 group-hover:shadow-glow transition-shadow duration-500">
                <persona.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-3">
                {persona.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                {persona.description}
              </p>
              <ul className="space-y-2.5 mb-6">
                {persona.features.map((f) => (
                  <li key={f} className="text-sm text-foreground/80 flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:gap-3 transition-all">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonasSection;
