# HANDOFF — Dr. Claw Medical (DCM)
> Session: 2026-03-07 | Operational Framework Build

## 1. Project Overview
Healthcare AI agent SaaS platform. React/TypeScript/Vite/Tailwind/shadcn + Supabase (DB/Auth/Edge Functions) + n8n workflows. 42 agent templates, 11 departments, HIPAA-compliant, multi-LLM (Claude/OpenAI/Gemini).

**Key paths**: `CLAUDE.md` (business rules), `.claude/rules/` (org chart, protocols), `memory/` (state), `src/data/agentTemplates.ts` (agent catalog), `supabase/` (backend), `n8n-deployment/` (workflows). See `docs/HIPAA_BAA_REQUIREMENTS.md` for compliance chain.

## 2. Current Status
**Done**: Full operational framework — 12 files: `CLAUDE.md`, org-chart, 10 handoff protocols, 10 playbooks, dept-skills manifest, dispatch skill, apply-book-knowledge skill, 4 memory files (contacts/decisions/kpis/projects), settings.json.

**Blockers**: No soul files (`souls/*.soul.md`). No `profile/` (17-section business profile). No `departments/` agent definitions. BAA chain unverified. `.env` compliance status unknown.

## 3. Key Decisions
- Hybrid project (codebase + business system) — `CLAUDE.md` serves both
- HIPAA non-negotiable in all protocols; clinical escalation always to humans
- 11 depts (vs 8 in other businesses) to match DCM's product categories
- Modeled on BET (brazil-escrow-title) template structure
- Soul files deferred — `src/data/agentTemplates.ts` serves similar role for now
- Obsidian-flavored MD throughout (YAML frontmatter, `> [!callout]`, tags)

## 4. Next Steps
- [ ] Create `profile/` with 17 sections + `PROFILE-INDEX.md` + `AGENT-MAP.md`
- [ ] Create soul files for key agents (Dr. Claw CEO, directors)
- [ ] Verify BAA status: Supabase, Anthropic, AWS per HIPAA doc
- [ ] Audit `.env` and Edge Functions for PHI handling
- [ ] Test n8n workflows and Supabase migrations/RLS
- [ ] Run `npm run build` to confirm production build

**Focus files**: `src/data/agentTemplates.ts`, `integrations.ts`, `skills.ts`

## 5. Context Notes
- "Dr. Claw" = CEO agent, not project name. Project = "DCM"
- Empire agents (Leona, Nova, Marcus, Sage, Atlas) shared across businesses
- Agent templates are products, not employees
- Revenue: SaaS subscriptions (4 tiers) + Enterprise Suites (Marketing/Sales)
- Scaffolded by Lovable.dev — expect boilerplate patterns
- **Flagging**: HIPAA, PHI, BAA, clinical escalation, breach = compliance-critical
- **Prune candidate**: `src/components/ui/` (40+ shadcn — many potentially unused)
