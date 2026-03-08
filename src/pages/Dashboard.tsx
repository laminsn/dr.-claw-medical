import { useState } from "react";
import {
  Activity,
  Users,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Sparkles,
  Terminal,
  Timer,
  CheckCircle2,
  Zap,
  LayoutGrid,
  List,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import KpiCards, { type KpiCardData } from "@/components/dashboard/KpiCards";
import ComplianceGauges from "@/components/dashboard/ComplianceGauges";
import DCMFunnelChart from "@/components/dashboard/FunnelChart";
import PipelineChart from "@/components/dashboard/PipelineChart";
import AgentWorkloadHeatmap from "@/components/dashboard/AgentWorkloadHeatmap";
import AgentHealthGrid from "@/components/dashboard/AgentHealthGrid";
import QuickChatDrawer from "@/components/dashboard/QuickChatDrawer";
import { CHART_COLORS } from "@/components/dashboard/chartConstants";
import {
  TaskVolumeChart,
  TrendChart,
  OutcomeChart,
  AgentTasksTable,
  HoursSavedChart,
  MoneySavedChart,
  AgentHoursSavedChart,
} from "@/components/dashboard/AnalyticsCharts";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

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

const kpiCards: KpiCardData[] = [
  {
    title: "Active Clinical Agents",
    value: "12",
    change: "+3",
    trend: "up",
    sparkData: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    icon: Bot,
    color: "from-primary to-blue-600",
    sparkColor: CHART_COLORS.primary,
  },
  {
    title: "Patient Tasks This Week",
    value: "2,847",
    change: "+18%",
    trend: "up",
    sparkData: [1200, 1800, 2100, 1900, 2400, 2600, 2847],
    icon: Activity,
    color: "from-cyan-500 to-accent",
    sparkColor: CHART_COLORS.cyan,
  },
  {
    title: "Medical Skills Active",
    value: "34",
    change: "+8",
    trend: "up",
    sparkData: [18, 20, 22, 25, 28, 30, 32, 34],
    icon: Zap,
    color: "from-violet-500 to-purple-600",
    sparkColor: CHART_COLORS.violet,
  },
  {
    title: "Care Team Members",
    value: "8",
    change: "+2",
    trend: "up",
    sparkData: [3, 4, 4, 5, 6, 6, 7, 8],
    icon: Users,
    color: "from-emerald-500 to-green-600",
    sparkColor: CHART_COLORS.emerald,
  },
];

const funnelData = [
  { name: "Leads", value: 2400, fill: CHART_COLORS.primary },
  { name: "Qualified", value: 1800, fill: CHART_COLORS.cyan },
  { name: "Demo", value: 1200, fill: CHART_COLORS.violet },
  { name: "Proposal", value: 800, fill: CHART_COLORS.amber },
  { name: "Closed", value: 480, fill: CHART_COLORS.emerald },
];

const pipelineStages = [
  { name: "Discovery", value: 120000, color: CHART_COLORS.primary },
  { name: "Qualification", value: 95000, color: CHART_COLORS.cyan },
  { name: "Proposal", value: 78000, color: CHART_COLORS.violet },
  { name: "Negotiation", value: 52000, color: CHART_COLORS.amber },
  { name: "Closed Won", value: 185000, color: CHART_COLORS.emerald },
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

const DASHBOARD_VIEW_KEY = "dcm-dashboard-view";

const Dashboard = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"quick" | "full">(() => {
    try {
      return (localStorage.getItem(DASHBOARD_VIEW_KEY) as "quick" | "full") ?? "quick";
    } catch {
      return "quick";
    }
  });

  const toggleView = (mode: "quick" | "full") => {
    setViewMode(mode);
    try { localStorage.setItem(DASHBOARD_VIEW_KEY, mode); } catch { /* ignore */ }
  };

  return (
    <DashboardLayout>
      <main className="flex-1 p-8 overflow-y-auto">
        <motion.div
          className="max-w-7xl mx-auto space-y-6"
          variants={stagger}
          initial="initial"
          animate="animate"
        >
          {/* Welcome Header + View Toggle */}
          <motion.div variants={fadeInUp}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <WelcomeHeader />
              </div>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 shrink-0 mt-1">
                <button
                  onClick={() => toggleView("quick")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    viewMode === "quick"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  {t("dashboard.quickView", "Quick")}
                </button>
                <button
                  onClick={() => toggleView("full")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    viewMode === "full"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  {t("dashboard.fullView", "Full")}
                </button>
              </div>
            </div>
          </motion.div>

          {/* KPI Cards with Sparklines */}
          <motion.div variants={fadeInUp}>
            <KpiCards cards={kpiCards} />
          </motion.div>

          {/* Quick View: Agent Health + Alerts only */}
          {viewMode === "quick" && (
            <>
              <motion.div variants={fadeInUp}>
                <AgentHealthGrid />
              </motion.div>

              <motion.div variants={fadeInUp}>
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    {t("dashboard.practiceActivityFeed")}
                  </h3>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto">
                    {recentActivity.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground leading-relaxed">{item.action}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Full View: Everything */}
          {viewMode === "full" && (
            <>

          {/* Impact Summary */}
          <motion.div variants={fadeInUp}>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/[0.04] p-6">
              <div className="absolute top-3 right-4 flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <Sparkles className="h-3.5 w-3.5 text-amber-400/60" />
                {t("dashboard.aiImpactSummary")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {impactStats.map((stat) => (
                  <div key={stat.label} className="flex items-start gap-4">
                    <div className={`flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${stat.color} shadow-glow-sm shrink-0`}>
                      <stat.icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold font-heading text-foreground tracking-tight">{stat.value}</p>
                        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${stat.trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                          {stat.trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground/80 mt-0.5">
                        {stat.label} <span className="text-muted-foreground font-normal">{stat.subtext}</span>
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{stat.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Compliance Gauges + Sales Funnel */}
          <motion.div variants={fadeInUp}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  {t("dashboard.platformHealth", "Platform Health")}
                </h3>
                <ComplianceGauges />
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {t("dashboard.salesPipeline", "Sales Pipeline")}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {t("dashboard.salesPipelineDesc", "Healthcare practice acquisition funnel")}
                </p>
                <DCMFunnelChart data={funnelData} height={260} />
              </div>
            </div>
          </motion.div>

          {/* Revenue Pipeline */}
          <motion.div variants={fadeInUp}>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {t("dashboard.revenuePipeline", "Revenue Pipeline")}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {t("dashboard.revenuePipelineDesc", "Active deal value by stage")}
              </p>
              <PipelineChart stages={pipelineStages} />
            </div>
          </motion.div>

          {/* Impact Charts */}
          <motion.div variants={fadeInUp}>
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
          </motion.div>

          {/* Analytics Charts */}
          <motion.div variants={fadeInUp}>
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
          </motion.div>

          {/* Agent Usage Cost Meter */}
          <motion.div variants={fadeInUp}>
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{t("dashboard.agentUsageCost")}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.agentUsageCostDesc")}</p>
                </div>
                <Link to="/dashboard/command">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
                    <Terminal className="h-3.5 w-3.5" />
                    {t("dashboard.commandStation")}
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
                        <span className="text-[10px] text-muted-foreground">{(agent.tokens / 1000).toFixed(0)}k {t("commandStation.tokensUsed").toLowerCase()}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 w-28">
                      <p className="text-xs font-bold text-foreground">${agent.costToday.toFixed(2)} <span className="text-muted-foreground font-normal">{t("commandStation.today").toLowerCase()}</span></p>
                      <p className="text-[10px] text-muted-foreground">${agent.costMonth.toFixed(2)} {t("dashboard.thisMonth")}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-foreground">{t("dashboard.totalThisMonth")}</span>
                  </div>
                  <span className="text-base font-bold text-foreground">$160.40 <span className="text-xs text-muted-foreground font-normal">/ ~$1,924 {t("dashboard.annualized")}</span></span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Workload Heatmap + Activity Feed */}
          <motion.div variants={fadeInUp}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  {t("dashboard.agentWorkload", "Agent Workload")}
                </h3>
                <AgentWorkloadHeatmap />
              </div>
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
                        <p className="text-xs text-foreground/80 leading-relaxed">{item.action}</p>
                        <p className="text-[11px] text-muted-foreground/50 mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Clinical Tasks Table */}
          <motion.div variants={fadeInUp}>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">{t("dashboard.recentClinicalTasks")}</h3>
              <AgentTasksTable />
            </div>
          </motion.div>

            </>
          )}
        </motion.div>
      </main>
      <QuickChatDrawer />
    </DashboardLayout>
  );
};

export default Dashboard;
