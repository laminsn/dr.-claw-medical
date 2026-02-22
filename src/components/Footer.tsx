import { Link } from "react-router-dom";
import { Shield, FileCheck, Lock, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  const productLinks = [
    { label: t("footer.features"), href: "#features" },
    { label: t("footer.howItWorks"), href: "#how-it-works" },
    { label: t("footer.pricing"), href: "#pricing" },
    { label: t("footer.integrations"), href: "#integrations" },
    { label: t("footer.templates"), href: "#templates" },
    { label: t("footer.faq"), href: "#faq" },
  ];

  const solutionLinks = [
    { label: t("footer.medicalPractices"), href: "/auth" },
    { label: t("footer.healthSystems"), href: "/auth" },
    { label: t("footer.specialtyClinics"), href: "/auth" },
    { label: t("footer.telehealth"), href: "/auth" },
    { label: t("footer.clinicalResearch"), href: "/auth" },
    { label: t("footer.revenueCycle"), href: "/auth" },
  ];

  const complianceLinks = [
    { label: t("footer.hipaaCompliance"), href: "/compliance/hipaa" },
    { label: t("footer.baaInformation"), href: "/compliance/baa" },
    { label: t("footer.soc2Certification"), href: "/compliance/soc2" },
    { label: t("footer.privacyPolicy"), href: "/privacy" },
    { label: t("footer.termsOfService"), href: "/terms" },
    { label: t("footer.security"), href: "/security" },
  ];

  return (
    <footer className="border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Column 1-2: Logo + Description + Badges */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow-sm">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold font-heading gradient-hero-text">
                Dr. Claw
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-sm">
              {t("footer.description")}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Shield className="w-4 h-4" />
                HIPAA
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <FileCheck className="w-4 h-4" />
                BAA
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Lock className="w-4 h-4" />
                SOC 2
              </div>
            </div>
          </div>

          {/* Column 3: Product */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t("footer.product")}</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Solutions */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t("footer.solutions")}</h4>
            <ul className="space-y-3">
              {solutionLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Compliance */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">
              {t("footer.compliance")}
            </h4>
            <ul className="space-y-3">
              {complianceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Dr. Claw. {t("footer.allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}
