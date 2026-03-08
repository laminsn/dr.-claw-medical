import { useState, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Zap,
  GraduationCap,
  User,
  Plug,
  Building2,
  UserPlus,
  Link2,
  MessageSquare,
  ListTodo,
  ScrollText,
  ShieldAlert,
  Mail,
  Heart,
  BarChart3,
  GitBranch,
  BookOpen,
  CreditCard,
  Bell,
  MessageCircle,
  LayoutGrid,
  Code2,
  Terminal,
  Network,
  Database,
  Wallet,
  Webhook,
  Shield,
  type LucideIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  badge?: number;
}

interface MenuGroup {
  id: string;
  labelKey: string;
  icon: LucideIcon;
  items: MenuItem[];
}

const STORAGE_KEY = "dcm-sidebar-expanded-groups";

function getPersistedGroups(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function persistGroups(groups: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch {
    // ignore storage errors
  }
}

const DashboardSidebar = ({ overdueTaskCount = 0 }: { overdueTaskCount?: number }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const { t } = useTranslation();

  const menuGroups: MenuGroup[] = useMemo(() => [
    {
      id: "overview",
      labelKey: "sidebar.groupOverview",
      icon: LayoutDashboard,
      items: [
        { icon: LayoutDashboard, label: t("sidebar.clinicalOverview"), path: "/dashboard" },
        { icon: Terminal, label: t("sidebar.commandStation"), path: "/dashboard/command", badge: overdueTaskCount > 0 ? overdueTaskCount : undefined },
      ],
    },
    {
      id: "agents",
      labelKey: "sidebar.groupAgents",
      icon: Bot,
      items: [
        { icon: Bot, label: t("sidebar.healthcareAgents"), path: "/dashboard/agents" },
        { icon: MessageCircle, label: t("sidebar.agentPlayground"), path: "/dashboard/playground" },
        { icon: Network, label: t("sidebar.agentOrgChart"), path: "/dashboard/org-chart" },
        { icon: Database, label: t("sidebar.agentDataCenter"), path: "/dashboard/data-center" },
        { icon: Link2, label: t("sidebar.agentCollaboration"), path: "/dashboard/collaboration" },
      ],
    },
    {
      id: "clinical",
      labelKey: "sidebar.groupClinical",
      icon: Heart,
      items: [
        { icon: Heart, label: t("sidebar.patientPortal"), path: "/dashboard/patients" },
        { icon: MessageSquare, label: t("sidebar.patientComms"), path: "/dashboard/communication" },
        { icon: Mail, label: t("sidebar.patientCampaigns"), path: "/dashboard/campaigns" },
        { icon: BookOpen, label: t("sidebar.medicalKnowledge"), path: "/dashboard/knowledge" },
        { icon: ListTodo, label: t("sidebar.clinicalTasks"), path: "/dashboard/tasks" },
      ],
    },
    {
      id: "analytics",
      labelKey: "sidebar.groupAnalytics",
      icon: BarChart3,
      items: [
        { icon: BarChart3, label: t("sidebar.clinicalReports"), path: "/dashboard/reports" },
        { icon: LayoutGrid, label: t("sidebar.customDashboards"), path: "/dashboard/custom-dashboards" },
        { icon: ScrollText, label: t("sidebar.auditLogs"), path: "/dashboard/logs" },
        { icon: ShieldAlert, label: t("sidebar.phiMonitor"), path: "/dashboard/phi-monitor" },
      ],
    },
    {
      id: "operations",
      labelKey: "sidebar.groupOperations",
      icon: Building2,
      items: [
        { icon: Building2, label: t("sidebar.practiceProfile"), path: "/dashboard/company" },
        { icon: UserPlus, label: t("sidebar.careTeam"), path: "/dashboard/team" },
        { icon: Zap, label: t("sidebar.medicalSkills"), path: "/dashboard/skills" },
        { icon: GitBranch, label: t("sidebar.careWorkflows"), path: "/dashboard/workflows" },
        { icon: GraduationCap, label: t("sidebar.trainingCenter"), path: "/dashboard/training" },
      ],
    },
    {
      id: "integrations",
      labelKey: "sidebar.groupIntegrations",
      icon: Plug,
      items: [
        { icon: Plug, label: t("sidebar.ehrIntegrations"), path: "/dashboard/integrations" },
        { icon: GitBranch, label: t("sidebar.n8nGateway"), path: "/dashboard/n8n-gateway" },
        { icon: Webhook, label: t("sidebar.webhooks"), path: "/dashboard/webhooks" },
        { icon: Code2, label: t("sidebar.apiPortal"), path: "/dashboard/api" },
      ],
    },
    {
      id: "settings",
      labelKey: "sidebar.groupSettings",
      icon: Settings,
      items: [
        { icon: User, label: t("sidebar.providerProfile"), path: "/dashboard/profile" },
        { icon: CreditCard, label: t("sidebar.billingPlans"), path: "/dashboard/billing" },
        { icon: Wallet, label: t("sidebar.companyCards"), path: "/dashboard/cards" },
        { icon: Bell, label: t("sidebar.alertsNotifications"), path: "/dashboard/notifications" },
        { icon: Shield, label: t("sidebar.admin"), path: "/dashboard/admin" },
        { icon: Settings, label: t("sidebar.settings"), path: "/dashboard/settings" },
      ],
    },
  ], [t, overdueTaskCount]);

  // Determine which group contains the active path
  const activeGroupId = useMemo(() => {
    // Exact match for /dashboard
    if (location.pathname === "/dashboard") return "overview";
    for (const group of menuGroups) {
      if (group.items.some((item) => location.pathname === item.path)) {
        return group.id;
      }
    }
    return "overview";
  }, [location.pathname, menuGroups]);

  // Initialize expanded groups: persisted + active group
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const persisted = getPersistedGroups();
    const initial = new Set(persisted);
    initial.add(activeGroupId);
    return initial;
  });

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      persistGroups(Array.from(next));
      return next;
    });
  }, []);

  return (
    <aside
      className={`h-screen sticky top-0 bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow-sm shrink-0">
          <Zap className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-sm">Dr. Claw</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto space-y-0.5">
        {menuGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const isActiveGroup = activeGroupId === group.id;
          const GroupIcon = group.icon;

          if (collapsed) {
            // Collapsed: show only the group icon, link to first item in group
            return (
              <div key={group.id} className="relative group/sidebar">
                <Link
                  to={group.items[0].path}
                  className={`flex items-center justify-center px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActiveGroup
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <GroupIcon className="h-5 w-5 shrink-0" />
                </Link>
                {/* Tooltip */}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded-md bg-popover text-popover-foreground text-xs font-medium shadow-md border border-border opacity-0 group-hover/sidebar:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {t(group.labelKey)}
                </div>
              </div>
            );
          }

          return (
            <Collapsible
              key={group.id}
              open={isExpanded}
              onOpenChange={() => toggleGroup(group.id)}
            >
              <CollapsibleTrigger asChild>
                <button
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActiveGroup
                      ? "text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                  } hover:bg-sidebar-accent`}
                >
                  <GroupIcon className="h-4.5 w-4.5 shrink-0" />
                  <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wider">
                    {t(group.labelKey)}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40 transition-transform duration-200 ${
                      isExpanded ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="pl-3 space-y-0.5 mt-0.5">
                  {group.items.map((item) => {
                    const active = location.pathname === item.path;
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`relative flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          active
                            ? "bg-sidebar-accent text-sidebar-primary font-medium"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        }`}
                      >
                        <ItemIcon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 border border-red-500/30">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {!collapsed && (
          <div className="flex items-center gap-1 px-1 py-1">
            <ThemeToggle />
            <LanguageSelector compact />
          </div>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors w-full"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{t("nav.signOut")}</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors w-full"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!collapsed && <span>{t("nav.collapse")}</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
