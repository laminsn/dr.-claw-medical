import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  Heart,
  Loader2,
  Rocket,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { allAgentTemplates as agentTemplates, type AgentTemplate } from "@/data/agentTemplates";
import { hospiceCareTemplates } from "@/data/hospiceCareTemplates";
import { ORG_CHART_PACKS, type OrgChartPack } from "@/data/orgChartPacks";

// ── Quick Start Packs ──────────────────────────────────────────────────

interface QuickStartPack {
  id: string;
  name: string;
  description: string;
  icon: typeof Rocket;
  agentIds: string[];
  flowIds: string[];
  recommended: boolean;
  isOrgChart?: boolean;
  departments?: string[];
}

const QUICK_START_PACKS: QuickStartPack[] = [
  {
    id: "front-office",
    name: "Front Office Starter",
    description: "Front Desk + Insurance Verifier + Patient Outreach — handle intake, verify coverage, and reduce no-shows",
    icon: Users,
    agentIds: ["front-desk-agent", "insurance-verifier", "patient-outreach-agent"],
    flowIds: ["patient-intake", "insurance-verification", "appointment-reminders"],
    recommended: true,
  },
  {
    id: "clinical-ops",
    name: "Clinical Operations",
    description: "Clinical Coordinator + Compliance Monitor — streamline documentation and stay HIPAA-compliant",
    icon: Shield,
    agentIds: ["clinical-coordinator", "compliance-hipaa"],
    flowIds: ["clinical-documentation", "referral-management"],
    recommended: false,
  },
  {
    id: "growth-engine",
    name: "Growth Engine",
    description: "Marketing Maven + Revenue Optimizer + Content Engine — attract patients and optimize revenue",
    icon: Zap,
    agentIds: ["marketing-strategist", "revenue-optimizer", "content-engine"],
    flowIds: ["ops-reporting"],
    recommended: false,
  },
  // Org Chart hierarchy pack — 39-agent hospice team
  ...ORG_CHART_PACKS.map((orgPack): QuickStartPack => ({
    id: orgPack.id,
    name: orgPack.name,
    description: orgPack.description,
    icon: Heart,
    agentIds: orgPack.agentIds,
    flowIds: [],
    recommended: orgPack.recommended,
    isOrgChart: true,
    departments: orgPack.departments,
  })),
];

// ── Steps ──────────────────────────────────────────────────────────────

type OnboardingStep = "welcome" | "pick-pack" | "customize" | "deploying" | "done";

const PRACTICE_TYPES = [
  { id: "general", label: "General Practice", suggestedPack: "front-office" },
  { id: "hospice", label: "Hospice / Home Health", suggestedPack: "hospice-care-team" },
  { id: "specialty", label: "Specialty Clinic", suggestedPack: "clinical-ops" },
  { id: "dental", label: "Dental Practice", suggestedPack: "front-office" },
  { id: "other", label: "Other / Not Sure", suggestedPack: "front-office" },
];

// ── Component ──────────────────────────────────────────────────────────

const Onboarding = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [deploying, setDeploying] = useState(false);
  const [deployedCount, setDeployedCount] = useState(0);

  const pack = QUICK_START_PACKS.find((p) => p.id === selectedPack);

  // Merge all template sources for lookups
  const allTemplates = useMemo(() => {
    const map = new Map<string, AgentTemplate>();
    for (const t of agentTemplates) map.set(t.id, t);
    for (const t of hospiceCareTemplates) map.set(t.id, t);
    return map;
  }, []);

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId]
    );
  };

  const selectPack = (packId: string) => {
    const p = QUICK_START_PACKS.find((pk) => pk.id === packId);
    if (p) {
      setSelectedPack(packId);
      setSelectedTemplates(p.agentIds);
    }
  };

  const deployAgents = async () => {
    if (!user || selectedTemplates.length === 0) return;

    setStep("deploying");
    setDeploying(true);
    setDeployedCount(0);

    // Resolve templates
    const templates = selectedTemplates
      .map((id) => allTemplates.get(id))
      .filter((t): t is AgentTemplate => t != null);

    // Build batch rows for agent_configs
    const agentRows = templates.map((template) => {
      const zone = template.category === "healthcare" || template.category === "hospice" ? "clinical"
        : template.category === "marketing" || template.category === "marketing-suite" || template.category === "sales" ? "external"
        : "operations";

      const model = template.suggestedModel === "Claude" ? "claude"
        : template.suggestedModel === "OpenAI" ? "openai"
        : "claude";

      return {
        user_id: user.id,
        agent_key: template.id,
        name: template.name,
        description: template.description,
        zone,
        model,
        department: template.department ?? template.category,
        skills: template.defaultSkills,
        level: template.level ?? "worker",
        is_active: true,
      };
    });

    // Build batch rows for system prompts
    const promptRows = templates.map((template) => ({
      user_id: user.id,
      agent_key: template.id,
      system_prompt: buildSystemPrompt(template),
      version: 1,
      is_active: true,
      category: template.category,
    }));

    // Batch upsert agent configs (single round-trip instead of N)
    const { error: agentError } = await supabase
      .from("agent_configs")
      .upsert(agentRows, { onConflict: "user_id,agent_key" });

    if (agentError) {
      console.error("Batch agent deploy failed:", agentError.message);
    }

    setDeployedCount(Math.ceil(templates.length / 2));

    // Batch upsert system prompts
    await (supabase as any)
      .from("agent_system_prompts")
      .upsert(promptRows, { onConflict: "user_id,agent_key" })
      .then(() => {}).catch((e: any) => console.error("Batch prompt upsert failed:", e));

    setDeployedCount(templates.length);

    // Set parent_agent_id for hierarchy templates (org chart packs)
    if (pack?.isOrgChart) {
      const parentUpdates = templates
        .filter((t) => t.parentTemplateId)
        .map((t) => ({
          agentKey: t.id,
          parentKey: t.parentTemplateId!,
        }));

      for (const { agentKey, parentKey } of parentUpdates) {
        await (supabase as any)
          .from("agent_configs")
          .update({ parent_agent_id: parentKey })
          .eq("user_id", user.id)
          .eq("agent_key", agentKey)
          .then(() => {}).catch(() => {});
      }
    }

    // Seed n8n flow configs
    if (pack) {
      await (supabase as any).rpc("seed_n8n_flows_for_user", { _user_id: user.id }).catch(() => {});
    }

    // Audit log
    await supabase.from("audit_log").insert({
      user_id: user.id,
      action: "onboarding.complete",
      resource_type: "onboarding",
      description: `Deployed ${selectedTemplates.length} agents via ${pack?.name ?? "custom selection"}`,
      metadata: {
        packId: selectedPack,
        agentIds: selectedTemplates,
        isOrgChart: pack?.isOrgChart ?? false,
      },
    }).catch(() => {});

    setDeploying(false);
    setStep("done");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* ── Welcome + Practice Type ───────────────────────── */}
        {step === "welcome" && (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-glow mx-auto">
              <Bot className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-heading gradient-hero-text">
              Welcome to Dr. Claw Medical
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Deploy autonomous AI agents for your healthcare practice in minutes.
              What type of practice do you run?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto">
              {PRACTICE_TYPES.map((pt) => (
                <button
                  key={pt.id}
                  onClick={() => {
                    selectPack(pt.suggestedPack);
                    setStep("pick-pack");
                  }}
                  className="p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium text-foreground"
                >
                  {pt.label}
                </button>
              ))}
            </div>
            <button
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setStep("pick-pack")}
            >
              Skip — I&apos;ll choose myself
            </button>
          </div>
        )}

        {/* ── Pick Pack ────────────────────────────────────── */}
        {step === "pick-pack" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Choose Your Team</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select a pre-built agent team or customize your own
              </p>
            </div>

            <div className="grid gap-4">
              {QUICK_START_PACKS.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPack === p.id;
                const packTemplates = p.agentIds
                  .map((id) => allTemplates.get(id))
                  .filter((t): t is AgentTemplate => t != null);

                return (
                  <button
                    key={p.id}
                    onClick={() => selectPack(p.id)}
                    className={`w-full text-left p-5 rounded-xl border transition-all ${
                      isSelected
                        ? "border-primary/50 bg-primary/5 shadow-glow-sm"
                        : "border-white/[0.06] bg-card hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-primary/20" : "bg-white/[0.03]"
                      }`}>
                        <Icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                          {p.recommended && (
                            <Badge className="text-[9px] bg-primary/20 text-primary border-primary/30">
                              Recommended
                            </Badge>
                          )}
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {packTemplates.length <= 6 ? (
                            packTemplates.map((t) => (
                              <Badge key={t.id} variant="outline" className="text-[9px] border-white/10">
                                {t.name}
                              </Badge>
                            ))
                          ) : (
                            <>
                              <Badge variant="outline" className="text-[9px] border-white/10">
                                {packTemplates.length} agents
                              </Badge>
                              {p.departments?.map((dept) => (
                                <Badge key={dept} variant="outline" className="text-[9px] border-white/10">
                                  {dept}
                                </Badge>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" className="border-white/10" onClick={() => setStep("welcome")}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="border-white/10 text-muted-foreground" onClick={() => {
                  setSelectedPack(null);
                  setSelectedTemplates([]);
                  setStep("customize");
                }}>
                  Custom Selection
                </Button>
                <Button
                  className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm"
                  disabled={!selectedPack}
                  onClick={() => setStep("customize")}
                >
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Customize ────────────────────────────────────── */}
        {step === "customize" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {pack ? `Customize ${pack.name}` : "Build Your Team"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedTemplates.length} agent{selectedTemplates.length !== 1 ? "s" : ""} selected — add or remove as needed
              </p>
            </div>

            <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-4">
              {pack?.isOrgChart ? (
                // Group by department for org chart packs
                (pack.departments ?? []).map((dept) => {
                  const deptTemplates = hospiceCareTemplates.filter(
                    (t) => t.department === dept
                  );
                  if (deptTemplates.length === 0) return null;
                  return (
                    <div key={dept}>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {dept}
                        <span className="ml-2 text-[10px] text-muted-foreground/60">
                          ({deptTemplates.filter((t) => selectedTemplates.includes(t.id)).length}/{deptTemplates.length})
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {deptTemplates.map((template) => {
                          const isSelected = selectedTemplates.includes(template.id);
                          return (
                            <button
                              key={template.id}
                              onClick={() => toggleTemplate(template.id)}
                              className={`text-left p-4 rounded-xl border transition-all ${
                                isSelected
                                  ? "border-primary/40 bg-primary/5"
                                  : "border-white/[0.06] bg-card/50 hover:border-white/15"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h4 className="text-xs font-semibold text-foreground">{template.name}</h4>
                                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
                                  <div className="flex gap-1 mt-2">
                                    <Badge variant="outline" className="text-[8px] border-white/10">{template.level ?? "worker"}</Badge>
                                    <Badge variant="outline" className="text-[8px] border-white/10">{template.tier}</Badge>
                                  </div>
                                </div>
                                {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Flat grid for regular packs / custom selection
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agentTemplates
                    .filter((t) => t.category === "healthcare" || t.category === "operations" || t.category === "marketing" || t.category === "executive")
                    .slice(0, 20)
                    .map((template) => {
                      const isSelected = selectedTemplates.includes(template.id);
                      return (
                        <button
                          key={template.id}
                          onClick={() => toggleTemplate(template.id)}
                          className={`text-left p-4 rounded-xl border transition-all ${
                            isSelected
                              ? "border-primary/40 bg-primary/5"
                              : "border-white/[0.06] bg-card/50 hover:border-white/15"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-foreground">{template.name}</h4>
                              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{template.description}</p>
                              <div className="flex gap-1 mt-2">
                                <Badge variant="outline" className="text-[8px] border-white/10">{template.tier}</Badge>
                                <Badge variant="outline" className="text-[8px] border-white/10">{template.suggestedModel}</Badge>
                              </div>
                            </div>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" className="border-white/10" onClick={() => setStep("pick-pack")}>
                Back
              </Button>
              <Button
                className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm"
                disabled={selectedTemplates.length === 0}
                onClick={deployAgents}
              >
                <Rocket className="h-4 w-4 mr-2" />
                Deploy {selectedTemplates.length} Agent{selectedTemplates.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        )}

        {/* ── Deploying ────────────────────────────────────── */}
        {step === "deploying" && (
          <div className="text-center space-y-6">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Deploying Your Team</h2>
            <p className="text-muted-foreground">
              Setting up {selectedTemplates.length} agents with system prompts and n8n workflows...
            </p>
            <div className="w-full max-w-xs mx-auto bg-white/[0.03] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(deployedCount / selectedTemplates.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {deployedCount} / {selectedTemplates.length} agents deployed
            </p>
          </div>
        )}

        {/* ── Done + Connect EHR ─────────────────────────────── */}
        {step === "done" && (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-green-500/10 border border-green-500/30 mx-auto">
              <Sparkles className="h-10 w-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Your Team is Ready!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {deployedCount} agents deployed with system prompts and workflows.
            </p>

            {/* EHR Connection Prompt */}
            <div className="max-w-sm mx-auto p-4 rounded-xl border border-border bg-card text-left space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Connect Your EHR</h3>
              <p className="text-xs text-muted-foreground">
                Link your Electronic Health Records system so agents can access patient data securely.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate("/dashboard/integrations")}
              >
                Connect EHR Now
              </Button>
              <button
                className="text-[11px] text-muted-foreground hover:text-foreground w-full text-center"
                onClick={() => navigate("/dashboard")}
              >
                I&apos;ll do this later
              </button>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Helper: build system prompt from template ─────────────────────────

function buildSystemPrompt(template: AgentTemplate): string {
  const zone = template.category === "healthcare" || template.category === "hospice" ? "clinical"
    : template.category === "marketing" || template.category === "marketing-suite" ? "external"
    : "operations";

  return [
    `You are ${template.name}, a healthcare AI agent operating in the ${zone} zone.`,
    "",
    template.longDescription,
    "",
    "Core responsibilities:",
    ...template.defaultSkills.map((s) => `- ${s.replace(/-/g, " ")}`),
    "",
    "Guidelines:",
    "- Always prioritize patient safety and HIPAA compliance",
    "- Never expose PHI (Protected Health Information) in external communications",
    "- Use available tools to complete tasks autonomously",
    "- When uncertain, escalate to a human operator rather than guessing",
    "- Log all significant actions for audit purposes",
    "- Call task_complete when your work is done",
  ].join("\n");
}

export default Onboarding;
