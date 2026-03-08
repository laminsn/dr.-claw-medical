/**
 * usePlatformHooks — CRUD hooks for the platform_hooks table.
 * Admin-only writes; all authenticated users can read.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Types ────────────────────────────────────────────────────────────

export type HookEventType =
  | "pre_task"
  | "post_task"
  | "pre_llm_call"
  | "post_llm_call"
  | "on_phi_detected";

export type HookHandlerType = "edge_function" | "n8n_workflow" | "webhook";

export interface PlatformHook {
  id: string;
  name: string;
  slug: string;
  event_type: HookEventType;
  handler_type: HookHandlerType;
  handler_config: Record<string, unknown>;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export type PlatformHookInsert = Omit<PlatformHook, "id" | "created_at" | "updated_at">;
export type PlatformHookUpdate = Partial<PlatformHookInsert> & { id: string };

const QUERY_KEY = "platform-hooks";

// ── List ─────────────────────────────────────────────────────────────

export function usePlatformHooks() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async (): Promise<PlatformHook[]> => {
      const { data, error } = await (supabase as any)
        .from("platform_hooks")
        .select("*")
        .order("priority", { ascending: true });

      if (error) throw error;
      return (data ?? []) as PlatformHook[];
    },
  });
}

// ── Create ───────────────────────────────────────────────────────────

export function useCreateHook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hook: PlatformHookInsert) => {
      const { data, error } = await (supabase as any)
        .from("platform_hooks")
        .insert(hook)
        .select()
        .single();

      if (error) throw error;
      return data as PlatformHook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ── Update ───────────────────────────────────────────────────────────

export function useUpdateHook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: PlatformHookUpdate) => {
      const { data, error } = await (supabase as any)
        .from("platform_hooks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as PlatformHook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ── Delete ───────────────────────────────────────────────────────────

export function useDeleteHook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("platform_hooks")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ── Toggle Active ────────────────────────────────────────────────────

export function useToggleHookActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("platform_hooks")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
