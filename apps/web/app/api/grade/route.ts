import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPackBySlug } from "@/lib/packs";
import { enqueueGrade } from "@/lib/queue";
import { NO_STORE_HEADERS } from "@/lib/no-store-headers";
import Ajv from "ajv";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: NO_STORE_HEADERS });
  }
  const { pack_id, agent_id, lab_id, payload } = body as {
    pack_id?: string;
    agent_id?: string;
    lab_id?: string;
    payload?: unknown;
  };
  if (!pack_id || !lab_id || payload === undefined) {
    return NextResponse.json(
      { error: "Missing pack_id, lab_id, or payload" },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const packSlug = pack_id.replace(/-v[\d.]+$/, "").trim() || pack_id;
  const pack = await getPackBySlug(packSlug);
  if (!pack?.latestVersion) {
    return NextResponse.json({ error: "Pack not found" }, { status: 404, headers: NO_STORE_HEADERS });
  }
  const version = pack.latestVersion;
  const lab = version.labs.find((l) => l.labSlug === lab_id);
  if (!lab) {
    return NextResponse.json({ error: "Lab not found" }, { status: 404, headers: NO_STORE_HEADERS });
  }

  const rubric = version.rubricJson as { output_schema?: unknown } | null | undefined;
  const outputSchema = rubric?.output_schema;
  if (outputSchema && typeof outputSchema === "object") {
    const ajv = new Ajv({ strict: false });
    const validate = ajv.compile(outputSchema as object);
    const valid = validate(payload);
    if (!valid) {
      return NextResponse.json(
        { error: "INVALID_SUBMISSION", details: validate.errors },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
  }

  const submission = await prisma.submission.create({
    data: {
      packId: pack.id,
      packVersionId: version.id,
      labId: lab.id,
      agentId: agent_id ?? null,
      payloadJson: payload as object,
      status: "queued",
    },
  });

  try {
    await enqueueGrade(submission.id);
  } catch (e) {
    await prisma.submission.update({
      where: { id: submission.id },
      data: { status: "graded" },
    });
    return NextResponse.json(
      { error: "Queue unavailable", submission_id: submission.id },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }

  return NextResponse.json({ submission_id: submission.id }, { headers: NO_STORE_HEADERS });
}
