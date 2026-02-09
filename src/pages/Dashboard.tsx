import {
  Phone,
  CalendarCheck,
  Users,
  TrendingUp,
  Bot,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import {
  CallVolumeChart,
  TrendChart,
  OutcomeChart,
  CallHistoryTable,
} from "@/components/dashboard/AnalyticsCharts";

const stats = [
  { label: "Active AI Agents", value: "12", change: "+3", up: true, icon: Bot },
  { label: "Calls This Week", value: "847", change: "+12%", up: true, icon: Phone },
  { label: "Appointments Booked", value: "234", change: "+8%", up: true, icon: CalendarCheck },
  { label: "Patient Contacts", value: "3,412", change: "+156", up: true, icon: Users },
];

const recentActivity = [
  { action: "AI Agent completed patient follow-up call", time: "2 min ago" },
  { action: "New appointment booked via SMS automation", time: "15 min ago" },
  { action: "Insurance verification completed for J. Smith", time: "32 min ago" },
  { action: "Referral letter generated and sent", time: "1 hr ago" },
  { action: "No-show reminder sent to 8 patients", time: "2 hrs ago" },
];

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Welcome back, Doctor 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what your AI team has been up to today.
            </p>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold ${stat.up ? "text-primary" : "text-destructive"}`}>
                    {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </span>
                </div>
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Analytics Charts */}
          <div className="grid lg:grid-cols-3 gap-4 mb-8">
            <CallVolumeChart />
            <TrendChart />
            <OutcomeChart />
          </div>

          {/* Call History + Activity */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CallHistoryTable />
            </div>

            {/* Activity */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="font-display text-sm font-semibold text-foreground mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="h-2 w-2 rounded-full gradient-primary mt-2 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-foreground leading-relaxed">{item.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
