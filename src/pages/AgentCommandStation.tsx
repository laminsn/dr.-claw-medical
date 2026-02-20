import { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  BackgroundVariant,
  Panel,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
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
  LayoutGrid,
  Rows3,
  PanelLeftClose,
  PanelLeftOpen,
  Workflow,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import AgentNodeComponent, {
  type AgentNodeData,
} from "@/components/command-station/AgentNode";
import CommandPanelNodeComponent, {
  type CommandPanelNodeData,
} from "@/components/command-station/CommandPanelNode";
import MetricsPanelNodeComponent, {
  type MetricsPanelNodeData,
} from "@/components/command-station/MetricsPanelNode";
import LogsPanelNodeComponent, {
  type LogsPanelNodeData,
} from "@/components/command-station/LogsPanelNode";

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

type ViewMode = "canvas" | "split" | "fullscreen";

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

// ── Helpers ─────────────────────────────────────────────────────────────────
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const generateAgentReply = (agent: AgentState, cmd: string): string => {
  const lower = cmd.toLowerCase();
  if (lower.includes("status") || lower.includes("what are you"))
    return `Acknowledged. I'm currently ${agent.currentTask.toLowerCase()}. All systems nominal.`;
  if (lower.includes("pause") || lower.includes("stop"))
    return `Understood. Pausing current task and queuing remaining work. I'll resume when you give the command.`;
  if (lower.includes("priority") || lower.includes("focus"))
    return `Reprioritizing task queue. Bringing high-urgency items to front. Estimated completion of current task: 3 minutes.`;
  if (lower.includes("report") || lower.includes("summary"))
    return `Summary for today: ${agent.tasksCompleted} tasks completed, ${agent.tasksFailed} flagged for review. Cost so far: $${agent.costToday.toFixed(2)}. Avg response: ${agent.avgResponseTime}.`;
  return `Command received: "${cmd}". Processing and updating task queue accordingly. I'll notify you when complete.`;
};

// ── Node Types ──────────────────────────────────────────────────────────────
const nodeTypes: NodeTypes = {
  agentNode: AgentNodeComponent,
  commandPanel: CommandPanelNodeComponent,
  metricsPanel: MetricsPanelNodeComponent,
  logsPanel: LogsPanelNodeComponent,
};

// ── Canvas Layout Positions ─────────────────────────────────────────────────
function buildNodesAndEdges(
  agents: AgentState[],
  selectedAgentId: string,
  onSelectAgent: (id: string) => void,
  onSendCommand: (agentId: string, cmd: string) => void
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Place agent nodes in a column
  agents.forEach((agent, i) => {
    nodes.push({
      id: `agent-${agent.id}`,
      type: "agentNode",
      position: { x: 80, y: i * 380 },
      data: {
        ...agent,
        onSelect: (nid: string) => {
          const aid = nid.replace("agent-", "");
          onSelectAgent(aid);
        },
      } satisfies AgentNodeData,
    });
  });

  // Metrics panel (top right)
  nodes.push({
    id: "metrics-panel",
    type: "metricsPanel",
    position: { x: 500, y: 0 },
    data: {
      agents: agents.map((a) => ({
        id: a.id,
        name: a.name,
        active: a.active,
        tasksCompleted: a.tasksCompleted,
        tasksFailed: a.tasksFailed,
        tokensUsed: a.tokensUsed,
        costToday: a.costToday,
        costMonth: a.costMonth,
        zone: a.zone,
      })),
    } satisfies MetricsPanelNodeData,
  });

  // Command panel (middle right)
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];
  nodes.push({
    id: "command-panel",
    type: "commandPanel",
    position: { x: 500, y: 380 },
    data: {
      agentName: selectedAgent.name,
      agentId: selectedAgent.id,
      messages: selectedAgent.messages,
      onSendCommand,
    } satisfies CommandPanelNodeData,
  });

  // Logs panel (bottom right)
  nodes.push({
    id: "logs-panel",
    type: "logsPanel",
    position: { x: 920, y: 200 },
    data: {
      agentName: selectedAgent.name,
      logs: selectedAgent.logs,
    } satisfies LogsPanelNodeData,
  });

  // Edges from selected agent to command panel
  edges.push({
    id: `edge-agent-cmd`,
    source: `agent-${selectedAgentId}`,
    target: "command-panel",
    sourceHandle: "right",
    targetHandle: undefined,
    animated: true,
    style: { stroke: "rgb(6, 182, 212)", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgb(6, 182, 212)" },
  });

  // Edges from selected agent to logs panel
  edges.push({
    id: `edge-agent-logs`,
    source: `agent-${selectedAgentId}`,
    target: "logs-panel",
    animated: true,
    style: { stroke: "rgb(16, 185, 129)", strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgb(16, 185, 129)" },
  });

  // Edges from all agents to metrics
  agents.forEach((agent) => {
    edges.push({
      id: `edge-metrics-${agent.id}`,
      source: `agent-${agent.id}`,
      target: "metrics-panel",
      sourceHandle: "right",
      targetHandle: undefined,
      style: {
        stroke: "rgba(139, 92, 246, 0.3)",
        strokeWidth: 1,
        strokeDasharray: "5,5",
      },
    });
  });

  // Connection edges between agents (data flow)
  for (let i = 0; i < agents.length - 1; i++) {
    edges.push({
      id: `edge-flow-${agents[i].id}-${agents[i + 1].id}`,
      source: `agent-${agents[i].id}`,
      target: `agent-${agents[i + 1].id}`,
      style: { stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 },
      animated: false,
    });
  }

  return { nodes, edges };
}

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
  const [selectedAgentId, setSelectedAgentId] = useState("1");
  const [viewMode, setViewMode] = useState<ViewMode>("canvas");
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Multi-screen state
  const [splitScreenIds, setSplitScreenIds] = useState<string[]>(["1", "2"]);

  // Fullscreen live state
  const [fsTasks, setFsTasks] = useState(FULLSCREEN_TASKS.map((t) => ({ ...t })));
  const [fsTick, setFsTick] = useState(0);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0];

  // ── Send command handler ────────────────────────────────────────────────
  const handleSendCommand = useCallback(
    (agentId: string, command: string) => {
      const agent = agents.find((a) => a.id === agentId);
      if (!agent) return;

      const newMsg: AgentMessage = {
        id: String(Date.now()),
        from: "commander",
        content: command,
        timestamp: "just now",
      };

      const agentReply: AgentMessage = {
        id: String(Date.now() + 1),
        from: "agent",
        content: generateAgentReply(agent, command),
        timestamp: "just now",
      };

      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId
            ? { ...a, messages: [...a.messages, newMsg, agentReply] }
            : a
        )
      );
    },
    [agents]
  );

  // ── Build React Flow graph ──────────────────────────────────────────────
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () =>
      buildNodesAndEdges(agents, selectedAgentId, setSelectedAgentId, handleSendCommand),
    [agents, selectedAgentId, handleSendCommand]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes/edges when agents or selection changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildNodesAndEdges(
      agents,
      selectedAgentId,
      setSelectedAgentId,
      handleSendCommand
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [agents, selectedAgentId, handleSendCommand, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

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

  // ── Canvas auto-refresh (gentle metric fluctuation) ─────────────────────
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
  // ── MAIN CANVAS VIEW ────────────────────────────────────────────────────
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
                  onClick={() => setViewMode("canvas")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors ${
                    viewMode === "canvas"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Workflow className="h-4 w-4" />
                  Canvas
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

              {/* Agent selector for canvas mode */}
              {viewMode === "canvas" && (
                <div className="flex items-center gap-2">
                  {agents.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAgentId(a.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                        selectedAgentId === a.id
                          ? "border-primary/40 bg-primary/10"
                          : "border-border bg-card hover:border-primary/20"
                      }`}
                    >
                      <span className="relative flex h-2 w-2">
                        {a.active && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${
                            a.active ? "bg-green-500" : "bg-muted-foreground/40"
                          }`}
                        />
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          selectedAgentId === a.id
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {a.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SPLIT VIEW ─────────────────────────────────────────── */}
        {viewMode === "split" && renderSplitScreen()}

        {/* ── CANVAS VIEW ────────────────────────────────────────── */}
        {viewMode === "canvas" && (
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.3}
              maxZoom={1.5}
              defaultEdgeOptions={{
                type: "smoothstep",
                animated: false,
              }}
              proOptions={{ hideAttribution: true }}
              className="command-station-flow"
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                color="rgba(100, 150, 255, 0.08)"
              />
              <Controls
                className="!bg-card/80 !border-border !rounded-xl !shadow-lg"
                showInteractive={false}
              />
              <MiniMap
                nodeStrokeColor={(n) => {
                  if (n.type === "agentNode") {
                    const d = n.data as AgentNodeData;
                    if (d.zone === "clinical") return "#ef4444";
                    if (d.zone === "operations") return "#f59e0b";
                    return "#3b82f6";
                  }
                  if (n.type === "commandPanel") return "#06b6d4";
                  if (n.type === "metricsPanel") return "#8b5cf6";
                  if (n.type === "logsPanel") return "#10b981";
                  return "#666";
                }}
                nodeColor={(n) => {
                  if (n.type === "agentNode") {
                    const d = n.data as AgentNodeData;
                    if (d.zone === "clinical") return "rgba(239,68,68,0.2)";
                    if (d.zone === "operations") return "rgba(245,158,11,0.2)";
                    return "rgba(59,130,246,0.2)";
                  }
                  return "rgba(100,100,100,0.2)";
                }}
                maskColor="rgba(0,0,0,0.7)"
                className="!bg-card/80 !border-border !rounded-xl"
              />

              {/* Floating status panel */}
              <Panel position="top-right" className="mr-4 mt-4">
                <div className="bg-card/90 backdrop-blur-xl border border-border rounded-xl p-3 space-y-2 min-w-[180px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      Fleet Status
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-1.5 rounded bg-muted/30">
                      <p className="text-xs font-bold text-emerald-400">
                        {agents.filter((a) => a.active).length}
                      </p>
                      <p className="text-[9px] text-muted-foreground">Online</p>
                    </div>
                    <div className="text-center p-1.5 rounded bg-muted/30">
                      <p className="text-xs font-bold text-muted-foreground">
                        {agents.filter((a) => !a.active).length}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        Offline
                      </p>
                    </div>
                    <div className="text-center p-1.5 rounded bg-muted/30">
                      <p className="text-xs font-bold text-amber-400 tabular-nums">
                        $
                        {agents
                          .reduce((s, a) => s + a.costToday, 0)
                          .toFixed(2)}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        Cost Today
                      </p>
                    </div>
                    <div className="text-center p-1.5 rounded bg-muted/30">
                      <p className="text-xs font-bold text-cyan-400 tabular-nums">
                        {(
                          agents.reduce((s, a) => s + a.tokensUsed, 0) / 1000
                        ).toFixed(0)}
                        k
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        Tokens
                      </p>
                    </div>
                  </div>
                </div>
              </Panel>
            </ReactFlow>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgentCommandStation;
