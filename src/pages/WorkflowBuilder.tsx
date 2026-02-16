import { useState } from "react";
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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  WorkflowStatus,
  { label: string; color: string; bg: string }
> = {
  active: {
    label: "Active",
    color: "text-green-400",
    bg: "bg-green-500/15 border-green-500/30",
  },
  paused: {
    label: "Paused",
    color: "text-amber-400",
    bg: "bg-amber-500/15 border-amber-500/30",
  },
  draft: {
    label: "Draft",
    color: "text-zinc-400",
    bg: "bg-zinc-500/15 border-zinc-500/30",
  },
};

const EXECUTION_STATUS_CONFIG: Record<
  ExecutionStatus,
  { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  success: {
    label: "Success",
    color: "text-green-400",
    bg: "bg-green-500/15 border-green-500/30",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    color: "text-red-400",
    bg: "bg-red-500/15 border-red-500/30",
    icon: XCircle,
  },
  running: {
    label: "Running",
    color: "text-blue-400",
    bg: "bg-blue-500/15 border-blue-500/30",
    icon: Loader2,
  },
};

const TRIGGER_CONFIG: Record<TriggerType, { label: string; icon: typeof Zap }> =
  {
    manual: { label: "Manual", icon: Play },
    scheduled: { label: "Scheduled", icon: Calendar },
    event: { label: "Event-based", icon: Zap },
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
// Mock Data
// ---------------------------------------------------------------------------

const initialWorkflows: Workflow[] = [
  {
    id: "wf-1",
    name: "Patient Intake Pipeline",
    description:
      "Automates the end-to-end patient intake process from front desk check-in through insurance verification to clinical coordination.",
    steps: [
      { id: "s1", name: "Front Desk Agent", agent: "Front Desk Agent", timeout: 30, onFailure: "retry" },
      { id: "s2", name: "Insurance Verifier", agent: "Insurance Verifier", timeout: 60, onFailure: "stop" },
      { id: "s3", name: "Clinical Coordinator", agent: "Clinical Coordinator", timeout: 45, onFailure: "skip" },
    ],
    status: "active",
    trigger: "event",
    runs: 156,
    lastRun: "2 minutes ago",
  },
  {
    id: "wf-2",
    name: "Appointment Recovery",
    description:
      "Recovers missed and cancelled appointments by reaching out to patients and rescheduling through the front desk workflow.",
    steps: [
      { id: "s4", name: "Patient Outreach", agent: "Patient Outreach", timeout: 30, onFailure: "retry" },
      { id: "s5", name: "Front Desk Agent", agent: "Front Desk Agent", timeout: 30, onFailure: "retry" },
      { id: "s6", name: "SMS notification", agent: "SMS Notification", timeout: 10, onFailure: "skip" },
    ],
    status: "active",
    trigger: "scheduled",
    runs: 89,
    lastRun: "15 minutes ago",
  },
  {
    id: "wf-3",
    name: "Post-Op Follow-up",
    description:
      "Manages post-operative patient care by coordinating follow-up surveys and clinical review for recovery monitoring.",
    steps: [
      { id: "s7", name: "Post-Op Care Agent", agent: "Post-Op Care Agent", timeout: 60, onFailure: "retry" },
      { id: "s8", name: "Patient Survey", agent: "Patient Survey", timeout: 120, onFailure: "skip" },
      { id: "s9", name: "Clinical Coordinator", agent: "Clinical Coordinator", timeout: 45, onFailure: "stop" },
    ],
    status: "active",
    trigger: "event",
    runs: 234,
    lastRun: "5 minutes ago",
  },
  {
    id: "wf-4",
    name: "Content Publishing Pipeline",
    description:
      "Orchestrates the content lifecycle from creation through review and strategic alignment to final publication.",
    steps: [
      { id: "s10", name: "Content Engine", agent: "Content Engine", timeout: 90, onFailure: "retry" },
      { id: "s11", name: "Review", agent: "Review", timeout: 60, onFailure: "stop" },
      { id: "s12", name: "Marketing Strategist", agent: "Marketing Strategist", timeout: 45, onFailure: "retry" },
      { id: "s13", name: "Publish", agent: "Publish", timeout: 15, onFailure: "stop" },
    ],
    status: "paused",
    trigger: "manual",
    runs: 67,
    lastRun: "3 hours ago",
  },
  {
    id: "wf-5",
    name: "Financial Reporting Cycle",
    description:
      "Automates the financial reporting pipeline from data collection through analysis to report generation and distribution.",
    steps: [
      { id: "s14", name: "Financial Analyst", agent: "Financial Analyst", timeout: 120, onFailure: "stop" },
      { id: "s15", name: "Data Collection", agent: "Data Collection", timeout: 90, onFailure: "retry" },
      { id: "s16", name: "Report Generation", agent: "Report Generation", timeout: 60, onFailure: "retry" },
      { id: "s17", name: "Distribution", agent: "Distribution", timeout: 15, onFailure: "skip" },
    ],
    status: "active",
    trigger: "scheduled",
    runs: 45,
    lastRun: "1 hour ago",
  },
  {
    id: "wf-6",
    name: "Employee Onboarding",
    description:
      "Streamlines the employee onboarding process from HR coordination through IT setup to training assignment.",
    steps: [
      { id: "s18", name: "HR Coordinator", agent: "HR Coordinator", timeout: 60, onFailure: "stop" },
      { id: "s19", name: "IT Strategist", agent: "IT Strategist", timeout: 45, onFailure: "retry" },
      { id: "s20", name: "Training Assignment", agent: "Training Assignment", timeout: 30, onFailure: "skip" },
    ],
    status: "draft",
    trigger: "manual",
    runs: 0,
    lastRun: "Never",
  },
];

const initialExecutionLogs: ExecutionLog[] = [
  {
    id: "ex-1",
    workflowName: "Patient Intake Pipeline",
    trigger: "event",
    startTime: "Today, 10:32 AM",
    duration: "2m 14s",
    status: "success",
    stepsCompleted: 3,
    totalSteps: 3,
  },
  {
    id: "ex-2",
    workflowName: "Post-Op Follow-up",
    trigger: "event",
    startTime: "Today, 10:28 AM",
    duration: "4m 51s",
    status: "success",
    stepsCompleted: 3,
    totalSteps: 3,
  },
  {
    id: "ex-3",
    workflowName: "Appointment Recovery",
    trigger: "scheduled",
    startTime: "Today, 10:15 AM",
    duration: "1m 33s",
    status: "running",
    stepsCompleted: 2,
    totalSteps: 3,
  },
  {
    id: "ex-4",
    workflowName: "Financial Reporting Cycle",
    trigger: "scheduled",
    startTime: "Today, 9:00 AM",
    duration: "8m 22s",
    status: "success",
    stepsCompleted: 4,
    totalSteps: 4,
  },
  {
    id: "ex-5",
    workflowName: "Content Publishing Pipeline",
    trigger: "manual",
    startTime: "Today, 8:45 AM",
    duration: "3m 07s",
    status: "failed",
    stepsCompleted: 2,
    totalSteps: 4,
  },
  {
    id: "ex-6",
    workflowName: "Patient Intake Pipeline",
    trigger: "event",
    startTime: "Today, 8:12 AM",
    duration: "1m 58s",
    status: "success",
    stepsCompleted: 3,
    totalSteps: 3,
  },
];

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
      const action = wf.status === "active" ? "paused" : "activated";
      toast({
        title: `Workflow ${action}`,
        description: `"${wf.name}" has been ${action}.`,
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
      startTime: "Just now",
      duration: "0m 00s",
      status: "running",
      stepsCompleted: 0,
      totalSteps: wf.steps.length,
    };

    setExecutionLogs((prev) => [newExec, ...prev]);
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflowId
          ? { ...w, runs: w.runs + 1, lastRun: "Just now", status: w.status === "draft" ? "active" : w.status }
          : w
      )
    );

    toast({
      title: "Workflow executed",
      description: `"${wf.name}" has started running.`,
    });
  };

  const createWorkflow = () => {
    if (!newWorkflowName.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter a workflow name.",
      });
      return;
    }

    const validSteps = newWorkflowSteps.filter(
      (s) => s.name.trim() && s.agent.trim()
    );
    if (validSteps.length === 0) {
      toast({
        title: "Validation error",
        description: "Please add at least one step with a name and agent.",
      });
      return;
    }

    const newWorkflow: Workflow = {
      id: nextId("wf"),
      name: newWorkflowName.trim(),
      description: `Custom workflow: ${newWorkflowName.trim()}`,
      steps: validSteps.map((s, i) => ({
        ...s,
        id: nextId("s"),
        name: s.name || `Step ${i + 1}`,
      })),
      status: "draft",
      trigger: newWorkflowTrigger,
      runs: 0,
      lastRun: "Never",
    };

    setWorkflows((prev) => [newWorkflow, ...prev]);
    setCreateDialogOpen(false);
    setNewWorkflowName("");
    setNewWorkflowTrigger("manual");
    setNewWorkflowSteps([
      { id: nextId("ns"), name: "", agent: "", timeout: 30, onFailure: "retry" },
    ]);

    toast({
      title: "Workflow created",
      description: `"${newWorkflow.name}" has been created as a draft.`,
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
        title: "Cannot remove",
        description: "A workflow must have at least one step.",
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
        title: "Workflow deleted",
        description: `"${wf.name}" has been removed.`,
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
            </div>
            {index < steps.length - 1 && (
              <ArrowRight
                className={`h-4 w-4 shrink-0 ${
                  isActive ? "text-green-500/50" : "text-white/10"
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
                Care Workflow Builder
              </h1>
              <p className="text-muted-foreground mt-1">
                Design automated clinical pipelines — from patient intake to post-op follow-up.
              </p>
            </div>
            <Button
              className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Stats Cards                                                      */}
          {/* ---------------------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Active Workflows",
                value: stats.activeWorkflows,
                icon: Activity,
                change: "+2 this week",
              },
              {
                label: "Executions Today",
                value: stats.executionsToday,
                icon: Play,
                change: "+12 vs yesterday",
              },
              {
                label: "Success Rate",
                value: `${stats.successRate}%`,
                icon: CheckCircle2,
                change: "+3% vs last week",
              },
              {
                label: "Avg Duration",
                value: stats.avgDuration,
                icon: Timer,
                change: "-15s vs last week",
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
                Workflows
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search workflows..."
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
                      {s === "all" ? "All" : STATUS_CONFIG[s].label}
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
                          Run
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
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5 mr-1" />
                                Activate
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
                            Activate
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

                    {/* Bottom stats */}
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        {wf.runs} runs
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last run: {wf.lastRun}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {wf.steps.length} steps
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredWorkflows.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No workflows found</p>
                  <p className="text-xs mt-1">
                    Try adjusting your search or filter criteria
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
              Recent Executions
            </h2>
            <div className="bg-card rounded-xl border border-white/[0.06] overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-7 gap-4 px-5 py-3 border-b border-white/[0.06] text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span className="col-span-2">Workflow</span>
                <span>Trigger</span>
                <span>Start Time</span>
                <span>Duration</span>
                <span>Steps</span>
                <span>Status</span>
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
                  Create New Workflow
                </DialogTitle>
                <DialogDescription>
                  Design an automated workflow by defining steps and assigning agents.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                {/* Workflow name */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Workflow Name
                  </Label>
                  <Input
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    placeholder="e.g. Patient Intake Pipeline"
                    className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                  />
                </div>

                {/* Trigger type */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Trigger Type
                  </Label>
                  <div className="flex gap-2">
                    {(["manual", "scheduled", "event"] as TriggerType[]).map(
                      (t) => {
                        const cfg = TRIGGER_CONFIG[t];
                        const TIcon = cfg.icon;
                        return (
                          <button
                            key={t}
                            onClick={() => setNewWorkflowTrigger(t)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                              newWorkflowTrigger === t
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
                      Workflow Steps
                    </Label>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-muted-foreground hover:text-foreground h-7 px-2.5 text-xs"
                      onClick={addNewStep}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Step
                    </Button>
                  </div>

                  {newWorkflowSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Step {index + 1}
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
                            Step Name
                          </Label>
                          <Input
                            value={step.name}
                            onChange={(e) =>
                              updateNewStep(step.id, "name", e.target.value)
                            }
                            placeholder="e.g. Verify Insurance"
                            className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-xs h-9"
                          />
                        </div>

                        {/* Agent selection */}
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">
                            Assigned Agent
                          </Label>
                          <Select
                            value={step.agent}
                            onValueChange={(val) =>
                              updateNewStep(step.id, "agent", val)
                            }
                          >
                            <SelectTrigger className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-xs h-9">
                              <SelectValue placeholder="Select agent..." />
                            </SelectTrigger>
                            <SelectContent>
                              {AGENT_OPTIONS.map((agent) => (
                                <SelectItem key={agent} value={agent}>
                                  {agent}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Timeout */}
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">
                            Timeout (seconds)
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
                            On Failure
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
                              <SelectItem value="skip">Skip</SelectItem>
                              <SelectItem value="retry">Retry</SelectItem>
                              <SelectItem value="stop">Stop</SelectItem>
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
                        Pipeline Preview
                      </Label>
                      <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] p-3">
                        {renderPipeline(
                          newWorkflowSteps.filter((s) => s.name.trim()),
                          false
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  className="border-white/10 text-muted-foreground"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90"
                  onClick={createWorkflow}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workflow
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
