import { Link } from "react-router-dom";
import { Shield, FileCheck, Lock, Zap } from "lucide-react";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Integrations", href: "#integrations" },
  { label: "Templates", href: "#templates" },
  { label: "FAQ", href: "#faq" },
];

const solutionLinks = [
  { label: "Medical Practices", href: "/auth" },
  { label: "Health Systems", href: "/auth" },
  { label: "Specialty Clinics", href: "/auth" },
  { label: "Telehealth", href: "/auth" },
  { label: "Clinical Research", href: "/auth" },
  { label: "Revenue Cycle", href: "/auth" },
];

const complianceLinks = [
  { label: "HIPAA Compliance", href: "/compliance/hipaa" },
  { label: "BAA Information", href: "/compliance/baa" },
  { label: "SOC 2 Certification", href: "/compliance/soc2" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Security", href: "/security" },
];

export default function Footer() {
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
              The AI agent platform built exclusively for healthcare. Automate
              patient scheduling, clinical documentation, insurance verification,
              care coordination, and every operation in your medical practice.
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
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
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
            <h4 className="text-sm font-semibold text-white mb-4">Solutions</h4>
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
              Compliance
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
            &copy; {new Date().getFullYear()} Dr. Claw. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
