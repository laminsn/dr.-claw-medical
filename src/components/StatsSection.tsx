import { useTranslation } from "react-i18next";

export default function StatsSection() {
  const { t } = useTranslation();

  const stats = [
    { value: "10,000+", label: t("home.stats.providers") },
    { value: "2M+", label: t("home.stats.tasks") },
    { value: "30+", label: t("home.stats.skills") },
    { value: "94%", label: t("home.stats.completion") },
    { value: "<5 min", label: t("home.stats.setup") },
    { value: "99.9%", label: t("home.stats.uptime") },
  ];

  return (
    <section className="relative py-16">
      <div className="section-divider" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold font-heading gradient-hero-text mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="section-divider mt-16" />
    </section>
  );
}
