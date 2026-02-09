import { Brain, Mic, Phone, Cloud, Database, Table2, Shield, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const integrations = [
  {
    name: "OpenAI / Claude / Gemini",
    description: "Choose your LLM. Switch models per agent. BAA-secured.",
    icon: Brain,
    category: "LLM",
  },
  {
    name: "ElevenLabs",
    description: "Ultra-realistic voice synthesis for patient calls and IVR.",
    icon: Mic,
    category: "Voice",
  },
  {
    name: "Deepgram",
    description: "Real-time medical transcription and dictation.",
    icon: Mic,
    category: "Voice",
  },
  {
    name: "VAPI",
    description: "Conversational phone agents with sub-second latency.",
    icon: Phone,
    category: "Voice",
  },
  {
    name: "AWS Healthcare",
    description: "Comprehend Medical, Transcribe Medical, S3 storage.",
    icon: Cloud,
    category: "Infra",
  },
  {
    name: "Notion",
    description: "Clinical SOPs, knowledge bases, and protocol docs.",
    icon: Database,
    category: "Productivity",
  },
  {
    name: "Airtable",
    description: "Patient CRM, referral tracking, and workflow automation.",
    icon: Table2,
    category: "Productivity",
  },
];

const IntegrationsSection = () => (
  <section className="py-24 relative" id="integrations">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-6">
          Integrations
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
          Your Stack.{" "}
          <span className="gradient-hero-text">HIPAA Secured.</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
          Connect to the LLMs, voice engines, and tools you already trust.
          Every integration ships with BAA agreements and end-to-end encryption.
        </p>
      </div>

      {/* HIPAA/BAA banner */}
      <div className="flex items-center justify-center gap-6 mb-10">
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5">
          <Shield className="h-3.5 w-3.5" /> HIPAA Compliant
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5">
          <Lock className="h-3.5 w-3.5" /> BAA Certified
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5">
          <Lock className="h-3.5 w-3.5" /> PHI Protected
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="group flex items-start gap-4 p-5 rounded-xl border border-border hover:border-primary/20 transition-all bg-card/50"
          >
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <integration.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-foreground text-sm">
                  {integration.name}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {integration.description}
              </p>
              <span className="text-[10px] text-primary/70 font-medium mt-2 inline-block">
                {integration.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
        >
          View all integrations →
        </Link>
      </div>
    </div>
  </section>
);

export default IntegrationsSection;
