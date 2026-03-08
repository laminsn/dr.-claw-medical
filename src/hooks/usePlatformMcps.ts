/**
 * usePlatformMcps — CRUD hooks for the platform_mcps table.
 * Admin-only writes; all authenticated users can read.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Types ────────────────────────────────────────────────────────────

export type McpType = "http" | "command" | "supabase_fn";

export interface PlatformMcp {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: McpType;
  config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PlatformMcpInsert = Omit<PlatformMcp, "id" | "created_at" | "updated_at">;
export type PlatformMcpUpdate = Partial<PlatformMcpInsert> & { id: string };

const QUERY_KEY = "platform-mcps";

// ── List ─────────────────────────────────────────────────────────────

export function usePlatformMcps() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async (): Promise<PlatformMcp[]> => {
      const { data, error } = await (supabase as any)
        .from("platform_mcps")
        .select("*")
        .order("name");

      if (error) throw error;
      return (data ?? []) as PlatformMcp[];
    },
  });
}

// ── Create ───────────────────────────────────────────────────────────

export function useCreateMcp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mcp: PlatformMcpInsert) => {
      const { data, error } = await (supabase as any)
        .from("platform_mcps")
        .insert(mcp)
        .select()
        .single();

      if (error) throw error;
      return data as PlatformMcp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ── Update ───────────────────────────────────────────────────────────

export function useUpdateMcp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: PlatformMcpUpdate) => {
      const { data, error } = await supabase
        .from("platform_mcps")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as PlatformMcp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ── Delete ───────────────────────────────────────────────────────────

export function useDeleteMcp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("platform_mcps")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ── Test Connection ──────────────────────────────────────────────────

export function useTestMcpConnection() {
  return useMutation({
    mutationFn: async (mcp: PlatformMcp): Promise<{ ok: boolean; message: string }> => {
      switch (mcp.type) {
        case "http": {
          const url = (mcp.config as { url?: string }).url;
          if (!url) return { ok: false, message: "No URL configured" };

          try {
            const response = await fetch(url, {
              method: "HEAD",
              signal: AbortSignal.timeout(5000),
            });
            return {
              ok: response.ok,
              message: response.ok ? `Connected (${response.status})` : `HTTP ${response.status}`,
            };
          } catch (e) {
            return { ok: false, message: `Connection failed: ${(e as Error).message}` };
          }
        }
        case "supabase_fn": {
          const fnName = (mcp.config as { function_name?: string }).function_name;
          if (!fnName) return { ok: false, message: "No function name configured" };
          return { ok: true, message: `Function "${fnName}" registered` };
        }
        case "command":
          return { ok: true, message: "Command-type MCPs are validated at runtime" };
        default:
          return { ok: false, message: `Unknown type: ${mcp.type}` };
      }
    },
  });
}
