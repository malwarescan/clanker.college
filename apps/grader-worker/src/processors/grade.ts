import { PrismaClient } from "@clanker/db";
import type { RubricJson } from "@clanker/shared";

const prisma = new PrismaClient();

export type HardFailEntry = { dimension_id: string; code: string; message: string };
export type DimensionReasonEntry = {
  dimension_id: string;
  score: number;
  reasons: string[];
  required_fix: string[];
};

export async function gradeSubmission(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { packVersion: true, lab: true },
  });
  if (!submission || submission.status !== "queued") return;

  const rubric = submission.packVersion.rubricJson as RubricJson | null;
  const passScore = rubric?.pass_score ?? 85;
  const dimensions = rubric?.dimensions ?? [];

  const payload = submission.payloadJson as Record<string, unknown>;
  const outputText = (payload?.output_text as string) ?? "";
  const outputJson = payload?.output_json as Record<string, unknown> | undefined;

  const scoreByDimension: Record<string, number> = {};
  const hardFails: HardFailEntry[] = [];
  const changelogDelta: { dimension: string; required_fix: string }[] = [];
  const dimensionReasons: DimensionReasonEntry[] = [];

  for (const dim of dimensions) {
    const { points, hard_fails } = dim;
    let score = 0;
    const reasons: string[] = [];
    const requiredFix: string[] = [];
    const text = (outputText + " " + JSON.stringify(outputJson ?? {})).toLowerCase();

    switch (dim.id) {
      case "token_discipline":
        if (!text.includes("spacing") && !text.includes("token")) {
          hardFails.push({
            dimension_id: dim.id,
            code: "NO_SPACING_SCALE",
            message: hard_fails[0] ?? "No spacing scale",
          });
          requiredFix.push("Define a spacing scale (e.g. 8pt).");
          changelogDelta.push({ dimension: dim.id, required_fix: "Define a spacing scale (e.g. 8pt)." });
        } else {
          score = text.includes("8pt") || text.includes("8 pt") ? 18 : 12;
          reasons.push(score >= 18 ? "Spacing scale present" : "Partial token coverage");
        }
        break;
      case "component_contracts":
        if (!text.includes("button") && !text.includes("input")) {
          hardFails.push({
            dimension_id: dim.id,
            code: "MISSING_BUTTON_INPUT",
            message: "Missing button and input contracts",
          });
          requiredFix.push("Define button and input contracts with states.");
          changelogDelta.push({ dimension: dim.id, required_fix: "Define button and input contracts with states." });
        } else {
          score = text.includes("hover") && text.includes("focus") ? 18 : 12;
          reasons.push(score >= 18 ? "Contracts with states" : "Partial contracts");
        }
        break;
      case "accessibility_semantics":
        if (!text.includes("focus")) {
          hardFails.push({
            dimension_id: dim.id,
            code: "NO_FOCUS_STATES",
            message: "No visible focus state requirements",
          });
          requiredFix.push("Specify visible focus states.");
          changelogDelta.push({ dimension: dim.id, required_fix: "Specify visible focus states." });
        } else {
          score = 14;
          reasons.push("Focus and semantics present");
        }
        break;
      case "layout_grid":
        if (!text.includes("mobile") && !text.includes("breakpoint")) {
          hardFails.push({
            dimension_id: dim.id,
            code: "NO_MOBILE_BEHAVIOR",
            message: "No mobile behavior defined",
          });
          requiredFix.push("Define mobile breakpoints and behavior.");
          changelogDelta.push({ dimension: dim.id, required_fix: "Define mobile breakpoints and behavior." });
        } else {
          score = 13;
          reasons.push("Grid and breakpoints present");
        }
        break;
      case "information_architecture":
        score = text.includes("marketing") ? 4 : 9;
        if (text.includes("marketing") && dim.hard_fails?.length) {
          hardFails.push({
            dimension_id: dim.id,
            code: "MARKETING_IN_PACK",
            message: dim.hard_fails[0]!,
          });
          requiredFix.push("Remove marketing blocks from pack/docs.");
        }
        reasons.push(score >= 8 ? "IA rules complete" : "Partial or marketing present");
        break;
      case "versioning_changelog":
        score = text.includes("changelog") || text.includes("semver") ? 9 : 5;
        if (!text.includes("changelog") && dim.hard_fails?.length) {
          hardFails.push({
            dimension_id: dim.id,
            code: "NO_CHANGELOG_REQUIREMENT",
            message: dim.hard_fails[0]!,
          });
          requiredFix.push("Add changelog requirement for pack changes.");
          changelogDelta.push({ dimension: dim.id, required_fix: "Add changelog requirement for pack changes." });
        }
        reasons.push(score >= 8 ? "Versioning defined" : "Changelog missing or vague");
        break;
      case "example_traceability":
        score = outputText.length > 200 ? 9 : 4;
        reasons.push(score >= 8 ? "Examples present and mapped" : "Examples missing or short");
        break;
      default:
        score = Math.floor(points * 0.8);
        reasons.push("Default rule-based score");
    }
    const finalScore = Math.min(points, Math.max(0, score));
    scoreByDimension[dim.id] = finalScore;
    dimensionReasons.push({
      dimension_id: dim.id,
      score: finalScore,
      reasons,
      required_fix: requiredFix,
    });
  }

  const scoreTotal = Object.values(scoreByDimension).reduce((a, b) => a + b, 0);
  const hasHardFail = hardFails.length > 0;
  const result =
    scoreTotal >= passScore && !hasHardFail
      ? "PASS"
      : scoreTotal >= 70
        ? "PROVISIONAL"
        : "FAIL";

  await prisma.grade.create({
    data: {
      submissionId: submission.id,
      result,
      scoreTotal,
      scoreByDimensionJson: scoreByDimension,
      dimensionReasonsJson: dimensionReasons,
      hardFailsJson: hardFails,
      changelogDeltaJson: changelogDelta,
    },
  });
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: "graded" },
  });
}
