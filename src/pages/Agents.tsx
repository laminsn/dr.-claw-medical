import { useState } from "react";
import {
  Bot,
  Plus,
  Settings,
  Power,
  Zap,
  Search,
  ArrowRight,
  X,
  Check,
  Brain,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { skills, skillCategories } from "@/data/skills";
import { agentTemplates } from "@/data/agentTemplates";

interface MyAgent {
  id: string;
  name: string;
  skills: string[];
  model: string;
  active: boolean;
}

const MODEL_OPTIONS = [
  { id: "openai", label: "OpenAI", color: "text-green-400" },
  { id: "claude", label: "Claude", color: "text-violet-400" },
  { id: "gemini", label: "Gemini", color: "text-blue-400" },
  { id: "minimax", label: "MiniMax", color: "text-amber-400" },
  { id: "kimi", label: "Kimi", color: "text-rose-400" },
];

function getSkillName(skillId: string): string {
  const skill = skills.find((s) => s.id === skillId);
  return skill ? skill.shortName : skillId;
}

function getSkillFullName(skillId: string): string {
  const skill = skills.find((s) => s.id === skillId);
  return skill ? skill.name : skillId;
}

const Agents = () => {
  const [myAgents, setMyAgents] = useState<MyAgent[]>([
    {
      id: "1",
      name: "Dr. Front Desk",
      skills: [
        "appointment-scheduling",
        "insurance-verification",
        "patient-follow-up",
      ],
      model: "openai",
      active: true,
    },
    {
      id: "2",
      name: "Marketing Maven",
      skills: ["copywriter", "cmo", "researcher"],
      model: "claude",
      active: true,
    },
    {
      id: "3",
      name: "Grant Pro",
      skills: ["grant-writer", "researcher", "cfo"],
      model: "claude",
      active: false,
    },
  ]);

  const [createOpen, setCreateOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentModel, setNewAgentModel] = useState("openai");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [searchSkills, setSearchSkills] = useState("");
  const [activeTab, setActiveTab] = useState<"my-agents" | "templates">(
    "my-agents"
  );

  // ── Handlers ────────────────────────────────────

  const toggleAgent = (id: string) => {
    setMyAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((s) => s !== skillId)
        : [...prev, skillId]
    );
  };

  const removeSelectedSkill = (skillId: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skillId));
  };

  const resetCreateForm = () => {
    setNewAgentName("");
    setNewAgentModel("openai");
    setSelectedSkills([]);
    setSearchSkills("");
  };

  const handleCreate = () => {
    if (!newAgentName.trim() || selectedSkills.length === 0) return;

    const newAgent: MyAgent = {
      id: String(Date.now()),
      name: newAgentName.trim(),
      skills: [...selectedSkills],
      model: newAgentModel,
      active: true,
    };

    setMyAgents((prev) => [...prev, newAgent]);
    setCreateOpen(false);
    resetCreateForm();
  };

  const deployTemplate = (templateId: string) => {
    const template = agentTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const newAgent: MyAgent = {
      id: String(Date.now()),
      name: template.name,
      skills: [...template.defaultSkills],
      model: template.suggestedModel.toLowerCase(),
      active: true,
    };

    setMyAgents((prev) => [...prev, newAgent]);
    setActiveTab("my-agents");
  };

  // ── Filtered skills for the create dialog ───────

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchSkills.toLowerCase())
  );

  const groupedSkills = skillCategories
    .map((cat) => ({
      ...cat,
      skills: filteredSkills.filter((s) => s.category === cat.id),
    }))
    .filter((group) => group.skills.length > 0);

  // ── Render ──────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {/* ── Header ─────────────────────────────── */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
              AI Agents
            </h1>
            <p className="text-muted-foreground mt-1">
              Create, customize, and deploy your AI team
            </p>
          </div>

          {/* ── Tabs ───────────────────────────────── */}
          <div className="flex items-center gap-1 mb-8 bg-card/50 border border-border rounded-xl p-1 w-fit">
            <button
              onClick={() => setActiveTab("my-agents")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "my-agents"
                  ? "gradient-primary text-primary-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                My Agents
              </span>
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "templates"
                  ? "gradient-primary text-primary-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick-Start Templates
              </span>
            </button>
          </div>

          {/* ── My Agents Tab ──────────────────────── */}
          {activeTab === "my-agents" && (
            <div>
              {/* Create button */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-muted-foreground">
                  {myAgents.filter((a) => a.active).length} active of{" "}
                  {myAgents.length} agents
                </p>
                <Button
                  className="gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90 gap-2"
                  onClick={() => {
                    resetCreateForm();
                    setCreateOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create Agent
                </Button>
              </div>

              {/* Agent cards grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {myAgents.map((agent) => {
                  const modelOption = MODEL_OPTIONS.find(
                    (m) => m.id === agent.model
                  );
                  const visibleSkills = agent.skills.slice(0, 3);
                  const extraCount = agent.skills.length - 3;

                  return (
                    <div
                      key={agent.id}
                      className={`group relative rounded-xl border p-5 transition-all duration-300 card-hover ${
                        agent.active
                          ? "border-primary/20 bg-card"
                          : "border-border bg-card/60 opacity-75"
                      }`}
                    >
                      {/* Status indicator dot */}
                      <div className="absolute top-4 right-4">
                        <span className="relative flex h-2.5 w-2.5">
                          {agent.active && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          )}
                          <span
                            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                              agent.active ? "bg-green-500" : "bg-muted-foreground/40"
                            }`}
                          />
                        </span>
                      </div>

                      {/* Agent icon and name */}
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            agent.active
                              ? "gradient-primary shadow-glow-sm"
                              : "bg-muted"
                          }`}
                        >
                          <Bot
                            className={`h-5 w-5 ${
                              agent.active
                                ? "text-primary-foreground"
                                : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-foreground leading-tight">
                            {agent.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`text-xs mt-0.5 bg-primary/10 border-0 ${
                              modelOption?.color ?? "text-primary"
                            }`}
                          >
                            {modelOption?.label ?? agent.model}
                          </Badge>
                        </div>
                      </div>

                      {/* Skills list */}
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          {agent.skills.length} skill
                          {agent.skills.length !== 1 ? "s" : ""} assigned
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {visibleSkills.map((skillId) => (
                            <span
                              key={skillId}
                              className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium"
                            >
                              {getSkillName(skillId)}
                            </span>
                          ))}
                          {extraCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                              +{extraCount} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <button
                          onClick={() => toggleAgent(agent.id)}
                          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                            agent.active
                              ? "text-green-500 hover:text-green-400"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                          {agent.active ? "Active" : "Inactive"}
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Empty state / create card */}
                <button
                  onClick={() => {
                    resetCreateForm();
                    setCreateOpen(true);
                  }}
                  className="rounded-xl border-2 border-dashed border-border p-5 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-primary/5 transition-all min-h-[220px] group"
                >
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="font-display font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-sm">
                    Create New Agent
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pick skills and a model to get started
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* ── Templates Tab ──────────────────────── */}
          {activeTab === "templates" && (
            <div>
              <p className="text-sm text-muted-foreground mb-6">
                Pre-configured agent blueprints. Deploy one in a single click.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {agentTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="rounded-xl border border-border bg-card p-5 transition-all duration-300 card-hover flex flex-col"
                  >
                    {/* Icon and category */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow-sm">
                        <Brain className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize border-border"
                      >
                        {template.category}
                      </Badge>
                    </div>

                    {/* Name and description */}
                    <h3 className="font-display font-bold text-foreground mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                      {template.description}
                    </p>

                    {/* Default skills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {template.defaultSkills.map((skillId) => (
                        <span
                          key={skillId}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium"
                        >
                          {getSkillFullName(skillId)}
                        </span>
                      ))}
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-t border-b border-border">
                      {template.metrics.map((metric) => (
                        <div key={metric.label} className="text-center">
                          <p className="text-xs font-bold text-foreground">
                            {metric.value}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {metric.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Deploy button */}
                    <Button
                      className="w-full gradient-primary text-primary-foreground rounded-lg shadow-glow-sm hover:opacity-90 gap-2"
                      onClick={() => deployTemplate(template.id)}
                    >
                      <Zap className="h-4 w-4" />
                      Deploy
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Create Agent Dialog ───────────────── */}
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) resetCreateForm();
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Create New Agent
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-2">
              {/* Agent Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Agent Name</Label>
                <Input
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. Dr. Front Desk, Marketing Maven..."
                  className="bg-background border-border"
                />
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">AI Model</Label>
                <div className="grid grid-cols-5 gap-2">
                  {MODEL_OPTIONS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setNewAgentModel(model.id)}
                      className={`relative flex flex-col items-center gap-1 rounded-lg border p-3 transition-all text-center ${
                        newAgentModel === model.id
                          ? "border-primary bg-primary/10 shadow-glow-sm"
                          : "border-border bg-background hover:border-primary/30 hover:bg-primary/5"
                      }`}
                    >
                      {newAgentModel === model.id && (
                        <span className="absolute top-1.5 right-1.5">
                          <Check className="h-3 w-3 text-primary" />
                        </span>
                      )}
                      <Brain
                        className={`h-5 w-5 ${
                          newAgentModel === model.id
                            ? model.color
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          newAgentModel === model.id
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {model.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Skills{" "}
                  <span className="text-muted-foreground font-normal">
                    ({selectedSkills.length} selected)
                  </span>
                </Label>

                {/* Selected skills badges */}
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    {selectedSkills.map((skillId) => (
                      <Badge
                        key={skillId}
                        className="bg-primary/15 text-primary border-0 hover:bg-primary/25 cursor-pointer gap-1 pr-1"
                        onClick={() => removeSelectedSkill(skillId)}
                      >
                        {getSkillFullName(skillId)}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchSkills}
                    onChange={(e) => setSearchSkills(e.target.value)}
                    placeholder="Search skills..."
                    className="pl-9 bg-background border-border"
                  />
                </div>

                {/* Skills grouped by category */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {groupedSkills.map((group) => (
                    <div key={group.id}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {group.name}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {group.skills.map((skill) => {
                          const isSelected = selectedSkills.includes(skill.id);
                          return (
                            <button
                              key={skill.id}
                              onClick={() => toggleSkill(skill.id)}
                              className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-background hover:border-primary/30 hover:bg-primary/5"
                              }`}
                            >
                              <div
                                className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isSelected
                                    ? "bg-primary border-primary"
                                    : "border-muted-foreground/40"
                                }`}
                              >
                                {isSelected && (
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p
                                  className={`text-sm font-medium leading-tight ${
                                    isSelected
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {skill.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                                  {skill.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {groupedSkills.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No skills match your search.
                    </div>
                  )}
                </div>
              </div>

              {/* Create button */}
              <Button
                className="w-full gradient-primary text-primary-foreground rounded-xl shadow-glow-sm hover:opacity-90 gap-2"
                disabled={!newAgentName.trim() || selectedSkills.length === 0}
                onClick={handleCreate}
              >
                <Plus className="h-4 w-4" />
                Create Agent
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Agents;
