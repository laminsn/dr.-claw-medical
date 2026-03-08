/**
 * useN8nApi — Hook for querying the n8n REST API via the server-side proxy.
 *
 * All requests go through the `n8n-api-proxy` edge function, which holds
 * the n8n API key server-side. The client never sees n8n credentials.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: Array<{ id: string; name: string }>;
  nodes?: Array<{ type: string; name: string }>;
}

interface N8nExecution {
  id: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt: string;
  workflowId: string;
  status: string;
  workflowData?: { name: string };
}

interface ProxyResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// ── Proxy call helper ──────────────────────────────────────────────────

async function n8nProxy<T>(
  method: "GET" | "POST",
  path: string,
  queryParams?: Record<string, string>,
  body?: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke("n8n-api-proxy", {
    body: { method, path, queryParams, body },
  });

  if (error) {
    throw new Error(error.message ?? "n8n API proxy error");
  }

  const response = data as ProxyResponse<T>;
  if (!response.success) {
    throw new Error(response.error ?? `n8n API returned error`);
  }

  return response.data;
}

// ── Hooks ──────────────────────────────────────────────────────────────

export function useN8nWorkflows() {
  return useQuery({
    queryKey: ["n8n", "workflows"],
    queryFn: () => n8nProxy<{ data: N8nWorkflow[] }>("GET", "/workflows"),
    select: (response) => response.data ?? [],
    staleTime: 30_000,
    retry: 1,
  });
}

export function useN8nWorkflow(workflowId: string | null) {
  return useQuery({
    queryKey: ["n8n", "workflows", workflowId],
    queryFn: () => n8nProxy<N8nWorkflow>("GET", `/workflows/${workflowId}`),
    enabled: !!workflowId,
    staleTime: 30_000,
  });
}

export function useN8nExecutions(limit = 20) {
  return useQuery({
    queryKey: ["n8n", "executions", limit],
    queryFn: () =>
      n8nProxy<{ data: N8nExecution[] }>("GET", "/executions", {
        limit: String(limit),
      }),
    select: (response) => response.data ?? [],
    staleTime: 15_000,
    retry: 1,
  });
}

export function useN8nActivateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workflowId: string) =>
      n8nProxy<N8nWorkflow>("POST", `/workflows/${workflowId}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["n8n", "workflows"] });
    },
  });
}

export function useN8nDeactivateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workflowId: string) =>
      n8nProxy<N8nWorkflow>("POST", `/workflows/${workflowId}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["n8n", "workflows"] });
    },
  });
}

export type { N8nWorkflow, N8nExecution };
