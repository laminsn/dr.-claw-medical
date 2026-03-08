import { useState } from "react";
import {
  Bot,
  Plus,
  Settings,
  Power,
  Zap,
  Search,
  ArrowRight,
  X,
  Check,
  Brain,
  Shield,
  MessageSquare,
  Mic,
  AlertTriangle,
  ListTodo,
  Fingerprint,
  HeartPulse,
  Clock,
  Trash2,
  Save,
  Archive,
  RotateCcw,
  Activity,
  ChevronDown,
  ChevronRight,
  ArrowRightLeft,
  Eraser,
  Lock,
  Languages,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { skills, skillCategories } from "@/data/skills";
import { allAgentTemplates as agentTemplates } from "@/data/agentTemplates";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useAgents, type MyAgent, type AgentCapabilities } from "@/hooks/useAgents";

const AGENT_LANGUAGE_OPTIONS = [
  { code: "en", label: "English", flag: "EN" },
  { code: "es", label: "Español", flag: "ES" },
  { code: "pt", label: "Português", flag: "PT" },
];

const DEFAULT_CAPABILITIES: AgentCapabilities = {
  phiProtection: true,
  messaging: true,
  voiceRecognition: false,
  distressDetection: false,
  taskCreation: false,
  hrAssistant: false,
};

type AgentZone = "clinical" | "operations" | "external";

interface ActivityEntry {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}

const MODEL_OPTIONS = [
  { id: "openai", label: "OpenAI", color: "text-green-400" },
  { id: "claude", label: "Claude", color: "text-violet-400" },
  { id: "gemini", label: "Gemini", color: "text-blue-400" },
  { id: "minimax", label: "MiniMax", color: "text-amber-400" },
  { id: "kimi", label: "Kimi", color: "text-rose-400" },
];

const getZoneConfig = (t: (key: string) => string): Record<AgentZone, { label: string; description: string; color: string; border: string; icon: typeof Shield; restrictions: string[] }> => ({
  clinical: {
    label: t("agents.zoneClinicalLabel"),
    description: t("agents.zoneClinicalDesc"),
    color: "text-red-400 bg-red-500/15 border-red-500/30",
    border: "border-red-500/30",
    icon: Shield,
    restrictions: t("agents.zoneClinicalRestrictions").split(","),
  },
  operations: {
    label: t("agents.zoneOperationsLabel"),
    description: t("agents.zoneOperationsDesc"),
    color: "text-amber-400 bg-amber-500/15 border-amber-500/30",
    border: "border-amber-500/30",
    icon: Shield,
    restrictions: t("agents.zoneOperationsRestrictions").split(","),
  },
  external: {
    label: t("agents.zoneExternalLabel"),
    description: t("agents.zoneExternalDesc"),
    color: "text-blue-400 bg-blue-500/15 border-blue-500/30",
    border: "border-blue-500/30",
    icon: Shield,
    restrictions: t("agents.zoneExternalRestrictions").split(","),
  },
});

const getCapabilityOptions = (t: (key: string) => string): { key: keyof AgentCapabilities; label: string; description: string; icon: typeof Shield; color: string }[] => [
  { key: "phiProtection", label: t("agents.capPhiProtection"), description: t("agents.capPhiProtectionDesc"), icon: Shield, color: "text-red-400" },
  { key: "messaging", label: t("agents.capMessaging"), description: t("agents.capMessagingDesc"), icon: MessageSquare, color: "text-blue-400" },
  { key: "voiceRecognition", label: t("agents.capVoiceRecognition"), description: t("agents.capVoiceRecognitionDesc"), icon: Fingerprint, color: "text-violet-400" },
  { key: "distressDetection", label: t("agents.capDistressDetection"), description: t("agents.capDistressDetectionDesc"), icon: HeartPulse, color: "text-rose-400" },
  { key: "taskCreation", label: t("agents.capTaskCreation"), description: t("agents.capTaskCreationDesc"), icon: ListTodo, color: "text-cyan-400" },
  { key: "hrAssistant", label: t("agents.capHrAssistant"), description: t("agents.capHrAssistantDesc"), icon: Clock, color: "text-amber-400" },
];

const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: "a1", agentId: "1", agentName: "Dr. Front Desk", action: "Scheduled appointment for patient #4821", timestamp: "2 min ago", status: "success" },
  { id: "a2", agentId: "2", agentName: "Marketing Maven", action: "Generated social media campaign draft", timestamp: "8 min ago", status: "success" },
  { id: "a3", agentId: "1", agentName: "Dr. Front Desk", action: "Insurance verification timeout for patient #3190", timestamp: "15 min ago", status: "warning" },
  { id: "a4", agentId: "3", agentName: "Grant Pro", action: "Failed to retrieve grant database — API rate limit exceeded", timestamp: "22 min ago", status: "error" },
  { id: "a5", agentId: "1", agentName: "Dr. Front Desk", action: "Sent follow-up reminder to patient #2755", timestamp: "30 min ago", status: "success" },
  { id: "a6", agentId: "2", agentName: "Marketing Maven", action: "Content tone flagged for review — possible compliance issue", timestamp: "45 min ago", status: "warning" },
  { id: "a7", agentId: "3", agentName: "Grant Pro", action: "Completed research summary for NIH R01 grant", timestamp: "1 hr ago", status: "success" },
  { id: "a8", agentId: "1", agentName: "Dr. Front Desk", action: "Distress signal detected — escalated call to clinical staff", timestamp: "1.5 hr ago", status: "error" },
];

function getSkillName(skillId: string): string {
  const skill = skills.find((s) => s.id === skillId);
  return skill ? skill.shortName : skillId;
}

function getSkillFullName(skillId: string): string {
  const skill = skills.find((s) => s.id === skillId);
  return skill ? skill.name : skillId;
}

const Agents = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const ZONE_CONFIG = getZoneConfig(t);
  const CAPABILITY_OPTIONS = getCapabilityOptions(t);
  const { agents: myAgents, addAgent, updateAgent, deleteAgent: removeAgent, archiveAgent: archiveAgentCtx, restoreAgent: restoreAgentCtx } = useAgents();

  const [createOpen, setCreateOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentModel, setNewAgentModel] = useState("openai");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [searchSkills, setSearchSkills] = useState("");
  const [newAgentZone, setNewAgentZone] = useState<AgentZone>("operations");
  const [newAgentLanguage, setNewAgentLanguage] = useState("en");
  const [activeTab, setActiveTab] = useState<"my-agents" | "templates" | "monitor">("my-agents");

  // Deploy template dialog state
  const [deployOpen, setDeployOpen] = useState(false);
  const [deployTemplate, setDeployTemplateData] = useState<typeof agentTemplates[number] | null>(null);
  const [deployName, setDeployName] = useState("");
  const [deployModel, setDeployModel] = useState("");

  // Settings dialog state
  const [configOpen, setConfigOpen] = useState(false);
  const [configAgent, setConfigAgent] = useState<MyAgent | null>(null);
  const [configName, setConfigName] = useState("");
  const [configModel, setConfigModel] = useState("");
  const [configSkills, setConfigSkills] = useState<string[]>([]);
  const [configCapabilities, setConfigCapabilities] = useState<AgentCapabilities>({ ...DEFAULT_CAPABILITIES });
  const [configSearchSkills, setConfigSearchSkills] = useState("");
  const [configZone, setConfigZone] = useState<AgentZone>("operations");
  const [configLanguage, setConfigLanguage] = useState("en");

  // Activity monitor state
  const [activityFilter, setActivityFilter] = useState<"all" | "success" | "warning" | "error">("all");

  // Archive / delete state
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(false);
  const [archivedExpanded, setArchivedExpanded] = useState(false);

  // Transfer dialog state
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferAction, setTransferAction] = useState<"archive" | "delete">("archive");
  const [transferTargetId, setTransferTargetId] = useState<string>("unassigned");
  const [transferAgentId, setTransferAgentId] = useState<string | null>(null);
  const [transferTaskCount, setTransferTaskCount] = useState(0);

  // ── Handlers ────────────────────────────────────

  const toggleAgent = (id: string) => {
    const agent = myAgents.find((a) => a.id === id);
    if (agent) updateAgent(id, { active: !agent.active });
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  };

  const removeSelectedSkill = (skillId: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skillId));
  };

  const resetCreateForm = () => {
    setNewAgentName("");
    setNewAgentModel("openai");
    setSelectedSkills([]);
    setSearchSkills("");
    setNewAgentZone("operations");
    setNewAgentLanguage("en");
  };

  const handleCreate = () => {
    if (!newAgentName.trim() || selectedSkills.length === 0) return;
    const newAgent: MyAgent = {
      id: String(Date.now()),
      name: newAgentName.trim(),
      skills: [...selectedSkills],
      model: newAgentModel,
      active: true,
      capabilities: { ...DEFAULT_CAPABILITIES },
      archived: false,
      taskCount: 0,
      zone: newAgentZone,
      language: newAgentLanguage,
      tasksToday: 0,
      successRate: 100,
      costToday: 0,
      costMonth: 0,
      tokensUsed: 0,
      avgResponseTime: "—",
      role: "",
      department: "",
      level: "worker",
      parentId: null,
    };
    addAgent(newAgent);
    setCreateOpen(false);
    resetCreateForm();
  };

  const openDeployDialog = (templateId: string) => {
    const template = agentTemplates.find((t) => t.id === templateId);
    if (!template) return;
    setDeployTemplateData(template);
    setDeployName(template.name);
    setDeployModel(template.suggestedModel.toLowerCase());
    setDeployOpen(true);
  };

  const handleDeployTemplate = () => {
    if (!deployTemplate || !deployName.trim()) return;
    const newAgent: MyAgent = {
      id: String(Date.now()),
      name: deployName.trim(),
      skills: [...deployTemplate.defaultSkills],
      model: deployModel,
      active: true,
      capabilities: { ...DEFAULT_CAPABILITIES },
      archived: false,
      taskCount: 0,
      zone: "operations",
      language: "en",
      tasksToday: 0,
      successRate: 100,
      costToday: 0,
      costMonth: 0,
      tokensUsed: 0,
      avgResponseTime: "—",
      role: "",
      department: "",
      level: "worker",
      parentId: null,
    };
    addAgent(newAgent);
    setDeployOpen(false);
    setDeployTemplateData(null);
    setDeployName("");
    setActiveTab("my-agents");
  };

  // Settings dialog handlers
  const openConfigDialog = (agent: MyAgent) => {
    setConfigAgent(agent);
    setConfigName(agent.name);
    setConfigModel(agent.model);
    setConfigSkills([...agent.skills]);
    setConfigCapabilities({ ...agent.capabilities });
    setConfigSearchSkills("");
    setConfigZone(agent.zone);
    setConfigLanguage(agent.language);
    setConfigOpen(true);
  };

  const toggleConfigSkill = (skillId: string) => {
    setConfigSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  };

  const toggleCapability = (key: keyof AgentCapabilities) => {
    setConfigCapabilities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveConfig = () => {
    if (!configAgent || !configName.trim()) return;
    updateAgent(configAgent.id, {
      name: configName.trim(),
      model: configModel,
      skills: [...configSkills],
      capabilities: { ...configCapabilities },
      zone: configZone,
      language: configLanguage,
    });
    toast({ title: t("agents.agentUpdated"), description: t("agents.agentUpdatedDesc", { name: configName.trim() }) });
    setConfigOpen(false);
    setConfigAgent(null);
  };

  const handleDeleteAgent = () => {
    if (!configAgent) return;
    if (!deleteConfirmStep) {
      setDeleteConfirmStep(true);
      return;
    }
    // If agent has tasks, open transfer dialog
    if (configAgent.taskCount > 0) {
      setTransferAgentId(configAgent.id);
      setTransferTaskCount(configAgent.taskCount);
      setTransferAction("delete");
      setTransferTargetId("unassigned");
      setTransferOpen(true);
      return;
    }
    executeDeleteAgent();
  };

  const executeDeleteAgent = () => {
    if (!configAgent) return;
    removeAgent(configAgent.id);
    toast({ title: t("agents.agentDeleted"), description: t("agents.agentDeletedDesc", { name: configAgent.name }) });
    setConfigOpen(false);
    setConfigAgent(null);
    setDeleteConfirmStep(false);
    setTransferOpen(false);
  };

  const handleArchiveAgent = () => {
    if (!configAgent) return;
    // If agent has tasks, open transfer dialog
    if (configAgent.taskCount > 0) {
      setTransferAgentId(configAgent.id);
      setTransferTaskCount(configAgent.taskCount);
      setTransferAction("archive");
      setTransferTargetId("unassigned");
      setTransferOpen(true);
      return;
    }
    executeArchiveAgent();
  };

  const executeArchiveAgent = () => {
    if (!configAgent) return;
    archiveAgentCtx(configAgent.id);
    toast({ title: t("agents.agentArchived"), description: t("agents.agentArchivedDesc", { name: configAgent.name }) });
    setConfigOpen(false);
    setConfigAgent(null);
    setTransferOpen(false);
  };

  const handleRestoreAgent = (agentId: string) => {
    restoreAgentCtx(agentId);
    const agent = myAgents.find((a) => a.id === agentId);
    toast({ title: t("agents.agentRestored"), description: t("agents.agentRestoredDesc", { name: agent?.name ?? "Agent" }) });
  };

  const handleClearMemory = () => {
    if (!configAgent) return;
    toast({
      title: t("agents.agentMemoryCleared"),
      description: t("agents.agentMemoryClearedDesc"),
    });
  };

  const handleTransferConfirm = () => {
    if (transferAction === "archive") {
      executeArchiveAgent();
    } else {
      executeDeleteAgent();
    }
  };

  // ── Filtered skills ───────
  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchSkills.toLowerCase())
  );
  const groupedSkills = skillCategories
    .map((cat) => ({ ...cat, skills: filteredSkills.filter((s) => s.category === cat.id) }))
    .filter((group) => group.skills.length > 0);

  const configFilteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(configSearchSkills.toLowerCase())
  );
  const configGroupedSkills = skillCategories
    .map((cat) => ({ ...cat, skills: configFilteredSkills.filter((s) => s.category === cat.id) }))
    .filter((group) => group.skills.length > 0);

  // ── Render ──────────────────────────────────────

  return (
    <DashboardLayout>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* ── Header ─────────────────────────────── */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
              {t("agents.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("agents.subtitle")}
            </p>
          </div>

          {/* ── Tabs ───────────────────────────────── */}
          <div className="flex items-center gap-1 mb-8 bg-card/50 border border-border rounded-xl p-1 w-fit">
            <button
              onClick={() => setActiveTab("my-agents")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "my-agents"
                  ? "gradient-primary text-primary-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                {t("agents.myAgents")}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "templates"
                  ? "gradient-primary text-primary-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {t("agents.templates")}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("monitor")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "monitor"
                  ? "gradient-primary text-primary-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {t("agents.monitor")}
              </span>
            </button>
          </div>

          {/* ── My Agents Tab ──────────────────────── */}
          {activeTab === "my-agents" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  {myAgents.filter((a) => a.active && !a.archived).length} {t("agents.activeOf")} {myAgents.filter((a) => !a.archived).length} {t("agents.agents")} — {t("agents.noLimitConnect")}
                </p>
                <Button
                  className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90 gap-2"
                  onClick={() => { resetCreateForm(); setCreateOpen(true); }}
                >
                  <Plus className="h-4 w-4" />
                   {t("agents.createAgent")}
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myAgents.filter((a) => !a.archived).map((agent) => {
                  const modelOption = MODEL_OPTIONS.find((m) => m.id === agent.model);
                  const visibleSkills = agent.skills.slice(0, 3);
                  const extraCount = agent.skills.length - 3;
                  const capCount = Object.values(agent.capabilities).filter(Boolean).length;

                  return (
                    <div
                      key={agent.id}
                      className={`group relative rounded-xl border p-5 transition-all duration-300 card-hover ${
                        agent.active ? "border-primary/20 bg-card" : "border-border bg-card/60 opacity-75"
                      }`}
                    >
                      <div className={`h-1 rounded-t-xl -mx-5 -mt-5 mb-4 ${
                        agent.zone === "clinical" ? "bg-red-500/40" : agent.zone === "operations" ? "bg-amber-500/40" : "bg-blue-500/40"
                      }`} />

                      <div className="absolute top-4 right-4">
                        <span className="relative flex h-2.5 w-2.5">
                          {agent.active && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          )}
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${agent.active ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-4">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${agent.active ? "gradient-primary shadow-glow-sm" : "bg-muted"}`}>
                          <Bot className={`h-5 w-5 ${agent.active ? "text-primary-foreground" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-foreground leading-tight">{agent.name}</h3>
                          <Badge variant="secondary" className={`text-xs mt-0.5 bg-primary/10 border-0 ${modelOption?.color ?? "text-primary"}`}>
                            {modelOption?.label ?? agent.model}
                          </Badge>
                          <Badge variant="outline" className={`text-[10px] mt-0.5 ${ZONE_CONFIG[agent.zone].color}`}>
                            {ZONE_CONFIG[agent.zone].label}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-2">
                          {agent.skills.length} {t("agents.skillsAssigned")}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {visibleSkills.map((skillId) => (
                            <span key={skillId} className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                              {getSkillName(skillId)}
                            </span>
                          ))}
                          {extraCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">+{extraCount} {t("agents.more")}</span>
                          )}
                        </div>
                      </div>

                      {/* Capability indicators */}
                      <div className="flex items-center gap-1.5 mb-3">
                        {agent.capabilities.phiProtection && (
                          <span title="PHI Protected" className="h-5 w-5 rounded bg-red-500/15 flex items-center justify-center">
                            <Shield className="h-3 w-3 text-red-400" />
                          </span>
                        )}
                        {agent.capabilities.messaging && (
                          <span title="Messaging" className="h-5 w-5 rounded bg-blue-500/15 flex items-center justify-center">
                            <MessageSquare className="h-3 w-3 text-blue-400" />
                          </span>
                        )}
                        {agent.capabilities.voiceRecognition && (
                          <span title="Voice Recognition" className="h-5 w-5 rounded bg-violet-500/15 flex items-center justify-center">
                            <Mic className="h-3 w-3 text-violet-400" />
                          </span>
                        )}
                        {agent.capabilities.distressDetection && (
                          <span title="Distress Detection" className="h-5 w-5 rounded bg-rose-500/15 flex items-center justify-center">
                            <HeartPulse className="h-3 w-3 text-rose-400" />
                          </span>
                        )}
                        {agent.capabilities.taskCreation && (
                          <span title="Task Creation" className="h-5 w-5 rounded bg-cyan-500/15 flex items-center justify-center">
                            <ListTodo className="h-3 w-3 text-cyan-400" />
                          </span>
                        )}
                        {agent.capabilities.hrAssistant && (
                          <span title="HR Assistant" className="h-5 w-5 rounded bg-amber-500/15 flex items-center justify-center">
                            <Clock className="h-3 w-3 text-amber-400" />
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-1">{capCount} {t("agents.capabilities")}</span>
                      </div>

                      {/* ── Hover Stats Panel ──────────────────────────── */}
                      <div className="overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-300 ease-in-out">
                        <div className="border-t border-border pt-3 pb-1 space-y-2">
                          <div className="grid grid-cols-3 gap-1.5">
                             {[
                               { label: t("agents.tasksToday"), value: agent.tasksToday, icon: CheckCircle2, color: "text-primary" },
                               { label: t("agents.success"), value: `${agent.successRate}%`, icon: TrendingUp, color: "text-emerald-400" },
                               { label: t("agents.avgSpeed"), value: agent.avgResponseTime, icon: Clock, color: "text-cyan-400" },
                            ].map((s) => (
                              <div key={s.label} className="rounded-lg bg-muted/40 p-2 text-center">
                                <s.icon className={`h-3 w-3 mx-auto mb-0.5 ${s.color}`} />
                                <p className="text-xs font-bold text-foreground">{s.value}</p>
                                <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
                              </div>
                            ))}
                          </div>
                          {/* Usage/cost meter */}
                          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="h-3 w-3 text-amber-400" />
                              <span className="text-[10px] text-amber-400 font-semibold">{t("agents.usageCost")}</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className="text-[10px] text-muted-foreground">{t("agents.today")}: <span className="text-foreground font-semibold">${agent.costToday.toFixed(2)}</span></span>
                               <span className="text-[10px] text-muted-foreground">{t("agents.month")}: <span className="text-foreground font-semibold">${agent.costMonth.toFixed(2)}</span></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
                        <button
                          onClick={() => toggleAgent(agent.id)}
                          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                            agent.active ? "text-green-500 hover:text-green-400" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                          {agent.active ? t("agents.active") : t("agents.inactive")}
                        </button>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => window.location.href = "/dashboard/command"}
                            title="Command Station"
                          >
                            <Terminal className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => openConfigDialog(agent)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => { resetCreateForm(); setCreateOpen(true); }}
                  className="rounded-xl border-2 border-dashed border-border p-5 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-primary/5 transition-all min-h-[220px] group"
                >
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                   <p className="font-display font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-sm">
                     {t("agents.createNewAgent")}
                   </p>
                   <p className="text-xs text-muted-foreground mt-1">{t("agents.noLimit")}</p>
                </button>
              </div>

              {/* ── Archived Agents ──────────────────── */}
              {myAgents.filter((a) => a.archived).length > 0 && (
                <div className="mt-8">
                  <button
                    onClick={() => setArchivedExpanded(!archivedExpanded)}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
                  >
                    {archivedExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <Archive className="h-4 w-4" />
                    {t("agents.archived")} ({myAgents.filter((a) => a.archived).length})
                  </button>
                  {archivedExpanded && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myAgents.filter((a) => a.archived).map((agent) => {
                        const modelOption = MODEL_OPTIONS.find((m) => m.id === agent.model);
                        return (
                          <div
                            key={agent.id}
                            className="rounded-xl border border-border bg-card/40 p-4 opacity-60 hover:opacity-80 transition-all"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                                <Bot className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <h3 className="font-display font-bold text-foreground text-sm leading-tight">{agent.name}</h3>
                                <Badge variant="secondary" className={`text-[10px] mt-0.5 bg-primary/10 border-0 ${modelOption?.color ?? "text-primary"}`}>
                                  {modelOption?.label ?? agent.model}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                               <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
                                 {t("agents.archived")}
                               </Badge>
                               <span className="text-[10px] text-muted-foreground">{agent.skills.length} {t("agents.skills").toLowerCase()}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-2 text-xs border-primary/30 text-primary hover:bg-primary/10"
                              onClick={() => handleRestoreAgent(agent.id)}
                            >
                              <RotateCcw className="h-3 w-3" />
                               {t("agents.restore")}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Templates Tab ──────────────────────── */}
          {activeTab === "templates" && (
            <div>
              <p className="text-sm text-muted-foreground mb-6">
                {t("agents.templatesDesc")}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {agentTemplates.map((template) => (
                  <div key={template.id} className="rounded-xl border border-border bg-card p-5 transition-all duration-300 card-hover flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow-sm">
                        <Brain className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize border-border">{template.category}</Badge>
                    </div>
                    <h3 className="font-display font-bold text-foreground mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{template.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {template.defaultSkills.map((skillId) => (
                        <span key={skillId} className="text-[11px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                          {getSkillFullName(skillId)}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-t border-b border-border">
                      {template.metrics.map((metric) => (
                        <div key={metric.label} className="text-center">
                          <p className="text-xs font-bold text-foreground">{metric.value}</p>
                          <p className="text-[10px] text-muted-foreground">{metric.label}</p>
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full gradient-primary text-primary-foreground rounded-lg shadow-glow-sm hover:opacity-90 gap-2"
                      onClick={() => openDeployDialog(template.id)}
                    >
                      <Zap className="h-4 w-4" /> {t("agents.deploy")} <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Monitor Tab ────────────────────────── */}
          {activeTab === "monitor" && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                {t("agents.monitorDesc")}
              </p>

              {/* Filter chips */}
              <div className="flex items-center gap-2 mb-6">
                {(["all", "success", "warning", "error"] as const).map((filter) => {
                  const colorMap = {
                    all: "border-border text-foreground bg-card hover:bg-card/80",
                    success: "border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20",
                    warning: "border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20",
                    error: "border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20",
                  };
                  const activeColorMap = {
                    all: "border-primary bg-primary/20 text-primary",
                    success: "border-green-400 bg-green-500/25 text-green-300 shadow-glow-sm",
                    warning: "border-amber-400 bg-amber-500/25 text-amber-300 shadow-glow-sm",
                    error: "border-red-400 bg-red-500/25 text-red-300 shadow-glow-sm",
                  };
                  return (
                    <button
                      key={filter}
                      onClick={() => setActivityFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                        activityFilter === filter ? activeColorMap[filter] : colorMap[filter]
                      }`}
                    >
                      {filter === "all" ? t("agents.all") : filter === "success" ? t("agents.success") : filter === "warning" ? t("agents.warning") : t("agents.error")}
                    </button>
                  );
                })}
              </div>

              {/* Activity feed */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto divide-y divide-border">
                  {MOCK_ACTIVITY
                    .filter((entry) => activityFilter === "all" || entry.status === activityFilter)
                    .map((entry) => {
                      const statusDot = {
                        success: "bg-green-500",
                        warning: "bg-amber-500",
                        error: "bg-red-500",
                      };
                      const statusBg = {
                        success: "bg-green-500/10",
                        warning: "bg-amber-500/10",
                        error: "bg-red-500/10",
                      };
                      return (
                        <div key={entry.id} className={`flex items-start gap-3 p-4 ${statusBg[entry.status]} hover:bg-primary/5 transition-colors`}>
                          <span className="relative flex h-2.5 w-2.5 mt-1.5 shrink-0">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusDot[entry.status]} opacity-75`} />
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusDot[entry.status]}`} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-semibold text-foreground">{entry.agentName}</span>
                              <Badge
                                variant="outline"
                                className={`text-[9px] capitalize ${
                                  entry.status === "success"
                                    ? "border-green-500/30 text-green-400"
                                    : entry.status === "warning"
                                    ? "border-amber-500/30 text-amber-400"
                                    : "border-red-500/30 text-red-400"
                                }`}
                              >
                                {entry.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{entry.action}</p>
                          </div>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">{entry.timestamp}</span>
                        </div>
                      );
                    })}
                  {MOCK_ACTIVITY.filter((entry) => activityFilter === "all" || entry.status === activityFilter).length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm">{t("agents.noActivityMatch")}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Agent Settings Dialog ────────────── */}
        <Dialog
          open={configOpen}
          onOpenChange={(open) => {
            setConfigOpen(open);
            if (!open) { setConfigAgent(null); setDeleteConfirmStep(false); }
          }}
        >
          {configAgent && (
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  {t("agents.agentSettingsFor", { name: configAgent.name })}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                {/* Agent Name */}
                <div className="space-y-2">
                   <Label className="text-sm font-medium">{t("agents.agentName")}</Label>
                  <Input
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>

                {/* Zone Classification */}
                <div className="space-y-2">
                   <Label className="text-sm font-medium">{t("agents.securityZone")}</Label>
                  <div className="space-y-2">
                    {(Object.entries(ZONE_CONFIG) as [AgentZone, typeof ZONE_CONFIG["clinical"]][]).map(([zone, config]) => (
                      <button
                        key={zone}
                        onClick={() => setConfigZone(zone)}
                        className={`w-full text-left rounded-lg border p-2.5 transition-all ${
                          configZone === zone ? `${config.border} bg-primary/5` : "border-border bg-background hover:border-primary/20"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <config.icon className={`h-3.5 w-3.5 ${config.color.split(' ')[0]}`} />
                          <p className="text-xs font-semibold text-foreground">{config.label}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{config.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                   <Label className="text-sm font-medium">{t("agents.aiModel")}</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {MODEL_OPTIONS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setConfigModel(model.id)}
                        className={`relative flex flex-col items-center gap-1 rounded-lg border p-2.5 transition-all text-center ${
                          configModel === model.id
                            ? "border-primary bg-primary/10 shadow-glow-sm"
                            : "border-border bg-background hover:border-primary/30 hover:bg-primary/5"
                        }`}
                      >
                        {configModel === model.id && (
                          <span className="absolute top-1 right-1"><Check className="h-3 w-3 text-primary" /></span>
                        )}
                        <Brain className={`h-4 w-4 ${configModel === model.id ? model.color : "text-muted-foreground"}`} />
                        <span className={`text-[10px] font-medium ${configModel === model.id ? "text-foreground" : "text-muted-foreground"}`}>
                          {model.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agent Language */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Languages className="h-4 w-4 text-primary" />
                    {t("agents.agentLanguage")}
                  </Label>
                  <p className="text-xs text-muted-foreground">{t("agents.agentLanguageDesc")}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {AGENT_LANGUAGE_OPTIONS.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setConfigLanguage(lang.code)}
                        className={`relative flex items-center gap-2 justify-center rounded-lg border p-2.5 transition-all text-center ${
                          configLanguage === lang.code
                            ? "border-primary bg-primary/10 shadow-glow-sm"
                            : "border-border bg-background hover:border-primary/30 hover:bg-primary/5"
                        }`}
                      >
                        {configLanguage === lang.code && (
                          <span className="absolute top-1 right-1"><Check className="h-3 w-3 text-primary" /></span>
                        )}
                        <span className="text-xs font-bold">{lang.flag}</span>
                        <span className={`text-xs font-medium ${configLanguage === lang.code ? "text-foreground" : "text-muted-foreground"}`}>
                          {lang.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Capabilities */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">{t("agents.agentCapabilities")}</Label>
                  <div className="space-y-2">
                    {CAPABILITY_OPTIONS.map((cap) => {
                      const enabled = configCapabilities[cap.key];
                      return (
                        <button
                          key={cap.key}
                          onClick={() => toggleCapability(cap.key)}
                          className={`w-full flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                            enabled ? "border-primary/40 bg-primary/5" : "border-border bg-background hover:border-primary/20"
                          }`}
                        >
                          <div className={`mt-0.5 h-5 w-5 rounded flex items-center justify-center shrink-0 ${enabled ? "gradient-primary" : "bg-muted"}`}>
                            {enabled ? <Check className="h-3 w-3 text-white" /> : <span className="h-3 w-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <cap.icon className={`h-4 w-4 ${cap.color}`} />
                              <p className="text-sm font-medium text-foreground">{cap.label}</p>
                              {cap.key === "phiProtection" && (
                                <Badge variant="outline" className="text-[9px] border-red-500/30 text-red-400">{t("agents.required")}</Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{cap.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* PHI Warning */}
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <div>
                       <p className="text-xs font-semibold text-red-400">{t("agents.phiAlwaysEnforced")}</p>
                       <p className="text-[11px] text-red-400/80 mt-0.5">
                         {t("agents.phiAlwaysEnforcedDesc")}
                       </p>
                    </div>
                  </div>
                  {configZone === "clinical" && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <Lock className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                       <p className="text-xs font-semibold text-amber-400">{t("agents.zone1RestrictionsActive")}</p>
                       <p className="text-[11px] text-amber-400/80 mt-0.5">
                         {t("agents.zone1RestrictionsActiveDesc")}
                       </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="space-y-3">
                   <Label className="text-sm font-medium">
                     {t("agents.skills")} <span className="text-muted-foreground font-normal">({configSkills.length} {t("agents.selected")})</span>
                  </Label>
                  {configSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      {configSkills.map((skillId) => (
                        <Badge
                          key={skillId}
                          className="bg-primary/15 text-primary border-0 hover:bg-primary/25 cursor-pointer gap-1 pr-1"
                          onClick={() => toggleConfigSkill(skillId)}
                        >
                          {getSkillFullName(skillId)}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={configSearchSkills}
                      onChange={(e) => setConfigSearchSkills(e.target.value)}
                       placeholder={t("agents.searchSkills")}
                      className="pl-9 bg-background border-border"
                    />
                  </div>
                  <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1">
                    {configGroupedSkills.map((group) => (
                      <div key={group.id}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.name}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {group.skills.map((skill) => {
                            const isSelected = configSkills.includes(skill.id);
                            return (
                              <button
                                key={skill.id}
                                onClick={() => toggleConfigSkill(skill.id)}
                                className={`flex items-start gap-3 rounded-lg border p-2.5 text-left transition-all ${
                                  isSelected ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/30"
                                }`}
                              >
                                <div className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"
                                }`}>
                                  {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-xs font-medium leading-tight ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                                    {skill.name}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3 pt-2">
                  <Button
                    className="w-full gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90 gap-2"
                    disabled={!configName.trim()}
                    onClick={handleSaveConfig}
                  >
                    <Save className="h-4 w-4" />
                    {t("agents.saveChanges")}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 gap-2"
                      onClick={handleArchiveAgent}
                    >
                      <Archive className="h-4 w-4" />
                       {t("agents.archive")}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300 gap-2"
                      onClick={handleClearMemory}
                    >
                      <Eraser className="h-4 w-4" />
                      {t("agents.clearMemory")}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2"
                      onClick={handleDeleteAgent}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deleteConfirmStep ? t("agents.areYouSure") : t("agents.delete")}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* ── Transfer Tasks Dialog ────────────── */}
        <Dialog
          open={transferOpen}
          onOpenChange={(open) => {
            setTransferOpen(open);
            if (!open) { setTransferAgentId(null); setTransferTaskCount(0); }
          }}
        >
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                {t("agents.transferAgentTasks")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 mt-2">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-400">
                  This agent has <span className="font-bold">{transferTaskCount}</span> active task{transferTaskCount !== 1 ? "s" : ""} that need to be reassigned before {transferAction === "archive" ? "archiving" : "deleting"}.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("agents.transferTasksTo")}</Label>
                <div className="space-y-2">
                  <button
                    onClick={() => setTransferTargetId("unassigned")}
                    className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                      transferTargetId === "unassigned" ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/20"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${transferTargetId === "unassigned" ? "border-primary" : "border-muted-foreground/40"}`}>
                      {transferTargetId === "unassigned" && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-sm text-foreground font-medium">{t("agents.keepUnassigned")}</span>
                  </button>
                  {myAgents
                    .filter((a) => !a.archived && a.id !== transferAgentId)
                    .map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => setTransferTargetId(agent.id)}
                        className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                          transferTargetId === agent.id ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/20"
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${transferTargetId === agent.id ? "border-primary" : "border-muted-foreground/40"}`}>
                          {transferTargetId === agent.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-foreground font-medium">{agent.name}</span>
                          {agent.active && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setTransferOpen(false); setTransferAgentId(null); }}
                >
                  {t("agents.cancel")}
                </Button>
                <Button
                  className="flex-1 gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90 gap-2"
                  onClick={handleTransferConfirm}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  {transferAction === "archive" ? t("agents.transferArchive") : t("agents.transferDelete")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Deploy Template Dialog ────────────── */}
        <Dialog
          open={deployOpen}
          onOpenChange={(open) => {
            setDeployOpen(open);
            if (!open) { setDeployTemplateData(null); setDeployName(""); }
          }}
        >
          {deployTemplate && (
            <DialogContent className="max-w-md bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  {t("agents.deployTemplateName", { name: deployTemplate.name })}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 mt-2">
                <div className="space-y-2">
                   <Label className="text-sm font-medium">{t("agents.nameYourAgent")}</Label>
                   <Input value={deployName} onChange={(e) => setDeployName(e.target.value)} placeholder={t("agents.nameYourAgent")} className="bg-background border-border" autoFocus />
                   <p className="text-xs text-muted-foreground">{t("agents.nameYourAgentDesc")}</p>
                </div>
                <div className="space-y-2">
                   <Label className="text-sm font-medium">{t("agents.aiModel")}</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {MODEL_OPTIONS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setDeployModel(model.id)}
                        className={`relative flex flex-col items-center gap-1 rounded-lg border p-2.5 transition-all text-center ${
                          deployModel === model.id ? "border-primary bg-primary/10 shadow-glow-sm" : "border-border bg-background hover:border-primary/30 hover:bg-primary/5"
                        }`}
                      >
                        {deployModel === model.id && <span className="absolute top-1 right-1"><Check className="h-3 w-3 text-primary" /></span>}
                        <Brain className={`h-4 w-4 ${deployModel === model.id ? model.color : "text-muted-foreground"}`} />
                        <span className={`text-[10px] font-medium ${deployModel === model.id ? "text-foreground" : "text-muted-foreground"}`}>{model.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("agents.includedSkills")}</Label>
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    {deployTemplate.defaultSkills.map((skillId) => (
                      <span key={skillId} className="text-xs px-2 py-0.5 rounded-md bg-primary/15 text-primary font-medium">{getSkillFullName(skillId)}</span>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border">
                  {deployTemplate.metrics.map((metric) => (
                    <div key={metric.label} className="text-center">
                      <p className="text-xs font-bold text-foreground">{metric.value}</p>
                      <p className="text-[10px] text-muted-foreground">{metric.label}</p>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90 gap-2"
                  disabled={!deployName.trim()}
                  onClick={handleDeployTemplate}
                >
                  <Zap className="h-4 w-4" /> {t("agents.deployAgent")}
                </Button>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* ── Create Agent Dialog ───────────────── */}
        <Dialog
          open={createOpen}
          onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                {t("agents.createNewAgent")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("agents.agentName")}</Label>
                <Input value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} placeholder="e.g. Dr. Front Desk, Marketing Maven..." className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("agents.aiModel")}</Label>
                <div className="grid grid-cols-5 gap-2">
                  {MODEL_OPTIONS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setNewAgentModel(model.id)}
                      className={`relative flex flex-col items-center gap-1 rounded-lg border p-3 transition-all text-center ${
                        newAgentModel === model.id ? "border-primary bg-primary/10 shadow-glow-sm" : "border-border bg-background hover:border-primary/30 hover:bg-primary/5"
                      }`}
                    >
                      {newAgentModel === model.id && <span className="absolute top-1.5 right-1.5"><Check className="h-3 w-3 text-primary" /></span>}
                      <Brain className={`h-5 w-5 ${newAgentModel === model.id ? model.color : "text-muted-foreground"}`} />
                      <span className={`text-xs font-medium ${newAgentModel === model.id ? "text-foreground" : "text-muted-foreground"}`}>{model.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Zone Classification */}
              <div className="space-y-2">
                 <Label className="text-sm font-medium">{t("agents.securityZone")}</Label>
                 <p className="text-xs text-muted-foreground mb-2">{t("agents.securityZoneDesc")}</p>
                <div className="space-y-2">
                  {(Object.entries(ZONE_CONFIG) as [AgentZone, typeof ZONE_CONFIG["clinical"]][]).map(([zone, config]) => (
                    <button
                      key={zone}
                      onClick={() => setNewAgentZone(zone)}
                      className={`w-full text-left rounded-xl border p-3 transition-all ${
                        newAgentZone === zone ? `${config.border} bg-primary/5` : "border-border bg-background hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <config.icon className={`h-4 w-4 ${config.color.split(' ')[0]}`} />
                        <p className="text-sm font-semibold text-foreground">{config.label}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{config.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {config.restrictions.map((r) => (
                          <span key={r} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground">{r}</span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Agent Language (Create) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Languages className="h-4 w-4 text-primary" />
                  {t("agents.agentLanguage")}
                </Label>
                <p className="text-xs text-muted-foreground">{t("agents.agentLanguageDesc")}</p>
                <div className="grid grid-cols-3 gap-2">
                  {AGENT_LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setNewAgentLanguage(lang.code)}
                      className={`relative flex items-center gap-2 justify-center rounded-lg border p-2.5 transition-all text-center ${
                        newAgentLanguage === lang.code
                          ? "border-primary bg-primary/10 shadow-glow-sm"
                          : "border-border bg-background hover:border-primary/30 hover:bg-primary/5"
                      }`}
                    >
                      {newAgentLanguage === lang.code && (
                        <span className="absolute top-1 right-1"><Check className="h-3 w-3 text-primary" /></span>
                      )}
                      <span className="text-xs font-bold">{lang.flag}</span>
                      <span className={`text-xs font-medium ${newAgentLanguage === lang.code ? "text-foreground" : "text-muted-foreground"}`}>
                        {lang.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">{t("agents.skills")} <span className="text-muted-foreground font-normal">({selectedSkills.length} {t("agents.selected")})</span></Label>
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    {selectedSkills.map((skillId) => (
                      <Badge key={skillId} className="bg-primary/15 text-primary border-0 hover:bg-primary/25 cursor-pointer gap-1 pr-1" onClick={() => removeSelectedSkill(skillId)}>
                        {getSkillFullName(skillId)}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={searchSkills} onChange={(e) => setSearchSkills(e.target.value)} placeholder={t("agents.searchSkills")} className="pl-9 bg-background border-border" />
                </div>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {groupedSkills.map((group) => (
                    <div key={group.id}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.name}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {group.skills.map((skill) => {
                          const isSelected = selectedSkills.includes(skill.id);
                          return (
                            <button
                              key={skill.id}
                              onClick={() => toggleSkill(skill.id)}
                              className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                                isSelected ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/30 hover:bg-primary/5"
                              }`}
                            >
                              <div className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                isSelected ? "bg-primary border-primary" : "border-muted-foreground/40"
                              }`}>
                                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-medium leading-tight ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>{skill.name}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{skill.description}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {groupedSkills.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">{t("agents.noSkillsMatch")}</div>
                  )}
                </div>
              </div>
              <Button
                className="w-full gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90 gap-2"
                disabled={!newAgentName.trim() || selectedSkills.length === 0}
                onClick={handleCreate}
              >
                <Plus className="h-4 w-4" /> Create Agent
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </DashboardLayout>
  );
};

export default Agents;
