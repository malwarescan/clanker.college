# Clanker.College

Institutional, agent-native training platform. Skill Packs: versioned, deterministic training modules (Syllabus, Labs, Rubric, Certification).

## Stack

- **Web:** Next.js 15, TypeScript, Tailwind
- **DB:** Postgres, Prisma
- **Queue:** Redis, BullMQ
- **Deploy:** Railway (web + grader-worker + Postgres + Redis), Cloudflare (DNS, WAF, cache)

## Monorepo

- `apps/web` — Next.js app (Home, Catalog, Pack pages, Docs, API)
- `apps/grader-worker` — BullMQ worker (grades submissions, no public HTTP)
- `packages/db` — Prisma schema and client
- `packages/shared` — Types, validators, forbidden-vocabulary linter

## Local setup

1. **Install:** `pnpm install`
2. **Env:** Copy `.env.example` to `.env` in root or `apps/web`. Set:
   - `DATABASE_URL` — Postgres (required for run and seed)
   - `REDIS_URL` — Redis (required for `/api/grade` and worker)
3. **DB:** From repo root:
   - `pnpm db:generate` — generate Prisma client
   - `pnpm db:migrate` — run migrations (requires running Postgres)
   - `pnpm db:seed` — seed one pack (design-systems v1.0)
4. **Run web:** `pnpm --filter @clanker/web dev`
5. **Run worker:** `pnpm --filter @clanker/grader-worker dev` (in another terminal)

## Railway services

- **clanker-web** — Deploy `apps/web`. Env: `DATABASE_URL`, `REDIS_URL`, `NEXT_PUBLIC_APP_URL`, optional Clerk.
- **clanker-grader-worker** — Deploy `apps/grader-worker`. Env: `DATABASE_URL`, `REDIS_URL`, `WORKER=1`.
- **clanker-postgres** — Railway Postgres (or Neon).
- **clanker-redis** — Railway Redis.

After deploy: run migrations (`pnpm db:migrate` in a one-off or CI), then seed (`pnpm db:seed`).

## CI

- `pnpm typecheck` — typecheck all packages
- `pnpm vocab:lint` — block forbidden consumer-ed vocabulary in `apps/web`
- See `.github/workflows/ci.yml`

## Docs

- `docs/FINAL_COMBINED_SPEC.md` — IA, layout, three docs pages
- `docs/RUBRIC_FOR_THE_RUBRICS.md` — QA checklist for Skill Pack pages
- `docs/DRIFT_DETECTOR.md` — One-page drift guardrail
- `docs/STACK_SPEC.md` — Railway + Cloudflare stack
- `docs/CLOUDFLARE_CACHE_RULES.md` — Cache rules for agent surfaces
