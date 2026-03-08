import { useTranslation } from "react-i18next";
import { Bot } from "lucide-react";

interface AgentHealth {
  name: string;
  status: "active" | "idle" | "error";
  tasksToday: number;
  lastActivity: string;
}

const defaultAgents: AgentHealth[] = [
  { name: "Front Desk Agent", status: "active", tasksToday: 47, lastActivity: "2m ago" },
  { name: "Insurance Verifier", status: "active", tasksToday: 23, lastActivity: "5m ago" },
  { name: "Clinical Coordinator", status: "active", tasksToday: 18, lastActivity: "1m ago" },
  { name: "Patient Outreach", status: "idle", tasksToday: 12, lastActivity: "32m ago" },
  { name: "Post-Op Care", status: "active", tasksToday: 8, lastActivity: "12m ago" },
  { name: "Compliance Monitor", status: "active", tasksToday: 5, lastActivity: "8m ago" },
];

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500",
  idle: "bg-amber-500",
  error: "bg-red-500",
};

interface AgentHealthGridProps {
  agents?: AgentHealth[];
}

const AgentHealthGrid = ({ agents = defaultAgents }: AgentHealthGridProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">
        {t("dashboard.agentHealth", "Agent Health")}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <div className="relative">
              <Bot className="h-5 w-5 text-muted-foreground" />
              <span
                className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${STATUS_COLORS[agent.status]}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{agent.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {agent.tasksToday} {t("dashboard.tasksToday", "tasks")} · {agent.lastActivity}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentHealthGrid;
