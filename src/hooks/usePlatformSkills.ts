/**
 * usePlatformSkills — CRUD hooks for the platform_skills table.
 * Admin-only writes; all authenticated users can read.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// ── Types ────────────────────────────────────────────────────────────

export interface PlatformSkill {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  content: string;
  allowed_tools: string[] | null;
  tier: string | null;
  is_active: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type PlatformSkillInsert = Omit<PlatformSkill, "id" | "created_at" | "updated_at">;
export type PlatformSkillUpdate = Partial<PlatformSkillInsert> & { id: string };

const QUERY_KEY = "platform-skills";

// ── List ─────────────────────────────────────────────────────────────

export function usePlatformSkills() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async (): Promise<PlatformSkill[]> => {
      const { data, error } = await (supabase as any)
        .from("platform_skills")
        .select("*")
        .order("name");

      if (error) throw error;
      return (data ?? []) as PlatformSkill[];
    },
  });
}

// ── Create ───────────────────────────────────────────────────────────

export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (skill: PlatformSkillInsert) => {
      const { data, error } = await (supabase as any)
        .from("platform_skills")
        .insert(skill)
        .select()
        .single();

      if (error) throw error;
      return data as PlatformSkill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ── Update ───────────────────────────────────────────────────────────

export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: PlatformSkillUpdate) => {
      const { data, error } = await supabase
        .from("platform_skills")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as PlatformSkill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ── Delete ───────────────────────────────────────────────────────────

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("platform_skills")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

// ── Assign skill to agent ────────────────────────────────────────────

export function useAssignSkillToAgent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentKey, skillId }: { agentKey: string; skillId: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("agent_skill_assignments")
        .upsert(
          { agent_key: agentKey, skill_id: skillId, user_id: user.id },
          { onConflict: "agent_key,skill_id,user_id" }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-skills"] });
    },
  });
}

// ── Unassign skill from agent ────────────────────────────────────────

export function useUnassignSkillFromAgent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentKey, skillId }: { agentKey: string; skillId: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("agent_skill_assignments")
        .delete()
        .eq("agent_key", agentKey)
        .eq("skill_id", skillId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-skills"] });
    },
  });
}
