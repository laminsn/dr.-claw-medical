import { MessageSquare, Mail, Phone, Send } from "lucide-react";

const channels = [
  {
    name: "Telegram",
    description: "Automated patient messaging via Telegram bots.",
    icon: Send,
    status: "available" as const,
  },
  {
    name: "Slack",
    description: "Internal team notifications and alert routing.",
    icon: MessageSquare,
    status: "available" as const,
  },
  {
    name: "SMS / Text",
    description: "Appointment reminders and follow-up texts.",
    icon: Phone,
    status: "available" as const,
  },
  {
    name: "Email",
    description: "Referral letters, summaries, and intake forms.",
    icon: Mail,
    status: "available" as const,
  },
  {
    name: "WhatsApp",
    description: "HIPAA-compliant patient communication.",
    icon: MessageSquare,
    status: "coming_soon" as const,
  },
];

const IntegrationsSection = () => (
  <section className="py-24 relative" id="integrations">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-6">
          Omnichannel
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
          Every Channel.{" "}
          <span className="gradient-hero-text">One Platform.</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
          Reach patients wherever they are — text, email, Telegram, Slack, or WhatsApp.
          All powered by your AI agents.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {channels.map((channel) => (
          <div
            key={channel.name}
            className="group flex items-start gap-4 p-5 rounded-xl border border-border hover:border-primary/20 transition-all"
          >
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <channel.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-foreground text-sm">
                  {channel.name}
                </h3>
                {channel.status === "coming_soon" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                    Soon
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {channel.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default IntegrationsSection;
