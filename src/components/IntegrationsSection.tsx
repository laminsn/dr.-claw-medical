import { Brain, Mic, Phone, Cloud, Database, Mail } from "lucide-react";

const integrations = [
  {
    icon: Brain,
    title: "OpenAI / Claude / Gemini",
    category: "LLM",
  },
  {
    icon: Brain,
    title: "MiniMax / Kimi / Mistral",
    category: "LLM",
  },
  {
    icon: Mic,
    title: "ElevenLabs / Deepgram",
    category: "Voice",
  },
  {
    icon: Phone,
    title: "VAPI / Twilio",
    category: "Communication",
  },
  {
    icon: Cloud,
    title: "AWS Healthcare",
    category: "Cloud",
  },
  {
    icon: Database,
    title: "Notion / Airtable",
    category: "Productivity",
  },
  {
    icon: Mail,
    title: "Slack / SendGrid",
    category: "Communication",
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
            Connect your own API keys. Use your preferred providers.
          </p>
        </div>

        {/* Integration Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {integrations.map((item, i) => (
            <div
              key={item.title}
              className="glass-card rounded-xl p-5 card-hover text-center animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                <item.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                {item.title}
              </h3>
              <span className="text-xs text-slate-500 uppercase tracking-wider">
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
