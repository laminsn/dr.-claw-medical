import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Activity,
  Zap,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export interface MetricsPanelNodeData {
  agents: {
    id: string;
    name: string;
    active: boolean;
    tasksCompleted: number;
    tasksFailed: number;
    tokensUsed: number;
    costToday: number;
    costMonth: number;
    zone: "clinical" | "operations" | "external";
  }[];
}

const ZONE_COLORS = {
  clinical: "bg-red-500",
  operations: "bg-amber-500",
  external: "bg-blue-500",
};

function MetricsPanelNodeComponent({ data }: NodeProps & { data: MetricsPanelNodeData }) {
  const totalTasks = data.agents.reduce((s, a) => s + a.tasksCompleted, 0);
  const totalFailed = data.agents.reduce((s, a) => s + a.tasksFailed, 0);
  const totalTokens = data.agents.reduce((s, a) => s + a.tokensUsed, 0);
  const totalCost = data.agents.reduce((s, a) => s + a.costToday, 0);
  const totalCostMonth = data.agents.reduce((s, a) => s + a.costMonth, 0);
  const activeCount = data.agents.filter((a) => a.active).length;
  const avgSuccessRate =
    data.agents.length > 0
      ? Math.round(
          data.agents.reduce((s, a) => {
            const total = a.tasksCompleted + a.tasksFailed;
            return s + (total > 0 ? (a.tasksCompleted / total) * 100 : 100);
          }, 0) / data.agents.length
        )
      : 0;

  const maxTasks = Math.max(...data.agents.map((a) => a.tasksCompleted), 1);

  return (
    <div className="w-[340px] rounded-2xl border border-violet-500/40 shadow-[0_0_40px_-5px_rgba(139,92,246,0.25)] bg-[hsl(220,20%,8%)]/95 backdrop-blur-xl overflow-hidden">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-violet-500 !border-2 !border-violet-400/50 !-left-1.5"
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/10 px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-semibold text-violet-400">Fleet Metrics</span>
          </div>
          <span className="text-[10px] text-white/30">
            {activeCount}/{data.agents.length} online
          </span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2 p-3">
        {[
          {
            label: "Tasks",
            value: totalTasks.toLocaleString(),
            icon: CheckCircle2,
            color: "text-emerald-400",
          },
          {
            label: "Failed",
            value: String(totalFailed),
            icon: AlertTriangle,
            color: totalFailed > 10 ? "text-red-400" : "text-amber-400",
          },
          {
            label: "Rate",
            value: `${avgSuccessRate}%`,
            icon: TrendingUp,
            color:
              avgSuccessRate >= 95
                ? "text-emerald-400"
                : avgSuccessRate >= 80
                ? "text-amber-400"
                : "text-red-400",
          },
          {
            label: "Cost",
            value: `$${totalCost.toFixed(2)}`,
            icon: DollarSign,
            color: "text-amber-400",
          },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <stat.icon className={`h-3.5 w-3.5 mx-auto mb-1 ${stat.color}`} />
            <p className={`text-xs font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
            <p className="text-[8px] text-white/25">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="px-3 pb-3 space-y-1.5">
        {data.agents.map((agent) => {
          const pct =
            maxTasks > 0 ? (agent.tasksCompleted / maxTasks) * 100 : 0;
          return (
            <div key={agent.id} className="flex items-center gap-2">
              <div className="w-20 text-right shrink-0">
                <span className="text-[10px] text-white/60 truncate block">
                  {agent.name}
                </span>
              </div>
              <div className="flex-1 h-4 rounded bg-white/5 overflow-hidden relative">
                <div
                  className={`h-full rounded ${ZONE_COLORS[agent.zone]} opacity-60 transition-all duration-700`}
                  style={{ width: `${Math.max(pct, 3)}%` }}
                />
                <span className="absolute inset-y-0 right-1.5 flex items-center text-[9px] font-medium text-white/60 tabular-nums">
                  {agent.tasksCompleted}
                </span>
              </div>
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  agent.active ? ZONE_COLORS[agent.zone] : "bg-gray-600"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Footer totals */}
      <div className="px-3 py-2 border-t border-white/5 flex items-center justify-between text-[9px] text-white/25">
        <span className="flex items-center gap-1">
          <Zap className="h-2.5 w-2.5" />
          <span className="text-white/40 tabular-nums">
            {(totalTokens / 1000).toFixed(1)}k
          </span>{" "}
          tokens
        </span>
        <span className="flex items-center gap-1">
          <Activity className="h-2.5 w-2.5" />
          Month:{" "}
          <span className="text-white/40 tabular-nums">
            ${totalCostMonth.toFixed(2)}
          </span>
        </span>
      </div>
    </div>
  );
}

export default memo(MetricsPanelNodeComponent);
