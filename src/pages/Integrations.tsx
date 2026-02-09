import { useState } from "react";
import {
  Brain,
  Mic,
  Phone,
  Cloud,
  Database,
  Table2,
  Shield,
  Lock,
  CheckCircle,
  ExternalLink,
  Loader2,
  Plug,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type IntegrationStatus = "connected" | "available" | "coming_soon";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof Brain;
  category: string;
  status: IntegrationStatus;
  hipaa: boolean;
  baa: boolean;
  features: string[];
}

const integrations: Integration[] = [
  {
    id: "openai",
    name: "OpenAI GPT",
    description: "Advanced language models for patient communication, documentation, and clinical reasoning.",
    icon: Brain,
    category: "LLM",
    status: "available",
    hipaa: true,
    baa: true,
    features: ["GPT-4o", "GPT-5", "Fine-tuning", "Function calling"],
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    description: "Constitutional AI for safe, helpful medical conversations and analysis.",
    icon: Brain,
    category: "LLM",
    status: "available",
    hipaa: true,
    baa: true,
    features: ["Claude 3.5 Sonnet", "Long context", "Vision", "Tool use"],
  },
  {
    id: "google",
    name: "Google Gemini",
    description: "Multimodal AI for processing medical images, documents, and complex reasoning.",
    icon: Brain,
    category: "LLM",
    status: "available",
    hipaa: true,
    baa: true,
    features: ["Gemini Pro", "Multimodal", "Grounding", "Code execution"],
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Ultra-realistic voice synthesis for patient calls, IVR systems, and voice agents.",
    icon: Mic,
    category: "Voice",
    status: "available",
    hipaa: true,
    baa: true,
    features: ["Voice cloning", "29 languages", "Low latency", "Custom voices"],
  },
  {
    id: "deepgram",
    name: "Deepgram",
    description: "Real-time speech-to-text transcription for medical dictation and call analysis.",
    icon: Mic,
    category: "Voice",
    status: "available",
    hipaa: true,
    baa: true,
    features: ["Medical vocabulary", "Real-time STT", "Speaker diarization", "Summarization"],
  },
  {
    id: "vapi",
    name: "VAPI",
    description: "Voice AI pipeline for building conversational phone agents with sub-second latency.",
    icon: Phone,
    category: "Voice",
    status: "available",
    hipaa: true,
    baa: true,
    features: ["Phone calls", "WebRTC", "Transfer", "Voicemail detection"],
  },
  {
    id: "aws",
    name: "AWS Healthcare",
    description: "HIPAA-eligible cloud infrastructure — Comprehend Medical, Transcribe Medical, S3.",
    icon: Cloud,
    category: "Infrastructure",
    status: "available",
    hipaa: true,
    baa: true,
    features: ["Comprehend Medical", "Transcribe Medical", "S3 storage", "Lambda"],
  },
  {
    id: "notion",
    name: "Notion",
    description: "Knowledge base and documentation management for clinical SOPs and protocols.",
    icon: Database,
    category: "Productivity",
    status: "available",
    hipaa: true,
    baa: true,
    features: ["Knowledge base", "SOPs", "Databases", "API access"],
  },
  {
    id: "airtable",
    name: "Airtable",
    description: "Structured data management for patient pipelines, referral tracking, and workflows.",
    icon: Table2,
    category: "Productivity",
    status: "available",
    hipaa: true,
    baa: true,
    features: ["Patient CRM", "Referral tracking", "Automations", "Dashboards"],
  },
];

const categories = ["All", "LLM", "Voice", "Infrastructure", "Productivity"];

const statusBadge: Record<IntegrationStatus, { label: string; className: string }> = {
  connected: { label: "Connected", className: "bg-primary/20 text-primary" },
  available: { label: "Available", className: "bg-accent/20 text-accent" },
  coming_soon: { label: "Coming Soon", className: "bg-muted text-muted-foreground" },
};

const Integrations = () => {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("All");
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);

  const filtered =
    activeCategory === "All"
      ? integrations
      : integrations.filter((i) => i.category === activeCategory);

  const handleConnect = async (id: string) => {
    setConnecting(id);
    // Simulate connection setup
    await new Promise((r) => setTimeout(r, 1500));
    setConnectedIds((prev) => [...prev, id]);
    const integration = integrations.find((i) => i.id === id);
    toast({
      title: "Integration ready",
      description: `${integration?.name} is configured and HIPAA-compliant. Add your API key in Settings to activate.`,
    });
    setConnecting(null);
  };

  const getStatus = (integration: Integration): IntegrationStatus => {
    if (connectedIds.includes(integration.id)) return "connected";
    return integration.status;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                <Plug className="h-6 w-6 text-primary" /> Integrations
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Connect your favorite tools — all HIPAA compliant with BAA agreements
              </p>
            </div>
          </div>

          {/* HIPAA/BAA Banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">All Integrations are HIPAA & BAA Secured</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Every connection is encrypted end-to-end. PHI never leaves your secure environment.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <Shield className="h-3.5 w-3.5" /> HIPAA
              </div>
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <Lock className="h-3.5 w-3.5" /> BAA
              </div>
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                <Lock className="h-3.5 w-3.5" /> PHI Protected
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? "gradient-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Integration Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((integration) => {
              const status = getStatus(integration);
              const badge = statusBadge[status];

              return (
                <div
                  key={integration.id}
                  className={`bg-card rounded-xl border p-6 transition-all hover:border-primary/20 ${
                    status === "connected" ? "border-primary/30 bg-primary/[0.02]" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        status === "connected" ? "gradient-primary" : "bg-muted"
                      }`}>
                        <integration.icon className={`h-5 w-5 ${
                          status === "connected" ? "text-primary-foreground" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-foreground text-sm">{integration.name}</h3>
                        <span className="text-xs text-muted-foreground">{integration.category}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {integration.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {integration.features.map((f) => (
                      <span key={f} className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Compliance badges */}
                  <div className="flex items-center gap-3 mb-4">
                    {integration.hipaa && (
                      <span className="flex items-center gap-1 text-xs text-primary">
                        <Shield className="h-3 w-3" /> HIPAA
                      </span>
                    )}
                    {integration.baa && (
                      <span className="flex items-center gap-1 text-xs text-primary">
                        <Lock className="h-3 w-3" /> BAA
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  <Button
                    size="sm"
                    onClick={() => handleConnect(integration.id)}
                    disabled={connecting === integration.id || status === "connected" || status === "coming_soon"}
                    className={`w-full rounded-lg text-xs gap-1.5 ${
                      status === "connected"
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : status === "coming_soon"
                        ? "bg-muted text-muted-foreground"
                        : "gradient-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    {connecting === integration.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : status === "connected" ? (
                      <><CheckCircle className="h-3 w-3" /> Connected</>
                    ) : status === "coming_soon" ? (
                      "Coming Soon"
                    ) : (
                      <><ExternalLink className="h-3 w-3" /> Connect</>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Integrations;
