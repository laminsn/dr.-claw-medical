import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
  HeartPulse,
  Hospital,
  ClipboardList,
  AudioLines,
  Video,
  HardDrive,
  FileText,
  Presentation,
  Send,
  Gamepad2,
  Hash,
  LayoutDashboard,
  Target,
  CalendarCheck,
  Bug,
  Smartphone,
  Loader2,
  Power,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { integrations, integrationCategories, BRAND_STYLES } from "@/data/integrations";
import { validateApiKeyFormat, maskApiKey } from "@/lib/security";

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
  "heart-pulse": HeartPulse,
  hospital: Hospital,
  "clipboard-list": ClipboardList,
  "audio-lines": AudioLines,
  video: Video,
  "hard-drive": HardDrive,
  "file-text": FileText,
  presentation: Presentation,
  send: Send,
  "gamepad-2": Gamepad2,
  hash: Hash,
  "layout-dashboard": LayoutDashboard,
  target: Target,
  "calendar-check": CalendarCheck,
  bug: Bug,
  smartphone: Smartphone,
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
  ehr: "bg-red-500/15 text-red-400 border-red-500/30",
  video: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  messaging: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  "project-management": "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

// ---------------------------------------------------------------------------
// Zone classification for integrations
// ---------------------------------------------------------------------------
type AgentZone = "clinical" | "operations" | "external" | "all";

const INTEGRATION_ZONE_ACCESS: Record<string, AgentZone[]> = {
  // EHR/EMR — Clinical zone only
  epic: ["clinical"],
  cerner: ["clinical"],
  allscripts: ["clinical"],
  nuance: ["clinical"],
  // AI Models — All zones
  openai: ["clinical", "operations", "external"],
  anthropic: ["clinical", "operations", "external"],
  "google-gemini": ["clinical", "operations", "external"],
  minimax: ["operations", "external"],
  kimi: ["operations", "external"],
  mistral: ["operations", "external"],
  cohere: ["operations", "external"],
  // Communication — External zone only
  twilio: ["external"],
  sendgrid: ["external"],
  // CRM — External zone only
  gohighlevel: ["external"],
  hubspot: ["external"],
  salesforce: ["external"],
  "zoho-crm": ["external"],
  pipedrive: ["external"],
  // Voice — External + Operations
  elevenlabs: ["external", "operations"],
  deepgram: ["external", "operations"],
  vapi: ["external"],
  "wispr-flow": ["clinical", "operations", "external"],
  // Messaging — External zone only
  telegram: ["external"],
  discord: ["external"],
  "slack-v2": ["external"],
  whatsapp: ["external"],
  // Cloud — Operations + Clinical
  aws: ["clinical", "operations"],
  supabase: ["clinical", "operations"],
  // Productivity — Operations zone
  notion: ["operations"],
  airtable: ["operations"],
  zapier: ["operations"],
  n8n: ["operations", "clinical"],
  "google-mail": ["external"],
  "google-drive": ["operations"],
  "google-docs": ["operations"],
  "google-sheets": ["operations"],
  "google-slides": ["operations"],
  // Video — Operations + External
  zoom: ["operations", "external"],
  "google-meet": ["operations", "external"],
  // Internal tools
  slack: ["operations"],
  // Project Management — Operations
  trello: ["operations"],
  asana: ["operations"],
  monday: ["operations"],
  jira: ["operations"],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ConnectedIntegration {
  apiKey: string;
  isActive: boolean;
}

const Integrations = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedIntegration, setSelectedIntegration] = useState<
    (typeof integrations)[number] | null
  >(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [connectedIntegrations, setConnectedIntegrations] = useState<
    Record<string, ConnectedIntegration>
  >({});
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [disconnectTarget, setDisconnectTarget] = useState<
    (typeof integrations)[number] | null
  >(null);

  // --- Load connected integrations from Supabase ---
  const loadIntegrations = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("user_integrations")
      .select("integration_key, api_key, is_active")
      .eq("user_id", user.id);

    if (data) {
      const map: Record<string, ConnectedIntegration> = {};
      for (const row of data) {
        map[row.integration_key] = {
          apiKey: row.api_key,
          isActive: row.is_active ?? true,
        };
      }
      setConnectedIntegrations(map);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  // --- i18n label maps ---
  const categoryLabel: Record<string, string> = {
    llm: t("integrations.categoryAiModels"),
    voice: t("integrations.categoryVoiceAi"),
    crm: t("integrations.categoryCrm"),
    cloud: t("integrations.categoryCloud"),
    productivity: t("integrations.categoryProductivity"),
    healthcare: t("integrations.categoryHealthcare"),
    communication: t("integrations.categoryCommunication"),
    ehr: t("integrations.categoryEhr"),
    video: t("integrations.categoryVideo"),
    messaging: t("integrations.categoryMessaging"),
    "project-management": t("integrations.categoryProjectMgmt"),
  };

  const ZONE_BADGE_CONFIG: Record<string, { label: string; color: string }> = {
    clinical: {
      label: t("integrations.zone1"),
      color: "text-red-400 bg-red-500/10 border-red-500/30",
    },
    operations: {
      label: t("integrations.zone2"),
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    },
    external: {
      label: t("integrations.zone3"),
      color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    },
  };

  const filteredIntegrations = integrations.filter((integ) => {
    return selectedCategory === "all" || integ.category === selectedCategory;
  });

  const categoryTabs = [
    { id: "all", name: t("integrations.all") },
    ...integrationCategories.map((c) => ({ id: c.id, name: c.name })),
  ];

  // --- Connect handler with validation + Supabase persistence ---
  const handleConnect = async () => {
    if (!selectedIntegration || !apiKeyInput.trim() || !user) return;

    const key = apiKeyInput.trim();

    // Validate key format for known providers
    const validation = validateApiKeyFormat(selectedIntegration.id, key);
    if (!validation.valid) {
      setValidationError(validation.message);
      toast({
        title: t("integrations.toastInvalidKey"),
        description: t("integrations.toastInvalidKeyDesc", {
          message: validation.message,
        }),
        variant: "destructive",
      });
      return;
    }

    setConnecting(true);
    setValidationError("");

    const { error } = await supabase.from("user_integrations").upsert(
      {
        user_id: user.id,
        integration_key: selectedIntegration.id,
        api_key: key,
        is_active: true,
      },
      { onConflict: "user_id,integration_key" }
    );

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setConnectedIntegrations((prev) => ({
        ...prev,
        [selectedIntegration.id]: { apiKey: key, isActive: true },
      }));

      toast({
        title: t("integrations.toastConnected"),
        description: t("integrations.toastConnectedDesc", {
          name: selectedIntegration.name,
        }),
      });
    }

    setConnecting(false);
    setApiKeyInput("");
    setShowApiKey(false);
    setSelectedIntegration(null);
  };

  // --- Disconnect handler ---
  const handleDisconnect = async () => {
    if (!disconnectTarget || !user) return;

    const { error } = await supabase
      .from("user_integrations")
      .delete()
      .eq("user_id", user.id)
      .eq("integration_key", disconnectTarget.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setConnectedIntegrations((prev) => {
        const next = { ...prev };
        delete next[disconnectTarget.id];
        return next;
      });

      toast({
        title: t("integrations.toastDisconnected"),
        description: t("integrations.toastDisconnectedDesc", {
          name: disconnectTarget.name,
        }),
      });
    }

    setDisconnectTarget(null);
  };

  // --- Helper: get brand style for provider ---
  const getBrandStyle = (id: string) => BRAND_STYLES[id] ?? null;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ── Header ─────────────────────────────────── */}
          <div>
            <h1 className="text-3xl font-bold font-heading gradient-hero-text">
              {t("integrations.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("integrations.subtitle")}
            </p>
          </div>

          {/* ── Zone Isolation Banner ──────────────────── */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
            <Lock className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-400">
                {t("integrations.zoneLockedTitle")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("integrations.zoneLockedDesc")}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-[10px]">
                  <span className="h-2 w-2 rounded-full bg-red-400" />{" "}
                  {t("integrations.zone1Desc")}
                </span>
                <span className="flex items-center gap-1.5 text-[10px]">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />{" "}
                  {t("integrations.zone2Desc")}
                </span>
                <span className="flex items-center gap-1.5 text-[10px]">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />{" "}
                  {t("integrations.zone3Desc")}
                </span>
              </div>
            </div>
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

          {/* ── Loading ─────────────────────────────────── */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
            </div>
          ) : filteredIntegrations.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">{t("integrations.noIntegrations")}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredIntegrations.map((integ) => {
                const Icon = resolveIcon(integ.icon);
                const isConnected = !!connectedIntegrations[integ.id];
                const brand = getBrandStyle(integ.id);

                return (
                  <div
                    key={integ.id}
                    className={`glass-card card-hover rounded-2xl p-5 flex flex-col transition-all group ${
                      isConnected
                        ? "ring-1 ring-emerald-500/20 bg-emerald-500/[0.02]"
                        : ""
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          brand
                            ? `${brand.bg} ${brand.border} border`
                            : "bg-gradient-to-br from-primary/20 to-primary/5"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            brand ? "" : "text-primary"
                          }`}
                          style={brand ? { color: brand.accent } : undefined}
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        {integ.popular && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                          >
                            <Star className="h-2.5 w-2.5 mr-0.5 fill-yellow-400" />
                            {t("integrations.popular")}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            categoryColors[integ.category] ?? ""
                          }`}
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
                          +{integ.features.length - 3}{" "}
                          {t("integrations.more")}
                        </li>
                      )}
                    </ul>

                    {/* Zone Access */}
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      <span className="text-[9px] text-muted-foreground/60 mr-0.5">
                        {t("integrations.zones")}:
                      </span>
                      {(
                        INTEGRATION_ZONE_ACCESS[integ.id] || ["operations"]
                      ).map((zone) => (
                        <Badge
                          key={zone}
                          variant="outline"
                          className={`text-[8px] px-1.5 py-0 ${
                            ZONE_BADGE_CONFIG[zone]?.color || ""
                          }`}
                        >
                          {ZONE_BADGE_CONFIG[zone]?.label || zone}
                        </Badge>
                      ))}
                    </div>

                    {/* Bottom row */}
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${
                          tierColors[integ.tier] ?? ""
                        }`}
                      >
                        {integ.tier}
                      </Badge>

                      {isConnected ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {t("integrations.connected")}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => setDisconnectTarget(integ)}
                          >
                            <Power className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className={`text-xs border-white/10 hover:bg-white/5 ${
                            brand
                              ? `hover:${brand.border}`
                              : ""
                          }`}
                          onClick={() => {
                            setApiKeyInput("");
                            setShowApiKey(false);
                            setValidationError("");
                            setSelectedIntegration(integ);
                          }}
                        >
                          <Plug className="h-3.5 w-3.5 mr-1" />
                          {integ.category === "llm"
                            ? t("integrations.signInWith", {
                                name: integ.name.split(" ")[0],
                              })
                            : t("integrations.connect")}
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
            setShowApiKey(false);
            setValidationError("");
          }
        }}
      >
        {selectedIntegration && (() => {
          const brand = getBrandStyle(selectedIntegration.id);
          const isLLM = selectedIntegration.category === "llm";

          return (
            <DialogContent
              className={`max-w-md glass-card border-white/10 ${
                brand ? brand.glow : ""
              }`}
            >
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  {(() => {
                    const Icon = resolveIcon(selectedIntegration.icon);
                    return (
                      <div
                        className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                          brand
                            ? `${brand.bg} ${brand.border} border`
                            : "bg-gradient-to-br from-primary/20 to-primary/5"
                        }`}
                      >
                        <Icon
                          className="h-6 w-6"
                          style={
                            brand
                              ? { color: brand.accent }
                              : undefined
                          }
                        />
                      </div>
                    );
                  })()}
                  <div className="min-w-0">
                    <DialogTitle className="text-lg font-heading">
                      {isLLM
                        ? t("integrations.signInWith", {
                            name: selectedIntegration.name,
                          })
                        : t("integrations.connectName", {
                            name: selectedIntegration.name,
                          })}
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
                <p className="text-xs text-muted-foreground">
                  {t("integrations.enterApiKey")}
                </p>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    placeholder={selectedIntegration.apiKeyPlaceholder}
                    value={apiKeyInput}
                    onChange={(e) => {
                      setApiKeyInput(e.target.value);
                      setValidationError("");
                    }}
                    className={`bg-white/5 border-white/10 focus:border-primary pr-10 ${
                      validationError
                        ? "border-red-500/50 focus:border-red-500"
                        : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {validationError ? (
                  <p className="flex items-center gap-1.5 text-[11px] text-red-400">
                    <AlertCircle className="h-3 w-3" />
                    {validationError}
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                    <Lock className="h-3 w-3" />
                    {t("integrations.keyEncrypted")}
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-foreground mb-2">
                  {t("integrations.features")}
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
                {t("integrations.visitName", {
                  name: selectedIntegration.name,
                })}
                <ExternalLink className="h-3 w-3" />
              </a>

              <DialogFooter className="pt-2">
                <Button
                  className={`w-full text-white shadow-glow-sm hover:opacity-90 transition-opacity ${
                    brand
                      ? ""
                      : "gradient-primary"
                  }`}
                  style={
                    brand
                      ? {
                          background: `linear-gradient(135deg, ${brand.accent}, ${brand.accent}cc)`,
                        }
                      : undefined
                  }
                  disabled={!apiKeyInput.trim() || connecting}
                  onClick={handleConnect}
                >
                  {connecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      {t("integrations.connecting")}
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-1.5" />
                      {t("integrations.saveAndConnect")}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          );
        })()}
      </Dialog>

      {/* ── Disconnect confirmation dialog ─────────────── */}
      <Dialog
        open={!!disconnectTarget}
        onOpenChange={(open) => {
          if (!open) setDisconnectTarget(null);
        }}
      >
        {disconnectTarget && (
          <DialogContent className="max-w-sm glass-card border-white/10">
            <DialogHeader>
              <DialogTitle className="text-base font-heading">
                {t("integrations.disconnect")}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t("integrations.disconnectConfirm", {
                  name: disconnectTarget.name,
                })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-white/10"
                onClick={() => setDisconnectTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDisconnect}
              >
                <Power className="h-4 w-4 mr-1.5" />
                {t("integrations.disconnect")}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Integrations;
