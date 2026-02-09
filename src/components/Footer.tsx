import { Link } from "react-router-dom";
import logo from "@/assets/dr-claw-logo.png";

const Footer = () => (
  <footer className="py-20 border-t border-border">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Dr. Claw" className="h-8 w-8" />
            <span className="font-display text-lg font-bold text-foreground">Dr. Claw</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The AI-powered platform purpose-built for healthcare professionals.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4 text-sm tracking-wider uppercase">Product</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
            <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
            <li><a href="#personas" className="hover:text-foreground transition-colors">Use Cases</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4 text-sm tracking-wider uppercase">Company</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-4 text-sm tracking-wider uppercase">Legal</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">HIPAA Compliance</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border mt-14 pt-8 text-center text-xs text-muted-foreground">
        © 2026 Dr. Claw. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
