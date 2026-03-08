import { useState, useEffect } from "react";
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
  Network,
  ShieldAlert,
  DollarSign,
  User,
  Loader2,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// ── Icon map ──────────────────────────────────────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
  BookOpen, Rocket, Mic, BarChart, Shield, MessageSquare, CheckCircle, Clock,
  GraduationCap, Bot, Zap, Users, Settings, Plug, ListTodo, ScrollText,
  ChevronRight, GitBranch, MessageCircle, BarChart3, Terminal, CreditCard,
  Heart, Code2, Search, Trophy, Star, Target, Network, ShieldAlert, DollarSign,
  User, RefreshCw,
};

function resolveIcon(name: string): React.ElementType {
  return iconMap[name] ?? BookOpen;
}

// ── Difficulty styling ────────────────────────────────────────────────────────
const difficultyColor: Record<string, string> = {
  beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  intermediate: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  advanced: "bg-violet-500/15 text-violet-400 border-violet-500/30",
};

const difficultyLabel: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string | null;
  duration_minutes: number | null;
  icon: string | null;
  order_index: number | null;
  is_published: boolean | null;
}

interface UserProgress {
  module_id: string;
  status: string | null;
  progress_percent: number | null;
  started_at: string | null;
  completed_at: string | null;
}

const TrainingCenter = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeDifficulty, setActiveDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Load modules + user progress
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: mods } = await supabase
        .from("training_modules")
        .select("*")
        .eq("is_published", true)
        .order("order_index");

      setModules(mods ?? []);

      if (user) {
        const { data: prog } = await supabase
          .from("user_training_progress")
          .select("*")
          .eq("user_id", user.id);

        const map: Record<string, UserProgress> = {};
        (prog ?? []).forEach((p: UserProgress) => {
          map[p.module_id] = p;
        });
        setProgress(map);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  // Mark module as started / completed
  const markProgress = async (moduleId: string, newStatus: "in_progress" | "completed") => {
    if (!user) return;
    setUpdatingId(moduleId);

    const existing = progress[moduleId];
    const now = new Date().toISOString();

    if (existing) {
      await supabase
        .from("user_training_progress")
        .update({
          status: newStatus,
          progress_percent: newStatus === "completed" ? 100 : 50,
          started_at: existing.started_at ?? now,
          completed_at: newStatus === "completed" ? now : null,
        })
        .eq("module_id", moduleId)
        .eq("user_id", user.id);
    } else {
      await supabase.from("user_training_progress").insert({
        user_id: user.id,
        module_id: moduleId,
        status: newStatus,
        progress_percent: newStatus === "completed" ? 100 : 50,
        started_at: now,
        completed_at: newStatus === "completed" ? now : null,
      });
    }

    setProgress((prev) => ({
      ...prev,
      [moduleId]: {
        module_id: moduleId,
        status: newStatus,
        progress_percent: newStatus === "completed" ? 100 : 50,
        started_at: existing?.started_at ?? now,
        completed_at: newStatus === "completed" ? now : null,
      },
    }));

    if (newStatus === "completed") {
      toast({ title: "Module Completed! 🎓", description: `Great work finishing this module.` });
    } else {
      toast({ title: "Training Started", description: "Module marked as in progress." });
    }
    setUpdatingId(null);
  };

  // Derived
  const categories = ["All", ...Array.from(new Set(modules.map((m) => m.category)))];

  const filtered = modules.filter((m) => {
    const matchesCat = activeCategory === "All" || m.category === activeCategory;
    const matchesDiff = activeDifficulty === "all" || m.difficulty === activeDifficulty;
    const matchesSearch =
      searchQuery === "" ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesDiff && matchesSearch;
  });

  const completedCount = Object.values(progress).filter((p) => p.status === "completed").length;
  const inProgressCount = Object.values(progress).filter((p) => p.status === "in_progress").length;
  const totalModules = modules.length;
  const overallPct = totalModules ? Math.round((completedCount / totalModules) * 100) : 0;

  const beginnerCount = modules.filter((m) => m.difficulty === "beginner").length;
  const intermediateCount = modules.filter((m) => m.difficulty === "intermediate").length;
  const advancedCount = modules.filter((m) => m.difficulty === "advanced").length;
  const beginnerDone = modules.filter((m) => m.difficulty === "beginner" && progress[m.id]?.status === "completed").length;
  const intermediateDone = modules.filter((m) => m.difficulty === "intermediate" && progress[m.id]?.status === "completed").length;
  const advancedDone = modules.filter((m) => m.difficulty === "advanced" && progress[m.id]?.status === "completed").length;

  return (
    <DashboardLayout>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
              <GraduationCap className="h-7 w-7 text-primary" /> {t("training.title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("training.subtitle")}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground font-medium">{t("training.tutorialsCompleted")}</p>
                    <Trophy className="h-4 w-4 text-amber-400" />
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">{completedCount} / {totalModules}</p>
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
                    <Progress value={overallPct} className="h-2.5" />
                    <p className="text-xs text-muted-foreground mt-1.5">{overallPct}% complete</p>
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
                      <span className="text-muted-foreground">{beginnerDone}/{beginnerCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-400">Intermediate</span>
                      <span className="text-muted-foreground">{intermediateDone}/{intermediateCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-violet-400">Advanced</span>
                      <span className="text-muted-foreground">{advancedDone}/{advancedCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search modules..."
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

              {/* Results */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-muted-foreground">
                  Showing {filtered.length} of {modules.length} modules
                </p>
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-xs text-primary hover:text-primary/80">
                    Clear search
                  </button>
                )}
              </div>

              {/* Module list */}
              {filtered.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No modules found</p>
                  <p className="text-xs mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((mod, index) => {
                    const Icon = resolveIcon(mod.icon ?? "BookOpen");
                    const prog = progress[mod.id];
                    const status = prog?.status ?? "not_started";
                    const pct = prog?.progress_percent ?? 0;
                    const isCompleted = status === "completed";
                    const isInProgress = status === "in_progress";
                    const isExpanded = expandedModule === mod.id;

                    return (
                      <div key={mod.id}>
                        <button
                          onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                          className={`w-full text-left bg-card rounded-xl border p-5 flex items-center gap-4 transition-all ${
                            isCompleted
                              ? "border-green-500/20 bg-green-500/[0.03]"
                              : isExpanded
                              ? "border-primary/30 bg-primary/[0.03]"
                              : "border-border hover:border-primary/20"
                          }`}
                        >
                          {/* Number */}
                          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-secondary text-muted-foreground font-display font-bold text-sm shrink-0">
                            {(mod.order_index ?? index + 1)}
                          </div>
                          {/* Icon */}
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                            isCompleted ? "bg-green-500/20" : isInProgress ? "bg-primary/10" : "bg-muted"
                          }`}>
                            <Icon className={`h-5 w-5 ${isCompleted ? "text-green-400" : isInProgress ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display font-semibold text-foreground text-sm">{mod.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{mod.description}</p>
                            {isInProgress && (
                              <div className="mt-2 h-1.5 bg-muted rounded-full w-full max-w-xs">
                                <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                            )}
                          </div>
                          {/* Meta */}
                          <div className="flex items-center gap-3 shrink-0">
                            {mod.difficulty && (
                              <Badge variant="outline" className={`text-[10px] border ${difficultyColor[mod.difficulty]} hidden sm:flex`}>
                                {difficultyLabel[mod.difficulty]}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {mod.duration_minutes}m
                            </span>
                            {isCompleted ? (
                              <span className="flex items-center gap-1 text-xs font-medium text-green-400">
                                <CheckCircle className="h-4 w-4" /> Done
                              </span>
                            ) : isInProgress ? (
                              <span className="text-xs text-primary font-medium">{pct}%</span>
                            ) : null}
                            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                          </div>
                        </button>

                        {/* Expanded panel */}
                        {isExpanded && (
                          <div className="ml-[60px] mr-4 mt-2 mb-4 p-5 rounded-xl bg-card border border-border">
                            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{mod.description}</p>
                            <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {mod.duration_minutes} minutes
                              </span>
                              {mod.difficulty && (
                                <Badge variant="outline" className={`text-[10px] border ${difficultyColor[mod.difficulty]}`}>
                                  {difficultyLabel[mod.difficulty]}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground">
                                {mod.category}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              {!isCompleted && (
                                <Button
                                  size="sm"
                                  className="gradient-primary text-primary-foreground shadow-glow-sm hover:opacity-90 text-xs"
                                  disabled={updatingId === mod.id}
                                  onClick={() => markProgress(mod.id, isInProgress ? "completed" : "in_progress")}
                                >
                                  {updatingId === mod.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : isInProgress ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <BookOpen className="h-3 w-3 mr-1" />
                                  )}
                                  {isInProgress ? "Mark as Completed" : "Start Module"}
                                </Button>
                              )}
                              {isCompleted && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-white/10 text-xs"
                                  disabled={updatingId === mod.id}
                                  onClick={() => markProgress(mod.id, "in_progress")}
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" /> Review Again
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};

export default TrainingCenter;
