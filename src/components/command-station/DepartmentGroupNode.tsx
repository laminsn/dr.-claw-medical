import { memo } from "react";
import { type NodeProps } from "@xyflow/react";
import { Bot, Crown, Shield, Zap, Brain, Users, GitBranch, Settings, Building2 } from "lucide-react";

export interface DepartmentGroupNodeData {
  label: string;
  zone: "clinical" | "operations" | "external";
  agentCount: number;
  activeCount: number;
  collapsed?: boolean;
  onToggleCollapse?: (dept: string) => void;
}

const ZONE_CONFIG = {
  clinical: {
    border: "border-red-500/30",
    bg: "bg-red-500/[0.03]",
    headerBg: "bg-gradient-to-r from-red-500/15 to-transparent",
    accent: "text-red-400",
    dot: "bg-red-400",
    glow: "rgba(239,68,68,0.06)",
  },
  operations: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/[0.03]",
    headerBg: "bg-gradient-to-r from-amber-500/15 to-transparent",
    accent: "text-amber-400",
    dot: "bg-amber-400",
    glow: "rgba(245,158,11,0.06)",
  },
  external: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/[0.03]",
    headerBg: "bg-gradient-to-r from-blue-500/15 to-transparent",
    accent: "text-blue-400",
    dot: "bg-blue-400",
    glow: "rgba(59,130,246,0.06)",
  },
};

const DEPT_ICONS: Record<string, typeof Building2> = {
  "Executive": Crown,
  "Clinical Operations": Shield,
  "Marketing & Growth": Zap,
  "Finance & Accounting": Brain,
  "Human Resources": Users,
  "Research & Development": GitBranch,
  "IT & Security": Settings,
};

function DepartmentGroupNode({ data }: NodeProps & { data: DepartmentGroupNodeData }) {
  const zone = ZONE_CONFIG[data.zone];
  const IconComponent = DEPT_ICONS[data.label] || Building2;

  return (
    <div
      className={`rounded-2xl border-2 border-dashed ${zone.border} ${zone.bg} pointer-events-none`}
      style={{
        width: "100%",
        height: "100%",
        minWidth: 200,
        minHeight: 100,
        boxShadow: `inset 0 0 60px ${zone.glow}`,
      }}
    >
      {/* Department label header */}
      <div
        className={`${zone.headerBg} rounded-t-2xl px-4 py-2.5 flex items-center gap-2.5 pointer-events-auto`}
      >
        <div className={`w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center`}>
          <IconComponent className={`h-3.5 w-3.5 ${zone.accent}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${zone.accent} tracking-wide uppercase`}>
            {data.label}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Bot className="h-3 w-3 text-white/30" />
            <span className="text-[10px] text-white/40 font-medium">{data.agentCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${zone.dot}`} />
            <span className="text-[10px] text-white/40 font-medium">{data.activeCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(DepartmentGroupNode);
