import { useState, useEffect } from "react";
import {
  BookOpen,
  Rocket,
  Mic,
  BarChart,
  Shield,
  GitBranch,
  Link,
  MessageSquare,
  Wrench,
  Play,
  CheckCircle,
  Clock,
  Loader2,
  GraduationCap,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, typeof BookOpen> = {
  BookOpen, Rocket, Mic, BarChart, Shield, GitBranch, Link, MessageSquare, Wrench,
};

const difficultyColor: Record<string, string> = {
  beginner: "bg-primary/20 text-primary",
  intermediate: "bg-accent/20 text-accent",
  advanced: "bg-destructive/20 text-destructive",
};

interface Module {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_minutes: number;
  difficulty: string;
  icon: string;
  order_index: number;
}

interface Progress {
  module_id: string;
  status: string;
  progress_percent: number;
}

const TrainingCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: modData } = await supabase
        .from("training_modules")
        .select("*")
        .eq("is_published", true)
        .order("order_index");

      if (modData) setModules(modData as any);

      if (user) {
        const { data: progData } = await supabase
          .from("user_training_progress")
          .select("module_id, status, progress_percent")
          .eq("user_id", user.id);

        if (progData) setProgress(progData as any);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const categories = ["All", ...new Set(modules.map((m) => m.category))];
  const filtered = activeCategory === "All" ? modules : modules.filter((m) => m.category === activeCategory);

  const getProgress = (moduleId: string) => progress.find((p) => p.module_id === moduleId);

  const startModule = async (moduleId: string) => {
    if (!user) return;
    setStarting(moduleId);

    const existing = getProgress(moduleId);
    const mod = modules.find((m) => m.id === moduleId);

    if (existing) {
      // Mark as completed
      await supabase
        .from("user_training_progress")
        .update({
          status: "completed",
          progress_percent: 100,
          completed_at: new Date().toISOString(),
        } as any)
        .eq("user_id", user.id)
        .eq("module_id", moduleId);

      setProgress((prev) =>
        prev.map((p) =>
          p.module_id === moduleId ? { ...p, status: "completed", progress_percent: 100 } : p
        )
      );
      toast({ title: "Module completed! 🎉", description: `${mod?.title} marked as complete.` });
    } else {
      // Start module
      await supabase.from("user_training_progress").insert({
        user_id: user.id,
        module_id: moduleId,
        status: "in_progress",
        progress_percent: 50,
        started_at: new Date().toISOString(),
      } as any);

      setProgress((prev) => [
        ...prev,
        { module_id: moduleId, status: "in_progress", progress_percent: 50 },
      ]);
      toast({ title: "Module started!", description: `${mod?.title} is now in progress.` });
    }
    setStarting(null);
  };

  const completedCount = progress.filter((p) => p.status === "completed").length;
  const inProgressCount = progress.filter((p) => p.status === "in_progress").length;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" /> Training Center
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Master Dr. Claw with step-by-step learning modules
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground">Modules Completed</p>
              <p className="font-display text-2xl font-bold text-foreground mt-1">{completedCount} / {modules.length}</p>
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
                    style={{ width: `${modules.length ? (completedCount / modules.length) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {modules.length ? Math.round((completedCount / modules.length) * 100) : 0}%
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
                    ? "gradient-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((mod, index) => {
                const Icon = iconMap[mod.icon] || BookOpen;
                const prog = getProgress(mod.id);
                const isCompleted = prog?.status === "completed";
                const isInProgress = prog?.status === "in_progress";

                return (
                  <div
                    key={mod.id}
                    className={`bg-card rounded-xl border p-5 flex items-center gap-5 transition-all ${
                      isCompleted
                        ? "border-primary/20 bg-primary/[0.03]"
                        : "border-border hover:border-primary/10"
                    }`}
                  >
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-secondary text-muted-foreground font-display font-bold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                      isCompleted ? "gradient-primary" : "bg-muted"
                    }`}>
                      <Icon className={`h-5 w-5 ${isCompleted ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-foreground text-sm">{mod.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{mod.description}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium hidden sm:block ${difficultyColor[mod.difficulty]}`}>
                        {mod.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 hidden md:flex">
                        <Clock className="h-3 w-3" /> {mod.duration_minutes}m
                      </span>
                      <Button
                        size="sm"
                        onClick={() => startModule(mod.id)}
                        disabled={starting === mod.id || isCompleted}
                        className={`rounded-lg text-xs gap-1 min-w-[90px] ${
                          isCompleted
                            ? "bg-accent/20 text-accent hover:bg-accent/30"
                            : "gradient-primary text-primary-foreground hover:opacity-90"
                        }`}
                      >
                        {starting === mod.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isCompleted ? (
                          <><CheckCircle className="h-3 w-3" /> Done</>
                        ) : isInProgress ? (
                          <><Play className="h-3 w-3" /> Continue</>
                        ) : (
                          <><Play className="h-3 w-3" /> Start</>
                        )}
                      </Button>
                    </div>
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
