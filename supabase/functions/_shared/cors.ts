/**
 * Shared CORS configuration for all edge functions.
 *
 * Reads ALLOWED_ORIGINS from environment (comma-separated).
 * Falls back to the Supabase project URL if not set.
 * Never allows wildcard "*" in production.
 */

const DEFAULT_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:5173",
];

function getAllowedOrigins(): string[] {
  const envOrigins = Deno.env.get("ALLOWED_ORIGINS");
  if (envOrigins) {
    return envOrigins.split(",").map((o) => o.trim()).filter(Boolean);
  }
  return DEFAULT_ORIGINS;
}

export function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const allowed = getAllowedOrigins();
  const origin =
    requestOrigin && allowed.some((a) => requestOrigin.startsWith(a))
      ? requestOrigin
      : allowed[0];

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function handleCorsOptions(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("Origin");
    return new Response(null, { headers: getCorsHeaders(origin) });
  }
  return null;
}
