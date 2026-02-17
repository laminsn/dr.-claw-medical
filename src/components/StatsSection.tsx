const stats = [
  { value: "10,000+", label: "Healthcare Providers" },
  { value: "2M+", label: "Clinical Tasks/mo" },
  { value: "30+", label: "Medical AI Skills" },
  { value: "94%", label: "Task Completion" },
  { value: "<5 min", label: "Practice Setup" },
  { value: "99.9%", label: "HIPAA Uptime" },
];

export default function StatsSection() {
  return (
    <section className="relative py-16">
      {/* Top Divider */}
      <div className="section-divider" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold font-heading gradient-hero-text mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Divider */}
      <div className="section-divider mt-16" />
    </section>
  );
}
