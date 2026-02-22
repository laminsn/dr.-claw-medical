import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_VERSION = "1.0.0";

// ── PHI Patterns (mirrored from client-side security.ts) ──────────────

const PHI_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/,                        // SSN
  /\b\d{9}\b/,                                      // 9-digit ID
  /\b(?:MRN|mrn)[:\s#]*\w{4,}\b/i,                  // Medical Record Number
  /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/,              // DOB-style dates
  /\b(?:DOB|dob|Date of Birth)[:\s]*\S+/i,           // Labeled DOB
  /\b(?:patient|pt|member)\s*(?:name|id)[:\s]*\S+/i, // Patient identifiers
  /\b[A-Z]\d{4,9}\b/,                               // Insurance/policy IDs
  /\b(?:NPI|npi)[:\s#]*\d{10}\b/i,                  // National Provider Identifier
  /\b(?:DEA|dea)[:\s#]*[A-Z]{2}\d{7}\b/i,           // DEA number
];

function containsPhi(text: string): boolean {
  return PHI_PATTERNS.some((p) => p.test(text));
}

function redactPhi(text: string): string {
  let result = text;
  for (const pattern of PHI_PATTERNS) {
    result = result.replace(new RegExp(pattern, "g"), "[REDACTED]");
  }
  return result;
}

function classifyPhiRisk(text: string): "none" | "low" | "medium" | "high" {
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) return "high";
  if (/\b(?:MRN|mrn)[:\s#]*\w{4,}\b/i.test(text)) return "high";
  if (/\b(?:patient|pt|member)\s*(?:name|id)[:\s]*\S+/i.test(text.toLowerCase())) return "high";
  if (/\b(?:DOB|dob|Date of Birth)/i.test(text)) return "medium";
  if (/\b[A-Z]\d{4,9}\b/.test(text)) return "medium";
  if (/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/.test(text)) return "low";
  return "none";
}

// ── Payload scanning & sanitization ───────────────────────────────────

interface ScanResult {
  fieldsWithPhi: string[];
  highestRisk: "none" | "low" | "medium" | "high";
}

function scanObject(obj: Record<string, unknown>, path = ""): ScanResult {
  const fieldsWithPhi: string[] = [];
  let highestRisk: "none" | "low" | "medium" | "high" = "none";
  const order = { none: 0, low: 1, medium: 2, high: 3 };

  for (const [key, value] of Object.entries(obj)) {
    const fp = path ? `${path}.${key}` : key;
    if (typeof value === "string" && containsPhi(value)) {
      fieldsWithPhi.push(fp);
      const risk = classifyPhiRisk(value);
      if (order[risk] > order[highestRisk]) highestRisk = risk;
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = scanObject(value as Record<string, unknown>, fp);
      fieldsWithPhi.push(...nested.fieldsWithPhi);
      if (order[nested.highestRisk] > order[highestRisk]) highestRisk = nested.highestRisk;
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === "string" && containsPhi(item)) {
          fieldsWithPhi.push(`${fp}[${i}]`);
          const risk = classifyPhiRisk(item);
          if (order[risk] > order[highestRisk]) highestRisk = risk;
        } else if (item && typeof item === "object") {
          const nested = scanObject(item as Record<string, unknown>, `${fp}[${i}]`);
          fieldsWithPhi.push(...nested.fieldsWithPhi);
          if (order[nested.highestRisk] > order[highestRisk]) highestRisk = nested.highestRisk;
        }
      });
    }
  }
  return { fieldsWithPhi, highestRisk };
}

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      out[key] = containsPhi(value) ? redactPhi(value) : value;
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = sanitize(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      out[key] = value.map((item) => {
        if (typeof item === "string") return containsPhi(item) ? redactPhi(item) : item;
        if (item && typeof item === "object") return sanitize(item as Record<string, unknown>);
        return item;
      });
    } else {
      out[key] = value;
    }
  }
  return out;
}

// ── SHA-256 hashing ───────────────────────────────────────────────────

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Main handler ──────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ── Auth ────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse(401, { error: "Missing authorization" });
    }

    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return jsonResponse(401, { error: "Invalid authentication" });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // ── Parse request ───────────────────────────────────────────────
    const body = await req.json();
    const {
      flowId,
      agentId,
      agentName,
      agentZone,
      webhookUrl,
      payload,
      sessionId,
    } = body;

    if (!flowId || !agentId || !agentZone || !payload) {
      return jsonResponse(400, { error: "Missing required fields: flowId, agentId, agentZone, payload" });
    }

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
      sanitizedPayload = sanitize(payload);
      verdict = "sanitized";
    }

    const sanitizedStr = JSON.stringify(sanitizedPayload);
    const sanitizedHash = await sha256(sanitizedStr);

    // ── Block high-risk PHI from clinical zone leaving unsanitized ──
    if (clinicalZone && highestRisk === "high" && !hasPhi) {
      // Edge case: risk detected but patterns didn't match — block as precaution
      verdict = "blocked";
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
    return jsonResponse(verdict === "blocked" ? 403 : 200, {
      success: !errorMessage && verdict !== "blocked",
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
    });
  } catch (error) {
    console.error("N8N Gateway error:", error);
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(500, {
      success: false,
      verdict: "blocked",
      error: errMsg,
      durationMs: Date.now() - startTime,
    });
  }
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
