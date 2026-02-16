import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Bot,
  ChevronDown,
  ArrowUpRight,
  Calendar,
  Tag,
  BarChart3,
  ListTodo,
  Columns3,
  Timer,
  Zap,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type TaskStatus = "queued" | "in_progress" | "completed" | "failed";
type TaskPriority = "low" | "medium" | "high" | "urgent";

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
}

const STATUS_CONFIG: Record<TaskStatus, { icon: typeof Circle; label: string; color: string; bg: string }> = {
  queued: { icon: Circle, label: "Queued", color: "text-zinc-400", bg: "bg-zinc-500/15 border-zinc-500/30" },
  in_progress: { icon: RefreshCw, label: "In Progress", color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/30" },
  completed: { icon: CheckCircle2, label: "Completed", color: "text-green-400", bg: "bg-green-500/15 border-green-500/30" },
  failed: { icon: AlertTriangle, label: "Failed", color: "text-red-400", bg: "bg-red-500/15 border-red-500/30" },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
  medium: { label: "Medium", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  high: { label: "High", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  urgent: { label: "Urgent", color: "text-red-400 bg-red-500/10 border-red-500/20" },
};

const mockTasks: AgentTask[] = [
  {
    id: "task-1",
    title: "Schedule 15 patient follow-up appointments",
    description: "Reach out to patients who visited last month and schedule follow-up appointments based on their treatment plans.",
    agentName: "Dr. Front Desk",
    agentId: "1",
    status: "in_progress",
    priority: "high",
    category: "Scheduling",
    createdAt: "Today, 8:00 AM",
    startedAt: "Today, 8:02 AM",
    duration: "2h 15m",
    progress: 60,
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
    description: "Create a full social media content calendar for Q1 including posts, graphics briefs, and engagement strategy.",
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
    description: "Prepare a complete R01 grant application including specific aims, significance, innovation, and approach sections.",
    agentName: "Grant Pro",
    agentId: "3",
    status: "in_progress",
    priority: "urgent",
    category: "Research",
    createdAt: "Today, 6:00 AM",
    startedAt: "Today, 6:05 AM",
    duration: "4h 10m",
    progress: 45,
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
    description: "Verify insurance eligibility and coverage for all patients with appointments next week.",
    agentName: "Dr. Front Desk",
    agentId: "1",
    status: "queued",
    priority: "medium",
    category: "Insurance",
    createdAt: "Today, 9:00 AM",
    progress: 0,
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
    description: "Analyze competitor pricing strategies across 8 competitors and prepare a recommendations report.",
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
  },
  {
    id: "task-6",
    title: "Process prescription refill requests",
    description: "Handle 8 pending prescription refill requests — verify histories, contact pharmacies, and notify patients.",
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
  },
  {
    id: "task-7",
    title: "Email campaign A/B test setup",
    description: "Set up A/B testing for the product launch email campaign with two subject lines and CTA variations.",
    agentName: "Marketing Maven",
    agentId: "2",
    status: "queued",
    priority: "medium",
    category: "Marketing",
    createdAt: "Today, 10:00 AM",
    progress: 0,
  },
  {
    id: "task-8",
    title: "Patient no-show follow-up calls",
    description: "Contact 5 patients who missed their appointments today to reschedule.",
    agentName: "Dr. Front Desk",
    agentId: "1",
    status: "failed",
    priority: "high",
    category: "Outreach",
    createdAt: "Yesterday, 5:00 PM",
    startedAt: "Yesterday, 5:01 PM",
    duration: "12m",
    progress: 20,
    subtasks: [
      { label: "Pull no-show list", done: true },
      { label: "Attempt phone contact", done: false },
      { label: "Send SMS follow-up", done: false },
    ],
  },
];

type ViewMode = "list" | "board";

const TaskTracker = () => {
  const [tasks] = useState<AgentTask[]>(mockTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tasks.length,
    queued: tasks.filter((t) => t.status === "queued").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    failed: tasks.filter((t) => t.status === "failed").length,
  };

  const boardColumns: { status: TaskStatus; label: string }[] = [
    { status: "queued", label: "Queued" },
    { status: "in_progress", label: "In Progress" },
    { status: "completed", label: "Completed" },
    { status: "failed", label: "Failed" },
  ];

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
          <StatusIcon className={`h-5 w-5 mt-0.5 shrink-0 ${statusCfg.color} ${task.status === "in_progress" ? "animate-spin" : ""}`} style={task.status === "in_progress" ? { animationDuration: "3s" } : {}} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold text-foreground leading-tight">
                {task.title}
              </h3>
              {!compact && (
                <button
                  onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                  className="p-1 rounded hover:bg-white/5 text-muted-foreground shrink-0"
                >
                  <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className={`text-[10px] border ${priorityCfg.color} px-1.5 py-0`}>
                {priorityCfg.label}
              </Badge>
              <Badge variant="outline" className={`text-[10px] border ${statusCfg.bg} ${statusCfg.color} px-1.5 py-0`}>
                {statusCfg.label}
              </Badge>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Bot className="h-3 w-3" /> {task.agentName}
              </span>
            </div>

            {/* Progress bar */}
            {task.progress > 0 && task.progress < 100 && (
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">Progress</span>
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

            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
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
                      Subtasks ({task.subtasks.filter((s) => s.done).length}/{task.subtasks.length})
                    </p>
                    {task.subtasks.map((sub, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {sub.done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                        )}
                        <span className={`text-xs ${sub.done ? "text-muted-foreground line-through" : "text-foreground/80"}`}>
                          {sub.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {task.startedAt && (
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span>Started: {task.startedAt}</span>
                    {task.completedAt && <span>Completed: {task.completedAt}</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <ListTodo className="h-7 w-7 text-primary" />
              Task Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and track all agent tasks in real time
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Queued", value: stats.queued, icon: Circle, color: "text-zinc-400", bg: "bg-zinc-500/10" },
              { label: "In Progress", value: stats.inProgress, icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
              { label: "Failed", value: stats.failed, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${stat.bg} ${stat.color}`}>
                    {stat.label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">of {stats.total} total tasks</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, agents, categories..."
                className="pl-9 bg-white/[0.03] border-white/10 focus:border-primary/50"
              />
            </div>
            <div className="flex items-center gap-2">
              {/* Status filter chips */}
              <div className="flex gap-1 bg-card/50 border border-border rounded-xl p-1">
                {(["all", "queued", "in_progress", "completed", "failed"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === s
                        ? "gradient-primary text-primary-foreground shadow-glow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s === "all" ? "All" : s === "in_progress" ? "Active" : STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
              {/* View toggle */}
              <div className="flex gap-1 bg-card/50 border border-border rounded-xl p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "list" ? "gradient-primary text-primary-foreground shadow-glow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ListTodo className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("board")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "board" ? "gradient-primary text-primary-foreground shadow-glow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Columns3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-3">
              {filteredTasks.map((task) => renderTaskCard(task))}
              {filteredTasks.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No tasks match your filters</p>
                  <p className="text-xs mt-1">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          )}

          {/* Board View (Kanban) */}
          {viewMode === "board" && (
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
                          <p className="text-xs text-muted-foreground">No tasks</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TaskTracker;
