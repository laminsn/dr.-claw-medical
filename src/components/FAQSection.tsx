import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { question: t("home.faq.q1"), answer: t("home.faq.a1") },
    { question: t("home.faq.q2"), answer: t("home.faq.a2") },
    { question: t("home.faq.q3"), answer: t("home.faq.a3") },
    { question: t("home.faq.q4"), answer: t("home.faq.a4") },
    { question: t("home.faq.q5"), answer: t("home.faq.a5") },
    { question: t("home.faq.q6"), answer: t("home.faq.a6") },
    { question: t("home.faq.q7"), answer: t("home.faq.a7") },
    { question: t("home.faq.q8"), answer: t("home.faq.a8") },
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 block">
            {t("home.faq.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-4">
            {t("home.faq.title1")}{" "}
            <span className="gradient-hero-text">{t("home.faq.title2")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.faq.subtitle")}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="glass-card rounded-xl overflow-hidden animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-semibold text-foreground pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
