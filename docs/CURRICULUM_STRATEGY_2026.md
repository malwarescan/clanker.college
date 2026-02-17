# Curriculum Strategy 2026: Agent-Usage Demand → Course Packs

Use X/Twitter and community “agent usage” patterns to decide which Clanker.College courses (packs) to build. Courses are **capability standards**: deterministic rubrics, verifiable artifacts, drift/regression prevention.

---

## What “agents” are actually used for in 2026 (demand signal)

Based on Claude Code + Skills/Plugins and the “personal coworker” / device-control wave:

| # | Bucket | Description |
|---|--------|-------------|
| 1 | **Workflow agents** | Repeatable tasks via filesystem Skills (not one-off prompting) |
| 2 | **Plugins** | Bundle skills + commands + hooks + integrations for teams (installable capabilities) |
| 3 | **Coworker agents** | Operate on local files + connected services (folders, connectors, automations) |
| 4 | **Personal assistants** | Clawdbot/OpenClaw on devices; message/act in real channels (WhatsApp, Telegram, Slack) |
| 5 | **Social/X automation** | Posting, replying, monitoring, summarizing; differentiator = policy + safety + brand constraints |

**Implication:** Highest-value courses are **capability standards** that pin behavior to deterministic rubrics, produce verifiable artifacts (graded outputs + certificates), and prevent drift/regressions—not generic “topics” (SEO, marketing, etc.).

---

## Course selection framework (A–D)

For any proposed course, require **all four**:

- **A) Repetition** — Task happens weekly/daily in real orgs.
- **B) Risk** — Mistakes are costly (security, data loss, compliance, brand).
- **C) Verifiability** — Outputs can be graded deterministically (schema + rubric).
- **D) Installability** — Ships as Skills/Plugin so it can be invoked on demand.

**If a course fails any of A–D, don’t build it.**

---

## 12 courses to build first (ranked)

Each course = 1 Pack: 5–10 Skills, deterministic rubric, examples, certificate.

| # | Course | Outcome | Why first |
|---|--------|---------|-----------|
| **01** | **Agent Evaluation + Regression Harness** | “We can prove the agent still does the job after changes.” | Foundation; every serious team needs this to ship agents safely. **Highest ROI to start.** |
| 02 | Prompt Injection + Tool Safety Hardening | Agent refuses malicious instructions and unsafe actions. | Coworker agents touching files raise safety stakes. |
| 03 | Claude Skills Authoring Standard (SKILL.md) | Write skills that auto-invoke correctly and stay deterministic. | Skills are first-class for org customization. |
| 04 | Plugin Packaging + Team Distribution | Ship a plugin repo that installs cleanly across a team. | Plugins = “enterprise distribution unit.” |
| 05 | Local Coworker Ops (folders, connectors, reversible actions) | Agent operates on local files without wrecking things. | Where adoption is going (agents as coworkers). |
| 06 | Inbox + Calendar Triage Agent | Agent triages, drafts, schedules with policy constraints. | Matches “assistant that actually does things” demand. |
| 07 | Support Agent Standard | Ticket handling with guardrails (intent, retrieval, handoff). | High repetition, high risk. |
| 08 | Sales SDR Agent Standard | Lead qualification + booking with strict compliance. | Qualification rubric + CRM note format. |
| 09 | Content Ops Agent | Brief → draft → QA → publish checklist. | Publish-ready content that passes QA. |
| 10 | X/Twitter Operator Agent | Monitor → respond → post, policy-first. | Edge = policy + deterministic QA, not just automation. |
| 11 | Data Extraction Agent | Screenshots/PDFs → structured, schema-valid JSON. | Extraction + table normalization + audit trail. |
| 12 | Agent Observability + Runbooks | Incidents measurable, diagnosable, fixable. | Logging schema, failure taxonomy, runbooks. |

### COURSE 01 — Agent Evaluation + Regression Harness (start here)

- **Skills:** Build eval cases (NDJSON), design `rubric.json` + `hard_fails.json`, run batch grading, diff results across versions, gate release on pass criteria.
- **Why:** Makes every other course “provably installable + certifiable”; core selling point of Clanker.College in 2026.

### COURSE 02 — Prompt Injection + Tool Safety Hardening

- **Skills:** Detect injection patterns, safe browsing/retrieval, file-system action constraints, allowlist/denylist tool usage, incident write-up template.

### COURSE 03 — Claude Skills Authoring Standard (SKILL.md)

- **Skills:** Frontmatter schema, trigger design, step structure for reliability, output schema discipline, examples/fixtures that prevent ambiguity.

### COURSE 04 — Plugin Packaging + Team Distribution

- **Skills:** `plugin.json` authoring, versioning strategy, install paths + validation, compatibility checks, release checklist.

### COURSE 05 — Local Coworker Ops

- **Skills:** Safe file ops (copy-first, no delete), batch rename/organize, screenshot-to-structured extraction, audit log writing, rollback plan as required output.

### COURSE 06 — Inbox + Calendar Triage Agent

- **Skills:** Priority classification rubric, draft response templates with approvals, calendar conflict resolution, escalation rules, weekly summary report output.

### COURSE 07 — Support Agent Standard

- **Skills:** Intent classification, knowledge retrieval (citations required), refund/exception guardrails, tone + brand constraints, handoff rules.

### COURSE 08 — Sales SDR Agent Standard

- **Skills:** Qualification rubric, disallowed claims hard-fails, scheduling + follow-up sequencing, CRM note format (structured), “next step” generation.

### COURSE 09 — Content Ops Agent

- **Skills:** Brief extraction, outline rubric, fact-check protocol, structured metadata output, QA checklist enforcement.

### COURSE 10 — X/Twitter Operator Agent

- **Skills:** Reply policy + tone constraints, controversy escalation, thread summarizer + response generator, post scheduling plan output, brand voice validator.

### COURSE 11 — Data Extraction Agent

- **Skills:** Extraction prompt discipline, table normalization, JSON Schema validation, error handling + uncertainty tags, audit trail generation.

### COURSE 12 — Agent Observability + Runbooks

- **Skills:** Logging schema, failure taxonomy, runbook authoring, postmortem template, KPI dashboard spec output.

---

## Trend → Course pipeline (weekly)

Keep curriculum aligned with real demand:

1. **Capture** — 50–100 posts/week from: Claude Code, skills/plugins, agent workflows, Clawdbot/OpenClaw communities.
2. **Label** — Buckets: Build/ship (skills/plugins), evaluate, safety, coworker/file ops, personal assistant ops, social ops.
3. **Extract** — Repeated pain: “How do I package this?” “How do I stop drift?” “How do I prevent disasters?”
4. **Convert** — Pain → course proposal using A–D framework.
5. **Approve** — Only if you can define deterministic outputs and hard-fails.

---

## What dev/platform must support (for curriculum to ship at scale)

Per pack, ensure:

| Requirement | Status / notes |
|-------------|----------------|
| `examples.ndjson` (eval cases) | Pack standard; see `CLANKER_PACK_STANDARD_v1.md` |
| Rubric `output_schema` (JSON Schema) | Used by `/api/grade` for payload validation |
| `hard_fails` with explicit detection rules | In rubric; see pack standard |
| “Example certificate” artifact for landing pages | Homepage hero uses `getExampleCertificate()`; optional `GET /api/certificates/example` (P1) |
| Version-to-version diff reporting | **Regression course (01) depends on this** — add when building Course 01 |

See **COURSE_PACK_IMPLEMENTATION_STATUS.md** for full implementation status (purchase, install, grade, certificates).

---

## Single highest ROI course to start with

**COURSE 01: Agent Evaluation + Regression Harness.** It is the foundation that makes every other course “provably installable + certifiable,” which is the core selling point of Clanker.College in 2026.

---

## Where courses are listed

- **On the site:** **[Catalog](/catalog)** — lists all packs that have at least one **certified** version in the database. Also on the **homepage** under “Featured packs” (first 6).
- **Database:** Packs and certified versions are seeded via `pnpm db:seed` (see `packages/db/prisma/seed.ts`). The 12 curriculum packs + design-systems are inserted with `certifiedAt` set so they appear in the catalog.
- **Filesystem:** Stub pack folders under `packs/` (created by `pnpm exec tsx scripts/create-curriculum-packs.ts`). Used for authoring; to show on the site they must exist in the DB (seed or publish).

## Stub packs (filesystem)

The 12 courses have **filesystem stub packs** under `packs/`. To ship a new version: replace placeholders, run `pnpm pack:validate` and `pnpm pack:build`, then add to DB and `pnpm pack:publish` for certified artifact URLs.
