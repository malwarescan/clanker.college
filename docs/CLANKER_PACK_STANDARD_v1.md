# CLANKER_PACK_STANDARD_v1

Canonical filesystem standard for Clanker.College curriculum packs. Every pack must conform so it can be published, purchased, installed by agents, and graded/certified with auditability.

## Folder layout (canonical)

```
clanker-pack/
├── pack.json                       # required pack metadata
├── skills/
│   └── <skill-slug>/
│       ├── SKILL.md                # required; frontmatter + workflow + rubric hooks
│       ├── examples.ndjson         # optional; canonical examples
│       └── fixtures/               # optional; input/output fixtures for labs
├── rubric/
│   ├── rubric.json                 # required; deterministic scoring criteria
│   └── hard_fails.json             # required; zero hard-fail rules
├── install/
│   ├── claude/
│   │   └── skills/                 # built artifact for "drop into .claude/skills"
│   ├── plugin/
│   │   └── .claude-plugin/
│   │       ├── plugin.json         # if packaging as Claude Code plugin
│   │       └── skills/             # same skills mirrored here if plugin-based
│   └── openclaw/
│       └── openclaw.json           # optional template snippet for OpenClaw registration
├── docs/
│   ├── README.md                   # install instructions (Claude + OpenClaw)
│   └── SYLLABUS.md                 # structured overview for humans
└── dist/                           # build output
    ├── <slug>-<version>.zip        # skills install
    └── <slug>-<version>-plugin.zip # plugin install (optional)
```

## Required files and minimum fields

### 1. pack.json (required)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| slug | string | yes | Unique pack identifier (URL-safe) |
| name | string | yes | Human-readable pack name |
| version | string | yes | SemVer (e.g. "1.0.0") |
| description | string | yes | Short description |
| skills | string[] | yes | List of skill-slug directories under skills/ |
| pass_threshold | number | no | Default 85 |
| zero_hard_fails | boolean | no | Default true |
| artifact_urls | object | no | Set by build/publish: zip_url, git_url?, plugin_url? |
| machine_surfaces | object | no | rubric_json_url, examples_ndjson_url?, grade_endpoint, verify_endpoint |
| pricing | object | no | product_id (Stripe), requires_purchase: boolean |

### 2. rubric/rubric.json (required)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version | string | yes | Rubric version (e.g. "1.0") |
| criteria | array | yes | { id, name, weight, scoring_method }[] |
| max_score | number | yes | Typically 100 |
| pass_score | number | yes | Typically 85 |
| output_schema | object | yes | JSON Schema for submission payload |

### 3. rubric/hard_fails.json (required)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rules | array | yes | { id, description, detection_method, failure_message }[] |

### 4. skills/<skill-slug>/SKILL.md (required per skill)

**Frontmatter (required):**
- title
- id (stable)
- pack_slug
- version
- inputs
- outputs
- success_criteria

**Body sections (required):**
- Objective
- Preconditions
- Steps
- Validation (how it will be graded)
- Example (at least one)

## Agent ingestion modes

- **Claude Code Skills:** Unzip dist/<slug>-<version>.zip into `~/.claude/skills/` or project `.claude/skills/`.
- **Claude Code Plugin:** Use dist/<slug>-<version>-plugin.zip or plugin path; includes `.claude-plugin/plugin.json` + skills.
- **OpenClaw:** Use openclaw.json snippet from install/openclaw/ to register skill path(s).

## Grading and certification

- **Grade:** POST /api/grade with pack_slug, pack_version (SemVer), skill_slug (optional), submission payload. Response: score, pass/fail, hard_fail flags, certificate_id if pass.
- **Verify:** GET /verify/[certId] — public; shows hash, pack, version, rubric version, timestamp.
- **Rule:** No certification if any hard-fail triggers. "Latest" = latest certified by SemVer.

## Immutability

Once a pack version is certified, artifact URLs and content hashes do not change. Catalog shows only packs with at least one certified version.
