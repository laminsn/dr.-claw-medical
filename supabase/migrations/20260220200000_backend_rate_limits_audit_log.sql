-- ═══════════════════════════════════════════════════════════════════════════
-- Dr. Claw Medical — Backend Enhancement Migration
-- Rate Limiting · API Usage Tracking · Audit Logging · Agent Execution Log
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Rate Limits Table ──────────────────────────────────────────────────
-- Server-side rate limiting. Tracks request counts per user per action
-- within sliding windows. Prevents brute-force, abuse, and cost overruns.

CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  action TEXT NOT NULL,              -- 'auth_login', 'auth_signup', 'api_call', 'agent_invoke', 'task_create'
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  window_minutes INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limits_user_action ON public.rate_limits (user_id, action, window_start);
CREATE INDEX idx_rate_limits_ip_action ON public.rate_limits (ip_address, action, window_start);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only the system (via service role) should write rate limits.
-- Users can read their own for display purposes.
CREATE POLICY "Users can view own rate limits" ON public.rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- ── Rate limit check function ────────────────────────────────────────────
-- Returns TRUE if the user is WITHIN limits (allowed), FALSE if blocked.
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id UUID,
  _action TEXT,
  _max_requests INTEGER DEFAULT 60,
  _window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count INTEGER;
  _window_start TIMESTAMPTZ;
BEGIN
  _window_start := now() - (_window_minutes || ' minutes')::INTERVAL;

  SELECT COALESCE(SUM(request_count), 0) INTO _count
  FROM public.rate_limits
  WHERE user_id = _user_id
    AND action = _action
    AND window_start >= _window_start;

  IF _count >= _max_requests THEN
    RETURN FALSE;  -- Rate limited
  END IF;

  -- Record this request
  INSERT INTO public.rate_limits (user_id, action, request_count, window_minutes)
  VALUES (_user_id, _action, 1, _window_minutes);

  RETURN TRUE;  -- Allowed
END;
$$;

-- ── Cleanup old rate limit records (keep 24 hours) ───────────────────────
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.rate_limits
  WHERE window_start < now() - INTERVAL '24 hours';
$$;


-- ── 2. API Usage Log ─────────────────────────────────────────────────────
-- Tracks every LLM API call for cost accounting, budgeting, and billing.

CREATE TABLE public.api_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id TEXT NOT NULL,
  model TEXT NOT NULL,                    -- 'claude-sonnet-4', 'gpt-4o', 'llama-3.1-8b'
  provider TEXT NOT NULL DEFAULT 'openai', -- 'openai', 'anthropic', 'google', 'self-hosted'
  action TEXT NOT NULL DEFAULT 'completion', -- 'completion', 'embedding', 'transcription'
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0,
  latency_ms INTEGER,
  zone TEXT NOT NULL DEFAULT 'operations' CHECK (zone IN ('clinical', 'operations', 'external')),
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout', 'rate_limited')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_api_usage_user ON public.api_usage_log (user_id, created_at DESC);
CREATE INDEX idx_api_usage_agent ON public.api_usage_log (user_id, agent_id, created_at DESC);
CREATE INDEX idx_api_usage_model ON public.api_usage_log (model, created_at DESC);
CREATE INDEX idx_api_usage_monthly ON public.api_usage_log (user_id, date_trunc('month', created_at));

ALTER TABLE public.api_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON public.api_usage_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON public.api_usage_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── Usage summary view ───────────────────────────────────────────────────
-- Aggregated daily usage per user/agent for dashboard display.
CREATE OR REPLACE VIEW public.api_usage_summary AS
SELECT
  user_id,
  agent_id,
  model,
  provider,
  date_trunc('day', created_at)::DATE AS usage_date,
  COUNT(*) AS request_count,
  SUM(input_tokens) AS total_input_tokens,
  SUM(output_tokens) AS total_output_tokens,
  SUM(input_tokens + output_tokens) AS total_tokens,
  SUM(cost_usd) AS total_cost_usd,
  AVG(latency_ms)::INTEGER AS avg_latency_ms,
  COUNT(*) FILTER (WHERE status = 'success') AS success_count,
  COUNT(*) FILTER (WHERE status = 'error') AS error_count
FROM public.api_usage_log
GROUP BY user_id, agent_id, model, provider, date_trunc('day', created_at)::DATE;


-- ── 3. Audit Log ─────────────────────────────────────────────────────────
-- Immutable HIPAA audit trail. Records every significant action.
-- HIPAA requires 7-year retention for audit logs.

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  action TEXT NOT NULL,                  -- 'auth.login', 'auth.logout', 'agent.invoke', 'phi.access', 'phi.redact', 'task.create', etc.
  resource_type TEXT,                    -- 'agent', 'task', 'patient_record', 'integration', 'user'
  resource_id TEXT,
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  phi_accessed BOOLEAN NOT NULL DEFAULT false,   -- Flag if PHI was involved
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Append-only: no UPDATE or DELETE policies for users
CREATE INDEX idx_audit_log_user ON public.audit_log (user_id, created_at DESC);
CREATE INDEX idx_audit_log_action ON public.audit_log (action, created_at DESC);
CREATE INDEX idx_audit_log_phi ON public.audit_log (phi_accessed, created_at DESC) WHERE phi_accessed = true;
CREATE INDEX idx_audit_log_risk ON public.audit_log (risk_level, created_at DESC) WHERE risk_level IN ('high', 'critical');

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only READ their own audit logs. No update/delete.
CREATE POLICY "Users can view own audit logs" ON public.audit_log
  FOR SELECT USING (auth.uid() = user_id);
-- Insert is allowed for the authenticated user (for client-side logging)
CREATE POLICY "Users can insert own audit entries" ON public.audit_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_log
  FOR SELECT USING (public.has_role(auth.uid(), 'master_admin'));

-- ── Audit log helper function ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.log_audit(
  _user_id UUID,
  _action TEXT,
  _resource_type TEXT DEFAULT NULL,
  _resource_id TEXT DEFAULT NULL,
  _description TEXT DEFAULT NULL,
  _phi_accessed BOOLEAN DEFAULT false,
  _risk_level TEXT DEFAULT 'low',
  _metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id UUID;
BEGIN
  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, description, phi_accessed, risk_level, metadata)
  VALUES (_user_id, _action, _resource_type, _resource_id, _description, _phi_accessed, _risk_level, _metadata)
  RETURNING id INTO _log_id;

  RETURN _log_id;
END;
$$;


-- ── 4. Agent Execution Log ───────────────────────────────────────────────
-- Tracks each agent task execution for performance monitoring.

CREATE TABLE public.agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id TEXT NOT NULL,
  task_id UUID REFERENCES public.kanban_tasks(id) ON DELETE SET NULL,
  execution_type TEXT NOT NULL DEFAULT 'task', -- 'task', 'scheduled', 'triggered', 'manual'
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'error', 'timeout', 'cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  input_summary TEXT,
  output_summary TEXT,
  tokens_used INTEGER DEFAULT 0,
  cost_usd NUMERIC(10, 6) DEFAULT 0,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_exec_user ON public.agent_executions (user_id, created_at DESC);
CREATE INDEX idx_agent_exec_agent ON public.agent_executions (user_id, agent_id, created_at DESC);
CREATE INDEX idx_agent_exec_status ON public.agent_executions (status, created_at DESC);

ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own executions" ON public.agent_executions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own executions" ON public.agent_executions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own executions" ON public.agent_executions
  FOR UPDATE USING (auth.uid() = user_id);


-- ── 5. User Subscription & Billing Table ─────────────────────────────────
-- Tracks plan, usage limits, and billing period for rate limiting enforcement.

CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'advanced', 'enterprise')),
  max_agents INTEGER NOT NULL DEFAULT 2,
  max_api_calls_per_day INTEGER NOT NULL DEFAULT 500,
  max_tokens_per_month BIGINT NOT NULL DEFAULT 1000000,
  tokens_used_this_month BIGINT NOT NULL DEFAULT 0,
  api_calls_today INTEGER NOT NULL DEFAULT 0,
  billing_cycle_start DATE NOT NULL DEFAULT CURRENT_DATE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create subscription when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan, max_agents, max_api_calls_per_day, max_tokens_per_month)
  VALUES (NEW.id, 'starter', 2, 500, 1000000);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();


-- ── 6. Plan Limits Reference ─────────────────────────────────────────────
-- Static reference table for plan tier limits.

CREATE TABLE public.plan_limits (
  plan TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL,       -- cents
  max_agents INTEGER NOT NULL,
  max_api_calls_per_day INTEGER NOT NULL,
  max_tokens_per_month BIGINT NOT NULL,
  max_skills INTEGER NOT NULL,
  features JSONB DEFAULT '{}'::jsonb
);

INSERT INTO public.plan_limits (plan, display_name, price_monthly, max_agents, max_api_calls_per_day, max_tokens_per_month, max_skills, features) VALUES
  ('starter',      'Starter',      14700,  2,   500,    1000000,   5,   '{"telehealth": false, "custom_skills": false, "priority_support": false}'::jsonb),
  ('professional', 'Professional', 29700,  10,  5000,   10000000,  100, '{"telehealth": true,  "custom_skills": false, "priority_support": true}'::jsonb),
  ('advanced',     'Advanced',     44700,  25,  25000,  50000000,  999, '{"telehealth": true,  "custom_skills": true,  "priority_support": true}'::jsonb),
  ('enterprise',   'Enterprise',   0,      999, 999999, 999999999, 999, '{"telehealth": true,  "custom_skills": true,  "priority_support": true, "dedicated_support": true}'::jsonb);

ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plan limits" ON public.plan_limits
  FOR SELECT TO authenticated USING (true);


-- ── 7. Daily Reset Function ──────────────────────────────────────────────
-- Resets daily counters. Should be called by a cron job or pg_cron.

CREATE OR REPLACE FUNCTION public.reset_daily_counters()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.user_subscriptions SET api_calls_today = 0;
  SELECT public.cleanup_rate_limits();
$$;

-- Monthly reset for token counters
CREATE OR REPLACE FUNCTION public.reset_monthly_counters()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.user_subscriptions
  SET tokens_used_this_month = 0,
      billing_cycle_start = CURRENT_DATE
  WHERE date_part('day', CURRENT_DATE) = date_part('day', billing_cycle_start);
$$;
