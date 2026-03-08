# Dr. Claw Medical (DCM) — Playbook Protocols

> Repeatable plays for common business scenarios. Every agent should know these plays cold.

---

## PLAY 1: New Customer Onboarding

**Trigger**: New healthcare practice signs up for DCM agent deployment
**Duration**: First agent live within 48 hours, full deployment within 14 days
**Playmaker**: Operations Director

### Steps:
1. **Sales Suite Director** hands off signed contract with customer requirements and selected agent templates
2. **Operations Manager** kicks off onboarding call with customer within 24 hours — confirms goals, timeline, and access requirements
3. **IT Strategist** assesses customer's existing systems — EHR/PMS version, phone system, network infrastructure
4. **Engineering Director** assigns **Full-Stack Developer** to configure integrations (EHR API, n8n workflows, Supabase tenant)
5. **Clinical Ops Director** deploys first agent (typically Front Desk Agent) — configures skills, prompts, and scheduling rules
6. **Home Health Compliance Agent** reviews deployment for HIPAA compliance — PHI handling, encryption, access controls
7. **Agent Optimizer** establishes performance baselines — response times, completion rates, patient satisfaction
8. **Patient Outreach Agent** sets up engagement sequences if included in package
9. **Operations Manager** conducts 7-day check-in with customer — reviews metrics, gathers feedback, addresses issues
10. **Data Intelligence Hub** creates customer dashboard with real-time agent performance metrics
11. **Operations Manager** conducts 30-day success review — confirms ROI, plans expansion, identifies upsell opportunities

### Kill Criteria:
- Customer cannot provide EHR access within 7 business days
- HIPAA BAA not signed within 5 business days
- Customer goes dark for 5+ business days during onboarding
- Technical infrastructure incompatible with DCM platform (no remediation possible)

---

## PLAY 2: Insurance Denial Appeal

**Trigger**: Insurance claim denied or prior authorization rejected for a customer's patient
**Duration**: Appeal filed within 48 hours, resolved within 30 days
**Playmaker**: Insurance Verifier

### Steps:
1. **Insurance Verifier** receives denial notification and logs denial reason code
2. **Insurance Verifier** classifies denial: medical necessity, coding error, coverage exclusion, timely filing, or missing documentation
3. **Clinical Coordinator** gathers supporting clinical documentation — medical records, physician notes, clinical rationale
4. **Grant Writing Specialist** drafts appeal letter with clinical justification (trained on payer-specific appeal language)
5. **Insurance Verifier** reviews appeal package for completeness and payer-specific requirements
6. **Insurance Verifier** files appeal with payer within 48 hours of denial
7. **Insurance Verifier** tracks appeal status — follows up with payer at 7-day and 14-day marks
8. If denied on appeal: **Insurance Verifier** assesses external review eligibility and escalation options
9. If upheld on second appeal: assists patient with financial counseling options via **Patient Outreach Agent**
10. Post-resolution: **Insurance Verifier** logs denial pattern for future prevention — updates pre-auth triggers

### Kill Criteria:
- Appeal deadline passed (payer-specific, typically 60-180 days)
- Patient opts to self-pay or waive service
- Denial is for non-covered service with no appeal recourse
- Clinical documentation does not support medical necessity

---

## PLAY 3: HIPAA Breach Response

**Trigger**: Suspected or confirmed breach of Protected Health Information (PHI)
**Duration**: Notification within 1 hour, containment within 4 hours, full response within 60 days
**Playmaker**: Home Health Compliance Agent + Operations Director

> [!danger] This play runs to completion regardless. No kill criteria.

### Steps:
1. Incident detected or reported — **Data Intelligence Hub** alerts or manual report received
2. **Operations Director** initiates immediate containment — isolate affected systems, revoke compromised access, preserve evidence
3. **IT Strategist** assesses scope — records affected, data types exposed, attack vector, timeline of exposure
4. **Home Health Compliance Agent** initiates breach log per HIPAA Breach Notification Rule
5. **Engineering Director** assigns **Full-Stack Developer** to patch vulnerability and harden affected systems
6. **Home Health Compliance Agent** determines notification requirements:
   - Fewer than 500 individuals: notify affected persons within 60 days, log with HHS annually
   - 500+ individuals: notify affected persons within 60 days, notify HHS within 60 days, notify prominent media outlets
7. **Operations Director** coordinates customer notification — provides incident report, remediation steps, and support resources
8. **Dr. Claw (CEO)** delivers executive briefing to Lamin with full incident report
9. **Agent Optimizer** reviews all agent configurations for similar vulnerabilities across the platform
10. Post-breach review conducted within 30 days — root cause analysis, policy updates, staff retraining
11. Updated security protocols documented and distributed to all departments

### Kill Criteria:
- **None** — this play runs to completion regardless of scope or severity

---

## PLAY 4: Clinical Escalation Protocol

**Trigger**: AI agent detects clinical red flag during patient interaction (chest pain, suicidal ideation, adverse drug reaction, abnormal vitals, fall risk)
**Duration**: Immediate — human clinician engaged within 60 seconds
**Playmaker**: Clinical Coordinator

> [!danger] AI never makes autonomous clinical decisions. This play always escalates to a human.

### Steps:
1. Agent detects clinical keyword, pattern, or vital sign threshold — immediately flags as **CRITICAL**
2. Agent stops providing any clinical guidance — switches to: "I'm connecting you with a clinical team member right now"
3. **Clinical Coordinator** receives urgent alert with full conversation context and patient history
4. Human clinician takes over patient interaction within 60 seconds
5. If clinician unavailable: patient directed to call 911 or nearest emergency room
6. **Post-Op Care Agent** activated if follow-up monitoring needed
7. Incident documented in compliance log with full transcript
8. **Agent Optimizer** reviews detection accuracy — false positive rate, missed triggers
9. **Home Health Compliance Agent** reviews incident for regulatory reporting requirements
10. Detection model updated if gaps identified

### Kill Criteria:
- **None** — clinical escalations always complete. AI never substitutes for human clinical judgment.

---

## PLAY 5: New Agent Template Development

**Trigger**: Market research identifies demand for a new healthcare agent template
**Duration**: 30-60 days from concept to launch
**Playmaker**: Engineering Director + Clinical Ops Director

### Steps:
1. **Research Analyst** produces market validation report — demand signals, competitive landscape, target persona
2. **Market Intelligence Agent** confirms competitive gap and pricing opportunity
3. **Engineering Director** creates technical specification — skills, integrations, LLM selection, data requirements
4. **Full-Stack Developer** builds agent template — system prompt, skill functions, integration hooks, n8n workflows
5. **Clinical Ops Director** tests agent in simulated healthcare environment — realistic patient scenarios, edge cases
6. **Home Health Compliance Agent** reviews for HIPAA compliance — PHI handling, data retention, access controls
7. **Agent Optimizer** runs performance benchmarking — response quality, latency, accuracy, hallucination rate
8. **Marketing Director** creates launch collateral — landing page copy, feature sheets, demo scripts
9. **Sales Suite Director** prepares pricing, tier placement, and sales enablement materials
10. **Sales Enablement Agent** updates battle cards and objection handling guides
11. Agent template added to catalog and made available to customers
12. **Data Intelligence Hub** monitors adoption and performance for first 30 days post-launch

### Kill Criteria:
- HIPAA compliance review fails and cannot be remediated
- Market demand evaporates (competitor fills gap, regulatory change eliminates need)
- Technical feasibility proven impossible within acceptable cost/timeline
- Clinical testing reveals unacceptable error rates for healthcare context

---

## PLAY 6: Enterprise Suite Upsell Campaign

**Trigger**: Customer on Starter/Professional tier shows expansion signals (agent usage spike, feature requests, multi-location inquiry)
**Duration**: 2-week targeted campaign
**Playmaker**: Sales Suite Director + Account Expansion Agent

### Steps:
1. **Data Intelligence Hub** identifies expansion signals — usage patterns, support requests, feature inquiries
2. **Account Expansion Agent** builds custom ROI analysis based on customer's current usage and potential gains
3. **Sales Suite Director** reviews and approves upsell approach and pricing
4. **Proposal Specialist Agent** creates upgrade proposal with projected ROI and implementation plan
5. **CRM Intelligence Agent** enriches account data — decision-makers, budget cycle, competitive exposure
6. **Sales Outreach Agent** delivers personalized outreach — email sequence, demo invitation, case study
7. **Revenue Forecasting Agent** models revenue impact on ARR and pipeline
8. If converted: **Operations Director** triggers onboarding for new suite agents (see Play 1)
9. If declined: **Account Expansion Agent** schedules re-engagement at next natural trigger point

### Kill Criteria:
- Customer explicitly declines twice
- Customer shows churn risk (prioritize retention over upsell)
- Contract lock-in prevents upgrade until renewal date
- Customer's practice size doesn't justify enterprise tier

---

## PLAY 7: Platform Incident Response

**Trigger**: Platform outage, degraded performance, or critical bug affecting customer agents
**Duration**: P1 resolved within 4 hours, P2 within 24 hours
**Playmaker**: Engineering Director

### Steps:
1. **Data Intelligence Hub** detects anomaly or customer reports issue via support channel
2. **IT Strategist** triages severity:
   - **P1 Critical**: Platform down, agents unresponsive, data loss risk, PHI exposure
   - **P2 Major**: Degraded performance, partial functionality loss, single customer affected
   - **P3 Minor**: Cosmetic issues, non-blocking bugs, workaround available
3. **Full-Stack Developer** begins root cause analysis — logs, error traces, system metrics
4. **Operations Manager** communicates status to affected customers — acknowledges issue, provides estimated resolution
5. **Full-Stack Developer** develops and deploys fix — hotfix for P1, scheduled patch for P2/P3
6. **Agent Optimizer** verifies agent performance restored to baseline after fix
7. Post-incident review conducted within 48 hours — root cause, timeline, prevention measures
8. **Operations Manager** sends all-clear notification to affected customers with incident summary

### Kill Criteria:
- **None** — runs to resolution. P1 incidents may trigger HIPAA Breach Response (Play 3) if PHI affected.

---

## PLAY 8: Compliance Audit Preparation (HIPAA / SOC2)

**Trigger**: Scheduled regulatory review, customer compliance questionnaire, or internal audit cycle
**Duration**: 30 days preparation
**Playmaker**: Home Health Compliance Agent

### Steps:
1. **Home Health Compliance Agent** receives audit notification and defines scope — regulatory body, focus areas, time period
2. **Home Health Compliance Agent** reviews all data handling procedures against HIPAA Security Rule, Privacy Rule, Breach Notification Rule
3. **IT Strategist** verifies technical safeguards — encryption at rest (AES-256) and in transit (TLS 1.2+), access controls, audit logging
4. **Operations Manager** ensures all Business Associate Agreements (BAAs) are current — Supabase, Anthropic, AWS, OpenAI
5. **Full-Stack Developer** reviews codebase for PHI handling compliance — data flows, storage, transmission, deletion
6. **Home Health Compliance Agent** conducts mock audit with cross-functional team
7. Findings documented with severity classification: critical (halt operations), major (remediate before audit), minor (note for improvement)
8. Remediation tasks assigned with deadlines and progress tracked daily
9. Audit response package prepared — policies, procedures, technical documentation, evidence
10. **Dr. Claw (CEO)** briefed on any findings requiring executive attention or board-level reporting

### Kill Criteria:
- **None** — compliance audits are mandatory. Play runs to completion.

---

## PLAY 9: Patient Reactivation Campaign

**Trigger**: Customer's practice identifies lapsed patients (no visit in 6+ months) or seasonal preventive care window
**Duration**: 4-week campaign
**Playmaker**: Patient Outreach Agent + Marketing Director

### Steps:
1. **Data Intelligence Hub** segments lapsed patient list by last visit date, condition, insurance status, engagement history
2. **Patient Outreach Agent** generates personalized reactivation messages — relevant to patient's last condition and upcoming preventive care needs
3. **Content Engine** creates campaign materials — wellness tips, seasonal health reminders, practice updates
4. **Email Automation Agent** deploys multi-touch outreach sequence — email, SMS, voice (respecting patient communication preferences)
5. **Front Desk Agent** handles inbound appointment requests from reactivated patients
6. **Insurance Verifier** pre-checks insurance eligibility for returning patients before appointment
7. **Marketing Analytics Agent** tracks campaign performance daily — open rates, response rates, appointments booked, revenue attributed
8. **Marketing Director** adjusts messaging mid-campaign based on performance data
9. Post-campaign report delivered to customer with ROI analysis

### Kill Criteria:
- Response rate below 2% after week 2 (pivot strategy or pause)
- Patient opt-out honored immediately (CAN-SPAM and HIPAA compliance)
- Customer requests campaign pause or termination

---

## PLAY 10: Competitive Threat Response

**Trigger**: Competitor launches similar product, undercuts pricing, or wins a DCM prospect/customer
**Duration**: 7-day rapid response
**Playmaker**: Dr. Claw (CEO) + Market Intelligence Agent

### Steps:
1. **Market Intelligence Agent** produces competitive threat briefing — product comparison, pricing analysis, positioning gaps
2. **Research Analyst** deep-dives competitor offering — features, compliance posture, customer reviews, weaknesses
3. **Strategic Advisor** develops response strategy — differentiation, pricing adjustment, feature acceleration, or partnership
4. **Sales Enablement Agent** updates battle cards and objection handling guides with competitive intelligence
5. **Marketing Strategist** creates counter-positioning content — blog posts, comparison pages, customer testimonials
6. **Sales Suite Director** briefs sales team on competitive response and updated messaging
7. **Proposal Specialist Agent** updates pricing and differentiation in active proposals
8. **Revenue Forecasting Agent** models revenue impact scenarios — best case, base case, worst case
9. **Account Expansion Agent** proactively contacts at-risk customers with retention offers
10. **Dr. Claw (CEO)** reviews results after 7 days and determines if sustained response needed

### Kill Criteria:
- Competitor retreats from market or pivots away
- Threat assessment downgraded to low after analysis
- Competitive advantage confirmed and no customer churn observed

---

## Playbook Non-Negotiables

1. **Every play has a playmaker** — one person accountable for the outcome
2. **Every play has a timeline** — no open-ended execution
3. **Every play has kill criteria** — know when to walk away (except safety and compliance plays)
4. **Every play is documented** — Data Intelligence Hub archives the outcome
5. **Every play improves** — post-play debrief identifies process improvements
6. **The customer always knows what's happening** — Operations Manager communicates at every milestone
7. **Compliance is not optional** — Home Health Compliance Agent reviews anything that touches PHI or regulations
8. **PHI is never used in marketing without explicit patient consent** — HIPAA Privacy Rule governs all patient outreach
9. **Clinical escalations always involve a human** — AI never makes clinical decisions autonomously
10. **All plays respect the HIPAA minimum necessary standard** — only access and share the minimum PHI required
