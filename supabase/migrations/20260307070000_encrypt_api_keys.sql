-- Phase 4.5: Encrypt API keys in user_integrations
-- Moves plaintext api_key to pgp_sym_encrypt via SECURITY DEFINER functions.

-- Add encrypted column
ALTER TABLE public.user_integrations
  ADD COLUMN IF NOT EXISTS api_key_encrypted BYTEA;

-- ── Store encrypted key ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.store_integration_key(
  _user_id UUID,
  _integration_key TEXT,
  _api_key TEXT,
  _is_active BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _enc_key TEXT;
  _record_id UUID;
BEGIN
  _enc_key := current_setting('app.phi_encryption_key', true);
  IF _enc_key IS NULL OR _enc_key = '' THEN
    RAISE EXCEPTION 'Encryption key not configured (app.phi_encryption_key)';
  END IF;

  INSERT INTO public.user_integrations (user_id, integration_key, api_key, api_key_encrypted, is_active)
  VALUES (
    _user_id,
    _integration_key,
    '********',  -- placeholder, never store plaintext
    pgp_sym_encrypt(_api_key, _enc_key),
    _is_active
  )
  ON CONFLICT (user_id, integration_key) DO UPDATE SET
    api_key = '********',
    api_key_encrypted = pgp_sym_encrypt(_api_key, _enc_key),
    is_active = _is_active,
    updated_at = now()
  RETURNING id INTO _record_id;

  -- Audit
  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, description, risk_level)
  VALUES (_user_id, 'integration.key_stored', 'user_integration', _integration_key, 'API key encrypted and stored', 'medium');

  RETURN _record_id;
END;
$$;

-- ── Retrieve decrypted key ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_integration_key(
  _user_id UUID,
  _integration_key TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _enc_key TEXT;
  _result TEXT;
BEGIN
  _enc_key := current_setting('app.phi_encryption_key', true);
  IF _enc_key IS NULL OR _enc_key = '' THEN
    RAISE EXCEPTION 'Encryption key not configured (app.phi_encryption_key)';
  END IF;

  SELECT pgp_sym_decrypt(api_key_encrypted, _enc_key) INTO _result
  FROM public.user_integrations
  WHERE user_id = _user_id
    AND integration_key = _integration_key
    AND is_active = true;

  -- Audit
  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, description, risk_level)
  VALUES (_user_id, 'integration.key_accessed', 'user_integration', _integration_key, 'API key decrypted for use', 'medium');

  RETURN _result;
END;
$$;

-- ── Migrate existing plaintext keys ─────────────────────────────────────
-- Run this once after setting app.phi_encryption_key in Supabase secrets.
-- DO NOT run until the encryption key is configured.

-- CREATE OR REPLACE FUNCTION public.migrate_plaintext_keys()
-- RETURNS INTEGER
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
-- DECLARE
--   _enc_key TEXT;
--   _count INTEGER := 0;
--   _rec RECORD;
-- BEGIN
--   _enc_key := current_setting('app.phi_encryption_key', true);
--   IF _enc_key IS NULL OR _enc_key = '' THEN
--     RAISE EXCEPTION 'Set app.phi_encryption_key before migrating';
--   END IF;
--
--   FOR _rec IN
--     SELECT id, api_key FROM public.user_integrations
--     WHERE api_key != '********' AND api_key_encrypted IS NULL
--   LOOP
--     UPDATE public.user_integrations
--     SET api_key_encrypted = pgp_sym_encrypt(_rec.api_key, _enc_key),
--         api_key = '********',
--         updated_at = now()
--     WHERE id = _rec.id;
--     _count := _count + 1;
--   END LOOP;
--
--   RETURN _count;
-- END;
-- $$;
