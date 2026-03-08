import {
  FunnelChart as RechartsFunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CHART_TOOLTIP_STYLE } from "./chartConstants";

interface FunnelStage {
  name: string;
  value: number;
  fill: string;
}

interface FunnelChartProps {
  data: FunnelStage[];
  height?: number;
}

const DCMFunnelChart = ({ data, height = 280 }: FunnelChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsFunnelChart>
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
        <Funnel
          dataKey="value"
          data={data}
          isAnimationActive={true}
          animationDuration={1000}
        >
          <LabelList
            position="right"
            fill="hsl(220, 10%, 70%)"
            fontSize={11}
            dataKey="name"
          />
          <LabelList
            position="center"
            fill="#fff"
            fontSize={12}
            fontWeight={600}
            dataKey="value"
          />
        </Funnel>
      </RechartsFunnelChart>
    </ResponsiveContainer>
  );
};

export default DCMFunnelChart;
