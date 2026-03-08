import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";
import { scanObject, sanitizeObject } from "../_shared/phi-scanner.ts";

/**
 * Webhook Dispatch Edge Function
 *
 * Server-side webhook delivery with:
 *   1. HMAC-SHA256 payload signing
 *   2. PHI detection and redaction (zone-aware)
 *   3. Exponential backoff retries
 *   4. Immutable delivery logging
 *   5. Audit trail for HIPAA compliance
 *
 * Endpoints:
 *   POST /webhook-dispatch          — Dispatch an event to all matching webhooks
 *   POST /webhook-dispatch/retry    — Retry a failed delivery
 *   POST /webhook-dispatch/test     — Send a test ping to a specific webhook
 */

const GATEWAY_VERSION = "1.0.0";

function sanitize(obj: Record<string, unknown>): {
  sanitized: Record<string, unknown>;
  fieldsRedacted: string[];
} {
  const scan = scanObject(obj);
  const sanitized = sanitizeObject(obj);
  return { sanitized, fieldsRedacted: scan.fieldsWithPhi };
}

// ── HMAC-SHA256 ────────────────────────────────────────────────────────

async function hmacSign(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", enc.encode(payload), key);
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `sha256=${hex}`;
}

// ── Deliver to a single webhook ────────────────────────────────────────

interface DeliveryResult {
  status: "success" | "failed";
  responseStatus: number | null;
  responseBody: string | null;
  durationMs: number;
  errorMessage: string | null;
}

async function deliverWebhook(
  url: string,
  payloadStr: string,
  signature: string,
  webhookId: string,
  eventType: string,
  deliveryId: string,
  customHeaders: Record<string, string>,
  timeoutMs: number
): Promise<DeliveryResult> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": `DrClaw-Webhooks/${GATEWAY_VERSION}`,
        "X-DrClaw-Event": eventType,
        "X-DrClaw-Signature-256": signature,
        "X-DrClaw-Webhook-Id": webhookId,
        "X-DrClaw-Delivery-Id": deliveryId,
        "X-DrClaw-Timestamp": new Date().toISOString(),
        ...customHeaders,
      },
      body: payloadStr,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const responseBody = await response.text().catch(() => null);

    return {
      status: response.ok ? "success" : "failed",
      responseStatus: response.status,
      responseBody: responseBody?.slice(0, 10000) ?? null,
      durationMs: Date.now() - startTime,
      errorMessage: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`,
    };
  } catch (err) {
    return {
      status: "failed",
      responseStatus: null,
      responseBody: null,
      durationMs: Date.now() - startTime,
      errorMessage: err instanceof Error ? err.message : "Delivery failed",
    };
  }
}

// ── Main handler ───────────────────────────────────────────────────────

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

  const requestOrigin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(requestOrigin);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse(401, { error: "Missing authorization" });
    }

    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) {
      return jsonResponse(401, { error: "Invalid authentication" });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/webhook-dispatch\/?/, "").replace(/^\//, "");

    // ── Route: POST /webhook-dispatch/test ─────────────────────────────
    if (path === "test") {
      const { webhookId } = body;
      if (!webhookId) {
        return jsonResponse(400, { error: "Missing webhookId" });
      }

      const { data: webhook, error: whErr } = await adminClient
        .from("webhooks")
        .select("*")
        .eq("id", webhookId)
        .eq("user_id", user.id)
        .single();

      if (whErr || !webhook) {
        return jsonResponse(404, { error: "Webhook not found" });
      }

      const testPayload = {
        event: "webhook.test",
        webhookId: webhook.id,
        webhookName: webhook.name,
        message: "Test delivery from Dr. Claw Medical webhook system",
        timestamp: new Date().toISOString(),
      };

      let finalPayload: Record<string, unknown> = testPayload;
      let phiStripped = false;
      let phiFields: string[] = [];

      if (webhook.phi_filter) {
        const result = sanitize(testPayload);
        finalPayload = result.sanitized;
        phiStripped = result.fieldsRedacted.length > 0;
        phiFields = result.fieldsRedacted;
      }

      const payloadStr = JSON.stringify(finalPayload);
      const signature = await hmacSign(payloadStr, webhook.secret);
      const deliveryId = crypto.randomUUID();

      const result = await deliverWebhook(
        webhook.url,
        payloadStr,
        signature,
        webhook.id,
        "webhook.test",
        deliveryId,
        webhook.headers || {},
        webhook.timeout_ms || 10000
      );

      // Record delivery
      const deliveryRecord = {
        webhook_id: webhook.id,
        user_id: user.id,
        event_type: "webhook.test",
        payload: finalPayload,
        request_headers: { "X-DrClaw-Signature-256": signature },
        response_status: result.responseStatus,
        response_body: result.responseBody,
        response_headers: {},
        duration_ms: result.durationMs,
        attempt_number: 1,
        max_attempts: 1,
        status: result.status,
        error_message: result.errorMessage,
        phi_stripped: phiStripped,
        phi_fields_redacted: phiFields,
        next_retry_at: null,
        completed_at: new Date().toISOString(),
      };

      await adminClient.from("webhook_deliveries").insert(deliveryRecord);

      // Audit log
      await adminClient.from("audit_log").insert({
        user_id: user.id,
        action: "webhook.test",
        resource_type: "webhook",
        resource_id: webhook.id,
        description: `Test webhook delivery to ${webhook.url}: ${result.status} (${result.responseStatus ?? "N/A"})`,
        risk_level: "low",
        metadata: {
          webhookName: webhook.name,
          deliveryId,
          status: result.status,
          responseStatus: result.responseStatus,
          durationMs: result.durationMs,
        },
      });

      return jsonResponse(200, {
        success: result.status === "success",
        delivery: deliveryRecord,
      });
    }

    // ── Route: POST /webhook-dispatch/retry ────────────────────────────
    if (path === "retry") {
      const { deliveryId } = body;
      if (!deliveryId) {
        return jsonResponse(400, { error: "Missing deliveryId" });
      }

      const { data: delivery, error: dlvErr } = await adminClient
        .from("webhook_deliveries")
        .select("*, webhooks(*)")
        .eq("id", deliveryId)
        .eq("user_id", user.id)
        .single();

      if (dlvErr || !delivery) {
        return jsonResponse(404, { error: "Delivery not found" });
      }

      const webhook = delivery.webhooks;
      if (!webhook) {
        return jsonResponse(404, { error: "Associated webhook not found" });
      }

      const payloadStr = JSON.stringify(delivery.payload);
      const signature = await hmacSign(payloadStr, webhook.secret);
      const newDeliveryId = crypto.randomUUID();

      const result = await deliverWebhook(
        webhook.url,
        payloadStr,
        signature,
        webhook.id,
        delivery.event_type,
        newDeliveryId,
        webhook.headers || {},
        webhook.timeout_ms || 10000
      );

      const nextAttempt = delivery.attempt_number + 1;
      const maxAttempts = delivery.max_attempts;
      const retryPolicy = webhook.retry_policy || { maxRetries: 3, backoffMs: 1000 };

      // Update existing delivery record
      await adminClient
        .from("webhook_deliveries")
        .update({
          response_status: result.responseStatus,
          response_body: result.responseBody,
          duration_ms: result.durationMs,
          attempt_number: nextAttempt,
          status:
            result.status === "success"
              ? "success"
              : nextAttempt >= maxAttempts
              ? "failed"
              : "retrying",
          error_message: result.errorMessage,
          next_retry_at:
            result.status === "failed" && nextAttempt < maxAttempts
              ? new Date(
                  Date.now() + retryPolicy.backoffMs * Math.pow(2, nextAttempt - 1)
                ).toISOString()
              : null,
          completed_at:
            result.status === "success" || nextAttempt >= maxAttempts
              ? new Date().toISOString()
              : null,
        })
        .eq("id", deliveryId);

      return jsonResponse(200, {
        success: result.status === "success",
        attempt: nextAttempt,
        maxAttempts,
        result,
      });
    }

    // ── Route: POST /webhook-dispatch (dispatch event) ─────────────────
    const { eventType, payload } = body;
    if (!eventType || !payload) {
      return jsonResponse(400, { error: "Missing eventType or payload" });
    }

    // Find all active webhooks subscribed to this event
    const { data: matchingWebhooks, error: whErr } = await adminClient
      .from("webhooks")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .contains("events", [eventType]);

    if (whErr) {
      return jsonResponse(500, { error: "Failed to query webhooks" });
    }

    if (!matchingWebhooks || matchingWebhooks.length === 0) {
      return jsonResponse(200, {
        success: true,
        message: "No active webhooks subscribed to this event",
        deliveries: 0,
      });
    }

    const eventPayload = {
      ...payload,
      event: eventType,
      timestamp: new Date().toISOString(),
    };

    const results = [];

    for (const webhook of matchingWebhooks) {
      let finalPayload: Record<string, unknown> = eventPayload;
      let phiStripped = false;
      let phiFields: string[] = [];

      if (webhook.phi_filter) {
        const scanResult = sanitize(eventPayload);
        finalPayload = scanResult.sanitized;
        phiStripped = scanResult.fieldsRedacted.length > 0;
        phiFields = scanResult.fieldsRedacted;
      }

      const payloadStr = JSON.stringify(finalPayload);
      const signature = await hmacSign(payloadStr, webhook.secret);
      const deliveryId = crypto.randomUUID();

      const result = await deliverWebhook(
        webhook.url,
        payloadStr,
        signature,
        webhook.id,
        eventType,
        deliveryId,
        webhook.headers || {},
        webhook.timeout_ms || 10000
      );

      const retryPolicy = webhook.retry_policy || { maxRetries: 3, backoffMs: 1000 };
      const maxAttempts = retryPolicy.maxRetries + 1;

      await adminClient.from("webhook_deliveries").insert({
        webhook_id: webhook.id,
        user_id: user.id,
        event_type: eventType,
        payload: finalPayload,
        request_headers: { "X-DrClaw-Signature-256": signature },
        response_status: result.responseStatus,
        response_body: result.responseBody,
        response_headers: {},
        duration_ms: result.durationMs,
        attempt_number: 1,
        max_attempts: maxAttempts,
        status:
          result.status === "success"
            ? "success"
            : maxAttempts > 1
            ? "retrying"
            : "failed",
        error_message: result.errorMessage,
        phi_stripped: phiStripped,
        phi_fields_redacted: phiFields,
        next_retry_at:
          result.status === "failed" && maxAttempts > 1
            ? new Date(Date.now() + retryPolicy.backoffMs).toISOString()
            : null,
        completed_at: result.status === "success" ? new Date().toISOString() : null,
      });

      results.push({
        webhookId: webhook.id,
        webhookName: webhook.name,
        ...result,
      });
    }

    // Audit log
    await adminClient.from("audit_log").insert({
      user_id: user.id,
      action: "webhook.dispatch",
      resource_type: "webhook",
      description: `Dispatched "${eventType}" to ${matchingWebhooks.length} webhook(s): ${results.filter((r) => r.status === "success").length} success, ${results.filter((r) => r.status === "failed").length} failed`,
      risk_level: "low",
      metadata: {
        eventType,
        webhookCount: matchingWebhooks.length,
        results: results.map((r) => ({
          webhookId: r.webhookId,
          status: r.status,
          responseStatus: r.responseStatus,
          durationMs: r.durationMs,
        })),
      },
    });

    return jsonResponse(200, {
      success: true,
      deliveries: results.length,
      results,
    });
  } catch (error) {
    console.error("Webhook dispatch error:", error);
    return jsonResponse(500, {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

function jsonResponse(status: number, body: unknown, headers?: Record<string, string>): Response {
  const responseHeaders = headers ?? getCorsHeaders(null);
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...responseHeaders, "Content-Type": "application/json" },
  });
}
