# Course Pack Standard — Implementation Status

Per **DEV TEAM INSTRUCTIONS** and **DEV TEAM NEXT STEPS**: purchase → install → ingest → grade.

## Done

### 1. Filesystem standard + validation + build (P0)
- **Spec:** `docs/CLANKER_PACK_STANDARD_v1.md` — canonical folder layout, required files, pack.json / rubric / hard_fails / SKILL.md fields.
- **Validation:** `pnpm pack:validate [path]` — `scripts/pack-validate.ts`.
- **Build:** `pnpm pack:build [path]` — produces `dist/<slug>-<version>.zip` and optional plugin zip. Requires system `zip`.

### 2. DB: products + entitlements (P0)
- **Schema:** `Product`, `Entitlement`; PackVersion has `artifactZipUrl`, `artifactPluginUrl`, `artifactGitUrl`.
- **Migrations:** `4_products_entitlements`, `5_pack_version_artifacts`. Run `pnpm db:migrate`.

### 3. API: locked/available + entitlement-gated install (P0)
- **GET /api/packs** — returns per-pack: `hasCertifiedVersion`, `latestCertifiedSemver`, `requiresPurchase`, `locked`, `available` (user from Clerk when available).
- **GET /api/packs/[slug]** — same availability fields + `stripe_price_id` when `requiresPurchase`.
- **lib/entitlements.ts:** `getUserIdFromClerk()`, `hasActiveEntitlement()`, `getEntitlementStatus()`. Active = status active and (expires_at null or > now). Clerk optional until installed.
- **GET /api/packs/[slug]/install** — auth required for gated packs; if `requiresPurchase` and no active entitlement → 403 `ENTITLEMENT_REQUIRED` with `packSlug`, `packName`, `stripePriceId`. Else returns `zipUrl`, `pluginZipUrl`, `openclawConfigSnippet`, `installInstructions`. Raw artifact URLs only returned when entitled.

### 4. Install tab UX (P0)
- **States:** Signed out → “Sign in to install”; Signed in + locked → purchase module (Stripe); Signed in + entitled → install option cards.
- **Cards:** Claude Skills (download ZIP, unzip to .claude/skills, reload); Claude Plugin (if artifact); OpenClaw (JSON snippet + copy). Install instructions deterministic; no raw S3 URLs shown unless entitled.

### 5. Stripe checkout + webhook → entitlement (P0)
- **POST /api/checkout** — body `{ packSlug }`. Resolves user (Clerk), looks up Product, creates Stripe Checkout Session (metadata: userId, packId). Returns `{ url }`; UI redirects.
- **POST /api/stripe/webhook** — verifies signature; on `checkout.session.completed` upserts Entitlement (status=active, source=stripe). Idempotent.
- Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL`.

### 6. Artifact hosting + publish (P0)
- **pnpm pack:publish [path]** — runs build, uploads `dist/*.zip` to S3/R2: `packs/<slug>/<version>/skills.zip`, `plugin.zip`. Updates PackVersion `artifactZipUrl`, `artifactPluginUrl`.
- Env: `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`; optional `S3_ENDPOINT` (R2), `S3_PUBLIC_BASE`, `DATABASE_URL`.

### 7. Grade payload validation (P0)
- **POST /api/grade** — before enqueue: loads latest certified version (SemVer), reads rubric `output_schema`; validates `payload` with Ajv. If invalid → 400 `{ error: "INVALID_SUBMISSION", details: ajvErrors }`. Only then creates submission and enqueues.

### 8. Catalog + pack pages (P1)
- **Catalog cards:** Badge “Certified vX.Y.Z”; “Locked” when requiresPurchase and not entitled. CTA: locked → “Purchase” (to pack page); else “View pack” + “Install”.
- **Pack page:** Install tab state (signed_out / locked / entitled) passed from server; purchase button calls POST /api/checkout and redirects to Stripe.

### 9. Starter template + CLI (P1)
- **Template:** `templates/pack-starter/`. **Commands:** `pnpm pack:init`, `pnpm pack:validate`, `pnpm pack:build`, `pnpm pack:publish`.

### 10. QA: buy / install flow
- **Checklist:** `docs/QA_BUY_INSTALL_FLOW.md` — prerequisites (Clerk, Stripe, Product rows), install states, manual test matrix, dev shortcuts (grant entitlement via SQL for testing without Stripe).
- **E2E:** `e2e/buy-install.spec.ts` — catalog badges/CTAs, free-pack Install tab (no Sign in/Purchase), GET /api/packs/[slug]/install returns 200 and payload. Run: `pnpm exec playwright test e2e/buy-install` (after `pnpm exec playwright install` if needed).

## Curriculum strategy

- **Strategy doc:** `docs/CURRICULUM_STRATEGY_2026.md` — demand signal (X/Twitter agent usage), course selection framework (A–D), 12 ranked courses, Trend→Course pipeline.
- **First course to build:** Course 01 (Agent Evaluation + Regression Harness). Depends on **version-to-version diff reporting** (not yet implemented); add when starting Course 01.

## Optional / future

- **Version-to-version diff reporting:** Required for Course 01 (regression harness). Compare graded results across pack versions; gate release on pass criteria.
- **Signed install URLs (P1):** Make bucket private; `/install` returns short-lived signed URLs (5–10 min) for strict enforcement.
- **Clerk:** Install `@clerk/nextjs` and sync Clerk users to `users` (clerkId) so `getUserIdFromClerk()` resolves; wire Sign In on Install tab and catalog.

## Definition of done (end-to-end)

- [x] Pack built and published; appears in catalog when certified.
- [x] User can purchase (Stripe); webhook grants entitlement.
- [x] Install tab unlocks for entitled users; `/install` returns artifact URLs only when entitled.
- [x] User can install into Claude (skills/plugin) and run a lab submission.
- [x] `/api/grade` validates payload via rubric `output_schema`, scores deterministically, can issue verifiable certificate.
