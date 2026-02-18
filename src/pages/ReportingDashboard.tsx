import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  BarChart3,
  ShieldCheck,
  Download,
  Calendar,
  Clock,
  Play,
  Users,
  TrendingUp,
  Activity,
  MessageSquare,
  Heart,
  DollarSign,
  ClipboardList,
  CheckSquare,
  Filter,
  FileSpreadsheet,
  File,
  Mail,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReportFormat = "PDF" | "CSV" | "Excel";
type ScheduleFrequency = "Daily" | "Weekly" | "Monthly" | "Quarterly";
type ScheduleStatus = "Active" | "Paused";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
  lastGenerated: string;
  generating: boolean;
}

interface ScheduledReport {
  id: string;
  name: string;
  frequency: ScheduleFrequency;
  nextRun: string;
  recipients: string;
  format: ReportFormat;
  status: ScheduleStatus;
}

interface ExportEntry {
  id: string;
  name: string;
  type: string;
  generatedDate: string;
  fileSize: string;
  format: ReportFormat;
}

// ---------------------------------------------------------------------------
// Format badge helper
// ---------------------------------------------------------------------------

const FORMAT_CONFIG: Record<ReportFormat, { color: string; icon: typeof FileText }> = {
  PDF: { color: "text-red-400 bg-red-500/10 border-red-500/20", icon: File },
  CSV: { color: "text-green-400 bg-green-500/10 border-green-500/20", icon: FileSpreadsheet },
  Excel: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: FileSpreadsheet },
};

const FREQUENCY_CONFIG: Record<ScheduleFrequency, string> = {
  Daily: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Weekly: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  Monthly: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Quarterly: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ReportingDashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  // ---------------------------------------------------------------------------
  // Mock Data (inside component for t() access)
  // ---------------------------------------------------------------------------

  const initialTemplates: ReportTemplate[] = [
    {
      id: "tpl-1",
      name: t("reporting.templateAgentPerformance"),
      description: t("reporting.templateAgentPerformanceDesc"),
      icon: BarChart3,
      lastGenerated: "Feb 14, 2026",
      generating: false,
    },
    {
      id: "tpl-2",
      name: t("reporting.templateTaskCompletion"),
      description: t("reporting.templateTaskCompletionDesc"),
      icon: CheckSquare,
      lastGenerated: "Feb 13, 2026",
      generating: false,
    },
    {
      id: "tpl-3",
      name: t("reporting.templatePhiAudit"),
      description: t("reporting.templatePhiAuditDesc"),
      icon: ShieldCheck,
      lastGenerated: "Feb 15, 2026",
      generating: false,
    },
    {
      id: "tpl-4",
      name: t("reporting.templateFinancialSummary"),
      description: t("reporting.templateFinancialSummaryDesc"),
      icon: DollarSign,
      lastGenerated: "Feb 10, 2026",
      generating: false,
    },
    {
      id: "tpl-5",
      name: t("reporting.templateComplianceReport"),
      description: t("reporting.templateComplianceReportDesc"),
      icon: ClipboardList,
      lastGenerated: "Feb 12, 2026",
      generating: false,
    },
    {
      id: "tpl-6",
      name: t("reporting.templateCommunicationAnalytics"),
      description: t("reporting.templateCommunicationAnalyticsDesc"),
      icon: MessageSquare,
      lastGenerated: "Feb 14, 2026",
      generating: false,
    },
    {
      id: "tpl-7",
      name: t("reporting.templatePatientEngagement"),
      description: t("reporting.templatePatientEngagementDesc"),
      icon: Heart,
      lastGenerated: "Feb 11, 2026",
      generating: false,
    },
    {
      id: "tpl-8",
      name: t("reporting.templateTeamProductivity"),
      description: t("reporting.templateTeamProductivityDesc"),
      icon: Users,
      lastGenerated: "Feb 13, 2026",
      generating: false,
    },
  ];

  const initialScheduledReports: ScheduledReport[] = [
    {
      id: "sched-1",
      name: t("reporting.schedDailyAgentPerformance"),
      frequency: "Daily",
      nextRun: "Feb 17, 2026 — 6:00 AM",
      recipients: "admin@drclaw.com",
      format: "PDF",
      status: "Active",
    },
    {
      id: "sched-2",
      name: t("reporting.schedWeeklyTaskCompletion"),
      frequency: "Weekly",
      nextRun: "Feb 23, 2026 — 8:00 AM",
      recipients: "ops@drclaw.com, admin@drclaw.com",
      format: "Excel",
      status: "Active",
    },
    {
      id: "sched-3",
      name: t("reporting.schedMonthlyPhiAudit"),
      frequency: "Monthly",
      nextRun: "Mar 1, 2026 — 7:00 AM",
      recipients: "compliance@drclaw.com",
      format: "PDF",
      status: "Active",
    },
    {
      id: "sched-4",
      name: t("reporting.schedQuarterlyFinancial"),
      frequency: "Quarterly",
      nextRun: "Apr 1, 2026 — 9:00 AM",
      recipients: "finance@drclaw.com, admin@drclaw.com",
      format: "Excel",
      status: "Paused",
    },
    {
      id: "sched-5",
      name: t("reporting.schedWeeklyCommunication"),
      frequency: "Weekly",
      nextRun: "Feb 23, 2026 — 7:30 AM",
      recipients: "marketing@drclaw.com",
      format: "CSV",
      status: "Active",
    },
  ];

  const initialExportHistory: ExportEntry[] = [
    {
      id: "exp-1",
      name: t("reporting.templateAgentPerformance"),
      type: t("reporting.typeAutomated"),
      generatedDate: "Feb 16, 2026 — 6:02 AM",
      fileSize: "2.4 MB",
      format: "PDF",
    },
    {
      id: "exp-2",
      name: t("reporting.templatePhiAudit"),
      type: t("reporting.typeOnDemand"),
      generatedDate: "Feb 15, 2026 — 3:15 PM",
      fileSize: "5.1 MB",
      format: "PDF",
    },
    {
      id: "exp-3",
      name: t("reporting.templateTaskCompletion"),
      type: t("reporting.typeScheduled"),
      generatedDate: "Feb 15, 2026 — 8:00 AM",
      fileSize: "1.8 MB",
      format: "Excel",
    },
    {
      id: "exp-4",
      name: t("reporting.templateCommunicationAnalytics"),
      type: t("reporting.typeOnDemand"),
      generatedDate: "Feb 14, 2026 — 4:30 PM",
      fileSize: "3.2 MB",
      format: "CSV",
    },
    {
      id: "exp-5",
      name: t("reporting.templateComplianceReport"),
      type: t("reporting.typeScheduled"),
      generatedDate: "Feb 14, 2026 — 7:00 AM",
      fileSize: "4.7 MB",
      format: "PDF",
    },
    {
      id: "exp-6",
      name: t("reporting.templatePatientEngagement"),
      type: t("reporting.typeOnDemand"),
      generatedDate: "Feb 13, 2026 — 2:45 PM",
      fileSize: "1.3 MB",
      format: "PDF",
    },
    {
      id: "exp-7",
      name: t("reporting.templateFinancialSummary"),
      type: t("reporting.typeAutomated"),
      generatedDate: "Feb 12, 2026 — 9:00 AM",
      fileSize: "2.9 MB",
      format: "Excel",
    },
    {
      id: "exp-8",
      name: t("reporting.templateTeamProductivity"),
      type: t("reporting.typeOnDemand"),
      generatedDate: "Feb 11, 2026 — 11:20 AM",
      fileSize: "1.6 MB",
      format: "CSV",
    },
  ];

  // --- Report templates ---
  const [templates, setTemplates] = useState<ReportTemplate[]>(initialTemplates);

  // --- Scheduled reports ---
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(initialScheduledReports);

  // --- Export history ---
  const [exportHistory] = useState<ExportEntry[]>(initialExportHistory);

  // --- Custom report builder ---
  const [customStartDate, setCustomStartDate] = useState("2026-02-01");
  const [customEndDate, setCustomEndDate] = useState("2026-02-16");
  const [customMetrics, setCustomMetrics] = useState<Record<string, boolean>>({
    [t("reporting.metricAgentTasks")]: true,
    [t("reporting.metricResponseTimes")]: false,
    [t("reporting.metricSuccessRates")]: true,
    [t("reporting.metricPhiEvents")]: false,
    [t("reporting.metricCommunicationVolume")]: true,
  });
  const [customFormat, setCustomFormat] = useState<ReportFormat>("PDF");
  const [customGenerating, setCustomGenerating] = useState(false);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleGenerateReport = (templateId: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === templateId ? { ...t, generating: true } : t)),
    );
    toast({
      title: t("reporting.toastGeneratingTitle"),
      description: t("reporting.toastGeneratingDesc"),
    });

    setTimeout(() => {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === templateId
            ? { ...t, generating: false, lastGenerated: "Feb 16, 2026" }
            : t,
        ),
      );
      const template = templates.find((tpl) => tpl.id === templateId);
      toast({
        title: t("reporting.toastReportReadyTitle"),
        description: t("reporting.toastReportReadyDesc", { name: template?.name }),
      });
    }, 2000);
  };

  const handleToggleSchedule = (scheduleId: string) => {
    setScheduledReports((prev) =>
      prev.map((r) => {
        if (r.id === scheduleId) {
          const newStatus: ScheduleStatus = r.status === "Active" ? "Paused" : "Active";
          toast({
            title: t("reporting.toastScheduleToggleTitle", { status: newStatus.toLowerCase() }),
            description: t("reporting.toastScheduleToggleDesc", { name: r.name, status: newStatus.toLowerCase() }),
          });
          return { ...r, status: newStatus };
        }
        return r;
      }),
    );
  };

  const handleDownload = (exportEntry: ExportEntry) => {
    const reportContent = [
      "=".repeat(60),
      `  ${exportEntry.name}`,
      "=".repeat(60),
      "",
      `Generated:  ${exportEntry.generatedDate}`,
      `Type:       ${exportEntry.type}`,
      `Format:     ${exportEntry.format}`,
      `File Size:  ${exportEntry.fileSize}`,
      "",
      "-".repeat(60),
      "",
      "Report Summary",
      "",
      "This report was generated by Dr. Claw Medical's automated",
      "reporting system. All data is HIPAA-compliant and has been",
      "processed through the PHI sanitization pipeline.",
      "",
      "-".repeat(60),
      "",
      "Dr. Claw Medical — Clinical Reporting & Exports",
    ].join("\n");
    const ext = exportEntry.format === "CSV" ? "csv" : exportEntry.format === "Excel" ? "xlsx" : "txt";
    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${exportEntry.name.replace(/\s+/g, "-").toLowerCase()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: t("reporting.toastDownloadTitle"),
      description: t("reporting.toastDownloadDesc", { name: exportEntry.name, size: exportEntry.fileSize }),
    });
  };

  const handleCustomMetricToggle = (metric: string) => {
    setCustomMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

  const handleGenerateCustomReport = () => {
    const selectedMetrics = Object.entries(customMetrics)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (selectedMetrics.length === 0) {
      toast({
        title: t("reporting.toastNoMetricsTitle"),
        description: t("reporting.toastNoMetricsDesc"),
      });
      return;
    }

    setCustomGenerating(true);
    toast({
      title: t("reporting.toastCustomGeneratingTitle"),
      description: t("reporting.toastCustomGeneratingDesc", { count: selectedMetrics.length, format: customFormat }),
    });

    setTimeout(() => {
      setCustomGenerating(false);
      toast({
        title: t("reporting.toastCustomReadyTitle"),
        description: t("reporting.toastCustomReadyDesc", { startDate: customStartDate, endDate: customEndDate }),
      });
    }, 2500);
  };

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const stats = [
    {
      label: t("reporting.statsReportsGenerated"),
      value: "148",
      change: t("reporting.statsReportsGeneratedChange"),
      icon: FileText,
    },
    {
      label: t("reporting.statsComplianceScore"),
      value: "97.3%",
      change: t("reporting.statsComplianceScoreChange"),
      icon: ShieldCheck,
    },
    {
      label: t("reporting.statsDataExports"),
      value: "64",
      change: t("reporting.statsDataExportsChange"),
      icon: Download,
    },
    {
      label: t("reporting.statsScheduledReports"),
      value: String(scheduledReports.filter((r) => r.status === "Active").length),
      change: t("reporting.statsScheduledReportsChange", { total: scheduledReports.length }),
      icon: Calendar,
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold font-heading gradient-hero-text">
              {t("reporting.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("reporting.subtitle")}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                      <StatIcon className="h-5 w-5 text-white" />
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{stat.change}</p>
                </div>
              );
            })}
          </div>

          <Separator className="border-white/[0.06]" />

          {/* Report Templates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t("reporting.reportTemplates")}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("reporting.reportTemplatesDesc")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((template) => {
                const TemplateIcon = template.icon;
                return (
                  <div
                    key={template.id}
                    className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover flex flex-col"
                  >
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm mb-3">
                      <TemplateIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {template.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2 flex-1">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-3">
                      <Clock className="h-3 w-3" />
                      {t("reporting.lastGenerated")}: {template.lastGenerated}
                    </div>
                    <Button
                      size="sm"
                      className="w-full gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90 text-xs"
                      disabled={template.generating}
                      onClick={() => handleGenerateReport(template.id)}
                    >
                      {template.generating ? (
                        <>
                          <Activity className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          {t("reporting.generating")}
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 mr-1.5" />
                          {t("reporting.generate")}
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator className="border-white/[0.06]" />

          {/* Scheduled Reports */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  {t("reporting.scheduledReports")}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("reporting.scheduledReportsDesc")}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-white/[0.06] overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_100px_160px_1fr_80px_90px] gap-3 px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-white/[0.06]">
                <span>{t("reporting.colReportName")}</span>
                <span>{t("reporting.colFrequency")}</span>
                <span>{t("reporting.colNextRun")}</span>
                <span>{t("reporting.colRecipients")}</span>
                <span>{t("reporting.colFormat")}</span>
                <span className="text-right">{t("reporting.colStatus")}</span>
              </div>

              {/* Table rows */}
              {scheduledReports.map((report) => {
                const formatCfg = FORMAT_CONFIG[report.format];
                return (
                  <div
                    key={report.id}
                    className="grid grid-cols-[1fr_100px_160px_1fr_80px_90px] gap-3 px-5 py-3 items-center border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground truncate">
                      {report.name}
                    </span>
                    <span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] border ${FREQUENCY_CONFIG[report.frequency]} px-1.5 py-0`}
                      >
                        {report.frequency}
                      </Badge>
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {report.nextRun}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{report.recipients}</span>
                    </span>
                    <span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] border ${formatCfg.color} px-1.5 py-0`}
                      >
                        {report.format}
                      </Badge>
                    </span>
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className={`text-[10px] font-medium ${
                          report.status === "Active" ? "text-green-400" : "text-amber-400"
                        }`}
                      >
                        {report.status === "Active" ? t("reporting.statusActive") : t("reporting.statusPaused")}
                      </span>
                      <Switch
                        checked={report.status === "Active"}
                        onCheckedChange={() => handleToggleSchedule(report.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator className="border-white/[0.06]" />

          {/* Export History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  {t("reporting.exportHistory")}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("reporting.exportHistoryDesc")}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-white/[0.06] overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_100px_160px_80px_70px_80px] gap-3 px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-white/[0.06]">
                <span>{t("reporting.colReportName")}</span>
                <span>{t("reporting.colType")}</span>
                <span>{t("reporting.colGenerated")}</span>
                <span>{t("reporting.colSize")}</span>
                <span>{t("reporting.colFormat")}</span>
                <span className="text-right">{t("reporting.colAction")}</span>
              </div>

              {/* Table rows */}
              {exportHistory.map((entry) => {
                const formatCfg = FORMAT_CONFIG[entry.format];
                return (
                  <div
                    key={entry.id}
                    className="grid grid-cols-[1fr_100px_160px_80px_70px_80px] gap-3 px-5 py-3 items-center border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground truncate">
                      {entry.name}
                    </span>
                    <span>
                      <Badge
                        variant="outline"
                        className="text-[10px] border-border text-muted-foreground px-1.5 py-0"
                      >
                        {entry.type}
                      </Badge>
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {entry.generatedDate}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {entry.fileSize}
                    </span>
                    <span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] border ${formatCfg.color} px-1.5 py-0`}
                      >
                        {entry.format}
                      </Badge>
                    </span>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] border-border text-muted-foreground hover:text-foreground hover:bg-white/5 gap-1"
                        onClick={() => handleDownload(entry)}
                      >
                        <Download className="h-3 w-3" />
                        {t("reporting.download")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator className="border-white/[0.06]" />

          {/* Custom Report Builder */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  {t("reporting.customReportBuilder")}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("reporting.customReportBuilderDesc")}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-white/[0.06] p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Date Range */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {t("reporting.dateRange")}
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{t("reporting.startDate")}</Label>
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{t("reporting.endDate")}</Label>
                      <Input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Metrics Selection */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    {t("reporting.metrics")}
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(customMetrics).map(([metric, checked]) => (
                      <div key={metric} className="flex items-center gap-3">
                        <Checkbox
                          id={`metric-${metric}`}
                          checked={checked}
                          onCheckedChange={() => handleCustomMetricToggle(metric)}
                        />
                        <Label
                          htmlFor={`metric-${metric}`}
                          className="text-sm text-foreground/80 cursor-pointer"
                        >
                          {metric}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Format + Generate */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {t("reporting.outputFormat")}
                  </h3>
                  <div className="space-y-3">
                    <Select
                      value={customFormat}
                      onValueChange={(value: ReportFormat) => setCustomFormat(value)}
                    >
                      <SelectTrigger className="bg-white/[0.03] border-white/10 focus:border-primary/50">
                        <SelectValue placeholder={t("reporting.selectFormat")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="CSV">CSV</SelectItem>
                        <SelectItem value="Excel">Excel</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="pt-2">
                      <p className="text-[10px] text-muted-foreground mb-3">
                        {t("reporting.selectedSummary", { count: Object.values(customMetrics).filter(Boolean).length })}
                        {" | "}
                        {customStartDate} to {customEndDate}
                        {" | "}
                        {customFormat}
                      </p>
                      <Button
                        className="w-full gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90"
                        disabled={customGenerating}
                        onClick={handleGenerateCustomReport}
                      >
                        {customGenerating ? (
                          <>
                            <Activity className="h-4 w-4 mr-2 animate-spin" />
                            {t("reporting.generatingCustomReport")}
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            {t("reporting.generateCustomReport")}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportingDashboard;
