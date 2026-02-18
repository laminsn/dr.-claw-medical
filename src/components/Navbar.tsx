import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();

  const navLinks = [
    { label: t("nav.features"), href: "#features" },
    { label: t("nav.howItWorks"), href: "#how-it-works" },
    { label: t("nav.pricing"), href: "#pricing" },
    { label: t("nav.faq"), href: "#faq" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-card-solid py-3" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow-sm">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold font-heading gradient-hero-text">
              Dr. Claw
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <LanguageSelector />
            <Link
              to="/auth"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            >
              {t("nav.signIn")}
            </Link>
            <Link
              to="/auth"
              className="gradient-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-glow-sm hover:opacity-90 transition-opacity"
            >
              {t("nav.getStarted")}
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-2 py-2">
                <ThemeToggle />
                <LanguageSelector />
              </div>
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Link
                  to="/auth"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-2"
                  onClick={() => setOpen(false)}
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  to="/auth"
                  className="gradient-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-glow-sm hover:opacity-90 transition-opacity text-center"
                  onClick={() => setOpen(false)}
                >
                  {t("nav.getStarted")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
