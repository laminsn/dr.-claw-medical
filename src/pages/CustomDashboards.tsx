import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Settings,
  X,
  GripVertical,
  LayoutGrid,
  LineChart,
  BarChart3,
  PieChart,
  Table2,
  Activity,
  CircleDot,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Trash2,
  Bot,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  CalendarCheck,
  Timer,
  Star,
  Share2,
  FileDown,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────────────

type WidgetType =
  | "kpi"
  | "line-chart"
  | "bar-chart"
  | "pie-chart"
  | "table"
  | "activity-feed"
  | "progress-ring"
  | "leaderboard";

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  dataSource: string;
  timeRange: string;
  refreshInterval: string;
  colorTheme: number;
  data: Record<string, unknown>;
}

interface DashboardConfig {
  id: string;
  name: string;
  autoRefresh: boolean;
  shareWithTeam: boolean;
  widgets: Widget[];
}

// ── Color Themes ───────────────────────────────────────────────────────

const colorThemes = [
  { id: 0, from: "from-primary", to: "to-blue-600", label: "Blue" },
  { id: 1, from: "from-emerald-500", to: "to-green-600", label: "Green" },
  { id: 2, from: "from-violet-500", to: "to-purple-600", label: "Purple" },
  { id: 3, from: "from-amber-500", to: "to-orange-600", label: "Amber" },
];

// ── Default Dashboard Data ─────────────────────────────────────────────

const operationsWidgets: Widget[] = [
  {
    id: "ops-1",
    type: "kpi",
    title: "Active Agents",
    dataSource: "Agent Tasks",
    timeRange: "Today",
    refreshInterval: "Real-time",
    colorTheme: 0,
    data: { value: "12", change: "+3", trend: "up", icon: "Bot" },
  },
  {
    id: "ops-2",
    type: "kpi",
    title: "Tasks Today",
    dataSource: "Agent Tasks",
    timeRange: "Today",
    refreshInterval: "5min",
    colorTheme: 0,
    data: { value: "284", change: "+18%", trend: "up", icon: "CheckCircle2" },
  },
  {
    id: "ops-3",
    type: "kpi",
    title: "Success Rate",
    dataSource: "Agent Tasks",
    timeRange: "Today",
    refreshInterval: "5min",
    colorTheme: 1,
    data: { value: "94.2%", change: "+2.1%", trend: "up", icon: "TrendingUp" },
  },
  {
    id: "ops-4",
    type: "kpi",
    title: "Avg Response",
    dataSource: "API Calls",
    timeRange: "Today",
    refreshInterval: "Real-time",
    colorTheme: 1,
    data: { value: "1.8s", change: "-0.3s", trend: "up", icon: "Clock" },
  },
  {
    id: "ops-5",
    type: "line-chart",
    title: "Task Volume This Week",
    dataSource: "Agent Tasks",
    timeRange: "This Week",
    refreshInterval: "15min",
    colorTheme: 0,
    data: {
      bars: [
        { label: "Mon", value: 65 },
        { label: "Tue", value: 78 },
        { label: "Wed", value: 52 },
        { label: "Thu", value: 91 },
        { label: "Fri", value: 84 },
        { label: "Sat", value: 36 },
        { label: "Sun", value: 42 },
      ],
    },
  },
  {
    id: "ops-6",
    type: "bar-chart",
    title: "Agent Comparison",
    dataSource: "Agent Tasks",
    timeRange: "This Week",
    refreshInterval: "1hr",
    colorTheme: 2,
    data: {
      bars: [
        { label: "Front Desk", value: 85 },
        { label: "Clinical", value: 72 },
        { label: "Billing", value: 68 },
        { label: "Content", value: 91 },
        { label: "HR", value: 54 },
      ],
    },
  },
  {
    id: "ops-7",
    type: "activity-feed",
    title: "Recent Agent Actions",
    dataSource: "Agent Tasks",
    timeRange: "Today",
    refreshInterval: "Real-time",
    colorTheme: 0,
    data: {
      items: [
        { text: "Front Desk booked appointment for J. Martinez", time: "2 min ago" },
        { text: "Content Engine generated 3 blog posts", time: "8 min ago" },
        { text: "Clinical Coordinator processed 5 referrals", time: "15 min ago" },
        { text: "Grant Writer submitted NIH R01 draft", time: "22 min ago" },
        { text: "Financial Analyst ran monthly P&L report", time: "38 min ago" },
      ],
    },
  },
  {
    id: "ops-8",
    type: "leaderboard",
    title: "Top Agents by Tasks",
    dataSource: "Agent Tasks",
    timeRange: "This Week",
    refreshInterval: "1hr",
    colorTheme: 3,
    data: {
      items: [
        { name: "Content Engine", score: 142 },
        { name: "Front Desk Agent", score: 128 },
        { name: "Clinical Coordinator", score: 97 },
        { name: "Grant Writer", score: 84 },
        { name: "Financial Analyst", score: 71 },
      ],
    },
  },
];

const clinicalWidgets: Widget[] = [
  {
    id: "clin-1",
    type: "kpi",
    title: "Patients Seen",
    dataSource: "Patient Data",
    timeRange: "Today",
    refreshInterval: "5min",
    colorTheme: 0,
    data: { value: "47", change: "+5", trend: "up", icon: "Users" },
  },
  {
    id: "clin-2",
    type: "kpi",
    title: "Appointments",
    dataSource: "Patient Data",
    timeRange: "Today",
    refreshInterval: "5min",
    colorTheme: 0,
    data: { value: "23", change: "+3", trend: "up", icon: "CalendarCheck" },
  },
  {
    id: "clin-3",
    type: "kpi",
    title: "Wait Time",
    dataSource: "Patient Data",
    timeRange: "Today",
    refreshInterval: "Real-time",
    colorTheme: 1,
    data: { value: "12min", change: "-2min", trend: "up", icon: "Timer" },
  },
  {
    id: "clin-4",
    type: "kpi",
    title: "Satisfaction",
    dataSource: "Patient Data",
    timeRange: "Today",
    refreshInterval: "1hr",
    colorTheme: 1,
    data: { value: "4.8/5", change: "+0.2", trend: "up", icon: "Star" },
  },
  {
    id: "clin-5",
    type: "progress-ring",
    title: "Daily Goal",
    dataSource: "Patient Data",
    timeRange: "Today",
    refreshInterval: "5min",
    colorTheme: 0,
    data: { percentage: 78, label: "of daily target" },
  },
  {
    id: "clin-6",
    type: "table",
    title: "Today's Schedule",
    dataSource: "Patient Data",
    timeRange: "Today",
    refreshInterval: "5min",
    colorTheme: 0,
    data: {
      rows: [
        { time: "9:00 AM", patient: "Sarah Johnson", type: "Follow-up", status: "Completed" },
        { time: "9:30 AM", patient: "Michael Chen", type: "New Patient", status: "Completed" },
        { time: "10:15 AM", patient: "Emily Davis", type: "Consultation", status: "In Progress" },
        { time: "11:00 AM", patient: "Robert Wilson", type: "Check-up", status: "Waiting" },
        { time: "11:45 AM", patient: "Lisa Anderson", type: "Follow-up", status: "Scheduled" },
      ],
    },
  },
];

const defaultDashboards: DashboardConfig[] = [
  {
    id: "ops",
    name: "Operations Overview",
    autoRefresh: true,
    shareWithTeam: false,
    widgets: operationsWidgets,
  },
  {
    id: "clinical",
    name: "Clinical Metrics",
    autoRefresh: true,
    shareWithTeam: true,
    widgets: clinicalWidgets,
  },
  {
    id: "financial",
    name: "Financial Summary",
    autoRefresh: false,
    shareWithTeam: false,
    widgets: [],
  },
];

// ── Icon Resolver ──────────────────────────────────────────────────────

const iconMap: Record<string, typeof Bot> = {
  Bot,
  CheckCircle2,
  TrendingUp,
  Clock,
  Users,
  CalendarCheck,
  Timer,
  Star,
};

// ── Widget Renderers ───────────────────────────────────────────────────

function KpiWidget({ widget }: { widget: Widget }) {
  const { value, change, trend, icon } = widget.data as {
    value: string;
    change: string;
    trend: string;
    icon: string;
  };
  const theme = colorThemes[widget.colorTheme] || colorThemes[0];
  const IconComp = iconMap[icon] || Bot;

  return (
    <div>
      <div className="flex items-start justify-between mb-3">
        <div
          className={`flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br ${theme.from} ${theme.to} shadow-glow-sm`}
        >
          <IconComp className="h-5 w-5 text-white" />
        </div>
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-medium ${
            trend === "up" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold font-heading text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{widget.title}</p>
    </div>
  );
}

function LineChartWidget({ widget }: { widget: Widget }) {
  const { t } = useTranslation();
  const { bars } = widget.data as { bars: { label: string; value: number }[] };
  const maxVal = Math.max(...bars.map((b) => b.value));
  const theme = colorThemes[widget.colorTheme] || colorThemes[0];

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-1">{widget.title}</h4>
      <p className="text-xs text-muted-foreground mb-4">{t("customDashboards.weeklyBreakdown")}</p>
      <div className="flex items-end gap-2 h-32">
        {bars.map((bar) => (
          <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t-md bg-gradient-to-t ${theme.from} ${theme.to} opacity-80`}
              style={{ height: `${(bar.value / maxVal) * 100}%` }}
            />
            <span className="text-[10px] text-muted-foreground">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChartWidget({ widget }: { widget: Widget }) {
  const { t } = useTranslation();
  const { bars } = widget.data as { bars: { label: string; value: number }[] };
  const maxVal = Math.max(...bars.map((b) => b.value));
  const theme = colorThemes[widget.colorTheme] || colorThemes[0];

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-1">{widget.title}</h4>
      <p className="text-xs text-muted-foreground mb-4">{t("customDashboards.performanceComparison")}</p>
      <div className="space-y-2.5">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-20 truncate">{bar.label}</span>
            <div className="flex-1 h-5 rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${theme.from} ${theme.to} opacity-80`}
                style={{ width: `${(bar.value / maxVal) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-foreground w-8 text-right">{bar.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityFeedWidget({ widget }: { widget: Widget }) {
  const { items } = widget.data as { items: { text: string; time: string }[] };

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-3">{widget.title}</h4>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="relative mt-1.5">
              <div className="h-2 w-2 rounded-full bg-primary/60" />
              {idx < items.length - 1 && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-px h-full bg-white/[0.06]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground/80 leading-relaxed">{item.text}</p>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaderboardWidget({ widget }: { widget: Widget }) {
  const { items } = widget.data as { items: { name: string; score: number }[] };
  const theme = colorThemes[widget.colorTheme] || colorThemes[0];

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-3">{widget.title}</h4>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={item.name}
            className="flex items-center gap-3 py-1.5"
          >
            <span
              className={`flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-bold ${
                idx === 0
                  ? `bg-gradient-to-br ${theme.from} ${theme.to} text-white`
                  : "bg-white/[0.06] text-muted-foreground"
              }`}
            >
              {idx + 1}
            </span>
            <span className="flex-1 text-xs text-foreground">{item.name}</span>
            <Badge variant="secondary" className="text-[11px]">
              {item.score}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressRingWidget({ widget }: { widget: Widget }) {
  const { percentage, label } = widget.data as { percentage: number; label: string };
  const theme = colorThemes[widget.colorTheme] || colorThemes[0];
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <h4 className="text-sm font-semibold text-foreground mb-4 self-start">{widget.title}</h4>
      <div className="relative">
        <svg width="120" height="120" className="-rotate-90">
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-white/[0.06]"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${
              theme.from === "from-primary" ? "text-primary" : "text-emerald-500"
            }`}
            stroke="currentColor"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-heading text-foreground">{percentage}%</span>
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>
      </div>
    </div>
  );
}

function TableWidget({ widget }: { widget: Widget }) {
  const { t } = useTranslation();
  const { rows } = widget.data as {
    rows: { time: string; patient: string; type: string; status: string }[];
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-emerald-400";
      case "In Progress":
        return "text-primary";
      case "Waiting":
        return "text-amber-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-3">{widget.title}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left text-muted-foreground font-medium py-2 pr-3">{t("customDashboards.time")}</th>
              <th className="text-left text-muted-foreground font-medium py-2 pr-3">{t("customDashboards.patient")}</th>
              <th className="text-left text-muted-foreground font-medium py-2 pr-3">{t("customDashboards.type")}</th>
              <th className="text-left text-muted-foreground font-medium py-2">{t("customDashboards.status")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-white/[0.04]">
                <td className="py-2 pr-3 text-muted-foreground">{row.time}</td>
                <td className="py-2 pr-3 text-foreground">{row.patient}</td>
                <td className="py-2 pr-3 text-muted-foreground">{row.type}</td>
                <td className={`py-2 font-medium ${statusColor(row.status)}`}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderWidget(widget: Widget) {
  switch (widget.type) {
    case "kpi":
      return <KpiWidget widget={widget} />;
    case "line-chart":
      return <LineChartWidget widget={widget} />;
    case "bar-chart":
      return <BarChartWidget widget={widget} />;
    case "activity-feed":
      return <ActivityFeedWidget widget={widget} />;
    case "leaderboard":
      return <LeaderboardWidget widget={widget} />;
    case "progress-ring":
      return <ProgressRingWidget widget={widget} />;
    case "table":
      return <TableWidget widget={widget} />;
    case "pie-chart":
      return <BarChartWidget widget={widget} />;
    default:
      return null;
  }
}

// ── Grid span logic for widget types ───────────────────────────────────

function widgetColSpan(type: WidgetType): string {
  switch (type) {
    case "kpi":
      return "col-span-1";
    case "line-chart":
    case "bar-chart":
    case "pie-chart":
      return "col-span-1 lg:col-span-2";
    case "table":
      return "col-span-1 lg:col-span-2";
    case "activity-feed":
      return "col-span-1";
    case "progress-ring":
      return "col-span-1";
    case "leaderboard":
      return "col-span-1";
    default:
      return "col-span-1";
  }
}

// ── Main Component ─────────────────────────────────────────────────────

const CustomDashboards = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  // Widget Gallery Definitions (inside component for t() access)
  const widgetGallery: {
    type: WidgetType;
    name: string;
    description: string;
    color: string;
    icon: typeof LayoutGrid;
  }[] = [
    {
      type: "kpi",
      name: t("customDashboards.kpiCard"),
      description: t("customDashboards.kpiCardDesc"),
      color: "from-primary to-blue-600",
      icon: LayoutGrid,
    },
    {
      type: "line-chart",
      name: t("customDashboards.lineChart"),
      description: t("customDashboards.lineChartDesc"),
      color: "from-cyan-500 to-teal-500",
      icon: LineChart,
    },
    {
      type: "bar-chart",
      name: t("customDashboards.barChart"),
      description: t("customDashboards.barChartDesc"),
      color: "from-violet-500 to-purple-600",
      icon: BarChart3,
    },
    {
      type: "pie-chart",
      name: t("customDashboards.pieChart"),
      description: t("customDashboards.pieChartDesc"),
      color: "from-amber-500 to-orange-600",
      icon: PieChart,
    },
    {
      type: "table",
      name: t("customDashboards.table"),
      description: t("customDashboards.tableDesc"),
      color: "from-emerald-500 to-green-600",
      icon: Table2,
    },
    {
      type: "activity-feed",
      name: t("customDashboards.activityFeed"),
      description: t("customDashboards.activityFeedDesc"),
      color: "from-rose-500 to-pink-600",
      icon: Activity,
    },
    {
      type: "progress-ring",
      name: t("customDashboards.progressRing"),
      description: t("customDashboards.progressRingDesc"),
      color: "from-sky-500 to-blue-500",
      icon: CircleDot,
    },
    {
      type: "leaderboard",
      name: t("customDashboards.leaderboard"),
      description: t("customDashboards.leaderboardDesc"),
      color: "from-yellow-500 to-amber-600",
      icon: Trophy,
    },
  ];

  // Dashboard state
  const [dashboards, setDashboards] = useState<DashboardConfig[]>(defaultDashboards);
  const [activeDashboardId, setActiveDashboardId] = useState<string>("ops");

  // Dialog state
  const [widgetGalleryOpen, setWidgetGalleryOpen] = useState(false);
  const [configWidgetId, setConfigWidgetId] = useState<string | null>(null);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [editingDashboardId, setEditingDashboardId] = useState<string | null>(null);
  const [editingDashboardName, setEditingDashboardName] = useState("");

  // Active dashboard
  const activeDashboard = dashboards.find((d) => d.id === activeDashboardId) || dashboards[0];
  const configWidget = configWidgetId
    ? activeDashboard.widgets.find((w) => w.id === configWidgetId)
    : null;

  // ── Dashboard CRUD ───────────────────────────────────────────────────

  const createNewDashboard = () => {
    const newId = `dash-${Date.now()}`;
    const newDash: DashboardConfig = {
      id: newId,
      name: t("customDashboards.newDashboard"),
      autoRefresh: false,
      shareWithTeam: false,
      widgets: [],
    };
    setDashboards((prev) => [...prev, newDash]);
    setActiveDashboardId(newId);
    toast({
      title: t("customDashboards.dashboardCreated"),
      description: t("customDashboards.dashboardCreatedDesc"),
    });
  };

  const deleteDashboard = (dashId: string) => {
    const dash = dashboards.find((d) => d.id === dashId);
    if (!dash) return;
    setDashboards((prev) => prev.filter((d) => d.id !== dashId));
    if (activeDashboardId === dashId) {
      setActiveDashboardId(dashboards[0]?.id || "");
    }
    toast({
      title: t("customDashboards.dashboardDeleted"),
      description: t("customDashboards.dashboardDeletedDesc", { name: dash.name }),
    });
  };

  const startRenameDashboard = (dashId: string) => {
    const dash = dashboards.find((d) => d.id === dashId);
    if (!dash) return;
    setEditingDashboardId(dashId);
    setEditingDashboardName(dash.name);
  };

  const saveRenameDashboard = () => {
    if (!editingDashboardId) return;
    setDashboards((prev) =>
      prev.map((d) =>
        d.id === editingDashboardId ? { ...d, name: editingDashboardName } : d
      )
    );
    toast({
      title: t("customDashboards.dashboardRenamed"),
      description: t("customDashboards.dashboardRenamedDesc", { name: editingDashboardName }),
    });
    setEditingDashboardId(null);
    setEditingDashboardName("");
  };

  // ── Widget CRUD ──────────────────────────────────────────────────────

  const addWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: widgetGallery.find((w) => w.type === type)?.name || "Widget",
      dataSource: "Agent Tasks",
      timeRange: "Today",
      refreshInterval: "5min",
      colorTheme: 0,
      data: getDefaultWidgetData(type),
    };
    setDashboards((prev) =>
      prev.map((d) =>
        d.id === activeDashboardId ? { ...d, widgets: [...d.widgets, newWidget] } : d
      )
    );
    setWidgetGalleryOpen(false);
    toast({
      title: t("customDashboards.widgetAdded"),
      description: t("customDashboards.widgetAddedDesc", { title: newWidget.title }),
    });
  };

  const removeWidget = (widgetId: string) => {
    const widget = activeDashboard.widgets.find((w) => w.id === widgetId);
    if (!widget) return;

    setDashboards((prev) =>
      prev.map((d) =>
        d.id === activeDashboardId
          ? { ...d, widgets: d.widgets.filter((w) => w.id !== widgetId) }
          : d
      )
    );

    toast({
      title: t("customDashboards.widgetRemoved"),
      description: t("customDashboards.widgetRemovedDesc", { title: widget.title }),
      action: (
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => {
            setDashboards((prev) =>
              prev.map((d) =>
                d.id === activeDashboardId
                  ? { ...d, widgets: [...d.widgets, widget] }
                  : d
              )
            );
            toast({
              title: t("customDashboards.widgetRestored"),
              description: t("customDashboards.widgetRestoredDesc", { title: widget.title }),
            });
          }}
        >
          {t("customDashboards.undo")}
        </Button>
      ),
    });
  };

  const updateWidgetConfig = (widgetId: string, updates: Partial<Widget>) => {
    setDashboards((prev) =>
      prev.map((d) =>
        d.id === activeDashboardId
          ? {
              ...d,
              widgets: d.widgets.map((w) => (w.id === widgetId ? { ...w, ...updates } : w)),
            }
          : d
      )
    );
  };

  // ── Dashboard Settings ───────────────────────────────────────────────

  const updateDashboardSetting = (key: keyof DashboardConfig, value: unknown) => {
    setDashboards((prev) =>
      prev.map((d) => (d.id === activeDashboardId ? { ...d, [key]: value } : d))
    );
  };

  const handleExportPdf = () => {
    toast({
      title: t("customDashboards.exportingPdf"),
      description: t("customDashboards.exportingPdfDesc", { name: activeDashboard.name }),
    });
  };

  // ── Default data for new widgets ─────────────────────────────────────

  function getDefaultWidgetData(type: WidgetType): Record<string, unknown> {
    switch (type) {
      case "kpi":
        return { value: "0", change: "--", trend: "up", icon: "Bot" };
      case "line-chart":
      case "bar-chart":
      case "pie-chart":
        return {
          bars: [
            { label: "A", value: 40 },
            { label: "B", value: 65 },
            { label: "C", value: 30 },
            { label: "D", value: 80 },
          ],
        };
      case "table":
        return {
          rows: [
            { time: "--", patient: t("customDashboards.noData"), type: "--", status: "Scheduled" },
          ],
        };
      case "activity-feed":
        return { items: [{ text: t("customDashboards.noRecentActivity"), time: t("customDashboards.justNow") }] };
      case "progress-ring":
        return { percentage: 0, label: t("customDashboards.noDataLabel") };
      case "leaderboard":
        return { items: [{ name: t("customDashboards.noData"), score: 0 }] };
      default:
        return {};
    }
  }

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <DashboardLayout>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-heading gradient-hero-text">
                {t("customDashboards.title")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t("customDashboards.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsPanelOpen(true)}
              >
                <Settings className="h-4 w-4 mr-1.5" />
                {t("customDashboards.settings")}
              </Button>
              <Button
                size="sm"
                onClick={() => setWidgetGalleryOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                {t("customDashboards.addWidget")}
              </Button>
            </div>
          </div>

          {/* ── Dashboard Selector ─────────────────────────────────── */}
          <div className="bg-card rounded-xl border border-white/[0.06] p-3">
            <div className="flex items-center gap-2 flex-wrap">
              {dashboards.map((dash) => (
                <div key={dash.id} className="flex items-center gap-1">
                  {editingDashboardId === dash.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingDashboardName}
                        onChange={(e) => setEditingDashboardName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRenameDashboard();
                          if (e.key === "Escape") {
                            setEditingDashboardId(null);
                            setEditingDashboardName("");
                          }
                        }}
                        className="h-8 w-40 text-xs"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={saveRenameDashboard}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveDashboardId(dash.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeDashboardId === dash.id
                          ? "bg-primary text-white shadow-glow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                      }`}
                    >
                      {dash.name}
                    </button>
                  )}
                  {activeDashboardId === dash.id && editingDashboardId !== dash.id && (
                    <div className="flex items-center gap-0.5 ml-1">
                      <button
                        onClick={() => startRenameDashboard(dash.id)}
                        className="p-1 rounded hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors"
                        title={t("customDashboards.renameDashboard")}
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      {dashboards.length > 1 && (
                        <button
                          onClick={() => deleteDashboard(dash.id)}
                          className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                          title={t("customDashboards.deleteDashboard")}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={createNewDashboard}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-all border border-dashed border-white/[0.1]"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("customDashboards.newDashboard")}
              </button>
            </div>
          </div>

          {/* ── Dashboard Canvas ───────────────────────────────────── */}
          {activeDashboard.widgets.length === 0 ? (
            <div className="bg-card rounded-xl border border-white/[0.06] p-16 flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-white/[0.04] mb-4">
                <LayoutGrid className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {t("customDashboards.noWidgetsYet")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                {t("customDashboards.noWidgetsDesc")}
              </p>
              <Button onClick={() => setWidgetGalleryOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                {t("customDashboards.addFirstWidget")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeDashboard.widgets.map((widget) => (
                <div
                  key={widget.id}
                  className={`bg-card rounded-xl border border-white/[0.06] p-5 card-hover ${widgetColSpan(widget.type)}`}
                >
                  {/* Widget toolbar */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <GripVertical className="h-4 w-4 cursor-grab" />
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => setConfigWidgetId(widget.id)}
                        className="p-1 rounded hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors"
                        title={t("customDashboards.widgetSettings")}
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeWidget(widget.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                        title={t("customDashboards.removeWidget")}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {renderWidget(widget)}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Widget Gallery Dialog ────────────────────────────────────── */}
      <Dialog open={widgetGalleryOpen} onOpenChange={setWidgetGalleryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("customDashboards.addWidget")}</DialogTitle>
            <DialogDescription>
              {t("customDashboards.addWidgetDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            {widgetGallery.map((item) => (
              <button
                key={item.type}
                onClick={() => addWidget(item.type)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/[0.06] hover:border-primary/40 hover:bg-white/[0.02] transition-all text-center group"
              >
                <div
                  className={`flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br ${item.color} shadow-glow-sm group-hover:scale-105 transition-transform`}
                >
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium text-foreground">{item.name}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {item.description}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Widget Configuration Dialog ──────────────────────────────── */}
      <Dialog
        open={configWidgetId !== null}
        onOpenChange={(open) => {
          if (!open) setConfigWidgetId(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("customDashboards.widgetConfiguration")}</DialogTitle>
            <DialogDescription>
              {t("customDashboards.widgetConfigurationDesc")}
            </DialogDescription>
          </DialogHeader>
          {configWidget && (
            <div className="space-y-4 mt-2">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t("customDashboards.widgetTitle")}</label>
                <Input
                  value={configWidget.title}
                  onChange={(e) =>
                    updateWidgetConfig(configWidget.id, { title: e.target.value })
                  }
                  className="h-9 text-sm"
                />
              </div>

              {/* Data Source */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t("customDashboards.dataSource")}</label>
                <Select
                  value={configWidget.dataSource}
                  onValueChange={(value) =>
                    updateWidgetConfig(configWidget.id, { dataSource: value })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agent Tasks">{t("customDashboards.agentTasks")}</SelectItem>
                    <SelectItem value="API Calls">{t("customDashboards.apiCalls")}</SelectItem>
                    <SelectItem value="Patient Data">{t("customDashboards.patientData")}</SelectItem>
                    <SelectItem value="Financial">{t("customDashboards.financial")}</SelectItem>
                    <SelectItem value="Communications">{t("customDashboards.communications")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t("customDashboards.timeRange")}</label>
                <Select
                  value={configWidget.timeRange}
                  onValueChange={(value) =>
                    updateWidgetConfig(configWidget.id, { timeRange: value })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Today">{t("customDashboards.today")}</SelectItem>
                    <SelectItem value="This Week">{t("customDashboards.thisWeek")}</SelectItem>
                    <SelectItem value="This Month">{t("customDashboards.thisMonth")}</SelectItem>
                    <SelectItem value="This Quarter">{t("customDashboards.thisQuarter")}</SelectItem>
                    <SelectItem value="Custom">{t("customDashboards.customRange")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Refresh Interval */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("customDashboards.refreshInterval")}
                </label>
                <Select
                  value={configWidget.refreshInterval}
                  onValueChange={(value) =>
                    updateWidgetConfig(configWidget.id, { refreshInterval: value })
                  }
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Real-time">{t("customDashboards.realTime")}</SelectItem>
                    <SelectItem value="5min">{t("customDashboards.fiveMinutes")}</SelectItem>
                    <SelectItem value="15min">{t("customDashboards.fifteenMinutes")}</SelectItem>
                    <SelectItem value="1hr">{t("customDashboards.oneHour")}</SelectItem>
                    <SelectItem value="Manual">{t("customDashboards.manual")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Color Theme */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">{t("customDashboards.colorTheme")}</label>
                <div className="flex items-center gap-2">
                  {colorThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() =>
                        updateWidgetConfig(configWidget.id, { colorTheme: theme.id })
                      }
                      className={`h-8 w-8 rounded-full bg-gradient-to-br ${theme.from} ${theme.to} transition-all ${
                        configWidget.colorTheme === theme.id
                          ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
                          : "opacity-60 hover:opacity-100"
                      }`}
                      title={theme.label}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => {
                    setConfigWidgetId(null);
                    toast({
                      title: t("customDashboards.widgetUpdated"),
                      description: t("customDashboards.widgetUpdatedDesc", { title: configWidget.title }),
                    });
                  }}
                >
                  {t("customDashboards.saveChanges")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dashboard Settings Dialog ────────────────────────────────── */}
      <Dialog open={settingsPanelOpen} onOpenChange={setSettingsPanelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("customDashboards.dashboardSettings")}</DialogTitle>
            <DialogDescription>
              {t("customDashboards.dashboardSettingsDesc", { name: activeDashboard.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            {/* Dashboard name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("customDashboards.dashboardName")}</label>
              <Input
                value={activeDashboard.name}
                onChange={(e) => updateDashboardSetting("name", e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <Separator />

            {/* Auto-refresh */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t("customDashboards.autoRefresh")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("customDashboards.autoRefreshDesc")}
                </p>
              </div>
              <Switch
                checked={activeDashboard.autoRefresh}
                onCheckedChange={(checked) => {
                  updateDashboardSetting("autoRefresh", checked);
                  toast({
                    title: checked ? t("customDashboards.autoRefreshEnabled") : t("customDashboards.autoRefreshDisabled"),
                    description: checked
                      ? t("customDashboards.autoRefreshEnabledDesc")
                      : t("customDashboards.autoRefreshDisabledDesc"),
                  });
                }}
              />
            </div>

            {/* Share with team */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t("customDashboards.shareWithTeam")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("customDashboards.shareWithTeamDesc")}
                </p>
              </div>
              <Switch
                checked={activeDashboard.shareWithTeam}
                onCheckedChange={(checked) => {
                  updateDashboardSetting("shareWithTeam", checked);
                  toast({
                    title: checked ? t("customDashboards.dashboardShared") : t("customDashboards.dashboardUnshared"),
                    description: checked
                      ? t("customDashboards.dashboardSharedDesc")
                      : t("customDashboards.dashboardUnsharedDesc"),
                  });
                }}
              />
            </div>

            <Separator />

            {/* Export PDF */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t("customDashboards.exportAsPdf")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("customDashboards.exportAsPdfDesc")}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportPdf}>
                <FileDown className="h-4 w-4 mr-1.5" />
                {t("customDashboards.export")}
              </Button>
            </div>

            {/* Dashboard info */}
            <div className="bg-white/[0.02] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("customDashboards.widgets")}</span>
                <span className="text-foreground font-medium">
                  {activeDashboard.widgets.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("customDashboards.autoRefresh")}</span>
                <Badge variant={activeDashboard.autoRefresh ? "default" : "secondary"} className="text-[10px]">
                  {activeDashboard.autoRefresh ? t("customDashboards.on") : t("customDashboards.off")}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("customDashboards.visibility")}</span>
                <div className="flex items-center gap-1 text-xs text-foreground">
                  {activeDashboard.shareWithTeam ? (
                    <>
                      <Share2 className="h-3 w-3" />
                      {t("customDashboards.shared")}
                    </>
                  ) : (
                    t("customDashboards.private")
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CustomDashboards;
