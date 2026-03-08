import { useTranslation } from "react-i18next";
import GaugeChart from "./GaugeChart";
import { CHART_COLORS } from "./chartConstants";

interface GaugeData {
  value: number;
  max: number;
  labelKey: string;
  fallback: string;
  color: string;
}

const defaultGauges: GaugeData[] = [
  {
    value: 98,
    max: 100,
    labelKey: "dashboard.complianceScore",
    fallback: "HIPAA Compliance",
    color: CHART_COLORS.emerald,
  },
  {
    value: 92,
    max: 100,
    labelKey: "dashboard.patientSatisfaction",
    fallback: "Patient Satisfaction",
    color: CHART_COLORS.primary,
  },
  {
    value: 99.7,
    max: 100,
    labelKey: "dashboard.agentUptime",
    fallback: "Agent Uptime",
    color: CHART_COLORS.cyan,
  },
  {
    value: 94.2,
    max: 100,
    labelKey: "dashboard.taskSuccessRate",
    fallback: "Task Success Rate",
    color: CHART_COLORS.violet,
  },
];

interface ComplianceGaugesProps {
  gauges?: GaugeData[];
}

const ComplianceGauges = ({ gauges = defaultGauges }: ComplianceGaugesProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {gauges.map((gauge) => (
        <div
          key={gauge.labelKey}
          className="flex items-center justify-center"
        >
          <GaugeChart
            value={gauge.value}
            max={gauge.max}
            label={t(gauge.labelKey, gauge.fallback)}
            color={gauge.color}
            size={130}
          />
        </div>
      ))}
    </div>
  );
};

export default ComplianceGauges;
