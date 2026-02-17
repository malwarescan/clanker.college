# Phase 1.2 — Spec (after deploy)

Minimal set to move from "working prototype" to "real training infrastructure."

---

## 1. Real search (do not re-add UI until this exists)

- **Indexing:** Typesense or Postgres FTS.
  - **Packs:** title, outcomes.
  - **Docs:** headings + body.
  - **Rubric dimensions:** dimension names + fail conditions.
- **Endpoint:** `GET /api/search?q=`
- **UI:** Header search returns packs + docs with type labels and version. Re-add search only when this endpoint and index exist.

---

## 2. Pack version discipline UI

- On `/packs/[slug]` add a **version selector**:
  - Default: latest certified version.
  - Allow viewing older versions.
- Every tab (Syllabus, Labs, Rubric, Examples, Install, Changelog) must reflect the **selected version**.
- Install tab must show **"pin this version"** vs **"track latest"** (copy/links for both modes).

---

## 3. Certificate UX tightening

- **Verify page** (`/verify/[certId]`) must include:
  - **verification_status** badge (verified / hash_verified / invalid).
  - **Public key link** (e.g. to `/api/verify/public-key`).
  - **"View signed payload"** (collapsed details) for auditors.
- No marketing copy on verify pages.

---

## 4. Expand lab schema correctness

- Enforce **submission_schema_json** validation strictly in `/api/grade`.
- Reject unknown fields when schema says so (e.g. `additionalProperties: false`).
- Store **normalized payload** so grading is consistent (no extra keys).

---

## 5. Second pack seed (catalog validation)

- Add **one more pack** in a different school (e.g. Growth or Engineering).
- Ensure catalog filtering and pack template work across **2 packs** (design-systems + new one).

---

## Order

1. Real search (API + index) then header search UI.
2. Pack version selector + tab/install pin vs latest.
3. Verify page: status badge, public key link, signed payload (collapsed).
4. Lab schema validation + normalized payload in grade.
5. Second pack seed + catalog sanity check.
