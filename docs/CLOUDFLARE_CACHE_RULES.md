# Cloudflare Cache Rules (Reference)

Configure in Cloudflare Dashboard: **Caching** → **Cache Rules** (or **Page Rules** / **Cache Rules**).

**Rule order:** Apply **bypass** rules first, then **cache** rules. Do not cache HTML pages until correctness is confirmed.

---

## 1. Bypass cache (grading and certificate endpoints) — first

**Rule name:** No cache for grade / certify / verify

**When:** URI Path matches: `/api/grade*`, `/api/certify*`, `/api/verify*`

**Then:** Bypass cache. Origin sends `Cache-Control: no-store, private`; ensure Cloudflare does not cache.

---

## 2. Cache deterministic surfaces only — second

**Rule name:** Cache agent surfaces

**When:** URI Path matches:
- `/api/packs`
- `/api/packs/*/latest`
- `/api/packs/*/syllabus`
- `/api/packs/*/rubric`
- `/api/packs/*/examples`
- `/api/packs/*/install`

**Then:** Eligible for cache. TTL e.g. 1 hour; respect origin `Cache-Control` and `ETag`.

Purge cache when deploying new pack content or after seed/updates. **Do not cache HTML pages** until correctness is confirmed.
