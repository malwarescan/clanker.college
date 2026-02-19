# Clerk production deployment (Railways + Cloudflare)

Follow these steps to run Clerk in production with **Clerk Hosted Pages** on **accounts.clanker.college**. Sign-in sends users there, then they return to **clanker.college/account**. **Host:** Railways. **DNS:** Cloudflare.

---

## 1. Create Clerk production instance

- In [Clerk Dashboard](https://dashboard.clerk.com), create a **production** instance (or promote dev to production).
- **Reconfigure** (they don’t copy from dev):
  - **Social connections** (e.g. Google)
  - **Paths** (see step 5)
  - **Webhooks** (if you use them)

---

## 2. Set production env vars in Railways (then redeploy)

In **Railways** → your project → **Variables** (or Service → Variables), set:

| Variable | Value | Notes |
|----------|--------|--------|
| `NEXT_PUBLIC_CLERK_ENABLED` | `true` | So the app uses Clerk. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_…` | From Clerk Dashboard → API Keys. |
| `CLERK_SECRET_KEY` | `sk_live_…` | From same page; keep secret. |
| `NEXT_PUBLIC_CLERK_ACCOUNT_PORTAL_URL` | `https://accounts.clanker.college` | Hosted Pages; Sign in links go here. |
| `NEXT_PUBLIC_APP_URL` | `https://clanker.college` | Origin for redirect_url after sign-in. |
| `CLERK_WEBHOOK_SECRET` | `whsec_…` | Only if using webhooks. |

- **Local dev:** keep using `pk_test_` / `sk_test_` in `.env.local`; leave `NEXT_PUBLIC_CLERK_ACCOUNT_PORTAL_URL` unset to use in-app sign-in on `/account`.
- **Redeploy** the service in Railways after changing env vars.

---

## 3. Google OAuth (production)

1. **Clerk** → Configure → Social connections → **Google**:
   - Enable for sign-up and sign-in.
   - Use **custom credentials** (not Clerk’s shared ones in prod).
2. **Google Cloud Console**:
   - Create an **OAuth 2.0 Client ID** (Web application).
   - **Authorized redirect URIs:** add the URI Clerk shows (e.g. `https://clerk.clanker.college/v1/oauth_callback` or your instance’s domain) **exactly**.
3. Paste **Client ID** and **Client secret** into Clerk’s Google connection.

---

## 4. Domains + DNS (Cloudflare)

1. **App domain (Railways):** In Cloudflare, point **clanker.college** (and www if you use it) to your Railways app.
2. **Clerk** → Configure → **Domains** (must match exactly):
   - **Frontend API:** `clerk.clanker.college`
   - **Account portal:** `accounts.clanker.college`
   - Add the DNS records Clerk shows (CNAMEs for both).
3. **Cloudflare:** Add Clerk’s records. For **Clerk’s records only**, set proxy to **DNS only** (grey cloud ☁️), not proxied. Your main site can stay proxied.

---

## 5. Paths (Clerk Dashboard)

Clerk Dashboard → **Developers** → **Paths**. Set (use full URLs if Clerk accepts them):

| Setting | Value |
|--------|--------|
| Sign-in URL | `https://accounts.clanker.college/sign-in` (or path-only `/sign-in`) |
| Sign-up URL | `https://accounts.clanker.college/sign-up` (or `/sign-up`) |
| After sign-in URL | `https://clanker.college/account` |
| After sign-up URL | `https://clanker.college/account` |

The app sends users to the hosted portal with `redirect_url` so they return to the requested page (e.g. `/account` or `/packs/slug#panel-install`).

---

## 6. authorizedParties (security) — already in code

In `apps/web/middleware.ts` the app already sets:

```ts
authorizedParties: [
  "https://clanker.college",
  "https://accounts.clanker.college",
  "http://localhost:3000",
]
```

Add `https://www.clanker.college` only if you use www.

---

## 7. Deploy certificates in Clerk

- In Clerk → Domains, after DNS is correct and checks pass, click **Deploy certificates**.

---

## 8. QA checklist

Before closing out:

- [ ] **Sign In** in nav goes to **accounts.clanker.college/sign-in**.
- [ ] Sign-in completes and user returns to **clanker.college/account** (session cookie shared under clanker.college).
- [ ] Refresh **clanker.college/account** stays signed in.
- [ ] **returnTo:** open `/account?returnTo=/packs/design-systems#panel-install`, get redirected to hosted sign-in, then after sign-in land on that URL (or /account with returnTo handled).
- [ ] **Signed-in /account:** shows 3 cards (Subscription, Installs, Certificates); no “coming soon,” no huge footer.
- [ ] Sign out works (UserButton → Sign out → home or as configured).
- [ ] **Local dev** (without `NEXT_PUBLIC_CLERK_ACCOUNT_PORTAL_URL`) still uses in-app sign-in on `/account` with `pk_test_` / `sk_test_`.

---

## Env reference (summary)

**Production (Railways, Hosted Pages):**

- `NEXT_PUBLIC_CLERK_ENABLED=true`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_…`
- `CLERK_SECRET_KEY=sk_live_…`
- `NEXT_PUBLIC_CLERK_ACCOUNT_PORTAL_URL=https://accounts.clanker.college`
- `NEXT_PUBLIC_APP_URL=https://clanker.college`
- `CLERK_WEBHOOK_SECRET=…` (optional)

**Local:**

- `NEXT_PUBLIC_CLERK_ENABLED=true`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…`
- `CLERK_SECRET_KEY=sk_test_…`

See `.env.example` for the full list.
