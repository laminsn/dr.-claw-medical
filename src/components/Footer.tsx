import { Link } from "react-router-dom";
import { Shield, FileCheck, Lock } from "lucide-react";
import logo from "@/assets/dr-claw-logo-transparent.png";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Integrations", href: "#integrations" },
  { label: "Templates", href: "#templates" },
  { label: "FAQ", href: "#faq" },
];

const solutionLinks = [
  { label: "Healthcare", href: "/auth" },
  { label: "Marketing", href: "/auth" },
  { label: "Executive", href: "/auth" },
  { label: "Research", href: "/auth" },
  { label: "Operations", href: "/auth" },
  { label: "HR", href: "/auth" },
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
              <img
                src={logo}
                alt="Dr. Claw"
                className="h-9 w-9"
              />
              <span className="text-xl font-bold font-heading gradient-hero-text">
                Dr. Claw
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-sm">
              Enterprise AI agent platform for healthcare professionals and
              businesses. Build, deploy, and manage AI agents with C-suite
              skills, clinical operations, and professional content creation.
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
