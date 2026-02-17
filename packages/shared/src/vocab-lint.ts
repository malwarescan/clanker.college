#!/usr/bin/env node
/**
 * CI: Block forbidden consumer-education vocabulary in web app content and UI strings.
 * Exit 1 if any phrase found. See DRIFT_DETECTOR.md.
 */
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { hasForbiddenVocabulary } from "./forbidden-vocabulary.js";

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".mdx", ".json"]);
const IGNORE_DIRS = new Set(["node_modules", ".next", "dist", "coverage", ".git"]);

function* walk(dir: string, root: string): Generator<{ path: string; content: string }> {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (!IGNORE_DIRS.has(e.name)) yield* walk(full, root);
    } else {
      const ext = "." + (e.name.includes(".") ? e.name.split(".").pop()! : "");
      if (!EXTENSIONS.has(ext)) continue;
      try {
        const content = readFileSync(full, "utf-8");
        yield { path: full.replace(root + "/", ""), content };
      } catch {
        // skip binary or unreadable
      }
    }
  }
}

// When run from repo root or packages/shared, find apps/web
function findRepoRoot(): string {
  let cwd = process.cwd();
  for (let i = 0; i < 5; i++) {
    if (readdirSync(cwd).includes("pnpm-workspace.yaml")) return cwd;
    cwd = join(cwd, "..");
  }
  return process.cwd();
}
const root = findRepoRoot();
const appsWeb = join(root, "apps/web");
let failed = false;

for (const { path, content } of walk(appsWeb, root)) {
  const hit = hasForbiddenVocabulary(content);
  if (hit) {
    console.error(`[vocab drift] "${hit.phrase}" in ${path}`);
    failed = true;
  }
}

if (failed) {
  console.error("\nForbidden vocabulary detected. Use Skill Pack language. See docs/DRIFT_DETECTOR.md");
  process.exit(1);
}
console.log("Vocab lint OK");
