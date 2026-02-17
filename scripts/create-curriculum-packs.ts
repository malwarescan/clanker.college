#!/usr/bin/env tsx
/**
 * Create stub packs for the 12 courses from CURRICULUM_STRATEGY_2026.md.
 * Uses templates/pack-starter; each pack gets one skill placeholder.
 * Run from repo root: pnpm exec tsx scripts/create-curriculum-packs.ts
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATE = join(REPO_ROOT, "templates", "pack-starter");
const PACKS_DIR = join(REPO_ROOT, "packs");

const COURSES: { slug: string; name: string; description: string; skillSlug: string; skillTitle: string }[] = [
  { slug: "agent-evaluation-regression-harness", name: "Agent Evaluation + Regression Harness", description: "Prove the agent still does the job after changes. Eval cases, rubric, batch grading, version diff, release gate.", skillSlug: "eval-harness", skillTitle: "Eval harness" },
  { slug: "prompt-injection-tool-safety", name: "Prompt Injection + Tool Safety Hardening", description: "Agent refuses malicious instructions and unsafe actions. Injection detection, safe browsing, file constraints, allowlists.", skillSlug: "safety-hardening", skillTitle: "Safety hardening" },
  { slug: "claude-skills-authoring", name: "Claude Skills Authoring Standard (SKILL.md)", description: "Write skills that auto-invoke correctly and stay deterministic. Frontmatter, triggers, steps, output schema.", skillSlug: "skill-authoring", skillTitle: "Skill authoring" },
  { slug: "plugin-packaging-distribution", name: "Plugin Packaging + Team Distribution", description: "Ship a plugin repo that installs cleanly across a team. plugin.json, versioning, install paths, release checklist.", skillSlug: "plugin-packaging", skillTitle: "Plugin packaging" },
  { slug: "local-coworker-ops", name: "Local Coworker Ops", description: "Agent operates on local files without wrecking things. Safe file ops, batch organize, audit log, rollback plan.", skillSlug: "coworker-ops", skillTitle: "Coworker ops" },
  { slug: "inbox-calendar-triage", name: "Inbox + Calendar Triage Agent", description: "Agent triages, drafts, schedules with policy constraints. Priority rubric, draft templates, escalation rules.", skillSlug: "triage-agent", skillTitle: "Triage agent" },
  { slug: "support-agent-standard", name: "Support Agent Standard", description: "Agent resolves tickets deterministically and safely. Intent classification, retrieval with citations, handoff rules.", skillSlug: "support-agent", skillTitle: "Support agent" },
  { slug: "sales-sdr-agent", name: "Sales SDR Agent Standard", description: "Agent qualifies leads and books calls with strict compliance. Qualification rubric, CRM note format, next-step generation.", skillSlug: "sdr-agent", skillTitle: "SDR agent" },
  { slug: "content-ops-agent", name: "Content Ops Agent", description: "Agent produces publish-ready content that passes QA. Brief extraction, outline rubric, fact-check, metadata, QA checklist.", skillSlug: "content-ops", skillTitle: "Content ops" },
  { slug: "x-twitter-operator", name: "X/Twitter Operator Agent", description: "Agent operates X without getting you banned or cringe. Reply policy, escalation, thread summarizer, brand voice.", skillSlug: "twitter-operator", skillTitle: "Twitter operator" },
  { slug: "data-extraction-agent", name: "Data Extraction Agent", description: "Agent extracts reliably and outputs schema-valid JSON. Table normalization, JSON Schema, uncertainty tags, audit trail.", skillSlug: "data-extraction", skillTitle: "Data extraction" },
  { slug: "agent-observability-runbooks", name: "Agent Observability + Runbooks", description: "Agent incidents are measurable, diagnosable, and fixable. Logging schema, failure taxonomy, runbooks, postmortem.", skillSlug: "observability-runbooks", skillTitle: "Observability & runbooks" },
];

function main() {
  if (!existsSync(TEMPLATE)) {
    console.error("Template not found:", TEMPLATE);
    process.exit(1);
  }
  mkdirSync(PACKS_DIR, { recursive: true });

  const packJson = JSON.parse(readFileSync(join(TEMPLATE, "pack.json"), "utf-8"));
  const rubricJson = readFileSync(join(TEMPLATE, "rubric", "rubric.json"), "utf-8");
  const hardFailsJson = readFileSync(join(TEMPLATE, "rubric", "hard_fails.json"), "utf-8");
  let skillMd = readFileSync(join(TEMPLATE, "skills", "my-skill", "SKILL.md"), "utf-8");
  let readme = readFileSync(join(TEMPLATE, "docs", "README.md"), "utf-8");
  let syllabus = readFileSync(join(TEMPLATE, "docs", "SYLLABUS.md"), "utf-8");

  for (const c of COURSES) {
    const packPath = join(PACKS_DIR, c.slug);
    if (existsSync(packPath)) {
      console.log("Skip (exists):", c.slug);
      continue;
    }
    mkdirSync(join(packPath, "rubric"), { recursive: true });
    mkdirSync(join(packPath, "skills", c.skillSlug), { recursive: true });
    mkdirSync(join(packPath, "docs"), { recursive: true });

    const pj = { ...packJson, slug: c.slug, name: c.name, description: c.description, skills: [c.skillSlug] };
    writeFileSync(join(packPath, "pack.json"), JSON.stringify(pj, null, 2));
    writeFileSync(join(packPath, "rubric", "rubric.json"), rubricJson);
    writeFileSync(join(packPath, "rubric", "hard_fails.json"), hardFailsJson);

    const skillMdContent = skillMd
      .replace(/title: My Skill/, `title: ${c.skillTitle}`)
      .replace(/id: my-skill/, `id: ${c.skillSlug}`)
      .replace(/pack_slug: my-pack/, `pack_slug: ${c.slug}`)
      .replace(/## Objective\s*\n\s*Describe what the agent must accomplish\./, `## Objective\n\n${c.description}`);
    writeFileSync(join(packPath, "skills", c.skillSlug, "SKILL.md"), skillMdContent);

    writeFileSync(join(packPath, "docs", "README.md"), readme.replace(/My Pack/g, c.name).replace(/my-pack/g, c.slug));
    writeFileSync(join(packPath, "docs", "SYLLABUS.md"), syllabus.replace(/My Pack/g, c.name));
    console.log("Created:", c.slug);
  }
  console.log("Done. Run pnpm pack:validate packs/<slug> per pack.");
}

main();
