---
name: dispatch
description: Route incoming tasks to the appropriate DCM agent based on department and expertise
version: 1.0
created: 2026-03-07
tags: [skill, dispatch, dcm, routing]
---

# DCM Task Dispatch Skill

## Purpose
Route incoming tasks from Lamin (via Leona) to the appropriate DCM agent or department.

## Routing Logic

### Step 1: Identify Task Domain

| Domain | Keywords | Route To |
|--------|----------|----------|
| General DCM | business, strategy, P&L, overall, company | Dr. Claw (CEO) |
| Clinical Products | patient, clinical, EHR, front desk, insurance, post-op, home health, scheduling, chart, referral | Clinical Operations Director |
| Executive Products | C-suite, advisory, AI strategy, roadmap, board | Executive Products Director |
| Marketing | brand, ads, SEO, email, events, content, grants, video | Marketing Director |
| Marketing Suite | enterprise marketing, paid media, analytics, pipeline, omni-channel | Marketing Suite Director |
| Sales | leads, CRM, proposals, forecasting, accounts, outreach, pipeline | Sales Suite Director |
| Finance | P&L, budget, forecasting, cost analysis, revenue, ARPA | Finance Director |
| Operations | onboarding, HR, process, SOP, customer success | Operations Director |
| Research | market research, competitive intel, deep analysis, trends | Research Director |
| Engineering | code, integration, Notion, Airtable, n8n, infrastructure, API, Supabase | Engineering Director |
| Clawbots | LinkedIn, Google, prospecting, lead enrichment | Clawbots Director |
| Meta-Intelligence | agent optimization, analytics, dashboards, self-improvement, performance | Meta-Intelligence Director |
| Technology (Empire) | systems, automation, integration, infrastructure | Nova (Empire Tech Lead) |
| CRM (Empire) | GHL, pipeline, referral tracking, lead management | Marcus (Empire CRM Lead) |
| Documentation (Empire) | SOPs, training docs, Notion, knowledge base | Sage (Empire Docs Lead) |
| Analytics (Empire) | data, reports, metrics, KPIs, dashboards | Atlas (Empire Analytics Lead) |

### Step 2: Determine Urgency

| Level | Criteria | Response |
|-------|----------|----------|
| Critical | HIPAA breach, platform outage, clinical emergency, PHI exposure, patient safety risk | Immediate — bypass standard routing |
| Urgent | Customer agent failure, compliance deadline, insurance denial with deadline, P1 incident | Within 1 hour |
| Standard | Business operations, agent development, reporting, customer onboarding | Within 4 hours |
| Low | Research, documentation, long-term planning, process improvement | Within 24 hours |

### Step 3: Dispatch

1. Leona receives task from Lamin
2. Leona identifies domain and urgency
3. Leona routes to Dr. Claw for DCM-specific tasks
4. Dr. Claw dispatches to appropriate Director
5. Director delegates to specialist or handles directly
6. Results flow back up: Specialist -> Director -> Dr. Claw -> Leona -> Lamin

### Cross-Department Tasks

If task spans multiple departments:
1. Dr. Claw identifies all departments involved
2. Dr. Claw dispatches to multiple Directors in parallel
3. Each Director coordinates their team's piece
4. Dr. Claw synthesizes results and reports up

### Common Cross-Department Scenarios

| Scenario | Departments Involved |
|----------|---------------------|
| New customer onboarding | Sales Suite + Operations + Engineering + Clinical Ops + Meta-Intelligence |
| Agent template development | Research + Engineering + Clinical Ops + Operations (compliance) + Marketing |
| HIPAA breach response | Operations (compliance) + Engineering + Meta-Intelligence + Dr. Claw |
| Enterprise suite upsell | Sales Suite + Marketing Suite + Meta-Intelligence + Finance |
| Platform incident | Engineering + Operations + Meta-Intelligence |
| Patient reactivation campaign | Clinical Ops + Marketing + Meta-Intelligence |
| Compliance audit | Operations + Engineering + Clinical Ops + Dr. Claw |
| Competitive threat response | Research + Sales Suite + Marketing + Dr. Claw |

## References
- Org chart: `.claude/rules/org-chart.md`
- Handoff protocols: `.claude/rules/handoff-protocols.md`
- Playbook protocols: `.claude/rules/playbook-protocols.md`
