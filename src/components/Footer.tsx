import { Link } from "react-router-dom";
import logo from "@/assets/dr-claw-logo-transparent.png";
import ComplianceBadges from "@/components/ComplianceBadges";

const Footer = () => (
  <footer className="py-20 border-t border-border">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Dr. Claw" className="h-8 w-8" />
            <span className="font-display text-lg font-bold text-foreground">Dr. Claw</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5">
            The HIPAA-compliant AI platform purpose-built for healthcare professionals.
            Deploy AI agents that handle scheduling, follow-ups, documentation, and patient
            communication — so your team can focus on care.
          </p>
          <ComplianceBadges variant="stacked" />
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4 text-sm tracking-wider uppercase">Product</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
            <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
            <li><a href="#personas" className="hover:text-foreground transition-colors">Specialties</a></li>
            <li><a href="#integrations" className="hover:text-foreground transition-colors">Integrations</a></li>
            <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4 text-sm tracking-wider uppercase">Healthcare</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">Primary Care</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Orthopedics</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Cardiology</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Pediatrics</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Urgent Care</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Surgical Centers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4 text-sm tracking-wider uppercase">Compliance</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">HIPAA Compliance</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">BAA Agreements</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">SOC 2 Type II</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Security Overview</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          © 2026 Dr. Claw. All rights reserved. HIPAA · BAA · PHI Compliant · SOC 2 Type II
        </p>
        <p className="text-xs text-muted-foreground">
          Built for healthcare. Secured for patients.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
