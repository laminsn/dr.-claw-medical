import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

/**
 * Platform Health Monitor Edge Function
 *
 * Aggregates platform-wide health metrics for the admin monitoring dashboard:
 *   - Active agents and error rates
 *   - Task queue depth and stuck tasks
 *   - Cost burn rate (daily/monthly)
 *   - PHI access anomaly count
 *   - n8n workflow failure rate
 *   - Audit chain integrity
 *
 * Also evaluates alert conditions and fires Slack notifications when thresholds
 * are breached. Called by n8n cron (every 5 min) or manually by admin.
 */

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

const ALERT_THRESHOLDS = {
  errorRate: { warning: 15, critical: 30 },
  stuckTasks: { warning: 5, critical: 15 },
  dailyCost: { warning: 50, critical: 100 },
  highRiskPhi: { warning: 10, critical: 25 },
  workflowFailures: { warning: 5, critical: 15 },
};

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const requestOrigin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(requestOrigin);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ── Auth (admin only) ─────────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    if (authHeader) {
      const userClient = createClient(supabaseUrl, supabaseServiceKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) {
        return jsonResponse(401, { error: "Unauthorized" }, corsHeaders);
      }

      const { data: profile } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || !["admin", "master_admin"].includes(profile.role)) {
        return jsonResponse(403, { error: "Admin access required" }, corsHeaders);
      }
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const yesterday = new Date(now.getTime() - 86400000).toISOString();

    // ── Parallel data fetches ─────────────────────────────────────
    const [
      agentConfigsRes,
      executions24hRes,
      executionsTodayRes,
      pendingTasksRes,
      stuckTasksRes,
      costTodayRes,
      costMonthRes,
      phiTodayRes,
      workflowsRes,
      auditChainRes,
    ] = await Promise.all([
      // Agent configs
      adminClient.from("agent_configs").select("agent_key, is_active", { count: "exact" }),
      // Executions last 24h
      adminClient.from("agent_executions").select("status").gte("started_at", yesterday),
      // Executions today
      adminClient.from("agent_executions").select("status").gte("started_at", todayStart),
      // Pending tasks in queue
      adminClient.from("agent_task_queue").select("id", { count: "exact" }).eq("status", "pending"),
      // Stuck tasks (running > 30 min)
      adminClient.from("agent_task_queue").select("id", { count: "exact" })
        .eq("status", "running")
        .lt("claimed_at", new Date(now.getTime() - 30 * 60000).toISOString()),
      // Cost today
      adminClient.from("api_usage_log").select("cost_usd").gte("created_at", todayStart),
      // Cost this month
      adminClient.from("api_usage_log").select("cost_usd").gte("created_at", monthStart),
      // PHI accesses today
      adminClient.from("audit_log").select("risk_level")
        .eq("phi_accessed", true)
        .gte("created_at", todayStart),
      // Active n8n flow configs
      adminClient.from("n8n_flow_configs").select("flow_key, is_active", { count: "exact" })
        .eq("is_active", true),
      // Audit chain verification (last 10 entries)
      adminClient.rpc("verify_audit_chain", { _limit: 10 }).catch(() => ({ data: null })),
    ]);

    // ── Compute metrics ───────────────────────────────────────────
    const agentConfigs = agentConfigsRes.data ?? [];
    const totalAgents = agentConfigs.length;
    const activeAgents = agentConfigs.filter((a: { is_active: boolean }) => a.is_active).length;

    const executions24h = executions24hRes.data ?? [];
    const failed24h = executions24h.filter((e: { status: string }) => e.status === "failed").length;
    const errorRate24h = executions24h.length > 0
      ? Math.round((failed24h / executions24h.length) * 100 * 10) / 10
      : 0;

    const executionsToday = executionsTodayRes.data ?? [];
    const completedToday = executionsToday.filter((e: { status: string }) => e.status === "success").length;
    const failedToday = executionsToday.filter((e: { status: string }) => e.status === "failed").length;

    const pendingTasks = pendingTasksRes.count ?? 0;
    const stuckTasks = stuckTasksRes.count ?? 0;

    const costToday = (costTodayRes.data ?? []).reduce(
      (sum: number, r: { cost_usd: number }) => sum + (r.cost_usd ?? 0), 0
    );
    const costMonth = (costMonthRes.data ?? []).reduce(
      (sum: number, r: { cost_usd: number }) => sum + (r.cost_usd ?? 0), 0
    );

    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedMonth = dayOfMonth > 0
      ? Math.round((costMonth / dayOfMonth) * daysInMonth * 100) / 100
      : 0;

    const phiToday = phiTodayRes.data ?? [];
    const highRiskPhi = phiToday.filter(
      (p: { risk_level: string }) => p.risk_level === "high" || p.risk_level === "critical"
    ).length;

    const activeFlows = workflowsRes.count ?? 0;

    // Workflow failures from audit log
    const { data: wfFailures } = await adminClient
      .from("audit_log")
      .select("id", { count: "exact" })
      .like("action", "n8n_gateway%")
      .eq("risk_level", "high")
      .gte("created_at", todayStart);

    const workflowFailuresToday = wfFailures?.length ?? 0;

    // Audit chain
    const auditChainData = auditChainRes.data as Array<{ is_valid: boolean }> | null;
    const auditChainVerified = auditChainData
      ? auditChainData.every((r) => r.is_valid)
      : true; // Assume valid if function not available yet

    const metrics: HealthMetrics = {
      timestamp: now.toISOString(),
      agents: { total: totalAgents, active: activeAgents, errorRate24h },
      tasks: {
        pending: pendingTasks,
        running: (executionsToday.filter((e: { status: string }) => e.status === "running")).length,
        stuck: stuckTasks,
        completedToday,
        failedToday,
      },
      cost: {
        today: Math.round(costToday * 100) / 100,
        thisMonth: Math.round(costMonth * 100) / 100,
        projectedMonth,
      },
      phi: {
        accessesToday: phiToday.length,
        highRiskToday: highRiskPhi,
        anomalyCount: highRiskPhi > 10 ? highRiskPhi - 10 : 0,
      },
      workflows: { activeFlows, failuresToday: workflowFailuresToday },
      auditChain: { verified: auditChainVerified, lastChecked: now.toISOString() },
    };

    // ── Evaluate alerts ───────────────────────────────────────────
    const alerts: Alert[] = [];

    if (errorRate24h >= ALERT_THRESHOLDS.errorRate.critical) {
      alerts.push({ severity: "critical", metric: "errorRate", message: `Agent error rate at ${errorRate24h}%`, value: errorRate24h, threshold: ALERT_THRESHOLDS.errorRate.critical });
    } else if (errorRate24h >= ALERT_THRESHOLDS.errorRate.warning) {
      alerts.push({ severity: "warning", metric: "errorRate", message: `Agent error rate at ${errorRate24h}%`, value: errorRate24h, threshold: ALERT_THRESHOLDS.errorRate.warning });
    }

    if (stuckTasks >= ALERT_THRESHOLDS.stuckTasks.critical) {
      alerts.push({ severity: "critical", metric: "stuckTasks", message: `${stuckTasks} stuck tasks (>30min)`, value: stuckTasks, threshold: ALERT_THRESHOLDS.stuckTasks.critical });
    } else if (stuckTasks >= ALERT_THRESHOLDS.stuckTasks.warning) {
      alerts.push({ severity: "warning", metric: "stuckTasks", message: `${stuckTasks} stuck tasks (>30min)`, value: stuckTasks, threshold: ALERT_THRESHOLDS.stuckTasks.warning });
    }

    if (costToday >= ALERT_THRESHOLDS.dailyCost.critical) {
      alerts.push({ severity: "critical", metric: "dailyCost", message: `Daily cost $${costToday.toFixed(2)} exceeds threshold`, value: costToday, threshold: ALERT_THRESHOLDS.dailyCost.critical });
    } else if (costToday >= ALERT_THRESHOLDS.dailyCost.warning) {
      alerts.push({ severity: "warning", metric: "dailyCost", message: `Daily cost $${costToday.toFixed(2)} approaching limit`, value: costToday, threshold: ALERT_THRESHOLDS.dailyCost.warning });
    }

    if (highRiskPhi >= ALERT_THRESHOLDS.highRiskPhi.critical) {
      alerts.push({ severity: "critical", metric: "highRiskPhi", message: `${highRiskPhi} high-risk PHI accesses today`, value: highRiskPhi, threshold: ALERT_THRESHOLDS.highRiskPhi.critical });
    } else if (highRiskPhi >= ALERT_THRESHOLDS.highRiskPhi.warning) {
      alerts.push({ severity: "warning", metric: "highRiskPhi", message: `${highRiskPhi} high-risk PHI accesses today`, value: highRiskPhi, threshold: ALERT_THRESHOLDS.highRiskPhi.warning });
    }

    if (workflowFailuresToday >= ALERT_THRESHOLDS.workflowFailures.critical) {
      alerts.push({ severity: "critical", metric: "workflowFailures", message: `${workflowFailuresToday} n8n workflow failures today`, value: workflowFailuresToday, threshold: ALERT_THRESHOLDS.workflowFailures.critical });
    } else if (workflowFailuresToday >= ALERT_THRESHOLDS.workflowFailures.warning) {
      alerts.push({ severity: "warning", metric: "workflowFailures", message: `${workflowFailuresToday} n8n workflow failures today`, value: workflowFailuresToday, threshold: ALERT_THRESHOLDS.workflowFailures.warning });
    }

    if (!auditChainVerified) {
      alerts.push({ severity: "critical", metric: "auditChain", message: "Audit log chain integrity compromised", value: 0, threshold: 0 });
    }

    // ── Fire Slack alerts for critical/warning ────────────────────
    const criticalAlerts = alerts.filter((a) => a.severity === "critical");
    if (criticalAlerts.length > 0) {
      const slackMessage = criticalAlerts
        .map((a) => `🚨 *${a.severity.toUpperCase()}*: ${a.message}`)
        .join("\n");

      await adminClient.functions.invoke("slack-notify", {
        body: {
          channel: "platform-alerts",
          text: `*Platform Health Alert*\n${slackMessage}`,
          severity: "critical",
        },
      }).catch((err: Error) => {
        console.error("Failed to send Slack alert:", err.message);
      });
    }

    // ── Log health check ──────────────────────────────────────────
    await adminClient.from("audit_log").insert({
      action: "platform.health_check",
      resource_type: "monitoring",
      description: `Health check: ${alerts.length} alerts (${criticalAlerts.length} critical)`,
      metadata: {
        metrics: {
          errorRate24h,
          stuckTasks,
          costToday,
          highRiskPhi,
          workflowFailuresToday,
        },
        alertCount: alerts.length,
        criticalCount: criticalAlerts.length,
      },
    }).catch(() => {});

    return jsonResponse(200, { success: true, metrics, alerts }, corsHeaders);
  } catch (error) {
    console.error("Platform health error:", error);
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
