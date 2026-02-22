/**
 * useN8nGateway — Client-side hook for interactive agent sessions
 *
 * Provides a React hook that wraps the N8N gateway for real-time agent
 * interactions. For automated/scheduled flows, use the Supabase edge function.
 * For interactive sessions (user-driven agent actions), use this hook.
 *
 * The hook handles:
 *  - Client-side PHI pre-scanning before the request leaves the browser
 *  - Routing to either the edge function or direct client-proxy mode
 *  - Real-time execution status tracking
 *  - Audit log retrieval for the gateway panel UI
 */

import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  processGatewayRequest,
  getFlowConfigs,
  getFlowConfigsForAgent,
  getFlowConfigById,
  upsertFlowConfig,
  deleteFlowConfig,
  getAuditLog,
  getGatewayStats,
  isGatewayRequired,
  validateZoneTransition,
  type N8nFlowConfig,
  type N8nGatewayRequest,
  type N8nGatewayResponse,
  type N8nAuditEntry,
  type GatewayStats,
} from "@/lib/n8n-gateway";
import type { SecurityZone } from "@/lib/security";

/* ── Types ──────────────────────────────────────────────────────────── */

export type ExecutionStatus = "idle" | "scanning" | "sanitizing" | "executing" | "complete" | "error";

export interface UseN8nGatewayReturn {
  /** Execute a request through the N8N gateway */
  executeFlow: (params: {
    flowId: string;
    agentId: string;
    agentName: string;
    agentZone: SecurityZone;
    payload: Record<string, unknown>;
  }) => Promise<N8nGatewayResponse>;

  /** Execute via Supabase edge function (server-side) */
  executeFlowEdge: (params: {
    flowId: string;
    agentId: string;
    agentName: string;
    agentZone: SecurityZone;
    webhookUrl: string;
    payload: Record<string, unknown>;
  }) => Promise<N8nGatewayResponse>;

  /** Current execution status */
  status: ExecutionStatus;

  /** Last gateway response */
  lastResponse: N8nGatewayResponse | null;

  /** Whether the gateway is currently processing */
  isProcessing: boolean;

  /** Flow config management */
  flowConfigs: N8nFlowConfig[];
  getFlowsForAgent: (agentId: string, zone: SecurityZone) => N8nFlowConfig[];
  getFlowById: (flowId: string) => N8nFlowConfig | undefined;
  saveFlowConfig: (config: N8nFlowConfig) => void;
  removeFlowConfig: (flowId: string) => void;
  refreshFlowConfigs: () => void;

  /** Audit log */
  auditLog: N8nAuditEntry[];
  refreshAuditLog: () => void;

  /** Gateway stats */
  stats: GatewayStats;
  refreshStats: () => void;

  /** Zone helpers */
  isGatewayRequiredForZone: (zone: SecurityZone) => boolean;
  checkZoneTransition: (source: SecurityZone, target: SecurityZone) => {
    allowed: boolean;
    requiresSanitization: boolean;
    reason: string;
  };
}

/* ── Hook ───────────────────────────────────────────────────────────── */

export function useN8nGateway(): UseN8nGatewayReturn {
  const { user } = useAuth();
  const [status, setStatus] = useState<ExecutionStatus>("idle");
  const [lastResponse, setLastResponse] = useState<N8nGatewayResponse | null>(null);
  const [flowConfigsState, setFlowConfigsState] = useState<N8nFlowConfig[]>(() => getFlowConfigs());
  const [auditLogState, setAuditLogState] = useState<N8nAuditEntry[]>(() => getAuditLog());
  const [statsState, setStatsState] = useState<GatewayStats>(() => getGatewayStats());

  // ── Client-side execution (client-proxy mode) ─────────────────────

  const executeFlow = useCallback(
    async (params: {
      flowId: string;
      agentId: string;
      agentName: string;
      agentZone: SecurityZone;
      payload: Record<string, unknown>;
    }): Promise<N8nGatewayResponse> => {
      setStatus("scanning");

      const request: N8nGatewayRequest = {
        flowId: params.flowId,
        agentId: params.agentId,
        agentName: params.agentName,
        agentZone: params.agentZone,
        payload: params.payload,
        userId: user?.id ?? "anonymous",
        sessionId: `session-${Date.now()}`,
        executionMode: "client-proxy",
        timestamp: new Date().toISOString(),
      };

      try {
        setStatus("sanitizing");
        const response = await processGatewayRequest(request);

        if (response.verdict === "blocked") {
          setStatus("error");
        } else {
          setStatus("complete");
        }

        setLastResponse(response);
        // Refresh audit log and stats after execution
        setAuditLogState(getAuditLog());
        setStatsState(getGatewayStats());
        return response;
      } catch (err) {
        setStatus("error");
        const errorResponse: N8nGatewayResponse = {
          success: false,
          verdict: "blocked",
          auditId: `error-${Date.now()}`,
          phiScanResult: {
            containsPhi: false,
            riskLevel: "none",
            fieldsRedacted: [],
            originalHash: "",
            sanitizedHash: "",
          },
          flowResponse: null,
          errorMessage: err instanceof Error ? err.message : "Unknown error",
          durationMs: 0,
        };
        setLastResponse(errorResponse);
        return errorResponse;
      }
    },
    [user]
  );

  // ── Edge function execution (server-side) ─────────────────────────

  const executeFlowEdge = useCallback(
    async (params: {
      flowId: string;
      agentId: string;
      agentName: string;
      agentZone: SecurityZone;
      webhookUrl: string;
      payload: Record<string, unknown>;
    }): Promise<N8nGatewayResponse> => {
      setStatus("executing");

      try {
        const { data, error } = await supabase.functions.invoke("n8n-gateway", {
          body: {
            flowId: params.flowId,
            agentId: params.agentId,
            agentName: params.agentName,
            agentZone: params.agentZone,
            webhookUrl: params.webhookUrl,
            payload: params.payload,
            sessionId: `edge-session-${Date.now()}`,
          },
        });

        if (error) {
          setStatus("error");
          const errorResponse: N8nGatewayResponse = {
            success: false,
            verdict: "blocked",
            auditId: `edge-error-${Date.now()}`,
            phiScanResult: {
              containsPhi: false,
              riskLevel: "none",
              fieldsRedacted: [],
              originalHash: "",
              sanitizedHash: "",
            },
            flowResponse: null,
            errorMessage: error.message,
            durationMs: 0,
          };
          setLastResponse(errorResponse);
          return errorResponse;
        }

        const response = data as N8nGatewayResponse;
        setStatus(response.success ? "complete" : "error");
        setLastResponse(response);
        setAuditLogState(getAuditLog());
        setStatsState(getGatewayStats());
        return response;
      } catch (err) {
        setStatus("error");
        const errorResponse: N8nGatewayResponse = {
          success: false,
          verdict: "blocked",
          auditId: `edge-error-${Date.now()}`,
          phiScanResult: {
            containsPhi: false,
            riskLevel: "none",
            fieldsRedacted: [],
            originalHash: "",
            sanitizedHash: "",
          },
          flowResponse: null,
          errorMessage: err instanceof Error ? err.message : "Unknown error",
          durationMs: 0,
        };
        setLastResponse(errorResponse);
        return errorResponse;
      }
    },
    []
  );

  // ── Flow config management ────────────────────────────────────────

  const refreshFlowConfigs = useCallback(() => {
    setFlowConfigsState(getFlowConfigs());
  }, []);

  const getFlowsForAgent = useCallback(
    (agentId: string, zone: SecurityZone) => getFlowConfigsForAgent(agentId, zone),
    []
  );

  const getFlowById = useCallback(
    (flowId: string) => getFlowConfigById(flowId),
    []
  );

  const saveFlowConfig = useCallback((config: N8nFlowConfig) => {
    upsertFlowConfig(config);
    setFlowConfigsState(getFlowConfigs());
  }, []);

  const removeFlowConfig = useCallback((flowId: string) => {
    deleteFlowConfig(flowId);
    setFlowConfigsState(getFlowConfigs());
  }, []);

  // ── Audit + stats ─────────────────────────────────────────────────

  const refreshAuditLog = useCallback(() => {
    setAuditLogState(getAuditLog());
  }, []);

  const refreshStats = useCallback(() => {
    setStatsState(getGatewayStats());
  }, []);

  // ── Zone helpers ──────────────────────────────────────────────────

  const isGatewayRequiredForZone = useCallback(
    (zone: SecurityZone) => isGatewayRequired(zone),
    []
  );

  const checkZoneTransition = useCallback(
    (source: SecurityZone, target: SecurityZone) => validateZoneTransition(source, target),
    []
  );

  // ── Derived state ─────────────────────────────────────────────────

  const isProcessing = useMemo(
    () => status === "scanning" || status === "sanitizing" || status === "executing",
    [status]
  );

  return {
    executeFlow,
    executeFlowEdge,
    status,
    lastResponse,
    isProcessing,
    flowConfigs: flowConfigsState,
    getFlowsForAgent,
    getFlowById,
    saveFlowConfig,
    removeFlowConfig,
    refreshFlowConfigs,
    auditLog: auditLogState,
    refreshAuditLog,
    stats: statsState,
    refreshStats,
    isGatewayRequiredForZone,
    checkZoneTransition,
  };
}
