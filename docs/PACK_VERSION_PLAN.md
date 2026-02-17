# Pack version selection plan (Phase 1.2 sanity-check)

For version-discipline edge cases: pinned installs, “latest certified” vs “latest published,” and cache correctness.

---

## Current `GET /api/packs/[slug]/latest` response

As implemented today (single “latest” = most recent by `lastUpdatedAt`):

```json
{
  "slug": "design-systems",
  "title": "Design System Architecture",
  "version": "1.0.0",
  "last_updated": "2025-02-16T12:00:00.000Z",
  "outcomes": [
    "Produces a complete token table (color, type, spacing, radii, shadows, z-index, motion)",
    "Defines component contracts (props, variants, states) for buttons, inputs, cards, modals, alerts, tables",
    "Specifies accessibility rules (focus, labels, keyboard)",
    "Documents grid, breakpoints, and content widths",
    "Includes 2+ gold-standard examples mapped to the rubric"
  ],
  "install_url": "/api/packs/design-systems/install",
  "rubric_url": "/api/packs/design-systems/rubric",
  "syllabus_url": "/api/packs/design-systems/syllabus",
  "examples_url": "/api/packs/design-systems/examples"
}
```

**Notes today:**

- No `version` in URLs: `install_url`, `rubric_url`, etc. always point at **current latest** (whatever `getPackBySlug` returns as first version).
- “Latest” = single version per pack: `orderBy: { lastUpdatedAt: "desc" }, take: 1`. No distinction yet between “latest certified” and “latest published”; `is_certified_default` exists on `pack_versions` but is not used to filter “latest.”
- All responses are relative paths. `verify_url` in certify uses `NEXT_PUBLIC_APP_URL`; pack API does not.

---

## Pack version selection plan (Phase 1.2)

### Semantics

- **Latest certified:** Default for installs and “track latest.”  
  - Define as: latest pack version that is certified (e.g. `is_certified_default === true` and/or has at least one issued certificate, or we add `certified_at`).  
  - Today we can treat “latest” as “latest certified” by filtering versions to those with `is_certified_default` (or all, if we consider all seeded versions certified).
- **Latest published:** Optional future: “published” for display in catalog even if not yet certified. Not required for Phase 1.2; can remain “latest = latest certified.”

### API shape (proposed)

1. **`GET /api/packs/[slug]/latest`** (unchanged semantics, explicit contract)  
   - Returns the **latest certified** version (or current “first by lastUpdatedAt” until we add certified filtering).  
   - Add `version` to response (already present) so clients can pin.  
   - Optional: add `version_id` (pack_version.id) for stable cache keys and versioned fetches.

2. **Versioned surface URLs (pin this version)**  
   - Option A: **Path:** `/api/packs/[slug]/v/[version]/syllabus`, `.../rubric`, `.../examples`, `.../install`.  
   - Option B: **Query:** `/api/packs/[slug]/syllabus?version=1.0.0` (and same for rubric, examples, install).  
   - Recommendation: **Path** so cache keys are obvious and Cloudflare rules stay simple (e.g. `/api/packs/*/v/*/syllabus` cacheable per version).

3. **Install tab: “pin this version” vs “track latest”**  
   - **Pin this version:** Link or copy to `/api/packs/[slug]/v/[version]/install` (or `?version=x` if query).  
   - **Track latest:** Link or copy to `/api/packs/[slug]/latest` and document that install payload should be re-fetched periodically or on deploy.

### Pack page UI (Phase 1.2)

- **Version selector:** Dropdown or tabs listing all versions for that pack (e.g. from `GET /api/packs/[slug]/versions` or from existing pack payload).  
- **Default selection:** Latest certified (same as `/latest`).  
- **Per-tab content:** Syllabus, Labs, Rubric, Examples, Install, Changelog all driven by **selected version** (fetch versioned content when selector changes).  
- **Install tab:**  
  - Show two modes:  
    - “Pin this version” → URL to `/api/packs/[slug]/v/[version]/install`.  
    - “Track latest” → URL to `/api/packs/[slug]/latest` and note “re-fetch for latest certified.”

### Cache correctness

- **Current:** `/api/packs/[slug]/syllabus` (and rubric, examples, install) are keyed by slug only; they always return the current latest version. Cache is correct as long as “latest” is immutable until deploy/seed.  
- **After versioned endpoints:**  
  - `/api/packs/[slug]/v/[version]/*` → cache key includes version; safe to cache long-lived.  
  - `/api/packs/[slug]/latest` → remains short TTL or same as now; “latest” can change when a new version is certified.  
- **ETag:** Keep ETag derived from `pack_version_id` + `lastUpdatedAt` (or version id) so 304 works per version.

### Edge cases to lock

- **Pinned install:** Agent or human pins to `v1.0.0`. They must use versioned URLs only (`/v/1.0.0/install` etc.); never rely on `/latest` for pinned installs.  
- **Track latest:** Agent uses `/latest` and re-fetches install (and optionally rubric/syllabus) when they want to align to newest certified.  
- **Certify only latest?** Today we don’t restrict “certify” to a specific version; certificate stores `pack_version_id`. No change required for Phase 1.2 unless we want “only latest certified version can be used for new certifications.”

---

## Summary for sanity-check

- **Current `/latest` response:** Above JSON; URLs are relative and always “current latest” by `lastUpdatedAt`.  
- **Plan:** Add versioned routes `/api/packs/[slug]/v/[version]/{syllabus,rubric,examples,install}` for pinned installs; keep `/latest` for “track latest”; pack page version selector + Install tab “pin vs track latest”; cache only deterministic surfaces with version in key where applicable; ETag per version.

If you want to tighten “latest certified” (e.g. only versions that have at least one certificate, or explicit `certified_at`), we can add that filter to `getPackBySlug` and a dedicated “latest certified” helper before Phase 1.2 implementation.
