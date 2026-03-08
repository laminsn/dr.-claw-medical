-- Phase 7: Platform Config tables (admin-managed skills, MCPs, hooks)
-- + Widen agent_configs.level CHECK to include 'director'

-- ── Widen level constraint ────────────────────────────────────────────
-- The inline CHECK from migration 20260307010000 needs 'director' added.
-- PostgreSQL auto-names inline CHECK constraints as tablename_columnname_check.

DO $$
BEGIN
  ALTER TABLE public.agent_configs
    DROP CONSTRAINT IF EXISTS agent_configs_level_check;
EXCEPTION WHEN undefined_object THEN
  -- Constraint may have a different auto-generated name; try common patterns
  NULL;
END;
$$;

ALTER TABLE public.agent_configs
  ADD CONSTRAINT agent_configs_level_check
  CHECK (level IN ('ceo', 'director', 'department-head', 'worker'));

-- ── Platform Skills (admin-managed) ───────────────────────────────────

CREATE TABLE public.platform_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'operations',
  content TEXT DEFAULT '',
  allowed_tools TEXT[] DEFAULT '{}',
  tier TEXT NOT NULL DEFAULT 'starter'
    CHECK (tier IN ('starter', 'professional', 'advanced', 'enterprise')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_skills ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read skills
CREATE POLICY "Anyone can read platform skills"
  ON public.platform_skills FOR SELECT
  TO authenticated USING (true);

-- Only admin/master_admin can write
CREATE POLICY "Admins can manage platform skills"
  ON public.platform_skills FOR ALL
  USING (
    public.has_role(auth.uid(), 'master_admin'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'master_admin'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE INDEX idx_platform_skills_category ON public.platform_skills (category);
CREATE INDEX idx_platform_skills_active ON public.platform_skills (is_active) WHERE is_active = true;

CREATE TRIGGER update_platform_skills_updated_at
  BEFORE UPDATE ON public.platform_skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Platform MCPs (admin-managed tool integrations) ───────────────────

CREATE TABLE public.platform_mcps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('http', 'command', 'supabase_fn')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_mcps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform MCPs"
  ON public.platform_mcps FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins can manage platform MCPs"
  ON public.platform_mcps FOR ALL
  USING (
    public.has_role(auth.uid(), 'master_admin'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'master_admin'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE TRIGGER update_platform_mcps_updated_at
  BEFORE UPDATE ON public.platform_mcps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Platform Hooks (admin-managed lifecycle hooks) ────────────────────

CREATE TABLE public.platform_hooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('pre_task', 'post_task', 'pre_llm_call', 'post_llm_call', 'on_phi_detected')),
  handler_type TEXT NOT NULL
    CHECK (handler_type IN ('edge_function', 'n8n_workflow', 'webhook')),
  handler_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_hooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform hooks"
  ON public.platform_hooks FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins can manage platform hooks"
  ON public.platform_hooks FOR ALL
  USING (
    public.has_role(auth.uid(), 'master_admin'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'master_admin'::app_role)
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

CREATE INDEX idx_platform_hooks_event ON public.platform_hooks (event_type, is_active, priority);

CREATE TRIGGER update_platform_hooks_updated_at
  BEFORE UPDATE ON public.platform_hooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Agent Skill Assignments (join table) ──────────────────────────────

CREATE TABLE public.agent_skill_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_key TEXT NOT NULL,
  skill_id UUID NOT NULL REFERENCES public.platform_skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, agent_key, skill_id)
);

ALTER TABLE public.agent_skill_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own skill assignments"
  ON public.agent_skill_assignments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_agent_skill_assignments_lookup
  ON public.agent_skill_assignments (user_id, agent_key);
