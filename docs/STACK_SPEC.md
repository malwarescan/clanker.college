# Clanker.College — Stack Spec (Locked)  
**Railway + Cloudflare — Best Architecture**

---

## Edge + DNS + Security

| Layer | Choice | Notes |
|-------|--------|-------|
| **DNS + WAF** | Cloudflare | DNS, WAF, rate limiting |
| **Cache** | Cloudflare Cache Rules | Aggressive caching on public, agent-native surfaces (MD/JSON/NDJSON endpoints) |
| **Artifacts** | Cloudflare R2 | Cert PDFs, large example bundles |

---

## Hosting + Runtime

**Railway** as primary host. Split into **3 Railway services**:

| Service | Role | Stack |
|---------|------|-------|
| **1. Web** | Next.js app + API gateway | Next.js 15 (App Router) + TypeScript, Tailwind, server-render docs/packs, read-only + auth-scoped API routes |
| **2. Grader Worker** | Background grading + certs | Node.js worker, BullMQ processors, **zero public HTTP** |
| **3. Search** | Human search | Typesense on Railway (or managed). Phase 1 fallback: Postgres full-text. |

---

## Data Layer

| Component | Choice | Notes |
|-----------|--------|------|
| **Database** | Postgres | Railway Postgres or **Neon** (best-in-class, pgvector guaranteed) |
| **ORM** | Prisma | |
| **Vector** | pgvector | Enable for future RAG/semantic; Neon supports out of the box. |

---

## Queue + Cache

| Component | Choice | Notes |
|-----------|--------|------|
| **Redis** | Railway Redis | |
| **Jobs** | BullMQ | Grading, certificate issuance, indexing. Worker consumes queues. |

---

## Auth

**Pick one:**

| Option | Pros |
|--------|------|
| **Clerk** | Best DX, easiest orgs; cleanest on Railway. **Recommended.** |
| Supabase Auth | Everything under your DB; requires separate Supabase host. |

---

## Core Platform Architecture

**DB-first canonical model + exported deterministic surfaces.**

- **Canonical truth** in Postgres: packs, versions, labs, rubrics, examples, submissions, certs.
- **Deterministic agent surfaces** (read-only, cacheable):
  - `/api/packs/[slug]/syllabus.md`
  - `/api/packs/[slug]/rubric.json`
  - `/api/packs/[slug]/examples.ndjson`
  - `/api/packs/[slug]/install.md`
- **Cloudflare** caches these so agents hit edge, not origin.

---

## Observability

| Area | Tool |
|------|------|
| Errors | Sentry |
| Analytics | PostHog or Plausible |
| Logs | Pino structured logs (Railway logs) |

---

## Repo + CI (GitHub Actions)

- Typecheck + lint
- Prisma migrate validation
- Rubric JSON schema validation
- NDJSON validation
- **Forbidden vocabulary linter** (blocks “buy course” / consumer-ed drift)
- Lighthouse CI budgets for docs/pack pages

---

## Railway Deployment (Best Practice)

- **Monorepo:** pnpm + Turborepo, or simple repo with `/apps/web` and `/apps/worker`.
- **Separate Railway services** pointed at subpaths (or single app + worker as second service).
- **Build-time env:** `WEB` vs `WORKER` to select entrypoint.
- **Migrations:** Controlled step (manual or CI gate); zero-downtime deploys.

---

## Locked “Best” Stack Summary

| Layer | Technology |
|-------|------------|
| Web | Next.js 15 + TypeScript + Tailwind + shadcn/ui |
| DB | Postgres (Neon preferred; Railway Postgres acceptable) |
| ORM | Prisma |
| Cache/Queue | Redis (Railway), BullMQ |
| Worker | Dedicated Node.js worker service (BullMQ) |
| Search | Typesense (Railway or managed) |
| Edge | Cloudflare WAF + Cache Rules + R2 |
| Auth | Clerk (recommended) |

**Net result:** Railway runs the platform; Cloudflare hardens and accelerates it; DB-first audit trail + agent-native cached deterministic endpoints.

---

# Railway Service Breakdown

## Service names and roles

| Railway Service Name | Type | Purpose |
|----------------------|------|---------|
| `clanker-web` | Web Service | Next.js app. Public HTTP. |
| `clanker-worker` | Worker | BullMQ processor. No public HTTP. |
| `clanker-search` | (Optional) | Typesense. Internal or optional public search API. |

## Environment variables (by service)

### clanker-web

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres (Neon or Railway) |
| `REDIS_URL` | Railway Redis (for session/cache if needed) |
| `CLERK_SECRET_KEY` | Clerk auth |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend |
| `NEXTAUTH_URL` / `NEXT_PUBLIC_APP_URL` | App URL for redirects |
| `R2_*` or `CLOUDFLARE_R2_*` | If web signs R2 URLs for artifacts |
| `TYPESENSE_HOST` / `TYPESENSE_API_KEY` | (Optional) Search |
| `SENTRY_DSN` | Errors |
| `POSTHOG_KEY` / `PLAUSIBLE_*` | Analytics |

### clanker-worker

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Same Postgres |
| `REDIS_URL` | Same Redis (BullMQ broker) |
| `WORKER=1` or `SERVICE=worker` | Build/startup selector |
| `CLERK_SECRET_KEY` or internal API key | If worker calls web for webhooks |
| `R2_*` | Write cert PDFs, example bundles to R2 |
| `SENTRY_DSN` | Errors |

### clanker-search (if self-hosted Typesense)

| Variable | Purpose |
|----------|---------|
| `TYPESENSE_API_KEY` | Admin key; web uses read-only key |

## Ports

| Service | Port | Notes |
|---------|------|-------|
| Web | `3000` (or Railway default) | Next.js |
| Worker | — | No HTTP server; BullMQ only |
| Typesense | `8108` | Default Typesense port if on Railway |

---

# Minimal Folder Structure

```
clanker.college/
├── apps/
│   ├── web/                    # Next.js 15
│   │   ├── app/
│   │   │   ├── (marketing)/    # home, catalog, schools
│   │   │   ├── packs/[packSlug]/
│   │   │   ├── docs/
│   │   │   ├── api/            # API route handlers
│   │   │   ├── certification/
│   │   │   ├── verify/[certId]/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── lib/
│   │   ├── prisma/             # or at root
│   │   ├── tailwind.config.ts
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── worker/                 # BullMQ worker
│       ├── src/
│       │   ├── index.ts        # start queues + processors
│       │   ├── processors/
│       │   │   ├── grade.ts
│       │   │   └── certify.ts
│       │   └── lib/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                   # (optional monorepo shared)
│   ├── db/                     # Prisma schema + client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   ├── rubric/                 # rubric JSON schema, validators
│   └── vocabulary/             # forbidden-words linter
│
├── docs/                       # Specs (this repo)
│   ├── FINAL_COMBINED_SPEC.md
│   ├── RUBRIC_FOR_THE_RUBRICS.md
│   ├── DRIFT_DETECTOR.md
│   ├── STACK_SPEC.md
│   └── packs/
│       └── design-system-architecture/
│           └── RUBRIC.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── lighthouse.yml
│
├── pnpm-workspace.yaml         # if monorepo
├── turbo.json                  # if Turborepo
└── package.json               # root scripts
```

**Simpler variant (no monorepo):** Single `apps/web` with Prisma at `web/prisma`, and `worker` as a second app in `apps/worker`; no `packages/` until needed.

---

# First 10 API Routes (Implementation Order)

Implement in this order for maximum leverage and agent-native surface.

| # | Route | Method | Purpose | Cache (Cloudflare) |
|---|-------|--------|---------|--------------------|
| 1 | `/api/packs` | GET | List all packs (slug, name, version, lastUpdated). Pagination optional. | Aggressive |
| 2 | `/api/packs/[slug]/rubric.json` | GET | Deterministic rubric for pack version. JSON. | Aggressive |
| 3 | `/api/packs/[slug]/syllabus.md` | GET | Syllabus as Markdown (or HTML with Accept). | Aggressive |
| 4 | `/api/packs/[slug]/examples.ndjson` | GET | Gold-standard examples, one JSON object per line. | Aggressive |
| 5 | `/api/packs/[slug]/install.md` | GET | Install instructions / operational directive. | Aggressive |
| 6 | `/api/packs/[slug]` or `/api/packs/[slug]/meta` | GET | Pack metadata (version, lastUpdated, outcomes, lab IDs). For agents and UI. | Aggressive |
| 7 | `/api/grade` | POST | Submit lab payload. Enqueue job; return `job_id` or 202. Auth or API key. | No cache |
| 8 | `/api/grade/[jobId]` | GET | Poll grading result. Return score, dimensions, hard_fails, changelog_delta. | No cache (or short TTL) |
| 9 | `/api/certify` | POST | Request certificate for passing submission. Enqueue; return job_id or cert URL when ready. | No cache |
| 10 | `/api/verify/[certId]` | GET | Verify certificate by ID; return validity + metadata. Public, read-only. | Aggressive |

**Notes:**

- Routes 1–6 and 10 are **read-only, deterministic**. Cloudflare Cache Rules: long TTL, cache on `GET`, purge on deploy or admin invalidation.
- Routes 7–9 are **write** (submit grade, request certify). No cache; optionally rate-limit by IP/key at Cloudflare.
- Worker consumes grade and certify jobs from BullMQ; writes results and cert PDFs (e.g. to R2); updates Postgres.

---

# Cloudflare Cache Rules (Reference)

- **Aggressive (agent-native):**  
  `URI Path` matches  
  `/api/packs/*`, `/api/verify/*`  
  → Cache eligibility: Eligible. TTL: 1 hour (or higher; invalidate on content deploy).
- **No cache:**  
  `/api/grade`, `/api/certify`  
  → Bypass cache.

---

*End of Stack Spec. Implement Web + Worker + DB first; add Typesense and Lighthouse CI in Phase 2 if needed.*
