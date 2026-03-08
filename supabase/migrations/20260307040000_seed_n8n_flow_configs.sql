-- Seed n8n_flow_configs with the 6 healthcare workflows.
-- webhook_url values are placeholders — update after n8n deployment.
-- These are inserted as system-level configs (user_id must be set per-tenant).
-- For the pilot, run this with the pilot user's UUID.

-- Helper function to seed flows for a given user
CREATE OR REPLACE FUNCTION public.seed_n8n_flows_for_user(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _n8n_base TEXT;
BEGIN
  _n8n_base := coalesce(current_setting('app.n8n_base_url', true), 'https://n8n.example.com');

  INSERT INTO n8n_flow_configs (user_id, flow_key, flow_name, webhook_url, description, agent_zone, allowed_agent_ids, requires_phi_scan)
  VALUES
    (
      _user_id,
      'patient-intake',
      'Patient Intake Processing',
      _n8n_base || '/webhook/patient-intake',
      'Validates and processes new patient intake forms with PHI protection',
      'clinical',
      ARRAY['dr-front-desk', 'dr-intake', 'patient-coordinator'],
      true
    ),
    (
      _user_id,
      'insurance-verification',
      'Insurance Verification',
      _n8n_base || '/webhook/insurance-verification',
      'Verifies patient insurance eligibility and coverage details',
      'operations',
      ARRAY['insurebot', 'dr-front-desk', 'billing-agent'],
      true
    ),
    (
      _user_id,
      'clinical-documentation',
      'Clinical Documentation',
      _n8n_base || '/webhook/clinical-documentation',
      'Structures and summarizes clinical notes using LLM',
      'clinical',
      ARRAY['clinical-scribe', 'dr-clinical', 'documentation-agent'],
      true
    ),
    (
      _user_id,
      'appointment-reminders',
      'Appointment Reminders',
      _n8n_base || '/webhook/appointment-reminders',
      'Sends automated appointment reminders via SMS/email',
      'operations',
      ARRAY['dr-front-desk', 'patient-coordinator', 'outreach-agent'],
      false
    ),
    (
      _user_id,
      'referral-management',
      'Referral Management',
      _n8n_base || '/webhook/referral-management',
      'Processes and tracks patient referrals between providers',
      'clinical',
      ARRAY['referral-agent', 'dr-clinical', 'care-coordinator'],
      true
    ),
    (
      _user_id,
      'ops-reporting',
      'Operations Reporting',
      _n8n_base || '/webhook/ops-reporting',
      'Aggregates daily KPIs and generates operations reports',
      'operations',
      ARRAY['ops-reporter', 'kpi-tracker', 'admin-agent'],
      false
    )
  ON CONFLICT (user_id, flow_key) DO UPDATE SET
    flow_name = EXCLUDED.flow_name,
    webhook_url = EXCLUDED.webhook_url,
    description = EXCLUDED.description,
    agent_zone = EXCLUDED.agent_zone,
    allowed_agent_ids = EXCLUDED.allowed_agent_ids,
    requires_phi_scan = EXCLUDED.requires_phi_scan,
    updated_at = now();
END;
$$;

COMMENT ON FUNCTION public.seed_n8n_flows_for_user IS
  'Seeds the 6 starter healthcare n8n workflows for a user. Call after n8n deployment with real webhook URLs via app.n8n_base_url setting.';
