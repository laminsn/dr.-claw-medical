import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  Send,
  Terminal,
  Eye,
  Activity,
  Cpu,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Maximize2,
  Minimize2,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Radio,
  ChevronDown,
  BarChart3,
  Columns,
  Table2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Fullscreen,
  MonitorPlay,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

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

type SortField = "name" | "model" | "zone" | "active" | "tasksCompleted" | "tasksFailed" | "successRate" | "costToday" | "costMonth" | "tokensUsed" | "avgResponseTime";
type SortDir = "asc" | "desc";
type ViewMode = "command" | "compare";
type CompareMetric = "tasksCompleted" | "tasksFailed" | "successRate" | "costToday" | "costMonth" | "tokensUsed";

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
    costMonth: 87.40,
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
    costMonth: 43.60,
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
    costToday: 0.00,
    costMonth: 21.30,
    avgResponseTime: "3.4s",
    logs: [
      { id: "l1", level: "success", message: "NIH R01 proposal draft completed — $1.2M request", timestamp: "2h ago" },
      { id: "l2", level: "error", message: "NIH grant database API rate limit exceeded", timestamp: "2.5h ago" },
      { id: "l3", level: "info", message: "Research summary: PCORI funding opportunities", timestamp: "3h ago" },
    ],
    messages: [],
  },
];

const ZONE_COLORS = {
  clinical: "text-red-400 bg-red-500/10 border-red-500/30",
  operations: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  external: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

const LOG_LEVEL_STYLES = {
  info: "text-blue-400",
  warn: "text-amber-400",
  error: "text-red-400",
  success: "text-emerald-400",
};

const LOG_LEVEL_ICONS = {
  info: Radio,
  warn: AlertTriangle,
  error: AlertTriangle,
  success: CheckCircle2,
};

// ── Fullscreen task queue mock data ─────────────────────────────────────────
const FULLSCREEN_TASKS = [
  { id: "ft1", label: "Insurance verification #4822", progress: 72 },
  { id: "ft2", label: "Appointment reminder batch (14 patients)", progress: 45 },
  { id: "ft3", label: "Lab result notification — J. Chen", progress: 91 },
  { id: "ft4", label: "Referral processing — Cardiology", progress: 18 },
  { id: "ft5", label: "Patient intake form digitization", progress: 60 },
  { id: "ft6", label: "Campaign A/B test analysis", progress: 33 },
  { id: "ft7", label: "Grant deadline compliance check", progress: 55 },
  { id: "ft8", label: "EHR data reconciliation batch #12", progress: 80 },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
const getSuccessRate = (a: AgentState) =>
  a.tasksCompleted + a.tasksFailed > 0
    ? Math.round((a.tasksCompleted / (a.tasksCompleted + a.tasksFailed)) * 100)
    : 0;

const parseResponseTime = (s: string): number => parseFloat(s.replace("s", ""));

const METRIC_LABELS: Record<CompareMetric, string> = {
  tasksCompleted: "Tasks Completed",
  tasksFailed: "Tasks Failed",
  successRate: "Success Rate (%)",
  costToday: "Cost Today ($)",
  costMonth: "Cost This Month ($)",
  tokensUsed: "Tokens Used",
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// ── Component ───────────────────────────────────────────────────────────────
const AgentCommandStation = () => {
  const [agents, setAgents] = useState<AgentState[]>(MOCK_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<AgentState>(MOCK_AGENTS[0]);
  const [commandInput, setCommandInput] = useState("");
  const [screenExpanded, setScreenExpanded] = useState(false);
  const [screenRefreshing, setScreenRefreshing] = useState(false);
  const [agentDropOpen, setAgentDropOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // New state: view mode, fullscreen, comparison
  const [viewMode, setViewMode] = useState<ViewMode>("command");
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [compareMetric, setCompareMetric] = useState<CompareMetric>("tasksCompleted");

  // Fullscreen live metrics state
  const [fsTasks, setFsTasks] = useState(FULLSCREEN_TASKS.map((t) => ({ ...t })));
  const [fsTick, setFsTick] = useState(0);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedAgent.messages]);

  // Sync selected agent when agents update
  useEffect(() => {
    const updated = agents.find((a) => a.id === selectedAgent.id);
    if (updated) setSelectedAgent(updated);
  }, [agents]);

  // ── Fullscreen auto-refresh every 5 seconds ──────────────────────────────
  useEffect(() => {
    if (!fullscreenMode) return;

    const interval = setInterval(() => {
      setFsTick((t) => t + 1);

      // Fluctuate agent metrics
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

      // Progress the task bars
      setFsTasks((prev) =>
        prev.map((t) => {
          let next = t.progress + Math.floor(Math.random() * 12) + 1;
          if (next >= 100) next = Math.floor(Math.random() * 25) + 5; // reset
          return { ...t, progress: next };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [fullscreenMode]);

  // ── Escape key to exit fullscreen ─────────────────────────────────────────
  useEffect(() => {
    if (!fullscreenMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreenMode(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreenMode]);

  const handleSendCommand = () => {
    const trimmed = commandInput.trim();
    if (!trimmed) return;

    const newMsg: AgentMessage = {
      id: String(Date.now()),
      from: "commander",
      content: trimmed,
      timestamp: "just now",
    };

    // Simulate agent response
    const agentReply: AgentMessage = {
      id: String(Date.now() + 1),
      from: "agent",
      content: generateAgentReply(selectedAgent.name, trimmed),
      timestamp: "just now",
    };

    setAgents((prev) =>
      prev.map((a) =>
        a.id === selectedAgent.id
          ? { ...a, messages: [...a.messages, newMsg, agentReply] }
          : a
      )
    );
    setCommandInput("");
  };

  const generateAgentReply = (agentName: string, cmd: string): string => {
    const lower = cmd.toLowerCase();
    if (lower.includes("status") || lower.includes("what are you"))
      return `Acknowledged. I'm currently ${selectedAgent.currentTask.toLowerCase()}. All systems nominal.`;
    if (lower.includes("pause") || lower.includes("stop"))
      return `Understood. Pausing current task and queuing remaining work. I'll resume when you give the command.`;
    if (lower.includes("priority") || lower.includes("focus"))
      return `Reprioritizing task queue. Bringing high-urgency items to front. Estimated completion of current task: 3 minutes.`;
    if (lower.includes("report") || lower.includes("summary"))
      return `Summary for today: ${selectedAgent.tasksCompleted} tasks completed, ${selectedAgent.tasksFailed} flagged for review. Cost so far: $${selectedAgent.costToday.toFixed(2)}. Avg response: ${selectedAgent.avgResponseTime}.`;
    return `Command received: "${cmd}". Processing and updating task queue accordingly. I'll notify you when complete.`;
  };

  const handleRefreshScreen = () => {
    setScreenRefreshing(true);
    setTimeout(() => setScreenRefreshing(false), 1200);
  };

  // ── Sorting logic for comparison table ────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const getSortedAgents = useCallback((): AgentState[] => {
    const sorted = [...agents].sort((a, b) => {
      let valA: number | string;
      let valB: number | string;

      switch (sortField) {
        case "name":
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case "model":
          valA = a.model.toLowerCase();
          valB = b.model.toLowerCase();
          break;
        case "zone":
          valA = a.zone;
          valB = b.zone;
          break;
        case "active":
          valA = a.active ? 1 : 0;
          valB = b.active ? 1 : 0;
          break;
        case "tasksCompleted":
          valA = a.tasksCompleted;
          valB = b.tasksCompleted;
          break;
        case "tasksFailed":
          valA = a.tasksFailed;
          valB = b.tasksFailed;
          break;
        case "successRate":
          valA = getSuccessRate(a);
          valB = getSuccessRate(b);
          break;
        case "costToday":
          valA = a.costToday;
          valB = b.costToday;
          break;
        case "costMonth":
          valA = a.costMonth;
          valB = b.costMonth;
          break;
        case "tokensUsed":
          valA = a.tokensUsed;
          valB = b.tokensUsed;
          break;
        case "avgResponseTime":
          valA = parseResponseTime(a.avgResponseTime);
          valB = parseResponseTime(b.avgResponseTime);
          break;
        default:
          valA = a.name;
          valB = b.name;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [agents, sortField, sortDir]);

  const getMetricValue = (a: AgentState, metric: CompareMetric): number => {
    switch (metric) {
      case "tasksCompleted":
        return a.tasksCompleted;
      case "tasksFailed":
        return a.tasksFailed;
      case "successRate":
        return getSuccessRate(a);
      case "costToday":
        return a.costToday;
      case "costMonth":
        return a.costMonth;
      case "tokensUsed":
        return a.tokensUsed;
      default:
        return 0;
    }
  };

  const getPerformanceColor = (rate: number): string => {
    if (rate >= 95) return "text-emerald-400";
    if (rate >= 80) return "text-amber-400";
    return "text-red-400";
  };

  const getPerformanceBg = (rate: number): string => {
    if (rate >= 95) return "bg-emerald-500";
    if (rate >= 80) return "bg-amber-500";
    return "bg-red-500";
  };

  const agent = selectedAgent;
  const successRate = getSuccessRate(agent);

  // ── Sort header helper ────────────────────────────────────────────────────
  const SortHeader = ({ field, label, className = "" }: { field: SortField; label: string; className?: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      {label}
      {sortField === field ? (
        sortDir === "asc" ? (
          <ArrowUp className="h-3 w-3 text-primary" />
        ) : (
          <ArrowDown className="h-3 w-3 text-primary" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-40" />
      )}
    </button>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // ── FULLSCREEN MODE ───────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  if (fullscreenMode) {
    const totalTokens = agents.reduce((s, a) => s + a.tokensUsed, 0);
    const totalCost = agents.reduce((s, a) => s + a.costToday, 0);
    const totalTasks = agents.reduce((s, a) => s + a.tasksCompleted, 0);

    return (
      <div className="fixed inset-0 z-[9999] bg-black text-green-400 font-mono overflow-auto flex flex-col">
        {/* Fullscreen header bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-green-900/60 bg-black/95 shrink-0">
          <div className="flex items-center gap-4">
            <MonitorPlay className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-bold tracking-widest text-cyan-400 uppercase">Agent Screen</span>
            <span className="text-xs text-green-600 animate-pulse">LIVE</span>
            <span className="text-xs text-green-700">Tick #{fsTick}</span>
          </div>
          <div className="flex items-center gap-6">
            {/* Global counters */}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFullscreenMode(false)}
              className="border-green-800 text-green-400 bg-transparent hover:bg-green-950 hover:text-green-300 text-xs gap-1"
            >
              <Minimize2 className="h-3.5 w-3.5" />
              Exit (Esc)
            </Button>
          </div>
        </div>

        {/* Agent grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 overflow-auto">
          {agents.map((ag) => {
            const sr = getSuccessRate(ag);
            const agTasks = fsTasks.slice(0, ag.active ? 3 : 1);
            return (
              <div key={ag.id} className="border border-green-900/40 p-4 flex flex-col gap-3 relative overflow-hidden">
                {/* Agent header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      {ag.active && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      )}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${ag.active ? "bg-green-500" : "bg-gray-600"}`} />
                    </span>
                    <span className="text-sm font-bold text-cyan-400">{ag.name}</span>
                    <span className="text-[10px] text-green-700">{ag.model}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${ag.active ? "border-green-700 text-green-400 bg-green-950/50" : "border-gray-700 text-gray-500 bg-gray-900/50"}`}>
                    {ag.active ? "ONLINE" : "OFFLINE"}
                  </span>
                </div>

                {/* Current task */}
                <p className="text-xs text-green-500/80 leading-relaxed">&gt; {ag.currentTask}</p>

                {/* CPU / Memory gauges */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-green-700 flex items-center gap-1"><Cpu className="h-3 w-3" /> CPU</span>
                      <span className="text-[10px] text-green-400 tabular-nums">{ag.cpu}%</span>
                    </div>
                    <div className="h-2 rounded bg-green-950 overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-1000 ease-in-out ${ag.cpu > 75 ? "bg-red-500" : ag.cpu > 50 ? "bg-amber-500" : "bg-green-500"}`}
                        style={{ width: `${ag.cpu}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-green-700 flex items-center gap-1"><Activity className="h-3 w-3" /> MEM</span>
                      <span className="text-[10px] text-green-400 tabular-nums">{ag.memory}%</span>
                    </div>
                    <div className="h-2 rounded bg-green-950 overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-1000 ease-in-out ${ag.memory > 75 ? "bg-red-500" : ag.memory > 50 ? "bg-amber-500" : "bg-cyan-500"}`}
                        style={{ width: `${ag.memory}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stats row */}
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

                {/* Token / cost counters animated */}
                <div className="flex items-center justify-between text-[10px] border-t border-green-900/40 pt-2">
                  <span className="text-green-700 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span className="text-green-400 tabular-nums transition-all duration-700">{ag.tokensUsed.toLocaleString()}</span> tokens
                  </span>
                  <span className="text-green-700">
                    Uptime: <span className="text-green-400">{ag.uptime}</span>
                  </span>
                </div>

                {/* Task progress bars */}
                {ag.active && (
                  <div className="space-y-1.5 border-t border-green-900/40 pt-2">
                    <p className="text-[10px] text-green-700 uppercase tracking-wider">Task Queue</p>
                    {agTasks.map((t, i) => (
                      <div key={t.id + "-" + ag.id + "-" + i} className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-green-600 truncate max-w-[70%]">{t.label}</span>
                          <span className="text-[10px] text-green-400 tabular-nums">{t.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded bg-green-950 overflow-hidden">
                          <div
                            className="h-full rounded bg-gradient-to-r from-green-600 to-cyan-500 transition-all duration-1000 ease-in-out"
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recent logs */}
                <div className="space-y-1 border-t border-green-900/40 pt-2 max-h-[100px] overflow-y-auto">
                  <p className="text-[10px] text-green-700 uppercase tracking-wider">Recent Activity</p>
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

        {/* Fullscreen footer */}
        <div className="shrink-0 flex items-center justify-between px-6 py-2 border-t border-green-900/60 bg-black/95 text-[10px] text-green-700">
          <span>Auto-refresh: 5s | Press ESC to exit</span>
          <span className="text-green-600">{new Date().toLocaleTimeString()} | {agents.filter((a) => a.active).length}/{agents.length} agents online</span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ── COMPARISON VIEW ───────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const renderCompareView = () => {
    const sorted = getSortedAgents();
    const maxMetricVal = Math.max(...agents.map((a) => getMetricValue(a, compareMetric)), 1);

    // Totals / averages
    const totalCompleted = agents.reduce((s, a) => s + a.tasksCompleted, 0);
    const totalFailed = agents.reduce((s, a) => s + a.tasksFailed, 0);
    const avgSuccessRate = agents.length > 0 ? Math.round(agents.reduce((s, a) => s + getSuccessRate(a), 0) / agents.length) : 0;
    const totalCostToday = agents.reduce((s, a) => s + a.costToday, 0);
    const totalCostMonth = agents.reduce((s, a) => s + a.costMonth, 0);
    const totalTokens = agents.reduce((s, a) => s + a.tokensUsed, 0);
    const avgResponseTime = agents.length > 0
      ? (agents.reduce((s, a) => s + parseResponseTime(a.avgResponseTime), 0) / agents.length).toFixed(1) + "s"
      : "0s";

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Comparison table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-4 py-3 text-left"><SortHeader field="name" label="Agent" /></th>
                  <th className="px-4 py-3 text-left"><SortHeader field="model" label="Model" /></th>
                  <th className="px-4 py-3 text-left"><SortHeader field="zone" label="Zone" /></th>
                  <th className="px-4 py-3 text-center"><SortHeader field="active" label="Status" className="justify-center" /></th>
                  <th className="px-4 py-3 text-right"><SortHeader field="tasksCompleted" label="Completed" className="justify-end" /></th>
                  <th className="px-4 py-3 text-right"><SortHeader field="tasksFailed" label="Failed" className="justify-end" /></th>
                  <th className="px-4 py-3 text-right"><SortHeader field="successRate" label="Success %" className="justify-end" /></th>
                  <th className="px-4 py-3 text-right"><SortHeader field="costToday" label="Cost Today" className="justify-end" /></th>
                  <th className="px-4 py-3 text-right"><SortHeader field="costMonth" label="Cost Month" className="justify-end" /></th>
                  <th className="px-4 py-3 text-right"><SortHeader field="tokensUsed" label="Tokens" className="justify-end" /></th>
                  <th className="px-4 py-3 text-right"><SortHeader field="avgResponseTime" label="Avg Time" className="justify-end" /></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((a) => {
                  const sr = getSuccessRate(a);
                  return (
                    <tr key={a.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold text-foreground">{a.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{a.model}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-[10px] ${ZONE_COLORS[a.zone]}`}>{a.zone}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${a.active ? "text-emerald-400" : "text-muted-foreground"}`}>
                          <span className={`h-2 w-2 rounded-full ${a.active ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                          {a.active ? "Active" : "Idle"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground tabular-nums">{a.tasksCompleted.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={a.tasksFailed > 5 ? "text-red-400 font-medium" : "text-muted-foreground"}>{a.tasksFailed}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold tabular-nums ${getPerformanceColor(sr)}`}>{sr}%</span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground tabular-nums">${a.costToday.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium text-foreground tabular-nums">${a.costMonth.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{(a.tokensUsed / 1000).toFixed(1)}k</td>
                      <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{a.avgResponseTime}</td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Summary row */}
              <tfoot>
                <tr className="bg-muted/30 border-t-2 border-border font-semibold">
                  <td className="px-4 py-3 text-foreground" colSpan={2}>
                    <span className="flex items-center gap-1.5">
                      <Table2 className="h-4 w-4 text-primary" />
                      Totals / Averages
                    </span>
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground">{agents.filter((a) => a.active).length} active</td>
                  <td className="px-4 py-3 text-right text-foreground tabular-nums">{totalCompleted.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className={totalFailed > 15 ? "text-red-400" : "text-muted-foreground"}>{totalFailed}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold tabular-nums ${getPerformanceColor(avgSuccessRate)}`}>{avgSuccessRate}% avg</span>
                  </td>
                  <td className="px-4 py-3 text-right text-foreground tabular-nums">${totalCostToday.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-foreground tabular-nums">${totalCostMonth.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{(totalTokens / 1000).toFixed(1)}k</td>
                  <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">{avgResponseTime}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bar chart visualization */}
          <div className="mt-6 rounded-xl border border-border p-5 bg-card/50">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Agent Comparison</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground mr-1">Metric:</span>
                {(Object.keys(METRIC_LABELS) as CompareMetric[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setCompareMetric(m)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors ${
                      compareMetric === m
                        ? "bg-primary/20 text-primary font-semibold border border-primary/30"
                        : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {METRIC_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>

            {/* CSS bar chart */}
            <div className="space-y-3">
              {agents.map((a) => {
                const val = getMetricValue(a, compareMetric);
                const pct = maxMetricVal > 0 ? (val / maxMetricVal) * 100 : 0;
                const sr = getSuccessRate(a);
                const barColor = compareMetric === "successRate"
                  ? getPerformanceBg(sr)
                  : compareMetric === "tasksFailed"
                    ? a.tasksFailed > 5 ? "bg-red-500" : "bg-amber-500"
                    : "bg-primary";

                let displayVal: string;
                if (compareMetric === "costToday" || compareMetric === "costMonth") {
                  displayVal = `$${val.toFixed(2)}`;
                } else if (compareMetric === "successRate") {
                  displayVal = `${val}%`;
                } else if (compareMetric === "tokensUsed") {
                  displayVal = `${(val / 1000).toFixed(1)}k`;
                } else {
                  displayVal = val.toLocaleString();
                }

                return (
                  <div key={a.id} className="flex items-center gap-3">
                    <div className="w-32 shrink-0 text-right">
                      <span className="text-xs font-medium text-foreground">{a.name}</span>
                    </div>
                    <div className="flex-1 h-7 rounded-lg bg-muted/30 overflow-hidden relative">
                      <div
                        className={`h-full rounded-lg ${barColor} transition-all duration-500 ease-out`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                      <span className="absolute inset-y-0 right-2 flex items-center text-xs font-bold text-foreground tabular-nums">
                        {displayVal}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ── NORMAL (COMMAND) VIEW ─────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading gradient-hero-text">Command Station</h1>
              <p className="text-muted-foreground mt-1">Communicate with agents, issue instructions, and monitor activity in real time</p>
            </div>

            <div className="flex items-center gap-3">
              {/* View toggle: Command | Compare */}
              <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setViewMode("command")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors ${
                    viewMode === "command"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Terminal className="h-4 w-4" />
                  Command
                </button>
                <button
                  onClick={() => setViewMode("compare")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors ${
                    viewMode === "compare"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Columns className="h-4 w-4" />
                  Compare
                </button>
              </div>

              {/* Fullscreen button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullscreenMode(true)}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Fullscreen className="h-4 w-4" />
                Agent Screen
              </Button>

              {/* Agent selector */}
              <div className="relative">
                <button
                  onClick={() => setAgentDropOpen((p) => !p)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors"
                >
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    {agent.active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${agent.active ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                  </span>
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm text-foreground">{agent.name}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {agentDropOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                    {agents.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => { setSelectedAgent(a); setAgentDropOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left ${a.id === agent.id ? "bg-primary/10" : ""}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${a.active ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{a.name}</p>
                          <p className="text-xs text-muted-foreground">{a.model}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── COMPARE VIEW ─────────────────────────────────────────────── */}
        {viewMode === "compare" && renderCompareView()}

        {/* ── COMMAND VIEW (original layout) ───────────────────────────── */}
        {viewMode === "command" && (
          <div className="flex flex-1 overflow-hidden">
            {/* Left: Command panel */}
            <div className="flex flex-col w-[420px] shrink-0 border-r border-border overflow-hidden">
              {/* Agent quick stats */}
              <div className="p-5 border-b border-border bg-card/40 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${agent.active ? "gradient-primary" : "bg-muted"}`}>
                    <Bot className={`h-4 w-4 ${agent.active ? "text-white" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{agent.name}</p>
                    <Badge variant="outline" className={`text-[10px] ${ZONE_COLORS[agent.zone]}`}>{agent.zone} zone</Badge>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 leading-relaxed">{agent.currentTask}</p>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Success Rate", value: `${successRate}%`, icon: TrendingUp, color: "text-emerald-400" },
                    { label: "Tasks Done", value: agent.tasksCompleted.toLocaleString(), icon: CheckCircle2, color: "text-primary" },
                    { label: "Avg Speed", value: agent.avgResponseTime, icon: Clock, color: "text-cyan-400" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-muted/30 p-2 text-center">
                      <s.icon className={`h-3.5 w-3.5 mx-auto mb-1 ${s.color}`} />
                      <p className="text-xs font-bold text-foreground">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Resource usage */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Cpu className="h-3 w-3" /> CPU</span>
                    <span className="text-[11px] font-medium text-foreground">{agent.cpu}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${agent.cpu}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Activity className="h-3 w-3" /> Memory</span>
                    <span className="text-[11px] font-medium text-foreground">{agent.memory}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-cyan-500/60 transition-all" style={{ width: `${agent.memory}%` }} />
                  </div>
                </div>

                {/* Cost meter */}
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-400">Usage Cost</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Today</span>
                    <span className="text-sm font-bold text-foreground">${agent.costToday.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">This Month</span>
                    <span className="text-sm font-bold text-foreground">${agent.costMonth.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Tokens Used</span>
                    <span className="text-[11px] font-medium text-foreground">{(agent.tokensUsed / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {agent.messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">Send a command to {agent.name}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">e.g. "Give me a status report"</p>
                  </div>
                )}
                {agent.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.from === "commander" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.from === "commander"
                          ? "gradient-primary text-white rounded-br-sm"
                          : "bg-card border border-border text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.from === "agent" && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <Bot className="h-3 w-3 text-primary" />
                          <span className="text-[10px] font-semibold text-primary">{agent.name}</span>
                        </div>
                      )}
                      <p>{msg.content}</p>
                      <p className="text-[10px] opacity-60 mt-1 text-right">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Command input */}
              <div className="p-4 border-t border-border bg-card/60">
                <div className="flex gap-2">
                  <Textarea
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendCommand(); } }}
                    placeholder={`Command ${agent.name}...`}
                    className="resize-none text-sm h-[68px] bg-background border-border"
                  />
                  <Button
                    onClick={handleSendCommand}
                    disabled={!commandInput.trim()}
                    className="gradient-primary text-white h-auto px-3 self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {["Status report", "Pause task", "Prioritize urgent", "Clear queue"].map((quick) => (
                    <button
                      key={quick}
                      onClick={() => { setCommandInput(quick); }}
                      className="text-[10px] px-2 py-1 rounded-md bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {quick}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Agent screen + logs */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Agent "screen" viewer */}
              <div className={`border-b border-border ${screenExpanded ? "flex-1" : "h-64"} bg-black/90 flex flex-col transition-all duration-300`}>
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-400">Live Agent View — {agent.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${agent.active ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-muted/30 text-muted-foreground bg-muted/10"}`}>
                      {agent.active ? "● LIVE" : "○ OFFLINE"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleRefreshScreen} className="text-white/40 hover:text-white/80 transition-colors">
                      <RefreshCw className={`h-3.5 w-3.5 ${screenRefreshing ? "animate-spin" : ""}`} />
                    </button>
                    <button onClick={() => setScreenExpanded((p) => !p)} className="text-white/40 hover:text-white/80 transition-colors">
                      {screenExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Simulated agent terminal screen */}
                <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1.5">
                  <p className="text-white/30">─── {agent.name} ─── {agent.model} ─── {new Date().toLocaleTimeString()} ───</p>
                  {agent.active ? (
                    <>
                      <p className="text-emerald-400">▶ {agent.currentTask}</p>
                      <p className="text-white/50">  → Connecting to external APIs...</p>
                      <p className="text-white/50">  → Auth token validated ✓</p>
                      <p className="text-cyan-400">  → Awaiting API response (1.4s elapsed)</p>
                      <p className="text-white/30 mt-2">── Task Queue ({Math.ceil(agent.tasksCompleted * 0.03)} pending) ──</p>
                      {[
                        "Insurance verification #4822",
                        "Appointment reminder batch (14 patients)",
                        "Lab result notification — J. Chen",
                      ].map((task, i) => (
                        <p key={i} className="text-white/40">  {i + 1}. {task}</p>
                      ))}
                      <p className="text-white/30 mt-2">── Memory Context ──</p>
                      <p className="text-white/40">  Active sessions: 3 | Context window: 12,400 tokens</p>
                      <p className="text-white/40">  PHI scrubbed: Yes | Zone: {agent.zone.toUpperCase()}</p>
                      <p className="text-amber-400 mt-2">  ⚡ {agent.tokensUsed.toLocaleString()} tokens used today · ${agent.costToday.toFixed(2)} cost</p>
                    </>
                  ) : (
                    <>
                      <p className="text-white/40">▷ Agent is offline — last active 2h ago</p>
                      <p className="text-white/30">  Context preserved. Tasks queued: 0</p>
                      <p className="text-white/30">  Send a command to wake this agent.</p>
                    </>
                  )}
                  <p className="text-white/20 animate-pulse mt-3">█</p>
                </div>
              </div>

              {/* Activity log */}
              {!screenExpanded && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="px-5 py-3 border-b border-border flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Activity Log</span>
                    <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">{agent.logs.length} events</Badge>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {agent.logs.map((log) => {
                      const Icon = LOG_LEVEL_ICONS[log.level];
                      return (
                        <div key={log.id} className="flex items-start gap-3 text-xs">
                          <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${LOG_LEVEL_STYLES[log.level]}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground/80 leading-snug">{log.message}</p>
                            <p className="text-muted-foreground/50 text-[10px] mt-0.5">{log.timestamp}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgentCommandStation;
