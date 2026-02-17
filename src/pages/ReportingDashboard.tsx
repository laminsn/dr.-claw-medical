import { useState } from "react";
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
// Mock Data
// ---------------------------------------------------------------------------

const initialTemplates: ReportTemplate[] = [
  {
    id: "tpl-1",
    name: "Agent Performance Report",
    description: "Comprehensive analysis of agent response times, task completion rates, and efficiency metrics across all active agents.",
    icon: BarChart3,
    lastGenerated: "Feb 14, 2026",
    generating: false,
  },
  {
    id: "tpl-2",
    name: "Task Completion Summary",
    description: "Detailed breakdown of completed, pending, and failed tasks with trend analysis and bottleneck identification.",
    icon: CheckSquare,
    lastGenerated: "Feb 13, 2026",
    generating: false,
  },
  {
    id: "tpl-3",
    name: "PHI Audit Trail",
    description: "Full audit log of all Protected Health Information access events, modifications, and data handling compliance records.",
    icon: ShieldCheck,
    lastGenerated: "Feb 15, 2026",
    generating: false,
  },
  {
    id: "tpl-4",
    name: "Financial Summary",
    description: "Revenue tracking, cost analysis, billing summaries, and financial projections based on operational data.",
    icon: DollarSign,
    lastGenerated: "Feb 10, 2026",
    generating: false,
  },
  {
    id: "tpl-5",
    name: "Compliance Report",
    description: "HIPAA compliance status, policy adherence metrics, training completion rates, and regulatory requirement tracking.",
    icon: ClipboardList,
    lastGenerated: "Feb 12, 2026",
    generating: false,
  },
  {
    id: "tpl-6",
    name: "Communication Analytics",
    description: "Analysis of all communication channels including SMS, email, voice calls, with volume trends and response metrics.",
    icon: MessageSquare,
    lastGenerated: "Feb 14, 2026",
    generating: false,
  },
  {
    id: "tpl-7",
    name: "Patient Engagement Report",
    description: "Patient interaction metrics, appointment adherence rates, satisfaction scores, and engagement trend analysis.",
    icon: Heart,
    lastGenerated: "Feb 11, 2026",
    generating: false,
  },
  {
    id: "tpl-8",
    name: "Team Productivity",
    description: "Staff and agent combined productivity metrics, workload distribution, and output quality measurements.",
    icon: Users,
    lastGenerated: "Feb 13, 2026",
    generating: false,
  },
];

const initialScheduledReports: ScheduledReport[] = [
  {
    id: "sched-1",
    name: "Daily Agent Performance Summary",
    frequency: "Daily",
    nextRun: "Feb 17, 2026 — 6:00 AM",
    recipients: "admin@drclaw.com",
    format: "PDF",
    status: "Active",
  },
  {
    id: "sched-2",
    name: "Weekly Task Completion Digest",
    frequency: "Weekly",
    nextRun: "Feb 23, 2026 — 8:00 AM",
    recipients: "ops@drclaw.com, admin@drclaw.com",
    format: "Excel",
    status: "Active",
  },
  {
    id: "sched-3",
    name: "Monthly PHI Audit Report",
    frequency: "Monthly",
    nextRun: "Mar 1, 2026 — 7:00 AM",
    recipients: "compliance@drclaw.com",
    format: "PDF",
    status: "Active",
  },
  {
    id: "sched-4",
    name: "Quarterly Financial Summary",
    frequency: "Quarterly",
    nextRun: "Apr 1, 2026 — 9:00 AM",
    recipients: "finance@drclaw.com, admin@drclaw.com",
    format: "Excel",
    status: "Paused",
  },
  {
    id: "sched-5",
    name: "Weekly Communication Analytics",
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
    name: "Agent Performance Report",
    type: "Automated",
    generatedDate: "Feb 16, 2026 — 6:02 AM",
    fileSize: "2.4 MB",
    format: "PDF",
  },
  {
    id: "exp-2",
    name: "PHI Audit Trail",
    type: "On-Demand",
    generatedDate: "Feb 15, 2026 — 3:15 PM",
    fileSize: "5.1 MB",
    format: "PDF",
  },
  {
    id: "exp-3",
    name: "Task Completion Summary",
    type: "Scheduled",
    generatedDate: "Feb 15, 2026 — 8:00 AM",
    fileSize: "1.8 MB",
    format: "Excel",
  },
  {
    id: "exp-4",
    name: "Communication Analytics",
    type: "On-Demand",
    generatedDate: "Feb 14, 2026 — 4:30 PM",
    fileSize: "3.2 MB",
    format: "CSV",
  },
  {
    id: "exp-5",
    name: "Compliance Report",
    type: "Scheduled",
    generatedDate: "Feb 14, 2026 — 7:00 AM",
    fileSize: "4.7 MB",
    format: "PDF",
  },
  {
    id: "exp-6",
    name: "Patient Engagement Report",
    type: "On-Demand",
    generatedDate: "Feb 13, 2026 — 2:45 PM",
    fileSize: "1.3 MB",
    format: "PDF",
  },
  {
    id: "exp-7",
    name: "Financial Summary",
    type: "Automated",
    generatedDate: "Feb 12, 2026 — 9:00 AM",
    fileSize: "2.9 MB",
    format: "Excel",
  },
  {
    id: "exp-8",
    name: "Team Productivity",
    type: "On-Demand",
    generatedDate: "Feb 11, 2026 — 11:20 AM",
    fileSize: "1.6 MB",
    format: "CSV",
  },
];

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
  const { toast } = useToast();

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
    "Agent Tasks": true,
    "Response Times": false,
    "Success Rates": true,
    "PHI Events": false,
    "Communication Volume": true,
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
      title: "Generating report",
      description: `Your report is being generated. This may take a moment.`,
    });

    setTimeout(() => {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === templateId
            ? { ...t, generating: false, lastGenerated: "Feb 16, 2026" }
            : t,
        ),
      );
      const template = templates.find((t) => t.id === templateId);
      toast({
        title: "Report ready",
        description: `"${template?.name}" has been generated and is available for download.`,
      });
    }, 2000);
  };

  const handleToggleSchedule = (scheduleId: string) => {
    setScheduledReports((prev) =>
      prev.map((r) => {
        if (r.id === scheduleId) {
          const newStatus: ScheduleStatus = r.status === "Active" ? "Paused" : "Active";
          toast({
            title: `Schedule ${newStatus.toLowerCase()}`,
            description: `"${r.name}" has been ${newStatus.toLowerCase()}.`,
          });
          return { ...r, status: newStatus };
        }
        return r;
      }),
    );
  };

  const handleDownload = (exportEntry: ExportEntry) => {
    toast({
      title: "Download started",
      description: `Downloading "${exportEntry.name}" (${exportEntry.fileSize}) as ${exportEntry.format}.`,
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
        title: "No metrics selected",
        description: "Please select at least one metric for your custom report.",
      });
      return;
    }

    setCustomGenerating(true);
    toast({
      title: "Custom report generating",
      description: `Building report with ${selectedMetrics.length} metrics in ${customFormat} format.`,
    });

    setTimeout(() => {
      setCustomGenerating(false);
      toast({
        title: "Custom report ready",
        description: `Your custom report (${customStartDate} to ${customEndDate}) is available for download.`,
      });
    }, 2500);
  };

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  const stats = [
    {
      label: "Reports Generated",
      value: "148",
      change: "+12 this week",
      icon: FileText,
    },
    {
      label: "Compliance Score",
      value: "97.3%",
      change: "+1.2% from last month",
      icon: ShieldCheck,
    },
    {
      label: "Data Exports",
      value: "64",
      change: "8 pending",
      icon: Download,
    },
    {
      label: "Scheduled Reports",
      value: String(scheduledReports.filter((r) => r.status === "Active").length),
      change: `of ${scheduledReports.length} total`,
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
              Clinical Reporting & Exports
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate HIPAA-compliant clinical reports, compliance audits, and practice analytics.
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
                  Report Templates
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select a template to generate a report instantly
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
                      Last generated: {template.lastGenerated}
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
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 mr-1.5" />
                          Generate
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
                  Scheduled Reports
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Recurring reports delivered automatically
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-white/[0.06] overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_100px_160px_1fr_80px_90px] gap-3 px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-white/[0.06]">
                <span>Report Name</span>
                <span>Frequency</span>
                <span>Next Run</span>
                <span>Recipients</span>
                <span>Format</span>
                <span className="text-right">Status</span>
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
                        {report.status}
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
                  Export History
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Recent reports and data exports
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-white/[0.06] overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_100px_160px_80px_70px_80px] gap-3 px-5 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-white/[0.06]">
                <span>Report Name</span>
                <span>Type</span>
                <span>Generated</span>
                <span>Size</span>
                <span>Format</span>
                <span className="text-right">Action</span>
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
                        Download
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
                  Custom Report Builder
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Build a tailored report with custom date ranges and metrics
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-white/[0.06] p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Date Range */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Date Range
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Start Date</Label>
                      <Input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">End Date</Label>
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
                    Metrics
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
                    Output Format
                  </h3>
                  <div className="space-y-3">
                    <Select
                      value={customFormat}
                      onValueChange={(value: ReportFormat) => setCustomFormat(value)}
                    >
                      <SelectTrigger className="bg-white/[0.03] border-white/10 focus:border-primary/50">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="CSV">CSV</SelectItem>
                        <SelectItem value="Excel">Excel</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="pt-2">
                      <p className="text-[10px] text-muted-foreground mb-3">
                        Selected: {Object.values(customMetrics).filter(Boolean).length} metrics
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
                            Generating Custom Report...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Generate Custom Report
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
