/**
 * N8N Gateway Panel — HIPAA/PHI Compliance Dashboard
 *
 * Displays real-time status of the N8N gateway, flow configurations,
 * audit trail, and PHI scanning metrics for Zone 1 (Clinical) agents.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Activity,
  GitBranch,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ScanLine,
  Lock,
  Zap,
  Server,
  Eye,
  FileWarning,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronUp,
  Trash2,
  Play,
  Pause,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import { useN8nGateway } from "@/hooks/useN8nGateway";
import type { N8nFlowConfig, N8nAuditEntry, GatewayVerdict } from "@/lib/n8n-gateway";
import type { SecurityZone } from "@/lib/security";

/* ── Constants ──────────────────────────────────────────────────────── */

const VERDICT_CONFIG: Record<GatewayVerdict, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  allowed:   { label: "Allowed",   color: "text-green-400 bg-green-500/10 border-green-500/30", icon: CheckCircle2 },
  sanitized: { label: "Sanitized", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: ShieldCheck },
  blocked:   { label: "Blocked",   color: "text-red-400 bg-red-500/10 border-red-500/30",       icon: XCircle },
};

const ZONE_CONFIG: Record<SecurityZone, { label: string; color: string }> = {
  clinical:   { label: "Z1 Clinical",   color: "text-red-400 bg-red-500/10 border-red-500/30" },
  operations: { label: "Z2 Operations", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  external:   { label: "Z3 External",   color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
};

const RISK_CONFIG: Record<string, { label: string; color: string }> = {
  none:   { label: "None",   color: "text-green-400" },
  low:    { label: "Low",    color: "text-blue-400" },
  medium: { label: "Medium", color: "text-amber-400" },
  high:   { label: "High",   color: "text-red-400" },
};

/* ── Component ──────────────────────────────────────────────────────── */

const N8nGatewayPanel = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const {
    flowConfigs,
    auditLog,
    stats,
    saveFlowConfig,
    removeFlowConfig,
    refreshFlowConfigs,
    refreshAuditLog,
    refreshStats,
  } = useN8nGateway();

  const [showAuditDetails, setShowAuditDetails] = useState<string | null>(null);
  const [editFlowDialog, setEditFlowDialog] = useState<N8nFlowConfig | null>(null);
  const [editWebhookUrl, setEditWebhookUrl] = useState("");
  const [auditExpanded, setAuditExpanded] = useState(true);

  const handleRefreshAll = () => {
    refreshFlowConfigs();
    refreshAuditLog();
    refreshStats();
    toast({ title: "Gateway refreshed", description: "All gateway data has been reloaded." });
  };

  const handleToggleFlow = (flow: N8nFlowConfig) => {
    saveFlowConfig({ ...flow, isActive: !flow.isActive });
    toast({
      title: flow.isActive ? "Flow deactivated" : "Flow activated",
      description: `${flow.name} is now ${flow.isActive ? "inactive" : "active"}.`,
    });
  };

  const handleDeleteFlow = (flow: N8nFlowConfig) => {
    removeFlowConfig(flow.id);
    toast({ title: "Flow removed", description: `${flow.name} has been deleted.` });
  };

  const handleSaveWebhook = () => {
    if (!editFlowDialog) return;
    saveFlowConfig({ ...editFlowDialog, webhookUrl: editWebhookUrl.trim() });
    setEditFlowDialog(null);
    toast({ title: "Webhook saved", description: `Webhook URL updated for ${editFlowDialog.name}.` });
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold font-heading text-foreground">
              N8N HIPAA Gateway
            </h2>
            <p className="text-xs text-muted-foreground">
              All Zone 1 agent data flows through this gateway for PHI compliance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/10 border border-green-500/30 text-green-400 text-[10px]">
            <Activity className="h-2.5 w-2.5 mr-1 animate-pulse" />
            Gateway Active
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 text-muted-foreground h-8 px-2"
            onClick={handleRefreshAll}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Requests",
            value: stats.totalRequests,
            icon: Zap,
            detail: `${stats.allowedRequests} allowed, ${stats.sanitizedRequests} sanitized`,
          },
          {
            label: "PHI Detections",
            value: stats.phiDetections,
            icon: ScanLine,
            detail: `${stats.blockedRequests} blocked by gateway`,
          },
          {
            label: "Active Flows",
            value: stats.activeFlows,
            icon: GitBranch,
            detail: `${stats.clinicalFlows} clinical, ${stats.operationsFlows} ops`,
          },
          {
            label: "Avg Response",
            value: stats.avgDurationMs > 0 ? `${stats.avgDurationMs}ms` : "—",
            icon: Clock,
            detail: "Gateway processing time",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-white/[0.06] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {stat.label}
              </span>
              <stat.icon className="h-4 w-4 text-primary/60" />
            </div>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* ── Zone Enforcement Banner ────────────────────────────── */}
      <div className="flex items-start gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
        <Lock className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-red-400">
            Zone 1 Clinical Data — N8N Gateway Enforced
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            All clinical agent data is scanned for PHI, sanitized, and audit-logged before
            reaching any N8N workflow. Direct clinical-to-external data flow is blocked.
          </p>
        </div>
      </div>

      {/* ── N8N Flow Configurations ────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            N8N Flow Configurations
          </h3>
          <span className="text-[10px] text-muted-foreground">
            {flowConfigs.length} flows configured
          </span>
        </div>

        <div className="space-y-2">
          {flowConfigs.map((flow) => (
            <div
              key={flow.id}
              className={`bg-card rounded-xl border p-4 transition-colors ${
                flow.isActive
                  ? "border-white/[0.06] hover:border-primary/20"
                  : "border-white/[0.04] opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{flow.name}</span>
                    <Badge variant="outline" className={`text-[8px] px-1.5 py-0 ${ZONE_CONFIG[flow.agentZone].color}`}>
                      {ZONE_CONFIG[flow.agentZone].label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[8px] px-1.5 py-0 ${
                        flow.executionMode === "edge"
                          ? "text-violet-400 bg-violet-500/10 border-violet-500/30"
                          : "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
                      }`}
                    >
                      <Server className="h-2 w-2 mr-0.5" />
                      {flow.executionMode === "edge" ? "Edge" : "Client"}
                    </Badge>
                    {flow.requiresPhiScan && (
                      <Badge variant="outline" className="text-[8px] px-1.5 py-0 text-red-400 bg-red-500/10 border-red-500/30">
                        <ScanLine className="h-2 w-2 mr-0.5" />
                        PHI Scan
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{flow.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    <span>Agents: {flow.allowedAgentIds.length}</span>
                    <span>Timeout: {flow.timeout / 1000}s</span>
                    <span>Retries: {flow.retryPolicy.maxRetries}</span>
                    {flow.webhookUrl ? (
                      <span className="text-green-400 flex items-center gap-0.5">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Webhook set
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" /> No webhook
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[10px] border-white/10"
                    onClick={() => {
                      setEditWebhookUrl(flow.webhookUrl);
                      setEditFlowDialog(flow);
                    }}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`h-7 px-2 text-[10px] border-white/10 ${
                      flow.isActive ? "text-amber-400" : "text-green-400"
                    }`}
                    onClick={() => handleToggleFlow(flow)}
                  >
                    {flow.isActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[10px] border-white/10 text-red-400"
                    onClick={() => handleDeleteFlow(flow)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="border-white/[0.06]" />

      {/* ── Audit Trail ────────────────────────────────────────── */}
      <div>
        <button
          className="flex items-center justify-between w-full mb-3"
          onClick={() => setAuditExpanded(!auditExpanded)}
        >
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileWarning className="h-4 w-4 text-primary" />
            Gateway Audit Trail
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">{auditLog.length} entries</span>
            {auditExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {auditExpanded && (
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {auditLog.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No gateway executions yet</p>
                <p className="text-[10px] mt-0.5">
                  Audit entries will appear here when agents execute N8N flows
                </p>
              </div>
            ) : (
              auditLog.slice().reverse().map((entry) => {
                const verdictCfg = VERDICT_CONFIG[entry.verdict];
                const VerdictIcon = verdictCfg.icon;
                const riskCfg = RISK_CONFIG[entry.phiScanResult.riskLevel] ?? RISK_CONFIG.none;
                const isExpanded = showAuditDetails === entry.id;

                return (
                  <div
                    key={entry.id}
                    className="bg-card rounded-lg border border-white/[0.04] p-3 hover:border-white/[0.08] transition-colors cursor-pointer"
                    onClick={() => setShowAuditDetails(isExpanded ? null : entry.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <VerdictIcon className={`h-3.5 w-3.5 shrink-0 ${verdictCfg.color.split(" ")[0]}`} />
                        <span className="text-xs font-medium text-foreground truncate">
                          {entry.flowName}
                        </span>
                        <Badge variant="outline" className={`text-[8px] px-1 py-0 ${verdictCfg.color}`}>
                          {verdictCfg.label}
                        </Badge>
                        {entry.phiScanResult.containsPhi && (
                          <Badge variant="outline" className="text-[8px] px-1 py-0 text-amber-400 bg-amber-500/10 border-amber-500/30">
                            PHI: {riskCfg.label}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-[10px] text-muted-foreground">
                        <span>{entry.agentName}</span>
                        <span>{entry.durationMs}ms</span>
                        <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-white/[0.04] text-[10px] text-muted-foreground space-y-1.5">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <span>Audit ID: <span className="text-foreground font-mono">{entry.id}</span></span>
                          <span>Mode: <span className="text-foreground">{entry.executionMode}</span></span>
                          <span>Agent Zone: <span className="text-foreground">{entry.agentZone}</span></span>
                          <span>Response: <span className="text-foreground">{entry.responseStatus ?? "N/A"}</span></span>
                          <span>User: <span className="text-foreground font-mono">{entry.userId.slice(0, 8)}...</span></span>
                          <span>Session: <span className="text-foreground">{entry.flowId}</span></span>
                        </div>
                        {entry.phiScanResult.fieldsRedacted.length > 0 && (
                          <div>
                            <span className="text-amber-400">Fields redacted:</span>
                            <span className="text-foreground ml-1">
                              {entry.phiScanResult.fieldsRedacted.join(", ")}
                            </span>
                          </div>
                        )}
                        {entry.errorMessage && (
                          <div className="text-red-400">Error: {entry.errorMessage}</div>
                        )}
                        <div className="flex gap-4">
                          <span>Original hash: <span className="font-mono text-foreground">{entry.phiScanResult.originalHash.slice(0, 12)}...</span></span>
                          <span>Sanitized hash: <span className="font-mono text-foreground">{entry.phiScanResult.sanitizedHash.slice(0, 12)}...</span></span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── Webhook Config Dialog ──────────────────────────────── */}
      <Dialog
        open={!!editFlowDialog}
        onOpenChange={(open) => { if (!open) setEditFlowDialog(null); }}
      >
        {editFlowDialog && (
          <DialogContent className="max-w-md glass-card border-white/10">
            <DialogHeader>
              <DialogTitle className="text-base font-heading flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Configure: {editFlowDialog.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {editFlowDialog.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">N8N Webhook URL</Label>
                <Input
                  value={editWebhookUrl}
                  onChange={(e) => setEditWebhookUrl(e.target.value)}
                  placeholder="https://your-n8n-instance.com/webhook/..."
                  className="bg-white/[0.03] border-white/10 text-sm"
                />
                <p className="text-[10px] text-muted-foreground">
                  The N8N webhook endpoint for this flow. Leave empty to validate without forwarding.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Zone:</span>
                  <Badge variant="outline" className={`ml-1 text-[10px] ${ZONE_CONFIG[editFlowDialog.agentZone].color}`}>
                    {ZONE_CONFIG[editFlowDialog.agentZone].label}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Mode:</span>
                  <span className="ml-1 text-foreground">{editFlowDialog.executionMode}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">PHI Scan:</span>
                  <span className={`ml-1 ${editFlowDialog.requiresPhiScan ? "text-green-400" : "text-muted-foreground"}`}>
                    {editFlowDialog.requiresPhiScan ? "Required" : "Optional"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Audit Log:</span>
                  <span className={`ml-1 ${editFlowDialog.requiresAuditLog ? "text-green-400" : "text-muted-foreground"}`}>
                    {editFlowDialog.requiresAuditLog ? "Required" : "Optional"}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                className="border-white/10"
                onClick={() => setEditFlowDialog(null)}
              >
                Cancel
              </Button>
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={handleSaveWebhook}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default N8nGatewayPanel;
