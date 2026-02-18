import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "en", flag: "EN" },
  { code: "es", flag: "ES" },
  { code: "pt", flag: "PT" },
] as const;

export default function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        {!compact && (
          <span className="uppercase text-xs font-medium">{i18n.language.slice(0, 2)}</span>
        )}
      </button>
      <div className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-card border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                i18n.language.startsWith(lang.code)
                  ? "text-primary bg-primary/10"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-xs font-bold w-6">{lang.flag}</span>
              <span>{t(`languages.${lang.code}`)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
