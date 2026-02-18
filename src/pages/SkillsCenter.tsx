import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
  Heart,
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
  Cog,
  Server,
  BrainCircuit,
  CalendarCheck,
  ShieldCheck,
  PhoneCall,
  ClipboardList,
  ArrowRightLeft,
  FileCheck,
  Award,
  Microscope,
  TestTube,
  CheckSquare,
  GraduationCap,
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle2,
  Circle,
  Timer,
  ArrowRight,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { skills, skillCategories, getSkillsByCategory } from "@/data/skills";
import { useToast } from "@/hooks/use-toast";

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
  Heart,
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
  Cog,
  Server,
  BrainCircuit,
  CalendarCheck,
  ShieldCheck,
  PhoneCall,
  ClipboardList,
  ArrowRightLeft,
  FileCheck,
  Award,
  Microscope,
  TestTube,
  CheckSquare,
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
// Mock agents (consistent with other pages)
// ---------------------------------------------------------------------------
interface MockAgent {
  id: string;
  name: string;
  role: string;
  zone: string;
  compatible: boolean;
}

const MOCK_AGENTS: MockAgent[] = [
  { id: "agent-1", name: "Dr. Front Desk", role: "Medical Receptionist", zone: "Zone 1 (Clinical)", compatible: true },
  { id: "agent-2", name: "Marketing Maven", role: "Marketing Specialist", zone: "Zone 3 (External)", compatible: true },
  { id: "agent-3", name: "Grant Pro", role: "Grant Writer", zone: "Zone 2 (Administrative)", compatible: true },
];

// ---------------------------------------------------------------------------
// Bot hierarchy data
// ---------------------------------------------------------------------------
interface HierarchyNode {
  id: string;
  name: string;
  role: string;
  zone: string;
  children: HierarchyNode[];
}

const BOT_HIERARCHY: HierarchyNode = {
  id: "ceo-bot",
  name: "CEO Agent",
  role: "Supervisor",
  zone: "Zone 1 (Clinical)",
  children: [
    {
      id: "dept-head-1",
      name: "Clinical Dept Head",
      role: "Department Head",
      zone: "Zone 1 (Clinical)",
      children: [
        { id: "agent-1", name: "Dr. Front Desk", role: "Worker", zone: "Zone 1 (Clinical)", children: [] },
      ],
    },
    {
      id: "dept-head-2",
      name: "Marketing Dept Head",
      role: "Department Head",
      zone: "Zone 3 (External)",
      children: [
        { id: "agent-2", name: "Marketing Maven", role: "Worker", zone: "Zone 3 (External)", children: [] },
      ],
    },
    {
      id: "dept-head-3",
      name: "Admin Dept Head",
      role: "Department Head",
      zone: "Zone 2 (Administrative)",
      children: [
        { id: "agent-3", name: "Grant Pro", role: "Worker", zone: "Zone 2 (Administrative)", children: [] },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Training types
// ---------------------------------------------------------------------------
type TrainingStatus = "not_started" | "in_progress" | "completed" | "certified";

interface TrainingRecord {
  skillId: string;
  skillName: string;
  agentId: string;
  agentName: string;
  status: TrainingStatus;
  progress: number; // 0-100
  startedAt: string | null;
  completedAt: string | null;
  certifiedAt: string | null;
  statusMessage: string;
  estimatedTime: string;
}

interface TrainingLogEntry {
  id: string;
  timestamp: string;
  agentName: string;
  skillName: string;
  action: string;
}

const TRAINING_STATUS_MESSAGES: Record<string, string[]> = {
  phase1: ["Loading training data...", "Initializing skill modules..."],
  phase2: ["Processing skill modules...", "Analyzing capability patterns..."],
  phase3: ["Running validation tests...", "Executing scenario simulations..."],
  phase4: ["Generating certification...", "Finalizing training results..."],
};

function getStatusMessage(progress: number): string {
  if (progress < 25) return TRAINING_STATUS_MESSAGES.phase1[Math.floor(Math.random() * 2)];
  if (progress < 50) return TRAINING_STATUS_MESSAGES.phase2[Math.floor(Math.random() * 2)];
  if (progress < 75) return TRAINING_STATUS_MESSAGES.phase3[Math.floor(Math.random() * 2)];
  return TRAINING_STATUS_MESSAGES.phase4[Math.floor(Math.random() * 2)];
}

function formatTimestamp(): string {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Hierarchy tree renderer
// ---------------------------------------------------------------------------
function HierarchyTree({
  node,
  depth = 0,
  incompatibleZones,
  skillName,
}: {
  node: HierarchyNode;
  depth?: number;
  incompatibleZones: string[];
  skillName: string;
}) {
  const isIncompatible = incompatibleZones.includes(node.zone);
  return (
    <div className={`${depth > 0 ? "ml-6 border-l border-white/10 pl-4" : ""}`}>
      <div className={`flex items-center gap-2 py-1.5 ${isIncompatible ? "opacity-40" : ""}`}>
        {depth === 0 && <Crown className="h-4 w-4 text-amber-400 shrink-0" />}
        {depth === 1 && <Users className="h-4 w-4 text-blue-400 shrink-0" />}
        {depth === 2 && <Circle className="h-3 w-3 text-emerald-400 shrink-0" />}
        <span className="text-sm font-medium text-foreground">{node.name}</span>
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-white/10 text-muted-foreground">
          {node.role}
        </Badge>
        {isIncompatible && (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-red-500/30 text-red-400">
            Incompatible Zone
          </Badge>
        )}
        {!isIncompatible && depth > 0 && (
          <ArrowRight className="h-3 w-3 text-primary/60" />
        )}
        {!isIncompatible && depth > 0 && (
          <span className="text-[10px] text-primary/70">Will receive "{skillName}"</span>
        )}
      </div>
      {node.children.map((child) => (
        <HierarchyTree
          key={child.id}
          node={child}
          depth={depth + 1}
          incompatibleZones={incompatibleZones}
          skillName={skillName}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main view tabs
// ---------------------------------------------------------------------------
type MainTab = "skills" | "training";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const SkillsCenter = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  // ── Existing state ──
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<(typeof skills)[number] | null>(null);

  // ── Main tab state ──
  const [mainTab, setMainTab] = useState<MainTab>("skills");

  // ── Agent assignment state ──
  const [agentAssignments, setAgentAssignments] = useState<Record<string, Set<string>>>({});

  // ── Hierarchy auto-assign state ──
  const [hierarchyEnabled, setHierarchyEnabled] = useState<Record<string, boolean>>({});
  const [incompatibleZones] = useState<string[]>(["Zone 3 (External)"]);

  // ── Training state ──
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>(() => {
    // Initialize some default records so the training tab has data
    const initial: TrainingRecord[] = [];
    const firstThreeSkills = skills.slice(0, 3);
    for (const skill of firstThreeSkills) {
      for (const agent of MOCK_AGENTS) {
        initial.push({
          skillId: skill.id,
          skillName: skill.name,
          agentId: agent.id,
          agentName: agent.name,
          status: "not_started",
          progress: 0,
          startedAt: null,
          completedAt: null,
          certifiedAt: null,
          statusMessage: "Awaiting training start",
          estimatedTime: "~5 seconds",
        });
      }
    }
    return initial;
  });
  const [trainingLog, setTrainingLog] = useState<TrainingLogEntry[]>([]);
  const trainingIntervals = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(trainingIntervals.current).forEach(clearInterval);
    };
  }, []);

  // ── Skill filtering (existing logic) ──
  const filteredSkills = skills.filter((s) => {
    const matchesCategory =
      selectedCategory === "all" || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryTabs = [
    { id: "all", name: t("skillsCenter.all") },
    ...skillCategories.map((c) => ({ id: c.id, name: c.name })),
  ];

  // ── Agent assignment helpers ──
  const isAgentAssigned = (skillId: string, agentId: string): boolean => {
    return agentAssignments[skillId]?.has(agentId) ?? false;
  };

  const toggleAgentAssignment = (skillId: string, skillName: string, agentId: string, agentName: string) => {
    setAgentAssignments((prev) => {
      const current = new Set(prev[skillId] ?? []);
      if (current.has(agentId)) {
        current.delete(agentId);
        toast({
          title: "Skill Unassigned",
          description: `${skillName} removed from ${agentName}`,
        });
      } else {
        current.add(agentId);
        toast({
          title: "Skill Assigned",
          description: `${skillName} assigned to ${agentName}`,
        });
      }
      return { ...prev, [skillId]: current };
    });
  };

  // ── Hierarchy toggle helper ──
  const toggleHierarchy = (skillId: string) => {
    setHierarchyEnabled((prev) => ({ ...prev, [skillId]: !prev[skillId] }));
  };

  // ── Training helpers ──
  const getTrainingRecord = (skillId: string, agentId: string): TrainingRecord | undefined => {
    return trainingRecords.find((r) => r.skillId === skillId && r.agentId === agentId);
  };

  const getOrCreateTrainingRecord = (skillId: string, skillName: string, agentId: string, agentName: string): TrainingRecord => {
    const existing = getTrainingRecord(skillId, agentId);
    if (existing) return existing;
    const newRecord: TrainingRecord = {
      skillId,
      skillName,
      agentId,
      agentName,
      status: "not_started",
      progress: 0,
      startedAt: null,
      completedAt: null,
      certifiedAt: null,
      statusMessage: "Awaiting training start",
      estimatedTime: "~5 seconds",
    };
    setTrainingRecords((prev) => [...prev, newRecord]);
    return newRecord;
  };

  const addLogEntry = useCallback((agentName: string, skillName: string, action: string) => {
    setTrainingLog((prev) => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: formatTimestamp(),
        agentName,
        skillName,
        action,
      },
      ...prev.slice(0, 49), // keep last 50
    ]);
  }, []);

  const startTraining = useCallback((skillId: string, skillName: string, agentId: string, agentName: string) => {
    const key = `${skillId}-${agentId}`;

    // Clear any existing interval for this pair
    if (trainingIntervals.current[key]) {
      clearInterval(trainingIntervals.current[key]);
    }

    // Reset / start the record
    setTrainingRecords((prev) => {
      const exists = prev.some((r) => r.skillId === skillId && r.agentId === agentId);
      if (!exists) {
        return [
          ...prev,
          {
            skillId,
            skillName,
            agentId,
            agentName,
            status: "in_progress" as TrainingStatus,
            progress: 0,
            startedAt: formatTimestamp(),
            completedAt: null,
            certifiedAt: null,
            statusMessage: "Loading training data...",
            estimatedTime: "~5 seconds",
          },
        ];
      }
      return prev.map((r) =>
        r.skillId === skillId && r.agentId === agentId
          ? {
              ...r,
              status: "in_progress" as TrainingStatus,
              progress: 0,
              startedAt: formatTimestamp(),
              completedAt: null,
              certifiedAt: null,
              statusMessage: "Loading training data...",
            }
          : r,
      );
    });

    addLogEntry(agentName, skillName, "Training started");

    // Animate progress over ~5 seconds (50 ticks x 100ms)
    let tick = 0;
    trainingIntervals.current[key] = setInterval(() => {
      tick++;
      const progress = Math.min(tick * 2, 100);

      setTrainingRecords((prev) =>
        prev.map((r) => {
          if (r.skillId !== skillId || r.agentId !== agentId) return r;
          if (progress >= 100) {
            return {
              ...r,
              progress: 100,
              status: "certified" as TrainingStatus,
              completedAt: formatTimestamp(),
              certifiedAt: formatTimestamp(),
              statusMessage: "Certification complete",
            };
          }
          return {
            ...r,
            progress,
            statusMessage: getStatusMessage(progress),
          };
        }),
      );

      if (progress >= 100) {
        clearInterval(trainingIntervals.current[key]);
        delete trainingIntervals.current[key];
        addLogEntry(agentName, skillName, "Training certified");
      }
    }, 100);
  }, [addLogEntry]);

  // ── Training dashboard stats ──
  const trainingStats = {
    totalAgentsTrained: new Set(
      trainingRecords.filter((r) => r.status === "certified").map((r) => r.agentId),
    ).size,
    totalSkillsCertified: trainingRecords.filter((r) => r.status === "certified").length,
    inProgress: trainingRecords.filter((r) => r.status === "in_progress").length,
    notStarted: trainingRecords.filter((r) => r.status === "not_started").length,
  };

  // ── Training status styling ──
  const statusBadge = (status: TrainingStatus) => {
    switch (status) {
      case "not_started":
        return (
          <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground gap-1">
            <Circle className="h-2.5 w-2.5" /> Not Started
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400 gap-1">
            <Timer className="h-2.5 w-2.5 animate-spin" /> In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 gap-1">
            <Clock className="h-2.5 w-2.5" /> Completed
          </Badge>
        );
      case "certified":
        return (
          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" /> Certified
          </Badge>
        );
    }
  };

  const getTrainingButton = (record: TrainingRecord) => {
    switch (record.status) {
      case "not_started":
        return (
          <Button
            size="sm"
            className="h-7 text-xs gradient-primary text-white shadow-glow-sm hover:opacity-90"
            onClick={() => startTraining(record.skillId, record.skillName, record.agentId, record.agentName)}
          >
            <Play className="h-3 w-3 mr-1" /> Start Training
          </Button>
        );
      case "in_progress":
        return (
          <Button size="sm" variant="outline" className="h-7 text-xs border-white/10" disabled>
            <Pause className="h-3 w-3 mr-1" /> Training...
          </Button>
        );
      case "completed":
        return (
          <Button
            size="sm"
            className="h-7 text-xs gradient-primary text-white shadow-glow-sm hover:opacity-90"
            onClick={() => startTraining(record.skillId, record.skillName, record.agentId, record.agentName)}
          >
            <Play className="h-3 w-3 mr-1" /> Resume Training
          </Button>
        );
      case "certified":
        return (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-white/10 hover:border-white/20"
            onClick={() => startTraining(record.skillId, record.skillName, record.agentId, record.agentName)}
          >
            <RotateCcw className="h-3 w-3 mr-1" /> Retrain
          </Button>
        );
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ── Header ─────────────────────────────────── */}
          <div>
            <h1 className="text-3xl font-bold font-heading gradient-hero-text">
              {t("skillsCenter.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("skillsCenter.subtitle")}
            </p>
          </div>

          {/* ── Main Tab Switcher ──────────────────────── */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-0">
            <button
              onClick={() => setMainTab("skills")}
              className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
                mainTab === "skills"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Skills Library
            </button>
            <button
              onClick={() => setMainTab("training")}
              className={`px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
                mainTab === "training"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Training
            </button>
          </div>

          {/* ════════════════════════════════════════════ */}
          {/* SKILLS LIBRARY TAB                          */}
          {/* ════════════════════════════════════════════ */}
          {mainTab === "skills" && (
            <>
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
                    placeholder={t("skillsCenter.searchPlaceholder")}
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
                  <p className="text-sm">{t("skillsCenter.noSkillsMatch")}</p>
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
                              key={cap.name}
                              className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10"
                            >
                              {cap.name}
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
            </>
          )}

          {/* ════════════════════════════════════════════ */}
          {/* TRAINING TAB                                */}
          {/* ════════════════════════════════════════════ */}
          {mainTab === "training" && (
            <div className="space-y-6">
              {/* ── Training Dashboard Stats ──────────── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Agents Trained</span>
                  </div>
                  <p className="text-2xl font-bold font-heading text-foreground">{trainingStats.totalAgentsTrained}</p>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-muted-foreground">Skills Certified</span>
                  </div>
                  <p className="text-2xl font-bold font-heading text-foreground">{trainingStats.totalSkillsCertified}</p>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Timer className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-muted-foreground">In Progress</span>
                  </div>
                  <p className="text-2xl font-bold font-heading text-foreground">{trainingStats.inProgress}</p>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Circle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Not Started</span>
                  </div>
                  <p className="text-2xl font-bold font-heading text-foreground">{trainingStats.notStarted}</p>
                </div>
              </div>

              {/* ── Training Progress Per Agent Per Skill ── */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Training Progress
                </h3>

                {trainingRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No training records yet. Assign skills to agents and start training.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {trainingRecords.map((record) => (
                      <div
                        key={`${record.skillId}-${record.agentId}`}
                        className="rounded-xl bg-white/[0.03] border border-white/5 p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="shrink-0">
                              <span className="text-sm font-semibold text-foreground">{record.agentName}</span>
                              <span className="text-xs text-muted-foreground mx-2">|</span>
                              <span className="text-xs text-muted-foreground">{record.skillName}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {statusBadge(record.status)}
                            {getTrainingButton(record)}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <Progress value={record.progress} className="h-2" />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">
                              {record.status === "in_progress"
                                ? record.statusMessage
                                : record.status === "certified"
                                ? `Certified at ${record.certifiedAt}`
                                : record.statusMessage}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" /> {record.estimatedTime}
                              </span>
                              <span className="text-[10px] font-semibold text-foreground">
                                {record.progress}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Certified badge with checkmark */}
                        {record.status === "certified" && (
                          <div className="flex items-center gap-1.5 mt-2 text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">Certified</span>
                            <span className="text-[10px] text-muted-foreground ml-1">
                              {record.certifiedAt}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Training Log ──────────────────────── */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  Training Activity Log
                </h3>

                {trainingLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No training activity yet. Start training a skill to see the log.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {trainingLog.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 text-xs py-1.5 border-b border-white/5 last:border-0"
                      >
                        <span className="text-muted-foreground/60 shrink-0 w-36 font-mono text-[10px]">
                          {entry.timestamp}
                        </span>
                        <span className="font-medium text-foreground shrink-0">{entry.agentName}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                        <span className="text-muted-foreground">{entry.skillName}</span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] ml-auto shrink-0 ${
                            entry.action.includes("certified")
                              ? "border-emerald-500/30 text-emerald-400"
                              : "border-blue-500/30 text-blue-400"
                          }`}
                        >
                          {entry.action}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
          <DialogContent className="max-w-3xl glass-card border-white/10 max-h-[90vh] overflow-y-auto">
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
                {selectedSkill.tier} {t("skillsCenter.tier")}
              </Badge>
            </div>

            {/* Capabilities */}
            <div>
              <h4 className="text-sm font-semibold font-heading text-foreground mb-2">
                {t("skillsCenter.capabilities")}
              </h4>
              <ul className="grid sm:grid-cols-2 gap-2">
                {selectedSkill.capabilities.map((cap) => (
                  <li
                    key={cap.name}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Zap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground/90">
                        {cap.name}
                      </span>
                      <p className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed">
                        {cap.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Assign to Specific Agents ─────────── */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-semibold font-heading text-foreground mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Assign to Agents
              </h4>
              <div className="space-y-2">
                {MOCK_AGENTS.map((agent) => {
                  const assigned = isAgentAssigned(selectedSkill.id, agent.id);
                  return (
                    <label
                      key={agent.id}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all border ${
                        assigned
                          ? "bg-primary/10 border-primary/30"
                          : "bg-white/[0.03] border-white/5 hover:border-white/10"
                      }`}
                    >
                      <Checkbox
                        checked={assigned}
                        onCheckedChange={() =>
                          toggleAgentAssignment(selectedSkill.id, selectedSkill.name, agent.id, agent.name)
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{agent.name}</span>
                          {assigned && (
                            <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">
                              Assigned
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {agent.role} &middot; {agent.zone}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ── Hierarchy Auto-Assign ─────────────── */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-semibold font-heading text-foreground mb-3 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" />
                Hierarchy Auto-Assign
              </h4>
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Enable automatic propagation
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Parent/supervisor agent will autonomously assign this skill to subordinate agents
                    </p>
                  </div>
                  <Switch
                    checked={hierarchyEnabled[selectedSkill.id] ?? false}
                    onCheckedChange={() => toggleHierarchy(selectedSkill.id)}
                  />
                </div>

                {hierarchyEnabled[selectedSkill.id] && (
                  <div className="mt-4 space-y-3">
                    {/* Warning */}
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                      <p className="text-xs text-amber-400 flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 shrink-0" />
                        Subordinate agents in incompatible zones will be skipped
                      </p>
                    </div>

                    {/* Hierarchy tree */}
                    <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                        Propagation Path
                      </p>
                      <HierarchyTree
                        node={BOT_HIERARCHY}
                        incompatibleZones={incompatibleZones}
                        skillName={selectedSkill.name}
                      />
                    </div>

                    {/* Subordinates that will receive */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Agents that will receive this skill:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {MOCK_AGENTS.filter((a) => !incompatibleZones.includes(a.zone)).map((agent) => (
                          <Badge
                            key={agent.id}
                            variant="outline"
                            className="text-xs border-emerald-500/30 text-emerald-400 gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            {agent.name}
                          </Badge>
                        ))}
                        {MOCK_AGENTS.filter((a) => incompatibleZones.includes(a.zone)).map((agent) => (
                          <Badge
                            key={agent.id}
                            variant="outline"
                            className="text-xs border-red-500/30 text-red-400 gap-1 line-through opacity-60"
                          >
                            {agent.name} (skipped)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Use Cases (existing) ─────────────── */}
            {selectedSkill.useCases && selectedSkill.useCases.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-sm font-semibold font-heading text-foreground mb-2">
                  Use Cases
                </h4>
                <ul className="space-y-1.5">
                  {selectedSkill.useCases.map((uc, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      {uc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Action ──────────────────────────────── */}
            <div className="pt-2 flex justify-end">
              <Button
                className="gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity"
                onClick={() => {
                  toast({
                    title: t("skillsCenter.toastSkillAddedTitle"),
                    description: t("skillsCenter.toastSkillAddedDesc", { name: selectedSkill.name }),
                  });
                  setSelectedSkill(null);
                }}
              >
                <Zap className="h-4 w-4 mr-1.5" />
                {t("skillsCenter.addToAgent")}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default SkillsCenter;
