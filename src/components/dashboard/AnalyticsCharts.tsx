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
  { day: "Mon", tasks: 120, success: 112, failed: 8 },
  { day: "Tue", tasks: 145, success: 138, failed: 7 },
  { day: "Wed", tasks: 132, success: 125, failed: 7 },
  { day: "Thu", tasks: 168, success: 159, failed: 9 },
  { day: "Fri", tasks: 155, success: 148, failed: 7 },
  { day: "Sat", tasks: 78, success: 74, failed: 4 },
  { day: "Sun", tasks: 49, success: 46, failed: 3 },
];

const monthlyTrend = [
  { month: "Sep", tasks: 1840 },
  { month: "Oct", tasks: 2120 },
  { month: "Nov", tasks: 2580 },
  { month: "Dec", tasks: 2890 },
  { month: "Jan", tasks: 3410 },
  { month: "Feb", tasks: 3780 },
];

const outcomeData = [
  { name: "Completed", value: 802, color: "hsl(217, 100%, 59%)" },
  { name: "In Progress", value: 89, color: "hsl(190, 95%, 50%)" },
  { name: "Queued", value: 42, color: "hsl(220, 12%, 30%)" },
  { name: "Failed", value: 14, color: "hsl(0, 72%, 51%)" },
];

const customTooltipStyle = {
  backgroundColor: "hsl(220, 18%, 10%)",
  border: "1px solid hsl(220, 15%, 16%)",
  borderRadius: "8px",
  color: "hsl(220, 10%, 93%)",
  fontSize: "12px",
};

const TaskVolumeChart = () => (
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
      <Bar dataKey="success" fill="hsl(217, 100%, 59%)" radius={[4, 4, 0, 0]} name="Completed" />
      <Bar dataKey="failed" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Failed" />
    </BarChart>
  </ResponsiveContainer>
);

const TrendChart = () => (
  <ResponsiveContainer width="100%" height={220}>
    <AreaChart data={monthlyTrend}>
      <defs>
        <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
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
        dataKey="tasks"
        stroke="hsl(217, 100%, 59%)"
        strokeWidth={2}
        fill="url(#colorTasks)"
        name="Total Tasks"
      />
    </AreaChart>
  </ResponsiveContainer>
);

const OutcomeChart = () => (
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
);

const AgentTasksTable = () => {
  const history = [
    { task: "Generated Q1 blog content", agent: "Content Engine", time: "10:32 AM", duration: "2:14", status: "completed" },
    { task: "Scheduled 8 patient appointments", agent: "Front Desk Agent", time: "10:18 AM", duration: "1:47", status: "completed" },
    { task: "Recovered 3 no-show appointments", agent: "Patient Outreach", time: "10:05 AM", duration: "0:42", status: "in_progress" },
    { task: "Verified insurance for K. Brown", agent: "Insurance Verifier", time: "9:51 AM", duration: "3:08", status: "completed" },
    { task: "Drafted NIH R01 proposal narrative", agent: "Grant Writer", time: "9:38 AM", duration: "12:22", status: "completed" },
    { task: "Processed 12 referral letters", agent: "Clinical Coordinator", time: "9:22 AM", duration: "1:55", status: "completed" },
    { task: "Screened 8 engineering candidates", agent: "HR Coordinator", time: "9:10 AM", duration: "4:58", status: "completed" },
    { task: "Generated monthly P&L report", agent: "Financial Analyst", time: "8:55 AM", duration: "6:12", status: "completed" },
  ];

  const statusStyles: Record<string, string> = {
    completed: "bg-primary/10 text-primary",
    in_progress: "bg-accent/10 text-accent",
    failed: "bg-destructive/10 text-destructive",
  };

  const statusLabels: Record<string, string> = {
    completed: "Completed",
    in_progress: "In Progress",
    failed: "Failed",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2.5 text-xs font-medium text-muted-foreground">Task</th>
            <th className="text-left py-2.5 text-xs font-medium text-muted-foreground">Agent</th>
            <th className="text-left py-2.5 text-xs font-medium text-muted-foreground">Time</th>
            <th className="text-left py-2.5 text-xs font-medium text-muted-foreground">Duration</th>
            <th className="text-left py-2.5 text-xs font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map((row, i) => (
            <tr key={i} className="border-b border-border/50 last:border-0">
              <td className="py-3 text-foreground font-medium">{row.task}</td>
              <td className="py-3 text-muted-foreground">{row.agent}</td>
              <td className="py-3 text-muted-foreground">{row.time}</td>
              <td className="py-3 text-muted-foreground">{row.duration}</td>
              <td className="py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[row.status]}`}>
                  {statusLabels[row.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Keep old names as aliases for backwards compatibility
const CallVolumeChart = TaskVolumeChart;
const CallHistoryTable = AgentTasksTable;

export { CallVolumeChart, TaskVolumeChart, TrendChart, OutcomeChart, CallHistoryTable, AgentTasksTable };
