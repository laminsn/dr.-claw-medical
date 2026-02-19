import { useTranslation } from "react-i18next";
import { Star, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const { t } = useTranslation();

  const testimonials = [
    { quote: t("home.testimonials.q1"), name: t("home.testimonials.n1"), title: t("home.testimonials.t1"), rating: 5 },
    { quote: t("home.testimonials.q2"), name: t("home.testimonials.n2"), title: t("home.testimonials.t2"), rating: 5 },
    { quote: t("home.testimonials.q3"), name: t("home.testimonials.n3"), title: t("home.testimonials.t3"), rating: 5 },
    { quote: t("home.testimonials.q4"), name: t("home.testimonials.n4"), title: t("home.testimonials.t4"), rating: 5 },
    { quote: t("home.testimonials.q5"), name: t("home.testimonials.n5"), title: t("home.testimonials.t5"), rating: 5 },
    { quote: t("home.testimonials.q6"), name: t("home.testimonials.n6"), title: t("home.testimonials.t6"), rating: 5 },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 block">
            {t("home.testimonials.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-4">
            {t("home.testimonials.title1")}{" "}
            <span className="gradient-hero-text">{t("home.testimonials.title2")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.testimonials.subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <div
              key={item.name}
              className="glass-card rounded-xl p-6 card-hover animate-fade-up flex flex-col"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Quote className="w-8 h-8 text-blue-500/30 mb-4" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed flex-1 mb-6">
                "{item.quote}"
              </p>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
