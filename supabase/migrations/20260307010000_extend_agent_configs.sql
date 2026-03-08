-- Extend agent_configs to support full agent state (previously in localStorage).
-- Adds zone, model, department, org chart, capabilities, and metrics columns.

ALTER TABLE public.agent_configs
  ADD COLUMN IF NOT EXISTS zone TEXT NOT NULL DEFAULT 'operations'
    CHECK (zone IN ('clinical', 'operations', 'external')),
  ADD COLUMN IF NOT EXISTS model TEXT NOT NULL DEFAULT 'claude',
  ADD COLUMN IF NOT EXISTS department TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'worker'
    CHECK (level IN ('ceo', 'department-head', 'worker')),
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS parent_agent_id TEXT,
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '{
    "phiProtection": true,
    "messaging": true,
    "voiceRecognition": false,
    "distressDetection": false,
    "taskCreation": false,
    "hrAssistant": false
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS task_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tasks_today INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS success_rate NUMERIC(5,2) DEFAULT 100,
  ADD COLUMN IF NOT EXISTS cost_today NUMERIC(10,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cost_month NUMERIC(10,4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tokens_used BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_response_time TEXT DEFAULT '—';

-- Index for quick lookup by zone and active status
CREATE INDEX IF NOT EXISTS idx_agent_configs_zone
  ON public.agent_configs (user_id, zone, active);

CREATE INDEX IF NOT EXISTS idx_agent_configs_parent
  ON public.agent_configs (user_id, parent_agent_id);
