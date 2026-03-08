-- Phase 4.1: Multi-tenant isolation
-- Organizations, memberships, and org_id on PHI-containing tables.

-- ── Organizations ───────────────────────────────────────────────────────

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ── Organization Members ────────────────────────────────────────────────

CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member')),
  phi_access_level TEXT NOT NULL DEFAULT 'none' CHECK (phi_access_level IN ('full', 'de_identified', 'none')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_org_members_user ON public.organization_members (user_id);
CREATE INDEX idx_org_members_org ON public.organization_members (org_id);

-- ── Helper: check org membership ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.user_org_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.organization_members WHERE user_id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.user_org_role(_user_id UUID, _org_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.organization_members
  WHERE user_id = _user_id AND org_id = _org_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.user_phi_access(_user_id UUID, _org_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT phi_access_level FROM public.organization_members
  WHERE user_id = _user_id AND org_id = _org_id
  LIMIT 1;
$$;

-- ── RLS for organizations ───────────────────────────────────────────────

CREATE POLICY "Members can view own orgs" ON public.organizations
  FOR SELECT USING (id IN (SELECT public.user_org_ids(auth.uid())));

CREATE POLICY "Owners can update own orgs" ON public.organizations
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Any user can create an org" ON public.organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- ── RLS for organization_members ────────────────────────────────────────

CREATE POLICY "Members can view org members" ON public.organization_members
  FOR SELECT USING (org_id IN (SELECT public.user_org_ids(auth.uid())));

CREATE POLICY "Admins can manage org members" ON public.organization_members
  FOR ALL USING (
    public.user_org_role(auth.uid(), org_id) IN ('owner', 'admin')
  );

-- ── Add org_id to PHI-containing tables ─────────────────────────────────

ALTER TABLE public.kanban_tasks ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.agent_configs ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.agent_executions ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.encrypted_phi_store ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
ALTER TABLE public.api_usage_log ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Indexes for org-scoped queries
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_org ON public.kanban_tasks (org_id);
CREATE INDEX IF NOT EXISTS idx_agent_configs_org ON public.agent_configs (org_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_org ON public.agent_executions (org_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_phi_org ON public.encrypted_phi_store (org_id);

-- ── Add org_id to profiles ──────────────────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS default_org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- ── Auto-create org on first signup (for pilot) ─────────────────────────

CREATE OR REPLACE FUNCTION public.auto_create_org_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id UUID;
BEGIN
  INSERT INTO public.organizations (name, slug, owner_id)
  VALUES (
    coalesce(NEW.full_name, 'My Practice') || '''s Practice',
    'org-' || substr(NEW.user_id::text, 1, 8),
    NEW.user_id
  )
  RETURNING id INTO _org_id;

  INSERT INTO public.organization_members (org_id, user_id, role, phi_access_level)
  VALUES (_org_id, NEW.user_id, 'owner', 'full');

  UPDATE public.profiles SET default_org_id = _org_id WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_create_org
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.auto_create_org_for_user();
