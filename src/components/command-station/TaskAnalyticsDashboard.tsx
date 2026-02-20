import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts";
import { isPast, parseISO, isToday, subDays, format, eachDayOfInterval } from "date-fns";
import { KanbanTask } from "@/hooks/useKanbanTasks";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  Cpu,
  Activity,
  Bot,
  Timer,
  Target,
  Gauge,
} from "lucide-react";

// ── Agent type for performance metrics ──────────────────────────────────────
interface AgentData {
  id: string;
  name: string;
  model: string;
  zone: "clinical" | "operations" | "external";
  active: boolean;
  tasksCompleted: number;
  tasksFailed: number;
  cpu: number;
  memory: number;
  tokensUsed: number;
  costToday: number;
  costMonth: number;
  avgResponseTime: string;
  uptime: string;
}

// ── Shared tooltip style ────────────────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: "hsl(220, 18%, 9%)",
  border: "1px solid hsl(220, 15%, 16%)",
  borderRadius: "10px",
  color: "hsl(220, 10%, 93%)",
  fontSize: "12px",
  padding: "8px 12px",
};

const COLUMN_COLORS: Record<string, string> = {
  backlog: "hsl(215, 15%, 45%)",
  todo: "hsl(217, 91%, 65%)",
  in_progress: "hsl(38, 92%, 60%)",
  review: "hsl(271, 91%, 70%)",
  done: "hsl(142, 71%, 50%)",
};

const COLUMN_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "hsl(0, 72%, 58%)",
  medium: "hsl(38, 92%, 60%)",
  low: "hsl(215, 15%, 55%)",
};

const ZONE_COLORS: Record<string, string> = {
  clinical: "hsl(0, 72%, 58%)",
  operations: "hsl(38, 92%, 60%)",
  external: "hsl(217, 91%, 65%)",
};

const AGENT_COLORS = [
  "hsl(0, 72%, 58%)",
  "hsl(217, 91%, 65%)",
  "hsl(38, 92%, 60%)",
  "hsl(142, 71%, 50%)",
  "hsl(271, 91%, 70%)",
];

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 p-5 flex items-center gap-4">
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 [&_svg]:text-[var(--icon-color)]"
        style={{ background: `${color}20`, ["--icon-color" as string]: color }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground leading-tight">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/50 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-[10px] text-muted-foreground/50 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function TaskAnalyticsDashboard({ tasks, agents = [] }: { tasks: KanbanTask[]; agents?: AgentData[] }) {
  // ── Derived data ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = tasks.filter((t) => !t.is_archived).length;
    const done = tasks.filter((t) => t.column_id === "done").length;
    const overdue = tasks.filter(
      (t) => !t.is_archived && t.column_id !== "done" && t.due_date && isPast(parseISO(t.due_date))
    ).length;
    const dueToday = tasks.filter(
      (t) => !t.is_archived && t.due_date && isToday(parseISO(t.due_date))
    ).length;
    const recurring = tasks.filter((t) => !t.is_archived && t.is_recurring).length;
    const saved = tasks.filter((t) => !t.is_archived && t.is_saved).length;
    return { total, done, overdue, dueToday, recurring, saved };
  }, [tasks]);

  // Tasks by column (pie)
  const byColumn = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.filter((t) => !t.is_archived).forEach((t) => {
      counts[t.column_id] = (counts[t.column_id] ?? 0) + 1;
    });
    return Object.entries(counts).map(([col, count]) => ({
      name: COLUMN_LABELS[col] ?? col,
      value: count,
      color: COLUMN_COLORS[col] ?? "hsl(220,12%,40%)",
    }));
  }, [tasks]);

  // Tasks by priority (bar)
  const byPriority = useMemo(() => {
    const counts: Record<string, number> = { high: 0, medium: 0, low: 0 };
    tasks.filter((t) => !t.is_archived).forEach((t) => {
      if (t.priority in counts) counts[t.priority]++;
    });
    return Object.entries(counts).map(([p, count]) => ({ priority: p.charAt(0).toUpperCase() + p.slice(1), count, color: PRIORITY_COLORS[p] }));
  }, [tasks]);

  // Agent workload (horizontal bar)
  const AGENT_NAMES: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = {};
    agents.forEach((a) => { map[a.id] = a.name; });
    return map;
  }, [agents]);

  const byAgent = useMemo(() => {
    const agentMap: Record<string, { id: string; total: number; done: number; overdue: number }> = {};
    tasks.filter((t) => !t.is_archived).forEach((t) => {
      if (!agentMap[t.agent_id]) agentMap[t.agent_id] = { id: t.agent_id, total: 0, done: 0, overdue: 0 };
      agentMap[t.agent_id].total++;
      if (t.column_id === "done") agentMap[t.agent_id].done++;
      if (t.column_id !== "done" && t.due_date && isPast(parseISO(t.due_date))) agentMap[t.agent_id].overdue++;
    });
    return Object.values(agentMap).map((a) => ({
      agent: AGENT_NAMES[a.id] ?? `Agent ${a.id}`,
      total: a.total,
      done: a.done,
      overdue: a.overdue,
      active: a.total - a.done,
    })).sort((a, b) => b.total - a.total);
  }, [tasks, AGENT_NAMES]);

  // Overdue rate over last 14 days (line / area)
  const overdueOverTime = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() });
    return days.map((day) => {
      const dayStr = format(day, "MMM d");
      const overdueOnDay = tasks.filter(
        (t) =>
          !t.is_archived &&
          t.column_id !== "done" &&
          t.due_date &&
          isPast(parseISO(t.due_date)) &&
          new Date(t.created_at) <= day
      ).length;
      const totalOnDay = tasks.filter((t) => !t.is_archived && new Date(t.created_at) <= day).length;
      const rate = totalOnDay > 0 ? Math.round((overdueOnDay / totalOnDay) * 100) : 0;
      return { day: dayStr, overdue: overdueOnDay, rate };
    });
  }, [tasks]);

  // Zone distribution (pie)
  const byZone = useMemo(() => {
    const counts: Record<string, number> = { clinical: 0, operations: 0, external: 0 };
    tasks.filter((t) => !t.is_archived).forEach((t) => {
      if (t.zone in counts) counts[t.zone]++;
    });
    return Object.entries(counts).map(([z, count]) => ({
      name: z.charAt(0).toUpperCase() + z.slice(1),
      value: count,
      color: ZONE_COLORS[z],
    }));
  }, [tasks]);

  // ── Agent Performance Metrics ────────────────────────────────────────────
  const agentPerformance = useMemo(() => {
    return agents.map((a) => {
      const sr = a.tasksCompleted + a.tasksFailed > 0
        ? Math.round((a.tasksCompleted / (a.tasksCompleted + a.tasksFailed)) * 100)
        : 100;
      const respTime = parseFloat(a.avgResponseTime);
      return {
        name: a.name,
        successRate: sr,
        tasksCompleted: a.tasksCompleted,
        tasksFailed: a.tasksFailed,
        tokensUsed: a.tokensUsed,
        costToday: a.costToday,
        costMonth: a.costMonth,
        cpu: a.cpu,
        memory: a.memory,
        responseTime: respTime,
        active: a.active,
        zone: a.zone,
        model: a.model,
      };
    });
  }, [agents]);

  // Agent radar chart data
  const agentRadar = useMemo(() => {
    if (agents.length === 0) return [];
    const maxTasks = Math.max(...agents.map((a) => a.tasksCompleted), 1);
    const maxTokens = Math.max(...agents.map((a) => a.tokensUsed), 1);
    return agents.map((a) => {
      const sr = a.tasksCompleted + a.tasksFailed > 0
        ? (a.tasksCompleted / (a.tasksCompleted + a.tasksFailed)) * 100
        : 100;
      const respTime = parseFloat(a.avgResponseTime);
      return {
        name: a.name,
        Reliability: Math.round(sr),
        Throughput: Math.round((a.tasksCompleted / maxTasks) * 100),
        Efficiency: Math.round(100 - (a.tokensUsed / maxTokens) * 100) || 50,
        Speed: Math.round(Math.max(0, 100 - respTime * 25)),
        Uptime: a.active ? 95 : 20,
      };
    });
  }, [agents]);

  // Cost breakdown data
  const costBreakdown = useMemo(() => {
    return agents.map((a, i) => ({
      name: a.name,
      today: a.costToday,
      month: a.costMonth,
      color: AGENT_COLORS[i % AGENT_COLORS.length],
    }));
  }, [agents]);

  // Token usage data
  const tokenUsage = useMemo(() => {
    return agents.map((a, i) => ({
      name: a.name,
      tokens: a.tokensUsed,
      costPerToken: a.tokensUsed > 0 ? (a.costMonth / a.tokensUsed * 1000).toFixed(3) : "0",
      color: AGENT_COLORS[i % AGENT_COLORS.length],
    }));
  }, [agents]);

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const totalCostToday = agents.reduce((s, a) => s + a.costToday, 0);
  const totalTokens = agents.reduce((s, a) => s + a.tokensUsed, 0);

  if (tasks.length === 0 && agents.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground/50 text-sm py-20">
        No tasks yet — create some tasks on the board to see analytics.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* ── KPI row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <StatCard label="Total Tasks" value={stats.total} icon={ListTodo} color="hsl(217, 91%, 65%)" />
        <StatCard label="Completed" value={stats.done} sub={`${completionRate}% completion rate`} icon={CheckCircle2} color="hsl(142, 71%, 50%)" />
        <StatCard label="Overdue" value={stats.overdue} sub="past due date" icon={AlertTriangle} color="hsl(0, 72%, 58%)" />
        <StatCard label="Due Today" value={stats.dueToday} icon={Clock} color="hsl(38, 92%, 60%)" />
        <StatCard label="Fleet Cost" value={`$${totalCostToday.toFixed(2)}`} sub="today" icon={DollarSign} color="hsl(271, 91%, 70%)" />
        <StatCard label="Tokens Used" value={`${(totalTokens / 1000).toFixed(0)}k`} sub={`${agents.filter(a => a.active).length} agents active`} icon={Zap} color="hsl(38, 92%, 60%)" />
      </div>

      {/* ── Row 2: Agent Performance Cards ─────────────────────────────── */}
      {agents.length > 0 && (
        <ChartCard title="Agent Performance Overview" subtitle="Real-time metrics across all agents">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {agentPerformance.map((a) => {
              const zoneColor = a.zone === "clinical" ? "border-red-500/30 from-red-500/10" : a.zone === "operations" ? "border-amber-500/30 from-amber-500/10" : "border-blue-500/30 from-blue-500/10";
              const zoneText = a.zone === "clinical" ? "text-red-400" : a.zone === "operations" ? "text-amber-400" : "text-blue-400";
              return (
                <div key={a.name} className={`rounded-xl border ${zoneColor} bg-gradient-to-b to-transparent p-4 space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`relative flex h-2 w-2`}>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${a.active ? (a.zone === "clinical" ? "bg-red-400" : a.zone === "operations" ? "bg-amber-400" : "bg-blue-400") : "bg-gray-600"}`} />
                      </span>
                      <span className="text-xs font-semibold text-foreground truncate">{a.name}</span>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${zoneText} font-medium opacity-60`}>{a.model}</span>
                  </div>

                  {/* Circular success rate */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(220,15%,16%)" strokeWidth="2.5" />
                        <circle
                          cx="18" cy="18" r="15" fill="none"
                          stroke={a.successRate >= 95 ? "hsl(142,71%,50%)" : a.successRate >= 80 ? "hsl(38,92%,60%)" : "hsl(0,72%,58%)"}
                          strokeWidth="2.5"
                          strokeDasharray={`${a.successRate * 0.942} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-sm font-bold tabular-nums ${a.successRate >= 95 ? "text-emerald-400" : a.successRate >= 80 ? "text-amber-400" : "text-red-400"}`}>{a.successRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-xs font-bold text-foreground tabular-nums">{a.tasksCompleted.toLocaleString()}</p>
                      <p className="text-[9px] text-muted-foreground">Completed</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-400 tabular-nums">${a.costToday.toFixed(2)}</p>
                      <p className="text-[9px] text-muted-foreground">Today</p>
                    </div>
                  </div>

                  {/* Resource bars */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-2.5 w-2.5 text-muted-foreground/30" />
                      <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${a.cpu > 75 ? "bg-red-500" : a.cpu > 50 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${a.cpu}%` }} />
                      </div>
                      <span className="text-[8px] text-muted-foreground/40 tabular-nums w-6 text-right">{a.cpu}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-2.5 w-2.5 text-muted-foreground/30" />
                      <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${a.memory > 75 ? "bg-red-500" : a.memory > 50 ? "bg-amber-500" : "bg-cyan-500"}`} style={{ width: `${a.memory}%` }} />
                      </div>
                      <span className="text-[8px] text-muted-foreground/40 tabular-nums w-6 text-right">{a.memory}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-muted-foreground/40 pt-1 border-t border-white/5">
                    <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5" />{(a.tokensUsed / 1000).toFixed(0)}k</span>
                    <span className="flex items-center gap-1"><Timer className="h-2.5 w-2.5" />{a.responseTime}s</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      )}

      {/* ── Row 3: Column distribution + Overdue trend ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Tasks by Column">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={byColumn} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {byColumn.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5 flex-1">
              {byColumn.map((item) => (
                <div key={item.name} className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
                  <span className="text-xs font-semibold text-foreground tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Overdue Rate — Last 14 Days">
          <ResponsiveContainer width="100%" height={155}>
            <AreaChart data={overdueOverTime}>
              <defs>
                <linearGradient id="overdueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0,72%,58%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0,72%,58%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,16%)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "hsl(220,10%,45%)", fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fill: "hsl(220,10%,45%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="overdue" stroke="hsl(0,72%,58%)" strokeWidth={2} fill="url(#overdueGrad)" name="Overdue Tasks" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row 4: Cost Breakdown + Token Usage ──────────────────────── */}
      {agents.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Cost Breakdown by Agent" subtitle="Daily and monthly spend comparison">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={costBreakdown} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,16%)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "hsl(220,10%,55%)", fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fill: "hsl(220,10%,45%)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "11px", color: "hsl(220,10%,55%)" }} />
                <Bar dataKey="today" name="Today" fill="hsl(271,91%,70%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="month" name="Month" fill="hsl(217,91%,65%)" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Token Consumption" subtitle="Total tokens used per agent">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tokenUsage} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,16%)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "hsl(220,10%,55%)", fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fill: "hsl(220,10%,45%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => value.toLocaleString()} />
                <Bar dataKey="tokens" name="Tokens" radius={[6, 6, 0, 0]}>
                  {tokenUsage.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* ── Row 5: Agent workload ────────────────────────────────────── */}
      <ChartCard title="Agent Workload Distribution" subtitle="Task allocation and completion by agent">
        {byAgent.length === 0 ? (
          <p className="text-xs text-muted-foreground/50 py-6 text-center">No agent data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(120, byAgent.length * 52)}>
            <BarChart data={byAgent} layout="vertical" barSize={14} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,16%)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "hsl(220,10%,45%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="agent" tick={{ fill: "hsl(220,10%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "11px", color: "hsl(220,10%,55%)" }} />
              <Bar dataKey="done" name="Done" fill="hsl(142,71%,50%)" radius={[0, 4, 4, 0]} stackId="a" />
              <Bar dataKey="active" name="Active" fill="hsl(217,91%,65%)" radius={[0, 4, 4, 0]} stackId="a" />
              <Bar dataKey="overdue" name="Overdue" fill="hsl(0,72%,58%)" radius={[0, 4, 4, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* ── Row 6: Agent Radar + Priority + Zone ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Agent Capabilities Radar */}
        {agentRadar.length > 0 && (
          <ChartCard title="Agent Capabilities" subtitle="Comparative performance radar">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={[
                { metric: "Reliability", ...Object.fromEntries(agentRadar.map((a) => [a.name, a.Reliability])) },
                { metric: "Throughput", ...Object.fromEntries(agentRadar.map((a) => [a.name, a.Throughput])) },
                { metric: "Efficiency", ...Object.fromEntries(agentRadar.map((a) => [a.name, a.Efficiency])) },
                { metric: "Speed", ...Object.fromEntries(agentRadar.map((a) => [a.name, a.Speed])) },
                { metric: "Uptime", ...Object.fromEntries(agentRadar.map((a) => [a.name, a.Uptime])) },
              ]}>
                <PolarGrid stroke="hsl(220,15%,16%)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(220,10%,55%)", fontSize: 9 }} />
                <PolarRadiusAxis tick={false} domain={[0, 100]} axisLine={false} />
                {agentRadar.map((a, i) => (
                  <Radar key={a.name} name={a.name} dataKey={a.name} stroke={AGENT_COLORS[i % AGENT_COLORS.length]} fill={AGENT_COLORS[i % AGENT_COLORS.length]} fillOpacity={0.1} strokeWidth={1.5} />
                ))}
                <Legend iconSize={6} iconType="circle" wrapperStyle={{ fontSize: "9px", color: "hsl(220,10%,55%)" }} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        <ChartCard title="Tasks by Priority">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byPriority} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,16%)" vertical={false} />
              <XAxis dataKey="priority" tick={{ fill: "hsl(220,10%,55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220,10%,45%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]}>
                {byPriority.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Zone Distribution">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={byZone} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {byZone.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {byZone.map((item) => {
                const pct = stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground">{item.value}</span>
                    </div>
                    <div className="h-1 rounded-full bg-border/30 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
