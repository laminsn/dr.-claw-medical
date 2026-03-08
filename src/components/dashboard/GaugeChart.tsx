import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { CHART_COLORS } from "./chartConstants";

interface GaugeChartProps {
  value: number;
  max?: number;
  label: string;
  color?: string;
  size?: number;
}

const GaugeChart = ({
  value,
  max = 100,
  label,
  color = CHART_COLORS.primary,
  size = 140,
}: GaugeChartProps) => {
  const percentage = Math.round((value / max) * 100);
  const data = [{ value: percentage, fill: color }];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <RadialBarChart
          width={size}
          height={size}
          cx={size / 2}
          cy={size / 2}
          innerRadius={size * 0.32}
          outerRadius={size * 0.45}
          barSize={size * 0.08}
          data={data}
          startAngle={225}
          endAngle={-45}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            dataKey="value"
            cornerRadius={size * 0.04}
            background={{ fill: "hsl(220, 15%, 16%)" }}
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </RadialBarChart>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold font-heading text-foreground">
            {percentage}%
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium text-center leading-tight">
        {label}
      </span>
    </div>
  );
};

export default GaugeChart;
