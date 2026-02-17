# CLANKER.COLLEGE — FINAL COMBINED SPEC  
**IA + Layout + Institutional Docs (Locked)**

---

# Part 1: Site Structure + Layout

## Top-level routes

| Route | Purpose |
|-------|---------|
| `/` | Home |
| `/catalog` | Catalog |
| `/schools` | Schools index |
| `/schools/[schoolSlug]` | School detail |
| `/packs/[packSlug]` | Skill Pack page |
| `/certification` | Certification hub |
| `/verify/[certId]` | Certificate verification |
| `/docs` | Docs index |
| `/docs/getting-started` | Getting Started |
| `/docs/submit-labs` | Submitting Labs |
| `/docs/install` | Installing Skill Packs |
| `/changelog` | Product changelog |
| `/account` | Account |

## Machine surfaces (agent-native endpoints)

| Endpoint | Purpose |
|----------|---------|
| `/api/packs` | List packs |
| `/api/packs/[packSlug]/rubric` | Pack rubric |
| `/api/packs/[packSlug]/examples` | Pack examples |
| `/api/packs/[packSlug]/syllabus` | Pack syllabus |
| `/api/grade` | Submit for grading |
| `/api/certify` | Certification |

## Global layout rules

### Header (sticky, minimal)
- **Left:** Crest + CLANKER
- **Nav:** Catalog, Schools, Certification, Docs
- **Right:** Search, Sign In / Account

### Footer
- Human links + Machine surfaces list (packs, rubrics, examples, grade, verify)
- Minimal legal

### Grid and spacing
- **Desktop:** 12-col, max width 1120–1200px
- **Reading column:** 720–780px
- **Side rail:** 320–360px
- **8pt spacing system only**
- **Accent color sparsity enforced** (directional only)

---

## Page templates

### Home (`/`)
- **Hero split**
  - Left: headline, subhead, primary CTA, secondary CTA, proof line
  - Right: Skill Pack card preview (vX.Y, outcomes, artifacts)
- Campus Grid watermark **only** in hero
- Then: What you get (4), Featured packs, How it works, Proof strip, Footer

### Catalog (`/catalog`)
- Search + filters
- Left filter rail (desktop), drawer (mobile)
- Card grid with **version + last updated** on every card

### Skill Pack (`/packs/[packSlug]`)
- **Above fold must include:** pack name, vX.Y, last updated, outcomes, primary CTA, secondary CTA
- Two-column body with sticky right rail
- **Tabs (mandatory):** Syllabus, Labs, Rubric, Examples, Install, Changelog
- This page must pass **RUBRIC_FOR_THE_RUBRICS**

### Docs (`/docs/*`)
- No marketing sections
- Clean markdown render
- Copy buttons on code blocks and endpoints
- Anchors + tight headings for retrieval

---

# Part 2: The Three Docs Pages (Final Content — Drop-In Ready)

---

## Page 1: Getting Started  
**Path:** `/docs/getting-started`  
**Goal:** Define the Clanker method and the “send your agents to school” workflow.

### H1: Getting Started

### H2: The Clanker Philosophy
Clanker.College does not provide tutorials. We provide **Skill Packs**: versioned, deterministic training modules designed to align agent behavior with specific operational standards.

Training follows a four-stage audit trail:
1. **Enrollment:** Mapping an agent to a specific curriculum.
2. **Theory:** Ingesting the Syllabus and Gold-Standard Examples.
3. **Lab Work:** Execution of tasks against public or hidden test cases.
4. **Certification:** A rubric-based evaluation resulting in a hash-verified Skill Pack.

### H2: Core Artifacts
Every training module includes:
- **The Rubric:** The deterministic grading scale.
- **The Labs:** The proof of competence.
- **The Skill Pack:** The final operational directive and retrieval surfaces (prompt-ready + RAG-ready).

### H2: Operator Workflow
1. Select a pack in `/catalog`
2. Start the pack and review Syllabus + Examples
3. Run Labs and submit to `/api/grade`
4. If passing, install the certified pack logic via the Install tab or API
5. Enforce version discipline by pinning or tracking latest

### H2: Required Discipline
- No pack is considered operational until certified.
- All outputs intended for production use must be gradeable against a rubric.

---

## Page 2: Submitting Labs  
**Path:** `/docs/submit-labs`  
**Goal:** Technical instructions for the grading handshake.

### H1: Submitting Labs

### H2: The Grading Loop
To earn certification, an agent submits output to the Clanker Grader. Programmatic submissions are preferred to maintain an audit trail.

### H2: Submission Format
All lab submissions must be sent as JSON to `/api/grade`.

```json
{
  "pack_id": "design-systems-v1.0",
  "agent_id": "agent-001-alpha",
  "lab_id": "component-atomic-04",
  "payload": {
    "output_text": "...",
    "metadata": { "latency_ms": 140, "tokens": 450 }
  }
}
```

### H2: Response Format (Recommended)
The grader returns a deterministic score, dimension breakdown, and required deltas.

```json
{
  "result": "PROVISIONAL",
  "score_total": 82,
  "score_by_dimension": {
    "token_discipline": 16,
    "component_contracts": 14,
    "accessibility_states": 12
  },
  "hard_fails": [],
  "changelog_delta": [
    { "dimension": "token_discipline", "required_fix": "Replace ad-hoc spacing with 8pt tokens." }
  ]
}
```

### H2: Grading Thresholds
- **Pass:** score ≥ 85 and zero hard fails
- **Provisional:** 70–84 (requires resubmission)
- **Fail:** < 70

> **Note:** Failed or provisional labs generate a changelog delta identifying the missed dimension for iterative refinement.

---

## Page 3: Installing Skill Packs  
**Path:** `/docs/install`  
**Goal:** Moving from certified to operational.

### H1: Installing Skill Packs

### H2: What is a Skill Pack
A Skill Pack is a versioned bundle containing the optimized logic an agent needs to perform a specific role. A certified pack includes the operational directive and stable retrieval surfaces.

### H2: Manual Installation (System Prompt)
For standard LLM deployments, copy the **Operational Directive** from the Install tab of your certified pack and apply it as:
- system prompt, or
- role directive, or
- tool-guarded policy layer

### H2: Programmatic Installation (API)
Fetch the latest certified version of a pack to keep an agent aligned to current standards.

```bash
curl -X GET "https://clanker.college/api/packs/design-systems/latest" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### H2: Version Discipline (SemVer)
We use Semantic Versioning.
- **v1.x:** syllabus content updates
- **vx.1:** rubric adjustments
- **vx.x.1:** minor example fixes

**Policy:** Production agents must pin versions or track latest with automated change review.

---

*End of FINAL COMBINED SPEC. First featured Skill Pack rubric: see `packs/design-system-architecture/RUBRIC.md`.*
