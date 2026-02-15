import {
  Brain,
  Mic,
  MessageSquare,
  Shield,
  Database,
  Cloud,
} from "lucide-react";

const integrationGroups = [
  {
    title: "AI Models",
    icon: Brain,
    color: "text-blue-400",
    items: ["OpenAI", "Claude", "Gemini", "MiniMax", "Kimi", "Mistral"],
  },
  {
    title: "Voice & Speech",
    icon: Mic,
    color: "text-violet-400",
    items: ["ElevenLabs", "Deepgram", "VAPI"],
  },
  {
    title: "Communication",
    icon: MessageSquare,
    color: "text-cyan-400",
    items: ["Twilio", "Slack", "SendGrid"],
  },
  {
    title: "Healthcare",
    icon: Shield,
    color: "text-emerald-400",
    items: ["Epic EHR", "Cerner", "AWS HealthLake"],
  },
  {
    title: "Productivity",
    icon: Database,
    color: "text-amber-400",
    items: ["Notion", "Airtable", "Google Workspace"],
  },
  {
    title: "Cloud & Storage",
    icon: Cloud,
    color: "text-pink-400",
    items: ["AWS S3", "Google Cloud", "Azure"],
  },
];

export default function IntegrationsSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-up">
          <span className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-3 block">
            Integrations
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-4">
            Connect to{" "}
            <span className="gradient-hero-text">Your Stack</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Bring your own API keys and connect your preferred providers. Full control, zero lock-in.
          </p>
        </div>

        {/* Integration Groups */}
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
                <h3 className="text-sm font-semibold text-white">
                  {group.title}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-slate-500 mt-8 animate-fade-up">
          18+ integrations available &middot; Custom integrations on Enterprise plans
        </p>
      </div>
    </section>
  );
}
