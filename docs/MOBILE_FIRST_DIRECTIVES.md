# Mobile-first directives for Clanker.College

**Dev team instructions. No debate.**

---

## Primary rule

On mobile, the user must reach a meaningful action in **under 3 seconds**:

- Browse packs
- Start subscription
- Install a pack

Everything else is secondary.

---

## Global mobile layout system

### 1. Viewport + spacing baseline

- Use a **4px spacing grid**; mobile defaults:
  - **Page padding:** 16px left/right
  - **Section vertical spacing:** 24px (tight) / 32px (normal)
  - **Max readable line length:** ~38–48 characters on mobile (force wrap)
  - **Buttons:** minimum **44px height**, **full-width by default** on mobile

### 2. Typography (mobile scale)

- **H1:** 28–32px (2 lines max)
- **Subhead:** 15–16px (2 lines max)
- **Body:** 14–15px
- Keep headings short. If it wraps to 4 lines, it's wrong.

### 3. Sticky nav (mobile)

- **Top bar:** logo + hamburger + primary CTA
- **Primary CTA in header:**
  - Signed out: **"Browse"**
  - Signed in + locked: **"Upgrade"**
  - Signed in + entitled: **"Install"**
- **Hamburger contains:** Catalog, Schools, Certification, Docs, Account

### 4. Sticky bottom action bar (conversion)

On mobile, add a **bottom bar** on:

- `/catalog`
- `/packs/[slug]`

**Behavior:**

- If signed out: **"Sign in"**
- If locked: **"Start subscription"**
- If entitled: **"Install"** (or **"Download"** on install tab)

This is the single biggest mobile conversion lever.

---

## Hero (mobile-specific)

### 5. Hero content density budget

Above the fold mobile must contain **only**:

- H1
- 1 subhead line
- 1 primary CTA (full width)
- 1 secondary CTA (text link or outline)
- Optional: 1 tiny trust line (one line)

Everything else moves below fold.

### 6. Replace "trust markers row" with "proof chip"

- One **pill/chip** under CTAs: **"Public certificate verification"**
- Tap opens a modal showing an example certificate.

### 7. Add "Example certificate" as a swipeable card

Directly under CTAs:

- A single card with: Pack slug, Version, Score, Verify button
- Functions as proof without more text.

---

## Catalog (mobile-first)

### 8. Catalog cards: tappable and compressed

Each pack card on mobile shows **only**:

- Pack name
- 1-line outcome
- Badge: "Certified vX"
- Lock badge if needed
- **One button:** "View" or "Upgrade"

No second button. No long descriptions.

### 9. Filters = bottom sheet

- "Filter" button opens **bottom sheet**
- Sticky **Apply** button at bottom
- Default filters: Difficulty, Category, Certified only (default on)

---

## Pack detail page (mobile-first)

### 10. Tabs → segmented control or vertical sections

- Do **not** use desktop tabs on mobile.
- Use **segmented control** (Overview, Install, Labs, Rubric) **or** vertical sections with anchors.
- **Install must be reachable in 1 tap.**

### 11. Install on mobile = copy-first UX

- Show steps as **copy blocks** with **"Copy"** buttons
- **"Send to email"** button (emails instructions to self)
- **"Open on desktop"** QR code (optional but strong)

---

## Account (/account) mobile-first

### 12. Auth page: single card, zero friction

- Continue with Google (full width)
- Email magic link (full width)
- No tabs, no "create account" form
- After login: redirect to `/catalog`

### 13. Account page = 3 stacked cards

- Subscription
- Install snippets
- Certificates

No sidebars, no multi-column.

---

## Performance (mobile-first hard requirements)

### 14. Budget

- **LCP under 2.5s** on 4G
- No autoplay video in hero
- No heavy animations above the fold
- Use static SVG logos
- Defer non-critical scripts

### 15. Touch + accessibility

- **44px minimum** hit targets
- Visible focus for keyboard
- High contrast text for sunlight
- No tiny link clusters

---

## Mobile conversion principle (2026)

**Reduce uncertainty with proof, not more copy.**

On mobile, people won't read. They'll look for:

- Is this real?
- Can I use it fast?

So the hero must show an **artifact** (example certificate) and **one button** (Browse or Upgrade).

---

## Implementation checklist

- [x] Add mobile bottom action bar (Sign in / Upgrade / Install)
- [x] Collapse hero to H1 + 1 subhead + 2 CTAs + 1 proof chip
- [x] Add "Example certificate" card under CTAs (mobile)
- [x] Convert pack tabs into segmented control on mobile
- [x] Make catalog cards single-CTA
- [x] Make filters a bottom sheet
- [x] Enforce 44px touch targets and performance budget
- [x] Sticky nav: hamburger + primary CTA (Browse)
- [x] Account: single auth card; 3 stacked cards layout
