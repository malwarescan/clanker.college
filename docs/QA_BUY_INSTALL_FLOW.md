# QA: User Buy / Install Flow

Manual and automated checks for **purchase → entitlement → install** (and free-pack install).

---

## Prerequisites

| Dependency | Purpose |
|------------|--------|
| **Clerk** | `getUserIdFromClerk()` resolves user; without it everyone is "signed out" for gating. |
| **User sync** | Clerk user must exist in `users` with `clerk_id` so checkout and entitlements can use internal `userId`. |
| **Stripe** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`; create Products/Prices in Stripe dashboard (test mode). |
| **Product rows** | Packs that require purchase need a `products` row: `pack_id`, `stripe_product_id`, `stripe_price_id`. |
| **Webhook** | Stripe webhook URL → `POST /api/stripe/webhook`; event `checkout.session.completed` creates Entitlement. |

**Current seed:** All packs are **free** (no `Product` rows). To QA paid flow you must add a Product and (optionally) Stripe test price.

---

## Install states (pack page → Install tab)

| State | When | UI |
|-------|------|-----|
| **signed_out** | No Clerk user (or user not in `users`) | "Sign in to install" + link to `/account` |
| **locked** | Signed in + pack has Product + no active Entitlement | "Purchase this pack…" + **Purchase** button |
| **entitled** | Signed in + (pack has no Product, or user has active Entitlement) | Install cards: Claude Skills ZIP, Claude Plugin (if URL), OpenClaw snippet |

---

## Manual QA checklist

### A. Free pack (no Product) — no auth required

- [ ] **Catalog:** Pack shows "View pack" and "Install" (no "Locked" / "Purchase").
- [ ] **Pack page:** Install tab shows install options (Claude Skills, OpenClaw); no "Sign in" or "Purchase".
- [ ] **GET /api/packs/[slug]/install** (no auth): returns 200 with `zipUrl`, `installInstructions`, `openclawConfigSnippet`.
- [ ] If `artifactZipUrl` is null: panel shows "ZIP not yet published." and no download link.

### B. Paid pack (with Product) — signed out

- [ ] **Catalog:** Pack shows "Locked" badge and "Purchase" CTA.
- [ ] **Pack page:** Install tab shows "Sign in to install" and link to `/account`.
- [ ] **GET /api/packs/[slug]/install** (no cookie): returns **403** with `error: "ENTITLEMENT_REQUIRED"`, `packSlug`, `packName`, `stripePriceId`.

### C. Paid pack — signed in, not entitled

- [ ] **Pack page:** Install tab shows "Purchase this pack…" and **Purchase** button.
- [ ] **POST /api/checkout** with `{ "packSlug": "…" }` and auth cookie: returns **200** with `{ "url": "https://checkout.stripe.com/…" }`.
- [ ] **POST /api/checkout** without auth: returns **401** "Sign in required".
- [ ] **GET /api/packs/[slug]/install** with auth but no entitlement: returns **403** ENTITLEMENT_REQUIRED.

### D. Paid pack — purchase and entitlement

- [ ] Click **Purchase** → redirects to Stripe Checkout; complete payment (test card `4242 4242 4242 4242`).
- [ ] Success URL: `/packs/[slug]?purchased=1` — pack page loads.
- [ ] Install tab now shows **entitled** state: install cards and (if published) ZIP / plugin links.
- [ ] **GET /api/packs/[slug]/install** with same user's auth: returns **200** with URLs and instructions.
- [ ] **Idempotency:** Second webhook for same session does not duplicate entitlement (or upsert is safe).

### E. Catalog

- [ ] Free packs: "Certified vX.Y.Z", no Locked; CTAs "View pack" + "Install".
- [ ] Paid packs, not entitled: "Locked" badge; CTA "Purchase" (links to pack page).
- [ ] Paid packs, entitled: no Locked; "View pack" + "Install".

---

## Dev shortcuts (no Stripe)

To test **entitled** state for a paid pack without going through Stripe:

1. **Create a User** (if Clerk not syncing):
   ```sql
   INSERT INTO users (id, clerk_id, created_at, updated_at)
   VALUES ('user-qa-1', 'clerk_test_qa_1', NOW(), NOW());
   ```
2. **Create a Product** for a pack (use real Stripe test IDs or placeholders for UI-only QA):
   ```sql
   INSERT INTO products (id, stripe_product_id, stripe_price_id, pack_id)
   SELECT gen_random_uuid(), 'prod_placeholder', 'price_placeholder', id
   FROM packs WHERE slug = 'agent-evaluation-regression-harness' LIMIT 1;
   ```
3. **Grant entitlement**:
   ```sql
   INSERT INTO entitlements (id, user_id, pack_id, status, source, created_at, updated_at)
   SELECT gen_random_uuid(), 'user-qa-1', p.id, 'active', 'admin', NOW(), NOW()
   FROM packs p WHERE p.slug = 'agent-evaluation-regression-harness' LIMIT 1
   ON CONFLICT (user_id, pack_id) DO NOTHING;
   ```
4. Sign in as the Clerk user that maps to `clerk_test_qa_1` and open the pack → Install tab should show install options.

(Use your actual `users.id` and `packs.id` if different.)

---

## E2E (Playwright)

- **e2e/buy-install.spec.ts** covers:
  - Free pack: Install tab shows install panel (Claude Skills, OpenClaw) and does not show "Sign in" or "Purchase".
  - Install API: unauthenticated GET /api/packs/design-systems/install returns 200 (design-systems has no Product).
  - Catalog: has pack cards with "Certified" and links to pack and install.

Run: `pnpm exec playwright test e2e/buy-install` (with app running or via `pnpm qa:pack:smoke` which starts dev server).  
**First time:** run `pnpm exec playwright install` to download browsers.

---

## Common failures

| Symptom | Check |
|--------|--------|
| All users see "Sign in to install" for every pack | Clerk not installed or User not in DB for that Clerk ID. |
| Purchase button does nothing / 401 | Request missing auth cookie; or Clerk not returning user. |
| 404 on checkout | Pack has no `Product` row; add one for that pack. |
| 403 on /install after purchase | Webhook not received or failed; or metadata (userId/packId) wrong; or User table uses different id. |
| ZIP link missing in install panel | PackVersion has no `artifact_zip_url`; run `pnpm pack:publish` for that pack or set in DB. |
