import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

/**
 * Agent Optimizer Edge Function
 *
 * Meta-agent that reviews execution logs for each agent and:
 *   1. Identifies error patterns and failure trends
 *   2. Analyzes cost efficiency (tokens per successful task)
 *   3. Suggests system prompt improvements
 *   4. Recommends skill additions based on task failures
 *   5. Generates weekly performance reports
 *
 * Run on schedule (weekly via n8n cron) or manually by admin.
 */

interface OptimizationReport {
  agentId: string;
  agentName: string;
  period: { start: string; end: string };
  performance: {
    totalTasks: number;
    successRate: number;
    avgDurationMs: number;
    totalCost: number;
    costPerTask: number;
    tokensPerTask: number;
  };
  errorPatterns: Array<{
    pattern: string;
    count: number;
    suggestion: string;
  }>;
  recommendations: string[];
  promptSuggestions: string[];
}

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const requestOrigin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(requestOrigin);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ── Auth (admin or cron) ─────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    let userId: string | null = null;

    if (authHeader) {
      const userClient = createClient(supabaseUrl, supabaseServiceKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id ?? null;
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // ── Parse request ────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const targetUserId = body.userId ?? userId;
    const daysBack = body.daysBack ?? 7;
    const targetAgentId = body.agentId ?? null;

    if (!targetUserId) {
      return jsonResponse(400, { error: "userId required" }, corsHeaders);
    }

    const since = new Date(Date.now() - daysBack * 86400000).toISOString();
    const reports: OptimizationReport[] = [];

    // ── Get agents to analyze ────────────────────────────────────
    let agentQuery = adminClient
      .from("agent_configs")
      .select("agent_key, name")
      .eq("user_id", targetUserId);

    if (targetAgentId) {
      agentQuery = agentQuery.eq("agent_key", targetAgentId);
    }

    const { data: agentConfigs } = await agentQuery;
    if (!agentConfigs || agentConfigs.length === 0) {
      return jsonResponse(200, { success: true, reports: [], message: "No agents found" }, corsHeaders);
    }

    // ── Analyze each agent ───────────────────────────────────────
    for (const agent of agentConfigs) {
      const { data: executions } = await adminClient
        .from("agent_executions")
        .select("*")
        .eq("user_id", targetUserId)
        .eq("agent_id", agent.agent_key)
        .gte("started_at", since)
        .order("started_at", { ascending: false });

      if (!executions || executions.length === 0) continue;

      const totalTasks = executions.length;
      const successfulTasks = executions.filter((e) => e.status === "success");
      const failedTasks = executions.filter((e) => e.status === "failed");
      const successRate = totalTasks > 0 ? Math.round((successfulTasks.length / totalTasks) * 100 * 10) / 10 : 0;

      const totalDuration = executions.reduce((s, e) => s + (e.duration_ms ?? 0), 0);
      const avgDurationMs = totalTasks > 0 ? Math.round(totalDuration / totalTasks) : 0;

      const totalCost = executions.reduce((s, e) => s + (e.cost_usd ?? 0), 0);
      const totalTokens = executions.reduce((s, e) => s + (e.tokens_used ?? 0), 0);

      // ── Error pattern analysis ─────────────────────────────────
      const errorPatterns: Array<{ pattern: string; count: number; suggestion: string }> = [];

      if (failedTasks.length > 0) {
        const errorMessages = failedTasks
          .map((e) => e.output_summary ?? "")
          .filter(Boolean);

        // Group similar errors
        const errorGroups = new Map<string, number>();
        for (const msg of errorMessages) {
          // Normalize error messages to find patterns
          const normalized = msg
            .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "<UUID>")
            .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, "<TIMESTAMP>")
            .replace(/\d+/g, "<N>")
            .slice(0, 100);

          errorGroups.set(normalized, (errorGroups.get(normalized) ?? 0) + 1);
        }

        for (const [pattern, count] of errorGroups) {
          let suggestion = "Review agent system prompt for this error type";

          if (pattern.includes("timeout") || pattern.includes("timed out")) {
            suggestion = "Increase timeout or break task into smaller steps";
          } else if (pattern.includes("rate limit") || pattern.includes("429")) {
            suggestion = "Implement backoff or switch to a cheaper model for high-volume tasks";
          } else if (pattern.includes("token") || pattern.includes("context length")) {
            suggestion = "Reduce context window usage — summarize conversation history";
          } else if (pattern.includes("tool") || pattern.includes("function")) {
            suggestion = "Tool call failed — verify tool definitions and input validation";
          } else if (pattern.includes("permission") || pattern.includes("unauthorized")) {
            suggestion = "Check agent permissions and RLS policies";
          }

          errorPatterns.push({ pattern, count, suggestion });
        }
      }

      // ── Generate recommendations ──────────────────────────────
      const recommendations: string[] = [];
      const promptSuggestions: string[] = [];

      if (successRate < 80) {
        recommendations.push(`Success rate is ${successRate}% — review failed task patterns and update system prompt`);
      }
      if (successRate < 50) {
        recommendations.push("Critical: more than half of tasks are failing. Consider rewriting the system prompt entirely.");
      }

      const costPerTask = totalTasks > 0 ? totalCost / totalTasks : 0;
      if (costPerTask > 0.10) {
        recommendations.push(`High cost per task ($${costPerTask.toFixed(3)}). Consider using a smaller model for simple tasks.`);
      }

      const tokensPerTask = totalTasks > 0 ? Math.round(totalTokens / totalTasks) : 0;
      if (tokensPerTask > 8000) {
        recommendations.push(`High token usage per task (${tokensPerTask}). Optimize system prompt length and context injection.`);
      }

      if (avgDurationMs > 30000) {
        recommendations.push(`Average task duration is ${(avgDurationMs / 1000).toFixed(1)}s. Consider parallel tool calls or task decomposition.`);
      }

      // Prompt suggestions based on error patterns
      if (errorPatterns.some((e) => e.pattern.includes("tool"))) {
        promptSuggestions.push("Add explicit tool usage examples to the system prompt");
      }
      if (failedTasks.length > 0 && successfulTasks.length > 0) {
        promptSuggestions.push("Analyze successful vs failed task patterns to refine instructions");
      }
      if (tokensPerTask > 5000) {
        promptSuggestions.push("Shorten system prompt — current prompt may be too verbose");
      }

      reports.push({
        agentId: agent.agent_key,
        agentName: agent.name,
        period: { start: since, end: new Date().toISOString() },
        performance: {
          totalTasks,
          successRate,
          avgDurationMs,
          totalCost: Math.round(totalCost * 10000) / 10000,
          costPerTask: Math.round(costPerTask * 10000) / 10000,
          tokensPerTask,
        },
        errorPatterns,
        recommendations,
        promptSuggestions,
      });
    }

    // ── Store report in audit log ────────────────────────────────
    await adminClient.from("audit_log").insert({
      user_id: targetUserId,
      action: "agent_optimizer.report",
      resource_type: "optimization",
      description: `Agent optimization report: ${reports.length} agents analyzed over ${daysBack} days`,
      metadata: {
        daysBack,
        agentCount: reports.length,
        totalRecommendations: reports.reduce((s, r) => s + r.recommendations.length, 0),
        generatedAt: new Date().toISOString(),
      },
    }).catch((err: Error) => {
      console.error("Failed to log optimization report:", err.message);
    });

    return jsonResponse(200, {
      success: true,
      generatedAt: new Date().toISOString(),
      period: { daysBack, since },
      reports,
      summary: {
        agentsAnalyzed: reports.length,
        avgSuccessRate: reports.length > 0
          ? Math.round(reports.reduce((s, r) => s + r.performance.successRate, 0) / reports.length * 10) / 10
          : 0,
        totalRecommendations: reports.reduce((s, r) => s + r.recommendations.length, 0),
        totalErrorPatterns: reports.reduce((s, r) => s + r.errorPatterns.length, 0),
      },
    }, corsHeaders);
  } catch (error) {
    console.error("Agent Optimizer error:", error);
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
