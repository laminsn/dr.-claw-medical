import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Shield, Lock, FileText, ArrowLeft, AlertTriangle } from "lucide-react";

const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("terms.backToHome")}
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold font-heading gradient-hero-text mb-3">
            {t("terms.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("terms.lastUpdated")}
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <Shield className="h-3.5 w-3.5 text-primary/70" />
              {t("terms.hipaaCompliant")}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <FileText className="h-3.5 w-3.5 text-primary/70" />
              {t("terms.soc2")}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <Lock className="h-3.5 w-3.5 text-primary/70" />
              {t("terms.encrypted")}
            </div>
          </div>
        </div>

        {/* Section 1: Acceptance of Terms */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            {t("terms.section1Title")}
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {t("terms.section1Content")}
          </p>
        </div>

        {/* Section 2: Service Description */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            {t("terms.section2Title")}
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {t("terms.section2Content")}
          </p>
        </div>

        {/* Section 3: User Responsibilities */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            {t("terms.section3Title")}
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {t("terms.section3Content")}
          </p>
        </div>

        {/* Section 4: Data Protection & Privacy */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            {t("terms.section4Title")}
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            {t("terms.section4Content1")}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">
            {t("terms.section4Content2")}
          </p>
          <ul className="list-disc list-inside text-sm text-foreground/80 leading-relaxed space-y-2 ml-2">
            <li>{t("terms.section4Bullet1")}</li>
            <li>{t("terms.section4Bullet2")}</li>
            <li>{t("terms.section4Bullet3")}</li>
            <li>{t("terms.section4Bullet4")}</li>
          </ul>
        </div>

        {/* Section 5: HIPAA Compliance */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            {t("terms.section5Title")}
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            {t("terms.section5Content1")}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {t("terms.section5Content2")}
          </p>
        </div>

        {/* Section 6: Limitation of Liability */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500/80" />
            {t("terms.section6Title")}
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            {t("terms.section6Content1")}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">
            {t("terms.section6Content2")}
          </p>
          <ul className="list-disc list-inside text-sm text-foreground/80 leading-relaxed space-y-2 ml-2">
            <li>{t("terms.section6Bullet1")}</li>
            <li>{t("terms.section6Bullet2")}</li>
            <li>{t("terms.section6Bullet3")}</li>
            <li>{t("terms.section6Bullet4")}</li>
          </ul>
        </div>

        {/* Section 7: AI Agent Disclaimer */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            {t("terms.section7Title")}
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            {t("terms.section7Content1")}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            {t("terms.section7Content2")}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {t("terms.section7Content3")}
          </p>
        </div>

        {/* Section 8: Indemnification */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            {t("terms.section8Title")}
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-3">
            {t("terms.section8Content")}
          </p>
          <ul className="list-disc list-inside text-sm text-foreground/80 leading-relaxed space-y-2 ml-2">
            <li>{t("terms.section8Bullet1")}</li>
            <li>{t("terms.section8Bullet2")}</li>
            <li>{t("terms.section8Bullet3")}</li>
            <li>{t("terms.section8Bullet4")}</li>
          </ul>
        </div>

        {/* Section 9: Data Breach Notification */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            {t("terms.section9Title")}
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            {t("terms.section9Content1")}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            {t("terms.section9Content2")}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {t("terms.section9Content3")}
          </p>
        </div>

        {/* Section 10: Intellectual Property */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            {t("terms.section10Title")}
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            {t("terms.section10Content1")}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            {t("terms.section10Content2")}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {t("terms.section10Content3")}
          </p>
        </div>

        {/* Section 11: Termination */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            {t("terms.section11Title")}
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            {t("terms.section11Content1")}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            {t("terms.section11Content2")}
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {t("terms.section11Content3")}
          </p>
        </div>

        {/* Section 12: Governing Law */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            {t("terms.section12Title")}
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {t("terms.section12Content")}
          </p>
        </div>

        {/* Section 13: Changes to Terms */}
        <div className="bg-card rounded-xl border border-border p-6 mb-4">
          <h3 className="text-lg font-bold text-foreground mb-3">
            {t("terms.section13Title")}
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {t("terms.section13Content")}
          </p>
        </div>

        {/* Contact section */}
        <div className="text-center mt-10 mb-8">
          <p className="text-sm text-muted-foreground">
            {t("terms.contactQuestion")}{" "}
            <a
              href="mailto:legal@drclaw.ai"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              legal@drclaw.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
