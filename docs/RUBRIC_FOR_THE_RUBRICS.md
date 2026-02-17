# Rubric for the Rubrics  
**Clanker.College Skill Pack Page QA**

**Purpose:** Prevent drift. Approve or reject a Skill Pack page build against the Clanker.College Design Thesis: **institutional trust + software precision + agent-native clarity.**

**Status:** Single QA checklist for approving the first Skill Pack page. Outside QA grades using this rubric and blocks launch on any Hard-Fail.

---

## How to use

- Score each section below.
- **Any Hard-Fail item = immediate reject** until fixed.
- **Passing threshold: 85/100** with zero Hard-Fails.

---

## A) Brand Thesis Integrity (15 points)

| Item | Points | Pass | Fail |
|------|--------|------|------|
| **A1. Institutional weight is present** | 0–5 | Page feels like a campus syllabus + certification record, not a SaaS landing page. | Excessive “marketing sections,” hype claims, testimonial carousels, gimmicky animations. |
| **A2. Developer-tool precision is present** | 0–5 | Copy is functional, specific, deterministic, versioned. | Vague benefit statements without measurable outputs or artifacts. |
| **A3. Single accent discipline is enforced** | 0–5 | Accent is sparse, used to direct attention (CTA, badges, highlights). | Accent becomes decorative or dominates surfaces. |

### Hard-Fails (Brand)

- Uses consumer course vocabulary (“Buy course,” “Start learning,” “Enroll now” without “Skill Pack” language).
- Looks like an Udemy clone (course tiles, ratings, instructor hero, video-first pitch).

---

## B) Above-the-Fold Clarity (15 points)

| Item | Points | Pass | Fail |
|------|--------|------|------|
| **B1. The “What is this?” answer in 3 seconds** | 0–5 | Must state: Skill Pack name + what it upgrades + outcomes. | Requires scrolling to understand purpose. |
| **B2. Outcomes are concrete and bounded** | 0–5 | 3–5 outcomes, verb-led, measurable or inspectable (“Produces X,” “Improves Y rubric dimension,” “Generates Z artifact”). | Outcomes are generic (“Better UI,” “Increase conversions” with no mechanism). |
| **B3. Primary CTA hierarchy** | 0–5 | One primary CTA (“Start Pack”) and one subordinate secondary (“See Certification” / “View Rubric”). | Multiple competing primary actions. |

### Hard-Fails (Above fold)

- No version visible above the fold (vX.Y).
- No “last updated” date above the fold.
- More than one visually primary CTA.

---

## C) Vocabulary and Microcopy Compliance (10 points)

| Item | Points | Pass | Fail |
|------|--------|------|------|
| **C1. Approved nouns and verbs used consistently** | 0–5 | Must use: Skill Pack, Labs, Rubric Score, Install, Versioned, Changelog, Certification. Must not use: Course, Lesson bundle, Instructor, Students, Graduation, Buy. | Non-compliant vocabulary. |
| **C2. Deterministic tone** | 0–5 | Short sentences, concrete claims, no fluff, no “transform your life” style language. | Marketing fluff or vague promises. |

### Hard-Fail (Copy)

- Any consumer-learning CTA language appears in navigation, buttons, or headings.

---

## D) Information Architecture and Tabs (10 points)

| Item | Points | Pass | Fail |
|------|--------|------|------|
| **D1. Required tabs exist and are functional** | 0–5 | Must have: Syllabus, Labs, Rubric, Examples, Install, Changelog. | Any missing, buried, or treated as a footnote. |
| **D2. Content density is structured, not cluttered** | 0–5 | Sections are chunkable with stable headings and scannable bullets. | Long marketing paragraphs, excessive decorative blocks. |

### Hard-Fails (IA)

- Changelog absent or not version-linked.
- Install instructions missing or too vague to execute.

---

## E) Agent-Native Signal-to-Noise (15 points)

| Item | Points | Pass | Fail |
|------|--------|------|------|
| **E1. Retrieval-friendly formatting** | 0–5 | Strong heading hierarchy, minimal fluff, consistent naming, short blocks, lists over prose. | Dense prose, weak structure. |
| **E2. Machine surfaces are obvious** | 0–5 | Clear links to pack endpoints (packs/rubrics/examples/grade/certify) and copy buttons where relevant. | Endpoints hidden or unclear. |
| **E3. Examples are gold-standard and directly comparable** | 0–5 | Examples map to rubric dimensions and show what “passing” looks like. | Examples are inspirational or unrelated. |

### Hard-Fails (Agent-native)

- Page content is dominated by marketing text that would pollute retrieval.
- No direct access to rubric criteria in a structured form (at least readable table; ideally also a linked JSON).

---

## F) Rubric Presentation and Table Quality (10 points)

| Item | Points | Pass | Fail |
|------|--------|------|------|
| **F1. Rubric is explicit and scorable** | 0–5 | Criteria have numeric scoring ranges and clear failure definitions. | Rubric is qualitative-only. |
| **F2. Mobile table behavior is excellent** | 0–5 | On mobile, rubric table becomes cards or horizontally scrolls cleanly without breaking comprehension. | Cramped, wrapped, unreadable. |

### Hard-Fail (Rubric)

- Rubric cannot be read on a 375px wide screen without losing criteria labels and scores.

---

## G) Visual System and Components (15 points)

| Item | Points | Pass | Fail |
|------|--------|------|------|
| **G1. Typography system is consistent** | 0–5 | Headings/body/mono usage matches spec, no random font sizes, clean type scale. | Inconsistent or arbitrary type. |
| **G2. Spacing and grid discipline** | 0–5 | Consistent spacing system, no arbitrary margins, content aligns to grid. | Inconsistent spacing or alignment. |
| **G3. Badges and certification semantics** | 0–5 | Badges communicate state (Certified/In Progress/Lab/Rubric/vX.Y) and are used consistently. | Badges are decorative. |

### Hard-Fails (Visual)

- Campus Grid motif used beyond hero/certificate/cover contexts.
- Heavy shadows / glossy gradients / loud animations that shift it into “flashy SaaS.”

---

## H) Performance and Accessibility Baseline (10 points)

| Item | Points | Pass | Fail |
|------|--------|------|------|
| **H1. Performance budget respected** | 0–5 | Minimal JS for content pages, fast render, no heavy animation libraries for core reading surfaces. | Bloat, slow render, heavy animations on reading surfaces. |
| **H2. Accessibility essentials** | 0–5 | Visible focus states, adequate contrast, semantic headings, labels, keyboard navigable tabs. | Missing focus, poor contrast, or non-keyboard tabs. |

### Hard-Fails (A11y/Perf)

- No visible focus states on interactive elements.
- Contrast fails on primary text.
- Tabs not keyboard accessible.

---

## Scoring summary

| Total | Passing |
|-------|---------|
| **100 points** | **85+ and zero Hard-Fails** |

---

## Approval stamp rules (for outside supervision)

A page is **approved** only if:

- All required artifacts are present (version, last updated, changelog, rubric, install).
- The vocabulary is compliant.
- Agent-native signal-to-noise passes.
- Mobile rubric tables are readable.
- Accent sparsity holds.

---

## Deliverable for dev team (attach to ticket)

> Build the Skill Pack page template to satisfy every item above. The outside QA will grade the first page using this rubric and block launch if any Hard-Fail triggers.

---

*Optional next step: a one-page “drift detector” list of the top 20 common deviations (visual and copy) for Figma and PR review.*
