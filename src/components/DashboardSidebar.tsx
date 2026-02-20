import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  GraduationCap,
  User,
  Plug,
  Shield,
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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";

const DashboardSidebar = ({ overdueTaskCount = 0 }: { overdueTaskCount?: number }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const { t } = useTranslation();

  const menuItems = [
    { icon: LayoutDashboard, label: t("sidebar.clinicalOverview"), path: "/dashboard" },
    { icon: Bot, label: t("sidebar.healthcareAgents"), path: "/dashboard/agents" },
    { icon: Terminal, label: t("sidebar.commandStation"), path: "/dashboard/command", badge: overdueTaskCount > 0 ? overdueTaskCount : undefined },
    { icon: Network, label: t("sidebar.agentOrgChart"), path: "/dashboard/org-chart" },
    { icon: Database, label: t("sidebar.agentDataCenter"), path: "/dashboard/data-center" },
    { icon: MessageCircle, label: t("sidebar.agentPlayground"), path: "/dashboard/playground" },
    { icon: Zap, label: t("sidebar.medicalSkills"), path: "/dashboard/skills" },
    { icon: GitBranch, label: t("sidebar.careWorkflows"), path: "/dashboard/workflows" },
    { icon: Plug, label: t("sidebar.ehrIntegrations"), path: "/dashboard/integrations" },
    { icon: Heart, label: t("sidebar.patientPortal"), path: "/dashboard/patients" },
    { icon: Building2, label: t("sidebar.practiceProfile"), path: "/dashboard/company" },
    { icon: UserPlus, label: t("sidebar.careTeam"), path: "/dashboard/team" },
    { icon: Link2, label: t("sidebar.agentCollaboration"), path: "/dashboard/collaboration" },
    { icon: MessageSquare, label: t("sidebar.patientComms"), path: "/dashboard/communication" },
    { icon: ListTodo, label: t("sidebar.clinicalTasks"), path: "/dashboard/tasks" },
    { icon: BookOpen, label: t("sidebar.medicalKnowledge"), path: "/dashboard/knowledge" },
    { icon: BarChart3, label: t("sidebar.clinicalReports"), path: "/dashboard/reports" },
    { icon: LayoutGrid, label: t("sidebar.customDashboards"), path: "/dashboard/custom-dashboards" },
    { icon: ScrollText, label: t("sidebar.auditLogs"), path: "/dashboard/logs" },
    { icon: Bell, label: t("sidebar.alertsNotifications"), path: "/dashboard/notifications" },
    { icon: Mail, label: t("sidebar.patientCampaigns"), path: "/dashboard/campaigns" },
    { icon: GraduationCap, label: t("sidebar.trainingCenter"), path: "/dashboard/training" },
    { icon: ShieldAlert, label: t("sidebar.phiMonitor"), path: "/dashboard/phi-monitor" },
    { icon: Code2, label: t("sidebar.apiPortal"), path: "/dashboard/api" },
    { icon: Wallet, label: t("sidebar.companyCards"), path: "/dashboard/cards" },
    { icon: CreditCard, label: t("sidebar.billingPlans"), path: "/dashboard/billing" },
    { icon: User, label: t("sidebar.providerProfile"), path: "/dashboard/profile" },
    { icon: Shield, label: t("sidebar.admin"), path: "/dashboard/admin" },
    { icon: Settings, label: t("sidebar.settings"), path: "/dashboard/settings" },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow-sm shrink-0">
          <Zap className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-sm">Dr. Claw</span>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          const badge = (item as { badge?: number }).badge;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {badge && !collapsed && (
                <span className="ml-auto flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 border border-red-500/30">
                  {badge}
                </span>
              )}
              {badge && collapsed && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Link>
          );
        })}
      </nav>

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
