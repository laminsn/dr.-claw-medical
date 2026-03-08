import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

/**
 * Breach Monitor Edge Function
 *
 * Anomaly detection for PHI access patterns. Designed to run on a
 * schedule (via n8n cron or Supabase pg_cron) every 15 minutes.
 *
 * Checks for:
 *   1. Bulk PHI access — user decrypted > N PHI records in window
 *   2. Off-hours access — PHI access outside business hours
 *   3. Auth spikes — unusual login volume
 *   4. Failed auth patterns — brute force detection
 *   5. Audit chain tampering — broken hash chain
 */

interface Alert {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  userId?: string;
  metadata: Record<string, unknown>;
}

const THRESHOLDS = {
  bulkPhiAccessCount: 20,       // max PHI decryptions per user per hour
  offHoursStart: 22,            // 10 PM
  offHoursEnd: 6,               // 6 AM
  authSpikeMultiplier: 3,       // 3x normal login volume
  failedAuthThreshold: 10,      // max failed logins per IP per hour
  checkWindowMinutes: 15,
};

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const requestOrigin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(requestOrigin);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Optional auth for manual invocation (cron calls skip auth)
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const userClient = createClient(supabaseUrl, supabaseServiceKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (user) {
        // Verify admin role
        const { data: profile } = await adminClient
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (!["admin", "master_admin"].includes(profile?.role ?? "")) {
          return jsonResponse(403, { error: "Admin access required" }, corsHeaders);
        }
      }
    }

    const windowStart = new Date(Date.now() - THRESHOLDS.checkWindowMinutes * 60 * 1000).toISOString();
    const alerts: Alert[] = [];

    // ── 1. Bulk PHI Access ─────────────────────────────────────────
    const { data: phiAccess } = await adminClient
      .from("audit_log")
      .select("user_id, action")
      .eq("phi_accessed", true)
      .gte("created_at", windowStart);

    if (phiAccess) {
      const userPhiCounts = new Map<string, number>();
      for (const entry of phiAccess) {
        if (entry.user_id) {
          userPhiCounts.set(
            entry.user_id,
            (userPhiCounts.get(entry.user_id) ?? 0) + 1,
          );
        }
      }

      for (const [userId, count] of userPhiCounts) {
        if (count > THRESHOLDS.bulkPhiAccessCount) {
          alerts.push({
            type: "bulk_phi_access",
            severity: count > THRESHOLDS.bulkPhiAccessCount * 2 ? "critical" : "high",
            description: `User accessed ${count} PHI records in ${THRESHOLDS.checkWindowMinutes}min (threshold: ${THRESHOLDS.bulkPhiAccessCount})`,
            userId,
            metadata: { count, threshold: THRESHOLDS.bulkPhiAccessCount },
          });
        }
      }
    }

    // ── 2. Off-Hours PHI Access ────────────────────────────────────
    const currentHour = new Date().getUTCHours();
    const isOffHours = currentHour >= THRESHOLDS.offHoursStart || currentHour < THRESHOLDS.offHoursEnd;

    if (isOffHours && phiAccess && phiAccess.length > 0) {
      const uniqueUsers = new Set(phiAccess.map((e) => e.user_id).filter(Boolean));
      alerts.push({
        type: "off_hours_phi_access",
        severity: "medium",
        description: `${phiAccess.length} PHI access events from ${uniqueUsers.size} user(s) during off-hours (${currentHour}:00 UTC)`,
        metadata: { eventCount: phiAccess.length, uniqueUsers: uniqueUsers.size, hour: currentHour },
      });
    }

    // ── 3. Auth Spikes ─────────────────────────────────────────────
    const { data: recentLogins, count: loginCount } = await adminClient
      .from("audit_log")
      .select("user_id", { count: "exact" })
      .eq("action", "auth.login")
      .gte("created_at", windowStart);

    // Compare to previous window
    const prevWindowStart = new Date(
      Date.now() - THRESHOLDS.checkWindowMinutes * 2 * 60 * 1000,
    ).toISOString();

    const { count: prevLoginCount } = await adminClient
      .from("audit_log")
      .select("user_id", { count: "exact" })
      .eq("action", "auth.login")
      .gte("created_at", prevWindowStart)
      .lt("created_at", windowStart);

    const currentLogins = loginCount ?? 0;
    const previousLogins = prevLoginCount ?? 1; // avoid div by zero

    if (currentLogins > previousLogins * THRESHOLDS.authSpikeMultiplier && currentLogins > 5) {
      alerts.push({
        type: "auth_spike",
        severity: "high",
        description: `Login volume spike: ${currentLogins} logins (previous window: ${previousLogins}, ${THRESHOLDS.authSpikeMultiplier}x threshold)`,
        metadata: { currentLogins, previousLogins, multiplier: THRESHOLDS.authSpikeMultiplier },
      });
    }

    // ── 4. Failed Auth Patterns ────────────────────────────────────
    const { data: failedLogins } = await adminClient
      .from("audit_log")
      .select("ip_address, metadata")
      .eq("action", "auth.login_failed")
      .gte("created_at", windowStart);

    if (failedLogins) {
      const ipCounts = new Map<string, number>();
      for (const entry of failedLogins) {
        const ip = entry.ip_address ?? "unknown";
        ipCounts.set(ip, (ipCounts.get(ip) ?? 0) + 1);
      }

      for (const [ip, count] of ipCounts) {
        if (count >= THRESHOLDS.failedAuthThreshold) {
          alerts.push({
            type: "brute_force_suspect",
            severity: "critical",
            description: `${count} failed login attempts from IP ${ip} in ${THRESHOLDS.checkWindowMinutes}min`,
            metadata: { ip, count, threshold: THRESHOLDS.failedAuthThreshold },
          });
        }
      }
    }

    // ── 5. Audit Chain Integrity ───────────────────────────────────
    const { data: chainCheck } = await adminClient.rpc("verify_audit_chain", {
      _start_id: null,
      _limit: 100,
    });

    if (chainCheck) {
      const broken = (chainCheck as Array<{ is_valid: boolean; log_id: string }>)
        .filter((r) => !r.is_valid);

      if (broken.length > 0) {
        alerts.push({
          type: "audit_chain_broken",
          severity: "critical",
          description: `Audit log tampering detected: ${broken.length} entries have broken hash chain`,
          metadata: { brokenIds: broken.map((b) => b.log_id), count: broken.length },
        });
      }
    }

    // ── Log alerts ─────────────────────────────────────────────────
    for (const alert of alerts) {
      await adminClient.from("audit_log").insert({
        action: "breach_monitor.alert",
        resource_type: "security",
        description: `[${alert.severity.toUpperCase()}] ${alert.type}: ${alert.description}`,
        phi_accessed: alert.type.includes("phi"),
        risk_level: alert.severity,
        metadata: {
          alertType: alert.type,
          ...alert.metadata,
          userId: alert.userId,
          detectedAt: new Date().toISOString(),
        },
      });
    }

    // ── Send Slack alert for high/critical ──────────────────────────
    const criticalAlerts = alerts.filter((a) => a.severity === "high" || a.severity === "critical");

    if (criticalAlerts.length > 0) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/slack-notify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            channel: "#security-alerts",
            text: `:rotating_light: *Breach Monitor Alert*\n${criticalAlerts.map((a) => `• [${a.severity.toUpperCase()}] ${a.description}`).join("\n")}`,
          }),
        });
      } catch (err) {
        console.error("Failed to send Slack alert:", err);
      }
    }

    // ── Response ───────────────────────────────────────────────────
    return jsonResponse(200, {
      success: true,
      checkedAt: new Date().toISOString(),
      windowMinutes: THRESHOLDS.checkWindowMinutes,
      alertCount: alerts.length,
      alerts: alerts.map((a) => ({
        type: a.type,
        severity: a.severity,
        description: a.description,
      })),
    }, corsHeaders);
  } catch (error) {
    console.error("Breach Monitor error:", error);
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(500, { success: false, error: errMsg }, getCorsHeaders(null));
  }
});

function jsonResponse(status: number, body: unknown, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
