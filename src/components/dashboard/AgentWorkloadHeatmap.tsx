import { useTranslation } from "react-i18next";

interface HeatmapRow {
  agent: string;
  data: number[]; // 7 values (Mon-Sun)
}

interface AgentWorkloadHeatmapProps {
  rows?: HeatmapRow[];
}

const defaultRows: HeatmapRow[] = [
  { agent: "Front Desk", data: [42, 38, 45, 51, 47, 18, 8] },
  { agent: "Clinical Coord", data: [28, 32, 30, 35, 33, 12, 5] },
  { agent: "Content Engine", data: [15, 22, 18, 25, 20, 8, 3] },
  { agent: "Patient Outreach", data: [20, 18, 22, 19, 24, 14, 10] },
  { agent: "Insurance Verifier", data: [18, 16, 20, 22, 19, 6, 2] },
  { agent: "Grant Writer", data: [8, 12, 10, 14, 11, 4, 0] },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getOpacity = (value: number, maxValue: number): number => {
  if (maxValue === 0) return 0.05;
  return Math.max(0.05, value / maxValue);
};

const AgentWorkloadHeatmap = ({ rows = defaultRows }: AgentWorkloadHeatmapProps) => {
  const { t } = useTranslation();
  const maxValue = Math.max(...rows.flatMap((r) => r.data));

  return (
    <div className="space-y-3">
      <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(7, 1fr)` }}>
        {/* Header row */}
        <div />
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-[10px] text-muted-foreground text-center font-medium"
          >
            {day}
          </div>
        ))}

        {/* Data rows */}
        {rows.map((row) => (
          <div key={row.agent} className="contents">
            <div className="text-xs text-foreground/80 truncate pr-2 flex items-center">
              {row.agent}
            </div>
            {row.data.map((value, i) => (
              <div
                key={i}
                className="h-7 rounded-sm flex items-center justify-center cursor-default transition-colors"
                style={{
                  backgroundColor: `hsl(217, 100%, 59%)`,
                  opacity: getOpacity(value, maxValue),
                }}
                title={`${row.agent} — ${DAYS[i]}: ${value} tasks`}
              >
                <span
                  className="text-[9px] font-medium"
                  style={{ color: value / maxValue > 0.4 ? "#fff" : "hsl(220, 10%, 50%)" }}
                >
                  {value > 0 ? value : ""}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Intensity legend */}
      <div className="flex items-center gap-2 justify-end">
        <span className="text-[10px] text-muted-foreground">{t("dashboard.less", "Less")}</span>
        {[0.1, 0.3, 0.5, 0.7, 1.0].map((opacity) => (
          <div
            key={opacity}
            className="h-3 w-3 rounded-sm"
            style={{
              backgroundColor: "hsl(217, 100%, 59%)",
              opacity,
            }}
          />
        ))}
        <span className="text-[10px] text-muted-foreground">{t("dashboard.more", "More")}</span>
      </div>
    </div>
  );
};

export default AgentWorkloadHeatmap;
