-- Phase 4.3: Hash-chained audit log for tamper detection
-- Each entry SHA-256 hashes its own content + the previous entry's hash,
-- creating a blockchain-style integrity chain.

-- Add hash columns
ALTER TABLE public.audit_log
  ADD COLUMN IF NOT EXISTS entry_hash TEXT,
  ADD COLUMN IF NOT EXISTS previous_hash TEXT;

-- Index for chain verification
CREATE INDEX IF NOT EXISTS idx_audit_log_hash ON public.audit_log (entry_hash);

-- ── Hash computation function ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.compute_audit_hash()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _prev_hash TEXT;
  _payload TEXT;
BEGIN
  -- Get the most recent entry's hash
  SELECT entry_hash INTO _prev_hash
  FROM public.audit_log
  WHERE created_at < NEW.created_at
    OR (created_at = NEW.created_at AND id < NEW.id)
  ORDER BY created_at DESC, id DESC
  LIMIT 1;

  -- Genesis block
  IF _prev_hash IS NULL THEN
    _prev_hash := 'GENESIS';
  END IF;

  NEW.previous_hash := _prev_hash;

  -- Build deterministic payload for hashing
  _payload := concat_ws('|',
    NEW.id::text,
    coalesce(NEW.user_id::text, ''),
    NEW.action,
    coalesce(NEW.resource_type, ''),
    coalesce(NEW.resource_id, ''),
    coalesce(NEW.description, ''),
    NEW.phi_accessed::text,
    coalesce(NEW.risk_level, 'low'),
    NEW.created_at::text,
    _prev_hash
  );

  NEW.entry_hash := encode(digest(_payload, 'sha256'), 'hex');

  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_log_compute_hash
  BEFORE INSERT ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.compute_audit_hash();

-- ── Chain verification function ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.verify_audit_chain(
  _start_id UUID DEFAULT NULL,
  _limit INTEGER DEFAULT 1000
)
RETURNS TABLE(
  log_id UUID,
  is_valid BOOLEAN,
  expected_hash TEXT,
  actual_hash TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rec RECORD;
  _prev_hash TEXT := 'GENESIS';
  _computed TEXT;
  _payload TEXT;
BEGIN
  FOR _rec IN
    SELECT a.*
    FROM public.audit_log a
    WHERE (_start_id IS NULL OR a.created_at >= (SELECT created_at FROM public.audit_log WHERE id = _start_id))
    ORDER BY a.created_at ASC, a.id ASC
    LIMIT _limit
  LOOP
    _payload := concat_ws('|',
      _rec.id::text,
      coalesce(_rec.user_id::text, ''),
      _rec.action,
      coalesce(_rec.resource_type, ''),
      coalesce(_rec.resource_id, ''),
      coalesce(_rec.description, ''),
      _rec.phi_accessed::text,
      coalesce(_rec.risk_level, 'low'),
      _rec.created_at::text,
      _prev_hash
    );

    _computed := encode(digest(_payload, 'sha256'), 'hex');

    log_id := _rec.id;
    expected_hash := _computed;
    actual_hash := _rec.entry_hash;
    is_valid := (_computed = _rec.entry_hash);
    created_at := _rec.created_at;

    RETURN NEXT;

    _prev_hash := _rec.entry_hash;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.verify_audit_chain IS
  'Verifies the integrity of the audit log hash chain. Returns rows with is_valid=false if tampering is detected.';
