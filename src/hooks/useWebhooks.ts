import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLog } from "@/hooks/useAuditLog";
import {
  generateWebhookSecret,
  generateHmacSignature,
  scanAndSanitizePayload,
  type Webhook,
  type WebhookCreateInput,
  type WebhookDelivery,
} from "@/lib/webhooks";

/* ── Hook ───────────────────────────────────────────────────────────── */

export function useWebhooks() {
  const { user } = useAuth();
  const { logAction } = useAuditLog();

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);

  /* ── Fetch webhooks ────────────────────────────────────────────────── */

  const fetchWebhooks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("webhooks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebhooks((data ?? []) as Webhook[]);
    } catch (err) {
      console.error("Failed to fetch webhooks:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  /* ── Create webhook ────────────────────────────────────────────────── */

  const createWebhook = useCallback(
    async (input: WebhookCreateInput): Promise<Webhook | null> => {
      if (!user) return null;

      const secret = generateWebhookSecret();

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from("webhooks")
          .insert({
            user_id: user.id,
            name: input.name,
            url: input.url,
            secret,
            description: input.description || null,
            events: input.events,
            zone: input.zone,
            headers: input.headers || {},
            is_active: true,
            phi_filter: input.phi_filter ?? true,
            retry_policy: input.retry_policy || { maxRetries: 3, backoffMs: 1000 },
            timeout_ms: input.timeout_ms || 10000,
          })
          .select()
          .single();

        if (error) throw error;

        const webhook = data as Webhook;
        setWebhooks((prev) => [webhook, ...prev]);

        await logAction({
          action: "webhook.create",
          resourceType: "webhook",
          resourceId: webhook.id,
          description: `Created webhook "${webhook.name}" for events: ${webhook.events.join(", ")}`,
        });

        return webhook;
      } catch (err) {
        console.error("Failed to create webhook:", err);
        return null;
      }
    },
    [user, logAction]
  );

  /* ── Update webhook ────────────────────────────────────────────────── */

  const updateWebhook = useCallback(
    async (id: string, updates: Partial<Webhook>): Promise<boolean> => {
      if (!user) return false;

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from("webhooks")
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;

        setWebhooks((prev) => prev.map((wh) => (wh.id === id ? (data as Webhook) : wh)));

        await logAction({
          action: "webhook.update",
          resourceType: "webhook",
          resourceId: id,
          description: `Updated webhook: ${Object.keys(updates).join(", ")}`,
        });

        return true;
      } catch (err) {
        console.error("Failed to update webhook:", err);
        return false;
      }
    },
    [user, logAction]
  );

  /* ── Toggle active status ──────────────────────────────────────────── */

  const toggleWebhook = useCallback(
    async (id: string): Promise<boolean> => {
      const webhook = webhooks.find((wh) => wh.id === id);
      if (!webhook) return false;
      return updateWebhook(id, { is_active: !webhook.is_active });
    },
    [webhooks, updateWebhook]
  );

  /* ── Delete webhook ────────────────────────────────────────────────── */

  const deleteWebhook = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from("webhooks")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        setWebhooks((prev) => prev.filter((wh) => wh.id !== id));

        await logAction({
          action: "webhook.delete",
          resourceType: "webhook",
          resourceId: id,
          description: "Deleted webhook",
        });

        return true;
      } catch (err) {
        console.error("Failed to delete webhook:", err);
        return false;
      }
    },
    [user, logAction]
  );

  /* ── Regenerate secret ─────────────────────────────────────────────── */

  const regenerateSecret = useCallback(
    async (id: string): Promise<string | null> => {
      const newSecret = generateWebhookSecret();
      const success = await updateWebhook(id, { secret: newSecret } as Partial<Webhook>);
      return success ? newSecret : null;
    },
    [updateWebhook]
  );

  /* ── Fetch deliveries ──────────────────────────────────────────────── */

  const fetchDeliveries = useCallback(
    async (webhookId?: string, limit = 50): Promise<void> => {
      if (!user) return;
      setDeliveriesLoading(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let query = (supabase as any)
          .from("webhook_deliveries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (webhookId) {
          query = query.eq("webhook_id", webhookId);
        }

        const { data, error } = await query;
        if (error) throw error;
        setDeliveries((data ?? []) as WebhookDelivery[]);
      } catch (err) {
        console.error("Failed to fetch deliveries:", err);
      } finally {
        setDeliveriesLoading(false);
      }
    },
    [user]
  );

  /* ── Test webhook (client-side ping) ───────────────────────────────── */

  const testWebhook = useCallback(
    async (webhook: Webhook): Promise<WebhookDelivery> => {
      const testPayload = {
        event: "webhook.test",
        webhookId: webhook.id,
        webhookName: webhook.name,
        message: "This is a test delivery from Dr. Claw Medical",
        timestamp: new Date().toISOString(),
      };

      // PHI scan
      let finalPayload: Record<string, unknown> = testPayload;
      let phiStripped = false;
      let phiFields: string[] = [];

      if (webhook.phi_filter) {
        const { sanitized, scanResult } = scanAndSanitizePayload(testPayload);
        finalPayload = sanitized;
        phiStripped = scanResult.hasPhi;
        phiFields = scanResult.fieldsRedacted;
      }

      const payloadStr = JSON.stringify(finalPayload);
      const signature = await generateHmacSignature(payloadStr, webhook.secret);

      const startTime = Date.now();
      let responseStatus: number | null = null;
      let responseBody: string | null = null;
      let errorMessage: string | null = null;
      let status: WebhookDelivery["status"] = "pending";

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), webhook.timeout_ms);

        const response = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-DrClaw-Event": "webhook.test",
            "X-DrClaw-Signature-256": signature,
            "X-DrClaw-Webhook-Id": webhook.id,
            "X-DrClaw-Delivery-Id": crypto.randomUUID(),
            "X-DrClaw-Timestamp": new Date().toISOString(),
            ...webhook.headers,
          },
          body: payloadStr,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        responseStatus = response.status;
        responseBody = await response.text().catch(() => null);
        status = response.ok ? "success" : "failed";

        if (!response.ok) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (err) {
        errorMessage = err instanceof Error ? err.message : "Request failed";
        status = "failed";
      }

      const durationMs = Date.now() - startTime;

      // Record delivery in database
      const deliveryRecord: Omit<WebhookDelivery, "id" | "created_at"> = {
        webhook_id: webhook.id,
        user_id: webhook.user_id,
        event_type: "webhook.test",
        payload: finalPayload,
        request_headers: { "X-DrClaw-Signature-256": signature },
        response_status: responseStatus,
        response_body: responseBody?.slice(0, 10000) ?? null,
        response_headers: {},
        duration_ms: durationMs,
        attempt_number: 1,
        max_attempts: 1,
        status,
        error_message: errorMessage,
        phi_stripped: phiStripped,
        phi_fields_redacted: phiFields,
        next_retry_at: null,
        completed_at: new Date().toISOString(),
      };

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from("webhook_deliveries")
          .insert({ ...deliveryRecord })
          .select()
          .single();

        if (data) {
          setDeliveries((prev) => [data as WebhookDelivery, ...prev]);
          return data as WebhookDelivery;
        }
      } catch {
        // Delivery recording failed — return the local record
      }

      return {
        id: crypto.randomUUID(),
        ...deliveryRecord,
        created_at: new Date().toISOString(),
      } as WebhookDelivery;
    },
    []
  );

  /* ── Dispatch webhook event (called from other hooks/services) ─────── */

  const dispatchEvent = useCallback(
    async (
      eventType: string,
      payload: Record<string, unknown>
    ): Promise<void> => {
      if (!user) return;

      // Find all active webhooks subscribed to this event
      const matchingWebhooks = webhooks.filter(
        (wh) => wh.is_active && wh.events.includes(eventType)
      );

      if (matchingWebhooks.length === 0) return;

      const eventPayload = {
        ...payload,
        event: eventType,
        timestamp: new Date().toISOString(),
      };

      for (const webhook of matchingWebhooks) {
        let finalPayload: Record<string, unknown> & { event: string; timestamp: string } = eventPayload;
        let phiStripped = false;
        let phiFields: string[] = [];

        if (webhook.phi_filter) {
          const { sanitized, scanResult } = scanAndSanitizePayload(eventPayload);
          finalPayload = { ...sanitized, event: eventType, timestamp: new Date().toISOString() };
          phiStripped = scanResult.hasPhi;
          phiFields = scanResult.fieldsRedacted;
        }

        const payloadStr = JSON.stringify(finalPayload);
        const signature = await generateHmacSignature(payloadStr, webhook.secret);
        const deliveryId = crypto.randomUUID();

        const startTime = Date.now();
        let responseStatus: number | null = null;
        let responseBody: string | null = null;
        let errorMessage: string | null = null;
        let status: WebhookDelivery["status"] = "pending";

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), webhook.timeout_ms);

          const response = await fetch(webhook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-DrClaw-Event": eventType,
              "X-DrClaw-Signature-256": signature,
              "X-DrClaw-Webhook-Id": webhook.id,
              "X-DrClaw-Delivery-Id": deliveryId,
              "X-DrClaw-Timestamp": new Date().toISOString(),
              ...webhook.headers,
            },
            body: payloadStr,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          responseStatus = response.status;
          responseBody = await response.text().catch(() => null);
          status = response.ok ? "success" : "failed";

          if (!response.ok) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (err) {
          errorMessage = err instanceof Error ? err.message : "Request failed";
          status = "failed";
        }

        const durationMs = Date.now() - startTime;

        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from("webhook_deliveries").insert({
            webhook_id: webhook.id,
            user_id: user.id,
            event_type: eventType,
            payload: finalPayload,
            request_headers: { "X-DrClaw-Signature-256": signature },
            response_status: responseStatus,
            response_body: responseBody?.slice(0, 10000) ?? null,
            response_headers: {},
            duration_ms: durationMs,
            attempt_number: 1,
            max_attempts: webhook.retry_policy.maxRetries + 1,
            status,
            error_message: errorMessage,
            phi_stripped: phiStripped,
            phi_fields_redacted: phiFields,
            next_retry_at:
              status === "failed" && webhook.retry_policy.maxRetries > 0
                ? new Date(Date.now() + webhook.retry_policy.backoffMs).toISOString()
                : null,
            completed_at: status === "success" ? new Date().toISOString() : null,
          });
        } catch {
          console.error("Failed to record webhook delivery");
        }
      }
    },
    [user, webhooks]
  );

  return {
    webhooks,
    deliveries,
    loading,
    deliveriesLoading,
    fetchWebhooks,
    createWebhook,
    updateWebhook,
    toggleWebhook,
    deleteWebhook,
    regenerateSecret,
    fetchDeliveries,
    testWebhook,
    dispatchEvent,
  };
}
