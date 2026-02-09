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
  Download,
  CheckCircle,
  Loader2,
  Bot,
  Search,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface InstalledSkill {
  skill_id: string;
  agent_key: string;
  level: number;
  xp: number;
  completed_at: string | null;
}

const SkillsCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [installedSkills, setInstalledSkills] = useState<InstalledSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [installing, setInstalling] = useState<string | null>(null);

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
          .select("skill_id, agent_key, level, xp, completed_at")
          .eq("user_id", user.id);

        if (agentData) setInstalledSkills(agentData as any);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const categories = ["All", ...new Set(skills.map((s) => s.category))];

  const filtered = skills.filter((s) => {
    const matchesCategory = activeCategory === "All" || s.category === activeCategory;
    const matchesSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isInstalled = (skillId: string) => installedSkills.some((is) => is.skill_id === skillId);
  const getInstallCount = (skillId: string) => installedSkills.filter((is) => is.skill_id === skillId).length;

  const installSkill = async (skillId: string) => {
    if (!user) return;
    setInstalling(skillId);

    const skill = skills.find((s) => s.id === skillId);

    // Install to default agent
    const { error } = await supabase.from("agent_skills").insert({
      user_id: user.id,
      agent_key: "default",
      skill_id: skillId,
      level: 1,
      xp: skill?.xp_reward || 100,
    } as any);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already installed", description: `${skill?.name} is already installed on this agent.` });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      setInstalledSkills((prev) => [
        ...prev,
        { skill_id: skillId, agent_key: "default", level: 1, xp: skill?.xp_reward || 100, completed_at: null },
      ]);
      toast({
        title: "Skill installed! 🎉",
        description: `${skill?.name} has been installed on your agent. It's ready to use.`,
      });
    }
    setInstalling(null);
  };

  const installedCount = new Set(installedSkills.map((is) => is.skill_id)).size;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" /> OpenClaw Skills
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Install healthcare skills on your AI agents — one skill or all of them
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground">Available Skills</p>
              <p className="font-display text-2xl font-bold text-foreground mt-1">{skills.length}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground">Installed</p>
              <p className="font-display text-2xl font-bold text-foreground mt-1">{installedCount}</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <p className="text-xs text-muted-foreground">OpenClaw Source</p>
              <p className="font-display text-sm font-bold text-primary mt-1">Community Marketplace</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((skill) => {
                const Icon = iconMap[skill.icon] || Zap;
                const installed = isInstalled(skill.id);
                const installCount = getInstallCount(skill.id);

                return (
                  <div
                    key={skill.id}
                    className={`bg-card rounded-xl border p-5 transition-all ${
                      installed ? "border-primary/20 bg-primary/[0.02]" : "border-border hover:border-primary/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          installed ? "gradient-primary" : "bg-muted"
                        }`}>
                          <Icon className={`h-5 w-5 ${installed ? "text-primary-foreground" : "text-muted-foreground"}`} />
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

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{skill.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3" /> {skill.xp_reward} XP
                        {installCount > 0 && (
                          <span className="ml-2 text-primary">• {installCount} agent{installCount > 1 ? "s" : ""}</span>
                        )}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => installSkill(skill.id)}
                        disabled={installing === skill.id}
                        className={`rounded-lg text-xs gap-1 ${
                          installed
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "gradient-primary text-primary-foreground hover:opacity-90"
                        }`}
                      >
                        {installing === skill.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : installed ? (
                          <><CheckCircle className="h-3 w-3" /> Installed</>
                        ) : (
                          <><Download className="h-3 w-3" /> Install</>
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
