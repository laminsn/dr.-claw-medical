import { useState } from "react";
import {
  Link2,
  Link,
  MessageSquare,
  Share2,
  ArrowLeftRight,
  Building2,
  Settings,
  Unlink,
  Send,
  Save,
  Check,
  Users,
  UserCheck,
  Shield,
  Lock,
  ShieldAlert,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type PermissionLevel = "full" | "partial" | "none";

type AgentZone = "clinical" | "operations" | "external";

const ZONE_CONFIG: Record<AgentZone, { label: string; shortLabel: string; color: string; bgColor: string }> = {
  clinical: { label: "Zone 1 — Clinical (PHI)", shortLabel: "Clinical", color: "text-red-400", bgColor: "bg-red-500/15 border-red-500/30 text-red-400" },
  operations: { label: "Zone 2 — Operations", shortLabel: "Operations", color: "text-amber-400", bgColor: "bg-amber-500/15 border-amber-500/30 text-amber-400" },
  external: { label: "Zone 3 — External", shortLabel: "External", color: "text-blue-400", bgColor: "bg-blue-500/15 border-blue-500/30 text-blue-400" },
};

interface DataSharing {
  context: boolean;
  documents: boolean;
  analytics: boolean;
  skillInvocation: boolean;
  customerData: boolean;
}

interface Channel {
  id: string;
  agent1Name: string;
  agent2Name: string;
  agent1Zone: AgentZone;
  agent2Zone: AgentZone;
  permission: PermissionLevel;
  enabled: boolean;
  dataSharing: DataSharing;
}

interface LinkedAccount {
  id: string;
  name: string;
  email: string;
  sharedAgents: number;
  status: "active" | "pending";
  permission: PermissionLevel;
}

// ---------------------------------------------------------------------------
// Initial data
// ---------------------------------------------------------------------------
const initialChannels: Channel[] = [
  {
    id: "ch-1",
    agent1Name: "Marketing Maven",
    agent2Name: "Content Engine",
    agent1Zone: "external",
    agent2Zone: "external",
    permission: "full",
    enabled: true,
    dataSharing: { context: true, documents: true, analytics: true, skillInvocation: true, customerData: true },
  },
  {
    id: "ch-2",
    agent1Name: "Dr. Front Desk",
    agent2Name: "Clinical Coordinator",
    agent1Zone: "clinical",
    agent2Zone: "clinical",
    permission: "full",
    enabled: true,
    dataSharing: { context: true, documents: true, analytics: true, skillInvocation: true, customerData: true },
  },
  {
    id: "ch-3",
    agent1Name: "Grant Pro",
    agent2Name: "Financial Analyst",
    agent1Zone: "operations",
    agent2Zone: "operations",
    permission: "partial",
    enabled: true,
    dataSharing: { context: true, documents: true, analytics: true, skillInvocation: false, customerData: false },
  },
  {
    id: "ch-4",
    agent1Name: "Marketing Maven",
    agent2Name: "Grant Pro",
    agent1Zone: "external",
    agent2Zone: "operations",
    permission: "partial",
    enabled: true,
    dataSharing: { context: true, documents: false, analytics: true, skillInvocation: false, customerData: false },
  },
  {
    id: "ch-5",
    agent1Name: "Strategic Advisor",
    agent2Name: "Financial Analyst",
    agent1Zone: "operations",
    agent2Zone: "operations",
    permission: "full",
    enabled: true,
    dataSharing: { context: true, documents: true, analytics: true, skillInvocation: true, customerData: true },
  },
  {
    id: "ch-6",
    agent1Name: "HR Coordinator",
    agent2Name: "Operations Manager",
    agent1Zone: "operations",
    agent2Zone: "operations",
    permission: "partial",
    enabled: false,
    dataSharing: { context: true, documents: true, analytics: false, skillInvocation: false, customerData: false },
  },
];

const initialLinkedAccounts: LinkedAccount[] = [
  {
    id: "la-1",
    name: "Northside Medical Group",
    email: "admin@northsidemedical.com",
    sharedAgents: 4,
    status: "active",
    permission: "full",
  },
  {
    id: "la-2",
    name: "Metro Health Partners",
    email: "ops@metrohealthpartners.com",
    sharedAgents: 2,
    status: "active",
    permission: "partial",
  },
  {
    id: "la-3",
    name: "Sunrise Wellness Center",
    email: "contact@sunrisewellness.org",
    sharedAgents: 0,
    status: "pending",
    permission: "none",
  },
];

const allAgentNames = [
  "Marketing Maven",
  "Content Engine",
  "Dr. Front Desk",
  "Clinical Coordinator",
  "Grant Pro",
  "Financial Analyst",
  "Strategic Advisor",
  "HR Coordinator",
  "Operations Manager",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const permissionBadgeClass: Record<PermissionLevel, string> = {
  full: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  partial: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  none: "bg-red-500/15 text-red-400 border-red-500/30",
};

const permissionLabel: Record<PermissionLevel, string> = {
  full: "Full",
  partial: "Partial",
  none: "None",
};

const statusBadgeClass: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

const isZoneViolation = (zone1: AgentZone, zone2: AgentZone): boolean => {
  // Clinical agents can NEVER talk to External agents
  if ((zone1 === "clinical" && zone2 === "external") || (zone1 === "external" && zone2 === "clinical")) return true;
  return false;
};

const requiresSanitizationGate = (zone1: AgentZone, zone2: AgentZone): boolean => {
  // Clinical to Operations requires sanitization
  if ((zone1 === "clinical" && zone2 === "operations") || (zone1 === "operations" && zone2 === "clinical")) return true;
  return false;
};

const CLINICAL_AGENTS = ["Dr. Front Desk", "Clinical Coordinator"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const AgentCollaboration = () => {
  const { toast } = useToast();

  // Core state
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>(initialLinkedAccounts);

  // Collaboration scoping
  const departments = ["Administration", "Clinical", "Marketing", "Operations", "Billing", "HR", "IT", "Research"];
  const [allowedDepartments, setAllowedDepartments] = useState<string[]>(departments);
  const teammates = ["Dr. Sarah Chen", "James Wilson", "Maria Rodriguez", "Kevin Park", "Lisa Thompson", "Tom Bradley"];
  const [allowedTeammates, setAllowedTeammates] = useState<string[]>(teammates);
  const [scopeMode, setScopeMode] = useState<"all" | "departments" | "teammates">("all");

  // Dialog state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [configureChannel, setConfigureChannel] = useState<Channel | null>(null);
  const [manageAccount, setManageAccount] = useState<LinkedAccount | null>(null);

  // Link account form state
  const [linkForm, setLinkForm] = useState({
    companyName: "",
    contactEmail: "",
    permission: "partial" as PermissionLevel,
    message: "",
  });

  // Configure channel dialog local state
  const [channelEditPermission, setChannelEditPermission] = useState<PermissionLevel>("full");
  const [channelEditDataSharing, setChannelEditDataSharing] = useState<DataSharing>({
    context: true,
    documents: true,
    analytics: true,
    skillInvocation: true,
    customerData: true,
  });

  // Manage account dialog local state
  const [accountEditPermission, setAccountEditPermission] = useState<PermissionLevel>("full");
  const [accountSharedAgentsList, setAccountSharedAgentsList] = useState<
    { name: string; shared: boolean; permission: PermissionLevel }[]
  >([]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleToggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, enabled: !ch.enabled } : ch)),
    );
  };

  const handleOpenConfigureChannel = (channel: Channel) => {
    setChannelEditPermission(channel.permission);
    setChannelEditDataSharing({ ...channel.dataSharing });
    setConfigureChannel(channel);
  };

  const handleSaveChannelConfig = () => {
    if (!configureChannel) return;
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === configureChannel.id
          ? { ...ch, permission: channelEditPermission, dataSharing: { ...channelEditDataSharing } }
          : ch,
      ),
    );
    toast({
      title: "Channel Updated",
      description: `${configureChannel.agent1Name} \u2194 ${configureChannel.agent2Name} configuration saved.`,
    });
    setConfigureChannel(null);
  };

  const handleOpenLinkDialog = () => {
    setLinkForm({ companyName: "", contactEmail: "", permission: "partial", message: "" });
    setLinkDialogOpen(true);
  };

  const handleSendLinkRequest = () => {
    if (!linkForm.companyName.trim() || !linkForm.contactEmail.trim()) return;
    const newAccount: LinkedAccount = {
      id: `la-${Date.now()}`,
      name: linkForm.companyName.trim(),
      email: linkForm.contactEmail.trim(),
      sharedAgents: 0,
      status: "pending",
      permission: linkForm.permission,
    };
    setLinkedAccounts((prev) => [...prev, newAccount]);
    toast({
      title: "Link Request Sent",
      description: `An invitation has been sent to ${linkForm.companyName}.`,
    });
    setLinkDialogOpen(false);
  };

  const handleUnlinkAccount = (id: string) => {
    const account = linkedAccounts.find((a) => a.id === id);
    setLinkedAccounts((prev) => prev.filter((a) => a.id !== id));
    toast({
      title: "Account Unlinked",
      description: `${account?.name ?? "Account"} has been removed.`,
    });
  };

  const handleOpenManageAccount = (account: LinkedAccount) => {
    setAccountEditPermission(account.permission);
    setAccountSharedAgentsList(
      allAgentNames.map((name) => ({
        name,
        shared: false,
        permission: "partial" as PermissionLevel,
      })),
    );
    setManageAccount(account);
  };

  const handleSaveManageAccount = () => {
    if (!manageAccount) return;
    const sharedCount = accountSharedAgentsList.filter((a) => a.shared).length;
    setLinkedAccounts((prev) =>
      prev.map((a) =>
        a.id === manageAccount.id
          ? { ...a, permission: accountEditPermission, sharedAgents: sharedCount }
          : a,
      ),
    );
    toast({
      title: "Account Updated",
      description: `${manageAccount.name} settings have been saved.`,
    });
    setManageAccount(null);
  };

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------
  const statsCards = [
    { label: "Linked Accounts", value: linkedAccounts.length, Icon: Link },
    { label: "Active Channels", value: channels.filter((c) => c.enabled).length, Icon: MessageSquare },
    { label: "Shared Agents", value: linkedAccounts.reduce((s, a) => s + a.sharedAgents, 0), Icon: Share2 },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* ── Header ─────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-heading gradient-hero-text">
                Clinical Agent Collaboration
              </h1>
              <p className="text-muted-foreground mt-1">
                Coordinate care across clinical agents, departments, and partner organizations.
              </p>
            </div>
            <Button
              className="gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity self-start"
              onClick={handleOpenLinkDialog}
            >
              <Link2 className="h-4 w-4 mr-1.5" />
              Link Account
            </Button>
          </div>

          {/* ── Overview Stats ─────────────────────────── */}
          <div className="grid sm:grid-cols-3 gap-5">
            {statsCards.map((stat) => (
              <div
                key={stat.label}
                className="glass-card rounded-2xl p-5 flex items-center gap-4"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                  <stat.Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-heading text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Collaboration Scope ──────────────────────── */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold font-heading text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Collaboration Scope
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Define which departments, accounts, and teammates can collaborate with your agents.
              </p>
            </div>

            {/* Scope Mode Selector */}
            <div className="flex gap-2">
              {([
                { value: "all" as const, label: "All Access", icon: Users, desc: "Everyone can collaborate" },
                { value: "departments" as const, label: "By Department", icon: Building2, desc: "Restrict to specific departments" },
                { value: "teammates" as const, label: "By Teammate", icon: UserCheck, desc: "Restrict to specific people" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setScopeMode(opt.value)}
                  className={`flex-1 rounded-xl border p-4 text-left transition-all ${
                    scopeMode === opt.value
                      ? "border-primary bg-primary/10 shadow-glow-sm"
                      : "border-white/10 bg-white/[0.02] hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <opt.icon className={`h-4 w-4 ${scopeMode === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>

            {/* Department Toggles */}
            {scopeMode === "departments" && (
              <div className="glass-card rounded-xl p-5 space-y-3">
                <p className="text-sm font-medium text-foreground">Allowed Departments</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {departments.map((dept) => {
                    const enabled = allowedDepartments.includes(dept);
                    return (
                      <button
                        key={dept}
                        onClick={() =>
                          setAllowedDepartments((prev) =>
                            enabled ? prev.filter((d) => d !== dept) : [...prev, dept]
                          )
                        }
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                          enabled
                            ? "border-primary/40 bg-primary/10 text-foreground"
                            : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-primary/20"
                        }`}
                      >
                        {enabled && <Check className="h-3 w-3 inline mr-1" />}
                        {dept}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {allowedDepartments.length} of {departments.length} departments can collaborate
                </p>
              </div>
            )}

            {/* Teammate Toggles */}
            {scopeMode === "teammates" && (
              <div className="glass-card rounded-xl p-5 space-y-3">
                <p className="text-sm font-medium text-foreground">Allowed Teammates</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {teammates.map((name) => {
                    const enabled = allowedTeammates.includes(name);
                    return (
                      <button
                        key={name}
                        onClick={() =>
                          setAllowedTeammates((prev) =>
                            enabled ? prev.filter((n) => n !== name) : [...prev, name]
                          )
                        }
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all text-left ${
                          enabled
                            ? "border-primary/40 bg-primary/10 text-foreground"
                            : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-primary/20"
                        }`}
                      >
                        {enabled && <Check className="h-3 w-3 inline mr-1" />}
                        {name}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {allowedTeammates.length} of {teammates.length} teammates can collaborate
                </p>
              </div>
            )}

            {scopeMode === "all" && (
              <div className="glass-card rounded-xl p-5">
                <p className="text-sm text-muted-foreground">
                  All departments and teammates have full collaboration access. Switch to "By Department" or "By Teammate" to restrict scope.
                </p>
              </div>
            )}
          </section>

          {/* ── Zone Isolation Firewall ───────────────────── */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold font-heading text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-400" />
                Agent Isolation Zones
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Hard-walled security zones prevent PHI data from crossing boundaries. Zone 1 agents can never communicate with Zone 3 agents.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {(Object.entries(ZONE_CONFIG) as [AgentZone, typeof ZONE_CONFIG["clinical"]][]).map(([zone, config]) => {
                const zoneAgents = allAgentNames.filter((_, i) => {
                  const zoneMap: Record<string, AgentZone> = {
                    "Marketing Maven": "external", "Content Engine": "external",
                    "Dr. Front Desk": "clinical", "Clinical Coordinator": "clinical",
                    "Grant Pro": "operations", "Financial Analyst": "operations",
                    "Strategic Advisor": "operations", "HR Coordinator": "operations",
                    "Operations Manager": "operations",
                  };
                  return zoneMap[allAgentNames[i]] === zone;
                });
                return (
                  <div key={zone} className={`rounded-xl border p-4 ${zone === "clinical" ? "border-red-500/30 bg-red-500/5" : zone === "operations" ? "border-amber-500/30 bg-amber-500/5" : "border-blue-500/30 bg-blue-500/5"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className={`h-4 w-4 ${config.color}`} />
                      <h3 className={`text-sm font-semibold ${config.color}`}>{config.shortLabel}</h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-3">{config.label}</p>
                    <div className="space-y-1">
                      {zoneAgents.map((name) => (
                        <div key={name} className="flex items-center gap-2 text-xs text-foreground/80">
                          <span className={`h-1.5 w-1.5 rounded-full ${zone === "clinical" ? "bg-red-400" : zone === "operations" ? "bg-amber-400" : "bg-blue-400"}`} />
                          {name}
                        </div>
                      ))}
                    </div>
                    {zone === "clinical" && (
                      <div className="mt-3 pt-3 border-t border-red-500/20">
                        <p className="text-[10px] text-red-400 font-medium flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          No external communication allowed
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Zone Communication Rules */}
            <div className="glass-card rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-400" />
                Zone Communication Rules
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-center">
                  <p className="text-xs font-medium text-green-400 mb-1">Allowed</p>
                  <p className="text-[10px] text-muted-foreground">Same Zone ↔ Same Zone</p>
                </div>
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                  <p className="text-xs font-medium text-amber-400 mb-1">Sanitization Required</p>
                  <p className="text-[10px] text-muted-foreground">Clinical → Operations (de-identified only)</p>
                </div>
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-center">
                  <p className="text-xs font-medium text-red-400 mb-1">Blocked</p>
                  <p className="text-[10px] text-muted-foreground">Clinical ↔ External (never)</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Internal Agent Collaboration ───────────── */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold font-heading text-foreground">
                Internal Agent Communication
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Control how your agents share context, data, and insights with each other.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className={`glass-card card-hover rounded-2xl p-5 flex flex-col gap-3 transition-all ${
                    !channel.enabled ? "opacity-60" : ""
                  }`}
                >
                  {/* Agent pair header */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {channel.agent1Name}
                    </span>
                    <ArrowLeftRight className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm font-semibold text-foreground truncate">
                      {channel.agent2Name}
                    </span>
                  </div>

                  {/* Zone badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className={`text-[9px] ${ZONE_CONFIG[channel.agent1Zone].bgColor}`}>
                      {ZONE_CONFIG[channel.agent1Zone].shortLabel}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">↔</span>
                    <Badge variant="outline" className={`text-[9px] ${ZONE_CONFIG[channel.agent2Zone].bgColor}`}>
                      {ZONE_CONFIG[channel.agent2Zone].shortLabel}
                    </Badge>
                    {isZoneViolation(channel.agent1Zone, channel.agent2Zone) && (
                      <Badge variant="outline" className="text-[9px] bg-red-500/15 border-red-500/30 text-red-400">
                        <ShieldAlert className="h-2.5 w-2.5 mr-0.5" /> BLOCKED
                      </Badge>
                    )}
                    {requiresSanitizationGate(channel.agent1Zone, channel.agent2Zone) && (
                      <Badge variant="outline" className="text-[9px] bg-amber-500/15 border-amber-500/30 text-amber-400">
                        Sanitization Gate
                      </Badge>
                    )}
                  </div>

                  {/* Permission badge */}
                  <div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${permissionBadgeClass[channel.permission]}`}
                    >
                      {permissionLabel[channel.permission]}
                    </Badge>
                  </div>

                  {/* Actions row */}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={channel.enabled}
                        onCheckedChange={() => handleToggleChannel(channel.id)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {channel.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-white/10 hover:bg-white/5"
                      onClick={() => handleOpenConfigureChannel(channel)}
                    >
                      <Settings className="h-3.5 w-3.5 mr-1" />
                      Configure
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Linked Accounts ────────────────────────── */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold font-heading text-foreground">
                Linked Company Accounts
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Connect with partner organizations for operational collaboration. Zone 1 (Clinical) agents are excluded from all cross-organization sharing to protect PHI.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {linkedAccounts.map((account) => (
                <div
                  key={account.id}
                  className="glass-card card-hover rounded-2xl p-5 flex flex-col gap-3 transition-all"
                >
                  {/* Company header */}
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {account.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {account.sharedAgents} shared agent{account.sharedAgents !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${statusBadgeClass[account.status]}`}
                    >
                      {account.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${permissionBadgeClass[account.permission]}`}
                    >
                      {permissionLabel[account.permission]}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-white/10 hover:bg-white/5 flex-1"
                      onClick={() => handleOpenManageAccount(account)}
                    >
                      <Settings className="h-3.5 w-3.5 mr-1" />
                      Manage
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs flex-1"
                      onClick={() => handleUnlinkAccount(account.id)}
                    >
                      <Unlink className="h-3.5 w-3.5 mr-1" />
                      Unlink
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* ── Link Account Dialog ──────────────────────── */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-md glass-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-lg font-heading">Link Account</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Send a collaboration request to a partner organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Company name */}
            <div className="space-y-2">
              <Label htmlFor="link-company" className="text-sm font-medium">
                Company Name or ID
              </Label>
              <Input
                id="link-company"
                placeholder="e.g. Northside Medical Group"
                value={linkForm.companyName}
                onChange={(e) => setLinkForm((f) => ({ ...f, companyName: e.target.value }))}
                className="bg-white/5 border-white/10 focus:border-primary"
              />
            </div>

            {/* Contact email */}
            <div className="space-y-2">
              <Label htmlFor="link-email" className="text-sm font-medium">
                Contact Email
              </Label>
              <Input
                id="link-email"
                type="email"
                placeholder="admin@partner.com"
                value={linkForm.contactEmail}
                onChange={(e) => setLinkForm((f) => ({ ...f, contactEmail: e.target.value }))}
                className="bg-white/5 border-white/10 focus:border-primary"
              />
            </div>

            {/* Permission level */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Default Permission Level</Label>
              <div className="space-y-2">
                {(
                  [
                    {
                      value: "full" as PermissionLevel,
                      title: "Full Access",
                      desc: "Partner's agents can access all your shared agents' data, context, and skills.",
                    },
                    {
                      value: "partial" as PermissionLevel,
                      title: "Partial Access",
                      desc: "Partner's agents receive summaries and outputs only \u2014 no raw data or skill invocation.",
                    },
                    {
                      value: "none" as PermissionLevel,
                      title: "No Access (Pending)",
                      desc: "Link established but no data sharing until manually approved.",
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLinkForm((f) => ({ ...f, permission: opt.value }))}
                    className={`w-full text-left rounded-xl border p-3 transition-all ${
                      linkForm.permission === opt.value
                        ? "border-primary bg-primary/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">{opt.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional message */}
            <div className="space-y-2">
              <Label htmlFor="link-message" className="text-sm font-medium">
                Message (optional)
              </Label>
              <Textarea
                id="link-message"
                placeholder="Add a note to accompany your link request..."
                value={linkForm.message}
                onChange={(e) => setLinkForm((f) => ({ ...f, message: e.target.value }))}
                className="bg-white/5 border-white/10 focus:border-primary resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              className="w-full gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity"
              disabled={!linkForm.companyName.trim() || !linkForm.contactEmail.trim()}
              onClick={handleSendLinkRequest}
            >
              <Send className="h-4 w-4 mr-1.5" />
              Send Link Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Configure Channel Dialog ─────────────────── */}
      <Dialog
        open={!!configureChannel}
        onOpenChange={(open) => {
          if (!open) setConfigureChannel(null);
        }}
      >
        {configureChannel && (
          <DialogContent className="max-w-lg glass-card border-white/10">
            <DialogHeader>
              <DialogTitle className="text-lg font-heading">
                Configure Channel
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {configureChannel.agent1Name} &harr; {configureChannel.agent2Name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 pt-2">
              {/* Permission level selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Permission Level</Label>
                <div className="grid gap-2">
                  {(
                    [
                      {
                        value: "full" as PermissionLevel,
                        title: "Full",
                        desc: "Share all context, data, outputs, and can invoke each other's skills directly.",
                      },
                      {
                        value: "partial" as PermissionLevel,
                        title: "Partial",
                        desc: "Share summaries and final outputs only. No raw data, no skill invocation.",
                      },
                      {
                        value: "none" as PermissionLevel,
                        title: "None",
                        desc: "Agents operate in complete isolation. No data sharing.",
                      },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setChannelEditPermission(opt.value)}
                      className={`w-full text-left rounded-xl border p-3 transition-all ${
                        channelEditPermission === opt.value
                          ? "border-primary bg-primary/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{opt.title}</p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${permissionBadgeClass[opt.value]}`}
                        >
                          {opt.title}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Data sharing toggles */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Data Sharing Options</Label>
                {(
                  [
                    { key: "context" as const, label: "Share conversation context" },
                    { key: "documents" as const, label: "Share generated documents" },
                    { key: "analytics" as const, label: "Share analytics & metrics" },
                    { key: "skillInvocation" as const, label: "Allow skill invocation" },
                    { key: "customerData" as const, label: "Share customer/patient data" },
                  ] as const
                ).map((toggle) => (
                  <div key={toggle.key} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{toggle.label}</span>
                    <Switch
                      checked={channelEditDataSharing[toggle.key]}
                      onCheckedChange={(checked) =>
                        setChannelEditDataSharing((prev) => ({
                          ...prev,
                          [toggle.key]: checked,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                className="w-full gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity"
                onClick={handleSaveChannelConfig}
              >
                <Save className="h-4 w-4 mr-1.5" />
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ── Manage Linked Account Dialog ──────────────── */}
      <Dialog
        open={!!manageAccount}
        onOpenChange={(open) => {
          if (!open) setManageAccount(null);
        }}
      >
        {manageAccount && (
          <DialogContent className="max-w-lg glass-card border-white/10">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-lg font-heading">
                    {manageAccount.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Manage shared agents and permissions for this partner.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 pt-2">
              {/* Default permission level */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Default Permission Level</Label>
                <div className="grid gap-2">
                  {(
                    [
                      { value: "full" as PermissionLevel, title: "Full" },
                      { value: "partial" as PermissionLevel, title: "Partial" },
                      { value: "none" as PermissionLevel, title: "None" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAccountEditPermission(opt.value)}
                      className={`w-full text-left rounded-xl border p-3 transition-all ${
                        accountEditPermission === opt.value
                          ? "border-primary bg-primary/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{opt.title}</p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${permissionBadgeClass[opt.value]}`}
                        >
                          {opt.title}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Shared agents list */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Shared Agents</Label>
                <p className="text-xs text-muted-foreground">
                  Select which agents to share with {manageAccount.name} and set individual permissions.
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {accountSharedAgentsList.map((agent, idx) => (
                    <div
                      key={agent.name}
                      className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                        CLINICAL_AGENTS.includes(agent.name)
                          ? "border-red-500/20 bg-red-500/5"
                          : agent.shared
                          ? "border-primary/30 bg-primary/5"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      {CLINICAL_AGENTS.includes(agent.name) ? (
                        <div className="flex items-center gap-3 opacity-50">
                          <Lock className="h-4 w-4 text-red-400" />
                          <span className="text-sm text-foreground">{agent.name}</span>
                          <Badge variant="outline" className="text-[9px] bg-red-500/15 border-red-500/30 text-red-400">Zone 1 — Locked</Badge>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={agent.shared}
                              onCheckedChange={(checked) => {
                                setAccountSharedAgentsList((prev) =>
                                  prev.map((a, i) =>
                                    i === idx ? { ...a, shared: !!checked } : a,
                                  ),
                                );
                              }}
                            />
                            <span className="text-sm text-foreground">{agent.name}</span>
                          </div>
                          {agent.shared && (
                            <div className="flex items-center gap-1">
                              {(["full", "partial", "none"] as PermissionLevel[]).map((perm) => (
                                <button
                                  key={perm}
                                  type="button"
                                  onClick={() => {
                                    setAccountSharedAgentsList((prev) =>
                                      prev.map((a, i) =>
                                        i === idx ? { ...a, permission: perm } : a,
                                      ),
                                    );
                                  }}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize transition-all ${
                                    agent.permission === perm
                                      ? permissionBadgeClass[perm]
                                      : "text-muted-foreground hover:bg-white/10"
                                  }`}
                                >
                                  {perm}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                className="w-full gradient-primary text-white shadow-glow-sm hover:opacity-90 transition-opacity"
                onClick={handleSaveManageAccount}
              >
                <Check className="h-4 w-4 mr-1.5" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default AgentCollaboration;
