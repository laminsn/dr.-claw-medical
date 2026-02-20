import { memo } from "react";
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";

export interface HierarchyEdgeData {
  zone?: "clinical" | "operations" | "external";
  sourceLevel?: "ceo" | "department-head" | "worker";
  targetLevel?: "ceo" | "department-head" | "worker";
}

const ZONE_COLORS = {
  clinical: { main: "#ef4444", light: "rgba(239,68,68,0.4)" },
  operations: { main: "#f59e0b", light: "rgba(245,158,11,0.4)" },
  external: { main: "#3b82f6", light: "rgba(59,130,246,0.4)" },
};

function HierarchyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
  markerEnd,
}: EdgeProps & { data?: HierarchyEdgeData }) {
  const zone = data?.zone || "operations";
  const colors = ZONE_COLORS[zone];
  const isCeoEdge = data?.sourceLevel === "ceo";

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
    offset: 30,
  });

  const gradientId = `edge-gradient-${id}`;
  const flowId = `edge-flow-${id}`;
  const glowId = `edge-glow-${id}`;

  return (
    <>
      <defs>
        {/* Gradient along the edge */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.main} stopOpacity={isCeoEdge ? 0.8 : 0.6} />
          <stop offset="100%" stopColor={colors.main} stopOpacity={isCeoEdge ? 0.4 : 0.2} />
        </linearGradient>
        {/* Glow filter */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow layer */}
      <path
        d={edgePath}
        fill="none"
        stroke={colors.light}
        strokeWidth={isCeoEdge ? 6 : 4}
        strokeOpacity={0.3}
        filter={`url(#${glowId})`}
      />

      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: `url(#${gradientId})`,
          strokeWidth: isCeoEdge ? 2.5 : 1.8,
        }}
        markerEnd={markerEnd}
      />

      {/* Animated flow dots */}
      <circle r={isCeoEdge ? 3 : 2.5} fill={colors.main} opacity={0.9}>
        <animateMotion
          dur={isCeoEdge ? "3s" : "4s"}
          repeatCount="indefinite"
          path={edgePath}
        />
      </circle>
      <circle r={isCeoEdge ? 2 : 1.5} fill="white" opacity={0.6}>
        <animateMotion
          dur={isCeoEdge ? "3s" : "4s"}
          repeatCount="indefinite"
          path={edgePath}
          begin={isCeoEdge ? "1.5s" : "2s"}
        />
      </circle>
    </>
  );
}

export default memo(HierarchyEdge);
