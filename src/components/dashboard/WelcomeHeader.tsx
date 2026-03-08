import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Zap, Brain } from "lucide-react";

const getGreeting = (t: any): string => {
  const hour = new Date().getHours();
  if (hour < 12) return t("dashboard.welcomeMorning", "Good morning");
  if (hour < 18) return t("dashboard.welcomeAfternoon", "Good afternoon");
  return t("dashboard.welcomeEvening", "Good evening");
};

const formatDate = (): string => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const WelcomeHeader = () => {
  const { t } = useTranslation();
  const greeting = getGreeting(t);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold font-heading gradient-hero-text">
          {greeting}
        </h1>
        <p className="text-muted-foreground mt-1">{formatDate()}</p>
      </div>

      <div className="flex items-center gap-2">
        <Link to="/dashboard/agents">
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg gradient-primary text-white text-xs font-semibold shadow-glow-sm hover:opacity-90 transition-opacity">
            <Plus className="h-3.5 w-3.5" />
            {t("dashboard.createAgent")}
          </button>
        </Link>
        <Link to="/dashboard/skills">
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg gradient-primary text-white text-xs font-semibold shadow-glow-sm hover:opacity-90 transition-opacity">
            <Zap className="h-3.5 w-3.5" />
            {t("dashboard.browseSkills")}
          </button>
        </Link>
        <Link to="/dashboard/integrations">
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg gradient-primary text-white text-xs font-semibold shadow-glow-sm hover:opacity-90 transition-opacity">
            <Brain className="h-3.5 w-3.5" />
            {t("dashboard.integrations")}
          </button>
        </Link>
      </div>
    </motion.div>
  );
};

export default WelcomeHeader;
