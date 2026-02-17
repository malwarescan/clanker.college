# Clanker.College — Deployment Runbook  
**Railway + Cloudflare**

**Canonical deploy instructions (env, release order, gate):** see **`docs/DEPLOY_AND_LOCK.md`**. Use this runbook for reference (services, commands, smoke test).

## Railway services

| Service | Repo path | Purpose |
|--------|-----------|---------|
| **clanker-web** | `apps/web` | Next.js app. Public HTTP. |
| **clanker-grader-worker** | `apps/grader-worker` | BullMQ worker. No public HTTP. |
| **clanker-postgres** | — | Postgres (Railway or Neon). |
| **clanker-redis** | — | Redis (Railway). |

## Required env vars

### clanker-web
- `DATABASE_URL` — Postgres connection string
- `REDIS_URL` — Redis connection string (for queue)
- `NEXT_PUBLIC_APP_URL` — e.g. `https://clanker.college`
- `CERT_PRIVATE_KEY` — **Required in production.** PEM Ed25519 private key for certificate signing. In production, `/api/certify` returns 503 "Signing not configured." if unset. In development, hash fallback is allowed.
- `CERT_SECRET` — (optional) Used only for dev hash fallback when Ed25519 not set

### clanker-grader-worker
- `DATABASE_URL` — Same Postgres
- `REDIS_URL` — Same Redis
- `WORKER=1` — (optional) signal that this is the worker

## Build and start commands

### clanker-web
- **Build:** `pnpm install && pnpm db:generate && pnpm --filter @clanker/web build`
- **Start:** `pnpm --filter @clanker/web start` (or `next start` from `apps/web`)

### clanker-grader-worker
- **Build:** `pnpm install && pnpm db:generate && pnpm --filter @clanker/grader-worker build`
- **Start:** `node apps/grader-worker/dist/index.js` (or `pnpm --filter @clanker/grader-worker start`)

## Prisma migrate order

1. Provision Postgres and set `DATABASE_URL`.
2. From repo root (with `DATABASE_URL` set):
   - `pnpm db:generate`
   - `pnpm db:migrate`
3. Seed the first pack (once): `pnpm db:seed`

## Redis and worker startup

- Start Redis (Railway Redis or external). Set `REDIS_URL` on both web and worker.
- Start **web** first, then **worker**. Worker connects to Redis and processes the `grade` queue.
- Worker logs a heartbeat every 5 minutes. Failed jobs (after 3 attempts with exponential backoff) mark the submission as `failed`.

## Cloudflare cache rule config

**Rule order:** Bypass first, then cache. See `docs/CLOUDFLARE_CACHE_RULES.md` and `docs/DEPLOY_AND_LOCK.md` for full steps. Do not cache HTML until correctness is confirmed.

---

## Final deploy gate checklist (must pass)

Before marking deploy complete:

- [ ] **qa:pack passes locally** — `pnpm qa:pack` (vocab + Playwright smoke + pack validator).
- [ ] **Runbook smoke test** — After deploy, run all curl checks in "Smoke test checklist" above.
- [ ] **304 on rubric** — `curl -sI -H "If-None-Match: \"<etag>\"" "$BASE/api/packs/design-systems/rubric"` returns 304 when ETag matches (use ETag from a first GET).
- [ ] **Certify refuses in prod without Ed25519** — With `NODE_ENV=production` and no `CERT_PRIVATE_KEY`, `POST /api/certify` returns 503 and body `{"error":"Signing not configured."}`.
- [ ] **Grade/verify no-store** — Responses from `/api/grade`, `/api/grade/*`, `/api/certify`, `/api/verify/*` include `Cache-Control: no-store, private`, `Pragma: no-cache`, `Vary: Authorization`.
- [ ] **Manual rubric audit** — Run RUBRIC_FOR_THE_RUBRICS on `/packs/design-systems`: score ≥ 85, zero hard-fails.

## Smoke test checklist (post-deploy)

Run against your deployed base URL (e.g. `https://clanker.college`).

```bash
BASE=https://clanker.college

# Health
curl -s "$BASE/api/health" | jq .

# Surfaces
curl -s "$BASE/api/packs" | jq 'length'
curl -s "$BASE/api/packs/design-systems/rubric" | jq 'keys'
curl -sI "$BASE/api/packs/design-systems/syllabus" | grep -E "Cache-Control|ETag|200|304"

# Grading (replace with real submission_id and cert_id after one run)
curl -s -X POST "$BASE/api/grade" -H "Content-Type: application/json" -d '{"pack_id":"design-systems","lab_id":"token-table-01","payload":{"output_text":"spacing 8pt tokens"}}' | jq .
# GET /api/grade/{submission_id} until status=graded
curl -s "$BASE/api/grade/SUBMISSION_ID" | jq .

# Certify (after a PASS)
curl -s -X POST "$BASE/api/certify" -H "Content-Type: application/json" -d '{"submission_id":"SUBMISSION_ID"}' | jq .
# Verify
curl -s "$BASE/api/verify/CERT_ID" | jq .
curl -s "$BASE/verify/CERT_ID"  # HTML page
```

## Checklist

- [ ] `GET /api/health` returns 200
- [ ] `GET /api/packs` returns array
- [ ] `GET /api/packs/design-systems/rubric` returns JSON with dimensions
- [ ] Agent surfaces return `Cache-Control` and `ETag`
- [ ] `POST /api/grade` returns `submission_id`
- [ ] After worker runs, `GET /api/grade/{id}` returns `result`, `score_by_dimension`, `hard_fails` (array of `{ dimension_id, code, message }`)
- [ ] `POST /api/certify` returns `cert_id`, `verify_url`
- [ ] `GET /api/verify/{certId}` returns certificate and `verification_status`
- [ ] `GET /api/verify/public-key` returns 200 with PEM when `CERT_PRIVATE_KEY` is set (or 503 with message)
