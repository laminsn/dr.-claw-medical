import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Key,
  Activity,
  Webhook,
  Clock,
  Eye,
  EyeOff,
  Copy,
  Plus,
  ChevronDown,
  ChevronRight,
  Send,
  Trash2,
  Play,
  Shield,
  Gauge,
  Code2,
  Globe,
  Zap,
  MessageSquare,
  Bot,
  ListTodo,
  Loader2,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  maskedKey: string;
  created: string;
  lastUsed: string;
  status: "Active" | "Revoked";
}

interface Endpoint {
  method: HttpMethod;
  path: string;
  description: string;
  exampleBody?: string;
}

interface EndpointGroup {
  name: string;
  icon: typeof Bot;
  endpoints: Endpoint[];
}

interface WebhookEntry {
  id: string;
  event: string;
  url: string;
  active: boolean;
  deliveries: number;
  lastTriggered: string;
}

// ---------------------------------------------------------------------------
// Constants / Mock Data
// ---------------------------------------------------------------------------
const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-green-500/15 text-green-400 border-green-500/30",
  POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  PATCH: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
};

const mockResponses: Record<string, object> = {
  "GET /api/v1/agents": {
    data: [
      { id: "agent-1", name: "Dr. Front Desk", type: "medical", status: "active", skills: ["scheduling", "triage"] },
      { id: "agent-2", name: "Marketing Maven", type: "marketing", status: "active", skills: ["content", "campaigns"] },
    ],
    meta: { total: 2, page: 1, perPage: 20 },
  },
  "POST /api/v1/agents": {
    data: { id: "agent-3", name: "New Agent", type: "medical", status: "active", skills: ["scheduling", "triage"], createdAt: "2026-02-16T10:30:00Z" },
  },
  "GET /api/v1/agents/:id": {
    data: { id: "agent-1", name: "Dr. Front Desk", type: "medical", status: "active", skills: ["scheduling", "triage"], tasksCompleted: 847, uptime: "99.9%" },
  },
  "DELETE /api/v1/agents/:id": { success: true, message: "Agent deleted successfully" },
  "GET /api/v1/tasks": {
    data: [
      { id: "task-1", title: "Follow-up calls", agentId: "agent-1", status: "in_progress", progress: 60 },
      { id: "task-2", title: "Campaign generation", agentId: "agent-2", status: "completed", progress: 100 },
    ],
    meta: { total: 2, page: 1, perPage: 20 },
  },
  "POST /api/v1/tasks": {
    data: { id: "task-3", title: "Follow-up calls", agentId: "agent-1", priority: "high", status: "pending", createdAt: "2026-02-16T10:30:00Z" },
  },
  "PATCH /api/v1/tasks/:id": {
    data: { id: "task-1", title: "Follow-up calls", status: "completed", progress: 100, updatedAt: "2026-02-16T10:30:00Z" },
  },
  "GET /api/v1/skills": {
    data: [
      { id: "skill-scheduling", name: "Appointment Scheduling", category: "medical" },
      { id: "skill-triage", name: "Patient Triage", category: "medical" },
      { id: "skill-content", name: "Content Generation", category: "marketing" },
    ],
  },
  "POST /api/v1/agents/:id/skills": {
    data: { agentId: "agent-1", skillId: "skill-scheduling", config: { maxSlots: 20 }, assignedAt: "2026-02-16T10:30:00Z" },
  },
  "POST /api/v1/messages/send": {
    data: { messageId: "msg-123", to: "+15551234567", channel: "sms", status: "sent", sentAt: "2026-02-16T10:30:00Z" },
  },
  "GET /api/v1/messages": {
    data: [
      { id: "msg-1", from: "+15551234567", body: "Yes, confirmed", channel: "sms", receivedAt: "2026-02-16T10:25:00Z" },
      { id: "msg-2", to: "+15559876543", body: "Your appointment is tomorrow at 3 PM", channel: "sms", sentAt: "2026-02-16T10:20:00Z" },
    ],
    meta: { total: 2, page: 1, perPage: 20 },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const ApiPortal = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  // API Keys state
  const initialApiKeys: ApiKey[] = [
    {
      id: "key-1",
      name: t("apiPortal.productionKey"),
      key: "pk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      maskedKey: "pk_live_xxxx...xxxx",
      created: "Jan 15, 2026",
      lastUsed: t("apiPortal.twoMinAgo"),
      status: "Active",
    },
    {
      id: "key-2",
      name: t("apiPortal.stagingKey"),
      key: "pk_test_q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
      maskedKey: "pk_test_xxxx...xxxx",
      created: "Dec 1, 2025",
      lastUsed: t("apiPortal.oneHrAgo"),
      status: "Active",
    },
    {
      id: "key-3",
      name: t("apiPortal.developmentKey"),
      key: "pk_dev_g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8",
      maskedKey: "pk_dev_xxxx...xxxx",
      created: "Nov 20, 2025",
      lastUsed: t("apiPortal.threeDaysAgo"),
      status: "Active",
    },
  ];

  const endpointGroups: EndpointGroup[] = [
    {
      name: t("apiPortal.agents"),
      icon: Bot,
      endpoints: [
        { method: "GET", path: "/api/v1/agents", description: t("apiPortal.listAllAgents") },
        {
          method: "POST",
          path: "/api/v1/agents",
          description: t("apiPortal.createAgent"),
          exampleBody: JSON.stringify(
            { name: "New Agent", type: "medical", skills: ["scheduling", "triage"] },
            null,
            2,
          ),
        },
        { method: "GET", path: "/api/v1/agents/:id", description: t("apiPortal.getAgentDetails") },
        { method: "DELETE", path: "/api/v1/agents/:id", description: t("apiPortal.deleteAgent") },
      ],
    },
    {
      name: t("apiPortal.tasks"),
      icon: ListTodo,
      endpoints: [
        { method: "GET", path: "/api/v1/tasks", description: t("apiPortal.listTasks") },
        {
          method: "POST",
          path: "/api/v1/tasks",
          description: t("apiPortal.createTask"),
          exampleBody: JSON.stringify(
            { title: "Follow-up calls", agentId: "agent-1", priority: "high", dueDate: "2026-02-20" },
            null,
            2,
          ),
        },
        {
          method: "PATCH",
          path: "/api/v1/tasks/:id",
          description: t("apiPortal.updateTask"),
          exampleBody: JSON.stringify({ status: "completed", progress: 100 }, null, 2),
        },
      ],
    },
    {
      name: t("apiPortal.skills"),
      icon: Zap,
      endpoints: [
        { method: "GET", path: "/api/v1/skills", description: t("apiPortal.listAvailableSkills") },
        {
          method: "POST",
          path: "/api/v1/agents/:id/skills",
          description: t("apiPortal.assignSkill"),
          exampleBody: JSON.stringify({ skillId: "skill-scheduling", config: { maxSlots: 20 } }, null, 2),
        },
      ],
    },
    {
      name: t("apiPortal.communication"),
      icon: MessageSquare,
      endpoints: [
        {
          method: "POST",
          path: "/api/v1/messages/send",
          description: t("apiPortal.sendMessage"),
          exampleBody: JSON.stringify(
            { to: "+15551234567", channel: "sms", body: "Your appointment is confirmed." },
            null,
            2,
          ),
        },
        { method: "GET", path: "/api/v1/messages", description: t("apiPortal.getMessages") },
      ],
    },
  ];

  const initialWebhooks: WebhookEntry[] = [
    { id: "wh-1", event: t("apiPortal.eventTaskCompleted"), url: "https://api.example.com/webhooks/tasks", active: true, deliveries: 1234, lastTriggered: t("apiPortal.twoMinAgo") },
    { id: "wh-2", event: t("apiPortal.eventAgentError"), url: "https://api.example.com/webhooks/errors", active: true, deliveries: 23, lastTriggered: t("apiPortal.oneHrAgo") },
    { id: "wh-3", event: t("apiPortal.eventPhiAlert"), url: "https://api.example.com/webhooks/phi", active: true, deliveries: 5, lastTriggered: t("apiPortal.threeHrsAgo") },
    { id: "wh-4", event: t("apiPortal.eventNewMessage"), url: "https://api.example.com/webhooks/messages", active: false, deliveries: 567, lastTriggered: t("apiPortal.oneDayAgo") },
    { id: "wh-5", event: t("apiPortal.eventWorkflowComplete"), url: "https://api.example.com/webhooks/workflows", active: true, deliveries: 89, lastTriggered: t("apiPortal.thirtyMinAgo") },
  ];

  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyEnv, setNewKeyEnv] = useState("production");
  const [newKeyPermissions, setNewKeyPermissions] = useState<Record<string, boolean>>({
    read: true,
    write: false,
    delete: false,
    admin: false,
  });

  // Endpoint reference state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // API Playground state
  const [playgroundMethod, setPlaygroundMethod] = useState<HttpMethod>("GET");
  const [playgroundUrl, setPlaygroundUrl] = useState("https://api.drclaw.com/api/v1/agents");
  const [playgroundHeaders, setPlaygroundHeaders] = useState([
    { key: "Authorization", value: "Bearer pk_live_xxxx...xxxx" },
    { key: "Content-Type", value: "application/json" },
  ]);
  const [playgroundBody, setPlaygroundBody] = useState("");
  const [playgroundResponse, setPlaygroundResponse] = useState<string | null>(null);
  const [playgroundStatus, setPlaygroundStatus] = useState<number | null>(null);
  const [playgroundTime, setPlaygroundTime] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Webhooks state
  const [webhooks, setWebhooks] = useState<WebhookEntry[]>(initialWebhooks);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [newWebhookEvent, setNewWebhookEvent] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyKey = (key: ApiKey) => {
    navigator.clipboard?.writeText(key.key);
    toast({ title: t("apiPortal.apiKeyCopied"), description: t("apiPortal.apiKeyCopiedDesc", { name: key.name }) });
  };

  const revokeKey = (keyId: string) => {
    setApiKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, status: "Revoked" as const } : k)));
    toast({ title: t("apiPortal.apiKeyRevoked"), description: t("apiPortal.apiKeyRevokedDesc") });
  };

  const generateNewKey = () => {
    if (!newKeyName.trim()) {
      toast({ title: t("apiPortal.error"), description: t("apiPortal.enterKeyName") });
      return;
    }
    const prefix = newKeyEnv === "production" ? "pk_live" : newKeyEnv === "staging" ? "pk_test" : "pk_dev";
    const randomSuffix = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      key: `${prefix}_${randomSuffix}`,
      maskedKey: `${prefix}_xxxx...xxxx`,
      created: "Feb 16, 2026",
      lastUsed: t("apiPortal.never"),
      status: "Active",
    };
    setApiKeys((prev) => [...prev, newKey]);
    setShowNewKeyDialog(false);
    setNewKeyName("");
    setNewKeyEnv("production");
    setNewKeyPermissions({ read: true, write: false, delete: false, admin: false });
    toast({ title: t("apiPortal.apiKeyGenerated"), description: t("apiPortal.apiKeyGeneratedDesc", { name: newKey.name }) });
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const loadEndpointInPlayground = (endpoint: Endpoint) => {
    setPlaygroundMethod(endpoint.method);
    setPlaygroundUrl(`https://api.drclaw.com${endpoint.path}`);
    setPlaygroundBody(endpoint.exampleBody || "");
    setPlaygroundResponse(null);
    setPlaygroundStatus(null);
    setPlaygroundTime(null);
    toast({ title: t("apiPortal.endpointLoaded"), description: t("apiPortal.endpointLoadedDesc", { method: endpoint.method, path: endpoint.path }) });
  };

  const sendPlaygroundRequest = () => {
    setIsSending(true);
    setPlaygroundResponse(null);
    setPlaygroundStatus(null);
    setPlaygroundTime(null);

    // Simulate API call
    const delay = Math.floor(Math.random() * 200) + 80;
    setTimeout(() => {
      const urlPath = playgroundUrl.replace("https://api.drclaw.com", "");
      const lookupKey = `${playgroundMethod} ${urlPath}`;
      const response = mockResponses[lookupKey];

      if (response) {
        setPlaygroundResponse(JSON.stringify(response, null, 2));
        setPlaygroundStatus(playgroundMethod === "POST" ? 201 : 200);
      } else {
        setPlaygroundResponse(JSON.stringify({ error: "Not Found", message: `No mock data for ${playgroundMethod} ${urlPath}` }, null, 2));
        setPlaygroundStatus(404);
      }
      setPlaygroundTime(delay);
      setIsSending(false);
      toast({ title: t("apiPortal.requestComplete"), description: t("apiPortal.requestCompleteDesc", { delay: String(delay) }) });
    }, delay);
  };

  const toggleWebhook = (webhookId: string) => {
    setWebhooks((prev) =>
      prev.map((wh) => {
        if (wh.id === webhookId) {
          const newActive = !wh.active;
          toast({
            title: newActive ? t("apiPortal.webhookEnabled") : t("apiPortal.webhookPaused"),
            description: t("apiPortal.webhookToggleDesc", { event: wh.event, status: newActive ? t("apiPortal.enabled") : t("apiPortal.paused") }),
          });
          return { ...wh, active: newActive };
        }
        return wh;
      }),
    );
  };

  const addWebhook = () => {
    if (!newWebhookEvent.trim() || !newWebhookUrl.trim()) {
      toast({ title: t("apiPortal.error"), description: t("apiPortal.fillAllFields") });
      return;
    }
    const newWh: WebhookEntry = {
      id: `wh-${Date.now()}`,
      event: newWebhookEvent,
      url: newWebhookUrl,
      active: true,
      deliveries: 0,
      lastTriggered: t("apiPortal.never"),
    };
    setWebhooks((prev) => [...prev, newWh]);
    setShowWebhookDialog(false);
    setNewWebhookEvent("");
    setNewWebhookUrl("");
    toast({ title: t("apiPortal.webhookAdded"), description: t("apiPortal.webhookAddedDesc", { event: newWh.event }) });
  };

  const updatePlaygroundHeader = (index: number, field: "key" | "value", val: string) => {
    setPlaygroundHeaders((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: val } : h)));
  };

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------
  const stats = [
    { label: t("apiPortal.totalApiCalls"), value: "28,500", icon: Activity, color: "from-primary to-blue-600" },
    { label: t("apiPortal.activeApiKeys"), value: "3", icon: Key, color: "from-emerald-500 to-green-600" },
    { label: t("apiPortal.webhooksActive"), value: "5", icon: Webhook, color: "from-violet-500 to-purple-600" },
    { label: t("apiPortal.avgLatency"), value: "142ms", icon: Clock, color: "from-amber-500 to-orange-600" },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold font-heading gradient-hero-text">{t("apiPortal.title")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("apiPortal.subtitle")}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <div className={`flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} shadow-glow-sm`}>
                      <StatIcon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* API Keys Management */}
          <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">{t("apiPortal.apiKeysManagement")}</h2>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setShowNewKeyDialog(true)}>
                <Plus className="h-4 w-4" />
                {t("apiPortal.generateNewKey")}
              </Button>
            </div>
            <Separator className="mb-4" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-white/[0.06]">
                    <th className="pb-3 pr-4">{t("apiPortal.name")}</th>
                    <th className="pb-3 pr-4">{t("apiPortal.key")}</th>
                    <th className="pb-3 pr-4">{t("apiPortal.created")}</th>
                    <th className="pb-3 pr-4">{t("apiPortal.lastUsed")}</th>
                    <th className="pb-3 pr-4">{t("apiPortal.status")}</th>
                    <th className="pb-3 text-right">{t("apiPortal.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((apiKey) => (
                    <tr key={apiKey.id} className="border-b border-white/[0.04] last:border-0">
                      <td className="py-3 pr-4 font-medium text-foreground">{apiKey.name}</td>
                      <td className="py-3 pr-4">
                        <code className="text-xs bg-white/[0.04] px-2 py-1 rounded font-mono text-muted-foreground">
                          {visibleKeys[apiKey.id] ? apiKey.key : apiKey.maskedKey}
                        </code>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{apiKey.created}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{apiKey.lastUsed}</td>
                      <td className="py-3 pr-4">
                        <Badge
                          className={
                            apiKey.status === "Active"
                              ? "bg-green-500/15 text-green-400 border-green-500/30"
                              : "bg-red-500/15 text-red-400 border-red-500/30"
                          }
                          variant="outline"
                        >
                          {apiKey.status === "Active" ? t("apiPortal.active") : t("apiPortal.revoked")}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {visibleKeys[apiKey.id] ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => copyKey(apiKey)}
                          >
                            <Copy className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:text-red-400"
                            onClick={() => revokeKey(apiKey.id)}
                            disabled={apiKey.status === "Revoked"}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Generate New Key Dialog */}
          <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
            <DialogContent className="bg-card border-white/[0.06]">
              <DialogHeader>
                <DialogTitle>{t("apiPortal.generateNewApiKey")}</DialogTitle>
                <DialogDescription>{t("apiPortal.generateNewApiKeyDesc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>{t("apiPortal.keyName")}</Label>
                  <Input
                    placeholder={t("apiPortal.keyNamePlaceholder")}
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="bg-white/[0.03] border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("apiPortal.environment")}</Label>
                  <Select value={newKeyEnv} onValueChange={setNewKeyEnv}>
                    <SelectTrigger className="bg-white/[0.03] border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">{t("apiPortal.production")}</SelectItem>
                      <SelectItem value="staging">{t("apiPortal.staging")}</SelectItem>
                      <SelectItem value="development">{t("apiPortal.development")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>{t("apiPortal.permissions")}</Label>
                  {Object.entries(newKeyPermissions).map(([perm, checked]) => (
                    <div key={perm} className="flex items-center gap-2">
                      <Checkbox
                        id={`perm-${perm}`}
                        checked={checked}
                        onCheckedChange={(val) =>
                          setNewKeyPermissions((prev) => ({ ...prev, [perm]: !!val }))
                        }
                      />
                      <Label htmlFor={`perm-${perm}`} className="capitalize text-sm text-muted-foreground">
                        {t(`apiPortal.perm${perm.charAt(0).toUpperCase() + perm.slice(1)}`)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewKeyDialog(false)}>
                  {t("apiPortal.cancel")}
                </Button>
                <Button onClick={generateNewKey}>{t("apiPortal.generateKey")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* API Endpoints Reference */}
          <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{t("apiPortal.apiEndpointsReference")}</h2>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-2">
              {endpointGroups.map((group) => {
                const GroupIcon = group.icon;
                const isExpanded = expandedGroups[group.name] || false;
                return (
                  <div key={group.name} className="border border-white/[0.06] rounded-lg overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                      onClick={() => toggleGroup(group.name)}
                    >
                      <div className="flex items-center gap-3">
                        <GroupIcon className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">{group.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {`${group.endpoints.length} endpoints`}
                        </Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="border-t border-white/[0.06]">
                        {group.endpoints.map((endpoint, idx) => (
                          <div
                            key={`${endpoint.method}-${endpoint.path}`}
                            className={`flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors ${
                              idx < group.endpoints.length - 1 ? "border-b border-white/[0.04]" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className={`${METHOD_COLORS[endpoint.method]} font-mono text-xs min-w-[60px] justify-center`}
                              >
                                {endpoint.method}
                              </Badge>
                              <code className="text-sm font-mono text-foreground/80">{endpoint.path}</code>
                              <span className="text-sm text-muted-foreground hidden sm:inline">
                                — {endpoint.description}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-xs text-primary hover:text-primary"
                              onClick={() => loadEndpointInPlayground(endpoint)}
                            >
                              <Play className="h-3 w-3" />
                              {t("apiPortal.tryIt")}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* API Playground */}
          <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{t("apiPortal.apiPlayground")}</h2>
            </div>
            <Separator className="mb-4" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Request Panel */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Select value={playgroundMethod} onValueChange={(val) => setPlaygroundMethod(val as HttpMethod)}>
                    <SelectTrigger className="w-[120px] bg-white/[0.03] border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={playgroundUrl}
                    onChange={(e) => setPlaygroundUrl(e.target.value)}
                    placeholder="https://api.drclaw.com/api/v1/..."
                    className="flex-1 bg-white/[0.03] border-white/10 font-mono text-sm"
                  />
                </div>

                {/* Headers */}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t("apiPortal.headers")}</Label>
                  <div className="mt-2 space-y-2">
                    {playgroundHeaders.map((header, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={header.key}
                          onChange={(e) => updatePlaygroundHeader(idx, "key", e.target.value)}
                          placeholder={t("apiPortal.headerKey")}
                          className="w-1/3 bg-white/[0.03] border-white/10 text-xs"
                        />
                        <Input
                          value={header.value}
                          onChange={(e) => updatePlaygroundHeader(idx, "value", e.target.value)}
                          placeholder={t("apiPortal.headerValue")}
                          className="flex-1 bg-white/[0.03] border-white/10 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Body */}
                {(playgroundMethod === "POST" || playgroundMethod === "PATCH") && (
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t("apiPortal.requestBody")}</Label>
                    <Textarea
                      value={playgroundBody}
                      onChange={(e) => setPlaygroundBody(e.target.value)}
                      placeholder='{"key": "value"}'
                      className="mt-2 bg-white/[0.03] border-white/10 font-mono text-xs min-h-[120px]"
                    />
                  </div>
                )}

                <Button className="w-full gap-2" onClick={sendPlaygroundRequest} disabled={isSending}>
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("apiPortal.sending")}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t("apiPortal.sendRequest")}
                    </>
                  )}
                </Button>
              </div>

              {/* Response Panel */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">{t("apiPortal.response")}</Label>
                  {playgroundStatus !== null && (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          playgroundStatus < 300
                            ? "bg-green-500/15 text-green-400 border-green-500/30"
                            : "bg-red-500/15 text-red-400 border-red-500/30"
                        }
                      >
                        {playgroundStatus}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{playgroundTime}ms</span>
                    </div>
                  )}
                </div>
                <div className="bg-black/30 border border-white/[0.06] rounded-lg p-4 min-h-[280px] overflow-auto">
                  {playgroundResponse ? (
                    <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap">{playgroundResponse}</pre>
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[250px] text-muted-foreground text-sm">
                      <div className="text-center">
                        <Code2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>{t("apiPortal.sendRequestToSeeResponse")}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Webhooks */}
          <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">{t("apiPortal.webhooks")}</h2>
              </div>
              <Button size="sm" className="gap-2" onClick={() => setShowWebhookDialog(true)}>
                <Plus className="h-4 w-4" />
                {t("apiPortal.addWebhook")}
              </Button>
            </div>
            <Separator className="mb-4" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-white/[0.06]">
                    <th className="pb-3 pr-4">{t("apiPortal.event")}</th>
                    <th className="pb-3 pr-4">{t("apiPortal.url")}</th>
                    <th className="pb-3 pr-4">{t("apiPortal.status")}</th>
                    <th className="pb-3 pr-4">{t("apiPortal.deliveries")}</th>
                    <th className="pb-3">{t("apiPortal.lastTriggered")}</th>
                  </tr>
                </thead>
                <tbody>
                  {webhooks.map((wh) => (
                    <tr key={wh.id} className="border-b border-white/[0.04] last:border-0">
                      <td className="py-3 pr-4 font-medium text-foreground">{wh.event}</td>
                      <td className="py-3 pr-4">
                        <code className="text-xs bg-white/[0.04] px-2 py-1 rounded font-mono text-muted-foreground">
                          {wh.url}
                        </code>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={wh.active}
                            onCheckedChange={() => toggleWebhook(wh.id)}
                          />
                          <span className={`text-xs ${wh.active ? "text-green-400" : "text-muted-foreground"}`}>
                            {wh.active ? t("apiPortal.active") : t("apiPortal.paused")}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {wh.deliveries.toLocaleString()}
                      </td>
                      <td className="py-3 text-muted-foreground">{wh.lastTriggered}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Webhook Dialog */}
          <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
            <DialogContent className="bg-card border-white/[0.06]">
              <DialogHeader>
                <DialogTitle>{t("apiPortal.addWebhook")}</DialogTitle>
                <DialogDescription>{t("apiPortal.addWebhookDesc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>{t("apiPortal.eventType")}</Label>
                  <Select value={newWebhookEvent} onValueChange={setNewWebhookEvent}>
                    <SelectTrigger className="bg-white/[0.03] border-white/10">
                      <SelectValue placeholder={t("apiPortal.selectAnEvent")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Task Completed">{t("apiPortal.eventTaskCompleted")}</SelectItem>
                      <SelectItem value="Task Failed">{t("apiPortal.eventTaskFailed")}</SelectItem>
                      <SelectItem value="Agent Error">{t("apiPortal.eventAgentError")}</SelectItem>
                      <SelectItem value="Agent Started">{t("apiPortal.eventAgentStarted")}</SelectItem>
                      <SelectItem value="PHI Alert">{t("apiPortal.eventPhiAlert")}</SelectItem>
                      <SelectItem value="New Message">{t("apiPortal.eventNewMessage")}</SelectItem>
                      <SelectItem value="Workflow Complete">{t("apiPortal.eventWorkflowComplete")}</SelectItem>
                      <SelectItem value="Skill Assigned">{t("apiPortal.eventSkillAssigned")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("apiPortal.webhookUrl")}</Label>
                  <Input
                    placeholder={t("apiPortal.webhookUrlPlaceholder")}
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    className="bg-white/[0.03] border-white/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>
                  {t("apiPortal.cancel")}
                </Button>
                <Button onClick={addWebhook}>{t("apiPortal.addWebhook")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Rate Limits & Usage */}
          <div className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover">
            <div className="flex items-center gap-2 mb-4">
              <Gauge className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{t("apiPortal.rateLimitsAndUsage")}</h2>
            </div>
            <Separator className="mb-4" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rate Limit & Monthly Usage */}
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-glow-sm">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{t("apiPortal.currentRateLimit")}</p>
                      <p className="text-xs text-muted-foreground">{t("apiPortal.requestsPerMinute")}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-foreground">1,000</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{t("apiPortal.monthlyApiCalls")}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="text-foreground font-semibold">28,500</span> / 50,000
                    </p>
                  </div>
                  <Progress value={57} className="h-3" />
                  <p className="text-xs text-muted-foreground">{t("apiPortal.monthlyQuotaUsed")}</p>
                </div>
              </div>

              {/* Endpoint Breakdown */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground mb-3">{t("apiPortal.usageByEndpoint")}</p>
                {[
                  { name: t("apiPortal.agents"), calls: 12300, percentage: 43.2, color: "bg-blue-500" },
                  { name: t("apiPortal.tasks"), calls: 8200, percentage: 28.8, color: "bg-emerald-500" },
                  { name: t("apiPortal.messages"), calls: 5100, percentage: 17.9, color: "bg-violet-500" },
                  { name: t("apiPortal.skills"), calls: 2900, percentage: 10.2, color: "bg-amber-500" },
                ].map((ep) => (
                  <div key={ep.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{ep.name}</span>
                      <span className="text-foreground font-medium">{ep.calls.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${ep.color} rounded-full transition-all`}
                        style={{ width: `${ep.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiPortal;
