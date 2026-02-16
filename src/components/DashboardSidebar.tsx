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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Bot, label: "AI Agents", path: "/dashboard/agents" },
  { icon: Zap, label: "Skills Center", path: "/dashboard/skills" },
  { icon: Plug, label: "Integrations", path: "/dashboard/integrations" },
  { icon: Building2, label: "Company Profile", path: "/dashboard/company" },
  { icon: UserPlus, label: "Team", path: "/dashboard/team" },
  { icon: Link2, label: "Collaboration", path: "/dashboard/collaboration" },
  { icon: MessageSquare, label: "Communication", path: "/dashboard/communication" },
  { icon: ListTodo, label: "Task Tracker", path: "/dashboard/tasks" },
  { icon: ScrollText, label: "Data Logs", path: "/dashboard/logs" },
  { icon: GraduationCap, label: "Training", path: "/dashboard/training" },
  { icon: User, label: "Profile", path: "/dashboard/profile" },
  { icon: ShieldAlert, label: "PHI Monitor", path: "/dashboard/phi-monitor" },
  { icon: Mail, label: "Campaigns", path: "/dashboard/campaigns" },
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

      <nav className="flex-1 py-4 space-y-1 px-2">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
