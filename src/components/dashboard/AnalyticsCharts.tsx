import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const weeklyData = [
  { day: "Mon", calls: 120, success: 112, failed: 8 },
  { day: "Tue", calls: 145, success: 138, failed: 7 },
  { day: "Wed", calls: 132, success: 125, failed: 7 },
  { day: "Thu", calls: 168, success: 159, failed: 9 },
  { day: "Fri", calls: 155, success: 148, failed: 7 },
  { day: "Sat", calls: 78, success: 74, failed: 4 },
  { day: "Sun", calls: 49, success: 46, failed: 3 },
];

const monthlyTrend = [
  { month: "Sep", calls: 1840 },
  { month: "Oct", calls: 2120 },
  { month: "Nov", calls: 2580 },
  { month: "Dec", calls: 2890 },
  { month: "Jan", calls: 3410 },
  { month: "Feb", calls: 3780 },
];

const outcomeData = [
  { name: "Successful", value: 802, color: "hsl(217, 100%, 59%)" },
  { name: "Voicemail", value: 89, color: "hsl(190, 95%, 50%)" },
  { name: "No Answer", value: 42, color: "hsl(220, 12%, 30%)" },
  { name: "Failed", value: 14, color: "hsl(0, 72%, 51%)" },
];

const customTooltipStyle = {
  backgroundColor: "hsl(220, 18%, 10%)",
  border: "1px solid hsl(220, 15%, 16%)",
  borderRadius: "8px",
  color: "hsl(220, 10%, 93%)",
  fontSize: "12px",
};

const CallVolumeChart = () => (
  <div className="bg-card rounded-xl border border-border p-6">
    <h3 className="font-display text-sm font-semibold text-foreground mb-1">
      Call Volume This Week
    </h3>
    <p className="text-xs text-muted-foreground mb-4">
      Daily breakdown of AI agent calls
    </p>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={weeklyData} barGap={4}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(220, 15%, 16%)"
          vertical={false}
        />
        <XAxis
          dataKey="day"
          tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={customTooltipStyle} cursor={{ fill: "hsl(220, 15%, 12%)" }} />
        <Bar dataKey="success" fill="hsl(217, 100%, 59%)" radius={[4, 4, 0, 0]} name="Successful" />
        <Bar dataKey="failed" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Failed" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const TrendChart = () => (
  <div className="bg-card rounded-xl border border-border p-6">
    <h3 className="font-display text-sm font-semibold text-foreground mb-1">
      Monthly Growth
    </h3>
    <p className="text-xs text-muted-foreground mb-4">
      Total interactions over time
    </p>
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={monthlyTrend}>
        <defs>
          <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(217, 100%, 59%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(217, 100%, 59%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(220, 15%, 16%)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip contentStyle={customTooltipStyle} />
        <Area
          type="monotone"
          dataKey="calls"
          stroke="hsl(217, 100%, 59%)"
          strokeWidth={2}
          fill="url(#colorCalls)"
          name="Total Calls"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const OutcomeChart = () => (
  <div className="bg-card rounded-xl border border-border p-6">
    <h3 className="font-display text-sm font-semibold text-foreground mb-1">
      Call Outcomes
    </h3>
    <p className="text-xs text-muted-foreground mb-4">
      Success & failure breakdown
    </p>
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={outcomeData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={65}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {outcomeData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2.5">
        {outcomeData.map((item) => (
          <div key={item.name} className="flex items-center gap-2.5">
            <div
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">{item.name}</span>
            <span className="text-xs font-semibold text-foreground ml-auto">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CallHistoryTable = () => {
  const history = [
    { patient: "M. Johnson", agent: "Patient Follow-Up", time: "10:32 AM", duration: "2:14", status: "success" },
    { patient: "S. Williams", agent: "Appointment Scheduler", time: "10:18 AM", duration: "1:47", status: "success" },
    { patient: "J. Martinez", agent: "No-Show Recovery", time: "10:05 AM", duration: "0:42", status: "voicemail" },
    { patient: "K. Brown", agent: "Insurance Verifier", time: "9:51 AM", duration: "3:08", status: "success" },
    { patient: "L. Davis", agent: "Patient Follow-Up", time: "9:38 AM", duration: "0:00", status: "failed" },
    { patient: "R. Taylor", agent: "Referral Generator", time: "9:22 AM", duration: "1:55", status: "success" },
  ];

  const statusStyles: Record<string, string> = {
    success: "bg-primary/10 text-primary",
    voicemail: "bg-accent/10 text-accent",
    failed: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-display text-sm font-semibold text-foreground mb-4">
        Recent Call History
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 text-xs font-medium text-muted-foreground">Patient</th>
              <th className="text-left py-2.5 text-xs font-medium text-muted-foreground">Agent</th>
              <th className="text-left py-2.5 text-xs font-medium text-muted-foreground">Time</th>
              <th className="text-left py-2.5 text-xs font-medium text-muted-foreground">Duration</th>
              <th className="text-left py-2.5 text-xs font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0">
                <td className="py-3 text-foreground font-medium">{row.patient}</td>
                <td className="py-3 text-muted-foreground">{row.agent}</td>
                <td className="py-3 text-muted-foreground">{row.time}</td>
                <td className="py-3 text-muted-foreground">{row.duration}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[row.status]}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { CallVolumeChart, TrendChart, OutcomeChart, CallHistoryTable };
