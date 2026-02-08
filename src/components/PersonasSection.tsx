import { Stethoscope, Building2, Users } from "lucide-react";

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
    <section id="personas" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Built For Healthcare Teams
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Pre-configured AI workflows for every role in your medical practice.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {personas.map((persona) => (
            <div
              key={persona.title}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 hover:shadow-glow transition-all duration-300"
            >
              <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mb-6">
                <persona.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
                {persona.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {persona.description}
              </p>
              <ul className="space-y-2">
                {persona.features.map((f) => (
                  <li key={f} className="text-sm text-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full gradient-accent inline-block" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonasSection;
