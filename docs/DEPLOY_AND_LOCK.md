# Deploy + Lock — Final instructions for the team

**Status:** Deploy-grade. Follow exactly before and after first production deploy.

---

## 1. Production env requirements (Railway)

Set these **before** first production deploy. Do not go live without them.

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `CERT_PRIVATE_KEY` | **Yes (prod)** | Ed25519 PEM. Cert issuance returns 503 if missing in production. |
| `NEXT_PUBLIC_APP_URL` or `PUBLIC_BASE_URL` | Yes | Used for `verify_url` and links (app uses `NEXT_PUBLIC_APP_URL`). |
| `CLERK_*` | As applicable | When Clerk auth is enabled |
| `CERT_PUBLIC_KEY` | Optional | Only if your verifier expects it; app derives public key from private and serves it at `GET /api/verify/public-key`. |

Do not deploy production without `CERT_PRIVATE_KEY` set.

---

## 2. Railway release order

1. **Run Prisma migrations** in the web service release step (or a one-off Railway job) **before** routing traffic.
   - `pnpm db:generate && pnpm db:migrate`
2. **Bring up web service.** Wait until healthy (e.g. `GET /api/health` returns 200).
3. **Bring up worker service** after web is healthy so enqueue endpoints don’t pile up without workers.

---

## 3. Cloudflare rules

**Rule order matters.** Apply in this order:

1. **Bypass cache first**
   - Paths: `/api/grade*`, `/api/certify*`, `/api/verify*`
   - Action: Bypass cache.

2. **Cache deterministic surfaces only**
   - Paths: `/api/packs*` — and explicitly the markdown/JSON/NDJSON endpoints:
     - `/api/packs/*/syllabus`
     - `/api/packs/*/rubric`
     - `/api/packs/*/examples`
     - `/api/packs/*/install`
     - `/api/packs/*/latest`
   - Action: Cache eligible; respect origin `Cache-Control` and `ETag`.

**Do not cache HTML pages** until correctness is confirmed.

See `docs/CLOUDFLARE_CACHE_RULES.md` for full reference.

---

## 4. Final deploy gate (must run, no exceptions)

Run these against the **Railway production URL**. All must pass.

**A) Health**  
- `GET /api/health` → 200

**B) Surfaces + caching**  
- `GET /api/packs` → 200  
- `GET /api/packs/design-systems/rubric` → 200 with `ETag` header  
- Repeat request with `If-None-Match: "<etag>"` → 304

**C) No-store verification**  
- HEAD or GET any of `/api/grade`, `/api/grade/*`, `/api/certify`, `/api/verify*`  
- Response headers must include:  
  - `Cache-Control: no-store, private`  
  - `Pragma: no-cache`  
  - `Vary: Authorization`

**D) Cert signing enforcement**  
- In a **non-prod** environment, with `CERT_PRIVATE_KEY` unset and `NODE_ENV=production`:  
  - `POST /api/certify` → 503, body `{"error":"Signing not configured."}`  
- In production this must never occur because the key is set. Do not deploy without it.

**E) End-to-end**  
- `POST /api/grade` → get `submission_id`  
- `GET /api/grade/[id]` → eventually `status: "graded"`  
- `POST /api/certify` → `cert_id` + `verify_url`  
- `GET /verify/[certId]` loads and shows verification status

---

## 5. One last product-level QA (human)

- Run **`docs/RUBRIC_FOR_THE_RUBRICS.md`** against `/packs/design-systems` on production.  
- Run **DRIFT_DETECTOR** scan visually (desktop + mobile).  

If either fails, fix immediately before adding features.

---

## Phase 1.2 kickoff (greenlight)

Start in this order:

1. Real search (index + `/api/search` + then UI)  
2. Pack version selector + pin vs track latest  
3. Verify page UX (status badge, public key link, signed payload viewer)  
4. Strict `submission_schema_json` enforcement  
5. Second pack seed (different school)

See `docs/PHASE_1_2_SPEC.md` for details.
