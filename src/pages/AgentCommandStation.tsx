import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
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
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

type KanbanColumn = "backlog" | "todo" | "in_progress" | "review" | "done";

interface KanbanTask {
  id: string;
  title: string;
  description: string;
  agentId: string;
  priority: "high" | "medium" | "low";
  zone: "clinical" | "operations" | "external";
  column: KanbanColumn;
  createdAt: string;
}

type ViewMode = "board" | "split";

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
];

const MOCK_TASKS: KanbanTask[] = [
  // Backlog
  { id: "t1", title: "Prepare monthly patient satisfaction report", description: "Compile and analyze patient feedback data for January", agentId: "1", priority: "medium", zone: "clinical", column: "backlog", createdAt: "2d ago" },
  { id: "t2", title: "Update insurance provider database", description: "Add new Cigna and Aetna plan codes for 2026", agentId: "1", priority: "low", zone: "clinical", column: "backlog", createdAt: "3d ago" },
  { id: "t3", title: "Plan flu clinic outreach campaign", description: "Design multi-channel outreach for spring flu vaccinations", agentId: "2", priority: "medium", zone: "external", column: "backlog", createdAt: "1d ago" },
  // To Do
  { id: "t4", title: "Review pending referral letters", description: "12 referral letters awaiting review and signature", agentId: "1", priority: "high", zone: "clinical", column: "todo", createdAt: "1d ago" },
  { id: "t5", title: "Draft social media calendar for March", description: "Create content calendar with health awareness themes", agentId: "2", priority: "medium", zone: "external", column: "todo", createdAt: "4h ago" },
  { id: "t6", title: "Research NIH grant renewal requirements", description: "Compile documentation needed for R01 renewal application", agentId: "3", priority: "high", zone: "operations", column: "todo", createdAt: "6h ago" },
  // In Progress
  { id: "t7", title: "Insurance verification — patient #4821", description: "Verifying coverage through Availity API for upcoming procedure", agentId: "1", priority: "high", zone: "clinical", column: "in_progress", createdAt: "30m ago" },
  { id: "t8", title: "Q1 cardiovascular awareness campaign", description: "Writing copy for Heart Health Month across all channels", agentId: "2", priority: "high", zone: "external", column: "in_progress", createdAt: "2h ago" },
  { id: "t9", title: "NIH R01 proposal budget revision", description: "Adjusting budget allocations per reviewer feedback", agentId: "3", priority: "medium", zone: "operations", column: "in_progress", createdAt: "1h ago" },
  // Review
  { id: "t10", title: "Appointment reminder batch (14 patients)", description: "SMS and email reminders for next week's appointments", agentId: "1", priority: "medium", zone: "clinical", column: "review", createdAt: "45m ago" },
  { id: "t11", title: "Blog post: Heart Health Month Tips", description: "850-word article on cardiovascular wellness, ready for compliance check", agentId: "2", priority: "low", zone: "external", column: "review", createdAt: "1h ago" },
  { id: "t12", title: "PCORI funding opportunity analysis", description: "Research summary of Patient-Centered Outcomes Research funding", agentId: "3", priority: "medium", zone: "operations", column: "review", createdAt: "3h ago" },
  // Done
  { id: "t13", title: "Lab result notification — J. Chen", description: "Patient notified of lab results via secure portal", agentId: "1", priority: "high", zone: "clinical", column: "done", createdAt: "1h ago" },
  { id: "t14", title: "Email newsletter draft (850 words)", description: "February newsletter completed and sent to editor", agentId: "2", priority: "medium", zone: "external", column: "done", createdAt: "2h ago" },
  { id: "t15", title: "NIH R01 proposal draft ($1.2M)", description: "Full proposal draft submitted for internal review", agentId: "3", priority: "high", zone: "operations", column: "done", createdAt: "4h ago" },
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

// ── Helpers ─────────────────────────────────────────────────────────────────
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

// ── Fullscreen Tasks Mock ───────────────────────────────────────────────────
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

// ── Component ───────────────────────────────────────────────────────────────
const AgentCommandStation = () => {
  const { t } = useTranslation();
  const [agents, setAgents] = useState<AgentState[]>(MOCK_AGENTS);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [fullscreenMode, setFullscreenMode] = useState(false);

  // Multi-screen state
  const [splitScreenIds, setSplitScreenIds] = useState<string[]>(["1", "2"]);

  // Fullscreen live state
  const [fsTasks, setFsTasks] = useState(FULLSCREEN_TASKS.map((t) => ({ ...t })));
  const [fsTick, setFsTick] = useState(0);

  // Kanban board state
  const [tasks, setTasks] = useState<KanbanTask[]>(MOCK_TASKS);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanColumn | null>(null);
  const [agentFilter, setAgentFilter] = useState<string>("all");

  // Task CRUD modal state
  const [taskModal, setTaskModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    task: Partial<KanbanTask> | null;
    targetColumn?: KanbanColumn;
  }>({ open: false, mode: "add", task: null });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // ── Drag-and-drop handlers ──────────────────────────────────────────────
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

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetColumn: KanbanColumn) => {
    e.preventDefault();
    if (draggedTaskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === draggedTaskId ? { ...t, column: targetColumn } : t
        )
      );
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  }, [draggedTaskId]);

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  }, []);

  const moveTaskForward = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const currentIdx = COLUMN_ORDER.indexOf(t.column);
        if (currentIdx < COLUMN_ORDER.length - 1) {
          return { ...t, column: COLUMN_ORDER[currentIdx + 1] };
        }
        return t;
      })
    );
  }, []);

  // ── CRUD handlers ────────────────────────────────────────────────────────
  const openAddModal = useCallback((column: KanbanColumn = "backlog") => {
    setTaskModal({
      open: true,
      mode: "add",
      task: { column, priority: "medium", zone: "clinical", agentId: "1" },
      targetColumn: column,
    });
  }, []);

  const openEditModal = useCallback((task: KanbanTask) => {
    setTaskModal({ open: true, mode: "edit", task: { ...task } });
  }, []);

  const closeModal = useCallback(() => {
    setTaskModal({ open: false, mode: "add", task: null });
  }, []);

  const saveTask = useCallback((data: Partial<KanbanTask>) => {
    if (!data.title?.trim()) return;
    if (taskModal.mode === "add") {
      const newTask: KanbanTask = {
        id: `t${Date.now()}`,
        title: data.title.trim(),
        description: data.description?.trim() ?? "",
        agentId: data.agentId ?? "1",
        priority: data.priority ?? "medium",
        zone: data.zone ?? "clinical",
        column: data.column ?? "backlog",
        createdAt: "just now",
      };
      setTasks((prev) => [...prev, newTask]);
    } else {
      setTasks((prev) =>
        prev.map((t) => (t.id === data.id ? { ...t, ...data, title: data.title!.trim() } : t))
      );
    }
    closeModal();
  }, [taskModal.mode, closeModal]);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setDeleteConfirm(null);
  }, []);

  // ── Fullscreen auto-refresh ─────────────────────────────────────────────
  useEffect(() => {
    if (!fullscreenMode) return;
    const interval = setInterval(() => {
      setFsTick((t) => t + 1);
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          cpu: a.active
            ? clamp(a.cpu + Math.floor(Math.random() * 13) - 6, 5, 95)
            : 0,
          memory: a.active
            ? clamp(a.memory + Math.floor(Math.random() * 9) - 4, 10, 92)
            : a.memory,
          tokensUsed: a.active
            ? a.tokensUsed + Math.floor(Math.random() * 800) + 100
            : a.tokensUsed,
          costToday: a.active
            ? Math.round((a.costToday + Math.random() * 0.08) * 100) / 100
            : a.costToday,
          tasksCompleted:
            a.active && Math.random() > 0.7
              ? a.tasksCompleted + 1
              : a.tasksCompleted,
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

  // ── Escape key ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!fullscreenMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreenMode(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreenMode]);

  // ── Metric auto-refresh (gentle fluctuation) ───────────────────────────
  useEffect(() => {
    if (fullscreenMode) return;
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          cpu: a.active
            ? clamp(a.cpu + Math.floor(Math.random() * 7) - 3, 5, 95)
            : 0,
          memory: a.active
            ? clamp(a.memory + Math.floor(Math.random() * 5) - 2, 10, 92)
            : a.memory,
          tokensUsed: a.active
            ? a.tokensUsed + Math.floor(Math.random() * 200)
            : a.tokensUsed,
        }))
      );
    }, 8000);
    return () => clearInterval(interval);
  }, [fullscreenMode]);

  const getSuccessRate = (a: AgentState) =>
    a.tasksCompleted + a.tasksFailed > 0
      ? Math.round(
          (a.tasksCompleted / (a.tasksCompleted + a.tasksFailed)) * 100
        )
      : 0;

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
            <span className="text-sm font-bold tracking-widest text-cyan-400 uppercase">
              {t("commandStation.agentScreen")}
            </span>
            <span className="text-xs text-green-600 animate-pulse">
              {t("commandStation.live")}
            </span>
            <span className="text-xs text-green-700">Tick #{fsTick}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-amber-400 tabular-nums">
                {totalTokens.toLocaleString()} tokens
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <DollarSign className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-amber-400 tabular-nums">
                ${totalCost.toFixed(2)} today
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 tabular-nums">
                {totalTasks.toLocaleString()} tasks done
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFullscreenMode(false)}
              className="border-green-800 text-green-400 bg-transparent hover:bg-green-950 hover:text-green-300 text-xs gap-1"
            >
              <Minimize2 className="h-3.5 w-3.5" />
              {t("commandStation.exitEsc")}
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 overflow-auto">
          {agents.map((ag) => {
            const sr = getSuccessRate(ag);
            const agTasks = fsTasks.slice(0, ag.active ? 3 : 1);
            return (
              <div
                key={ag.id}
                className="border border-green-900/40 p-4 flex flex-col gap-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      {ag.active && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                          ag.active ? "bg-green-500" : "bg-gray-600"
                        }`}
                      />
                    </span>
                    <span className="text-sm font-bold text-cyan-400">
                      {ag.name}
                    </span>
                    <span className="text-[10px] text-green-700">{ag.model}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      ag.active
                        ? "border-green-700 text-green-400 bg-green-950/50"
                        : "border-gray-700 text-gray-500 bg-gray-900/50"
                    }`}
                  >
                    {ag.active
                      ? t("commandStation.online")
                      : t("commandStation.offline")}
                  </span>
                </div>

                <p className="text-xs text-green-500/80 leading-relaxed">
                  &gt; {ag.currentTask}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-green-700 flex items-center gap-1">
                        <Cpu className="h-3 w-3" /> CPU
                      </span>
                      <span className="text-[10px] text-green-400 tabular-nums">
                        {ag.cpu}%
                      </span>
                    </div>
                    <div className="h-2 rounded bg-green-950 overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-1000 ease-in-out ${
                          ag.cpu > 75
                            ? "bg-red-500"
                            : ag.cpu > 50
                            ? "bg-amber-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${ag.cpu}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-green-700 flex items-center gap-1">
                        <Activity className="h-3 w-3" /> MEM
                      </span>
                      <span className="text-[10px] text-green-400 tabular-nums">
                        {ag.memory}%
                      </span>
                    </div>
                    <div className="h-2 rounded bg-green-950 overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-1000 ease-in-out ${
                          ag.memory > 75
                            ? "bg-red-500"
                            : ag.memory > 50
                            ? "bg-amber-500"
                            : "bg-cyan-500"
                        }`}
                        style={{ width: `${ag.memory}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    {
                      label: "Tasks",
                      value: ag.tasksCompleted.toLocaleString(),
                      color: "text-green-400",
                    },
                    {
                      label: "Failed",
                      value: String(ag.tasksFailed),
                      color:
                        ag.tasksFailed > 5
                          ? "text-red-400"
                          : "text-green-400",
                    },
                    {
                      label: "Rate",
                      value: `${sr}%`,
                      color:
                        sr >= 95
                          ? "text-green-400"
                          : sr >= 80
                          ? "text-amber-400"
                          : "text-red-400",
                    },
                    {
                      label: "Cost",
                      value: `$${ag.costToday.toFixed(2)}`,
                      color: "text-amber-400",
                    },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p
                        className={`text-xs font-bold tabular-nums ${s.color}`}
                      >
                        {s.value}
                      </p>
                      <p className="text-[9px] text-green-800">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] border-t border-green-900/40 pt-2">
                  <span className="text-green-700 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span className="text-green-400 tabular-nums transition-all duration-700">
                      {ag.tokensUsed.toLocaleString()}
                    </span>{" "}
                    tokens
                  </span>
                  <span className="text-green-700">
                    Uptime:{" "}
                    <span className="text-green-400">{ag.uptime}</span>
                  </span>
                </div>

                {ag.active && (
                  <div className="space-y-1.5 border-t border-green-900/40 pt-2">
                    <p className="text-[10px] text-green-700 uppercase tracking-wider">
                      {t("commandStation.taskQueue")}
                    </p>
                    {agTasks.map((tk, i) => (
                      <div key={tk.id + "-" + ag.id + "-" + i} className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-green-600 truncate max-w-[70%]">
                            {tk.label}
                          </span>
                          <span className="text-[10px] text-green-400 tabular-nums">
                            {tk.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded bg-green-950 overflow-hidden">
                          <div
                            className="h-full rounded bg-gradient-to-r from-green-600 to-cyan-500 transition-all duration-1000 ease-in-out"
                            style={{ width: `${tk.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1 border-t border-green-900/40 pt-2 max-h-[100px] overflow-y-auto">
                  <p className="text-[10px] text-green-700 uppercase tracking-wider">
                    {t("commandStation.recentActivity")}
                  </p>
                  {ag.logs.slice(0, 3).map((log) => (
                    <p
                      key={log.id}
                      className={`text-[10px] leading-snug ${
                        log.level === "error"
                          ? "text-red-400"
                          : log.level === "warn"
                          ? "text-amber-400"
                          : log.level === "success"
                          ? "text-green-500"
                          : "text-green-600"
                      }`}
                    >
                      {log.level === "error"
                        ? "ERR"
                        : log.level === "warn"
                        ? "WRN"
                        : log.level === "success"
                        ? "OK "
                        : "INF"}{" "}
                      {log.message}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="shrink-0 flex items-center justify-between px-6 py-2 border-t border-green-900/60 bg-black/95 text-[10px] text-green-700">
          <span>{t("commandStation.autoRefresh")}</span>
          <span className="text-green-600">
            {new Date().toLocaleTimeString()} |{" "}
            {agents.filter((a) => a.active).length}/{agents.length}{" "}
            {t("commandStation.agentsOnline")}
          </span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── MULTI-SCREEN SPLIT VIEW ─────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const renderSplitScreen = () => {
    const screenAgents = splitScreenIds
      .map((id) => agents.find((a) => a.id === id))
      .filter(Boolean) as AgentState[];

    return (
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
        {screenAgents.map((agent) => {
          const sr = getSuccessRate(agent);
          return (
            <div
              key={agent.id}
              className="flex flex-col border-r border-b border-border overflow-hidden"
            >
              {/* Screen header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/60 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    {agent.active && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        agent.active
                          ? "bg-emerald-500"
                          : "bg-muted-foreground/40"
                      }`}
                    />
                  </span>
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {agent.name}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      agent.zone === "clinical"
                        ? "text-red-400 bg-red-500/10 border-red-500/30"
                        : agent.zone === "operations"
                        ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                        : "text-blue-400 bg-blue-500/10 border-blue-500/30"
                    }`}
                  >
                    {agent.zone}
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {agent.model}
                </span>
              </div>

              {/* Terminal */}
              <div className="flex-1 bg-black/90 overflow-y-auto p-4 font-mono text-xs space-y-1.5 min-h-0">
                <p className="text-white/30">
                  --- {agent.name} --- {agent.model} ---{" "}
                  {new Date().toLocaleTimeString()} ---
                </p>
                {agent.active ? (
                  <>
                    <p className="text-emerald-400">
                      &gt; {agent.currentTask}
                    </p>
                    <p className="text-white/50">
                      {" "}
                      CPU: {agent.cpu}% | Memory: {agent.memory}% | Tokens:{" "}
                      {agent.tokensUsed.toLocaleString()}
                    </p>
                    <p className="text-cyan-400">
                      {" "}
                      Success Rate: {sr}% | Cost: $
                      {agent.costToday.toFixed(2)} | Uptime: {agent.uptime}
                    </p>
                    <p className="text-white/30 mt-2">-- Recent Activity --</p>
                    {agent.logs.map((log) => (
                      <p
                        key={log.id}
                        className={`${
                          LOG_LEVEL_STYLES[log.level]
                        } leading-snug`}
                      >
                        [{log.level.toUpperCase()}] {log.message}{" "}
                        <span className="text-white/20">({log.timestamp})</span>
                      </p>
                    ))}
                    <p className="text-white/20 animate-pulse mt-3">_</p>
                  </>
                ) : (
                  <>
                    <p className="text-white/40">
                      Agent is offline --- last active 2h ago
                    </p>
                    <p className="text-white/30">
                      Context preserved. Tasks queued: 0
                    </p>
                  </>
                )}
              </div>

              {/* Stats bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-card/40 border-t border-border text-[10px] text-muted-foreground shrink-0">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  {agent.tasksCompleted} done
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-amber-400" />
                  {(agent.tokensUsed / 1000).toFixed(1)}k tokens
                </span>
                <span className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-amber-400" />$
                  {agent.costToday.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Add more screens */}
        {splitScreenIds.length < agents.length && (
          <div className="flex flex-col items-center justify-center border-r border-b border-border bg-card/20 min-h-[300px]">
            <p className="text-sm text-muted-foreground mb-3">
              Add agent screen
            </p>
            <div className="flex gap-2 flex-wrap justify-center px-4">
              {agents
                .filter((a) => !splitScreenIds.includes(a.id))
                .map((a) => (
                  <button
                    key={a.id}
                    onClick={() =>
                      setSplitScreenIds((prev) => [...prev, a.id])
                    }
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors text-sm"
                  >
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ── TASK MODAL ────────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const renderTaskModal = () => {
    if (!taskModal.open || !taskModal.task) return null;
    const isEdit = taskModal.mode === "edit";
    const draft = taskModal.task;

    const update = (field: string, value: string) =>
      setTaskModal((prev) => ({ ...prev, task: { ...prev.task, [field]: value } }));

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />

        {/* Modal */}
        <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-[hsl(220,20%,7%)] shadow-[0_0_60px_-10px_rgba(6,182,212,0.3)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gradient-to-r from-cyan-500/10 to-blue-500/5">
            <div className="flex items-center gap-2">
              {isEdit ? (
                <Pencil className="h-4 w-4 text-cyan-400" />
              ) : (
                <Plus className="h-4 w-4 text-cyan-400" />
              )}
              <span className="text-sm font-semibold text-cyan-400">
                {isEdit ? "Edit Task" : "Add Task"}
              </span>
            </div>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 flex items-center gap-1.5">
                <Pencil className="h-3 w-3" /> Title
              </label>
              <input
                ref={titleRef}
                autoFocus
                value={draft.title ?? ""}
                onChange={(e) => update("title", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveTask(draft)}
                placeholder="Task title..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50">Description</label>
              <textarea
                value={draft.description ?? ""}
                onChange={(e) => update("description", e.target.value)}
                placeholder="What needs to be done..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 resize-none"
              />
            </div>

            {/* Row: Agent + Column */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 flex items-center gap-1.5">
                  <User className="h-3 w-3" /> Assigned Agent
                </label>
                <select
                  value={draft.agentId ?? "1"}
                  onChange={(e) => update("agentId", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id} className="bg-[hsl(220,20%,10%)]">
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50">Column</label>
                <select
                  value={draft.column ?? "backlog"}
                  onChange={(e) => update("column", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                >
                  {COLUMN_CONFIG.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[hsl(220,20%,10%)]">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row: Priority + Zone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 flex items-center gap-1.5">
                  <Flag className="h-3 w-3" /> Priority
                </label>
                <select
                  value={draft.priority ?? "medium"}
                  onChange={(e) => update("priority", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                >
                  <option value="high" className="bg-[hsl(220,20%,10%)]">High</option>
                  <option value="medium" className="bg-[hsl(220,20%,10%)]">Medium</option>
                  <option value="low" className="bg-[hsl(220,20%,10%)]">Low</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 flex items-center gap-1.5">
                  <Globe className="h-3 w-3" /> Zone
                </label>
                <select
                  value={draft.zone ?? "clinical"}
                  onChange={(e) => update("zone", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                >
                  <option value="clinical" className="bg-[hsl(220,20%,10%)]">Clinical</option>
                  <option value="operations" className="bg-[hsl(220,20%,10%)]">Operations</option>
                  <option value="external" className="bg-[hsl(220,20%,10%)]">External</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            {isEdit ? (
              <button
                onClick={() => { setDeleteConfirm(draft.id!); closeModal(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => saveTask(draft)}
                disabled={!draft.title?.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 text-sm font-medium transition-colors disabled:opacity-40"
              >
                <Save className="h-3.5 w-3.5" />
                {isEdit ? "Save Changes" : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Delete confirm overlay ────────────────────────────────────────────────
  const renderDeleteConfirm = () => {
    if (!deleteConfirm) return null;
    const task = tasks.find((t) => t.id === deleteConfirm);
    if (!task) return null;
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
        <div className="relative w-full max-w-sm rounded-2xl border border-red-500/30 bg-[hsl(220,20%,7%)] p-6 shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Delete Task?</p>
              <p className="text-xs text-white/40 mt-0.5">This cannot be undone</p>
            </div>
          </div>
          <p className="text-xs text-white/60 mb-5 bg-white/5 rounded-lg px-3 py-2 border border-white/5 line-clamp-2">
            "{task.title}"
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteTask(deleteConfirm)}
              className="flex-1 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ── TASK BOARD VIEW ───────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const renderTaskBoard = () => {
    const filteredTasks =
      agentFilter === "all"
        ? tasks
        : tasks.filter((t) => t.agentId === agentFilter);

    const getAgentById = (agentId: string) =>
      agents.find((a) => a.id === agentId);

    const getColumnTasks = (column: KanbanColumn) =>
      filteredTasks.filter((t) => t.column === column);

    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border/50 bg-card/30 shrink-0">
          {/* Agent filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground/50" />
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="all">All Agents</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground/60 ml-2">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              {getColumnTasks("in_progress").length} in progress
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              {getColumnTasks("review").length} in review
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {getColumnTasks("done").length} done
            </span>
            <span className="text-muted-foreground/40">|</span>
            <span>{filteredTasks.length} total tasks</span>
          </div>

          {/* Add Task button */}
          <button
            onClick={() => openAddModal("backlog")}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 text-xs font-medium transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
          </button>
        </div>

        {/* Kanban Columns */}
        <div className="flex-1 flex gap-4 p-6 overflow-x-auto min-h-0">
          {COLUMN_CONFIG.map((col) => {
            const ColIcon = col.Icon;
            const columnTasks = getColumnTasks(col.id);
            const isDragOver = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                className={`flex flex-col w-72 shrink-0 rounded-2xl border transition-all duration-200 ${
                  isDragOver
                    ? `${col.borderClass} bg-card/60 scale-[1.01]`
                    : "border-border/40 bg-card/30"
                }`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b border-border/30 ${col.bgClass} rounded-t-2xl`}>
                  <div className="flex items-center gap-2">
                    <ColIcon className={`h-4 w-4 ${col.colorClass}`} />
                    <span className={`text-xs font-semibold ${col.colorClass}`}>{col.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${col.bgClass} ${col.colorClass} border ${col.borderClass} font-medium`}>
                      {columnTasks.length}
                    </span>
                  </div>
                  {/* Add to column button */}
                  <button
                    onClick={() => openAddModal(col.id)}
                    className={`p-1 rounded-md hover:bg-white/10 ${col.colorClass} opacity-50 hover:opacity-100 transition-all`}
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Tasks */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {columnTasks.length === 0 && (
                    <button
                      onClick={() => openAddModal(col.id)}
                      className="w-full flex flex-col items-center justify-center py-8 text-center border border-dashed border-border/30 rounded-xl hover:border-border/60 hover:bg-white/3 transition-colors group"
                    >
                      <Plus className="h-5 w-5 text-muted-foreground/20 mb-1 group-hover:text-muted-foreground/50 transition-colors" />
                      <p className="text-[10px] text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors">Add a task</p>
                    </button>
                  )}
                  {columnTasks.map((task) => {
                    const agent = getAgentById(task.agentId);
                    const nextColIdx = COLUMN_ORDER.indexOf(task.column);
                    const canMoveForward = nextColIdx < COLUMN_ORDER.length - 1;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={handleDragEnd}
                        className={`group relative rounded-xl border bg-card/50 p-3 cursor-grab active:cursor-grabbing transition-all duration-150 hover:bg-card/80 hover:border-border/70 hover:shadow-md ${
                          draggedTaskId === task.id ? "opacity-40 scale-95" : "opacity-100"
                        } ${
                          task.priority === "high"
                            ? "border-red-500/20"
                            : task.priority === "medium"
                            ? "border-border/40"
                            : "border-border/20"
                        }`}
                      >
                        {/* Title row with drag handle, edit, and forward button */}
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground/20 mt-0.5 shrink-0 group-hover:text-muted-foreground/50 transition-colors" />
                          <p className="text-sm font-medium text-foreground leading-snug flex-1">
                            {task.title}
                          </p>
                          {/* Action buttons */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                              className="p-1 rounded hover:bg-white/10 text-muted-foreground/40 hover:text-cyan-400 transition-colors"
                              title="Edit task"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm(task.id); }}
                              className="p-1 rounded hover:bg-white/10 text-muted-foreground/40 hover:text-red-400 transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            {canMoveForward && (
                              <button
                                onClick={(e) => { e.stopPropagation(); moveTaskForward(task.id); }}
                                className="p-1 rounded hover:bg-white/10 text-muted-foreground/40 hover:text-emerald-400 transition-colors"
                                title="Move to next stage"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-[11px] text-muted-foreground/50 leading-relaxed mt-2 ml-6 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Footer row */}
                        <div className="flex items-center gap-2 mt-3 ml-6 flex-wrap">
                          {/* Priority badge */}
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                              task.priority === "high"
                                ? "text-red-400 bg-red-500/10 border-red-500/20"
                                : task.priority === "medium"
                                ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                                : "text-slate-400 bg-slate-500/10 border-slate-500/20"
                            }`}
                          >
                            {task.priority}
                          </span>

                          {/* Zone badge */}
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                              task.zone === "clinical"
                                ? "text-red-300/70 bg-red-500/5 border-red-500/15"
                                : task.zone === "operations"
                                ? "text-amber-300/70 bg-amber-500/5 border-amber-500/15"
                                : "text-blue-300/70 bg-blue-500/5 border-blue-500/15"
                            }`}
                          >
                            {task.zone}
                          </span>

                          {/* Agent avatar */}
                          {agent && (
                            <div className="ml-auto flex items-center gap-1">
                              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                agent.zone === "clinical" ? "bg-red-500/20 text-red-400" :
                                agent.zone === "operations" ? "bg-amber-500/20 text-amber-400" :
                                "bg-blue-500/20 text-blue-400"
                              }`}>
                                {agent.name.charAt(0)}
                              </div>
                              <span className="text-[10px] text-muted-foreground/40">{agent.name.split(" ")[0]}</span>
                            </div>
                          )}
                        </div>

                        {/* Created at */}
                        <p className="text-[9px] text-muted-foreground/25 mt-2 ml-6">{task.createdAt}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Column footer — add button */}
                <div className="px-3 pb-3 pt-1">
                  <button
                    onClick={() => openAddModal(col.id)}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed ${col.borderClass} ${col.colorClass} opacity-30 hover:opacity-70 transition-opacity text-xs`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add to {col.label}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ── MAIN LAYOUT ────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading gradient-hero-text">
                {t("commandStation.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("commandStation.subtitle")}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* View toggles */}
              <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setViewMode("board")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors ${
                    viewMode === "board"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <LayoutList className="h-4 w-4" />
                  Task Board
                </button>
                <button
                  onClick={() => setViewMode("split")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors ${
                    viewMode === "split"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Multi-Screen
                </button>
              </div>

              {/* Fullscreen */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullscreenMode(true)}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Fullscreen className="h-4 w-4" />
                {t("commandStation.agentScreen")}
              </Button>
            </div>
          </div>
        </div>

        {/* ── SPLIT VIEW ─────────────────────────────────────────── */}
        {viewMode === "split" && renderSplitScreen()}

        {/* ── TASK BOARD VIEW ──────────────────────────────────────── */}
        {viewMode === "board" && renderTaskBoard()}
      </main>

      {/* Task modals rendered at root level */}
      {renderTaskModal()}
      {renderDeleteConfirm()}
    </div>
  );
};

export default AgentCommandStation;
