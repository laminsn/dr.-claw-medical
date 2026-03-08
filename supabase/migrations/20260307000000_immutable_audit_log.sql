-- Make audit_log and n8n_gateway_audit truly immutable.
-- No row can be updated or deleted, even by service role.

-- 1. Trigger function to block modifications
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log records cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

-- 2. Apply to audit_log
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_log_immutable'
  ) THEN
    CREATE TRIGGER audit_log_immutable
      BEFORE UPDATE OR DELETE ON public.audit_log
      FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
  END IF;
END $$;

-- 3. Apply to n8n_gateway_audit
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'n8n_gateway_audit'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'n8n_gateway_audit_immutable'
    ) THEN
      CREATE TRIGGER n8n_gateway_audit_immutable
        BEFORE UPDATE OR DELETE ON public.n8n_gateway_audit
        FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
    END IF;
  END IF;
END $$;

-- 4. Revoke DELETE on audit tables from authenticated role
REVOKE DELETE ON public.audit_log FROM authenticated;
REVOKE UPDATE ON public.audit_log FROM authenticated;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'n8n_gateway_audit'
  ) THEN
    EXECUTE 'REVOKE DELETE ON public.n8n_gateway_audit FROM authenticated';
    EXECUTE 'REVOKE UPDATE ON public.n8n_gateway_audit FROM authenticated';
  END IF;
END $$;
