# Stripe Checkout — Step-by-Step Setup (Live mode)

End-to-end setup so users can **purchase a pack** with **real payments** and get an **entitlement** that unlocks the Install tab. This guide uses **Stripe Live mode** (no test mode).

---

## Overview

1. **Stripe:** Create account, get keys, create a Product + Price for a pack.
2. **DB:** Insert a `Product` row linking that pack to Stripe (product ID + price ID).
3. **Env:** Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and app URL.
4. **Webhook:** Expose `/api/stripe/webhook` and register it in Stripe (or use Stripe CLI locally).
5. **Auth:** Ensure a logged-in user exists in your DB (Clerk + User sync) so checkout has `userId`.

The app already implements **POST /api/checkout** (creates session, returns URL) and **POST /api/stripe/webhook** (on `checkout.session.completed`, upserts Entitlement). You only need configuration and data.

---

## Step 1 — Stripe account and keys (live mode)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) and sign in (or create an account).
2. **Turn off Test mode** (toggle in the sidebar) so you’re in **Live mode** — real charges, real payouts.
3. Get your live secret key:
   - **Developers → API keys**
   - Copy **Secret key** (starts with `sk_live_` in Live mode).
4. Save it as `STRIPE_SECRET_KEY` in `.env` (do not commit):
   ```env
   STRIPE_SECRET_KEY=<your-secret-key-from-dashboard>
   ```

---

## Step 2 — Create a Product and Price in Stripe (live)

Each pack you want to sell needs one Stripe **Product** and one **Price** (one-time payment). Create these in **Live mode** (test mode off).

1. In Stripe: **Product catalog → Add product**.
2. **Name:** e.g. `Agent Evaluation + Regression Harness`.
3. **Description:** optional.
4. **Pricing:**
   - **One time**.
   - Set amount (e.g. $29.00 USD).
   - Click **Save product**.
5. After saving, open the product and note:
   - **Product ID** (e.g. `prod_xxxxxxxxxxxxx`).
   - **Price ID** (e.g. `price_xxxxxxxxxxxxx`). If you added one price, it’s on the product page under “Pricing”.

You’ll use these in Step 3.

---

## Set the price (payment amount) for each product

Payment for each product is the **Price** in Stripe (amount + currency). You already have products and prices linked via `stripe-products.json`; here’s how to set or change the amount for each.

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) → **Product catalog** (Live mode).
2. Open a product (e.g. “Agent Evaluation + Regression Harness”).
3. Under **Pricing**:
   - If there’s no price: click **Add another price** → choose **One time** → set **Amount** (e.g. 29.00 USD) and **Currency** → Save.
   - To change the amount: Stripe usually doesn’t allow editing an existing price. Add a **new** price with the new amount, then (optional) make the old price **inactive** so only the new one is used.
4. Repeat for every product you sell. Each product can have its own amount (e.g. $29, $49, $99).
5. If you added or changed prices:
   - Either re-export a products CSV from Stripe and run `pnpm exec tsx scripts/sync-stripe-products.ts /path/to/products.csv` (the script uses the first active price per product), then `pnpm db:seed`.
   - Or edit **`packages/db/prisma/stripe-products.json`** and set `stripePriceId` to the new **Price ID** for that pack (you can copy it from the product page in Stripe), then run `pnpm db:seed`.

The app always charges the **price ID** stored in your DB for that pack (from `stripe-products.json` → seed). So updating the amount in Stripe (new price) and then updating `stripePriceId` (or re-syncing) is all you need.

---

## Step 3 — Link each pack to its Stripe product

Your app expects one `products` row per sellable pack, with `pack_id`, `stripe_product_id`, and `stripe_price_id`.

**Recommended: config file (all packs in one place)**

1. Edit **`packages/db/prisma/stripe-products.json`**.
2. For each pack you want to sell, replace `prod_REPLACE` and `price_REPLACE` with the **Stripe Product ID** and **Price ID** from the Stripe Dashboard (Live → Product catalog). Remove or leave as `REPLACE` any pack you don’t want to sell yet (those are skipped by the seed).
3. Run the seed so the DB gets the links:
   ```bash
   pnpm db:seed
   ```
   You’ll see `Product linked: <slug> → Stripe` for each entry that has real `prod_...` and `price_...` IDs.

Example entry in `stripe-products.json`:
```json
"agent-evaluation-regression-harness": {
  "stripeProductId": "prod_xxxxxxxxxxxxx",
  "stripePriceId": "price_xxxxxxxxxxxxx"
}
```

After this, every pack listed there with real IDs has a Product: catalog and pack page will show it as **locked** (requires purchase) for users who don’t have an entitlement.

---

## Step 4 — Environment variables

In `.env` (or `.env.local`):

```env
# Stripe live (required for checkout + webhook)
STRIPE_SECRET_KEY=<your-secret-key-from-dashboard>
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx

# App URL (used in success_url / cancel_url) — must be https in production
NEXT_PUBLIC_APP_URL=https://clanker.college
# or
PUBLIC_BASE_URL=https://clanker.college
```

- **STRIPE_WEBHOOK_SECRET:** You get this in Step 5 when you create the webhook endpoint.
- Use **https** and your real domain in production (e.g. `https://clanker.college`).

---

## Step 5 — Webhook endpoint

The webhook receives `checkout.session.completed` and creates (or updates) an **Entitlement** so the user can access the Install tab.

### 5a — Local development (optional)

If you need to test webhooks locally, use Stripe CLI with **live** keys: `stripe listen --forward-to localhost:3000/api/stripe/webhook` and use the CLI’s signing secret. For live payments you’ll usually run the app in production and use the Dashboard webhook below.

### 5b — Production webhook (Stripe Dashboard, live)

1. **Developers → Webhooks → Add endpoint**.
2. **Endpoint URL:** `https://your-domain.com/api/stripe/webhook`.
3. **Events:** Select `checkout.session.completed` (or “Checkout session completed”).
4. Click **Add endpoint**.
5. Open the new endpoint and reveal **Signing secret**; put it in your production env as `STRIPE_WEBHOOK_SECRET`.

**Important:** The webhook route uses the **raw body** for signature verification. The app reads `await req.text()` and does not parse JSON first, so verification works. Do not add middleware that reads the body before the webhook handler.

---

## Step 6 — Auth: logged-in user (Clerk + User)

Checkout requires a logged-in user so the session `metadata` can store `userId` and the webhook can create an Entitlement for that user.

1. **Install Clerk:**  
   `pnpm add @clerk/nextjs` (in `apps/web`).
2. **Clerk env:**  
   In dashboard.clerk.com create an application and set:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. **Wrap the app** with Clerk’s `ClerkProvider` (see [clerk.com/docs](https://clerk.com/docs)).
4. **Sync users to your DB:**  
   When a user signs in, create or update a row in `users` with their `clerk_id` (Clerk’s user ID). Your `getUserIdFromClerk()` looks up `users.id` by `clerkId`; that `id` is the `userId` used in checkout metadata and entitlements.
5. **Sign-in link:**  
   The Install tab shows “Sign in to install” with a link to `/account` (or your sign-in page). Ensure that route exists and uses Clerk’s sign-in.

Until Clerk is wired and users exist in `users`, `getUserIdFromClerk()` returns `null` and **POST /api/checkout** returns **401 Sign in required**.

---

## Step 7 — Verify the flow

1. **Deploy the app** with live Stripe env vars and **https** app URL.
2. **Sign in** with a user that exists in `users` (with correct `clerk_id`).
3. Open a **paid** pack (one that has a `Product` row):  
   e.g. `/packs/agent-evaluation-regression-harness`.
4. Open the **Install** tab; you should see “Purchase this pack…” and a **Purchase** button.
5. Click **Purchase.**  
   The frontend calls `POST /api/checkout` and redirects to Stripe Checkout.
6. Complete payment with a **real card**. (Live mode charges real money.)
7. You’re redirected to `/packs/...?purchased=1`.
8. Open the **Install** tab again; it should show **entitled** state (install options / download links) because the webhook created an Entitlement.
9. **Verify in DB:**  
   `SELECT * FROM entitlements WHERE user_id = '...' AND pack_id = '...';` — one row, `status = 'active'`, `source = 'stripe'`.

---

## Summary checklist

| Step | What to do |
|------|------------|
| 1 | Stripe account, **Live mode**, copy **Secret key** (Live) → `STRIPE_SECRET_KEY` |
| 2 | Create Product + one-time Price in Stripe (live); note **Product ID** and **Price ID** |
| 3 | Insert `products` row: `pack_id`, `stripe_product_id`, `stripe_price_id` |
| 4 | Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL` (https in production) |
| 5 | Webhook: add live endpoint in Stripe Dashboard → your `/api/stripe/webhook`; set `STRIPE_WEBHOOK_SECRET` |
| 6 | Clerk + User sync so checkout has `userId`; sign-in link on Install tab |
| 7 | Verify: sign in → paid pack → Purchase → real payment → return to pack → Install tab shows install options |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 401 “Sign in required” on checkout | User not in `users` or Clerk not returning auth; check `getUserIdFromClerk()`. |
| 404 “Pack or product not found” | Pack has no `Product` row; do Step 3. |
| 400 “Stripe price not configured” | `products.stripe_price_id` is null or wrong. |
| Webhook “Invalid signature” | Use the **signing secret** from Stripe (CLI or Dashboard), not the API key. Ensure webhook receives raw body. |
| Install tab still “Purchase” after payment | Webhook may have failed or not been called; check Stripe Dashboard → Webhooks → event logs. Confirm `metadata.userId` and `metadata.packId` match your `users.id` and `packs.id`. |
