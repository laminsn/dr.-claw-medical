import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from "lucide-react";

export interface LogsPanelNodeData {
  agentName: string;
  logs: { id: string; level: string; message: string; timestamp: string }[];
}

const LOG_ICONS = {
  info: Radio,
  warn: AlertTriangle,
  error: AlertTriangle,
  success: CheckCircle2,
};

const LOG_COLORS = {
  info: "text-blue-400",
  warn: "text-amber-400",
  error: "text-red-400",
  success: "text-emerald-400",
};

function LogsPanelNodeComponent({ data }: NodeProps & { data: LogsPanelNodeData }) {
  return (
    <div className="w-[300px] rounded-2xl border border-emerald-500/40 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)] bg-[hsl(220,20%,8%)]/95 backdrop-blur-xl overflow-hidden">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-emerald-400/50 !-top-1.5"
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/10 px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">Activity Log</span>
          </div>
          <span className="text-[10px] text-white/30">{data.agentName}</span>
        </div>
      </div>

      {/* Logs */}
      <div className="max-h-[250px] overflow-y-auto p-3 space-y-1.5">
        {data.logs.map((log) => {
          const Icon = LOG_ICONS[log.level as keyof typeof LOG_ICONS] || Radio;
          const color = LOG_COLORS[log.level as keyof typeof LOG_COLORS] || "text-white/40";
          return (
            <div key={log.id} className="flex items-start gap-2">
              <Icon className={`h-3 w-3 mt-0.5 shrink-0 ${color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/60 leading-snug">{log.message}</p>
                <p className="text-[8px] text-white/20 mt-0.5">{log.timestamp}</p>
              </div>
            </div>
          );
        })}
        {data.logs.length === 0 && (
          <p className="text-[10px] text-white/20 text-center py-4">No activity yet</p>
        )}
      </div>
    </div>
  );
}

export default memo(LogsPanelNodeComponent);
