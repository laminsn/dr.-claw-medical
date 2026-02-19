import { useTranslation } from "react-i18next";
import {
  Brain, Mic, Database, Contact, HeartPulse, Send, Mail, Target, Smartphone,
} from "lucide-react";

export default function IntegrationsSection() {
  const { t } = useTranslation();

  const integrationGroups = [
    { title: t("home.integrations.aiModels"),   icon: Brain,       color: "text-blue-400",    items: ["OpenAI", "Claude", "Gemini", "MiniMax", "Kimi", "Mistral"] },
    { title: t("home.integrations.crm"),        icon: Contact,     color: "text-orange-400",  items: ["GoHighLevel", "HubSpot", "Salesforce", "Zoho CRM", "Pipedrive"] },
    { title: t("home.integrations.ehr"),        icon: HeartPulse,  color: "text-red-400",     items: ["Epic EHR", "Oracle Cerner", "Allscripts", "Nuance DAX"] },
    { title: t("home.integrations.google"),     icon: Mail,        color: "text-emerald-400", items: ["Gmail", "Drive", "Docs", "Sheets", "Slides", "Meet"] },
    { title: t("home.integrations.voice"),      icon: Mic,         color: "text-violet-400",  items: ["ElevenLabs", "Deepgram", "VAPI"] },
    { title: t("home.integrations.messaging"),  icon: Send,        color: "text-cyan-400",    items: ["Slack", "Telegram", "Discord", "Zoom", "Twilio", "WhatsApp"] },
    { title: t("home.integrations.project"),    icon: Target,      color: "text-pink-400",    items: ["Trello", "Asana", "Monday.com", "Jira"] },
    { title: t("home.integrations.productivity"),icon: Database,   color: "text-amber-400",   items: ["Notion", "Airtable", "Zapier", "SendGrid"] },
    { title: t("home.integrations.mobile"),     icon: Smartphone,  color: "text-green-400",   items: ["WhatsApp Business", "Apple Messages"] },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 block">
            {t("home.integrations.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-4">
            {t("home.integrations.title1")}{" "}
            <span className="gradient-hero-text">{t("home.integrations.title2")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("home.integrations.subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {integrationGroups.map((group, i) => (
            <div
              key={group.title}
              className="glass-card rounded-xl p-6 card-hover animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <group.icon className={`w-5 h-5 ${group.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8 animate-fade-up">
          {t("home.integrations.note")}
        </p>
      </div>
    </section>
  );
}
