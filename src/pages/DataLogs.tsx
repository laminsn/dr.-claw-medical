import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollText,
  Search,
  Filter,
  Bot,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  ChevronRight,
  Download,
  Calendar,
  ArrowUpDown,
  Zap,
  Globe,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Database,
  Shield,
  RefreshCw,
  Activity,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type LogLevel = "info" | "success" | "warning" | "error";
type LogCategory = "communication" | "task" | "api" | "system" | "auth" | "integration";

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  agentName: string;
  agentId: string;
  action: string;
  details: string;
  metadata?: Record<string, string>;
  duration?: string;
}

const LEVEL_STYLE: Record<LogLevel, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  success: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  error: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

const CATEGORY_STYLE: Record<LogCategory, { icon: typeof MessageSquare; color: string }> = {
  communication: { icon: MessageSquare, color: "text-violet-400" },
  task: { icon: Zap, color: "text-cyan-400" },
  api: { icon: Globe, color: "text-orange-400" },
  system: { icon: Database, color: "text-zinc-400" },
  auth: { icon: Shield, color: "text-emerald-400" },
  integration: { icon: RefreshCw, color: "text-pink-400" },
};

const mockLogs: LogEntry[] = [
  {
    id: "log-1",
    timestamp: "10:42:15 AM",
    level: "success",
    category: "communication",
    agentName: "Dr. Front Desk",
    agentId: "1",
    action: "SMS Sent",
    details: "Appointment confirmation sent to Sarah Mitchell (+1 555-234-5678)",
    metadata: { channel: "SMS", recipient: "Sarah Mitchell", template: "appointment_confirm" },
    duration: "320ms",
  },
  {
    id: "log-2",
    timestamp: "10:41:58 AM",
    level: "info",
    category: "task",
    agentName: "Dr. Front Desk",
    agentId: "1",
    action: "Task Progress Updated",
    details: "Follow-up scheduling task progress updated: 9 of 15 appointments confirmed",
    metadata: { taskId: "task-1", progress: "60%", remaining: "6" },
  },
  {
    id: "log-3",
    timestamp: "10:40:22 AM",
    level: "success",
    category: "api",
    agentName: "Marketing Maven",
    agentId: "2",
    action: "API Call — OpenAI GPT-4",
    details: "Generated social media copy batch (5 LinkedIn posts). Tokens used: 2,847 input / 1,203 output.",
    metadata: { model: "gpt-4-turbo", tokens_in: "2,847", tokens_out: "1,203", cost: "$0.062" },
    duration: "4.2s",
  },
  {
    id: "log-4",
    timestamp: "10:38:05 AM",
    level: "warning",
    category: "integration",
    agentName: "Dr. Front Desk",
    agentId: "1",
    action: "GoHighLevel Sync Warning",
    details: "Contact sync partially failed — 2 of 32 contacts had missing phone numbers. Skipped and flagged for review.",
    metadata: { integration: "GoHighLevel", synced: "30", failed: "2", reason: "missing_phone" },
  },
  {
    id: "log-5",
    timestamp: "10:35:10 AM",
    level: "error",
    category: "communication",
    agentName: "Dr. Front Desk",
    agentId: "1",
    action: "Voice Call Failed",
    details: "Outbound call to Michael Torres failed — line busy. Auto-retry scheduled in 15 minutes.",
    metadata: { channel: "Voice", recipient: "Michael Torres", error: "LINE_BUSY", retry_at: "10:50 AM" },
  },
  {
    id: "log-6",
    timestamp: "10:32:44 AM",
    level: "success",
    category: "task",
    agentName: "Dr. Front Desk",
    agentId: "1",
    action: "Task Completed",
    details: "Prescription refill batch completed — 8 of 8 refills processed and confirmed with pharmacies.",
    metadata: { taskId: "task-6", processed: "8", success_rate: "100%" },
    duration: "44m",
  },
  {
    id: "log-7",
    timestamp: "10:30:00 AM",
    level: "info",
    category: "system",
    agentName: "System",
    agentId: "sys",
    action: "Agent Health Check",
    details: "All 3 active agents healthy. Avg response time: 1.2s. No errors in last 30 minutes.",
    metadata: { active_agents: "3", avg_response: "1.2s", uptime: "99.9%" },
  },
  {
    id: "log-8",
    timestamp: "10:25:18 AM",
    level: "success",
    category: "integration",
    agentName: "Marketing Maven",
    agentId: "2",
    action: "HubSpot Contact Created",
    details: "New lead added to HubSpot CRM: Priya Patel (priya@startup.io) — assigned to Q1 Campaign pipeline.",
    metadata: { integration: "HubSpot", contact: "Priya Patel", pipeline: "Q1 Campaign" },
    duration: "890ms",
  },
  {
    id: "log-9",
    timestamp: "10:20:05 AM",
    level: "info",
    category: "api",
    agentName: "Grant Pro",
    agentId: "3",
    action: "API Call — Claude Opus",
    details: "Generated NIH R01 specific aims page. Tokens used: 4,120 input / 3,550 output.",
    metadata: { model: "claude-opus-4-6", tokens_in: "4,120", tokens_out: "3,550", cost: "$0.189" },
    duration: "8.1s",
  },
  {
    id: "log-10",
    timestamp: "10:15:30 AM",
    level: "warning",
    category: "system",
    agentName: "System",
    agentId: "sys",
    action: "Rate Limit Approaching",
    details: "OpenAI API rate limit at 78% capacity. Consider distributing load across models.",
    metadata: { provider: "OpenAI", usage: "78%", limit: "10,000 RPM" },
  },
  {
    id: "log-11",
    timestamp: "10:10:12 AM",
    level: "success",
    category: "auth",
    agentName: "System",
    agentId: "sys",
    action: "User Login",
    details: "Admin user logged in successfully from 192.168.1.x (Chrome, macOS).",
    metadata: { user: "admin@drclaw.com", ip: "192.168.1.x", browser: "Chrome" },
  },
  {
    id: "log-12",
    timestamp: "10:05:00 AM",
    level: "info",
    category: "communication",
    agentName: "Dr. Front Desk",
    agentId: "1",
    action: "SMS Received",
    details: "Inbound SMS from Linda Nakamura: appointment confirmation reply received.",
    metadata: { channel: "SMS", sender: "Linda Nakamura", type: "inbound" },
  },
  {
    id: "log-13",
    timestamp: "9:58:33 AM",
    level: "error",
    category: "api",
    agentName: "Grant Pro",
    agentId: "3",
    action: "API Call Failed — Timeout",
    details: "Request to Claude API timed out after 30s while generating budget justification. Retrying with reduced context.",
    metadata: { model: "claude-opus-4-6", error: "TIMEOUT", timeout: "30s", retry: "true" },
  },
  {
    id: "log-14",
    timestamp: "9:45:20 AM",
    level: "success",
    category: "task",
    agentName: "Marketing Maven",
    agentId: "2",
    action: "Task Completed",
    details: "Q1 social media campaign generated — 30 posts, 10 threads, 3 carousel concepts delivered.",
    metadata: { taskId: "task-2", deliverables: "43", format: "LinkedIn, Twitter, Instagram" },
    duration: "2h 29m",
  },
  {
    id: "log-15",
    timestamp: "9:30:00 AM",
    level: "info",
    category: "system",
    agentName: "System",
    agentId: "sys",
    action: "Daily Summary Generated",
    details: "Yesterday's summary: 47 tasks completed, 156 messages sent, 12 calls made. Success rate: 94%.",
    metadata: { tasks: "47", messages: "156", calls: "12", success_rate: "94%" },
  },
];

const DataLogs = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const LEVEL_LABELS: Record<LogLevel, string> = {
    info: t("dataLogs.info"),
    success: t("dataLogs.success"),
    warning: t("dataLogs.warning"),
    error: t("dataLogs.error"),
  };

  const CATEGORY_LABELS: Record<LogCategory, string> = {
    communication: t("dataLogs.communication"),
    task: t("dataLogs.task"),
    api: t("dataLogs.api"),
    system: t("dataLogs.system"),
    auth: t("dataLogs.auth"),
    integration: t("dataLogs.integration"),
  };

  const [logs] = useState<LogEntry[]>(mockLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | "all">("all");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.agentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const levelCounts = {
    info: logs.filter((l) => l.level === "info").length,
    success: logs.filter((l) => l.level === "success").length,
    warning: logs.filter((l) => l.level === "warning").length,
    error: logs.filter((l) => l.level === "error").length,
  };

  const handleExportLogs = () => {
    const header = "Timestamp,Level,Category,Agent,Action,Details,Duration\n";
    const rows = filteredLogs
      .map((log) =>
        [
          log.timestamp,
          log.level,
          log.category,
          log.agentName,
          `"${log.action}"`,
          `"${log.details.replace(/"/g, '""')}"`,
          log.duration || "",
        ].join(",")
      )
      .join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: t("dataLogs.logsExported"),
      description: `${filteredLogs.length} logs exported successfully.`,
    });
  };

  return (
    <DashboardLayout>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                <ScrollText className="h-7 w-7 text-primary" />
                {t("dataLogs.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("dataLogs.subtitle")}
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 text-xs border-border hover:bg-white/5" onClick={handleExportLogs}>
              <Download className="h-3.5 w-3.5" />
              {t("dataLogs.exportLogs")}
            </Button>
          </div>

          {/* Level Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {(["info", "success", "warning", "error"] as const).map((level) => {
              const cfg = LEVEL_STYLE[level];
              const LevelIcon = cfg.icon;
              return (
                <button
                  key={level}
                  onClick={() => setLevelFilter(levelFilter === level ? "all" : level)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    levelFilter === level
                      ? `border-current ${cfg.bg} ${cfg.color}`
                      : "border-border bg-card hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <LevelIcon className={`h-5 w-5 ${cfg.color}`} />
                    <span className="text-2xl font-bold text-foreground">{levelCounts[level]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("dataLogs.levelEvents", { level: LEVEL_LABELS[level] })}</p>
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("dataLogs.searchLogs")}
                className="pl-9 bg-white/[0.03] border-white/10 focus:border-primary/50"
              />
            </div>
            <div className="flex gap-1 bg-card/50 border border-border rounded-xl p-1 overflow-x-auto">
              {(["all", "communication", "task", "api", "system", "auth", "integration"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    categoryFilter === cat
                      ? "gradient-primary text-primary-foreground shadow-glow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat === "all" ? t("dataLogs.all") : CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Log Entries */}
          <div className="space-y-1">
            {/* Table Header */}
            <div className="grid grid-cols-[90px_70px_100px_130px_1fr_80px] gap-3 px-4 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>{t("dataLogs.time")}</span>
              <span>{t("dataLogs.level")}</span>
              <span>{t("dataLogs.category")}</span>
              <span>{t("dataLogs.agent")}</span>
              <span>{t("dataLogs.actionDetails")}</span>
              <span className="text-right">{t("dataLogs.duration")}</span>
            </div>

            {filteredLogs.map((log) => {
              const levelCfg = LEVEL_STYLE[log.level];
              const catCfg = CATEGORY_STYLE[log.category];
              const LevelIcon = levelCfg.icon;
              const CatIcon = catCfg.icon;
              const isExpanded = expandedLog === log.id;

              return (
                <div key={log.id}>
                  <button
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    className={`w-full text-left grid grid-cols-[90px_70px_100px_130px_1fr_80px] gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isExpanded ? "bg-primary/5 border border-primary/20" : "hover:bg-white/[0.02] border border-transparent"
                    }`}
                  >
                    {/* Timestamp */}
                    <span className="text-xs text-muted-foreground font-mono flex items-center">
                      {log.timestamp}
                    </span>

                    {/* Level */}
                    <span className="flex items-center">
                      <span className={`flex items-center gap-1 text-[10px] font-medium ${levelCfg.color}`}>
                        <LevelIcon className="h-3.5 w-3.5" />
                      </span>
                    </span>

                    {/* Category */}
                    <span className="flex items-center">
                      <span className={`flex items-center gap-1 text-[10px] ${catCfg.color}`}>
                        <CatIcon className="h-3 w-3" />
                        <span className="truncate">{CATEGORY_LABELS[log.category]}</span>
                      </span>
                    </span>

                    {/* Agent */}
                    <span className="flex items-center gap-1.5 text-xs text-foreground/80 truncate">
                      <Bot className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{log.agentName}</span>
                    </span>

                    {/* Action */}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{log.action}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{log.details}</p>
                    </div>

                    {/* Duration */}
                    <span className="text-xs text-muted-foreground text-right flex items-center justify-end">
                      {log.duration || "—"}
                    </span>
                  </button>

                  {/* Expanded Metadata */}
                  {isExpanded && log.metadata && (
                    <div className="ml-4 mr-4 mb-2 px-4 py-3 rounded-lg bg-card border border-border">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {t("dataLogs.metadata")}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <div key={key} className="p-2 rounded-md bg-white/[0.02]">
                            <p className="text-[10px] text-muted-foreground capitalize">
                              {key.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs font-medium text-foreground mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground leading-relaxed">{log.details}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredLogs.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <ScrollText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">{t("dataLogs.noMatchingEntries")}</p>
                <p className="text-xs mt-1">{t("dataLogs.adjustFilters")}</p>
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="mt-6 flex items-center justify-between text-[10px] text-muted-foreground px-1">
            <span>{t("dataLogs.showingEntries", { filtered: String(filteredLogs.length), total: String(logs.length) })}</span>
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3" /> {t("dataLogs.liveAutoRefreshing")}
            </span>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default DataLogs;
