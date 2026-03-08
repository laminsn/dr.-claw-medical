# HIPAA BAA Requirements — Dr. Claw Medical

## What is a BAA?

A Business Associate Agreement (BAA) is required under HIPAA whenever a covered entity
(healthcare provider) shares Protected Health Information (PHI) with a third-party service
(business associate). Without a signed BAA, storing or processing PHI is a HIPAA violation.

**Dr. Claw Medical is the business associate.** Our customers (clinics, practices) are covered entities.

---

## Subprocessor BAA Status

| Subprocessor | Service | PHI Exposure | BAA Available | Status | Notes |
|---|---|---|---|---|---|
| **Supabase** | Database, Auth, Edge Functions | Yes — stores PHI at rest | Yes (Team/Enterprise plan) | **REQUIRED before pilot** | Must upgrade from free tier. BAA covers PostgreSQL, Auth, Storage, Edge Functions. |
| **Anthropic (Claude)** | LLM — clinical zone | Yes — processes PHI in prompts | Yes (API Enterprise) | **REQUIRED before pilot** | Contact sales@anthropic.com. Claude processes clinical text containing PHI. |
| **OpenAI** | LLM — operations zone | Possible — PHI in prompts | Yes (Enterprise/API) | **REQUIRED if used with PHI** | Zero Data Retention (ZDR) API available. Request via OpenAI sales. |
| **Google (Gemini)** | LLM — external zone | Low — external marketing only | Yes (Google Cloud BAA) | Recommended | Only needed if Gemini processes any patient-adjacent data. |
| **n8n (self-hosted)** | Workflow automation | Yes — workflows process PHI | N/A (self-hosted) | **Covered by self-hosting** | Hosted on our EC2. No third-party BAA needed. We control the data. |
| **AWS (EC2)** | n8n hosting infrastructure | Yes — n8n data at rest | Yes (AWS BAA) | **REQUIRED** | Enable via AWS Artifact console. Covers EC2, EBS, VPC. Free to sign. |
| **Twilio** | SMS/Voice (appointment reminders) | Yes — patient phone numbers | Yes | Required if used | BAA available on request. Covers SMS, Voice, phone number storage. |
| **SendGrid** | Email (patient communications) | Yes — patient email addresses | Yes (via Twilio) | Required if used | Covered under Twilio BAA since acquisition. |
| **Slack** | Internal alerts only | No — no PHI in alerts | N/A | Not required | Breach alerts contain event IDs only, never PHI. Verify in slack-notify function. |

---

## Action Items Before Pilot

### Critical (blocks pilot launch)

1. **Supabase BAA**
   - Upgrade to Team plan ($25/mo per project)
   - Sign BAA via Supabase dashboard → Settings → Compliance
   - Enable PITR (Point-in-Time Recovery) for disaster recovery

2. **Anthropic BAA**
   - Contact Anthropic sales for API BAA
   - Confirm Claude API qualifies (not just claude.ai consumer product)
   - Document: model versions used, data retention policy, PHI handling

3. **AWS BAA**
   - Sign via AWS Management Console → AWS Artifact → Agreements
   - Covers EC2 instances hosting n8n
   - No cost, but must be signed before PHI touches EC2

### Important (should complete before pilot)

4. **OpenAI BAA** (if clinical agents use GPT models)
   - Request Zero Data Retention (ZDR) API access
   - Sign BAA for API usage
   - Alternative: route all PHI-containing tasks through Claude only

5. **Encryption verification**
   - Supabase: confirm TLS in transit + AES-256 at rest
   - EC2: enable EBS encryption for n8n volumes
   - Verify pgcrypto encryption for `encrypted_phi_store` table

### Optional (depends on feature usage)

6. **Twilio/SendGrid BAA** — only if appointment reminders or patient emails are enabled
7. **Google Cloud BAA** — only if Gemini processes any patient-adjacent data

---

## Our Obligations as Business Associate

Per HIPAA Security Rule, Dr. Claw Medical must:

- [ ] Implement administrative safeguards (security officer, risk analysis, workforce training)
- [ ] Implement physical safeguards (facility access controls — covered by cloud providers)
- [ ] Implement technical safeguards:
  - [x] Access control (RLS policies, role-based PHI access)
  - [x] Audit controls (hash-chained audit log)
  - [x] Integrity controls (PHI encryption at rest via pgcrypto)
  - [x] Transmission security (TLS everywhere)
  - [x] PHI scanning before external API calls
  - [x] Breach detection monitoring
- [ ] Maintain BAA with each subprocessor
- [ ] Report breaches within 60 days (72 hours to covered entity)
- [ ] Conduct annual risk assessment
- [ ] Document all PHI data flows

---

## PHI Data Flow Map

```
Patient Data Entry (browser)
  → TLS → Supabase Auth (JWT)
  → Supabase Edge Function (llm-router)
    → PHI Scanner (detect & redact)
    → If clinical zone: encrypt PHI → encrypted_phi_store
    → Send sanitized prompt → Anthropic Claude API (BAA required)
    → Response → audit_log entry
  → n8n workflows (self-hosted EC2)
    → PHI Scanner at gateway
    → Process workflow steps
    → Results back to Supabase
  → Client receives de-identified response
```

**PHI never reaches:** Slack, browser localStorage, external marketing APIs, Gemini (external zone only).

---

## Timeline

| Week | Action |
|---|---|
| Week 1 | Sign AWS BAA (free, instant), upgrade Supabase to Team plan |
| Week 1 | Contact Anthropic sales re: API BAA |
| Week 2 | Sign Supabase BAA, enable PITR |
| Week 2 | Receive and sign Anthropic BAA |
| Week 3 | OpenAI ZDR + BAA (if needed) |
| Week 3 | Final PHI data flow audit |
| Week 4 | Pilot launch with BAA chain complete |
