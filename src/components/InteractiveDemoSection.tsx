import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Bot, Brain, Shield, Activity, MessageSquare, Zap } from "lucide-react";

const DemoDashboard = () => (
  <div className="h-full w-full bg-gradient-to-br from-background to-muted/30 p-4 md:p-8 flex flex-col gap-4">
    {/* Top bar */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-destructive/80" />
        <div className="h-3 w-3 rounded-full bg-primary/60" />
        <div className="h-3 w-3 rounded-full bg-accent-foreground/40" />
      </div>
      <span className="text-xs text-muted-foreground font-mono">dr-claw-command-station v2.0</span>
    </div>

    {/* Grid */}
    <div className="grid grid-cols-3 gap-3 flex-1">
      {/* Agent card */}
      <div className="col-span-2 rounded-xl bg-card border border-border p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Bot className="h-4 w-4 text-primary" />
          Active Agents
        </div>
        <div className="grid grid-cols-3 gap-2 flex-1">
          {["Scheduler", "Billing", "Triage"].map((name) => (
            <div
              key={name}
              className="rounded-lg bg-primary/10 border border-primary/20 p-3 flex flex-col items-center justify-center gap-1"
            >
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">{name}</span>
              <span className="text-[10px] text-primary">● Online</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats sidebar */}
      <div className="flex flex-col gap-3">
        {[
          { icon: Brain, label: "Tasks Done", value: "1,247" },
          { icon: Shield, label: "HIPAA Score", value: "98%" },
          { icon: Activity, label: "Uptime", value: "99.9%" },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-xl bg-card border border-border p-3 flex items-center gap-3 flex-1"
          >
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">{label}</p>
              <p className="text-sm font-bold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Chat bar */}
    <div className="rounded-xl bg-card border border-border p-3 flex items-center gap-3">
      <MessageSquare className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Ask your AI agents anything...</span>
      <div className="ml-auto px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
        Send
      </div>
    </div>
  </div>
);

export default function InteractiveDemoSection() {
  return (
    <section className="overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Interactive Demo
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Your AI Command Center, <br />
              <span className="text-primary">Right at Your Fingertips</span>
            </h2>
            <p className="text-muted-foreground max-w-xl text-base md:text-lg">
              Manage agents, monitor compliance, and automate workflows — all from a single intelligent dashboard.
            </p>
          </div>
        }
      >
        <DemoDashboard />
      </ContainerScroll>
    </section>
  );
}
