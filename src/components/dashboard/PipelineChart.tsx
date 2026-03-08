import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CHART_TOOLTIP_STYLE, CHART_AXIS_TICK } from "./chartConstants";

interface PipelineStage {
  name: string;
  value: number;
  color: string;
}

interface PipelineChartProps {
  stages: PipelineStage[];
  height?: number;
}

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
};

const PipelineChart = ({ stages, height = 80 }: PipelineChartProps) => {
  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={[stages.reduce((acc, s) => ({ ...acc, [s.name]: s.value }), {} as Record<string, number>)]}
          layout="horizontal"
          barSize={32}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <XAxis type="category" hide />
          <YAxis type="number" hide />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(value: number) => formatCurrency(value)}
          />
          {stages.map((stage) => (
            <Bar
              key={stage.name}
              dataKey={stage.name}
              stackId="pipeline"
              fill={stage.color}
              radius={0}
              isAnimationActive={true}
              animationDuration={800}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {stages.map((stage) => (
          <div key={stage.name} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-sm shrink-0"
              style={{ backgroundColor: stage.color }}
            />
            <span className="text-xs text-muted-foreground">{stage.name}</span>
            <span className="text-xs font-semibold text-foreground">
              {formatCurrency(stage.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipelineChart;
