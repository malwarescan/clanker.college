#!/usr/bin/env tsx
/**
 * Validate a clanker-pack directory against CLANKER_PACK_STANDARD_v1.
 * Usage: tsx scripts/pack-validate.ts [path-to-pack-dir]
 * Default: ./pack or current directory if pack.json present.
 */

import { existsSync, readFileSync, readdirSync } from "fs";
import { join, resolve } from "path";

const PACK_DIR = resolve(process.cwd(), process.argv[2] ?? "pack");

interface PackJson {
  slug?: string;
  name?: string;
  version?: string;
  description?: string;
  skills?: string[];
  pass_threshold?: number;
  zero_hard_fails?: boolean;
}

interface RubricJson {
  version?: string;
  criteria?: unknown[];
  max_score?: number;
  pass_score?: number;
  output_schema?: unknown;
}

interface HardFailsJson {
  rules?: unknown[];
}

const errors: string[] = [];

function requireFile(relPath: string, description?: string) {
  const full = join(PACK_DIR, relPath);
  if (!existsSync(full)) {
    errors.push(`Missing required file: ${relPath}${description ? ` (${description})` : ""}`);
    return null;
  }
  return full;
}

function requireDir(relPath: string) {
  const full = join(PACK_DIR, relPath);
  if (!existsSync(full) || !readdirSync(full, { withFileTypes: true }).some((d) => d.isDirectory() || d.isFile())) {
    errors.push(`Missing or empty required directory: ${relPath}`);
    return false;
  }
  return true;
}

function parseJson<T>(filePath: string): T | null {
  try {
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (e) {
    errors.push(`Invalid JSON: ${filePath} — ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}

function validatePackJson(obj: PackJson) {
  if (!obj.slug || typeof obj.slug !== "string") errors.push("pack.json: missing or invalid slug");
  if (!obj.name || typeof obj.name !== "string") errors.push("pack.json: missing or invalid name");
  if (!obj.version || typeof obj.version !== "string") errors.push("pack.json: missing or invalid version");
  if (!obj.description || typeof obj.description !== "string") errors.push("pack.json: missing or invalid description");
  if (!Array.isArray(obj.skills) || obj.skills.length === 0) errors.push("pack.json: skills must be a non-empty array of skill slugs");
  if (obj.pass_threshold != null && (typeof obj.pass_threshold !== "number" || obj.pass_threshold < 0 || obj.pass_threshold > 100)) {
    errors.push("pack.json: pass_threshold must be 0–100");
  }
}

function validateRubricJson(obj: RubricJson) {
  if (!obj.version || typeof obj.version !== "string") errors.push("rubric/rubric.json: missing or invalid version");
  if (!Array.isArray(obj.criteria) || obj.criteria.length === 0) errors.push("rubric/rubric.json: criteria must be a non-empty array");
  if (obj.max_score != null && (typeof obj.max_score !== "number" || obj.max_score <= 0)) errors.push("rubric/rubric.json: max_score must be a positive number");
  if (obj.pass_score != null && (typeof obj.pass_score !== "number" || obj.pass_score < 0)) errors.push("rubric/rubric.json: pass_score must be >= 0");
  if (!obj.output_schema || typeof obj.output_schema !== "object") errors.push("rubric/rubric.json: output_schema is required");
  // Optional: assert criteria weights sum to 100
  if (Array.isArray(obj.criteria)) {
    const sum = (obj.criteria as { weight?: number }[]).reduce((s, c) => s + (c.weight ?? 0), 0);
    if (obj.max_score != null && Math.abs(sum - obj.max_score) > 0.01) {
      errors.push(`rubric/rubric.json: criteria weights sum to ${sum}, expected max_score ${obj.max_score}`);
    }
  }
}

function validateHardFailsJson(obj: HardFailsJson) {
  if (!Array.isArray(obj.rules)) errors.push("rubric/hard_fails.json: rules must be an array");
}

function validateSkillMd(skillSlug: string) {
  const skillDir = join(PACK_DIR, "skills", skillSlug);
  const skillMd = join(skillDir, "SKILL.md");
  if (!existsSync(skillMd)) {
    errors.push(`skills/${skillSlug}/SKILL.md: required`);
    return;
  }
  const content = readFileSync(skillMd, "utf-8");
  const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    errors.push(`skills/${skillSlug}/SKILL.md: frontmatter (--- ... ---) required`);
    return;
  }
  const frontmatter = fmMatch[1];
  const requiredFm = ["title", "id", "pack_slug", "version", "inputs", "outputs", "success_criteria"];
  for (const key of requiredFm) {
    if (!new RegExp(`^${key}:`, "m").test(frontmatter)) errors.push(`skills/${skillSlug}/SKILL.md: frontmatter must include "${key}"`);
  }
  const requiredSections = ["Objective", "Preconditions", "Steps", "Validation", "Example"];
  for (const section of requiredSections) {
    if (!content.includes(section)) errors.push(`skills/${skillSlug}/SKILL.md: body must include section "${section}"`);
  }
}

function main() {
  if (!existsSync(PACK_DIR)) {
    console.error("Pack directory not found:", PACK_DIR);
    process.exit(1);
  }

  const packPath = requireFile("pack.json");
  if (!packPath) {
    console.error("No pack.json found. Run from repo root or pass path to pack directory.");
    process.exit(1);
  }

  const packJson = parseJson<PackJson>(packPath);
  if (packJson) validatePackJson(packJson);

  const rubricPath = requireFile("rubric/rubric.json");
  if (rubricPath) {
    const rubricJson = parseJson<RubricJson>(rubricPath);
    if (rubricJson) validateRubricJson(rubricJson);
  }

  const hardFailsPath = requireFile("rubric/hard_fails.json");
  if (hardFailsPath) {
    const hardFailsJson = parseJson<HardFailsJson>(hardFailsPath);
    if (hardFailsJson) validateHardFailsJson(hardFailsJson);
  }

  requireFile("docs/README.md", "install instructions");
  requireFile("docs/SYLLABUS.md", "syllabus for humans");

  if (packJson?.skills) {
    for (const slug of packJson.skills) {
      if (typeof slug !== "string") continue;
      validateSkillMd(slug);
    }
  }

  if (errors.length) {
    console.error("Validation failed:");
    errors.forEach((e) => console.error("  -", e));
    process.exit(1);
  }
  console.log("Pack validation OK:", PACK_DIR);
}

main();
