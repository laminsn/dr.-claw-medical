import { useState, useRef, useEffect } from "react";
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

// ── Component ───────────────────────────────────────────────────────────────
const AgentCommandStation = () => {
  const [agents, setAgents] = useState<AgentState[]>(MOCK_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<AgentState>(MOCK_AGENTS[0]);
  const [commandInput, setCommandInput] = useState("");
  const [screenExpanded, setScreenExpanded] = useState(false);
  const [screenRefreshing, setScreenRefreshing] = useState(false);
  const [agentDropOpen, setAgentDropOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedAgent.messages]);

  // Sync selected agent when agents update
  useEffect(() => {
    const updated = agents.find((a) => a.id === selectedAgent.id);
    if (updated) setSelectedAgent(updated);
  }, [agents]);

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

  const agent = selectedAgent;
  const successRate = Math.round((agent.tasksCompleted / (agent.tasksCompleted + agent.tasksFailed)) * 100);

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

        {/* Main layout */}
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
      </main>
    </div>
  );
};

export default AgentCommandStation;
