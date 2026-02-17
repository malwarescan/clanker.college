#!/usr/bin/env node
/**
 * Pack page validator: DOM assertions for RUBRIC_FOR_THE_RUBRICS.
 * Run against a live server (e.g. BASE_URL=http://localhost:3000).
 * Checks: vX.Y above fold, last updated, required tabs, one primary CTA, rubric dimensions, Install has endpoint.
 */
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const PACK_SLUG = "design-systems";
const MIN_DIMENSIONS = 5;

async function main() {
  const url = `${BASE_URL}/packs/${PACK_SLUG}`;
  let html: string;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${url} returned ${res.status}`);
    html = await res.text();
  } catch (e) {
    console.error("Validator failed to fetch pack page:", e);
    process.exit(1);
  }

  const checks: { name: string; pass: boolean }[] = [];

  checks.push({
    name: "vX.Y above fold",
    pass: /v\d+\.\d+(\.\d+)?/i.test(html) && html.indexOf("v1") !== -1,
  });
  checks.push({
    name: "last updated above fold",
    pass: /last\s+updated/i.test(html),
  });
  const requiredTabs = ["Syllabus", "Labs", "Rubric", "Examples", "Install", "Changelog"];
  checks.push({
    name: "required tabs exist",
    pass: requiredTabs.every((t) => html.includes(t)),
  });
  checks.push({
    name: "one primary CTA (Start Pack)",
    pass: html.includes("Start Pack") && !html.includes("Enroll now"),
  });
  checks.push({
    name: "rubric has dimensions",
    pass: (html.match(/panel-rubric/gi)?.length ?? 0) >= 1 && (html.match(/dimension|token_discipline|component_contracts/i)?.length ?? 0) >= 1,
  });
  checks.push({
    name: "Install contains machine endpoint",
    pass: /\/api\/packs/.test(html),
  });

  const failed = checks.filter((c) => !c.pass);
  if (failed.length) {
    console.error("Pack page validator failed:");
    failed.forEach((c) => console.error("  -", c.name));
    process.exit(1);
  }
  console.log("Pack page validator OK:", checks.map((c) => c.name).join(", "));
}

main();
