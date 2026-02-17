import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildCanonicalPayload, signPayload } from "@/lib/cert-sign";
import { NO_STORE_HEADERS } from "@/lib/no-store-headers";

function normalizeHardFails(
  raw: unknown
): { dimension_id: string; code: string; message: string }[] {
  if (Array.isArray(raw)) {
    return raw.map((x) => {
      if (typeof x === "object" && x !== null && "dimension_id" in x && "code" in x && "message" in x) {
        return x as { dimension_id: string; code: string; message: string };
      }
      return {
        dimension_id: "legacy",
        code: "HF",
        message: typeof x === "string" ? x : JSON.stringify(x),
      };
    });
  }
  return [];
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production" && !process.env.CERT_PRIVATE_KEY) {
    return NextResponse.json(
      { error: "Signing not configured." },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: NO_STORE_HEADERS });
  }
  const { submission_id } = body as { submission_id?: string };
  if (!submission_id) {
    return NextResponse.json({ error: "Missing submission_id" }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const submission = await prisma.submission.findUnique({
    where: { id: submission_id },
    include: { grade: true, pack: true, packVersion: true },
  });
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404, headers: NO_STORE_HEADERS });
  }
  if (!submission.grade || submission.grade.result !== "PASS") {
    return NextResponse.json(
      { error: "Submission did not pass; cannot certify" },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const existing = await prisma.certificate.findFirst({
    where: { submissionId: submission_id },
  });
  if (existing) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    return NextResponse.json(
      { cert_id: existing.id, verify_url: `${baseUrl}/verify/${existing.id}` },
      { headers: NO_STORE_HEADERS }
    );
  }

  const issuedAt = new Date();
  const scoreByDim = submission.grade.scoreByDimensionJson as Record<string, number>;
  const hardFails = normalizeHardFails(submission.grade.hardFailsJson);

  const cert = await prisma.certificate.create({
    data: {
      orgId: submission.orgId,
      agentId: submission.agentId,
      packId: submission.packId,
      packVersionId: submission.packVersionId,
      submissionId: submission.id,
      scoreTotal: submission.grade.scoreTotal,
      scoreByDimensionJson: submission.grade.scoreByDimensionJson as object,
      hardFailsJson: hardFails.length ? (hardFails as object) : undefined,
      issuedAt,
      signature: "",
      verifyHash: "",
    },
  });

  const payload = buildCanonicalPayload({
    cert_id: cert.id,
    org_id: submission.orgId,
    agent_id: submission.agentId,
    pack_id: submission.packId,
    pack_version_id: submission.packVersionId,
    issued_at: issuedAt.toISOString(),
    score_total: submission.grade.scoreTotal,
    score_by_dimension: scoreByDim ?? {},
    hard_fails: hardFails,
  });
  const { signature, verifyHash } = signPayload(payload);

  await prisma.certificate.update({
    where: { id: cert.id },
    data: { signature, verifyHash },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return NextResponse.json(
    { cert_id: cert.id, verify_url: `${baseUrl}/verify/${cert.id}` },
    { headers: NO_STORE_HEADERS }
  );
}
