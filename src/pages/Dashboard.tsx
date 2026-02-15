import {
  Phone,
  CalendarCheck,
  Users,
  Bot,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  HeartPulse,
  FileText,
  Shield,
  TrendingUp,
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
  { label: "Patient Calls This Week", value: "847", change: "+12%", up: true, icon: Phone },
  { label: "Appointments Booked", value: "234", change: "+8%", up: true, icon: CalendarCheck },
  { label: "Patient Contacts", value: "3,412", change: "+156", up: true, icon: Users },
];

const healthMetrics = [
  { label: "No-Show Rate", value: "8.2%", change: "-3.1%", up: false, icon: TrendingUp, description: "Down from 11.3% last month" },
  { label: "Follow-Up Completion", value: "94%", change: "+6%", up: true, icon: HeartPulse, description: "Post-visit follow-up rate" },
  { label: "Insurance Pre-Auth", value: "156", change: "+22", up: true, icon: Shield, description: "Verifications completed this week" },
  { label: "Documents Generated", value: "89", change: "+15", up: true, icon: FileText, description: "Referrals, notes, and letters" },
];

const recentActivity = [
  { action: "AI agent completed post-surgery follow-up with patient R. Thompson", time: "2 min ago" },
  { action: "Appointment booked for J. Martinez — Cardiology consult, Dr. Patel", time: "8 min ago" },
  { action: "Insurance pre-authorization approved for MRI — K. Williams", time: "15 min ago" },
  { action: "No-show recovery: S. Johnson rebooked for Thursday 2:30 PM", time: "22 min ago" },
  { action: "Referral letter generated and sent to Metro Orthopedics for L. Davis", time: "38 min ago" },
  { action: "Prescription refill reminder sent to 12 patients — next-day pickup", time: "1 hr ago" },
  { action: "Lab results notification sent to A. Chen — all values normal", time: "1.5 hrs ago" },
  { action: "Post-op check-in completed: M. Brown reports good recovery", time: "2 hrs ago" },
];

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Practice Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what your AI team has been up to today. All data is HIPAA compliant and PHI protected.
            </p>
          </div>

          {/* Primary Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

          {/* Healthcare-Specific Metrics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {healthMetrics.map((metric) => (
              <div key={metric.label} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <metric.icon className="h-4 w-4 text-accent" />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold ml-auto ${metric.up ? "text-primary" : "text-primary"}`}>
                    {metric.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {metric.change}
                  </span>
                </div>
                <p className="font-display text-xl font-bold text-foreground">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{metric.label}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">{metric.description}</p>
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
