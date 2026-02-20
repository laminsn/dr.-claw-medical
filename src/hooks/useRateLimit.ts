import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  checkClientRateLimit,
  resetClientRateLimit,
  type RateLimitConfig,
} from "@/lib/security";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  error?: string;
}

/**
 * Hook for dual-layer rate limiting:
 *   1. Client-side check (instant, prevents unnecessary network calls)
 *   2. Server-side check via edge function (authoritative enforcement)
 *
 * Usage:
 *   const { checkLimit, resetLimit } = useRateLimit();
 *   const result = await checkLimit("auth_login");
 *   if (!result.allowed) showError(`Try again in ${result.retryAfterMs / 1000}s`);
 */
export function useRateLimit() {
  const { session } = useAuth();
  const pendingRef = useRef(new Set<string>());

  const checkLimit = useCallback(
    async (
      action: string,
      config?: RateLimitConfig
    ): Promise<RateLimitResult> => {
      // Layer 1: Client-side check (fast, no network)
      const clientCheck = checkClientRateLimit(action, config);
      if (!clientCheck.allowed) {
        return clientCheck;
      }

      // Layer 2: Server-side check (authoritative)
      // Skip if we're already checking this action (prevent double-fire)
      if (pendingRef.current.has(action)) {
        return { allowed: true, remaining: clientCheck.remaining, retryAfterMs: 0 };
      }

      // Skip server check if no session (pre-auth flows use client-only)
      if (!session?.access_token) {
        return clientCheck;
      }

      try {
        pendingRef.current.add(action);

        const { data, error } = await supabase.functions.invoke("rate-limiter", {
          body: { action },
        });

        if (error) {
          // Fail open: if server check fails, trust client-side
          console.warn("Server rate limit check failed, falling back to client:", error);
          return clientCheck;
        }

        if (data && !data.allowed) {
          return {
            allowed: false,
            remaining: 0,
            retryAfterMs: (data.retry_after_seconds ?? 60) * 1000,
            error: data.error,
          };
        }

        return {
          allowed: true,
          remaining: data?.remaining ?? clientCheck.remaining,
          retryAfterMs: 0,
        };
      } catch {
        // Fail open
        return clientCheck;
      } finally {
        pendingRef.current.delete(action);
      }
    },
    [session]
  );

  const resetLimit = useCallback((action: string) => {
    resetClientRateLimit(action);
  }, []);

  return { checkLimit, resetLimit };
}
