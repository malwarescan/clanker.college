import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

/** Minimal rubric for curriculum packs (has output_schema for /api/grade). */
const CURRICULUM_RUBRIC = {
  version: "1.0",
  max_score: 100,
  pass_score: 85,
  criteria: [
    { id: "criterion_1", name: "Criterion 1", weight: 50, scoring_method: "binary" },
    { id: "criterion_2", name: "Criterion 2", weight: 50, scoring_method: "binary" },
  ],
  output_schema: { type: "object", properties: { output_text: { type: "string" } }, required: ["output_text"] },
} as const;

const CURRICULUM_PACKS: { slug: string; title: string; summary: string; outcomes: string[] }[] = [
  { slug: "agent-evaluation-regression-harness", title: "Agent Evaluation + Regression Harness", summary: "Prove the agent still does the job after changes. Eval cases, rubric, batch grading, version diff, release gate.", outcomes: ["Build eval cases (NDJSON)", "Design rubric.json + hard_fails.json", "Run batch grading", "Diff results across versions", "Gate release on pass criteria"] },
  { slug: "prompt-injection-tool-safety", title: "Prompt Injection + Tool Safety Hardening", summary: "Agent refuses malicious instructions and unsafe actions.", outcomes: ["Detect injection patterns", "Safe browsing + retrieval rules", "File-system action constraints", "Allowlist/denylist tool usage"] },
  { slug: "claude-skills-authoring", title: "Claude Skills Authoring Standard (SKILL.md)", summary: "Write skills that auto-invoke correctly and stay deterministic.", outcomes: ["Frontmatter schema", "Trigger design", "Step structure for reliability", "Output schema discipline"] },
  { slug: "plugin-packaging-distribution", title: "Plugin Packaging + Team Distribution", summary: "Ship a plugin repo that installs cleanly across a team.", outcomes: ["plugin.json authoring", "Versioning strategy", "Install paths + validation", "Release checklist"] },
  { slug: "local-coworker-ops", title: "Local Coworker Ops", summary: "Agent operates on local files without wrecking things.", outcomes: ["Safe file operations (copy-first)", "Batch rename + organize", "Audit log writing", "Rollback plan as required output"] },
  { slug: "inbox-calendar-triage", title: "Inbox + Calendar Triage Agent", summary: "Agent triages, drafts, schedules with policy constraints.", outcomes: ["Priority classification rubric", "Draft response templates", "Calendar conflict resolution", "Escalation rules"] },
  { slug: "support-agent-standard", title: "Support Agent Standard", summary: "Agent resolves tickets deterministically and safely.", outcomes: ["Intent classification", "Knowledge retrieval (citations)", "Refund/exception guardrails", "Handoff rules"] },
  { slug: "sales-sdr-agent", title: "Sales SDR Agent Standard", summary: "Agent qualifies leads and books calls with strict compliance.", outcomes: ["Qualification rubric", "Disallowed claims hard-fails", "CRM note format", "Next step generation"] },
  { slug: "content-ops-agent", title: "Content Ops Agent", summary: "Agent produces publish-ready content that passes QA.", outcomes: ["Brief extraction", "Outline rubric", "Fact-check protocol", "QA checklist enforcement"] },
  { slug: "x-twitter-operator", title: "X/Twitter Operator Agent", summary: "Agent operates X without getting you banned or cringe.", outcomes: ["Reply policy + tone constraints", "Controversy escalation", "Thread summarizer", "Brand voice validator"] },
  { slug: "data-extraction-agent", title: "Data Extraction Agent", summary: "Agent extracts reliably and outputs schema-valid JSON.", outcomes: ["Extraction prompt discipline", "Table normalization", "JSON Schema validation", "Audit trail generation"] },
  { slug: "agent-observability-runbooks", title: "Agent Observability + Runbooks", summary: "Agent incidents are measurable, diagnosable, and fixable.", outcomes: ["Logging schema", "Failure taxonomy", "Runbook authoring", "Postmortem template"] },
];

async function main() {
  const rubricPath = join(__dirname, "seed-rubric.json");
  const rubricJson = JSON.parse(readFileSync(rubricPath, "utf-8"));

  const pack = await prisma.pack.upsert({
    where: { slug: "design-systems" },
    create: {
      slug: "design-systems",
      title: "Design System Architecture",
      schoolSlug: "school-of-design",
      summary: "Train an agent to produce a complete, dev-usable design system spec (tokens, components, states, IA rules) with strict discipline.",
    },
    update: {},
  });

  const version = await prisma.packVersion.upsert({
    where: {
      packId_version: { packId: pack.id, version: "1.0.0" },
    },
    create: {
      packId: pack.id,
      version: "1.0.0",
      lastUpdatedAt: new Date(),
      status: "CERTIFIED",
      certifiedAt: new Date(),
      outcomesJson: [
        "Produces a complete token table (color, type, spacing, radii, shadows, z-index, motion)",
        "Defines component contracts (props, variants, states) for buttons, inputs, cards, modals, alerts, tables",
        "Specifies accessibility rules (focus, labels, keyboard)",
        "Documents grid, breakpoints, and content widths",
        "Includes 2+ gold-standard examples mapped to the rubric",
      ],
      syllabusMd: `# Design System Architecture — Syllabus

## Scope
This Skill Pack trains an agent to produce a **design system specification** that is implementation-ready: tokens, component contracts, accessibility, layout, and IA rules.

## Prerequisites
- Familiarity with design tokens and component APIs.
- Ability to produce structured Markdown and tables.

## Deliverables
1. **Token table** — all categories (color, typography, spacing, radii, shadows, z-index, motion).
2. **Component matrix** — each core component with variants and states.
3. **Accessibility rules** — focus, contrast, labels, keyboard.
4. **Grid and breakpoints** — content widths, rails, mobile behavior.
5. **IA templates** — page hierarchy and content density rules.
6. **SemVer + changelog** — versioning and upgrade guidance.
7. **Gold-standard examples** — at least 2, mapped to rubric dimensions.
`,
      installMd: `# Install — Design System Architecture v1.0

## Manual (system prompt)
Copy the operational directive from this pack into your agent's system prompt or role directive.

## API
\`\`\`
GET /api/packs/design-systems/latest
\`\`\`
Returns the certified pack metadata and install payload.
`,
      rubricJson,
      isCertifiedDefault: true,
    },
    update: { rubricJson, lastUpdatedAt: new Date(), status: "CERTIFIED", certifiedAt: new Date() },
  });

  const labSlugs = ["token-table-01", "component-contracts-02", "accessibility-grid-03"];
  for (let i = 0; i < labSlugs.length; i++) {
    await prisma.lab.upsert({
      where: {
        packVersionId_labSlug: { packVersionId: version.id, labSlug: labSlugs[i]! },
      },
      create: {
        packVersionId: version.id,
        labSlug: labSlugs[i]!,
        title: `Lab ${i + 1}: ${labSlugs[i]!.replace(/-/g, " ")}`,
        promptMd: `Produce the required artifact for this lab. Submit your output as JSON to \`/api/grade\`.`,
        passThreshold: 85,
      },
      update: {},
    });
  }

  const examplesNdjson = [
    JSON.stringify({
      dimension: "token_discipline",
      artifact: "token_table",
      content: { spacing: "8pt scale", color: "semantic tokens", typography: "type scale defined" },
    }),
    JSON.stringify({
      dimension: "component_contracts",
      artifact: "button_contract",
      content: { props: ["variant", "size"], states: ["default", "hover", "focus", "disabled"] },
    }),
  ].join("\n");

  await prisma.example.upsert({
    where: { packVersionId: version.id },
    create: { packVersionId: version.id, examplesNdjson },
    update: { examplesNdjson },
  });

  for (const c of CURRICULUM_PACKS) {
    const p = await prisma.pack.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        title: c.title,
        schoolSlug: "school-of-agents",
        summary: c.summary,
      },
      update: {},
    });
    await prisma.packVersion.upsert({
      where: { packId_version: { packId: p.id, version: "1.0.0" } },
      create: {
        packId: p.id,
        version: "1.0.0",
        lastUpdatedAt: new Date(),
        status: "CERTIFIED",
        certifiedAt: new Date(),
        outcomesJson: c.outcomes,
        syllabusMd: `# ${c.title}\n\n## Overview\n${c.summary}\n\n## Outcomes\n\n${c.outcomes.map((o) => `- ${o}`).join("\n")}`,
        installMd: `# Install — ${c.title} v1.0\n\nDownload from the pack Install tab or \`GET /api/packs/${c.slug}/install\`.`,
        rubricJson: CURRICULUM_RUBRIC as unknown as object,
        isCertifiedDefault: true,
      },
      update: { rubricJson: CURRICULUM_RUBRIC as unknown as object, lastUpdatedAt: new Date(), status: "CERTIFIED", certifiedAt: new Date() },
    });
  }

  // Link packs to Stripe: edit packages/db/prisma/stripe-products.json (pack slug → stripeProductId, stripePriceId)
  const stripeProductsPath = join(__dirname, "stripe-products.json");
  if (existsSync(stripeProductsPath)) {
    const stripeProducts = JSON.parse(readFileSync(stripeProductsPath, "utf-8")) as Record<
      string,
      { stripeProductId?: string; stripePriceId?: string }
    >;
    for (const [slug, entry] of Object.entries(stripeProducts)) {
      if (!entry?.stripeProductId || !entry?.stripePriceId || slug.startsWith("_")) continue;
      if (entry.stripeProductId === "prod_REPLACE" || entry.stripePriceId === "price_REPLACE") continue;
      const pack = await prisma.pack.findUnique({ where: { slug } });
      if (!pack) continue;
      await prisma.product.upsert({
        where: { packId: pack.id },
        create: {
          stripeProductId: entry.stripeProductId,
          stripePriceId: entry.stripePriceId,
          packId: pack.id,
        },
        update: { stripeProductId: entry.stripeProductId, stripePriceId: entry.stripePriceId },
      });
      console.log(`Product linked: ${slug} → Stripe`);
    }
  }

  console.log("Seed complete: design-systems v1.0.0 + 12 curriculum packs");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
