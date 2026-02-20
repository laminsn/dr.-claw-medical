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
} from "recharts";
import { isPast, parseISO, isToday, subDays, format, eachDayOfInterval } from "date-fns";
import { KanbanTask } from "@/hooks/useKanbanTasks";
import { AlertTriangle, CheckCircle2, Clock, ListTodo, TrendingUp, Users } from "lucide-react";

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
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/50 p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function TaskAnalyticsDashboard({ tasks }: { tasks: KanbanTask[] }) {
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
    return { total, done, overdue, dueToday };
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
  const byAgent = useMemo(() => {
    const agentMap: Record<string, { id: string; total: number; done: number; overdue: number }> = {};
    const AGENT_NAMES: Record<string, string> = { "1": "Dr. Front Desk", "2": "Marketing Maven", "3": "Grant Pro" };
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
  }, [tasks]);

  // Overdue rate over last 14 days (line / area)
  const overdueOverTime = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() });
    return days.map((day) => {
      const dayStr = format(day, "MMM d");
      // A task is considered "overdue on this day" if it was created before or on this day and is still overdue
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

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground/50 text-sm py-20">
        No tasks yet — create some tasks on the board to see analytics.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* ── KPI row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={stats.total} icon={ListTodo} color="hsl(217, 91%, 65%)" />
        <StatCard label="Completed" value={stats.done} sub={`${completionRate}% completion rate`} icon={CheckCircle2} color="hsl(142, 71%, 50%)" />
        <StatCard label="Overdue" value={stats.overdue} sub="past due date" icon={AlertTriangle} color="hsl(0, 72%, 58%)" />
        <StatCard label="Due Today" value={stats.dueToday} icon={Clock} color="hsl(38, 92%, 60%)" />
      </div>

      {/* ── Row 2: Column distribution + Overdue trend ───────────────── */}
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

      {/* ── Row 3: Agent workload ────────────────────────────────────── */}
      <ChartCard title="Agent Workload Distribution">
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

      {/* ── Row 4: Priority breakdown + Zone distribution ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Tasks by Priority">
          <ResponsiveContainer width="100%" height={160}>
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
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie data={byZone} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" strokeWidth={0}>
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
