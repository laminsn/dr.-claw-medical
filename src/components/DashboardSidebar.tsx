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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { icon: LayoutDashboard, label: "Clinical Overview", path: "/dashboard" },
  { icon: Bot, label: "Healthcare Agents", path: "/dashboard/agents" },
  { icon: MessageCircle, label: "Agent Playground", path: "/dashboard/playground" },
  { icon: Zap, label: "Medical Skills", path: "/dashboard/skills" },
  { icon: GitBranch, label: "Care Workflows", path: "/dashboard/workflows" },
  { icon: Plug, label: "EHR & Integrations", path: "/dashboard/integrations" },
  { icon: Heart, label: "Patient Portal", path: "/dashboard/patients" },
  { icon: Building2, label: "Practice Profile", path: "/dashboard/company" },
  { icon: UserPlus, label: "Care Team", path: "/dashboard/team" },
  { icon: Link2, label: "Agent Collaboration", path: "/dashboard/collaboration" },
  { icon: MessageSquare, label: "Patient Comms", path: "/dashboard/communication" },
  { icon: ListTodo, label: "Clinical Tasks", path: "/dashboard/tasks" },
  { icon: BookOpen, label: "Medical Knowledge", path: "/dashboard/knowledge" },
  { icon: BarChart3, label: "Clinical Reports", path: "/dashboard/reports" },
  { icon: LayoutGrid, label: "Custom Dashboards", path: "/dashboard/custom-dashboards" },
  { icon: ScrollText, label: "Audit Logs", path: "/dashboard/logs" },
  { icon: Bell, label: "Alerts & Notifications", path: "/dashboard/notifications" },
  { icon: Mail, label: "Patient Campaigns", path: "/dashboard/campaigns" },
  { icon: GraduationCap, label: "Training Center", path: "/dashboard/training" },
  { icon: ShieldAlert, label: "PHI Monitor", path: "/dashboard/phi-monitor" },
  { icon: Code2, label: "API Portal", path: "/dashboard/api" },
  { icon: CreditCard, label: "Billing & Plans", path: "/dashboard/billing" },
  { icon: User, label: "Provider Profile", path: "/dashboard/profile" },
  { icon: Shield, label: "Admin", path: "/dashboard/admin" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const DashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

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
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-sidebar-border space-y-1">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors w-full"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors w-full"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
