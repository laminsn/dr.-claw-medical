-- Enable pgcrypto for PHI encryption at rest.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypted PHI store: all PHI data lives here, referenced by other tables.
-- Encryption key is stored as a Supabase secret (PHI_ENCRYPTION_KEY).
CREATE TABLE public.encrypted_phi_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reference_type TEXT NOT NULL,        -- 'patient', 'document', 'note', 'task'
  reference_id TEXT NOT NULL,          -- ID in the source table
  field_name TEXT NOT NULL,            -- which field this encrypted value belongs to
  encrypted_value BYTEA NOT NULL,      -- pgp_sym_encrypt output
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, reference_type, reference_id, field_name)
);

ALTER TABLE public.encrypted_phi_store ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own PHI" ON public.encrypted_phi_store
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own PHI" ON public.encrypted_phi_store
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own PHI" ON public.encrypted_phi_store
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own PHI" ON public.encrypted_phi_store
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_phi_store_ref ON public.encrypted_phi_store (user_id, reference_type, reference_id);

-- SECURITY DEFINER functions for encrypt/decrypt.
-- The encryption key never reaches the client.

CREATE OR REPLACE FUNCTION public.encrypt_phi(
  _user_id UUID,
  _reference_type TEXT,
  _reference_id TEXT,
  _field_name TEXT,
  _plaintext TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _key TEXT;
  _record_id UUID;
BEGIN
  _key := current_setting('app.phi_encryption_key', true);
  IF _key IS NULL OR _key = '' THEN
    RAISE EXCEPTION 'PHI encryption key not configured';
  END IF;

  INSERT INTO public.encrypted_phi_store (user_id, reference_type, reference_id, field_name, encrypted_value)
  VALUES (
    _user_id,
    _reference_type,
    _reference_id,
    _field_name,
    pgp_sym_encrypt(_plaintext, _key)
  )
  ON CONFLICT (user_id, reference_type, reference_id, field_name)
  DO UPDATE SET
    encrypted_value = pgp_sym_encrypt(_plaintext, _key),
    updated_at = now()
  RETURNING id INTO _record_id;

  -- Audit the encryption
  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, description, phi_accessed, risk_level)
  VALUES (_user_id, 'phi.encrypt', _reference_type, _reference_id, 'PHI field encrypted: ' || _field_name, true, 'medium');

  RETURN _record_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_phi(
  _user_id UUID,
  _reference_type TEXT,
  _reference_id TEXT,
  _field_name TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _key TEXT;
  _result TEXT;
BEGIN
  _key := current_setting('app.phi_encryption_key', true);
  IF _key IS NULL OR _key = '' THEN
    RAISE EXCEPTION 'PHI encryption key not configured';
  END IF;

  SELECT pgp_sym_decrypt(encrypted_value, _key) INTO _result
  FROM public.encrypted_phi_store
  WHERE user_id = _user_id
    AND reference_type = _reference_type
    AND reference_id = _reference_id
    AND field_name = _field_name;

  -- Audit the decryption
  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, description, phi_accessed, risk_level)
  VALUES (_user_id, 'phi.decrypt', _reference_type, _reference_id, 'PHI field decrypted: ' || _field_name, true, 'medium');

  RETURN _result;
END;
$$;
