import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Bot, Crown, Building2, Zap } from "lucide-react";

export interface OrgAgentNodeData {
  name: string;
  role: string;
  department: string;
  zone: "clinical" | "operations" | "external";
  model: string;
  level: "ceo" | "department-head" | "worker";
  active: boolean;
  skills: string[];
  onSelect?: (id: string) => void;
}

const ZONE_CONFIG = {
  clinical: {
    border: "border-red-500/50",
    glow: "shadow-[0_0_25px_-5px_rgba(239,68,68,0.25)]",
    accent: "text-red-400",
    bg: "bg-red-500/10",
    headerBg: "bg-gradient-to-r from-red-500/20 to-red-600/5",
    dot: "bg-red-400",
    label: "Clinical",
  },
  operations: {
    border: "border-amber-500/50",
    glow: "shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)]",
    accent: "text-amber-400",
    bg: "bg-amber-500/10",
    headerBg: "bg-gradient-to-r from-amber-500/20 to-amber-600/5",
    dot: "bg-amber-400",
    label: "Operations",
  },
  external: {
    border: "border-blue-500/50",
    glow: "shadow-[0_0_25px_-5px_rgba(59,130,246,0.25)]",
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    headerBg: "bg-gradient-to-r from-blue-500/20 to-blue-600/5",
    dot: "bg-blue-400",
    label: "External",
  },
};

const MODEL_COLORS: Record<string, string> = {
  openai: "text-green-400",
  claude: "text-violet-400",
  gemini: "text-blue-400",
  minimax: "text-amber-400",
  kimi: "text-rose-400",
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

  const nodeWidth = isCeo ? "w-[300px]" : isHead ? "w-[260px]" : "w-[220px]";

  return (
    <div
      className={`relative ${nodeWidth} rounded-2xl border ${zone.border} ${
        data.active ? zone.glow : "opacity-60"
      } bg-[hsl(220,20%,8%)]/95 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
      onClick={() => data.onSelect?.(id)}
    >
      {/* Handles */}
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

      {/* Header */}
      <div className={`${zone.headerBg} rounded-t-2xl px-4 py-3 border-b border-white/5`}>
        <div className="flex items-center gap-2.5">
          <div
            className={`${isCeo ? "w-10 h-10" : "w-8 h-8"} rounded-lg ${zone.bg} flex items-center justify-center`}
          >
            <LevelIcon className={`${isCeo ? "h-5 w-5" : "h-4 w-4"} ${zone.accent}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p
                className={`${
                  isCeo ? "text-base" : "text-sm"
                } font-semibold text-white leading-tight truncate`}
              >
                {data.name}
              </p>
              {isCeo && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase">
                  CEO
                </span>
              )}
              {isHead && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 font-bold uppercase">
                  HEAD
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/40 truncate">{data.role}</p>
          </div>
          {/* Status dot */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
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

      {/* Body */}
      <div className="px-4 py-2.5 space-y-2">
        {/* Dept + Zone + Model */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-white/30 truncate">{data.department}</span>
          <div className="flex items-center gap-2">
            <span
              className={`text-[8px] px-1.5 py-0.5 rounded-full border ${zone.border} ${zone.accent} ${zone.bg}`}
            >
              {zone.label}
            </span>
            <span
              className={`text-[9px] ${MODEL_COLORS[data.model] || "text-white/40"}`}
            >
              {MODEL_LABELS[data.model] || data.model}
            </span>
          </div>
        </div>

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 border border-white/5"
              >
                {skill}
              </span>
            ))}
            {data.skills.length > 3 && (
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/20">
                +{data.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(OrgAgentNodeComponent);
