export const CHART_COLORS = {
  primary: "hsl(217, 100%, 59%)",
  cyan: "hsl(190, 95%, 50%)",
  emerald: "hsl(142, 72%, 45%)",
  violet: "hsl(280, 72%, 55%)",
  amber: "hsl(38, 92%, 50%)",
  rose: "hsl(346, 77%, 50%)",
  slate: "hsl(220, 12%, 40%)",
  teal: "hsl(172, 66%, 40%)",
} as const;

export const CHART_COLORS_ARRAY = [
  CHART_COLORS.primary,
  CHART_COLORS.cyan,
  CHART_COLORS.emerald,
  CHART_COLORS.violet,
  CHART_COLORS.amber,
  CHART_COLORS.rose,
  CHART_COLORS.slate,
  CHART_COLORS.teal,
];

export const CHART_GRID_STROKE = "hsl(220, 15%, 16%)";

export const CHART_AXIS_TICK = {
  fill: "hsl(220, 10%, 50%)",
  fontSize: 11,
};

export const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "hsl(220, 18%, 10%)",
  border: "1px solid hsl(220, 15%, 16%)",
  borderRadius: "8px",
  color: "hsl(220, 10%, 93%)",
  fontSize: "12px",
};
