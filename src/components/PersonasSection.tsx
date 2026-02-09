import { Stethoscope, Building2, Users, ArrowRight } from "lucide-react";

const personas = [
  {
    icon: Stethoscope,
    title: "Medical Executives",
    description: "Strategic AI tools for practice growth, patient acquisition funnels, and operational analytics.",
    features: ["Revenue forecasting", "Patient pipeline analytics", "Market positioning"],
  },
  {
    icon: Building2,
    title: "Agency Owners",
    description: "White-label AI solutions to serve your healthcare clients at scale with zero extra overhead.",
    features: ["Multi-client management", "Branded dashboards", "Automated reporting"],
  },
  {
    icon: Users,
    title: "Office Staff",
    description: "Streamline daily tasks with AI that handles scheduling, follow-ups, and paperwork automatically.",
    features: ["Smart call handling", "Automated reminders", "Document generation"],
  },
];

const PersonasSection = () => {
  return (
    <section id="personas" className="py-32 relative">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">Who It's For</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Built For Healthcare Teams
          </h2>
          <p className="mt-5 text-muted-foreground max-w-lg mx-auto text-lg">
            Pre-configured AI workflows for every role in your medical practice.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {personas.map((persona) => (
            <div
              key={persona.title}
              className="group relative"
            >
              <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 group-hover:shadow-glow transition-shadow duration-500">
                <persona.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                {persona.title}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {persona.description}
              </p>
              <ul className="space-y-3 mb-6">
                {persona.features.map((f) => (
                  <li key={f} className="text-sm text-foreground/80 flex items-center gap-3">
                    <span className="h-1 w-1 rounded-full bg-primary inline-block" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:gap-3 transition-all">
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonasSection;
