import { useState } from "react";
import { useTranslation } from "react-i18next";
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

const TrainingCenter = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const tutorials: Tutorial[] = [
    {
      id: "getting-started",
      title: t("training.tutorialGettingStartedTitle"),
      description: t("training.tutorialGettingStartedDesc"),
      category: t("training.categoryBasics"),
      duration: t("training.duration10min"),
      difficulty: "beginner",
      icon: Rocket,
      steps: [
        t("training.tutorialGettingStartedStep1"),
        t("training.tutorialGettingStartedStep2"),
        t("training.tutorialGettingStartedStep3"),
        t("training.tutorialGettingStartedStep4"),
      ],
    },
    {
      id: "create-first-agent",
      title: t("training.tutorialCreateAgentTitle"),
      description: t("training.tutorialCreateAgentDesc"),
      category: t("training.categoryAgents"),
      duration: t("training.duration15min"),
      difficulty: "beginner",
      icon: Bot,
      steps: [
        t("training.tutorialCreateAgentStep1"),
        t("training.tutorialCreateAgentStep2"),
        t("training.tutorialCreateAgentStep3"),
        t("training.tutorialCreateAgentStep4"),
        t("training.tutorialCreateAgentStep5"),
      ],
    },
    {
      id: "deploy-templates",
      title: t("training.tutorialDeployTemplatesTitle"),
      description: t("training.tutorialDeployTemplatesDesc"),
      category: t("training.categoryAgents"),
      duration: t("training.duration8min"),
      difficulty: "beginner",
      icon: Zap,
      steps: [
        t("training.tutorialDeployTemplatesStep1"),
        t("training.tutorialDeployTemplatesStep2"),
        t("training.tutorialDeployTemplatesStep3"),
        t("training.tutorialDeployTemplatesStep4"),
        t("training.tutorialDeployTemplatesStep5"),
      ],
    },
    {
      id: "connect-integrations",
      title: t("training.tutorialIntegrationsTitle"),
      description: t("training.tutorialIntegrationsDesc"),
      category: t("training.categoryIntegrations"),
      duration: t("training.duration12min"),
      difficulty: "intermediate",
      icon: Plug,
      steps: [
        t("training.tutorialIntegrationsStep1"),
        t("training.tutorialIntegrationsStep2"),
        t("training.tutorialIntegrationsStep3"),
        t("training.tutorialIntegrationsStep4"),
        t("training.tutorialIntegrationsStep5"),
      ],
    },
    {
      id: "agent-settings",
      title: t("training.tutorialAgentSettingsTitle"),
      description: t("training.tutorialAgentSettingsDesc"),
      category: t("training.categoryAgents"),
      duration: t("training.duration10min"),
      difficulty: "intermediate",
      icon: Settings,
      steps: [
        t("training.tutorialAgentSettingsStep1"),
        t("training.tutorialAgentSettingsStep2"),
        t("training.tutorialAgentSettingsStep3"),
        t("training.tutorialAgentSettingsStep4"),
        t("training.tutorialAgentSettingsStep5"),
        t("training.tutorialAgentSettingsStep6"),
        t("training.tutorialAgentSettingsStep7"),
      ],
    },
    {
      id: "communication-center",
      title: t("training.tutorialCommunicationTitle"),
      description: t("training.tutorialCommunicationDesc"),
      category: t("training.categoryCommunication"),
      duration: t("training.duration12min"),
      difficulty: "intermediate",
      icon: MessageSquare,
      steps: [
        t("training.tutorialCommunicationStep1"),
        t("training.tutorialCommunicationStep2"),
        t("training.tutorialCommunicationStep3"),
        t("training.tutorialCommunicationStep4"),
        t("training.tutorialCommunicationStep5"),
      ],
    },
    {
      id: "task-tracker",
      title: t("training.tutorialTaskTrackerTitle"),
      description: t("training.tutorialTaskTrackerDesc"),
      category: t("training.categoryOperations"),
      duration: t("training.duration10min"),
      difficulty: "intermediate",
      icon: ListTodo,
      steps: [
        t("training.tutorialTaskTrackerStep1"),
        t("training.tutorialTaskTrackerStep2"),
        t("training.tutorialTaskTrackerStep3"),
        t("training.tutorialTaskTrackerStep4"),
        t("training.tutorialTaskTrackerStep5"),
      ],
    },
    {
      id: "data-logs",
      title: t("training.tutorialDataLogsTitle"),
      description: t("training.tutorialDataLogsDesc"),
      category: t("training.categorySecurity"),
      duration: t("training.duration8min"),
      difficulty: "intermediate",
      icon: ScrollText,
      steps: [
        t("training.tutorialDataLogsStep1"),
        t("training.tutorialDataLogsStep2"),
        t("training.tutorialDataLogsStep3"),
        t("training.tutorialDataLogsStep4"),
        t("training.tutorialDataLogsStep5"),
      ],
    },
    {
      id: "team-management",
      title: t("training.tutorialTeamTitle"),
      description: t("training.tutorialTeamDesc"),
      category: t("training.categoryAdmin"),
      duration: t("training.duration10min"),
      difficulty: "intermediate",
      icon: Users,
      steps: [
        t("training.tutorialTeamStep1"),
        t("training.tutorialTeamStep2"),
        t("training.tutorialTeamStep3"),
        t("training.tutorialTeamStep4"),
        t("training.tutorialTeamStep5"),
      ],
    },
    {
      id: "phi-security",
      title: t("training.tutorialPhiTitle"),
      description: t("training.tutorialPhiDesc"),
      category: t("training.categorySecurity"),
      duration: t("training.duration15min"),
      difficulty: "advanced",
      icon: Shield,
      steps: [
        t("training.tutorialPhiStep1"),
        t("training.tutorialPhiStep2"),
        t("training.tutorialPhiStep3"),
        t("training.tutorialPhiStep4"),
        t("training.tutorialPhiStep5"),
        t("training.tutorialPhiStep6"),
        t("training.tutorialPhiStep7"),
      ],
    },
    {
      id: "voice-verification",
      title: t("training.tutorialVoiceTitle"),
      description: t("training.tutorialVoiceDesc"),
      category: t("training.categoryAdvanced"),
      duration: t("training.duration12min"),
      difficulty: "advanced",
      icon: Mic,
      steps: [
        t("training.tutorialVoiceStep1"),
        t("training.tutorialVoiceStep2"),
        t("training.tutorialVoiceStep3"),
        t("training.tutorialVoiceStep4"),
        t("training.tutorialVoiceStep5"),
      ],
    },
    {
      id: "hr-agent",
      title: t("training.tutorialHrTitle"),
      description: t("training.tutorialHrDesc"),
      category: t("training.categoryHr"),
      duration: t("training.duration15min"),
      difficulty: "advanced",
      icon: BarChart,
      steps: [
        t("training.tutorialHrStep1"),
        t("training.tutorialHrStep2"),
        t("training.tutorialHrStep3"),
        t("training.tutorialHrStep4"),
        t("training.tutorialHrStep5"),
        t("training.tutorialHrStep6"),
      ],
    },
  ];

  const [activeCategory, setActiveCategory] = useState(t("training.categoryAll"));
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({});

  const categories = [t("training.categoryAll"), ...new Set(tutorials.map((tut) => tut.category))];
  const filtered = activeCategory === t("training.categoryAll") ? tutorials : tutorials.filter((tut) => tut.category === activeCategory);

  const toggleStep = (tutorialId: string, stepIndex: number) => {
    setCompletedSteps((prev) => {
      const steps = new Set(prev[tutorialId] || []);
      if (steps.has(stepIndex)) {
        steps.delete(stepIndex);
      } else {
        steps.add(stepIndex);
      }
      const tutorial = tutorials.find((tut) => tut.id === tutorialId);
      if (tutorial && steps.size === tutorial.steps.length) {
        setCompletedTutorials((p) => new Set([...p, tutorialId]));
        toast({ title: t("training.toastTutorialCompleteTitle"), description: t("training.toastTutorialCompleteDesc", { title: tutorial.title }) });
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
              <GraduationCap className="h-7 w-7 text-primary" /> {t("training.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("training.subtitle")}
            </p>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground">{t("training.tutorialsCompleted")}</p>
              <p className="font-display text-2xl font-bold text-foreground mt-1">{completedCount} / {tutorials.length}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground">{t("training.inProgress")}</p>
              <p className="font-display text-2xl font-bold text-foreground mt-1">{inProgressCount}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground">{t("training.overallProgress")}</p>
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
                          <CheckCircle className="h-4 w-4" /> {t("training.done")}
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
