import { useState } from "react";
import {
  Bot,
  Phone,
  CalendarCheck,
  FileText,
  Shield,
  MessageSquare,
  Play,
  Pause,
  Settings,
  Plus,
  Zap,
  TrendingUp,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: typeof Bot;
  category: string;
  active: boolean;
  calls: number;
  successRate: number;
}

const defaultAgents: Agent[] = [
  {
    id: "1",
    name: "Patient Follow-Up",
    description: "Automated post-visit follow-up calls to check on patient recovery and satisfaction.",
    icon: Phone,
    category: "Outreach",
    active: true,
    calls: 342,
    successRate: 94,
  },
  {
    id: "2",
    name: "Appointment Scheduler",
    description: "AI-powered scheduling that handles bookings, rescheduling, and waitlist management.",
    icon: CalendarCheck,
    category: "Scheduling",
    active: true,
    calls: 518,
    successRate: 97,
  },
  {
    id: "3",
    name: "Insurance Verifier",
    description: "Automatically verifies patient insurance eligibility and pre-authorizations.",
    icon: Shield,
    category: "Admin",
    active: false,
    calls: 156,
    successRate: 89,
  },
  {
    id: "4",
    name: "Referral Generator",
    description: "Drafts and sends referral letters with relevant patient history and documentation.",
    icon: FileText,
    category: "Documents",
    active: true,
    calls: 89,
    successRate: 96,
  },
  {
    id: "5",
    name: "No-Show Recovery",
    description: "Re-engages patients who missed appointments with personalized outreach.",
    icon: MessageSquare,
    category: "Outreach",
    active: false,
    calls: 203,
    successRate: 72,
  },
  {
    id: "6",
    name: "New Patient Intake",
    description: "Guides new patients through paperwork, insurance, and pre-visit questionnaires.",
    icon: Bot,
    category: "Onboarding",
    active: true,
    calls: 127,
    successRate: 91,
  },
];

const Agents = () => {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);

  const toggleAgent = (id: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const activeCount = agents.filter((a) => a.active).length;
  const totalCalls = agents.reduce((sum, a) => sum + a.calls, 0);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                AI Agents
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Configure and launch your medical AI assistants
              </p>
            </div>
            <Button className="gradient-primary text-primary-foreground rounded-xl shadow-glow hover:opacity-90 gap-2">
              <Plus className="h-4 w-4" />
              Create Agent
            </Button>
          </div>

          {/* Summary stats */}
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-foreground">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active Agents</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-foreground">{totalCalls.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Interactions</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-foreground">92%</p>
                <p className="text-xs text-muted-foreground">Avg. Success Rate</p>
              </div>
            </div>
          </div>

          {/* Agents Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`group rounded-xl border p-6 transition-all duration-300 ${
                  agent.active
                    ? "border-primary/20 bg-primary/[0.03]"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      agent.active ? "gradient-primary" : "bg-muted"
                    }`}>
                      <agent.icon className={`h-5 w-5 ${agent.active ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground text-sm">{agent.name}</h3>
                      <span className="text-xs text-muted-foreground">{agent.category}</span>
                    </div>
                  </div>
                  <Switch
                    checked={agent.active}
                    onCheckedChange={() => toggleAgent(agent.id)}
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  {agent.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      {agent.calls} calls
                    </span>
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3" />
                      {agent.successRate}% success
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${agent.active ? "text-primary hover:text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      onClick={() => toggleAgent(agent.id)}
                    >
                      {agent.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Agents;
