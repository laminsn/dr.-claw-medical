/**
 * useUserRole — Checks whether the current user has admin privileges.
 *
 * Queries the `user_roles` table for the current user and exposes
 * { role, isAdmin, isLoading, error }.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type AppRole = "master_admin" | "admin" | "manager" | "member";

interface UserRoleResult {
  role: AppRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useUserRole(): UserRoleResult {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async (): Promise<AppRole | null> => {
      if (!user) return null;

      const { data: row, error: queryError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (queryError) throw queryError;

      return (row?.role as AppRole) ?? null;
    },
    enabled: !!user,
    staleTime: 5 * 60_000,
  });

  const role = data ?? null;
  const isAdmin = role === "admin" || role === "master_admin";

  return { role, isAdmin, isLoading, error: error as Error | null };
}
