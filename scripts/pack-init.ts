#!/usr/bin/env tsx
/**
 * Initialize a new pack from templates/pack-starter.
 * Usage: tsx scripts/pack-init.ts [target-dir]
 * Default target: ./pack
 */

import { cpSync, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";

const REPO_ROOT = resolve(__dirname, "..");
const TEMPLATE = join(REPO_ROOT, "templates", "pack-starter");
const TARGET = resolve(process.cwd(), process.argv[2] ?? "pack");

function main() {
  if (!existsSync(TEMPLATE)) {
    console.error("Template not found:", TEMPLATE);
    process.exit(1);
  }
  if (existsSync(TARGET)) {
    console.error("Target already exists:", TARGET);
    process.exit(1);
  }
  mkdirSync(TARGET, { recursive: true });
  cpSync(TEMPLATE, TARGET, { recursive: true });
  console.log("Pack initialized at:", TARGET);
  console.log("Next: edit pack.json and skills, then run pnpm pack:validate && pnpm pack:build");
}

main();
