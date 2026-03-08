import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type PhiAccessLevel = "full" | "de_identified" | "none";

interface ProtectedPhiRouteProps {
  children: React.ReactNode;
  requiredAccess?: PhiAccessLevel;
  fallbackPath?: string;
}

/**
 * Route guard that checks both authentication AND PHI access level.
 *
 * Access hierarchy:
 *   - full:           can see all PHI (admin/owner with BAA)
 *   - de_identified:  can see de-identified data only (manager)
 *   - none:           no PHI access at all (regular member)
 *
 * Usage:
 *   <ProtectedPhiRoute requiredAccess="full">
 *     <PatientRecords />
 *   </ProtectedPhiRoute>
 */
const ProtectedPhiRoute = ({
  children,
  requiredAccess = "full",
  fallbackPath = "/dashboard",
}: ProtectedPhiRouteProps) => {
  const { user, loading: authLoading } = useAuth();

  const { data: membership, isLoading: memberLoading } = useQuery({
    queryKey: ["org-membership", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("default_org_id, role")
        .eq("user_id", user.id)
        .single();

      if (!profile?.default_org_id) {
        // No org yet — derive access from profile role
        const role = profile?.role ?? "user";
        return {
          role,
          phiAccess: role === "master_admin" ? "full" as const
            : role === "admin" ? "full" as const
            : "none" as const,
        };
      }

      const { data: member } = await supabase
        .from("organization_members")
        .select("role, phi_access_level")
        .eq("org_id", profile.default_org_id)
        .eq("user_id", user.id)
        .single();

      return {
        role: member?.role ?? "member",
        phiAccess: (member?.phi_access_level ?? "none") as PhiAccessLevel,
      };
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  if (authLoading || memberLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check access level hierarchy: full > de_identified > none
  const ACCESS_HIERARCHY: Record<PhiAccessLevel, number> = {
    full: 3,
    de_identified: 2,
    none: 1,
  };

  const userLevel = ACCESS_HIERARCHY[membership?.phiAccess ?? "none"];
  const requiredLevel = ACCESS_HIERARCHY[requiredAccess];

  if (userLevel < requiredLevel) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedPhiRoute;
