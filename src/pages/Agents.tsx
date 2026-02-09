import { useState } from "react";
import AgentConfigModal from "@/components/AgentConfigModal";
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
  Rocket,
  Users,
  Stethoscope,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: typeof Bot;
  category: string;
  active: boolean;
  calls: number;
  successRate: number;
  skills: string[];
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
    skills: ["Empathetic Listening", "HIPAA Compliance"],
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
    skills: ["Smart Scheduling", "Multi-Language"],
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
    skills: ["Insurance Verification"],
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
    skills: ["Clinical Documentation", "Referral Management"],
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
    skills: ["Patient Re-engagement"],
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
    skills: ["Patient Onboarding", "HIPAA Compliance"],
  },
];

interface QuickStartTemplate {
  name: string;
  description: string;
  icon: typeof Bot;
  skills: string[];
  category: string;
}

const quickStartTemplates: QuickStartTemplate[] = [
  {
    name: "Front Desk Agent",
    description: "Handles calls, scheduling, and basic patient inquiries.",
    icon: Phone,
    skills: ["Smart Scheduling", "Empathetic Listening", "Multi-Language"],
    category: "Receptionist",
  },
  {
    name: "Clinical Coordinator",
    description: "Manages referrals, documentation, and care coordination.",
    icon: Stethoscope,
    skills: ["Clinical Documentation", "Referral Management", "HIPAA Compliance"],
    category: "Clinical",
  },
  {
    name: "Patient Outreach",
    description: "Follow-ups, no-show recovery, and satisfaction surveys.",
    icon: Users,
    skills: ["Empathetic Listening", "Patient Re-engagement", "No-Show Recovery"],
    category: "Marketing",
  },
  {
    name: "Admin Assistant",
    description: "Insurance verification, billing support, and data entry.",
    icon: Shield,
    skills: ["Insurance Verification", "Data Entry", "Compliance Monitoring"],
    category: "Admin",
  },
];

const Agents = () => {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [configAgent, setConfigAgent] = useState<Agent | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const { toast } = useToast();

  const toggleAgent = (id: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const createFromTemplate = (template: QuickStartTemplate) => {
    const newAgent: Agent = {
      id: String(agents.length + 1),
      name: template.name,
      description: template.description,
      icon: template.icon,
      category: template.category,
      active: true,
      calls: 0,
      successRate: 0,
      skills: template.skills,
    };
    setAgents((prev) => [...prev, newAgent]);
    setShowTemplates(false);
    toast({
      title: "Agent created! 🚀",
      description: `${template.name} is live with ${template.skills.length} skills installed.`,
    });
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
                Deploy, configure, and manage your healthcare AI agents
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded-xl gap-2"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                <Rocket className="h-4 w-4" />
                Quick Start
              </Button>
              <Button className="gradient-primary text-primary-foreground rounded-xl shadow-glow hover:opacity-90 gap-2">
                <Plus className="h-4 w-4" />
                Custom Agent
              </Button>
            </div>
          </div>

          {/* Quick Start Templates */}
          {showTemplates && (
            <div className="mb-8 bg-primary/5 border border-primary/20 rounded-xl p-6">
              <h2 className="font-display text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <Rocket className="h-4 w-4 text-primary" /> Quick Start Templates
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Pre-configured agents with skills already installed. Deploy in one click.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {quickStartTemplates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => createFromTemplate(template)}
                    className="text-left bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all group"
                  >
                    <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center mb-3 group-hover:shadow-glow transition-shadow">
                      <template.icon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground text-sm">{template.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.skills.slice(0, 2).map((s) => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {s}
                        </span>
                      ))}
                      {template.skills.length > 2 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          +{template.skills.length - 2}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

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
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {agent.description}
                </p>

                {/* Installed skills */}
                {agent.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {agent.skills.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setConfigAgent(agent)}>
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

        {configAgent && (
          <AgentConfigModal
            agent={{ id: configAgent.id, name: configAgent.name, category: configAgent.category }}
            open={!!configAgent}
            onClose={() => setConfigAgent(null)}
          />
        )}
      </main>
    </div>
  );
};

export default Agents;
