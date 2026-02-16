import { useState } from "react";
import {
  Bell,
  BellRing,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Search,
  Bot,
  Shield,
  ListTodo,
  Settings,
  Monitor,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  Zap,
  BookOpen,
  Users,
  Server,
  Activity,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────────────────────

type NotificationSeverity = "critical" | "high" | "medium" | "low";
type NotificationCategory = "Security" | "Tasks" | "Agents" | "System";
type FilterTab = "all" | "unread" | "critical" | "agents" | "security" | "tasks" | "system";

interface Notification {
  id: string;
  severity: NotificationSeverity;
  title: string;
  description: string;
  timestamp: string;
  category: NotificationCategory;
  read: boolean;
  dismissed: boolean;
  details?: string;
}

interface NotificationRule {
  id: string;
  condition: string;
  action: string;
  enabled: boolean;
}

interface PreferenceChannel {
  name: string;
  icon: typeof Mail;
  critical: boolean;
  high: boolean;
  medium: boolean;
  low: boolean;
}

// ── Config maps ────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<
  NotificationSeverity,
  { label: string; color: string; bg: string; dotColor: string; iconBg: string }
> = {
  critical: {
    label: "Critical",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30 text-red-400",
    dotColor: "bg-red-500",
    iconBg: "bg-red-500/10",
  },
  high: {
    label: "High",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30 text-orange-400",
    dotColor: "bg-orange-500",
    iconBg: "bg-orange-500/10",
  },
  medium: {
    label: "Medium",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    dotColor: "bg-amber-500",
    iconBg: "bg-amber-500/10",
  },
  low: {
    label: "Low",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    dotColor: "bg-blue-500",
    iconBg: "bg-blue-500/10",
  },
};

const CATEGORY_CONFIG: Record<
  NotificationCategory,
  { icon: typeof Shield; color: string; bg: string }
> = {
  Security: {
    icon: Shield,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30 text-red-400",
  },
  Tasks: {
    icon: ListTodo,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  },
  Agents: {
    icon: Bot,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  },
  System: {
    icon: Server,
    color: "text-zinc-400",
    bg: "bg-zinc-500/10 border-zinc-500/30 text-zinc-400",
  },
};

const SEVERITY_ICON: Record<NotificationSeverity, typeof ShieldAlert> = {
  critical: ShieldAlert,
  high: AlertTriangle,
  medium: Activity,
  low: Bell,
};

// ── Mock Notifications ─────────────────────────────────────────────────────────

const initialNotifications: Notification[] = [
  {
    id: "notif-1",
    severity: "critical",
    title: "PHI violation detected",
    description: "Agent 'Front Desk' attempted to log SSN in plain text",
    timestamp: "2 min ago",
    category: "Security",
    read: false,
    dismissed: false,
    details:
      "The Front Desk agent attempted to write a patient SSN (***-**-4829) into an unencrypted log field. The action was blocked by the PHI filter before any data was persisted. Immediate review recommended.",
  },
  {
    id: "notif-2",
    severity: "high",
    title: "Task failed: Insurance verification timeout",
    description: "Insurance verification timeout for patient J. Rodriguez",
    timestamp: "8 min ago",
    category: "Tasks",
    read: false,
    dismissed: false,
    details:
      "The insurance verification API call for patient J. Rodriguez timed out after 30 seconds. The request was retried 3 times. Please check the insurance provider API status or retry manually.",
  },
  {
    id: "notif-3",
    severity: "medium",
    title: "Agent 'Content Engine' completed 5 blog posts",
    description: "Content Engine agent has finished generating 5 scheduled blog posts for review",
    timestamp: "15 min ago",
    category: "Agents",
    read: false,
    dismissed: false,
    details:
      "All 5 blog posts have been generated and are awaiting editorial review. Topics include: Patient wellness tips, Seasonal allergy management, Telehealth benefits, Nutrition basics, and Mental health awareness.",
  },
  {
    id: "notif-4",
    severity: "low",
    title: "Weekly compliance report ready",
    description: "Weekly compliance report ready for download",
    timestamp: "22 min ago",
    category: "System",
    read: false,
    dismissed: false,
    details:
      "The weekly HIPAA compliance report has been generated covering Feb 9-16, 2026. 0 critical violations found, 2 medium flags resolved. Report is available in the Reports section.",
  },
  {
    id: "notif-5",
    severity: "critical",
    title: "API rate limit approaching",
    description: "92% of monthly quota used",
    timestamp: "30 min ago",
    category: "System",
    read: false,
    dismissed: false,
    details:
      "API usage has reached 92% of the monthly quota (46,000 / 50,000 calls). At current rate, the limit will be reached in approximately 2 days. Consider upgrading the plan or optimizing API usage.",
  },
  {
    id: "notif-6",
    severity: "high",
    title: "Patient callback request overdue",
    description: "M. Thompson (45 min) - callback request has not been fulfilled",
    timestamp: "35 min ago",
    category: "Tasks",
    read: false,
    dismissed: false,
    details:
      "Patient M. Thompson requested a callback 45 minutes ago regarding prescription refill questions. The request is assigned to Dr. Front Desk agent but has not been actioned. SLA is 30 minutes.",
  },
  {
    id: "notif-7",
    severity: "medium",
    title: "New team member accepted invitation",
    description: "Dr. Sarah Kim accepted invitation and joined the platform",
    timestamp: "1 hr ago",
    category: "System",
    read: true,
    dismissed: false,
    details:
      "Dr. Sarah Kim has accepted the team invitation and completed initial onboarding. Role: Physician. Permissions: Standard clinical access. Agent access: Front Desk, Content Engine.",
  },
  {
    id: "notif-8",
    severity: "low",
    title: "Agent 'Financial Analyst' monthly report generated",
    description: "Financial Analyst agent has completed the monthly financial summary report",
    timestamp: "1.5 hrs ago",
    category: "Agents",
    read: true,
    dismissed: false,
    details:
      "The monthly financial summary for January 2026 has been generated. Key highlights: Revenue up 8% MoM, operating costs stable, 3 outstanding invoices flagged for follow-up.",
  },
  {
    id: "notif-9",
    severity: "high",
    title: "Unusual login attempt detected",
    description: "Unusual login attempt detected from new IP: 192.168.1.xxx",
    timestamp: "2 hrs ago",
    category: "Security",
    read: true,
    dismissed: false,
    details:
      "A login attempt was detected from IP 192.168.1.xxx which has not been seen before for this account. The attempt used valid credentials but was flagged for MFA verification. Location: Unknown VPN endpoint.",
  },
  {
    id: "notif-10",
    severity: "medium",
    title: "Workflow 'Patient Intake Pipeline' milestone",
    description: "Workflow 'Patient Intake Pipeline' completed 50th run",
    timestamp: "2.5 hrs ago",
    category: "Agents",
    read: true,
    dismissed: false,
    details:
      "The Patient Intake Pipeline workflow has completed its 50th successful run. Average processing time: 4.2 minutes. Success rate: 96%. 2 runs required manual intervention.",
  },
  {
    id: "notif-11",
    severity: "low",
    title: "Email campaign 'Weekly Tips' sent",
    description: "Email campaign 'Weekly Tips' sent to 1,247 subscribers",
    timestamp: "3 hrs ago",
    category: "System",
    read: true,
    dismissed: false,
    details:
      "The Weekly Tips email campaign has been sent to 1,247 active subscribers. Open rate prediction: 34%. Previous campaign open rate: 31%. Unsubscribe rate: 0.2%.",
  },
  {
    id: "notif-12",
    severity: "medium",
    title: "Agent collaboration channel update",
    description: "Agent collaboration channel 'Cardiology Team' has 3 unread messages",
    timestamp: "3.5 hrs ago",
    category: "Agents",
    read: false,
    dismissed: false,
    details:
      "The Cardiology Team collaboration channel has 3 unread messages from agents: 1 from Front Desk (patient scheduling query), 1 from Content Engine (cardiology blog draft), 1 from Financial Analyst (billing code question).",
  },
  {
    id: "notif-13",
    severity: "high",
    title: "Backup completed with warnings",
    description: "Backup completed with 2 warnings",
    timestamp: "4 hrs ago",
    category: "System",
    read: true,
    dismissed: false,
    details:
      "Daily backup completed at 6:00 AM. 2 warnings: (1) Patient attachments folder exceeded 5GB threshold, (2) One index file was locked during backup and will be included in next run. No data loss detected.",
  },
  {
    id: "notif-14",
    severity: "low",
    title: "Training module completed",
    description: "Training module 'Advanced Agent Config' completed by 3 team members",
    timestamp: "5 hrs ago",
    category: "System",
    read: true,
    dismissed: false,
    details:
      "3 team members completed the 'Advanced Agent Config' training module: J. Park (Score: 95%), L. Martinez (Score: 88%), K. Wang (Score: 92%). All passed the certification threshold.",
  },
  {
    id: "notif-15",
    severity: "medium",
    title: "New integration available",
    description: "New integration available: Epic EHR connector v2.1",
    timestamp: "6 hrs ago",
    category: "System",
    read: true,
    dismissed: false,
    details:
      "Epic EHR connector v2.1 is now available in the Integrations marketplace. New features: Bi-directional patient sync, real-time appointment updates, improved FHIR R4 compliance. Review and install from Settings > Integrations.",
  },
];

// ── Mock Notification Rules ────────────────────────────────────────────────────

const initialRules: NotificationRule[] = [
  {
    id: "rule-1",
    condition: "PHI violations",
    action: "Immediate SMS + Email to Admin",
    enabled: true,
  },
  {
    id: "rule-2",
    condition: "Task failures",
    action: "Email to assigned team member",
    enabled: true,
  },
  {
    id: "rule-3",
    condition: "API usage > 80%",
    action: "Slack notification to DevOps",
    enabled: true,
  },
  {
    id: "rule-4",
    condition: "New patient messages",
    action: "Push notification to assigned agent",
    enabled: false,
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

const NotificationsCenter = () => {
  const { toast } = useToast();

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);

  // Notification rules state
  const [rules, setRules] = useState<NotificationRule[]>(initialRules);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [newRuleCondition, setNewRuleCondition] = useState("");
  const [newRuleAction, setNewRuleAction] = useState("");

  // Notification preferences state
  const [channels, setChannels] = useState<PreferenceChannel[]>([
    { name: "Email", icon: Mail, critical: true, high: true, medium: true, low: false },
    { name: "SMS", icon: Smartphone, critical: true, high: true, medium: false, low: false },
    { name: "Slack", icon: MessageSquare, critical: true, high: false, medium: false, low: false },
    { name: "In-App Push", icon: Send, critical: true, high: true, medium: true, low: true },
  ]);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("07:00");

  // ── Derived data ──────────────────────────────────────────────────────────

  const activeNotifications = notifications.filter((n) => !n.dismissed);
  const unreadCount = activeNotifications.filter((n) => !n.read).length;
  const todayAlerts = activeNotifications.length;
  const criticalCount = activeNotifications.filter((n) => n.severity === "critical").length;
  const activeRulesCount = rules.filter((r) => r.enabled).length;

  const filteredNotifications = activeNotifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase());

    switch (activeFilter) {
      case "all":
        return matchesSearch;
      case "unread":
        return matchesSearch && !n.read;
      case "critical":
        return matchesSearch && n.severity === "critical";
      case "agents":
        return matchesSearch && n.category === "Agents";
      case "security":
        return matchesSearch && n.category === "Security";
      case "tasks":
        return matchesSearch && n.category === "Tasks";
      case "system":
        return matchesSearch && n.category === "System";
      default:
        return matchesSearch;
    }
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast({ title: "Notification marked as read" });
  };

  const markAsUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: false } : n))
    );
    toast({ title: "Notification marked as unread" });
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n))
    );
    toast({ title: "Notification dismissed" });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({ title: "All notifications marked as read", description: `${unreadCount} notifications updated.` });
  };

  const toggleRuleEnabled = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const createRule = () => {
    if (!newRuleCondition.trim() || !newRuleAction.trim()) {
      toast({ title: "Missing fields", description: "Please fill in both condition and action.", variant: "destructive" });
      return;
    }
    const newRule: NotificationRule = {
      id: `rule-${Date.now()}`,
      condition: newRuleCondition.trim(),
      action: newRuleAction.trim(),
      enabled: true,
    };
    setRules((prev) => [...prev, newRule]);
    setNewRuleCondition("");
    setNewRuleAction("");
    setShowRuleForm(false);
    toast({ title: "Rule created", description: `New notification rule has been activated.` });
  };

  const toggleChannelPreference = (
    channelIndex: number,
    severity: "critical" | "high" | "medium" | "low"
  ) => {
    setChannels((prev) =>
      prev.map((ch, i) =>
        i === channelIndex ? { ...ch, [severity]: !ch[severity] } : ch
      )
    );
  };

  // ── Filter tabs config ────────────────────────────────────────────────────

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "critical", label: "Critical" },
    { key: "agents", label: "Agents" },
    { key: "security", label: "Security" },
    { key: "tasks", label: "Tasks" },
    { key: "system", label: "System" },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading gradient-hero-text flex items-center gap-3">
                <BellRing className="h-7 w-7 text-primary" />
                Notifications Center
              </h1>
              <p className="text-muted-foreground mt-1">
                Centralized notification hub for alerts, updates, and system events
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-border text-muted-foreground hover:text-foreground gap-2"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark All as Read
            </Button>
          </div>

          {/* ── Stats Cards ────────────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-4">
            {/* Unread Notifications */}
            <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 shadow-glow-sm">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-foreground">{unreadCount}</span>
              </div>
              <p className="text-sm font-medium text-foreground">Unread Notifications</p>
              <p className="text-xs text-muted-foreground mt-0.5">Requires attention</p>
            </div>

            {/* Today's Alerts */}
            <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-foreground">{todayAlerts}</span>
              </div>
              <p className="text-sm font-medium text-foreground">Today's Alerts</p>
              <p className="text-xs text-muted-foreground mt-0.5">Last 24 hours</p>
            </div>

            {/* Critical Alerts */}
            <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-glow-sm">
                  <ShieldAlert className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-foreground">{criticalCount}</span>
              </div>
              <p className="text-sm font-medium text-foreground">Critical Alerts</p>
              <p className="text-xs text-muted-foreground mt-0.5">Immediate action needed</p>
            </div>

            {/* Notification Rules Active */}
            <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-foreground">{activeRulesCount}</span>
              </div>
              <p className="text-sm font-medium text-foreground">Notification Rules Active</p>
              <p className="text-xs text-muted-foreground mt-0.5">of {rules.length} total rules</p>
            </div>
          </div>

          {/* ── Filter Tabs + Search ───────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-1 bg-card/50 border border-border rounded-xl p-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeFilter === tab.key
                      ? "gradient-primary text-primary-foreground shadow-glow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {tab.key === "unread" && unreadCount > 0 && (
                    <span className="ml-1.5 bg-red-500/20 text-red-400 px-1.5 py-0 rounded-full text-[10px]">
                      {unreadCount}
                    </span>
                  )}
                  {tab.key === "critical" && criticalCount > 0 && (
                    <span className="ml-1.5 bg-red-500/20 text-red-400 px-1.5 py-0 rounded-full text-[10px]">
                      {criticalCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                className="pl-9 bg-white/[0.03] border-white/10 focus:border-primary/50"
              />
            </div>
          </div>

          {/* ── Notification Feed ──────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Feed
              </h2>
              <span className="text-xs text-muted-foreground">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredNotifications.map((notif) => {
                const sevCfg = SEVERITY_CONFIG[notif.severity];
                const catCfg = CATEGORY_CONFIG[notif.category];
                const SeverityIcon = SEVERITY_ICON[notif.severity];
                const isExpanded = expandedNotification === notif.id;

                return (
                  <div
                    key={notif.id}
                    className={`bg-card rounded-xl border p-4 transition-all duration-200 hover:border-primary/20 ${
                      !notif.read ? "border-primary/30" : "border-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Severity Icon */}
                      <div
                        className={`mt-0.5 p-2 rounded-lg shrink-0 ${sevCfg.iconBg}`}
                      >
                        <SeverityIcon className={`h-4 w-4 ${sevCfg.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Unread dot */}
                            {!notif.read && (
                              <span className={`h-2 w-2 rounded-full ${sevCfg.dotColor} shrink-0`} />
                            )}
                            <h3
                              className="text-sm font-semibold text-foreground leading-tight cursor-pointer hover:text-primary transition-colors truncate"
                              onClick={() =>
                                setExpandedNotification(isExpanded ? null : notif.id)
                              }
                            >
                              {notif.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Mark read/unread */}
                            <button
                              onClick={() =>
                                notif.read ? markAsUnread(notif.id) : markAsRead(notif.id)
                              }
                              className="p-1 rounded hover:bg-white/5 text-muted-foreground"
                              title={notif.read ? "Mark as unread" : "Mark as read"}
                            >
                              {notif.read ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </button>

                            {/* Dismiss */}
                            <button
                              onClick={() => dismissNotification(notif.id)}
                              className="p-1 rounded hover:bg-white/5 text-muted-foreground hover:text-red-400"
                              title="Dismiss notification"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>

                            {/* Expand toggle */}
                            <button
                              onClick={() =>
                                setExpandedNotification(isExpanded ? null : notif.id)
                              }
                              className="p-1 rounded hover:bg-white/5 text-muted-foreground"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                          {notif.description}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Severity badge */}
                          <Badge
                            className={`text-[10px] px-2 py-0 border ${sevCfg.bg}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${sevCfg.dotColor} mr-1`} />
                            {sevCfg.label}
                          </Badge>

                          {/* Category badge */}
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0 border ${catCfg.bg}`}
                          >
                            {notif.category}
                          </Badge>

                          {/* Timestamp */}
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
                            <Clock className="h-3 w-3" />
                            {notif.timestamp}
                          </span>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && notif.details && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {notif.details}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              {!notif.read && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs border-border text-muted-foreground hover:text-foreground gap-1.5"
                                  onClick={() => markAsRead(notif.id)}
                                >
                                  <Eye className="h-3 w-3" />
                                  Mark as Read
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs border-border text-muted-foreground hover:text-red-400 gap-1.5"
                                onClick={() => dismissNotification(notif.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredNotifications.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No notifications match your filters</p>
                  <p className="text-xs mt-1">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* ── Notification Rules ─────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Notification Rules
              </h2>
              <Button
                size="sm"
                className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90 gap-1.5"
                onClick={() => setShowRuleForm(!showRuleForm)}
              >
                <Plus className="h-3.5 w-3.5" />
                Create Rule
              </Button>
            </div>

            {/* Create rule form */}
            {showRuleForm && (
              <div className="bg-card rounded-xl border border-primary/20 p-5 mb-4 space-y-4">
                <h3 className="text-sm font-semibold text-foreground">New Notification Rule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Condition (When...)</Label>
                    <Input
                      value={newRuleCondition}
                      onChange={(e) => setNewRuleCondition(e.target.value)}
                      placeholder="e.g., Agent response time > 5 min"
                      className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Action (Then...)</Label>
                    <Input
                      value={newRuleAction}
                      onChange={(e) => setNewRuleAction(e.target.value)}
                      placeholder="e.g., Send email to admin@clinic.com"
                      className="bg-white/[0.03] border-white/10 focus:border-primary/50"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90"
                    onClick={createRule}
                  >
                    Save Rule
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-muted-foreground"
                    onClick={() => {
                      setShowRuleForm(false);
                      setNewRuleCondition("");
                      setNewRuleAction("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Rules list */}
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 shrink-0">
                        <Zap className={`h-4 w-4 ${rule.enabled ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-foreground">{rule.condition}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">{rule.action}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] border px-2 py-0 ${
                          rule.enabled
                            ? "border-green-500/30 text-green-400 bg-green-500/10"
                            : "border-zinc-500/30 text-zinc-400 bg-zinc-500/10"
                        }`}
                      >
                        {rule.enabled ? "Active" : "Disabled"}
                      </Badge>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRuleEnabled(rule.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* ── Notification Preferences ───────────────────────────────── */}
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Monitor className="h-5 w-5 text-primary" />
              Notification Preferences
            </h2>

            <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
              {/* Channel x Severity matrix */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Channel Preferences by Severity
                </h3>

                {/* Header row */}
                <div className="grid grid-cols-5 gap-4 mb-3 px-2">
                  <div className="text-xs font-medium text-muted-foreground">Channel</div>
                  <div className="text-xs font-medium text-center text-red-400">Critical</div>
                  <div className="text-xs font-medium text-center text-orange-400">High</div>
                  <div className="text-xs font-medium text-center text-amber-400">Medium</div>
                  <div className="text-xs font-medium text-center text-blue-400">Low</div>
                </div>

                {/* Channel rows */}
                <div className="space-y-2">
                  {channels.map((channel, channelIndex) => {
                    const ChannelIcon = channel.icon;
                    return (
                      <div
                        key={channel.name}
                        className="grid grid-cols-5 gap-4 items-center px-2 py-3 rounded-lg bg-white/[0.02] border border-white/5"
                      >
                        <div className="flex items-center gap-2">
                          <ChannelIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            {channel.name}
                          </span>
                        </div>
                        <div className="flex justify-center">
                          <Switch
                            checked={channel.critical}
                            onCheckedChange={() =>
                              toggleChannelPreference(channelIndex, "critical")
                            }
                          />
                        </div>
                        <div className="flex justify-center">
                          <Switch
                            checked={channel.high}
                            onCheckedChange={() =>
                              toggleChannelPreference(channelIndex, "high")
                            }
                          />
                        </div>
                        <div className="flex justify-center">
                          <Switch
                            checked={channel.medium}
                            onCheckedChange={() =>
                              toggleChannelPreference(channelIndex, "medium")
                            }
                          />
                        </div>
                        <div className="flex justify-center">
                          <Switch
                            checked={channel.low}
                            onCheckedChange={() =>
                              toggleChannelPreference(channelIndex, "low")
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator className="my-5" />

              {/* Quiet Hours */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Quiet Hours
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  During quiet hours, only critical notifications will be delivered. All other
                  notifications will be queued and delivered when quiet hours end.
                </p>
                <div className="flex items-center gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Start Time</Label>
                    <Input
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      className="bg-white/[0.03] border-white/10 focus:border-primary/50 w-36"
                    />
                  </div>
                  <span className="text-muted-foreground mt-5">to</span>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">End Time</Label>
                    <Input
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      className="bg-white/[0.03] border-white/10 focus:border-primary/50 w-36"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-muted-foreground hover:text-foreground mt-5"
                    onClick={() => {
                      toast({
                        title: "Quiet hours saved",
                        description: `Quiet hours set from ${quietHoursStart} to ${quietHoursEnd}.`,
                      });
                    }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotificationsCenter;
