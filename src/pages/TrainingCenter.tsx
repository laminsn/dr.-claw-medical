import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Rocket,
  Mic,
  BarChart,
  Shield,
  MessageSquare,
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
  GitBranch,
  MessageCircle,
  BarChart3,
  Terminal,
  CreditCard,
  Heart,
  Code2,
  Search,
  Trophy,
  Star,
  Target,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

const difficultyLabel: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const TrainingCenter = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const tutorials: Tutorial[] = [
    // ── Beginner tutorials ──
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
      id: "playground",
      title: t("training.tutorialPlaygroundTitle"),
      description: t("training.tutorialPlaygroundDesc"),
      category: t("training.categoryAgents"),
      duration: t("training.duration8min"),
      difficulty: "beginner",
      icon: MessageCircle,
      steps: [
        t("training.tutorialPlaygroundStep1"),
        t("training.tutorialPlaygroundStep2"),
        t("training.tutorialPlaygroundStep3"),
        t("training.tutorialPlaygroundStep4"),
        t("training.tutorialPlaygroundStep5"),
      ],
    },
    // ── Intermediate tutorials ──
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
      id: "knowledge-base",
      title: t("training.tutorialKnowledgeBaseTitle"),
      description: t("training.tutorialKnowledgeBaseDesc"),
      category: t("training.categoryOperations"),
      duration: t("training.duration10min"),
      difficulty: "intermediate",
      icon: BookOpen,
      steps: [
        t("training.tutorialKnowledgeBaseStep1"),
        t("training.tutorialKnowledgeBaseStep2"),
        t("training.tutorialKnowledgeBaseStep3"),
        t("training.tutorialKnowledgeBaseStep4"),
        t("training.tutorialKnowledgeBaseStep5"),
      ],
    },
    {
      id: "workflows",
      title: t("training.tutorialWorkflowsTitle"),
      description: t("training.tutorialWorkflowsDesc"),
      category: t("training.categoryWorkflows"),
      duration: t("training.duration12min"),
      difficulty: "intermediate",
      icon: GitBranch,
      steps: [
        t("training.tutorialWorkflowsStep1"),
        t("training.tutorialWorkflowsStep2"),
        t("training.tutorialWorkflowsStep3"),
        t("training.tutorialWorkflowsStep4"),
        t("training.tutorialWorkflowsStep5"),
      ],
    },
    {
      id: "reports",
      title: t("training.tutorialReportsTitle"),
      description: t("training.tutorialReportsDesc"),
      category: t("training.categoryReporting"),
      duration: t("training.duration10min"),
      difficulty: "intermediate",
      icon: BarChart3,
      steps: [
        t("training.tutorialReportsStep1"),
        t("training.tutorialReportsStep2"),
        t("training.tutorialReportsStep3"),
        t("training.tutorialReportsStep4"),
        t("training.tutorialReportsStep5"),
      ],
    },
    {
      id: "patient-portal",
      title: t("training.tutorialPatientPortalTitle"),
      description: t("training.tutorialPatientPortalDesc"),
      category: t("training.categoryPatients"),
      duration: t("training.duration12min"),
      difficulty: "intermediate",
      icon: Heart,
      steps: [
        t("training.tutorialPatientPortalStep1"),
        t("training.tutorialPatientPortalStep2"),
        t("training.tutorialPatientPortalStep3"),
        t("training.tutorialPatientPortalStep4"),
        t("training.tutorialPatientPortalStep5"),
      ],
    },
    {
      id: "billing",
      title: t("training.tutorialBillingTitle"),
      description: t("training.tutorialBillingDesc"),
      category: t("training.categoryAdmin"),
      duration: t("training.duration8min"),
      difficulty: "intermediate",
      icon: CreditCard,
      steps: [
        t("training.tutorialBillingStep1"),
        t("training.tutorialBillingStep2"),
        t("training.tutorialBillingStep3"),
        t("training.tutorialBillingStep4"),
        t("training.tutorialBillingStep5"),
      ],
    },
    // ── Advanced tutorials ──
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
      id: "command-station",
      title: t("training.tutorialCommandStationTitle"),
      description: t("training.tutorialCommandStationDesc"),
      category: t("training.categoryOperations"),
      duration: t("training.duration12min"),
      difficulty: "advanced",
      icon: Terminal,
      steps: [
        t("training.tutorialCommandStationStep1"),
        t("training.tutorialCommandStationStep2"),
        t("training.tutorialCommandStationStep3"),
        t("training.tutorialCommandStationStep4"),
        t("training.tutorialCommandStationStep5"),
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
    {
      id: "api-portal",
      title: t("training.tutorialApiPortalTitle"),
      description: t("training.tutorialApiPortalDesc"),
      category: t("training.categoryAdvanced"),
      duration: t("training.duration15min"),
      difficulty: "advanced",
      icon: Code2,
      steps: [
        t("training.tutorialApiPortalStep1"),
        t("training.tutorialApiPortalStep2"),
        t("training.tutorialApiPortalStep3"),
        t("training.tutorialApiPortalStep4"),
        t("training.tutorialApiPortalStep5"),
      ],
    },
  ];

  const [activeCategory, setActiveCategory] = useState(t("training.categoryAll"));
  const [activeDifficulty, setActiveDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({});

  const categories = [t("training.categoryAll"), ...new Set(tutorials.map((tut) => tut.category))];

  const filtered = tutorials.filter((tut) => {
    const matchesCategory = activeCategory === t("training.categoryAll") || tut.category === activeCategory;
    const matchesDifficulty = activeDifficulty === "all" || tut.difficulty === activeDifficulty;
    const matchesSearch =
      searchQuery === "" ||
      tut.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tut.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

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

  const totalSteps = tutorials.reduce((acc, tut) => acc + tut.steps.length, 0);
  const completedStepCount = Object.values(completedSteps).reduce((acc, s) => acc + s.size, 0);

  const beginnerCount = tutorials.filter((t) => t.difficulty === "beginner").length;
  const intermediateCount = tutorials.filter((t) => t.difficulty === "intermediate").length;
  const advancedCount = tutorials.filter((t) => t.difficulty === "advanced").length;

  const beginnerCompleted = tutorials.filter((t) => t.difficulty === "beginner" && completedTutorials.has(t.id)).length;
  const intermediateCompleted = tutorials.filter((t) => t.difficulty === "intermediate" && completedTutorials.has(t.id)).length;
  const advancedCompleted = tutorials.filter((t) => t.difficulty === "advanced" && completedTutorials.has(t.id)).length;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
              <GraduationCap className="h-7 w-7 text-primary" /> {t("training.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("training.subtitle")}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">{t("training.tutorialsCompleted")}</p>
                <Trophy className="h-4 w-4 text-amber-400" />
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{completedCount} / {tutorials.length}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">{t("training.inProgress")}</p>
                <Target className="h-4 w-4 text-blue-400" />
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{inProgressCount}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">{t("training.overallProgress")}</p>
                <Star className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-1">
                <div className="h-2.5 bg-muted rounded-full">
                  <div
                    className="h-full gradient-primary rounded-full transition-all"
                    style={{ width: `${totalSteps ? (completedStepCount / totalSteps) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {completedStepCount} / {totalSteps} steps ({totalSteps ? Math.round((completedStepCount / totalSteps) * 100) : 0}%)
                </p>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">By Level</p>
                <GraduationCap className="h-4 w-4 text-violet-400" />
              </div>
              <div className="space-y-1.5 mt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-400">Beginner</span>
                  <span className="text-muted-foreground">{beginnerCompleted}/{beginnerCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-400">Intermediate</span>
                  <span className="text-muted-foreground">{intermediateCompleted}/{intermediateCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-violet-400">Advanced</span>
                  <span className="text-muted-foreground">{advancedCompleted}/{advancedCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Difficulty Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tutorials..."
                className="pl-9 bg-white/[0.03] border-white/10 focus:border-primary/50"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "beginner", "intermediate", "advanced"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setActiveDifficulty(level)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeDifficulty === level
                      ? level === "all"
                        ? "gradient-primary text-primary-foreground shadow-glow-sm"
                        : `${difficultyColor[level]} border`
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {level === "all" ? "All Levels" : difficultyLabel[level]}
                </button>
              ))}
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

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {tutorials.length} tutorials
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>

          {/* Tutorials */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No tutorials found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((tutorial, index) => {
                const Icon = tutorial.icon;
                const isCompleted = completedTutorials.has(tutorial.id);
                const stepsCompleted = completedSteps[tutorial.id]?.size || 0;
                const isExpanded = expandedTutorial === tutorial.id;
                const isInProgress = stepsCompleted > 0 && !isCompleted;
                const stepProgress = tutorial.steps.length ? (stepsCompleted / tutorial.steps.length) * 100 : 0;

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
                        {tutorials.indexOf(tutorial) + 1}
                      </div>
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isCompleted ? "bg-green-500/20" : "bg-muted"
                      }`}>
                        <Icon className={`h-5 w-5 ${isCompleted ? "text-green-400" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-foreground text-sm">{tutorial.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{tutorial.description}</p>
                        {isInProgress && (
                          <div className="mt-2 h-1.5 bg-muted rounded-full w-full max-w-xs">
                            <div
                              className="h-full gradient-primary rounded-full transition-all"
                              style={{ width: `${stepProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="outline" className={`text-[10px] border ${difficultyColor[tutorial.difficulty]} hidden sm:flex`}>
                          {difficultyLabel[tutorial.difficulty]}
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
                        <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {tutorial.duration}
                          </span>
                          <Badge variant="outline" className={`text-[10px] border ${difficultyColor[tutorial.difficulty]}`}>
                            {difficultyLabel[tutorial.difficulty]}
                          </Badge>
                          <span>{stepsCompleted} of {tutorial.steps.length} steps completed</span>
                        </div>
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
                                <div className="flex-1">
                                  <p className={`text-sm ${stepDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                    <span className="text-muted-foreground/50 mr-2 text-xs">Step {i + 1}.</span>
                                    {step}
                                  </p>
                                </div>
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
          )}
        </div>
      </main>
    </div>
  );
};

export default TrainingCenter;
