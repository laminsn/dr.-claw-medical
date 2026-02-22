-- ═══════════════════════════════════════════════════════════════════════════
-- Dr. Claw Medical — Webhooks System
-- Webhook Registration · Delivery Tracking · HMAC Signing · PHI-Aware
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Webhooks Table ───────────────────────────────────────────────────
-- Stores user-configured webhook endpoints that receive event notifications.
-- Each webhook subscribes to specific event types and uses HMAC-SHA256 signing.

CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,                    -- HMAC-SHA256 signing secret
  description TEXT,
  events TEXT[] NOT NULL DEFAULT '{}',     -- Array of subscribed event types
  zone TEXT NOT NULL DEFAULT 'external' CHECK (zone IN ('clinical', 'operations', 'external')),
  headers JSONB DEFAULT '{}'::jsonb,       -- Custom headers to include
  is_active BOOLEAN NOT NULL DEFAULT true,
  phi_filter BOOLEAN NOT NULL DEFAULT true, -- Strip PHI before delivery
  retry_policy JSONB NOT NULL DEFAULT '{"maxRetries": 3, "backoffMs": 1000}'::jsonb,
  timeout_ms INTEGER NOT NULL DEFAULT 10000,
  total_deliveries INTEGER NOT NULL DEFAULT 0,
  total_failures INTEGER NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  last_status_code INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhooks_user ON public.webhooks (user_id, is_active);
CREATE INDEX idx_webhooks_events ON public.webhooks USING GIN (events);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own webhooks" ON public.webhooks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own webhooks" ON public.webhooks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own webhooks" ON public.webhooks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own webhooks" ON public.webhooks
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 2. Webhook Deliveries Table ─────────────────────────────────────────
-- Immutable log of every webhook delivery attempt for debugging and auditing.

CREATE TABLE public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  request_headers JSONB DEFAULT '{}'::jsonb,
  response_status INTEGER,
  response_body TEXT,
  response_headers JSONB DEFAULT '{}'::jsonb,
  duration_ms INTEGER,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  max_attempts INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  error_message TEXT,
  phi_stripped BOOLEAN NOT NULL DEFAULT false,
  phi_fields_redacted TEXT[] DEFAULT '{}',
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_wh_deliveries_webhook ON public.webhook_deliveries (webhook_id, created_at DESC);
CREATE INDEX idx_wh_deliveries_user ON public.webhook_deliveries (user_id, created_at DESC);
CREATE INDEX idx_wh_deliveries_status ON public.webhook_deliveries (status, next_retry_at) WHERE status IN ('pending', 'retrying');

ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deliveries" ON public.webhook_deliveries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deliveries" ON public.webhook_deliveries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own deliveries" ON public.webhook_deliveries
  FOR UPDATE USING (auth.uid() = user_id);


-- ── 3. Helper: Increment delivery counters on webhook ───────────────────

CREATE OR REPLACE FUNCTION public.update_webhook_delivery_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'success' THEN
    UPDATE public.webhooks
    SET total_deliveries = total_deliveries + 1,
        last_triggered_at = NEW.completed_at,
        last_status_code = NEW.response_status
    WHERE id = NEW.webhook_id;
  ELSIF NEW.status = 'failed' AND NEW.attempt_number >= NEW.max_attempts THEN
    UPDATE public.webhooks
    SET total_failures = total_failures + 1,
        last_triggered_at = NEW.completed_at,
        last_status_code = NEW.response_status
    WHERE id = NEW.webhook_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_delivery_complete
  AFTER UPDATE OF status ON public.webhook_deliveries
  FOR EACH ROW
  WHEN (NEW.status IN ('success', 'failed'))
  EXECUTE FUNCTION public.update_webhook_delivery_stats();


-- ── 4. Cleanup old deliveries (keep 30 days) ───────────────────────────

CREATE OR REPLACE FUNCTION public.cleanup_webhook_deliveries()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.webhook_deliveries
  WHERE created_at < now() - INTERVAL '30 days';
$$;
