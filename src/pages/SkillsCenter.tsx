import { useState, useEffect } from "react";
import {
  Zap,
  Heart,
  Shield,
  Calendar,
  Globe,
  Lock,
  AlertTriangle,
  Repeat,
  Brain,
  Star,
  ChevronRight,
  Loader2,
  Bot,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, typeof Zap> = {
  Zap, Heart, Shield, Calendar, Globe, Lock, AlertTriangle, Repeat, Brain, Star,
};

const difficultyColor: Record<string, string> = {
  beginner: "bg-primary/20 text-primary",
  intermediate: "bg-accent/20 text-accent",
  advanced: "bg-destructive/20 text-destructive",
};

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  icon: string;
  xp_reward: number;
  is_active: boolean;
}

interface AgentSkill {
  skill_id: string;
  level: number;
  xp: number;
  completed_at: string | null;
}

const SkillsCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [agentSkills, setAgentSkills] = useState<AgentSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [training, setTraining] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: skillsData } = await supabase
        .from("bot_skills")
        .select("*")
        .eq("is_active", true);

      if (skillsData) setSkills(skillsData as any);

      if (user) {
        const { data: agentData } = await supabase
          .from("agent_skills")
          .select("skill_id, level, xp, completed_at")
          .eq("user_id", user.id);

        if (agentData) setAgentSkills(agentData as any);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const categories = ["All", ...new Set(skills.map((s) => s.category))];
  const filtered = activeCategory === "All" ? skills : skills.filter((s) => s.category === activeCategory);

  const getSkillProgress = (skillId: string) => {
    return agentSkills.find((as) => as.skill_id === skillId);
  };

  const trainSkill = async (skillId: string) => {
    if (!user) return;
    setTraining(skillId);

    const existing = getSkillProgress(skillId);
    const skill = skills.find((s) => s.id === skillId);

    if (existing) {
      // Level up
      const newXp = existing.xp + (skill?.xp_reward || 100);
      const newLevel = Math.min(5, existing.level + (newXp >= existing.level * 200 ? 1 : 0));

      await supabase
        .from("agent_skills")
        .update({
          xp: newXp,
          level: newLevel,
          completed_at: newLevel >= 5 ? new Date().toISOString() : null,
        } as any)
        .eq("user_id", user.id)
        .eq("skill_id", skillId);

      setAgentSkills((prev) =>
        prev.map((as) =>
          as.skill_id === skillId ? { ...as, xp: newXp, level: newLevel } : as
        )
      );
    } else {
      // Start training
      await supabase.from("agent_skills").insert({
        user_id: user.id,
        agent_key: "default",
        skill_id: skillId,
        level: 1,
        xp: skill?.xp_reward || 100,
      } as any);

      setAgentSkills((prev) => [
        ...prev,
        { skill_id: skillId, level: 1, xp: skill?.xp_reward || 100, completed_at: null },
      ]);
    }

    toast({ title: "Training complete!", description: `${skill?.name} skill improved.` });
    setTraining(null);
  };

  const totalXp = agentSkills.reduce((sum, a) => sum + a.xp, 0);
  const masteredCount = agentSkills.filter((a) => a.level >= 5).length;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" /> Dr. Claw Skills Center
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Train your AI agents to get better at specific tasks
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground">Total XP Earned</p>
              <p className="font-display text-2xl font-bold text-foreground mt-1">{totalXp.toLocaleString()}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground">Skills in Training</p>
              <p className="font-display text-2xl font-bold text-foreground mt-1">{agentSkills.length}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground">Skills Mastered</p>
              <p className="font-display text-2xl font-bold text-foreground mt-1">{masteredCount}</p>
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
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((skill) => {
                const Icon = iconMap[skill.icon] || Zap;
                const progress = getSkillProgress(skill.id);
                const level = progress?.level || 0;
                const maxLevel = 5;

                return (
                  <div key={skill.id} className="bg-card rounded-xl border border-border p-6 hover:border-primary/20 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-foreground text-sm">{skill.name}</h3>
                          <span className="text-xs text-muted-foreground">{skill.category}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColor[skill.difficulty]}`}>
                        {skill.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{skill.description}</p>

                    {/* Level progress */}
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(maxLevel)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            i < level ? "gradient-primary" : "bg-muted"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">Lv.{level}/{maxLevel}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3" /> {skill.xp_reward} XP
                      </span>
                      <Button
                        size="sm"
                        onClick={() => trainSkill(skill.id)}
                        disabled={training === skill.id || level >= maxLevel}
                        className={`rounded-lg text-xs gap-1 ${
                          level >= maxLevel
                            ? "bg-accent/20 text-accent"
                            : "gradient-primary text-primary-foreground hover:opacity-90"
                        }`}
                      >
                        {training === skill.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : level >= maxLevel ? (
                          "Mastered"
                        ) : level > 0 ? (
                          <>Train <ChevronRight className="h-3 w-3" /></>
                        ) : (
                          <>Start <ChevronRight className="h-3 w-3" /></>
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

export default SkillsCenter;
