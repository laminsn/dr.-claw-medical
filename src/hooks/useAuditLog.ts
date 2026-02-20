import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type RiskLevel = "low" | "medium" | "high" | "critical";

interface AuditEntry {
  action: string;
  resourceType?: string;
  resourceId?: string;
  description?: string;
  phiAccessed?: boolean;
  riskLevel?: RiskLevel;
  metadata?: Record<string, unknown>;
}

/**
 * Hook for writing to the HIPAA audit log.
 * Wraps the Supabase audit_log table with typed helpers.
 *
 * Usage:
 *   const { logAction, logPhiAccess, logAuthEvent } = useAuditLog();
 *   await logAction({ action: "task.create", resourceType: "task", resourceId: "123" });
 *   await logPhiAccess("patient_record", "rec-456", "Viewed patient chart");
 */
export function useAuditLog() {
  const { user } = useAuth();

  const logAction = useCallback(
    async (entry: AuditEntry) => {
      if (!user) return;

      try {
        // audit_log table may not exist; wrap gracefully
        await (supabase as any).from("audit_log").insert({
          user_id: user.id,
          action: entry.action,
          resource_type: entry.resourceType ?? null,
          resource_id: entry.resourceId ?? null,
          description: entry.description ?? null,
          phi_accessed: entry.phiAccessed ?? false,
          risk_level: entry.riskLevel ?? "low",
          metadata: entry.metadata ?? {},
        });
      } catch (err) {
        // Audit logging should never break the app
        console.error("Audit log write failed:", err);
      }
    },
    [user]
  );

  const logPhiAccess = useCallback(
    async (resourceType: string, resourceId: string, description: string) => {
      await logAction({
        action: "phi.access",
        resourceType,
        resourceId,
        description,
        phiAccessed: true,
        riskLevel: "high",
      });
    },
    [logAction]
  );

  const logAuthEvent = useCallback(
    async (eventType: "login" | "logout" | "signup" | "password_reset", success: boolean) => {
      await logAction({
        action: `auth.${eventType}`,
        resourceType: "user",
        description: `${eventType} ${success ? "succeeded" : "failed"}`,
        riskLevel: success ? "low" : "medium",
        metadata: { success },
      });
    },
    [logAction]
  );

  const logAgentExecution = useCallback(
    async (agentId: string, taskDescription: string, zone: string) => {
      await logAction({
        action: "agent.invoke",
        resourceType: "agent",
        resourceId: agentId,
        description: taskDescription,
        phiAccessed: zone === "clinical",
        riskLevel: zone === "clinical" ? "high" : "low",
        metadata: { zone },
      });
    },
    [logAction]
  );

  return { logAction, logPhiAccess, logAuthEvent, logAgentExecution };
}
