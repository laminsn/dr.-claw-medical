import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";

/**
 * N8N API Proxy Edge Function
 *
 * Authenticated proxy to the n8n REST API. Keeps n8n credentials
 * server-side — the client never sees the n8n API key or base URL.
 *
 * Supported operations:
 *   - GET  /workflows          → list workflows
 *   - GET  /workflows/:id      → get workflow detail
 *   - GET  /executions          → list executions
 *   - GET  /executions/:id      → get execution detail
 *   - POST /workflows/:id/activate   → activate workflow
 *   - POST /workflows/:id/deactivate → deactivate workflow
 */

interface ProxyRequest {
  method: "GET" | "POST";
  path: string;
  body?: Record<string, unknown>;
  queryParams?: Record<string, string>;
}

const ALLOWED_PATH_PREFIXES = [
  "/workflows",
  "/executions",
  "/credentials",
];

function isPathAllowed(path: string): boolean {
  return ALLOWED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

serve(async (req) => {
  const optionsResponse = handleCorsOptions(req);
  if (optionsResponse) return optionsResponse;

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

    // ── Check admin role ──────────────────────────────────────────
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole = profile?.role ?? "user";
    if (!["admin", "master_admin"].includes(userRole)) {
      return jsonResponse(403, { error: "Insufficient permissions. Admin role required." }, corsHeaders);
    }

    // ── n8n credentials from Supabase secrets ─────────────────────
    const n8nBaseUrl = Deno.env.get("N8N_BASE_URL");
    const n8nApiKey = Deno.env.get("N8N_API_KEY");

    if (!n8nBaseUrl || !n8nApiKey) {
      return jsonResponse(503, {
        error: "n8n not configured. Set N8N_BASE_URL and N8N_API_KEY in Supabase secrets.",
      }, corsHeaders);
    }

    // ── Parse proxy request ───────────────────────────────────────
    const body: ProxyRequest = await req.json();
    const { method, path, body: requestBody, queryParams } = body;

    if (!method || !path) {
      return jsonResponse(400, { error: "Missing required fields: method, path" }, corsHeaders);
    }

    if (!isPathAllowed(path)) {
      return jsonResponse(403, { error: `Path not allowed: ${path}` }, corsHeaders);
    }

    // ── Build n8n API URL ─────────────────────────────────────────
    const url = new URL(`/api/v1${path}`, n8nBaseUrl);
    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        url.searchParams.set(key, value);
      }
    }

    // ── Forward to n8n ────────────────────────────────────────────
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-N8N-API-KEY": n8nApiKey,
      },
      signal: controller.signal,
    };

    if (method === "POST" && requestBody) {
      fetchOptions.body = JSON.stringify(requestBody);
    }

    const n8nResp = await fetch(url.toString(), fetchOptions);
    clearTimeout(timeoutId);

    const responseData = await n8nResp.json().catch(() => ({}));

    // ── Audit log ─────────────────────────────────────────────────
    await adminClient.from("audit_log").insert({
      user_id: user.id,
      action: "n8n_api_proxy",
      resource_type: "n8n_api",
      description: `${method} ${path} → ${n8nResp.status}`,
      risk_level: method === "POST" ? "medium" : "low",
      metadata: {
        method,
        path,
        queryParams,
        responseStatus: n8nResp.status,
      },
    }).catch((err: Error) => {
      console.error("Failed to write audit log:", err.message);
    });

    // ── Response ──────────────────────────────────────────────────
    return jsonResponse(n8nResp.status, {
      success: n8nResp.ok,
      data: responseData,
    }, corsHeaders);
  } catch (error) {
    console.error("N8N API Proxy error:", error);
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
