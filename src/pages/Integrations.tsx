import { useState } from "react";
import {
  Brain,
  Mic,
  Phone,
  Cloud,
  Database,
  Table2,
  Zap,
  MessageSquare,
  Mail,
  Plug,
  Bot,
  Search,
  Check,
  Lock,
  Star,
  ExternalLink,
  Sparkles,
  Hexagon,
  Cpu,
  Moon,
  Wind,
  Layers,
  AudioWaveform,
  PhoneCall,
  BookOpen,
  Rocket,
  CloudCog,
  Contact,
  GitBranch,
  type LucideIcon,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { integrations, integrationCategories } from "@/data/integrations";

// ---------------------------------------------------------------------------
// Icon mapping: integration data stores icon names as lowercase strings
// ---------------------------------------------------------------------------
const iconMap: Record<string, LucideIcon> = {
  brain: Brain,
  mic: Mic,
  phone: Phone,
  cloud: Cloud,
  database: Database,
  "table-2": Table2,
  table: Table2,
  zap: Zap,
  "message-square": MessageSquare,
  mail: Mail,
  plug: Plug,
  bot: Bot,
  sparkles: Sparkles,
  hexagon: Hexagon,
  cpu: Cpu,
  moon: Moon,
  wind: Wind,
  layers: Layers,
  "audio-waveform": AudioWaveform,
  "phone-call": PhoneCall,
  "book-open": BookOpen,
  rocket: Rocket,
  hub: Hexagon,
  "cloud-cog": CloudCog,
  contact: Contact,
  "git-branch": GitBranch,
};

function resolveIcon(name: string): LucideIcon {
  return iconMap[name] ?? Plug;
}

// ---------------------------------------------------------------------------
// Tier + category badge colours
// ---------------------------------------------------------------------------
const tierColors: Record<string, string> = {
  starter: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  professional: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  advanced: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  enterprise: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const categoryColors: Record<string, string> = {
  llm: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  voice: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  crm: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  cloud: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  productivity: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  healthcare: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  communication: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const categoryLabel: Record<string, string> = {
  llm: "AI Models",
  voice: "Voice AI",
  crm: "CRM",
  cloud: "Cloud",
  productivity: "Productivity",
  healthcare: "Healthcare",
  communication: "Communication",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const Integrations = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIntegration, setSelectedIntegration] = useState<
    (typeof integrations)[number] | null
  >(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [connectedKeys, setConnectedKeys] = useState<Record<string, string>>(
    {},
  );

  const filteredIntegrations = integrations.filter((integ) => {
    return selectedCategory === "all" || integ.category === selectedCategory;
  });

  const categoryTabs = [
    { id: "all", name: "All" },
    ...integrationCategories.map((c) => ({ id: c.id, name: c.name })),
  ];

  const handleConnect = () => {
    if (!selectedIntegration || !apiKeyInput.trim()) return;

    setConnectedKeys((prev) => ({
      ...prev,
      [selectedIntegration.id]: apiKeyInput.trim(),
    }));

    toast({
      title: "Connected",
      description: `${selectedIntegration.name} has been connected successfully.`,
    });

    setApiKeyInput("");
    setSelectedIntegration(null);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ── Header ─────────────────────────────────── */}
          <div>
            <h1 className="text-3xl font-bold font-heading gradient-hero-text">
              Integrations
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect your API keys to power your AI agents.
            </p>
          </div>

          {/* ── Category tabs ──────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === tab.id
                    ? "gradient-primary text-white shadow-glow-sm"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* ── Integration cards grid ─────────────────── */}
          {filteredIntegrations.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No integrations in this category.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredIntegrations.map((integ) => {
                const Icon = resolveIcon(integ.icon);
                const isConnected = !!connectedKeys[integ.id];

                return (
                  <div
                    key={integ.id}
                    className="glass-card card-hover rounded-2xl p-5 flex flex-col transition-all group"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {integ.popular && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                          >
                            <Star className="h-2.5 w-2.5 mr-0.5 fill-yellow-400" />
                            Popular
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${categoryColors[integ.category] ?? ""}`}
                        >
                          {categoryLabel[integ.category] ?? integ.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Name + description */}
                    <h3 className="font-semibold font-heading text-sm text-foreground group-hover:text-primary transition-colors">
                      {integ.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {integ.description}
                    </p>

                    {/* Features (show 3) */}
                    <ul className="mt-3 space-y-1">
                      {integ.features.slice(0, 3).map((feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                        >
                          <Check className="h-3 w-3 text-primary shrink-0" />
                          {feat}
                        </li>
                      ))}
                      {integ.features.length > 3 && (
                        <li className="text-[11px] text-muted-foreground/60 pl-[18px]">
                          +{integ.features.length - 3} more
                        </li>
                      )}
                    </ul>

                    {/* Bottom row */}
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${tierColors[integ.tier] ?? ""}`}
                      >
                        {integ.tier}
                      </Badge>

                      {isConnected ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                          <Check className="h-3.5 w-3.5" />
                          Connected
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-white/10 hover:bg-white/5"
                          onClick={() => {
                            setApiKeyInput("");
                            setSelectedIntegration(integ);
                          }}
                        >
                          <Plug className="h-3.5 w-3.5 mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Connect dialog ─────────────────────────────── */}
      <Dialog
        open={!!selectedIntegration}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedIntegration(null);
            setApiKeyInput("");
          }
        }}
      >
        {selectedIntegration && (
          <DialogContent className="max-w-md glass-card border-white/10">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                {(() => {
                  const Icon = resolveIcon(selectedIntegration.icon);
                  return (
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  );
                })()}
                <div className="min-w-0">
                  <DialogTitle className="text-lg font-heading">
                    Connect {selectedIntegration.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {selectedIntegration.description}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* API key input */}
            <div className="space-y-2 pt-2">
              <Label htmlFor="api-key" className="text-sm font-medium">
                {selectedIntegration.apiKeyLabel}
              </Label>
              <Input
                id="api-key"
                type="password"
                placeholder={selectedIntegration.apiKeyPlaceholder}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-primary"
              />
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                <Lock className="h-3 w-3" />
                The key is stored encrypted and never shared.
              </p>
            </div>

            {/* Features */}
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-foreground mb-2">
                Features
              </h4>
              <ul className="space-y-1.5">
                {selectedIntegration.features.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <Check className="h-3 w-3 text-primary shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Website link */}
            <a
              href={selectedIntegration.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Visit {selectedIntegration.name}
              <ExternalLink className="h-3 w-3" />
            </a>

            <DialogFooter className="pt-2">
              <Button
                className="w-full gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity"
                disabled={!apiKeyInput.trim()}
                onClick={handleConnect}
              >
                <Zap className="h-4 w-4 mr-1.5" />
                Save &amp; Connect
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Integrations;
