/**
 * useAgentKpis — Fetches real agent performance data from materialized views.
 *
 * Falls back gracefully when views haven't been populated yet.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────

interface AgentSummary {
  agent_id: string;
  agent_name: string | null;
  zone: string | null;
  model: string | null;
  lifetime_tasks: number;
  lifetime_completed: number;
  lifetime_failed: number;
  lifetime_success_rate: number;
  lifetime_tokens: number;
  lifetime_cost: number;
  avg_response_ms: number;
  tasks_today: number;
  cost_today: number;
  cost_month: number;
  last_active: string | null;
}

interface DailyCost {
  day: string;
  model: string;
  provider: string;
  request_count: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  avg_latency_ms: number;
}

interface DailyPerformance {
  day: string;
  agent_id: string;
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  success_rate: number;
  total_tokens: number;
  total_cost: number;
  avg_duration_ms: number;
}

interface PhiExposure {
  day: string;
  total_phi_events: number;
  encrypt_events: number;
  decrypt_events: number;
  gateway_phi_events: number;
  high_risk_events: number;
}

// ── Hooks ──────────────────────────────────────────────────────────────

export function useAgentSummaries() {
  return useQuery({
    queryKey: ["kpi", "agent-summaries"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("mv_agent_summary")
        .select("*")
        .order("lifetime_tasks", { ascending: false });

      if (error) throw error;
      return (data ?? []) as AgentSummary[];
    },
    staleTime: 60_000,
    retry: 1,
  });
}

export function useAgentPerformanceDaily(days = 30) {
  return useQuery({
    queryKey: ["kpi", "agent-performance-daily", days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("mv_agent_performance_daily")
        .select("*")
        .gte("day", since)
        .order("day", { ascending: true });

      if (error) throw error;
      return (data ?? []) as DailyPerformance[];
    },
    staleTime: 60_000,
    retry: 1,
  });
}

export function useCostDaily(days = 30) {
  return useQuery({
    queryKey: ["kpi", "cost-daily", days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("mv_cost_daily")
        .select("*")
        .gte("day", since)
        .order("day", { ascending: true });

      if (error) throw error;
      return (data ?? []) as DailyCost[];
    },
    staleTime: 60_000,
    retry: 1,
  });
}

export function usePhiExposureDaily(days = 30) {
  return useQuery({
    queryKey: ["kpi", "phi-exposure-daily", days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("mv_phi_exposure_daily")
        .select("*")
        .gte("day", since)
        .order("day", { ascending: true });

      if (error) throw error;
      return (data ?? []) as PhiExposure[];
    },
    staleTime: 60_000,
    retry: 1,
  });
}

export type { AgentSummary, DailyCost, DailyPerformance, PhiExposure };
