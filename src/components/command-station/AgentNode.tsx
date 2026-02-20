import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Bot,
  Cpu,
  Activity,
  Zap,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";

export interface AgentNodeData {
  name: string;
  model: string;
  zone: "clinical" | "operations" | "external";
  active: boolean;
  currentTask: string;
  tasksCompleted: number;
  tasksFailed: number;
  cpu: number;
  memory: number;
  tokensUsed: number;
  costToday: number;
  avgResponseTime: string;
  uptime: string;
  logs: { id: string; level: string; message: string; timestamp: string }[];
  onSelect?: (id: string) => void;
}

const ZONE_CONFIG = {
  clinical: {
    border: "border-red-500/50",
    glow: "shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]",
    accent: "text-red-400",
    bg: "bg-red-500/10",
    headerBg: "bg-gradient-to-r from-red-500/20 to-red-600/5",
    dot: "bg-red-400",
    label: "Clinical",
  },
  operations: {
    border: "border-amber-500/50",
    glow: "shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]",
    accent: "text-amber-400",
    bg: "bg-amber-500/10",
    headerBg: "bg-gradient-to-r from-amber-500/20 to-amber-600/5",
    dot: "bg-amber-400",
    label: "Operations",
  },
  external: {
    border: "border-blue-500/50",
    glow: "shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]",
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    headerBg: "bg-gradient-to-r from-blue-500/20 to-blue-600/5",
    dot: "bg-blue-400",
    label: "External",
  },
};

function AgentNodeComponent({ data, id }: NodeProps & { data: AgentNodeData }) {
  const zone = ZONE_CONFIG[data.zone];
  const successRate =
    data.tasksCompleted + data.tasksFailed > 0
      ? Math.round(
          (data.tasksCompleted / (data.tasksCompleted + data.tasksFailed)) * 100
        )
      : 0;

  return (
    <div
      className={`relative w-[280px] rounded-2xl border ${zone.border} ${
        data.active ? zone.glow : "opacity-70"
      } bg-[hsl(220,20%,8%)]/95 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group`}
      onClick={() => data.onSelect?.(id)}
    >
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-cyan-400/50 !-top-1.5"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-cyan-400/50 !-bottom-1.5"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-cyan-400/50 !-right-1.5"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-cyan-400/50 !-left-1.5"
      />

      {/* Header */}
      <div
        className={`${zone.headerBg} rounded-t-2xl px-4 py-3 border-b border-white/5`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg ${zone.bg} flex items-center justify-center`}
            >
              <Bot className={`h-4 w-4 ${zone.accent}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">
                {data.name}
              </p>
              <p className="text-[10px] text-white/40">{data.model}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full border ${zone.border} ${zone.accent} ${zone.bg}`}
            >
              {zone.label}
            </span>
            <span className="relative flex h-2.5 w-2.5">
              {data.active && (
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${zone.dot} opacity-75`}
                />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  data.active ? zone.dot : "bg-gray-600"
                }`}
              />
            </span>
          </div>
        </div>
      </div>

      {/* Current Task */}
      <div className="px-4 py-2 border-b border-white/5">
        <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">
          Current Task
        </p>
        <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
          {data.currentTask}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="px-4 py-3 grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 tabular-nums">
              {data.tasksCompleted}
            </span>
          </div>
          <p className="text-[9px] text-white/30">Done</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <TrendingUp className="h-3 w-3 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 tabular-nums">
              {successRate}%
            </span>
          </div>
          <p className="text-[9px] text-white/30">Rate</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <DollarSign className="h-3 w-3 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 tabular-nums">
              ${data.costToday.toFixed(2)}
            </span>
          </div>
          <p className="text-[9px] text-white/30">Cost</p>
        </div>
      </div>

      {/* Resource Bars */}
      <div className="px-4 pb-2 space-y-1.5">
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] text-white/30 flex items-center gap-1">
              <Cpu className="h-2.5 w-2.5" /> CPU
            </span>
            <span className="text-[9px] text-white/50 tabular-nums">
              {data.cpu}%
            </span>
          </div>
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                data.cpu > 75
                  ? "bg-red-500"
                  : data.cpu > 50
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${data.cpu}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] text-white/30 flex items-center gap-1">
              <Activity className="h-2.5 w-2.5" /> MEM
            </span>
            <span className="text-[9px] text-white/50 tabular-nums">
              {data.memory}%
            </span>
          </div>
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                data.memory > 75
                  ? "bg-red-500"
                  : data.memory > 50
                  ? "bg-amber-500"
                  : "bg-cyan-500"
              }`}
              style={{ width: `${data.memory}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between">
        <span className="text-[9px] text-white/25 flex items-center gap-1">
          <Zap className="h-2.5 w-2.5" />
          <span className="text-white/40 tabular-nums">
            {(data.tokensUsed / 1000).toFixed(1)}k
          </span>{" "}
          tokens
        </span>
        <span className="text-[9px] text-white/25 flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          <span className="text-white/40">{data.uptime}</span>
        </span>
      </div>

      {/* Recent Log */}
      {data.logs.length > 0 && (
        <div className="px-4 py-2 border-t border-white/5">
          <div className="flex items-start gap-1.5">
            {data.logs[0].level === "error" ? (
              <AlertTriangle className="h-2.5 w-2.5 text-red-400 mt-0.5 shrink-0" />
            ) : data.logs[0].level === "success" ? (
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <Activity className="h-2.5 w-2.5 text-blue-400 mt-0.5 shrink-0" />
            )}
            <p className="text-[9px] text-white/40 leading-snug line-clamp-1">
              {data.logs[0].message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(AgentNodeComponent);
