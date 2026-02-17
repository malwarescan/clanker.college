# DRIFT DETECTOR  
**Top 20 deviations to catch in Figma + PR review**

Use this as a one-page guardrail. **If any item appears, flag it as Clanker.College drift and require changes before merge.**

---

## 1. Vocabulary drift to consumer education

| Red flags | Correct language |
|-----------|------------------|
| “Buy course,” “Start learning,” “Students,” “Instructor,” “Lectures,” “Graduation,” “Curriculum bundle” | “Install Skill Pack,” “Pass Labs,” “Rubric Score,” “Versioned,” “Changelog,” “Certification” |

---

## 2. Udemy clone layout patterns

| Red flags | Correct |
|-----------|---------|
| Course tiles with ratings, instructor hero blocks, “what you’ll learn” marketing sections, video-first sales pitch | Syllabus + Labs + Rubric + Examples + Install + Changelog as the product |

---

## 3. Flashy SaaS hero tropes

| Red flags | Correct |
|-----------|---------|
| “Transform your workflow,” “AI-powered everything,” gradient blobs, rotating testimonials, excessive motion | Institutional hero with outcomes, artifacts, and measurable proof |

---

## 4. Accent color overuse

| Red flags | Rule |
|-----------|------|
| Accent used as background fills, big decorative shapes, colored cards everywhere | Accent is directional only (primary CTA, key badge, tiny highlights). If it visually dominates, it fails. |

---

## 5. Campus Grid motif misuse

| Red flags | Rule |
|-----------|------|
| Grid used as persistent background, busy patterns behind body text, animated grid | Grid appears only on hero/certificates/cover art, as a subtle watermark. |

---

## 6. Missing versioning discipline

| Red flags | Rule |
|-----------|------|
| No vX.Y above the fold, no “last updated,” no changelog tab, changelog not tied to versions | Version + last updated + changelog are mandatory. No exceptions. |

---

## 7. Rubric becomes “soft feedback”

| Red flags | Rule |
|-----------|------|
| Rubric is qualitative-only, unclear pass/fail, no numeric scoring, “suggestions” without criteria | Rubric must be scorable, explicit, and deterministic. |

---

## 8. Examples are inspirational, not comparable

| Red flags | Rule |
|-----------|------|
| Examples that don’t map to rubric dimensions, random screenshots, “case studies” without scoring | Examples must be gold-standard outputs directly tied to rubric criteria. |

---

## 9. Too much marketing text polluting retrieval

| Red flags | Rule |
|-----------|------|
| Long paragraphs of positioning inside pack pages, repeated slogans, vague benefit fluff | Pack pages are training infrastructure docs: dense, structured, chunkable. |

---

## 10. Multiple competing CTAs

| Red flags | Rule |
|-----------|------|
| Two primary buttons above the fold, lots of “start” actions, CTA overload | One primary CTA. One subordinate secondary CTA max. |

---

## 11. Missing required tabs or burying them

| Red flags | Rule |
|-----------|------|
| Install instructions hidden, rubric not first-class, labs not explicit, no examples section | Required tabs are mandatory and prominent: **Syllabus, Labs, Rubric, Examples, Install, Changelog.** |

---

## 12. Weak “3-second comprehension”

| Red flags | Rule |
|-----------|------|
| Can’t answer “what is this pack?” instantly, outcomes vague, for-who unclear | Above the fold must state what it upgrades and what artifacts it produces. |

---

## 13. Random spacing and type scale

| Red flags | Rule |
|-----------|------|
| Inconsistent margins, arbitrary padding, font sizes that don’t follow scale, misaligned columns | Strict spacing system and consistent typographic hierarchy. |

---

## 14. Heavy shadows, glossy gradients, loud effects

| Red flags | Rule |
|-----------|------|
| Deep drop shadows, neon glows everywhere, glassmorphism, animated gradients | Borders and subtle depth only. Institutional minimalism. |

---

## 15. Certificate design looks like a SaaS badge

| Red flags | Rule |
|-----------|------|
| Cartoonish badges, over-styled certificates, social-share gimmicks | Certificate must look academic, clean, verifiable, and versioned. |

---

## 16. Tables break on mobile

| Red flags | Rule |
|-----------|------|
| Rubric tables unreadable on 375px, labels wrap into nonsense, horizontal scroll messy | Mobile rubric becomes card layout or clean horizontal scroll with pinned labels. |

---

## 17. Poor accessibility basics

| Red flags | Rule |
|-----------|------|
| No visible focus states, low contrast, keyboard traps in tabs, unlabeled inputs | Visible focus rings, semantic headings, keyboard navigable tabs, labels always. |

---

## 18. Performance bloat on content pages

| Red flags | Rule |
|-----------|------|
| Heavy animation libs for reading pages, large hero videos, excessive client-side rendering | Content pages should be fast and minimal JS. Performance is part of institutional trust. |

---

## 19. Inconsistent badge semantics

| Red flags | Rule |
|-----------|------|
| Badges used decoratively, inconsistent naming (“Verified” vs “Certified”), random colors | Badges have strict meanings: **Certified, In Progress, Lab, Rubric, vX.Y.** |

---

## 20. Docs are human-only, not agent-native

| Red flags | Rule |
|-----------|------|
| No obvious machine surfaces, no copy buttons, endpoints buried, install steps vague | Always expose structured surfaces and make copying frictionless. |

---

## PR Review “Stop Ship” triggers (instant reject)

- Any consumer-education vocabulary appears in UI
- No version + last updated above fold on Skill Pack page
- Missing Changelog or Install tab
- Rubric not scorable or not readable on mobile
- Accent color dominates the page
- Focus states missing or keyboard navigation broken

---

## Where to pin this

| Location | Use |
|----------|-----|
| **Figma** | As a “Brand Guardrails” page next to the component library |
| **GitHub** | Include in PR template as a checklist with “Stop Ship” triggers at the top |
