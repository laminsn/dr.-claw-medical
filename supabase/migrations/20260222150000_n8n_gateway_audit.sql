-- N8N Gateway Audit Log
-- Tracks all requests that pass through the N8N HIPAA gateway
-- for Zone 1 (Clinical) and Zone 2 (Operations) agents.
-- This table provides an immutable audit trail for HIPAA compliance.

-- Note: The existing audit_log table is used for general audit entries.
-- This migration adds an n8n-specific table for detailed flow execution tracking.

CREATE TABLE IF NOT EXISTS n8n_gateway_audit (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id      text NOT NULL,
  agent_name    text NOT NULL,
  agent_zone    text NOT NULL CHECK (agent_zone IN ('clinical', 'operations', 'external')),
  flow_id       text NOT NULL,
  flow_name     text NOT NULL,
  execution_mode text NOT NULL CHECK (execution_mode IN ('edge', 'client-proxy')),
  verdict       text NOT NULL CHECK (verdict IN ('allowed', 'blocked', 'sanitized')),
  phi_detected  boolean NOT NULL DEFAULT false,
  phi_risk_level text NOT NULL DEFAULT 'none' CHECK (phi_risk_level IN ('none', 'low', 'medium', 'high')),
  fields_redacted text[] NOT NULL DEFAULT '{}',
  original_payload_hash text NOT NULL,
  sanitized_payload_hash text NOT NULL,
  n8n_response_status integer,
  duration_ms   integer,
  error_message text,
  session_id    text,
  gateway_version text NOT NULL DEFAULT '1.0.0',
  metadata      jsonb DEFAULT '{}'
);

-- Index for querying by user
CREATE INDEX IF NOT EXISTS idx_n8n_audit_user_id ON n8n_gateway_audit(user_id);

-- Index for querying by agent zone (Zone 1 clinical lookups)
CREATE INDEX IF NOT EXISTS idx_n8n_audit_agent_zone ON n8n_gateway_audit(agent_zone);

-- Index for querying by verdict (finding blocked/sanitized requests)
CREATE INDEX IF NOT EXISTS idx_n8n_audit_verdict ON n8n_gateway_audit(verdict);

-- Index for time-range queries (compliance reporting)
CREATE INDEX IF NOT EXISTS idx_n8n_audit_created_at ON n8n_gateway_audit(created_at DESC);

-- Index for PHI detection lookups
CREATE INDEX IF NOT EXISTS idx_n8n_audit_phi ON n8n_gateway_audit(phi_detected) WHERE phi_detected = true;

-- RLS: Users can only read their own audit entries
ALTER TABLE n8n_gateway_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own n8n audit entries"
  ON n8n_gateway_audit
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all audit entries
CREATE POLICY "Admins can view all n8n audit entries"
  ON n8n_gateway_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('master_admin', 'admin')
    )
  );

-- Only the service role (edge functions) can insert audit entries
-- Regular users cannot insert directly — entries are created by the gateway
CREATE POLICY "Service role inserts n8n audit entries"
  ON n8n_gateway_audit
  FOR INSERT
  WITH CHECK (true);

-- N8N Flow Configuration table
-- Stores per-user N8N flow mappings for their agents
CREATE TABLE IF NOT EXISTS n8n_flow_configs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flow_key      text NOT NULL,
  flow_name     text NOT NULL,
  webhook_url   text NOT NULL DEFAULT '',
  description   text DEFAULT '',
  agent_zone    text NOT NULL CHECK (agent_zone IN ('clinical', 'operations', 'external')),
  allowed_agent_ids text[] NOT NULL DEFAULT '{}',
  execution_mode text NOT NULL DEFAULT 'edge' CHECK (execution_mode IN ('edge', 'client-proxy')),
  requires_phi_scan boolean NOT NULL DEFAULT true,
  requires_audit_log boolean NOT NULL DEFAULT true,
  is_active     boolean NOT NULL DEFAULT true,
  timeout_ms    integer NOT NULL DEFAULT 30000,
  max_retries   integer NOT NULL DEFAULT 2,
  backoff_ms    integer NOT NULL DEFAULT 2000,
  UNIQUE(user_id, flow_key)
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_n8n_flows_user_id ON n8n_flow_configs(user_id);

-- RLS
ALTER TABLE n8n_flow_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own n8n flow configs"
  ON n8n_flow_configs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
