import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format, isPast, parseISO, isToday, isThisWeek } from "date-fns";
import {
  Bot,
  Activity,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Minimize2,
  DollarSign,
  Fullscreen,
  MonitorPlay,
  LayoutGrid,
  GripVertical,
  Eye,
  Circle,
  CircleDot,
  ArrowRight,
  LayoutList,
  Filter,
  Plus,
  X,
  Pencil,
  Trash2,
  Save,
  User,
  Flag,
  Globe,
  CalendarIcon,
  MessageSquare,
  Send,
  Clock3,
  RefreshCw,
  Bookmark,
  Archive,
  ArchiveRestore,
  BookmarkCheck,
  BarChart2,
  Search,
  Radio,
  ChevronDown,
  ChevronUp,
  Heart,
  Shield,
  Wifi,
  WifiOff,
  Timer,
  TrendingUp,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  ServerCrash,
  Server,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useKanbanTasks, KanbanTask, KanbanColumn, KanbanTaskInput, TaskComment, DateFilter } from "@/hooks/useKanbanTasks";
import { useAuth } from "@/hooks/useAuth";
import { TaskAnalyticsDashboard } from "@/components/command-station/TaskAnalyticsDashboard";

// ── Types ──────────────────────────────────────────────────────────────────
interface AgentMessage {
  id: string;
  from: "commander" | "agent";
  content: string;
  timestamp: string;
}

interface AgentLog {
  id: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
  timestamp: string;
}

interface AgentState {
  id: string;
  name: string;
  model: string;
  zone: "clinical" | "operations" | "external";
  active: boolean;
  currentTask: string;
  tasksCompleted: number;
  tasksFailed: number;
  uptime: string;
  cpu: number;
  memory: number;
  tokensUsed: number;
  costToday: number;
  costMonth: number;
  avgResponseTime: string;
  logs: AgentLog[];
  messages: AgentMessage[];
}

type ViewMode = "board" | "split" | "analytics";

// ── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_AGENTS: AgentState[] = [
  {
    id: "1",
    name: "Dr. Front Desk",
    model: "OpenAI GPT-5",
    zone: "clinical",
    active: true,
    currentTask: "Processing insurance verification for patient #4821",
    tasksCompleted: 847,
    tasksFailed: 12,
    uptime: "6d 14h 32m",
    cpu: 38,
    memory: 54,
    tokensUsed: 412500,
    costToday: 4.13,
    costMonth: 87.4,
    avgResponseTime: "1.4s",
    logs: [
      { id: "l1", level: "success", message: "Appointment confirmed — Maria Gonzalez, 9:00 AM", timestamp: "2m ago" },
      { id: "l2", level: "info", message: "Insurance verification started for patient #4821", timestamp: "4m ago" },
      { id: "l3", level: "warn", message: "Slow response from Availity API (3.2s timeout)", timestamp: "8m ago" },
      { id: "l4", level: "success", message: "Outreach SMS sent to 6 lapsed patients", timestamp: "14m ago" },
      { id: "l5", level: "error", message: "Distress signal flagged — escalated to Dr. Torres", timestamp: "22m ago" },
      { id: "l6", level: "success", message: "Referral letter sent to Cardiology — J. Martinez", timestamp: "35m ago" },
    ],
    messages: [
      { id: "m1", from: "agent", content: "Currently processing insurance verification for patient #4821. Availity API is responding slowly — retry scheduled in 30s.", timestamp: "4m ago" },
    ],
  },
  {
    id: "2",
    name: "Marketing Maven",
    model: "Claude 3.5",
    zone: "external",
    active: true,
    currentTask: "Drafting Q1 campaign copy for cardiovascular awareness month",
    tasksCompleted: 392,
    tasksFailed: 3,
    uptime: "2d 7h 18m",
    cpu: 22,
    memory: 41,
    tokensUsed: 198000,
    costToday: 2.21,
    costMonth: 43.6,
    avgResponseTime: "2.1s",
    logs: [
      { id: "l1", level: "success", message: "Blog post generated: 'Heart Health Month Tips'", timestamp: "5m ago" },
      { id: "l2", level: "info", message: "Analyzing top-performing campaign themes from Q4", timestamp: "12m ago" },
      { id: "l3", level: "warn", message: "Social post flagged for compliance review", timestamp: "28m ago" },
      { id: "l4", level: "success", message: "Email newsletter draft completed — 850 words", timestamp: "41m ago" },
    ],
    messages: [
      { id: "m1", from: "agent", content: "Working on Q1 cardiovascular awareness content. Flagged one social post for compliance review — waiting on approval before scheduling.", timestamp: "12m ago" },
    ],
  },
  {
    id: "3",
    name: "Grant Pro",
    model: "Claude 3.5",
    zone: "operations",
    active: false,
    currentTask: "Idle — last task completed 2h ago",
    tasksCompleted: 124,
    tasksFailed: 8,
    uptime: "0h (inactive)",
    cpu: 0,
    memory: 12,
    tokensUsed: 89200,
    costToday: 0.0,
    costMonth: 21.3,
    avgResponseTime: "3.4s",
    logs: [
      { id: "l1", level: "success", message: "NIH R01 proposal draft completed — $1.2M request", timestamp: "2h ago" },
      { id: "l2", level: "error", message: "NIH grant database API rate limit exceeded", timestamp: "2.5h ago" },
      { id: "l3", level: "info", message: "Research summary: PCORI funding opportunities", timestamp: "3h ago" },
    ],
    messages: [],
  },
  {
    id: "4",
    name: "Compliance Bot",
    model: "GPT-4o",
    zone: "clinical",
    active: true,
    currentTask: "Auditing PHI access logs for Q1 compliance report",
    tasksCompleted: 561,
    tasksFailed: 2,
    uptime: "4d 9h 17m",
    cpu: 45,
    memory: 62,
    tokensUsed: 305800,
    costToday: 3.47,
    costMonth: 72.1,
    avgResponseTime: "1.8s",
    logs: [
      { id: "l1", level: "success", message: "HIPAA audit trail verified — 0 violations detected", timestamp: "1m ago" },
      { id: "l2", level: "info", message: "Scanning PHI access logs for unauthorized entries", timestamp: "6m ago" },
      { id: "l3", level: "warn", message: "Unusual access pattern detected — Dr. Kim accessed 28 records in 5min", timestamp: "18m ago" },
      { id: "l4", level: "success", message: "Monthly compliance checklist auto-generated", timestamp: "32m ago" },
      { id: "l5", level: "info", message: "Updated HIPAA training completion tracker", timestamp: "45m ago" },
    ],
    messages: [
      { id: "m1", from: "agent", content: "Audit in progress. Found unusual access pattern from Dr. Kim — flagged for review. No violations confirmed yet.", timestamp: "6m ago" },
    ],
  },
  {
    id: "5",
    name: "Billing Guru",
    model: "Claude 3.5",
    zone: "operations",
    active: true,
    currentTask: "Reconciling insurance claims batch #2847 (34 claims)",
    tasksCompleted: 1203,
    tasksFailed: 19,
    uptime: "9d 2h 51m",
    cpu: 67,
    memory: 73,
    tokensUsed: 587400,
    costToday: 5.89,
    costMonth: 134.2,
    avgResponseTime: "0.9s",
    logs: [
      { id: "l1", level: "success", message: "Claim #C-9841 approved — $2,340 reimbursement confirmed", timestamp: "30s ago" },
      { id: "l2", level: "error", message: "Claim #C-9838 rejected — missing modifier code 25", timestamp: "3m ago" },
      { id: "l3", level: "info", message: "Processing batch #2847: 34 claims, 12 completed", timestamp: "5m ago" },
      { id: "l4", level: "warn", message: "Payer response delayed — Aetna API latency 4.1s", timestamp: "11m ago" },
      { id: "l5", level: "success", message: "Auto-corrected 3 coding errors in batch #2846", timestamp: "20m ago" },
      { id: "l6", level: "success", message: "Daily revenue report generated — $47,200 collected", timestamp: "1h ago" },
    ],
    messages: [
      { id: "m1", from: "agent", content: "Processing claim batch #2847. One rejection detected on C-9838 — missing modifier. I'll queue it for manual review. Aetna API is slow today.", timestamp: "5m ago" },
    ],
  },
];

// ── Column Configuration ────────────────────────────────────────────────────
const COLUMN_CONFIG: {
  id: KanbanColumn;
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "backlog", label: "Backlog", colorClass: "text-slate-400", bgClass: "bg-slate-400/10", borderClass: "border-slate-400/40", Icon: Circle },
  { id: "todo", label: "To Do", colorClass: "text-blue-400", bgClass: "bg-blue-400/10", borderClass: "border-blue-400/40", Icon: CircleDot },
  { id: "in_progress", label: "In Progress", colorClass: "text-amber-400", bgClass: "bg-amber-400/10", borderClass: "border-amber-400/40", Icon: Clock },
  { id: "review", label: "Review", colorClass: "text-purple-400", bgClass: "bg-purple-400/10", borderClass: "border-purple-400/40", Icon: Eye },
  { id: "done", label: "Done", colorClass: "text-emerald-400", bgClass: "bg-emerald-400/10", borderClass: "border-emerald-400/40", Icon: CheckCircle2 },
];

const COLUMN_ORDER: KanbanColumn[] = ["backlog", "todo", "in_progress", "review", "done"];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const FULLSCREEN_TASKS = [
  { id: "ft1", label: "Insurance verification #4822", progress: 72 },
  { id: "ft2", label: "Appointment reminder batch (14 patients)", progress: 45 },
  { id: "ft3", label: "Lab result notification — J. Chen", progress: 91 },
  { id: "ft4", label: "Referral processing — Cardiology", progress: 18 },
  { id: "ft5", label: "Campaign A/B test analysis", progress: 33 },
  { id: "ft6", label: "Grant deadline compliance check", progress: 55 },
];

const LOG_LEVEL_STYLES = {
  info: "text-blue-400",
  warn: "text-amber-400",
  error: "text-red-400",
  success: "text-emerald-400",
};

const DATE_FILTERS: { id: DateFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "all", label: "All Tasks", icon: LayoutList },
  { id: "overdue", label: "Overdue", icon: AlertTriangle },
  { id: "today", label: "Due Today", icon: Clock3 },
  { id: "this_week", label: "This Week", icon: CalendarIcon },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "recurring", label: "Recurring", icon: RefreshCw },
  { id: "archived", label: "Archived", icon: Archive },
];

// ── CommentInput ─────────────────────────────────────────────────────────────
function CommentInput({ taskId, onAdd }: { taskId: string; onAdd: (taskId: string, content: string) => void }) {
  const [text, setText] = useState("");
  const handleSend = () => {
    if (!text.trim()) return;
    onAdd(taskId, text);
    setText("");
  };
  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        placeholder="Add a comment..."
        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-30"
      >
        <Send className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Component ───────────────────────────────────────────────────────────────
const AgentCommandStation = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [agents, setAgents] = useState<AgentState[]>(MOCK_AGENTS);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [splitScreenIds, setSplitScreenIds] = useState<string[]>(["1", "2"]);
  const [fsTasks, setFsTasks] = useState(FULLSCREEN_TASKS.map((t) => ({ ...t })));
  const [fsTick, setFsTick] = useState(0);

  // DB-backed task state
  const { tasks, loading, createTask, updateTask, deleteTask, moveTask, addComment, touchLastSeen, overdueCount } = useKanbanTasks();

  // Board state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanColumn | null>(null);
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  // Enhanced UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [fleetBarExpanded, setFleetBarExpanded] = useState(true);
  const activityFeedRef = useRef<HTMLDivElement>(null);

  // ── Fleet health metrics (derived) ─────────────────────────────────────
  const fleetHealth = useMemo(() => {
    const activeAgents = agents.filter((a) => a.active);
    const totalAgents = agents.length;
    const avgCpu = activeAgents.length > 0 ? Math.round(activeAgents.reduce((s, a) => s + a.cpu, 0) / activeAgents.length) : 0;
    const avgMemory = activeAgents.length > 0 ? Math.round(activeAgents.reduce((s, a) => s + a.memory, 0) / activeAgents.length) : 0;
    const totalTokens = agents.reduce((s, a) => s + a.tokensUsed, 0);
    const totalCostToday = agents.reduce((s, a) => s + a.costToday, 0);
    const totalCostMonth = agents.reduce((s, a) => s + a.costMonth, 0);
    const totalCompleted = agents.reduce((s, a) => s + a.tasksCompleted, 0);
    const totalFailed = agents.reduce((s, a) => s + a.tasksFailed, 0);
    const avgSuccessRate = totalCompleted + totalFailed > 0 ? Math.round((totalCompleted / (totalCompleted + totalFailed)) * 100) : 100;
    const hasErrors = agents.some((a) => a.logs.some((l) => l.level === "error"));
    const hasWarnings = agents.some((a) => a.logs.some((l) => l.level === "warn"));

    let status: "healthy" | "warning" | "critical" = "healthy";
    if (activeAgents.length === 0 || avgCpu > 85 || avgMemory > 90 || avgSuccessRate < 80) status = "critical";
    else if (hasErrors || avgCpu > 70 || avgMemory > 75 || avgSuccessRate < 90 || hasWarnings) status = "warning";

    return { activeAgents: activeAgents.length, totalAgents, avgCpu, avgMemory, totalTokens, totalCostToday, totalCostMonth, totalCompleted, totalFailed, avgSuccessRate, status };
  }, [agents]);

  // ── Combined activity feed ─────────────────────────────────────────────
  const activityFeed = useMemo(() => {
    const allLogs = agents.flatMap((a) =>
      a.logs.map((log) => ({ ...log, agentName: a.name, agentZone: a.zone, agentId: a.id }))
    );
    return allLogs;
  }, [agents]);

  // Task modal state — uses a local draft separate from DB
  const [taskModal, setTaskModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    draft: Partial<KanbanTask>;
    targetColumn?: KanbanColumn;
  }>({ open: false, mode: "add", draft: {} });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // ── Drag-and-drop ──────────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, column: KanbanColumn) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(column);
  }, []);

  const handleDragLeave = useCallback(() => { setDragOverColumn(null); }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetColumn: KanbanColumn) => {
    e.preventDefault();
    if (draggedTaskId) moveTask(draggedTaskId, targetColumn);
    setDraggedTaskId(null);
    setDragOverColumn(null);
  }, [draggedTaskId, moveTask]);

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  }, []);

  const moveTaskForward = useCallback((task: KanbanTask) => {
    const idx = COLUMN_ORDER.indexOf(task.column_id);
    if (idx < COLUMN_ORDER.length - 1) moveTask(task.id, COLUMN_ORDER[idx + 1]);
  }, [moveTask]);

  // ── Modal helpers ────────────────────────────────────────────────────────
  const openAddModal = useCallback((column: KanbanColumn = "backlog") => {
    setTaskModal({ open: true, mode: "add", draft: { column_id: column, priority: "medium", zone: "clinical", agent_id: "1", is_recurring: false, is_saved: false, is_archived: false }, targetColumn: column });
  }, []);

  const openEditModal = useCallback((task: KanbanTask) => {
    touchLastSeen(task.id);
    setTaskModal({ open: true, mode: "edit", draft: { ...task } });
  }, [touchLastSeen]);

  const closeModal = useCallback(() => {
    setTaskModal({ open: false, mode: "add", draft: {} });
  }, []);

  const updateDraft = useCallback((field: string, value: unknown) => {
    setTaskModal((prev) => ({ ...prev, draft: { ...prev.draft, [field]: value } }));
  }, []);

  const saveTask = useCallback(async () => {
    const { mode, draft } = taskModal;
    if (!draft.title?.trim()) return;
    if (mode === "add") {
      await createTask(draft as Partial<KanbanTaskInput>);
    } else {
      const { id, comments, user_id, created_at, updated_at, ...changes } = draft as KanbanTask;
      await updateTask(id, changes as Partial<KanbanTaskInput>);
    }
    closeModal();
  }, [taskModal, createTask, updateTask, closeModal]);

  const handleDeleteTask = useCallback(async (id: string) => {
    await deleteTask(id);
    setDeleteConfirm(null);
  }, [deleteTask]);

  const handleAddComment = useCallback(async (taskId: string, content: string) => {
    const profileName = user?.email?.split("@")[0] ?? "You";
    await addComment(taskId, content, profileName);
    // Refresh modal draft comments
    setTaskModal((prev) => {
      if (!prev.draft || prev.draft.id !== taskId) return prev;
      const existing = (prev.draft.comments as TaskComment[]) ?? [];
      const newC: TaskComment = {
        id: `tmp-${Date.now()}`,
        task_id: taskId,
        author: profileName,
        content,
        avatar_color: "bg-cyan-500/20 text-cyan-400",
        created_at: new Date().toISOString(),
      };
      return { ...prev, draft: { ...prev.draft, comments: [...existing, newC] } };
    });
  }, [addComment, user]);

  // ── Fullscreen auto-refresh ──────────────────────────────────────────────
  useEffect(() => {
    if (!fullscreenMode) return;
    const interval = setInterval(() => {
      setFsTick((t) => t + 1);
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          cpu: a.active ? clamp(a.cpu + Math.floor(Math.random() * 13) - 6, 5, 95) : 0,
          memory: a.active ? clamp(a.memory + Math.floor(Math.random() * 9) - 4, 10, 92) : a.memory,
          tokensUsed: a.active ? a.tokensUsed + Math.floor(Math.random() * 800) + 100 : a.tokensUsed,
          costToday: a.active ? Math.round((a.costToday + Math.random() * 0.08) * 100) / 100 : a.costToday,
          tasksCompleted: a.active && Math.random() > 0.7 ? a.tasksCompleted + 1 : a.tasksCompleted,
        }))
      );
      setFsTasks((prev) =>
        prev.map((t) => {
          let next = t.progress + Math.floor(Math.random() * 12) + 1;
          if (next >= 100) next = Math.floor(Math.random() * 25) + 5;
          return { ...t, progress: next };
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [fullscreenMode]);

  useEffect(() => {
    if (!fullscreenMode) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreenMode(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreenMode]);

  useEffect(() => {
    if (fullscreenMode) return;
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          cpu: a.active ? clamp(a.cpu + Math.floor(Math.random() * 7) - 3, 5, 95) : 0,
          memory: a.active ? clamp(a.memory + Math.floor(Math.random() * 5) - 2, 10, 92) : a.memory,
          tokensUsed: a.active ? a.tokensUsed + Math.floor(Math.random() * 200) : a.tokensUsed,
        }))
      );
    }, 8000);
    return () => clearInterval(interval);
  }, [fullscreenMode]);

  const getSuccessRate = (a: AgentState) =>
    a.tasksCompleted + a.tasksFailed > 0
      ? Math.round((a.tasksCompleted / (a.tasksCompleted + a.tasksFailed)) * 100)
      : 0;

  // ── Filter logic ────────────────────────────────────────────────────────
  const getFilteredTasks = useCallback(() => {
    let result = tasks;

    // Agent filter
    if (agentFilter !== "all") result = result.filter((t) => t.agent_id === agentFilter);

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Date / type filter
    if (dateFilter === "overdue") {
      result = result.filter((t) => !t.is_archived && t.column_id !== "done" && t.due_date && isPast(parseISO(t.due_date)));
    } else if (dateFilter === "today") {
      result = result.filter((t) => t.due_date && isToday(parseISO(t.due_date)));
    } else if (dateFilter === "this_week") {
      result = result.filter((t) => t.due_date && isThisWeek(parseISO(t.due_date)));
    } else if (dateFilter === "saved") {
      result = result.filter((t) => t.is_saved);
    } else if (dateFilter === "recurring") {
      result = result.filter((t) => t.is_recurring);
    } else if (dateFilter === "archived") {
      result = result.filter((t) => t.is_archived);
    } else {
      // "all" — hide archived unless explicitly selected
      result = result.filter((t) => !t.is_archived);
    }

    return result;
  }, [tasks, agentFilter, dateFilter, searchQuery]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ── FULLSCREEN MODE ─────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (fullscreenMode) {
    const totalTokens = agents.reduce((s, a) => s + a.tokensUsed, 0);
    const totalCost = agents.reduce((s, a) => s + a.costToday, 0);
    const totalTasks = agents.reduce((s, a) => s + a.tasksCompleted, 0);

    return (
      <div className="fixed inset-0 z-[9999] bg-black text-green-400 font-mono overflow-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 border-b border-green-900/60 bg-black/95 shrink-0">
          <div className="flex items-center gap-4">
            <MonitorPlay className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-bold tracking-widest text-cyan-400 uppercase">{t("commandStation.agentScreen")}</span>
            <span className="text-xs text-green-600 animate-pulse">{t("commandStation.live")}</span>
            <span className="text-xs text-green-700">Tick #{fsTick}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-amber-400 tabular-nums">{totalTokens.toLocaleString()} tokens</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <DollarSign className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-amber-400 tabular-nums">${totalCost.toFixed(2)} today</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 tabular-nums">{totalTasks.toLocaleString()} tasks done</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setFullscreenMode(false)} className="border-green-800 text-green-400 bg-transparent hover:bg-green-950 hover:text-green-300 text-xs gap-1">
              <Minimize2 className="h-3.5 w-3.5" />
              {t("commandStation.exitEsc")}
            </Button>
          </div>
        </div>

        {/* Fleet summary bar */}
        <div className="shrink-0 flex items-center gap-6 px-6 py-2 border-b border-green-900/40 bg-green-950/30">
          <div className="flex items-center gap-2 text-[10px]">
            <Server className="h-3 w-3 text-green-600" />
            <span className="text-green-600">Fleet:</span>
            <span className="text-green-400 font-bold">{agents.filter((a) => a.active).length}/{agents.length}</span>
            <span className="text-green-700">active</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <Cpu className="h-3 w-3 text-green-600" />
            <span className="text-green-600">Avg CPU:</span>
            <span className={`font-bold tabular-nums ${fleetHealth.avgCpu > 70 ? "text-red-400" : fleetHealth.avgCpu > 50 ? "text-amber-400" : "text-green-400"}`}>{fleetHealth.avgCpu}%</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <Activity className="h-3 w-3 text-green-600" />
            <span className="text-green-600">Avg MEM:</span>
            <span className={`font-bold tabular-nums ${fleetHealth.avgMemory > 75 ? "text-red-400" : fleetHealth.avgMemory > 50 ? "text-amber-400" : "text-cyan-400"}`}>{fleetHealth.avgMemory}%</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-green-600">Success:</span>
            <span className={`font-bold tabular-nums ${fleetHealth.avgSuccessRate >= 95 ? "text-green-400" : fleetHealth.avgSuccessRate >= 80 ? "text-amber-400" : "text-red-400"}`}>{fleetHealth.avgSuccessRate}%</span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[10px]">
            <DollarSign className="h-3 w-3 text-green-600" />
            <span className="text-green-600">Month:</span>
            <span className="text-amber-400 font-bold tabular-nums">${fleetHealth.totalCostMonth.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 overflow-auto">
          {agents.map((ag) => {
            const sr = getSuccessRate(ag);
            const agTasks = fsTasks.slice(0, ag.active ? 3 : 1);
            return (
              <div key={ag.id} className="border border-green-900/40 p-4 flex flex-col gap-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      {ag.active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${ag.active ? "bg-green-500" : "bg-gray-600"}`} />
                    </span>
                    <span className="text-sm font-bold text-cyan-400">{ag.name}</span>
                    <span className="text-[10px] text-green-700">{ag.model}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${ag.active ? "border-green-700 text-green-400 bg-green-950/50" : "border-gray-700 text-gray-500 bg-gray-900/50"}`}>
                    {ag.active ? t("commandStation.online") : t("commandStation.offline")}
                  </span>
                </div>

                <p className="text-xs text-green-500/80 leading-relaxed">&gt; {ag.currentTask}</p>

                <div className="grid grid-cols-2 gap-3">
                  {[{ label: "CPU", value: ag.cpu, icon: Cpu }, { label: "MEM", value: ag.memory, icon: Activity }].map(({ label, value, icon: Icon }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-green-700 flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</span>
                        <span className="text-[10px] text-green-400 tabular-nums">{value}%</span>
                      </div>
                      <div className="h-2 rounded bg-green-950 overflow-hidden">
                        <div className={`h-full rounded transition-all duration-1000 ease-in-out ${value > 75 ? "bg-red-500" : value > 50 ? "bg-amber-500" : label === "CPU" ? "bg-green-500" : "bg-cyan-500"}`} style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Tasks", value: ag.tasksCompleted.toLocaleString(), color: "text-green-400" },
                    { label: "Failed", value: String(ag.tasksFailed), color: ag.tasksFailed > 5 ? "text-red-400" : "text-green-400" },
                    { label: "Rate", value: `${sr}%`, color: sr >= 95 ? "text-green-400" : sr >= 80 ? "text-amber-400" : "text-red-400" },
                    { label: "Cost", value: `$${ag.costToday.toFixed(2)}`, color: "text-amber-400" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className={`text-xs font-bold tabular-nums ${s.color}`}>{s.value}</p>
                      <p className="text-[9px] text-green-800">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] border-t border-green-900/40 pt-2">
                  <span className="text-green-700 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span className="text-green-400 tabular-nums transition-all duration-700">{ag.tokensUsed.toLocaleString()}</span> tokens
                  </span>
                  <span className="text-green-700">Uptime: <span className="text-green-400">{ag.uptime}</span></span>
                </div>

                {ag.active && (
                  <div className="space-y-1.5 border-t border-green-900/40 pt-2">
                    <p className="text-[10px] text-green-700 uppercase tracking-wider">{t("commandStation.taskQueue")}</p>
                    {agTasks.map((tk, i) => (
                      <div key={tk.id + ag.id + i} className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-green-600 truncate max-w-[70%]">{tk.label}</span>
                          <span className="text-[10px] text-green-400 tabular-nums">{tk.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded bg-green-950 overflow-hidden">
                          <div className="h-full rounded bg-gradient-to-r from-green-600 to-cyan-500 transition-all duration-1000 ease-in-out" style={{ width: `${tk.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1 border-t border-green-900/40 pt-2 max-h-[100px] overflow-y-auto">
                  <p className="text-[10px] text-green-700 uppercase tracking-wider">{t("commandStation.recentActivity")}</p>
                  {ag.logs.slice(0, 3).map((log) => (
                    <p key={log.id} className={`text-[10px] leading-snug ${log.level === "error" ? "text-red-400" : log.level === "warn" ? "text-amber-400" : log.level === "success" ? "text-green-500" : "text-green-600"}`}>
                      {log.level === "error" ? "ERR" : log.level === "warn" ? "WRN" : log.level === "success" ? "OK " : "INF"} {log.message}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="shrink-0 flex items-center justify-between px-6 py-2 border-t border-green-900/60 bg-black/95 text-[10px] text-green-700">
          <span>{t("commandStation.autoRefresh")}</span>
          <span className="text-green-600">{new Date().toLocaleTimeString()} | {agents.filter((a) => a.active).length}/{agents.length} {t("commandStation.agentsOnline")}</span>
        </div>
      </div>
    );
  }

  // ── SPLIT VIEW ──────────────────────────────────────────────────────────
  const renderSplitScreen = () => {
    const screenAgents = splitScreenIds.map((id) => agents.find((a) => a.id === id)).filter(Boolean) as AgentState[];
    const gridCols = screenAgents.length <= 2 ? "md:grid-cols-2" : screenAgents.length <= 4 ? "md:grid-cols-2 xl:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3";
    return (
      <div className={`flex-1 grid grid-cols-1 ${gridCols} gap-0 overflow-hidden`}>
        {screenAgents.map((agent) => {
          const sr = getSuccessRate(agent);
          return (
            <div key={agent.id} className="flex flex-col border-r border-b border-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/60 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    {agent.active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${agent.active ? "bg-emerald-500" : "bg-gray-600"}`} />
                  </span>
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{agent.name}</span>
                  <Badge variant="outline" className={`text-[10px] ${agent.zone === "clinical" ? "text-red-400 bg-red-500/10 border-red-500/30" : agent.zone === "operations" ? "text-amber-400 bg-amber-500/10 border-amber-500/30" : "text-blue-400 bg-blue-500/10 border-blue-500/30"}`}>
                    {agent.zone}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{agent.model}</span>
                  <button
                    onClick={() => setSplitScreenIds((prev) => prev.filter((id) => id !== agent.id))}
                    className="p-1 rounded hover:bg-white/10 text-muted-foreground/40 hover:text-red-400 transition-colors"
                    title="Remove from split view"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Resource bars */}
              <div className="flex items-center gap-3 px-4 py-2 bg-card/30 border-b border-border/50 shrink-0">
                <div className="flex-1 flex items-center gap-2">
                  <Cpu className="h-3 w-3 text-muted-foreground/50" />
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${agent.cpu > 75 ? "bg-red-500" : agent.cpu > 50 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${agent.cpu}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">{agent.cpu}%</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <Activity className="h-3 w-3 text-muted-foreground/50" />
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${agent.memory > 75 ? "bg-red-500" : agent.memory > 50 ? "bg-amber-500" : "bg-cyan-500"}`} style={{ width: `${agent.memory}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">{agent.memory}%</span>
                </div>
                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${sr >= 95 ? "text-emerald-400 border-emerald-500/30" : sr >= 80 ? "text-amber-400 border-amber-500/30" : "text-red-400 border-red-500/30"}`}>
                  {sr}%
                </Badge>
              </div>

              <div className="flex-1 bg-black/90 overflow-y-auto p-4 font-mono text-xs space-y-1.5 min-h-0">
                <p className="text-white/30">--- {agent.name} --- {agent.model} --- {new Date().toLocaleTimeString()} ---</p>
                {agent.active ? (
                  <>
                    <p className="text-emerald-400">&gt; {agent.currentTask}</p>
                    <p className="text-white/50"> CPU: {agent.cpu}% | Memory: {agent.memory}% | Tokens: {agent.tokensUsed.toLocaleString()}</p>
                    <p className="text-cyan-400"> Success Rate: {sr}% | Cost: ${agent.costToday.toFixed(2)} | Uptime: {agent.uptime}</p>
                    <p className="text-white/30 mt-2">-- Recent Activity --</p>
                    {agent.logs.map((log) => (
                      <p key={log.id} className={`${LOG_LEVEL_STYLES[log.level]} leading-snug`}>[{log.level.toUpperCase()}] {log.message} <span className="text-white/20">({log.timestamp})</span></p>
                    ))}
                    <p className="text-white/20 animate-pulse mt-3">_</p>
                  </>
                ) : (
                  <>
                    <p className="text-white/40">Agent is offline --- last active 2h ago</p>
                    <p className="text-white/30">Context preserved. Tasks queued: 0</p>
                  </>
                )}
              </div>
              <div className="flex items-center justify-between px-4 py-2 bg-card/40 border-t border-border text-[10px] text-muted-foreground shrink-0">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400" />{agent.tasksCompleted} done</span>
                <span className="flex items-center gap-2"><AlertTriangle className="h-3 w-3 text-red-400/60" />{agent.tasksFailed} failed</span>
                <span className="flex items-center gap-2"><Zap className="h-3 w-3 text-amber-400" />{(agent.tokensUsed / 1000).toFixed(1)}k tokens</span>
                <span className="flex items-center gap-2"><DollarSign className="h-3 w-3 text-amber-400" />${agent.costToday.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
        {splitScreenIds.length < agents.length && (
          <div className="flex flex-col items-center justify-center border-r border-b border-border bg-card/20 min-h-[300px]">
            <Bot className="h-8 w-8 text-muted-foreground/15 mb-3" />
            <p className="text-sm text-muted-foreground mb-3">Add agent screen</p>
            <div className="flex gap-2 flex-wrap justify-center px-4">
              {agents.filter((a) => !splitScreenIds.includes(a.id)).map((a) => (
                <button key={a.id} onClick={() => setSplitScreenIds((prev) => [...prev, a.id])} className={`flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:border-primary/40 transition-colors text-sm ${a.active ? "border-border" : "border-border/50 opacity-60"}`}>
                  <span className="relative flex h-2 w-2">
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${a.active ? "bg-emerald-500" : "bg-gray-600"}`} />
                  </span>
                  <Bot className="h-3.5 w-3.5 text-primary" />
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── TASK MODAL ────────────────────────────────────────────────────────────
  const renderTaskModal = () => {
    if (!taskModal.open) return null;
    const isEdit = taskModal.mode === "edit";
    const draft = taskModal.draft;
    const draftComments = (draft.comments as TaskComment[]) ?? [];
    const selectedDate = draft.due_date ? parseISO(draft.due_date) : undefined;

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
        <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-[hsl(220,20%,7%)] shadow-[0_0_60px_-10px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gradient-to-r from-cyan-500/10 to-blue-500/5 shrink-0">
            <div className="flex items-center gap-2">
              {isEdit ? <Pencil className="h-4 w-4 text-cyan-400" /> : <Plus className="h-4 w-4 text-cyan-400" />}
              <span className="text-sm font-semibold text-cyan-400">{isEdit ? "Edit Task" : "Add Task"}</span>
            </div>
            <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            <div className="p-6 space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 flex items-center gap-1.5"><Pencil className="h-3 w-3" /> Title</label>
                <input ref={titleRef} autoFocus value={draft.title ?? ""} onChange={(e) => updateDraft("title", e.target.value)} placeholder="Task title..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40" />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Description</label>
                <textarea value={draft.description ?? ""} onChange={(e) => updateDraft("description", e.target.value)} placeholder="What needs to be done..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 resize-none" />
              </div>

              {/* Agent + Column */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50 flex items-center gap-1.5"><User className="h-3 w-3" /> Assigned Agent</label>
                  <select value={draft.agent_id ?? "1"} onChange={(e) => updateDraft("agent_id", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/40">
                    {MOCK_AGENTS.map((a) => <option key={a.id} value={a.id} className="bg-[hsl(220,20%,10%)]">{a.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50">Column</label>
                  <select value={draft.column_id ?? "backlog"} onChange={(e) => updateDraft("column_id", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/40">
                    {COLUMN_CONFIG.map((c) => <option key={c.id} value={c.id} className="bg-[hsl(220,20%,10%)]">{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Priority + Zone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50 flex items-center gap-1.5"><Flag className="h-3 w-3" /> Priority</label>
                  <select value={draft.priority ?? "medium"} onChange={(e) => updateDraft("priority", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/40">
                    <option value="high" className="bg-[hsl(220,20%,10%)]">High</option>
                    <option value="medium" className="bg-[hsl(220,20%,10%)]">Medium</option>
                    <option value="low" className="bg-[hsl(220,20%,10%)]">Low</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50 flex items-center gap-1.5"><Globe className="h-3 w-3" /> Zone</label>
                  <select value={draft.zone ?? "clinical"} onChange={(e) => updateDraft("zone", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/40">
                    <option value="clinical" className="bg-[hsl(220,20%,10%)]">Clinical</option>
                    <option value="operations" className="bg-[hsl(220,20%,10%)]">Operations</option>
                    <option value="external" className="bg-[hsl(220,20%,10%)]">External</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 flex items-center gap-1.5"><Clock3 className="h-3 w-3" /> Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn("w-full flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-left transition-colors hover:border-cyan-500/30 focus:outline-none", selectedDate ? "text-white" : "text-white/30")}>
                      <CalendarIcon className="h-3.5 w-3.5 text-white/30" />
                      {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Pick a due date..."}
                      {selectedDate && (
                        <button onClick={(e) => { e.stopPropagation(); updateDraft("due_date", null); }} className="ml-auto p-0.5 rounded hover:bg-white/10 text-white/30 hover:text-white/60">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[hsl(220,20%,9%)] border-cyan-500/20 z-[10000]" align="start">
                    <Calendar mode="single" selected={selectedDate} onSelect={(d) => updateDraft("due_date", d ? format(d, "yyyy-MM-dd") : null)} initialFocus className={cn("p-3 pointer-events-auto text-white")} />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Toggles: Recurring, Saved, Archived */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "is_recurring", label: "Recurring", icon: RefreshCw, activeColor: "border-purple-500/40 bg-purple-500/10 text-purple-400" },
                  { key: "is_saved", label: "Saved", icon: Bookmark, activeColor: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
                  { key: "is_archived", label: "Archived", icon: Archive, activeColor: "border-slate-500/40 bg-slate-500/10 text-slate-400" },
                ].map(({ key, label, icon: Icon, activeColor }) => {
                  const active = !!(draft as Record<string, unknown>)[key];
                  return (
                    <button
                      key={key}
                      onClick={() => updateDraft(key, !active)}
                      className={cn("flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all text-xs font-medium", active ? activeColor : "border-white/10 bg-white/5 text-white/30 hover:border-white/20 hover:text-white/50")}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Recurrence pattern (shown when recurring) */}
              {draft.is_recurring && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/50 flex items-center gap-1.5"><RefreshCw className="h-3 w-3" /> Recurrence Pattern</label>
                  <select value={draft.recurrence_pattern ?? "weekly"} onChange={(e) => updateDraft("recurrence_pattern", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/40">
                    <option value="daily" className="bg-[hsl(220,20%,10%)]">Daily</option>
                    <option value="weekly" className="bg-[hsl(220,20%,10%)]">Weekly</option>
                    <option value="monthly" className="bg-[hsl(220,20%,10%)]">Monthly</option>
                  </select>
                </div>
              )}

              {/* Activity / Comments (edit mode) */}
              {isEdit && (
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-cyan-400/70" />
                    <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Activity ({draftComments.length})</span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {draftComments.length === 0 && (
                      <p className="text-[11px] text-white/20 text-center py-4">No comments yet. Start the conversation.</p>
                    )}
                    {draftComments.map((c) => (
                      <div key={c.id} className="flex gap-2.5">
                        <div className={`h-6 w-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold ${c.avatar_color}`}>
                          {c.author.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-semibold text-white/70">{c.author}</span>
                            <span className="text-[9px] text-white/25">{format(new Date(c.created_at), "MMM d, h:mm a")}</span>
                          </div>
                          <p className="text-xs text-white/55 leading-relaxed bg-white/[0.03] rounded-lg px-2.5 py-1.5 border border-white/5">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <CommentInput taskId={draft.id!} onAdd={handleAddComment} />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 shrink-0">
            {isEdit ? (
              <button onClick={() => { setDeleteConfirm(draft.id!); closeModal(); }} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs transition-colors">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            ) : <div />}
            <div className="flex items-center gap-2">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={saveTask} disabled={!draft.title?.trim()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 text-sm font-medium transition-colors disabled:opacity-40">
                <Save className="h-3.5 w-3.5" />
                {isEdit ? "Save Changes" : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Delete confirm ─────────────────────────────────────────────────────────
  const renderDeleteConfirm = () => {
    if (!deleteConfirm) return null;
    const task = tasks.find((t) => t.id === deleteConfirm);
    if (!task) return null;
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
        <div className="relative w-full max-w-sm rounded-2xl border border-red-500/30 bg-[hsl(220,20%,7%)] p-6 shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><Trash2 className="h-5 w-5 text-red-400" /></div>
            <div>
              <p className="text-sm font-semibold text-white">Delete Task?</p>
              <p className="text-xs text-white/40 mt-0.5">This cannot be undone</p>
            </div>
          </div>
          <p className="text-xs text-white/60 mb-5 bg-white/5 rounded-lg px-3 py-2 border border-white/5 line-clamp-2">"{task.title}"</p>
          <div className="flex gap-2">
            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-white/10 transition-colors">Cancel</button>
            <button onClick={() => handleDeleteTask(deleteConfirm)} className="flex-1 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-colors">Delete</button>
          </div>
        </div>
      </div>
    );
  };

  // ── TASK BOARD ─────────────────────────────────────────────────────────────
  const renderTaskBoard = () => {
    const filteredTasks = getFilteredTasks();
    const getAgentById = (agentId: string) => MOCK_AGENTS.find((a) => a.id === agentId);
    const getColumnTasks = (column: KanbanColumn) => filteredTasks.filter((t) => t.column_id === column);
    const totalFiltered = filteredTasks.length;

    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Toolbar */}
        <div className="flex flex-col gap-0 border-b border-border/50 bg-card/30 shrink-0">
          {/* Top row */}
          <div className="flex items-center gap-3 px-6 py-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground/50" />
              <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50">
                <option value="all">All Agents</option>
                {MOCK_AGENTS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {/* Search input */}
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 w-48"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2 p-0.5 rounded hover:bg-white/10 text-muted-foreground/40 hover:text-foreground transition-colors">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 text-[11px] text-muted-foreground/60 ml-2">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400" />{totalFiltered} total</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />{getColumnTasks("in_progress").length} in progress</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-purple-400" />{getColumnTasks("review").length} in review</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />{getColumnTasks("done").length} done</span>
              {overdueCount > 0 && <span className="flex items-center gap-1.5 text-red-400 animate-pulse"><AlertTriangle className="h-3 w-3" />{overdueCount} overdue</span>}
            </div>
            <button onClick={() => openAddModal("backlog")} className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 text-xs font-medium transition-colors">
              <Plus className="h-3.5 w-3.5" /> Add Task
            </button>
          </div>

          {/* Date filter chips */}
          <div className="flex items-center gap-2 px-6 pb-3 overflow-x-auto">
            {DATE_FILTERS.map((df) => {
              const Icon = df.icon;
              const active = dateFilter === df.id;
              const isOverdue = df.id === "overdue";
              return (
                <button
                  key={df.id}
                  onClick={() => setDateFilter(df.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all whitespace-nowrap shrink-0",
                    active
                      ? isOverdue
                        ? "bg-red-500/20 border-red-500/40 text-red-400"
                        : "bg-primary/15 border-primary/30 text-primary"
                      : "bg-card/50 border-border/40 text-muted-foreground hover:border-border/70 hover:text-foreground"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {df.label}
                  {df.id === "overdue" && overdueCount > 0 && (
                    <span className="ml-1 bg-red-500/30 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{overdueCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading tasks...
          </div>
        ) : (
          <div className="flex-1 flex gap-4 p-6 overflow-x-auto min-h-0">
            {COLUMN_CONFIG.map((col) => {
              const ColIcon = col.Icon;
              const columnTasks = getColumnTasks(col.id);
              const isDragOver = dragOverColumn === col.id;

              return (
                <div
                  key={col.id}
                  className={`flex flex-col w-72 shrink-0 rounded-2xl border transition-all duration-200 ${isDragOver ? `${col.borderClass} bg-card/60 scale-[1.01]` : "border-border/40 bg-card/30"}`}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className={`flex items-center justify-between px-4 py-3 border-b border-border/30 ${col.bgClass} rounded-t-2xl`}>
                    <div className="flex items-center gap-2">
                      <ColIcon className={`h-4 w-4 ${col.colorClass}`} />
                      <span className={`text-xs font-semibold ${col.colorClass}`}>{col.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${col.bgClass} ${col.colorClass} border ${col.borderClass} font-medium`}>{columnTasks.length}</span>
                    </div>
                    <button onClick={() => openAddModal(col.id)} className={`p-1 rounded-md hover:bg-white/10 ${col.colorClass} opacity-50 hover:opacity-100 transition-all`} title={`Add task to ${col.label}`}>
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {columnTasks.length === 0 && (
                      <button onClick={() => openAddModal(col.id)} className="w-full flex flex-col items-center justify-center py-8 text-center border border-dashed border-border/30 rounded-xl hover:border-border/60 hover:bg-white/3 transition-colors group">
                        <Plus className="h-5 w-5 text-muted-foreground/20 mb-1 group-hover:text-muted-foreground/50 transition-colors" />
                        <p className="text-[10px] text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors">Add a task</p>
                      </button>
                    )}
                    {columnTasks.map((task) => {
                      const agent = getAgentById(task.agent_id);
                      const canMoveForward = COLUMN_ORDER.indexOf(task.column_id) < COLUMN_ORDER.length - 1;
                      const isOverdue = task.due_date && task.column_id !== "done" && isPast(parseISO(task.due_date));
                      const isNew = !task.last_seen_at;

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                          className={`group relative rounded-xl border bg-card/50 p-3 cursor-grab active:cursor-grabbing transition-all duration-150 hover:bg-card/80 hover:shadow-md ${draggedTaskId === task.id ? "opacity-40 scale-95" : "opacity-100"} ${
                            isOverdue
                              ? "border-red-500/40 hover:border-red-500/60 shadow-[0_0_12px_-4px_rgba(239,68,68,0.3)]"
                              : task.priority === "high"
                              ? "border-red-500/20 hover:border-border/70"
                              : task.priority === "medium"
                              ? "border-border/40 hover:border-border/70"
                              : "border-border/20 hover:border-border/70"
                          }`}
                        >
                          {/* New dot indicator */}
                          {isNew && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />}

                          <div className="flex items-start gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground/20 mt-0.5 shrink-0 group-hover:text-muted-foreground/50 transition-colors" />
                            <p className="text-sm font-medium text-foreground leading-snug flex-1">{task.title}</p>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button onClick={(e) => { e.stopPropagation(); openEditModal(task); }} className="p-1 rounded hover:bg-white/10 text-muted-foreground/40 hover:text-cyan-400 transition-colors" title="Edit task"><Pencil className="h-3 w-3" /></button>
                              <button onClick={(e) => { e.stopPropagation(); updateTask(task.id, { is_saved: !task.is_saved }); }} className={`p-1 rounded hover:bg-white/10 transition-colors ${task.is_saved ? "text-amber-400" : "text-muted-foreground/40 hover:text-amber-400"}`} title={task.is_saved ? "Unsave" : "Save"}>
                                {task.is_saved ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); updateTask(task.id, { is_archived: !task.is_archived }); }} className={`p-1 rounded hover:bg-white/10 transition-colors ${task.is_archived ? "text-slate-400" : "text-muted-foreground/40 hover:text-slate-400"}`} title={task.is_archived ? "Unarchive" : "Archive"}>
                                {task.is_archived ? <ArchiveRestore className="h-3 w-3" /> : <Archive className="h-3 w-3" />}
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(task.id); }} className="p-1 rounded hover:bg-white/10 text-muted-foreground/40 hover:text-red-400 transition-colors" title="Delete task"><Trash2 className="h-3 w-3" /></button>
                              {canMoveForward && <button onClick={(e) => { e.stopPropagation(); moveTaskForward(task); }} className="p-1 rounded hover:bg-white/10 text-muted-foreground/40 hover:text-emerald-400 transition-colors" title="Move to next stage"><ArrowRight className="h-3 w-3" /></button>}
                            </div>
                          </div>

                          {task.description && <p className="text-[11px] text-muted-foreground/50 leading-relaxed mt-2 ml-6 line-clamp-2">{task.description}</p>}

                          <div className="flex items-center gap-2 mt-3 ml-6 flex-wrap">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${task.priority === "high" ? "text-red-400 bg-red-500/10 border-red-500/20" : task.priority === "medium" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-slate-400 bg-slate-500/10 border-slate-500/20"}`}>{task.priority}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${task.zone === "clinical" ? "text-red-300/70 bg-red-500/5 border-red-500/15" : task.zone === "operations" ? "text-amber-300/70 bg-amber-500/5 border-amber-500/15" : "text-blue-300/70 bg-blue-500/5 border-blue-500/15"}`}>{task.zone}</span>
                            {task.is_recurring && <span className="flex items-center gap-0.5 text-[10px] text-purple-400/70"><RefreshCw className="h-2.5 w-2.5" />{task.recurrence_pattern}</span>}
                            {task.is_saved && <Bookmark className="h-3 w-3 text-amber-400/70" />}
                            {task.comments.length > 0 && <div className="flex items-center gap-1 text-[10px] text-muted-foreground/40"><MessageSquare className="h-2.5 w-2.5" />{task.comments.length}</div>}
                            {agent && (
                              <div className="ml-auto flex items-center gap-1">
                                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold ${agent.zone === "clinical" ? "bg-red-500/20 text-red-400" : agent.zone === "operations" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}>
                                  {agent.name.charAt(0)}
                                </div>
                                <span className="text-[10px] text-muted-foreground/40">{agent.name.split(" ")[0]}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2 ml-6">
                            <div className="flex items-center gap-2">
                              <p className="text-[9px] text-muted-foreground/25">{format(new Date(task.created_at), "MMM d")}</p>
                              {task.last_seen_at && <p className="text-[9px] text-muted-foreground/20">· seen {format(new Date(task.last_seen_at), "h:mm a")}</p>}
                            </div>
                            {task.due_date && (() => {
                              const due = parseISO(task.due_date);
                              const overdue = task.column_id !== "done" && isPast(due);
                              return (
                                <div className={cn("flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border", overdue ? "text-red-400 bg-red-500/15 border-red-500/30 animate-pulse" : isToday(due) ? "text-amber-400 bg-amber-500/15 border-amber-500/30" : "text-white/30 bg-white/5 border-white/10")}>
                                  <Clock3 className="h-2.5 w-2.5" />
                                  {overdue ? "Overdue · " : isToday(due) ? "Today · " : ""}{format(due, "MMM d")}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-3 pb-3 pt-1">
                    <button onClick={() => openAddModal(col.id)} className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed ${col.borderClass} ${col.colorClass} opacity-30 hover:opacity-70 transition-opacity text-xs`}>
                      <Plus className="h-3.5 w-3.5" /> Add to {col.label}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── ACTIVITY FEED PANEL ────────────────────────────────────────────────────
  const renderActivityFeed = () => {
    if (!showActivityFeed) return null;
    return (
      <div className="w-80 border-l border-border bg-card/30 flex flex-col shrink-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/60 shrink-0">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-foreground">Live Activity</span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full animate-pulse">LIVE</span>
          </div>
          <button onClick={() => setShowActivityFeed(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground/40 hover:text-foreground transition-colors">
            <PanelRightClose className="h-4 w-4" />
          </button>
        </div>

        <div ref={activityFeedRef} className="flex-1 overflow-y-auto p-3 space-y-1">
          {activityFeed.map((log, idx) => {
            const zoneColor = log.agentZone === "clinical" ? "text-red-400" : log.agentZone === "operations" ? "text-amber-400" : "text-blue-400";
            return (
              <div key={`${log.agentId}-${log.id}-${idx}`} className="flex gap-2 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                <div className={`mt-0.5 shrink-0 ${log.level === "error" ? "text-red-400" : log.level === "warn" ? "text-amber-400" : log.level === "success" ? "text-emerald-400" : "text-blue-400"}`}>
                  {log.level === "error" ? <AlertTriangle className="h-3 w-3" /> :
                   log.level === "warn" ? <AlertTriangle className="h-3 w-3" /> :
                   log.level === "success" ? <CheckCircle2 className="h-3 w-3" /> :
                   <Radio className="h-3 w-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[10px] font-semibold ${zoneColor}`}>{log.agentName}</span>
                    <span className="text-[9px] text-muted-foreground/30">{log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 leading-snug">{log.message}</p>
                </div>
              </div>
            );
          })}
          {activityFeed.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Radio className="h-6 w-6 text-muted-foreground/15 mb-2" />
              <p className="text-xs text-muted-foreground/30">No activity yet</p>
            </div>
          )}
        </div>

        {/* Feed summary footer */}
        <div className="px-4 py-2 border-t border-border/50 bg-card/40 flex items-center justify-between text-[10px] text-muted-foreground/50 shrink-0">
          <span>{activityFeed.length} events</span>
          <span>{activityFeed.filter((l) => l.level === "error").length} errors · {activityFeed.filter((l) => l.level === "warn").length} warnings</span>
        </div>
      </div>
    );
  };

  // ── FLEET STATUS BAR ─────────────────────────────────────────────────────
  const renderFleetStatusBar = () => {
    return (
      <div className={`border-b border-border/50 bg-card/20 shrink-0 transition-all duration-300 ${fleetBarExpanded ? "" : ""}`}>
        <button
          onClick={() => setFleetBarExpanded((p) => !p)}
          className="w-full flex items-center justify-between px-6 py-2 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Server className="h-3.5 w-3.5 text-muted-foreground/40" />
            <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Agent Fleet</span>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <Wifi className="h-3 w-3" /> {fleetHealth.activeAgents}
              </span>
              <span className="text-muted-foreground/20">/</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/40">
                {fleetHealth.totalAgents} total
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!fleetBarExpanded && (
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground/50">
                <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> {fleetHealth.avgCpu}%</span>
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {fleetHealth.totalTokens.toLocaleString()}</span>
                <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> ${fleetHealth.totalCostToday.toFixed(2)}</span>
              </div>
            )}
            {fleetBarExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/30" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/30" />}
          </div>
        </button>

        {fleetBarExpanded && (
          <div className="px-6 pb-3 flex gap-3 overflow-x-auto">
            {agents.map((agent) => {
              const sr = getSuccessRate(agent);
              const zoneColor = agent.zone === "clinical" ? "border-red-500/30 bg-red-500/5" : agent.zone === "operations" ? "border-amber-500/30 bg-amber-500/5" : "border-blue-500/30 bg-blue-500/5";
              const zoneText = agent.zone === "clinical" ? "text-red-400" : agent.zone === "operations" ? "text-amber-400" : "text-blue-400";
              return (
                <button
                  key={agent.id}
                  onClick={(e) => { e.stopPropagation(); setAgentFilter(agentFilter === agent.id ? "all" : agent.id); }}
                  className={cn(
                    "flex-shrink-0 w-52 rounded-xl border p-3 transition-all hover:scale-[1.02]",
                    zoneColor,
                    agentFilter === agent.id ? "ring-1 ring-primary/40 shadow-md" : "hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        {agent.active && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${agent.zone === "clinical" ? "bg-red-400" : agent.zone === "operations" ? "bg-amber-400" : "bg-blue-400"} opacity-75`} />}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${agent.active ? (agent.zone === "clinical" ? "bg-red-400" : agent.zone === "operations" ? "bg-amber-400" : "bg-blue-400") : "bg-gray-600"}`} />
                      </span>
                      <span className="text-xs font-semibold text-foreground truncate">{agent.name}</span>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border ${zoneColor} ${zoneText} font-medium`}>{agent.zone}</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-2.5 w-2.5 text-muted-foreground/30" />
                      <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${agent.cpu > 75 ? "bg-red-500" : agent.cpu > 50 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${agent.cpu}%` }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground/40 tabular-nums w-7 text-right">{agent.cpu}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-2.5 w-2.5 text-muted-foreground/30" />
                      <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${agent.memory > 75 ? "bg-red-500" : agent.memory > 50 ? "bg-amber-500" : "bg-cyan-500"}`} style={{ width: `${agent.memory}%` }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground/40 tabular-nums w-7 text-right">{agent.memory}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <span className="text-[9px] text-muted-foreground/40 flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5 text-emerald-400/60" />{agent.tasksCompleted}</span>
                    <span className={`text-[9px] font-medium tabular-nums ${sr >= 95 ? "text-emerald-400/70" : sr >= 80 ? "text-amber-400/70" : "text-red-400/70"}`}>{sr}%</span>
                    <span className="text-[9px] text-muted-foreground/40 flex items-center gap-1"><DollarSign className="h-2.5 w-2.5 text-amber-400/60" />${agent.costToday.toFixed(2)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── MAIN LAYOUT ─────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar overdueTaskCount={overdueCount} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Page Header */}
        <div className="px-8 pt-8 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold font-heading gradient-hero-text">{t("commandStation.title")}</h1>
                <p className="text-muted-foreground mt-1">{t("commandStation.subtitle")}</p>
              </div>
              {/* System Health Badge */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium",
                fleetHealth.status === "healthy"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : fleetHealth.status === "warning"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              )}>
                {fleetHealth.status === "healthy" ? <Heart className="h-3.5 w-3.5" /> :
                 fleetHealth.status === "warning" ? <AlertTriangle className="h-3.5 w-3.5" /> :
                 <ServerCrash className="h-3.5 w-3.5" />}
                {fleetHealth.status === "healthy" ? "Fleet Healthy" :
                 fleetHealth.status === "warning" ? "Needs Attention" :
                 "Critical Issues"}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden">
                <button onClick={() => setViewMode("board")} className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors ${viewMode === "board" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>
                  <LayoutList className="h-4 w-4" /> Task Board
                </button>
                <button onClick={() => setViewMode("analytics")} className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors ${viewMode === "analytics" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>
                  <BarChart2 className="h-4 w-4" /> Analytics
                </button>
                <button onClick={() => setViewMode("split")} className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors ${viewMode === "split" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>
                  <LayoutGrid className="h-4 w-4" /> Multi-Screen
                </button>
              </div>
              <button
                onClick={() => setShowActivityFeed((p) => !p)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                  showActivityFeed
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <PanelRightOpen className="h-4 w-4" /> Feed
              </button>
              <Button variant="outline" size="sm" onClick={() => setFullscreenMode(true)} className="gap-1.5 text-muted-foreground hover:text-foreground">
                <Fullscreen className="h-4 w-4" /> {t("commandStation.agentScreen")}
              </Button>
            </div>
          </div>
        </div>

        {/* Fleet Status Bar */}
        {renderFleetStatusBar()}

        {/* Main content area with optional activity feed */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {viewMode === "split" && renderSplitScreen()}
            {viewMode === "board" && renderTaskBoard()}
            {viewMode === "analytics" && <TaskAnalyticsDashboard tasks={tasks} agents={agents} />}
          </div>
          {renderActivityFeed()}
        </div>
      </main>

      {renderTaskModal()}
      {renderDeleteConfirm()}
    </div>
  );
};

export default AgentCommandStation;
