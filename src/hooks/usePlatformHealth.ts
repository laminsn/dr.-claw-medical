/**
 * usePlatformHealth — Fetches platform-wide health metrics for admin monitoring.
 *
 * Calls the platform-health edge function and provides reactive data for
 * the monitoring dashboard.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────

interface HealthMetrics {
  timestamp: string;
  agents: {
    total: number;
    active: number;
    errorRate24h: number;
  };
  tasks: {
    pending: number;
    running: number;
    stuck: number;
    completedToday: number;
    failedToday: number;
  };
  cost: {
    today: number;
    thisMonth: number;
    projectedMonth: number;
  };
  phi: {
    accessesToday: number;
    highRiskToday: number;
    anomalyCount: number;
  };
  workflows: {
    activeFlows: number;
    failuresToday: number;
  };
  auditChain: {
    verified: boolean;
    lastChecked: string;
  };
}

interface Alert {
  severity: "info" | "warning" | "critical";
  metric: string;
  message: string;
  value: number;
  threshold: number;
}

interface PlatformHealthResponse {
  success: boolean;
  metrics: HealthMetrics;
  alerts: Alert[];
}

// ── Hook ───────────────────────────────────────────────────────────────

export function usePlatformHealth(enabled = true) {
  return useQuery({
    queryKey: ["platform-health"],
    queryFn: async (): Promise<PlatformHealthResponse> => {
      const { data, error } = await supabase.functions.invoke("platform-health");
      if (error) throw error;
      return data as PlatformHealthResponse;
    },
    enabled,
    refetchInterval: 5 * 60_000, // Auto-refresh every 5 minutes
    staleTime: 60_000,
    retry: 1,
  });
}

export function useHealthAlerts(enabled = true) {
  const { data, ...rest } = usePlatformHealth(enabled);

  return {
    ...rest,
    data: data?.alerts ?? [],
    criticalCount: data?.alerts?.filter((a) => a.severity === "critical").length ?? 0,
    warningCount: data?.alerts?.filter((a) => a.severity === "warning").length ?? 0,
  };
}

export type { HealthMetrics, Alert, PlatformHealthResponse };
