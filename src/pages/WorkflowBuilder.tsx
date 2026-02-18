import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  GitBranch,
  Play,
  Pause,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Timer,
  Activity,
  BarChart3,
  ArrowRight,
  Settings,
  Calendar,
  RefreshCw,
  Bot,
  Pencil,
  ChevronDown,
  Search,
  Loader2,
  FileText,
  Send,
  Users,
  ShieldCheck,
  TrendingUp,
  Megaphone,
  DollarSign,
  UserPlus,
  X,
  Shield,
  ShieldAlert,
  Lock,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WorkflowStatus = "active" | "paused" | "draft";
type TriggerType = "manual" | "scheduled" | "event";
type OnFailureAction = "skip" | "retry" | "stop";
type ExecutionStatus = "success" | "failed" | "running";

interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  timeout: number;
  onFailure: OnFailureAction;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  trigger: TriggerType;
  runs: number;
  lastRun: string;
}

interface ExecutionLog {
  id: string;
  workflowName: string;
  trigger: TriggerType;
  startTime: string;
  duration: string;
  status: ExecutionStatus;
  stepsCompleted: number;
  totalSteps: number;
}

type AgentZone = "clinical" | "operations" | "external";

const AGENT_ZONE_MAP: Record<string, AgentZone> = {
  "Front Desk Agent": "clinical",
  "Insurance Verifier": "clinical",
  "Clinical Coordinator": "clinical",
  "Patient Outreach": "external",
  "Post-Op Care Agent": "clinical",
  "Patient Survey": "external",
  "Content Engine": "external",
  "Marketing Strategist": "external",
  "Financial Analyst": "operations",
  "HR Coordinator": "operations",
  "IT Strategist": "operations",
  "SMS Notification": "external",
  "Report Generation": "operations",
  "Data Collection": "operations",
  "Training Assignment": "operations",
  "Review": "operations",
  "Publish": "external",
  "Distribution": "external",
};

const STEP_ICON_MAP: Record<string, typeof Bot> = {
  "Front Desk Agent": Users,
  "Insurance Verifier": ShieldCheck,
  "Clinical Coordinator": Activity,
  "Patient Outreach": Send,
  "Post-Op Care Agent": CheckCircle2,
  "Patient Survey": FileText,
  "Content Engine": Pencil,
  "Marketing Strategist": Megaphone,
  "Financial Analyst": DollarSign,
  "HR Coordinator": UserPlus,
  "IT Strategist": Settings,
  "SMS Notification": Send,
  "SMS notification": Send,
  "Report Generation": BarChart3,
  "Data Collection": Search,
  "Training Assignment": FileText,
  Review: ShieldCheck,
  Publish: TrendingUp,
  Distribution: Send,
};

// ---------------------------------------------------------------------------
// ID helper
// ---------------------------------------------------------------------------

let idCounter = 200;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const WorkflowBuilder = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  // ---------------------------------------------------------------------------
  // Constants (moved inside for i18n access)
  // ---------------------------------------------------------------------------

  const ZONE_BADGE: Record<AgentZone, { label: string; color: string }> = {
    clinical: { label: t("workflow.z1Clinical"), color: "text-red-400 bg-red-500/10 border-red-500/30" },
    operations: { label: t("workflow.z2Ops"), color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
    external: { label: t("workflow.z3External"), color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
  };

  const hasZoneViolation = (steps: WorkflowStep[]): { hasViolation: boolean; details: string[] } => {
    const details: string[] = [];
    for (let i = 0; i < steps.length - 1; i++) {
      const currentZone = AGENT_ZONE_MAP[steps[i].agent] || "operations";
      const nextZone = AGENT_ZONE_MAP[steps[i + 1].agent] || "operations";
      if (currentZone === "clinical" && nextZone === "external") {
        details.push(t("workflow.zoneViolationClinicalToExternal", { stepA: i + 1, agentA: steps[i].agent, stepB: i + 2, agentB: steps[i + 1].agent }));
      }
      if (currentZone === "external" && nextZone === "clinical") {
        details.push(t("workflow.zoneViolationExternalToClinical", { stepA: i + 1, agentA: steps[i].agent, stepB: i + 2, agentB: steps[i + 1].agent }));
      }
    }
    return { hasViolation: details.length > 0, details };
  };

  const STATUS_CONFIG: Record<
    WorkflowStatus,
    { label: string; color: string; bg: string }
  > = {
    active: {
      label: t("workflow.statusActive"),
      color: "text-green-400",
      bg: "bg-green-500/15 border-green-500/30",
    },
    paused: {
      label: t("workflow.statusPaused"),
      color: "text-amber-400",
      bg: "bg-amber-500/15 border-amber-500/30",
    },
    draft: {
      label: t("workflow.statusDraft"),
      color: "text-zinc-400",
      bg: "bg-zinc-500/15 border-zinc-500/30",
    },
  };

  const EXECUTION_STATUS_CONFIG: Record<
    ExecutionStatus,
    { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
  > = {
    success: {
      label: t("workflow.execSuccess"),
      color: "text-green-400",
      bg: "bg-green-500/15 border-green-500/30",
      icon: CheckCircle2,
    },
    failed: {
      label: t("workflow.execFailed"),
      color: "text-red-400",
      bg: "bg-red-500/15 border-red-500/30",
      icon: XCircle,
    },
    running: {
      label: t("workflow.execRunning"),
      color: "text-blue-400",
      bg: "bg-blue-500/15 border-blue-500/30",
      icon: Loader2,
    },
  };

  const TRIGGER_CONFIG: Record<TriggerType, { label: string; icon: typeof Zap }> =
    {
      manual: { label: t("workflow.triggerManual"), icon: Play },
      scheduled: { label: t("workflow.triggerScheduled"), icon: Calendar },
      event: { label: t("workflow.triggerEvent"), icon: Zap },
    };

  const AGENT_OPTIONS = [
    "Front Desk Agent",
    "Insurance Verifier",
    "Clinical Coordinator",
    "Patient Outreach",
    "Post-Op Care Agent",
    "Patient Survey",
    "Content Engine",
    "Marketing Strategist",
    "Financial Analyst",
    "HR Coordinator",
    "IT Strategist",
    "SMS Notification",
    "Report Generation",
    "Data Collection",
    "Training Assignment",
    "Review",
    "Publish",
    "Distribution",
  ];

  const initialWorkflows: Workflow[] = [
    {
      id: "wf-1",
      name: t("workflow.wfPatientIntakeName"),
      description: t("workflow.wfPatientIntakeDesc"),
      steps: [
        { id: "s1", name: t("workflow.agentFrontDesk"), agent: "Front Desk Agent", timeout: 30, onFailure: "retry" },
        { id: "s2", name: t("workflow.agentInsuranceVerifier"), agent: "Insurance Verifier", timeout: 60, onFailure: "stop" },
        { id: "s3", name: t("workflow.agentClinicalCoordinator"), agent: "Clinical Coordinator", timeout: 45, onFailure: "skip" },
      ],
      status: "active",
      trigger: "event",
      runs: 156,
      lastRun: t("workflow.twoMinutesAgo"),
    },
    {
      id: "wf-2",
      name: t("workflow.wfAppointmentRecoveryName"),
      description: t("workflow.wfAppointmentRecoveryDesc"),
      steps: [
        { id: "s4", name: t("workflow.agentPatientOutreach"), agent: "Patient Outreach", timeout: 30, onFailure: "retry" },
        { id: "s5", name: t("workflow.agentFrontDesk"), agent: "Front Desk Agent", timeout: 30, onFailure: "retry" },
        { id: "s6", name: t("workflow.agentSmsNotification"), agent: "SMS Notification", timeout: 10, onFailure: "skip" },
      ],
      status: "active",
      trigger: "scheduled",
      runs: 89,
      lastRun: t("workflow.fifteenMinutesAgo"),
    },
    {
      id: "wf-3",
      name: t("workflow.wfPostOpFollowUpName"),
      description: t("workflow.wfPostOpFollowUpDesc"),
      steps: [
        { id: "s7", name: t("workflow.agentPostOpCare"), agent: "Post-Op Care Agent", timeout: 60, onFailure: "retry" },
        { id: "s8", name: t("workflow.agentPatientSurvey"), agent: "Patient Survey", timeout: 120, onFailure: "skip" },
        { id: "s9", name: t("workflow.agentClinicalCoordinator"), agent: "Clinical Coordinator", timeout: 45, onFailure: "stop" },
      ],
      status: "active",
      trigger: "event",
      runs: 234,
      lastRun: t("workflow.fiveMinutesAgo"),
    },
    {
      id: "wf-4",
      name: t("workflow.wfContentPublishingName"),
      description: t("workflow.wfContentPublishingDesc"),
      steps: [
        { id: "s10", name: t("workflow.agentContentEngine"), agent: "Content Engine", timeout: 90, onFailure: "retry" },
        { id: "s11", name: t("workflow.agentReview"), agent: "Review", timeout: 60, onFailure: "stop" },
        { id: "s12", name: t("workflow.agentMarketingStrategist"), agent: "Marketing Strategist", timeout: 45, onFailure: "retry" },
        { id: "s13", name: t("workflow.agentPublish"), agent: "Publish", timeout: 15, onFailure: "stop" },
      ],
      status: "paused",
      trigger: "manual",
      runs: 67,
      lastRun: t("workflow.threeHoursAgo"),
    },
    {
      id: "wf-5",
      name: t("workflow.wfFinancialReportingName"),
      description: t("workflow.wfFinancialReportingDesc"),
      steps: [
        { id: "s14", name: t("workflow.agentFinancialAnalyst"), agent: "Financial Analyst", timeout: 120, onFailure: "stop" },
        { id: "s15", name: t("workflow.agentDataCollection"), agent: "Data Collection", timeout: 90, onFailure: "retry" },
        { id: "s16", name: t("workflow.agentReportGeneration"), agent: "Report Generation", timeout: 60, onFailure: "retry" },
        { id: "s17", name: t("workflow.agentDistribution"), agent: "Distribution", timeout: 15, onFailure: "skip" },
      ],
      status: "active",
      trigger: "scheduled",
      runs: 45,
      lastRun: t("workflow.oneHourAgo"),
    },
    {
      id: "wf-6",
      name: t("workflow.wfEmployeeOnboardingName"),
      description: t("workflow.wfEmployeeOnboardingDesc"),
      steps: [
        { id: "s18", name: t("workflow.agentHrCoordinator"), agent: "HR Coordinator", timeout: 60, onFailure: "stop" },
        { id: "s19", name: t("workflow.agentItStrategist"), agent: "IT Strategist", timeout: 45, onFailure: "retry" },
        { id: "s20", name: t("workflow.agentTrainingAssignment"), agent: "Training Assignment", timeout: 30, onFailure: "skip" },
      ],
      status: "draft",
      trigger: "manual",
      runs: 0,
      lastRun: t("workflow.never"),
    },
  ];

  const initialExecutionLogs: ExecutionLog[] = [
    {
      id: "ex-1",
      workflowName: t("workflow.wfPatientIntakeName"),
      trigger: "event",
      startTime: t("workflow.today1032"),
      duration: "2m 14s",
      status: "success",
      stepsCompleted: 3,
      totalSteps: 3,
    },
    {
      id: "ex-2",
      workflowName: t("workflow.wfPostOpFollowUpName"),
      trigger: "event",
      startTime: t("workflow.today1028"),
      duration: "4m 51s",
      status: "success",
      stepsCompleted: 3,
      totalSteps: 3,
    },
    {
      id: "ex-3",
      workflowName: t("workflow.wfAppointmentRecoveryName"),
      trigger: "scheduled",
      startTime: t("workflow.today1015"),
      duration: "1m 33s",
      status: "running",
      stepsCompleted: 2,
      totalSteps: 3,
    },
    {
      id: "ex-4",
      workflowName: t("workflow.wfFinancialReportingName"),
      trigger: "scheduled",
      startTime: t("workflow.today0900"),
      duration: "8m 22s",
      status: "success",
      stepsCompleted: 4,
      totalSteps: 4,
    },
    {
      id: "ex-5",
      workflowName: t("workflow.wfContentPublishingName"),
      trigger: "manual",
      startTime: t("workflow.today0845"),
      duration: "3m 07s",
      status: "failed",
      stepsCompleted: 2,
      totalSteps: 4,
    },
    {
      id: "ex-6",
      workflowName: t("workflow.wfPatientIntakeName"),
      trigger: "event",
      startTime: t("workflow.today0812"),
      duration: "1m 58s",
      status: "success",
      stepsCompleted: 3,
      totalSteps: 3,
    },
  ];

  // Core state
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>(initialExecutionLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | "all">("all");

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowTrigger, setNewWorkflowTrigger] = useState<TriggerType>("manual");
  const [newWorkflowSteps, setNewWorkflowSteps] = useState<WorkflowStep[]>([
    { id: nextId("ns"), name: "", agent: "", timeout: 30, onFailure: "retry" },
  ]);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const filteredWorkflows = workflows.filter((wf) => {
    const matchesSearch =
      wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wf.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : wf.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    activeWorkflows: workflows.filter((w) => w.status === "active").length,
    executionsToday: executionLogs.length,
    successRate: Math.round(
      (executionLogs.filter((e) => e.status === "success").length /
        Math.max(executionLogs.filter((e) => e.status !== "running").length, 1)) *
        100
    ),
    avgDuration:
      (() => {
        const durations = executionLogs.map((e) => {
          const parts = e.duration.match(/(\d+)m\s*(\d+)s/);
          if (parts) return parseInt(parts[1]) * 60 + parseInt(parts[2]);
          return 0;
        });
        const avg = durations.reduce((a, b) => a + b, 0) / Math.max(durations.length, 1);
        const mins = Math.floor(avg / 60);
        const secs = Math.round(avg % 60);
        return `${mins}m ${secs}s`;
      })(),
  };

  // ---------------------------------------------------------------------------
  // Workflow actions
  // ---------------------------------------------------------------------------

  const toggleWorkflowStatus = (workflowId: string) => {
    setWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id !== workflowId) return wf;
        const newStatus: WorkflowStatus =
          wf.status === "active" ? "paused" : "active";
        return { ...wf, status: newStatus };
      })
    );
    const wf = workflows.find((w) => w.id === workflowId);
    if (wf) {
      const isPausing = wf.status === "active";
      toast({
        title: isPausing ? t("workflow.toastWorkflowPausedTitle") : t("workflow.toastWorkflowActivatedTitle"),
        description: isPausing
          ? t("workflow.toastWorkflowPausedDesc", { name: wf.name })
          : t("workflow.toastWorkflowActivatedDesc", { name: wf.name }),
      });
    }
  };

  const runWorkflow = (workflowId: string) => {
    const wf = workflows.find((w) => w.id === workflowId);
    if (!wf) return;

    const newExec: ExecutionLog = {
      id: nextId("ex"),
      workflowName: wf.name,
      trigger: "manual",
      startTime: t("workflow.justNow"),
      duration: "0m 00s",
      status: "running",
      stepsCompleted: 0,
      totalSteps: wf.steps.length,
    };

    setExecutionLogs((prev) => [newExec, ...prev]);
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflowId
          ? { ...w, runs: w.runs + 1, lastRun: t("workflow.justNow"), status: w.status === "draft" ? "active" : w.status }
          : w
      )
    );

    toast({
      title: t("workflow.toastWorkflowExecutedTitle"),
      description: t("workflow.toastWorkflowExecutedDesc", { name: wf.name }),
    });
  };

  const createWorkflow = () => {
    if (!newWorkflowName.trim()) {
      toast({
        title: t("workflow.toastValidationErrorTitle"),
        description: t("workflow.toastEnterWorkflowName"),
      });
      return;
    }

    const validSteps = newWorkflowSteps.filter(
      (s) => s.name.trim() && s.agent.trim()
    );
    if (validSteps.length === 0) {
      toast({
        title: t("workflow.toastValidationErrorTitle"),
        description: t("workflow.toastAddAtLeastOneStep"),
      });
      return;
    }

    const newWorkflow: Workflow = {
      id: nextId("wf"),
      name: newWorkflowName.trim(),
      description: t("workflow.customWorkflowDesc", { name: newWorkflowName.trim() }),
      steps: validSteps.map((s, i) => ({
        ...s,
        id: nextId("s"),
        name: s.name || t("workflow.stepNumber", { number: i + 1 }),
      })),
      status: "draft",
      trigger: newWorkflowTrigger,
      runs: 0,
      lastRun: t("workflow.never"),
    };

    setWorkflows((prev) => [newWorkflow, ...prev]);
    setCreateDialogOpen(false);
    setNewWorkflowName("");
    setNewWorkflowTrigger("manual");
    setNewWorkflowSteps([
      { id: nextId("ns"), name: "", agent: "", timeout: 30, onFailure: "retry" },
    ]);

    toast({
      title: t("workflow.toastWorkflowCreatedTitle"),
      description: t("workflow.toastWorkflowCreatedDesc", { name: newWorkflow.name }),
    });
  };

  const addNewStep = () => {
    setNewWorkflowSteps((prev) => [
      ...prev,
      { id: nextId("ns"), name: "", agent: "", timeout: 30, onFailure: "retry" },
    ]);
  };

  const removeNewStep = (stepId: string) => {
    if (newWorkflowSteps.length <= 1) {
      toast({
        title: t("workflow.toastCannotRemoveTitle"),
        description: t("workflow.toastCannotRemoveDesc"),
      });
      return;
    }
    setNewWorkflowSteps((prev) => prev.filter((s) => s.id !== stepId));
  };

  const updateNewStep = (
    stepId: string,
    field: keyof WorkflowStep,
    value: string | number
  ) => {
    setNewWorkflowSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, [field]: value } : s))
    );
  };

  const deleteWorkflow = (workflowId: string) => {
    const wf = workflows.find((w) => w.id === workflowId);
    setWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
    if (wf) {
      toast({
        title: t("workflow.toastWorkflowDeletedTitle"),
        description: t("workflow.toastWorkflowDeletedDesc", { name: wf.name }),
      });
    }
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const getStepIcon = (agentName: string) => {
    return STEP_ICON_MAP[agentName] || Bot;
  };

  const renderPipeline = (steps: WorkflowStep[], isActive: boolean) => (
    <div className="flex items-center gap-1 flex-wrap py-2">
      {steps.map((step, index) => {
        const StepIcon = getStepIcon(step.agent);
        return (
          <div key={step.id} className="flex items-center gap-1">
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "border-green-500/30 bg-green-500/5 text-green-300"
                  : "border-white/[0.06] bg-white/[0.02] text-muted-foreground"
              }`}
            >
              <StepIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="whitespace-nowrap">{step.name}</span>
              <span className={`text-[8px] px-1 py-0 rounded ${ZONE_BADGE[AGENT_ZONE_MAP[step.agent] || "operations"].color} ml-1`}>
                {ZONE_BADGE[AGENT_ZONE_MAP[step.agent] || "operations"].label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight
                className={`h-4 w-4 shrink-0 ${
                  (AGENT_ZONE_MAP[step.agent] === "clinical" && AGENT_ZONE_MAP[steps[index + 1]?.agent] === "external") ||
                  (AGENT_ZONE_MAP[step.agent] === "external" && AGENT_ZONE_MAP[steps[index + 1]?.agent] === "clinical")
                    ? "text-red-500"
                    : isActive ? "text-green-500/50" : "text-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ---------------------------------------------------------------- */}
          {/* Header                                                           */}
          {/* ---------------------------------------------------------------- */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading gradient-hero-text flex items-center gap-3">
                <GitBranch className="h-7 w-7 text-primary" />
                {t("workflow.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("workflow.subtitle")}
              </p>
            </div>
            <Button
              className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("workflow.newWorkflow")}
            </Button>
          </div>

          {/* Zone Enforcement Banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <Shield className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-400">{t("workflow.zoneIsolationEnforced")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("workflow.zoneIsolationDescription")}
              </p>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Stats Cards                                                      */}
          {/* ---------------------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: t("workflow.activeWorkflows"),
                value: stats.activeWorkflows,
                icon: Activity,
                change: t("workflow.changePlusTwoThisWeek"),
              },
              {
                label: t("workflow.executionsToday"),
                value: stats.executionsToday,
                icon: Play,
                change: t("workflow.changePlusTwelveVsYesterday"),
              },
              {
                label: t("workflow.successRate"),
                value: `${stats.successRate}%`,
                icon: CheckCircle2,
                change: t("workflow.changePlusThreePercentVsLastWeek"),
              },
              {
                label: t("workflow.avgDuration"),
                value: stats.avgDuration,
                icon: Timer,
                change: t("workflow.changeMinusFifteenSecsVsLastWeek"),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </span>
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Workflow List                                                     */}
          {/* ---------------------------------------------------------------- */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-lg font-semibold text-foreground">
                {t("workflow.workflows")}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("workflow.searchPlaceholder")}
                    className="pl-9 bg-white/[0.03] border-white/10 focus:border-primary/50 w-64"
                  />
                </div>
                {/* Status filter */}
                <div className="flex gap-1 bg-card/50 border border-white/[0.06] rounded-xl p-1">
                  {(["all", "active", "paused", "draft"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        statusFilter === s
                          ? "gradient-primary text-primary-foreground shadow-glow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s === "all" ? t("workflow.filterAll") : STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Workflow cards */}
            <div className="space-y-4">
              {filteredWorkflows.map((wf) => {
                const statusCfg = STATUS_CONFIG[wf.status];
                const triggerCfg = TRIGGER_CONFIG[wf.trigger];
                const TriggerIcon = triggerCfg.icon;

                return (
                  <div
                    key={wf.id}
                    className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover"
                  >
                    {/* Top row: name, badges, actions */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="text-sm font-semibold text-foreground">
                            {wf.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`text-[10px] border ${statusCfg.bg} ${statusCfg.color} px-1.5 py-0`}
                          >
                            {statusCfg.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-white/10 text-muted-foreground px-1.5 py-0 flex items-center gap-1"
                          >
                            <TriggerIcon className="h-2.5 w-2.5" />
                            {triggerCfg.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {wf.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/10 text-muted-foreground hover:text-foreground h-8 px-3 text-xs"
                          onClick={() => runWorkflow(wf.id)}
                        >
                          <Play className="h-3.5 w-3.5 mr-1" />
                          {t("workflow.run")}
                        </Button>
                        {wf.status !== "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className={`border-white/10 h-8 px-3 text-xs ${
                              wf.status === "active"
                                ? "text-amber-400 hover:text-amber-300"
                                : "text-green-400 hover:text-green-300"
                            }`}
                            onClick={() => toggleWorkflowStatus(wf.id)}
                          >
                            {wf.status === "active" ? (
                              <>
                                <Pause className="h-3.5 w-3.5 mr-1" />
                                {t("workflow.pause")}
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5 mr-1" />
                                {t("workflow.activate")}
                              </>
                            )}
                          </Button>
                        )}
                        {wf.status === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10 text-green-400 hover:text-green-300 h-8 px-3 text-xs"
                            onClick={() => toggleWorkflowStatus(wf.id)}
                          >
                            <Play className="h-3.5 w-3.5 mr-1" />
                            {t("workflow.activate")}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/10 text-red-400 hover:text-red-300 h-8 w-8 p-0"
                          onClick={() => deleteWorkflow(wf.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Visual Pipeline */}
                    {renderPipeline(wf.steps, wf.status === "active")}
                    {(() => {
                      const violation = hasZoneViolation(wf.steps);
                      if (!violation.hasViolation) return null;
                      return (
                        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 mt-2">
                          <ShieldAlert className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[11px] font-semibold text-red-400">{t("workflow.zoneViolationDetected")}</p>
                            {violation.details.map((d, i) => (
                              <p key={i} className="text-[10px] text-red-400/80 mt-0.5">{d}</p>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Bottom stats */}
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        {t("workflow.runsCount", { count: wf.runs })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t("workflow.lastRun", { time: wf.lastRun })}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {t("workflow.stepsCount", { count: wf.steps.length })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredWorkflows.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">{t("workflow.noWorkflowsFound")}</p>
                  <p className="text-xs mt-1">
                    {t("workflow.tryAdjustingSearch")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Execution Log                                                    */}
          {/* ---------------------------------------------------------------- */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              {t("workflow.recentExecutions")}
            </h2>
            <div className="bg-card rounded-xl border border-white/[0.06] overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-7 gap-4 px-5 py-3 border-b border-white/[0.06] text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span className="col-span-2">{t("workflow.columnWorkflow")}</span>
                <span>{t("workflow.columnTrigger")}</span>
                <span>{t("workflow.columnStartTime")}</span>
                <span>{t("workflow.columnDuration")}</span>
                <span>{t("workflow.columnSteps")}</span>
                <span>{t("workflow.columnStatus")}</span>
              </div>
              {/* Rows */}
              {executionLogs.map((exec) => {
                const execCfg = EXECUTION_STATUS_CONFIG[exec.status];
                const triggerCfg = TRIGGER_CONFIG[exec.trigger];
                const ExecIcon = execCfg.icon;
                const TriggerIcon = triggerCfg.icon;

                return (
                  <div
                    key={exec.id}
                    className="grid grid-cols-7 gap-4 px-5 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors items-center"
                  >
                    <span className="col-span-2 text-xs font-medium text-foreground truncate">
                      {exec.workflowName}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <TriggerIcon className="h-3 w-3" />
                      {triggerCfg.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {exec.startTime}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {exec.duration}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {exec.stepsCompleted}/{exec.totalSteps}
                    </span>
                    <div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] border ${execCfg.bg} ${execCfg.color} px-1.5 py-0 flex items-center gap-1 w-fit`}
                      >
                        <ExecIcon
                          className={`h-2.5 w-2.5 ${
                            exec.status === "running" ? "animate-spin" : ""
                          }`}
                        />
                        {execCfg.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Create Workflow Dialog                                            */}
          {/* ---------------------------------------------------------------- */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent className="sm:max-w-[680px] bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-primary" />
                  {t("workflow.createNewWorkflow")}
                </DialogTitle>
                <DialogDescription>
                  {t("workflow.createDialogDescription")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                {/* Workflow name */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {t("workflow.workflowNameLabel")}
                  </Label>
                  <Input
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    placeholder={t("workflow.workflowNamePlaceholder")}
                    className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                  />
                </div>

                {/* Trigger type */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {t("workflow.triggerTypeLabel")}
                  </Label>
                  <div className="flex gap-2">
                    {(["manual", "scheduled", "event"] as TriggerType[]).map(
                      (triggerType) => {
                        const cfg = TRIGGER_CONFIG[triggerType];
                        const TIcon = cfg.icon;
                        return (
                          <button
                            key={triggerType}
                            onClick={() => setNewWorkflowTrigger(triggerType)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                              newWorkflowTrigger === triggerType
                                ? "text-primary bg-primary/10 border-primary/30"
                                : "text-muted-foreground border-white/10 hover:text-foreground hover:border-white/20"
                            }`}
                          >
                            <TIcon className="h-3.5 w-3.5" />
                            {cfg.label}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <Separator className="border-white/[0.06]" />

                {/* Steps */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      {t("workflow.workflowStepsLabel")}
                    </Label>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-muted-foreground hover:text-foreground h-7 px-2.5 text-xs"
                      onClick={addNewStep}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {t("workflow.addStep")}
                    </Button>
                  </div>

                  {newWorkflowSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {t("workflow.stepNumber", { number: index + 1 })}
                        </span>
                        <button
                          onClick={() => removeNewStep(step.id)}
                          className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Step name */}
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">
                            {t("workflow.stepNameLabel")}
                          </Label>
                          <Input
                            value={step.name}
                            onChange={(e) =>
                              updateNewStep(step.id, "name", e.target.value)
                            }
                            placeholder={t("workflow.stepNamePlaceholder")}
                            className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-xs h-9"
                          />
                        </div>

                        {/* Agent selection */}
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">
                            {t("workflow.assignedAgentLabel")}
                          </Label>
                          <Select
                            value={step.agent}
                            onValueChange={(val) =>
                              updateNewStep(step.id, "agent", val)
                            }
                          >
                            <SelectTrigger className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-xs h-9">
                              <SelectValue placeholder={t("workflow.selectAgentPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              {AGENT_OPTIONS.map((agent) => {
                                const zone = AGENT_ZONE_MAP[agent] || "operations";
                                return (
                                  <SelectItem key={agent} value={agent}>
                                    <span className="flex items-center gap-2">
                                      {agent}
                                      <span className={`text-[9px] px-1 py-0 rounded ${ZONE_BADGE[zone].color}`}>
                                        {ZONE_BADGE[zone].label}
                                      </span>
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Timeout */}
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">
                            {t("workflow.timeoutLabel")}
                          </Label>
                          <Input
                            type="number"
                            value={step.timeout}
                            onChange={(e) =>
                              updateNewStep(
                                step.id,
                                "timeout",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-xs h-9"
                          />
                        </div>

                        {/* On failure */}
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">
                            {t("workflow.onFailureLabel")}
                          </Label>
                          <Select
                            value={step.onFailure}
                            onValueChange={(val) =>
                              updateNewStep(
                                step.id,
                                "onFailure",
                                val as OnFailureAction
                              )
                            }
                          >
                            <SelectTrigger className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-xs h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="skip">{t("workflow.failureSkip")}</SelectItem>
                              <SelectItem value="retry">{t("workflow.failureRetry")}</SelectItem>
                              <SelectItem value="stop">{t("workflow.failureStop")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Preview pipeline */}
                  {newWorkflowSteps.some((s) => s.name.trim()) && (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {t("workflow.pipelinePreview")}
                      </Label>
                      <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-3">
                        {renderPipeline(
                          newWorkflowSteps.filter((s) => s.name.trim()),
                          false
                        )}
                      </div>
                    </div>
                  )}
                  {(() => {
                    const validSteps = newWorkflowSteps.filter((s) => s.agent.trim());
                    if (validSteps.length < 2) return null;
                    const violation = hasZoneViolation(validSteps);
                    if (!violation.hasViolation) return null;
                    return (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <ShieldAlert className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-red-400">{t("workflow.zoneViolationCannotCreate")}</p>
                          {violation.details.map((d, i) => (
                            <p key={i} className="text-[10px] text-red-400/80 mt-0.5">{d}</p>
                          ))}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {t("workflow.zoneViolationHint")}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  className="border-white/10 text-muted-foreground"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  {t("workflow.cancel")}
                </Button>
                <Button
                  className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90"
                  onClick={createWorkflow}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("workflow.createWorkflow")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default WorkflowBuilder;
