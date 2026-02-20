import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Rate Limiter Edge Function
 *
 * Provides server-side rate limiting for Dr. Claw Medical.
 * Checks and enforces per-user, per-action limits stored in the DB.
 *
 * Actions & Default Limits:
 *   auth_login      → 5 per 1 min   (brute-force protection)
 *   auth_signup     → 3 per 10 min  (abuse prevention)
 *   api_call        → per plan tier  (cost control)
 *   agent_invoke    → 30 per 1 min  (agent abuse prevention)
 *   task_create     → 60 per 1 min  (spam prevention)
 *   export_data     → 5 per 10 min  (data exfil prevention)
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
}

const ACTION_LIMITS: Record<string, RateLimitConfig> = {
  auth_login:    { maxRequests: 5,  windowMinutes: 1 },
  auth_signup:   { maxRequests: 3,  windowMinutes: 10 },
  api_call:      { maxRequests: 60, windowMinutes: 1 },
  agent_invoke:  { maxRequests: 30, windowMinutes: 1 },
  task_create:   { maxRequests: 60, windowMinutes: 1 },
  export_data:   { maxRequests: 5,  windowMinutes: 10 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ allowed: false, error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for rate limit operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Create user client to verify the JWT
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ allowed: false, error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action } = await req.json();

    if (!action || !ACTION_LIMITS[action]) {
      return new Response(
        JSON.stringify({ allowed: false, error: `Unknown action: ${action}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const limits = ACTION_LIMITS[action];

    // For api_call, check the user's subscription for plan-specific limits
    let maxRequests = limits.maxRequests;
    if (action === "api_call") {
      const { data: sub } = await adminClient
        .from("user_subscriptions")
        .select("max_api_calls_per_day, api_calls_today")
        .eq("user_id", user.id)
        .single();

      if (sub) {
        // Check daily limit
        if (sub.api_calls_today >= sub.max_api_calls_per_day) {
          // Log the rate limit hit
          await adminClient.from("audit_log").insert({
            user_id: user.id,
            action: "rate_limit.exceeded",
            resource_type: "api",
            description: `Daily API limit reached (${sub.max_api_calls_per_day})`,
            risk_level: "medium",
            metadata: { action, daily_limit: sub.max_api_calls_per_day, used: sub.api_calls_today },
          });

          return new Response(
            JSON.stringify({
              allowed: false,
              error: "Daily API call limit reached",
              limit: sub.max_api_calls_per_day,
              used: sub.api_calls_today,
              resets_at: "midnight UTC",
            }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "3600" } }
          );
        }

        // Increment daily counter
        await adminClient
          .from("user_subscriptions")
          .update({ api_calls_today: sub.api_calls_today + 1 })
          .eq("user_id", user.id);
      }
    }

    // Check sliding-window rate limit
    const { data: allowed } = await adminClient.rpc("check_rate_limit", {
      _user_id: user.id,
      _action: action,
      _max_requests: maxRequests,
      _window_minutes: limits.windowMinutes,
    });

    if (allowed === false) {
      // Log rate limit event
      await adminClient.from("audit_log").insert({
        user_id: user.id,
        action: "rate_limit.exceeded",
        resource_type: "api",
        description: `Rate limit exceeded for ${action} (${maxRequests}/${limits.windowMinutes}min)`,
        risk_level: action.startsWith("auth") ? "high" : "medium",
        metadata: { action, max_requests: maxRequests, window_minutes: limits.windowMinutes },
      });

      return new Response(
        JSON.stringify({
          allowed: false,
          error: `Rate limit exceeded for ${action}`,
          limit: maxRequests,
          window_minutes: limits.windowMinutes,
          retry_after_seconds: limits.windowMinutes * 60,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(limits.windowMinutes * 60),
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        allowed: true,
        action,
        remaining: maxRequests - 1, // approximate
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Rate limiter error:", error);
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    // Fail open — don't block users if the rate limiter itself errors
    return new Response(
      JSON.stringify({ allowed: true, error: errMsg, fallback: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
