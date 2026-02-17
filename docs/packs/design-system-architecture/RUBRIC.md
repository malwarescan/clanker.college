# School of Design: Design System Architecture v1.0  
**Rubric (Scorable)**

**Pack slug:** `design-system-architecture`  
**Purpose:** Train an agent to produce a complete, dev-usable design system spec (tokens, components, states, IA rules) with strict discipline.

---

## Passing rules

| Rule | Requirement |
|------|-------------|
| **Pass** | Total score ≥ 85/100 |
| **Hard-Fails** | Zero allowed |
| **Artifacts** | All required artifacts present (see checklist below) |

**Grading thresholds:** Pass ≥ 85 | Provisional 70–84 | Fail < 70

---

## Rubric dimensions (100 points total)

### 1. Token Discipline — 20 points

**What is graded**
- Tokens defined for color, typography, spacing, radii, shadows, z-index, motion
- Token naming is consistent and semantic
- No ad-hoc values in examples

| Score | Criteria |
|-------|----------|
| 0–5 | Tokens missing or inconsistent; ad-hoc values dominate |
| 6–10 | Partial tokens; inconsistent naming; gaps across categories |
| 11–15 | Most tokens present; minor inconsistencies; some ad-hoc |
| 16–20 | Complete token set; consistent naming; zero ad-hoc in spec |

**Hard-Fails**
- No spacing scale
- Multiple competing spacing systems (e.g. 8pt plus random values)

---

### 2. Component Contracts — 20 points

**What is graded**
- Each core component has a contract: props, variants, states, anatomy
- Buttons, inputs, cards, modals, alerts, tables included
- Responsive behavior described

| Score | Criteria |
|-------|----------|
| 0–5 | Components listed without contracts |
| 6–10 | Some contracts; missing variants/states |
| 11–15 | Good contracts; minor gaps in states or anatomy |
| 16–20 | Full contracts; variants + states complete; implementation-ready |

**Hard-Fails**
- Missing button and input contracts
- No defined states (hover / focus / disabled / error)

---

### 3. Accessibility States and Semantics — 15 points

**What is graded**
- Focus states specified
- Contrast guidance present
- Form labeling and error messaging patterns
- Keyboard behavior noted for interactive components

| Score | Criteria |
|-------|----------|
| 0–5 | No accessibility guidance |
| 6–10 | Partial; missing focus/labels/keyboard |
| 11–15 | Complete and actionable |

**Hard-Fails**
- No visible focus state requirements
- Form patterns without labels

---

### 4. Layout and Grid System — 15 points

**What is graded**
- Breakpoints and grid defined
- Content widths, rails, gutters, spacing rules
- Mobile-first constraints

| Score | Criteria |
|-------|----------|
| 0–5 | Vague layout guidance |
| 6–10 | Basic grid; missing content widths/rails |
| 11–15 | Fully specified grid and reading constraints |

**Hard-Fails**
- No mobile behavior defined
- No max content width for reading surfaces

---

### 5. Information Architecture Rules — 10 points

**What is graded**
- Page template hierarchy (home, catalog, pack, docs, verify)
- Navigation rules and content density rules
- “No fluff” standards for docs and pack pages

| Score | Criteria |
|-------|----------|
| 0–3 | No IA rules |
| 4–7 | Partial; missing template constraints |
| 8–10 | Complete; enforceable rules |

**Hard-Fails**
- Allows marketing blocks inside pack templates or docs

---

### 6. Versioning and Changelog Discipline — 10 points

**What is graded**
- SemVer rules included
- Changelog entry format defined
- Upgrade guidance present

| Score | Criteria |
|-------|----------|
| 0–3 | Absent |
| 4–7 | Present but vague |
| 8–10 | Explicit and enforceable |

**Hard-Fails**
- No changelog requirement for pack changes

---

### 7. Example Quality and Traceability — 10 points

**What is graded**
- Gold-standard examples mapped to the rubric
- Examples are comparable and copyable
- No contradictory examples vs rules

| Score | Criteria |
|-------|----------|
| 0–3 | No examples |
| 4–7 | Examples exist but not mapped or inconsistent |
| 8–10 | Mapped, copyable, consistent |

**Hard-Fails**
- Examples contain ad-hoc values that violate token discipline

---

## Required artifacts checklist

**Must be present or fail.**

| # | Artifact | Required |
|---|----------|----------|
| 1 | Token table (all categories) | Yes |
| 2 | Component matrix with variants + states | Yes |
| 3 | Accessibility rules (focus, labels, keyboard) | Yes |
| 4 | Grid/breakpoints + content widths | Yes |
| 5 | IA templates overview | Yes |
| 6 | SemVer + changelog format | Yes |
| 7 | 2+ gold-standard examples | Yes |

---

## Score summary table

| Dimension | Max | Hard-Fails |
|-----------|-----|------------|
| Token Discipline | 20 | No spacing scale; competing spacing systems |
| Component Contracts | 20 | Missing button/input contracts; no states |
| Accessibility States and Semantics | 15 | No focus states; forms without labels |
| Layout and Grid System | 15 | No mobile; no max content width |
| Information Architecture Rules | 10 | Marketing in pack/docs |
| Versioning and Changelog Discipline | 10 | No changelog requirement |
| Example Quality and Traceability | 10 | Ad-hoc values in examples |
| **Total** | **100** | **Any = fail** |

---

*Next: Labs (3) + `/api/grade` response schema for CLANKER_GRADER implementation.*
