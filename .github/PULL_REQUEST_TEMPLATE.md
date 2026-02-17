# Pull request

## Stop-ship triggers (must all be false to merge)

- [ ] **No consumer-ed vocabulary** — No "Buy course," "Start learning," "Students," "Instructor," "Lectures," "Graduation," "Curriculum bundle," or "Enroll now" in UI/copy.
- [ ] **Version + last updated above fold** — Skill Pack page shows vX.Y and "last updated" above the fold.
- [ ] **Changelog + Install tabs present** — No missing or buried Changelog or Install tab.
- [ ] **Rubric scorable and mobile-readable** — Rubric has numeric scoring; on 375px width, criteria labels and scores are readable (cards or clean scroll).
- [ ] **Accent sparsity** — Accent color only on primary CTA, badges, and link hover. No accent backgrounds on large containers.
- [ ] **Focus states + keyboard nav** — Visible focus on interactive elements; tabs keyboard accessible.

## Required screenshots (attach for pack or UI changes)

- [ ] **Desktop pack page** — Above-fold + one tab visible.
- [ ] **Mobile pack page** — 375px or similar; rubric section (cards or scroll).
- [ ] **Rubric section** — Table or cards with dimensions and scores.
- [ ] **Install tab** — At least one machine endpoint link visible.

## Required API checks (run and paste results or link to CI)

```bash
# Surfaces (deterministic, cacheable)
curl -sI "$BASE_URL/api/health" | head -5
curl -s "$BASE_URL/api/packs" | jq 'length'
curl -s "$BASE_URL/api/packs/design-systems/rubric" | jq 'keys'
curl -s "$BASE_URL/api/packs/design-systems/syllabus" | head -3
curl -s "$BASE_URL/api/packs/design-systems/examples" | head -2

# Grading (after one submission)
# POST /api/grade → submission_id
# GET /api/grade/{submission_id} → result, score_total, score_by_dimension, hard_fails (array of { dimension_id, code, message })
# POST /api/certify → cert_id, verify_url
# GET /api/verify/{cert_id} → certificate + verification status
```

## Checklist

- [ ] `pnpm qa:pack` passes (vocab lint + smoke tests + pack-page validator).
- [ ] No new marketing sections or flashy SaaS patterns.
- [ ] Campus Grid motif only in hero/certificate/cover contexts.
