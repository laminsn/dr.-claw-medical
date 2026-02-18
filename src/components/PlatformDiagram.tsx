import { useState, useEffect } from "react";
import {
  Bot,
  FileText,
  Calendar,
  ShieldCheck,
  Zap,
  HeartPulse,
  Phone,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const agents = [
  { id: "front-desk", label: "Front Desk Agent", icon: Phone, color: "text-blue-400", border: "border-blue-400/30", bg: "bg-blue-400/10" },
  { id: "clinical", label: "Clinical Coordinator", icon: HeartPulse, color: "text-red-400", border: "border-red-400/30", bg: "bg-red-400/10" },
  { id: "scheduler", label: "Scheduling Agent", icon: Calendar, color: "text-cyan-400", border: "border-cyan-400/30", bg: "bg-cyan-400/10" },
  { id: "docs", label: "Documentation AI", icon: FileText, color: "text-violet-400", border: "border-violet-400/30", bg: "bg-violet-400/10" },
];

const flows = [
  {
    agentId: "front-desk",
    steps: [
      { label: "Patient calls in", icon: Phone },
      { label: "Agent handles intake", icon: Bot },
      { label: "Verified & scheduled", icon: CheckCircle2 },
    ],
    outcome: "Booking confirmed + EHR updated",
    outcomeColor: "text-blue-400",
  },
  {
    agentId: "clinical",
    steps: [
      { label: "Lab results arrive", icon: HeartPulse },
      { label: "Agent reviews & flags", icon: Bot },
      { label: "Provider notified", icon: Zap },
    ],
    outcome: "Care gap closed in real time",
    outcomeColor: "text-red-400",
  },
  {
    agentId: "scheduler",
    steps: [
      { label: "Referral requested", icon: Calendar },
      { label: "Agent finds slot", icon: Bot },
      { label: "Patient confirmation", icon: CheckCircle2 },
    ],
    outcome: "Zero-touch scheduling complete",
    outcomeColor: "text-cyan-400",
  },
  {
    agentId: "docs",
    steps: [
      { label: "Visit concludes", icon: HeartPulse },
      { label: "Agent drafts note", icon: FileText },
      { label: "Provider approves", icon: CheckCircle2 },
    ],
    outcome: "Clinical note signed & filed",
    outcomeColor: "text-violet-400",
  },
];

export default function PlatformDiagram() {
  const [activeAgent, setActiveAgent] = useState("front-desk");
  const [animStep, setAnimStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const activeFlow = flows.find((f) => f.agentId === activeAgent)!;
  const activeAgentData = agents.find((a) => a.id === activeAgent)!;

  // Auto-cycle through steps
  useEffect(() => {
    if (!autoPlay) return;
    const t = setInterval(() => {
      setAnimStep((s) => {
        if (s < activeFlow.steps.length - 1) return s + 1;
        // cycle to next agent after reaching last step
        setTimeout(() => {
          setActiveAgent((prev) => {
            const idx = agents.findIndex((a) => a.id === prev);
            return agents[(idx + 1) % agents.length].id;
          });
          setAnimStep(0);
        }, 1200);
        return s;
      });
    }, 1100);
    return () => clearInterval(t);
  }, [autoPlay, activeFlow.steps.length, activeAgent]);

  const handleSelectAgent = (id: string) => {
    setAutoPlay(false);
    setActiveAgent(id);
    setAnimStep(0);
  };

  return (
    <div className="glass-card rounded-2xl border border-border overflow-hidden animate-fade-up">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-secondary/30">
        <div className="w-3 h-3 rounded-full bg-red-500/60" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
        <div className="w-3 h-3 rounded-full bg-green-500/60" />
        <span className="ml-3 text-xs text-muted-foreground font-mono">OpenClaw · Unified Platform Demo</span>
        <div className="ml-auto flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">PHI Secured</span>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left — Agent selector */}
          <div className="lg:w-56 flex-shrink-0">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-medium">
              Select Agent
            </p>
            <div className="flex lg:flex-col gap-2 flex-wrap">
              {agents.map((agent) => {
                const isActive = agent.id === activeAgent;
                return (
                  <button
                    key={agent.id}
                    onClick={() => handleSelectAgent(agent.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 w-full
                      ${isActive
                        ? `${agent.bg} ${agent.border} ${agent.color} shadow-sm`
                        : "border-border text-muted-foreground hover:bg-secondary/60"
                      }`}
                  >
                    <agent.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? agent.color : ""}`} />
                    <span className="text-xs font-medium leading-tight">{agent.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Security zone badge */}
            <div className="mt-6 p-3 rounded-xl bg-emerald-400/5 border border-emerald-400/15">
              <div className="flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">Zone Isolation</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                All agents operate inside your dedicated PHI security zone.
              </p>
            </div>
          </div>

          {/* Center — Workflow animation */}
          <div className="flex-1 min-w-0">
            {/* Agent header */}
            <div className={`flex items-center gap-3 mb-6 px-4 py-3 rounded-xl border ${activeAgentData.bg} ${activeAgentData.border}`}>
              <activeAgentData.icon className={`w-5 h-5 ${activeAgentData.color}`} />
              <div>
                <p className={`text-sm font-semibold ${activeAgentData.color}`}>{activeAgentData.label}</p>
                <p className="text-xs text-muted-foreground">Live workflow · HIPAA-compliant</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">Active</span>
              </div>
            </div>

            {/* Steps flow */}
            <div className="flex items-center gap-2 sm:gap-3 mb-6 flex-wrap">
              {activeFlow.steps.map((step, i) => {
                const StepIcon = step.icon;
                const isReached = i <= animStep;
                const isCurrent = i === animStep;
                return (
                  <div key={i} className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={`flex flex-col items-center gap-1.5 transition-all duration-500
                        ${isReached ? "opacity-100 scale-100" : "opacity-30 scale-95"}`}
                    >
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center transition-all duration-300
                          ${isCurrent
                            ? `${activeAgentData.bg} ${activeAgentData.border} shadow-lg`
                            : isReached
                            ? "bg-emerald-400/10 border-emerald-400/30"
                            : "bg-secondary/40 border-border"
                          }`}
                      >
                        <StepIcon
                          className={`w-5 h-5 transition-colors duration-300
                            ${isCurrent ? activeAgentData.color : isReached ? "text-emerald-400" : "text-muted-foreground"}`}
                        />
                      </div>
                      <span className="text-[10px] text-center text-muted-foreground leading-tight max-w-[70px]">
                        {step.label}
                      </span>
                    </div>
                    {i < activeFlow.steps.length - 1 && (
                      <ArrowRight
                        className={`w-4 h-4 flex-shrink-0 transition-colors duration-500
                          ${animStep > i ? "text-emerald-400" : "text-muted-foreground/30"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Outcome */}
            <div
              className={`p-4 rounded-xl border transition-all duration-700
                ${animStep === activeFlow.steps.length - 1
                  ? "opacity-100 translate-y-0 bg-emerald-400/5 border-emerald-400/20"
                  : "opacity-0 translate-y-2 border-transparent"
                }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className={`text-sm font-semibold ${activeFlow.outcomeColor}`}>
                  {activeFlow.outcome}
                </span>
              </div>
            </div>

            {/* Data layer */}
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-medium">
                Unified Data Layer
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "EHR Sync", icon: Layers },
                  { label: "PHI Vault", icon: ShieldCheck },
                  { label: "Audit Log", icon: FileText },
                  { label: "Real-time Events", icon: Zap },
                ].map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/50 border border-border text-xs text-muted-foreground"
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom auto-play toggle */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {autoPlay ? "Auto-cycling through agents…" : "Click an agent to explore its workflow"}
          </span>
          <button
            onClick={() => setAutoPlay((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-secondary/60 transition-colors"
          >
            {autoPlay ? "Pause" : "Auto-play"}
          </button>
        </div>
      </div>
    </div>
  );
}
