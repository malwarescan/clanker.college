#!/usr/bin/env tsx
/**
 * Sync stripe-products.json from a Stripe products CSV export.
 * CSV must have columns: id, Name (Stripe product id and name).
 * Fetches the first active price for each product via Stripe API.
 *
 * Usage: tsx scripts/sync-stripe-products.ts [path/to/products.csv]
 * (Loads .env.local from repo root for STRIPE_SECRET_KEY.)
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DEFAULT_CSV = join(REPO_ROOT, "products.csv");

// Load .env.local and .env from repo root (STRIPE_SECRET_KEY)
for (const f of [".env.local", ".env"]) {
  try {
    const content = readFileSync(join(REPO_ROOT, f), "utf-8");
    for (const line of content.split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch {
    // ignore missing file
  }
}
const OUT_PATH = join(REPO_ROOT, "packages", "db", "prisma", "stripe-products.json");

const NAME_TO_SLUG: Record<string, string> = {
  "Agent Evaluation + Regression Harness": "agent-evaluation-regression-harness",
  "Prompt Injection + Tool Safety Hardening": "prompt-injection-tool-safety",
  "Claude Skills Authoring Standard (SKILL.md)": "claude-skills-authoring",
  "Plugin Packaging + Team Distribution": "plugin-packaging-distribution",
  "Local Coworker Ops": "local-coworker-ops",
  "Inbox + Calendar Triage Agent": "inbox-calendar-triage",
  "Support Agent Standard": "support-agent-standard",
  "Sales SDR Agent Standard": "sales-sdr-agent",
  "Content Ops Agent": "content-ops-agent",
  "X/Twitter Operator Agent": "x-twitter-operator",
  "Data Extraction Agent": "data-extraction-agent",
  "Agent Observability + Runbooks": "agent-observability-runbooks",
  "Design System Architecture Subscription": "design-systems",
};

function parseCsv(path: string): { id: string; Name: string }[] {
  const raw = readFileSync(path, "utf-8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const rows: { id: string; Name: string }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!;
    const parts = line.split(",").map((p) => p.replace(/^["']|["']$/g, "").trim());
    const id = parts[0];
    const name = parts[1];
    if (id?.startsWith("prod_") && name) rows.push({ id, Name: name });
  }
  return rows;
}

async function main() {
  const csvPath = process.argv[2] ?? DEFAULT_CSV;
  if (!existsSync(csvPath)) {
    console.error("CSV file not found:", csvPath);
    console.error("Usage: pnpm exec tsx scripts/sync-stripe-products.ts <path-to-products.csv>");
    console.error("Example: pnpm exec tsx scripts/sync-stripe-products.ts ~/Downloads/products.csv");
    process.exit(1);
  }
  const Stripe = (await import("stripe")).default;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.error("Set STRIPE_SECRET_KEY in env (e.g. dotenv -e .env.local)");
    process.exit(1);
  }
  const stripe = new Stripe(key);

  const rows = parseCsv(csvPath);
  const out: Record<string, { stripeProductId: string; stripePriceId: string }> = {};

  for (const row of rows) {
    const slug = NAME_TO_SLUG[row.Name];
    if (!slug) {
      console.warn("Unknown product name, skipping:", row.Name);
      continue;
    }
    let priceId: string | null = null;
    try {
      const prices = await stripe.prices.list({ product: row.id, active: true, limit: 1 });
      priceId = prices.data[0]?.id ?? null;
    } catch (e) {
      console.warn("Stripe prices.list failed for", row.id, (e as Error).message);
    }
    if (!priceId) priceId = "price_REPLACE";
    out[slug] = { stripeProductId: row.id, stripePriceId: priceId };
    console.log(slug, "→", row.id, priceId);
  }

  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log("Wrote", OUT_PATH);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
