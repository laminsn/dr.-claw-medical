const stats = [
  {
    value: "2,500+",
    label: "Healthcare Practices",
    description: "Active clinics, hospitals, and medical groups",
  },
  {
    value: "1.2M+",
    label: "Patient Interactions",
    description: "Calls, messages, and follow-ups handled monthly",
  },
  {
    value: "94%",
    label: "Success Rate",
    description: "Average agent task completion across all practices",
  },
  {
    value: "40%",
    label: "No-Show Reduction",
    description: "Average decrease in missed appointments",
  },
  {
    value: "<5 min",
    label: "Setup Time",
    description: "From sign-up to first live AI agent deployed",
  },
  {
    value: "99.9%",
    label: "Uptime",
    description: "Platform availability with enterprise-grade infrastructure",
  },
];

const StatsSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-[0.03]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold tracking-widest uppercase mb-4">
            By the Numbers
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Healthcare AI That{" "}
            <span className="gradient-hero-text">Delivers</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center group"
            >
              <p className="font-display text-4xl md:text-5xl font-bold gradient-hero-text inline-block mb-2">
                {stat.value}
              </p>
              <p className="font-display text-foreground font-semibold text-sm">
                {stat.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
