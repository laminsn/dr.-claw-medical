import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,255,255,0.15),transparent_60%)]" />

          <div className="relative z-10 text-center py-16 px-6 sm:px-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white mb-4">
              {t("home.cta.title")}
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-10">
              {t("home.cta.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                to="/auth"
                className="bg-white text-blue-600 font-semibold px-8 py-3.5 rounded-lg hover:bg-blue-50 transition-colors inline-flex items-center gap-2 text-lg"
              >
                {t("home.cta.startTrial")}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#pricing"
                className="border border-white/30 text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors inline-flex items-center gap-2 text-lg"
              >
                {t("home.cta.viewPricing")}
              </a>
            </div>

            <p className="text-sm text-blue-200">
              {t("home.cta.footer")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
