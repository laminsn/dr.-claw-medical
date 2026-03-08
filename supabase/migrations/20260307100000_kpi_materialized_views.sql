-- Phase 5.3: Materialized views for KPI dashboards
-- These aggregate agent_executions and api_usage_log into dashboard-ready views.

-- ── Agent Performance (daily) ───────────────────────────────────────────

CREATE MATERIALIZED VIEW public.mv_agent_performance_daily AS
SELECT
  user_id,
  agent_id,
  date_trunc('day', started_at)::DATE AS day,
  COUNT(*) AS total_tasks,
  COUNT(*) FILTER (WHERE status = 'success') AS completed_tasks,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_tasks,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'success')::NUMERIC /
    NULLIF(COUNT(*), 0) * 100, 1
  ) AS success_rate,
  COALESCE(SUM(tokens_used), 0) AS total_tokens,
  COALESCE(SUM(cost_usd), 0)::NUMERIC(10,4) AS total_cost,
  COALESCE(AVG(duration_ms), 0)::INTEGER AS avg_duration_ms,
  MIN(started_at) AS first_task,
  MAX(completed_at) AS last_task
FROM public.agent_executions
WHERE started_at IS NOT NULL
GROUP BY user_id, agent_id, date_trunc('day', started_at)::DATE
WITH NO DATA;

CREATE UNIQUE INDEX idx_mv_agent_perf_daily
  ON public.mv_agent_performance_daily (user_id, agent_id, day);

-- ── Cost Tracking (daily by model) ──────────────────────────────────────

CREATE MATERIALIZED VIEW public.mv_cost_daily AS
SELECT
  user_id,
  model,
  provider,
  date_trunc('day', created_at)::DATE AS day,
  COUNT(*) AS request_count,
  COALESCE(SUM(input_tokens), 0) AS total_input_tokens,
  COALESCE(SUM(output_tokens), 0) AS total_output_tokens,
  COALESCE(SUM(cost_usd), 0)::NUMERIC(10,4) AS total_cost,
  COALESCE(AVG(latency_ms), 0)::INTEGER AS avg_latency_ms
FROM public.api_usage_log
GROUP BY user_id, model, provider, date_trunc('day', created_at)::DATE
WITH NO DATA;

CREATE UNIQUE INDEX idx_mv_cost_daily
  ON public.mv_cost_daily (user_id, model, provider, day);

-- ── PHI Exposure Metrics (daily) ────────────────────────────────────────

CREATE MATERIALIZED VIEW public.mv_phi_exposure_daily AS
SELECT
  user_id,
  date_trunc('day', created_at)::DATE AS day,
  COUNT(*) AS total_phi_events,
  COUNT(*) FILTER (WHERE action = 'phi.encrypt') AS encrypt_events,
  COUNT(*) FILTER (WHERE action = 'phi.decrypt') AS decrypt_events,
  COUNT(*) FILTER (WHERE action LIKE 'n8n_gateway%' AND metadata->>'phiDetected' = 'true') AS gateway_phi_events,
  COUNT(*) FILTER (WHERE risk_level = 'high' OR risk_level = 'critical') AS high_risk_events,
  COUNT(DISTINCT (metadata->>'userId')) AS unique_phi_users
FROM public.audit_log
WHERE phi_accessed = true
GROUP BY user_id, date_trunc('day', created_at)::DATE
WITH NO DATA;

CREATE UNIQUE INDEX idx_mv_phi_daily
  ON public.mv_phi_exposure_daily (user_id, day);

-- ── Agent Summary (current state) ───────────────────────────────────────

CREATE MATERIALIZED VIEW public.mv_agent_summary AS
SELECT
  e.user_id,
  e.agent_id,
  ac.name AS agent_name,
  ac.zone,
  ac.model,
  COUNT(*) AS lifetime_tasks,
  COUNT(*) FILTER (WHERE e.status = 'success') AS lifetime_completed,
  COUNT(*) FILTER (WHERE e.status = 'failed') AS lifetime_failed,
  ROUND(
    COUNT(*) FILTER (WHERE e.status = 'success')::NUMERIC /
    NULLIF(COUNT(*), 0) * 100, 1
  ) AS lifetime_success_rate,
  COALESCE(SUM(e.tokens_used), 0) AS lifetime_tokens,
  COALESCE(SUM(e.cost_usd), 0)::NUMERIC(10,4) AS lifetime_cost,
  COALESCE(AVG(e.duration_ms), 0)::INTEGER AS avg_response_ms,
  -- Today's stats
  COUNT(*) FILTER (WHERE e.started_at::DATE = CURRENT_DATE) AS tasks_today,
  COALESCE(SUM(e.cost_usd) FILTER (WHERE e.started_at::DATE = CURRENT_DATE), 0)::NUMERIC(10,4) AS cost_today,
  -- This month
  COALESCE(SUM(e.cost_usd) FILTER (WHERE e.started_at >= date_trunc('month', CURRENT_DATE)), 0)::NUMERIC(10,4) AS cost_month,
  MAX(e.completed_at) AS last_active
FROM public.agent_executions e
LEFT JOIN public.agent_configs ac ON ac.user_id = e.user_id AND ac.agent_key = e.agent_id
GROUP BY e.user_id, e.agent_id, ac.name, ac.zone, ac.model
WITH NO DATA;

CREATE UNIQUE INDEX idx_mv_agent_summary
  ON public.mv_agent_summary (user_id, agent_id);

-- ── Refresh function (call from n8n cron or pg_cron) ────────────────────

CREATE OR REPLACE FUNCTION public.refresh_kpi_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_agent_performance_daily;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_cost_daily;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_phi_exposure_daily;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_agent_summary;
END;
$$;

COMMENT ON FUNCTION public.refresh_kpi_views IS
  'Refreshes all KPI materialized views. Call every 5-15 minutes via pg_cron or n8n scheduled workflow.';

-- ── Initial populate ────────────────────────────────────────────────────
-- Uncomment after data exists:
-- SELECT public.refresh_kpi_views();
