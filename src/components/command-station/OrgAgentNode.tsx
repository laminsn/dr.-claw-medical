import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Bot, Crown, Building2, Activity, CircleDot } from "lucide-react";

export interface OrgAgentNodeData {
  name: string;
  role: string;
  department: string;
  zone: "clinical" | "operations" | "external";
  model: string;
  level: "ceo" | "department-head" | "worker";
  active: boolean;
  skills: string[];
  tasksToday?: number;
  successRate?: number;
  childCount?: number;
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
    ringColor: "ring-red-500/20",
    handleColor: "!bg-red-400 !border-red-300/50",
  },
  operations: {
    border: "border-amber-500/50",
    glow: "shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]",
    accent: "text-amber-400",
    bg: "bg-amber-500/10",
    headerBg: "bg-gradient-to-r from-amber-500/20 to-amber-600/5",
    dot: "bg-amber-400",
    label: "Operations",
    ringColor: "ring-amber-500/20",
    handleColor: "!bg-amber-400 !border-amber-300/50",
  },
  external: {
    border: "border-blue-500/50",
    glow: "shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]",
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    headerBg: "bg-gradient-to-r from-blue-500/20 to-blue-600/5",
    dot: "bg-blue-400",
    label: "External",
    ringColor: "ring-blue-500/20",
    handleColor: "!bg-blue-400 !border-blue-300/50",
  },
};

const MODEL_COLORS: Record<string, string> = {
  openai: "text-green-400",
  claude: "text-violet-400",
  gemini: "text-blue-400",
  minimax: "text-amber-400",
  kimi: "text-rose-400",
};

const MODEL_BG: Record<string, string> = {
  openai: "bg-green-500/10",
  claude: "bg-violet-500/10",
  gemini: "bg-blue-500/10",
  minimax: "bg-amber-500/10",
  kimi: "bg-rose-500/10",
};

const MODEL_LABELS: Record<string, string> = {
  openai: "GPT-5",
  claude: "Claude 4",
  gemini: "Gemini 2",
  minimax: "MiniMax",
  kimi: "Kimi",
};

function OrgAgentNodeComponent({ data, id }: NodeProps & { data: OrgAgentNodeData }) {
  const zone = ZONE_CONFIG[data.zone];
  const isCeo = data.level === "ceo";
  const isHead = data.level === "department-head";

  const LevelIcon = isCeo ? Crown : isHead ? Building2 : Bot;

  const nodeWidth = isCeo ? "w-[320px]" : isHead ? "w-[270px]" : "w-[230px]";

  return (
    <div
      className={`relative ${nodeWidth} rounded-2xl border ${zone.border} ${
        data.active ? zone.glow : "opacity-50 grayscale-[30%]"
      } bg-[hsl(220,20%,8%)]/95 backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:z-10 cursor-pointer group`}
      onClick={() => data.onSelect?.(id)}
    >
      {/* Handles */}
      {!isCeo && (
        <Handle
          type="target"
          position={Position.Top}
          className={`!w-3 !h-3 ${zone.handleColor} !border-2 !-top-1.5 !rounded-full`}
        />
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className={`!w-3 !h-3 ${zone.handleColor} !border-2 !-bottom-1.5 !rounded-full`}
      />

      {/* Subtle top gradient line */}
      <div className={`absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-current to-transparent ${zone.accent} opacity-30 rounded-full`} />

      {/* Header */}
      <div className={`${zone.headerBg} rounded-t-2xl px-4 py-3 border-b border-white/5`}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div
              className={`${isCeo ? "w-11 h-11" : "w-9 h-9"} rounded-xl ${zone.bg} flex items-center justify-center ring-1 ${zone.ringColor}`}
            >
              <LevelIcon className={`${isCeo ? "h-5 w-5" : "h-4 w-4"} ${zone.accent}`} />
            </div>
            {/* Active pulse ring */}
            {data.active && (
              <span className={`absolute -bottom-0.5 -right-0.5 flex h-3 w-3`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${zone.dot} opacity-60`} />
                <span className={`relative inline-flex rounded-full h-3 w-3 ${zone.dot} ring-2 ring-[hsl(220,20%,8%)]`} />
              </span>
            )}
            {!data.active && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-600 ring-2 ring-[hsl(220,20%,8%)]" />
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p
                className={`${
                  isCeo ? "text-sm" : "text-[13px]"
                } font-bold text-white leading-tight truncate`}
              >
                {data.name}
              </p>
              {isCeo && (
                <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-amber-300 border border-amber-500/40 font-extrabold uppercase tracking-wider">
                  CEO
                </span>
              )}
              {isHead && (
                <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold uppercase tracking-wider">
                  HEAD
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/35 truncate mt-0.5">{data.role}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-2.5 space-y-2">
        {/* Zone + Model row */}
        <div className="flex items-center justify-between">
          <span
            className={`text-[8px] px-2 py-0.5 rounded-full border ${zone.border} ${zone.accent} ${zone.bg} font-medium`}
          >
            {zone.label}
          </span>
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full ${MODEL_BG[data.model] || "bg-white/5"} ${MODEL_COLORS[data.model] || "text-white/40"} font-medium`}
          >
            {MODEL_LABELS[data.model] || data.model}
          </span>
        </div>

        {/* Metrics row (for CEO and heads) */}
        {(isCeo || isHead) && (
          <div className="flex items-center gap-3 py-1 border-t border-white/5">
            {data.tasksToday !== undefined && (
              <div className="flex items-center gap-1">
                <Activity className="h-2.5 w-2.5 text-white/20" />
                <span className="text-[9px] text-white/40">{data.tasksToday} tasks</span>
              </div>
            )}
            {data.successRate !== undefined && (
              <div className="flex items-center gap-1">
                <CircleDot className="h-2.5 w-2.5 text-emerald-400/50" />
                <span className="text-[9px] text-emerald-400/60">{data.successRate}%</span>
              </div>
            )}
            {data.childCount !== undefined && data.childCount > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <Bot className="h-2.5 w-2.5 text-white/20" />
                <span className="text-[9px] text-white/40">{data.childCount} reports</span>
              </div>
            )}
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.skills.slice(0, isCeo ? 4 : 3).map((skill) => (
              <span
                key={skill}
                className="text-[8px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-white/30 border border-white/[0.06]"
              >
                {skill}
              </span>
            ))}
            {data.skills.length > (isCeo ? 4 : 3) && (
              <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-white/20">
                +{data.skills.length - (isCeo ? 4 : 3)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover hint */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/0 group-hover:ring-white/10 transition-all duration-300 pointer-events-none" />
    </div>
  );
}

export default memo(OrgAgentNodeComponent);
