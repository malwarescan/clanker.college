# QA: Account + subscription flow

Acceptance checklist for auth, subscription, and gated install.

## Auth & redirect

- [ ] Signed-out user visits `/packs/[slug]` Install tab → sees "Sign in to install" → link goes to `/account?returnTo=/packs/[slug]#panel-install`.
- [ ] User signs in (Google or magic link) → lands on `returnTo` URL when present, otherwise `/catalog`.
- [ ] New user (first login) → a row is created in `users` with `clerk_id` and email when available.

## Catalog & pack

- [ ] Catalog shows "Certified vX.Y.Z" on each pack card.
- [ ] Locked pack (no subscription, no per-pack purchase) shows badge "Locked" and CTA "Start subscription".
- [ ] Entitled user (active subscription or per-pack entitlement) sees "View" and "Install" on pack cards.
- [ ] Pack page Install tab: signed out → "Sign in to install"; signed in locked → "Start subscription"; entitled → install options + download links.

## Gated install API

- [ ] `GET /api/packs/[slug]/install` without auth → 403 with `ENTITLEMENT_REQUIRED`.
- [ ] Signed-in user without entitlement → 403 with `ENTITLEMENT_REQUIRED`, `plan: "individual"`.
- [ ] Entitled user → 200 with `zipUrl`, `pluginZipUrl`, `openclawConfigSnippet`, `installInstructions`.

## Billing & subscription

- [ ] After Stripe subscription purchase, webhook runs → `subscriptions` row created/updated (or `entitlements` for one-time pack).
- [ ] User refreshes catalog → packs unlock (entitled).
- [ ] `/account` signed-in: Subscription section shows "Active — individual monthly" (or similar) and "Manage billing" → opens Stripe Customer Portal.
- [ ] `/account` signed-in, no subscription: "No active subscription" and "Start subscription" → calls `POST /api/billing/checkout` with `{ plan: "individual_monthly" }` → redirects to Stripe Checkout.

## Account UI

- [ ] `/account` signed out → single AuthCard: "Sign in to Clanker.College", Google + magic link, no passwords.
- [ ] `/account` signed in → three sections: Subscription, Installs (copy blocks), Certificates (table: Date | Pack | Version | Score | Verify).

## Environment

- Clerk: Google OAuth + Email (magic link) enabled in dashboard; `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`; subscription prices: `STRIPE_PRICE_INDIVIDUAL_MONTHLY`, `STRIPE_PRICE_INDIVIDUAL_ANNUAL`.
- Webhook URL in Stripe dashboard: `https://<host>/api/stripe/webhook`; subscribe to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
