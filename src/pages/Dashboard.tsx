import {
  Activity,
  CalendarCheck,
  Users,
  Bot,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  TrendingUp,
  Zap,
  Brain,
  Plus,
  MessageSquare,
  Timer,
  CheckCircle2,
  DollarSign,
  Sparkles,
  Terminal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  TaskVolumeChart,
  TrendChart,
  OutcomeChart,
  AgentTasksTable,
  HoursSavedChart,
  MoneySavedChart,
  AgentHoursSavedChart,
} from "@/components/dashboard/AnalyticsCharts";

const recentActivity = [
  { action: "Content Engine generated 5 blog posts for Q1 campaign", time: "2 min ago" },
  { action: "Front Desk Agent booked appointment — J. Martinez, Cardiology", time: "8 min ago" },
  { action: "Grant Writer completed NIH R01 proposal draft — $1.2M request", time: "15 min ago" },
  { action: "Financial Analyst generated monthly P&L report", time: "22 min ago" },
  { action: "Clinical Coordinator processed 12 referral letters", time: "38 min ago" },
  { action: "HR Coordinator screened 8 engineering candidates", time: "1 hr ago" },
  { action: "AI Strategy Director completed vendor evaluation report", time: "1.5 hrs ago" },
  { action: "Patient Outreach recovered 6 no-show appointments", time: "2 hrs ago" },
];

const primaryStats = [
  {
    label: "Active Clinical Agents",
    value: "12",
    change: "+3",
    trend: "up" as const,
    icon: Bot,
    color: "from-primary to-blue-600",
  },
  {
    label: "Patient Tasks This Week",
    value: "2,847",
    change: "+18%",
    trend: "up" as const,
    icon: Activity,
    color: "from-cyan-500 to-accent",
  },
  {
    label: "Medical Skills Active",
    value: "34",
    change: "+8",
    trend: "up" as const,
    icon: Zap,
    color: "from-violet-500 to-purple-600",
  },
  {
    label: "Care Team Members",
    value: "8",
    change: "+2",
    trend: "up" as const,
    icon: Users,
    color: "from-emerald-500 to-green-600",
  },
];

const agentPerformance = [
  {
    label: "Clinical Task Success",
    value: "94.2%",
    change: "+2.1%",
    trend: "up" as const,
    icon: TrendingUp,
  },
  {
    label: "Avg Response Time",
    value: "1.8s",
    change: "-0.3s",
    trend: "up" as const,
    icon: Clock,
  },
  {
    label: "Clinical Docs Generated",
    value: "156",
    change: "+24",
    trend: "up" as const,
    icon: FileText,
  },
  {
    label: "Patient Conversations",
    value: "892",
    change: "+15%",
    trend: "up" as const,
    icon: MessageSquare,
  },
];

const impactStats = [
  {
    label: "Hours Saved",
    value: "712",
    subtext: "this month",
    change: "+14%",
    trend: "up" as const,
    icon: Timer,
    color: "from-emerald-500 to-green-500",
    detail: "vs. 625 hrs last month",
  },
  {
    label: "Tasks Completed",
    value: "14,238",
    subtext: "all time",
    change: "+847",
    trend: "up" as const,
    icon: CheckCircle2,
    color: "from-primary to-blue-500",
    detail: "2,847 this week alone",
  },
  {
    label: "Money Saved",
    value: "$82,000",
    subtext: "this month",
    change: "+22%",
    trend: "up" as const,
    icon: DollarSign,
    color: "from-amber-500 to-orange-500",
    detail: "~$984k annualized",
  },
];

const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-heading gradient-hero-text">
                {t("dashboard.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("dashboard.subtitle")}
              </p>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2">
              <Link to="/dashboard/agents">
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg gradient-primary text-white text-xs font-semibold shadow-glow-sm hover:opacity-90 transition-opacity">
                  <Plus className="h-3.5 w-3.5" />
                  {t("dashboard.createAgent")}
                </button>
              </Link>
              <Link to="/dashboard/skills">
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg gradient-primary text-white text-xs font-semibold shadow-glow-sm hover:opacity-90 transition-opacity">
                  <Zap className="h-3.5 w-3.5" />
                  {t("dashboard.browseSkills")}
                </button>
              </Link>
              <Link to="/dashboard/integrations">
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg gradient-primary text-white text-xs font-semibold shadow-glow-sm hover:opacity-90 transition-opacity">
                  <Brain className="h-3.5 w-3.5" />
                  {t("dashboard.integrations")}
                </button>
              </Link>
            </div>
          </div>

          {/* ─── IMPACT SUMMARY ─── */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/[0.04] p-6">
            <div className="absolute top-3 right-4 flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <Sparkles className="h-3.5 w-3.5 text-amber-400/60" />
              {t("dashboard.aiImpactSummary")}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {impactStats.map((stat) => (
                <div key={stat.label} className="flex items-start gap-4">
                  <div
                    className={`flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${stat.color} shadow-glow-sm shrink-0`}
                  >
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold font-heading text-foreground tracking-tight">
                        {stat.value}
                      </p>
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                          stat.trend === "up" ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground/80 mt-0.5">
                      {stat.label}{" "}
                      <span className="text-muted-foreground font-normal">
                        {stat.subtext}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {stat.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Primary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {primaryStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} shadow-glow-sm`}
                  >
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                      stat.trend === "up" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold font-heading text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Agent performance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {agentPerformance.map((stat) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl border border-white/[0.06] p-4 card-hover"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
                      stat.trend === "up" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <p className="text-xl font-bold font-heading text-foreground mt-2">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* ─── IMPACT CHARTS ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-1">{t("dashboard.hoursSavedOverTime")}</h3>
              <p className="text-xs text-muted-foreground mb-4">{t("dashboard.hoursSavedOverTimeDesc")}</p>
              <HoursSavedChart />
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-1">{t("dashboard.hoursSavedByAgent")}</h3>
              <p className="text-xs text-muted-foreground mb-4">{t("dashboard.hoursSavedByAgentDesc")}</p>
              <AgentHoursSavedChart />
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-1">{t("dashboard.moneySavedBreakdown")}</h3>
              <p className="text-xs text-muted-foreground mb-4">{t("dashboard.moneySavedBreakdownDesc")}</p>
              <MoneySavedChart />
            </div>
          </div>

          {/* Analytics charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-1">{t("dashboard.clinicalTaskVolume")}</h3>
              <p className="text-xs text-muted-foreground mb-4">{t("dashboard.clinicalTaskVolumeDesc")}</p>
              <TaskVolumeChart />
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-1">{t("dashboard.practiceGrowth")}</h3>
              <p className="text-xs text-muted-foreground mb-4">{t("dashboard.practiceGrowthDesc")}</p>
              <TrendChart />
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-1">{t("dashboard.careOutcomes")}</h3>
              <p className="text-xs text-muted-foreground mb-4">{t("dashboard.careOutcomesDesc")}</p>
              <OutcomeChart />
            </div>
          </div>

          {/* ─── AGENT USAGE COST METER ─── */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Agent Usage & Cost Meter</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Real-time spend tracking per agent</p>
              </div>
              <Link to="/dashboard/command">
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
                  <Terminal className="h-3.5 w-3.5" />
                  Command Station
                </button>
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { name: "Dr. Front Desk", model: "OpenAI GPT-5", zone: "clinical", costToday: 4.13, costMonth: 87.40, tokens: 412500, pct: 53 },
                { name: "Marketing Maven", model: "Claude 3.5", zone: "external", costToday: 2.21, costMonth: 43.60, tokens: 198000, pct: 28 },
                { name: "Grant Pro", model: "Claude 3.5", zone: "operations", costToday: 0.00, costMonth: 21.30, tokens: 89200, pct: 14 },
                { name: "Clinical Coordinator", model: "Gemini 2.5 Pro", zone: "clinical", costToday: 0.72, costMonth: 8.10, tokens: 31400, pct: 5 },
              ].map((agent) => (
                <div key={agent.name} className="flex items-center gap-4">
                  <div className="w-36 shrink-0">
                    <p className="text-xs font-medium text-foreground truncate">{agent.name}</p>
                    <p className="text-[10px] text-muted-foreground">{agent.model}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${agent.zone === "clinical" ? "bg-red-400" : agent.zone === "operations" ? "bg-amber-400" : "bg-blue-400"}`}
                          style={{ width: `${agent.pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-8 text-right">{agent.pct}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{(agent.tokens / 1000).toFixed(0)}k tokens</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 w-28">
                    <p className="text-xs font-bold text-foreground">${agent.costToday.toFixed(2)} <span className="text-muted-foreground font-normal">today</span></p>
                    <p className="text-[10px] text-muted-foreground">${agent.costMonth.toFixed(2)} this month</p>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-foreground">Total This Month</span>
                </div>
                <span className="text-base font-bold text-foreground">$160.40 <span className="text-xs text-muted-foreground font-normal">/ ~$1,924 annualized</span></span>
              </div>
            </div>
          </div>

          {/* Bottom section: Agent tasks + Recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Agent tasks table - 2 cols */}
            <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">{t("dashboard.recentClinicalTasks")}</h3>
              <AgentTasksTable />
            </div>

            {/* Recent activity - 1 col */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">{t("dashboard.practiceActivityFeed")}</h3>
              <div className="space-y-4">
                {recentActivity.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="relative mt-1.5">
                      <div className="h-2 w-2 rounded-full bg-primary/60" />
                      {idx < recentActivity.length - 1 && (
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-px h-full bg-white/[0.06]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {item.action}
                      </p>
                      <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
