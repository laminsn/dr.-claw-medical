import { useState } from "react";
import {
  BookOpen,
  Rocket,
  Mic,
  BarChart,
  Shield,
  MessageSquare,
  Play,
  CheckCircle,
  Clock,
  GraduationCap,
  Bot,
  Zap,
  Users,
  Settings,
  Plug,
  ListTodo,
  ScrollText,
  ChevronRight,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  icon: typeof BookOpen;
  steps: string[];
}

const difficultyColor: Record<string, string> = {
  beginner: "bg-green-500/15 text-green-400 border-green-500/30",
  intermediate: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  advanced: "bg-violet-500/15 text-violet-400 border-violet-500/30",
};

const tutorials: Tutorial[] = [
  {
    id: "getting-started",
    title: "Getting Started with Dr. Claw",
    description: "Learn the basics of the platform, navigate the dashboard, and understand the core concepts of AI agents.",
    category: "Basics",
    duration: "10 min",
    difficulty: "beginner",
    icon: Rocket,
    steps: [
      "Sign in and explore the dashboard overview",
      "Understand the sidebar navigation and key sections",
      "Review your account settings and company profile",
      "Learn about the pricing tiers and what's included",
    ],
  },
  {
    id: "create-first-agent",
    title: "Create Your First AI Agent",
    description: "Step-by-step guide to creating, naming, and configuring your first AI agent with skills and capabilities.",
    category: "Agents",
    duration: "15 min",
    difficulty: "beginner",
    icon: Bot,
    steps: [
      "Navigate to AI Agents and click 'Create Agent'",
      "Name your agent and select an AI model (OpenAI, Claude, etc.)",
      "Browse and assign skills from the Skills Center",
      "Configure capabilities: messaging, PHI protection, task creation",
      "Activate your agent and monitor it in the dashboard",
    ],
  },
  {
    id: "deploy-templates",
    title: "Deploy Quick-Start Templates",
    description: "Use pre-built agent templates like C-Suite bots, healthcare agents, and marketing assistants for instant deployment.",
    category: "Agents",
    duration: "8 min",
    difficulty: "beginner",
    icon: Zap,
    steps: [
      "Go to AI Agents > Quick-Start Templates tab",
      "Browse templates by category (healthcare, executive, marketing, etc.)",
      "Click Deploy on your chosen template",
      "Customize the agent name and AI model in the deploy dialog",
      "Your agent is live — find it in My Agents",
    ],
  },
  {
    id: "connect-integrations",
    title: "Connect Your Integrations",
    description: "Link your CRM, EHR, Google Workspace, messaging platforms, and other tools to empower your agents.",
    category: "Integrations",
    duration: "12 min",
    difficulty: "intermediate",
    icon: Plug,
    steps: [
      "Navigate to Integrations from the sidebar",
      "Browse categories: CRM, EHR, Google Workspace, Messaging, Voice",
      "Click Connect on your desired integration (e.g., GoHighLevel, Epic EHR)",
      "Enter your API key or OAuth credentials",
      "Verify the connection and assign it to relevant agents",
    ],
  },
  {
    id: "agent-settings",
    title: "Configure Agent Settings & Capabilities",
    description: "Master the agent settings dialog: edit names, models, skills, PHI protection, messaging, voice recognition, and more.",
    category: "Agents",
    duration: "10 min",
    difficulty: "intermediate",
    icon: Settings,
    steps: [
      "Click the gear icon on any agent card to open settings",
      "Edit the agent name and switch AI models",
      "Toggle capabilities: PHI Protection, Messaging, Voice Recognition",
      "Enable Distress Detection for patient-facing agents",
      "Enable Task Creation to let agents create and assign tasks autonomously",
      "Enable HR Assistant for payroll, clock-ins, and document handling",
      "Save changes and verify the capability badges on the agent card",
    ],
  },
  {
    id: "communication-center",
    title: "Monitor Agent Communications",
    description: "Use the Communication Center to observe all agent conversations in real time across SMS, email, voice, chat, and web.",
    category: "Communication",
    duration: "12 min",
    difficulty: "intermediate",
    icon: MessageSquare,
    steps: [
      "Open Communication from the sidebar",
      "Browse conversations in the left panel — filter by channel type",
      "Click a conversation to view the full message thread",
      "Review the right panel for contact details, tags, and agent info",
      "Use the compose bar to override agent responses when needed",
    ],
  },
  {
    id: "task-tracker",
    title: "Track & Manage Agent Tasks",
    description: "Use the Task Tracker to monitor all agent tasks with Kanban board and list views, progress tracking, and subtasks.",
    category: "Operations",
    duration: "10 min",
    difficulty: "intermediate",
    icon: ListTodo,
    steps: [
      "Open Task Tracker from the sidebar",
      "View summary stats: queued, in progress, completed, failed",
      "Switch between List view and Kanban Board view",
      "Expand any task to see subtasks, description, and timestamps",
      "Filter by status or search by keyword",
    ],
  },
  {
    id: "data-logs",
    title: "Review Data Logs & Audit Trail",
    description: "Access complete activity logs for all agents, API calls, integrations, and system events with expandable metadata.",
    category: "Security",
    duration: "8 min",
    difficulty: "intermediate",
    icon: ScrollText,
    steps: [
      "Open Data Logs from the sidebar",
      "Click level cards to filter by Info, Success, Warning, or Error",
      "Filter by category: Communication, Task, API, System, Auth, Integration",
      "Click any log entry to expand and view detailed metadata",
      "Use Export Logs to download audit records",
    ],
  },
  {
    id: "team-management",
    title: "Manage Your Team",
    description: "Invite team members, assign roles, and control access permissions across your organization.",
    category: "Admin",
    duration: "10 min",
    difficulty: "intermediate",
    icon: Users,
    steps: [
      "Navigate to Team from the sidebar",
      "Click Invite Member to add new team members by email",
      "Assign roles: Admin, Manager, or Member",
      "Configure which agents and integrations each member can access",
      "Review team activity in the Data Logs",
    ],
  },
  {
    id: "phi-security",
    title: "PHI Protection & HIPAA Compliance",
    description: "Understand how Dr. Claw enforces PHI protection, handles distress detection, and maintains HIPAA compliance.",
    category: "Security",
    duration: "15 min",
    difficulty: "advanced",
    icon: Shield,
    steps: [
      "Understand that PHI Protection is a hard-coded safety parameter on ALL agents",
      "Agents never discuss, transmit, or expose Protected Health Information",
      "When PHI is requested, agents redirect to authorized clinical staff",
      "Scheduling agents only confirm visit times — no clinical details disclosed",
      "Enable Distress Detection for patient-facing agents to identify and escalate",
      "Review PHI access logs in Data Logs > Auth category",
      "Ensure BAA is signed for HIPAA-covered entities (contact support)",
    ],
  },
  {
    id: "voice-verification",
    title: "Voice Recognition & Verification",
    description: "Set up voice biometrics for identity verification and configure voice-based agent interactions.",
    category: "Advanced",
    duration: "12 min",
    difficulty: "advanced",
    icon: Mic,
    steps: [
      "Open Agent Settings and enable Voice Recognition & Verification",
      "Connect a Voice AI integration (ElevenLabs, Deepgram, or VAPI)",
      "Configure voice identity enrollment for authorized users",
      "Test voice verification in a conversation",
      "Review voice auth events in Data Logs",
    ],
  },
  {
    id: "hr-agent",
    title: "Set Up an HR Assistant Agent",
    description: "Configure an agent to help staff with payroll inquiries, clock-ins, document handling, and training reminders.",
    category: "HR",
    duration: "15 min",
    difficulty: "advanced",
    icon: BarChart,
    steps: [
      "Create a new agent or use the COO template",
      "Assign HR-related skills: operations management, team coordination",
      "Enable the HR Assistant capability in agent settings",
      "Connect payroll and document integrations (Google Drive, Slack)",
      "Test common HR queries: payroll info, clock-in/out, PTO balance",
      "Enable Task Creation so the HR agent can assign training reminders",
    ],
  },
];

const TrainingCenter = () => {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("All");
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({});

  const categories = ["All", ...new Set(tutorials.map((t) => t.category))];
  const filtered = activeCategory === "All" ? tutorials : tutorials.filter((t) => t.category === activeCategory);

  const toggleStep = (tutorialId: string, stepIndex: number) => {
    setCompletedSteps((prev) => {
      const steps = new Set(prev[tutorialId] || []);
      if (steps.has(stepIndex)) {
        steps.delete(stepIndex);
      } else {
        steps.add(stepIndex);
      }
      const tutorial = tutorials.find((t) => t.id === tutorialId);
      if (tutorial && steps.size === tutorial.steps.length) {
        setCompletedTutorials((p) => new Set([...p, tutorialId]));
        toast({ title: "Tutorial Complete!", description: `${tutorial.title} marked as done.` });
      } else {
        setCompletedTutorials((p) => {
          const next = new Set(p);
          next.delete(tutorialId);
          return next;
        });
      }
      return { ...prev, [tutorialId]: steps };
    });
  };

  const completedCount = completedTutorials.size;
  const inProgressCount = Object.keys(completedSteps).filter(
    (id) => (completedSteps[id]?.size || 0) > 0 && !completedTutorials.has(id)
  ).length;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
              <GraduationCap className="h-7 w-7 text-primary" /> Clinical Training Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Step-by-step tutorials to master healthcare AI agent deployment with Dr. Claw
            </p>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground">Tutorials Completed</p>
              <p className="font-display text-2xl font-bold text-foreground mt-1">{completedCount} / {tutorials.length}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground">In Progress</p>
              <p className="font-display text-2xl font-bold text-foreground mt-1">{inProgressCount}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground">Overall Progress</p>
              <div className="mt-2">
                <div className="h-2 bg-muted rounded-full">
                  <div
                    className="h-full gradient-primary rounded-full transition-all"
                    style={{ width: `${tutorials.length ? (completedCount / tutorials.length) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {tutorials.length ? Math.round((completedCount / tutorials.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat
                    ? "gradient-primary text-primary-foreground shadow-glow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tutorials */}
          <div className="space-y-3">
            {filtered.map((tutorial, index) => {
              const Icon = tutorial.icon;
              const isCompleted = completedTutorials.has(tutorial.id);
              const stepsCompleted = completedSteps[tutorial.id]?.size || 0;
              const isExpanded = expandedTutorial === tutorial.id;
              const isInProgress = stepsCompleted > 0 && !isCompleted;

              return (
                <div key={tutorial.id}>
                  <button
                    onClick={() => setExpandedTutorial(isExpanded ? null : tutorial.id)}
                    className={`w-full text-left bg-card rounded-xl border p-5 flex items-center gap-5 transition-all ${
                      isCompleted
                        ? "border-green-500/20 bg-green-500/[0.03]"
                        : isExpanded
                        ? "border-primary/30 bg-primary/[0.03]"
                        : "border-border hover:border-primary/10"
                    }`}
                  >
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-secondary text-muted-foreground font-display font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isCompleted ? "bg-green-500/20" : "bg-muted"
                    }`}>
                      <Icon className={`h-5 w-5 ${isCompleted ? "text-green-400" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-foreground text-sm">{tutorial.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{tutorial.description}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="outline" className={`text-[10px] border ${difficultyColor[tutorial.difficulty]} hidden sm:flex`}>
                        {tutorial.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 hidden md:flex">
                        <Clock className="h-3 w-3" /> {tutorial.duration}
                      </span>
                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-400">
                          <CheckCircle className="h-4 w-4" /> Done
                        </span>
                      ) : isInProgress ? (
                        <span className="text-xs text-primary font-medium">{stepsCompleted}/{tutorial.steps.length}</span>
                      ) : null}
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="ml-[60px] mr-4 mt-2 mb-4 p-4 rounded-xl bg-card border border-border">
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{tutorial.description}</p>
                      <div className="space-y-2">
                        {tutorial.steps.map((step, i) => {
                          const stepDone = completedSteps[tutorial.id]?.has(i) || false;
                          return (
                            <button
                              key={i}
                              onClick={() => toggleStep(tutorial.id, i)}
                              className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all ${
                                stepDone ? "bg-green-500/5" : "hover:bg-white/[0.02]"
                              }`}
                            >
                              <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                stepDone ? "bg-green-500" : "border-2 border-muted-foreground/30"
                              }`}>
                                {stepDone && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                              </div>
                              <p className={`text-sm ${stepDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                {step}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrainingCenter;
