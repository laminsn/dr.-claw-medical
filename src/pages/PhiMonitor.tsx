import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  ScanLine,
  Lock,
  Bell,
  BellRing,
  Mail,
  X,
  Plus,
  Activity,
  MessageSquare,
  Database,
  Globe,
  RefreshCw,
  Eye,
  UserX,
  FileWarning,
  Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────────────────────

type ViolationType =
  | "phi_request"
  | "data_leak_attempt"
  | "unauthorized_access"
  | "hipaa_breach_risk"
  | "zone_boundary_violation";

type Severity = "critical" | "high" | "medium" | "low";

type ViolationStatus = "blocked" | "flagged" | "resolved";

interface ViolationEntry {
  id: string;
  timestamp: string;
  agentName: string;
  violationType: ViolationType;
  severity: Severity;
  description: string;
  status: ViolationStatus;
  notifiedTo: string[];
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const mockViolations: ViolationEntry[] = [
  {
    id: "phi-001",
    timestamp: "2026-02-16 10:42:15 AM",
    agentName: "Dr. Front Desk",
    violationType: "phi_request",
    severity: "critical",
    description:
      'Agent attempted to include patient SSN (***-**-4829) in an outbound SMS message. Request was blocked before transmission.',
    status: "blocked",
    notifiedTo: ["admin@clinic.com", "compliance@clinic.com"],
  },
  {
    id: "phi-002",
    timestamp: "2026-02-16 10:38:02 AM",
    agentName: "Marketing Maven",
    violationType: "data_leak_attempt",
    severity: "high",
    description:
      "Agent attempted to export patient list with diagnosis codes to an external marketing platform. Export was intercepted.",
    status: "blocked",
    notifiedTo: ["admin@clinic.com", "compliance@clinic.com", "dr.chen@clinic.com"],
  },
  {
    id: "phi-002b",
    timestamp: "2026-02-16 10:35:22 AM",
    agentName: "Marketing Maven",
    violationType: "zone_boundary_violation",
    severity: "critical",
    description: "Zone 3 (External) agent attempted to initiate direct communication channel with Zone 1 (Clinical) agent 'Dr. Front Desk'. Cross-zone communication was blocked by the isolation firewall.",
    status: "blocked",
    notifiedTo: ["admin@clinic.com", "compliance@clinic.com"],
  },
  {
    id: "phi-003",
    timestamp: "2026-02-16 10:22:47 AM",
    agentName: "Dr. Front Desk",
    violationType: "hipaa_breach_risk",
    severity: "medium",
    description:
      "Agent conversation included patient name alongside appointment details in a channel accessible to non-clinical staff.",
    status: "flagged",
    notifiedTo: ["compliance@clinic.com"],
  },
  {
    id: "phi-004",
    timestamp: "2026-02-16 09:55:30 AM",
    agentName: "Grant Pro",
    violationType: "unauthorized_access",
    severity: "high",
    description:
      "Agent attempted to access patient billing records outside its authorized scope. Access was denied by role-based policy.",
    status: "blocked",
    notifiedTo: ["admin@clinic.com", "compliance@clinic.com"],
  },
  {
    id: "phi-005",
    timestamp: "2026-02-16 09:30:12 AM",
    agentName: "Dr. Front Desk",
    violationType: "phi_request",
    severity: "low",
    description:
      "Agent included patient first name in an internal log entry. Low risk — no external exposure. Flagged for audit.",
    status: "resolved",
    notifiedTo: ["compliance@clinic.com"],
  },
  {
    id: "phi-005b",
    timestamp: "2026-02-16 09:25:01 AM",
    agentName: "Dr. Front Desk",
    violationType: "zone_boundary_violation",
    severity: "high",
    description: "Zone 1 (Clinical) agent attempted to share patient appointment context with Zone 3 (External) agent 'Patient Outreach' without passing through sanitization gate. Data transfer blocked.",
    status: "blocked",
    notifiedTo: ["admin@clinic.com", "compliance@clinic.com"],
  },
  {
    id: "phi-006",
    timestamp: "2026-02-16 09:12:05 AM",
    agentName: "Marketing Maven",
    violationType: "hipaa_breach_risk",
    severity: "critical",
    description:
      "Agent generated social media post draft that referenced a real patient testimonial with identifiable health information. Draft was quarantined.",
    status: "blocked",
    notifiedTo: ["admin@clinic.com", "compliance@clinic.com", "dr.chen@clinic.com"],
  },
  {
    id: "phi-007",
    timestamp: "2026-02-16 08:45:18 AM",
    agentName: "Grant Pro",
    violationType: "data_leak_attempt",
    severity: "medium",
    description:
      "Agent attempted to include de-identified but potentially re-identifiable data in a grant proposal appendix. Flagged for human review.",
    status: "flagged",
    notifiedTo: ["compliance@clinic.com", "dr.chen@clinic.com"],
  },
  {
    id: "phi-008",
    timestamp: "2026-02-16 08:10:44 AM",
    agentName: "Dr. Front Desk",
    violationType: "unauthorized_access",
    severity: "low",
    description:
      "Agent queried prescription history for a patient outside the current appointment context. Query was logged and allowed under broad access policy.",
    status: "resolved",
    notifiedTo: ["compliance@clinic.com"],
  },
];

// ── Monitoring channels ────────────────────────────────────────────────────────

interface MonitorChannel {
  id: string;
  label: string;
  icon: typeof MessageSquare;
  status: "ok" | "warning";
  detail: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

const PhiMonitor = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Config maps (inside component for t() access)
  const SEVERITY_CONFIG: Record<
    Severity,
    { label: string; color: string; bg: string; dotColor: string }
  > = {
    critical: {
      label: t("phiMonitor.severityCritical"),
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/30 text-red-400",
      dotColor: "bg-red-500",
    },
    high: {
      label: t("phiMonitor.severityHigh"),
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/30 text-orange-400",
      dotColor: "bg-orange-500",
    },
    medium: {
      label: t("phiMonitor.severityMedium"),
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      dotColor: "bg-amber-500",
    },
    low: {
      label: t("phiMonitor.severityLow"),
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      dotColor: "bg-blue-500",
    },
  };

  const VIOLATION_TYPE_CONFIG: Record<
    ViolationType,
    { label: string; icon: typeof ShieldAlert }
  > = {
    phi_request: { label: t("phiMonitor.violationPhiRequest"), icon: Eye },
    data_leak_attempt: { label: t("phiMonitor.violationDataLeak"), icon: FileWarning },
    unauthorized_access: { label: t("phiMonitor.violationUnauthorizedAccess"), icon: UserX },
    hipaa_breach_risk: { label: t("phiMonitor.violationHipaaBreach"), icon: ShieldAlert },
    zone_boundary_violation: { label: t("phiMonitor.violationZoneBoundary"), icon: ShieldAlert },
  };

  const STATUS_CONFIG: Record<
    ViolationStatus,
    { label: string; color: string; bg: string }
  > = {
    blocked: {
      label: t("phiMonitor.statusBlocked"),
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20 text-red-400",
    },
    flagged: {
      label: t("phiMonitor.statusFlagged"),
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    },
    resolved: {
      label: t("phiMonitor.statusResolved"),
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20 text-green-400",
    },
  };

  const monitorChannels: MonitorChannel[] = [
    {
      id: "conversations",
      label: t("phiMonitor.channelConversations"),
      icon: MessageSquare,
      status: "ok",
      detail: t("phiMonitor.channelConversationsDetail"),
    },
    {
      id: "exports",
      label: t("phiMonitor.channelDataExports"),
      icon: Database,
      status: "warning",
      detail: t("phiMonitor.channelDataExportsDetail"),
    },
    {
      id: "api",
      label: t("phiMonitor.channelApiCalls"),
      icon: Globe,
      status: "ok",
      detail: t("phiMonitor.channelApiCallsDetail"),
    },
    {
      id: "integrations",
      label: t("phiMonitor.channelIntegrations"),
      icon: RefreshCw,
      status: "ok",
      detail: t("phiMonitor.channelIntegrationsDetail"),
    },
    {
      id: "zone-firewall",
      label: t("phiMonitor.channelZoneFirewall"),
      icon: Shield,
      status: "ok",
      detail: t("phiMonitor.channelZoneFirewallDetail"),
    },
  ];

  // Filters
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ViolationStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Notification settings
  const [notifyCritical, setNotifyCritical] = useState(true);
  const [notifyHigh, setNotifyHigh] = useState(true);
  const [notifyMedium, setNotifyMedium] = useState(false);
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [recipients, setRecipients] = useState<string[]>([
    "admin@clinic.com",
    "compliance@clinic.com",
    "dr.chen@clinic.com",
  ]);
  const [newEmail, setNewEmail] = useState("");

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);

  // ── Derived data ───────────────────────────────────────────────────────────

  const filteredViolations = mockViolations.filter((v) => {
    const matchesSeverity = severityFilter === "all" || v.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    const matchesSearch =
      v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      VIOLATION_TYPE_CONFIG[v.violationType].label
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const totalBlocked = mockViolations.filter((v) => v.status === "blocked").length;
  const activeViolations = mockViolations.filter(
    (v) => v.status === "flagged" || v.status === "blocked"
  ).length;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAddRecipient = () => {
    const trimmed = newEmail.trim();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({
        title: t("phiMonitor.toastInvalidEmailTitle"),
        description: t("phiMonitor.toastInvalidEmailDesc"),
        variant: "destructive",
      });
      return;
    }
    if (recipients.includes(trimmed)) {
      toast({
        title: t("phiMonitor.toastDuplicateTitle"),
        description: t("phiMonitor.toastDuplicateDesc"),
        variant: "destructive",
      });
      return;
    }
    setRecipients((prev) => [...prev, trimmed]);
    setNewEmail("");
    toast({
      title: t("phiMonitor.toastRecipientAddedTitle"),
      description: t("phiMonitor.toastRecipientAddedDesc", { email: trimmed }),
    });
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients((prev) => prev.filter((r) => r !== email));
    toast({
      title: t("phiMonitor.toastRecipientRemovedTitle"),
      description: t("phiMonitor.toastRecipientRemovedDesc", { email }),
    });
  };

  const handleRunFullScan = () => {
    setIsScanning(true);
    toast({
      title: t("phiMonitor.toastFullScanTitle"),
      description: t("phiMonitor.toastFullScanDesc"),
    });
    setTimeout(() => setIsScanning(false), 4000);
  };

  const handleExportReport = () => {
    toast({
      title: t("phiMonitor.toastExportTitle"),
      description: t("phiMonitor.toastExportDesc"),
    });
  };

  const handleLockDown = () => {
    toast({
      title: t("phiMonitor.toastLockdownTitle"),
      description: t("phiMonitor.toastLockdownDesc"),
      variant: "destructive",
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
                <Shield className="h-7 w-7 text-primary" />
                {t("phiMonitor.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("phiMonitor.subtitle")}
              </p>
            </div>
            <Badge className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs px-3 py-1">
              <Activity className="h-3 w-3 mr-1.5 animate-pulse" />
              {t("phiMonitor.monitoringActive")}
            </Badge>
          </div>

          {/* Zone Isolation Status */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/5 mb-8">
            <Shield className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-green-400">{t("phiMonitor.zoneIsolationActive")}</p>
                <Badge className="bg-green-500/10 border border-green-500/30 text-green-400 text-[10px]">{t("phiMonitor.zonesEnforced")}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t("phiMonitor.zoneIsolationDesc")}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-[10px]"><span className="h-2 w-2 rounded-full bg-red-400" /> {t("phiMonitor.zoneClinical")}</span>
                <span className="flex items-center gap-1.5 text-[10px]"><span className="h-2 w-2 rounded-full bg-amber-400" /> {t("phiMonitor.zoneOperations")}</span>
                <span className="flex items-center gap-1.5 text-[10px]"><span className="h-2 w-2 rounded-full bg-blue-400" /> {t("phiMonitor.zoneExternal")}</span>
              </div>
            </div>
          </div>

          {/* ── Stats Cards ────────────────────────────────────────────── */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            {/* Total PHI Attempts Blocked */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <ShieldCheck className="h-5 w-5 text-red-400" />
                <span className="text-2xl font-bold text-foreground">247</span>
              </div>
              <p className="text-xs text-muted-foreground">{t("phiMonitor.totalPhiBlocked")}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{t("phiMonitor.totalPhiBlockedChange")}</p>
            </div>

            {/* Active Violations */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <span className="text-2xl font-bold text-foreground">{activeViolations}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t("phiMonitor.activeViolations")}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{t("phiMonitor.requiresAttention")}</p>
            </div>

            {/* Risk Score */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <ShieldAlert className="h-5 w-5 text-green-400" />
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-2xl font-bold text-green-400">{t("phiMonitor.riskLow")}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t("phiMonitor.riskScore")}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                {t("phiMonitor.allThreatsmitigated")}
              </p>
            </div>

            {/* Last Scan */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <Clock className="h-5 w-5 text-blue-400" />
                <span className="text-2xl font-bold text-foreground">{t("phiMonitor.lastScanValue")}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t("phiMonitor.lastScan")}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                {t("phiMonitor.autoScanInterval")}
              </p>
            </div>

            {/* Zone Violations */}
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <ShieldAlert className="h-5 w-5 text-violet-400" />
                <span className="text-2xl font-bold text-foreground">2</span>
              </div>
              <p className="text-xs text-muted-foreground">{t("phiMonitor.zoneBoundaryViolations")}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{t("phiMonitor.allBlockedAutomatically")}</p>
            </div>
          </div>

          {/* ── PHI Violation Log ──────────────────────────────────────── */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileWarning className="h-5 w-5 text-primary" />
                {t("phiMonitor.violationLog")}
              </h2>
              <span className="text-xs text-muted-foreground">
                {t("phiMonitor.entriesCount", { filtered: filteredViolations.length, total: mockViolations.length })}
              </span>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("phiMonitor.searchPlaceholder")}
                  className="pl-9 bg-white/[0.03] border-white/10 focus:border-primary/50"
                />
              </div>

              {/* Severity filter */}
              <div className="flex gap-1 bg-card/50 border border-border rounded-xl p-1">
                <Filter className="h-4 w-4 text-muted-foreground my-auto ml-2 mr-1" />
                {(["all", "critical", "high", "medium", "low"] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      severityFilter === sev
                        ? "gradient-primary text-primary-foreground shadow-glow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {sev === "all" ? t("phiMonitor.allSeverity") : SEVERITY_CONFIG[sev].label}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <div className="flex gap-1 bg-card/50 border border-border rounded-xl p-1">
                {(["all", "blocked", "flagged", "resolved"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      statusFilter === st
                        ? "gradient-primary text-primary-foreground shadow-glow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st === "all" ? t("phiMonitor.allStatus") : STATUS_CONFIG[st].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Violation entries */}
            <div className="space-y-2">
              {filteredViolations.map((v) => {
                const sevCfg = SEVERITY_CONFIG[v.severity];
                const typeCfg = VIOLATION_TYPE_CONFIG[v.violationType];
                const statusCfg = STATUS_CONFIG[v.status];
                const TypeIcon = typeCfg.icon;

                return (
                  <div
                    key={v.id}
                    className="bg-card rounded-xl border border-border p-4 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`mt-0.5 p-2 rounded-lg ${
                            v.severity === "critical"
                              ? "bg-red-500/10"
                              : v.severity === "high"
                              ? "bg-orange-500/10"
                              : v.severity === "medium"
                              ? "bg-amber-500/10"
                              : "bg-blue-500/10"
                          }`}
                        >
                          <TypeIcon
                            className={`h-4 w-4 ${sevCfg.color}`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">
                              {typeCfg.label}
                            </span>
                            <Badge
                              className={`text-[10px] px-2 py-0 border ${sevCfg.bg}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${sevCfg.dotColor} mr-1`}
                              />
                              {sevCfg.label}
                            </Badge>
                            <Badge
                              className={`text-[10px] px-2 py-0 border ${statusCfg.bg}`}
                            >
                              {statusCfg.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                            {v.description}
                          </p>
                          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {v.timestamp}
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {v.agentName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bell className="h-3 w-3" />
                              {t("phiMonitor.notified")}: {v.notifiedTo.join(", ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredViolations.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">{t("phiMonitor.noViolationsMatch")}</p>
                  <p className="text-xs mt-1">
                    {t("phiMonitor.tryAdjustingFilters")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Two-column layout: Notifications + Scanner ──────────── */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* ── Notification Settings ────────────────────────────────── */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-5">
                <BellRing className="h-5 w-5 text-primary" />
                {t("phiMonitor.notificationSettings")}
              </h2>

              {/* Toggle switches */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="notify-critical"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {t("phiMonitor.criticalViolations")}
                  </Label>
                  <Switch
                    id="notify-critical"
                    checked={notifyCritical}
                    onCheckedChange={setNotifyCritical}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="notify-high"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {t("phiMonitor.highViolations")}
                  </Label>
                  <Switch
                    id="notify-high"
                    checked={notifyHigh}
                    onCheckedChange={setNotifyHigh}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="notify-medium"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {t("phiMonitor.mediumViolations")}
                  </Label>
                  <Switch
                    id="notify-medium"
                    checked={notifyMedium}
                    onCheckedChange={setNotifyMedium}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="notify-weekly"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {t("phiMonitor.weeklySummaryReports")}
                  </Label>
                  <Switch
                    id="notify-weekly"
                    checked={notifyWeekly}
                    onCheckedChange={setNotifyWeekly}
                  />
                </div>
              </div>

              {/* Add recipient */}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {t("phiMonitor.notificationRecipients")}
                </p>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 bg-white/[0.03] border-white/10 focus:border-primary/50 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddRecipient();
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddRecipient}
                    className="gap-1.5 border-border hover:bg-white/5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t("phiMonitor.add")}
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {recipients.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5"
                    >
                      <span className="flex items-center gap-2 text-xs text-foreground">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {email}
                      </span>
                      <button
                        onClick={() => handleRemoveRecipient(email)}
                        className="text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Real-time Risk Scanner ────────────────────────────────── */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-5">
                <ScanLine className="h-5 w-5 text-primary" />
                {t("phiMonitor.riskScanner")}
              </h2>

              {/* Scanning status indicator */}
              <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-lg bg-green-500/5 border border-green-500/20">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
                <span className="text-sm font-medium text-green-400">
                  {isScanning ? t("phiMonitor.fullScanInProgress") : t("phiMonitor.scanningActive")}
                </span>
                {isScanning && (
                  <Loader2 className="h-4 w-4 text-green-400 animate-spin ml-auto" />
                )}
              </div>

              {/* Monitor channels */}
              <div className="space-y-3">
                {monitorChannels.map((channel) => {
                  const ChannelIcon = channel.icon;
                  const isOk = channel.status === "ok";

                  return (
                    <div
                      key={channel.id}
                      className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${
                        isOk
                          ? "bg-white/[0.01] border-white/5"
                          : "bg-amber-500/5 border-amber-500/20"
                      }`}
                    >
                      <ChannelIcon
                        className={`h-4 w-4 mt-0.5 ${
                          isOk ? "text-muted-foreground" : "text-amber-400"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">
                            {channel.label}
                          </span>
                          {isOk ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {channel.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Quick Actions ──────────────────────────────────────────── */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-5">
              <ShieldCheck className="h-5 w-5 text-primary" />
              {t("phiMonitor.quickActions")}
            </h2>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="gap-2 border-border hover:bg-white/5"
                onClick={handleRunFullScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ScanLine className="h-4 w-4" />
                )}
                {isScanning ? t("phiMonitor.scanning") : t("phiMonitor.runFullScan")}
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-border hover:bg-white/5"
                onClick={handleExportReport}
              >
                <Download className="h-4 w-4" />
                {t("phiMonitor.exportComplianceReport")}
              </Button>
              <Button
                variant="destructive"
                className="gap-2 ml-auto"
                onClick={handleLockDown}
              >
                <Lock className="h-4 w-4" />
                {t("phiMonitor.lockDownAllAgents")}
              </Button>
            </div>
          </div>

          {/* ── Footer ─────────────────────────────────────────────────── */}
          <div className="mt-6 flex items-center justify-between text-[10px] text-muted-foreground px-1">
            <span>
              {t("phiMonitor.footerVersion", { count: totalBlocked })}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3" /> {t("phiMonitor.liveContinuousMonitoring")}
            </span>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default PhiMonitor;
