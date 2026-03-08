import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "./chartConstants";

interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
}

const SparklineChart = ({
  data,
  color = CHART_COLORS.primary,
  height = 40,
}: SparklineChartProps) => {
  const chartData = data.map((value, index) => ({ index, value }));
  const gradientId = `spark-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={true}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default SparklineChart;
