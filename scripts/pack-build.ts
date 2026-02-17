#!/usr/bin/env tsx
/**
 * Build a clanker-pack into dist/<slug>-<version>.zip and optionally dist/<slug>-<version>-plugin.zip.
 * Validates first. Requires: pack.json, rubric/, skills/<slug>/SKILL.md, docs/.
 * Usage: tsx scripts/pack-build.ts [path-to-pack-dir]
 */

import { existsSync, mkdirSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { createWriteStream } from "fs";
import { spawnSync } from "child_process";

const PACK_DIR = resolve(process.cwd(), process.argv[2] ?? "pack");

interface PackJson {
  slug: string;
  version: string;
  skills?: string[];
}

function runValidate() {
  const r = spawnSync("pnpm", ["exec", "tsx", "scripts/pack-validate.ts", PACK_DIR], {
    stdio: "inherit",
    cwd: resolve(PACK_DIR, "../.."),
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function main() {
  if (!existsSync(PACK_DIR)) {
    console.error("Pack directory not found:", PACK_DIR);
    process.exit(1);
  }
  const packPath = join(PACK_DIR, "pack.json");
  if (!existsSync(packPath)) {
    console.error("pack.json not found. Run from repo root or pass path to pack directory.");
    process.exit(1);
  }
  let pack: PackJson;
  try {
    pack = JSON.parse(readFileSync(packPath, "utf-8")) as PackJson;
  } catch {
    console.error("Invalid pack.json");
    process.exit(1);
  }
  const { slug, version } = pack;
  if (!slug || !version) {
    console.error("pack.json must have slug and version");
    process.exit(1);
  }

  runValidate();

  const distDir = join(PACK_DIR, "dist");
  mkdirSync(distDir, { recursive: true });
  const zipName = `${slug}-${version}.zip`;
  const zipPath = join(distDir, zipName);

  // Zip skills/ so that unzip into .claude/skills/ gives skills/<slug>/SKILL.md etc.
  const skillsDir = join(PACK_DIR, "skills");
  if (!existsSync(skillsDir)) {
    console.error("skills/ directory not found");
    process.exit(1);
  }
  const zipResult = spawnSync("zip", ["-r", zipPath, "."], {
    cwd: skillsDir,
    stdio: "inherit",
  });
  if (zipResult.status !== 0) {
    console.error("zip command failed. Install zip (e.g. brew install zip) or use a zip library.");
    process.exit(1);
  }
  console.log("Built:", zipPath);

  const pluginDir = join(PACK_DIR, "install", "plugin", ".claude-plugin");
  if (existsSync(pluginDir)) {
    const pluginZipName = `${slug}-${version}-plugin.zip`;
    const pluginZipPath = join(distDir, pluginZipName);
    const pluginZipResult = spawnSync("zip", ["-r", pluginZipPath, ".claude-plugin"], {
      cwd: join(PACK_DIR, "install", "plugin"),
      stdio: "inherit",
    });
    if (pluginZipResult.status === 0) console.log("Built:", pluginZipPath);
  }
}

main();
