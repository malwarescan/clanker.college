import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { NO_STORE_HEADERS } from "@/lib/no-store-headers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const { submissionId } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { grade: true },
  });
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE_HEADERS });
  }
  if (submission.status === "failed") {
    return NextResponse.json(
      {
        submission_id: submission.id,
        status: "failed",
        message: "Grading failed after retries",
      },
      { headers: NO_STORE_HEADERS }
    );
  }
  if (submission.status !== "graded" || !submission.grade) {
    return NextResponse.json(
      {
        submission_id: submission.id,
        status: submission.status,
        message: submission.status === "queued" ? "Grading in progress" : "No grade yet",
      },
      { headers: NO_STORE_HEADERS }
    );
  }
  const g = submission.grade;
  const hardFails = g.hardFailsJson as { dimension_id: string; code: string; message: string }[] | unknown;
  const normalizedHardFails = Array.isArray(hardFails)
    ? hardFails.every(
        (x) =>
          typeof x === "object" &&
          x !== null &&
          "dimension_id" in x &&
          "code" in x &&
          "message" in x
      )
      ? (hardFails as { dimension_id: string; code: string; message: string }[])
      : (hardFails as string[]).map((m) => ({
          dimension_id: "legacy",
          code: "HF",
          message: String(m),
        }))
    : [];
  return NextResponse.json(
    {
      submission_id: submission.id,
      status: "graded",
      result: g.result,
      score_total: g.scoreTotal,
      score_by_dimension: g.scoreByDimensionJson as Record<string, number>,
      dimension_reasons: (g.dimensionReasonsJson as { dimension_id: string; score: number; reasons: string[]; required_fix: string[] }[]) ?? [],
      hard_fails: normalizedHardFails,
      changelog_delta: g.changelogDeltaJson as { dimension: string; required_fix: string }[],
    },
    { headers: NO_STORE_HEADERS }
  );
}
