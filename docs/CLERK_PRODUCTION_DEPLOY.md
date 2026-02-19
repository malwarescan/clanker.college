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

In **Railways** → your project → **Variables** (or Service → Variables), set **all** of these for production (satellite fix):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_CLERK_ENABLED` | `true` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_…` |
| `CLERK_SECRET_KEY` | `sk_live_…` |
| `NEXT_PUBLIC_APP_URL` | `https://clanker.college` |
| `NEXT_PUBLIC_CLERK_ACCOUNT_PORTAL_URL` | `https://accounts.clanker.college` |
| `NEXT_PUBLIC_CLERK_DOMAIN` | `accounts.clanker.college` |
| `NEXT_PUBLIC_CLERK_IS_SATELLITE` | `true` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `https://accounts.clanker.college/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `https://accounts.clanker.college/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `https://clanker.college/account` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `https://clanker.college/account` |
| `CLERK_WEBHOOK_SECRET` | `whsec_…` (optional) |

- **Local dev:** use `pk_test_` / `sk_test_`; leave `NEXT_PUBLIC_CLERK_DOMAIN`, `NEXT_PUBLIC_CLERK_IS_SATELLITE`, and the sign-in/up/after URLs unset for in-app sign-in on `/account`.
- **Redeploy** after changing env vars.

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
2. **Clerk** → Configure → **Domains**. Confirm these are **Verified**:
   - **Frontend API:** `clerk.clanker.college`
   - **Account portal:** `accounts.clanker.college`
   - Any **clkmx** / **clkdns** (email + domainkey) records Clerk shows.
3. **Cloudflare:** Add Clerk’s records. For **Clerk-related CNAMEs** use **DNS only** (grey cloud ☁️), not proxied.
4. **Clerk** → Configure → **Account Portal** → **Redirects**:
   - **After sign-up fallback:** `https://clanker.college/account`
   - **After sign-in fallback:** `https://clanker.college/account`
   - **After logo click:** `https://clanker.college/`

---

## 5. Paths (Clerk Dashboard)

Clerk Dashboard → **Configure** → **Paths** (or Developers → Paths):

- **Component paths:** keep sign-in/sign-up on **Account Portal** (accounts.clanker.college). No in-app sign-in needed.
- Set: Sign-in URL = `https://accounts.clanker.college/sign-in`, Sign-up = `https://accounts.clanker.college/sign-up`, After sign-in/up = `https://clanker.college/account`.

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

## Code (already done)

- **ClerkProvider** in `app/layout.tsx`: passes `domain`, `isSatellite`, `signInUrl`, `signUpUrl`, `afterSignInUrl`, `afterSignUpUrl` from env so **clanker.college** is a satellite of **accounts.clanker.college**.
- **Middleware:** always returns `NextResponse.next()` in the callback; `/account` protected when using hosted portal; `authorizedParties` includes both origins.
- **/account:** wrapped in `<AccountGate>` (SignedIn → dashboard, SignedOut → “Redirecting…”).

---

## Fix: Redirect loop (sign-in page keeps reloading)

**Symptom:** You go to `accounts.clanker.college/sign-in?redirect_url=...`, and the page loops or keeps reloading. After sign-in you are sent to `clanker.college/account` but then immediately sent back to sign-in.

**Cause:** The session cookie is not shared between `accounts.clanker.college` and `clanker.college`. Clerk sets the cookie on the account portal subdomain; when you land on `clanker.college/account`, the browser does not send that cookie (different origin), so the app thinks you’re signed out and redirects to sign-in again → loop.

**Fix:** Set **Railway env vars** (section 2) so `NEXT_PUBLIC_CLERK_DOMAIN=accounts.clanker.college` and `NEXT_PUBLIC_CLERK_IS_SATELLITE=true`. The app then runs as a Clerk **satellite** and trusts the session from accounts.clanker.college.

**If it still loops (Clerk Dashboard):**

1. **Root domain**  
   In Clerk → **Configure** → **Domains**, ensure the **root / primary domain** is set to **clanker.college** (the apex), not only the subdomains. Clerk uses this to set the session cookie on `.clanker.college` so it’s sent to both `clanker.college` and `accounts.clanker.college`.

2. **Domain list**  
   You should have something like:
   - **Frontend API:** `clerk.clanker.college`
   - **Account portal:** `accounts.clanker.college`  
   And the **home / application** domain should be **clanker.college** if Clerk has a separate “Home URL” or “Primary domain” field.

3. **DNS**  
   All Clerk domains must resolve (CNAMEs in Cloudflare, **DNS only** for Clerk records). Then **Deploy certificates** again.

4. **Re-test**  
   Clear site data for `clanker.college` and `accounts.clanker.college` (or use an incognito window), then sign in again. After sign-in you should land on `clanker.college/account` and stay signed in.

If the loop continues, in Clerk Dashboard check **Session** or **Cookie** settings for any “Cookie domain” or “Session cookie domain” and set it to **.clanker.college** (with the leading dot) if the option exists.

---

## 8. Deploy + verify (QA checklist)

1. **Redeploy** Railway after setting all env vars.
2. Open an **incognito** window. Go to **https://clanker.college/account**.
3. **Expected:**
   - Redirects to `https://accounts.clanker.college/sign-in?redirect_url=https://clanker.college/account`
   - Complete Google sign-in
   - Returns to **https://clanker.college/account** and **stays signed in** (UserButton visible). **No loop.**
4. **If it still loops:** confirm `NEXT_PUBLIC_CLERK_DOMAIN` and `NEXT_PUBLIC_CLERK_IS_SATELLITE` are set and deployed; confirm ClerkProvider props are present in production build; confirm clanker.college and accounts.clanker.college are on the same Clerk production instance and all Clerk DNS records are Verified.
5. **Also verify:** Sign In in nav → accounts.clanker.college/sign-in; refresh /account stays signed in; /account shows 3 cards; sign out works.

---

## Env reference (summary)

**Production (Railways, Satellite):**

- `NEXT_PUBLIC_CLERK_ENABLED=true`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_…`
- `CLERK_SECRET_KEY=sk_live_…`
- `NEXT_PUBLIC_APP_URL=https://clanker.college`
- `NEXT_PUBLIC_CLERK_ACCOUNT_PORTAL_URL=https://accounts.clanker.college`
- `NEXT_PUBLIC_CLERK_DOMAIN=accounts.clanker.college`
- `NEXT_PUBLIC_CLERK_IS_SATELLITE=true`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://accounts.clanker.college/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=https://accounts.clanker.college/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=https://clanker.college/account`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=https://clanker.college/account`
- `CLERK_WEBHOOK_SECRET=…` (optional)

**Local:**

- `NEXT_PUBLIC_CLERK_ENABLED=true`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…`
- `CLERK_SECRET_KEY=sk_test_…`

See `.env.example` for the full list.
