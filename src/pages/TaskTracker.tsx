import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Search,
  Bot,
  Calendar,
  Tag,
  ListTodo,
  Columns3,
  Timer,
  Zap,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  Users,
  Pencil,
  Copy,
  Archive,
  Bell,
  BellRing,
  Plus,
  Trash2,
  X,
  FileText,
  ExternalLink,
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TaskStatus = "queued" | "in_progress" | "completed" | "failed" | "archived";
type TaskPriority = "low" | "medium" | "high" | "urgent";
type ViewMode = "list" | "board" | "calendar" | "assigned" | "timeline";

interface AgentTask {
  id: string;
  title: string;
  description: string;
  agentName: string;
  agentId: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  duration?: string;
  progress: number;
  subtasks?: { label: string; done: boolean }[];
  dueDate?: string;
  archived?: boolean;
  integrations?: string[];
}

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: TaskPriority;
  suggestedAgent: string;
  defaultSubtasks: string[];
}

interface TaskNotification {
  type: "delay" | "completion" | "progress" | "blocker";
  label: string;
  description: string;
  enabled: boolean;
  recipients: string[];
}

// ---------------------------------------------------------------------------
// Config constants (non-translatable parts)
// ---------------------------------------------------------------------------

const AGENT_NAMES = [
  "Dr. Front Desk",
  "Marketing Maven",
  "Grant Pro",
  "HR Helper",
  "Finance Bot",
  "Doc Collector",
];

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockTasks: AgentTask[] = [
  {
    id: "task-1",
    title: "Schedule 15 patient follow-up appointments",
    description:
      "Reach out to patients who visited last month and schedule follow-up appointments based on their treatment plans.",
    agentName: "Dr. Front Desk",
    agentId: "1",
    status: "in_progress",
    priority: "high",
    category: "Scheduling",
    createdAt: "Today, 8:00 AM",
    startedAt: "Today, 8:02 AM",
    duration: "2h 15m",
    progress: 60,
    dueDate: "2026-02-18",
    integrations: ["Trello"],
    subtasks: [
      { label: "Pull patient list from last month", done: true },
      { label: "Cross-reference treatment plans", done: true },
      { label: "Send appointment invitations (9/15)", done: false },
      { label: "Confirm responses", done: false },
    ],
  },
  {
    id: "task-2",
    title: "Generate Q1 social media campaign",
    description:
      "Create a full social media content calendar for Q1 including posts, graphics briefs, and engagement strategy.",
    agentName: "Marketing Maven",
    agentId: "2",
    status: "completed",
    priority: "medium",
    category: "Marketing",
    createdAt: "Yesterday, 2:00 PM",
    startedAt: "Yesterday, 2:01 PM",
    completedAt: "Yesterday, 4:30 PM",
    duration: "2h 29m",
    progress: 100,
    dueDate: "2026-02-17",
    integrations: ["Asana"],
    subtasks: [
      { label: "Analyze previous quarter performance", done: true },
      { label: "Draft content calendar (30 posts)", done: true },
      { label: "Write copy for each post", done: true },
      { label: "Create graphics briefs", done: true },
    ],
  },
  {
    id: "task-3",
    title: "Draft NIH R01 grant application",
    description:
      "Prepare a complete R01 grant application including specific aims, significance, innovation, and approach sections.",
    agentName: "Grant Pro",
    agentId: "3",
    status: "in_progress",
    priority: "urgent",
    category: "Research",
    createdAt: "Today, 6:00 AM",
    startedAt: "Today, 6:05 AM",
    duration: "4h 10m",
    progress: 45,
    dueDate: "2026-02-20",
    integrations: ["Trello", "Asana"],
    subtasks: [
      { label: "Review funding opportunity announcement", done: true },
      { label: "Draft specific aims page", done: true },
      { label: "Write significance section", done: false },
      { label: "Write innovation section", done: false },
      { label: "Prepare budget justification", done: false },
    ],
  },
  {
    id: "task-4",
    title: "Insurance verification batch (32 patients)",
    description:
      "Verify insurance eligibility and coverage for all patients with appointments next week.",
    agentName: "Dr. Front Desk",
    agentId: "1",
    status: "queued",
    priority: "medium",
    category: "Insurance",
    createdAt: "Today, 9:00 AM",
    progress: 0,
    dueDate: "2026-02-19",
    subtasks: [
      { label: "Pull next week's appointment list", done: false },
      { label: "Submit eligibility checks", done: false },
      { label: "Flag coverage issues", done: false },
      { label: "Notify patients of issues", done: false },
    ],
  },
  {
    id: "task-5",
    title: "Competitor pricing analysis report",
    description:
      "Analyze competitor pricing strategies across 8 competitors and prepare a recommendations report.",
    agentName: "Marketing Maven",
    agentId: "2",
    status: "completed",
    priority: "low",
    category: "Research",
    createdAt: "2 days ago",
    startedAt: "2 days ago",
    completedAt: "2 days ago",
    duration: "1h 45m",
    progress: 100,
    dueDate: "2026-02-16",
  },
  {
    id: "task-6",
    title: "Process prescription refill requests",
    description:
      "Handle 8 pending prescription refill requests — verify histories, contact pharmacies, and notify patients.",
    agentName: "Dr. Front Desk",
    agentId: "1",
    status: "completed",
    priority: "high",
    category: "Prescriptions",
    createdAt: "Today, 7:30 AM",
    startedAt: "Today, 7:31 AM",
    completedAt: "Today, 8:15 AM",
    duration: "44m",
    progress: 100,
    integrations: ["Trello"],
  },
  {
    id: "task-7",
    title: "Email campaign A/B test setup",
    description:
      "Set up A/B testing for the product launch email campaign with two subject lines and CTA variations.",
    agentName: "Marketing Maven",
    agentId: "2",
    status: "queued",
    priority: "medium",
    category: "Marketing",
    createdAt: "Today, 10:00 AM",
    progress: 0,
    dueDate: "2026-02-21",
  },
  {
    id: "task-8",
    title: "Patient no-show follow-up calls",
    description:
      "Contact 5 patients who missed their appointments today to reschedule.",
    agentName: "Dr. Front Desk",
    agentId: "1",
    status: "failed",
    priority: "high",
    category: "Outreach",
    createdAt: "Yesterday, 5:00 PM",
    startedAt: "Yesterday, 5:01 PM",
    duration: "12m",
    progress: 20,
    dueDate: "2026-02-17",
    integrations: ["Asana"],
    subtasks: [
      { label: "Pull no-show list", done: true },
      { label: "Attempt phone contact", done: false },
      { label: "Send SMS follow-up", done: false },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper: generate unique IDs
// ---------------------------------------------------------------------------

let idCounter = 100;
const nextId = () => `task-${++idCounter}`;

// ---------------------------------------------------------------------------
// Calendar helpers
// ---------------------------------------------------------------------------

const getWeekDays = (): { label: string; dateStr: string }[] => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const days: { label: string; dateStr: string }[] = [];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      label: `${dayNames[i]} ${d.getMonth() + 1}/${d.getDate()}`,
      dateStr,
    });
  }
  return days;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const TaskTracker = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  // ---------------------------------------------------------------------------
  // Translated config constants (moved inside component for t() access)
  // ---------------------------------------------------------------------------

  const STATUS_CONFIG: Record<
    TaskStatus,
    { icon: typeof Circle; label: string; color: string; bg: string }
  > = {
    queued: {
      icon: Circle,
      label: t("taskTracker.queued"),
      color: "text-zinc-400",
      bg: "bg-zinc-500/15 border-zinc-500/30",
    },
    in_progress: {
      icon: RefreshCw,
      label: t("taskTracker.inProgress"),
      color: "text-blue-400",
      bg: "bg-blue-500/15 border-blue-500/30",
    },
    completed: {
      icon: CheckCircle2,
      label: t("taskTracker.completed"),
      color: "text-green-400",
      bg: "bg-green-500/15 border-green-500/30",
    },
    failed: {
      icon: AlertTriangle,
      label: t("taskTracker.failed"),
      color: "text-red-400",
      bg: "bg-red-500/15 border-red-500/30",
    },
    archived: {
      icon: Archive,
      label: t("taskTracker.archived"),
      color: "text-purple-400",
      bg: "bg-purple-500/15 border-purple-500/30",
    },
  };

  const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
    low: { label: t("taskTracker.priorityLow"), color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
    medium: { label: t("taskTracker.priorityMedium"), color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    high: { label: t("taskTracker.priorityHigh"), color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    urgent: { label: t("taskTracker.priorityUrgent"), color: "text-red-400 bg-red-500/10 border-red-500/20" },
  };

  const TASK_TEMPLATES: TaskTemplate[] = [
    {
      id: "tpl-1",
      name: t("taskTracker.templatePatientFollowUpName"),
      description: t("taskTracker.templatePatientFollowUpDesc"),
      category: t("taskTracker.categoryScheduling"),
      priority: "high",
      suggestedAgent: "Dr. Front Desk",
      defaultSubtasks: [
        t("taskTracker.subtaskPullPatientList"),
        t("taskTracker.subtaskCrossReferencePlans"),
        t("taskTracker.subtaskSendInvitations"),
        t("taskTracker.subtaskConfirmResponses"),
      ],
    },
    {
      id: "tpl-2",
      name: t("taskTracker.templateInsuranceVerificationName"),
      description: t("taskTracker.templateInsuranceVerificationDesc"),
      category: t("taskTracker.categoryInsurance"),
      priority: "medium",
      suggestedAgent: "Dr. Front Desk",
      defaultSubtasks: [
        t("taskTracker.subtaskPullAppointmentList"),
        t("taskTracker.subtaskSubmitEligibility"),
        t("taskTracker.subtaskFlagCoverage"),
        t("taskTracker.subtaskNotifyPatients"),
      ],
    },
    {
      id: "tpl-3",
      name: t("taskTracker.templateSocialMediaName"),
      description: t("taskTracker.templateSocialMediaDesc"),
      category: t("taskTracker.categoryMarketing"),
      priority: "medium",
      suggestedAgent: "Marketing Maven",
      defaultSubtasks: [
        t("taskTracker.subtaskAnalyzeMetrics"),
        t("taskTracker.subtaskDraftCalendar"),
        t("taskTracker.subtaskWriteCopy"),
        t("taskTracker.subtaskCreateGraphics"),
        t("taskTracker.subtaskSchedulePosts"),
      ],
    },
    {
      id: "tpl-4",
      name: t("taskTracker.templateGrantApplicationName"),
      description: t("taskTracker.templateGrantApplicationDesc"),
      category: t("taskTracker.categoryResearch"),
      priority: "urgent",
      suggestedAgent: "Grant Pro",
      defaultSubtasks: [
        t("taskTracker.subtaskReviewFunding"),
        t("taskTracker.subtaskDraftAims"),
        t("taskTracker.subtaskWriteSignificance"),
        t("taskTracker.subtaskWriteInnovation"),
        t("taskTracker.subtaskPrepareBudget"),
        t("taskTracker.subtaskCompileDocs"),
      ],
    },
    {
      id: "tpl-5",
      name: t("taskTracker.templateStaffTrainingName"),
      description: t("taskTracker.templateStaffTrainingDesc"),
      category: t("taskTracker.categoryHR"),
      priority: "medium",
      suggestedAgent: "HR Helper",
      defaultSubtasks: [
        t("taskTracker.subtaskIdentifyPendingTraining"),
        t("taskTracker.subtaskSendReminders"),
        t("taskTracker.subtaskTrackCompletion"),
        t("taskTracker.subtaskSendFollowUp"),
        t("taskTracker.subtaskGenerateComplianceReport"),
      ],
    },
    {
      id: "tpl-6",
      name: t("taskTracker.templatePayrollName"),
      description: t("taskTracker.templatePayrollDesc"),
      category: t("taskTracker.categoryFinance"),
      priority: "high",
      suggestedAgent: "Finance Bot",
      defaultSubtasks: [
        t("taskTracker.subtaskCollectTimesheets"),
        t("taskTracker.subtaskCalculateDeductions"),
        t("taskTracker.subtaskProcessDeposits"),
        t("taskTracker.subtaskGeneratePayStubs"),
        t("taskTracker.subtaskFilePayrollTax"),
      ],
    },
    {
      id: "tpl-7",
      name: t("taskTracker.templateDocCollectionName"),
      description: t("taskTracker.templateDocCollectionDesc"),
      category: t("taskTracker.categoryAdministration"),
      priority: "medium",
      suggestedAgent: "Doc Collector",
      defaultSubtasks: [
        t("taskTracker.subtaskIdentifyMissingDocs"),
        t("taskTracker.subtaskSendDocRequests"),
        t("taskTracker.subtaskFollowUpUnreturned"),
        t("taskTracker.subtaskUploadFileDocs"),
      ],
    },
    {
      id: "tpl-8",
      name: t("taskTracker.templateAppointmentBatchName"),
      description: t("taskTracker.templateAppointmentBatchDesc"),
      category: t("taskTracker.categoryScheduling"),
      priority: "high",
      suggestedAgent: "Dr. Front Desk",
      defaultSubtasks: [
        t("taskTracker.subtaskReviewWaitlist"),
        t("taskTracker.subtaskCheckAvailability"),
        t("taskTracker.subtaskSendSchedulingOffers"),
        t("taskTracker.subtaskConfirmBookings"),
      ],
    },
    {
      id: "tpl-9",
      name: t("taskTracker.templateEmailABTestName"),
      description: t("taskTracker.templateEmailABTestDesc"),
      category: t("taskTracker.categoryMarketing"),
      priority: "medium",
      suggestedAgent: "Marketing Maven",
      defaultSubtasks: [
        t("taskTracker.subtaskDefineHypothesis"),
        t("taskTracker.subtaskCreateVariants"),
        t("taskTracker.subtaskSegmentAudience"),
        t("taskTracker.subtaskLaunchCampaign"),
        t("taskTracker.subtaskAnalyzeResults"),
      ],
    },
    {
      id: "tpl-10",
      name: t("taskTracker.templateComplianceAuditName"),
      description: t("taskTracker.templateComplianceAuditDesc"),
      category: t("taskTracker.categoryAdministration"),
      priority: "high",
      suggestedAgent: "HR Helper",
      defaultSubtasks: [
        t("taskTracker.subtaskCollectChecklists"),
        t("taskTracker.subtaskReviewDocumentation"),
        t("taskTracker.subtaskInterviewLeads"),
        t("taskTracker.subtaskCompileFindings"),
        t("taskTracker.subtaskCreateRemediation"),
      ],
    },
  ];

  const VIEW_MODES: { mode: ViewMode; icon: typeof ListTodo; label: string }[] = [
    { mode: "list", icon: ListTodo, label: t("taskTracker.viewList") },
    { mode: "board", icon: Columns3, label: t("taskTracker.viewBoard") },
    { mode: "calendar", icon: Calendar, label: t("taskTracker.viewCalendar") },
    { mode: "assigned", icon: Users, label: t("taskTracker.viewAssigned") },
    { mode: "timeline", icon: Clock, label: t("taskTracker.viewTimeline") },
  ];

  const boardColumns: { status: TaskStatus; label: string }[] = [
    { status: "queued", label: t("taskTracker.queued") },
    { status: "in_progress", label: t("taskTracker.inProgress") },
    { status: "completed", label: t("taskTracker.completed") },
    { status: "failed", label: t("taskTracker.failed") },
  ];

  // --- Core state ---
  const [tasks, setTasks] = useState<AgentTask[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "templates">("tasks");

  // --- Edit dialog ---
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<AgentTask | null>(null);
  const [newSubtaskLabel, setNewSubtaskLabel] = useState("");

  // --- Notification config ---
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<TaskNotification[]>([
    {
      type: "delay",
      label: t("taskTracker.notifDelayLabel"),
      description: t("taskTracker.notifDelayDesc"),
      enabled: true,
      recipients: ["admin@clinic.com"],
    },
    {
      type: "completion",
      label: t("taskTracker.notifCompletionLabel"),
      description: t("taskTracker.notifCompletionDesc"),
      enabled: true,
      recipients: ["admin@clinic.com"],
    },
    {
      type: "progress",
      label: t("taskTracker.notifProgressLabel"),
      description: t("taskTracker.notifProgressDesc"),
      enabled: false,
      recipients: [],
    },
    {
      type: "blocker",
      label: t("taskTracker.notifBlockerLabel"),
      description: t("taskTracker.notifBlockerDesc"),
      enabled: true,
      recipients: ["admin@clinic.com", "ops@clinic.com"],
    },
  ]);
  const [notifRecipientInput, setNotifRecipientInput] = useState("");

  // --- User-saved templates ---
  const [userTemplates, setUserTemplates] = useState<TaskTemplate[]>([]);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const allTemplates = [...TASK_TEMPLATES, ...userTemplates];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? !task.archived
        : statusFilter === "archived"
          ? task.archived
          : task.status === statusFilter && !task.archived;
    return matchesSearch && matchesStatus;
  });

  const activeTasks = tasks.filter((t) => !t.archived);
  const stats = {
    total: activeTasks.length,
    queued: activeTasks.filter((t) => t.status === "queued").length,
    inProgress: activeTasks.filter((t) => t.status === "in_progress").length,
    completed: activeTasks.filter((t) => t.status === "completed").length,
    failed: activeTasks.filter((t) => t.status === "failed").length,
    archived: tasks.filter((t) => t.archived).length,
  };

  // ---------------------------------------------------------------------------
  // Task actions
  // ---------------------------------------------------------------------------

  const openEditDialog = (task: AgentTask) => {
    setEditingTask({ ...task, subtasks: task.subtasks ? task.subtasks.map((s) => ({ ...s })) : [] });
    setNewSubtaskLabel("");
    setEditDialogOpen(true);
  };

  const saveEditedTask = () => {
    if (!editingTask) return;
    setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? { ...editingTask } : t)));
    setEditDialogOpen(false);
    setEditingTask(null);
    toast({ title: t("taskTracker.toastTaskUpdatedTitle"), description: t("taskTracker.toastTaskUpdatedDesc") });
  };

  const duplicateTask = (task: AgentTask) => {
    const dup: AgentTask = {
      ...task,
      id: nextId(),
      title: t("taskTracker.copyTitle", { title: task.title }),
      status: "queued",
      progress: 0,
      createdAt: t("taskTracker.justNow"),
      startedAt: undefined,
      completedAt: undefined,
      duration: undefined,
      archived: false,
      subtasks: task.subtasks ? task.subtasks.map((s) => ({ ...s, done: false })) : undefined,
    };
    setTasks((prev) => [dup, ...prev]);
    toast({ title: t("taskTracker.toastTaskDuplicatedTitle"), description: t("taskTracker.toastTaskDuplicatedDesc", { title: dup.title }) });
  };

  const archiveTask = (task: AgentTask) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, archived: true, status: "archived" as TaskStatus } : t,
      ),
    );
    toast({ title: t("taskTracker.toastTaskArchivedTitle"), description: t("taskTracker.toastTaskArchivedDesc", { title: task.title }) });
  };

  const saveAsTemplate = (task: AgentTask) => {
    const tpl: TaskTemplate = {
      id: `user-tpl-${Date.now()}`,
      name: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      suggestedAgent: task.agentName,
      defaultSubtasks: task.subtasks ? task.subtasks.map((s) => s.label) : [],
    };
    setUserTemplates((prev) => [...prev, tpl]);
    toast({ title: t("taskTracker.toastTemplateSavedTitle"), description: t("taskTracker.toastTemplateSavedDesc", { name: tpl.name }) });
  };

  const deployTemplate = (tpl: TaskTemplate) => {
    const task: AgentTask = {
      id: nextId(),
      title: tpl.name,
      description: tpl.description,
      agentName: tpl.suggestedAgent,
      agentId: "0",
      status: "queued",
      priority: tpl.priority,
      category: tpl.category,
      createdAt: t("taskTracker.justNow"),
      progress: 0,
      subtasks: tpl.defaultSubtasks.map((label) => ({ label, done: false })),
    };
    setTasks((prev) => [task, ...prev]);
    setActiveTab("tasks");
    toast({ title: t("taskTracker.toastTemplateDeployedTitle"), description: t("taskTracker.toastTemplateDeployedDesc", { title: task.title }) });
  };

  // ---------------------------------------------------------------------------
  // Notification helpers
  // ---------------------------------------------------------------------------

  const toggleNotification = (type: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.type === type ? { ...n, enabled: !n.enabled } : n)),
    );
  };

  const addRecipient = (type: string) => {
    const email = notifRecipientInput.trim();
    if (!email) return;
    setNotifications((prev) =>
      prev.map((n) =>
        n.type === type && !n.recipients.includes(email)
          ? { ...n, recipients: [...n.recipients, email] }
          : n,
      ),
    );
    setNotifRecipientInput("");
  };

  const removeRecipient = (type: string, email: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.type === type ? { ...n, recipients: n.recipients.filter((r) => r !== email) } : n,
      ),
    );
  };

  // ---------------------------------------------------------------------------
  // Render: Task Card
  // ---------------------------------------------------------------------------

  const renderTaskCard = (task: AgentTask, compact = false) => {
    const statusCfg = STATUS_CONFIG[task.status];
    const priorityCfg = PRIORITY_CONFIG[task.priority];
    const StatusIcon = statusCfg.icon;
    const isExpanded = expandedTask === task.id;

    return (
      <div
        key={task.id}
        className={`rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/20 ${
          compact ? "" : "card-hover"
        }`}
      >
        <div className="flex items-start gap-3">
          <StatusIcon
            className={`h-5 w-5 mt-0.5 shrink-0 ${statusCfg.color} ${
              task.status === "in_progress" ? "animate-spin" : ""
            }`}
            style={task.status === "in_progress" ? { animationDuration: "3s" } : {}}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className="text-sm font-semibold text-foreground leading-tight cursor-pointer hover:text-primary transition-colors"
                onClick={() => openEditDialog(task)}
              >
                {task.title}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                {/* Edit button */}
                <button
                  onClick={() => openEditDialog(task)}
                  className="p-1 rounded hover:bg-white/5 text-muted-foreground"
                  title={t("taskTracker.editTask")}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>

                {/* More actions dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded hover:bg-white/5 text-muted-foreground">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => duplicateTask(task)}>
                      <Copy className="h-4 w-4 mr-2" /> {t("taskTracker.duplicate")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => archiveTask(task)}>
                      <Archive className="h-4 w-4 mr-2" /> {t("taskTracker.archive")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => saveAsTemplate(task)}>
                      <FileText className="h-4 w-4 mr-2" /> {t("taskTracker.saveAsTemplate")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Expand toggle */}
                {!compact && (
                  <button
                    onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                    className="p-1 rounded hover:bg-white/5 text-muted-foreground"
                  >
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge
                variant="outline"
                className={`text-[10px] border ${priorityCfg.color} px-1.5 py-0`}
              >
                {priorityCfg.label}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] border ${statusCfg.bg} ${statusCfg.color} px-1.5 py-0`}
              >
                {statusCfg.label}
              </Badge>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Bot className="h-3 w-3" /> {task.agentName}
              </span>
              {/* Integration badges */}
              {task.integrations &&
                task.integrations.map((name) => (
                  <Badge
                    key={name}
                    variant="outline"
                    className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-1.5 py-0 flex items-center gap-1"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                    {t("taskTracker.syncedTo", { name })}
                  </Badge>
                ))}
            </div>

            {/* Progress bar */}
            {task.progress > 0 && task.progress < 100 && (
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">{t("taskTracker.progress")}</span>
                  <span className="text-[10px] font-medium text-foreground">{task.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-primary transition-all duration-500"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {task.createdAt}
              </span>
              {task.duration && (
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" /> {task.duration}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" /> {task.category}
              </span>
              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {t("taskTracker.due")} {task.dueDate}
                </span>
              )}
            </div>

            {/* Expanded details */}
            {isExpanded && !compact && (
              <div className="mt-3 pt-3 border-t border-border space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {task.description}
                </p>
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("taskTracker.subtasksCount", { done: task.subtasks.filter((s) => s.done).length, total: task.subtasks.length })}
                    </p>
                    {task.subtasks.map((sub, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {sub.done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                        )}
                        <span
                          className={`text-xs ${
                            sub.done ? "text-muted-foreground line-through" : "text-foreground/80"
                          }`}
                        >
                          {sub.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {task.startedAt && (
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>{t("taskTracker.started")}: {task.startedAt}</span>
                    {task.completedAt && <span>{t("taskTracker.completedLabel")}: {task.completedAt}</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render: Views
  // ---------------------------------------------------------------------------

  const renderListView = () => (
    <div className="space-y-3">
      {filteredTasks.map((task) => renderTaskCard(task))}
      {filteredTasks.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">{t("taskTracker.noTasksMatch")}</p>
          <p className="text-xs mt-1">{t("taskTracker.tryAdjusting")}</p>
        </div>
      )}
    </div>
  );

  const renderBoardView = () => (
    <div className="grid grid-cols-4 gap-4">
      {boardColumns.map((col) => {
        const colTasks = filteredTasks.filter((t) => t.status === col.status);
        const statusCfg = STATUS_CONFIG[col.status];
        return (
          <div key={col.status} className="space-y-3">
            <div className="flex items-center gap-2 px-1 mb-2">
              <statusCfg.icon className={`h-4 w-4 ${statusCfg.color}`} />
              <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
              <Badge variant="outline" className="text-[10px] border-border ml-auto">
                {colTasks.length}
              </Badge>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {colTasks.map((task) => renderTaskCard(task, true))}
              {colTasks.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
                  <p className="text-xs text-muted-foreground">{t("taskTracker.noTasks")}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderCalendarView = () => {
    const weekDays = getWeekDays();

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayTasks = filteredTasks.filter((t) => t.dueDate === day.dateStr);
          const isToday = day.dateStr === new Date().toISOString().split("T")[0];
          return (
            <div
              key={day.dateStr}
              className={`rounded-xl border bg-card p-3 min-h-[180px] ${
                isToday ? "border-primary/40" : "border-border"
              }`}
            >
              <p
                className={`text-xs font-semibold mb-2 ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {day.label}
              </p>
              <div className="space-y-1.5">
                {dayTasks.map((task) => {
                  const statusCfg = STATUS_CONFIG[task.status];
                  const priorityCfg = PRIORITY_CONFIG[task.priority];
                  return (
                    <div
                      key={task.id}
                      className="rounded-lg border border-border bg-background/50 p-2 cursor-pointer hover:border-primary/20 transition-colors"
                      onClick={() => openEditDialog(task)}
                    >
                      <p className="text-[10px] font-medium text-foreground leading-tight truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-[8px] border ${statusCfg.bg} ${statusCfg.color} px-1 py-0`}
                        >
                          {statusCfg.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[8px] border ${priorityCfg.color} px-1 py-0`}
                        >
                          {priorityCfg.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {dayTasks.length === 0 && (
                  <p className="text-[10px] text-muted-foreground/40 text-center pt-4">--</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAssignedView = () => {
    const agentGroups: Record<string, AgentTask[]> = {};
    filteredTasks.forEach((task) => {
      if (!agentGroups[task.agentName]) agentGroups[task.agentName] = [];
      agentGroups[task.agentName].push(task);
    });

    return (
      <div className="space-y-6">
        {Object.entries(agentGroups).map(([agentName, agentTasks]) => (
          <div key={agentName}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Bot className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{agentName}</h3>
              <Badge variant="outline" className="text-[10px] border-border ml-1">
                {agentTasks.length === 1
                  ? t("taskTracker.taskCountSingular", { count: agentTasks.length })
                  : t("taskTracker.taskCountPlural", { count: agentTasks.length })}
              </Badge>
            </div>
            <div className="space-y-2">
              {agentTasks.map((task) => renderTaskCard(task))}
            </div>
          </div>
        ))}
        {Object.keys(agentGroups).length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">{t("taskTracker.noTasksMatch")}</p>
          </div>
        )}
      </div>
    );
  };

  const renderTimelineView = () => {
    const tasksWithDates = filteredTasks.filter((t) => t.dueDate);
    const sorted = [...tasksWithDates].sort((a, b) =>
      (a.dueDate || "").localeCompare(b.dueDate || ""),
    );

    // Determine date range
    const allDates = sorted.map((t) => t.dueDate!);
    const minDate = allDates[0] || new Date().toISOString().split("T")[0];
    const maxDate = allDates[allDates.length - 1] || minDate;

    const start = new Date(minDate);
    const end = new Date(maxDate);
    const totalDays = Math.max(Math.ceil((end.getTime() - start.getTime()) / 86400000), 1);

    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{t("taskTracker.timeline")}</h3>
          <span className="text-[10px] text-muted-foreground ml-2">
            {minDate} {t("taskTracker.to")} {maxDate}
          </span>
        </div>

        {/* Timeline header */}
        <div className="relative mb-2 h-6">
          <div className="absolute inset-x-0 top-3 h-px bg-border" />
          {Array.from({ length: Math.min(totalDays + 1, 14) }).map((_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const pct = totalDays > 0 ? (i / totalDays) * 100 : 0;
            return (
              <div
                key={i}
                className="absolute text-[8px] text-muted-foreground -translate-x-1/2"
                style={{ left: `${Math.min(pct, 100)}%` }}
              >
                {d.getMonth() + 1}/{d.getDate()}
              </div>
            );
          })}
        </div>

        {/* Task bars */}
        <div className="space-y-2 mt-4">
          {sorted.map((task) => {
            const taskDate = new Date(task.dueDate!);
            const dayOffset = Math.ceil(
              (taskDate.getTime() - start.getTime()) / 86400000,
            );
            const leftPct = totalDays > 0 ? (dayOffset / totalDays) * 100 : 0;
            const statusCfg = STATUS_CONFIG[task.status];

            return (
              <div key={task.id} className="relative h-8 flex items-center">
                <div
                  className="absolute text-[10px] text-foreground font-medium truncate max-w-[180px] -translate-x-full pr-2 right-auto"
                  style={{ left: `${Math.max(leftPct - 1, 0)}%`, right: "auto" }}
                >
                  {leftPct > 30 && task.title}
                </div>
                <div
                  className={`absolute h-6 rounded-lg border flex items-center gap-1.5 px-2 cursor-pointer hover:opacity-80 transition-opacity ${statusCfg.bg}`}
                  style={{
                    left: `${Math.min(leftPct, 95)}%`,
                    minWidth: "120px",
                    maxWidth: "260px",
                  }}
                  onClick={() => openEditDialog(task)}
                >
                  <statusCfg.icon
                    className={`h-3 w-3 shrink-0 ${statusCfg.color}`}
                  />
                  <span
                    className={`text-[10px] font-medium truncate ${statusCfg.color}`}
                  >
                    {task.title}
                  </span>
                </div>
              </div>
            );
          })}
          {sorted.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-xs">{t("taskTracker.noTasksWithDueDates")}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render: Templates Tab
  // ---------------------------------------------------------------------------

  const renderTemplatesTab = () => {
    const categories = Array.from(new Set(allTemplates.map((t) => t.category)));

    return (
      <div className="space-y-6">
        {categories.map((cat) => {
          const catTemplates = allTemplates.filter((t) => t.category === cat);
          return (
            <div key={cat}>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                {cat}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {catTemplates.map((tpl) => {
                  const priorityCfg = PRIORITY_CONFIG[tpl.priority];
                  return (
                    <div
                      key={tpl.id}
                      className="bg-card rounded-xl border border-border p-5 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-foreground leading-tight">
                          {tpl.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={`text-[10px] border ${priorityCfg.color} px-1.5 py-0 shrink-0 ml-2`}
                        >
                          {priorityCfg.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {tpl.description}
                      </p>
                      <div className="flex items-center gap-2 mb-3 text-[10px] text-muted-foreground">
                        <Bot className="h-3 w-3" />
                        <span>{tpl.suggestedAgent}</span>
                        <span className="ml-auto">
                          {tpl.defaultSubtasks.length === 1
                            ? t("taskTracker.subtaskSingular", { count: tpl.defaultSubtasks.length })
                            : t("taskTracker.subtaskPlural", { count: tpl.defaultSubtasks.length })}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90 text-xs"
                        onClick={() => deployTemplate(tpl)}
                      >
                        <Zap className="h-3.5 w-3.5 mr-1.5" />
                        {t("taskTracker.deployTemplate")}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render: Edit Dialog
  // ---------------------------------------------------------------------------

  const renderEditDialog = () => {
    if (!editingTask) return null;

    return (
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{t("taskTracker.editTaskTitle")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("taskTracker.labelTitle")}</Label>
              <Input
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                className="bg-white/[0.03] border-white/10 focus:border-primary/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("taskTracker.labelDescription")}</Label>
              <Textarea
                value={editingTask.description}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, description: e.target.value })
                }
                className="bg-white/[0.03] border-white/10 focus:border-primary/50 min-h-[80px]"
              />
            </div>

            {/* Priority + Status row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t("taskTracker.labelPriority")}</Label>
                <div className="flex gap-1 flex-wrap">
                  {(["low", "medium", "high", "urgent"] as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setEditingTask({ ...editingTask, priority: p })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                        editingTask.priority === p
                          ? PRIORITY_CONFIG[p].color + " border-current"
                          : "text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {PRIORITY_CONFIG[p].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t("taskTracker.labelStatus")}</Label>
                <div className="flex gap-1 flex-wrap">
                  {(["queued", "in_progress", "completed", "failed"] as TaskStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setEditingTask({ ...editingTask, status: s })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                        editingTask.status === s
                          ? STATUS_CONFIG[s].color + " " + STATUS_CONFIG[s].bg
                          : "text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category + Agent row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t("taskTracker.labelCategory")}</Label>
                <Input
                  value={editingTask.category}
                  onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{t("taskTracker.labelAssignedAgent")}</Label>
                <div className="flex gap-1 flex-wrap">
                  {AGENT_NAMES.map((name) => (
                    <button
                      key={name}
                      onClick={() => setEditingTask({ ...editingTask, agentName: name })}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                        editingTask.agentName === name
                          ? "text-primary bg-primary/10 border-primary/30"
                          : "text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Due date */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{t("taskTracker.labelDueDate")}</Label>
              <Input
                type="date"
                value={editingTask.dueDate || ""}
                onChange={(e) =>
                  setEditingTask({ ...editingTask, dueDate: e.target.value || undefined })
                }
                className="bg-white/[0.03] border-white/10 focus:border-primary/50 max-w-[200px]"
              />
            </div>

            <Separator className="border-border" />

            {/* Subtasks */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">{t("taskTracker.labelSubtasks")}</Label>
              {editingTask.subtasks &&
                editingTask.subtasks.map((sub, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <button
                      onClick={() => {
                        const updated = [...(editingTask.subtasks || [])];
                        updated[i] = { ...updated[i], done: !updated[i].done };
                        setEditingTask({ ...editingTask, subtasks: updated });
                      }}
                      className="shrink-0"
                    >
                      {sub.done ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground/40" />
                      )}
                    </button>
                    <span
                      className={`text-xs flex-1 ${
                        sub.done ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                    >
                      {sub.label}
                    </span>
                    <button
                      onClick={() => {
                        const updated = (editingTask.subtasks || []).filter((_, idx) => idx !== i);
                        setEditingTask({ ...editingTask, subtasks: updated });
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/5 text-muted-foreground transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newSubtaskLabel}
                  onChange={(e) => setNewSubtaskLabel(e.target.value)}
                  placeholder={t("taskTracker.addSubtaskPlaceholder")}
                  className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newSubtaskLabel.trim()) {
                      const updated = [
                        ...(editingTask.subtasks || []),
                        { label: newSubtaskLabel.trim(), done: false },
                      ];
                      setEditingTask({ ...editingTask, subtasks: updated });
                      setNewSubtaskLabel("");
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-border text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    if (newSubtaskLabel.trim()) {
                      const updated = [
                        ...(editingTask.subtasks || []),
                        { label: newSubtaskLabel.trim(), done: false },
                      ];
                      setEditingTask({ ...editingTask, subtasks: updated });
                      setNewSubtaskLabel("");
                    }
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-border text-muted-foreground"
              onClick={() => setEditDialogOpen(false)}
            >
              {t("taskTracker.cancel")}
            </Button>
            <Button
              className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90"
              onClick={saveEditedTask}
            >
              {t("taskTracker.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // ---------------------------------------------------------------------------
  // Render: Notification Config Dialog
  // ---------------------------------------------------------------------------

  const renderNotificationDialog = () => (
    <Dialog open={notifDialogOpen} onOpenChange={setNotifDialogOpen}>
      <DialogContent className="sm:max-w-[520px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            {t("taskTracker.taskNotifications")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {notifications.map((notif) => (
            <div
              key={notif.type}
              className="bg-white/[0.02] rounded-xl border border-border p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{notif.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {notif.description}
                  </p>
                </div>
                <Switch
                  checked={notif.enabled}
                  onCheckedChange={() => toggleNotification(notif.type)}
                />
              </div>

              {notif.enabled && (
                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {t("taskTracker.recipients")}
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {notif.recipients.map((email) => (
                      <Badge
                        key={email}
                        variant="outline"
                        className="text-[10px] border-border text-foreground/80 px-2 py-0.5 flex items-center gap-1"
                      >
                        {email}
                        <button
                          onClick={() => removeRecipient(notif.type, email)}
                          className="ml-0.5 hover:text-red-400 transition-colors"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={notifRecipientInput}
                      onChange={(e) => setNotifRecipientInput(e.target.value)}
                      placeholder="email@example.com"
                      className="bg-white/[0.03] border-white/10 focus:border-primary/50 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addRecipient(notif.type);
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 border-border text-muted-foreground hover:text-foreground"
                      onClick={() => addRecipient(notif.type)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90"
            onClick={() => {
              setNotifDialogOpen(false);
              toast({ title: t("taskTracker.toastNotifSavedTitle"), description: t("taskTracker.toastNotifSavedDesc") });
            }}
          >
            {t("taskTracker.savePreferences")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                <ListTodo className="h-7 w-7 text-primary" />
                {t("taskTracker.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("taskTracker.subtitle")}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-muted-foreground hover:text-foreground relative"
              onClick={() => setNotifDialogOpen(true)}
            >
              <Bell className="h-4 w-4" />
              {notifications.filter((n) => n.enabled).length > 0 && (
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center">
                  {notifications.filter((n) => n.enabled).length}
                </span>
              )}
            </Button>
          </div>

          {/* Tab toggle: My Tasks / Templates */}
          <div className="flex items-center gap-1 mb-6 bg-card/50 border border-border rounded-xl p-1 w-fit">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "tasks"
                  ? "gradient-primary text-primary-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("taskTracker.myTasks")}
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "templates"
                  ? "gradient-primary text-primary-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              {t("taskTracker.templates")}
              <Badge variant="outline" className="text-[9px] border-border ml-1 px-1.5 py-0">
                {allTemplates.length}
              </Badge>
            </button>
          </div>

          {/* ============================================================= */}
          {/* MY TASKS TAB                                                   */}
          {/* ============================================================= */}
          {activeTab === "tasks" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                {[
                  {
                    label: t("taskTracker.queued"),
                    value: stats.queued,
                    icon: Circle,
                    color: "text-zinc-400",
                    bg: "bg-zinc-500/10",
                  },
                  {
                    label: t("taskTracker.inProgress"),
                    value: stats.inProgress,
                    icon: RefreshCw,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                  },
                  {
                    label: t("taskTracker.completed"),
                    value: stats.completed,
                    icon: CheckCircle2,
                    color: "text-green-400",
                    bg: "bg-green-500/10",
                  },
                  {
                    label: t("taskTracker.failed"),
                    value: stats.failed,
                    icon: AlertTriangle,
                    color: "text-red-400",
                    bg: "bg-red-500/10",
                  },
                  {
                    label: t("taskTracker.archived"),
                    value: stats.archived,
                    icon: Archive,
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${stat.bg} ${stat.color}`}
                      >
                        {stat.label}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("taskTracker.ofActiveTasks", { total: stats.total })}
                    </p>
                  </div>
                ))}
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("taskTracker.searchPlaceholder")}
                    className="pl-9 bg-white/[0.03] border-white/10 focus:border-primary/50"
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status filter chips */}
                  <div className="flex gap-1 bg-card/50 border border-border rounded-xl p-1">
                    {(
                      ["all", "queued", "in_progress", "completed", "failed", "archived"] as const
                    ).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          statusFilter === s
                            ? "gradient-primary text-primary-foreground shadow-glow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {s === "all"
                          ? t("taskTracker.filterAll")
                          : s === "in_progress"
                            ? t("taskTracker.filterActive")
                            : STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                  {/* View toggle */}
                  <div className="flex gap-1 bg-card/50 border border-border rounded-xl p-1">
                    {VIEW_MODES.map((vm) => (
                      <button
                        key={vm.mode}
                        onClick={() => setViewMode(vm.mode)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          viewMode === vm.mode
                            ? "gradient-primary text-primary-foreground shadow-glow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title={vm.label}
                      >
                        <vm.icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Views */}
              {viewMode === "list" && renderListView()}
              {viewMode === "board" && renderBoardView()}
              {viewMode === "calendar" && renderCalendarView()}
              {viewMode === "assigned" && renderAssignedView()}
              {viewMode === "timeline" && renderTimelineView()}
            </>
          )}

          {/* ============================================================= */}
          {/* TEMPLATES TAB                                                  */}
          {/* ============================================================= */}
          {activeTab === "templates" && renderTemplatesTab()}
        </div>
      </main>

      {/* Dialogs */}
      {renderEditDialog()}
      {renderNotificationDialog()}
    </div>
  );
};

export default TaskTracker;
