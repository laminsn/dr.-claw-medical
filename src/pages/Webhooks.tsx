import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Webhook as WebhookIcon,
  Plus,
  Play,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Send,
  Shield,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings2,
  RotateCcw,
  ExternalLink,
  Search,
  Filter,
  CopyPlus,
  LayoutTemplate,
  ArrowLeft,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
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
import { useWebhooks } from "@/hooks/useWebhooks";
import {
  WEBHOOK_EVENT_CATEGORIES,
  ALL_WEBHOOK_EVENTS,
  WEBHOOK_TEMPLATES,
  WEBHOOK_TEMPLATE_CATEGORIES,
  getEventById,
  getStatusColor,
  getHttpStatusColor,
  type Webhook,
  type WebhookDelivery,
  type WebhookCreateInput,
  type WebhookTemplate,
} from "@/lib/webhooks";
import type { SecurityZone } from "@/lib/security";

/* ── Tabs ────────────────────────────────────────────────────────────── */

type TabId = "endpoints" | "deliveries" | "events";

/* ── Component ──────────────────────────────────────────────────────── */

const Webhooks = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const {
    webhooks,
    deliveries,
    loading,
    deliveriesLoading,
    fetchWebhooks,
    createWebhook,
    updateWebhook,
    toggleWebhook,
    deleteWebhook,
    regenerateSecret,
    fetchDeliveries,
    testWebhook,
  } = useWebhooks();

  const [activeTab, setActiveTab] = useState<TabId>("endpoints");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [showSecretDialog, setShowSecretDialog] = useState<Webhook | null>(null);
  const [showDeliveryDetail, setShowDeliveryDetail] = useState<WebhookDelivery | null>(null);
  const [selectedWebhookFilter, setSelectedWebhookFilter] = useState<string>("all");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<string>("all");
  const [deliverySearch, setDeliverySearch] = useState("");
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  // Create form state
  const [formName, setFormName] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formZone, setFormZone] = useState<SecurityZone>("external");
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [formPhiFilter, setFormPhiFilter] = useState(true);
  const [formTimeout, setFormTimeout] = useState(10000);
  const [formMaxRetries, setFormMaxRetries] = useState(3);
  const [showTemplatePicker, setShowTemplatePicker] = useState(true);
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>("all");

  // Load deliveries when tab changes
  useEffect(() => {
    if (activeTab === "deliveries") {
      fetchDeliveries(selectedWebhookFilter === "all" ? undefined : selectedWebhookFilter);
    }
  }, [activeTab, selectedWebhookFilter, fetchDeliveries]);

  /* ── Handlers ──────────────────────────────────────────────────────── */

  const handleCreate = async () => {
    if (!formName.trim() || !formUrl.trim()) {
      toast({ title: t("webhooks.error"), description: t("webhooks.fillRequired") });
      return;
    }
    if (formEvents.length === 0) {
      toast({ title: t("webhooks.error"), description: t("webhooks.selectEvents") });
      return;
    }

    const input: WebhookCreateInput = {
      name: formName,
      url: formUrl,
      description: formDescription || null,
      events: formEvents,
      zone: formZone,
      headers: {},
      phi_filter: formPhiFilter,
      retry_policy: { maxRetries: formMaxRetries, backoffMs: 1000 },
      timeout_ms: formTimeout,
    };

    const webhook = await createWebhook(input);
    if (webhook) {
      toast({ title: t("webhooks.created"), description: t("webhooks.createdDesc", { name: webhook.name }) });
      setShowCreateDialog(false);
      resetForm();
    } else {
      toast({ title: t("webhooks.error"), description: t("webhooks.createFailed") });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteWebhook(id);
    if (success) {
      toast({ title: t("webhooks.deleted"), description: t("webhooks.deletedDesc") });
    }
    setShowDeleteDialog(null);
  };

  const handleToggle = async (id: string) => {
    const webhook = webhooks.find((wh) => wh.id === id);
    if (!webhook) return;
    const success = await toggleWebhook(id);
    if (success) {
      toast({
        title: webhook.is_active ? t("webhooks.paused") : t("webhooks.enabled"),
        description: t("webhooks.toggleDesc", { name: webhook.name }),
      });
    }
  };

  const handleTest = async (webhook: Webhook) => {
    setTesting((prev) => ({ ...prev, [webhook.id]: true }));
    try {
      const delivery = await testWebhook(webhook);
      toast({
        title: delivery.status === "success" ? t("webhooks.testSuccess") : t("webhooks.testFailed"),
        description:
          delivery.status === "success"
            ? t("webhooks.testSuccessDesc", { code: String(delivery.response_status) })
            : t("webhooks.testFailedDesc", { error: delivery.error_message || "Unknown error" }),
      });
    } catch {
      toast({ title: t("webhooks.testFailed"), description: t("webhooks.testError") });
    } finally {
      setTesting((prev) => ({ ...prev, [webhook.id]: false }));
    }
  };

  const handleRegenerateSecret = async (webhook: Webhook) => {
    const newSecret = await regenerateSecret(webhook.id);
    if (newSecret) {
      toast({ title: t("webhooks.secretRegenerated"), description: t("webhooks.secretRegeneratedDesc") });
      setShowSecretDialog({ ...webhook, secret: newSecret });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    toast({ title: t("webhooks.copied"), description: t("webhooks.copiedDesc", { label }) });
  };

  const resetForm = () => {
    setFormName("");
    setFormUrl("");
    setFormDescription("");
    setFormZone("external");
    setFormEvents([]);
    setFormPhiFilter(true);
    setFormTimeout(10000);
    setFormMaxRetries(3);
    setShowTemplatePicker(true);
    setTemplateCategoryFilter("all");
  };

  const applyTemplate = (template: WebhookTemplate) => {
    setFormName(template.name);
    setFormUrl("");
    setFormDescription(template.description);
    setFormZone(template.zone);
    setFormEvents([...template.events]);
    setFormPhiFilter(template.phi_filter);
    setFormTimeout(template.timeout_ms);
    setFormMaxRetries(template.retry_policy.maxRetries);
    setShowTemplatePicker(false);
  };

  const handleDuplicate = (webhook: Webhook) => {
    setFormName(`${webhook.name} (Copy)`);
    setFormUrl(webhook.url);
    setFormDescription(webhook.description || "");
    setFormZone(webhook.zone);
    setFormEvents([...webhook.events]);
    setFormPhiFilter(webhook.phi_filter);
    setFormTimeout(webhook.timeout_ms);
    setFormMaxRetries(webhook.retry_policy.maxRetries);
    setShowTemplatePicker(false);
    setShowCreateDialog(true);
  };

  const toggleEventSelection = (eventId: string) => {
    setFormEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    );
  };

  const toggleCategorySelection = (categoryId: string) => {
    const category = WEBHOOK_EVENT_CATEGORIES.find((c) => c.id === categoryId);
    if (!category) return;
    const categoryEventIds = category.events.map((e) => e.id);
    const allSelected = categoryEventIds.every((id) => formEvents.includes(id));
    if (allSelected) {
      setFormEvents((prev) => prev.filter((e) => !categoryEventIds.includes(e)));
    } else {
      setFormEvents((prev) => [...new Set([...prev, ...categoryEventIds])]);
    }
  };

  /* ── Filtered deliveries ───────────────────────────────────────────── */

  const filteredDeliveries = deliveries.filter((d) => {
    if (deliveryStatusFilter !== "all" && d.status !== deliveryStatusFilter) return false;
    if (deliverySearch) {
      const search = deliverySearch.toLowerCase();
      return (
        d.event_type.toLowerCase().includes(search) ||
        d.error_message?.toLowerCase().includes(search) ||
        d.id.toLowerCase().includes(search)
      );
    }
    return true;
  });

  /* ── Stats ─────────────────────────────────────────────────────────── */

  const stats = [
    {
      label: t("webhooks.totalEndpoints"),
      value: String(webhooks.length),
      icon: WebhookIcon,
      color: "from-primary to-blue-600",
    },
    {
      label: t("webhooks.activeEndpoints"),
      value: String(webhooks.filter((w) => w.is_active).length),
      icon: Activity,
      color: "from-emerald-500 to-green-600",
    },
    {
      label: t("webhooks.totalDeliveries"),
      value: webhooks.reduce((sum, w) => sum + w.total_deliveries, 0).toLocaleString(),
      icon: Send,
      color: "from-violet-500 to-purple-600",
    },
    {
      label: t("webhooks.totalFailures"),
      value: webhooks.reduce((sum, w) => sum + w.total_failures, 0).toLocaleString(),
      icon: AlertTriangle,
      color: "from-amber-500 to-orange-600",
    },
  ];

  const tabs: { id: TabId; label: string }[] = [
    { id: "endpoints", label: t("webhooks.tabEndpoints") },
    { id: "deliveries", label: t("webhooks.tabDeliveries") },
    { id: "events", label: t("webhooks.tabEvents") },
  ];

  /* ── Zone badge ────────────────────────────────────────────────────── */

  const zoneBadge = (zone: string) => {
    const colors: Record<string, string> = {
      clinical: "bg-red-500/15 text-red-400 border-red-500/30",
      operations: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      external: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    };
    return (
      <Badge variant="outline" className={colors[zone] || colors.external}>
        {zone}
      </Badge>
    );
  };

  /* ── Render ────────────────────────────────────────────────────────── */

  return (
    <DashboardLayout>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading gradient-hero-text">
                {t("webhooks.title")}
              </h1>
              <p className="text-muted-foreground mt-1">{t("webhooks.subtitle")}</p>
            </div>
            <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4" />
              {t("webhooks.createWebhook")}
            </Button>
          </div>

          {/* Stats */}
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

          {/* Tabs */}
          <div className="flex gap-1 bg-white/[0.03] rounded-lg p-1 border border-white/[0.06]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Endpoints ─────────────────────────────────────────── */}
          {activeTab === "endpoints" && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  {t("webhooks.loading")}
                </div>
              ) : webhooks.length === 0 ? (
                <div className="bg-card rounded-xl border border-white/[0.06] p-12 text-center">
                  <WebhookIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {t("webhooks.noWebhooks")}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {t("webhooks.noWebhooksDesc")}
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("webhooks.createFirst")}
                  </Button>
                </div>
              ) : (
                webhooks.map((webhook) => (
                  <div
                    key={webhook.id}
                    className="bg-card rounded-xl border border-white/[0.06] p-5 card-hover"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${webhook.is_active ? "bg-green-400" : "bg-muted-foreground"}`} />
                        <h3 className="text-base font-semibold text-foreground">{webhook.name}</h3>
                        {zoneBadge(webhook.zone)}
                        {webhook.phi_filter && (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            PHI Filter
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={webhook.is_active}
                          onCheckedChange={() => handleToggle(webhook.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleTest(webhook)}
                          disabled={testing[webhook.id]}
                        >
                          {testing[webhook.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setShowSecretDialog(webhook)}
                        >
                          <Settings2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDuplicate(webhook)}
                          title={t("webhooks.duplicate")}
                        >
                          <CopyPlus className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:text-red-400"
                          onClick={() => setShowDeleteDialog(webhook.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>

                    {webhook.description && (
                      <p className="text-sm text-muted-foreground mb-3">{webhook.description}</p>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <code className="text-xs bg-white/[0.04] px-2 py-1 rounded font-mono text-muted-foreground flex-1 truncate">
                        {webhook.url}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => copyToClipboard(webhook.url, "URL")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {webhook.events.map((eventId) => {
                        const eventDef = getEventById(eventId);
                        return (
                          <Badge key={eventId} variant="secondary" className="text-xs">
                            {eventDef?.label || eventId}
                          </Badge>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Send className="h-3 w-3" />
                        {webhook.total_deliveries.toLocaleString()} {t("webhooks.delivered")}
                      </span>
                      {webhook.total_failures > 0 && (
                        <span className="flex items-center gap-1 text-red-400">
                          <XCircle className="h-3 w-3" />
                          {webhook.total_failures.toLocaleString()} {t("webhooks.failed")}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {webhook.last_triggered_at
                          ? new Date(webhook.last_triggered_at).toLocaleString()
                          : t("webhooks.never")}
                      </span>
                      {webhook.last_status_code && (
                        <span className={getHttpStatusColor(webhook.last_status_code)}>
                          HTTP {webhook.last_status_code}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" />
                        {webhook.retry_policy.maxRetries} {t("webhooks.retries")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Tab: Deliveries ────────────────────────────────────────── */}
          {activeTab === "deliveries" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={deliverySearch}
                    onChange={(e) => setDeliverySearch(e.target.value)}
                    placeholder={t("webhooks.searchDeliveries")}
                    className="pl-9 bg-white/[0.03] border-white/10"
                  />
                </div>
                <Select value={selectedWebhookFilter} onValueChange={setSelectedWebhookFilter}>
                  <SelectTrigger className="w-[200px] bg-white/[0.03] border-white/10">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder={t("webhooks.allWebhooks")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("webhooks.allWebhooks")}</SelectItem>
                    {webhooks.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={deliveryStatusFilter} onValueChange={setDeliveryStatusFilter}>
                  <SelectTrigger className="w-[160px] bg-white/[0.03] border-white/10">
                    <SelectValue placeholder={t("webhooks.allStatuses")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("webhooks.allStatuses")}</SelectItem>
                    <SelectItem value="success">{t("webhooks.statusSuccess")}</SelectItem>
                    <SelectItem value="failed">{t("webhooks.statusFailed")}</SelectItem>
                    <SelectItem value="retrying">{t("webhooks.statusRetrying")}</SelectItem>
                    <SelectItem value="pending">{t("webhooks.statusPending")}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => fetchDeliveries(selectedWebhookFilter === "all" ? undefined : selectedWebhookFilter)}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Delivery list */}
              <div className="bg-card rounded-xl border border-white/[0.06] overflow-hidden">
                {deliveriesLoading ? (
                  <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    {t("webhooks.loadingDeliveries")}
                  </div>
                ) : filteredDeliveries.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground">
                    <Send className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>{t("webhooks.noDeliveries")}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-white/[0.06]">
                          <th className="px-4 py-3">{t("webhooks.colStatus")}</th>
                          <th className="px-4 py-3">{t("webhooks.colEvent")}</th>
                          <th className="px-4 py-3">{t("webhooks.colResponse")}</th>
                          <th className="px-4 py-3">{t("webhooks.colDuration")}</th>
                          <th className="px-4 py-3">{t("webhooks.colAttempt")}</th>
                          <th className="px-4 py-3">{t("webhooks.colTimestamp")}</th>
                          <th className="px-4 py-3">{t("webhooks.colActions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDeliveries.map((delivery) => (
                          <tr
                            key={delivery.id}
                            className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] cursor-pointer"
                            onClick={() => setShowDeliveryDetail(delivery)}
                          >
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={getStatusColor(delivery.status)}>
                                {delivery.status === "success" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                {delivery.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                                {delivery.status === "retrying" && <RotateCcw className="h-3 w-3 mr-1" />}
                                {delivery.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                {delivery.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 font-medium text-foreground">
                              {getEventById(delivery.event_type)?.label || delivery.event_type}
                            </td>
                            <td className="px-4 py-3">
                              {delivery.response_status ? (
                                <span className={getHttpStatusColor(delivery.response_status)}>
                                  {delivery.response_status}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {delivery.duration_ms != null ? `${delivery.duration_ms}ms` : "—"}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {delivery.attempt_number}/{delivery.max_attempts}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                              {new Date(delivery.created_at).toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeliveryDetail(delivery);
                                }}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                {t("webhooks.details")}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Tab: Events Reference ──────────────────────────────────── */}
          {activeTab === "events" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t("webhooks.eventsDescription")}</p>
              {WEBHOOK_EVENT_CATEGORIES.map((category) => {
                const isExpanded = expandedEvents[category.id] ?? false;
                return (
                  <div key={category.id} className="bg-card rounded-xl border border-white/[0.06] overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                      onClick={() => setExpandedEvents((prev) => ({ ...prev, [category.id]: !prev[category.id] }))}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">{category.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.events.length} events
                        </Badge>
                      </div>
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    {isExpanded && (
                      <div className="border-t border-white/[0.06]">
                        {category.events.map((event, idx) => (
                          <div
                            key={event.id}
                            className={`p-4 ${idx < category.events.length - 1 ? "border-b border-white/[0.04]" : ""}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-mono text-primary">{event.id}</code>
                                {event.zone !== "any" && zoneBadge(event.zone)}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() =>
                                  copyToClipboard(JSON.stringify(event.samplePayload, null, 2), event.id)
                                }
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                {t("webhooks.copySample")}
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                            <pre className="text-xs font-mono bg-black/30 rounded-lg p-3 text-green-400 overflow-x-auto">
                              {JSON.stringify(event.samplePayload, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Create Webhook Dialog ───────────────────────────────────── */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { setShowCreateDialog(open); if (!open) resetForm(); }}>
        <DialogContent className="bg-card border-white/[0.06] max-w-2xl max-h-[85vh] overflow-y-auto">
          {showTemplatePicker ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <LayoutTemplate className="h-5 w-5" />
                  {t("webhooks.chooseTemplate")}
                </DialogTitle>
                <DialogDescription>{t("webhooks.chooseTemplateDesc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {/* Template category filter */}
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    variant={templateCategoryFilter === "all" ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setTemplateCategoryFilter("all")}
                  >
                    {t("webhooks.allTemplates")}
                  </Button>
                  {WEBHOOK_TEMPLATE_CATEGORIES.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={templateCategoryFilter === cat.id ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setTemplateCategoryFilter(cat.id)}
                    >
                      {t(`webhooks.templateCat_${cat.id}`, cat.label)}
                    </Button>
                  ))}
                </div>

                {/* Template cards */}
                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                  {WEBHOOK_TEMPLATES.filter(
                    (tpl) => templateCategoryFilter === "all" || tpl.category === templateCategoryFilter
                  ).map((tpl) => (
                    <button
                      key={tpl.id}
                      className="text-left p-4 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/40 transition-all group"
                      onClick={() => applyTemplate(tpl)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{tpl.icon}</span>
                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {t(`webhooks.tpl_${tpl.id}`, tpl.name)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {t(`webhooks.tplDesc_${tpl.id}`, tpl.description)}
                      </p>
                      <div className="flex items-center gap-2">
                        {zoneBadge(tpl.zone)}
                        <Badge variant="secondary" className="text-[10px]">
                          {tpl.events.length} {t("webhooks.events").toLowerCase()}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <DialogFooter className="flex-row justify-between sm:justify-between">
                <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                  {t("webhooks.cancel")}
                </Button>
                <Button variant="ghost" className="gap-2" onClick={() => setShowTemplatePicker(false)}>
                  {t("webhooks.startFromScratch")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{t("webhooks.createWebhook")}</DialogTitle>
                <DialogDescription>{t("webhooks.createDesc")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-2">
                {/* Back to templates link */}
                <button
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => { resetForm(); setShowTemplatePicker(true); }}
                >
                  <ArrowLeft className="h-3 w-3" />
                  {t("webhooks.backToTemplates")}
                </button>

                {/* Name */}
                <div className="space-y-2">
                  <Label>{t("webhooks.name")}</Label>
                  <Input
                    placeholder={t("webhooks.namePlaceholder")}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="bg-white/[0.03] border-white/10"
                  />
                </div>

                {/* URL */}
                <div className="space-y-2">
                  <Label>{t("webhooks.url")}</Label>
                  <Input
                    placeholder="https://your-server.com/webhooks/drclaw"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="bg-white/[0.03] border-white/10"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>{t("webhooks.description")}</Label>
                  <Textarea
                    placeholder={t("webhooks.descriptionPlaceholder")}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="bg-white/[0.03] border-white/10 min-h-[60px]"
                  />
                </div>

                {/* Zone & Timeout */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("webhooks.zone")}</Label>
                    <Select value={formZone} onValueChange={(v) => setFormZone(v as SecurityZone)}>
                      <SelectTrigger className="bg-white/[0.03] border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clinical">{t("webhooks.zoneClinical")}</SelectItem>
                        <SelectItem value="operations">{t("webhooks.zoneOperations")}</SelectItem>
                        <SelectItem value="external">{t("webhooks.zoneExternal")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("webhooks.timeout")}</Label>
                    <Select value={String(formTimeout)} onValueChange={(v) => setFormTimeout(Number(v))}>
                      <SelectTrigger className="bg-white/[0.03] border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5000">5s</SelectItem>
                        <SelectItem value="10000">10s</SelectItem>
                        <SelectItem value="15000">15s</SelectItem>
                        <SelectItem value="30000">30s</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Retries & PHI filter */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("webhooks.maxRetries")}</Label>
                    <Select value={String(formMaxRetries)} onValueChange={(v) => setFormMaxRetries(Number(v))}>
                      <SelectTrigger className="bg-white/[0.03] border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">{t("webhooks.noRetries")}</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("webhooks.phiFilter")}</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Switch checked={formPhiFilter} onCheckedChange={setFormPhiFilter} />
                      <span className="text-sm text-muted-foreground">
                        {formPhiFilter ? t("webhooks.phiEnabled") : t("webhooks.phiDisabled")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Selection */}
                <div className="space-y-3">
                  <Label>{t("webhooks.events")} ({formEvents.length} {t("webhooks.selected")})</Label>
                  <div className="border border-white/[0.06] rounded-lg max-h-[240px] overflow-y-auto">
                    {WEBHOOK_EVENT_CATEGORIES.map((category) => {
                      const categoryEventIds = category.events.map((e) => e.id);
                      const allSelected = categoryEventIds.every((id) => formEvents.includes(id));
                      const someSelected = categoryEventIds.some((id) => formEvents.includes(id));

                      return (
                        <div key={category.id} className="border-b border-white/[0.04] last:border-0">
                          <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02]">
                            <Checkbox
                              checked={allSelected ? true : someSelected ? "indeterminate" : false}
                              onCheckedChange={() => toggleCategorySelection(category.id)}
                            />
                            <span className="text-sm font-medium text-foreground">{category.label}</span>
                          </div>
                          {category.events.map((event) => (
                            <div key={event.id} className="flex items-center gap-2 px-3 py-1.5 pl-8">
                              <Checkbox
                                checked={formEvents.includes(event.id)}
                                onCheckedChange={() => toggleEventSelection(event.id)}
                              />
                              <span className="text-sm text-muted-foreground">{event.label}</span>
                              <code className="text-xs text-muted-foreground/60 ml-auto">{event.id}</code>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                  {t("webhooks.cancel")}
                </Button>
                <Button onClick={handleCreate}>{t("webhooks.create")}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ──────────────────────────────── */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent className="bg-card border-white/[0.06]">
          <DialogHeader>
            <DialogTitle>{t("webhooks.deleteConfirm")}</DialogTitle>
            <DialogDescription>{t("webhooks.deleteConfirmDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              {t("webhooks.cancel")}
            </Button>
            <Button variant="destructive" onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}>
              {t("webhooks.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Secret / Settings Dialog ───────────────────────────────── */}
      <Dialog open={!!showSecretDialog} onOpenChange={() => setShowSecretDialog(null)}>
        <DialogContent className="bg-card border-white/[0.06]">
          <DialogHeader>
            <DialogTitle>{t("webhooks.webhookSettings")}</DialogTitle>
            <DialogDescription>{t("webhooks.webhookSettingsDesc")}</DialogDescription>
          </DialogHeader>
          {showSecretDialog && (
            <div className="space-y-4 py-2">
              {/* Secret */}
              <div className="space-y-2">
                <Label>{t("webhooks.signingSecret")}</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white/[0.04] px-3 py-2 rounded font-mono text-muted-foreground">
                    {visibleSecrets[showSecretDialog.id]
                      ? showSecretDialog.secret
                      : "whsec_" + "*".repeat(40)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() =>
                      setVisibleSecrets((prev) => ({
                        ...prev,
                        [showSecretDialog.id]: !prev[showSecretDialog.id],
                      }))
                    }
                  >
                    {visibleSecrets[showSecretDialog.id] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => copyToClipboard(showSecretDialog.secret, "Secret")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{t("webhooks.secretHint")}</p>
              </div>

              {/* Signature verification example */}
              <div className="space-y-2">
                <Label>{t("webhooks.verifyExample")}</Label>
                <pre className="text-xs font-mono bg-black/30 rounded-lg p-3 text-green-400 overflow-x-auto whitespace-pre-wrap">
{`// Node.js verification example
const crypto = require('crypto');

function verifySignature(payload, secret, signature) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// In your webhook handler:
const isValid = verifySignature(
  req.body, // raw body string
  '${visibleSecrets[showSecretDialog.id] ? showSecretDialog.secret : "YOUR_WEBHOOK_SECRET"}',
  req.headers['x-drclaw-signature-256']
);`}
                </pre>
              </div>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleRegenerateSecret(showSecretDialog)}
              >
                <RefreshCw className="h-4 w-4" />
                {t("webhooks.regenerateSecret")}
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowSecretDialog(null)}>{t("webhooks.done")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delivery Detail Dialog ─────────────────────────────────── */}
      <Dialog open={!!showDeliveryDetail} onOpenChange={() => setShowDeliveryDetail(null)}>
        <DialogContent className="bg-card border-white/[0.06] max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("webhooks.deliveryDetail")}</DialogTitle>
            <DialogDescription>
              {showDeliveryDetail && `ID: ${showDeliveryDetail.id}`}
            </DialogDescription>
          </DialogHeader>
          {showDeliveryDetail && (
            <div className="space-y-4 py-2">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">{t("webhooks.colStatus")}</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className={getStatusColor(showDeliveryDetail.status)}>
                      {showDeliveryDetail.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">{t("webhooks.colResponse")}</Label>
                  <p className={`mt-1 font-mono text-sm ${getHttpStatusColor(showDeliveryDetail.response_status)}`}>
                    {showDeliveryDetail.response_status || "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs">{t("webhooks.colDuration")}</Label>
                  <p className="mt-1 text-sm text-foreground">
                    {showDeliveryDetail.duration_ms != null ? `${showDeliveryDetail.duration_ms}ms` : "—"}
                  </p>
                </div>
              </div>

              {/* Error */}
              {showDeliveryDetail.error_message && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{showDeliveryDetail.error_message}</p>
                </div>
              )}

              {/* PHI */}
              {showDeliveryDetail.phi_stripped && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">{t("webhooks.phiRedacted")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("webhooks.phiFieldsRedacted")}: {showDeliveryDetail.phi_fields_redacted.join(", ")}
                  </p>
                </div>
              )}

              {/* Request payload */}
              <div className="space-y-2">
                <Label className="text-xs">{t("webhooks.requestPayload")}</Label>
                <pre className="text-xs font-mono bg-black/30 rounded-lg p-3 text-green-400 overflow-x-auto max-h-[200px]">
                  {JSON.stringify(showDeliveryDetail.payload, null, 2)}
                </pre>
              </div>

              {/* Response body */}
              {showDeliveryDetail.response_body && (
                <div className="space-y-2">
                  <Label className="text-xs">{t("webhooks.responseBody")}</Label>
                  <pre className="text-xs font-mono bg-black/30 rounded-lg p-3 text-blue-400 overflow-x-auto max-h-[200px]">
                    {showDeliveryDetail.response_body}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDeliveryDetail(null)}>{t("webhooks.done")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Webhooks;
