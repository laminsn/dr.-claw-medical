import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";
import { scanObject, sanitizeObject } from "../_shared/phi-scanner.ts";

/**
 * N8N Gateway Edge Function
 *
 * Server-side execution layer for Zone 1 (Clinical) agent requests
 * that must pass through N8N workflows while maintaining HIPAA/PHI compliance.
 *
 * This edge function:
 *  1. Authenticates the calling user
 *  2. Validates the target N8N flow and agent authorization
 *  3. Scans the payload for PHI and redacts it
 *  4. Forwards the sanitized payload to the N8N webhook
 *  5. Logs an immutable audit trail to the database
 *  6. Returns the response with audit metadata
 */

const GATEWAY_VERSION = "1.1.0";

// ── SHA-256 hashing ───────────────────────────────────────────────────

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Main handler ──────────────────────────────────────────────────────

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const startTime = Date.now();
  const requestOrigin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(requestOrigin);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ── Auth ────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse(401, { error: "Missing authorization" }, corsHeaders);
    }

    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return jsonResponse(401, { error: "Invalid authentication" }, corsHeaders);
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // ── Parse request ───────────────────────────────────────────────
    const body = await req.json();
    const {
      flowId,
      agentId,
      agentName,
      agentZone,
      payload,
      sessionId,
    } = body;

    if (!flowId || !agentId || !agentZone || !payload) {
      return jsonResponse(400, { error: "Missing required fields: flowId, agentId, agentZone, payload" }, corsHeaders);
    }

    // ── Lookup webhook URL from DB (never trust client-provided URLs) ──
    const { data: flowConfig, error: flowErr } = await adminClient
      .from("n8n_flow_configs")
      .select("webhook_url, allowed_agent_ids")
      .eq("user_id", user.id)
      .eq("flow_key", flowId)
      .eq("is_active", true)
      .single();

    if (flowErr || !flowConfig?.webhook_url) {
      return jsonResponse(404, { error: `Flow config not found for flowId: ${flowId}` }, corsHeaders);
    }

    // Validate agent is authorized for this flow
    if (flowConfig.allowed_agent_ids && flowConfig.allowed_agent_ids.length > 0) {
      if (!flowConfig.allowed_agent_ids.includes(agentId)) {
        return jsonResponse(403, { error: `Agent ${agentId} is not authorized for flow ${flowId}` }, corsHeaders);
      }
    }

    const webhookUrl = flowConfig.webhook_url;

    // ── Zone enforcement ────────────────────────────────────────────
    const clinicalZone = agentZone === "clinical";

    // ── PHI scan ────────────────────────────────────────────────────
    const payloadStr = JSON.stringify(payload);
    const originalHash = await sha256(payloadStr);
    const { fieldsWithPhi, highestRisk } = scanObject(payload);
    const hasPhi = fieldsWithPhi.length > 0;

    let sanitizedPayload = payload;
    let verdict: "allowed" | "blocked" | "sanitized" = "allowed";

    if (hasPhi) {
      sanitizedPayload = sanitizeObject(payload);
      verdict = "sanitized";
    }

    const sanitizedStr = JSON.stringify(sanitizedPayload);
    const sanitizedHash = await sha256(sanitizedStr);

    // ── Block high-risk PHI from clinical zone leaving unsanitized ──
    if (clinicalZone && highestRisk === "high" && !hasPhi) {
      verdict = "blocked";
    }

    if (verdict === "blocked") {
      return jsonResponse(403, {
        success: false,
        verdict: "blocked",
        phiScanResult: {
          containsPhi: hasPhi,
          riskLevel: highestRisk,
          fieldsRedacted: fieldsWithPhi,
          originalHash,
          sanitizedHash,
        },
      }, corsHeaders);
    }

    // ── Execute N8N webhook ─────────────────────────────────────────
    let n8nResponse: unknown = null;
    let responseStatus: number | null = null;
    let errorMessage: string | null = null;

    if (webhookUrl && verdict !== "blocked") {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const resp = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-DrClaw-Gateway-Version": GATEWAY_VERSION,
            "X-DrClaw-Agent-Id": agentId,
            "X-DrClaw-Agent-Zone": agentZone,
            "X-DrClaw-Flow-Id": flowId,
          },
          body: JSON.stringify({
            payload: sanitizedPayload,
            metadata: {
              agentId,
              agentName: agentName || "Unknown",
              zone: agentZone,
              flowId,
              timestamp: new Date().toISOString(),
              gatewayVersion: GATEWAY_VERSION,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        responseStatus = resp.status;

        if (resp.ok) {
          n8nResponse = await resp.json().catch(() => ({ status: "ok" }));
        } else {
          errorMessage = `N8N returned status ${resp.status}`;
        }
      } catch (err) {
        errorMessage = err instanceof Error ? err.message : "N8N webhook failed";
      }
    }

    // ── Audit log ───────────────────────────────────────────────────
    const durationMs = Date.now() - startTime;

    await adminClient.from("audit_log").insert({
      user_id: user.id,
      action: "n8n_gateway.execute",
      resource_type: "n8n_flow",
      description: `N8N Gateway: ${verdict} | Flow: ${flowId} | Agent: ${agentId} (${agentZone}) | PHI: ${hasPhi ? `YES (${highestRisk} risk, ${fieldsWithPhi.length} fields)` : "none"}`,
      risk_level: hasPhi ? (highestRisk === "high" ? "high" : highestRisk === "medium" ? "medium" : "low") : "low",
      metadata: {
        flowId,
        agentId,
        agentName: agentName || "Unknown",
        agentZone,
        verdict,
        executionMode: "edge",
        phiDetected: hasPhi,
        phiRiskLevel: highestRisk,
        fieldsRedacted: fieldsWithPhi,
        originalPayloadHash: originalHash,
        sanitizedPayloadHash: sanitizedHash,
        n8nResponseStatus: responseStatus,
        durationMs,
        sessionId: sessionId || null,
        gatewayVersion: GATEWAY_VERSION,
      },
    }).catch((err: Error) => {
      console.error("Failed to write audit log:", err.message);
    });

    // ── Response ────────────────────────────────────────────────────
    return jsonResponse(200, {
      success: !errorMessage,
      verdict,
      phiScanResult: {
        containsPhi: hasPhi,
        riskLevel: highestRisk,
        fieldsRedacted: fieldsWithPhi,
        originalHash,
        sanitizedHash,
      },
      flowResponse: n8nResponse,
      errorMessage,
      durationMs,
      gatewayVersion: GATEWAY_VERSION,
    }, corsHeaders);
  } catch (error) {
    console.error("N8N Gateway error:", error);
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(500, {
      success: false,
      verdict: "blocked",
      error: errMsg,
      durationMs: Date.now() - startTime,
    }, getCorsHeaders(null));
  }
});

function jsonResponse(status: number, body: unknown, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
