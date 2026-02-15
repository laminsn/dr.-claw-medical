import { useState } from "react";
import {
  Crown,
  BarChart3,
  DollarSign,
  Megaphone,
  Monitor,
  Users,
  Brain,
  PenTool,
  FileSearch,
  Search,
  Calendar,
  Shield,
  HeartPulse,
  FileText,
  GitBranch,
  UserX,
  Pill,
  FlaskConical,
  ClipboardCheck,
  Stethoscope,
  Briefcase,
  Target,
  TrendingUp,
  Zap,
  Settings,
  Server,
  BrainCircuit,
  CalendarCheck,
  ShieldCheck,
  PhoneCall,
  ClipboardList,
  ArrowRightLeft,
  FileCheck,
  Award,
  type LucideIcon,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { skills, skillCategories, getSkillsByCategory } from "@/data/skills";

// ---------------------------------------------------------------------------
// Icon mapping: skill data stores icon names as strings
// ---------------------------------------------------------------------------
const iconMap: Record<string, LucideIcon> = {
  Crown,
  BarChart3,
  DollarSign,
  Megaphone,
  Monitor,
  Users,
  Brain,
  PenTool,
  FileSearch,
  Search,
  Calendar,
  Shield,
  HeartPulse,
  FileText,
  GitBranch,
  UserX,
  Pill,
  FlaskConical,
  ClipboardCheck,
  Stethoscope,
  Briefcase,
  Target,
  TrendingUp,
  Zap,
  Settings,
  Server,
  BrainCircuit,
  CalendarCheck,
  ShieldCheck,
  PhoneCall,
  ClipboardList,
  ArrowRightLeft,
  FileCheck,
  Award,
};

function resolveIcon(name: string): LucideIcon {
  return iconMap[name] ?? Zap;
}

// ---------------------------------------------------------------------------
// Tier badge colours
// ---------------------------------------------------------------------------
const tierColors: Record<string, string> = {
  starter: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  professional: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  advanced: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  enterprise: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

const categoryColors: Record<string, string> = {
  healthcare: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  executive: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  marketing: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  operations: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  finance: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  research: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const SkillsCenter = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<(typeof skills)[number] | null>(null);

  const filteredSkills = skills.filter((s) => {
    const matchesCategory =
      selectedCategory === "all" || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryTabs = [
    { id: "all", name: "All" },
    ...skillCategories.map((c) => ({ id: c.id, name: c.name })),
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ── Header ─────────────────────────────────── */}
          <div>
            <h1 className="text-3xl font-bold font-heading gradient-hero-text">
              Skills Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse and explore 30+ AI skills to power your agents.
            </p>
          </div>

          {/* ── Filters ────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === tab.id
                      ? "gradient-primary text-white shadow-glow-sm"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative sm:ml-auto sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 focus:border-primary"
              />
            </div>
          </div>

          {/* ── Skills grid ────────────────────────────── */}
          {filteredSkills.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No skills match your search.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSkills.map((skill) => {
                const Icon = resolveIcon(skill.icon);
                return (
                  <button
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    className="glass-card card-hover rounded-2xl p-5 text-left transition-all group"
                  >
                    {/* Top row: icon + badges */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${categoryColors[skill.category] ?? ""}`}
                        >
                          {skill.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${tierColors[skill.tier] ?? ""}`}
                        >
                          {skill.tier}
                        </Badge>
                      </div>
                    </div>

                    {/* Name + description */}
                    <h3 className="font-semibold font-heading text-sm text-foreground group-hover:text-primary transition-colors">
                      {skill.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {skill.description}
                    </p>

                    {/* Capability preview chips */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {skill.capabilities.slice(0, 3).map((cap) => (
                        <span
                          key={cap}
                          className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10"
                        >
                          {cap}
                        </span>
                      ))}
                      {skill.capabilities.length > 3 && (
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10">
                          +{skill.capabilities.length - 3}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Skill detail dialog ──────────────────────── */}
      <Dialog
        open={!!selectedSkill}
        onOpenChange={(open) => {
          if (!open) setSelectedSkill(null);
        }}
      >
        {selectedSkill && (
          <DialogContent className="max-w-3xl glass-card border-white/10">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                {(() => {
                  const Icon = resolveIcon(selectedSkill.icon);
                  return (
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  );
                })()}
                <div className="min-w-0">
                  <DialogTitle className="text-lg font-heading">
                    {selectedSkill.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {selectedSkill.shortName} &middot;{" "}
                    <span className="capitalize">{selectedSkill.category}</span>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {selectedSkill.description}
            </p>

            {/* Badges */}
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-[10px] capitalize ${categoryColors[selectedSkill.category] ?? ""}`}
              >
                {selectedSkill.category}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] capitalize ${tierColors[selectedSkill.tier] ?? ""}`}
              >
                {selectedSkill.tier} tier
              </Badge>
            </div>

            {/* Capabilities */}
            <div>
              <h4 className="text-sm font-semibold font-heading text-foreground mb-2">
                Capabilities
              </h4>
              <ul className="grid sm:grid-cols-2 gap-2">
                {selectedSkill.capabilities.map((cap) => (
                  <li
                    key={cap}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-semibold text-foreground/90">
                      {cap}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action */}
            <div className="pt-2 flex justify-end">
              <Button className="gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity">
                <Zap className="h-4 w-4 mr-1.5" />
                Add to Agent
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default SkillsCenter;
